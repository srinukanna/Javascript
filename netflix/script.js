/* Sync vs Async demo. Plain JavaScript, no libraries. */

const $ = id => document.getElementById(id);
const el = {
  input: $('searchInput'), searchBtn: $('searchBtn'), filtersBtn: $('filtersBtn'), cartBtn: $('cartBtn'),
  cartCount: $('cartCount'), filtersPanel: $('filtersPanel'), grid: $('grid'), title: $('resultsTitle'),
  loading: $('loading'), loadingText: $('loadingText'), spinner: $('spinner'),
  thread: $('threadStatus'), req: $('reqStatus'), frames: $('frames'),
  bot: $('bot'), bubble: $('bubble'), timeline: $('timeline'), log: $('log'),
  warning: $('warning'), lessonMain: $('lessonMain'), resetBtn: $('resetBtn'), tryText: $('tryText'),
  delay: $('delay'), bar: $('bar'), elapsed: $('elapsed'), beat: $('beat'), gap: $('gap'), longest: $('longest')
};

const LESSONS = {
  sync: 'Synchronous = current task must finish before JavaScript can continue.',
  async: 'Asynchronous = slow work can finish later while the page stays responsive.'
};
const TRY = {
  sync: 'Try this: press Search, then quickly click Cart and type in the box. Watch the spinner, progress bar and heartbeat stop, then see how late your click is handled.',
  async: 'Try this: press Search, then click Cart, open Filters and type in the box while the progress bar fills. Everything still reacts instantly.'
};
const STEPS = {
  sync: ['Search clicked', 'Blocking task', 'UI frozen', 'Task finished', 'Products rendered'],
  async: ['Search clicked', 'Async work started', 'UI remains responsive', 'Result arrives later', 'Products rendered']
};
const IMG = 'https://cdn.dummyjson.com/product-images/laptops/';
const PRODUCTS = [
  { name: 'Huawei Matebook X Pro', price: 1399.99, off: 9.38, stars: 5, reviews: 3412, tag: 'Best Seller', prime: true, ship: 'Tomorrow', slug: 'huawei-matebook-x-pro' },
  { name: 'Asus Zenbook Pro Dual Screen Laptop', price: 1799.99, off: 11.14, stars: 4, reviews: 1876, tag: 'Top Pick', prime: false, ship: 'in 1 month', slug: 'asus-zenbook-pro-dual-screen-laptop' },
  { name: 'Apple MacBook Pro 14 Inch Space Grey', price: 1999.99, off: 4.69, stars: 3.5, reviews: 8217, prime: true, ship: 'in 2 weeks', slug: 'apple-macbook-pro-14-inch-space-grey' },
  { name: 'New DELL XPS 13 9300 Laptop', price: 1499.99, off: 11.89, stars: 2.5, reviews: 954, prime: true, ship: 'in 2 weeks', slug: 'new-dell-xps-13-9300-laptop' },
  { name: 'Lenovo Yoga 920 2-in-1 Convertible Laptop', price: 1099.99, off: 6.55, stars: 3, reviews: 2203, prime: true, ship: 'in 2 weeks', slug: 'lenovo-yoga-920' }
];

let mode = 'sync';
let working = false;
let cartItems = 0;
let waitTimer = null, tickTimer = null;
let blockStart = 0, blockEnd = 0;   // used to tell if a click happened during the freeze

/* ---------- small helpers ---------- */

function log(text, kind) {
  const li = document.createElement('li');
  const time = document.createElement('time');
  time.textContent = new Date().toLocaleTimeString([], { hour12: false });
  const span = document.createElement('span');
  span.textContent = text;
  if (kind) span.className = kind;
  li.append(time, span);
  el.log.appendChild(li);
  el.log.scrollTop = el.log.scrollHeight;
}

function setStatus(thread, request) {
  el.thread.textContent = thread;
  el.thread.className = 'pill ' + thread.toLowerCase();
  el.req.textContent = request;
  el.req.className = 'pill ' + request.toLowerCase();
}

function setWorker(state, text) {
  el.bot.className = 'bot ' + state;
  el.bubble.textContent = text;
}

/* done = number of finished steps; the next one is "active" */
function setTimeline(done, bad) {
  el.timeline.innerHTML = '';
  STEPS[mode].forEach((label, i) => {
    const li = document.createElement('li');
    li.textContent = label;
    if (i < done) li.className = 'done';
    else if (i === done) li.className = 'active' + (bad ? ' bad' : '');
    el.timeline.appendChild(li);
  });
}

function starText(n) {
  const full = Math.floor(n), half = n - full >= 0.5 ? 1 : 0;
  return '\u2605'.repeat(full) + (half ? '\u00BD' : '') + '\u2606'.repeat(5 - full - half);
}

