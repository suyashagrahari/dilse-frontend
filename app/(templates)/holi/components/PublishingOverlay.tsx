"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

export default memo(function PublishingOverlay({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[70] flex flex-col items-center justify-center gap-4"
          style={{ background: "hsl(var(--holi-bg) / 0.9)", backdropFilter: "blur(12px)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Loader2 size={36} className="animate-spin" style={{ color: "var(--holi-pink)" }} />
          <p className="text-sm font-semibold" style={{ color: "hsl(var(--holi-fg))" }}>
            Publishing your Holi card...
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
