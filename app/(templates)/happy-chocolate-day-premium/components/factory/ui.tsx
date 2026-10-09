"use client";

// Shared bits for every station: the scene context, die-cut GIF stickers, the station heading, puffy buttons, the
// kawaii truffles, chocolate drips, the "aww" reward (sound + heart burst + haptic) and the factory's own SFX cues.

import { createContext, useContext, type CSSProperties, type ReactNode } from "react";
import { CroppedPhoto, Sticker, burst, haptic } from "../../../_valentine/kit";
import { registerCue, type CueId } from "../../../_valentine/kit/premium";
import type { DayConfig, ValentineDayData } from "../../../_valentine/types";
import type { LovePhoto } from "../../../_love/types";
import type { Factory, TruffleLook } from "./model";
import { C } from "./model";

// ─── Local cues (each with a visual twin in its scene) ─────────────────────────
let cuesReady = false;
export function ensureFactoryCues() {
  if (cuesReady) return;
  cuesReady = true;
  // A rubbery spring (truffles landing in their cups, the basket catching).
  registerCue("sf-boing", (x) => {
    const o = x.c.createOscillator();
    const g = x.c.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(190 * x.k, x.t);
    o.frequency.exponentialRampToValueAtTime(540 * x.k, x.t + 0.08);
    o.frequency.exponentialRampToValueAtTime(250 * x.k, x.t + 0.3);
    g.gain.setValueAtTime(0.0001, x.t);
    g.gain.linearRampToValueAtTime(0.3, x.t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, x.t + 0.34);
    o.connect(g).connect(x.out);
    o.start(x.t);
    o.stop(x.t + 0.38);
    x.keep(o);
  });
  // A thick chocolate "plop": a low sine that drops, with a soft click on top.
  registerCue("sf-plop", (x) => {
    const o = x.c.createOscillator();
    const g = x.c.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(420 * x.k, x.t);
    o.frequency.exponentialRampToValueAtTime(110 * x.k, x.t + 0.14);
    g.gain.setValueAtTime(0.0001, x.t);
    g.gain.linearRampToValueAtTime(0.42, x.t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, x.t + 0.2);
    o.connect(g).connect(x.out);
    o.start(x.t);
    o.stop(x.t + 0.22);
    x.keep(o);
  });
  // The "ding ding!" of a win: two bright bell partials.
  registerCue("sf-ding", (x) => {
    [0, 0.13].forEach((d, i) => {
      [1, 2.76].forEach((m, j) => {
        const o = x.c.createOscillator();
        const g = x.c.createGain();
        o.type = "sine";
        o.frequency.value = (i ? 1568 : 1319) * m * x.k;
        g.gain.setValueAtTime(0.0001, x.t + d);
        g.gain.linearRampToValueAtTime(j ? 0.05 : 0.22, x.t + d + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, x.t + d + 0.6);
        o.connect(g).connect(x.out);
        o.start(x.t + d);
        o.stop(x.t + d + 0.65);
        x.keep(o);
      });
    });
  });
  // A tiny music-box tune (C E G E C' …) for the chocolate music box.
  registerCue("sf-musicbox", (x) => {
    const notes = [1047, 1319, 1568, 1319, 2093, 1568, 1760, 1568];
    notes.forEach((f, i) => {
      const o = x.c.createOscillator();
      const g = x.c.createGain();
      const at = x.t + i * 0.16;
      o.type = "triangle";
      o.frequency.value = f * x.k;
      g.gain.setValueAtTime(0.0001, at);
      g.gain.linearRampToValueAtTime(0.14, at + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 0.5);
      o.connect(g).connect(x.out);
      o.start(at);
      o.stop(at + 0.55);
      x.keep(o);
    });
  });
}

// ─── Scene context ──────────────────────────────────────────────────────────────
export interface StationApi {
  f: Factory;
  data: ValentineDayData;
  day: DayConfig;
  /** The station's interaction landed: show Next. */
  done: () => void;
  isDone: boolean;
  sfx: (id: CueId | (string & {}), o?: { gain?: number; detune?: number; pan?: number; dur?: number; count?: number }) => unknown;
  index: number;
}
export const StationCtx = createContext<StationApi | null>(null);
export const useStation = () => useContext(StationCtx)!;

