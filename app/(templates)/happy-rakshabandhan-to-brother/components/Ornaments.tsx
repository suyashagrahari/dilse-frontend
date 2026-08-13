"use client";

import { memo } from "react";
import { RB } from "./theme";

// ─── Ornaments ───────────────────────────────────────────────────────────────
//
// The decorative layer, all inline SVG. Nothing here is an emoji and nothing is
// a raster asset — these scale to any density, take the palette as props, and
// cost no network request.
//
// All of it is `aria-hidden`. A screen reader announcing "marigold, marigold,
// marigold, mango leaf" before the actual message would make the page worse for
// the person relying on it.
//
// Motion lives in rakhi.css so `prefers-reduced-motion` can switch the whole
// set off in one place.

/** Deterministic jitter. Math.random() would re-roll on every render. */
function wobble(i: number, spread: number): number {
  const seq = [0.31, -0.77, 0.52, -0.18, 0.91, -0.44, 0.66, -0.95, 0.12, -0.61, 0.83, -0.29];
  return seq[i % seq.length] * spread;
}

// ── Toran ────────────────────────────────────────────────────────────────────
//
// The marigold-and-mango-leaf garland hung across a doorway. Here it hangs
// across the top of the screen, which is the same gesture: you are entering
// somewhere.

export const Toran = memo(function Toran({ count = 11 }: { count?: number }) {
  const W = 420;
  const step = W / (count - 1);
  // Catenary-ish: the rope sags in the middle.
  const sag = (x: number) => 14 + 26 * Math.sin((x / W) * Math.PI);

  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${W} 92`}
      preserveAspectRatio="none"
      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 92, pointerEvents: "none" }}
    >
      <defs>
        <radialGradient id="rb-marigold" cx="38%" cy="34%">
          <stop offset="0%" stopColor="#FFD166" />
          <stop offset="55%" stopColor={RB.marigold} />
          <stop offset="100%" stopColor="#C86A1E" />
        </radialGradient>
        <radialGradient id="rb-marigold-red" cx="38%" cy="34%">
          <stop offset="0%" stopColor="#F4A261" />
          <stop offset="60%" stopColor="#D1462F" />
          <stop offset="100%" stopColor={RB.red} />
        </radialGradient>
        <linearGradient id="rb-leaf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4C8B5A" />
          <stop offset="100%" stopColor="#2F6B4F" />
        </linearGradient>
      </defs>

      {/* the rope */}
      <path
        d={`M0 14 Q ${W / 2} ${14 + 52} ${W} 14`}
        fill="none"
        stroke={RB.brass}
        strokeWidth={2.5}
        opacity={0.75}
      />

      {Array.from({ length: count }).map((_, i) => {
        const x = i * step;
        const y = sag(x);
        const isLeaf = i % 3 === 1;
        const r = isLeaf ? 0 : 8.5 + wobble(i, 1.6);
        const drop = 16 + wobble(i, 5);

        return (
          <g
            key={i}
            className="rb-toran-item"
            style={{ animationDelay: `${(i % 5) * 0.4}s`, transformOrigin: `${x}px ${y}px` }}
          >
            <line x1={x} y1={y} x2={x} y2={y + drop} stroke={RB.brass} strokeWidth={1.2} opacity={0.6} />
            {isLeaf ? (
              // mango leaf
              <path
                d={`M${x} ${y + drop} q -7 12 0 26 q 7 -14 0 -26 z`}
                fill="url(#rb-leaf)"
              />
            ) : (
              <>
                {/* petal ring, then the centre */}
                {Array.from({ length: 8 }).map((__, p) => {
                  const ang = (p / 8) * Math.PI * 2;
                  return (
                    <circle
                      key={p}
                      cx={x + Math.cos(ang) * r * 0.55}
                      cy={y + drop + 8 + Math.sin(ang) * r * 0.55}
                      r={r * 0.46}
                      fill={i % 4 === 0 ? "url(#rb-marigold-red)" : "url(#rb-marigold)"}
                    />
                  );
                })}
                <circle
                  cx={x}
                  cy={y + drop + 8}
                  r={r * 0.44}
                  fill={i % 4 === 0 ? "#9B2226" : "#E0902F"}
                  opacity={0.9}
                />
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
});

// ── Rangoli ──────────────────────────────────────────────────────────────────
//
// A faint mandala behind the content. Kept very low contrast — it is a texture,
// not a picture, and at full strength it fights every word on top of it.

export const Rangoli = memo(function Rangoli({
  size = 340,
  opacity = 0.07,
  petals = 16,
  still = false,
}: {
  size?: number;
  opacity?: number;
  petals?: number;
  /**
   * Drop the rotation. Required inside the Story card: html-to-image serialises
   * the computed transform of whatever is painted, so an element mid-rotation
   * bakes a crooked mandala into the PNG. Nothing in an export node may animate.
   */
  still?: boolean;
}) {
  const c = size / 2;
  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ position: "absolute", pointerEvents: "none", opacity }}
      className={still ? undefined : "rb-rangoli"}
    >
      <g stroke={RB.red} fill="none" strokeWidth={1.1}>
        {Array.from({ length: petals }).map((_, i) => {
          const ang = (i / petals) * 360;
          return (
            <ellipse
              key={i}
              cx={c}
              cy={c * 0.52}
              rx={c * 0.17}
              ry={c * 0.46}
              transform={`rotate(${ang} ${c} ${c})`}
            />
          );
        })}
        <circle cx={c} cy={c} r={c * 0.94} strokeDasharray="3 7" />
        <circle cx={c} cy={c} r={c * 0.66} />
        <circle cx={c} cy={c} r={c * 0.2} />
      </g>
    </svg>
  );
});

// ── Diya ─────────────────────────────────────────────────────────────────────

export const Diya = memo(function Diya({
  size = 34,
  lit = true,
}: {
  size?: number;
  lit?: boolean;
}) {
  return (
    <svg aria-hidden width={size} height={size * 1.15} viewBox="0 0 40 46">
      <defs>
        <linearGradient id="rb-clay" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C98B54" />
          <stop offset="100%" stopColor="#8A5322" />
        </linearGradient>
        <radialGradient id="rb-flame-g" cx="50%" cy="72%">
          <stop offset="0%" stopColor="#FFF3C4" />
          <stop offset="42%" stopColor="#FFC53D" />
          <stop offset="100%" stopColor="#F4791F" stopOpacity={0.15} />
        </radialGradient>
      </defs>

      {lit && (
        <g className="rb-flame">
          <ellipse cx="20" cy="15" rx="9" ry="13" fill="url(#rb-flame-g)" opacity={0.55} />
          <path d="M20 4 C25 12, 25.5 17, 20 22 C14.5 17, 15 12, 20 4 Z" fill="#FFC53D" />
          <path d="M20 10 C22.5 14, 22.6 17, 20 20 C17.4 17, 17.5 14, 20 10 Z" fill="#FFF3C4" />
        </g>
      )}

      {/* wick */}
      <path d="M18.6 26 L20 22 L21.4 26 Z" fill="#5A3A1B" />
      {/* bowl */}
      <path d="M5 28 Q20 44 35 28 Q31 26 20 26 Q9 26 5 28 Z" fill="url(#rb-clay)" />
      <ellipse cx="20" cy="27.4" rx="15" ry="3.4" fill="#E0A96D" opacity={0.85} />
      <ellipse cx="20" cy="27.6" rx="10" ry="2" fill="#7A4718" opacity={0.5} />
    </svg>
  );
});

// ── Rakhi ────────────────────────────────────────────────────────────────────
//
// The thread she designed, drawn from her actual colours. Used as a section
// divider and on the completion card.

export const RakhiCharm = memo(function RakhiCharm({
  size = 46,
  colorA,
  colorB,
  bead,
  glyph,
  spin = false,
}: {
  size?: number;
  colorA: string;
  colorB: string;
  bead: string;
  glyph: string;
  spin?: boolean;
}) {
  const id = `${colorA}${colorB}`.replace(/#/g, "");
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 60 60" className={spin ? "rb-spin" : undefined}>
      <defs>
        <linearGradient id={`rb-tw-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={colorA} />
          <stop offset="100%" stopColor={colorB} />
        </linearGradient>
      </defs>
      {/* petal ring */}
      {Array.from({ length: 10 }).map((_, i) => {
        const ang = (i / 10) * Math.PI * 2;
        return (
          <ellipse
            key={i}
            cx={30 + Math.cos(ang) * 17}
            cy={30 + Math.sin(ang) * 17}
            rx={7.5}
            ry={5.5}
            fill={`url(#rb-tw-${id})`}
            transform={`rotate(${(i / 10) * 360} ${30 + Math.cos(ang) * 17} ${30 + Math.sin(ang) * 17})`}
            opacity={0.92}
          />
        );
      })}
      <circle cx="30" cy="30" r="15" fill={bead} />
      <circle cx="30" cy="30" r="15" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" />
      <text
        x="30"
        y="30"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="15"
        fill="#fffdf8"
        style={{ fontWeight: 700 }}
      >
        {glyph}
      </text>
    </svg>
  );
});

