import { ButtonManager } from "../Utility/ButtonManager.js";
import { Button } from "../Utility/Button.js";
import { run, undo, reinit } from "./CDCL.js";
import { ObjectCDCL } from "./ObjectCDCL.js";
import { getScreen, setScreen } from "./ScreenManager.js";

let nav_btns = null;
let cdcl_example = null;

export function displayCDCL(example, customs = []) {
    if (nav_btns === null) {
        initNavBtns();
    }
    
    nav_btns.showAll();

    if (!cdcl_example) {
        if (example === 1) {
            cdcl_example = new ObjectCDCL(
                [[1, 3], [-1, 2], [-1, -2]], 
                ["A", "B", "C"]
            );
        } else if (example === 2) {
            cdcl_example = new ObjectCDCL(
                [
                    [1, 2], [2, 3], 
                    [-1, 4, 6],
                    [-1, -4, 5],
                    [-1, -5, 6],
                    [-1, 4, -6],
                    [-1, -5, -6]
                ],
                ["A", "B", "C", "X", "Y", "Z"]
            );
        } else if (example === 3) {
            cdcl_example = new ObjectCDCL(customs[0], customs[1]);
        }
        reinit(); // reinit all globals
        run(cdcl_example); // initial run to get things rollin'
    }
}

export function keyPressed() {
    let screen = getScreen();
    if (screen === 1 || screen === 2) {
        if (keyCode == LEFT_ARROW) {
            undo(cdcl_example);
        }
        if (keyCode == RIGHT_ARROW) {
            run(cdcl_example);
        }
    }
}

function initNavBtns() {
    nav_btns = new ButtonManager();
    let next_btn = new Button(
        "- Next -",
        width * 0.85,
        height * 0.9 - 30,
        () => { run(cdcl_example); }
    );
    let undo_btn = new Button(
        "- Undo -",
        width * 0.85,
        height * 0.9,
        () => {
            undo(cdcl_example);
        }
    );
    let back_btn = new Button(
        '- Back -',
        width * 0.09,
        height * 0.05,
        () => {
            if (nav_btns.getVisible()) {
                nav_btns.remAll();
            }
            cdcl_example = null;
            nav_btns = null;
            setScreen(0);
            redraw();
        }
    );
    nav_btns.addButtons([next_btn, undo_btn, back_btn]);
}