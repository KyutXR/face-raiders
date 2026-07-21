import { useEffect, useRef } from 'react';
import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';
import styled from 'styled-components';
import { faceDataStore } from './faceDatastore';

const HiddenVideo = styled.video`
  display: none;
`;

export function FaceTracker() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let faceLandmarker: FaceLandmarker;
    let animationFrameId: number;

    async function init() {
      const vision = await FilesetResolver.forVisionTasks(
        "https://jsdelivr.net"
      );
      faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://googleapis.com`,
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numFaces: 1
      });

      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener('loadeddata', loop);
      }
    }

    function loop() {
      if (!videoRef.current) return;
      const results = faceLandmarker.detectForVideo(videoRef.current, performance.now());

      if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        const landmarks = results.faceLandmarks[0];
        
        // --- データの保存 ---
        faceDataStore.rawLandmarks = landmarks;
        faceDataStore.isDetected = true;

        // 簡易的な「頭の位置」として鼻の頭(インデックス4)の座標を加工して保存
        const nose = landmarks[4];
        faceDataStore.headPosition.set(
          (0.5 - nose.x) * 5, // 鏡合わせ反転 + スケール
          (0.5 - nose.y) * 5,
          -nose.z * 5
        );
      } else {
        faceDataStore.isDetected = false;
      }
      animationFrameId = requestAnimationFrame(loop);
    }

    init();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // カメラ映像は裏で動かす（画面上は見えなくてもOK、または小さく配置）
  return <HiddenVideo ref={videoRef} autoPlay playsInline />;
}

