"use strict";
const $=id=>document.getElementById(id);
const mod=(a,m)=>((a%m)+m)%m;
const tok=n=>getComputedStyle(document.documentElement).getPropertyValue('--'+n).trim();
function inv(x,p){if(x===0)return 0;let a=x,b=p,u=1,w=0;while(b){const t=Math.floor(a/b);[a,b]=[b,a-t*b];[u,w]=[w,u-t*w];}return mod(u,p);}
const circ=(i,n)=>[0.5+0.44*Math.cos(-Math.PI/2+2*Math.PI*i/n),0.5+0.44*Math.sin(-Math.PI/2+2*Math.PI*i/n)];

/* ---------- levels: each is a D-regular graph given by nbr(v,i) and a layout ---------- */
function mk(o){const nb=new Int32Array(o.N*o.D);for(let v=0;v<o.N;v++)for(let i=0;i<o.D;i++)nb[v*o.D+i]=o.f(v,i);o.nb=nb;o.pos=[];for(let v=0;v<o.N;v++)o.pos.push(o.lay(v));
  if(o.norm){const xs=o.pos.map(p=>p[0]),ys=o.pos.map(p=>p[1]);const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);const sc=Math.max(x1-x0,y1-y0);
    o.pos=o.pos.map(([x,y])=>[0.06+0.88*(x-x0)/sc+0.44*(1-(x1-x0)/sc),0.06+0.88*(y-y0)/sc+0.44*(1-(y1-y0)/sc)]);}
  return o;}
const P=29,TM=11;
const DIR=[[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]];
function lpsLine(p,q){const pw=(x,e)=>{let r=1;x%=q;while(e){if(e&1)r=r*x%q;x=x*x%q;e>>=1;}return r;};let I=0;for(let x=1;x<q;x++)if(x*x%q===q-1){I=x;break;}
  const gens=[],R=Math.floor(Math.sqrt(p));for(let a0=1;a0<=R;a0+=2)for(let a1=-R;a1<=R;a1++)for(let a2=-R;a2<=R;a2++)for(let a3=-R;a3<=R;a3++)if(a0*a0+a1*a1+a2*a2+a3*a3===p)gens.push([a0,a1,a2,a3]);
  const mats=gens.map(([a0,a1,a2,a3])=>[mod(a0+I*a1,q),mod(a2+I*a3,q),mod(-a2+I*a3,q),mod(a0-I*a1,q)]);
  const f=(z,i)=>{const[a,b,c,d]=mats[i];if(z===q)return c===0?q:a*pw(c,q-2)%q;const num=(a*z+b)%q,den=(c*z+d)%q;return den===0?q:num*pw(den,q-2)%q;};
  return{gens,f,I};}
