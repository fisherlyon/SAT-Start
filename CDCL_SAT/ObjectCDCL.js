import { condition } from "../Utility/Condition.js"
import { ImplGraph } from "./ImplGraph.js"
import { ImplGraphNode } from "./ImplGraphNode.js";
import { Tree } from "../Utility/Tree.js"
import { TreeNode } from "../Utility/TreeNode.js";
import { Edge } from "../Utility/Edge.js";
import { setDiff } from "../Utility/Util.js"
import { ObjectBFS } from "./ObjectBFS.js";
import { ImplGraphManager } from "./ImplGraphManager.js";

/**
 * CDCL Object Class
 * @property { (Arrayof (Arrayof Number)) } KB - Knowledge Base
 * @property { (Arrayof (Arrayof Number)) } temp_kb - Temporary KB - result of unit resolution
 * @property { (Arrayof Number) } D - Decision Sequence
 * @property { (Arrayof (Arrayof Number)) } G - Set of Learned Clauses
 * @property { (Arrayof (Arrayof Number)) } I - Set of literals either presnet as unit clauses in KB or derived from unit resolution
 * @property { Tree } dec_tree - The current decision tree
 * @property { Boolean } valid_tree - Boolean to represent the validity of the tree
 * @property { (Arrayof String) } vars - Set of variables in knowledge base
 * @property { Boolean } contradiction - Boolean to represent if a contradiction has occurred
 * @property { Boolean } sat - Boolean to represent if SAT has occurred
 * @property { String } stage - String to represent the current stage in running
 * @property { ImplGraphManager } impl_graph_manager - Manages the implication graph and the bfs object
 */
export class ObjectCDCL {
    #KB;
    #temp_kb;
    #D;
    #G;
    #I;
    #dec_tree;
    #valid_tree;
    #vars;
    #contradiction;
    #sat;
    #stage;
    #impl_graph_manager
    
    constructor(KB, vars) {
        this.#KB = KB;
        this.#temp_kb = KB;
        this.#D = [];
        this.#G = [];
        this.#I = [];
        this.#dec_tree = null;
        this.#valid_tree = false;
        this.#vars = vars;
        this.#contradiction = false;
        this.#sat = false;
        this.#stage = null;
        this.#impl_graph_manager = new ImplGraphManager();
    }

    /**
     * Performs unit resolution on a knowledge base given the following parameters.
     * @param { (Arrayof (Arrayof Number)) } KB - Knowledge Base
     * @param { (Arrayof (Arrayof Number)) } G - Set of Learned Clauses
     * @param { (Arrayof Number) } D - Decision Sequence
     * @param { (Arrayof Number) } I - Set of literals either present as unit clauses in KB or derived from unit resuloution
     */
    unitRes() {
        const ur = (KB, D, G, I) => {
            let combinedKB = KB.concat(G, this.numsToClauses(D));
            let unitClause = this.findUnitClause(combinedKB);

            if (unitClause.length === 0) {
                this.#I = I.reverse();
                this.#temp_kb = KB;
                return;
            } else {
                return ur(condition(combinedKB, unitClause[0]), [], [], [unitClause[0], ...I]);
            }
        }

        return ur(this.#KB, this.#D, this.#G, []);
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

    invalidateDecTree() {
        this.#dec_tree = null;
        this.#valid_tree = false;
    }

    updateDecisionTree() {
        let color;
        if (this.#contradiction) {
            color = 'red';
        } else if (this.#sat) {
            color = 'green';
        } else {
            color = 'blue';
        }
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

    displayStage(x, y) {
        text("Stage: " + this.#stage, x, y);
    }

    numToVar(num) {
        if (num === 0) {
            return '{ }';
        }
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
        this.#impl_graph_manager.initImplGraph();

        for (let i = 0; i < this.#D.length; i++) {
            this.#impl_graph_manager.addDecision(this.#D[i], i);
        }
    }

    initImplGraphBFS(start, target) {
        this.#impl_graph_manager.initBFS(start, target);
    }

    displayImplGraph(radius) {
        this.#impl_graph_manager.drawGraph(this.#vars, radius);
    }

    updateImplGraphNode(target, color, text_color) {
        this.#impl_graph_manager.updateNodeColor(target, color, text_color);
    }

    findImplClause(lit, temp_d) {
        return this.#impl_graph_manager.findImplicationClause(
            lit, 
            this.#KB.concat(this.#G), 
            this.#D.concat(temp_d), 
            this.#I
        );
    }

    getHDLNode() {
        return this.#impl_graph_manager.getHighestDecisionLevelNode();
    }

    findAllPaths() {
        return this.#impl_graph_manager.findAllPaths();
    }

    findFirstUIP() {
        return this.#impl_graph_manager.findFirstUIP();
    }

    decisionBackTrack() {
        const assertion_level = this.#impl_graph_manager.getBFS().getLevel();
        if (assertion_level === -1) {
            this.#D = [];
        } else {
            this.#D = this.#D.slice(0, Math.min(this.#D.length, assertion_level + 1));
        }
    }

    resetTempKB() {
        this.#contradiction = false;
        this.#temp_kb = this.#KB.concat(this.#G);
    }

    addAssertingClause() {
        this.#G.push(this.#impl_graph_manager.getBFS().getClause());
    }

    displaySATMessage(x, y) {
        text("Satisfied with TVA: " + this.#I.map((x) => (this.numToVar(x))), x, y);
    }

    resetImplGraph() {
        this.#impl_graph_manager.reset();
    }

    clone() {
        const copy = new ObjectCDCL(
            JSON.parse(JSON.stringify(this.#KB)), 
            [...this.#vars]
        );

        // Deep copy remaining fields
        copy.#temp_kb = JSON.parse(JSON.stringify(this.#temp_kb));
        copy.#D = [...this.#D];
        copy.#G = JSON.parse(JSON.stringify(this.#G));
        copy.#I = [...this.#I];

        if (this.#dec_tree) copy.#dec_tree = this.#dec_tree.clone();
        copy.#valid_tree = this.#valid_tree;

        copy.#contradiction = this.#contradiction;
        copy.#sat = this.#sat;
        copy.#stage = this.#stage;
    
        if (this.#impl_graph_manager) {
            copy.#impl_graph_manager = this.#impl_graph_manager.clone();
        } else {
            copy.#impl_graph_manager = new ImplGraphManager();
        }

        return copy;
    }

    getKB() { return this.#KB; }
    getTempKB() { return this.#temp_kb; }
    getD() { return this.#D; }
    getI() { return this.#I; }
    getG() { return this.#G; }
    getDecTree() { return this.#dec_tree; }
    getDecTreeValidity() { return this.#valid_tree; }
    getContradiction() { return this.#contradiction; }
    getSAT() { return this.#sat; }
    getStage() { return this.#stage; }
    getImplGraph() { return this.#impl_graph_manager.getGraph(); }
    getImplGraphBFS() { return this.#impl_graph_manager.getBFS(); }

    setDecTreeValidity(bool) { this.#valid_tree = bool; }
    setDecTree(tree) { this.#dec_tree = tree; }
    setStage(stage) { this.#stage = stage; }
}