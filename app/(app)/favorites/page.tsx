"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Bookmark } from "lucide-react";
import FavoriteButton from "@/components/FavoriteButton";
import Link from "next/link";
import Image from "next/image";
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
    <div className="min-h-screen" style={{ background: "var(--app-bg)", color: "var(--app-text)", fontFamily: "'Inter', sans-serif" }}>

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
              <motion.div key={template.slug} layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.04, type: "spring", stiffness: 300, damping: 25 }}>
                <Link href={`/${template.slug}`} className="block group">
                  <motion.div
                    className="relative aspect-[3/4] rounded-2xl md:rounded-3xl overflow-hidden transition-all duration-300"
                    style={{ border: "1px solid var(--app-border)" }}
                    whileHover={{ y: -6, scale: 1.02, boxShadow: "var(--app-hover-glow)" }}
                    whileTap={{ scale: 0.98 }}>
                    <div className="absolute inset-0" style={{ background: "var(--app-card-img-bg)" }} />
                    {template.coverImage ? (
                      <>
                        <div className="absolute inset-0">
                          <Image src={template.coverImage} alt="" fill className="object-cover" sizes="(max-width:768px) 50vw, 25vw" />
                        </div>
                        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.82))" }} />
                      </>
                    ) : (
                      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, var(--app-accent-a08), rgba(0,0,0,0) 70%)" }} />
                    )}

                    {/* Accent bottom bar on hover */}
                    <div className="absolute inset-x-0 bottom-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(to right, var(--app-accent), transparent)" }} />

                    <div className="relative h-full p-4 md:p-5 flex flex-col justify-between z-10">
                      <div className="flex items-start justify-between">
                        <motion.div className="w-11 h-11 md:w-12 md:h-12 rounded-2xl flex items-center justify-center"
                          style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.18)" }}
                          whileHover={{ rotate: [0, -8, 8, 0], scale: 1.1 }} transition={{ duration: 0.5 }}>
                          <span className="text-xl md:text-2xl">{template.emoji}</span>
                        </motion.div>
                        <FavoriteButton isFavorited={true} onClick={(e) => handleRemove(e, template.slug)} />
                      </div>
                      <div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider mb-2"
                          style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.55)", backdropFilter: "blur(4px)" }}>
                          {template.type}
                        </span>
                        <h3 className="font-bold text-sm md:text-[15px] leading-tight mb-1 text-white">{template.title}</h3>
                        <p className="text-[11px] md:text-xs leading-relaxed line-clamp-2" style={{ color: "rgba(255,255,255,0.45)" }}>{template.description}</p>
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
            ))}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
}
