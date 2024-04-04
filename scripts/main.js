// Kaden Emrich

var gameStart = 0;
var gameTime = 0;
var gameTimeInterval;
var spawnTime = 100;

var urlParams = new URLSearchParams(window.location.search);

var canShoot = true;

var stars = [];

var frameFinished = true;
var lastFrameCheck = 0;
var framesSenseLastCheck = 0;
var framesPerSecond = 0;

var lastTickrateCheck = 0;
var ticksSenseLastCheck = 0;
var tps = 0;

var lastGameResult = "";

var minAsteroids = 1;
var asteroidSpawnBuffer = true;

var fInterval; // For the game controll Scheme
var bInterval;
var lInterval;
var rInterval;

window.onresize = () => {
    if(paused) {
        drawFrame();
    }
};

async function chromaticAberration(context, intensity, phase) {
    var imageData = await context.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;

    for(var i = phase % 4; i < data.length; i += 4) {
        data[i] = data[i + 4 * intensity];
    }
    await context.putImageData(imageData, 0, 0);

    return;
}

function godMode() {
    autoFire = true;
    noClip = true;
    shootAmount = 5;
    shootSpread = 30;
    shootPenetration = 10;
    shootCooldownMS = 100;
}

// async function newchromaticAberration(context, intensity) {
//     let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
//     let data = imageData.data;

//     let redImageData = context.createImageData(canvas.width, canvas.height);
//     let greenImageData = context.createImageData(canvas.width, canvas.height);
//     let blueImageData = context.createImageData(canvas.width, canvas.height);

//     for(let i = 0; i < data.length; i += 4) {
//         redImageData.data[i] = data[i]; // Red
//         redImageData.data[i + 1] = 0;
//         redImageData.data[i + 2] = 0;
//         redImageData.data[i + 3] = data[i + 3]; // Alpha

//         greenImageData.data[i] = 0;
//         greenImageData.data[i + 1] = data[i + 1]; // Green
//         greenImageData.data[i + 2] = 0;
//         greenImageData.data[i + 3] = data[i + 3]; // Alpha

//         blueImageData.data[i] = 0;
//         blueImageData.data[i + 1] = 0;
//         blueImageData.data[i + 2] = data[i + 2]; // Blue
//         blueImageData.data[i + 3] = data[i + 3]; // Alpha
//     }

//     // redContext.drawImage(canvas, intensity, 0);
//     // greenContext.drawImage(canvas, 0, 0);
//     // blueContext.drawImage(canvas, -intensity, 0);

//     redContext.putImageData(redImageData, 0, 0);
//     greenContext.putImageData(greenImageData, 0, 0);
//     blueContext.putImageData(blueImageData, 0, 0);

//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     ctx.globalCompositeOperation = 'lighter';

//     context.drawImage(redCanvas, intensity, 0);
//     context.drawImage(greenCanvas, 0, 0);
//     context.drawImage(blueCanvas, -intensity, 0);

//     ctx.globalCompositeOperation = 'source-over';

//     return;
// }

function calcAccuracy() {
    let acc = Math.floor(100 * shotsHit / shotsFired);
    if(!acc) return 0;
    else return acc;
}// calcAccuracy()

function pauseGameTime() {
    clearInterval(gameTimeInterval);
    gameTimeInterval = undefined;
}// pauseGameTime()

function resetGameTime() {
    gameTime = 0;
    gameStart = getElapsedTimems();
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
        gameStart = getElapsedTimems() - gameTime;
        currentMenu.hide();
        // resetControlIntervals();
        currentController = new KeyController(gameControlScheme);
        paused = false;
        currentMenu = undefined;
        arrowUpPressed = false;
        arrowDownPressed = false;
        arrowLeftPressed = false;
        arrowRightPressed = false;
        renderFrame();
    }
    else {
        arrowUpPressed = false;
        arrowDownPressed = false;
        arrowLeftPressed = false;
        arrowRightPressed = false;
        paused = true;
        pauseGameTime();
        // resetControlIntervals();
        currentController = new KeyController(menuControlScheme);
        currentMenu = Menus.paused();
        currentMenu.draw();
    }
}// pause()

