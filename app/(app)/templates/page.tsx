"use client";

import { useState, useRef, useEffect, Suspense, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  templateList,
  categories,
  templateTypes,
} from "@/data/template-registry";
import { Search, X, Sparkles } from "lucide-react";
import FavoriteButton from "@/components/FavoriteButton";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { toggleFavoriteAsync } from "@/store/favoritesSlice";

const gradientColorMap: Record<
  string,
  { light: string; dark: string; accent: string }
> = {
  birthday: {
    light: "from-rose-100/80 via-pink-50/60 to-amber-50/40",
    dark: "from-rose-500/15 via-pink-500/10 to-amber-500/5",
    accent: "bg-rose-500",
  },
  valentine: {
    light: "from-red-100/80 via-pink-50/60 to-rose-50/40",
    dark: "from-red-500/15 via-pink-500/10 to-rose-500/5",
    accent: "bg-red-500",
  },
  sorry: {
    light: "from-blue-100/80 via-cyan-50/60 to-indigo-50/40",
    dark: "from-blue-500/15 via-cyan-500/10 to-indigo-500/5",
    accent: "bg-blue-500",
  },
  missyou: {
    light: "from-violet-100/80 via-purple-50/60 to-indigo-50/40",
    dark: "from-violet-500/15 via-purple-500/10 to-indigo-500/5",
    accent: "bg-violet-500",
  },
  anniversary: {
    light: "from-amber-100/80 via-orange-50/60 to-yellow-50/40",
    dark: "from-amber-500/15 via-orange-500/10 to-yellow-500/5",
    accent: "bg-amber-500",
  },
};

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

const allTypes = [
  { id: "all", label: "All Types", emoji: "✨" },
  ...templateTypes,
];

function Pill({
  item,
  isActive,
  layoutId,
  onSelect,
}: {
  item: { id: string; label: string; emoji: string };
  isActive: boolean;
  layoutId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      onClick={() => onSelect(item.id)}
      className="relative shrink-0 select-none group/pill"
    >
      <div className="absolute inset-0 rounded-full p-[1.5px] bg-gradient-to-r from-primary/30 via-accent/25 to-sky/30 dark:from-primary/40 dark:via-accent/35 dark:to-sky/40">
        <div className="w-full h-full rounded-full bg-background dark:bg-card" />
      </div>
      {isActive && (
        <motion.div
          layoutId={layoutId}
          className="absolute inset-0 rounded-full p-[1.5px] bg-gradient-to-r from-primary via-accent to-sky"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          <div className="w-full h-full rounded-full bg-background dark:bg-card" />
        </motion.div>
      )}
      <div
        className={`relative z-10 whitespace-nowrap px-5 py-2 rounded-full text-[13px] font-semibold flex items-center gap-1.5 transition-colors duration-200 ${
          isActive
            ? "text-foreground"
            : "text-muted-foreground group-hover/pill:text-foreground"
        }`}
      >
        <span className="text-sm leading-none">{item.emoji}</span>
        <span>{item.label}</span>
      </div>
    </button>
  );
}

