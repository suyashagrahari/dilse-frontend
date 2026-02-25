"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { LayoutGrid, Bookmark, Sun, Moon, User } from "lucide-react";
import { useAppSelector } from "@/store/hooks";

export default function DesktopNav() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const user = useAppSelector((s) => s.auth.user);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  useEffect(() => setMounted(true), []);

  // Homepage has its own nav
  if (pathname === "/") return null;

  const activeLink = (href: string) => pathname.startsWith(href);

  return (
    <header
      className="hidden md:flex fixed top-0 w-full z-50 px-8 py-4 justify-between items-center"
      style={{
        background: "var(--app-nav-bg)",
        borderBottom: "1px solid var(--app-nav-border)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 group">
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

      {/* Center nav pills */}
      <nav
        className="flex gap-1 px-2 py-1.5 rounded-full"
        style={{ background: "var(--app-surface)", border: "1px solid var(--app-border)" }}
      >
        <Link
          href="/templates"
          className="flex items-center gap-2 text-sm font-semibold px-5 py-2 rounded-full transition-all duration-200"
          style={{
            background: activeLink("/templates") ? "var(--app-accent)" : "transparent",
            color: activeLink("/templates") ? "var(--app-accent-fg)" : "var(--app-text-muted)",
          }}
        >
          <LayoutGrid size={15} />
          Templates
        </Link>
        <Link
          href="/favorites"
          className="flex items-center gap-2 text-sm font-semibold px-5 py-2 rounded-full transition-all duration-200"
          style={{
            background: activeLink("/favorites") ? "var(--app-accent)" : "transparent",
            color: activeLink("/favorites") ? "var(--app-accent-fg)" : "var(--app-text-muted)",
          }}
        >
          <Bookmark size={15} />
          Favorites
        </Link>
      </nav>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{
              background: "var(--app-surface)",
              border: "1px solid var(--app-border)",
              color: "var(--app-text)",
            }}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        )}

        <Link
          href="/profile"
          className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden transition-all hover:scale-110"
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
              size={16}
              style={{ color: activeLink("/profile") ? "var(--app-accent-fg)" : "var(--app-text)" }}
            />
          )}
        </Link>

        <Link
          href="/templates"
          className="px-6 py-2.5 rounded-full text-sm font-bold transition-all hover:scale-105 hover:opacity-90"
          style={{ background: "var(--app-accent)", color: "var(--app-accent-fg)" }}
        >
          Start Building
        </Link>
      </div>
    </header>
  );
}
