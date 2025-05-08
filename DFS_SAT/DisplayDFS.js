import { dfs, showButtonsDFS, removeButtonsDFS } from './DFS.js';
import { legendManager } from './LegendManager.js';
import { setScreen } from './ScreenManager.js';

let displayLegend = false; // read-only
const offset = 15;
let legend_btn;
let back_btn;
let buttonsCreated = false;
let backClicked = false;

export function displayDFS(example) {
    if (example === 1) {
        dfs(["A", "B", " "],
            [
            [-1, 2],
            [-1, -2]
            ],
            15,
            PI/10,
            100
        )
    } else if (example === 2) {
        dfs(["A", "B", "C", " "],
            [
            [-1, 2],
            [-2, 3],
            [-1, -2]
            ],
            15,
            PI/10,
            100
        );
    } else if (example === 3) {
        dfs(["A", "B", "C", "D", " "],
            [
            [-1, -2, 3, 4],
            [1, 2],
            [-3, -4],
            [2, 3],
            [-1, -4],
            [-1, -3],
            [2, -4],
            [-1, 2, 3, 4]
            ],
            7,
            PI/11.27,
            100
        );
    }

    showButtons();
    showButtonsDFS();

    if (displayLegend) {
        legendManager.draw();
    }
}

export function getDisplayLegend() {
    return displayLegend;
}

export function setDisplayLegend(value) {
    displayLegend = value;
}

function removeButtons() {
    if (buttonsCreated) {
        back_btn.remove();
        legend_btn.remove();
        back_btn = null;
        legend_btn = null;
        buttonsCreated = false;
    }
}

function showButtons() {
    backClicked = false;
    if (!buttonsCreated) {
        back_btn = createButton("- Back -");
        back_btn.position(offset, offset);
        back_btn.mousePressed(() => {
            if (buttonsCreated) {
                backClicked = true;
                removeButtons();
                removeButtonsDFS();
            }
            setScreen(0);
            redraw();
        });

        legend_btn = createButton("- Legend -");
        legend_btn.position(width - legend_btn.width, offset);
        legend_btn.mousePressed(() => { 
            legendManager.open();
        });

        if (!backClicked) {
            buttonsCreated = true;
        }
    }
}
