"use client";

// ─── Rewind — kinetic typography primitives ──────────────────────────────────
//
// The signatures in here are the contract four other modules compile against.
// They do not change. The implementations are free.
//
// Rule every slide depends on: text MOVES IN, it never just appears. And under
// prefers-reduced-motion every primitive renders its final state instantly —
// reduced motion removes decoration, never content.
//
// THREE DESIGN DECISIONS, all of which matter downstream:
//
// 1. Web Animations API, not CSS classes and not a motion library.
//    - Nothing is injected into a global stylesheet, so five agents editing
//      five files cannot collide on a keyframe name or a class name.
//    - EASE_OUT_EXPO is a cubic-bezier string and drops straight into the
//      `easing` option.
//    - The share-card export walks `document.getAnimations()` and calls
//      `.pause()` / `.finish()` on the capture subtree before rasterising.
//      WAAPI animations are discoverable that way; CSS transitions are not.
//
// 2. THE RESTING DOM STATE IS ALREADY THE FINAL STATE. Every primitive animates
//    *from* an offset *to* the element's natural style. Nothing is revealed by
//    an animation. So: JS never runs → correct. `element.animate` missing →
//    correct. Animation cancelled, finished, or paused → correct. Reduced
//    motion → correct. There is no configuration of this file in which text is
//    invisible.
//
// 3. Animations are `fill: "both"` while running and are cancelled the instant
//    they finish. Fill-both means a mid-flight `.finish()` from the exporter
//    lands on the final keyframe; cancelling on finish means the element falls
//    back to its (identical) resting style and `document.getAnimations()` does
//    not accumulate hundreds of settled entries across a twelve-slide deck.

import React from "react";
import { EASE_OUT_EXPO, SLIDE } from "./types";

// ─── Shared type stacks ──────────────────────────────────────────────────────
//
// Exported so five agents do not retype them and drift. Both families are
// already loaded globally as CSS variables — do not import a font anywhere.

/** Condensed display face. Use at weight 600/700, uppercase, tracking -0.02em. */
export const DISPLAY_FONT = 'var(--font-oswald), "Arial Narrow", sans-serif';

/** Body and UI face. */
export const BODY_FONT = "var(--font-outfit), system-ui, sans-serif";

/** Default entrance durations, in ms. Tuned against SLIDE.defaultMs = 4500. */
const DUR = {
  fade: 620,
  word: 620,
  /** The big statement wants more room to breathe. */
  letter: 900,
  row: 700,
} as const;

// ─── Reduced motion ──────────────────────────────────────────────────────────

const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void): () => void {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {};
  }
  const mq = window.matchMedia(REDUCE_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function readReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia(REDUCE_QUERY).matches;
}

const readReducedMotionServer = (): boolean => false;

/**
 * Live prefers-reduced-motion. Re-renders when the user flips the OS setting.
 *
 * useSyncExternalStore rather than useState + useEffect: it is SSR-safe (the
 * server snapshot is a constant, no window is touched during a server render)
 * AND it delivers the correct value on the FIRST client render. The effect
 * version reports `false` for one frame, which is exactly long enough for every
 * entrance on the first slide to start animating before being cancelled — a
 * visible motion flash for the one user who asked for no motion.
 */
export function useReducedMotion(): boolean {
  return React.useSyncExternalStore(
    subscribeReducedMotion,
    readReducedMotion,
    readReducedMotionServer,
  );
}

// ─── The numeric curve ───────────────────────────────────────────────────────

/**
 * The deceleration curve. t in 0..1, output 0..1.
 *
 * `1 - 2^(-10t)` normalised so that easeOutExpo(1) === 1 exactly (the raw form
 * lands on 0.999023, which shows up as a giant number that finishes on 846
 * instead of 847). Deliberately aggressive: a quarter of the way through the
 * duration it is already 82% of the way to the target, which is what makes a
 * count-up read as "snapped into place" rather than "ticked up".
 */
const EXPO_SCALE = 1 / (1 - Math.pow(2, -10)); // 1 / 0.9990234375

export function easeOutExpo(t: number): number {
  if (!(t > 0)) return 0; // also catches NaN
  if (t >= 1) return 1;
  return (1 - Math.pow(2, -10 * t)) * EXPO_SCALE;
}

// ─── WAAPI plumbing ──────────────────────────────────────────────────────────

export interface KineticBase {
  reduced?: boolean;
  delayMs?: number;
  className?: string;
  style?: React.CSSProperties;
}

const useIsoLayoutEffect =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

