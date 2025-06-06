import { ObjectCDCL } from "./ObjectCDCL.js";
import { ImplGraph } from "./ImplGraph.js";
import { ImplGraphNode } from "./ImplGraphNode.js";

export class ObjectBFS {
    #impl_graph
    #queue;
    #rest_queue;
    #visited;
    #result;
    #current;
    #neighbors;
    #target;
    #clause;
    #level;

    constructor (impl_graph, target) {
        this.#impl_graph = impl_graph;
        this.#queue = new Array();
        this.#rest_queue = null;
        this.#visited = new Set();
        this.#result = new Set();
        this.#current = null;
        this.#neighbors = null;
        this.#target = target;
        this.#clause = null;
        this.#level = null;
    }

    update() {
        if (this.#queue.length > 0) {
            [this.#current, ...this.#rest_queue] = this.#queue;
            this.#neighbors = this.#impl_graph.getIncoming().get(this.#current);
        } else {
            this.#current = null;
            this.#rest_queue = null;
            this.#neighbors = null;
        }
    }

    step() {
        if (this.#queue.length > 0) {
            if (this.#current === this.#target) {
                this.#queue = this.#rest_queue;
                this.#visited.add(this.#current);
            } else if (this.#result.has(this.#current)) {
                if (this.#neighbors.length === 0) {
                    this.#queue = this.#rest_queue;
                    this.#visited.add(this.#current);
                } else {
                    let new_neighbors = this.#neighbors.filter((n) => (!(this.#visited.has(n))));
                    this.#queue = this.#rest_queue.concat(new_neighbors);
                    this.#result.delete(this.#current);
                    this.#result = this.#result.union(new Set(new_neighbors));
                    this.#visited.add(this.#current);
                }
            } else {
                this.#queue = this.#rest_queue.concat(this.#neighbors.filter((n) => (!(this.#visited.has(n)))));
                this.#visited.add(this.#current);
            }
        } else {
            this.#clause = Array.from(this.#result).map((x) => (-x));
            this.#level = this.getAssertionLevel();
        }
    }

    getAssertionLevel() {
        let declevs = this.#clause.map(
            (x) => this.#impl_graph.getNodes().get(-x).getDeclev()
        );

        if (declevs.length <= 1) {
            return -1;
        }
        declevs.sort((a, b) => b - a);
        return declevs[1]; // return the second highest
    }


    display(cdcl_obj, x, y, y_incr) {
        text("Current Node: " + (this.#current === null ? "None" : cdcl_obj.numToVar(this.#current)), x, y);
        text("Incoming Neighbors: " + (this.#neighbors === null ? "None" : this.#neighbors.map((x) => (cdcl_obj.numToVar(x)))), x, y + y_incr * 1)
        text("Queue: " + (this.#queue.length === 0 ? "Empty" : this.#queue.map((x) => (cdcl_obj.numToVar(x)))), x, y + y_incr * 2);
        text("Nodes Visited: " + (this.#visited.size === 0 ? "None" : Array.from(this.#visited).map((x) => (cdcl_obj.numToVar(x)))), x, y + y_incr * 3);
        text("Conflict Set: " + (this.#result.size === 0 ? "Empty" : Array.from(this.#result).map((x) => (cdcl_obj.numToVar(x)))), x, y + y_incr * 4);
        if (this.#clause !== null) {
            text("Asserting Clause: " + "{ " + this.#clause.map((x => cdcl_obj.numToVar(x))) + " }", x, y + y_incr * 5);
            text("Assertion Level: " + this.#level, x, y + y_incr * 6);
        }
    }

    updateImplGraph() {
        const nodes = this.#impl_graph.getNodes();
        for (let v of this.#visited) {
            nodes.get(v).setCol(color(96, 96, 96));
            nodes.get(v).setTcol('white');
        }

        if (this.#current !== null) {
            nodes.get(this.#current).setCol('blue');
            nodes.get(this.#current).setTcol('white');
        }
    }

    clone() {
        const copy = new ObjectBFS(
            this.#impl_graph ? this.#impl_graph.clone() : null, // Clone the graph
            this.#target
        );
        
        copy.#queue = [...this.#queue];
        copy.#rest_queue = this.#rest_queue ? [...this.#rest_queue] : null;
        copy.#visited = new Set(this.#visited);
        copy.#result = new Set(this.#result);
        copy.#current = this.#current;
        copy.#neighbors = this.#neighbors ? [...this.#neighbors] : null;
        copy.#clause = this.#clause ? [...this.#clause] : null;
        copy.#level = this.#level;

        return copy;
    }


    getQueue() { return this.#queue; }
    getResult() { return this.#result; }
    getClause() { return this.#clause; }
    getLevel() { return this.#level; }
}