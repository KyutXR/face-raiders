import type { Bulletinfo } from "../objects/bullets";
import { useState, forwardRef, useImperativeHandle } from "react";
import { useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import { Bullet } from "../objects/bullets";
import { playPlayerShootSound } from "../../utils/sound";

export interface BulletRendererRef {
    shoot: () => void;
}

export const BulletRenderer = forwardRef<BulletRendererRef>((_, ref) => {
    const [bullets, setBullets] = useState<Bulletinfo[]>([]);

    const camera = useThree((state) => state.camera);

    const shoot = () => {
        // 発射音を再生
        playPlayerShootSound();

        const direct = new Vector3();
        camera.getWorldDirection(direct);
        
        // カメラの位置と向きのベクトルをクローンして参照の共有を防ぐ
        const currentPos = camera.position.clone();
        const bulletDirection = direct.clone();

        const newBullet: Bulletinfo = {
            current_position: currentPos,
            direction: bulletDirection,
            Lifetime: 3
        };

        setBullets((prevBullets) => [...prevBullets, newBullet]);
    };

    useImperativeHandle(ref, () => ({
        shoot
    }));

    return (
        <>
            {bullets.map((bulletInfo, index) => (
                <Bullet 
                    key={index} 
                    current_position={bulletInfo.current_position} 
                    direction={bulletInfo.direction} 
                    Lifetime={bulletInfo.Lifetime}
                />
            ))}
        </>
    );
});

BulletRenderer.displayName = "BulletRenderer";