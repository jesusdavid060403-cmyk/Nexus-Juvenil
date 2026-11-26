const C=window.NEXUS_CFG,$=s=>document.querySelector(s);
const sb=(window.supabase&&C.url.startsWith('http'))?supabase.createClient(C.url,C.key):null;
$('#fb').href=C.facebook;$('#ig').href=C.instagram;
// Luz de scroll + reveal + hero reactivo
addEventListener('scroll',()=>{$('#luz').style.transform=`scaleY(${scrollY/(document.body.scrollHeight-innerHeight)})`},{passive:true});
$('#hero').addEventListener('pointermove',e=>{const h=$('#hero');h.style.setProperty('--mx',e.clientX+'px');h.style.setProperty('--my',e.clientY+'px')});
new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&e.target.classList.add('vis')),{threshold:.3}).observe($('.mv')),
document.querySelectorAll('.mv article').forEach(a=>new IntersectionObserver(es=>es[0].isIntersecting&&a.classList.add('vis'),{threshold:.3}).observe(a));
const W=['UNIDAD','CONEXIÓN','PROPÓSITO'];let wi=0;
setInterval(()=>{const r=$('#rot');r.classList.add('out');setTimeout(()=>{r.textContent=W[++wi%3];r.classList.remove('out')},400)},2400);
// NEXUS
const L={N:['Nuevos comienzos','Aquí nadie llega tarde. Cada día es una nueva oportunidad para empezar de nuevo con Dios.'],
E:['Esperanza','Aunque hoy pese, hay un futuro preparado para ti. La esperanza camina con nosotros.'],
X:['JESÚS ES EL CENTRO','Nuestra comunidad, nuestra unidad y nuestro propósito se sostienen en Jesucristo. Sin Él solo nos cruzamos; con Él, nos encontramos.'],
U:['Unidad','Somos diferentes, pero caminamos juntos. Nadie en Nexus avanza solo.'],
S:['Servicio','Crecemos cuando servimos. Cada talento es una forma de acercar a otros a Jesús.']};
document.querySelectorAll('#letras button').forEach(b=>b.onclick=()=>{
 const k=b.dataset.k,cr=k==='X';document.querySelectorAll('#letras button').forEach(x=>x.classList.remove('on'));
 b.classList.add('on');$('#letras').classList.add('sel');$('#bx').classList.toggle('cruz',cr);
 const r=$('#rev');r.classList.remove('show');void r.offsetWidth;
 setTimeout(()=>{$('#rt').textContent=L[k][0];$('#rp').textContent=L[k][1];r.classList.add('show')},cr?900:0)});
// Palabra
let F=window.NEXUS_FRASES||[];
(async()=>{if(!sb)return;const{data}=await sb.from('frases').select('*').eq('activa',true);if(data&&data.length)F=data})();
let last=-1;$('#bpal').onclick=()=>{let i;do{i=Math.floor(Math.random()*F.length)}while(i===last&&F.length>1);last=i;
 const f=F[i],c=$('#card');c.dataset.t=f.tipo;$('#ptxt').textContent=f.texto;$('#pref').textContent=f.ref||''};
// Contador global (Supabase es la unica fuente de verdad)
let shown=0;function anim(to){const e=$('#num'),f=shown,t0=performance.now();shown=to;
 (function s(t){const p=Math.min((t-t0)/700,1);e.textContent=Math.round(f+(to-f)*p).toLocaleString('es');p<1&&requestAnimationFrame(s)})(t0)}
const msg=(id,t)=>$(id).textContent=t;
if(sb){(async()=>{const{data}=await sb.from('contador').select('total').eq('id',1).single();data&&anim(+data.total)})();
 sb.channel('c').on('postgres_changes',{event:'UPDATE',schema:'public',table:'contador'},p=>anim(+p.new.total)).subscribe()}
else msg('#ccm','Conecta Supabase en config.js para activar el contador.');
$('#bcc').onclick=async()=>{const b=$('#bcc');if(!sb)return;b.disabled=true;
 const{data,error}=await sb.rpc('cuenta_conmigo');
 if(error)msg('#ccm','No pudimos sumarte ahora. Intenta de nuevo en unos segundos.');else{anim(+data);msg('#ccm','¡Contamos contigo!')}
 setTimeout(()=>b.disabled=false,6000)};
// Hablemos
$('#bq').onclick=async()=>{const t=$('#q').value.trim();if(t.length<5)return msg('#qm','Escribe al menos 5 caracteres.');
 if(!sb)return msg('#qm','Conecta Supabase en config.js para enviar preguntas.');
 $('#bq').disabled=true;const{error}=await sb.from('preguntas').insert({texto:t});
 msg('#qm',error?'No se pudo enviar. Intenta de nuevo.':'Recibida. Se publicará solo si el equipo la aprueba.');if(!error)$('#q').value='';setTimeout(()=>$('#bq').disabled=false,5000)};
