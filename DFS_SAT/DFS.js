let stage = 0;
let dfs_hist = new Array();
let dfs_hist_index = -1;

/**
 * Initializes the DFS Object for running DFS
 * @param { ObjectDFS } dfs_obj
 */
export function initDFS(dfs_obj) {
    dfs_obj.init(); // initialize
    dfs_hist_index += 1; // increment the history index
    dfs_hist.push(dfs_obj.clone()); // store state
}

/**
 * Runs the DFS algorithm.
 * @returns {void}
 */
export function run(dfs_obj) {
    if ((dfs_hist_index > 0 && (dfs_hist[dfs_hist_index].getSAT() || dfs_hist[dfs_hist_index].getUNSAT()))) return;

    redraw();
    dfs_hist_index += 1;
    if (dfs_hist_index < dfs_hist.length) {
        const temp = dfs_hist[dfs_hist_index]; // load past state
        temp.render();
    } else {
        if (stage === 0) {
            dfs_obj.processingUpdate();
            stage = 1;
        } else if (stage === 1) {
            dfs_obj.conditionUpdate();
            stage = 2;
        } else if (stage === 2) {
            dfs_obj.stepUpdate();
            stage = 0;
        }
        dfs_hist.push(dfs_obj.clone());
    }
}

/**
 * 
 */
export function undo() {
    if (dfs_hist_index > 0) {
        redraw();
        dfs_hist_index -= 1;
        const prev = dfs_hist[dfs_hist_index];
        prev.render();
    }
}

export function reinitDFS() {
    stage = 0;
    dfs_hist = new Array();
    dfs_hist_index = -1;
}