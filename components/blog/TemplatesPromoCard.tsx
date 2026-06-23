"use client";

/**
 * "Create a surprise" promo card shown in the blog post sidebar (and inline on
 * mobile). Tapping the CTA opens a modal listing every gift/occasion template
 * fetched from Strapi (passed in as `templates`). Each entry links to its
 * template page on the site, so a reader can turn a post into a real page.
 */
import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { Heart, Sparkles, X, Search, ArrowRight } from "lucide-react";
import type { Template } from "@/lib/strapi";
import { strapiMedia } from "@/lib/strapi";

const MAROON = "#2a0a0e";
const GOLD = "#c9a84c";

function isInternal(url: string) {
  return url.startsWith("/");
}

function TemplateLink({
  template,
  onNavigate,
}: {
  template: Template;
  onNavigate: () => void;
}) {
  const cover = strapiMedia(template.coverImage?.url);
  const inner = (
    <>
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl text-2xl"
        style={{ background: "rgba(61,12,17,0.06)" }}
      >
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="h-full w-full object-cover" />
        ) : (
          <span aria-hidden>{template.emoji || "✨"}</span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate font-semibold" style={{ color: MAROON }}>
            {template.title}
          </span>
          {template.category && (
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em]"
              style={{ background: "rgba(201,168,76,0.16)", color: "#9a7415" }}
            >
              {template.category}
            </span>
          )}
        </span>
        {template.description && (
          <span
            className="mt-0.5 line-clamp-2 block text-[13px] leading-snug"
            style={{ color: "rgba(42,10,14,0.6)" }}
          >
            {template.description}
          </span>
        )}
      </span>
      <ArrowRight
        size={16}
        className="mt-1 shrink-0 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100"
        style={{ color: GOLD }}
      />
    </>
  );

  const className =
    "group flex items-start gap-3 rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md";
  const style = {
    borderColor: "rgba(61,12,17,0.1)",
    background: "#fffdfb",
  } as const;

  return isInternal(template.url) ? (
    <Link href={template.url} onClick={onNavigate} className={className} style={style}>
      {inner}
    </Link>
  ) : (
    <a href={template.url} onClick={onNavigate} className={className} style={style}>
      {inner}
    </a>
  );
}

