/* tairqaldy.xyz v5 — unified physics: floating stickers, collisions, chaos mode */

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const COLORS = ["#00afca", "#ffc93c", "#ff6b57", "#9b6bff", "#3ecf8e"];

// ---------- live Astana clock ----------
const clockEl = document.getElementById("clock");
const fmt = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit", minute: "2-digit", second: "2-digit",
  hour12: false, timeZone: "Asia/Almaty",
});
const tick = () => (clockEl.textContent = fmt.format(new Date()));
tick();
setInterval(tick, 1000);

// ---------- staggered reveal ----------
document.querySelectorAll(".reveal").forEach((el, i) => {
  el.style.setProperty("--d", `${Math.min(0.08 + i * 0.07, 0.85)}s`);
});

addEventListener("load", () => {
  requestAnimationFrame(() => document.body.classList.add("loaded"));
});
setTimeout(() => document.body.classList.add("loaded"), 1800);

// ---------- first name letter wave ----------
const first = document.getElementById("first-name");
first.innerHTML = first.textContent
  .split("")
  .map((ch) => `<span class="ltr">${ch}</span>`)
  .join("");
const letters = [...first.querySelectorAll(".ltr")];

document.getElementById("name").addEventListener("pointerenter", () => {
  if (reduceMotion) return;
  letters.forEach((l, i) => {
    setTimeout(() => {
      l.classList.add("up");
      setTimeout(() => l.classList.remove("up"), 320);
    }, i * 70);
  });
});

// ---------- marquee ----------
const words = [
  "obsessed", "ship &gt; talk", "adhd is a feature", "20+ fails, still here",
  "build in public", "салем әлем", "astana standard time", "18 &amp; shipping",
  "talk is cheap, show me the code", "drag the stickers", "there is a chaos button",
  "&copy; 2026 tair qaldybayev", "made with stickers &amp; adhd energy",
];
const half = words.map((w) => `<span>${w}</span><span class="sep">✦</span>`).join("");
document.getElementById("marquee-track").innerHTML = half + half;

// ---------- shape factory (shared by bits + confetti) ----------
const SHAPES = [
  (c, s) => `<svg width="${14 * s}" height="${14 * s}" viewBox="0 0 14 14"><path d="M7 1v12M1 7h12" stroke="${c}" stroke-width="2.4" stroke-linecap="round"/></svg>`,
  (c, s) => `<svg width="${11 * s}" height="${11 * s}" viewBox="0 0 11 11"><circle cx="5.5" cy="5.5" r="4.4" fill="none" stroke="${c}" stroke-width="2.2"/></svg>`,
  (c, s) => `<svg width="${12 * s}" height="${12 * s}" viewBox="0 0 12 12"><rect x="2" y="2" width="8" height="8" rx="2" fill="${c}" transform="rotate(14 6 6)"/></svg>`,
  (c, s) => `<svg width="${18 * s}" height="${8 * s}" viewBox="0 0 18 8"><path d="M1 6c2.6-5 5.4-5 8 0s5.4 5 8 0" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"/></svg>`,
  (c, s) => `<svg width="${13 * s}" height="${13 * s}" viewBox="0 0 13 13"><path d="M6.5 0l1.6 4.9H13L8.9 8l1.6 5-4-3.1-4 3.1 1.6-5L0 4.9h4.9Z" fill="${c}"/></svg>`,
];

// ---------- floating bits with cursor parallax ----------
const bitsZone = document.getElementById("bits");
const bits = [];
const BIT_SPOTS = [
  [8, 16], [22, 6], [38, 12], [60, 7], [76, 15], [91, 9],
  [5, 46], [94, 44], [9, 72], [90, 70], [26, 90], [55, 93], [74, 88], [42, 40],
];

BIT_SPOTS.forEach(([x, y], i) => {
  const wrap = document.createElement("span");
  wrap.className = "bit";
  wrap.style.left = x + "vw";
  wrap.style.top = y + "vh";
  wrap.style.setProperty("--bd", 7 + Math.random() * 6 + "s");
  wrap.style.setProperty("--bdel", -Math.random() * 8 + "s");
  wrap.innerHTML = SHAPES[i % SHAPES.length](COLORS[i % COLORS.length], 1);
  bitsZone.appendChild(wrap);
  bits.push({ el: wrap, depth: 0.008 + Math.random() * 0.02, x: 0, y: 0 });
});

