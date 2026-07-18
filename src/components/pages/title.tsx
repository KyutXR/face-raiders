export const Title = ({ 
  setGamestate, 
  setStageNum 
}: { 
  setGamestate: (state: string) => void; 
  setStageNum: (num: number) => void;
}) => {
  const selectStage = (num: number) => {
    setStageNum(num);
    setGamestate("register"); // ステージを選択して登録画面へ遷移
  };

  return(
    <div>
      <h1>タイトル</h1>
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button onClick={() => selectStage(1)}>Stage 1</button>
        <button onClick={() => selectStage(2)}>Stage 2</button>
      </div>
    </div>
  );
};