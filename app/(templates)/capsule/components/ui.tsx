"use client";

// ─── Capsule — shared chrome ─────────────────────────────────────────────────

import { MONO, PALETTE, SERIF, TAP_TARGET_PX, UI } from "./types";
import { PaperTexture, paperFill } from "./paper";

/** The 380px portrait page. Everything sits on paper. */
export function Frame({ children, seed = "capsule" }: { children: React.ReactNode; seed?: string }) {
  return (
    <div className="relative min-h-[100dvh] w-full" style={{ ...paperFill(seed), color: PALETTE.ink }}>
      <PaperTexture seed={`${seed}-page`} opacity={0.05} baseFrequency={0.75} />
      <div className="relative mx-auto w-full" style={{ maxWidth: 380 }}>
        {children}
      </div>
    </div>
  );
}

/**
 * Every touchable in the template. `TAP_TARGET_PX` is the floor, and the
 * judging buttons in particular are the ones a thumb hits without looking.
 */
export function TapButton({
  children,
  onClick,
  tone = "quiet",
  disabled,
  full,
  ariaLabel,
  style,
}: {
  children: React.ReactNode;
  onClick: () => void;
  tone?: "quiet" | "wax" | "ghost" | "amber";
  disabled?: boolean;
  full?: boolean;
  ariaLabel?: string;
  style?: React.CSSProperties;
}) {
  const palette: Record<string, React.CSSProperties> = {
    wax: { background: PALETTE.wax, color: PALETTE.paper, border: `1px solid ${PALETTE.waxDeep}` },
    amber: { background: PALETTE.amberWash, color: PALETTE.amber, border: `1px solid ${PALETTE.amber}` },
    quiet: { background: "rgba(255,255,255,.55)", color: PALETTE.ink, border: `1px solid ${PALETTE.edge}` },
    ghost: { background: "transparent", color: PALETTE.inkSoft, border: "1px solid transparent" },
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`inline-flex items-center justify-center gap-2 rounded-[6px] px-4 disabled:opacity-45 ${full ? "w-full" : ""}`}
      style={{
        minHeight: TAP_TARGET_PX,
        minWidth: TAP_TARGET_PX,
        fontFamily: UI,
        fontSize: 15,
        fontWeight: 600,
        letterSpacing: 0.1,
        touchAction: "manipulation",
        ...palette[tone],
        ...style,
      }}
    >
      {children}
    </button>
  );
}

/** A monospace dot-leader row. The scorecard is built out of these. */
export function DotRow({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className="flex items-baseline gap-1"
      style={{ fontFamily: MONO, fontSize: emphasis ? 15 : 13, color: emphasis ? PALETTE.ink : PALETTE.inkSoft }}
    >
      <span style={{ whiteSpace: "nowrap" }}>{label}</span>
      <span
        aria-hidden
        className="min-w-0 flex-1 translate-y-[-3px]"
        style={{ borderBottom: `1px dotted ${PALETTE.edge}` }}
      />
      <span style={{ whiteSpace: "nowrap", fontWeight: emphasis ? 700 : 400, color: PALETTE.ink }}>{value}</span>
    </div>
  );
}

/** A small caps label in mono. Dates, confidence, scores — nothing else. */
export function Mono({
  children,
  size = 11,
  colour = PALETTE.inkSoft,
  style,
}: {
  children: React.ReactNode;
  size?: number;
  colour?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span style={{ fontFamily: MONO, fontSize: size, color: colour, letterSpacing: 1, ...style }}>{children}</span>
  );
}

/** Prediction text and anything that wants to read as handwriting-adjacent. */
export function Serif({
  children,
  size = 17,
  colour = PALETTE.ink,
  style,
}: {
  children: React.ReactNode;
  size?: number;
  colour?: string;
  style?: React.CSSProperties;
}) {
  return <span style={{ fontFamily: SERIF, fontSize: size, color: colour, lineHeight: 1.42, ...style }}>{children}</span>;
}

/** A hairline rule in the edge colour. */
export function Rule({ style }: { style?: React.CSSProperties }) {
  return <div aria-hidden style={{ height: 1, background: PALETTE.edge, ...style }} />;
}

/**
 * The DEBUG affordances. Deliberately ugly and deliberately labelled — these
 * exist for this session's testing and must never be mistaken for product.
 */
export function DebugBar({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex flex-wrap items-center gap-2 px-4 py-2"
      style={{ background: "#1b1b1b", color: "#8de08d", fontFamily: MONO, fontSize: 11 }}
    >
      <span style={{ opacity: 0.6 }}>DEBUG</span>
      {children}
    </div>
  );
}

export function DebugButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-sm px-2 py-1"
      style={{ background: "#2c2c2c", color: "#8de08d", fontFamily: MONO, fontSize: 11, border: "1px solid #3d5c3d" }}
    >
      [{label}]
    </button>
  );
}
