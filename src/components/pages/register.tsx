import { useState, useRef, useEffect } from 'react';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import styled, { keyframes } from 'styled-components';
import { faceDataStore } from '../../functions/faceDatastore';
import { COLORS } from '../../styles/colors';

const pulseBorder = keyframes`
  0% { border-color: ${COLORS.accent}; }
  50% { border-color: #1E293B; }
  100% { border-color: ${COLORS.accent}; }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  background-color: ${COLORS.primary};
  color: #1E293B;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow-x: hidden;
  padding: 16px;
  box-sizing: border-box;
`;

const ContentBox = styled.div`
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const HeaderTitle = styled.h2`
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: 2px;
  color: #1E293B;
  text-align: center;
`;

const CardContainer = styled.div`
  position: relative;
  width: 100%;
  background-color: #FFFFFF;
  border: 2px solid #1E293B;
  border-radius: 24px;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: ${fadeIn} 0.3s ease-out;
`;

const CameraWrapper = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  border-radius: 16px;
  background-color: #1E293B;
`;

const StyledVideo = styled.video`
  width: 100%;
  max-height: 52vh;
  object-fit: cover;
  transform: scaleX(-1);
  border-radius: 16px;
`;

const OvalGuide = styled.div`
  position: absolute;
  width: 200px;
  height: 260px;
  border-radius: 50%;
  border: 3px dashed ${COLORS.accent};
  animation: ${pulseBorder} 2.5s infinite ease-in-out;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
`;

const GuideText = styled.span`
  font-size: 14px;
  color: #FFFFFF;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.8);
  text-align: center;
  font-weight: 700;
  line-height: 1.4;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 16px;
  width: 100%;
  flex-direction: column;
  align-items: center;
`;

const PrimaryButton = styled.button`
  width: 100%;
  max-width: 320px;
  padding: 14px 20px;
  font-size: 16px;
  font-weight: 700;
  background-color: ${COLORS.accent};
  color: #FFFFFF;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: transform 0.15s ease-in-out;

  &:hover {
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(1px) scale(0.98);
  }
`;

const SecondaryButton = styled.button`
  width: 100%;
  max-width: 320px;
  padding: 12px 20px;
  font-size: 15px;
  font-weight: 600;
  background-color: #E2E8F0;
  color: #1E293B;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: transform 0.15s ease-in-out;

  &:hover {
    background-color: #CBD5E1;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const OutlineButton = styled.button`
  width: 100%;
  max-width: 320px;
  padding: 14px 20px;
  font-size: 16px;
  font-weight: 700;
  background-color: transparent;
  color: #1E293B;
  border: 2px solid #1E293B;
  border-radius: 30px;
  cursor: pointer;
  transition: transform 0.15s ease-in-out;

  &:hover {
    background-color: rgba(30, 41, 59, 0.05);
  }

  &:active {
    transform: scale(0.98);
  }
`;

const CropWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
`;

const ResultSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 12px;
  animation: ${fadeIn} 0.3s ease-out;
`;

const ResultText = styled.span`
  font-size: 14px;
  color: #1E293B;
  font-weight: 700;
`;

const ResultImage = styled.img`
  width: 80px;
  height: 110px;
  border-radius: 50%;
  border: 3px solid ${COLORS.accent};
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

    // 縦長楕円にクリップ（切り抜き）
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
      <ContentBox>
        <HeaderTitle>顔写真の登録</HeaderTitle>

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
                style={{ position: 'absolute', bottom: '16px', zIndex: 10, width: 'calc(100% - 32px)' }}
              >
                写真を撮影
              </PrimaryButton>
            </CameraWrapper>
          ) : (
            <CropWrapper>
              <ReactCrop crop={crop} onChange={setCrop} aspect={0.75} circularCrop keepSelection>
                <img
                  ref={imgRef}
                  src={capturedImage}
                  alt="撮影顔写真"
                  style={{ maxHeight: '340px', borderRadius: '12px' }}
                />
              </ReactCrop>

              <ButtonGroup>
                <PrimaryButton onClick={handleCrop}>
                  顔を切り取る
                </PrimaryButton>

                <SecondaryButton onClick={() => setCapturedImage(null)}>
                  撮り直す
                </SecondaryButton>

                {croppedUrl && (
                  <OutlineButton onClick={() => setGamestate('stageSelect')}>
                    ステージ選択へ
                  </OutlineButton>
                )}
              </ButtonGroup>

              {croppedUrl && (
                <ResultSection>
                  <ResultText>
                    登録用顔写真の作成完了
                  </ResultText>
                  <ResultImage src={croppedUrl} alt="切り抜き結果" />
                </ResultSection>
              )}
            </CropWrapper>
          )}
        </CardContainer>
      </ContentBox>
    </Container>
  );
};