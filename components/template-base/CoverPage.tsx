"use client";

import { motion } from "framer-motion";
import { ChevronDown, Star } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";

const pageVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.12 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};
const itemVariants = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

interface Props {
  bgGradient: string;
  emoji: string;
  heading: string;
  config: TemplatePageConfig;
  onNext: () => void;
}

function FloatingCircles() {
  return (
    <>
      <div className="absolute top-16 left-8 w-16 h-16 rounded-full bg-white/20 animate-float" />
      <div className="absolute top-32 right-12 w-10 h-10 rounded-full bg-primary/10 animate-float-delay" />
      <div className="absolute bottom-40 left-16 w-12 h-12 rounded-full bg-white/15 animate-float" />
      <div className="absolute bottom-24 right-8 w-20 h-20 rounded-full bg-primary/5 animate-float-delay" />
      <div className="absolute top-1/2 left-6 w-8 h-8 rounded-full bg-white/10 animate-pulse-soft" />
    </>
  );
}

function FloatingHearts({ emojis }: { emojis: string[] }) {
  return (
    <>
      {emojis.map((e, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl md:text-3xl"
          style={{
            top: `${12 + i * 18}%`,
            left: i % 2 === 0 ? `${8 + i * 5}%` : undefined,
            right: i % 2 !== 0 ? `${8 + i * 4}%` : undefined,
          }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, i % 2 === 0 ? 10 : -10, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{ repeat: Infinity, duration: 3 + i * 0.5, delay: i * 0.3 }}
        >
          {e}
        </motion.div>
      ))}
    </>
  );
}

function FloatingStars() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ top: `${15 + i * 16}%`, left: `${10 + (i % 3) * 30}%` }}
          animate={{ y: [0, -12, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{ repeat: Infinity, duration: 3 + i * 0.4, delay: i * 0.3 }}
        >
          <Star size={10 + i * 3} className="text-primary/20 fill-primary/10" />
        </motion.div>
      ))}
    </>
  );
}

export default function CoverPage({ bgGradient, emoji, heading, config, onNext }: Props) {
  const { floatStyle, pages } = config;

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`min-h-full bg-gradient-to-br ${bgGradient} flex flex-col items-center justify-center p-8 md:p-16 text-center relative overflow-hidden`}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {floatStyle === "circles" && <FloatingCircles />}
        {floatStyle === "hearts" && <FloatingHearts emojis={pages.cover.floatingEmojis} />}
        {floatStyle === "stars" && <FloatingStars />}
      </div>

      <motion.div variants={itemVariants} className="text-7xl md:text-9xl mb-6 relative z-10">
        {emoji}
      </motion.div>

      <motion.h1
        variants={itemVariants}
        className="text-3xl md:text-6xl font-bold text-foreground mb-4 font-script leading-snug relative z-10"
      >
        {heading}
      </motion.h1>

      <motion.div
        variants={itemVariants}
        className="w-16 h-[2px] bg-foreground/20 rounded-full mx-auto mb-6"
      />

      <motion.p
        variants={itemVariants}
        className="text-sm md:text-base text-foreground/50 font-medium relative z-10"
      >
        {pages.cover.subtitle}
      </motion.p>

      <motion.button
        variants={itemVariants}
        onClick={onNext}
        className="mt-8 flex flex-col items-center gap-1 text-foreground/40 hover:text-foreground/60 transition-colors relative z-10"
      >
        <span className="text-xs font-medium">{pages.cover.ctaText}</span>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
          <ChevronDown size={20} />
        </motion.div>
      </motion.button>
    </motion.div>
  );
}
