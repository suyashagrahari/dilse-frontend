"use client";

// ─── Gold line-art that "draws itself" ───────────────────────────────────────
// A compositor-only wipe: the clip box slides in from one side while the art
// inside slides the other way by the same amount, so the art stays put and is
// uncovered stroke by stroke. No clip-path or mask animation (both repaint);
// two transforms. Starts when `when` turns true, or on first scroll into view
// when `when` is undefined. Reduced motion: shown at once (kit CSS + ours).

import { useEffect, useRef, useState } from "react";
import { usePic } from "./art";
import type { ArtRole } from "./types";

export function useInView<T extends Element>(opts: { threshold?: number; rootMargin?: string; once?: boolean } = {}) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  const { threshold = 0.2, rootMargin = "0px 0px -6% 0px", once = true } = opts;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Every browser we serve has IntersectionObserver.
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([en]) => {
        if (en.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) setInView(false);
      },
      { threshold, rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, rootMargin, once]);
  return [ref, inView] as const;
}

export interface WipeProps {
  role: ArtRole;
  className?: string;
  /** Start now (true) / wait (false); undefined = on scroll into view. */
  when?: boolean;
  /** ms */
  delay?: number;
  dir?: "ltr" | "rtl" | "ttb" | "btt";
  lazy?: boolean;
  sizes?: string;
}

export default function Wipe({ role, className, when, delay = 0, dir = "ltr", lazy, sizes }: WipeProps) {
  const pic = usePic();
  const [ref, seen] = useInView<HTMLSpanElement>({ threshold: 0.15 });
  const on = when === undefined ? seen : when;
  return (
    <span ref={ref} className={`fw-wipe is-${dir}${on ? " is-in" : ""}${className ? ` ${className}` : ""}`} style={{ ["--fw-wd" as string]: `${delay}ms` }} aria-hidden>
      <span className="fw-wipe-clip">
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...pic(role, { lazy, sizes })} />
      </span>
    </span>
  );
}
