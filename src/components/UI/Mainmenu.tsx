export const Mainmenu = ({ setGamestate }: { setGamestate: (state: string) => void }) => {
  return(
    <div>
      <h1>mainmenu</h1>
      <button onClick={() => setGamestate("play")}>start</button>
    </div>
  );
};