import * as THREE from 'three';
import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

// 3D側からいつでもアクセスできる「顔データストア」
export const faceDataStore = {
  // 生の478点座標配列（初期値は空）
  rawLandmarks: [] as NormalizedLandmark[],
  
  // 3D用に計算・加工済みの中心座標や回転データ（後から使いやすくするため）
  headPosition: new THREE.Vector3(),
  headRotation: new THREE.Euler(),
  
  // 検出中かどうかのフラグ
  isDetected: false,

  // クロップされた顔の画像URLおよびThree.jsテクスチャ
  croppedFaceUrl: null as string | null,
  croppedFaceTexture: null as THREE.Texture | null,

  // 切り抜かれた顔画像を登録し、Three.js用テクスチャを自動生成して保存
  setCroppedFace(imageUrl: string) {
    this.croppedFaceUrl = imageUrl;
    const loader = new THREE.TextureLoader();
    loader.load(imageUrl, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      this.croppedFaceTexture = texture;
    });
  }
};
