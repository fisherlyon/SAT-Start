export class ImplGraphNode {
    #lit;       // {type : Integer} Decision/Implication literal
    #declev;    // {type : Integer} Decision Level
    #cause;     // {type : Integer} Clause in Knowledge Base that Caused the Implication (null for decisions)
    #depth;     // {type : Integer} # of Edges from a Decision to the Current Node 
    #col;       // {type : Color} Color of the Node
    #tcol;      // {type : Color} Text Color of the Node
    
    constructor(lit, declev, cause, depth) {
        this.#lit = lit;
        this.#declev = declev;
        this.#cause = cause;
        this.#depth = depth;
        this.#col = 'white';
        this.#tcol = 'black';
    }

    draw(x, y, vars, r) {
        push();
        fill(this.#col);
        ellipse(x, y, r * 2, r * 2);
        fill(this.#tcol);
        let node_text = vars[this.#lit - 1];
        text(this.#lit, x - node_text.length * 4, y + 4);
        pop();
    }

    getLit() { return this.#lit; }
    getDeclev() { return this.#declev; }
    getCause() { return this.#cause; }
    getDepth() { return this.#depth; }
    getCol() { return this.#col; }
    getTcol() { return this.#tcol; }

    setLit(lit) { this.#lit = lit; }
    setDeclev(declev) { this.#declev = declev; }
    setCause(cause) { this.#cause = cause; }
    setDepth(depth) { this.#depth = depth; }
    setCol(col) { this.#col = col; }
    setTcol(tcol) { this.#tcol = tcol; }
}