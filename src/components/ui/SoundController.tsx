import { useState, useEffect } from 'react';
import { soundManager } from '../../utils/sound';

export const SoundController = () => {
    const [isOpen, setIsOpen] = useState(false);

    // soundManagerから現在の状態を取得
    const [bgmVolume, setBgmVolumeState] = useState(soundManager.getBgmVolume());
    const [seVolume, setSeVolumeState] = useState(soundManager.getSeVolume());
    const [isBgmMuted, setIsBgmMutedState] = useState(soundManager.getIsBgmMuted());
    const [isSeMuted, setIsSeMutedState] = useState(soundManager.getIsSeMuted());

    useEffect(() => {
        // soundManager の変更リスナーを購読
        const unsubscribe = soundManager.subscribe(() => {
            setBgmVolumeState(soundManager.getBgmVolume());
            setSeVolumeState(soundManager.getSeVolume());
            setIsBgmMutedState(soundManager.getIsBgmMuted());
            setIsSeMutedState(soundManager.getIsSeMuted());
        });
        return () => unsubscribe();
    }, []);

    // ユーザーが一度でもパネルを開いたりクリック操作した際に AudioContext を resume するハンドラ
    const handleUserInteraction = () => {
        soundManager.getAudioContext();
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: 1000,
                fontFamily: 'sans-serif',
                userSelect: 'none',
            }}
            onClick={(e) => e.stopPropagation()} // 3Dキャンバスのクリックイベント発射を防止
            onPointerDown={(e) => e.stopPropagation()}
        >
            {/* 設定開閉ボタン */}
            <button
                onClick={() => {
                    handleUserInteraction();
                    setIsOpen((prev) => !prev);
                }}
                title="サウンド設定"
                style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    backgroundColor: 'rgba(20, 20, 30, 0.75)',
                    backdropFilter: 'blur(10px)',
                    color: '#fff',
                    fontSize: '20px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                }}
            >
                {isBgmMuted && isSeMuted ? '🔇' : '🔊'}
            </button>

            {/* サウンドコントロールパネル */}
            {isOpen && (
                <div
                    style={{
                        position: 'absolute',
                        top: '56px',
                        right: '0',
                        width: '260px',
                        backgroundColor: 'rgba(15, 18, 28, 0.88)',
                        backdropFilter: 'blur(16px)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        padding: '16px 20px',
                        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6)',
                        color: '#fff',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                    }}
                >
                    <div style={{ fontWeight: 'bold', fontSize: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>🎵 サウンド設定</span>
                        <span style={{ fontSize: '12px', opacity: 0.6, cursor: 'pointer' }} onClick={() => setIsOpen(false)}>✕</span>
                    </div>

                    {/* BGM 設定 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                            <span>BGM (音楽)</span>
                            <button
                                onClick={() => {
                                    handleUserInteraction();
                                    soundManager.toggleBgmMute();
                                }}
                                style={{
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    backgroundColor: isBgmMuted ? '#FF4D4D' : '#4CAF50',
                                    color: '#fff',
                                    fontSize: '11px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                }}
                            >
                                {isBgmMuted ? 'OFF' : 'ON'}
                            </button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={isBgmMuted ? 0 : bgmVolume}
                                onChange={(e) => {
                                    handleUserInteraction();
                                    const val = parseFloat(e.target.value);
                                    soundManager.setBgmVolume(val);
                                    if (isBgmMuted && val > 0) {
                                        soundManager.setBgmMuted(false);
                                    }
                                }}
                                style={{ flex: 1, accentColor: '#4CAF50', cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '12px', minWidth: '32px', textAlign: 'right', opacity: 0.8 }}>
                                {isBgmMuted ? '0%' : `${Math.round(bgmVolume * 100)}%`}
                            </span>
                        </div>
                    </div>

                    {/* SE (効果音) 設定 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                            <span>SE (効果音)</span>
                            <button
                                onClick={() => {
                                    handleUserInteraction();
                                    soundManager.toggleSeMute();
                                }}
                                style={{
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    backgroundColor: isSeMuted ? '#FF4D4D' : '#2196F3',
                                    color: '#fff',
                                    fontSize: '11px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                }}
                            >
                                {isSeMuted ? 'OFF' : 'ON'}
                            </button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={isSeMuted ? 0 : seVolume}
                                onChange={(e) => {
                                    handleUserInteraction();
                                    const val = parseFloat(e.target.value);
                                    soundManager.setSeVolume(val);
                                    if (isSeMuted && val > 0) {
                                        soundManager.setSeMuted(false);
                                    }
                                }}
                                style={{ flex: 1, accentColor: '#2196F3', cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '12px', minWidth: '32px', textAlign: 'right', opacity: 0.8 }}>
                                {isSeMuted ? '0%' : `${Math.round(seVolume * 100)}%`}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
