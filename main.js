var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");
var gameDiv = document.getElementById("gameDiv");

ctx.strokeStyle = "#fff";
ctx.fillStyle = "#fff";
ctx.lineWidth = 4;

var entities = [];

var arrowUpPressed = false;
var arrowDownPressed = false;
var arrowLeftPressed = false;
var arrowRightPressed = false;

/*----- Game Settings -----*/

var pointSize = 10;
var turnSpeed = 5;
var maxSpeed = 8;
var acceleration = 0.2;
var trippyMode = false;
var showVelocity = false;
var laserSight = false;

/*----- Game Settings End -----*/
/*----- Classes -----*/

class PointValue {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }// constructor(x, y)

    getPolar() {
        var r = Math.sqrt((this.x*this.x) + (this.y*this.y));
        if(this.x > 0)
            var dir = Math.atan(this.y / this.x) * (180 / Math.PI);
        else {
            var dir = Math.atan(this.y / this.x) * (180 / Math.PI) + 180;
        }

        return new PolarPoint(r, dir);
    }// getPolar()
}// PointValue

class PolarPoint {
    constructor(r, dir) {
        this.r = r;
        this.dir = dir;
    }// constructor(r, dir)
}// PolarPoint

class Shape {
    constructor(points) {
        this.points = [];
        for(let i = 0; i < points.length; i++) {
            this.points[i] = points[i];
        }
    }// constructor(points)

    draw(x, y, dir, color) {
        ctx.fillStyle = color;
        ctx.strokeStyle = color;

        ctx.beginPath();

        ctx.moveTo(x + this.points[0].r * Math.cos((this.points[0].dir + dir) * (Math.PI / 180)), y + this.points[0].r * Math.sin((this.points[0].dir + dir) * (Math.PI / 180)));
        for(let i = 1; i < this.points.length; i++) {
            ctx.lineTo(x + this.points[i].r * Math.cos((this.points[i].dir + dir) * (Math.PI / 180)), y + this.points[i].r * Math.sin((this.points[i].dir + dir) * (Math.PI / 180)));
        }

        ctx.closePath();

        ctx.stroke();
    }// draw()
}// Shape

class Entity {
    constructor(shape, color) {
        this.x = canvas.width/2;
        this.y = canvas.height/2;
        this.dir = 0;
        this.xSpeed = 0;
        this.ySpeed = 0;
        this.color = color;

        this.shape = shape;
    }// constructor()

    getAbsSpeed() {
        return Math.sqrt(Math.pow(this.xSpeed, 2) + Math.pow(this.ySpeed, 2));
    }// getAbsSpeed()
    
    changeDir(amount) {
        this.dir += amount;
        this.draw;
    }// changeDir(amount)

    turnLeft() {
        this.changeDir(0 - turnSpeed);
    }// turnLeft() 
    turnRight() {
        this.changeDir(turnSpeed);
    }// turnRight()

    forward(speed) {
        this.xSpeed = speed * Math.cos(this.dir * Math.PI/180);
        this.ySpeed = speed * Math.sin(this.dir * Math.PI/180);
    }// forward(speed)

    updatePosition() {
        while(this.getAbsSpeed() > maxSpeed) {
            if(this.xSpeed > 0)
                this.xSpeed -= acceleration;
            else if(this.xSpeed < 0)
                this.xSpeed += acceleration;
            
            if(this.ySpeed > 0)
                this.ySpeed -= acceleration;
            else if(this.ySpeed < 0)
                this.ySpeed += acceleration;
        }

        this.x += this.xSpeed;
        this.y += this.ySpeed;

        
        // off screen roll-over
        if(this.x < -30) {
            this.x = canvas.width + 30;
        }
        if(this.x > canvas.width + 30) {
            this.x = -30;
        }
        if(this.y < -30) {
            this.y = canvas.height + 30;
        }
        if(this.y > canvas.height + 30) {
            this.y = -30;
        }
    }// updatePosition()

    draw() {
        this.shape.draw(this.x, this.y, this.dir, this.color);

        if(showVelocity) {
            ctx.strokeStyle = "#00f";
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x + this.xSpeed*10, this.y);
            ctx.stroke();
    
            ctx.strokeStyle = "#f00";
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x, this.y + this.ySpeed*20);
            ctx.stroke();
        }
    }// draw()*/
}// Entity

