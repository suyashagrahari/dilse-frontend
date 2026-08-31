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
          className="fixed inset-0 z-[55] bg-black/30 dark:bg-black/50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl text-center border border-pink-200/40 dark:border-pink-900/30"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 mx-auto mb-4"
            >
              <Send size={28} className="text-pink-500 mx-auto" />
            </motion.div>
            <p className="font-bold text-sm">Publishing your love page...</p>
            <p className="text-xs text-muted-foreground mt-1">Making it live for your special someone</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
