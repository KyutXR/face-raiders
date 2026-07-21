
import { useState, useRef, useEffect } from 'react';

export const Register = ({ setGamestate }: { setGamestate: (state: string) => void }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // 初期化時に保存済み画像をロード
  useEffect(() => {
    const savedImage = localStorage.getItem('user_face_image');
    if (savedImage) {
      setImageSrc(savedImage);
    }
  }, []);

  // カメラを起動する関数
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 300, height: 300 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error('カメラの起動に失敗しました:', err);
      alert('カメラにアクセスできませんでした。ファイルから画像を選択してください。');
    }
  };

  // カメラを停止する関数
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // カメラから写真をキャプチャする関数
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // 左右反転して鏡のように撮影
      ctx.translate(300, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(videoRef.current, 0, 0, 300, 300);
      const dataUrl = canvas.toDataURL('image/png');
      setImageSrc(dataUrl);
      localStorage.setItem('user_face_image', dataUrl);
    }
    stopCamera();
  };

  // ファイルから画像を選択・保存する関数
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setImageSrc(result);
          localStorage.setItem('user_face_image', result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // クリーンアップ
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#1a1a24',
      color: '#fff',
      padding: '20px',
      fontFamily: 'sans-serif',
      textAlign: 'center'
    }}>
      <h1 style={{ marginBottom: '10px' }}>🎯 敵の顔画像を登録</h1>
      <p style={{ color: '#aaa', marginBottom: '20px' }}>
        カメラで撮影するか、画像ファイルを選択してください
      </p>

      {/* プレビュー / カメラエリア */}
      <div style={{
        width: '240px',
        height: '240px',
        borderRadius: '50%',
        overflow: 'hidden',
        border: '4px solid #ff4757',
        backgroundColor: '#2f3542',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '20px',
        position: 'relative'
      }}>
        {isCameraActive ? (
          <video
            ref={videoRef}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
          />
        ) : imageSrc ? (
          <img
            src={imageSrc}
            alt="顔プレビュー"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span style={{ color: '#888', fontSize: '14px' }}>未登録</span>
        )}
      </div>

      {/* 操作ボタンエリア */}
      <div style={{ display: 'flex', gap: '10px', flexDirection: 'column', width: '100%', maxWidth: '280px' }}>
        {isCameraActive ? (
          <button
            onClick={capturePhoto}
            style={{
              padding: '12px',
              backgroundColor: '#ff4757',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            📸 パシャリ（撮影）
          </button>
        ) : (
          <button
            onClick={startCamera}
            style={{
              padding: '12px',
              backgroundColor: '#2ed573',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            📷 カメラを起動
          </button>
        )}

        <label style={{
          padding: '12px',
          backgroundColor: '#1e90ff',
          color: '#fff',
          borderRadius: '8px',
          fontWeight: 'bold',
          cursor: 'pointer',
          display: 'block'
        }}>
          📁 画像ファイルを選択
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </label>

        {imageSrc && (
          <button
            onClick={() => setGamestate('play')}
            style={{
              padding: '14px',
              marginTop: '15px',
              backgroundColor: '#ffa502',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(255, 165, 2, 0.4)'
            }}
          >
            ⚔️ この顔で出撃！
          </button>
        )}
      </div>
    </div>
  );
};