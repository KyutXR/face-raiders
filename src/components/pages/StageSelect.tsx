import { useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { faceDataStore } from '../../functions/faceDatastore';
import { getAvailableStages } from '../../functions/Load';

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
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
  width: 90%;
  max-width: 960px;
  max-height: 65vh;
  overflow-y: auto;
  padding: 12px;
  box-sizing: border-box;
  animation: ${fadeIn} 0.5s ease-out;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(18, 25, 41, 0.4);
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 255, 255, 0.3);
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 255, 255, 0.6);
  }
`;

const StageCard = styled.div<{ $color: string }>`
  position: relative;
  box-sizing: border-box;
  width: 100%;
  background: rgba(18, 25, 41, 0.8);
  backdrop-filter: blur(16px);
  border: 2px solid ${(props) => props.$color};
  border-radius: 20px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 12px 30px ${(props) => `${props.$color}66`};
    animation: ${pulseGlow} 1.5s infinite;
  }
`;

const StageTitle = styled.h3<{ $color: string }>`
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 2px;
  color: ${(props) => props.$color};
  text-shadow: 0 2px 10px ${(props) => `${props.$color}44`};
`;

const SelectButton = styled.button<{ $bgColor: string }>`
  width: 100%;
  padding: 12px 0;
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

const STAGE_THEME_COLORS = [
  { main: '#00ffff', bg: 'linear-gradient(135deg, #00ffff 0%, #00bfff 100%)' },
  { main: '#ff007f', bg: 'linear-gradient(135deg, #ff007f 0%, #ff5500 100%)' },
  { main: '#00ff88', bg: 'linear-gradient(135deg, #00ff88 0%, #00b359 100%)' },
  { main: '#ffaa00', bg: 'linear-gradient(135deg, #ffaa00 0%, #ff7700 100%)' },
  { main: '#a855f7', bg: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)' },
];

export const StageSelect = ({ setGamestate, setStageNum }: StageSelectProps) => {
  const croppedFaceUrl = faceDataStore.croppedFaceUrl;
  const stages = useMemo(() => getAvailableStages(), []);

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
        {stages.map((stage, index) => {
          const theme = STAGE_THEME_COLORS[index % STAGE_THEME_COLORS.length];

          return (
            <StageCard
              key={stage.stageNum}
              $color={theme.main}
              onClick={() => handleSelectStage(stage.stageNum)}
            >
              <StageTitle $color={theme.main}>STAGE {stage.stageNum}</StageTitle>
              <SelectButton $bgColor={theme.bg}>
                PLAY STAGE {stage.stageNum} ➔
              </SelectButton>
            </StageCard>
          );
        })}
      </CardContainer>

      <BackButton onClick={() => setGamestate('register')}>
        📷 顔写真を撮り直す
      </BackButton>
    </Container>
  );
};


