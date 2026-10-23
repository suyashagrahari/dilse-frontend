"use client";

// ─── Finding your way down one long page ─────────────────────────────────────
// Phones: a small floating pill at the bottom (the thumb zone) naming the
// section you are in; tap it for the list. Laptops: a quiet rail of labelled
// dots on the right edge. Both follow the scroll (IntersectionObserver).

import { useEffect, useRef, useState } from "react";
import type { Strings } from "./strings";
import type { Lang } from "./types";

export interface NavItem {
  id: string;
  label: string;
}

export default function SectionNav({ items, s, lang, hidden }: { items: NavItem[]; s: Strings; lang: Lang; hidden?: boolean }) {
  const [current, setCurrent] = useState(items[0]?.id ?? "");
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const key = items.map((i) => i.id).join("|");

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter((e): e is HTMLElement => !!e);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setCurrent(vis[0].target.id);
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: PointerEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  };

  if (items.length < 3) return null;
  const label = items.find((i) => i.id === current)?.label ?? items[0].label;

  return (
    <>
      <div ref={panelRef} className={`rc-pill-wrap${hidden ? " is-hidden" : ""}`}>
        {open && (
          <nav className="rc-pill-menu" aria-label={s.sections}>
            <ul>
              {items.map((i) => (
                <li key={i.id}>
                  <button type="button" aria-current={i.id === current ? "true" : undefined} onClick={() => go(i.id)} lang={lang}>
                    {i.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}
        <button type="button" className="rc-pill" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M4 7h16M4 12h16M4 17h10" />
          </svg>
          <span lang={lang}>{label}</span>
        </button>
      </div>
      <nav className={`rc-rail${hidden ? " is-hidden" : ""}`} aria-label={s.sections}>
        <ul>
          {items.map((i) => (
            <li key={i.id}>
              <button type="button" aria-current={i.id === current ? "true" : undefined} onClick={() => go(i.id)} lang={lang}>
                <span className="rc-rail-l">{i.label}</span>
                <i aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
