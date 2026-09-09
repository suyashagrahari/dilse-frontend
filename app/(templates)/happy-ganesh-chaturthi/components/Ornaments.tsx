"use client";

import { memo } from "react";
import { GC } from "./theme";

// ─── Drawn, not photographed ─────────────────────────────────────────────────
//
// Every ornament on this page is an inline SVG. Three reasons, and the third is
// the one that decided it:
//
//   1. They recolour. One gold, one saffron, one leaf green, everywhere, from
//      `theme.ts`. An asset set would need re-exporting to change a tint.
//   2. They scale. The story card exports at 1080px wide and the same thali is
//      64px on a phone. A raster at either size is wrong at the other.
//   3. They export. `html-to-image` rasterises the DOM, and inline SVG comes
//      through the capture exactly as painted. A remote <img> has to be inlined
//      to a data URL first or it taints the canvas; a GIF comes through as
//      whichever frame happened to be up. Anything that appears on the story
//      card therefore HAS to be drawn — see the note at the top of StoryCard.
//
// Anything that animates does so through a class from `ganesh.css`, never an
// inline `animation`, so the reduced-motion block can switch it off in one place
// rather than in a dozen.

interface OrnProps {
  size?: number;
  color?: string;
  className?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// Rules and glyphs
// ═══════════════════════════════════════════════════════════════════════════

/**
 * The gold rule that sits under a heading.
 *
 * Broken in the middle with a small lozenge in the gap: an unbroken rule is a
 * divider, and a broken one with a mark in it reads as an ornament.
 */
export const Rule = memo(function Rule({
  width = 200,
  color = GC.gold,
}: {
  width?: number;
  color?: string;
}) {
  const mid = width / 2;
  return (
    <svg width={width} height="12" viewBox={`0 0 ${width} 12`} aria-hidden>
      <line x1="0" y1="6" x2={mid - 14} y2="6" stroke={color} strokeWidth="1" opacity="0.7" />
      <line x1={mid + 14} y1="6" x2={width} y2="6" stroke={color} strokeWidth="1" opacity="0.7" />
      <path d={`M${mid} 1 L${mid + 7} 6 L${mid} 11 L${mid - 7} 6 Z`} fill={color} />
    </svg>
  );
});

/** One marigold, seen head-on — concentric rings of petals. */
export const Marigold = memo(function Marigold({
  size = 20,
  color = GC.saffron,
}: OrnProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      {[0, 1, 2].map((ring) => {
        const r = 11 - ring * 3.2;
        const petals = 10 - ring * 2;
        return Array.from({ length: petals }, (_, i) => {
          const angle = (i / petals) * Math.PI * 2 + ring * 0.4;
          return (
            <circle
              key={`${ring}-${i}`}
              cx={12 + Math.cos(angle) * r}
              cy={12 + Math.sin(angle) * r}
              r={3.1 - ring * 0.5}
              fill={color}
              opacity={0.7 + ring * 0.14}
            />
          );
        });
      })}
      <circle cx="12" cy="12" r="2.4" fill={GC.goldSoft} />
    </svg>
  );
});

/** One mango leaf, hanging point-down. */
export const Leaf = memo(function Leaf({ size = 22 }: OrnProps) {
  return (
    <svg width={size} height={size * 1.5} viewBox="0 0 20 30" aria-hidden>
      <path d="M10 0 C 3 8 0 17 10 30 C 20 17 17 8 10 0 Z" fill={GC.leaf} />
      {/* The midrib. Without it the leaf is a green teardrop. */}
      <path d="M10 3 L10 27" stroke={GC.leafSoft} strokeWidth="1" opacity="0.75" />
    </svg>
  );
});

/**
 * The garland across the top of the page.
 *
 * ── WHY IT IS ONE STRAND AND NOT A FULL TORAN ───────────────────────────────
 *
 * The first build hung an eleven-piece toran on every one of six screens, with
 * 92px of reserved padding on each. On a single scrolling page that would be one
 * garland at the very top, which is right, and the earlier version's weight is
 * wrong for it: a heavy garland immediately above a large title competes with
 * the title. So it is thinner, lighter, and lives only in the hero.
 */
