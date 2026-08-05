/* tairqaldy.xyz — clock, typing, stickers, particles, confetti */

// ---------- live Astana clock ----------
const clockEl = document.getElementById("clock");
function tick() {
  clockEl.textContent = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false, timeZone: "Asia/Almaty",
  }).format(new Date());
}
tick();
setInterval(tick, 1000);

// ---------- typing intro on the name ----------
const nameEl = document.getElementById("name");
const fullName = nameEl.dataset.text;
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!reduceMotion) {
  nameEl.textContent = "";
  const cursor = document.createElement("span");
  cursor.className = "cursor";
  nameEl.appendChild(cursor);
  let i = 0;
  (function type() {
    if (i < fullName.length) {
      cursor.before(fullName[i++]);
      setTimeout(type, 55 + Math.random() * 70);
    } else {
      setTimeout(() => cursor.remove(), 2500);
    }
  })();
}

// scramble on hover (after typing settles)
const GLYPHS = "!<>-_\\/[]{}—=+*^?#абвгд";
let scrambling = false;
nameEl.addEventListener("pointerenter", () => {
  if (scrambling || reduceMotion) return;
  scrambling = true;
  let frame = 0;
  const iv = setInterval(() => {
    nameEl.textContent = fullName
      .split("")
      .map((ch, idx) =>
        ch === " " ? " " : idx < frame ? fullName[idx] : GLYPHS[(Math.random() * GLYPHS.length) | 0]
      )
      .join("");
    if (frame++ > fullName.length) {
      clearInterval(iv);
      nameEl.textContent = fullName;
      scrambling = false;
    }
  }, 38);
});

// ---------- staggered entrance ----------
document.querySelectorAll(".fade-item").forEach((el, i) => {
  el.style.setProperty("--d", `${0.08 + i * 0.13}s`);
});

// ---------- marquee ----------
const words = [
  "obsessed", "настойчивый", "ship &gt; talk", "ADHD is a feature",
  "20+ fails, still here", "build in public", "салем әлем",
  "Astana standard time", "18 &amp; shipping", "talk is cheap, show me the code",
];
const half = words.map((w) => `<span>${w}</span><span class="sep">✦</span>`).join("");
document.getElementById("marquee-track").innerHTML = half + half;

// ---------- floating background particles ----------
const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");
let W, H, dots;
const COLORS = ["#00afca", "#ffc93c", "#ff6b57"];

function resize() {
  W = canvas.width = innerWidth;
  H = canvas.height = innerHeight;
  dots = Array.from({ length: Math.min(46, (W * H) / 26000) }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: 1 + Math.random() * 2.4,
    vx: (Math.random() - 0.5) * 0.25,
    vy: (Math.random() - 0.5) * 0.25,
    c: COLORS[(Math.random() * COLORS.length) | 0],
    a: 0.12 + Math.random() * 0.2,
  }));
}
resize();
addEventListener("resize", resize);

