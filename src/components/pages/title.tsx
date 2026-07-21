import styled from "styled-components";
import { COLORS } from "../../styles/colors";

const TitleWrapper = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  background-color: ${COLORS.primary};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
`;

const ContentContainer = styled.div`
  width: 100%;
  max-width: 480px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  padding: 40px 0;
  box-sizing: border-box;
`;

const LogoWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Logo = styled.img`
  width: 140%;
  max-width: 600px;
  height: auto;
`;

const StartButton = styled.button`
  width: 80%;
  max-width: 300px;
  padding: 18px 0;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 2px;
  color: #FFFFFF;
  background-color: ${COLORS.accent};
  border: none;
  border-radius: 40px;
  cursor: pointer;
  transition: transform 0.15s ease;

  &:hover {
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(1px) scale(0.97);
  }
`;

export const Title = ({ setGamestate }: { setGamestate: (state: string) => void }) => {
  return (
    <TitleWrapper>
      <ContentContainer>
        <LogoWrapper>
          <Logo src="/logo.svg" alt="顔 raiders" />
        </LogoWrapper>
        <StartButton onClick={() => setGamestate("register")}>
          ゲームスタート
        </StartButton>
      </ContentContainer>
    </TitleWrapper>
  );
};