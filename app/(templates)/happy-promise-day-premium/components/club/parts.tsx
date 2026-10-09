"use client";

// Small shared pieces for "The Pinky Promise Club": die-cut GIF stickers, puffy buttons, polaroids, the scene heading
// with sparkle doodles, the drawn art (a pinky hand, a folded paper star, the heart love lock) and the decorative GIF
// set (all on our CDN, premium-v3/gifs.json).

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { CroppedPhoto, Sticker } from "../../../_valentine/kit";
import type { DayConfig, LovePhoto, ValentineDayData } from "../../../_valentine/types";
import { gifFor } from "./util";

const CDN = "https://cdn.subhsandesh.in/gifts-media/templates/_premium/gifs";

/** Decorative stickers (not sender slots). Small files first; every one is transparent. */
export const DECOR = {
  gate: `${CDN}/promise-day/pinky-promise-pastel.webp`,
  hooked: `${CDN}/promise-day/couple-pinky-promise.webp`,
  jarDone: `${CDN}/teddy-day/bear-i-love-you-heart.webp`,
  approved: `${CDN}/promise-day/finger-heart.webp`,
  braceletDone: `${CDN}/promise-day/bears-promise-gift.webp`,
  diary: `${CDN}/common/noto-love-letter.webp`,
  diaryBear: `${CDN}/teddy-day/teddy-red-heart.webp`,
  voice: `${CDN}/valentines-day/penguin-i-love-you-so-much.webp`,
  lane: `${CDN}/promise-day/bear-bunny-friends.webp`,
  laneDone: `${CDN}/kiss-day/cats-boop-kiss.webp`,
  heart: `${CDN}/common/noto-sparkling-heart.webp`,
  star: `${CDN}/common/noto-glowing-star.webp`,
  sky: [
    `${CDN}/hug-day/bears-cheek-hug.webp`,
    `${CDN}/promise-day/pinky-promise-sketch.webp`,
    `${CDN}/kiss-day/bears-surprise-kiss.webp`,
    `${CDN}/promise-day/pandas-happy-promise-day.webp`,
    `${CDN}/common/noto-two-hearts.webp`,
  ],
  cardTop: `${CDN}/promise-day/pinky-promise-heart.webp`,
  cardHug: `${CDN}/promise-day/bears-cuddle-promise.webp`,
  wingLeft: `${CDN}/promise-day/couple-pinky-promise.webp`,
  wingRight: `${CDN}/promise-day/pandas-happy-promise-day.webp`,
} as const;

/** A decorative GIF sticker: fixed box (no layout shift), lazy, white die-cut outline. */
export function Gif({ src, size = 96, className = "", style, eager, alt = "" }: { src: string; size?: number; className?: string; style?: CSSProperties; eager?: boolean; alt?: string }) {
  return (
    <span className={`pk-gif ${className}`} style={{ width: size, height: size, ...style }} aria-hidden={alt ? undefined : true}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        width={size}
        height={size}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
        }}
      />
    </span>
  );
}

/** A sender GIF slot (their own link, "none", or our CDN default) in the same die-cut look. */
export function SlotGif({ day, data, id, size = 110, className = "", style, eager }: { day: DayConfig; data: ValentineDayData; id: string; size?: number; className?: string; style?: CSSProperties; eager?: boolean }) {
  const slot = day.gifSlots.find((g) => g.id === id);
  const value = gifFor(data, id);
  if (!slot || value === "none") return null;
  return (
    <span className={`pk-gif pk-slot ${className}`} style={{ width: size, height: size, ...style }}>
      <Sticker slug={day.slug} slot={slot} value={value} size={size} alt="" eager={eager} />
    </span>
  );
}

export function Head({ kicker, title, sub }: { kicker?: ReactNode; title: ReactNode; sub?: ReactNode }) {
  return (
    <header className="pk-head">
      {kicker && <p className="pk-kicker">{kicker}</p>}
      <h2 className="pk-title">
        <Spark className="l" />
        <span>{title}</span>
        <Spark className="r" />
      </h2>
      {sub && <p className="pk-sub">{sub}</p>}
    </header>
  );
}

/** A hand-drawn four-point sparkle doodle. */
export function Spark({ className = "", size = 18 }: { className?: string; size?: number }) {
  return (
    <svg className={`pk-spark ${className}`} width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path d="M12 1.5c.6 5.2 2.3 8 9.5 10.5-7.2 2.5-8.9 5.3-9.5 10.5-.6-5.2-2.3-8-9.5-10.5C9.7 9.5 11.4 6.7 12 1.5Z" fill="currentColor" />
    </svg>
  );
}

