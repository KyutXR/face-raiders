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

    // 退場（撃破または消滅）した敵を追跡するSet
    const exitedSet = useRef<Set<EnemyInfo>>(new Set());
    const targetDefeatCount = useRef(0);
    const waveTransitionTimeout = useRef<number | null>(null);

    // ステージ切り替え時のリセット処理
    useEffect(() => {
        setCurrentWave(0);
        setCurrentEnemies([]);
        exitedSet.current.clear();
        targetDefeatCount.current = 0;
        if (waveTransitionTimeout.current) {
            clearTimeout(waveTransitionTimeout.current);
            waveTransitionTimeout.current = null;
        }
    }, [stage]);

    // ウェーブクリアおよびステージクリアの判定処理
    const checkWaveClear = () => {
        if (!stagedata) return;

        // 退場（撃破または消去）した敵の数が、ウェーブの総数に達したか判定
        if (exitedSet.current.size >= targetDefeatCount.current) {
            // 次のウェーブがあるか確認
            if (currentWave < stagedata.enemies.length - 1) {
                // 1秒の余韻を置いてから次のウェーブに進める（stateを更新）
                if (waveTransitionTimeout.current) {
                    clearTimeout(waveTransitionTimeout.current);
                }
                waveTransitionTimeout.current = window.setTimeout(() => {
                    setCurrentWave((prev) => prev + 1);
                }, 1000);
            } else if (currentWave === stagedata.enemies.length - 1) {
                // 最後のウェーブの敵をすべて処理し終えた（ステージクリア）
                // 1.5秒の余韻を置いてからリザルト画面に遷移
                if (waveTransitionTimeout.current) {
                    clearTimeout(waveTransitionTimeout.current);
                }
                waveTransitionTimeout.current = window.setTimeout(() => {
                    setGamestate("result");
                }, 1500);
            }
        }
    };

    // ウェーブ番号が更新された時に、新しいウェーブの敵のスポーン＆消去スケジュールを組む
    useEffect(() => {
        if (!stagedata) return;
        
        const waveEnemies = stagedata.enemies[currentWave];
        if (waveEnemies) {
            exitedSet.current.clear(); // 新ウェーブの退場追跡をリセット
            targetDefeatCount.current = waveEnemies.length;

            const timeouts: number[] = [];

            // 各敵の EmergeTime / LeaveTime に応じて時間差で出現・消滅させる
            waveEnemies.forEach((enemy) => {
                const emergeDelay = (enemy.EmergeTime ?? 0) * 1000; // 秒をミリ秒に変換
                const leaveDelay = (enemy.LeaveTime ?? 10) * 1000;

                // 1. 出現タイマーのセット
                const emergeTimer = window.setTimeout(() => {
                    setCurrentEnemies((prev) => {
                        if (!prev.includes(enemy)) {
                            return [...prev, enemy];
                        }
                        return prev;
                    });
                }, emergeDelay);
                timeouts.push(emergeTimer);

                // 2. 消滅（退場）タイマーのセット
                const leaveTimer = window.setTimeout(() => {
                    // 画面上から非表示（除外）にする
                    setCurrentEnemies((prev) => prev.filter((e) => e !== enemy));

                    // 退場セットに追加し、クリア判定を走らせる（既に撃破されている場合は無視）
                    if (!exitedSet.current.has(enemy)) {
                        exitedSet.current.add(enemy);
                        checkWaveClear();
                    }
                }, leaveDelay);
                timeouts.push(leaveTimer);
            });

            // クリーンアップで未発火のタイマーをすべて解除
            return () => {
                timeouts.forEach((t) => clearTimeout(t));
            };
        }
    }, [currentWave, stagedata]);

    // 敵が撃破された時に呼び出されるコールバック
    const handleEnemyDefeat = (enemy: EnemyInfo) => {
        if (!exitedSet.current.has(enemy)) {
            exitedSet.current.add(enemy);
            checkWaveClear();
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