function renderProducts(query) {
  el.title.textContent = '1-' + PRODUCTS.length + ' of ' + PRODUCTS.length + ' results for "' + query + '"';
  el.grid.innerHTML = '';
  let loaded = 0;
  log('Product images are now loading in the background');
  PRODUCTS.forEach(p => {
    const dollars = Math.floor(p.price), cents = String(Math.round((p.price - dollars) * 100)).padStart(2, '0');
    const was = (p.price / (1 - p.off / 100)).toFixed(2);
    const d = document.createElement('div');
    d.className = 'product';
    d.innerHTML =
      (p.tag ? '<span class="tag' + (p.tag === 'Top Pick' ? ' pick' : '') + '">' + p.tag + '</span>' : '') +
      '<div class="pic"><div class="screen" style="background:#444"></div><div class="base"></div></div>' +
      '<h4></h4>' +
      '<div class="rating"><span class="stars">' + starText(p.stars) + '</span>' + p.reviews.toLocaleString() + '</div>' +
      '<div class="price"><sup>$</sup>' + dollars.toLocaleString() + '<sup>' + cents + '</sup><span class="was">$' + Number(was).toLocaleString() + '</span></div>' +
      '<div class="ship">' + (p.prime ? '<span class="prime">prime</span> ' : '') + 'FREE delivery <b>' + p.ship + '</b></div>' +
      '<button class="add-btn">Add to cart</button>';
    d.querySelector('h4').textContent = p.name;

    // Real product photo. The drawn laptop underneath is the fallback if it cannot load.
    const img = new Image();
    img.alt = p.name;
    img.addEventListener('load', () => {
      img.classList.add('loaded');
      loaded++;
      log('Image ' + loaded + ' of ' + PRODUCTS.length + ' loaded');
    });
    img.addEventListener('error', () => log('Image could not load (offline?). Showing the drawing instead.', 'bad'));
    img.src = IMG + p.slug + '/thumbnail.webp';
    d.querySelector('.pic').appendChild(img);

    el.grid.appendChild(d);
  });
}

/* How long did the page take to react to this click or keypress?
   event.timeStamp = when you did it. performance.now() = when our code finally ran. */
function react(e) {
  const ms = Math.max(0, Math.round(performance.now() - e.timeStamp));
  el.delay.textContent = ms.toLocaleString() + ' ms';
  el.delay.className = 'pill ' + (ms > 200 ? 'bad' : 'good');
  return ms;
}
function lateNote(e) {
  const ms = react(e);
  return ms > 200 ? ' (page was frozen: JavaScript reacted ' + ms.toLocaleString() + ' ms late)' : ' (reacted in ' + ms + ' ms)';
}

/* ---------- JS-driven live displays ----------
   Everything below is redrawn by JavaScript on every screen update.
   When the main thread is blocked, JavaScript cannot run, so ALL of it really stops. */
let angle = 0, frameCount = 0, lastFrame = performance.now();
let taskStart = 0, taskActive = false, longestGap = 0;
const gaps = [];
const ctx = el.beat.getContext('2d');

