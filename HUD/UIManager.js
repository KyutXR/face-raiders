import ScoreUI from "./ScoreUI.js";
import HpUI from "./HpUI.js";
import WaveUI from "./WaveUI.js";

export default class UIManager {

    constructor() {

        this.scoreUI = new ScoreUI(
            document.getElementById("score")
        );

        this.hpUI = new HpUI(
            document.getElementById("hp")
        );

        this.waveUI = new WaveUI(
            document.getElementById("wave")
        );
    }

    update(gameState) {
        this.scoreUI.setScore(gameState.score);
        this.hpUI.setHp(gameState.hp);
        this.waveUI.setWave(gameState.wave);
    }

}