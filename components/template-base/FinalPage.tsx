"use client";

import { motion } from "framer-motion";
import { Star, Heart } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";

const pageVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};
const itemVariants = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

interface Props {
  bgGradient: string;
  senderName: string;
  config: TemplatePageConfig;
}

function BirthdayBackground() {
  return (
    <>
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ top: `${15 + i * 15}%`, left: `${10 + (i % 3) * 35}%` }}
          animate={{ y: [0, -15, 0], opacity: [0.3, 0.7, 0.3], scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 3 + i * 0.5, delay: i * 0.4 }}
        >
          <Star size={12 + i * 3} className="text-primary/20 fill-primary/10" />
        </motion.div>
      ))}
    </>
  );
}

function ValentineBackground() {
  const hearts = ["💕", "💗", "💖", "💓", "💘", "💝"];
  return (
    <>
      {hearts.map((h, i) => (
        <motion.div
          key={i}
          className="absolute text-lg"
          style={{
            top: `${10 + i * 14}%`,
            left: i % 2 === 0 ? `${5 + i * 8}%` : undefined,
            right: i % 2 !== 0 ? `${5 + i * 6}%` : undefined,
          }}
          animate={{
            y: [0, -18, 0],
            opacity: [0.15, 0.4, 0.15],
            rotate: [0, i % 2 === 0 ? 15 : -15, 0],
          }}
          transition={{ repeat: Infinity, duration: 4 + i * 0.3, delay: i * 0.5 }}
        >
          {h}
        </motion.div>
      ))}
    </>
  );
}

export default function FinalPage({ bgGradient, senderName, config }: Props) {
  const { pages, floatStyle } = config;
  const isValentine = floatStyle === "hearts";

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`min-h-full bg-gradient-to-b ${bgGradient} flex flex-col items-center p-6 md:p-12 relative overflow-hidden`}
    >
      <div className="absolute inset-0 pointer-events-none">
        {isValentine ? <ValentineBackground /> : <BirthdayBackground />}
      </div>

      <motion.div variants={itemVariants} className="text-5xl mt-8 mb-2 relative z-10">
        {pages.final.headerEmoji}
      </motion.div>

      <motion.h2
        variants={itemVariants}
        className="text-xl md:text-2xl font-bold text-foreground mb-2 font-script relative z-10"
      >
        {pages.final.title}
      </motion.h2>

      <motion.p
        variants={itemVariants}
        className="text-foreground/50 text-sm mb-8 relative z-10"
      >
        {pages.final.subtitle}
      </motion.p>

      {/* Wish / Promise cards */}
      <div className="w-full max-w-lg space-y-4 relative z-10">
        {pages.final.wishes.map((wish, i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            className={`rounded-2xl p-5 shadow-sm ${
              isValentine
                ? "bg-white/50 backdrop-blur-sm border border-red-100/30"
                : "bg-white/60 backdrop-blur-sm"
            }`}
          >
            <p className="text-foreground/80 text-sm md:text-base text-center">{wish}</p>
          </motion.div>
        ))}
      </div>

      {/* Closing card */}
      <motion.div variants={itemVariants} className="mt-10 text-center relative z-10 w-full max-w-lg">
        <div
          className={`rounded-3xl p-8 shadow-card ${
            isValentine
              ? "bg-gradient-to-br from-red-50/80 to-pink-50/80 backdrop-blur-sm border border-red-100/30"
              : "bg-white/50 backdrop-blur-sm"
          }`}
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-4xl mb-3"
          >
            {pages.final.closingEmoji}
          </motion.div>
          <p className="text-foreground font-bold font-script text-2xl mb-1">{senderName}</p>
          <p className="text-foreground/40 text-xs">{pages.final.closingSubtext}</p>

          {isValentine && (
            <motion.div
              className="flex justify-center gap-1 mt-3"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              {[...Array(3)].map((_, i) => (
                <Heart key={i} size={12} className="text-red-300 fill-red-300" />
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
