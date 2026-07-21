import { Canvas } from "@react-three/fiber";
import { useRef } from "react";
import { Box } from "../objects/box";
import { OrbitControls, Stars, Text } from "@react-three/drei";
import { GyroCameraController } from "../../functions/GyroCameraController";
import { CameraBackground } from "../../functions/CameraBackground";
import { DeviceOrientationPermissionGate } from "../DeviceOrientationPermissionGate";
import { BulletRenderer } from "../renderers/BulletRenderer";
import type { BulletRendererRef } from "../renderers/BulletRenderer";
import { Physics, RigidBody } from "@react-three/rapier";
import { Enemyrenderer } from "../renderers/EnemyRenderer";

interface PlayscreenProps {
    setGamestate: (state: string) => void;
    stageNum: number;
    imgUrl?: string | null;
}

export const Playscreen = ({ setGamestate, stageNum, imgUrl }: PlayscreenProps) => {
    const canvasRef = useRef(null);
    const bulletRendererRef = useRef<BulletRendererRef>(null);

    const onCanvasClick = () => {
        bulletRendererRef.current?.shoot(); // 画面クリックで弾を発射する
    };

    return (
        <DeviceOrientationPermissionGate>
            <div id="CanvasContainer" style={{ position: 'relative', width: '100vw', height: '100vh' }}>

                {imgUrl && (
                    <img
                        src={imgUrl}
                        style={{
                            position: 'absolute', top: '20px', left: '20px', // 左上に固定
                            width: '60px', height: '60px', borderRadius: '50%', // サイズと丸み
                            zIndex: 100 // 3Dキャンバスより手前に表示させる
                        }}
                    />
                )}

                <Canvas
                    ref={canvasRef}
                    shadows={'soft'}
                    onClick={onCanvasClick}
                >
                    <Physics>
                        <CameraBackground />
                        <ambientLight />
                        <pointLight position={[0, 0, 0]} />
                        <GyroCameraController /> //開発するときはctrl+/で消してもいい
                        <BulletRenderer ref={bulletRendererRef} />
                        <Enemyrenderer stage={stageNum} setGamestate={setGamestate} />
                        <RigidBody colliders="cuboid" restitution={0} type="fixed"><Box /></RigidBody>
                        <Stars
                            radius={100} // 星の点滅(拡大)度合い
                            depth={50} // 星の深さ
                            count={5000} // 星の数
                            factor={12} // 星の大きさ
                            saturation={9} // 星の彩度
                            speed={3} // 点滅のスピード
                        />
                    </Physics>
                    <OrbitControls />//開発環境用

                    {/* スコアテキスト(ScorePopup)のフォントアセット・シェーダーの初回読込によるフリーズ(Jank)を防ぐプリロード用ダミー */}
                    <Text visible={false}>Preload Font</Text>
                </Canvas>
                <div className="crosshair"></div>
            </div>
        </DeviceOrientationPermissionGate>
    );
}