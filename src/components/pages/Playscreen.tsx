import { Canvas } from "@react-three/fiber";
import { useRef } from "react";
import { Box } from "../objects/box";
import { OrbitControls, Stars } from "@react-three/drei";
import { GyroCameraController } from "../../functions/GyroCameraController";
import { CameraBackground } from "../../functions/CameraBackground";
import { DeviceOrientationPermissionGate } from "../DeviceOrientationPermissionGate";
import { BulletRenderer } from "../renderers/BulletRenderer";
import type { BulletRendererRef } from "../renderers/BulletRenderer";

export const Playscreen = ({ setGamestate: _setGamestate }: { setGamestate: (state: string) => void })=>{
    const canvasRef = useRef(null);
    const bulletRendererRef = useRef<BulletRendererRef>(null);

    const onCanvasClick = ()=>{
        bulletRendererRef.current?.shoot(); // 画面クリックで弾を発射する
    };

    return (
        <DeviceOrientationPermissionGate>
            <div id="CanvasContainer">
                  <Canvas 
                    ref = {canvasRef}
                    shadows={'soft'}
                    onClick ={onCanvasClick} 
                    >
                    <CameraBackground />
                    <ambientLight />
                    <pointLight position={[0, 0, 0]} />
                    <GyroCameraController/> //開発するときはctrl+/で消してもいい
                    <BulletRenderer ref={bulletRendererRef} />
                    <Box />
                    <Stars
                      radius={100} // 星の点滅(拡大)度合い
                      depth={50} // 星の深さ
                      count={5000} // 星の数
                      factor={12} // 星の大きさ
                      saturation={9} // 星の彩度
                      speed={3} // 点滅のスピード
                    />
                    {/* <OrbitControls /> */}//開発環境用
                  </Canvas>
                  <div className="crosshair"></div>
            </div>
        </DeviceOrientationPermissionGate>
    );
}