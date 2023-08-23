// Kaden Emrich

var gameTime = 0;
var gameTimeInterval;
var spawnTimeCounter = 0;
var spawnTime = 100;
var minAsteroids = 1;

var showStats = true;
var showExtraStats = false;

var fInterval; // For the game controll Scheme
var bInterval;
var lInterval;
var rInterval;

function startGameTime() {
    gameTimeInterval = setInterval(() => {
        gameTime += 0.1;

        // if(spawnTimeCounter >= spawnTime) {
        //     spawnTimeCounter = 0;
        //     spawnAsteroid();
        // }
        // else {
        //     spawnTimeCounter++;
        // }
    }, 100);
}// startGameTime()

function pauseGameTime() {
    clearInterval(gameTimeInterval);
    gameTimeInterval = undefined;
}// pauseGameTime()

function resetGameTime() {
    spawnTimeCounter = 0;
    gameTime = 0;
    clearInterval(gameTimeInterval);
    gameTimeInterval = undefined;
    //console.log(gameTimeInterval);
}// resetGameTime()

function resetControlIntervals() {
    clearInterval(fInterval);
    clearInterval(bInterval);
    clearInterval(lInterval);
    clearInterval(rInterval);

    fInterval = undefined;
    bInterval = undefined;
    lInterval = undefined;
    rInterval = undefined;
}// resetControlIntervals()

function pause() {
    if(paused == true) {
        currentMenu.hide();
        resetControlIntervals();
        currentController = new KeyController(gameControlScheme);
        paused = false;
        currentMenu = undefined;
        startGameTime();
    }
    else {
        paused = true;
        pauseGameTime();
        resetControlIntervals();
        currentController = new KeyController(menuControlScheme);
        currentMenu = Menus.paused();
        currentMenu.draw();
    }
}// pause()

function shoot() {
    //console.log("shoot");
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
    var finalGameTime = gameTime;
    resetGameTime();
    resetControlIntervals
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
    currentMenu.draw();
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

function updateCharacterMovement() {
    if(!ship) return;

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
        ship.turnRight();
    }
}// updateCharacterMovement()

