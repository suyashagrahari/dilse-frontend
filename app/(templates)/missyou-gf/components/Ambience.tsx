"use client";

// Fixed atmospheric layer — a single STATIC painted wash (rose/gold radial
// gradients + soft vignette, all defined on `.mu-ambience` in missyou.css). No
// animation, blur filter, or blend modes, so it composites once and never janks.
export default function Ambience() {
  return <div aria-hidden className="mu-ambience" />;
}
