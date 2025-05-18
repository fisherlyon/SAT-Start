import { Tree } from '../Utility/Tree.js';
import { TreeNode } from '../Utility/TreeNode.js';
import { dfs, keyPressed } from './DFS.js';
import { displayDFS } from './DisplayDFS.js';
import { setScreen, getScreen } from './ScreenManager.js';
import { Button } from '../Utility/Button.js';
import { ButtonManager } from '../Utility/ButtonManager.js';

let example = 0; // chosen example problem (1=small, 2=medium, 3=large)
let exampleButtons; // example button manager
let verbose = false; // whether or not verbose formula is displayed

function setup() {
  createCanvas(400, 400);
  initExampleButtons();
}

function draw() {
  background(220);

  if (getScreen() === 0) {
    loop();
    exampleButtons.showAll();
  } else {
    exampleButtons.remAll();
  }

  if (getScreen() === 1 && example !== 0) {
    noLoop();
    displayDFS(example);
  }
}

export function render(tree, vars, kb, dec, path, sat, rad) {
  background(220);
  tree.drawTree(vars, rad);
  displayDecision(dec, vars); // display the current decision
  displayFormula(kb, vars); // display the formula
  displayPath(path, vars); // display the current path
  displaySat(sat); // display the satisfiability status
}

function displayDecision(curDecision, vars) {
  let decisionText;
  if (curDecision === null) {
    decisionText = "None"
  } else {
    decisionText = curDecision > 0 ? vars[curDecision - 1] : "¬" + vars[-curDecision - 1];
  }
  text("Current Decision: " + decisionText, width / 20, height * 0.95);
}

function displayFormula(formula, vars) {
  let formulaText = `{${formula.map(clause => `{${clause.map(lit => numToVar(lit, vars)).join(' v ')}}`).join(' ∧\n')}}`;
  if ((formulaText === "{{}}" || formulaText == "{}") && !verbose) {
    verbose = true;
  } else if (verbose && formulaText === "{{}}") {
    formulaText += " => Contradiction!";
    verbose = false;
  } else if (verbose && formulaText === "{}") {
    formulaText += " => Satisfied!"
    verbose = false;
  }
  text("Formula:\n" + formulaText, width / 20, 3*height / 5);
}

function displayPath(path, vars) {
  let pathText;
  if (path.length === 0) {
    pathText = "None";
  } else {
    pathText = path.map(lit => numToVar(lit, vars)).join(', ');
  }
  text("Current Path: " + pathText, width*0.55, height*0.8);
}

function displaySat(sat) {
  if (sat == 0) {
    text("UNSATISFIABLE", width*0.55, height*0.75);
  } else if (sat == 1) {
    text("SATISFIABLE", width*0.55, height*0.75);
  }
}

export function numToVar(num, vars) {
  if (num < 0) {
    return "¬" + vars[-num - 1];
  }
  return vars[num - 1];
}

function initExampleButtons() {
  exampleButtons = new ButtonManager();
  let small_btn = new Button(
    '- Small -',
    width / 4,
    height / 2,
    () => {
      exampleButtons.remAll();
      setScreen(1);
      example = 1;
    }
  );
  let medium_btn = new Button(
    '- Medium -',
    width / 2,
    height / 2,
    () => {
      exampleButtons.remAll();
      setScreen(1);
      example = 2;
    }
  );
  let large_btn = new Button(
    '- Large -',
    3 * width / 4, 
    height / 2,
    () => {
      exampleButtons.remAll();
      setScreen(1);
      example = 3;
    }
  );
  exampleButtons.addButtons([small_btn, medium_btn, large_btn]);
}

window.setup = setup;
window.draw = draw;
window.keyPressed = keyPressed;