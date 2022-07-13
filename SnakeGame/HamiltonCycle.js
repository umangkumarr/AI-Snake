class HamiltonianCycle {
    constructor(w, h) {
        this.w = w;
        this.h = h;
        this.createCycle();
    }


    // generate random Hamiltonian Cycle
    createCycle() {
        this.createSpanningTree();


        let cycle = [];
        let cycleNodes = [];
        for (var i = 0; i < this.w; i++) {
            for (var j = 0; j < this.h; j++) {
                cycleNodes.push(new HNode(i, j));
            }
        }
        for (let n of cycleNodes) {
            n.setEdges(cycleNodes);
        }
        for (let i = 0; i < this.spanningTreeNodes.length; i++) {

            let currentSpanningTreeNode = this.spanningTreeNodes[i];

            for (let other of currentSpanningTreeNode.spanningTreeAdjacentNodes) {

                let connectNodes = (x1, y1, x2, y2) => {
                    if (y1 + this.h * (x1) >= cycleNodes.length || y2 + this.h * (x2) >= cycleNodes.length) {
                        return;
                    }
                    let a = cycleNodes[y1 + this.h * (x1)];
                    let b = cycleNodes[y2 + this.h * (x2)];
                    a.spanningTreeAdjacentNodes.push(b);
                    b.spanningTreeAdjacentNodes.push(a);
                };


                let direction = currentSpanningTreeNode.getDirectionTo(other);
                let x = currentSpanningTreeNode.x * 2;
                let y = currentSpanningTreeNode.y * 2;

                if (direction.x === 1) {
                    connectNodes(x + 1, y, x + 2, y);
                    connectNodes(x + 1, y + 1, x + 2, y + 1);
                } else if (direction.y === 1) {
                    connectNodes(x, y + 1, x, y + 2);
                    connectNodes(x + 1, y + 1, x + 1, y + 2);
                }
            }
        }


        //make a list of all the nodes which only have 1 adjacent node
        //then make a list of all the edges we need to add
        let degree1Nodes = cycleNodes.filter((n) => n.spanningTreeAdjacentNodes.length === 1);
        let newEdges = [];
        for (let n of degree1Nodes) {
            //get the direction from the other node to this one
            let d = n.spanningTreeAdjacentNodes[0].getDirectionTo(n);
            //add that direction again to get the next node
            d.x += n.x;
            d.y += n.y;
            //d now points to the new node
            let newEdge = new HEdge(cycleNodes[d.y + this.h * d.x], n);
            let uniqueEdge = true;
            for (let e of newEdges) {
                if (e.isEqualTo(newEdge)) {
                    uniqueEdge = false;
                    break;
                }
            }

            if (uniqueEdge) {
                newEdges.push(newEdge);

            }
        }

        for (let e of newEdges) {
            e.connectNodes();
        }

        //do it again to get the end nodes
        degree1Nodes = cycleNodes.filter((n) => n.spanningTreeAdjacentNodes.length === 1);
        newEdges = [];
        for (let n of degree1Nodes) {
            //
            // let d = n.spanningTreeAdjacentNodes[0].getDirectionTo(n);
            //
            //
            //add that direction again to get the next node
            let d = { x: n.x, y: n.y };
            for (let m of degree1Nodes) {
                if (dist(n.x, n.y, m.x, m.y) === 1) {
                    if (floor(n.x / 2) === floor(m.x / 2) && floor(n.y / 2) === floor(m.y / 2)) {
                        let newEdge = new HEdge(m, n);
                        let uniqueEdge = true;
                        for (let e of newEdges) {
                            if (e.isEqualTo(newEdge)) {
                                uniqueEdge = false;
                                break;
                            }
                        }
                        if (uniqueEdge) {
                            newEdges.push(newEdge);
                        }

                        break;


                    }
                }
            }
        }

        for (let e of newEdges) {
            e.connectNodes();
        }

        cycle = [cycleNodes.getRandomElement()];


        let previous = cycle[0];
        let node = cycle[0].spanningTreeAdjacentNodes[0];

        while (node !== cycle[0]) {

            let next = node.spanningTreeAdjacentNodes[0];
            if (next === previous) {
                next = node.spanningTreeAdjacentNodes[1];
            }

            cycle.push(node);
            previous = node;
            node = next;
        }

        this.cycle = cycle;
        for (let i = 0; i < this.cycle.length; i++) {
            this.cycle[i].cycleNo = i;
        }

    }

    show() {

        for (let i = 0; i < this.cycle.length; i++) {
            push();
            translate(blockSize / 2, blockSize / 2);
            scale(blockSize);
            
            stroke(255, 100);
            strokeWeight(0.1);
            if (i !== this.cycle.length - 1) {
                line(this.cycle[i].x, this.cycle[i].y, this.cycle[i + 1].x, this.cycle[i + 1].y);
            } else {
                line(this.cycle[i].x, this.cycle[i].y, this.cycle[0].x, this.cycle[0].y);
            }
            pop();
        }
    }


    createSpanningTree() {
        let stNodes = [];
        for (var i = 0; i < this.w / 2; i++) {
            for (var j = 0; j < this.h / 2; j++) {
                stNodes.push(new HNode(i, j));
            }
        }

        for (var n of stNodes) {
            n.setEdges(stNodes);
        }

        let spanningTree = [];
        let randomNode = stNodes[floor(random(stNodes.length))];
        spanningTree.push(new HEdge(randomNode, randomNode.edges[0]));
        let nodesInSpanningTree = [randomNode, randomNode.edges[0]];

        let count = 0;

        while (nodesInSpanningTree.length < stNodes.length) {
            randomNode = nodesInSpanningTree.getRandomElement();
            let edges = randomNode.edges.filter((n) => !nodesInSpanningTree.includes(n));
            if (edges.length !== 0) {
                count += 1;
                let randomEdge = edges.getRandomElement();
                nodesInSpanningTree.push(randomEdge);


                spanningTree.push(new HEdge(randomNode, randomEdge));
            }
        }

        for (let n of stNodes) {
            n.setSpanningTreeEdges(spanningTree);
        }



        this.spanningTree = spanningTree;
        this.spanningTreeNodes = stNodes;
    }

    getNextPosition(x, y) {
        for (let i = 0; i < this.cycle.length; i++) {
            if (this.cycle[i].x === x && this.cycle[i].y === y) {
                return this.cycle[(i + 1) % this.cycle.length];
            }
        }
        return null;

    }

    getNodeNo(x, y) {
        for (let i = 0; i < this.cycle.length; i++) {
            if (this.cycle[i].x === x && this.cycle[i].y === y) {
                return i;
            }
        }
        return -1;

    }

    getPossiblePositionsFrom(x, y) {
        let currentNode = this.cycle[this.getNodeNo(x, y)];
        let nodeNos = [];
        for (let n of currentNode.edges) {
            nodeNos.push(this.getNodeNo(n.x, n.y));
        }
        return nodeNos;
    }
}

