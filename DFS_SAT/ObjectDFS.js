import { Tree } from "../Utility/Tree.js";
import { TreeNode } from "../Utility/TreeNode.js";
import { Edge } from "../Utility/Edge.js";
import { condition } from "../Utility/Condition.js";

export class ObjectDFS {
    #KB;
    #vars;
    #radius;
    #angle_scale;
    #distance;
    #kb_state_stack;
    #tree;
    #cur_node;
    #cur_decision;
    #dec_stack;
    #path;
    #sat;
    #stage;

    constructor(KB, vars, radius, angle_scale, distance) {
        this.#KB = KB;
        this.#vars = vars;
        this.#radius = radius;
        this.#angle_scale = angle_scale;
        this.#distance = distance;
        this.#kb_state_stack = new Array();
        this.#tree = new Tree();
        this.#cur_node = null;
        this.#cur_decision = null;
        this.#dec_stack = null;
        this.#path = new Array();
        this.#sat = -1;
        this.#stage = null;
    }

    init() {
        this.#tree.generateTree(this.#vars.length);
        this.#tree.setNodeCoords(this.#tree.getRoot(), width / 2, height / 10, this.#distance, (5 * PI) / 6, PI / 6, this.#radius, this.#angle_scale);
        this.#cur_node = this.#tree.getRoot();
        this.#dec_stack = [this.#cur_node.getLit(), -this.#cur_node.getLit()];
        this.#stage = "Initialization";
        redraw();
        this.render();
    }

    step(dec) {
        if (this.#cur_node !== null) {
            return dec > 0 ? this.#cur_node.getLeft() : this.#cur_node.getRight();
        }
    }

    unstep() {
        if (this.#cur_node !== null) {
            return this.#cur_node.getParent();
        }
    }

