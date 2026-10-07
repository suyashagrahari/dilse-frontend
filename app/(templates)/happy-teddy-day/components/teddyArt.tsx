"use client";

// ─── Teddy Day — hand-drawn SVG art ──────────────────────────────────────────
//
// The teddy (5 furs × poses × moods × 8 accessories, one 200×230 coordinate
// space), the wardrobe icons, the plushie pile inside the claw machine and the
// page's keyframes. The teddy never uses CSS variables, so the same <svg> can
// be serialised into the adoption-certificate PNG.

import { forwardRef, useId, type CSSProperties, type ReactNode } from "react";

export const T = {
  night: "#2D2440",
  night2: "#44365F",
  lilac: "#CDB4DB",
  pink: "#FFC8DD",
  bubblegum: "#FF8FB8",
  hot: "#FF6FA3",
  mint: "#A8E6CF",
  cyan: "#7FE3FF",
  butter: "#FFF1B5",
  cream: "#FFF8F0",
  cocoa: "#6B4226",
  ink: "#4A3326",
};

export type Fur = "honey" | "cocoa" | "pink" | "white" | "lilac";
export const FURS: Record<Fur, { base: string; dark: string; light: string; inner: string; label: string }> = {
  honey: { base: "#E8B07A", dark: "#C98A55", light: "#F8D9B0", inner: "#F6B9B0", label: "honey" },
  cocoa: { base: "#9A6646", dark: "#74482F", light: "#C99B78", inner: "#E6A3A0", label: "cocoa" },
  pink: { base: "#FFC1D8", dark: "#EE97B8", light: "#FFE4EE", inner: "#FF9EC0", label: "pink" },
  white: { base: "#FFF8F0", dark: "#E4D6C8", light: "#FFFFFF", inner: "#FFC8D6", label: "snow-white" },
  lilac: { base: "#CDB4DB", dark: "#A98DBE", light: "#EADCF2", inner: "#F4B6D2", label: "lilac" },
};
export const furOf = (f: unknown): Fur => (typeof f === "string" && f in FURS ? (f as Fur) : "honey");

export type ItemId = "bow" | "sweater" | "crown" | "glasses" | "scarf" | "flower" | "cap" | "bowtie";
export const ITEMS: { id: ItemId; label: string; slot: "head" | "earL" | "earR" | "eyes" | "neck" | "body" }[] = [
  { id: "crown", label: "Crown", slot: "head" },
  { id: "cap", label: "Cap", slot: "head" },
  { id: "bow", label: "Bow", slot: "earL" },
  { id: "flower", label: "Flower", slot: "earR" },
  { id: "glasses", label: "Glasses", slot: "eyes" },
  { id: "scarf", label: "Scarf", slot: "neck" },
  { id: "bowtie", label: "Bow tie", slot: "neck" },
  { id: "sweater", label: "Heart sweater", slot: "body" },
];
export const isItem = (v: unknown): v is ItemId => typeof v === "string" && ITEMS.some((i) => i.id === v);
export const slotOf = (id: ItemId) => ITEMS.find((i) => i.id === id)!.slot;
export const labelOf = (id: ItemId) => ITEMS.find((i) => i.id === id)!.label;

/** Wearing an item takes off whatever was in the same slot. */
export function wear(worn: ItemId[], id: ItemId): ItemId[] {
  const s = slotOf(id);
  return [...worn.filter((w) => slotOf(w) !== s), id];
}

export type Pose = "stand" | "carry" | "wave" | "sit" | "cheer";
export type Mood = "open" | "happy" | "sleepy";

export interface TeddyProps {
  fur: Fur;
  worn?: readonly ItemId[];
  pose?: Pose;
  mood?: Mood;
  blush?: boolean;
  blink?: boolean;
  /** Extra art drawn between body and arms (the envelope). */
  carry?: ReactNode;
  size?: number | string;
  style?: CSSProperties;
  className?: string;
  title?: string;
}

const sid = (s: string) => s.replace(/[^a-zA-Z0-9_-]/g, "");

