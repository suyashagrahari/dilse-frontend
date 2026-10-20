"use client";
// ─── Scene A: the envelope (Premium) ─────────────────────────────────────────
//
// A sealed 4:3 envelope on the theme's painted plate, with everything a real
// keepsake envelope has: the guest's name in script, a perforated stamp and a
// postmark that carries the wedding date and city (SVG, drawn in), a dried
// lavender sprig tucked under the wax seal, a gold-foil damask liner, and a
// vellum band around the card inside.
//
// One tap (also the gesture that starts the music):
//   0     seal presses in              (260 ms, press ease)
//   260   seal cracks, halves fly; the sprig falls away; stamp + mark fade
//   450   flap opens on its hinge      (900 ms, silk)
//   1200  card slides up 60 %          (1000 ms, expo)
//   1900  the vellum band slides off   (600 ms)
//   2200  "camera" pushes in 1 → 1.15 and fades to the hero (onLeave)
//   3200  gone (onGone)
// Transform/opacity only (the postmark ring is a one-shot stroke-draw on two
// short paths). Reduced motion = a 400 ms crossfade. The plate is the LCP
// image (fetchPriority high, 1× on phones); the scene waits for its decode.

import { useEffect, useId, useMemo, useRef } from "react";
import { Monogram, Ornament, initialOf, useWeddingReducedMotion } from "../../_wedding";
import { PREMIUM_ART, STEM_HEAD, artImg } from "./art";
import { dotDate, type WpModel } from "./model";

// 0 sealed · 1 press · 2 opening · 3 rising · 4 unbanded · 5 leaving
type Step = 0 | 1 | 2 | 3 | 4 | 5;
const AT: [number, Step][] = [
  [260, 2],
  [1200, 3],
  [1900, 4],
  [2200, 5],
];
const GONE_MS = 3200;

/** A postage stamp outline with semicircular perforations cut into every edge. */
function stampPath(w: number, h: number, r: number): string {
  const nx = Math.max(3, Math.round(w / (r * 3.2)));
  const ny = Math.max(3, Math.round(h / (r * 3.2)));
  const sx = w / nx;
  const sy = h / ny;
  let d = "M0 0";
  for (let i = 0; i < nx; i++) d += ` H${(i + 0.5) * sx - r} a${r} ${r} 0 0 0 ${2 * r} 0`;
  d += ` H${w}`;
  for (let i = 0; i < ny; i++) d += ` V${(i + 0.5) * sy - r} a${r} ${r} 0 0 0 0 ${2 * r}`;
  d += ` V${h}`;
  for (let i = nx - 1; i >= 0; i--) d += ` H${(i + 0.5) * sx + r} a${r} ${r} 0 0 0 ${-2 * r} 0`;
  d += " H0";
  for (let i = ny - 1; i >= 0; i--) d += ` V${(i + 0.5) * sy + r} a${r} ${r} 0 0 0 0 ${-2 * r}`;
  return `${d} Z`;
}
const STAMP_D = stampPath(64, 78, 2.6);

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

function Postmark({ date, city, uid }: { date: string; city: string; uid: string }) {
  const [y, mo, d] = /^\d{4}-\d{2}-\d{2}$/.test(date) ? date.split("-") : ["", "", ""];
  const day = d ? `${Number(d)} ${MONTHS[Number(mo) - 1]}` : "SHUBH";
  const ring = `${(city || "With love").toUpperCase().slice(0, 18)} · ${d ? `${day} ${y}` : "VIVAH"} · `;
  return (
    <svg className="wp2-pm" viewBox="0 0 120 70" aria-hidden>
      <defs>
        <path id={`${uid}-ring`} d="M42 35 m-21 0 a21 21 0 1 1 42 0 a21 21 0 1 1 -42 0" />
      </defs>
      <circle className="wp2-pm-ring" cx="42" cy="35" r="27" pathLength={1} />
      <circle className="wp2-pm-in" cx="42" cy="35" r="15.5" />
      <text className="wp2-pm-ringTx">
        <textPath href={`#${uid}-ring`} textLength="128" lengthAdjust="spacingAndGlyphs">
          {ring}
        </textPath>
      </text>
      <text className="wp2-pm-d" x="42" y="34" textAnchor="middle">
        {day}
      </text>
      <text className="wp2-pm-y" x="42" y="43" textAnchor="middle">
        {y || "♥"}
      </text>
      <path
        className="wp2-pm-wave"
        pathLength={1}
        d="M70 24c6-4 10 4 16 0s10 4 16 0 10 4 16 0M70 35c6-4 10 4 16 0s10 4 16 0 10 4 16 0M70 46c6-4 10 4 16 0s10 4 16 0 10 4 16 0"
      />
    </svg>
  );
}

