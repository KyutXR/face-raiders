import { useRef } from 'react';
import type { Mesh } from 'three';

export const Box = () => {
  const meshRef = useRef<Mesh>(null);

  return (   
         <mesh
      ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color='orange' />
    </mesh>
    
  );
    
}