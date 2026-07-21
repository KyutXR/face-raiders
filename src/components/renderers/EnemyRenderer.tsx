import { useEffect, useState, useRef, useMemo } from "react";
import { type EnemyInfo, Enemy } from "../objects/enemy";
import { EnemyBullet, type EnemyBulletInfo } from "../objects/EnemyBullet";
import { loadStageInfo } from "../../functions/Load";
import type { GameResultData } from "../../functions/score";
import type * as THREE from "three";
import { playEnemyDefeatSound, playEnemyShootSound } from "../../utils/sound";

interface Props {
    stage: number;
    setGamestate: (state: string) => void;
    setGameResult?: (updater: (prev: GameResultData) => GameResultData) => void;
    onPlayerDamage?: (amount?: number) => void;
}

export const Enemyrenderer = ({ stage, setGamestate, setGameResult, onPlayerDamage }: Props) => {
    const stagedata = useMemo(() => loadStageInfo(stage), [stage]);
    
    // 現在のウェーブ番号
    const [currentWave, setCurrentWave] = useState(0);
    // 画面に表示する敵のリスト
    const [currentEnemies, setCurrentEnemies] = useState<EnemyInfo[]>([]);
    // 画面に表示する敵弾のリスト
    const [enemyBullets, setEnemyBullets] = useState<EnemyBulletInfo[]>([]);

    // 退場（撃破または消滅）した敵を追跡するSet
    const exitedSet = useRef<Set<EnemyInfo>>(new Set());
    const targetDefeatCount = useRef(0);
    const waveTransitionTimeout = useRef<number | null>(null);

    // ステージ切り替え時のリセット処理
    useEffect(() => {
        setCurrentWave(0);
        setCurrentEnemies([]);
        setEnemyBullets([]);
        exitedSet.current.clear();
        targetDefeatCount.current = 0;
        if (waveTransitionTimeout.current) {
            clearTimeout(waveTransitionTimeout.current);
            waveTransitionTimeout.current = null;
        }
    }, [stage]);

    // 敵から弾が発射されたときのハンドラ
    const handleShootBullet = (startPos: THREE.Vector3, direction: THREE.Vector3) => {
        // 敵弾発射音を再生
        playEnemyShootSound();

        const newBullet: EnemyBulletInfo = {
            id: Math.random().toString(36).substring(2, 9),
            startPosition: startPos.clone(),
            direction: direction.clone(),
        };
        setEnemyBullets((prev) => [...prev, newBullet]);
    };

    // 敵弾が消滅したときのハンドラ
    const handleDestroyEnemyBullet = (id: string) => {
        setEnemyBullets((prev) => prev.filter((b) => b.id !== id));
    };

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

    // 敵が自弾で撃破された時に呼び出されるコールバック
    const handleEnemyDefeat = (enemy: EnemyInfo) => {
        if (!exitedSet.current.has(enemy)) {
            // 撃破音を再生
            playEnemyDefeatSound();

            exitedSet.current.add(enemy);
            if (setGameResult) {
                setGameResult((prev) => {
                    if (enemy.type === "boss") {
                        return { ...prev, bossKills: prev.bossKills + 1 };
                    }
                    return { ...prev, normalKills: prev.normalKills + 1 };
                });
            }
            checkWaveClear();
        }
    };

    // 敵がプレイヤーに突進・激突した時に呼び出されるコールバック
    const handleEnemyCollidePlayer = (enemy: EnemyInfo) => {
        // プレイヤーにダメージを与える
        onPlayerDamage?.(1);

        // 倒したスコア（撃破数）は加算せず、退場扱いにしてウェーブクリア判定のみ行う
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
                <Enemy 
                    key={index} 
                    info={enemy} 
                    onDefeat={handleEnemyDefeat}
                    onCollidePlayer={handleEnemyCollidePlayer}
                    onShootBullet={handleShootBullet}
                />
            ))}

            {enemyBullets.map((bullet) => (
                <EnemyBullet
                    key={bullet.id}
                    info={bullet}
                    onHitPlayer={() => onPlayerDamage?.(1)}
                    onDestroy={handleDestroyEnemyBullet}
                />
            ))}
        </>
    );
};