// Kaden Emrich

class Shrapnel extends Asteroid {
    constructor(x, y, dir, speed = defaultShrapnelSpeed, ticks = defaultShrapnelLife) {
        super(x, y, dir, speed, 0, Asteroid.getRandomTorqueValue());

        if(!doShrapnel) {
            this.kill();
            return;
        }

        this.ticks = ticks;
        this.liveTicks = 0;
        this.maxVelocity = velocityLimit;
        this.type = "shrapnel";
        this.forward(speed);
    }

    updatePosition() {
        this.liveTicks++;

        if(this.liveTicks >= this.ticks) {
            this.kill();
        }
        else {
            super.updatePosition();
        }
    }

    async draw() {
        await this.shape.draw(this.x, this.y, this.dir, this.color, lerp(1, 0, (this.liveTicks / this.ticks)));

        return;
    }

    async updateCollision() {
        return;
    }

    static explosion(x, y, amount, speed = defaultShrapnelSpeed, life = defaultShrapnelLife) {
        for(let i = 0; i < amount; i++) {
            var thisAngle = (Math.random() * (360 / amount)) + (360 * i / amount);

            new Shrapnel(x, y, thisAngle, speed, life);
        }

        return;
    }
}