// Kaden Emrich 

class Menu {
    constructor(title, options, actions, type) {
        if(type) this.type = type;
        else this.type = "main";

        this.title = title;
        this.options = options;
        this.actions = actions;
        this.selection = 0;

        this.titleSize = 4;
        this.optionsSize = 2.5;
    }// constructor
    
    next() {
        if(this.selection >= this.options.length - 1) this.selection = 0;
        else this.selection++;
    }// next()

    last() {
        if(this.selection <= 0) this.selection = this.options.length - 1;
        else this.selection--;

    }// last()

    select() {
        if(this.actions[this.selection]) {
            this.actions[this.selection]();
        }
    }// select()

    drawMain() {
        // shade background
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.lineWidth = 2  * canvas.height/parseInt(canvas.style.height);
        // Draw title
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";

        ctx.font = (fontSize * this.titleSize) + "px " + fontFamily;
        ctx.fillStyle = palettes[currentPalette].title;

        ctx.fillText(this.title, canvas.width / 2, canvas.height / 4, canvas.width);

        ctx.font = (fontSize * this.optionsSize) + "px " + fontFamily;
        // draw buttons
        for(let o in this.options) {
            if(this.selection == parseInt(o)) {
                ctx.fillStyle = palettes[currentPalette].title;
                ctx.fillText(this.options[o], canvas.width / 2, canvas.height / 2 + o * (fontSize * this.optionsSize)); 
            } else {
                /*ctx.fillStyle = palettes[currentPalette].background;
                ctx.fillText(this.options[o], canvas.width / 2, canvas.height / 2 + o * (fontSize * this.optionsSize)); */
                ctx.strokeStyle = palettes[currentPalette].text;
                ctx.strokeText(this.options[o], canvas.width / 2, canvas.height / 2 + o * (fontSize * this.optionsSize));
            }
        }

        ctx.lineWidth = 4;
    }// drawMain()

    drawOptions() {
        // shade background
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.lineWidth = 1;
        // Draw title
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";

        ctx.font = (fontSize * this.titleSize) + "px " + fontFamily;
        ctx.fillStyle = palettes[currentPalette].title;

        ctx.fillText(this.title, canvas.width / 2, canvas.height / 8, canvas.width);

        ctx.font = (fontSize * this.optionsSize) + "px " + fontFamily;
        // draw buttons
        for(let o in this.options) {
            if(this.selection == parseInt(o)) {
                ctx.fillStyle = palettes[currentPalette].title;
                ctx.fillText(this.options[o], canvas.width / 2, canvas.height * 3 / 8 + o * (fontSize * this.optionsSize)); 
            } else {
                /*ctx.fillStyle = palettes[currentPalette].background;
                ctx.fillText(this.options[o], canvas.width / 2, canvas.height * 3 / 8 + o * (fontSize * this.optionsSize)); */
                ctx.strokeStyle = palettes[currentPalette].text;
                ctx.strokeText(this.options[o], canvas.width / 2, canvas.height * 3 / 8 + o * (fontSize * this.optionsSize));
            }
        }

        ctx.lineWidth = 4;
    }// drawOptions()

    draw() {
        switch(this.type) {
            case "options":
                this.drawOptions();
                break;

            case "main":
            default:
                this.drawMain();
                break;
        }
    }// draw();
}// class Menu