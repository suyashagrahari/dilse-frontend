"use client";

import { useEffect, Suspense, useCallback } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { templateList, categories, templateTypes } from "@/data/template-registry";
import { Search, X, Sparkles, SlidersHorizontal } from "lucide-react";
import TemplateCard from "@/components/TemplateCard";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { toggleFavoriteAsync, fetchFavorites } from "@/store/favoritesSlice";
import { useTemplateSearch } from "@/components/TemplateSearchProvider";

// Slugs temporarily treated as coming-soon even though they have a coverImage
const FORCE_COMING_SOON = new Set(["anniversary-gf", "love-gf"]);

const COMING_SOON_IMAGES: Record<string, string> = {
  // Temporarily coming soon (have real cover images)
  "anniversary-gf": "/assets/Aniversary/aniversary.png",
  "love-gf": "/assets/hero-bg.jpeg",
  // Already coming soon
  "birthday-gf": "/assets/TemplateComingSoon/happybirthday1.png",
  "birthday-friend": "/assets/TemplateComingSoon/happybirhtday2.png",
  "birthday-parents": "/assets/TemplateComingSoon/happybirthdaymomanddad.png",
  "birthday-bestfriend": "/assets/TemplateComingSoon/happybirhtday2.png",
  "valentine-gf": "/assets/TemplateComingSoon/valentine.png",
  "valentine-bestfriend": "/assets/TemplateComingSoon/galentine.png",
  "sorry-gf": "/assets/TemplateComingSoon/sorry1.png",
  "sorry-friend": "/assets/TemplateComingSoon/sorry2.png",
  "missyou-gf": "/assets/TemplateComingSoon/missyou1.png",
  "missyou-bestfriend": "/assets/TemplateComingSoon/missyou1.png",
  "anniversary-parents": "/assets/TemplateComingSoon/wddinganiversary.png",
};

