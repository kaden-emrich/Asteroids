// Kaden Emrich

class TextBlip extends Entity {
    constructor(x, y, text, dir, speed = textBlipSpeed, size = 30, ticks = 600) {
        super(null, palettes[currentPalette].text, "textBlip", speed);

        this.x = x;
        this.y = y;
        this.text = text;
        this.size = size;
        this.ticks = ticks;
        this.liveTicks = 0;
        this.dir = dir;

        this.addSpeedVector(new Vector(this.dir * Math.PI/180, speed));

        // this.drawAfterBlur = true;

        // console.log(`New TextBlip: ${this.id}`); // for debugging
    }

    updatePosition(frameTime = 1/60) {
        this.liveTicks += 1000 * frameTime;

        if(this.liveTicks >= this.ticks) {
            this.kill();
        }
        else {
            super.updatePosition(frameTime);
        }
    }

    async draw() {
        ctx.globalAlpha = lerp(1, 0, (this.liveTicks / this.ticks));
        ctx.font = this.size + "px Munro";
        ctx.fillStyle = this.color;
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillText(this.text, this.x, this.y);

        // await starShape.fill(this.x, this.y, 0, palettes[currentPalette].ship, 1); // for debugging

        // console.log("Drawing text blip"); // for debugging

        ctx.globalAlpha = 1.0;
        return;
    }

    async updateCollision() {
        return;
    }
}