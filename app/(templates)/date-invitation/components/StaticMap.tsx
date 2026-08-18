"use client";

// ─── The stylised map, and the place block it lives in ───────────────────────
//
// AGENT 2. Consumed by the countdown (the meeting point) and by the live
// itinerary (the current stop).
//
// THERE IS NO MAP HERE, and that is the point. No Google Maps JavaScript API,
// no Leaflet, no tile server, no <iframe>, no remote image of any kind — an
// embedded map is billed per load, pulls megabytes down the patchy mobile data
// they are standing outside on, and drops a screenshot of the internet into the
// middle of a handmade card. What we draw instead is a *sketch* of a place:
// cream paper, lighter streets, a block of park, one accent pin, on the same
// paper as the rest of the invitation.
//
// It is decorative and it is not geographically true. It IS deterministic —
// every coordinate below comes from `@/lib/seededRandom` keyed off `seed`, so
// the same place draws the same streets on every render, on every device and in
// the exported PNG. `Math.random()` would rebuild the city on every tick of the
// countdown.
//
// COORDS: `hasCoords(p)`, never a truthiness check on `lat`. Zero is a real
// latitude and it is also the frozen contract's "not supplied" sentinel, so
// `if (p.lat)` would hide the map for anyone on the equator and show an empty
// one for everybody with no coordinates at all. No coords → no map, no
// Directions, address as plain text with a copy button.

import { useCallback, useId, useMemo, useState } from "react";

import { rngFrom } from "@/lib/seededRandom";
import { directionsUrl, hasCoords, type GeoPoint } from "./types";
import {
  ACCENT,
  ACCENT_EDGE,
  ACCENT_WASH,
  CARD_RADIUS,
  DONE,
  INK,
  INK_FAINT,
  INK_SOFT,
  PAPER,
  PAPER_DEEP,
  PAPER_EDGE,
  SERIF,
  TAP,
} from "./dateTheme";

// ─── Clipboard ───────────────────────────────────────────────────────────────

/**
 * Best-effort copy. Exported because the share-plan sheet needs the same three
 * fallbacks and two copies of this would drift. Resolves false rather than
 * throwing — a copy button that explodes is worse than one that says nothing.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Permissions policy, insecure context, or the user said no. Try the old way.
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-1000px";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

// ─── The generated street plan ───────────────────────────────────────────────

/** The drawing surface. Rendered with `slice`, so the aspect ratio is free. */
const VB_W = 360;
const VB_H = 160;
const CX = VB_W / 2;
const CY = VB_H / 2;

interface Seg {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  major: boolean;
}
interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}
interface MapPlan {
  /** The whole street grid is tipped a few degrees. Nothing real is axis-aligned. */
  angle: number;
  roads: Seg[];
  blocks: Box[];
  parks: Box[];
  river: string;
  pin: { x: number; y: number };
}

/** Rotate a point about the map centre. Used to place the pin inside the grid's frame. */
function unrotate(x: number, y: number, deg: number): { x: number; y: number } {
  const r = (-deg * Math.PI) / 180;
  const dx = x - CX;
  const dy = y - CY;
  return { x: CX + dx * Math.cos(r) - dy * Math.sin(r), y: CY + dx * Math.sin(r) + dy * Math.cos(r) };
}

