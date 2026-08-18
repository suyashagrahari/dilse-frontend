"use client";

import { memo, type ReactNode } from "react";
import { RS } from "./theme";

// ─── Ornaments ───────────────────────────────────────────────────────────────
//
// The decorative layer, all inline SVG and CSS. Nothing here is an emoji and
// nothing is a raster asset — these scale to any density, take the palette from
// `theme.ts`, and cost no network request.
//
// ── WHY THIS FILE MATTERS MORE HERE THAN ON THE BROTHER TEMPLATE ─────────────
//
// The brother template hung its identity on five GIFs in `public/rakhi-demo`. This
// one ships no artwork at all: the S3 bucket those GIFs came from died with its AWS
// account once already, and a template whose whole look depends on a raster file
// on someone else's disk is a template that can silently turn into a page of text.
// So everything visual on these seven screens is drawn here. If this file is thin,
// the template looks unfinished — that is the trade being made, deliberately.
//
// ── DELIBERATELY NOT THE BROTHER'S DRAWINGS ─────────────────────────────────
//
// Same festival, adjacent slug, and a family will have both open on one phone
// within the hour. Its toran is a sagging rope with blooms and mango leaves
// dangling off it; this one is a scalloped cloth bandhanwar with the blooms sewn
// into the scallops, so the two read as different objects at a glance and not as
// the first page having reloaded. Same reasoning as the palette split in theme.ts.
//
// ── COST ────────────────────────────────────────────────────────────────────
//
// Everything is `memo`'d, every animation is a `transform`/`opacity` keyframe in
// sister.css, and there is no `filter: blur()` anywhere — a large blurred layer is
// the single most reliable way to drop a mid-range Android below 60fps, and it is
// never worth what it buys. Nothing here reads layout, so nothing here can force a
// reflow per frame.
//
// Motion lives in sister.css so `prefers-reduced-motion` can switch the whole set
// off in one place.
//
// ── ACCESSIBILITY ───────────────────────────────────────────────────────────
//
// All of it is `aria-hidden` except `Seal`, which wraps real content. A screen
// reader announcing "marigold, marigold, marigold, tassel" before the actual
// message would make the page worse for the person relying on it.

/**
 * Round any trig result before it reaches an SVG attribute.
 *
 * `Math.sin` and `Math.cos` are implementation-defined in the last bit, and the
 * server's Node is not running the same V8 as the visitor's browser. Left raw, a
 * petal serialised as cx="16.246711095625894" on the server and 16.24671109562589
 * on the client; React reads that as a hydration mismatch and discards the
 * server-rendered HTML for the whole subtree — which on this template means the
 * page arrives, blanks, and re-renders.
 *
 * Three decimals is well under a tenth of a pixel at every size these are drawn
 * at, so nothing visibly moves. EVERY trig value that becomes an attribute in this
 * file must go through here.
 */
const round3 = (n: number): number => Math.round(n * 1000) / 1000;

/**
 * Deterministic jitter. `Math.random()` would re-roll between the server render
 * and hydration, which is the same mismatch as above with a worse failure mode:
 * it only shows up under SSR, so it looks like an intermittent flicker.
 */
function wobble(i: number, spread: number): number {
  const seq = [0.31, -0.77, 0.52, -0.18, 0.91, -0.44, 0.66, -0.95, 0.12, -0.61, 0.83, -0.29];
  return seq[i % seq.length] * spread;
}

// ── The bloom, drawn once ────────────────────────────────────────────────────
//
// A marigold is three concentric rings of petals and a dense centre. It appears in
// the toran, in the petal fall's source, on the tray and on the story card, so it
// is one drawing used four times rather than four drawings that drift apart.
//
// The gradient ids are derived from the colours, so two blooms with the same
// colours share one definition and two with different colours cannot collide. They
// are intentionally NOT unique-per-instance: a random id per render is another
// hydration mismatch, and a counter is module state that resets differently on the
// server than in the browser.

type BloomTone = "haldi" | "rani";

const TONES: Record<BloomTone, { lip: string; mid: string; rim: string; eye: string }> = {
  haldi: { lip: RS.haldiSoft, mid: RS.haldi, rim: RS.brass, eye: RS.rani },
  rani: { lip: RS.raniSoft, mid: RS.rani, rim: RS.raniDeep, eye: RS.haldi },
};

function BloomDefs({ tone }: { tone: BloomTone }) {
  const t = TONES[tone];
  return (
    <defs>
      <radialGradient id={`rs-bloom-${tone}`} cx="38%" cy="34%">
        <stop offset="0%" stopColor={t.lip} />
        <stop offset="55%" stopColor={t.mid} />
        <stop offset="100%" stopColor={t.rim} />
      </radialGradient>
    </defs>
  );
}

