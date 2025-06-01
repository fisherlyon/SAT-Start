import { Button } from "../Utility/Button.js"
import { ButtonManager } from "../Utility/ButtonManager.js";
import { displayCDCL, keyPressed } from "./DisplayCDCL.js";
import { setScreen, getScreen } from "./ScreenManager.js";
import { Textbox } from "../Utility/Textbox.js";
import { TextboxManager } from "../Utility/TextboxManager.js";

let example = 0;
let exampleButtons;
let textboxes;
let customs = [[[]], []];
let invalid_formula = false;
let invalid_vars = false;

function setup() {
    createCanvas(400, 400);
    initExampleButtons();
    initTextboxes();
}

function draw() {
    background(220);

    if (getScreen() == 0) {
        if (!isLooping()) loop();
        exampleButtons.showAll();
        textboxes.showAll();
    } else {
        noLoop();
        exampleButtons.remAll();
        textboxes.remAll();
        displayCDCL(example, [customs[0], customs[1]]);
    }

    if (invalid_formula || invalid_vars) {
        let ftb = textboxes.getTextboxes()[0];
        let vtb = textboxes.getTextboxes()[1];

        if (invalid_formula) redBox(ftb.getX()-ftb.getWidth()/2, ftb.getY()-ftb.getHeight()/2, ftb.getWidth(), ftb.getHeight());
        if (invalid_vars) redBox(vtb.getX()-vtb.getWidth()/2, vtb.getY()-vtb.getHeight()/2, vtb.getWidth(), vtb.getHeight());
    }

    if (textboxes.getTextboxes().every(tb => tb.getValue().trim() !== "")) {
        collectCustoms();
    }
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
    let btn3 = new Button(
        "Custom Example",
        width / 2,
        2 * height / 3 + 80,
        () => {
            if (!(invalid_formula || invalid_vars)) {
                exampleButtons.remAll();
                setScreen(1);
                example = 3;
            }
        }
    )
    exampleButtons.addButtons([btn1, btn2, btn3]);
}

function initTextboxes() {
    textboxes = new TextboxManager();
    let formula_textbox = new Textbox(
        "[[1, 2], [-1, -2]]",
        width / 2,
        2 * height / 3
    );
    let vars_textbox = new Textbox(
        '["A", "B"]',
        width / 2,
        2 * height / 3 + 40
    );
    textboxes.addTextboxes([formula_textbox, vars_textbox]);
}

function collectCustoms() {
    let formula_arr;
    let vars_arr;
    if (textboxes.getTextboxes().length > 0) {
        let tbs = textboxes.getTextboxes();

        try{
            formula_arr = JSON.parse(tbs[0].getValue());
            invalid_formula = false;
        } catch (e) {
            invalid_formula = true;
        }

        try{
            vars_arr = JSON.parse(tbs[1].getValue());
            invalid_vars = false;
        } catch (e) {
            invalid_vars = true;
        }

        if (invalid_formula || invalid_vars) return;

        customs = [formula_arr, vars_arr];
    }
}

function redBox(x, y, w, h) {
    push();
    fill('red');
    noStroke();
    rect(x-7, y-3, w+9, h+8);
    pop();
}

window.setup = setup;
window.draw = draw;
window.keyPressed = keyPressed;