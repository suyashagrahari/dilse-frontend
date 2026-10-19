// The Digital Bouquet art pack (watercolour-botanical, one family), bundled
// from media-src/templates/digital-bouquet/manifest.json — the CDN copy is
// cached immutable, so the numbers live here rather than being fetched.
//
// Everything is drawn in the pack's 600×760 bouquet frame: the wraps are
// full-frame images (back + front), every stem converges on (300, 730), the
// ribbon's knot sits at (300, 598). A stem image is 512px tall at 1×; its
// `anchor` is the stem's base and `head` the bloom's centre, both as fractions
// of the image box. Licence: original code-drawn art (see ATTRIBUTION.md).

import { templateMedia } from "@/lib/templateMedia";
import type { DbCharm, DbGreenery, DbRibbon, DbWrap, FlowerId } from "../../../_valentine/days/digital-bouquet";

export const FRAME = { w: 600, h: 760, tie: { x: 300, y: 730 }, knot: { x: 300, y: 598 }, charm: { x: 322, y: 604 } } as const;
/** Stored stem units (0–1000 on both axes) → frame pixels. */
export const UNIT = 0.6;

export const media = (file: string) => templateMedia("digital-bouquet", file);

export interface StemArt {
  /** File stem under the CDN folder ("flowers/red-rose"). */
  file: string;
  w: number;
  h: number;
  anchor: { x: number; y: number };
  head: { x: number; y: number };
  /** The pack's natural size in the frame. */
  scale: number;
}

const F = (file: string, w: number, ax: number, hx: number, hy: number): StemArt => ({ file, w, h: 512, anchor: { x: ax, y: 0.9875 }, head: { x: hx, y: hy }, scale: 1.12 });

export const STEM_ART: Record<FlowerId, StemArt> = {
  "rose-red": F("flowers/red-rose", 108, 0.4935, 0.4935, 0.2188),
  "rose-pink": F("flowers/pink-rose", 107, 0.5093, 0.5093, 0.2188),
  "rose-white": F("flowers/white-rose", 107, 0.5, 0.5, 0.2188),
  tulip: F("flowers/tulip", 122, 0.5065, 0.5065, 0.2344),
  sunflower: F("flowers/sunflower", 119, 0.5059, 0.5059, 0.2281),
  peony: F("flowers/peony", 136, 0.5074, 0.5074, 0.2281),
  lily: F("flowers/lily", 120, 0.49, 0.49, 0.2344),
  daisy: F("flowers/daisy", 99, 0.4474, 0.4474, 0.2188),
  lavender: F("flowers/lavender", 69, 0.487, 0.487, 0.2344),
  carnation: F("flowers/carnation", 130, 0.4954, 0.4954, 0.25),
  orchid: F("flowers/orchid", 111, 0.4022, 0.474, 0.2813),
  "babys-breath": { file: "greens/babys-breath", w: 178, h: 512, anchor: { x: 0.5259, y: 0.9875 }, head: { x: 0.5259, y: 0.3125 }, scale: 1 },
  "cherry-blossom": F("flowers/cherry-blossom", 118, 0.4237, 0.4915, 0.2344),
  lotus: F("flowers/lotus", 131, 0.4947, 0.4947, 0.25),
  marigold: F("flowers/marigold", 130, 0.5093, 0.5093, 0.2219),
  hydrangea: F("flowers/hydrangea", 139, 0.5, 0.5, 0.2344),
};

export type GreenId = "eucalyptus" | "fern" | "leaf-sprig" | "ruscus";
const G = (file: string, w: number, ax: number): StemArt => ({ file, w, h: 512, anchor: { x: ax, y: 0.9875 }, head: { x: ax, y: 0.3125 }, scale: 1 });
export const GREEN_ART: Record<GreenId, StemArt> = {
  eucalyptus: G("greens/eucalyptus", 64, 0.595),
  fern: G("greens/fern", 114, 0.4528),
  "leaf-sprig": G("greens/leaf-sprig", 77, 0.4341),
  ruscus: G("greens/ruscus", 67, 0.5179),
};

