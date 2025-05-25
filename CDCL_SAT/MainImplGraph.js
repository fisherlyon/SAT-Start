import { ImplGraph } from "./ImplGraph.js";

let graph1;
let graph2;
let graph3;
let which_graph = 1;

function setup() {
    createCanvas(400, 400);    
    initGraph1();
    initGraph2();
    initGraph3();
    noLoop();
}

function draw() {
    background(220);

    if (which_graph === 1) {
        graph1.drawGraph(['A', 'B', 'X', 'Z'], 15);
    } else if (which_graph === 2) {
        graph2.drawGraph(['A', 'X', 'Y', 'Z'], 15);
    } else if (which_graph === 3) {
        graph3.drawGraph(['A', 'B'], 15);
    }
}

function keyPressed() {
    if (keyCode == LEFT_ARROW) {
        which_graph -= 1;
        if (which_graph < 1) {
            which_graph = 3;
        }
        redraw();
    }
    if (keyCode == RIGHT_ARROW) {
        which_graph += 1;
        if (which_graph > 3) {
            which_graph = 1;
        }
        redraw();
    }
}

function initGraph1() {
    graph1 = new ImplGraph();
    graph1.addDecision(1, 0);
    graph1.addDecision(2, 1);
    graph1.addDecision(-3, 2);
    graph1.addImplication(4, 2, 4, 1, [1, -3]);
    graph1.addImplication(0, 2, 6, 2, [1, -3, 4]);
}

function initGraph2() {
    graph2 = new ImplGraph(); 
    graph2.addDecision(1, 0);
    graph2.addImplication(2, 0, 8, 1, [1]);
    graph2.addImplication(3, 0, 3, 2, [1, 2]);
    graph2.addImplication(-4, 0, 5, 3, [1, 3]);
    graph2.addImplication(0, 0, 5, 4, [1, 3, -4]);
}

function initGraph3() {
    graph3 = new ImplGraph();
    graph3.addDecision(1, 0);
    graph3.addImplication(2, 0, 0, 1, [1]);
    graph3.addImplication(0, 0, 0, 2, [1, 2]);
}

window.setup = setup;
window.draw = draw;
window.keyPressed = keyPressed;