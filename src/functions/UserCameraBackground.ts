import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { VideoTexture } from "three";

/**
 * CameraBackground.ts と同様の原理で、内カメラ(facingMode: 'user')のリアルタイム映像を
 * Three.js の画面全画面背景(scene.background)として描画するコンポーネント
 */
export const UserCameraBackground = () => {
  const { scene } = useThree();

  useEffect(() => {
    const constraints = { video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } };
    let activeStream: MediaStream | null = null;
    let texture: VideoTexture | null = null;

    navigator.mediaDevices?.getUserMedia(constraints)
      .then((stream) => {
        activeStream = stream;
        const vid = document.createElement('video');
        vid.srcObject = stream;
        vid.autoplay = true;
        vid.playsInline = true;
        vid.muted = true; // 自動再生のブロックを防ぐため必須
        
        vid.onloadedmetadata = () => {
          vid.play()
            .then(() => {
              texture = new VideoTexture(vid);
              scene.background = texture;
            })
            .catch((err) => console.error("内カメラ再生エラー:", err));
        };
      })
      .catch((err) => console.error("内カメラ取得エラー:", err));

    return () => {
      scene.background = null;
      if (texture) {
        texture.dispose();
      }
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [scene]);

  return null;
};
