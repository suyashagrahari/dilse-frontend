"use client";

// ─── The Red Thread — hands, the opening thread, the night backdrop (SVG + CSS)

import type { CSSProperties } from "react";

export const THREAD: Record<string, { c: string; hi: string }> = {
  red: { c: "#D7263D", hi: "#FF6B7D" },
  gold: { c: "#E0A82E", hi: "#FFE08A" },
  rose: { c: "#E86A92", hi: "#FFB3C9" },
};

/** A hand with the little finger raised and a loop of thread round it. */
export function Hand({ color, flip, className, style, loop = true }: { color: string; flip?: boolean; className?: string; style?: CSSProperties; loop?: boolean }) {
  const id = flip ? "tp-skinB" : "tp-skinA";
  return (
    <svg viewBox="0 0 120 170" className={className} style={{ transform: flip ? "scale(-1, -1)" : undefined, ...style }} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor={flip ? "#E8BC96" : "#F3CFAE"} />
          <stop offset="1" stopColor={flip ? "#C48A66" : "#D9A07C"} />
        </linearGradient>
      </defs>
      <rect x="40" y="128" width="50" height="46" rx="10" fill={`url(#${id})`} />
      <rect x="15" y="22" width="19" height="82" rx="9.5" transform="rotate(-8 24 63)" fill={`url(#${id})`} stroke="#B98463" strokeWidth="1.4" />
      <rect x="24" y="68" width="78" height="72" rx="26" fill={`url(#${id})`} stroke="#B98463" strokeWidth="1.4" />
      {[44, 63, 82].map((cx, i) => (
        <ellipse key={cx} cx={cx} cy={76 + (i === 1 ? -2 : 0)} rx="10.5" ry="12" fill={`url(#${id})`} stroke="#B98463" strokeWidth="1.2" />
      ))}
      <ellipse cx="98" cy="106" rx="12" ry="21" transform="rotate(-24 98 106)" fill={`url(#${id})`} stroke="#B98463" strokeWidth="1.4" />
      <path d="M17 30 Q24 25 31 28" stroke="#fff" strokeOpacity=".5" strokeWidth="2" fill="none" strokeLinecap="round" />
      {loop && <ellipse cx="22" cy="48" rx="13" ry="5" transform="rotate(-8 22 48)" fill="none" stroke={color} strokeWidth="3.4" />}
    </svg>
  );
}

export function GateThread({ color, hi }: { color: string; hi: string }) {
  return (
    <div className="tp-gateArt">
      <svg viewBox="0 0 200 240" className="tp-gateSvg" aria-hidden>
        <defs>
          <linearGradient id="tp-gth" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity="0" />
            <stop offset=".35" stopColor={color} />
            <stop offset="1" stopColor={color} />
          </linearGradient>
        </defs>
        <g className="tp-sway">
          <path d="M120 -10 C 160 60, 40 100, 90 150 S 70 196, 62 206" stroke="url(#tp-gth)" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path className="tp-glintPath" d="M120 -10 C 160 60, 40 100, 90 150 S 70 196, 62 206" stroke={hi} strokeWidth="3" fill="none" strokeLinecap="round" pathLength={1} />
        </g>
      </svg>
      <Hand color={color} className="tp-gateHand" />
    </div>
  );
}

export function NightBackdrop({ scene }: { scene: string }) {
  return (
    <div className={`tp-bd is-${scene}`} aria-hidden>
      <div className="tp-sky" />
      <div className="tp-stars" />
      <div className="tp-beam" />
      <div className="tp-river" />
      <div className="tp-vignette" />
    </div>
  );
}

/** "Today" as YYYY-MM-DD in the viewer's zone. */
export const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
export const validDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(new Date(`${s}T00:00:00`).getTime());
export const prettyDate = (s: string) => (validDate(s) ? new Date(`${s}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "");
