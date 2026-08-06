// ─── Every keyframe in the template, in one place ────────────────────────────
//
// MOTION POLICY, restated because it is a product decision and not a taste one:
// this page is opened every day, potentially for years. Every animation here is
// ONE-SHOT and tied to something the user just did or just came back to. There
// is no ambient loop anywhere — nothing breathes, pulses, shimmers or floats.
//
// The reduced-motion block at the bottom is a belt-and-braces kill switch over
// the whole subtree rather than a per-component check, so a component added
// later cannot forget. `.streak-keep-motion` opts out of it, and exactly one
// thing uses that: the hold ring, which is functional progress feedback rather
// than decoration — removing it would leave the user with no signal that a
// 1.2 second press is doing anything.

"use client";

const CSS = `
/* A new light arriving. Fades in over 500ms with a brief brighter flash. */
@keyframes streak-light-in {
  0%   { opacity: 0; transform: scale(0.4); }
  55%  { opacity: 1; transform: scale(1.55); }
  100% { opacity: 1; transform: scale(1); }
}

/* Coming back from dormancy. Staggered 20ms apart by the caller. */
@keyframes streak-relight {
  0%   { opacity: 0.25; }
  60%  { opacity: 1; }
  100% { opacity: 1; }
}

/* The day-100 canopy. Each light brightens past full, then settles. */
@keyframes streak-canopy {
  0%   { opacity: 0.2; transform: scale(0.7); }
  50%  { opacity: 1; transform: scale(1.7); }
  100% { opacity: 1; transform: scale(1); }
}

/* The warm bloom where the two rings overlap.
   Rise, hold ~600ms, fade ~400ms — the caller sets a 1000ms duration. */
@keyframes streak-bloom {
  0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.55); }
  18%  { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  60%  { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(1.16); }
}

/* A grid square filling. One-shot, on the day that just completed. */
@keyframes streak-square-bloom {
  0%   { transform: scale(0.7); }
  45%  { transform: scale(1.35); }
  100% { transform: scale(1); }
}

/* Text arriving a line at a time. The caller stages animation-delay. */
@keyframes streak-line-in {
  0%   { opacity: 0; transform: translateY(6px); }
  100% { opacity: 1; transform: translateY(0); }
}

/* A sealed envelope announcing itself, exactly once. */
@keyframes streak-seal-pulse {
  0%   { transform: scale(1); box-shadow: 0 0 0 0 rgba(201,130,47,0.34); }
  60%  { transform: scale(1.025); box-shadow: 0 0 0 14px rgba(201,130,47,0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(201,130,47,0); }
}

/* The letter sliding up out of the opened envelope. */
@keyframes streak-letter-rise {
  0%   { opacity: 0; transform: translateY(26px); }
  100% { opacity: 1; transform: translateY(0); }
}

/* Wax fragments thrown off as the seal cracks. Set --dx/--dy per particle. */
@keyframes streak-wax-fleck {
  0%   { opacity: 0.9; transform: translate(0, 0) scale(1); }
  100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(0.4); }
}

/* A folded-paper micro-letter unfolding. Lighter ceremony than the envelope. */
@keyframes streak-unfold {
  0%   { opacity: 0; transform: scaleY(0.2); }
  100% { opacity: 1; transform: scaleY(1); }
}

@keyframes streak-fade-in {
  0%   { opacity: 0; }
  100% { opacity: 1; }
}

/* Sheets and panels arriving from the bottom. */
@keyframes streak-sheet-up {
  0%   { opacity: 0; transform: translateY(24px); }
  100% { opacity: 1; transform: translateY(0); }
}

/*
  Every animation in the subtree is suppressed under reduced motion — the light
  simply is there, the bloom never appears, the seal is already cracked, the
  letter is already up. Nothing is removed; only the movement is.
*/
@media (prefers-reduced-motion: reduce) {
  .streak-root *:not(.streak-keep-motion) {
    animation: none !important;
    transition: none !important;
  }
}

/*
  The export subtree. html-to-image snapshots whatever is painted, so a capture
  taken mid-animation bakes a half-faded light into the PNG. Zeroing the
  duration lands every animation on its END state, which is the state the
  screen would have reached anyway.

  (No backticks in this string, ever — it is a template literal.)
*/
.streak-frozen, .streak-frozen * {
  animation-play-state: paused !important;
  animation-delay: 0ms !important;
  animation-duration: 0ms !important;
  transition: none !important;
}
`;

/** Mounted once per template instance. */
export default function StreakStyles() {
  return <style>{CSS}</style>;
}
