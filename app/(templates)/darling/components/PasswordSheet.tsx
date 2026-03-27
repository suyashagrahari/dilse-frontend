"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ShieldCheck, Eye, EyeOff, Loader2 } from "lucide-react";

const ROSE = "rgb(201, 144, 106)";
const ROSE_DIM = "rgba(201, 144, 106, 0.55)";
const CURSIVE = "'Dancing Script', 'Brush Script MT', cursive";

interface Props {
  visible: boolean;
  saving: boolean;
  password: string;
  setPassword: (v: string) => void;
  showValue: boolean;
  setShowValue: (v: boolean) => void;
  onDone: (pw: string) => void;
}

export default memo(function PasswordSheet({ visible, saving, password, setPassword, showValue, setShowValue, onDone }: Props) {
  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(4,2,10,0.60)", backdropFilter: "blur(6px)" }}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
              position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
              background: "rgba(14, 7, 24, 0.98)",
              borderRadius: "20px 20px 0 0",
              boxShadow: "0 -12px 60px rgba(0,0,0,0.55)",
              border: "1px solid rgba(201,144,106,0.18)",
              borderBottom: "none",
            }}
          >
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, paddingBottom: 4 }}>
              <div style={{ width: 40, height: 4, borderRadius: 999, background: "rgba(201,144,106,0.25)" }} />
            </div>
            <div style={{ padding: "8px 20px 40px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: "rgba(201,144,106,0.10)",
                  border: "1px solid rgba(201,144,106,0.20)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <ShieldCheck size={20} style={{ color: ROSE }} />
                </div>
                <div>
                  <h3 style={{ fontFamily: CURSIVE, fontSize: 18, fontWeight: 700, color: ROSE, margin: 0 }}>
                    Protect Your Darling Page?
                  </h3>
                  <p style={{ fontFamily: CURSIVE, fontSize: 12, color: ROSE_DIM, margin: 0 }}>
                    Add a password to keep it private
                  </p>
                </div>
              </div>

              <div style={{
                marginTop: 20, background: "rgba(201,144,106,0.05)", borderRadius: 16,
                padding: 16, border: "1px solid rgba(201,144,106,0.15)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <Lock size={14} style={{ color: ROSE_DIM }} />
                  <label style={{ fontFamily: CURSIVE, fontSize: 11, fontWeight: 600, color: ROSE_DIM, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Password (optional)
                  </label>
                </div>
                <div style={{ position: "relative" }}>
                  <input
                    type={showValue ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter a password..."
                    style={{
                      width: "100%", padding: "12px 40px 12px 14px",
                      borderRadius: 12, border: `1px solid rgba(201,144,106,0.25)`,
                      background: "rgba(12, 6, 20, 0.80)", color: "rgb(250, 240, 230)",
                      fontFamily: CURSIVE, fontSize: 14, outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowValue(!showValue)}
                    style={{
                      position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                      border: "none", background: "transparent", cursor: "pointer", color: ROSE_DIM, padding: 0,
                    }}
                  >
                    {showValue ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {password && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    style={{ fontFamily: CURSIVE, fontSize: 11, color: ROSE, marginTop: 8, display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <Lock size={10} /> Remember to share this password with your special someone!
                  </motion.p>
                )}
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                <button
                  onClick={() => onDone("")}
                  disabled={saving}
                  style={{
                    flex: 1, padding: "13px 0", borderRadius: 12,
                    border: "1.5px solid rgba(201,144,106,0.25)", background: "transparent",
                    fontFamily: CURSIVE, fontSize: 14, fontWeight: 600, color: ROSE_DIM,
                    cursor: "pointer",
                  }}
                >
                  Skip
                </button>
                <button
                  onClick={() => onDone(password)}
                  disabled={saving || !password.trim()}
                  style={{
                    flex: 1, padding: "13px 0", borderRadius: 12, border: "none",
                    background: "linear-gradient(135deg, rgb(201,144,106) 0%, rgb(160,100,65) 100%)",
                    fontFamily: CURSIVE, fontSize: 14, fontWeight: 700, color: "#fff",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    opacity: saving || !password.trim() ? 0.5 : 1,
                    boxShadow: "0 4px 16px rgba(201,144,106,0.35)",
                  }}
                >
                  {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Lock size={14} />}
                  {saving ? "Saving..." : "Set Password"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});
