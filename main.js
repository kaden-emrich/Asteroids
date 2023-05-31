var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");
var gameDiv = document.getElementById("gameDiv");

ctx.strokeStyle = "#fff";
ctx.fillStyle = "#fff";
ctx.lineWidth = 4;

var updateInterval;

var ship;
var entities = [];

var score = 0;

var arrowUpPressed = false;
var arrowDownPressed = false;
var arrowLeftPressed = false;
var arrowRightPressed = false;

var currentDifficulty = 1;
var shotsFired = 0;

var paused = false;
var gameOver = false;

/*----- Game Settings -----*/

var viewType = "square";
var pointSize = 10;
var turnSpeed = 5;
var maxSpeed = 8;
var acceleration = 0.2;
var trippyMode = false;
var showVelocity = false;
var laserSight = false;
var showBoundingBoxes = false;
var boundingBoxColor = "#0ff";
var asteroidSpeed = 2;
var fontFamily = "Munro";
var fontSize = 50;
var textColor = "#fff";
var noClip = false;

/*----- Game Settings End -----*/

function pause() {
    if(paused == true) {
        paused = false;
        updateInterval = setInterval(updateScreen, 1000/60);
    }
    else {
        paused = true;
        clearInterval(updateInterval);
        ctx.fillText("Paused", canvas.width - 180, 30);
        ctx.stroke();
    }
}

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
}// class PointValue

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
}// class PolarPoint

class Vector {
    constructor(dir, mag) { // dir in radians, mag in units
        this.dir = dir % (Math.PI * 2);
        this.mag = mag;
    }// constructor

    get x() {
        if(this.dir < 0-Math.PI/2 || this.dir >= Math.PI/2) return 0 - (this.mag * Math.cos(this.dir));

        return this.mag * Math.cos(this.dir);
    }// get x

    get y() {
        if(this.dir < 0-Math.PI/2 || this.dir >= Math.PI/2) return 0 - (this.mag * Math.sin(this.dir));

        return this.mag * Math.sin(this.dir);
    }// get y

    add(otherVector) {
        let xTotal = this.x + otherVector.x;
        let yTotal = this.y + otherVector.y;

        let magTotal = Math.sqrt(Math.pow(otherVector.x + this.x, 2) + Math.pow(otherVector.y + this.y, 2));

        let dirTotal = Math.atan(yTotal / xTotal);

        // if(xTotal >= 0) dirTotal = Math.atan(yTotal / xTotal);
        // else dirTotal = Math.atan(yTotal / xTotal) + Math.PI;

        return new Vector(dirTotal, magTotal);
    }// add(otherVector)
}// class Vector

class Line {
    constructor(p1, p2) {
        this.point1 = p1;
        this.point2 = p2;
    }// constructor(p1, p2)

    getOrentation(p, q, r) {
        var exp = (q.y - p.y)*(r.x - q.x) - (q.x - p.x)*(r.y - q.y);
        if(exp > 0) return 1;
        else if(exp < 0) return -1;
        else return 0;
    }// getOrentation(p, q, r)

