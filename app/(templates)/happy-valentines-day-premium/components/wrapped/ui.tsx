"use client";

// Shared bits: slide props, the three icons (icon-size SVG only), a masked line reveal.

import type { CSSProperties, ReactNode } from "react";
import type { Wrapped } from "./model";

export interface SlideProps {
  w: Wrapped;
  /** The slide's one interaction is done: fill its progress bar, show Next. */
  ready: () => void;
  isReady: boolean;
  next: () => void;
}

export const Arrow = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M4 10h12M11 5l5 5-5 5" />
  </svg>
);
export const Back = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M12.5 4.5 7 10l5.5 5.5" />
  </svg>
);
export const Heart = ({ filled }: { filled?: boolean }) => (
  <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden>
    <path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2Z" />
  </svg>
);

/** One line that slides up out of a mask. */
export function Up({ children, d = 0, className, style }: { children: ReactNode; d?: number; className?: string; style?: CSSProperties }) {
  return (
    <span className={`uw-up${className ? ` ${className}` : ""}`} style={style}>
      <span style={{ ["--d" as string]: `${d}s` }}>{children}</span>
    </span>
  );
}
