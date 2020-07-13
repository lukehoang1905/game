const FPS = 30 //framepersec
const SHIP_SIZE = 30 //ship height on pix
const ROTATION_SPEED = 360; //ROTATATION SPEED IN DEGREE / SEC
const SHIP_FOWAC = 5 // acceleration per sec per sec
const FRICTION = .89 //FRICTION COEFFECICENT OF SPACE (0->1)
const ROCK_NUM = 3; //number of rock
const ROCK_SIZE = 100 //size in px
const ROCK_SPD = 50 //MAX speed persec
const ROCK_VERT = 10 //averagenumber of vertices per rock
const ROCK_IMP = Math.PI / 10 //IMPERFECTION
const SHOW_BOUNDING = false //TOOGLE BOUNDING
const SHIP_EXPLODE_DURATION = 2;
const SHIP_INVI_DURATION = 3;
const SHIP_BLINK_DURATION = 0.1;
const LASER_SPD = 300
const LASER_AMO = 6
const LASER_DIS = 0.6 // fraction of screen
const TEXT_FADE = 2.5 //TEXT FADE IN SEC
const TEXT_SIZE = 200
const LIVES = 3
let myMusic;
let canv = document.getElementById("gameCanvas")
let ctx = canv.getContext("2d")
    //create ship
    //create asteroid

setInterval(update, 1000 / FPS)
    //set up event handlers
document.addEventListener("keydown", keyDown)
document.addEventListener("keyup", keyUp)

//game loop
let level, rocks, ship, text, textA;

let over = true;

function start() {
    name = document.getElementById("input-name").value
    document.getElementById("player").innerHTML = name
    over = false;
}
newGame();

function newGame() {
    score = 0;
    level = 5
    ship = newShip();
    newLevel();
}

function newLevel() {
    text = "Level " + level;
    textA = 1.0;
    lives = LIVES
    createRocks();
}

function gameOver() {
    ship.dead = true
    text = "Game Over";
    textA = 1;
}

function shootLaser() {
    //create object
    if (ship.canShoot && (ship.amo.length < LASER_AMO)) {
        //fire
        ship.amo.push({ // from the nose
            x: ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
            y: ship.y - 4 / 3 * ship.r * Math.sin(ship.a),
            xv: LASER_SPD * Math.cos(ship.a) / FPS,
            yv: -LASER_SPD * Math.sin(ship.a) / FPS,
            dist: 0
        });
    }
    //cooldown
    ship.canShoot = false;
}

function update() {
    blinkOn = (ship.blinkNum % 2 == 0);
    //draw background
    drawBg()
    exploding = ship.explodeTime > 0;

    drawRock()
        //before ship move condition check
    if (!exploding) {
        //draw ship triagle
        if (!ship.dead) {
            shipMove();
            drawShip();
        }

        for (i = ship.amo.length - 1; i >= 0; i--) {
            //check dis traveled
            if (ship.amo[i].dist > LASER_DIS * canv.width) {
                ship.amo.splice(i, 1);
                continue
            }
            ship.amo[i].x += ship.amo[i].xv
            ship.amo[i].y += ship.amo[i].yv
                //distance between 2 points
                //pytago a^2 + b^2 = c^2
            ship.amo[i].dist += Math.sqrt(Math.pow(ship.amo[i].xv, 2) + Math.pow(ship.amo[i].yv, 2))

        }

        if (ship.blinkNum == 0) {

            for (i = 0; i < rocks.length; i++) {
                if (distBetweenPoints(ship.x, ship.y, rocks[i].x, rocks[i].y) < ship.r + rocks[i].r) {
                    explodeShip();
                }
            }
        }
    } else { // draw exp
        drawExp()
        ship.explodeTime--;
        if (ship.explodeTime == 0) {
            lives--;
            if (lives == 0) {
                gameOver();
            } else {
                ship = newShip();
            }
        }
    }


    moveRock()
        //draw text
    if (over == true) { return }
    if (textA >= 0) {
        ctx.fillStyle = "rgba(255,255,255," + textA + ")";
        ctx.font = "small-caps" + TEXT_SIZE + "sans";
        ctx.fillText(text, canv.width / 2, canv.height * 0.75)
        textA -= (1.0 / TEXT_FADE / FPS)

    }

    //DRAW LIVE
    document.getElementById("live").innerHTML = lives
        //draw level
    document.getElementById('level').innerHTML = level

}

function newShip() {
    return {
        dead: false,
        x: canv.width / 2,
        y: canv.height / 2,
        r: SHIP_SIZE / 2, //RADIUS
        a: 90 / 180 * Math.PI, //angle 0> 90^ math dont work in degree , work in radiance 2pi rad = 360degree
        rot: 0,
        explodeTime: 0,
        isForward: false,
        canShoot: true,
        amo: [],
        blinkNum: Math.ceil(SHIP_INVI_DURATION / SHIP_BLINK_DURATION),
        blinkTime: Math.ceil(SHIP_BLINK_DURATION * FPS),
        //continue forward while rotating
        forward: {
            x: 0,
            y: 0,
        }

    }
}

