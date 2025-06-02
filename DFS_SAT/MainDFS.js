import { displayDFS, keyPressed } from './DisplayDFS.js';
import { setScreen, getScreen } from './ScreenManager.js';
import { Button } from '../Utility/Button.js';
import { ButtonManager } from '../Utility/ButtonManager.js';

let example = 0; // chosen example problem (1=small, 2=medium, 3=large)
let nav_btns; // example button manager

function setup() {
  createCanvas(400, 400);
  initNavBtns();
}

function draw() {
  background(220);

  if (getScreen() === 0) {
    if (!isLooping()) loop();
    nav_btns.showAll();
  } else {
    noLoop();
    nav_btns.remAll();
    displayDFS(example);
  }
}

function initNavBtns() {
  nav_btns = new ButtonManager();
  let small_btn = new Button(
    '- Small -',
    width / 4,
    height / 2,
    () => {
      nav_btns.remAll();
      setScreen(1);
      example = 1;
    }
  );
  let medium_btn = new Button(
    '- Medium -',
    width / 2,
    height / 2,
    () => {
      nav_btns.remAll();
      setScreen(1);
      example = 2;
    }
  );
  let large_btn = new Button(
    '- Large -',
    3 * width / 4, 
    height / 2,
    () => {
      nav_btns.remAll();
      setScreen(1);
      example = 3;
    }
  );
  nav_btns.addButtons([small_btn, medium_btn, large_btn]);
}

window.setup = setup;
window.draw = draw;
window.keyPressed = keyPressed;