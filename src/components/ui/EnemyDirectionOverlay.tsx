import React from "react";
import styled, { keyframes } from "styled-components";

export interface OffScreenIndicatorData {
    id: string;
    type: string; // 'boss' | 'normal'
    x: number; // 画面上のX座標 (px)
    y: number; // 画面上のY座標 (px)
    angleDeg: number; // 矢印の向き (度数法)
}

interface EnemyDirectionOverlayProps {
    indicators: OffScreenIndicatorData[];
}

const OverlayContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 90;
  overflow: hidden;
`;

const IndicatorPositioner = styled.div<{ $x: number; $y: number; $glowColor: string }>`
  position: absolute;
  left: ${(props) => props.$x}px;
  top: ${(props) => props.$y}px;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: left 0.05s ease-out, top 0.05s ease-out;
  filter: drop-shadow(0 0 8px ${(props) => props.$glowColor});
`;

const IndicatorRotator = styled.div<{ $angleDeg: number }>`
  transform: rotate(${(props) => props.$angleDeg}deg);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const pulseAnimation = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 0.9;
  }
  50% {
    transform: scale(1.15);
    opacity: 1;
  }
`;

const IndicatorIconContainer = styled.div<{ $isBoss: boolean }>`
  width: ${(props) => (props.$isBoss ? "36px" : "28px")};
  height: ${(props) => (props.$isBoss ? "36px" : "28px")};
  animation: ${pulseAnimation} 1.2s infinite ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const EnemyDirectionOverlay: React.FC<EnemyDirectionOverlayProps> = ({ indicators }) => {
    return (
        <OverlayContainer>
            {indicators.map((ind) => {
                const mainColor = "#FF5555";
                const glowColor = "rgba(255, 85, 85, 0.6)";
                const isBoss = ind.type === "boss";

                return (
                    <IndicatorPositioner
                        key={ind.id}
                        $x={ind.x}
                        $y={ind.y}
                        $glowColor={glowColor}
                    >
                        {/* 回転（rotate）を適用するコンテナ */}
                        <IndicatorRotator $angleDeg={ind.angleDeg}>
                            {/* アニメーション（scale / opacity）を適用するインナーSVGコンテナ */}
                            <IndicatorIconContainer $isBoss={isBoss}>
                                <svg
                                    viewBox="0 0 24 24"
                                    width="100%"
                                    height="100%"
                                    fill="none"
                                    stroke={mainColor}
                                    strokeWidth={isBoss ? "3" : "2.5"}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    {/* スタイリッシュなネオン矢印形状 */}
                                    <polygon
                                        points="12,2 22,20 12,15 2,20"
                                        fill={mainColor}
                                        fillOpacity={0.35}
                                    />
                                </svg>
                            </IndicatorIconContainer>
                        </IndicatorRotator>
                    </IndicatorPositioner>
                );
            })}
        </OverlayContainer>
    );
};

