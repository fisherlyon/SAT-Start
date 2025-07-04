import { Edge } from "../Utility/Edge.js"

export class TreeNode {
    #lit;
    #left;
    #right;
    #parent;
    #col;
    #tcol;
    #x;
    #y;
    #left_edge;
    #right_edge;

    constructor(lit, left = null, right = null) {
        this.#lit = lit;
        this.#col = 'white';
        this.#tcol = 'black';
        this.#x = null;
        this.#y = null;
        this.#left_edge = null;
        this.#right_edge = null;

        this.setLeft(left);
        this.setRight(right);
    }

    draw(vars, r) {
        this.drawEdges();
        push();
        fill(this.#col);
        ellipse(this.#x, this.#y, r * 2, r * 2);
        fill(this.#tcol);
        let node_text = vars[Math.abs(this.#lit) - 1];
        if (node_text == null) node_text = "?";
        text(node_text, this.#x - node_text.length * 4, this.#y + 4);
        pop();
    }

    drawEdges() {
        if (this.#left_edge) this.#left_edge.draw();
        if (this.#right_edge) this.#right_edge.draw();
    }

    clone() {
        const clone_rec = (node) => {
            if (!node) return null;
            const left_clone = clone_rec(node.getLeft());
            const right_clone = clone_rec(node.getRight());

            const new_node = new TreeNode(node.getLit(), left_clone, right_clone);
            new_node.setCol(node.getCol());
            new_node.setTcol(node.getTcol());
            new_node.setCoords(node.getX(), node.getY());

            if (node.getLeftEdge()) {
                new_node.setLeftEdge(node.getLeftEdge().clone());
            }
            if (node.getRightEdge()) {
                new_node.setRightEdge(node.getRightEdge().clone());
            }

            return new_node;
        };

        return clone_rec(this);
    }


    getLit() { return this.#lit; }
    getLeft() { return this.#left; }
    getRight() { return this.#right; }
    getParent() { return this.#parent; }
    getCol() { return this.#col; }
    getTcol() { return this.#tcol; }
    getX() { return this.#x; }
    getY() { return this.#y; }
    getLeftEdge() { return this.#left_edge; }
    getRightEdge() { return this.#right_edge; }

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
    setX(x) { this.#x = x; }
    setY(y) { this.#y = y; }
    setCoords(x, y) {
        this.setX(x);
        this.setY(y);
    }
    setLeftEdge(le) { this.#left_edge = le; }
    setRightEdge(re) { this.#right_edge = re; }
}