export const Garland = memo(function Garland({
  pieces = 15,
  /**
   * Hangs from the very top edge of the page.
   *
   * It was at 46px for a while, to clear `.gc-topbar-scrim` — the scrim's job is
   * to fade content passing under the fixed bar, and at first it was fading the
   * garland into a row of faint smudges along with everything else.
   *
   * The fix for that was the z-index below, not the offset: at 195 the garland
   * paints OVER the scrim, so it can hang from 0 and still read at full
   * strength. The bar's own buttons sit at 200 and therefore draw on top of it,
   * which is the right order — a garland hangs behind what is in the doorway,
   * not in front of it.
   */
  top = 0,
}: {
  pieces?: number;
  top?: number;
}) {
  const items = Array.from({ length: pieces }, (_, i) => i);
  const mid = (pieces - 1) / 2;

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        top,
        left: 0,
        right: 0,
        height: 64,
        // Above the scrim (190) — it is decoration and there is nothing here to
        // mistake for a button.
        zIndex: 195,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {/* The string, sagging. A straight line reads as a shelf. */}
      <svg
        width="100%"
        height="26"
        viewBox="0 0 1000 26"
        preserveAspectRatio="none"
        style={{ display: "block" }}
      >
        <path
          d="M0 4 Q 500 24 1000 4"
          fill="none"
          stroke={GC.leaf}
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.85"
        />
      </svg>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          padding: "0 2%",
          marginTop: -6,
        }}
      >
        {items.map((i) => {
          // Follows the string's sag: the middle pieces hang lower.
          const drop = Math.round(14 - (Math.abs(i - mid) / mid) * 12);
          return (
            <div key={i} style={{ marginTop: drop }}>
              {i % 2 === 0 ? <Leaf size={18} /> : <Marigold size={15} />}
            </div>
          );
        })}
      </div>
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// The aarti
// ═══════════════════════════════════════════════════════════════════════════

/**
 * The rays behind the medallion. Long thin gold spokes, alternating length.
 *
 * Turned very slowly by `.gc-rays` — 90 seconds a revolution, which is below the
 * threshold at which motion competes for attention but above the one at which a
 * still image reads as flat.
 */
export const Rays = memo(function Rays({
  size = 520,
  count = 48,
  color = GC.goldSoft,
  className = "gc-rays",
}: {
  /** A CSS length, not a pixel count: the aarti lays this into a square box at
      100% and lets the box decide the size. */
  size?: number | string;
  count?: number;
  color?: string;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      aria-hidden
      style={{ opacity: 0.5 }}
    >
      {Array.from({ length: count }, (_, i) => {
        const long = i % 2 === 0;
        return (
          <line
            key={i}
            x1="100"
            y1={long ? 22 : 34}
            x2="100"
            y2="62"
            stroke={color}
            strokeWidth={long ? 1.5 : 0.8}
            strokeLinecap="round"
            transform={`rotate(${(360 / count) * i} 100 100)`}
          />
        );
      })}
    </svg>
  );
});

/**
 * The ornamental ring that revolves around the murti.
 *
 * ── THE RING TURNS, THE MURTI DOES NOT ──────────────────────────────────────
 *
 * The brief was for the aarti to revolve around a rounded image of Ganesh, and
 * this is the piece that does the revolving. Rotating the murti itself was tried
 * and is wrong: a deity's face tipping past horizontal reads unmistakably as a
 * broken transform rather than as devotion, and at the bottom of the arc it is
 * upside down.
 *
 * So the murti sits still and centred in its medallion, and three things move
 * around it — this ring one way, the rays the other, and the thali orbiting.
 * That is what an aarti actually is: the plate goes round the murti.
 */
