// Kaden Emrich

const RELEASE_VERSION = "v1.5.2";

const startTime = Date.now();

function getElapsedTimems() {
    return Date.now() - startTime;
}

var frameCheckIntervalms = 500;
var droppedFrames = 0;

var tickrateCheckIntervalms = 500;

var canvas = document.getElementById("game");
var layer2Canvas = document.getElementById('layer2-game')   
var ctx = canvas.getContext("2d");
var l2ctx = layer2Canvas.getContext("2d");
ctx.imageSmothingEnabled = false;
//l2ctx.imageSmothingEnabled = false;

var gameDiv = document.getElementById("gameDiv");

var menuDiv = document.getElementById("menuDiv");

ctx.strokeStyle = "#fff";
ctx.fillStyle = "#fff";
ctx.lineWidth = 4;

var tickInterval;
var frameInterval;

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

var currentAlert = null;

var paused = false;
var gameOver = false;

var viewTypes = ["square", "full"];
var isFullscreen = false;

/*----- Game Settings -----*/

var tickSpeed = 60;

var viewType = 1;
var pointSize = 10;
var trippyMode = false;
var showVelocity = false;
var showMousePos = false;
var showStats = true;
var showExtraStats = false;
var showNerdyStats = true;
var showTime = true;
var laserSight = false;

var showStars = false;

var maxAsteroidTorque = 0.5;

var imgBloom = true;

var shootCooldownMS = 300;

var numStars = 10;

var showBoundingBoxes = false;
var boundingBoxColor = "#0ff";

var showStandardDeviation = false;
var standardDeviationColor = "#0f0";

var showMaxDeviation = false;
var maxDeviationColor = "#ff0";

var fontFamily = "Munro";
var fontSize = canvas.height * 1 / 20;
var textColor = "#fff";
var noClip = false;

var hideCursorOnKeyboardInput = true;

var shipSpeed = 20;
var laserSpeed = 20;
var asteroidSpeed = 2;
var velocityLimit = 30;
var turnSpeed = 5;
var shipAcceleration = 0.2;

var currentPalette;
var shipSkin;

/*----- Game Settings End -----*/

const palettes = [
    {
        name : "default",
        ship : "#0f0",
        asteroid : "#f00",
        laser : "#fff",
        title : "#0f0",
        text : "#fff",
        background : "#000"
    },

    {
        name : "classic",
        ship : "#fff",
        asteroid : "#999",
        laser : "#f00",
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
        name : "untitled theme",
        ship : "#f90",
        asteroid : "#f50",
        laser : "#f55",
        title : "#f33",
        text : "#ff0",
        background : "#420"
    },

    {
        name : "blue",
        ship : "#a2d729",
        asteroid : "#bc4e4e",
        laser : "#3c91e6",
        title : "#1b998b",
        text : "#3c91e6",
        background : "#123456"
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
