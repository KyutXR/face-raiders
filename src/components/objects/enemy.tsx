import { RigidBody, type CollisionPayload, type RapierRigidBody } from "@react-three/rapier";
import { useState, useRef, useEffect, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Clone, useGLTF, useAnimations } from "@react-three/drei";
import { SpawnWave } from "./SpawnWave";
import { faceDataStore } from "../../functions/faceDatastore";

export interface EnemyInfo{
    type:string
    position:THREE.Vector3
    Movement:string[] // stringの配列 (例: ["tate", "nori"])
    EmergeTime:number // 出現時間
    LeaveTime:number  // 消去時間
}

// 敵のモデルアセットを事前にプリロード（マウント時のガクつきを防止）
useGLTF.preload('/gld/enemy_a.glb');

/**
 * 敵キャラクターの正面に登録・切り抜かれた顔テクスチャを貼り付けて表示するコンポーネント
 * 敵の頭部ボーンおよびモデルの動きに対して lerp(線形補間) で追従し、
 * デモ動作として口をパクパク開閉させるアニメーション動作を実行します。
 */
// ターゲットノード（Cube / Head / Face / 最初のMesh）を安全に検索するヘルパー関数
const findTargetNode = (group: THREE.Object3D): THREE.Object3D | null => {
    let result: THREE.Object3D | null = null;
    group.traverse((child: THREE.Object3D) => {
        if (result) return;
        const lower = child.name.toLowerCase();
        if (lower.includes("cube") || lower.includes("head") || lower.includes("face") || lower.includes("body")) {
            result = child;
        }
    });
    if (!result) {
        group.traverse((child: THREE.Object3D) => {
            if (result) return;
            if ((child as THREE.Mesh).isMesh) {
                result = child;
            }
        });
    }
    return result;
};

export const EnemyFaceMesh = ({ scene, groupRef }: { scene?: THREE.Group; groupRef?: React.RefObject<THREE.Group | null> }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [faceTexture, setFaceTexture] = useState<THREE.Texture | null>(faceDataStore.croppedFaceTexture);

    // アタッチ済みの親ノードの参照を保持
    const attachedParentRef = useRef<THREE.Object3D | null>(null);

    // 毎フレームの更新 & 口パクパクデモアニメーション
    useFrame((state) => {
        if (faceDataStore.croppedFaceTexture && faceTexture !== faceDataStore.croppedFaceTexture) {
            setFaceTexture(faceDataStore.croppedFaceTexture);
        }

        if (!meshRef.current) return;

        // まだアニメーションノードにアタッチされていない場合、検索して親ノードの直下に子オブジェクトとして追加
        const targetGroup = groupRef?.current || scene;
        if (!attachedParentRef.current && targetGroup) {
            const targetNode = findTargetNode(targetGroup);

            // 見つかったノードの直接の子オブジェクトとして顔メッシュを追加
            if (targetNode && meshRef.current) {
                attachedParentRef.current = targetNode;
                targetNode.add(meshRef.current);
                // モデル（Cube等）の正面ローカル位置にセット
                meshRef.current.position.set(0, 0, 0.46);
                meshRef.current.rotation.set(0, 0, 0);
            }
        }

        // 口パクパク動作デモ（メッシュのローカルスケールを変更）
        const mouthMouthOpen = Math.abs(Math.sin(state.clock.elapsedTime * 8));
        meshRef.current.scale.y = 1.0 + mouthMouthOpen * 0.22;
        meshRef.current.scale.x = 1.0 - mouthMouthOpen * 0.05;
    });

    if (!faceTexture) return null;

    return (
        <mesh ref={meshRef} position={[0, 0.1, 0.46]} rotation={[0, 0, 0]}>
            {/* 切り抜かれた縦長顔テクスチャを貼り付ける平面メッシュ */}
            <planeGeometry args={[0.75, 1.0]} />
            <meshBasicMaterial 
                map={faceTexture} 
                transparent={true} 
                depthWrite={false}
                side={THREE.DoubleSide} 
            />
        </mesh>
    );
};

const ANIMATION_COOLDOWN_MS = 400;

