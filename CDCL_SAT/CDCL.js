import { ObjectCDCL } from "./ObjectCDCL.js";

let fun = -1;

export function runDecisionTree(cdcl_obj) {
    redraw();
   
    if (fun == -1) {
        fun = 0;
    } else if (fun === 0) {
        cdcl_obj.addDecision(cdcl_obj.getNextDecision());
        fun = 1;
    } else if (fun === 1) {
        cdcl_obj.unitRes();
        cdcl_obj.checkContradiction();
        cdcl_obj.checkSAT();
        cdcl_obj.updateDecisionTree();
        fun = 0;
    }

    cdcl_obj.displayD(width * 0.55, height * 0.8);
    cdcl_obj.displayDecisionTree(100, 15, PI/10);
    cdcl_obj.displayKB(width * 0.05, height * 0.6);
}