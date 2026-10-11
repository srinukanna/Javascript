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
  sync: 'Try this: press Search, then quickly click Cart and type in the box. Later, add a laptop, press Proceed to Buy and pay: watch the code trace. Watch the spinner, progress bar and heartbeat stop, then see how late your click is handled.',
  async: 'Try this (cart, checkout and payment code is still synchronous): press Search, then click Cart, open Filters and type in the box while the progress bar fills. Everything still reacts instantly.'
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
    const d = document.createElement('div');
    d.className = 'product';
    d.innerHTML =
      (p.tag ? '<span class="tag' + (p.tag === 'Top Pick' ? ' pick' : '') + '">' + p.tag + '</span>' : '') +
      '<div class="pic"><div class="screen" style="background:#444"></div><div class="base"></div></div>' +
      '<h4></h4>' +
      '<div class="rating"><span class="stars">' + starText(p.stars) + '</span>' + p.reviews.toLocaleString() + '</div>' +
      '<div class="price"><sup>\u20B9</sup>' + p.inr.toLocaleString('en-IN') + '<span class="was">M.R.P.: ' + fmt(p.mrp) + '</span></div>' +
      '<div class="ship">' + (p.prime ? '<span class="prime">prime</span> ' : '') + 'FREE delivery <b>' + p.ship + '</b></div>' +
      '<button class="add-btn">Add to cart</button>';
    d.querySelector('h4').textContent = p.name;
    d.dataset.slug = p.slug;

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
  $('freezeMsg').textContent = 'The main thread is stuck in a 4-second loop. Nothing can update, not even the spinner.';
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
    renderTrace('Search "' + query + '" (synchronous)', [{ name: 'readSearchInput', ms: 0.1, ok: true }, { name: 'slowBlockingTask', ms: Math.round(blockEnd - blockStart), ok: true }, { name: 'renderProducts', ms: null, ok: true }], []);

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

el.cartBtn.addEventListener('click', e => { log('Cart opened' + lateNote(e)); showView('cart'); });

el.grid.addEventListener('click', e => {
  if (!e.target.classList.contains('add-btn')) return;
  log('Add to cart clicked' + lateNote(e));
  addToCart(e.target.closest('.product').dataset.slug);
});

el.filtersBtn.addEventListener('click', e => {
  el.filtersPanel.hidden = !el.filtersPanel.hidden;
  log('Filters panel ' + (el.filtersPanel.hidden ? 'closed' : 'opened') + lateNote(e));
});

/* =====================================================================
   SYNCHRONOUS SHOPPING FLOW: cart, checkout, payment
   Every function below is plain synchronous code: each step runs to the
   end before the next line is allowed to start.
   ===================================================================== */
const RATE = 83;                        // fake USD -> INR rate for the demo
PRODUCTS.forEach(p => { p.inr = Math.round(p.price * RATE); p.mrp = Math.round(p.price / (1 - p.off / 100) * RATE); });
const fmt = n => '\u20B9' + n.toLocaleString('en-IN');
const cart = [];                        // [{ slug, qty }]
const MAX_QTY = 5;
const bySlug = slug => PRODUCTS.find(p => p.slug === slug);
const cartCount = () => cart.reduce((s, l) => s + l.qty, 0);
const cartTotal = () => cart.reduce((s, l) => s + bySlug(l.slug).inr * l.qty, 0);
const thumb = p => IMG + p.slug + '/thumbnail.webp';
const updateBadge = () => { el.cartCount.textContent = cartCount(); };

function fail(msg, field) { const e = new Error(msg); e.field = field; throw e; }

/* Runs the steps ONE AFTER ANOTHER, times each, and stops at the first failure. */
function runSteps(title, steps) {
  const done = []; let error = null; const t0 = performance.now();
  for (const [name, fn] of steps) {
    const t = performance.now();
    try { fn(); done.push({ name, ms: performance.now() - t, ok: true }); }
    catch (err) { done.push({ name, ms: performance.now() - t, ok: false, msg: err.message }); error = err; break; }
  }
  renderTrace(title, done, steps.slice(done.length).map(s => s[0]), performance.now() - t0);
  return error;
}

