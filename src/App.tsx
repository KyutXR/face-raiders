import { useState } from 'react'
import './App.css'
import { Canvas } from '@react-three/fiber'
import { Box } from './components/objects/box'
import { Stars, OrbitControls } from "@react-three/drei";
import { Mainmenu } from './components/UI/Mainmenu';

function App() {
  const [Gamestate,setGamestate] = useState('title')

  return (
    <>
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
    </>
  )
}

export default App