Array.prototype.getRandomElement = function () {
    return this[floor(random(this.length))];
};

class HNode {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.spanningTreeAdjacentNodes = [];
        this.cycleNo = -1;

        //A* variables
        this.alreadyVisited = false;
        this.shortestDistanceToThisPoint = 0;

    }

    setEdges(allNodes) {
        this.edges = [];
        this.edges = allNodes.filter((n) => (dist(n.x, n.y, this.x, this.y) === 1));
    }

    setSpanningTreeEdges(spanningTree) {
        for (let e of spanningTree) {
            if (e.contains(this)) {
                this.spanningTreeAdjacentNodes.push(e.getOtherNode(this));
            }
        }
    }


    getDirectionTo(other) {
        return { x: other.x - this.x, y: other.y - this.y };
    }

    resetForAStar() {
        this.alreadyVisited = false;
        this.shortestDistanceToThisPoint = 0;
    }

}

class HEdge {
    constructor(node1, node2) {
        this.node1 = node1;
        this.node2 = node2;
    }

    isEqualTo(otherEdge) {
        return (this.node1 === otherEdge.node1 && this.node2 === otherEdge.node2) || (this.node1 === otherEdge.node2 && this.node2 === otherEdge.node1);
    }

    contains(n) {
        return (n === this.node1 || n === this.node2);
    }

    getOtherNode(n) {
        if (n === this.node1) {
            return this.node2;
        } else {
            return this.node1;
        }

    }


    connectNodes() {
        this.node1.spanningTreeAdjacentNodes.push(this.node2);
        this.node2.spanningTreeAdjacentNodes.push(this.node1);
    }
}


class HPath {
    constructor(startingNode, finishingNode) {

        this.pathLength = 0;
        this.nodesInPath = [startingNode];
        this.finishNode = finishingNode;

        this.distanceToApple = 0;
        this.setDistanceToApple();
        this.pathCounter = 0;
    }

    setDistanceToApple() {
        this.distanceToApple = dist(this.finishNode.x, this.finishNode.y, this.getLastNode().x, this.getLastNode().y);
    }

    addToTail(node) {
        this.nodesInPath.push(node);
        this.pathLength += 1;
        this.setDistanceToApple();
    }
    getLastNode() {
        return this.nodesInPath[this.nodesInPath.length - 1];
    }

    getSnakeTailPositionAfterFollowingPath(snake) {

        if (this.pathLength - snake.addCount < snake.tailBlocks.length) {
            return snake.tailBlocks[max(0, this.pathLength - snake.addCount)];
        }
        let tailMoved = this.pathLength - snake.addCount;
        return this.nodesInPath[tailMoved - snake.tailBlocks.length];
    }

    getNextMove() {
        let x = this.nodesInPath[this.pathCounter + 1].x - this.nodesInPath[this.pathCounter].x;
        let y = this.nodesInPath[this.pathCounter + 1].y - this.nodesInPath[this.pathCounter].y;
        this.pathCounter++;
        return { x, y };
    }

    clone() {
        let clone = new HPath(this.nodesInPath[0], this.finishNode);
        clone.nodesInPath = [...this.nodesInPath];
        clone.pathLength = this.pathLength;
        clone.distanceToApple = this.distanceToApple;

        return clone;
    }

}