(async()=>{if(!sb)return;const{data}=await sb.from('preguntas').select('texto,respuesta').eq('estado','aprobada').order('creada',{ascending:false}).limit(10);
 (data||[]).forEach(q=>{const d=document.createElement('div'),b=document.createElement('b');b.textContent=q.texto;d.append(b,document.createElement('br'),q.respuesta||'');$('#resp').append(d)})})();
// Galeria (6 fotos)
let G=[],gi=0;const mos=$('#mos');
(async()=>{if(sb){const{data}=await sb.from('galeria').select('*').order('pos');G=data||[]}
 for(let i=1;i<=6;i++){const g=G.find(x=>x.pos===i),d=document.createElement('div');
  if(g){const im=new Image();im.src=g.url;im.alt=g.alt||'Momento Nexus '+i;im.loading='lazy';d.append(im);d.onclick=()=>open(g.pos)}mos.append(d)}})();
const open=p=>{gi=G.findIndex(x=>x.pos===p);$('#lb').hidden=false;show()},show=()=>{const g=G[gi];$('#li').src=g.url;$('#li').alt=g.alt||''},
nav=d=>{gi=(gi+d+G.length)%G.length;show()};
$('#lx').onclick=()=>$('#lb').hidden=true;$('#lp').onclick=()=>nav(-1);$('#ln').onclick=()=>nav(1);
addEventListener('keydown',e=>{if($('#lb').hidden)return;if(e.key==='Escape')$('#lb').hidden=true;if(e.key==='ArrowLeft')nav(-1);if(e.key==='ArrowRight')nav(1)});
let sx=0;$('#lb').addEventListener('touchstart',e=>sx=e.touches[0].clientX);$('#lb').addEventListener('touchend',e=>{const d=e.changedTouches[0].clientX-sx;Math.abs(d)>50&&nav(d>0?-1:1)});

/* ===== MOVIMIENTO ===== */
const RM=matchMedia('(prefers-reduced-motion:reduce)').matches;
setTimeout(()=>$('#intro')&&$('#intro').remove(),2400);
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.15});
const lead=$('.lead');lead.innerHTML=lead.textContent.split(' ').map((w,i)=>`<span class="w${/^Jesús/.test(w)?' hl':''}" style="transition-delay:${i*25}ms">${w}</span>`).join(' ');io.observe(lead);
document.querySelectorAll('#letras button').forEach((b,i)=>b.style.setProperty('--i',i));io.observe($('#letras'));
document.querySelectorAll('h2,#card,#cc p,#hab p,#hab textarea,.redes a,footer p').forEach(e=>{e.classList.add('rv');io.observe(e)});
const hs=$('#hero h1 span');hs.innerHTML=[...hs.textContent].map((c,i)=>`<i class="ch" style="--i:${i}">${c}</i>`).join('');
document.querySelectorAll('.mq div').forEach(d=>d.textContent='JESÚS AL CENTRO ✦ UNIDAD ✦ CONEXIÓN ✦ PROPÓSITO ✦ '.repeat(8));
let ly=scrollY,sk=0;if(!RM)(function t(){const y=scrollY,s=document.documentElement.style;sk+=(Math.max(-6,Math.min(6,(y-ly)*.25))-sk)*.12;ly=y;s.setProperty('--sk',sk+'deg');s.setProperty('--py',y);$('#nav').classList.toggle('sc',y>40);requestAnimationFrame(t)})();
if(matchMedia('(pointer:fine)').matches&&!RM){const c=$('#cur');let x=0,y=0,tx=0,ty=0;
 addEventListener('pointermove',e=>{tx=e.clientX;ty=e.clientY;c.classList.toggle('h',!!e.target.closest('a,button,textarea,#mos div'))});
 (function m(){x+=(tx-x)*.2;y+=(ty-y)*.2;c.style.translate=`${x}px ${y}px`;requestAnimationFrame(m)})();
 document.querySelectorAll('.btn').forEach(b=>{b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect();b.style.translate=`${(e.clientX-r.left-r.width/2)*.2}px ${(e.clientY-r.top-r.height/2)*.3}px`});b.addEventListener('pointerleave',()=>b.style.translate='')})}
$('#bpal').addEventListener('click',()=>{const c=$('#card');c.classList.remove('sw');void c.offsetWidth;c.classList.add('sw')});
new MutationObserver(()=>document.querySelectorAll('#mos div:not(.rv)').forEach((d,i)=>{d.classList.add('rv');d.style.transitionDelay=i*120+'ms';io.observe(d)})).observe(mos,{childList:true});
const _a=anim;anim=n=>{_a(n);$('#num').animate([{scale:1.25,rotate:'-3deg'},{scale:1,rotate:'0deg'}],{duration:500,easing:'cubic-bezier(.2,1.5,.4,1)'})};
