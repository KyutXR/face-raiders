import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface SpawnWaveProps {
    position?: [number, number, number] | THREE.Vector3;
}

/**
 * 敵の出現時に表示されるドーナツ型（Torus）のシアン色の拡張波エフェクトコンポーネント。
 * 時間経過で拡大しながらフェードアウトし、完全に透明になると自己消滅します。
 */
export const SpawnWave = ({ position = [0, 0, 0] }: SpawnWaveProps) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.MeshBasicMaterial>(null);
    const [active, setActive] = useState(true);

    useFrame((_, delta) => {
        if (!active) return;

        // 1. 波を拡大する (1秒間にスケールが10増加)
        if (meshRef.current) {
            meshRef.current.scale.addScalar(delta * 10);
        }

        // 2. 透明度を下げていく (1秒間に不透明度が2減少、約0.5秒で完全消滅)
        if (materialRef.current) {
            materialRef.current.opacity -= delta * 2;
            
            // 完全に透明になったら自己消滅（アンマウント）
            if (materialRef.current.opacity <= 0) {
                setActive(false);
            }
        }
    });

    if (!active) return null;

    return (
        <mesh 
            ref={meshRef} 
            position={position}
            // 波を地面と平行にするために X 軸を 90 度回転
            rotation={[-Math.PI / 2, 0, 0]}
        >
            {/* ドーナツ型 (Torus): 半径1, チューブの太さ0.1, 放射状分割16, 管の分割32 */}
            <torusGeometry args={[1, 0.1, 16, 32]} />
            <meshBasicMaterial 
                ref={materialRef}
                color={0x00ffff} // 水色（シアン）
                transparent={true}
                opacity={1.0}
                blending={THREE.AdditiveBlending} // 加算合成で光らせる
                depthWrite={false} // 後ろにあるものが透けて見えるようにする
            />
        </mesh>
    );
};
