"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";

const ROSE = "rgb(201, 144, 106)";
const CURSIVE = "'Dancing Script', 'Brush Script MT', cursive";

interface Props {
  visible: boolean;
}

export default memo(function PublishingOverlay({ visible }: Props) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed", inset: 0, zIndex: 55,
            background: "rgba(4, 2, 10, 0.55)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            style={{
              background: "rgba(14, 7, 24, 0.98)",
              backdropFilter: "blur(20px)",
              borderRadius: 24,
              padding: "32px 40px",
              boxShadow: "0 24px 80px rgba(0,0,0,0.60)",
              border: "1px solid rgba(201,144,106,0.20)",
              textAlign: "center",
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              style={{ width: 48, height: 48, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <Send size={28} style={{ color: ROSE }} />
            </motion.div>
            <p style={{ fontFamily: CURSIVE, fontSize: 16, fontWeight: 700, color: ROSE, margin: "0 0 4px" }}>
              Publishing your darling page...
            </p>
            <p style={{ fontFamily: CURSIVE, fontSize: 12, color: "rgba(201,144,106,0.55)", margin: 0 }}>
              Making it live for your special someone
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
