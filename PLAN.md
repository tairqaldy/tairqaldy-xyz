# tairqaldy.xyz — implementation plan

Static one-pager, playful **light editorial** — the *opposite* of igorblink.com's dark minimal,
closer to jordanwatkins.xyz "welcome to my world" energy.
Target: build fast, deploy via GitHub repo [tairqaldy/tairqaldy-xyz](https://github.com/tairqaldy/tairqaldy-xyz) + Vercel → **tairqaldy.xyz**.

## DECIDED (from Q&A)

- **Vibe**: light, playful, editorial. Bright/warm background, not near-black.
- **Signature element**: the real laptop stickers (from `stickers-tairqaldy.pdf`, extracted to
  `public/stickers/` — 34 PNGs: YC, Antler, Anthropic/Claude, Astana Hub, SATHustle, KZ flag,
  PG quote, FL Studio, tech logos…) **floating/draggable in the background**, scattered like a laptop lid.
- **Animations**: all of it, tastefully — particle/floaty canvas, typing/scramble intro,
  staggered fade-up, live clock, hover micro-fx, draggable stickers with a bit of physics.
  Small interactive delights everywhere (ADHD-friendly playground).
- **Positioning**: left the Netherlands, dropped out of uni, now building things in Kazakhstan.
- **Links**: X, LinkedIn, GitHub, Telegram, email.
- **Deploy**: git init → push to GitHub → Vercel imports repo → attach tairqaldy.xyz.

## Reference breakdown (what makes Igor's page work)

- Dark, near-black background with a subtle pixel-art backdrop (Golden Gate at night)
- Small round avatar + "yo, I'm" → big name
- Short punchy bio: 3 paragraphs, key numbers/phrases in **bold**, rest dimmed grey
- Location line with **live local time** (San Francisco, CA · 08:32)
- One "Writings(lifestory)" link + icon row (X / LinkedIn / Calendly)
- No nav, no sections, no scroll — everything in one viewport
- The whole page is a single narrative flex column, max-width ~640px, centered

## Proposed stack

- **Plain static**: `index.html` + `style.css` + `script.js` — no framework, no build step
  - Fastest to ship, trivially deployable, zero maintenance
  - Vercel serves it as-is; custom domain already there
- Deploy: `vercel --prod` from this directory (or connect a GitHub repo — TBD)

## File structure

```
tairqaldy-xyz/
├── index.html      # all markup
├── style.css       # theme, layout, animations
├── script.js       # live clock, canvas/text effects
├── public/
│   ├── avatar.jpg  # profile photo (needed from Tair)
│   └── og.png      # social preview image (optional, can generate)
└── PLAN.md
```

## Animation candidates ("my style" — pick a few, not all)

1. **Canvas particle field / starfield** — slow drifting dots behind content
2. **Typing intro** — name or tagline types itself out on load
3. **Glitch / scramble hover** — text characters scramble then settle
4. **Live local time** — ticking clock next to location (Igor has this, keep it)
5. **Staggered fade-up on load** — each paragraph rises in with a small delay
6. **Hover micro-interactions** — links underline-slide, icons lift
7. **Pixel-art / generated backdrop** — city skyline or steppe at night, faded behind text

## Content — NEEDED FROM TAIR (the new lore)

- [ ] Intro line (the "yo, I'm" equivalent — or something in Tair's voice)
- [ ] 2–4 short bio paragraphs: the journey, the numbers, what's now
- [ ] Current status line (what you're building / where)
- [ ] Location + timezone for the clock
- [ ] Links: which socials (X? LinkedIn? GitHub? Telegram? email? Calendly? writings?)
- [ ] Profile photo file
- [ ] Accent color / vibe preference

## SEO / meta (quick wins, included)

- `<title>`, meta description, OG tags + OG image, favicon
- Single font via system stack or one self-hosted woff2 (no FOUT)

## Steps

1. Answers from Tair (vibe, animations, links, lore text, photo)
2. Build `index.html` + `style.css` + `script.js` locally, preview in browser
3. Iterate on details with live preview
4. `vercel --prod`, attach `tairqaldy.xyz` in project settings
5. Done — verify on the real domain
