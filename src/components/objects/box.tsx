import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';

export const Box = () => {
  const meshRef = useRef<Mesh>(null);

  // 毎フレームのループ処理 (R3Fのフック)
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta;//とりあえず回転
    }
  });

  return (   
         <mesh
      ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color='orange' />
    </mesh>
    
  );
    
}