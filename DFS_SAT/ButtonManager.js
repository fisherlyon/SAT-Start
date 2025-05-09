import { Button } from "./Button.js";

export class ButtonManager {
    #buttons;   // {type : Array of Button Objects}
    #visibile;  // {type : Boolean}

    constructor(buttons = []) {
        this.#buttons = buttons;
        this.#visibile = false;
    }

    addButton(button) {
        this.#buttons.push(button);
        if (this.#visibile) {
            this.showAll();
        }
    }

    addButtons(buttons) {
        for (const button of buttons) {
            this.addButton(button);
        }
    }

    remButton(button) {
        let index = this.#buttons.indexOf(button);
        this.#buttons.splice(index, 1);
        if (this.#visibile) {
            this.showAll();
        }
    }

    showAll() {
        for (const button of this.#buttons) {
            button.show();
        }
        this.#visibile = true;
    }

    remAll() {
        for (const button of this.#buttons) {
            button.rem();
        }
        this.#visibile = false;
    }

    getButtons() { return this.#buttons; }
    getVisible() { return this.#visibile; }
}