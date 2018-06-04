const RAINBOW_PATTERN = ['FF0000', // red
                         'FF8000', // orange
                         'FFFF00', // yellow
                         '00FF00', // green
                         '0000FF', // blue
                         '4B0082', // indigo
                         '7F00FF'];
const PIPE_SPEED = 4;
const POINT_POS  = {x: 10, y: 30};
const NORMAL_GRAV = 0.5;

const AUDIO_ON  = 'media/Speaker_Icon_on.svg'
const AUDIO_OFF = 'media/Speaker_Icon_off.svg'

let bird;
let pipes = [];
let points = 0;
let cycleCount = 1;

let gameState = 0;
let gravity = 0;

let pointAnimation = [];
let stars = [];

let idleAnimation = 0;
let birdSprite;

let sound;

function preload() {
    birdSprite = loadImage('media/alpaka.png');
    sound = new Audio('media/gamesound.mp3');
    sound.volume = 0.2;
}

window.onload = function() {
    document.getElementById('sound').addEventListener('click', function() {
        if (sound.paused) {
            document.getElementById('sound').setAttribute('src', AUDIO_ON);
            sound.play();
        } else {
            document.getElementById('sound').setAttribute('src', AUDIO_OFF);
            sound.pause();
        }
    })
}

function setup() {
    let can = createCanvas(940, 780);
    can.parent('flappyAlpaka')

    restart();

    for (let i = 0; i < 10; i++) {
        stars.push(new Stars(Math.random()*width, Math.random()*height))
    }

    textSize(20);
    
    window.addEventListener('mousedown', function() {jump();});
    window.addEventListener('keydown', function(e) {
        // when spacebar is pressed
        if (e.keyCode == 32 ) {
            jump();
        }
    }) 
}

function draw() {
    background(5);

    drawBackgroundElements();

    bird.update();
    bird.show();  
        
    if (Math.random() < 0.05) {
        stars.push(new Stars(width,Math.random() * height))
    }

    for (let i = pipes.length-1; i >= 0; i--) {
        pipes[i].show();
        pipes[i].update();
        if (pipes[i].hit(bird)){
            loose();
            return;
        }
        
        if ( !pipes[i].noHit && pipes[i].done(bird) ) {
            pointPlus();
        }

        if (pipes[i].offscreen()) {
            pipes.splice(i, 1);
        }
    }    

    if (gameState == 1) {
        if (cycleCount % 100 == 0) {
            pipes.push(new Pipe());
        }
        
        cycleCount++;
    } else if (gameState == 0) {
        let noiseMove = noise(frameCount / 100) - 0.5;
        bird.y += noiseMove * 1.5;
    }
}

function jump() {
    if (gameState == 0) {
        startGame();
    }

    if (gameState == 1) {
        bird.up();
    }
}

function startGame() {
    gameState = 1;
    gravity = NORMAL_GRAV;
}

function drawBackgroundElements() {
    strokeWeight(0);
    text("Points: " + points, POINT_POS.x, POINT_POS.y);

    for (let i = pointAnimation.length-1; i >= 0; i--) {
        pointAnimation[i].show();
        pointAnimation[i].update();

        if (pointAnimation[i].y < -5) {
            pointAnimation.splice(i, 1);
        }
    }
    
    strokeWeight(5);
    for (let i = stars.length-1; i >= 0; i--) {
        stars[i].show();
        stars[i].update();

        if (stars[i].x < -5) {
            stars.splice(i, 1);
        }
    }
}

function pointPlus() {
    pointAnimation.push(new PointAnimation(POINT_POS.x + 80, POINT_POS.y));    
    points++;
}

function loose() {
    document.getElementById('pointScreen').classList.add('pointsIn');
    document.getElementById('pointScreen').classList.remove('scoreInit'); 
    document.getElementById('pointScreen').classList.remove('pointsOut');

    document.getElementById('restart').disabled = false;
    
    document.getElementById('points').innerHTML = points;
    
    gameState = 2;
    noLoop();
}

function scoreRestart() {
    document.getElementById('pointScreen').classList.remove('pointsIn');
    document.getElementById('pointScreen').classList.add('pointsOut');

    document.getElementById('restart').disabled = true;
    restart();

    gameState = 0;
}

