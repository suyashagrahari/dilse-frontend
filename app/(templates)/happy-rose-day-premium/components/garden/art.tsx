"use client";

// "The Rose Garden" art: the seed packet (gate), the watering can, the singing rose, the kraft bouquet cone and
// bow, photo flowers, washi tape, doodles, and the die-cut GIF sticker frame. The rose itself (head, stem,
// potted plant) is the $2 Rose Day's hand-drawn SVG (../../../happy-rose-day/components/rose/art), so the
// premium garden is visibly the same family, just bigger.

import type { CSSProperties, ReactNode } from "react";
import { CroppedPhoto, Sticker } from "../../../_valentine/kit";
import type { DayConfig } from "../../../_valentine/types";
import type { LovePhoto } from "../../../_love/types";
import { GradDefs, RoseHead, roseGrads, shadesFor, LEAF } from "../../../happy-rose-day/components/rose/art";

// ─── Stickers ───────────────────────────────────────────────────────────────

/** A die-cut sticker frame (white outline + soft pink shadow) for one of OUR fixed GIFs. Fixed box, lazy. */
export function Gif({ src, size, className, style, eager, tilt = 0 }: { src: string; size: number; className?: string; style?: CSSProperties; eager?: boolean; tilt?: number }) {
  return (
    <span className={`rg-sticker${className ? ` ${className}` : ""}`} style={{ width: size, height: size, ["--tilt" as string]: `${tilt}deg`, ...style }} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" width={size} height={size} loading={eager ? "eager" : "lazy"} decoding="async" draggable={false} />
    </span>
  );
}

/** One of the six editable GIF slots, in the same die-cut frame. */
export function Slot({ day, gifs, id, size, className, style, eager, tilt = 0 }: { day: DayConfig; gifs?: Record<string, string>; id: string; size: number; className?: string; style?: CSSProperties; eager?: boolean; tilt?: number }) {
  const slot = day.gifSlots.find((s) => s.id === id);
  if (!slot || gifs?.[id] === "none") return null;
  return (
    <span className={`rg-sticker${className ? ` ${className}` : ""}`} style={{ width: size, height: size, ["--tilt" as string]: `${tilt}deg`, ...style }}>
      <Sticker slug={day.slug} slot={slot} value={gifs?.[id]} size={size} alt="" eager={eager} />
    </span>
  );
}

// ─── Doodles ────────────────────────────────────────────────────────────────

export function Sparkle({ size = 18, color = "#FF6F9C", style, className }: { size?: number; color?: string; style?: CSSProperties; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="-10 -10 20 20" style={style} aria-hidden>
      <path d="M0 -9 C 1 -3 3 -1 9 0 C 3 1 1 3 0 9 C -1 3 -3 1 -9 0 C -3 -1 -1 -3 0 -9 Z" fill={color} />
    </svg>
  );
}

export function Squiggle({ width = 120, color = "#FF6F9C", style }: { width?: number; color?: string; style?: CSSProperties }) {
  return (
    <svg width={width} height={12} viewBox="0 0 120 12" preserveAspectRatio="none" style={style} aria-hidden>
      <path d="M2 7 C 14 1 22 11 34 6 S 56 1 68 6 S 90 11 102 5 S 116 4 118 6" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" />
    </svg>
  );
}

export function Washi({ color = "rgba(255,143,181,.62)", style, className }: { color?: string; style?: CSSProperties; className?: string }) {
  return <span className={`rg-washi${className ? ` ${className}` : ""}`} style={{ ["--washi" as string]: color, ...style }} aria-hidden />;
}

// ─── Seed packet (the gate) ─────────────────────────────────────────────────

