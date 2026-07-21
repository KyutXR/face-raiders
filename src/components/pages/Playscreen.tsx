import { Canvas } from "@react-three/fiber";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import styled, { keyframes, css } from "styled-components";
import { OrbitControls, Stars, Text } from "@react-three/drei";
import { GyroCameraController } from "../../functions/GyroCameraController";
import { CameraBackground } from "../../functions/CameraBackground";
import { DeviceOrientationPermissionGate } from "../DeviceOrientationPermissionGate";
import { BulletRenderer } from "../renderers/BulletRenderer";
import type { BulletRendererRef } from "../renderers/BulletRenderer";
import { Physics } from "@react-three/rapier";
import { Enemyrenderer } from "../renderers/EnemyRenderer";
import { INITIAL_GAME_RESULT, type GameResultData } from "../../functions/score";
import { EnemyDirectionOverlay } from "../ui/EnemyDirectionOverlay";
import type { OffScreenIndicatorData } from "../ui/EnemyDirectionOverlay";
import { OffScreenIndicatorTracker } from "../renderers/OffScreenIndicatorTracker";
import { enemyRegistry } from "../../functions/enemyRegistry";
import { loadStageInfo } from "../../functions/Load";

interface PlayscreenProps {
    setGamestate: (state: string) => void;
    setGameResult?: (result: GameResultData | ((prev: GameResultData) => GameResultData)) => void;
    stageNum: number;
    imgUrl?: string | null;
}

const MAX_HP = 5;

const CanvasContainer = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
`;

const DamageFlashOverlay = styled.div<{ $isFlashing: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 30, 30, 0.4);
  box-shadow: inset 0 0 100px rgba(255, 0, 0, 0.8);
  pointer-events: none;
  z-index: 95;
  transition: opacity 0.15s ease-out;
  opacity: ${(props) => (props.$isFlashing ? 1 : 0)};
`;

const PlayerInfoCard = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  padding: 8px 16px 8px 8px;
  border-radius: 30px;
  border: 1px solid rgba(255, 116, 116, 0.4);
  z-index: 100;
  user-select: none;
`;

const HeartContainer = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
`;

const HeartIcon = styled.span<{ $isActive: boolean }>`
  font-size: 22px;
  filter: ${(props) => (props.$isActive ? "drop-shadow(0 0 6px #FF4D4D)" : "none")};
  opacity: ${(props) => (props.$isActive ? 1 : 0.25)};
  transition: all 0.3s ease;
  transform: ${(props) => (props.$isActive ? "scale(1)" : "scale(0.85)")};
`;

const timerPulseAnimation = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 0 10px rgba(255, 77, 77, 0.4);
  }
  50% {
    transform: scale(1.06);
    box-shadow: 0 0 25px rgba(255, 77, 77, 0.85);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 10px rgba(255, 77, 77, 0.4);
  }
`;

const TimerCard = styled.div<{ $isWarning: boolean }>`
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(8px);
  padding: 8px 18px;
  border-radius: 30px;
  border: 1px solid ${(props) => (props.$isWarning ? "rgba(255, 77, 77, 0.8)" : "rgba(255, 255, 255, 0.25)")};
  z-index: 100;
  user-select: none;
  transition: border-color 0.3s ease, color 0.3s ease;
  ${(props) =>
    props.$isWarning &&
    css`
      animation: ${timerPulseAnimation} 1s infinite ease-in-out;
    `}
`;

const TimerText = styled.span<{ $isWarning: boolean }>`
  font-family: 'Inter', 'Roboto', sans-serif;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 1px;
  color: ${(props) => (props.$isWarning ? "#FF4D4D" : "#FFFFFF")};
  text-shadow: ${(props) => (props.$isWarning ? "0 0 10px rgba(255, 77, 77, 0.8)" : "0 0 4px rgba(255, 255, 255, 0.5)")};
