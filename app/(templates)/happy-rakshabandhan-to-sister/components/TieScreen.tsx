"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RS, BRAND_GRADIENT, CARD_BORDER, CARD_SHADOW } from "./theme";
import {
  RAKHI_STYLES,
  rakhiStyle,
  sisterWord,
  type RakhiStyle,
  type SisterData,
} from "./types";
import { Marigold, PetalFall, Rangoli, ThreadRule } from "./Ornaments";
import Stage, { BackLink, useIsDesktop } from "./Stage";
import type { Entry } from "./SisterTemplate";

// ─── The signature interaction ───────────────────────────────────────────────
//
//   tray  →  she picks one of five rakhis
//   tie   →  she presses and HOLDS on his wrist and the thread winds
//   tied  →  the knot cinches, petals fall, the pendant settles
//
// ── HOLD, NOT DRAG, AND THIS IS A CORRECTION WORTH KEEPING ──────────────────
//
// The first design of this screen was a drag: pull the loose end of the thread
// around the wrist. Interaction research killed it, and the reasoning is worth
// writing down here so nobody re-invents it in six months as an "improvement".
//
// A pull-the-thread drag is undiscoverable. Nothing on a screen can tell you that
// a drag is expected, where it should start, or what path it should follow, and the
// tell is that every such interface ends up shipping an animated hand icon to
// explain itself. Worse, a CURVED drag on a 360px phone is fiddly even once you
// know: the thumb occludes the target it is circling, and the browser reads the
// vertical component as a scroll and takes the gesture away mid-way.
//
// Hold wins on every axis that matters here:
//   • it announces itself — one large target, a label on it, and an arc that fills
//   • it is one finger ANYWHERE on the target, not a specific path
//   • it is identical with a mouse
//   • it is genuinely keyboard-operable: Space or Enter held down fills the same arc
//   • and it reads better. Tying a rakhi is a sustained, deliberate act. It is not
//     a swipe, and nobody does it quickly.
//
// A drag is still accepted as a BONUS — pointer travel while she is holding adds to
// the fill (see `DRAG_PER_PX`), so a sister who instinctively winds her thumb
// around the wrist is rewarded rather than corrected. Nothing REQUIRES it.
//
// ── AND THERE IS ALWAYS A BUTTON ────────────────────────────────────────────
//
// An unfinishable ritual is a dead page, so `tie it` exists as an explicit,
// permanently visible one-tap fallback under the wrist. That is not belt-and-braces
// paranoia: a screen-reader user on a phone cannot reliably perform a press-and-hold
// at all, because VoiceOver and TalkBack consume the gesture and pass through a
// double-tap. Without the button, the entire template would end at this screen for
// them. It is worded and styled as an escape hatch ("Nahi ho raha?") rather than as
// a second primary action, so it does not quietly become the path everybody takes.

/** Roughly 1.5s: long enough to feel deliberate, short enough not to read as broken. */
const HOLD_MS = 1500;

/** Unwinding is slower than winding — a thread going slack does not snap back. */
const UNWIND_MS = 900;

/**
 * How much she loses by letting go early.
 *
 * Releasing mid-wind slackens the thread by about a quarter turn and STOPS there;
 * it does not reset. Two reasons. It is what a real thread does. And it means a
 * reader whose hold keeps getting interrupted — a notification, a bumpy bus, a
 * hand that cannot sustain pressure — still makes net progress across several
 * attempts instead of being punished back to zero each time, which is the failure
 * mode that makes hold-to-confirm interfaces feel hostile.
 */
const SLACK = 0.28;

/** Five passes of thread around the wrist. */
const WRAPS = 5;

/** A bonus drag contributes about a third as fast as the hold itself. */
const DRAG_PER_PX = 1 / 900;

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

// ── prefers-reduced-motion, read the way the viewport is read ────────────────
//
// Module scope so the identities are stable, `useSyncExternalStore` so the server
// render and the hydration pass agree (it reports "not reduced" for both, which is
// safe here because nothing on this screen moves until she touches it), and no
// setState in an effect, which this repo's lint rule fails the build for.
const REDUCED = "(prefers-reduced-motion: reduce)";
const subscribeReduced = (onChange: () => void) => {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};
const reducedSnapshot = () => window.matchMedia(REDUCED).matches;
const reducedServerSnapshot = () => false;

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReduced, reducedSnapshot, reducedServerSnapshot);
}

// ─── The five rakhis, drawn ──────────────────────────────────────────────────
//
// ── WHY EACH ONE IS A DIFFERENT SHAPE AND NOT A DIFFERENT COLOUR ────────────
//
// The cheap build of a five-way choice is one drawing tinted five ways. It reads as
// a colour picker, and a colour picker is not a choice between objects — it is a
// choice between hex values, which is exactly the decision nobody came here to
// make. `RAKHI_STYLES` describes five genuinely different things (a marigold, a
// sandalwood disc, an evil eye, pearls, and the plain red thread Dadi ties), so
// each gets its own geometry and only borrows its palette from the data.
//
// ── THE GLYPH IS ALLOWED TO FAIL ────────────────────────────────────────────
//
// Each style carries a `glyph` character. Some of them (☙, ◉) are outside the
// coverage of a few Android system fonts and will render as a tofu box. That is an
// acceptable risk ONLY because the shape underneath already carries the identity:
// the glyph sits small and centred on a solid bead, so a missing one costs a 9px
// square inside a medallion rather than making the object unrecognisable. Nazar's
// glyph is an emoji and is deliberately not drawn at all — emoji inside SVG <text>
// rasterises at a size and baseline no two engines agree on, and the eye it would
// sit on top of already IS the glyph.

