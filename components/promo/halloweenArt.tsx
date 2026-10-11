// Tiny inline Halloween drawings for the banners. Inline SVG rather than the
// template GIFs on purpose: these paint with the banner itself (no request, no
// pop-in), while the heavier GIFs load only after idle — see HalloweenCritters.

import type { CSSProperties } from "react";

type P = { size?: number; className?: string; style?: CSSProperties };

export function Bat({ size = 22, className, style }: P) {
  return (
    <svg viewBox="0 0 64 32" width={size} height={size / 2} className={className} style={style} aria-hidden>
      <path
        fill="currentColor"
        d="M32 9c-2.2 0-3.6 1.4-4.2 3.2-3.4-4.6-10-7.2-17-6.4 3.6 2 5 5.2 4.6 8.4-3.6-1.4-8.6-1-12.4 1.8 4.6.6 7.6 3.4 8.6 7.2 3.8-2.6 8.4-3 12 .6 1.6-3 4.4-4.4 7.4-4.4h2c3 0 5.8 1.4 7.4 4.4 3.6-3.6 8.2-3.2 12-.6 1-3.8 4-6.6 8.6-7.2-3.8-2.8-8.8-3.2-12.4-1.8-.4-3.2 1-6.4 4.6-8.4-7-.8-13.6 1.8-17 6.4C35.6 10.4 34.2 9 32 9Z"
      />
      <circle cx="29.6" cy="13.6" r="1.1" fill="#ffb347" />
      <circle cx="34.4" cy="13.6" r="1.1" fill="#ffb347" />
    </svg>
  );
}

export function Spider({ size = 22, className, style }: P) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} className={className} style={style} aria-hidden>
      <g stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none">
        <path d="M14 18 6 12 3 16M14 21 4 21 2 26M15 24 7 29 6 34M26 18l8-6 3 4M26 21h10l2 5M25 24l8 5 1 5" />
      </g>
      <ellipse cx="20" cy="22" rx="7.5" ry="8" fill="currentColor" />
      <circle cx="20" cy="13.5" r="4.6" fill="currentColor" />
      <circle cx="18.2" cy="13.2" r="1.3" fill="#fff" />
      <circle cx="21.8" cy="13.2" r="1.3" fill="#fff" />
      <circle cx="18.4" cy="13.5" r=".6" fill="#111" />
      <circle cx="22" cy="13.5" r=".6" fill="#111" />
    </svg>
  );
}

export function Ghost({ size = 22, className, style }: P) {
  return (
    <svg viewBox="0 0 40 44" width={size} height={size * 1.1} className={className} style={style} aria-hidden>
      <path
        fill="#fff8ef"
        stroke="rgba(42,10,14,.55)"
        strokeWidth="1.6"
        d="M20 3C11 3 6 10 6 19v19.5c0 1.4 1.6 2.1 2.6 1.1l3-3 3.2 3.2c.8.8 2 .8 2.8 0L20 36.6l2.4 3.2c.8.8 2 .8 2.8 0l3.2-3.2 3 3c1 1 2.6.3 2.6-1.1V19C34 10 29 3 20 3Z"
      />
      <ellipse cx="15" cy="18" rx="2.3" ry="3" fill="#2a0a0e" />
      <ellipse cx="25" cy="18" rx="2.3" ry="3" fill="#2a0a0e" />
      <ellipse cx="20" cy="25.5" rx="2.6" ry="3.2" fill="#2a0a0e" />
      <ellipse cx="11.5" cy="23" rx="2.2" ry="1.3" fill="#ffb3a8" opacity=".75" />
      <ellipse cx="28.5" cy="23" rx="2.2" ry="1.3" fill="#ffb3a8" opacity=".75" />
    </svg>
  );
}

export function Pumpkin({ size = 22, className, style }: P) {
  return (
    <svg viewBox="0 0 40 38" width={size} height={size * 0.95} className={className} style={style} aria-hidden>
      <path d="M19 8c0-3 1.4-5.4 4.4-6.4" stroke="#5b3a1a" strokeWidth="3" strokeLinecap="round" fill="none" />
      <ellipse cx="13" cy="22" rx="10" ry="13" fill="#e8742a" />
      <ellipse cx="27" cy="22" rx="10" ry="13" fill="#e8742a" />
      <ellipse cx="20" cy="22" rx="9" ry="14" fill="#f58a35" />
      <path d="M12 18l4 3h-5zM28 18l-4 3h5z" fill="#3d0c11" />
      <path d="M11 26c3 4 15 4 18 0l-3 1-2-2-2 2-2-2-2 2-2-2-2 2z" fill="#3d0c11" />
    </svg>
  );
}

/** A cobweb anchored in the top-left corner; flip it with CSS for the others. */
export function CornerWeb({ size = 120, className, style }: P) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} style={style} aria-hidden>
      <g stroke="currentColor" fill="none" strokeWidth="1" strokeLinecap="round">
        <path d="M0 0 100 8M0 0 92 46M0 0 70 70M0 0 46 92M0 0 8 100" />
        <path d="M20 1.6Q17 9 18.4 14.4 12 15.6 9 18.4 7 15 1.6 20" />
        <path d="M40 3.2Q34 16 36.8 28.8 25 30 18.4 36.8 14 30 3.2 40" />
        <path d="M60 4.8Q51 25 55.2 43.2 38 45 27.6 55.2 21 46 4.8 60" />
        <path d="M80 6.4Q68 34 73.6 57.6 50 60 36.8 73.6 28 62 6.4 80" />
      </g>
    </svg>
  );
}