`;

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const Playscreen = ({ setGamestate, setGameResult, stageNum }: PlayscreenProps) => {
    const canvasRef = useRef(null);
    const bulletRendererRef = useRef<BulletRendererRef>(null);

    const stagedata = useMemo(() => loadStageInfo(stageNum), [stageNum]);
    const limitTime = stagedata?.LimitTime ?? 60;

    const [playerHp, setPlayerHp] = useState(MAX_HP);
    const [timeLeft, setTimeLeft] = useState(limitTime);
    const [isDamageFlashing, setIsDamageFlashing] = useState(false);
    const [offScreenIndicators, setOffScreenIndicators] = useState<OffScreenIndicatorData[]>([]);
    const isGameOverRef = useRef(false);

    useEffect(() => {
        if (setGameResult) {
            setGameResult(INITIAL_GAME_RESULT);
        }
        return () => {
            enemyRegistry.clear();
        };
    }, [setGameResult]);

    // カウントダウンタイマー
    useEffect(() => {
        const initialTime = stagedata?.LimitTime ?? 60;
        setTimeLeft(initialTime);

        const timerId = setInterval(() => {
            if (isGameOverRef.current) return;

            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerId);
                    if (!isGameOverRef.current) {
                        isGameOverRef.current = true;
                        setTimeout(() => {
                            setGamestate("result");
                        }, 500);
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            clearInterval(timerId);
        };
    }, [stagedata, setGamestate]);

    // プレイヤーがダメージを受けた時のハンドラ
    const handlePlayerDamage = useCallback((amount = 1) => {
        if (isGameOverRef.current) return;

        // 赤色フラッシュ演出
        setIsDamageFlashing(true);
        setTimeout(() => {
            setIsDamageFlashing(false);
        }, 400);

        setPlayerHp((prevHp) => {
            const nextHp = Math.max(0, prevHp - amount);
            if (nextHp <= 0 && !isGameOverRef.current) {
                isGameOverRef.current = true;
                // HPが0になった場合、少し待ってリザルト画面に遷移
                setTimeout(() => {
                    setGamestate("result");
                }, 800);
            }
            return nextHp;
        });
    }, [setGamestate]);

    const onCanvasClick = () => {
        bulletRendererRef.current?.shoot(); // 画面クリックで弾を発射する
    };

    const isWarning = timeLeft <= 10;

    return (
        <DeviceOrientationPermissionGate>
            <CanvasContainer id="CanvasContainer">

                {/* 被弾時の画面赤色フラッシュオーバーレイ */}
                <DamageFlashOverlay $isFlashing={isDamageFlashing} />

                {/* プレイヤー情報（顔写真 & HP表示） */}
                <PlayerInfoCard>

                    {/* HP ハート表示 */}
                    <HeartContainer>
                        {Array.from({ length: MAX_HP }).map((_, i) => (
                            <HeartIcon key={i} $isActive={i < playerHp}>
                                ❤️
                            </HeartIcon>
                        ))}
                    </HeartContainer>
                </PlayerInfoCard>

                {/* ステージ制限時間タイマー表示 */}
                <TimerCard $isWarning={isWarning}>
                    <TimerText $isWarning={isWarning}>{formatTime(timeLeft)}</TimerText>
                </TimerCard>

                {/* 画面外敵方向矢印オーバーレイ */}
                <EnemyDirectionOverlay indicators={offScreenIndicators} />

                <Canvas
                    ref={canvasRef}
                    shadows={'soft'}
                    onClick={onCanvasClick}
                >
                    <Physics>
                        <CameraBackground />
                        <ambientLight />
                        <pointLight position={[0, 0, 0]} />
                        <GyroCameraController />
                        <BulletRenderer ref={bulletRendererRef} />
                        <Enemyrenderer
                            stage={stageNum}
                            setGamestate={setGamestate}
                            setGameResult={setGameResult}
                            onPlayerDamage={handlePlayerDamage}
                        />
                        <OffScreenIndicatorTracker onUpdateIndicators={setOffScreenIndicators} />
                        <Stars
                            radius={100} // 星の点滅(拡大)度合い
                            depth={50} // 星の深さ
                            count={5000} // 星の数
                            factor={12} // 星の大きさ
                            saturation={9} // 星の彩度
                            speed={3} // 点滅のスピード
                        />
                    </Physics>
                    <OrbitControls />

                    {/* スコアテキスト(ScorePopup)のフォントアセット・シェーダーの初回読込によるフリーズ(Jank)を防ぐプリロード用ダミー */}
                    <Text visible={false}>Preload Font</Text>
                </Canvas>
                <div className="crosshair"></div>
            </CanvasContainer>
        </DeviceOrientationPermissionGate>
    );
};