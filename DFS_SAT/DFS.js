import { Tree } from '../Utility/Tree.js';
import { TreeNode } from '../Utility/TreeNode.js';
import { Edge } from '../Utility/Edge.js'
import { render } from './MainDFS.js';
import { condition } from '../Utility/Condition.js';
import { getScreen } from './ScreenManager.js';

let tree = new Tree();
let dec_stack; // decision stack
let vars; // given list of boolean variables
let kb; // the knowledge base (formula)
let cur_decision = null;
let cur_node = null;
let fun = 0; // the active "next" functionality
let kb_state_stack = [];
let sat = -1; // satisfiability state
let path = []; // current path
let radius;
let state_history = []; // history of states for "undo" functionality
let node_map = new Map();
let next_node_id = 1;

/**
 * Performs a depth-first search (DFS) on a boolean variable tree.
 * @param {Array} boolean_variables - The boolean variables to be used in the tree.
 * @param {Array} knowledge_base - The knowledge base to be used in the DFS.
 * @param {number} rad - The radius of the nodes in the tree.
 * @param {number} ascale - The angle scale for the tree.
 * @param {number} d - The distance between nodes in the tree.
 * @returns {void}
 */
export function dfs(boolean_variables, knowledge_base, rad, ascale, d) {
    vars = boolean_variables;
    kb = knowledge_base;
    radius = rad;
    init(d, ascale);
    render(tree, vars, kb, cur_decision, path, sat, radius);
}

function dfsStep(tree, dec) {
    if (tree != null) {
      return dec > 0 ? tree.getLeft() : tree.getRight();
    }
  }
  
  function dfsUnstep(tree) {
    if (tree != null) {
      return tree.getParent();
    }
  }  

/**
 * Initializes the DFS algorithm.
 * Generates the tree, sets the tree node coords, initializes the decision stack, and sets up the button.
 * @returns {void}
 */
function init(distance, angle_scale) {
    tree.generateTree(vars.length);
    tree.setNodeCoords(tree.getRoot(), width / 2, height / 10, distance, (5 * PI) / 6, PI / 6, radius, angle_scale);
    cur_node = tree.getRoot(); // get the current node
    dec_stack = [cur_node.getLit(), -cur_node.getLit()];
    initNodeMapping();
}

export function keyPressed() {
    if (getScreen() === 1) {
        if (keyCode == LEFT_ARROW) undo();
        if (keyCode == RIGHT_ARROW) run();
    }
  }

/**
 * Runs the DFS algorithm.
 * @returns {void}
 */
export function run() {
    if (sat == -1) {
        if (fun === 0) {
            processingUpdate();
            fun = 1;
        } else if (fun === 1) {
            conditionUpdate();
            fun = 2;
        } else if (fun === 2) {
            stepUpdate();
            fun = 0;
        }
    } else {
        render(tree, vars, kb, cur_decision, path, sat, radius);
    }
}

/**
 * Updates the current decision, the current node, the knowledge base, and the current path.
 * @returns {void}
 */
function processingUpdate() {
    saveState(); // save current state for calls to undo
    cur_decision = dec_stack.shift(); // pop the current decision
    while (Math.abs(cur_decision) !== cur_node.getLit()) {
        updateNodeColors(cur_node, cur_decision, 'red', 'white', 'red');
        kb = kb_state_stack.shift();
        cur_node = dfsUnstep(cur_node);
        path.pop();
    }
    path.push(cur_decision);
    updateNodeColors(cur_node, cur_decision, 'blue', 'white', 'blue') // "processing" current node
    render(tree, vars, kb, cur_decision, path, sat, radius); // render the tree
}

/**
 * Updates the knowledge base based on the current decision and displays it.
 * @returns {void}
 */
function conditionUpdate() {
    saveState(); // save current state for calls to undo
    kb_state_stack.unshift(kb);
    kb = condition(kb, cur_decision);
    render(tree, vars, kb, cur_decision, path, sat, radius);
}

/**
 * Updates the current node, processes the updated knowledge base, and displays updated tree.
 * If the knowledge base is empty, it indicates a satisfiable solution.
 * If the knowledge base has one empty clause, it indicates an unsatisfiable solution.
 * Otherwise, it continues the DFS process.
 * @returns {void}
 */
