import { ObjectCDCL } from "../CDCL_SAT/ObjectCDCL.js";
import { ImplGraph } from "../CDCL_SAT/ImplGraph.js";
import { ImplGraphNode } from "../CDCL_SAT/ImplGraphNode.js";

export class BFS {
    #queue;
    #rest_queue;
    #visited;
    #result;
    #current;
    #neighbors;

    constructor () {
        this.#queue = new Array();
        this.#rest_queue = null;
        this.#visited = new Set();
        this.#result = new Set();
        this.#current = null;
        this.#neighbors = null;
    }

    initImplGraphBFS(start) {
        this.#queue.push(start);
        this.#result.add(start);
    }


}