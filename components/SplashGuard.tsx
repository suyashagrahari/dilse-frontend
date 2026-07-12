"use client";

// Guarantees the #ss-splash loader gets hidden even when it was NOT inserted by a
// real document load — i.e. when the (app) layout mounts via client-side navigation
// (e.g. pressing Back from a /(templates) page) or is restored from the bfcache.
//
// In those cases the inline scripts in <AppSplash /> never execute (React-inserted
// <script> tags don't run), so the splash would otherwise sit there forever until a
// hard refresh. The inline script marks its node `data-inline="1"`; when that marker
// is present this guard defers entirely so the first-load write-on animation still plays.

import { useEffect } from "react";

export default function SplashGuard() {
  useEffect(() => {
    const html = document.documentElement;
    const el = document.getElementById("ss-splash");
    if (!el) return;

    const forceHide = () => {
      try { sessionStorage.setItem("ss_splash_shown", "1"); } catch {}
      html.classList.add("ss-splash-seen");
      el.classList.add("ss-hide");
      window.setTimeout(() => el.classList.add("ss-gone"), 450);
    };

    // bfcache restore (Back/Forward): scripts don't re-run — hide on restore.
    const onPageShow = (e: PageTransitionEvent) => { if (e.persisted) forceHide(); };
    window.addEventListener("pageshow", onPageShow);

    // If the inline script owns this node (a real document load), leave it alone so
    // the intended first-visit animation plays out.
    if (el.getAttribute("data-inline") === "1") {
      return () => window.removeEventListener("pageshow", onPageShow);
    }

    // Otherwise this node was inserted via client-side navigation → hide it now.
    const t = window.setTimeout(forceHide, 0);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  return null;
}
