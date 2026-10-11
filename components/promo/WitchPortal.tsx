"use client";

// ─── The witch portal: opening a Halloween template ──────────────────────────
//
// When a visitor opens a Halloween template from the site (the drop cards, the
// gallery cards for those slugs, the gallery teaser, the drop page's CTAs) the
// click plays a short transition instead of a plain route change:
//
//   0 ms     a haunted night fades in over the page (the crooked house on its
//            hill with one flickering window, the moon behind its tower, a bare
//            tree, graves and a fence, drifting fog, bats, orbs) and the witch's
//            cackle starts (inside the click, so the browser allows the sound)
//   ~180 ms  the witch-seal on her broom flies right → left on a gentle arc,
//            facing where she goes, gold-and-lilac sparkles trailing behind her
//   ~600 ms  the route is pushed (it was prefetched on the click)
//   ~1.3 s   once the new page is on screen the veil dissolves into it
//
// Tap anywhere to skip. Under reduced motion it is only a quick fade, no
// flight and no sound. Open in a new tab / with a modifier key → the browser's
// own behaviour, untouched. Outside Halloween mode the links behave normally.
//
// The overlay is plain DOM on <body>, not React state: it has to survive the
// route change (the page that started it unmounts mid-flight). A template
// opened directly (typed URL, shared link) never sees it, so nothing plays
// twice; the cackle is a one-shot Audio that ends on its own (faded out after
// a few seconds) and never touches the template's own music.

import { useCallback, type MouseEvent as ReactMouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useIsHalloween } from "@/hooks/useSeason";
import { HALLOWEEN_GIF, HALLOWEEN_SLUGS } from "@/lib/season";

const WITCH_SRC = HALLOWEEN_GIF("witch-seal-broom.webp");
const LAUGH_SRC = HALLOWEEN_GIF("witch-laugh.mp3");
const FLIGHT_MS = 1150;
const PUSH_AT_MS = 600;

type Push = (href: string) => void;
type Prefetch = (href: string) => void;

let running = false;
let witchWarm = false;

/** Fetch the witch GIF ahead of the click (pointer down / hover), so she flies at once. */
export function warmWitch() {
  if (witchWarm || typeof window === "undefined") return;
  witchWarm = true;
  const img = new Image();
  img.decoding = "async";
  img.src = WITCH_SRC;
}

