import { useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { faceDataStore } from '../../functions/faceDatastore';
import { getAvailableStages } from '../../functions/Load';
import { COLORS } from '../../styles/colors';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
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
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  box-sizing: border-box;
`;

const HeaderSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
`;

const HeaderTitle = styled.h2`
  margin: 0;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: 2px;
  color: #1E293B;
  text-align: center;
`;

const RegisteredFaceSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: #FFFFFF;
  padding: 8px 16px;
  border-radius: 30px;
  border: 1px solid #1E293B;
  animation: ${fadeIn} 0.3s ease-out;
`;

const FacePreview = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid ${COLORS.accent};
`;

const RegisteredText = styled.span`
  font-size: 13px;
  color: #1E293B;
  font-weight: 700;
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
  max-height: 58vh;
  overflow-y: auto;
  padding: 4px;
  box-sizing: border-box;
  animation: ${fadeIn} 0.4s ease-out;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: #E2E8F0;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #CBD5E1;
    border-radius: 4px;
  }
`;

const StageCard = styled.div`
  box-sizing: border-box;
  width: 100%;
  background-color: #FFFFFF;
  border: 2px solid #1E293B;
  border-radius: 20px;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.15s ease-in-out;

  &:hover, &:active {
    border-color: ${COLORS.accent};
    transform: translateY(-2px);
  }
`;

const StageInfoGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StageTitle = styled.h3`
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 1px;
  color: #1E293B;
`;

const StageSubText = styled.span`
  font-size: 12px;
  color: #64748B;
  font-weight: 600;
`;

const SelectButton = styled.button`
  padding: 10px 20px;
  font-size: 15px;
  font-weight: 800;
  background-color: ${COLORS.accent};
  color: #FFFFFF;
  border: none;
  border-radius: 24px;
  cursor: pointer;
  transition: transform 0.15s ease-in-out;

  ${StageCard}:hover & {
    transform: scale(1.04);
  }
`;

const FooterSection = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const BackButton = styled.button`
  width: 100%;
  max-width: 320px;
  padding: 14px 20px;
  font-size: 15px;
  font-weight: 700;
  background-color: #FFFFFF;
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

interface StageSelectProps {
  setGamestate: (state: string) => void;
  setStageNum: (num: number) => void;
}

export const StageSelect = ({ setGamestate, setStageNum }: StageSelectProps) => {
  const croppedFaceUrl = faceDataStore.croppedFaceUrl;
  const stages = useMemo(() => getAvailableStages(), []);

  const handleSelectStage = (stageNum: number) => {
    setStageNum(stageNum);
    setGamestate('play');
  };

  return (
    <Container>
      <ContentBox>
        <HeaderSection>
          <HeaderTitle>ステージ選択</HeaderTitle>

          {croppedFaceUrl && (
            <RegisteredFaceSection>
              <FacePreview src={croppedFaceUrl} alt="Registered Face" />
              <RegisteredText>顔写真登録完了</RegisteredText>
            </RegisteredFaceSection>
          )}
        </HeaderSection>

        <CardContainer>
          {stages.map((stage) => (
            <StageCard
              key={stage.stageNum}
              onClick={() => handleSelectStage(stage.stageNum)}
            >
              <StageInfoGroup>
                <StageTitle>ステージ {stage.stageNum}</StageTitle>
                <StageSubText>ターゲット：敵ロボット</StageSubText>
              </StageInfoGroup>
              <SelectButton>
                プレイ
              </SelectButton>
            </StageCard>
          ))}
        </CardContainer>

        <FooterSection>
          <BackButton onClick={() => setGamestate('register')}>
            顔写真を撮り直す
          </BackButton>
        </FooterSection>
      </ContentBox>
    </Container>
  );
};
