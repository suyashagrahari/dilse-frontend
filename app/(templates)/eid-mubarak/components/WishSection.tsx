"use client";

import { memo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Heart, ChevronRight } from "lucide-react";
import Image from "next/image";
import type { EidData } from "./types";

const EID_QUOTES = [
  "May Allah's blessings be with you today and always.",
  "Eid is a time of joy, a time of togetherness, a time to remember Allah's blessings.",
  "May the magic of this Eid bring lots of happiness in your life.",
  "Wishing you love, peace, and happiness on this blessed day.",
  "May the blessings of Allah fill your life with happiness and open all doors of success.",
];

const SPARKLES_DATA = [
  { emoji: "✨", left: 10, top: 18, delay: 0 },
  { emoji: "🌙", left: 85, top: 12, delay: 0.5 },
  { emoji: "⭐", left: 8, top: 55, delay: 1.2 },
  { emoji: "✨", left: 90, top: 58, delay: 0.8 },
  { emoji: "🌙", left: 15, top: 82, delay: 1.5 },
  { emoji: "⭐", left: 78, top: 80, delay: 0.3 },
];

interface WishProps {
  data: EidData;
  onGoGreetings?: () => void;
}

const WishSection = memo(function WishSection({ data, onGoGreetings }: WishProps) {
  const [quoteIdx, setQuoteIdx] = useState(0);

  useEffect(() => {
    const iv = setInterval(
      () => setQuoteIdx((i) => (i + 1) % EID_QUOTES.length),
      6000
    );
    return () => clearInterval(iv);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-screen flex flex-col relative overflow-y-auto overflow-x-hidden"
    >
      {/* Full background with eid-family-wish */}
      <div className="absolute inset-0">
        <Image
          src="/assets/Eid/eid-family-wish.png"
          alt="Eid Mubarak"
          fill
          className="object-cover object-top"
          priority
          sizes="100vw"
          style={{ opacity: 0.12 }}
        />
      </div>
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, hsl(var(--eid-bg) / 0.4) 0%, hsl(var(--eid-bg) / 0.55) 30%, hsl(var(--eid-bg) / 0.5) 60%, hsl(var(--eid-bg) / 0.65) 85%, hsl(var(--eid-bg) / 0.8) 100%)",
        }}
      />

      {/* Floating sparkles */}
      {SPARKLES_DATA.map((s, i) => (
        <span
          key={i}
          className="absolute pointer-events-none text-xl eid-sparkle-float"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            animationDelay: `${s.delay}s`,
          }}
        >
          {s.emoji}
        </span>
      ))}

      <div
        className="absolute top-[6%] left-1/2 -translate-x-1/2 w-80 h-80 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(197,160,63,0.12) 0%, transparent 70%)",
        }}
      />

      {/* Content */}
      <div className="flex-1 flex flex-col items-center relative z-10 px-5 pt-8 pb-28 lg:pb-10 lg:max-w-2xl lg:mx-auto lg:w-full">
        {/* Eid Mubarak badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2 mb-4"
        >
          <span className="text-lg">🌙</span>
          <p
            className="text-[10px] font-bold uppercase tracking-[0.2em]"
            style={{ color: "var(--eid-gold)" }}
          >
            Eid Mubarak
          </p>
          <span className="text-lg">🌙</span>
        </motion.div>

        {/* Urdu Title */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl sm:text-4xl lg:text-5xl mb-1 text-center"
          dir="rtl"
          lang="ur"
          style={{
            color: "var(--eid-gold)",
            fontFamily: "'Noto Nastaliq Urdu', serif",
          }}
        >
          عید مبارک
        </motion.h1>

        {/* Sender name */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-base sm:text-lg font-bold text-center mb-4"
          style={{ color: "hsl(var(--eid-fg))" }}
        >
          {data.senderName}
        </motion.p>

        {/* Photo */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 18,
            delay: 0.35,
          }}
          className="relative mb-5"
        >
          <div
            className="absolute -inset-3 rounded-full"
            style={{
              border: "2px dashed rgba(197,160,63,0.2)",
              animation: "eid-ring-rotate 12s linear infinite",
            }}
          />
          <div
            className="absolute -inset-1.5 rounded-full"
            style={{
              background:
                "linear-gradient(135deg, var(--eid-gold), var(--eid-teal), var(--eid-gold))",
              padding: "3px",
              WebkitMask:
                "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
            }}
          />

          <div
            className="w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden relative shadow-2xl"
            style={{
              boxShadow:
                "0 0 40px rgba(197,160,63,0.25), 0 0 80px rgba(197,160,63,0.1)",
            }}
          >
            {data.senderPhoto ? (
              <Image
                src={data.senderPhoto}
                alt={data.senderName}
                fill
                className="object-cover"
                sizes="128px"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-4xl"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(58,143,125,0.2), rgba(197,160,63,0.15))",
                }}
              >
                🌙
              </div>
            )}
          </div>

          <motion.span
            animate={{ y: [-4, 4, -4], x: [-2, 2, -2] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -top-2 -right-1 text-base drop-shadow"
          >
            ✨
          </motion.span>
          <motion.span
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-1/2 -right-4 text-sm drop-shadow"
          >
            ⭐
          </motion.span>
        </motion.div>

        {/* Family subtitle */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="flex items-center gap-2 mb-2"
        >
          <div
            className="h-px w-8"
            style={{ background: "rgba(197,160,63,0.3)" }}
          />
          <p
            className="text-xs font-medium flex items-center gap-1.5"
            style={{ color: "hsl(var(--eid-muted-fg))" }}
          >
            {data.senderFamily || "Eid Mubarak"}{" "}
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ color: "var(--eid-gold)" }}
            >
              <Heart size={10} className="fill-current" />
            </motion.span>
          </p>
          <div
            className="h-px w-8"
            style={{ background: "rgba(197,160,63,0.3)" }}
          />
        </motion.div>

        {/* Family member pills */}
        {data.senderMembers.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-1.5 mb-5"
          >
            {data.senderMembers.map((m, i) => (
              <span
                key={i}
                className="text-[10px] px-2.5 py-1 rounded-full font-medium backdrop-blur-md"
                style={{
                  background: "rgba(58,143,125,0.1)",
                  color: "var(--eid-teal)",
                  border: "1px solid rgba(58,143,125,0.2)",
                }}
              >
                {m.name} &bull; {m.relation}
              </span>
            ))}
          </motion.div>
        )}

        {/* Message — directly on the page */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="w-full max-w-sm lg:max-w-lg mb-4"
        >
          <motion.span
            className="block text-center text-sm mb-2"
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            style={{ color: "var(--eid-gold)", opacity: 0.5 }}
          >
            <Sparkles size={14} className="mx-auto" />
          </motion.span>

          <p
            className="text-sm leading-relaxed text-center mb-3"
            style={{
              color: "hsl(var(--eid-fg) / 0.8)",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {data.congratsMessage}
          </p>

          <p
            className="text-sm leading-relaxed text-center"
            style={{
              color: "hsl(var(--eid-fg) / 0.7)",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Every moment we share becomes a treasure I hold close to my heart.
            Thank you for being the reason I smile every single day.
          </p>
        </motion.div>

        {/* Signature */}
        <div
         
          className="w-full max-w-sm lg:max-w-md px-5 py-3 mb-5 text-center"
         
        >
          <p
            className="text-sm italic font-semibold"
            style={{ color: "var(--eid-gold)" }}
          >
            With all my love,
          </p>
          <p
            className="text-xs font-bold mt-0.5"
            style={{ color: "hsl(var(--eid-fg))" }}
          >
            {data.senderName} 🌙
          </p>
        </div>

        {/* Rotating quote */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.75 }}
          className="mb-5"
        >
          <p
            className="text-[11px] lg:text-sm italic text-center"
            style={{ color: "hsl(var(--eid-muted-fg))" }}
          >
            &ldquo;{EID_QUOTES[quoteIdx]}&rdquo;{" "}
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="inline-block"
            >
              🌙
            </motion.span>
          </p>
        </motion.div>

        {/* Single CTA button */}
        {onGoGreetings && (
          <motion.button
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.85 }}
            onClick={onGoGreetings}
            className="inline-flex items-center justify-center gap-1.5 px-8 py-3 lg:py-3.5 rounded-2xl font-semibold text-xs lg:text-sm active:scale-95 transition-transform shadow-lg"
            style={{
              background: "var(--eid-gradient-gold)",
              color: "#1a1a2e",
              boxShadow: "0 6px 20px rgba(197,160,63,0.3)",
            }}
          >
            Explore Eid Greetings <ChevronRight size={14} />
          </motion.button>
        )}
      </div>

      <style jsx>{`
        .eid-sparkle-float {
          opacity: 0.15;
          animation: eidSparkleF 5s ease-in-out infinite;
        }
        @keyframes eidSparkleF {
          0%,
          100% {
            transform: translateY(0) scale(1);
            opacity: 0.15;
          }
          25% {
            transform: translateY(-12px) scale(1.15);
            opacity: 0.35;
          }
          50% {
            transform: translateY(-4px) scale(0.95);
            opacity: 0.2;
          }
          75% {
            transform: translateY(-16px) scale(1.1);
            opacity: 0.3;
          }
        }
        @keyframes eid-ring-rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </motion.div>
  );
});

export default WishSection;
