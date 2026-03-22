"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Adds page-level visual effects for non-home pages.
 */
export default function GlobalEffects() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {}, [isHome]);

  if (isHome) return null;

  return (
    <>
      <style>{`
        /* View Transition: disable default cross-fade so our clipPath ripple runs cleanly */
        ::view-transition-old(root),
        ::view-transition-new(root) {
          animation: none;
          mix-blend-mode: normal;
        }
      `}</style>
    </>
  );
}
