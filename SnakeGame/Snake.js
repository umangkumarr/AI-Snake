class Snake {
    constructor(UserMode) {
        this.x = floor(blocksX / 2);
        this.y = floor(blocksY / 2);
        this.tailBlocks = [];
        this.tailBlocks.push(createVector(this.x - 3, this.y));
        this.tailBlocks.push(createVector(this.x - 2, this.y));
        this.tailBlocks.push(createVector(this.x - 1, this.y));
        this.velX = 1;
        this.velY = 0;
        this.apple = new Apple(this);
        this.addCount = 0;
        this.dead = false;

        this.path;
        this.weWin = false;

        this.controlledByPlayer = UserMode;
        this.playerDirection = 0;
        this.dx = [0, 1, 0, -1]
        this.dy = [-1, 0, 1, 0]
    }

    // reset game
    resetOnHamiltonian(cycle) {
        this.cycle = cycle;
        this.tailBlocks = [];
        this.tailBlocks.push(createVector(cycle[0].x, cycle[0].y));
        this.tailBlocks.push(createVector(cycle[1].x, cycle[1].y));
        this.tailBlocks.push(createVector(cycle[2].x, cycle[2].y));
        this.x = cycle[3].x;
        this.y = cycle[3].y;
        this.apple = new Apple(this);
        this.headCyclePosition = 3;
        this.tailCyclePosition = 0;

    }

    // draw snake
    show() {
        fill(0, 180, 0);
        noStroke();

        rect((this.x + this.tailBlocks[this.tailBlocks.length - 1].x) * blockSize / 2.0 + outlineLength, (this.y + this.tailBlocks[this.tailBlocks.length - 1].y) * blockSize / 2.0 + outlineLength, blockSize - outlineLength * 2, blockSize - outlineLength * 2);
        for (var i = 0; i < this.tailBlocks.length; i++) {
            rect(this.tailBlocks[i].x * blockSize + outlineLength, this.tailBlocks[i].y * blockSize + outlineLength, blockSize - outlineLength * 2, blockSize - outlineLength * 2);
            if (i < this.tailBlocks.length - 1) {
                let x = (this.tailBlocks[i].x + this.tailBlocks[i + 1].x) / 2 * blockSize;
                let y = (this.tailBlocks[i].y + this.tailBlocks[i + 1].y) / 2 * blockSize;
                rect(x + outlineLength, y + outlineLength, blockSize - outlineLength * 2, blockSize - outlineLength * 2);
            }
        }

        if (!this.weWin) {
            this.apple.show();
        }

    }


    move() {
        if (this.weWin)
            return;
        if (!this.controlledByPlayer) {

            // on complete traversal find the new path to the apple
            if (!this.path || this.path.pathCounter >= this.path.pathLength) {
                this.calculatePath();

            }

            if (!this.path || this.path.pathLength === 0) { // if no path available move to the next shortest node in the hamiltonian cycle
                let nextPos = this.getNextPosition();
                this.velX = nextPos.x - this.x;
                this.velY = nextPos.y - this.y;
            } else {
                let nextMove = this.path.getNextMove();
                this.velX = nextMove.x;
                this.velY = nextMove.y;
            }
        } else {
            this.velX = this.dx[this.playerDirection];
            this.velY = this.dy[this.playerDirection];
        }


        if (this.addCount <= 0) {
            this.tailBlocks.splice(0, 1);
            this.tailCyclePosition = (this.tailCyclePosition + 1) % this.cycle.length;

        } else {
            this.addCount--;

        }
        this.tailBlocks.push(createVector(this.x, this.y));
        this.x = (this.x + this.velX + blocksX) % blocksX;
        this.y = (this.y + this.velY + blocksY) % blocksY;
    }

    getNextPosition() {
        this.appleCyclePosition = hc.getNodeNo(this.apple.x, this.apple.y);
        let possibleNextPositions = hc.getPossiblePositionsFrom(this.x, this.y);
        let minDiist = 100000;
        let minIndex = 0;
        for (let i = 0; i < possibleNextPositions.length; i++) {

            let distance = this.appleCyclePosition - possibleNextPositions[i];
            while (distance < 0) {
                distance += this.cycle.length;
            }

            if (this.overTakesTail(this.cycle[possibleNextPositions[i]])) {
                continue;
            }

            if (distance < minDiist) {
                minDiist = distance;
                minIndex = i;
            }

        }
        if (minDiist === 100000) {
            return this.cycle[(hc.getNodeNo(this.x, this.y) + 1) % this.cycle.length];
        }

        return this.cycle[possibleNextPositions[minIndex]];


    }

    // check if the newpos over takes the tail
    overTakesTail(newPos, h, t) {
        const minDistanceBetweenHeadAndTail = 50; // Preserve original AI safety margin.
        let head;
        if (h) {
            head = h.cycleNo;
        } else {
            head = hc.getNodeNo(this.x, this.y);
        }

        let actualTail;
        if (t) {
            actualTail = hc.getNodeNo(t.x, t.y);

        } else {
            actualTail = hc.getNodeNo(this.tailBlocks[0].x, this.tailBlocks[0].y);
        }

        if (this.getDistanceBetweenPoints(head, actualTail) <= minDistanceBetweenHeadAndTail + this.addCount) {
            return true;
        }

        let tail = actualTail - minDistanceBetweenHeadAndTail - this.addCount;
        if (tail < 0) {
            tail += this.cycle.length;
        }

        let temp = head;
        let nextPosNo = newPos.cycleNo;
        if (this.getDistanceBetweenPoints(head, newPos.cycleNo) >= this.getDistanceBetweenPoints(head, (tail))) {
            return true;
        }

        return false;
    }

    // Binary min-heap: maintains the same A* score ordering as the old
    // full-array sort while reducing each insertion/removal to O(log n).
    // Stable sequence numbers preserve FIFO behavior for equal scores.
    makePathQueue() {
        const heap=[];
        let sequence=0;
        const less=(a,b)=>a.score<b.score||(a.score===b.score&&a.order<b.order);
        return {
            push(path) {
                const item={path,score:path.distanceToApple+path.pathLength,order:sequence++};
                let i=heap.length;
                heap.push(item);
                while(i>0){
                    const p=(i-1)>>1;
                    if(!less(item,heap[p]))break;
                    heap[i]=heap[p];i=p;
                }
                heap[i]=item;
            },
            pop() {
                if(!heap.length)return undefined;
                const first=heap[0].path,last=heap.pop();
                if(heap.length){
                    let i=0;
                    while(true){
                        const l=i*2+1;
                        if(l>=heap.length)break;
                        const r=l+1;
                        const child=r<heap.length&&less(heap[r],heap[l])?r:l;
                        if(!less(heap[child],last))break;
                        heap[i]=heap[child];i=child;
                    }
                    heap[i]=last;
                }
                return first;
            },
            get length(){return heap.length;}
        };
    }

    // get new path based on A* star
    getPathBasedOnAStar() {
        for (let n of this.cycle) {
            n.resetForAStar();
        }
        this.appleCyclePosition = hc.getNodeNo(this.apple.x, this.apple.y);

        let startNode = this.cycle[hc.getNodeNo(this.x, this.y)];
        let bigList = this.makePathQueue();

        let winningPath;

        let startingPath = new HPath(startNode, this.cycle[this.appleCyclePosition]);

        bigList.push(startingPath);


        while (true) {
            // print(bigList.length);
            if (bigList.length === 0) {
                return winningPath;
            }
            let currentPath = bigList.pop();
            if (winningPath && currentPath.pathLength >= winningPath.pathLength) {
                continue;
            }

            if (currentPath.distanceToApple === 0) {//path has found apple

                if (winningPath == null || currentPath.pathLength < winningPath.pathLength) {
                    winningPath = currentPath.clone();
                }
                continue;
            }


            //if the final node has been visited and the previous visit was a shorter path then leave this path
            let finalNodeInPath = currentPath.getLastNode();

            if (!finalNodeInPath.alreadyVisited || currentPath.pathLength < finalNodeInPath.shortestDistanceToThisPoint) {

                //this is the shortest found path to this point
                finalNodeInPath.alreadyVisited = true;
                finalNodeInPath.shortestDistanceToThisPoint = currentPath.pathLength;

                //now we need to add all the paths possible from this node to the bigList
                for (var n of finalNodeInPath.edges) {

                    if (this.overTakesTail(n, finalNodeInPath, currentPath.getSnakeTailPositionAfterFollowingPath(this))) {
                        if (n.cycleNo !== finalNodeInPath.cycleNo + 1) {
                            continue;
                        }
                    }

                    let p = currentPath.clone();
                    p.addToTail(n);
                    if (p.getLastNode().alreadyVisited && p.pathLength > p.getLastNode().shortestDistanceToThisPoint) {
                        continue;
                    }
                    bigList.push(p);
                }
            }

            //now we need to sort the bigList based on the distances to the apple plus the current distance of the path
            // The priority queue keeps the open set ordered without re-sorting.
        }
    }

    getDistanceBetweenPoints(from, to) {

        let distance = to - from;
        while (distance < 0) {
            distance += this.cycle.length;
        }
        return distance;
    }

    update() {
        if (!this.dead) {
            this.move();
            this.checkCollisions();
        }

    }

    checkCollisions() {

        // if no space left on the board restart
        if (blocksX * blocksY - (this.tailBlocks.length + 1) <= 0) {
            this.weWin = true;
            setup();
            return;
        }

        // check if the snake is over its body
        for (var i = 0; i < this.tailBlocks.length; i++) {
            if (this.tailBlocks[i].x === this.x && this.tailBlocks[i].y === this.y) {
                this.dead = true;
                setup();
                return;
            }
        }

        // check if the snake is within the boundaries
        if (this.x < 0 || this.x >= blocksX || this.y < 0 || this.y >= blocksY) {
            this.dead = true;
            setup();
            return;
        }

        // snake ate an apple
        if (this.x === this.apple.x && this.y === this.apple.y) {
            this.ateApple();
        }

    }


    ateApple() {
        this.addCount += 2;
        this.apple = new Apple(this);
        applesEaten++;
        this.calculatePath();

    }


    calculatePath() {
        this.path = this.getPathBasedOnAStar();
    }

    isAppleOnSnake(a) {
        return this.snakeAtPosition(a.x, a.y);
    }

    snakeAtPosition(x, y) {
        return this.snakeTailAtPosition(x, y) || (this.x == x && this.y == y);
    }

    snakeTailAtPosition(x, y) {
        for (var i = 0; i < this.tailBlocks.length; i++) {
            if (this.tailBlocks[i].x == x && this.tailBlocks[i].y == y) {
                return true;
            }
        }
        return false;
    }
}

