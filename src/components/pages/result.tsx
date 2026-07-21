import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { calculateTotalScore } from "../../functions/score";
import type { GameResultData } from "../../functions/score";
import { COLORS } from "../../styles/colors";

interface ResultProps {
  setGamestate: (state: string) => void;
  gameResult?: GameResultData;
  onRetry?: () => void;
  onGoTitle?: () => void;
  onReset?: () => void;
}

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  position: fixed;
  inset: 0;
  background-color: ${COLORS.primary};
  color: #1E293B;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  box-sizing: border-box;
  overflow-y: auto;
  z-index: 9999;
`;

const Card = styled.div`
  width: 100%;
  max-width: 440px;
  background-color: #FFFFFF;
  border: 2px solid #1E293B;
  border-radius: 24px;
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  box-sizing: border-box;
  animation: ${fadeIn} 0.3s ease-out;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
`;

const HeaderTitle = styled.h1`
  margin: 0;
  font-size: 24px;
  letter-spacing: 3px;
  color: #1E293B;
  font-weight: 800;
`;

const ScoreSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 18px 0;
  background-color: #F8FAFC;
  border-radius: 16px;
  border: 1px solid #E2E8F0;
`;

const ScoreSubTitle = styled.span`
  font-size: 13px;
  color: #64748B;
  letter-spacing: 2px;
  font-weight: 700;
`;

const ScoreValue = styled.span`
  font-size: 44px;
  font-weight: 900;
  color: ${COLORS.accent};
  font-variant-numeric: tabular-nums;
  margin-top: 4px;
  line-height: 1;
`;

const BreakdownContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const BreakdownHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
`;

const BreakdownTitle = styled.div`
  font-size: 14px;
  color: #64748B;
  font-weight: 700;
  letter-spacing: 1px;
`;

const TotalKills = styled.div`
  font-size: 16px;
  font-weight: 800;
  color: #1E293B;
`;

const BreakdownItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #F8FAFC;
  padding: 14px 18px;
  border-radius: 14px;
  border: 1px solid #CBD5E1;
`;

const ItemLabel = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #1E293B;
`;

const ItemCount = styled.div`
  font-size: 18px;
  font-weight: 800;
  color: #1E293B;
  font-variant-numeric: tabular-nums;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  width: 100%;
  margin-top: 4px;
`;

const SecondaryBtn = styled.button`
  flex: 1;
  padding: 14px;
  border-radius: 30px;
  border: 2px solid #1E293B;
  background-color: #FFFFFF;
  color: #1E293B;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s ease, background-color 0.15s ease;

  &:hover {
    background-color: #F1F5F9;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const PrimaryBtn = styled.button`
  flex: 1.5;
  padding: 14px;
  border-radius: 30px;
  border: none;
  background-color: ${COLORS.accent};
  color: #FFFFFF;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.15s ease;

  &:hover {
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(1px) scale(0.98);
  }
`;

export const Result: React.FC<ResultProps> = ({
  setGamestate,
  gameResult = { normalKills: 12, bossKills: 2 },
  onRetry,
  onGoTitle,
  onReset,
}) => {
  const targetTotalScore = calculateTotalScore(gameResult);
  const [displayedScore, setDisplayedScore] = useState<number>(0);

  useEffect(() => {
    let animationFrameId: number;
    const startTime = performance.now();
    const duration = 2000;

    const animateScore = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      const easeOutProgress = 1 - Math.pow(1 - progress, 3);
      const currentScore = Math.floor(easeOutProgress * targetTotalScore);

      setDisplayedScore(currentScore);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animateScore);
      } else {
        setDisplayedScore(targetTotalScore);
      }
    };

    animationFrameId = requestAnimationFrame(animateScore);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [targetTotalScore]);

  const totalKills = gameResult.normalKills + gameResult.bossKills;

  return (
    <Container>
      <Card>
        <HeaderTitle>ゲーム結果</HeaderTitle>

        <ScoreSection>
          <ScoreSubTitle>最終スコア</ScoreSubTitle>
          <ScoreValue>{displayedScore.toLocaleString()}</ScoreValue>
        </ScoreSection>

        <BreakdownContainer>
          <BreakdownHeader>
            <BreakdownTitle>倒した敵の数</BreakdownTitle>
            <TotalKills>合計 {totalKills} 体</TotalKills>
          </BreakdownHeader>

          <BreakdownItem>
            <ItemLabel>ノーマル敵</ItemLabel>
            <ItemCount>{gameResult.normalKills} 体</ItemCount>
          </BreakdownItem>

          <BreakdownItem>
            <ItemLabel>ボス敵</ItemLabel>
            <ItemCount>{gameResult.bossKills} 体</ItemCount>
          </BreakdownItem>
        </BreakdownContainer>

        <ButtonGroup>
          <SecondaryBtn
            onClick={() => {
              if (onGoTitle) {
                onGoTitle();
              } else {
                onReset?.();
                setGamestate("title");
              }
            }}
          >
            タイトルへ
          </SecondaryBtn>

          <PrimaryBtn
            onClick={() => {
              if (onRetry) {
                onRetry();
              } else {
                onReset?.();
                setGamestate("register");
              }
            }}
          >
            もう一度プレイ
          </PrimaryBtn>
        </ButtonGroup>
      </Card>
    </Container>
  );
};

