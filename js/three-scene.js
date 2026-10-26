/* three-scene.js — ECG wires converge into a pulsing heart-core (intro), then scroll flies the camera
   through a DNA helix and into a care-network. Mobile gets fewer objects. */
(function(){
const NB=document.body.classList.contains('no-beat'); /* remove class 'no-beat' from <body> in index.html to bring the heartbeat back */
const mob=matchMedia('(max-width:768px)').matches,reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const R=new THREE.WebGLRenderer({canvas:document.getElementById('webgl'),antialias:mob,alpha:true});
R.setPixelRatio(Math.min(devicePixelRatio,mob?2:1.5));
const S=new THREE.Scene();S.fog=new THREE.FogExp2(0x04010a,.014);
const C=new THREE.PerspectiveCamera(60,1,.1,300);
const COL={cyan:0xa855f7,teal:0x8b5cf6,blue:0xc4b5fd,gold:0xe9d5ff,rose:0xe879f9};
const lm=(c,o=1)=>new THREE.LineBasicMaterial({color:c,transparent:true,opacity:o});
const V=(x,y,z)=>new THREE.Vector3(x,y,z),rnd=(a,b)=>a+Math.random()*(b-a);
const onSphere=r=>V(rnd(-1,1),rnd(-1,1),rnd(-1,1)).normalize().multiplyScalar(r);
const SW=window.SCENE={p:0,w:0,core:0};               // p = scroll progress, w = wires drawn, core = core appeared
const DEPTH=100;                                       // how far the camera travels on scroll

/* Pulse core */
const core=new THREE.Group();core.position.x=mob?0:3.2;S.add(core);
const bm=(c,o,w)=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:o,wireframe:!!w});
const ico=new THREE.Mesh(new THREE.IcosahedronGeometry(1.6,2),bm(COL.cyan,.35,1));
const inner=new THREE.Mesh(new THREE.SphereGeometry(.9,24,24),bm(COL.rose,.55));
const rings=[2.3,2.9].map((r,i)=>{const m=new THREE.Mesh(new THREE.TorusGeometry(r,.012,8,120),bm(i?COL.gold:COL.teal,.85));m.rotation.x=1+i*.6;core.add(m);return m});
core.add(ico,inner);core.scale.setScalar(.001);
/* Reactor HUD: blinking LED rings + tick ring around the core (like BOSS's reactor) */
const led=(n,r,c)=>{const a=[];for(let i=0;i<n;i++){const t=i/n*Math.PI*2;a.push(V(Math.cos(t)*r,Math.sin(t)*r,0))}
  return new THREE.Points(new THREE.BufferGeometry().setFromPoints(a),new THREE.PointsMaterial({color:c,size:.16,transparent:true,depthWrite:false}))};
const ledOut=led(mob?32:64,3.6,COL.gold),ledIn=led(mob?24:48,3.1,COL.cyan),tk=[];
for(let i=0;i<120;i++){const t=i/120*Math.PI*2,c=Math.cos(t),s=Math.sin(t),e=i%5?4.0:4.15;tk.push(V(c*3.9,s*3.9,0),V(c*e,s*e,0))}
const ticks=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(tk),lm(COL.gold,.45));
const hud=new THREE.Group();hud.add(ledOut,ledIn,ticks);hud.rotation.set(.35,-.25,0);core.add(hud);


/* Intro wires: ECG-spiked lines flying in from far away */
const NW=mob?8:16,NP=80,wires=[];
for(let i=0;i<NW;i++){
  const a=onSphere(16),b=onSphere(2).add(core.position),pts=[];
  for(let k=0;k<NP;k++){const t=k/(NP-1),p=a.clone().lerp(b,t),q=(t*6)%1;
    p.y+=(q>.45&&q<.5?(q-.45)*40:q>=.5&&q<.55?-(.55-q)*40:0)*(1-t)*.8;pts.push(p)}
  const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),lm(i%3?COL.cyan:COL.rose));
  l.geometry.setDrawRange(0,0);S.add(l);wires.push(l);
}

/* DNA helix tunnel along -z */
const HN=mob?60:120,HR=3.5,A=[],B=[],rungs=[];
for(let i=0;i<HN;i++){const t=i/HN,z=-8-t*80,a=t*Math.PI*14;
  A.push(V(Math.cos(a)*HR,Math.sin(a)*HR,z));B.push(V(Math.cos(a+Math.PI)*HR,Math.sin(a+Math.PI)*HR,z));
  if(i%3===0)rungs.push(A[i],B[i]);}
