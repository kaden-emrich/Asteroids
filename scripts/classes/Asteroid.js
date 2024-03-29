// Kaden Emrich

class Asteroid extends Entity {
    constructor(x, y, dir, speed, size, torque = 0) {
        // randomly generate asteroid shape
        let asteroidPoints = [];
        let min = 60;
        let dif = 30;
        let rd = 30;
        
        if(size == 3) {
            min = 60;
            dif = 30;
            rd = 90;
        }
        else if(size == 2) {
            min = 40;
            dif = 15;
            rd = 55;
        }
        else if(size == 1) {
            min = 20;
            dif = 10;
            rd = 30;
        }
        else {
            min = 10;
            dif = 5;
            rd = 15;
        }
    
        for(let i = 0; i < 18; i++) {
            asteroidPoints[i] = new PolarPoint(Math.random() * dif + min, i * 20);
        }
    
        super(new Shape(asteroidPoints), palettes[currentPalette].asteroid, "asteroid", asteroidSpeed);
        this.x = x;
        this.y = y;
        this.dir = dir;
        this.size = size;
        this.rollOverDist = rd;
        this.torque = torque;
    
        this.forward(speed, 1);
    }// constructor(x, y, dir, speed, size)

    explode() {
        if(this.size == 2) {
            for(let i = 0; i < 3; i++) {
                new Asteroid(this.x, this.y, Math.random() * 360, asteroidSpeed, 1, Asteroid.getRandomTorqueValue());
            }
            this.spawnShrapnel(7, asteroidShrapnelLife*2);
        }
        else if(this.size == 3) {
            for(let i = 0; i < 2; i++) {
                new Asteroid(this.x, this.y, Math.random() * 360, asteroidSpeed, 2, Asteroid.getRandomTorqueValue());
            }
            this.spawnShrapnel(9, asteroidShrapnelLife*3);
        }
        else if(this.size = 1) {
            this.spawnShrapnel(4);
        }


        entities[this.id] = null;
    }// explode()

    updateCollision() {
        let collisions = this.checkAllDistCollision();

        if(this == null || collisions.length < 1) return;   

        for(let c of collisions) {
            if(c == null || c.type == "asteroid") {
                continue;
            }

            if(c.type == "ship" && this.isTouching(c)) {
                if(noClip == false) {
                    killPlayer();
                    this.explode();
                }
                return;
            }
            else if(c.type == "laser" && this.checkDistanceCollision(c)) {
                entities[c.id] = null;
                score += 100;
                
                this.explode();
            }
        }
    }// updateCollision()

    // draw() {
    //     super.drawWrap();
    // }// draw()

    spawnShrapnel(shrapAmount = asteroidShrapnelAmount, shrapLife = asteroidShrapnelLife, shrapSpeed = asteroidShrapnelSpeed) {
        Shrapnel.explosion(this.x, this.y, shrapAmount, shrapSpeed, shrapLife);

        return;
    }

    static getRandomTorqueValue() {
        return (Math.random() * (maxAsteroidTorque * 2)) - maxAsteroidTorque;
    }

    update() {

    }// update
}// class Asteroid