class Apple {
    constructor(snake) {
        this.x = floor(random(blocksX));
        this.y = floor(random(blocksY));

        while (snake.isAppleOnSnake(this)) {
            this.x = floor(random(blocksX));
            this.y = floor(random(blocksY));
        }

        print(this);
    }

    show() {
        noStroke();
        fill(200, 0, 0);
        push();
        translate(this.x * blockSize + outlineLength, this.y * blockSize + outlineLength);
        scale((blockSize - 2 * outlineLength) / 3.0);
        rect(1, 0, 1, 1);
        rect(1, 2, 1, 1);
        rect(0, 1, 1, 1);
        rect(2, 1, 1, 1);
        pop();
    }
};