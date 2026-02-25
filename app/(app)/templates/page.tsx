"use client";

import { useState, useRef, useEffect, Suspense, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { templateList, categories, templateTypes } from "@/data/template-registry";
import { Search, X, Sparkles } from "lucide-react";
import FavoriteButton from "@/components/FavoriteButton";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { toggleFavoriteAsync } from "@/store/favoritesSlice";

const COMING_SOON_IMAGES: Record<string, string> = {
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

function Pill({ item, isActive, onSelect }: {
  item: { id: string; label: string; emoji: string };
  isActive: boolean; onSelect: (id: string) => void;
}) {
  return (
    <motion.button
      onClick={() => onSelect(item.id)}
      className="relative shrink-0 select-none"
      whileTap={{ scale: 0.94 }}
    >
      <div
        className="whitespace-nowrap px-4 py-2 rounded-full text-[12px] font-bold flex items-center gap-1.5 border transition-all duration-200"
        style={
          isActive
            ? {
                background: "var(--app-accent)",
                color: "var(--app-accent-fg)",
                borderColor: "transparent",
                boxShadow: "0 0 14px var(--app-accent-a35)",
              }
            : {
                background: "transparent",
                color: "var(--app-text-muted)",
                borderColor: "var(--app-accent-a25)",
              }
        }
      >
        <span className="text-sm leading-none">{item.emoji}</span>
        <span>{item.label}</span>
      </div>
    </motion.button>
  );
}

function InfiniteScrollPills({ items, selected, onSelect, speed = 25, direction = "rtl" }: {
  items: { id: string; label: string; emoji: string }[];
  selected: string; onSelect: (id: string) => void;
  speed?: number; direction?: "rtl" | "ltr";
}) {
  const fixedItem = items[0];
  const scrollingItems = items.slice(1);
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef(0);
  const setWidthRef = useRef(0);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragOffsetStartRef = useRef(0);
  const pausedRef = useRef(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hasDraggedRef = useRef(false);
  const dirMul = direction === "rtl" ? -1 : 1;

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const firstSet = track.querySelector("[data-set='0']") as HTMLElement;
    if (firstSet) setWidthRef.current = firstSet.offsetWidth;
  }, [scrollingItems]);

  const wrapOffset = useCallback((val: number) => {
    const w = setWidthRef.current;
    if (w <= 0) return val;
    let v = val % w;
    if (v > 0) v -= w;
    return v;
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    if (direction === "ltr") offsetRef.current = -setWidthRef.current;
    const animate = (time: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = time;
      const delta = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;
      if (!pausedRef.current && !isDraggingRef.current && setWidthRef.current > 0) {
        offsetRef.current += dirMul * speed * delta;
        offsetRef.current = wrapOffset(offsetRef.current);
      }
      track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [speed, dirMul, wrapOffset, direction]);

  const scheduleResume = useCallback(() => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => { pausedRef.current = false; }, 2000);
  }, []);

  useEffect(() => () => { if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current); }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    isDraggingRef.current = true; hasDraggedRef.current = false; pausedRef.current = true;
    dragStartXRef.current = e.clientX; dragOffsetStartRef.current = offsetRef.current;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartXRef.current;
    if (Math.abs(dx) > 3) hasDraggedRef.current = true;
    offsetRef.current = wrapOffset(dragOffsetStartRef.current + dx);
  }, [wrapOffset]);

  const onPointerUp = useCallback(() => { isDraggingRef.current = false; scheduleResume(); }, [scheduleResume]);

  const handleScrollingSelect = useCallback((id: string) => {
    if (hasDraggedRef.current) return;
    onSelect(id); pausedRef.current = true;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    scheduleResume();
  }, [onSelect, scheduleResume]);

  const handleFixedSelect = useCallback(() => { onSelect(fixedItem.id); }, [onSelect, fixedItem.id]);
  const onHoverStart = useCallback(() => { pausedRef.current = true; if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current); }, []);
  const onHoverEnd = useCallback(() => { if (!isDraggingRef.current) scheduleResume(); }, [scheduleResume]);

  return (
    <div className="flex items-center">
      <div className="relative z-20 shrink-0 pl-4 pr-2">
        <Pill item={fixedItem} isActive={selected === fixedItem.id} onSelect={handleFixedSelect} />
      </div>
      <div className="relative overflow-hidden flex-1 cursor-grab active:cursor-grabbing touch-pan-y"
        onMouseEnter={onHoverStart} onMouseLeave={onHoverEnd}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove}
        onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
        <div className="absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none" style={{ background: "linear-gradient(to right, var(--app-bg), transparent)" }} />
        <div className="absolute right-0 top-0 bottom-0 w-10 z-10 pointer-events-none" style={{ background: "linear-gradient(to left, var(--app-bg), transparent)" }} />
        <div ref={trackRef} className="flex will-change-transform py-0.5" style={{ width: "max-content" }}>
          {[0, 1, 2].map((setIndex) => (
            <div key={setIndex} data-set={setIndex} className="flex gap-2 px-1 shrink-0">
              {scrollingItems.map((item) => (
                <Pill key={`${setIndex}-${item.id}`} item={item} isActive={selected === item.id} onSelect={handleScrollingSelect} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TemplatesContent() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") || "all";
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState(initialType);
  const [search, setSearch] = useState("");
  const dispatch = useAppDispatch();
  const favSlugs = useAppSelector((s) => s.favorites.slugs);

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

  const clearFilters = () => { setSelectedType("all"); setSelectedCategory("all"); setSearch(""); };
  const hasActiveFilters = selectedType !== "all" || selectedCategory !== "all" || search;
  const readyTemplates = filtered.filter((t) => t.coverImage);
  const comingSoonTemplates = filtered.filter((t) => !t.coverImage);

  return (
    <div className="min-h-screen md:pt-20" style={{ background: "var(--app-bg)", color: "var(--app-text)", fontFamily: "'Inter', sans-serif" }}>

      {/* ── Sticky search bar ── */}
      <div className="sticky top-0 md:top-20 z-40 backdrop-blur-xl border-b" style={{ background: "var(--app-sticky)", borderColor: "var(--app-sticky-border)" }}>
        <div className="px-4 py-3 max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="relative max-w-xl mx-auto">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--app-text-faint)" }} />
            <input
              type="text" placeholder="Search templates..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="app-input w-full pl-11 pr-24 py-3 rounded-2xl text-sm transition-all"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {search && (
                <button onClick={() => setSearch("")} className="w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                  style={{ background: "var(--app-surface)", color: "var(--app-text-muted)" }}>
                  <X size={10} />
                </button>
              )}
              <div className="px-2.5 py-1 rounded-xl flex items-center gap-1.5"
                style={{ background: "var(--app-accent-a12)", border: "1px solid var(--app-accent-a25)" }}>
                <Sparkles size={11} style={{ color: "var(--app-accent)" }} />
                <span className="text-[11px] font-bold tabular-nums" style={{ color: "var(--app-accent)" }}>{filtered.length}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Filter rows ── */}
      <div className="pt-4 pb-2 space-y-2">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <InfiniteScrollPills items={allTypes} selected={selectedType} onSelect={setSelectedType} speed={20} direction="rtl" />
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.08 }}>
          <InfiniteScrollPills items={categories} selected={selectedCategory} onSelect={setSelectedCategory} speed={18} direction="ltr" />
        </motion.div>
      </div>

      {/* ── Clear filters ── */}
      {hasActiveFilters && (
        <div className="px-4 py-2 flex justify-center">
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={clearFilters}
            className="text-xs font-bold flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all"
            style={{ color: "var(--app-accent)", border: "1px solid var(--app-accent-a25)", background: "var(--app-accent-a08)" }}>
            <X size={10} /> Clear filters
          </motion.button>
        </div>
      )}

      {/* ── Template grid ── */}
      <div className="px-4 pb-12">

        {/* Ready templates */}
        {readyTemplates.length > 0 && (
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {readyTemplates.map((template, i) => {
                const isFav = favSlugs.includes(template.slug);
                return (
                  <motion.div key={template.slug} layout
                    initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.03, type: "spring", stiffness: 300, damping: 25 }}>
                    <Link href={`/${template.slug}`} className="block group">
                      <motion.div
                        className="relative aspect-[3/4] rounded-2xl md:rounded-3xl overflow-hidden transition-all duration-300"
                        style={{ border: "1px solid var(--app-border)" }}
                        whileHover={{ y: -6, scale: 1.02, boxShadow: "var(--app-hover-glow)" }}
                        whileTap={{ scale: 0.97 }}>
                        <div className="absolute inset-0" style={{ background: "var(--app-card-img-bg)" }} />
                        <div className="absolute inset-0">
                          <Image src={template.coverImage!} alt="" fill className="object-cover" sizes="(max-width:768px) 50vw, 25vw" />
                        </div>
                        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.82))" }} />
                        {/* accent bottom bar on hover */}
                        <div className="absolute inset-x-0 bottom-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          style={{ background: "linear-gradient(to right, var(--app-accent), transparent)" }} />

                        <div className="relative h-full p-4 md:p-5 flex flex-col justify-between z-10">
                          <div className="flex items-start justify-between">
                            <motion.div className="w-11 h-11 md:w-12 md:h-12 rounded-2xl flex items-center justify-center"
                              style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.18)" }}
                              whileHover={{ rotate: [0, -8, 8, 0], scale: 1.1 }} transition={{ duration: 0.5 }}>
                              <span className="text-xl md:text-2xl">{template.emoji}</span>
                            </motion.div>
                            <FavoriteButton isFavorited={isFav} onClick={(e) => handleFavorite(e, template.slug)} />
                          </div>
                          <div>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider mb-2"
                              style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", backdropFilter: "blur(4px)" }}>
                              {template.type}
                            </span>
                            <h3 className="font-bold text-sm md:text-[15px] leading-tight mb-1 text-white">{template.title}</h3>
                            <p className="text-[11px] md:text-xs leading-relaxed line-clamp-2" style={{ color: "rgba(255,255,255,0.5)" }}>{template.description}</p>
                            <div className="mt-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--app-accent)" }}>Open</span>
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ color: "var(--app-accent)" }}>
                                <path d="M2.5 6H9.5M9.5 6L6.5 3M9.5 6L6.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}

        {/* Coming Soon */}
        {comingSoonTemplates.length > 0 && (
          <>
            <div className="mt-10 mb-5 flex items-center gap-3">
              <div className="h-px flex-1" style={{ background: "var(--app-accent-a12)" }} />
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] flex items-center gap-2" style={{ color: "var(--app-accent)" }}>
                🚀 Coming Soon
              </span>
              <div className="h-px flex-1" style={{ background: "var(--app-accent-a12)" }} />
            </div>
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
                              <Image src={comingSoonImg} alt="" fill className="object-cover opacity-65" sizes="(max-width:768px) 50vw, 25vw" />
                            </div>
                          )}
                          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.45), rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.85))" }} />
                          <div className="relative h-full p-4 md:p-5 flex flex-col justify-between z-10">
                            <div className="w-11 h-11 md:w-12 md:h-12 rounded-2xl flex items-center justify-center"
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
