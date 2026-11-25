const $=i=>document.getElementById(i),cv=$('c'),x=cv.getContext('2d'),W=480,H=270,GY=232;cv.width=W*2;cv.height=H*2;
const spr=i=>PT[i];x.imageSmoothingEnabled=false;
const S={diff:1,snd:1,touch:'ontouchstart' in window,tsz:1};let G=null,fr=0,paused=false,sel=[],sg=0,H_=[{},{}],PR=[{},{}];
const KM={KeyA:[0,'l'],KeyD:[0,'r'],KeyW:[0,'u'],KeyS:[0,'d'],KeyJ:[0,'p'],KeyK:[0,'k'],KeyL:[0,'s'],KeyU:[0,'x'],ShiftLeft:[0,'g'],KeyI:[0,'g'],ArrowLeft:[0,'l'],ArrowRight:[0,'r'],ArrowUp:[0,'u'],ArrowDown:[0,'d']};
function act(p,a,d){const nv=d?1:0,ch=(H_[p][a]||0)!==nv;H_[p][a]=nv;if(d)PR[p][a]=1;if(ch&&NET.role=='guest')nsend({t:'in',a,d:nv})}
onkeydown=e=>{if(e.target.tagName=='INPUT')return;if((e.code=='Escape'||e.code=='KeyP')&&G&&G.ph!='end'&&!NETON())pause(!paused);const k=KM[e.code];if(k){e.preventDefault();if(!e.repeat)act(k[0],k[1],1)}};
onkeyup=e=>{const k=KM[e.code];if(k)act(k[0],k[1],0)};
let AC;function sfx(f,d=.08,t='square',v=.05){if(NET.role=='host'&&G)(G.sq=G.sq||[]).push([f,d,t,v]);if(!S.snd)return;try{AC=AC||new AudioContext();const o=AC.createOscillator(),g=AC.createGain();o.type=t;o.frequency.value=f;g.gain.value=v;g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+d);o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+d)}catch(e){}}
// touch
document.querySelectorAll('#bt b').forEach(b=>{const a=b.dataset.a;b.innerHTML=IC[b.dataset.i];b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);act(0,a,1);b.classList.add('on')};b.onpointerup=b.onpointercancel=()=>{act(0,a,0);b.classList.remove('on')}});
const jy=$('joy');let jp=null;function jm(e){e.preventDefault();const r=jy.getBoundingClientRect(),dx=(e.clientX-r.left-r.width/2)/(r.width/2),dy=(e.clientY-r.top-r.height/2)/(r.height/2);act(0,'l',dx<-.3);act(0,'r',dx>.3);act(0,'u',dy<-.5);act(0,'d',dy>.5);const m=Math.hypot(dx,dy)||1,k=Math.min(1,m)/m;$('knob').style.transform=`translate(${dx*k*60}%,${dy*k*60}%)`}
function jr(){['l','r','u','d'].forEach(a=>act(0,a,0));$('knob').style.transform=''}
jy.onpointerdown=e=>{jy.setPointerCapture(e.pointerId);jp=e.pointerId;jm(e)};jy.onpointermove=e=>{if(jp===e.pointerId)jm(e)};jy.onpointerup=jy.onpointercancel=()=>{jp=null;jr()};
// moves
const AD={p:{su:4,ac:3,rc:8,dmg:7,rg:30,stun:14,kb:2,hs:4,k:'p'},k:{su:7,ac:4,rc:11,dmg:10,rg:40,stun:18,kb:4,hs:5,k:'k'},
s0:{su:10,ac:1,rc:18,dmg:11,rg:0,stun:20,kb:5,hs:5,k:'f',cost:25},s1:{su:6,ac:14,rc:14,dmg:15,rg:30,stun:22,kb:6,hs:6,k:'d',dash:4.5,cost:25},
s2:{su:4,ac:6,rc:22,dmg:14,rg:28,stun:30,kb:2,hs:6,k:'u',lau:-9,cost:25},u:{su:34,ac:26,rc:22,dmg:42,rg:34,stun:40,kb:9,hs:14,k:'U',dash:8,cost:100}};
function mk(i,side,ai){return{i,side,ai,x:side?340:140,y:GY,vx:0,vy:0,f:side?-1:1,hp:100,en:0,st:'idle',t:0,stun:0,cmb:0,jg:0,wins:0,at:0,gu:0,plan:'id',vw:0,vt:4,tn:0,pf:side?-1:1,inp:{},pr:{},a:null,spd:1.5+(i%4)*.15,pw:.9+(i%3)*.12,mv:i%3}}
function go(f,k){const a=Object.assign({},AD[k]);if(a.cost){if(f.en<a.cost)return 0;f.en-=a.cost}f.a=a;f.st='atk';f.t=0;if(a.k=='U'){G.cin=a.su;G.cf=f;sfx(80,.5,'sawtooth',.1)}else sfx(a.cost?300:160,.06,'square');return 1}
function spark(px,py,c,n){for(let i=0;i<n;i++)G.sp.push({x:px,y:py,vx:(Math.random()-.5)*6,vy:(Math.random()-.5)*6,t:12,c})}
function hit(o,f,a){if(o.st=='down'&&(o.y>=GY-2||o.jg>=3))return;if(G.ph!='fight')return;const gr=o.y>=GY,blk=gr&&o.inp.g&&['block','idle','walk','crouch'].includes(o.st),cx=(o.x+f.x)/2,cy=o.y-40;a.hit=1;G.hs=blk?4:a.hs;
 if(blk){fx(o.i,'ring',cx,cy,.55,14);o.hp-=a.dmg*.08;o.vx=f.f*a.kb*.8;f.vx=-f.f;o.en=Math.min(100,o.en+2);sfx(200,.06,'triangle');spark(cx,cy,'#8cf',6);return}
 const d=Math.round(a.dmg*f.pw*Math.max(.45,1-.1*f.cmb));o.hp=Math.max(0,o.hp-d);f.cmb++;f.en=Math.min(100,f.en+(a.cost?4:8));o.en=Math.min(100,o.en+3);o.vx=f.f*a.kb;o.a=null;
 if(o.st=='down')o.jg++;else o.jg=0;
 if(o.hp<=0||a.lau||!gr||a.k=='U'||o.st=='down'){o.st='down';o.t=0;o.vy=a.lau||-4;o.vx=f.f*(a.kb+2)}else{o.st='hurt';o.stun=a.stun}
 G.sh=a.hs>8?12:a.cost?7:3;spark(cx,cy,a.cost?'#fd0':'#fff',a.cost?14:7);fx(f.i,'burst',cx,cy,a.cost?.5:.32,12);if(a.k=='U'){fx(f.i,'slash',cx-f.f*10,cy,.8,22,f.f);fx(f.i,'ring',cx,cy,.8,24)}else if(a.cost)fx(f.i,'slash',cx-f.f*6,cy,.45,14,f.f);G.pp.push({x:o.x,y:o.y-60,t:30,s:d});sfx(a.cost?90:130,.1,'sawtooth',.08)}