export function SeedPacket({ name, color, peek }: { name: string; color: string; peek?: ReactNode }) {
  const sh = shadesFor(color);
  const short = name.length > 11 ? `${name.slice(0, 10)}…` : name;
  return (
    <span className="rg-packet">
      {peek && <span className="rg-packetPeek">{peek}</span>}
      <svg viewBox="0 0 220 290" width="100%" height="100%" aria-hidden style={{ overflow: "visible" }}>
        <GradDefs grads={roseGrads("pk", sh)} />
        <defs>
          <linearGradient id="pk-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFD9E6" />
            <stop offset="1" stopColor="#FFB8CF" />
          </linearGradient>
          <pattern id="pk-dots" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="1.6" fill="rgba(255,255,255,.55)" />
          </pattern>
        </defs>
        <ellipse cx="110" cy="284" rx="86" ry="7" fill="rgba(214,63,114,.16)" />
        {/* body */}
        <g className="rg-packBody">
          <rect x="14" y="40" width="192" height="236" rx="16" fill="url(#pk-body)" stroke="#fff" strokeWidth="5" />
          <rect x="14" y="40" width="192" height="236" rx="16" fill="url(#pk-dots)" />
          {/* window */}
          <rect x="44" y="70" width="132" height="120" rx="60" fill="#FFF5F8" stroke="#fff" strokeWidth="4" />
          <g transform="translate(110 162)">
            <path d="M0 0 C -3 14 3 22 0 30" stroke={LEAF.stem} strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M0 18 C 10 8 24 8 30 14 C 20 22 8 22 0 18 Z" fill={LEAF.mid} />
            <RoseHead id="pk" open={0.9} x={0} y={4} s={0.95} />
          </g>
          <path d="M168 84 C 169 89 171 91 176 92 C 171 93 169 95 168 100 C 167 95 165 93 160 92 C 165 91 167 89 168 84 Z" fill="#FFE27A" />
          <path d="M58 168 C 59 172 60 173 64 174 C 60 175 59 176 58 180 C 57 176 56 175 52 174 C 56 173 57 172 58 168 Z" fill="#fff" />
          <text x="110" y="214" textAnchor="middle" fontFamily="var(--font-fredoka), Fredoka, sans-serif" fontWeight={600} fontSize="12" letterSpacing="3" fill="#D63F72">
            SEEDS OF
          </text>
          <text x="110" y="246" textAnchor="middle" fontFamily="var(--rg-hand), Caveat, cursive" fontWeight={700} fontSize="34" fill="#5B2333">
            {short}
          </text>
          <text x="110" y="266" textAnchor="middle" fontFamily="var(--font-fredoka), Fredoka, sans-serif" fontWeight={500} fontSize="9.5" fill="#8A4A5C">
            1 rose · grows forever · water daily
          </text>
        </g>
        {/* the strip that tears off */}
        <g className="rg-packTop">
          <path d="M14 12 Q 14 4 24 4 L196 4 Q 206 4 206 12 L206 40 L14 40 Z" fill="#FF8FB5" stroke="#fff" strokeWidth="5" strokeLinejoin="round" />
          <path d="M14 40 l8 6 l8 -6 l8 6 l8 -6 l8 6 l8 -6 l8 6 l8 -6 l8 6 l8 -6 l8 6 l8 -6 l8 6 l8 -6 l8 6 l8 -6 l8 6 l8 -6 l8 6 l8 -6 l8 6 l8 -6 l8 6 l8 -6" fill="#FF8FB5" />
          <text x="110" y="28" textAnchor="middle" fontFamily="var(--font-fredoka), Fredoka, sans-serif" fontWeight={600} fontSize="11" letterSpacing="2" fill="#fff">
            ✂ TEAR HERE ✂
          </text>
        </g>
        <path className="rg-packTear" d="M18 48 H202" stroke="#fff" strokeWidth="2.4" strokeDasharray="5 6" strokeLinecap="round" />
      </svg>
    </span>
  );
}

// ─── Watering can ───────────────────────────────────────────────────────────

export function WateringCan({ size = 120 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.8} viewBox="0 0 150 120" aria-hidden style={{ overflow: "visible", display: "block" }}>
      <defs>
        <linearGradient id="wc-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFB3CC" />
          <stop offset="1" stopColor="#FF7FA8" />
        </linearGradient>
      </defs>
      {/* spout (pointing left, so tilting left pours) */}
      <path d="M44 66 L6 34 L2 40 L36 78 Z" fill="#FF8FB5" stroke="#fff" strokeWidth="3" strokeLinejoin="round" />
      <ellipse cx="5" cy="36" rx="7" ry="9" transform="rotate(-40 5 36)" fill="#FF6F9C" stroke="#fff" strokeWidth="3" />
      {/* handle */}
      <path d="M110 40 C 140 34 146 82 112 92" fill="none" stroke="#FF6F9C" strokeWidth="10" strokeLinecap="round" />
      <path d="M58 26 C 70 6 98 6 108 26" fill="none" stroke="#FF6F9C" strokeWidth="8" strokeLinecap="round" />
      {/* body */}
      <rect x="38" y="28" width="80" height="78" rx="22" fill="url(#wc-body)" stroke="#fff" strokeWidth="4" />
      <path d="M78 76 c-8 -6 -14 -10 -14 -16 a7 7 0 0 1 14 -3 a7 7 0 0 1 14 3 c0 6 -6 10 -14 16 Z" fill="#fff" />
      <ellipse cx="56" cy="44" rx="6" ry="10" fill="rgba(255,255,255,.5)" />
    </svg>
  );
}

// ─── Singing rose ───────────────────────────────────────────────────────────

