"use client";

// Small shared pieces for "The Little Proposal": die-cut GIF stickers, the puffy buttons, polaroids, the scene
// heading with its sparkle doodles, and the cute decorative GIF set (all on our CDN, premium-v3/gifs.json).

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { CroppedPhoto, Sticker } from "../../../_valentine/kit";
import type { DayConfig, LovePhoto, ValentineDayData } from "../../../_valentine/types";
import { gifFor } from "./util";

const CDN = "https://cdn.subhsandesh.in/gifts-media/templates/_premium/gifs";

/** Decorative stickers (not sender slots). Small files first; every one is transparent. */
export const DECOR = {
  rehearse: [
    `${CDN}/propose-day/bear-bowtie-rose.webp`,
    `${CDN}/common/noto-dizzy.webp`,
    `${CDN}/propose-day/bear-gift-crown-panda.webp`,
    `${CDN}/common/noto-hand-over-mouth.webp`,
  ],
  chocolate: `${CDN}/chocolate-day/chocolate-bar-heart.webp`,
  teddy: `${CDN}/teddy-day/teddy-red-heart.webp`,
  ring: `${CDN}/common/noto-ring.webp`,
  ringFound: `${CDN}/propose-day/penguin-ring-surprise.webp`,
  letter: `${CDN}/common/noto-love-letter.webp`,
  letterBear: `${CDN}/teddy-day/bear-i-love-you-heart.webp`,
  voice: `${CDN}/valentines-day/penguin-i-love-you-so-much.webp`,
  storyDone: `${CDN}/kiss-day/cats-boop-kiss.webp`,
  heart: `${CDN}/common/noto-sparkling-heart.webp`,
  gate: `${CDN}/valentines-day/bunny-blows-heart.webp`,
  wall: [
    `${CDN}/propose-day/penguins-proposal-kiss.webp`,
    `${CDN}/hug-day/bears-cheek-hug.webp`,
    `${CDN}/propose-day/cats-overalls-hug.webp`,
    `${CDN}/propose-day/bear-bunny-kiss-hearts.webp`,
    `${CDN}/common/noto-party-popper.webp`,
  ],
  fingerHeart: `${CDN}/promise-day/finger-heart.webp`,
  backHug: `${CDN}/hug-day/bears-back-hug.webp`,
  wingLeft: `${CDN}/propose-day/penguin-diamond-ring.webp`,
  wingRight: `${CDN}/rose-day/panda-offers-rose.webp`,
} as const;

/** A decorative GIF sticker: fixed box (no layout shift), lazy, white die-cut outline. */
export function Gif({ src, size = 96, className = "", style, eager, alt = "" }: { src: string; size?: number; className?: string; style?: CSSProperties; eager?: boolean; alt?: string }) {
  return (
    <span className={`lp-gif ${className}`} style={{ width: size, height: size, ...style }} aria-hidden={alt ? undefined : true}>
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
    <span className={`lp-gif lp-slot ${className}`} style={{ width: size, height: size, ...style }}>
      <Sticker slug={day.slug} slot={slot} value={value} size={size} alt="" eager={eager} />
    </span>
  );
}

export function Head({ kicker, title, sub }: { kicker?: ReactNode; title: ReactNode; sub?: ReactNode }) {
  return (
    <header className="lp-head">
      {kicker && <p className="lp-kicker">{kicker}</p>}
      <h2 className="lp-title">
        <Spark className="l" />
        <span>{title}</span>
        <Spark className="r" />
      </h2>
      {sub && <p className="lp-sub">{sub}</p>}
    </header>
  );
}

/** A hand-drawn four-point sparkle doodle. */
export function Spark({ className = "", size = 18 }: { className?: string; size?: number }) {
  return (
    <svg className={`lp-spark ${className}`} width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path d="M12 1.5c.6 5.2 2.3 8 9.5 10.5-7.2 2.5-8.9 5.3-9.5 10.5-.6-5.2-2.3-8-9.5-10.5C9.7 9.5 11.4 6.7 12 1.5Z" fill="currentColor" />
    </svg>
  );
}

export function Btn({ children, onClick, kind = "main", disabled, className = "", style, label }: { children: ReactNode; onClick?: () => void; kind?: "main" | "cherry" | "soft"; disabled?: boolean; className?: string; style?: CSSProperties; label?: string }) {
  return (
    <button type="button" className={`lp-btn lp-btn-${kind} ${className}`} onClick={onClick} disabled={disabled} style={style} aria-label={label}>
      {children}
    </button>
  );
}

export function LinkBtn({ children, onClick, className = "" }: { children: ReactNode; onClick: () => void; className?: string }) {
  return (
    <button type="button" className={`lp-link ${className}`} onClick={onClick}>
      {children}
    </button>
  );
}

export function Polaroid({ photo, caption, tilt = 0, tape = "pink", eager, className = "", children }: { photo: LovePhoto | null; caption?: ReactNode; tilt?: number; tape?: "pink" | "lilac" | "mint" | "none"; eager?: boolean; className?: string; children?: ReactNode }) {
  return (
    <figure className={`lp-pol ${className}`} style={{ transform: `rotate(${tilt}deg)` }}>
      {tape !== "none" && <span className={`lp-tape lp-tape-${tape}`} aria-hidden />}
      <div className="lp-pol-ph">
        {photo ? <CroppedPhoto photo={photo} alt={photo.caption ?? ""} eager={eager} /> : <span className="lp-pol-empty" aria-hidden>💜</span>}
      </div>
      {caption && <figcaption>{caption}</figcaption>}
      {children}
    </figure>
  );
}

/** The engagement ring, drawn (no image): a gold band and the chosen stone with a glint. */
export function RingArt({ stone, size = 80, className = "" }: { stone: [string, string, string]; size?: number; className?: string }) {
  const [face, deep, glint] = stone;
  return (
    <svg className={`lp-ring ${className}`} width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      <defs>
        <linearGradient id="lpBand" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFE9A8" />
          <stop offset=".5" stopColor="#F4C35A" />
          <stop offset="1" stopColor="#C98A1F" />
        </linearGradient>
        <linearGradient id="lpStone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={glint} />
          <stop offset=".45" stopColor={face} />
          <stop offset="1" stopColor={deep} />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="66" rx="29" ry="25" fill="none" stroke="url(#lpBand)" strokeWidth="8" />
      <path d="M40 41 L50 30 L60 41 Z" fill="#F4C35A" />
      <path d="M33 27 L41 16 H59 L67 27 L50 47 Z" fill="url(#lpStone)" stroke={deep} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M33 27 H67 M41 16 L45 27 L50 47 M59 16 L55 27 L50 47" stroke={deep} strokeOpacity=".45" strokeWidth="1.2" fill="none" />
      <path d="M44 20 L47 20 L45 25 Z" fill="#fff" opacity=".9" />
    </svg>
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
