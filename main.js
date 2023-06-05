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

var relMousePos;

var gameStatus = "menu";
var currentMenu;
var menuSize = 0;

var currentController;

var currentDifficulty = 1;
var shotsFired = 0;

var paused = false;
var gameOver = false;

var viewTypes = ["square", "full"];
var isFullscreen = false;

/*----- Game Settings -----*/

var viewType = 1;
var pointSize = 10;
var turnSpeed = 5;
var acceleration = 0.2;
var trippyMode = false;
var showVelocity = false;
var showMousePos = false;
var showStats = true;
var laserSight = false;
var showBoundingBoxes = false;
var boundingBoxColor = "#0ff";
var fontFamily = "Munro";
var fontSize = canvas.height * 1 / 20;
var textColor = "#fff";
var noClip = false;

var shipSpeed = 10;
var laserSpeed = 20;
var asteroidSpeed = 2;
var velocityLimit = 30;

var currentPalette;
var shipSkin;

/*----- Game Settings End -----*/

const palettes = [
    {
        name : "default",
        ship : "#fff",
        asteroid : "#999",
        laser : "#f00",
        title : "#fff",
        text : "#fff",
        background : "#000"
    },

    {
        name : "classic",
        ship : "#fff",
        asteroid : "#fff",
        laser : "#fff",
        title : "#fff",
        text : "#fff",
        background : "#000"
    },

    {
        name : "blueberry",
        ship : "#09f",
        asteroid : "#05f",
        laser : "#0f9",
        title : "#fff",
        text : "#0ff",
        background : "#024"
    },

    {
        name : "wooden",
        ship : "#f90",
        asteroid : "#f50",
        laser : "#f55",
        title : "#f33",
        text : "#ff0",
        background : "#420"
    },

    {
        name : "hackerman",
        ship : "#0f0",
        asteroid : "#f00",
        laser : "#fff",
        title : "#0f0",
        text : "#fff",
        background : "#000"
    },
    
    {
        name : "inverted",
        ship : "#000",
        asteroid : "#000",
        laser : "#0ff",
        title : "#000",
        text : "#000",
        background : "#fff"
    }
]
currentPalette = 0;

function pause() {
    if(paused == true) {
        currentMenu = undefined;
        currentController = new KeyController(gameControlScheme);
        paused = false;
    }
    else {
        paused = true;
        currentController = new KeyController(menuControlScheme);
        currentMenu = Menus.paused();
    }
}

/* --------------------------------- Classes -------------------------------- */

class PointValue {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }// constructor(x, y)

    getPolar() {
        var r = Math.sqrt((this.x*this.x) + (this.y*this.y));
        var dir;
        if(this.x == 0) {
            if(this.y > 0) {
                dir = 90;
            }
            else {
                dir = -90;
            }
        }
        else if(this.x > 0)
            dir = Math.atan(this.y / this.x) * (180 / Math.PI);
        else {
            dir = Math.atan(this.y / this.x) * (180 / Math.PI) + 180;
        }

        return new PolarPoint(r, dir);
    }// getPolar()
}// class PointValue

