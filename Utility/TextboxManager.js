import { Textbox } from "./Textbox.js";

export class TextboxManager {
    #textboxes;
    #visible;

    constructor(textboxes = []) {
        this.#textboxes = textboxes;
        this.#visible = false;
    }

    addTextbox(textbox) {
        this.#textboxes.push(textbox);
        if (this.#visible) {
            this.showAll();
        }
    }

    addTextboxes(textboxes) {
        for (const textbox of textboxes) {
            this.addTextbox(textbox);
        }
    }

    remTextbox(textbox) {
        let index = this.#textboxes.indexof(textbox);
        this.#textboxes.splice(index, 1);
        if (this.#visible) {
            this.showAll();
        }
    }

    showAll() {
        for (const textbox of this.#textboxes) {
            textbox.show();
        }
        this.#visible = true;
    }

    remAll() {
        for (const textbox of this.#textboxes) {
            textbox.rem();
        }
        this.#visible = false;
    }

    getTextboxes() { return this.#textboxes; }
    getVisible() { return this.#visible; }
}