const LQ=89,LPS=lpsLine(5,LQ);
const LEVELS=[
  mk({id:'cube',tag:'Warm-up',name:'Hypercube Q₄',N:16,D:4,
    desc:'Vertices are 4-bit strings; edge i flips bit i. Diameter 4, so every pair is close. A gentle start.',
    f:(v,i)=>v^(1<<i),norm:true,lay:v=>{let x=0,y=0;for(let b=0;b<4;b++)if(v>>b&1){const a=Math.PI*b/4+0.3;x+=Math.cos(a);y+=Math.sin(a);}return[x,y];},label:v=>v.toString(2).padStart(4,'0')}),
  mk({id:'lazy',tag:'Original · 4.26',name:'Lazy 29-cycle',N:P,D:3,
    desc:'Edges x+1, x−1 and a self-loop. λ → 1: far pairs need up to 14 steps.',
    f:(x,i)=>i===0?(x+1)%P:i===1?mod(x-1,P):x,lay:v=>circ(v,P),label:v=>String(v)}),
  mk({id:'chord',tag:'Construction 4.26',name:'29-cycle + inverse chords',N:P,D:3,
    desc:'Edges x+1, x−1 and x⁻¹ mod 29. The inverse chords cut across the cycle. Use edge 3 to jump.',
    f:(x,i)=>i===0?(x+1)%P:i===1?mod(x-1,P):inv(x,P),lay:v=>circ(v,P),label:v=>String(v)}),
  mk({id:'grid',tag:'Original · 4.25',name:'Grid torus Z₁₁² (shifts)',N:TM*TM,D:5,
    desc:'Edges stay, x±1, y±1 on an 11 × 11 torus. Only local moves: distance is the wrap-around Manhattan distance.',
    f:(v,i)=>{const x=Math.floor(v/TM),y=v%TM;const L=[[x,y],[x+1,y],[x,y+1],[x-1,y],[x,y-1]][i];return mod(L[0],TM)*TM+mod(L[1],TM);},
    lay:v=>[(Math.floor(v/TM)+0.5)/TM,1-((v%TM)+0.5)/TM],label:v=>`(${Math.floor(v/TM)},${v%TM})`}),
  mk({id:'torus',tag:'Construction 4.25',name:'Discrete torus Z₁₁²',N:TM*TM,D:5,directed:true,
    desc:'Directed out-edges (x,y), (x+1,y), (x,y+1), (x,x+y), (−y,x). The shear and the rotation jump across the board. You can only go forward along an edge.',
    f:(v,i)=>{const x=Math.floor(v/TM),y=v%TM;const L=[[x,y],[x+1,y],[x,y+1],[x,x+y],[-y,x]][i];return mod(L[0],TM)*TM+mod(L[1],TM);},
    lay:v=>[(Math.floor(v/TM)+0.5)/TM,1-((v%TM)+0.5)/TM],label:v=>`(${Math.floor(v/TM)},${v%TM})`}),
  mk({id:'lps',tag:'Construction 4.27',name:'LPS Ramanujan graph, p = 5, q = 89',N:LQ+1,D:LPS.gens.length,
    desc:`Vertices 𝔽₈₉ ∪ {∞}. Edge i applies the Möbius map z ↦ ((a₀+ιa₁)z + (a₂+ιa₃)) / ((−a₂+ιa₃)z + (a₀−ιa₁)) for the i-th of the 6 solutions of a₀²+a₁²+a₂²+a₃² = 5 with a₀ > 0 odd (ι = ${LPS.I} = √−1 mod 89). Ramanujan: λ ≈ 0.711 ≤ 2√5/6 ≈ 0.745. A 90-cycle has diameter 45; this graph has diameter 4.`,
    f:(z,i)=>LPS.f(z,i),lay:v=>v===LQ?[0.5,0.5]:circ(v,LQ),label:v=>v===LQ?'∞':String(v),
    elabel:i=>'('+LPS.gens[i].join(',')+')'}),
  mk({id:'sq',tag:'Lemma 4.30',name:'Squared: (29-cycle + chords)²',N:P,D:9,
    desc:'Edge (i, j) takes edge i then edge j of the chord graph. Nine choices per move, every target within a few hops.',
    f:(x,l)=>{const g=(y,i)=>i===0?(y+1)%P:i===1?mod(y-1,P):inv(y,P);return g(g(x,Math.floor(l/3)),l%3);},lay:v=>circ(v,P),label:v=>String(v),
    elabel:l=>`${Math.floor(l/3)+1}·${l%3+1}`}),
  mk({id:'tensor',tag:'Lemma 4.33',name:'Tensor: C₅ ⊗ C₇ (with chords)',N:35,D:9,
    desc:'Vertex (a, b) sits in row a, column b. Edge (i, j) moves a by edge i of the 5-graph and b by edge j of the 7-graph, both at once.',
    f:(v,l)=>{const a=Math.floor(v/7),b=v%7;const g=(y,i,p)=>i===0?(y+1)%p:i===1?mod(y-1,p):inv(y,p);return g(a,Math.floor(l/3),5)*7+g(b,l%3,7);},
    lay:v=>[(v%7+0.5)/7,(Math.floor(v/7)+0.5)/5*0.72+0.14],label:v=>`(${Math.floor(v/7)},${v%7})`,elabel:l=>`${Math.floor(l/3)+1}·${l%3+1}`}),
  mk({id:'zz',tag:'Definition 4.34',name:'Zig-zag: king torus Z₄² ⓩ Wagner',N:128,D:9,
    desc:'Each cloud is a copy of the 8-vertex Wagner graph; dot i faces direction i. Edge (a, b) = zig a inside the cloud, cross along the edge you now face, zag b in the new cloud.',
    f:(v,l)=>{const m=4,u=Math.floor(v/8),i=v%8,a=Math.floor(l/3),b=l%3;const rh=(k,c)=>c===0?(k+1)%8:c===1?(k+7)%8:(k+4)%8;
      const ip=rh(i,a);const x=Math.floor(u/m),y=u%m;const w=mod(x+DIR[ip][0],m)*m+mod(y+DIR[ip][1],m);const jp=(ip+4)%8;return w*8+rh(jp,b);},
    lay:v=>{const m=4,u=Math.floor(v/8),i=v%8,x=Math.floor(u/m),y=u%m;const a=Math.atan2(-DIR[i][1],DIR[i][0]);return[(x+0.5)/m+0.085*Math.cos(a),(m-1-y+0.5)/m+0.085*Math.sin(a)];},
    label:v=>`(${Math.floor(Math.floor(v/8)/4)},${Math.floor(v/8)%4};${v%8})`,elabel:l=>`${Math.floor(l/3)+1}·${l%3+1}`}),
];
for(const L of LEVELS){ // all-pairs distances (directed BFS)
  const N=L.N,D=L.D;L.dist=[];let diam=0;
  for(let s=0;s<N;s++){const d=new Int16Array(N).fill(-1);const Q=[s];d[s]=0;for(let h=0;h<Q.length;h++){const v=Q[h];for(let i=0;i<D;i++){const w=L.nb[v*D+i];if(d[w]<0){d[w]=d[v]+1;Q.push(w);}}}L.dist.push(d);for(const x of d)diam=Math.max(diam,x);}
  L.diam=diam;let tot=0,cnt=0;for(let s=0;s<N;s++)for(let t=0;t<N;t++)if(s!==t){tot+=L.dist[s][t];cnt++;}L.avg=tot/cnt;
}

