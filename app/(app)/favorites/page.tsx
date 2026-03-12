"use client";

import { useEffect, useCallback, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Bookmark } from "lucide-react";
import TemplateCard from "@/components/TemplateCard";
import Link from "next/link";
import LuxuryMobileTopBrand from "@/components/LuxuryMobileTopBrand";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchFavorites, toggleFavoriteAsync } from "@/store/favoritesSlice";
import { templateList } from "@/data/template-registry";

const UI = {
  bg: "#f5ede6",
  bgSoft: "#fbf6f1",
  text: "#2a0a0e",
  textMuted: "#7a5555",
  accent: "#c9a84c",
  border: "rgba(61,12,17,0.16)",
};
const CORNER_FILTER =
  "brightness(0) saturate(100%) invert(8%) sepia(55%) saturate(2800%) hue-rotate(330deg) brightness(90%) contrast(120%)";

function FavoritesShell({ children }: { children: ReactNode }) {
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

  return (
    <div
      className="min-h-screen md:pt-[88px]"
      style={{
        background: `linear-gradient(180deg, ${UI.bgSoft} 0%, ${UI.bg} 52%, ${UI.bgSoft} 100%)`,
        backgroundColor: UI.bg,
        color: UI.text,
        fontFamily: "'Inter', sans-serif",
        minHeight: "100dvh",
        overflowX: "hidden",
      }}
    >
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/indianFestival/alekhancorner2.svg" alt="" aria-hidden="true" style={{ position: "fixed", top: 0, left: 0, width: "clamp(112px, 30vw, 180px)", height: "clamp(112px, 30vw, 180px)", opacity: 0.62, transform: "scaleY(-1)", filter: CORNER_FILTER }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/indianFestival/alekhancorner2.svg" alt="" aria-hidden="true" style={{ position: "fixed", top: 0, right: 0, width: "clamp(112px, 30vw, 180px)", height: "clamp(112px, 30vw, 180px)", opacity: 0.62, transform: "scale(-1,-1)", filter: CORNER_FILTER }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/indianFestival/alekhancorner2.svg" alt="" aria-hidden="true" style={{ position: "fixed", bottom: 0, left: 0, width: "clamp(86px, 24vw, 170px)", height: "clamp(86px, 24vw, 170px)", opacity: 0.54, filter: CORNER_FILTER }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/indianFestival/alekhancorner2.svg" alt="" aria-hidden="true" style={{ position: "fixed", bottom: 0, right: 0, width: "clamp(86px, 24vw, 170px)", height: "clamp(86px, 24vw, 170px)", opacity: 0.54, transform: "scaleX(-1)", filter: CORNER_FILTER }} />
      </div>
      <LuxuryMobileTopBrand />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}

function FavoritesHero({ count }: { count?: number }) {
  return (
    <motion.div className="mb-8 md:mb-10 text-center px-5 pt-8" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 260, damping: 24 }}>
      <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.3em] mb-3" style={{ color: UI.accent }}>
        Saved
      </p>
      <h1 className="leading-[0.96] tracking-[-0.03em] text-[40px] md:text-[68px] lg:text-[84px]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, color: UI.text }}>
        Your <em style={{ color: UI.accent, fontStyle: "italic" }}>Favorites.</em>
      </h1>
      <div className="flex items-center justify-center gap-4 mt-4">
        <div style={{ width: 80, height: 1, background: "linear-gradient(to right,transparent,rgba(201,168,76,0.6))" }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/indianFestival/akehan3.svg" aria-hidden="true" alt="" style={{ width: 20, height: 20, opacity: 0.45, filter: "brightness(0) saturate(100%) invert(67%) sepia(23%) saturate(859%) hue-rotate(8deg) brightness(95%) contrast(92%)" }} />
        <div style={{ width: 80, height: 1, background: "linear-gradient(to left,transparent,rgba(201,168,76,0.6))" }} />
      </div>
      {typeof count === "number" && (
        <p className="text-sm mt-3" style={{ color: UI.textMuted }}>
          {count} template{count === 1 ? "" : "s"} saved for quick access
        </p>
      )}
    </motion.div>
  );
}

export default function FavoritesPage() {
  const dispatch = useAppDispatch();
  const favSlugs = useAppSelector((s) => s.favorites.slugs);
  const loading = useAppSelector((s) => s.favorites.loading);
  const fetched = useAppSelector((s) => s.favorites.fetched);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  useEffect(() => {
    // Avoid repeated fetch churn on every mount when data is already hydrated.
    if (isAuthenticated && !fetched && !loading) dispatch(fetchFavorites());
  }, [dispatch, isAuthenticated, fetched, loading]);

  const favorited = templateList.filter((t) => favSlugs.includes(t.slug));

  const handleRemove = useCallback((e: React.MouseEvent, slug: string) => {
    e.preventDefault(); e.stopPropagation();
    dispatch(toggleFavoriteAsync(slug));
  }, [dispatch]);

  /* ── Not authenticated ── */
  if (!isAuthenticated) {
    return (
      <FavoritesShell>
        <FavoritesHero />

        <div className="flex items-center justify-center px-4 mt-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-sm">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)" }}>
              <Heart size={32} style={{ color: "#c9a84c" }} />
            </div>
            <h2 className="text-2xl font-black mb-2" style={{ fontFamily: "'Playfair Display', serif", color: "#2a0a0e" }}>Sign in to see favorites</h2>
            <p className="text-sm mb-8" style={{ color: "#2a0a0e", opacity: 0.6 }}>Log in to save and view your favorite templates across all devices.</p>
            <Link href="/templates" className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all hover:scale-105"
              style={{ background: "#3d0c11", color: "#f5ede6" }}>
              Browse Templates →
            </Link>
          </motion.div>
        </div>
      </FavoritesShell>
    );
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <FavoritesShell>
        <div className="flex items-center justify-center min-h-[55vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "#c9a84c", borderTopColor: "transparent" }} />
            <p className="text-sm" style={{ color: "#2a0a0e" }}>Loading favorites...</p>
          </div>
        </div>
      </FavoritesShell>
    );
  }

  /* ── Empty ── */
  if (favorited.length === 0) {
    return (
      <FavoritesShell>
        <FavoritesHero />
        <div className="flex items-center justify-center px-4 mt-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-sm">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)" }}>
              <Bookmark size={32} style={{ color: "#c9a84c" }} />
            </div>
            <h2 className="text-2xl font-black mb-2" style={{ fontFamily: "'Playfair Display', serif", color: "#2a0a0e" }}>No favorites yet</h2>
            <p className="text-sm mb-8" style={{ color: "#2a0a0e", opacity: 0.6 }}>Browse templates and tap the heart to save your favorites here.</p>
            <Link href="/templates" className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all hover:scale-105"
              style={{ background: "#3d0c11", color: "#f5ede6" }}>
              Browse Templates →
            </Link>
          </motion.div>
        </div>
      </FavoritesShell>
    );
  }

  /* ── Favorites grid ── */
  return (
    <FavoritesShell>
      <FavoritesHero count={favorited.length} />

      {/* Grid */}
      <div className="px-4 pb-12 max-w-5xl mx-auto">
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {favorited.map((template, i) => (
              <TemplateCard
                key={template.slug}
                template={template}
                isFav={true}
                index={i}
                onFavorite={handleRemove}
              />
            ))}
          </div>
        </AnimatePresence>
      </div>
    </FavoritesShell>
  );
}
