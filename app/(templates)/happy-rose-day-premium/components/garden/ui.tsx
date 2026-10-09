"use client";

// Shared bits for every garden scene: the scene shell (garden-path progress, kicker, heading, sub), the puffy
// candy buttons, and `aww()` — the reward every interaction ends on (chime + heart burst + haptic).

import { useCallback, useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { burst, haptic } from "../../../_valentine/kit";
import { usePremium } from "../../../_valentine/kit/premium";
import { Sparkle } from "./art";

export const HEARTS = ["💖", "💗", "🌸", "✨", "🌹"];

/** Where an element sits, as viewport fractions (for burst origins). */
export function originOf(el: Element | null | undefined, fy = 0.5): { x: number; y: number } {
  if (!el || typeof window === "undefined") return { x: 0.5, y: 0.45 };
  const r = el.getBoundingClientRect();
  return { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height * fy) / window.innerHeight };
}

/** The reward beat: three-note chime, a heart burst from `origin`, a success haptic. */
export function useAww() {
  const { sfx } = usePremium();
  const ref = useRef(sfx);
  useEffect(() => {
    ref.current = sfx;
  });
  return useCallback((origin?: { x: number; y: number }, big = false) => {
    ref.current("rg-aww", { gain: big ? 0.9 : 0.7 });
    burst({ kind: "hearts", origin: origin ?? { x: 0.5, y: 0.45 }, emojis: HEARTS, count: big ? 34 : 20, spread: big ? 0.5 : 0.32 });
    haptic(big ? [20, 30, 20, 30, 60] : [15, 40, 25]);
  }, []);
}

export function Puffy({
  children,
  onClick,
  variant = "primary",
  disabled,
  className,
  style,
  ariaLabel,
  cue = "pop",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "soft";
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
  cue?: string | null;
}) {
  const { sfx } = usePremium();
  return (
    <button
      type="button"
      className={`rg-btn rg-btn--${variant}${className ? ` ${className}` : ""}`}
      disabled={disabled}
      aria-label={ariaLabel}
      style={style}
      onClick={() => {
        if (cue) sfx(cue, { gain: 0.5, detune: Math.random() * 120 - 60 });
        haptic(10);
        onClick?.();
      }}
    >
      {children}
    </button>
  );
}

export function Scene({
  id,
  step,
  total,
  kicker,
  title,
  sub,
  children,
  className,
  label,
}: {
  id: string;
  step: number;
  total: number;
  kicker: string;
  title: ReactNode;
  sub?: ReactNode;
  children: ReactNode;
  className?: string;
  label: string;
}) {
  return (
    <section className={`rg-scene rg-scene--${id}${className ? ` ${className}` : ""}`} aria-label={label}>
      <div className="rg-path" aria-hidden>
        {Array.from({ length: total }, (_, k) => (
          <i key={k} className={k < step ? "is-done" : k === step ? "is-now" : ""} />
        ))}
      </div>
      <header className="rg-head">
        <p className="rg-kicker">
          <Sparkle size={11} color="#FF6F9C" /> {kicker} <Sparkle size={11} color="#FF6F9C" />
        </p>
        <h2 className="rg-title">{title}</h2>
        {sub && <p className="rg-sub">{sub}</p>}
      </header>
      {children}
    </section>
  );
}
