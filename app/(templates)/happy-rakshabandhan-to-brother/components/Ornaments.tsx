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

/**
 * Round any trig result before it reaches an SVG attribute.
 *
 * `Math.sin` and `Math.cos` are implementation-defined in the last bit, and the
 * server's Node is not running the same V8 as the visitor's browser. Left raw,
 * a petal serialised as cx="16.246711095625894" on the server and
 * 16.24671109562589 on the client; React reads that as a hydration mismatch and
 * discards the server-rendered HTML for the whole subtree.
 *
 * Three decimals is well under a tenth of a pixel at every size these are drawn
 * at, so nothing visibly moves. EVERY trig value that becomes an attribute in
 * this file must go through here.
 */
const round3 = (n: number): number => Math.round(n * 1000) / 1000;

// ── Toran ────────────────────────────────────────────────────────────────────
//
// The marigold-and-mango-leaf garland hung across a doorway. Here it hangs
// across the top of the screen, which is the same gesture: you are entering
// somewhere.

export const Toran = memo(function Toran({ count = 11 }: { count?: number }) {
  const W = 420;
  const step = W / (count - 1);
  // Catenary-ish: the rope sags in the middle.
  const sag = (x: number) => round3(14 + 26 * Math.sin((x / W) * Math.PI));

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
                      cx={round3(x + Math.cos(ang) * r * 0.55)}
                      cy={round3(y + drop + 8 + Math.sin(ang) * r * 0.55)}
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
      {/* ── petal ring ──
       *
       * The coordinates are ROUNDED, and that is a correctness fix rather than
       * tidiness. `Math.sin`/`Math.cos` are implementation-defined to the last
       * bit, and the server's Node and the visitor's Chrome do not run the same
       * V8. Unrounded, petal 6 serialised as cx="16.246711095625894" on the
       * server and 16.24671109562589 on the client — React saw the attributes
       * disagree, called it a hydration mismatch, and threw away the server HTML
       * for the entire subtree.
       *
       * Three decimals is ~0.005px at the largest size this is ever drawn (104px
       * from a 60-unit viewBox), so nothing moves; it just stops the last bit of
       * a float deciding whether SSR survives. */}
      {Array.from({ length: 10 }).map((_, i) => {
        const ang = (i / 10) * Math.PI * 2;
        const cx = round3(30 + Math.cos(ang) * 17);
        const cy = round3(30 + Math.sin(ang) * 17);
        return (
          <ellipse
            key={i}
            cx={cx}
            cy={cy}
            rx={7.5}
            ry={5.5}
            fill={`url(#rb-tw-${id})`}
            transform={`rotate(${(i / 10) * 360} ${cx} ${cy})`}
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
  //
  // `ceil`, not `floor`. One full cycle is 14 units, and flooring drew only the
  // whole cycles that fit — at width 180 that is 12 cycles, 168 units, leaving
  // the thread visibly stopping short of the end of its own box and reading as
  // a half-drawn rule. Rounding up overshoots instead, and the SVG viewBox
  // clips the overhang, so the weave now always runs edge to edge at any width.
  const cycles = Math.max(1, Math.ceil(width / 14));
  const over = `M0 7 ${"q 3.5 -5 7 0 q 3.5 5 7 0 ".repeat(cycles)}`;
  const under = `M0 7 ${"q 3.5 5 7 0 q 3.5 -5 7 0 ".repeat(cycles)}`;

  return (
    <svg aria-hidden width={width} height="14" viewBox={`0 0 ${width} 14`} style={{ display: "block" }}>
      <path d={over} fill="none" stroke={colorA} strokeWidth="2.2" strokeLinecap="round" />
      <path d={under} fill="none" stroke={colorB} strokeWidth="2.2" strokeLinecap="round" opacity={0.95} />
    </svg>
  );
});

// ── Corner floret ────────────────────────────────────────────────────────────
//
// The quarter-lotus that sits in each corner of an OrnateCard. Drawn once and
// rotated four times rather than drawn four ways, so the four corners cannot
// drift apart when someone edits one of them.

const CornerFloret = memo(function CornerFloret({
  size = 26,
  color = RB.brass,
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 26 26" fill="none">
      <path d="M0 1h9" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
      <path d="M1 0v9" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
      {/* the petal fan, opening into the card */}
      <path
        d="M2 2c7 0 13 5 13 12"
        stroke={color}
        strokeWidth={1}
        strokeLinecap="round"
        opacity={0.75}
      />
      <path
        d="M2 2c11 0 19 8 19 19"
        stroke={color}
        strokeWidth={0.8}
        strokeLinecap="round"
        opacity={0.45}
      />
      <circle cx={4.5} cy={4.5} r={1.7} fill={color} opacity={0.85} />
    </svg>
  );
});

// ── Ornate card ──────────────────────────────────────────────────────────────
//
// The ritual's whole visual weight now sits here, because the ritual no longer
// shows artwork until the reader taps — see RitualScreen. So this cannot be a
// plain rounded rectangle with a border; it has to carry the page on its own.
//
// Four cheap layers do it, all drawn rather than loaded:
//
//   a warm paper fill with a soft inner highlight, so it reads as card stock
//   a brass double rule — heavy outer, hairline inset — which is the single
//     most recognisable move in Indian print ornament
//   a quarter-lotus in each corner
//   a very faint mandala centred behind the text
//
// Nothing here animates. It is a frame, and a frame that moves is a distraction
// from the words inside it.

export const OrnateCard = memo(function OrnateCard({
  children,
  accent = RB.brass,
  className,
}: {
  children: React.ReactNode;
  accent?: string;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: "100%",
        padding: "26px 24px 24px",
        borderRadius: 20,
        background: `linear-gradient(168deg, ${RB.surface} 0%, #fffaf0 55%, ${RB.paperDeep} 100%)`,
        border: `2px solid ${accent}`,
        boxShadow: "0 14px 34px rgba(61,35,23,0.13), inset 0 1px 0 rgba(255,255,255,0.85)",
        overflow: "hidden",
      }}
    >
      {/* hairline inset rule */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: 7,
          borderRadius: 14,
          border: `1px solid ${accent}`,
          opacity: 0.42,
          pointerEvents: "none",
        }}
      />

      {/* mandala watermark, behind everything */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          pointerEvents: "none",
        }}
      >
        <Rangoli size={260} opacity={0.05} petals={18} still />
      </span>

      {/* four corners, one drawing */}
      {(
        [
          { top: 10, left: 10, deg: 0 },
          { top: 10, right: 10, deg: 90 },
          { bottom: 10, right: 10, deg: 180 },
          { bottom: 10, left: 10, deg: 270 },
        ] as const
      ).map((pos, i) => {
        const { deg, ...offset } = pos;
        return (
          <span
            key={i}
            aria-hidden
            style={{
              position: "absolute",
              ...offset,
              lineHeight: 0,
              transform: `rotate(${deg}deg)`,
              pointerEvents: "none",
            }}
          >
            <CornerFloret color={accent} />
          </span>
        );
      })}

      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
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
