/* enhance.js — floating nursing icons, counters, skill bars, live ECG monitor, nursing-process + timeline reveals */
(function(){
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],R=Math.random;
/* floating medical icons */
const kinds=['cross','heart','pill','drop','cross','steth'],fl=$('#floaters');
for(let i=0;i<10;i++){const e=document.createElement('i');e.innerHTML=`<svg><use href="#i-${kinds[i%6]}"/></svg>`;
  e.style.cssText=`left:${R()*100}%;--s:${14+R()*22}px;--d:${16+R()*18}s;--dl:${-R()*30}s;--x:${(R()-.5)*140}px`;fl.appendChild(e)}
/* animated counters */
$$('.count').forEach(el=>{const o={v:0},n=+el.dataset.count;
  ScrollTrigger.create({trigger:el,start:'top 92%',once:true,onEnter:()=>gsap.to(o,{v:n,duration:2.2,ease:'power2.out',onUpdate:()=>el.textContent=Math.round(o.v)+(el.dataset.suf||'')})})});
/* skill bars */
$$('.bar i').forEach(b=>gsap.to(b,{scaleX:b.dataset.l/100,duration:1.6,ease:'power3.out',scrollTrigger:{trigger:b,start:'top 92%'}}));
/* nursing process: line draws, steps pop in */
gsap.from('.step',{y:50,opacity:0,scale:.92,stagger:.15,duration:.9,ease:'back.out(1.4)',scrollTrigger:{trigger:'.steps',start:'top 82%'}});
gsap.fromTo('.steps__fill',{scaleX:0},{scaleX:1,ease:'none',scrollTrigger:{trigger:'.steps',start:'top 80%',end:'bottom 55%',scrub:.6}});
gsap.fromTo('.tl__line',{scaleY:0,transformOrigin:'top'},{scaleY:1,ease:'none',scrollTrigger:{trigger:'.tl',start:'top 75%',end:'bottom 60%',scrub:.6}});
gsap.from('.six',{y:30,opacity:0,stagger:.08,duration:.8,scrollTrigger:{trigger:'.grid--6',start:'top 88%'}});
/* live ECG monitor */
const cv=$('#ecg'),cx=cv.getContext('2d'),N=320,buf=new Float32Array(N).fill(NaN);
let W,H,idx=0,ph=0,bpm=72,acc=0,vis=false;
const fit=()=>{const r=cv.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);W=cv.width=r.width*d;H=cv.height=r.height*d};fit();addEventListener('resize',fit);
new IntersectionObserver(e=>vis=e[0].isIntersecting).observe(cv);
const wave=p=>p<.1?Math.sin(p/.1*Math.PI)*.12:p>.16&&p<.19?-(p-.16)/.03*.15:p>=.19&&p<.23?-.15+(p-.19)/.04*1.15:p>=.23&&p<.27?1-(p-.23)/.04*1.3:p>=.27&&p<.3?-.3+(p-.27)/.03*.3:p>.38&&p<.6?Math.sin((p-.38)/.22*Math.PI)*.22:0;
const hr=$('#vHr');
gsap.ticker.add((t,dt)=>{if(!vis)return;
  acc+=dt/1000*130;while(acc>=1){acc--;ph+=bpm/60/130;if(ph>=1){ph-=1;}buf[idx]=wave(ph)+(R()-.5)*.012;for(let g=1;g<=10;g++)buf[(idx+g)%N]=NaN;idx=(idx+1)%N}
  cx.clearRect(0,0,W,H);cx.lineWidth=2.4*(W/cv.clientWidth);cx.strokeStyle='#c084fc';cx.shadowColor='#a855f7';cx.shadowBlur=6;cx.lineJoin='round';cx.beginPath();
  let pen=false;for(let i=0;i<N;i++){const v=buf[i];if(v!==v){pen=false;continue}const x=i/(N-1)*W,y=H*.72-v*H*.55;pen?cx.lineTo(x,y):cx.moveTo(x,y);pen=true}cx.stroke();
  cx.fillStyle='#fff';cx.beginPath();cx.arc(idx/(N-1)*W,H*.72-(buf[(idx+N-1)%N]||0)*H*.55,4*(W/cv.clientWidth),0,7);cx.fill()});
setInterval(()=>{if(!vis)return;bpm=68+Math.round(R()*10);hr.textContent=bpm;
  $('#vSp').textContent=97+Math.round(R()*2);$('#vBp').textContent=(114+Math.round(R()*8))+'/'+(72+Math.round(R()*8));
  $('#vTp').textContent=(36.5+R()*.4).toFixed(1);$('#vRr').textContent=14+Math.round(R()*4)},1800);
})();
