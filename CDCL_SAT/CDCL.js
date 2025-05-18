import { condition } from "../Utility/Condition.js";

/**
 * Performs unit resolution on a knowledge base given the following parameters.
 * @param {(Arrayof (Arrayof Integer))} KB - Knowledge Base
 * @param {(Arrayof (Arrayof Integer))} G - Set of Learned Clauses
 * @param {(Arrayof Integer)} D - Decision Sequence
 * @param {(Arrayof Integer)} I - Set of literals either present as unit clauses in KB or derived from unit resuloution
 * @returns {(Arrayof (Arrayof Integer) (Arrayof (Arrayof Integer)))} - Updated I & KB
 */
function cdclUnitRes(KB, G, D, I) {
    let combinedKB = KB.concat(intsToClauses(D), G); // KB U D => {{d1}, ...} U G
    let unitClause = findUnitClause(combinedKB);

    if (unitClause.length === 0) {
        return [I.reverse(), combinedKB];
    } else {
        I.push(unitClause[0]); // add b/c present as unit clause during unit resolution
        cdclUnitRes(condition(combinedKB, unitClause[0]), [], [], I);
    }
}

/**
 * Takes in a list of "decisions" and converts them to a list of unit clauses.
 * @param {(Arrayof Integer)} ints
 * @returns {(Arrayof (Arrayof Integer))}
 */
function intsToClauses(ints) {
    result = []
    for (let int of ints) {
        result.push([int]);
    }

    return result;
}

/**
 * Given a set of clauses (KB), returns a clause of length one, if there is one.
 * @param {(Arrayof (Arrayof Integer))} KB - Knowledge base
 * @returns {(Arrayof (Integer))} - The found unit clause if there is one
 */
function findUnitClause(KB) {
    if (KB.length === 0) return [];

    const [f, ...r] = KB;

    if (f.length === 1) {
        return f;
    } else {
        findUnitClause(r);
    }
}

/**
 * Returns the next decision.
 * @param {(Arrayof (Arrayof Number))} KB
 * Returns 0 if KB is empty or the first lit of the first clause in KB
 */
function getNextDecision(KB) {
    if (KB.length === 0) {
        return 0;
    } else {
        return KB[0][0];
    }
}