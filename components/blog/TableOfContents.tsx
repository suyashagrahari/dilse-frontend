"use client";

import type { BlocksContent } from "@/lib/strapi";
import { headingId } from "./ArticleBody";

interface Heading {
  text: string;
  level: number;
  id: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractHeadings(content: BlocksContent): Heading[] {
  if (!Array.isArray(content)) return [];
  return content
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((b: any) => b.type === "heading" && b.level <= 3)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((b: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const text = (b.children || []).map((c: any) => c.text || "").join("");
      return { text, level: b.level as number, id: headingId(text) };
    })
    .filter((h) => h.text);
}

export default function TableOfContents({ content }: { content: BlocksContent }) {
  const headings = extractHeadings(content);
  if (headings.length < 3) return null; // not worth a TOC for tiny posts

  return (
    <nav
      aria-label="Table of contents"
      className="rounded-2xl p-5"
      style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(61,12,17,0.12)" }}
    >
      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "#c9a84c" }}>
        On this page
      </p>
      <ul className="space-y-2">
        {headings.map((h, i) => (
          <li key={i} style={{ paddingLeft: h.level === 3 ? 14 : 0 }}>
            <a
              href={`#${h.id}`}
              className="text-sm hover:underline"
              style={{ color: h.level <= 2 ? "#2a0a0e" : "rgba(42,10,14,0.7)", fontWeight: h.level <= 2 ? 600 : 400 }}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
