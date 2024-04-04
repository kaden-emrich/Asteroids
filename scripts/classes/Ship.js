// Kaden Emrich

class Ship extends Entity {
    constructor() {
        super(shipSkins[shipSkin].shape, palettes[currentPalette].ship, "ship", shipSpeed);

        this.x = spaceWidth * 0.75;
        this.y = spaceHeight * 0.25;
        this.dir = 135;

        this.isColiding = false;
    }// constructor

    async draw() {
        if(noClip && this.isColiding) {
            this.color = palettes[currentPalette].asteroid;
        }
        else {
            this.color = palettes[currentPalette].ship;
        }

        await super.draw(this.x, this.y, this.dir, this.color);

        if(laserSight) {
            ctx.globalAlpha = 0.5;
            // ctx.shadowBlur = 0;
            ctx.strokeStyle = "#0f0";

            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x + (spaceWidth * 2) * Math.cos(this.dir * (Math.PI / 180)), this.y + (spaceWidth * 2) * Math.sin(this.dir * (Math.PI / 180)));
            ctx.stroke();
            
            ctx.globalAlpha = 1;
        }
        return;
    }// draw()

    shoot(amount = 1, spread = 0) {
        for(let i = 0; i < amount; i++) {
            const nextDir = this.dir + (spread*(i/(amount-1))) - (spread/2);
            let nextLaser = new Laser(this, nextDir);
        }
    }// shoot()

    updateCollision() {
        let testColide = false;
        let collisions = this.checkAllDistCollision();

        if(this == null || collisions.length < 1) return;   

        for(let c of collisions) {
            if(c == null) {
                continue;
            }

            if(c.type == "asteroid" && this.isTouching(c)) {
                testColide = true;
                if(!noClip) {
                    killPlayer();
                    
                    c.explode();
                    continue;
                }
            }
        }
        this.isColiding = testColide;
    }// updateCollision()
}// class Ship

var shipPoints = [
    new PointValue(30, 0).getPolar(),
    new PointValue(-10, 15).getPolar(),
    new PointValue(-10, -15).getPolar()
];

var coolShipPoints = [
    new PointValue(30, 0).getPolar(),
    new PointValue(-10, 15).getPolar(),
    new PointValue(0, 0).getPolar(),
    new PointValue(-10, -15).getPolar()
];

var coolBoosterShipPoints = [
    new PointValue(30, 0).getPolar(),
    new PointValue(-10, 15).getPolar(),
    new PointValue(0, 0).getPolar(),
    new PointValue(-5, -7.5).getPolar(),
    new PointValue(-15, 0).getPolar(),
    new PointValue(-5, 7.5).getPolar(),
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

var classicShipPoints = [
    new PointValue(30, 0).getPolar(),
    new PointValue(-10, 15).getPolar(),
    new PointValue(-10, 10).getPolar(),
    new PointValue(0, 0).getPolar(),
    new PointValue(-10, -10).getPolar(),
    new PointValue(-10, -15).getPolar()
];

var classicBoosterShipPoints = [
    new PointValue(30, 0).getPolar(),
    new PointValue(-10, 15).getPolar(),
    new PointValue(-10, 10).getPolar(),
    new PointValue(0, 0).getPolar(),
    new PointValue(-5, -5).getPolar(),
    new PointValue(-15, 0).getPolar(),
    new PointValue(-5, 5).getPolar(),
    new PointValue(0, 0).getPolar(),
    new PointValue(-10, -10).getPolar(),
    new PointValue(-10, -15).getPolar()
];

var retroShipPoints = [
    new PointValue(30, 0).getPolar(),
    new PointValue(-10, 15).getPolar(),
    new PointValue(-2, 12).getPolar(),
    new PointValue(-2, -12).getPolar(),
    new PointValue(-10, -15).getPolar()
];

var retroBoosterShipPoints = [
    new PointValue(30, 0).getPolar(),
    new PointValue(-10, 15).getPolar(),
    new PointValue(-2, 12).getPolar(),
    new PointValue(-2, 5).getPolar(),
    new PointValue(-15, 0).getPolar(),
    new PointValue(-2, -5).getPolar(),
    new PointValue(-2, 5).getPolar(),
    new PointValue(-2, -12).getPolar(),
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
        name : "default",
        shape : new Shape(classicShipPoints),
        boosterShape : new Shape(classicBoosterShipPoints)
    },

    {
        name : "classic",
        shape : new Shape(retroShipPoints),
        boosterShape : new Shape(retroBoosterShipPoints)
    },

    {
        name : "winged",
        shape : new Shape(coolShipPoints),
        boosterShape : new Shape(coolBoosterShipPoints)
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
        name : "a brick",
        shape : new Shape(brickShipPoints)
    }
];