function stepUpdate() {
    saveState(); // save current state for calls to undo
    if (kb.length === 0) { // if SAT
        updateRest(cur_node, cur_decision, 'green', 'white', 'green');
        sat = 1;
        render(tree, vars, kb, cur_decision, path, sat, radius);
    } else if (kb.length === 1 && kb[0].length === 0) { // if UNSAT
        updateNodeColors(cur_node, cur_decision, 'red', 'white', 'red');
        path.pop();
        render(tree, vars, kb, cur_decision, path, sat, radius);
        kb = kb_state_stack.shift();
        if (dec_stack.length === 0) {
            sat = 0;
            render(tree, vars, kb, cur_decision, path, sat, radius);
        }
    } else { // if OKAY
        updateNodeColors(cur_node, cur_decision, 'green', 'white', 'green');
        cur_node = dfsStep(cur_node, cur_decision);
        dec_stack.unshift(-cur_node.getLit());
        dec_stack.unshift(cur_node.getLit());
        render(tree, vars, kb, cur_decision, path, sat, radius);
    }
}


export function undo() {
    if (state_history.length === 0) return;
    const prevState = state_history.shift();
    cur_decision = prevState.decision;
    cur_node = prevState.nodeId ? findNodeById(prevState.nodeId) : null;
    kb = prevState.knowledgeBase;
    dec_stack = [...prevState.decisionStack];
    kb_state_stack = [...prevState.kbStateStack];
    path = [...prevState.pathState];
    fun = prevState.funState;
    sat = prevState.satState;
    restoreNodeColors(prevState.nodeColors);
    render(tree, vars, kb, cur_decision, path, sat, radius);
}

/**
 * Updates the fill color and text color of a node.
 * @param {TreeNode} node - The node to update.
 * @param {number} dec - The decision value.
 * @param {string} col - The color to set.
 * @param {string} tcol - The text color to set.
 * @param {string} ecol - The edge color to set.
 */
function updateNodeColors(node, dec, col, tcol, ecol) {
    node.setCol(col);
    node.setTcol(tcol);
    if (dec >= 0 && node.getLeftEdge()) node.getLeftEdge().setColor(ecol);
    if (dec <= 0 && node.getRightEdge()) node.getRightEdge().setColor(ecol);
    if (dec < 0 && node.getLeftEdge() && node.getLeftEdge().getColor() === 'green') { // edge case if a valid path that doesn't lead to a solution
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
function updateRest(node, dec, col, tcol, ecol) {
    updateNodeColors(node, dec, col, tcol, ecol);
    if (node.getLeft() && dec >= 0) {
        updateRest(node.getLeft(), 0, col, tcol, ecol);
    }
    if (node.getRight() && dec <= 0) {
        updateRest(node.getRight(), 0, col, tcol, ecol);
    }
}


function initNodeMapping() {
    node_map.clear();
    next_node_id = 1;
    mapNodeIds(tree.getRoot());
}


function mapNodeIds(node) {
    if (!node) return;
    node_map.set(node, next_node_id++);
    if (node.getLeft()) mapNodeIds(node.getLeft());
    if (node.getRight()) mapNodeIds(node.getRight());
}


function findNodeById(id, start_node = tree.getRoot()) {
    if (!start_node) return null;
    
    if (node_map.get(start_node) === id) {
        return start_node;
    }
    
    const left_result = findNodeById(id, start_node.getLeft());
    if (left_result) return left_result;
    
    return findNodeById(id, start_node.getRight());
}


function saveState() {
    const node_color_map = {};
    
    node_map.forEach((id, node) => {
        node_color_map[id] = {
            col: node.getCol(),
            tcol: node.getTcol(),
            lecol: node.getLeftEdge() === null ? null : node.getLeftEdge().getColor(),
            recol: node.getRightEdge()=== null ? null : node.getRightEdge().getColor()
        };
    });
    
    const cur_node_id = cur_node ? node_map.get(cur_node) : null;
    
    state_history.unshift({
        decision: cur_decision,
        nodeId: cur_node_id,
        knowledgeBase: JSON.parse(JSON.stringify(kb)),
        decisionStack: [...dec_stack],
        kbStateStack: [...kb_state_stack], 
        pathState: [...path],
        funState: fun,
        satState: sat,
        nodeColors: node_color_map
    });
}


function restoreNodeColors(color_map) {
    if (!color_map) return;

    Object.keys(color_map).forEach(id_str => {
        const id = parseInt(id_str);
        const node = findNodeById(id);
    
        if (node) {
            const colors = color_map[id];
            node.setCol(colors.col);
            node.setTcol(colors.tcol);
            if (node.getLeftEdge() && colors.lecol !== null) {
                node.getLeftEdge().setColor(colors.lecol);
            }
            if (node.getRightEdge() && colors.recol !== null) {
                node.getRightEdge().setColor(colors.recol);
            }
        }
    });
}