relMousePos = new PointValue(0, 0)

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
        if(mag < 0) dir += Math.PI;
        if(dir > Math.PI*2 || dir < 0-(Math.PI*2)) dir = dir % (Math.PI * 2)
        if(dir < 0) dir = (Math.PI*2) + dir;

        this.dir = dir;
        this.mag = Math.abs(mag);
    }// constructor

    get x() {
        return this.mag * Math.cos(this.dir);
    }// get x

    get y() {
        return this.mag * Math.sin(this.dir);
    }// get y

    add(otherVector) {
        let xTotal = this.x + otherVector.x;
        let yTotal = this.y + otherVector.y;

        let magTotal = Math.sqrt(Math.pow(otherVector.x + this.x, 2) + Math.pow(otherVector.y + this.y, 2));

        let dirTotal;

        if(xTotal == 0) {
            if(yTotal > 0) dirTotal = Math.PI/2;
            else if(yTotal < 0) dirTotal = 0-Math.PI/2;
            else dirTotal = 0;
        }
        else if(xTotal < 0) dirTotal = Math.atan(yTotal / xTotal) + Math.PI;
        else dirTotal = Math.atan(yTotal / xTotal);

        return new Vector(dirTotal, magTotal);
    }// add(otherVector)

    static fromRect(x, y) {
        let d;
        let m = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));

        if(x < 0) d = Math.atan(y / x) + Math.PI;
        else d = Math.atan(y / x);

        return new Vector(d, m);
    }// fromRect(x, y)
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
    constructor(shape, color, type, maxVelocity) {
        if(maxVelocity > velocityLimit) maxVelocity = velocityLimit;
        this.maxVelocity = maxVelocity;

        this.x = canvas.width/2;
        this.y = canvas.height/2;
        this.dir = 0;
        this.speedVector = new Vector(this.dir, 0);
        this.color = color;
        this.type = type;
        this.rollOverDist = 30;

        this.id = entities.length;
        entities[this.id] = this;

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
        return this.speedVector.mag;
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
        this.addSpeedVector(new Vector(this.dir*Math.PI/180, speed));
        if(this.speedVector.mag > this.maxVelocity) {
            this.speedVector.mag = this.maxVelocity;
        }
    }// forward(speed)

    updatePosition() {
        if(this.speedVector.mag > this.maxVelocity) {
            this.speedVector.mag = this.maxVelocity;
        }
        else if(this.speedVector.mag < 0-this.maxVelocity) {
            this.speedVector.mag = 0 - this.maxVelocity;
        }

        this.x += this.speedVector.x;
        this.y += this.speedVector.y;

        
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
            ctx.lineTo(this.x + this.speedVector.x*10, this.y);
            ctx.stroke();
    
            ctx.strokeStyle = "#f00";
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x, this.y + this.speedVector.y*20);
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
            if(entities[i] != null && i != this.id) {
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
        // this entity
        for(let i = 1; i < this.getBoundingBox().length; i++) {
            if(this.getBoundingBox()[i].x < xMin)
                xMin = this.getBoundingBox()[i].x;
        }

        // other entity
        for(let i = 1; i < e2.getBoundingBox().length; i++) {
            if(e2.getBoundingBox()[i].x < xMin)
                xMin = e2.getBoundingBox()[i].x;
        }
        
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
            if(entities[i] != null && i != this.id) {
                if(this.isTouching(entities[i])) return entities[i];
            }
        }

        return null;
    }// checkLineColision()
}// Entity

class Menu {
    constructor(title, options, actions, type) {
        if(type) this.type = type;
        else this.type = "main";

        this.title = title;
        this.options = options;
        this.actions = actions;
        this.selection = 0;

        this.titleSize = 4;
        this.optionsSize = 2.5;
    }// constructor
    
    next() {
        if(this.selection >= this.options.length - 1) this.selection = 0;
        else this.selection++;
    }// next()

    last() {
        if(this.selection <= 0) this.selection = this.options.length - 1;
        else this.selection--;

    }// last()

    select() {
        if(this.actions[this.selection]) {
            this.actions[this.selection]();
        }
    }// select()

    drawMain() {
        // shade background
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.lineWidth = 1;
        // Draw title
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";

        ctx.font = (fontSize * this.titleSize) + "px " + fontFamily;
        ctx.fillStyle = palettes[currentPalette].title;

        ctx.fillText(this.title, canvas.width / 2, canvas.height / 4, canvas.width);

        ctx.font = (fontSize * this.optionsSize) + "px " + fontFamily;
        // draw buttons
        for(let o in this.options) {
            if(this.selection == parseInt(o)) {
                ctx.fillStyle = palettes[currentPalette].title;
                ctx.fillText(this.options[o], canvas.width / 2, canvas.height / 2 + o * (fontSize * this.optionsSize)); 
            } else {
                /*ctx.fillStyle = palettes[currentPalette].background;
                ctx.fillText(this.options[o], canvas.width / 2, canvas.height / 2 + o * (fontSize * this.optionsSize)); */
                ctx.strokeStyle = palettes[currentPalette].text;
                ctx.strokeText(this.options[o], canvas.width / 2, canvas.height / 2 + o * (fontSize * this.optionsSize));
            }
        }

        ctx.lineWidth = 4;
    }// drawMain()

