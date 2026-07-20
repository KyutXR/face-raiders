export default class WaveUI {
    constructor(element) {
        this.element = element;
    }

    setWave(wave) {
        this.element.textContent = `Wave : ${wave}`;
    }
}