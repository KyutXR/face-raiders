// Web Audio API を用いた音声アセットの読み込みと低遅延再生モジュール

class SoundManager {
    private audioCtx: AudioContext | null = null;
    private bufferCache: Map<string, AudioBuffer> = new Map();
    private loadingPromises: Map<string, Promise<AudioBuffer | null>> = new Map();

    constructor() {
        // コンストラクタでは初期化のみ
    }

    /**
     * AudioContext の取得または初期化
     * （ユーザー操作イベント等で呼び出すことでサスペンド解除を保証します）
     */
    private getAudioContext(): AudioContext {
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
     * 音声ファイル (mp3/wav/ogg等) を非同期で取得してデコード・キャッシュする関数
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
                    // ファイルが存在しない場合はエラーを表示せず警告ログにとどめる
                    console.warn(`[SoundManager] 音声ファイルが見つかりません: ${url}`);
                    return null;
                }
                const arrayBuffer = await response.arrayBuffer();
                const ctx = this.getAudioContext();
                const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
                this.bufferCache.set(url, audioBuffer);
                return audioBuffer;
            } catch (error) {
                console.warn(`[SoundManager] 音声ファイルの読み込みに失敗しました (${url}):`, error);
                return null;
            } finally {
                this.loadingPromises.delete(url);
            }
        })();

        this.loadingPromises.set(url, promise);
        return promise;
    }

    /**
     * キャッシュされた音声バッファを再生する関数
     * @param url 再生する音声ファイルのパス
     * @param volume 音量 (0.0 ～ 1.0)
     */
    public async playSound(url: string, volume: number = 1.0) {
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
            gainNode.gain.value = Math.max(0, Math.min(1, volume));

            source.connect(gainNode);
            gainNode.connect(ctx.destination);

            source.start(0);
        } catch (e) {
            console.warn(`[SoundManager] 音声再生時にエラーが発生しました (${url}):`, e);
        }
    }
}

// シングルトンインスタンスの作成
export const soundManager = new SoundManager();

// 便利関数の定義（事前ロードおよび再生）

/**
 * プレイヤーの弾発射音を再生 (/sounds/shoot.mp3)
 */
export const playPlayerShootSound = () => {
    soundManager.playSound('/sounds/shoot.mp3', 0.6);
};

/**
 * 敵の撃破音を再生 (/sounds/defeat.mp3)
 */
export const playEnemyDefeatSound = () => {
    soundManager.playSound('/sounds/defeat.mp3', 0.8);
};

/**
 * 敵の弾発射音を再生 (/sounds/enemy_shoot.mp3)
 */
export const playEnemyShootSound = () => {
    soundManager.playSound('/sounds/enemy_shoot.mp3', 0.5);
};

// 起動時に音声ファイルをバックグラウンドで事前読み込み開始
soundManager.loadSound('/sounds/shoot.mp3');
soundManager.loadSound('/sounds/defeat.mp3');
soundManager.loadSound('/sounds/enemy_shoot.mp3');
