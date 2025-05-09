export class ImplGraph {
    #nodes;     // {type : (Map Integer ImplGraphNode} Vertices (literals -> Nodes)
    #incoming;  // {type : (Map Integer (Listof Integer))} Incoming Edges
    #outgoing;  // {type : (Map Integer (Listof Integer))} Outgoing Edges

    constructor() {
        this.#nodes = new Map();
        this.#incoming = new Map();
        this.#outgoing = new Map();
    }
}
