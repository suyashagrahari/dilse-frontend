"use client";

// Shared bits for every passport scene: the passport context (the page model, the stamps collected so far, and
// `stamp()` to ink a new one), the scene shell (stamp bar, kicker, heading, sub), the puffy candy buttons, and `aww()`:
// the reward every interaction ends on (chime + heart burst + haptic).

import { createContext, useCallback, useContext, useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { burst, haptic } from "../../../_valentine/kit";
import { usePremium } from "../../../_valentine/kit/premium";
import type { DayConfig } from "../../../_valentine/types";
import { Sparkle, StampBar } from "./art";
import type { Passport, StampKind } from "./util";

export const HEARTS = ["💖", "💗", "🧡", "✨", "🤗"];

export interface PassportCtx {
  g: Passport;
  day: DayConfig;
  gifs?: Record<string, string>;
  got: ReadonlySet<StampKind>;
  /** Ink a stamp into the passport (idempotent). */
  stamp: (k: StampKind) => void;
  /** "12 FEB" — the small print on every stamp. */
  date: string;
}
export const PassportContext = createContext<PassportCtx | null>(null);
export function usePassport(): PassportCtx {
  const v = useContext(PassportContext);
  if (!v) throw new Error("usePassport() outside the passport");
  return v;
}

/** Where an element sits, as viewport fractions (for burst origins). */
export function originOf(el: Element | null | undefined, fy = 0.5): { x: number; y: number } {
  if (!el || typeof window === "undefined") return { x: 0.5, y: 0.45 };
  const r = el.getBoundingClientRect();
  return { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height * fy) / window.innerHeight };
}

/** The reward beat: three-note chime, a heart burst from `origin`, a success haptic. Stable across renders. */
export function useAww() {
  const { sfx } = usePremium();
  const ref = useRef(sfx);
  useEffect(() => {
    ref.current = sfx;
  });
  return useCallback((origin?: { x: number; y: number }, big = false) => {
    ref.current("hp-aww", { gain: big ? 0.9 : 0.7 });
    burst({ kind: "hearts", origin: origin ?? { x: 0.5, y: 0.45 }, emojis: HEARTS, count: big ? 34 : 20, spread: big ? 0.5 : 0.32 });
    haptic(big ? [20, 30, 20, 30, 60] : [15, 40, 25]);
  }, []);
}

/** A stable sfx() (the premium context object changes identity between renders). */
export function useSfx() {
  const { sfx } = usePremium();
  const ref = useRef(sfx);
  useEffect(() => {
    ref.current = sfx;
  });
  return useCallback((id: string, o?: Parameters<typeof sfx>[1]) => ref.current(id, o), []);
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
      className={`hp-btn hp-btn--${variant}${className ? ` ${className}` : ""}`}
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

/** "Do it for me" — the quiet fallback under every gesture. */
export function ForMe({ onClick, children = "Do it for me 🤗" }: { onClick: () => void; children?: ReactNode }) {
  return (
    <button type="button" className="hp-forMe" onClick={onClick}>
      {children}
    </button>
  );
}

export function Scene({
  id,
  now,
  kicker,
  title,
  sub,
  children,
  className,
  label,
}: {
  id: string;
  now?: StampKind;
  kicker: string;
  title: ReactNode;
  sub?: ReactNode;
  children: ReactNode;
  className?: string;
  label: string;
}) {
  const { got } = usePassport();
  return (
    <section className={`hp-scene hp-scene--${id}${className ? ` ${className}` : ""}`} aria-label={label}>
      <StampBar got={got} now={now} />
      <header className="hp-head">
        <p className="hp-kicker">
          <Sparkle size={11} color="#FF8A6B" /> {kicker} <Sparkle size={11} color="#FF8A6B" />
        </p>
        <h2 className="hp-title">{title}</h2>
        {sub && <p className="hp-sub">{sub}</p>}
      </header>
      {children}
    </section>
  );
}
