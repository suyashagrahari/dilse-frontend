"use client";

// Records where a visitor was (page + scroll) when they follow an internal
// link from a site page, and restores that scroll spot when a template's back
// button returns them here. See lib/backNav.ts.

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { rememberOrigin, takeRestore } from "@/lib/backNav";

export default function OriginTracker() {
  const pathname = usePathname();
  const search = useSearchParams();
  const here = search?.toString() ? `${pathname}?${search.toString()}` : pathname;

  // Capture phase, so it runs before Next's Link handler starts the navigation.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      let url: URL;
      try {
        url = new URL(a.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      rememberOrigin(window.location.pathname + window.location.search, window.scrollY);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // Coming back from a template: scroll to the remembered spot once the page
  // is tall enough (cards and images may still be laying out), for up to 4 s.
  useEffect(() => {
    const y = takeRestore(here);
    if (y == null) return;
    let raf = 0;
    const until = performance.now() + 4000;
    const tick = () => {
      const tallEnough = document.documentElement.scrollHeight >= y + window.innerHeight * 0.5;
      if (tallEnough || performance.now() > until) {
        window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior });
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [here]);

  return null;
}
