import { setDisplayLegend } from "./DisplayDFS.js";

class LegendManager {
    constructor() {
        this.close_btn = null;
        this.outer_dim = 300;
        this.inner_dim = this.outer_dim - 10;
    }

    open() {
        if (!this.close_btn) {
            this.close_btn = createButton("X");
            this.close_btn.position(this.inner_dim + this.close_btn.width + 15, height/2 - this.outer_dim/2 + this.close_btn.height);
            this.close_btn.mousePressed(() => { 
                this.close();
             });
        }
        setDisplayLegend(true);
        redraw();
    }

    close() {
        if (this.close_btn) {
            this.close_btn.remove();
            this.close_btn = null;
        }
        setDisplayLegend(false);
        redraw();
    }

    draw() {
        push();
        fill('black');
        rect(width/2 - this.outer_dim/2, height/2 - this.outer_dim/2, this.outer_dim, this.outer_dim);
        fill('white');
        rect(width/2 - this.inner_dim/2, height/2 - this.inner_dim/2, this.inner_dim, this.inner_dim);
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
}

export const legendManager = new LegendManager();