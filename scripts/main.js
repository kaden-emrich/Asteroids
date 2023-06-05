// Kaden Emrich

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
}// pause()

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

function shoot() {
    if(ship) ship.shoot();
}// shoot()

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

    new Asteroid(x, y, dir, asteroidSpeed, 3);
}// spawnAsteroid()

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

    new Asteroid(ship.x, ship.y, Math.random() * 360, asteroidSpeed, 0);
    new Asteroid(ship.x, ship.y, Math.random() * 360, asteroidSpeed, 0);
    new Asteroid(ship.x, ship.y, Math.random() * 360, asteroidSpeed, 0);

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

function updateColision() {
    for(let i = 0; i < entities.length; i++) {
        if(entities[i] != null && entities[i].type == "asteroid") {
            entities[i].updateColision();
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

    if(numAsteroids == 0 && !currentAlert) {
        currentDifficulty++;

        newAlert("NEW WAVE", 20, 120, () => {
            for(let i = 0; i < currentDifficulty; i++) {
                spawnAsteroid();
            }
        });
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

var alertInterval = 0;
var alertLength = 0;
var alertTimer = 0;
var alertCallback;

function newAlert(text, interval, length, callback) {
    currentAlert = text;
    alertInterval = interval;
    alertTimer = 0;
    alertLength = length;
    alertCallback = callback;
}// newAlert(text)

function updateAlert() {
    if(!currentAlert) return;

    if(alertTimer > alertLength) {
        alertCallback();
        currentAlert = null;
        return;
    }

    alertTimer ++;

    if(alertTimer % (2 * alertInterval) < alertInterval) return;
    

    ctx.textBaseline = "middle";
    ctx.textAlign = "center"
    ctx.font = (fontSize * 4) + "px " + fontFamily;

    ctx.fillText(currentAlert, (canvas.width / 2), (canvas.height / 2));
}// updateAlert()

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

    updateAlert();
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

    ship = new Ship();

    currentDifficulty = 1;
    
    new Asteroid(canvas.width/2, canvas.height/2, 0, 0, 3);

    ship.dir = Math.atan((canvas.height/2 - ship.y) / (canvas.width/2 - ship.x)) * 180/Math.PI + 180;


    // start update interval
    updateInterval = setInterval(updateScreen, 1000/60);
}// newGame()

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