/** True for a /happy-halloween… template path. */
export function isHalloweenTemplateHref(href: string): boolean {
  const slug = href.replace(/^https?:\/\/[^/]+/, "").replace(/^\//, "").split(/[?#/]/)[0];
  return (HALLOWEEN_SLUGS as readonly string[]).includes(slug);
}

function playCackle(): HTMLAudioElement | null {
  try {
    const a = new Audio(LAUGH_SRC);
    a.volume = 0.85;
    const p = a.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
    // Fade it out after the transition so it never sits on top of the template's own music.
    window.setTimeout(() => {
      const t0 = performance.now();
      const step = () => {
        const k = Math.min(1, (performance.now() - t0) / 900);
        try { a.volume = Math.max(0, 0.85 * (1 - k)); } catch {}
        if (k < 1) requestAnimationFrame(step);
        else { try { a.pause(); a.src = ""; } catch {} }
      };
      requestAnimationFrame(step);
    }, 3200);
    return a;
  } catch {
    return null;
  }
}

const pathOf = (href: string) => href.replace(/^https?:\/\/[^/]+/, "").split(/[?#]/)[0] || "/";
/** The new route is on screen: the URL changed and no route skeleton (loading.tsx) is still showing. */
const onScreen = (target: string) =>
  pathOf(window.location.pathname) === target && !document.querySelector('[aria-busy="true"].skRoot');

/**
 * Run the portal and navigate to `href`. Safe to call from any click handler;
 * a second call while one is running is ignored.
 */
export function openWithWitch(href: string, push: Push, prefetch?: Prefetch) {
  if (typeof window === "undefined") return push(href);
  if (running) return;
  running = true;
  try { prefetch?.(href); } catch {}

  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if (!reduced) playCackle();

  const root = document.createElement("div");
  root.className = "wpo" + (reduced ? " wpo-rm" : "");
  root.setAttribute("aria-hidden", "true");
  root.innerHTML =
    `<style>${WPO_CSS}</style><span class="wpo-scene">${SCENE_HTML}</span>` +
    (reduced
      ? ""
      : `<span class="wpo-path">${Array.from({ length: 9 }, (_, i) => `<i class="wpo-spark" style="--k:${i}"></i>`).join("")}` +
        `<span class="wpo-witch"><img src="${WITCH_SRC}" alt="" width="280" height="280" decoding="async" /></span></span>`) +
    `<span class="wpo-cap"><em>Opening your haunted letter…</em><i class="wpo-glow"></i></span>`;
  document.body.appendChild(root);
  // let the browser paint the start state, then run
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add("wpo-on")));

  const target = pathOf(href);
  let pushed = false;
  const doPush = () => {
    if (pushed) return;
    pushed = true;
    push(href);
  };
  const t0 = performance.now();
  const minShow = reduced ? 220 : FLIGHT_MS + 160;
  const pushTimer = window.setTimeout(doPush, reduced ? 160 : PUSH_AT_MS);

  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    window.clearTimeout(pushTimer);
    window.clearInterval(poll);
    root.classList.add("wpo-out");
    window.setTimeout(() => { root.remove(); running = false; }, reduced ? 260 : 520);
  };
  // Dissolve once the new page is on screen (or give up after 6 s and reveal whatever is there).
  const poll = window.setInterval(() => {
    const arrived = pushed && onScreen(target);
    const elapsed = performance.now() - t0;
    if ((arrived && elapsed >= minShow) || elapsed > 6000) {
      // one more frame so the template has painted under the veil
      requestAnimationFrame(() => requestAnimationFrame(finish));
      window.clearInterval(poll);
    }
  }, 50);

  // Tap to skip: navigate now, dissolve as soon as the page is there.
  root.addEventListener("pointerdown", () => {
    doPush();
    root.classList.add("wpo-skip");
    const wait = window.setInterval(() => {
      if (onScreen(target) || performance.now() - t0 > 6000) {
        window.clearInterval(wait);
        finish();
      }
    }, 40);
  }, { once: true });
}

/** True when a click should open normally (new tab, download, middle click…). */
function isModified(e: ReactMouseEvent) {
  return e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
}

/**
 * `const go = useWitchPortal()` → `onClick={(e) => go(e, href)}` on any link to
 * a Halloween surface. Returns false (and does nothing) outside Halloween mode.
 */
export function useWitchPortal() {
  const router = useRouter();
  const on = useIsHalloween();
  return useCallback(
    (e: ReactMouseEvent, href: string) => {
      if (!on || isModified(e)) return false;
      e.preventDefault();
      openWithWitch(href, (h) => router.push(h), (h) => router.prefetch(h));
      return true;
    },
    [on, router],
  );
}

type WitchLinkProps = Omit<React.ComponentProps<typeof Link>, "href"> & { href: string };

/** A next/link that opens through the witch portal in Halloween mode. */
export function WitchLink({ href, onClick, onPointerEnter, onPointerDown, ...rest }: WitchLinkProps) {
  const go = useWitchPortal();
  return (
    <Link
      href={href}
      {...rest}
      onPointerEnter={(e) => { warmWitch(); onPointerEnter?.(e); }}
      onPointerDown={(e) => { warmWitch(); onPointerDown?.(e); }}
      onClick={(e) => { onClick?.(e); go(e, href); }}
    />
  );
}

// ─── The haunted scene behind the flight ─────────────────────────────────────
// Static inline SVG strings (no request, no React): the house is the one from the
// /halloween-offer hero (HauntedScene.tsx) without its tree/hill/fence, which are
// drawn here as their own pieces so each can be placed per viewport. Ids are
// prefixed `wpo-` so they never collide with the page underneath.

const INK = "#16111f";
const SIL = "#0c0818";

