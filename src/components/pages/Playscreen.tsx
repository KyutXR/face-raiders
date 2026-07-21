import { Canvas } from "@react-three/fiber";
import { useEffect, useRef, useState, useCallback } from "react";
import styled from "styled-components";
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
import { COLORS } from "../../styles/colors";

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

const PlayerAvatarImage = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid ${COLORS.accent};
  object-fit: cover;
`;

const DefaultAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: ${COLORS.accent};
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

export const Playscreen = ({ setGamestate, setGameResult, stageNum, imgUrl }: PlayscreenProps) => {
    const canvasRef = useRef(null);
    const bulletRendererRef = useRef<BulletRendererRef>(null);

    const [playerHp, setPlayerHp] = useState(MAX_HP);
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