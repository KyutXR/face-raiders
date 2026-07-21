import { useState, useRef } from 'react';
import ReactCrop, { type Crop } from 'react-image-crop';
import styled from 'styled-components';
import 'react-image-crop/dist/ReactCrop.css';

//画像パス、サンプルのためpublic直下に配置、変更可能
const IMAGE_SRC = '/sample.png';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
`;

const TargetImage = styled.img`
  max-height: 400px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const ActionButton = styled.button`
  padding: 8px 16px;
`;

const CroppedResultImage = styled.img`
  border-radius: 50%;
  border: 1px solid #ccc;
`;

export const Photo = ({ setGamestate, onPhotoCropped }: { setGamestate: (state: string) => void; onPhotoCropped: (imageUrl: string) => void; }) => {
  //切り抜き領域の設定(四角形)
  const [crop, setCrop] = useState<Crop>({ unit: 'px', x: 0, y: 0, width: 200, height: 200 });
  //切りぬき後の画像url
  const [croppedUrl, setCroppedUrl] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  //切り取るボタンの関数
  const handleCrop = () => {
    const img = imgRef.current;
    if (!img || !crop.width || !crop.height) return;
    //canvas設定
    const canvas = document.createElement('canvas');
    canvas.width = crop.width;
    canvas.height = crop.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 円形にクリップ（切り抜き）
    ctx.beginPath();
    ctx.arc(crop.width / 2, crop.height / 2, crop.width / 2, 0, Math.PI * 2);
    ctx.clip();

    // 実際の画像サイズと表示サイズの比率を計算
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    // 画像の描画
    ctx.drawImage(
      //第1引数：元画像、2～5引数：切り抜き元の座標とサイズ、6～9引数：描画先の座標とサイズ
      img,
      crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY,
      0, 0, crop.width, crop.height
    );

    // 描画データを出力、形式はpng、urlを作成し親コンポーネントに渡している
    canvas.toBlob(blob => {
      if (!blob) return;
      if (croppedUrl) URL.revokeObjectURL(croppedUrl); 
      const newUrl = URL.createObjectURL(blob);
      setCroppedUrl(newUrl);
      onPhotoCropped(newUrl);
    }, 'image/png');
  };

  return (
    <Container>
      <h3>顔を切り抜き</h3>
      
      <ReactCrop crop={crop} onChange={setCrop} aspect={1} circularCrop keepSelection>
        <TargetImage ref={imgRef} src={IMAGE_SRC} alt="対象" />
      </ReactCrop>

      <ButtonGroup>
        <ActionButton onClick={handleCrop}>切り取る</ActionButton>
        <ActionButton onClick={() => setGamestate('play')}>次へ進む</ActionButton>
      </ButtonGroup>

      {croppedUrl && (
        <CroppedResultImage src={croppedUrl} alt="結果" />
      )}
    </Container>
  );
};