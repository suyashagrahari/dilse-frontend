// Server component — rendered into the INITIAL HTML so it paints on first paint,
// seamlessly continuing from the OS/PWA splash (same cream background, same
// circular logo). The "SubhSandesh" wordmark writes itself on (shared footer
// glyphs) then a gold shine sweeps the dark-maroon fill.
//
// IMPORTANT (fixes the refresh bug): we NEVER removeChild the splash node — doing
// that before React hydrates causes a hydration mismatch that breaks the home
// page. Instead:
//   • a pre-paint script adds `ss-splash-seen` to <html> if this session already
//     saw the splash → CSS hides it from the first frame (no flash on refresh),
//   • first-time removal is done by toggling classes (opacity → display:none),
//   • the session is marked "seen" immediately so rapid refreshes never replay it.

import { WM_VB, WORDMARK_GLYPHS } from "@/lib/wordmarkGlyphs";
import SplashGuard from "@/components/SplashGuard";

const SPLASH_CSS = `
#ss-splash{position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;
  background:radial-gradient(130% 130% at 50% 30%,#fdf9f4 0%,#f7efe7 55%,#efe3d3 100%);
  opacity:1;transition:opacity .6s ease,transform .6s ease;will-change:opacity,transform;overflow:hidden}
#ss-splash.ss-hide{opacity:0;transform:scale(1.03);pointer-events:none}
#ss-splash.ss-gone{display:none}
html.ss-splash-seen #ss-splash{display:none}
/* Installed PWA (standalone): the OS shows a brief static splash (cream tile +
   gift icon) that cannot be removed. Our animated "SubhSandesh" loader now plays
   right after it — same cream background, so it hands off seamlessly and the user
   gets the animated wordmark instead of a static icon sitting there. */
#ss-splash .ss-stack{position:relative;text-align:center;padding:24px;width:100%;max-width:760px}
/* semi-rounded square (app-icon shape) with a cream ground so it sits flush on
   the cream splash — static (no pop) so it hands off cleanly from the OS splash */
#ss-splash .ss-logo{width:128px;height:128px;margin:0 auto 30px;border-radius:28px;overflow:hidden;
  background:#fdf9f4;display:grid;place-items:center}
#ss-splash .ss-logo img{width:78%;height:78%;object-fit:contain}
/* footer wordmark, recoloured for the cream ground: maroon outline writes on,
   then the maroon fill glows in with a gold shine sweeping across it */
#ss-splash .ss-wm{display:block;width:min(90vw,680px);height:auto;margin:0 auto;overflow:visible;user-select:none}
#ss-splash .ss-wm-stroke path{fill:none;stroke:#3d0c11;stroke-width:7;stroke-linejoin:round;stroke-linecap:round;
  stroke-dasharray:1;stroke-dashoffset:1;animation:ssDraw 2.1s cubic-bezier(.5,0,.3,1) forwards}
#ss-splash .ss-wm-fill path{fill:url(#ss-shine);fill-opacity:0;animation:ssFillIn .9s ease 1.95s forwards}
#ss-splash .ss-bar{position:relative;width:min(46vw,180px);height:2px;margin:34px auto 0;border-radius:999px;
  background:rgba(61,12,17,.1);overflow:hidden;opacity:0;animation:ssRise .7s 2.4s cubic-bezier(.22,1,.36,1) both}
#ss-splash .ss-bar::after{content:"";position:absolute;top:0;left:-40%;height:100%;width:40%;border-radius:999px;
  background:linear-gradient(90deg,transparent,#c9a84c,#e6c66a,#c9a84c,transparent);animation:ssSlide 1.3s ease-in-out infinite}
@keyframes ssDraw{to{stroke-dashoffset:0}}
@keyframes ssFillIn{to{fill-opacity:1}}
@keyframes ssRise{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}
@keyframes ssSlide{0%{left:-40%}60%,100%{left:100%}}
@media (prefers-reduced-motion:reduce){
  #ss-splash .ss-wm-stroke path{animation:none;stroke-dashoffset:0}
  #ss-splash .ss-wm-fill path{animation:none;fill-opacity:1}
  #ss-splash .ss-bar{animation:none;opacity:1}
  #ss-splash .ss-bar::after{animation:none}
}
`;

