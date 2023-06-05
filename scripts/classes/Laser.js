// Kaden Emrich

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
}// class Laser