function renderTrace(title, done, skipped, total) {
  $('traceTitle').textContent = title;
  const list = $('trace'); list.innerHTML = '';
  const add = (cls, n, name, note) => {
    const li = document.createElement('li'); li.className = cls;
    li.innerHTML = '<span class="n"></span><code></code><em></em>';
    li.children[0].textContent = n; li.children[1].textContent = name + '()'; li.children[2].textContent = note;
    list.appendChild(li);
  };
  done.forEach((s, i) => {
    const note = !s.ok ? 'failed' : s.ms == null ? '' : s.ms > 200 ? 'BLOCKED ' + Math.round(s.ms).toLocaleString() + ' ms' : s.ms < 1 ? '<1 ms' : Math.round(s.ms) + ' ms';
    add(s.ok ? (s.ms > 200 ? 'slow' : '') : 'bad', i + 1, s.name, note);
    if (!s.ok) { const m = document.createElement('li'); m.className = 'msg'; m.textContent = s.msg; list.appendChild(m); }
  });
  skipped.forEach((n, i) => add('skip', done.length + i + 1, n, 'never ran'));
  const sum = total != null ? total : done.reduce((a, s) => a + (s.ms || 0), 0);
  $('traceTotal').textContent = skipped.length
    ? 'Stopped at the failed step. Because the code is sequential, later steps never ran.'
    : 'Total ' + Math.round(sum).toLocaleString() + ' ms. Each step waited for the one before it.';
}
function clearTrace() { $('traceTitle').textContent = 'Use the shop to see its steps here.'; $('trace').innerHTML = ''; $('traceTotal').textContent = ''; }

/* ---------- pages ---------- */
function showView(name) {
  ['results', 'cart', 'checkout', 'done'].forEach(v => { $('view' + v[0].toUpperCase() + v.slice(1)).hidden = (v !== name); });
  if (name === 'cart') renderCart();
  if (name === 'checkout') renderCheckout();
  if (name === 'done') renderDone();
}
function go(name) { if (name === 'checkout') proceedToBuy(); else showView(name); }

/* ---------- cart actions ---------- */
function addToCart(slug) {
  let product, line;
  const banner = $('addedBanner');
  const err = runSteps('Add to cart', [
    ['findProduct', () => { product = bySlug(slug); if (!product) fail('Product not found.'); }],
    ['checkLimit', () => { line = cart.find(l => l.slug === slug); if (line && line.qty >= MAX_QTY) fail('You can order at most ' + MAX_QTY + ' of one item.'); }],
    ['addToCartList', () => { if (line) line.qty++; else cart.push({ slug, qty: 1 }); }],
    ['recalculateTotal', cartTotal],
    ['updateCartBadge', updateBadge],
    ['showAddedBanner', () => {
      banner.hidden = false; banner.className = 'added';
      banner.innerHTML = '<b>&#10003; Added to Cart:</b> ' + product.name + ' <button class="link" data-go="cart">Go to Cart</button>' +
        '<button class="yellow sm" data-go="checkout">Proceed to Buy (' + cartCount() + ' item' + (cartCount() > 1 ? 's' : '') + ')</button>';
    }]
  ]);
  if (err) { banner.hidden = false; banner.className = 'added err'; banner.textContent = err.message; log('Could not add: ' + err.message, 'bad'); }
  else log('Added to cart: ' + product.name, 'good');
}
function findLine(slug) { if (!cart.find(l => l.slug === slug)) fail('Item is not in the cart.'); }
function changeQty(slug, qty) {
  runSteps('Change quantity', [
    ['findCartLine', () => findLine(slug)],
    ['setQuantity', () => { cart.find(l => l.slug === slug).qty = qty; }],
    ['recalculateTotal', cartTotal], ['updateCartBadge', updateBadge], ['renderCart', renderCart]
  ]);
  log('Quantity changed to ' + qty);
}
function removeItem(slug) {
  runSteps('Delete from cart', [
    ['findCartLine', () => findLine(slug)],
    ['removeFromList', () => { cart.splice(cart.findIndex(l => l.slug === slug), 1); }],
    ['recalculateTotal', cartTotal], ['updateCartBadge', updateBadge], ['renderCart', renderCart]
  ]);
  log('Item removed from cart');
}
function proceedToBuy() {
  const err = runSteps('Proceed to Buy', [
    ['checkCartNotEmpty', () => { if (!cart.length) fail('Your cart is empty.'); }],
    ['recalculateTotal', cartTotal],
    ['openCheckoutPage', () => showView('checkout')]
  ]);
  log(err ? 'Cannot proceed: ' + err.message : 'Opened checkout page', err ? 'bad' : '');
}

