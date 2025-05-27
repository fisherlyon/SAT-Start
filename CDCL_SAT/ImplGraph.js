import { ImplGraphNode } from "./ImplGraphNode.js";
import { Edge } from "../Utility/Edge.js"

/**
 * Implication Graph
 * @property {(Map Number ImplGraphNode)} nodes - Vertices (literals -> Nodes)
 * @property {(Map Number (Arrayof Number))} incoming - Incoming Edges
 * @property {(Map Number (Arrayof Number))} outgoing - Outgoing Edges
 */
export class ImplGraph {
    #nodes;
    #incoming;
    #outgoing;

    constructor() {
        this.#nodes = new Map();
        this.#incoming = new Map();
        this.#outgoing = new Map();
    }

    drawGraph(vars, r) {
        const [dec_nodes, impl_nodes] = this.separateNodes(); // separate the decision and implication nodes
        const y_dec_separation = height / (dec_nodes.length + 1); // get a base y-gap between decision nodes
        const x_separation = 65; // get a base x-gap between nodes
        let edges = [];

        // set the coordinates of the decision nodes
        for (let i = 0; i < dec_nodes.length; i++) {
            dec_nodes[i].setCoords(x_separation, y_dec_separation * (i + 1));
        }

        // prepare to set the coordinates of the implication nodes
        let depth = 1; // keep track of depth for x offset
        let y_impl_separation;
        let x_impl_separation;

        while (true) {
            let temp = []; // collect all nodes at given depth

            for (let i = 0; i < impl_nodes.length; i++) {
                if (impl_nodes[i].getDepth() === depth) {
                    temp.push(impl_nodes[i]);
                }
            }

            if (temp.length === 0) { // if there aren't any, no more to explore so break
                break;
            }

            y_impl_separation = height / (temp.length + 1); // update y offset
            x_impl_separation = x_separation * (1 + depth); // update x offset

            // for each of the nodes at the given depth, collect the coords and create an edge to the incoming nodes
            for (let i = 0; i < temp.length; i++) {
                let temp_incoming = this.#incoming.get(temp[i].getLit()); 

                for (let j = 0; j < temp_incoming.length; j++) {
                    let temp_node = this.#nodes.get(temp_incoming[j]);
                    edges.push(new Edge(x_impl_separation, y_impl_separation, temp_node.getX(), temp_node.getY()));
                }
                temp[i].setCoords(x_impl_separation, y_impl_separation);
            }

            depth += 1; // increment the depth
        }

        this.drawEdges(edges); // draw the edges
        this.drawNodes(dec_nodes, vars, r); // draw the decision nodes
        this.drawNodes(impl_nodes, vars, r); // draw the implication nodes
    }

    drawNodes(nodes, vars, r) {
        for (let node of nodes) {
            node.draw(vars, r);
        }
    }

    drawEdges(edges) {
        let flip = 1;
        for (let edge of edges) {
            if (edge.draw(flip)) {
                flip *= -1;
            };
        }
    }

    addDecision(lit, declev) {
        let ig_node = new ImplGraphNode(lit, declev, null, 0);
        ig_node.setCol('green');
        ig_node.setTcol('white');
        this.#nodes.set(lit, ig_node);
        this.#incoming.set(lit, []);
        this.#outgoing.set(lit, []);
    }

    addImplication(lit, declev, cause, depth, nodes_from) {
        let ig_node = new ImplGraphNode(lit, declev, cause, depth);
        ig_node.setCol(ig_node.getLit() === 0 ? 'red' : 'orange');
        ig_node.setTcol('white');
        this.#nodes.set(lit, ig_node);
        this.#incoming.set(lit, nodes_from);
        this.#outgoing.set(lit, []);

        for (const node of nodes_from) {
            if (!this.#outgoing.has(node)) {
                this.#outgoing.set(node, []);
            }
            this.#outgoing.get(node).push(lit);
        }
    }

    separateNodes() {
        let dec_nodes = [];
        let impl_nodes = [];
        for (let value of this.#nodes.values()) {
            if (value.getCause() === null) {
                dec_nodes.push(value);
            } else {
                impl_nodes.push(value);
            }
        }
        return [dec_nodes, impl_nodes];
    }

    getNodes() { return this.#nodes; }
    getIncoming() { return this.#incoming; } 
    getOutgoing() { return this.#outgoing; }

    setNodes(nodes) { this.#nodes = nodes; }
    setIncoming(incoming) { this.#incoming = incoming; }
    setOutgoing(outoing) { this.#outgoing = outoing; }
}