/**
 * The petals and centre, in the caller's coordinate space, so this can be dropped
 * into any viewBox — a 26-unit dangler or a 60-unit tray charm — without a nested
 * `<svg>` and its extra layout box.
 */
function BloomBody({ cx, cy, r, tone }: { cx: number; cy: number; r: number; tone: BloomTone }) {
  const fill = `url(#rs-bloom-${tone})`;
  const t = TONES[tone];
  return (
    <g>
      {/* outer ring — long petals, the silhouette */}
      {Array.from({ length: 12 }).map((_, i) => {
        const ang = (i / 12) * Math.PI * 2;
        const px = round3(cx + Math.cos(ang) * r * 0.5);
        const py = round3(cy + Math.sin(ang) * r * 0.5);
        return (
          <ellipse
            key={`o${i}`}
            cx={px}
            cy={py}
            rx={round3(r * 0.46)}
            ry={round3(r * 0.3)}
            transform={`rotate(${round3((i / 12) * 360)} ${px} ${py})`}
            fill={fill}
            opacity={0.95}
          />
        );
      })}
      {/* inner ring, offset half a step so the petals interleave rather than
          lining up into spokes */}
      {Array.from({ length: 8 }).map((_, i) => {
        const ang = ((i + 0.5) / 8) * Math.PI * 2;
        const px = round3(cx + Math.cos(ang) * r * 0.26);
        const py = round3(cy + Math.sin(ang) * r * 0.26);
        return (
          <ellipse
            key={`i${i}`}
            cx={px}
            cy={py}
            rx={round3(r * 0.3)}
            ry={round3(r * 0.22)}
            transform={`rotate(${round3(((i + 0.5) / 8) * 360)} ${px} ${py})`}
            fill={fill}
          />
        );
      })}
      <circle cx={cx} cy={cy} r={round3(r * 0.2)} fill={t.eye} opacity={0.85} />
    </g>
  );
}

/**
 * A single marigold, reusable at any size. `tone` picks haldi (the default, the
 * flower of the festival) or rani (used sparingly, to mark the one bloom that
 * belongs to a chosen rakhi).
 */
export const Marigold = memo(function Marigold({
  size = 34,
  tone = "haldi",
  spin = false,
}: {
  size?: number;
  tone?: BloomTone;
  /** Slow 18s rotation. Off by default: a flower that turns is a curiosity once
      and a distraction every time after. */
  spin?: boolean;
}) {
  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox="0 0 40 40"
      className={spin ? "rs-spin" : undefined}
      style={{ display: "block", overflow: "visible" }}
    >
      <BloomDefs tone={tone} />
      <BloomBody cx={20} cy={20} r={18} tone={tone} />
    </svg>
  );
});

// ── Toran ────────────────────────────────────────────────────────────────────
//
// The bandhanwar nailed across a doorway. Here it hangs across the top of every
// screen, which is the same gesture: you are entering somewhere.
//
// ── WHY IT IS TWO LAYERS AND NOT ONE SVG ────────────────────────────────────
//
// The obvious build is one `<svg viewBox="0 0 420 92" preserveAspectRatio="none">`.
// That is what the brother template does, and it is fine there because that stage
// is 420px wide on a phone. From 1024px up the stage opens to the full window, and
// `none` stretches x by width/420 while leaving y alone — so on a 1440px laptop
// every round marigold becomes a 3.4:1 ellipse. Nobody files that bug; the page
// just looks slightly wrong.
//
// So the cloth — a scalloped band, which can stretch to any width without looking
// like anything other than wider cloth — is the one stretched SVG, and the blooms
// and tassels are separate fixed-size SVGs laid out in a flex row. Each keeps its
// aspect ratio at every width, and the row simply spaces them further apart on a
// wide window, which is what a real garland does.
//
// The cloth does not sway; the danglers do. A valance pinned at both ends cannot
// move, and animating it would give away that this is a drawing.

