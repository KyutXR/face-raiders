import { useState } from 'react'
import './App.css'
import { Title } from './components/pages/title';
import { Register } from './components/pages/register';
import { Result } from './components/pages/result';
import { Playscreen } from './components/pages/Playscreen';
import { Photo } from './components/pages/photo';

function App() {
  const [Gamestate, setGamestate] = useState('title')
  const [StageNum, setStageNum] = useState(1)
  const [imgUrl, setImgUrl] = useState<string | null>(null)

  return (
    <>
      {Gamestate == 'title' && <Title setGamestate={setGamestate} setStageNum={setStageNum} />}
      {Gamestate == 'register' && <Register setGamestate={setGamestate} />}
      {Gamestate == 'play' && <Playscreen setGamestate={setGamestate} stageNum={StageNum} imgUrl={imgUrl} />}
      {Gamestate == 'result' && <Result setGamestate={setGamestate} />}
      {Gamestate == 'photo' && <Photo setGamestate={setGamestate} onPhotoCropped={setImgUrl} />}
    </>
  )
}

export default App
