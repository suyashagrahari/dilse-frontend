"use client";

// The "you're in" ticket: shown on the wishlist page once joined and on the
// profile. Everything on it is real — the name, the day they joined, their
// place in line and the discount stored on their row.

import Link from "next/link";
import { Heart } from "lucide-react";
import type { WishlistEntry } from "@/hooks/useWishlist";
import { VALENTINE_PATH } from "@/lib/wishlist/valentine";

export default function ValentinePass({ entry, name, compact, link }: { entry: WishlistEntry; name?: string; compact?: boolean; link?: boolean }) {
  const joined = new Date(entry.joinedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const body = (
    <>
      <span className="vpShine" aria-hidden />
      <div className="vpMain">
        <span className="vpKick"><Heart size={11} fill="currentColor" aria-hidden /> Valentine&apos;s Week 2027</span>
        <strong className="vpTitle">{name ? <>{name.split(" ")[0]}, you&apos;re <em>on the list.</em></> : <>You&apos;re <em>on the list.</em></>}</strong>
        <span className="vpMeta">Joined {joined} · #{entry.position.toLocaleString("en-IN")} in line</span>
      </div>
      <div className="vpStub" aria-label={`${entry.discountPercent}% off reserved`}>
        <span className="vpOff">{entry.discountPercent}<small>%</small></span>
        <span className="vpOffL">OFF<br />reserved</span>
      </div>
      <style>{VP_CSS}</style>
    </>
  );
  const cls = `vpPass${compact ? " vpCompact" : ""}`;
  return link ? <Link href={VALENTINE_PATH} className={cls}>{body}</Link> : <div className={cls}>{body}</div>;
}

const VP_CSS = `
.vpPass { position: relative; isolation: isolate; overflow: hidden; display: flex; align-items: stretch; width: 100%; text-decoration: none;
  border-radius: 20px; color: #fff4f1; background: radial-gradient(130% 160% at 0% 0%, #b3243f 0%, #7a1028 45%, #3d0c11 100%);
  border: 1px solid rgba(255,196,186,.35); box-shadow: 0 22px 44px -26px rgba(122,16,40,.85), inset 0 1px 0 rgba(255,220,214,.2); }
.vpShine { position: absolute; inset: 0; z-index: -1; pointer-events: none; overflow: hidden; }
.vpShine::before { content: ""; position: absolute; top: -40%; bottom: -40%; width: 30%; left: -45%; transform: skewX(-18deg);
  background: linear-gradient(90deg, transparent, rgba(255,226,220,.22), transparent); animation: vpSweep 5.5s ease-in-out infinite; }
@keyframes vpSweep { 0%, 50% { left: -45%; } 85%, 100% { left: 135%; } }
.vpMain { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; padding: 18px 18px 18px 20px; }
.vpKick { display: inline-flex; align-items: center; gap: 6px; color: #ffc9c0; font: 800 10px/1 'Inter', system-ui, sans-serif; letter-spacing: .18em; text-transform: uppercase; }
.vpTitle { font: 600 22px/1.12 'Playfair Display', serif; color: #fff4f1; }
.vpTitle em { color: #f6d58a; font-style: italic; }
.vpMeta { color: rgba(255,236,232,.72); font: 500 12px/1.3 'Inter', system-ui, sans-serif; }
.vpStub { position: relative; flex-shrink: 0; width: 104px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
  border-left: 2px dashed rgba(255,214,206,.4); background: rgba(255,240,236,.06); }
.vpStub::before, .vpStub::after { content: ""; position: absolute; left: -9px; width: 16px; height: 16px; border-radius: 50%; background: var(--vp-notch, #f5ede6); }
.vpStub::before { top: -8px; } .vpStub::after { bottom: -8px; }
.vpOff { font: 700 34px/1 'Playfair Display', serif; color: #f6d58a; }
.vpOff small { font-size: 18px; }
.vpOffL { text-align: center; color: rgba(255,236,232,.8); font: 800 9.5px/1.25 'Inter', system-ui, sans-serif; letter-spacing: .14em; text-transform: uppercase; }
.vpCompact .vpMain { padding: 14px 14px 14px 16px; gap: 4px; }
.vpCompact .vpTitle { font-size: 18px; }
.vpCompact .vpStub { width: 86px; }
.vpCompact .vpOff { font-size: 28px; }
@media (prefers-reduced-motion: reduce) { .vpShine::before { animation: none; display: none; } }
`;
