/* tairqaldy.xyz v3 — poster layout, sticker chips, spring physics */

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
  el.style.setProperty("--d", `${Math.min(0.08 + i * 0.06, 0.9)}s`);
});

addEventListener("load", () => {
  requestAnimationFrame(() => document.body.classList.add("loaded"));
});
setTimeout(() => document.body.classList.add("loaded"), 1800);

// ---------- marquee ----------
const words = [
  "obsessed", "настойчивый", "ship &gt; talk", "adhd is a feature",
  "20+ fails, still here", "build in public", "салем әлем",
  "astana standard time", "18 &amp; shipping", "talk is cheap, show me the code",
];
const half = words.map((w) => `<span>${w}</span><span class="sep">✦</span>`).join("");
document.getElementById("marquee-track").innerHTML = half + half;

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
  <g fill="#ffec3e"><circle cx="6" cy="6" r="1.1"/><circle cx="6" cy="12" r="1.1"/><circle cx="6" cy="18" r="1.1"/><circle cx="6" cy="24" r="1.1"/><circle cx="6" cy="30" r="1.1" opacity="0"/></g>
</svg>`;

// type: logo (svg file) | text | brand (serif wordmark) | flag
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
const items = [];

STICKERS.forEach((s, i) => {
  const el = document.createElement("div");
  el.className = "sticker" + (s.type === "text" ? " text" : "") + (s.type === "brand" ? " brand" : "");
  el.style.setProperty("--rot", ROTS[i] + "deg");
  el.style.setProperty("--td", 0.55 + i * 0.07 + "s");
  el.innerHTML = chipHTML(s);
  zone.appendChild(el);
  items.push({
    el, cfg: s, rot: ROTS[i],
    dx: 0, dy: 0, tx: 0, ty: 0, vx: 0, vy: 0, tilt: 0, scale: 1,
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
    const w = el.offsetWidth || 80;
    let x;
    if (cfg.side === "l") {
      x = Math.min(Math.max(gutter * cfg.gx - w / 2, 12), Math.max(gutter - w - 16, 12));
    } else {
      const gx = innerWidth - gutter + gutter * cfg.gx - w / 2;
      x = Math.max(Math.min(gx, innerWidth - w - 12), innerWidth - gutter + 16);
    }
    el.style.left = x + "px";
    el.style.top = (cfg.y / 100) * innerHeight + "px";
  }
}
layoutStickers();
addEventListener("resize", layoutStickers);

setTimeout(() => {
  items.forEach(({ el }) => el.classList.add("on"));
}, reduceMotion ? 0 : 300);

// physics: lerp toward pointer while dragging, inertia + tilt decay after release
function frame() {
  for (const it of items) {
    if (!it.settled) continue;
    const targetScale = it.dragging ? 1.07 : 1;
    const scaleMoving = Math.abs(it.scale - targetScale) > 0.002;
    if (it.dragging) {
      const nx = it.dx + (it.tx - it.dx) * 0.3;
      const ny = it.dy + (it.ty - it.dy) * 0.3;
      it.vx = nx - it.dx;
      it.vy = ny - it.dy;
      it.dx = nx;
      it.dy = ny;
      it.tilt += (Math.max(-15, Math.min(15, it.vx * 1.3)) - it.tilt) * 0.22;
    } else if (Math.abs(it.vx) > 0.04 || Math.abs(it.vy) > 0.04 || Math.abs(it.tilt) > 0.08 || scaleMoving) {
      it.dx += it.vx;
      it.dy += it.vy;
      it.vx *= 0.93;
      it.vy *= 0.93;
      it.tilt *= 0.87;
    } else {
      continue;
    }
    it.scale += (targetScale - it.scale) * 0.2;
    it.el.style.transform =
      `translate3d(${it.dx}px, ${it.dy}px, 0) rotate(${it.rot + it.tilt}deg) scale(${it.scale.toFixed(3)})`;
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

// occasional wiggle from an untouched sticker
if (!reduceMotion) {
  setInterval(() => {
    const still = items.filter((it) => it.settled && !it.dragging && Math.abs(it.dx) < 1 && Math.abs(it.dy) < 1);
    if (!still.length) return;
    const it = still[(Math.random() * still.length) | 0];
    it.el.classList.add("wiggle");
    setTimeout(() => it.el.classList.remove("wiggle"), 600);
  }, 6500);
}

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
