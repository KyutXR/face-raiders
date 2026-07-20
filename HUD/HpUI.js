export default class HpUI {
    constructor(element) {
        this.element = element;
    }

    setHp(hp) {
        this.element.textContent = `HP : ${hp}`;
    }
}