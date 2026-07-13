<<<<<<< HEAD
import { useState,useRef } from 'react'
=======
import { useState } from 'react'
>>>>>>> 484725f (create scenestate)
import './App.css'
import { Canvas } from '@react-three/fiber'
import { Box } from './components/objects/box'
import { Stars, OrbitControls } from "@react-three/drei";
<<<<<<< HEAD
import { Title } from './components/pages/title';
import { Register } from './components/pages/register';
import { Result } from './components/pages/result';
import { Playscreen } from './components/pages/Playscreen';
=======
import { Mainmenu } from './components/UI/Mainmenu';
>>>>>>> 484725f (create scenestate)

function App() {
  const [Gamestate,setGamestate] = useState('title')

  return (
    <>
<<<<<<< HEAD
     {Gamestate=='title'&&<Title setGamestate={setGamestate}/>}
     {Gamestate=='register'&&<Register setGamestate={setGamestate}/>}  
     {Gamestate=='play'&&<Playscreen setGamestate={setGamestate}/>}
     {Gamestate =='result'&&<Result setGamestate={setGamestate}/>}
=======
     {Gamestate=='title'&&<Mainmenu setGamestate={setGamestate}/>}
    {Gamestate=='play'&&<div id="CanvasContainer">
      <Canvas shadows={'soft'}>
        <ambientLight />
        <pointLight position={[0, 0, 0]} />
        <Box />
        <Stars
          radius={100} // 星の点滅(拡大)度合い
          depth={50} // 星の深さ
          count={5000} // 星の数
          factor={12} // 星の大きさ
          saturation={9} // 星の彩度
          speed={3} // 点滅のスピード
        />
        <OrbitControls />
      </Canvas>
          <div className="crosshair"></div>
    </div>}
>>>>>>> 484725f (create scenestate)
    </>
  )
}

export default App