/** The "aww" beat: chime/pop + a heart burst from a point (or the element's centre) + a haptic. */
export function reward(sfx: StationApi["sfx"], at?: { x: number; y: number } | Element | null, opts: { big?: boolean; cue?: string; small?: boolean } = {}) {
  let origin: { x: number; y: number } | undefined;
  if (at && "getBoundingClientRect" in at) {
    const r = at.getBoundingClientRect();
    origin = { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 2) / window.innerHeight };
  } else if (at) origin = at;
  sfx(opts.cue ?? "chime", { gain: opts.small ? 0.35 : 0.55 });
  if (opts.big) sfx("sparkle", { gain: 0.45 });
  burst({
    kind: "hearts",
    origin,
    count: opts.big ? 26 : opts.small ? 8 : 14,
    spread: opts.big ? 0.45 : opts.small ? 0.12 : 0.22,
    colors: [C.pink, C.pop, C.butter, C.primary, "#FFFFFF"],
    emojis: opts.small ? ["💗", "✨"] : ["💖", "💗", "✨", "🍫"],
  });
  haptic(opts.big ? [20, 30, 20, 30, 60] : opts.small ? 10 : [15, 40, 25]);
}

// ─── Stickers ───────────────────────────────────────────────────────────────────
/** A die-cut (white-outlined) GIF from the library. Sized box, lazy, async decode: nothing jumps. */
export function Gif({ src, size, tilt = 0, float, className, style, eager, alt = "" }: { src: string; size: number; tilt?: number; float?: boolean; className?: string; style?: CSSProperties; eager?: boolean; alt?: string }) {
  return (
    <span className={`sf-gif${float ? " is-float" : ""}${className ? ` ${className}` : ""}`} style={{ width: size, height: size, ["--tilt" as string]: `${tilt}deg`, ...style }} aria-hidden={alt ? undefined : true}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} width={size} height={size} loading={eager ? "eager" : "lazy"} decoding="async" draggable={false} />
    </span>
  );
}

/** One of the six editable GIF slots, die-cut like the library stickers. */
export function SlotGif({ id, size, tilt = 0, float, className, style, eager }: { id: string; size: number; tilt?: number; float?: boolean; className?: string; style?: CSSProperties; eager?: boolean }) {
  const { day, data } = useStation();
  const slot = day.gifSlots.find((g) => g.id === id);
  if (!slot) return null;
  return (
    <span className={`sf-gif is-slot${float ? " is-float" : ""}${className ? ` ${className}` : ""}`} style={{ width: size, height: size, ["--tilt" as string]: `${tilt}deg`, ...style }}>
      <Sticker slug={day.slug} slot={slot} value={data.gifs?.[id]} size={size} alt="" eager={eager} />
    </span>
  );
}

// ─── Heading + buttons ──────────────────────────────────────────────────────────
export function StationHead({ kicker, title, hint }: { kicker: string; title: ReactNode; hint?: ReactNode }) {
  return (
    <header className="sf-head">
      <span className="sf-kick">{kicker}</span>
      <h2 className="sf-title">
        <Spark className="sf-sparkL" />
        {title}
        <Spark className="sf-sparkR" color={C.pink} />
      </h2>
      {hint && <p className="sf-hint">{hint}</p>}
    </header>
  );
}

export function Spark({ className, color = C.deep }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="18" height="18" aria-hidden>
      <path d="M12 1.5c.9 5.6 4.9 9.6 10.5 10.5-5.6.9-9.6 4.9-10.5 10.5C11.1 16.9 7.1 12.9 1.5 12 7.1 11.1 11.1 7.1 12 1.5z" fill={color} />
    </svg>
  );
}

export function Puffy({ children, onClick, tone = "pink", className, small, disabled, label }: { children: ReactNode; onClick?: () => void; tone?: "pink" | "choc" | "white" | "butter"; className?: string; small?: boolean; disabled?: boolean; label?: string }) {
  return (
    <button type="button" className={`sf-puffy is-${tone}${small ? " is-small" : ""}${className ? ` ${className}` : ""}`} onClick={onClick} disabled={disabled} aria-label={label}>
      {children}
    </button>
  );
}

/** A tiny washi-tape strip. */
export function Washi({ color = C.pop, rot = -6, style }: { color?: string; rot?: number; style?: CSSProperties }) {
  return <i className="sf-washi" style={{ backgroundColor: color, transform: `rotate(${rot}deg)`, ...style }} aria-hidden />;
}

/** A polaroid with her photo (or a pastel heart card when there is none) and a handwritten caption. */
export function Polaroid({ photo, caption, fallback, tilt = 0, width = 220, className, style, eager, children }: { photo: LovePhoto | null; caption?: string; fallback?: string; tilt?: number; width?: number; className?: string; style?: CSSProperties; eager?: boolean; children?: ReactNode }) {
  return (
    <figure className={`sf-polaroid${className ? ` ${className}` : ""}`} style={{ width, ["--tilt" as string]: `${tilt}deg`, ...style }}>
      <div className="sf-polaroidPic">
        {photo ? <CroppedPhoto photo={photo} eager={eager} alt={caption || photo.caption || ""} /> : <span className="sf-polaroidEmpty">{fallback ?? "💗"}</span>}
        {children}
      </div>
      {(caption ?? photo?.caption) ? <figcaption>{caption ?? photo?.caption}</figcaption> : null}
    </figure>
  );
}