/* ---------- cart page ---------- */
function renderCart() {
  const box = $('viewCart');
  if (!cart.length) {
    box.innerHTML = '<div class="panel center"><h2>Your shopzon Cart is empty</h2><p>Search for laptops and press "Add to cart".</p><button class="yellow" data-go="results">Continue shopping</button></div>';
    return;
  }
  const n = cartCount(), items = n + ' item' + (n > 1 ? 's' : '');
  const rows = cart.map(l => {
    const p = bySlug(l.slug);
    const opts = [1, 2, 3, 4, 5].map(q => '<option' + (q === l.qty ? ' selected' : '') + '>' + q + '</option>').join('');
    return '<div class="line"><img src="' + thumb(p) + '" alt=""><div class="info"><div class="t">' + p.name + '</div><div class="stock">In stock</div>' +
      '<div class="ship">Eligible for FREE Delivery</div><div class="ctl">Qty: <select data-qty="' + p.slug + '">' + opts + '</select>' +
      '<button class="link" data-del="' + p.slug + '">Delete</button></div></div><div class="amt">' + fmt(p.inr * l.qty) + '</div></div>';
  }).join('');
  box.innerHTML = '<div class="two"><div class="panel"><h2>Shopping Cart</h2>' + rows +
    '<div class="subline">Subtotal (' + items + '): <b>' + fmt(cartTotal()) + '</b></div></div>' +
    '<aside class="panel buy"><div class="subline">Subtotal (' + items + '): <b>' + fmt(cartTotal()) + '</b></div>' +
    '<p class="ship">Your order is eligible for FREE Delivery.</p><button class="yellow wide" data-go="checkout">Proceed to Buy</button>' +
    '<button class="link" data-go="results">Continue shopping</button></aside></div>';
}
$('viewCart').addEventListener('click', e => { const d = e.target.closest('[data-del]'); if (d) { react(e); removeItem(d.dataset.del); } });
$('viewCart').addEventListener('change', e => { if (e.target.dataset.qty) { react(e); changeQty(e.target.dataset.qty, +e.target.value); } });
document.addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b) { react(e); go(b.dataset.go); } });

/* ---------- checkout page ---------- */
function renderCheckout() {
  $('coCount').textContent = cartCount();
  $('coItems').innerHTML = cart.map(l => { const p = bySlug(l.slug);
    return '<div class="mini"><img src="' + thumb(p) + '" alt=""><span>' + p.name + ' <small>Qty ' + l.qty + '</small></span><b>' + fmt(p.inr * l.qty) + '</b></div>'; }).join('');
  $('sumItems').textContent = $('sumOrder').textContent = fmt(cartTotal());
  $('coError').hidden = true;
}
const payMethod = () => document.querySelector('input[name="pay"]:checked').value;
function syncPayPanels() { document.querySelectorAll('.pay-body').forEach(b => { b.hidden = (b.dataset.for !== payMethod()); }); }
document.querySelectorAll('input[name="pay"]').forEach(r => r.addEventListener('change', syncPayPanels));
document.querySelectorAll('#viewCheckout input, #viewCheckout select').forEach(f => f.addEventListener('input', () => f.classList.remove('invalid')));
$('cardNo').addEventListener('input', e => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 19).replace(/(.{4})/g, '$1 ').trim(); });
$('cardExp').addEventListener('input', e => { let v = e.target.value.replace(/\D/g, '').slice(0, 4); e.target.value = v.length > 2 ? v.slice(0, 2) + '/' + v.slice(2) : v; });
$('fillDemo').addEventListener('click', () => {
  $('upiId').value = 'demo@okhdfcbank'; $('bank').value = 'HDFC Bank';
  $('cardNo').value = '4111 1111 1111 1111'; $('cardName').value = 'Asha Rao'; $('cardExp').value = '12/' + String((new Date().getFullYear() + 3) % 100).padStart(2, '0'); $('cardCvv').value = '123';
});

