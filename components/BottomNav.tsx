"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Bookmark, User, ScrollText } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  const activeColor = "var(--app-accent)";
  const mutedColor = "var(--app-nav-icon-muted)";

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[70] safe-bottom px-4 pb-6 pointer-events-none">
      <div
        className="pointer-events-auto rounded-[2rem] backdrop-blur-xl px-3 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.25)]"
        style={{ background: "var(--app-nav-bg)", border: "1px solid var(--app-nav-border)" }}
      >
        <div className="grid grid-cols-5 items-end">
          <Link href="/manifesto" className="flex flex-col items-center gap-1">
            <ScrollText size={22} style={{ color: pathname.startsWith("/manifesto") ? activeColor : mutedColor }} />
            <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: pathname.startsWith("/manifesto") ? activeColor : mutedColor }}>
              Manifesto
            </span>
          </Link>

          <Link href="/templates" className="flex flex-col items-center gap-1">
            <Compass size={22} style={{ color: pathname.startsWith("/templates") ? activeColor : mutedColor }} />
            <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: pathname.startsWith("/templates") ? activeColor : mutedColor }}>
              Explore
            </span>
          </Link>

          <Link
            href="/"
            aria-label="Home"
            className="-mt-8 mx-auto h-16 w-16 rounded-full grid place-items-center"
            style={{
              background: "var(--app-accent)",
              color: "var(--app-accent-fg)",
              border: "4px solid var(--app-nav-create-border)",
              boxShadow: "0 10px 30px var(--app-accent-a35)",
            }}
          >
            <Home size={30} />
          </Link>

          <Link href="/favorites" className="flex flex-col items-center gap-1">
            <Bookmark size={22} style={{ color: pathname.startsWith("/favorites") ? activeColor : mutedColor }} />
            <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: pathname.startsWith("/favorites") ? activeColor : mutedColor }}>
              Saved
            </span>
          </Link>

          <Link href="/profile" className="flex flex-col items-center gap-1">
            <User size={22} style={{ color: pathname.startsWith("/profile") ? activeColor : mutedColor }} />
            <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: pathname.startsWith("/profile") ? activeColor : mutedColor }}>
              Profile
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