export const Toran = memo(function Toran({ count = 9 }: { count?: number }) {
  const W = 420;
  const BAND = 24;
  const scallops = 7;
  const step = W / scallops;

  // Drawn right-to-left along y = BAND so the path can close back to the origin
  // and fill as one piece of cloth.
  const scallop = `q ${round3(-step / 2)} 17 ${round3(-step)} 0 `;
  const cloth = `M0 0 H${W} V${BAND} ${scallop.repeat(scallops)}Z`;

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: 92,
        pointerEvents: "none",
        zIndex: 2,
      }}
    >
      <svg
        viewBox={`0 0 ${W} 46`}
        preserveAspectRatio="none"
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 46 }}
      >
        <defs>
          <linearGradient id="rs-cloth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={RS.rani} />
            <stop offset="100%" stopColor={RS.raniDeep} />
          </linearGradient>
        </defs>
        <path d={cloth} fill="url(#rs-cloth)" />
        {/* Brass piping along the scalloped hem — the single most recognisable move
            in Indian print ornament, and one path. It starts at the RIGHT edge
            because the scallop segment steps leftwards (negative dx), which is
            what lets the cloth above close back to the origin in one path. */}
        <path
          d={`M${W} ${BAND} ${scallop.repeat(scallops)}`}
          fill="none"
          stroke={RS.brass}
          strokeWidth={1.6}
          opacity={0.9}
        />
        {/* A second hairline inset into the cloth reads as a stitched seam. */}
        <line x1="0" y1="5.5" x2={W} y2="5.5" stroke={RS.brassSoft} strokeWidth="1" opacity={0.55} />
      </svg>

      <div
        style={{
          position: "absolute",
          top: BAND + 8,
          left: "4%",
          right: "4%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        {Array.from({ length: count }).map((_, i) => (
          <Dangler key={i} index={i} />
        ))}
      </div>
    </div>
  );
});

/**
 * One hanging unit: a thread, then either a bloom or a pair of leaves with a
 * tassel. Alternating them is what keeps a nine-item row from reading as a
 * repeating texture, and the drop length wobbles so the row is not a ruled line.
 *
 * `transform-origin` is the top of the thread, so the sway pivots where the thread
 * is pinned to the cloth rather than around the middle of its own box.
 */
