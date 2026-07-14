import styled from "styled-components";

export const Title = ({ setGamestate }: { setGamestate: (state: string) => void }) => {

  const TitleWrapper = styled.div`
    position: relative;
    width: 100vw;
    height: 100vh;

  `

  const Button = styled.button`
    position: absolute;
    width: 100%;
    height: 100%;
    border: none;
    cursor: pointer;
  `

  const Logo = styled.img`
    position: absolute;
    width: 100%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  `

  return (
    <TitleWrapper>
      <Button onClick={() => setGamestate("register")}>
        <Logo src="/logo.svg" alt="logo" />
      </Button>
    </TitleWrapper>
  );
};