function InfiniteScrollPills({
  items,
  selected,
  onSelect,
  layoutId,
  speed = 25,
  direction = "rtl",
}: {
  items: { id: string; label: string; emoji: string }[];
  selected: string;
  onSelect: (id: string) => void;
  layoutId: string;
  speed?: number;
  direction?: "rtl" | "ltr";
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

      if (
        !pausedRef.current &&
        !isDraggingRef.current &&
        setWidthRef.current > 0
      ) {
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
    resumeTimerRef.current = setTimeout(() => {
      pausedRef.current = false;
    }, 2000);
  }, []);

  useEffect(
    () => () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    },
    []
  );

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    pausedRef.current = true;
    dragStartXRef.current = e.clientX;
    dragOffsetStartRef.current = offsetRef.current;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - dragStartXRef.current;
      if (Math.abs(dx) > 3) hasDraggedRef.current = true;
      offsetRef.current = wrapOffset(dragOffsetStartRef.current + dx);
    },
    [wrapOffset]
  );

  const onPointerUp = useCallback(() => {
    isDraggingRef.current = false;
    scheduleResume();
  }, [scheduleResume]);

  const handleScrollingSelect = useCallback(
    (id: string) => {
      if (hasDraggedRef.current) return;
      onSelect(id);
      pausedRef.current = true;
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      scheduleResume();
    },
    [onSelect, scheduleResume]
  );

  const handleFixedSelect = useCallback(() => {
    onSelect(fixedItem.id);
  }, [onSelect, fixedItem.id]);

  const onHoverStart = useCallback(() => {
    pausedRef.current = true;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
  }, []);

  const onHoverEnd = useCallback(() => {
    if (!isDraggingRef.current) scheduleResume();
  }, [scheduleResume]);

  const isFixedActive = selected === fixedItem.id;

  return (
    <div className="flex items-center">
      {/* Fixed "All" pill */}
      <div className="relative z-20 shrink-0 pl-4 pr-1">
        <Pill
          item={fixedItem}
          isActive={isFixedActive}
          layoutId={layoutId}
          onSelect={handleFixedSelect}
        />
      </div>

      {/* Scrolling pills */}
      <div
        className="relative overflow-hidden flex-1 cursor-grab active:cursor-grabbing touch-pan-y"
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-background via-background/80 to-transparent z-10 pointer-events-none" />

        <div
          ref={trackRef}
          className="flex will-change-transform py-0.5"
          style={{ width: "max-content" }}
        >
          {[0, 1, 2].map((setIndex) => (
            <div
              key={setIndex}
              data-set={setIndex}
              className="flex gap-2 px-1 shrink-0"
            >
              {scrollingItems.map((item) => (
                <Pill
                  key={`${setIndex}-${item.id}`}
                  item={item}
                  isActive={selected === item.id}
                  layoutId={layoutId}
                  onSelect={handleScrollingSelect}
                />
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

  const handleFavorite = useCallback(
    (e: React.MouseEvent, slug: string) => {
      e.preventDefault();
      e.stopPropagation();
      dispatch(toggleFavoriteAsync(slug));
    },
    [dispatch]
  );

  const filtered = templateList.filter((t) => {
    const matchCategory =
      selectedCategory === "all" || t.category === selectedCategory;
    const matchType = selectedType === "all" || t.type === selectedType;
    const matchSearch =
      !search || t.title.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchType && matchSearch;
  });

  const clearFilters = () => {
    setSelectedType("all");
    setSelectedCategory("all");
    setSearch("");
  };

  const hasActiveFilters =
    selectedType !== "all" || selectedCategory !== "all" || search;

  return (
    <div className="min-h-screen">
      {/* Fixed top bar: search */}
      <div className="sticky top-0 left-0 right-0 z-40 bg-background/80 dark:bg-background/90 backdrop-blur-xl border-b border-border/20 dark:border-white/[0.04]">
        <div className="container px-4 py-3">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="relative max-w-xl mx-auto"
          >
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50"
            />
            <input
              type="text"
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-24 py-3 rounded-2xl bg-muted/40 dark:bg-muted/25 border border-border/30 dark:border-white/[0.06] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/50 transition-all"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="w-6 h-6 rounded-full bg-muted-foreground/15 flex items-center justify-center hover:bg-muted-foreground/25 transition-colors"
                >
                  <X size={10} />
                </button>
              )}
              <div className="px-2.5 py-1 rounded-xl gradient-hero flex items-center gap-1 shadow-sm">
                <Sparkles size={11} className="text-white" />
                <span className="text-[11px] text-white font-bold tabular-nums">
                  {filtered.length}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Filter Rows */}
      <div className="pt-4 pb-2 space-y-2.5">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <InfiniteScrollPills
            items={allTypes}
            selected={selectedType}
            onSelect={setSelectedType}
            layoutId="type-pill"
            speed={20}
            direction="rtl"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
        >
          <InfiniteScrollPills
            items={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
            layoutId="category-pill"
            speed={18}
            direction="ltr"
          />
        </motion.div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="px-4 pb-2 pt-1">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex items-center justify-center"
            >
              <button
                onClick={clearFilters}
                className="text-xs text-primary font-bold hover:underline underline-offset-2 flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/5 dark:bg-primary/10 border border-primary/15 transition-colors"
              >
                <X size={11} />
                Clear filters
              </button>
            </motion.div>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="px-4 pb-8">
        <div className="container">
          {(() => {
            const readyTemplates = filtered.filter((t) => t.coverImage);
            const comingSoonTemplates = filtered.filter((t) => !t.coverImage);

            return (
              <>
                {readyTemplates.length > 0 && (
                  <AnimatePresence mode="popLayout">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
                      {readyTemplates.map((template, i) => {
                        const isFav = favSlugs.includes(template.slug);

                        return (
                          <motion.div
                            key={template.slug}
                            layout
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{
                              delay: i * 0.03,
                              type: "spring",
                              stiffness: 300,
                              damping: 25,
                            }}
                          >
                            <Link href={`/${template.slug}`} className="block group">
                              <motion.div
                                className="relative aspect-[3/4] rounded-2xl md:rounded-3xl overflow-hidden border border-border/50 dark:border-white/[0.06] transition-all duration-300"
                                whileHover={{ y: -6, scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                              >
                                <div className="absolute inset-0 bg-card" />
                                <div className="absolute inset-0">
                                  <Image
                                    src={template.coverImage!}
                                    alt=""
                                    fill
                                    className="object-cover"
                                    sizes="(max-width:768px) 50vw, 25vw"
                                  />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/70" />

                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-primary/5 via-transparent to-transparent dark:from-primary/10" />

                                <div className="relative h-full p-4 md:p-5 flex flex-col justify-between z-10">
                                  <div className="flex items-start justify-between">
                                    <motion.div
                                      className="w-12 h-12 md:w-14 md:h-14 rounded-2xl backdrop-blur-sm flex items-center justify-center shadow-sm bg-black/30 border border-white/20"
                                      whileHover={{ rotate: [0, -8, 8, 0], scale: 1.1 }}
                                      transition={{ duration: 0.5 }}
                                    >
                                      <span className="text-2xl md:text-3xl">{template.emoji}</span>
                                    </motion.div>
                                    <FavoriteButton
                                      isFavorited={isFav}
                                      onClick={(e) => handleFavorite(e, template.slug)}
                                    />
                                  </div>

                                  <div>
                                    <div className="mb-2">
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/15 text-white/80 backdrop-blur-sm">
                                        {template.type}
                                      </span>
                                    </div>
                                    <h3 className="font-bold text-sm md:text-[15px] leading-tight mb-1.5 text-white drop-shadow-md">
                                      {template.title}
                                    </h3>
                                    <p className="text-[11px] md:text-xs leading-relaxed line-clamp-2 text-white/70">
                                      {template.description}
                                    </p>
                                    <div className="mt-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-white">
                                        Open
                                      </span>
                                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-white">
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

                {comingSoonTemplates.length > 0 && (
                  <>
                    <div className="mt-10 mb-5 flex items-center gap-3">
                      <div className="h-px flex-1 bg-border/40 dark:bg-white/[0.06]" />
                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1.5">
                        <span className="text-sm">🚀</span> Coming Soon
                      </span>
                      <div className="h-px flex-1 bg-border/40 dark:bg-white/[0.06]" />
                    </div>

                    <AnimatePresence mode="popLayout">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
                        {comingSoonTemplates.map((template, i) => {
                          const comingSoonImg = COMING_SOON_IMAGES[template.slug];

                          return (
                            <motion.div
                              key={template.slug}
                              layout
                              initial={{ opacity: 0, y: 20, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              transition={{
                                delay: i * 0.03,
                                type: "spring",
                                stiffness: 300,
                                damping: 25,
                              }}
                            >
                              <div className="block relative">
                                <motion.div
                                  className="relative aspect-[3/4] rounded-2xl md:rounded-3xl overflow-hidden border border-white/[0.06] transition-all duration-300"
                                >
                                  <div className="absolute inset-0 bg-black" />
                                  {comingSoonImg && (
                                    <div className="absolute inset-0">
                                      <Image
                                        src={comingSoonImg}
                                        alt=""
                                        fill
                                        className="object-cover"
                                        sizes="(max-width:768px) 50vw, 25vw"
                                      />
                                    </div>
                                  )}
                                  <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/75" />

                                  <div className="relative h-full p-4 md:p-5 flex flex-col justify-between z-10">
                                    <div className="flex items-start">
                                      <div
                                        className="w-12 h-12 md:w-14 md:h-14 rounded-2xl backdrop-blur-sm flex items-center justify-center shadow-sm bg-black/30 border border-white/15"
                                      >
                                        <span className="text-2xl md:text-3xl">{template.emoji}</span>
                                      </div>
                                    </div>

                                    <div>
                                      <div className="mb-2">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white/70 backdrop-blur-sm">
                                          {template.type}
                                        </span>
                                      </div>
                                      <h3 className="font-bold text-sm md:text-[15px] leading-tight mb-1.5 text-white drop-shadow-md">
                                        {template.title}
                                      </h3>
                                      <p className="text-[11px] md:text-xs leading-relaxed line-clamp-2 text-white/60">
                                        {template.description}
                                      </p>
                                    </div>
                                  </div>
                                </motion.div>

                                <div className="absolute inset-0 rounded-2xl md:rounded-3xl flex items-center justify-center z-20 pointer-events-none">
                                  <div
                                    className="px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest"
                                    style={{
                                      background: "rgba(0,0,0,0.6)",
                                      backdropFilter: "blur(10px)",
                                      WebkitBackdropFilter: "blur(10px)",
                                      color: "rgba(255,255,255,0.9)",
                                      border: "1px solid rgba(255,255,255,0.15)",
                                      boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
                                    }}
                                  >
                                    Coming Soon
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </AnimatePresence>
                  </>
                )}

                {filtered.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-20"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                      <Search size={24} className="text-muted-foreground" />
                    </div>
                    <p className="text-foreground font-semibold mb-1">
                      No templates found
                    </p>
                    <p className="text-muted-foreground text-sm mb-4">
                      Try adjusting your filters or search term
                    </p>
                    <button
                      onClick={clearFilters}
                      className="text-sm font-semibold text-primary hover:underline underline-offset-2"
                    >
                      Clear all filters
                    </button>
                  </motion.div>
                )}
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-muted-foreground text-sm">
              Loading templates...
            </p>
          </div>
        </div>
      }
    >
      <TemplatesContent />
    </Suspense>
  );
}
