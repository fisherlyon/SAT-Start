/**
 * Conditions a clause on a literal.
 * @param {Array} clause - The clause to condition on.
 * @param {number} lit - The literal to condition the clause on.
 * @returns {Array|boolean} - The resulting clause after conditioning, or true if the clause is satisfied.
 */
function conditionHelper(clause, lit) {
    if (clause.length === 0) return []; 

    const [f, ...r] = clause;

    if (f === lit) {
        return true;
    } else if (f === -lit) {
        return conditionHelper(r, lit);
    } else {
        const reduced = conditionHelper(r, lit);
        if (reduced === true) return true;
        return [f, ...reduced];
    }
}


/**
 * Conditions a knowledge base (kb) on a literal (lit).
 * @param {Array} kb - The knowledge base, an array of clauses.
 * @param {number} lit - The literal to condition on.
 * @returns {Array} - The resulting knowledge base after conditioning.
 */
export function condition(kb, lit) {
    if (kb.length === 0) return [];
    if (kb.length === 1 && kb[0].length === 0) return [[]];

    const [f, ...r] = kb;
    const result = conditionHelper(f, lit);

    if (result === true) {
        return condition(r, lit);
    } else if (Array.isArray(result) && result.length === 0) {
        return [[]];
    } else {
        const rest_result = condition(r, lit);
        if (rest_result.length === 1 && rest_result[0].length === 0) {
            return [[]];
        } else {
            return [result, ...rest_result];
        }
    }
}