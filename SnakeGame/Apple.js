class Apple {
    constructor(snake) {
        this.x = floor(random(blocksX));
        this.y = floor(random(blocksY));

        while (snake.isAppleOnSnake(this)) {
            this.x = floor(random(blocksX));
            this.y = floor(random(blocksY));
        }

        // Avoid console output on every apple spawn.
    }

    show() {
        noStroke();
        fill(187, 116, 95);
        rect(this.x * blockSize + blockSize * .17, this.y * blockSize + blockSize * .17,
            blockSize * .66, blockSize * .66, blockSize * .22);
    }
};