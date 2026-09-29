"use client";

// ─── Rewind — the "Lovify" look ──────────────────────────────────────────────
//
// A music-streaming app clone (dark #121212 shell, rounded tiles, a green play
// button, a docked player) around a year-in-review story. The app is called
// Lovify and the story is called Rewind — a parody name and our own mark (a
// heart with a play triangle cut out of it). No one else's logo, arcs or
// year-in-review wordmark appears anywhere.

import { Figtree } from "next/font/google";
import type { CSSProperties } from "react";
import { cropStyle, photoCrop } from "../../dedication/components/types";
import { hash32 } from "@/lib/seededRandom";
import type { LovePhoto } from "./types";

export const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-rw",
  display: "swap",
  preload: false,
});

export const FONT = `var(--font-rw), "Figtree", "Helvetica Neue", Helvetica, Arial, system-ui, sans-serif`;

export const C = {
  base: "#121212",
  black: "#000000",
  surface: "#181818",
  elevated: "#1F1F1F",
  highlight: "#2A2A2A",
  press: "#333333",
  text: "#FFFFFF",
  sub: "#B3B3B3",
  mute: "#A7A7A7",
  line: "#292929",
  green: "#1ED760",
  greenDeep: "#1DB954",
  pink: "#FF4FB4",
  lime: "#CDF564",
} as const;

/** The couple aura — two colours per archetype, blurred into each other. */
export const AURA: Record<string, { a: string; b: string; words: [string, string] }> = {
  overthinkers: { a: "#4B6BFF", b: "#B18CFF", words: ["reflective", "wide awake"] },
  feeders: { a: "#FF7A3D", b: "#FFD166", words: ["warm", "well-fed"] },
  competitors: { a: "#18C29C", b: "#CDF564", words: ["fierce", "fond"] },
  slowburn: { a: "#FF4FB4", b: "#FF9E6D", words: ["patient", "devoted"] },
  chaos: { a: "#FFC400", b: "#FF4F4F", words: ["spontaneous", "lucky"] },
  repliers: { a: "#8B5CF6", b: "#22D3EE", words: ["dreamy", "delayed"] },
  homebodies: { a: "#34D399", b: "#FDE68A", words: ["cosy", "content"] },
  documentarians: { a: "#F43F5E", b: "#FDBA74", words: ["nostalgic", "blurry"] },
  translators: { a: "#38BDF8", b: "#A78BFA", words: ["intuitive", "quiet"] },
  loudones: { a: "#EC4899", b: "#F97316", words: ["bold", "obvious"] },
};

/** Cover tints for tiles without a photo — deterministic per title. */
const TINTS = ["#E13300", "#8D67AB", "#1E3264", "#E8115B", "#148A08", "#BA5D07", "#509BF5", "#AF2896", "#27856A", "#503750", "#DC148C", "#0D73EC"];
export const tint = (key: string) => TINTS[hash32(key) % TINTS.length];

export const firstName = (s: string, fb = "you") => (s ?? "").trim().split(/\s+/)[0] || fb;

/** A memory photo, framed exactly as it was cropped in the editor. */
export function Pic({
  photo,
  alt = "",
  label,
  style,
  className,
}: {
  photo?: LovePhoto;
  alt?: string;
  /** Shown on the tinted fallback when there is no photo. */
  label?: string;
  style?: CSSProperties;
  className?: string;
}) {
  if (!photo?.url) {
    const t = tint(label || "rewind");
    return (
      <span
        className={className}
        aria-hidden={!alt}
        style={{
          display: "grid",
          placeItems: "center",
          overflow: "hidden",
          background: `linear-gradient(135deg, ${t}, #121212 140%)`,
          color: "rgba(255,255,255,.9)",
          fontWeight: 900,
          fontSize: "140%",
          ...style,
        }}
      >
        <HeartMark size={28} />
      </span>
    );
  }
  return (
    <span className={className} style={{ display: "block", overflow: "hidden", position: "relative", ...style }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.url} alt={alt} draggable={false} loading="lazy" decoding="async" style={{ ...cropStyle(photoCrop(photo)), display: "block" }} />
    </span>
  );
}

/** Our mark: a heart with a play triangle knocked out of it. */
export function HeartMark({ size = 24, color = "currentColor", cut = "#000" }: { size?: number; color?: string; cut?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden focusable="false">
      <path d="M12 21.2c-.3 0-.6-.1-.8-.3C5.6 16.2 2 13 2 8.9 2 5.9 4.3 3.6 7.2 3.6c1.9 0 3.6 1 4.8 2.5 1.2-1.5 2.9-2.5 4.8-2.5 2.9 0 5.2 2.3 5.2 5.3 0 4.1-3.6 7.3-9.2 12-.2.2-.5.3-.8.3z" fill={color} />
      <path d="M10.2 8.6v6.2l5-3.1z" fill={cut} />
    </svg>
  );
}

export function Logo({ size = 28, word = true, color = "#fff" }: { size?: number; word?: boolean; color?: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: size * 0.28, color }}>
      <span style={{ width: size, height: size, borderRadius: "50%", background: C.green, display: "grid", placeItems: "center", flex: "none" }}>
        <HeartMark size={size * 0.64} color="#000" cut={C.green} />
      </span>
      {word && <b style={{ fontFamily: FONT, fontWeight: 800, fontSize: size * 0.78, letterSpacing: "-0.03em" }}>Lovify</b>}
    </span>
  );
}
