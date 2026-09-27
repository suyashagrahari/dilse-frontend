"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, ShieldAlert, Loader2 } from "lucide-react";

import DateInvitationTemplate from "@/app/(templates)/date-invitation/components/DateInvitationTemplate";
import { dbToDateInviteData } from "@/app/(templates)/date-invitation/components/types";
import { DATE_FONT_VARS } from "@/app/(templates)/date-invitation/components/fonts";
import { API_URL, IS_NGROK } from "@/lib/config";

const GROTESK = "var(--font-di-grotesk), var(--font-outfit), system-ui, sans-serif";

const ROSE_GRAD = "linear-gradient(115deg,#ff4f8b 0%,#ff7a5c 48%,#ffb03c 100%)";

/* ─────────────────────────────────────────
   Password gate — the invitation is whole
   behind it; this only asks who's asking.
───────────────────────────────────────── */
function DateInvitationPasswordGate({ shareId, onUnlocked }: { shareId: string; onUnlocked: () => void }) {
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = useCallback(async () => {
    if (!pw.trim()) return;
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_URL}/date-invitation-pages/share/${shareId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}) },
        body: JSON.stringify({ password: pw }),
      });
      const result = await res.json();
      if (result.success && result.verified) {
        sessionStorage.setItem(`date-invitation_unlocked_${shareId}`, "true");
        onUnlocked();
      } else { setError("Wrong password. Try again!"); setPw(""); }
    } catch { setError("Something went wrong. Try again!"); }
    finally { setLoading(false); }
  }, [pw, shareId, onUnlocked]);

  return (
    <div
      className={`${DATE_FONT_VARS} fixed inset-0 z-[200] flex items-center justify-center px-5`}
      style={{
        fontFamily: GROTESK,
        background:
          "radial-gradient(60% 45% at 0% 0%, rgba(255,79,139,.5), transparent 70%), radial-gradient(60% 45% at 100% 60%, rgba(181,155,255,.4), transparent 70%), #12081f",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 360, damping: 25 }}
        className="relative w-full max-w-sm z-10"
      >
        <div
          className="rounded-[28px] overflow-hidden shadow-2xl"
          style={{ background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.16)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}
        >
          <div className="h-1" style={{ background: ROSE_GRAD }} />
          <div className="px-7 pt-8 pb-7">
            <div className="flex flex-col items-center mb-7">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-xl"
                style={{ background: ROSE_GRAD, boxShadow: "0 14px 30px -12px rgba(255,79,139,.7)" }}
              >
                <Lock size={28} className="text-white" />
              </motion.div>
              <div className="text-3xl mb-2" aria-hidden>💌</div>
              <h2 className="text-2xl font-extrabold text-center mb-1" style={{ color: "#fff6fb", letterSpacing: "-0.02em" }}>
                This one&apos;s just for you
              </h2>
              <p className="text-sm text-center leading-relaxed" style={{ color: "rgba(255,246,251,.65)" }}>
                Enter the password and<br />the invitation opens
              </p>
            </div>

            <div className="relative mb-4">
              <input
                type={showPw ? "text" : "password"}
                value={pw}
                onChange={(e) => { setPw(e.target.value); setError(""); }}
                onKeyDown={(e) => { if (e.key === "Enter") handleVerify(); }}
                placeholder="Enter password..."
                autoFocus
                aria-label="Password"
                className={`w-full px-4 py-3.5 pr-11 rounded-full text-base outline-none transition-all border text-[#241f1b] ${
                  error ? "border-red-400/60 ring-2 ring-red-400/15" : "focus:ring-2"
                }`}
                style={error ? { background: "#fdfaf3" } : { background: "#fdfaf3", borderColor: "transparent" }}
              />
              <button
                type="button" onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "Hide password" : "Show password"}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#675f52] transition-colors"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center justify-center gap-1.5 text-xs mb-4 text-[#ff8fb6]"
                >
                  <ShieldAlert size={12} /><span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleVerify}
              disabled={loading || !pw.trim()}
              className="w-full py-3.5 rounded-full text-base font-extrabold flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-40 text-white shadow-lg"
              style={{ background: ROSE_GRAD, boxShadow: "0 14px 30px -14px rgba(255,79,139,.9)" }}
            >
              {loading ? <><Loader2 size={15} className="animate-spin" />Verifying...</> : <><Lock size={15} />Open it</>}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Date Invitation viewer (published page)
───────────────────────────────────────── */
export default function DateInvitationViewer({
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
    return sessionStorage.getItem(`date-invitation_unlocked_${shareId}`) === "true";
  });

  if (hasPassword && !unlocked) {
    return <DateInvitationPasswordGate shareId={shareId} onUnlocked={() => setUnlocked(true)} />;
  }

  // dbToDateInviteData already clamps the stop list and keeps `arrivedAt`
  // parallel to it — trust it.
  const data = dbToDateInviteData(rawData);

  return <DateInvitationTemplate data={data} mode="live" shareId={shareId} hasPassword={hasPassword} />;
}
