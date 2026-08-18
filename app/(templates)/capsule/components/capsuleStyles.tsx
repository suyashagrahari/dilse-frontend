"use client";

// ─── Capsule — keyframes ─────────────────────────────────────────────────────
//
// Every animation here is ONE-SHOT and ends on `forwards`. There are no ambient
// loops: the only continuous thing in this template is the countdown, and that
// is text, not motion.
//
// Reduced motion does NOT remove these — it collapses them to 0.01ms. That
// matters: `animation: none` would snap the element back to its pre-animation
// state and the seal would never appear to have been pressed. Collapsing the
// duration instead means the ceremony still *completes*, it just completes at
// once. The one exception is the waiting pulse, which is genuinely ambient and
// is switched off outright.

const CSS = `
@keyframes capsule-fold {
  0%   { transform: translateY(0) scaleY(1) rotateX(0deg); opacity: 1; }
  55%  { transform: translateY(6px) scaleY(.42) rotateX(38deg); opacity: .85; }
  100% { transform: translateY(14px) scaleY(.06) rotateX(78deg); opacity: 0; }
}
@keyframes capsule-press {
  0%   { transform: translateY(-46px) scale(1.5) rotate(-14deg); opacity: 0; }
  62%  { transform: translateY(4px)   scale(.94) rotate(-3deg);  opacity: 1; }
  78%  { transform: translateY(-2px)  scale(1.03) rotate(-6deg); opacity: 1; }
  100% { transform: translateY(0)     scale(1)   rotate(-5deg);  opacity: 1; }
}
@keyframes capsule-jolt {
  0%, 100% { transform: translateY(0); }
  20%      { transform: translateY(3px); }
  45%      { transform: translateY(-2px); }
  70%      { transform: translateY(1px); }
}
@keyframes capsule-shard {
  0%   { transform: translate(0,0) rotate(0deg); opacity: 1; }
  100% { transform: translate(var(--dx), var(--dy)) rotate(var(--rot)); opacity: 0; }
}
@keyframes capsule-unfurl {
  0%   { transform: scaleY(.04) translateY(-10px); opacity: 0; }
  60%  { transform: scaleY(1.04) translateY(0);    opacity: 1; }
  100% { transform: scaleY(1) translateY(0);       opacity: 1; }
}
@keyframes capsule-tremble {
  0%, 100% { transform: translate(0,0) rotate(-1.5deg); }
  15% { transform: translate(-1.5px, .5px) rotate(-2.4deg); }
  32% { transform: translate(1.5px, -.5px) rotate(-.6deg); }
  50% { transform: translate(-1px, 1px)  rotate(-2deg); }
  68% { transform: translate(1px, -1px)  rotate(-1deg); }
  84% { transform: translate(-.5px, .5px) rotate(-1.8deg); }
}
@keyframes capsule-stamp-in {
  0%   { transform: scale(2.4) rotate(-18deg); opacity: 0; }
  55%  { transform: scale(.92) rotate(2deg);   opacity: 1; }
  100% { transform: scale(1) rotate(0deg);     opacity: 1; }
}
@keyframes capsule-card-in {
  0%   { transform: translateY(14px); opacity: 0; }
  100% { transform: translateY(0);    opacity: 1; }
}
@keyframes capsule-count-in {
  0%   { transform: scale(1.9); opacity: 0; }
  30%  { transform: scale(1);   opacity: 1; }
  80%  { transform: scale(1);   opacity: 1; }
  100% { transform: scale(.92); opacity: 0; }
}
@keyframes capsule-wait-pulse {
  0%, 100% { opacity: .55; }
  50%      { opacity: 1; }
}

.capsule-fold      { animation: capsule-fold 800ms cubic-bezier(.4,0,.2,1) forwards; transform-origin: 50% 100%; }
.capsule-press     { animation: capsule-press 400ms cubic-bezier(.3,1.4,.4,1) forwards; }
.capsule-jolt      { animation: capsule-jolt 220ms ease-out 1; }
.capsule-shard     { animation: capsule-shard 900ms cubic-bezier(.2,.7,.3,1) forwards; }
.capsule-unfurl    { animation: capsule-unfurl 620ms cubic-bezier(.2,.8,.25,1) forwards; transform-origin: 50% 0%; }
.capsule-tremble   { animation: capsule-tremble 900ms ease-in-out 1 both; }
.capsule-stamp     { animation: capsule-stamp-in 300ms cubic-bezier(.3,1.5,.5,1) forwards; }
.capsule-card-in   { animation: capsule-card-in 320ms cubic-bezier(.2,.8,.25,1) forwards; }
.capsule-count     { animation: capsule-count-in 900ms ease-out forwards; }
.capsule-wait      { animation: capsule-wait-pulse 2.2s ease-in-out infinite; }

/* Capture: html-to-image clones computed style, and a clone caught mid-keyframe
   exports a half-pressed seal. Everything under the capture subtree is frozen
   at its END state before the snapshot. */
.capsule-capturing *,
.capsule-capturing {
  animation-play-state: paused !important;
  animation-duration: 0.01ms !important;
  animation-delay: 0ms !important;
  animation-iteration-count: 1 !important;
  transition: none !important;
}

@media (prefers-reduced-motion: reduce) {
  .capsule-fold, .capsule-press, .capsule-jolt, .capsule-shard, .capsule-unfurl,
  .capsule-tremble, .capsule-stamp, .capsule-card-in, .capsule-count {
    animation-duration: 0.01ms !important;
    animation-delay: 0ms !important;
  }
  .capsule-wait { animation: none !important; opacity: .8; }
}
`;

export default function CapsuleStyles() {
  return <style dangerouslySetInnerHTML={{ __html: CSS }} />;
}
