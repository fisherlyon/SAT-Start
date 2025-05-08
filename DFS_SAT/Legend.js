import { displayLegend } from "./DisplayDFS";

let outer_dim = 300;
let inner_dim = outer_dim - 10;

export function drawLegend() {
    legend();
    let exit_button = createButton('X');
    exit_button.position(width/2 + outer_dim/2 - 30, height/2 - outer_dim/2 + 10);
    exit_button.mousePressed(() => 
        { displayLegend = false; 
          exit_button.remove(); });
    
}

function legend() {
    push();
    fill('black');
    rect(width/2 - outer_dim/2, height/2 - outer_dim/2, outer_dim, outer_dim);
    fill('white');
    rect(width/2 - inner_dim/2, height/2 - inner_dim/2, inner_dim, inner_dim);
    pop();
    
    push();
    textSize(40);
    textStyle('bold');
    textAlign('center')
    text("Legend", width/2, height/3);
    pop();
    
    push();
    fill('black');
    rect(width/2 - 75, height/2 - 55, 150, 3);
    pop();
    
    let text_y = height/3 + 45;
    let text_x = width/5;
    let gap = 15;
    
    push();
    text('• White Node : Unprocessed variable decision', text_x, text_y);
    text('• Blue Node : Processing variable decision', text_x, text_y + gap);
    text('• Green Node : Valid variable decision', text_x, text_y + 2*gap);
    text('• Red Node : Invalid variable decision', text_x, text_y + 3*gap);
    text("• Solid Edge : 'True' decision for a variable", text_x, text_y +4*gap);
    text("• Dotted Edge : 'False' decision for a variable", text_x, text_y + 5*gap);
    text("• Black Edge : Unprocessed literal decision", text_x, text_y + 6*gap);
    text("• Blue Edge : Processing literal decision", text_x, text_y + 7*gap);
    text("• Green Edge : Valid literal decision", text_x, text_y + 8*gap);
    text("• Red Edge : Invalid literal decision", text_x, text_y + 9*gap);
    pop();
}