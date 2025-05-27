export class Edge {
    #x1;
    #y1;
    #x2;
    #y2;
    #color;
    #weight;
    #dashed;

    constructor(x1, y1, x2, y2) {
        this.#x1 = x1; 
        this.#y1 = y1;
        this.#x2 = x2;
        this.#y2 = y2;
        this.#color = 'black';
        this.#weight = 2;
        this.#dashed = false;
    }

    draw(flip) {
        let flip_happens = false;
        push();
        strokeWeight(this.#weight);
        stroke(this.#color);
        noFill();

        const dx = Math.abs(this.#x2 - this.#x1);
        if (this.#y1 === this.#y2 && dx > 65) {
            const ctrlOffset = 0.4 * dx;

            bezier(
                this.#x1, this.#y1,
                this.#x1, this.#y1 + ctrlOffset*flip,
                this.#x2, this.#y2 + ctrlOffset*flip,
                this.#x2, this.#y2
            );
            flip_happens = true;
        } else {
            if (this.#dashed) {
                drawingContext.setLineDash([4, 4]);
            }
            line(this.#x1, this.#y1, this.#x2, this.#y2);
        }

        pop();
        return flip_happens;
    }

    getX1() { return this.#x1; }
    getY1() { return this.#y1; }
    getX2() { return this.#x2; }
    getY2() { return this.#y2; }
    getColor() { return this.#color; }

    setX1(x) { this.#x1 = x; }
    setY1(y) { this.#y1 = y; }
    setX2(x) { this.#x2 = x; }
    setY2(y) { this.#y2 = y; }
    setColor(col) { this.#color = col; }
    setDashed(bool) { this.#dashed = bool; }
}