export const useEnemyAnimation = (
    animations: any[],
    groupRef: React.RefObject<any>,
    isDefeated: boolean,
    movement: string[],
    isRushing: boolean,
    rigidBodyRef?: React.RefObject<RapierRigidBody | null>
) => {
    const { actions, names, mixer } = useAnimations(animations, groupRef);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isCoolingDown, setIsCoolingDown] = useState(false);
    const initialLocalPosRef = useRef<THREE.Vector3 | null>(null);

    // アニメーション適用前の初期ローカル位置（レストポーズ）をあらかじめキャプチャ
    useEffect(() => {
        if (groupRef.current && !initialLocalPosRef.current) {
            const targetNode = findTargetNode(groupRef.current);
            if (targetNode) {
                initialLocalPosRef.current = targetNode.position.clone();
            }
        }
    }, [groupRef.current]);

    const sequence = useMemo<string[]>(() => {
        if (!movement || movement.length === 0 || names.length === 0) return [];

        const resolved: string[] = [];
        movement.forEach((tag) => {
            const target = (tag || "").toLowerCase().trim();
            if (!target || target === "rush") return;
            const match = names.find((name) => name.toLowerCase().trim() === target);
            if (match) {
                resolved.push(match);
            } else {
                console.warn(
                    `[Enemy] movement "${tag}" に完全一致するNLAアニメーションが見つかりません。利用可能:`,
                    names
                );
            }
        });
        return resolved;
    }, [movement, names]);

    const sequenceKey = sequence.join("|");
    useEffect(() => {
        setCurrentIndex(0);
        setIsCoolingDown(false);
    }, [sequenceKey]);

    const activeName =
        !isDefeated && !isRushing && !isCoolingDown && sequence.length > 0
            ? sequence[currentIndex % sequence.length]
            : null;

    useEffect(() => {
        if (!mixer || sequence.length === 0) return;

        let timer: number | null = null;

        const handleFinished = (e: any) => {
            const finishedName: string | undefined = e?.action?.getClip?.()?.name;
            const expected = sequence[currentIndex % sequence.length];
            if (!finishedName || finishedName !== expected) return;

            // アニメーション終了直後の移動後座標をRigidBodyに反映し、元の位置に戻らず維持する処理
            if (groupRef.current && rigidBodyRef?.current) {
                try {
                    groupRef.current.updateMatrixWorld(true);
                    const targetNode = findTargetNode(groupRef.current) || groupRef.current;

                    const initialLocalPos = initialLocalPosRef.current || targetNode.position.clone();

                    // 1. アニメーション終了直後のターゲットノードのワールド座標
                    const currentWorldPos = new THREE.Vector3();
                    targetNode.getWorldPosition(currentWorldPos);

                    // 2. 初期ローカル位置（レストポーズ）におけるターゲットノードのワールド座標
                    const restWorldPos = groupRef.current.localToWorld(initialLocalPos.clone());

                    // 3. アニメーションによるワールド空間上の相対移動量（デルタ）
                    const deltaWorld = new THREE.Vector3().subVectors(currentWorldPos, restWorldPos);

                    // 4. RigidBodyの物理座標を移動量分だけ更新
                    const currentTranslation = rigidBodyRef.current.translation();
                    const newPos = new THREE.Vector3(
                        currentTranslation.x + deltaWorld.x,
                        currentTranslation.y + deltaWorld.y,
                        currentTranslation.z + deltaWorld.z
                    );
                    rigidBodyRef.current.setTranslation(newPos, true);

                    // 5. ターゲットノードのローカル位置を初期ローカル位置にリセット
                    targetNode.position.copy(initialLocalPos);
                    targetNode.updateMatrixWorld(true);
                } catch (err) {
                    console.error("[Enemy] Error applying post-animation position:", err);
                }
            }

            setIsCoolingDown(true);
            timer = window.setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % sequence.length);
                setIsCoolingDown(false);
            }, ANIMATION_COOLDOWN_MS);
        };

        mixer.addEventListener("finished", handleFinished);
        return () => {
            mixer.removeEventListener("finished", handleFinished);
            if (timer) clearTimeout(timer);
        };
    }, [mixer, sequenceKey, currentIndex, groupRef, rigidBodyRef]);

    useEffect(() => {
        if (names.length === 0 || !actions) return;

        // アニメーション開始前に初期位置を確実に記録
        if (groupRef.current && !initialLocalPosRef.current) {
            const targetNode = findTargetNode(groupRef.current);
            if (targetNode) {
                initialLocalPosRef.current = targetNode.position.clone();
            }
        }

        names.forEach((name) => {
            const action = actions[name];
            if (!action) return;

            const isPropeller = name.toLowerCase().includes("propeller");

            if (isPropeller && !isDefeated) {
                action.setLoop(THREE.LoopRepeat, Infinity);
                action.clampWhenFinished = false;
                if (!action.isRunning()) {
                    action.reset().fadeIn(0.2).play();
                }
            } else if (name === activeName) {
                action.setLoop(THREE.LoopOnce, 1);
                action.clampWhenFinished = true;
                if (!action.isRunning()) {
                    action.reset().fadeIn(0.2).play();
                }
            } else {
                action.stop();
            }
        });
    }, [actions, names, sequenceKey, currentIndex, isDefeated, isRushing, isCoolingDown, activeName, groupRef]);

    useEffect(() => {
        return () => {
            if (!actions) return;
            Object.values(actions).forEach((action: any) => action?.stop());
        };
    }, [actions]);

    return { actions, names, currentIndex };
};

interface EnemyProps {
    info: EnemyInfo;
    onDefeat?: (enemy: EnemyInfo) => void;
    onCollidePlayer?: (enemy: EnemyInfo) => void;
    onShootBullet?: (startPos: THREE.Vector3, direction: THREE.Vector3) => void;
}

