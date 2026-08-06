"use client";

// ─── North Indian (diamond) rashi chart ──────────────────────────────────────
//
// A square with both diagonals plus a rotated inner square joining the
// midpoints of the four sides. That is twelve regions — four central diamonds
// (houses 1, 4, 7, 10) and eight corner triangles — laid out in the standard
// anticlockwise order with house 1 at the top centre.
//
// Purely a renderer. Every placement comes from `chart.houses`, which was
// computed once by `computeKundliReport`.

import type { ChartData } from "./types";
import { INK, MONO, SERIF } from "./ui";

interface HouseGeom {
  n: number;
  /** Polygon in the 0..100 viewBox. */
  poly: string;
  /** Where the house number sits. */
  nx: number;
  ny: number;
  /** Where the planet stack starts. */
  px: number;
  py: number;
}

/**
 * The twelve houses. Exported so the layout can be checked by eye (and so no
 * one is tempted to re-derive it somewhere else).
 */
export const HOUSE_GEOMETRY: HouseGeom[] = [
  { n: 1, poly: "50,0 75,25 50,50 25,25", nx: 50, ny: 15.5, px: 50, py: 30 },
  { n: 2, poly: "0,0 50,0 25,25", nx: 20, ny: 6.5, px: 25, py: 15 },
  { n: 3, poly: "0,0 25,25 0,50", nx: 6.5, ny: 20, px: 9.5, py: 31 },
  { n: 4, poly: "0,50 25,25 50,50 25,75", nx: 25, ny: 40.5, px: 25, py: 55 },
  { n: 5, poly: "0,50 25,75 0,100", nx: 6.5, ny: 70, px: 9.5, py: 81 },
  { n: 6, poly: "0,100 25,75 50,100", nx: 20, ny: 87, px: 25, py: 94.5 },
  { n: 7, poly: "50,50 75,75 50,100 25,75", nx: 50, ny: 65.5, px: 50, py: 80 },
  { n: 8, poly: "50,100 75,75 100,100", nx: 80, ny: 87, px: 75, py: 94.5 },
  { n: 9, poly: "100,50 75,75 100,100", nx: 93.5, ny: 70, px: 90.5, py: 81 },
  { n: 10, poly: "50,50 75,25 100,50 75,75", nx: 75, ny: 40.5, px: 75, py: 55 },
  { n: 11, poly: "100,0 100,50 75,25", nx: 93.5, ny: 20, px: 90.5, py: 31 },
  { n: 12, poly: "50,0 100,0 75,25", nx: 80, ny: 6.5, px: 75, py: 15 },
];

/** What each house is traditionally said to govern — the tooltip copy. */
const HOUSE_MEANS: Record<number, string> = {
  1: "self, body, first impressions",
  2: "wealth, speech, the family kitty",
  3: "courage, siblings, group chats",
  4: "home, mother, the sofa",
  5: "romance, children, bad decisions",
  6: "debts, rivals, gym membership",
  7: "marriage, partnership, negotiation",
  8: "secrets, sudden events, old messages",
  9: "fortune, dharma, in-laws' approval",
  10: "career, status, the LinkedIn post",
  11: "gains, friends, group holidays",
  12: "expenses, sleep, foreign lands",
};

/** Three abbreviations to a line keeps every stack inside its region. */
function chunk(planets: string[]): string[][] {
  const out: string[][] = [];
  for (let i = 0; i < planets.length; i += 3) out.push(planets.slice(i, i + 3));
  return out;
}

export default function NorthIndianChart({
  chart,
  size,
  onHouseTap,
  whoLabel,
}: {
  chart: ChartData;
  size: number;
  whoLabel: string;
  onHouseTap?: (house: number, planets: string[], meaning: string) => void;
}) {
  return (
    <svg
      viewBox="-1 -1 102 102"
      width={size}
      height={size}
      style={{ display: "block" }}
      role="img"
      aria-label={`${whoLabel} rashi chart, North Indian style, twelve houses`}
    >
      {/* Frame, diagonals, and the inner square on the four midpoints. */}
      <g fill="none" stroke={INK} strokeWidth="0.9" shapeRendering="crispEdges">
        <rect x="0" y="0" width="100" height="100" strokeWidth="1.3" />
        <path d="M0,0 L100,100 M100,0 L0,100" strokeWidth="0.7" />
        <path d="M50,0 L100,50 L50,100 L0,50 Z" strokeWidth="0.7" />
      </g>

      {HOUSE_GEOMETRY.map((h) => {
        const planets = chart.houses[h.n] ?? [];
        const rows = chunk(planets);
        const fs = planets.length <= 3 ? 4.2 : planets.length <= 6 ? 3.8 : 3.4;
        const lead = fs + 0.5;
        // Centre the stack vertically on the anchor.
        const top = h.py - ((rows.length - 1) * lead) / 2;
        return (
          <g key={h.n}>
            <text
              x={h.nx}
              y={h.ny}
              textAnchor="middle"
              fontSize="3.6"
              fill={INK}
              opacity={0.62}
              style={{ fontFamily: SERIF }}
            >
              {h.n}
            </text>
            {rows.map((row, i) => (
              <text
                key={i}
                x={h.px}
                y={top + i * lead}
                textAnchor="middle"
                fontSize={fs}
                fill={INK}
                style={{ fontFamily: MONO }}
              >
                {row.join(" ")}
              </text>
            ))}
          </g>
        );
      })}

      {/* Tap layer last so it sits above the ink. The polygon IS the hit area,
          so the target matches the printed house exactly. */}
      {onHouseTap &&
        HOUSE_GEOMETRY.map((h) => (
          <polygon
            key={`hit-${h.n}`}
            points={h.poly}
            fill="transparent"
            style={{ cursor: "pointer", outline: "none" }}
            role="button"
            tabIndex={0}
            aria-label={`House ${h.n}: ${HOUSE_MEANS[h.n]}`}
            onClick={() => onHouseTap(h.n, chart.houses[h.n] ?? [], HOUSE_MEANS[h.n])}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onHouseTap(h.n, chart.houses[h.n] ?? [], HOUSE_MEANS[h.n]);
              }
            }}
          />
        ))}
    </svg>
  );
}