const mouse = { x: 0, y: 0 };
addEventListener("pointermove", (e) => {
  mouse.x = e.clientX - innerWidth / 2;
  mouse.y = e.clientY - innerHeight / 2;
});

// ---------- physics world (stickers + chaos pieces) ----------
const items = [];

function attachDrag(it) {
  const el = it.el;
  let px = 0, py = 0, dist = 0;
  el.addEventListener("pointerdown", (e) => {
    if (!it.settled || !it.active) return;
    e.preventDefault();
    el.setPointerCapture(e.pointerId);
    el.classList.add("dragging");
    it.dragging = true;
    px = e.clientX;
    py = e.clientY;
    dist = 0;
  });
  el.addEventListener("pointermove", (e) => {
    if (!it.dragging) return;
    it.tx += e.clientX - px;
    it.ty += e.clientY - py;
    dist += Math.abs(e.clientX - px) + Math.abs(e.clientY - py);
    px = e.clientX;
    py = e.clientY;
  });
  const release = () => {
    it.dragging = false;
    el.classList.remove("dragging");
  };
  el.addEventListener("pointerup", release);
  el.addEventListener("pointercancel", release);
  // a real drag should not fire the link inside the piece
  el.addEventListener("click", (e) => {
    if (dist > 8) { e.preventDefault(); e.stopPropagation(); }
  }, true);
}

function makeItem(el, kind, rot) {
  const it = {
    el, kind, rot, active: true,
    hx: 0, hy: 0, dx: 0, dy: 0, tx: 0, ty: 0, vx: 0, vy: 0,
    tilt: 0, scale: 1, w: 60, h: 60,
    phase: Math.random() * Math.PI * 2,
    bobAmp: 2.2 + Math.random() * 1.6,
    settled: false, dragging: false,
  };
  attachDrag(it);
  items.push(it);
  return it;
}

// ---------- sticker chips ----------
const KZ_FLAG = `<svg class="flag" width="52" height="34" viewBox="0 0 52 34" xmlns="http://www.w3.org/2000/svg">
  <rect width="52" height="34" rx="5" fill="#00afca"/>
  <circle cx="26" cy="15" r="6.2" fill="#ffec3e"/>
  <g stroke="#ffec3e" stroke-width="1.6" stroke-linecap="round">
    <line x1="26" y1="4.5" x2="26" y2="6.8"/><line x1="26" y1="23.2" x2="26" y2="25.5"/>
    <line x1="15.5" y1="15" x2="17.8" y2="15"/><line x1="34.2" y1="15" x2="36.5" y2="15"/>
    <line x1="18.6" y1="7.6" x2="20.2" y2="9.2"/><line x1="31.8" y1="20.8" x2="33.4" y2="22.4"/>
    <line x1="33.4" y1="7.6" x2="31.8" y2="9.2"/><line x1="20.2" y1="20.8" x2="18.6" y2="22.4"/>
  </g>
  <g fill="#ffec3e"><circle cx="6" cy="6" r="1.1"/><circle cx="6" cy="12" r="1.1"/><circle cx="6" cy="18" r="1.1"/><circle cx="6" cy="24" r="1.1"/></g>
</svg>`;

const STICKERS = [
  { type: "flag", lbl: "qazaqstan", side: "l", gx: 0.42, y: 9 },
  { type: "logo", slug: "claude", lbl: "claude", size: 30, side: "l", gx: 0.5, y: 26 },
  { type: "logo", slug: "ycombinator", size: 34, side: "l", gx: 0.3, y: 41 },
  { type: "text", html: "&ldquo;talk is cheap,<br>show me the code&rdquo;", side: "l", gx: 0.5, y: 57 },
  { type: "logo", slug: "python", size: 30, side: "l", gx: 0.62, y: 73 },
  { type: "brand", html: "SATHustle", lbl: "sat prep 1v1", side: "l", gx: 0.38, y: 86 },
  { type: "logo", slug: "anthropic", lbl: "anthropic", size: 26, side: "r", gx: 0.5, y: 10 },
  { type: "logo", slug: "vercel", lbl: "vercel", size: 26, side: "r", gx: 0.36, y: 26 },
  { type: "logo", slug: "n8n", size: 34, side: "r", gx: 0.56, y: 41 },
  { type: "text", html: "&#127818; fl studio<br>certified fruit", side: "r", gx: 0.42, y: 56 },
  { type: "logo", slug: "react", size: 32, side: "r", gx: 0.6, y: 71 },
  { type: "logo", slug: "cloudflare", size: 34, side: "r", gx: 0.4, y: 85 },
];
const ROTS = [-7, 5, -4, 6, -8, 4, 7, -5, 4, -6, 8, -3];

