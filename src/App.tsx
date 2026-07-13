import { useState,useRef } from 'react'
import './App.css'
import { Title } from './components/pages/title';
import { Register } from './components/pages/register';
import { Result } from './components/pages/result';
import { Playscreen } from './components/pages/Playscreen';

function App() {
  const [Gamestate,setGamestate] = useState('title')

  return (
    <>
     {Gamestate=='title'&&<Title setGamestate={setGamestate}/>}
     {Gamestate=='register'&&<Register setGamestate={setGamestate}/>}  
     {Gamestate=='play'&&<Playscreen setGamestate={setGamestate}/>}
     {Gamestate =='result'&&<Result setGamestate={setGamestate}/>}
    </>
  )
}

export default App
