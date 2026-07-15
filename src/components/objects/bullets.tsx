import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { RigidBody, type RapierRigidBody } from '@react-three/rapier';
import { ScorePopup } from './ScorePopup';

export interface Bulletinfo {
    current_position: Vector3;
    direction: Vector3;
    Lifetime: number;
}

export const Bullet = ({ current_position, direction, Lifetime }: Bulletinfo) => {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const [active, setActive] = useState(true);
  const [isIntersect, setIsIntersect] = useState(false);
  const [scorePos, setScorePos] = useState<Vector3 | null>(null);
  const lifetimeRef = useRef(Lifetime);
  
  // 弾の飛行速度 (秒速 30 ユニット)
  const speed = 30;

  useEffect(() => {
    // マウント時に、弾の進行方向へ初速度を設定する
    if (rigidBodyRef.current) {
      rigidBodyRef.current.setLinvel(
        {
          x: direction.x * speed,
          y: direction.y * speed,
          z: direction.z * speed,
        },
        true
      );
    }
  }, [direction]);

  // 毎フレームのループ処理 (寿命の管理のみ)
  useFrame((_, delta) => {
    lifetimeRef.current -= delta;
    if (lifetimeRef.current <= 0) {
      setActive(false); // 寿命が尽きたら非表示（アンマウント）にする
    }
  });

  const handleCollision = () => {
    if (!isIntersect) {
      setIsIntersect(true);
      if (rigidBodyRef.current) {
        // 衝突した位置を取得してスコアポップアップの発生位置とする
        const translation = rigidBodyRef.current.translation();
        setScorePos(new Vector3(translation.x, translation.y, translation.z));

        // 衝突した瞬間に速度を0にし、重力（gravityScale={1}）で真下に落とす
        rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      }
    }
  };

  if (!active) return null;

  return (   
    <>
      <RigidBody 
        ref={rigidBodyRef}
        colliders="ball" 
        restitution={0} 
        gravityScale={isIntersect ? 1 : 0}
        onCollisionEnter={handleCollision}
        position={current_position}
      >
        <mesh>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color='white' />
        </mesh>
      </RigidBody>
      
      {/* 衝突時にスコアポップアップをレンダリング */}
      {isIntersect && scorePos && <ScorePopup position={scorePos} />}
    </>
  );
}