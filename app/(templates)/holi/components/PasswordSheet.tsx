"use client";

import { memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";

interface Props {
  visible: boolean;
  saving: boolean;
  password: string;
  setPassword: (v: string) => void;
  showValue: boolean;
  setShowValue: (v: boolean) => void;
  onDone: (pw: string) => void;
}

export default memo(function PasswordSheet({ visible, saving, password, setPassword, showValue, setShowValue, onDone }: Props) {
  const handleSkip = useCallback(() => onDone(""), [onDone]);
  const handleSave = useCallback(() => onDone(password), [onDone, password]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <motion.div
            className="relative w-full max-w-md rounded-t-3xl lg:rounded-3xl p-6"
            style={{ background: "hsl(var(--holi-card))", border: "1px solid hsl(var(--holi-border))" }}
            initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--holi-pink)15" }}>
                <Lock size={18} style={{ color: "var(--holi-pink)" }} />
              </div>
              <div>
                <h3 className="font-bold" style={{ color: "hsl(var(--holi-fg))" }}>Password Protection</h3>
                <p className="text-xs" style={{ color: "hsl(var(--holi-muted-fg))" }}>Optional — skip if not needed</p>
              </div>
            </div>
            <div className="relative mb-5">
              <input
                type={showValue ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full px-4 py-3 pr-10 rounded-xl text-sm"
                style={{ background: "hsl(var(--holi-input))", border: "1px solid hsl(var(--holi-border))", color: "hsl(var(--holi-fg))" }}
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "hsl(var(--holi-muted-fg))" }} onClick={() => setShowValue(!showValue)}>
                {showValue ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="flex gap-3">
              <button onClick={handleSkip} disabled={saving} className="flex-1 py-3 rounded-xl text-sm font-semibold disabled:opacity-50" style={{ background: "hsl(var(--holi-surface))", color: "hsl(var(--holi-fg))", border: "1px solid hsl(var(--holi-border))" }}>
                Skip
              </button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: "var(--holi-gradient-cta)", color: "#fff" }}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
