export class TreeNode {
    #lit;
    #left;
    #right;
    #parent;
    #col;
    #tcol;
    #lecol;
    #recol

    constructor(lit, left = null, right = null) {
        this.#lit = lit;
        this.#col = 'white';
        this.#tcol = 'black';
        this.#lecol = 'black';
        this.#recol = 'black';

        this.setLeft(left);
        this.setRight(right);
    }

    draw(x, y, vars, r) {
        push();
        fill(this.#col);
        ellipse(x, y, r * 2, r * 2);
        fill(this.#tcol);
        let node_text = vars[this.#lit - 1];
        text(node_text, x - node_text.length * 4, y + 4);
        pop();
    }

    getLit() { return this.#lit; }
    getLeft() { return this.#left; }
    getRight() { return this.#right; }
    getParent() { return this.#parent; }
    getCol() { return this.#col; }
    getTcol() { return this.#tcol; }
    getLecol() { return this.#lecol; }
    getRecol() { return this.#recol; }

    setLit(lit) { this.#lit = lit; }
    setLeft(left) {
        this.#left = left;
        if (left) left.#parent = this;
    }
    setRight(right) {
        this.#right = right;
        if (right) right.#parent = this;
    }
    setCol(col) { this.#col = col; }
    setTcol(tcol) { this.#tcol = tcol; }
    setLecol(lecol) { this.#lecol = lecol; }
    setRecol(recol) { this.#recol = recol; }
}
