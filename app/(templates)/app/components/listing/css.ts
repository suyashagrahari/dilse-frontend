// ─── The Listing — stylesheet ────────────────────────────────────────────────
//
// One scoped sheet (every class starts with `al-`) because the three layouts —
// phone, tablet, desktop — are media queries, and inline styles cannot do media
// queries. Only transform and opacity are ever animated.
//
//   phone    < 740px   nav bar + bottom tab bar, one column, 20px gutter
//   tablet   ≥ 740px   floating pill tabs at the top, 40px gutter, wider rails
//   desktop  ≥ 1180px  sidebar navigation, 1040px content column, grids

export const LISTING_CSS = `
.al-root {
  --al-accent: #FF2D55; --al-accent2: #FF6F91; --al-ink: #000; --al-soft: #8A8A8E; --al-faint: #C7C7CC;
  --al-card: #F2F2F7; --al-edge: #E3E3E8; --al-g: 20px; --al-top: 0px;
  position: relative; min-height: 100dvh; background: #fff; color: var(--al-ink);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased; -webkit-tap-highlight-color: transparent; overflow-x: clip;
}
:where(.al-root) *, :where(.al-root) *::before, :where(.al-root) *::after { box-sizing: border-box; }
:where(.al-root) button { font: inherit; color: inherit; background: none; border: 0; padding: 0; cursor: pointer; touch-action: manipulation; }
.al-main { min-width: 0; padding-bottom: calc(76px + env(safe-area-inset-bottom, 0px)); }
.al-content { width: 100%; max-width: 1040px; margin: 0 auto; }
.al-link { color: var(--al-accent); }
.al-press { transition: transform .18s cubic-bezier(.3,.7,.4,1), opacity .18s; }
.al-press:active { transform: scale(.96); opacity: .8; }

/* ── Nav bar (phone/tablet/desktop toolbar) ─────────────────────────────── */
.al-nav { position: sticky; top: var(--al-top); z-index: 40; height: 48px; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center;
  padding: 0 calc(var(--al-g) - 8px); background: rgba(255,255,255,0); transition: background .25s, box-shadow .25s; }
.al-nav.is-solid { background: rgba(255,255,255,.94); box-shadow: 0 .5px 0 rgba(0,0,0,.14); }
.al-back { display: inline-flex; align-items: center; gap: 1px; height: 44px; padding: 0 8px; color: var(--al-accent); font-size: 17px; letter-spacing: -.2px; justify-self: start; }
.al-nav-mid { display: flex; align-items: center; justify-content: center; opacity: 0; transform: translateY(8px) scale(.9); transition: opacity .25s, transform .3s cubic-bezier(.2,1,.3,1); pointer-events: none; }
.al-nav.is-solid .al-nav-mid { opacity: 1; transform: none; pointer-events: auto; }
.al-nav-mid .al-icon { width: 30px; height: 30px; border-radius: 7px; }
.al-nav-right { justify-self: end; position: relative; display: flex; align-items: center; justify-content: flex-end; padding-right: 8px; min-height: 44px; }
.al-nav-get { opacity: 0; transform: translateY(8px); transition: opacity .25s, transform .3s cubic-bezier(.2,1,.3,1); pointer-events: none; }
.al-nav.is-solid .al-nav-get { opacity: 1; transform: none; pointer-events: auto; }
.al-brand { position: absolute; right: 8px; top: 50%; display: inline-flex; align-items: center; gap: 6px; height: 30px; padding: 0 11px 0 5px; border-radius: 99px; background: #F2F2F7;
  color: #1c1c1e; text-decoration: none; font-size: 12px; font-weight: 700; white-space: nowrap; transform: translateY(-50%); transition: opacity .2s, transform .25s; }
.al-brand img { width: 20px; height: 20px; border-radius: 50%; }
.al-brand small { font-weight: 500; color: var(--al-soft); font-size: 11px; }
.al-nav.is-solid .al-brand { opacity: 0; transform: translateY(-50%) scale(.9); pointer-events: none; }
.al-foot a { color: var(--al-accent); text-decoration: none; font-weight: 600; }
.al-pilltabs { display: none; }

/* ── Header ─────────────────────────────────────────────────────────────── */
.al-head { display: flex; gap: 16px; padding: 6px var(--al-g) 20px; }
.al-icon { position: relative; flex: none; width: 118px; height: 118px; border-radius: 26.5%; overflow: hidden; background: var(--al-card);
  box-shadow: 0 0 0 .5px rgba(0,0,0,.12); isolation: isolate; }
.al-icon img, .al-shot-screen img { position: absolute; inset: 0; z-index: 1; display: block; }
.al-icon-fallback { position: absolute; inset: 0; display: grid; place-items: center; color: #fff; font-weight: 700;
  background: radial-gradient(120% 120% at 20% 10%, #FF8FAB 0%, #FF2D55 55%, #C2185B 100%); }
.al-icon.is-boop { animation: alBoop .5s cubic-bezier(.3,1.6,.5,1); }
.al-head-body { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.al-name { margin: 2px 0 0; font-size: 22px; line-height: 1.18; font-weight: 700; letter-spacing: -.45px; overflow-wrap: anywhere; }
.al-name .al-age { display: none; }
.al-sub { margin: 3px 0 0; font-size: 15px; line-height: 1.3; color: var(--al-soft); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.al-dev { display: none; }
.al-head-rank { display: none; }
.al-head-actions { margin-top: auto; padding-top: 12px; display: flex; align-items: center; gap: 10px; }
.al-iap-note { font-size: 10px; line-height: 1.15; color: var(--al-soft); }
.al-share { margin-left: auto; width: 36px; height: 36px; display: grid; place-items: center; color: var(--al-accent); border-radius: 50%; }

/* ── GET ────────────────────────────────────────────────────────────────── */
.al-get { position: relative; display: inline-grid; place-items: center; height: 30px; min-width: 76px; padding: 0 16px; border-radius: 999px;
  background: var(--al-accent); color: #fff; font-size: 15px; font-weight: 700; letter-spacing: .1px;
  transition: min-width .32s cubic-bezier(.3,.8,.3,1), padding .32s cubic-bezier(.3,.8,.3,1), background-color .25s, transform .15s; }
.al-get:active { transform: scale(.92); }
.al-get.is-soft { background: #EEEEF0; color: var(--al-accent); }
.al-get[data-s="wait"], .al-get[data-s="load"] { min-width: 30px; padding: 0; background: transparent; }
.al-get-label { transition: opacity .15s; white-space: nowrap; }
.al-get[data-s="wait"] .al-get-label, .al-get[data-s="load"] .al-get-label { opacity: 0; position: absolute; }
.al-get-ring { position: absolute; inset: 0; margin: auto; width: 30px; height: 30px; opacity: 0; transition: opacity .2s; }
.al-get[data-s="wait"] .al-get-ring, .al-get[data-s="load"] .al-get-ring { opacity: 1; }
.al-get[data-s="wait"] .al-ring-spin { transform-origin: 15px 15px; animation: alSpin .8s linear infinite; }
.al-get[data-s="load"] .al-ring-spin { display: none; }
.al-ring-prog { transform: rotate(-90deg); transform-origin: 15px 15px; stroke-dasharray: 81.7; stroke-dashoffset: 81.7; }
.al-get[data-s="load"] .al-ring-prog { animation: alFill 1.9s cubic-bezier(.45,.05,.4,1) forwards; }
.al-get[data-s="wait"] .al-ring-stop { opacity: 0; }
.al-get-sm { height: 28px; min-width: 64px; font-size: 14px; padding: 0 14px; }
.al-get-sm[data-s="wait"], .al-get-sm[data-s="load"] { min-width: 28px; }

/* ── Sections ───────────────────────────────────────────────────────────── */
.al-sec { position: relative; padding: 18px 0 22px; }
.al-sec::before { content: ""; position: absolute; top: 0; left: var(--al-g); right: var(--al-g); height: .5px; background: rgba(60,60,67,.29); }
.al-sec.no-rule::before { display: none; }
.al-sec-h { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; padding: 0 var(--al-g); margin: 0 0 12px; }
.al-sec-h h2 { margin: 0; font-size: 22px; line-height: 1.2; font-weight: 700; letter-spacing: -.4px; }
.al-sec-h button, .al-sec-h a { font-size: 17px; color: var(--al-accent); white-space: nowrap; }
.al-pad { padding: 0 var(--al-g); }
.al-body { font-size: 15px; line-height: 1.38; letter-spacing: -.1px; }
.al-muted { color: var(--al-soft); }

/* ── Facts strip ────────────────────────────────────────────────────────── */
.al-facts { position: relative; display: flex; overflow-x: auto; scroll-snap-type: x proximity; scrollbar-width: none; padding: 12px 0 14px; margin: 0; }
.al-facts::-webkit-scrollbar, .al-rail::-webkit-scrollbar { display: none; }
.al-facts-wrap { position: relative; }
.al-facts-wrap::before { content: ""; position: absolute; top: 0; left: var(--al-g); right: var(--al-g); height: .5px; background: rgba(60,60,67,.29); }
.al-fact { flex: none; min-width: 108px; max-width: 150px; padding: 0 12px; text-align: center; display: flex; flex-direction: column; align-items: center; scroll-snap-align: start; position: relative; }
.al-fact:first-child { margin-left: calc(var(--al-g) - 12px); }
.al-fact:last-child { margin-right: calc(var(--al-g) - 12px); }
.al-fact + .al-fact::before { content: ""; position: absolute; left: 0; top: 10px; bottom: 10px; width: .5px; background: rgba(60,60,67,.29); }
.al-fact-k { font-size: 11px; line-height: 13px; font-weight: 600; letter-spacing: .6px; text-transform: uppercase; color: var(--al-soft); white-space: nowrap; }
.al-fact-v { margin-top: 5px; height: 26px; display: flex; align-items: center; font-size: 21px; font-weight: 700; color: var(--al-soft); letter-spacing: -.3px; white-space: nowrap; }
.al-fact-s { margin-top: 4px; font-size: 12px; line-height: 14px; color: var(--al-soft); max-width: 128px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.al-laurel { display: flex; align-items: center; gap: 2px; color: var(--al-soft); }
.al-laurel b { font-size: 12px; line-height: 13px; font-weight: 700; text-align: center; max-width: 76px; }

/* ── Rails (horizontal carousels) ───────────────────────────────────────── */
.al-rail-wrap { position: relative; }
.al-rail { display: flex; gap: 12px; overflow-x: auto; scroll-snap-type: x mandatory; scroll-padding-inline: var(--al-g); padding: 2px var(--al-g) 6px; scrollbar-width: none; overscroll-behavior-x: contain; }
.al-rail > * { scroll-snap-align: start; flex: none; }
.al-arrow { position: absolute; top: 50%; z-index: 3; width: 40px; height: 40px; margin-top: -20px; border-radius: 50%; display: none; place-items: center;
  background: rgba(255,255,255,.96); color: #1c1c1e; box-shadow: 0 2px 10px rgba(0,0,0,.18), 0 0 0 .5px rgba(0,0,0,.08); opacity: 0; transition: opacity .2s, transform .2s; }
.al-arrow.l { left: 8px; } .al-arrow.r { right: 8px; }
.al-arrow:disabled { opacity: 0 !important; pointer-events: none; }
@media (hover: hover) and (min-width: 740px) {
  .al-arrow { display: grid; }
  .al-rail-wrap:hover .al-arrow { opacity: 1; }
  .al-arrow:hover { transform: scale(1.06); }
}

/* ── Screenshots ────────────────────────────────────────────────────────── */
.al-shot { position: relative; width: 232px; aspect-ratio: 392 / 848; border-radius: 22px; overflow: hidden; container-type: inline-size;
  box-shadow: 0 0 0 .5px rgba(0,0,0,.1); }
.al-shot-cap { position: absolute; left: 9%; right: 9%; top: 7.5%; font-size: 9.4cqw; line-height: 1.08; font-weight: 800; letter-spacing: -.03em; text-align: center; }
.al-shot-sub { position: absolute; left: 10%; right: 10%; top: 31.5%; font-size: 4.6cqw; font-weight: 600; text-align: center; opacity: .62; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.al-shot-phone { position: absolute; left: 8%; right: 8%; top: 39%; bottom: -12%; border-radius: 13cqw; background: #141416; padding: 2.6cqw;
  box-shadow: 0 18px 30px -12px rgba(0,0,0,.35), inset 0 0 0 1.2cqw #2a2a2e; }
.al-shot-screen { position: relative; width: 100%; height: 100%; border-radius: 10.5cqw; overflow: hidden; background: #ddd; }
.al-island { position: absolute; top: 3.2cqw; left: 50%; width: 27cqw; height: 7.6cqw; margin-left: -13.5cqw; border-radius: 99px; background: #000; z-index: 2; }
.al-status { position: absolute; top: 3.4cqw; left: 8cqw; right: 8cqw; z-index: 2; display: flex; justify-content: space-between; align-items: center; color: #fff;
  font-size: 4.4cqw; font-weight: 700; text-shadow: 0 1px 4px rgba(0,0,0,.35); }
.al-status i { display: inline-flex; gap: 1.4cqw; align-items: center; font-style: normal; }
.al-sticker { position: absolute; z-index: 3; right: 3%; top: 35%; padding: 1.6cqw 3.4cqw; border-radius: 99px; background: #fff; color: var(--al-accent); font-size: 4.2cqw; font-weight: 800;
  transform: rotate(8deg); box-shadow: 0 6px 14px -6px rgba(0,0,0,.35); animation: alWobble 3.2s ease-in-out infinite; }
.al-shot-empty { position: absolute; inset: 0; display: grid; place-items: center; align-content: center; gap: 2cqw; color: rgba(0,0,0,.45); font-size: 4.5cqw; font-weight: 700;
  background: repeating-linear-gradient(135deg, rgba(255,255,255,.5) 0 8px, rgba(255,255,255,.2) 8px 16px); }
.al-devices { display: flex; align-items: center; gap: 8px; margin-top: 12px; color: var(--al-soft); font-size: 13px; font-weight: 600; }

/* ── Skeleton shimmer ───────────────────────────────────────────────────── */
.al-skel { position: absolute; inset: 0; background: linear-gradient(100deg, #ececf0 20%, #f7f7f9 40%, #ececf0 60%); background-size: 200% 100%; animation: alShimmer 1.2s linear infinite; z-index: 2; transition: opacity .35s; }
.al-skel.is-done { opacity: 0; pointer-events: none; animation: none; }

/* ── Clamp + more ───────────────────────────────────────────────────────── */
.al-clamp { position: relative; }
.al-clamp-text { display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden; }
.al-clamp-text p { margin: 0 0 1em; } .al-clamp-text p:last-child { margin: 0; }
.al-more { position: absolute; right: 0; bottom: 0; padding-left: 36px; color: var(--al-accent); font-size: 15px; line-height: 1.38;
  background: linear-gradient(90deg, rgba(255,255,255,0), #fff 34px); }
.al-card .al-more { background: linear-gradient(90deg, rgba(242,242,247,0), var(--al-card) 34px); }

/* ── What's new ─────────────────────────────────────────────────────────── */
.al-ver-row { display: flex; justify-content: space-between; gap: 12px; font-size: 15px; color: var(--al-soft); margin-bottom: 8px; }

/* ── Developer row ──────────────────────────────────────────────────────── */
.al-devrow { display: flex; align-items: center; gap: 12px; margin-top: 14px; padding: 4px 0; text-align: left; width: 100%; }
.al-devrow b { display: block; font-size: 17px; font-weight: 400; color: var(--al-accent); line-height: 1.25; }
.al-devrow small { display: block; font-size: 13px; color: var(--al-soft); margin-top: 1px; }

/* ── Ratings ────────────────────────────────────────────────────────────── */
.al-rate { display: flex; align-items: flex-end; gap: 20px; padding: 0 var(--al-g); }
.al-rate-big { flex: none; text-align: center; }
.al-rate-big b { display: block; font-size: 60px; line-height: .9; font-weight: 700; letter-spacing: -2px; color: #3a3a3c; }
.al-rate-big span { display: block; margin-top: 6px; font-size: 15px; font-weight: 700; color: var(--al-soft); }
.al-hist { flex: 1; min-width: 0; }
.al-hist-row { display: flex; align-items: center; gap: 8px; height: 12px; }
.al-hist-stars { width: 46px; display: flex; justify-content: flex-end; }
.al-hist-bar { flex: 1; height: 3px; border-radius: 3px; background: #E5E5EA; overflow: hidden; }
.al-hist-bar i { display: block; height: 100%; border-radius: 3px; background: #8A8A8E; transform-origin: left; transform: scaleX(var(--w)); transition: transform .9s cubic-bezier(.2,.8,.2,1); }
.al-hist-count { margin-top: 6px; text-align: right; font-size: 15px; color: var(--al-soft); }
.al-card { background: var(--al-card); border-radius: 12px; }
.al-rev { width: min(330px, calc(100vw - 56px)); height: 208px; padding: 14px 16px 16px; text-align: left; display: flex; flex-direction: column; }
.al-rev-top { display: flex; justify-content: space-between; gap: 10px; }
.al-rev-t { font-size: 15px; font-weight: 700; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.al-rev-meta { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin: 3px 0 8px; font-size: 15px; color: var(--al-soft); }
.al-rev-meta span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.al-rev .al-clamp { flex: 1; }
.al-tap { display: flex; align-items: center; justify-content: space-between; padding: 18px var(--al-g) 4px; font-size: 15px; color: var(--al-soft); }
.al-tapstars { display: flex; gap: 6px; }
.al-tapstars button { width: 32px; height: 32px; display: grid; place-items: center; color: var(--al-accent); }
.al-tapstars button.is-on svg { animation: alPop .35s cubic-bezier(.3,1.8,.5,1); }
.al-actions { display: flex; gap: 12px; padding: 10px var(--al-g) 0; }
.al-action { flex: 1; display: flex; align-items: center; gap: 8px; height: 44px; padding: 0 14px; border-radius: 12px; background: var(--al-card); color: var(--al-accent); font-size: 16px; }

/* ── Privacy ────────────────────────────────────────────────────────────── */
.al-priv { display: grid; gap: 12px; padding: 12px var(--al-g) 0; }
.al-privcard { padding: 20px 18px 18px; text-align: center; }
.al-privcard > svg { color: var(--al-accent); }
.al-privcard h3 { margin: 8px 0 4px; font-size: 17px; font-weight: 700; letter-spacing: -.2px; }
.al-privcard p { margin: 0 auto; max-width: 300px; font-size: 13px; line-height: 1.35; color: var(--al-soft); }
.al-privlist { list-style: none; margin: 14px 0 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(128px, 1fr)); gap: 10px 14px; text-align: left; }
.al-privlist li { display: flex; align-items: center; gap: 8px; font-size: 14px; line-height: 1.25; color: #3a3a3c; }
.al-privlist svg { flex: none; color: var(--al-soft); }

/* ── Supports / information rows ────────────────────────────────────────── */
.al-supp { display: flex; gap: 14px; align-items: flex-start; padding: 6px var(--al-g) 10px; }
.al-supp-ic { flex: none; width: 44px; height: 44px; border-radius: 11px; display: grid; place-items: center; color: #fff; background: linear-gradient(135deg, var(--al-accent2), var(--al-accent)); }
.al-supp b { display: block; font-size: 16px; font-weight: 600; } .al-supp span { display: block; font-size: 14px; line-height: 1.35; color: var(--al-soft); margin-top: 2px; }
.al-info { padding: 0 var(--al-g); display: grid; }
.al-irow { border-bottom: .5px solid rgba(60,60,67,.29); }
.al-irow-btn { width: 100%; min-height: 46px; display: flex; align-items: center; justify-content: space-between; gap: 14px; text-align: left; padding: 11px 0; }
.al-irow-k { flex: none; font-size: 15px; color: var(--al-soft); }
.al-irow-v { min-width: 0; font-size: 15px; text-align: right; display: flex; align-items: center; gap: 6px; }
.al-irow-v > span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.al-irow-v svg { flex: none; color: var(--al-soft); transition: transform .25s; }
.al-irow.is-open .al-irow-v svg { transform: rotate(180deg); }
.al-irow-more { overflow: hidden; display: grid; grid-template-rows: 0fr; transition: grid-template-rows .3s cubic-bezier(.3,.8,.3,1); }
.al-irow.is-open .al-irow-more { grid-template-rows: 1fr; }
.al-irow-more > div { min-height: 0; }
.al-irow-more .al-inner { padding: 0 0 12px; font-size: 15px; line-height: 1.4; }
.al-iap { display: flex; justify-content: space-between; gap: 14px; padding: 7px 0; font-size: 15px; }
.al-iap span:last-child { color: var(--al-soft); white-space: nowrap; }
.al-linkrow { width: 100%; min-height: 46px; display: flex; align-items: center; justify-content: space-between; color: var(--al-accent); font-size: 17px; border-bottom: .5px solid rgba(60,60,67,.29); }
.al-linkrow:last-child { border-bottom: 0; }

/* ── You might also like ───────────────────────────────────────────────── */
.al-ymal-col { width: min(330px, calc(100vw - 56px)); display: grid; }
.al-lockup { display: flex; align-items: center; gap: 12px; padding: 8px 0; }
.al-lockup + .al-lockup .al-lockup-txt { border-top: .5px solid rgba(60,60,67,.29); }
.al-lockup-ic { flex: none; width: 64px; height: 64px; border-radius: 26.5%; display: grid; place-items: center; color: #fff; font-weight: 800; font-size: 26px; box-shadow: 0 0 0 .5px rgba(0,0,0,.08); overflow: hidden; }
.al-lockup-txt { flex: 1; min-width: 0; align-self: stretch; display: flex; align-items: center; gap: 10px; padding: 8px 0; }
.al-lockup-txt div { flex: 1; min-width: 0; }
.al-lockup-txt b { display: block; font-size: 16px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.al-lockup-txt small { display: block; font-size: 13px; color: var(--al-soft); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 1px; }
.al-foot { padding: 20px var(--al-g) 8px; font-size: 12px; color: var(--al-soft); text-align: center; line-height: 1.5; }

/* ── Tab bar (phone) ───────────────────────────────────────────────────── */
.al-tabbar { position: fixed; left: 0; right: 0; bottom: 0; z-index: 50; display: flex; justify-content: space-around; padding: 6px 4px calc(4px + env(safe-area-inset-bottom, 0px));
  background: rgba(250,250,250,.93); -webkit-backdrop-filter: saturate(180%) blur(20px); backdrop-filter: saturate(180%) blur(20px); box-shadow: 0 -.5px 0 rgba(0,0,0,.2); }
.al-tab { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 1px; color: #999; font-size: 10px; font-weight: 500; letter-spacing: .1px; height: 44px; justify-content: center; }
.al-tab.is-on { color: var(--al-accent); }
.al-tab:active svg { transform: scale(.86); } .al-tab svg { transition: transform .15s; }

/* ── Sidebar (desktop) ─────────────────────────────────────────────────── */
.al-side { display: none; }

/* ── Toast, bursts ─────────────────────────────────────────────────────── */
.al-toast { position: fixed; left: 0; right: 0; margin: 0 auto; width: max-content; top: calc(10px + var(--al-top) + env(safe-area-inset-top, 0px)); z-index: 400; display: flex; align-items: center; gap: 10px;
  max-width: min(92vw, 420px); padding: 10px 18px 10px 12px; border-radius: 999px; background: #0b0b0c; color: #fff; font-size: 14px; font-weight: 600; line-height: 1.3;
  box-shadow: 0 12px 30px -8px rgba(0,0,0,.45); animation: alIsland .45s cubic-bezier(.2,1.3,.4,1) both; }
.al-toast-ic { flex: none; width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; background: var(--al-accent); }
.al-burst { position: fixed; z-index: 450; pointer-events: none; width: 0; height: 0; }
.al-burst span { position: absolute; left: -9px; top: -9px; font-size: 18px; color: var(--al-accent); animation: alHeart 1.15s cubic-bezier(.2,.7,.3,1) forwards; }

/* ── Sheets ────────────────────────────────────────────────────────────── */
.al-scrim { position: fixed; inset: 0; z-index: 300; background: rgba(0,0,0,.4); animation: alFade .25s ease both; }
.al-sheet { position: fixed; z-index: 301; left: 0; right: 0; bottom: 0; max-height: 90dvh; overflow-y: auto; background: #fff; border-radius: 14px 14px 0 0;
  padding: 8px var(--al-g) calc(28px + env(safe-area-inset-bottom, 0px)); animation: alUp .38s cubic-bezier(.2,1,.3,1) both; overscroll-behavior: contain; }
.al-grab { width: 36px; height: 5px; border-radius: 3px; background: #D1D1D6; margin: 0 auto 10px; }
.al-sheet-bar { display: flex; align-items: center; justify-content: space-between; min-height: 44px; margin-bottom: 6px; }
.al-sheet-bar h3 { margin: 0; font-size: 17px; font-weight: 600; }
.al-sheet-bar button { color: var(--al-accent); font-size: 17px; font-weight: 600; min-height: 44px; padding: 0 4px; }
.al-page { position: fixed; inset: 0; z-index: 301; background: #fff; overflow-y: auto; animation: alPush .38s cubic-bezier(.2,1,.3,1) both; overscroll-behavior: contain; }
.al-page .al-nav { top: 0; background: rgba(255,255,255,.94); box-shadow: 0 .5px 0 rgba(0,0,0,.14); }
.al-page-title { font-size: 17px; font-weight: 600; }
.al-vh { padding: 6px var(--al-g) calc(40px + env(safe-area-inset-bottom, 0px)); max-width: 760px; margin: 0 auto; }
.al-vh-item { padding: 14px 0 16px; border-bottom: .5px solid rgba(60,60,67,.29); }
.al-vh-item:last-child { border-bottom: 0; }
.al-vh-top { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; margin-bottom: 6px; }
.al-vh-top b { font-size: 17px; font-weight: 600; }
.al-vh-top span { font-size: 15px; color: var(--al-soft); }
.al-vh-first { display: inline-block; margin-left: 8px; padding: 2px 8px; border-radius: 99px; background: #FFE5EC; color: var(--al-accent); font-size: 11px; font-weight: 700; vertical-align: 2px; }
.al-sheet .al-rev { width: 100%; height: auto; min-height: 140px; background: var(--al-card); }
.al-devresp { margin-top: 16px; padding: 14px 16px; border-radius: 12px; background: var(--al-card); }
.al-devresp-h { display: flex; justify-content: space-between; font-size: 15px; font-weight: 600; margin-bottom: 6px; }
.al-devresp-h span { font-weight: 400; color: var(--al-soft); }

/* ── Tablet ────────────────────────────────────────────────────────────── */
@media (min-width: 740px) {
  .al-root { --al-g: 40px; }
  .al-main { padding-bottom: 56px; }
  .al-tabbar { display: none; }
  .al-nav { height: 60px; }
  .al-pilltabs { display: flex; gap: 2px; padding: 4px; border-radius: 999px; background: rgba(242,242,247,.96); box-shadow: 0 0 0 .5px rgba(0,0,0,.06), 0 4px 16px -8px rgba(0,0,0,.2); }
  .al-pilltabs button { height: 34px; padding: 0 16px; border-radius: 999px; font-size: 14px; font-weight: 600; color: #3a3a3c; }
  .al-pilltabs button.is-on { background: #fff; color: var(--al-accent); box-shadow: 0 1px 4px rgba(0,0,0,.12); }
  .al-nav .al-nav-mid { display: none; }
  .al-nav-center { grid-column: 2; }
  .al-head { gap: 26px; padding-top: 12px; padding-bottom: 26px; }
  .al-icon { width: 156px; height: 156px; }
  .al-name { font-size: 30px; letter-spacing: -.6px; }
  .al-sub { font-size: 18px; }
  .al-dev { display: block; margin-top: 6px; font-size: 15px; color: var(--al-accent); text-align: left; }
  .al-shot { width: 280px; border-radius: 26px; }
  .al-rev { width: 340px; }
  .al-priv { grid-template-columns: 1fr 1fr; }
  .al-info { grid-template-columns: 1fr 1fr; column-gap: 40px; }
  .al-ymal-col { width: 340px; }
  .al-fact { flex: 1 0 auto; }
  .al-sheet { left: 50%; right: auto; bottom: auto; top: 50%; width: min(620px, 92vw); max-height: 80dvh; border-radius: 16px; padding: 14px 28px 28px;
    transform: translate(-50%, -50%); animation: alZoom .3s cubic-bezier(.2,1,.3,1) both; }
  .al-grab { display: none; }
  .al-page { left: 50%; top: 50%; right: auto; bottom: auto; width: min(760px, 92vw); height: min(760px, 86dvh); border-radius: 16px; transform: translate(-50%, -50%); animation: alZoom .3s cubic-bezier(.2,1,.3,1) both; box-shadow: 0 30px 80px -20px rgba(0,0,0,.4); }
}

/* ── Desktop ───────────────────────────────────────────────────────────── */
@media (min-width: 1180px) {
  .al-root { --al-g: 56px; display: grid; grid-template-columns: 252px minmax(0, 1fr); }
  .al-side { display: flex; flex-direction: column; position: sticky; top: var(--al-top); height: calc(100dvh - var(--al-top)); padding: 18px 14px 16px;
    background: #F6F6F8; border-right: .5px solid rgba(0,0,0,.1); }
  .al-side-search { display: flex; align-items: center; gap: 8px; height: 34px; padding: 0 10px; border-radius: 9px; background: rgba(118,118,128,.12); color: var(--al-soft); font-size: 14px; width: 100%; }
  .al-side nav { margin-top: 14px; display: grid; gap: 2px; }
  .al-side-item { display: flex; align-items: center; gap: 10px; height: 36px; padding: 0 10px; border-radius: 9px; font-size: 14.5px; font-weight: 500; color: #1c1c1e; text-align: left; width: 100%; transition: background .15s; }
  .al-side-item:hover { background: rgba(0,0,0,.05); }
  .al-side-item svg { color: var(--al-accent); }
  .al-side-item.is-on { background: rgba(255,45,85,.12); }
  .al-side-item em { margin-left: auto; min-width: 20px; height: 20px; border-radius: 99px; background: var(--al-accent); color: #fff; font-size: 11px; font-style: normal; font-weight: 700; display: grid; place-items: center; padding: 0 6px; }
  .al-side-cap { margin: 18px 10px 6px; font-size: 11px; font-weight: 700; color: var(--al-soft); letter-spacing: .4px; text-transform: uppercase; }
  .al-side-me { margin-top: auto; display: flex; align-items: center; gap: 10px; padding: 10px; border-radius: 12px; }
  .al-side-me i { width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; font-style: normal; font-weight: 700; color: #fff; background: linear-gradient(135deg, var(--al-accent2), var(--al-accent)); }
  .al-side-me b { display: block; font-size: 14px; } .al-side-me small { display: block; font-size: 12px; color: var(--al-soft); }
  .al-pilltabs { display: none; }
  .al-nav { height: 56px; }
  .al-nav .al-nav-mid { display: flex; }
  .al-icon { width: 176px; height: 176px; }
  .al-head { gap: 32px; padding-top: 8px; }
  .al-name { font-size: 34px; letter-spacing: -.8px; }
  .al-name .al-age { display: inline-block; vertical-align: 6px; margin-left: 10px; padding: 1px 6px; border-radius: 5px; background: var(--al-card); color: var(--al-soft); font-size: 14px; font-weight: 600; letter-spacing: 0; }
  .al-sub { font-size: 20px; }
  .al-head-rank { display: flex; align-items: center; gap: 8px; margin-top: 8px; font-size: 14px; color: var(--al-soft); }
  .al-get { height: 34px; min-width: 88px; font-size: 16px; }
  .al-get[data-s="wait"], .al-get[data-s="load"] { min-width: 34px; }
  .al-facts { overflow: visible; }
  .al-fact { flex: 1 1 0; max-width: none; }
  .al-shot { width: 300px; }
  .al-rail { gap: 20px; }
  .al-rev { width: 360px; height: 216px; }
  .al-priv { grid-template-columns: 1fr 1fr; gap: 20px; }
  .al-info { grid-template-columns: repeat(3, 1fr); }
  .al-sec { padding: 26px 0 30px; }
  .al-sec-h h2 { font-size: 24px; }
}

@keyframes alSpin { to { transform: rotate(360deg); } }
@keyframes alFill { to { stroke-dashoffset: 0; } }
@keyframes alBoop { 0% { transform: scale(1); } 35% { transform: scale(.88) rotate(-4deg); } 70% { transform: scale(1.06) rotate(2deg); } 100% { transform: scale(1); } }
@keyframes alShimmer { to { background-position: -200% 0; } }
@keyframes alWobble { 0%,100% { transform: rotate(8deg); } 50% { transform: rotate(2deg) translateY(-2px); } }
@keyframes alPop { 0% { transform: scale(.6); } 100% { transform: scale(1); } }
@keyframes alIsland { from { opacity: 0; transform: translateY(-14px) scale(.7); } }
@keyframes alHeart { 0% { opacity: 0; transform: translate(0,0) scale(.4) rotate(0); } 15% { opacity: 1; } 100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(var(--s)) rotate(var(--r)); } }
@keyframes alFade { from { opacity: 0; } }
@keyframes alUp { from { transform: translateY(100%); } }
@keyframes alPush { from { transform: translateX(100%); } }
@keyframes alZoom { from { opacity: 0; transform: translate(-50%, -46%) scale(.96); } }

.al-still *, .al-still *::before, .al-still *::after { animation: none !important; transition: none !important; }
@media (prefers-reduced-motion: reduce) {
  .al-root *, .al-root *::before, .al-root *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
  .al-get[data-s="load"] .al-ring-prog { animation: none; stroke-dashoffset: 0; }
  .al-burst { display: none; }
}
`;
