import { dfs, run, undo } from './DFS.js';
import { legendManager } from './LegendManager.js';
import { setScreen } from './ScreenManager.js';
import { Button } from '../Utility/Button.js';
import { ButtonManager } from '../Utility/ButtonManager.js';

let displayLegend = false; // read-only
let navButtons;

export function displayDFS(example) {
    initNavButtons();
    navButtons.showAll();

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

function initNavButtons() {
    navButtons = new ButtonManager();
    let back_btn = new Button(
        '- Back -',
        width * 0.09,
        height * 0.05,
        () => {
            if (navButtons.getVisible()) {
                navButtons.remAll();
            }
            setScreen(0);
            redraw();
        }
    );
    let legend_btn = new Button(
        '- Legend -',
        width * 0.89,
        height * 0.05,
        () => {
            legendManager.open();
        }
    );
    let next_btn = new Button(
        '- Next -',
        5 * width / 7,
        height * 0.95,
        run
    );
    let undo_btn = new Button(
        '- Undo -',
        width * 0.9,
        height * 0.95,
        undo
    );
    navButtons.addButtons([back_btn, legend_btn, next_btn, undo_btn]);
}