function hitchk(f,o,a){if(a.hit||!a.rg)return;const dx=(o.x-f.x)*f.f;if(dx>-10&&dx<a.rg+12&&Math.abs(o.y-f.y)<(a.k=='U'?60:48))hit(o,f,a)}
function upd(f,o,live){const I=f.inp,P=f.pr,s=f.st,gr=f.y>=GY;
 if(live&&['idle','walk','jump','crouch','block'].includes(s)){
  if(gr){f.f=o.x>f.x?1:-1;f.vx=0;if(I.g)f.st='block';else if(I.d)f.st='crouch';else if(I.l||I.r){const dr=I.r?1:-1;if(f.rd!==dr)f.rt=0;f.rd=dr;f.rt=(f.rt||0)+1;f.run=f.rt>18&&SPR[f.i]&&SPR[f.i].ok;f.vx=dr*f.spd*(f.run?1.45:1);f.st='walk'}else{f.st='idle';f.rt=0;f.run=0}
   if(I.u&&f.st!='block'&&f.st!='crouch'){f.vy=-9.5;f.st='jump';f.vx=((I.r?1:0)-(I.l?1:0))*f.spd*1.3;sfx(400,.06)}}else f.st='jump';
  if(P.x)go(f,'u');else if(P.s)go(f,'s'+f.mv);else if(P.p)go(f,'p');else if(P.k)go(f,'k')}
 else if(s=='atk'){const a=f.a;f.t++;
  if(a.k=='U'&&f.t<=a.su){f.vx=0;f.vy=0}
  if(f.t==a.su){if(a.k=='U')f.vy=-3;if(a.k=='u')f.vy=a.lau;if(a.k=='f'){G.pj.push({x:f.x+f.f*20,y:f.y-38,vx:f.f*4.5,o:f,a});sfx(600,.1,'sawtooth')}}
  if(a.dash&&f.t>=a.su&&f.t<a.su+a.ac)f.vx=f.f*a.dash;else if(f.t>=a.su+a.ac)f.vx*=.8;
  if(f.t>=a.su&&f.t<a.su+a.ac)hitchk(f,o,a);
  if(a.hit&&live){if(P.x&&a.k!='U')go(f,'u');else if(P.s&&(a.k=='p'||a.k=='k'))go(f,'s'+f.mv)}
  if(f.a===a&&f.t>=a.su+a.ac+a.rc){f.st=gr?'idle':'jump';f.a=null}}
 else if(s=='hurt'){f.vx*=.85;if(--f.stun<=0)f.st='idle'}
 else if(s=='down'&&gr&&f.vy>=0){f.t++;f.vx*=.85;if(f.t>45&&f.hp>0&&live)f.st='idle'}
 f.x=Math.max(16,Math.min(W-16,f.x+f.vx));f.y+=f.vy;if(f.y<GY&&!(f.a&&f.a.k=='U'&&f.t<=f.a.su))f.vy+=.5;if(f.y>=GY&&f.vy>=0){f.y=GY;f.vy=0}}
