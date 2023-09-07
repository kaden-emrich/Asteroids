// Kaden Emrich

var laserPoints = [
    new PointValue(15, 0).getPolar(),
    new PointValue(-15, 0).getPolar(),
    new PointValue(-15, -1).getPolar(),
    new PointValue(15, -1).getPolar()
];

class Laser extends Entity {
    constructor(ship) {
        super(new Shape(laserPoints), palettes[currentPalette].laser, "laser", laserSpeed);

        this.dir = ship.dir;
        this.x = ship.getPoints()[0].x;
        this.y = ship.getPoints()[0].y;

        this.speedVector = new Vector(ship.dir * Math.PI/180, laserSpeed);

        shotsFired++;
    }// constructor

    updatePosition() {
        this.x += this.speedVector.x;
        this.y += this.speedVector.y;

        
        // off screen delete
        if(this.x < -100  ||  this.x > canvas.width + 100  ||  this.y < -100  || this.y > canvas.height + 100) {
            entities[this.id] = null;
        }
    }// updatePosition()

    getBoundingBox() {
        var bBox = [];
        for(let i = 0; i < 4; i++) {
            bBox[i] = new PointValue(this.x, this.y);
        }
        return bBox;
    }// getBoundingBox()

    updateCollision() {
        let collisions = this.checkAllDistCollision();

        if(this == null || collisions.length < 1) return;   

        for(let c of collisions) {
            if(c == null) {
                continue;
            }

            if(c.type == "asteroid" && this.checkDistanceCollision(c)) {
                entities[this.id] = null;
                score += 100;

                c.explode();
            }
        }
    }// updateCollision()
}// class Laser