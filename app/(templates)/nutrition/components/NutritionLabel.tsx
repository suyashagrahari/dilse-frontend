"use client";

// ─── Nutrition Facts — THE LABEL ─────────────────────────────────────────────
//
// This file is 95% typography and 5% behaviour, and that ratio is correct.
//
// A real FDA panel has a rule-weight hierarchy that every literate adult can
// recognise but almost nobody can name: 1 / 4 / 7 / 10, in fixed positions.
// Get those four numbers right and the eye files this under "label" before it
// reads a word, which is what lets the copy be funny. Get them wrong and the
// eye files it under "graphic", and then the copy is just a person being witty
// at you. The weights live in types.ts precisely so this file cannot drift.
//
// Every rule is a `border-top` on the element that FOLLOWS it. Never an <hr> —
// an <hr> brings its own margins and the rules must sit flush on the rows.
//
// Nothing here is coloured. Nothing here reflows. The panel is a fixed 300px
// block; the wrapper scales it (see PackageFrame).

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import {
  LABEL_WIDTH,
  NUTRIENT_SOFT_MAX,
  RULE,
  type NutritionData,
  type Nutrient,
  type Vitamin,
} from "./types";

/* ── constants ───────────────────────────────────────────────────────────── */

/** Themed: the panel is printed in the packaging's own ink on its own paper. */
const INK = "var(--lv-paper-ink, #000)";
const PAPER = "var(--lv-paper, #fff)";

/** The real label is Helvetica. Arial is the primary fallback, not a nicety. */
const FONT = "Helvetica, Arial, sans-serif";

/**
 * Real panels set the title in a condensed grotesque. If the machine has one we
 * use it; if not we squeeze Helvetica horizontally, which is what the FDA's own
 * artwork guidance does when a condensed cut is unavailable.
 */
const TITLE_FONT = '"Helvetica Neue Condensed", Helvetica, Arial, sans-serif';
const TITLE_SQUEEZE = 0.92;

const EXPAND_MS = 200;

/** Rows are ~17px tall. This padding is invisible and doubles the hit area. */
const HIT_BLEED = 9;

const rule = (px: number): string => `${px}px solid ${INK}`;

/* ── prefers-reduced-motion ──────────────────────────────────────────────── */

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReduced(onChange: () => void): () => void {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {};
  }
  const mql = window.matchMedia(REDUCED_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

const readReduced = (): boolean =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia(REDUCED_QUERY).matches;

function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReduced, readReduced, () => false);
}

/* ── condensed-title detection ───────────────────────────────────────────── */

/**
 * Measures the title string in the condensed family against a fallback. If the
 * widths match, the family did not resolve and we squeeze instead.
 *
 * Starts as `true` (squeeze) on both server and client so hydration is stable;
 * the effect only ever turns the squeeze OFF, and only on the rare machine that
 * actually ships Helvetica Neue Condensed.
 */
function condensedAvailable(): boolean {
  try {
    const ctx = document.createElement("canvas").getContext("2d");
    if (!ctx) return false;
    const probe = "Nutrition Facts";
    ctx.font = '800 30px monospace';
    const base = ctx.measureText(probe).width;
    ctx.font = '800 30px "Helvetica Neue Condensed", monospace';
    return Math.abs(ctx.measureText(probe).width - base) > 0.5;
  } catch {
    return false;
  }
}

let condensedCache: boolean | null = null;
const condensedOnce = (): boolean => {
  if (condensedCache === null) condensedCache = condensedAvailable();
  return condensedCache;
};
const noopSubscribe = () => () => {};

/* ── the one interaction ─────────────────────────────────────────────────── */

/**
 * Height animation off a MEASURED scrollHeight. `height: auto` does not
 * transition, so we go auto → measured → 0 on close and measured → auto on
 * open, which keeps multi-line notes from being clipped after the animation.
 */
