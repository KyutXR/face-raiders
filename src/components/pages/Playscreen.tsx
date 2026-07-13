import { Canvas,useThree} from "@react-three/fiber";
import { useRef, useEffect, useState } from "react";
import { Box } from "../objects/box";
import { OrbitControls, Stars } from "@react-three/drei";
import { VideoTexture } from "three";
import { GyroCameraController } from "../../functions/GyroCameraController";

// constraints（条件設定）で背面カメラを指定

interface CameraBackgroundProps {
  videoElement: HTMLVideoElement | null;
}

function CameraBackground({ videoElement }: CameraBackgroundProps) {
  const { scene } = useThree();

  useEffect(() => {
    if (!videoElement) return;

    // 1. video要素からThree.jsのVideoTextureを作成
    const texture = new VideoTexture(videoElement);
    
    // 2. シーンの背景にテクスチャを適用
    scene.background = texture;

    // クリーンアップ処理
    return () => {
      scene.background = null;
      texture.dispose();
    };
  }, [videoElement, scene]);

  return null;
}

export const Playscreen = ({ setGamestate }: { setGamestate: (state: string) => void })=>{
    const canvasRef = useRef(null);
    const [needsPermission, setNeedsPermission] = useState(false);
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [video, setVideo] = useState<HTMLVideoElement | null>(null);

  useEffect(() => {
    // 3. 背面カメラのストリームを取得
    const constraints = { video: { facingMode: 'environment' } };
    let activeStream: MediaStream | null = null;
    
    navigator.mediaDevices?.getUserMedia(constraints)
      .then((stream) => {
        activeStream = stream;
        // 裏側で再生するvideo要素を動的に生成
        const vid = document.createElement('video');
        vid.srcObject = stream;
        vid.autoplay = true;
        vid.playsInline = true;
        vid.muted = true; // 自動再生のブロックを防ぐため必須
        
        vid.onloadedmetadata = () => {
          vid.play().catch((err) => console.error("ビデオ再生エラー:", err));
          setVideo(vid); // 映像が準備できたら状態を更新
        };
      })
      .catch((err) => console.error("カメラ取得エラー:", err));

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);


    useEffect(() => {
        const DeviceOrientationEventAny = DeviceOrientationEvent as any;
        // iOS 13+ の場合は確認が必要
        if (
            typeof DeviceOrientationEventAny !== "undefined" &&
            typeof DeviceOrientationEventAny.requestPermission === "function"
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
                {video && <CameraBackground videoElement={video} />}
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