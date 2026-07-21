import styled from "styled-components";
import { COLORS } from "../../styles/colors";

const TitleWrapper = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  background-color: #0F172A;
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

const Logo = styled.img`
  width: 85%;
  max-width: 380px;
  height: auto;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.4));
`;

const StartButton = styled.button`
  width: 80%;
  max-width: 300px;
  padding: 18px 0;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 2px;
  color: #0F172A;
  background-color: ${COLORS.accent};
  border: none;
  border-radius: 40px;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(255, 116, 116, 0.35);
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(255, 116, 116, 0.5);
  }

  &:active {
    transform: translateY(1px) scale(0.97);
  }
`;

export const Title = ({ setGamestate }: { setGamestate: (state: string) => void }) => {
  return (
    <TitleWrapper>
      <ContentContainer>
        <Logo src="/logo.svg" alt="Face Raiders Logo" />
        <StartButton onClick={() => setGamestate("register")}>
          GAME START
        </StartButton>
      </ContentContainer>
    </TitleWrapper>
  );
};