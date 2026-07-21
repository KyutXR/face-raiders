import { Vector3 } from 'three';
import { type JsonInfo } from '../components/Gamemanager';
import { type EnemyInfo } from '../components/objects/enemy';
import stageInfoData from '../StageInfo.json';

// JSON上の敵情報の型定義（positionはnumber[]）
interface RawEnemyInfo {
  EmergeTime: number;
  LeaveTime: number;
  type: string;
  position: number[];
  Movement: string[];
}

// JSON上のステージ情報の型定義
interface RawStageInfo {
  waves: number;
  LimitTime: number;
  enemies: RawEnemyInfo[][];
}

interface RawStageDataCollection {
  [key: string]: RawStageInfo;
}

/**
 * 指定されたステージ番号の情報をStageInfo.jsonから読み込み、
 * EnemyInfoのpositionをVector3に変換して返します。
 * @param stageNum ステージ番号
 * @returns ステージ情報。見つからない場合はnullを返します。
 */
export const loadStageInfo = (stageNum: number): JsonInfo | null => {
  const data = stageInfoData as unknown as RawStageDataCollection;
  const stageKey = stageNum.toString();

  const rawStage = data[stageKey];
  if (!rawStage) {
    console.warn(`Stage ${stageNum} not found in StageInfo.json`);
    return null;
  }

  // RawEnemyInfo[][] から EnemyInfo[][] へ変換
  const enemies: EnemyInfo[][] = rawStage.enemies.map((wave) =>
    wave
      .filter((rawEnemy) => rawEnemy && Array.isArray(rawEnemy.position)) // 防御処理：positionが無い・不正な要素を除外
      .map((rawEnemy) => {
        const pos = rawEnemy.position;
        return {
          EmergeTime: rawEnemy.EmergeTime ?? 0,
          LeaveTime: rawEnemy.LeaveTime ?? 10,
          type: rawEnemy.type || 'normal',
          // [x, y, z] の配列から Three.js の Vector3 を生成
          position: new Vector3(pos[0] ?? 0, pos[1] ?? 0, pos[2] ?? 0),
          Movement: Array.isArray(rawEnemy.Movement) ? rawEnemy.Movement : [],
        };
      })
  );

  return {
    waves: rawStage.waves,
    LimitTime: rawStage.LimitTime,
    enemies: enemies,
  };
};