const DF=[{r:28,ag:.45,bl:.15,sp:.02},{r:18,ag:.6,bl:.35,sp:.04},{r:10,ag:.75,bl:.6,sp:.07},{r:4,ag:.9,bl:.85,sp:.1}];
function think(f,o){const d=DF[S.diff],I={},P={},dx=o.x-f.x,dist=Math.abs(dx),tw=dx>0?'r':'l',aw=dx>0?'l':'r';
 if(--f.at<=0){f.at=d.r+(Math.random()*d.r|0);f.plan=Math.random()<d.ag?(dist>50?'ap':'at'):(Math.random()<.5?'bk':'id')}
 if(f.plan=='ap'||(f.plan=='at'&&dist>48))I[tw]=1;if(f.plan=='bk')I[aw]=1;
 if(f.plan=='at'&&dist<=54&&Math.random()<.12+d.sp*2){const r=Math.random();if(r<.4)P.p=1;else if(r<.75)P.k=1;else if(f.en>=25)P.s=1}
 if(f.st=='atk'&&f.a.hit&&f.en>=25&&Math.random()<.2+d.sp*3)P.s=1;
 if(f.en>=100&&dist>70&&dist<200&&Math.random()<.03)P.x=1;
 if(o.st=='atk'&&dist<70&&Math.random()<d.bl*.1)f.gu=20;if(f.gu>0){f.gu--;I.g=1}
 if((G.pj.some(p=>p.o!=f&&Math.abs(p.x-f.x)<90)&&Math.random()<d.bl*.1)||Math.random()<.004)I.u=1;f.inp=I;f.pr=P}
