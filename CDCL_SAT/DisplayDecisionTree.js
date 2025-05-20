import { Tree } from "../Utility/Tree.js";
import { TreeNode } from "../Utility/TreeNode.js";
 
export function displayDecisionTree(D, vars, dist, rad, ascale) {
    let dt = new Tree();
    let nodeVars = D.map((x) => (vars[Math.abs(x) - 1]));
    nodeVars.push(" "); // empty node
    initTree(dt, D.length + 1, dist, rad, ascale);
    updateNodes(dt.getRoot(), D);
    dt.drawTree(nodeVars, rad);
} 

/// ^^^^^ need to display the tree, then update the colors and display the same thing

/**
 * Generates the tree and gets the node coordinates and edges.
 * @param {Tree} tree 
 * @param {Number} levels 
 * @param {Number} dist 
 * @param {Number} rad 
 * @param {Number} ascale 
 */
function initTree(tree, levels, dist, rad, ascale) {
    tree.generateTree(levels);
    tree.setNodeCoords(tree.getRoot(), width / 2, height / 10, dist, (5 * PI) / 6, PI / 6, rad, ascale);
}

/**
 * Updates the node colors in the tree to reflect decisions made.
 * @param {TreeNode} root - Root of decision tree
 * @param {(Arrayof Number)} D - Decision sequence
 * @returns 
 */
function updateNodes(root, D) {
    if (root === null) return;

    if (D.length > 0) { // make ">=" to color final blank node
        let [f, ...r] = D;
        root.setCol('green');
        root.setTcol('white');
        if (f > 0) {
            if (root.getLeftEdge()) root.getLeftEdge().setColor('green');
            updateNodes(root.getLeft(), r);
        } else {
            if (root.getRightEdge()) root.getRightEdge().setColor('green');
            updateNodes(root.getRight(), r);
        }
    }
}