export const Teddy = forwardRef<SVGSVGElement, TeddyProps>(function Teddy(
  { fur, worn = [], pose = "stand", mood = "open", blush = true, blink = true, carry, size = 200, style, className, title },
  ref,
) {
  const id = sid(useId());
  const c = FURS[fur];
  const has = (i: ItemId) => worn.includes(i);
  const sweater = has("sweater");
  const sitting = pose === "sit";
  const armFill = sweater ? "#FF8FB8" : `url(#tb${id})`;

  const arm = (side: "l" | "r") => {
    const L = side === "l";
    const sx = L ? 1 : -1;
    let cx = L ? 54 : 146;
    let cy = 166;
    let rot = L ? 22 : -22;
    if (pose === "carry") {
      cx = L ? 76 : 124;
      cy = 162;
      rot = L ? -58 : 58;
    } else if (pose === "cheer") {
      cx = L ? 30 : 170;
      cy = 120;
      rot = L ? 40 : -40;
    } else if (pose === "wave" && !L) {
      cx = 172;
      cy = 120;
      rot = -36;
    }
    const pawY = cy + 22;
    const el = (
      <g transform={`rotate(${rot} ${cx} ${cy})`}>
        <ellipse cx={cx} cy={cy} rx="15" ry="27" fill={armFill} stroke={c.dark} strokeWidth="1.2" />
        {sweater && <path d={`M${cx - 14} ${cy + 12} h28`} stroke="#E0457B" strokeWidth="3" strokeDasharray="2 2" />}
        {pose !== "carry" && <ellipse cx={cx} cy={pawY} rx="11" ry="8" fill={c.light} />}
        {pose !== "carry" && <ellipse cx={cx} cy={pawY + 1} rx="5" ry="3.6" fill={c.inner} opacity=".8" />}
      </g>
    );
    if (pose === "wave" && !L)
      return (
        <g key={side} className="td-wave">
          {el}
        </g>
      );
    return <g key={side}>{el}</g>;
  };

  return (
    <svg ref={ref} viewBox="0 0 200 232" width={size} height={size} className={className} style={{ display: "block", overflow: "visible", ...style }} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`th${id}`} cx="42%" cy="34%" r="70%">
          <stop offset="0" stopColor={c.light} />
          <stop offset=".55" stopColor={c.base} />
          <stop offset="1" stopColor={c.dark} />
        </radialGradient>
        <radialGradient id={`tb${id}`} cx="45%" cy="30%" r="80%">
          <stop offset="0" stopColor={c.base} />
          <stop offset="1" stopColor={c.dark} />
        </radialGradient>
      </defs>

      {/* shadow */}
      <ellipse cx="100" cy="226" rx="66" ry="6" fill="rgba(0,0,0,.18)" />

      {/* feet */}
      {sitting ? (
        <>
          <ellipse cx="66" cy="214" rx="24" ry="15" fill={`url(#tb${id})`} stroke={c.dark} strokeWidth="1.2" />
          <ellipse cx="134" cy="214" rx="24" ry="15" fill={`url(#tb${id})`} stroke={c.dark} strokeWidth="1.2" />
          {[66, 134].map((x) => (
            <g key={x}>
              <ellipse cx={x} cy="216" rx="11" ry="8" fill={c.inner} />
              {[-8, 0, 8].map((d) => (
                <circle key={d} cx={x + d} cy="205" r="2.6" fill={c.inner} />
              ))}
            </g>
          ))}
        </>
      ) : (
        <>
          <ellipse cx="72" cy="214" rx="21" ry="13" fill={`url(#tb${id})`} stroke={c.dark} strokeWidth="1.2" />
          <ellipse cx="128" cy="214" rx="21" ry="13" fill={`url(#tb${id})`} stroke={c.dark} strokeWidth="1.2" />
          <ellipse cx="72" cy="217" rx="9" ry="6" fill={c.inner} opacity=".85" />
          <ellipse cx="128" cy="217" rx="9" ry="6" fill={c.inner} opacity=".85" />
        </>
      )}

      {/* body */}
      <ellipse cx="100" cy="172" rx="56" ry="48" fill={`url(#tb${id})`} stroke={c.dark} strokeWidth="1.2" />
      {sweater ? (
        <g>
          <path d="M46 168 C46 136 70 124 100 124 C130 124 154 136 154 168 C154 196 132 214 100 214 C68 214 46 196 46 168 Z" fill="#FF8FB8" />
          <path d="M50 196 Q100 222 150 196" stroke="#E0457B" strokeWidth="5" fill="none" strokeDasharray="3 3" />
          <path d="M100 186 C88 178 82 172 82 164 C82 158 87 154 92 154 C96 154 99 157 100 160 C101 157 104 154 108 154 C113 154 118 158 118 164 C118 172 112 178 100 186 Z" fill="#fff" />
          <path d="M100 182 C91 176 87 171 87 165 C87 161 90 158 93 158" stroke="#FFC8DD" strokeWidth="1.5" fill="none" />
        </g>
      ) : (
        <>
          <ellipse cx="100" cy="180" rx="34" ry="29" fill={c.light} />
          {/* stitched heart patch */}
          <path d="M100 194 C92 188 87 184 87 178 C87 174 90 171 94 171 C97 171 99 173 100 175 C101 173 103 171 106 171 C110 171 113 174 113 178 C113 184 108 188 100 194 Z" fill={c.inner} opacity=".9" />
          <path d="M100 194 C92 188 87 184 87 178 C87 174 90 171 94 171 C97 171 99 173 100 175 C101 173 103 171 106 171 C110 171 113 174 113 178 C113 184 108 188 100 194 Z" fill="none" stroke="#fff" strokeWidth="1" strokeDasharray="2 2" />
        </>
      )}

      {/* neckwear under the head */}
      {has("scarf") && (
        <g>
          <path d="M50 140 Q100 162 150 140 L150 152 Q100 174 50 152 Z" fill="#E0457B" />
          <path d="M60 145 l0 10 M76 150 l0 10 M92 153 l0 10 M108 153 l0 10 M124 150 l0 10 M140 145 l0 10" stroke="#FFF1B5" strokeWidth="3" />
          <path d="M126 152 L140 196 L124 196 L114 158 Z" fill="#E0457B" />
          <path d="M128 172 h11 M131 184 h10" stroke="#FFF1B5" strokeWidth="3" />
          <path d="M124 196 l2 6 M130 196 l1 6 M136 196 l2 6" stroke="#E0457B" strokeWidth="2" />
        </g>
      )}

      {/* carried thing goes behind the paws */}
      {pose !== "cheer" && arm("l")}
      {pose !== "cheer" && pose !== "wave" && arm("r")}
      {/* carried thing in front of the arms, held by the paws at its sides */}
      {carry}
      {pose === "carry" &&
        [60, 140].map((x) => (
          <g key={x}>
            <ellipse cx={x} cy="172" rx="10" ry="12" fill={c.light} stroke={c.dark} strokeWidth="1" />
            <ellipse cx={x} cy="174" rx="4.5" ry="5" fill={c.inner} opacity=".8" />
          </g>
        ))}

      {/* ears */}
      {[
        [50, 52],
        [150, 52],
      ].map(([x, y]) => (
        <g key={x}>
          <circle cx={x} cy={y} r="27" fill={`url(#th${id})`} stroke={c.dark} strokeWidth="1.2" />
          <circle cx={x} cy={y + 2} r="15" fill={c.inner} opacity=".9" />
        </g>
      ))}

      {/* head */}
      <ellipse cx="100" cy="92" rx="72" ry="62" fill={`url(#th${id})`} stroke={c.dark} strokeWidth="1.2" />
      <path d="M90 34 q6 -10 12 -2 q4 -8 10 0" stroke={c.dark} strokeWidth="2" fill="none" strokeLinecap="round" opacity=".7" />
      {/* muzzle */}
      <ellipse cx="100" cy="112" rx="30" ry="22" fill={c.light} />
      {/* eyes */}
      <g className={blink && mood === "open" ? "td-blink" : undefined}>
        {mood === "open" &&
          [74, 126].map((x) => (
            <g key={x}>
              <ellipse cx={x} cy="88" rx="7.5" ry="8.5" fill="#2A1D1A" />
              <circle cx={x + 2.4} cy="85" r="2.6" fill="#fff" />
              <circle cx={x - 2.4} cy="91" r="1.2" fill="#fff" opacity=".8" />
            </g>
          ))}
        {mood === "happy" && [74, 126].map((x) => <path key={x} d={`M${x - 8} 90 q8 -10 16 0`} stroke="#2A1D1A" strokeWidth="3.4" fill="none" strokeLinecap="round" />)}
        {mood === "sleepy" && [74, 126].map((x) => <path key={x} d={`M${x - 8} 88 q8 7 16 0`} stroke="#2A1D1A" strokeWidth="3" fill="none" strokeLinecap="round" />)}
      </g>
      {/* cheeks */}
      {blush && [62, 138].map((x) => <ellipse key={x} cx={x} cy="110" rx="11" ry="6.5" fill="#FF7FA8" opacity=".42" />)}
      {/* nose + mouth */}
      <path d="M100 109 C93 109 89 104 89 101 C89 97 94 96 100 96 C106 96 111 97 111 101 C111 104 107 109 100 109 Z" fill="#4A2E22" />
      <ellipse cx="96" cy="99.5" rx="3.2" ry="1.6" fill="#fff" opacity=".55" />
      <path d="M100 109 v5" stroke="#4A2E22" strokeWidth="2" strokeLinecap="round" />
      {mood === "sleepy" ? (
        <ellipse cx="100" cy="120" rx="3.5" ry="2.6" fill="#4A2E22" opacity=".8" />
      ) : (
        <path d="M89 116 q5.5 6 11 -2 q5.5 8 11 2" stroke="#4A2E22" strokeWidth="2" fill="none" strokeLinecap="round" />
      )}

      {/* accessories on the head */}
      {has("glasses") && (
        <g fill="rgba(200,230,255,.25)" stroke="#5B3F78" strokeWidth="3">
          <circle cx="74" cy="88" r="14" />
          <circle cx="126" cy="88" r="14" />
          <path d="M88 86 q12 -6 24 0" fill="none" />
          <path d="M60 84 l-18 -6 M140 84 l18 -6" fill="none" />
          <path d="M68 80 l6 -3" stroke="#fff" strokeWidth="2" opacity=".7" />
        </g>
      )}
      {has("bow") && (
        <g transform="rotate(-18 46 34)">
          <path d="M46 34 L22 20 Q16 34 22 48 Z" fill="#FF6FA3" />
          <path d="M46 34 L70 20 Q76 34 70 48 Z" fill="#FF6FA3" />
          <path d="M26 26 Q22 34 26 42" stroke="#fff" strokeWidth="2" fill="none" opacity=".6" />
          <circle cx="46" cy="34" r="7" fill="#E0457B" />
        </g>
      )}
      {has("flower") && (
        <g transform="translate(156 32)">
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <ellipse key={a} cx="0" cy="-10" rx="6.5" ry="10" fill="#fff" stroke="#F3E3C8" strokeWidth="1" transform={`rotate(${a})`} />
          ))}
          <circle r="7" fill="#FFD25E" />
          <circle r="3" cx="-2" cy="-2" fill="#FFF1B5" />
        </g>
      )}
      {has("crown") && (
        <g transform="rotate(-6 100 30)">
          <path d="M68 40 L72 12 L86 28 L100 6 L114 28 L128 12 L132 40 Z" fill="#FFD25E" stroke="#C99A1E" strokeWidth="2" strokeLinejoin="round" />
          <rect x="68" y="36" width="64" height="9" rx="3" fill="#F2B92E" stroke="#C99A1E" strokeWidth="1.5" />
          <circle cx="100" cy="24" r="4" fill="#FF6FA3" />
          <circle cx="80" cy="40.5" r="2.6" fill="#7FE3FF" />
          <circle cx="100" cy="40.5" r="2.6" fill="#FF6FA3" />
          <circle cx="120" cy="40.5" r="2.6" fill="#A8E6CF" />
          <circle cx="72" cy="12" r="3" fill="#FFF1B5" />
          <circle cx="128" cy="12" r="3" fill="#FFF1B5" />
        </g>
      )}
      {has("cap") && (
        <g>
          <path d="M44 58 C46 18 154 18 156 58 Z" fill="#A8E6CF" stroke="#6FBF9F" strokeWidth="2" />
          <path d="M100 22 v36" stroke="#6FBF9F" strokeWidth="2" />
          <circle cx="100" cy="21" r="4.5" fill="#6FBF9F" />
          <path d="M120 56 Q168 50 178 62 Q150 70 118 64 Z" fill="#8FD9BB" stroke="#6FBF9F" strokeWidth="2" />
          <path d="M86 40 C88 34 96 32 100 36 C104 32 112 34 114 40 C114 46 106 50 100 54 C94 50 86 46 86 40 Z" fill="#FF8FB8" />
        </g>
      )}
      {has("bowtie") && (
        <g transform="translate(100 146)">
          <path d="M0 0 L-22 -12 Q-26 0 -22 12 Z" fill="#5B5BD6" />
          <path d="M0 0 L22 -12 Q26 0 22 12 Z" fill="#5B5BD6" />
          <circle cx="-12" cy="-2" r="2" fill="#fff" opacity=".8" />
          <circle cx="12" cy="3" r="2" fill="#fff" opacity=".8" />
          <rect x="-6" y="-6" width="12" height="12" rx="4" fill="#4646B8" />
        </g>
      )}
      {/* raised arms go over the head's edge */}
      {pose === "cheer" && arm("l")}
      {(pose === "cheer" || pose === "wave") && arm("r")}
    </svg>
  );
});