/** One full cycle of the ply weave is 24 units, so four cycles span x = 2 → 98. */
const PLY_OVER = `M2 28 ${"q 6 -7 12 0 q 6 7 12 0 ".repeat(4)}`;
const PLY_UNDER = `M2 28 ${"q 6 7 12 0 q 6 -7 12 0 ".repeat(4)}`;

/** Regular polygon points about (50, 28), rotated so a flat edge faces up. */
const polygon = (sides: number, r: number) =>
  Array.from({ length: sides })
    .map((_, i) => {
      const a = (i / sides) * Math.PI * 2 - Math.PI / sides;
      return `${(50 + r * Math.cos(a)).toFixed(2)},${(28 + r * Math.sin(a)).toFixed(2)}`;
    })
    .join(" ");

const SYMBOL_FONT = "Apple Symbols, Segoe UI Symbol, Noto Sans Symbols 2, serif";

type Style = (typeof RAKHI_STYLES)[number];

function Medallion({ s }: { s: Style }) {
  if (s.id === "phool") {
    return (
      <>
        {Array.from({ length: 8 }).map((_, i) => (
          <ellipse
            key={i}
            cx={50}
            cy={14}
            rx={6.4}
            ry={12}
            transform={`rotate(${i * 45} 50 28)`}
            fill={i % 2 ? s.threadB : s.threadA}
            opacity={i % 2 ? 0.94 : 1}
          />
        ))}
        <circle cx={50} cy={28} r={8.6} fill={s.bead} />
        <circle cx={50} cy={28} r={8.6} fill="none" stroke={RS.surface} strokeWidth={1} opacity={0.8} />
        <text
          x={50}
          y={31.8}
          textAnchor="middle"
          fontSize={10}
          fill={RS.ink}
          style={{ fontFamily: SYMBOL_FONT }}
        >
          {s.glyph}
        </text>
      </>
    );
  }

  if (s.id === "chandan") {
    return (
      <>
        <polygon points={polygon(8, 19)} fill={s.threadB} />
        <polygon points={polygon(8, 14.6)} fill={s.threadA} opacity={0.92} />
        <circle cx={50} cy={28} r={9.4} fill="none" stroke={s.bead} strokeWidth={1.5} />
        <circle cx={50} cy={28} r={6.2} fill={s.bead} />
        <text
          x={50}
          y={31.4}
          textAnchor="middle"
          fontSize={9}
          fill={s.threadB}
          style={{ fontFamily: SYMBOL_FONT }}
        >
          {s.glyph}
        </text>
      </>
    );
  }

  if (s.id === "nazar") {
    return (
      <>
        <circle cx={50} cy={28} r={21.4} fill="none" stroke={s.bead} strokeWidth={1.4} strokeDasharray="3 3" />
        <circle cx={50} cy={28} r={19} fill={s.threadA} />
        <circle cx={50} cy={28} r={13.6} fill={RS.surface} />
        <circle cx={50} cy={28} r={8.6} fill={s.threadB} />
        <circle cx={50} cy={28} r={4} fill={RS.ink} />
        <circle cx={52.4} cy={25.4} r={1.5} fill={RS.surface} opacity={0.92} />
      </>
    );
  }

  if (s.id === "moti") {
    return (
      <>
        <circle cx={50} cy={28} r={16.4} fill={s.threadA} />
        <circle cx={50} cy={28} r={16.4} fill="none" stroke={s.threadB} strokeWidth={1.4} />
        {Array.from({ length: 10 }).map((_, i) => {
          const a = (i / 10) * Math.PI * 2;
          const cx = 50 + 12.6 * Math.cos(a);
          const cy = 28 + 12.6 * Math.sin(a);
          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r={3.7} fill={s.bead} />
              <circle cx={cx - 1.1} cy={cy - 1.1} r={1.1} fill={RS.surface} opacity={0.85} />
            </g>
          );
        })}
        <circle cx={50} cy={28} r={7.6} fill={s.threadB} />
        <text
          x={50}
          y={31.2}
          textAnchor="middle"
          fontSize={9}
          fill={s.bead}
          style={{ fontFamily: SYMBOL_FONT }}
        >
          {s.glyph}
        </text>
      </>
    );
  }

  // Kalava. No medallion at all, on purpose — it is a length of thread with three
  // knots in it and a printed ॐ, which is precisely why somebody chooses it over
  // the other four. Giving it a disc to match the rest would erase the choice.
  return (
    <>
      <text
        x={50}
        y={13}
        textAnchor="middle"
        fontSize={12}
        fill={RS.brass}
        className="rs-deva"
      >
        {s.glyph}
      </text>
      {[34, 50, 66].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy={28} r={5.2} fill={s.threadA} />
          <circle cx={cx - 1.4} cy={26.6} r={1.8} fill={s.threadB} opacity={0.9} />
        </g>
      ))}
    </>
  );
}

/**
 * One rakhi as an object.
 *
 * `thread` draws the two twisted plies running edge to edge; without it the same
 * drawing is cropped to its medallion by the viewBox, which is how the pendant on
 * the wrist and the tray row share one component instead of two that drift.
 */