export function Btn({ children, onClick, kind = "main", disabled, className = "", style, label }: { children: ReactNode; onClick?: () => void; kind?: "main" | "lilac" | "soft"; disabled?: boolean; className?: string; style?: CSSProperties; label?: string }) {
  return (
    <button type="button" className={`pk-btn pk-btn-${kind} ${className}`} onClick={onClick} disabled={disabled} style={style} aria-label={label}>
      {children}
    </button>
  );
}

export function LinkBtn({ children, onClick, className = "" }: { children: ReactNode; onClick: () => void; className?: string }) {
  return (
    <button type="button" className={`pk-link ${className}`} onClick={onClick}>
      {children}
    </button>
  );
}

export function Polaroid({ photo, caption, tilt = 0, tape = "peach", eager, className = "", children }: { photo: LovePhoto | null; caption?: ReactNode; tilt?: number; tape?: "peach" | "lilac" | "mint" | "none"; eager?: boolean; className?: string; children?: ReactNode }) {
  return (
    <figure className={`pk-pol ${className}`} style={{ transform: `rotate(${tilt}deg)` }}>
      {tape !== "none" && <span className={`pk-tape pk-tape-${tape}`} aria-hidden />}
      <div className="pk-pol-ph">
        {photo ? <CroppedPhoto photo={photo} alt={photo.caption ?? ""} eager={eager} /> : <span className="pk-pol-empty" aria-hidden>🤙</span>}
      </div>
      {caption && <figcaption>{caption}</figcaption>}
      {children}
    </figure>
  );
}

/** Short text that types itself in place: the untyped rest is laid out invisibly, so the box never grows. */
export function Typed({ text, speed = 34, delay = 0 }: { text: string; speed?: number; delay?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let i = 0;
    let t = 0;
    const tick = () => {
      i += 1;
      setN(i);
      if (i < text.length) t = window.setTimeout(tick, /[.,!?]/.test(text[i - 1]) ? speed * 6 : speed);
    };
    t = window.setTimeout(tick, delay);
    return () => window.clearTimeout(t);
  }, [text, speed, delay]);
  return (
    <span aria-label={text}>
      <span aria-hidden>{text.slice(0, n)}</span>
      <span aria-hidden style={{ visibility: "hidden" }}>
        {text.slice(n)}
      </span>
    </span>
  );
}

/**
 * A cute cartoon hand with the pinky held up (viewBox 120×200, the pinky's centre at x=36.5, its tip at y=34).
 * Hers has a coral polka-dot sleeve and a heart on the nail; his a lilac striped sleeve. Rotate 180° for his.
 */
export function PinkyHand({ who, className = "", style }: { who: "her" | "him"; className?: string; style?: CSSProperties }) {
  const her = who === "her";
  const id = her ? "pkH" : "pkM";
  return (
    <svg className={`pk-hand ${className}`} style={style} viewBox="0 0 120 200" aria-hidden>
      <defs>
        <pattern id={`${id}dots`} width="14" height="14" patternUnits="userSpaceOnUse">
          <rect width="14" height="14" fill={her ? "#FF8A6B" : "#A07BFF"} />
          {her ? <circle cx="7" cy="7" r="2.6" fill="#FFE4D2" /> : <rect x="0" y="0" width="14" height="5" fill="#C9B6FF" />}
        </pattern>
      </defs>
      <rect x="20" y="152" width="80" height="60" rx="12" fill={`url(#${id}dots)`} />
      <rect x="16" y="144" width="88" height="18" rx="9" fill={her ? "#FFD3B8" : "#DCCBFF"} stroke={her ? "#E0603F" : "#7A52E0"} strokeOpacity=".35" strokeWidth="2" />
      {/* the pinky, held up */}
      <rect x="26" y="34" width="21" height="64" rx="10.5" fill="#FFDCC8" stroke="#E9A48A" strokeWidth="2.5" />
      <rect x="30.5" y="38" width="12" height="10" rx="5" fill={her ? "#FFB3C6" : "#FFE9DD"} stroke="#E9A48A" strokeWidth="1.2" />
      {her && <path d="M36.5 46.6c-2.3-1.7-3.5-2.8-3.5-4.1 0-1 .8-1.7 1.7-1.7.7 0 1.4.4 1.8 1 .4-.6 1.1-1 1.8-1 .9 0 1.7.7 1.7 1.7 0 1.3-1.2 2.4-3.5 4.1Z" fill="#FF4D6D" />}
      <path d="M30 68 q6 3 13 0" stroke="#E9A48A" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity=".7" />
      {/* the fist */}
      <rect x="24" y="76" width="74" height="80" rx="30" fill="#FFDCC8" stroke="#E9A48A" strokeWidth="2.5" />
      <ellipse cx="58" cy="84" rx="11" ry="12" fill="#FFDCC8" stroke="#E9A48A" strokeWidth="2.2" />
      <ellipse cx="76" cy="83" rx="11" ry="12" fill="#FFDCC8" stroke="#E9A48A" strokeWidth="2.2" />
      <ellipse cx="91" cy="92" rx="9" ry="12" fill="#FFDCC8" stroke="#E9A48A" strokeWidth="2.2" />
      <rect x="40" y="88" width="56" height="20" fill="#FFDCC8" />
      <path d="M38 124 C48 110 72 108 88 116" stroke="#E9A48A" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <ellipse cx="44" cy="138" rx="7" ry="4.5" fill="#FF9EB5" opacity=".45" />
      <ellipse cx="84" cy="136" rx="6" ry="4" fill="#FF9EB5" opacity=".35" />
    </svg>
  );
}