function shoot() {
    if(!ship) return;
    if(!canShoot) return;

    // console.log('shoot'); // for debugging

    ship.shoot(shootAmount, shootSpread);
    canShoot = false;
    setTimeout(() => {
        canShoot = true;
    }, shootCooldownMS);
}// shoot()

function spawnAsteroid() {
    var dir = Math.random() * 360;
    var x = Math.random() * spaceWidth;
    var y = Math.random() * spaceHeight;

    var t = Asteroid.getRandomTorqueValue();

    if(Math.floor(Math.random() * 2) == 1) {
        if(Math.floor(Math.random() * 2) == 1) 
            var x = 0 - 90;
        else
            var x = spaceWidth + 90;
    }
    else {
        if(Math.floor(Math.random() * 2) == 1)
            var y = 0 - 90;
        else
            var y = spaceHeight + 90;
    }

    var nextAsteroid = new Asteroid(x, y, dir, asteroidSpeed, 3, t);
}// spawnAsteroid()

/*----- Update -----*/

function gameEnd() {
    var finalGameTime = gameTime / 1000;
    lastGameResult = "score: " + score + "\naccuracy: " + calcAccuracy() + "%\n time: " + finalGameTime.toFixed(1) + "s";
    resetGameTime();
    // resetControlIntervals();
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

    Shrapnel.explosion(ship.x, ship.y, 20, defaultShrapnelSpeed, 1000);

    gameEnd();
}// killPlayer()

function updateCharacterMovement(frameTime = 1/60) {
    if(!ship) return;

    if(arrowUpPressed) {
        ship.forward(shipAcceleration, frameTime);
        if(shipSkins[shipSkin].boosterShape) ship.shape = shipSkins[shipSkin].boosterShape;
    }
    else {
        ship.shape = shipSkins[shipSkin].shape;
    }
    if(arrowDownPressed) {
        ship.forward(0-shipAcceleration, frameTime);
    }
    if(arrowLeftPressed) {
        ship.turnLeft(frameTime);
    }
    if(arrowRightPressed) {
        ship.turnRight(frameTime);
    }
}// updateCharacterMovement()

function updateMovement(frameTime = 1/60) {
    for(let i = 0; i < entities.length; i++) {
        if(entities[i] != null) {
            entities[i].updatePosition(frameTime);
        }
    }
}// updateMovement()

function updateCollision() {
    for(let i = 0; i < entities.length; i++) {
        if(entities[i] != null && (entities[i].type == "ship" || entities[i].type == "laser")) {
            entities[i].updateCollision();
        }
    }
}// updateCollision()

function updateFullScreen() {
    // var h = 1000;
    // var w = window.innerWidth * h / window.innerHeight;

    var h = window.innerHeight;
    var w = window.innerWidth;

    spaceHeight = 1000;
    spaceWidth = window.innerWidth * spaceHeight / window.innerHeight;
    spaceScale = window.innerHeight / spaceHeight;

    // ctx.lineWidth = Math.floor(4 * spaceScale);

    // w/h = iw/ih
    //w = iw * h / ih
    
    canvas.width = w;
    // canvas.style.width = window.innerWidth + "px";
    // gameDiv.style.width = window.innerWidth + "px";

    canvas.height = h;
    // canvas.style.height = window.innerHeight + "px";
    // gameDiv.style.height = window.innerHeight + "px";

    // if(currentMenu) {
    //     menuDiv.style.width = window.innerWidth + "px";
    //     menuDiv.style.height = window.innerHeight + "px";
    // }
    return;
}// updateFullScreen()

