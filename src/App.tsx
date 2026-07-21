import { useEffect, useState } from 'react'
import './App.css'
import { Title } from './components/pages/title';
import { Register } from './components/pages/register';
import { StageSelect } from './components/pages/StageSelect';
import { Result } from './components/pages/result';
import { Playscreen } from './components/pages/Playscreen';
import { INITIAL_GAME_RESULT } from './functions/score';
import type { GameResultData } from './functions/score';
import { SoundController } from './components/ui/SoundController';
import { playBGM, soundManager } from './utils/sound';

function App() {
  const [Gamestate, setGamestate] = useState('title');
  const [StageNum, setStageNum] = useState(1)
  const [imgUrl, _setImgUrl] = useState<string | null>(null);

  // リザルト表示用のゲーム結果データ（撃破数）
  const [gameResult, setGameResult] = useState<GameResultData>(INITIAL_GAME_RESULT);

  // 初回読み込みまたは操作時にBGMをスタート
  useEffect(() => {
    const startAudio = () => {
      if (!soundManager.getIsBgmMuted()) {
        playBGM('/sounds/bgm.mp3');
      }
    };

    // 初期化試行
    startAudio();

    // ユーザー操作イベント（ブラウザの自動再生ポリシー対策）
    window.addEventListener('click', startAudio, { once: true });
    window.addEventListener('keydown', startAudio, { once: true });

    return () => {
      window.removeEventListener('click', startAudio);
      window.removeEventListener('keydown', startAudio);
    };
  }, []);

  /**
   * スコア・撃破数・ゲーム状態を初期状態へリセットする関数
   */
  const resetGameState = () => {
    setGameResult(INITIAL_GAME_RESULT);
  };

  /**
   * 「タイトルへ」戻る処理（ゲーム状態をリセットしてタイトル画面へ遷移）
   */
  const handleGoTitle = () => {
    resetGameState();
    setGamestate('title');
  };

  /**
   * 「もう一度プレイ」処理（ゲーム状態をリセットしてプレイ/登録画面へ遷移）
   */
  const handleRetry = () => {
    resetGameState();
    setGamestate('register');
  };

  return (
    <>
      {/* 画面全域共通のサウンド設定コントローラー */}
      <SoundController />

      {Gamestate === 'title' && <Title setGamestate={setGamestate} />}
      {Gamestate === 'register' && <Register setGamestate={setGamestate} />}
      {Gamestate === 'stageSelect' && <StageSelect setGamestate={setGamestate} setStageNum={setStageNum} />}
      {Gamestate === 'play' && (
        <Playscreen
          setGamestate={setGamestate}
          setGameResult={setGameResult}
          stageNum={StageNum}
          imgUrl={imgUrl}
        />
      )}
      {Gamestate === 'result' && (
        <Result
          setGamestate={setGamestate}
          gameResult={gameResult}
          onRetry={handleRetry}
          onGoTitle={handleGoTitle}
          onReset={resetGameState}
        />
      )}
    </>
  );
}

export default App

