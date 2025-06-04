/**
 * Implication Graph Node
 * @property {Number} lit - Decision/Implication literal
 * @property {Number} declev - Decision Level
 * @property {Number} clause - Clause in Knowledge Base that Caused the Implication (null for decisions)
 * @property {Number} depth - # of Edges from a Decision to the Current Node
 * @property {Color} col - Color of the Node 
 * @property {Color} tcol - Text Color of the Node
 * @property {Number} x - Node's x coordinate
 * @property {Number} y - Node's y coordinate
 */
export class ImplGraphNode {
    #lit;
    #declev;
    #cause;
    #depth;
    #col;
    #tcol;
    #x;
    #y;
    
    constructor(lit, declev, cause, depth) {
        this.#lit = lit;
        this.#declev = declev;
        this.#cause = cause;
        this.#depth = depth;
        this.#col = 'white';
        this.#tcol = 'black';
        this.#x = null;
        this.#y = null;
    }

    draw(vars, r) {
        push();
        fill(this.#col);
        ellipse(this.#x, this.#y, r * 2, r * 2);
        fill(this.#tcol);
        let node_text = this.#lit === 0 ? '{ }' : vars[Math.abs(this.#lit) - 1];
        if (node_text == null) node_text = "?";
        text(node_text, this.#x - node_text.length * (node_text === '{ }' ? 2 : 4), this.#y + 4);
        pop();
    }

    clone() {
        const copy = new ImplGraphNode(this.#lit, this.#declev, this.#cause, this.#depth);
        copy.setCol(this.#col);
        copy.setTcol(this.#tcol);
        copy.setCoords(this.#x, this.#y);
        return copy;
    }

    getLit() { return this.#lit; }
    getDeclev() { return this.#declev; }
    getCause() { return this.#cause; }
    getDepth() { return this.#depth; }
    getCol() { return this.#col; }
    getTcol() { return this.#tcol; }
    getX() { return this.#x; }
    getY() { return this.#y; }

    setLit(lit) { this.#lit = lit; }
    setDeclev(declev) { this.#declev = declev; }
    setCause(cause) { this.#cause = cause; }
    setDepth(depth) { this.#depth = depth; }
    setCol(col) { this.#col = col; }
    setTcol(tcol) { this.#tcol = tcol; }
    setCoords(x, y) { 
        this.#x = x;
        this.#y = y;
    }
}