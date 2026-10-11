"use client";

// ─── WideFrame — the tablet / desktop dressing around a day's scene ──────────
//
// Phones (<768px) never mount this: the scene IS the page there. From 768px up
// DayRoot centres the scene in a stage column (see kitCss `[data-vw-root]`)
// and mounts this frame around it:
//
//   tablet  (768–1099)  a full-bleed backdrop: a soft halo behind the column and
//                       the day's motif drifting in the margins (petals for
//                       Rose, gold dust for Propose, fairy-light bokeh for
//                       Teddy/Promise, hearts for Hug/Kiss, stars for Valentine's…)
//   desktop (≥1100)     + two "wings" in the gutters: the sender's photos as a
//                       slowly shuffling polaroid stack with the couple's names
//                       (left), the day's name + date in display type, a line
//                       from the data and the day's own art (right); a glow
//                       that follows the cursor and a few sparkles in the wings.
//
// Everything here is aria-hidden and pointer-events:none — it decorates, it
// never takes a click from the scene. It is position:fixed, mounted after
// hydration, so it cannot shift layout. Reduced motion: no drift, no shuffle,
// no cursor effects (the composition stays).
//
// Stacking (DayRoot isolates itself from 768px up): the backdrop sits at
// z-index -1 (behind every scene layer), the wings at 15 — above the days' own
// fixed backdrops (z 0) but below their progress dots (20+), modals and
// curtains. The wings live strictly inside the gutters, so they never overlap
// the column.

import { PREMIUM_BASE } from "../days/slugs";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import type { DayConfig, ValentineDayData } from "../types";
import { FONTS } from "../theme";
import CroppedPhoto from "./CroppedPhoto";
import { useReducedMotion } from "./useReducedMotion";

export type ViewportTier = "phone" | "tablet" | "desktop";

const Q_TABLET = "(min-width: 768px)";
const Q_DESKTOP = "(min-width: 1100px)";

function subscribe(cb: () => void): () => void {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const a = window.matchMedia(Q_TABLET);
  const b = window.matchMedia(Q_DESKTOP);
  a.addEventListener?.("change", cb);
  b.addEventListener?.("change", cb);
  return () => {
    a.removeEventListener?.("change", cb);
    b.removeEventListener?.("change", cb);
  };
}
const tierNow = (): ViewportTier => {
  if (typeof window === "undefined" || !window.matchMedia) return "phone";
  if (window.matchMedia(Q_DESKTOP).matches) return "desktop";
  return window.matchMedia(Q_TABLET).matches ? "tablet" : "phone";
};

/** "phone" on the server and on the first client render, then the live tier. */
export function useViewportTier(): ViewportTier {
  return useSyncExternalStore(subscribe, tierNow, () => "phone");
}

// ─── Motifs ──────────────────────────────────────────────────────────────────

type Shape = "petal" | "heart" | "sparkle" | "light" | "star" | "bat";
type Drift = "fall" | "rise" | "twinkle";
interface Deco {
  shapes: Shape[];
  drift: Drift;
  count: number;
  /** Halo behind the stage column. */
  halo: string;
}