function drawExp() {
    ctx.fillStyle = "darkred";
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r * 1.4, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.fillStyle = "orange";
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r * 1.1, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r * 0.8, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r * 0.5, 0, Math.PI * 2, false);
    ctx.fill();
}

function explodeShip() {
    ship.explodeTime = Math.ceil(SHIP_EXPLODE_DURATION * FPS)
}


function drawShip() {
    if (over == true) { return }
    if (blinkOn) {

        ctx.strokeStyle = "white";
        ctx.lineWidth = SHIP_SIZE / 20;

        ctx.beginPath();
        // cos = horizontal 
        ctx.moveTo( //tip of the ship
            ship.x + 4 / 3 * ship.r * Math.cos(ship.a), //4/3 and 2/3 is extend the triangles to make the dot become center
            ship.y - 4 / 3 * ship.r * Math.sin(ship.a)
        );
        ctx.lineTo( //rear left
            ship.x - ship.r * ((2 / 3 * Math.cos(ship.a)) + Math.sin(ship.a)),
            ship.y + ship.r * ((2 / 3 * Math.sin(ship.a)) - Math.cos(ship.a))

        );
        ctx.lineTo( //rear right
            ship.x - ship.r * ((2 / 3 * Math.cos(ship.a)) - Math.sin(ship.a)),
            ship.y + ship.r * ((2 / 3 * Math.sin(ship.a)) + Math.cos(ship.a))

        );
        //moveshi
        ctx.closePath()
        ctx.stroke();

    }
    //handles blinking
    if (ship.blinkNum > 0) {
        ship.blinkTime--;
        //reduce blink nume
        if (ship.blinkTime == 0) {
            ship.blinkTime = Math.ceil(SHIP_BLINK_DURATION * FPS);
            ship.blinkNum--;
        }

    }
    if (SHOW_BOUNDING) {
        ctx.strokeStyle = "lime";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r, 0, Math.PI * 2, false);
        ctx.stroke();
    }
    // draw laser
    for (i = 0; i < ship.amo.length; i++) {
        ctx.fillStyle = "salmon";
        ctx.beginPath();
        ctx.arc(ship.amo[i].x, ship.amo[i].y, SHIP_SIZE / 15, 0, Math.PI * 2, false)
        ctx.fill();
    }
    //detect hit projectile
    let ax, ay, ar, lx, ly;
    for (i = rocks.length - 1; i >= 0; i--) {
        ax = rocks[i].x;
        ay = rocks[i].y;
        ar = rocks[i].r;
        for (j = ship.amo.length - 1; j >= 0; j--) {

            lx = ship.amo[j].x;
            ly = ship.amo[j].y;

            if (distBetweenPoints(ax, ay, lx, ly) < ar) {
                ship.amo.splice(j, 1);
                rocks.splice(i, 1);
                score += 120;
                document.getElementById("score").innerHTML = score
                if (rocks.length == 0) {
                    level++
                    newLevel();
                }
                break
            }
        }
    }
}

function drawFlame() {
    //flame will be an OPPOSITE TRIANGLE attach to the bottom of the ship
    if (!exploding && blinkOn && !over) {
        ctx.fillStyle = "green";
        ctx.strokeStyle = "red";
        ctx.lineWidth = SHIP_SIZE / 10;

        ctx.beginPath();
        // cos = horizontal 
        ctx.moveTo( //rearleft
            ship.x - ship.r * ((2 / 3 * Math.cos(ship.a)) + 0.5 * Math.sin(ship.a)),
            ship.y + ship.r * ((2 / 3 * Math.sin(ship.a)) - 0.5 * Math.cos(ship.a))
        );
        ctx.lineTo( //rearcenter behind ship
            ship.x - ship.r * 6 / 3 * Math.cos(ship.a),
            ship.y + ship.r * 6 / 3 * Math.sin(ship.a));
        ctx.lineTo( //rear right
            ship.x - ship.r * ((2 / 3 * Math.cos(ship.a)) - 0.5 * Math.sin(ship.a)),
            ship.y + ship.r * ((2 / 3 * Math.sin(ship.a)) + 0.5 * Math.cos(ship.a))

        );
        ctx.fill();
        ctx.closePath();
        ctx.stroke();
    }
}

