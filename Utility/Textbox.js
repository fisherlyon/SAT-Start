export class Textbox {
    #label; // initial textbox label
    #x;
    #y;
    #temp;

    constructor(label, x, y) {
        this.#label = label;
        this.#x = x;
        this.#y = y;
        this.#temp = null;
    }

    show() {
        if (!this.#temp) {
            this.#temp = createInput(this.#label);
            this.#temp.style('position', 'absolute');

            setTimeout(() => {
                const tb = this.#temp.elt;
                const styles = window.getComputedStyle(tb);
                const tw = tb.offsetWidth;
                const th = tb.offsetHeight;

                const px = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
                const py = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);

                const tx = (this.#x + px) - tw / 2 + 2;
                const ty = this.#y - py;
                this.#temp.position(tx, ty);
            }, 0);
        }
    }

    rem() {
        if (this.#temp) {
            this.#temp.remove();
            this.#temp = null;
        }
    }

    getLabel() { return this.#label; }
    getX() { return this.#x; }
    getY() { return this.#y; }
    getWidth() { return this.#temp?.width ?? 0; }
    getHeight() { return this.#temp?.height ?? 0; }
    getValue() { return this.#temp?.value() ?? ''; }

    setLabel(label) { this.#label = label; }
    setX(x) { this.#x = x; }
    setY(y) { this.#y = y; }
}