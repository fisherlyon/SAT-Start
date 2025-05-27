import { ObjectCDCL } from "./ObjectCDCL.js";
import { setScreen, getScreen } from "./ScreenManager.js";
import { setDiff } from "../Utility/Util.js"

let stage = -1;
let impl_lits; // array of implications literals
let unexplored_impls; // count of unexplored implications
let explored_impls;
let temp_d = [];
let stage_text;
let uip;
let bfs_queue = new Array();
let bfs_visited = new Set();
let bfs_result = new Set();
let cur_node;
let rest_queue;
let neighbors;
let asserting_clause;
let assertion_level;

export function run(cdcl_obj) {
    if (getScreen() === 1) {
        runDecisionTree(cdcl_obj);
    } else if (getScreen() === 2) {
        runImplGraph(cdcl_obj);
    }
}

function runDecisionTree(cdcl_obj) {
    redraw(); // redraw to show changes made
   
    if (stage == -1) { // initialization stage : show base content
        reinitScreen();
        stage_text = "Initialization"
        stage = 0;
    } else if (stage === 0) { // perform unit resolution
        stage_text = "Perform Unit Resolution"
        stage = 1;
    } else if (stage == 1) {
        stage_text = "Perform Unit Resolution"
        cdcl_obj.unitRes();
        stage = 2;
    } else if (stage === 2) { // check for contradiction/sat & update the decision tree once again
        stage_text = "Check for SAT/UNSAT/Contradiction"
        stage = 3;
    } else if (stage === 3) {
        stage_text = "Check for SAT/UNSAT/Contradiction"
        cdcl_obj.checkContradiction();
        cdcl_obj.checkSAT();
        cdcl_obj.updateDecisionTree();
        stage = 4;
    } else if (stage === 4) {
        if (!cdcl_obj.getContradiction()) { // if there isn't a contradiction, make another decision
            stage_text = "Make New Decision"
            stage = 5;
        } else { // otherwise, invalidate the decision tree and start building the implication graph
            stage_text = "Build Implication Graph"
            stage = 5;
        }
    } else if (stage === 5) { // make a decision & add nodes to decision tree
        if (!cdcl_obj.getContradiction()) { // if there isn't a contradiction, make another decision
            stage_text = "Make New Decision"
            cdcl_obj.addDecision(cdcl_obj.getNextDecision());
            stage = 6;
        } else { // otherwise, invalidate the decision tree and start building the implication graph
            stage_text = "Build Implication Graph"
            cdcl_obj.setDecTreeValidity(false);
            stage = -1;
            setScreen(2);
            return;
        }
    } else if (stage === 6) {
        stage_text = "Update Tree"
        stage = 7;
    } else if (stage === 7) { // update the decision tree to reflect decisions made
        stage_text = "Update Tree"
        cdcl_obj.updateDecisionTree();
        stage = 0;
    } 

    cdcl_obj.displayKB(width * 0.05, height * 0.6 - 20); // show the current knowledge tree
    cdcl_obj.displayD(width * 0.55, height * 0.6 - 20); // show the decision sequence
    cdcl_obj.displayDecisionTree(100, 15, PI/10); // show the decision tree
    text("Stage: " + stage_text, width * 0.05, 375);
}

function runImplGraph(cdcl_obj) {
    redraw();

    if (stage === -1) {
        reinitScreen();
        stage_text = "Display Decisions";
        stage = 0;
    } else if (stage === 0) { // initially display the decisions and initialize implication literals
        stage_text = "Display Decisions";
        cdcl_obj.initImplGraph();
        cdcl_obj.displayImplGraph(15);
        explored_impls = 0;
        stage = 1;
    } else if (stage === 1) { // start finding implications
        stage_text = "Find & Display Implications";
        cdcl_obj.displayImplGraph(15);
        impl_lits = setDiff(cdcl_obj.getI(), cdcl_obj.getD());
        unexplored_impls = impl_lits.length;
        explored_impls = 0;
        stage = 2;
    } else if (stage === 2) {
        stage_text = "Find & Display Implications";
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
        stage_text = "Find First Unique Implication Point";
        cdcl_obj.displayImplGraph(15);
        stage = 4;
    } else if (stage === 4) {
        stage_text = "Find First Unique Implication Point";
        uip = cdcl_obj.findFirstUIP();
        cdcl_obj.getImplGraph().getNodes().get(uip).setCol('yellow');
        cdcl_obj.getImplGraph().getNodes().get(uip).setTcol('black');
        cdcl_obj.displayImplGraph(15);
        stage = 5;
    } else if (stage === 5) { // set up BFS for finding asserting learned clause
        stage_text = "Identify the Asserting Clause";
        cdcl_obj.displayImplGraph(15);
        bfs_queue.push(0); // queue init with just contradiction
        //bfs_visited.add(0); // visited init with just contradiction
        bfs_result.add(0); // result init with just contradiciton
        stage = 6;
    } else if (stage === 6) {
        if (bfs_queue.length > 0) { // while the queue isn't empty
            stage_text = "Identify the Asserting Clause";
            [cur_node, ...rest_queue] = bfs_queue; // current node and the rest of the queue
            neighbors = cdcl_obj.getImplGraph().getIncoming().get(cur_node); // the incoming adjacency list of the current node
            displayBFSState(cdcl_obj);
            bfs_step();
            updateImplGraph(cdcl_obj.getImplGraph());
            cdcl_obj.displayImplGraph(15);
        } else { // if the queue is empty, add the negation of the conflict set to the set of learned clauses, G
            stage_text = "Found the Asserting Clause";
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
        setScreen(1);
        return;
    }

    text("Decision(s)", 35, 350);
    text("Implication(s)", 115, 350);
    text("Stage: " + stage_text, width * 0.05, 375);
}

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

function displayBFSState(cdcl_obj) {
    let x_coord = 135;
    let y_coord = 30;
    let y_incr = 15;
    text("Current Node: " + (cur_node === null ? "None" : cdcl_obj.numToVar(cur_node)), x_coord, y_coord);
    text("Incoming Neighbors: " + (neighbors === null ? "None" : neighbors.map((x) => (cdcl_obj.numToVar(x)))), x_coord, y_coord+y_incr*1);
    text("Queue: " + bfs_queue.map((x) => (cdcl_obj.numToVar(x))), x_coord, y_coord+y_incr*2);
    text("Nodes Visited: " + Array.from(bfs_visited).map((x) => (cdcl_obj.numToVar(x))), x_coord, y_coord+y_incr*3);
    text("Conclict Set: " + Array.from(bfs_result).map((x) => (cdcl_obj.numToVar(x))), x_coord, y_coord+y_incr*4);
    if (bfs_queue.length <= 0) {
        text("Learned Clause: " + "{ " + asserting_clause.map((x) => cdcl_obj.numToVar(x)) + " }", x_coord, y_coord+y_incr*5);
        text("Assertion Level: " + assertion_level, x_coord, y_coord+y_incr*6);
    }
}

function getAssertionLevel(cdcl_obj) {
    let declevs = asserting_clause.map((x) => (cdcl_obj.getImplGraph().getNodes().get(-x).getDeclev()));
    if (declevs.length === 1) {
        return -1;
    }

    return Math.min(...declevs);
}

function reinitScreen() {
    redraw();
    clear();
    background(220);
}