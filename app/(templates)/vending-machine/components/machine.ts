// ─── Machine geometry and palette ────────────────────────────────────────────
//
// The whole unit is authored at ONE fixed pixel width and scaled to fit. Nothing
// reflows; a 380px phone and a 1440px desktop see the identical object at
// different sizes. Every number below is in authored (unscaled) pixels.

import { seededSpread, seededUnit } from "@/lib/seededRandom";

/** Authored width of the whole unit. Everything else is derived from it. */
export const MACHINE_W = 392;

export const BODY_PAD = 9;
/** The narrow service rail down the right-hand side: mute, shake, serial. */
export const RAIL_W = 30;
export const RAIL_GAP = 6;
/** Glass frame border thickness. */
export const FRAME = 4;
export const WINDOW_PAD = 7;

export const ROW_COUNT = 3;
export const COL_COUNT = 6;

/** The main face of the machine, left of the service rail. */
export const MAIN_W = MACHINE_W - BODY_PAD * 2 - RAIL_W - RAIL_GAP;

/** Inside the glass, inside the frame. */
export const WINDOW_INNER_W = MAIN_W - FRAME * 2 - WINDOW_PAD * 2;
export const SLOT_W = WINDOW_INNER_W / COL_COUNT;

export const ITEM_W = 30;
export const ITEM_H = 34;
export const ITEM_X = 2;
export const COIL_H = 18;
/** Cell = item band + coil band + the shelf lip. */
export const SLOT_H = 56;
export const EDGE_H = 13;
export const ROW_H = SLOT_H + EDGE_H;
export const WINDOW_H = ROW_H * ROW_COUNT + WINDOW_PAD * 2;

/**
 * Forward travel along the coil: 70% of the free depth of the slot, which lands
 * the item flush against the shelf lip with nowhere left to go. Identical for
 * every column, so column 6 behaves exactly like column 1.
 */
export const TRAVEL = Math.round((SLOT_W - ITEM_W - ITEM_X * 2) * 0.7 * 10) / 10;

export const DISPLAY_H = 30;
export const DISPLAY_INNER_W = MAIN_W - 2;
export const DISPLAY_INNER_H = 24;

export const KEY_H = 52;
export const KEY_GAP = 6;

export const TRAY_H = 88;

/** Authored width of the printed coupon. Fixed; the PNG is captured at it. */
export const COUPON_W = 336;

/** Never let the keypad shrink below the tap-target floor. */
export const MIN_TAP_PX = 44;
export const MIN_SCALE = MIN_TAP_PX / KEY_H; // 0.846…
export const MAX_SCALE = 1.35;

// ─── Palette ─────────────────────────────────────────────────────────────────
// Body colour, amber display, green credit, one red. Nothing else.

export const C = {
  body: "#2d5c5c",
  bodyDark: "#1d4144",
  bodyDarker: "#132e31",
  bodyLight: "#3d7370",
  edge: "#0d1f21",
  ink: "#d9e6e3",
  inkDim: "#8fa8a5",
  glass: "#08191b",
  shelf: "#16292b",
  amber: "#ffa500",
  amberDim: "rgba(255,165,0,0.09)",
  green: "#3dff8b",
  greenDim: "rgba(61,255,139,0.10)",
  red: "#c0392b",
  paper: "#faf7ee",
  paperInk: "#22201b",
} as const;

export const OSWALD = "var(--font-oswald), 'Oswald', 'Arial Narrow', sans-serif";
export const MONO = "var(--font-courier-prime), 'Courier New', monospace";
export const SERIF = "var(--font-tinos), 'Times New Roman', serif";

// ─── Seeded surface wear ─────────────────────────────────────────────────────

export interface Scuff {
  left: number;
  top: number;
  w: number;
  h: number;
  rot: number;
  radius: string;
  opacity: number;
}

/** 3–4 faint irregular lighter shapes. Seeded, so the wear never moves. */
export function scuffsFor(seed: string, count: number, boxW: number, boxH: number): Scuff[] {
  return Array.from({ length: count }, (_, i) => {
    const k = `scuff${i}`;
    return {
      left: Math.round(seededUnit(seed, `${k}x`) * (boxW - 40)),
      top: Math.round(seededUnit(seed, `${k}y`) * (boxH - 26)),
      w: 18 + Math.round(seededUnit(seed, `${k}w`) * 46),
      h: 3 + Math.round(seededUnit(seed, `${k}h`) * 12),
      rot: seededSpread(seed, `${k}r`, 34),
      radius: `${40 + Math.round(seededUnit(seed, `${k}r1`) * 50)}% ${
        30 + Math.round(seededUnit(seed, `${k}r2`) * 60)
      }% ${45 + Math.round(seededUnit(seed, `${k}r3`) * 45)}% ${
        35 + Math.round(seededUnit(seed, `${k}r4`) * 55)
      }% / 50%`,
      opacity: 0.035 + seededUnit(seed, `${k}o`) * 0.05,
    };
  });
}

/**
 * Position of an element relative to an ancestor in AUTHORED pixels. Deliberately
 * not getBoundingClientRect: the machine sits under a transform: scale() and
 * client rects come back scaled, which would poison every fall distance.
 */
export function offsetWithin(el: HTMLElement, ancestor: HTMLElement): { x: number; y: number } {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== ancestor) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { x, y };
}

/** Two keys on any real keypad are worn lighter than the rest. */
export const WORN_KEYS = new Set(["1", "ENTER"]);
