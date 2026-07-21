export default class GameManager {
    
    constructor(uiManager) {

        this.score = 0;
        this.hp = 100;
        this.wave = 1;

        this.ui = uiManager;

        this.notify();
    }

    addScore(value) {
        this.score += value;
        this.notify();
    }

    damage(value) {
        this.hp -= value;
        this.notify();
    }

    nextWave() {
        this.wave++;
        this.notify();
    }

    notify() {
        this.ui.update({
            score:this.score,
            hp:this.hp,
            wave:this.wave
        });
    }
}