
export const Title = ({ setGamestate }: { setGamestate: (state: string) => void }) => {
  return(
    <div>
      <h1>タイトル</h1>
      <button onClick={() => setGamestate("register")}>start</button>
    </div>
  );
};