// ── wardrobe icons (each item on its own, 64×64) ─────────────────────────────
export function ItemIcon({ id, size = 44 }: { id: ItemId; size?: number }) {
  const v: Record<ItemId, ReactNode> = {
    crown: (
      <g>
        <path d="M8 46 L12 18 L24 32 L32 10 L40 32 L52 18 L56 46 Z" fill="#FFD25E" stroke="#C99A1E" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="32" cy="30" r="3.5" fill="#FF6FA3" />
      </g>
    ),
    cap: (
      <g>
        <path d="M10 40 C12 12 52 12 54 40 Z" fill="#A8E6CF" stroke="#6FBF9F" strokeWidth="2" />
        <path d="M40 38 Q58 36 62 44 Q50 48 38 44 Z" fill="#8FD9BB" stroke="#6FBF9F" strokeWidth="2" />
      </g>
    ),
    bow: (
      <g>
        <path d="M32 32 L8 18 Q2 32 8 46 Z" fill="#FF6FA3" />
        <path d="M32 32 L56 18 Q62 32 56 46 Z" fill="#FF6FA3" />
        <circle cx="32" cy="32" r="7" fill="#E0457B" />
      </g>
    ),
    flower: (
      <g transform="translate(32 32)">
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <ellipse key={a} cy="-12" rx="8" ry="12" fill="#fff" stroke="#EADCC8" strokeWidth="1" transform={`rotate(${a})`} />
        ))}
        <circle r="8" fill="#FFD25E" />
      </g>
    ),
    glasses: (
      <g fill="rgba(200,230,255,.35)" stroke="#5B3F78" strokeWidth="3.5">
        <circle cx="18" cy="34" r="12" />
        <circle cx="46" cy="34" r="12" />
        <path d="M30 32 q2 -4 4 0" fill="none" />
      </g>
    ),
    scarf: (
      <g>
        <path d="M6 20 Q32 34 58 20 L58 32 Q32 46 6 32 Z" fill="#E0457B" />
        <path d="M14 24 v10 M26 28 v10 M38 28 v10 M50 24 v10" stroke="#FFF1B5" strokeWidth="3" />
        <path d="M40 34 L50 60 L38 60 L32 38 Z" fill="#E0457B" />
      </g>
    ),
    bowtie: (
      <g transform="translate(32 32)">
        <path d="M0 0 L-24 -14 Q-28 0 -24 14 Z" fill="#5B5BD6" />
        <path d="M0 0 L24 -14 Q28 0 24 14 Z" fill="#5B5BD6" />
        <rect x="-6" y="-6" width="12" height="12" rx="4" fill="#4646B8" />
      </g>
    ),
    sweater: (
      <g>
        <path d="M14 14 L24 8 Q32 14 40 8 L50 14 L60 30 L50 34 L48 28 L48 58 L16 58 L16 28 L14 34 L4 30 Z" fill="#FF8FB8" stroke="#E0457B" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M32 44 C27 40 24 38 24 34 C24 31 26 29 28.5 29 C30 29 31.5 30 32 31.5 C32.5 30 34 29 35.5 29 C38 29 40 31 40 34 C40 38 37 40 32 44 Z" fill="#fff" />
        <path d="M16 54 h32" stroke="#E0457B" strokeWidth="3" strokeDasharray="2 2" />
      </g>
    ),
  };
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden style={{ display: "block", overflow: "visible" }}>
      {v[id]}
    </svg>
  );
}

