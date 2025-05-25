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
        stage = 0;
    } else if (stage === 0) { // make a decision & add nodes to decision tree
        if (!cdcl_obj.getContradiction()) { // if there isn't a contradiction, make another decision
            cdcl_obj.addDecision(cdcl_obj.getNextDecision());
            stage = 1;
        } else { // otherwise, invalidate the decision tree and start building the implication graph
            cdcl_obj.setDecTreeValidity(false);
            stage = -1;
            setScreen(2);
            return;
        }
    } else if (stage === 1) { // update the decision tree to reflect decisions made
        cdcl_obj.updateDecisionTree();
        stage = 2;
    } else if (stage === 2) { // perform unit resolution
        cdcl_obj.unitRes();
        stage = 3;
        
    } else if (stage === 3) { // check for contradiction/sat & update the decision tree once again
        cdcl_obj.checkContradiction();
        cdcl_obj.checkSAT();
        cdcl_obj.updateDecisionTree();
        stage = 0;
    }

    cdcl_obj.displayKB(width * 0.05, height * 0.6); // show the current knowledge tree
    cdcl_obj.displayD(width * 0.55, height * 0.6); // show the decision sequence
    cdcl_obj.displayDecisionTree(100, 15, PI/10); // show the decision tree
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
        console.log(uip);
        cdcl_obj.getImplGraph().getNodes().get(uip).setCol('yellow');
        cdcl_obj.getImplGraph().getNodes().get(uip).setTcol('black');
        cdcl_obj.displayImplGraph(15);
        stage = 5;
    } else if (stage === 5) { // set up BFS for finding asserting learned clause
        stage_text = "Identify the Asserting Clause";
        cdcl_obj.displayImplGraph(15);
        bfs_queue.push(0); // queue init with just contradiction
        bfs_visited.add(0); // visited init with just contradiction
        bfs_result.add(0); // result init with just contradiciton
        stage = 6;
    } else if (stage === 6) {
        console.log(bfs_queue.length);
        if (bfs_queue.length > 0) { // while the queue isn't empty
            [cur_node, ...rest_queue] = bfs_queue; // current node and the rest of the queue
            console.log("cur_node: ", cur_node);
            console.log("rest_queue: ", rest_queue);
            neighbors = cdcl_obj.getImplGraph().getIncoming().get(cur_node); // the incoming adjacency list of the current node
            console.log("neighbors: ", neighbors);
            bfs_step();
            updateImplGraph(cdcl_obj.getImplGraph());
            cdcl_obj.displayImplGraph();
        } else { // if the queue is empty, add the negation of the conflict set to the set of learned clauses, G
            cdcl_obj.getG().push((Array.from(bfs_result).map((x) => (-x))));
            cdcl_obj.displayImplGraph();
        }
    }

    text("Decision(s)", 35, 250);
    text("Implication(s)", 115, 250);
    text("Stage: " + stage_text, 35, 275);
}

function bfs_step() {
    if (cur_node === uip) { // if the current node is equal to the target (first UIP)
        console.log("1 happens");
        bfs_queue = rest_queue;
        bfs_visited.add(cur_node);
    } else if (bfs_result.has(cur_node)) { // if the current node isn't the target, but is in the result
        console.log("2 happens");
        if (neighbors.length === 0) { // if the node doesn't have any neighbors (decision node)
            bfs_queue = rest_queue; // update the queue
            bfs_visited.add(cur_node); // udpated the set of visited
        } else {
            // update the queue by adding the neighbors that haven't been visited
            bfs_queue = rest_queue.concat(neighbors.map((n) => (!(bfs_visited.has(n)))));
            bfs_result.delete(cur_node); // remove the current node from the result
            // replace the current node with its neighbors if they haven't already been visited
            bfs_result.union(new Set(neighbors.map((n) => (!(bfs_visited.has(n))))));
        }
    } else { // if the current node isn't the target, and isn't in the result
        console.log("3 happens");
        bfs_queue = rest_queue.concat(neighbors.map((n) => (!(bfs_visited.has(n)))));
    }
}

function updateImplGraph(impl_graph) {
    for (let v of bfs_visited) {
        impl_graph.getNodes().get(v).setCol(color(96, 96, 96));
        impl_graph.getNodes().get(v).setTcol('white');
    }
}

function reinitScreen() {
    redraw();
    clear();
    background(220);
}