function Expandable({
  open,
  instant,
  children,
}: {
  open: boolean;
  instant: boolean;
  children: React.ReactNode;
}): React.JSX.Element {
  const ref = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState<number | "auto">(open ? "auto" : 0);
  const first = useRef(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Never animate the initial paint — a label that unfurls on load has just
    // told everybody where the secret is. (Initial state already matches.)
    if (first.current) {
      first.current = false;
      return;
    }
    // Instant mode renders straight from `open` below; nothing to animate.
    if (instant) return;
    if (open) {
      setHeight(el.scrollHeight);
      const t = window.setTimeout(() => setHeight("auto"), EXPAND_MS);
      return () => window.clearTimeout(t);
    }
    setHeight(el.scrollHeight);
    let inner = 0;
    const outer = window.requestAnimationFrame(() => {
      inner = window.requestAnimationFrame(() => setHeight(0));
    });
    return () => {
      window.cancelAnimationFrame(outer);
      window.cancelAnimationFrame(inner);
    };
  }, [open, instant]);

  return (
    <div
      ref={ref}
      style={{
        overflow: "hidden",
        height: instant ? (open ? "auto" : 0) : height === "auto" ? "auto" : height,
        transition: instant ? "none" : `height ${EXPAND_MS}ms ease`,
      }}
    >
      {children}
    </div>
  );
}

/* ── a row ───────────────────────────────────────────────────────────────── */

function Row({
  label,
  amount,
  dv,
  bold = false,
  indent = 0,
  note,
  size,
  ruleTop,
  open,
  onToggle,
  instant,
}: {
  label: string;
  amount?: string;
  dv: string;
  bold?: boolean;
  indent?: 0 | 1 | 2;
  note?: string;
  size: number;
  ruleTop: number;
  open: boolean;
  onToggle: () => void;
  instant: boolean;
}): React.JSX.Element {
  const tappable = Boolean(note);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!tappable) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onToggle();
      }
    },
    [tappable, onToggle],
  );

  return (
    <div>
      <div
        role={tappable ? "button" : undefined}
        tabIndex={tappable ? 0 : undefined}
        aria-expanded={tappable ? open : undefined}
        onClick={tappable ? onToggle : undefined}
        onKeyDown={onKeyDown}
        style={{
          position: "relative",
          display: "flex",
          // flex-start, not baseline: a label that wraps past 24 characters must
          // leave its % on the FIRST line, top-aligned. Real panels wrap.
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 8,
          fontSize: size,
          lineHeight: 1.2,
          padding: "2px 0",
          borderTop: rule(ruleTop),
          cursor: tappable ? "pointer" : "default",
          outlineOffset: -1,
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <span style={{ paddingLeft: indent * 10, minWidth: 0 }}>
          <span style={{ fontWeight: bold ? 700 : 400 }}>{label}</span>
          {/* The amount is REGULAR even when the label is bold. "Total Fat 8g"
              is bold + regular on every printed panel in the world, and setting
              it bold is the single clearest tell that a label was drawn. */}
          {amount ? <span style={{ fontWeight: 400 }}> {amount}</span> : null}
        </span>
        <span style={{ fontWeight: 700, flex: "0 0 auto", whiteSpace: "nowrap" }}>{dv}</span>

        {/* Invisible hit region. Extends the tappable area past 32px without
            moving a single pixel of the visual layout. */}
        {tappable ? (
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: -HIT_BLEED,
              bottom: -HIT_BLEED,
            }}
          />
        ) : null}
      </div>

      {note ? (
        <Expandable open={open} instant={instant}>
          <div
            style={{
              borderTop: rule(RULE.hairline),
              fontSize: 9,
              fontStyle: "italic",
              lineHeight: 1.3,
              paddingTop: 3,
              paddingBottom: 4,
              paddingLeft: 10 + indent * 10,
              paddingRight: 2,
            }}
          >
            {note}
          </div>
        </Expandable>
      ) : null}
    </div>
  );
}

