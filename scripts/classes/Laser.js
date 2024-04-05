// Kaden Emrich

const laserLength = 10;
var laserPoints = [
    new PointValue(laserLength, 0).getPolar(),
    new PointValue(-laserLength, 0).getPolar(),
    new PointValue(-laserLength, -1).getPolar(),
    new PointValue(laserLength, -1).getPolar()
];

class Laser extends Entity {
    constructor(ship, overrideDir) {
        super(new Shape(laserPoints), palettes[currentPalette].laser, "laser", laserSpeed);

        this.dir = ship.dir;
        if(overrideDir) this.dir = overrideDir;

        this.x = ship.getPoints()[0].x;
        this.y = ship.getPoints()[0].y;

        this.speedVector = new Vector(this.dir * Math.PI/180, laserSpeed);

        this.penetration = shootPenetration;

        shotsFired++;
    }// constructor

    updatePosition(frameTime = 1/60) {
        this.x += this.speedVector.x * frameTime;
        this.y += this.speedVector.y * frameTime;

        
        // off screen delete
        if(this.x < -100  ||  this.x > spaceWidth + 100  ||  this.y < -100  || this.y > spaceHeight + 100) {
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
                if(this.penetration == shootPenetration) { // only if it is the lasers first collision count it as a new hit
                    shotsHit++;
                }

                new TextBlip(this.x * spaceScale, this.y * spaceScale, `+${scoreIncrement}`, this.dir+180);
                score += scoreIncrement;

                if(this.penetration > 0) {
                    this.penetration--;
                }
                else {
                    entities[this.id] = null;
                }

                c.explode();
                return;
            }
        }
    }// updateCollision()
}// class Laser