async function updateSize() {
    var h = window.innerHeight;
    var w = window.innerWidth;

    
    if(viewType == 1) {
        updateFullScreen();
        // ctx.lineWidth = Math.floor(canvas.height / 250);
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
    //gameDiv.style.margin = "auto";

    if(doPostProcessing) {
        layer2Canvas.style.innerWidth = canvas.style.innerWidth;
        layer2Canvas.style.innerHeight = canvas.style.innerHeight;
        layer2Canvas.style.width = canvas.style.width;
        layer2Canvas.style.height = canvas.style.height;
        layer2Canvas.width = canvas.width;
        layer2Canvas.height = canvas.height;
    }

    return;
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

    let numAsteroids = getNumAsteroids();

    if(minAsteroids == 0 && numAsteroids > 1) {
        minAsteroids = 1;
    }

    if(numAsteroids > minAsteroids) {
        asteroidSpawnBuffer = false;
    }

    if(numAsteroids == minAsteroids && asteroidSpawnBuffer == false) {
        minAsteroids++;
    }
    else if(numAsteroids < minAsteroids) {
        spawnAsteroid();
    }

    if(numAsteroids < minAsteroids && asteroidSpawnBuffer == false) {
        spawnAsteroid();
        asteroidSpawnBuffer = true;
    }


    // if(numAsteroids == 0 && !currentAlert) {
    //     currentDifficulty++;

    //     newAlert("NEW WAVE", 20, 120, () => {
    //         for(let i = 0; i < currentDifficulty; i++) {
    //             spawnAsteroid();
    //         }
    //     });
    // }

    // if(minAsteroids == 0 && getNumAsteroids() > 1) { 
    //     // console.log("atest"); // for debugging
    //     minAsteroids = 1;
    // } // this ensures that another asteroid will not spawn until the player shoots the first one

    // if(getNumAsteroids() < minAsteroids) {
    //     spawnAsteroid();
    // }

    // if(getNumAsteroids() == minAsteroids) {
    //     minAsteroids++;
    // }
}// updateAsteroids()

async function drawEntities() {
    for(let i = 0; i < entities.length; i++) {
        if(entities[i] != null) {
            await entities[i].draw();

            if(showBoundingBoxes) {
                entities[i].drawBoundingBox();
            }
        }
    }
    return;
}// drawEntities()

function drawStats() {
    if(!showStats) return;
    // ctx.shadowBlur = 10;

    fontSize = canvas.height / 20;
    ctx.font = fontSize + "px " + fontFamily;
    ctx.textBaseline = "hanging";
    ctx.textAlign = "left";

    ctx.fillStyle = palettes[currentPalette].text;
    // ctx.shadowColor = palettes[currentPalette].text;
        
    ctx.fillText("score: " + score, 10, 10);

    if(showTime) {
        ctx.textAlign = "center";
        ctx.fillStyle = palettes[currentPalette].text;
        fontSize = canvas.height / 15;
        ctx.font = fontSize + "px " + fontFamily;
        ctx.fillText((gameTime / 1000).toFixed(), canvas.width/2, 10);
    }

    ctx.textAlign = "left";
    fontSize = canvas.height / 20;
    ctx.font = fontSize + "px " + fontFamily;

    // ctx.fillStyle = palettes[currentPalette].text;
    // ctx.fillText("Wave: " + currentDifficulty, 10, fontSize + 20);

    ctx.fillStyle = palettes[currentPalette].text;
    ctx.fillText("accuracy: " + calcAccuracy() + "%", 10, fontSize + 20);

    if(showExtraStats) {
        

        ctx.fillStyle = palettes[currentPalette].text;
        ctx.fillText("asteroids: " + getNumAsteroids(), 10, fontSize*2 + 30);

        ctx.fillStyle = palettes[currentPalette].text;
        ctx.fillText("difficulty: " + minAsteroids, 10, fontSize*3 + 40);

        if(showNerdyStats) {
            ctx.fillStyle = palettes[currentPalette].text;
            ctx.fillText("fps: " + framesPerSecond.toFixed(0), 10, fontSize*4 + 50);

            ctx.fillStyle = palettes[currentPalette].text;
            ctx.fillText("Elapsed Time: " + (getElapsedTimems() / 1000).toFixed(1), 10, fontSize*5 + 60);
        }
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

async function updateAlert() {
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
    return;
}// updateAlert()

// function updateScreen() {
//     if(!trippyMode) {
//         ctx.clearRect(0, 0, canvas.width, canvas.height);
//     }

//     fontSize = canvas.height * 1 / 20;
//     updateSize();

//     drawEntities();

//     updateAlert();

//     //if(currentMenu) currentMenu.draw();
//     if(!currentMenu) drawStats();
//     else {
//         ctx.shadowBlur = 0;
//         ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
//         ctx.fillRect(0, 0, canvas.width, canvas.height)
//     }    
// }// updateScreen()

function checkFPS() {
    let output = framesSenseLastCheck / ((getElapsedTimems() - lastFrameCheck) / 1000);
    lastFrameCheck = getElapsedTimems();
    framesSenseLastCheck = 0;
    return output;
}// checkFPS()

function checkTickrate() {
    let output = ticksSenseLastCheck / ((getElapsedTimems() - lastTickrateCheck) / 1000);
    lastTickrateCheck = getElapsedTimems();
    ticksSenseLastCheck = 0;
    return output;
}// checkTickrate()

async function drawStars() {
    for(let i = 0; i < stars.length; i++) {
        await starShape.fill(stars[i].x, stars[i].y, 0, palettes[currentPalette].text, 0.6);
    }

    return;
}

async function drawFrame() {
    framesSenseLastCheck++;

    frameFinished = false;
    if(!trippyMode) {
        await ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    fontSize = canvas.height * 1000 / 20;
    await updateSize();

    ctx.lineWidth = Math.floor(lineThickness * spaceScale);

    if(showStars) {
        await drawStars();
    }

    await drawEntities();

    //if(currentMenu) currentMenu.draw();
    if(!currentMenu) drawStats();
    // else {
    //     // ctx.shadowBlur = 0;
    //     ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    //     await ctx.fillRect(0, 0, canvas.width, canvas.height)
    // }
    
    await updateAlert();

    if(doChromaticAberration) {
        await chromaticAberration(ctx, 2, 0);
    }

    if(doPostProcessing) {
        

        layer2Canvas.style.display = "block";
        l2ctx.drawImage(canvas, 0, 0);
    }
    else {
        layer2Canvas.style.display = "none";
    }

    frameFinished = true;
    return;
}// drawFrame()

function tick(frameTime = 1/60) {

    console.log("tick");
    if(!paused) {
        gameTime = (getElapsedTimems() - gameStart);
        updateCharacterMovement(frameTime);
        updateMovement(frameTime);
        updateCollision();

        updateAsteroids();
    }

    if(getElapsedTimems() - lastTickrateCheck >= tickrateCheckIntervalms) {
        tps = checkTickrate();
        //console.log("tps: " + tps); // for debugging

        // if(tps < tickSpeed) {
        //     console.log("LOW TPS: " + tps); // for debugging
        // }
    }

    // if(getElapsedTimems() - lastFrameCheck >= frameCheckIntervalms) {
    //     framesPerSecond = checkFPS();
    // }

    if(frameFinished) {
        drawFrame();
    }
    else {
        console.log("frame dropped"); // fordebugging
        droppedFrames++;
    }

    ticksSenseLastCheck++;
}// tick()

var currentTimestamp = 0;
var startTimeStamp, previoustimeStamp;
var animationFrame = undefined;

function checkTimestamps() {
    console.log(`${previoustimeStamp} -> ${currentTimestamp} : ${framesPerSecond}}`);
}

async function renderFrame(timeStamp) {
    if(timeStamp === undefined) {
        timeStamp = previoustimeStamp;
        animationFrame = window.requestAnimationFrame(renderFrame);
        return;
    }
    currentTimestamp = timeStamp;

    if(startTimeStamp === undefined) {
        startTimeStamp = timeStamp;
        //console.log(`startTimeStamp: ${startTimeStamp}`); // for debugging
    }
    if(previoustimeStamp === undefined) {
        previoustimeStamp = timeStamp;
    }

    var frameTime = (timeStamp - previoustimeStamp) / 1000;
    if(isNaN(frameTime)) {
        console.log(`help! ${previoustimeStamp} -> ${timeStamp}`); // for debugging
        frameTime = 0;
    }
    framesPerSecond = 1 / frameTime;

    gameTime = (getElapsedTimems() - gameStart);

    if(autoFire && canShoot && shootPressed) {
        shoot();
    }
    updateCharacterMovement(frameTime);
    updateMovement(frameTime);
    updateCollision();

    updateAsteroids();

    await drawFrame();

    ticksSenseLastCheck++;
    
    // console.log(`frameTime: ${frameTime}`); // for debugging

    if(!paused) {
        // if(previoustimeStamp != 0 && timeStamp != 0 && timeStamp === previoustimeStamp) { // if this is true, there is another animationFrame that should not be running and this corrects it.
        //     return;
        // }
        previoustimeStamp = timeStamp;
        animationFrame = window.requestAnimationFrame(renderFrame);
    }
    else {
        window.cancelAnimationFrame(animationFrame);
        startTimeStamp = undefined;
        previoustimeStamp = undefined;
    }

}

/*----- Update End -----*/

function togglePostProcessing() {
    if(doPostProcessing) {
        doPostProcessing = false;
        // document.getElementById("scan-lines").style.display = "none";
    }
    else {
        doPostProcessing = true;
        // document.getElementById("scan-lines").style.display = "block";
    }

    return doPostProcessing;
}

function toggleStars() {
    if(showStars) {
        showStars = false;
    }
    else {
        showStars = true;
    }
}

function toggleShrapnel() {
    if(doShrapnel) {
        doShrapnel = false;
    }
    else {
        doShrapnel = true;
    }
}

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
    drawFrame();
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

    menuTitle.style.color = palettes[currentPalette].title;
    menuTitle.style.textShadow = palettes[currentPalette].title + " 0 0 0.8vh";

    menuSubtitle.style.color = palettes[currentPalette].text;
    menuSubtitle.style.textShadow = palettes[currentPalette].text + " 0 0 0.8vh";

    // for(let i = 0; i < 4; i++) {
    //     menuButtons[i].style.color = palettes[currentPalette].text;
    //     menuButtons[i].style.textShadow = palettes[currentPalette].text + " 0 0 0.7vh"
    // }


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

            case "shrapnel":
                e.color = palettes[currentPalette].asteroid;
                break;
        }
    }

    canvas.style.backgroundColor = palettes[currentPalette].background;
    drawFrame();
}// equipPalette(p)

function cyclePalette() {
    if(currentPalette + 1 >= palettes.length) {
        currentPalette = 0;
    }
    else currentPalette++;

    equipPalette(currentPalette);
}// cyclePalette()

function makeClassic() {
    currentPalette = 1;
    equipPalette(currentPalette);

    shipSkin = 1;
    equipShipSkin(shipSkin);

    showStars = true;
    doShrapnel = true;
}

function settingsMenu() {
    currentMenu = Menus.settings();
    //currentMenu.draw();
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
    minAsteroids = 0;
    
    window.cancelAnimationFrame(animationFrame);
    // resetControlIntervals();

    stars = generateStars(numStars);

    canShoot = true;

    currentController = new KeyController(gameControlScheme);
    // frameInterval = clearInterval(frameInterval);
    // tickInterval = clearInterval(tickInterval);
    gameStatus = "game";
    currentMenu.hide();
    currentMenu = undefined;
    paused = false;
    gameOver = false;
    entities = [];
    score = 0;
    shotsFired = 0;
    shotsHit = 0;

    arrowUpPressed = false;
    arrowDownPressed = false;
    arrowLeftPressed = false;
    arrowRightPressed = false;

    ship = new Ship();

    currentDifficulty = 1;
    
    new Asteroid(spaceWidth/2, spaceHeight/2, 0, 0, 3);

    ship.dir = Math.atan((spaceHeight/2 - ship.y) / (spaceWidth/2 - ship.x)) * 180/Math.PI + 180;

    renderFrame();
    // start update interval
    // tickInterval = setInterval(tick, 1000/tickSpeed);
    //frameInterval = setInterval(updateScreen, 1000/framerate);
}// newGame()

/* ------------------------------- Menu start ------------------------------- */

// logic
function mainMenu() {
    // resetControlIntervals();
    paused = false;
    window.cancelAnimationFrame(animationFrame);
    renderFrame();
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
        if(!ship) return;
        arrowUpPressed = true;
        // if(fInterval) return;
        // ship.forward(shipAcceleration);

        // if(shipSkins[shipSkin].boosterShape) ship.shape = shipSkins[shipSkin].boosterShape;

        // fInterval = setInterval(() => {ship.forward(shipAcceleration);}, 1000/tickSpeed);
        //ship.forward(shipAcceleration);
    }, 
    () => {
        arrowUpPressed = false;
        
        // ship.shape = shipSkins[shipSkin].shape;

        // clearInterval(fInterval);
        // fInterval = undefined;
    }),

    new KeyHandler(["ArrowDown", "s", "S"], 
    () => {
        if(!ship) return;
        arrowDownPressed = true;
        // if(bInterval) return;
        // ship.forward(0-shipAcceleration);
        // bInterval = setInterval(() => {ship.forward(0-shipAcceleration);}, 1000/tickSpeed);
        //ship.forward(0-shipAcceleration);
    }, 
    () => {
        arrowDownPressed = false;
        // clearInterval(bInterval);
        // bInterval = undefined;
    }),
    
    new KeyHandler(["ArrowLeft", "a", "A"], 
    () => {
        if(!ship) return;
        arrowLeftPressed = true;
        // if(lInterval) return;
        // ship.turnLeft();
        // lInterval = setInterval(() => {ship.turnLeft();}, 1000/tickSpeed);
        //ship.turnLeft();
    }, 
    () => {
        arrowLeftPressed = false;
        // clearInterval(lInterval);
        // lInterval = undefined;
    }),
    
    new KeyHandler(["ArrowRight", "d", "D"], 
    () => {
        if(!ship) return;
        arrowRightPressed = true;
        // if(rInterval) return;
        // ship.turnRight();
        // rInterval = setInterval(() => {ship.turnRight();}, 1000/tickSpeed);
        //ship.turnRight();
    }, 
    () => {
        arrowRightPressed = false;
        // clearInterval(rInterval);
        // rInterval = undefined;
    }),
    
    new KeyHandler(["Enter", " "], 
        () => {
            if(!shootPressed) {
                shoot();
                shootPressed = true;
            }
        },
        () => {
            shootPressed = false;
        }
    ),
    
    new KeyHandler(["Escape", "p", "P"], pause),
    
    new KeyHandler(["r", "R"], () => {
        gameEnd();
        newGame();
    }),
    
    new KeyHandler(["f", "F"], openFullscreen)
];

