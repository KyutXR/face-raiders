import { useState } from 'react'
import './App.css'
import { Title } from './components/pages/title';
import { Register } from './components/pages/register';
import { Result } from './components/pages/result';
import { Playscreen } from './components/pages/Playscreen';
import { Photo } from './components/pages/photo'; 

function App() {
  const [Gamestate,setGamestate] = useState('title')
  const [imgUrl, setImgUrl] = useState<string | null>(null)
  return (
    <>
     {Gamestate=='title'&&<Title setGamestate={setGamestate}/>}
     {Gamestate=='register'&&<Register setGamestate={setGamestate}/>}  
     {Gamestate=='play'&&<Playscreen setGamestate={setGamestate} imgUrl={imgUrl}/>}
     {Gamestate =='result'&&<Result setGamestate={setGamestate}/>}
     {Gamestate =='photo'&&<Photo setGamestate={setGamestate} setImgUrl={setImgUrl}/>}
    </>
  )
}

export default App