/* ---------- state ---------- */
const S={lv:0,phase:'ready',s:0,t:1,cur:0,moves:0,score:0,perfect:0,totMoves:0,totOpt:0,skips:0,endAt:0,trail:[],anim:null};
const BEST_KEY='expander-race-best';
let best={};try{best=JSON.parse(localStorage.getItem(BEST_KEY)||'{}')||{};}catch(e){best={};}
function saveBest(){try{localStorage.setItem(BEST_KEY,JSON.stringify(best));}catch(e){}}
const L=()=>LEVELS[S.lv];

function newPair(){const G=L();let s,t,tries=0;const minD=Math.min(2,G.diam);
  do{s=Math.floor(Math.random()*G.N);t=Math.floor(Math.random()*G.N);tries++;}while((s===t||G.dist[s][t]<minD)&&tries<500);
  S.s=s;S.t=t;S.cur=s;S.moves=0;S.trail=[s];}

/* ---------- drawing ---------- */
const cv=$('cv');let C={};
function colors(){for(const n of ['panel','ink','muted','line','edge','player','target','nbr','soft','warn'])C[n]=tok(n);}
function geom(){const w=cv.clientWidth||600;const h=Math.round(w*(L().id==='tensor'?0.78:1));return{w,h};}
function px(v,w,h){const p=L().pos[v];return[18+p[0]*(w-36),18+p[1]*(h-36)];}
function alpha(hex,a){hex=hex.replace('#','');if(hex.length===3)hex=hex.split('').map(c=>c+c).join('');const n=parseInt(hex,16);return`rgba(${n>>16&255},${n>>8&255},${n&255},${a})`;}
function arrow(c,x1,y1,x2,y2,col,wd,r){const a=Math.atan2(y2-y1,x2-x1);const ex=x2-Math.cos(a)*(r+2),ey=y2-Math.sin(a)*(r+2);c.strokeStyle=col;c.lineWidth=wd;c.beginPath();c.moveTo(x1,y1);c.lineTo(ex,ey);c.stroke();
  c.fillStyle=col;c.beginPath();c.moveTo(ex,ey);c.lineTo(ex-Math.cos(a-0.4)*9,ey-Math.sin(a-0.4)*9);c.lineTo(ex-Math.cos(a+0.4)*9,ey-Math.sin(a+0.4)*9);c.closePath();c.fill();}