const HOUSE_SVG = `<svg class="wpo-house" viewBox="54 14 286 400" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
<defs>
<radialGradient id="wpo-win" cx="50%" cy="62%" r="75%"><stop offset="0" stop-color="#fff4c2"/><stop offset=".55" stop-color="#ffc65c"/><stop offset="1" stop-color="#ff9a3c"/></radialGradient>
<radialGradient id="wpo-halo" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="rgba(255,195,90,.6)"/><stop offset="1" stop-color="rgba(255,195,90,0)"/></radialGradient>
<linearGradient id="wpo-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a4a84"/><stop offset="1" stop-color="#2f2450"/></linearGradient>
<linearGradient id="wpo-tower" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#46376c"/><stop offset="1" stop-color="#2c2150"/></linearGradient>
<linearGradient id="wpo-roof" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2f58"/><stop offset="1" stop-color="#211a3a"/></linearGradient>
<linearGradient id="wpo-rim" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="rgba(255,236,190,0)"/><stop offset="1" stop-color="rgba(255,236,190,.12)"/></linearGradient>
</defs>
<path d="M222 108 L244 110 L242 168 L220 166 Z" fill="#33285a" stroke="${INK}" stroke-width="3"/>
<rect x="216" y="100" width="32" height="11" rx="2" fill="#2b2245" stroke="${INK}" stroke-width="3" transform="rotate(3 232 105)"/>
<path d="M86 214 L262 206 L268 404 L80 404 Z" fill="url(#wpo-wall)" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
<path d="M86 214 L262 206 L268 404 L80 404 Z" fill="url(#wpo-rim)"/>
<path d="M84 240 L263 233 M83 300 L265 296 M82 350 L267 348" stroke="rgba(22,17,31,.45)" stroke-width="1.6"/>
<path d="M62 222 L176 92 L286 212 Z" fill="url(#wpo-roof)" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
<path d="M96 184 Q106 190 116 184 Q126 190 136 184 Q146 190 156 184 Q166 190 176 184 Q186 190 196 184 Q206 190 216 184 Q226 190 236 184 Q246 190 254 186 M122 154 Q132 160 142 154 Q152 160 162 154 Q172 160 182 154 Q192 160 202 154 Q212 160 222 154 Q228 158 230 157 M148 124 Q158 130 168 124 Q178 130 188 124 Q198 130 204 126" stroke="rgba(22,17,31,.65)" stroke-width="1.6" fill="none"/>
<path d="M176 92 L178 72" stroke="${INK}" stroke-width="3"/>
<circle cx="178" cy="168" r="19" fill="#1c1532" stroke="${INK}" stroke-width="3.5"/>
<path d="M178 149 L178 187 M159 168 L197 168" stroke="${INK}" stroke-width="2.6"/>
<rect x="104" y="244" width="40" height="48" rx="7" fill="#1c1532" stroke="${INK}" stroke-width="3.5"/>
<rect class="wpo-lit wpo-lit2" x="106" y="246" width="36" height="44" rx="5" fill="rgba(255,170,80,.26)"/>
<path d="M124 244 L124 292 M104 266 L144 266" stroke="${INK}" stroke-width="2.6"/>
<path d="M92 242 L102 244 L101 294 L90 292 Z" fill="#2b2245" stroke="${INK}" stroke-width="2" transform="rotate(-4 96 268)"/>
<rect x="208" y="240" width="36" height="48" rx="7" fill="#1c1532" stroke="${INK}" stroke-width="3.5"/>
<path d="M226 240 L226 288 M208 262 L244 262" stroke="${INK}" stroke-width="2.6"/>
<path d="M246 240 L256 238 L257 290 L247 290 Z" fill="#2b2245" stroke="${INK}" stroke-width="2" transform="rotate(5 251 264)"/>
<path d="M250 168 L316 162 L322 404 L250 404 Z" fill="url(#wpo-tower)" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
<path d="M238 174 L284 44 L332 166 Z" fill="url(#wpo-roof)" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
<path d="M256 128 Q264 133 272 128 Q280 133 288 128 Q296 133 304 128 Q310 132 314 130 M266 96 Q274 101 282 96 Q290 101 298 96 Q302 99 304 98" stroke="rgba(22,17,31,.65)" stroke-width="1.5" fill="none"/>
<path d="M284 44 L285 24" stroke="${INK}" stroke-width="3"/>
<path d="M285 24 L298 29 L285 34" fill="#ff9a3c"/>
<circle class="wpo-halo" cx="285" cy="216" r="46" fill="url(#wpo-halo)"/>
<path class="wpo-lit" d="M271 234 L271 212 Q285 190 299 212 L299 234 Z" fill="url(#wpo-win)" stroke="${INK}" stroke-width="3.5"/>
<path d="M285 196 L285 234 M271 218 L299 218" stroke="${INK}" stroke-width="2.4"/>
<path d="M279 234 L279 224 L281 219 L283 223 L287 223 L289 219 L291 224 L291 234 Z" fill="rgba(40,22,64,.78)"/>
<path d="M274 312 L274 292 Q285 278 296 292 L296 312 Z" fill="#1c1532" stroke="${INK}" stroke-width="3"/>
<path d="M138 300 L178 276 L218 298 Z" fill="#2b2245" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
<rect x="143" y="298" width="7" height="106" fill="#33285a" stroke="${INK}" stroke-width="2"/>
<rect x="207" y="296" width="7" height="108" fill="#33285a" stroke="${INK}" stroke-width="2"/>
<path d="M156 404 L156 330 Q178 298 200 330 L200 404 Z" fill="#5f4a9c" stroke="${INK}" stroke-width="3"/>
<path d="M166 322 L166 404 M178 314 L178 404 M190 322 L190 404" stroke="rgba(22,17,31,.35)" stroke-width="1.4"/>
<circle cx="178" cy="368" r="4.5" fill="none" stroke="#e8b86a" stroke-width="2"/>
<g transform="translate(224 306)"><path d="M0 0 L0 -8" stroke="${INK}" stroke-width="2"/><rect class="wpo-lit" x="-6" y="0" width="12" height="16" rx="3" fill="#ffc35a" stroke="${INK}" stroke-width="2"/></g>
</svg>`;