/* ---------- validation + payment (all synchronous) ---------- */
let form = null, order = null;
function readForm() {
  form = { name: $('fName').value.trim(), phone: $('fPhone').value.trim(), pin: $('fPin').value.trim(), addr: $('fAddr').value.trim(), city: $('fCity').value.trim(),
    method: payMethod(), upi: $('upiId').value.trim(), bank: $('bank').value, card: $('cardNo').value.replace(/\s/g, ''),
    cname: $('cardName').value.trim(), exp: $('cardExp').value.trim(), cvv: $('cardCvv').value.trim() };
}
function validateAddress() {
  if (form.name.length < 2) fail('Enter your full name.', 'fName');
  if (!/^[6-9]\d{9}$/.test(form.phone)) fail('Enter a valid 10-digit mobile number.', 'fPhone');
  if (!/^\d{6}$/.test(form.pin)) fail('Enter a valid 6-digit PIN code.', 'fPin');
  if (form.addr.length < 5) fail('Enter your address.', 'fAddr');
  if (form.city.length < 2) fail('Enter your town or city.', 'fCity');
}
function luhn(s) { let sum = 0, alt = false; for (let i = s.length - 1; i >= 0; i--) { let d = +s[i]; if (alt) { d *= 2; if (d > 9) d -= 9; } sum += d; alt = !alt; } return sum % 10 === 0; }
function validatePayment() {
  const m = form.method;
  if (m === 'upi' && !/^[a-z0-9._-]{2,}@[a-z]{2,}$/i.test(form.upi)) fail('Enter a valid UPI ID, for example name@okhdfcbank.', 'upiId');
  if (m === 'netbanking' && !form.bank) fail('Choose your bank for Net Banking.', 'bank');
  if (m === 'card') {
    if (!/^\d{13,19}$/.test(form.card) || !luhn(form.card)) fail('That card number is not valid.', 'cardNo');
    if (form.cname.length < 2) fail('Enter the name on the card.', 'cardName');
    const mm = /^(\d{2})\/(\d{2})$/.exec(form.exp), now = new Date();
    if (!mm || +mm[1] < 1 || +mm[1] > 12) fail('Enter the expiry as MM/YY.', 'cardExp');
    if (2000 + +mm[2] < now.getFullYear() || (2000 + +mm[2] === now.getFullYear() && +mm[1] < now.getMonth() + 1)) fail('This card has expired.', 'cardExp');
    if (!/^\d{3,4}$/.test(form.cvv)) fail('Enter the CVV from the back of your card.', 'cardCvv');
  }
}
const GATEWAY = { upi: 'sendUpiCollectRequest', netbanking: 'redirectToBankLogin', card: 'authorise3DSecure', cod: 'confirmPayOnDelivery' };
function busyWait(ms) { const end = Date.now() + ms; while (Date.now() < end) { /* EDUCATIONAL ONLY */ } }
function verifyPayment() { if (form.method !== 'cod' && $('slowBank').checked) busyWait(3000); }
function methodLabel() {
  return { upi: 'UPI (' + form.upi + ')', netbanking: 'Net Banking (' + form.bank + ')', card: 'Card ending ' + form.card.slice(-4), cod: 'Pay on Delivery' }[form.method];
}
function createOrder() {
  order = { id: '402-' + String(Math.floor(Math.random() * 1e7)).padStart(7, '0') + '-' + String(Math.floor(Math.random() * 1e7)).padStart(7, '0'),
    lines: cart.map(l => ({ name: bySlug(l.slug).name, qty: l.qty })), total: cartTotal(), method: methodLabel() };
}

function placeOrder() {
  const err = runSteps('Place order and pay', [
    ['readFormValues', readForm],
    ['validateAddress', validateAddress],
    ['validatePayment', validatePayment],
    [GATEWAY[payMethod()], verifyPayment],
    ['createOrder', createOrder],
    ['emptyCart', () => { cart.length = 0; updateBadge(); }],
    ['showConfirmation', () => showView('done')]
  ]);
  document.body.classList.remove('frozen');
  setStatus('FREE', err ? 'IDLE' : 'DONE');
  setWorker(err ? '' : 'happy', err ? 'Stopped: ' + err.message : 'Payment finished. I can answer clicks again.');
  if (err) {
    $('coError').textContent = err.message; $('coError').hidden = false;
    if (err.field) { $(err.field).classList.add('invalid'); $(err.field).focus(); }
    log('Checkout stopped: ' + err.message, 'bad');
  } else log('Order ' + order.id + ' placed. Payment OK.', 'good');
}

function payNow(e) {
  react(e);
  document.querySelectorAll('.invalid').forEach(x => x.classList.remove('invalid'));
  $('coError').hidden = true;
  let valid = true;
  try { readForm(); validateAddress(); validatePayment(); } catch (err) { valid = false; }
  if (!valid || form.method === 'cod' || !$('slowBank').checked) { placeOrder(); return; }
  // Paint the "frozen" screen first. After this tiny pause, the slow synchronous
  // bank step runs and blocks everything until it returns.
  $('freezeMsg').textContent = 'Waiting for your bank. This synchronous step blocks everything until it returns.';
  document.body.classList.add('frozen');
  setStatus('BUSY', 'WORKING');
  setWorker('busy', 'Waiting for the bank to answer. I cannot do anything else!');
  log('Payment started: the bank step will block JavaScript for 3 seconds');
  requestAnimationFrame(() => setTimeout(placeOrder, 50));
}
$('payBtn').addEventListener('click', payNow);

function renderDone() {
  $('viewDone').innerHTML = '<div class="panel center"><div class="tick">&#10003;</div><h2>Order placed, thank you!</h2>' +
    '<p>A confirmation will be sent to your phone.</p><div class="receipt"><div>Order ID: <b>' + order.id + '</b></div>' +
    '<div>Paid with: <b>' + order.method + '</b></div><div>Order total: <b>' + fmt(order.total) + '</b></div><div>Arriving: <b>Tomorrow</b></div>' +
    order.lines.map(l => '<div>' + l.qty + ' x ' + l.name + '</div>').join('') + '</div><br><button class="yellow" data-go="results">Continue shopping</button></div>';
}

/* ---------- Modes + reset ---------- */

function reset() {
  clearTimeout(waitTimer); clearInterval(tickTimer);
  working = false; cart.length = 0; blockStart = blockEnd = 0;
  showView('results'); updateBadge(); clearTrace(); $('addedBanner').hidden = true;
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