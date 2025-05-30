import { ButtonManager } from "../Utility/ButtonManager.js";
import { Button } from "../Utility/Button.js";
import { run, undo } from "./CDCL.js";
import { ObjectCDCL } from "./ObjectCDCL.js";
import { getScreen, setScreen } from "./ScreenManager.js";

let navButtons = null;
let cdcl_example = null;
let sat = false;

export function displayCDCL(example) {
    if (navButtons === null) {
        initNavButtons();
    }
    
    navButtons.showAll();

    if (example === 1) {
        if (!cdcl_example) {
            cdcl_example = new ObjectCDCL(
                [[1, 3], [-1, 2], [-1, -2]], 
                ["A", "B", "C"]
            );
            run(cdcl_example); // initial run
        }
    } else if (example === 2) {
        if (!cdcl_example) {
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
            run(cdcl_example); // initial run
        }
    }
}

export function keyPressed() {
    let screen = getScreen();
    if (screen === 1 || screen === 2) {
        if (keyCode == LEFT_ARROW) {
            undo(cdcl_example);
        }
        if (keyCode == RIGHT_ARROW) {
            if (!sat) {
                if (!cdcl_example.getSAT()) {
                    run(cdcl_example);
                } else {
                    text("TVA: " + cdcl_example.getI().map((x) => (cdcl_example.numToVar(x))), width * 0.55, height * 0.6);
                    sat = true;
                }
            }
        }
    }
}

function initNavButtons() {
    navButtons = new ButtonManager();
    let next_btn = new Button(
        "- Next -",
        width * 0.85,
        height * 0.9 - 30,
        () => {
            if (!sat) {
                if (!cdcl_example.getSAT()) {
                    run(cdcl_example);
                } else {
                    text("TVA: " + cdcl_example.getI().map((x) => (cdcl_example.numToVar(x))), width * 0.55, height * 0.6);
                    sat = true;
                }
            }
        }
    );
    let undo_btn = new Button(
        "- Undo -",
        width * 0.85,
        height * 0.9,
        () => {
            undo(cdcl_example);
        }
    );
    navButtons.addButtons([next_btn, undo_btn]);
}