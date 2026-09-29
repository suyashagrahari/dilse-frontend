"use client";

import { useEffect, useState, Suspense, useCallback, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { templateList, webpageTemplateList, categories, templateTypes } from "@/data/template-registry";
import type { TemplateListItem } from "@/types/template-config";
import { Search, X, Sparkles, SlidersHorizontal } from "lucide-react";
import TemplateCard, { TEMPLATE_CARD_CSS } from "@/components/TemplateCard";
import PremiumTemplateCard, { PREMIUM_CARD_CSS } from "@/components/PremiumTemplateCard";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { toggleFavoriteAsync, fetchFavorites } from "@/store/favoritesSlice";
import { useTemplateSearch } from "@/components/TemplateSearchProvider";
import { useTemplateAccess } from "@/hooks/useTemplateAccess";
import { GallerySkeleton } from "@/components/skeleton/Skeletons";
import {
  LUX, PREMIUM_TAB_CSS, PremiumTeaser,
} from "./PremiumShowcase";

// Slugs temporarily treated as coming-soon even though they have a coverImage
const FORCE_COMING_SOON = new Set(["anniversary-gf"]);

const COMING_SOON_IMAGES: Record<string, string> = {
  // Temporarily coming soon (have real cover images)
  "anniversary-gf": "https://cdn.subhsandesh.in/gifts-media/assets/Aniversary/aniversary.webp",
  // Already coming soon
  "birthday-gf": "https://cdn.subhsandesh.in/gifts-media/assets/TemplateComingSoon/happybirthday1.webp",
  "birthday-friend": "https://cdn.subhsandesh.in/gifts-media/assets/TemplateComingSoon/happybirhtday2.webp",
  "birthday-parents": "https://cdn.subhsandesh.in/gifts-media/assets/TemplateComingSoon/happybirthdaymomanddad.webp",
  "birthday-bestfriend": "https://cdn.subhsandesh.in/gifts-media/assets/TemplateComingSoon/happybirhtday2.webp",
  "valentine-gf": "https://cdn.subhsandesh.in/gifts-media/assets/TemplateComingSoon/valentine.webp",
  "valentine-bestfriend": "https://cdn.subhsandesh.in/gifts-media/assets/TemplateComingSoon/galentine.webp",
  "sorry-gf": "https://cdn.subhsandesh.in/gifts-media/assets/TemplateComingSoon/sorry1.webp",
  "sorry-friend": "https://cdn.subhsandesh.in/gifts-media/assets/TemplateComingSoon/sorry2.webp",
  "missyou-gf": "https://cdn.subhsandesh.in/gifts-media/assets/TemplateComingSoon/missyou1.webp",
  "missyou-bestfriend": "https://cdn.subhsandesh.in/gifts-media/assets/TemplateComingSoon/missyou1.webp",
  "anniversary-parents": "https://cdn.subhsandesh.in/gifts-media/assets/TemplateComingSoon/wddinganiversary.webp",
};

const allTypes = [{ id: "all", label: "All", emoji: "✨" }, ...templateTypes];

const UI = {
  bg: "#f5ede6",
  bgSoft: "#fbf6f1",
  text: "#2a0a0e",
  textMuted: "#7a5555",
  textFaint: "#9d7b7b",
  accent: "#c9a84c",
  accentFg: "#1a0507",
  border: "rgba(61,12,17,0.16)",
  surface: "rgba(255,255,255,0.75)",
  sticky: "rgba(245,237,230,0.92)",
};

const CORNER_FILTER =
  "brightness(0) saturate(100%) invert(8%) sepia(55%) saturate(2800%) hue-rotate(330deg) brightness(90%) contrast(120%)";
const GOLD_FILTER =
  "brightness(0) saturate(100%) invert(67%) sepia(23%) saturate(859%) hue-rotate(8deg) brightness(95%) contrast(92%)";

const CORNERS: { pos: React.CSSProperties; size: string; opacity: number; transform?: string }[] = [
  { pos: { top: 0, left: 0 }, size: "clamp(112px, 30vw, 180px)", opacity: 0.62, transform: "scaleY(-1)" },
  { pos: { top: 0, right: 0 }, size: "clamp(112px, 30vw, 180px)", opacity: 0.62, transform: "scale(-1,-1)" },
  { pos: { bottom: 0, left: 0 }, size: "clamp(86px, 24vw, 170px)", opacity: 0.54 },
  { pos: { bottom: 0, right: 0 }, size: "clamp(86px, 24vw, 170px)", opacity: 0.54, transform: "scaleX(-1)" },
];

/**
 * One gallery list. The "webpage" templates used to sit behind an App UI /
 * Webpage UI toggle; they now live with the rest, each one next to its
 * closest sibling (christian-wedding-2 beside christian-wedding). Hidden
 * templates are still removed per visitor below, exactly as before.
 */
const GALLERY_LIST: TemplateListItem[] = (() => {
  const list = [...templateList];
  for (const w of webpageTemplateList) {
    const sibling = list.findIndex((t) => w.slug.startsWith(`${t.slug}-`));
    if (sibling >= 0) list.splice(sibling + 1, 0, w);
    else list.push(w);
  }
  return list;
})();

function FilterModal({
  show, onClose,
  selectedType, setSelectedType,
  selectedCategory, setSelectedCategory,
  onClear, filteredCount,
  hasActiveFilters,
}: {
  show: boolean; onClose: () => void;
  selectedType: string; setSelectedType: (v: string) => void;
  selectedCategory: string; setSelectedCategory: (v: string) => void;
  onClear: () => void; filteredCount: number; hasActiveFilters: boolean;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="relative w-full md:max-w-lg rounded-t-3xl md:rounded-3xl overflow-hidden"
            style={{ background: "var(--app-bg)", border: "1px solid var(--app-border)" }}
            initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}>
            <div className="p-6 pb-safe-bottom">
              {/* Handle */}
              <div className="w-12 h-1 rounded-full mx-auto mb-5 md:hidden" style={{ background: "var(--app-border)" }} />

              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black" style={{ fontFamily: "'Playfair Display', serif", color: "var(--app-text)" }}>
                  Filter Templates
                </h3>
                <div className="flex items-center gap-2">
                  {hasActiveFilters && (
                    <button onClick={onClear}
                      className="text-xs font-bold px-3 py-1.5 rounded-full transition-all"
                      style={{ color: "var(--app-accent)", background: "var(--app-accent-a08)", border: "1px solid var(--app-accent-a25)" }}>
                      Clear all
                    </button>
                  )}
                  <button onClick={onClose}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                    style={{ background: "var(--app-surface)", color: "var(--app-text-muted)" }}>
                    <X size={15} />
                  </button>
                </div>
              </div>

              <div className="space-y-5">
                {/* Type */}
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] font-bold mb-3" style={{ color: "var(--app-accent)" }}>
                    Type
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {allTypes.map((t) => (
                      <button key={t.id} onClick={() => setSelectedType(t.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                        style={{
                          background: selectedType === t.id ? "var(--app-accent)" : "var(--app-surface)",
                          color: selectedType === t.id ? "var(--app-accent-fg)" : "var(--app-text)",
                          border: `1px solid ${selectedType === t.id ? "transparent" : "var(--app-border)"}`,
                        }}>
                        <span>{t.emoji}</span> {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] font-bold mb-3" style={{ color: "var(--app-accent)" }}>
                    Category
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((c) => (
                      <button key={c.id} onClick={() => setSelectedCategory(c.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                        style={{
                          background: selectedCategory === c.id ? "var(--app-accent)" : "var(--app-surface)",
                          color: selectedCategory === c.id ? "var(--app-accent-fg)" : "var(--app-text)",
                          border: `1px solid ${selectedCategory === c.id ? "transparent" : "var(--app-border)"}`,
                        }}>
                        <span>{c.emoji}</span> {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button onClick={onClose}
                className="w-full mt-6 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={{ background: "var(--app-accent)", color: "var(--app-accent-fg)" }}>
                <Sparkles size={15} />
                Show {filteredCount} Template{filteredCount !== 1 ? "s" : ""}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SearchModal({
  show,
  onClose,
  search,
  setSearch,
}: {
  show: boolean;
  onClose: () => void;
  search: string;
  setSearch: (v: string) => void;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div className="fixed inset-0 z-[220] flex items-end md:items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" onClick={onClose} />
          <motion.div
            className="relative w-full md:max-w-lg rounded-t-3xl md:rounded-3xl overflow-hidden"
            style={{ background: UI.bgSoft, border: `1px solid ${UI.border}` }}
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 360, damping: 30 }}
          >
            <div className="p-5 pb-safe-bottom">
              <div className="w-12 h-1 rounded-full mx-auto mb-5 md:hidden" style={{ background: "rgba(61,12,17,0.22)" }} />
              <div className="flex items-center justify-between mb-4">
                <h3 style={{ fontFamily: "'Playfair Display', serif", color: UI.text, fontSize: 24, fontWeight: 700 }}>Search Templates</h3>
                <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(61,12,17,0.06)", border: `1px solid ${UI.border}`, color: UI.textMuted }}>
                  <X size={14} />
                </button>
              </div>
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: UI.textFaint }} />
                <input
                  type="text"
                  placeholder="Search templates by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-11 py-3.5 rounded-2xl text-base outline-none"
                  style={{ background: "#fff", color: UI.text, border: `1px solid ${UI.border}` }}
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(61,12,17,0.08)", color: UI.textMuted }}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
              <p className="mt-3 text-xs" style={{ color: UI.textFaint }}>
                Try keywords like <span style={{ color: UI.accent, fontWeight: 700 }}>Wedding</span>, <span style={{ color: UI.accent, fontWeight: 700 }}>Eid</span>, <span style={{ color: UI.accent, fontWeight: 700 }}>Birthday</span>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ComingSoonGrid({ items, dark }: { items: TemplateListItem[]; dark: boolean }) {
  return (
    <>
      <motion.div
        className="mt-16 mb-10 text-center flex flex-col items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
      >
        <div className="w-10 h-[3px] rounded-full mb-5" style={{ background: dark ? LUX.gold : "var(--app-accent)" }} />
        <h2
          className="leading-[0.96] tracking-[-0.03em] text-[36px] md:text-[62px] lg:text-[80px]"
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, color: dark ? LUX.ivory : UI.text }}
        >
          More Templates{" "}
          <em style={{ color: dark ? LUX.gold : UI.accent, fontStyle: "italic" }}>Coming Soon.</em>
        </h2>
        <div className="w-16 h-[3px] rounded-full mt-5" style={{ background: dark ? LUX.line : "var(--app-accent-a35)" }} />
      </motion.div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {items.map((template, i) => {
          const comingSoonImg = COMING_SOON_IMAGES[template.slug];
          return (
            <div key={template.slug} className="tplCard" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
              <div className="relative">
                <div className="relative aspect-[3/4] rounded-2xl md:rounded-3xl overflow-hidden" style={{ border: "1px solid var(--app-border)" }}>
                  {comingSoonImg && (
                    <div className="absolute inset-0">
                      <Image src={comingSoonImg} alt="" fill className="object-cover opacity-65" sizes="(max-width:768px) 50vw, (max-width:1024px) 33vw, 25vw" />
                    </div>
                  )}
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.45), rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.85))" }} />
                  <div className="relative h-full p-3 md:p-4 flex flex-col justify-between z-10">
                    <span />
                    <div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider mb-2"
                        style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.45)" }}>
                        {template.type}
                      </span>
                      <h3 className="font-bold text-sm md:text-[15px] leading-tight mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>{template.title}</h3>
                      <p className="text-[11px] md:text-xs leading-relaxed line-clamp-2" style={{ color: "rgba(255,255,255,0.35)" }}>{template.description}</p>
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 rounded-2xl md:rounded-3xl flex items-center justify-center z-20 pointer-events-none">
                  <span className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest"
                    style={{ background: "rgba(0,0,0,0.72)", color: "rgba(255,255,255,0.88)", border: "1px solid rgba(255,255,255,0.18)" }}>
                    Coming Soon
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function TemplatesContent() {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const favSlugs = useAppSelector((s) => s.favorites.slugs);
  const favFetched = useAppSelector((s) => s.favorites.fetched);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  // Fetch favorites if authenticated but not yet loaded
  useEffect(() => {
    if (isAuthenticated && !favFetched) dispatch(fetchFavorites());
  }, [dispatch, isAuthenticated, favFetched]);

  const {
    search, setSearch,
    showFilter, setShowFilter,
    selectedType, setSelectedType,
    selectedCategory, setSelectedCategory,
    setFilteredCount,
    hasActiveFilters, clearFilters,
  } = useTemplateSearch();
  const [showSearch, setShowSearch] = useState(false);

  const gridRef = useRef<HTMLDivElement>(null);
  const scrollToPremium = useCallback(() => {
    const el = gridRef.current;
    if (!el) return;
    window.scrollTo({ top: Math.max(0, el.getBoundingClientRect().top + window.scrollY - 100), behavior: "smooth" });
  }, []);

  // Old links (?tab=premium) land on the premium cards, which lead the grid.
  useEffect(() => {
    if (searchParams.get("tab") !== "premium") return;
    const t = window.setTimeout(scrollToPremium, 400);
    return () => window.clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync URL type param on mount
  useEffect(() => {
    const typeFromUrl = searchParams.get("type");
    if (typeFromUrl && typeFromUrl !== "all") setSelectedType(typeFromUrl);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // "premium" used to be a category chip; premium cards now lead the grid.
  useEffect(() => {
    if (selectedCategory === "premium") setSelectedCategory("all");
  }, [selectedCategory, setSelectedCategory]);

  const handleFavorite = useCallback((e: React.MouseEvent, slug: string) => {
    e.preventDefault(); e.stopPropagation();
    dispatch(toggleFavoriteAsync(slug));
  }, [dispatch]);

  // The EFFECTIVE hidden set: what this deployment hides, minus anything a
  // super admin has granted this particular visitor early access to. A
  // pre-release template therefore appears in the gallery for the client it
  // was released to and for nobody else. See `useTemplateAccess`.
  const { hidden: hiddenTemplates } = useTemplateAccess();

  // An admin has switched these off for this deployment. Filtered here rather
  // than rendered as "coming soon", because a card that says coming soon still
  // advertises the template. See lib/templateVisibility.ts.
  const visible = useMemo(
    () => GALLERY_LIST.filter((t) => !hiddenTemplates.has(t.slug)),
    [hiddenTemplates],
  );

  const q = search.trim().toLowerCase();
  const matchBase = (t: TemplateListItem) =>
    (selectedType === "all" || t.type === selectedType) && (!q || t.title.toLowerCase().includes(q));
  const matchCategory = (t: TemplateListItem) => selectedCategory === "all" || t.category === selectedCategory;

  // One gallery: the premium collection leads, then everything else.
  const filtered = visible
    .filter((t) => matchBase(t) && matchCategory(t))
    .sort((a, b) => Number(Boolean(b.premium)) - Number(Boolean(a.premium)));

  // Keep navbar count in sync
  useEffect(() => { setFilteredCount(filtered.length); }, [filtered.length, setFilteredCount]);

  const readyTemplates = filtered.filter((t) => t.coverImage && !FORCE_COMING_SOON.has(t.slug));
  const comingSoonTemplates = filtered.filter((t) => !t.coverImage || FORCE_COMING_SOON.has(t.slug));

  // The showcase pieces ignore search and filters: they are the shop window.
  const premiumShowcase = useMemo(
    () => visible.filter((t) => t.premium && t.coverImage && !FORCE_COMING_SOON.has(t.slug)),
    [visible],
  );

  const P = false;

  // Prevent dark background bleed on mobile rubber-band overscroll.
  useEffect(() => {
    const prevBodyBg = document.body.style.background;
    const prevHtmlBg = document.documentElement.style.background;
    document.body.style.background = UI.bg;
    document.documentElement.style.background = UI.bg;
    return () => {
      document.body.style.background = prevBodyBg;
      document.documentElement.style.background = prevHtmlBg;
    };
  }, []);

  const emptyState = filtered.length === 0 && (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
        style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)" }}>
        <Search size={24} style={{ color: UI.accent }} />
      </div>
      <p className="font-bold mb-1" style={{ color: UI.text }}>No templates found</p>
      <p className="text-sm mb-5" style={{ color: UI.textFaint }}>Try adjusting your filters or search term</p>
      <button onClick={clearFilters} className="text-sm font-bold px-5 py-2 rounded-full transition-all"
        style={{ color: UI.accent, border: "1px solid rgba(201,168,76,0.35)", background: "rgba(201,168,76,0.1)" }}>
        Clear all filters
      </button>
    </motion.div>
  );

  return (
    <div
      className="min-h-screen md:pt-[88px]"
      style={{
        background: `linear-gradient(180deg, ${UI.bgSoft} 0%, ${UI.bg} 52%, ${UI.bgSoft} 100%)`,
        backgroundColor: UI.bg,
        color: P ? LUX.ivory : UI.text,
        fontFamily: "'Inter', sans-serif",
        position: "relative",
        overflowX: "hidden",
        minHeight: "100dvh",
      }}
    >
      <style>{TEMPLATE_CARD_CSS + PREMIUM_CARD_CSS + GALLERY_CSS + PREMIUM_TAB_CSS}</style>


      {/* Decorative corners + ambient glows */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        {CORNERS.map((c, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src="https://cdn.subhsandesh.in/gifts-media/indianFestival/alekhancorner2.svg"
            alt=""
            aria-hidden="true"
            style={{
              position: "fixed", ...c.pos, width: c.size, height: c.size,
              opacity: P ? c.opacity * 0.55 : c.opacity,
              transform: c.transform,
              filter: P ? GOLD_FILTER : CORNER_FILTER,
              transition: "opacity .5s ease",
              willChange: "transform",
            }}
          />
        ))}
        {!P && (
          <>
            <div style={{ position: "absolute", top: "12%", right: "10%", width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle,rgba(201,168,76,0.14) 0%,transparent 72%)" }} />
            <div style={{ position: "absolute", bottom: "20%", left: "6%", width: 290, height: 290, borderRadius: "50%", background: "radial-gradient(circle,rgba(61,12,17,0.08) 0%,transparent 74%)" }} />
          </>
        )}
      </div>

      {/* ── Filter Modal ── */}
      <FilterModal
        show={showFilter} onClose={() => setShowFilter(false)}
        selectedType={selectedType} setSelectedType={setSelectedType}
        selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
        onClear={clearFilters} filteredCount={filtered.length}
        hasActiveFilters={hasActiveFilters}
      />
      <SearchModal
        show={showSearch}
        onClose={() => setShowSearch(false)}
        search={search}
        setSearch={setSearch}
      />

      {/* ── Mobile fixed luxury nav (landing style) ── */}
      <div className="fixed top-0 left-0 right-0 md:hidden z-40 pt-2" style={{ background: "transparent" }}>
        <div
          className="mx-auto mb-2 rounded-[999px] flex items-center justify-between gap-2"
          style={{
            width: "calc(100%)",
            maxWidth: 318,
            minWidth: 240,
            minHeight: 58,
            padding: "2px 12px",
            // Opaque rather than blurred: a backdrop-filter here re-blurs the
            // scrolling cards underneath on every frame, the costliest single
            // thing on this page on a phone.
            background: P ? "rgba(20,11,18,0.97)" : "rgba(245,237,230,0.97)",
            border: P ? `1px solid ${LUX.line}` : "1px solid rgba(61,12,17,0.12)",
            boxShadow: P ? "0 10px 30px rgba(0,0,0,0.5)" : "0 6px 24px rgba(61,12,17,0.12)",
            transition: "background-color .4s ease, border-color .4s ease",
          }}
        >
          <Link
            href="/"
            className="inline-flex items-center min-w-0"
            style={{ textDecoration: "none", maxWidth: "calc(100% - 92px)" }}
            aria-label="Go to home hero"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://cdn.subhsandesh.in/gifts-media/indianFestival/logo-sm.webp" alt="SubhSandesh" width={48} height={48} style={{ width: 48, height: 48, objectFit: "contain", flexShrink: 0 }} />
            <span
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 16,
                fontWeight: 700,
                color: P ? LUX.ivory : UI.text,
                lineHeight: 1,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              SubhSandesh
            </span>
          </Link>

          <div
            className="flex items-center gap-1.5"
            style={{ marginLeft: "auto", width: "fit-content", flexShrink: 0, position: "relative", zIndex: 1 }}
          >
            <button
              onClick={() => setShowSearch(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all relative"
              style={{
                background: search ? (P ? LUX.gold : UI.accent) : P ? "rgba(255,255,255,0.06)" : "rgba(61,12,17,0.06)",
                color: search ? UI.accentFg : P ? LUX.ivory : UI.text,
                border: `1px solid ${search ? "transparent" : P ? LUX.line : UI.border}`,
              }}
              aria-label="Open search"
            >
              <Search size={14} />
            </button>

            <button
              onClick={() => setShowFilter(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all relative"
              style={{
                background: hasActiveFilters ? (P ? LUX.gold : UI.accent) : P ? "rgba(255,255,255,0.06)" : "rgba(61,12,17,0.06)",
                color: hasActiveFilters ? UI.accentFg : P ? LUX.ivory : UI.text,
                border: `1px solid ${hasActiveFilters ? "transparent" : P ? LUX.line : UI.border}`,
              }}
              aria-label="Open filters"
            >
              <SlidersHorizontal size={14} />
              {hasActiveFilters && (
                <span style={{ position: "absolute", top: 5, right: 5, width: 5, height: 5, borderRadius: "50%", background: "#1a0507", opacity: 0.7 }} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Spacer for fixed mobile nav so content stays below */}
      <div className="md:hidden" style={{ height: 76 }} />

      <div className="px-3 pt-4 pb-12 md:px-6 md:pt-6 md:pb-20" style={{ position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>

          {/* Page header */}
          <header className="mb-7 md:mb-9 text-center">
            <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.3em] mb-3" style={{ color: UI.accent }}>
              Discover
            </p>
            <h1
              className="leading-[0.96] tracking-[-0.03em] text-[40px] md:text-[68px] lg:text-[84px]"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, color: UI.text }}
            >
              Explore <em style={{ color: UI.accent, fontStyle: "italic" }}>Templates.</em>
            </h1>
            <div className="flex items-center justify-center gap-4 mt-4">
              <div style={{ width: 80, height: 1, background: "linear-gradient(to right,transparent,rgba(201,168,76,0.6))" }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://cdn.subhsandesh.in/gifts-media/indianFestival/akehan3.svg" aria-hidden="true" alt="" style={{ width: 20, height: 20, opacity: 0.45, filter: GOLD_FILTER }} />
              <div style={{ width: 80, height: 1, background: "linear-gradient(to left,transparent,rgba(201,168,76,0.6))" }} />
            </div>
          </header>

          {!hasActiveFilters && premiumShowcase.length > 0 && (
            <PremiumTeaser items={premiumShowcase} count={premiumShowcase.length} onExplore={scrollToPremium} />
          )}

          <div ref={gridRef}>
            {readyTemplates.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {readyTemplates.map((template, i) => template.premium ? (
                  <PremiumTemplateCard
                    key={template.slug}
                    template={template}
                    isFav={favSlugs.includes(template.slug)}
                    index={i}
                    onFavorite={handleFavorite}
                  />
                ) : (
                  <TemplateCard
                    key={template.slug}
                    template={template}
                    isFav={favSlugs.includes(template.slug)}
                    index={i}
                    onFavorite={handleFavorite}
                  />
                ))}
              </div>
            )}
            {comingSoonTemplates.length > 0 && <ComingSoonGrid items={comingSoonTemplates} dark={false} />}
            {emptyState}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <GallerySkeleton label="Loading templates" />;
  }

  return (
    <Suspense fallback={<GallerySkeleton label="Loading templates" />}>
      <TemplatesContent />
    </Suspense>
  );
}

/** Tabs, chips and the cross-tab hint. Theme-aware via `.isDark`. */
const GALLERY_CSS = `
.pgTabsWrap { display: flex; justify-content: center; margin: 0 0 26px; }
@media (min-width: 768px) { .pgTabsWrap { margin-bottom: 40px; } }
.pgTabs { position: relative; display: grid; grid-template-columns: 1fr 1fr; gap: 4px; width: 100%; max-width: 440px; padding: 5px;
  border-radius: 999px; background: rgba(255,255,255,.62); border: 1px solid rgba(61,12,17,.14);
  box-shadow: 0 10px 30px -18px rgba(61,12,17,.45); transition: background-color .45s ease, border-color .45s ease; }
.pgTabs.isDark { background: rgba(255,255,255,.04); border-color: rgba(230,199,126,.26); box-shadow: 0 16px 40px -20px rgba(0,0,0,.9), inset 0 1px 0 rgba(255,240,200,.06); }
.pgTab { position: relative; border: 0; background: none; cursor: pointer; padding: 9px 10px 8px; border-radius: 999px; color: #7a5555;
  -webkit-tap-highlight-color: transparent; transition: color .3s ease; }
.pgTabs.isDark .pgTab { color: rgba(246,236,217,.6); }
.pgTab:focus-visible { outline: 2px solid #c9a84c; outline-offset: 2px; }
.pgTabPill { position: absolute; inset: 0; border-radius: 999px; background: #3d0c11; box-shadow: 0 8px 20px -10px rgba(61,12,17,.8); }
.pgTabs.isDark .pgTabPill { background: linear-gradient(135deg, #fbecc0 0%, #e6c77e 45%, #b8893a 100%);
  box-shadow: 0 10px 26px -10px rgba(230,199,126,.65), inset 0 1px 0 rgba(255,255,255,.6); }
.pgTab.isActive { color: #f7ecd9; }
.pgTabs.isDark .pgTab.isActive { color: #241505; }
.pgTabInner { position: relative; display: flex; flex-direction: column; align-items: center; gap: 3px; }
.pgTabTop { display: inline-flex; align-items: center; gap: 6px; font: 800 12.5px/1 'Inter', system-ui, sans-serif; letter-spacing: .16em; text-transform: uppercase; }
.pgTabCount { min-width: 20px; padding: 3px 6px; border-radius: 99px; font-size: 10px; letter-spacing: 0; background: rgba(61,12,17,.08); }
.pgTab.isActive .pgTabCount { background: rgba(255,255,255,.16); }
.pgTabs.isDark .pgTabCount { background: rgba(255,255,255,.08); }
.pgTabs.isDark .pgTab.isActive .pgTabCount { background: rgba(36,21,5,.14); }
.pgTabHint { font: 500 10px/1 'Inter', system-ui, sans-serif; letter-spacing: .04em; opacity: .75; }
@media (min-width: 768px) { .pgTab { padding: 12px 14px 11px; } .pgTabTop { font-size: 13.5px; } .pgTabHint { font-size: 11px; } }

.pgChips { display: flex; gap: 8px; overflow-x: auto; margin: 0 -12px 18px; padding: 2px 12px 6px; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
.pgChips::-webkit-scrollbar { display: none; }
@media (min-width: 768px) { .pgChips { flex-wrap: wrap; justify-content: center; overflow: visible; margin: 0 0 26px; padding: 0; } }
.pgChip { flex-shrink: 0; display: inline-flex; align-items: center; gap: 6px; padding: 8px 13px; border-radius: 99px; cursor: pointer;
  font: 700 12px/1 'Inter', system-ui, sans-serif; color: #2a0a0e; background: rgba(255,255,255,.7); border: 1px solid rgba(61,12,17,.14);
  transition: transform .2s ease; -webkit-tap-highlight-color: transparent; }
.pgChip:active { transform: scale(.96); }
.pgChip:focus-visible { outline: 2px solid #c9a84c; outline-offset: 2px; }
.pgChip.isActive { background: #3d0c11; color: #f7ecd9; border-color: transparent; }
.pgChipCount { font-size: 10.5px; opacity: .55; }
.pgChips.isDark .pgChip { color: rgba(246,236,217,.82); background: rgba(255,255,255,.04); border-color: rgba(230,199,126,.2); }
.pgChips.isDark .pgChip.isActive { background: linear-gradient(135deg, #fbecc0, #e6c77e 50%, #b8893a); color: #241505; border-color: transparent; }
@media (min-width: 768px) { .pgChips.isDark { max-width: 1080px; margin-left: auto; margin-right: auto; } }

.pgCross { display: flex; align-items: center; justify-content: center; gap: 10px; margin: -6px auto 18px; font: 600 12.5px/1.3 'Inter', system-ui, sans-serif; color: #7a5555; }
.pgCross button { border: 1px solid rgba(201,168,76,.45); background: rgba(201,168,76,.12); color: #8b5a2b; padding: 6px 12px; border-radius: 99px; font: 700 12px/1 'Inter', system-ui, sans-serif; cursor: pointer; }
.pgCross.isDark { color: rgba(246,236,217,.64); }
.pgCross.isDark button { color: #e6c77e; border-color: rgba(230,199,126,.35); background: rgba(230,199,126,.08); }
@media (prefers-reduced-motion: reduce) { .pgTabs, .pgTab, .pgChip { transition: none; } }
`;
