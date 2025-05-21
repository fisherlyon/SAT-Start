import { condition } from "../Utility/Condition.js"
import { ImplGraph } from "./ImplGraph.js"
import { ImplGraphNode } from "./ImplGraphNode.js";
import { Tree } from "../Utility/Tree.js"
import { TreeNode } from "../Utility/TreeNode.js";
import { Edge } from "../Utility/Edge.js";

/**
 * CDCL Object Class
 * @property {(Arrayof (Arrayof Number))} KB - Knowledge Base
 * @property {(Arrayof (Arrayof Number))} temp_kb - Temporary KB - result of unit resolution
 * @property {(Arrayof Number)} D - Decision Sequence
 * @property {(Arrayof (Arrayof Number))} G - Set of Learned Clauses
 * @property {(Arrayof (Arrayof Number))} I - Set of literals either presnet as unit clauses in KB or derived from unit resolution
 * @property {Tree} dec_tree - The current decision tree
 * @property {ImplGraph} impl_graph - The current implication graph
 * @property {(Arrayof String)} vars - Set of variables in knowledge base
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
     * @param {(Arrayof (Arrayof Number))} KB - Knowledge Base
     * @param {(Arrayof (Arrayof Number))} G - Set of Learned Clauses
     * @param {(Arrayof Number)} D - Decision Sequence
     * @param {(Arrayof Number)} I - Set of literals either present as unit clauses in KB or derived from unit resuloution
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
            this.unitRes(condition(combinedKB, unitClause[0]), [], [], I);
        }
    }

    /**
     * Takes in a set of "decisions" and converts them to a set of unit clauses.
     * @param {(Arrayof Number)} nums 
     * @returns {(Arrayof (Arrayof Number))}
     */
    numsToClauses(nums) {
        if (nums.length === 0) return [];
        const [f, ...r] = nums;
        return [[f], ...this.numsToClauses(r)];
    }

    /**
     * Given a set of clauses (KB), returns a clause of length one (unit clause).
     * @param {(Arrayof (Arrayof Number))} KB - Knowlege Base
     * @returns {(Arrayof (Number))} - The found unit clause, if there is one
     */
    findUnitClause(KB) {
        if (KB.length === 0) return [];
        const [f, ...r] = KB;
        if (f.length === 1) return f;
        else return this.findUnitClause(r);
    }

    /**
     * Returns the next decision.
     * @returns {Number} - 0 if KB is empty, otherwise, the first lit of the first clause
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
                    udt(root.getLeft(), r);
                } else {
                    if (root.getRightEdge()) root.getRightEdge().setColor(color);
                    udt(root.getRight(), r);
                }
            }

            if ((this.#contradiction || this.#sat) && D.length === 0) {
                root.setCol(color);
                root.setTcol(tcolor);
            }
        }

        udt(this.#dec_tree.getRoot(), this.#D);
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

    getTempKB() { return this.#temp_kb; }
    getD() { return this.#D; }
    getDecTree() { return this.#dec_tree; }
    getContradiction() { return this.#contradiction; }
    getSAT() { return this.#sat; }
    getImplGraph() { return this.#impl_graph; }

    setDecTreeValidity(bool) { this.#valid_tree = bool; }
    setDecTree(tree) { this.#dec_tree = tree; }
    setImplGraphhValidity(bool) { this.#valid_ig = bool; }
}