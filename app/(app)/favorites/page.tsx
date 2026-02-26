"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Bookmark } from "lucide-react";
import TemplateCard from "@/components/TemplateCard";
import Link from "next/link";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchFavorites, toggleFavoriteAsync } from "@/store/favoritesSlice";
import { templateList } from "@/data/template-registry";

export default function FavoritesPage() {
  const dispatch = useAppDispatch();
  const favSlugs = useAppSelector((s) => s.favorites.slugs);
  const loading = useAppSelector((s) => s.favorites.loading);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchFavorites());
  }, [dispatch, isAuthenticated]);

  const favorited = templateList.filter((t) => favSlugs.includes(t.slug));

  const handleRemove = useCallback((e: React.MouseEvent, slug: string) => {
    e.preventDefault(); e.stopPropagation();
    dispatch(toggleFavoriteAsync(slug));
  }, [dispatch]);

  /* ── Not authenticated ── */
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen md:pt-[88px]" style={{ background: "var(--app-bg)", color: "var(--app-text)", fontFamily: "'Inter', sans-serif" }}>
        <div className="px-5 pt-10 pb-6 max-w-lg mx-auto">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold mb-3" style={{ color: "var(--app-accent)" }}>Saved</p>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Your <span style={{ color: "var(--app-accent)" }}>Favorites</span>
            </h1>
          </motion.div>
        </div>

        <div className="flex items-center justify-center px-4 mt-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-sm">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6" style={{ background: "var(--app-accent-a06)", border: "1px solid var(--app-accent-a20)" }}>
              <Heart size={32} style={{ color: "var(--app-accent)" }} />
            </div>
            <h2 className="text-2xl font-black mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Sign in to see favorites</h2>
            <p className="text-sm mb-8" style={{ color: "var(--app-text-muted)" }}>Log in to save and view your favorite templates across all devices.</p>
            <Link href="/templates" className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all hover:scale-105"
              style={{ background: "var(--app-accent)", color: "var(--app-accent-fg)" }}>
              Browse Templates →
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen md:pt-[88px] flex items-center justify-center" style={{ background: "var(--app-bg)" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "var(--app-accent)", borderTopColor: "transparent" }} />
          <p className="text-sm" style={{ color: "var(--app-text-faint)" }}>Loading favorites...</p>
        </div>
      </div>
    );
  }

  /* ── Empty ── */
  if (favorited.length === 0) {
    return (
      <div className="min-h-screen md:pt-[88px]" style={{ background: "var(--app-bg)", color: "var(--app-text)", fontFamily: "'Inter', sans-serif" }}>
        <div className="px-5 pt-10 pb-6 max-w-lg mx-auto">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold mb-3" style={{ color: "var(--app-accent)" }}>Saved</p>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Your <span style={{ color: "var(--app-accent)" }}>Favorites</span>
            </h1>
          </motion.div>
        </div>
        <div className="flex items-center justify-center px-4 mt-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-sm">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6" style={{ background: "var(--app-accent-a06)", border: "1px solid var(--app-accent-a20)" }}>
              <Bookmark size={32} style={{ color: "var(--app-accent)" }} />
            </div>
            <h2 className="text-2xl font-black mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>No favorites yet</h2>
            <p className="text-sm mb-8" style={{ color: "var(--app-text-muted)" }}>Browse templates and tap the heart to save your favorites here.</p>
            <Link href="/templates" className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all hover:scale-105"
              style={{ background: "var(--app-accent)", color: "var(--app-accent-fg)" }}>
              Browse Templates →
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ── Favorites grid ── */
  return (
    <div className="min-h-screen md:pt-[88px]" style={{ background: "var(--app-bg)", color: "var(--app-text)", fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <div className="px-5 pt-10 pb-6 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold mb-3" style={{ color: "var(--app-accent)" }}>Saved</p>
          <div className="flex items-end justify-between gap-4">
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Your <span style={{ color: "var(--app-accent)" }}>Favorites</span>
            </h1>
            <div className="shrink-0 px-3 py-1.5 rounded-full text-sm font-bold mb-1" style={{ background: "var(--app-accent-a10)", border: "1px solid var(--app-accent-a25)", color: "var(--app-accent)" }}>
              {favorited.length} saved
            </div>
          </div>
          <p className="text-sm mt-3" style={{ color: "var(--app-text-faint)" }}>
            Templates you&apos;ve saved for quick access
          </p>
        </motion.div>
      </div>

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
    </div>
  );
}
