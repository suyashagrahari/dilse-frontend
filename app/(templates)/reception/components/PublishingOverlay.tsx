"use client";

import { memo } from "react";
import { useDelayedVisible } from "@/hooks/useDelayedVisible";
import { motion, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";

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
          className="fixed inset-0 z-[150] flex items-center justify-center"
          style={{ background: "rgba(46,34,22,0.35)", backdropFilter: "blur(4px)" }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="rounded-3xl p-8 shadow-2xl text-center"
            style={{
              background: "#FFFDF8",
              border: "1px solid #E6D7BC",
              boxShadow: "0 30px 60px -30px rgba(60,40,10,.5)",
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 mx-auto mb-4"
            >
              <Send size={28} className="mx-auto" style={{ color: "#B8892E" }} />
            </motion.div>
            <p className="font-bold text-sm" style={{ color: "#2E2216" }}>Publishing your invitation…</p>
            <p className="text-xs mt-1" style={{ color: "#6F5F4B" }}>Making it live for your guests</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
