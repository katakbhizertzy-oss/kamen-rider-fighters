// ===== Mode online 1v1 (WebRTC lewat PeerJS). Host menjalankan game, tamu kirim input & terima snapshot. =====
const NET={role:null,peer:null,conn:null,code:'',picks:[null,null],my:null,ag:[0,0],dirty:0};
const NETON=()=>!!NET.role;
const CODECH='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ICE={iceServers:[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'},{urls:'stun:global.stun.twilio.com:3478'}]};
function nsend(o){try{if(NET.conn&&NET.conn.open)NET.conn.send(o)}catch(e){}}
function netReset(){const c=NET.conn,p=NET.peer;NET.role=null;NET.conn=NET.peer=null;NET.picks=[null,null];NET.my=null;NET.ag=[0,0];try{c&&c.close()}catch(e){}try{p&&p.destroy()}catch(e){}}
function netFail(msg){G=null;paused=false;netReset();show(`<h2>${msg}</h2>${MB('menu','home','MENU UTAMA')}`)}
function netMenu(){netReset();show(`<h2>MAIN <em>ONLINE</em></h2>${MB('host','play','BUAT ROOM')}${MB('join','users','GABUNG ROOM','b')}${MB('menu','back','KEMBALI','sm')}<small>Satu orang buat room, kirim kodenya ke temen. Keduanya butuh internet.</small>`)}
function netBind(c){c.on('data',netRecv);c.on('close',()=>{if(NET.role)netFail('LAWAN TERPUTUS')});c.on('error',()=>{if(NET.role)netFail('KONEKSI BERMASALAH')})}
function netHost(){netReset();if(typeof Peer=='undefined')return netFail('PEERJS GAGAL DIMUAT (cek internet)');
 NET.role='host';let code='';for(let i=0;i<4;i++)code+=CODECH[Math.random()*CODECH.length|0];NET.code=code;
 show(`<h2>KODE ROOM</h2><h1 style="font-size:12vh">${code}</h1><small>Kirim kode ini ke temen lo, lalu tunggu dia gabung...</small>${MB('menu','back','BATAL','sm')}`);
 const pr=NET.peer=new Peer('krpf-'+code,{config:ICE});
 pr.on('error',e=>{if(!NET.role)return;if(e.type=='unavailable-id')netHost();else netFail('GAGAL BUAT ROOM: '+e.type)});
 pr.on('connection',c=>{if(NET.conn){c.close();return}NET.conn=c;netBind(c);const go=()=>netPickScreen();c.open?go():c.on('open',go)})}
function netJoinScr(){netReset();show(`<h2>MASUKKAN KODE ROOM</h2><input id="rc" maxlength="4" autocapitalize="characters" autocomplete="off" spellcheck="false">${MB('jn','play','GABUNG','g')}${MB('onl','back','KEMBALI','sm')}`)}
function netJoin(){const code=(($('rc')||{}).value||'').toUpperCase().trim();if(code.length<4)return;if(typeof Peer=='undefined')return netFail('PEERJS GAGAL DIMUAT (cek internet)');
 netReset();NET.role='guest';show(`<h2>MENYAMBUNG KE ${code}...</h2>${MB('menu','back','BATAL','sm')}`);
 const pr=NET.peer=new Peer({config:ICE});
 pr.on('error',e=>{if(NET.role)netFail(e.type=='peer-unavailable'?'ROOM '+code+' TIDAK KETEMU':'KONEKSI GAGAL: '+e.type)});
 pr.on('open',()=>{const c=NET.conn=pr.connect('krpf-'+code,{reliable:true});netBind(c);c.on('open',()=>netPickScreen());
  setTimeout(()=>{if(NET.role&&NET.conn===c&&!c.open)netFail('GAGAL TERHUBUNG (jaringan mungkin memblokir koneksi langsung)')},15000)})}
function netPickScreen(){G=null;paused=false;NET.picks=[null,null];NET.my=null;NET.ag=[0,0];sel=[];sp()}
function netPick(i){NET.my=i;NET.picks[NET.role=='host'?0:1]=i;nsend({t:'pick',i});netAfterPick()}
function netAfterPick(){if(NET.my==null)return;if(NET.picks[0]==null||NET.picks[1]==null){show(`<h2>MENUNGGU LAWAN MEMILIH...</h2>`);return}
 if(NET.role=='host')stg();else show(`<h2>HOST MEMILIH ARENA...</h2>`)}