/** A woven two-tone thread. Used as a rule between sections. */
export const ThreadDivider = memo(function ThreadDivider({
  colorA = RB.red,
  colorB = RB.marigold,
  width = 220,
}: {
  colorA?: string;
  colorB?: string;
  width?: number;
}) {
  // Two sine paths in antiphase read as a two-ply thread twisted together.
  const cycles = Math.max(1, Math.floor(width / 14));
  const over = `M0 7 ${"q 3.5 -5 7 0 q 3.5 5 7 0 ".repeat(cycles)}`;
  const under = `M0 7 ${"q 3.5 5 7 0 q 3.5 -5 7 0 ".repeat(cycles)}`;

  return (
    <svg aria-hidden width={width} height="14" viewBox={`0 0 ${width} 14`} style={{ display: "block" }}>
      <path d={over} fill="none" stroke={colorA} strokeWidth="2.2" strokeLinecap="round" />
      <path d={under} fill="none" stroke={colorB} strokeWidth="2.2" strokeLinecap="round" opacity={0.95} />
    </svg>
  );
});

// ── Arched frame ─────────────────────────────────────────────────────────────
//
// A temple-arch mount for the GIFs. The arch is a clip path, so the artwork sits
// INSIDE the shape rather than behind a decorative overlay — which is what lets
// `object-fit: contain` still show the whole frame without a hard rectangle edge.