function newRound(){G.f.forEach((f,i)=>Object.assign(f,{x:i?340:140,y:GY,vx:0,vy:0,hp:100,st:'idle',a:null,t:0,cmb:0,jg:0,stun:0,vw:0,tn:0,f:i?-1:1}));G.pj=[];G.sp=[];G.pp=[];G.fx=[];G.tm=99;G.ft=0;G.ph='intro';G.pt=0;G.cin=0}
function endRound(){const[a,b]=G.f;G.ph='ko';G.pt=0;G.hs=22;G.cin=0;G.w=a.hp>b.hp?a:b.hp>a.hp?b:null;if(G.w)G.w.wins++;G.msg=(a.hp<=0||b.hp<=0)?'K.O.':'TIME UP'}
function tick(){if(!G||paused||G.ph=='end')return;fr++;if(G.net)return;if(G.hs>0){G.hs--;return}
 const[a,b]=G.f,live=G.ph=='fight';
 if(G.ph=='intro'&&++G.pt>110)G.ph='fight';
 if(G.cin>0){G.cin--;upd(G.cf,G.cf==a?b:a,live);return}
 [a,b].forEach((f,i)=>{if(f.ai&&live)think(f,i?a:b);else{f.inp=live?H_[i]:{};f.pr=live?PR[i]:{}}});
 upd(a,b,live);upd(b,a,live);PR=[{},{}];[a,b].forEach(vstep);
 if(Math.abs(a.x-b.x)<20&&a.y>=GY&&b.y>=GY){const p=a.x<b.x?-1.2:1.2;a.x+=p;b.x-=p}
 [[a,b],[b,a]].forEach(([f,o])=>{if(o.st!='hurt'&&o.st!='down')f.cmb=0});
 for(const p of G.pj){p.x+=p.vx;const t=p.o==a?b:a;if(Math.abs(p.x-t.x)<14&&Math.abs(p.y-(t.y-35))<34){p.a.hit=0;hit(t,p.o,p.a);p.dead=1}if(p.x<-20||p.x>W+20)p.dead=1}
 G.pj=G.pj.filter(p=>!p.dead);
 if(live){if(a.hp<=0||b.hp<=0)endRound();else if(++G.ft%60==0&&--G.tm<=0)endRound()}
 if(G.ph=='ko'){G.pt++;if(G.pt>60&&G.w&&G.w.y>=GY&&G.w.st!='down')G.w.st='win';if(G.pt>170){if(G.f.some(f=>f.wins>=2))result();else{G.rd++;newRound()}}}
 G.sp.forEach(s=>{s.x+=s.vx;s.y+=s.vy;s.t--});G.fx.forEach(e=>e.t++);G.fx=G.fx.filter(e=>e.t<e.d);if(G.ph=='ko'&&G.w&&SPR[G.w.i]&&SPR[G.w.i].ok&&fr%7==0)fx(G.w.i,'spark',G.w.x+(Math.random()-.5)*60,G.w.y-30-Math.random()*60,.5,26);G.sp=G.sp.filter(s=>s.t>0);G.pp.forEach(p=>{p.t--;p.y-=.5});G.pp=G.pp.filter(p=>p.t>0)}
// render
function bg(){const s=ST[G.st],ox=(G.f[0].x+G.f[1].x)/2-W/2,g=x.createLinearGradient(0,0,0,GY);g.addColorStop(0,s.a);g.addColorStop(1,s.b);x.fillStyle=g;x.fillRect(-30,-30,W+60,H+60);
 if(G.st==2){x.fillStyle='#fff8';x.beginPath();x.arc(380-ox*.03,55,22,0,7);x.fill()}
 [[.06,s.l1,50,26],[.14,s.l2,80,36]].forEach(([k,c,mh,w],L)=>{x.fillStyle=c;for(let i=-3;i<W/w+4;i++){const hh=20+(((i*i*7+i*13+L*5)%9)+9)%9*mh/9,bx=i*w-ox*k;
  if(G.st==2){x.beginPath();x.ellipse(bx+w/2,GY,w*.9,hh*.5,0,Math.PI,0);x.fill()}else{x.fillRect(bx,GY-hh,w-2,hh);
   if(L&&G.st==0)for(let j=0;j<hh/10-1;j++)if((i+j*3)%3==0){x.fillStyle=(fr>>5)%7==((i%7)+7)%7?'#334':'#fd8';x.fillRect(bx+6,GY-hh+6+j*10,4,5);x.fillStyle=c}
   if(G.st==1&&i%4==0){x.fillRect(bx+8,GY-hh-30,10,30);x.fillStyle='#fff3';x.beginPath();x.arc(bx+13+Math.sin(fr/30+i)*6,GY-hh-40-(fr+i*20)%40,8,0,7);x.fill();x.fillStyle=c}}}});
 x.fillStyle=s.g;x.fillRect(0,GY,W,H-GY);x.fillStyle='#fff3';x.fillRect(0,GY,W,2);x.fillStyle='#0003';x.fillRect(0,GY+14,W,1);x.fillRect(0,GY+26,W,1)}
