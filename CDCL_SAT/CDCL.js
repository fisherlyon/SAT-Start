import { ObjectCDCL } from "./ObjectCDCL.js";
import { setScreen, getScreen } from "./ScreenManager.js";
import { setDiff } from "../Utility/Util.js"

let stage = -1;
let impl_lits; // array of implications literals
let unexplored_impls; // count of unexplored implications
let explored_impls;
let temp_d = [];
let uip;
let bfs_queue = new Array();
let bfs_visited = new Set();
let bfs_result = new Set();
let cur_node;
let rest_queue;
let neighbors;
let asserting_clause;
let assertion_level;

let cdcl_hist = new Array();
let cdcl_hist_index = -1;
let last_tree_indices = new Array();
let last_ig_indices = new Array();
let cur_tree = -1;
let cur_ig = -1;

/**
 * 
 * @param {*} cdcl_obj 
 */
export function run(cdcl_obj) {
    redraw();
    cdcl_hist_index += 1;
    if (getScreen() === 1) {
        runDecisionTree(cdcl_obj);
    } else if (getScreen() === 2) {
        runImplGraph(cdcl_obj);
    }
    console.log("Run Index:", cdcl_hist_index);
}

/**
 * 
 */
export function undo(cdcl_obj) {
    if (cdcl_hist_index > 0) {
        redraw();
        cdcl_hist_index -= 1;
        console.log("Undo Index:", cdcl_hist_index);
        if (getScreen() === 1) {
            undoDecisionTree();
        } else if (getScreen() === 2) {
            undoImplGraph(cdcl_obj);
        }
    }
}

/**
 * 
 * @param {*} cdcl_obj 
 * @returns 
 */
function runDecisionTree(cdcl_obj) {
    if (cdcl_hist_index < cdcl_hist.length) { // if prior 'undo', load past states
        if (last_tree_indices.length !== 0) { // if previous trees exist
            // if 'run' from tree to ig with existing ig data
            if (cdcl_hist_index === last_tree_indices[cur_tree] + 1) {
                cdcl_hist_index = last_tree_indices[cur_tree] + 1;
                setScreen(2);
                runImplGraph(cdcl_obj);
                return;
            }
        }
        const temp = cdcl_hist[cdcl_hist_index]; // load past state
        temp.displayKB(width * 0.05, height * 0.6 - 20); // display the knowledge tree
        temp.displayD(width * 0.55, height * 0.6 - 20); // display the decision sequence
        temp.displayDecisionTree(100, 15, PI/10); // display the decision tree
        temp.displayStage(width * 0.05, 375); // display the stage
    } else { // no prior 'undo', normal execution
        if (stage == -1) { // stage update
            reinitScreen();
            cur_tree += 1; // increment the current tree count
            cdcl_obj.setStage("Initialization");
            stage = 0;
        } else if (stage === 0) { // stage update
            cdcl_obj.setStage("Perform Unit Resolution");
            stage = 1;
        } else if (stage == 1) { // perform unit resolution
            cdcl_obj.unitRes();
            stage = 2;
        } else if (stage === 2) { // stage update
            cdcl_obj.setStage("Check for SAT/UNSAT/Contradiction");
            stage = 3;
        } else if (stage === 3) { // check for contradiction/SAT, update accordingly
            cdcl_obj.checkContradiction();
            cdcl_obj.checkSAT();
            cdcl_obj.updateDecisionTree();
            stage = 4;
        } else if (stage === 4) {
            if (!cdcl_obj.getContradiction()) { // stage update, or return if contradiction
                cdcl_obj.setStage("Make New Decision");
                stage = 5;
            } else {
                cdcl_obj.setStage("Build Implication Graph");
                stage = 5;
            }
        } else if (stage === 5) { // make a new decision
            if (!cdcl_obj.getContradiction()) {
                cdcl_obj.addDecision(cdcl_obj.getNextDecision()); // add decision
                stage = 6;
            } else {
                stage = -1; // restart stage progression
                last_tree_indices.push(cdcl_hist_index-1); // store this last tree index
                cdcl_obj.invalidateDecTree(); // invalidate the tree
                setScreen(2); // set screen to IG screen
                console.log("LAST DT I:", cdcl_hist_index);
                runImplGraph(cdcl_obj); // initial run
                return;
            }

        } else if (stage === 6) { // stage update
            cdcl_obj.setStage("Update Tree");
            stage = 7;
        } else if (stage === 7) { // update the decision tree to reflect decisions made
            cdcl_obj.updateDecisionTree();
            stage = 0;
        } 

        cdcl_obj.displayKB(width * 0.05, height * 0.6 - 20); // display the knowledge tree
        cdcl_obj.displayD(width * 0.55, height * 0.6 - 20); // display the decision sequence
        cdcl_obj.displayDecisionTree(100, 15, PI/10); // display the decision tree
        cdcl_obj.displayStage(width * 0.05, 375); // display the stage
        cdcl_hist.push(cdcl_obj.clone()); // store the state
    }
}

