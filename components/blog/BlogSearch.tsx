"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import type { Article } from "@/lib/strapi";
import BlogCard from "./BlogCard";

/**
 * Blog search box + live results.
 *
 * Wraps the default (server-rendered) blog content as `children`. While the
 * search box is empty the children show through untouched; once the reader
 * types a query (≥2 chars, debounced) we fetch matches from
 * /api/blog/articles?q=… and render them in place of the default grid, so the
 * page instantly becomes "search that specific blog" without a full navigation.
 */
export default function BlogSearch({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [results, setResults] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const reqIdRef = useRef(0);

  const active = debounced.length >= 2;

  // Debounce the raw input so we don't hit the API on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const runSearch = useCallback(async (q: string) => {
    const reqId = ++reqIdRef.current;
    setLoading(true);
    setError(false);
    try {
      const qs = new URLSearchParams({ q, pageSize: "24" });
      const res = await fetch(`/api/blog/articles?${qs.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { articles: Article[]; total: number };
      if (reqId !== reqIdRef.current) return; // a newer search superseded this one
      setResults(data.articles || []);
      setTotal(typeof data.total === "number" ? data.total : data.articles?.length || 0);
    } catch {
      if (reqId !== reqIdRef.current) return;
      setError(true);
      setResults([]);
      setTotal(0);
    } finally {
      if (reqId === reqIdRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (active) runSearch(debounced);
  }, [active, debounced, runSearch]);

  const clear = () => {
    setQuery("");
    setDebounced("");
    setResults([]);
    setTotal(0);
    setError(false);
    inputRef.current?.focus();
  };

  return (
    <>
      {/* Search box */}
      <div className="mx-auto mb-8 max-w-xl">
        <div
          className="flex items-center gap-3 rounded-full px-5 py-3 transition-shadow"
          style={{
            background: "rgba(255,255,255,0.85)",
            border: "1px solid rgba(61,12,17,0.14)",
            boxShadow: "0 4px 18px rgba(61,12,17,0.06)",
          }}
        >
          <Search size={18} style={{ color: "#c9a84c", flexShrink: 0 }} aria-hidden />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles, topics, festivals…"
            aria-label="Search the blog"
            className="w-full bg-transparent text-sm outline-none placeholder:opacity-60 md:text-base"
            style={{ color: "#2a0a0e" }}
          />
          {query && (
            <button
              type="button"
              onClick={clear}
              aria-label="Clear search"
              className="flex-shrink-0 rounded-full p-1 transition-colors"
              style={{ color: "rgba(42,10,14,0.55)" }}
            >
              <X size={18} />
            </button>
          )}
        </div>
        {active && !loading && (
          <p className="mt-3 text-center text-xs" style={{ color: "rgba(42,10,14,0.6)" }}>
            {error
              ? "Something went wrong — try again."
              : total > 0
                ? `${total} result${total === 1 ? "" : "s"} for “${debounced}”`
                : `No articles match “${debounced}”`}
          </p>
        )}
      </div>

      {/* Results replace the default content while searching */}
      {active ? (
        <div>
          {loading ? (
            <div className="flex justify-center py-20">
              <span
                className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent"
                style={{ color: "#c9a84c" }}
                aria-label="Searching"
              />
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((a) => (
                <BlogCard key={a.id} article={a} />
              ))}
            </div>
          ) : (
            !error && (
              <div
                className="rounded-2xl py-20 text-center"
                style={{ background: "rgba(255,255,255,0.6)", border: "1px dashed rgba(61,12,17,0.2)" }}
              >
                <p className="text-lg" style={{ fontFamily: "'Playfair Display', serif", color: "#2a0a0e" }}>
                  Nothing found — try a different word ✨
                </p>
                <button
                  type="button"
                  onClick={clear}
                  className="mt-4 rounded-full px-5 py-2 text-sm font-bold"
                  style={{ background: "#3d0c11", color: "#f5ede6" }}
                >
                  Clear search
                </button>
              </div>
            )
          )}
        </div>
      ) : (
        children
      )}
    </>
  );
}