const pts=(arr,c)=>new THREE.Points(new THREE.BufferGeometry().setFromPoints(arr),new THREE.PointsMaterial({color:c,size:.22,transparent:true,opacity:.9,depthWrite:false}));
const hel=new THREE.Group();hel.add(pts(A,COL.cyan),pts(B,COL.rose),new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(rungs),lm(COL.blue,.25)));S.add(hel);

/* Floating particles */
const PN=mob?200:480,pp=new Float32Array(PN*3);
for(let i=0;i<PN;i++){pp[i*3]=rnd(-18,18);pp[i*3+1]=rnd(-12,12);pp[i*3+2]=rnd(-110,10)}
const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pp,3));
S.add(new THREE.Points(pg,new THREE.PointsMaterial({color:COL.blue,size:.07,transparent:true,opacity:.6,depthWrite:false})));

/* Care network at the end of the journey */
const nd=[];for(let i=0;i<(mob?22:40);i++)nd.push(V(rnd(-9,9),rnd(-6,6),rnd(-105,-80)));
const ls=[];nd.forEach((a,i)=>nd.forEach((b,j)=>{if(j>i&&a.distanceTo(b)<6)ls.push(a,b)}));
S.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(ls),lm(COL.teal,.4)),
  new THREE.Points(new THREE.BufferGeometry().setFromPoints(nd),new THREE.PointsMaterial({color:COL.gold,size:.4,transparent:true,depthWrite:false})));

/* Floating 3D medical crosses drifting along the journey */
const crossG=new THREE.Group(),cm=new THREE.MeshBasicMaterial({color:COL.cyan,transparent:true,opacity:.45,wireframe:true}),crosses=[];
for(let i=0;i<(mob?6:12);i++){const c=new THREE.Group();[[1.2,.4,.4],[.4,1.2,.4]].forEach(d=>c.add(new THREE.Mesh(new THREE.BoxGeometry(...d),cm)));
  c.position.set(rnd(-9,9),rnd(-6,6),rnd(-100,0));if(Math.abs(c.position.x)<2.5)c.position.x+=5*Math.sign(c.position.x||1);c.userData={s:rnd(.2,.7),y:c.position.y};crossG.add(c);crosses.push(c)}
S.add(crossG);

/* Loop */
let mx=0,my=0,sp=0,last=performance.now();
addEventListener('pointermove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5});
function resize(){C.aspect=innerWidth/innerHeight;C.updateProjectionMatrix();R.setSize(innerWidth,innerHeight,false)}
addEventListener('resize',resize);resize();
function frame(now){
  requestAnimationFrame(frame);if(document.hidden)return;
  const dt=Math.min((now-last)/1000,.05),t=now/1000;last=now;
  sp+=(SW.p-sp)*Math.min(1,dt*1.6);
  wires.forEach((l,i)=>{const v=Math.max(0,Math.min(1,SW.w*1.4-i/NW*.4));l.geometry.setDrawRange(0,Math.floor(v*NP));l.material.opacity=1-SW.core*.75});
  const beat=Math.pow(Math.max(0,Math.sin(t*5.2)),14)*.12;       // heartbeat
  core.scale.setScalar(Math.max(.001,NB?SW.core:SW.core*(1+beat)));
  ico.rotation.y=t*.2;rings.forEach((r,i)=>r.rotation.z+=dt*(.4+i*.2));
  ledOut.rotation.z+=dt*.15;ledIn.rotation.z-=dt*.25;ticks.rotation.z+=dt*.05;ledOut.material.opacity=NB?.9:(Math.sin(t*3)>.9?.3:.95);
  hel.rotation.z=t*.05+sp*2;crosses.forEach(c=>{c.rotation.x+=dt*c.userData.s;c.rotation.y+=dt*c.userData.s*.7;c.position.y=c.userData.y+Math.sin(t*c.userData.s+c.position.z)*.6});
  const z=9+(1-SW.w)*7-sp*DEPTH,x=Math.sin(sp*7)*1.6+mx*1.2,y=Math.cos(sp*5)*.9-my*.8;
  C.position.set(x,y,z);C.lookAt(x*.3,y*.3,z-12);C.rotation.z+=Math.sin(sp*9)*.04;
  R.render(S,C);
}
requestAnimationFrame(frame);

/* Intro timeline: wires draw in, then the core blooms */
let fired=false;const done=()=>{if(!fired){fired=true;document.dispatchEvent(new Event('introdone'))}};
if(reduce){SW.w=1;SW.core=1;done()}
else{const tl=gsap.timeline().to(SW,{w:1,duration:2.4,ease:'power1.inOut'}).to(SW,{core:1,duration:1.3,ease:NB?'power2.out':'elastic.out(1,.6)'},'-=.4').call(done);SW.skip=()=>tl.progress(1);setTimeout(done,7000)}
})();
