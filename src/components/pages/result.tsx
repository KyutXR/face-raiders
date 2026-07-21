import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import {
  calculateTotalScore,
  getRankInfo,
  SCORE_PER_BOSS_KILL,
  SCORE_PER_NORMAL_KILL,
} from "../../functions/score";
import type { GameResultData } from "../../functions/score";
import { COLORS } from "../../styles/colors";

interface ResultProps {
  setGamestate: (state: string) => void;
  gameResult?: GameResultData;
  /** 「もう一度遊ぶ」ボタン押下時のコールバック（状態リセット＋遷移） */
  onRetry?: () => void;
  /** 「タイトルへ」ボタン押下時のコールバック（状態リセット＋遷移） */
  onGoTitle?: () => void;
  /** ゲーム状態リセット用関数 */
  onReset?: () => void;
}

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  position: fixed;
  inset: 0;
  background-color: #0F172A;
  color: ${COLORS.primary};
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
  max-width: 480px;
  background-color: #1E293B;
  border: 2px solid #334155;
  border-radius: 24px;
  padding: 28px 20px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  box-sizing: border-box;
  animation: ${fadeIn} 0.3s ease-out;
`;

const HeaderTitle = styled.h1`
  margin: 0;
  font-size: 24px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: ${COLORS.primary};
  font-weight: 800;
`;

const RankContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const RankBadge = styled.div<{ $isFinished: boolean }>`
  width: 84px;
  height: 84px;
  border-radius: 50%;
  background-color: ${COLORS.accent};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: 900;
  color: #0F172A;
  box-shadow: 0 6px 20px rgba(255, 116, 116, 0.4);
  transform: ${(props) => (props.$isFinished ? "scale(1)" : "scale(0.9)")};
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
`;

const RankLabel = styled.span`
  margin-top: 10px;
  font-size: 14px;
  font-weight: 700;
  color: ${COLORS.primary};
  letter-spacing: 1px;
`;

const ScoreSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 14px 0;
  border-top: 1px solid #334155;
  border-bottom: 1px solid #334155;
`;

const ScoreSubTitle = styled.span`
  font-size: 12px;
  color: #94A3B8;
  letter-spacing: 2px;
  font-weight: 700;
`;

const ScoreValue = styled.span`
  font-size: 40px;
  font-weight: 800;
  color: ${COLORS.accent};
  font-variant-numeric: tabular-nums;
  margin-top: 2px;
`;

const BreakdownContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const BreakdownTitle = styled.div`
  font-size: 13px;
  color: #94A3B8;
  font-weight: 700;
  letter-spacing: 1px;
`;

const BreakdownItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #0F172A;
  padding: 12px 16px;
  border-radius: 14px;
  border: 1px solid #334155;
`;

const ItemLabel = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: ${COLORS.primary};
`;

const ItemSubText = styled.div`
  font-size: 12px;
  color: #94A3B8;
`;

const ItemPoints = styled.div`
  font-size: 16px;
  font-weight: 800;
  color: ${COLORS.primary};
  font-variant-numeric: tabular-nums;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  width: 100%;
  margin-top: 6px;
`;

const SecondaryBtn = styled.button`
  flex: 1;
  padding: 14px;
  border-radius: 30px;
  border: none;
  background-color: #334155;
  color: ${COLORS.primary};
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #475569;
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
  color: #0F172A;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(255, 116, 116, 0.35);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 116, 116, 0.5);
  }

  &:active {
    transform: translateY(1px) scale(0.98);
  }
`;

/**
 * リザルト画面コンポーネント
 * 最終スコアのカウントアップアニメーション、ランク評価、撃破数内訳を表示する
 */
export const Result: React.FC<ResultProps> = ({
  setGamestate,
  gameResult = { normalKills: 12, bossKills: 2 },
  onRetry,
  onGoTitle,
  onReset,
}) => {
  const targetTotalScore = calculateTotalScore(gameResult);
  const rankInfo = getRankInfo(targetTotalScore);

  const [displayedScore, setDisplayedScore] = useState<number>(0);
  const [isAnimationFinished, setIsAnimationFinished] = useState<boolean>(false);

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
        setIsAnimationFinished(true);
      }
    };

    animationFrameId = requestAnimationFrame(animateScore);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [targetTotalScore]);

  const normalScore = gameResult.normalKills * SCORE_PER_NORMAL_KILL;
  const bossScore = gameResult.bossKills * SCORE_PER_BOSS_KILL;

  return (
    <Container>
      <Card>
        <HeaderTitle>MISSION RESULT</HeaderTitle>

        <RankContainer>
          <RankBadge $isFinished={isAnimationFinished}>
            {rankInfo.rank}
          </RankBadge>
          <RankLabel>{rankInfo.label}</RankLabel>
        </RankContainer>

        <ScoreSection>
          <ScoreSubTitle>TOTAL SCORE</ScoreSubTitle>
          <ScoreValue>{displayedScore.toLocaleString()}</ScoreValue>
        </ScoreSection>

        <BreakdownContainer>
          <BreakdownTitle>SCORE BREAKDOWN</BreakdownTitle>

          <BreakdownItem>
            <div>
              <ItemLabel>ノーマル敵 撃破</ItemLabel>
              <ItemSubText>
                {gameResult.normalKills} 体 × {SCORE_PER_NORMAL_KILL.toLocaleString()} pt
              </ItemSubText>
            </div>
            <ItemPoints>+{normalScore.toLocaleString()}</ItemPoints>
          </BreakdownItem>

          <BreakdownItem>
            <div>
              <ItemLabel>ボス敵 撃破</ItemLabel>
              <ItemSubText>
                {gameResult.bossKills} 体 × {SCORE_PER_BOSS_KILL.toLocaleString()} pt
              </ItemSubText>
            </div>
            <ItemPoints>+{bossScore.toLocaleString()}</ItemPoints>
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
