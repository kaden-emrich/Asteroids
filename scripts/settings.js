// Kaden Emrich

const RELEASE_VERSION = "v1.8.2";

var versionDisplay = document.getElementById('version-display');
versionDisplay.innerText = RELEASE_VERSION;

const startTime = Date.now();

function getElapsedTimems() {
    return Date.now() - startTime;
}

var frameCheckIntervalms = 500;
var droppedFrames = 0;

var tickrateCheckIntervalms = 500;

var canvas = document.getElementById("game");
var layer2Canvas = document.getElementById('layer2-game')   
var ctx = canvas.getContext("2d", { willReadFrequently: true });
var l2ctx = layer2Canvas.getContext("2d");
ctx.imageSmothingEnabled = false;
//l2ctx.imageSmothingEnabled = false;

var gameDiv = document.getElementById("gameDiv");

var menuDiv = document.getElementById("menuDiv");

var hud;

var spaceHeight = 1000;
var spaceWidth = 1000;
var spaceScale = 1;

var lineThickness = 5;

ctx.strokeStyle = "#fff";
ctx.fillStyle = "#fff";
ctx.lineWidth = 2 * spaceScale;

var tickInterval;
var frameInterval;

var ship;
var entities = [];

var score = 0;

var arrowUpPressed = false;
var arrowDownPressed = false;
var arrowLeftPressed = false;
var arrowRightPressed = false;
var shootPressed = false;

var relMousePos;

var gameStatus = "menu";
var currentMenu;
var menuSize = 0;

var currentController;

var currentDifficulty = 1;
var shotsFired = 0;
var shotsHit = 0;

var currentAlert = null;

var paused = false;
var gameOver = false;

var viewTypes = ["square", "full"];
var isFullscreen = false;

let doScreenShake = true;
let screenShakeIntensity = 0;
let screenShakeReturn = 0.1;
let screenShakeIntensityOffset = 0.5;
function setScreenShake(intensity, returnSpeed) {
    if(screenShakeIntensity > 0) {
        screenShakeReturn = returnSpeed < screenShakeReturn ? returnSpeed : screenShakeReturn;
    }
    else {
        screenShakeReturn = returnSpeed;
    }

    if(!doScreenShake) {
        screenShakeIntensity = 0;
        screenShakeReturn = 0;
        return;
    }
    screenShakeIntensity = intensity > screenShakeIntensity ? intensity : screenShakeIntensity;
}

// sounds
const laserSound = new sound("sound-effects/8-bit-laser.wav");
const explosionSound = new sound("sound-effects/8-bit-explosion.wav");
const deathSound = new sound("sound-effects/extreme-explosion.wav");
const newGameSound = new sound("sound-effects/game-start.mp3");
const menuSelectSound = new sound("sound-effects/light-impact.mp3");

/*----- Game Settings -----*/

var tickSpeed = 60;

var viewType = 1;
var pointSize = 10;
var trippyMode = false;
var showVelocity = false;
var showMousePos = false;
var showStats = true;
var showExtraStats = false;
var showNerdyStats = false;
var showTime = true;
var laserSight = false;

var doShrapnel = true;
let showTextBlips = true;
let textBlipSpeed = 100;

let scoreIncrement = 100;

let autoFire = false;
let shootCooldownMS = 300;
let shootSpread = 0;
let shootAmount = 1;
let shootPenetration = 0;


// var defaultShrapnelSpeed = 5;
// var defaultShrapnelLife = 10;
// var asteroidShrapnelSpeed = 5;
// var asteroidShrapnelLife = 10;
// var asteroidShrapnelAmount = 3;

var defaultShrapnelSpeed = 300;
var defaultShrapnelLife = 10;
var asteroidShrapnelSpeed = 300;
var asteroidShrapnelLife = 1000/6;
var asteroidShrapnelAmount = 3;

var showStars = true;

var maxAsteroidTorque = 30;

var doPostProcessing = true;
var doChromaticAberration = false;

var numStars = 50;

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

// var shipSpeed = 20;
// var laserSpeed = 20;
// var asteroidSpeed = 2;
// var velocityLimit = 30;
// var turnSpeed = 5;
// var shipAcceleration = 0.2;

var shipSpeed = 1200;
var laserSpeed = 1200;
var asteroidSpeed = 120;
var velocityLimit = 1800;
var turnSpeed = 300;
var shipAcceleration = 720;

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
        background : "#030303"
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