function buildPlan(seed: string): MapPlan {
  const rnd = rngFrom(`static-map:${seed}`);
  const nb = (a: number, b: number) => a + rnd() * (b - a);
  const wobble = () => nb(-1.7, 1.7);

  const angle = nb(-12, 12);

  // The grid is generated well outside the frame so that tipping it does not
  // leave bare corners.
  const PAD = 180;
  const X0 = -PAD;
  const X1 = VB_W + PAD;
  const Y0 = -PAD;
  const Y1 = VB_H + PAD;

  const hs: number[] = [];
  for (let y = Y0 + nb(0, 30); y < Y1; y += nb(27, 43)) hs.push(y);
  const vs: number[] = [];
  for (let x = X0 + nb(0, 30); x < X1; x += nb(30, 50)) vs.push(x);

  // One high street each way, so the eye has somewhere to start.
  const hMajor = Math.floor(nb(0, hs.length));
  const vMajor = Math.floor(nb(0, vs.length));

  const roads: Seg[] = [];
  hs.forEach((y, i) => {
    roads.push({ x1: X0, y1: y, x2: X1, y2: y + wobble(), major: i === hMajor });
  });
  vs.forEach((x, i) => {
    const major = i === vMajor;
    // A quarter of the side streets stop at a cross street. Dead ends are what
    // stop this reading as graph paper.
    const stub = !major && hs.length > 5 && rnd() < 0.26;
    if (stub) {
      const a = Math.floor(nb(0, hs.length - 3));
      const b = Math.min(hs.length - 1, a + 1 + Math.floor(nb(1, 3)));
      roads.push({ x1: x, y1: hs[a], x2: x + wobble(), y2: hs[b], major: false });
    } else {
      roads.push({ x1: x, y1: Y0, x2: x + wobble(), y2: Y1, major });
    }
  });

  // The pin sits near the middle, but never dead centre.
  const pin = { x: CX + nb(-15, 15), y: CY + nb(-9, 11) };
  const pinR = unrotate(pin.x, pin.y, angle);

  // Anything past this distance from the centre is outside the frame however
  // the grid is tipped: the visible box's half-diagonal is ~197.
  const REACH = 206;
  const near = (x: number, y: number, r: number) => Math.hypot(x - CX, y - CY) < r;

  // ── Parks: two-by-two blocks of grass, kept off the pin ────────────────────
  const parks: Box[] = [];
  const parkSlots: Box[] = [];
  for (let i = 0; i + 2 < hs.length; i++) {
    for (let j = 0; j + 2 < vs.length; j++) {
      const b = { x: vs[j], y: hs[i], w: vs[j + 2] - vs[j], h: hs[i + 2] - hs[i] };
      const mx = b.x + b.w / 2;
      const my = b.y + b.h / 2;
      if (!near(mx, my, REACH - 40)) continue;
      if (Math.hypot(mx - pinR.x, my - pinR.y) < 82) continue;
      parkSlots.push(b);
    }
  }
  const parkCount = parkSlots.length === 0 ? 0 : rnd() < 0.38 ? 2 : 1;
  for (let k = 0; k < parkCount && parkSlots.length > 0; k++) {
    const idx = Math.floor(nb(0, parkSlots.length));
    const chosen = parkSlots[idx];
    if (parks.some((p) => Math.hypot(p.x - chosen.x, p.y - chosen.y) < 90)) continue;
    parks.push({ x: chosen.x + 2, y: chosen.y + 2, w: chosen.w - 4, h: chosen.h - 4 });
  }

  const inPark = (x: number, y: number) =>
    parks.some((p) => x > p.x - 4 && x < p.x + p.w + 4 && y > p.y - 4 && y < p.y + p.h + 4);

  // ── Blocks: a scatter of built-up cells, inset so the streets read around them ──
  const blocks: Box[] = [];
  for (let i = 0; i + 1 < hs.length && blocks.length < 30; i++) {
    for (let j = 0; j + 1 < vs.length && blocks.length < 30; j++) {
      const x = vs[j];
      const y = hs[i];
      const w = vs[j + 1] - x;
      const h = hs[i + 1] - y;
      const mx = x + w / 2;
      const my = y + h / 2;
      if (!near(mx, my, REACH)) continue;
      if (inPark(mx, my)) continue;
      if (Math.hypot(mx - pinR.x, my - pinR.y) < 30) continue;
      if (rnd() > 0.3) continue;
      const in1 = 3;
      blocks.push({ x: x + in1, y: y + in1, w: Math.max(4, w - in1 * 2), h: Math.max(4, h - in1 * 2) });
    }
  }

  // ── The river: unrotated, because water does not respect a street grid ─────
  // Routed clear of the pin — high across the top, or low across the bottom.
  const hasRiver = rnd() < 0.62;
  const mid = rnd() < 0.5 ? nb(24, 44) : nb(116, 140);
  const sy = nb(8, 62);
  const ey = nb(98, 152);
  const river = hasRiver
    ? `M -14 ${sy.toFixed(1)} C 62 ${(sy + nb(-16, 16)).toFixed(1)}, 120 ${mid.toFixed(1)}, 180 ${mid.toFixed(1)} S 300 ${ey.toFixed(1)}, 374 ${ey.toFixed(1)}`
    : "";

  return { angle, roads, blocks, parks, river, pin };
}

