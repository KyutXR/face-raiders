export default class ScoreUI {
    constructor(element) {
        this.element = element;
    }

    setScore(score) {
        this.element.textContent = `Score : ${score}`;
    }
}