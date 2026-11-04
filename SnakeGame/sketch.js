let maxBlocks = 1000;
var blockSize, blocksX, blocksY, outlineLength;
let xOffset=0,yOffset=0;
var speedMultiplier=1;
let showHc=false, cyclePinned=false, cycleKeyHeld=false, showPath=false, paUse=false, UserMode=false;
let s,hc, totalMoves=0, applesEaten=0, controlsBound=false, currentSpeed=1;
const speedLevels=[1,2,5,10,25,50];
let pointerStart=null, statsLastUpdated=0;
let gameCanvasInitialized=false;
let boardLayer=null, cachedCycle=null, cachedShowCycle=null;

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
    cachedCycle=null;
    updateUI();
    if(paUse){noLoop();redraw();}else loop();
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
    document.getElementById('resume-button').addEventListener('click',togglePause);
    document.addEventListener('keydown',e=>{if(e.key==='Escape'){const panel=document.getElementById('settings');if(panel.open&&panel.contains(document.activeElement))panel.querySelector('summary').focus();panel.open=false;}});
    document.addEventListener('pointerdown',e=>{const panel=document.getElementById('settings');if(!panel.contains(e.target))panel.open=false;});
    document.querySelectorAll('button').forEach(button=>button.addEventListener('click',e=>{if(e.detail>0)button.blur();}));
    document.getElementById('restart-button').addEventListener('click',()=>{paUse=false;setup();});
    document.getElementById('cycle-toggle').addEventListener('change',e=>{cyclePinned=e.target.checked;showHc=cyclePinned||cycleKeyHeld;requestRender();});
    document.getElementById('path-toggle').addEventListener('change',e=>{showPath=e.target.checked;requestRender();});
    document.getElementById('speed-select').addEventListener('input',e=>{
        currentSpeed=speedLevels[Number(e.target.value)];
        speedMultiplier=currentSpeed;
        document.getElementById('speed-label').textContent=currentSpeed+'×';
        e.target.setAttribute('aria-valuetext',currentSpeed+' times');
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
    paUse=false;
    setup(); // Preserve existing behavior: mode switching restarts.
}
function requestRender(){if(paUse)redraw();}
function togglePause(){paUse=!paUse;updateUI();if(paUse){noLoop();redraw();}else loop();}
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
    document.getElementById('status-label').textContent=paUse?'Paused':UserMode?'You’re playing':'AI playing';
    document.querySelector('.status').classList.toggle('is-paused',paUse);
    document.getElementById('game-stage').classList.toggle('human-mode',UserMode);
    document.getElementById('board-tip').innerHTML=UserMode?'Arrow keys or swipe to move':'Press <kbd>U</kbd> to take control';
    document.getElementById('path-toggle').disabled=UserMode;
    document.getElementById('pause-overlay').hidden=!paUse;
    document.getElementById('pause-label').textContent=paUse?'Resume':'Pause';
    const pauseButton=document.getElementById('pause-button');
    pauseButton.classList.toggle('is-paused',paUse);
    pauseButton.setAttribute('title',(paUse?'Resume':'Pause')+' (P)');
    pauseButton.setAttribute('aria-pressed',String(paUse));
    document.getElementById('touch-controls').hidden=!UserMode;
}
function draw(){
    renderBoard();
    if(paUse)return;
    for(let i=0;i<speedMultiplier;i++){s.update();totalMoves++;}
    if(millis()-statsLastUpdated>160){updateUI();statsLastUpdated=millis();}
}
function renderBoard(){
    clear();
    push();translate(xOffset,yOffset);
    if(!boardLayer || boardLayer.width!==width || boardLayer.height!==height){
        if(boardLayer)boardLayer.remove();
        boardLayer=createGraphics(width,height);
        boardLayer.pixelDensity(pixelDensity());
        cachedCycle=null;
    }
    if(cachedCycle!==hc || cachedShowCycle!==showHc){
        boardLayer.clear();
        boardLayer.stroke(155,143,119,9);boardLayer.strokeWeight(.6);
        for(let x=1;x<blocksX;x++)boardLayer.line(x*blockSize,0,x*blockSize,blocksY*blockSize);
        for(let y=1;y<blocksY;y++)boardLayer.line(0,y*blockSize,blocksX*blockSize,y*blockSize);
        if(showHc){
            boardLayer.stroke(255,100);boardLayer.strokeWeight(blockSize*.1);
            for(let i=0;i<hc.cycle.length;i++){
                const a=hc.cycle[i],b=hc.cycle[(i+1)%hc.cycle.length];
                boardLayer.line((a.x+.5)*blockSize,(a.y+.5)*blockSize,(b.x+.5)*blockSize,(b.y+.5)*blockSize);
            }
        }
        cachedCycle=hc;cachedShowCycle=showHc;
    }
    image(boardLayer,0,0);
    if(showPath&&!UserMode&&s.path){
        noFill();stroke(164,151,123,205);strokeWeight(max(1,blockSize*.18));
        beginShape();
        vertex((s.x+.5)*blockSize,(s.y+.5)*blockSize);
        for(let i=s.path.pathCounter+1;i<s.path.nodesInPath.length;i++){
            const n=s.path.nodesInPath[i];
            vertex((n.x+.5)*blockSize,(n.y+.5)*blockSize);
        }
        endShape();
    }
    s.show();pop();
}
function windowResized(){
    const host=document.getElementById('game-stage');
    if(!host)return;
    resizeCanvas(host.clientWidth,host.clientHeight);
    blockSize=min(width/blocksX,height/blocksY);
    outlineLength=blockSize/15;
    xOffset=(width-blockSize*blocksX)/2;
    yOffset=(height-blockSize*blocksY)/2;
    cachedCycle=null;
    requestRender();
}
function keyPressed(event){
    if (/^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement.tagName) || event?.ctrlKey || event?.metaKey || event?.altKey) return;
    if ((key===' '||key==='Enter') && /^(BUTTON|SUMMARY|A)$/.test(document.activeElement.tagName)) return;
    const pressed=['ArrowUp','ArrowRight','ArrowDown','ArrowLeft',' '].includes(key)?key:key.toLowerCase();
    switch(pressed){
        case ' ':speedMultiplier=50;return false;
        case 'h':cycleKeyHeld=true;showHc=true;requestRender();break;
        case 'p':if(!event?.repeat)togglePause();break;
        case 'u':if(!event?.repeat)setMode(!UserMode);break;
        case 'a':if(!event?.repeat)setMode(false);break;
        case 'r':if(!event?.repeat){paUse=false;setup();}break;
        case 's':if(!event?.repeat){const panel=document.getElementById('settings');panel.open=!panel.open;}break;
        case 'ArrowUp':s.playerDirection=0;return false;
        case 'ArrowRight':s.playerDirection=1;return false;
        case 'ArrowDown':s.playerDirection=2;return false;
        case 'ArrowLeft':s.playerDirection=3;return false;
    }
}
function keyReleased(){
    switch(key.length===1?key.toLowerCase():key){
        case ' ':speedMultiplier=currentSpeed;return false;
        case 'h':cycleKeyHeld=false;showHc=cyclePinned;requestRender();break;
    }
}
// Releasing focus must also release temporary keyboard controls.
window.addEventListener('blur',()=>{cycleKeyHeld=false;showHc=cyclePinned;speedMultiplier=currentSpeed;requestRender();});
