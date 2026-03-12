"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function AppLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [showInitialLoader, setShowInitialLoader] = useState(false);

  useEffect(() => {
    if (!isHome) return;

    const key = "subhsandesh_first_loader_seen";
    const alreadySeen = sessionStorage.getItem(key) === "1";
    if (alreadySeen) return;

    setShowInitialLoader(true);
    const minVisibleMs = 1900;
    const startAt = Date.now();

    const closeLoader = () => {
      const elapsed = Date.now() - startAt;
      const remaining = Math.max(0, minVisibleMs - elapsed);
      window.setTimeout(() => {
        setShowInitialLoader(false);
        sessionStorage.setItem(key, "1");
      }, remaining);
    };

    if (document.readyState === "complete") {
      closeLoader();
    } else {
      window.addEventListener("load", closeLoader, { once: true });
      return () => window.removeEventListener("load", closeLoader);
    }
  }, [isHome]);

  useEffect(() => {
    if (!showInitialLoader) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [showInitialLoader]);

  return (
    <div className={isHome ? "" : "pb-24 md:pb-0"}>
      {children}
      {showInitialLoader && (
        <div
          aria-live="polite"
          aria-label="Loading SubhSandesh"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "grid",
            placeItems: "center",
            background: "linear-gradient(180deg, #faf3ee 0%, #f5ede6 55%, #efe3d3 100%)",
          }}
        >
          <div style={{ textAlign: "center", padding: 24 }}>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              style={{
                margin: 0,
                color: "#2a0a0e",
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(44px, 10vw, 74px)",
                fontWeight: 700,
                lineHeight: 1.02,
                letterSpacing: "-0.02em",
              }}
            >
              SubhSandesh
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              style={{
                margin: "6px 0 0",
                color: "#c9a84c",
                fontSize: "clamp(12px, 3.2vw, 18px)",
                letterSpacing: "0.22em",
                fontWeight: 700,
              }}
            >
              DIGITAL CELEBRATIONS
            </motion.p>
            <motion.p
              animate={{ opacity: [0.65, 1, 0.65], y: [0, -2, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
              style={{
                margin: "18px 0 0",
                color: "#c9a84c",
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(30px, 7vw, 44px)",
                fontStyle: "italic",
              }}
            >
              शुभ संदेश
            </motion.p>
            <div style={{ marginTop: 18, display: "flex", justifyContent: "center", gap: 12 }}>
              {["01", "02", "03"].map((n, i) => (
                <motion.span
                  key={n}
                  animate={{
                    opacity: [0.35, 1, 0.35],
                    y: [0, -2, 0],
                    borderColor: [
                      "rgba(61,12,17,0.16)",
                      "rgba(201,168,76,0.65)",
                      "rgba(61,12,17,0.16)",
                    ],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.4,
                    delay: i * 0.2,
                    ease: "easeInOut",
                  }}
                  style={{
                    display: "inline-flex",
                    width: 42,
                    height: 42,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 999,
                    border: "1px solid rgba(61,12,17,0.16)",
                    background: "rgba(255,255,255,0.55)",
                    color: "#7f5f5f",
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                  }}
                >
                  {n}
                </motion.span>
              ))}
            </div>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2 }}
              style={{
                margin: "14px 0 0",
                color: "#9a7070",
                fontSize: "clamp(12px, 3.3vw, 15px)",
                letterSpacing: "0.04em",
              }}
            >
              Preparing your celebration experience...
            </motion.p>
          </div>
        </div>
      )}
    </div>
  );
}
