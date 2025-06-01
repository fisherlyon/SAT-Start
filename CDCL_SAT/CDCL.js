import { ObjectCDCL } from "./ObjectCDCL.js";
import { setScreen, getScreen } from "./ScreenManager.js";
import { setDiff } from "../Utility/Util.js"
import { ObjectBFS } from "./ObjectBFS.js";

let stage = -1; // running stage of either DT or IG
let impl_lits = null; // array of implications literals
let unexplored_impls = null; // count of unexplored implications
let explored_impls = null; // count of explored implications
let temp_d = []; // temporary collection of decisions
let uip = null; // the Unique Implication Point
let cdcl_hist = new Array(); // history of cdcl states
let cdcl_hist_index = -1; // the index into the history array
let last_tree_indices = new Array(); // array of final state DT indices
let last_ig_indices = new Array(); // array of final state IG indices

/**
 * 
 * @param {*} cdcl_obj 
 */
export function run(cdcl_obj) {
    if ((cdcl_hist_index > -1 && cdcl_hist[cdcl_hist_index].getSAT())) return

    redraw();
    cdcl_hist_index += 1;
    if (getScreen() === 1) {
        runDecisionTree(cdcl_obj);
    } else if (getScreen() === 2) {
        runImplGraph(cdcl_obj);
    }
}

/**
 * 
 */
export function undo(cdcl_obj) {
    if (cdcl_hist_index > 0) {
        redraw();
        cdcl_hist_index -= 1;
        if (getScreen() === 1) {
            undoDecisionTree(cdcl_obj);
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
            if (last_tree_indices.includes(cdcl_hist_index - 1)) {
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
                last_tree_indices.push(cdcl_hist_index - 1); // store this last tree index
                cdcl_obj.invalidateDecTree(); // invalidate the tree
                cdcl_obj.resetImplGraph();
                setScreen(2); // set screen to IG screen
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

        if (cdcl_obj.getSAT()) cdcl_obj.setStage("Formula Satisfied with TVA: " + cdcl_obj.getI().map((x) => (cdcl_obj.numToVar(x))));
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
    if (cdcl_hist_index < cdcl_hist.length) {
        if (last_ig_indices.length !== 0) { // if previous IGs exist
            // if 'run' from IG to DT with existing DT data
            if (last_ig_indices.includes(cdcl_hist_index - 1)) {
                setScreen(1);
                runDecisionTree(cdcl_obj);
                return;
            }
        }
        const temp = cdcl_hist[cdcl_hist_index];
        if (temp.getImplGraph()) temp.displayImplGraph(15);
        temp.displayStage(width * 0.05, 375);
        if (temp.getImplGraphBFS()) temp.getImplGraphBFS().display(temp, 135, 30, 15);
    } else {
        if (stage === -1) {
            reinitScreen();
            cdcl_obj.setStage("Display Decisions");
            stage = 0;
        } else if (stage === 0) { // initially display the decisions and initialize implication literals
            cdcl_obj.initImplGraph(); // create new IG and BFS objects
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
            cdcl_obj.updateImplGraphNode(uip, 'yellow', 'black');
            cdcl_obj.displayImplGraph(15);
            stage = 5;
        } else if (stage === 5) { // set up BFS for finding asserting learned clause
            cdcl_obj.setStage("Identify the Asserting Clause (BFS)");
            cdcl_obj.displayImplGraph(15);
            cdcl_obj.initImplGraphBFS(0, uip); // initialize queue and result for BFS
            stage = 6;
        } else if (stage === 6) {
            let BFS = cdcl_obj.getImplGraphBFS();
            if (BFS.getClause() === null) {
                BFS.update();
                BFS.display(cdcl_obj, 135, 30, 15);
                BFS.step();
                BFS.updateImplGraph();
                cdcl_obj.displayImplGraph(15);
            } else {
                cdcl_obj.setStage("Found the Asserting Clause");
                temp_d = [];
                BFS.updateImplGraph();
                uip = null;
                cdcl_obj.addAssertingClause();
                cdcl_obj.decisionBackTrack();
                cdcl_obj.resetTempKB();
                BFS.display(cdcl_obj, 135, 30, 15);
                cdcl_obj.displayImplGraph(15);
                stage = 7;
            }
        } else if (stage === 7) {
            stage = -1;
            last_ig_indices.push(cdcl_hist_index - 1);
            cdcl_obj.resetImplGraph();
            setScreen(1);
            runDecisionTree(cdcl_obj);
            return;
        }

        cdcl_obj.displayStage(width * 0.05, 375);
        cdcl_hist.push(cdcl_obj.clone());
    }
}

/**
 * 
 * @param {*} cdcl_obj 
 * @returns 
 */
function undoDecisionTree(cdcl_obj) {
    if (last_ig_indices.length > 0) { // if there are previous igs
        if (last_ig_indices.includes(cdcl_hist_index)) { // if "undo" from tree to ig
            setScreen(2); // update screen
            runImplGraph(cdcl_obj)
            return;
        }
    }

    const prev = cdcl_hist[cdcl_hist_index];
    prev.displayKB(width * 0.05, height * 0.6 - 20); // show the current knowledge tree
    prev.displayD(width * 0.55, height * 0.6 - 20); // show the decision sequence
    prev.displayDecisionTree(100, 15, PI/10); // show the decision tree
    prev.displayStage(width * 0.05, 375);
}

/**
 * 
 * @param {*} cdcl_obj 
 * @returns 
 */
function undoImplGraph(cdcl_obj) {
    if (last_tree_indices.length > 0) {
        if (last_tree_indices.includes(cdcl_hist_index)) { // if 'undo' from IG to DT
            setScreen(1); // update screen
            runDecisionTree(cdcl_obj);
            return;
        }
    }

    const prev = cdcl_hist[cdcl_hist_index];
    if (prev.getImplGraph()) prev.displayImplGraph(15);
    prev.displayStage(width * 0.05, 375);
    if (prev.getImplGraphBFS()) prev.getImplGraphBFS().display(prev, 135, 30, 15);
}

/**
 * 
 */
function reinitScreen() {
    redraw();
    clear();
    background(220);
}

/**
 * 
 */
export function reinit() {
    stage = -1;
    impl_lits = null; // array of implications literals
    unexplored_impls = null; // count of unexplored implications
    explored_impls = null;
    temp_d = [];
    uip = null;
    cdcl_hist = new Array();
    cdcl_hist_index = -1;
    last_tree_indices = new Array();
    last_ig_indices = new Array();
}