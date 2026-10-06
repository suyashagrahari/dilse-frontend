"use client";

// ─── Desktop section-change transition ───────────────────────────────────────
//
// On phones and tablets the admin uses SwipeTabs: pages slide sideways, which
// matches the finger that moved them. On a desktop the change comes from a
// click on the navbar, and a full-width sideways slide reads as the whole page
// lurching. Here the new section instead fades in, rises 10px and comes into
// focus (a 3px blur clearing) — while the navbar pill glides to its new tab.
// The panels inside (adminKit's Panel/Hero) then cascade in on their own
// stagger, so the page assembles rather than jumps.
//
// Keyed by pathname so it replays on every section change. `backwards` fill:
// once finished, no transform is left on the wrapper (a lingering transform
// would make it the containing block for every position:fixed toast/modal).

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export default function AdminPageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "";
  return (
    <div key={pathname} className="adm-enter">
      <style>{CSS}</style>
      {children}
    </div>
  );
}

const CSS = `
  @media (min-width: 1024px) and (prefers-reduced-motion: no-preference) {
    .adm-enter { animation: adm-enter .46s cubic-bezier(.22, 1, .36, 1) backwards; }
    @keyframes adm-enter {
      0%   { opacity: 0; transform: translateY(12px) scale(.992); filter: blur(3px); }
      60%  { filter: blur(0); }
      100% { opacity: 1; transform: none; filter: none; }
    }
  }
`;
