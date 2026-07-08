"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/*
 * SubhSandesh — phone-first animated landing (cream / maroon / gold).
 * Faithful port of the interactive phone-UI design, recolored to the real
 * SubhSandesh brand tokens and the app's loaded serif/script fonts.
 * Markup is injected via HTML + the animation controller runs in useEffect,
 * so the imperative demos (typing, dodging "No", confetti, cycling phones)
 * behave exactly as designed. Nav + footer come from the existing app chrome.
 */

const STYLES = `
.ssland{
  --bg:#f5ede6;--text:#2a0a0e;--text-secondary:#6b4545;
  --brand:#3d0c11;--brand-soft:#efe1d4;--rose:#a13540;--gold:#c9a84c;
  --card:#fffdf8;--border:#e7dccd;--radius:20px;
  position:relative;z-index:0;background:var(--bg);color:var(--text);
  font-family:'Lora-fallback',ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
  line-height:1.6;-webkit-font-smoothing:antialiased;width:100%;max-width:100%;overflow-x:clip;
}
.ssland::before{content:'';position:fixed;inset:0;z-index:0;pointer-events:none;transform:translateZ(0);background:
  radial-gradient(48vw 50vh at 0% 0%, rgba(61,12,17,.10), transparent 52%),
  radial-gradient(46vw 48vh at 100% 2%, rgba(161,53,64,.12), transparent 52%),
  radial-gradient(52vw 52vh at 100% 100%, rgba(61,12,17,.08), transparent 54%),
  radial-gradient(48vw 50vh at 0% 100%, rgba(201,168,76,.18), transparent 52%);}
.ssland-body{position:relative;z-index:1;}
.ssland *{box-sizing:border-box;margin:0;padding:0;}
.ssland h1,.ssland h2,.ssland h3,.ssland .display{font-family:var(--font-lora),Georgia,'Times New Roman',serif;letter-spacing:-0.01em;font-weight:600;line-height:1.12;color:var(--brand);}
.ssland a{color:inherit;text-decoration:none;}
.ssland img,.ssland svg,.ssland video,.ssland canvas{max-width:100%;}
.ssland img{display:block;}
.ssland button{font-family:inherit;cursor:pointer;border:none;}
.ssland section{position:relative;padding:88px 0;}
.ssland .wrap{max-width:1160px;margin:0 auto;padding:0 24px;}
.ssland .eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--brand);background:var(--brand-soft);padding:8px 16px;border-radius:999px;margin-bottom:22px;}
.ssland .sub{color:var(--text-secondary);font-size:18px;max-width:560px;}
.ssland a:focus-visible, .ssland button:focus-visible{outline:2.5px solid var(--gold);outline-offset:3px;border-radius:8px;}
.ssland .btn{position:relative;display:inline-flex;align-items:center;gap:10px;padding:16px 32px;font-weight:700;font-size:15px;letter-spacing:.02em;background:transparent;border:none;transition:transform .2s cubic-bezier(.34,1.4,.5,1);white-space:nowrap;cursor:pointer;}
.ssland .btn::before{content:'';position:absolute;z-index:-1;top:0;bottom:0;left:-18px;right:-18px;clip-path:polygon(2% 0%,6% 22%,1% 44%,6% 66%,2% 88%,4% 100%,96% 100%,98% 88%,94% 66%,99% 44%,94% 22%,98% 0%);box-shadow:0 6px 16px rgba(61,12,17,.22);}
.ssland .btn-primary{color:var(--brand);}
.ssland .btn-primary::before{background:linear-gradient(120deg,rgba(255,255,255,.5) 0%,rgba(255,255,255,0) 30%,rgba(255,255,255,0) 70%,rgba(255,255,255,.25) 100%),repeating-linear-gradient(48deg,color-mix(in srgb,var(--gold) 86%,transparent),color-mix(in srgb,var(--gold) 86%,transparent) 12px,var(--gold) 12px,var(--gold) 24px);}
.ssland .btn-primary:hover{transform:translateY(-2px) rotate(-1deg);}
.ssland .btn-primary:active{transform:translateY(0) rotate(0deg);}
.ssland .btn-secondary{color:var(--brand);}
.ssland .btn-secondary::before{background:linear-gradient(120deg,rgba(255,255,255,.5) 0%,rgba(255,255,255,0) 30%,rgba(255,255,255,0) 70%,rgba(255,255,255,.3) 100%),repeating-linear-gradient(48deg,color-mix(in srgb,var(--brand) 26%,white),color-mix(in srgb,var(--brand) 26%,white) 12px,color-mix(in srgb,var(--brand) 40%,white) 12px,color-mix(in srgb,var(--brand) 40%,white) 24px);}
.ssland .btn-secondary:hover{transform:translateY(-2px) rotate(1deg);}
.ssland .reveal{opacity:0;transform:translateY(24px);transition:opacity .6s ease, transform .6s ease;}
.ssland .reveal.in-view{opacity:1;transform:translateY(0);}

/* ===== HERO ===== */
.ssland .hero{min-height:100vh;display:flex;align-items:center;padding-top:104px;padding-bottom:48px;overflow:hidden;}
.ssland .hero > .wrap{width:100%;}
.ssland .blob{position:absolute;border-radius:50%;filter:blur(80px);opacity:.30;z-index:0;animation:ssdrift 16s ease-in-out infinite;will-change:transform;transform:translateZ(0);backface-visibility:hidden;}
.ssland .blob1{width:420px;height:420px;background:var(--brand);top:-120px;left:-100px;opacity:.14;}
.ssland .blob2{width:380px;height:380px;background:var(--rose);top:60px;right:-140px;animation-duration:20s;animation-delay:-4s;opacity:.16;}
.ssland .blob3{width:260px;height:260px;background:var(--gold);bottom:-120px;left:34%;opacity:.24;animation-duration:24s;}
@keyframes ssdrift{0%,100%{transform:translate3d(0,0,0) scale(1);}50%{transform:translate3d(30px,40px,0) scale(1.08);}}
.ssland .hero-inner{position:relative;z-index:1;max-width:1280px;display:grid;grid-template-columns:0.92fr 1.08fr;gap:52px;align-items:center;}
.ssland .hero h1{font-size:clamp(40px,5.2vw,62px);margin-bottom:22px;font-weight:600;line-height:1.07;}
.ssland .hero h1 em{display:inline-block;font-style:italic;background:linear-gradient(120deg,var(--brand),var(--rose));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;padding-right:.22em;margin-right:-.18em;}
.ssland .hero-copy{max-width:520px;}
.ssland .hero-stat{margin-top:30px;font-size:14px;color:var(--text-secondary);display:flex;align-items:center;gap:6px;}
.ssland .hero-ctas{display:flex;gap:56px;margin-top:32px;flex-wrap:wrap;}

/* ===== HERO TABLET ===== */
.ssland .tablet-stage{position:relative;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:8px 0;}
.ssland .tablet-stage::before{content:'';position:absolute;width:80%;height:80%;top:4%;left:10%;border-radius:50%;background:radial-gradient(circle, rgba(201,168,76,0.24), transparent 68%);filter:blur(38px);z-index:0;pointer-events:none;}
.ssland .browserwin{position:relative;z-index:1;width:100%;max-width:800px;background:var(--card);border:1.5px solid var(--border);border-radius:16px;overflow:hidden;box-shadow:0 34px 80px -30px rgba(61,12,17,0.42), 0 2px 8px rgba(61,12,17,0.05);animation:sslaptopfloat 7s ease-in-out infinite;will-change:transform;transform:translateZ(0);backface-visibility:hidden;}
@keyframes sslaptopfloat{0%,100%{transform:translate3d(0,0,0);}50%{transform:translate3d(0,-9px,0);}}
.ssland .win-bar{height:52px;background:#f2e8dd;display:flex;align-items:center;gap:16px;padding:0 18px;border-bottom:1px solid var(--border);}
.ssland .win-dots{display:flex;gap:8px;flex-shrink:0;}
.ssland .win-dots span{width:12px;height:12px;border-radius:50%;}
.ssland .win-dots span:nth-child(1){background:#ec6a5e;}
.ssland .win-dots span:nth-child(2){background:#f4bf4f;}
.ssland .win-dots span:nth-child(3){background:#61c554;}
.ssland .win-url{flex:1;display:flex;align-items:center;justify-content:center;gap:8px;height:34px;padding:0 18px;border-radius:999px;background:#fffdf8;border:1px solid var(--border);font-size:13px;color:var(--text-secondary);font-weight:600;overflow:hidden;white-space:nowrap;}
.ssland .win-url svg{width:13px;height:13px;color:var(--brand);flex-shrink:0;}
.ssland .win-nav{display:flex;align-items:center;gap:15px;flex-shrink:0;color:#9a7070;font-size:16px;}
.ssland .browser-body{position:relative;width:100%;aspect-ratio:4/3;min-height:440px;background:var(--bg);overflow:hidden;padding:26px 34px 22px;display:flex;flex-direction:column;contain:layout paint;}
.ssland .browser-body .demo-stage-wrap{min-height:0;}
.ssland .lp-tag{position:absolute;top:14px;left:16px;display:inline-flex;font-size:11px;font-weight:700;color:var(--brand);background:var(--brand-soft);padding:5px 12px;border-radius:999px;transition:opacity .25s ease;z-index:4;}
.ssland .browser-body.stage3-mode .lp-tag{opacity:0;pointer-events:none;}
.ssland .laptop-caption{margin-top:26px;font-size:12.5px;font-weight:600;color:var(--text-secondary);display:flex;align-items:center;gap:8px;letter-spacing:.02em;}
.ssland .laptop-caption .lc-dot{width:7px;height:7px;border-radius:50%;background:var(--gold);animation:ssdotpulse 1.4s ease-in-out infinite;}
/* landscape stage layout inside the browser */
.ssland .browser-body .stage[data-stage="0"], .ssland .browser-body .stage[data-stage="1"]{align-items:center;text-align:center;}
.ssland .browser-body .stage[data-stage="2"]{align-items:center;}
.ssland .browser-body .chat-label{font-size:14px;margin-bottom:12px;}
.ssland .browser-body .chat-box{max-width:500px;width:100%;font-size:15px;padding:18px 20px;text-align:left;min-height:88px;}
.ssland .browser-body .chat-send{align-self:center;font-size:14px;padding:12px 26px;margin-top:18px;}
.ssland .browser-body .form-title{font-size:16px;text-align:center;margin-bottom:22px;}
.ssland .browser-body .form-field{width:100%;max-width:520px;margin-left:auto;margin-right:auto;margin-bottom:16px;}
.ssland .browser-body .form-field label{font-size:11px;}
.ssland .browser-body .field-value{font-size:15px;}
.ssland .browser-body .field-check{width:18px;height:18px;font-size:10.5px;}
.ssland .browser-body .processing-text{font-size:15px;}
.ssland .browser-body .preview-fullscreen{margin:-26px -34px -22px -34px;}
.ssland .browser-body .preview-banner{height:170px;}
.ssland .browser-body .preview-banner-title{font-size:19px;}
.ssland .browser-body .preview-banner-sub{font-size:11.5px;}
.ssland .browser-body .preview-text{font-size:14px;}
.ssland .browser-body .preview-question{font-size:22px;}
.ssland .browser-body .btn-yes, .ssland .browser-body .btn-no{font-size:13px;padding:10px 24px;}
.ssland .browser-body .preview-body{padding:30px 34px 10px;}
.ssland .browser-body .btn-row-wrap{height:92px;margin-top:12px;}
.ssland .browser-body .preview-footer{padding:24px 20px 30px;}
.ssland .browser-body .mini-gallery span{width:40px;height:40px;border-radius:10px;}
.ssland .browser-body .mini-music{font-size:12px;}
.ssland .browser-body .made-with{font-size:11px;}
.ssland .browser-body.stage3-mode .phone-status{position:absolute;left:50%;bottom:16px;transform:translateX(-50%);z-index:40;margin:0;background:rgba(255,253,248,0.94);padding:8px 18px;border-radius:999px;box-shadow:0 8px 22px rgba(61,12,17,0.16);white-space:nowrap;backdrop-filter:blur(4px);font-size:12px;}
.ssland .demo-stage-wrap{position:relative;flex:1;min-height:360px;transition:margin-top .3s ease;}
.ssland .stage{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;opacity:0;transform:translateY(10px);transition:opacity .4s ease, transform .4s ease;pointer-events:none;}
.ssland .stage.active{opacity:1;transform:translateY(0);pointer-events:auto;}
.ssland .stage[data-stage="3"]{justify-content:flex-start;}
.ssland .chat-label{font-size:11.5px;color:var(--text-secondary);margin-bottom:10px;font-weight:600;}
.ssland .chat-box{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:14px;min-height:78px;font-size:12px;color:var(--text);box-shadow:0 8px 24px rgba(61,12,17,0.06);line-height:1.5;}
.ssland .chat-send{margin-top:14px;align-self:flex-start;background:var(--gold);color:var(--brand);padding:10px 18px;border-radius:12px;font-size:12px;font-weight:700;transition:transform .15s ease;}
.ssland .chat-send.pressed{transform:scale(0.9);}
.ssland .processing-wrap{display:flex;flex-direction:column;align-items:center;text-align:center;}
.ssland .spinner{width:42px;height:42px;border-radius:50%;border:3px solid var(--brand-soft);border-top-color:var(--brand);animation:ssspin 0.85s linear infinite;margin-bottom:16px;}
@keyframes ssspin{from{transform:rotate(0);}to{transform:rotate(360deg);}}
.ssland .processing-text{font-size:12.5px;font-weight:600;color:var(--text);}
.ssland .processing-shimmer{margin-top:16px;width:80%;height:8px;border-radius:6px;background:linear-gradient(90deg,var(--brand-soft) 25%,#fff 37%,var(--brand-soft) 63%);background-size:400% 100%;animation:ssshimmer 1.3s ease infinite;}
@keyframes ssshimmer{0%{background-position:100% 0;}100%{background-position:0 0;}}
.ssland .form-title{font-size:12.5px;font-weight:700;margin-bottom:14px;color:var(--brand);}
.ssland .form-field{margin-bottom:12px;}
.ssland .form-field label{display:block;font-size:9.5px;text-transform:uppercase;letter-spacing:.05em;color:var(--text-secondary);margin-bottom:4px;font-weight:700;}
.ssland .field-value-row{display:flex;align-items:center;gap:6px;border-bottom:1.5px solid var(--border);padding-bottom:6px;}
.ssland .field-value{font-size:12px;color:var(--text);min-height:15px;flex:1;}
.ssland .field-check{width:15px;height:15px;border-radius:50%;background:var(--gold);color:var(--brand);font-size:9px;font-weight:800;display:flex;align-items:center;justify-content:center;opacity:0;transform:scale(0.5);transition:opacity .3s ease, transform .3s cubic-bezier(.34,1.56,.64,1);flex-shrink:0;}
.ssland .field-check.show{opacity:1;transform:scale(1);}
.ssland .field-cursor{display:inline-block;width:2px;height:10px;background:var(--brand);vertical-align:middle;animation:ssblink 1s step-end infinite;}
@keyframes ssblink{50%{opacity:0;}}
.ssland .preview-fullscreen{position:absolute;inset:0;margin:0 -18px -16px -18px;background:var(--card);z-index:1;overflow:hidden;}
.ssland .preview-scroll{height:100%;overflow-y:auto;scrollbar-width:none;}
.ssland .preview-scroll::-webkit-scrollbar{display:none;}
.ssland .preview-banner{height:150px;background:linear-gradient(135deg,var(--brand),var(--rose));display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;position:relative;padding-top:26px;}
.ssland .preview-banner-emoji{font-size:26px;}
.ssland .preview-banner-title{color:#fff;font-family:var(--font-lora),Georgia,serif;font-weight:600;font-size:14px;}
.ssland .preview-banner-sub{color:rgba(255,255,255,0.85);font-size:10px;}
.ssland .preview-body{padding:20px 22px 6px;text-align:center;}
.ssland .preview-text{font-size:11.5px;color:var(--text-secondary);margin-bottom:14px;line-height:1.6;}
.ssland .preview-question{font-family:var(--font-lora),Georgia,serif;font-weight:600;font-size:16px;margin-bottom:6px;color:var(--brand);}
.ssland .btn-row-wrap{position:relative;height:76px;margin-top:6px;}
.ssland .btn-yes, .ssland .btn-no{position:absolute;top:22px;padding:9px 18px;border-radius:999px;font-size:12px;font-weight:700;}
.ssland .btn-yes{left:28%;background:var(--gold);color:var(--brand);z-index:2;transition:transform .15s ease;}
.ssland .btn-no{right:28%;background:transparent;color:var(--text-secondary);border:1.3px solid var(--border);transition:left .35s cubic-bezier(.34,1.56,.64,1), top .35s cubic-bezier(.34,1.56,.64,1), right .35s ease;}
.ssland .btn-yes.tapped{transform:scale(0.9);}
.ssland .preview-footer{padding:20px;text-align:center;border-top:1px solid var(--border);margin-top:16px;}
.ssland .mini-gallery{display:flex;justify-content:center;gap:6px;margin-bottom:10px;}
.ssland .mini-gallery span{width:34px;height:34px;border-radius:8px;display:inline-block;}
.ssland .mini-gallery span:nth-child(1){background:linear-gradient(135deg,var(--brand),var(--rose));}
.ssland .mini-gallery span:nth-child(2){background:linear-gradient(135deg,var(--rose),var(--gold));}
.ssland .mini-gallery span:nth-child(3){background:linear-gradient(135deg,var(--gold),var(--brand));}
.ssland .mini-music{font-size:10.5px;color:var(--text-secondary);margin-bottom:6px;}
.ssland .made-with{font-size:9.5px;color:#b8a89a;font-weight:600;}
.ssland .celebrate-backdrop{position:absolute;inset:0;background:rgba(61,12,17,0.5);backdrop-filter:blur(2px);display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity .3s ease;z-index:50;}
.ssland .celebrate-backdrop.show{opacity:1;pointer-events:auto;}
.ssland .celebrate-modal{background:#FFFDF6;border-radius:22px;padding:26px 22px 22px;width:76%;text-align:center;box-shadow:0 30px 70px rgba(0,0,0,0.3);position:relative;transform:scale(0.55) translateY(10px);opacity:0;transition:transform .5s cubic-bezier(.34,1.56,.64,1), opacity .3s ease;}
.ssland .celebrate-backdrop.show .celebrate-modal{transform:scale(1) translateY(0);opacity:1;}
.ssland .celebrate-kitty-wrap{position:relative;display:inline-block;}
.ssland .celebrate-kitty{font-size:50px;display:inline-block;animation:sskittybounce 1s ease-in-out infinite;}
@keyframes sskittybounce{0%,100%{transform:translateY(0) rotate(-4deg);}50%{transform:translateY(-9px) rotate(4deg);}}
.ssland .float-heart{position:absolute;font-size:14px;opacity:0.9;animation:ssfloatheart 1.8s ease-in-out infinite;}
.ssland .float-heart.h1{top:-6px;left:-14px;animation-delay:0s;}
.ssland .float-heart.h2{top:-10px;right:-16px;animation-delay:.4s;}
.ssland .float-heart.h3{bottom:-4px;right:-10px;animation-delay:.8s;font-size:11px;}
@keyframes ssfloatheart{0%,100%{transform:translateY(0);opacity:0.9;}50%{transform:translateY(-8px);opacity:1;}}
.ssland .celebrate-title{font-family:var(--font-lora),Georgia,serif;font-weight:600;font-size:17px;margin-top:10px;color:var(--brand);}
.ssland .celebrate-stamp{display:inline-block;margin-top:8px;background:var(--gold);color:var(--brand);font-size:10.5px;font-weight:800;padding:5px 12px;border-radius:999px;transform:rotate(-3deg);}
.ssland .celebrate-msg{margin-top:14px;font-family:var(--font-dancing),cursive;font-size:19px;color:#3a2226;line-height:1.35;}
.ssland .celebrate-sign{display:block;margin-top:2px;font-family:var(--font-dancing),cursive;font-size:17px;color:#3a2226;}
.ssland .confetti-piece{position:absolute;width:6px;height:10px;border-radius:2px;left:50%;top:-10px;pointer-events:none;animation:ssconfetti-fall 1.6s ease-in forwards;z-index:55;}
@keyframes ssconfetti-fall{ to{ transform:translate(var(--tx),var(--ty)) rotate(var(--rot)); opacity:0; } }
.ssland .tap-ripple{position:absolute;width:34px;height:34px;border-radius:50%;background:rgba(61,12,17,0.28);transform:translate(-50%,-50%) scale(0.4);pointer-events:none;animation:sstapfade .55s ease-out forwards;z-index:20;}
@keyframes sstapfade{ to{ transform:translate(-50%,-50%) scale(1.6); opacity:0; } }
.ssland .phone-status{margin-top:12px;font-size:11px;color:var(--brand);font-weight:600;text-align:center;min-height:16px;display:flex;align-items:center;justify-content:center;gap:6px;position:relative;z-index:2;}
.ssland .phone-status .status-dot{width:6px;height:6px;border-radius:50%;background:var(--brand);animation:ssdotpulse 1s ease-in-out infinite;}
@keyframes ssdotpulse{0%,100%{opacity:.4;}50%{opacity:1;}}
.ssland .phone-status.done{color:#3f7d52;}
.ssland .phone-status.done .status-dot{background:#3f7d52;animation:none;}

/* ===== PROBLEM ===== */
.ssland .problem-split{display:grid;grid-template-columns:0.85fr 1.15fr;gap:56px;align-items:center;margin-top:48px;}
.ssland .problem-phone-frame{width:290px;height:592px;margin:0 auto;position:relative;z-index:1;background:linear-gradient(155deg,#3a3a40,#111113 55%,#2b2b30);border-radius:46px;padding:12px;box-shadow:0 40px 80px -20px rgba(61,12,17,0.35), 0 0 0 2px rgba(255,255,255,0.06) inset;}
.ssland .problem-phone-frame::before{content:'';position:absolute;left:-3px;top:120px;width:3px;height:26px;background:#0e0e10;border-radius:2px 0 0 2px;}
.ssland .problem-phone-frame::after{content:'';position:absolute;right:-3px;top:160px;width:3px;height:48px;background:#0e0e10;border-radius:0 2px 2px 0;}
.ssland .problem-phone-screen{position:relative;width:100%;height:100%;background:#fff;border-radius:36px;overflow:hidden;contain:layout paint;}
.ssland .problem-phone-island{position:absolute;top:11px;left:50%;transform:translateX(-50%);width:86px;height:24px;background:#000;border-radius:16px;z-index:20;}
.ssland .p-stage{position:absolute;inset:0;opacity:0;transform:translateX(14px);transition:opacity .45s ease, transform .45s ease;pointer-events:none;}
.ssland .p-stage.active{opacity:1;transform:translateX(0);pointer-events:auto;}
.ssland .wa-header{background:#075E54;color:#fff;padding:44px 14px 12px;display:flex;align-items:center;gap:10px;}
.ssland .wa-back{font-size:15px;line-height:1;}
.ssland .wa-avatar{width:28px;height:28px;border-radius:50%;background:#128C7E;display:flex;align-items:center;justify-content:center;font-size:10.5px;font-weight:700;color:#fff;flex-shrink:0;}
.ssland .wa-title{flex:1;min-width:0;}
.ssland .wa-name{font-size:12px;font-weight:700;}
.ssland .wa-sub{font-size:9px;opacity:.8;}
.ssland .wa-icons{display:flex;gap:12px;font-size:13px;opacity:.9;}
.ssland .wa-list-body{background:#fff;height:calc(100% - 80px);overflow:hidden;position:relative;}
.ssland .wa-list-row{display:flex;align-items:center;gap:10px;padding:9px 12px;border-bottom:1px solid #f0f0f0;background:#fff;}
.ssland .wa-list-avatar{width:34px;height:34px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:#fff;font-size:11.5px;font-weight:700;}
.ssland .wa-list-meta{flex:1;min-width:0;}
.ssland .wa-list-name{font-size:11.5px;font-weight:700;color:#111;}
.ssland .wa-list-preview{font-size:10px;color:#075E54;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.ssland .wa-list-right{display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0;}
.ssland .wa-list-time{font-size:9px;color:#999;}
.ssland .wa-list-badge{background:#25D366;color:#fff;font-size:8.5px;font-weight:700;border-radius:999px;padding:1px 6px;}
.ssland .wa-fab{position:absolute;bottom:14px;right:14px;width:38px;height:38px;border-radius:50%;background:#25D366;display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;box-shadow:0 6px 14px rgba(0,0,0,0.25);z-index:2;}
.ssland .wa-chat-body{background:#ECE5DD;height:calc(100% - 80px);padding:14px 10px;}
.ssland .wa-bubble{background:#DCF8C6;border-radius:10px 10px 2px 10px;padding:7px;max-width:82%;margin-left:auto;box-shadow:0 1px 2px rgba(0,0,0,0.1);}
.ssland .wa-bubble-img{height:84px;border-radius:7px;background:linear-gradient(135deg,#d9d9de,#c7c7cf);display:flex;align-items:center;justify-content:center;font-size:28px;margin-bottom:6px;}
.ssland .wa-bubble-caption{font-size:11px;color:#111;line-height:1.4;}
.ssland .wa-bubble-time{font-size:8.5px;color:#667781;text-align:right;margin-top:4px;}
.ssland .wa-wrong-tag{display:inline-flex;align-items:center;gap:4px;margin-top:10px;background:#fbeaec;color:var(--rose);font-size:9.5px;font-weight:700;padding:4px 9px;border-radius:8px;}
.ssland .post-header{background:#fff;padding:44px 14px 12px;display:flex;align-items:center;gap:10px;box-shadow:0 1px 0 rgba(61,12,17,0.06);position:relative;z-index:2;}
.ssland .wa-back-btn{width:26px;height:26px;border-radius:50%;background:var(--brand-soft);color:var(--brand);display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;}
.ssland .post-header .wa-name{color:var(--text);font-size:13px;}
.ssland .post-header .wa-sub{color:var(--text-secondary);font-size:9.5px;}
.ssland .post-img-full{height:76px;background:linear-gradient(135deg,var(--brand),var(--rose));position:relative;display:flex;align-items:flex-end;padding:8px 12px;}
.ssland .post-likes{color:#fff;font-size:10px;font-weight:700;background:rgba(0,0,0,0.25);padding:3px 8px;border-radius:999px;}
.ssland .comments-list{background:#fff;}
.ssland .comment-row{display:flex;gap:9px;padding:10px 14px;align-items:flex-start;border-bottom:1px solid #f4f3f0;}
.ssland .comment-row.mine{background:var(--brand-soft);border-left:3px solid var(--brand);padding-left:11px;}
.ssland .c-avatar{width:24px;height:24px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#fff;}
.ssland .c-body{flex:1;min-width:0;}
.ssland .c-top-row{display:flex;align-items:center;gap:6px;}
.ssland .c-user{font-size:10.5px;font-weight:700;color:var(--text);}
.ssland .c-time{font-size:9px;color:#aaa;}
.ssland .c-text{font-size:10.5px;color:var(--text-secondary);margin-top:2px;line-height:1.4;}
.ssland .c-like{font-size:10px;color:#ccc;flex-shrink:0;align-self:center;}
.ssland .c-mine-badge{font-size:8px;font-weight:800;color:#fff;background:var(--brand);padding:2px 7px;border-radius:999px;flex-shrink:0;align-self:center;letter-spacing:.02em;}
.ssland .post-more-row{padding:12px 14px;font-size:10.5px;font-weight:700;color:var(--brand);text-align:center;border-top:1px solid var(--border);background:#fff;}
.ssland .problem-cards{display:flex;flex-direction:column;gap:16px;padding:4px 0;}
.ssland .p-card{position:relative;background:var(--card);border:1px solid var(--border);border-radius:18px;padding:24px 30px;cursor:pointer;opacity:.5;box-shadow:0 2px 8px rgba(61,12,17,.04);transition:opacity .45s ease, border-color .45s ease, box-shadow .45s ease, transform .45s cubic-bezier(.34,1.4,.5,1);}
.ssland .p-card::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;border-radius:18px 0 0 18px;background:var(--gold);opacity:0;transition:opacity .45s ease;}
.ssland .p-card.active{opacity:1;border-color:rgba(201,168,76,.7);box-shadow:0 16px 40px -18px rgba(61,12,17,.26);transform:translateX(6px);}
.ssland .p-card.active::before{opacity:1;}
.ssland .p-medium{display:flex;width:fit-content;align-items:center;gap:8px;font-family:ui-sans-serif,system-ui,sans-serif;font-size:10.5px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--text-secondary);margin-bottom:12px;}
.ssland .p-medium .dotm{width:6px;height:6px;border-radius:50%;background:var(--rose);transition:background .45s ease;}
.ssland .p-card.active .p-medium .dotm{background:var(--gold);}
.ssland .p-headline{font-family:var(--font-lora),Georgia,serif;font-weight:600;font-size:clamp(18px,2vw,23px);color:var(--brand);line-height:1.2;margin-bottom:10px;}
.ssland .p-card p{color:var(--text-secondary);font-size:14px;line-height:1.55;}
@keyframes ssmarkerDraw{to{stroke-dashoffset:0;}}
.ssland .feat-icon{width:44px;height:44px;border-radius:12px;background:var(--brand-soft);display:flex;align-items:center;justify-content:center;color:var(--brand);flex-shrink:0;}

/* ===== FEATURES ===== */
.ssland .feature-split{display:grid;grid-template-columns:1.15fr 0.85fr;gap:56px;align-items:center;margin-top:48px;}
.ssland .feature-cards{display:flex;flex-direction:column;gap:40px;padding:14px 8px 8px;}
.ssland .f-card{position:relative;background-image:radial-gradient(rgba(61,12,17,0.03) 1px,transparent 1px);background-size:14px 14px;border:1px solid rgba(61,12,17,.08);border-radius:0;padding:22px 30px 22px 22px;cursor:pointer;display:flex;gap:18px;align-items:center;transform:rotate(var(--rot,-1deg)) scale(.965);transform-origin:left center;transition:transform .5s cubic-bezier(.34,1.4,.5,1);}
.ssland .f-card:nth-child(1){--rot:2.8deg;background-color:#efe1d4;}
.ssland .f-card:nth-child(2){--rot:-2.4deg;background-color:#f3e0dd;}
.ssland .f-card:nth-child(3){--rot:2.2deg;background-color:#efe9d3;}
.ssland .f-card:nth-child(4){--rot:-2deg;background-color:#f6ecd6;}
.ssland .f-card.active{opacity:1;filter:none;}
.ssland .f-card:nth-child(1).active{transform:rotate(-0.5deg) scale(1);}
.ssland .f-card:nth-child(2).active{transform:rotate(0.4deg) scale(1);}
.ssland .f-card:nth-child(3).active{transform:rotate(-0.3deg) scale(1);}
.ssland .f-card:nth-child(4).active{transform:rotate(0.3deg) scale(1);}
.ssland .f-card::after{content:'';position:absolute;bottom:0;right:0;width:0;height:0;border-style:solid;border-width:0 0 18px 18px;border-color:transparent transparent rgba(61,12,17,.10) transparent;}
.ssland .f-card::before{content:'';position:absolute;width:100px;height:28px;clip-path:polygon(2% 0%,6% 22%,1% 44%,6% 66%,2% 88%,4% 100%,96% 100%,98% 88%,94% 66%,99% 44%,94% 22%,98% 0%);z-index:2;background:linear-gradient(120deg,rgba(255,255,255,.4) 0%,rgba(255,255,255,0) 30%,rgba(255,255,255,0) 70%,rgba(255,255,255,.22) 100%),repeating-linear-gradient(46deg,color-mix(in srgb,var(--rose) 84%,transparent),color-mix(in srgb,var(--rose) 84%,transparent) 6px,var(--rose) 6px,var(--rose) 12px);}
.ssland .f-card:nth-child(1)::before{top:-6px;left:-40px;transform:rotate(-20deg);}
.ssland .f-card:nth-child(2)::before{top:-6px;right:-40px;transform:rotate(18deg);background:linear-gradient(120deg,rgba(255,255,255,.4) 0%,rgba(255,255,255,0) 30%,rgba(255,255,255,0) 70%,rgba(255,255,255,.22) 100%),repeating-linear-gradient(46deg,color-mix(in srgb,var(--gold) 84%,transparent),color-mix(in srgb,var(--gold) 84%,transparent) 6px,var(--gold) 6px,var(--gold) 12px);}
.ssland .f-card:nth-child(3)::before{top:-6px;left:-40px;transform:rotate(-15deg);background:linear-gradient(120deg,rgba(255,255,255,.4) 0%,rgba(255,255,255,0) 30%,rgba(255,255,255,0) 70%,rgba(255,255,255,.22) 100%),repeating-linear-gradient(46deg,color-mix(in srgb,var(--brand) 84%,transparent),color-mix(in srgb,var(--brand) 84%,transparent) 6px,var(--brand) 6px,var(--brand) 12px);}
.ssland .f-card:nth-child(4)::before{top:-6px;right:-40px;transform:rotate(16deg);background:linear-gradient(120deg,rgba(255,255,255,.4) 0%,rgba(255,255,255,0) 30%,rgba(255,255,255,0) 70%,rgba(255,255,255,.22) 100%),repeating-linear-gradient(46deg,color-mix(in srgb,var(--rose) 78%,transparent),color-mix(in srgb,var(--rose) 78%,transparent) 6px,var(--rose) 6px,var(--rose) 12px);}
.ssland .f-index{position:absolute;top:6px;right:16px;font-family:var(--font-lora),Georgia,serif;font-weight:700;font-size:40px;line-height:1;color:var(--brand);opacity:.1;transition:opacity .4s ease, transform .4s ease;pointer-events:none;}
.ssland .f-card.active .f-index{opacity:.2;transform:scale(1.05);}
.ssland .f-card .feat-icon{width:54px;height:54px;border-radius:16px;margin-bottom:0;flex-shrink:0;background:rgba(255,255,255,.6);color:var(--brand);}
.ssland .f-body h3{position:relative;display:inline-block;font-size:17px;margin-bottom:9px;transition:color .3s ease;color:var(--brand);}
.ssland .f-card.active .f-body h3{color:var(--rose);}
.ssland .f-underline{position:absolute;left:-6px;bottom:-7px;width:calc(100% + 12px);height:16px;overflow:visible;pointer-events:none;}
.ssland .f-underline path{fill:none;stroke:var(--gold);stroke-width:3.4;stroke-linecap:round;stroke-dasharray:1;stroke-dashoffset:1;filter:drop-shadow(0 0 2px rgba(201,168,76,.45));}
.ssland .f-card.active .f-underline path{animation:ssmarkerDraw .55s ease forwards .18s;}
.ssland .f-body p{font-size:13.5px;color:var(--text-secondary);line-height:1.55;}
.ssland .f-stage{position:absolute;inset:0;opacity:0;transform:translateX(-14px);transition:opacity .45s ease, transform .45s ease;pointer-events:none;}
.ssland .f-stage.active{opacity:1;transform:translateX(0);pointer-events:auto;}
.ssland .f-header{background:#fff;padding:44px 14px 12px;display:flex;flex-direction:column;box-shadow:0 1px 0 rgba(61,12,17,0.06);position:relative;z-index:2;}
.ssland .f-header-title{font-family:var(--font-lora),Georgia,serif;font-weight:600;font-size:13px;color:var(--text);}
.ssland .f-header-sub{font-size:9.5px;color:var(--text-secondary);margin-top:1px;}
.ssland .gallery-grid{padding:12px;display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}
.ssland .gallery-thumb{aspect-ratio:1;border-radius:10px;opacity:0;transform:scale(0.85);transition:opacity .4s ease, transform .4s ease;}
.ssland .gallery-thumb.show{opacity:1;transform:scale(1);}
.ssland .music-wrap{padding:26px 24px;display:flex;flex-direction:column;align-items:center;text-align:center;}
.ssland .album-art{width:120px;height:120px;border-radius:16px;background:linear-gradient(135deg,var(--brand),var(--rose));display:flex;align-items:center;justify-content:center;font-size:34px;box-shadow:0 14px 30px rgba(61,12,17,0.3);margin-bottom:18px;}
.ssland .music-title{font-family:var(--font-lora),Georgia,serif;font-weight:600;font-size:15px;color:var(--brand);}
.ssland .music-artist{font-size:11px;color:var(--text-secondary);margin-top:2px;}
.ssland .music-progress{width:100%;height:4px;background:var(--border);border-radius:3px;margin-top:18px;position:relative;overflow:hidden;}
.ssland .music-progress-fill{position:absolute;left:0;top:0;height:100%;width:35%;background:var(--brand);border-radius:3px;}
.ssland .music-times{display:flex;justify-content:space-between;width:100%;font-size:9px;color:#b8a89a;margin-top:4px;}
.ssland .music-controls{display:flex;align-items:center;gap:20px;margin-top:16px;}
.ssland .music-controls span{font-size:16px;color:var(--text-secondary);}
.ssland .music-play{width:44px;height:44px;border-radius:50%;background:var(--brand);color:#fff;display:flex;align-items:center;justify-content:center;font-size:16px;}
.ssland .music-eq{display:flex;gap:3px;align-items:flex-end;height:16px;margin-top:16px;}
.ssland .music-eq span{width:3px;background:var(--rose);border-radius:2px;animation:ssmusiceq 0.9s ease-in-out infinite;}
.ssland .music-eq span:nth-child(2){animation-delay:.2s;}
.ssland .music-eq span:nth-child(3){animation-delay:.4s;}
.ssland .music-eq span:nth-child(4){animation-delay:.1s;}
@keyframes ssmusiceq{0%,100%{height:4px;}50%{height:16px;}}
.ssland .ai-mini-wrap{padding:22px 20px;}
.ssland .ai-mini-chip{display:inline-flex;font-size:10px;font-weight:600;color:var(--brand);background:var(--brand-soft);padding:6px 12px;border-radius:999px;margin-bottom:16px;}
.ssland .ai-mini-box{background:var(--bg);border:1px solid var(--border);border-radius:14px;padding:14px;min-height:90px;font-size:11.5px;color:var(--text);line-height:1.6;}
.ssland .ai-mini-shimmer{margin-top:14px;height:8px;border-radius:5px;background:linear-gradient(90deg,var(--brand-soft) 25%,#fff 37%,var(--brand-soft) 63%);background-size:400% 100%;animation:ssshimmer 1.3s ease infinite;}
.ssland .countdown-wrap{padding:30px 20px;text-align:center;}
.ssland .countdown-event{font-family:var(--font-lora),Georgia,serif;font-weight:600;font-size:14px;margin-bottom:18px;color:var(--brand);}
.ssland .countdown-digits{display:flex;justify-content:center;gap:8px;}
.ssland .cd-box{background:var(--brand);color:#fff;border-radius:10px;padding:10px 8px;min-width:42px;}
.ssland .cd-num{font-family:var(--font-lora),Georgia,serif;font-weight:700;font-size:16px;}
.ssland .cd-label{font-size:8px;opacity:.8;margin-top:2px;}
.ssland .countdown-sub{margin-top:18px;font-size:10.5px;color:var(--text-secondary);}

/* ===== LIVE DEMO ===== */
.ssland .demo-card{position:relative;max-width:1040px;margin:48px auto 0;background:var(--card);border:1px solid var(--border);border-radius:28px;padding:40px 56px 32px;text-align:center;box-shadow:0 20px 60px rgba(61,12,17,0.06);}
.ssland .ai-demo{display:grid;grid-template-columns:1fr 60px 1fr;gap:22px;align-items:start;text-align:left;margin:28px 0 4px;}
.ssland .ai-col{min-width:0;}
.ssland .ai-demo-tag{display:inline-block;font-family:ui-sans-serif,system-ui,sans-serif;font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;font-weight:700;color:var(--text-secondary);margin-bottom:11px;}
.ssland .ai-demo-tag.gold{color:var(--brand);}
.ssland .ai-connector{align-self:stretch;position:relative;display:flex;align-items:center;justify-content:center;}
.ssland .ai-connector::before{content:'';position:absolute;top:10px;bottom:6px;width:1.5px;background:rgba(201,168,76,.38);}
.ssland .ai-spark{position:relative;z-index:1;width:32px;height:32px;border-radius:50%;background:var(--card);border:1.5px solid rgba(201,168,76,.55);color:var(--gold);display:flex;align-items:center;justify-content:center;font-size:14px;animation:ssaispark 2.6s ease-in-out infinite;}
@keyframes ssaispark{0%,100%{transform:scale(1) rotate(0deg);}50%{transform:scale(1.16) rotate(140deg);}}
.ssland .tape{position:absolute;width:124px;height:36px;z-index:4;box-shadow:0 3px 8px rgba(61,12,17,.16);clip-path:polygon(2% 0%,6% 22%,1% 44%,6% 66%,2% 88%,4% 100%,96% 100%,98% 88%,94% 66%,99% 44%,94% 22%,98% 0%);}
.ssland .tp-tl{top:-10px;left:-52px;transform:rotate(-42deg);background:linear-gradient(120deg,rgba(255,255,255,.4) 0%,rgba(255,255,255,0) 26%,rgba(255,255,255,0) 74%,rgba(255,255,255,.28) 100%),repeating-linear-gradient(44deg,color-mix(in srgb,var(--brand) 46%,transparent),color-mix(in srgb,var(--brand) 46%,transparent) 6px,color-mix(in srgb,var(--brand) 68%,transparent) 6px,color-mix(in srgb,var(--brand) 68%,transparent) 12px);}
.ssland .tp-tr{top:-10px;right:-52px;transform:rotate(42deg);background:linear-gradient(120deg,rgba(255,255,255,.4) 0%,rgba(255,255,255,0) 26%,rgba(255,255,255,0) 74%,rgba(255,255,255,.28) 100%),repeating-linear-gradient(44deg,color-mix(in srgb,var(--rose) 46%,transparent),color-mix(in srgb,var(--rose) 46%,transparent) 6px,color-mix(in srgb,var(--rose) 68%,transparent) 6px,color-mix(in srgb,var(--rose) 68%,transparent) 12px);}
.ssland .tp-bl{bottom:-10px;left:-52px;transform:rotate(42deg);background:linear-gradient(120deg,rgba(255,255,255,.4) 0%,rgba(255,255,255,0) 26%,rgba(255,255,255,0) 74%,rgba(255,255,255,.28) 100%),repeating-linear-gradient(44deg,color-mix(in srgb,var(--rose) 46%,transparent),color-mix(in srgb,var(--rose) 46%,transparent) 6px,color-mix(in srgb,var(--rose) 68%,transparent) 6px,color-mix(in srgb,var(--rose) 68%,transparent) 12px);}
.ssland .tp-br{bottom:-10px;right:-52px;transform:rotate(-42deg);background:linear-gradient(120deg,rgba(255,255,255,.4) 0%,rgba(255,255,255,0) 26%,rgba(255,255,255,0) 74%,rgba(255,255,255,.28) 100%),repeating-linear-gradient(44deg,color-mix(in srgb,var(--brand) 46%,transparent),color-mix(in srgb,var(--brand) 46%,transparent) 6px,color-mix(in srgb,var(--brand) 68%,transparent) 6px,color-mix(in srgb,var(--brand) 68%,transparent) 12px);}
.ssland .ai-input{background:var(--bg);border:1px solid var(--border);border-radius:14px;padding:16px 18px;font-size:15px;color:var(--text);min-height:24px;}
.ssland .ai-generating{margin-top:18px;font-size:13px;color:var(--brand);font-weight:600;display:none;align-items:center;gap:10px;}
.ssland .ai-generating.show{display:flex;}
.ssland .shimmer-bar{flex:1;height:8px;border-radius:6px;background:linear-gradient(90deg,var(--brand-soft) 25%, #ffffff 37%, var(--brand-soft) 63%);background-size:400% 100%;animation:ssshimmer 1.4s ease infinite;}
.ssland .ai-result{margin-top:6px;font-size:15.5px;color:var(--text);line-height:1.75;}
.ssland .ai-result .line{opacity:0;transform:translateY(6px);transition:opacity .5s ease, transform .5s ease;}
.ssland .ai-result .line.show{opacity:1;transform:translateY(0);}
.ssland .ai-caption{text-align:center;margin-top:26px;font-size:13px;color:var(--text-secondary);}
.ssland .cursor{display:inline-block;width:2px;height:12px;background:var(--brand);margin-left:2px;vertical-align:middle;animation:ssblink 1s step-end infinite;}

/* ===== HOW IT WORKS ===== */
.ssland .steps-split{display:grid;grid-template-columns:0.85fr 1.15fr;gap:56px;align-items:center;margin-top:48px;}
.ssland .step-cards{display:flex;flex-direction:column;gap:40px;}
.ssland .step-card{position:relative;background:color-mix(in srgb, var(--u,#3d0c11) 12%, #fff);background-image:radial-gradient(rgba(61,12,17,0.03) 1px,transparent 1px);background-size:14px 14px;border:1px solid rgba(61,12,17,.08);border-radius:0;padding:26px 30px 24px 30px;transform:rotate(var(--srot,0deg)) scale(.98);transform-origin:left center;transition:transform .4s cubic-bezier(.34,1.4,.5,1);cursor:pointer;}
.ssland .step-card:nth-child(1){--srot:2.6deg;}
.ssland .step-card:nth-child(2){--srot:-2.3deg;}
.ssland .step-card:nth-child(3){--srot:2deg;}
.ssland .step-card.active{transform:rotate(var(--srot,0deg)) scale(1);opacity:1;filter:none;}
.ssland .step-card::after{content:'';position:absolute;bottom:0;right:0;width:0;height:0;border-style:solid;border-width:0 0 18px 18px;border-color:transparent transparent rgba(61,12,17,.10) transparent;}
.ssland .step-card::before{content:'';position:absolute;width:100px;height:28px;clip-path:polygon(2% 0%,6% 22%,1% 44%,6% 66%,2% 88%,4% 100%,96% 100%,98% 88%,94% 66%,99% 44%,94% 22%,98% 0%);z-index:2;background:linear-gradient(120deg,rgba(255,255,255,.4) 0%,rgba(255,255,255,0) 30%,rgba(255,255,255,0) 70%,rgba(255,255,255,.22) 100%),repeating-linear-gradient(46deg,color-mix(in srgb,var(--u,#3d0c11) 70%,transparent),color-mix(in srgb,var(--u,#3d0c11) 70%,transparent) 6px,var(--u,#3d0c11) 6px,var(--u,#3d0c11) 12px);}
.ssland .step-card:nth-child(1)::before{top:-6px;left:-40px;transform:rotate(-20deg);}
.ssland .step-card:nth-child(2)::before{top:-6px;right:-40px;transform:rotate(18deg);}
.ssland .step-card:nth-child(3)::before{top:-6px;left:-40px;transform:rotate(-15deg);}
.ssland .step-num{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;background:var(--u,#3d0c11);color:#fff;font-family:var(--font-lora),Georgia,serif;font-weight:700;font-size:13px;margin-bottom:14px;opacity:.55;transition:opacity .35s ease, transform .35s ease;}
.ssland .step-card.active .step-num{opacity:1;transform:scale(1.08);}
.ssland .step-card h3{position:relative;display:inline-block;font-size:20px;margin-bottom:12px;color:var(--brand);}
.ssland .step-card p{font-size:14.5px;color:var(--text-secondary);max-width:440px;line-height:1.6;}
.ssland .s-underline{position:absolute;left:-5px;bottom:-9px;width:calc(100% + 10px);height:15px;overflow:visible;pointer-events:none;}
.ssland .s-underline path{fill:none;stroke:var(--u,#3d0c11);stroke-width:3;stroke-linecap:round;stroke-dasharray:1;stroke-dashoffset:1;}
.ssland .step-card.active .s-underline path{animation:ssmarkerDraw .6s ease forwards .2s;}
.ssland .s-stage{position:absolute;inset:0;opacity:0;transform:translateX(-14px);transition:opacity .45s ease, transform .45s ease;pointer-events:none;}
.ssland .s-stage.active{opacity:1;transform:translateX(0);pointer-events:auto;}
.ssland .occasion-grid{padding:16px;display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.ssland .occasion-card{background:#fff;border:1.5px solid var(--border);border-radius:14px;padding:14px 10px;text-align:center;opacity:0;transform:scale(0.9);transition:opacity .35s ease, transform .35s ease, border-color .3s ease;}
.ssland .occasion-card.show{opacity:1;transform:scale(1);}
.ssland .occasion-card.selected{border-color:var(--brand);background:var(--brand-soft);}
.ssland .occasion-emoji{font-size:22px;margin-bottom:6px;}
.ssland .occasion-name{font-size:10.5px;font-weight:700;color:var(--text);}
.ssland .occasion-check{display:inline-block;margin-top:4px;font-size:9px;color:var(--brand);font-weight:800;opacity:0;transition:opacity .3s ease;}
.ssland .occasion-card.selected .occasion-check{opacity:1;}
.ssland .editor-wrap{padding:20px 16px;}
.ssland .editor-label{font-size:10px;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px;}
.ssland .photo-row{display:flex;gap:8px;margin-bottom:18px;}
.ssland .photo-slot{width:44px;height:44px;border-radius:10px;flex-shrink:0;}
.ssland .photo-slot.add{border:1.5px dashed var(--border);display:flex;align-items:center;justify-content:center;color:var(--brand);font-size:16px;background:#fff;}
.ssland .song-row{display:flex;align-items:center;gap:10px;background:#fff;border:1px solid var(--border);border-radius:12px;padding:10px 12px;margin-bottom:18px;}
.ssland .song-row .note{font-size:16px;}
.ssland .song-row-text{flex:1;}
.ssland .song-row-title{font-size:11px;font-weight:700;}
.ssland .song-row-artist{font-size:9.5px;color:var(--text-secondary);}
.ssland .ai-toggle-row{display:flex;align-items:center;justify-content:space-between;background:#fff;border:1px solid var(--border);border-radius:12px;padding:10px 12px;}
.ssland .ai-toggle-label{font-size:11px;font-weight:600;color:var(--text);display:flex;align-items:center;gap:6px;}
.ssland .toggle-switch{width:32px;height:18px;border-radius:999px;background:var(--brand);position:relative;flex-shrink:0;}
.ssland .toggle-knob{width:14px;height:14px;border-radius:50%;background:#fff;position:absolute;top:2px;right:2px;transition:right .3s ease;}
.ssland .share-wrap{padding:24px 18px;text-align:center;}
.ssland .share-link-box{display:flex;align-items:center;gap:8px;background:#fff;border:1.5px solid var(--border);border-radius:12px;padding:10px 12px;margin-bottom:20px;}
.ssland .share-link-text{flex:1;font-size:10.5px;color:var(--text);text-align:left;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.ssland .share-copy-btn{font-size:9.5px;font-weight:700;color:var(--brand);flex-shrink:0;}
.ssland .share-icons{display:flex;justify-content:center;gap:14px;margin-bottom:16px;}
.ssland .share-icon{width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;color:#fff;}
.ssland .share-note{font-size:10px;color:var(--text-secondary);}

/* ===== SOCIAL PROOF ===== */
.ssland .stat-bar{display:flex;justify-content:center;gap:40px;flex-wrap:wrap;margin:44px 0 8px;}
.ssland .stat-bar div{text-align:center;}
.ssland .stat-bar strong{display:block;font-family:var(--font-lora),Georgia,serif;font-size:24px;color:var(--brand);}
.ssland .stat-bar span{font-size:13px;color:var(--text-secondary);}
.ssland .marquee-outer{overflow:hidden;margin-top:40px;-webkit-mask-image:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent);mask-image:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent);}
.ssland .marquee-track{display:flex;gap:26px;width:max-content;padding:28px 4px 12px;animation:ssscrollx 42s linear infinite;will-change:transform;}
.ssland .marquee-outer:hover .marquee-track{animation-play-state:paused;}
@keyframes ssscrollx{from{transform:translate3d(0,0,0);}to{transform:translate3d(-50%,0,0);}}
.ssland .t-card{position:relative;display:flex;flex-direction:column;width:328px;flex-shrink:0;background:#fff;background-image:radial-gradient(rgba(61,12,17,0.02) 1px,transparent 1px);background-size:14px 14px;border:1px solid var(--border);border-radius:6px 18px 9px 16px;padding:26px 24px 22px;box-shadow:0 2px 8px rgba(61,12,17,.05);transition:transform .45s cubic-bezier(.34,1.4,.5,1), box-shadow .4s ease;overflow:visible;}
.ssland .t-card:hover{transform:translateY(-8px);box-shadow:0 20px 44px -16px rgba(61,12,17,.22);}
.ssland .t-tape{position:absolute;width:64px;height:20px;z-index:3;clip-path:polygon(2% 0%,6% 22%,1% 44%,6% 66%,2% 88%,4% 100%,96% 100%,98% 88%,94% 66%,99% 44%,94% 22%,98% 0%);box-shadow:0 3px 7px rgba(0,0,0,.14);background:linear-gradient(120deg,rgba(255,255,255,.4) 0%,rgba(255,255,255,0) 26%,rgba(255,255,255,0) 74%,rgba(255,255,255,.28) 100%),repeating-linear-gradient(46deg,color-mix(in srgb,var(--acc) 46%,transparent),color-mix(in srgb,var(--acc) 46%,transparent) 5px,color-mix(in srgb,var(--acc) 68%,transparent) 5px,color-mix(in srgb,var(--acc) 68%,transparent) 10px);}
.ssland .t-tape.tt-top{width:52%;height:19px;top:-9px;left:50%;transform:translateX(-50%) rotate(-1deg);}
.ssland .t-tape.tt-bottom{width:52%;height:19px;bottom:-9px;left:50%;transform:translateX(-50%) rotate(1deg);}
.ssland .t-label{display:flex;width:fit-content;align-items:center;gap:7px;font-size:10.5px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--text-secondary);margin-bottom:12px;}
.ssland .t-dot{width:6px;height:6px;border-radius:50%;background:var(--acc);flex-shrink:0;}
.ssland .t-spark{position:absolute;top:16px;right:16px;width:24px;height:24px;color:var(--acc);animation:sstwinkle 2.6s ease-in-out infinite;}
.ssland .t-spark.s2{width:12px;top:44px;right:32px;animation-delay:.9s;opacity:.7;}
@keyframes sstwinkle{0%,100%{transform:scale(.88) rotate(0);opacity:.8;}50%{transform:scale(1.28) rotate(18deg);opacity:1;}}
.ssland .t-qmark{font-family:var(--font-lora),Georgia,serif;font-weight:700;font-size:50px;line-height:.4;height:20px;color:var(--acc);opacity:.85;}
.ssland .t-card p{flex:1;min-height:90px;font-size:14.5px;color:var(--text);line-height:1.55;font-weight:500;margin:6px 0 22px;}
.ssland .t-foot{display:flex;align-items:center;gap:12px;border-top:1.5px dashed var(--border);padding-top:15px;}
.ssland .t-avatar{width:42px;height:42px;border-radius:50%;background:var(--acc);color:var(--on,#fff);font-family:var(--font-lora),Georgia,serif;font-weight:700;font-size:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.ssland .t-who{min-width:0;}
.ssland .t-name{position:relative;display:inline-block;font-size:14px;font-weight:800;color:var(--text);}
.ssland .t-scribble{position:absolute;left:-3px;bottom:-7px;width:calc(100% + 6px);height:11px;overflow:visible;pointer-events:none;}
.ssland .t-scribble path{fill:none;stroke:var(--acc);stroke-width:2.6;stroke-linecap:round;stroke-dasharray:1;stroke-dashoffset:1;transition:stroke-dashoffset .55s ease .05s;}
.ssland .t-card:hover .t-scribble path{stroke-dashoffset:0;}
.ssland .t-loc{font-size:12px;color:var(--text-secondary);font-weight:600;margin-top:5px;}

/* ===== PRICING ===== */
.ssland .pricing-card{position:relative;max-width:920px;margin:48px auto 0;background:var(--card);border:1px solid var(--border);border-radius:28px;padding:56px 72px;text-align:center;box-shadow:0 20px 60px rgba(61,12,17,0.06);}
.ssland .pricing-card .checklist{max-width:640px;margin-left:auto;margin-right:auto;}
.ssland .checklist{list-style:none;display:grid;grid-template-columns:1fr 1fr;gap:14px;text-align:left;margin:28px 0 34px;}
.ssland .checklist li{display:flex;align-items:center;gap:10px;font-size:14.5px;color:var(--text-secondary);}
.ssland .check{width:20px;height:20px;border-radius:50%;background:var(--brand-soft);color:var(--brand);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:12px;}
.ssland .pricing-micro{margin-top:14px;font-size:13px;color:var(--text-secondary);}

/* ===== RESPONSIVE ===== */
@media (max-width:860px){
  .ssland .wrap{padding:0 20px;}
  .ssland section{padding:60px 0;}
  .ssland .hero{min-height:auto;display:block;padding-top:20px;}
  .ssland .hero-inner{grid-template-columns:1fr;gap:36px;}
  .ssland .problem-split{grid-template-columns:1fr;gap:32px;}
  .ssland .feature-split{grid-template-columns:1fr;gap:32px;}
  .ssland .steps-split{grid-template-columns:1fr;gap:32px;}
  .ssland .feature-cards{order:2;}
  .ssland .checklist{grid-template-columns:1fr;}
  .ssland .pricing-card{padding:36px 28px;}
  .ssland .demo-card{padding:36px 32px;}
  .ssland .marquee-outer{-webkit-mask-image:none;mask-image:none;overflow:visible;}
  .ssland .marquee-track{animation:none;width:auto;overflow-x:auto;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;scroll-snap-type:x mandatory;scroll-padding-left:18px;scrollbar-width:none;padding:8px 18px 10px;will-change:auto;}
  .ssland .marquee-track::-webkit-scrollbar{display:none;}
  .ssland .t-card{scroll-snap-align:start;width:min(78vw,290px);}
  .ssland .phone-frame{width:250px;height:512px;will-change:transform;transform:translateZ(0);backface-visibility:hidden;}
  .ssland .demo-stage-wrap{min-height:310px;}
  .ssland .problem-phone-frame{width:250px;height:512px;}
}
@media (max-width:600px){
  .ssland .wrap{padding:0 18px;}
  .ssland section{padding:48px 0;}
  .ssland .hero{padding-top:12px;padding-bottom:36px;}
  .ssland .sub{font-size:15.5px;}
  .ssland .eyebrow{font-size:11px;padding:7px 14px;}
  .ssland .btn{padding:14px 22px;font-size:14px;width:100%;justify-content:center;}
  .ssland .hero-ctas{flex-direction:column;gap:22px;}
  .ssland .hero-ctas .btn{width:100%;justify-content:center;}
  .ssland .hero-ctas .btn::before{left:-10px;right:-10px;}
  .ssland .phone-frame{width:230px;height:472px;border-radius:36px;will-change:transform;transform:translateZ(0);backface-visibility:hidden;}
  .ssland .phone-screen{border-radius:26px;padding:42px 14px 14px;contain:layout paint;}
  .ssland .demo-stage-wrap{min-height:280px;}
  .ssland .preview-fullscreen{margin:0 -14px -14px -14px;}
  .ssland .phone-screen.stage3-mode .demo-stage-wrap{margin-top:-36px;}
  .ssland .problem-phone-frame{width:230px;height:472px;border-radius:36px;}
  .ssland .problem-phone-screen{border-radius:26px;contain:layout paint;}
  .ssland .p-card{padding:22px 20px 22px 20px;}
  .ssland .f-card{padding:18px 34px 18px 16px;gap:14px;}
  .ssland .p-headline, .ssland .f-body h3{font-size:16px;}
  .ssland .p-card p, .ssland .f-body p{font-size:13px;}
  .ssland .f-index{font-size:34px;top:6px;right:14px;}
  .ssland .f-card .feat-icon{width:46px;height:46px;}
  .ssland .pricing-card{padding:28px 20px;}
  .ssland .demo-card{border-radius:20px;padding:32px 20px;}
  .ssland .ai-demo{grid-template-columns:1fr;gap:6px;}
  .ssland .ai-connector{height:42px;}
  .ssland .ai-connector::before{top:auto;bottom:auto;left:12px;right:12px;width:auto;height:1.5px;}
  .ssland .step-card h3{font-size:18px;}
  .ssland .step-card p{font-size:14px;}
  .ssland .stat-bar{gap:24px;}
  .ssland .stat-bar strong{font-size:20px;}
}
@media (max-width:380px){
  .ssland .phone-frame{width:210px;height:430px;}
  .ssland .problem-phone-frame{width:210px;height:430px;}
  .ssland .demo-stage-wrap{min-height:250px;}
}
@media (prefers-reduced-motion:reduce){
  .ssland *{animation:none !important;transition:none !important;}
}
.ssland.is-scrolling .blob, .ssland.is-scrolling .marquee-track, .ssland.is-scrolling .browserwin, .ssland.is-scrolling .phone-frame,
.ssland.is-scrolling .celebrate-kitty, .ssland.is-scrolling .float-heart, .ssland.is-scrolling .music-eq span,
.ssland.is-scrolling .t-spark, .ssland.is-scrolling .spinner, .ssland.is-scrolling .processing-shimmer,
.ssland.is-scrolling .shimmer-bar, .ssland.is-scrolling .ai-mini-shimmer, .ssland.is-scrolling .status-dot{animation-play-state:paused !important;}
.ssland .anim-off, .ssland .anim-off *{animation-play-state:paused !important;}
`;

