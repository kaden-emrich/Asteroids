
function lerp(a, b, t) {
    return (1 - t) * a + b * t;
}

class sound {
    constructor(src) {
        this.sound = document.createElement("audio");
        this.sound.src = src;
        this.sound.setAttribute("preload", "auto");
        this.sound.setAttribute("controls", "none");
        this.sound.style.display = "none";
        this.sound.volume = 0.5;

        document.body.appendChild(this.sound);

        this.play = function (volume = 1) {
            let soundClone = this.sound.cloneNode();
            soundClone.volume = this.sound.volume * volume;

            document.body.appendChild(soundClone);
            soundClone.play();
        };
    }
}