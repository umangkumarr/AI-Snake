// Logic-only benchmark. Run from the repository root: node tests/benchmark.cjs
const fs=require('fs'),vm=require('vm'),{performance}=require('perf_hooks');
const context={console,performance,Math,floor:Math.floor,max:Math.max,min:Math.min,dist:(x,y,a,b)=>Math.hypot(x-a,y-b),createVector:(x,y)=>({x,y}),window:{addEventListener(){}}};vm.createContext(context);
for(const f of ['sketch','Snake','Apple','HamiltonCycle'])vm.runInContext(fs.readFileSync('SnakeGame/'+f+'.js','utf8'),context);
vm.runInContext(`
let seed=1;function random(n=1){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296*n;}
const originalSearch=Snake.prototype.getPathBasedOnAStar;
let searches=[],deaths=0,wins=0,peakLength=0,clones=0;
Snake.prototype.getPathBasedOnAStar=function(){const t=performance.now();try{return originalSearch.call(this)}finally{searches.push(performance.now()-t)}};
const originalClone=HPath.prototype.clone;HPath.prototype.clone=function(){clones++;return originalClone.call(this)};
function setup(){if(s?.dead)deaths++;if(s?.weWin)wins++;s=new Snake(false);hc=new HamiltonianCycle(blocksX,blocksY);s.resetOnHamiltonian(hc.cycle);}
function quantile(a,q){return a.length?a.slice().sort((a,b)=>a-b)[Math.min(a.length-1,Math.floor(a.length*q))]:0;}
function bench(w,h,inputSeed){seed=inputSeed;blocksX=w;blocksY=h;searches=[];clones=0;deaths=0;wins=0;s=null;applesEaten=0;peakLength=0;const init=performance.now();setup();const initMs=performance.now()-init;const updates=[];const start=performance.now();let steps=0;for(;steps<100000;steps++){const t=performance.now();s.update();updates.push(performance.now()-t);peakLength=Math.max(peakLength,s.tailBlocks.length+1);if(performance.now()-start>12000)break;}return {board:w+'x'+h,seed:inputSeed,steps,initMs,elapsedMs:performance.now()-start,updateP50:quantile(updates,.5),updateP95:quantile(updates,.95),updateP99:quantile(updates,.99),updateMax:Math.max(...updates),searches:searches.length,searchP50:quantile(searches,.5),searchP95:quantile(searches,.95),searchMax:Math.max(0,...searches),clones,apples:applesEaten,peakLength,deaths,wins};}
`,context);
for(const [w,h] of [[40,24]])for(const seed of [1,2]){console.log(JSON.stringify(vm.runInContext(`bench(${w},${h},${seed})`,context)))}
