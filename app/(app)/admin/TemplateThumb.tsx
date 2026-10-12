"use client";

// ─── A template's picture, wherever the admin names a template ───────────────
//
// The server knows a page's `templateType` and its builder route; the cover
// image lives in the client's template registry, keyed by slug (the builder
// route without its slash). Look up by route first, then by type — most are
// the same word — and fall back to the template's emoji on its own gradient,
// so a template without a cover still reads as itself rather than as a gap.

import { useState, type CSSProperties } from "react";
import { templateList } from "@/data/template-registry";
import type { TemplateListItem } from "@/types/template-config";

const BY_SLUG = new Map<string, TemplateListItem>(templateList.map((t) => [t.slug, t]));

export function templateMeta(slug?: string | null, templateType?: string | null): TemplateListItem | undefined {
  const s = (slug || "").replace(/^\//, "");
  return (s && BY_SLUG.get(s)) || (templateType ? BY_SLUG.get(templateType) : undefined);
}

export default function TemplateThumb({
  slug, templateType, label, size = 44, ratio = 4 / 3, radius = 10, style,
}: {
  slug?: string | null;
  templateType?: string | null;
  label?: string;
  /** Width in px; height follows `ratio` (height / width). */
  size?: number | string;
  ratio?: number;
  radius?: number;
  style?: CSSProperties;
}) {
  const meta = templateMeta(slug, templateType);
  const [broken, setBroken] = useState(false);
  const box: CSSProperties = {
    width: size, aspectRatio: `${1} / ${ratio}`, borderRadius: radius, flex: "none", overflow: "hidden", display: "block",
    background: "linear-gradient(135deg,#5a1520,#3d0c11)", boxShadow: "0 1px 0 rgba(255,255,255,.5) inset, 0 2px 8px -3px rgba(61,12,17,.35)",
    ...style,
  };
  if (meta?.coverImage && !broken) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img src={meta.coverImage} alt={label || meta.title} loading="lazy" decoding="async" onError={() => setBroken(true)}
        style={{ ...box, objectFit: "cover", objectPosition: "top center" }} />
    );
  }
  return (
    <span aria-label={label || meta?.title} role="img" style={{ ...box, display: "grid", placeItems: "center", fontSize: typeof size === "number" ? Math.max(14, size * 0.42) : 22 }}>
      {meta?.emoji || "✨"}
    </span>
  );
}
