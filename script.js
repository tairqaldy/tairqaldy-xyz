/* tairqaldy.xyz v2 — orchestrated load, smooth sticker physics, small delights */

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const COLORS = ["#00afca", "#ffc93c", "#ff6b57"];

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
  el.style.setProperty("--d", `${Math.min(0.1 + i * 0.07, 1.1)}s`);
});

addEventListener("load", () => {
  requestAnimationFrame(() => document.body.classList.add("loaded"));
});
// fallback in case load hangs on a slow font
setTimeout(() => document.body.classList.add("loaded"), 1800);

// ---------- name scramble on hover ----------
const GLYPHS = "!<>-_/[]{}=+*^?#абвгдқң";
document.querySelectorAll("#name .wi").forEach((span) => {
  const original = span.textContent;
  let busy = false;
  span.parentElement.addEventListener("pointerenter", () => {
    if (busy || reduceMotion) return;
    busy = true;
    let frame = 0;
    const iv = setInterval(() => {
      span.textContent = original
        .split("")
        .map((ch, idx) => (idx < frame ? original[idx] : GLYPHS[(Math.random() * GLYPHS.length) | 0]))
        .join("");
      if (frame++ >= original.length) {
        clearInterval(iv);
        span.textContent = original;
        busy = false;
      }
    }, 34);
  });
});

// ---------- marquee ----------
const words = [
  "obsessed", "настойчивый", "ship &gt; talk", "adhd is a feature",
  "20+ fails, still here", "build in public", "салем әлем",
  "astana standard time", "18 &amp; shipping", "talk is cheap, show me the code",
];
const half = words.map((w) => `<span>${w}</span><span class="sep">✦</span>`).join("");
document.getElementById("marquee-track").innerHTML = half + half;

// ---------- stickers: gutter layout + physics drag ----------
// side: l/r · gx: 0..1 across the gutter · y: vh · w: px
const STICKERS = [
  { f: "sticker-31.png", side: "l", gx: 0.42, y: 8,  w: 96 },  // KZ flag
  { f: "sticker-04.png", side: "l", gx: 0.25, y: 24, w: 60 },  // YC
  { f: "sticker-16.png", side: "l", gx: 0.55, y: 37, w: 112 }, // Claude
  { f: "sticker-09.png", side: "l", gx: 0.35, y: 53, w: 104 }, // Linus quote
  { f: "sticker-13.png", side: "l", gx: 0.6,  y: 70, w: 56 },  // Python
  { f: "sticker-28.png", side: "l", gx: 0.4,  y: 84, w: 126 }, // SATHustle
  { f: "sticker-07.png", side: "r", gx: 0.5,  y: 9,  w: 64 },  // Anthropic
  { f: "sticker-05.png", side: "r", gx: 0.35, y: 23, w: 100 }, // Antler
  { f: "sticker-01.png", side: "r", gx: 0.55, y: 38, w: 112 }, // Astana Hub
  { f: "sticker-23.png", side: "r", gx: 0.4,  y: 54, w: 92 },  // n8n
  { f: "sticker-29.png", side: "r", gx: 0.6,  y: 68, w: 54 },  // FL Studio
  { f: "sticker-30.png", side: "r", gx: 0.42, y: 83, w: 104 }, // Vercel
];
const ROTS = [-7, 5, -4, 6, -9, 4, 8, -5, 4, -6, 9, -3];

const CONTENT_W = 680;
const zone = document.getElementById("stickers");
const items = [];

STICKERS.forEach((s, i) => {
  const el = document.createElement("div");
  el.className = "sticker";
  el.style.width = s.w + "px";
  el.style.setProperty("--rot", ROTS[i] + "deg");
  el.style.setProperty("--td", 0.7 + i * 0.08 + "s");
  el.innerHTML = `<img src="assets/stickers/${s.f}" alt="" draggable="false">`;
  zone.appendChild(el);
  items.push({
    el, cfg: s, rot: ROTS[i],
    dx: 0, dy: 0, tx: 0, ty: 0, vx: 0, vy: 0, tilt: 0,
    dragging: false, settled: false,
  });
  el.addEventListener("animationend", () => {
    el.classList.add("settled");
    items[i].settled = true;
  });
});

function layoutStickers() {
  const gutter = Math.max((innerWidth - CONTENT_W) / 2, 0);
  for (const it of items) {
    const { cfg, el } = it;
    const w = cfg.w;
    let x;
    if (cfg.side === "l") {
      x = Math.min(Math.max(gutter * cfg.gx - w / 2, 10), Math.max(gutter - w - 14, 10));
    } else {
      const gx = innerWidth - gutter + gutter * cfg.gx - w / 2;
      x = Math.max(Math.min(gx, innerWidth - w - 10), innerWidth - gutter + 14);
    }
    el.style.left = x + "px";
    el.style.top = (cfg.y / 100) * innerHeight + "px";
  }
}
layoutStickers();
addEventListener("resize", layoutStickers);