function netAgain(){NET.ag[NET.role=='host'?0:1]=1;nsend({t:'ag'});show(`<h2>MENUNGGU LAWAN...</h2>${MB('menu','home','MENU UTAMA','sm')}`);netAgChk()}
function netAgChk(){if(NET.role=='host'&&NET.ag[0]&&NET.ag[1]){NET.ag=[0,0];sel=[NET.picks[0],NET.picks[1]];nsend({t:'start',sel,sg});vsScr()}}
function netResel(){nsend({t:'resel'});netPickScreen()}
function snapOf(){const q=G.sq||[];G.sq=[];return{t:'s',f:G.f.map(f=>[f.i,+f.x.toFixed(1),+f.y.toFixed(1),+f.vx.toFixed(2),+f.vy.toFixed(2),f.f,f.hp,f.en,f.st,f.t,f.sc|0,f.wins,f.cmb,f.run?1:0,f.tn|0,f.vw|0,f.a?[f.a.k,f.a.su,f.a.ac,f.a.hit?1:0]:0,f.jg|0]),
 ph:G.ph,pt:G.pt,tm:G.tm,rd:G.rd,msg:G.msg||'',cin:G.cin,cf:G.cf?G.f.indexOf(G.cf):-1,sh:+G.sh.toFixed(1),w:G.w?G.f.indexOf(G.w):-1,wn:G.f[0].wins>=2?0:1,
 pj:G.pj.map(p=>[+p.x.toFixed(1),+p.y.toFixed(1),p.vx,G.f.indexOf(p.o)]),fx:G.fx.map(e=>[e.i,e.role,+e.x.toFixed(1),+e.y.toFixed(1),e.s,e.d,e.t,e.dir]),
 sp:G.sp.map(s=>[+s.x.toFixed(1),+s.y.toFixed(1),s.c,s.t]),pp:G.pp.map(p=>[+p.x.toFixed(1),+p.y.toFixed(1),p.t,p.s]),sq:q}}
function applySnap(s){if(!G||!G.net)return;
 s.f.forEach((a,k)=>{const f=G.f[k];[f.i,f.x,f.y,f.vx,f.vy,f.f,f.hp,f.en,f.st,f.t,f.sc,f.wins,f.cmb,f.run,f.tn,f.vw]=a;const m=a[16];f.a=m?{k:m[0],su:m[1],ac:m[2],hit:m[3]}:null;f.jg=a[17]});
 G.ph=s.ph==G.ph||G.ph!='end'?s.ph:G.ph;G.pt=s.pt;G.tm=s.tm;G.rd=s.rd;G.msg=s.msg;G.cin=s.cin;G.cf=s.cf>=0?G.f[s.cf]:G.cf;G.w=s.w>=0?G.f[s.w]:null;if(s.sh>G.sh)G.sh=s.sh;
 G.pj=s.pj.map(([x,y,vx,o])=>({x,y,vx,o:G.f[o]}));
 G.fx=s.fx.map(([i,role,x,y,sc,d,t,dir])=>{const S_=SPR[i],e=S_&&S_.ok&&(S_.m.fx[role]||(role=='ring'?S_.m.fx.burst:null));return e?{i,e,role,x,y,s:sc,d,t,dir}:null}).filter(Boolean);
 G.sp=s.sp.map(([x,y,c,t])=>({x,y,c,t,vx:0,vy:0}));G.pp=s.pp.map(([x,y,t,sc])=>({x,y,t,s:sc}));
 s.sq.forEach(a=>sfx(a[0],a[1],a[2],a[3]));
 if(s.ph=='end'&&!G.shown){G.shown=1;G.ph='end';resultUI(s.wn)}}
function netRecv(m){if(!m||!NET.role)return;
 if(m.t=='in'){if(NET.role=='host')act(1,m.a,m.d)}
 else if(m.t=='s'){if(NET.role=='guest')applySnap(m)}
 else if(m.t=='pick'){NET.picks[NET.role=='host'?1:0]=m.i;netAfterPick()}
 else if(m.t=='start'){if(NET.role=='guest'){sel=m.sel;sg=m.sg;vsScr()}}
 else if(m.t=='ag'){NET.ag[NET.role=='host'?1:0]=1;netAgChk()}
 else if(m.t=='resel'){netPickScreen()}}
function startGuest(){G={f:[mk(sel[0],0,0),mk(sel[1],1,0)],st:sg,rd:1,sh:0,zm:1,hs:0,net:1,fx:[],pj:[],sp:[],pp:[],ph:'intro',pt:0,tm:99,cin:0,msg:''};show('')}
