"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Article } from "@/lib/strapi";
import BlogCard from "./BlogCard";

/**
 * Infinite-scroll blog grid with virtualized painting.
 *
 * - The first page is server-rendered (passed in as `initialArticles`) for an
 *   instant first paint + SEO; subsequent pages are fetched from
 *   /api/blog/articles as the user scrolls (IntersectionObserver sentinel).
 * - Each card is wrapped in `.cv-card` (content-visibility: auto), so offscreen
 *   cards skip layout + paint entirely — native windowing that keeps scrolling
 *   smooth even with hundreds of cards in the DOM, with no windowing library.
 */
export default function InfiniteBlogGrid({
  initialArticles,
  initialPageCount,
  category,
  pageSize = 12,
  featuredFirst = false,
}: {
  initialArticles: Article[];
  initialPageCount: number;
  category?: string;
  pageSize?: number;
  /** Render the very first card as a full-width featured card (main /blog page). */
  featuredFirst?: boolean;
}) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(initialPageCount);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false); // guards against overlapping fetches

  const hasMore = page < pageCount;

  const loadMore = useCallback(async () => {
    if (busyRef.current || page >= pageCount) return;
    busyRef.current = true;
    setLoading(true);
    setError(false);
    try {
      const next = page + 1;
      const qs = new URLSearchParams({ page: String(next), pageSize: String(pageSize) });
      if (category) qs.set("category", category);
      const res = await fetch(`/api/blog/articles?${qs.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { articles: Article[]; pageCount: number };
      setArticles((prev) => {
        const seen = new Set(prev.map((a) => a.id));
        return [...prev, ...data.articles.filter((a) => !seen.has(a.id))];
      });
      setPage(next);
      if (typeof data.pageCount === "number") setPageCount(data.pageCount);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      busyRef.current = false;
    }
  }, [page, pageCount, pageSize, category]);

  // Prefetch the next page when the sentinel nears the viewport (600px ahead),
  // so new cards are in place before the user reaches the bottom.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore, hasMore]);

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a, i) => {
          const isFeatured = featuredFirst && i === 0;
          return (
            <div
              key={a.id}
              className="cv-card"
              // Featured card is taller/wider; give it a bigger intrinsic size
              // so the scrollbar doesn't jump when it paints.
              style={{ containIntrinsicSize: isFeatured ? "auto 560px" : "auto 420px", gridColumn: isFeatured ? "1 / -1" : undefined }}
            >
              <BlogCard article={a} featured={isFeatured} />
            </div>
          );
        })}
      </div>

      {/* Sentinel + load states */}
      <div ref={sentinelRef} className="mt-10 flex min-h-[1px] items-center justify-center">
        {loading && (
          <span
            className="inline-block h-7 w-7 animate-spin rounded-full border-2 border-current border-t-transparent"
            style={{ color: "#c9a84c" }}
            aria-label="Loading more articles"
          />
        )}
        {error && hasMore && !loading && (
          <button
            type="button"
            onClick={loadMore}
            className="rounded-full px-5 py-2 text-sm font-bold"
            style={{ background: "#3d0c11", color: "#f5ede6" }}
          >
            Couldn’t load — tap to retry
          </button>
        )}
        {!hasMore && articles.length > pageSize && (
          <p className="text-sm" style={{ color: "rgba(42,10,14,0.5)" }}>
            You’ve reached the end ✦
          </p>
        )}
      </div>
    </>
  );
}