function draw(){
  const G=L(),{w,h}=geom(),d=window.devicePixelRatio||1;if(cv.width!==Math.round(w*d)||cv.height!==Math.round(h*d)){cv.width=Math.round(w*d);cv.height=Math.round(h*d);}cv.style.height=h+'px';
  const c=cv.getContext('2d');c.setTransform(d,0,0,d,0,0);c.clearRect(0,0,w,h);c.fillStyle=C.panel;c.fillRect(0,0,w,h);
  const N=G.N,D=G.D;const R=N>100?4:N>40?6:N>20?8:11;
  // background structure
  if(G.id==='zz'){c.strokeStyle=alpha(C.edge,.5);c.lineWidth=1;for(let u=0;u<16;u++){const x=Math.floor(u/4),y=u%4;const cx=18+(x+0.5)/4*(w-36),cy=18+(4-1-y+0.5)/4*(h-36);c.beginPath();c.arc(cx,cy,0.11*(w-36),0,7);c.stroke();}}
  c.lineWidth=1;c.strokeStyle=alpha(C.edge,G.D>5?.35:.7);c.beginPath();
  const drawn=new Set();
  for(let v=0;v<N;v++)for(let i=0;i<D;i++){const x=G.nb[v*D+i];if(x===v)continue;const k=Math.min(v,x)*N+Math.max(v,x);if(drawn.has(k))continue;drawn.add(k);
    const[a,b]=px(v,w,h),[e,f]=px(x,w,h);if(G.id==='grid'||G.id==='torus'){if(Math.abs(a-e)>(w-36)/TM*1.5||Math.abs(b-f)>(h-36)/TM*1.5){if(G.id==='grid')continue;}}
    c.moveTo(a,b);c.lineTo(e,f);}
  c.stroke();
  // trail
  if(S.trail.length>1){c.strokeStyle=alpha(C.player,.45);c.lineWidth=3;c.setLineDash([5,5]);c.beginPath();S.trail.forEach((v,k)=>{const[a,b]=px(v,w,h);k?c.lineTo(a,b):c.moveTo(a,b);});c.stroke();c.setLineDash([]);}
  // out-edges of current
  const cur=S.cur;const[cx,cy]=px(cur,w,h);const groups=new Map();
  for(let i=0;i<D;i++){const x=G.nb[cur*D+i];if(!groups.has(x))groups.set(x,[]);groups.get(x).push(i);}
  for(const[x,ls]of groups){if(x===cur)continue;const[e,f]=px(x,w,h);const col=x===S.t?C.target:C.nbr;arrow(c,cx,cy,e,f,col,2.2,R+2);}
  // vertices
  for(let v=0;v<N;v++){const[a,b]=px(v,w,h);const isN=groups.has(v)&&v!==cur;c.fillStyle=v===S.t?C.target:isN?C.nbr:alpha(C.muted,.8);c.beginPath();c.arc(a,b,v===S.t?R+3:isN?R+1:R*.7,0,7);c.fill();}
  // target ring
  {const[a,b]=px(S.t,w,h);c.strokeStyle=C.target;c.lineWidth=2.5;c.beginPath();c.arc(a,b,R+8,0,7);c.stroke();}
  // player
  let [pxx,pyy]=[cx,cy];if(S.anim){const k=Math.min(1,(performance.now()-S.anim.t0)/120);const[a,b]=px(S.anim.from,w,h);pxx=a+(cx-a)*k;pyy=b+(cy-b)*k;if(k>=1)S.anim=null;}
  c.fillStyle=C.player;c.beginPath();c.arc(pxx,pyy,R+5,0,7);c.fill();c.strokeStyle=C.panel;c.lineWidth=2;c.stroke();
  // edge badges
  c.font=`600 ${N>100?10:12}px ${tok('f-mono')}`;c.textAlign='center';c.textBaseline='middle';
  for(const[x,ls]of groups){const[e,f]=px(x,w,h);const txt=ls.map(i=>i+1).join(',');let bx=e,by=f-(R+13);if(x===cur){bx=cx+R+16;by=cy-R-12;}
    const tw=c.measureText(txt).width+8;c.fillStyle=x===S.t?C.target:x===cur?C.muted:C.nbr;c.beginPath();c.roundRect(bx-tw/2,by-9,tw,18,5);c.fill();c.fillStyle=C.panel;c.fillText(txt,bx,by+1);}
  // labels of s and t for small graphs
  if(N<=50){c.font=`11px ${tok('f-mono')}`;c.fillStyle=C.muted;for(const v of [S.t]){const[a,b]=px(v,w,h);c.fillText(G.label(v),a,b+R+16);}}
  if(S.anim)requestAnimationFrame(draw);
}