/** A dried lavender + gypsophila sprig, tied with a ribbon (two colour families via CSS vars). */
function Sprig() {
  const buds = useMemo(() => {
    const out: { x: number; y: number; r: number; s: number }[] = [];
    // three stems: [base x, base y, tip x, tip y]
    const stems = [
      [40, 150, 22, 16],
      [42, 150, 46, 6],
      [44, 150, 64, 22],
    ];
    stems.forEach(([bx, by, tx, ty], k) => {
      for (let i = 0; i < 9; i++) {
        const t = 0.06 + i * 0.05;
        const x = tx + (bx - tx) * t;
        const yy = ty + (by - ty) * t;
        out.push({
          x: x + (i % 2 ? 2.2 : -2.2),
          y: yy,
          r: 3.4 - i * 0.18,
          s: k,
        });
      }
    });
    return out;
  }, []);
  return (
    <svg className="wp2-sprig" viewBox="0 0 86 160" aria-hidden>
      <g className="wp2-sprig-st">
        <path d="M40 150C34 110 26 60 22 16" />
        <path d="M42 150C43 104 45 52 46 6" />
        <path d="M44 150C50 108 58 64 64 22" />
        <path d="M41 120c-8-6-14-6-20-4M45 112c8-8 14-8 22-6M42 92c-6-6-12-8-18-6" />
      </g>
      <g className="wp2-sprig-gy">
        {[
          [14, 40],
          [10, 52],
          [18, 30],
          [70, 44],
          [76, 34],
          [72, 56],
          [30, 8],
          [58, 10],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={2.1} />
        ))}
      </g>
      <g className="wp2-sprig-bd">
        {buds.map((b, i) => (
          <ellipse key={i} cx={b.x} cy={b.y} rx={b.r * 0.72} ry={b.r} transform={`rotate(${(b.s - 1) * 14} ${b.x} ${b.y})`} />
        ))}
      </g>
      <path className="wp2-sprig-rb" d="M34 128c6 3 12 3 18 0M33 134c7 3 13 3 20 0M43 131c-8 6-14 14-16 24M43 131c6 8 10 16 10 26" />
    </svg>
  );
}

