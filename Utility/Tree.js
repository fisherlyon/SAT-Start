import { TreeNode } from "./TreeNode.js";
import { Edge } from "../Utility/Edge.js"

export class Tree {
    #root;

    constructor(root = null) {
        this.#root = root;
    }

    /**
     * Generates a tree based on a given number of variables.
     * The tree is symmetric, resulting in many duplicate nodes.
     * @param {number} num_vars - Number of variables for tree generation.
     */
    generateTree(num_vars) {
        if (num_vars === 0) {
            return;
        }

        const createNode = (i) => {
            if (i >= num_vars) {
                return null;
            }
            return new TreeNode(i+1, createNode(i+1), createNode(i+1))
        }

        if (this.#root !== null) this.#root = null; 
        this.#root = createNode(0);
    }

    /**
     * Adds a level of the same node to the tree.
     * @param {Number}} lit 
     * @returns {Void}
     */
    addNodes(lit) {
        if (!this.#root) {
            this.#root = new TreeNode(lit);
            return;
        }

        const queue = [this.#root];

        while (queue.length > 0) {
            const levelSize = queue.length;
            let allLeaves = true;

            for (let i = 0; i < levelSize; i++) {
                const node = queue[i];
                if (node.getLeft() !== null || node.getRight() !== null) {
                    allLeaves = false;
                    break;
                }
            }

            if (allLeaves) {
                for (let i = 0; i < levelSize; i++) {
                    const node = queue[i];
                    node.setLeft(new TreeNode(lit));
                    node.setRight(new TreeNode(lit));
                }
                return;
            }

            // If not all leaves, go deeper
            for (let i = 0; i < levelSize; i++) {
                const node = queue.shift();
                if (node.getLeft()) queue.push(node.getLeft());
                if (node.getRight()) queue.push(node.getRight());
            }
        }
    }


    /**
     * Draws the complete tree, starting at the root node.
     */
    drawTree(vars, radius) {
        this.drawNodes(this.#root, vars, radius);
    }

    drawNodes(node, vars, r) {
        if (!node) return;

        node.draw(vars, r);

        if (node.getRight()) {
            this.drawNodes(node.getRight(), vars, r)
        }

        if (node.getLeft()) {
            this.drawNodes(node.getLeft(), vars, r);
        }
    }


    /**
     * Recursively sets coordinates of nodes and creates connecting edges.
     * @param {TreeNode} node 
     * @param {Array<number>} vars 
     * @param {number} x 
     * @param {number} y 
     * @param {number} dist 
     * @param {number} angle_left 
     * @param {number} angle_right 
     * @param {number} radius 
     * @param {number} angle_scale 
     */
    setNodeCoords(node, x, y, dist, angle_left, angle_right, radius, angle_scale) {
        if (!node) {
            return;
        }

        node.setCoords(x, y);

        if (node.getLeft()) {
            let lineStartX = x + radius * cos(angle_left);
            let lineStartY = y + radius * sin(angle_left);
            let lineEndX = x + dist * cos(angle_left);
            let lineEndY = y + dist * sin(angle_left);
            node.setLeftEdge(new Edge(lineStartX, lineStartY, lineEndX, lineEndY));
            this.setNodeCoords(node.getLeft(), lineEndX, lineEndY, dist * 0.7, angle_left - angle_scale, angle_right + angle_scale, radius, angle_scale);
        }

        if (node.getRight()) {
            let lineStartX = x + radius * cos(angle_right);
            let lineStartY = y + radius * sin(angle_right);
            let lineEndX = x + dist * cos(angle_right);
            let lineEndY = y + dist * sin(angle_right);
            node.setRightEdge(new Edge(lineStartX, lineStartY, lineEndX, lineEndY))
            this.setNodeCoords(node.getRight(), lineEndX, lineEndY, dist * 0.7, angle_left - angle_scale, angle_right + angle_scale, radius, angle_scale);
        }
    }
    
    getRoot() {
        return this.#root;
    } 
}