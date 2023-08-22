class KeyHandler {
    constructor(keys, pressAction, releaseAction) {
        this.keys = keys;
        this.pressAction = pressAction;
        this.releaseAction = releaseAction;

        this.pressed = [];
        for(let i = 0; i < this.keys.length; i++) {
            this.pressed[i] = false;
        }
    }// constructor

    get isActive() {
        for(let p of this.pressed) {
            if(!this.pressed)
                return false;
        }

        return true;
    }
}// class KeyHandler

class KeyController {
    constructor(handlers) {
        this.handlers = handlers;
    }// constructor
}// class KeyController

document.addEventListener("keydown", (event) => {
    if(!currentController) return;
    for(let h of currentController.handlers) {
        for(let k in h.keys) {
            if(event.key == h.keys[k]) {
                h.pressed[k] = true;
                h.active = false;
                if(h.pressAction) h.pressAction();
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
            }
        }
    }
}); // keyup

function updateKeys() {

}// updateKeys();