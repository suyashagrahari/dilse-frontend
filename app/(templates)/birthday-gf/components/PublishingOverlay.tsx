"use client";

import { motion, AnimatePresence } from "framer-motion";

export default function PublishingOverlay({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed", inset: 0, zIndex: 999,
            background: "rgba(93,63,49,0.75)", backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexDirection: "column", gap: 16,
          }}
        >
          <motion.span
            animate={{ scale: [1, 1.15, 1], rotate: [0, -5, 5, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            style={{ fontSize: 48, display: "inline-block" }}
          >
            🎂
          </motion.span>
          <p style={{
            fontFamily: "'Dancing Script', cursive",
            fontSize: 22, color: "#fff", fontWeight: 700,
            margin: 0, textAlign: "center",
            textShadow: "0 2px 8px rgba(0,0,0,0.25)",
          }}>
            Publishing your birthday page...
          </p>
          <p style={{
            fontFamily: "'Dancing Script', cursive",
            fontSize: 14, color: "rgba(255,255,255,0.70)",
            margin: 0,
          }}>
            Making it extra special 🎉
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
