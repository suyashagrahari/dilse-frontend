"use client";

import { usePrefersReducedMotion } from "../hooks/useTicketClock";

/**
 * A looping VP9/alpha clip used ONLY in the web chrome around the slip.
 *
 * These never touch the document itself. The whole illusion is that you are
 * looking at a photograph of a printed slip, and paper does not play video —
 * one bright loop pasted onto the dot-matrix ticket kills the joke outright.
 * Keeping them outside the capture node also keeps them out of the PNG export.
 *
 * Under `prefers-reduced-motion` the clip is left paused on its first frame
 * rather than removed, so the layout does not shift.
 */
export default function Loop({
  src,
  width,
  className,
  style,
}: {
  src: string;
  width: number | string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const reduced = usePrefersReducedMotion();
  return (
    <video
      src={src}
      autoPlay={!reduced}
      loop={!reduced}
      muted
      playsInline
      preload="auto"
      aria-hidden
      className={className}
      style={{ width, height: "auto", display: "block", pointerEvents: "none", ...style }}
    />
  );
}
