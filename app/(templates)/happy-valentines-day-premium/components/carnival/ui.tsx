"use client";

// Shared bits for every stall: the scene context, die-cut GIF stickers, the scene heading, puffy buttons, the
// "aww" reward (sound + heart burst + haptic), and the template's own cute SFX cues.

import { createContext, useContext, type CSSProperties, type ReactNode } from "react";
import { CroppedPhoto, Sticker, burst, haptic } from "../../../_valentine/kit";
import { registerCue, type CueId } from "../../../_valentine/kit/premium";
import type { DayConfig, ValentineDayData } from "../../../_valentine/types";
import type { LovePhoto } from "../../../_love/types";
import type { Carnival } from "./model";
import { C } from "./model";

// ─── Local cues (each with a visual twin in its scene) ─────────────────────────
let cuesReady = false;
export function ensureCarnivalCues() {
  if (cuesReady) return;
  cuesReady = true;
  // A rubbery spring: a sine that bends down then up (capsules landing, cans bouncing).
  registerCue("vc-boing", (x) => {
    const o = x.c.createOscillator();
    const g = x.c.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(180 * x.k, x.t);
    o.frequency.exponentialRampToValueAtTime(520 * x.k, x.t + 0.08);
    o.frequency.exponentialRampToValueAtTime(240 * x.k, x.t + 0.32);
    g.gain.setValueAtTime(0.0001, x.t);
    g.gain.linearRampToValueAtTime(0.32, x.t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, x.t + 0.36);
    o.connect(g).connect(x.out);
    o.start(x.t);
    o.stop(x.t + 0.4);
    x.keep(o);
  });
  // The fairground "ding ding!" of a win: two bright bell partials.
  registerCue("vc-ding", (x) => {
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
}

// ─── Scene context ──────────────────────────────────────────────────────────────
export interface StallApi {
  c: Carnival;
  data: ValentineDayData;
  day: DayConfig;
  /** The scene's interaction landed: show Next. */
  done: () => void;
  isDone: boolean;
  sfx: (id: CueId | (string & {}), o?: { gain?: number; detune?: number; pan?: number; dur?: number }) => unknown;
  /** Index of this stall in the journey (skips appear from the 3rd). */
  index: number;
}
export const StallCtx = createContext<StallApi | null>(null);
export const useStall = () => useContext(StallCtx)!;

/** The "aww" beat: chime/pop + a heart burst from a point (or the element's centre) + a haptic. */
export function reward(sfx: StallApi["sfx"], at?: { x: number; y: number } | Element | null, opts: { big?: boolean; cue?: string } = {}) {
  let origin: { x: number; y: number } | undefined;
  if (at && "getBoundingClientRect" in at) {
    const r = at.getBoundingClientRect();
    origin = { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 2) / window.innerHeight };
  } else if (at) origin = at;
  sfx(opts.cue ?? "chime", { gain: 0.55 });
  if (opts.big) sfx("sparkle", { gain: 0.45 });
  burst({ kind: "hearts", origin, count: opts.big ? 26 : 14, spread: opts.big ? 0.45 : 0.22, colors: [C.primary, C.soft, C.pop, C.lav, "#FFFFFF"], emojis: ["💖", "💗", "✨", "💘"] });
  haptic(opts.big ? [20, 30, 20, 30, 60] : [15, 40, 25]);
}

// ─── Stickers ───────────────────────────────────────────────────────────────────
/** A die-cut (white-outlined) GIF from the library. Sized box, lazy, async decode: nothing jumps. */
export function Gif({ src, size, tilt = 0, float, className, style, eager, alt = "" }: { src: string; size: number; tilt?: number; float?: boolean; className?: string; style?: CSSProperties; eager?: boolean; alt?: string }) {
  return (
    <span className={`vc-gif${float ? " is-float" : ""}${className ? ` ${className}` : ""}`} style={{ width: size, height: size, ["--tilt" as string]: `${tilt}deg`, ...style }} aria-hidden={alt ? undefined : true}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} width={size} height={size} loading={eager ? "eager" : "lazy"} decoding="async" draggable={false} />
    </span>
  );
}

/** One of the six editable GIF slots, die-cut like the library stickers. */
export function SlotGif({ id, size, tilt = 0, float, className, style, eager }: { id: string; size: number; tilt?: number; float?: boolean; className?: string; style?: CSSProperties; eager?: boolean }) {
  const { day, data } = useStall();
  const slot = day.gifSlots.find((g) => g.id === id);
  if (!slot) return null;
  return (
    <span className={`vc-gif is-slot${float ? " is-float" : ""}${className ? ` ${className}` : ""}`} style={{ width: size, height: size, ["--tilt" as string]: `${tilt}deg`, ...style }}>
      <Sticker slug={day.slug} slot={slot} value={data.gifs?.[id]} size={size} alt="" eager={eager} />
    </span>
  );
}

// ─── Heading + buttons ──────────────────────────────────────────────────────────
export function StallHead({ kicker, title, hint }: { kicker: string; title: ReactNode; hint?: ReactNode }) {
  return (
    <header className="vc-head">
      <span className="vc-kick">{kicker}</span>
      <h2 className="vc-title">
        <Spark className="vc-sparkL" />
        {title}
        <Spark className="vc-sparkR" />
      </h2>
      {hint && <p className="vc-hint">{hint}</p>}
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

export function Puffy({ children, onClick, tone = "cherry", className, small, disabled, label }: { children: ReactNode; onClick?: () => void; tone?: "cherry" | "white" | "butter" | "lav"; className?: string; small?: boolean; disabled?: boolean; label?: string }) {
  return (
    <button type="button" className={`vc-puffy is-${tone}${small ? " is-small" : ""}${className ? ` ${className}` : ""}`} onClick={onClick} disabled={disabled} aria-label={label}>
      {children}
    </button>
  );
}

/** A tiny washi-tape strip. */
export function Washi({ color = C.lav, rot = -6, style }: { color?: string; rot?: number; style?: CSSProperties }) {
  return <i className="vc-washi" style={{ background: color, transform: `rotate(${rot}deg)`, ...style }} aria-hidden />;
}

/** A polaroid with her photo (or a pastel heart card when there is none) and a handwritten caption. */
export function Polaroid({ photo, caption, fallback, tilt = 0, width = 220, className, style, eager, children }: { photo: LovePhoto | null; caption?: string; fallback?: string; tilt?: number; width?: number; className?: string; style?: CSSProperties; eager?: boolean; children?: ReactNode }) {
  return (
    <figure className={`vc-polaroid${className ? ` ${className}` : ""}`} style={{ width, ["--tilt" as string]: `${tilt}deg`, ...style }}>
      <div className="vc-polaroidPic">
        {photo ? <CroppedPhoto photo={photo} eager={eager} alt={caption || photo.caption || ""} /> : <span className="vc-polaroidEmpty">{fallback ?? "💖"}</span>}
      </div>
      {(caption ?? photo?.caption) && <figcaption>{caption ?? photo?.caption}</figcaption>}
      {children}
    </figure>
  );
}

/** A bright pop-up card (never a dark lightbox): pink haze, the card springs in, tap outside or ✕ to close. */
export function PopCard({ open, onClose, children, label }: { open: boolean; onClose: () => void; children: ReactNode; label: string }) {
  if (!open) return null;
  return (
    <div className="vc-popCard" role="dialog" aria-modal="true" aria-label={label} onClick={onClose}>
      <div className="vc-popCardIn" onClick={(e) => e.stopPropagation()}>
        {children}
        <button type="button" className="vc-popClose" onClick={onClose} aria-label="Close">✕</button>
      </div>
    </div>
  );
}
