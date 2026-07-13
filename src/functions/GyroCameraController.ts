import { useFrame } from "@react-three/fiber";
import { useRef,useEffect } from "react";
import { Euler,Quaternion,Vector3 } from "three";

const alignQuaternion = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2);

export const GyroCameraController = () => {
  const orientationRef = useRef<{ alpha: number; beta: number; gamma: number }>({ alpha: 0, beta: 0, gamma: 0 });

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      orientationRef.current = {
        alpha: event.alpha ?? 0,
        beta: event.beta ?? 0,
        gamma: event.gamma ?? 0,
      };
    };

    window.addEventListener("deviceorientation", handleOrientation);
    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, []);

  useFrame(({ camera }) => {
    const { alpha, beta, gamma } = orientationRef.current;
    const degToRad = Math.PI / 180;

    // デバイスの回転を表す Euler (順序は 'YXZ')
    const euler = new Euler(beta * degToRad, alpha * degToRad, -gamma * degToRad, 'YXZ');
    
    // デバイスの向きのクォータニオンを作成
    const deviceQuaternion = new Quaternion().setFromEuler(euler);

    // デバイス姿勢に補正を乗算してカメラに適用
    camera.quaternion.copy(deviceQuaternion).multiply(alignQuaternion);
  });
  return null;
};