/**
 * Start one entrance on one element. Returns null — harmlessly — whenever the
 * platform cannot run it (old Safari, jsdom, a detached node), in which case
 * the element simply stays in its resting state, which is the final state.
 */
function startEntrance(
  el: HTMLElement,
  frames: Keyframe[],
  durationMs: number,
  delayMs: number,
  willChange?: string,
): Animation | null {
  if (typeof el.animate !== "function") return null;

  const prevWillChange = el.style.willChange;
  const restore = () => {
    el.style.willChange = prevWillChange;
  };
  if (willChange) el.style.willChange = willChange;

  let anim: Animation;
  try {
    anim = el.animate(frames, {
      duration: Math.max(0, durationMs),
      delay: Math.max(0, delayMs),
      easing: EASE_OUT_EXPO,
      // fill:"both" holds the FIRST frame through the delay and the LAST frame
      // after the end — so a .finish() from the PNG exporter lands on the final
      // visual state rather than snapping back mid-entrance.
      fill: "both",
    });
  } catch {
    restore();
    return null;
  }

  anim.onfinish = () => {
    restore();
    try {
      // Resting style === final keyframe, so dropping the fill is invisible.
      anim.cancel();
    } catch {
      /* already detached */
    }
  };
  anim.oncancel = restore;
  return anim;
}

/**
 * Attach a mount entrance to a single element.
 *
 * Public because several slides want a bespoke keyframe pair (a scale pop, a
 * clip reveal) without re-deriving the cancellation and reduced-motion rules.
 * Memoise `frames` at the call site — a fresh array every render restarts the
 * animation.
 */
export function useEntranceRef<T extends HTMLElement>(
  frames: Keyframe[] | null | undefined,
  opts?: { durationMs?: number; delayMs?: number; reduced?: boolean; willChange?: string },
): React.RefObject<T | null> {
  const ref = React.useRef<T | null>(null);
  const durationMs = opts?.durationMs ?? DUR.fade;
  const delayMs = opts?.delayMs ?? 0;
  const reduced = opts?.reduced ?? false;
  const willChange = opts?.willChange;

  useIsoLayoutEffect(() => {
    if (reduced || !frames || frames.length === 0) return;
    const el = ref.current;
    if (!el) return;
    const anim = startEntrance(el, frames, durationMs, delayMs, willChange);
    return () => {
      anim?.cancel();
    };
  }, [frames, durationMs, delayMs, reduced, willChange]);

  return ref;
}

/**
 * Attach a staggered entrance to the marked DIRECT children of one host.
 *
 * One effect and one ref for N children instead of N hooks, which keeps the
 * hook count stable when a word count or a row count changes. `signature`
 * re-runs the stagger when the content genuinely changes.
 */
function useStaggerHost<T extends HTMLElement>(
  frames: Keyframe[],
  marker: string,
  opts: {
    signature: string;
    staggerMs: number;
    durationMs: number;
    delayMs: number;
    reduced: boolean;
    willChange?: string;
  },
): React.RefObject<T | null> {
  const ref = React.useRef<T | null>(null);
  const { signature, staggerMs, durationMs, delayMs, reduced, willChange } = opts;

  useIsoLayoutEffect(() => {
    if (reduced || !signature) return;
    const host = ref.current;
    if (!host) return;

    const anims: Animation[] = [];
    let i = 0;
    for (const child of Array.from(host.children)) {
      if (!(child instanceof HTMLElement) || child.dataset.k !== marker) continue;
      const a = startEntrance(child, frames, durationMs, delayMs + i * staggerMs, willChange);
      if (a) anims.push(a);
      i++;
    }

    return () => {
      for (const a of anims) a.cancel();
    };
  }, [frames, marker, signature, staggerMs, durationMs, delayMs, reduced, willChange]);

  return ref;
}

// ─── Polymorphic tag helper ──────────────────────────────────────────────────