function vstep(f){if(f.st!==f.ps){f.ps=f.st;f.sc=0}else f.sc++;if(f.st=='atk'){f.vw=1;f.vt=4;f.tn=0;f.pf=f.f;return}
 if(f.f!==f.pf){f.pf=f.f;if(f.st=='walk')f.tn=8}if(f.tn>0)f.tn--;
 const tg=(f.st=='idle'||f.st=='win')?0:1;if(f.vw!=tg){if(--f.vt<=0){f.vw=f.vw==2?tg:2;f.vt=4}}else f.vt=4}
function fx(i,role,px,py,sc,d,dir=1){const s=SPR[i];if(!s||!s.ok||!G)return;const e=s.m.fx[role]||(role=='ring'?s.m.fx.burst:null);if(!e)return;G.fx.push({i,e,role,x:px,y:py,s:sc,d,t:0,dir})}
function drawFX(){G.fx.forEach(o=>{const s=SPR[o.i],k=o.t/o.d,z=o.s*(.6+.6*k)/2;x.save();x.globalAlpha=Math.max(0,1-k*k);x.translate(o.x,o.y);x.scale(o.dir,1);x.drawImage(s.img,o.e.x,o.e.y,o.e.w,o.e.h,-o.e.w*z,-o.e.h*z,o.e.w*2*z,o.e.h*2*z);x.restore()})}
// pilih frame sprite: [bagian, indeks, mode-anchor]
function spf(f){const s=f.st,a=f.a,t=f.t,gr=f.y>=GY;
 if(s=='atk'){const k=a.k;
  if(k=='p'||k=='k'){const q=t<a.su*.5?0:t<a.su?1:t<a.su+a.ac?2:3;return[k=='p'?'PUNCH':'KICK',q]}
  if(k=='f')return['BURST',t<4?0:t<7?1:t<a.su?2:t<a.su+8?3:2];
  if(k=='d')return['DASH',t<3?0:t<a.su?1:t<a.su+a.ac*.5?2:t<a.su+a.ac?3:1];
  if(k=='u'){const q=t-a.su;return['RISING',t<a.su?0:q<2?1:q<4?2:t<a.su+a.ac?3:f.vy<0?3:2]}
  if(k=='U'){if(t<a.su)return['ULT',Math.min(3,t*4/a.su|0)];if(t<a.su+a.ac)return['ULT',4,1];return['ULT',t<a.su+a.ac+11?5:6]}}
 if(s=='walk'){const FR=SPR[f.i]&&SPR[f.i].m.frames,run=f.run&&FR&&FR.RUN&&FR.RUN.length,n=run?FR.RUN.length:(FR&&FR.WALK?FR.WALK.length:6),k=((fr/(run?3:Math.abs(f.vx)>2?3:5))|0)%n,back=f.vx*f.f<0;if(f.tn>0)return['TURN',1];return[run?'RUN':'WALK',back?n-1-k:k]}
 if(s=='jump')return['JUMP',f.sc<4&&f.vy<0?0:f.vy<0?1:2];
 if(s=='crouch')return['CROUCH',f.sc<4?0:1];
 if(s=='block')return['GUARD',f.sc<3?0:1];
 if(s=='hurt')return['HIT',f.sc<8?1:0];
 if(s=='down')return['FALL',!gr?(f.vy<0?0:1):(f.hp>0&&f.t>38)?2:f.t<8?2:3];
 if(s=='win')return['WIN',Math.min(3,f.sc/14|0)];
 if(G.ph=='ko'&&G.w&&G.w!==f&&s=='idle')return['LOSE',f.sc<14?0:1];
 const v=f.tn>0?2:f.vw;if(v==2)return['TURN',1];if(v==1)return['TURN',2];
 return['IDLE',(fr/24|0)%2]}
