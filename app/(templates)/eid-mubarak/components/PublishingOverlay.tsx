"use client";

import { memo } from "react";
import { useDelayedVisible } from "@/hooks/useDelayedVisible";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

export default memo(function PublishingOverlay({ visible }: { visible: boolean }) {
  // Held back so a publish that resolves in a few milliseconds -- or a paywall
  // check that does -- never flashes a full-screen overlay. See the hook.
  const show = useDelayedVisible(visible);
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[70] flex flex-col items-center justify-center gap-4"
          style={{ background: "hsl(var(--eid-bg) / 0.9)", backdropFilter: "blur(12px)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Loader2 size={36} className="animate-spin" style={{ color: "var(--eid-gold)" }} />
          <p className="text-sm font-semibold" style={{ color: "hsl(var(--eid-fg))" }}>
            Publishing your Eid card...
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
