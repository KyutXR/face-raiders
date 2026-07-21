import { Canvas } from "@react-three/fiber";
import { useRef } from "react";
import { Enemy1 } from "../objects/Enemy1";
import { OrbitControls, Stars } from "@react-three/drei";
import { GyroCameraController } from "../../functions/GyroCameraController";
import { CameraBackground } from "../../functions/CameraBackground";
import { DeviceOrientationPermissionGate } from "../DeviceOrientationPermissionGate";

export const Playscreen = ({ setGamestate }: { setGamestate: (state: string) => void }) => {
  const canvasRef = useRef(null);

  const onCanvasClick = () => {
    setGamestate('result');//画面クリックでリザルト画面を出力
  };

  return (
    <DeviceOrientationPermissionGate>
      <div id="CanvasContainer">
        <Canvas
          ref={canvasRef}
          shadows={'soft'}
          onClick={onCanvasClick}
        >
          <CameraBackground />
          <ambientLight />
          <pointLight position={[0, 0, 0]} />
          <GyroCameraController />
          <Enemy position={[0, 0, -3]} />
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