function chipHTML(s) {
  if (s.type === "flag") return KZ_FLAG + (s.lbl ? `<span class="lbl">${s.lbl}</span>` : "");
  if (s.type === "logo")
    return `<img src="assets/logos/${s.slug}.svg" width="${s.size}" height="${s.size}" alt="" draggable="false">` +
           (s.lbl ? `<span class="lbl">${s.lbl}</span>` : "");
  if (s.type === "brand") return s.html + (s.lbl ? `<span class="lbl">${s.lbl}</span>` : "");
  return s.html;
}

const CONTENT_W = 720;
const zone = document.getElementById("stickers");

STICKERS.forEach((s, i) => {
  const el = document.createElement("div");
  el.className = "sticker" + (s.type === "text" ? " text" : "") + (s.type === "brand" ? " brand" : "");
  el.style.setProperty("--rot", ROTS[i] + "deg");
  el.style.setProperty("--td", 0.55 + i * 0.07 + "s");
  el.innerHTML = chipHTML(s);
  zone.appendChild(el);
  const it = makeItem(el, "sticker", ROTS[i]);
  it.cfg = s;
  el.addEventListener("animationend", () => {
    el.classList.add("settled");
    it.settled = true;
    it.w = el.offsetWidth;
    it.h = el.offsetHeight;
  });
});

function layoutStickers() {
  const gutter = Math.max((innerWidth - CONTENT_W) / 2, 0);
  for (const it of items) {
    if (it.kind !== "sticker") continue;
    const { cfg, el } = it;
    const w = el.offsetWidth || 80;
    let x;
    if (cfg.side === "l") {
      x = Math.min(Math.max(gutter * cfg.gx - w / 2, 12), Math.max(gutter - w - 16, 12));
    } else {
      const gx = innerWidth - gutter + gutter * cfg.gx - w / 2;
      x = Math.max(Math.min(gx, innerWidth - w - 12), innerWidth - gutter + 16);
    }
    it.hx = x;
    it.hy = (cfg.y / 100) * innerHeight;
    it.w = w;
    it.h = el.offsetHeight || 60;
    el.style.left = x + "px";
    el.style.top = it.hy + "px";
  }
}
layoutStickers();
addEventListener("resize", layoutStickers);

setTimeout(() => {
  items.forEach((it) => it.kind === "sticker" && it.el.classList.add("on"));
}, reduceMotion ? 0 : 300);

// ---------- collisions: soft circles, dragged items have infinite mass ----------
function collide() {
  for (let i = 0; i < items.length; i++) {
    const A = items[i];
    if (!A.settled || !A.active) continue;
    for (let j = i + 1; j < items.length; j++) {
      const B = items[j];
      if (!B.settled || !B.active) continue;
      const ax = A.hx + A.dx + A.w / 2, ay = A.hy + A.dy + A.h / 2;
      const bx = B.hx + B.dx + B.w / 2, by = B.hy + B.dy + B.h / 2;
      const rA = Math.max(A.w, A.h) * 0.52, rB = Math.max(B.w, B.h) * 0.52;
      let nx = bx - ax, ny = by - ay;
      const dist = Math.hypot(nx, ny) || 0.01;
      const overlap = rA + rB - dist;
      if (overlap <= 0) continue;
      nx /= dist; ny /= dist;
      const push = overlap * 0.5;
      const aFree = !A.dragging, bFree = !B.dragging;
      if (aFree && bFree) {
        A.dx -= nx * push; A.dy -= ny * push;
        B.dx += nx * push; B.dy += ny * push;
        A.vx -= nx * push * 0.18; A.vy -= ny * push * 0.18;
        B.vx += nx * push * 0.18; B.vy += ny * push * 0.18;
      } else if (aFree) {
        A.dx -= nx * overlap; A.dy -= ny * overlap;
        A.vx -= nx * overlap * 0.25; A.vy -= ny * overlap * 0.25;
        A.tilt += (Math.random() - 0.5) * 4;
      } else if (bFree) {
        B.dx += nx * overlap; B.dy += ny * overlap;
        B.vx += nx * overlap * 0.25; B.vy += ny * overlap * 0.25;
        B.tilt += (Math.random() - 0.5) * 4;
      }
    }
  }
}

