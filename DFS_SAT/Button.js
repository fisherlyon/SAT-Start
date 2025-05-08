class Button {
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
            this.#temp.position(this.#x, this.#y);
            this.#temp.mousePressed(this.#fn);
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
}