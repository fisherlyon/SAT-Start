import { Tree } from './Tree.js';
import { TreeNode } from './TreeNode.js';
import { dfs, keyPressed } from './DFS.js';
import { displayDFS } from './DisplayDFS.js';
import { setScreen, getScreen } from './ScreenManager.js';

let btn1, btn2, btn3;
export let width = 400;
export let height = 400;
let example = 0;

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);

  if (getScreen() === 0) {
    loop();
    showButtons();
  } else {
    removeButtons();
  }

  if (getScreen() === 1 && example !== 0) {
    noLoop();
    displayDFS(example);
  }
}

export function render(tree, vars, kb, dec, path, sat, rad, ascale, d) {
  background(220);
  tree.drawTree(vars, width / 2, height / 10, d, (5 * PI) / 6, PI / 6, rad, ascale);
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
  let formulaText = formula.map(clause => `(${clause.map(lit => numToVar(lit, vars)).join(' v ')})`).join(' ∧\n');
  if (formulaText === "()") formulaText = "() => Contradiction!";
  else if (formulaText === "") formulaText = "Satisfied!"
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

export function varToNum(v, vars) {
  return vars.indexOf(v) + 1;
}

function showButtons() {
  if (!btn1 || !btn2 || !btn3) {
    btn1 = createButton('- Small -');
    btn2 = createButton('- Medium -');
    btn3 = createButton('- Large -');

    btn1.position(width / 4 - btn1.width / 2, height / 2 - btn1.height / 2);
    btn2.position(width / 2 - btn2.width / 2, height / 2 - btn2.height / 2);
    btn3.position((3 * width) / 4 - btn3.width / 2, height / 2 - btn3.height / 2);

    // button 1 activates the small example
    btn1.mousePressed(() => {
      removeButtons();
      setScreen(1);
      example = 1;
    });

    // button 2 activates the medium example
    btn2.mousePressed(() => {
      removeButtons();
      setScreen(1);
      example = 2;
    });

    // button 3 activates the large example
    btn3.mousePressed(() => {
      removeButtons();
      setScreen(1);
      example = 3;
    });
  }
}

function removeButtons() {
  if (btn1 || btn2 || btn3) {
    btn1.remove();
    btn2.remove();
    btn3.remove();
    btn1 = null;
    btn2 = null;
    btn3 = null;
  }
}

window.setup = setup;
window.draw = draw;
window.keyPressed = keyPressed;