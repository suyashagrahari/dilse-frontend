// ─── Us — the stylesheet ─────────────────────────────────────────────────────
//
// One <style> block, injected once by UsTemplate. Everything else is inline
// styles, because this layout is a set of exact pixel measurements and a
// utility class that changes underneath it is a bug waiting to happen.
//
// TWO CONSTRAINTS ON EVERY RULE IN HERE
//
//   1. NO CSS GRADIENT FUNCTIONS. `assertBrandSafe` fails the whole template on
//      any of the three of them, and the design does not want one. The check
//      runs over source, so none of the three is spelled out anywhere in this
//      directory — including in a comment like this one. The story caption
//      scrim, the one place a real dark fade belongs, is built as stacked flat
//      `rgba` bands in StoryViewer instead.
//   2. NOTHING LOOPS except the editor spinner. Every animation here is a
//      one-shot triggered by a tap.
//
// Progress bars animate `transform: scaleX()`, not `width`: it is compositor-
// only, and — the actual reason — `animation-play-state: paused` on a transform
// freezes cleanly mid-flight, which is what press-and-hold depends on.

export const KEYFRAMES = `
@keyframes us-spin { to { transform: rotate(360deg); } }

/* Heart tap: 1.0 → 1.25 → 1.0. */
@keyframes us-heart-pop {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.25); }
  100% { transform: scale(1); }
}

/* The double-tap heart over the photo: 0 → 1.2 → 1.0, hold, fade. */
@keyframes us-big-heart {
  0%   { opacity: 0; transform: scale(0); }
  16%  { opacity: 1; transform: scale(1.2); }
  28%  { opacity: 1; transform: scale(1); }
  68%  { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(1); }
}

/* Post detail enters from the right. */
@keyframes us-slide-in {
  from { transform: translateX(100%); }
  to   { transform: translateX(0); }
}

@keyframes us-fade-in { from { opacity: 0; } to { opacity: 1; } }

@keyframes us-sheet-up {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}

@keyframes us-toast-in {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Story progress. scaleX so hold-to-pause freezes it exactly where it is. */
@keyframes us-fill {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}

/* The highlight strip scrolls horizontally; the bar itself is noise. */
.us-hscroll {
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.us-hscroll::-webkit-scrollbar { display: none; }

/* Buttons in here are layout objects, not form controls. */
.us-tap {
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  appearance: none;
  background: none;
  border: 0;
  margin: 0;
  padding: 0;
  font: inherit;
  color: inherit;
  cursor: pointer;
  text-align: inherit;
}

/* The caption clamp. Two lines, then "… more". */
.us-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.us-no-select { user-select: none; -webkit-user-select: none; }

/*
 * Capture mode. Set on the share-card subtree immediately before html-to-image
 * runs: a half-finished animation is captured as a half-finished animation, and
 * the exported PNG then disagrees with the screen.
 */
.us-frozen, .us-frozen * {
  animation: none !important;
  transition: none !important;
}
`;

/** The native stack, plus the two properties that make it look native. */
export const TEXT_BASE = {
  WebkitFontSmoothing: "antialiased" as const,
  fontVariantNumeric: "tabular-nums" as const,
};

/**
 * `animation` shorthand, or undefined when motion is suppressed. Returning
 * undefined rather than "none" keeps the element's final state as its *only*
 * state, which is what prefers-reduced-motion actually asks for.
 */
export const anim = (
  reduced: boolean,
  name: string,
  ms: number,
  easing = "ease-out",
  fill = "both",
): string | undefined => (reduced ? undefined : `${name} ${ms}ms ${easing} ${fill}`);
