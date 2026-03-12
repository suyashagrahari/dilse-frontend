"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search, X, SlidersHorizontal, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTemplateSearch } from "@/components/TemplateSearchProvider";

export default function DesktopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { search, setSearch, setShowFilter, hasActiveFilters } = useTemplateSearch();

  const isTemplates = pathname.startsWith("/templates");
  const isProfile = pathname.startsWith("/profile");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 28);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [searchOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && searchOpen) closeSearch();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchOpen]);

  const closeSearch = () => {
    setSearch("");
    setSearchOpen(false);
  };

  const tabTextStyle = (active: boolean): React.CSSProperties => ({
    background: "none",
    border: "none",
    padding: "0 2px",
    color: active ? "#8b5a2b" : "#2a0a0e",
    opacity: active ? 1 : 0.72,
    fontSize: 11.5,
    fontWeight: 700,
    letterSpacing: "0.24em",
    textTransform: "uppercase",
    cursor: "pointer",
    whiteSpace: "nowrap",
  });

  if (!mounted) return null;

  return (
    <header
      className="hidden md:flex fixed top-0 left-0 right-0 z-50 justify-center"
      style={{ padding: "14px 140px 0", pointerEvents: "none" }}
    >
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{
          pointerEvents: "all",
          width: "100%",
          maxWidth: 860,
          background: scrolled ? "rgba(245,237,230,0.97)" : "rgba(245,237,230,0.92)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          border: "1px solid rgba(61,12,17,0.12)",
          borderRadius: 60,
          boxShadow: scrolled
            ? "0 8px 32px rgba(61,12,17,0.13)"
            : "0 4px 20px rgba(61,12,17,0.08)",
          transition: "all 0.35s ease",
          padding: "0 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 60,
          gap: 8,
        }}
      >
        {/* Left side */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-start", minWidth: 0 }}>
          <Link href="/" className="flex items-center  shrink-0" style={{ textDecoration: "none" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/indianFestival/logo.png" alt="SubhSandesh" style={{ width: 68, height: 68, objectFit: "contain", flexShrink: 0 }} />
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#2a0a0e", letterSpacing: "-0.25px", userSelect: "none", lineHeight: 1 }}>
              SubhSandesh
            </span>
          </Link>
        </div>

        {/* Middle tabs */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 22 }}>
          <button onClick={() => router.push("/templates")} style={tabTextStyle(pathname.startsWith("/templates"))}>
            Templates
          </button>
          <button
            onClick={() => router.push("/favorites")}
            style={tabTextStyle(pathname.startsWith("/favorites") || pathname.startsWith("/saves"))}
          >
            Favorite
          </button>
        </div>

        {/* Right actions */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10 }}>
          {isTemplates && (
            <>
              <AnimatePresence>
                {searchOpen && (
                  <motion.div
                    key="search-expand"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 200, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 380, damping: 28 }}
                    style={{ overflow: "hidden", height: 36 }}
                  >
                    <div
                      style={{
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        height: "100%",
                        borderRadius: 20,
                        background: "rgba(255,255,255,0.8)",
                        border: "1px solid rgba(61,12,17,0.15)",
                        width: 200,
                      }}
                    >
                      <Search size={12} style={{ position: "absolute", left: 10, color: "#9a7070", pointerEvents: "none" }} />
                      <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search templates..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                          width: "100%",
                          height: "100%",
                          paddingLeft: 28,
                          paddingRight: 28,
                          fontSize: 12,
                          background: "transparent",
                          border: "none",
                          outline: "none",
                          color: "#2a0a0e",
                        }}
                      />
                      {search && (
                        <button
                          onClick={() => setSearch("")}
                          style={{
                            position: "absolute",
                            right: 8,
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            background: "#9a7070",
                            color: "#f5ede6",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          <X size={9} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={() => (searchOpen ? closeSearch() : setSearchOpen(true))}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: searchOpen || search ? "#3d0c11" : "rgba(61,12,17,0.06)",
                  border: "1px solid rgba(61,12,17,0.12)",
                  color: searchOpen || search ? "#f5ede6" : "#2a0a0e",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                aria-label="Search templates"
              >
                {searchOpen ? <X size={14} /> : <Search size={14} />}
              </button>

              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowFilter(true)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: hasActiveFilters ? "#3d0c11" : "rgba(61,12,17,0.06)",
                    border: "1px solid rgba(61,12,17,0.12)",
                    color: hasActiveFilters ? "#f5ede6" : "#2a0a0e",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  aria-label="Open filters"
                >
                  <SlidersHorizontal size={14} />
                </button>
                {hasActiveFilters && (
                  <span
                    style={{
                      position: "absolute",
                      top: -2,
                      right: -2,
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: "#c9a84c",
                      border: "2px solid #f5ede6",
                    }}
                  />
                )}
              </div>
            </>
          )}

          <Link
            href="/profile"
            aria-label="Go to profile"
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: isProfile
                ? "linear-gradient(145deg,#7a1622 0%,#3d0c11 100%)"
                : "linear-gradient(145deg,#5a0f17 0%,#3d0c11 100%)",
              border: isProfile
                ? "1px solid rgba(201,168,76,0.55)"
                : "1px solid rgba(201,168,76,0.35)",
              color: "#f5ede6",
              cursor: "pointer",
              transition: "all 0.25s",
              boxShadow: isProfile
                ? "0 6px 16px rgba(61,12,17,0.25), inset 0 1px 0 rgba(255,255,255,0.15)"
                : "0 4px 12px rgba(61,12,17,0.2)",
              textDecoration: "none",
            }}
          >
            <User size={17} />
          </Link>
        </div>
      </motion.div>
    </header>
  );
}
