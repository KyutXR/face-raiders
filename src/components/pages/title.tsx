import styled from "styled-components";

export const Title = ({ setGamestate, setStageNum }: { setGamestate: (state: string) => void, setStageNum: (num: number) => void }) => {

  const TitleWrapper = styled.div`
    position: relative;
    width: 100vw;
    height: 100vh;

  `

  const Logo = styled.img`
    position: absolute;
    width: 100%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    `

  const selectStage = (num: number) => {
    setStageNum(num);
    setGamestate("register"); // ステージを選択して登録画面へ遷移
  };

  return (
    <TitleWrapper>
      <Logo src="/logo.svg" alt="logo" />
      <button onClick={() => selectStage(1)}>Stage 1</button>
      <button onClick={() => selectStage(2)}>Stage 2</button>
    </TitleWrapper>

  );
};