/** A bright pop-up card (never a dark lightbox): a milky haze, the card springs in, tap outside or ✕ to close. */
export function PopCard({ open, onClose, children, label }: { open: boolean; onClose: () => void; children: ReactNode; label: string }) {
  if (!open) return null;
  return (
    <div className="sf-popCard" role="dialog" aria-modal="true" aria-label={label} onClick={onClose}>
      <div className="sf-popCardIn" onClick={(e) => e.stopPropagation()}>
        {children}
        <button type="button" className="sf-popClose" onClick={onClose} aria-label="Close">✕</button>
      </div>
    </div>
  );
}

// ─── Kawaii truffles ────────────────────────────────────────────────────────────
function shapePath(shape: TruffleLook["shape"]): string {
  switch (shape) {
    case "heart":
      return "M50 88 C 22 70, 8 54, 8 36 A 21 21 0 0 1 50 26 A 21 21 0 0 1 92 36 C 92 54, 78 70, 50 88 Z";
    case "square":
      return "M18 22 H82 Q90 22 90 30 V82 Q90 90 82 90 H18 Q10 90 10 82 V30 Q10 22 18 22 Z";
    case "dome":
      return "M10 84 C 10 40, 28 20, 50 20 C 72 20, 90 40, 90 84 Q 90 90 84 90 H16 Q 10 90 10 84 Z";
    case "star": {
      const pts: string[] = [];
      for (let i = 0; i < 10; i++) {
        const r = i % 2 ? 22 : 42;
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        pts.push(`${(50 + r * Math.cos(a)).toFixed(1)} ${(56 + r * Math.sin(a)).toFixed(1)}`);
      }
      return `M${pts.join(" L")} Z`;
    }
    default:
      return "M50 18 A 38 38 0 1 1 49.9 18 Z";
  }
}

/** A chocolate truffle with a tiny face. `happy` opens the smile (it just got packed / caught). */
export function Truffle({ look, size = 56, happy, className, style }: { look: TruffleLook; size?: number; happy?: boolean; className?: string; style?: CSSProperties }) {
  const d = shapePath(look.shape);
  const dark = look.body === "#5A3221";
  const eye = dark ? "#FFF3E6" : "#2B160D";
  const cy = look.shape === "heart" ? 46 : look.shape === "star" ? 58 : 58;
  return (
    <svg className={`sf-truffle${className ? ` ${className}` : ""}`} viewBox="0 0 100 100" width={size} height={size} style={style} aria-hidden>
      <path d={d} fill={look.body} stroke={look.body} strokeWidth={look.shape === "star" ? 12 : 0} strokeLinejoin="round" />
      <path d={d} fill={look.shade} opacity=".55" transform="translate(0 6) scale(1 .96)" style={{ mixBlendMode: "multiply" }} clipPath="none" />
      <path d={d} fill={look.body} transform="translate(0 -3)" stroke={look.body} strokeWidth={look.shape === "star" ? 12 : 0} strokeLinejoin="round" />
      {look.shape === "round" && <path d="M22 40 L30 32 L38 40 L46 32 L54 40 L62 32 L70 40 L78 32" fill="none" stroke={look.top} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />}
      {look.shape === "square" && [18, 34, 66, 80].map((x2, i) => <rect key={i} x={x2} y={i % 2 ? 30 : 34} width="8" height="3.5" rx="1.75" fill={[C.pink, C.mint, C.butter, "#fff"][i]} transform={`rotate(${i * 40 - 30} ${x2 + 4} 34)`} />)}
      {look.shape === "swirl" && <path d="M34 30 C 40 14, 64 14, 66 28 C 58 22, 46 24, 50 32 C 42 30, 38 34, 34 30 Z" fill={look.top} />}
      {look.shape === "dome" && (
        <>
          <ellipse cx="50" cy="22" rx="7" ry="4.5" fill={C.pinkDeep} />
          <path d="M52 18 C 58 10, 66 12, 64 16 C 60 18, 56 18, 52 18 Z" fill={look.top} />
        </>
      )}
      {look.shape === "heart" && <path d="M26 30 C 34 22, 44 26, 46 32" fill="none" stroke={look.top} strokeOpacity=".8" strokeWidth="4" strokeLinecap="round" />}
      {look.shape === "star" && <circle cx="50" cy="56" r="5" fill={look.top} opacity=".9" />}
      <ellipse cx="34" cy="34" rx="9" ry="5" fill="#fff" opacity=".28" transform="rotate(-30 34 34)" />
      {/* face */}
      <ellipse cx="38" cy={cy} rx="4" ry={happy ? 2.2 : 4.6} fill={eye} />
      <ellipse cx="62" cy={cy} rx="4" ry={happy ? 2.2 : 4.6} fill={eye} />
      {!happy && <circle cx="39.4" cy={cy - 1.8} r="1.4" fill="#fff" />}
      {!happy && <circle cx="63.4" cy={cy - 1.8} r="1.4" fill="#fff" />}
      <ellipse cx="29" cy={cy + 8} rx="6" ry="3.4" fill="#FF7FA3" opacity=".7" />
      <ellipse cx="71" cy={cy + 8} rx="6" ry="3.4" fill="#FF7FA3" opacity=".7" />
      {happy ? <path d={`M44 ${cy + 6} Q50 ${cy + 15} 56 ${cy + 6} Z`} fill={eye} /> : <path d={`M45 ${cy + 7} Q47.5 ${cy + 10} 50 ${cy + 7} Q52.5 ${cy + 10} 55 ${cy + 7}`} fill="none" stroke={eye} strokeWidth="2.2" strokeLinecap="round" />}
    </svg>
  );
}