const TREE_SVG = `<svg class="wpo-tree" viewBox="0 0 200 400" preserveAspectRatio="xMinYMax meet" aria-hidden="true">
<path d="M78 400 C88 340 92 292 86 252 C81 218 62 194 30 178 L35 170 C63 182 80 198 89 216 C92 182 84 150 62 122 L70 117 C93 144 103 174 103 206 C109 172 126 148 152 134 C166 126 178 112 186 94 L194 98 C186 120 170 136 156 146 C132 162 118 188 114 224 C111 266 114 334 126 400 Z" fill="${SIL}"/>
<path d="M50 186 C42 172 30 164 14 162 M66 128 C58 112 54 98 56 80 M62 132 C48 124 38 114 30 98 M172 118 C178 106 188 100 200 100 M152 136 C154 118 150 106 140 96 M40 176 C30 182 20 194 16 206 M184 98 C182 86 186 76 194 68" stroke="${SIL}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
<path d="M140 150 L140 168" stroke="${SIL}" stroke-width="1.2"/>
<path d="M134 168 C134 164 146 164 146 168 L144 176 L136 176 Z" fill="${SIL}"/>
</svg>`;

const YARD_SVG = `<svg class="wpo-yard" viewBox="0 0 320 130" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
<g fill="#1a1330" stroke="rgba(185,166,240,.22)" stroke-width="1.5">
${[10, 34, 58, 82, 106, 130, 154].map((x, i) => `<path d="M${x - 8} 130 L${x - 8} ${82 + (i % 2) * 4} L${x} ${72 + (i % 2) * 4} L${x + 8} ${82 + (i % 2) * 4} L${x + 8} 130 Z" transform="rotate(${[-3, 2, -1, 4, -2, 6, 9][i]} ${x} 130)"/>`).join("")}
<rect x="0" y="94" width="166" height="6" transform="rotate(1.5 0 94)"/>
</g>
<g fill="#241b3e" stroke="rgba(185,166,240,.28)" stroke-width="2">
<path d="M190 130 L190 72 Q214 40 238 72 L238 130 Z" transform="rotate(-5 214 130)"/>
<path d="M256 130 L256 92 Q272 72 288 92 L288 130 Z" transform="rotate(7 272 130)"/>
<path d="M296 130 L296 84 L288 84 L288 74 L296 74 L296 62 L306 62 L306 74 L314 74 L314 84 L306 84 L306 130 Z"/>
</g>
<path d="M205 82 L221 82 M213 74 L213 98" stroke="rgba(14,10,28,.6)" stroke-width="2.4" transform="rotate(-5 214 130)"/>
<text x="214" y="114" text-anchor="middle" font-family="Georgia, serif" font-size="11" fill="rgba(185,166,240,.45)" transform="rotate(-5 214 130)">RIP</text>
</svg>`;

