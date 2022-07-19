
let maxBlocks = 1000;
var blockSize;
var blocksX;
var blocksY;
var outlineLength;
let xOffset = 0;
let yOffset = 0;
var speedMultiplier = 1;
let titleText;
let showHc = false;
let paUse = false;
let UserMode = false;

function preload() {
    titleText = loadImage("SnakeGame/image/t2.png");
}

function setup() {

    window.canvas = createCanvas(windowWidth, windowHeight)
    canvas.position(0, 0);
    window.canvas.style('z-index', 1)

    setBlocks();

    blockSize = min(width / blocksX, height / blocksY);
    outlineLength = blockSize / 15;
    xOffset = (width - blockSize * blocksX) / 2.0;
    yOffset = (height - blockSize * blocksY) / 2.0;

    s = new Snake(UserMode);

    hc = new HamiltonianCycle(blocksX, blocksY);
    s.resetOnHamiltonian(hc.cycle);

    frameRate(40);
    if (UserMode) {
        frameRate(20);
    }
}

// set the block size
function setBlocks() {

    let testBlockSize = 1;
    while (true) {
        if (floor(canvas.width / testBlockSize) * floor(canvas.height / testBlockSize) < maxBlocks) {

            blockSize = testBlockSize;
            blocksX = floor(canvas.width / blockSize) - floor(canvas.width / blockSize) % 2;
            blocksY = floor(canvas.height / blockSize) - floor(canvas.height / blockSize) % 2;
            return;
        } else {
            testBlockSize++;
        }
    }
}



function draw() {

    if (!paUse) {
        background(20);

        noStroke();

        // background image
        let newImageWidth = canvas.width - 2 * xOffset;
        newImageWidth *= 0.6;
        let widthRatio = newImageWidth / titleText.width;
        let newImageHeight = titleText.height * widthRatio;
        image(titleText, canvas.width / 2 - newImageWidth / 2, canvas.height / 2 - newImageHeight / 2, newImageWidth, newImageHeight);
        fill(20, 200);
        rect(canvas.width / 2 - newImageWidth / 2, canvas.height / 2 - newImageHeight / 2, newImageWidth, newImageHeight)

        fill(15);
        rect(0, 0, xOffset, height);
        rect(width, height, -xOffset, -height);

        push();
        translate(xOffset, yOffset);
        fill(0);
        s.show();
        if (showHc) {
            hc.show();
        }

        for (let i = 0; i < speedMultiplier; i++) {
            s.update();
        }

        pop();
    }
}


function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    blockSize = min(width / blocksX, height / blocksY);
    outlineLength = blockSize / 15;
    xOffset = (width - blockSize * blocksX) / 2.0;
    yOffset = (height - blockSize * blocksY) / 2.0;
};

function keyPressed(keyCode) {
    switch (key) {
        case ' ':
            speedMultiplier = 50;
            break;

        case 'h':
            showHc = true;
            break;

        case 'p':
            paUse ^= 1;
            break;

        case 'u' || 'U':
            UserMode ^= 1;
            setup();
            break;

        case 'ArrowUp':
            s.playerDirection = 0;
            break;

        case 'ArrowRight':
            s.playerDirection = 1;
            break;

        case 'ArrowDown':
            s.playerDirection = 2;
            break;

        case 'ArrowLeft':
            s.playerDirection = 3;
            break;
    }
}

function keyReleased() {
    switch (key) {
        case ' ':
            speedMultiplier = 1;
            break;

        case 'h':
            showHc = false;
            break;
    }
}