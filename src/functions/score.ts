// スコア計算およびランク評価関連のロジック・型定義

/**
 * 敵撃破数のデータ構造
 */
export interface GameResultData {
  /** ノーマル敵の撃破数 */
  normalKills: number;
  /** ボス敵の撃破数 */
  bossKills: number;
}

/**
 * 初期ゲーム結果データ（ゲームリセット時用）
 */
export const INITIAL_GAME_RESULT: GameResultData = {
  normalKills: 0,
  bossKills: 0,
};

/**
 * ランク評価の型
 */
export type RankType = "S" | "A" | "B" | "C";

/**
 * ランク詳細情報
 */
export interface RankInfo {
  rank: RankType;
  label: string;
  color: string;
  gradient: string;
  shadow: string;
}

/** 1体あたりの獲得点数 */
export const SCORE_PER_NORMAL_KILL = 1000;
export const SCORE_PER_BOSS_KILL = 20000;

/**
 * 撃破数から合計スコアを計算する関数
 * @param result 撃破数データ
 * @returns 合計スコア
 */
export const calculateTotalScore = (result: GameResultData): number => {
  const normalScore = result.normalKills * SCORE_PER_NORMAL_KILL;
  const bossScore = result.bossKills * SCORE_PER_BOSS_KILL;
  return normalScore + bossScore;
};

/**
 * スコアに応じてランク情報を判定・取得する関数
 * @param score 合計スコア
 * @returns ランク詳細情報
 */
export const getRankInfo = (score: number): RankInfo => {
  if (score >= 50000) {
    return {
      rank: "S",
      label: "S RANK - EXCELLENT!",
      color: "#ffd700",
      gradient: "linear-gradient(135deg, #ffe066 0%, #f59e0b 50%, #d97706 100%)",
      shadow: "0 0 25px rgba(245, 158, 11, 0.6)",
    };
  } else if (score >= 30000) {
    return {
      rank: "A",
      label: "A RANK - GREAT!",
      color: "#c084fc",
      gradient: "linear-gradient(135deg, #e879f9 0%, #a855f7 50%, #7e22ce 100%)",
      shadow: "0 0 25px rgba(168, 85, 247, 0.6)",
    };
  } else if (score >= 20000) {
    return {
      rank: "B",
      label: "B RANK - GOOD!",
      color: "#4ade80",
      gradient: "linear-gradient(135deg, #4ade80 0%, #22c55e 50%, #15803d 100%)",
      shadow: "0 0 25px rgba(34, 197, 94, 0.6)",
    };
  } else {
    return {
      rank: "C",
      label: "C RANK - CLEAR",
      color: "#9ca3af",
      gradient: "linear-gradient(135deg, #d1d5db 0%, #9ca3af 50%, #4b5563 100%)",
      shadow: "0 0 20px rgba(156, 163, 175, 0.4)",
    };
  }
};
