const C = window.NEXUS_CFG || {};
const $ = s => document.querySelector(s);
const sb = (window.supabase && C.url && C.url.startsWith('http'))
  ? supabase.createClient(C.url, C.key)
  : null;

if ($('#fb') && C.facebook) $('#fb').href = C.facebook;
if ($('#ig') && C.instagram) $('#ig').href = C.instagram;

// Luz de scroll + hero reactivo
addEventListener('scroll', () => {
  const max = Math.max(1, document.body.scrollHeight - innerHeight);
  if ($('#luz')) $('#luz').style.transform = `scaleY(${scrollY / max})`;
}, { passive: true });

if ($('#hero')) {
  $('#hero').addEventListener('pointermove', e => {
    const r = $('#hero').getBoundingClientRect();
    $('#hero').style.setProperty('--mx', `${e.clientX - r.left}px`);
    $('#hero').style.setProperty('--my', `${e.clientY - r.top}px`);
  });
}

// Misión y Visión reveal
document.querySelectorAll('.mv article').forEach(a =>
  new IntersectionObserver(es => {
    if (es[0].isIntersecting) a.classList.add('vis');
  }, { threshold: .2 }).observe(a)
);

// Palabra rotativa en portada
const W = ['UNIDAD', 'CONEXIÓN', 'PASIÓN'];
let wi = 0;
setInterval(() => {
  const r = $('#rot');
  if (!r) return;
  r.classList.add('out');
  setTimeout(() => {
    r.textContent = W[++wi % W.length];
    r.classList.remove('out');
  }, 320);
}, 2400);

// NEXUS interactivo
const L = {
  N: ['Nuevos comienzos', 'Aquí nadie llega tarde. Cada día es una nueva oportunidad para empezar de nuevo con Dios.'],
  E: ['Esperanza', 'Jesús es la esperanza que nos mantiene firmes y con ganas de seguir avanzando juntos.'],
  X: ['JESÚS ES EL CENTRO', 'Jesús en el centro no es solo una frase bonita: es aprender a mirar a los demás como Él los mira y construir una unidad que no se rompe.'],
  U: ['Unidad', 'Somos diferentes, pero caminamos juntos. Nadie en Nexus avanza solo.'],
  S: ['Servicio', 'Crecemos cuando servimos. Cada talento es una forma de acercar a otros a Jesús.']
};

document.querySelectorAll('#letras button').forEach(b => {
  b.onclick = () => {
    const k = b.dataset.k;
    const cr = k === 'X';
    document.querySelectorAll('#letras button').forEach(x => x.classList.remove('on'));
    b.classList.add('on');
    $('#letras').classList.add('sel');
    $('#bx').classList.toggle('cruz', cr);
    const rev = $('#rev');
    rev.classList.remove('show');
    void rev.offsetWidth;
    setTimeout(() => {
      $('#rt').textContent = L[k][0];
      $('#rp').textContent = L[k][1];
      rev.classList.add('show');
    }, cr ? 550 : 0);
  };
});

// Una palabra
let F = window.NEXUS_FRASES || [];
(async () => {
  if (!sb) return;
  const { data } = await sb.from('frases').select('*').eq('activa', true);
  if (data && data.length) F = data;
})();

let last = -1;
$('#bpal').onclick = () => {
  if (!F.length) return;
  let i;
  do { i = Math.floor(Math.random() * F.length); } while (i === last && F.length > 1);
  last = i;
  const f = F[i];
  const c = $('#card');
  c.dataset.t = f.tipo || 'reflexion';
  $('#ptxt').textContent = f.texto;
  $('#pref').textContent = f.ref || '';
  c.classList.remove('sw');
  void c.offsetWidth;
  c.classList.add('sw');
};

// Quiero ser parte de esto (Supabase como fuente de verdad)
let shown = 0;
function anim(to) {
  const e = $('#num');
  if (!e) return;
  const f = shown;
  const t0 = performance.now();
  shown = to;
  (function s(t) {
    const p = Math.min((t - t0) / 650, 1);
    e.textContent = Math.round(f + (to - f) * p).toLocaleString('es');
    if (p < 1) requestAnimationFrame(s);
  })(t0);
  e.animate([{ scale: 1.18 }, { scale: 1 }], { duration: 420, easing: 'cubic-bezier(.2,1.4,.4,1)' });
}

const msg = (id, t) => { const el = $(id); if (el) el.textContent = t; };

if (sb) {
  (async () => {
    const { data } = await sb.from('contador').select('total').eq('id', 1).single();
    if (data) anim(+data.total);
  })();
  sb.channel('c')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'contador' }, p => anim(+p.new.total))
    .subscribe();
} else {
  msg('#ccm', 'Conecta Supabase en config.js para activar el contador.');
}

$('#bcc').onclick = async () => {
  const b = $('#bcc');
  if (!sb) return;
  b.disabled = true;
  const { data, error } = await sb.rpc('cuenta_conmigo');
  if (error) {
    msg('#ccm', 'No pudimos registrar tu paso ahora. Intenta de nuevo en unos segundos.');
  } else {
    anim(+data);
    msg('#ccm', '¡Qué alegría que seas parte de esto!');
  }
  setTimeout(() => { b.disabled = false; }, 5000);
};

