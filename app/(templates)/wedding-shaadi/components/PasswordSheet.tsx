"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ShieldCheck, Eye, EyeOff, Loader2 } from "lucide-react";
import { GOLD_GRADIENT } from "./styles";

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
  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 dark:bg-black/60"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl shadow-2xl safe-bottom lg:left-1/2 lg:-translate-x-1/2 lg:max-w-xl"
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>
            <div className="px-5 pb-8 pt-2">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <ShieldCheck size={20} className="text-amber-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Protect Your Invitation?</h3>
                  <p className="text-xs text-muted-foreground">Add a password to keep it private</p>
                </div>
              </div>

              <div className="mt-5 bg-muted/30 rounded-2xl p-4 border border-border/50">
                <div className="flex items-center gap-2 mb-3">
                  <Lock size={14} className="text-muted-foreground" />
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Password (optional)
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showValue ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter a password..."
                    className="w-full px-4 py-3 pr-10 rounded-xl bg-background border border-border/50 focus:border-amber-300 dark:focus:border-amber-700 focus:outline-none text-sm transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowValue(!showValue)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground"
                  >
                    {showValue ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {password && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="text-[11px] text-amber-500 mt-2 flex items-center gap-1"
                  >
                    <Lock size={10} /> Remember to share this password with your guests!
                  </motion.p>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => onDone("")}
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl border border-border/60 text-sm font-semibold text-muted-foreground hover:bg-muted/30 transition-colors flex items-center justify-center gap-1.5"
                >
                  Skip
                </button>
                <button
                  onClick={() => onDone(password)}
                  disabled={saving || !password.trim()}
                  className="flex-1 py-3 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform disabled:opacity-50"
                  style={{ background: GOLD_GRADIENT }}
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                  {saving ? "Saving..." : "Set Password"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});
