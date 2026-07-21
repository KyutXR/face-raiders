export const Result = ({ setGamestate }: { setGamestate: (state: string) => void }) =>{
    return (<div>
        <h1>リザルト</h1>
        <button onClick={()=>setGamestate('title')}>retry</button>
    </div>);
}