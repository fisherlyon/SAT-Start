import { condition } from "../Utility/Condition.js"
import { ImplGraph } from "./ImplGraph.js"
import { ImplGraphNode } from "./ImplGraphNode.js";
import { Tree } from "../Utility/Tree.js"
import { TreeNode } from "../Utility/TreeNode.js";
import { Edge } from "../Utility/Edge.js";
import { setDiff } from "../Utility/Util.js"

/**
 * CDCL Object Class
 * @property { (Arrayof (Arrayof Number)) } KB - Knowledge Base
 * @property { (Arrayof (Arrayof Number)) } temp_kb - Temporary KB - result of unit resolution
 * @property { (Arrayof Number) } D - Decision Sequence
 * @property { (Arrayof (Arrayof Number)) } G - Set of Learned Clauses
 * @property { (Arrayof (Arrayof Number)) } I - Set of literals either presnet as unit clauses in KB or derived from unit resolution
 * @property { Tree } dec_tree - The current decision tree
 * @property { ImplGraph } impl_graph - The current implication graph
 * @property { (Arrayof String) } vars - Set of variables in knowledge base
 */
export class ObjectCDCL {
    #KB;
    #temp_kb;
    #D;
    #G;
    #I;
    #dec_tree;
    #valid_tree;
    #impl_graph;
    #valid_ig;
    #vars;
    #contradiction;
    #sat;
    
    constructor(KB, vars) {
        this.#KB = KB;
        this.#temp_kb = KB;
        this.#D = [];
        this.#G = [];
        this.#I = [];
        this.#dec_tree = null;
        this.#valid_tree = false;
        this.#impl_graph = null;
        this.#valid_ig = false;
        this.#vars = vars;
        this.#contradiction = false;
        this.#sat = false;
    }

    /**
     * Performs unit resolution on a knowledge base given the following parameters.
     * @param { (Arrayof (Arrayof Number)) } KB - Knowledge Base
     * @param { (Arrayof (Arrayof Number)) } G - Set of Learned Clauses
     * @param { (Arrayof Number) } D - Decision Sequence
     * @param { (Arrayof Number) } I - Set of literals either present as unit clauses in KB or derived from unit resuloution
     */
    unitRes(KB = this.#KB, D = this.#D, G = this.#G, I = this.#I) {
        let combinedKB = KB.concat(this.numsToClauses(D), G);
        let unitClause = this.findUnitClause(combinedKB);

        if (unitClause.length === 0) {
            this.#I = I.reverse();
            this.#temp_kb = combinedKB;
            return;
        } else {
            I.push(unitClause[0]);
            return this.unitRes(condition(combinedKB, unitClause[0]), [], [], I);
        }
    }

    /**
     * Takes in a set of "decisions" and converts them to a set of unit clauses.
     * @param { (Arrayof Number) } nums 
     * @returns { (Arrayof (Arrayof Number)) }
     */
    numsToClauses(nums) {
        if (nums.length === 0) return [];
        const [f, ...r] = nums;
        return [[f], ...this.numsToClauses(r)];
    }

    /**
     * Given a set of clauses (KB), returns a clause of length one (unit clause).
     * @param { (Arrayof (Arrayof Number)) } KB - Knowlege Base
     * @returns { (Arrayof (Number)) } - The found unit clause, if there is one
     */
    findUnitClause(KB) {
        if (KB.length === 0) return [];
        const [f, ...r] = KB;
        if (f.length === 1) return f;
        else return this.findUnitClause(r);
    }

