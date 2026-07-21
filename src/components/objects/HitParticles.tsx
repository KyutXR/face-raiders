import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface HitParticlesProps {
    position: THREE.Vector3 | [number, number, number];
}

/**
 * 弾が当たった時の飛び散る火花パーティクルエフェクトコンポーネント。
 * 指定されたヒット位置から複数の点がランダムな方向に飛び散り、
 * 重力で少し落下しながら約0.5秒でフェードアウトして自己消滅します。
 */
export const HitParticles = ({ position }: HitParticlesProps) => {
    const pointsRef = useRef<THREE.Points>(null);
    const materialRef = useRef<THREE.PointsMaterial>(null);
    const [active, setActive] = useState(true);

    const particleCount = 20; // 飛び散る火花の数

    // 1. 各パーティクルの初期位置と速度ベクトルを1回だけ初期化
    const { initialPositions, velocities } = useMemo(() => {
        const posArray = new Float32Array(particleCount * 3); // X, Y, Z のセット
        const velArray: THREE.Vector3[] = [];
        
        const origin = position instanceof THREE.Vector3 
            ? position 
            : new THREE.Vector3(position[0], position[1], position[2]);

        for (let i = 0; i < particleCount; i++) {
            // 全ての点の初期位置をヒットした座標にセット
            posArray[i * 3] = origin.x;
            posArray[i * 3 + 1] = origin.y;
            posArray[i * 3 + 2] = origin.z;

            // ランダムな方向へ飛び散る速度ベクトルを生成 (-2.5 〜 2.5)
            const vx = (Math.random() - 0.5) * 5;
            const vy = (Math.random() - 0.5) * 5;
            const vz = (Math.random() - 0.5) * 5;
            velArray.push(new THREE.Vector3(vx, vy, vz));
        }

        return { initialPositions: posArray, velocities: velArray };
    }, [position]);

    // 2. 寿命の管理 (Refでデルタ時間を減算)
    const life = useRef(1.0);

    useFrame((_, delta) => {
        if (!active) return;

        // 寿命を減らす（1秒間に2減少＝約0.5秒で消滅）
        life.current -= delta * 2;

        if (life.current <= 0) {
            setActive(false);
            return;
        }

        // 各パーティクルの位置を更新
        if (pointsRef.current) {
            const geom = pointsRef.current.geometry;
            const posAttr = geom.attributes.position;
            const positions = posAttr.array as Float32Array;

            for (let j = 0; j < particleCount; j++) {
                const vel = velocities[j];

                // 重力のような下方向の力を加算
                vel.y -= delta * 5;

                // 速度を掛けて座標を移動
                positions[j * 3] += vel.x * delta;
                positions[j * 3 + 1] += vel.y * delta;
                positions[j * 3 + 2] += vel.z * delta;
            }

            // ⚠️ 座標データを書き換えたことをThree.jsに通知
            posAttr.needsUpdate = true;
        }

        // 寿命に合わせてフェードアウト
        if (materialRef.current) {
            materialRef.current.opacity = life.current;
        }
    });

    if (!active) return null;

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[initialPositions, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                ref={materialRef}
                color={0xffaa00} // オレンジ色
                size={0.2} // 粒の大きさ
                transparent={true}
                opacity={1.0}
                blending={THREE.AdditiveBlending} // 加算合成で光らせる
                depthWrite={false}
            />
        </points>
    );
};
