// CUSTOM CURSOR
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
function animCursor() {
  cursor.style.left = mx + 'px';
  cursor.style.top = my + 'px';
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  ring.style.left = rx + 'px';
  ring.style.top = ry + 'px';
  requestAnimationFrame(animCursor);
}
animCursor();

// LIGHTNING CANVAS
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function lightning(x1, y1, x2, y2, branches, depth) {
  if (depth === 0) return;
  const dx = x2 - x1, dy = y2 - y1;
  const mx = x1 + dx/2 + (Math.random() - 0.5) * 80;
  const my = y1 + dy/2 + (Math.random() - 0.5) * 80;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(mx, my);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = 'rgba(79, 184, 255, ' + (depth * 0.3) + ')';
  ctx.lineWidth = depth * 0.5;
  ctx.stroke();
  if (branches > 0 && depth > 1) {
    const bx = mx + (Math.random() - 0.5) * 200;
    const by = my + Math.random() * 200;
    lightning(mx, my, bx, by, 0, depth - 1);
  }
  lightning(x1, y1, mx, my, 0, depth - 1);
  lightning(mx, my, x2, y2, 0, depth - 1);
}

function drawLightning() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (Math.random() < 0.04) {
    const x = Math.random() * canvas.width;
    lightning(x, 0, x + (Math.random()-0.5)*300, canvas.height * 0.6, 2, 4);
  }
}
setInterval(drawLightning, 120);

// NAV SCROLL
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// SCROLL REVEAL
const reveals = document.querySelectorAll('.reveal, .timeline-item');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12 });
reveals.forEach(el => observer.observe(el));

// COUNTER ANIMATION
function animCount(el, target, suffix = '') {
  let start = 0;
  const duration = 1800;
  const step = timestamp => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(ease * target) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      counterObserver.unobserve(e.target);
      const id = e.target.id;
      if (id === 'count-patents') animCount(e.target, 300, '+');
      if (id === 'count-countries') animCount(e.target, 26);
      if (id === 'count-years') animCount(e.target, 100, '+');
    }
  });
}, { threshold: 0.5 });

['count-patents','count-countries','count-years'].forEach(id => {
  const el = document.getElementById(id);
  if (el) counterObserver.observe(el);
});

// QUOTES CAROUSEL
const slides = document.querySelectorAll('.quote-slide');
const controlsEl = document.getElementById('quoteControls');
let currentQ = 0;

slides.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.className = 'quote-dot' + (i === 0 ? ' active' : '');
  dot.addEventListener('click', () => goToQuote(i));
  controlsEl.appendChild(dot);
});

function goToQuote(idx) {
  slides[currentQ].classList.remove('active');
  controlsEl.children[currentQ].classList.remove('active');
  currentQ = idx;
  slides[currentQ].classList.add('active');
  controlsEl.children[currentQ].classList.add('active');
}

setInterval(() => goToQuote((currentQ + 1) % slides.length), 5000);

// OHM CALCULATOR
let activeTab = 'tensao';

function switchTab(tab) {
  document.querySelectorAll('.ohm-tab').forEach((t, i) => {
    t.classList.toggle('active', ['tensao','corrente','resistencia','potencia'][i] === tab);
  });
  document.querySelectorAll('.ohm-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('panel-' + tab).classList.add('active');
  activeTab = tab;
}

function getVal(id) {
  const v = parseFloat(document.getElementById(id).value);
  return isNaN(v) || v < 0 ? null : v;
}

function showResult(id, value, unit) {
  document.getElementById('err-' + id).classList.remove('show');
  const res = document.getElementById('res-' + id);
  res.classList.add('show');
  document.getElementById('val-' + id).textContent = value.toFixed(4).replace(/\.?0+$/, '') + ' ' + unit;
}

function showError(id) {
  document.getElementById('res-' + id).classList.remove('show');
  document.getElementById('err-' + id).classList.add('show');
}

function calcTensao() {
  const r = getVal('v-r'), i = getVal('v-i');
  if (r === null || i === null) { showError('tensao'); return; }
  showResult('tensao', r * i, 'V');
}

function calcCorrente() {
  const v = getVal('i-v'), r = getVal('i-r');
  if (v === null || r === null || r === 0) { showError('corrente'); return; }
  showResult('corrente', v / r, 'A');
}

function calcResistencia() {
  const v = getVal('r-v'), i = getVal('r-i');
  if (v === null || i === null || i === 0) { showError('resistencia'); return; }
  showResult('resistencia', v / i, 'Ω');
}

function calcPotencia() {
  const v = getVal('p-v'), i = getVal('p-i');
  if (v === null || i === null) { showError('potencia'); return; }
  showResult('potencia', v * i, 'W');
}
