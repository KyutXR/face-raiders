import { useState, useRef, useEffect } from 'react';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import styled, { keyframes } from 'styled-components';
import { faceDataStore } from '../../functions/faceDatastore';

// --- アニメーション ---
const pulseGlow = keyframes`
  0% { box-shadow: 0 0 15px rgba(0, 255, 255, 0.4), inset 0 0 15px rgba(0, 255, 255, 0.2); }
  50% { box-shadow: 0 0 25px rgba(0, 255, 255, 0.8), inset 0 0 25px rgba(0, 255, 255, 0.4); }
  100% { box-shadow: 0 0 15px rgba(0, 255, 255, 0.4), inset 0 0 15px rgba(0, 255, 255, 0.2); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- Styled Components ---
const Container = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  background: radial-gradient(circle at center, #1a233a 0%, #0a0e17 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  gap: 20px;
  font-family: 'Segoe UI', Roboto, sans-serif;
`;

const HeaderTitle = styled.h2`
  margin: 0;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: 2px;
  background: linear-gradient(135deg, #00ffff 0%, #00ff88 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 10px rgba(0, 255, 255, 0.3);
`;

const CardContainer = styled.div`
  position: relative;
  width: 90%;
  max-width: 640px;
  background: rgba(18, 25, 41, 0.75);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(0, 255, 255, 0.25);
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
  animation: ${fadeIn} 0.4s ease-out;
`;

const CameraWrapper = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  border-radius: 14px;
`;

const StyledVideo = styled.video`
  width: 100%;
  max-height: 60vh;
  object-fit: cover;
  transform: scaleX(-1);
  border-radius: 14px;
`;

// 縦長（楕円形）ガイドリング
const OvalGuide = styled.div`
  position: absolute;
  width: 210px;
  height: 280px;
  border-radius: 50%;
  border: 3px dashed #00ffff;
  animation: ${pulseGlow} 2s infinite ease-in-out;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 255, 255, 0.04);
`;

const GuideText = styled.span`
  font-size: 14px;
  color: #ffffff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.9);
  text-align: center;
  font-weight: 600;
  line-height: 1.4;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 18px;
  flex-wrap: wrap;
  justify-content: center;
`;

const PrimaryButton = styled.button`
  padding: 12px 28px;
  font-size: 16px;
  font-weight: 700;
  background: linear-gradient(135deg, #00ffff 0%, #00bfff 100%);
  color: #080d1a;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 255, 255, 0.4);
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 255, 255, 0.6);
  }

  &:active {
    transform: translateY(0);
  }
`;

const SecondaryButton = styled.button`
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.08);
  color: #e0e0e0;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background: rgba(255, 255, 255, 0.18);
    color: #fff;
  }
`;

const SuccessButton = styled.button`
  padding: 12px 28px;
  font-size: 16px;
  font-weight: 700;
  background: linear-gradient(135deg, #00ff88 0%, #00cc66 100%);
  color: #080d1a;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 255, 136, 0.4);
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 255, 136, 0.6);
  }
`;

const CropWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
`;

const ResultSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 15px;
  animation: ${fadeIn} 0.3s ease-out;
`;

const ResultImage = styled.img`
  width: 90px;
  height: 120px;
  border-radius: 50%;
  border: 3px solid #00ffff;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
  object-fit: cover;
  margin-top: 8px;
`;

export const Register = ({ setGamestate }: { setGamestate: (state: string) => void }) => {
  const [, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // 縦長（3:4アスペクト比）の初期クロップ枠
  const [crop, setCrop] = useState<Crop>({ unit: 'px', x: 50, y: 30, width: 180, height: 240 });
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
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      setCapturedImage(dataUrl);
    }
  };

  // 縦長楕円に切り取る関数
  const handleCrop = () => {
    const img = imgRef.current;
    if (!img || !crop.width || !crop.height) return;

    const canvas = document.createElement('canvas');
    canvas.width = crop.width;
    canvas.height = crop.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ★ 縦長楕円にクリップ（切り抜き）
    ctx.beginPath();
    ctx.ellipse(crop.width / 2, crop.height / 2, crop.width / 2, crop.height / 2, 0, 0, Math.PI * 2);
    ctx.clip();

    // 実際の画像サイズと表示サイズの比率
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    ctx.drawImage(
      img,
      crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY,
      0, 0, crop.width, crop.height
    );

    canvas.toBlob((blob) => {
      if (!blob) return;
      if (croppedUrl) URL.revokeObjectURL(croppedUrl);
      const newUrl = URL.createObjectURL(blob);
      setCroppedUrl(newUrl);

      // faceDataStoreに登録
      faceDataStore.setCroppedFace(newUrl);
    }, 'image/png');
  };

  return (
    <Container>
      <HeaderTitle>FACE REGISTRATION</HeaderTitle>

      <CardContainer>
        {!capturedImage ? (
          <CameraWrapper>
            <StyledVideo ref={videoRef} autoPlay playsInline muted />

            {/* 縦長（楕円形）ガイドリング */}
            <OvalGuide>
              <GuideText>
                縦長の枠の中に顔を<br />合わせてください
              </GuideText>
            </OvalGuide>

            <PrimaryButton
              onClick={handleCapture}
              style={{ position: 'absolute', bottom: '20px', zIndex: 10 }}
            >
              📸 写真を撮影
            </PrimaryButton>
          </CameraWrapper>
        ) : (
          <CropWrapper>
            {/* aspect={0.75} で 3:4 の縦長アスペクト比固定、circularCrop で縦長楕円切り抜き枠表示 */}
            <ReactCrop crop={crop} onChange={setCrop} aspect={0.75} circularCrop keepSelection>
              <img
                ref={imgRef}
                src={capturedImage}
                alt="撮影顔写真"
                style={{ maxHeight: '380px', borderRadius: '12px' }}
              />
            </ReactCrop>

            <ButtonGroup>
              <SecondaryButton onClick={() => setCapturedImage(null)}>
                🔄 撮り直す
              </SecondaryButton>
              <PrimaryButton onClick={handleCrop}>
                ✂️ 顔を切り取る
              </PrimaryButton>
              <SuccessButton onClick={() => setGamestate('stageSelect')}>
                🎯 ステージ選択へ ➔
              </SuccessButton>
            </ButtonGroup>

            {croppedUrl && (
              <ResultSection>
                <span style={{ fontSize: '14px', color: '#00ff88', fontWeight: 'bold' }}>
                  ✓ 縦長切り抜き完了！
                </span>
                <ResultImage src={croppedUrl} alt="切り抜き結果" />
              </ResultSection>
            )}
          </CropWrapper>
        )}
      </CardContainer>
    </Container>
  );
};