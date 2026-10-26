/* main.js — boot loader, split-text title, nav progress, circuit rail, reveals, glass spotlight */
gsap.registerPlugin(ScrollTrigger);
const $=s=>document.querySelector(s),secs=[...document.querySelectorAll('.sec')];

/* Split the hero title into letters for the entrance */
const title=$('#title'),txt=title.textContent;title.setAttribute('aria-label',txt);title.textContent='';
txt.split(' ').forEach((w,i,a)=>{const s=document.createElement('span');s.className='w';s.setAttribute('aria-hidden','true');
  [...w].forEach(c=>{const k=document.createElement('span');k.className='ch';k.textContent=c;s.appendChild(k)});
  title.appendChild(s);if(i<a.length-1)title.append(' ')});

/* Boot loader: percent follows the 3D intro; skip button jumps to the end */
const pct=$('#bootPct'),bar=$('#bootBar');
const tick=()=>{const p=Math.min(1,SCENE.w*.65+SCENE.core*.35);pct.textContent=Math.round(p*100)+'%';bar.style.transform=`scaleX(${p})`};
gsap.ticker.add(tick);
$('#bootSkip').onclick=()=>SCENE.skip&&SCENE.skip();

/* Circuit rail: ECG path, head dot + packet, one diamond node per chapter */
let d='M20 0';for(let i=0;i<10;i++){const y=i*100;d+=` L20 ${y+34} L14 ${y+40} L20 ${y+46} L27 ${y+54} L11 ${y+68} L20 ${y+76} L20 ${y+100}`}
const lit=$('#ecgLit');$('#ecgBase').setAttribute('d',d);lit.setAttribute('d',d);
const L=lit.getTotalLength();lit.style.strokeDasharray=L;lit.style.strokeDashoffset=L;
const head=$('#headSvg .head'),pkt=$('#headSvg .pkt'),headSvg=$('#headSvg');
const circuit=$('#circuit'),maxS=()=>document.documentElement.scrollHeight-innerHeight;
const nodes=secs.map(s=>{const a=document.createElement('a');a.className='circuit__node';a.innerHTML=`<span>${s.dataset.label}</span>`;
  a.onclick=()=>s.scrollIntoView({behavior:'smooth'});circuit.appendChild(a);return{a,s}});
const place=()=>nodes.forEach(n=>{n.p=Math.min(1,n.s.offsetTop/maxS());n.a.style.top=n.p*100+'%'});
place();addEventListener('resize',place);addEventListener('load',place);

let CR=circuit.getBoundingClientRect();addEventListener('resize',()=>CR=circuit.getBoundingClientRect());
let prog=0;
function setHead(p,t){ // map 0..1 on the path to screen coords inside the rail
  const r=CR,map=l=>{const q=lit.getPointAtLength(l);return[q.x/44*r.width,q.y/1000*r.height]};
  const [hx,hy]=map(L*p);head.setAttribute('cx',hx);head.setAttribute('cy',hy);
  const [px,py]=map(L*p*((t*.25)%1));pkt.setAttribute('cx',px);pkt.setAttribute('cy',py);}
ScrollTrigger.create({start:0,end:'max',onUpdate:self=>{
  prog=self.progress;SCENE.p=prog;lit.style.strokeDashoffset=L*(1-prog);$('#navBar').style.transform=`scaleX(${prog})`;
  nodes.forEach(n=>n.a.classList.toggle('is-passed',prog>=n.p-.01));
}});
gsap.ticker.add(t=>setHead(prog,t));
secs.forEach((s,i)=>ScrollTrigger.create({trigger:s,start:'top 55%',end:'bottom 55%',onToggle:t=>{if(!t.isActive)return;
  $('#chapNum').textContent=s.dataset.chapter;$('#chapLabel').textContent=s.dataset.label;
  nodes.forEach((n,j)=>n.a.classList.toggle('is-active',i===j))}}));

gsap.utils.toArray('.in').forEach(el=>{const i=[...el.parentNode.children].indexOf(el);
  gsap.from(el,{y:50,opacity:0,duration:1.1,delay:(i%4)*.07,ease:'power3.out',clearProps:'all',scrollTrigger:{trigger:el,start:'top 92%'}})});
/* parallax drift for ambient orbs + hero fade-out on scroll */
gsap.to('.hero__copy',{y:-80,opacity:0,ease:'none',scrollTrigger:{trigger:'#hero',start:'top top',end:'bottom 30%',scrub:1}});
/* each section's heading block glides in slightly slower than the page */
gsap.utils.toArray('.sec:not(.sec--hero) .eyebrow').forEach(e=>gsap.from(e,{x:-40,opacity:0,duration:1.2,ease:'expo.out',scrollTrigger:{trigger:e,start:'top 92%'}}));
document.querySelectorAll('.glass').forEach(g=>g.addEventListener('pointermove',e=>{
  const r=g.getBoundingClientRect();g.style.setProperty('--mx',e.clientX-r.left+'px');g.style.setProperty('--my',e.clientY-r.top+'px')}));

/* After the intro: flash, fade in the page, letters rise in */
document.addEventListener('introdone',()=>{
  gsap.ticker.remove(tick);document.body.classList.remove('is-booting');
  gsap.fromTo('#flash',{opacity:.9},{opacity:0,duration:1.4,ease:'power2.out'});
  gsap.from('.ch',{yPercent:110,opacity:0,rotateX:-60,stagger:.045,duration:1,ease:'power3.out'});
  gsap.from('.rise',{y:30,opacity:0,stagger:.12,duration:1.1,delay:.3,ease:'power3.out'});
});