function RakhiObject({
  style,
  size,
  thread = true,
  className,
}: {
  style: Style;
  size: number;
  thread?: boolean;
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      width={size}
      height={thread ? Math.round(size * 0.56) : size}
      // The medallion window is sized to the widest style's full extent (phool's
      // petals reach 26 units from centre), so the pendant crop never clips a
      // flower and no style needs `overflow: visible` to look right.
      viewBox={thread ? "0 0 100 56" : "24 2 52 52"}
      className={className}
      style={{ display: "block" }}
    >
      {thread && (
        <>
          <path
            d={PLY_OVER}
            fill="none"
            stroke={style.threadA}
            strokeWidth={style.id === "kalava" ? 4.6 : 3.4}
            strokeLinecap="round"
          />
          <path
            d={PLY_UNDER}
            fill="none"
            stroke={style.threadB}
            strokeWidth={style.id === "kalava" ? 4.6 : 3.4}
            strokeLinecap="round"
            opacity={0.95}
          />
        </>
      )}
      <Medallion s={style} />
    </svg>
  );
}

// ─── His wrist ───────────────────────────────────────────────────────────────
//
// ── WHY THE HAND IS CROPPED OUT OF FRAME ────────────────────────────────────
//
// A drawn hand at this size is either five fingers of detail nobody looks at or a
// mitten, and both of them pull attention off the one part of the picture that is
// interactive. So the arm enters at the bottom of the frame and leaves at the top:
// a kurta cuff, a forearm, the wrist narrowing, the heel of the palm widening
// again, and then out. The cuff is what makes it read as an arm rather than a stick
// — remove it and the silhouette becomes ambiguous immediately.
//
// ── AND WHY IT HAS NO SKIN TONE ─────────────────────────────────────────────
//
// Line art on ivory, not a filled complexion. Any single skin colour is wrong for
// most of the people who will open this, and a page that hands a sister a brother
// who visibly is not hers has broken the only thing it was asked to do. A drawn
// outline is read as "a wrist" rather than as "somebody's wrist".
const ARM_PATH = [
  "M58 236",
  "C62 190 70 166 72 136",
  "C73 113 66 92 62 62",
  "C58 40 60 12 62 -8",
  "L138 -8",
  "C140 12 142 40 138 62",
  "C134 92 127 113 128 136",
  "C130 166 136 190 140 236",
  "Z",
].join(" ");

/** The five passes, front-of-wrist, from the top of the wrist downwards. */
const WRAP_YS = [106, 116, 126, 136, 146];

function Wrist({
  style,
  width,
  ringRef,
  wrapRefs,
  pendantRef,
  cinch,
}: {
  style: Style;
  width: number;
  ringRef: (el: SVGCircleElement | null) => void;
  wrapRefs: (i: number) => (el: SVGGElement | null) => void;
  pendantRef: (el: HTMLDivElement | null) => void;
  /** Play the knot-cinch one-shot. Only true on the tied step. */
  cinch: boolean;
}) {
  // React's generated ids contain colons, which are legal in an id and in a
  // `url(#…)` fragment reference but not in a CSS selector — stripped so nothing
  // downstream can trip over them.
  const clip = `${useId().replace(/:/g, "")}-arm`;
  const height = Math.round(width * 1.18);
  const pendant = Math.round(width * 0.24);

  return (
    <div style={{ position: "relative", width, height }}>
      {/* Default `overflow: hidden` is load-bearing: the arm path runs off the top
          and bottom edges of the viewBox on purpose, and `visible` would paint the
          forearm across the heading above it. */}
      <svg aria-hidden width={width} height={height} viewBox="0 0 200 236" style={{ display: "block" }}>
        <defs>
          {/* The wraps are drawn wider than the arm and clipped to it, so each pass
              ends flush on the silhouette's edge and reads as continuing round the
              back. Hand-fitting the endpoints to the curve instead would leave a
              hairline of ivory on one side at some widths, which reads as thread
              floating a millimetre off the skin. */}
          <clipPath id={clip}>
            <path d={ARM_PATH} />
          </clipPath>
        </defs>

        {/* ── The progress arc ──
         *
         * `pathLength={1}` normalises the circle's length to 1, so the fill is
         * `stroke-dashoffset: 1 - progress` with no geometry to measure and no
         * arithmetic to get wrong if the size ever changes. Rotated so it starts at
         * twelve o'clock, because a ring that starts at three reads as a pie chart. */}
        <circle
          cx={100}
          cy={130}
          r={88}
          fill="none"
          stroke={RS.hairline}
          strokeWidth={4}
        />
        <circle
          ref={ringRef}
          cx={100}
          cy={130}
          r={88}
          fill="none"
          stroke={RS.haldi}
          strokeWidth={5}
          strokeLinecap="round"
          pathLength={1}
          transform="rotate(-90 100 130)"
          style={{ strokeDasharray: 1, strokeDashoffset: cinch ? 0 : 1 }}
        />

        {/* cuff */}
        <path
          d="M50 196 C50 190 54 188 60 188 L140 188 C146 188 150 190 150 196 L150 236 L50 236 Z"
          fill={RS.paperDeep}
          stroke={RS.ink}
          strokeWidth={2.2}
          strokeLinejoin="round"
          opacity={0.9}
        />

        {/* arm */}
        <path d={ARM_PATH} fill={RS.surface} stroke={RS.ink} strokeWidth={2.4} />
        {/* two tendon hints; without them the forearm is a flat shape */}
        <path
          d="M88 176 C90 158 92 150 92 138"
          fill="none"
          stroke={RS.hairline}
          strokeWidth={2}
          strokeLinecap="round"
        />
        <path
          d="M110 176 C110 158 109 150 108 138"
          fill="none"
          stroke={RS.hairline}
          strokeWidth={2}
          strokeLinecap="round"
        />

        {/* ── The thread, winding ──
         *
         * `stroke-dasharray` and `stroke-dashoffset` are INHERITED SVG properties,
         * so one value set on each <g> reveals both of its plies together and the
         * paint loop writes five values per frame instead of ten. */}
        <g clipPath={`url(#${clip})`}>
          {WRAP_YS.map((y, i) => (
            <g
              key={y}
              ref={wrapRefs(i)}
              style={{ strokeDasharray: 1, strokeDashoffset: cinch ? 0 : 1 }}
            >
              <path
                d={`M58 ${y} C82 ${y + 11} 118 ${y + 11} 142 ${y}`}
                pathLength={1}
                fill="none"
                stroke={style.threadA}
                strokeWidth={7}
                strokeLinecap="round"
              />
              <path
                d={`M58 ${y + 2.6} C82 ${y + 13} 118 ${y + 13} 142 ${y + 2.6}`}
                pathLength={1}
                fill="none"
                stroke={style.threadB}
                strokeWidth={5}
                strokeLinecap="round"
                opacity={0.95}
              />
            </g>
          ))}
        </g>
      </svg>

      {/* The pendant is an HTML layer rather than a nested <svg>, so the medallion
          component is reused verbatim and the cinch one-shot is a class rather than
          a second animation implementation. It rides at the bulge of the middle
          wrap, which is where a rakhi actually sits. */}
      <div
        ref={pendantRef}
        className={cinch ? "rs-cinch" : undefined}
        style={{
          position: "absolute",
          left: "50%",
          top: "60%",
          width: pendant,
          height: pendant,
          transform: cinch ? "translate(-50%, -50%)" : "translate(-50%, -50%) scale(0.7)",
          opacity: cinch ? 1 : 0,
          filter: "drop-shadow(0 3px 6px rgba(51,32,43,0.24))",
        }}
      >
        <RakhiObject style={style} size={pendant} thread={false} />
      </div>
    </div>
  );
}

