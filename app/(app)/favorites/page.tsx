"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Loader2 } from "lucide-react";
import FavoriteButton from "@/components/FavoriteButton";
import Link from "next/link";
import Image from "next/image";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchFavorites, toggleFavoriteAsync } from "@/store/favoritesSlice";
import { templateList } from "@/data/template-registry";

const gradientColorMap: Record<string, { light: string; dark: string; accent: string }> = {
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

export default function FavoritesPage() {
  const dispatch = useAppDispatch();
  const favSlugs = useAppSelector((s) => s.favorites.slugs);
  const loading = useAppSelector((s) => s.favorites.loading);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchFavorites());
    }
  }, [dispatch, isAuthenticated]);

  const favorited = templateList.filter((t) => favSlugs.includes(t.slug));

  const handleRemove = useCallback(
    (e: React.MouseEvent, slug: string) => {
      e.preventDefault();
      e.stopPropagation();
      dispatch(toggleFavoriteAsync(slug));
    },
    [dispatch]
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <div className="px-4 pt-6 pb-4 md:pt-10">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="text-xs uppercase tracking-[0.2em] text-primary font-bold">
                Saved
              </span>
              <h1 className="text-2xl md:text-4xl font-extrabold mt-1 mb-2">
                Your <span className="text-gradient">Favorites</span>
              </h1>
            </motion.div>
          </div>
        </div>
        <div className="flex items-center justify-center px-4 mt-16 md:mt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 rounded-3xl bg-primary/10 dark:bg-primary/15 flex items-center justify-center mx-auto mb-6">
              <Heart size={32} className="text-primary" />
            </div>
            <h2 className="text-2xl font-extrabold mb-2">Sign in to see favorites</h2>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Log in to save and view your favorite templates across devices.
            </p>
            <Link
              href="/templates"
              className="inline-flex gradient-hero text-primary-foreground px-6 py-3 rounded-xl font-semibold shadow-soft"
            >
              Browse Templates
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="px-4 pt-6 pb-4 md:pt-10">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-xs uppercase tracking-[0.2em] text-primary font-bold">
              Saved
            </span>
            <h1 className="text-2xl md:text-4xl font-extrabold mt-1 mb-2">
              Your <span className="text-gradient">Favorites</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              {loading
                ? "Loading your favorites..."
                : favorited.length > 0
                ? `${favorited.length} template${favorited.length > 1 ? "s" : ""} saved`
                : "Templates you\u2019ve saved for quick access"}
            </p>
          </motion.div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center mt-16">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-muted-foreground text-sm">Loading favorites...</p>
          </div>
        </div>
      ) : favorited.length > 0 ? (
        <div className="px-4 pb-8">
          <div className="container">
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
                {favorited.map((template, i) => {
                  const colors = gradientColorMap[template.type] || gradientColorMap.birthday;

                  return (
                    <motion.div
                      key={template.slug}
                      layout
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: i * 0.04, type: "spring", stiffness: 300, damping: 25 }}
                    >
                      <Link href={`/${template.slug}`} className="block group">
                        <motion.div
                          className="relative aspect-[3/4] rounded-2xl md:rounded-3xl overflow-hidden border border-border/50 dark:border-white/[0.06] transition-all duration-300"
                          whileHover={{ y: -6, scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="absolute inset-0 bg-card" />

                          {template.coverImage ? (
                            <>
                              <div className="absolute inset-0">
                                <Image
                                  src={template.coverImage}
                                  alt=""
                                  fill
                                  className="object-cover"
                                  sizes="(max-width:768px) 50vw, 25vw"
                                />
                              </div>
                              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/70" />
                            </>
                          ) : (
                            <>
                              <div className={`absolute inset-0 bg-gradient-to-br ${colors.light} dark:hidden`} />
                              <div className={`absolute inset-0 bg-gradient-to-br ${colors.dark} hidden dark:block`} />
                            </>
                          )}

                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-primary/5 via-transparent to-transparent dark:from-primary/10" />
                          <div className={`absolute top-0 left-0 right-0 h-[2px] ${colors.accent} opacity-0 group-hover:opacity-60 transition-opacity duration-300`} />

                          <div className="relative h-full p-4 md:p-5 flex flex-col justify-between z-10">
                            <div className="flex items-start justify-between">
                              <motion.div
                                className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl backdrop-blur-sm flex items-center justify-center shadow-sm ${
                                  template.coverImage
                                    ? "bg-black/30 border border-white/20"
                                    : "bg-white/60 dark:bg-white/[0.08] border border-white/40 dark:border-white/[0.06]"
                                }`}
                                whileHover={{ rotate: [0, -8, 8, 0], scale: 1.1 }}
                                transition={{ duration: 0.5 }}
                              >
                                <span className="text-2xl md:text-3xl">
                                  {template.emoji}
                                </span>
                              </motion.div>
                              <FavoriteButton
                                isFavorited={true}
                                onClick={(e) => handleRemove(e, template.slug)}
                              />
                            </div>

                            <div>
                              <div className="mb-2">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                    template.coverImage
                                      ? "bg-white/15 text-white/80 backdrop-blur-sm"
                                      : "bg-foreground/[0.06] dark:bg-white/[0.08] text-muted-foreground"
                                  }`}
                                >
                                  {template.type}
                                </span>
                              </div>
                              <h3
                                className={`font-bold text-sm md:text-[15px] leading-tight mb-1.5 transition-colors duration-300 ${
                                  template.coverImage
                                    ? "text-white drop-shadow-md"
                                    : "text-foreground group-hover:text-primary"
                                }`}
                              >
                                {template.title}
                              </h3>
                              <p
                                className={`text-[11px] md:text-xs leading-relaxed line-clamp-2 ${
                                  template.coverImage
                                    ? "text-white/70"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {template.description}
                              </p>
                              <div className="mt-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                                <span
                                  className={`text-[10px] font-bold uppercase tracking-wider ${
                                    template.coverImage ? "text-white" : "text-primary"
                                  }`}
                                >
                                  Open
                                </span>
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={template.coverImage ? "text-white" : "text-primary"}>
                                  <path d="M2.5 6H9.5M9.5 6L6.5 3M9.5 6L6.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </div>
                            </div>
                          </div>

                          {!template.coverImage && (
                            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-card/40 dark:from-card/60 to-transparent pointer-events-none" />
                          )}
                        </motion.div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center px-4 mt-16 md:mt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 rounded-3xl bg-primary/10 dark:bg-primary/15 flex items-center justify-center mx-auto mb-6">
              <Heart size={32} className="text-primary" />
            </div>
            <h2 className="text-2xl font-extrabold mb-2">No favorites yet</h2>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Browse templates and tap the heart to save your favorites here!
            </p>
            <Link
              href="/templates"
              className="inline-flex gradient-hero text-primary-foreground px-6 py-3 rounded-xl font-semibold shadow-soft"
            >
              Browse Templates
            </Link>
          </motion.div>
        </div>
      )}
    </div>
  );
}
