import { RigidBody } from "@react-three/rapier";
import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export const WeakPoint = ({
  parentRef,
  offset = new THREE.Vector3(0, 0.6, 0),
  onHit,
}: {
  parentRef: any;
  offset?: THREE.Vector3;
  onHit?: (d: number) => void;
}) => {
  const bodyRef = useRef<any>(null);
  const [visible, setVisible] = useState(true);
  const firedRef = useRef(false);

  useFrame(() => {
    if (!parentRef?.current || !bodyRef.current || !visible) return;
    const worldPos = new THREE.Vector3();
    try {
      parentRef.current.getWorldPosition(worldPos);
      const target = worldPos.clone().add(offset);
      // setTranslation may not have strong typings here; use any
      try {
        bodyRef.current.setTranslation({ x: target.x, y: target.y, z: target.z }, true);
      } catch (e) {
        // ignore if method not available in environment
      }
    } catch (e) {
      // ignore
    }
  });

  const handleCollision = (e: any) => {
    if (firedRef.current) return;
    if (e?.other?.rigidBodyObject?.name === "bullet") {
      firedRef.current = true;
      onHit?.(1);
      setVisible(false);
    }
  };

  if (!visible) return null;

  return (
    <RigidBody ref={bodyRef} colliders="ball" type="fixed" onCollisionEnter={handleCollision} name="weakpoint">
      <mesh>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="red" emissive={[0.3, 0, 0]} />
      </mesh>
    </RigidBody>
  );
};