function updateMovement() {
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

    if(currentMenu) {
        menuDiv.style.width = window.innerWidth + "px";
        menuDiv.style.height = window.innerHeight + "px";
    }
    
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

function getNumAsteroids() {
    var numAsteroids = 0;
    
    for(let e of entities) {
        if(e != null && e.type == "asteroid") {
            numAsteroids++;
        }
    }

    return numAsteroids;
}// getNumAsteroids()

function updateAsteroids() {

    // if(numAsteroids == 0 && !currentAlert) {
    //     currentDifficulty++;

    //     newAlert("NEW WAVE", 20, 120, () => {
    //         for(let i = 0; i < currentDifficulty; i++) {
    //             spawnAsteroid();
    //         }
    //     });
    // }

    if(getNumAsteroids() < minAsteroids) {
        while(getNumAsteroids() <= minAsteroids) {
            spawnAsteroid();
        }
        minAsteroids++;
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
    if(!showStats) return;

    fontSize = canvas.height / 20;
    ctx.font = fontSize + "px " + fontFamily;
    ctx.textBaseline = "hanging";
    ctx.textAlign = "left";

    ctx.fillStyle = palettes[currentPalette].text;
    ctx.fillText("Score: " + score, 10, 10);

    // ctx.fillStyle = palettes[currentPalette].text;
    // ctx.fillText("Wave: " + currentDifficulty, 10, fontSize + 20);

    ctx.fillStyle = palettes[currentPalette].text;
    ctx.fillText("Accuracy: " + Math.floor(score / shotsFired) + "%", 10, fontSize + 20);

    if(showExtraStats) {
        ctx.fillStyle = palettes[currentPalette].text;
        ctx.fillText("# Asteroids: " + getNumAsteroids(), 10, fontSize*2 + 30);

        ctx.fillStyle = palettes[currentPalette].text;
        ctx.fillText("Time " + gameTime.toFixed(1), 10, fontSize*3 + 40);
    }
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
    }

    fontSize = canvas.height * 1 / 20;
    updateSize();


    if(!paused) {
        //updateCharacterMovement();
        updateMovement();
        updateColision();

        updateAsteroids();
    }
    
    drawEntities();

    //if(currentMenu) currentMenu.draw();
    if(!currentMenu) drawStats();

    
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

function equipShipSkin(s) {
    if(!ship) return;
    if(s >= shipSkins.length || s < 0) return;

    shipSkin = s;

    ship.shape = shipSkins[s].shape;
}// equipShipSkin(s)

function cycleShipSkin() {
    if(shipSkin + 1 >= shipSkins.length) {
        shipSkin = 0;
    }
    else shipSkin++;

    equipShipSkin(shipSkin);
}// cycleShipSkin()

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
    currentMenu.draw();
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
    resetGameTime();
    minAsteroids = 1;
    resetControlIntervals();

    currentController = new KeyController(gameControlScheme);
    updateInterval = clearInterval(updateInterval);
    gameStatus = "game";
    currentMenu.hide();
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
    startGameTime();
}// newGame()

/* ------------------------------- Menu start ------------------------------- */

// menus
var Menus = {
    main : function() {
        return new Menu("asteroids", ["start", "settings", "credit"], [newGame, settingsMenu, () => {currentMenu = Menus.credit(); currentMenu.draw();}], "main");
    },
    over : function() {
        return new Menu("game over", ["retry", "menu"], [newGame, mainMenu], "gameOver")
    },
    paused : function() {
        return new Menu("paused", ["continue", "retry", "settings", "menu"], [
            () => {
                pause();
            }, 
            newGame, 
            () => {
                currentMenu = Menus.settings(Menus.paused);
                currentMenu.draw();
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
            currentMenu.draw();
        }// returnFunc

        let temp = new Menu("settings", ["palette: " + palettes[currentPalette].name, "ship skin: " + shipSkins[shipSkin].name, "more", "back"], [
            () => {
                cyclePalette();
                temp.options[0] = "palette: " + palettes[currentPalette].name;
                currentMenu.draw();
            }, 
            () => {
                cycleShipSkin();
                temp.options[1] = "ship skin: " + shipSkins[shipSkin].name;
                currentMenu.draw();
            },
            () => {
                currentMenu = Menus.settings1(returnMenu);
                currentMenu.draw();
            }, returnFunc], "options");

        temp.optionsSize = 1;
        
        return temp;
    },

    settings1 : function(returnMenu) {

        if(!returnMenu) returnMenu = Menus.main;

        function returnFunc() {
            currentMenu = Menus.settings(returnMenu);
            currentMenu.draw();
        }// returnFunc()

        let temp = new Menu("more settings", ["show stats: " + showStats, "extra stats: " + showExtraStats, "back"], [
            () => {
                if(showStats) {
                    showStats = false;
                }
                else {
                    showStats = true;
                }

                temp.options[0] = "show stats: " + showStats;
                currentMenu.draw();
            },
            () => {
                if(showExtraStats) {
                    showExtraStats = false;
                }
                else {
                    showExtraStats = true;
                }

                temp.options[1] = "show extra stats " + showExtraStats;
                currentMenu.draw();
            },

            returnFunc
        ], "options")

        return temp;
    },

    credit : function() {
        return new Menu("kaden emrich", ["go to website", "menu"], [() => {
            window.open('https://kaden.kemri.ch', '_blank');
        }, mainMenu], "main");
    } 
};

// logic
function mainMenu() {
    resetControlIntervals();
    paused = false;
    gameEnd();
    gameStatus = "menu";
    currentMenu = Menus.main();
    currentMenu.draw();

    // var test0 = document.createElement("p");
    // test0.innerText= "Asteroids Game";
    // gameDiv.append(test0);
    // test0.setAttribute("class", "titleText");
    // test0.remove(); // removes the above
    // ^ this code works and can be used to redesign menus and other game text
}// mainMenu()

/* -------------------------------- Menu end -------------------------------- */

/* ---------------------------- controllers start --------------------------- */

var menuControlScheme = [
    // new KeyHandler(["ArrowUp", "w", "W"], () => {currentMenu.last();}),
    // new KeyHandler(["ArrowDown", "s", "S"], () => {currentMenu.next();}),
    // new KeyHandler(["Enter", " "], () => {currentMenu.select();}),
    new KeyHandler(["Escape", "p"], () => {if(gameStatus == "game") pause();})
];

var gameControlScheme = [
    new KeyHandler(["ArrowUp", "w", "W"], 
    () => {
        arrowUpPressed = true;
        if(fInterval) return;
        ship.forward(acceleration);
        fInterval = setInterval(() => {ship.forward(acceleration);}, 1000/60);
        //ship.forward(acceleration);
        
    }, 
    () => {
        arrowUpPressed = false;
        clearInterval(fInterval);
        fInterval = undefined;
    }),

    new KeyHandler(["ArrowDown", "s", "S"], 
    () => {
        arrowDownPressed = true;
        if(bInterval) return;
        ship.forward(0-acceleration);
        bInterval = setInterval(() => {ship.forward(0-acceleration);}, 1000/60);
        //ship.forward(0-acceleration);
    }, 
    () => {
        arrowDownPressed = false;
        clearInterval(bInterval);
        bInterval = undefined;
    }),
    
    new KeyHandler(["ArrowLeft", "a", "A"], 
    () => {
        arrowLeftPressed = true;
        if(lInterval) return;
        ship.turnLeft();
        lInterval = setInterval(() => {ship.turnLeft();}, 1000/60);
        //ship.turnLeft();
    }, 
    () => {
        arrowLeftPressed = false;
        clearInterval(lInterval);
        lInterval = undefined;
    }),
    
    new KeyHandler(["ArrowRight", "d", "D"], 
    () => {
        arrowRightPressed = true;
        if(rInterval) return;
        ship.turnRight();
        rInterval = setInterval(() => {ship.turnRight();}, 1000/60);
        //ship.turnRight();
    }, 
    () => {
        arrowRightPressed = false;
        clearInterval(rInterval);
        rInterval = undefined;
    }),
    
    new KeyHandler(["Enter", " "], shoot),
    
    new KeyHandler(["Escape", "p", "P"], pause),
    
    new KeyHandler(["r", "R"], () => {
        gameEnd();
        newGame();
    }),
    
    new KeyHandler(["f", "F"], openFullscreen)
];

/* ----------------------------- controllers end ---------------------------- */

// inits
function init() {
    shipSkin = 0;
    for(let i = 0; i < 3; i++) {
        spawnAsteroid();
    }

    updateInterval = setInterval(updateScreen, 1000/60);
    mainMenu();
    currentController = new KeyController(menuControlScheme);
}// init()

init();

/*
todo:
    - add a how to play
    - add control schemes
*/