"use client";
// ─── Scene B: the parallax garden hero (Premium) ─────────────────────────────
//
// Planes, back to front (spec 5.1 / 5.3):
//   plate (static)  → back foliage / gold haze (0.3×) → the gold arch with the
//   names inside it (0.6×) → a long-stem rose that line-draws up the arch and
//   blooms → two large front clusters overlapping the arch edges (1.15×)
//   → ≤ 10 petals falling, a gold light sweep across the arch every 7 s.
// Parallax: CSS scroll-driven animation (`animation-timeline: scroll(root)`)
// on the individual `translate` property, so it composes with the intro
// (`transform`) and the ambient breathe (`rotate`) on one element = one
// layer. No scroll timelines → one rAF loop writes `translate`. Low-end
// devices (≤ 4 cores and ≤ 3 GB) skip parallax and halve the petals.
// Everything is transform/opacity; the stem is one short stroke-draw.

import { useEffect, useMemo, useRef } from "react";
import { Ornament, particleUrl, type ParticleId } from "../../_wedding";
import { ARCH, ARCH_OPENING, PREMIUM_ART, STEM_HEAD, artImg, bloomAspect, type Bloom, type Place } from "./art";
import { dotDate, longDate, niceTime, type WpModel } from "./model";

/** A (possibly cropped, mirrored) pack image filling a box of the bloom's aspect. */
export function BloomImg({ b, cssWidth, lazy, className }: { b: Bloom; cssWidth: number; lazy?: boolean; className?: string }) {
  const c = b.crop ?? { x: 0, y: 0, w: 100, h: 100 };
  const img = artImg(b.id, Math.round((cssWidth * 100) / c.w));
  return (
    <span className={`wp2-bloom${className ? ` ${className}` : ""}`} style={{ aspectRatio: String(bloomAspect(b)) }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt=""
        {...img}
        loading={lazy ? "lazy" : undefined}
        decoding="async"
        style={{
          width: `${10000 / c.w}%`,
          left: `${(-c.x * 100) / c.w}%`,
          top: `${(-c.y * 100) / c.h}%`,
          transform: b.flip ? "scaleX(-1)" : undefined,
        }}
      />
    </span>
  );
}

const rand = (seed: number) => {
  let s = seed >>> 0 || 1;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
};

/** The ambient petal fall: one element per petal, one keyframe each (fall + sway + spin). */
function Petals({ dark, count }: { dark: boolean; count: number }) {
  const kinds: ParticleId[] = dark ? ["gold-confetti", "rose-petal", "gold-sparkle"] : ["rose-petal-blush", "rose-petal", "rose-petal-blush"];
  const bits = useMemo(() => {
    const r = rand(29);
    return Array.from({ length: count }, (_, i) => ({
      src: particleUrl(kinds[i % kinds.length]),
      x: 4 + r() * 92,
      sx: 14 + r() * 18,
      rot: 220 + r() * 260,
      size: 13 + r() * 12,
      dur: 8 + r() * 4,
      delay: -r() * 1.5 + i * 0.9,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- kinds follows `dark`
  }, [count, dark]);
  return (
    <div className="wp2-petals" aria-hidden>
      {bits.map((b, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          src={b.src}
          alt=""
          width={b.size}
          height={b.size}
          decoding="async"
          className="wp2-petal"
          style={{
            left: `${b.x}%`,
            animationDuration: `${b.dur}s`,
            animationDelay: `${b.delay}s`,
            ["--sx" as string]: `${b.sx}px`,
            ["--r" as string]: `${b.rot}deg`,
          }}
        />
      ))}
    </div>
  );
}

const placeStyle = (p: Place, corner: "tl" | "br"): React.CSSProperties => ({
  width: `${p.w * 100}%`,
  ...(corner === "tl" ? { left: `${p.x}%`, top: `${p.y}%` } : { right: `${p.x}%`, bottom: `${p.y}%` }),
  ["--tilt" as string]: `${p.r}deg`,
});

const isLowEnd = () => {
  const n = navigator as Navigator & { deviceMemory?: number };
  return (n.hardwareConcurrency || 8) <= 4 && (n.deviceMemory ?? 8) <= 3;
};

export default function Hero({ m, heroRef, go, reduce }: { m: WpModel; heroRef: React.RefObject<HTMLElement | null>; go: boolean; reduce: boolean }) {
  const set = PREMIUM_ART[m.theme];
  const dark = set.backKind === "glitter";
  const lite = useRef(false);
  const longest = Math.max(m.a.length, m.b.length);
  // Names sit inside the arch's opening (≈ 65 % of its width): shrink long ones.
  const nameSize = Math.max(30, Math.min(58, Math.round(300 / Math.max(5, longest))));

  // Parallax fallback + pause the petals once the hero has scrolled away.
  useEffect(() => {
    const h = heroRef.current;
    if (!h || !go || reduce) return;
    lite.current = isLowEnd();
    if (lite.current) h.classList.add("is-lite");
    const sda = typeof CSS !== "undefined" && CSS.supports?.("animation-timeline: scroll()");
    const io =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver((es) => es.forEach((e) => h.classList.toggle("is-off", !e.isIntersecting)), { threshold: 0 })
        : null;
    io?.observe(h);
    if (sda || lite.current) return () => io?.disconnect();
    const layers = Array.from(h.querySelectorAll<HTMLElement>("[data-pk]")).map((el) => [el, Number(el.dataset.pk) || 0] as const);
    let raf = 0;
    const tick = () => {
      raf = 0;
      const vh = window.innerHeight || 1;
      const s = Math.min(vh, Math.max(0, window.scrollY));
      for (const [el, k] of layers) el.style.translate = `0 ${(s * k).toFixed(1)}px`;
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    tick();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      io?.disconnect();
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [heroRef, go, reduce]);

  const o = ARCH_OPENING;
  const date = dotDate(m.date);
  const long = longDate(m.date);
  return (
    <header ref={heroRef} className={`wp2-hero${go ? " is-go" : ""}${reduce ? " is-rm" : ""}`} id="wp-top" data-kind={set.backKind}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="wp2-hero-plate" alt="" {...artImg(set.plate, "(min-width: 700px) 100vw, 270px")} decoding="async" />
      <div className="wp2-hero-veil" aria-hidden />
      <div className="wp2-hero-stage">
        <div className="wp2-hero-top wp2-pp" data-pk="0.4">
          <div className="wp2-a wp2-a-top">
            <p className="wk-eyebrow wp2-hero-k">Together with their families</p>
            {m.hindi && (
              <p className="wp2-hero-hi" lang="hi">
                ॥ शुभ विवाह ॥
              </p>
            )}
          </div>
        </div>
        <div className="wp2-scene">
          <div className="wp2-L wp2-back" data-pk="0.7" aria-hidden>
            {dark ? (
              <>
                <Ornament id="mandala-ornate" width={520} className="wp2-back-mandala" tone="foil" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="wp2-back-img is-glitter" alt="" src={artImg(set.back, 1).src} width={640} height={316} decoding="async" />
              </>
            ) : (
              // Soft, low-detail plane: the 1× file only (spec 7.1.3).
              // eslint-disable-next-line @next/next/no-img-element
              <img className="wp2-back-img is-foliage" alt="" src={artImg(set.back, 1).src} width={633} height={521} decoding="async" />
            )}
          </div>
          <div className="wp2-L wp2-arch" data-pk="0.4">
            <span
              className="wp2-arch-panel"
              style={{
                left: `${o.x}%`,
                top: `${o.y}%`,
                width: `${o.w}%`,
                height: `${o.h}%`,
              }}
              aria-hidden
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="wp2-arch-img" alt="" {...artImg(ARCH, "min(80vw, 360px)")} decoding="async" />
            <div
              className="wp2-arch-copy"
              style={{
                left: `${o.x}%`,
                top: `${o.y}%`,
                width: `${o.w}%`,
                height: `${o.h}%`,
              }}
            >
              <p className="wp2-arch-k wp2-a wp2-a-k">The wedding of</p>
              <h1 className="wp2-names" style={{ fontSize: nameSize }}>
                <span className="wp2-name wk-foil-text wp2-a wp2-a-n1">{m.a}</span>
                <span className="wp2-amp wk-script wk-foil-text wp2-a wp2-a-n2">&amp;</span>
                <span className="wp2-name wk-foil-text wp2-a wp2-a-n3">{m.b}</span>
              </h1>
              {date && (
                <p className="wp2-arch-date wp2-a wp2-a-d">
                  <span aria-hidden className="wp2-dot" />
                  {date}
                  <span aria-hidden className="wp2-dot" />
                </p>
              )}
            </div>
            <span
              className="wp2-sweep-box"
              style={{
                left: `${o.x}%`,
                top: `${o.y}%`,
                width: `${o.w}%`,
                height: `${o.h}%`,
              }}
              aria-hidden
            >
              <i className="wp2-sweep" />
            </span>
          </div>
          <div className="wp2-L wp2-stem" data-pk="-0.15" aria-hidden>
            <svg viewBox="0 0 100 152" preserveAspectRatio="none">
              <path className="wp2-stem-p" pathLength={1} d="M86 150C104 132 110 106 104 84C100 70 101 62 100 55" />
              <path className="wp2-stem-lf is-1" d="M104 112c7-6 12-6 15-4-4 5-9 7-15 4Z" />
              <path className="wp2-stem-lf is-2" d="M103 88c-7-5-11-4-14-2 4 5 9 6 14 2Z" />
            </svg>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="wp2-stem-head" alt="" {...artImg(STEM_HEAD, 56)} decoding="async" />
          </div>
          <div className="wp2-L wp2-bl wp2-bl-tl" data-pk="-0.15" style={placeStyle(set.tl, "tl")} aria-hidden>
            <BloomImg b={set.bloomTL} cssWidth={Math.round(set.tl.w * 330)} />
          </div>
          <div className="wp2-L wp2-bl wp2-bl-br" data-pk="-0.15" style={placeStyle(set.br, "br")} aria-hidden>
            <BloomImg b={set.bloomBR} cssWidth={Math.round(set.br.w * 330)} />
          </div>
        </div>
        <div className="wp2-hero-foot wp2-pp" data-pk="0.4">
          <div className="wp2-a wp2-a-f">
            {long && (
              <p className="wp2-hero-date">
                {long}
                {m.time && <> · {niceTime(m.time)}</>}
              </p>
            )}
            {(m.city || m.hashtag) && (
              <p className="wp2-hero-city">
                {m.city}
                {m.city && m.hashtag && <span aria-hidden> · </span>}
                {m.hashtag && <span className="wp-tag">{m.hashtag}</span>}
              </p>
            )}
            <a className="wp2-cue" href="#wp-date" aria-label="Scroll to the save the date">
              <span />
            </a>
          </div>
        </div>
      </div>
      {go && !reduce && <Petals dark={dark} count={10} />}
    </header>
  );
}

export const HERO_CSS = `
.wp2-hero { --soft: cubic-bezier(.22,.61,.36,1); position: relative; height: 100svh; min-height: 600px; overflow: hidden; isolation: isolate; }
.wp2-hero-plate { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: -2; }
.wp2-hero-veil { position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background: radial-gradient(70% 46% at 50% 46%, color-mix(in srgb, var(--wk-bg) 40%, transparent) 0%, transparent 70%), linear-gradient(180deg, transparent 70%, color-mix(in srgb, var(--wk-bg) 85%, transparent) 100%); }
.wp2-hero-stage { position: relative; height: 100%; display: grid; grid-template-rows: auto 1fr auto; justify-items: center; align-items: center; padding: calc(64px + env(safe-area-inset-top, 0px)) 16px calc(18px + env(safe-area-inset-bottom, 0px)); }
.wp2-hero-top { text-align: center; }
.wp2-hero-k { margin: 0; }
.wp2-hero-hi { margin: 4px 0 0; font: 500 15px/1.3 var(--wk-font-deva); color: var(--wk-gold-ink); }
/* The arch box: every plane is positioned in its coordinates. */
.wp2-scene { --W: min(80vw, 360px, calc((100svh - 300px) * .659)); position: relative; width: var(--W); aspect-ratio: 421 / 639; }
.wp2-L { position: absolute; }
.wp2-back { inset: 0; }
.wp2-back-img { position: absolute; left: 50%; height: auto; pointer-events: none; }
.wp2-back-img.is-foliage { width: 172%; margin-left: -86%; top: -8%; opacity: .5; }
.wp2-back-img.is-glitter { width: 190%; margin-left: -95%; top: -12%; opacity: .75; }
.wp2-back-mandala { position: absolute; left: 50%; top: 40%; width: 160% !important; height: auto; margin: -80% 0 0 -80%; opacity: .16; }
.wp2-arch { inset: 0; }
.wp2-arch-img { position: absolute; inset: 0; width: 100%; height: 100%; filter: drop-shadow(0 16px 22px rgba(30, 10, 10, .28)); }
.wp2-arch-panel { position: absolute; border-radius: 50% 50% 0 0 / 32.6% 32.6% 0 0; background: radial-gradient(90% 60% at 50% 40%, color-mix(in srgb, var(--wk-surface-solid) 92%, transparent) 0%, color-mix(in srgb, var(--wk-surface-solid) 70%, transparent) 100%); }
[data-wk-dark] .wp2-arch-panel { background: radial-gradient(90% 60% at 50% 40%, color-mix(in srgb, var(--wk-bg) 70%, transparent) 0%, color-mix(in srgb, var(--wk-bg2) 88%, transparent) 100%); }
.wp2-arch-copy { position: absolute; display: grid; align-content: center; justify-items: center; text-align: center; padding: 18% 6% 6%; box-sizing: border-box; }
.wp2-arch-k { margin: 0 0 6px; font: 600 10px/1.2 var(--wk-font-caps); letter-spacing: .3em; text-transform: uppercase; color: var(--wk-muted); }
.wp2-names { margin: 0; display: grid; justify-items: center; line-height: 1; font-weight: 500; }
.wp2-name { font-family: var(--wk-font-display); font-style: italic; font-weight: 500; padding: 0 .08em .06em; text-shadow: none; }
.wp2-amp { font-size: .7em; line-height: .9; margin: .02em 0 .04em; padding: 0 .2em; }
.wp2-arch-date { margin: 12px 0 0; display: flex; align-items: center; gap: 8px; font: 500 13px/1 var(--wk-font-caps); letter-spacing: .2em; color: var(--wk-gold-ink); transform-origin: 50% 50%; }
.wp2-dot { width: 4px; height: 4px; transform: rotate(45deg); background: var(--wk-gold); }
.wp2-sweep-box { position: absolute; overflow: hidden; border-radius: 50% 50% 0 0 / 32.6% 32.6% 0 0; pointer-events: none; }
.wp2-sweep { position: absolute; top: -10%; bottom: -10%; left: 0; width: 34%; opacity: 0;
  background: linear-gradient(100deg, transparent 0%, color-mix(in srgb, var(--wk-gold) 22%, rgba(255,255,255,.55)) 50%, transparent 100%); transform: translateX(-120%) skewX(-14deg); }
.wp2-stem { inset: 0; overflow: visible; }
.wp2-stem svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.wp2-stem-p { fill: none; stroke: var(--wk-gold); stroke-width: 1.6; stroke-linecap: round; vector-effect: non-scaling-stroke; stroke-dasharray: 1; stroke-dashoffset: 0; }
.wp2-stem-lf { fill: color-mix(in srgb, var(--wk-gold) 55%, #6f8a5a); opacity: .9; }
.wp2-stem-head { position: absolute; left: 100%; top: 36.2%; width: 17%; height: auto; margin: -8.5% 0 0 -8.5%; transform-origin: 50% 80%; filter: drop-shadow(0 4px 6px rgba(0,0,0,.2)); }
.wp2-bl { z-index: 2; }
.wp2-bloom { position: relative; display: block; width: 100%; overflow: hidden; transform: rotate(var(--tilt, 0deg)); }
.wp2-bloom img { position: absolute; height: auto; max-width: none; }
.wp2-bl > .wp2-bloom { filter: drop-shadow(0 10px 14px rgba(30, 10, 10, .22)); }
.wp2-hero-foot > div { display: grid; justify-items: center; text-align: center; gap: 2px; }
.wp2-hero-date { margin: 0; font: 600 clamp(11px, 3vw, 13px)/1.5 var(--wk-font-caps); letter-spacing: .2em; text-transform: uppercase; color: var(--wk-ink); }
.wp2-hero-city { margin: 2px 0 0; font: italic 400 16px/1.4 var(--wk-font-display); color: var(--wk-muted); }
.wp2-cue { margin-top: 6px; width: 44px; height: 40px; display: grid; place-items: center; color: var(--wk-gold-ink); }
.wp2-cue span { width: 12px; height: 12px; border-right: 1.5px solid currentColor; border-bottom: 1.5px solid currentColor; transform: rotate(45deg); }
.wp2-petals { position: absolute; inset: 0; z-index: 5; pointer-events: none; overflow: hidden; }
.wp2-petal { position: absolute; top: -40px; opacity: 0; animation: wp2-fall 10s linear infinite both; }
.wp2-hero.is-off .wp2-petal, .wp2-hero.is-off .wp2-sweep, .wp2-hero.is-off .wp2-bl { animation-play-state: paused; }
.wp2-hero.is-lite .wp2-petal:nth-child(2n) { display: none; }
@keyframes wp2-fall {
  0% { opacity: 0; transform: translate3d(0, 0, 0) rotate(0deg); }
  6% { opacity: .95; }
  25% { transform: translate3d(var(--sx), 27svh, 0) rotate(calc(var(--r) * .25)); }
  50% { transform: translate3d(calc(var(--sx) * -.7), 54svh, 0) rotate(calc(var(--r) * .5)); }
  75% { transform: translate3d(var(--sx), 80svh, 0) rotate(calc(var(--r) * .75)); }
  92% { opacity: .9; }
  100% { opacity: 0; transform: translate3d(0, calc(100svh + 40px), 0) rotate(var(--r)); }
}

/* The intro (spec 5.3 Scene B, t = 0 is the hand-off from the envelope). */
.wp2-hero:not(.is-go) .wp2-a, .wp2-hero:not(.is-go) .wp2-L { opacity: 0; }
.wp2-hero:not(.is-go) .wp2-stem-p { stroke-dashoffset: 1; }
.wp2-hero.is-go .wp2-a-top { animation: wp2-up .9s var(--soft) .2s both; }
.wp2-hero.is-go .wp2-a-k { animation: wp2-up .6s var(--soft) 1.1s both; }
.wp2-hero.is-go .wp2-a-n1 { animation: wp2-up14 .9s var(--soft) 1.4s both; }
.wp2-hero.is-go .wp2-a-n2 { animation: wp2-up14 .9s var(--soft) 1.58s both; }
.wp2-hero.is-go .wp2-a-n3 { animation: wp2-up14 .9s var(--soft) 1.76s both; }
.wp2-hero.is-go .wp2-a-d { animation: wp2-track .8s var(--soft) 2.2s both; }
.wp2-hero.is-go .wp2-a-f { animation: wp2-up .8s var(--soft) 2.4s both; }
.wp2-hero.is-go .wp2-cue span { animation: wp2-cue 2s ease-in-out 3.2s infinite; }
.wp2-hero.is-go .wp2-sweep { animation: wp2-sweep 7s var(--soft) 2.4s infinite; }
.wp2-hero.is-go .wp2-stem-p { animation: wp2-draw 1.4s var(--soft) .4s both; }
.wp2-hero.is-go .wp2-stem-lf { animation: wp2-fade .6s var(--soft) 1.2s both; }
.wp2-hero.is-go .wp2-stem-head { animation: wp2-blossom .9s var(--soft) 1.2s both; }
/* Layer animations: intro (transform) + breathe (rotate) [+ parallax (translate) below]. */
.wp2-L { --in: wp2-fade; --in-dur: 1.2s; --in-del: 0s; --amb: none; --amb-dur: 7s; }
.wp2-back { --in: wp2-settle; --in-dur: 2.4s; }
.wp2-arch { --in: wp2-up20; --in-del: .2s; }
.wp2-stem { --in: wp2-fade; --in-dur: .3s; --in-del: .4s; }
.wp2-bl-tl { --in: wp2-from-tl; --in-dur: 1.6s; --in-del: .6s; --amb: wp2-breathe; }
.wp2-bl-br { --in: wp2-from-br; --in-dur: 1.6s; --in-del: .8s; --amb: wp2-breathe; --amb-dur: 9s; }
.wp2-hero.is-go .wp2-L { animation-name: var(--in), var(--amb); animation-duration: var(--in-dur), var(--amb-dur); animation-delay: var(--in-del), 2.4s;
  animation-timing-function: var(--soft), ease-in-out; animation-iteration-count: 1, infinite; animation-direction: normal, alternate; animation-fill-mode: both, none; }
@supports (animation-timeline: scroll()) {
  .wp2-hero.is-go:not(.is-lite):not(.is-rm) .wp2-L { animation-name: var(--in), var(--amb), wp2-par; animation-duration: var(--in-dur), var(--amb-dur), auto; animation-delay: var(--in-del), 2.4s, 0s;
    animation-timing-function: var(--soft), ease-in-out, linear; animation-iteration-count: 1, infinite, 1; animation-direction: normal, alternate, normal; animation-fill-mode: both, none, both;
    animation-timeline: auto, auto, scroll(root block); animation-range: normal, normal, 0 100svh; }
}
.wp2-back { --pk: .7; } .wp2-arch { --pk: .4; } .wp2-stem, .wp2-bl { --pk: -.15; }
@supports (animation-timeline: scroll()) {
  .wp2-hero.is-go:not(.is-lite):not(.is-rm) .wp2-pp { animation: wp2-par linear both, wp2-out linear both; animation-timeline: scroll(root block), scroll(root block); animation-range: 0 100svh, 0 45svh; }
}
.wp2-pp { --pk: .4; }
@keyframes wp2-out { to { opacity: 0; } }
@keyframes wp2-par { from { translate: 0 0; } to { translate: 0 calc(var(--pk) * 100svh); } }
@keyframes wp2-fade { from { opacity: 0; } }
@keyframes wp2-up { from { opacity: 0; transform: translateY(10px); } }
@keyframes wp2-up14 { from { opacity: 0; transform: translateY(14px); } }
@keyframes wp2-up20 { from { opacity: 0; transform: translateY(20px); } }
@keyframes wp2-settle { from { opacity: 0; transform: scale(1.08); } }
@keyframes wp2-track { from { opacity: 0; transform: scaleX(.96); } }
@keyframes wp2-from-tl { from { opacity: 0; transform: translate(-40px, -40px) scale(.85); } }
@keyframes wp2-from-br { from { opacity: 0; transform: translate(40px, 40px) scale(.85); } }
@keyframes wp2-breathe { from { rotate: -1deg; } to { rotate: 1deg; } }
@keyframes wp2-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
@keyframes wp2-blossom { from { opacity: 0; transform: scale(.3) rotate(-12deg); } }
@keyframes wp2-sweep { 0% { opacity: 0; transform: translateX(-120%) skewX(-14deg); } 4% { opacity: 1; } 23% { opacity: 1; transform: translateX(320%) skewX(-14deg); } 26%, 100% { opacity: 0; transform: translateX(320%) skewX(-14deg); } }
@keyframes wp2-cue { 50% { transform: translateY(6px) rotate(45deg); opacity: .5; } }
.wp2-hero.is-rm .wp2-L, .wp2-hero.is-rm .wp2-a, .wp2-hero.is-rm .wp2-stem-lf, .wp2-hero.is-rm .wp2-stem-head { animation: wp2-fade .3s both !important; }
.wp2-hero.is-rm .wp2-stem-p { animation: none !important; stroke-dashoffset: 0; }
.wp2-hero.is-rm .wp2-sweep, .wp2-hero.is-rm .wp2-cue span { animation: none !important; }
@media (min-width: 900px) {
  .wp2-scene { --W: min(34vw, 380px, calc((100svh - 260px) * .659)); }
  .wp2-hero-stage { padding-top: 72px; }
}
@media (max-height: 640px) and (orientation: landscape) {
  .wp2-hero { min-height: 480px; height: auto; }
  .wp2-scene { --W: 240px; }
}
`;
