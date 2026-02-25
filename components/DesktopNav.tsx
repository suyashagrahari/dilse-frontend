"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { LayoutGrid, Bookmark, Sun, Moon, User, Search, SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSelector } from "@/store/hooks";
import { useTemplateSearch } from "@/components/TemplateSearchProvider";

export default function DesktopNav() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const user = useAppSelector((s) => s.auth.user);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const { search, setSearch, setShowFilter, hasActiveFilters } = useTemplateSearch();

  useEffect(() => setMounted(true), []);

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [searchOpen]);

  // Escape to close search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && searchOpen) closeSearch();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchOpen]);

  if (pathname === "/") return null;

  const isTemplates = pathname.startsWith("/templates");
  const activeLink = (href: string) => pathname.startsWith(href);

  const closeSearch = () => {
    setSearch("");
    setSearchOpen(false);
  };

  const handleThemeToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const newTheme = theme === "dark" ? "light" : "dark";
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const maxR = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vt = (document as any).startViewTransition?.bind(document);
    if (vt) {
      const trans = vt(() => setTheme(newTheme));
      trans.ready.then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${maxR}px at ${x}px ${y}px)`] },
          { duration: 500, easing: "ease-in-out", pseudoElement: "::view-transition-new(root)" }
        );
      });
    } else {
      setTheme(newTheme);
    }
  };

  return (
    <header
      className="hidden md:flex fixed top-0 w-full z-50 px-10 py-5 items-center"
      style={{
        background: "var(--app-nav-bg)",
        borderBottom: "1px solid var(--app-nav-border)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      {/* ── Left: Logo ── */}
      <Link href="/" className="flex items-center gap-2.5 group shrink-0">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm transition-transform group-hover:scale-110"
          style={{ background: "var(--app-accent)", color: "var(--app-accent-fg)" }}
        >
          M
        </div>
        <span
          className="font-black text-lg tracking-tight"
          style={{ color: "var(--app-text)", fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Moments OS
        </span>
      </Link>

      {/* ── Center: Nav pills (absolutely centered, same on every page) ── */}
      <nav
        className="absolute left-1/2 -translate-x-1/2 flex gap-1 px-2 py-2 rounded-full"
        style={{ background: "var(--app-surface)", border: "1px solid var(--app-border)" }}
      >
        <Link
          href="/templates"
          className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-200"
          style={{
            background: activeLink("/templates") ? "var(--app-accent)" : "transparent",
            color: activeLink("/templates") ? "var(--app-accent-fg)" : "var(--app-text-muted)",
          }}
        >
          <LayoutGrid size={14} />
          Templates
        </Link>
        <Link
          href="/favorites"
          className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-200"
          style={{
            background: activeLink("/favorites") ? "var(--app-accent)" : "transparent",
            color: activeLink("/favorites") ? "var(--app-accent-fg)" : "var(--app-text-muted)",
          }}
        >
          <Bookmark size={14} />
          Favorites
        </Link>
      </nav>

      {/* ── Right: Actions ── */}
      <div className="ml-auto flex items-center gap-2">

        {/* Templates-only: expanding search + filter */}
        {isTemplates && (
          <>
            {/* Expanding search input (slides in to the left of the icon) */}
            <AnimatePresence>
              {searchOpen && (
                <motion.div
                  key="search-expand"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 200, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 380, damping: 28 }}
                  style={{ overflow: "hidden", height: 40 }}
                >
                  <div
                    className="relative flex items-center h-full rounded-full"
                    style={{
                      background: "var(--app-surface)",
                      border: "1px solid var(--app-accent-a35)",
                      width: 200,
                    }}
                  >
                    <Search
                      size={13}
                      className="absolute left-3 pointer-events-none shrink-0"
                      style={{ color: "var(--app-text-faint)" }}
                    />
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Search templates…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full h-full pl-9 pr-7 text-sm bg-transparent"
                      style={{
                        outline: "none",
                        color: "var(--app-text)",
                        caretColor: "var(--app-accent)",
                      }}
                    />
                    {search && (
                      <button
                        onClick={() => setSearch("")}
                        className="absolute right-2.5 w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ background: "var(--app-text-faint)", color: "var(--app-bg)" }}
                      >
                        <X size={9} />
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Search toggle button (icon ↔ X) */}
            <motion.button
              onClick={() => (searchOpen ? closeSearch() : setSearchOpen(true))}
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: searchOpen || search ? "var(--app-accent)" : "var(--app-surface)",
                border: `1px solid ${searchOpen || search ? "transparent" : "var(--app-border)"}`,
                color: searchOpen || search ? "var(--app-accent-fg)" : "var(--app-text)",
              }}
              aria-label={searchOpen ? "Close search" : "Open search"}
            >
              <AnimatePresence mode="wait" initial={false}>
                {searchOpen ? (
                  <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <X size={15} />
                  </motion.span>
                ) : (
                  <motion.span key="s" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <Search size={16} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Filter icon with active dot */}
            <div className="relative shrink-0">
              <button
                onClick={() => setShowFilter(true)}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{
                  background: hasActiveFilters ? "var(--app-accent)" : "var(--app-surface)",
                  border: `1px solid ${hasActiveFilters ? "transparent" : "var(--app-border)"}`,
                  color: hasActiveFilters ? "var(--app-accent-fg)" : "var(--app-text)",
                }}
                aria-label="Filter templates"
              >
                <SlidersHorizontal size={16} />
              </button>
              {hasActiveFilters && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
                  style={{ background: "var(--app-accent)", border: "2px solid var(--app-nav-bg)" }}
                />
              )}
            </div>
          </>
        )}

        {/* Theme toggle */}
        {mounted && (
          <button
            onClick={handleThemeToggle}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 shrink-0"
            style={{
              background: "var(--app-surface)",
              border: "1px solid var(--app-border)",
              color: "var(--app-text)",
            }}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        )}

        {/* Profile */}
        <Link
          href="/profile"
          className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden transition-all hover:scale-110 shrink-0"
          style={{
            background: activeLink("/profile") ? "var(--app-accent)" : "var(--app-surface)",
            border: `1px solid ${activeLink("/profile") ? "transparent" : "var(--app-border)"}`,
          }}
          aria-label="Profile"
        >
          {isAuthenticated && user?.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <User
              size={17}
              style={{ color: activeLink("/profile") ? "var(--app-accent-fg)" : "var(--app-text)" }}
            />
          )}
        </Link>
      </div>
    </header>
  );
}
