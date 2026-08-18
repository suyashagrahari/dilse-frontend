"use client";

// ─── Invented marks ──────────────────────────────────────────────────────────
// EVERYTHING in this file is drawn from scratch for this parody. There is no
// real carrier's emblem, no state emblem, no ticketing-portal wordmark and no
// scanned asset anywhere in it — the crest is two rails converging into a heart
// and the authority is the fictional "Indian Hearts Railway (IHRCTC)".

import { useMemo } from "react";

/** Cheap deterministic hash → a repeatable pseudo-random stream from a string. */
function seedFrom(s: string): () => number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return () => {
    h ^= h << 13; h >>>= 0;
    h ^= h >> 17;
    h ^= h << 5; h >>>= 0;
    return h / 4294967296;
  };
}

/**
 * The invented crest: a ruled circle, two rails running to a vanishing point, and
 * a heart sitting where the vanishing point would be. Line art only, so it prints
 * like the rest of the slip.
 */
export function IhrctcMark({ size = 30 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="#111"
      strokeWidth={1}
      aria-hidden
      style={{ display: "block", flexShrink: 0 }}
    >
      <circle cx="16" cy="16" r="14.4" />
      {/* rails converging upward — kept short so the heart stays the subject */}
      <path d="M7.6 28.2 L14.1 19.4" strokeLinecap="square" />
      <path d="M24.4 28.2 L17.9 19.4" strokeLinecap="square" />
      {/* two sleepers, narrowing with the perspective */}
      <path d="M9.4 25.8 L22.6 25.8" strokeWidth={0.9} />
      <path d="M11.8 22.4 L20.2 22.4" strokeWidth={0.9} />
      {/* the vanishing point is a heart */}
      <path
        d="M16 19.2 C10.6 15.2 8.6 13.2 8.6 10.6 C8.6 8.5 10.2 7.0 12.2 7.0 C13.6 7.0 15.0 7.8 16 9.5 C17.0 7.8 18.4 7.0 19.8 7.0 C21.8 7.0 23.4 8.5 23.4 10.6 C23.4 13.2 21.4 15.2 16 19.2 Z"
        strokeWidth={1.1}
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * A procedural barcode strip — a row of divs of varying width, seeded from the
 * PNR so the same ticket always prints the same bars. No library, no image; it
 * has to survive `html-to-image` and it has to look printed, not rendered.
 */
export function Barcode({ seed, height = 30 }: { seed: string; height?: number }) {
  const bars = useMemo(() => {
    const rnd = seedFrom(seed || "0000");
    const out: { w: number; ink: boolean }[] = [];
    // guard bars at both ends, like a real symbology
    out.push({ w: 1, ink: true }, { w: 1, ink: false }, { w: 1, ink: true });
    for (let i = 0; i < 58; i++) {
      const r = rnd();
      out.push({ w: r < 0.55 ? 1 : r < 0.85 ? 2 : 3, ink: true });
      const g = rnd();
      out.push({ w: g < 0.6 ? 1 : g < 0.9 ? 2 : 3, ink: false });
    }
    out.push({ w: 1, ink: true }, { w: 1, ink: false }, { w: 1, ink: true });
    return out;
  }, [seed]);

  return (
    <div aria-hidden style={{ display: "flex", alignItems: "flex-end", height, gap: 0 }}>
      {bars.map((b, i) => (
        <span
          key={i}
          style={{
            width: b.w,
            height: "100%",
            background: b.ink ? "#111" : "transparent",
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  );
}

/**
 * The PNR, rendered character by character with exactly two glyphs nudged 1px up.
 * Dot-matrix heads misfire; a perfectly aligned number is the single clearest
 * tell that a "printed" slip was actually typeset in a browser. The two victims
 * are chosen from the PNR itself so they never move between renders.
 */
export function PnrGlyphs({ pnr, style }: { pnr: string; style?: React.CSSProperties }) {
  const offsets = useMemo(() => {
    const chars = pnr.split("");
    const digits = chars.map((c, i) => (/[0-9A-Za-z]/.test(c) ? i : -1)).filter((i) => i >= 0);
    if (digits.length < 2) return new Set<number>();
    const rnd = seedFrom(pnr);
    const a = digits[Math.floor(rnd() * digits.length)];
    let b = digits[Math.floor(rnd() * digits.length)];
    if (b === a) b = digits[(digits.indexOf(a) + 3) % digits.length];
    return new Set([a, b]);
  }, [pnr]);

  return (
    <span style={style}>
      {pnr.split("").map((c, i) => (
        <span
          key={i}
          style={offsets.has(i) ? { display: "inline-block", transform: "translateY(-1px)" } : undefined}
        >
          {c === " " ? " " : c}
        </span>
      ))}
    </span>
  );
}
