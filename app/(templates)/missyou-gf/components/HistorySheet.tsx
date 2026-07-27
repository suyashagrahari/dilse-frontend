"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, Heart, Eye, Loader2, Sparkles } from "lucide-react";
import { LOVEMAP_FIELDS, type EngagementData } from "./types";

const CREAM = "#fffdfa";
const EDGE = "#ead9c8";
const ROSE = "#b23a5b";
const ROSE_STRONG = "#9c2f4d";
const INK = "#3a2c27";
const MUTED = "#8a7568";
const BLUSH = "#f7e6e9";

function when(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

// The sender's window into how the recipient has been holding the gift: how many
// hugs they sent, and everything they wrote back in the love map. Refetched each
// time it's opened. Mobile-first bottom sheet.
export default function HistorySheet({
  open,
  onClose,
  loading,
  engagement,
}: {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  engagement: EngagementData | null;
}) {
  const answered = engagement ? LOVEMAP_FIELDS.filter((f) => engagement.loveMap[f.key]?.trim()) : [];
  const hasAny = engagement && (engagement.hugCount > 0 || answered.length > 0);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
            className="fixed inset-0 z-[80]" style={{ background: "rgba(58,44,39,.5)", backdropFilter: "blur(4px)" }} />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="fixed bottom-0 left-0 right-0 z-[80] lg:flex lg:items-center lg:justify-center lg:inset-0"
          >
            <div className="mx-auto max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-3xl lg:rounded-3xl"
              style={{ background: CREAM, border: `1px solid ${EDGE}`, boxShadow: "0 -20px 60px -20px rgba(90,48,56,.5)" }}>
              <div className="sticky top-0 z-10 flex justify-center pt-3 pb-1" style={{ background: CREAM }}>
                <div className="h-1 w-10 rounded-full" style={{ background: EDGE }} />
              </div>

              <div className="px-5 pb-8 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="mu-serif text-2xl italic" style={{ color: ROSE }}>how they held this</h3>
                  <button onClick={onClose} aria-label="Close" style={{ color: MUTED }}><X size={20} /></button>
                </div>
                <p className="mu-sans mt-1 text-xs" style={{ color: MUTED }}>Everything your person sent back — refreshes each time you open it.</p>

                {loading ? (
                  <div className="flex items-center justify-center gap-2 py-12" style={{ color: ROSE }}>
                    <Loader2 size={18} className="animate-spin" /> <span className="mu-sans text-sm">loading…</span>
                  </div>
                ) : !hasAny ? (
                  <div className="py-12 text-center">
                    <Sparkles size={26} style={{ color: ROSE, margin: "0 auto" }} />
                    <p className="mu-serif mt-3 text-lg italic" style={{ color: INK }}>nothing yet — but soon 🤍</p>
                    <p className="mu-sans mt-1 text-sm" style={{ color: MUTED }}>Share your link; every hug and answer will show up here.</p>
                  </div>
                ) : (
                  <>
                    {/* stat tiles */}
                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl p-4 text-center" style={{ background: BLUSH, border: `1px solid ${EDGE}` }}>
                        <Heart size={16} style={{ color: ROSE, margin: "0 auto", fill: ROSE }} />
                        <div className="mu-serif mt-1 text-4xl font-semibold tabular-nums" style={{ color: ROSE_STRONG }}>{engagement!.hugCount}</div>
                        <div className="mu-sans text-[11px] uppercase tracking-widest" style={{ color: MUTED }}>hugs sent to you</div>
                        {engagement!.lastHugAt && <div className="mu-sans mt-1 text-[10px]" style={{ color: MUTED }}>last {when(engagement!.lastHugAt)}</div>}
                      </div>
                      <div className="rounded-2xl p-4 text-center" style={{ background: BLUSH, border: `1px solid ${EDGE}` }}>
                        <Eye size={16} style={{ color: ROSE, margin: "0 auto" }} />
                        <div className="mu-serif mt-1 text-4xl font-semibold tabular-nums" style={{ color: ROSE_STRONG }}>{engagement!.viewCount}</div>
                        <div className="mu-sans text-[11px] uppercase tracking-widest" style={{ color: MUTED }}>times opened</div>
                      </div>
                    </div>

                    {/* love-map answers */}
                    <div className="mt-6">
                      <p className="mu-sans text-xs font-bold uppercase tracking-widest" style={{ color: ROSE_STRONG }}>their love map</p>
                      {answered.length === 0 ? (
                        <p className="mu-serif mt-2 text-sm italic" style={{ color: MUTED }}>they haven&apos;t filled this in yet.</p>
                      ) : (
                        <div className="mt-3 space-y-3">
                          {answered.map((f) => (
                            <div key={f.key} className="rounded-2xl p-4" style={{ background: "#fff", border: `1px solid ${EDGE}` }}>
                              <p className="mu-script text-xl" style={{ color: ROSE_STRONG }}>{f.label}</p>
                              <p className="mu-serif mt-1 whitespace-pre-wrap text-base" style={{ color: INK }}>{engagement!.loveMap[f.key]}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      {engagement!.loveMapUpdatedAt && (
                        <p className="mu-sans mt-3 text-[11px]" style={{ color: MUTED }}>updated {when(engagement!.loveMapUpdatedAt)}</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