function drawSpr(f,off,al){const S=SPR[f.i],[sec,i0,c]=spf(f),FB={JUMP:'IDLE',RUN:'WALK',CROUCH:'IDLE',GUARD:'IDLE',TURN:'IDLE',HIT:'IDLE',FALL:'HIT',WIN:'IDLE',LOSE:'FALL',BURST:'PUNCH',DASH:'PUNCH',RISING:'KICK',ULT:'KICK',PUNCH:'IDLE',KICK:'PUNCH'};let sc2=sec;while((!S.m.frames[sc2]||!S.m.frames[sc2].length)&&FB[sc2])sc2=FB[sc2];const arr=S.m.frames[sc2],m=arr[Math.min(i0,arr.length-1)],i=i0;
 if(!off){x.fillStyle='#0006';x.beginPath();x.ellipse(f.x,GY+2,18-Math.min(10,(GY-f.y)/10),4,0,0,7);x.fill()}
 x.save();x.globalAlpha=al;x.translate(f.x-f.f*off,f.y);x.scale(f.f,1);
 const ax=Math.round(m.ax)/2,ay=c?Math.round(m.cy)/2+38:Math.round(m.ay)/2;
 x.drawImage(S.img,m.x,m.y,m.w,m.h,-ax,-ay,m.w/2,m.h/2);x.restore()}
