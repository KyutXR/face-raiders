import { useState, useRef, useEffect } from 'react';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { faceDataStore } from '../../functions/faceDatastore';

export const Register = ({ setGamestate }: { setGamestate: (state: string) => void }) => {
  const [, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({ unit: 'px', x: 50, y: 50, width: 200, height: 200 });
  const [croppedUrl, setCroppedUrl] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // 内カメラのリアルタイムプレビュー起動
  useEffect(() => {
    let stream: MediaStream | null = null;
    navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } })
      .then((s) => {
        stream = s;
        setCameraStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      })
      .catch((err) => console.error("内カメラ起動エラー:", err));

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // カメラ映像から顔のスナップショットを撮影
  const handleCapture = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // 鏡合わせ反転
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      setCapturedImage(dataUrl);
    }
  };

  // 切り取るボタンの関数
  const handleCrop = () => {
    const img = imgRef.current;
    if (!img || !crop.width || !crop.height) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = crop.width;
    canvas.height = crop.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 円形にクリップ（切り抜き）
    ctx.beginPath();
    ctx.arc(crop.width / 2, crop.height / 2, crop.width / 2, 0, Math.PI * 2);
    ctx.clip();

    // 実際の画像サイズと表示サイズの比率を計算
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    // 画像の描画
    ctx.drawImage(
      img,
      crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY,
      0, 0, crop.width, crop.height
    );

    // 描画データを出力
    canvas.toBlob(blob => {
      if (!blob) return;
      if (croppedUrl) URL.revokeObjectURL(croppedUrl); 
      const newUrl = URL.createObjectURL(blob);
      setCroppedUrl(newUrl);
      
      // faceDataStoreに登録
      faceDataStore.setCroppedFace(newUrl);
    }, 'image/png');
  };

  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      backgroundColor: '#111',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      gap: '15px'
    }}>
      <h2 style={{ margin: '0' }}>顔の登録・切り抜き</h2>

      {!capturedImage ? (
        // 1. 画面いっぱいの内カメラプレビュー表示、円形白い薄いナビガイド、撮影ボタン
        <div style={{ position: 'relative', width: '90%', maxWidth: '600px', maxHeight: '70vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              maxHeight: '65vh',
              objectFit: 'cover',
              transform: 'scaleX(-1)',
              borderRadius: '16px',
              border: '2px solid #00ffff'
            }}
          />

          {/* ★ 円形の白く薄いナビガイドリング */}
          <div style={{
            position: 'absolute',
            width: '230px',
            height: '230px',
            borderRadius: '50%',
            border: '3px dashed rgba(255, 255, 255, 0.75)',
            boxShadow: '0 0 20px rgba(255, 255, 255, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.15)',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.05)'
          }}>
            <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.9)', textShadow: '0 1px 4px rgba(0,0,0,0.8)', textAlign: 'center', fontWeight: 'bold' }}>
              円の中に顔を<br />合わせてください
            </span>
          </div>

          <button
            onClick={handleCapture}
            style={{
              position: 'absolute',
              bottom: '20px',
              padding: '12px 28px',
              fontSize: '18px',
              fontWeight: 'bold',
              backgroundColor: '#00ffff',
              color: '#000',
              border: 'none',
              borderRadius: '28px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,255,255,0.4)',
              zIndex: 10
            }}
          >
            📸 写真を撮る
          </button>
        </div>
      ) : (
        // 2. 撮影後、ReactCropでの円形切り抜きUI
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
          <ReactCrop crop={crop} onChange={setCrop} aspect={1} circularCrop keepSelection>
            <img ref={imgRef} src={capturedImage} alt="撮影顔写真" style={{ maxHeight: '380px', borderRadius: '8px' }} />
          </ReactCrop>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setCapturedImage(null)} style={{ padding: '8px 16px', cursor: 'pointer' }}>撮り直す</button>
            <button onClick={handleCrop} style={{ padding: '8px 16px', backgroundColor: '#00ffff', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}>顔を切り取る</button>
            <button
              onClick={() => setGamestate('play')}
              style={{ padding: '8px 16px', backgroundColor: '#00ff88', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}
            >
              次へ進む ➔
            </button>
          </div>

          {croppedUrl && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '5px' }}>
              <span style={{ fontSize: '14px', color: '#00ff88' }}>✓ 切り抜き完了！</span>
              <img src={croppedUrl} alt="結果" style={{ width: '90px', height: '90px', borderRadius: '50%', border: '3px solid #00ffff', marginTop: '5px' }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};