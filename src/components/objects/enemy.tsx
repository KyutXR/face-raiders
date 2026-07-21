import { RigidBody, type CollisionPayload, type RapierRigidBody } from "@react-three/rapier";
import { useState, useRef, useEffect, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Clone, useGLTF, useAnimations } from "@react-three/drei";
import { SpawnWave } from "./SpawnWave";

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
 * 敵キャラクターのアニメーションを再生・制御するカスタムフック（別定義の関数）
 * @param animations GLTFモデルに含まれるアニメーションクリップの配列
 * @param groupRef アニメーションをバインドするグループコンポーネントのRef
 * @param isDefeated 撃破されているかどうかのフラグ
 * @param movement 動作アニメーションの指定配列 (例: ["tate", "nori"])
 * @param isRushing 突進中かどうかのフラグ
 */
// アニメーション間のクールタイム（ミリ秒）。傾き(nori)等の姿勢が次の再生に混ざるのを防ぐ緩衝時間
const ANIMATION_COOLDOWN_MS = 400;

export const useEnemyAnimation = (
    animations: any[],
    groupRef: React.RefObject<any>,
    isDefeated: boolean,
    movement: string[],
    isRushing: boolean
) => {
    const { actions, names, mixer } = useAnimations(animations, groupRef);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isCoolingDown, setIsCoolingDown] = useState(false);

    // ★ movement配列の各要素と「完全一致」するNLAトラック(クリップ名)だけを、配列の順番通りに抽出する。
    //    部分一致(includes)をやめることで、nori等の別アニメーションが誤発動するのを防ぐ。
    const sequence = useMemo<string[]>(() => {
        if (!movement || movement.length === 0 || names.length === 0) return [];

        const resolved: string[] = [];
        movement.forEach((tag) => {
            const target = (tag || "").toLowerCase().trim();
            if (!target || target === "rush") return; // rushは移動用タグなのでアニメ抽出対象外
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

    // シーケンスの中身が変わったら先頭から再生し直す
    const sequenceKey = sequence.join("|");
    useEffect(() => {
        setCurrentIndex(0);
        setIsCoolingDown(false);
    }, [sequenceKey]);

    // 現在の順番で再生すべきアニメーション名（クールタイム中・突進中・撃破時はnull）
    const activeName =
        !isDefeated && !isRushing && !isCoolingDown && sequence.length > 0
            ? sequence[currentIndex % sequence.length]
            : null;

    // アニメーション完了(finished)を監視し、クールタイムを挟んで次の要素へ進める
    useEffect(() => {
        if (!mixer || sequence.length === 0) return;

        let timer: number | null = null;

        const handleFinished = (e: any) => {
            // ★ 今まさに再生中のクリップが終わったときだけ次へ進める（他アニメの終了では進めない）
            const finishedName: string | undefined = e?.action?.getClip?.()?.name;
            const expected = sequence[currentIndex % sequence.length];
            if (!finishedName || finishedName !== expected) return;

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
    }, [mixer, sequenceKey, currentIndex]);

    // 実際のアクション適用：現在の順番のアニメだけを再生し、それ以外は必ず停止して姿勢の混入を防ぐ
    useEffect(() => {
        if (names.length === 0 || !actions) return;

        names.forEach((name) => {
            const action = actions[name];
            if (!action) return;

            const isPropeller = name.toLowerCase().includes("propeller");

            if (isPropeller && !isDefeated) {
                // プロペラ等の常時ループアニメは動作シーケンスとは独立して回し続ける
                action.setLoop(THREE.LoopRepeat, Infinity);
                action.clampWhenFinished = false;
                if (!action.isRunning()) {
                    action.reset().fadeIn(0.2).play();
                }
            } else if (name === activeName) {
                action.setLoop(THREE.LoopOnce, 1);
                action.clampWhenFinished = false; // 終了時に姿勢を保持せずレストポーズへ戻す
                if (!action.isRunning()) {
                    action.reset().fadeIn(0.2).play();
                }
            } else {
                // 対象外・順番待ち・クールタイム中・撃破時はストップしてボーン変形(傾き等)をクリア
                action.stop();
            }
        });
    }, [actions, names, sequenceKey, currentIndex, isDefeated, isRushing, isCoolingDown, activeName]);

    // アンマウント時（またはアクション差し替え時）に全アニメを停止
    useEffect(() => {
        return () => {
            if (!actions) return;
            Object.values(actions).forEach((action: any) => action?.stop());
        };
    }, [actions]);

    return { actions, names, currentIndex };
};

export const Enemy = ({ info, onDefeat }: { info: EnemyInfo; onDefeat?: (enemy: EnemyInfo) => void })=>{

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

    const isBoss = info.type === 'boss';
    const selectedGltf = isBoss ? bossGltf : normalGltf;
    const scaleFactor = isBoss ? 2.5 : 1.0;

    // ★ アニメーションデータが敵インスタンス間で共有されて右斜め等の姿勢干渉・汚染が起きるのを防ぐため、個別にクローンして独立させます
    const clonedAnimations = useMemo(() => {
        return selectedGltf.animations.map((clip) => clip.clone());
    }, [selectedGltf.animations]);

    useEnemyAnimation(clonedAnimations, groupRef, isdefeated, info.Movement, isRushing);

    // 毎フレームのループ処理（カメラ追従、突進移動、カメラ衝突判定）
    useFrame(({ camera }) => {
        if (isdefeated) return;

        if (rigidBodyRef.current) {
            try {
                // 1. 敵の現在位置とカメラの位置を取得
                const translation = rigidBodyRef.current.translation();
                const enemyPos = new THREE.Vector3(translation.x, translation.y, translation.z);
                const camPos = camera.position;

                // 2. カメラとの衝突判定 (距離が0.5以内になったら衝突)
                const distance = enemyPos.distanceTo(camPos);
                if (distance <= 0.5) {
                    setTimeout(() => {
                        setIsDefeated(true);
                        onDefeat?.(info);
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
            } catch (e) {
                console.error("Error during enemy physics/collision updates:", e);
            }
        }

        // 4. ★ ユーザー指示に基づき、元の完全な lookAt(camera.position) に復元
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
            </group>
        </RigidBody>
    );
}