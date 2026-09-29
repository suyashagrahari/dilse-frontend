"use client";

// The parody identity (wordmark with a heart for an O, the ribbon "L") and the
// small visual primitives every screen shares: avatars, stills, badges.

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { ACCENT, ACCENT_DEEP, artLook, cropStyle, fontFor } from "./theme";
import type { Crop } from "./types";

/* ── Wordmark ───────────────────────────────────────────────────────────── */

const LETTERS = ["L", "♥", "V", "E", "F", "L", "I", "X"];

/** LOVEFLIX, letters curving down toward the edges, the O is a heart. */
export function Wordmark({ size = 26, color = ACCENT, style }: { size?: number; color?: string; style?: CSSProperties }) {
  const mid = (LETTERS.length - 1) / 2;
  return (
    <span
      className="lf-wordmark"
      aria-label="LoveFlix"
      role="img"
      style={{ fontSize: size, color, ...style }}
    >
      {LETTERS.map((ch, i) => {
        const d = Math.abs(i - mid) / mid;
        const sy = 1 + d * d * 0.16;
        return (
          <span key={i} aria-hidden style={{ transform: `scaleY(${sy.toFixed(3)})` }}>
            {ch === "♥" ? (
              <svg viewBox="0 0 24 24" width="0.62em" height="0.62em" style={{ display: "block", margin: "0.1em 0.015em 0" }}>
                <path
                  fill="currentColor"
                  d="M12 21.6S1.8 15.4 1.8 8.3C1.8 5 4.3 2.6 7.3 2.6c2 0 3.7 1 4.7 2.6 1-1.6 2.7-2.6 4.7-2.6 3 0 5.5 2.4 5.5 5.7 0 7.1-10.2 13.3-10.2 13.3Z"
                />
              </svg>
            ) : (
              ch
            )}
          </span>
        );
      })}
    </span>
  );
}

/* ── The ribbon L ───────────────────────────────────────────────────────── */

export function LMark({ size = 20, style, className }: { size?: number; style?: CSSProperties; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={style} className={className} aria-hidden>
      <defs>
        <linearGradient id="lfL1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={ACCENT} />
          <stop offset="1" stopColor={ACCENT_DEEP} />
        </linearGradient>
        <linearGradient id="lfL2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7d0f2c" />
          <stop offset="1" stopColor={ACCENT} />
        </linearGradient>
      </defs>
      <path d="M26 8h24v84H26z" fill="url(#lfL1)" />
      <path d="M26 70h50l-6 22H26z" fill="url(#lfL2)" />
      <path d="M26 70h24v22L26 92z" fill="#000" opacity=".28" />
      <path d="M80 60c-2.6-2.4-6.4-.9-6.4 2.6 0 3.5 6.4 7.4 6.4 7.4s6.4-3.9 6.4-7.4c0-3.5-3.8-5-6.4-2.6z" fill="#ff9ab5" />
    </svg>
  );
}

/** "L SERIES" — the badge above a title treatment. */
export function SeriesTag({ size = 14 }: { size?: number }) {
  return (
    <span className="lf-series" style={{ fontSize: size }}>
      <LMark size={size * 1.6} />
      <span>S E R I E S</span>
    </span>
  );
}

/** The Top 10 square. */
export function Top10Chip({ size = 28 }: { size?: number }) {
  return (
    <span className="lf-top10chip" style={{ width: size, height: size * 1.05 }} aria-label="Top 10">
      <span style={{ fontSize: size * 0.24 }}>TOP</span>
      <span style={{ fontSize: size * 0.46 }}>10</span>
    </span>
  );
}

/* ── Brand pill (live mode only) ────────────────────────────────────────── */

export function BrandPill() {
  return (
    <Link href="/templates" className="lf-brandpill" aria-label="Made with SubhSandesh — make your own">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.webp" alt="" width={16} height={16} />
      <span className="lf-brandpill-full">SubhSandesh</span>
      <span className="lf-brandpill-cta">Make yours</span>
    </Link>
  );
}

/* ── Avatars ────────────────────────────────────────────────────────────── */

const AV_BG = ["#E10A17", "#2D6CDF", "#F2B01E", "#16A36B"];

