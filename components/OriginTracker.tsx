"use client";

// Records where a visitor was (page + scroll) when they follow an internal
// link from a site page, and restores that scroll spot when a template's back
// button returns them here. See lib/backNav.ts.

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { clearRestore, peekRestore, rememberOrigin } from "@/lib/backNav";

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

  // Coming back from a template: scroll to the remembered spot. The page may
  // still be laying out, and the router (or a scroll-locking splash) can reset
  // the scroll after we set it, so keep re-applying until it has held for a
  // few frames, for up to 7 s (a gallery that loads more cards as it scrolls needs a moment to grow back), and stop the moment the visitor scrolls.
  useEffect(() => {
    // Peek, don't consume: React may mount this twice in development, and the
    // first mount's cleanup must not lose the position for the second.
    const y = peekRestore(here);
    if (y == null) return;
    let raf = 0;
    let held = 0;
    let stopped = false;
    const until = performance.now() + 7000;
    const stop = () => {
      stopped = true;
      cancelAnimationFrame(raf);
    };
    const finish = () => {
      clearRestore();
      stop();
    };
    const tick = () => {
      if (stopped) return;
      if (performance.now() > until) return finish();
      const target = Math.min(y, document.documentElement.scrollHeight - window.innerHeight);
      if (Math.abs(window.scrollY - target) <= 2) {
        if (++held >= 10 && target === y) return finish();
      } else {
        held = 0;
        window.scrollTo({ top: target, behavior: "instant" as ScrollBehavior });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const opts = { passive: true, once: true } as const;
    // The visitor scrolling takes over for good.
    window.addEventListener("wheel", finish, opts);
    window.addEventListener("touchstart", finish, opts);
    window.addEventListener("keydown", finish, opts);
    return () => {
      stop();
      window.removeEventListener("wheel", finish);
      window.removeEventListener("touchstart", finish);
      window.removeEventListener("keydown", finish);
    };
  }, [here]);

  return null;
}