// ── the plushie pile inside the machine (280 × 92) ───────────────────────────
function face(x: number, y: number, s = 1, ink = "#3A2A30") {
  return (
    <g>
      <circle cx={x - 5 * s} cy={y} r={1.8 * s} fill={ink} />
      <circle cx={x + 5 * s} cy={y} r={1.8 * s} fill={ink} />
      <path d={`M${x - 2.4 * s} ${y + 3.5 * s} q${2.4 * s} ${2.4 * s} ${4.8 * s} 0`} stroke={ink} strokeWidth={1.2 * s} fill="none" strokeLinecap="round" />
      <ellipse cx={x - 8 * s} cy={y + 3 * s} rx={2.6 * s} ry={1.6 * s} fill="#FF7FA8" opacity=".5" />
      <ellipse cx={x + 8 * s} cy={y + 3 * s} rx={2.6 * s} ry={1.6 * s} fill="#FF7FA8" opacity=".5" />
    </g>
  );
}

export function PlushPile({ style }: { style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 280 92" width="100%" aria-hidden style={{ display: "block", overflow: "visible", ...style }}>
      {/* back row */}
      <g opacity=".9">
        {/* star */}
        <path d="M40 20 l7 14 l15 2 l-11 10 l3 15 l-14 -7 l-14 7 l3 -15 l-11 -10 l15 -2 Z" fill="#FFE07A" stroke="#E8B93A" strokeWidth="1.5" strokeLinejoin="round" />
        {face(40, 40, 0.8)}
        {/* bunny */}
        <ellipse cx="96" cy="16" rx="6" ry="16" fill="#fff" stroke="#E7DCE8" />
        <ellipse cx="110" cy="16" rx="6" ry="16" fill="#fff" stroke="#E7DCE8" />
        <ellipse cx="96" cy="16" rx="2.6" ry="11" fill="#FFC8DD" />
        <ellipse cx="110" cy="16" rx="2.6" ry="11" fill="#FFC8DD" />
        <circle cx="103" cy="40" r="17" fill="#fff" stroke="#E7DCE8" />
        {face(103, 40, 0.9)}
        {/* mint bear */}
        <circle cx="200" cy="22" r="7" fill="#A8E6CF" />
        <circle cx="226" cy="22" r="7" fill="#A8E6CF" />
        <circle cx="213" cy="36" r="18" fill="#A8E6CF" stroke="#7FCFAF" />
        <ellipse cx="213" cy="42" rx="8" ry="6" fill="#DFF7EC" />
        {face(213, 36, 0.9)}
        {/* heart plush */}
        <path d="M252 52 C238 42 232 36 232 28 C232 22 237 18 242 18 C246 18 250 21 252 25 C254 21 258 18 262 18 C267 18 272 22 272 28 C272 36 266 42 252 52 Z" fill="#FF8FB8" stroke="#E0457B" />
        {face(252, 32, 0.8)}
      </g>
      {/* front row */}
      {/* duck */}
      <ellipse cx="22" cy="70" rx="20" ry="16" fill="#FFE07A" stroke="#E8B93A" />
      <ellipse cx="36" cy="72" rx="7" ry="4" fill="#FFA94D" />
      {face(18, 66, 0.8)}
      {/* lilac bunny-blob */}
      <ellipse cx="66" cy="74" rx="22" ry="18" fill="#CDB4DB" stroke="#A98DBE" />
      {face(66, 72, 0.9)}
      {/* pig */}
      <circle cx="146" cy="74" r="19" fill="#FFC8DD" stroke="#F0A3BF" />
      <path d="M132 58 l-4 -8 l9 4 Z M160 58 l4 -8 l-9 4 Z" fill="#FFB3CD" />
      <ellipse cx="146" cy="79" rx="7" ry="5" fill="#FF9EC0" />
      <circle cx="143.5" cy="79" r="1.4" fill="#C2577F" />
      <circle cx="148.5" cy="79" r="1.4" fill="#C2577F" />
      <circle cx="140" cy="70" r="1.8" fill="#3A2A30" />
      <circle cx="152" cy="70" r="1.8" fill="#3A2A30" />
      {/* cloud */}
      <path d="M240 86 C224 86 222 70 234 68 C234 56 252 54 256 64 C266 58 278 68 270 78 C276 86 266 88 262 86 Z" fill="#E9F6FF" stroke="#BFE3F7" />
      {face(250, 74, 0.8)}
    </svg>
  );
}