// ─── The screen ──────────────────────────────────────────────────────────────

type Step = "tray" | "tie" | "tied";

/** What the live region says. English and blunt: a progress announcement is the one
    place on this page where register loses to precision. */
const PROGRESS_TEXT = [
  "Rakhi ready. Press and hold his wrist to wind the thread.",
  "Winding — a quarter of the way around.",
  "Winding — halfway around.",
  "Winding — almost there.",
  "Bandh gayi. The rakhi is tied.",
];

export default function TieScreen({
  data,
  entry,
  picked,
  onTied,
  onBack,
}: {
  data: SisterData;
  entry: Entry;
  picked: string;
  onTied: (style: RakhiStyle) => void;
  onBack: () => void;
}) {
  const isDesktop = useIsDesktop();
  const reduced = usePrefersReducedMotion();

  // ── `entry` is read ON MOUNT and never again ──
  //
  // Both of these are `useState` initialisers rather than effects, which is what
  // "on mount only" means in React 19: an effect that syncs a prop into state
  // re-runs whenever the prop changes, costs a second render, and trips
  // `react-hooks/set-state-in-effect` — which is on in this repo and fails the
  // build. Coming back from the vow lands on the tied rakhi, because a Back button
  // that costs her the whole ritual is a Back button nobody presses twice.
  const [chosen, setChosen] = useState<RakhiStyle | "">(() =>
    RAKHI_STYLES.some((r) => r.id === picked) ? (picked as RakhiStyle) : ""
  );
  const [step, setStep] = useState<Step>(() =>
    entry === "last" && RAKHI_STYLES.some((r) => r.id === picked) ? "tied" : "tray"
  );

  const style = rakhiStyle(chosen || RAKHI_STYLES[0].id);

  // ── The wind, in refs ──
  //
  // Progress lives in a ref and is painted straight onto the DOM, not in state.
  // A gesture that ran through `useState` would re-render this component sixty
  // times a second — every tray row, every SVG path, the whole subtree — to move
  // one dash offset, on the mid-range Android where this matters most. What React
  // does own is the STEP and a four-value announcement bucket, which change a
  // handful of times per hold.
  const progress = useRef(0);
  const floor = useRef(0);
  const holding = useRef(false);
  const rafId = useRef<number | null>(null);
  const lastT = useRef(0);
  const dragPx = useRef(0);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  const ringEl = useRef<SVGCircleElement | null>(null);
  const wrapEls = useRef<(SVGGElement | null)[]>([]);
  const pendantEl = useRef<HTMLDivElement | null>(null);

  const bucketRef = useRef(0);
  const [bucket, setBucket] = useState(0);

  const setRing = useCallback((el: SVGCircleElement | null) => {
    ringEl.current = el;
  }, []);
  const setWrap = useCallback(
    (i: number) => (el: SVGGElement | null) => {
      wrapEls.current[i] = el;
    },
    []
  );
  const setPendant = useCallback((el: HTMLDivElement | null) => {
    pendantEl.current = el;
  }, []);

  /**
   * One frame's worth of paint. Transform and stroke offsets only — nothing here
   * touches layout, so a hold costs no reflow however long she holds it.
   */
  const paint = useCallback((p: number) => {
    if (ringEl.current) ringEl.current.style.strokeDashoffset = String(1 - p);

    for (let i = 0; i < WRAPS; i += 1) {
      const el = wrapEls.current[i];
      if (!el) continue;
      // Each pass owns a fifth of the hold, so the thread lays down one wrap at a
      // time instead of five ghosts fading in together.
      el.style.strokeDashoffset = String(1 - clamp01((p - i / WRAPS) * WRAPS));
    }

    if (pendantEl.current) {
      // The pendant only exists once there is enough thread to hang it from.
      const t = clamp01((p - 0.5) / 0.4);
      pendantEl.current.style.opacity = String(t);
      // String transform, not framer-motion's independent props: this runs every
      // frame under her thumb, which is exactly the case the house rule is about.
      pendantEl.current.style.transform = `translate(-50%, -50%) scale(${(0.7 + 0.3 * t).toFixed(3)})`;
    }
  }, []);

  const stopLoop = useCallback(() => {
    if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    rafId.current = null;
    lastT.current = 0;
  }, []);

  const announce = useCallback((b: number) => {
    if (b === bucketRef.current) return;
    bucketRef.current = b;
    setBucket(b);
  }, []);

  const finish = useCallback(() => {
    stopLoop();
    holding.current = false;
    progress.current = 1;
    floor.current = 1;
    paint(1);
    announce(4);
    // A knot is a physical event and the device has a way to say so. Guarded:
    // iOS Safari has no `vibrate`.
    navigator.vibrate?.([14, 36, 26]);
    setStep("tied");
  }, [announce, paint, stopLoop]);

  /**
   * Start the animation loop if it is not already running.
   *
   * The per-frame function is declared INSIDE this callback rather than being a
   * `useCallback` of its own that schedules itself. A self-scheduling hook value is
   * the obvious shape for a rAF loop and `react-hooks/immutability` rejects it —
   * correctly, because the running loop would keep calling the identity it was
   * created with even after a re-render produced a newer one. A local function
   * closes over refs only, so there is no stale identity to capture.
   *
   * One loop drives both directions: it winds while `holding` is true and unwinds
   * when it is not, so a release mid-wind is a change of sign rather than a second
   * animation racing the first.
   */
  const pump = useCallback(() => {
    if (rafId.current !== null) return;
    lastT.current = 0;

    const step = (t: number) => {
      // Clamped delta: a tab that was backgrounded mid-hold comes back with a
      // multi-second gap, and an unclamped one would jump the thread to done.
      const dt = lastT.current ? Math.min(64, t - lastT.current) : 16;
      lastT.current = t;

      let p = progress.current;

      if (holding.current) {
        p += dt / HOLD_MS;
        if (dragPx.current > 0) {
          p += dragPx.current * DRAG_PER_PX;
          dragPx.current = 0;
        }
        p = Math.min(1, p);
      } else {
        p = Math.max(floor.current, p - dt / UNWIND_MS);
      }

      progress.current = p;
      paint(p);
      announce(Math.min(3, Math.floor(p * 4)));

      if (p >= 1) {
        finish();
        return;
      }

      if (holding.current || p > floor.current) {
        rafId.current = requestAnimationFrame(step);
      } else {
        // Fully slack and not held: nothing left to animate until she touches it.
        stopLoop();
      }
    };

    rafId.current = requestAnimationFrame(step);
  }, [announce, finish, paint, stopLoop]);

  const startHold = useCallback(() => {
    if (holding.current) return;
    holding.current = true;
    pump();
  }, [pump]);

  const releaseHold = useCallback(() => {
    if (!holding.current) return;
    holding.current = false;
    dragPx.current = 0;
    lastPoint.current = null;
    floor.current = Math.max(0, progress.current - SLACK);
    pump();
  }, [pump]);

  // A hold that is interrupted by the OS — a call, an app switch, the screen
  // locking — never gets its pointerup, and without this the thread would keep
  // winding in a hidden tab and be finished when she came back.
  useEffect(() => {
    const onHidden = () => {
      if (document.visibilityState !== "visible") releaseHold();
    };
    document.addEventListener("visibilitychange", onHidden);
    window.addEventListener("blur", releaseHold);
    return () => {
      document.removeEventListener("visibilitychange", onHidden);
      window.removeEventListener("blur", releaseHold);
    };
  }, [releaseHold]);

  useEffect(() => stopLoop, [stopLoop]);

  const goToTie = useCallback(() => {
    stopLoop();
    progress.current = 0;
    floor.current = 0;
    holding.current = false;
    dragPx.current = 0;
    announce(0);
    setStep("tie");
  }, [announce, stopLoop]);

  const goToTray = useCallback(() => {
    stopLoop();
    progress.current = 0;
    floor.current = 0;
    holding.current = false;
    announce(0);
    setStep("tray");
  }, [announce, stopLoop]);

  // ── Pointer handlers ──
  //
  // `setPointerCapture` is the whole reason this uses pointer events and not touch
  // events: it routes every subsequent move and the eventual up to THIS element
  // even after her thumb has slid off it. Without it, winding a thumb around the
  // wrist — the most natural thing to do on a target labelled "wind the thread" —
  // leaves the element, the up lands on the page, and the hold dies at 60% with no
  // way for this component to know it ended.
  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (reduced) return;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Safari refuses a capture for a pointer it has already released. The hold
        // still works; it just aborts if she slides off, which is the old behaviour.
      }
      lastPoint.current = { x: e.clientX, y: e.clientY };
      navigator.vibrate?.(10);
      startHold();
    },
    [reduced, startHold]
  );

  /** The bonus drag. Travel adds to the fill; it is never required for any of it. */
  const onPointerMove = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    if (!holding.current || !lastPoint.current) return;
    const dx = e.clientX - lastPoint.current.x;
    const dy = e.clientY - lastPoint.current.y;
    lastPoint.current = { x: e.clientX, y: e.clientY };
    dragPx.current += Math.hypot(dx, dy);
  }, []);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (reduced) return;
      if (e.key !== " " && e.key !== "Enter") return;
      // Space scrolls the page and Enter fires a click; both would fight the hold.
      e.preventDefault();
      // Held keys repeat. The repeats are the hold, not five new ones.
      if (e.repeat) return;
      startHold();
    },
    [reduced, startHold]
  );

  const onKeyUp = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      // Under reduced motion this button is activated by its native click, and
      // Space's click fires on KEYUP — preventing the default here would leave a
      // keyboard reader with reduced motion unable to tie at all.
      if (reduced) return;
      if (e.key !== " " && e.key !== "Enter") return;
      e.preventDefault();
      releaseHold();
    },
    [reduced, releaseHold]
  );

  const wristWidth = isDesktop ? 292 : 208;
  const trayObject = isDesktop ? 300 : 216;

  // ── head ──────────────────────────────────────────────────────────────────

  const head =
    step === "tray" ? (
      <>
        {/* No `letterSpacing` here — see the note on `.rs-deva` in sister.css. */}
        <p className="rs-deva" style={{ margin: 0, fontSize: 14, color: RS.brass }}>
          राखी
        </p>
        <h2
          className="rs-display"
          style={{
            margin: "4px 0 0",
            fontSize: isDesktop ? 40 : 28,
            fontWeight: 700,
            color: RS.rani,
            lineHeight: 1.06,
          }}
        >
          Kaunsi baandhogi?
        </h2>
      </>
    ) : step === "tie" ? (
      <>
        {/* No `letterSpacing` here — see the note on `.rs-deva` in sister.css. */}
        <p className="rs-deva" style={{ margin: 0, fontSize: 14, color: RS.brass }}>
          बंधन
        </p>
        <h2
          className="rs-display"
          style={{
            margin: "4px 0 0",
            fontSize: isDesktop ? 40 : 28,
            fontWeight: 700,
            color: RS.rani,
            lineHeight: 1.06,
          }}
        >
          Haath saamne hai
        </h2>
      </>
    ) : (
      <>
        {/* No `letterSpacing` here — see the note on `.rs-deva` in sister.css. */}
        <p className="rs-deva" style={{ margin: 0, fontSize: 14, color: RS.brass }}>
          बंध गई
        </p>
        <h2
          className="rs-display"
          style={{
            margin: "4px 0 0",
            fontSize: isDesktop ? 40 : 28,
            fontWeight: 700,
            color: RS.rani,
            lineHeight: 1.06,
          }}
        >
          Bandh gayi
        </h2>
      </>
    );

  // ── art ───────────────────────────────────────────────────────────────────

  const art =
    step === "tray" ? (
      chosen ? (
        <div style={{ display: "grid", justifyItems: "center", gap: 8 }}>
          {/* Keyed on the id so the bloom replays on every change — the point of
              this slot is that switching rakhis feels like putting one down and
              picking another up. */}
          <RakhiObject key={style.id} style={style} size={trayObject} className="rs-bloom" />
          <p className="rs-deva" style={{ margin: 0, fontSize: 17, color: RS.raniDeep }}>
            {style.hindi}
          </p>
        </div>
      ) : (
        /* The empty tray. A dashed ring rather than nothing at all, so the slot is
           visibly waiting for something instead of looking like a layout bug. */
        <div
          style={{
            width: trayObject * 0.62,
            height: trayObject * 0.62,
            borderRadius: 999,
            border: `2px dashed ${RS.brassSoft}`,
            display: "grid",
            placeItems: "center",
            gap: 2,
          }}
        >
          <p className="rs-deva" style={{ margin: 0, fontSize: 22, color: RS.brassSoft }}>
            राखी
          </p>
        </div>
      )
    ) : step === "tie" ? (
      /* ── The hold target ──
       *
       * The wrist IS the button. An arc filling next to a picture of a wrist would
       * be a progress bar with an illustration; an arc filling AROUND the wrist she
       * is pressing is the thread going on. `rs-drag` (touch-action: none) is on
       * this element and nothing else — on a wrapper it would kill the page's
       * scrolling, and on the page it would kill pinch-zoom.
       *
       * No `onClick` unless motion is reduced: a stray click must not be able to
       * finish the tie, and Enter's default click is prevented in `onKeyDown`
       * anyway. The focus ring is the browser's own, because `outline` cannot be
       * expressed in an inline style and this file does not own the stylesheet — so
       * nothing here sets `outline: none`, which is the only way to lose it. */
      <button
        type="button"
        className="rs-drag"
        aria-label={
          reduced
            ? "Tie the rakhi on his wrist"
            : "Press and hold to wind the rakhi around his wrist"
        }
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={releaseHold}
        onPointerCancel={releaseHold}
        onLostPointerCapture={releaseHold}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onBlur={releaseHold}
        onClick={reduced ? finish : undefined}
        style={{
          display: "grid",
          justifyItems: "center",
          gap: 10,
          padding: "6px 10px 10px",
          minHeight: 44,
          border: "none",
          borderRadius: 26,
          background: "transparent",
          cursor: "pointer",
        }}
      >
        {/* Keyed on the step so the tied state mounts its own node at full wind
            rather than inheriting whatever the paint loop last wrote. */}
        <Wrist
          key={step}
          style={style}
          width={wristWidth}
          ringRef={setRing}
          wrapRefs={setWrap}
          pendantRef={setPendant}
          cinch={false}
        />

        <span
          className="rs-nudge"
          style={{
            display: "inline-flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
            padding: "8px 18px",
            borderRadius: 999,
            background: BRAND_GRADIENT,
            color: "#fffdf8",
            border: CARD_BORDER,
            boxShadow: CARD_SHADOW,
          }}
        >
          <span className="rs-display" style={{ fontSize: 16, fontWeight: 700 }}>
            {reduced ? "Baandh do" : "Dabaye rakho"}
          </span>
          {/* The English is not a translation, it is the mechanic. A label that only
              said "Dabaye rakho" would be warm and would still leave a first-time
              reader tapping it once and wondering why nothing happened. */}
          <span style={{ fontSize: 10.5, letterSpacing: 0.6, opacity: 0.92 }}>
            {reduced ? "one tap" : "press and hold"}
          </span>
        </span>
      </button>
    ) : (
      /* Tied. Deliberately NOT the same button with `disabled` on it: a disabled
         control still carries its label into the accessibility tree, and "press and
         hold to wind the rakhi" is a lie once the rakhi is on. */
      <div style={{ display: "grid", justifyItems: "center", padding: "6px 10px 10px" }}>
        <Wrist
          key={step}
          style={style}
          width={wristWidth}
          ringRef={setRing}
          wrapRefs={setWrap}
          pendantRef={setPendant}
          cinch
        />
      </div>
    );

  // ── body ──────────────────────────────────────────────────────────────────

  const body =
    step === "tray" ? (
      <>
        <p
          style={{
            margin: 0,
            fontSize: isDesktop ? 16.5 : 14.5,
            lineHeight: 1.55,
            color: RS.ink,
            maxWidth: 380,
          }}
        >
          Paanch nikaal ke rakh diye hain. Tu chuno — colour pe complaint main baad mein karunga.
        </p>

        {/* ── Five objects, five real buttons ──
         *
         * `aria-pressed` and not `role="radio"`. Radio semantics promise a keyboard
         * contract we are not implementing — one tab stop for the group and arrow
         * keys to move within it — and announcing a promise the keyboard does not
         * keep is worse than the plainer truth. As five toggle buttons, Tab reaches
         * every one of them and the pressed state is read out correctly. */}
        <div
          role="group"
          aria-label="Choose a rakhi"
          style={{ display: "grid", gap: 9, width: "100%", maxWidth: 420 }}
        >
          {RAKHI_STYLES.map((r) => {
            const on = chosen === r.id;
            return (
              <button
                key={r.id}
                type="button"
                aria-pressed={on}
                onClick={() => setChosen(r.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  minHeight: 66,
                  padding: "8px 12px",
                  borderRadius: 15,
                  textAlign: "left",
                  background: on ? "rgba(166,42,92,0.06)" : RS.surface,
                  border: `2px solid ${on ? RS.rani : RS.hairline}`,
                  boxShadow: on ? CARD_SHADOW : "none",
                  cursor: "pointer",
                }}
              >
                <RakhiObject style={r} size={82} />

                <span style={{ display: "grid", gap: 1, minWidth: 0, flex: 1 }}>
                  <span style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
                    <span
                      className="rs-display"
                      style={{ fontSize: 16.5, fontWeight: 700, color: RS.ink }}
                    >
                      {r.name}
                    </span>
                    <span className="rs-deva" style={{ fontSize: 13, color: RS.brass }}>
                      {r.hindi}
                    </span>
                  </span>
                  {/* The note is the joke, and it is the actual reason anybody picks
                      one of these over another. It is never truncated. */}
                  <span style={{ fontSize: 12.5, lineHeight: 1.4, color: RS.muted }}>
                    {r.note}
                  </span>
                </span>

                <span
                  aria-hidden
                  style={{
                    flex: "0 0 auto",
                    width: 22,
                    height: 22,
                    borderRadius: 999,
                    display: "grid",
                    placeItems: "center",
                    background: on ? RS.rani : "transparent",
                    border: on ? "none" : `1.5px solid ${RS.hairline}`,
                    color: "#fffdf8",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {on ? "✓" : ""}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={goToTie}
          disabled={!chosen}
          className={chosen ? "rs-display rs-sheen" : "rs-display"}
          style={{
            position: "relative",
            overflow: "hidden",
            width: "100%",
            maxWidth: 320,
            minHeight: 54,
            padding: "15px 30px",
            borderRadius: 999,
            background: chosen ? BRAND_GRADIENT : RS.paperDeep,
            color: chosen ? "#fffdf8" : RS.muted,
            border: chosen ? CARD_BORDER : `2px solid ${RS.hairline}`,
            boxShadow: chosen ? CARD_SHADOW : "none",
            fontSize: 16.5,
            fontWeight: 700,
            cursor: chosen ? "pointer" : "not-allowed",
          }}
        >
          {chosen ? "Baandhne chalo" : "Ek rakhi chuno"}
        </button>

        <BackLink onClick={onBack} />
      </>
    ) : step === "tie" ? (
      <>
        <p
          style={{
            margin: 0,
            fontSize: isDesktop ? 16.5 : 14.5,
            lineHeight: 1.55,
            color: RS.ink,
            maxWidth: 360,
          }}
        >
          Woh haath aage kar ke khada hai, {sisterWord(data)}. Dabaye rakho — jab tak dhaaga poora
          lipat na jaaye.
        </p>

        {/* ── The live region ──
         *
         * Bucketed to four values on purpose. A percentage that updated every frame
         * would make a screen reader talk over itself for the entire hold and tell
         * her nothing; four milestones say the same thing and leave her able to
         * hear the rest of the page. It also announces the SLACKENING, because
         * progress going backwards after she lets go is the one part of this
         * gesture a sighted reader learns from the picture and nobody else would
         * ever be told about. */}
        <p
          role="status"
          aria-live="polite"
          style={{
            margin: 0,
            minHeight: 34,
            fontSize: 12.5,
            lineHeight: 1.4,
            color: bucket >= 3 ? RS.rani : RS.muted,
            maxWidth: 320,
          }}
        >
          {PROGRESS_TEXT[bucket]}
        </p>

        {/* ── The escape hatch ──
         *
         * Permanent, and quiet. See the note at the top of this file: a
         * screen-reader user on a phone cannot perform a press-and-hold, so without
         * this button the template ends here for them. Hidden only under reduced
         * motion, where the wrist itself is already a one-tap button and two
         * controls doing the identical thing is its own kind of confusing. */}
        {!reduced && (
          <button
            type="button"
            onClick={finish}
            className="rs-back"
            style={{
              minHeight: 44,
              padding: "8px 16px",
              borderRadius: 999,
              background: "transparent",
              border: `1px solid ${RS.hairline}`,
              fontSize: 12.5,
              cursor: "pointer",
            }}
          >
            Nahi ho raha? Ek tap mein baandh do
          </button>
        )}

        <BackLink onClick={goToTray} label="Doosri rakhi" />
      </>
    ) : (
      <>
        <p
          style={{
            margin: 0,
            fontSize: isDesktop ? 17 : 15.5,
            lineHeight: 1.55,
            color: RS.ink,
            maxWidth: 360,
          }}
        >
          {style.name} — {style.note}.
        </p>

        <div style={{ display: "grid", placeItems: "center", margin: "2px 0" }}>
          <ThreadRule width={isDesktop ? 260 : 190} colorA={style.threadA} colorB={style.threadB} />
        </div>

        <p style={{ margin: 0, fontSize: 13.5, color: RS.muted, maxWidth: 340 }}>
          Uske haath pe. Ab utarne wala nahi hai — aur ab uski baari.
        </p>

        {/* ── Why `onTied` is on a button and not a timer ──
         *
         * `onTied` navigates — SisterTemplate records the rakhi and moves to the
         * vow. Firing it on a timeout the moment the knot cinches would take the
         * payoff away at the exact frame it arrives: petals still falling, pendant
         * still settling, screen already gone. This is the one beat on the whole
         * page she earned with a gesture, so she leaves it when she is done looking
         * at it. */}
        <motion.button
          type="button"
          onClick={() => onTied(style.id)}
          whileTap={{ scale: 0.96 }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="rs-display rs-sheen"
          style={{
            position: "relative",
            overflow: "hidden",
            width: "100%",
            maxWidth: 320,
            minHeight: 56,
            padding: "16px 30px",
            borderRadius: 999,
            background: BRAND_GRADIENT,
            color: "#fffdf8",
            border: CARD_BORDER,
            boxShadow: CARD_SHADOW,
            fontSize: 17,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Ab uska vaada
        </motion.button>

        <BackLink onClick={goToTray} label="Doosri rakhi" />
      </>
    );

  return (
    <Stage
      // Always `rs-tall`, which stacks from the top instead of centring. The tray is
      // five 66px rows plus a heading and a CTA and the tie step is 250px of artwork
      // with a label under it, so on a 360×640 phone this screen is taller than the
      // viewport and the page scrolls. Centred, the heading would drift upward as
      // the column grew and the composition would sit differently on every step; top
      // -aligned, the heading is in the same place on all three and only the tail of
      // the column moves.
      className="rs-tall"
      behind={
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 0,
          }}
        >
          <Rangoli size={isDesktop ? 560 : 360} opacity={0.05} />
        </div>
      }
      overlay={
        <AnimatePresence>
          {step === "tied" && (
            <motion.div
              key="tied-petals"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
            >
              {/* PetalFall handles prefers-reduced-motion in the stylesheet — do not
                  wrap it in a media query here. */}
              <PetalFall count={18} />
              <div style={{ position: "absolute", top: "6%", left: "8%" }}>
                <Marigold size={30} tone="rani" />
              </div>
              <div style={{ position: "absolute", top: "10%", right: "9%" }}>
                <Marigold size={24} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      }
      head={head}
      art={art}
      body={body}
    />
  );
}
