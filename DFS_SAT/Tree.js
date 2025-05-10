import { TreeNode } from "./TreeNode.js";

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

        this.#root = createNode(0);
    }

    /**
     * Draws the complete tree, starting at the root node.
     */
    drawTree(vars, x, y, dist, angle_left, angle_right, radius, angle_scale) {
        this.drawNode(this.#root, vars, x, y, dist, angle_left, angle_right, radius, angle_scale);
    }

    /**
     * Recursively draws nodes.
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
    drawNode(node, vars, x, y, dist, angle_left, angle_right, radius, angle_scale) {
        if (!node) {
            return;
        }

        node.draw(x, y, vars, radius);

        if (node.getLeft()) {
            let lineStartX = x + radius * cos(angle_left);
            let lineStartY = y + radius * sin(angle_left);
            let lineEndX = x + dist * cos(angle_left);
            let lineEndY = y + dist * sin(angle_left);
            push();
            stroke(node.getLecol());
            strokeWeight(2);
            line(lineStartX, lineStartY, lineEndX, lineEndY);
            pop();
            this.drawNode(node.getLeft(), vars, lineEndX, lineEndY, dist * 0.7, angle_left - angle_scale, angle_right + angle_scale, radius, angle_scale);
        }

        if (node.getRight()) {
            let lineStartX = x + radius * cos(angle_right);
            let lineStartY = y + radius * sin(angle_right);
            let lineEndX = x + dist * cos(angle_right);
            let lineEndY = y + dist * sin(angle_right);
            push();
            drawingContext.setLineDash([4, 4]);
            stroke(node.getRecol());
            strokeWeight(2);
            line(lineStartX, lineStartY, lineEndX, lineEndY);
            pop();
            this.drawNode(node.getRight(), vars, lineEndX, lineEndY, dist * 0.7, angle_left - angle_scale, angle_right + angle_scale, radius, angle_scale);
        }
    }
    
    getRoot() {
        return this.#root;
    } 
}