    intersects(line2) { // I think this works. Probably???
        var a1 = this.point1;
        var b1 = this.point2;
        var a2 = line2.point1;
        var b2 = line2.point2;

        if(
        this.getOrentation(a1, b1, a2) != this.getOrentation(a1, b1, b2) &&
        this.getOrentation(a2, b2, a1) != this.getOrentation(a2, b2, b1)
        ) return true;

        else return false;
    }// intersects(line2)
}// line

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
        this.speedVector = new Vector(0, 0);
        this.color = color;
        this.type = type;
        this.rollOverDist = 30;

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

    addSpeedVector(otherVector) {
        this.speedVector = this.speedVector.add(otherVector);
    }// addSpeedVector(otherVector)

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
        if(this.x < 0-this.rollOverDist) {
            this.x = canvas.width + this.rollOverDist;
        }
        if(this.x > canvas.width + this.rollOverDist) {
            this.x = 0-this.rollOverDist;
        }
        if(this.y < 0-this.rollOverDist) {
            this.y = canvas.height + this.rollOverDist;
        }
        if(this.y > canvas.height + this.rollOverDist) {
            this.y = 0-this.rollOverDist;
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

    boxIsTouching(e2) {
        var objectA = this.getBoundingBox();
        var objectB = e2.getBoundingBox();

        if(
            this.type != e2.type &&
            objectA[1].x >= objectB[0].x &&
            objectA[0].x <= objectB[1].x &&
            objectA[2].y >= objectB[0].y &&
            objectA[0].y <= objectB[2].y
        ) {
            return true; 
        }
        return false;
    }// boxIsTouching(e2)

    checkBoxColision() {
        for(let i = 0; i < entities.length; i++) {
            if(entities[i] != null && i != this.index) {
                var objectA = this.getBoundingBox();
                var objectB = entities[i].getBoundingBox();

                if(
                    objectA[1].x >= objectB[0].x &&
                    objectA[0].x <= objectB[1].x &&
                    objectA[2].y >= objectB[0].y &&
                    objectA[0].y <= objectB[2].y &&
                    this.type != entities[i].type
                ) {
                    return entities[i]; 
                }
            }
        }

        return null;
    }// checkBoxColision()

    isTouching(e2) {
        // get bounding total bounding box
        var xMin = this.getBoundingBox()[0].x;
        var yMin = this.getBoundingBox()[0].y;

        // this entity
        for(let i = 1; i < this.getBoundingBox().length; i++) {
            if(this.getBoundingBox()[i].x < xMin)
                xMin = this.getBoundingBox()[i].x;
            if(this.getBoundingBox()[i].y < yMin)
                yMin = this.getBoundingBox()[i].y;
        }

        // other entity
        for(let i = 1; i < e2.getBoundingBox().length; i++) {
            if(e2.getBoundingBox()[i].x < xMin)
                xMin = e2.getBoundingBox()[i].x;
            if(e2.getBoundingBox()[i].y < yMin)
                yMin = e2.getBoundingBox()[i].y;
        }

        var point1 = new PointValue(xMin, yMin);
        
        // do line colision
        var numIntersects = 0;
        for(let i = 0; i < this.getPoints().length; i++) {
            let tpoint = this.getPoints()[i];
            numIntersects = 0;
            for(let j = 0; j < e2.getPoints().length; j++) {
                var line1 = new Line(tpoint, new PointValue(xMin - 5, tpoint.y));
                var line2;
                if(j == e2.getPoints().length - 1) 
                    line2 = new Line(e2.getPoints()[j], e2.getPoints()[0]);
                else
                    line2 = new Line(e2.getPoints()[j], e2.getPoints()[j+1]);

                if(line1.intersects(line2)) {
                    numIntersects++;
                }
            }
            
            if(numIntersects != 0 && numIntersects % 2 != 0) return true;
        }

        return false;
    }// isTouching(e2)

    checkLineColision() {
        for(let i = 0; i < entities.length; i++) {
            if(entities[i] != null && i != this.index) {
                if(this.isTouching(entities[i])) return entities[i];
            }
        }

        return null;
    }// checkLineColision()
}// Entity

/*----- Classes End -----*/
/*----- Other Things -----*/

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