// ── page keyframes (off under reduced motion) ────────────────────────────────
export const TEDDY_CSS = `
@keyframes td-blink { 0%, 92%, 100% { transform: scaleY(1) } 95% { transform: scaleY(.1) } }
@keyframes td-wave { 0%, 100% { transform: rotate(0) } 25% { transform: rotate(-16deg) } 75% { transform: rotate(10deg) } }
@keyframes td-bulb { 0%, 100% { opacity: .35; filter: none } 50% { opacity: 1; filter: drop-shadow(0 0 6px currentColor) } }
@keyframes td-marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
@keyframes td-float { 0%, 100% { transform: translateY(0) rotate(-6deg) } 50% { transform: translateY(-8px) rotate(6deg) } }
@keyframes td-twinkle { 0%, 100% { opacity: .25 } 50% { opacity: .9 } }
@keyframes td-waddle { 0%, 100% { transform: rotate(-5deg) translateY(0) } 50% { transform: rotate(5deg) translateY(-4px) } }
@keyframes td-breathe { 0%, 100% { transform: scale(1, 1) } 50% { transform: scale(1.015, .985) } }
@keyframes td-zzz { 0% { transform: translate(0, 0) scale(.7); opacity: 0 } 25% { opacity: 1 } 100% { transform: translate(26px, -46px) scale(1.15); opacity: 0 } }
@keyframes td-peek { 0%, 70%, 100% { transform: translateY(42%) } 78%, 92% { transform: translateY(18%) } }
@keyframes td-glow { 0%, 100% { box-shadow: 0 0 0 0 rgba(255,143,184,.0) } 50% { box-shadow: 0 0 22px 4px rgba(255,143,184,.55) } }
.td-blink { animation: td-blink 4.6s ease-in-out infinite; transform-box: fill-box; transform-origin: center }
.td-wave { animation: td-wave 1.3s ease-in-out infinite; transform-box: view-box; transform-origin: 150px 142px }
.td-bulb { animation: td-bulb 1s ease-in-out infinite }
.td-marquee { animation: td-marquee 9s linear infinite }
.td-float { animation: td-float 2.6s ease-in-out infinite }
.td-twinkle { animation: td-twinkle 2.4s ease-in-out infinite }
.td-waddle { animation: td-waddle .5s ease-in-out infinite; transform-origin: 50% 100% }
.td-breathe { animation: td-breathe 3.2s ease-in-out infinite; transform-origin: 50% 100% }
.td-zzz { animation: td-zzz 2.8s ease-out infinite }
.td-peek { animation: td-peek 6s ease-in-out infinite }
.td-glow { animation: td-glow 1.6s ease-in-out infinite }
@media (prefers-reduced-motion: reduce) {
  .td-blink, .td-wave, .td-bulb, .td-marquee, .td-float, .td-twinkle, .td-waddle, .td-breathe, .td-zzz, .td-peek, .td-glow { animation: none !important }
  .td-bulb { opacity: .9 }
}
`;