/* ── the label ───────────────────────────────────────────────────────────── */

export function NutritionLabel({
  data,
  openRows,
  onToggleRow,
  capture = false,
}: {
  data: NutritionData;
  openRows: Set<string>;
  onToggleRow: (label: string) => void;
  capture?: boolean;
}): React.JSX.Element {
  const reduced = useReducedMotion();
  const instant = capture || reduced;

  // Squeeze unless the machine really has the condensed cut. Server snapshot
  // squeezes too, so hydration is stable.
  const squeeze = !useSyncExternalStore(noopSubscribe, condensedOnce, () => false);

  const nutrients: Nutrient[] = data.nutrients ?? [];
  const vitamins: Vitamin[] = data.vitamins ?? [];
  const notSignificant = data.notSignificantSource ?? [];

  // Warn, never truncate. Silently dropping a sender's line is worse than an
  // ugly label — they wrote it, they get to see it.
  useEffect(() => {
    if (nutrients.length > NUTRIENT_SOFT_MAX) {
      console.warn(
        `[nutrition] ${nutrients.length} nutrients exceeds NUTRIENT_SOFT_MAX (${NUTRIENT_SOFT_MAX}). ` +
          `The panel will render all of them, but past ~${NUTRIENT_SOFT_MAX} it reads as a spreadsheet rather than a label.`,
      );
    }
  }, [nutrients.length]);

  const hasVitamins = vitamins.length > 0;
  const hasNotSignificant = notSignificant.length > 0;

  // If both closing blocks are absent the footnote inherits the medium rule, so
  // the nutrient block still terminates properly instead of trailing off.
  const footnoteRule =
    hasVitamins || hasNotSignificant ? RULE.hairline : RULE.medium;

  const ingredients = useMemo(() => {
    const list = (data.ingredients ?? []).filter(Boolean);
    return list.length > 0 ? `${list.join(", ")}.` : "";
  }, [data.ingredients]);

  const isOpen = (label: string): boolean => capture || openRows.has(label);

  return (
    <div style={{ width: LABEL_WIDTH, fontFamily: FONT, color: INK }}>
      {/* The only hint the interaction exists. Not a button, not a chevron. */}
      {!capture ? (
        <div style={{ fontSize: 9, lineHeight: 1.4, paddingBottom: 3, opacity: 0.55 }}>
          tap anything
        </div>
      ) : null}

      <div
        style={{
          width: LABEL_WIDTH,
          boxSizing: "border-box",
          background: PAPER,
          border: `1px solid ${INK}`,
          padding: 6,
          textAlign: "left",
        }}
      >
        {/* 1 — TITLE */}
        <div
          style={{
            fontFamily: TITLE_FONT,
            fontSize: 30,
            fontWeight: 800,
            letterSpacing: "-1px",
            lineHeight: 1,
            transform: squeeze ? `scaleX(${TITLE_SQUEEZE})` : undefined,
            transformOrigin: "left center",
          }}
        >
          Nutrition Facts
        </div>

        {/* 2 — hairline · 3 — servings per container */}
        <div
          style={{
            borderTop: rule(RULE.hairline),
            fontSize: 11,
            lineHeight: 1.3,
            paddingTop: 2,
          }}
        >
          Servings per container: {data.servingsPerContainer}
        </div>

        {/* 4 — serving size */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: 8,
            fontSize: 13,
            fontWeight: 700,
            lineHeight: 1.25,
            paddingBottom: 2,
          }}
        >
          <span>Serving size</span>
          <span style={{ textAlign: "right" }}>{data.servingSize}</span>
        </div>

        {/* 5 — EXTRA-THICK (10) · 6 — Amount Per Serving */}
        <div
          style={{
            borderTop: rule(RULE.extraThick),
            fontSize: 10,
            fontWeight: 700,
            lineHeight: 1.2,
            paddingTop: 2,
          }}
        >
          Amount Per Serving
        </div>

        {/* 7 — CALORIES. `calories` is free text. It is printed, never parsed. */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.1 }}>Calories</span>
          <span style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.1 }}>{data.calories}</span>
        </div>
        {data.caloriesNote ? (
          <div
            style={{
              fontSize: 9,
              fontStyle: "italic",
              lineHeight: 1.2,
              textAlign: "right",
              paddingBottom: 2,
            }}
          >
            {data.caloriesNote}
          </div>
        ) : (
          <div style={{ height: 2 }} />
        )}

        {/* 8 — THICK (7) · 9 — % Daily Value, right-aligned, own line */}
        <div
          style={{
            borderTop: rule(RULE.thick),
            fontSize: 10,
            fontWeight: 700,
            lineHeight: 1.2,
            textAlign: "right",
            paddingTop: 2,
            paddingBottom: 2,
          }}
        >
          % Daily Value*
        </div>

        {/* 10 + 11 — every nutrient row carries its own hairline TOP border, so
            the first row's border is the rule under "% Daily Value*" and the
            last row is closed by the medium rule of whatever follows. */}
        {nutrients.map((n, i) => (
          <Row
            key={`${n.label}-${i}`}
            label={n.label}
            amount={n.amount}
            dv={n.dv}
            bold={n.bold}
            indent={n.indent ?? 0}
            note={n.note}
            size={11}
            ruleTop={RULE.hairline}
            open={isOpen(n.label)}
            onToggle={() => onToggleRow(n.label)}
            instant={instant}
          />
        ))}

        {/* 12 + 13 — MEDIUM (4) then the vitamins block. Empty vitamins skips
            the block AND its rule; the next section carries the medium rule
            instead, so there is never a double rule. */}
        {hasVitamins ? (
          <div style={{ borderTop: rule(RULE.medium) }}>
            {vitamins.map((v, i) => (
              <Row
                key={`${v.label}-${i}`}
                label={v.label}
                dv={v.dv}
                note={v.note}
                size={10}
                ruleTop={i === 0 ? 0 : RULE.hairline}
                open={isOpen(v.label)}
                onToggle={() => onToggleRow(v.label)}
                instant={instant}
              />
            ))}
          </div>
        ) : null}

        {/* 14 — MEDIUM (4) · 15 — the funniest line, set in the driest type */}
        {hasNotSignificant ? (
          <div
            style={{
              borderTop: rule(RULE.medium),
              fontSize: 9,
              fontStyle: "italic",
              lineHeight: 1.3,
              paddingTop: 3,
              paddingBottom: 3,
            }}
          >
            Not a significant source of {notSignificant.join(", ")}.
          </div>
        ) : null}

        {/* 16 — hairline · 17 — FOOTNOTE */}
        <div
          style={{
            borderTop: rule(footnoteRule),
            fontSize: 8,
            lineHeight: 1.2,
            textAlign: "justify",
            paddingTop: 3,
          }}
        >
          * The % Daily Value tells you how much a nutrient in a serving contributes to a daily
          diet. {data.footnote}
        </div>
      </div>

      {/* BELOW the black border — dense, unbroken, deliberately hard to read. */}
      {ingredients ? (
        <div
          style={{
            fontSize: 9,
            lineHeight: 1.15,
            letterSpacing: "-0.1px",
            textAlign: "justify",
            paddingTop: 5,
          }}
        >
          <span style={{ fontWeight: 700 }}>INGREDIENTS:</span> {ingredients}
        </div>
      ) : null}

      {data.allergen ? (
        <div
          style={{
            fontSize: 9,
            fontWeight: 700,
            lineHeight: 1.2,
            textTransform: "uppercase",
            paddingTop: 4,
          }}
        >
          {data.allergen}
        </div>
      ) : null}
    </div>
  );
}

export default NutritionLabel;
