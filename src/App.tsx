import { useState } from 'react'
import './App.css'
import { Title } from './components/pages/title';
import { Register } from './components/pages/register';
import { Result } from './components/pages/result';
import { Playscreen } from './components/pages/Playscreen';
import type { GameResultData } from './functions/score';

function App() {
  const [Gamestate, setGamestate] = useState('title');

  // リザルト表示用のゲーム結果データ（撃破数）
  const [gameResult, setGameResult] = useState<GameResultData>({
    normalKills: 12,
    bossKills: 2,
  });

  return (
    <>
      {Gamestate === 'title' && <Title setGamestate={setGamestate} />}
      {Gamestate === 'register' && <Register setGamestate={setGamestate} />}
      {Gamestate === 'play' && (
        <Playscreen setGamestate={setGamestate} setGameResult={setGameResult} />
      )}
      {Gamestate === 'result' && (
        <Result setGamestate={setGamestate} gameResult={gameResult} />
      )}
    </>
  );
}

export default App
