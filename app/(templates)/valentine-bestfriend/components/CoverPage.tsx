"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { config } from "../config";

const pageVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.12 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};
const itemVariants = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

interface Props {
  heading: string;
  onNext: () => void;
}

export default function CoverPage({ heading, onNext }: Props) {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className={`min-h-full bg-gradient-to-br ${config.bgGradient} flex flex-col items-center justify-center p-8 md:p-16 text-center relative overflow-hidden`}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {config.pages.cover.floatingEmojis.map((e, i) => (
          <motion.div key={i} className="absolute text-2xl md:text-3xl" style={{ top: `${12 + i * 18}%`, left: i % 2 === 0 ? `${8 + i * 5}%` : undefined, right: i % 2 !== 0 ? `${8 + i * 4}%` : undefined }} animate={{ y: [0, -20, 0], rotate: [0, i % 2 === 0 ? 10 : -10, 0], scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 3 + i * 0.5, delay: i * 0.3 }}>
            {e}
          </motion.div>
        ))}
      </div>
      <motion.div variants={itemVariants} className="text-7xl md:text-9xl mb-6 relative z-10">{config.emoji}</motion.div>
      <motion.h1 variants={itemVariants} className="text-3xl md:text-6xl font-bold text-foreground mb-4 font-script leading-snug relative z-10">{heading}</motion.h1>
      <motion.div variants={itemVariants} className="w-16 h-[2px] bg-foreground/20 rounded-full mx-auto mb-6" />
      <motion.p variants={itemVariants} className="text-sm md:text-base text-foreground/50 font-medium relative z-10">{config.pages.cover.subtitle}</motion.p>
      <motion.button variants={itemVariants} onClick={onNext} className="mt-8 flex flex-col items-center gap-1 text-foreground/40 hover:text-foreground/60 transition-colors relative z-10">
        <span className="text-xs font-medium">{config.pages.cover.ctaText}</span>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}><ChevronDown size={20} /></motion.div>
      </motion.button>
    </motion.div>
  );
}