const DECO: Record<string, Deco> = {
  "happy-rose-day": { shapes: ["petal", "petal", "petal", "sparkle"], drift: "fall", count: 18, halo: "rgba(255,253,248,.85)" },
  "happy-propose-day": { shapes: ["sparkle", "star", "star"], drift: "twinkle", count: 26, halo: "rgba(255,201,210,.12)" },
  "happy-chocolate-day": { shapes: ["heart", "sparkle", "star"], drift: "rise", count: 18, halo: "rgba(255,214,170,.10)" },
  "happy-teddy-day": { shapes: ["light", "light", "star", "heart"], drift: "twinkle", count: 24, halo: "rgba(255,190,220,.10)" },
  "happy-promise-day": { shapes: ["light", "heart", "light", "sparkle"], drift: "rise", count: 18, halo: "rgba(255,255,255,.7)" },
  "happy-hug-day": { shapes: ["heart", "heart", "light", "sparkle"], drift: "rise", count: 18, halo: "rgba(255,250,240,.75)" },
  "happy-kiss-day": { shapes: ["heart", "heart", "sparkle"], drift: "rise", count: 20, halo: "rgba(255,255,255,.65)" },
  "happy-valentines-day": { shapes: ["star", "star", "sparkle", "heart"], drift: "twinkle", count: 34, halo: "rgba(255,190,150,.10)" },
  // Halloween: fireflies and stars twinkling, a few bats flitting on the spot.
  "happy-halloween": { shapes: ["light", "star", "bat", "light", "star"], drift: "twinkle", count: 30, halo: "rgba(183,156,255,.12)" },
  // Diwali: warm diya lights rising, gold sparkles.
  "happy-diwali": { shapes: ["light", "sparkle", "light", "star"], drift: "rise", count: 26, halo: "rgba(255,190,90,.12)" },
};
// ✦ Premium twins start on their $2 day's motif (a builder may add its own entry above).
for (const [p, b] of Object.entries(PREMIUM_BASE)) if (!DECO[p]) DECO[p] = DECO[b];