/*----- Classes End -----*/
/*----- Other Things -----*/

var shipPoints = [
    new PointValue(30, 0).getPolar(),
    new PointValue(-10, 15).getPolar(),
    new PointValue(-10, -15).getPolar()
];

var laserPoints = [
    new PointValue(0, 1).getPolar(),
    new PointValue(-10, 1).getPolar(),
    new PointValue(-10, -1).getPolar(),
    new PointValue(0, -1).getPolar()
];

/*----- Other Things End -----*/

var ship = new Entity(new Shape(shipPoints), "#fff");
entities[0] = ship;
ship.dir = 270;
ship.draw = function() {
    this.shape.draw(this.x, this.y, this.dir, this.color);

    if(showVelocity) {
        ctx.strokeStyle = "#00f";
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.xSpeed*10, this.y);
        ctx.stroke();

        ctx.strokeStyle = "#f00";
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y + this.ySpeed*20);
        ctx.stroke();
    }

    if(laserSight) {
        ctx.strokeStyle = "#0f0";
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + (canvas.width * 2) * Math.cos(this.dir * (Math.PI / 180)), this.y + (canvas.width * 2) * Math.sin(this.dir * (Math.PI / 180)));
        ctx.stroke();
    }
}// ship.draw()

function shoot() {
    console.log("shoot");
    var laser = new Entity(new Shape(laserPoints), "#f00");
    var index = entities.length;
    entities[index] = laser;

    laser.dir = ship.dir;
    laser.x = ship.x;
    laser.y = ship.y;
    console.log("laser created");

    laser.forward(20);

    console.log("laser shot");

}// shoot()

/*----- I/O -----*/

document.addEventListener("keydown", function(event) {
    switch(event.key) {
        case "ArrowUp":
            arrowUpPressed = true;
            break;
        case "ArrowDown":
            arrowDownPressed = true;
            break;
        case "ArrowLeft":
            arrowLeftPressed = true;
            break;
        case "ArrowRight":
            arrowRightPressed = true;
            break;
        case " ":
            shoot();
            break;
    }
});// keydown

document.addEventListener("keyup", function(event) {
    switch(event.key) {
        case "ArrowUp":
            arrowUpPressed = false;
            break;
        case "ArrowDown":
            arrowDownPressed = false;
            break;
        case "ArrowLeft":
            arrowLeftPressed = false;
            break;
        case "ArrowRight":
            arrowRightPressed = false;
            break;
    }
});// keyup

/*----- I/O End -----*/
/*----- Update -----*/

function updateMovement() {
    if(arrowUpPressed) {
        ship.xSpeed += acceleration * Math.cos(ship.dir * (Math.PI / 180));
        ship.ySpeed += acceleration * Math.sin(ship.dir * (Math.PI / 180));
    }
    if(arrowDownPressed) {
        ship.xSpeed -= acceleration * Math.cos(ship.dir * (Math.PI / 180));
        ship.ySpeed -= acceleration * Math.sin(ship.dir * (Math.PI / 180));
    }
    if(arrowLeftPressed) {
        ship.turnLeft();
    }
    if(arrowRightPressed) {
        ship.turnRight()
    }

    //ship.updatePosition();

    for(let i = 0; i < entities.length; i++) {
        if(entities[i] != null) {
            entities[i].updatePosition();
        }
    }
}// updateMovement()

function updateSize() {
    var h = window.innerHeight;
    var w = window.innerWidth;

    if(w > h) {
        canvas.style.height = h + "px";
        canvas.style.width = h + "px";
        gameDiv.style.height = h + "px";
        gameDiv.style.width = h + "px";
    }
    else {
        canvas.style.height = w + "px";
        canvas.style.width = w + "px";
        gameDiv.style.height = w + "px";
        gameDiv.style.width = w + "px";
    }

    gameDiv.style.margin = "auto";
}// updateSize()

function drawEntities() {
    for(let i = 0; i < entities.length; i++) {
        if(entities[i] != null) {
            entities[i].draw();
        }
    }
}// drawEntities()

function updateScreen() {
    updateSize();

    if(!trippyMode)
        ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateMovement();

    drawEntities();
}// updateScreen()

/*----- Update End -----*/


// inits
function init() {
    var updateInterval = setInterval(updateScreen, 1000/60);
}// init()

init();