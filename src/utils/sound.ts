// Web Audio API (SE用) および HTML5 Audio (BGM用) を用いた統合サウンドコントロールモジュール

type SoundStateListener = () => void;

class SoundManager {
    private audioCtx: AudioContext | null = null;
    private bufferCache: Map<string, AudioBuffer> = new Map();
    private loadingPromises: Map<string, Promise<AudioBuffer | null>> = new Map();

    // BGM用 HTMLAudioElement 単一インスタンス
    private bgmAudio: HTMLAudioElement | null = null;
    private currentBgmUrl: string | null = null;

    // 音量・ミュート設定 (0.0 ～ 1.0)
    private bgmVolume: number = 0.5;
    private seVolume: number = 0.7;
    private isBgmMuted: boolean = false;
    private isSeMuted: boolean = false;

    // 状態変更リスナー (React UI とのリアルタイム同期用)
    private listeners: Set<SoundStateListener> = new Set();

    constructor() {
        // 初期化処理
    }

    /**
     * Web Audio API (SE用) AudioContext の取得およびサスペンド解除
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
     * 状態変更通知の購読 (React UI用)
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

    // ==========================================
    // BGM（背景音楽）コントロールロジック
    // ==========================================

    /**
     * BGMの再生・停止・音量・ミュート状態を一括で即座に反映する統一メソッド
     */
    private updateBgmState() {
        if (!this.bgmAudio) return;

        // 音量とミュートプロパティの即時更新
        this.bgmAudio.volume = this.bgmVolume;
        this.bgmAudio.muted = this.isBgmMuted;

        // ミュート中、または音量が 0 の場合は確実に再生停止 (pause)
        if (this.isBgmMuted || this.bgmVolume === 0) {
            this.bgmAudio.pause();
        } else {
            // ミュートが解除されており、音量が 0 超で、一時停止中の場合は再生開始
            if (this.bgmAudio.paused && this.currentBgmUrl) {
                this.bgmAudio.play().catch((err) => {
                    console.warn('[SoundManager] BGM再生の開始がブロックされました（ユーザー操作が必要）:', err);
                });
            }
        }
    }

    /**
     * BGM のループ再生を開始
     */
    public playBGM(url: string = '/sounds/bgm.mp3') {
        this.currentBgmUrl = url;

        const targetSrcUrl = url.startsWith('http') ? url : window.location.origin + url;

        // まだ BGM オーディオ要素がない、または異なる音源 URL の場合
        if (!this.bgmAudio || this.bgmAudio.src !== targetSrcUrl) {
            if (this.bgmAudio) {
                this.bgmAudio.pause();
            }
            this.bgmAudio = new Audio(url);
            this.bgmAudio.loop = true;
        }

        // BGM の最新状態を一括反映
        this.updateBgmState();
    }

    /**
     * BGM の停止
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

    // ==========================================
    // SE（効果音）再生ロジック (Web Audio API)
    // ==========================================

    /**
     * SE ファイルをデコード・キャッシュする関数
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
     * SE（効果音）の再生
     */
    public async playSound(url: string, baseVolume: number = 1.0) {
        if (this.isSeMuted || this.seVolume === 0) return;

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

    // ==========================================
    // ゲッター & セッター (音量・ミュート制御)
    // ==========================================

    public getBgmVolume(): number { return this.bgmVolume; }
    public getSeVolume(): number { return this.seVolume; }
    public getIsBgmMuted(): boolean { return this.isBgmMuted; }
    public getIsSeMuted(): boolean { return this.isSeMuted; }

    public setBgmVolume(volume: number) {
        this.bgmVolume = Math.max(0, Math.min(1, volume));
        this.updateBgmState();
        this.notifyListeners();
    }

    public setSeVolume(volume: number) {
        this.seVolume = Math.max(0, Math.min(1, volume));
        this.notifyListeners();
    }

    public setBgmMuted(muted: boolean) {
        this.isBgmMuted = muted;
        this.updateBgmState();
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

// 便利関数のエクスポート
export const playPlayerShootSound = () => soundManager.playSound('/sounds/shoot.mp3', 0.6);
export const playEnemyDefeatSound = () => soundManager.playSound('/sounds/defeat.mp3', 0.8);
export const playEnemyShootSound = () => soundManager.playSound('/sounds/enemy_shoot.mp3', 0.5);
export const playBGM = (url: string = '/sounds/bgm.mp3') => soundManager.playBGM(url);
export const stopBGM = () => soundManager.stopBGM();

// SEのバックグラウンドプリロード
soundManager.loadSound('/sounds/shoot.mp3');
soundManager.loadSound('/sounds/defeat.mp3');
soundManager.loadSound('/sounds/enemy_shoot.mp3');