const mouse = { x: -9e9, y: -9e9 };
addEventListener("pointermove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });

function drawDots() {
  ctx.clearRect(0, 0, W, H);
  for (const d of dots) {
    // gentle pull toward cursor
    const dx = mouse.x - d.x, dy = mouse.y - d.y;
    const dist2 = dx * dx + dy * dy;
    if (dist2 < 32000) { d.vx += dx * 0.000012; d.vy += dy * 0.000012; }
    d.vx *= 0.995; d.vy *= 0.995;
    d.x += d.vx; d.y += d.vy;
    if (d.x < -10) d.x = W + 10; if (d.x > W + 10) d.x = -10;
    if (d.y < -10) d.y = H + 10; if (d.y > H + 10) d.y = -10;
    ctx.globalAlpha = d.a;
    ctx.fillStyle = d.c;
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r, 0, 7);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  if (!reduceMotion) requestAnimationFrame(drawDots);
}
drawDots();

// ---------- stickers ----------
// side: hidden on narrow screens; sizes in px width
const STICKERS = [
  { f: "sticker-31.png", x: 6,  y: 6,  w: 96,  r: -7 },            // KZ flag
  { f: "sticker-04.png", x: 13, y: 22, w: 62,  r: 5,  side: 1 },   // YC
  { f: "sticker-16.png", x: 5,  y: 38, w: 110, r: -4, side: 1 },   // Claude
  { f: "sticker-09.png", x: 11, y: 54, w: 104, r: 6,  side: 1 },   // Linus: talk is cheap
  { f: "sticker-13.png", x: 5,  y: 72, w: 58,  r: -9, side: 1 },   // Python
  { f: "sticker-28.png", x: 9,  y: 87, w: 128, r: 4 },             // SATHustle
  { f: "sticker-07.png", x: 88, y: 8,  w: 66,  r: 8 },             // Anthropic
  { f: "sticker-05.png", x: 84, y: 24, w: 100, r: -5, side: 1 },   // Antler
  { f: "sticker-01.png", x: 88, y: 40, w: 110, r: 4,  side: 1 },   // Astana Hub
  { f: "sticker-23.png", x: 86, y: 56, w: 92,  r: -6, side: 1 },   // n8n
  { f: "sticker-29.png", x: 90, y: 70, w: 56,  r: 9,  side: 1 },   // FL Studio
  { f: "sticker-30.png", x: 85, y: 86, w: 104, r: -3 },            // Vercel
  { f: "sticker-12.png", x: 78, y: 94, w: 52,  r: 12, side: 1 },   // React
  { f: "sticker-08.png", x: 18, y: 94, w: 80,  r: -5, side: 1 },   // IG QR
];

const zone = document.getElementById("stickers");
const docH = () => document.documentElement.scrollHeight;

STICKERS.forEach((s, i) => {
  const el = document.createElement("div");
  el.className = "sticker" + (s.side ? " side" : "");
  el.style.width = s.w + "px";
  el.style.left = `calc(${s.x}vw - ${s.w / 2}px)`;
  el.style.top = (s.y / 100) * Math.max(docH(), innerHeight) + "px";
  el.style.rotate = s.r + "deg";
  el.style.zIndex = 1;
  el.style.setProperty("--bob-dur", 4 + Math.random() * 3 + "s");
  el.style.setProperty("--bob-delay", -Math.random() * 4 + "s");
  el.innerHTML = `<img src="public/stickers/${s.f}" alt="" draggable="false" loading="lazy">`;
  zone.appendChild(el);
  makeDraggable(el, s.r);
});

function makeDraggable(el, baseRot) {
  let sx, sy, ox, oy, lastX, lastDx = 0;
  el.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    el.setPointerCapture(e.pointerId);
    el.classList.add("dragging");
    sx = e.clientX; sy = e.clientY; lastX = e.clientX;
    ox = parseFloat(el.style.left) || el.offsetLeft;
    oy = parseFloat(el.style.top) || el.offsetTop;
    // normalize left to px
    ox = el.offsetLeft; oy = el.offsetTop;
  });
  el.addEventListener("pointermove", (e) => {
    if (!el.classList.contains("dragging")) return;
    lastDx = e.clientX - lastX;
    lastX = e.clientX;
    el.style.left = ox + (e.clientX - sx) + "px";
    el.style.top = oy + (e.clientY - sy) + "px";
    el.style.rotate = baseRot + Math.max(-18, Math.min(18, lastDx * 1.6)) + "deg";
  });
  const drop = () => {
    el.classList.remove("dragging");
    el.style.rotate = baseRot + "deg";
  };
  el.addEventListener("pointerup", drop);
  el.addEventListener("pointercancel", drop);
}

// ---------- avatar confetti ----------
const avatar = document.getElementById("avatar");
let clicks = 0;
avatar.addEventListener("click", () => {
  clicks++;
  const rect = avatar.getBoundingClientRect();
  const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
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
          transform: `translate(${Math.cos(ang) * v}px, ${Math.sin(ang) * v + 120}px) rotate(${(Math.random() - 0.5) * 540}deg)`,
          opacity: 0,
        },
      ],
      { duration: 800 + Math.random() * 500, easing: "cubic-bezier(0.22,1,0.36,1)" }
    ).onfinish = () => p.remove();
  }
  if (clicks === 5) {
    const note = document.createElement("div");
    note.className = "handwritten";
    note.style.cssText = "position:fixed;left:50%;top:12%;transform:translateX(-50%) rotate(-2deg);font-size:1.6rem;z-index:99;";
    note.textContent = "okay okay that's enough dopamine 😄";
    document.body.appendChild(note);
    setTimeout(() => note.remove(), 2600);
    clicks = 0;
  }
});
