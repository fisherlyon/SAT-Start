import { displayDecisionTree } from "./DisplayDecisionTree.js";
import { setScreen, getScreen } from "./ScreenManager.js";

let exampleButtons;
let stage;

function setup() {
    createCanvas(400, 400);
    stage = 0;
}

function draw() {
    background(220);

    if (stage === 0) {
        displayDecisionTree([], [" "], 100, 15, PI/10);
    } else if (stage === 1) {
        displayDecisionTree([-1], ["A"," "], 100, 15, PI/10);
    } else if (stage === 2) {
        displayDecisionTree([-1, 2], ["A", "B", " "], 100, 15, PI/10);
    } else if (stage === 3) {
        displayDecisionTree([-1, 2, -3], ["A", "B", "C", " "], 100, 15, PI/10);
    }

    
}

function keyPressed() {
    if (keyCode == LEFT_ARROW) stage -= 1;
    if (keyCode == RIGHT_ARROW) stage += 1;
}

window.setup = setup;
window.draw = draw;
window.keyPressed = keyPressed;