    drawOptions() {
        // shade background
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.lineWidth = 1;
        // Draw title
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";

        ctx.font = (fontSize * this.titleSize) + "px " + fontFamily;
        ctx.fillStyle = palettes[currentPalette].title;

        ctx.fillText(this.title, canvas.width / 2, canvas.height / 8, canvas.width);

        ctx.font = (fontSize * this.optionsSize) + "px " + fontFamily;
        // draw buttons
        for(let o in this.options) {
            if(this.selection == parseInt(o)) {
                ctx.fillStyle = palettes[currentPalette].title;
                ctx.fillText(this.options[o], canvas.width / 2, canvas.height * 3 / 8 + o * (fontSize * this.optionsSize)); 
            } else {
                /*ctx.fillStyle = palettes[currentPalette].background;
                ctx.fillText(this.options[o], canvas.width / 2, canvas.height * 3 / 8 + o * (fontSize * this.optionsSize)); */
                ctx.strokeStyle = palettes[currentPalette].text;
                ctx.strokeText(this.options[o], canvas.width / 2, canvas.height * 3 / 8 + o * (fontSize * this.optionsSize));
            }
        }

        ctx.lineWidth = 4;
    }// drawOptions()

    draw() {
        switch(this.type) {
            case "options":
                this.drawOptions();
                break;

            case "main":
            default:
                this.drawMain();
                break;
        }
    }// draw();
}// class Menu

/* ------------------------------- Classes End ------------------------------ */
/*----- Other Things -----*/

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

var laserPoints = [
    new PointValue(0, 0).getPolar(),
    new PointValue(-30, 0).getPolar(),
    new PointValue(-30, -1).getPolar(),
    new PointValue(0, -1).getPolar()
];

/*----- Other Things End -----*/

function createShip() {
    ship = new Entity(new Shape(shipSkin), palettes[currentPalette].ship, "ship", shipSpeed);
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
    }// ship.draw()
}// createShip()