const MARKUP = `
<section class="hero">
  <div class="blob blob1"></div>
  <div class="blob blob2"></div>
  <div class="blob blob3"></div>
  <div class="wrap hero-inner">
    <div class="hero-copy">
      <div class="eyebrow reveal">✦ Trusted by 50,000+ Indian families</div>
      <h1 class="reveal">Turn your wishes into <em>beautiful</em> <em>celebrations</em></h1>
      <p class="sub reveal">Create a personal celebration page with photos, music, and an AI-written message — for weddings, birthdays, and festivals — ready to share in under 2 minutes.</p>
      <div class="hero-ctas reveal">
        <a href="#" class="btn btn-primary">Create Your Page →</a>
        <a href="#demo" class="btn btn-secondary">View Live Demo</a>
      </div>
      <div class="hero-stat reveal">⭐ 4.9/5 · Used for celebrations across 28 states &amp; the diaspora</div>
    </div>

    <div class="reveal tablet-stage">
      <div class="browserwin">
        <div class="win-bar">
          <div class="win-dots"><span></span><span></span><span></span></div>
          <div class="win-url"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>subhsandesh.in/create</div>
          <div class="win-nav"><span>←</span><span>→</span><span>↻</span></div>
        </div>
        <div class="browser-body" id="phoneScreen">
          <div class="lp-tag" id="phoneTag">✦ Live preview</div>
              <div class="demo-stage-wrap" id="stageWrap2">
            <div class="stage active" data-stage="0">
              <div class="chat-label">Tell us about your celebration</div>
              <div class="chat-box"><span id="chatText"><span class="cursor"></span></span></div>
              <button class="chat-send" id="chatSend"><span>Generate ✦</span></button>
            </div>
            <div class="stage" data-stage="1">
              <div class="processing-wrap">
                <div class="spinner"></div>
                <div class="processing-text">AI is creating your page…</div>
                <div class="processing-shimmer"></div>
              </div>
            </div>
            <div class="stage" data-stage="2">
              <div class="form-title">Filling in your details</div>
              <div class="form-field"><label>Names</label><div class="field-value-row"><div class="field-value" id="fv0"></div><div class="field-check" id="fc0">✓</div></div></div>
              <div class="form-field"><label>Occasion</label><div class="field-value-row"><div class="field-value" id="fv1"></div><div class="field-check" id="fc1">✓</div></div></div>
              <div class="form-field"><label>Song</label><div class="field-value-row"><div class="field-value" id="fv2"></div><div class="field-check" id="fc2">✓</div></div></div>
              <div class="form-field"><label>Message</label><div class="field-value-row"><div class="field-value" id="fv3"></div><div class="field-check" id="fc3">✓</div></div></div>
            </div>
            <div class="stage" data-stage="3">
              <div class="preview-fullscreen">
                <div class="preview-scroll" id="previewScroll">
                  <div class="preview-banner">
                    <div class="preview-banner-emoji">💌</div>
                    <div class="preview-banner-title">To Ananya, from Rohan</div>
                    <div class="preview-banner-sub">A little something to say sorry</div>
                  </div>
                  <div class="preview-body">
                    <p class="preview-text">I know I ate your share of pani puri again. I'm sorry 🥺</p>
                    <div class="preview-question">Can you forgive me?</div>
                    <div class="btn-row-wrap" id="btnRowWrap">
                      <button class="btn-yes" id="btnYes">Yes 💕</button>
                      <button class="btn-no" id="btnNo">No</button>
                    </div>
                  </div>
                  <div class="preview-footer">
                    <div class="mini-gallery"><span></span><span></span><span></span></div>
                    <div class="mini-music">🎵 Our Song — playing</div>
                    <div class="made-with">Made with SubhSandesh ✦</div>
                  </div>
                </div>
                <div class="celebrate-backdrop" id="celebrateBackdrop">
                  <div class="celebrate-modal">
                    <div class="celebrate-kitty-wrap">
                      <span class="float-heart h1">💖</span>
                      <span class="float-heart h2">✨</span>
                      <span class="float-heart h3">💕</span>
                      <span class="celebrate-kitty">😻</span>
                    </div>
                    <div class="celebrate-title">Yay! She said Yes! 🎉</div>
                    <div class="celebrate-stamp">Forgiven ✓</div>
                    <p class="celebrate-msg">I promise to bring your favorite chocolate cake this weekend. I love you!</p>
                    <span class="celebrate-sign">— Rohan 💖</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="phone-status" id="phoneStatus"><span class="status-dot"></span><span id="statusText">Type what you want…</span></div>
        </div>
      </div>
      <div class="laptop-caption"><span class="lc-dot"></span>Watch it build a real page — live</div>
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="eyebrow reveal">Sound familiar?</div>
    <h2 class="reveal" style="font-size:clamp(28px,4vw,40px);max-width:640px;">Your wishes deserve better than a forwarded text.</h2>
    <div class="problem-split">
      <div class="reveal">
        <div class="problem-phone-frame">
          <div class="problem-phone-screen" id="problemPhoneScreen">
            <div class="problem-phone-island"></div>
            <div class="p-stage active" data-p="0">
              <div class="wa-header">
                <span class="wa-back">←</span>
                <div class="wa-title"><div class="wa-name">Chats</div></div>
                <div class="wa-icons"><span>📷</span><span>⋮</span></div>
              </div>
              <div class="wa-list-body">
                <div class="wa-list-row"><div class="wa-list-avatar" style="background:var(--brand);">R</div><div class="wa-list-meta"><div class="wa-list-name">Rohit</div><div class="wa-list-preview">✓✓ Happy Birthday!! 🎉🎂</div></div><div class="wa-list-right"><div class="wa-list-time">2:14 PM</div></div></div>
                <div class="wa-list-row"><div class="wa-list-avatar" style="background:var(--rose);">S</div><div class="wa-list-meta"><div class="wa-list-name">Sneha</div><div class="wa-list-preview">✓✓ Happy Birthday!! 🎉🎂</div></div><div class="wa-list-right"><div class="wa-list-time">2:14 PM</div></div></div>
                <div class="wa-list-row"><div class="wa-list-avatar" style="background:#c9a84c;">K</div><div class="wa-list-meta"><div class="wa-list-name">Kabir</div><div class="wa-list-preview">✓✓ Happy Birthday!! 🎉🎂</div></div><div class="wa-list-right"><div class="wa-list-time">2:14 PM</div></div></div>
                <div class="wa-list-row"><div class="wa-list-avatar" style="background:#3AA76D;">M</div><div class="wa-list-meta"><div class="wa-list-name">Meera</div><div class="wa-list-preview">✓✓ Happy Birthday!! 🎉🎂</div></div><div class="wa-list-right"><div class="wa-list-time">2:14 PM</div><div class="wa-list-badge">1</div></div></div>
                <div class="wa-list-row"><div class="wa-list-avatar" style="background:var(--brand);">A</div><div class="wa-list-meta"><div class="wa-list-name">Aman</div><div class="wa-list-preview">✓✓ Happy Birthday!! 🎉🎂</div></div><div class="wa-list-right"><div class="wa-list-time">2:13 PM</div></div></div>
                <div class="wa-fab">💬</div>
              </div>
            </div>
            <div class="p-stage" data-p="1">
              <div class="wa-header">
                <span class="wa-back">←</span>
                <div class="wa-avatar">P</div>
                <div class="wa-title"><div class="wa-name">Priya</div><div class="wa-sub">online</div></div>
                <div class="wa-icons"><span>📞</span></div>
              </div>
              <div class="wa-chat-body">
                <div class="wa-bubble">
                  <div class="wa-bubble-img">🎂</div>
                  <div class="wa-bubble-caption">Happy Birthday, <strong>Sara</strong>! 🎉</div>
                  <div class="wa-bubble-time">2:15 PM ✓✓</div>
                </div>
                <div style="text-align:right;"><span class="wa-wrong-tag">⚠ Priya's name isn't Sara</span></div>
              </div>
            </div>
            <div class="p-stage" data-p="2">
              <div class="post-header">
                <div class="wa-back-btn">←</div>
                <div class="wa-title"><div class="wa-name">Comments</div><div class="wa-sub">247 comments</div></div>
              </div>
              <div class="post-img-full"><span class="post-likes">❤️ 1.2k likes</span></div>
              <div class="comments-list">
                <div class="comment-row"><div class="c-avatar" style="background:var(--brand);">RS</div><div class="c-body"><div class="c-top-row"><span class="c-user">rohit_23</span><span class="c-time">2h</span></div><div class="c-text">Happy birthday!! 🎉</div></div><span class="c-like">♡</span></div>
                <div class="comment-row"><div class="c-avatar" style="background:var(--rose);">SK</div><div class="c-body"><div class="c-top-row"><span class="c-user">sneha.k</span><span class="c-time">2h</span></div><div class="c-text">Have the best year 🎂</div></div><span class="c-like">♡</span></div>
                <div class="comment-row"><div class="c-avatar" style="background:#c9a84c;">KM</div><div class="c-body"><div class="c-top-row"><span class="c-user">kabir.m</span><span class="c-time">1h</span></div><div class="c-text">🎉🎉🎉</div></div><span class="c-like">♡</span></div>
                <div class="comment-row mine"><div class="c-avatar" style="background:var(--brand);">Y</div><div class="c-body"><div class="c-top-row"><span class="c-user">you</span><span class="c-time">1h</span></div><div class="c-text">Happiest birthday to the best sister, love you so much...</div></div><span class="c-mine-badge">YOURS</span></div>
                <div class="comment-row"><div class="c-avatar" style="background:#3AA76D;">AJ</div><div class="c-body"><div class="c-top-row"><span class="c-user">aman.j</span><span class="c-time">45m</span></div><div class="c-text">Cake looks amazing 😍</div></div><span class="c-like">♡</span></div>
              </div>
              <div class="post-more-row">View all 237 comments</div>
            </div>
          </div>
        </div>
      </div>
      <div class="problem-cards reveal">
        <div class="p-card active" data-card="0">
          <div class="p-medium"><span class="dotm"></span>The WhatsApp forward</div>
          <div class="p-headline">&ldquo;Happy Birthday!! 🎉🎂&rdquo;</div>
          <p>A copy-pasted forward, sent to twenty other people the same day.</p>
        </div>
        <div class="p-card" data-card="1">
          <div class="p-medium"><span class="dotm"></span>The generic e-card</div>
          <div class="p-headline">Stock photo, someone else&rsquo;s name</div>
          <p>Doesn&rsquo;t even have your sister&rsquo;s name spelled right.</p>
        </div>
        <div class="p-card" data-card="2">
          <div class="p-medium"><span class="dotm"></span>The buried comment</div>
          <div class="p-headline">One comment among 200</div>
          <p>Lost on a post nobody will scroll back to in a year.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<section id="features">
  <div class="wrap">
    <h2 class="reveal" style="font-size:clamp(26px,3.4vw,36px);max-width:600px;">Every celebration gets its own page — personal, permanent, and genuinely yours.</h2>
    <div class="feature-split">
      <div class="feature-cards reveal">
        <div class="f-card active" data-fcard="0">
          <span class="f-index">01</span>
          <div class="feat-icon"><svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="2"></rect><circle cx="8.5" cy="10.5" r="1.5"></circle><path d="M21 15l-5-5L5 19"></path></svg></div>
          <div class="f-body"><h3>Photo Gallery<svg class="f-underline" viewBox="0 0 240 20" preserveAspectRatio="none"><path pathLength="1" d="M4 11 C 58 5,116 16,174 9 S 236 13,236 10"></path></svg></h3><p>Upload your favorite memories in one scrollable gallery, from the first photo together to the latest.</p></div>
        </div>
        <div class="f-card" data-fcard="1">
          <span class="f-index">02</span>
          <div class="feat-icon"><svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg></div>
          <div class="f-body"><h3>Music &amp; Playlist<svg class="f-underline" viewBox="0 0 240 20" preserveAspectRatio="none"><path pathLength="1" d="M4 12 C 64 17,120 6,178 14 S 232 9,236 13"></path></svg></h3><p>Attach the song that means something — it plays the moment they open the page.</p></div>
        </div>
        <div class="f-card" data-fcard="2">
          <span class="f-index">03</span>
          <div class="feat-icon"><svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3l1.6 4.9L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.1z"></path><path d="M19 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"></path></svg></div>
          <div class="f-body"><h3>AI-Written Messages<svg class="f-underline" viewBox="0 0 240 20" preserveAspectRatio="none"><path pathLength="1" d="M4 10 C 56 16,120 7,176 13 S 234 8,236 12"></path></svg></h3><p>Tell us the relationship and the moment. Get a heartfelt, specific message in seconds — not a template.</p></div>
        </div>
        <div class="f-card" data-fcard="3">
          <span class="f-index">04</span>
          <div class="feat-icon"><svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg></div>
          <div class="f-body"><h3>Live Countdown<svg class="f-underline" viewBox="0 0 240 20" preserveAspectRatio="none"><path pathLength="1" d="M4 13 C 60 7,124 17,180 10 S 232 14,236 11"></path></svg></h3><p>Build the anticipation with a real-time countdown to the big day, visible to everyone you share it with.</p></div>
        </div>
      </div>
      <div class="reveal">
        <div class="problem-phone-frame">
          <div class="problem-phone-screen" id="featurePhoneScreen">
            <div class="problem-phone-island"></div>
            <div class="f-stage active" data-f="0">
              <div class="f-header"><div class="f-header-title">Our Photos</div><div class="f-header-sub">24 photos</div></div>
              <div class="gallery-grid" id="galleryGrid">
                <div class="gallery-thumb" data-d="0" style="background:linear-gradient(135deg,var(--brand),var(--rose));"></div>
                <div class="gallery-thumb" data-d="60" style="background:linear-gradient(135deg,var(--rose),var(--gold));"></div>
                <div class="gallery-thumb" data-d="120" style="background:linear-gradient(135deg,#c9a84c,var(--rose));"></div>
                <div class="gallery-thumb" data-d="180" style="background:linear-gradient(135deg,var(--gold),var(--brand));"></div>
                <div class="gallery-thumb" data-d="240" style="background:linear-gradient(135deg,var(--brand),#3AA76D);"></div>
                <div class="gallery-thumb" data-d="300" style="background:linear-gradient(135deg,var(--rose),#c9a84c);"></div>
                <div class="gallery-thumb" data-d="360" style="background:linear-gradient(135deg,#3AA76D,var(--gold));"></div>
                <div class="gallery-thumb" data-d="420" style="background:linear-gradient(135deg,var(--brand),var(--rose));"></div>
                <div class="gallery-thumb" data-d="480" style="background:linear-gradient(135deg,var(--rose),var(--brand));"></div>
              </div>
            </div>
            <div class="f-stage" data-f="1">
              <div class="f-header"><div class="f-header-title">Now Playing</div><div class="f-header-sub">From this page's playlist</div></div>
              <div class="music-wrap">
                <div class="album-art">🎵</div>
                <div class="music-title">Perfect</div>
                <div class="music-artist">Ed Sheeran</div>
                <div class="music-progress"><div class="music-progress-fill"></div></div>
                <div class="music-times"><span>1:24</span><span>4:23</span></div>
                <div class="music-controls"><span>⏮</span><div class="music-play">▶</div><span>⏭</span></div>
                <div class="music-eq"><span></span><span></span><span></span><span></span></div>
              </div>
            </div>
            <div class="f-stage" data-f="2">
              <div class="f-header"><div class="f-header-title">AI Message</div><div class="f-header-sub">Written for your page</div></div>
              <div class="ai-mini-wrap">
                <div class="ai-mini-chip">For: my sister · Birthday</div>
                <div class="ai-mini-box" id="aiMiniBox"></div>
                <div class="ai-mini-shimmer" id="aiMiniShimmer" style="display:none;"></div>
              </div>
            </div>
            <div class="f-stage" data-f="3">
              <div class="f-header"><div class="f-header-title">Countdown</div><div class="f-header-sub">To the big day</div></div>
              <div class="countdown-wrap">
                <div class="countdown-event">Riya &amp; Arjun's Wedding</div>
                <div class="countdown-digits">
                  <div class="cd-box"><div class="cd-num" id="cdDays">14</div><div class="cd-label">DAYS</div></div>
                  <div class="cd-box"><div class="cd-num" id="cdHours">08</div><div class="cd-label">HRS</div></div>
                  <div class="cd-box"><div class="cd-num" id="cdMins">32</div><div class="cd-label">MIN</div></div>
                  <div class="cd-box"><div class="cd-num" id="cdSecs">05</div><div class="cd-label">SEC</div></div>
                </div>
                <div class="countdown-sub">Visible to everyone you share the page with</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section id="demo">
  <div class="wrap" style="text-align:center;">
    <div class="demo-card reveal" id="aiCard">
      <span class="tape tp-tl"></span><span class="tape tp-tr"></span><span class="tape tp-bl"></span><span class="tape tp-br"></span>
      <div class="eyebrow">✦ AI Message Generator</div>
      <h2 style="font-size:clamp(26px,3.4vw,36px);margin-top:6px;">Watch it write itself</h2>
      <p class="sub" style="margin:12px auto 0;">Just tell us who it&rsquo;s for — our AI writes the rest.</p>
      <div class="ai-demo">
        <div class="ai-col">
          <div class="ai-demo-tag">You asked</div>
          <div class="ai-input" id="aiInput"><span class="cursor"></span></div>
        </div>
        <div class="ai-connector" aria-hidden><span class="ai-spark">✦</span></div>
        <div class="ai-col">
          <div class="ai-demo-tag gold">SubhSandesh wrote ✦</div>
          <div class="ai-generating" id="aiGenerating">Generating… <div class="shimmer-bar"></div></div>
          <div class="ai-result" id="aiResult"></div>
        </div>
      </div>
      <p class="ai-caption">Generated in 4 seconds · Try it yourself below</p>
    </div>
  </div>
</section>

<section id="how">
  <div class="wrap">
    <h2 class="reveal" style="font-size:clamp(26px,3.4vw,36px);text-align:center;">Three steps. Two minutes. Zero design skills.</h2>
    <div class="steps-split">
      <div class="reveal">
        <div class="problem-phone-frame">
          <div class="problem-phone-screen" id="stepsPhoneScreen">
            <div class="problem-phone-island"></div>
            <div class="s-stage active" data-s="0">
              <div class="f-header"><div class="f-header-title">New Page</div><div class="f-header-sub">Choose an occasion</div></div>
              <div class="occasion-grid" id="occasionGrid">
                <div class="occasion-card" data-d="0"><div class="occasion-emoji">💍</div><div class="occasion-name">Wedding</div><div class="occasion-check">✓ Selected</div></div>
                <div class="occasion-card" data-d="100"><div class="occasion-emoji">🎂</div><div class="occasion-name">Birthday</div><div class="occasion-check">✓ Selected</div></div>
                <div class="occasion-card" data-d="200"><div class="occasion-emoji">💕</div><div class="occasion-name">Anniversary</div><div class="occasion-check">✓ Selected</div></div>
                <div class="occasion-card" data-d="300"><div class="occasion-emoji">✨</div><div class="occasion-name">Festival</div><div class="occasion-check">✓ Selected</div></div>
              </div>
            </div>
            <div class="s-stage" data-s="1">
              <div class="f-header"><div class="f-header-title">Add Your Story</div><div class="f-header-sub">Photos, song, and message</div></div>
              <div class="editor-wrap">
                <div class="editor-label">Photos</div>
                <div class="photo-row">
                  <div class="photo-slot" style="background:linear-gradient(135deg,var(--brand),var(--rose));"></div>
                  <div class="photo-slot" style="background:linear-gradient(135deg,var(--rose),var(--gold));"></div>
                  <div class="photo-slot add">+</div>
                </div>
                <div class="editor-label">Song</div>
                <div class="song-row"><span class="note">🎵</span><div class="song-row-text"><div class="song-row-title">Perfect</div><div class="song-row-artist">Ed Sheeran</div></div></div>
                <div class="editor-label">Message</div>
                <div class="ai-toggle-row"><div class="ai-toggle-label">✨ Let AI help write</div><div class="toggle-switch"><div class="toggle-knob"></div></div></div>
              </div>
            </div>
            <div class="s-stage" data-s="2">
              <div class="f-header"><div class="f-header-title">Share</div><div class="f-header-sub">Your page is ready</div></div>
              <div class="share-wrap">
                <div class="share-link-box"><span class="share-link-text">subhsandesh.in/riya-arjun</span><span class="share-copy-btn">Copy</span></div>
                <div class="share-icons">
                  <div class="share-icon" style="background:#25D366;">💬</div>
                  <div class="share-icon" style="background:linear-gradient(135deg,var(--brand),var(--rose));">📷</div>
                  <div class="share-icon" style="background:var(--brand);">🔗</div>
                </div>
                <div class="share-note">Works anywhere — no app required to view it</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="reveal">
        <div class="step-cards">
          <div class="step-card active" data-st="0" style="--u:#3d0c11">
            <span class="step-num">1</span>
            <h3>Pick your occasion<svg class="s-underline" viewBox="0 0 240 15" preserveAspectRatio="none"><path pathLength="1" d="M4 9 C 60 3,120 13,180 7 S 236 11,236 8"></path></svg></h3>
            <p>Wedding, birthday, anniversary, or festival — choose a starting layout.</p>
          </div>
          <div class="step-card" data-st="1" style="--u:#a13540">
            <span class="step-num">2</span>
            <h3>Add your story<svg class="s-underline" viewBox="0 0 240 15" preserveAspectRatio="none"><path pathLength="1" d="M4 10 C 64 4,120 14,180 8 S 236 6,236 10"></path></svg></h3>
            <p>Photos, a song, and let our AI help write the words if you're stuck.</p>
          </div>
          <div class="step-card" data-st="2" style="--u:#c9a84c">
            <span class="step-num">3</span>
            <h3>Share the link<svg class="s-underline" viewBox="0 0 240 15" preserveAspectRatio="none"><path pathLength="1" d="M4 8 C 56 14,120 5,178 11 S 234 7,236 10"></path></svg></h3>
            <p>One link, works on WhatsApp, Instagram, or anywhere else — no app required to view it.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <h2 class="reveal" style="font-size:clamp(26px,3.4vw,36px);text-align:center;">Loved across every corner of India</h2>
    <div class="stat-bar reveal">
      <div><strong>⭐ 4.9</strong><span>average rating</span></div>
      <div><strong>50,000+</strong><span>pages created</span></div>
      <div><strong>28 states</strong><span>+ diaspora worldwide</span></div>
    </div>
    <div class="marquee-outer reveal"><div class="marquee-track" id="marquee"></div></div>
  </div>
</section>

<section id="pricing">
  <div class="wrap" style="text-align:center;">
    <div class="pricing-card reveal">
      <span class="tape tp-tl"></span><span class="tape tp-tr"></span><span class="tape tp-bl"></span><span class="tape tp-br"></span>
      <div class="eyebrow">Free to start — no credit card required</div>
      <h2 style="font-size:clamp(24px,3.2vw,34px);margin-top:6px;">Your next celebration deserves its own page.</h2>
      <ul class="checklist">
        <li><span class="check">✓</span> Unlimited photos on your first page</li>
        <li><span class="check">✓</span> AI message generator</li>
        <li><span class="check">✓</span> Custom music</li>
        <li><span class="check">✓</span> Live countdown</li>
        <li><span class="check">✓</span> Shareable link forever</li>
      </ul>
      <a href="#" class="btn btn-primary" style="padding:18px 36px;font-size:16px;">Create Your Page — It's Free →</a>
      <div class="pricing-micro">Ready to share in under 2 minutes.</div>
    </div>
  </div>
</section>
`;

