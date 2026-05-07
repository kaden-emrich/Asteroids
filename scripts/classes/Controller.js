class KeyHandler {
    constructor(keys, pressAction, releaseAction, uiButtons = []) {
        this.keys = keys;
        this.pressAction = pressAction;
        this.releaseAction = releaseAction;
        this.uiButtons = uiButtons;

        this.pressed = [];
        for(let i = 0; i < this.keys.length; i++) {
            this.pressed[i] = false;
        }

        for(let i = 0; i < this.uiButtons.length; i++) {
            this.addUiButton(this.uiButtons[i]);
        }
    }// constructor

    get isActive() {
        for(let p of this.pressed) {
            if(!this.pressed)
                return false;
        }

        return true;
    }

    addUiButton(element) {
        element.addEventListener("touchstart", (event) => {
            event.preventDefault();
            if(this.pressAction) this.pressAction();
        });

        element.addEventListener("touchend", (event) => {
            event.preventDefault();
            if(this.releaseAction) this.releaseAction();
        });
    } 
}// class KeyHandler

class KeyController {
    constructor(handlers) {
        this.handlers = handlers;
    }// constructor
}// class KeyController

document.addEventListener("keydown", (event) => {
    if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(event.code) > -1) {
        event.preventDefault();
    }

    document.body.style.cursor = "none";

    if(!currentController) return;
    for(let h of currentController.handlers) {
        for(let k in h.keys) {
            if(event.key == h.keys[k]) {
                h.pressed[k] = true;
                if(h.pressAction) h.pressAction();
                return;
            }
        }
    }
}); // keydown

document.addEventListener("keyup", (event) => {
    if(!currentController) return;
    for(let h of currentController.handlers) {
        for(let k in h.keys) {
            if(event.key == h.keys[k]) {
                h.pressed[k] = false;
                if(h.releaseAction) h.releaseAction();
                return;
            }
        }
    }
}); // keyup

document.addEventListener("mousemove", () => {
    document.body.style.cursor = "unset";
});// mouse move
document.addEventListener("mousedown", () => {
    document.body.style.cursor = "unset";
});// mouse down
// document.addEventListener("mouseup", () => {
//     document.body.style.cursor = "unset";
// });// mouse up

