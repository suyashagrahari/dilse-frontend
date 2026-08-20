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
        className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl text-2xl transition group-hover:scale-[1.04]"
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
        <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="font-semibold leading-snug" style={{ color: MAROON }}>
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
            className="mt-0.5 text-[13px] leading-snug"
            // Clamped inline rather than with `line-clamp-2`. The utility needs
            // display:-webkit-box, and the class it sat next to won the cascade,
            // so the clamp silently did nothing and a long description made one
            // card twice its neighbour's height. Inline styles cannot be lost to
            // class ordering.
            style={{
              color: "rgba(42,10,14,0.6)",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {template.description}
          </span>
        )}
      </span>
      {/* Always visible. A hover-only arrow tells a touch user nothing, and it is
          the only thing on the row that says "this opens something". */}
      <ArrowRight
        size={16}
        className="mt-1 shrink-0 opacity-40 transition group-hover:translate-x-0.5 group-hover:opacity-100"
        style={{ color: GOLD }}
      />
    </>
  );

  const className =
    "group flex h-full items-start gap-3 rounded-2xl border p-3.5 text-left transition " +
    "hover:-translate-y-0.5 hover:border-[rgba(201,168,76,0.55)] hover:shadow-[0_10px_24px_-12px_rgba(61,12,17,0.35)] " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(201,168,76,0.6)]";
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

  /** Few enough entries that a fixed-height panel would be mostly empty. */
  const short = templates.length <= 4;

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
        className={
          // A long list gets a FIXED height so the dialog does not resize on every
          // keystroke while filtering. A short one — and a post usually links only
          // one or two templates — gets a content height instead, because a 640px
          // panel holding two cards is mostly empty space. Filtering a list this
          // short has nothing to jump around.
          short
            ? "flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl shadow-2xl sm:rounded-3xl"
            : "flex h-[86vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl shadow-2xl sm:h-[600px] sm:max-h-[88vh] sm:rounded-3xl lg:h-[640px]"
        }
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
            <p className="mt-1 text-[13px] leading-snug" style={{ color: "rgba(42,10,14,0.55)" }}>
              Add your photos and words, then send it as one link.
            </p>
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

        {/* Search — pointless when every option is already on screen. */}
        {!short && (
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
        )}

        {/* Category chips — same reasoning as the search box. */}
        {!short && (
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
        )}

        {/* List — the only scrollable region.
            gridAutoRows:min-content sizes each row to its tallest card; `h-full`
            on the card (see TemplateLink) then stretches its neighbour to match.
            1fr rows would instead give a single row the container's whole height,
            which with two results produced two 423px-tall cards of empty space. */}
        <div
          className={`mt-4 grid min-h-0 content-start gap-2.5 overflow-y-auto px-5 pb-6 sm:grid-cols-2 sm:px-7 ${
            short ? "" : "flex-1"
          }`}
          style={{ gridAutoRows: "min-content" }}
        >
          {filtered.length === 0 ? (
            <p className="col-span-full py-10 text-center text-sm" style={{ color: "rgba(42,10,14,0.5)" }}>
              No templates match “{query}”.
            </p>
          ) : (
            filtered.map((t) => <TemplateLink key={t.id} template={t} onNavigate={onClose} />)
          )}
        </div>

        {/* The picker only lists what this post links to, so without this the
            other ~50 templates are unreachable from inside the dialog. */}
        <div
          className="flex items-center justify-between gap-3 border-t px-5 py-3.5 sm:px-7"
          style={{ borderColor: "rgba(61,12,17,0.1)", background: "rgba(61,12,17,0.02)" }}
        >
          <span className="text-xs" style={{ color: "rgba(42,10,14,0.55)" }}>
            {templates.length} suggested for this post
          </span>
          <Link
            href="/templates"
            onClick={onClose}
            className="group inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition hover:brightness-105"
            style={{ background: MAROON, color: "#f5ede6" }}
          >
            Browse all templates
            <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function TemplatesPromoCard({
  linked = [],
  variant = "full",
}: {
  /** Templates explicitly linked to this post in Strapi (relatedTemplates). */
  linked?: Template[];
  /**
   * `full` is the sidebar/end-of-post card. `compact` is the phone-only version
   * placed near the top of the article: same identity and the same CTA, but
   * without the feature list, so a reader can reach the template without
   * scrolling past the whole post — and without a second full-height card
   * shoving the article down the screen.
   */
  variant?: "full" | "compact";
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  const linkedList = Array.isArray(linked) ? linked : [];

  // CTA behaviour, in priority order:
  //  • exactly one template linked to this post → redirect straight to its page
  //  • several linked → open the picker showing just those linked templates
  //  • no linked template → redirect to the /templates listing page (no picker)
  let ctaHref: string | null = "/templates"; // default: nothing linked → catalog page
  if (linkedList.length === 1) ctaHref = linkedList[0].url;
  else if (linkedList.length > 1) ctaHref = null; // null = open the picker modal
  const modalList = linkedList;

  const compact = variant === "compact";

  const ctaClass = `${compact ? "mt-3" : "mt-4"} block w-full rounded-full py-2.5 text-center text-sm font-bold transition hover:brightness-105`;
  const ctaStyle = {
    background: "linear-gradient(90deg, #f3c9d2, #d8b4f0)",
    color: MAROON,
    boxShadow: "0 8px 24px rgba(216,180,240,0.25)",
  } as const;

  return (
    <>
      <div
        className={`relative overflow-hidden shadow-xl ${compact ? "rounded-2xl p-4" : "rounded-3xl p-5"}`}
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
          className={`leading-[1.15] ${compact ? "mt-2 text-lg" : "mt-3 text-xl"}`}
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
        >
          {compact
            ? "Make this into a page you can send"
            : "Turn this inspiration into an unforgettable surprise"}
        </h3>

        <p
          className={`text-[13px] leading-relaxed ${compact ? "mt-1.5" : "mt-2"}`}
          style={{ color: "rgba(245,237,230,0.7)" }}
        >
          {compact
            ? "Photos, a message, music and a ready-to-share link — in a couple of minutes."
            : "Build a page with photos, a heartfelt message, music and a ready-to-share link."}
        </p>

        {!compact && (
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
        )}

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

        {compact ? (
          <Link
            href="/templates"
            className="mt-2 block text-center text-xs font-semibold underline decoration-white/25 underline-offset-2 transition hover:decoration-white/60"
            style={{ color: "rgba(245,237,230,0.75)" }}
          >
            or browse all occasions
          </Link>
        ) : (
          <Link
            href="/templates"
            className="mt-2 block w-full rounded-full py-2 text-center text-[13px] font-semibold transition hover:bg-white/5"
            style={{ border: "1px solid rgba(245,237,230,0.18)", color: "#f5ede6" }}
          >
            See all occasions
          </Link>
        )}
      </div>

      {open && modalList.length > 1 && <TemplatesModal templates={modalList} onClose={close} />}
    </>
  );
}
