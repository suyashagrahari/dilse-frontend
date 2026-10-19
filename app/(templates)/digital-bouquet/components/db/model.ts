// The bouquet's data helpers: read the (untrusted) extras into a clean shape,
// and the studio's arranging maths (free spots, snap into the dome, shuffle,
// "fill for me").

import {
  BLOOM_AREA,
  DB_CHARM_KEYS,
  DB_GREENERY_KEYS,
  DB_HANDS,
  DB_PALETTES,
  DB_RIBBON_KEYS,
  DB_BOW_KEYS,
  DB_TONES,
  DB_WRAP_KEYS,
  FLOWER_BY_ID,
  STEM_LIMITS,
  isFlowerId,
  type DbBow,
  type DbCharm,
  type DbExtras,
  type DbFlowerNote,
  type DbGreenery,
  type DbHand,
  type DbPalette,
  type DbRibbon,
  type DbStem,
  type DbTone,
  type DbWrap,
  type FlowerId,
} from "../../../_valentine/days/digital-bouquet";

export const clean = (v: unknown): string => (typeof v === "string" ? v.trim() : "");
const num = (v: unknown, lo: number, hi: number, fb: number) => {
  const n = typeof v === "number" && Number.isFinite(v) ? v : fb;
  return Math.min(hi, Math.max(lo, Math.round(n)));
};
const pick = <T extends string>(v: unknown, keys: readonly T[], fb: T): T => (typeof v === "string" && (keys as readonly string[]).includes(v) ? (v as T) : fb);

export interface Bq {
  palette: DbPalette;
  tone: DbTone;
  stems: DbStem[];
  greenery: DbGreenery;
  wrap: DbWrap;
  ribbon: DbRibbon;
  bow: DbBow;
  charms: DbCharm[];
  giftTag: string;
  deliveryLine: string;
  notes: Partial<Record<FlowerId, string>>;
  hand: DbHand;
  question: string;
  yesLine: string;
}

export function readStems(raw: unknown): DbStem[] {
  return (Array.isArray(raw) ? raw : [])
    .filter((s): s is Record<string, unknown> => !!s && typeof s === "object" && isFlowerId((s as Record<string, unknown>).flower))
    .slice(0, STEM_LIMITS.max)
    .map((s) => ({
      flower: s.flower as FlowerId,
      x: num(s.x, 0, 1000, 500),
      y: num(s.y, 0, 1000, 400),
      rot: num(s.rot, -60, 60, 0),
      scale: num(s.scale, 60, 150, 100),
      z: num(s.z, 0, 99, 0),
    }));
}

export function readNotes(raw: unknown): Partial<Record<FlowerId, string>> {
  const out: Partial<Record<FlowerId, string>> = {};
  for (const n of Array.isArray(raw) ? raw : []) {
    if (n && typeof n === "object" && isFlowerId((n as DbFlowerNote).flower)) {
      // Kept as typed (the studio's input reads it back); readers trim when they show it.
      const t = typeof (n as DbFlowerNote).note === "string" ? (n as DbFlowerNote).note.slice(0, 80) : "";
      if (t.trim()) out[(n as DbFlowerNote).flower] = t;
    }
  }
  return out;
}

export function notesToList(notes: Partial<Record<FlowerId, string>>): DbFlowerNote[] {
  return (Object.keys(notes) as FlowerId[]).filter((k) => notes[k]).map((flower) => ({ flower, note: notes[flower] ?? "" }));
}

export function readBouquet(x: Partial<DbExtras> | Record<string, unknown>): Bq {
  const e = x as Record<string, unknown>;
  const tone = pick(e.tone, Object.keys(DB_TONES) as DbTone[], "romantic");
  return {
    palette: pick(e.palette, Object.keys(DB_PALETTES) as DbPalette[], "blushGarden"),
    tone,
    stems: readStems(e.stems),
    greenery: pick(e.greenery, DB_GREENERY_KEYS, "mixed"),
    wrap: pick(e.wrap, DB_WRAP_KEYS, "tissue"),
    ribbon: pick(e.ribbon, DB_RIBBON_KEYS, "rose"),
    bow: pick(e.bow, DB_BOW_KEYS, "bow"),
    charms: [...new Set((Array.isArray(e.charms) ? e.charms : []).filter((c): c is DbCharm => typeof c === "string" && (DB_CHARM_KEYS as readonly string[]).includes(c)))],
    giftTag: clean(e.giftTag),
    deliveryLine: clean(e.deliveryLine),
    notes: readNotes(e.flowerNotes),
    hand: pick(e.cardHand, Object.keys(DB_HANDS) as DbHand[], "hand"),
    question: clean(e.question),
    yesLine: clean(e.yesLine),
  };
}

/** Back to front: lower z first, then the order they were added. */
export function paintOrder(stems: readonly DbStem[]): number[] {
  return stems.map((_, i) => i).sort((a, b) => stems[a].z - stems[b].z || a - b);
}

// ─── Arranging ───────────────────────────────────────────────────────────────