export default function SubhSandeshLandingV2() {
  const rootRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const self = { _destroyed: false };
    const timers: number[] = [];
    const root = rootRef.current;
    if (!root) return;

    const $ = (id: string) => document.getElementById(id);
    const auto = true;
    const later = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timers.push(t); return t; };
    const sleep = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

    /* ---- scroll-pause ---- */
    (window as any).__scrolling = false;
    let scrolling = false, rafId = 0, idleTimer = 0;
    function onScroll() {
      if (!scrolling) { scrolling = true; (window as any).__scrolling = true; root!.classList.add("is-scrolling"); }
      clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => { scrolling = false; (window as any).__scrolling = false; root!.classList.remove("is-scrolling"); }, 140);
    }
    const scrollHandler = () => { if (rafId) return; rafId = requestAnimationFrame(() => { rafId = 0; onScroll(); }); };
    window.addEventListener("scroll", scrollHandler, { passive: true });

    /* ---- pause off-screen sections ---- */
    const secs: Element[] = [];
    root.querySelectorAll(".hero, .problem-split, .feature-split, section").forEach((el) => {
      if (el.querySelector(".blob,.marquee-track,.browserwin,.phone-frame,.spinner,.music-eq span,.t-spark,.shimmer-bar,.processing-shimmer,.ai-mini-shimmer,.status-dot,.celebrate-kitty,.float-heart")) secs.push(el);
    });
    const aio = new IntersectionObserver((entries) => { entries.forEach((e) => { (e.target as HTMLElement).classList.toggle("anim-off", !e.isIntersecting); }); }, { rootMargin: "150px 0px", threshold: 0 });
    secs.forEach((el) => aio.observe(el));

    function autoPauseCycle(sectionEl: Element | null, startFn: () => void, stopFn: () => void) {
      if (!sectionEl) return;
      new IntersectionObserver((entries) => { entries.forEach((e) => { e.isIntersecting ? startFn() : stopFn(); }); }, { threshold: 0.1 }).observe(sectionEl);
    }

    /* ---- reveal ---- */
    const revealEls = root.querySelectorAll<HTMLElement>(".reveal");
    revealEls.forEach((el, i) => { el.style.transitionDelay = (i % 6) * 0.08 + "s"; });
    const io = new IntersectionObserver((entries) => { entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("in-view"); io.unobserve(entry.target); } }); }, { threshold: 0.12 });
    revealEls.forEach((el) => io.observe(el));

    function typeInto(el: HTMLElement, text: string, speed: number, keepCursor: boolean) {
      if (keepCursor === undefined) keepCursor = true;
      return new Promise<void>((resolve) => {
        let i = 0;
        (function step() {
          if (i <= text.length) {
            el.innerHTML = text.slice(0, i) + (keepCursor ? '<span class="cursor"></span>' : (i < text.length ? '<span class="field-cursor"></span>' : ""));
            i++; window.setTimeout(step, speed);
          } else resolve();
        })();
      });
    }
    function simulateTap(el: HTMLElement | null) {
      const screen = $("phoneScreen"); if (!screen || !el) return;
      const screenRect = screen.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const ripple = document.createElement("div");
      ripple.className = "tap-ripple";
      ripple.style.left = elRect.left - screenRect.left + elRect.width / 2 + "px";
      ripple.style.top = elRect.top - screenRect.top + elRect.height / 2 + "px";
      screen.appendChild(ripple);
      window.setTimeout(() => ripple.remove(), 600);
    }
    function burstConfettiFullScreen() {
      const screen = $("phoneScreen"); if (!screen) return;
      const colors = ["#3d0c11", "#c9a84c", "#a13540", "#e8c86a"];
      for (let i = 0; i < 20; i++) {
        const p = document.createElement("div");
        p.className = "confetti-piece";
        p.style.left = Math.random() * 100 + "%";
        p.style.setProperty("--tx", Math.random() * 60 - 30 + "px");
        p.style.setProperty("--ty", Math.random() * 220 + 180 + "px");
        p.style.setProperty("--rot", Math.random() * 360 + "deg");
        p.style.background = colors[i % colors.length];
        p.style.animationDelay = Math.random() * 0.4 + "s";
        screen.appendChild(p);
        window.setTimeout(() => p.remove(), 2200);
      }
    }

    /* ---- hero ---- */
    const stages = root.querySelectorAll<HTMLElement>(".stage");
    function showStage(n: number) {
      stages.forEach((s) => { s.classList.toggle("active", +(s.dataset.stage || "-1") === n); });
      const ps = $("phoneScreen"); if (ps) ps.classList.toggle("stage3-mode", n === 3);
    }
    function dodgeNo() {
      const wrap = $("btnRowWrap"); const noBtn = $("btnNo"); if (!wrap || !noBtn) return;
      const wrapRect = wrap.getBoundingClientRect();
      const btnRect = noBtn.getBoundingClientRect();
      const maxX = Math.max(wrapRect.width - btnRect.width - 10, 20);
      const maxY = Math.max(wrapRect.height - btnRect.height - 10, 10);
      noBtn.style.right = "auto";
      noBtn.style.left = Math.random() * maxX + "px";
      noBtn.style.top = Math.random() * maxY + "px";
    }
    async function runPreviewInteraction() {
      const statusText = $("statusText"), status = $("phoneStatus");
      const noBtn = $("btnNo"), yesBtn = $("btnYes");
      const previewScroll = $("previewScroll"), celebrateBackdrop = $("celebrateBackdrop");
      if (!statusText || !status || !noBtn || !yesBtn || !previewScroll || !celebrateBackdrop) return;
      status.classList.remove("done");
      celebrateBackdrop.classList.remove("show");
      noBtn.style.left = ""; noBtn.style.top = ""; noBtn.style.right = "28%";
      previewScroll.scrollTop = 0;
      statusText.textContent = "Here's the page it created…";
      await sleep(1300);
      statusText.textContent = "Trying to click 'No'… 😏";
      simulateTap(noBtn); await sleep(200); dodgeNo(); await sleep(750);
      simulateTap(noBtn); await sleep(200); dodgeNo(); await sleep(750);
      statusText.textContent = "Clicking 'Yes' instead…";
      simulateTap(yesBtn); yesBtn.classList.add("tapped"); await sleep(150); yesBtn.classList.remove("tapped");
      burstConfettiFullScreen();
      celebrateBackdrop.classList.add("show");
      statusText.textContent = "She said yes! 🎉";
      status.classList.add("done");
      await sleep(2600);
      celebrateBackdrop.classList.remove("show");
      await sleep(400);
      previewScroll.scrollTo({ top: previewScroll.scrollHeight, behavior: "smooth" });
      statusText.textContent = "One page. Photos, music, and more.";
      await sleep(2000);
    }
    let heroVisible = true;
    const heroSectionEl = root.querySelector(".hero");
    if (heroSectionEl) { new IntersectionObserver((entries) => { heroVisible = entries[0].isIntersecting; }, { threshold: 0.1 }).observe(heroSectionEl); }
    function waitUntilHeroVisible() { return new Promise<void>((resolve) => { (function check() { heroVisible ? resolve() : window.setTimeout(check, 600); })(); }); }
    async function runHeroFlow(): Promise<void> {
      if (self._destroyed) return;
      await waitUntilHeroVisible();
      if (self._destroyed) return;
      const chatText = $("chatText"), chatSend = $("chatSend"), statusText = $("statusText");
      if (!chatText || !chatSend || !statusText) return;
      const fv = [0, 1, 2, 3].map((i) => $("fv" + i)), fc = [0, 1, 2, 3].map((i) => $("fc" + i));
      showStage(0);
      chatText.innerHTML = '<span class="cursor"></span>';
      fv.forEach((f) => { if (f) f.innerHTML = ""; }); fc.forEach((c) => c && c.classList.remove("show"));
      statusText.textContent = "Type what you want…";
      await sleep(500);
      await typeInto(chatText, "An apology page for Ananya — sorry about the pani puri!", 22, true);
      await sleep(500);
      simulateTap(chatSend); chatSend.classList.add("pressed");
      statusText.textContent = "Sending to AI…";
      await sleep(180); chatSend.classList.remove("pressed"); await sleep(400);
      showStage(1);
      statusText.textContent = "AI is creating your page…";
      await sleep(1800);
      showStage(2);
      statusText.textContent = "Filling in your details…";
      if (fv[0]) { await typeInto(fv[0], "Ananya & Rohan", 40, false); fc[0]?.classList.add("show"); await sleep(280); }
      if (fv[1]) { await typeInto(fv[1], "An apology", 40, false); fc[1]?.classList.add("show"); await sleep(280); }
      if (fv[2]) { await typeInto(fv[2], "Their favorite song", 35, false); fc[2]?.classList.add("show"); await sleep(280); }
      if (fv[3]) { await typeInto(fv[3], "I promise to bring your favorite cake...", 16, false); fc[3]?.classList.add("show"); await sleep(500); }
      showStage(3);
      await runPreviewInteraction();
      if (!self._destroyed) runHeroFlow();
    }
    runHeroFlow();

    /* ---- problem cycle ---- */
    const pStages = root.querySelectorAll<HTMLElement>(".p-stage");
    const pCards = root.querySelectorAll<HTMLElement>(".p-card");
    let problemIndex = 0, problemTimer = 0;
    function showProblem(n: number) {
      problemIndex = n;
      pStages.forEach((s) => s.classList.toggle("active", +(s.dataset.p || "-1") === n));
      pCards.forEach((c) => c.classList.toggle("active", +(c.dataset.card || "-1") === n));
    }
    function startProblemCycle() {
      clearInterval(problemTimer);
      if (!auto) return;
      problemTimer = window.setInterval(() => { if ((window as any).__scrolling) return; showProblem((problemIndex + 1) % 3); }, 4200);
      timers.push(problemTimer);
    }
    pCards.forEach((card) => card.addEventListener("click", () => { showProblem(+(card.dataset.card || "0")); startProblemCycle(); }));
    showProblem(0);
    autoPauseCycle(root.querySelector(".problem-split"), startProblemCycle, () => clearInterval(problemTimer));

    /* ---- features cycle ---- */
    const fStages = root.querySelectorAll<HTMLElement>(".f-stage");
    const fCards = root.querySelectorAll<HTMLElement>(".f-card");
    let featureIndex = 0, featureTimer = 0, aiMiniRunId = 0;
    function runGalleryStagger() {
      root!.querySelectorAll(".gallery-thumb").forEach((t) => t.classList.remove("show"));
      root!.querySelectorAll<HTMLElement>(".gallery-thumb").forEach((t) => { const d = +(t.dataset.d || "0"); window.setTimeout(() => t.classList.add("show"), d + 150); });
    }
    async function runAiMiniDemo() {
      const runId = ++aiMiniRunId;
      const box = $("aiMiniBox"), shimmer = $("aiMiniShimmer"); if (!box || !shimmer) return;
      box.innerHTML = ""; shimmer.style.display = "block";
      await sleep(1100);
      if (runId !== aiMiniRunId) return;
      shimmer.style.display = "none";
      await typeInto(box, "You've been the loudest cheerleader in my life since we were kids. Happiest birthday, sis — love you endlessly! 🎂💜", 14, false);
    }
    function showFeature(n: number) {
      featureIndex = n;
      fStages.forEach((s) => s.classList.toggle("active", +(s.dataset.f || "-1") === n));
      fCards.forEach((c) => c.classList.toggle("active", +(c.dataset.fcard || "-1") === n));
      if (n === 0) runGalleryStagger();
      if (n === 2) runAiMiniDemo();
    }
    function startFeatureCycle() {
      clearInterval(featureTimer);
      if (!auto) return;
      featureTimer = window.setInterval(() => { if ((window as any).__scrolling) return; showFeature((featureIndex + 1) % 4); }, 4500);
      timers.push(featureTimer);
    }
    fCards.forEach((card) => card.addEventListener("click", () => { showFeature(+(card.dataset.fcard || "0")); startFeatureCycle(); }));
    showFeature(0);
    autoPauseCycle(root.querySelector(".feature-split"), startFeatureCycle, () => clearInterval(featureTimer));

    /* ---- countdown ---- */
    let cdTotalSeconds = 14 * 86400 + 8 * 3600 + 32 * 60 + 5;
    let cdTimer = 0;
    function tickCountdown() {
      cdTotalSeconds = cdTotalSeconds > 0 ? cdTotalSeconds - 1 : 14 * 86400 + 8 * 3600 + 32 * 60 + 5;
      const days = Math.floor(cdTotalSeconds / 86400);
      const hours = Math.floor((cdTotalSeconds % 86400) / 3600);
      const mins = Math.floor((cdTotalSeconds % 3600) / 60);
      const secs = cdTotalSeconds % 60;
      const dEl = $("cdDays"), hEl = $("cdHours"), mEl = $("cdMins"), sEl = $("cdSecs");
      if (dEl && hEl && mEl && sEl) { dEl.textContent = String(days); hEl.textContent = String(hours).padStart(2, "0"); mEl.textContent = String(mins).padStart(2, "0"); sEl.textContent = String(secs).padStart(2, "0"); }
    }
    const featuresSectionEl = $("features");
    if (featuresSectionEl) {
      new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { if (!cdTimer) { cdTimer = window.setInterval(tickCountdown, 1000); timers.push(cdTimer); } }
          else if (cdTimer) { clearInterval(cdTimer); cdTimer = 0; }
        });
      }, { threshold: 0.05 }).observe(featuresSectionEl);
    }

    /* ---- live demo ---- */
    let aiRan = false;
    function runAiDemo() {
      if (aiRan) return; aiRan = true;
      const input = $("aiInput"), generating = $("aiGenerating"), result = $("aiResult");
      if (!input || !generating || !result) return;
      const prompt = "A 25th anniversary message for my parents, warm and a little funny";
      const finalLines = [
        "25 years, two kids, one very stubborn dog, and somehow you two still laugh at the same jokes.",
        "Happy anniversary, Mom and Dad — here's to the next 25 being just as loud, just as loving, and just as yours.",
      ];
      let i = 0;
      function typePrompt() {
        if (i <= prompt.length) {
          input!.innerHTML = prompt.slice(0, i) + '<span class="cursor"></span>';
          i++; window.setTimeout(typePrompt, 32);
        } else {
          window.setTimeout(() => { generating!.classList.add("show"); }, 300);
          window.setTimeout(() => {
            generating!.classList.remove("show");
            finalLines.forEach((line, idx) => {
              const p = document.createElement("p");
              p.className = "line"; p.textContent = line;
              p.style.transitionDelay = idx * 0.15 + "s";
              result!.appendChild(p);
              window.setTimeout(() => p.classList.add("show"), 50);
            });
          }, 1900);
        }
      }
      typePrompt();
    }
    const aiCard = $("aiCard");
    if (aiCard) {
      const aiObserver = new IntersectionObserver((entries) => { entries.forEach((entry) => { if (entry.isIntersecting) { runAiDemo(); aiObserver.disconnect(); } }); }, { threshold: 0.4 });
      aiObserver.observe(aiCard);
    }

    /* ---- how it works cycle ---- */
    const sStages = root.querySelectorAll<HTMLElement>(".s-stage");
    const stepCards = root.querySelectorAll<HTMLElement>(".step-card");
    let stepIndex = 0, stepTimer = 0;
    function runOccasionStagger(selectIdx: number) {
      root!.querySelectorAll(".occasion-card").forEach((c) => { c.classList.remove("show", "selected"); });
      root!.querySelectorAll<HTMLElement>(".occasion-card").forEach((c, i) => {
        const d = +(c.dataset.d || "0");
        window.setTimeout(() => { c.classList.add("show"); if (i === selectIdx) window.setTimeout(() => c.classList.add("selected"), 350); }, d + 150);
      });
    }
    function showStep(n: number) {
      stepIndex = n;
      sStages.forEach((s) => s.classList.toggle("active", +(s.dataset.s || "-1") === n));
      stepCards.forEach((c) => c.classList.toggle("active", +(c.dataset.st || "-1") === n));
      if (n === 0) runOccasionStagger(0);
    }
    function startStepCycle() {
      clearInterval(stepTimer);
      if (!auto) return;
      stepTimer = window.setInterval(() => { if ((window as any).__scrolling) return; showStep((stepIndex + 1) % 3); }, 4200);
      timers.push(stepTimer);
    }
    stepCards.forEach((c) => c.addEventListener("click", () => { showStep(+(c.dataset.st || "0")); startStepCycle(); }));
    showStep(0);
    autoPauseCycle(root.querySelector(".steps-split"), startStepCycle, () => clearInterval(stepTimer));

    /* ---- testimonials ---- */
    const testimonials = [
      { text: "Made my parents' anniversary page in my lunch break. My mom cried when she opened it — worth every minute.", name: "Ananya R.", loc: "Bangalore", emoji: "💕", tag: "Anniversary" },
      { text: "Sent it to 40 wedding guests over WhatsApp instead of printing cards. Half of them replied saying it was the nicest invite they'd gotten.", name: "Rohan Mehta", loc: "Mumbai", emoji: "💍", tag: "Wedding" },
      { text: "Used it for Eid greetings to family abroad. The countdown made it feel like we were celebrating together.", name: "Fatima Sheikh", loc: "Hyderabad", emoji: "🌙", tag: "Eid" },
      { text: "The AI message for my sister's birthday sounded like I wrote it, not a bot. Genuinely surprised.", name: "Karthik N.", loc: "Chennai", emoji: "🎂", tag: "Birthday" },
      { text: "Built a Diwali page for our whole extended family — 60 people saw it, way more personal than a forwarded GIF.", name: "Priya Desai", loc: "Ahmedabad", emoji: "🪔", tag: "Diwali" },
      { text: "Used it for my daughter's first birthday. The photo gallery with our song playing — that's the part everyone remembers.", name: "Simran Kaur", loc: "Delhi", emoji: "🎈", tag: "1st Birthday" },
    ];
    const marquee = $("marquee");
    if (marquee) {
      const initials = (name: string) => name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
      const palette = [{ a: "#3d0c11", on: "#fff" }, { a: "#a13540", on: "#fff" }];
      const sparkPath = '<path d="M12 2 C 12.8 8,16 11.2,22 12 C 16 12.8,12.8 16,12 22 C 11.2 16,8 12.8,2 12 C 8 11.2,11.2 8,12 2 Z"/>';
      const cardHtml = (t: typeof testimonials[number], i: number) => {
        const c = palette[i % palette.length];
        return '<div class="t-card" style="--acc:' + c.a + ';--on:' + c.on + '">'
          + '<span class="t-tape tt-top"></span><span class="t-tape tt-bottom"></span>'
          + '<div class="t-label"><span class="t-dot"></span>' + t.emoji + " " + t.tag + "</div>"
          + '<svg class="t-spark" viewBox="0 0 24 24" fill="currentColor">' + sparkPath + "</svg>"
          + '<div class="t-qmark">&ldquo;</div>'
          + "<p>" + t.text + "</p>"
          + '<div class="t-foot"><span class="t-avatar">' + initials(t.name) + "</span>"
          + '<div class="t-who"><div class="t-name">' + t.name + '<svg class="t-scribble" viewBox="0 0 120 12" preserveAspectRatio="none"><path pathLength="1" d="M3 7 C 30 2,60 11,90 5 S 117 8,117 6"/></svg></div>'
          + '<div class="t-loc">' + t.loc + "</div></div></div>"
          + "</div>";
      };
      marquee.innerHTML = testimonials.map(cardHtml).join("") + testimonials.map(cardHtml).join("");
    }

    /* ---- CTA routing ---- */
    const ctaEls = Array.from(root.querySelectorAll<HTMLElement>(".btn-primary"));
    const onCta = (e: Event) => { e.preventDefault(); router.push("/templates"); };
    ctaEls.forEach((el) => el.addEventListener("click", onCta));

    return () => {
      self._destroyed = true;
      window.removeEventListener("scroll", scrollHandler);
      timers.forEach((t) => { clearTimeout(t); clearInterval(t); });
      ctaEls.forEach((el) => el.removeEventListener("click", onCta));
    };
  }, [router]);

  return (
    <div className="ssland" ref={rootRef}>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div className="ssland-body" dangerouslySetInnerHTML={{ __html: MARKUP }} />
    </div>
  );
}
