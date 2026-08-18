"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Space_Grotesk, Caveat } from "next/font/google";
import { Lock, Eye, EyeOff, ShieldAlert, Loader2 } from "lucide-react";

import CourtOfLove from "@/app/(templates)/court-of-love/components/CourtOfLove";
import { dbToCourtOfLoveData } from "@/app/(templates)/court-of-love/components/types";
import { API_URL, IS_NGROK } from "@/lib/config";

// The shared page lives in the /[id] route group, so it never sees the template
// layout's fonts — and the root layout doesn't carry these two. Declared here, the
// same way ChristianWeddingViewer does it. (Inter comes from the root layout.)
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-space-grotesk" });
const caveat = Caveat({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-caveat" });
const FONT_VARS = `${spaceGrotesk.variable} ${caveat.variable}`;

const SURFACE = "#FFFFFF";
const BG_ALT = "#F3F1EA";
const TEXT = "#0E0E12";
const MUTED = "#5B5B66";
const BORDER = "#ECEAE3";
const PINK = "#F72585";
const LIME = "#C6FF3D";

const HEAD = "var(--font-space-grotesk), ui-sans-serif, system-ui, sans-serif";
const BODY = "var(--font-inter), ui-sans-serif, system-ui, sans-serif";

/* ─────────────────────────────────────────
   Password gate — "sealed case file"
───────────────────────────────────────── */
function CourtPasswordGate({ shareId, onUnlocked }: { shareId: string; onUnlocked: () => void }) {
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = useCallback(async () => {
    if (!pw.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/court-of-love-pages/share/${shareId}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
        },
        body: JSON.stringify({ password: pw }),
      });
      const result = await res.json();
      if (result.success && result.verified) {
        sessionStorage.setItem(`court_of_love_unlocked_${shareId}`, "true");
        onUnlocked();
      } else {
        setError("Wrong password. Objection sustained!");
        setPw("");
      }
    } catch {
      setError("Something went wrong. Try again!");
    } finally {
      setLoading(false);
    }
  }, [pw, shareId, onUnlocked]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        background: "#FAFAF7",
        backgroundImage: `
          radial-gradient(60% 44% at 6% 2%, rgba(108,92,231,.16), transparent 62%),
          radial-gradient(52% 40% at 96% 8%, rgba(247,37,133,.13), transparent 60%),
          radial-gradient(60% 44% at 50% 104%, rgba(198,255,61,.20), transparent 62%)
        `,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 26 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 360, damping: 26 }}
        style={{ width: "100%", maxWidth: 380 }}
      >
        <div
          style={{
            background: SURFACE,
            border: `1px solid ${BORDER}`,
            borderRadius: 28,
            overflow: "hidden",
            boxShadow: "0 40px 80px -20px rgba(14,14,18,.38)",
          }}
        >
          <div style={{ height: 4, background: "linear-gradient(90deg,#6C5CE7,#F72585)" }} />
          <div style={{ padding: "30px 26px 26px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  width: 62,
                  height: 62,
                  borderRadius: 20,
                  display: "grid",
                  placeItems: "center",
                  marginBottom: 14,
                  background: "linear-gradient(135deg,#6C5CE7,#F72585)",
                  boxShadow: "0 14px 30px rgba(108,92,231,.34)",
                }}
              >
                <Lock size={26} color="#fff" />
              </motion.div>
              <div style={{ fontSize: 26, marginBottom: 8 }}>⚖️</div>
              <h1
                style={{
                  fontFamily: HEAD,
                  fontSize: 20,
                  fontWeight: 700,
                  color: TEXT,
                  textAlign: "center",
                  margin: "0 0 6px",
                  letterSpacing: -0.4,
                }}
              >
                This case file is sealed
              </h1>
              <p
                style={{
                  fontFamily: BODY,
                  fontSize: 12.5,
                  lineHeight: 1.6,
                  color: MUTED,
                  textAlign: "center",
                  margin: 0,
                }}
              >
                Enter the password to open
                <br />
                The Court of Love
              </p>
            </div>

            <div style={{ position: "relative", marginBottom: 14 }}>
              <input
                type={showPw ? "text" : "password"}
                value={pw}
                onChange={(e) => { setPw(e.target.value); setError(""); }}
                onKeyDown={(e) => { if (e.key === "Enter") handleVerify(); }}
                placeholder="Enter password…"
                autoFocus
                autoComplete="off"
                style={{
                  width: "100%",
                  padding: "14px 44px 14px 15px",
                  borderRadius: 18,
                  background: BG_ALT,
                  border: `1px solid ${error ? "#E5484D" : BORDER}`,
                  boxShadow: error ? "0 0 0 3px rgba(229,72,77,.13)" : "none",
                  fontFamily: BODY,
                  fontSize: 14.5,
                  color: TEXT,
                  outline: "none",
                  minHeight: 48,
                }}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "Hide password" : "Show password"}
                style={{
                  position: "absolute",
                  right: 13,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: MUTED,
                  cursor: "pointer",
                  padding: 2,
                }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  role="alert"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    fontFamily: BODY,
                    fontSize: 12,
                    color: "#E5484D",
                    marginBottom: 14,
                  }}
                >
                  <ShieldAlert size={12} />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleVerify}
              disabled={loading || !pw.trim()}
              style={{
                width: "100%",
                padding: "14px 20px",
                borderRadius: 999,
                background: LIME,
                color: TEXT,
                fontFamily: HEAD,
                fontSize: 15,
                fontWeight: 700,
                border: "none",
                boxShadow: "0 8px 22px rgba(198,255,61,.45)",
                cursor: loading || !pw.trim() ? "default" : "pointer",
                opacity: loading || !pw.trim() ? 0.45 : 1,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                minHeight: 50,
              }}
            >
              {loading ? (
                <><Loader2 size={15} className="animate-spin" /> Verifying…</>
              ) : (
                <><Lock size={15} /> Open the case file</>
              )}
            </motion.button>

            <p
              style={{
                fontFamily: BODY,
                fontSize: 11,
                color: MUTED,
                textAlign: "center",
                margin: "13px 0 0",
              }}
            >
              Sent to you by someone who <span style={{ color: PINK }}>really</span> likes you.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Court of Love viewer (published page)
───────────────────────────────────────── */
export default function CourtOfLoveViewer({
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
    return sessionStorage.getItem(`court_of_love_unlocked_${shareId}`) === "true";
  });

  if (hasPassword && !unlocked) {
    return (
      <div className={FONT_VARS}>
        <CourtPasswordGate shareId={shareId} onUnlocked={() => setUnlocked(true)} />
      </div>
    );
  }

  const data = dbToCourtOfLoveData(rawData);

  return (
    <div className={FONT_VARS}>
      <CourtOfLove data={data} mode="live" shareId={shareId} />
    </div>
  );
}