    /**
     * Returns the next decision.
     * @returns { Number } - 0 if KB is empty, otherwise, the first lit of the first clause
     */
    getNextDecision() {
        if (this.#temp_kb.length === 0) return 0;
        else return this.#temp_kb[0][0];
    }

    addDecision(dec) {
        if (!this.#valid_tree || this.#dec_tree === null) {
            this.#dec_tree = new Tree();
            this.#dec_tree.generateTree(1);
            this.#valid_tree = true;
        }        

        this.#D.push(dec); // add the decision to the set of decisions
        this.#dec_tree.addNodes(this.#D.length + 1); // add the decision to the decision tree
    }

    displayDecisionTree(dist, rad, ascale) {
        if (!this.#valid_tree || this.#dec_tree === null) { // if the tree is invalid, i.e. there isn't one or a new set up decisions is being made
            this.#dec_tree = new Tree();
            this.#dec_tree.generateTree(1);
            this.#valid_tree = true;
        }

        this.#dec_tree.setNodeCoords(this.#dec_tree.getRoot(), width / 2, height / 10, dist, (5 * PI) / 6, PI / 6, rad, ascale);
        let node_vars = this.#D.map((x) => (this.#vars[Math.abs(x) - 1]));
        node_vars.push(" ");
        this.#dec_tree.drawTree(node_vars, rad);
    }

    updateDecisionTree() {
        let color = this.#contradiction ? 'red' : 'blue';
        let tcolor = 'white';

        // inner recursive function
        const udt = (root, D) => {
            if (root === null) return;
        
            if (D.length > 0) {
                let [f, ...r] = D;
                root.setCol(color);
                root.setTcol(tcolor);
                if (f > 0) {
                    if (root.getLeftEdge()) root.getLeftEdge().setColor(color);
                    return udt(root.getLeft(), r);
                } else {
                    if (root.getRightEdge()) root.getRightEdge().setColor(color);
                    return udt(root.getRight(), r);
                }
            }

            if ((this.#contradiction || this.#sat) && D.length === 0) {
                root.setCol(color);
                root.setTcol(tcolor);
            }
        };

        return udt(this.#dec_tree.getRoot(), this.#D);
    }

    displayKB(x, y) {
        let formula_text = `{${this.#temp_kb.map(clause => `{${clause.map(lit => this.numToVar(lit)).join(' v ')}}`).join(' ∧\n')}}`;
        formula_text = formula_text + (this.#contradiction ? " => CONDRADICTION\nLet's build the implication graph..." : "");
        formula_text = formula_text + (this.#sat ? " => SATISFIED" : "");
        text("Formula:\n" + formula_text, x, y);
    }

    displayD(x, y) {
        let decisionText;
        if (this.#D.length === 0) {
            decisionText = "None";
        } else {
            decisionText = this.#D.map(lit => this.numToVar(lit)).join(', ');
        }
        text("Current Decision(s): " + decisionText, x, y);
    }

    numToVar(num) {
        if (num < 0) {
          return "¬" + this.#vars[Math.abs(num) - 1];
        }
        return this.#vars[num - 1];
    }

    checkContradiction() {
        this.#contradiction = this.#temp_kb.length === 1 && this.#temp_kb[0].length === 0;
    }

    checkSAT() {
        this.#sat = this.#temp_kb.length === 0;
    }

    initImplGraph() {
        if (!this.#valid_ig || this.#impl_graph === null) {
            this.#impl_graph = new ImplGraph();
            this.#valid_ig = true;
        }

        for (let i = 0; i < this.#D.length; i++) {
            this.#impl_graph.addDecision(this.#D[i], i);
        }
    }

    displayImplGraph(radius) {
        if (!this.#valid_ig || this.#impl_graph === null) {
            this.#impl_graph = new ImplGraph();
            this.#valid_ig = true;
        }

        this.#impl_graph.drawGraph(this.#vars, radius);
    }

    findImplClause(lit, temp_d) {
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

        return fic(this.#KB.concat(this.#G), this.#impl_graph, this.#D.concat(temp_d), this.#I, lit, 0);
    }

    /**
     * Gets the decision node made at the highest level in the implication graph.
     * Used to find the first Unique Implication Point (UIP) (graph dominator)
     * @param { ImplGraph } graph - This CDCL object's current implication graph
     * @param { (Arrayof Numebrs) } keys - The literals of the nodes in the implication graph
     * @returns { Number } Returns the decision node made at the highest level 
     */
    getHDLNode() {
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
     * @param { (Map Number (Arrayof Number)) } outgoing_adj_list - Outgoing adjacency list for each of the nodes n the implication graph
     * @param { Number } source - The source node
     * @param { Number } target - The target node 
     * @param { (Arrayof (Arrayof Number)) } queue - Queue of paths used in BFS
     * @param { (Arrayof (Arrayof Number)) } result - The resulting array of all paths
     * @returns { (Arrayof (Arrayof Number)) } The resulting array of all paths
     */
    findAllPaths() {
        const ap = (outgoing_adj_list, source, target) => {
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

        return ap(this.#impl_graph.getOutgoing(), this.getHDLNode(), 0);
    }

    findFirstUIP() {
        const getFirst = (all_paths) => {
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

    getAsserting() {
        const gac = (incoming_adj_list, source, target) => {
            const bfs = (queue, visited, result) => {

            };
        };
    }

    getTempKB() { return this.#temp_kb; }
    getD() { return this.#D; }
    getI() { return this.#I; }
    getDecTree() { return this.#dec_tree; }
    getContradiction() { return this.#contradiction; }
    getSAT() { return this.#sat; }
    getImplGraph() { return this.#impl_graph; }

    setDecTreeValidity(bool) { this.#valid_tree = bool; }
    setDecTree(tree) { this.#dec_tree = tree; }
    setImplGraphhValidity(bool) { this.#valid_ig = bool; }
}