import { Canvas } from "@react-three/fiber";
import { useRef } from "react";
import { Box } from "../objects/box";
import { OrbitControls, Stars } from "@react-three/drei";
import { GyroCameraController } from "../../functions/GyroCameraController";
import { CameraBackground } from "../../functions/CameraBackground";
import { DeviceOrientationPermissionGate } from "../DeviceOrientationPermissionGate";

export const Playscreen = ({ setGamestate, imgUrl }: { setGamestate: (state: string) => void, imgUrl?: string | null })=>{
    const canvasRef = useRef(null);

    const onCanvasClick = ()=>{
        setGamestate('result');//画面クリックでリザルト画面を出力
    };

    return (
        <DeviceOrientationPermissionGate>
            <div id="CanvasContainer"style={{ position: 'relative', width: '100vw', height: '100vh' }}>

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
                    ref = {canvasRef}
                    shadows={'soft'}
                    onClick ={onCanvasClick} 
                    >
                    <CameraBackground />
                    <ambientLight />
                    <pointLight position={[0, 0, 0]} />
                    <GyroCameraController/>
                    <Box />
                    <Stars
                      radius={100} // 星の点滅(拡大)度合い
                      depth={50} // 星の深さ
                      count={5000} // 星の数
                      factor={12} // 星の大きさ
                      saturation={9} // 星の彩度
                      speed={3} // 点滅のスピード
                    />
                    <OrbitControls />
                  </Canvas>
                  <div className="crosshair"></div>
            </div>
        </DeviceOrientationPermissionGate>
    );
}