// Run from the repository root: node tests/regression.cjs
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const elements = new Map();
const element = id => {
    if (!elements.has(id)) elements.set(id, {
        clientWidth: 800, clientHeight: 480, style: {}, listeners: {},
        classList: { toggle() {} }, setAttribute() {},
        addEventListener(name, fn) { this.listeners[name] = fn; }
    });
    return elements.get(id);
};
let seed = 1, layerLines = 0, loops = 0, stops = 0, redraws = 0;
const context = {
    console, Math, ROUND: 'round',
    window: { addEventListener() {} },
    document: { getElementById: element, querySelector: element,
        querySelectorAll: () => [], addEventListener() {}, activeElement: { tagName: 'BODY' } },
    floor: Math.floor, min: Math.min, max: Math.max,
    dist: (x,y,a,b) => Math.hypot(x-a,y-b),
    random(n = 1) { seed = (Math.imul(seed,1664525)+1013904223) >>> 0; return seed / 4294967296 * n; },
    createVector: (x,y) => ({x,y}), millis: () => 500, pixelDensity: () => 1,
    createCanvas(w,h) { context.width=w; context.height=h; return {parent(){},elt:element('canvas')}; },
    resizeCanvas(w,h) { context.width=w; context.height=h; },
    createGraphics(w,h) { return { width:w,height:h,pixelDensity(){},clear(){},stroke(){},strokeWeight(){},line(){layerLines++;},remove(){} }; },
    loop() { loops++; }, noLoop() { stops++; }, redraw() { redraws++; }
};
for (const name of ['frameRate','clear','push','pop','translate','stroke','strokeWeight','strokeCap','noStroke','fill','line','rect','ellipse','rotate','image','noFill','beginShape','vertex','endShape']) context[name]=()=>{};
vm.createContext(context);
for (const file of ['sketch','Snake','Apple','HamiltonCycle']) vm.runInContext(fs.readFileSync(`SnakeGame/${file}.js`,'utf8'),context);
context.assert=assert;
vm.runInContext(`
// Queue order remains stable after many wraps.
const body=new SnakeBody(4);
for(let i=0;i<4;i++)body.push(i);
for(let i=0;i<100;i++){assert.equal(body.shift(),i);body.push(i+4);}
assert.equal(body.get(0),100);assert.equal(body.get(3),103);

setup();
// Persistent clones share only immutable links; modifying a clone cannot mutate its source.
const path=new HPath(hc.cycle[0],hc.cycle[4]);path.addToTail(hc.cycle[1]);
const clone=path.clone();assert.equal(path.link,clone.link);
clone.addToTail(hc.cycle[2]);assert.equal(path.pathLength,1);
assert.equal(clone.getNodeAt(1),hc.cycle[1]);
assert.equal(path.nodesInPath.length,2);assert.equal(clone.nodesInPath.length,3);
assert.equal(clone.nodesInPath,clone.nodesInPath);

// Human apples never start an AI search.
s.controlledByPlayer=true;s.calculatePath=()=>{throw Error('Human pathfinding');};s.ateApple();

// Queue occupancy agrees with a full body scan throughout actual AI movement.
setup();let resets=0;const realSetup=setup;
setup=()=>{resets++;realSetup();};
for(let step=0;step<12000;step++){
    s.update();
    const counts=new Uint16Array(blocksX*blocksY);
    for(let i=0;i<s.tailBlocks.length;i++){
        const node=s.tailBlocks.get(i);counts[node.y*blocksX+node.x]++;
    }
    assert.deepEqual(s.occupied,counts);
    assert.equal(s.dead,false);
}
setup=realSetup;

// Collision wins over length, and entering a vacating tail cell is legal.
let result='';setup=()=>{result=s.dead?'collision':s.weWin?'win':'reset';};
s=new Snake(true);s.x=1;s.y=1;s.tailBlocks=new SnakeBody(blocksX*blocksY);
s.occupied=new Uint16Array(blocksX*blocksY);
for(let i=0;i<blocksX*blocksY-1;i++)s.addTail({x:1,y:1});
s.checkCollisions();assert.equal(result,'collision');
s=new Snake(true);s.x=1;s.y=1;s.playerDirection=1;
s.tailBlocks=new SnakeBody(blocksX*blocksY);s.occupied=new Uint16Array(blocksX*blocksY);
s.addTail({x:2,y:1});s.addTail({x:2,y:2});s.addTail({x:1,y:2});
s.cycle=hc.cycle;s.move();assert.equal(s.snakeTailAtPosition(s.x,s.y),false);
setup=realSetup;setup();

// Preserve the original cycle-boundary search cutoff and fallback behavior.
s.tailBlocks=new SnakeBody(blocksX*blocksY);s.occupied=new Uint16Array(blocksX*blocksY);
for(let i=1;i<hc.cycle.length-1;i++)s.addTail(hc.cycle[i]);
s.x=hc.cycle.at(-1).x;s.y=hc.cycle.at(-1).y;s.addCount=0;
s.apple={x:hc.cycle[0].x,y:hc.cycle[0].y};
s.path=s.getPathBasedOnAStar();assert.equal(s.path,undefined);
assert.equal(s.getNextPosition(),hc.cycle[0]);
s.move();assert.equal(s.x,hc.cycle[0].x);assert.equal(s.y,hc.cycle[0].y);
setup();
`,context);
// Static grid is drawn once, then reused; overlay changes invalidate it.
context.renderBoard(); const initial=layerLines;
assert(initial>0);context.renderBoard();assert.equal(layerLines,initial);
vm.runInContext('showHc=true;renderBoard()',context);assert(layerLines>initial);
const overlay=layerLines;context.renderBoard();assert.equal(layerLines,overlay);
context.togglePause();assert(stops>0);assert.equal(element('pause-overlay').hidden,false);
element('path-toggle').listeners.change({target:{checked:true}});assert(redraws>0);
context.windowResized();context.renderBoard();assert(layerLines>overlay);
context.togglePause();assert(loops>0);assert.equal(element('pause-overlay').hidden,true);
console.log('PASS: ring queue, occupancy, shared path clones, human mode, collision order, tail vacancy, original cycle fallback, overlay caching, pause/resume, paused resize.');