const GROUND_SVG = `<svg class="wpo-ground" viewBox="0 0 1000 200" preserveAspectRatio="none" aria-hidden="true">
<path d="M0 70 C140 30 300 52 470 58 C640 64 820 20 1000 46 L1000 200 L0 200 Z" fill="#150f26"/>
<path d="M0 112 C180 78 360 96 520 102 C700 108 860 78 1000 92 L1000 200 L0 200 Z" fill="${SIL}"/>
<path d="M0 112 C180 78 360 96 520 102 C700 108 860 78 1000 92" fill="none" stroke="rgba(185,166,240,.16)" stroke-width="2" vector-effect="non-scaling-stroke"/>
</svg>`;

const BAT = `<svg viewBox="0 0 64 32" aria-hidden="true"><path d="M32 10 C29 6 27 6 26 9 C22 4 14 3 6 6 C10 8 12 12 11 16 C15 13 20 14 22 18 C25 15 28 16 32 22 C36 16 39 15 42 18 C44 14 49 13 53 16 C52 12 54 8 58 6 C50 3 42 4 38 9 C37 6 35 6 32 10 Z" fill="#0d0918"/><circle cx="30" cy="12" r="1" fill="#ffc35a"/><circle cx="34" cy="12" r="1" fill="#ffc35a"/></svg>`;

const SCENE_HTML =
  `<span class="wpo-veil"></span><span class="wpo-stars"></span>` +
  `<span class="wpo-stage"><span class="wpo-moon"></span>${HOUSE_SVG}</span>` +
  [0, 1, 2].map((i) => `<span class="wpo-bat wpo-bat${i}"><span>${BAT}</span></span>`).join("") +
  TREE_SVG +
  `<span class="wpo-fog wpo-fogB"></span>${GROUND_SVG}${YARD_SVG}<span class="wpo-fog wpo-fogF"></span>` +
  [0, 1, 2, 3, 4].map((i) => `<i class="wpo-orb wpo-orb${i}"></i>`).join("") +
  `<span class="wpo-vig"></span>`;