/* ----------------------------- controllers end ---------------------------- */

// menus
var Menus = {
    main : function() {
        return new Menu("asteroids", "a game by kaden", [
            new MenuOption("start", newGame), 
            new MenuOption("settings", settingsMenu), 
            new MenuOption("info", () => {
                currentMenu = Menus.credit(); 
                currentMenu.draw();
            })
        ], "main");
    },
    over : function() {
        return new Menu("game over", lastGameResult, [
            new MenuOption("retry", newGame), 
            new MenuOption("menu", mainMenu)
        ], "main");
    },
    paused : function() {
        return new Menu("paused", null, [
            new MenuOption("continue", () => {
                pause();
            }),
            new MenuOption("retry", newGame), 
            new MenuOption("settings", () => {
                currentMenu = Menus.settings(Menus.paused);
                //currentMenu.draw();
            }), 
            new MenuOption("menu", () => {
                killPlayer(); 
                mainMenu();
            })
        ], "main");
    },
    settings : function(returnMenu) {
        if(!returnMenu) returnMenu = Menus.main;

        function returnFunc() {
            currentMenu = returnMenu();
            //currentMenu.draw();
        }// returnFunc

        let temp = new Menu("settings", null, [
            new MenuOption("back", returnFunc),

            new MenuOption("customization", () => {
                currentMenu = Menus.customizationSettings(returnMenu);
            }),

            new MenuOption("stats / ui", () => {
                currentMenu = Menus.statsSettings(returnMenu);
                //currentMenu.draw();
            }),

            new MenuOption("classic mode", () => {
                makeClassic();
            }),
        ], "options");

        return temp;
    },

    customizationSettings : function(returnMenu) {
        if(!returnMenu) returnMenu = Menus.main;

        function returnFunc() {
            currentMenu = Menus.settings(returnMenu);
            //currentMenu.draw();
        }// returnFunc

        let temp = new Menu("customization", null, [
            new MenuOption("back", returnFunc),

            new MenuOption("palette: " + palettes[currentPalette].name, () => {
                cyclePalette();
                temp.options[1].name = "palette: " + palettes[currentPalette].name;
                menuButtons[1].innerText = temp.options[1].name;
                //currentMenu.draw();
            }), 

            new MenuOption("ship skin: " + shipSkins[shipSkin].name, () => {
                cycleShipSkin();
                temp.options[2].name = "ship skin: " + shipSkins[shipSkin].name;
                menuButtons[2].innerText = temp.options[2].name;
                //currentMenu.draw();
            }),

            new MenuOption("shrapnel: " + (doShrapnel ? "on" : "off"), () => {
                toggleShrapnel();
                temp.options[3].name = "shrapnel: " + (doShrapnel ? "on" : "off");
                menuButtons[3].innerText = "shrapnel: " + (doShrapnel ? "on" : "off");
            }),

            new MenuOption("post-processing: " + (doPostProcessing ? "on" : "off"), () => {
                togglePostProcessing();
                temp.options[4].name = "post-processing: " + (doPostProcessing ? "on" : "off");
                menuButtons[4].innerText = "post-processing: " + (doPostProcessing ? "on" : "off");
            }),

            new MenuOption("stars: " + (showStars ? "on" : "off"), () => {
                toggleStars();
                temp.options[5].name = "stars: " + (showStars ? "on" : "off");
                menuButtons[5].innerText = "stars: " + (showStars ? "on" : "off");
            })
        ], "options");

        return temp;
    },

    statsSettings : function(returnMenu) {

        if(!returnMenu) returnMenu = Menus.main;

        function returnFunc() {
            currentMenu = Menus.settings(returnMenu);
            //currentMenu.draw();
        }// returnFunc()

        let temp = new Menu("more settings", null, [
            new MenuOption("back", returnFunc),

            new MenuOption("show stats: " + showStats, () => {
                if(showStats) {
                    showStats = false;
                }
                else {
                    showStats = true;
                }

                temp.options[1].name = "show stats: " + showStats;
                menuButtons[1].innerText = temp.options[1].name;
            }), 
            
            new MenuOption("show time: " + showTime, () => {
                if(showTime) {
                    showTime = false;
                }
                else {
                    showTime = true;
                }

                temp.options[2].name = "show time: " + showTime;
                menuButtons[2].innerText = temp.options[2].name;
            }),

            new MenuOption("extra stats: " + showExtraStats, () => {
                if(showExtraStats) {
                    showExtraStats = false;
                    //showVelocity = false;
                }
                else {
                    showExtraStats = true;
                    //showVelocity = true;
                }

                temp.options[3].name = "extra stats: " + showExtraStats;
                menuButtons[3].innerText = temp.options[3].name;
            })
        ], "main")

        return temp;
    },

    credit : function() {
        return new Menu("info", "created by: kaden emrich \n " + RELEASE_VERSION, [
            new MenuOption("go to website", () => {
                window.open('https://kadenemrich.com', '_blank');
            }), 
            new MenuOption("menu", mainMenu)
        ], "main");
    } 
};