function TemplatesModal({
  templates,
  onClose,
}: {
  templates: Template[];
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string>("All");

  const categories = useMemo(() => {
    const set = new Set<string>();
    templates.forEach((t) => t.category && set.add(t.category));
    return ["All", ...Array.from(set)];
  }, [templates]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return templates.filter((t) => {
      const matchesCat = activeCat === "All" || t.category === activeCat;
      const matchesQuery =
        !q ||
        t.title.toLowerCase().includes(q) ||
        (t.description || "").toLowerCase().includes(q) ||
        (t.category || "").toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [templates, query, activeCat]);

  // Lock background scroll + close on Escape.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center"
      style={{ background: "rgba(20,4,6,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Choose a template"
    >
      {/* Fixed-size dialog: a stable bottom sheet on mobile and a centered card
          on laptops/desktops. Height is fixed per breakpoint (clamped to the
          viewport) so the whole modal never changes size with the result count —
          only the list area inside scrolls. */}
      <div
        className="flex h-[86vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl shadow-2xl sm:h-[600px] sm:max-h-[88vh] sm:rounded-3xl lg:h-[640px]"
        style={{ background: "#f5ede6" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-5 pt-5 sm:px-7 sm:pt-7">
          <div>
            <p
              className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em]"
              style={{ color: "#9a7415" }}
            >
              <Sparkles size={13} /> Create a surprise
            </p>
            <h2
              className="mt-1 text-2xl leading-tight sm:text-[28px]"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: MAROON }}
            >
              Choose a template
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 transition hover:bg-black/5"
            style={{ color: MAROON }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pt-4 sm:px-7">
          <div
            className="flex items-center gap-2 rounded-full border px-4 py-2.5"
            style={{ borderColor: "rgba(61,12,17,0.14)", background: "#fffdfb" }}
          >
            <Search size={16} style={{ color: "rgba(42,10,14,0.4)" }} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search templates…"
              className="w-full bg-transparent text-sm outline-none"
              style={{ color: MAROON }}
              autoFocus
            />
          </div>
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2 px-5 pt-3 sm:px-7">
          {categories.map((cat) => {
            const active = cat === activeCat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className="rounded-full px-3 py-1 text-xs font-semibold transition"
                style={
                  active
                    ? { background: MAROON, color: "#f5ede6" }
                    : { background: "rgba(61,12,17,0.06)", color: "rgba(42,10,14,0.7)" }
                }
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* List — the only scrollable region, filling the remaining height */}
        <div className="mt-4 grid min-h-0 flex-1 auto-rows-min gap-2.5 overflow-y-auto px-5 pb-6 sm:grid-cols-2 sm:px-7">
          {filtered.length === 0 ? (
            <p className="col-span-full py-10 text-center text-sm" style={{ color: "rgba(42,10,14,0.5)" }}>
              No templates match “{query}”.
            </p>
          ) : (
            filtered.map((t) => <TemplateLink key={t.id} template={t} onNavigate={onClose} />)
          )}
        </div>
      </div>
    </div>
  );
}

export default function TemplatesPromoCard({ templates }: { templates: Template[] }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  const list = Array.isArray(templates) ? templates : [];
  // CTA behaviour:
  //  • exactly one linked template → redirect straight to its page
  //  • several → open the in-page picker
  //  • none → fall back to the full /templates catalog
  const single = list.length === 1 ? list[0] : null;
  const ctaHref = single ? single.url : list.length === 0 ? "/templates" : null;

  const ctaClass =
    "mt-4 block w-full rounded-full py-2.5 text-center text-sm font-bold transition hover:brightness-105";
  const ctaStyle = {
    background: "linear-gradient(90deg, #f3c9d2, #d8b4f0)",
    color: MAROON,
    boxShadow: "0 8px 24px rgba(216,180,240,0.25)",
  } as const;

  return (
    <>
      <div
        className="relative overflow-hidden rounded-3xl p-5 shadow-xl"
        style={{
          background:
            "radial-gradient(120% 120% at 0% 0%, #4a1118 0%, #2a0a0e 55%, #1a0608 100%)",
          color: "#f5ede6",
        }}
      >
        {/* soft glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(201,168,76,0.35), transparent 70%)" }}
        />

        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em]"
          style={{ background: "rgba(201,168,76,0.18)", color: GOLD }}
        >
          <Heart size={11} fill={GOLD} /> SubhSandesh
        </span>

        <h3
          className="mt-3 text-xl leading-[1.15]"
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
        >
          Turn this inspiration into an unforgettable surprise
        </h3>

        <p className="mt-2 text-[13px] leading-relaxed" style={{ color: "rgba(245,237,230,0.7)" }}>
          Build a page with photos, a heartfelt message, music and a ready-to-share link.
        </p>

        <ul className="mt-3 space-y-1.5">
          {["Photos, message & music", "Ready-to-share link"].map((f) => (
            <li
              key={f}
              className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-[13px] font-medium"
              style={{ background: "rgba(245,237,230,0.06)" }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: GOLD }} />
              {f}
            </li>
          ))}
        </ul>

        {ctaHref ? (
          isInternal(ctaHref) ? (
            <Link href={ctaHref} className={ctaClass} style={ctaStyle}>
              Create now
            </Link>
          ) : (
            <a href={ctaHref} className={ctaClass} style={ctaStyle}>
              Create now
            </a>
          )
        ) : (
          <button onClick={() => setOpen(true)} className={ctaClass} style={ctaStyle}>
            Create now
          </button>
        )}

        <Link
          href="/templates"
          className="mt-2 block w-full rounded-full py-2 text-center text-[13px] font-semibold transition hover:bg-white/5"
          style={{ border: "1px solid rgba(245,237,230,0.18)", color: "#f5ede6" }}
        >
          See all occasions
        </Link>
      </div>

      {open && list.length > 1 && <TemplatesModal templates={list} onClose={close} />}
    </>
  );
}