function drawF(f,off=0,al=1){if(SPR[f.i]&&SPR[f.i].ok)return drawSpr(f,off,al)}
function render(){x.setTransform(2,0,0,2,0,0);x.imageSmoothingEnabled=false;let sx=0,sy=0;if(G.sh>.3){sx=(Math.random()-.5)*G.sh;sy=(Math.random()-.5)*G.sh;G.sh*=.85}
 G.zm=(G.zm||1)+((G.cin>0?1.25:1)-(G.zm||1))*.2;x.save();x.translate(sx,sy);if(G.zm>1.01&&G.cf){x.translate(W/2,170);x.scale(G.zm,G.zm);x.translate(-G.cf.x,-170)}
 bg();if(G.cin>0){x.fillStyle='#000a';x.fillRect(-W,-H,W*3,H*3)}
 [...G.f].sort((p,q)=>(p==G.cf&&G.cin>0)-(q==G.cf&&G.cin>0)).forEach(f=>{const a=f.a;if(a&&(a.k=='U'||a.k=='d')&&f.t>=a.su){drawF(f,26,.2);drawF(f,13,.35);if(!(SPR[f.i]&&SPR[f.i].ok)){x.fillStyle='#fd08';x.fillRect(f.x-f.f*60-(f.f>0?0:-0),f.y-44,60,6)}}drawF(f)});
 G.pj.forEach(p=>{const S=SPR[p.o.i],e=S&&S.ok&&(S.m.fx.bolt||S.m.fx.burst);if(e){const z=S.m.fx.bolt?.5:.35;x.save();x.translate(p.x,p.y);x.scale(p.vx<0?-1:1,1);x.drawImage(S.img,e.x,e.y,e.w,e.h,-e.w*z/2,-e.h*z/2,e.w*z,e.h*z);x.restore();return}x.fillStyle='#f806';x.beginPath();x.arc(p.x,p.y,8,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(p.x,p.y,4,0,7);x.fill()});
 drawFX();G.sp.forEach(s=>{x.fillStyle=s.c;x.fillRect(s.x,s.y,3,3)});x.font='bold 10px monospace';x.textAlign='center';G.pp.forEach(p=>{x.fillStyle='#fd0';x.fillText(p.s,p.x,p.y)});x.restore();hud()}
function hud(){const[a,b]=G.f;x.font='bold 9px monospace';
 [[a,50,1],[b,W-50,-1]].forEach(([f,px,d])=>{const bw=150,p=Math.max(0,f.hp)/100,rdy=f.en>=100&&(fr>>3)%2,bx=d>0?6:W-42;
  x.fillStyle='#000c';x.fillRect(bx,6,36,38);x.fillStyle=rdy?'#fff':'#fd0';x.fillRect(bx,6,36,2);x.drawImage(PH[f.i],bx+3,9,30,34);
  x.fillStyle='#000c';x.fillRect((d>0?px:px-bw)-1,13,bw+2,12);x.fillStyle=p>.5?'#3d3':p>.25?'#fc2':'#f33';const w=bw*p;x.fillRect(d>0?px:px-w,14,w,10);x.fillStyle='#fff4';x.fillRect(d>0?px:px-w,14,w,3);
  for(let i=0;i<4;i++){const fl=Math.min(1,Math.max(0,f.en/25-i)),x0=d>0?px+i*38:px-36-i*38;x.fillStyle='#223';x.fillRect(x0,28,36,5);x.fillStyle=rdy?'#fff':'#4af';x.fillRect(d>0?x0:x0+36*(1-fl),28,36*fl,5)}
  x.textAlign=d>0?'left':'right';x.fillStyle='#fff';x.fillText(R[f.i].toUpperCase()+(f.en>=100?' ULT!':''),px,10);
  for(let i=0;i<2;i++){x.fillStyle=i<f.wins?'#fd0':'#444';x.fillRect(d>0?px+i*9:px-8-i*9,37,7,5)}
  if(f.cmb>1){x.fillStyle='#fd0';x.font='bold 14px monospace';x.fillText(f.cmb+' HITS',px,70);x.font='bold 9px monospace'}});
 x.textAlign='center';x.fillStyle='#fff';x.font='bold 18px monospace';x.fillText(Math.max(0,G.tm),W/2,26);
 let m='';if(G.ph=='intro')m=G.pt<55?'ROUND '+G.rd:G.pt<110?'FIGHT!':'';else if(G.ph=='ko')m=G.msg;if(G.cin>0)m='RIDER KICK!';
 if(m){x.font='bold 30px monospace';x.fillStyle='#000';x.fillText(m,W/2+2,122);x.fillStyle='#fd0';x.fillText(m,W/2,120)}}
// UI & alur
const ui=$('ui'),MB=(a,ic,t,c='',v='')=>`<button class="mb ${c}" data-a="${a}" data-v="${v}">${IC[ic]}<b>${t}</b></button>`,HD='<h1>KAMEN RIDER<span>PIXEL FIGHTERS</span></h1>';let started=0;
const isFS=()=>document.fullscreenElement||document.webkitFullscreenElement;
function goFS(){const e=document.documentElement;try{const p=(e.requestFullscreen||e.webkitRequestFullscreen).call(e);p&&p.catch&&p.catch(()=>{})}catch(_){}try{screen.orientation.lock('landscape').catch(()=>{})}catch(_){}}
function show(h){ui.innerHTML=h;ui.style.display=h?'flex':'none';$('pb').style.display=h?'none':'block';$('tc').style.display=(!h&&S.touch)?'block':'none';document.documentElement.style.setProperty('--ts',[.8,1,1.25][S.tsz])}
function splash(){show(`${BELT}${HD}${MB('start','play','TEKAN UNTUK MULAI','big')}<small>MODE LAYAR PENUH WAJIB</small>`)}
function title(){G=null;paused=false;show(`${BELT}${HD}${MB('m1','cpu','MAIN VS CPU')}${MB('onl','users','MAIN ONLINE','b')}${MB('set','gear','PENGATURAN','g')}<small>WASD / Panah: gerak &nbsp; J pukul &nbsp; K tendang &nbsp; L spesial &nbsp; U ultimate &nbsp; Shift tahan &nbsp; | &nbsp; HP: joystick + tombol</small>`)}
function settings(){show(`<h2>PENGATURAN</h2>${MB('diff','cpu','CPU: '+['MUDAH','NORMAL','SULIT','EXPERT'][S.diff])}${MB('snd','sound','SUARA: '+(S.snd?'ON':'OFF'),'b')}${MB('touch','touch','TOMBOL LAYAR: '+(S.touch?'ON':'OFF'),'g')}${MB('tsz','touch','UKURAN TOMBOL: '+['KECIL','SEDANG','BESAR'][S.tsz])}${MB('menu','back','KEMBALI','sm')}`)}
function pause(v){paused=v;show(v?`<h2>JEDA</h2>${MB('resume','play','LANJUT','g')}${MB('menu','home','MENU UTAMA')}`:'')}
function pick(){sel=[];sp()}
function sp(){show(`<h2>PILIH <em>RIDER</em></h2><div class="gr">${R.map((r,i)=>`<div class="cd${sel[0]===i?' on':''}" data-a="pk" data-v="${i}" style="--c:${RD[i].e}"><img src="${PT[i]}"><b>${r}</b><i>${MV[i%3]}</i></div>`).join('')}</div>${MB('menu','home','MENU','sm')}`)}
function pk(i){if(NETON())return netPick(i);let c;do c=Math.random()*R.length|0;while(c==i);sel=[i,c];stg()}
function stg(){show(`<h2>PILIH ARENA</h2><div class="row">${ST.map((s,i)=>`<div class="cd st" data-a="stage" data-v="${i}" style="background:linear-gradient(${s.a},${s.b})"><b>${s.n}</b></div>`).join('')}</div>${MB('menu','home','MENU','sm')}`)}
function vsScr(){show(`<div class="vs"><div class="l"><img src="${PT[sel[0]]}"><b>${R[sel[0]]}</b></div><div class="vsb">VS</div><div class="r"><img src="${PT[sel[1]]}"><b>${R[sel[1]]}</b></div></div><h2 class="hen">HENSHIN!</h2><div class="flash"></div>`);setTimeout(NET.role=='guest'?startGuest:startGame,1700)}
function startGame(){G={f:[mk(sel[0],0,0),mk(sel[1],1,NETON()?0:1)],st:sg,rd:1,sh:0,zm:1,hs:0};show('');newRound()}
function result(){G.ph='end';resultUI(G.f[0].wins>=2?0:1)}
function resultUI(w){const me=NET.role=='guest'?1:0,win=NETON()?w==me:!w;show(`<h2 class="hen">${win?'KAMU MENANG!':'KAMU KALAH!'}</h2><div class="vs"><div><img src="${PT[G.f[w].i]}"><b>${R[G.f[w].i]}</b></div></div>${MB('again','redo','MAIN LAGI')}${MB('sel','users','GANTI RIDER','b')}${MB('menu','home','MENU UTAMA','g')}`)}
window.onSprites=()=>{if(document.querySelector('.gr'))sp()};
const A={start(){goFS();started=1;if(G&&G.ph!='end'){paused=false;show('')}else title()},m1:pick,set:settings,diff(){S.diff=(S.diff+1)%4;settings()},snd(){S.snd^=1;settings()},touch(){S.touch=!S.touch;settings()},tsz(){S.tsz=(S.tsz+1)%3;settings()},menu(){netReset();title()},onl:netMenu,host:netHost,join:netJoinScr,jn:netJoin,pk,stage(v){sg=v;if(NETON()){sel=[NET.picks[0],NET.picks[1]];nsend({t:'start',sel,sg})}vsScr()},resume(){pause(false)},again(){NETON()?netAgain():startGame()},sel(){NETON()?netResel():pick()}};
ui.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(b&&A[b.dataset.a]){e.preventDefault();A[b.dataset.a](+b.dataset.v)}});
$('pb').innerHTML=IC.pause;$('pb').addEventListener('click',()=>{if(G&&G.ph!='end'&&!NETON())pause(!paused)});
['fullscreenchange','webkitfullscreenchange'].forEach(ev=>document.addEventListener(ev,()=>{if(started&&!isFS()){if(G&&G.ph!='end'&&!NETON())paused=true;splash()}}));
let last=0,acc=0;function loop(t){acc+=Math.min(50,t-last);last=t;while(acc>=16.67){acc-=16.67;tick();if(NET.role=='host'&&G&&G.f)NET.dirty=1}if(NET.dirty){NET.dirty=0;nsend(snapOf())}if(G)render();requestAnimationFrame(loop)}
splash();requestAnimationFrame(loop);
