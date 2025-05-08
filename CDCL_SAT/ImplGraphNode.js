export class ImplGraphNode {
    #lit;
    #declev;
    #cause;
    #depth;
    
    constructor(lit, declev, cause, depth) {
        this.#lit = lit;
        this.#declev = declev;
        this.#cause = cause;
        this.#depth = depth;
    }

    getLit() { return this.#lit; }
    getDeclev() { return this.#declev; }
    getCause() { return this.#cause; }
    getDepth() { return this.#depth; }

    setLit(lit) { this.#lit = lit; }
    setDeclev(declev) { this.#declev = declev; }
    setCause(cause) { this.#cause = cause; }
    setDepth(depth) { this.#depth = depth; }
}