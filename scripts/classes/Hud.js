// var hudWrapper = document.getElementById('hud-wrapper');

// var hudBasicStats = document.getElementsByClassName('basic-stat');
// var hudExtraStats = document.getElementsByClassName('extra-stat');
// var hudNerdStats = document.getElementsByClassName('nerd-stat');

// var dispScore = document.getElementById('disp-score');
// var dispAccuracy = document.getElementById('disp-accuracy');
// var dispAsteroids = document.getElementById('disp-asteroids');
// var dispDifficulty = document.getElementById('disp-difficulty');
// var dispFps = document.getElementById('disp-fps');
// var dispElapsedTime = document.getElementById('disp-elapsed-time');
// var dispTime = document.getElementById('disp-time');

class HudElement {
    constructor(label, defaultValue, classType) {
        this.wrapper = document.createElement('span');
        if(classType) this.wrapper.classList.add(classType);

        this.label = label;

        this.classType = classType;

        this.defaultValue = defaultValue;
        this.value = this.defaultValue;
        
        this.wrapper.innerHTML += label;
        
        this.display = document.createElement('span');
        this.display.innerHTML = defaultValue;
        this.wrapper.appendChild(this.display);
    }

    setTo(newValue) {
        this.display.innerHTML = newValue;
    }

    hide() {
        this.wrapper.classList.add('hidden');
    }
    
    show() {
        this.wrapper.classList.remove('hidden');
    }
}

class HudHandler {
    constructor(wrapperElement) {
        this.wrapperElement = wrapperElement;
        this.sections = {};

        this.elements = {};
        
        this.createSection('hud-top-left');
        this.createSection('hud-top-middle');
    }

    createSection(id) {
        let nextSection = document.createElement('div');
        nextSection.classList.add('hud-section');
        nextSection.id = id;
        this.wrapperElement.appendChild(nextSection);
        this.sections[id] = nextSection;
        return nextSection;
    }

    createElement(id, section = 'hud-top-left', label = 'untitled stat: ', defaultValue = '0', statType = 'nerd-stat') {
        let newElement = new HudElement(label, defaultValue, statType);

        this.sections[section].appendChild(newElement.wrapper);

        this.elements[id] = newElement;
    }

    getElementsFromType(statType) {
        let output = [];
        for(let el of Object.entries(this.elements)) {
            if(el[1].classType == statType) {
                output.push(el[1]);
            }
        }

        return output;
    }

    hideStatType(statType) {
        let els = this.getElementsFromType(statType);
        for(let el of els) {
            el.hide();
        }
    }

    showStatType(statType) {
        let els = this.getElementsFromType(statType);
        for(let     el of els) {
            el.show();
        }
    }

    setDisplay(id, value) {
        this.elements[id].setTo(value);
    }

    setColor(color) {
        this.wrapperElement.style.color = color;
        this.wrapperElement.style.textShadow = '0 0 5px ' + color;
    }

    hide() {
        this.wrapperElement.classList.add('hidden');
    }

    show() {
        this.wrapperElement.classList.remove('hidden');
    }

    static defaultSetup() {
        let hudWrapper = document.getElementById('hud-wrapper');
        let hud = new HudHandler(hudWrapper);

        hud.createElement('score', 'hud-top-left', 'score: ', 0, 'basic-stat');
        hud.createElement('accuracy', 'hud-top-left', 'accuracy: ', '100%', 'extra-stat');
        hud.createElement('asteroids', 'hud-top-left', 'asteroids: ', '0', 'nerd-stat');
        hud.createElement('difficulty', 'hud-top-left', 'difficulty: ', '0', 'nerd-stat');
        hud.createElement('fps', 'hud-top-left', 'fps: ', '0', 'nerd-stat');
        hud.createElement('elapsed-time', 'hud-top-left', 'elapsed time: ', '0', 'nerd-stat');

        hud.createElement('time', 'hud-top-middle', '', '0', 'basic-stat');

        return hud;
    }

}// HudHandler