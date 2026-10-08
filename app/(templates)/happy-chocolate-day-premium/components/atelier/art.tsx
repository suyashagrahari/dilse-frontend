"use client";

// ─── The Midnight Chocolatier — all the art (SVG + CSS, no images) ───────────

import type { CSSProperties, ReactNode } from "react";
import type { TruffleFlavour } from "../../../_valentine/days/happy-chocolate-day-premium";

export const C = {
  cocoa: "#2A1710",
  deep: "#170C07",
  milk: "#7B4A2E",
  copper: "#C77B4A",
  marble: "#F3ECE4",
  gold: "#E6B85C",
  goldHi: "#FFE6A6",
  rasp: "#C2185B",
  cream: "#FFF6EA",
  ink: "#2A1710",
};

/** The heart, in a 0–100 box. Also the mould cavity and the shatter outline. */
export const HEART_D = "M50 90 C 22 72, 4 54, 7 31 C 10 11, 38 6, 50 26 C 62 6, 90 11, 93 31 C 96 54, 78 72, 50 90 Z";

export const initials = (a: string, b: string) => {
  const i = (s: string) => (s.trim()[0] ?? "").toUpperCase();
  return [i(a), i(b)].filter(Boolean);
};

// ─── The atelier around every scene (fixed, full-bleed, decorative) ─────────

export function AtelierBackdrop({ lit, rain }: { lit: number; rain: boolean }) {
  return (
    <div className="mc-bd" aria-hidden data-lit={lit}>
      <div className="mc-wall" />
      <div className="mc-window">
        <div className="mc-windowGlass">{rain && <div className="mc-rain" />}</div>
        <div className="mc-windowBars" />
      </div>
      <div className="mc-shelf mc-shelfA">
        <span className="mc-jar" style={{ ["--h" as string]: "62px", ["--c" as string]: "#8a5a3a" }} />
        <span className="mc-jar" style={{ ["--h" as string]: "48px", ["--c" as string]: "#c79a5b" }} />
        <span className="mc-jar" style={{ ["--h" as string]: "70px", ["--c" as string]: "#5b3524" }} />
        <span className="mc-jar" style={{ ["--h" as string]: "40px", ["--c" as string]: "#b5435f" }} />
      </div>
      <div className="mc-shelf mc-shelfB">
        <span className="mc-jar" style={{ ["--h" as string]: "52px", ["--c" as string]: "#e6b85c" }} />
        <span className="mc-jar" style={{ ["--h" as string]: "66px", ["--c" as string]: "#6d4128" }} />
        <span className="mc-jar" style={{ ["--h" as string]: "44px", ["--c" as string]: "#9b6a3f" }} />
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className={`mc-lamp mc-lamp${i}${lit > i ? " is-on" : ""}`}>
          <span className="mc-cord" />
          <span className="mc-shade" />
          <span className="mc-bulb" />
          <span className="mc-cone" />
        </div>
      ))}
      <div className="mc-counter" />
      <div className="mc-vignette" />
      <div className="mc-grain" />
    </div>
  );
}

// ─── Gate: the shop door with the CLOSED sign ───────────────────────────────

export function ShopDoor({ name }: { name: string }) {
  return (
    <div className="mc-door">
      <div className="mc-doorGlass">
        <div className="mc-rain" />
        <div className="mc-doorWarm" />
        <svg className="mc-doorWord" viewBox="0 0 200 64" aria-hidden>
          <defs>
            <path id="mc-arc" d="M8 60 Q100 -4 192 60" />
          </defs>
          <text>
            <textPath href="#mc-arc" startOffset="50%" textAnchor="middle">ATELIER · CHOCOLAT</textPath>
          </text>
        </svg>
      </div>
      <div className="mc-signWrap">
        <span className="mc-string" />
        <div className="mc-sign">
          <div className="mc-signFace mc-signFront">
            <b>CLOSED</b>
            <small>except for</small>
            <i>{name}</i>
          </div>
          <div className="mc-signFace mc-signBack">
            <b>OPEN</b>
            <small>just for you</small>
          </div>
        </div>
      </div>
      <span className="mc-handle" />
    </div>
  );
}


// ─── Hammer ─────────────────────────────────────────────────────────────────