/** Greenery heads in frame pixels (from the pack's own worked arrangement), behind the flowers. */
export function greensFor(g: DbGreenery): { id: GreenId; x: number; y: number; scale: number }[] {
  const pairs = (id: GreenId, pts: [number, number][], scale = 1) => pts.map(([x, y]) => ({ id, x, y, scale }));
  switch (g) {
    case "none":
      return [];
    case "eucalyptus":
      return pairs("eucalyptus", [[118, 190], [486, 196], [190, 132], [416, 136], [70, 300], [536, 300]], 1.05);
    case "fern":
      return pairs("fern", [[196, 120], [418, 126], [104, 230], [500, 236]]);
    case "leafy":
      return [...pairs("leaf-sprig", [[150, 150], [452, 156]]), ...pairs("ruscus", [[80, 280], [526, 284], [300, 96]])];
    case "mixed":
    default:
      return [...pairs("eucalyptus", [[118, 190], [486, 196]], 1.05), ...pairs("fern", [[196, 120], [418, 126]]), ...pairs("ruscus", [[80, 280], [526, 284]])];
  }
}

export const WRAP_FILE: Record<DbWrap, string> = { tissue: "wraps/pink-tissue", kraft: "wraps/kraft", newspaper: "wraps/newspaper", pearl: "wraps/pearl" };

/** The pack has four ribbon colours; older/other values map onto the nearest. */
export const RIBBON_FILE: Record<DbRibbon, { file: string; filter?: string }> = {
  rose: { file: "ribbons/red" },
  red: { file: "ribbons/red" },
  blush: { file: "ribbons/blush" },
  gold: { file: "ribbons/gold" },
  lilac: { file: "ribbons/lavender" },
  sage: { file: "ribbons/gold", filter: "hue-rotate(55deg) saturate(.7)" },
  ivory: { file: "ribbons/gold", filter: "saturate(.15) brightness(1.18)" },
};
export const RIBBON_ART = { w: 220, h: 202, anchor: { x: 0.5, y: 0.244 } } as const;

export const CHARM_ART: Record<DbCharm | "envelope", { file: string; w: number; h: number; scale: number }> = {
  heart: { file: "charms/heart-tag", w: 138, h: 180, scale: 0.62 },
  teddy: { file: "charms/teddy", w: 104, h: 180, scale: 0.62 },
  butterfly: { file: "charms/butterfly", w: 170, h: 180, scale: 0.62 },
  envelope: { file: "charms/envelope", w: 166, h: 180, scale: 0.62 },
};

export const PETAL_FILES = ["petals/pink", "petals/red", "petals/white", "petals/cherry", "petals/peach"] as const;

/** 1× and 2× sources of a pack file stem. */
export const src1 = (file: string) => media(`${file}.webp`);
export const srcSet = (file: string) => `${media(`${file}.webp`)} 1x, ${media(`${file}@2x.webp`)} 2x`;

/**
 * Where a stem image goes so its bloom lands on (hx, hy) (frame px) leaning
 * from the tie point, plus a tilt of its own. Returns the image box (frame px)
 * and the rotation about its anchor.
 */
export function placeStem(art: StemArt, hx: number, hy: number, scale: number, tilt = 0) {
  const w = art.w * art.scale * scale;
  const h = art.h * art.scale * scale;
  const lean = Math.atan2(hx - FRAME.tie.x, FRAME.tie.y - hy);
  // A stem's own tilt is kept gentle (a quarter of it): any more and its base swings out of the cone.
  const phi = lean + (tilt * 0.25 * Math.PI) / 180;
  const dx = (art.head.x - art.anchor.x) * w;
  const L = (art.anchor.y - art.head.y) * h;
  const ax = hx - (L * Math.sin(phi) + dx * Math.cos(phi));
  const ay = hy - (-L * Math.cos(phi) + dx * Math.sin(phi));
  return { left: ax - art.anchor.x * w, top: ay - art.anchor.y * h, w, h, deg: (phi * 180) / Math.PI, ax, ay };
}

/** A stored stem's bloom in frame pixels. */
export const headOf = (s: { x: number; y: number }) => ({ x: s.x * UNIT, y: s.y * UNIT });
/** Frame pixels → % of the bouquet box. */
export const pctX = (px: number) => `${(px / FRAME.w) * 100}%`;
export const pctY = (px: number) => `${(px / FRAME.h) * 100}%`;
/** The tap circle's diameter (frame px) for a stem. */
export const hitSize = (art: StemArt, scale: number) => Math.max(64, art.w * art.scale * scale * 1.05);
