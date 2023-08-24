// Kaden Emrich 

var menuTitle = document.getElementById("menuTitle");
var menuSubtitle = document.getElementById("menuSubtitle")
var menuButtons = [
    document.getElementById("menuButton1"),
    document.getElementById("menuButton2"),
    document.getElementById("menuButton3"),
    document.getElementById("menuButton4")
];

var maxOptions = 4;

class Menu {
    constructor(title, subtitle, options, actions, type) {
        if(type) this.type = type;
        else this.type = "main";

        this.title = title;
        this.subtitle = subtitle;
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

    show() {
        menuDiv.style = "display: block;";
    }// show()

    hide() {
        menuDiv.style = "display: none;";
    }// hide()

    draw() {
        this.hide;
        //menuDiv.style.opacity = "0";

        menuTitle.innerText = this.title;
        menuTitle.style.color = palettes[currentPalette].title;

        menuSubtitle.innerText = this.subtitle;
        menuSubtitle.style.color = palettes[currentPalette].text;

        var numOptions = this.options.length;
        if(this.options.length > 4) {
            numOptions = 4;
        }

        for(let i = 0; i < 4; i++) {
            if(i < numOptions) {
                menuButtons[i].style = "display: block;";
                menuButtons[i].style.color = palettes[currentPalette].text;
                menuButtons[i].innerText = this.options[i];
                menuButtons[i].onclick = this.actions[i];
            }
            else {
                menuButtons[i].style = "display: none;";
            }
        }

        this.show();
        //setTimeout(() => {menuDiv.style.opacity = "1";}, 10); // an attempt to fix the jitter when switching between menus
    }// draw();
}// class Menu