// Kaden Emrich

var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");
var gameDiv = document.getElementById("gameDiv");   

var menuDiv = document.getElementById("menuDiv");

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

var currentAlert = null;

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
        name : "Kaden's theme",
        ship : "#a2d729",
        asteroid : "#bc4e4e",
        laser : "#3c91e6",
        title : "#1b998b",
        text : "#3c91e6",
        background : "#123456"
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