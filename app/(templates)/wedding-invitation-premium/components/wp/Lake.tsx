"use client";

// ─── The lake at Udaipur, painted in watercolour (shared by the opening and the hero) ─
// template6's card stands its terrace over misty blue-green hills and a still
// lake; the pack's landscape is a flat crop with the couple and gazebo baked
// in, so the hills and water are drawn here instead: three soft ranges (an
// feTurbulence wash gives them a watercolour edge), the lake as layered
// gradients, and (optionally) a few lotuses resting on the water.
// The sky is the pack's own watercolour. Everything here is still.

import { useId } from "react";
import { img } from "./art";

export default function Lake({ lotus = true, className }: { lotus?: boolean; className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <div className={`wp-lakeview ${className ?? ""}`} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
      <img {...img("skyFull", { high: true })} className="wp-lv-sky" />
      <svg className="wp-lv-hills" viewBox="0 0 1600 300" preserveAspectRatio="none">
        <defs>
          <filter id={`wc${id}`} x="-5%" y="-20%" width="110%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency=".012 .05" numOctaves="3" seed="7" />
            <feDisplacementMap in="SourceGraphic" scale="14" />
            <feGaussianBlur stdDeviation="1.6" />
          </filter>
          <linearGradient id={`h1${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#B9CFC4" />
            <stop offset="1" stopColor="#DCE9E6" />
          </linearGradient>
          <linearGradient id={`h2${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#9DBBAE" />
            <stop offset="1" stopColor="#D5E5E2" />
          </linearGradient>
          <linearGradient id={`h3${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#87A99B" />
            <stop offset="1" stopColor="#CFE2E0" />
          </linearGradient>
        </defs>
        <g filter={`url(#wc${id})`}>
          <path d="M0 230 C120 190 200 120 300 128 C380 134 420 190 520 170 C600 154 650 70 760 64 C860 58 900 150 1000 140 C1100 130 1150 92 1240 100 C1330 108 1380 170 1480 160 C1540 154 1580 140 1600 136 V300 H0Z" fill={`url(#h1${id})`} opacity=".7" />
          <path d="M0 250 C90 236 170 168 260 172 C350 176 390 236 480 222 C560 210 620 120 720 118 C820 116 860 206 960 200 C1050 194 1100 150 1190 152 C1290 156 1330 222 1430 218 C1500 214 1560 200 1600 196 V300 H0Z" fill={`url(#h2${id})`} opacity=".75" />
          <path d="M0 276 C140 262 220 222 320 230 C420 238 470 270 580 262 C700 254 760 214 860 220 C980 228 1040 268 1160 262 C1280 256 1340 232 1440 238 C1520 242 1570 256 1600 258 V300 H0Z" fill={`url(#h3${id})`} opacity=".7" />
        </g>
      </svg>
      <div className="wp-lv-water">
        {lotus &&
          [
            ["30%", "30%", 34, "0s"],
            ["40%", "50%", 26, "0s"],
            ["58%", "24%", 30, "0s"],
          ].map(([l, t, w], i) => (
            // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
            <img key={i} {...img("lotus", { lazy: true })} className="wp-lv-lotus" style={{ left: l as string, top: t as string, width: w as number }} />
          ))}
      </div>
    </div>
  );
}
