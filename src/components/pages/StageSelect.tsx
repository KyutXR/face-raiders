import styled, { keyframes } from 'styled-components';
import { faceDataStore } from '../../functions/faceDatastore';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulseGlow = keyframes`
  0% { box-shadow: 0 0 15px rgba(0, 255, 255, 0.3); }
  50% { box-shadow: 0 0 25px rgba(0, 255, 255, 0.7); }
  100% { box-shadow: 0 0 15px rgba(0, 255, 255, 0.3); }
`;

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
  gap: 24px;
  font-family: 'Segoe UI', Roboto, sans-serif;
`;

const HeaderTitle = styled.h2`
  margin: 0;
  font-size: 32px;
  font-weight: 800;
  letter-spacing: 3px;
  background: linear-gradient(135deg, #00ffff 0%, #00ff88 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 10px rgba(0, 255, 255, 0.3);
`;

const RegisteredFaceSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(18, 25, 41, 0.6);
  padding: 10px 20px;
  border-radius: 40px;
  border: 1px solid rgba(0, 255, 255, 0.3);
  animation: ${fadeIn} 0.4s ease-out;
`;

const FacePreview = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #00ffff;
`;

const RegisteredText = styled.span`
  font-size: 14px;
  color: #00ff88;
  font-weight: 600;
`;

const CardContainer = styled.div`
  display: flex;
  gap: 20px;
  width: 90%;
  max-width: 720px;
  justify-content: center;
  flex-wrap: wrap;
  animation: ${fadeIn} 0.5s ease-out;
`;

const StageCard = styled.div<{ $color: string }>`
  position: relative;
  flex: 1;
  min-width: 260px;
  max-width: 320px;
  background: rgba(18, 25, 41, 0.8);
  backdrop-filter: blur(16px);
  border: 2px solid ${(props) => props.$color};
  border-radius: 20px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 12px 30px ${(props) => `${props.$color}66`};
    animation: ${pulseGlow} 1.5s infinite;
  }
`;

const StageBadge = styled.span<{ $bgColor: string }>`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  background-color: ${(props) => props.$bgColor};
  color: #000;
`;

const StageName = styled.h3`
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 1px;
`;

const StageDescription = styled.p`
  margin: 0;
  font-size: 14px;
  color: #a0aec0;
  text-align: center;
  line-height: 1.5;
`;

const SelectButton = styled.button<{ $bgColor: string }>`
  width: 100%;
  padding: 12px 0;
  margin-top: 8px;
  font-size: 16px;
  font-weight: 700;
  background: ${(props) => props.$bgColor};
  color: #080d1a;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: transform 0.2s ease-in-out;

  ${StageCard}:hover & {
    transform: scale(1.05);
  }
`;

const BackButton = styled.button`
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.08);
  color: #e0e0e0;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  margin-top: 12px;

  &:hover {
    background: rgba(255, 255, 255, 0.18);
    color: #fff;
  }
`;

interface StageSelectProps {
  setGamestate: (state: string) => void;
  setStageNum: (num: number) => void;
}

export const StageSelect = ({ setGamestate, setStageNum }: StageSelectProps) => {
  const croppedFaceUrl = faceDataStore.croppedFaceUrl;

  const handleSelectStage = (stageNum: number) => {
    setStageNum(stageNum);
    setGamestate('play');
  };

  return (
    <Container>
      <HeaderTitle>SELECT STAGE</HeaderTitle>

      {croppedFaceUrl && (
        <RegisteredFaceSection>
          <FacePreview src={croppedFaceUrl} alt="Registered Face" />
          <RegisteredText>✓ 顔写真登録完了</RegisteredText>
        </RegisteredFaceSection>
      )}

      <CardContainer>
        <StageCard $color="#00ffff" onClick={() => handleSelectStage(1)}>
          <StageBadge $bgColor="#00ffff">STAGE 1</StageBadge>
          <StageName>STANDARD</StageName>
          <StageDescription>
            基本のゲームモード。敵の攻撃を見極めて撃破しよう！
          </StageDescription>
          <SelectButton $bgColor="linear-gradient(135deg, #00ffff 0%, #00bfff 100%)">
            PLAY STAGE 1 ➔
          </SelectButton>
        </StageCard>

        <StageCard $color="#ff007f" onClick={() => handleSelectStage(2)}>
          <StageBadge $bgColor="#ff007f">STAGE 2</StageBadge>
          <StageName>HARD</StageName>
          <StageDescription>
            高難易度モード。スピードと正確なエイムが試される！
          </StageDescription>
          <SelectButton $bgColor="linear-gradient(135deg, #ff007f 0%, #ff5500 100%)">
            PLAY STAGE 2 ➔
          </SelectButton>
        </StageCard>
      </CardContainer>

      <BackButton onClick={() => setGamestate('register')}>
        📷 顔写真を撮り直す
      </BackButton>
    </Container>
  );
};
