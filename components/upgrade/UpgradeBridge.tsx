"use client";

// ─── The premium editor, reached from a free template's offer ────────────────
//
// When the premium editor was opened by "Preview Premium" (`?upgrade=<from>`
// plus the hand-off context, lib/upgrade/offer.ts), its usual top-right capsule
// is replaced by this one, so every choice sits together at the top and the
// template below stays fully visible:
//
//   ‹  ✎  |  ➤ Free   ✦➤ Premium        (one compact capsule, icons + a word)
//
//   Edit             → the premium form, everything pre-filled
//   Publish Premium  → the premium publish (the paywall asks for payment there)
//   Publish free     → back to the free template, which publishes the bouquet
//                      they made there, without asking again
//
// Once the premium page is live the normal capsule (with Share) comes back,
// and `useUpgradeArrival` records `premium_published` and forgets the hand-off.

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { clearUpgradeContext, readUpgradeContext, trackUpgrade, type UpgradeContext } from "@/lib/upgrade/offer";

/** The hand-off context when this premium editor was opened from an offer, else null. */
export function useUpgradeArrival(slug: string, shareUrl: string | null, pageId: string | null, token: string | null | undefined): UpgradeContext | null {
  const params = useSearchParams();
  const [ctx, setCtx] = useState<UpgradeContext | null>(null);
  const publishedRef = useRef(false);

  // Read once on arrival (sessionStorage is client-only).
  useEffect(() => {
    const from = params.get("upgrade");
    const c = readUpgradeContext();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one read of browser storage after mount
    if (from && c && c.from === from && c.to === slug) setCtx(c);
  }, [params, slug]);

  // The premium page went live: that is the conversion.
  useEffect(() => {
    if (!ctx || !shareUrl || publishedRef.current) return;
    publishedRef.current = true;
    trackUpgrade(ctx.from, "premium_published", { token, pageId, to: ctx.to });
    clearUpgradeContext();
  }, [ctx, shareUrl, token, pageId]);

  return ctx;
}

export interface UpgradeTopBarProps {
  ctx: UpgradeContext;
  onBack: () => void;
  onEdit: () => void;
  onPublish: () => void;
  publishing: boolean;
  token: string | null | undefined;
  /** The page's accent gradient and the ink on it. */
  accent: string;
  accentInk: string;
  font: string;
}

export default function UpgradeTopBar({ ctx, onBack, onEdit, onPublish, publishing, token, accent, accentInk, font }: UpgradeTopBarProps) {
  const router = useRouter();

  const edit = () => {
    trackUpgrade(ctx.from, "edit_opened", { token, pageId: ctx.pageId, to: ctx.to });
    onEdit();
  };
  const publishFree = () => {
    trackUpgrade(ctx.from, "back_to_free", { token, pageId: ctx.pageId, to: ctx.to });
    clearUpgradeContext();
    router.push(ctx.backUrl);
  };

  return (
    <motion.nav
      aria-label="Premium preview"
      className="upt"
      style={{ fontFamily: font }}
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
    >
      <style>{CSS}</style>
      <button type="button" className="upt-icon" onClick={onBack} aria-label="Back" title="Back">
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 5 8 12l6.5 7" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      <button type="button" className="upt-icon" onClick={edit} aria-label="Edit the premium bouquet" title="Edit">
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4Z M13.5 6.5l4 4" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinejoin="round" /></svg>
      </button>
      <span className="upt-sep" aria-hidden />
      <button type="button" className="upt-free" onClick={publishFree} aria-label="Publish the free bouquet instead" title="Publish the free one instead">
        <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true"><path d="M22 2 11 13 M22 2l-7 20-4-9-9-4 20-7Z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" /></svg>
        Free
      </button>
      <button type="button" className="upt-primary" onClick={onPublish} disabled={publishing} style={{ background: accent, color: accentInk }} aria-label="Publish Premium" title="Publish Premium (payment asked here)">
        <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true"><path d="M22 2 11 13 M22 2l-7 20-4-9-9-4 20-7Z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" /></svg>
        {publishing ? "…" : "Premium"}
        <span className="upt-shine" aria-hidden />
      </button>
    </motion.nav>
  );
}

const CSS = `
.upt { position: fixed; z-index: 130; top: max(10px, env(safe-area-inset-top, 0px)); right: max(10px, env(safe-area-inset-right, 0px));
  display: flex; align-items: center; gap: 3px; padding: 4px; border-radius: 999px; color: #2a1a22; background: rgba(255,252,246,.86); border: 1px solid rgba(60,30,20,.12);
  -webkit-backdrop-filter: blur(14px) saturate(1.4); backdrop-filter: blur(14px) saturate(1.4); box-shadow: 0 12px 30px -14px rgba(0,0,0,.55); }
.upt button { border: 0; cursor: pointer; font-family: inherit; }
.upt-icon { width: 32px; height: 36px; display: grid; place-items: center; border-radius: 999px; background: transparent; color: inherit; }
.upt-icon:hover { background: rgba(127,127,127,.14); }
.upt-sep { width: 1px; height: 20px; margin: 0 1px; background: rgba(60,30,20,.15); }
.upt-free { height: 36px; padding: 0 10px 0 9px; display: inline-flex; align-items: center; gap: 5px; border-radius: 999px; background: #fff; color: #2a1a22;
  font-size: 13px; font-weight: 800; white-space: nowrap; box-shadow: inset 0 0 0 1.5px rgba(42,26,34,.75); }
.upt-free:hover { background: #f6f1ea; }
.upt-primary { position: relative; overflow: hidden; height: 36px; padding: 0 12px 0 10px; display: inline-flex; align-items: center; gap: 5px; border-radius: 999px;
  font-size: 13px; font-weight: 800; white-space: nowrap; box-shadow: 0 6px 18px -6px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.45); }
.upt-primary::before { content: "✦"; font-size: 10px; margin-right: -2px; opacity: .9; }
.upt-primary:disabled { opacity: .7; cursor: default; }
.upt svg { flex: none; }
.upt-shine { position: absolute; top: 0; bottom: 0; width: 40%; left: -60%; pointer-events: none; background: linear-gradient(100deg, transparent, rgba(255,255,255,.55), transparent);
  transform: skewX(-18deg); animation: uptSweep 4.2s cubic-bezier(.4,0,.2,1) 1.2s infinite; }
.upt button:focus-visible { outline: 3px solid #e2b44a; outline-offset: 2px; }
@keyframes uptSweep { 0%, 60% { left: -60%; } 90%, 100% { left: 130%; } }
@media (prefers-reduced-motion: reduce) { .upt-shine { animation: none; } }
`;
