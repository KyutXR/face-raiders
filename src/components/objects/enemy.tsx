import { RigidBody, type CollisionPayload } from "@react-three/rapier";
import { useState, useRef, useEffect } from "react";
import type { Vector3 } from "three";
import { useFrame } from "@react-three/fiber";
import { Clone, useGLTF, useAnimations } from "@react-three/drei";
import { SpawnWave } from "./SpawnWave";

export interface EnemyInfo{
    type:string
    position:Vector3
    Movement:string
}

// 敵のモデルアセットを事前にプリロード（マウント時のガクつきを防止）
useGLTF.preload('/src/gld/enemy_a.glb');

/**
 * 敵キャラクターのアニメーションを再生・制御するカスタムフック（別定義の関数）
 * @param animations GLTFモデルに含まれるアニメーションクリップの配列
 * @param groupRef アニメーションをバインドするグループコンポーネントのRef
 * @param isDefeated 撃破されているかどうかのフラグ
 */
export const useEnemyAnimation = (
    animations: any[],
    groupRef: React.RefObject<any>,
    isDefeated: boolean
) => {
    const { actions, names } = useAnimations(animations, groupRef);

    useEffect(() => {
        // モデルにアニメーションが含まれていない場合は何もしない
        if (names.length === 0 || !actions) return;

        // GLTF内のすべてのアニメーション（待機、移動、表情など）を並行して再生します
        names.forEach((name) => {
            const action = actions[name];
            if (action) {
                if (isDefeated) {
                    // 撃破時はアニメーションを滑らかにフェードアウト（0.3秒）して停止
                    action.fadeOut(0.3);
                } else {
                    // 生存時はアニメーションをリセットしてフェードイン再生
                    action.reset().fadeIn(0.3).play();
                }
            }
        });

        // アンマウント時にすべてのアニメーションをフェードアウトさせてクリーンアップ
        return () => {
            names.forEach((name) => {
                actions[name]?.fadeOut(0.3);
            });
        };
    }, [actions, names, isDefeated]);

    return { actions, names };
};

export const Enemy = ({ info, onDefeat }: { info: EnemyInfo; onDefeat?: () => void })=>{

    const [isdefeated,setIsDefeated] = useState(false);
    const groupRef = useRef<any>(null);

    // プリロードされたモデルデータを取得
    const normalGltf = useGLTF('/src/gld/enemy_a.glb');
    
    // boss の場合は将来的に別のモデルに切り替えられるように定義（現在はデモとして同じモデルを使用）
    const bossGltf = useGLTF('/src/gld/enemy_a.glb');

    const handledefeate = (event: CollisionPayload)=>{
        // event や other が undefined の場合を考慮してオプショナルチェイニングを適用
        if (event?.other?.rigidBodyObject?.name === 'bullet') {
            if (!isdefeated) {
                // 物理演算更新フェーズ中の状態更新エラーを回避するため遅延実行
                setTimeout(() => {
                    setIsDefeated(true);
                    onDefeat?.();
                }, 0);
            }
        }
    } 

    // type プロパティに基づいてロードするモデルおよびスケールを分岐
    const isBoss = info.type === 'boss';
    const selectedGltf = isBoss ? bossGltf : normalGltf;
    
    // ボスの場合はスケールを大きく（例：2.5倍）するデモ設定
    const scaleFactor = isBoss ? 2.5 : 1.0;

    // ★ 別定義のアニメーション再生フックを呼び出し
    useEnemyAnimation(selectedGltf.animations, groupRef, isdefeated);

    // ★ 毎フレームカメラの位置に顔を向ける処理（撃破される前のみ動作）
    useFrame(({ camera }) => {
        if (groupRef.current && !isdefeated && camera) {
            try {
                // 物理エンジン（RigidBody）の更新との同期ズレによる NaN クラッシュを防ぐため、ワールド行列を強制更新します
                groupRef.current.updateMatrixWorld(true);
                groupRef.current.lookAt(camera.position);
            } catch (e) {
                console.error("Error during enemy lookAt:", e);
            }
        }
    });

    return (
        <RigidBody
            colliders="ball"
            restitution={0.01}
            gravityScale={isdefeated ? 1 : 0}
            onCollisionEnter={handledefeate}
            position={[info.position.x, info.position.y, info.position.z]}
        >
            {/* 出現時エフェクト（生存中のみレンダリングし、約0.5秒で自動的に自己消滅） */}
            {!isdefeated && <SpawnWave />}

            {/* useAnimationsをバインドするためのグループ */}
            <group ref={groupRef}>
                {/* Clone コンポーネントを使用し、モデルの参照が共有されて描画がバグるのを防ぎます */}
                <Clone 
                    object={selectedGltf.scene} 
                    scale={[scaleFactor, scaleFactor, scaleFactor]} 
                    rotation={[0, 0, 0]} // ★ Z軸正の方向（顔）がデフォルトで正面を向いているため、回転補正は不要
                />
            </group>
        </RigidBody>
    );
}