/** A profile square: their photo, or a cute face in the app's avatar style. */
export function Avatar({
  src,
  crop,
  variant = 0,
  size,
  radius = 4,
  className,
}: {
  src?: string;
  crop?: Crop;
  variant?: number;
  size?: number | string;
  radius?: number;
  className?: string;
}) {
  const box: CSSProperties = { width: size, height: size, borderRadius: radius, overflow: "hidden", position: "relative", flexShrink: 0 };
  if (src) {
    return (
      <span className={className} style={{ ...box, display: "block", background: "#333" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" draggable={false} style={cropStyle(crop ?? { x: 50, y: 50, scale: 100 })} />
      </span>
    );
  }
  const bg = AV_BG[variant % AV_BG.length];
  return (
    <span className={className} style={{ ...box, display: "block", background: bg }}>
      <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden style={{ display: "block" }}>
        <rect width="100" height="100" fill={bg} />
        <circle cx="50" cy="118" r="62" fill="#000" opacity=".08" />
        {variant % 4 === 0 && (
          <>
            <path d="M31 36c-3-3-8-1-8 3.4 0 4.4 8 9.3 8 9.3s8-4.9 8-9.3c0-4.4-5-6.4-8-3.4zM69 36c-3-3-8-1-8 3.4 0 4.4 8 9.3 8 9.3s8-4.9 8-9.3c0-4.4-5-6.4-8-3.4z" fill="#fff" />
            <path d="M30 62c10 12 30 12 40 0" stroke="#fff" strokeWidth="6" strokeLinecap="round" fill="none" />
            <circle cx="22" cy="58" r="5" fill="#fff" opacity=".35" />
            <circle cx="78" cy="58" r="5" fill="#fff" opacity=".35" />
          </>
        )}
        {variant % 4 === 1 && (
          <>
            <rect x="27" y="33" width="9" height="16" rx="4.5" fill="#fff" />
            <path d="M60 42h14" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
            <path d="M30 62c10 12 30 12 40 0" stroke="#fff" strokeWidth="6" strokeLinecap="round" fill="none" />
          </>
        )}
        {variant % 4 === 2 && (
          <>
            <path d="M18 30 26 12l12 12M82 30 74 12 62 24" fill="#fff" opacity=".9" />
            <circle cx="36" cy="46" r="5" fill="#fff" />
            <circle cx="64" cy="46" r="5" fill="#fff" />
            <path d="M44 60q6 6 12 0M50 57v4" stroke="#fff" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M14 56h16M14 64h16M70 56h16M70 64h16" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" opacity=".8" />
          </>
        )}
        {variant % 4 === 3 && (
          <>
            <rect x="30" y="34" width="9" height="14" rx="4.5" fill="#fff" />
            <rect x="61" y="34" width="9" height="14" rx="4.5" fill="#fff" />
            <path d="M32 62h36" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
          </>
        )}
      </svg>
    </span>
  );
}

/* ── Stills ─────────────────────────────────────────────────────────────── */

/**
 * A card image: the photo with its crop, or generated "title art" when there is
 * no photo. `label` is the title printed on generated art.
 */
export function Still({
  src,
  crop,
  label,
  seed,
  className,
  children,
  eager,
  artSize = "md",
}: {
  src?: string;
  crop?: Crop;
  label?: string;
  seed?: string;
  className?: string;
  children?: ReactNode;
  eager?: boolean;
  artSize?: "sm" | "md" | "lg";
}) {
  const look = artLook(seed || label || "loveflix");
  return (
    <div className={`lf-still ${className ?? ""}`} style={src ? undefined : { background: look.bg }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" draggable={false} loading={eager ? "eager" : "lazy"} decoding="async" style={cropStyle(crop ?? { x: 50, y: 50, scale: 100 })} />
      ) : (
        label && (
          <span
            className={`lf-art lf-art-${artSize} lf-art-${look.font}`}
            style={{ fontFamily: fontFor(look.font), textShadow: `0 0 24px ${look.glow}66` }}
          >
            {label}
          </span>
        )
      )}
      {children}
    </div>
  );
}

/** The small "L" in the corner of an original. */
export const CornerL = () => <LMark size={18} className="lf-cornerL" />;
