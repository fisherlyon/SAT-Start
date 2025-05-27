import { Button } from "../Utility/Button.js"
import { ButtonManager } from "../Utility/ButtonManager.js";
import { displayCDCL } from "./DisplayCDCL.js";
import { setScreen, getScreen } from "./ScreenManager.js";

let example = 0;
let exampleButtons;
let stage;

function setup() {
    createCanvas(400, 400);
    initExampleButtons();
    stage = 0;
}

function draw() {
    background(220);

    if (getScreen() == 0) {
        exampleButtons.showAll();
    } else {
        exampleButtons.remAll();
    }

    if (getScreen() !== 0 && example !== 0) {
        noLoop();
        displayCDCL(example);
    }
}

function keyPressed() {
    if (keyCode == LEFT_ARROW) stage -= 1;
    if (keyCode == RIGHT_ARROW) stage += 1;
}

function initExampleButtons() {
    exampleButtons = new ButtonManager();
    let btn1 = new Button(
        "Example 1",
        width / 3,
        height / 2,
        () => {
            exampleButtons.remAll();
            setScreen(1);
            example = 1;
        }
    );
    let btn2 = new Button(
        "Example 2",
        2 * width / 3,
        height / 2,
        () => {
            exampleButtons.remAll();
            setScreen(1);
            example = 2;
        }
    );
    exampleButtons.addButtons([btn1, btn2]);
}

window.setup = setup;
window.draw = draw;
window.keyPressed = keyPressed;