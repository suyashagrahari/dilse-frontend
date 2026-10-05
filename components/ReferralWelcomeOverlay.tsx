"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Star, X, ArrowRight, Check, Sparkles } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import { useAppSelector } from "@/store/hooks";
import { API_URL, IS_NGROK } from "@/lib/config";

function apiHeaders(): Record<string, string> {
  const h: Record<string, string> = {};
  if (IS_NGROK) h["ngrok-skip-browser-warning"] = "true";
  return h;
}

function ReferralWelcomeInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);

  const [show, setShow] = useState(false);
  const [refCode, setRefCode] = useState<string | null>(null);
  const [referrerName, setReferrerName] = useState<string | null>(null);
  const [referrerAvatar, setReferrerAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (!ref || dismissed) return;

    const code = ref.toUpperCase().trim();
    setRefCode(code);

    // Fetch referrer name
    setLoading(true);
    fetch(`${API_URL}/referral/by-code/${encodeURIComponent(code)}`, { headers: apiHeaders() })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && !d.data.isInfluencer) {
          setReferrerName(d.data.name);
          setReferrerAvatar(d.data.avatar || null);
          setShow(true);
        }
      })
      .catch(() => {/* invalid code, don't show overlay */})
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
  };

  const handleAuthSuccess = () => {
    setShowAuth(false);
    setShow(false);
    setDismissed(true);
    router.push("/");
  };

  if (loading) return null;
  if (!show || !refCode || !referrerName) return null;

  const firstName = referrerName.split(" ")[0];
  const getInitials = (name: string) =>
    name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  // --- Already logged in ---
  if (isAuthenticated) {
    return (
      <AnimatePresence>
        <motion.div
          key="already-member"
          initial={{ opacity: 0, y: -60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -60 }}
          transition={{ type: "spring", stiffness: 340, damping: 28 }}
          style={{
            position: "fixed",
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            background: "linear-gradient(135deg, #3d0c11 0%, #5a1520 100%)",
            border: "1px solid rgba(242,207,116,0.45)",
            borderRadius: 20,
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            boxShadow: "0 12px 40px rgba(61,12,17,0.4)",
            minWidth: 280,
            maxWidth: "90vw",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "rgba(242,207,116,0.15)",
              border: "1px solid rgba(242,207,116,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Check size={16} style={{ color: "#f2cf74" }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ color: "#f2cf74", fontWeight: 700, fontSize: 13, margin: 0, lineHeight: 1.3 }}>
              You&apos;re already a SubhSandesh member!
            </p>
            <p style={{ color: "rgba(242,207,116,0.65)", fontSize: 11, margin: "2px 0 0" }}>
              Hi {user?.name?.split(" ")[0]}, welcome back 👋
            </p>
          </div>
          <button
            onClick={handleDismiss}
            style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(242,207,116,0.5)", padding: 4, flexShrink: 0 }}
          >
            <X size={14} />
          </button>
        </motion.div>
      </AnimatePresence>
    );
  }

  // --- Not logged in: full referral welcome overlay ---
  return (
    <>
      <AnimatePresence>
        {show && !showAuth && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 9990,
                background: "rgba(20,4,6,0.72)",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
              }}
            />

            {/* Main card */}
            <motion.div
              key="referral-card"
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 30 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 9991,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px 16px",
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: 420,
                  background: "linear-gradient(180deg, #fbf6f1 0%, #f5ede6 100%)",
                  borderRadius: 28,
                  overflow: "hidden",
                  boxShadow: "0 32px 80px rgba(61,12,17,0.35), 0 0 0 1px rgba(61,12,17,0.12)",
                  position: "relative",
                }}
              >
                {/* Close button */}
                <button
                  onClick={handleDismiss}
                  style={{
                    position: "absolute",
                    top: 14,
                    right: 14,
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: "rgba(61,12,17,0.08)",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "rgba(61,12,17,0.45)",
                    zIndex: 1,
                  }}
                >
                  <X size={14} />
                </button>

                {/* Dark header */}
                <div
                  style={{
                    background: "linear-gradient(135deg, #3d0c11 0%, #5a1520 60%, #2a0709 100%)",
                    padding: "32px 28px 28px",
                    textAlign: "center",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Decorative stars */}
                  {[
                    { top: 12, left: 20, size: 10, delay: 0 },
                    { top: 20, right: 24, size: 8, delay: 0.3 },
                    { bottom: 18, left: 36, size: 7, delay: 0.6 },
                    { bottom: 14, right: 40, size: 9, delay: 0.15 },
                  ].map((s, i) => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.4, 0.9, 0.4], scale: [0.9, 1.1, 0.9] }}
                      transition={{ duration: 2.4, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
                      style={{
                        position: "absolute",
                        top: s.top,
                        left: (s as {left?: number}).left,
                        right: (s as {right?: number}).right,
                        bottom: s.bottom,
                      }}
                    >
                      <Star size={s.size} style={{ color: "rgba(242,207,116,0.6)", fill: "rgba(242,207,116,0.3)" }} />
                    </motion.div>
                  ))}

                  {/* Gift icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.15 }}
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      background: "rgba(242,207,116,0.15)",
                      border: "1px solid rgba(242,207,116,0.35)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 16px",
                    }}
                  >
                    <Gift size={28} style={{ color: "#f2cf74" }} />
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.22 }}
                    style={{
                      color: "rgba(242,207,116,0.7)",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.25em",
                      textTransform: "uppercase",
                      margin: "0 0 8px",
                    }}
                  >
                    You&apos;ve been invited
                  </motion.p>

                  <motion.h2
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.28 }}
                    style={{
                      color: "#f5ede6",
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "clamp(22px, 5vw, 28px)",
                      fontWeight: 700,
                      margin: 0,
                      lineHeight: 1.25,
                    }}
                  >
                    {firstName} invited you to
                    <br />
                    <span style={{ color: "#f2cf74" }}>SubhSandesh</span>
                  </motion.h2>
                </div>

                {/* Body */}
                <div style={{ padding: "24px 28px 28px" }}>

                  {/* Referrer avatar row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 20,
                      padding: "12px 16px",
                      background: "rgba(255,255,255,0.7)",
                      borderRadius: 16,
                      border: "1px solid rgba(61,12,17,0.1)",
                    }}
                  >
                    {referrerAvatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={referrerAvatar}
                        alt={referrerName}
                        style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, #c9a84c, #f2cf74)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          fontWeight: 800,
                          fontSize: 15,
                          color: "#2a0a0e",
                        }}
                      >
                        {getInitials(referrerName)}
                      </div>
                    )}
                    <div>
                      <p style={{ color: "#2a0a0e", fontWeight: 700, fontSize: 14, margin: 0 }}>{referrerName}</p>
                      <p style={{ color: "#7a5555", fontSize: 11, margin: "2px 0 0" }}>is already celebrating on SubhSandesh</p>
                    </div>
                  </div>

                  {/* Points reward */}
                  <div
                    style={{
                      background: "rgba(201,168,76,0.08)",
                      border: "1px solid rgba(201,168,76,0.28)",
                      borderRadius: 16,
                      padding: "14px 16px",
                      marginBottom: 20,
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        background: "rgba(201,168,76,0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Sparkles size={18} style={{ color: "#c9a84c" }} />
                    </div>
                    <div>
                      <p style={{ color: "#2a0a0e", fontWeight: 700, fontSize: 13, margin: 0 }}>
                        Both of you get <span style={{ color: "#c9a84c" }}>100 points</span> free
                      </p>
                      <p style={{ color: "#7a5555", fontSize: 11, margin: "2px 0 0" }}>
                        Points unlock templates &amp; exclusive features
                      </p>
                    </div>
                  </div>

                  {/* CTA button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAuth(true)}
                    style={{
                      width: "100%",
                      background: "linear-gradient(135deg, #3d0c11 0%, #5a1520 100%)",
                      color: "#f5ede6",
                      border: "none",
                      borderRadius: 14,
                      padding: "15px 20px",
                      fontSize: 14,
                      fontWeight: 700,
                      letterSpacing: "0.04em",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      boxShadow: "0 8px 24px rgba(61,12,17,0.28)",
                      marginBottom: 12,
                    }}
                  >
                    Create Account &amp; Claim 100 Points
                    <ArrowRight size={16} />
                  </motion.button>

                  <button
                    onClick={handleDismiss}
                    style={{
                      width: "100%",
                      background: "none",
                      border: "none",
                      color: "#9a7070",
                      fontSize: 12,
                      cursor: "pointer",
                      padding: "6px 0",
                    }}
                  >
                    Maybe later
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      {showAuth && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9995 }}>
          <AuthModal
            onClose={() => setShowAuth(false)}
            onSuccess={handleAuthSuccess}
            defaultMode="register"
          />
        </div>
      )}
    </>
  );
}

export default function ReferralWelcomeOverlay() {
  return (
    <Suspense fallback={null}>
      <ReferralWelcomeInner />
    </Suspense>
  );
}
