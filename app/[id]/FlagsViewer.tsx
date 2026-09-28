"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, ShieldAlert, Loader2 } from "lucide-react";

import FlagsTemplate from "@/app/(templates)/flags/components/FlagsTemplate";
import { dbToFlagsData } from "@/app/(templates)/flags/components/types";
import { FLAGS_THEMES } from "@/app/(templates)/flags/components/themes";
import { pickTheme } from "@/app/(templates)/_love/theme";
import { DATE_FONT_VARS } from "@/app/(templates)/date-invitation/components/fonts";
import { API_URL, IS_NGROK } from "@/lib/config";

/* ─────────────────────────────────────────
   Password gate — dressed in the theme the sender picked, framed as a
   "match request" so the lock already feels like part of the game.
───────────────────────────────────────── */
function FlagsPasswordGate({ shareId, themeId, onUnlocked }: { shareId: string; themeId: unknown; onUnlocked: () => void }) {
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const theme = pickTheme(FLAGS_THEMES, typeof themeId === "string" ? themeId : "");
  const c = theme.colors;
  const grad = `linear-gradient(115deg, ${c.a1}, ${c.a2} 55%, ${c.a3})`;

  const handleVerify = useCallback(async () => {
    if (!pw.trim()) return;
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_URL}/flags-pages/share/${shareId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}) },
        body: JSON.stringify({ password: pw }),
      });
      const result = await res.json();
      if (result.success && result.verified) {
        sessionStorage.setItem(`flags_unlocked_${shareId}`, "true");
        onUnlocked();
      } else { setError("Wrong password. Try again."); setPw(""); }
    } catch { setError("Something went wrong. Try again."); }
    finally { setLoading(false); }
  }, [pw, shareId, onUnlocked]);

  return (
    <div className={`${DATE_FONT_VARS} fixed inset-0 z-[200] flex items-center justify-center px-5`} style={{ background: c.bg, color: c.ink, fontFamily: "var(--font-di-grotesk), system-ui, sans-serif" }}>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-sm"
      >
        <div className="px-7 pt-8 pb-7" style={{ background: c.paper, color: c.paperInk, borderRadius: 30, border: `1px solid ${c.edge}`, boxShadow: `0 30px 70px -30px ${theme.dark ? "#000" : "rgba(90,40,70,.35)"}` }}>
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 grid place-items-center mb-4 text-3xl rounded-full" style={{ background: grad, boxShadow: `0 12px 26px -10px ${c.a1}` }}>
              <Lock size={24} color="#fff" />
            </div>
            <p className="text-[11px] uppercase font-extrabold mb-2 text-center" style={{ letterSpacing: "0.2em", color: c.a1 }}>
              🚩 1 profile near you 💚
            </p>
            <h2 className="text-center mb-1.5" style={{ fontFamily: "var(--font-di-serif), Georgia, serif", fontStyle: "italic", fontSize: 32, lineHeight: 1.05 }}>
              this one&apos;s private.
            </h2>
            <p className="text-[13px] text-center leading-relaxed" style={{ color: c.paperSoft }}>
              They sent you a password with the link.
            </p>
          </div>

          <div className="relative mb-4">
            <input
              type={showPw ? "text" : "password"}
              value={pw}
              onChange={(e) => { setPw(e.target.value); setError(""); }}
              onKeyDown={(e) => { if (e.key === "Enter") handleVerify(); }}
              placeholder="Password"
              autoFocus
              className="w-full px-4 py-3.5 pr-11 outline-none transition-colors"
              style={{
                background: theme.dark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.035)",
                color: c.paperInk,
                borderRadius: 16,
                fontSize: 16,
                border: `1.5px solid ${error ? "#e11d48" : c.edge}`,
              }}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? "Hide password" : "Show password"}
              className="absolute right-3.5 top-1/2 -translate-y-1/2"
              style={{ color: c.paperSoft }}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-1.5 text-xs mb-4 font-semibold"
                style={{ color: "#e11d48" }}
              >
                <ShieldAlert size={12} /><span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleVerify}
            disabled={loading || !pw.trim()}
            className="w-full min-h-[52px] font-extrabold flex items-center justify-center gap-2 transition-opacity disabled:opacity-40 text-white"
            style={{ background: grad, borderRadius: 999, fontSize: 16 }}
          >
            {loading ? <><Loader2 size={15} className="animate-spin" /> Checking…</> : "Open their profile 💚"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Flags viewer (published page)
───────────────────────────────────────── */
export default function FlagsViewer({
  rawData,
  hasPassword,
  shareId,
}: {
  rawData: Record<string, unknown>;
  hasPassword: boolean;
  shareId: string;
}) {
  const [unlocked, setUnlocked] = useState(() => {
    if (typeof window === "undefined") return !hasPassword;
    if (!hasPassword) return true;
    return sessionStorage.getItem(`flags_unlocked_${shareId}`) === "true";
  });

  if (hasPassword && !unlocked) {
    return <FlagsPasswordGate shareId={shareId} themeId={rawData.theme} onUnlocked={() => setUnlocked(true)} />;
  }

  const data = dbToFlagsData(rawData);

  // shareId is passed through so the renderer can seed buildDeck with it — the
  // deck order must be stable per page and identical across reloads.
  return <FlagsTemplate data={data} mode="live" shareId={shareId} hasPassword={hasPassword} />;
}
