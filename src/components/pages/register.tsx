
export const Register = ({ setGamestate }: { setGamestate: (state: string) => void }) =>{
    return(<div>
        <h1>顔登録画面です</h1>
        <button onClick={() =>setGamestate('play')}>登録</button>
    </div>);
}