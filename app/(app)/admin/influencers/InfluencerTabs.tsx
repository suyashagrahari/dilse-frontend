"use client";

// ─── Influencers | Prospects ─────────────────────────────────────────────────
//
// The two halves of the programme under one navbar entry: people who have
// joined, and people we are inviting. Real links (not state), so each tab has
// its own URL, survives a refresh and works with the back button.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Crown, Send } from "lucide-react";
import { A } from "../adminKit";

const TABS = [
  { href: "/admin/influencers", label: "Influencers", Icon: Crown },
  { href: "/admin/influencers/prospects", label: "Prospects", Icon: Send },
];

export default function InfluencerTabs({ badge }: { badge?: { prospects?: number } }) {
  const path = usePathname() || "";
  const active = path.startsWith("/admin/influencers/prospects") ? TABS[1].href : TABS[0].href;
  return (
    <nav className="inft" aria-label="Influencer sections">
      {TABS.map(({ href, label, Icon }) => {
        const on = href === active;
        const n = href === TABS[1].href ? badge?.prospects : undefined;
        return (
          <Link key={href} href={href} className="inft-tab" data-on={on ? "1" : "0"} aria-current={on ? "page" : undefined}>
            {on && <motion.span layoutId="inft-pill" className="inft-pill" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
            <span className="inft-in">
              <Icon size={14} /> {label}
              {!!n && <span className="inft-badge" title={`${n} new repl${n === 1 ? "y" : "ies"}`}>{n}</span>}
            </span>
          </Link>
        );
      })}
      <style>{`
        .inft { display: inline-flex; gap: 2px; padding: 4px; margin: 14px 0 0; border-radius: 16px; background: ${A.paper}; border: 1px solid ${A.edge}; box-shadow: 0 2px 10px rgba(61,12,17,.04); max-width: 100%; }
        .inft-tab { position: relative; display: inline-flex; align-items: center; height: 38px; padding: 0 16px; border-radius: 12px; text-decoration: none; font-size: 13px; font-weight: 800; color: ${A.soft}; }
        .inft-tab[data-on="1"] { color: #f7ece4; }
        .inft-pill { position: absolute; inset: 0; border-radius: 12px; background: ${A.maroon}; }
        .inft-in { position: relative; z-index: 1; display: inline-flex; align-items: center; gap: 6px; }
        .inft-badge { min-width: 18px; height: 18px; padding: 0 5px; border-radius: 99px; background: ${A.danger}; color: #fff; font-size: 10.5px; display: inline-flex; align-items: center; justify-content: center; }
      `}</style>
    </nav>
  );
}
