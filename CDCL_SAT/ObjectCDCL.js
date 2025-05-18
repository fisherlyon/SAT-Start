import { condition } from "../Utility/Condition.js"
import { ImplGraph } from "./ImplGraph.js"
import { ImplGraphNode } from "./ImplGraphNode.js";

/**
 * CDCL Object Class
 * @property {(Arrayof (Arrayof Number))} KB - Knowledge Base
 * @property {(Arrayof (Arrayof Number))} temp_kb - Temporary KB - result of unit resolution
 * @property {(Arrayof Number)} D - Decision Sequence
 * @property {(Arrayof (Arrayof Number))} G - Set of Learned Clauses
 * @property {(Arrayof (Arrayof Number))} I - Set of literals either presnet as unit clauses in KB or derived from unit resolution
 */
export class ObjectCDCL {
    #KB;
    #temp_kb;
    #D;
    #G;
    #I;
    #impl_graph;
    
    constructor(KB) {
        this.#KB = KB;
        this.#temp_kb = KB;
        this.#D = [];
        this.#G = [];
        this.#I = [];
        this.#impl_graph = null;
    }

    /**
     * Performs unit resolution on a knowledge base given the following parameters.
     * @param {(Arrayof (Arrayof Number))} KB - Knowledge Base
     * @param {(Arrayof (Arrayof Number))} G - Set of Learned Clauses
     * @param {(Arrayof Number)} D - Decision Sequence
     * @param {(Arrayof Number)} I - Set of literals either present as unit clauses in KB or derived from unit resuloution
     */
    unitRes(KB = this.#KB, D = this.#D, G = this.#G, I = this.#I) {
        let combinedKB = KB.concat(numsToClauses(D), G);
        let unitClause = findUnitClause(combinedKB);

        if (unitClause.length === 0) {
            this.#I = I.reverse();
            this.#temp_kb = combinedKB;
        } else {
            I.push(unitClause[0]);
            unitRes(condition(combinedKB, unitClause[0]), [], [], I);
        }
    }

    /**
     * Takes in a set of "decisions" and converts them to a set of unit clauses.
     * @param {(Arrayof Number)} nums 
     * @returns {(Arrayof (Arrayof Number))}
     */
    numsToClauses(nums) {
        if (nums.length === 0) return [];
        const [f, ...r] = nums;
        return [[f], ...this.numsToClauses(r)];
    }

    /**
     * Given a set of clauses (KB), returns a clause of length one (unit clause).
     * @param {(Arrayof (Arrayof Number))} KB - Knowlege Base
     * @returns {(Arrayof (Number))} - The found unit clause, if there is one
     */
    findUnitClause(KB) {
        if (KB.length === 0) return [];
        const [f, ...r] = KB;
        if (f.length === 1) return f;
        else return this.findUnitClause(r);
    }

    /**
     * Returns the next decision.
     * @returns {Number} - 0 if KB is empty, otherwise, the first lit of the first clause
     */
    getNextDecision() {
        if (this.#temp_kb.length === 0) return 0;
        else return this.#temp_kb[0][0];
    }
}