/* ---------- HUD ---------- */
function hud(){const G=L();$('cur').textContent=G.label(S.cur);$('tgt').textContent=G.label(S.t);$('mv').textContent=S.moves;$('dist').textContent=G.dist[S.cur][S.t];$('score').textContent=S.score;
  const ms=$('moves');ms.innerHTML='';for(let i=0;i<G.D;i++){const x=G.nb[S.cur*G.D+i];const b=document.createElement('button');b.className='mv'+(x===S.t?' hit':'');b.type='button';
    b.innerHTML=`<span>${G.elabel?G.elabel(i):'edge '+(i+1)}</span><b>key ${i+1} → ${G.label(x)}${x===S.cur?' (stay)':''}</b>`;b.addEventListener('click',()=>move(i));ms.appendChild(b);}
  $('skip').disabled=S.phase!=='play';$('quit').disabled=S.phase!=='play';
  for(const b of ms.querySelectorAll('button'))b.disabled=S.phase!=='play';}
function levelCards(){const el=$('levels');el.innerHTML='';LEVELS.forEach((G,k)=>{const b=document.createElement('button');b.className='lv'+(k===S.lv?' on':'');b.type='button';b.setAttribute('role','listitem');
  b.innerHTML=`<span class="n">${k+1} · ${G.tag}</span><span class="t">${G.name}</span><span class="m">N=${G.N} · D=${G.D} · diam ${G.diam}</span><span class="b">${best[G.id]!=null?'best '+best[G.id]:'no score yet'}</span>`;
  b.addEventListener('click',()=>{if(S.phase==='play')return;S.lv=k;ready();});el.appendChild(b);});}

/* ---------- flow ---------- */
function ready(){S.phase='ready';S.score=0;newPair();const G=L();$('lvName').textContent=G.name;$('lvDesc').textContent=G.desc;$('log').textContent='';
  $('time').textContent='60.0 s';$('bar').style.width='100%';
  $('ov').hidden=false;$('ov').innerHTML=`<div class="card"><span class="k">LEVEL ${S.lv+1} · ${G.tag.toUpperCase()}</span><h2>${G.name}</h2><p class="desc">${G.desc}</p>
    <p class="desc">${G.N} vertices, ${G.D} edges per vertex, diameter ${G.diam}, average distance ${G.avg.toFixed(2)}.${best[G.id]!=null?` Your best: <b>${best[G.id]}</b>.`:''}</p>
    <p class="desc">Keys 1–${G.D} take an edge, S skips a pair. The clock starts when you press Start.</p><button class="go" id="startBtn">Start · 60 s</button></div>`;
  $('startBtn').addEventListener('click',start);levelCards();hud();draw();}
