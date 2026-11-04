let maxBlocks = 1000;
var blockSize, blocksX, blocksY, outlineLength;
let xOffset=0,yOffset=0;
var speedMultiplier=1;
let showHc=false, cyclePinned=false, cycleKeyHeld=false, showPath=false, paUse=false, UserMode=false;
let s,hc, totalMoves=0, applesEaten=0, controlsBound=false, currentSpeed=1;
const speedLevels=[1,2,5,10,25,50];
let pointerStart=null, statsLastUpdated=0;
let gameCanvasInitialized=false;

function setup() {
    const host=document.getElementById('game-stage');
    // p5.js may provide a default window.canvas before setup runs.
    // Only our own initialization flag is authoritative: otherwise the
    // canvas and *all UI button listeners* can be silently skipped.
    if (!gameCanvasInitialized) {
        const gameCanvas = createCanvas(
            Math.max(1, host.clientWidth),
            Math.max(1, host.clientHeight)
        );
        gameCanvas.parent('game-stage');
        gameCanvas.elt.id = 'snake-canvas';
        gameCanvas.elt.style.position = 'absolute';
        gameCanvas.elt.style.inset = '0';
        gameCanvas.elt.style.display = 'block';
        gameCanvas.elt.style.zIndex = '1';
        gameCanvas.elt.style.pointerEvents = 'none';
        gameCanvasInitialized = true;
    }
    // Binding must never depend on the existence of a canvas.
    bindControls();
    setBlocks();
    blockSize=min(width/blocksX,height/blocksY);
    outlineLength=blockSize/15;
    xOffset=(width-blockSize*blocksX)/2;
    yOffset=(height-blockSize*blocksY)/2;
    s=new Snake(UserMode);
    hc=new HamiltonianCycle(blocksX,blocksY);
    s.resetOnHamiltonian(hc.cycle);
    totalMoves=0; applesEaten=0;
    speedMultiplier=currentSpeed;
    frameRate(UserMode?20:40);
    updateUI();
}
function setBlocks() {
    let testBlockSize=1;
    while(testBlockSize<Math.max(width,height)+1) {
        const cols=floor(width/testBlockSize),rows=floor(height/testBlockSize);
        if(cols*rows<maxBlocks && cols>=4 && rows>=4) {
            blocksX=cols-cols%2; blocksY=rows-rows%2;
            return;
        }
        testBlockSize++;
    }
    // Protect Hamiltonian generation on very small displays.
    blocksX=4;blocksY=4;
}
function bindControls() {
    if(controlsBound) return;
    controlsBound=true;
    document.getElementById('mode-ai').addEventListener('click',()=>setMode(false));
    document.getElementById('mode-human').addEventListener('click',()=>setMode(true));
    document.getElementById('pause-button').addEventListener('click',togglePause);
    document.getElementById('restart-button').addEventListener('click',()=>setup());
    document.getElementById('cycle-toggle').addEventListener('change',e=>{cyclePinned=e.target.checked;showHc=cyclePinned||cycleKeyHeld;});
    document.getElementById('path-toggle').addEventListener('change',e=>showPath=e.target.checked);
    document.getElementById('speed-select').addEventListener('input',e=>{
        currentSpeed=speedLevels[Number(e.target.value)];
        speedMultiplier=currentSpeed;
        document.getElementById('speed-label').textContent=currentSpeed+'×';
    });
    document.querySelectorAll('[data-direction]').forEach(b=>b.addEventListener('click',()=>{
        if(UserMode) s.playerDirection=Number(b.dataset.direction);
    }));
    const stage=document.getElementById('game-stage');
    stage.addEventListener('touchstart',e=>{
        const t=e.changedTouches[0];
        pointerStart={x:t.clientX,y:t.clientY};
    },{passive:true});
    stage.addEventListener('touchend',e=>{
        if(!pointerStart||!UserMode)return;
        const t=e.changedTouches[0],dx=t.clientX-pointerStart.x,dy=t.clientY-pointerStart.y;
        pointerStart=null;
        if(Math.max(Math.abs(dx),Math.abs(dy))<20)return;
        s.playerDirection=Math.abs(dx)>Math.abs(dy)?(dx>0?1:3):(dy>0?2:0);
    },{passive:true});
}
function setMode(mode) {
    if(UserMode===mode)return;
    UserMode=mode;
    setup(); // Preserve existing behavior: mode switching restarts.
}
function togglePause(){paUse=!paUse;updateUI();}
function updateUI(){
    if(!s)return;
    document.getElementById('stat-score').textContent=applesEaten.toLocaleString();
    document.getElementById('stat-moves').textContent=totalMoves.toLocaleString();
    document.getElementById('stat-length').textContent=(s.tailBlocks.length+1).toLocaleString();
    document.getElementById('stat-cells').textContent=(blocksX*blocksY).toLocaleString();
    for(const [id,active] of [['mode-ai',!UserMode],['mode-human',UserMode]]){
        const el=document.getElementById(id);
        el.classList.toggle('active',active);
        el.setAttribute('aria-pressed',String(active));
    }
    document.getElementById('status-label').textContent=paUse?'PAUSED':UserMode?'HUMAN PLAYING':'AI RUNNING';
    document.getElementById('pause-overlay').hidden=!paUse;
    document.getElementById('pause-button').textContent=paUse?'▶ Resume':'Ⅱ Pause';
    document.getElementById('touch-controls').hidden=!UserMode;
}
function draw(){
    if(paUse)return;
    background(13,21,29);
    push();translate(xOffset,yOffset);
    noStroke();fill(17,29,37);rect(0,0,blocksX*blockSize,blocksY*blockSize);
    stroke(42,62,73,110);strokeWeight(.6);
    for(let x=1;x<blocksX;x++)line(x*blockSize,0,x*blockSize,blocksY*blockSize);
    for(let y=1;y<blocksY;y++)line(0,y*blockSize,blocksX*blockSize,y*blockSize);
    if(showHc)hc.show();
    if(showPath&&!UserMode&&s.path){
        noFill();stroke(137,214,248,205);strokeWeight(max(1,blockSize*.18));
        beginShape();
        vertex((s.x+.5)*blockSize,(s.y+.5)*blockSize);
        for(let i=s.path.pathCounter+1;i<s.path.nodesInPath.length;i++){
            const n=s.path.nodesInPath[i];
            vertex((n.x+.5)*blockSize,(n.y+.5)*blockSize);
        }
        endShape();
    }
    s.show();pop();
    for(let i=0;i<speedMultiplier;i++){s.update();totalMoves++;}
    if(millis()-statsLastUpdated>160){updateUI();statsLastUpdated=millis();}
}
function windowResized(){
    const host=document.getElementById('game-stage');
    if(!host)return;
    resizeCanvas(host.clientWidth,host.clientHeight);
    blockSize=min(width/blocksX,height/blocksY);
    outlineLength=blockSize/15;
    xOffset=(width-blockSize*blocksX)/2;
    yOffset=(height-blockSize*blocksY)/2;
}
function keyPressed(){
    const pressed=['ArrowUp','ArrowRight','ArrowDown','ArrowLeft',' '].includes(key)?key:key.toLowerCase();
    switch(pressed){
        case ' ':speedMultiplier=50;return false;
        case 'h':cycleKeyHeld=true;showHc=true;break;
        case 'p':togglePause();break;
        case 'u':setMode(!UserMode);break;
        case 'ArrowUp':s.playerDirection=0;return false;
        case 'ArrowRight':s.playerDirection=1;return false;
        case 'ArrowDown':s.playerDirection=2;return false;
        case 'ArrowLeft':s.playerDirection=3;return false;
    }
}
function keyReleased(){
    switch(key){
        case ' ':speedMultiplier=currentSpeed;return false;
        case 'h':cycleKeyHeld=false;showHc=cyclePinned;break;
    }
}