function shipMove() { //foward ship
    if (ship.isForward) {
        ship.forward.x += SHIP_FOWAC * Math.cos(ship.a) / FPS;
        ship.forward.y -= SHIP_FOWAC * Math.sin(ship.a) / FPS;
        drawFlame()

    } else { // when not accellerate, friction will slow down the ship
        ship.forward.x -= FRICTION * ship.forward.x / FPS
        ship.forward.x -= FRICTION * ship.forward.x / FPS
    }
    if (ship.x < 0 - ship.r) {
        ship.x = canv.width + ship.r;
    } else if (ship.x > canv.width + ship.r) {
        ship.x = 0 - ship.r;
    }
    if (ship.y < 0 - ship.r) {
        ship.y = canv.height + ship.r;
    } else if (ship.y > canv.height + ship.r) {
        ship.y = 0 - ship.r;
    }
    //rotate ship
    ship.a += ship.rot;
    //move ship
    ship.x += ship.forward.x;
    ship.y += ship.forward.y;

}

function drawRock() {
    //draw rock


    let x, y, r, a, vert, imps;
    for (i = 0; i < rocks.length; i++) {
        ctx.strokeStyle = "slategrey";
        ctx.lineWidth = SHIP_SIZE / 20;
        //draw a path
        x = rocks[i].x;
        y = rocks[i].y;
        r = rocks[i].r;
        a = rocks[i].a;
        vert = rocks[i].vert;
        imps = rocks[i].imps;
        ctx.beginPath();
        ctx.moveTo(
            x + r * imps[0] * Math.cos(a),
            y + r * imps[0] * Math.sin(a)
        );
        //draw polygon
        for (j = 1; j < vert; j++) {
            ctx.lineTo(
                x + r * imps[j] * Math.cos(a + j * Math.PI * 2 / vert),
                y + r * imps[j] * Math.sin(a + j * Math.PI * 2 / vert)
            )
        }
        //move

        ctx.closePath();
        ctx.stroke();
        if (SHOW_BOUNDING) {
            ctx.strokeStyle = "lime";
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2, false);
            ctx.stroke();
        }
    }
}

function moveRock() {
    for (i = 0; i < rocks.length; i++) {
        rocks[i].x += rocks[i].xv;
        rocks[i].y += rocks[i].yv;
        // handle edge
        if (rocks[i].x < 0 - rocks[i].r) {
            rocks[i].x = canv.width + rocks[i].r
        } else if (rocks[i].x > canv.width + rocks[i].r) {
            rocks[i].x = 0 - rocks[i].r
        }
        if (rocks[i].y < 0 - rocks[i].r) {
            rocks[i].y = canv.height + rocks[i].r
        } else if (rocks[i].y > canv.height + rocks[i].r) {
            rocks[i].y = 0 - rocks[i].r
        }
    }
}

function createRocks() {
    rocks = [];
    let x, y;
    for (i = 0; i < ROCK_NUM + level; i++) { //loop over number of rocks
        do {
            x = Math.floor(Math.random() * canv.width);
            y = Math.floor(Math.random() * canv.height);
        }
        while (distBetweenPoints(ship.x, ship.y, x, y) < ROCK_SIZE * 2 + ship.r);
        rocks.push(addRock(x, y));
    }

}

function distBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

function addRock(x, y) {
    let diff = 1 + 0.1 * level;
    let rock = {
        x: x,
        y: y,
        xv: Math.random() * ROCK_SPD * diff / FPS * (Math.random() < 0.5 ? 1 : -1), //if then else
        yv: Math.random() * ROCK_SPD * diff / FPS * (Math.random() < 0.5 ? 1 : -1), //if then else
        r: ROCK_SIZE / 2,
        a: Math.random() * Math.PI * 2, //in radiance
        vert: Math.floor(Math.random() * (ROCK_VERT + 1) + ROCK_VERT / 2),
        imps: []
    };
    //create imperfection
    console.log(rock.vert);
    for (t = 0; t < rock.vert; t++) {
        rock.imps.push(Math.random() * ROCK_IMP * 2 + 1 - ROCK_IMP);
    }
    return rock;
}

function keyMap() {

    keyDown();
    keyUp();
}

function keyDown( /** @type [KeyboardEvent]*/ ev) {
    if (ship.dead == true) {
        return
    }
    switch (ev.keyCode) {
        case 37: //left key
            ship.rot = (ROTATION_SPEED / 180 * Math.PI / FPS);
            break;
        case 39: //right key
            ship.rot = -(ROTATION_SPEED / 180 * Math.PI / FPS);
            break;
        case 38: //up arrow;
            ship.isForward = true;
            break;
        case 40: //down

            break;
        case 32: //space //SHOOT
            shootLaser();

            break;
    }
}

function keyUp( /** @type [KeyboardEvent]*/ ev) {
    if (ship.dead == true) {
        return
    }
    switch (ev.keyCode) {
        case 37: //left key (stop rotating)
            ship.rot = 0
            break;
        case 39: //right key (stop rotating)
            ship.rot = 0
            break;
        case 38: //up arrow (stop foward)
            ship.isForward = false
            break;
        case 40: //down (stop go down)

            break;
        case 32: //space // allow shoot
            ship.canShoot = true
            break;
    }

}

function drawBg() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canv.width, canv.height);

}