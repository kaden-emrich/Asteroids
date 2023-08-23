// Kaden Emrich

class Ship extends Entity {
    constructor() {
        super(shipSkins[shipSkin].shape, palettes[currentPalette].ship, "ship", shipSpeed);

        this.x = canvas.width * 0.75;
        this.y = canvas.height * 0.25;
        this.dir = 135;
    }// constructor

    draw() {
        if(noClip) {
            var colision = this.checkLineColision();
            if(colision != null && colision.type == "asteroid") {
                this.color = "#f00";
            }
            else {
                this.color = "#fff";
            }
        }
        this.shape.draw(this.x, this.y, this.dir, this.color);
        

        if(showVelocity) {
            ctx.strokeStyle = "#00f";
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x + this.speedVector.x*10, this.y);
            ctx.stroke();

            ctx.strokeStyle = "#f00";
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x, this.y + this.speedVector.y*20);
            ctx.stroke();
        }

        if(laserSight) {
            ctx.strokeStyle = "#0f0";
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x + (canvas.width * 2) * Math.cos(this.dir * (Math.PI / 180)), this.y + (canvas.width * 2) * Math.sin(this.dir * (Math.PI / 180)));
            ctx.stroke();
        }
    }// draw()

    shoot() {
        new Laser(this);
    }// shoot()
}// class Ship

var shipPoints = [
    new PointValue(30, 0).getPolar(),
    new PointValue(-10, 15).getPolar(),
    new PointValue(-10, -15).getPolar()
];

var classicShipPoints = [
    new PointValue(30, 0).getPolar(),
    new PointValue(-10, 15).getPolar(),
    new PointValue(0, 0).getPolar(),
    new PointValue(-10, -15).getPolar()
];

var arrowShipPoints = [
    new PointValue(30, 0).getPolar(),
    new PointValue(0, 15).getPolar(),
    new PointValue(0, 10).getPolar(),
    new PointValue(-10, 10).getPolar(),
    new PointValue(-10, -10).getPolar(),
    new PointValue(0, -10).getPolar(),
    new PointValue(0, -15).getPolar()
];

var coolShipPoints = [
    new PointValue(30, 0).getPolar(),
    new PointValue(-10, 15).getPolar(),
    new PointValue(-10, 10).getPolar(),
    new PointValue(0, 0).getPolar(),
    new PointValue(-10, -10).getPolar(),
    new PointValue(-10, -15).getPolar()
];

var brickShipPoints = [
    new PointValue(30, 0).getPolar(),
    new PointValue(25, 15).getPolar(),
    new PointValue(-10, 15).getPolar(),
    new PointValue(-10, -15).getPolar(),
    new PointValue(25, -15).getPolar()
];

var breadShipPoints = [
    new PointValue(28, 0).getPolar(),
    new PointValue(30, 5).getPolar(),
    new PointValue(30, 15).getPolar(),
    new PointValue(20, 15).getPolar(),
    new PointValue(15, 10).getPolar(),
    new PointValue(-5, 12).getPolar(),
    new PointValue(-5, -12).getPolar(),
    new PointValue(15, -10).getPolar(),
    new PointValue(20, -15).getPolar(),
    new PointValue(30, -15).getPolar(),
    new PointValue(30, -5).getPolar()
];

var shipSkins = [
    {
        name : "classic",
        shape : new Shape(classicShipPoints)
    },

    {
        name : "basic",
        shape : new Shape(shipPoints)
    },

    {
        name : "arrow",
        shape : new Shape(arrowShipPoints)
    },

    {
        name : "cool",
        shape : new Shape(coolShipPoints)
    },

    {
        name : "a brick",
        shape : new Shape(brickShipPoints)
    }
];