"use client";

import { memo } from "react";
import { useDelayedVisible } from "@/hooks/useDelayedVisible";
import { motion, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";

const C_ACCENT = "#546B57";
const C_MED = "#7A9B7E";

interface Props {
  visible: boolean;
}

export default memo(function PublishingOverlay({ visible }: Props) {
  // Held back so a publish that resolves in a few milliseconds -- or a paywall
  // check that does -- never flashes a full-screen overlay. See the hook.
  const show = useDelayedVisible(visible);
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[55] flex items-center justify-center"
          style={{ background: "rgba(109,43,59,0.35)" }}
        >
          <motion.div
            initial={{ scale: 0.88, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.88, opacity: 0 }}
            className="rounded-3xl p-8 shadow-2xl text-center max-w-[280px] mx-4"
            style={{
              background: "rgba(255,250,248,0.96)",
              backdropFilter: "blur(16px)",
              border: `1px solid ${C_MED}35`,
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-2xl"
              style={{ background: `${C_ACCENT}12` }}
            >
              <Send size={26} style={{ color: C_ACCENT }} />
            </motion.div>
            <p className="font-bold text-sm" style={{ color: "#2D3E32" }}>
              Publishing your invitation…
            </p>
            <p className="text-xs mt-1" style={{ color: C_MED }}>
              Making it live for your guests
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
