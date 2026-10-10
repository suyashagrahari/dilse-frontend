"use client";

// Boo-tiful Night's little UI kit: puffy candy buttons, die-cut GIF stickers,
// the scene header (pumpkin progress + kicker + Chewy title), cream cards,
// the night backdrop (stars, a sleepy moon that becomes a heart, hills), and
// the shared CSS. Research §C3 shapes, §C5 motion values.

import { memo, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { motion } from "framer-motion";
import type { ValentineDayData } from "../../../_valentine/types";
import { loadSample, playSample, sfx, usePremium } from "../../../_valentine/kit/premium";
import { MEDIA_BASE } from "@/lib/templateMedia";
import { Ghost, Moon } from "./art";
import { BODY, DISPLAY, HAND } from "./fonts";
import { GIF, SLOT_DEFAULT } from "./gifs";
import { BN } from "./model";

export const POP = { type: "spring", stiffness: 500, damping: 15, mass: 0.8 } as const;
export const WOBBLY = { type: "spring", stiffness: 180, damping: 12, mass: 1 } as const;

// ── Buttons ──────────────────────────────────────────────────────────────────
type Tone = "orange" | "lilac" | "pink" | "cream" | "mint";
const TONES: Record<Tone, { bg: string; lip: string; ink: string }> = {
  orange: { bg: "linear-gradient(180deg,#FFB25E,#FF9A3C)", lip: BN.orangeDeep, ink: "#3A1A04" },
  lilac: { bg: "linear-gradient(180deg,#DCCBFF,#C9B6FF)", lip: "#8E6FE0", ink: BN.ink },
  pink: { bg: "linear-gradient(180deg,#FFB8D6,#FF9EC4)", lip: "#E0619C", ink: "#4A1230" },
  cream: { bg: "linear-gradient(180deg,#FFFFFF,#FFF4E3)", lip: "#E6D2B4", ink: BN.ink },
  mint: { bg: "linear-gradient(180deg,#BDF3DA,#9BE7C4)", lip: "#4FB98C", ink: "#173A2C" },
};

export function Puffy({
  children, onClick, tone = "orange", small, disabled, style, className, ariaLabel, type = "button",
}: { children: ReactNode; onClick?: () => void; tone?: Tone; small?: boolean; disabled?: boolean; style?: CSSProperties; className?: string; ariaLabel?: string; type?: "button" | "submit" }) {
  const t = TONES[tone];
  return (
    <motion.button
      type={type}
      className={`bn-puffy${small ? " is-small" : ""}${className ? ` ${className}` : ""}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      whileTap={disabled ? undefined : { scale: 0.93, y: 3 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      style={{ background: t.bg, color: t.ink, ["--lip" as string]: t.lip, ...style }}
    >
      {children}
    </motion.button>
  );
}

// ── The "next" button ────────────────────────────────────────────────────────
/** Fired on every Next press: the witch seal flies across the screen (WitchFly). */
export const WITCH_EVENT = "bn-witch";

/**
 * The one forward button of every scene: a glowing candy pill with a bobbing
 * ghost, a soft pulse after 2 s idle, and the witch seal flies across on
 * press. It lives in the scene's fixed foot slot (same spot on every page) and
 * only appears once the scene's moment is done. No auto-advance: she decides.
 */
export function NextButton({ children = "Next stop", onClick, delay = 0, disabled, ariaLabel, quiet }: { children?: ReactNode; onClick: () => void; delay?: number; disabled?: boolean; ariaLabel?: string; quiet?: boolean }) {
  const press = () => {
    if (disabled) return;
    if (!quiet) {
      sfx("swoosh-soft", { gain: 0.45 });
      if (typeof window !== "undefined") window.dispatchEvent(new Event(WITCH_EVENT));
    }
    onClick();
  };
  return (
    <motion.button
      type="button"
      className="bn-next"
      onClick={press}
      disabled={disabled}
      aria-label={ariaLabel}
      initial={{ scale: 0.6, opacity: 0, y: 10 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ ...POP, delay }}
      whileTap={disabled ? undefined : { scale: 0.92, y: 3 }}
    >
      <span className="bn-nextIn" style={{ animationDelay: `${delay + 2}s` }}>
        <span className="bn-nextIcon" aria-hidden>
          <Ghost size={30} mood="happy" />
        </span>
        <span className="bn-nextLabel">{children}</span>
        <span className="bn-nextArrow" aria-hidden>
          →
        </span>
      </span>
    </motion.button>
  );
}

const WITCH_LAUGH = "bn-witchLaugh";
const WITCH_LAUGH_URL = `${MEDIA_BASE}/templates/_halloween/witch-laugh.mp3`;
/** No repeat cackle within this long (a quick double Next flies twice). */
const LAUGH_GAP_MS = 10000;

/**
 * The witch seal on her broom, flying across the sky on each Next press. v7:
 * every flight cackles (witch-laugh.mp3 through the SFX bus, layered over the
 * music, never ducking it), except a repeat within 10 s; silent on kids pages,
 * when the music is off or the visitor turned it off (playSample itself stays
 * quiet before the gate tap and while muted).
 */
export function WitchFly({ off, laugh = true }: { off?: boolean; laugh?: boolean }) {
  const [flights, setFlights] = useState<number[]>([]);
  const p = usePremium();
  const music = p.music;
  const canLaugh = useRef(false);
  useEffect(() => {
    canLaugh.current = laugh && !(music && (music.mode === "off" || music.userOff));
  }, [laugh, music]);
  useEffect(() => {
    if (!off && laugh) void loadSample(WITCH_LAUGH, WITCH_LAUGH_URL);
  }, [off, laugh]);
  useEffect(() => {
    if (off) return;
    let n = 0;
    let lastLaugh = -Infinity;
    const go = () => {
      const now = performance.now();
      if (canLaugh.current && now - lastLaugh > LAUGH_GAP_MS) {
        lastLaugh = now;
        playSample(WITCH_LAUGH, { gain: 0.6, maxLateMs: 600 });
      }
      n += 1;
      const id = n;
      setFlights((f) => [...f.slice(-1), id]);
      window.setTimeout(() => setFlights((f) => f.filter((x) => x !== id)), 1900);
    };
    window.addEventListener(WITCH_EVENT, go);
    return () => window.removeEventListener(WITCH_EVENT, go);
  }, [off]);
  return (
    <>
      {/* warm it, so the first flight isn't a blank box */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {!off && <img src={GIF.witchSeal} alt="" width={1} height={1} loading="lazy" className="bn-witchWarm" aria-hidden />}
      {flights.map((id) => (
        <span key={id} className={`bn-witch${id % 2 ? "" : " is-low"}`} aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={GIF.witchSeal} alt="" width={150} height={150} draggable={false} />
        </span>
      ))}
    </>
  );
}

export function TextLink({ children, onClick, style }: { children: ReactNode; onClick: () => void; style?: CSSProperties }) {
  return (
    <button type="button" className="bn-link" onClick={onClick} style={style}>
      {children}
    </button>
  );
}

// ── GIF stickers ─────────────────────────────────────────────────────────────
/** A die-cut GIF sticker: white outline, soft shadow, a little tilt, a fixed box (no layout jump). */
export function Gif({
  src, size = 96, tilt = 0, float = true, eager, className, style, alt = "",
}: { src: string | null; size?: number; tilt?: number; float?: boolean; eager?: boolean; className?: string; style?: CSSProperties; alt?: string }) {
  if (!src) return null;
  return (
    <span
      className={`bn-gif${float ? " is-float" : ""}${className ? ` ${className}` : ""}`}
      style={{ width: size, height: size, ["--tilt" as string]: `${tilt}deg`, animationDelay: `${(Math.abs(tilt) % 5) * -0.7}s`, ...style }}
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" width={size} height={size} loading={eager ? "eager" : "lazy"} decoding="async" draggable={false} />
    </span>
  );
}

/** A sender-swappable slot: their link, our default, or nothing ("none"). */
export function slotSrc(data: ValentineDayData, id: string): string | null {
  const v = (data.gifs?.[id] ?? "").trim();
  if (v === "none") return null;
  if (/^https:\/\//i.test(v)) return v;
  return SLOT_DEFAULT[id] ?? null;
}

// ── Scene header ─────────────────────────────────────────────────────────────
/** The scene's kicker + title + line. (`step`/`total` are drawn by the fixed trail now.) */
export function Header({ kicker, title, sub }: { step?: number; total?: number; kicker?: ReactNode; title: ReactNode; sub?: ReactNode }) {
  return (
    <header className="bn-head">
      {kicker && <p className="bn-kicker">{kicker}</p>}
      <motion.h2 className="bn-title" initial={{ scale: 0.6, rotate: -4, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ ...POP, delay: 0.1 }}>
        {title}
      </motion.h2>
      {sub && <p className="bn-sub">{sub}</p>}
    </header>
  );
}

/** A cream speech/note card that pops in. */
export function Note({ children, tilt = -1.5, className, style }: { children: ReactNode; tilt?: number; className?: string; style?: CSSProperties }) {
  return (
    <motion.div
      className={`bn-note${className ? ` ${className}` : ""}`}
      initial={{ scale: 0.5, rotate: tilt - 8, opacity: 0, y: 14 }}
      animate={{ scale: 1, rotate: tilt, opacity: 1, y: 0 }}
      transition={POP}
      style={style}
    >
      {children}
    </motion.div>
  );
}

/** Tiny hint that wiggles after a few idle seconds. */
export function Hint({ children }: { children: ReactNode }) {
  return <p className="bn-hint">{children}</p>;
}

/** Shows children after `ms` (a "do it for me" fallback). */
export function Later({ ms, children }: { ms: number; children: ReactNode }) {
  const [on, setOn] = useState(ms <= 0);
  useEffect(() => {
    if (ms <= 0) return;
    const t = window.setTimeout(() => setOn(true), ms);
    return () => window.clearTimeout(t);
  }, [ms]);
  return on ? <>{children}</> : null;
}

// ── The night backdrop ───────────────────────────────────────────────────────
// A fixed, well-spread scatter (the R2 low-discrepancy sequence), so SSR and client agree.
const STARS = Array.from({ length: 22 }, (_, i) => ({
  x: Math.round(((0.5 + i * 0.7548777) % 1) * 96 + 2),
  y: Math.round(((0.5 + i * 0.5698403) % 1) * 64 + 3),
  s: 7 + ((i * 7) % 9),
  d: Number(((i * 0.37) % 3).toFixed(2)),
}));

export const Backdrop = memo(function Backdrop({ peak }: { peak: boolean }) {
  return (
    <div className={`bn-sky${peak ? " is-peak" : ""}`} aria-hidden>
      <span className="bn-blob bn-blob1" />
      <span className="bn-blob bn-blob2" />
      <span className="bn-blob bn-blob3" />
      <span className="bn-pinkNight" />
      {STARS.map((st, i) => (
        <svg key={i} className="bn-star" viewBox="0 0 20 20" width={st.s} height={st.s} style={{ left: `${st.x}%`, top: `${st.y}%`, animationDelay: `${st.d}s` }}>
          <path d="M10 0 C11 7 13 9 20 10 C13 11 11 13 10 20 C9 13 7 11 0 10 C7 9 9 7 10 0 Z" fill={i % 4 === 0 ? BN.pink : i % 3 === 0 ? BN.mint : "#FFF3C9"} />
        </svg>
      ))}
      <span className="bn-moonWrap">
        <span className="bn-moonGlow" />
        <Moon heart={peak} size={104} />
      </span>
      <svg className="bn-hills" viewBox="0 0 400 120" preserveAspectRatio="none">
        <path d="M0 70 Q60 30 130 62 Q200 92 270 54 Q340 18 400 58 L400 120 L0 120 Z" fill="#5B4290" />
        <path d="M0 92 Q80 60 170 88 Q260 112 330 82 Q370 68 400 80 L400 120 L0 120 Z" fill="#43307A" />
      </svg>
    </div>
  );
});

// ── CSS ──────────────────────────────────────────────────────────────────────
export const BOO_CSS = `
.bn-root { position: relative; min-height: 100dvh; overflow-x: clip; font-family: ${BODY}; color: ${BN.onNight}; isolation: isolate; }
.bn-root *, .bn-root *::before, .bn-root *::after { box-sizing: border-box; }
.bn-stage { position: relative; z-index: 2; height: 100dvh; }

/* sky */
.bn-sky { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
.bn-blob { position: absolute; border-radius: 50%; opacity: .42; }
.bn-blob1 { width: 70vmax; height: 70vmax; left: -30vmax; top: -24vmax; background: radial-gradient(circle, #8E6FE0 0%, transparent 65%); }
.bn-blob2 { width: 60vmax; height: 60vmax; right: -26vmax; top: 30vh; background: radial-gradient(circle, #FF9EC4 0%, transparent 62%); opacity: .26; }
.bn-blob3 { width: 50vmax; height: 50vmax; left: 10vw; bottom: -30vmax; background: radial-gradient(circle, #FF9A3C 0%, transparent 60%); opacity: .2; }
.bn-pinkNight { position: absolute; inset: 0; opacity: 0; transition: opacity 1.6s ease;
  background: linear-gradient(170deg, rgba(255,158,196,.85) 0%, rgba(255,170,120,.78) 55%, rgba(255,210,122,.7) 100%); }
.bn-sky.is-peak .bn-pinkNight { opacity: 1; }
.bn-star { position: absolute; animation: bn-twinkle 3.2s ease-in-out infinite; }
@keyframes bn-twinkle { 0%,100% { opacity: .35; transform: scale(.7) } 50% { opacity: 1; transform: scale(1.1) } }
.bn-moonWrap { position: absolute; right: max(18px, calc(50vw - 330px)); top: 92px; display: grid; place-items: center; transition: top 1.4s cubic-bezier(.34,1.2,.64,1), right 1.4s cubic-bezier(.34,1.2,.64,1), transform 1.4s cubic-bezier(.34,1.2,.64,1); }
.bn-sky.is-peak .bn-moonWrap { top: 16%; right: 50%; transform: translateX(50%) scale(1.9); }
.bn-moonGlow { position: absolute; width: 190px; height: 190px; border-radius: 50%; background: radial-gradient(circle, rgba(255,241,196,.45), transparent 66%); transition: background 1.2s ease; }
.bn-sky.is-peak .bn-moonGlow { background: radial-gradient(circle, rgba(255,127,181,.6), transparent 66%); }
.bn-hills { position: absolute; left: 0; right: 0; bottom: 0; width: 100%; height: 18vh; min-height: 90px; transition: opacity 1.4s ease; }
.bn-sky.is-peak .bn-hills { opacity: .35; }
@media (min-width: 1100px) { .bn-moonWrap { right: 16vw; top: 11vh; transform: scale(1.45); } .bn-sky.is-peak .bn-moonWrap { top: 16%; right: 50%; transform: translateX(50%) scale(2.2); } }
@media (max-width: 520px) { .bn-moonWrap { top: 200px; right: -22px; transform: scale(.6); } .bn-sky.is-peak .bn-moonWrap { top: 17%; right: 50%; transform: translateX(50%) scale(1.7); } }

/* scene shell: exactly one screen (research §C5 + v4 brief). The content
   column is the scene's padding box; the forward button lives in a fixed
   foot slot at the bottom, so it never covers content or moves anything. */
/* The music card reserves --vw-dock-space under DayRoot (68 px on phones) so it never
   sits on a button; our chip folds into an edge tab and every scene is exactly one
   screen, so we give that strip back (no page scroll) and keep the centre foot clear. */
.bn-root { margin-bottom: calc(-1 * var(--vw-dock-space, 0px));
  --bn-top: calc(var(--vw-top-space, 0px) + max(52px, calc(env(safe-area-inset-top, 0px) + 48px))); --bn-footH: 74px;
  --bn-bot: max(12px, env(safe-area-inset-bottom, 0px));
  --bn-gap: clamp(6px, 1.8dvh, 20px); }
.bn-scene { position: relative; display: flex; flex-direction: column; align-items: center; gap: var(--bn-gap); height: calc(100dvh / var(--bn-z, 1)); width: 100%; zoom: var(--bn-z, 1); overflow: hidden;
  padding: var(--bn-top) max(16px, calc(50% - 390px)) calc(var(--bn-bot) + var(--bn-footH) + 6px); text-align: center; }
.bn-head { display: grid; justify-items: center; gap: clamp(2px, .6dvh, 6px); max-width: 30ch; position: relative; z-index: 3; flex: none; }
.bn-kicker { margin: 0; font: 800 12px/1.2 ${BODY}; letter-spacing: .16em; text-transform: uppercase; color: ${BN.candle}; }
.bn-title { margin: 0; font: 400 clamp(28px, min(9vw, 5.2dvh), 46px)/1.02 ${DISPLAY}; color: #fff; text-shadow: 0 3px 0 rgba(42,31,61,.35); text-wrap: balance; letter-spacing: .01em; }
.bn-sub { margin: 0; font: 600 clamp(14px, 2.2dvh, 16px)/1.35 ${BODY}; color: #EDE4FF; text-wrap: balance; }
.bn-hand { font-family: ${HAND}; }
/* a flexible middle: takes the room that's left, never more */
.bn-fill { flex: 1 1 0; min-height: 0; width: 100%; display: grid; grid-template-rows: minmax(0, 1fr); place-items: center; position: relative; }

/* tall tablets and big desktops: the phone-sized scene grows with the screen */
@media (min-width: 700px) and (min-height: 940px) { .bn-root { --bn-z: 1.22; } }
@media (min-width: 1300px) and (min-height: 1000px) { .bn-root { --bn-z: 1.18; } }
@media (min-width: 1700px) and (min-height: 1050px) { .bn-root { --bn-z: 1.26; } }
@media (min-width: 700px) { .bn-root { --bn-footH: 84px; } }
/* full-bleed desktop: a wider headline measure, so titles take two lines, not five */
@media (min-width: 768px) { .bn-head { max-width: 640px; } }

/* the foot slot + the next button */
.bn-foot { position: absolute; left: 0; right: 0; bottom: var(--bn-bot); height: var(--bn-footH); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; z-index: 6; pointer-events: none;
  /* the engine's small music icon sits bottom-left (40px + 12px): keep both sides clear */ padding: 0 56px; }
.bn-foot > * { pointer-events: auto; }
.bn-next { all: unset; box-sizing: border-box; cursor: pointer; position: relative; display: inline-flex; -webkit-tap-highlight-color: transparent; border-radius: 999px; }
.bn-next:focus-visible { outline: 3px solid #fff; outline-offset: 4px; }
.bn-next[disabled] { opacity: .5; cursor: default; }
.bn-nextIn { position: relative; display: inline-flex; align-items: center; gap: 10px; min-height: 58px; padding: 0 22px 0 10px; border-radius: 999px; isolation: isolate;
  background: linear-gradient(180deg, #FFC27A 0%, #FF9A3C 55%, #FF8A2A 100%); color: #3A1A04; font: 800 clamp(16px, 4.8vw, 19px)/1 ${BODY}; letter-spacing: .01em; white-space: nowrap;
  box-shadow: 0 5px 0 ${BN.orangeDeep}, 0 0 0 3px rgba(255,255,255,.55) inset, 0 12px 28px rgba(30,16,60,.4);
  animation: bn-nextPulse 2.2s ease-in-out 2s infinite; }
.bn-nextIn::before { content: ""; position: absolute; inset: -10px; border-radius: inherit; z-index: -1; background: radial-gradient(closest-side, rgba(255,210,122,.75), rgba(255,154,60,0)); opacity: .55; animation: bn-nextGlow 2.2s ease-in-out infinite; }
.bn-nextIn::after { content: ""; position: absolute; left: 18px; right: 18px; top: 5px; height: 12px; border-radius: 99px; background: linear-gradient(180deg, rgba(255,255,255,.75), rgba(255,255,255,0)); pointer-events: none; }
.bn-next { max-width: 100%; } .bn-nextIn { max-width: 100%; min-width: 0; }
.bn-nextLabel { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
.bn-nextIcon { position: relative; display: grid; place-items: center; width: 42px; height: 42px; border-radius: 50%; background: #FFF4E3; box-shadow: 0 2px 0 #E6D2B4, 0 0 0 2px #fff inset; animation: bn-nextBob 1.6s ease-in-out infinite; }
.bn-nextIcon svg { width: 28px; height: auto; margin-top: 2px; }
.bn-nextLabel { position: relative; }
.bn-nextArrow { position: relative; display: inline-block; font-size: 22px; animation: bn-nextNudge 1.6s ease-in-out infinite; }
.bn-next:active .bn-nextIn { box-shadow: 0 2px 0 ${BN.orangeDeep}, 0 0 0 3px rgba(255,255,255,.55) inset, 0 6px 14px rgba(30,16,60,.35); }
@keyframes bn-nextPulse { 0%, 70%, 100% { transform: scale(1) } 80% { transform: scale(1.06) } 90% { transform: scale(.99) } }
@keyframes bn-nextGlow { 0%,100% { opacity: .4; transform: scale(.96) } 50% { opacity: .85; transform: scale(1.06) } }
@keyframes bn-nextBob { 0%,100% { transform: translateY(0) rotate(-6deg) } 50% { transform: translateY(-4px) rotate(6deg) } }
@keyframes bn-nextNudge { 0%,100% { transform: translateX(0) } 50% { transform: translateX(4px) } }

/* the witch seal's flight */
.bn-witchWarm { position: fixed; width: 1px; height: 1px; opacity: 0; pointer-events: none; left: 0; top: 0; }
.bn-witch { position: fixed; z-index: 90; left: 0; top: 18dvh; width: 150px; height: 150px; pointer-events: none; animation: bn-witchFly 1.8s cubic-bezier(.45,.05,.4,1) both; will-change: transform; }
.bn-witch.is-low { top: 42dvh; animation-name: bn-witchFly2; }
.bn-witch img { width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 0 2px #fff) drop-shadow(0 8px 12px rgba(30,16,60,.35)); }
@keyframes bn-witchFly { 0% { transform: translate(-170px, 40px) rotate(-8deg) } 50% { transform: translate(calc(50vw - 75px), -24px) rotate(4deg) } 100% { transform: translate(calc(100vw + 30px), 20px) rotate(-4deg) } }
@keyframes bn-witchFly2 { 0% { transform: translate(-170px, -20px) rotate(-4deg) } 50% { transform: translate(calc(50vw - 75px), 26px) rotate(6deg) } 100% { transform: translate(calc(100vw + 30px), -40px) rotate(-6deg) } }

/* puffy buttons (research §C3) */
.bn-puffy { all: unset; box-sizing: border-box; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 54px; padding: 0 28px; border-radius: 999px;
  font: 800 18px/1 ${BODY}; letter-spacing: .01em; box-shadow: 0 5px 0 var(--lip), 0 12px 26px rgba(30,16,60,.35); -webkit-tap-highlight-color: transparent; text-align: center; }
.bn-puffy.is-small { min-height: 44px; padding: 0 18px; font-size: 15px; box-shadow: 0 4px 0 var(--lip), 0 8px 18px rgba(30,16,60,.3); }
.bn-puffy:active { box-shadow: 0 2px 0 var(--lip), 0 6px 14px rgba(30,16,60,.3); }
.bn-puffy:focus-visible { outline: 3px solid #fff; outline-offset: 4px; }
.bn-puffy[disabled] { opacity: .55; cursor: default; }
.bn-link { all: unset; cursor: pointer; min-height: 44px; display: inline-flex; align-items: center; padding: 0 10px; font: 700 14px/1 ${BODY}; color: #EDE4FF; text-decoration: underline; text-underline-offset: 3px; text-decoration-color: rgba(237,228,255,.5); }
.bn-link:focus-visible { outline: 2px solid #fff; outline-offset: 2px; border-radius: 8px; }

/* die-cut GIF stickers */
:where(.bn-gif) { position: relative; }
.bn-gif { display: inline-grid; place-items: center; flex: none; transform: rotate(var(--tilt, 0deg)); pointer-events: none; }
.bn-gif img { width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 0 2px #fff) drop-shadow(0 0 1px #fff) drop-shadow(0 5px 8px rgba(30,16,60,.35)); }
.bn-gif.is-float { animation: bn-float 3.6s ease-in-out infinite; }
@keyframes bn-float { 0%,100% { transform: translateY(0) rotate(var(--tilt, 0deg)) } 50% { transform: translateY(-6px) rotate(calc(var(--tilt, 0deg) + 3deg)) } }

/* cream cards */
.bn-note { position: relative; background: ${BN.card}; color: ${BN.ink}; border-radius: 26px; padding: 16px 20px; box-shadow: 0 0 0 3px #fff inset, 0 14px 30px rgba(30,16,60,.35);
  font: 700 18px/1.4 ${BODY}; max-width: 340px; text-wrap: pretty; }
.bn-hint { margin: 0; font: 700 14px/1.3 ${BODY}; color: #EDE4FF; animation: bn-breath 2.4s ease-in-out infinite; }
@keyframes bn-breath { 0%,100% { opacity: .6 } 50% { opacity: 1 } }
.bn-wiggle { animation: bn-wiggle 2.8s ease-in-out infinite; }
@keyframes bn-wiggle { 0%, 76%, 100% { transform: rotate(0) } 80% { transform: rotate(-7deg) } 85% { transform: rotate(7deg) } 90% { transform: rotate(-4deg) } 95% { transform: rotate(3deg) } }
.bn-ants { animation: bn-ants 1.2s linear infinite; }
@keyframes bn-ants { to { stroke-dashoffset: -26; } }
.bn-carved { animation: bn-carve .45s cubic-bezier(.34,1.56,.64,1) both; transform-box: fill-box; transform-origin: center; }
@keyframes bn-carve { from { transform: scale(.2); opacity: 0 } to { transform: scale(1); opacity: 1 } }
.bn-wingL { animation: bn-flapL .32s ease-in-out infinite alternate; }
.bn-wingR { animation: bn-flapR .32s ease-in-out infinite alternate; }
@keyframes bn-flapL { from { transform: rotate(10deg) scaleY(.9) } to { transform: rotate(-14deg) scaleY(1.05) } }
@keyframes bn-flapR { from { transform: rotate(-10deg) scaleY(.9) } to { transform: rotate(14deg) scaleY(1.05) } }

/* the foot ignores taps except on its controls (all: unset would inherit "none") */
.bn-foot > *, .bn-foot .bn-next, .bn-foot .bn-puffy, .bn-foot .bn-link, .bn-foot a { pointer-events: auto; }

/* narrow phones: the pill drops its arrow so the label never truncates */
@media (max-width: 399px) { .bn-nextArrow { display: none; } .bn-nextIn { padding-right: 18px; gap: 8px; } }

@media (prefers-reduced-motion: reduce) {
  .bn-star, .bn-gif.is-float, .bn-hint, .bn-wiggle, .bn-ants, .bn-wingL, .bn-wingR, .bn-nextIn, .bn-nextIn::before, .bn-nextIcon, .bn-nextArrow { animation: none !important; }
  .bn-carved { animation-duration: .01s; }
}
`;
