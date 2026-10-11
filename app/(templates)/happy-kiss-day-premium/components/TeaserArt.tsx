"use client";

// The unlock teaser: a pink envelope sealed with a lipstick kiss, a tiny
// lipstick leaning on it and two hearts, "for {name}" on the front. Only names
// reach the teaser, so the shade is the default. Loaded lazily by the viewer
// (getTeaserArt). Self-contained SVG.

import type { TeaserArtProps } from "../../_valentine/types";
import { HEART, LIP_LOWER, LIP_UPPER } from "./mwah/LipPrint";

export default function KissTeaserArt({ recipientName }: TeaserArtProps) {
  const name = (recipientName || "you").slice(0, 16);
  return (
    <svg viewBox="0 0 240 200" width="min(240px, 64vw)" role="img" aria-label="An envelope sealed with a kiss, waiting to be opened" style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id="kmtEnv" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFC1D3" />
          <stop offset="1" stopColor="#FF9EBB" />
        </linearGradient>
      </defs>
      <g transform="translate(196 18) rotate(14) scale(.42)">
        <path d={HEART} fill="#FF4F86" stroke="#fff" strokeWidth="8" />
      </g>
      <g transform="translate(4 112) rotate(-16) scale(.3)">
        <path d={HEART} fill="#FFE27A" stroke="#fff" strokeWidth="10" />
      </g>
      <rect x="30" y="50" width="180" height="120" rx="16" fill="url(#kmtEnv)" stroke="#fff" strokeWidth="5" />
      <path d="M33 54 L120 118 L207 54" fill="#FFD6E3" stroke="#fff" strokeWidth="4" strokeLinejoin="round" />
      <g transform="translate(84 96) scale(.6)" fill="#E0244E" stroke="#fff" strokeWidth="5" strokeLinejoin="round" paintOrder="stroke">
        <path d={LIP_UPPER} />
        <path d={LIP_LOWER} />
      </g>
      <text x="120" y="158" textAnchor="middle" fontFamily="'Shantell Sans', 'Comic Sans MS', system-ui, sans-serif" fontSize="15" fontWeight="600" fill="#fff">
        for {name}
      </text>
      <g transform="translate(196 120) rotate(14)">
        <rect x="0" y="0" width="22" height="34" rx="5" fill="#FF6F9C" stroke="#fff" strokeWidth="3" />
        <rect x="2" y="-9" width="18" height="10" rx="3" fill="#FFD1DF" stroke="#fff" strokeWidth="2" />
        <path d="M5 -9 L5 -26 Q11 -32 17 -24 L17 -9 Z" fill="#E0244E" stroke="#fff" strokeWidth="2" />
      </g>
    </svg>
  );
}