function createShip() {
    ship = new Entity(new Shape(shipPoints), "#fff", "ship");
    ship.x = canvas.width * 0.75;
    ship.y = canvas.height * 0.25;
    ship.dir = 135;
    ship.draw = function() {
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
}// createShip()

function shoot() {
    //console.log("shoot"); // for debugging
    var laser = new Entity(new Shape(laserPoints), "#f00", "laser");
    laser.updatePosition = function() {
        this.x += this.xSpeed;
        this.y += this.ySpeed;

        
        // off screen delete
        if(this.x < -100  ||  this.x > canvas.width + 100  ||  this.y < -100  || this.y > canvas.height + 100) {
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
    shotsFired++;
}// shoot()

function newAsteroid(x, y, dir, speed, size) {
    // randomly generate asteroid shape
    var asteroidPoints = [];
    var min = 60;
    var dif = 30;
    var rd = 30;
    
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

    for(let i = 0; i < 18; i++) {
        asteroidPoints[i] = new PolarPoint(Math.random() * dif + min, i * 20);
    }

    var asteroid = new Entity(new Shape(asteroidPoints), "#fff", "asteroid");
    asteroid.x = x;
    asteroid.y = y;
    asteroid.dir = dir;
    asteroid.size = size;
    asteroid.rollOverDist = rd;

    asteroid.forward(speed);
}// newAsteroid(x, y, dir, speed, size)

function spawnAsteroid() {
    
    var dir = Math.random() * 360;
    var x = Math.random() * canvas.width;
    var y = Math.random() * canvas.height;

    if(Math.floor(Math.random() * 2) == 1) {
        if(Math.floor(Math.random() * 2) == 1) 
            var x = 0 - 90;
        else
            var x = canvas.width + 90;
    }
    else {
        if(Math.floor(Math.random() * 2) == 1)
            var y = 0 - 90;
        else
            var y = canvas.height + 90;
    }

    newAsteroid(x, y, dir, asteroidSpeed, 3);
}// spawnAsteroid()

/*----- I/O -----*/

document.addEventListener("keydown", function(event) {
    switch(event.key) {
        case "ArrowUp":
        case "w":
            arrowUpPressed = true;
            break;
        case "ArrowDown":
        case "s":
            arrowDownPressed = true;
            break;
        case "ArrowLeft":
        case "a":
            arrowLeftPressed = true;
            break;
        case "ArrowRight":
        case "d":
            arrowRightPressed = true;
            break;
        case " ":
            shoot();
            break;
        case "p":
            pause();
            break;
        case "r":
            newGame();
            break;
    }
});// keydown

document.addEventListener("keyup", function(event) {
    switch(event.key) {
        case "ArrowUp":
        case "w":
            arrowUpPressed = false;
            break;
        case "ArrowDown":
        case "s":
            arrowDownPressed = false;
            break;
        case "ArrowLeft":
        case "a":
            arrowLeftPressed = false;
            break;
        case "ArrowRight":
        case "d":
            arrowRightPressed = false;
            break;
    }
});// keyup

/*----- I/O End -----*/
/*----- Update -----*/

function gameOverScreen() {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = (fontSize * 2) + "px " + fontFamily;
    ctx.fillText("GAME OVER", canvas.width/2, canvas.height/4);
    ctx.font = fontSize + "px " + fontFamily;
    ctx.fillText("press R to retry", canvas.width/2, canvas.height/4 + fontSize + 5);
}// gameOverScreen()

function gameEnd() {
    gameOver = true;    
}// gameEnd()

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
    if(entity.checkBoxColision() == null) return;

    switch(entity.type) {
        case "asteroid":
            asteroidColision(entity);
            break;

    }
}// entityColision(entity)

function asteroidColision(asteroid) {
    var colision = asteroid.checkBoxColision();

    if(asteroid == null || colision == null || colision.type == null) return;
    /*colision = asteroid.checkLineColision();
    if(asteroid == null || colision == null || colision.type == null) return;*/

    for(let i = 0; i < entities.length; i++) {
        if(entities[i] != null) {
            if(entities[i].type == "ship" && asteroid.isTouching(entities[i])) {
                console.log("game over");
                if(noClip == false) {
                    entities[i] = null;
                    gameEnd();
                }
                return;
            }
            else if(entities[i].type == "laser" && asteroid.boxIsTouching(entities[i])) {
                entities[i] = null;
                score += 100;
                
                if(asteroid.size == 2) {
                    newAsteroid(asteroid.x, asteroid.y, Math.random() * 360, asteroidSpeed, 1);
                    newAsteroid(asteroid.x, asteroid.y, Math.random() * 360, asteroidSpeed, 1);
                    newAsteroid(asteroid.x, asteroid.y, Math.random() * 360, asteroidSpeed, 1);
                }
                if(asteroid.size == 3) {
                    newAsteroid(asteroid.x, asteroid.y, Math.random() * 360, asteroidSpeed, 2);
                    newAsteroid(asteroid.x, asteroid.y, Math.random() * 360, asteroidSpeed, 2);
                }

                entities[asteroid.index] = null;
            }
        }
    }
}// asteroidColision(entity)

function updateColision() {
    for(let i = 0; i < entities.length; i++) {
        if(entities[i] != null && entities[i].type == "asteroid") {
            asteroidColision(entities[i]);
        }
    }
}// updateColision()

function updateFullScreen() {
    var h = window.innerHeight;
    var w = window.innerWidth;
    
    canvas.width = w;
    canvas.style.width = w + "px";
    gameDiv.style.width = w + "px";
    canvas.height = h;
    canvas.style.height = h + "px";
    gameDiv.style.height = h + "px";
}// updateFullScreen()

function updateSize() {
    var h = window.innerHeight;
    var w = window.innerWidth;

    
    if(viewType == "full") {
        updateFullScreen();
        ctx.lineWidth = Math.floor(canvas.height / 250);
    }
    else {
        ctx.lineWidth = 4;
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
    }
    gameDiv.style.margin = "auto";
}// updateSize()

function updateAsteroids() {
    var numAsteroids = 0;
    
    for(let e of entities) {
        if(e != null && e.type == "asteroid") {
            numAsteroids++;
        }
    }

    if(numAsteroids == 0) {
        currentDifficulty++;

        for(let i = 0; i < currentDifficulty; i++) {
            spawnAsteroid();
        }
    }
}// updateAsteroids()

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

function drawText() {
    fontSize = canvas.height / 20;
    ctx.font = fontSize + "px " + fontFamily;
    ctx.textBaseline = "hanging";
    ctx.textAlign = "left";
    ctx.fillStyle = textColor;
    ctx.fillText("Score: " + score, 10, 10);
    ctx.fillText("Wave: " + currentDifficulty, 10, fontSize + 20);
    ctx.fillText("Accuracy: " + Math.floor(score / shotsFired) + "%", 10, fontSize*2 + 30);
    
    if(gameOver) gameOverScreen();
    else if(paused) pausedScreen();
}// drawText()

function updateScreen() {
    updateSize();

    if(!trippyMode)
        ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateMovement();
    updateColision();

    updateAsteroids();
    
    drawEntities();
    drawText();
}// updateScreen()

/*----- Update End -----*/

function newGame() {
    updateInterval = clearInterval(updateInterval);
    pasued = false;
    gameOver = false;
    entities = [];
    score = 0;
    shotsFired = 0;

    arrowUpPressed = false;
    arrowDownPressed = false;
    arrowLeftPressed = false;
    arrowRightPressed = false;

    ship = null;

    createShip();
    currentDifficulty = 1;
    
    newAsteroid(canvas.width/2, canvas.height/2, 0, 0, 3);

    // start update interval
    updateInterval = setInterval(updateScreen, 1000/60);
}// startGame()

// inits
function init() {
    ctx.font = fontSize + "px " + fontFamily;
    newGame();
}// init()

init();

/*
todo:
 - fix problem where ship only moves horizontal/vertical while at top speed
*/