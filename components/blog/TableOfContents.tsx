"use client";

import { useEffect, useState } from "react";
import type { BlocksContent } from "@/lib/strapi";
import {
  extractBlockHeadings,
  extractMarkdownHeadings,
  type TocHeading,
} from "@/lib/blog-utils";

function getHeadings(content?: BlocksContent | null, markdown?: string | null): TocHeading[] {
  if (markdown && markdown.trim()) return extractMarkdownHeadings(markdown);
  if (Array.isArray(content)) return extractBlockHeadings(content);
  return [];
}

/** Smooth-scroll to a heading and update the URL hash without a jump. */
function scrollToHeading(e: React.MouseEvent, id: string) {
  e.preventDefault();
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  history.replaceState(null, "", `#${id}`);
}

/** Track which heading is currently in view to highlight the active TOC item. */
function useActiveHeading(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    if (!ids.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((en) => en.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-90px 0px -65% 0px", threshold: 0 }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids.join("|")]); // eslint-disable-line react-hooks/exhaustive-deps
  return active;
}

const ACCENT = "#9a3324";
const GOLD = "#c9a84c";
const INK = "#2a0a0e";

function TocRows({ headings, active }: { headings: TocHeading[]; active: string | null }) {
  return (
    <ul>
      {headings.map((h, i) => {
        const isActive = active === h.id;
        const isSub = h.level === 3;
        return (
          <li
            key={i}
            style={{ borderTop: i === 0 ? "none" : "1px solid rgba(61,12,17,0.06)" }}
          >
            <a
              href={`#${h.id}`}
              onClick={(e) => scrollToHeading(e, h.id)}
              className="group flex items-start gap-2 leading-snug transition-colors"
              style={{
                paddingTop: 10,
                paddingBottom: 10,
                paddingRight: 16,
                paddingLeft: isSub ? 26 : 16,
                borderLeft: `3px solid ${isActive ? ACCENT : "transparent"}`,
                background: isActive ? "rgba(154,51,36,0.07)" : "transparent",
                color: isActive ? ACCENT : isSub ? "rgba(42,10,14,0.6)" : INK,
                fontWeight: isActive ? 700 : isSub ? 400 : 600,
                fontSize: isSub ? 13.5 : 14.5,
              }}
            >
              {isSub && (
                <span
                  aria-hidden
                  style={{
                    marginTop: 6,
                    flexShrink: 0,
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: isActive ? ACCENT : "rgba(42,10,14,0.3)",
                  }}
                />
              )}
              <span>{h.text}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export default function TableOfContents({
  content,
  markdown,
  variant = "sidebar",
}: {
  content?: BlocksContent | null;
  markdown?: string | null;
  variant?: "sidebar" | "inline";
}) {
  const headings = getHeadings(content, markdown);
  const active = useActiveHeading(headings.map((h) => h.id));

  if (headings.length < 3) return null; // not worth a TOC for tiny posts

  // Mobile: collapsible card so it doesn't eat the top of the screen.
  if (variant === "inline") {
    return (
      <details
        className="overflow-hidden rounded-2xl lg:hidden"
        style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(61,12,17,0.12)" }}
      >
        <summary
          className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em]"
          style={{ color: GOLD }}
        >
          On this page
          <span aria-hidden style={{ color: "rgba(42,10,14,0.4)" }}>▾</span>
        </summary>
        <div style={{ borderTop: "1px solid rgba(61,12,17,0.1)" }}>
          <TocRows headings={headings} active={active} />
        </div>
      </details>
    );
  }

  // Desktop: sticky table-style card.
  return (
    <nav
      aria-label="Table of contents"
      className="overflow-hidden rounded-2xl"
      style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(61,12,17,0.12)" }}
    >
      <p
        className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em]"
        style={{ color: GOLD, borderBottom: "1px solid rgba(61,12,17,0.1)" }}
      >
        On this page
      </p>
      <TocRows headings={headings} active={active} />
    </nav>
  );
}