    /**
     * Updates the current decision, the current node, the knowledge base, and the current path.
     * @returns {void}
     */
    processingUpdate() {
        this.#cur_decision = this.#dec_stack.shift();
        while (Math.abs(this.#cur_decision) !== this.#cur_node.getLit()) {
            this.updateNodeColors(this.#cur_node, this.#cur_decision, 'red', 'white', 'red');
            this.#KB = this.#kb_state_stack.shift();
            this.#cur_node = this.unstep();
            this.#path.pop();
        }
        this.#path.push(this.#cur_decision);
        this.updateNodeColors(this.#cur_node, this.#cur_decision, 'blue', 'white', 'blue');
        this.render();
    }

    /**
     * Updates the knowledge base based on the current decision and conditioning.
     * @returns {void}
     */
    conditionUpdate() {
        this.#kb_state_stack.unshift(this.#KB);
        this.#KB = condition(this.#KB, this.#cur_decision);
        this.render();
    }

    /**
     * Updates the current node, processes the updated knowledge base, and displays updated tree.
     * If the knowledge base is empty, it indicates a satisfiable solution.
     * If the knowledge base has one empty clause, it indicates an unsatisfiable solution.
     * Otherwise, it continues the DFS process.
     * @returns {void}
     */
    stepUpdate() {
        if (this.checkSAT()) {
            this.updateRest(this.#cur_node, this.#cur_decision, 'green', 'white', 'green');
            this.#sat = 1;
            this.#stage += " - Formula Satisfied"
            this.render();
        } else if (this.checkContradiction()) {
            this.#stage += " - ❌Invalid Decision";
            this.updateNodeColors(this.#cur_node, this.#cur_decision, 'red', 'white', 'red');
            this.#path.pop();
            this.render();
            this.#KB = this.#kb_state_stack.shift();
            if (this.#dec_stack.length === 0) {
                this.#sat = 0;
                this.#stage += " - Formula is Unsatisfiable";
                this.render();
            }
        } else {
            this.#stage += " - ✅Proceed";
            this.updateNodeColors(this.#cur_node, this.#cur_decision, 'green', 'white', 'green');
            this.#cur_node = this.step(this.#cur_decision);
            this.#dec_stack.unshift(-this.#cur_node.getLit());
            this.#dec_stack.unshift(this.#cur_node.getLit());
            this.render();
        }
    }

    /**
     * Updates the fill color and text color of a node.
     * @param {TreeNode} node - The node to update.
     * @param {number} dec - The decision value.
     * @param {string} col - The color to set.
     * @param {string} tcol - The text color to set.
     * @param {string} ecol - The edge color to set.
     */
    updateNodeColors(node, dec, col, tcol, ecol) {
        node.setCol(col);
        node.setTcol(tcol);
        if (dec >= 0 && node.getLeftEdge()) node.getLeftEdge().setColor(ecol);
        if (dec <= 0 && node.getRightEdge()) node.getRightEdge().setColor(ecol);
        if (dec < 0 && node.getLeftEdge() && node.getLeftEdge().getColor() === 'green') {
            node.getLeftEdge().setColor('red');
        }
    }

    /**
     * Recursively updates the colors of the nodes in the tree.
     * @param {TreeNode} node - The current node.
     * @param {number} dec - The decision value.
     * @param {string} col - The color to set.
     * @param {string} tcol - The text color to set.
     * @param {string} ecol - The edge color to set.
     */
    updateRest(node, dec, col, tcol, ecol) {
        this.updateNodeColors(node, dec, col, tcol, ecol);
        if (node.getLeft() && dec >= 0) {
            this.updateRest(node.getLeft(), 0, col, tcol, ecol);
        }

        if (node.getRight() && dec <= 0) {
            this.updateRest(node.getRight(), 0, col, tcol, ecol);
        }
    }

    numToVar(num) {
        if (num < 0) {
            return "¬" + this.#vars[Math.abs(num) - 1];
        }
        return this.#vars[num - 1];
    }

    render() {
        this.#tree.drawTree(this.#vars, this.#radius);
        this.displayDecision();
        this.displayFormula();
        this.displayPath();
        this.displayStage();
    }

    displayDecision() {
        let dec_text = (this.#cur_decision === null) ? "None" : this.numToVar(this.#cur_decision);
        text("Current Decision: " + dec_text, width * 0.55, 3 * height / 5);
    }

    displayFormula() {
        let formula_text = `{${this.#KB.map(clause => `{${clause.map((x) => (this.numToVar(x))).join(' v ')}}`).join(' ∧\n')}}`;
        formula_text = formula_text + ((this.#sat === 0) ? " => UNSATISFIABLE" : "");
        formula_text = formula_text + ((this.#sat === 1) ? " => SATISFIED" : "");
        formula_text = formula_text + (this.checkContradiction() ? " => CONTRADICTION" : "");
        text("Formula:\n" + formula_text, width / 20, 3 * height / 5);
    }

    displayPath() {
        let path_text = (this.#path.length === 0) ? "None" : this.#path.map((x) => (this.numToVar(x))).join(', ');
        text("Current Path: " + path_text, width * 0.55, 3 * height / 5 + 20)
    }

    displayStage() {
        text("Stage: " + this.#stage, width * 0.05, 375);
    }

    checkContradiction() {
        return this.#KB.length === 1 && this.#KB[0].length === 0;
    }

    checkSAT() {
        return this.#KB.length === 0;
    }

    clone() { 
        const copy = new ObjectDFS(
            JSON.parse(JSON.stringify(this.#KB)),
            [...this.#vars],
            this.#radius,
            this.#angle_scale,
            this.#distance
        );

        copy.#kb_state_stack = this.#kb_state_stack.map(state => JSON.parse(JSON.stringify(state)));
        copy.#tree = this.#tree.clone();
        copy.#cur_node = this.#cur_node.clone();
        copy.#cur_decision = this.#cur_decision;
        copy.#dec_stack = [...this.#dec_stack];
        copy.#path = [...this.#path];
        copy.#sat = this.#sat;
        copy.#stage = this.#stage;

        return copy;
    }

    getSAT() { return this.#sat === 1; }
    getUNSAT() { return this.#sat === 0; }
    getCurDecision() { return this.#cur_decision; }

    setStage(stage) { this.#stage = stage; }
}