// Hablemos limpio
const qInput = $('#q');
$('#bq').onclick = async () => {
  const t = qInput.value.trim();
  if (t.length < 5) return msg('#qm', 'Escribe al menos 5 caracteres.');
  if (!sb) return msg('#qm', 'Conecta Supabase en config.js para enviar preguntas.');
  $('#bq').disabled = true;
  const { error } = await sb.from('preguntas').insert({ texto: t });
  msg('#qm', error ? 'No se pudo enviar. Intenta de nuevo.' : 'Recibido');
  if (!error) qInput.value = '';
  setTimeout(() => { $('#bq').disabled = false; }, 4500);
};

(async () => {
  if (!sb) return;
  const { data } = await sb
    .from('preguntas')
    .select('texto,respuesta')
    .eq('estado', 'aprobada')
    .order('creada', { ascending: false })
    .limit(10);
  (data || []).forEach(q => {
    const d = document.createElement('div');
    const b = document.createElement('b');
    b.textContent = q.texto;
    const p = document.createElement('span');
    p.textContent = q.respuesta || '';
    d.append(b, p);
    $('#resp').append(d);
  });
})();

// Momentos / Fotos en movimiento continuo
let G = [];
let gi = 0;
const mos = $('#mos');

function makeSlide(g, idx) {
  const slide = document.createElement('div');
  slide.className = 'slide';
  const im = new Image();
  im.src = g.url;
  im.alt = g.alt || `Momento Nexus ${idx + 1}`;
  im.loading = 'lazy';
  slide.append(im);
  slide.onclick = () => openLb(idx);
  return slide;
}

(async () => {
  if (sb) {
    const { data } = await sb.from('galeria').select('*').order('pos');
    G = (data || []).filter(x => x && x.url);
  }
  if (!G.length) {
    mos.classList.add('static-mode');
    const empty = document.createElement('div');
    empty.className = 'gal-empty';
    empty.textContent = 'Pronto subiremos los momentos en movimiento de Nexus aquí.';
    mos.append(empty);
    return;
  }
  G.forEach((g, idx) => mos.append(makeSlide(g, idx)));
  if (G.length > 1) {
    G.forEach((g, idx) => mos.append(makeSlide(g, idx)));
  } else {
    mos.classList.add('static-mode');
  }
})();

const openLb = idx => { gi = idx % G.length; $('#lb').hidden = false; showLb(); };
const showLb = () => {
  const g = G[gi];
  if (!g) return;
  $('#li').src = g.url;
  $('#li').alt = g.alt || '';
};
const navLb = d => { gi = (gi + d + G.length) % G.length; showLb(); };

$('#lx').onclick = () => { $('#lb').hidden = true; };
$('#lp').onclick = () => navLb(-1);
$('#ln').onclick = () => navLb(1);

addEventListener('keydown', e => {
  if ($('#lb').hidden) return;
  if (e.key === 'Escape') $('#lb').hidden = true;
  if (e.key === 'ArrowLeft') navLb(-1);
  if (e.key === 'ArrowRight') navLb(1);
});

let sx = 0;
$('#lb').addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
$('#lb').addEventListener('touchend', e => {
  const d = e.changedTouches[0].clientX - sx;
  if (Math.abs(d) > 50) navLb(d > 0 ? -1 : 1);
}, { passive: true });

/* ===== MOVIMIENTO ===== */
const RM = matchMedia('(prefers-reduced-motion:reduce)').matches;
setTimeout(() => $('#intro') && $('#intro').remove(), 2100);

const io = new IntersectionObserver(es => {
  es.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: .14 });

const lead = $('.lead');
if (lead) {
  lead.innerHTML = lead.textContent.trim().split(/\s+/).map((w, i) =>
    `<span class="w${/^Jesús/.test(w) ? ' hl' : ''}" style="transition-delay:${Math.min(i * 18, 600)}ms">${w}</span>`
  ).join(' ');
  io.observe(lead);
}

document.querySelectorAll('#letras button').forEach((b, i) => b.style.setProperty('--i', i));
if ($('#letras')) io.observe($('#letras'));

document.querySelectorAll('h2,#card,#cc p,#hab p,#hab textarea,.redes a,footer p,.cap').forEach(e => {
  e.classList.add('rv');
  io.observe(e);
});

const hs = $('#hero h1 span');
if (hs) {
  hs.innerHTML = [...hs.textContent.trim()].map((c, i) =>
    `<i class="ch" style="--i:${i}">${c}</i>`
  ).join('');
}

document.querySelectorAll('.mq div').forEach(d => {
  d.textContent = 'JESÚS ES EL CENTRO ● UNIDAD ● CONEXIÓN ● PASIÓN ● '.repeat(8);
});

let ly = scrollY;
let sk = 0;
if (!RM) {
  (function tick() {
    const y = scrollY;
    const s = document.documentElement.style;
    sk += (Math.max(-5, Math.min(5, (y - ly) * .22)) - sk) * .14;
    ly = y;
    s.setProperty('--sk', `${sk.toFixed(2)}deg`);
    s.setProperty('--py', y);
    if ($('#nav')) $('#nav').classList.toggle('sc', y > 40);
    requestAnimationFrame(tick);
  })();
}

if (matchMedia('(pointer:fine)').matches && !RM) {
  const c = $('#cur');
  let x = 0, y = 0, tx = 0, ty = 0;
  addEventListener('pointermove', e => {
    tx = e.clientX;
    ty = e.clientY;
    if (c) c.classList.toggle('h', !!e.target.closest('a,button,textarea,.slide'));
  });
  (function moveCur() {
    x += (tx - x) * .2;
    y += (ty - y) * .2;
    if (c) c.style.translate = `${x}px ${y}px`;
    requestAnimationFrame(moveCur);
  })();
}
