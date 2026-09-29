// ─── LoveFlix stylesheet ─────────────────────────────────────────────────────
//
// One sheet, injected once by LoveflixTemplate, so hover states, media queries
// and container-query type all work. Every class is prefixed `lf-`.
//
// Sizes follow the streaming web app's own grammar: 4% side gutters, vw-scaled
// billboard type, 16:9 cards at 6/5/4/3 per row, 68px nav, #141414 ground.

import { ACCENT, ACCENT_DEEP, FONT_BODY, FONT_DISPLAY, FONT_SERIF, MATCH_GREEN } from "./theme";

const A = ACCENT;

export const LF_CSS = `
.lf-root{position:relative;min-height:100dvh;padding-top:var(--lf-top);background:#141414;color:#fff;font-family:${FONT_BODY};overflow-x:hidden;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;-webkit-tap-highlight-color:transparent}
:where(.lf-root) *,:where(.lf-root) *::before,:where(.lf-root) *::after{box-sizing:border-box}
:where(.lf-root) button{font:inherit;color:inherit;background:none;border:0;padding:0;margin:0;cursor:pointer;text-align:inherit}
:where(.lf-root) :is(h1,h2,h3,h4,p){margin:0}
:where(.lf-root) :is(h1,h2,h3,h4){font-family:inherit;letter-spacing:inherit}
.lf-root button:focus-visible,.lf-root a:focus-visible{outline:2px solid #fff;outline-offset:2px}
.lf-sr{position:absolute;inset:0;width:100%;height:100%;opacity:0;font-size:16px}
.lf-nobar{scrollbar-width:none;-ms-overflow-style:none}.lf-nobar::-webkit-scrollbar{display:none}
.lf-dim{color:#808080}

/* ── Brand ── */
.lf-wordmark{display:inline-flex;align-items:flex-start;font-family:${FONT_DISPLAY};font-weight:600;line-height:.9;letter-spacing:-.005em;text-transform:uppercase;filter:drop-shadow(0 1px 1px rgba(0,0,0,.35));user-select:none}
.lf-wordmark>span{display:block;transform-origin:50% 0}
.lf-series{display:inline-flex;align-items:center;gap:.3em;color:#e5e5e5;font-weight:700;font-size:14px;line-height:1}
.lf-series>span{font-size:.82em;letter-spacing:.06em;color:#dcdcdc}
.lf-top10chip{display:inline-flex;flex-direction:column;align-items:center;justify-content:center;background:${A};color:#fff;border-radius:2px;font-family:${FONT_BODY};font-weight:800;line-height:.88;letter-spacing:-.02em;flex-shrink:0}
.lf-brandpill{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 11px 0 7px;border-radius:999px;background:rgba(0,0,0,.45);border:1px solid rgba(255,255,255,.22);color:#fff;font-size:12px;font-weight:700;text-decoration:none;white-space:nowrap}
.lf-brandpill img{width:18px;height:18px;border-radius:5px;background:#fff}
.lf-brandpill-cta{color:#ff9ab5}
.lf-brandpill:hover{border-color:#fff}

/* ── Stills & generated title art ── */
.lf-still{position:relative;overflow:hidden;background:#2a2a2a;width:100%;height:100%;container-type:inline-size}
.lf-still>img{position:absolute;inset:0}
.lf-art{position:absolute;inset:0;z-index:1;display:flex;align-items:flex-end;padding:20% 9% 11%;overflow:hidden;color:#fff;line-height:1.02;word-break:break-word;hyphens:auto}
.lf-art-display{text-transform:uppercase;font-weight:600;letter-spacing:.01em;line-height:.95}
.lf-art-serif{font-style:italic;font-weight:600}
.lf-art-sans{font-weight:700;letter-spacing:-.02em}
.lf-art-sm{font-size:13px;font-size:11cqw}
.has-ribbon .lf-art{padding-bottom:20%}
.has-ribbon .lf-card-title{bottom:calc(12% + 1.6em)}
.lf-card-poster .has-ribbon .lf-art{padding-bottom:24%}
.lf-art-md{font-size:16px;font-size:8.6cqw}
.lf-art-lg{font-size:40px;font-size:6.4cqw;padding:7%}
.lf-card-img::after{content:"";position:absolute;left:0;right:0;bottom:0;height:55%;background:linear-gradient(transparent,rgba(0,0,0,.72));pointer-events:none}
.lf-card-title{position:absolute;left:7%;right:7%;bottom:8%;z-index:2;font-family:${FONT_DISPLAY};font-weight:600;text-transform:uppercase;font-size:14px;font-size:8.6cqw;line-height:.95;letter-spacing:.01em;text-shadow:0 2px 10px rgba(0,0,0,.8);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.lf-card-title.is-big{font-size:7.4cqw}
.lf-cornerL{position:absolute;top:6%;left:4%;z-index:2;width:9cqw;height:9cqw;min-width:13px;min-height:13px;filter:drop-shadow(0 1px 2px rgba(0,0,0,.6))}
.lf-ribbon{position:absolute;left:50%;bottom:0;transform:translateX(-50%);z-index:3;background:${A};color:#fff;font-size:10px;font-size:max(9px,5.4cqw);font-weight:700;padding:.3em .7em .25em;border-radius:3px 3px 0 0;white-space:nowrap;letter-spacing:.01em}
.lf-prog{display:block;position:relative;height:3px;background:#5b5b5b}
.lf-prog>i{position:absolute;left:0;top:0;bottom:0;background:${A}}

/* ── Buttons ── */
.lf-btn{display:inline-flex;align-items:center;justify-content:center;gap:.5em;border-radius:4px;font-weight:700;font-size:clamp(14px,1.25vw,20px);line-height:1.2;padding:.55em 1.7em .55em 1.35em;white-space:nowrap;transition:background-color .15s,transform .12s}
.lf-btn:active{transform:scale(.96)}
.lf-btn.is-play{background:#fff;color:#000}.lf-btn.is-play:hover{background:rgba(255,255,255,.75)}
.lf-btn.is-grey{background:rgba(109,109,110,.7);color:#fff}.lf-btn.is-grey:hover{background:rgba(109,109,110,.45)}
.lf-btn.is-ghost{border:1px solid rgba(255,255,255,.65);color:#fff}.lf-btn.is-ghost:hover{background:rgba(255,255,255,.1)}
.lf-btn.is-block{display:flex;width:100%;margin-top:8px;padding:.62em 1em}
.lf-circ{width:38px;height:38px;flex-shrink:0;border-radius:50%;border:2px solid rgba(255,255,255,.5);background:rgba(42,42,42,.6);display:grid;place-items:center;color:#fff;transition:border-color .15s,transform .15s,background-color .15s}
.lf-circ:hover{border-color:#fff}.lf-circ:active{transform:scale(.9)}
.lf-circ.is-white{background:#fff;border-color:#fff;color:#000}.lf-circ.is-white:hover{background:rgba(255,255,255,.8)}
.lf-circ.is-white svg{margin-left:2px}
.lf-circ.is-lg{width:44px;height:44px}.lf-circ.is-sm{width:32px;height:32px}
.lf-circ.is-liked{color:#ff6b95;border-color:#ff6b95;animation:lfBeat .5s}
.lf-circ.is-outline{background:transparent;border:1px solid rgba(255,255,255,.75);width:44px;height:44px}
.lf-circ.is-outline:hover{background:rgba(255,255,255,.1)}
.lf-like{position:relative;display:inline-grid}
.lf-burst{position:absolute;inset:0;pointer-events:none}
.lf-burst i{position:absolute;left:50%;top:50%;color:#ff6b95;font-style:normal;font-size:13px;line-height:1;transform:translate(-50%,-50%) rotate(var(--a));animation:lfBurst .75s ease-out forwards}

/* ── Meta ── */
.lf-meta{display:flex;flex-wrap:wrap;align-items:center;gap:5px 8px;font-size:14px;color:#bcbcbc;font-weight:500;line-height:1.3}
.lf-meta.is-tight{gap:6px;font-size:13px;margin-top:4px}
.lf-match{color:${MATCH_GREEN};font-weight:700}
.lf-mat{border:1px solid rgba(255,255,255,.4);padding:0 .42em;font-size:.92em;color:#fff;white-space:nowrap}
.lf-hd{border:1px solid rgba(255,255,255,.4);border-radius:3px;padding:0 .36em;font-size:.7em;line-height:1.45;font-weight:600;color:#fff}
.lf-tags{display:flex;flex-wrap:wrap;gap:3px 0;font-size:14px;color:#fff;margin-top:10px}
.lf-tags i{color:#646464;font-style:normal;margin:0 6px}
.lf-tags.is-sm{font-size:12px;color:#ddd;margin-top:4px}
.lf-tags.is-center{justify-content:center}

/* ── Profile picker ── */
.lf-pp{min-height:calc(100dvh - var(--lf-top));display:flex;flex-direction:column;animation:lfFade .5s}
.lf-pp-head{position:relative;display:flex;align-items:center;gap:12px;padding:22px 4%}
.lf-pp-mtitle{display:none}
.lf-pp-headR{margin-left:auto;display:flex;align-items:center;gap:14px}
.lf-pp-edit{display:none}
.lf-pp-main{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 4% 9vh;text-align:center}
.lf-pp-h1{font-size:clamp(28px,3.5vw,56px);font-weight:500;letter-spacing:-.01em;margin-bottom:2.2vw;animation:lfRise .6s both}
.lf-pp-list{display:flex;flex-wrap:wrap;justify-content:center;gap:2vw;list-style:none;padding:0;margin:0 0 4.2vw}
.lf-pp-list>li{animation:lfRise .55s both}
.lf-pp-list>li:nth-child(2){animation-delay:.07s}.lf-pp-list>li:nth-child(3){animation-delay:.14s}.lf-pp-list>li:nth-child(4){animation-delay:.21s}
.lf-pp-tile{position:relative;display:flex;flex-direction:column;align-items:center;gap:.9vw;width:clamp(96px,10vw,180px);text-align:center}
@media (min-width:740px) and (max-width:1099px){.lf-pp-tile{width:clamp(110px,14vw,150px);gap:10px}.lf-pp-list{gap:22px}.lf-pp-h1{margin-bottom:28px}}
.lf-pp-av{position:relative;display:block;width:100%;aspect-ratio:1;border-radius:4px;outline:.22vw solid transparent;outline-offset:0;transition:outline-color .15s,transform .2s}
.lf-pp-av>span{border-radius:4px}
.lf-pp-tile:hover .lf-pp-av,.lf-pp-tile:focus-visible .lf-pp-av{outline-color:#e5e5e5}
.lf-pp-tile:active .lf-pp-av{transform:scale(.96)}
.lf-pp-name{color:#808080;font-size:clamp(13px,1.3vw,20px);line-height:1.2;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;transition:color .15s}
.lf-pp-tile:hover .lf-pp-name,.lf-pp-tile:focus-visible .lf-pp-name{color:#e5e5e5}
.lf-pp-lock{color:#808080;display:grid;margin-top:-.3vw}
.lf-pp-addav{display:grid;place-items:center;color:#808080}
.lf-pp-tile.is-add:hover .lf-pp-addav{background:#e5e5e5;color:#141414}
.lf-pp-hint{position:absolute;left:50%;top:-34px;z-index:2;transform:translateX(-50%);background:#fff;color:#141414;font-size:12px;font-weight:700;padding:5px 10px;border-radius:999px;white-space:nowrap;pointer-events:none;animation:lfHintIn .5s 1.2s both,lfBob 2.4s 1.8s ease-in-out infinite;box-shadow:0 6px 16px rgba(0,0,0,.4)}
.lf-pp-hint::after{content:"";position:absolute;left:50%;bottom:-5px;margin-left:-5px;border:5px solid transparent;border-bottom:0;border-top-color:#fff}
.lf-pp-pen{position:absolute;inset:0;display:grid;place-items:center;background:rgba(0,0,0,.5);border-radius:4px}
.lf-pp-manage{border:1px solid #808080;color:#808080;padding:.5em 1.5em;font-size:clamp(13px,1.2vw,18px);letter-spacing:.18em;text-transform:uppercase;transition:.15s;animation:lfRise .6s .3s both}
.lf-pp-manage:hover{border-color:#fff;color:#fff}
.lf-pp-picking{position:fixed;inset:var(--lf-top) 0 0;z-index:5;background:#141414;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:44px;animation:lfFade .2s}
.lf-pp-pickav{width:clamp(110px,13vw,190px);aspect-ratio:1;animation:lfPickGrow .7s cubic-bezier(.2,.8,.2,1) both;box-shadow:0 20px 60px rgba(225,10,23,.25)}
.lf-spinner{width:46px;height:46px;border-radius:50%;border:3px solid rgba(225,10,23,.22);border-top-color:${A};animation:lfSpin .8s linear infinite}
.lf-pin{position:fixed;inset:var(--lf-top) 0 0;z-index:6;background:#141414;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px;animation:lfFade .25s}
.lf-pin-x{position:absolute;top:22px;left:4%;padding:6px}
.lf-pin-k{color:#ccc;font-size:clamp(14px,1.3vw,20px);margin-bottom:12px}
.lf-pin-h{font-size:clamp(22px,2.4vw,40px);font-weight:500;line-height:1.25;margin-bottom:3.2vw;max-width:22em}
.lf-pin-h span{display:block;font-size:.58em;color:#ff9ab5;margin-top:12px}
.lf-pin-boxes{position:relative;display:flex;gap:1.2vw;cursor:text}
.lf-pin-boxes.is-wrong{animation:lfShake .45s}
.lf-pin-box{width:clamp(56px,5.5vw,84px);aspect-ratio:1;border:1px solid #fff;display:grid;place-items:center;font-size:clamp(28px,3vw,48px);transition:transform .15s}
.lf-pin-box.is-cur{transform:scale(1.1);border-width:2px}
.lf-pin-boxes.is-wrong .lf-pin-box{border-color:${A};color:${A}}
.lf-pin-forgot{margin-top:3.2vw;color:#ccc;font-size:16px}.lf-pin-forgot:hover{color:#fff}

/* ── Sting ── */
.lf-sting{position:fixed;inset:var(--lf-top) 0 0;z-index:100;background:#000;overflow:hidden;display:grid;place-items:center}
.lf-sting-l{position:relative;width:30vmin;height:30vmin;transform-origin:38% 50%;animation:lfDive 1.3s 1.25s cubic-bezier(.7,0,.9,.4) forwards}
.lf-sting-v{position:absolute;left:26%;top:8%;width:24%;height:84%;background:linear-gradient(${A},${ACCENT_DEEP});transform-origin:50% 100%;transform:scaleY(0);animation:lfGrowY .5s .12s cubic-bezier(.3,.9,.3,1) forwards;box-shadow:0 0 50px rgba(225,10,23,.45)}
.lf-sting-h{position:absolute;left:26%;top:70%;width:50%;height:22%;background:linear-gradient(90deg,#7d0f2c,${A});transform-origin:0 50%;transform:scaleX(0);clip-path:polygon(0 0,100% 0,88% 100%,0 100%);animation:lfGrowX .42s .5s cubic-bezier(.3,.9,.3,1) forwards}
.lf-sting-fold{position:absolute;left:26%;top:70%;width:24%;height:22%;background:#000;opacity:0;animation:lfFoldIn .3s .78s forwards}
.lf-sting-heart{position:absolute;left:70%;top:50%;width:17%;height:17%;transform:scale(0);animation:lfHeartPop .55s .9s cubic-bezier(.2,1.7,.4,1) forwards;filter:drop-shadow(0 0 12px rgba(255,154,181,.8))}
.lf-sting-streaks{position:absolute;inset:0;pointer-events:none}
.lf-sting-streaks>span{position:absolute;top:-10%;bottom:-10%;opacity:0;transform:scaleX(.3);animation:lfStreak 1.2s cubic-bezier(.4,0,.2,1) forwards}
.lf-sting.is-reduced .lf-sting-l,.lf-sting.is-reduced .lf-sting-l *{animation:none!important;transform:none!important}
.lf-sting.is-reduced .lf-sting-fold{opacity:.28}

/* ── Web nav ── */
.lf-nav{position:fixed;top:var(--lf-top);left:0;right:0;z-index:40;height:68px;display:flex;align-items:center;gap:clamp(14px,2.6vw,44px);padding:0 4%;background:linear-gradient(180deg,rgba(0,0,0,.72) 10%,transparent);transition:background-color .4s}
.lf-nav.is-solid{background-color:#141414}
.lf-nav-logo{display:flex;align-items:center}
.lf-nav-links{display:flex;align-items:center;gap:20px}
.lf-nav-links button{font-size:14px;color:#e5e5e5;transition:color .3s;white-space:nowrap}
.lf-nav-links button:hover{color:#b3b3b3}
.lf-nav-links button.is-on{color:#fff;font-weight:700;cursor:default}
.lf-nav-browse{display:none;position:relative}
.lf-nav-browse>button{display:flex;align-items:center;gap:4px;font-size:14px;font-weight:600}
.lf-nav-right{margin-left:auto;display:flex;align-items:center;gap:clamp(12px,1.6vw,22px)}
.lf-search{display:flex;align-items:center;gap:8px;height:36px;padding:0 6px;border:1px solid transparent;transition:background-color .25s,border-color .25s}
.lf-search button{display:grid}
.lf-search.is-open{border-color:#fff;background:rgba(0,0,0,.75)}
.lf-search input{width:190px;background:transparent;border:0;outline:0;color:#fff;font-size:14px;animation:lfWiden .3s}
.lf-nav-kids{font-size:14px;white-space:nowrap}
.lf-nav-bell{position:relative}
.lf-nav-bell>button{position:relative;display:grid}
.lf-badge{position:absolute;top:-5px;right:-7px;background:${A};border-radius:999px;font-size:10px;font-weight:700;min-width:16px;height:16px;line-height:16px;text-align:center;padding:0 4px}
.lf-nav-profile{position:relative;display:flex;align-items:center;gap:7px;cursor:pointer;outline:none}
.lf-caret{display:grid;transition:transform .3s}
.lf-nav-profile:hover .lf-caret,.lf-nav-profile:focus-within .lf-caret{transform:rotate(180deg)}
.lf-menu{position:absolute;top:calc(100% + 16px);right:0;min-width:230px;background:rgba(0,0,0,.92);border:1px solid rgba(255,255,255,.15);padding:8px 0;list-style:none;margin:0;font-size:13px;z-index:5;animation:lfFade .15s}
.lf-menu::before{content:"";position:absolute;top:-18px;left:0;right:0;height:18px}
.lf-menu li>button,.lf-menu-prof{display:flex;align-items:center;gap:10px;width:100%;padding:8px 14px;text-align:left;white-space:nowrap}
.lf-menu li>button:hover{text-decoration:underline}
.lf-menu-sep{border-top:1px solid rgba(255,255,255,.2);margin-top:6px;padding-top:6px}
.lf-menu.is-profile{display:none}
.lf-nav-profile:hover .lf-menu.is-profile,.lf-nav-profile:focus-within .lf-menu.is-profile{display:block}
.lf-menu.is-browse{left:50%;right:auto;transform:translateX(-50%);min-width:250px;border-top:2px solid #e5e5e5}
.lf-menu.is-browse li>button{justify-content:center;padding:13px;font-size:14px;color:#b3b3b3}
.lf-menu.is-browse li>button.is-on{color:#fff;font-weight:700}
.lf-menu.is-notes{width:min(380px,90vw);padding:0}
.lf-menu.is-notes li{display:flex;gap:12px;padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.1)}
.lf-note-thumb{width:112px;flex:0 0 112px;aspect-ratio:16/9;border-radius:3px;overflow:hidden}
.lf-menu.is-notes b,.lf-my-notes b{display:block;font-size:13px;margin-bottom:2px}
.lf-menu.is-notes span,.lf-my-notes span{display:block;color:#ccc;font-size:13px;line-height:1.35}
.lf-menu.is-notes i,.lf-my-notes i{display:block;color:#808080;font-size:12px;font-style:normal;margin-top:3px}

/* ── Billboard ── */
.lf-bb{position:relative;height:56.25vw;min-height:430px;max-height:calc(100vh - var(--lf-top) + 8vw);overflow:hidden}
.lf-bb-media{position:absolute;inset:0}
.lf-bb-media>.lf-still{position:absolute;inset:0}
.lf-bb-slide{position:absolute;inset:0;opacity:0;transition:opacity 1.3s ease}
.lf-bb-slide.is-on{opacity:1}
.lf-bb-slide.is-kb{animation:lfKb 9s ease-out forwards}
.lf-bb-slide img{position:absolute;inset:0}
.lf-bb-vl{position:absolute;inset:0;background:linear-gradient(77deg,rgba(0,0,0,.66) 0%,rgba(0,0,0,.25) 45%,transparent 85%)}
.lf-bb-vb{position:absolute;left:0;right:0;bottom:-1px;height:15vw;background:linear-gradient(180deg,transparent,rgba(20,20,20,.15) 15%,rgba(20,20,20,.35) 29%,rgba(20,20,20,.58) 44%,#141414 68%,#141414)}
.lf-bb-info{position:absolute;left:4%;bottom:34%;width:38%;z-index:2}
.lf-bb-title{font-family:${FONT_DISPLAY};font-weight:600;text-transform:uppercase;font-size:clamp(46px,7.2vw,138px);line-height:.88;letter-spacing:.005em;margin:.14em 0 .16em;background:linear-gradient(180deg,#fff 45%,#ffd0dc);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 4px 24px rgba(0,0,0,.5));transform-origin:0 100%;transition:transform 1.3s cubic-bezier(.2,.8,.2,1);overflow-wrap:anywhere}
.lf-bb.is-trailer .lf-bb-title{transform:scale(.7)}
.lf-bb-rank{display:flex;align-items:center;gap:.5em;font-size:clamp(15px,1.55vw,26px);font-weight:700;text-shadow:2px 2px 4px rgba(0,0,0,.45);margin-bottom:.7vw}
.lf-bb-syn{font-size:clamp(14px,1.2vw,20px);line-height:1.35;font-weight:500;text-shadow:2px 2px 4px rgba(0,0,0,.45);margin-bottom:1.5vw;max-height:6.2em;overflow:hidden;transition:opacity .7s,max-height 1.2s,margin 1.2s}
.lf-bb.is-trailer .lf-bb-syn{opacity:0;max-height:0;margin-bottom:0}
.lf-bb-btns{display:flex;flex-wrap:wrap;gap:.8vw}
.lf-bb-btns .lf-btn{gap:.45em}
.lf-bb-side{position:absolute;right:0;bottom:34%;z-index:2;display:flex;align-items:center;gap:1.1vw}
.lf-bb-mat{border-left:3px solid #dcdcdc;background:rgba(51,51,51,.6);padding:.4em 3.6vw .4em .8em;font-size:clamp(13px,1.1vw,18px);white-space:nowrap}

/* ── Rails ── */
.lf-rails-lift{position:relative;z-index:3;margin-top:-8.5vw}
.lf-rails{display:flex;flex-direction:column;gap:clamp(24px,3vw,46px);padding-bottom:10px}
.lf-row{position:relative;--n:2.2;--gap:6px}
.lf-row-h{display:flex;align-items:baseline;gap:10px;padding:0 4%;margin-bottom:.55em;font-size:clamp(16px,1.4vw,22px);font-weight:700;color:#e5e5e5;line-height:1.25}
.lf-row-h>span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
.lf-row-explore{display:inline-flex;align-items:center;font-size:.6em;color:#54b9c5;opacity:0;transform:translateX(-10px);transition:opacity .4s,transform .4s;white-space:nowrap}
.lf-row:hover .lf-row-explore{opacity:1;transform:none}
.lf-row-ticks{position:absolute;right:4%;top:.8em;display:flex;gap:2px;opacity:0;transition:opacity .3s}
.lf-row:hover .lf-row-ticks{opacity:1}
.lf-row-ticks i{width:12px;height:2px;background:#4d4d4d}
.lf-row-ticks i.is-on{background:#aaa}
.lf-row-wrap{position:relative}
.lf-row-track{display:flex;gap:var(--gap);overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;scroll-padding:0 4%;padding:0 4%;overscroll-behavior-x:contain}
.lf-row-track>*{scroll-snap-align:start}
.lf-row-track::after{content:"";flex:0 0 1px}
.lf-row-arrow{position:absolute;top:0;bottom:0;width:4%;min-width:34px;z-index:4;display:grid;place-items:center;background:rgba(20,20,20,.5);color:#fff;opacity:0;transition:opacity .2s,background-color .2s}
.lf-row-arrow.is-l{left:0;border-radius:0 4px 4px 0}.lf-row-arrow.is-r{right:0;border-radius:4px 0 0 4px}
.lf-row:hover .lf-row-arrow{opacity:1}
.lf-row-arrow:hover{background:rgba(20,20,20,.72)}
.lf-row-arrow svg{transition:transform .15s}.lf-row-arrow:hover svg{transform:scale(1.25)}
@media (hover:none){.lf-row-arrow,.lf-row-ticks,.lf-row-explore{display:none}}
.lf-row-top10{--n:2.3}
.lf-row-poster{--n:3.3;--gap:8px}
@media (min-width:740px){.lf-row{--n:3;--gap:.55vw}.lf-row-top10{--n:3}}
@media (min-width:900px){.lf-row{--n:4}.lf-row-top10{--n:3.6}}
@media (min-width:1100px){.lf-row{--n:5;--gap:.45vw}.lf-row-top10{--n:4.2}}
@media (min-width:1400px){.lf-row{--n:6}.lf-row-top10{--n:5}}
.lf-card{position:relative;display:block;flex:0 0 calc((100% - (var(--n) - 1) * var(--gap)) / var(--n));min-width:0;border-radius:4px;text-align:left}
.lf-card-wide .lf-card-img{aspect-ratio:16/9;height:auto;border-radius:4px}
.lf-card-wide:has(.lf-prog) .lf-card-img{border-radius:4px 4px 0 0}
.lf-card-wide .lf-prog{border-radius:0 0 2px 2px;overflow:hidden}
.lf-card-wide:hover .lf-card-img img{filter:brightness(1.08)}
.lf-card-top10{display:flex;align-items:flex-end;aspect-ratio:1.36/1;container-type:inline-size}
.lf-num{flex:0 0 50%;align-self:stretch;display:flex;align-items:flex-end;justify-content:flex-end;font-family:"Arial Black","Helvetica Neue",Arial,${FONT_BODY};font-weight:900;font-size:86cqw;line-height:.73;letter-spacing:-.06em;color:#141414;-webkit-text-stroke:max(2px,1.5cqw) #5d5d5d;paint-order:stroke;margin-right:-4%;padding-bottom:.02em;user-select:none;transition:-webkit-text-stroke-color .2s}
.lf-num.is-10{font-size:74cqw;letter-spacing:-.16em;margin-right:-1%}
.lf-card-top10:hover .lf-num{-webkit-text-stroke-color:#8a8a8a}
.lf-top10-poster{flex:0 0 50%;width:50%;height:auto;aspect-ratio:2/3;border-radius:4px;z-index:1;box-shadow:-6px 0 14px rgba(0,0,0,.35)}
.lf-top10-shade{position:absolute;inset:0;z-index:1;background:linear-gradient(180deg,rgba(0,0,0,.05) 25%,rgba(0,0,0,.35) 50%,rgba(0,0,0,.9))}
.lf-top10-chip{position:absolute;top:0;right:7%;z-index:2}
.lf-top10-text{position:absolute;left:8%;right:8%;bottom:7%;z-index:2;font-family:${FONT_DISPLAY};font-weight:600;text-transform:uppercase;font-size:14px;font-size:13.5cqw;line-height:1;letter-spacing:.01em;text-shadow:0 2px 8px rgba(0,0,0,.7);display:-webkit-box;-webkit-line-clamp:6;-webkit-box-orient:vertical;overflow:hidden}
.lf-top10-poster .lf-cornerL{width:14cqw;height:14cqw}

/* ── Hover preview ── */
.lf-hp{position:fixed;z-index:50;border-radius:6px;overflow:hidden;background:#181818;box-shadow:0 3px 10px rgba(0,0,0,.75),0 20px 50px rgba(0,0,0,.5);transform-origin:0 0;opacity:.55;transition:transform .34s cubic-bezier(.2,.8,.2,1),opacity .2s}
.lf-hp.is-open{opacity:1}
.lf-hp-img{display:block;width:100%;aspect-ratio:16/9}
.lf-hp-img .lf-still::after{content:"";position:absolute;inset:55% 0 0;background:linear-gradient(transparent,rgba(24,24,24,.9))}
.lf-hp-body{padding:14px 16px 18px}
.lf-hp-actions{display:flex;align-items:center;gap:8px;margin-bottom:13px}
.lf-hp-more{margin-left:auto}
.lf-hp-ep{font-size:13px;color:#ddd;margin-top:9px}
.lf-hp-ep b{margin-right:4px}

/* ── Details modal ── */
.lf-dm-overlay{position:fixed;inset:var(--lf-top) 0 0;z-index:60;background:rgba(0,0,0,.72);animation:lfFade .25s}
.lf-dm-scroll{position:absolute;inset:0;overflow-y:auto;overscroll-behavior:contain;padding:32px 0 48px}
.lf-dm{position:relative;width:min(850px,94vw);margin:0 auto;background:#181818;border-radius:8px;overflow:hidden;box-shadow:0 3px 10px rgba(0,0,0,.75);animation:lfModalIn .38s cubic-bezier(.2,.8,.2,1)}
.lf-dm-hero{position:relative;aspect-ratio:16/9}
.lf-dm-hero>.lf-still{position:absolute;inset:0}
.lf-dm-herofade{position:absolute;inset:0;background:linear-gradient(0deg,#181818 0%,rgba(24,24,24,.5) 22%,transparent 52%);pointer-events:none}
.lf-dm-close{position:absolute;top:14px;right:14px;z-index:3;width:36px;height:36px;border-radius:50%;background:#181818;display:grid;place-items:center;transition:transform .15s}
.lf-dm-close:hover{transform:scale(1.08)}
.lf-dm-herotext{position:absolute;left:48px;right:48px;bottom:7%;z-index:2}
.lf-dm-title{font-family:${FONT_DISPLAY};font-weight:600;text-transform:uppercase;font-size:clamp(38px,6.4vw,68px);line-height:.9;margin:.16em 0 .34em;filter:drop-shadow(0 3px 14px rgba(0,0,0,.6));overflow-wrap:anywhere}
.lf-dm-actions{display:flex;align-items:center;gap:9px}
.lf-dm-actions .lf-btn{font-size:17px;padding:.5em 1.7em .5em 1.3em}
.lf-dm-body{padding:0 48px 44px}
.lf-dm-info{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr);gap:32px;margin:4px 0 30px}
.lf-dm-left .lf-meta{margin-bottom:8px;font-size:16px}
.lf-dm-left .lf-dim{font-size:14px}
.lf-dm-rank{display:flex;align-items:center;gap:10px;font-size:19px;margin:14px 0}
.lf-dm-epline{font-size:16px;margin-bottom:6px}
.lf-dm-syn1{font-size:16px;line-height:1.5}
.lf-dm-right p{font-size:14px;line-height:1.45;margin-bottom:12px;color:#fff}
.lf-dm-right span,.lf-dm-about span{color:#777}
.lf-dm-right i{font-style:italic}
.lf-dm-eps h3,.lf-dm-more h3,.lf-dm-about h3{font-size:24px;font-weight:700}
.lf-dm-epshead{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:8px 0 16px}
.lf-dm-season{position:relative}
.lf-dm-season>button{display:flex;align-items:center;gap:12px;border:1px solid #4d4d4d;background:#242424;border-radius:4px;padding:8px 14px;font-size:17px;font-weight:700}
.lf-dm-season ul{position:absolute;right:0;top:calc(100% + 4px);min-width:230px;background:#242424;border:1px solid #4d4d4d;list-style:none;margin:0;padding:6px 0;z-index:3}
.lf-dm-season li{padding:10px 14px;font-size:16px;cursor:pointer}
.lf-dm-season li span{color:#bcbcbc;font-size:13px}
.lf-dm-season li.is-on{background:#414141}
.lf-dm-season li[aria-disabled]{color:#808080}
.lf-dm-eplist,.lf-dm-reasons{list-style:none;margin:0;padding:0}
.lf-dm-eplist>li{border-bottom:1px solid #404040}
.lf-dm-eplist>li.is-cur .lf-dm-ep{background:#333}
.lf-dm-ep{display:flex;align-items:center;gap:16px;width:100%;padding:18px 20px;border-radius:4px;text-align:left;transition:background-color .15s}
.lf-dm-ep:hover{background:#2a2a2a}
.lf-dm-epn{flex:0 0 26px;font-size:24px;color:#d2d2d2;text-align:center}
.lf-dm-thumb{position:relative;flex:0 0 132px;aspect-ratio:16/9;border-radius:4px;overflow:hidden}
.lf-dm-thumbplay{position:absolute;inset:0;z-index:2;display:grid;place-items:center;background:rgba(0,0,0,.25);opacity:0;transition:opacity .2s}
.lf-dm-thumbplay svg{width:40px;height:40px;padding:9px 8px 9px 11px;border:2px solid #fff;border-radius:50%;background:rgba(0,0,0,.5)}
.lf-dm-ep:hover .lf-dm-thumbplay{opacity:1}
.lf-prog.is-thumb{position:absolute;left:8px;right:8px;bottom:6px;z-index:3}
.lf-dm-eptxt{flex:1;min-width:0}
.lf-dm-eptop{display:flex;justify-content:space-between;gap:12px;font-size:16px;margin-bottom:6px}
.lf-dm-eptop>span{flex-shrink:0}
.lf-dm-syn{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;font-size:14px;line-height:1.42;color:#d2d2d2}
.lf-dm-reasons>li{display:flex;align-items:center;gap:18px;padding:14px 20px;border-bottom:1px solid #404040;font-size:16px;line-height:1.35}
.lf-dm-reasons>li.is-cur{background:#333;border-radius:4px}
.lf-dm-rnum{flex:0 0 38px;font-family:"Arial Black",Arial,sans-serif;font-weight:900;font-size:34px;color:#181818;-webkit-text-stroke:2px #6a6a6a;text-align:center;letter-spacing:-.06em}
.lf-dm-more{margin-top:40px;border-bottom:2px solid #404040;padding-bottom:1px}
.lf-dm-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin:18px 0 24px}
.lf-dm-mcard{background:#2f2f2f;border-radius:4px;overflow:hidden}
.lf-dm-mimg{aspect-ratio:16/9;height:auto}
.lf-dm-mlen{position:absolute;top:8px;right:10px;z-index:2;font-size:13px;font-weight:700;text-shadow:0 0 6px #000}
.lf-dm-mbody{padding:12px 14px 16px}
.lf-dm-mtop{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px}
.lf-dm-mtitle{font-weight:700;font-size:14px;margin-bottom:6px}
.lf-dm-msyn{font-size:13px;color:#d2d2d2;line-height:1.4}
.lf-dm-showmore{display:grid;place-items:center;width:40px;height:40px;margin:0 auto -21px;border-radius:50%;border:2px solid rgba(255,255,255,.5);background:#2a2a2a;position:relative;z-index:1}
.lf-dm-showmore>span{display:grid;transition:transform .3s}
.lf-dm-about{margin-top:44px}
.lf-dm-about h3{font-weight:400;margin-bottom:14px}
.lf-dm-about p{font-size:14px;line-height:1.45;margin-bottom:10px}
.lf-dm-phtitle h2{font-family:${FONT_DISPLAY};font-weight:600;text-transform:uppercase;font-size:34px;line-height:.95;margin:6px 0 8px}
.lf-dm-phacts{display:flex;gap:36px;padding:4px 8px 18px}
.lf-dm-phacts button{display:flex;flex-direction:column;align-items:center;gap:6px;font-size:11px;color:#bcbcbc}
.lf-dm-phacts button.is-liked{color:#ff6b95}
.lf-dm-tabs{display:flex;gap:22px;border-top:1px solid #333;margin:0 -16px 6px;padding:0 16px}
.lf-dm-tabs button{padding:12px 0 10px;border-top:4px solid transparent;margin-top:-1px;font-weight:700;font-size:14px;color:#bcbcbc}
.lf-dm-tabs button.is-on{border-top-color:${A};color:#fff}
.lf-dm-overlay.is-phone{background:#000}
.is-phone .lf-dm-scroll{padding:0}
.is-phone .lf-dm{width:100%;min-height:100%;border-radius:0;animation:lfSlideUp .35s cubic-bezier(.2,.8,.2,1)}
.is-phone .lf-dm-close{left:10px;right:auto;top:10px;background:rgba(0,0,0,.55)}
.is-phone .lf-dm-herofade{background:linear-gradient(0deg,#181818 0%,transparent 35%)}
.is-phone .lf-dm-body{padding:0 16px 48px}
.is-phone .lf-meta{font-size:13px;margin-bottom:12px}
.is-phone .lf-btn{font-size:15px}
.is-phone .lf-dm-info{display:block;margin:14px 0 12px}
.is-phone .lf-dm-syn1{font-size:14px;line-height:1.45}
.is-phone .lf-dm-rank{font-size:15px;margin:0 0 10px}
.is-phone .lf-dm-right{margin-top:10px}
.is-phone .lf-dm-right p{font-size:12px;color:#bcbcbc;margin-bottom:4px}
.is-phone .lf-dm-epshead{margin:10px 0 6px}
.is-phone .lf-dm-eps h3{font-size:18px}
.is-phone .lf-dm-season>button{font-size:14px;padding:6px 10px}
.is-phone .lf-dm-eplist>li{border:0}
.is-phone .lf-dm-eplist>li.is-cur .lf-dm-ep{background:none}
.is-phone .lf-dm-ep{display:grid;grid-template-columns:124px minmax(0,1fr) 28px;grid-template-areas:"th top dl" "syn syn syn";gap:10px 12px;padding:12px 0;align-items:center}
.is-phone .lf-dm-epn{display:none}
.is-phone .lf-dm-thumb{grid-area:th}
.is-phone .lf-dm-eptxt{display:contents}
.is-phone .lf-dm-eptop{grid-area:top;flex-direction:column;gap:3px;margin:0;font-size:14px}
.is-phone .lf-dm-eptop>span{font-size:12px;color:#aaa}
.is-phone .lf-dm-syn{grid-area:syn;font-size:13px;color:#aaa}
.is-phone .lf-dm-dl{grid-area:dl;color:#ddd;display:grid;place-items:center}
.is-phone .lf-dm-grid{gap:8px}
.is-phone .lf-dm-mimg{aspect-ratio:2/3}
.is-phone .lf-dm-mbody,.is-phone .lf-dm-mlen{display:none}
.is-phone .lf-dm-more{margin-top:10px;border:0}
.is-phone .lf-dm-more h3{font-size:16px}
.is-phone .lf-dm-reasons>li{padding:12px 4px;font-size:14px}
.is-phone .lf-dm-about{margin-top:28px}
.is-phone .lf-dm-about h3{font-size:18px}

/* ── Player ── */
.lf-pl{position:fixed;inset:var(--lf-top) 0 0;z-index:80;background:#000;overflow:hidden;cursor:none;user-select:none;animation:lfFade .35s}
.lf-pl.is-chrome{cursor:default}
.lf-pl-stage{position:absolute;inset:0}
.lf-pl-back{position:absolute;inset:-60px;background-size:cover;background-position:center;filter:blur(38px) brightness(.42) saturate(1.25)}
.lf-pl-frame{position:absolute;inset:0}
.lf-pl-frame>img{position:absolute;inset:0}
.lf-pl-frame.is-kb{animation:lfPush 24s linear forwards}
.lf-pl-grain{position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 55%,rgba(0,0,0,.55));pointer-events:none}
.lf-pl-top{position:absolute;top:0;left:0;right:0;display:flex;justify-content:space-between;padding:18px 22px;background:linear-gradient(rgba(0,0,0,.55),transparent);opacity:0;pointer-events:none;transition:opacity .3s}
.lf-pl-bottom{position:absolute;left:0;right:0;bottom:0;padding:40px 22px 16px;background:linear-gradient(transparent,rgba(0,0,0,.78));opacity:0;pointer-events:none;transition:opacity .3s}
.lf-pl.is-chrome .lf-pl-top,.lf-pl.is-chrome .lf-pl-bottom{opacity:1;pointer-events:auto}
.lf-pl-ic{width:48px;height:48px;display:grid;place-items:center;color:#fff;transition:transform .15s,color .15s}
.lf-pl-ic:hover{transform:scale(1.18)}
.lf-pl-ic.is-on{color:#ff9ab5}
.lf-pl-scrubrow{display:flex;align-items:center;gap:14px}
.lf-pl-scrub{position:relative;flex:1;height:24px;cursor:pointer}
.lf-pl-track,.lf-pl-buffer,.lf-pl-played{position:absolute;left:0;top:50%;height:4px;transform:translateY(-50%);transition:height .15s}
.lf-pl-track{right:0;background:#5b5b5b}
.lf-pl-buffer{background:#8a8a8a}
.lf-pl-played{background:${A};transition:width .12s linear,height .15s}
.lf-pl-scrub:hover .lf-pl-track,.lf-pl-scrub:hover .lf-pl-buffer,.lf-pl-scrub:hover .lf-pl-played{height:7px}
.lf-pl-knob{position:absolute;top:50%;width:16px;height:16px;border-radius:50%;background:${A};transform:translate(-50%,-50%);transition:left .12s linear,transform .15s;box-shadow:0 0 0 4px rgba(225,10,23,.25)}
.lf-pl-scrub:hover .lf-pl-knob{transform:translate(-50%,-50%) scale(1.25)}
.lf-pl-time{font-size:15px;font-variant-numeric:tabular-nums;min-width:56px;text-align:right}
.lf-pl-ctrls{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:4px}
.lf-pl-group{display:flex;align-items:center;gap:clamp(4px,1.3vw,20px)}
.lf-pl-name{flex:1;min-width:0;text-align:center;font-size:17px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lf-pl-name b{margin-right:12px}
.lf-pl-name span{color:#ddd;margin-right:8px}
.lf-pl-sub{position:absolute;left:8%;right:8%;bottom:12%;z-index:2;text-align:center;font-size:clamp(19px,2.6vw,40px);font-weight:500;line-height:1.28;color:#fff;text-shadow:0 0 8px #000,0 2px 3px #000,0 0 2px #000;animation:lfSubIn .28s ease;transition:bottom .3s;pointer-events:none;text-wrap:balance}
.lf-pl.is-chrome .lf-pl-sub{bottom:21%}
.lf-pl-sub.is-meta{font-style:italic;color:#ddd;font-size:clamp(15px,1.6vw,22px)}
.lf-pl-titlecard{position:absolute;inset:0;z-index:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;text-align:center;padding:0 6%;background:radial-gradient(ellipse at center,rgba(0,0,0,.45),transparent 70%);pointer-events:none;animation:lfTitleCard 5.2s ease forwards}
.lf-pl-tcshow{font-family:${FONT_DISPLAY};font-weight:600;text-transform:uppercase;font-size:clamp(44px,8vw,120px);line-height:.88;filter:drop-shadow(0 4px 20px rgba(0,0,0,.7));overflow-wrap:anywhere}
.lf-pl-tcep{letter-spacing:.32em;text-transform:uppercase;font-size:12px;font-weight:600;color:#ddd;margin-top:12px}
.lf-pl-tctitle{font-family:${FONT_SERIF};font-style:italic;font-size:clamp(20px,2.6vw,36px);text-shadow:0 2px 10px rgba(0,0,0,.7)}
.lf-pl-rating{position:absolute;top:14%;left:4%;z-index:2;display:flex;gap:12px;align-items:stretch;animation:lfRating 3.7s ease forwards}
.lf-pl-rbar{width:3px;background:${A}}
.lf-pl-rating b{display:block;font-size:clamp(18px,2vw,28px);letter-spacing:.03em}
.lf-pl-rating span{display:block;font-size:clamp(13px,1.2vw,17px);color:#ddd;margin-top:3px;max-width:28em}
.lf-pl-skip{position:absolute;right:4%;bottom:19%;z-index:3;padding:12px 26px;border:1px solid rgba(255,255,255,.7);background:rgba(42,42,42,.6);color:#fff;font-size:16px;font-weight:700;border-radius:4px;animation:lfPop .3s;transition:background-color .15s,color .15s}
.lf-pl-skip:hover{background:#fff;color:#000}
.lf-pl-skip.is-no{animation:lfWiggle .5s;border-color:#ff9ab5}
.lf-pl-next{position:absolute;right:4%;bottom:19%;z-index:3;display:flex;gap:14px;background:rgba(18,18,18,.88);padding:12px;border-radius:6px;max-width:min(470px,92vw);animation:lfPop .35s;box-shadow:0 10px 30px rgba(0,0,0,.5)}
.lf-pl-next.is-static{background:none;padding:0;box-shadow:none}
.lf-pl-nextthumb{width:150px;flex:0 0 150px;aspect-ratio:16/9;border-radius:4px;overflow:hidden}
.lf-pl-nextbody{min-width:0}
.lf-pl-nextk{font-size:11px;color:#bbb;text-transform:uppercase;letter-spacing:.14em;font-weight:600}
.lf-pl-nextbody b{display:block;font-size:15px;margin:3px 0 10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.lf-pl-nextbtns{display:flex;flex-wrap:wrap;gap:8px}
.lf-pl-nextbtn{position:relative;overflow:hidden;background:rgba(255,255,255,.35);color:#000;border-radius:4px;padding:9px 16px;font-weight:700;font-size:14px}
.lf-pl-nextbtn.is-solid{background:#fff;padding:12px 22px;font-size:16px}
.lf-pl-fill{position:absolute;inset:0;background:#fff;transform-origin:0 50%;animation:lfFill linear forwards}
.lf-pl-nextlabel{position:relative;display:flex;align-items:center;gap:6px}
.lf-pl-credbtn{padding:9px 14px;border:1px solid rgba(255,255,255,.55);border-radius:4px;font-size:14px;font-weight:600}
.lf-pl-panel{position:absolute;right:22px;bottom:100px;background:#262626;border-radius:4px;padding:18px 20px;max-height:58vh;overflow:auto;box-shadow:0 10px 30px rgba(0,0,0,.6);animation:lfPop .2s;min-width:300px;max-width:calc(100vw - 24px)}
.lf-pl-panel h4{font-size:20px;margin-bottom:12px}
.lf-pl-panel.is-eps ol{list-style:none;margin:0;padding:0}
.lf-pl-panel.is-eps button{display:flex;align-items:center;gap:12px;width:100%;padding:11px 10px;text-align:left;border-radius:3px;font-size:15px}
.lf-pl-panel.is-eps button:hover,.lf-pl-panel.is-eps button.is-cur{background:#3a3a3a}
.lf-pl-panel.is-eps button.is-cur{font-weight:700}
.lf-pl-pn{color:#999;width:18px}.lf-pl-pt{flex:1}.lf-pl-pr{color:#999;font-size:13px}
.lf-pl-panel.is-subs{display:flex;gap:44px}
.lf-pl-panel.is-subs>div{display:flex;flex-direction:column;gap:2px}
.lf-pl-panel.is-subs button{text-align:left;padding:7px 0;color:#bbb;font-size:15px;white-space:nowrap}
.lf-pl-panel.is-subs button.is-cur{color:#fff;font-weight:700}
.lf-pl-speeds{position:relative;display:flex;gap:20px;padding-top:6px}
.lf-pl-speeds::before{content:"";position:absolute;left:22px;right:22px;top:13px;height:2px;background:#555}
.lf-pl-speeds button{position:relative;display:flex;flex-direction:column;align-items:center;gap:9px;font-size:13px;color:#bbb;white-space:nowrap}
.lf-pl-speeds i{width:14px;height:14px;border-radius:50%;background:#262626;border:2px solid #bbb;transition:transform .15s}
.lf-pl-speeds button.is-cur{color:#fff}
.lf-pl-speeds button.is-cur i{background:#fff;border-color:#fff;transform:scale(1.4)}
.lf-pl-panel.is-speed p{margin-top:14px;font-size:12px;color:#888;font-style:italic}
.lf-pl-still{position:absolute;inset:0;z-index:6;display:flex;align-items:center;padding:0 8%;background:rgba(0,0,0,.74);animation:lfFade .4s}
.lf-pl-still h3{font-size:clamp(26px,3.4vw,54px);font-weight:700;line-height:1.1;max-width:14em;margin-bottom:12px}
.lf-pl-still p{font-family:${FONT_SERIF};font-style:italic;font-size:clamp(16px,1.6vw,24px);color:#ffc2d1;margin-bottom:28px}
.lf-pl-stillbtns{display:flex;flex-wrap:wrap;gap:12px}

/* ── Finale & credits ── */
.lf-fin{position:fixed;inset:var(--lf-top) 0 0;z-index:80;background:#000;display:grid;place-items:center;padding:24px;overflow:hidden}
.lf-fin-bg{position:absolute;inset:-60px;background-size:cover;background-position:center;filter:blur(44px) brightness(.2) saturate(1.3);animation:lfFade 2.4s}
.lf-fin::after{content:"";position:absolute;inset:0;background:radial-gradient(ellipse at 50% 45%,rgba(225,10,23,.16),rgba(0,0,0,.55) 72%);pointer-events:none}
.lf-fin-hearts{position:absolute;inset:0;z-index:1;pointer-events:none;overflow:hidden}
.lf-fin-hearts i{position:absolute;bottom:-40px;color:#ff6b95;font-style:normal;opacity:0;animation:lfFloat linear infinite}
.lf-fin-x{position:absolute;top:14px;left:14px;z-index:3}
.lf-fin-text{position:relative;z-index:2;max-width:680px;text-align:center;display:flex;flex-direction:column;align-items:center}
.lf-fin-text p{font-family:${FONT_SERIF};font-size:clamp(22px,3vw,38px);line-height:1.32;margin-bottom:.9em;white-space:pre-line;animation:lfLine 1.6s ease both;text-wrap:balance}
.lf-fin-q{margin-top:10px;animation:lfLine 1s .2s ease both}
.lf-cr{position:fixed;inset:var(--lf-top) 0 0;z-index:80;background:#000;display:grid;grid-template-columns:1fr 1fr;align-items:center;animation:lfFade .6s}
.lf-cr-roll{position:relative;height:100%;overflow:hidden;-webkit-mask-image:linear-gradient(transparent,#000 14%,#000 86%,transparent);mask-image:linear-gradient(transparent,#000 14%,#000 86%,transparent)}
.lf-cr-inner{position:absolute;left:0;right:0;top:8%;padding:0 10%;text-align:center}
.lf-cr-inner.is-rolling{top:0;animation:lfRoll 19s linear forwards}
.lf-cr-inner h3{font-family:${FONT_DISPLAY};font-weight:600;text-transform:uppercase;font-size:clamp(38px,5vw,76px);line-height:.9;margin-bottom:44px}
.lf-cr-inner p{margin-bottom:26px}
.lf-cr-inner p span{display:block;font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:#999;margin-bottom:6px}
.lf-cr-inner p b{font-size:clamp(17px,1.8vw,24px);font-weight:600}
.lf-cr-inner .lf-cr-note{font-family:${FONT_SERIF};font-style:italic;color:#bbb;font-size:18px;margin-top:44px}
.lf-cr-side{display:grid;place-items:center;padding:24px}
.lf-cr-card{display:flex;flex-direction:column;align-items:center;gap:8px;max-width:380px;padding:34px 30px;text-align:center;background:#181818;border-radius:12px;border:1px solid rgba(255,255,255,.08);box-shadow:0 24px 70px rgba(225,10,23,.28);animation:lfPop .6s .7s both}
.lf-cr-heart{font-size:56px;line-height:1;color:${A};animation:lfBeat 1.2s ease-in-out infinite}
.lf-cr-k{font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:${MATCH_GREEN};font-weight:700}
.lf-cr-card b{font-size:24px;line-height:1.2}
.lf-cr-s{color:#bbb;font-size:14px;margin-bottom:14px}

/* ── Skeleton ── */
.lf-skel{padding-top:88px;animation:lfFade .3s}
.lf-skel-hero{height:38vw;margin:0 4% 3vw;border-radius:6px}
.lf-skel-herocard{width:calc(100% - 32px);max-width:440px;aspect-ratio:.72;margin:24px auto;border-radius:10px}
.lf-skel-row{padding:0 4%;margin-bottom:3vw}
.lf-skel-h{width:180px;height:18px;border-radius:3px;margin-bottom:12px}
.lf-skel-cards{display:flex;gap:.5vw;overflow:hidden}
.lf-skel-card{flex:0 0 calc((100% - 2.5vw) / 6);aspect-ratio:16/9;border-radius:4px}
.lf-skel-poster{flex:0 0 30%;aspect-ratio:2/3;border-radius:4px}
.lf-skel-hero,.lf-skel-herocard,.lf-skel-h,.lf-skel-card,.lf-skel-poster{background:linear-gradient(100deg,#1d1d1d 30%,#2a2a2a 50%,#1d1d1d 70%);background-size:300% 100%;animation:lfShimmer 1.3s linear infinite}

/* ── Phone app ── */
.lf-browse.is-phone{padding-bottom:calc(76px + env(safe-area-inset-bottom,0px))}
.lf-mh{position:fixed;top:var(--lf-top);left:0;right:0;z-index:40;padding:8px 16px 10px;transition:background-color .3s}
.lf-mh.is-solid{background:rgba(18,18,18,.9);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px)}
.lf-mh-top{display:flex;align-items:center;justify-content:space-between;gap:12px;height:40px}
.lf-mh-top h1{font-size:22px;font-weight:700;letter-spacing:-.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.lf-mh-ic{display:flex;align-items:center;gap:18px;flex-shrink:0}
.lf-mh-ic>button{display:grid}
.lf-mh-chips{display:flex;gap:8px;margin-top:8px}
.lf-mh-chips button{display:inline-flex;align-items:center;gap:4px;border:1px solid rgba(255,255,255,.5);border-radius:999px;padding:6px 14px;font-size:14px;font-weight:500;transition:background-color .15s}
.lf-mh-chips button:active{background:rgba(255,255,255,.15)}
.lf-ph{position:relative;padding-top:108px}
.lf-ph-bleed{position:absolute;top:0;left:0;right:0;height:720px;overflow:hidden;z-index:0;pointer-events:none;-webkit-mask-image:linear-gradient(#000 35%,transparent);mask-image:linear-gradient(#000 35%,transparent)}
.lf-ph-bleed img{width:100%;height:100%;object-fit:cover;filter:blur(48px) saturate(1.7) brightness(.62);transform:scale(1.35)}
.lf-ph-hero{position:relative;z-index:1;display:flex;justify-content:center;margin:4px 16px 28px}
.lf-ph-heroimg{width:100%;max-width:440px;aspect-ratio:.72;height:auto;border-radius:10px;border:1px solid rgba(255,255,255,.16);box-shadow:0 14px 44px rgba(0,0,0,.55);animation:lfRise .6s both}
.lf-ph-herofade{position:absolute;inset:0;z-index:1;background:linear-gradient(transparent 42%,rgba(0,0,0,.35) 60%,rgba(0,0,0,.88))}
.lf-ph-heroinfo{position:absolute;left:0;right:0;bottom:0;z-index:2;display:flex;flex-direction:column;align-items:center;text-align:center;padding:0 16px 16px}
.lf-ph-title{font-family:${FONT_DISPLAY};font-weight:600;text-transform:uppercase;font-size:clamp(44px,14vw,70px);line-height:.88;margin:6px 0 8px;background:linear-gradient(180deg,#fff 45%,#ffd0dc);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 3px 12px rgba(0,0,0,.6));overflow-wrap:anywhere}
.lf-ph-heroinfo .lf-tags{font-size:13px;margin:0 0 14px}
.lf-ph-btns{display:grid;grid-template-columns:1fr 1fr;gap:10px;width:100%}
.lf-ph-btns .lf-btn{font-size:16px;padding:.55em .8em}
.lf-browse.is-phone .lf-rails{position:relative;z-index:1;gap:24px}
.lf-browse.is-phone .lf-row-h{font-size:18px;padding:0 16px;margin-bottom:9px}
.lf-browse.is-phone .lf-row-track{padding:0 16px;scroll-padding:0 16px}
.lf-card-poster .lf-card-img{aspect-ratio:2/3;height:auto;border-radius:4px}
.lf-card-poster.is-cw .lf-card-img{border-radius:4px 4px 0 0}
.lf-card-poster .lf-card-title{font-size:12.5cqw}
.lf-card-hit{display:block;width:100%}
.lf-cw-play{position:absolute;left:50%;top:50%;z-index:3;transform:translate(-50%,-50%);width:42px;height:42px;border-radius:50%;border:2px solid #fff;background:rgba(0,0,0,.45);display:grid;place-items:center}
.lf-cw-play svg{margin-left:3px}
.lf-cw-play.is-big{width:54px;height:54px}
.lf-cw-bar{display:flex;align-items:center;justify-content:space-between;background:#232323;border-radius:0 0 4px 4px;padding:6px 5px;color:#bbb;font-size:12px}
.lf-cw-bar button{display:grid;padding:2px}
.lf-browse.is-phone .lf-row-top10 .lf-num{font-size:84cqw}
.lf-tabs{position:fixed;left:0;right:0;bottom:0;z-index:40;display:flex;justify-content:space-around;background:rgba(18,18,18,.97);border-top:1px solid rgba(255,255,255,.07);padding:7px 0 calc(7px + env(safe-area-inset-bottom,0px))}
.lf-tabs button{display:flex;flex-direction:column;align-items:center;gap:4px;min-width:76px;font-size:10.5px;color:#808080;transition:color .15s}
.lf-tabs button.is-on{color:#fff;font-weight:600}
.lf-tabs button:active svg,.lf-tabs button:active .lf-tab-av{transform:scale(.88)}
.lf-tab-av{outline:2px solid transparent;outline-offset:1px}
.lf-tabs button.is-on .lf-tab-av{outline-color:#fff}
.lf-nh{padding-top:58px}
.lf-nh-chips{position:sticky;top:calc(var(--lf-top) + 56px);z-index:30;display:flex;gap:8px;overflow-x:auto;padding:10px 16px;background:#141414}
.lf-nh-chips button{flex:0 0 auto;display:inline-flex;gap:6px;align-items:center;border-radius:999px;padding:8px 14px;font-weight:700;font-size:14px;background:#2a2a2a;transition:background-color .2s,color .2s}
.lf-nh-chips button.is-on{background:#fff;color:#000}
.lf-nh-sec{padding:6px 0 10px;scroll-margin-top:calc(var(--lf-top) + 116px)}
.lf-nh-h{font-size:18px;font-weight:700;padding:0 16px;margin:18px 0 12px}
.lf-nh-item{display:flex;gap:8px;padding:14px 16px 24px 0}
.lf-nh-sec:first-of-type{padding-top:16px}
.lf-nh-date{flex:0 0 56px;display:flex;flex-direction:column;align-items:center;padding-top:4px}
.lf-nh-date span{font-size:12px;color:#bbb;letter-spacing:.06em}
.lf-nh-date b{font-size:30px;line-height:1.05}
.lf-nh-body{flex:1;min-width:0}
.lf-nh-img{aspect-ratio:16/9;height:auto;border-radius:6px}
.lf-nh-row{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:12px 0 6px}
.lf-nh-logo{flex:1;min-width:0;font-family:${FONT_DISPLAY};font-weight:600;text-transform:uppercase;font-size:21px;line-height:1;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.lf-nh-acts{display:flex;gap:16px}
.lf-nh-acts button{display:flex;flex-direction:column;align-items:center;gap:4px;min-width:48px;font-size:11px;color:#bbb}
.lf-nh-when{font-size:13px;color:#bbb;margin-bottom:8px}
.lf-nh-body h3{font-size:17px;margin:4px 0 6px}
.lf-nh-syn{font-size:13px;color:#bbb;line-height:1.45;margin-bottom:6px}
.lf-nh-watch{padding:0 16px 24px}
.lf-nh-watchimg{display:block;width:100%}
.lf-nh-watchimg .lf-still{aspect-ratio:16/9;height:auto;border-radius:6px}
.lf-nh-watch h3{font-size:17px;margin:10px 0 4px}
.lf-nh-top{list-style:none;padding:0 16px;margin:0}
.lf-nh-top li{display:flex;align-items:center;gap:14px;padding:9px 0;border-bottom:1px solid #262626;font-size:15px;line-height:1.35}
.lf-num.is-sm{flex:0 0 46px;display:block;font-size:46px;line-height:1;text-align:center;-webkit-text-stroke:2px #5d5d5d;margin:0;letter-spacing:-.08em}
.lf-my{padding-top:58px}
.lf-my-prof{display:flex;flex-direction:column;align-items:center;gap:10px;margin:18px 0 24px}
.lf-my-prof button{display:flex;align-items:center;gap:4px;font-size:19px;font-weight:700}
.lf-my-sec{padding:0 16px;margin-bottom:18px}
.lf-my-line{display:flex;align-items:center;gap:12px;width:100%;padding:8px 0;font-size:16px;text-align:left}
.lf-my-line b{flex:1}
.lf-my-line .lf-dim{font-size:12px}
.lf-my-dot{width:34px;height:34px;flex-shrink:0;border-radius:50%;display:grid;place-items:center}
.lf-my-dot.is-red{background:${A}}.lf-my-dot.is-blue{background:#2d6cdf}
.lf-my-notes{list-style:none;padding:0;margin:6px 0 0}
.lf-my-notes li{display:flex;gap:12px;padding:8px 0}
.lf-my .lf-rails,.lf-my .lf-row{margin-bottom:24px}
.lf-reasonposter .lf-art{font-size:11cqw}
.lf-my-back{display:block;margin:10px auto 0;color:#bbb;font-size:14px;text-decoration:underline}

/* ── Web pages ── */
.lf-listpage{padding:108px 4% 20px}
.lf-listpage h1,.lf-page-h{font-size:clamp(24px,2.4vw,40px);font-weight:700;margin-bottom:18px}
.lf-listpage>p{margin:-8px 0 18px}
.lf-listgrid{display:grid;grid-template-columns:repeat(var(--n,5),minmax(0,1fr));gap:3.2vw .5vw;--n:3}
@media (min-width:900px){.lf-listgrid{--n:4}}
@media (min-width:1100px){.lf-listgrid{--n:5}}
@media (min-width:1400px){.lf-listgrid{--n:6}}
.lf-listgrid .lf-card{flex:none;width:auto}
.lf-newweb{padding-top:100px}
.lf-page-h{padding:0 4%}

/* ── Footer ── */
.lf-foot{max-width:1000px;margin:clamp(48px,6vw,90px) auto 0;padding:0 4% 44px;color:#808080;font-size:13px}
.lf-foot-links{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px 18px;margin-bottom:24px}
.lf-foot-links button{color:#808080;font-size:13px;text-align:left}
.lf-foot-links button:hover{text-decoration:underline}
.lf-foot-code{border:1px solid #808080;padding:.5em .6em;color:#808080;margin-bottom:18px;font-size:13px}
.lf-foot-code:hover{color:#fff}

/* ── Snackbar ── */
.lf-snack{position:fixed;left:50%;bottom:28px;z-index:95;transform:translateX(-50%);display:flex;align-items:center;gap:10px;width:max-content;max-width:min(92vw,520px);background:#f4f4f4;color:#141414;border-radius:6px;padding:12px 18px;font-size:14px;font-weight:600;line-height:1.35;box-shadow:0 12px 34px rgba(0,0,0,.5);animation:lfSnack .38s cubic-bezier(.2,1.25,.4,1)}
.lf-snack.is-tabs{bottom:calc(84px + env(safe-area-inset-bottom,0px))}
.lf-snack-ic{font-size:16px}

/* ── Tablet (web shell, touch) ── */
@media (max-width:1099px){
  .lf-nav{height:58px}
  .lf-nav-links,.lf-nav-kids{display:none}
  .lf-nav-browse{display:block}
  .lf-bb{height:62vw}
  .lf-bb-info{width:58%;bottom:28%}
  .lf-bb-side{bottom:28%}
  .lf-rails-lift{margin-top:-7vw}
  .lf-dm-body{padding:0 28px 40px}
  .lf-dm-herotext{left:28px;right:28px}
  .lf-foot-links{grid-template-columns:repeat(3,minmax(0,1fr))}
  .lf-search input{width:140px}
}
@media (max-width:900px){.lf-dm-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}

/* ── Phone ── */
@media (max-width:739px){
  .lf-pp-head{padding:12px 16px;min-height:56px}
  .lf-pp-head .lf-wordmark{display:none}
  .lf-pp-mtitle{display:block;position:absolute;left:50%;transform:translateX(-50%);font-size:17px;font-weight:600;white-space:nowrap}
  .lf-pp-edit{display:flex;align-items:center;gap:6px;font-size:15px;font-weight:600}
  .lf-pp-headR .lf-brandpill{position:absolute;left:14px;top:50%;transform:translateY(-50%)}
  .lf-pp-h1,.lf-pp-manage{display:none}
  .lf-pp-main{padding-bottom:14vh}
  .lf-pp-list{display:grid;grid-template-columns:repeat(2,112px);gap:30px 34px;margin:0}
  .lf-pp-tile{width:112px;gap:8px}
  .lf-pp-av,.lf-pp-av>span,.lf-pp-pen{border-radius:6px}
  .lf-pp-name{color:#e5e5e5;font-size:14px}
  .lf-pp-lock{margin-top:-4px}
  .lf-pin-boxes{gap:10px}
  .lf-brandpill{height:28px;padding:0 9px 0 6px}
  .lf-brandpill-full{display:none}
  .lf-pl-top{padding:10px 8px}
  .lf-pl-bottom{padding:30px 10px 10px}
  .lf-pl-ic{width:40px;height:40px}
  .lf-pl-ic svg{width:24px;height:24px}
  .lf-pl-hidephone{display:none}
  .lf-pl-name{font-size:13px}
  .lf-pl-name b{margin-right:6px}
  .lf-pl-eptitle{display:none}
  .lf-pl-time{font-size:13px;min-width:44px}
  .lf-pl-next{bottom:24%;right:12px;left:12px;max-width:none}
  .lf-pl-nextthumb{width:110px;flex-basis:110px}
  .lf-pl-skip{bottom:24%;right:12px;padding:10px 18px;font-size:14px}
  .lf-pl-sub{bottom:17%;left:5%;right:5%}
  .lf-pl.is-chrome .lf-pl-sub{bottom:26%}
  .lf-pl-panel{left:10px;right:10px;bottom:92px;min-width:0}
  .lf-pl-panel.is-subs{gap:24px}
  .lf-pl-rating{top:12%}
  .lf-cr{grid-template-columns:1fr;grid-template-rows:1fr auto}
  .lf-cr-side{padding:10px 16px 24px}
  .lf-cr-card{padding:22px 20px}
  .lf-cr-heart{font-size:40px}
  .lf-snack{bottom:20px}
}

/* ── Keyframes ── */
@keyframes lfFade{from{opacity:0}}
@keyframes lfRise{from{opacity:0;transform:translateY(14px)}}
@keyframes lfSpin{to{transform:rotate(360deg)}}
@keyframes lfShimmer{from{background-position:100% 0}to{background-position:-50% 0}}
@keyframes lfShake{10%,90%{transform:translateX(-2px)}20%,80%{transform:translateX(4px)}30%,50%,70%{transform:translateX(-8px)}40%,60%{transform:translateX(8px)}}
@keyframes lfWiggle{0%,100%{transform:rotate(0)}20%{transform:rotate(-3deg) scale(1.04)}40%{transform:rotate(3deg)}60%{transform:rotate(-2deg)}80%{transform:rotate(1deg)}}
@keyframes lfPop{from{opacity:0;transform:translateY(10px) scale(.96)}}
@keyframes lfBurst{0%{opacity:1;transform:translate(-50%,-50%) rotate(var(--a)) translateY(0) scale(.6)}100%{opacity:0;transform:translate(-50%,-50%) rotate(var(--a)) translateY(-36px) scale(1.1)}}
@keyframes lfBeat{0%,100%{transform:scale(1)}30%{transform:scale(1.18)}50%{transform:scale(.96)}}
@keyframes lfSubIn{from{opacity:0}}
@keyframes lfLine{from{opacity:0;transform:translateY(12px);filter:blur(4px)}}
@keyframes lfSnack{from{opacity:0;transform:translate(-50%,18px) scale(.95)}}
@keyframes lfGrowY{to{transform:scaleY(1)}}
@keyframes lfGrowX{to{transform:scaleX(1)}}
@keyframes lfFoldIn{to{opacity:.3}}
@keyframes lfHeartPop{to{transform:scale(1)}}
@keyframes lfDive{0%{transform:scale(1);filter:brightness(1)}70%{opacity:1}100%{transform:scale(16);filter:brightness(1.7);opacity:0}}
@keyframes lfStreak{0%{opacity:0;transform:translateX(0) scaleX(.3)}30%{opacity:.95}100%{opacity:0;transform:translateX(var(--dx)) scaleX(2)}}
@keyframes lfKb{from{transform:scale(1)}to{transform:scale(1.08) translateX(-1.5%)}}
@keyframes lfPush{from{transform:scale(1)}to{transform:scale(1.12)}}
@keyframes lfTitleCard{0%{opacity:0;transform:scale(.97)}12%{opacity:1;transform:none}78%{opacity:1}100%{opacity:0}}
@keyframes lfRating{0%{opacity:0;transform:translateX(-12px)}10%{opacity:1;transform:none}85%{opacity:1}100%{opacity:0}}
@keyframes lfFill{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes lfRoll{from{transform:translateY(100vh)}to{transform:translateY(-100%)}}
@keyframes lfModalIn{from{opacity:0;transform:translateY(24px) scale(.94)}}
@keyframes lfSlideUp{from{transform:translateY(40px);opacity:0}}
@keyframes lfPickGrow{from{transform:scale(.72);opacity:.6}}
@keyframes lfHintIn{from{opacity:0;transform:translate(-50%,8px)}}
@keyframes lfBob{0%,100%{margin-top:0}50%{margin-top:-5px}}
@keyframes lfWiden{from{width:0}}
@keyframes lfFloat{0%{opacity:0;transform:translateY(0) rotate(0)}10%{opacity:.7}90%{opacity:.5}100%{opacity:0;transform:translateY(-110vh) rotate(25deg)}}

@media (prefers-reduced-motion:reduce){
  .lf-root *,.lf-root *::before,.lf-root *::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}
}
`;