/** Fifteen good spots in a natural dome (stored units), most important first. */
const SLOTS: readonly [number, number, number][] = [
  [507, 437, 0],
  [420, 567, 0],
  [587, 560, 0],
  [500, 640, 0],
  [370, 397, 0],
  [660, 393, 0],
  [500, 283, 0],
  [250, 393, 0],
  [770, 357, 0],
  [823, 527, 0],
  [187, 540, 0],
  [707, 583, 0],
  [393, 197, 0],
  [630, 187, 0],
  [500, 187, 0],
];

/** Keep a bloom inside the dome over the wrap's mouth. */
export function snapToArea(x: number, y: number): { x: number; y: number } {
  const { cx, cy, rx, ry } = BLOOM_AREA;
  const dx = (x - cx) / rx;
  const dy = (y - cy) / ry;
  const d = Math.hypot(dx, dy);
  if (d <= 1) return { x: Math.round(x), y: Math.round(y) };
  return { x: Math.round(cx + (dx / d) * rx), y: Math.round(cy + (dy / d) * ry) };
}


/** Layer from height: lower blooms sit in front. */
export const zFor = (y: number) => Math.round(y / 12);

/** The first slot no bloom is near (else a spot near the middle). */
export function freeSpot(stems: readonly DbStem[]): { x: number; y: number; rot: number } {
  for (const [x, y, rot] of SLOTS) {
    if (stems.every((s) => Math.hypot(s.x - x, s.y - y) > 105)) return { x, y, rot };
  }
  const k = stems.length;
  const a = (k * 137.5 * Math.PI) / 180;
  const p = snapToArea(500 + Math.cos(a) * 240, 400 + Math.sin(a) * 200);
  return { ...p, rot: 0 };
}

export function newStem(flower: FlowerId, stems: readonly DbStem[], at?: { x: number; y: number }): DbStem {
  const spot = at ? { ...snapToArea(at.x, at.y), rot: 0 } : freeSpot(stems);
  // No extra tilt: every stem already leans out from the tie point.
  const rot = at ? 0 : spot.rot;
  const top = stems.reduce((m, s) => Math.max(m, s.z), 0);
  return { flower, x: spot.x, y: spot.y, rot, scale: FLOWER_BY_ID[flower].size, z: Math.min(99, Math.max(zFor(spot.y), at ? top + 1 : 0)) };
}

/** Big, round blooms take the centre; spikes and fillers go to the edges and the back. */
const prominence = (f: FlowerId) => {
  const d = FLOWER_BY_ID[f];
  return d.size + (d.shape === "spike" || d.shape === "cluster" ? -40 : 0);
};

/** Re-lay every stem into the dome. `jitter` makes each shuffle a little different. */
export function arrange(stems: readonly DbStem[], jitter = 0, seed = 1): DbStem[] {
  let r = seed;
  const rnd = () => {
    r = (r * 16807) % 2147483647;
    return (r / 2147483647) * 2 - 1;
  };
  const order = stems.map((_, i) => i);
  if (jitter) order.sort(() => rnd());
  order.sort((a, b) => prominence(stems[b].flower) - prominence(stems[a].flower) + (jitter ? rnd() * 30 : 0));
  const out = stems.map((s) => ({ ...s }));
  order.forEach((idx, k) => {
    const [sx, sy, srot] = SLOTS[k % SLOTS.length];
    const p = snapToArea(sx + rnd() * jitter, sy + rnd() * jitter);
    out[idx] = { ...out[idx], x: p.x, y: p.y, rot: Math.max(-60, Math.min(60, Math.round(srot + rnd() * (jitter ? 8 : 0)))), z: zFor(p.y), scale: FLOWER_BY_ID[out[idx].flower].size };
  });
  return out;
}

/** "Fill for me": a mix that matches the tone, topped up to nine stems, then arranged. */
const MIXES: Record<DbTone, FlowerId[]> = {
  romantic: ["rose-red", "peony", "rose-red", "rose-pink", "rose-white", "babys-breath", "rose-red", "babys-breath", "lavender", "tulip"],
  sweet: ["peony", "tulip", "daisy", "rose-pink", "cherry-blossom", "babys-breath", "tulip", "hydrangea", "daisy", "lavender"],
  playful: ["sunflower", "daisy", "tulip", "marigold", "rose-pink", "daisy", "babys-breath", "carnation", "lavender", "orchid"],
};
export function fillForMe(tone: DbTone, stems: readonly DbStem[], target = 9): DbStem[] {
  const out = [...stems];
  const mix = MIXES[tone];
  let k = 0;
  while (out.length < Math.max(target, STEM_LIMITS.min) && out.length < STEM_LIMITS.max) {
    out.push(newStem(mix[k % mix.length], out));
    k += 1;
  }
  return arrange(out, 18, out.length * 31 + 7);
}

/** Distinct flower kinds in the bouquet, in the order they first appear. */
export function kindsOf(stems: readonly DbStem[]): FlowerId[] {
  return [...new Set(stems.map((s) => s.flower))];
}
