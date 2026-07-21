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
  background-color: #0F172A;
  color: ${COLORS.primary};
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
  color: ${COLORS.primary};
  text-align: center;
`;

const RegisteredFaceSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: #1E293B;
  padding: 8px 16px;
  border-radius: 30px;
  border: 1px solid #334155;
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
  color: ${COLORS.primary};
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
    background: #1E293B;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #334155;
    border-radius: 4px;
  }
`;

const StageCard = styled.div`
  box-sizing: border-box;
  width: 100%;
  background-color: #1E293B;
  border: 2px solid #334155;
  border-radius: 20px;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);

  &:hover, &:active {
    border-color: ${COLORS.accent};
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(255, 116, 116, 0.25);
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
  color: ${COLORS.primary};
`;

const StageSubText = styled.span`
  font-size: 12px;
  color: #94A3B8;
  font-weight: 600;
`;

const SelectButton = styled.button`
  padding: 10px 20px;
  font-size: 15px;
  font-weight: 800;
  background-color: ${COLORS.accent};
  color: #0F172A;
  border: none;
  border-radius: 24px;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(255, 116, 116, 0.3);
  transition: transform 0.2s ease-in-out;

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
  background-color: #334155;
  color: ${COLORS.primary};
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: #475569;
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
          <HeaderTitle>SELECT STAGE</HeaderTitle>

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
                <StageTitle>STAGE {stage.stageNum}</StageTitle>
                <StageSubText>Target: Enemies</StageSubText>
              </StageInfoGroup>
              <SelectButton>
                PLAY
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
