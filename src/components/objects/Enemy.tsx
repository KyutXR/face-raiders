import { useEffect, useState } from 'react';
import * as THREE from 'three';

// 敵コンポーネントのPropsインターフェース
export interface EnemyProps {
  // テクスチャとして使用する顔画像のDataURL（Base64）。指定がない場合はlocalStorageから読み込みます。
  faceDataUrl?: string;
  // 3D空間上の配置位置 [x, y, z]
  position?: [number, number, number];
  // 3D空間上の回転 [x, y, z]（ラジアン）
  rotation?: [number, number, number];
  // 3D空間上のスケール（数値または [x, y, z]）
  scale?: number | [number, number, number];
}

// 前面半球（UV x: 0.25〜0.75, y: 0〜1.0）に顔画像を配置し、背面をベースカラーにする関数
const createHemisphereFaceTexture = (faceImage?: HTMLImageElement | null): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // 1. 全体をベースカラー（オレンジ）で塗りつぶし
    ctx.fillStyle = '#ff7f50';
    ctx.fillRect(0, 0, 512, 512);

    // 前面半球の描画領域: x: 128 〜 384 (幅256px), y: 0 〜 512 (高さ512px 全高)
    const startX = 128;
    const startY = 0;
    const targetW = 256;
    const targetH = 512;

    if (faceImage && faceImage.width > 0 && faceImage.height > 0) {
      // 2. 画像のアスペクト比を保持して前面ドーム全体に描画
      const imgAspect = faceImage.width / faceImage.height;
      const targetAspect = targetW / targetH; // 0.5

      let drawW = targetW;
      let drawH = targetH;
      let offsetX = startX;
      let offsetY = startY;

      if (imgAspect > targetAspect) {
        // 横長画像
        drawH = targetH;
        drawW = targetH * imgAspect;
        offsetX = startX - (drawW - targetW) / 2;
      } else {
        // 縦長画像
        drawW = targetW;
        drawH = targetW / imgAspect;
        offsetY = startY - (drawH - targetH) / 2;
      }

      ctx.save();
      // 前面ドーム領域にクリッピング
      ctx.beginPath();
      ctx.rect(startX, startY, targetW, targetH);
      ctx.clip();

      // 画像を正位置描画
      ctx.drawImage(faceImage, offsetX, offsetY, drawW, drawH);
      ctx.restore();
    } else {
      // 3. 顔画像が無い場合は正面中央にスマイリー顔を描画
      ctx.fillStyle = '#ffcc00';
      ctx.beginPath();
      ctx.arc(256, 256, 110, 0, Math.PI * 2);
      ctx.fill();

      // 目
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(200, 220, 18, 0, Math.PI * 2);
      ctx.arc(312, 220, 18, 0, Math.PI * 2);
      ctx.fill();

      // 口
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.arc(256, 270, 45, 0, Math.PI);
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

export const Enemy = ({
  faceDataUrl,
  position = [0, 0, 0],
  rotation = [0, -Math.PI / 2, 0], // 元の状態の回転設定
  scale = 1,
}: EnemyProps) => {
  // 初期状態としてデフォルトの半球テクスチャをセット
  const [texture, setTexture] = useState<THREE.Texture>(() => createHemisphereFaceTexture(null));

  // 初回およびfaceDataUrl変更時にテクスチャをロード
  useEffect(() => {
    const targetUrl = faceDataUrl || localStorage.getItem('user_face_image');
    if (!targetUrl) return;

    let isMounted = true;
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = targetUrl;
    img.onload = () => {
      if (isMounted) {
        const hemisphereTex = createHemisphereFaceTexture(img);
        setTexture(hemisphereTex);
      }
    };

    return () => {
      isMounted = false;
    };
  }, [faceDataUrl]);

  return (
    <mesh position={position} rotation={rotation} scale={scale}>
      {/* 半径0.5の球体ジオメトリ */}
      <sphereGeometry args={[0.5, 32, 32]} />
      {/* 前面半球に顔、背面半球にベースカラーが塗られたマテリアル */}
      <meshStandardMaterial
        key={texture.id}
        map={texture}
        roughness={0.4}
        metalness={0.1}
      />
    </mesh>
  );
};