/** A puffy folded paper star (origami lucky star). */
export function PaperStar({ color = "#FFD27A", deep = "#E8A93B", size = 40, className = "", style }: { color?: string; deep?: string; size?: number; className?: string; style?: CSSProperties }) {
  return (
    <svg className={`pk-star ${className}`} style={style} width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      <path d="M24 4.5 L29.6 16.9 L43 18.3 L32.9 27.3 L35.8 40.5 L24 33.7 L12.2 40.5 L15.1 27.3 L5 18.3 L18.4 16.9 Z" fill={color} stroke={deep} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M24 4.5 L24 24 M43 18.3 L24 24 M35.8 40.5 L24 24 M12.2 40.5 L24 24 M5 18.3 L24 24" stroke={deep} strokeOpacity=".35" strokeWidth="1.4" />
      <path d="M17 18 L21 13" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" opacity=".7" />
    </svg>
  );
}

/** The heart-shaped love lock. `open` lifts the shackle. */
export function LoveLock({ open, engraving, size = 170, className = "" }: { open: boolean; engraving: string; size?: number; className?: string }) {
  return (
    <svg className={`pk-lockArt${open ? " is-open" : ""} ${className}`} width={size} height={size * 1.18} viewBox="0 0 120 142" aria-hidden>
      <defs>
        <linearGradient id="pkLockBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFC2B0" />
          <stop offset=".55" stopColor="#FF8A6B" />
          <stop offset="1" stopColor="#E0603F" />
        </linearGradient>
        <linearGradient id="pkShackle" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#E8C66A" />
          <stop offset=".5" stopColor="#FFF0B8" />
          <stop offset="1" stopColor="#D9A441" />
        </linearGradient>
      </defs>
      <g className="pk-shackle">
        <path d="M34 66 V42 C34 24 46 12 60 12 C74 12 86 24 86 42 V66" fill="none" stroke="url(#pkShackle)" strokeWidth="11" strokeLinecap="round" />
        <path d="M37 60 V43 C37 28 47 16 60 16" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="3" strokeLinecap="round" />
      </g>
      <path d="M60 136 C26 112 8 94 8 70 C8 54 20 44 34 44 C46 44 55 51 60 60 C65 51 74 44 86 44 C100 44 112 54 112 70 C112 94 94 112 60 136 Z" fill="url(#pkLockBody)" stroke="#C94A2C" strokeWidth="3" />
      <path d="M20 66 C22 56 30 52 38 53" stroke="#fff" strokeOpacity=".7" strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx="60" cy="82" r="7.5" fill="#7A2E1C" />
      <path d="M57 86 L63 86 L61.5 100 L58.5 100 Z" fill="#7A2E1C" />
      <text x="60" y="111" textAnchor="middle" fontSize="8.6" fontWeight="700" fill="#FFF4EC" style={{ fontFamily: "var(--pk-hand), cursive" }}>
        {engraving.slice(0, 20)}
      </text>
    </svg>
  );
}

/** A tiny golden key. */
export function KeyArt({ size = 54, className = "", style }: { size?: number; className?: string; style?: CSSProperties }) {
  return (
    <svg className={`pk-key ${className}`} style={style} width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <path d="M20 12 C11 12 6 18 6 24 C6 31 12 36 20 36 C28 36 33 30 33 24 C33 18 28 12 20 12 Z M20 18 C16.5 18 13 20.5 13 24 C13 27.5 16.5 30 20 30 C23.5 30 27 27.5 27 24 C27 20.5 23.5 18 20 18 Z" fill="#F4C35A" stroke="#C98A1F" strokeWidth="2" fillRule="evenodd" />
      <path d="M31 26 L58 26 L58 32 L52 32 L52 38 L46 38 L46 32 L31 32 Z" fill="#F4C35A" stroke="#C98A1F" strokeWidth="2" strokeLinejoin="round" />
      <path d="M16 15.5 C14 16.5 12 18 11 20" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".8" />
    </svg>
  );
}
