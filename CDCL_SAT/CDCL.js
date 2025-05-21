import { ObjectCDCL } from "./ObjectCDCL.js";
import { setScreen, getScreen } from "./ScreenManager.js";

let stage = -1;

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
        stage = 0;
    } else if (stage === 0) {
        cdcl_obj.initImplGraph();
        cdcl_obj.displayImplGraph(15);
    }

    text("Decision(s)", 35, 250);
    text("Implication(s)", 200, 250);
}

function reinitScreen() {
    redraw();
    clear();
    background(220);
}