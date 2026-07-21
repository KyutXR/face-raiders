import React from "react";
import { useFrame } from "@react-three/fiber";
import { enemyRegistry } from "../../functions/enemyRegistry";
import type { OffScreenIndicatorData } from "../ui/EnemyDirectionOverlay";

interface OffScreenIndicatorTrackerProps {
    onUpdateIndicators: (indicators: OffScreenIndicatorData[]) => void;
}

export const OffScreenIndicatorTracker: React.FC<OffScreenIndicatorTrackerProps> = ({ onUpdateIndicators }) => {
    useFrame(({ camera, size }) => {
        const targets = enemyRegistry.getAll();
        if (targets.length === 0) {
            onUpdateIndicators([]);
            return;
        }

        const width = size.width;
        const height = size.height;
        const margin = 42; // 画面端からのオフセット余白 (px)
        const maxX = Math.max(10, width / 2 - margin);
        const maxY = Math.max(10, height / 2 - margin);

        const results: OffScreenIndicatorData[] = [];
        const cameraInverse = camera.matrixWorldInverse;

        targets.forEach((target) => {
            const enemyPos = target.getPosition();
            if (!enemyPos) return;

            // 1. カメラ空間（ビュー空間）への座標変換
            const enemyCamPos = enemyPos.clone().applyMatrix4(cameraInverse);

            // 2. カメラ前・後判定
            const isBehind = enemyCamPos.z > 0;

            // 3. NDC座標（[-1, 1]）への射影変換
            const ndcPos = enemyPos.clone().project(camera);

            // 4. 画面内にあるか判定 (画面内なら矢印インジケーター非表示)
            const isScreenInside =
                !isBehind &&
                Math.abs(ndcPos.x) <= 0.85 &&
                Math.abs(ndcPos.y) <= 0.85;

            if (isScreenInside) {
                return;
            }

            // 5. 敵の相対方向ベクトル (Camera View Space: X=右, Y=上)
            let dirX = enemyCamPos.x;
            let dirY = enemyCamPos.y;

            if (dirX === 0 && dirY === 0) {
                dirY = -1; // 真後ろに完全に一致した場合のフォールバック
            }

            // HTMLスクリーンスペース（Y軸は下向きが正）への調整
            const angleHtml = Math.atan2(-dirY, dirX);

            // 6. 画面縁（長方形領域）との交点計算
            const cos = Math.cos(angleHtml);
            const sin = Math.sin(angleHtml);
            const absCos = Math.abs(cos);
            const absSin = Math.abs(sin);

            let edgeX = 0;
            let edgeY = 0;

            if (maxX * absSin < maxY * absCos) {
                // 左右の画面縁に交差
                edgeX = Math.sign(cos) * maxX;
                edgeY = Math.sign(cos) * maxX * Math.tan(angleHtml);
            } else {
                // 上下の画面縁に交差
                edgeX = Math.sign(sin) * (maxY / Math.tan(angleHtml));
                edgeY = Math.sign(sin) * maxY;
            }

            const screenX = width / 2 + edgeX;
            const screenY = height / 2 + edgeY;

            // 上向き基準(0deg)のSVG矢印に対する回転角度 (deg)
            const angleDeg = (angleHtml * 180) / Math.PI + 90;

            // カメラと敵の3D距離
            results.push({
                id: target.id,
                type: target.type,
                x: screenX,
                y: screenY,
                angleDeg,
            });
        });

        onUpdateIndicators(results);
    });

    return null;
};
