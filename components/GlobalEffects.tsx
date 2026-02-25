"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Adds custom cursor + view-transition CSS to all non-homepage pages.
 * (Homepage handles its own cursor + transitions separately.)
 */
export default function GlobalEffects() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    if (isHome) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const c = document.getElementById("app-cursor");
    const t = document.getElementById("app-cursor-trail");
    if (!c || !t) return;

    const onMove = (e: MouseEvent) => {
      c.style.left = e.clientX + "px";
      c.style.top = e.clientY + "px";
      setTimeout(() => {
        t.style.left = e.clientX + "px";
        t.style.top = e.clientY + "px";
      }, 80);
    };

    document.addEventListener("mousemove", onMove);
    return () => document.removeEventListener("mousemove", onMove);
  }, [isHome]);

  if (isHome) return null;

  return (
    <>
      <style>{`
        @media (pointer: fine) {
          body { cursor: none; }

          #app-cursor {
            position: fixed;
            top: 0; left: 0;
            width: 18px; height: 18px;
            border-radius: 9999px;
            background: var(--app-accent);
            box-shadow: 0 0 14px var(--app-accent-a35);
            pointer-events: none;
            z-index: 9998;
            transform: translate(-50%, -50%);
            transition: width 0.18s ease, height 0.18s ease, background 0.3s ease, box-shadow 0.3s ease;
          }

          #app-cursor-trail {
            position: fixed;
            top: 0; left: 0;
            width: 48px; height: 48px;
            border-radius: 9999px;
            border: 2px solid var(--app-accent-a35);
            pointer-events: none;
            z-index: 9997;
            transform: translate(-50%, -50%);
            transition: left 0.12s ease, top 0.12s ease, width 0.18s ease, height 0.18s ease, border-color 0.3s ease;
          }

          body:has(a:hover) #app-cursor,
          body:has(button:hover) #app-cursor {
            width: 26px; height: 26px;
          }

          body:has(a:hover) #app-cursor-trail,
          body:has(button:hover) #app-cursor-trail {
            width: 72px; height: 72px;
          }
        }

        /* View Transition: disable default cross-fade so our clipPath ripple runs cleanly */
        ::view-transition-old(root),
        ::view-transition-new(root) {
          animation: none;
          mix-blend-mode: normal;
        }
      `}</style>

      <div id="app-cursor" />
      <div id="app-cursor-trail" />
    </>
  );
}
