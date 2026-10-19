"use client";
// ─── Wedding ornaments, textures and particles (the asset pack) ──────────────
//
// Source: media-src/templates/wedding (manifest.json) → CDN
// https://cdn.subhsandesh.in/gifts-media/templates/wedding/.
//
// HOW AN ORNAMENT IS DRAWN
// The single-colour ("ink") SVGs only recolour when inlined, and the CDN sends
// no CORS header, so a CSS mask over a CDN file would fail. The ink files are
// therefore ALSO served same-origin from /public/wedding/ornaments/<id>.svg and
// drawn as a CSS mask: the element's background shows through the ornament's
// shape. That makes every ornament re-theme for free:
//   tone="foil"  → background: var(--wk-foil)  (the theme's own foil, rose-gold
//                  on Blush), optionally shimmering
//   tone="ink"   → background: currentColor
//   tone="baked" → <img> of the CDN's svg/foil/<id>.svg (fixed champagne gold;
//                  no mask, works anywhere incl. emails / OG)
// Two-tone pieces (gate doors, envelope) need --w-door / --w-paper and must be
// INLINED by the tier that animates them (fetch the same-origin file).

import type { CSSProperties } from "react";

export const WEDDING_CDN = "https://cdn.subhsandesh.in/gifts-media/templates/wedding/";
export const ORNAMENT_LOCAL = "/wedding/ornaments/";

export const ORNAMENTS = {
  "mandala-simple": { category: "mandala", aspect: 1 },
  "mandala-medium": { category: "mandala", aspect: 1 },
  "mandala-ornate": { category: "mandala", aspect: 1 },
  "jharokha-arch": { category: "frame", aspect: 0.75 },
  "jharokha-palace": { category: "frame", aspect: 0.75 },
  "gate-door-left": { category: "gate", aspect: 0.375 },
  "gate-door-right": { category: "gate", aspect: 0.375 },
  "corner-filigree": { category: "corner", aspect: 1 },
  "corner-mughal": { category: "corner", aspect: 1 },
  "corner-floral": { category: "corner", aspect: 1 },
  "corner-deco": { category: "corner", aspect: 1 },
  "divider-lotus": { category: "divider", aspect: 10 },
  "divider-scroll": { category: "divider", aspect: 10 },
  "divider-dots": { category: "divider", aspect: 10 },
  "divider-paisley": { category: "divider", aspect: 10 },
  "divider-mandala": { category: "divider", aspect: 10 },
  paisley: { category: "motif", aspect: 0.8333 },
  lotus: { category: "motif", aspect: 1.3636 },
  kalash: { category: "motif", aspect: 0.8 },
  "toran-strip": { category: "garland", aspect: 1.7143 },
  diya: { category: "motif", aspect: 0.9091 },
  "elephant-pair": { category: "motif", aspect: 2.3077 },
  peacock: { category: "motif", aspect: 1.1111 },
  ganesha: { category: "motif", aspect: 0.8333 },
  "monogram-crest": { category: "crest", aspect: 0.9524 },
  "monogram-frame": { category: "crest", aspect: 1 },
  "wax-seal": { category: "seal", aspect: 1 },
  "envelope-back": { category: "envelope", aspect: 1.5 },
  "envelope-flap": { category: "envelope", aspect: 2.3077 },
  "envelope-front": { category: "envelope", aspect: 1.5 },
  "floral-border": { category: "floral", aspect: 4 },
  "floral-corner": { category: "floral", aspect: 1 },
  rings: { category: "motif", aspect: 1.3636 },
  "damask-tile": { category: "pattern", aspect: 0.7143 },
  marigold: { category: "motif", aspect: 1 },
} as const;

export type OrnamentId = keyof typeof ORNAMENTS;
export const isOrnamentId = (v: unknown): v is OrnamentId => typeof v === "string" && Object.prototype.hasOwnProperty.call(ORNAMENTS, v);

export const DIVIDER_IDS = ["divider-lotus", "divider-scroll", "divider-dots", "divider-paisley", "divider-mandala"] as const satisfies readonly OrnamentId[];
export type DividerId = (typeof DIVIDER_IDS)[number];
export const CORNER_IDS = ["corner-filigree", "corner-mughal", "corner-floral", "corner-deco", "floral-corner"] as const satisfies readonly OrnamentId[];
export type CornerId = (typeof CORNER_IDS)[number];

export const PARTICLES = {
  "marigold-petal": "particles/marigold-petal.webp",
  "rose-petal": "particles/rose-petal.webp",
  "rose-petal-blush": "particles/rose-petal-blush.webp",
  "gold-confetti": "particles/gold-confetti.webp",
  "gold-confetti-round": "particles/gold-confetti-round.webp",
  "gold-sparkle": "particles/gold-sparkle.webp",
  sparkle: "particles/sparkle.svg",
} as const;
export type ParticleId = keyof typeof PARTICLES;

