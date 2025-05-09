import { ImplGraphNode } from "./ImplGraphNode.js";

export class ImplGraph {
    #nodes;     // {type : (Map Integer ImplGraphNode} Vertices (literals -> Nodes)
    #incoming;  // {type : (Map Integer (Listof Integer))} Incoming Edges
    #outgoing;  // {type : (Map Integer (Listof Integer))} Outgoing Edges

    constructor() {
        this.#nodes = new Map();
        this.#incoming = new Map();
        this.#outgoing = new Map();
    }

    addDecision(lit, declev, depth) {
        this.#nodes.set(lit, new ImplGraphNode(lit, declev, null, depth));
        this.#incoming.set(lit, []);
        this.#outgoing.set(lit, []);
    }

    addImplication(lit, declev, cause, depth, nodes_from) {
        this.#nodes.set(lit, new ImplGraphNode(lit, declev, cause, depth));
        this.#incoming.set(lit, nodes_from);
        this.#outgoing.set(lit, []);

        for (const node of nodes_from) {
            if (!this.#outgoing.has(node)) {
                this.#outgoing.set(node, []);
            }
            this.#outgoing.get(node).push(lit);
        }
    }

    getNodes() { return this.#nodes; }
    getIncoming() { return this.#incoming; } 
    getOutgoing() { return this.#outgoing; }

    setNodes(nodes) { this.#nodes = nodes; }
    setIncoming(incoming) { this.#incoming = incoming; }
    setOutgoing(outoing) { this.#outgoing = outoing; }
}
