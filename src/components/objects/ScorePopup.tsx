import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { Text } from '@react-three/drei';

import { SCORE_PER_NORMAL_KILL } from '../../functions/score';

interface ScorePopupProps {
  position: Vector3;
  score?: number;
}

// 衝突時にスコアテキストを表示して上昇＋フェードアウトさせるエフェクト
export const ScorePopup = ({ position, score = SCORE_PER_NORMAL_KILL }: ScorePopupProps) => {
  const textRef = useRef<any>(null);
  const materialRef = useRef<any>(null);
  const [active, setActive] = useState(true);
  const [targetPosition] = useState(() => position.clone().add(new Vector3(0, 2, 0))); // 2ユニット上に浮上させる

  useFrame(({ camera }, delta) => {
    if (!active) return;

    if (textRef.current) {
      // position.lerp を用いて滑らかに目標値へ移動
      textRef.current.position.lerp(targetPosition, delta * 3);
      
      // テキストの角度を常にカメラと一致させる（ビルボード化）
      textRef.current.quaternion.copy(camera.quaternion);
    }

    if (materialRef.current) {
      // アルファ値（不透明度）を徐々に下げる（フェードアウト）
      materialRef.current.opacity = Math.max(0, materialRef.current.opacity - delta * 0.8);
      if (materialRef.current.opacity <= 0.05) {
        setActive(false); // 完全に透明になったら消滅
      }
    }
  });

  if (!active) return null;

  return (
    <Text
      ref={textRef}
      position={position}
      fontSize={0.4}
      color="#ffd700" // ゴールドカラー
      anchorX="center"
      anchorY="middle"
      raycast={() => null} // レイキャストを完全に無視
    >
      {`+${score}`}
      <meshBasicMaterial ref={materialRef} transparent opacity={1.0} depthWrite={false} />
    </Text>
  );
};
