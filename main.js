const cube = document.querySelector('#cube');
const wrap = document.querySelector('#cubeWrap');
const historyEl = document.querySelector('#history');
const moveCount = document.querySelector('#moveCount');
const timer = document.querySelector('#timer');
const stateLabel = document.querySelector('#stateLabel');
const colors = { U:'#f7f3e8', D:'#ffd548', F:'#ed5143', B:'#ff8b28', R:'#2476f3', L:'#48ae77' };
const pieces = []; let moves = [], running = false, startedAt = null, sound = false;
let view = { x:-28, y:36 }, drag = null;

function makeCube(){
  for(let x=0;x<3;x++) for(let y=0;y<3;y++) for(let z=0;z<3;z++){
    const el=document.createElement('div'); el.className='cubie';
    const faces={}; if(z===2) faces.F=1; if(z===0) faces.B=1; if(x===2) faces.R=1; if(x===0) faces.L=1; if(y===0) faces.U=1; if(y===2) faces.D=1;
    Object.keys(faces).forEach(face=>{const s=document.createElement('i');s.className=`sticker ${({F:'front',B:'back',R:'right',L:'left',U:'up',D:'down'})[face]}`;s.style.background=colors[face];el.append(s)});
    cube.append(el); pieces.push({el,x,y,z,homeX:x,homeY:y,homeZ:z,rx:0,ry:0,rz:0});
  } render();
}
function render(){pieces.forEach(p=>p.el.style.transform=`translate3d(${p.x*70}px,${p.y*70}px,${p.z*70}px) rotateX(${p.rx}deg) rotateY(${p.ry}deg) rotateZ(${p.rz}deg)`);cube.style.transform=`translate(66px,56px) rotateX(${view.x}deg) rotateY(${view.y}deg)`}
function faceMove(move){
 const name=move[0], inv=move.includes("'"), defs={U:['y',0,1],D:['y',2,-1],R:['x',2,1],L:['x',0,-1],F:['z',2,1],B:['z',0,-1]}; const [axis,layer,base]=defs[name], dir=base*(inv?-1:1);
 const targets=pieces.filter(p=>p[axis]===layer); targets.forEach(p=>{ if(axis==='x'){[p.y,p.z]=dir===1?[2-p.z,p.y]:[p.z,2-p.y];p.rx+=dir*90} if(axis==='y'){[p.x,p.z]=dir===1?[p.z,2-p.x]:[2-p.z,p.x];p.ry+=dir*90} if(axis==='z'){[p.x,p.y]=dir===1?[2-p.y,p.x]:[p.y,2-p.x];p.rz+=dir*90} }); render();
}
function update(){moveCount.textContent=String(moves.length).padStart(3,'0');historyEl.innerHTML=moves.length?moves.map((m,i)=>`<span>${String(i+1).padStart(2,'0')}</span>${m}`).join('<br>'): '<p>Make a move to begin.</p>';historyEl.scrollTop=historyEl.scrollHeight; const solved=pieces.every(p=>p.x===p.homeX&&p.y===p.homeY&&p.z===p.homeZ&&p.rx%360===0&&p.ry%360===0&&p.rz%360===0);stateLabel.textContent=solved?'SOLVED':'MIXED';stateLabel.style.color=solved?'var(--green)':'var(--orange)'}
function beep(){if(!sound)return;const c=new AudioContext(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.frequency.value=230;g.gain.setValueAtTime(.04,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.06);o.start();o.stop(c.currentTime+.06)}
async function turn(move, record=true){if(running)return;running=true;if(!startedAt){startedAt=Date.now();tick()}faceMove(move);beep();if(record){moves.push(move);update()}await new Promise(r=>setTimeout(r,390));running=false}
async function sequence(list){for(const m of list){await turn(m)}}
function tick(){if(startedAt){let s=Math.floor((Date.now()-startedAt)/1000);timer.textContent=`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;requestAnimationFrame(tick)}}
function reset(){pieces.length=0;cube.innerHTML='';moves=[];startedAt=null;timer.textContent='00:00';makeCube();update()}
document.querySelector('#moveControls').addEventListener('click',e=>{const m=e.target.closest('button')?.dataset.move;if(m)turn(m)});
document.querySelector('#scrambleBtn').onclick=()=>{const faces='URFDLB';let last='';const arr=Array.from({length:22},()=>{let f;do{f=faces[Math.floor(Math.random()*6)]}while(f===last);last=f;return f+(Math.random()<.42?"'":'')});sequence(arr)};
document.querySelector('#resetBtn').onclick=reset;document.querySelector('#undoBtn').onclick=async()=>{const m=moves.pop();if(m){await turn(m.endsWith("'")?m[0]:m+"'",false);update()}};
document.querySelector('#playAlgorithm').onclick=()=>{const list=document.querySelector('#algorithm').value.toUpperCase().match(/[URFDLB](?:'|2)?/g)||[];sequence(list.flatMap(m=>m.endsWith('2')?[m[0],m[0]]:[m]))};
document.addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;if(e.code==='Space'){e.preventDefault();document.querySelector('#scrambleBtn').click()}else if(e.key.toLowerCase()==='z')document.querySelector('#undoBtn').click();else if('urfdlb'.includes(e.key.toLowerCase()))turn(e.key.toUpperCase()+(e.shiftKey?"'":''))});
wrap.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,vx:view.x,vy:view.y};wrap.setPointerCapture(e.pointerId)});wrap.addEventListener('pointermove',e=>{if(!drag)return;view.y=drag.vy+(e.clientX-drag.x)*.45;view.x=Math.max(-80,Math.min(80,drag.vx-(e.clientY-drag.y)*.45));render()});wrap.addEventListener('pointerup',()=>drag=null);
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{view=b.dataset.view==='top'?{x:-88,y:0}:b.dataset.view==='front'?{x:0,y:0}:{x:-28,y:36};render()});
document.querySelector('#helpBtn').onclick=()=>document.querySelector('#helpDialog').showModal();document.querySelector('#closeHelp').onclick=()=>document.querySelector('#helpDialog').close();document.querySelector('#soundBtn').onclick=e=>{sound=!sound;e.currentTarget.style.color=sound?'var(--orange)':''};
makeCube();update();