export const HaloRing = memo(function HaloRing({
  size = 420,
  color = GC.gold,
}: {
  /** A CSS length — see `Rays`. */
  size?: number | string;
  color?: string;
}) {
  const dashes = 60;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className="gc-halo"
      aria-hidden
    >
      {/* Two concentric hairlines with a dashed band between them. */}
      <circle cx="100" cy="100" r="96" fill="none" stroke={color} strokeWidth="0.6" opacity="0.45" />
      <circle cx="100" cy="100" r="86" fill="none" stroke={color} strokeWidth="0.6" opacity="0.3" />
      {Array.from({ length: dashes }, (_, i) => (
        <line
          key={i}
          x1="100"
          y1="86"
          x2="100"
          y2="96"
          stroke={color}
          strokeWidth={i % 5 === 0 ? 1.4 : 0.7}
          opacity={i % 5 === 0 ? 0.75 : 0.35}
          transform={`rotate(${(360 / dashes) * i} 100 100)`}
        />
      ))}
      {/* Four petals at the quarters, so the ring has an orientation and the
          rotation is legible rather than a uniform blur. */}
      {[0, 90, 180, 270].map((deg) => (
        <ellipse
          key={deg}
          cx="100"
          cy="91"
          rx="4"
          ry="9"
          fill={color}
          opacity="0.5"
          transform={`rotate(${deg} 100 100)`}
        />
      ))}
    </svg>
  );
});

/**
 * The aarti thali — the plate that goes round the murti.
 *
 * Rendered upright; the ORBIT belongs to the caller, which wraps this in
 * `.gc-thali-orbit` and applies `.gc-thali-upright` here so the flame stays
 * vertical all the way round. See the note in `ganesh.css`.
 */
export const Thali = memo(function Thali({ size = 72, className }: OrnProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      aria-hidden
    >
      {/* Plate, seen at a slight angle so it reads as held rather than flat. */}
      <ellipse cx="50" cy="68" rx="38" ry="14" fill={GC.gold} opacity="0.9" />
      <ellipse cx="50" cy="65" rx="38" ry="14" fill={GC.goldSoft} />
      <ellipse cx="50" cy="65" rx="28" ry="9.5" fill={GC.gold} opacity="0.45" />

      {/* Camphor, burning in the middle. */}
      <g className="gc-camphor">
        <circle cx="50" cy="46" r="16" fill={GC.saffronSoft} opacity="0.3" />
        <path d="M50 22 C 58 33 59 41 50 52 C 41 41 42 33 50 22 Z" fill={GC.saffron} />
        <path d="M50 31 C 54 38 54.5 43 50 48 C 45.5 43 46 38 50 31 Z" fill="#FFFBEC" />
      </g>

      {/* Two wicks either side, so the plate is a thali and not a candle. */}
      {[30, 70].map((cx) => (
        <path
          key={cx}
          d={`M${cx} 48 C ${cx + 3.5} 52 ${cx + 4} 56 ${cx} 60 C ${cx - 4} 56 ${cx - 3.5} 52 ${cx} 48 Z`}
          fill={GC.saffronSoft}
        />
      ))}
    </svg>
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// The offerings, and the prasad
// ═══════════════════════════════════════════════════════════════════════════

/** A diya, lit. There is no unlit variant any more — nothing here is a toggle. */
export const Diya = memo(function Diya({ size = 44, className }: OrnProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden>
      <circle cx="24" cy="20" r="14" fill={GC.saffronSoft} opacity="0.22" />
      <g className="gc-flame">
        <path d="M24 8 C 29 15 30 20 24 26 C 18 20 19 15 24 8 Z" fill={GC.saffron} />
        <path d="M24 14 C 26.5 18 27 21 24 24 C 21 21 21.5 18 24 14 Z" fill="#FFFBEC" />
      </g>
      <path d="M8 30 Q 24 44 40 30 Q 36 27 24 27 Q 12 27 8 30 Z" fill={GC.gold} />
      <path d="M8 30 Q 24 34 40 30" fill="none" stroke={GC.goldSoft} strokeWidth="1.4" />
      <ellipse cx="24" cy="29" rx="9" ry="2.2" fill={GC.goldSoft} opacity="0.8" />
    </svg>
  );
});

/** A modak, in profile. The pleats are what make it read as a modak. */
export const Modak = memo(function Modak({ size = 34, className }: OrnProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} aria-hidden>
      <path
        d="M16 2 C 20 10 26 20 26 24 C 26 27.5 21.5 30 16 30 C 10.5 30 6 27.5 6 24 C 6 20 12 10 16 2 Z"
        fill="#FDF6E4"
        stroke={GC.gold}
        strokeWidth="1"
      />
      {[-2.2, -1.1, 0, 1.1, 2.2].map((k, i) => (
        <path
          key={i}
          d={`M16 4 C ${16 + k * 2.4} 13 ${16 + k * 3.6} 20 ${16 + k * 4.2} 26`}
          fill="none"
          stroke={GC.goldSoft}
          strokeWidth="0.85"
        />
      ))}
      <ellipse cx="16" cy="24" rx="10" ry="3" fill={GC.goldSoft} opacity="0.4" />
    </svg>
  );
});