// ─── StaticMap ───────────────────────────────────────────────────────────────

export interface StaticMapProps {
  point: GeoPoint;
  /** Stable seed for the deterministic street pattern. Use the stop id. */
  seed: string;
  height?: number;
}

/** Renders null when `!hasCoords(point)`. Never renders an empty grey box. */
export default function StaticMap({ point, seed, height = 140 }: StaticMapProps) {
  // Unique per instance: several of these can share a page and duplicate SVG
  // ids would make every map borrow the first one's gradients.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const plan = useMemo(() => buildPlan(seed), [seed]);

  // The sentinel check, and the only one. Not `if (point.lat)`.
  if (!hasCoords(point)) return null;

  const rot = `rotate(${plan.angle.toFixed(2)} ${CX} ${CY})`;

  return (
    <div
      // Decorative. The name and address underneath carry the meaning, so a
      // screen reader gets the place once, not twice.
      aria-hidden
      style={{
        height,
        width: "100%",
        overflow: "hidden",
        borderRadius: CARD_RADIUS,
        border: `1px solid ${PAPER_EDGE}`,
        background: PAPER_DEEP,
        boxShadow: "inset 0 1px 4px rgba(58,44,32,0.07)",
      }}
    >
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid slice"
        style={{ display: "block", width: "100%", height: "100%" }}
        role="presentation"
      >
        <defs>
          {/* Paper grain, so the map does not read as flat vector fill. */}
          <pattern id={`${uid}grain`} width="7" height="7" patternUnits="userSpaceOnUse">
            <circle cx="1.4" cy="1.4" r="0.55" fill={INK} opacity="0.05" />
            <circle cx="5" cy="4.6" r="0.4" fill={INK} opacity="0.035" />
          </pattern>
          {/* Fades the drawing into the card instead of stopping at a hard edge. */}
          <radialGradient id={`${uid}vig`} cx="50%" cy="50%" r="72%">
            <stop offset="52%" stopColor={PAPER} stopOpacity="0" />
            <stop offset="100%" stopColor={PAPER} stopOpacity="0.92" />
          </radialGradient>
        </defs>

        {/* Land */}
        <rect x="0" y="0" width={VB_W} height={VB_H} fill={PAPER_DEEP} />

        {/* Parks sit under the water; a river runs through them. */}
        <g transform={rot}>
          {plan.parks.map((p, i) => (
            <rect
              key={`p${i}`}
              x={p.x}
              y={p.y}
              width={p.w}
              height={p.h}
              rx="7"
              // The theme's one non-accent signal colour, at a wash.
              fill={DONE}
              opacity="0.15"
            />
          ))}
        </g>

        {plan.river ? (
          <g fill="none" strokeLinecap="round">
            <path d={plan.river} stroke={INK_SOFT} strokeWidth="13" opacity="0.11" />
            <path d={plan.river} stroke={INK_SOFT} strokeWidth="5" opacity="0.07" />
          </g>
        ) : null}

        <g transform={rot}>
          {/* Built-up blocks */}
          {plan.blocks.map((b, i) => (
            <rect
              key={`b${i}`}
              x={b.x}
              y={b.y}
              width={b.w}
              height={b.h}
              rx="1.5"
              fill={PAPER_EDGE}
              opacity="0.5"
            />
          ))}

          {/* Streets: a casing pass, then the light surface on top. */}
          {plan.roads.map((r, i) => (
            <line
              key={`c${i}`}
              x1={r.x1}
              y1={r.y1}
              x2={r.x2}
              y2={r.y2}
              stroke={PAPER_EDGE}
              strokeWidth={r.major ? 8.4 : 4.2}
              strokeLinecap="round"
              opacity="0.55"
            />
          ))}
          {plan.roads.map((r, i) => (
            <line
              key={`r${i}`}
              x1={r.x1}
              y1={r.y1}
              x2={r.x2}
              y2={r.y2}
              stroke={PAPER}
              strokeWidth={r.major ? 6.4 : 2.7}
              strokeLinecap="round"
              opacity={r.major ? 1 : 0.94}
            />
          ))}
        </g>

        {/* Grain and vignette, over the drawing and under the pin. */}
        <rect x="0" y="0" width={VB_W} height={VB_H} fill={`url(#${uid}grain)`} />
        <rect x="0" y="0" width={VB_W} height={VB_H} fill={`url(#${uid}vig)`} />

        {/* The pin. The only accent in the frame, and the only thing that is true. */}
        <g transform={`translate(${plan.pin.x.toFixed(2)} ${plan.pin.y.toFixed(2)})`}>
          <circle cx="0" cy="0" r="23" fill={ACCENT_WASH} opacity="0.75" />
          <circle
            cx="0"
            cy="0"
            r="23"
            fill="none"
            stroke={ACCENT_EDGE}
            strokeWidth="1"
            strokeDasharray="3 4"
            opacity="0.9"
          />
          {/* Two stacked ellipses instead of a blur filter — html-to-image is
              happier without SVG filters, and the PNG has to match the screen. */}
          <ellipse cx="0" cy="1" rx="10" ry="3.4" fill={INK} opacity="0.09" />
          <ellipse cx="0" cy="0.6" rx="5.6" ry="2" fill={INK} opacity="0.14" />
          <path
            d="M 0 0 C -6.4 -9.6 -10.6 -14.4 -10.6 -20.4 a 10.6 10.6 0 1 1 21.2 0 c 0 6 -4.2 10.8 -10.6 20.4 z"
            fill={ACCENT}
          />
          <circle cx="0" cy="-20.4" r="3.9" fill={PAPER} />
        </g>

        {/* Hairline, drawn last so nothing paints over it. */}
        <rect
          x="0.5"
          y="0.5"
          width={VB_W - 1}
          height={VB_H - 1}
          fill="none"
          stroke={PAPER_EDGE}
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}

// ─── Buttons ─────────────────────────────────────────────────────────────────

const buttonBase = {
  minHeight: TAP,
  minWidth: TAP,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  padding: "0 18px",
  borderRadius: CARD_RADIUS,
  fontFamily: SERIF,
  fontSize: 12.5,
  letterSpacing: "0.18em",
  textTransform: "uppercase" as const,
  cursor: "pointer",
  textDecoration: "none",
  background: "transparent",
};

/** A small text button used for the copy fallbacks. Always ≥ TAP tall. */
function CopyButton({ text, label = "copy the address" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);

  const onCopy = useCallback(() => {
    void copyToClipboard(text).then((ok) => {
      if (ok) setDone(true);
    });
  }, [text]);

  return (
    <button
      type="button"
      onClick={onCopy}
      style={{
        ...buttonBase,
        padding: "0 14px",
        border: `1px solid ${PAPER_EDGE}`,
        color: done ? ACCENT : INK_SOFT,
        fontSize: 11.5,
      }}
    >
      {done ? "copied" : label}
    </button>
  );
}

/**
 * Opens `directionsUrl(point)` in a NEW TAB. Renders null when the point has no
 * coordinates. If `window.open` is blocked (returns null / throws) we do not
 * leave a dead button behind: the address appears with a copy button and a
 * plain link, both of which work with popups disabled.
 */
export function DirectionsButton({
  point,
  label = "DIRECTIONS",
}: {
  point: GeoPoint;
  label?: string;
}) {
  const [blocked, setBlocked] = useState(false);
  const url = hasCoords(point) ? directionsUrl(point) : "";

  const onClick = useCallback(() => {
    let opened: Window | null = null;
    try {
      opened = window.open(url, "_blank", "noopener");
    } catch {
      opened = null;
    }
    if (!opened) setBlocked(true);
  }, [url]);

  if (!hasCoords(point)) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
      <button
        type="button"
        onClick={onClick}
        style={{
          ...buttonBase,
          border: `1.4px solid ${ACCENT}`,
          color: ACCENT,
          background: ACCENT_WASH,
          fontWeight: 700,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z"
            stroke="currentColor"
            strokeWidth="1.7"
          />
          <circle cx="12" cy="10" r="2.6" stroke="currentColor" strokeWidth="1.7" />
        </svg>
        {label}
      </button>

      {blocked && (
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
          <p
            style={{
              margin: 0,
              fontFamily: SERIF,
              fontSize: 13,
              lineHeight: 1.5,
              color: INK,
              overflowWrap: "anywhere",
            }}
          >
            {point.address || point.name}
          </p>
          <CopyButton text={point.address || point.name} />
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...buttonBase, padding: "0 14px", border: `1px solid ${PAPER_EDGE}`, color: INK_SOFT, fontSize: 11.5 }}
          >
            open in maps
          </a>
        </div>
      )}
    </div>
  );
}

