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

var menuTypes = [
    "main"
];

class MenuOption {
    constructor(name, action) {
        this.name = name;
        this.action = action;
    }// constructor
}// class MenuOption

class Menu {
    constructor(title, subtitle, options, type) {
        this.title = title;
        this.subtitle = subtitle;
        this.options = options;
        
        let isRealType = false;
        for(let i = 0; i < menuTypes; i++) {
            if(type == menuTypes[i]) 
                isRealType = true;
        }
        if(isRealType) this.type = type;
        else this.type = menuTypes[0];
    }// constructor

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
        if(this.options.length > 4)
            numOptions = 4;

        for(let i = 0; i < 4; i++) {
            if(i < numOptions) {
                menuButtons[i].style = "display: block;";
                menuButtons[i].style.color = palettes[currentPalette].text;
                menuButtons[i].innerText = this.options[i].name;
                menuButtons[i].onclick = this.options[i].action;
            }
            else {
                menuButtons[i].style = "display: none;";
            }
        }

        this.show();
        
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }// draw()
}// class Menu



/*
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
        
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        //setTimeout(() => {menuDiv.style.opacity = "1";}, 10); // an attempt to fix the jitter when switching between menus
    }// draw();
}// class Menu
*/