function restart() {
    bird = new Bird(height/2);  
    pipes = [];
    stars = [];
    points = 0;
    cycleCount = 1;
    gravity = 0;
    loop();
}

function nextRainbowColor(currentColor = -1) {
    if (currentColor >= RAINBOW_PATTERN.length || currentColor < 0) {
        return 0
    } else {
        return currentColor++;
    }
}

// Pointanimation
class PointAnimation {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    show() {
        text('+1', this.x, this.y);
    }

    update() {
        this.y--;
    }

}

// Stars
class Stars {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    show() {
        strokeWeight(5);
        stroke(255);
        point(this.x, this.y);
    }

    update() {
        this.x -= PIPE_SPEED;
    }

}

// Pipe
class Pipe {
    constructor() {
        this.space = 150;
        this.topSpace = randomIntFromInterval(64, height-this.space-64);
        this.x = width;
        this.width = 40;
        this.speed = PIPE_SPEED;
        this.gotHit = false;
        this.noHit = false;

        function randomIntFromInterval(min,max){
            return Math.floor(Math.random()*(max-min+1)+min);
        }

    }

    show() {
        fill(250);

        rect(this.x, 0, this.width, this.topSpace)
        rect(this.x, this.topSpace+this.space, this.width, height-this.topSpace+this.space)
    }

    update() {
        this.x -= this.speed;
    }

    offscreen() {
        return ( this.x < -this.width );
    }

    done(bird) {
        if (bird.x-bird.size > this.x+this.width && !this.gotHit) {
            this.noHit = true;
            return true;
        }
        return false;
    }

    hit(bird) {
        if ( (bird.y-bird.size/2 < this.topSpace || bird.y+bird.size/2 > this.topSpace+this.space) && !this.gotHit ) {
            if (bird.x+bird.size/2 > this.x && bird.x-bird.size/2 < this.x+this.width) {
                this.gotHit = true;
                return true;
            }
        }
        return false;
    }
}

// Bird
class Bird {

    constructor(y) {
        this.y = y;
        this.x = width/4;
        this.size = 60;
    
        this.velocity = 0;
        this.force = 10;
    
        this.desiredX = random(height);

        this.history = [];
        this.maxHistory = width/(4*PIPE_SPEED);

        this.currentColor = 0
    }

    show() {
        fill(250);
        drawRainbowTail(this.history);
        image(birdSprite, this.x-this.size/2, this.y-this.size/2, this.size, this.size);

        // push();
        // strokeWeight(3);
        // for (let i = 0; i < this.history.length; i++) {
        //     line(this.history[i].x, this.history[i].y-5, this.history[i].x, this.history[i].y+5) ;
            
        // }
        // pop();

        function drawRainbowTail(history) {
            const topPoint = -20;
            const bottomPoint = 25;
            const seperation = (abs(topPoint) + abs(bottomPoint)) / RAINBOW_PATTERN.length;
            let currentSep = 0;

            push();
           
            strokeWeight(6);
            noFill();

            for (let i = 0; i < RAINBOW_PATTERN.length; i++) {
                stroke('#' + RAINBOW_PATTERN[i]);                
                currentSep = topPoint + seperation*i; 
            
                beginShape();
                for (const point of history) {
                    
                    vertex(point.x, point.y + (currentSep));
                }
                endShape();
            }   

            pop();
        }
    }

    up() {
        this.velocity = -this.force;
    }

    update() {
        this.velocity += gravity;
        this.y += this.velocity;

        if (this.velocity > 15)
            this.velocity = 15;

        if (this.y+this.size/2 > height && this.velocity > 0.1)  {
            this.velocity /= -2;
            this.y = height-this.size/2;
            
        }   
        else if (this.y-this.size/2 < 0 && this.velocity < 0) {
            this.velocity /= -10;
            this.y = +this.size/2;
        }

        this.currentColor = (this.currentColor+1) % RAINBOW_PATTERN.length;
        let historyEle = {x: this.x-10, y: this.y, color: RAINBOW_PATTERN[this.currentColor]};
        this.history.push(historyEle)

        if (this.history.length > this.maxHistory) 
            this.history.splice(0, 1);

        for (let i = 0; i < this.history.length; i++) {
            this.history[i].x -= PIPE_SPEED; 
        }
    }
}