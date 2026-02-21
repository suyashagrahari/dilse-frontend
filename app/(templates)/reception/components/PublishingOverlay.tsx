"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";

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
          className="fixed inset-0 z-[55] bg-black/50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="rounded-3xl p-8 shadow-2xl text-center"
            style={{
              background: "rgba(8,8,8,0.95)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(201,168,76,0.15)",
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 mx-auto mb-4"
            >
              <Send size={28} className="mx-auto" style={{ color: "#C9A84C" }} />
            </motion.div>
            <p className="font-bold text-sm" style={{ color: "#F5F5F0" }}>Publishing your invitation...</p>
            <p className="text-xs mt-1" style={{ color: "hsl(0 0% 50%)" }}>Making it live for your guests</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