interface TagProps {
  ref?: React.Ref<HTMLElement>;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/**
 * `as` is an intrinsic tag in every current call site. The cast is written
 * inline at each use rather than behind a helper: a helper CALL that returns a
 * component trips react-hooks/static-components, even though the value is just
 * the caller's own `as` prop passed through.
 */
type Tagged = React.ComponentType<TagProps>;

// ─── Count-up ────────────────────────────────────────────────────────────────

/**
 * rAF count-up with hard deceleration. Returns the current value.
 *
 * - Reduced motion returns the target immediately and never schedules a frame.
 * - A target that changes mid-flight animates FROM the value currently on
 *   screen, not from zero — retargeting must not look like a restart.
 * - target === 0 (and any no-op retarget) short-circuits with no frame at all.
 */
export function useCountUp(
  target: number,
  opts?: { durationMs?: number; reduced?: boolean; delayMs?: number },
): number {
  const durationMs = opts?.durationMs ?? SLIDE.countUpMs;
  const delayMs = opts?.delayMs ?? 0;
  const reduced = opts?.reduced ?? false;

  // Both seeded from the same first-render value: reduced motion starts (and
  // stays) on the target, everything else counts up from zero.
  const seed = reduced ? target : 0;
  const latest = React.useRef(seed);
  const [value, setValue] = React.useState(seed);

  const write = React.useCallback((n: number) => {
    if (latest.current === n) return;
    latest.current = n;
    setValue(n);
  }, []);

  React.useEffect(() => {
    if (reduced) {
      write(target);
      return;
    }
    const from = latest.current;
    if (from === target) return;
    if (typeof requestAnimationFrame !== "function" || !(durationMs > 0)) {
      write(target);
      return;
    }

    let raf = 0;
    let startTs = 0;
    const span = target - from;

    const step = (ts: number) => {
      if (!startTs) startTs = ts;
      const elapsed = ts - startTs - delayMs;
      if (elapsed < 0) {
        raf = requestAnimationFrame(step);
        return;
      }
      const t = Math.min(1, elapsed / durationMs);
      write(Math.round(from + span * easeOutExpo(t)));
      if (t < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs, delayMs, reduced, write]);

  return value;
}

const defaultCountFormat = (n: number): string => n.toLocaleString("en-IN");

/**
 * A counting number.
 *
 * `tabular-nums` is not a nicety: at 180px a proportional "1" is roughly half
 * the width of a "4", so an un-tabular count-up visibly reflows its own width
 * every frame and drags whatever sits next to it. This is the single cheapest
 * thing in the file and the most expensive-looking.
 */
export function CountUp(
  props: KineticBase & { value: number; durationMs?: number; format?: (n: number) => string },
): React.JSX.Element {
  const v = useCountUp(props.value, {
    durationMs: props.durationMs,
    reduced: props.reduced,
    delayMs: props.delayMs,
  });
  const fmt = props.format ?? defaultCountFormat;
  return (
    <span
      className={props.className}
      style={{ fontVariantNumeric: "tabular-nums", ...props.style }}
    >
      {fmt(v)}
    </span>
  );
}

// ─── Word stagger ────────────────────────────────────────────────────────────

const WORD_FRAMES: Keyframe[] = [
  { opacity: 0, transform: "translate3d(0, 24px, 0)" },
  { opacity: 1, transform: "translate3d(0, 0, 0)" },
];

interface Part {
  t: string;
  word: boolean;
}

function splitPreservingSpace(text: string): Part[] {
  const out: Part[] = [];
  for (const chunk of text.split(/(\s+)/)) {
    if (!chunk) continue;
    out.push({ t: chunk, word: !/^\s+$/.test(chunk) });
  }
  return out;
}

/**
 * Words enter one at a time, translateY(24px) → 0 with opacity.
 *
 * Whitespace is preserved as real text nodes and the host is `pre-wrap`, so a
 * long line still wraps normally at 380px — the words are inline-block, not
 * blocks, and the line breaks land exactly where they would in plain text.
 * Reduced motion renders the plain string with no spans at all.
 */
export function WordStagger(
  props: KineticBase & {
    text: string;
    as?: React.ElementType;
    staggerMs?: number;
    durationMs?: number;
  },
): React.JSX.Element {
  const Tag = (props.as ?? "div") as unknown as Tagged;
  const reduced = props.reduced ?? false;

  const parts = React.useMemo(
    () => (reduced ? [] : splitPreservingSpace(props.text)),
    [props.text, reduced],
  );

  const ref = useStaggerHost<HTMLElement>(WORD_FRAMES, "w", {
    signature: reduced ? "" : props.text,
    staggerMs: props.staggerMs ?? SLIDE.wordStaggerMs,
    durationMs: props.durationMs ?? DUR.word,
    delayMs: props.delayMs ?? 0,
    reduced,
    willChange: "transform, opacity",
  });

  if (reduced) {
    return (
      <Tag className={props.className} style={props.style}>
        {props.text}
      </Tag>
    );
  }

  return (
    <Tag
      ref={ref}
      className={props.className}
      style={{ whiteSpace: "pre-wrap", ...props.style }}
    >
      {parts.map((p, i) =>
        p.word ? (
          <span key={i} data-k="w" style={{ display: "inline-block" }}>
            {p.t}
          </span>
        ) : (
          <React.Fragment key={i}>{p.t}</React.Fragment>
        ),
      )}
    </Tag>
  );
}

// ─── Letter-space in ─────────────────────────────────────────────────────────

/**
 * letter-spacing `from` → the element's own resting tracking, as opacity rises.
 * The "big statement" primitive; used on the archetype reveal.
 *
 * Tracking animates the element's LAYOUT WIDTH, so it is centred by default
 * (override via `style`) — left-aligned it looks like the text is sliding
 * rather than settling. `will-change` is applied for the duration only; leaving
 * it on permanently would keep a layer alive for every slide in the deck.
 */
export function LetterSpaceIn(
  props: KineticBase & {
    children: React.ReactNode;
    as?: React.ElementType;
    durationMs?: number;
    from?: string;
  },
): React.JSX.Element {
  const Tag = (props.as ?? "div") as unknown as Tagged;
  const reduced = props.reduced ?? false;
  const from = props.from ?? "0.3em";
  const durationMs = props.durationMs ?? DUR.letter;
  const delayMs = props.delayMs ?? 0;

  const ref = React.useRef<HTMLElement | null>(null);

  useIsoLayoutEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;

    // Read first, write second. getComputedStyle resolves the resting tracking
    // to px whatever unit the caller authored it in; "normal" is not an
    // interpolable endpoint, and 0px is visually identical to it here.
    const resting = window.getComputedStyle(el).letterSpacing;
    const to = !resting || resting === "normal" ? "0px" : resting;

    const anim = startEntrance(
      el,
      [
        { letterSpacing: from, opacity: 0 },
        { letterSpacing: to, opacity: 1 },
      ],
      durationMs,
      delayMs,
      "letter-spacing, opacity",
    );
    return () => {
      anim?.cancel();
    };
  }, [reduced, from, durationMs, delayMs]);

  return (
    <Tag
      ref={ref}
      className={props.className}
      style={{ textAlign: "center", ...props.style }}
    >
      {props.children}
    </Tag>
  );
}

// ─── Fade up ─────────────────────────────────────────────────────────────────

/** Generic mount entrance: opacity 0→1 plus translateY(fromY)→0. The workhorse. */
export function FadeUp(
  props: KineticBase & {
    children: React.ReactNode;
    fromY?: number;
    durationMs?: number;
    as?: React.ElementType;
  },
): React.JSX.Element {
  const Tag = (props.as ?? "div") as unknown as Tagged;
  const fromY = props.fromY ?? 24;

  const frames = React.useMemo<Keyframe[]>(
    () => [
      { opacity: 0, transform: `translate3d(0, ${fromY}px, 0)` },
      { opacity: 1, transform: "translate3d(0, 0, 0)" },
    ],
    [fromY],
  );

  const ref = useEntranceRef<HTMLElement>(frames, {
    durationMs: props.durationMs ?? DUR.fade,
    delayMs: props.delayMs,
    reduced: props.reduced,
    willChange: "transform, opacity",
  });

  return (
    <Tag ref={ref} className={props.className} style={props.style}>
      {props.children}
    </Tag>
  );
}

// ─── Stagger list ────────────────────────────────────────────────────────────

/**
 * Rows slide in from the left, one every staggerMs. Used by the ranked list —
 * the highest-screenshot slide in the deck, so the default cadence
 * (SLIDE.rowStaggerMs = 220) is slow enough to read each row land.
 *
 * Each child gets its own animated block container; that container is the moving
 * node so a child's own transform (a rotation, a scale) is never clobbered.
 */
export function StaggerList(
  props: KineticBase & {
    children: React.ReactNode;
    staggerMs?: number;
    fromX?: number;
    durationMs?: number;
  },
): React.JSX.Element {
  const reduced = props.reduced ?? false;
  const fromX = props.fromX ?? -40;
  const items = React.useMemo(() => React.Children.toArray(props.children), [props.children]);

  const frames = React.useMemo<Keyframe[]>(
    () => [
      { opacity: 0, transform: `translate3d(${fromX}px, 0, 0)` },
      { opacity: 1, transform: "translate3d(0, 0, 0)" },
    ],
    [fromX],
  );

  const ref = useStaggerHost<HTMLDivElement>(frames, "r", {
    signature: reduced ? "" : `n${items.length}`,
    staggerMs: props.staggerMs ?? SLIDE.rowStaggerMs,
    durationMs: props.durationMs ?? DUR.row,
    delayMs: props.delayMs ?? 0,
    reduced,
    willChange: "transform, opacity",
  });

  return (
    <div ref={ref} className={props.className} style={props.style}>
      {items.map((child, i) => (
        <div key={i} data-k="r">
          {child}
        </div>
      ))}
    </div>
  );
}

// ─── Fit text ────────────────────────────────────────────────────────────────

function fingerprintChildren(children: React.ReactNode): string {
  let out = "";
  React.Children.forEach(children, (c) => {
    if (c === null || c === undefined || typeof c === "boolean") return;
    if (typeof c === "string" || typeof c === "number") {
      out += String(c);
      return;
    }
    if (React.isValidElement(c)) {
      const kids = (c.props as { children?: React.ReactNode }).children;
      out += `<${typeof c.type === "string" ? c.type : "c"}${fingerprintChildren(kids)}>`;
      return;
    }
    out += "?";
  });
  return out;
}

const INF = Number.POSITIVE_INFINITY;

/**
 * Shrinks the font until the content fits its container box on BOTH axes.
 * For archetype names: capped at 24 characters, but "THE CHAOS COORDINATORS"
 * still has to survive a 380px viewport.
 *
 * Mechanics, because the naive version of this either thrashes or loops:
 *
 * - Binary search between minPx and maxPx, ≤10 probes, then it stops. It cannot
 *   loop; the iteration count is a constant.
 * - The available height is discovered by hiding the content for one read: if
 *   the box survives with no content it has a definite height and that height
 *   is the constraint; if it collapses, the height is content-driven and only
 *   the width constrains. Hiding and restoring inside one task means the
 *   ResizeObserver never sees the intermediate size.
 * - The observer refits only when the measured box actually changed by more
 *   than half a pixel, which is what stops the classic feedback loop where
 *   resizing the text resizes the box resizes the text.
 */
export function FitText(props: {
  children: React.ReactNode;
  maxPx: number;
  minPx: number;
  className?: string;
  style?: React.CSSProperties;
}): React.JSX.Element {
  const { children, maxPx, minPx } = props;
  const outerRef = React.useRef<HTMLDivElement | null>(null);
  const innerRef = React.useRef<HTMLDivElement | null>(null);
  const [size, setSize] = React.useState(maxPx);

  const contentKey = React.useMemo(() => fingerprintChildren(children), [children]);

  useIsoLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;
    if (!contentKey) {
      setSize(maxPx);
      return;
    }

    const lo0 = Math.max(1, Math.min(minPx, maxPx));
    const hi0 = Math.max(lo0, maxPx);
    let lastW = -1;
    let lastH = -1;

    const measureBox = (): { w: number; h: number } => {
      const cs = window.getComputedStyle(outer);
      const padX = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
      const padY = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
      const w = outer.clientWidth - padX;

      const prevDisplay = inner.style.display;
      inner.style.display = "none";
      const bare = outer.clientHeight - padY;
      inner.style.display = prevDisplay;

      return { w: w > 0 ? w : INF, h: bare > 1 ? bare : INF };
    };

    const fitsAt = (px: number, box: { w: number; h: number }): boolean => {
      inner.style.fontSize = `${px}px`;
      return inner.scrollWidth <= box.w + 0.5 && inner.scrollHeight <= box.h + 0.5;
    };

    const refit = () => {
      const box = measureBox();
      lastW = box.w;
      lastH = box.h;

      let best = lo0;
      if (fitsAt(hi0, box)) {
        best = hi0;
      } else {
        let lo = lo0;
        let hi = hi0;
        for (let i = 0; i < 10 && hi - lo > 0.5; i++) {
          const mid = (lo + hi) / 2;
          if (fitsAt(mid, box)) {
            best = mid;
            lo = mid;
          } else {
            hi = mid;
          }
        }
      }

      const px = Math.round(best * 100) / 100;
      inner.style.fontSize = `${px}px`;
      setSize(px);
    };

    refit();

    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      const box = measureBox();
      const changed =
        Math.abs(box.w - lastW) > 0.5 ||
        (box.h === INF) !== (lastH === INF) ||
        (box.h !== INF && lastH !== INF && Math.abs(box.h - lastH) > 0.5);
      if (changed) refit();
    });
    ro.observe(outer);
    return () => ro.disconnect();
  }, [contentKey, maxPx, minPx]);

  return (
    <div
      ref={outerRef}
      className={props.className}
      style={{ overflow: "hidden", ...props.style }}
    >
      <div ref={innerRef} style={{ fontSize: size }}>
        {children}
      </div>
    </div>
  );
}
