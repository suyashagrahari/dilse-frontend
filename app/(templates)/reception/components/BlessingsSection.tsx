"use client";

import { useState, memo, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Heart } from "lucide-react";
import type { ReceptionData, Wish } from "./types";
import { REC_INPUT } from "./styles";

interface Props {
  data: ReceptionData;
}

const CARD_STYLES = [
  { bg: "rgba(212,165,116,0.06)", border: "rgba(212,165,116,0.12)", accent: "var(--rec-accent)" },
  { bg: "rgba(196,166,181,0.06)", border: "rgba(196,166,181,0.12)", accent: "var(--rec-rose)" },
  { bg: "rgba(127,184,176,0.06)", border: "rgba(127,184,176,0.12)", accent: "var(--rec-sage)" },
  { bg: "rgba(232,203,174,0.05)", border: "rgba(232,203,174,0.1)", accent: "var(--rec-accent-light)" },
];

const BlessingsSection = memo(function BlessingsSection({ data }: Props) {
  const [wishes, setWishes] = useState<Wish[]>(data.wishes);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim() || !message.trim()) return;
      setWishes((prev) => [{ name: name.trim(), message: message.trim() }, ...prev]);
      setName("");
      setMessage("");
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    },
    [name, message],
  );

  const styledWishes = useMemo(
    () => wishes.map((w, i) => ({ ...w, style: CARD_STYLES[i % CARD_STYLES.length] })),
    [wishes],
  );

  return (
    <section className="min-h-screen flex items-start lg:items-center py-10 pt-20 lg:pt-24 px-4">
      <div className="max-w-2xl mx-auto w-full">
        <motion.div className="text-center mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[9px] md:text-[10px] tracking-[0.6em] uppercase mb-2" style={{ color: "var(--rec-accent)" }}>
            Ashirvad
          </p>
          <h2
            className="text-3xl md:text-5xl font-light mb-3"
            style={{ color: "hsl(var(--rec-fg))", fontFamily: "'Cormorant Garamond', serif" }}
          >
            Blessings Wall
          </h2>
          <p
            className="text-xs italic"
            style={{ color: "var(--rec-rose)", fontFamily: "'Cormorant Garamond', serif", opacity: 0.7 }}
          >
            &ldquo;Your blessings are our greatest treasure&rdquo;
          </p>
          <p className="text-[10px] mt-2" style={{ color: "hsl(var(--rec-muted-fg))" }}>
            {wishes.length} blessings received
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          className="rounded-2xl p-5 md:p-6 mb-6"
          style={{
            background: "hsl(var(--rec-surface))",
            border: "1px solid rgba(255,255,255,0.04)",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm placeholder:opacity-30 focus:outline-none focus:ring-1 transition-all"
              style={{ ...REC_INPUT, "--tw-ring-color": "var(--rec-accent)" } as React.CSSProperties}
            />
            <textarea
              placeholder="Write your blessing..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 rounded-xl text-sm placeholder:opacity-30 focus:outline-none focus:ring-1 resize-none transition-all"
              style={{ ...REC_INPUT, "--tw-ring-color": "var(--rec-accent)" } as React.CSSProperties}
            />
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.98]"
              style={{
                background: "var(--rec-gradient-accent)",
                color: "var(--rec-accent-fg)",
                boxShadow: "0 4px 20px var(--rec-accent-glow)",
              }}
            >
              <Send className="w-3.5 h-3.5" />
              Send Blessing
            </button>
          </div>
        </motion.form>

        <AnimatePresence>
          {sent && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4"
            >
              <div
                className="rounded-xl p-3 text-center text-xs"
                style={{
                  background: "rgba(127,184,176,0.08)",
                  border: "1px solid rgba(127,184,176,0.15)",
                  color: "var(--rec-sage)",
                }}
              >
                Your blessing has been added!
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2.5 max-h-[50vh] overflow-y-auto no-scrollbar pb-4">
          {styledWishes.map((wish, idx) => (
            <motion.div
              key={`${wish.name}-${idx}`}
              className="rounded-xl p-4"
              style={{
                background: wish.style.bg,
                border: `1px solid ${wish.style.border}`,
              }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Heart className="w-3 h-3" fill="currentColor" style={{ color: wish.style.accent }} />
                <span className="text-sm font-medium" style={{ color: "hsl(var(--rec-fg))" }}>
                  {wish.name}
                </span>
              </div>
              <p className="text-xs leading-relaxed pl-5" style={{ color: "hsl(var(--rec-muted-fg))" }}>
                {wish.message}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});

export default BlessingsSection;