export default function Envelope({
  m,
  guest,
  onOpen,
  onLeave,
  onGone,
}: {
  m: WpModel;
  guest: string;
  onOpen: () => void;
  onLeave: () => void;
  onGone: () => void;
}) {
  const reduce = useWeddingReducedMotion();
  // Steps and readiness are classes set on the root directly (no re-render per
  // beat: the scene is CSS-driven, React only mounts it).
  const rootRef = useRef<HTMLDivElement>(null);
  const step = useRef<Step>(0);
  const timers = useRef<number[]>([]);
  const plateRef = useRef<HTMLImageElement>(null);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const set = PREMIUM_ART[m.theme];

  useEffect(() => {
    const t = timers.current;
    return () => t.forEach((id) => window.clearTimeout(id));
  }, []);

  // Start the entrance once the plate is decoded (never wait more than 700 ms).
  useEffect(() => {
    let live = true;
    const go = () => live && rootRef.current?.classList.add("is-ready");
    const cap = window.setTimeout(go, 700);
    const img = plateRef.current;
    if (img) img.decode().then(go, go);
    return () => {
      live = false;
      window.clearTimeout(cap);
    };
  }, []);

  // Keep the page under the envelope still until it has gone.
  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = prev;
    };
  }, []);

  const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
  const open = () => {
    const root = rootRef.current;
    if (step.current !== 0 || !root) return;
    const setStep = (n: Step) => {
      step.current = n;
      for (let i = 1; i <= n; i++) root.classList.add(`s${i}`);
    };
    root.querySelector("button")?.setAttribute("disabled", "");
    onOpen();
    if (reduce) {
      setStep(5);
      onLeave();
      later(420, onGone);
      return;
    }
    setStep(1);
    for (const [ms, s] of AT) later(ms, () => setStep(s));
    later(2200, onLeave);
    later(GONE_MS, onGone);
  };

  const date = dotDate(m.date);
  const cls = `wp2-open${reduce ? " is-rm" : ""}`;
  const A = initialOf(m.a);
  const B = initialOf(m.b);
  const seal = (
    <span className="wp2-seal-face">
      <span className="wp2-seal-ltr">
        {A}
        <i>&amp;</i>
        {B}
      </span>
    </span>
  );

  return (
    <div ref={rootRef} className={cls} role="dialog" aria-modal="true" aria-label={`Wedding invitation from ${m.couple}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={plateRef} className="wp2-open-plate" alt="" {...artImg(set.plate, "(min-width: 700px) 100vw, 270px")} fetchPriority="high" decoding="async" />
      <div className="wp2-open-veil" aria-hidden />
      <Ornament id="mandala-ornate" width={720} className="wp2-open-mandala" tone="foil" />
      <div className="wp2-open-stage">
        <p className="wk-eyebrow wp2-open-k">You&apos;re invited</p>
        {m.hindi && (
          <p className="wp2-open-hi" lang="hi">
            आप सादर आमंत्रित हैं
          </p>
        )}
        <button type="button" className="wp2-env" onClick={open} aria-label={`Open the invitation from ${m.couple}`}>
          <span className="wp2-env-float">
            <span className="wp2-env-back" aria-hidden>
              <svg className="wp2-liner" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
                <defs>
                  <pattern id={`${uid}-dam`} width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M20 4c5 7 5 9 0 16-5-7-5-9 0-16Zm0 16c7-5 9-5 16 0-7 5-9 5-16 0Zm0 0c-7-5-9-5-16 0 7 5 9 5 16 0Zm0 0c5 7 5 9 0 16-5-7-5-9 0-16Z" />
                    <circle cx="0" cy="0" r="2" />
                    <circle cx="40" cy="0" r="2" />
                    <circle cx="0" cy="40" r="2" />
                    <circle cx="40" cy="40" r="2" />
                  </pattern>
                </defs>
                <rect width="400" height="300" fill={`url(#${uid}-dam)`} />
              </svg>
            </span>
            <span className="wp2-env-card" aria-hidden>
              <span className="wp2-env-cardIn">
                <Monogram a={m.a} b={m.b} variant="foil" size={86} animate={false} />
                <span className="wp2-env-save">Save the date</span>
                {date && <span className="wp2-env-date wk-foil-text">{date}</span>}
              </span>
              <span className="wp2-band">
                <span className="wp2-band-disc">
                  {A}
                  <i>&amp;</i>
                  {B}
                </span>
              </span>
            </span>
            <svg className="wp2-env-pocket" viewBox="0 0 400 300" aria-hidden preserveAspectRatio="none">
              <path className="s" d="M0 0L180 158C192 168 208 168 220 158L400 0V300H0Z" />
              <path className="p" d="M0 300L190 146C196 141 204 141 210 146L400 300Z" />
              <path className="l" d="M0 0L180 158C192 168 208 168 220 158L400 0" />
              <path className="l" d="M6 300L190 152C196 147 204 147 210 152L394 300" />
              <path className="e" d="M12 292L190 158C196 153 204 153 210 158L388 292" />
            </svg>
            <span className="wp2-env-flap" aria-hidden>
              <svg className="wp2-flap-f" viewBox="0 0 400 170" preserveAspectRatio="none">
                <path className="f" d="M0 0H400L214 162C206 169 194 169 186 162Z" />
                <path className="l" d="M16 8H384L211 154C205 159 195 159 189 154Z" />
                <path className="e" d="M30 14H370L209 148C204 152 196 152 191 148Z" />
              </svg>
              <svg className="wp2-flap-b" viewBox="0 0 400 170" preserveAspectRatio="none">
                <path className="f" d="M0 0H400L214 162C206 169 194 169 186 162Z" />
                <path className="d" d="M0 0H400L214 162C206 169 194 169 186 162Z" fill={`url(#${uid}-dam)`} />
              </svg>
            </span>
            <span className="wp2-stamp" aria-hidden>
              <svg viewBox="-2 -2 68 82">
                <path className="wp2-stamp-p" d={STAMP_D} />
                <rect className="wp2-stamp-r" x="6" y="6" width="52" height="66" rx="1" />
              </svg>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="wp2-stamp-i" alt="" {...artImg(STEM_HEAD, 48)} decoding="async" />
              <span className="wp2-stamp-t">Shubh Vivah</span>
            </span>
            <Postmark date={m.date} city={m.city} uid={uid} />
            <span className="wp2-guest">
              <span className="wp2-guest-k">For</span>
              <span className="wp2-guest-n">{guest}</span>
            </span>
            <span className="wp2-sprig-w" aria-hidden>
              <Sprig />
            </span>
            <span className="wp2-seal" aria-hidden>
              <span className="wp2-seal-whole">{seal}</span>
              <span className="wp2-seal-h is-l">{seal}</span>
              <span className="wp2-seal-h is-r">{seal}</span>
            </span>
          </span>
        </button>
        <p className="wp2-open-names wk-script wk-foil-text">{m.couple}</p>
        <p className="wp2-open-tap">
          <span className="wp2-open-dot" aria-hidden />
          Tap to open
          {m.hindi && (
            <span lang="hi" className="wp2-open-tapHi">
              {" "}
              · खोलने के लिए छुएँ
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

export const ENVELOPE_CSS = `
.wp2-open { --env-shade: color-mix(in srgb, var(--wk-surface-solid) 91%, var(--wk-ink)); --silk: cubic-bezier(.65,.05,.36,1); --soft: cubic-bezier(.22,.61,.36,1); --expo: cubic-bezier(.16,1,.3,1); --press: cubic-bezier(.34,1.56,.64,1);
  position: fixed; inset: 0; z-index: 90; display: grid; place-items: center; overflow: hidden; background: var(--wk-bg); color: var(--wk-ink);
  transition: opacity 1s var(--silk); }
.wp2-open-plate { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity .4s; }
.wp2-open.is-ready .wp2-open-plate { opacity: 1; }
.wp2-open-veil { position: absolute; inset: 0; background: radial-gradient(90% 60% at 50% 48%, color-mix(in srgb, var(--wk-bg) 30%, transparent) 0%, transparent 60%, color-mix(in srgb, var(--wk-bg2) 70%, transparent) 100%); }
.wp2-open-mandala { position: absolute; opacity: .1; width: min(150vmin, 980px) !important; height: auto; }
.wp2-open-stage { position: relative; display: grid; justify-items: center; gap: 8px; padding: 24px 16px; width: 100%; transform-origin: 50% 46%; transition: transform 1s var(--silk); }
.wp2-open-k, .wp2-open-hi, .wp2-open-names, .wp2-open-tap { opacity: 0; transition: opacity .7s var(--soft), transform .7s var(--soft); transform: translateY(8px); }
.wp2-open.is-ready .wp2-open-k, .wp2-open.is-ready .wp2-open-hi { opacity: 1; transform: none; }
.wp2-open.is-ready .wp2-open-names { opacity: 1; transform: none; transition-delay: .9s; }
.wp2-open.is-ready .wp2-open-tap { opacity: 1; transform: none; transition-delay: 1.4s; }
.wp2-open-k { margin: 0; }
.wp2-open-hi { margin: -2px 0 4px; font-family: var(--wk-font-deva); font-size: 14px; color: var(--wk-muted); }
.wp2-open-names { margin: 14px 0 0; font-size: clamp(36px, 9.6vw, 60px); line-height: 1.1; text-align: center; padding: 0 .2em; }
.wp2-open-tap { margin: 4px 0 0; font: 600 12px/1 var(--wk-font-sans); letter-spacing: .22em; text-transform: uppercase; color: var(--wk-gold-ink); display: flex; align-items: center; gap: 10px; }
.wp2-open-tapHi { letter-spacing: 0; text-transform: none; font-family: var(--wk-font-deva); font-weight: 500; font-size: 13px; }
.wp2-open-dot { position: relative; width: 8px; height: 8px; border-radius: 50%; background: var(--wk-gold); }
.wp2-open-dot::after { content: ""; position: absolute; inset: -6px; border-radius: 50%; border: 1.5px solid var(--wk-gold); animation: wp2-ping 1.8s ease-out infinite; }
@keyframes wp2-ping { from { transform: scale(.4); opacity: .9; } to { transform: scale(1.4); opacity: 0; } }

/* The envelope: 4:3, rises in, then floats. */
.wp2-env { --w: min(86vw, 470px, calc((100svh - 270px) * 1.333)); position: relative; width: var(--w); aspect-ratio: 4 / 3; margin-top: 16px; padding: 0; border: 0; background: none; cursor: pointer;
  color: var(--wk-gold); -webkit-tap-highlight-color: transparent; opacity: 0; transform: translateY(28px); transition: opacity .9s var(--soft) .2s, transform .9s var(--soft) .2s; }
.wp2-open.is-ready .wp2-env { opacity: 1; transform: none; }
.wp2-env:focus-visible { outline: 2px solid var(--wk-gold); outline-offset: 10px; border-radius: 8px; }
.wp2-env-float { position: absolute; inset: 0; perspective: 1400px; }
.wp2-env-float::before { content: ""; position: absolute; left: 4%; right: 4%; top: 30%; bottom: -12%; border-radius: 50%; background: radial-gradient(closest-side, rgba(40, 14, 20, .32), transparent); pointer-events: none; }
.wp2-open.is-ready:not(.s1) .wp2-env-float { animation: wp2-float 5s ease-in-out 1.1s infinite alternate; }
@keyframes wp2-float { to { transform: translateY(-4px); } }
.wp2-env-back { position: absolute; inset: 0; border-radius: 5px; overflow: hidden; background: var(--env-shade); box-shadow: inset 0 0 0 1px var(--wk-border); }
.wp2-liner { position: absolute; inset: 0; width: 100%; height: 62%; }
.wp2-liner path, .wp2-liner circle { fill: none; stroke: var(--wk-gold); stroke-width: 1; opacity: .75; }
.wp2-env-card { position: absolute; left: 7%; right: 7%; top: 6%; height: 86%; z-index: 2; border-radius: 4px; background: var(--wk-surface-solid);
  box-shadow: 0 0 0 1px var(--wk-border), 0 10px 30px -14px rgba(0,0,0,.35); display: grid; place-items: center; overflow: hidden;
  transition: transform 1s var(--expo); }
.wp2-env-card::before { content: ""; position: absolute; inset: 7px; border-radius: 3px; border: 1px solid transparent; background: var(--wk-foil) border-box; -webkit-mask: linear-gradient(#000 0 0) padding-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude; opacity: .8; }
.wp2-env-cardIn { display: grid; justify-items: center; gap: 4px; transform: scale(.8); }
.wp2-env-cardIn .wk-mono { margin: 0 auto; }
.wp2-env-save { font: 600 10px/1 var(--wk-font-caps); letter-spacing: .3em; text-transform: uppercase; color: var(--wk-muted); margin-top: 4px; }
.wp2-env-date { font: 500 18px/1.2 var(--wk-font-display); letter-spacing: .14em; }
/* The vellum band: frosted strip (baked translucency, no backdrop-filter) + a foil disc. */
.wp2-band { position: absolute; left: -2%; right: -2%; top: 50%; height: 22%; margin-top: -11%; display: grid; place-items: center;
  background: linear-gradient(180deg, rgba(255,255,255,.62), rgba(255,255,255,.42) 50%, rgba(255,255,255,.6)); box-shadow: 0 1px 0 rgba(255,255,255,.7) inset, 0 -1px 0 rgba(0,0,0,.05) inset, 0 4px 10px -6px rgba(0,0,0,.3);
  opacity: 0; transition: transform .6s var(--soft), opacity .6s; }
.wp2-open.s2 .wp2-band { opacity: 1; transition-duration: 0s; }
.wp2-band::before { content: ""; position: absolute; inset: 0; background: var(--wk-texture); background-size: 300px; opacity: .25; }
.wp2-band-disc { position: relative; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: baseline; justify-content: center; padding-top: 9px;
  background: var(--wk-foil); color: var(--wk-accent-ink); font: 400 13px/1 var(--wk-font-script); box-shadow: 0 2px 6px -2px rgba(0,0,0,.4); }
.wp2-band-disc i { font-style: normal; font-size: .7em; }
.wp2-env-pocket { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 3; overflow: visible; }
.wp2-env-pocket .s { fill: var(--env-shade); }
.wp2-env-pocket .p { fill: var(--wk-surface-solid); }
.wp2-env-pocket .l, .wp2-flap-f .l { fill: none; stroke: currentColor; stroke-width: 1.5; stroke-linejoin: round; opacity: .9; }
.wp2-env-pocket .e, .wp2-flap-f .e { fill: none; stroke: currentColor; stroke-width: .8; stroke-dasharray: 1 3; opacity: .55; }
.wp2-env-flap { position: absolute; left: 0; top: 0; width: 100%; height: 56.6%; z-index: 4; transform-origin: 50% 0; transform-style: preserve-3d;
  transition: transform .9s var(--silk), z-index 0s .45s; }
.wp2-env-flap svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; backface-visibility: hidden; -webkit-backface-visibility: hidden; }
.wp2-flap-f .f { fill: var(--wk-surface-solid); }
.wp2-flap-b { transform: rotateX(180deg); }
.wp2-flap-b .f { fill: var(--env-shade); }
.wp2-flap-b .d { opacity: .9; }
/* Stamp + postmark (top right), the guest's name (front), the sprig and the seal. */
.wp2-stamp { position: absolute; z-index: 6; right: 5%; top: 6%; width: 15.5%; aspect-ratio: 68 / 82; opacity: 0; transform: rotate(-8deg) scale(1.08); transition: opacity .6s var(--soft) .6s, transform .6s var(--soft) .6s; }
.wp2-open.is-ready .wp2-stamp { opacity: 1; transform: rotate(-3deg); }
.wp2-stamp svg { position: absolute; inset: 0; width: 100%; height: 100%; filter: drop-shadow(0 1px 1.5px rgba(0,0,0,.25)); }
.wp2-stamp-p { fill: color-mix(in srgb, var(--wk-accent) 26%, var(--wk-surface-solid)); }
.wp2-stamp-r { fill: color-mix(in srgb, var(--wk-accent) 14%, var(--wk-surface-solid)); stroke: var(--wk-gold); stroke-width: 1; }
.wp2-stamp-i { position: absolute; left: 18%; top: 14%; width: 64%; height: auto; }
.wp2-stamp-t { position: absolute; left: 0; right: 0; bottom: 13%; text-align: center; font: 600 5px/1 var(--wk-font-caps); font-size: clamp(3.6px, .95vw, 5.4px); letter-spacing: .04em; white-space: nowrap; text-transform: uppercase; color: var(--wk-gold-ink); }
.wp2-pm { position: absolute; z-index: 7; right: 13%; top: 12%; width: 28%; overflow: visible; color: var(--wk-ink); opacity: 0; transition: opacity .3s .7s; }
.wp2-open.is-ready .wp2-pm { opacity: .62; }
.wp2-pm-ring, .wp2-pm-in, .wp2-pm-wave { fill: none; stroke: currentColor; }
.wp2-pm-ring { stroke-width: 1.3; stroke-dasharray: 1; stroke-dashoffset: 1; transition: stroke-dashoffset .7s var(--soft) .7s; }
.wp2-pm-wave { stroke-width: 1.1; stroke-dasharray: 1; stroke-dashoffset: 1; transition: stroke-dashoffset .7s var(--soft) 1s; }
.wp2-open.is-ready .wp2-pm-ring, .wp2-open.is-ready .wp2-pm-wave { stroke-dashoffset: 0; }
.wp2-pm-in { stroke-width: .7; }
.wp2-pm-ringTx { font: 600 6.2px var(--wk-font-sans); letter-spacing: .06em; fill: currentColor; }
.wp2-pm-d { font: 700 8.4px var(--wk-font-sans); letter-spacing: .04em; fill: currentColor; }
.wp2-pm-y { font: 600 7px var(--wk-font-sans); letter-spacing: .1em; fill: currentColor; }
.wp2-guest { position: absolute; z-index: 5; left: 20%; right: 20%; bottom: 6%; display: grid; justify-items: center; gap: 0; opacity: 0; transform: translateY(8px); transition: opacity .7s var(--soft) .9s, transform .7s var(--soft) .9s; }
.wp2-open.is-ready .wp2-guest { opacity: 1; transform: none; }
.wp2-guest-k { font: 600 9px/1 var(--wk-font-caps); letter-spacing: .32em; text-transform: uppercase; color: var(--wk-muted); }
.wp2-guest-n { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font: 400 clamp(20px, 5.6vw, 30px)/1.25 var(--wk-font-script); color: var(--wk-gold-ink); padding: 0 .15em; }
.wp2-sprig-w { position: absolute; z-index: 7; left: 50%; top: 54%; width: 19%; aspect-ratio: 86 / 160; margin: -22% 0 0 -6%; transform-origin: 50% 90%;
  transform: rotate(-4deg); opacity: 0; transition: opacity .6s var(--soft) 1.1s, transform .6s var(--soft) 1.1s; }
.wp2-open.is-ready .wp2-sprig-w { opacity: 1; transform: rotate(22deg); }
.wp2-sprig { width: 100%; height: 100%; overflow: visible; }
.wp2-sprig-st path { fill: none; stroke: var(--wp2-stem, #8d9a78); stroke-width: 1.4; stroke-linecap: round; }
.wp2-sprig-bd ellipse { fill: var(--wp2-bud, #9c86bf); stroke: color-mix(in srgb, var(--wp2-bud, #9c86bf) 70%, #000); stroke-width: .4; }
.wp2-sprig-gy circle { fill: var(--wp2-gyp, #fffaf3); stroke: color-mix(in srgb, var(--wp2-stem, #8d9a78) 80%, #000); stroke-width: .4; }
.wp2-sprig-rb { fill: none; stroke: var(--wk-gold); stroke-width: 2; stroke-linecap: round; }
[data-wk-dark] .wp2-open { --wp2-bud: #efe2c4; --wp2-stem: #c9a85a; --wp2-gyp: #fff6de; }
.wp2-seal { position: absolute; z-index: 8; left: 50%; top: 54%; width: 21%; aspect-ratio: 1; margin: -10.5% 0 0 -10.5%; opacity: 0; transform: scale(.9); transition: opacity .6s var(--soft) 1.1s, transform .6s var(--press) 1.1s; }
.wp2-open.is-ready .wp2-seal { opacity: 1; transform: none; }
.wp2-seal::before { content: ""; position: absolute; inset: 2%; border-radius: 50%; box-shadow: 0 6px 14px -4px rgba(0,0,0,.45); }
.wp2-seal-whole, .wp2-seal-h { position: absolute; inset: 0; }
.wp2-seal-h { opacity: 0; }
.wp2-seal-h.is-l { clip-path: polygon(0 0, 52% 0, 46% 22%, 55% 40%, 45% 60%, 54% 78%, 48% 100%, 0 100%); }
.wp2-seal-h.is-r { clip-path: polygon(52% 0, 100% 0, 100% 100%, 48% 100%, 54% 78%, 45% 60%, 55% 40%, 46% 22%); }
.wp2-seal-face { position: absolute; inset: 0; border-radius: 50%; display: grid; place-items: center;
  background: radial-gradient(circle at 36% 30%, color-mix(in srgb, var(--wk-accent) 70%, #fff) 0%, var(--wk-accent) 42%, color-mix(in srgb, var(--wk-accent) 62%, #000) 100%);
  box-shadow: inset 0 -3px 6px rgba(0,0,0,.25), inset 0 2px 3px rgba(255,255,255,.35); }
.wp2-seal-face::before { content: ""; position: absolute; inset: 9%; border-radius: 50%; border: 1.5px dashed color-mix(in srgb, var(--wk-accent-ink) 55%, transparent); }
.wp2-seal-ltr { font: 400 clamp(16px, 4.6vw, 26px)/1 var(--wk-font-script); color: var(--wk-accent-ink); text-shadow: 0 1px 1px rgba(0,0,0,.3); display: flex; align-items: baseline; gap: 1px; }
.wp2-seal-ltr i { font-style: normal; font-size: .6em; opacity: .85; }

/* After the tap */
.wp2-open.s1 .wp2-seal { transform: scale(.9); transition: transform .26s var(--press); }
.wp2-open.s1 .wp2-open-tap, .wp2-open.s1 .wp2-open-names { opacity: 0; transition-delay: 0s; transition-duration: .4s; }
.wp2-open.s2 .wp2-seal-whole, .wp2-open.s2 .wp2-seal::before { visibility: hidden; }
.wp2-open.s2 .wp2-seal-h.is-l { animation: wp2-crack-l .7s var(--expo) both; }
.wp2-open.s2 .wp2-seal-h.is-r { animation: wp2-crack-r .7s var(--expo) both; }
@keyframes wp2-crack-l { from { opacity: 1; transform: none; } 30% { opacity: 1; } to { opacity: 0; transform: translate(-46%, 14%) rotate(-28deg); } }
@keyframes wp2-crack-r { from { opacity: 1; transform: none; } 30% { opacity: 1; } to { opacity: 0; transform: translate(46%, 18%) rotate(24deg); } }
.wp2-open.s2 .wp2-sprig-w { transform: translate(-30px, 60px) rotate(-25deg); opacity: 0; transition: transform .9s var(--soft), opacity .9s var(--soft); }
.wp2-open.s2 .wp2-stamp, .wp2-open.s2 .wp2-pm, .wp2-open.s2 .wp2-guest { opacity: 0; transition: opacity .4s; transition-delay: 0s; }
.wp2-open.s2 .wp2-env-flap { transform: rotateX(180deg); z-index: 1; transition-delay: .19s, .64s; }
.wp2-open.s3 .wp2-env-card { transform: translateY(-60%); }
.wp2-open.s4 .wp2-band { transform: translateX(110%); opacity: 0; transition: transform .6s var(--soft), opacity .6s var(--soft); }
.wp2-open.s5 { opacity: 0; pointer-events: none; }
.wp2-open.s5 .wp2-open-stage { transform: scale(1.15); }
.wp2-open.is-rm, .wp2-open.is-rm * { transition-duration: .4s !important; transition-delay: 0s !important; animation: none !important; }
.wp2-open.is-rm.s5 .wp2-open-stage { transform: none; }
@media (max-height: 560px) {
  .wp2-env { --w: min(56vw, calc((100svh - 150px) * 1.333)); margin-top: 4px; }
  .wp2-open-names { margin-top: 4px; font-size: 32px; }
  .wp2-open-hi { display: none; }
}
`;