export function SingingRose({ color, singing, size = 200 }: { color: string; singing: boolean; size?: number }) {
  const sh = shadesFor(color);
  return (
    <svg className={`rg-singer${singing ? " is-singing" : ""}`} width={size} height={size * 1.25} viewBox="-90 -130 180 225" aria-hidden style={{ overflow: "visible", display: "block" }}>
      <GradDefs grads={roseGrads("sing", sh)} />
      <path d="M0 0 C -6 30 6 60 0 92" stroke={LEAF.stem} strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M0 50 C 14 34 38 34 48 44 C 34 56 14 58 0 50 Z" fill={LEAF.mid} />
      <path d="M0 64 C -14 50 -36 52 -44 62 C -30 72 -12 72 0 64 Z" fill={LEAF.mid} />
      <g className="rg-singHead">
        <RoseHead id="sing" open={1} x={0} y={6} s={1.5} />
        {/* face */}
        <g transform="translate(0 -38)">
          <ellipse cx="-14" cy="0" rx="4.2" ry="5.2" fill="#3A1020" />
          <ellipse cx="14" cy="0" rx="4.2" ry="5.2" fill="#3A1020" />
          <circle cx="-12.6" cy="-1.8" r="1.5" fill="#fff" />
          <circle cx="15.4" cy="-1.8" r="1.5" fill="#fff" />
          <ellipse cx="-24" cy="9" rx="6" ry="3.6" fill="#FFB3CC" opacity=".9" />
          <ellipse cx="24" cy="9" rx="6" ry="3.6" fill="#FFB3CC" opacity=".9" />
          <ellipse className="rg-singMouth" cx="0" cy="12" rx="6" ry="5" fill="#5B1020" />
        </g>
      </g>
      {/* tiny mic held by a leaf */}
      <g transform="translate(40 -6) rotate(18)">
        <rect x="-3" y="0" width="6" height="26" rx="3" fill="#8A4A5C" />
        <circle cx="0" cy="-4" r="9" fill="#FFE27A" stroke="#fff" strokeWidth="2.5" />
        <path d="M-6 -6 h12 M-6 -2 h12" stroke="rgba(138,74,92,.45)" strokeWidth="1.4" />
      </g>
    </svg>
  );
}

// ─── Bouquet cone + bow ─────────────────────────────────────────────────────

export function Cone({ tied, color }: { tied: boolean; color: string }) {
  const sh = shadesFor(color);
  return (
    <svg viewBox="0 0 240 230" width="100%" height="100%" aria-hidden style={{ overflow: "visible", display: "block" }}>
      <defs>
        <linearGradient id="cone-k" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#E3C29C" />
          <stop offset=".5" stopColor="#F0D6B6" />
          <stop offset="1" stopColor="#D9B48A" />
        </linearGradient>
      </defs>
      <path d="M8 18 L232 18 L132 222 Q120 230 108 222 Z" fill="url(#cone-k)" stroke="#fff" strokeWidth="5" strokeLinejoin="round" />
      <path d="M8 18 L120 70 L232 18" fill="none" stroke="rgba(150,100,60,.25)" strokeWidth="3" />
      <path d="M60 40 L118 200" stroke="rgba(150,100,60,.14)" strokeWidth="2" />
      <path d="M180 40 L124 200" stroke="rgba(150,100,60,.14)" strokeWidth="2" />
      <g transform="translate(120 132)">
      <g className={`rg-bow${tied ? " is-tied" : ""}`}>
        <path d="M0 0 C -40 -34 -64 -16 -56 4 C -48 24 -18 18 0 0 Z" fill={sh.petal === "#FFF6EE" ? "#FF6F9C" : sh.petal} stroke="#fff" strokeWidth="3" />
        <path d="M0 0 C 40 -34 64 -16 56 4 C 48 24 18 18 0 0 Z" fill={sh.petal === "#FFF6EE" ? "#FF6F9C" : sh.petal} stroke="#fff" strokeWidth="3" />
        <path d="M-4 4 L-26 66 L-12 60 L0 8 Z M4 4 L26 66 L12 60 L0 8 Z" fill={sh.dark === "#EBD9D0" ? "#D63F72" : sh.dark} stroke="#fff" strokeWidth="2" />
        <circle r="10" fill={sh.dark === "#EBD9D0" ? "#D63F72" : sh.dark} stroke="#fff" strokeWidth="3" />
      </g>
      </g>
    </svg>
  );
}

/** A photo as a flower: the photo in a circle, ringed by soft petals in the rose's colour. */
export function PhotoFlower({ photo, color, size, eager }: { photo: LovePhoto; color: string; size: number; eager?: boolean }) {
  const sh = shadesFor(color);
  const petal = sh.petal === "#FFF6EE" ? "#FFD1DF" : sh.light;
  return (
    <span className="rg-pflower" style={{ width: size, height: size }}>
      <svg viewBox="-50 -50 100 100" width={size} height={size} aria-hidden style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {Array.from({ length: 8 }, (_, i) => (
          <ellipse key={i} cx="0" cy="-34" rx="17" ry="19" fill={i % 2 ? petal : sh.petal} stroke="#fff" strokeWidth="2.5" transform={`rotate(${i * 45})`} />
        ))}
      </svg>
      <span className="rg-pflowerPhoto">
        <CroppedPhoto photo={photo} alt="" eager={eager} />
      </span>
    </span>
  );
}

/** A long-stem rose in its own little SVG (the shower uses many inside one SVG instead). */
export function Defs({ id, color }: { id: string; color: string }) {
  return <GradDefs grads={roseGrads(id, shadesFor(color))} />;
}
export { RoseHead, shadesFor, LEAF };