// Runs BEFORE the splash paints. If this browser session already saw the splash,
// hide it from the very first frame (via an <html> class + CSS) so a refresh never
// flashes or replays it. Only touches <html> — never the splash node — so React
// hydration is untouched.
const SKIP_JS = `try{var d=document.documentElement;
if(sessionStorage.getItem('ss_splash_shown')==='1')d.classList.add('ss-splash-seen');}catch(e){}`;

// First-time show only. Marks the session "seen" immediately (so rapid refreshes
// skip), then hides after the write-on animation + window load. Never removeChild.
const HIDE_JS = `
(function(){
  var el=document.getElementById('ss-splash');
  if(!el)return;
  el.setAttribute('data-inline','1'); // marks that this node's lifecycle is owned by the inline script (a real document load). The client SplashGuard defers to this and only acts on client-nav / bfcache inserts.
  function markSeen(){try{document.documentElement.classList.add('ss-splash-seen');}catch(e){}}
  var KEY='ss_splash_shown',seen=false;
  try{seen=sessionStorage.getItem(KEY)==='1';}catch(e){}
  if(seen){markSeen();return;} // already hidden by CSS on this refresh
  try{sessionStorage.setItem(KEY,'1');}catch(e){}
  var start=Date.now(),MIN=2900,done=false;
  function hide(){
    if(done)return;done=true;
    var wait=Math.max(0,MIN-(Date.now()-start));
    setTimeout(function(){
      markSeen(); // persist on <html> so any later client-side re-insert is hidden by CSS (no flash, no stuck loader)
      el.classList.add('ss-hide');
      setTimeout(function(){el.classList.add('ss-gone');},650);
    },wait);
  }
  if(document.readyState==='complete')hide();
  else window.addEventListener('load',hide,{once:true});
  setTimeout(hide,8500); // safety cap so it can never hang
})();
`;

export default function AppSplash() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: SKIP_JS }} />
      <style dangerouslySetInnerHTML={{ __html: SPLASH_CSS }} />
      {/* The inline HIDE_JS below sets data-inline="1" on this node BEFORE React
          hydrates (to mark a real document load for SplashGuard). That deliberate
          pre-hydration mutation is exactly what suppressHydrationWarning is for —
          without it React warns "attributes didn't match" on this div. It must NOT
          be hardcoded in JSX: SplashGuard relies on the attribute being ABSENT on
          client-nav/bfcache re-inserts (where the inline script never runs). */}
      <div id="ss-splash" aria-hidden="true" suppressHydrationWarning>
        <div className="ss-stack">
          <div className="ss-logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/indianFestival/logo-sm.webp" alt="" width={100} height={57} fetchPriority="high" />
          </div>
          <svg
            className="ss-wm"
            viewBox={`0 0 ${WM_VB.w} ${WM_VB.h}`}
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label="SubhSandesh"
          >
            <defs>
              {/* dark-maroon fill with a moving gold shine band (the shimmer) */}
              <linearGradient id="ss-shine" gradientUnits="objectBoundingBox" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0.30" stopColor="#3d0c11" />
                <stop offset="0.44" stopColor="#6e2418" />
                <stop offset="0.50" stopColor="#d9b25a" />
                <stop offset="0.56" stopColor="#6e2418" />
                <stop offset="0.70" stopColor="#3d0c11" />
                <animateTransform
                  attributeName="gradientTransform"
                  type="translate"
                  from="-1 0"
                  to="1 0"
                  dur="2.8s"
                  begin="2.6s"
                  repeatCount="indefinite"
                />
              </linearGradient>
            </defs>
            <g transform={`translate(${WM_VB.pad}, ${WM_VB.baseline}) scale(1,-1)`}>
              <g className="ss-wm-fill">
                {WORDMARK_GLYPHS.map((g, i) => (
                  <path key={i} d={g.d} transform={`translate(${g.x},0)`} />
                ))}
              </g>
              <g className="ss-wm-stroke">
                {WORDMARK_GLYPHS.map((g, i) => (
                  <path key={i} d={g.d} pathLength={1} transform={`translate(${g.x},0)`} />
                ))}
              </g>
            </g>
          </svg>

          <div className="ss-bar" />
        </div>

        <script dangerouslySetInnerHTML={{ __html: HIDE_JS }} />
      </div>
      <SplashGuard />
    </>
  );
}
