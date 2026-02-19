"use client";

import { motion } from "framer-motion";
import { config } from "../config";

const pageVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.12 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};
const itemVariants = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

interface Props { body: string; senderName: string; }

export default function LetterPage({ body, senderName }: Props) {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className={`min-h-full bg-gradient-to-b ${config.bgGradient} flex flex-col items-center p-6 md:p-12`}>
      <motion.div variants={itemVariants} className="text-4xl mb-4 mt-8">{config.pages.letter.headerEmoji}</motion.div>
      <motion.h2 variants={itemVariants} className="text-xl md:text-2xl font-bold text-foreground mb-8 font-script">{config.pages.letter.title}</motion.h2>
      <motion.div variants={itemVariants} className="w-full max-w-lg rounded-3xl shadow-card p-8 md:p-10 relative bg-white/60 backdrop-blur-sm border border-red-100/50">
        <div className="absolute top-4 right-4 text-2xl opacity-30">{config.emoji}</div>
        <div className="absolute bottom-4 left-4 text-xl opacity-20">🌹</div>
        <p className="text-sm font-medium mb-4 font-script text-lg text-red-400/60">{config.pages.letter.greeting}</p>
        <p className="text-foreground/80 text-base md:text-lg leading-relaxed mb-8">{body}</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-[1px] bg-red-200/50" />
          <span className="text-sm font-script text-lg text-red-400/60">{senderName}</span>
          <div className="flex-1 h-[1px] bg-red-200/50" />
        </div>
      </motion.div>
      <motion.div variants={itemVariants} className="flex gap-3 mt-8">
        {config.pages.letter.decorEmojis.map((e, i) => (
          <motion.span key={i} className="text-2xl" animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}>{e}</motion.span>
        ))}
      </motion.div>
    </motion.div>
  );
}