export function GoldHammer({ style, className }: { style?: CSSProperties; className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} style={style} aria-hidden>
      <defs>
        <linearGradient id="mc-gold" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#fff1bf" />
          <stop offset=".45" stopColor="#e2b44a" />
          <stop offset="1" stopColor="#8f6118" />
        </linearGradient>
      </defs>
      <rect x="54" y="34" width="10" height="80" rx="5" fill="#5b3524" transform="rotate(-38 60 60)" />
      <rect x="54" y="38" width="3" height="70" rx="1.5" fill="#8a5a3a" transform="rotate(-38 60 60)" />
      <g transform="rotate(-38 60 60)">
        <rect x="30" y="16" width="60" height="22" rx="6" fill="url(#mc-gold)" />
        <rect x="30" y="16" width="60" height="6" rx="3" fill="#fff6d6" opacity=".55" />
      </g>
    </svg>
  );
}

// ─── Truffles ───────────────────────────────────────────────────────────────

export const FLAVOURS: Record<TruffleFlavour, { name: string; note: string; shell: string; top: string; fill: string; ingredient: string }> = {
  hazelnut: { name: "Hazelnut", note: "toasted, warm, a little nutty", shell: "radial-gradient(circle at 35% 30%, #8d5a3b, #4a2617 62%, #2b140b)", top: "hazel", fill: "#b07a4f", ingredient: "a handful of toasted hazelnuts" },
  "sea-salt": { name: "Sea salt", note: "sweet, with a little bite", shell: "radial-gradient(circle at 35% 30%, #6f4330, #2f170d 62%, #1c0c06)", top: "salt", fill: "#d9b48a", ingredient: "a pinch of sea salt" },
  raspberry: { name: "Raspberry", note: "bright, a little tart", shell: "radial-gradient(circle at 35% 30%, #e0607e, #a11a45 60%, #5e0d27)", top: "rasp", fill: "#e98aa4", ingredient: "three ripe raspberries" },
  "gold-leaf": { name: "Gold leaf", note: "rare, and worth it", shell: "radial-gradient(circle at 35% 30%, #5c3624, #24110a 62%, #120804)", top: "gold", fill: "#c08a5a", ingredient: "one sheet of gold leaf" },
  pistachio: { name: "Pistachio", note: "soft, green, unexpected", shell: "radial-gradient(circle at 35% 30%, #c9d79a, #8ea35a 58%, #4f5e2a)", top: "pista", fill: "#d9e5b0", ingredient: "a spoon of crushed pistachio" },
  rose: { name: "Rose", note: "old-fashioned romance", shell: "radial-gradient(circle at 35% 30%, #f6c3cf, #d97e97 58%, #8f3a52)", top: "rose", fill: "#fbe0e6", ingredient: "two drops of rosewater" },
  heart: { name: "The heart", note: "no flavour. just you", shell: "radial-gradient(circle at 35% 30%, #e0457b, #a11a45 60%, #5e0d27)", top: "heart", fill: "#7b2a3a", ingredient: "all of my heart" },
};

export function Truffle({ flavour, size, bitten, style, className }: { flavour: TruffleFlavour; size: number | string; bitten?: boolean; style?: CSSProperties; className?: string }) {
  const f = FLAVOURS[flavour] ?? FLAVOURS.hazelnut;
  const heart = flavour === "heart";
  return (
    <span
      className={`mc-truf${heart ? " is-heart" : ""}${bitten ? " is-bitten" : ""}${className ? ` ${className}` : ""}`}
      style={{ width: size, height: size, ["--shell" as string]: f.shell, ["--fill" as string]: f.fill, ...style }}
      aria-hidden
    >
      <span className="mc-trufShell" />
      <span className={`mc-trufTop mc-top-${f.top}`} />
      <span className="mc-trufGloss" />
      <span className="mc-trufBite" />
    </span>
  );
}

// ─── Small helpers ──────────────────────────────────────────────────────────

export function Card({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div className={`mc-card${className ? ` ${className}` : ""}`} style={style}>
      {children}
    </div>
  );
}

export const BOX_COLORS: Record<string, { a: string; b: string; ink: string; ribbon: string }> = {
  raspberry: { a: "#C2285A", b: "#7E1236", ink: "#FFE9EF", ribbon: "#E6B85C" },
  midnight: { a: "#2C3160", b: "#151833", ink: "#E8E6FF", ribbon: "#E6B85C" },
  ivory: { a: "#F6EEDF", b: "#D9C9AC", ink: "#5B3524", ribbon: "#B0204F" },
  blush: { a: "#F0B9C4", b: "#C9808F", ink: "#5E1A2D", ribbon: "#E6B85C" },
};
