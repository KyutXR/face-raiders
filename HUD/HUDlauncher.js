import UIManager from "./UIManager.js";
import GameManager from "./GameManager.js";

const ui = new UIManager();
const game = new GameManager(ui);

game.addScore(100);
game.damage(15);
game.nextWave();