// Kaden Emrich

class Asteroid extends Entity {
    constructor(x, y, dir, speed, size) {
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
    
        this.forward(speed);
    }// constructor(x, y, dir, speed, size)

    updateColision() {
        var colision = this.checkBoxColision();

        if(this == null || colision == null || colision.type == null) return;

        for(let i = 0; i < entities.length; i++) {
            if(entities[i] != null) {
                if(entities[i].type == "ship" && this.isTouching(entities[i])) {
                    if(noClip == false) {
                        killPlayer();
                    }
                    return;
                }
                else if(entities[i].type == "laser" && this.checkDistanceColision(entities[i])) {
                    entities[i] = null;
                    score += 100;
                    
                    if(this.size == 2) {this
                        new Asteroid(this.x, this.y, Math.random() * 360, asteroidSpeed, 1);
                        new Asteroid(this.x, this.y, Math.random() * 360, asteroidSpeed, 1);
                        new Asteroid(this.x, this.y, Math.random() * 360, asteroidSpeed, 1);
                    }
                    if(this.size == 3) {
                        new Asteroid(this.x, this.y, Math.random() * 360, asteroidSpeed, 2);
                        new Asteroid(this.x, this.y, Math.random() * 360, asteroidSpeed, 2);
                    }

                    entities[this.id] = null;
                }
            }
        }
    }// updateColision()

    // draw() {
    //     super.drawWrap();
    // }// draw()

    update() {

    }// update
}// class Asteroid