/**
 * 
 * @param {*} cdcl_obj 
 * @returns 
 */
function runImplGraph(cdcl_obj) {
    console.log("CHI: " + cdcl_hist_index + " CHL: " + cdcl_hist.length);
    if (cdcl_hist_index < cdcl_hist.length) {
        console.log("this");
        const temp = cdcl_hist[cdcl_hist_index];
        if (temp.getImplGraph() !== null) temp.displayImplGraph(15);
        temp.displayStage(width * 0.05, 375);
        if (temp.getShowBFS()) displayBFSState(temp);
    } else {
        if (stage === -1) {
            reinitScreen();
            cur_ig += 1; // increment the current ig count
            cdcl_obj.setStage("Display Decisions");
            stage = 0;
        } else if (stage === 0) { // initially display the decisions and initialize implication literals
            cdcl_obj.initImplGraph();
            cdcl_obj.displayImplGraph(15);
            explored_impls = 0;
            stage = 1;
        } else if (stage === 1) { // start finding implications
            cdcl_obj.setStage("Find & Display Implications");
            cdcl_obj.displayImplGraph(15);
            impl_lits = setDiff(cdcl_obj.getI(), cdcl_obj.getD());
            unexplored_impls = impl_lits.length;
            explored_impls = 0;
            stage = 2;
        } else if (stage === 2) {
            if (explored_impls < unexplored_impls) {
                cdcl_obj.findImplClause(impl_lits[explored_impls], temp_d);
                temp_d.push(impl_lits[explored_impls]);
                explored_impls += 1;
            } else {
                cdcl_obj.findImplClause(0, []);
                stage = 3;
            }
            cdcl_obj.displayImplGraph(15);
        } else if (stage === 3) {
            cdcl_obj.setStage("Find First Unique Implication Point");
            cdcl_obj.displayImplGraph(15);
            stage = 4;
        } else if (stage === 4) {
            uip = cdcl_obj.findFirstUIP();
            cdcl_obj.getImplGraph().getNodes().get(uip).setCol('yellow');
            cdcl_obj.getImplGraph().getNodes().get(uip).setTcol('black');
            cdcl_obj.displayImplGraph(15);
            stage = 5;
        } else if (stage === 5) { // set up BFS for finding asserting learned clause
            cdcl_obj.setStage("Identify the Asserting Clause (BFS)");
            cdcl_obj.displayImplGraph(15);
            bfs_queue.push(0); // queue init with just contradiction
            bfs_result.add(0); // result init with just contradiciton
            stage = 6;
        } else if (stage === 6) {
            if (bfs_queue.length > 0) { // while the queue isn't empty
                [cur_node, ...rest_queue] = bfs_queue; // current node and the rest of the queue
                neighbors = cdcl_obj.getImplGraph().getIncoming().get(cur_node); // the incoming adjacency list of the current node
                cdcl_obj.setShowBFS(true);
                displayBFSState(cdcl_obj);
                bfs_step();
                updateImplGraph(cdcl_obj.getImplGraph());
                cdcl_obj.displayImplGraph(15);
            } else { // if the queue is empty, add the negation of the conflict set to the set of learned clauses, G
                cdcl_obj.setStage("Found the Asserting Clause");
                // reset data
                cur_node = null;
                rest_queue = null;
                neighbors = null;
                temp_d = [];
                updateImplGraph(cdcl_obj.getImplGraph());
                uip = null;
                // get the asserting clauses and assertion level
                asserting_clause = (Array.from(bfs_result).map((x) => (-x)))
                assertion_level = getAssertionLevel(cdcl_obj);
                cdcl_obj.setHasAsserting(true);
                cdcl_obj.getG().push(asserting_clause);
                // reset more data
                cdcl_obj.resetD(assertion_level);
                cdcl_obj.resetTempKB();
                displayBFSState(cdcl_obj);
                bfs_queue = new Array();
                bfs_visited = new Set();
                bfs_result = new Set();
                cdcl_obj.displayImplGraph(15);
                cdcl_obj.setImplGraphValidity(false);
                stage = 7;
            }
        } else if (stage === 7) {
            stage = -1;
            cdcl_obj.setShowBFS(false);
            cdcl_obj.setHasAsserting(false);
            last_ig_indices.push(cdcl_hist_index);
            console.log("Last ig index:", cdcl_hist_index);
            setScreen(1);
            return;
        }

        cdcl_obj.displayStage(width * 0.05, 375);
        cdcl_hist.push(cdcl_obj.clone());
    }
}

