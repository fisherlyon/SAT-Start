import { ButtonManager } from "../Utility/ButtonManager.js";
import { Button } from "../Utility/Button.js";
import { run } from "./CDCL.js";
import { ObjectCDCL } from "./ObjectCDCL.js";

let navButtons;
let cdcl_example = null;

export function displayCDCL(example) {
    initNavButtons();
    navButtons.showAll();

    if (example === 1) {
        if (!cdcl_example) {
            cdcl_example = new ObjectCDCL(
                [[1, 3], [-1, 2], [-1, -2]], 
                ["A", "B", "C"]
            );
        }
    }
}

function initNavButtons() {
    navButtons = new ButtonManager();
    let next_btn = new Button(
        "- Next -",
        width / 2,
        height * 0.9,
        () => {
            run(cdcl_example);
        }
    );
    navButtons.addButtons([next_btn]);
}