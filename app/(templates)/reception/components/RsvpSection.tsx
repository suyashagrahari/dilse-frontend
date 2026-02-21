"use client";

import { memo, useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, PartyPopper } from "lucide-react";
import type { ReceptionData } from "./types";
import { REC_GLASS_STRONG, REC_INPUT } from "./styles";

interface Props {
  data: ReceptionData;
}

function ConfettiPiece({ delay }: { delay: number }) {
  const style = useMemo(() => {
    const colors = ["#C9A84C", "#E8D5A3", "#D4857A", "#6B7FA3", "#F5F5F0"];
    return {
      left: `${10 + Math.random() * 80}%`,
      background: colors[Math.floor(Math.random() * colors.length)],
      width: 6 + Math.random() * 4,
      height: 6 + Math.random() * 4,
      borderRadius: Math.random() > 0.5 ? "50%" : "2px",
    };
  }, []);

  return (
    <motion.div
      className="absolute top-0"
      style={style}
      initial={{ y: -20, opacity: 1, rotate: 0 }}
      animate={{
        y: "100vh",
        opacity: [1, 1, 0],
        rotate: Math.random() * 720 - 360,
        x: Math.random() * 100 - 50,
      }}
      transition={{ duration: 2 + Math.random() * 2, delay, ease: "easeIn" }}
    />
  );
}

const RsvpSection = memo(function RsvpSection({ data }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [guests, setGuests] = useState("1");
  const [dietary, setDietary] = useState("none");
  const [submitted, setSubmitted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setShowConfetti(true);
  }, []);

  useEffect(() => {
    if (showConfetti) {
      const t = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(t);
    }
  }, [showConfetti]);

  const confetti = useMemo(
    () => Array.from({ length: 40 }, (_, i) => ({ id: i, delay: Math.random() * 0.5 })),
    [],
  );

  const dateStr = useMemo(() => {
    const d = new Date(data.receptionDate);
    return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }, [data.receptionDate]);

  return (
    <section className="min-h-[calc(100vh-4rem)] lg:min-h-screen flex items-center py-10 lg:py-16 px-4 relative overflow-hidden">
      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
          {confetti.map((c) => (
            <ConfettiPiece key={c.id} delay={c.delay} />
          ))}
        </div>
      )}

      <div className="max-w-lg mx-auto w-full relative z-10">
        <motion.p
          className="text-[10px] md:text-xs tracking-[0.5em] uppercase text-center mb-2"
          style={{ color: "var(--rec-gold)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Join Us
        </motion.p>
        <motion.h2
          className="text-3xl md:text-5xl text-center mb-2"
          style={{ color: "#F5F5F0", fontFamily: "'Playfair Display', serif" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Will you join our celebration?
        </motion.h2>
        <motion.p
          className="text-sm text-center mb-8 italic"
          style={{
            color: "var(--rec-gold-light)",
            fontFamily: "'Cormorant Garamond', serif",
            opacity: 0.7,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 0.3 }}
        >
          {dateStr} &middot; {data.venue}
        </motion.p>

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              className="rounded-3xl p-10 text-center relative overflow-hidden"
              style={REC_GLASS_STRONG}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: "linear-gradient(135deg, var(--rec-gold-glow) 0%, transparent 50%)" }}
              />
              <div className="relative z-10">
                <motion.div
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{
                    background: "var(--rec-gradient-gold)",
                    boxShadow: "0 0 40px var(--rec-gold-glow)",
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                >
                  <PartyPopper className="w-8 h-8" style={{ color: "var(--rec-gold-fg)" }} />
                </motion.div>
                <h3
                  className="text-2xl mb-2"
                  style={{ color: "#F5F5F0", fontFamily: "'Playfair Display', serif" }}
                >
                  See you there! 🎊
                </h3>
                <p className="text-sm" style={{ color: "hsl(var(--rec-muted-fg))" }}>
                  Your RSVP has been received. We can&apos;t wait to celebrate with you!
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              className="rounded-3xl p-6 md:p-8 space-y-4 relative overflow-hidden"
              style={REC_GLASS_STRONG}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 50%)",
                }}
              />
              <div className="relative z-10 space-y-4">
                <div>
                  <label className="text-[10px] tracking-wider uppercase mb-1.5 block" style={{ color: "var(--rec-gold)" }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3.5 rounded-xl text-sm placeholder:opacity-35 focus:outline-none focus:ring-1 transition-all"
                    style={{ ...REC_INPUT, "--tw-ring-color": "var(--rec-gold)" } as React.CSSProperties}
                  />
                </div>

                <div>
                  <label className="text-[10px] tracking-wider uppercase mb-1.5 block" style={{ color: "var(--rec-gold)" }}>
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl text-sm placeholder:opacity-35 focus:outline-none focus:ring-1 transition-all"
                    style={REC_INPUT}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] tracking-wider uppercase mb-1.5 block" style={{ color: "var(--rec-gold)" }}>
                      Guests
                    </label>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl text-sm focus:outline-none focus:ring-1 transition-all"
                      style={REC_INPUT}
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n} Guest{n > 1 ? "s" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] tracking-wider uppercase mb-1.5 block" style={{ color: "var(--rec-gold)" }}>
                      Dietary
                    </label>
                    <select
                      value={dietary}
                      onChange={(e) => setDietary(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl text-sm focus:outline-none focus:ring-1 transition-all"
                      style={REC_INPUT}
                    >
                      <option value="none">No Preference</option>
                      <option value="veg">Vegetarian</option>
                      <option value="jain">Jain</option>
                      <option value="vegan">Vegan</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex items-center gap-2 mb-4">
                    <button
                      type="button"
                      className="w-5 h-5 rounded-md flex items-center justify-center transition-all"
                      style={{
                        background: "var(--rec-gradient-gold)",
                        boxShadow: "0 0 10px var(--rec-gold-glow)",
                      }}
                    >
                      <Check size={12} style={{ color: "var(--rec-gold-fg)" }} />
                    </button>
                    <span className="text-xs" style={{ color: "hsl(var(--rec-muted-fg))" }}>
                      I confirm my attendance for the Reception
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl font-semibold text-sm tracking-wider uppercase transition-all hover:scale-[1.01] active:scale-[0.98]"
                  style={{
                    background: "var(--rec-gradient-gold)",
                    color: "var(--rec-gold-fg)",
                    boxShadow: "0 4px 25px var(--rec-gold-glow)",
                  }}
                >
                  Confirm RSVP
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
});

export default RsvpSection;