/** Soft bokeh fairy lights + twinkling stars for the night room. */
export function FairyLights({ count = 9 }: { count?: number }) {
  const colors = ["#FFF1B5", "#FF8FB8", "#A8E6CF", "#7FE3FF", "#CDB4DB"];
  return (
    <div aria-hidden style={{ position: "absolute", left: 0, right: 0, top: 0, height: 120, pointerEvents: "none", overflow: "hidden" }}>
      <svg viewBox="0 0 400 80" preserveAspectRatio="none" style={{ position: "absolute", left: 0, top: 0, width: "100%", height: 80 }}>
        <path d="M-10 10 Q100 60 200 24 T410 18" stroke="rgba(255,248,240,.25)" strokeWidth="1.2" fill="none" />
      </svg>
      {Array.from({ length: count }, (_, i) => {
        const t = (i + 0.5) / count;
        const x = t * 100;
        // follow the wire roughly
        const y = t < 0.5 ? 10 + Math.sin(t * Math.PI * 2) * 18 + 12 : 22 - Math.sin((t - 0.5) * Math.PI * 2) * 6;
        const col = colors[i % colors.length];
        return (
          <span
            key={i}
            className="td-twinkle"
            style={{ position: "absolute", left: `${x}%`, top: y, width: 9, height: 12, marginLeft: -4.5, borderRadius: "50% 50% 45% 45%", background: col, boxShadow: `0 0 14px 4px ${col}66`, animationDelay: `${(i * 0.37) % 2.4}s` }}
          />
        );
      })}
    </div>
  );
}
