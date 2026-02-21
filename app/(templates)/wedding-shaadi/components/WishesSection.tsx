"use client";

import { useState, memo, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Heart, Sparkles } from "lucide-react";
import type { WeddingData, Wish } from "./types";
import { GLASS_CARD, GLASS_STRONG } from "./styles";

interface Props {
  data: WeddingData;
}

const WISH_COLORS = [
  { border: "var(--wed-rose)", bg: "rgba(199,125,125,0.08)", glow: "rgba(199,125,125,0.15)" },
  { border: "var(--wed-accent-gold)", bg: "rgba(184,134,11,0.08)", glow: "rgba(184,134,11,0.15)" },
  { border: "var(--wed-slate-blue)", bg: "rgba(123,143,168,0.08)", glow: "rgba(123,143,168,0.15)" },
  { border: "var(--wed-gold-light)", bg: "rgba(212,168,67,0.08)", glow: "rgba(212,168,67,0.15)" },
];

const WishesSection = memo(function WishesSection({ data }: Props) {
  const [wishes, setWishes] = useState<Wish[]>(data.wishes);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim() || !message.trim()) return;
      const newWish: Wish = { name: name.trim(), message: message.trim() };
      setWishes((prev) => [newWish, ...prev]);
      setName("");
      setMessage("");
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    },
    [name, message],
  );

  const wishList = useMemo(
    () =>
      wishes.map((wish, idx) => ({
        ...wish,
        color: WISH_COLORS[idx % WISH_COLORS.length],
      })),
    [wishes],
  );

  const inputStyle = useMemo(
    () =>
      ({
        background: "var(--wed-input-bg)",
        border: "1px solid var(--wed-input-border)",
        color: "hsl(var(--wed-fg))",
      }) as React.CSSProperties,
    [],
  );

  return (
    <section className="min-h-[calc(100vh-4rem)] lg:min-h-screen flex items-start lg:items-center py-10 lg:py-12 px-4">
      <div className="max-w-3xl mx-auto w-full">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles size={14} style={{ color: "var(--wed-accent-gold)" }} />
            <p
              className="text-[10px] md:text-xs tracking-[0.4em] uppercase"
              style={{ color: "var(--wed-accent-gold)" }}
            >
              Ashirvad
            </p>
            <Sparkles size={14} style={{ color: "var(--wed-accent-gold)" }} />
          </div>

          <h2
            className="text-3xl md:text-5xl mb-3"
            style={{ color: "hsl(var(--wed-fg))", fontFamily: "'Playfair Display', serif" }}
          >
            Blessings Wall
          </h2>

          <p
            className="text-sm italic"
            style={{ color: "hsl(var(--wed-muted-fg))", fontFamily: "'Cormorant Garamond', serif" }}
          >
            &ldquo;आशीर्वाद से बड़ा कोई उपहार नहीं&rdquo;
          </p>

          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="h-px w-10" style={{ background: "var(--wed-glass-border)" }} />
            <span className="text-sm" style={{ color: "var(--wed-accent-gold)" }}>🙏</span>
            <p className="text-xs" style={{ color: "hsl(var(--wed-muted-fg))" }}>
              {wishes.length} blessings received
            </p>
            <span className="text-sm" style={{ color: "var(--wed-accent-gold)" }}>🙏</span>
            <div className="h-px w-10" style={{ background: "var(--wed-glass-border)" }} />
          </div>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          className="rounded-2xl p-5 md:p-6 mb-6 relative overflow-hidden"
          style={GLASS_STRONG}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 50%, rgba(255,255,255,0.02) 100%)",
            }}
          />

          <div className="relative z-10 space-y-3">
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm placeholder:opacity-40 focus:outline-none focus:ring-1 transition-all"
              style={{
                ...inputStyle,
                // @ts-expect-error -- ring color
                "--tw-ring-color": "var(--wed-accent-gold)",
              }}
            />
            <textarea
              placeholder="Write your blessing..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 rounded-xl text-sm placeholder:opacity-40 focus:outline-none focus:ring-1 resize-none transition-all"
              style={{
                ...inputStyle,
                // @ts-expect-error -- ring color
                "--tw-ring-color": "var(--wed-accent-gold)",
              }}
            />
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.98] relative overflow-hidden"
              style={{
                background: "var(--wed-gradient-gold)",
                color: "var(--wed-accent-gold-fg)",
                boxShadow: "0 4px 20px var(--wed-gold-glow)",
              }}
            >
              <Send className="w-4 h-4" />
              Send Blessing
            </button>
          </div>
        </motion.form>

        <AnimatePresence>
          {sent && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="mb-4"
            >
              <div
                className="rounded-xl p-3 text-center text-xs font-medium"
                style={{
                  background: "rgba(184,134,11,0.1)",
                  border: "1px solid rgba(184,134,11,0.2)",
                  color: "var(--wed-accent-gold)",
                }}
              >
                Your blessing has been added! 🙏
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-3 max-h-[50vh] overflow-y-auto no-scrollbar pb-4">
          {wishList.map((wish, idx) => (
            <motion.div
              key={`${wish.name}-${idx}`}
              className="rounded-2xl p-4 relative overflow-hidden transition-all"
              style={{
                border: `1px solid ${wish.color.border}`,
                background: wish.color.bg,
                boxShadow: `0 2px 15px ${wish.color.glow}`,
              }}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.06, duration: 0.4 }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 60%)",
                }}
              />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: wish.color.glow }}
                  >
                    <Heart className="w-3 h-3" fill="currentColor" style={{ color: wish.color.border }} />
                  </div>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "hsl(var(--wed-fg))" }}
                  >
                    {wish.name}
                  </span>
                </div>
                <p
                  className="text-sm leading-relaxed pl-8"
                  style={{ color: "hsl(var(--wed-muted-fg))" }}
                >
                  {wish.message}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});

export default WishesSection;