// ---------- main loop ----------
function frame(t) {
  for (const it of items) {
    if (!it.settled || !it.active) continue;
    const targetScale = it.dragging ? 1.06 : 1;
    if (it.dragging) {
      const nx = it.dx + (it.tx - it.dx) * 0.3;
      const ny = it.dy + (it.ty - it.dy) * 0.3;
      it.vx = nx - it.dx;
      it.vy = ny - it.dy;
      it.dx = nx;
      it.dy = ny;
      it.tilt += (Math.max(-15, Math.min(15, it.vx * 1.3)) - it.tilt) * 0.22;
    } else {
      it.dx += it.vx;
      it.dy += it.vy;
      const px = it.hx + it.dx, py = it.hy + it.dy;
      if ((px < 4 && it.vx < 0) || (px + it.w > innerWidth - 4 && it.vx > 0)) it.vx *= -0.55;
      if ((py < 4 && it.vy < 0) || (py + it.h > innerHeight - 4 && it.vy > 0)) it.vy *= -0.55;
      it.vx *= 0.94;
      it.vy *= 0.94;
      it.tilt *= 0.9;
      it.tx = it.dx;
      it.ty = it.dy;
    }
    it.scale += (targetScale - it.scale) * 0.2;
  }

  collide();

  for (const it of items) {
    if (!it.settled || !it.active) continue;
    // idle bob so it reads as floating / grabbable
    const speed = Math.abs(it.vx) + Math.abs(it.vy);
    const idle = reduceMotion || it.dragging ? 0 : Math.max(0, 1 - speed * 2);
    const bobY = Math.sin(t * 0.0011 + it.phase) * it.bobAmp * idle;
    const bobR = Math.sin(t * 0.0007 + it.phase) * 1.1 * idle;
    it.el.style.transform =
      `translate3d(${it.dx}px, ${(it.dy + bobY)}px, 0) rotate(${it.rot + it.tilt + bobR}deg) scale(${it.scale.toFixed(3)})`;
  }

  if (!reduceMotion) {
    for (const b of bits) {
      const txp = mouse.x * b.depth, typ = mouse.y * b.depth;
      b.x += (txp - b.x) * 0.06;
      b.y += (typ - b.y) * 0.06;
      b.el.style.transform = `translate3d(${b.x.toFixed(1)}px, ${b.y.toFixed(1)}px, 0)`;
    }
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// ---------- chaos mode: the page itself comes loose ----------
const chaosBtn = document.getElementById("chaos");
let chaosOn = false;
const loosened = [];

function makeLoose(el) {
  const r = el.getBoundingClientRect();
  const ph = document.createElement(el.tagName === "P" || el.tagName === "H1" ? "div" : "span");
  ph.style.cssText = `display:inline-block;width:${r.width}px;height:${r.height}px;visibility:hidden;`;
  const saved = el.style.cssText;
  el.parentNode.insertBefore(ph, el);
  el.style.cssText = saved +
    `;position:fixed;left:${r.left}px;top:${r.top}px;width:${r.width}px;margin:0;z-index:33;transition:none;`;
  el.classList.add("loose");
  const it = makeItem(el, "piece", (Math.random() - 0.5) * 4);
  it.hx = r.left;
  it.hy = r.top;
  it.w = r.width;
  it.h = r.height;
  it.settled = true;
  it.vx = (Math.random() - 0.5) * 7;
  it.vy = (Math.random() - 0.5) * 7;
  it.tilt = (Math.random() - 0.5) * 10;
  loosened.push({ el, ph, saved, it });
}

chaosBtn.addEventListener("click", () => {
  if (!chaosOn) {
    chaosOn = true;
    chaosBtn.textContent = "okay fix this mess →";
    chaosBtn.classList.add("armed");
    const targets = document.querySelectorAll(
      ".eyebrow, #name, .role, .story p, .shelf-note, .thing, .next-note, .where, .cta-line, .links"
    );
    targets.forEach((el) => makeLoose(el));
  } else {
    chaosOn = false;
    chaosBtn.textContent = "chaos? →";
    chaosBtn.classList.remove("armed");
    const restored = loosened.splice(0);
    for (const L of restored) {
      L.it.active = false;
      L.el.classList.remove("loose");
      // restore with transitions off, killing any stuck transform transition
      L.el.style.cssText = L.saved + ";transition:none;";
      if (L.el.getAnimations) L.el.getAnimations().forEach((a) => a.cancel());
      L.ph.remove();
      const idx = items.indexOf(L.it);
      if (idx > -1) items.splice(idx, 1);
    }
    document.body.offsetHeight;
    requestAnimationFrame(() => {
      for (const L of restored) L.el.style.cssText = L.saved;
    });
  }
});

// ---------- mobile sticker strip ----------
const strip = document.createElement("div");
strip.className = "sticker-strip";
strip.setAttribute("aria-hidden", "true");
strip.innerHTML =
  `<span class="mini">${KZ_FLAG.replace('width="52" height="34"', 'width="26" height="17"')}</span>` +
  ["claude", "ycombinator", "anthropic", "python", "n8n"]
    .map((s) => `<span class="mini"><img src="assets/logos/${s}.svg" alt="" draggable="false"></span>`)
    .join("");
document.querySelector("footer").appendChild(strip);

// ---------- avatar confetti: shape burst with gravity ----------
const avatar = document.getElementById("avatar");
let clicks = 0;

function burst(cx, cy) {
  const parts = [];
  for (let i = 0; i < 24; i++) {
    const el = document.createElement("span");
    el.className = "confetti-bit";
    el.innerHTML = SHAPES[i % SHAPES.length](COLORS[i % COLORS.length], 0.7 + Math.random() * 0.7);
    el.style.left = cx + "px";
    el.style.top = cy + "px";
    document.body.appendChild(el);
    parts.push({
      el,
      x: 0, y: 0,
      vx: (Math.random() - 0.5) * 9,
      vy: -(2.5 + Math.random() * 5),
      rot: 0,
      vr: (Math.random() - 0.5) * 14,
      born: performance.now(),
    });
  }
  const LIFE = 1150;
  (function step(now) {
    let alive = false;
    for (const p of parts) {
      const age = now - p.born;
      if (age > LIFE) { p.el.remove(); continue; }
      alive = true;
      p.vy += 0.22;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      const fade = age > LIFE * 0.6 ? 1 - (age - LIFE * 0.6) / (LIFE * 0.4) : 1;
      p.el.style.opacity = fade.toFixed(2);
      p.el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) rotate(${p.rot}deg)`;
    }
    if (alive) requestAnimationFrame(step);
  })(performance.now());
}

avatar.addEventListener("click", () => {
  clicks++;
  const rect = avatar.getBoundingClientRect();
  burst(rect.left + rect.width / 2, rect.top + rect.height / 2);
  if (clicks === 5) {
    const rect2 = avatar.getBoundingClientRect();
    const note = document.createElement("div");
    note.className = "bubble";
    note.textContent = "okay okay, that's enough dopamine 😅";
    note.style.left = Math.max(8, rect2.left - 14) + "px";
    note.style.top = Math.max(8, rect2.top - 58) + "px";
    document.body.appendChild(note);
    note.animate(
      [
        { transform: "scale(0.5) rotate(-9deg)", opacity: 0 },
        { transform: "scale(1) rotate(-3deg)", opacity: 1 },
      ],
      { duration: 320, easing: "cubic-bezier(0.34,1.56,0.64,1)" }
    );
    setTimeout(() => {
      note.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 250 }).onfinish = () => note.remove();
    }, 2300);
    clicks = 0;
  }
});
