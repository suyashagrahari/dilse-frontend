"use client";

import { useEffect, useMemo, useState } from "react";
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

/** Group flat headings into H2 sections, each owning the H3s that follow it. */
interface TocSection {
  heading: TocHeading;
  children: TocHeading[];
}
function buildSections(headings: TocHeading[]): TocSection[] {
  const sections: TocSection[] = [];
  for (const h of headings) {
    if (h.level <= 2 || sections.length === 0) {
      sections.push({ heading: h, children: [] });
    } else {
      sections[sections.length - 1].children.push(h);
    }
  }
  return sections;
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
  const sections = useMemo(() => buildSections(headings), [headings]);

  // Collapsed by default so the list stays short (and the sidebar promo card
  // below it stays fully visible). Clicking the arrow on an H2 reveals its H3s.
  const [open, setOpen] = useState<Record<number, boolean>>({});

  // Auto-expand the section that contains the currently-active heading so the
  // reader always sees where they are, even inside a collapsed group.
  useEffect(() => {
    if (!active) return;
    const idx = sections.findIndex(
      (s) => s.heading.id === active || s.children.some((c) => c.id === active)
    );
    if (idx >= 0) setOpen((prev) => (prev[idx] ? prev : { ...prev, [idx]: true }));
  }, [active, sections]);

  const toggle = (i: number) => setOpen((prev) => ({ ...prev, [i]: !prev[i] }));

  return (
    <ul>
      {sections.map((section, i) => {
        const { heading: h, children } = section;
        const isActive = active === h.id;
        const hasChildren = children.length > 0;
        const isOpen = !!open[i];
        return (
          <li key={i} style={{ borderTop: i === 0 ? "none" : "1px solid rgba(61,12,17,0.06)" }}>
            {/* H2 row: title link + (optional) expand/collapse arrow */}
            <div
              className="flex items-stretch"
              style={{
                borderLeft: `3px solid ${isActive ? ACCENT : "transparent"}`,
                background: isActive ? "rgba(154,51,36,0.07)" : "transparent",
              }}
            >
              <a
                href={`#${h.id}`}
                onClick={(e) => scrollToHeading(e, h.id)}
                className="flex-1 leading-snug transition-colors"
                style={{
                  paddingTop: 10,
                  paddingBottom: 10,
                  paddingLeft: 16,
                  paddingRight: hasChildren ? 4 : 16,
                  color: isActive ? ACCENT : INK,
                  fontWeight: isActive ? 700 : 600,
                  fontSize: 14.5,
                }}
              >
                {h.text}
              </a>
              {hasChildren && (
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  aria-expanded={isOpen}
                  aria-label={isOpen ? `Collapse ${h.text}` : `Expand ${h.text}`}
                  className="flex shrink-0 items-center justify-center transition-colors hover:bg-black/5"
                  style={{ width: 38, color: isActive ? ACCENT : "rgba(42,10,14,0.45)" }}
                >
                  <span
                    aria-hidden
                    className="transition-transform duration-200"
                    style={{
                      display: "inline-block",
                      fontSize: 11,
                      transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                    }}
                  >
                    ▶
                  </span>
                </button>
              )}
            </div>

            {/* H3 children — revealed when the section is open */}
            {hasChildren && (
              <div
                className="overflow-hidden transition-all duration-200"
                style={{ maxHeight: isOpen ? children.length * 44 + 8 : 0, opacity: isOpen ? 1 : 0 }}
              >
                <ul style={{ paddingBottom: isOpen ? 4 : 0 }}>
                  {children.map((c, ci) => {
                    const childActive = active === c.id;
                    return (
                      <li key={ci}>
                        <a
                          href={`#${c.id}`}
                          onClick={(e) => scrollToHeading(e, c.id)}
                          className="flex items-start gap-2 leading-snug transition-colors"
                          style={{
                            paddingTop: 8,
                            paddingBottom: 8,
                            paddingRight: 16,
                            paddingLeft: 30,
                            color: childActive ? ACCENT : "rgba(42,10,14,0.6)",
                            fontWeight: childActive ? 700 : 400,
                            fontSize: 13.5,
                          }}
                        >
                          <span
                            aria-hidden
                            style={{
                              marginTop: 6,
                              flexShrink: 0,
                              width: 5,
                              height: 5,
                              borderRadius: "50%",
                              background: childActive ? ACCENT : "rgba(42,10,14,0.3)",
                            }}
                          />
                          <span>{c.text}</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
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

  // Desktop: sticky table-style card. The card itself owns the scroll (header
  // pinned, rows scroll inside) so the rounded corners stay intact on every side
  // and the scrollbar lives INSIDE the card — never floating outside it.
  return (
    <nav
      aria-label="Table of contents"
      className="toc-card flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl"
      style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(61,12,17,0.12)" }}
    >
      <p
        className="shrink-0 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em]"
        style={{ color: GOLD, borderBottom: "1px solid rgba(61,12,17,0.1)" }}
      >
        On this page
      </p>
      <div className="toc-scroll min-h-0 flex-1 overflow-y-auto">
        <TocRows headings={headings} active={active} />
      </div>
    </nav>
  );
}
