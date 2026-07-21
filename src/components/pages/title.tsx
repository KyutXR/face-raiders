import styled from "styled-components";

export const Title = ({ setGamestate }: { setGamestate: (state: string) => void }) => {
  const TitleWrapper = styled.div`
    position: relative;
    width: 100vw;
    height: 100vh;
    background: radial-gradient(circle at center, #1a233a 0%, #0a0e17 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  `;

  const Logo = styled.img`
    position: absolute;
    width: 80%;
    max-width: 500px;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
  `;

  const StartButton = styled.button`
    position: absolute;
    bottom: 20%;
    padding: 16px 48px;
    font-size: 20px;
    font-weight: 800;
    letter-spacing: 2px;
    color: #080d1a;
    background: linear-gradient(135deg, #00ffff 0%, #00ff88 100%);
    border: none;
    border-radius: 40px;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(0, 255, 255, 0.4);
    transition: all 0.2s ease-in-out;

    &:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 28px rgba(0, 255, 255, 0.7);
    }

    &:active {
      transform: scale(0.98);
    }
  `;

  return (
    <TitleWrapper>
      <Logo src="/logo.svg" alt="logo" />
      <StartButton onClick={() => setGamestate("register")}>
        GAME START
      </StartButton>
    </TitleWrapper>
  );
};