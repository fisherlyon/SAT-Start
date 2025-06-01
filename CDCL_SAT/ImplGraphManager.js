import { ImplGraph } from "./ImplGraph.js";
import { ImplGraphNode } from "./ImplGraphNode.js";
import { setDiff } from "../Utility/Util.js";
import { ObjectBFS } from "./ObjectBFS.js";

export class ImplGraphManager {
    #impl_graph;
    #bfs;

    constructor() {
        this.#impl_graph = null;
        this.#bfs = null;
    }

    initImplGraph() {
        this.#impl_graph = null;
        this.#impl_graph = new ImplGraph();
    }

    initBFS(start, target) {
        this.#bfs = null;
        this.#bfs = new ObjectBFS(this.#impl_graph, target);
        this.#bfs.getQueue().push(start);
        this.#bfs.getResult().add(start);
    }

    ensureInit() {
        if (this.#impl_graph === null) {
            this.initImplGraph();
        }
    }

    addDecision(decision, level) {
        this.ensureInit();
        this.#impl_graph.addDecision(decision, level);
    }

    drawGraph(vars, radius) {
        this.ensureInit();
        this.#impl_graph.drawGraph(vars, radius);
    }

    /**
     * 
     * @param {*} lit 
     * @param {*} KB 
     * @param {*} D 
     * @param {*} I 
     * @returns 
     */
    findImplicationClause(lit, KB, D, I) {
        /**
         * 
         * @param {*} KB 
         * @param {*} graph 
         * @param {*} D 
         * @param {*} I 
         * @param {*} impl_lit 
         * @param {*} kb_index 
         * @returns 
         */
        const fic = (KB, graph, D, I, impl_lit, kb_index) => {

            if (KB.length === 0) {
                console.log("Error: No implication clause found.\n");
                return;
            }

            let [f, ...r] = KB;

            if (lit === 0) {
                if (f.every((x) => (I.includes(-x)))) {
                    let nodes_from = (setDiff(f, [impl_lit])).map((x) => (-x));
                    graph.addImplication(
                        impl_lit,
                        Math.max(...(nodes_from.map((key) => ((graph.getNodes().get(key)).getDeclev())))),
                        kb_index,
                        1 + Math.max(...(nodes_from.map((key) => ((graph.getNodes().get(key)).getDepth())))),
                        nodes_from
                    );
                    return;
                } 
                return fic(r, graph, D, I, impl_lit, 1 + kb_index);
            }

            if (
                f.includes(impl_lit) && 
                f.every((x) => (D.map((y) => (-y)).concat([impl_lit]).includes(x)))
            ) {
                let nodes_from = (setDiff(f, [impl_lit])).map((x) => (-x));
                graph.addImplication(
                    impl_lit,
                    Math.max(...(nodes_from.map((key) => ((graph.getNodes().get(key)).getDeclev())))),
                    kb_index,
                    1 + Math.max(...(nodes_from.map((key) => ((graph.getNodes().get(key)).getDepth())))),
                    nodes_from
                );
                return;
            }
            return fic(r, graph, D, I, impl_lit, 1 + kb_index);
        };

        return fic(KB, this.#impl_graph, D, I, lit, 0);
    }

    /**
     * Returns the literal that points to the decision node made at the highest decision level.
     * Used to find the first Unique Implication Point (UIP) (highest graph dominator)
     * @returns { Number }
     */
    getHighestDecisionLevelNode() {
        /**
         * @param { ImplGraph } graph - This CDCL object's current implication graph
         * @param { (Arrayof Numebrs) } keys - The literals of the nodes in the implication graph
         * @returns { Number }
         */
        const hdl = (graph, keys) => {
            if (keys.length === 0) {
                console.log("Error: Couldn't find decision node made at the highest level.");
                return;
            }

            let [f, ...r] = keys;

            if (
                graph.getNodes().get(f).getCause() === null &&
                graph.getNodes().get(f).getDeclev() === graph.getNodes().get(0).getDeclev()
            ) {
                return f;
            } else {
                return hdl(graph, r);
            }
        }

        return hdl(this.#impl_graph, Array.from(this.#impl_graph.getNodes().keys()));
    }

    /**
     * Finds all possible paths from the decsion node made at the highest decision level to the contracdiction.
     * @returns { (Arrayof (Arrayof Number)) }
     */
    findAllPaths() {
    /**
     * @param { (Map Number (Arrayof Number)) } outgoing_adj_list - Outgoing adjacency list for each of the nodes n the implication graph
     * @param { Number } source - The source node
     * @param { Number } target - The target node 
     * @returns { (Arrayof (Arrayof Number)) }
     */
        const ap = (outgoing_adj_list, source, target) => {
            /**
             * @param { (Arrayof (Arrayof Number)) } queue - Queue of paths used in BFS
             * @param { (Arrayof (Arrayof Number)) } result - The resulting array of all paths
             * @returns { (Arrayof (Arrayof Number)) }
             */
            const bfs = (queue, result) => {
                if (queue.length === 0) {
                    return result;
                }

                let [path, ...rest_queue] = queue;
                let node = path[path.length - 1];
                let neighbors = outgoing_adj_list.get(node) || [];

                if (node === target) {
                    return bfs(rest_queue, [path, ...result]);
                } else {
                    let new_paths = neighbors.map((n) => (path.concat([n])));
                    return bfs(rest_queue.concat(new_paths), result);
                }
            };

            return (bfs([[source]], [])).reverse();
        };

        return ap(this.#impl_graph.getOutgoing(), this.getHighestDecisionLevelNode(), 0);
    }

    /**
     * 
     * @returns 
     */
    findFirstUIP() {
        /**
         * 
         * @param {*} all_paths 
         * @returns 
         */
        const getFirst = (all_paths) => {
            /**
             * 
             * @param {*} first_path 
             * @returns 
             */
            const findUIPs = (first_path) => {
                if (first_path.length === 1 && first_path[0] === 0) {
                    return []; // don't include the contradiction, return
                }

                let [f, ...r] = first_path;
                let [, ...rest] = all_paths;
                
                if (rest.every((other_path) => (other_path.includes(f)))) {
                    return [f, ...findUIPs(r)];
                } else {
                    return findUIPs(r);
                }
            };

            let uips = findUIPs(all_paths[0]);
            return uips[uips.length - 1];
        };

        return getFirst(this.findAllPaths());
    }

    updateNodeColor(target, color, text_color) {
        let nodes = this.#impl_graph.getNodes();
        nodes.get(target).setCol(color);
        nodes.get(target).setTcol(text_color);
    }

    reset() {
        this.#impl_graph = null;
        this.#bfs = null
    }

    clone() {
        const copy = new ImplGraphManager();
        if (this.#impl_graph) copy.#impl_graph = this.#impl_graph.clone();
        if (this.#bfs) copy.#bfs = this.#bfs.clone();

        return copy;
    }

    getGraph() { return this.#impl_graph; }
    getBFS() { return this.#bfs; }
}