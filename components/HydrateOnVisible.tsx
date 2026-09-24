"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// ── Server-render now, hydrate when it scrolls near ──────────────────────────
//
// The landing is one client tree, so React hydrated every section at load —
// including six below the fold, whose framer-motion timers and colour/position
// animations then ran off-screen. On an emulated Moto G that was the bulk of
// the 500ms+ Total Blocking Time and ~2s of style/layout work, all spent on
// content nobody could see yet.
//
// How it works:
//   • Server: renders `children` normally, so the HTML (and everything crawlers,
//     no-JS visitors and #anchor links rely on) is unchanged.
//   • Client, first render: renders an EMPTY div with dangerouslySetInnerHTML +
//     suppressHydrationWarning. React does not hydrate or touch the inside of an
//     element that has dangerouslySetInnerHTML, so the server markup stays on
//     screen as plain, static HTML — no JS runs for it.
//   • When the wrapper comes within `rootMargin` of the viewport, the real
//     children mount (under a different `key`, so React replaces the static
//     node wholesale rather than trying to reconcile into it). This happens
//     before it is visible, so the swap is never seen.
//
// Lighthouse never scrolls, so these sections cost nothing in its measurement;
// a real visitor gets them live a few hundred pixels before they arrive.
export default function HydrateOnVisible({
  children,
  rootMargin = "400px 0px",
}: {
  children: ReactNode;
  rootMargin?: string;
}) {
  // true on the server (render the content); false on the client's first render
  // (keep the server's HTML without hydrating it).
  const [live, setLive] = useState(() => typeof window === "undefined");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (live) return;
    const el = ref.current;
    if (!el) return;
    // IntersectionObserver is in every browser Next.js supports, so there is
    // no fallback path — a section can only go live from the observer callback.
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          setLive(true);
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [live, rootMargin]);

  if (live) {
    return (
      <div key="live" className="hydrate-on-visible">
        {children}
      </div>
    );
  }
  return (
    <div
      key="static"
      ref={ref}
      className="hydrate-on-visible"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: "" }}
    />
  );
}
