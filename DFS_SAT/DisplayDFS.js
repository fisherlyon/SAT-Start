import { run, undo, initDFS, reinitDFS } from './DFS.js';
import { legendManager } from './LegendManager.js';
import { getScreen, setScreen } from './ScreenManager.js';
import { Button } from '../Utility/Button.js';
import { ButtonManager } from '../Utility/ButtonManager.js';
import { ObjectDFS } from './ObjectDFS.js'

let nav_btns = null;
let display_legend = false; // read-only
let dfs_example = null;

export function displayDFS(example) {
    if (nav_btns === null) {
        initNavBtns();
    }

    nav_btns.showAll();

    if (!dfs_example) {
        if (example === 1) {
            dfs_example = new ObjectDFS(
                [[-1, 2], [-1, -2]],
                ["A", "B", " "],
                15,
                PI/10,
                100
            );
        } else if (example === 2) {
            dfs_example = new ObjectDFS(
                [[1, 3], [-1, 2], [-1, -2]],
                ["A", "B", "C", " "],
                15,
                PI/10,
                100
            );
        } else if (example === 3) {
            dfs_example = new ObjectDFS(
                [[-1, -2, 3, 4], [1, 2], [-3, -4], [2, 3], [-1, -4], [-1, -3], [2, -4], [-1, 2, 3, 4]],
                ["A", "B", "C", "D", " "],
                7,
                PI/11.27,
                100
            );
        }
        reinitDFS();
        initDFS(dfs_example);
    }

    if (display_legend) {
        legendManager.draw();
        nav_btns.remAll();
    }
}

export function keyPressed() {
    let screen = getScreen();
    if (screen === 1) {
        if (keyCode === LEFT_ARROW) undo();
        if (keyCode === RIGHT_ARROW) run(dfs_example);
    }
}

export function getDisplayLegend() {
    return display_legend;
}

export function setDisplayLegend(value) {
    display_legend = value;
}

function initNavBtns() {
    nav_btns = new ButtonManager();
    let home_btn = new Button(
        '- Home -',
        width * 0.1,
        height * 0.05,
        () => {
            if (nav_btns.getVisible()) nav_btns.remAll();
            dfs_example = null;
            nav_btns = null;
            setScreen(0);
            redraw();
        }
    );
    let legend_btn = new Button(
        '- Legend -',
        width * 0.89,
        height * 0.05,
        () => { legendManager.open(); }
    );
    let next_btn = new Button(
        "- Next -",
        width * 0.85,
        height * 0.9 - 30,
        () => { run(dfs_example); }
    );
    let undo_btn = new Button(
        "- Undo -",
        width * 0.85,
        height * 0.9,
        () => {
            undo(dfs_example);
        }
    );
    nav_btns.addButtons([home_btn, legend_btn, next_btn, undo_btn]);
}