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
