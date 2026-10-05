"use client";

// The first thing an influencer sees on their profile is what they've earned;
// everyone else sees a one-line invitation to the program.

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Crown, ChevronRight, IndianRupee, Clock, UserPlus } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { API_URL } from "@/lib/config";
import { BRAND } from "@/lib/brand";
import { rupees, type InfluencerDashboard } from "@/lib/influencer";

export default function ProfileInfluencerStrip() {
  const { user, accessToken } = useAppSelector((s) => s.auth);
  const isInfluencer = !!user?.influencer;
  const [data, setData] = useState<Pick<InfluencerDashboard, "totals" | "stats"> | null>(null);
  const [pct, setPct] = useState<number | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    if (isInfluencer) {
      fetch(`${API_URL}/influencer/dashboard`, { headers: { Authorization: `Bearer ${accessToken}` } })
        .then((r) => r.json())
        .then((d) => d.success && setData({ totals: d.data.totals, stats: d.data.stats }))
        .catch(() => {});
    } else {
      fetch(`${API_URL}/influencer/program`)
        .then((r) => r.json())
        .then((d) => d.success && setPct(d.data.defaultCommissionPercent))
        .catch(() => {});
    }
  }, [accessToken, isInfluencer]);

  if (!user) return null;

  if (!isInfluencer) {
    return (
      <Link href="/influencer" className="pis pis-promo">
        <style>{CSS}</style>
        <span className="pis-ic"><Crown size={16} /></span>
        <span className="pis-txt">
          <b>Become an influencer</b>
          <span>Share your link and earn {pct ?? 30}% of every premium template your followers make.</span>
        </span>
        <ChevronRight size={18} />
      </Link>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Link href="/influencer" className="pis pis-earn">
        <style>{CSS}</style>
        <span className="pis-ic gold"><Crown size={16} /></span>
        <span className="pis-cells">
          <span><small><IndianRupee size={11} /> Total earned</small><b className="big">{data ? rupees(data.totals.earnedPaise) : "…"}</b></span>
          <span><small><Clock size={11} /> Pending</small><b>{data ? rupees(data.totals.pendingPaise) : "…"}</b></span>
          <span><small><UserPlus size={11} /> Signups</small><b>{data ? data.stats.signups : "…"}</b></span>
        </span>
        <span className="pis-open">Influencer Hub <ChevronRight size={16} /></span>
      </Link>
    </motion.div>
  );
}

const CSS = `
  .pis { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 18px; text-decoration: none; margin: 12px 0; }
  .pis-promo { background: ${BRAND.surface}; border: 1px dashed rgba(201,168,76,.6); color: ${BRAND.text}; }
  .pis-promo > svg { color: ${BRAND.faint}; flex-shrink: 0; }
  .pis-ic { width: 36px; height: 36px; flex-shrink: 0; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: rgba(201,168,76,.16); color: ${BRAND.accent}; }
  .pis-ic.gold { background: rgba(242,207,116,.18); color: #f2cf74; }
  .pis-txt { flex: 1; min-width: 0; display: flex; flex-direction: column; }
  .pis-txt b { font-size: 14px; }
  .pis-txt span { font-size: 12px; color: ${BRAND.muted}; }
  .pis-earn { background: ${BRAND.gradient}; color: #f5ede6; box-shadow: 0 14px 30px -16px rgba(61,12,17,.6); flex-wrap: wrap; }
  .pis-cells { flex: 1; display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: 10px; min-width: 0; }
  .pis-cells > span { display: flex; flex-direction: column; min-width: 0; }
  .pis-cells small { display: inline-flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: rgba(245,237,230,.65); }
  .pis-cells b { font: 700 17px/1.2 'Playfair Display', serif; white-space: nowrap; }
  .pis-cells b.big { font-size: 22px; color: #f2cf74; }
  .pis-open { display: inline-flex; align-items: center; gap: 2px; font-size: 12.5px; font-weight: 800; color: #f2cf74; white-space: nowrap; }
  @media (max-width: 520px) { .pis-open { width: 100%; justify-content: flex-end; } }
`;