function undoDecisionTree() {
    if (last_ig_indices.length > 0) { // if there are previous igs
        if (cdcl_hist_index - 1 === last_ig_indices[cur_ig]) { // if "undo" from tree to ig
            setScreen(2); // update screen
            cdcl_hist_index = last_ig_indices[cur_ig]; // update cdcl history index
            return;
        }
    }

    const prev = cdcl_hist[cdcl_hist_index];
    prev.displayKB(width * 0.05, height * 0.6 - 20); // show the current knowledge tree
    prev.displayD(width * 0.55, height * 0.6 - 20); // show the decision sequence
    prev.displayDecisionTree(100, 15, PI/10); // show the decision tree
    prev.displayStage(width * 0.05, 375);
}

function undoImplGraph(cdcl_obj) {
    console.log("CUR: " + cdcl_hist_index + " LAST DT: " + last_tree_indices[cur_tree]);
    if (cdcl_hist_index === last_tree_indices[cur_tree]) { // if 'undo' from IG to DT
        setScreen(1); // update screen
        cdcl_hist_index = last_tree_indices[cur_tree]; // update cdcl history index
        runDecisionTree(cdcl_obj);
        return;
    }

    const prev = cdcl_hist[cdcl_hist_index];
    prev.displayImplGraph(15);
    prev.displayStage(width * 0.05, 375);
    if (prev.getShowBFS()) {
        displayBFSState(prev);
    }
}

/**
 * 
 */
function bfs_step() {
    if (cur_node === uip) { // if the current node is equal to the target (first UIP)
        bfs_queue = rest_queue;
        bfs_visited.add(cur_node);
    } else if (bfs_result.has(cur_node)) { // if the current node isn't the target, but is in the result
        if (neighbors.length === 0) { // if the node doesn't have any neighbors (decision node)
            bfs_queue = rest_queue; // update the queue
            bfs_visited.add(cur_node); // udpated the set of visited
        } else {
            // update the queue by adding the neighbors that haven't been visited
            bfs_queue = rest_queue.concat(neighbors.filter((n) => (!(bfs_visited.has(n)))));
            bfs_result.delete(cur_node); // remove the current node from the result
            // replace the current node with its neighbors if they haven't already been visited
            bfs_result = bfs_result.union(new Set(neighbors.filter((n) => (!(bfs_visited.has(n))))));
            bfs_visited.add(cur_node);
        }
    } else { // if the current node isn't the target, and isn't in the result
        bfs_queue = rest_queue.concat(neighbors.filter((n) => (!(bfs_visited.has(n)))));
        bfs_visited.add(cur_node);
    }
}

/**
 * 
 * @param {*} impl_graph 
 */
function updateImplGraph(impl_graph) {
    for (let v of bfs_visited) {
        impl_graph.getNodes().get(v).setCol(color(96, 96, 96));
        impl_graph.getNodes().get(v).setTcol('white');
    }

    if (cur_node !== null) {
        impl_graph.getNodes().get(cur_node).setCol('blue');
        impl_graph.getNodes().get(cur_node).setTcol('white');
    }
}

/**
 * 
 * @param {*} cdcl_obj 
 */
function displayBFSState(cdcl_obj) {
    let x_coord = 135;
    let y_coord = 30;
    let y_incr = 15;
    text("Current Node: " + (cur_node === null ? "None" : cdcl_obj.numToVar(cur_node)), x_coord, y_coord);
    text("Incoming Neighbors: " + (neighbors === null ? "None" : neighbors.map((x) => (cdcl_obj.numToVar(x)))), x_coord, y_coord+y_incr*1);
    text("Queue: " + bfs_queue.map((x) => (cdcl_obj.numToVar(x))), x_coord, y_coord+y_incr*2);
    text("Nodes Visited: " + Array.from(bfs_visited).map((x) => (cdcl_obj.numToVar(x))), x_coord, y_coord+y_incr*3);
    text("Conclict Set: " + Array.from(bfs_result).map((x) => (cdcl_obj.numToVar(x))), x_coord, y_coord+y_incr*4);
    if (cdcl_obj.getHasAsserting()) {
        text("Learned Clause: " + "{ " + asserting_clause.map((x) => cdcl_obj.numToVar(x)) + " }", x_coord, y_coord+y_incr*5);
        text("Assertion Level: " + assertion_level, x_coord, y_coord+y_incr*6);
    }
}

/**
 * 
 * @param {*} cdcl_obj 
 * @returns 
 */
function getAssertionLevel(cdcl_obj) {
    let declevs = asserting_clause.map((x) => (cdcl_obj.getImplGraph().getNodes().get(-x).getDeclev()));
    if (declevs.length === 1) {
        return -1;
    }

    return Math.min(...declevs);
}

/**
 * 
 */
function reinitScreen() {
    redraw();
    clear();
    background(220);
}