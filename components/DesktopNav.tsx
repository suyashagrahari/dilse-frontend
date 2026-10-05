"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search, X, SlidersHorizontal, User, BarChart3, Crown, GraduationCap, BookOpen, Star, Info, Mail, HelpCircle, Gift } from "lucide-react";
import NavDropdown from "@/components/NavDropdown";
import { motion, AnimatePresence } from "framer-motion";
import { useTemplateSearch } from "@/components/TemplateSearchProvider";
import { useAppSelector } from "@/store/hooks";
import { roleAtLeast } from "@/lib/roles";

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
  const { user: authUser, isAuthenticated } = useAppSelector((s) => s.auth);
  const isExplore = ["/guides", "/blog", "/feedback"].some((p) => pathname.startsWith(p));
  const isCompany = ["/about-us", "/contact-us", "/help"].some((p) => pathname.startsWith(p));
  const isInfluencerPage = pathname.startsWith("/influencer");
  // Rank check, not equality: `superadmin` outranks `admin` and must still
  // see the Admin entry. `=== "admin"` hid it the moment that role existed.
  const isAdmin = roleAtLeast(authUser?.role, "admin");

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
    fontSize: "clamp(10px, 0.72vw, 11.5px)",
    fontWeight: 700,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    cursor: "pointer",
    whiteSpace: "nowrap",
  });

  if (!mounted) return null;

  return (
    <header
      className="hidden md:flex fixed top-0 left-0 right-0 z-50 justify-center"
      style={{ padding: "14px clamp(20px, 5vw, 120px) 0", pointerEvents: "none" }}
    >
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{
          pointerEvents: "all",
          width: "min(1180px, calc(100vw - 56px))",
          background: scrolled ? "rgba(245,237,230,0.97)" : "rgba(245,237,230,0.92)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          border: "1px solid rgba(61,12,17,0.12)",
          borderRadius: 60,
          boxShadow: scrolled
            ? "0 8px 32px rgba(61,12,17,0.13)"
            : "0 4px 20px rgba(61,12,17,0.08)",
          transition: "all 0.35s ease",
          padding: "0 clamp(14px, 1.8vw, 28px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 60,
          gap: 12,
        }}
      >
        {/* Left side */}
        <div className="dnav-side dnav-left" style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", minWidth: 0 }}>
          <Link href="/" className="flex items-center  shrink-0" style={{ textDecoration: "none" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://cdn.subhsandesh.in/gifts-media/indianFestival/logo-sm.webp" alt="" width={56} height={56} style={{ width: 56, height: 56, objectFit: "contain", flexShrink: 0 }} />
            <span className="dnav-wordmark" style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(18px, 1.35vw, 22px)", fontWeight: 700, color: "#2a0a0e", letterSpacing: "-0.2px", userSelect: "none", lineHeight: 1 }}>
              SubhSandesh
            </span>
          </Link>
        </div>

        {/* Middle tabs — the two things people come to do stay visible; the
            reading and company pages fold into dropdowns so the bar stays calm
            as sections are added. "Earn" is the influencer program. */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "clamp(14px, 1.6vw, 22px)", minWidth: 0 }}>
          <button onClick={() => router.push("/templates")} style={tabTextStyle(pathname.startsWith("/templates"))}>
            Templates
          </button>
          <button
            onClick={() => router.push("/favorites")}
            style={tabTextStyle(pathname.startsWith("/favorites") || pathname.startsWith("/saves"))}
          >
            Favorite
          </button>
          <NavDropdown
            label="Explore"
            active={isExplore}
            triggerStyle={tabTextStyle(isExplore)}
            items={[
              { href: "/guides", label: "Product Guides", description: "Step-by-step help for every template", icon: <GraduationCap size={16} /> },
              { href: "/blog", label: "Blog", description: "Ideas, wishes and gifting stories", icon: <BookOpen size={16} /> },
              { href: "/feedback", label: "Love Wall", description: "What creators say about us", icon: <Star size={16} /> },
            ]}
          />
          <NavDropdown
            label="Company"
            active={isCompany}
            triggerStyle={tabTextStyle(isCompany)}
            items={[
              { href: "/about-us", label: "About Us", description: "The story behind SubhSandesh", icon: <Info size={16} /> },
              { href: "/contact-us", label: "Contact Us", description: "We reply within a day", icon: <Mail size={16} /> },
              { href: "/help", label: "Help Center", description: "Answers to common questions", icon: <HelpCircle size={16} /> },
            ]}
          />
          <button
            onClick={() => router.push("/influencer")}
            style={{
              ...tabTextStyle(isInfluencerPage),
              opacity: 1,
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "6px 11px",
              borderRadius: 99,
              background: isInfluencerPage ? "#3d0c11" : "rgba(201,168,76,0.16)",
              color: isInfluencerPage ? "#f2cf74" : "#8b5a2b",
              border: "1px solid rgba(201,168,76,0.4)",
            }}
          >
            <Crown size={12} /> Earn
          </button>
        </div>

        {/* Right actions */}
        <div className="dnav-side dnav-right" style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10, minWidth: 0 }}>
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
                          type="button"
                          aria-label="Clear search"
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

          {isAuthenticated ? (
            <NavDropdown
              align="right"
              ariaLabel="Account menu"
              triggerStyle={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
                overflow: "hidden",
                background: isProfile
                  ? "linear-gradient(145deg,#7a1622 0%,#3d0c11 100%)"
                  : "linear-gradient(145deg,#5a0f17 0%,#3d0c11 100%)",
                border: isProfile
                  ? "1px solid rgba(201,168,76,0.55)"
                  : "1px solid rgba(201,168,76,0.35)",
                color: "#f5ede6",
                boxShadow: isProfile
                  ? "0 6px 16px rgba(61,12,17,0.25), inset 0 1px 0 rgba(255,255,255,0.15)"
                  : "0 4px 12px rgba(61,12,17,0.2)",
              }}
              trigger={
                authUser?.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={authUser.avatar} alt="" referrerPolicy="no-referrer" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <User size={17} />
                )
              }
              header={
                <div style={{ padding: "8px 10px 10px", borderBottom: "1px solid rgba(61,12,17,0.08)", marginBottom: 4 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: "#2a0a0e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 230 }}>{authUser?.name}</div>
                  <div style={{ fontSize: 11.5, color: "#9a7070", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 230 }}>{authUser?.email}</div>
                </div>
              }
              items={[
                { href: "/profile", label: "My Profile", description: "Your pages, link and account", icon: <User size={16} /> },
                authUser?.influencer
                  ? { href: "/influencer", label: "Influencer Hub", description: "Earnings, links and referrals", icon: <Crown size={16} /> }
                  : { href: "/influencer", label: "Become an Influencer", description: "Earn commission on every sale", icon: <Crown size={16} />, badge: "NEW" },
                { href: "/profile#referral", label: "Refer & Earn", description: "Invite friends, get points", icon: <Gift size={16} /> },
                ...(isAdmin ? [{ href: "/admin/analytics", label: "Admin Dashboard", description: "Analytics, users and settings", icon: <BarChart3 size={16} /> }] : []),
              ]}
            />
          ) : (
            <Link
              href="/profile"
              aria-label="Go to profile"
              style={{ ...{
                width: 42,
                height: 42,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
                overflow: "hidden",
                background: isProfile
                  ? "linear-gradient(145deg,#7a1622 0%,#3d0c11 100%)"
                  : "linear-gradient(145deg,#5a0f17 0%,#3d0c11 100%)",
                border: isProfile
                  ? "1px solid rgba(201,168,76,0.55)"
                  : "1px solid rgba(201,168,76,0.35)",
                color: "#f5ede6",
                boxShadow: isProfile
                  ? "0 6px 16px rgba(61,12,17,0.25), inset 0 1px 0 rgba(255,255,255,0.15)"
                  : "0 4px 12px rgba(61,12,17,0.2)",
              }, textDecoration: "none" }}
            >
              <User size={17} />
            </Link>
          )}
        </div>
        {/* Tablets get the desktop bar too (md+), where the wordmark plus five
            tabs no longer fit: the wordmark drops and the side columns shrink
            to their content so the tabs never slide under the logo. */}
        <style>{`
          .dnav-side { width: clamp(220px, 30vw, 340px); flex-shrink: 0; }
          @media (max-width: 1100px) {
            .dnav-wordmark { display: none; }
            .dnav-left { width: auto; }
            .dnav-right { width: auto; min-width: 42px; }
          }
        `}</style>
      </motion.div>
    </header>
  );
}