// launch the toss-in after the text reveal starts
setTimeout(() => {
  items.forEach(({ el }) => el.classList.add("on"));
}, reduceMotion ? 0 : 350);

// physics loop: lerp toward pointer while dragging, inertia after release
function frame() {
  for (const it of items) {
    if (!it.settled) continue;
    if (it.dragging) {
      const nx = it.dx + (it.tx - it.dx) * 0.32;
      const ny = it.dy + (it.ty - it.dy) * 0.32;
      it.vx = nx - it.dx;
      it.vy = ny - it.dy;
      it.dx = nx;
      it.dy = ny;
      it.tilt += ((Math.max(-16, Math.min(16, it.vx * 1.4)) - it.tilt) * 0.25);
    } else if (Math.abs(it.vx) > 0.05 || Math.abs(it.vy) > 0.05 || Math.abs(it.tilt) > 0.1) {
      it.dx += it.vx;
      it.dy += it.vy;
      it.vx *= 0.92;
      it.vy *= 0.92;
      it.tilt *= 0.88;
    } else {
      continue;
    }
    it.el.style.transform =
      `translate3d(${it.dx}px, ${it.dy}px, 0) rotate(${it.rot + it.tilt}deg)`;
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

items.forEach((it) => {
  const { el } = it;
  let px = 0, py = 0;
  el.addEventListener("pointerdown", (e) => {
    if (!it.settled) return;
    e.preventDefault();
    el.setPointerCapture(e.pointerId);
    el.classList.add("dragging");
    it.dragging = true;
    px = e.clientX;
    py = e.clientY;
  });
  el.addEventListener("pointermove", (e) => {
    if (!it.dragging) return;
    it.tx += e.clientX - px;
    it.ty += e.clientY - py;
    px = e.clientX;
    py = e.clientY;
  });
  const release = () => {
    it.dragging = false;
    el.classList.remove("dragging");
  };
  el.addEventListener("pointerup", release);
  el.addEventListener("pointercancel", release);
});

// occasional wiggle from a random untouched sticker
if (!reduceMotion) {
  setInterval(() => {
    const still = items.filter((it) => it.settled && !it.dragging && Math.abs(it.dx) < 1 && Math.abs(it.dy) < 1);
    if (!still.length) return;
    const it = still[(Math.random() * still.length) | 0];
    it.el.classList.add("wiggle");
    setTimeout(() => it.el.classList.remove("wiggle"), 550);
  }, 6500);
}

// ---------- mobile sticker strip ----------
const strip = document.createElement("div");
strip.className = "sticker-strip";
strip.setAttribute("aria-hidden", "true");
["sticker-31.png", "sticker-16.png", "sticker-04.png", "sticker-28.png", "sticker-29.png", "sticker-23.png"]
  .forEach((f) => {
    strip.innerHTML += `<span class="mini"><img src="assets/stickers/${f}" alt="" draggable="false"></span>`;
  });
document.querySelector("footer").appendChild(strip);

// ---------- avatar confetti ----------
const avatar = document.getElementById("avatar");
let clicks = 0;
avatar.addEventListener("click", () => {
  clicks++;
  const rect = avatar.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  for (let i = 0; i < 26; i++) {
    const p = document.createElement("div");
    p.className = "confetti";
    p.style.background = COLORS[(Math.random() * COLORS.length) | 0];
    p.style.left = cx + "px";
    p.style.top = cy + "px";
    document.body.appendChild(p);
    const ang = Math.random() * Math.PI * 2;
    const v = 60 + Math.random() * 160;
    p.animate(
      [
        { transform: "translate(0,0) rotate(0)", opacity: 1 },
        {
          transform: `translate(${Math.cos(ang) * v}px, ${Math.sin(ang) * v + 130}px) rotate(${(Math.random() - 0.5) * 540}deg)`,
          opacity: 0,
        },
      ],
      { duration: 850 + Math.random() * 500, easing: "cubic-bezier(0.22,1,0.36,1)" }
    ).onfinish = () => p.remove();
  }
  if (clicks === 5) {
    const note = document.createElement("div");
    note.className = "handwritten";
    note.style.cssText =
      "position:fixed;left:50%;top:12%;transform:translateX(-50%) rotate(-2deg);font-size:1.7rem;z-index:99;";
    note.textContent = "okay okay, that's enough dopamine 😄";
    document.body.appendChild(note);
    setTimeout(() => note.remove(), 2600);
    clicks = 0;
  }
});