export const TEXTURES = {
  "paper-silk-light": "textures/paper-silk-light.webp",
  "paper-silk-dark": "textures/paper-silk-dark.webp",
  "linen-overlay": "textures/linen-overlay.webp",
  "watercolour-wash-light": "textures/watercolour-wash-light.webp",
  "watercolour-wash-dark": "textures/watercolour-wash-dark.webp",
  "foil-noise": "textures/foil-noise.webp",
  "damask-light": "textures/damask-light.webp",
  "damask-dark": "textures/damask-dark.webp",
  "sky-dusk": "textures/sky-dusk.webp",
  "stars-tile": "textures/stars-tile.webp",
} as const;
export type TextureId = keyof typeof TEXTURES;

export const ornamentUrl = (id: OrnamentId) => `${ORNAMENT_LOCAL}${id}.svg`;
export const ornamentFoilUrl = (id: OrnamentId) => `${WEDDING_CDN}svg/foil/${id}.svg`;
export const particleUrl = (id: ParticleId) => `${WEDDING_CDN}${PARTICLES[id]}`;
export const textureUrl = (id: TextureId) => `${WEDDING_CDN}${TEXTURES[id]}`;

export type OrnamentTone = "foil" | "ink" | "baked";

export interface OrnamentProps {
  id: OrnamentId;
  /** Rendered width (any CSS length). Height follows the ornament's aspect unless `height` is given. */
  width?: number | string;
  height?: number | string;
  /** Default "foil". */
  tone?: OrnamentTone;
  /** Animated light sweep across the foil (tone="foil"; off with reduced motion). */
  shimmer?: boolean;
  /** Mirror: "x" (top-right corner from a top-left one), "y", or "xy". */
  flip?: "x" | "y" | "xy";
  className?: string;
  style?: CSSProperties;
  /** Decorative by default; pass a label to expose it. */
  label?: string;
}

/** One ornament, themed by the surrounding --wk-* tokens (see the header note). */
export function Ornament({ id, width = "100%", height, tone = "foil", shimmer = false, flip, className, style, label }: OrnamentProps) {
  const meta = ORNAMENTS[id];
  const transform = flip === "x" ? "scaleX(-1)" : flip === "y" ? "scaleY(-1)" : flip === "xy" ? "scale(-1,-1)" : undefined;
  const box: CSSProperties = {
    width,
    ...(height !== undefined ? { height } : { aspectRatio: String(meta.aspect) }),
    ...(transform ? { transform } : {}),
    ...style,
  };
  const a11y = label ? { role: "img" as const, "aria-label": label } : { "aria-hidden": true as const };
  if (tone === "baked") {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- static CDN SVG
      <img src={ornamentFoilUrl(id)} alt={label ?? ""} className={`wk-orn ${className ?? ""}`} style={{ ...box, objectFit: "contain", display: "block" }} draggable={false} {...(label ? {} : { "aria-hidden": true })} />
    );
  }
  const url = `url("${ornamentUrl(id)}")`;
  return (
    <span
      {...a11y}
      className={`wk-orn wk-orn-${tone}${shimmer && tone === "foil" ? " wk-shimmer" : ""} ${className ?? ""}`}
      style={{ ...box, WebkitMaskImage: url, maskImage: url }}
    />
  );
}

export interface DividerProps {
  /** Default "divider-lotus". */
  ornament?: DividerId | OrnamentId;
  /** Max width of the ornament, px. Default 320. */
  width?: number;
  tone?: OrnamentTone;
  shimmer?: boolean;
  /** Vertical breathing room, px. Default 28. */
  space?: number;
  className?: string;
}

/** A centred section divider. */
export function Divider({ ornament = "divider-lotus", width = 320, tone = "foil", shimmer = true, space = 28, className }: DividerProps) {
  return (
    <div className={`wk-divider ${className ?? ""}`} style={{ paddingBlock: space }} aria-hidden>
      <Ornament id={ornament} width={`min(${width}px, 86%)`} tone={tone} shimmer={shimmer} />
    </div>
  );
}

export interface CornersProps {
  /** Default "corner-filigree". */
  ornament?: CornerId | OrnamentId;
  /** Corner size, px or CSS length. Default "clamp(56px, 16vw, 110px)". */
  size?: number | string;
  inset?: number;
  tone?: OrnamentTone;
}

/** Four mirrored corners. Put inside a `position: relative` card (WeddingCard does). */
export function Corners({ ornament = "corner-filigree", size = "clamp(56px, 16vw, 110px)", inset = 8, tone = "foil" }: CornersProps) {
  const pos: [CSSProperties, OrnamentProps["flip"]][] = [
    [{ top: inset, left: inset }, undefined],
    [{ top: inset, right: inset }, "x"],
    [{ bottom: inset, left: inset }, "y"],
    [{ bottom: inset, right: inset }, "xy"],
  ];
  return (
    <>
      {pos.map(([p, f], i) => (
        <Ornament key={i} id={ornament} width={size} tone={tone} flip={f} className="wk-corner" style={{ position: "absolute", ...p }} />
      ))}
    </>
  );
}