const PATH: Record<Exclude<Shape, "light" | "star">, { vb: string; d: string }> = {
  petal: { vb: "-20 -26 40 52", d: "M0 24 C -16 14 -20 -8 -8 -22 C -4 -26 4 -26 8 -22 C 20 -8 16 14 0 24 Z" },
  heart: { vb: "0 0 24 24", d: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" },
  sparkle: { vb: "0 0 24 24", d: "M12 0C13 8 16 11 24 12 16 13 13 16 12 24 11 16 8 13 0 12 8 11 11 8 12 0Z" },
  bat: { vb: "0 0 64 32", d: "M32 9c-1.6-3-3.4-4.4-5.4-4.6 1 1.8 1 3.6.2 5C22.4 8.6 17 6 12.4 1.6c.8 4.8-1 8.6-5.4 10.8 4 .2 7 2 8.4 5 3-1.8 6.6-1.8 9.6.4 2 1.6 3 4.4 3.4 7.6 1-2.2 2.2-3.6 3.6-3.6s2.6 1.4 3.6 3.6c.4-3.2 1.4-6 3.4-7.6 3-2.2 6.6-2.2 9.6-.4 1.4-3 4.4-4.8 8.4-5-4.4-2.2-6.2-6-5.4-10.8C47 6 41.6 8.6 37.2 9.4c-.8-1.4-.8-3.2.2-5C35.4 4.6 33.6 6 32 9z" },
};

function MotifShape({ shape, color }: { shape: Shape; color: string }) {
  if (shape === "light") return <span style={{ display: "block", width: "100%", height: "100%", borderRadius: "50%", background: `radial-gradient(circle, ${color} 0%, ${color}88 30%, transparent 70%)` }} />;
  if (shape === "star") return <span style={{ display: "block", width: "100%", height: "100%", borderRadius: "50%", background: `radial-gradient(circle, #fff 0%, ${color} 35%, transparent 70%)` }} />;
  const p = PATH[shape];
  return (
    <svg viewBox={p.vb} width="100%" height="100%" style={{ display: "block", overflow: "visible" }}>
      <path d={p.d} fill={color} />
    </svg>
  );
}

const rnd = (i: number, k: number) => {
  const x = Math.sin((i + 1) * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/** Day motif drifting across the backdrop — mostly in the margins, faint behind the column. */
function Backdrop({ day, reduced }: { day: DayConfig; reduced: boolean }) {
  const deco = DECO[day.slug] ?? DECO["happy-kiss-day"];
  const items = useMemo(
    () =>
      Array.from({ length: deco.count }, (_, i) => {
        // Bias positions into the outer 30% on each side; a few cross the middle.
        const side = i % 2 === 0 ? 0 : 1;
        const t = rnd(i, 1);
        const left = i % 7 === 3 ? 30 + t * 40 : side === 0 ? t * 30 : 70 + t * 30;
        const shape = deco.shapes[i % deco.shapes.length];
        const big = shape === "light" ? 26 + rnd(i, 2) * 46 : shape === "star" ? 4 + rnd(i, 2) * 6 : shape === "bat" ? 26 + rnd(i, 2) * 22 : 10 + rnd(i, 2) * 16;
        return {
          shape,
          left,
          top: rnd(i, 3) * 100,
          size: big,
          color: day.theme.confetti[i % day.theme.confetti.length] ?? day.theme.accent,
          dur: (deco.drift === "twinkle" ? 3 : 16) + rnd(i, 4) * (deco.drift === "twinkle" ? 4 : 14),
          delay: -rnd(i, 5) * 20,
          sway: Math.round((rnd(i, 6) - 0.5) * 140),
          rot: shape === "bat" ? Math.round((rnd(i, 7) - 0.5) * 24) : Math.round((rnd(i, 7) - 0.5) * 540),
          op: (shape === "light" ? 0.28 : 0.4) + rnd(i, 8) * 0.35,
          depth: 0.4 + rnd(i, 9) * 1.2,
          middle: i % 7 === 3,
        };
      }),
    [deco, day.theme.confetti, day.theme.accent],
  );
  return (
    <div aria-hidden className="vw-wf-backdrop" style={{ position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none", overflow: "hidden" }}>
      {/* the halo the column stands in */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: "50%",
          width: "calc(var(--vw-stage-w) + 360px)",
          transform: "translateX(-50%)",
          background: `radial-gradient(closest-side, ${deco.halo}, transparent)`,
        }}
      />
      <div className="vw-wf-par" style={{ position: "absolute", inset: "-40px" }}>
        {items.map((p, i) => (
          <span
            key={i}
            className={reduced ? undefined : p.shape === "bat" ? "vw-wf-flit" : `vw-wf-${deco.drift}`}
            style={{
              position: "absolute",
              left: `${p.left}%`,
              top: deco.drift === "twinkle" || reduced ? `${p.top}%` : deco.drift === "fall" ? -60 : "auto",
              bottom: deco.drift === "rise" && !reduced ? -60 : undefined,
              width: p.size,
              height: p.shape === "petal" ? p.size * 1.3 : p.shape === "bat" ? p.size * 0.5 : p.size,
              opacity: p.middle ? p.op * 0.45 : p.op,
              animationDuration: `${p.dur}s`,
              animationDelay: `${p.delay}s`,
              ["--wf-sway" as string]: `${p.sway}px`,
              ["--wf-rot" as string]: `${p.rot}deg`,
              ["--wf-op" as string]: String(p.middle ? p.op * 0.45 : p.op),
              transform: reduced ? `rotate(${p.rot}deg)` : undefined,
              filter: p.shape === "light" ? "blur(1px)" : undefined,
            }}
          >
            <MotifShape shape={p.shape} color={p.color} />
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Wings ───────────────────────────────────────────────────────────────────

const TILTS = [-5, 6, -11];
const OFFS: [number, number][] = [
  [0, 0],
  [26, -18],
  [-30, -10],
];

function PolaroidStack({ day, data, reduced }: { day: DayConfig; data?: ValentineDayData; reduced: boolean }) {
  const photos = useMemo(() => (data?.photos ?? []).filter((p) => p && p.url), [data?.photos]);
  const n = photos.length;
  const [top, setTop] = useState(0);
  useEffect(() => {
    if (reduced || n < 2) return;
    const t = window.setInterval(() => setTop((k) => k + 1), 5200);
    return () => window.clearInterval(t);
  }, [reduced, n]);

  const cards: { key: string; slot: number; photo: ValentineDayData["photos"][number] | null; caption: string }[] = [];
  if (n === 0) {
    const demo = ["our next memory", "this one's yours", "saved for us"];
    for (let s = 0; s < 3; s++) cards.push({ key: `d${s}`, slot: s, photo: null, caption: demo[s] });
  } else {
    const shown = Math.min(3, n);
    for (let s = 0; s < shown; s++) {
      const idx = (top + s) % n;
      cards.push({ key: `p${idx}`, slot: s, photo: photos[idx], caption: photos[idx].caption ?? "" });
    }
  }

  return (
    <div style={{ position: "relative", width: "var(--wf-card)", height: "calc(var(--wf-card) * 1.32)" }}>
      {cards
        .slice()
        .reverse()
        .map((c) => {
          const [dx, dy] = OFFS[c.slot];
          return (
            <figure
              key={c.key}
              className={reduced ? undefined : "vw-wf-bob"}
              style={{
                position: "absolute",
                inset: 0,
                margin: 0,
                zIndex: 3 - c.slot,
                animationDelay: `${-c.slot * 1.7}s`,
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  boxSizing: "border-box",
                  padding: "6.5% 6.5% 0",
                  background: "#FFFDF8",
                  borderRadius: 4,
                  boxShadow: "0 22px 40px -18px rgba(30,10,20,.55), 0 2px 6px rgba(30,10,20,.12)",
                  transform: `translate(${dx}px, ${dy}px) rotate(${TILTS[c.slot]}deg)`,
                  transition: reduced ? undefined : "transform 1.4s cubic-bezier(.3,.7,.2,1)",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ position: "relative", width: "100%", aspectRatio: "4 / 4.3", overflow: "hidden", borderRadius: 2, background: day.theme.soft }}>
                  {c.photo ? (
                    <CroppedPhoto photo={c.photo} alt="" />
                  ) : (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "grid",
                        placeItems: "center",
                        background: `radial-gradient(80% 70% at 50% 40%, ${day.theme.soft}, ${day.theme.edge})`,
                        fontSize: "calc(var(--wf-card) * .3)",
                      }}
                    >
                      <span style={{ filter: "saturate(.9)", opacity: 0.85 }}>{day.emoji}</span>
                    </div>
                  )}
                </div>
                <figcaption
                  style={{
                    flex: 1,
                    display: "grid",
                    placeItems: "center",
                    padding: "0 4px",
                    font: `700 calc(var(--wf-card) * .085)/1.1 ${FONTS.script}`,
                    color: "#5A2A36",
                    textAlign: "center",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                  }}
                >
                  <span style={{ maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis" }}>{c.caption}</span>
                </figcaption>
              </div>
            </figure>
          );
        })}
      {/* washi tape on the front card */}
      <span
        style={{
          position: "absolute",
          zIndex: 4,
          top: "-3.5%",
          left: "50%",
          width: "34%",
          height: "7%",
          transform: "translateX(-50%) rotate(-4deg)",
          background: `${day.theme.accent}`,
          opacity: 0.35,
          borderRadius: 2,
        }}
      />
    </div>
  );
}

function Wing({ side, children }: { side: "l" | "r"; children: ReactNode }) {
  return (
    <div
      aria-hidden
      className="vw-wf-wing"
      style={{
        position: "fixed",
        top: 0,
        bottom: 0,
        [side === "l" ? "left" : "right"]: 0,
        width: "var(--vw-gutter)",
        zIndex: 15,
        pointerEvents: "none",
        display: "grid",
        placeItems: "center",
        boxSizing: "border-box",
        padding: "84px var(--vw-wing-pad, clamp(18px, 2.6vw, 56px)) 96px",
        overflow: "hidden",
      }}
    >
      <div className="vw-wf-par" style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        {children}
      </div>
    </div>
  );
}

export interface WideFrameProps {
  day: DayConfig;
  data?: ValentineDayData;
  tier: Exclude<ViewportTier, "phone">;
  /** "full" = the scene owns the whole viewport: no wings, no halo. */
  layout: "column" | "full";
  /** Day art for the right wing (an SVG/illustration ≈ 200px tall). */
  art?: ReactNode;
  /** The right wing's quote. Default: data.endLine, then the day's title. */
  line?: string;
  /** Override the wings' tone when a step repaints the page (Teddy's bedroom, Propose's blush). */
  dark?: boolean;
}

export default function WideFrame({ day, data, tier, layout, art, line, dark: darkProp }: WideFrameProps) {
  const reduced = useReducedMotion();
  const wings = tier === "desktop" && layout === "column";
  const glowRef = useRef<HTMLDivElement | null>(null);
  const sparkRef = useRef<HTMLDivElement | null>(null);

  // Cursor: parallax on the wings + backdrop, a soft glow, a few sparkles in the gutters.
  useEffect(() => {
    if (reduced || tier !== "desktop") return;
    let raf = 0;
    let mx = 0.5;
    let my = 0.5;
    let lastSpark = 0;
    const paint = () => {
      raf = 0;
      const px = (mx - 0.5) * 2;
      const py = (my - 0.5) * 2;
      document.querySelectorAll<HTMLElement>(`[data-vw-root="${day.slug}"] .vw-wf-par`).forEach((el, i) => {
        const k = i === 0 ? 10 : 7;
        el.style.transform = `translate3d(${(-px * k).toFixed(1)}px, ${(-py * k * 0.7).toFixed(1)}px, 0)`;
      });
      if (glowRef.current) glowRef.current.style.transform = `translate3d(${(mx * window.innerWidth).toFixed(0)}px, ${(my * window.innerHeight).toFixed(0)}px, 0)`;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType && e.pointerType !== "mouse") return;
      mx = e.clientX / window.innerWidth;
      my = e.clientY / window.innerHeight;
      if (!raf) raf = requestAnimationFrame(paint);
      const layer = sparkRef.current;
      const now = performance.now();
      if (!layer || !wings || now - lastSpark < 70) return;
      const gutter = (window.innerWidth - (layer.parentElement?.querySelector<HTMLElement>(".vw-stage")?.offsetWidth ?? window.innerWidth)) / 2;
      if (gutter < 40 || (e.clientX > gutter && e.clientX < window.innerWidth - gutter)) return;
      lastSpark = now;
      if (layer.childElementCount > 18) return;
      const s = document.createElement("span");
      const size = 6 + Math.random() * 9;
      s.textContent = "✦";
      s.style.cssText = `position:absolute;left:${e.clientX - size / 2}px;top:${e.clientY - size / 2}px;font-size:${size}px;line-height:1;color:${day.theme.gold};text-shadow:0 0 6px ${day.theme.gold};will-change:transform,opacity`;
      layer.appendChild(s);
      const a = s.animate(
        [
          { transform: "translate(0,0) scale(.4) rotate(0deg)", opacity: 0.95 },
          { transform: `translate(${(Math.random() - 0.5) * 30}px, ${18 + Math.random() * 26}px) scale(1) rotate(90deg)`, opacity: 0 },
        ],
        { duration: 800 + Math.random() * 400, easing: "cubic-bezier(.2,.7,.3,1)" },
      );
      a.onfinish = () => s.remove();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced, tier, wings, day.slug, day.theme.gold]);

  const recipient = data?.recipientName?.trim() || "";
  const sender = data?.senderName?.trim() || "";
  const quote = (line ?? "").trim() || data?.endLine?.trim() || day.title;
  const dark = darkProp ?? day.theme.dark;
  // A step can flip the page's tone; the day's own ink only fits its own tone.
  const ink = dark === day.theme.dark ? day.theme.ink : dark ? "#FFF4EA" : day.theme.paperInk;
  const soft = dark === day.theme.dark ? day.theme.inkSoft : dark ? "rgba(255,244,234,.72)" : day.theme.paperInk;
  const flipped = dark !== day.theme.dark;
  const accent = flipped ? ink : day.theme.accent;
  const gold = flipped ? soft : day.theme.gold;

  const rule: CSSProperties = { width: "min(140px, 40%)", height: 1, margin: "clamp(10px, 1.6vh, 18px) 0", background: `linear-gradient(90deg, transparent, ${gold}, transparent)` };

  return (
    <>
      {layout === "column" && <Backdrop day={day} reduced={reduced} />}
      {tier === "desktop" && !reduced && (
        <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none", overflow: "hidden" }}>
          <div
            ref={glowRef}
            style={{
              position: "absolute",
              left: -220,
              top: -220,
              width: 440,
              height: 440,
              borderRadius: "50%",
              background: `radial-gradient(closest-side, ${dark ? "rgba(255,214,170,.16)" : "rgba(255,255,255,.55)"}, transparent)`,
              transform: "translate3d(50vw, 50vh, 0)",
              willChange: "transform",
            }}
          />
        </div>
      )}
      {wings && (
        <>
          <Wing side="l">
            <div style={{ ["--wf-card" as string]: "clamp(150px, min(15.5vw, 30vh), 300px)" } as CSSProperties}>
              <PolaroidStack day={day} data={data} reduced={reduced} />
            </div>
            {(recipient || sender) && (
              <p
                style={{
                  margin: "clamp(26px, 4.5vh, 44px) 0 0",
                  font: `700 clamp(30px, 2.7vw, 50px)/1.1 ${FONTS.script}`,
                  color: ink,
                  overflowWrap: "anywhere",
                  maxWidth: "100%",
                }}
              >
                {recipient}
                {recipient && sender && <span style={{ color: accent, margin: "0 .25em" }}>&amp;</span>}
                {sender}
              </p>
            )}
            <p style={{ margin: "8px 0 0", font: `600 clamp(9.5px, .78vw, 11px) ${FONTS.ui}`, letterSpacing: "clamp(.14em, .02vw + .1em, .28em)", textTransform: "uppercase", color: soft, opacity: 0.85, textWrap: "balance" }}>
              {data?.photos?.length ? "a few of our favourite days" : "the memories we're still making"}
            </p>
          </Wing>
          <Wing side="r">
            {art && (
              <div className={reduced ? undefined : "vw-wf-bob"} style={{ position: "relative", width: "100%", height: "clamp(120px, 24vh, 230px)", marginBottom: "clamp(10px, 2.4vh, 24px)" }}>
                <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "center" }}>{art}</div>
              </div>
            )}
            <p style={{ margin: 0, font: `600 12px ${FONTS.ui}`, letterSpacing: ".32em", textTransform: "uppercase", color: gold }}>
              {day.date} {day.month}
            </p>
            <p style={{ margin: "6px 0 0", font: `700 clamp(36px, 3.7vw, 70px)/1.02 ${FONTS.serif}`, color: ink, letterSpacing: "-.01em", textWrap: "balance" }}>{day.name}</p>
            <p style={{ margin: "6px 0 0", font: `600 clamp(18px, 1.5vw, 26px)/1.2 ${FONTS.script}`, color: accent }}>{day.title}</p>
            <span style={rule} />
            <p
              style={{
                margin: 0,
                maxWidth: "26ch",
                font: `italic 400 clamp(15px, 1.15vw, 19px)/1.5 ${FONTS.serif}`,
                color: soft,
                overflowWrap: "anywhere",
                display: "-webkit-box",
                WebkitLineClamp: 4,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              “{quote}”
            </p>
            {sender && <p style={{ margin: "10px 0 0", font: `700 clamp(18px, 1.4vw, 24px) ${FONTS.script}`, color: ink }}>— {sender}</p>}
          </Wing>
          {!reduced && <div ref={sparkRef} aria-hidden style={{ position: "fixed", inset: 0, zIndex: 16, pointerEvents: "none", overflow: "hidden" }} />}
        </>
      )}
    </>
  );
}