export const Enemy = ({ info, onDefeat, onCollidePlayer, onShootBullet }: EnemyProps)=>{

    const [isdefeated,setIsDefeated] = useState(false);
    const groupRef = useRef<any>(null);
    const rigidBodyRef = useRef<RapierRigidBody>(null);

    // プリロードされたモデルデータを取得
    const normalGltf = useGLTF('/gld/enemy_a.glb');
    
    // boss の場合は将来的に別のモデルに切り替えられるように定義（現在はデモとして同じモデルを使用）
    const bossGltf = useGLTF('/gld/enemy_a.glb');

    // 突進中かどうかの判定 (Movement配列に "rush" が含まれている、かつ未撃破)
    const isRushing = info.Movement.includes("rush") && !isdefeated;
    const rushSpeed = 5; // 突進スピード（秒速5ユニット）

    // 弾発射タイマー
    const lastShootTime = useRef(0);
    const isBoss = info.type === 'boss';
    const shootInterval = isBoss ? 2.0 : 3.5; // ボスは2秒毎、通常敵は3.5秒毎に発射

    const handledefeate = (event: CollisionPayload)=>{
        if (event?.other?.rigidBodyObject?.name === 'bullet') {
            if (!isdefeated) {
                setTimeout(() => {
                    setIsDefeated(true);
                    onDefeat?.(info);
                }, 0);
            }
        }
    } 

    const selectedGltf = isBoss ? bossGltf : normalGltf;
    const scaleFactor = isBoss ? 2.5 : 1.0;

    const clonedAnimations = useMemo(() => {
        return selectedGltf.animations.map((clip) => clip.clone());
    }, [selectedGltf.animations]);

    useEnemyAnimation(clonedAnimations, groupRef, isdefeated, info.Movement, isRushing, rigidBodyRef);

    // 毎フレームのループ処理（カメラ追従、突進移動、カメラ衝突判定、弾発射）
    useFrame(({ camera, clock }) => {
        if (isdefeated) return;

        if (rigidBodyRef.current) {
            try {
                // 1. 敵の現在位置とカメラの位置を取得
                const translation = rigidBodyRef.current.translation();
                const enemyPos = new THREE.Vector3(translation.x, translation.y, translation.z);
                const camPos = camera.position;

                // 2. カメラとの衝突判定 (距離が0.8以内になったらプレイヤーに衝突して退場)
                const distance = enemyPos.distanceTo(camPos);
                if (distance <= 0.8) {
                    setTimeout(() => {
                        if (!isdefeated) {
                            setIsDefeated(true);
                            onCollidePlayer?.(info);
                        }
                    }, 0);
                    return;
                }

                // 3. 突進（rush）処理の実行
                if (isRushing) {
                    const direction = new THREE.Vector3().subVectors(camPos, enemyPos).normalize();
                    rigidBodyRef.current.setLinvel(
                        {
                            x: direction.x * rushSpeed,
                            y: direction.y * rushSpeed,
                            z: direction.z * rushSpeed,
                        },
                        true
                    );
                }

                // 4. 定期的な敵弾の発射処理
                if (onShootBullet) {
                    const currentTime = clock.getElapsedTime();
                    if (currentTime - lastShootTime.current >= shootInterval) {
                        lastShootTime.current = currentTime;
                        
                        // 敵の頭・顔の高さからカメラ（視界中心）へ向けて発射
                        const startBulletPos = enemyPos.clone().add(new THREE.Vector3(0, 0.2, 0.2));
                        const targetPos = camPos.clone();
                        const shootDir = new THREE.Vector3().subVectors(targetPos, startBulletPos).normalize();
                        
                        onShootBullet(startBulletPos, shootDir);
                    }
                }
            } catch (e) {
                console.error("Error during enemy physics/collision updates:", e);
            }
        }

        // 5. カメラの方向へ顔を向ける
        if (groupRef.current && camera) {
            try {
                groupRef.current.updateMatrixWorld(true);
                groupRef.current.lookAt(camera.position);
            } catch (e) {
                console.error("Error during enemy lookAt:", e);
            }
        }
    });

    return (
        <RigidBody
            ref={rigidBodyRef}
            colliders="ball"
            restitution={0.01}
            gravityScale={isdefeated ? 1 : 0}
            onCollisionEnter={handledefeate}
            position={[info.position.x, info.position.y, info.position.z]}
        >
            {/* 出現時エフェクト */}
            {!isdefeated && <SpawnWave />}

            {/* useAnimationsをバインドするためのグループ */}
            <group ref={groupRef}>
                <Clone 
                    object={selectedGltf.scene} 
                    scale={[scaleFactor, scaleFactor, scaleFactor]} 
                    rotation={[0, 0, 0]} 
                />
                {/* ★ 顔メッシュを頭部ボーン・モデルの動きに lerp 追従させ、口パクパクデモ動作を実行 */}
                <EnemyFaceMesh scene={selectedGltf.scene} groupRef={groupRef} />
            </group>
        </RigidBody>
    );
}