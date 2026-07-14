import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { type Mesh, Vector3 } from 'three';

export interface Bulletinfo {
    current_position: Vector3;
    direction: Vector3;
    Lifetime: number;
}

export const Bullet = ({ current_position, direction, Lifetime }: Bulletinfo) => {
  const meshRef = useRef<Mesh>(null);
  const [active, setActive] = useState(true);
  const lifetimeRef = useRef(Lifetime);
  
  // 弾の飛行速度 (秒速 30 ユニット)
  const speed = 30;

  // 毎フレームのループ処理 (R3Fのフック)
  useFrame((_, delta) => {
    if (!active) return;

    if (meshRef.current) {
      // フレームレートに依存しない等速運動にするため addScaledVector を使用
      meshRef.current.position.addScaledVector(direction, delta * speed); 
    }
    
    lifetimeRef.current -= delta;
    if (lifetimeRef.current <= 0) {
      setActive(false); // 寿命が尽きたら非表示（アンマウント）にする
    }
  });

  if (!active) return null;

  return (   
    <mesh ref={meshRef} position={current_position}>
      {/* R3Fの正しいジオメトリ名 sphereGeometry に修正 (弾サイズは半径 0.2) */}
      <sphereGeometry args={[0.2, 16, 16]} />
      <meshStandardMaterial color='orange' />
    </mesh>
  );
}