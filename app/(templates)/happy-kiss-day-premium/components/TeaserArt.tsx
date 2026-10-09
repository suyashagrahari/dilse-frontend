"use client";

// The unlock teaser: a booth strip still face-down in the slot, four dark
// frames waiting to develop and the sender's kiss already on the footer.
// Only names reach the teaser, so the shade is the default. Loaded lazily by
// the viewer (getTeaserArt). Self-contained SVG.

import type { TeaserArtProps } from "../../_valentine/types";
import { LIP_CREASES, LIP_LOWER, LIP_UPPER } from "./booth/LipPrint";

export default function KissTeaserArt({ recipientName }: TeaserArtProps) {
  const name = (recipientName || "you").toUpperCase().slice(0, 16);
  return (
    <svg viewBox="0 0 220 300" width="min(220px, 60vw)" role="img" aria-label="A photo-booth strip, still developing" style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id="pbtChrome" x1="0" x2="1">
          <stop offset="0" stopColor="#6b7078" />
          <stop offset=".3" stopColor="#f4f6f9" />
          <stop offset=".6" stopColor="#9aa0a8" />
          <stop offset="1" stopColor="#e7ebf0" />
        </linearGradient>
        <linearGradient id="pbtFrame" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a2a2c" />
          <stop offset="1" stopColor="#151012" />
        </linearGradient>
        <clipPath id="pbtFeed">
          <rect x="0" y="22" width="220" height="300" />
        </clipPath>
      </defs>
      <rect x="22" y="10" width="176" height="14" rx="7" fill="url(#pbtChrome)" />
      <rect x="34" y="15" width="152" height="4" rx="2" fill="#050304" />
      <g clipPath="url(#pbtFeed)">
        <g style={{ filter: "drop-shadow(0 18px 22px rgba(0,0,0,.6))" }}>
          <rect x="66" y="-40" width="88" height="320" rx="2" fill="#F7F2E8" />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x="72" y={-34 + i * 62} width="76" height="57" rx="1" fill="url(#pbtFrame)" opacity={0.92 - i * 0.12} />
          ))}
          <g transform="translate(86 214) scale(.42)" fill="#B3122E" opacity=".9">
            <path d={LIP_UPPER} />
            <path d={LIP_LOWER} />
            <path d={LIP_CREASES} stroke="#F7F2E8" strokeWidth="1.6" fill="none" />
          </g>
          <text x="110" y="262" textAnchor="middle" fontFamily="ui-monospace, Menlo, monospace" fontSize="6.5" letterSpacing="1.6" fill="#8a1520">
            FOR {name}
          </text>
        </g>
      </g>
    </svg>
  );
}
