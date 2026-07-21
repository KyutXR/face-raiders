import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { RigidBody, type RapierRigidBody, type CollisionPayload } from '@react-three/rapier';
import { HitParticles } from './HitParticles';

export interface EnemyBulletInfo {
    id: string;
    startPosition: Vector3;
    direction: Vector3;
    speed?: number;
    lifetime?: number;
}

interface EnemyBulletProps {
    info: EnemyBulletInfo;
    onHitPlayer: () => void;
    onDestroy: (id: string) => void;
}

export const EnemyBullet = ({ info, onHitPlayer, onDestroy }: EnemyBulletProps) => {
    const rigidBodyRef = useRef<RapierRigidBody>(null);
    const [active, setActive] = useState(true);
    const [hitPos, setHitPos] = useState<Vector3 | null>(null);
    const [isHit, setIsHit] = useState(false);
    
    const lifetimeRef = useRef(info.lifetime ?? 6);
    const speed = info.speed ?? 12; // 敵弾の速さ (秒速 12 ユニット)

    useEffect(() => {
        if (rigidBodyRef.current) {
            rigidBodyRef.current.setLinvel(
                {
                    x: info.direction.x * speed,
                    y: info.direction.y * speed,
                    z: info.direction.z * speed,
                },
                true
            );
        }
    }, [info.direction, speed]);

    // 毎フレームの判定 (寿命管理、速度維持、およびカメラ距離判定)
    useFrame(({ camera }, delta) => {
        if (!active || isHit) return;

        lifetimeRef.current -= delta;
        if (lifetimeRef.current <= 0) {
            setActive(false);
            onDestroy(info.id);
            return;
        }

        if (rigidBodyRef.current) {
            try {
                // 弾の初速度が打ち消されないよう確実に維持
                rigidBodyRef.current.setLinvel(
                    {
                        x: info.direction.x * speed,
                        y: info.direction.y * speed,
                        z: info.direction.z * speed,
                    },
                    true
                );

                // カメラ（プレイヤー）との接触判定 (距離が1.2以内)
                const translation = rigidBodyRef.current.translation();
                const bulletPos = new Vector3(translation.x, translation.y, translation.z);
                const distance = bulletPos.distanceTo(camera.position);

                if (distance <= 1.2) {
                    setIsHit(true);
                    onHitPlayer();
                    setTimeout(() => {
                        setActive(false);
                        onDestroy(info.id);
                    }, 0);
                }
            } catch (e) {
                console.error("Error updating enemy bullet physics:", e);
            }
        }
    });

    // プレイヤーの弾 (bullet) や固定オブジェクトに当たった時の撃ち落とし（衝突）処理
    const handleCollision = (event: CollisionPayload) => {
        if (isHit) return;
        const otherName = event?.other?.rigidBodyObject?.name;

        // プレイヤーの弾で撃ち落とされた場合
        if (otherName === 'bullet') {
            setTimeout(() => {
                setIsHit(true);
                if (rigidBodyRef.current) {
                    try {
                        const translation = rigidBodyRef.current.translation();
                        setHitPos(new Vector3(translation.x, translation.y, translation.z));
                    } catch (e) {
                        console.error("Error on enemy bullet hit:", e);
                    }
                }
                // エフェクト表示の後に消去
                setTimeout(() => {
                    setActive(false);
                    onDestroy(info.id);
                }, 400);
            }, 0);
        }
    };

    if (!active) return null;

    return (
        <>
            <RigidBody
                ref={rigidBodyRef}
                name="enemyBullet"
                colliders="ball"
                restitution={0}
                gravityScale={0}
                lockRotations={true}
                ccd={true}
                onCollisionEnter={handleCollision}
                position={info.startPosition}
            >
                <mesh>
                    <sphereGeometry args={[0.25, 16, 16]} />
                    <meshStandardMaterial
                        color="#FF2D55"
                        emissive="#FF0055"
                        emissiveIntensity={0.8}
                        roughness={0.2}
                    />
                </mesh>
            </RigidBody>

            {/* 撃ち落とされた時の火花パーティクル */}
            {isHit && hitPos && <HitParticles position={hitPos} />}
        </>
    );
};
