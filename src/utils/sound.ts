// Web Audio API (SE用) および HTML5 Audio (BGM用) を用いた音声管理モジュール

type SoundStateListener = () => void;

class SoundManager {
    private audioCtx: AudioContext | null = null;
    private bufferCache: Map<string, AudioBuffer> = new Map();
    private loadingPromises: Map<string, Promise<AudioBuffer | null>> = new Map();

    // BGM用 HTMLAudioElement 単一インスタンス
    private bgmAudio: HTMLAudioElement | null = null;
    private currentBgmUrl: string | null = null;

    // 音量・ミュート設定
    private bgmVolume: number = 0.5; // 0.0 ~ 1.0
    private seVolume: number = 0.7;  // 0.0 ~ 1.0
    private isBgmMuted: boolean = false;
    private isSeMuted: boolean = false;

    // 状態変更リスナー
    private listeners: Set<SoundStateListener> = new Set();

    constructor() {
        // 初期化処理
    }

    /**
     * Web Audio API (SE用) AudioContext の取得または初期化
     */
    public getAudioContext(): AudioContext {
        if (!this.audioCtx) {
            const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
            this.audioCtx = new AudioCtxClass();
        }
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
        return this.audioCtx;
    }

    /**
     * 状態変更通知の購読 (React UI 用)
     */
    public subscribe(listener: SoundStateListener): () => void {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }

    private notifyListeners() {
        this.listeners.forEach((listener) => listener());
    }

    /**
     * SE (効果音) ファイルをデコード・キャッシュする関数
     */
    public async loadSound(url: string): Promise<AudioBuffer | null> {
        if (this.bufferCache.has(url)) {
            return this.bufferCache.get(url)!;
        }

        if (this.loadingPromises.has(url)) {
            return this.loadingPromises.get(url)!;
        }

        const promise = (async () => {
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    console.warn(`[SoundManager] SEファイルが見つかりません: ${url}`);
                    return null;
                }
                const arrayBuffer = await response.arrayBuffer();
                const ctx = this.getAudioContext();
                const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
                this.bufferCache.set(url, audioBuffer);
                return audioBuffer;
            } catch (error) {
                console.warn(`[SoundManager] SEファイルの読み込みに失敗しました (${url}):`, error);
                return null;
            } finally {
                this.loadingPromises.delete(url);
            }
        })();

        this.loadingPromises.set(url, promise);
        return promise;
    }

    /**
     * SE (効果音) の低遅延再生
     */
    public async playSound(url: string, baseVolume: number = 1.0) {
        if (this.isSeMuted) return;

        try {
            const ctx = this.getAudioContext();
            let buffer = this.bufferCache.get(url);

            if (!buffer) {
                buffer = (await this.loadSound(url)) ?? undefined;
            }

            if (!buffer) return;

            const source = ctx.createBufferSource();
            source.buffer = buffer;

            const gainNode = ctx.createGain();
            const finalVolume = baseVolume * this.seVolume;
            gainNode.gain.value = Math.max(0, Math.min(1, finalVolume));

            source.connect(gainNode);
            gainNode.connect(ctx.destination);

            source.start(0);
        } catch (e) {
            console.warn(`[SoundManager] SE再生時にエラーが発生しました (${url}):`, e);
        }
    }

    /**
     * BGM のループ再生を開始 (HTML5 Audio を使用)
     */
    public async playBGM(url: string = '/sounds/bgm.mp3') {
        if (this.isBgmMuted) {
            this.currentBgmUrl = url;
            return;
        }

        try {
            // すでに同じURLのBGMインスタンスが存在する場合
            if (this.bgmAudio && this.currentBgmUrl === url) {
                this.bgmAudio.volume = this.bgmVolume;
                this.bgmAudio.muted = false;
                if (this.bgmAudio.paused) {
                    await this.bgmAudio.play().catch((err) => {
                        console.warn('[SoundManager] BGM自動再生がブロックされました:', err);
                    });
                }
                return;
            }

            // 旧BGMの停止
            this.stopBGM();

            // 新しい HTMLAudioElement の作成
            const audio = new Audio(url);
            audio.loop = true;
            audio.volume = this.bgmVolume;
            audio.muted = this.isBgmMuted;

            this.bgmAudio = audio;
            this.currentBgmUrl = url;

            await audio.play().catch((err) => {
                console.warn('[SoundManager] BGM再生の開始が拒否されました（ユーザー操作が必要）:', err);
            });
        } catch (e) {
            console.warn(`[SoundManager] BGM再生エラー (${url}):`, e);
        }
    }

    /**
     * BGM の停止・一時停止
     */
    public stopBGM() {
        if (this.bgmAudio) {
            try {
                this.bgmAudio.pause();
                this.bgmAudio.currentTime = 0;
            } catch (e) {
                // エラーハンドリング
            }
            this.bgmAudio = null;
        }
        this.currentBgmUrl = null;
    }

    // --- 音量・ミュート調整メソッド ---

    public getBgmVolume(): number { return this.bgmVolume; }
    public getSeVolume(): number { return this.seVolume; }
    public getIsBgmMuted(): boolean { return this.isBgmMuted; }
    public getIsSeMuted(): boolean { return this.isSeMuted; }

    public setBgmVolume(volume: number) {
        this.bgmVolume = Math.max(0, Math.min(1, volume));
        if (this.bgmAudio) {
            this.bgmAudio.volume = this.bgmVolume;
        }
        this.notifyListeners();
    }

    public setSeVolume(volume: number) {
        this.seVolume = Math.max(0, Math.min(1, volume));
        this.notifyListeners();
    }

    public setBgmMuted(muted: boolean) {
        this.isBgmMuted = muted;
        if (this.bgmAudio) {
            this.bgmAudio.muted = muted;
            if (muted) {
                this.bgmAudio.pause();
            } else {
                this.bgmAudio.volume = this.bgmVolume;
                this.bgmAudio.play().catch(() => {});
            }
        } else if (!muted && this.currentBgmUrl) {
            this.playBGM(this.currentBgmUrl);
        }
        this.notifyListeners();
    }

    public setSeMuted(muted: boolean) {
        this.isSeMuted = muted;
        this.notifyListeners();
    }

    public toggleBgmMute() {
        this.setBgmMuted(!this.isBgmMuted);
    }

    public toggleSeMute() {
        this.setSeMuted(!this.isSeMuted);
    }
}

// シングルトンインスタンス
export const soundManager = new SoundManager();

// 各種エクスポート関数
export const playPlayerShootSound = () => soundManager.playSound('/sounds/shoot.mp3', 0.6);
export const playEnemyDefeatSound = () => soundManager.playSound('/sounds/defeat.mp3', 0.8);
export const playEnemyShootSound = () => soundManager.playSound('/sounds/enemy_shoot.mp3', 0.5);
export const playBGM = (url: string = '/sounds/bgm.mp3') => soundManager.playBGM(url);
export const stopBGM = () => soundManager.stopBGM();

// SEのプリロード
soundManager.loadSound('/sounds/shoot.mp3');
soundManager.loadSound('/sounds/defeat.mp3');
soundManager.loadSound('/sounds/enemy_shoot.mp3');
