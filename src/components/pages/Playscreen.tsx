import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useEffect, useState } from "react";
import { Box } from "../objects/box";
import { OrbitControls, Stars } from "@react-three/drei";

const GyroCameraController = () => {
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
    camera.rotation.z = alpha * degToRad;
    camera.rotation.x = beta * degToRad;
    camera.rotation.y = gamma * degToRad;
  });
  return null;
};

export const Playscreen = ({ setGamestate }: { setGamestate: (state: string) => void })=>{
    const canvasRef = useRef(null);
    const [needsPermission, setNeedsPermission] = useState(false);
    const [permissionGranted, setPermissionGranted] = useState(false);

    useEffect(() => {
        // iOS 13+ の場合は確認が必要
        if (
            typeof DeviceOrientationEvent !== "undefined" &&
            typeof DeviceOrientationEvent.requestPermission === "function"
        ) {
            setNeedsPermission(true);
        } else {
            setPermissionGranted(true);
        }
    }, []);

    const requestPermission = async () => {
        const DeviceOrientationEventAny = DeviceOrientationEvent as any;
        if (
            typeof DeviceOrientationEventAny !== "undefined" &&
            typeof DeviceOrientationEventAny.requestPermission === "function"
        ) {
            try {
                const response = await DeviceOrientationEventAny.requestPermission();
                if (response === "granted") {
                    setPermissionGranted(true);
                    setNeedsPermission(false);
                } else {
                    alert("センサーのアクセスが拒否されました。");
                }
            } catch (e) {
                console.error(e);
                alert("エラーが発生しました。");
            }
        }
    };

    const onCanvasClick = ()=>{
        setGamestate('result');//画面クリックでリザルト画面を出力
    };

    if (needsPermission && !permissionGranted) {
        return (
            <div id="PermissionRequestContainer" style={{
                position: 'absolute',
                top: 0, left: 0, width: '100%', height: '100%',
                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.8)', color: 'white', zIndex: 1000,
                fontFamily: 'sans-serif'
            }}>
                <p style={{ marginBottom: '20px', fontSize: '18px' }}>ジャイロセンサーのアクセス許可が必要です</p>
                <button onClick={requestPermission} style={{
                    padding: '12px 24px', fontSize: '16px', borderRadius: '8px', border: 'none',
                    backgroundColor: '#007aff', color: 'white', cursor: 'pointer', fontWeight: 'bold'
                }}>
                    許可する
                </button>
            </div>
        );
    }

    return (
        <div id="CanvasContainer">
              <Canvas 
                ref = {canvasRef}
                shadows={'soft'}
                onClick ={onCanvasClick} 
                >
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
    );
}