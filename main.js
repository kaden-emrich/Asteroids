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
var showBoundingBoxes = false;
var boundingBoxColor = "#0ff";
var astroidSpeed = 2;

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

    getRect() {
        var x = this.r * Math.cos(this.dir * Math.PI / 180);
        var y = this.r * Math.sin(this.dir * Math.PI / 180);
        return new PointValue(x, y);
    }// getRect()
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
    constructor(shape, color, type) {
        this.x = canvas.width/2;
        this.y = canvas.height/2;
        this.dir = 0;
        this.xSpeed = 0;
        this.ySpeed = 0;
        this.color = color;
        this.type = type;

        this.index = entities.length;
        entities[this.index] = this;

        this.shape = shape;
    }// constructor()

    getPolarPoints() {
        var pPoints = [];
        for(let i = 0; i < this.shape.points.length; i++) {
            var r = this.shape.points[i].r;
            var dir = this.shape.points[i].dir + this.dir;
            pPoints[i] = new PolarPoint(r, dir);
        }
        return pPoints;
    }// getPolarPoints()

    getPoints() {
        var pPoints = this.getPolarPoints();
        var rPoints = [];
        for(let i = 0; i < pPoints.length; i++) {
            var x = this.x + pPoints[i].r * Math.cos(pPoints[i].dir * Math.PI / 180);
            var y = this.y + pPoints[i].r * Math.sin(pPoints[i].dir * Math.PI / 180);

            rPoints[i] = new PointValue(x, y);
        }

        return rPoints;
    }// getRectPoints()

    getBoundingBox() {
        var points = this.getPoints();

        var xMin = points[0].x;
        var xMax = points[0].x;
        var yMin = points[0].y;
        var yMax = points[0].y;

        for(let i = 1; i < points.length; i++) {
            if(points[i].x < xMin)
                xMin = points[i].x;
            if(points[i].x > xMax)
                xMax = points[i].x;
            if(points[i].y < yMin)
                yMin = points[i].y;
            if(points[i].y > yMax)
                yMax = points[i].y;
        }

        var bBox = [
            new PointValue(xMin, yMin),
            new PointValue(xMax, yMin),
            new PointValue(xMax, yMax),
            new PointValue(xMin, yMax)
        ];

        return bBox;
    }// getBoundingBox()

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

    drawBoundingBox() {
        var bBox = this.getBoundingBox();

        ctx.strokeStyle = boundingBoxColor;
        ctx.beginPath();
        ctx.moveTo(bBox[0].x, bBox[0].y);
        for(let i = 1; i < bBox.length; i++) {
            ctx.lineTo(bBox[i].x, bBox[i].y);   
        }
        ctx.closePath();
        ctx.stroke();
    }// drawBoundingBox()

    checkColision() {
        for(let i = 0; i < entities.length; i++) {
            if(entities[i] != null && i != this.index) {
                var objectA = this.getBoundingBox();
                var objectB = entities[i].getBoundingBox();

                if(
                    objectA[1].x >= objectB[0].x &&
                    objectA[0].x <= objectB[1].x &&
                    objectA[2].y >= objectB[0].y &&
                    objectA[0].y <= objectB[2].y &&
                    this.type != entities[i].type &&
                    ((this.type == "astroid1" || this.type == "astroid2" || this.type == "astroid3") && 
                    (entities[i].type == "astroid1" || entities[i].type == "astroid2" || entities[i].type == "astroid3"))
                ) {
                    return entities[i]; 
                }
            }
        }

        return null;
    }// checkColision()
}// Entity

/*----- Classes End -----*/
/*----- Other Things -----*/

function gameOver() {
    alert("You lose. Reload to retry.");
}// gameOver()

var shipPoints = [
    new PointValue(30, 0).getPolar(),
    new PointValue(-10, 15).getPolar(),
    new PointValue(-10, -15).getPolar()
];

