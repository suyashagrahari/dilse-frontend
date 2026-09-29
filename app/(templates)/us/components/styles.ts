// ─── Us — one stylesheet ─────────────────────────────────────────────────────
//
// Layout switches are CSS, not JS, so the server render is already the right
// layout at every width: phone app under 768px, web app with a collapsed rail
// at 768–1263, and the labelled rail from 1264. Everything animates with
// transform/opacity only and stands still under prefers-reduced-motion.

import { BP, METRICS, PALETTE as P, RING, SYSTEM_FONT, WORDMARK_FONT } from "./types";

const W = BP.web;
const WIDE = BP.wide;

export const CSS = `
.us-app{min-height:100dvh;background:${P.bg};color:${P.ink};font-family:${SYSTEM_FONT};font-size:14px;line-height:18px;-webkit-font-smoothing:antialiased;overflow-x:clip;-webkit-tap-highlight-color:transparent}
.us-app *{box-sizing:border-box}
:where(.us-app) :where(button){font:inherit;color:inherit;background:none;border:0;padding:0;cursor:pointer}
:where(.us-app) :where(a){color:inherit;text-decoration:none}
.us-app img{-webkit-user-drag:none;user-select:none}
.us-ico{display:grid;place-items:center;min-width:40px;min-height:40px;border-radius:10px;transition:transform .15s ease,opacity .15s}
.us-ico:active{transform:scale(.86);opacity:.6}

/* ── Pictures ── */
.us-pic{position:relative;overflow:hidden;background:${P.hair}}
.us-pic img{display:block;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity .35s ease}
.us-pic.is-in img{opacity:1}
.us-pic:not(.is-in)::after{content:"";position:absolute;inset:0;background:linear-gradient(100deg,transparent 30%,rgba(255,255,255,.55) 50%,transparent 70%);background-size:200% 100%;animation:us-shimmer 1.3s linear infinite}

/* ── Avatar ring ── */
.us-ring{position:relative;border-radius:50%;padding:3px;background:${RING};display:grid;place-items:center;flex-shrink:0}
.us-ring.is-seen{background:${P.border};padding:2px}
.us-ring>.us-ring-gap{border-radius:50%;padding:3px;background:#fff;width:100%;height:100%}
.us-ring .us-pic{border-radius:50%;width:100%;height:100%}
.us-ring.is-live{animation:us-ring-spin 6s linear infinite}
.us-ring.is-live>.us-ring-gap{animation:us-ring-spin 6s linear infinite reverse}

/* ── Phone chrome ── */
.us-mtop{position:sticky;top:0;z-index:40;height:${METRICS.topBarH}px;display:flex;align-items:center;justify-content:space-between;padding:0 6px 0 16px;background:rgba(255,255,255,.97);border-bottom:1px solid transparent}
.us-mtop-h{font-size:20px;line-height:24px;font-weight:700;letter-spacing:-.2px;display:flex;align-items:center;gap:4px;min-width:0}
.us-mtop-h>span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:52vw}
.us-dot{width:8px;height:8px;border-radius:50%;background:${P.likeRed};display:inline-block}
.us-bnav{position:fixed;left:0;right:0;bottom:0;z-index:60;height:calc(${METRICS.bottomNavH}px + env(safe-area-inset-bottom,0px));padding-bottom:env(safe-area-inset-bottom,0px);display:flex;justify-content:space-around;align-items:center;background:#fff;border-top:1px solid ${P.hair}}
.us-rail,.us-foot,.us-web-only{display:none}

/* ── Profile header (phone) ── */
.us-head{padding:10px 16px 0}
.us-head-row{display:flex;align-items:center;gap:24px;padding-top:40px}
.us-av{position:relative;width:90px;height:90px;flex-shrink:0}
.us-stats{flex:1;display:flex;justify-content:space-around;text-align:center}
.us-stats button{display:flex;flex-direction:column;align-items:center;gap:1px;padding:4px 2px;border-radius:8px}
.us-stats b{font-size:17px;line-height:21px;font-weight:700}
.us-stats span{font-size:14px;line-height:17px}
.us-name{margin-top:12px;font-weight:600;display:flex;align-items:center;gap:4px}
.us-cat{color:${P.grey}}
.us-bio{white-space:pre-line;word-break:break-word}
.us-link{display:inline-flex;align-items:center;gap:4px;color:${P.linkBlue};font-weight:600;margin-top:2px;max-width:100%}
.us-link span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.us-fby{display:flex;align-items:center;gap:8px;margin-top:10px;font-size:13px;line-height:16px;color:${P.ink2};text-align:left}
.us-fby b{font-weight:600}
.us-minis{display:flex;flex-shrink:0}
.us-mini{width:20px;height:20px;border-radius:50%;border:2px solid #fff;display:grid;place-items:center;font-size:9px;font-weight:700;color:#fff;margin-left:-7px}
.us-mini:first-child{margin-left:0}
.us-btns{display:flex;gap:6px;margin-top:14px}
.us-btn{height:32px;border-radius:8px;background:${P.button};font-weight:600;display:inline-flex;align-items:center;justify-content:center;gap:4px;padding:0 16px;transition:background .15s,transform .12s;white-space:nowrap}
.us-btn:hover{background:${P.buttonHover}}
.us-btn:active{transform:scale(.97)}
.us-btn.is-blue{background:${P.actionBlue};color:#fff}
.us-btns .us-btn{flex:1}
.us-btns .us-btn.is-sq{flex:0 0 34px;padding:0}

/* ── Note bubble ── */
.us-note{position:absolute;left:-6px;bottom:calc(100% - 14px);z-index:2;width:max-content;max-width:min(200px,52vw);padding:8px 12px;border-radius:16px;background:#fff;box-shadow:0 2px 12px rgba(0,0,0,.14);font-size:12px;line-height:15px;text-align:center;color:${P.ink2};animation:us-note-in .6s cubic-bezier(.2,1.4,.4,1) .4s backwards;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;word-break:break-word}
.us-note::before,.us-note::after{content:"";position:absolute;background:#fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,.12)}
.us-note::before{width:10px;height:10px;left:24px;bottom:-7px}
.us-note::after{width:5px;height:5px;left:20px;bottom:-13px}
.us-note-wrap{position:absolute;left:0;right:0;top:0;height:0}

/* ── Highlights ── */
.us-hl{display:flex;gap:14px;overflow-x:auto;padding:14px 16px 10px;scrollbar-width:none;scroll-snap-type:x proximity}
.us-hl::-webkit-scrollbar{display:none}
.us-hl button{display:flex;flex-direction:column;align-items:center;gap:6px;width:66px;flex-shrink:0;scroll-snap-align:start}
.us-hl .us-hl-ring{width:66px;height:66px;border-radius:50%;padding:2px;border:1px solid ${P.border};transition:transform .15s}
.us-hl button:active .us-hl-ring{transform:scale(.93)}
.us-hl .us-pic{width:100%;height:100%;border-radius:50%}
.us-hl span{font-size:12px;line-height:15px;max-width:70px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

/* ── Tabs ── */
.us-tabs{display:flex;border-top:1px solid ${P.hair};margin-top:4px;position:sticky;top:${METRICS.topBarH}px;background:#fff;z-index:30}
.us-tabs button{flex:1;height:44px;display:grid;place-items:center;position:relative;color:${P.grey}}
.us-tabs button.is-on{color:${P.ink}}
.us-tabs button.is-on::after{content:"";position:absolute;left:0;right:0;bottom:0;height:1px;background:${P.ink}}
.us-tabs em{display:none}

/* ── Grid ── */
.us-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:2px}
.us-cell{position:relative;aspect-ratio:3/4;overflow:hidden;background:${P.hair};display:block;width:100%;animation:us-cell-in .5s ease backwards}
.us-cell .us-pic{position:absolute;inset:0}
.us-cell-g{position:absolute;top:8px;right:8px;filter:drop-shadow(${P.glyphShadow})}
.us-cell-pin{position:absolute;top:8px;right:8px;filter:drop-shadow(${P.glyphShadow})}
.us-cell-hover{position:absolute;inset:0;background:rgba(0,0,0,.32);display:flex;align-items:center;justify-content:center;gap:26px;color:#fff;font-weight:700;font-size:16px;opacity:0;transition:opacity .18s}
.us-cell-hover span{display:inline-flex;align-items:center;gap:6px}
.us-cell:active{opacity:.85}
.us-empty{min-height:300px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:40px 32px;text-align:center}
.us-empty-ic{width:62px;height:62px;border-radius:50%;border:2px solid ${P.ink};display:grid;place-items:center}
.us-empty h3{margin:0;font-size:24px;line-height:29px;font-weight:800}
.us-empty p{margin:0;color:${P.grey};max-width:280px}

/* ── Toast ── */
.us-toast{position:fixed;left:50%;bottom:calc(${METRICS.bottomNavH + 16}px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:400;max-width:min(340px,calc(100vw - 32px));padding:11px 16px;border-radius:10px;background:rgba(38,38,38,.96);color:#fff;font-size:14px;line-height:18px;text-align:center;pointer-events:none;animation:us-toast-in .25s cubic-bezier(.2,1.2,.4,1)}

/* ── Sheets (phone) / dialogs (web) ── */
.us-scrim{position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.45);display:flex;align-items:flex-end;justify-content:center;animation:us-fade .2s ease}
.us-sheet{width:100%;max-height:86dvh;overflow:auto;background:#fff;border-radius:14px 14px 0 0;padding:8px 0 calc(12px + env(safe-area-inset-bottom,0px));animation:us-up .32s cubic-bezier(.2,1,.3,1)}
.us-grab{width:36px;height:4px;border-radius:4px;background:${P.border};margin:4px auto 10px}
.us-sheet-title{text-align:center;font-weight:700;font-size:16px;padding:4px 16px 12px;border-bottom:1px solid ${P.hair}}
.us-row{display:flex;align-items:center;gap:12px;width:100%;padding:12px 16px;font-size:15px;text-align:left;transition:background .12s}
.us-row:hover{background:#fafafa}
.us-row.is-red{color:${P.likeRed};font-weight:600}
.us-shake{animation:us-shake .45s ease}

/* ── Heart burst ── */
.us-burst{position:absolute;left:50%;top:50%;pointer-events:none;z-index:5}
.us-burst-big{position:absolute;left:-48px;top:-48px;width:96px;height:96px;animation:us-big-heart 1s cubic-bezier(.2,1.2,.4,1) forwards;filter:drop-shadow(0 6px 18px rgba(0,0,0,.25))}
.us-burst-mini{position:absolute;left:-10px;top:-10px;width:20px;height:20px;animation:us-mini-heart .9s ease-out forwards}
.us-pop{animation:us-pop .35s cubic-bezier(.2,1.6,.4,1)}

/* ═══════════ WEB (≥${W}px) ═══════════ */
@media (min-width:${W}px){
  .us-mtop,.us-bnav{display:none}
  .us-rail{display:flex;flex-direction:column;position:fixed;left:0;top:0;bottom:0;z-index:50;width:${METRICS.railCollapsed}px;padding:8px 12px 20px;border-right:1px solid ${P.border};background:#fff}
  .us-rail-mark{height:92px;display:flex;align-items:center;padding:0 12px}
  .us-rail-word{display:none;font-family:${WORDMARK_FONT};font-size:34px;line-height:1;letter-spacing:.5px}
  .us-rail-nav{display:flex;flex-direction:column;gap:4px;flex:1}
  .us-rail-item{display:flex;align-items:center;gap:16px;height:48px;padding:12px;border-radius:8px;transition:background .15s;position:relative;width:100%;text-align:left}
  .us-rail-item:hover{background:rgba(0,0,0,.05)}
  .us-rail-item:hover svg,.us-rail-item:hover .us-rail-av{transform:scale(1.08)}
  .us-rail-item svg,.us-rail-av{transition:transform .15s}
  .us-rail-item em{display:none;font-style:normal;font-size:16px;line-height:20px}
  .us-rail-item.is-on em{font-weight:700}
  .us-rail-badge{position:absolute;left:27px;top:6px;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:${P.likeRed};color:#fff;font-size:11px;line-height:18px;font-weight:700;text-align:center;border:2px solid #fff}
  .us-rail-av{width:24px;height:24px;border-radius:50%;overflow:hidden}
  .us-rail-item.is-on .us-rail-av{outline:2px solid ${P.ink};outline-offset:1px}
  .us-web{margin-left:${METRICS.railCollapsed}px}
  .us-wrap{max-width:${METRICS.webMax}px;margin:0 auto;padding:30px 20px 0}
  .us-web-only{display:flex!important}
  .us-whead{gap:28px;margin-bottom:44px}
  .us-tabs{--tab-ico:12px}
  .us-av-col{flex:0 0 32%;display:flex;justify-content:center;align-items:flex-start;padding-top:34px}
  .us-av{width:130px;height:130px}
  .us-note{max-width:220px;left:50%;transform:translateX(-50%);animation-name:us-note-in-c}
  .us-info{flex:1;min-width:0;padding-top:12px}
  .us-web-top{display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:20px}
  .us-web-handle{font-size:20px;line-height:25px;font-weight:400;display:flex;align-items:center;gap:6px;margin-right:12px}
  .us-web-top .us-btn{padding:0 16px}
  .us-stats{justify-content:flex-start;gap:40px;margin-bottom:20px;text-align:left;flex:none}
  .us-stats button{flex-direction:row;gap:5px;padding:0;font-size:16px}
  .us-stats b{font-size:16px;font-weight:600}
  .us-stats span{font-size:16px}
  .us-name{margin-top:0}
  .us-phone-only{display:none!important}
  .us-hl{gap:44px;padding:0 0 44px 44px;overflow-x:auto}
  .us-hl button{width:87px}
  .us-hl .us-hl-ring{width:87px;height:87px;padding:3px}
  .us-hl span{font-weight:600;max-width:87px}
  .us-tabs{position:static;justify-content:center;gap:60px;border-top:1px solid ${P.border};margin-top:0}
  .us-tabs button{flex:none;height:52px;display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase}
  .us-tabs button.is-on::after{top:-1px;bottom:auto}
  .us-tabs em{display:inline;font-style:normal}
  .us-grid{gap:4px}
  .us-cell:hover .us-cell-hover{opacity:1}
  .us-foot{display:block;padding:40px 16px 64px;text-align:center;color:${P.grey};font-size:12px;line-height:16px}
  .us-foot nav{display:flex;flex-wrap:wrap;justify-content:center;gap:4px 16px;margin-bottom:14px}
  .us-toast{bottom:28px}
  .us-scrim{align-items:center}
  .us-sheet{max-width:400px;border-radius:12px;padding:0;animation:us-zoom .2s ease}
  .us-sheet .us-grab{display:none}
  .us-sheet-title{padding:14px 16px}
  .us-row{justify-content:center;border-top:1px solid ${P.hair};font-size:14px;min-height:48px}
  .us-row:first-of-type{border-top:0}
}
@media (min-width:1024px){
  .us-av{width:150px;height:150px}
}
@media (min-width:${WIDE}px){
  .us-rail{width:${METRICS.railExpanded}px}
  .us-rail-word{display:block}
  .us-rail-glyph{display:none}
  .us-rail-item em{display:inline}
  .us-web{margin-left:${METRICS.railExpanded}px}
}

@keyframes us-shimmer{from{background-position:150% 0}to{background-position:-50% 0}}
@keyframes us-ring-spin{to{transform:rotate(360deg)}}
@keyframes us-spin{to{transform:rotate(360deg)}}
@keyframes us-note-in{from{opacity:0;transform:translateY(8px) scale(.6)}}
@keyframes us-note-in-c{from{opacity:0;transform:translateX(-50%) translateY(8px) scale(.6)}}
@keyframes us-cell-in{from{opacity:0;transform:scale(.96)}}
@keyframes us-toast-in{from{opacity:0;transform:translateX(-50%) translateY(10px) scale(.96)}}
@keyframes us-fade{from{opacity:0}}
@keyframes us-up{from{transform:translateY(100%)}}
@keyframes us-zoom{from{opacity:0;transform:scale(1.08)}}
@keyframes us-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}
@keyframes us-big-heart{0%{transform:scale(0);opacity:0}15%{transform:scale(1.25);opacity:1}30%{transform:scale(.95)}45%{transform:scale(1.05)}80%{transform:scale(1);opacity:1}100%{transform:scale(1.1) translateY(-30px);opacity:0}}
@keyframes us-mini-heart{0%{transform:translate(0,0) scale(.3);opacity:0}20%{opacity:1}100%{transform:translate(var(--dx),var(--dy)) scale(1) rotate(var(--rot));opacity:0}}
@keyframes us-pop{0%{transform:scale(1)}40%{transform:scale(1.28)}100%{transform:scale(1)}}
@keyframes us-typing{0%,60%,100%{transform:translateY(0);opacity:.45}30%{transform:translateY(-4px);opacity:1}}
@keyframes us-bubble-in{from{opacity:0;transform:translateY(10px) scale(.92)}}
@keyframes us-float-up{0%{transform:translateY(0) scale(.6);opacity:0}15%{opacity:1}100%{transform:translateY(-220px) translateX(var(--dx,0)) scale(1.1);opacity:0}}
@keyframes us-story-bar{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes us-story-in{from{opacity:.4;transform:scale(1.04)}}

@media (prefers-reduced-motion:reduce){
  .us-app *,.us-app *::before,.us-app *::after{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important}
  .us-story-bar-fill{animation-duration:${5200}ms!important}
}
`;
