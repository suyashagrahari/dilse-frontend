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

function TocLinks({ headings, active }: { headings: TocHeading[]; active: string | null }) {
  return (
    <ul className="space-y-1">
      {headings.map((h, i) => {
        const isActive = active === h.id;
        return (
          <li key={i}>
            <a
              href={`#${h.id}`}
              onClick={(e) => scrollToHeading(e, h.id)}
              className="block rounded-md py-1 text-sm transition-colors"
              style={{
                paddingLeft: h.level === 3 ? 18 : 8,
                paddingRight: 8,
                color: isActive ? "#9a3324" : h.level <= 2 ? "#2a0a0e" : "rgba(42,10,14,0.65)",
                fontWeight: isActive ? 700 : h.level <= 2 ? 600 : 400,
                borderLeft: `2px solid ${isActive ? "#9a3324" : "transparent"}`,
                background: isActive ? "rgba(154,51,36,0.06)" : "transparent",
              }}
            >
              {h.text}
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

  const label = (
    <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "#c9a84c" }}>
      On this page
    </p>
  );

  // Mobile: collapsible card so it doesn't eat the top of the screen.
  if (variant === "inline") {
    return (
      <details
        className="rounded-2xl p-4 lg:hidden"
        style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(61,12,17,0.12)" }}
      >
        <summary className="cursor-pointer list-none text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "#c9a84c" }}>
          On this page
        </summary>
        <div className="mt-3">
          <TocLinks headings={headings} active={active} />
        </div>
      </details>
    );
  }

  // Desktop: sticky sidebar rail.
  return (
    <nav aria-label="Table of contents" className="text-[13px]">
      {label}
      <TocLinks headings={headings} active={active} />
    </nav>
  );
}
