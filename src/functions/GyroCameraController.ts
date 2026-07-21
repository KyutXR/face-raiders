import { useFrame } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import { Euler, Quaternion, Vector3 } from "three";

// デバイスを立てて持つためのアライメント補正クォータニオン (X軸を中心に -90度回転)
const alignQuaternion = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2);

export const GyroCameraController = () => {
  const orientationRef = useRef<{ alpha: number; beta: number; gamma: number }>({ alpha: 0, beta: 0, gamma: 0 });
  // 初回の alpha (方位角) を記録して正面基準にするためのRef
  const initialAlphaRef = useRef<number | null>(null);

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      const alpha = event.alpha ?? 0;
      // 初回の alpha を基準（正面）として記録
      if (initialAlphaRef.current === null && event.alpha !== null) {
        initialAlphaRef.current = alpha;
      }

      orientationRef.current = {
        alpha,
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

    // 初回基準点からの相対角度を計算
    const initialAlpha = initialAlphaRef.current ?? alpha;
    const relativeAlpha = alpha - initialAlpha;

    // デバイスの回転を表す Euler (順序は 'YXZ')
    const euler = new Euler(beta * degToRad, relativeAlpha * degToRad, -gamma * degToRad, 'YXZ');
    
    // デバイス姿勢のクォータニオンを作成
    const deviceQuaternion = new Quaternion().setFromEuler(euler);

    // デバイス姿勢に補正を乗算してカメラに適用
    camera.quaternion.copy(deviceQuaternion).multiply(alignQuaternion);
  });
  return null;
};