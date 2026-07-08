/** Small formatting helpers shared across the blog UI. */

export function formatDate(iso?: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

/** Estimate reading time (words / 200 wpm), used when Strapi hasn't computed one. */
export function readingMinutes(words: number): number {
  return Math.max(1, Math.round(words / 200));
}

// ─── Headings / table of contents ───────────────────────────────────────────

export interface TocHeading {
  text: string;
  level: number; // 2 or 3
  id: string;
}

/** Slugify heading text → stable anchor id. Shared by the body renderer + TOC. */
export function headingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/** Strip inline markdown (bold/italic/code/links) so a heading reads as plain text. */
export function stripInlineMarkdown(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // [label](url) → label
    .replace(/(\*\*|__)(.*?)\1/g, "$2") // bold
    .replace(/(\*|_)(.*?)\1/g, "$2") // italic
    .replace(/`([^`]+)`/g, "$1") // inline code
    .trim();
}

/** Extract H2/H3 headings from raw markdown, skipping fenced code blocks. */
export function extractMarkdownHeadings(md: string): TocHeading[] {
  const out: TocHeading[] = [];
  let inFence = false;
  for (const line of md.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = /^(#{2,3})\s+(.+?)\s*#*$/.exec(line);
    if (m) {
      const text = stripInlineMarkdown(m[2]);
      if (text) out.push({ level: m[1].length, text, id: headingId(text) });
    }
  }
  return out;
}

/** Extract H2/H3 headings from Strapi blocks content. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractBlockHeadings(content: any[]): TocHeading[] {
  if (!Array.isArray(content)) return [];
  return content
    .filter((b) => b?.type === "heading" && b.level <= 3)
    .map((b) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const text = (b.children || []).map((c: any) => c.text || "").join("").trim();
      return { level: b.level as number, text, id: headingId(text) };
    })
    .filter((h) => h.text);
}