/** Durva — three blades, tied, which is how it is offered. */
export const Durva = memo(function Durva({ size = 34, className }: OrnProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} aria-hidden>
      {[-1, 0, 1].map((k) => (
        <path
          key={k}
          d={`M16 30 C ${16 + k * 7} 20 ${16 + k * 10} 10 ${16 + k * 6} 2`}
          fill="none"
          stroke={k === 0 ? GC.leaf : GC.leafSoft}
          strokeWidth="2"
          strokeLinecap="round"
        />
      ))}
      <path d="M11 27 Q 16 25 21 27" fill="none" stroke={GC.saffron} strokeWidth="1.5" />
    </svg>
  );
});

/** A pinch of vermilion, in its tray. */
export const Kumkum = memo(function Kumkum({ size = 34, className }: OrnProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} aria-hidden>
      <ellipse cx="16" cy="22" rx="12" ry="6.5" fill={GC.goldSoft} />
      <ellipse cx="16" cy="20.5" rx="12" ry="6.5" fill={GC.gold} />
      <ellipse cx="16" cy="19.5" rx="8.5" ry="4.5" fill={GC.maroon} />
      <ellipse cx="14" cy="18" rx="3" ry="1.5" fill="#c0524f" opacity="0.7" />
    </svg>
  );
});

/** A handful of flowers, for the offering of flowers. */
export const Flowers = memo(function Flowers({ size = 34, className }: OrnProps) {
  const clusters = [
    { cx: 11, cy: 13, r: 6.5, c: GC.saffron },
    { cx: 21, cy: 11, r: 5.5, c: GC.goldSoft },
    { cx: 16, cy: 20, r: 6, c: "#D9787A" },
  ];
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} aria-hidden>
      {clusters.map(({ cx, cy, r, c }, i) => (
        <g key={i}>
          {Array.from({ length: 8 }, (_, k) => {
            const angle = (k / 8) * Math.PI * 2;
            return (
              <circle
                key={k}
                cx={cx + Math.cos(angle) * (r * 0.62)}
                cy={cy + Math.sin(angle) * (r * 0.62)}
                r={r * 0.4}
                fill={c}
              />
            );
          })}
          <circle cx={cx} cy={cy} r={r * 0.3} fill="#FFFBEC" />
        </g>
      ))}
    </svg>
  );
});