const allTypes = [{ id: "all", label: "All", emoji: "✨" }, ...templateTypes];

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
                <h3 className="text-xl font-black" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--app-text)" }}>
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

  // Sync URL type param on mount
  useEffect(() => {
    const typeFromUrl = searchParams.get("type");
    if (typeFromUrl && typeFromUrl !== "all") setSelectedType(typeFromUrl);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFavorite = useCallback((e: React.MouseEvent, slug: string) => {
    e.preventDefault(); e.stopPropagation();
    dispatch(toggleFavoriteAsync(slug));
  }, [dispatch]);

  const filtered = templateList.filter((t) => {
    const matchCategory = selectedCategory === "all" || t.category === selectedCategory;
    const matchType = selectedType === "all" || t.type === selectedType;
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchType && matchSearch;
  });

  // Keep navbar count in sync
  useEffect(() => { setFilteredCount(filtered.length); }, [filtered.length, setFilteredCount]);

  const readyTemplates = filtered.filter((t) => t.coverImage && !FORCE_COMING_SOON.has(t.slug));
  const comingSoonTemplates = filtered.filter((t) => !t.coverImage || FORCE_COMING_SOON.has(t.slug));

  return (
    <div className="min-h-screen md:pt-[88px]" style={{ background: "var(--app-bg)", color: "var(--app-text)", fontFamily: "'Inter', sans-serif" }}>

      {/* ── Filter Modal ── */}
      <FilterModal
        show={showFilter} onClose={() => setShowFilter(false)}
        selectedType={selectedType} setSelectedType={setSelectedType}
        selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
        onClear={clearFilters} filteredCount={filtered.length}
        hasActiveFilters={hasActiveFilters}
      />

      {/* ── Mobile sticky search + filter ── */}
      <div className="sticky top-0 md:hidden z-40 backdrop-blur-xl border-b"
        style={{ background: "var(--app-sticky)", borderColor: "var(--app-sticky-border)" }}>
        <div className="px-4 py-3 flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--app-text-faint)" }} />
            <input type="text" placeholder="Search templates..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="app-input w-full pl-11 pr-10 py-3 rounded-2xl text-sm transition-all" />
            {search && (
              <button onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: "var(--app-surface)", color: "var(--app-text-muted)" }}>
                <X size={10} />
              </button>
            )}
          </div>
          <button onClick={() => setShowFilter(true)}
            className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all"
            style={{
              background: hasActiveFilters ? "var(--app-accent)" : "var(--app-surface)",
              color: hasActiveFilters ? "var(--app-accent-fg)" : "var(--app-text)",
              border: `1px solid ${hasActiveFilters ? "transparent" : "var(--app-border)"}`,
            }}>
            <SlidersHorizontal size={16} />
          </button>
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl shrink-0"
            style={{ background: "var(--app-accent-a12)", border: "1px solid var(--app-accent-a25)" }}>
            <Sparkles size={11} style={{ color: "var(--app-accent)" }} />
            <span className="text-[11px] font-bold tabular-nums" style={{ color: "var(--app-accent)" }}>{filtered.length}</span>
          </div>
        </div>
      </div>

      {/* ── Template grid ── */}
      <div className="px-3 pt-5 pb-12 md:px-6 md:pt-6 md:pb-16">

        {/* Page header */}
        <motion.div
          className="mb-10 md:mb-12 text-center"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
        >
          <p
            className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.3em] mb-3"
            style={{ color: "var(--app-accent)" }}
          >
            Discover
          </p>
          <h1
            className="font-black uppercase leading-none tracking-tighter text-4xl md:text-6xl lg:text-[5.5rem]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <span style={{ color: "var(--app-text)" }}>Explore </span>
            <span style={{ color: "var(--app-accent)" }}>Templates.</span>
          </h1>
        </motion.div>

        {/* Ready templates */}
        {readyTemplates.length > 0 && (
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {readyTemplates.map((template, i) => (
                <TemplateCard
                  key={template.slug}
                  template={template}
                  isFav={favSlugs.includes(template.slug)}
                  index={i}
                  onFavorite={handleFavorite}
                />
              ))}
            </div>
          </AnimatePresence>
        )}

        {/* Coming Soon */}
        {comingSoonTemplates.length > 0 && (
          <>
            {/* ── Coming Soon heading ── */}
            <motion.div
              className="mt-16 mb-10 text-center flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
            >
              {/* Top accent line */}
              <div className="w-10 h-[3px] rounded-full mb-5" style={{ background: "var(--app-accent)" }} />

              <h2
                className="font-black uppercase leading-none tracking-tighter text-4xl md:text-6xl lg:text-[5.5rem]"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                <span style={{ color: "var(--app-text)" }}>More Templates </span>
                <span style={{ color: "var(--app-accent)" }}>Coming Soon.</span>
              </h2>

              {/* Bottom accent line */}
              <div className="w-16 h-[3px] rounded-full mt-5" style={{ background: "var(--app-accent-a35)" }} />
            </motion.div>
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {comingSoonTemplates.map((template, i) => {
                  const comingSoonImg = COMING_SOON_IMAGES[template.slug];
                  return (
                    <motion.div key={template.slug} layout
                      initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: i * 0.03, type: "spring", stiffness: 300, damping: 25 }}>
                      <div className="relative">
                        <div className="relative aspect-[3/4] rounded-2xl md:rounded-3xl overflow-hidden" style={{ border: "1px solid var(--app-border)" }}>
                          <div className="absolute inset-0" style={{ background: "var(--app-cs-bg)" }} />
                          {comingSoonImg && (
                            <div className="absolute inset-0">
                              <Image src={comingSoonImg} alt="" fill className="object-cover opacity-65" sizes="(max-width:768px) 50vw, (max-width:1024px) 33vw, 25vw" />
                            </div>
                          )}
                          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.45), rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.85))" }} />
                          <div className="relative h-full p-3 md:p-4 flex flex-col justify-between z-10">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center"
                              style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.12)" }}>
                              <span className="text-xl md:text-2xl">{template.emoji}</span>
                            </div>
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
                            style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(10px)", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.15)" }}>
                            Coming Soon
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
          </>
        )}

        {/* Empty state */}
        {filtered.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "var(--app-accent-a06)", border: "1px solid var(--app-accent-a15)" }}>
              <Search size={24} style={{ color: "var(--app-accent)" }} />
            </div>
            <p className="font-bold mb-1" style={{ color: "var(--app-text)" }}>No templates found</p>
            <p className="text-sm mb-5" style={{ color: "var(--app-text-faint)" }}>Try adjusting your filters or search term</p>
            <button onClick={clearFilters} className="text-sm font-bold px-5 py-2 rounded-full transition-all"
              style={{ color: "var(--app-accent)", border: "1px solid var(--app-accent-a25)", background: "var(--app-accent-a08)" }}>
              Clear all filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--app-bg)" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "var(--app-accent)", borderTopColor: "transparent" }} />
          <p className="text-sm" style={{ color: "var(--app-text-faint)" }}>Loading templates...</p>
        </div>
      </div>
    }>
      <TemplatesContent />
    </Suspense>
  );
}