function generateStars(num) {
    var newStars = [];
    for(let i = 0; i < num; i++) {
        newStars.push({
            x : Math.floor(Math.random() * canvas.width),
            y : Math.floor(Math.random() * canvas.height)
        });
    }

    return newStars;
}

// inits
function init() {
    shipSkin = 0;

    // tick();
    //tickInterval = setInterval(tick, 1000/tickSpeed);
    // renderFrame();
    updateSize();

    //frameInterval = setInterval(updateScreen, 1000/framerate);
    currentController = new KeyController(menuControlScheme);

    //mainMenu();

    for(let i = 0; i < 3; i++) {
        spawnAsteroid();
    }

    if(urlParams.get('background') == 'true') {
        menuDiv.style.display = "none";

        showStats = false;

        for(let i = 0; i < 4; i++) {
            spawnAsteroid();
        }

        renderFrame();
    }
    else {
        menuDiv.style = "opacity: 100;";
        mainMenu();
    }

    currentPalette = 0;
    equipPalette(currentPalette);

    stars = generateStars(numStars);

    /*
    getElapsedTimems() = 0;
    setInterval(() => {
        if(getElapsedTimems() >=  Number.MAX_SAFE_INTEGER - 10) { // I don't really need to worry about this as the max integer measured in MILISECONDS is equivalent to almost 300,000 years but if some one is willing to play my game for that long, I'm not gonna stop them. ¯\_(ツ)_/¯
            getElapsedTimems() = 0;
        } else {
            getElapsedTimems() += 10;
        }
    }, 10);
    */
}// init()

init();

/*
todo:
    - add a how to play
    - optimize for better framerate when there are a lot of asteroids (sorta finished)
        > attempt to add a dynamic framerate system independant of internal update speed
*/