function start(){S.phase='play';S.score=0;S.perfect=0;S.totMoves=0;S.totOpt=0;S.skips=0;newPair();S.endAt=performance.now()+60000;$('ov').hidden=true;$('log').textContent='';hud();draw();tick();cv.focus?.();}
function tick(){if(S.phase!=='play')return;const left=Math.max(0,S.endAt-performance.now());$('time').textContent=(left/1000).toFixed(1)+' s';$('bar').style.width=(left/600)+'%';
  $('bar').style.background=left<10000?'var(--warn)':'var(--player)';if(left<=0){finish();return;}requestAnimationFrame(tick);}
function move(i){if(S.phase!=='play')return;const G=L();if(i<0||i>=G.D)return;const from=S.cur;S.cur=G.nb[S.cur*G.D+i];S.moves++;S.trail.push(S.cur);S.anim={from,t0:performance.now()};
  if(S.cur===S.t){const opt=G.dist[S.s][S.t];S.score++;S.totMoves+=S.moves;S.totOpt+=opt;if(S.moves===opt)S.perfect++;
    $('log').textContent=`#${S.score}  ${G.label(S.s)} → ${G.label(S.t)}: ${S.moves} moves (shortest ${opt})${S.moves===opt?'  ✓ perfect':''}\n`+$('log').textContent;
    const bx=$('roundBox');bx.classList.remove('flash');void bx.offsetWidth;bx.classList.add('flash');newPair();}
  hud();draw();}
function skip(){if(S.phase!=='play')return;S.skips++;$('log').textContent=`skipped ${L().label(S.s)} → ${L().label(S.t)}\n`+$('log').textContent;newPair();hud();draw();}
function finish(){S.phase='done';const G=L();const prev=best[G.id];const rec=prev==null||S.score>prev;if(rec){best[G.id]=S.score;saveBest();}
  const eff=S.totMoves?Math.round(100*S.totOpt/S.totMoves):0;
  $('ov').hidden=false;$('ov').innerHTML=`<div class="card"><span class="k">TIME · ${G.name.toUpperCase()}</span><div class="big">${S.score}</div><p>pairs solved${rec&&S.score>0?' · <b style="color:var(--target)">new best</b>':''}</p>
    <p class="desc">${S.totMoves} moves where ${S.totOpt} would have been shortest (${eff}% efficient), ${S.perfect} perfect rounds, ${S.skips} skipped.</p>
    <div class="btns"><button class="go" id="again">Play again</button><button id="pick">Choose another graph</button></div></div>`;
  $('again').addEventListener('click',start);$('pick').addEventListener('click',()=>{ready();$('levels').scrollIntoView({behavior:'smooth',block:'start'});});levelCards();hud();draw();}

/* ---------- input ---------- */
document.addEventListener('keydown',e=>{if(e.target&&(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'))return;
  if(S.phase==='play'){if(/^[1-9]$/.test(e.key)){move(+e.key-1);e.preventDefault();}else if(e.key==='s'||e.key==='S'){skip();e.preventDefault();}}
  else if((e.key==='Enter')&&S.phase!=='play'){start();e.preventDefault();}});
cv.addEventListener('click',e=>{if(S.phase!=='play')return;const G=L(),r=cv.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,{w,h}=geom();
  let best=-1,bd=1e9;for(let i=0;i<G.D;i++){const v=G.nb[S.cur*G.D+i];const[a,b]=px(v,w,h);const dd=(a-x)**2+(b-y)**2;if(dd<bd){bd=dd;best=i;}}
  if(best>=0&&bd<40*40)move(best);});
$('skip').addEventListener('click',skip);$('quit').addEventListener('click',()=>{if(S.phase==='play'){S.endAt=performance.now();}});

/* ---------- boot ---------- */
colors();
let rt=0;window.addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(draw,100);});
const re=()=>{colors();draw();};try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',re);}catch(e){}
new MutationObserver(re).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(re);
ready();
