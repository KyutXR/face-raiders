import React, { useEffect, useState } from "react";
import {
  calculateTotalScore,
  getRankInfo,
  SCORE_PER_BOSS_KILL,
  SCORE_PER_NORMAL_KILL,
} from "../../functions/score";
import type { GameResultData } from "../../functions/score";

interface ResultProps {
  setGamestate: (state: string) => void;
  gameResult?: GameResultData;
}

/**
 * リザルト画面コンポーネント
 * 最終スコアのカウントアップアニメーション、ランク評価、撃破数内訳を表示する
 */
export const Result: React.FC<ResultProps> = ({
  setGamestate,
  gameResult = { normalKills: 12, bossKills: 2 }, // デフォルトのテスト用撃破データ (12*1000 + 2*20000 = 52,000pt -> Sランク)
}) => {
  // 合計スコアの計算
  const targetTotalScore = calculateTotalScore(gameResult);
  const rankInfo = getRankInfo(targetTotalScore);

  // カウントアップ表示用ステート
  const [displayedScore, setDisplayedScore] = useState<number>(0);
  // アニメーション完了フラグ
  const [isAnimationFinished, setIsAnimationFinished] = useState<boolean>(false);

  useEffect(() => {
    let animationFrameId: number;
    const startTime = performance.now();
    const duration = 2000; // 2秒間でカウントアップ

    const animateScore = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);

      // イージング関数 (easeOutCubic) で後半減速する自然な数位増加
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
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#090d16",
        backgroundImage:
          "radial-gradient(circle at 50% 30%, #1e1b4b 0%, #090d16 70%)",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        boxSizing: "border-box",
        overflowY: "auto",
        zIndex: 9999,
      }}
    >
      {/* メイン結果カード */}
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "24px",
          padding: "32px 24px",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "24px",
        }}
      >
        {/* ヘッダータイトル */}
        <h1
          style={{
            margin: 0,
            fontSize: "28px",
            letterSpacing: "4px",
            textTransform: "uppercase",
            color: "#94a3b8",
            fontWeight: 700,
          }}
        >
          MISSION RESULT
        </h1>

        {/* ランクバッジ表示 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: "8px",
          }}
        >
          <div
            style={{
              width: "90px",
              height: "90px",
              borderRadius: "50%",
              background: rankInfo.gradient,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "52px",
              fontWeight: 900,
              color: "#ffffff",
              boxShadow: rankInfo.shadow,
              textShadow: "0 2px 10px rgba(0,0,0,0.5)",
              transform: isAnimationFinished ? "scale(1)" : "scale(0.9)",
              transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            {rankInfo.rank}
          </div>
          <span
            style={{
              marginTop: "12px",
              fontSize: "14px",
              fontWeight: 600,
              color: rankInfo.color,
              letterSpacing: "1px",
            }}
          >
            {rankInfo.label}
          </span>
        </div>

        {/* スコアカウントアップ表示 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            padding: "16px 0",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              color: "#64748b",
              letterSpacing: "2px",
              fontWeight: 600,
            }}
          >
            TOTAL SCORE
          </span>
          <span
            style={{
              fontSize: "44px",
              fontWeight: 800,
              color: rankInfo.color,
              textShadow: `0 0 20px ${rankInfo.color}66`,
              fontVariantNumeric: "tabular-nums",
              marginTop: "4px",
            }}
          >
            {displayedScore.toLocaleString()}
          </span>
        </div>

        {/* 撃破数内訳UI */}
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              color: "#94a3b8",
              fontWeight: 600,
              letterSpacing: "1px",
              marginBottom: "4px",
            }}
          >
            SCORE BREAKDOWN
          </div>

          {/* ノーマル敵内訳 */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "rgba(255, 255, 255, 0.03)",
              padding: "12px 16px",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.05)",
            }}
          >
            <div>
              <div style={{ fontSize: "14px", fontWeight: 600 }}>
                ノーマル敵 撃破
              </div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>
                {gameResult.normalKills} 体 × {SCORE_PER_NORMAL_KILL.toLocaleString()} pt
              </div>
            </div>
            <div
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "#38bdf8",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              +{normalScore.toLocaleString()}
            </div>
          </div>

          {/* ボス敵内訳 */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "rgba(255, 255, 255, 0.03)",
              padding: "12px 16px",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.05)",
            }}
          >
            <div>
              <div style={{ fontSize: "14px", fontWeight: 600 }}>
                ボス敵 撃破
              </div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>
                {gameResult.bossKills} 体 × {SCORE_PER_BOSS_KILL.toLocaleString()} pt
              </div>
            </div>
            <div
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "#f43f5e",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              +{bossScore.toLocaleString()}
            </div>
          </div>
        </div>

        {/* ボタンアクション */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            width: "100%",
            marginTop: "8px",
          }}
        >
          <button
            onClick={() => setGamestate("title")}
            style={{
              flex: 1,
              padding: "14px",
              borderRadius: "14px",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              color: "#ffffff",
              fontSize: "15px",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            タイトルへ
          </button>
          <button
            onClick={() => setGamestate("register")}
            style={{
              flex: 1.5,
              padding: "14px",
              borderRadius: "14px",
              border: "none",
              background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
              color: "#ffffff",
              fontSize: "15px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)",
              transition: "all 0.2s ease",
            }}
          >
            もう一度プレイ
          </button>
        </div>
      </div>
    </div>
  );
};