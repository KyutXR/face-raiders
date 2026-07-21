import React from "react";

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

export const EnemyDirectionOverlay: React.FC<EnemyDirectionOverlayProps> = ({ indicators }) => {
    return (
        <div
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                zIndex: 90,
                overflow: "hidden",
            }}
        >
            {indicators.map((ind) => {
                const mainColor = "#FF5555";
                const glowColor = "rgba(255, 85, 85, 0.6)";
                const isBoss = ind.type === "boss";

                return (
                    <div
                        key={ind.id}
                        style={{
                            position: "absolute",
                            left: `${ind.x}px`,
                            top: `${ind.y}px`,
                            transform: "translate(-50%, -50%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "left 0.05s ease-out, top 0.05s ease-out",
                            filter: `drop-shadow(0 0 8px ${glowColor})`,
                        }}
                    >
                        {/* 回転（rotate）を適用するコンテナ */}
                        <div
                            style={{
                                transform: `rotate(${ind.angleDeg}deg)`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            {/* アニメーション（scale / opacity）を適用するインナーSVGコンテナ */}
                            <div
                                style={{
                                    width: isBoss ? "36px" : "28px",
                                    height: isBoss ? "36px" : "28px",
                                    animation: "pulseIndicator 1.2s infinite ease-in-out",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
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
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