const WPO_CSS = `
.wpo { position: fixed; inset: 0; z-index: 2147483000; overflow: hidden; pointer-events: auto; cursor: pointer; contain: strict;
  --gh: clamp(96px, 19vh, 210px); --ww: clamp(140px, 26vw, 240px); }
.wpo-scene, .wpo-scene > * { position: absolute; }
.wpo-scene { inset: 0; opacity: 0; transition: opacity .3s ease; }
.wpo-on .wpo-scene { opacity: 1; }
.wpo-veil { inset: 0;
  background: radial-gradient(60% 45% at 50% 30%, rgba(185,166,240,.22), transparent 70%),
    radial-gradient(90% 50% at 50% 105%, rgba(255,154,60,.14), transparent 70%),
    linear-gradient(180deg, #120e22 0%, #221a3c 48%, #2a2048 72%, #120e21 100%); }
.wpo-stars { inset: 0 0 35% 0; opacity: .9;
  background-image: radial-gradient(1.4px 1.4px at 12% 18%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 28% 8%, #fff 50%, transparent 51%),
    radial-gradient(1.2px 1.2px at 46% 32%, #fff4cf 50%, transparent 51%), radial-gradient(1px 1px at 66% 12%, #fff 50%, transparent 51%),
    radial-gradient(1.6px 1.6px at 84% 40%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 92% 6%, #fff4cf 50%, transparent 51%),
    radial-gradient(1px 1px at 6% 64%, #fff 50%, transparent 51%), radial-gradient(1.2px 1.2px at 38% 70%, #fff 50%, transparent 51%),
    radial-gradient(1.3px 1.3px at 20% 48%, #e2d8fa 50%, transparent 51%), radial-gradient(1px 1px at 74% 26%, #fff 50%, transparent 51%),
    radial-gradient(1.1px 1.1px at 56% 6%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 3% 30%, #e2d8fa 50%, transparent 51%);
  animation: wpoTwinkle 2.4s ease-in-out infinite alternate; }
@keyframes wpoTwinkle { to { opacity: .55; } }

/* the house on its hill, the moon rising behind its tower */
.wpo-stage { left: 50%; bottom: calc(var(--gh) * .5); height: min(46vh, 124vw); aspect-ratio: 286 / 400; transform: translateX(-50%); }
.wpo-house { position: absolute; inset: 0; width: 100%; height: 100%; filter: drop-shadow(0 0 30px rgba(10,6,22,.6)); }
.wpo-moon { position: absolute; z-index: -1; top: -16%; right: -30%; width: 72%; aspect-ratio: 1; border-radius: 50%; transform: scale(.9);
  transition: transform 1.6s cubic-bezier(.2,.7,.2,1);
  background: radial-gradient(circle at 38% 36%, #fffbe6 0%, #f6e7a6 46%, #e4cd84 100%);
  box-shadow: 0 0 70px 24px rgba(246,231,166,.26), 0 0 200px 90px rgba(185,166,240,.14); }
.wpo-moon::after { content: ""; position: absolute; inset: 0; border-radius: 50%; opacity: .22;
  background: radial-gradient(circle at 64% 58%, #c9b06a 0 9%, transparent 10%), radial-gradient(circle at 40% 70%, #c9b06a 0 6%, transparent 7%), radial-gradient(circle at 30% 44%, #d6be76 0 5%, transparent 6%); }
.wpo-on .wpo-moon { transform: scale(1); }
.wpo-lit { animation: wpoFlick 2.6s steps(1) infinite; }
.wpo-lit2 { animation-duration: 3.4s; animation-delay: .7s; }
.wpo-halo { animation: wpoHalo 2.6s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
@keyframes wpoFlick { 0%, 100% { opacity: 1; } 18% { opacity: .55; } 21% { opacity: 1; } 56% { opacity: .75; } 59% { opacity: 1; } }
@keyframes wpoHalo { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: .65; transform: scale(.88); } }

.wpo-tree { left: -6vw; bottom: calc(var(--gh) * .38); height: min(42vh, 100vw); width: auto; aspect-ratio: 1 / 2; }
.wpo-ground { left: 0; bottom: 0; width: 100%; height: var(--gh); }
.wpo-yard { right: -3vw; bottom: calc(var(--gh) * .3); width: min(54vw, 280px); height: auto; aspect-ratio: 320 / 130; }

/* fog drifting across the hill, one layer behind the yard, one in front */
.wpo-fog { left: -50%; width: 200%; height: calc(var(--gh) * 1.1); pointer-events: none;
  background: radial-gradient(14% 42% at 8% 60%, rgba(214,204,245,.20), transparent 72%), radial-gradient(18% 36% at 30% 50%, rgba(214,204,245,.16), transparent 72%),
    radial-gradient(14% 46% at 52% 62%, rgba(214,204,245,.18), transparent 72%), radial-gradient(20% 38% at 76% 52%, rgba(214,204,245,.15), transparent 72%),
    radial-gradient(14% 44% at 94% 60%, rgba(214,204,245,.18), transparent 72%);
  animation: wpoFog 9s ease-in-out infinite alternate; }
.wpo-fogB { bottom: calc(var(--gh) * .42); }
.wpo-fogF { bottom: calc(var(--gh) * -.2); opacity: .8; animation-duration: 7s; animation-direction: alternate-reverse; }
@keyframes wpoFog { from { transform: translateX(-6%); } to { transform: translateX(6%); } }

/* bats and orbs */
.wpo-bat { width: clamp(26px, 4vw, 44px); aspect-ratio: 2; animation: wpoBat 6s ease-in-out infinite alternate; }
.wpo-bat > span { display: block; width: 100%; height: 100%; animation: wpoFlap .28s ease-in-out infinite alternate; transform-origin: 50% 40%; }
.wpo-bat svg { display: block; width: 100%; height: 100%; }
.wpo-bat0 { left: 62%; top: 14%; }
.wpo-bat1 { left: 76%; top: 22%; width: clamp(18px, 2.6vw, 30px); animation-duration: 5s; animation-delay: -2s; }
.wpo-bat2 { left: 20%; top: 12%; width: clamp(20px, 3vw, 34px); animation-duration: 7s; animation-delay: -4s; }
@keyframes wpoBat { from { transform: translate(0, 0) rotate(-6deg); } to { transform: translate(-6vw, 3vh) rotate(6deg); } }
@keyframes wpoFlap { from { transform: scaleY(1); } to { transform: scaleY(.45); } }
.wpo-orb { width: 8px; height: 8px; border-radius: 50%; background: radial-gradient(circle, #fff7d6 0%, #ffc35a 45%, transparent 72%);
  box-shadow: 0 0 14px 5px rgba(255,195,90,.35); animation: wpoOrb 3.6s ease-in-out infinite alternate; }
.wpo-orb:nth-of-type(even) { width: 6px; height: 6px; background: radial-gradient(circle, #fff 0%, #cfc2f7 50%, transparent 72%); box-shadow: 0 0 12px 4px rgba(185,166,240,.4); }
.wpo-orb0 { left: 14%; bottom: calc(var(--gh) * 1.3); }
.wpo-orb1 { left: 31%; bottom: calc(var(--gh) * .9); animation-delay: -1s; }
.wpo-orb2 { left: 72%; bottom: calc(var(--gh) * 1.1); animation-delay: -2s; }
.wpo-orb3 { left: 86%; bottom: calc(var(--gh) * 1.6); animation-delay: -.5s; }
.wpo-orb4 { left: 46%; bottom: calc(var(--gh) * .6); animation-delay: -2.6s; }
@keyframes wpoOrb { from { transform: translate(0, 0); opacity: .9; } to { transform: translate(8px, -18px); opacity: .35; } }
.wpo-vig { inset: 0; background: radial-gradient(120% 90% at 50% 42%, transparent 55%, rgba(6,3,14,.7) 100%); }

/* the flight: right → left, one shared path for the witch and her sparkle trail
   (each spark runs it a beat later, so the trail streams out behind her, to the right) */
.wpo-path { position: absolute; left: 0; top: 30%; width: 100%; height: 0; z-index: 2; }
.wpo-witch, .wpo-spark { position: absolute; left: 0; top: 0; will-change: transform; transform: translate(110vw, 0); }
.wpo-witch { width: var(--ww); aspect-ratio: 1; margin-top: calc(var(--ww) / -2); filter: drop-shadow(0 0 22px rgba(255,214,150,.45)); }
.wpo-witch img { display: block; width: 100%; height: 100%; transform: scaleX(-1); }
.wpo-on .wpo-witch { animation: wpoFly ${FLIGHT_MS}ms cubic-bezier(.45,.05,.55,.95) .18s forwards; }
.wpo-spark { width: 10px; height: 10px; margin: -5px 0 0 calc(var(--ww) * .82); border-radius: 50%; opacity: 0;
  background: radial-gradient(circle, #fff7d6 0%, #ffc35a 45%, rgba(185,166,240,0) 72%); box-shadow: 0 0 12px 4px rgba(255,195,90,.45); }
.wpo-spark:nth-child(even) { width: 6px; height: 6px; background: radial-gradient(circle, #fff 0%, #cfc2f7 50%, transparent 72%); box-shadow: 0 0 10px 3px rgba(185,166,240,.5); }
.wpo-on .wpo-spark { animation: wpoFly ${FLIGHT_MS}ms cubic-bezier(.45,.05,.55,.95) forwards, wpoSpark ${FLIGHT_MS}ms linear forwards;
  animation-delay: calc(.18s + var(--k) * 55ms), calc(.18s + var(--k) * 55ms); }
.wpo-spark:nth-child(3n) { margin-top: 6px; }
.wpo-spark:nth-child(3n+1) { margin-top: -14px; }
@keyframes wpoFly {
  0%   { transform: translate(110vw, 10vh) rotate(8deg); }
  30%  { transform: translate(calc(70vw - var(--ww) * .5), -4vh) rotate(3deg); }
  55%  { transform: translate(calc(42vw - var(--ww) * .5), -9vh) rotate(-2deg); }
  80%  { transform: translate(calc(12vw - var(--ww) * .6), -5vh) rotate(-6deg); }
  100% { transform: translate(calc(-20vw - var(--ww)), 4vh) rotate(-10deg); }
}
@keyframes wpoSpark { 0% { opacity: 0; } 12% { opacity: 1; } 80% { opacity: .8; } 100% { opacity: 0; } }

/* the caption and a small glow that fills while the letter opens */
.wpo-cap { position: absolute; z-index: 3; left: 50%; bottom: calc(max(16px, var(--gh) * .1) + env(safe-area-inset-bottom, 0px)); transform: translate(-50%, 6px); opacity: 0;
  display: flex; flex-direction: column; align-items: center; gap: 10px; white-space: nowrap; transition: opacity .4s ease .35s, transform .6s ease .35s; }
.wpo-cap em { font: italic 600 clamp(15px, 2.2vh, 20px)/1.2 var(--font-playfair), 'Playfair Display', Georgia, serif; letter-spacing: .01em; color: #f3eefe;
  text-shadow: 0 0 18px rgba(185,166,240,.55), 0 2px 10px rgba(6,3,14,.9); }
.wpo-glow { position: relative; display: block; width: clamp(96px, 14vw, 150px); height: 3px; border-radius: 3px; overflow: hidden; background: rgba(185,166,240,.18); }
.wpo-glow::after { content: ""; position: absolute; inset: 0; border-radius: inherit; transform-origin: left; transform: scaleX(0);
  background: linear-gradient(90deg, #b9a6f0, #ffc35a, #ff9a3c); box-shadow: 0 0 10px rgba(255,170,80,.8); }
.wpo-on .wpo-cap { opacity: 1; transform: translate(-50%, 0); }
.wpo-on .wpo-glow::after { animation: wpoFill 1.6s cubic-bezier(.3,.6,.3,1) .2s forwards; }
@keyframes wpoFill { 0% { transform: scaleX(0); } 70% { transform: scaleX(.86); } 100% { transform: scaleX(.96); } }

/* wide screens: the house steps right of centre, a bigger moon, the tree and the yard spread out */
@media (min-aspect-ratio: 1/1) {
  .wpo { --ww: clamp(170px, 17vw, 260px); }
  .wpo-stage { left: 64%; height: min(66vh, 720px); }
  .wpo-moon { top: -12%; right: -46%; width: 82%; }
  .wpo-tree { left: 2vw; height: min(64vh, 680px); }
  .wpo-yard { right: auto; left: 11vw; bottom: calc(var(--gh) * .3); width: min(26vw, 380px); }
  .wpo-bat0 { left: 52%; top: 12%; }
  .wpo-bat1 { left: 84%; top: 10%; }
  .wpo-bat2 { left: 30%; top: 18%; }
  .wpo-path { top: 28%; }
}
/* tablet portrait: a little more house */
@media (min-width: 640px) and (max-aspect-ratio: 1/1) {
  .wpo-stage { height: min(44vh, 80vw); }
  .wpo-tree { left: -2vw; height: min(46vh, 80vw); }
  .wpo-yard { width: min(46vw, 380px); right: 0; }
}

/* the dissolve into the template */
.wpo-out { pointer-events: none; }
.wpo-out .wpo-scene { opacity: 0; transition: opacity .5s ease; }
.wpo-out .wpo-moon { transform: scale(1.12); }
.wpo-out .wpo-path, .wpo-out .wpo-cap { opacity: 0; transition: opacity .3s ease; }
.wpo-skip .wpo-path { opacity: 0; transition: opacity .2s ease; }

.wpo-rm .wpo-scene { transition-duration: .18s; }
.wpo-rm.wpo-out .wpo-scene, .wpo-rm.wpo-out .wpo-cap { transition-duration: .22s; }
.wpo-rm *, .wpo-rm *::after { animation: none !important; }
.wpo-rm .wpo-moon { transition: none; transform: none; }
.wpo-rm .wpo-glow { display: none; }
`;