const Dangler = memo(function Dangler({ index }: { index: number }) {
  const bloom = index % 2 === 0;
  const drop = round3((bloom ? 12 : 20) + wobble(index, 5));
  const H = 60;

  return (
    <svg
      width={26}
      height={H}
      viewBox={`0 0 26 ${H}`}
      className="rs-toran-item"
      style={{
        display: "block",
        overflow: "visible",
        transformOrigin: "13px 0px",
        animationDelay: `${(index % 5) * 0.4}s`,
      }}
    >
      <BloomDefs tone={index % 4 === 1 ? "rani" : "haldi"} />
      <defs>
        <linearGradient id="rs-leaf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={RS.mehendi} stopOpacity={0.75} />
          <stop offset="100%" stopColor={RS.mehendi} />
        </linearGradient>
      </defs>

      <line x1="13" y1="0" x2="13" y2={drop} stroke={RS.brass} strokeWidth={1.1} opacity={0.65} />

      {bloom ? (
        <BloomBody cx={13} cy={drop + 9} r={9} tone={index % 4 === 1 ? "rani" : "haldi"} />
      ) : (
        <>
          {/* two leaves, mirrored around the thread */}
          <path d={`M13 ${drop} q -8 9 -1 21 q 7 -12 1 -21 z`} fill="url(#rs-leaf)" />
          <path d={`M13 ${drop} q 8 9 1 21 q -7 -12 -1 -21 z`} fill="url(#rs-leaf)" opacity={0.85} />
          {/* a short haldi tassel below them */}
          <line
            x1="13"
            y1={drop + 21}
            x2="13"
            y2={drop + 29}
            stroke={RS.haldi}
            strokeWidth={2.4}
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
});

// ── Rangoli ──────────────────────────────────────────────────────────────────
//
// The soft motif for Stage's `behind` slot. The brother's is a line drawing —
// stroked ellipses and dashed rings. This one is FILLED and soft-edged: a radial
// wash under two rings of solid petals, which is the difference between a chalk
// mandala and a flower rangoli, and it is legible at 6% where hairlines are not.
//
// Kept very low contrast on purpose. It is a texture, not a picture; at full
// strength it fights every word on top of it, and this template's words are the
// product.

export const Rangoli = memo(function Rangoli({
  size = 340,
  opacity = 0.09,
  petals = 14,
  still = false,
}: {
  size?: number;
  opacity?: number;
  petals?: number;
  /**
   * Drop the rotation. Required inside the story card: html-to-image serialises
   * the computed transform of whatever it paints, so an element caught
   * mid-rotation bakes a crooked mandala into the PNG. Nothing in an export node
   * may animate.
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
      className={still ? undefined : "rs-rangoli"}
    >
      <defs>
        <radialGradient id="rs-rangoli-wash" cx="50%" cy="50%">
          <stop offset="0%" stopColor={RS.haldi} stopOpacity={0.9} />
          <stop offset="60%" stopColor={RS.rani} stopOpacity={0.45} />
          <stop offset="100%" stopColor={RS.rani} stopOpacity={0} />
        </radialGradient>
      </defs>

      <circle cx={c} cy={c} r={c * 0.98} fill="url(#rs-rangoli-wash)" />

      {/* outer petal ring, filled */}
      {Array.from({ length: petals }).map((_, i) => (
        <ellipse
          key={`p${i}`}
          cx={c}
          cy={round3(c * 0.42)}
          rx={round3(c * 0.13)}
          ry={round3(c * 0.36)}
          transform={`rotate(${round3((i / petals) * 360)} ${c} ${c})`}
          fill={RS.rani}
          opacity={0.5}
        />
      ))}

      {/* inner ring, offset half a step and haldi, so the two rings read as two
          rows of flowers instead of one thicker one */}
      {Array.from({ length: petals }).map((_, i) => (
        <ellipse
          key={`q${i}`}
          cx={c}
          cy={round3(c * 0.68)}
          rx={round3(c * 0.09)}
          ry={round3(c * 0.2)}
          transform={`rotate(${round3(((i + 0.5) / petals) * 360)} ${c} ${c})`}
          fill={RS.haldi}
          opacity={0.6}
        />
      ))}

      <circle cx={c} cy={c} r={round3(c * 0.2)} fill={RS.rani} opacity={0.45} />
      <circle
        cx={c}
        cy={c}
        r={round3(c * 0.9)}
        fill="none"
        stroke={RS.brass}
        strokeWidth={1.2}
        strokeDasharray="2 9"
        opacity={0.8}
      />
    </svg>
  );
});

// ── Thread rule ──────────────────────────────────────────────────────────────

/**
 * An ornamental divider drawn as a twisted two-ply thread — the rakhi itself,
 * used as punctuation between blocks of his writing.
 *
 * Two sine paths in antiphase read as two plies twisted together; a single wave
 * reads as a squiggle. The knot in the middle stops it from looking like a border
 * and makes it look like a length of thread laid on the page.
 */
export const ThreadRule = memo(function ThreadRule({
  width = 220,
  colorA = RS.rani,
  colorB = RS.haldi,
  knot = true,
}: {
  width?: number;
  colorA?: string;
  colorB?: string;
  /** The bead at the centre. Off for the tight rules inside a document. */
  knot?: boolean;
}) {
  // `ceil`, not `floor`. One full cycle is 14 units, and flooring draws only the
  // whole cycles that fit — at width 180 that is 12 cycles, 168 units, leaving the
  // thread visibly stopping short of the end of its own box and reading as a
  // half-drawn rule. Rounding up overshoots instead and the viewBox clips the
  // overhang, so the weave runs edge to edge at any width.
  const cycles = Math.max(1, Math.ceil(width / 14));
  const over = `M0 8 ${"q 3.5 -5 7 0 q 3.5 5 7 0 ".repeat(cycles)}`;
  const under = `M0 8 ${"q 3.5 5 7 0 q 3.5 -5 7 0 ".repeat(cycles)}`;
  const mid = round3(width / 2);

  return (
    <svg
      aria-hidden
      width={width}
      height="16"
      viewBox={`0 0 ${width} 16`}
      style={{ display: "block", maxWidth: "100%" }}
    >
      <path d={over} fill="none" stroke={colorA} strokeWidth="2.2" strokeLinecap="round" />
      <path d={under} fill="none" stroke={colorB} strokeWidth="2.2" strokeLinecap="round" opacity={0.95} />
      {knot && (
        <>
          <circle cx={mid} cy="8" r="4.6" fill={RS.brass} />
          <circle cx={mid} cy="8" r="2.1" fill={RS.surface} opacity={0.85} />
        </>
      )}
      {/* tapered ends, so the thread stops rather than being cut off */}
      <circle cx="1.4" cy="8" r="1.6" fill={colorA} />
      <circle cx={round3(width - 1.4)} cy="8" r="1.6" fill={colorB} />
    </svg>
  );
});

// ── Seal ─────────────────────────────────────────────────────────────────────
//
// The wax roundel the vow certificate sits its signature on, and the CLOSED stamp
// on the complaint register. A vow with a signature and no seal reads as a form
// field; the seal is what makes the certificate look like a document somebody
// meant.
//
// ── WHY THE LABEL IS HTML AND NOT <text> ────────────────────────────────────
//
// The wax is SVG and the words inside it are a real DOM node. `<text>` would put
// the label inside the drawing, which sounds tidier, but SVG text does not wrap,
// does not take the root layout's font variables reliably across engines, and
// cannot be read by a screen reader in any useful order. So the wax is an
// aria-hidden layer and whatever the caller passes stays in the document as
// content — which matters, because on the vow screen the seal carries `vowSince`,
// and a year is information, not decoration.

export const Seal = memo(function Seal({
  size = 96,
  color = RS.rani,
  children,
  text,
  stamped = false,
  className,
}: {
  size?: number;
  /** Rani for the vow, mehendi for "signed". Both are meaningful in this template
      and neither is a default worth guessing at. */
  color?: string;
  children?: ReactNode;
  /** Convenience for the common case of two or three words. Ignored if `children`
      is given, so a caller cannot accidentally render both. */
  text?: string;
  /** Play the one-shot stamp-down. The caller mounts this at the moment the seal
      lands; sister.css pins it to its end state under reduced motion. */
  stamped?: boolean;
  className?: string;
}) {
  // A wax blob is a circle whose edge lost the argument with gravity. 20 lobes
  // with a deterministic radius wobble gives an edge that is clearly not a circle
  // but has no single feature you would call a mistake.
  const lobes = 20;
  const c = 50;
  const pts = Array.from({ length: lobes }).map((_, i) => {
    const ang = (i / lobes) * Math.PI * 2;
    const r = 44 + wobble(i, 2.6);
    return `${round3(c + Math.cos(ang) * r)} ${round3(c + Math.sin(ang) * r)}`;
  });
  const wax = `M${pts.join(" L")} Z`;

  return (
    <div
      className={[stamped ? "rs-stamp" : "", className || ""].filter(Boolean).join(" ")}
      style={{
        position: "relative",
        width: size,
        height: size,
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
      }}
    >
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        <path d={wax} fill={color} />
        {/* The pressed rim: a lighter inner ring and a dashed inset, which is what
            a stamp pressed into wax actually leaves. */}
        <circle cx={c} cy={c} r={38} fill="none" stroke={RS.surface} strokeWidth={1.6} opacity={0.55} />
        <circle
          cx={c}
          cy={c}
          r={31}
          fill="none"
          stroke={RS.surface}
          strokeWidth={1}
          strokeDasharray="2 5"
          opacity={0.45}
        />
        {/* One highlight where the light would catch the raised edge. A gradient
            here instead would be a third def for a 4px effect. */}
        <path
          d={`M22 30 Q50 14 78 30`}
          fill="none"
          stroke={RS.surface}
          strokeWidth={2}
          opacity={0.22}
          strokeLinecap="round"
        />
      </svg>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: size * 0.62,
          textAlign: "center",
          color: RS.surface,
          fontSize: Math.max(9, Math.round(size * 0.13)),
          lineHeight: 1.15,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {children ?? text}
      </div>
    </div>
  );
});

// ── Petal fall ───────────────────────────────────────────────────────────────
//
// One-shot. Mounted on a payoff moment — the knot cinching, the lifafa opening —
// and unmounted by the caller. It does not loop.
//
// ── WHY SPANS AND NOT SVG ───────────────────────────────────────────────────
//
// Sixteen `<span>`s with an asymmetric border-radius are sixteen composited layers
// the GPU can carry on its own. Sixteen SVG nodes animating inside one root drag
// the whole SVG's rasterisation along with them, on the phone where this matters
// most. The petals are 8px of colour; they do not need to be shapes.
//
// ── WHY REDUCED MOTION IS HANDLED IN CSS, NOT HERE ──────────────────────────
//
// The tempting version reads `matchMedia("(prefers-reduced-motion)")` and returns
// null. That value does not exist during the server render, so it either renders
// petals the client then removes — a flash of exactly the motion we were avoiding
// — or trips a hydration mismatch. `.rs-petal { display: none }` inside the media
// query switches them off before the first paint, for free.

export const PetalFall = memo(function PetalFall({
  count = 16,
  zIndex = 5,
}: {
  count?: number;
  /** Above the artwork but below any modal. Raise it only if the caller's own
      stacking context makes 5 wrong. */
  zIndex?: number;
}) {
  const tones = [RS.haldi, RS.rani, RS.haldiSoft, RS.raniSoft];
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="rs-petal"
          style={{
            // A prime stride so the columns do not settle into visible bands.
            left: `${4 + ((i * 89) % 90)}%`,
            animationDelay: `${(i % 6) * 0.12}s`,
            background: tones[i % tones.length],
            width: 7 + ((i * 3) % 5),
            height: 9 + ((i * 5) % 6),
            opacity: 0.9,
          }}
        />
      ))}
    </div>
  );
});