var laserPoints = [
    new PointValue(0, 0).getPolar(),
    new PointValue(-30, 0).getPolar(),
    new PointValue(-30, -1).getPolar(),
    new PointValue(0, -1).getPolar()
];

/*----- Other Things End -----*/

var ship = new Entity(new Shape(shipPoints), "#fff", "ship");
ship.dir = 270;
ship.draw = function() {
    if(this.checkColision() != null) {
        this.color = "#f00";
    }
    else {
        this.color = "#fff";
    }
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
    //console.log("shoot"); // for debugging
    var laser = new Entity(new Shape(laserPoints), "#f00", "laser");
    laser.updatePosition = function() {
        this.x += this.xSpeed;
        this.y += this.ySpeed;

        
        // off screen delete
        if(this.x < -30  ||  this.x > canvas.width + 30  ||  this.y < -30  || this.y > canvas.height + 30) {
            entities[laser.index] = null;
        }
    }

    laser.getBoundingBox = function() {
        var bBox = [];
        for(let i = 0; i < 4; i++) {
            bBox[i] = new PointValue(this.x, this.y);
        }
        return bBox;
    }

    laser.dir = ship.dir;
    laser.x = ship.getPoints()[0].x;
    laser.y = ship.getPoints()[0].y;
    //console.log("laser created"); // for debugging

    laser.forward(20);

    //console.log("laser shot"); // for debugging

}// shoot()

function spawnAstroid(x, y, dir, speed, size) {
    // randomly generate astroid shape
    var astroidPoints = [];
    var min = 60;
    var dif = 30;
    
    if(size == 3) {
        min = 60;
        dif = 30;
    }
    else if(size == 2) {
        min = 40;
        dif = 15;
    }
    else if(size == 1) {
        min = 20;
        dif = 10;
    }

    for(let i = 0; i < 18; i++) {
        astroidPoints[i] = new PolarPoint(Math.random() * dif + min, i * 20);
    }

    var astroid = new Entity(new Shape(astroidPoints), "#fff", "astroid");
    astroid.size = size;
    astroid.x = x;
    astroid.y = y;
    astroid.dir = dir;

    astroid.forward(speed);
}// spawnAstroid()

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

function entityColision(entity) {
    if(entity.checkColision() == null) return;

    switch(entity.type) {
        case "astroid1":
            astroidColision(entity, 1);
            break;
        case "astroid2":
            astroidColision(entity, 2);
            break;
        case "astroid3":
            astroidColision(entity, 3);
            break;
    }
}// entityColision(entity)

function astroidColision(astroid, size) {
    if(astroid.checkColision().type == "ship") {
        entities[astroid.checkColision().index] = null;
        gameOver();
    }

    if(astroid.checkColision().type != "laser") return;

    entities[astroid.index] = null;
    entities[astroid.checkColision().index] = null;

    if(size == 2) {
        spawnAstroid(astroid.x, astroid.y, Math.random() * 360, astroidSpeed, 1);
        spawnAstroid(astroid.x, astroid.y, Math.random() * 360, astroidSpeed, 1);
        spawnAstroid(astroid.x, astroid.y, Math.random() * 360, astroidSpeed, 1);
    }
    if(size == 3) {
        spawnAstroid(astroid.x, astroid.y, Math.random() * 360, astroidSpeed, 2);
        spawnAstroid(astroid.x, astroid.y, Math.random() * 360, astroidSpeed, 2);
    }
}// astroidColision(entity)

function updateColision() {
    for(let i = 0; i < entities.length; i++) {
        if(entities[i] != null) {
            entityColision(entities[i]);
        }
    }
}// updateColision()

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

            if(showBoundingBoxes) {
                entities[i].drawBoundingBox();
            }
        }
    }
}// drawEntities()

function updateScreen() {
    updateSize();

    if(!trippyMode)
        ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateMovement();
    updateColision();

    drawEntities();
}// updateScreen()

/*----- Update End -----*/


// inits
function init() {
    var updateInterval = setInterval(updateScreen, 1000/60);
}// init()

init();