/** A scalloped paper cup a truffle sits in. */
export function Cup({ color = "#FFF1F5", edge = C.pop, size = 64 }: { color?: string; edge?: string; size?: number }) {
  const pts: string[] = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    pts.push(`${(50 + 46 * Math.cos(a)).toFixed(1)} ${(50 + 46 * Math.sin(a)).toFixed(1)}`);
  }
  return (
    <svg className="sf-cup" viewBox="0 0 100 100" width={size} height={size} aria-hidden>
      <circle cx="50" cy="50" r="44" fill={edge} />
      {pts.map((p, i) => {
        const [x, y] = p.split(" ").map(Number);
        return <circle key={i} cx={x} cy={y} r="7" fill={edge} />;
      })}
      <circle cx="50" cy="50" r="38" fill={color} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <line key={i} x1={50 + 20 * Math.cos(a)} y1={50 + 20 * Math.sin(a)} x2={50 + 37 * Math.cos(a)} y2={50 + 37 * Math.sin(a)} stroke={edge} strokeOpacity=".45" strokeWidth="2" />;
      })}
    </svg>
  );
}

/** A dripping chocolate edge (top band + drips), drawn across its box. `grow` 0–1 lengthens the drips. */
export function Drips({ color = C.choc, grow = 1, band = 18, className, style, seed = 1 }: { color?: string; grow?: number; band?: number; className?: string; style?: CSSProperties; seed?: number }) {
  const drops = [0.08, 0.2, 0.33, 0.47, 0.6, 0.72, 0.86].map((x, i) => ({ x: x * 200, w: 9 + ((i * 7 + seed * 3) % 6), h: 14 + ((i * 13 + seed * 11) % 26) }));
  const b = band;
  const scale = (60 - b) / 42;
  let d = `M0 0 H200 V${b}`;
  for (let i = drops.length - 1; i >= 0; i--) {
    const k = drops[i];
    const h = b + k.h * grow * scale;
    d += ` L${k.x + k.w} ${b} L${k.x + k.w} ${h - k.w} A ${k.w} ${k.w} 0 0 1 ${k.x - k.w} ${h - k.w} L${k.x - k.w} ${b}`;
  }
  d += ` L0 ${b} Z`;
  return (
    <svg className={`sf-drips${className ? ` ${className}` : ""}`} viewBox="0 0 200 60" preserveAspectRatio="none" style={style} aria-hidden>
      <path d={d} fill={color} />
      <path d="M8 6 H70" stroke="#fff" strokeOpacity=".25" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** Rainbow sprinkles scattered on top of something (absolute, decorative). */
export function Sprinkles({ n = 10, seed = 1, className }: { n?: number; seed?: number; className?: string }) {
  const cols = [C.pink, C.butter, C.mint, "#fff", "#C9A7FF", C.pop];
  return (
    <span className={`sf-sprinkles${className ? ` ${className}` : ""}`} aria-hidden>
      {Array.from({ length: n }, (_, i) => (
        <i key={i} style={{ left: `${(i * 37 + seed * 13) % 92 + 4}%`, top: `${(i * 23 + seed * 7) % 70 + 10}%`, background: cols[(i + seed) % cols.length], transform: `rotate(${(i * 47 + seed * 29) % 180}deg)` }} />
      ))}
    </span>
  );
}
