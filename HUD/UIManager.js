import ScoreUI from "./ScoreUI.js";
import HpUI from "./HpUI.js";
import WaveUI from "./WaveUI.js";
import EnemyIndicatorUI from "./EnemyIndicatorUI.js";

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

        this.enemyIndicator = new EnemyIndicatorUI(
            document.getElementById("enemyIndicators")
        );
    }

    update(gameState) {
        this.scoreUI.setScore(gameState.score);
        this.hpUI.setHp(gameState.hp);
        this.waveUI.setWave(gameState.wave);

        this.enemyIndicator.update(
            gameState.enemies,
            gameState.camera
        );
    }

}