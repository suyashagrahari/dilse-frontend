"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Loader2 } from "lucide-react";

interface Props {
  visible: boolean;
  saving: boolean;
  onDiscard: () => void;
  onConfirm: () => void;
}

export default memo(function PreviewBar({ visible, saving, onDiscard, onConfirm }: Props) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3"
          style={{ background: "var(--holi-gradient-cta)" }}
          initial={{ y: -60 }}
          animate={{ y: 0 }}
          exit={{ y: -60 }}
        >
          <button onClick={onDiscard} className="flex items-center gap-1 text-sm font-semibold text-white">
            <X size={16} /> Discard
          </button>
          <span className="text-sm font-bold text-white">Preview Mode</span>
          <button
            onClick={onConfirm}
            disabled={saving}
            className="flex items-center gap-1 text-sm font-semibold disabled:opacity-50 text-white"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            Save
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