function shoot() {
    //console.log("shoot"); // for debugging
    var laser = new Entity(new Shape(laserPoints), palettes[currentPalette].laser, "laser", laserSpeed);

    laser.updatePosition = function() {
        this.x += this.speedVector.x;
        this.y += this.speedVector.y;

        
        // off screen delete
        if(this.x < -100  ||  this.x > canvas.width + 100  ||  this.y < -100  || this.y > canvas.height + 100) {
            entities[laser.id] = null;
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

    laser.speedVector = new Vector(ship.dir * Math.PI/180, laserSpeed);
    //console.log("laser created"); // for debugging

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
    else {
        min = 10;
        dif = 5;
        rd = 15;
    }

    for(let i = 0; i < 18; i++) {
        asteroidPoints[i] = new PolarPoint(Math.random() * dif + min, i * 20);
    }

    var asteroid = new Entity(new Shape(asteroidPoints), palettes[currentPalette].asteroid, "asteroid", asteroidSpeed);
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

/*
document.addEventListener("keydown", function(event) {
    switch(event.key) {
        case "ArrowUp":
        case "w":
            if(!currentMenu)
                arrowUpPressed = true;
            else
                currentMenu.last();
            break;

        case "ArrowDown":
        case "s":
            if(!currentMenu)
                arrowDownPressed = true;
            else
                currentMenu.next();
            break;

        case "ArrowLeft":
        case "a":
            arrowLeftPressed = true;
            break;

        case "ArrowRight":
        case "d":
            arrowRightPressed = true;
            break;

        case "Enter":
        case " ":
            if(!currentMenu)
                shoot();
            else
                currentMenu.select();
            break;
        
        case "Escape":
        case "p":
            if(gameStatus == "game")
                pause();

            if(transitionInterval) {
                transitionInterval = clearInterval(transitionInterval);
                trippyMode = false;
                newGame();
            }
            if(!updateInterval) updateInterval = setInterval(updateScreen, 1000/60);
            break;

        case "r":
            newGame();
            break;

        case "f":
            openFullscreen();
            break;
        
        default:
            //console.log("Unbound key: \'" + event.key + "\'"); // for debugging
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
*/

canvas.addEventListener("mousemove", (event) => {
    relMousePos.x = (event.clientX - event.target.offsetLeft) * (canvas.width / parseInt(canvas.style.width));
    relMousePos.y = (event.clientY - event.target.offsetTop) * (canvas.height / parseInt(canvas.style.height));
});

/*----- I/O End -----*/
/*----- Update -----*/

function gameEnd() {
    if(ship) {
        entities[ship.id] = null;
        ship = null;
    }

    arrowUpPressed = false;
    arrowDownPressed = false;
    arrowLeftPressed = false;
    arrowRightPressed = false;

    gameOver = true;
    currentMenu = Menus.over();
    currentController = new KeyController(menuControlScheme);
    gameStatus = "menu";
}// gameEnd()

function killPlayer() {
    if(!ship) {
        gameEnd();
        return;
    }

    newAsteroid(ship.x, ship.y, Math.random() * 360, asteroidSpeed, 0);
    newAsteroid(ship.x, ship.y, Math.random() * 360, asteroidSpeed, 0);
    newAsteroid(ship.x, ship.y, Math.random() * 360, asteroidSpeed, 0);

    gameEnd();
}// killPlayer()

function updateMovement() {
    if(ship) {
        if(arrowUpPressed) {
            ship.forward(acceleration);
        }
        if(arrowDownPressed) {
            ship.forward(0-acceleration);
        }
        if(arrowLeftPressed) {
            ship.turnLeft();
        }
        if(arrowRightPressed) {
            ship.turnRight()
        }
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
                if(noClip == false) {
                    killPlayer();
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

                entities[asteroid.id] = null;
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
    var h = 1000;
    var w = window.innerWidth * h / window.innerHeight;

    // w/h = iw/ih
    //w = iw * h / ih
    
    canvas.width = w;
    canvas.style.width = window.innerWidth + "px";
    gameDiv.style.width = window.innerWidth + "px";
    canvas.height = h;
    canvas.style.height = window.innerHeight + "px";
    gameDiv.style.height = window.innerHeight + "px";
}// updateFullScreen()

function updateSize() {
    var h = window.innerHeight;
    var w = window.innerWidth;

    
    if(viewType == 1) {
        updateFullScreen();
        ctx.lineWidth = Math.floor(canvas.height / 250);
    }
    else {
        canvas.width = 1000;
        canvas.style.width = "1000 px";
        gameDiv.style.width = "1000 px";
        canvas.height = 1000;
        canvas.style.height = "1000 px";
        gameDiv.style.height = "1000 px";

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

function drawStats() {
    fontSize = canvas.height / 20;
    ctx.font = fontSize + "px " + fontFamily;
    ctx.textBaseline = "hanging";
    ctx.textAlign = "left";

    ctx.fillStyle = palettes[currentPalette].text;
    ctx.fillText("Score: " + score, 10, 10);

    ctx.fillStyle = palettes[currentPalette].text;
    ctx.fillText("Wave: " + currentDifficulty, 10, fontSize + 20);

    ctx.fillStyle = palettes[currentPalette].text;
    ctx.fillText("Accuracy: " + Math.floor(score / shotsFired) + "%", 10, fontSize*2 + 30);
}// drawStats()

function updateScreen() {
    if(!trippyMode) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        updateSize();
        fontSize = canvas.height * 1 / 20;
    }


    if(!paused) {
        updateMovement();
        updateColision();

        updateAsteroids();
    }
    
    drawEntities();

    if(currentMenu) currentMenu.draw();
    else if(showStats) drawStats();
}// updateScreen()

/*----- Update End -----*/

function toggleViewType() {
    if(viewType + 1 >= viewTypes.length) {
        viewType = 0;
        return;
    }
    viewType++;
}// toggleViewMode()

function equipPalette(p) {
    if(p >= palettes.length || p < 0) return;
    
    currentPalette = p;

    for(let e of entities) {
        if(e && e.type) switch(e.type) {
            case "ship":
                e.color = palettes[currentPalette].ship;
                break;

            case "asteroid":
                e.color = palettes[currentPalette].asteroid;
                break;
            
            case "laser":
                e.color = palettes[currentPalette].laser;
                break;
        }
    }

    canvas.style.backgroundColor = palettes[currentPalette].background;
}// equipPalette(p)

function cyclePalette() {
    if(currentPalette + 1 >= palettes.length) {
        currentPalette = 0;
    }
    else currentPalette++;

    equipPalette(currentPalette);
}// cyclePalette()

function settingsMenu() {
    currentMenu = Menus.settings();
}// openSettings()

function openFullscreen() {
    isFullscreen = true;
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
    } else if (document.documentElement.webkitRequestFullscreen) { /* Safari */
        document.documentElement.webkitRequestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) { /* IE11 */
        document.documentElement.msRequestFullscreen();
    }
}// openFullscreen()
  
/* Close fullscreen */
function closeFullscreen() {
    isFullscreen = false;
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { /* Safari */
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE11 */
        document.msExitFullscreen();
    }
}// closeFullscreen()

function toggleFullscreen() {
    if(isFullscreen)
        closeFullscreen();
    else
        openFullscreen();
}// toggleFullscreen()

function newGame() {
    currentController = new KeyController(gameControlScheme);
    updateInterval = clearInterval(updateInterval);
    gameStatus = "game";
    currentMenu = undefined;
    paused = false;
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

    ship.dir = Math.atan((canvas.height/2 - ship.y) / (canvas.width/2 - ship.x)) * 180/Math.PI + 180;


    // start update interval
    updateInterval = setInterval(updateScreen, 1000/60);
}// newGame()

/*
function gameTransition() {
    gameStatus = "game";
    currentMenu = undefined;
    paused = false;
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

    ship.dir = Math.atan((canvas.height/2 - ship.y) / (canvas.width/2 - ship.x)) * 180/Math.PI + 180;
    updateScreen();
}// gameTransition()

var transitionInterval;

function transitionAnimation(callback) {
    updateInterval = clearInterval(updateInterval);
    currentMenu = undefined;

    let i = 0;
    let end = 150;
    let stars = [];
    let calledBack = false;

    transitionInterval = setInterval(() => {
        for(let j = 0; j < 100; j++) {
            let next = new Entity(new Shape([
                new PointValue(-2, -2).getPolar(),
                new PointValue(2, -2).getPolar(),
                new PointValue(2, 2).getPolar(),
                new PointValue(-2, 2).getPolar()
            ]), palettes[currentPalette].text, "star", asteroidSpeed);

            next.x = Math.random() * canvas.width;
            next.y = Math.random() * canvas.height;

            entities[next.id] = null;

            next.speedVector = Vector.fromRect(next.x - canvas.width/2, next.y - canvas.height/2);
            
            next.updatePosition = function() {
                if(this.speedVector.mag > this.maxVelocity) {
                    this.speedVector.mag = this.maxVelocity;
                }
                else if(this.speedVector.mag < 0-this.maxVelocity) {
                    this.speedVector.mag = 0 - this.maxVelocity;
                }
        
                this.x += this.speedVector.x;
                this.y += this.speedVector.y;

                if(
                    this.x < 0-this.rollOverDist || 
                    this.x > canvas.width + this.rollOverDist || 
                    this.y < 0-this.rollOverDist || 
                    this.y > canvas.height + this.rollOverDist) {
                }
            }

            stars[stars.length] = next;
        }

        for(let e of entities) if(e){
            e.draw();
            e.updatePosition();
        }

        for(let s of stars) if(s){
            for(let l = 0; l < 2; l++) {
                s.draw();
                s.updatePosition();
            }
        }

        if(i > end / 4) {
            ctx.fillStyle = "rgba(0, 0, 0, " + (i - end/4)/(3 * end/4) + ")";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            if(callback && !calledBack) {
                calledBack = true;
                callback();
            }
        }

        trippyMode = true;
        updateScreen();

        if(i >= end) { 
            transitionInterval = clearInterval(transitionInterval);
            updateInterval = setInterval(updateScreen, 1000/60);
            trippyMode = false;

            //if(callback) callback();
        }
        i++;
    }, 1);
}// transitionAnimation()
*/

/* ------------------------------- Menu start ------------------------------- */

// menus
var Menus = {
    main : function() {
        return new Menu("ASTEROIDS", ["start", "settings", "credit"], [newGame, settingsMenu, () => {currentMenu = Menus.credit();}], "main");
    },
    over : function() {
        return new Menu("GAME OVER", ["retry", "menu"], [newGame, mainMenu], "main")
    },
    paused : function() {
        return new Menu("PAUSED", ["continue", "retry", "settings", "menu"], [
            () => {
                gameStatus = "game"; 
                currentMenu = undefined; 
                currentController = new KeyController(gameControlScheme);
                paused = false;
            }, 
            newGame, 
            () => {
                currentMenu = Menus.settings(Menus.paused);
            }, 
            () => {
                killPlayer(); 
                mainMenu();
            }
        ], 
        "options");
    },
    settings : function(returnMenu) {
        if(!returnMenu) returnMenu = Menus.main;

        function returnFunc() {
            currentMenu = returnMenu();
        }// returnFunc

        let temp = new Menu("Settings", ["toggle view mode (" + viewTypes[viewType] + ")", "palette: " + palettes[currentPalette].name, "back"], [
            () => {
                toggleViewType();
                temp.options[0] = "toggle view mode (" + viewTypes[viewType] + ")";
            }, 
            () => {
                cyclePalette();
                temp.options[1] = "palette: " + palettes[currentPalette].name;
            }, returnFunc], "options");

        temp.optionsSize = 1;
        
        return temp;
    },

    credit : function() {
        return new Menu("KADEN EMRICH", ["menu"], [mainMenu], "main");
    }
};

// logic
function mainMenu() {
    paused = false;
    gameEnd();
    gameStatus = "menu";
    currentMenu = Menus.main();
}// mainMenu()

/* -------------------------------- Menu end -------------------------------- */

/* ---------------------------- controllers start --------------------------- */

var menuControlScheme = [
    new KeyHandler(["ArrowUp", "w", "W"], () => {currentMenu.last();}),
    new KeyHandler(["ArrowDown", "s", "S"], () => {currentMenu.next();}),
    new KeyHandler(["Enter", " "], () => {currentMenu.select();}),
    new KeyHandler(["Ecape", "p"], () => {if(gameStatus == "game") pause();})
];

var gameControlScheme = [
    new KeyHandler(["ArrowUp", "w", "W"], () => {arrowUpPressed = true;}, () => {arrowUpPressed = false;}),
    new KeyHandler(["ArrowDown", "s", "S"], () => {arrowDownPressed = true;}, () => {arrowDownPressed = false;}),
    new KeyHandler(["ArrowLeft", "a", "A"], () => {arrowLeftPressed = true;}, () => {arrowLeftPressed = false;}),
    new KeyHandler(["ArrowRight", "d", "D"], () => {arrowRightPressed = true;}, () => {arrowRightPressed = false;}),
    new KeyHandler(["Enter", " "], shoot),
    new KeyHandler(["Escape", "p", "P"], pause),
    new KeyHandler(["r", "R"], newGame),
    new KeyHandler(["f", "F"], openFullscreen)
];

/* ----------------------------- controllers end ---------------------------- */

// inits
function init() {
    shipSkin = classicShipPoints;
    for(let i = 0; i < 3; i++) {
        spawnAsteroid();
    }

    updateInterval = setInterval(updateScreen, 50/3);
    mainMenu();
    currentController = new KeyController(menuControlScheme);
}// init()

init();

/*
todo:
    - add a how to play
    - add control schemes
    - make ship, asteroid, and laser classes as children of entity
*/