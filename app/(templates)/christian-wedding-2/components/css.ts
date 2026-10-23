// ─── Christian Wedding — Scroll Edition: the guest page's stylesheet ────────
// Phone first (360–430), then tablet (≥700) and laptop/desktop (≥1024, ≥1440).
// Light only: sage, ivory, blush, soft gold. Every photo and card is a rounded
// rectangle with four equal corners. Motion is transform/opacity only and is
// switched off under prefers-reduced-motion.

export const C2_CSS = `
.c2-root { --c2-ink:#2f3a32; --c2-muted:#66726a; --c2-sage:#7f9a83; --c2-sage-deep:#4c6852; --c2-sage-soft:#e6ede4;
  --c2-blush:#ecc3ca; --c2-blush-deep:#b4677a; --c2-blush-soft:#fbeef0; --c2-gold:#c2a165; --c2-gold-ink:#86672c;
  --c2-paper:#fffdf9; --c2-bg:#fbf6f2; --c2-bg2:#f4ebe6; --c2-line:rgba(127,154,131,.28); --c2-r:22px; --c2-r-sm:16px;
  --c2-shadow:0 24px 60px -32px rgba(60,72,58,.42), 0 2px 10px -4px rgba(60,72,58,.12);
  --c2-display:var(--wk-font-display, "Cormorant Garamond", Georgia, serif); --c2-script:var(--wk-font-script, "Great Vibes", cursive);
  --c2-caps:var(--wk-font-caps, Cinzel, serif); --c2-sans:var(--wk-font-sans, "DM Sans", system-ui, sans-serif);
  position:relative; color:var(--c2-ink); background:var(--c2-bg); font-family:var(--c2-sans); overflow-x:clip; min-height:100dvh;
  scroll-padding-bottom:96px; -webkit-tap-highlight-color:transparent; }
.c2-root *, .c2-root *::before, .c2-root *::after { box-sizing:border-box; }
.c2-root img { max-width:100%; }
.c2-root :focus-visible { outline:3px solid var(--c2-blush-deep); outline-offset:3px; border-radius:10px; }
.c2-backdrop { position:fixed; inset:0; z-index:0; pointer-events:none;
  background: radial-gradient(120% 60% at 50% 0%, #fff 0%, transparent 60%), linear-gradient(180deg, var(--c2-bg) 0%, var(--c2-bg2) 100%); }
.c2-main { position:relative; z-index:1; }

/* ── Type ─────────────────────────────────────────────────────────────── */
.c2-eyebrow { font-family:var(--c2-caps); font-size:12px; letter-spacing:.3em; text-transform:uppercase; color:var(--c2-sage-deep); margin:0; font-weight:600; }
.c2-h2 { font-family:var(--c2-script); font-weight:400; font-size:clamp(40px, 10vw, 68px); line-height:1.05; color:var(--c2-blush-deep); margin:6px 0 0; text-wrap:balance; }
.c2-h3 { font-family:var(--c2-display); font-size:clamp(24px, 5.6vw, 30px); font-weight:600; color:var(--c2-ink); margin:0; line-height:1.2; text-wrap:balance; }
.c2-p { font-family:var(--c2-display); font-size:clamp(19px, 4.6vw, 22px); line-height:1.6; color:var(--c2-ink); margin:0; }
.c2-small { font-size:15px; color:var(--c2-muted); line-height:1.5; }
.c2-head { text-align:center; margin:0 auto clamp(28px, 5vw, 44px); max-width:640px; position:relative; }
.c2-rule { display:flex; align-items:center; justify-content:center; gap:12px; margin-top:14px; color:var(--c2-gold); }
.c2-rule::before, .c2-rule::after { content:""; height:1px; width:min(90px, 22vw); background:linear-gradient(90deg, transparent, currentColor); }
.c2-rule::after { transform:scaleX(-1); }
.c2-rule svg { flex:none; }

/* ── Sections ─────────────────────────────────────────────────────────── */
.c2-sec { position:relative; padding:clamp(50px, 8vw, 84px) 16px; }
.c2-wrap { position:relative; max-width:1120px; margin:0 auto; }
.c2-narrow { max-width:620px; margin:0 auto; }
.c2-card { background:var(--c2-paper); border-radius:var(--c2-r); box-shadow:var(--c2-shadow); border:1px solid var(--c2-line); position:relative; }
.c2-frame { position:relative; border-radius:var(--c2-r); overflow:hidden; background:var(--c2-blush-soft); box-shadow:var(--c2-shadow); isolation:isolate; }
.c2-frame::after { content:""; position:absolute; inset:7px; border-radius:calc(var(--c2-r) - 6px); border:1px solid rgba(255,255,255,.75); pointer-events:none; z-index:2; }
.c2-frame img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; display:block; }

/* ── Buttons ──────────────────────────────────────────────────────────── */
.c2-btn { display:inline-flex; align-items:center; justify-content:center; gap:8px; min-height:48px; padding:12px 22px; border-radius:999px;
  border:1px solid transparent; background:linear-gradient(135deg, var(--c2-sage-deep), var(--c2-sage)); color:#fff; font:600 15px/1.2 var(--c2-sans);
  letter-spacing:.02em; text-decoration:none; cursor:pointer; box-shadow:0 12px 26px -14px rgba(60,90,66,.7); transition:transform .2s, box-shadow .2s; white-space:nowrap; }
.c2-btn:hover { transform:translateY(-1px); }
.c2-btn:active { transform:scale(.98); }
.c2-btn.is-ghost { background:rgba(255,253,249,.86); color:var(--c2-sage-deep); border-color:var(--c2-line); box-shadow:none; }
.c2-btn.is-blush { background:linear-gradient(135deg, var(--c2-blush-deep), #d48a9a); box-shadow:0 12px 26px -14px rgba(180,103,122,.75); }
.c2-btn.is-sm { min-height:44px; padding:10px 16px; font-size:14px; }
.c2-btn[disabled] { opacity:.55; cursor:default; }
.c2-round { width:46px; height:46px; border-radius:50%; display:inline-grid; place-items:center; border:1px solid var(--c2-line); background:#fff; color:var(--c2-sage-deep); text-decoration:none; flex:none; }
.c2-round.is-wa { background:#25d366; color:#fff; border-color:#25d366; }

/* ── Opening: stained-glass casement windows ─────────────────────────── */
.c2-open { position:fixed; inset:0; z-index:300; overflow:hidden; background:linear-gradient(180deg, #fbe9ec 0%, #f7e2e6 55%, #f2dce1 100%);
  transition:opacity .7s ease; }
.c2-open.is-push { opacity:0; pointer-events:none; }
.c2-open.is-reduced.is-push { transition:opacity .4s ease; }
.c2-open-blur { position:absolute; inset:-40px; background-size:cover; background-position:center; filter:blur(22px) saturate(1.1); opacity:.5; transform:scale(1.05); }
.c2-open-wall { position:absolute; inset:0; background: radial-gradient(70% 45% at 50% 42%, rgba(255,255,255,.75), transparent 70%); }
.c2-open-inner { position:relative; height:100%; display:grid; grid-template-rows:auto 1fr auto; justify-items:center; align-items:center;
  padding:calc(64px + env(safe-area-inset-top,0px)) 16px calc(14px + env(safe-area-inset-bottom,0px)); gap:6px; }
.c2-open-copy { text-align:center; max-width:560px; opacity:0; transform:translateY(12px); transition:opacity .8s ease .15s, transform .8s cubic-bezier(.2,.7,.2,1) .15s; }
.c2-open.is-ready .c2-open-copy { opacity:1; transform:none; }
.c2-open-dear { font-family:var(--c2-display); font-style:italic; font-size:18px; color:var(--c2-blush-deep); margin:0 0 2px; }
.c2-open-dear b { font-style:normal; font-weight:600; }
.c2-open-names { font-family:var(--c2-script); font-size:clamp(40px, 11.5vw, 64px); line-height:1.02; color:var(--c2-sage-deep); margin:2px 0 0; text-wrap:balance; }
.c2-open-names i { font-style:normal; color:var(--c2-gold); font-size:.7em; padding:0 .12em; }
.c2-open-date { font-family:var(--c2-caps); font-size:12.5px; letter-spacing:.24em; color:var(--c2-muted); margin:6px 0 0; text-transform:uppercase; }
.c2-open-place { font-family:var(--c2-display); font-style:italic; font-size:16px; color:var(--c2-sage-deep); margin:2px 0 0; }
.c2-stage-wrap { position:relative; width:100%; height:100%; min-height:0; display:grid; place-items:center; }
.c2-stage { position:relative; aspect-ratio:1145/1800; height:min(100%, 156vw, 860px); max-width:none; perspective:1400px; perspective-origin:50% 45%;
  transform-origin:50% 48%; transition:transform 1s cubic-bezier(.6,0,.3,1), opacity .8s ease; contain:layout paint; }
.c2-stage > * { position:absolute; }
.c2-stage img { display:block; width:100%; height:100%; user-select:none; -webkit-user-drag:none; }
.c2-aperture { left:14.286%; top:16.364%; width:71.4%; height:64.545%; overflow:hidden; z-index:1; background:#f7eef1; }
.c2-garden-bg { position:absolute; inset:-4%; width:108% !important; height:108% !important; object-fit:cover; transform:scale(1.04); transition:transform 2.4s cubic-bezier(.2,.6,.2,1); }
.c2-garden-fountain { position:absolute; left:50%; bottom:2%; width:52% !important; height:auto !important; transform:translateX(-50%) translateY(6%); opacity:.96; }
.c2-garden-lantern { position:absolute; top:-3%; width:24% !important; height:auto !important; transform-origin:50% 0; animation:c2-sway 6s ease-in-out infinite; }
.c2-garden-lantern.is-l { left:3%; }
.c2-garden-lantern.is-r { right:3%; animation-delay:-3s; transform:scaleX(-1); }
.c2-garden-glow { position:absolute; inset:0; background:radial-gradient(60% 50% at 50% 55%, rgba(255,248,230,.95), transparent 70%); opacity:0; transition:opacity 1.2s ease .15s; }
.c2-rays { position:absolute; left:-30%; top:-20%; width:160% !important; height:auto !important; mix-blend-mode:screen; opacity:0; transform:scale(.9); transition:opacity 1s ease .12s, transform 1.6s ease .12s; }
.c2-frame-img { left:0; top:0; width:100%; height:100%; z-index:4; pointer-events:none;
  /* Melt the painted wall's outer edge into the blurred garden behind (no hard box). */
  -webkit-mask-image:linear-gradient(90deg, transparent, #000 4%, #000 96%, transparent), linear-gradient(180deg, transparent, #000 3%, #000 95%, transparent);
  -webkit-mask-composite:source-in; mask-image:linear-gradient(90deg, transparent, #000 4%, #000 96%, transparent), linear-gradient(180deg, transparent, #000 3%, #000 95%, transparent); mask-composite:intersect; }
.c2-sash { z-index:5; transform-style:preserve-3d; transition:transform 1.5s cubic-bezier(.5,0,.2,1); cursor:pointer; }
.c2-sash.is-l { left:14.286%; top:16.364%; width:36.087%; height:64.545%; transform-origin:0% 50%; }
.c2-sash.is-r { left:49.627%; top:16.364%; width:36.087%; height:64.545%; transform-origin:100% 50%; z-index:6; transition-delay:.08s; }
.c2-sash-glint { position:absolute; inset:0; overflow:hidden; pointer-events:none; mix-blend-mode:screen; }
.c2-sash-glint::before { content:""; position:absolute; top:-10%; bottom:-10%; left:-80%; width:80%;
  background:linear-gradient(115deg, transparent 20%, rgba(255,214,240,.55) 45%, rgba(190,230,255,.5) 55%, transparent 80%); transform:translateX(0); }
.c2-open.is-ready.is-closed .c2-sash-glint::before { animation:c2-glint 5.5s ease-in-out 1.2s infinite; }
.c2-open.is-opening .c2-sash-glint::before { animation:c2-glint-once 1.3s ease-out forwards; }
.c2-sash-shade { position:absolute; inset:0; opacity:0; transition:opacity 1.5s ease; pointer-events:none; }
.c2-sash.is-l .c2-sash-shade { background:linear-gradient(to left, rgba(40,30,40,.0), rgba(40,30,40,.45)); }
.c2-sash.is-r .c2-sash-shade { background:linear-gradient(to right, rgba(40,30,40,.0), rgba(40,30,40,.45)); }
.c2-patches { position:absolute; left:10%; right:10%; bottom:8%; height:30%; z-index:7; pointer-events:none; opacity:0; transition:opacity 1s ease .5s; }
.c2-patches i { position:absolute; width:32%; height:40%; border-radius:50%; filter:blur(10px); }
.c2-patches i:nth-child(1) { left:4%; top:10%; background:rgba(255,170,200,.45); }
.c2-patches i:nth-child(2) { left:36%; top:40%; background:rgba(170,215,255,.42); }
.c2-patches i:nth-child(3) { right:4%; top:6%; background:rgba(255,230,150,.42); }
.c2-open.is-opening .c2-patches { opacity:1; }
.c2-open.is-opening .c2-patches i { animation:c2-patch 2.2s ease-out forwards; }
.c2-petals { position:absolute; inset:0; z-index:8; pointer-events:none; overflow:hidden; }
.c2-petals img { position:absolute; top:-20px; opacity:.9; will-change:transform; }
.c2-open.is-opening .c2-sash.is-l { transform:rotateY(-100deg); }
.c2-open.is-opening .c2-sash.is-r { transform:rotateY(100deg); }
.c2-open.is-opening .c2-sash-shade { opacity:.6; }
.c2-open.is-opening .c2-rays { opacity:.85; transform:scale(1.08); }
.c2-open.is-opening .c2-garden-glow { opacity:1; }
.c2-open.is-opening .c2-garden-bg { transform:scale(1.12); }
.c2-open.is-push .c2-stage { transform:scale(1.9) translateY(4%); }
.c2-open-cta { display:flex; flex-direction:column; align-items:center; gap:8px; padding-top:4px; opacity:0; transition:opacity .6s ease .35s; }
.c2-open.is-ready .c2-open-cta { opacity:1; }
.c2-open.is-opening .c2-open-cta, .c2-open.is-opening .c2-open-copy { opacity:0; transition-duration:.4s; transition-delay:0s; }
.c2-open-btn { min-height:52px; padding:14px 30px; font-size:16px; animation:c2-breathe 2.6s ease-in-out infinite; }
.c2-open-hint { font-size:13px; color:var(--c2-muted); margin:0; display:flex; align-items:center; gap:2px; }
.c2-open-skip { background:none; border:0; color:var(--c2-sage-deep); font:500 14px var(--c2-sans); text-decoration:underline; text-underline-offset:3px; min-height:44px; padding:8px 14px; cursor:pointer; }
@keyframes c2-sway { 0%,100% { transform:rotate(-2deg); } 50% { transform:rotate(2deg); } }
.c2-garden-lantern.is-r { animation-name:c2-sway-r; }
@keyframes c2-sway-r { 0%,100% { transform:scaleX(-1) rotate(-2deg); } 50% { transform:scaleX(-1) rotate(2deg); } }
@keyframes c2-glint { 0%, 55% { transform:translateX(0); } 85%, 100% { transform:translateX(330%); } }
@keyframes c2-glint-once { from { transform:translateX(0); } to { transform:translateX(330%); } }
@keyframes c2-patch { from { transform:translateX(-30%) scale(.8); } to { transform:translateX(25%) scale(1.15); } }
@keyframes c2-breathe { 0%,100% { transform:scale(1); box-shadow:0 12px 26px -14px rgba(60,90,66,.7); } 50% { transform:scale(1.04); box-shadow:0 18px 34px -14px rgba(60,90,66,.8); } }
@media (min-width: 1024px) {
  .c2-open-inner { grid-template-columns:minmax(320px, 1fr) minmax(0, 1.05fr); grid-template-rows:1fr auto; column-gap:clamp(24px, 4vw, 80px); padding:28px clamp(32px, 6vw, 120px); }
  .c2-open-copy { grid-column:1; grid-row:1; text-align:left; justify-self:end; align-self:center; }
  .c2-open-names { font-size:clamp(64px, 6vw, 104px); }
  .c2-open-dear { font-size:22px; }
  .c2-open-date { font-size:14px; }
  .c2-stage-wrap { grid-column:2; grid-row:1 / span 2; justify-self:start; }
  .c2-stage { height:min(88svh, 900px); }
  .c2-open-cta { grid-column:1; grid-row:2; justify-self:end; align-items:flex-end; align-self:start; }
}

/* ── Hero: the garden terrace ────────────────────────────────────────── */
.c2-hero { position:relative; min-height:100svh; padding:calc(96px + env(safe-area-inset-top,0px)) 16px 0; overflow:hidden; isolation:isolate; display:flex; flex-direction:column; }
.c2-hero-sky { position:absolute; inset:0 0 auto; height:72%; z-index:-3; object-fit:cover; width:100% !important; opacity:.9;
  -webkit-mask-image:linear-gradient(180deg, #000 55%, transparent); mask-image:linear-gradient(180deg, #000 55%, transparent); }
.c2-hero-ivy { position:absolute; top:-6px; left:50%; width:max(820px, 112vw) !important; height:auto !important; transform:translateX(-50%); z-index:-1; pointer-events:none; transform-origin:50% 0; }
.c2-col { position:absolute; bottom:0; height:min(92%, 980px) !important; width:auto !important; z-index:-2; opacity:.95; pointer-events:none; }
.c2-col.is-l { left:-7vw; }
.c2-col.is-r { right:-7vw; }
.c2-hero-lantern { position:absolute; top:40px; width:clamp(64px, 17vw, 140px) !important; height:auto !important; transform-origin:50% 0; z-index:-1; animation:c2-sway 7s ease-in-out infinite; pointer-events:none; }
.c2-hero-lantern.is-l { left:5vw; }
.c2-hero-lantern.is-r { right:5vw; animation-delay:-3.5s; }
@media (max-width: 759px) {
  /* Phones: slimmer portico so the names own the middle, ivy kept above the eyebrow. */
  .c2-hero { padding-top:calc(150px + env(safe-area-inset-top,0px)); }
  .c2-hero-ivy { width:max(540px, 138vw) !important; }
  .c2-col { height:min(76%, 760px) !important; opacity:.8; }
  .c2-col.is-l { left:-17vw; }
  .c2-col.is-r { right:-17vw; }
  .c2-hero-lantern { top:30px; width:clamp(48px, 13vw, 70px) !important; }
  .c2-hero-lantern.is-l { left:2vw; }
  .c2-hero-lantern.is-r { right:2vw; }
}
.c2-hero-body { position:relative; display:grid; gap:22px; justify-items:center; text-align:center; max-width:1120px; margin:0 auto; width:100%; flex:1; align-content:start; padding-bottom:clamp(96px, 22vw, 150px); }
.c2-hero-text { display:grid; gap:8px; justify-items:center; }
.c2-hero-names { font-family:var(--c2-script); font-weight:400; font-size:clamp(56px, 16vw, 112px); line-height:1; color:var(--c2-sage-deep); margin:0; text-wrap:balance; }
.c2-hero-names span { display:inline-block; white-space:nowrap; }
.c2-hero-names i { display:block; font-style:normal; font-size:.48em; color:var(--c2-gold); line-height:1.1; }
.c2-hero-sub { font-family:var(--c2-display); font-style:italic; font-size:clamp(19px, 4.8vw, 24px); color:var(--c2-ink); margin:0; max-width:30ch; }
.c2-hero-photo { width:min(78vw, 360px); aspect-ratio:4/5; }
.c2-hero-photo-wrap { position:relative; }
.c2-hero-branch { position:absolute; width:62% !important; height:auto !important; z-index:3; pointer-events:none; }
.c2-hero-branch.is-tl { left:-22%; top:-9%; transform:rotate(-12deg); }
.c2-hero-branch.is-br { right:-24%; bottom:-6%; transform:rotate(168deg); }
.c2-hero-when { display:grid; gap:4px; justify-items:center; }
.c2-hero-date { font-family:var(--c2-caps); font-size:clamp(14px, 3.8vw, 17px); letter-spacing:.2em; color:var(--c2-ink); text-transform:uppercase; margin:0; font-weight:600; }
.c2-hero-time { font-family:var(--c2-caps); font-size:clamp(13px, 3.4vw, 15px); letter-spacing:.24em; color:var(--c2-gold-ink, #86672c); margin:2px 0 0; font-weight:600; }
.c2-hero-venue { font-size:16px; color:var(--c2-muted); margin:0; }
.c2-hero-actions { display:flex; flex-wrap:wrap; justify-content:center; gap:10px; }
.c2-hero-rail { position:absolute; left:50%; bottom:0; width:max(1000px, 130vw) !important; height:auto !important; transform:translateX(-50%); z-index:1; pointer-events:none; }
.c2-hero-plant { position:absolute; bottom:6px; z-index:2; pointer-events:none; height:auto !important; }
.c2-hero-plant.is-l { left:-6vw; width:clamp(120px, 34vw, 280px) !important; }
.c2-hero-plant.is-r { right:-8vw; width:clamp(110px, 30vw, 240px) !important; }
.c2-scroll-cue { position:absolute; left:50%; bottom:14px; transform:translateX(-50%); z-index:3; color:var(--c2-sage-deep); font-size:12px; letter-spacing:.24em; text-transform:uppercase; font-family:var(--c2-caps); display:grid; justify-items:center; gap:2px; }
.c2-scroll-cue svg { animation:c2-bob 1.8s ease-in-out infinite; }
@keyframes c2-bob { 0%,100% { transform:translateY(0); } 50% { transform:translateY(5px); } }
.c2-hero .c2-in { opacity:0; transform:translateY(22px); }
.c2-root.is-open .c2-hero .c2-in { opacity:1; transform:none; transition:opacity .9s ease, transform .9s cubic-bezier(.2,.7,.2,1); transition-delay:calc(var(--i, 0) * 110ms + 80ms); }
@media (min-width: 700px) {
  .c2-col.is-l { left:-2vw; } .c2-col.is-r { right:-2vw; }
  .c2-hero-photo { width:min(46vw, 400px); }
  /* Wide screens: the ivy is a valance across the top, never a curtain over the names. */
  .c2-hero { padding-top:clamp(170px, 19vw, 230px); }
  .c2-hero-ivy { width:104vw !important; height:clamp(180px, 21vw, 270px) !important; object-fit:cover; object-position:50% 0;
    -webkit-mask-image:linear-gradient(180deg, #000 55%, transparent); mask-image:linear-gradient(180deg, #000 55%, transparent); }
  .c2-hero-lantern { top:clamp(40px, 5vw, 70px); }
}
@media (min-width: 1024px) {
  .c2-hero { padding-top:clamp(176px, 15vw, 236px); }
  .c2-hero-ivy { height:clamp(160px, 14vw, 220px) !important; }
  .c2-hero-body { grid-template-columns:1.1fr .9fr; text-align:left; justify-items:start; align-items:center; column-gap:clamp(40px, 6vw, 96px); padding:0 clamp(60px, 9vw, 150px) clamp(170px, 15vw, 230px); align-content:center; }
  .c2-hero-text { justify-items:start; }
  .c2-hero-when { justify-items:start; }
  .c2-hero-actions { justify-content:flex-start; }
  .c2-hero-photo-wrap { grid-column:2; grid-row:1; justify-self:center; }
  .c2-hero-photo { width:min(28vw, 400px, calc((100svh - 330px) * .8)); min-width:300px; }
  .c2-hero-names { font-size:clamp(84px, 7.6vw, 132px); }
  .c2-col { height:100% !important; }
  .c2-col.is-l { left:0; } .c2-col.is-r { right:0; }
  .c2-hero-lantern.is-l { left:11vw; } .c2-hero-lantern.is-r { right:11vw; }
  .c2-hero-rail { width:104vw !important; height:clamp(150px, 13vw, 210px) !important; object-fit:cover; object-position:50% 100%; }
}

/* ── Scripture ───────────────────────────────────────────────────────── */
.c2-verse { text-align:center; padding:clamp(58px, 11vw, 84px) clamp(24px, 7vw, 80px) clamp(70px, 13vw, 96px); overflow:hidden; }
.c2-verse-text { font-family:var(--c2-display); font-style:italic; font-size:clamp(23px, 5.8vw, 34px); line-height:1.45; color:var(--c2-ink); margin:14px auto 0; max-width:30ch; text-wrap:balance; }
.c2-verse-ref { font-family:var(--c2-caps); font-size:13px; letter-spacing:.26em; color:var(--c2-gold-ink); text-transform:uppercase; margin:18px 0 0; }
.c2-verse-alt { font-size:18px; line-height:1.7; color:var(--c2-muted); margin:18px auto 0; max-width:36ch; }
.c2-verse-branch { position:absolute; width:clamp(120px, 30vw, 200px) !important; height:auto !important; pointer-events:none; opacity:.95; }
.c2-verse-branch.is-tl { left:-38px; top:-34px; transform:rotate(-8deg); }
.c2-verse-branch.is-br { right:-40px; bottom:-40px; transform:rotate(172deg); width:clamp(96px, 22vw, 150px) !important; }
.c2-dove { width:96px; height:36px; color:var(--c2-gold); margin:0 auto; display:block; }

/* ── Invitation ──────────────────────────────────────────────────────── */
.c2-invite { padding:clamp(34px, 7vw, 64px) clamp(22px, 6vw, 64px); text-align:center; }
.c2-invite .c2-p + .c2-p { margin-top:16px; }
.c2-invite-alt { margin-top:26px; padding-top:22px; border-top:1px dashed var(--c2-line); font-size:18px; line-height:1.8; color:var(--c2-ink); white-space:pre-line; }
.c2-sign { font-family:var(--c2-script); font-size:clamp(32px, 8vw, 44px); color:var(--c2-blush-deep); margin:20px 0 0; }

/* ── Couple ──────────────────────────────────────────────────────────── */
.c2-couple { display:grid; gap:28px; }
.c2-person { display:grid; gap:14px; justify-items:center; text-align:center; }
.c2-person .c2-frame { width:min(74vw, 320px); aspect-ratio:4/5; }
.c2-person-role { font-family:var(--c2-caps); font-size:12px; letter-spacing:.3em; color:var(--c2-sage-deep); text-transform:uppercase; margin:0; }
.c2-person-name { font-family:var(--c2-script); font-size:clamp(44px, 11vw, 60px); color:var(--c2-blush-deep); margin:-6px 0 0; line-height:1.1; }
.c2-person-desc { max-width:32ch; }
.c2-amp { font-family:var(--c2-script); font-size:64px; color:var(--c2-gold); text-align:center; line-height:1; }
.c2-initial { width:100%; height:100%; display:grid; place-items:center; font-family:var(--c2-script); font-size:96px; color:var(--c2-blush-deep); background:linear-gradient(160deg, var(--c2-blush-soft), var(--c2-sage-soft)); }
@media (min-width: 760px) {
  .c2-couple { grid-template-columns:1fr auto 1fr; align-items:center; }
  .c2-person .c2-frame { width:min(34vw, 340px); }
}

/* ── Families ────────────────────────────────────────────────────────── */
.c2-fams { display:grid; gap:16px; }
.c2-fam { padding:26px 22px; text-align:center; }
.c2-fam-side { font-family:var(--c2-caps); font-size:12px; letter-spacing:.28em; color:var(--c2-gold-ink); text-transform:uppercase; margin:0 0 10px; }
.c2-fam-names { font-family:var(--c2-display); font-size:22px; font-weight:600; margin:0; line-height:1.35; }
.c2-fam-gp { font-size:15.5px; color:var(--c2-muted); margin:8px 0 0; line-height:1.5; }
.c2-fam-of { text-align:center; font-family:var(--c2-display); font-style:italic; font-size:19px; color:var(--c2-muted); margin:22px auto 0; max-width:40ch; }
@media (min-width: 700px) { .c2-fams { grid-template-columns:1fr 1fr; gap:22px; } }

/* ── Countdown over the lake ─────────────────────────────────────────── */
.c2-date-sec { overflow:hidden; }
.c2-date-art { position:absolute; left:50%; top:0; width:min(1100px, 150vw) !important; height:auto !important; transform:translateX(-50%); opacity:.55; pointer-events:none;
  -webkit-mask-image:radial-gradient(70% 70% at 50% 40%, #000 30%, transparent 75%); mask-image:radial-gradient(70% 70% at 50% 40%, #000 30%, transparent 75%); }
.c2-date-card { padding:clamp(28px, 6vw, 48px) clamp(16px, 5vw, 48px); text-align:center; display:grid; gap:16px; justify-items:center; background:rgba(255,253,249,.88); }
.c2-date-big { font-family:var(--c2-display); font-size:clamp(26px, 6.6vw, 38px); font-weight:600; margin:0; color:var(--c2-ink); line-height:1.2; }
.c2-date-line { font-size:16px; color:var(--c2-muted); margin:0; }
.c2-date-fountain { width:clamp(140px, 36vw, 230px) !important; height:auto !important; margin-top:-6px; }
.c2-root .wk-countdown { max-width:100%; }

/* ── Story ───────────────────────────────────────────────────────────── */
.c2-story { position:relative; display:grid; gap:34px; padding-left:28px; }
.c2-story::before { content:""; position:absolute; left:9px; top:6px; bottom:6px; width:2px; background:linear-gradient(180deg, var(--c2-blush), var(--c2-sage)); border-radius:2px; }
.c2-ch { position:relative; display:grid; gap:14px; }
.c2-ch::before { content:""; position:absolute; left:-25px; top:6px; width:14px; height:14px; border-radius:50%; background:var(--c2-blush-deep); box-shadow:0 0 0 5px var(--c2-blush-soft); }
.c2-ch .c2-frame { aspect-ratio:3/2; width:100%; }
.c2-ch-when { font-family:var(--c2-caps); font-size:12.5px; letter-spacing:.24em; color:var(--c2-gold-ink); margin:0; text-transform:uppercase; }
.c2-ch-t { display:grid; gap:6px; }
@media (min-width: 760px) {
  .c2-story { padding-left:0; gap:56px; }
  .c2-story::before { left:50%; transform:translateX(-1px); }
  .c2-ch { grid-template-columns:1fr 1fr; gap:56px; align-items:center; }
  .c2-ch::before { left:50%; top:50%; transform:translate(-50%, -50%); }
  .c2-ch:nth-child(even) .c2-frame { order:2; }
  .c2-ch:nth-child(odd) .c2-ch-t { text-align:left; }
  .c2-ch:nth-child(even) .c2-ch-t { text-align:right; }
}

/* ── Order of service ────────────────────────────────────────────────── */
.c2-oos { padding:clamp(28px, 6vw, 44px) clamp(20px, 5vw, 44px); }
.c2-oos ol { list-style:none; margin:0; padding:0; display:grid; gap:0; }
.c2-oos li { display:grid; grid-template-columns:64px 1fr; gap:14px; padding:14px 0; border-bottom:1px dashed var(--c2-line); align-items:baseline; }
.c2-oos li:last-child { border-bottom:0; }
.c2-oos-time { font-family:var(--c2-caps); font-size:14px; color:var(--c2-gold-ink); letter-spacing:.06em; }
.c2-oos-title { font-family:var(--c2-display); font-size:21px; font-weight:600; margin:0; }
.c2-oos-note { font-size:15px; color:var(--c2-muted); margin:2px 0 0; }

/* ── Events ──────────────────────────────────────────────────────────── */
.c2-events { display:grid; gap:18px; }
.c2-ev { padding:22px 20px 20px; display:grid; gap:14px; overflow:hidden; }
.c2-ev.is-main { border-color:rgba(194,161,101,.55); background:linear-gradient(180deg, #fffaf2, var(--c2-paper)); }
.c2-ev-top { display:flex; gap:16px; align-items:center; }
.c2-ev-date { flex:none; width:72px; border-radius:16px; background:linear-gradient(160deg, var(--c2-sage-deep), var(--c2-sage)); color:#fff; text-align:center; padding:8px 0 9px; }
.c2-ev-date b { display:block; font-family:var(--c2-display); font-size:32px; line-height:1; font-weight:600; }
.c2-ev-date small { display:block; font-family:var(--c2-caps); font-size:11px; letter-spacing:.2em; margin-top:2px; }
.c2-ev-date.is-tba b { font-size:18px; padding:6px 0; }
.c2-ev-title { font-family:var(--c2-display); font-size:clamp(24px, 6vw, 28px); font-weight:600; margin:0; line-height:1.15; }
.c2-ev-when { font-size:15px; color:var(--c2-muted); margin:3px 0 0; }
.c2-ev-when span { display:block; }
.c2-ev-when span + span { color:var(--c2-ink); font-weight:600; font-size:14.5px; margin-top:1px; }
.c2-ev-row { display:flex; gap:10px; align-items:flex-start; font-size:15.5px; line-height:1.45; margin:0; }
.c2-ev-row svg { flex:none; margin-top:2px; color:var(--c2-sage-deep); }
.c2-ev-row b { font-weight:600; }
.c2-swatch { width:18px; height:18px; border-radius:50%; flex:none; border:1px solid rgba(0,0,0,.12); margin-top:2px; }
.c2-ev-note { font-family:var(--c2-display); font-style:italic; font-size:18px; color:var(--c2-ink); margin:0; }
.c2-ev-actions { display:grid; grid-auto-flow:column; grid-auto-columns:minmax(0, 1fr); gap:6px; padding-top:4px; }
@media (max-width: 420px) { .c2-ev-actions .c2-btn svg { display:none; } }
.c2-ev-actions .c2-btn { padding-left:8px; padding-right:8px; gap:5px; min-width:0; white-space:nowrap; font-size:13.5px; }
.c2-ev-badge { display:inline-block; margin:0 0 6px; font-family:var(--c2-caps); font-size:10.5px; letter-spacing:.22em; color:var(--c2-gold-ink); background:#fff6e4; border:1px solid rgba(194,161,101,.4); border-radius:999px; padding:5px 10px; }
.c2-saveall { display:flex; justify-content:center; margin-top:26px; }
@media (min-width: 700px) { .c2-events { display:flex; flex-wrap:wrap; justify-content:center; gap:22px; } .c2-events > .c2-ev { flex:0 1 calc((100% - 22px) / 2); } }
@media (min-width: 1100px) { .c2-events > .c2-ev { flex-basis:calc((100% - 44px) / 3); } }

/* ── Venue ───────────────────────────────────────────────────────────── */
.c2-venue { display:grid; gap:22px; align-items:center; padding:clamp(22px, 5vw, 40px); overflow:hidden; }
.c2-venue-art { width:min(46vw, 220px) !important; height:auto !important; margin:0 auto; display:block; }
.c2-venue-t { display:grid; gap:10px; text-align:center; justify-items:center; }
.c2-venue-name { font-family:var(--c2-display); font-size:clamp(26px, 6.4vw, 34px); font-weight:600; margin:0; line-height:1.15; }
.c2-venue-note { white-space:pre-line; font-size:15.5px; color:var(--c2-muted); line-height:1.6; margin:4px 0 0; max-width:52ch; }
@media (min-width: 760px) { .c2-venue { grid-template-columns:240px 1fr; } .c2-venue-t { text-align:left; justify-items:start; } }

/* ── Film / live ─────────────────────────────────────────────────────── */
.c2-film { position:relative; aspect-ratio:16/9; border-radius:var(--c2-r); overflow:hidden; box-shadow:var(--c2-shadow); background:#e9e3df; }
.c2-film iframe, .c2-film-poster { position:absolute; inset:0; width:100%; height:100%; border:0; }
.c2-film-poster { padding:0; cursor:pointer; background:#ddd; }
.c2-film-poster img { width:100%; height:100%; object-fit:cover; display:block; }
.c2-film-play { position:absolute; left:50%; top:50%; width:72px; height:72px; margin:-36px 0 0 -36px; border-radius:50%; display:grid; place-items:center; background:rgba(255,255,255,.92); color:var(--c2-blush-deep); box-shadow:0 10px 30px rgba(0,0,0,.25); }
.c2-live { display:grid; justify-items:center; gap:12px; text-align:center; padding:28px 20px; }
.c2-live-dot { width:12px; height:12px; border-radius:50%; background:#c9c9c9; }
.c2-live-dot.is-on { background:#e0445a; box-shadow:0 0 0 6px rgba(224,68,90,.18); animation:c2-pulse 1.4s ease-in-out infinite; }
@keyframes c2-pulse { 50% { transform:scale(1.25); } }

/* ── Gallery ─────────────────────────────────────────────────────────── */
.c2-gallery { max-width:1180px; margin:0 auto; }

/* ── Good to know + contacts ─────────────────────────────────────────── */
.c2-know { list-style:none; margin:0 auto; padding:0; display:grid; gap:14px; max-width:880px; }
.c2-know li { padding:18px 20px; }
.c2-know-h { font-family:var(--c2-caps); font-size:12px; letter-spacing:.24em; color:var(--c2-gold-ink); text-transform:uppercase; margin:0 0 6px; }
.c2-know-t { margin:0; font-size:16px; line-height:1.6; white-space:pre-line; }
@media (min-width: 700px) { .c2-know { grid-template-columns:1fr 1fr; } }
.c2-contacts { list-style:none; margin:20px auto 0; padding:0; display:grid; gap:12px; max-width:880px; }
.c2-contact { display:flex; align-items:center; gap:14px; padding:14px 16px; }
.c2-contact-ini { width:46px; height:46px; border-radius:50%; flex:none; display:grid; place-items:center; background:var(--c2-blush-soft); color:var(--c2-blush-deep); font-family:var(--c2-display); font-weight:600; font-size:22px; }
.c2-contact-t { flex:1; min-width:0; display:grid; gap:1px; }
.c2-contact-t b { font-size:16px; font-weight:600; overflow-wrap:anywhere; }
.c2-contact-t small { font-size:14px; color:var(--c2-muted); }
.c2-contact-a { display:flex; gap:8px; flex:none; }
@media (min-width: 700px) { .c2-contacts { grid-template-columns:1fr 1fr; } }

/* ── RSVP / blessings / shagun / share ──────────────────────────────── */
.c2-rsvp { padding:clamp(20px, 5vw, 36px) clamp(16px, 4vw, 32px); }
.c2-rsvp-intro { text-align:center; font-family:var(--c2-display); font-style:italic; font-size:19px; color:var(--c2-muted); margin:0 auto 20px; max-width:34ch; }
.c2-shagun { padding:26px 22px; text-align:center; display:grid; gap:14px; justify-items:center; }
.c2-shagun code { font-size:15px; background:var(--c2-sage-soft); padding:6px 12px; border-radius:10px; overflow-wrap:anywhere; }
.c2-sharebar { display:flex; flex-wrap:wrap; gap:10px; justify-content:center; }
.c2-qr { flex-basis:100%; max-width:300px; margin:6px auto 0; padding:18px 18px 14px; display:flex; flex-direction:column; align-items:center; gap:10px; text-align:center; animation:c2-qr-in .35s ease both; }
.c2-qr svg { width:184px; height:184px; border-radius:12px; }
.c2-qr p { margin:0; font-size:14px; line-height:1.45; color:var(--wk-muted); }
.c2-qr-wait { width:184px; height:184px; border-radius:12px; background:var(--wk-placeholder); }
@keyframes c2-qr-in { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
.c2-toast { position:fixed; left:50%; bottom:calc(84px + env(safe-area-inset-bottom,0px)); transform:translateX(-50%); z-index:120; background:var(--c2-ink); color:#fff; padding:10px 18px; border-radius:999px; font-size:14px; box-shadow:var(--c2-shadow); }

/* ── Blessings wall (voice notes) ────────────────────────────────────── */
.c2-wish-form { padding:22px 18px; display:grid; gap:12px; }
.c2-input { width:100%; min-height:50px; border-radius:14px; border:1.5px solid var(--c2-line); background:#fff; padding:12px 14px; font:16px/1.4 var(--c2-sans); color:var(--c2-ink); }
.c2-input:focus { outline:none; border-color:var(--c2-sage); box-shadow:0 0 0 4px rgba(127,154,131,.18); }
textarea.c2-input { min-height:110px; resize:vertical; }
.c2-wish-voice { display:flex; gap:10px; flex-wrap:wrap; }
.c2-wish-voice .c2-btn { flex:1 1 140px; }
.c2-wish-rec { display:flex; align-items:center; gap:10px; font-size:14px; color:#b42335; }
.c2-wish-rec i { width:10px; height:10px; border-radius:50%; background:#e0445a; animation:c2-pulse 1s infinite; }
.c2-wish-att { display:flex; align-items:center; justify-content:space-between; gap:10px; padding:8px 12px; border-radius:12px; background:var(--c2-sage-soft); font-size:14px; }
.c2-wishes { columns:1; column-gap:16px; margin-top:22px; }
.c2-wish { break-inside:avoid; padding:20px 18px; margin:0 0 16px; }
.c2-wish p { margin:0; font-family:var(--c2-display); font-size:19px; line-height:1.55; }
.c2-wish audio { width:100%; margin-top:10px; height:40px; }
.c2-wish-by { display:flex; align-items:center; gap:10px; margin-top:14px; font-size:14.5px; font-weight:600; color:var(--c2-sage-deep); }
.c2-wish-by span { width:34px; height:34px; border-radius:50%; display:grid; place-items:center; background:var(--c2-blush-soft); color:var(--c2-blush-deep); font-family:var(--c2-display); font-size:17px; }
.c2-wish-done { text-align:center; padding:28px 20px; }
@media (min-width: 700px) { .c2-wishes { columns:2; } }
@media (min-width: 1100px) { .c2-wishes { columns:3; } }

/* ── Finale ──────────────────────────────────────────────────────────── */
.c2-finale { position:relative; text-align:center; padding:clamp(72px, 12vw, 130px) 16px calc(120px + env(safe-area-inset-bottom,0px)); overflow:hidden; }
.c2-finale-sky { position:absolute; inset:0; width:100% !important; height:100% !important; object-fit:cover; opacity:.75; z-index:-1;
  -webkit-mask-image:linear-gradient(0deg, #000 40%, transparent); mask-image:linear-gradient(0deg, #000 40%, transparent); }
.c2-seal { width:150px; height:150px; margin:0 auto; border-radius:50%; display:grid; place-items:center; position:relative;
  background:radial-gradient(circle at 35% 30%, #fff, var(--c2-blush-soft)); border:1px solid rgba(194,161,101,.55); box-shadow:var(--c2-shadow); }
.c2-seal::before { content:""; position:absolute; inset:9px; border-radius:50%; border:1px dashed rgba(194,161,101,.6); }
.c2-seal b { font-family:var(--c2-script); font-weight:400; font-size:54px; color:var(--c2-sage-deep); line-height:1; }
.c2-finale-line { font-family:var(--c2-display); font-style:italic; font-size:clamp(21px, 5vw, 26px); margin:22px auto 0; max-width:32ch; }
.c2-finale-tag { font-family:var(--c2-caps); letter-spacing:.2em; color:var(--c2-gold-ink); margin:14px 0 0; font-size:14px; overflow-wrap:anywhere; }
.c2-finale-actions { display:flex; flex-wrap:wrap; justify-content:center; gap:10px; margin-top:28px; }
.c2-finale-brand { margin-top:30px; display:inline-flex; align-items:center; gap:8px; color:var(--c2-muted); font-size:14px; text-decoration:none; min-height:44px; }
.c2-finale-brand img { width:26px; height:26px; }
.c2-replay { background:none; border:0; color:var(--c2-sage-deep); text-decoration:underline; text-underline-offset:3px; font:500 14px var(--c2-sans); min-height:44px; padding:8px 12px; cursor:pointer; }

/* Second language toggle (only when the couple adds one). */
.c2-lang { position:fixed; top:calc(12px + env(safe-area-inset-top,0px)); left:12px; z-index:90; display:flex; border-radius:999px; background:rgba(255,253,249,.92); border:1px solid var(--c2-line); box-shadow:0 6px 18px -10px rgba(0,0,0,.3); overflow:hidden; }
.c2-lang button { min-width:48px; min-height:44px; border:0; background:none; font:600 14px var(--c2-sans); color:var(--c2-muted); cursor:pointer; padding:0 12px; }
.c2-lang button[aria-pressed="true"] { background:var(--c2-sage-deep); color:#fff; }

/* The compact music icon (kit DayMusicProvider): a 44px pill, always findable.
   Guests: top-right. The template page: beside the back button. The editor on
   phones: the left slot of the save bar (the bar makes room only while it shows);
   on desktop: the preview's top-left. The kit positions it inline, hence !important. */
.vm-icon { width:44px !important; height:44px !important; top:calc(12px + env(safe-area-inset-top,0px)) !important; bottom:auto !important;
  left:auto !important; right:max(12px, env(safe-area-inset-right,0px)) !important; transform:none !important;
  box-shadow:0 8px 20px -10px rgba(52,80,59,.55), 0 0 0 1px rgba(194,161,101,.6) !important; }
body .vm-icon-btn { color:#4c6852; background:radial-gradient(circle at 50% 38%, #fffdf9, #eef2ea 78%); }
body .vm-icon-btn:focus-visible { outline-color:#b4677a; }
body .vm-icon-ring { background:conic-gradient(from 0deg, #c2a165, transparent 30%, #ecc3ca 52%, transparent 78%, #c2a165); }
body .vm-icon-eq i { background:#4c6852; }
body:has(.c2-shell) .vm-icon { top:calc(10px + env(safe-area-inset-top,0px)) !important; right:auto !important; left:62px !important; }
@media (max-width: 1023px) {
  body:has(.c2e:not(.is-previewing)) .vm-icon { top:auto !important; bottom:calc(10px + env(safe-area-inset-bottom,0px)) !important; left:12px !important; z-index:260 !important; }
  body:has(.c2e:not(.is-previewing)):has(.vm-icon:not([style*="visibility: hidden"])) .c2e-bar { padding-left:66px; }
}
@media (min-width: 1024px) {
  body:has(.c2e) .vm-icon { left:calc(min(560px, 44vw) + 14px) !important; }
}

/* Kit pieces on this palette */
.c2-root .wk-btn { border-radius:999px; min-height:48px; }

@media (prefers-reduced-motion: reduce) {
  .c2-root *, .c2-open * { animation:none !important; }
  .c2-sash, .c2-stage, .c2-garden-bg, .c2-rays { transition:none !important; }
  .c2-open.is-opening .c2-sash.is-l, .c2-open.is-opening .c2-sash.is-r { transform:none; }
  .c2-root.is-open .c2-hero .c2-in { transition:opacity .3s ease !important; transform:none !important; }
}
`;
