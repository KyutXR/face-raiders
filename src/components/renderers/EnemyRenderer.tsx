import { useEffect, useState, useRef, useMemo } from "react";
import { type EnemyInfo, Enemy } from "../objects/enemy";
import { loadStageInfo } from "../../functions/Load";

interface Props {
    stage: number;
    setGamestate: (state: string) => void;
}

export const Enemyrenderer = ({ stage, setGamestate }: Props) => {
    const stagedata = useMemo(() => loadStageInfo(stage), [stage]);
    
    // 現在のウェーブ番号
    const [currentWave, setCurrentWave] = useState(0);
    // 画面に表示する敵のリスト
    const [currentEnemies, setCurrentEnemies] = useState<EnemyInfo[]>([]);

    const defeatedCount = useRef(0);
    const targetDefeatCount = useRef(0);
    const waveTransitionTimeout = useRef<number | null>(null);

    // ステージ切り替え時のリセット処理
    useEffect(() => {
        setCurrentWave(0);
        setCurrentEnemies([]);
        defeatedCount.current = 0;
        targetDefeatCount.current = 0;
        if (waveTransitionTimeout.current) {
            clearTimeout(waveTransitionTimeout.current);
            waveTransitionTimeout.current = null;
        }
    }, [stage]);

    // ウェーブ番号が更新された時に、新しいウェーブの敵をスポーンさせる
    useEffect(() => {
        if (!stagedata) return;
        
        const waveEnemies = stagedata.enemies[currentWave];
        if (waveEnemies) {
            defeatedCount.current = 0;
            targetDefeatCount.current = waveEnemies.length;

            const timeouts: number[] = [];

            // 各敵の time プロパティに応じて、ウェーブ開始からの時間差で出現させる
            waveEnemies.forEach((enemy) => {
                const enemyWithTime = enemy as unknown as { time?: number };
                const delay = (enemyWithTime.time ?? 0) * 1000; // 秒をミリ秒に変換

                const timer = window.setTimeout(() => {
                    setCurrentEnemies((prev) => [...prev, enemy]);
                }, delay);
                
                timeouts.push(timer);
            });

            // クリーンアップで未発火のタイマーをすべて解除
            return () => {
                timeouts.forEach((t) => clearTimeout(t));
            };
        }
    }, [currentWave, stagedata]);

    // 敵が撃破された時に呼び出されるコールバック
    const handleEnemyDefeat = () => {
        defeatedCount.current += 1;
        
        // そのウェーブのすべての敵を倒したか判定
        if (defeatedCount.current >= targetDefeatCount.current) {
            // 次のウェーブがあるか確認
            if (stagedata && currentWave < stagedata.enemies.length - 1) {
                // 1秒の余韻（落下する時間など）を置いてから次のウェーブに進める
                if (waveTransitionTimeout.current) {
                    clearTimeout(waveTransitionTimeout.current);
                }
                waveTransitionTimeout.current = window.setTimeout(() => {
                    setCurrentWave((prev) => prev + 1);
                }, 1000);
            } else if (stagedata && currentWave === stagedata.enemies.length - 1) {
                // ★ 最後のウェーブの敵をすべて倒した（ステージクリア）
                // 1.5秒の余韻（最後の敵が落下する時間など）を置いてからリザルト画面に遷移
                if (waveTransitionTimeout.current) {
                    clearTimeout(waveTransitionTimeout.current);
                }
                waveTransitionTimeout.current = window.setTimeout(() => {
                    setGamestate("result");
                }, 1500);
            }
        }
    };

    // コンポーネントアンマウント時のタイマークリア
    useEffect(() => {
        return () => {
            if (waveTransitionTimeout.current) {
                clearTimeout(waveTransitionTimeout.current);
            }
        };
    }, []);

    return (
        <>
            {currentEnemies.map((enemy, index) => (
                <Enemy key={index} info={enemy} onDefeat={handleEnemyDefeat} />
            ))}
        </>
    );
};