function drawBeat() {
  const w = el.beat.width, h = el.beat.height, MAX = 120;
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = '#2d4a3a'; ctx.setLineDash([4, 4]);
  ctx.beginPath(); ctx.moveTo(0, h - 8); ctx.lineTo(w, h - 8); ctx.stroke(); ctx.setLineDash([]);
  const step = w / 99;
  ctx.lineWidth = 2; ctx.strokeStyle = '#4ade80'; ctx.beginPath();
  gaps.forEach((g, i) => {
    const x = (100 - gaps.length + i) * step, y = h - 8 - Math.min(g, MAX) / MAX * (h - 14);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.stroke();
  gaps.forEach((g, i) => {
    if (g > 100) {
      ctx.fillStyle = '#f87171';
      ctx.beginPath(); ctx.arc((100 - gaps.length + i) * step, 6, 5, 0, 7); ctx.fill();
    }
  });
}

function animate(now) {
  angle = (angle + 6) % 360;
  el.spinner.style.transform = 'rotate(' + angle + 'deg)';
  frameCount++;
  el.frames.textContent = frameCount;

  const gap = Math.round(now - lastFrame);
  lastFrame = now;
  gaps.push(gap); if (gaps.length > 100) gaps.shift();
  if (gap > longestGap) longestGap = gap;
  el.gap.textContent = gap + ' ms';
  el.longest.textContent = longestGap.toLocaleString() + ' ms';
  drawBeat();

  if (taskActive) {
    const t = Math.min(4000, now - taskStart);
    el.bar.style.width = (t / 4000 * 100) + '%';
    el.elapsed.textContent = (t / 1000).toFixed(1) + 's / 4.0s';
  }
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
// A hidden tab pauses screen updates; do not count that as a "freeze".
document.addEventListener('visibilitychange', () => { lastFrame = performance.now(); });

function finishProgress() {
  taskActive = false;
  el.bar.style.width = '100%';
  el.elapsed.textContent = '4.0s / 4.0s';
}

/* ---------- Search ---------- */

function startSearch() {
  if (working) { log('Search ignored: one is already running.'); return; }
  const query = el.input.value.trim() || 'Laptop';
  working = true;
  taskStart = performance.now(); taskActive = true; el.bar.style.width = '0%';
  log('Search clicked: "' + query + '"');
  el.grid.innerHTML = '<p class="empty">Waiting for results...</p>';
  el.title.textContent = 'Searching for "' + query + '"';
  el.loading.hidden = false;

  if (mode === 'sync') runSync(query); else runAsync(query);
}

/* ----- SYNC: a 4-second busy loop that blocks the main thread ----- */
function runSync(query) {
  // 1. Paint the "frozen" look FIRST, because after the loop starts nothing can be painted.
  document.body.classList.add('frozen');
  setStatus('BUSY', 'WORKING');
  setWorker('busy', 'Counting to the end of a long loop. I cannot hear you!');
  el.loadingText.textContent = 'Blocking...';
  setTimeline(2, true);
  log('Blocking task started: JavaScript is stuck in a 4-second loop');

  // 2. Give the browser a moment to draw that state, then block.
  requestAnimationFrame(() => setTimeout(() => {
    blockStart = performance.now();
    const end = Date.now() + 4000;
    while (Date.now() < end) { /* busy loop: EDUCATIONAL ONLY */ }
    blockEnd = performance.now();

    // 3. Only now can JavaScript continue.
    document.body.classList.remove('frozen');
    log('Slow task finished', 'good');
    renderProducts(query);
    log('Products rendered', 'good');
    el.loading.hidden = true;
    setStatus('FREE', 'DONE');
    setWorker('happy', 'Done. Now I can answer clicks again.');
    setTimeline(5);
    finishProgress();
    working = false;
  }, 50));
}

/* ----- ASYNC: fake request that finishes later ----- */
function runAsync(query) {
  setStatus('FREE', 'WORKING');
  setWorker('', 'Task handed off. What else can I do for you?');
  el.loadingText.textContent = 'Loading... (try the buttons!)';
  setTimeline(2);
  log('Async work started: fake request, result in 4 seconds');
  log('Page stays responsive. Try Cart, Filters or typing.');

  let seconds = 0;
  tickTimer = setInterval(() => {
    seconds++;
    log('Still waiting... ' + seconds + 's, and the page is still responsive');
  }, 1000);

  waitTimer = setTimeout(() => {
    clearInterval(tickTimer);
    setTimeline(3);
    log('Async result arrived', 'good');
    renderProducts(query);
    log('Products rendered', 'good');
    el.loading.hidden = true;
    setStatus('FREE', 'DONE');
    setWorker('happy', 'Result is in. Nothing was ever stuck.');
    setTimeline(5);
    finishProgress();
    working = false;
  }, 4000);
}

/* ---------- Other page controls ---------- */

el.searchBtn.addEventListener('click', e => { react(e); startSearch(); });
el.input.addEventListener('keydown', e => { if (e.key === 'Enter') { react(e); startSearch(); } });
el.input.addEventListener('input', e => log('Typing in Search: "' + el.input.value + '"' + lateNote(e)));

el.cartBtn.addEventListener('click', e => {
  cartItems++;
  el.cartCount.textContent = cartItems;
  log('Cart clicked (' + cartItems + ' items)' + lateNote(e));
});

el.grid.addEventListener('click', e => {
  if (!e.target.classList.contains('add-btn')) return;
  cartItems++;
  el.cartCount.textContent = cartItems;
  log('Added to cart (' + cartItems + ' items)' + lateNote(e));
});

el.filtersBtn.addEventListener('click', e => {
  el.filtersPanel.hidden = !el.filtersPanel.hidden;
  log('Filters panel ' + (el.filtersPanel.hidden ? 'closed' : 'opened') + lateNote(e));
});

/* ---------- Modes + reset ---------- */

function reset() {
  clearTimeout(waitTimer); clearInterval(tickTimer);
  working = false; cartItems = 0; blockStart = blockEnd = 0;
  taskActive = false; longestGap = 0; gaps.length = 0;
  el.bar.style.width = '0%'; el.elapsed.textContent = '0.0s / 4.0s';
  el.delay.textContent = '-'; el.delay.className = 'pill idle';
  document.body.classList.remove('frozen');
  el.cartCount.textContent = '0';
  el.filtersPanel.hidden = true;
  el.loading.hidden = true;
  el.input.value = 'Laptop';
  el.title.textContent = 'Type something and press Search';
  el.grid.innerHTML = '<p class="empty">No products yet. Press Search to start the slow task.</p>';
  el.log.innerHTML = '';
  setStatus('FREE', 'IDLE');
  setWorker('', 'Waiting for work.');
  setTimeline(0);
  log('Reset. Mode: ' + (mode === 'sync' ? 'Synchronous (blocking)' : 'Asynchronous (non-blocking)'));
}

function setMode(m) {
  mode = m;
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.mode === m));
  el.lessonMain.textContent = LESSONS[m];
  el.warning.hidden = (m !== 'sync');
  el.tryText.textContent = TRY[m];
  reset();
}

document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => setMode(t.dataset.mode)));
el.resetBtn.addEventListener('click', reset);

setMode('sync');