export const ArchFrame = memo(function ArchFrame({
  children,
  width,
  height,
  accent = RB.brass,
}: {
  children: React.ReactNode;
  width: number;
  height: number;
  accent?: string;
}) {
  const r = width / 2;
  return (
    <div style={{ position: "relative", width, height, flexShrink: 0 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: `${r}px ${r}px 22px 22px`,
          overflow: "hidden",
          background: RB.surface,
          boxShadow: `0 14px 34px rgba(61,35,23,0.18), inset 0 0 0 1px rgba(255,255,255,0.6)`,
        }}
      >
        {children}
      </div>

      {/* brass outline, drawn on top so it is never clipped by the child */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: `${r}px ${r}px 22px 22px`,
          border: `2.5px solid ${accent}`,
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 7,
          borderRadius: `${r}px ${r}px 16px 16px`,
          border: `1px solid ${accent}`,
          opacity: 0.4,
          pointerEvents: "none",
        }}
      />
    </div>
  );
});

// ── Petal fall ───────────────────────────────────────────────────────────────
//
// One-shot. Mounted on a completed step, then unmounted by the caller — it does
// not loop, and it removes itself from the layout entirely via pointer-events.

export const PetalBurst = memo(function PetalBurst({ count = 18 }: { count?: number }) {
  return (
    <div
      aria-hidden
      style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 5 }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="rb-petal"
          style={{
            left: `${6 + (i * 89) % 88}%`,
            animationDelay: `${(i % 6) * 0.12}s`,
            background: i % 3 === 0 ? RB.red : i % 3 === 1 ? RB.marigold : "#FFD166",
            width: 7 + ((i * 3) % 5),
            height: 9 + ((i * 5) % 6),
          }}
        />
      ))}
    </div>
  );
});
