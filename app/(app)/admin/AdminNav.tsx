"use client";

// ─── The admin navbar ────────────────────────────────────────────────────────
//
// One bar for every admin screen, owned by the layout so it never moves when
// you switch sections. Fixed just under the site header on desktop and at the
// very top on a phone (where the site's own nav lives at the bottom). The
// active section wears a sliding pill; on a phone the row scrolls sideways and
// keeps the active tab in view.
//
// Super-admin-only screens are listed only for the super admin — each of them
// bounces anyone else, so showing the tab would be a dead end.

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart3, Users, MessageSquare, Star, FileText, Mail, LayoutTemplate,
  IndianRupee, KeyRound, Repeat, Crown, Megaphone, Heart, BadgePercent, Ghost,
} from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { isSuperAdmin } from "@/lib/roles";

const ITEMS = [
  { href: "/admin/analytics", label: "Analytics", Icon: BarChart3, superOnly: false },
  { href: "/admin/users", label: "Users", Icon: Users, superOnly: false },
  { href: "/admin/contacts", label: "Contacts", Icon: MessageSquare, superOnly: false },
  { href: "/admin/feedback", label: "Feedback", Icon: Star, superOnly: true },
  { href: "/admin/drafts", label: "Drafts", Icon: FileText, superOnly: true },
  { href: "/admin/threads", label: "Conversations", Icon: Mail, superOnly: true },
  { href: "/admin/outreach", label: "Outreach", Icon: Megaphone, superOnly: true },
  { href: "/admin/wishlist", label: "Wishlist", Icon: Heart, superOnly: true },
  { href: "/admin/season", label: "Season & offers", Icon: Ghost, superOnly: true },
  { href: "/admin/recurring", label: "Recurring", Icon: Repeat, superOnly: true },
  { href: "/admin/templates", label: "Templates", Icon: LayoutTemplate, superOnly: false },
  { href: "/admin/premium", label: "Premium Studio", Icon: Crown, superOnly: true },
  { href: "/admin/pricing", label: "Pricing", Icon: IndianRupee, superOnly: true },
  { href: "/admin/influencers", label: "Influencers", Icon: BadgePercent, superOnly: true },
  { href: "/admin/early-access", label: "Early access", Icon: KeyRound, superOnly: true },
];

export type AdminTab = (typeof ITEMS)[number];

/** The sections this admin can see, in navbar order — the swipe order too. */
export function useAdminTabs(): AdminTab[] {
  const { user } = useAppSelector((s) => s.auth);
  const sup = isSuperAdmin(user?.role);
  return ITEMS.filter((i) => !i.superOnly || sup);
}

export default function AdminNav() {
  const pathname = usePathname() || "";
  const items = useAdminTabs();
  const rowRef = useRef<HTMLDivElement>(null);

  // Keep the active tab visible when the row is scrolled on a phone.
  useEffect(() => {
    const el = rowRef.current?.querySelector<HTMLElement>('[aria-current="page"]');
    el?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [pathname]);

  return (
    <nav className="adm-nav" aria-label="Admin sections">
      <motion.div
        className="adm-nav-bar"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="adm-nav-brand" aria-hidden>
          <span className="adm-nav-dot" /> Admin
        </span>
        <div ref={rowRef} className="adm-nav-row">
          {items.map(({ href, label, Icon }) => {
            const on = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link key={href} href={href} aria-current={on ? "page" : undefined} className="adm-nav-tab" data-on={on ? "1" : "0"}>
                {on && (
                  <motion.span
                    layoutId="adm-nav-pill"
                    className="adm-nav-pill"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <Icon size={14} className="adm-nav-ic" />
                <span className="adm-nav-label">{label}</span>
              </Link>
            );
          })}
        </div>
      </motion.div>
    </nav>
  );
}

export const ADMIN_NAV_CSS = `
  :root { --adm-top: 62px; }
  @media (min-width: 768px) { :root { --adm-top: 146px; } }
  .adm-nav { position: fixed; left: 0; right: 0; top: 0; z-index: 45; display: flex; justify-content: center;
    padding: calc(8px + env(safe-area-inset-top, 0px)) 8px 0; pointer-events: none; }
  @media (min-width: 768px) { .adm-nav { top: 84px; padding: 0 clamp(20px, 5vw, 120px); } }
  .adm-nav-bar { pointer-events: all; width: min(1232px, 100%); display: flex; align-items: center; gap: 6px;
    background: rgba(255, 250, 244, 0.86); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(61,12,17,0.1); border-radius: 18px; padding: 5px;
    box-shadow: 0 10px 30px -18px rgba(61,12,17,0.45); }
  .adm-nav-brand { display: none; flex: none; align-items: center; gap: 6px; padding: 0 10px 0 8px;
    font-size: 10.5px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; color: #8b5a2b;
    border-right: 1px solid rgba(61,12,17,0.1); margin-right: 2px; }
  @media (min-width: 1024px) { .adm-nav-brand { display: inline-flex; } }
  .adm-nav-dot { width: 7px; height: 7px; border-radius: 50%; background: linear-gradient(135deg,#c9a84c,#8b5a2b);
    box-shadow: 0 0 0 3px rgba(201,168,76,.18); }
  .adm-nav-row { flex: 1; min-width: 0; display: flex; gap: 2px; overflow-x: auto; scrollbar-width: none; scroll-snap-type: x proximity; }
  .adm-nav-row::-webkit-scrollbar { display: none; }
  .adm-nav-tab { position: relative; flex: none; display: inline-flex; align-items: center; gap: 6px; height: 36px; padding: 0 12px;
    border-radius: 13px; font-size: 12.5px; font-weight: 700; color: #7f5f5f; text-decoration: none; white-space: nowrap;
    scroll-snap-align: center; transition: color .2s, background .2s; }
  .adm-nav-tab:hover { color: #2a0a0e; background: rgba(201,168,76,0.1); }
  .adm-nav-tab[data-on="1"] { color: #fff6e6; }
  .adm-nav-tab[data-on="1"]:hover { background: transparent; }
  .adm-nav-tab:focus-visible { outline: 2px solid #c9a84c; outline-offset: 1px; }
  .adm-nav-pill { position: absolute; inset: 0; border-radius: 13px; z-index: 0;
    background: linear-gradient(135deg, #5a1520, #3d0c11); box-shadow: 0 6px 16px -8px rgba(61,12,17,.8); }
  .adm-nav-ic, .adm-nav-label { position: relative; z-index: 1; }
  .adm-main { padding-top: var(--adm-top); min-height: 100vh;
    background: radial-gradient(900px 420px at 100% 0%, rgba(201,168,76,0.12), transparent 60%),
                linear-gradient(180deg, #faf3ee 0%, #f5ede6 50%, #efe3d3 100%); }
`;