/** Lamp and incense, together — the fifth offering. */
export const LampIncense = memo(function LampIncense({ size = 34, className }: OrnProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} aria-hidden>
      {[-4, -1, 2].map((dx) => (
        <line
          key={dx}
          x1={20 + dx * 0.5}
          y1="24"
          x2={20 + dx}
          y2="9"
          stroke={GC.ink}
          strokeWidth="1"
          opacity="0.6"
        />
      ))}
      {[-4, -1, 2].map((dx) => (
        <circle key={`e${dx}`} cx={20 + dx} cy="9" r="1.3" fill={GC.saffron} />
      ))}
      <path d="M4 22 Q 12 30 20 22 Q 18 20 12 20 Q 6 20 4 22 Z" fill={GC.gold} />
      <g className="gc-flame">
        <path d="M12 8 C 15 13 15.5 17 12 20 C 8.5 17 9 13 12 8 Z" fill={GC.saffron} />
      </g>
    </svg>
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// Frames
// ═══════════════════════════════════════════════════════════════════════════

/**
 * A round, gold-ringed frame. The one place the sender's photograph appears.
 *
 * ── WHY ROUND, AND WHY IT IS THE ONLY FRAME ─────────────────────────────────
 *
 * The first build clipped the photo into a temple arch with a CSS `clip-path:
 * path()`, and put it beside the murti on a coloured mandap wall. Two problems.
 * The arch shape read as a shrine, and a photograph of living people in a shrine
 * frame beside an idol reads, unmistakably, as a memorial. And the path had to
 * be computed in pixels for every size, because `path()` does not accept
 * percentages — a mistake that fails silently, dropping the whole declaration
 * and rendering a plain rectangle that looks like a choice.
 *
 * A circle has neither problem: `border-radius: 50%` needs no geometry, works at
 * every size, survives the story-card rasteriser, and reads as a portrait.
 */
export function RoundFrame({
  size,
  children,
  ring = GC.gold,
  background = GC.paperDeep,
}: {
  /**
   * A CSS length. `"100%"` lets the caller's own box decide, which is how the
   * portrait scales continuously off the viewport instead of jumping at a
   * breakpoint — the caller sets an `aspect-ratio: 1` wrapper and this fills it.
   */
  size: number | string;
  children?: React.ReactNode;
  ring?: string;
  background?: string;
}) {
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      {/* Two rings with a gap, rather than one thick border: a single 6px gold
          border reads as a sticker, two hairlines read as a mount. */}
      <div
        style={{
          position: "absolute",
          inset: -14,
          borderRadius: "50%",
          border: `1px solid ${ring}`,
          opacity: 0.45,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: -6,
          borderRadius: "50%",
          border: `1.5px solid ${ring}`,
          opacity: 0.85,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background,
          overflow: "hidden",
          boxShadow: "inset 0 2px 14px rgba(46,33,25,0.14)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * A slow, endless drift of marigold petals, in the hero only.
 *
 * ── EVERY NUMBER HERE IS DETERMINISTIC *AND* ROUNDED, AND BOTH MATTER ───────
 *
 * `seed` drives a cheap sine hash rather than `Math.random()` per petal, because
 * a random position chosen during render differs between the server pass and the
 * client pass, and React's response to a mismatch is to throw the server HTML
 * away. That much is the obvious half.
 *
 * The half that actually bit: even with identical inputs, React's SERVER
 * serialiser rounds a float in an inline style to about six significant figures
 * while the client keeps the full double. So `left: 9.067112162649954%` was
 * emitted into the HTML as `left:9.06711%` and compared against the unrounded
 * value on hydration — a mismatch on every petal, from arithmetic that was
 * already perfectly deterministic. It cost the whole hero's server HTML, and the
 * only symptom was a hydration warning naming `<span className="gc-petal">`.
 *
 * Hence `fix()`. Every derived number is rounded HERE, in the component, so both
 * passes compare strings produced the same way. Two decimal places is far more
 * precision than a drifting petal needs.
 *
 * Nothing here is a security boundary — the hash only has to look unpatterned
 * and be identical on both renders.
 */
export const PetalFall = memo(function PetalFall({
  count = 14,
  seed = 7,
}: {
  count?: number;
  seed?: number;
}) {
  /** Rounded so the server's serialiser and the client's value agree exactly. */
  const fix = (n: number) => Math.round(n * 100) / 100;

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      {Array.from({ length: count }, (_, i) => {
        const r = (n: number) => (Math.sin((i + 1) * seed * n) + 1) / 2;
        const w = fix(6 + r(1.7) * 7);
        return (
          <span
            key={i}
            className="gc-petal"
            style={{
              left: `${fix(r(2.3) * 96)}%`,
              // Strings with units rather than bare numbers: React appends `px`
              // to a unitless number on both passes, but being explicit removes
              // one more thing the two could disagree about.
              width: `${w}px`,
              height: `${fix(w * 0.66)}px`,
              background: r(3.1) > 0.5 ? GC.saffronSoft : GC.goldSoft,
              opacity: 0.7,
              animationDelay: `${fix(r(4.7) * 9)}s`,
              animationDuration: `${fix(7 + r(5.3) * 5)}s`,
            }}
          />
        );
      })}
    </div>
  );
});
