export class Button {
    #label; // button label
    #x; // x position
    #y; // y position
    #fn; // button function
    #temp; // temporary button binding

    constructor(label, x, y, fn) {
        this.#label = label;
        this.#x = x;
        this.#y = y;
        this.#fn = fn;
        this.#temp = null;
    }

    show() {
        if (!this.#temp) {
            this.#temp = createButton(this.#label);
            this.#temp.style('position', 'absolute');
            this.#temp.mousePressed(this.#fn);

            // Defer positioning until width/height are available
            setTimeout(() => {
                const btn = this.#temp.elt;
                const styles = window.getComputedStyle(btn);
                const bw = btn.offsetWidth;
                const bh = btn.offsetHeight;

                const px = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
                const py = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);

                const bx = (this.#x + px) - bw / 2;
                const by = this.#y - py;
                this.#temp.position(bx, by);
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
    getFn() { return this.#fn; }
    getWidth() { return this.#temp?.width ?? 0; }
    getHeight() { return this.#temp?.height ?? 0; }

    setLabel(label) { this.#label = label; }
    setX(x) { this.#x = x; }
    setY(y) { this.#y = y; }
    setFn(fn) { this.#fn = fn; }
}