// ─── PlaceBlock ──────────────────────────────────────────────────────────────

/**
 * The reusable place unit, used by BOTH the countdown meeting point and the
 * live current-stop card:
 *
 *   eyebrow → name → stylised map (only if hasCoords) → address → Directions
 *   (only if hasCoords) / plain address with a copy button when there are none.
 *
 * Long names and long addresses wrap rather than push the card sideways —
 * `overflowWrap: anywhere` handles a 90-character venue name and an
 * unbroken URL-ish address alike.
 */
export function PlaceBlock({
  point,
  seed,
  height = 140,
  /** Small caps label above the name — "MEET AT", "STOP 2". */
  eyebrow,
}: {
  point: GeoPoint;
  seed: string;
  height?: number;
  eyebrow?: string;
}) {
  const mapped = hasCoords(point);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>
      {eyebrow ? (
        <p
          style={{
            margin: 0,
            fontFamily: SERIF,
            fontSize: 10.5,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: INK_FAINT,
          }}
        >
          {eyebrow}
        </p>
      ) : null}

      <h3
        style={{
          margin: 0,
          fontFamily: SERIF,
          fontSize: 19,
          lineHeight: 1.32,
          fontWeight: 600,
          color: INK,
          overflowWrap: "anywhere",
          hyphens: "auto",
        }}
      >
        {point.name}
      </h3>

      {mapped ? <StaticMap point={point} seed={seed} height={height} /> : null}

      {point.address ? (
        <p
          style={{
            margin: 0,
            fontFamily: SERIF,
            fontSize: 14,
            lineHeight: 1.55,
            color: INK_SOFT,
            overflowWrap: "anywhere",
          }}
        >
          {point.address}
        </p>
      ) : null}

      {mapped ? (
        <DirectionsButton point={point} />
      ) : (
        // No coordinates: no map, no Directions, the address as text — plus a
        // way to get it into whatever app they actually navigate with.
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
          <CopyButton text={point.address || point.name} />
        </div>
      )}
    </div>
  );
}
