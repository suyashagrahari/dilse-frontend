"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronDown } from "lucide-react";
import { type ContentData, FLOAT_SEEDS, type TabId } from "./types";

interface BirthdayContentProps {
  data: ContentData;
  tab: TabId;
  onTabChange: (tab: TabId) => void;
}

export default function BirthdayContent({ data, tab, onTabChange }: BirthdayContentProps) {
  return (
    <>
      {/* Floating emojis */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {FLOAT_SEEDS.map((f) => (
          <div
            key={f.id}
            className="absolute"
            style={{
              left: `${f.left}%`,
              bottom: "-30px",
              fontSize: `${f.size}px`,
              animation: `bday-float ${f.dur}s ${f.delay}s linear infinite`,
              opacity: 0,
            }}
          >
            {f.emoji}
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes bday-float {
          0% { transform: translateY(0); opacity: 0; }
          5% { opacity: 0.5; }
          85% { opacity: 0.5; }
          100% { transform: translateY(-110vh) rotate(30deg); opacity: 0; }
        }
      `}</style>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {tab === "cover" && (
          <motion.div
            key="cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen flex flex-col items-center justify-center px-6 relative z-10 pb-24"
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
              className="text-center"
            >
              <motion.span
                className="text-6xl block mb-6"
                animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                🎂
              </motion.span>

              <motion.p
                className="text-rose-400 dark:text-rose-300 text-sm font-medium tracking-widest uppercase mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                ✨ A Special Birthday Message ✨
              </motion.p>

              <motion.h1
                className="font-script text-5xl sm:text-6xl text-rose-500 dark:text-rose-400 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                Happy Birthday
              </motion.h1>

              <motion.h2
                className="text-3xl sm:text-4xl font-bold text-foreground mt-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                {data.recipientName}!
              </motion.h2>

              <motion.p
                className="text-muted-foreground text-sm mt-8 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                A special message awaits you
              </motion.p>

              <motion.button
                onClick={() => onTabChange("letter")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-rose-500/10 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 font-semibold text-sm hover:bg-rose-500/20 transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                whileTap={{ scale: 0.95 }}
              >
                Read More
                <ChevronRight size={16} />
              </motion.button>
            </motion.div>

            <motion.div
              className="absolute bottom-28"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ChevronDown size={20} className="text-rose-300 dark:text-rose-600" />
            </motion.div>
          </motion.div>
        )}

        {tab === "letter" && (
          <motion.div
            key="letter"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen flex flex-col items-center justify-center px-5 relative z-10 pb-24 pt-8"
          >
            <motion.span
              className="text-4xl mb-3"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.1 }}
            >
              💌
            </motion.span>
            <h3 className="font-script text-2xl text-rose-500 dark:text-rose-400 mb-8">
              A Letter For You
            </h3>

            <div className="w-full max-w-md bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-7 shadow-xl border border-rose-100/60 dark:border-rose-900/30">
              <p className="text-rose-400 dark:text-rose-300 font-script text-lg mb-4">
                Dear {data.recipientName},
              </p>

              <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap text-[15px]">
                {data.personalMessage}
              </p>

              <div className="mt-8 pt-5 border-t border-rose-100/50 dark:border-rose-900/20 text-right">
                <p className="font-script text-xl text-rose-500 dark:text-rose-400">
                  With all my love,
                </p>
                <p className="font-bold text-foreground mt-1">
                  {data.senderName} ❤️
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-8 text-rose-300 dark:text-rose-700 text-lg">
              <span>✨</span>
              <span>💕</span>
              <span>✨</span>
            </div>
          </motion.div>
        )}

        {tab === "final" && (
          <motion.div
            key="final"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen px-5 relative z-10 pb-28 pt-12"
          >
            <div className="max-w-md mx-auto">
              <motion.div
                className="text-center mb-8"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <span className="text-4xl">🎁</span>
                <h3 className="font-script text-2xl text-rose-500 dark:text-rose-400 mt-2">
                  Special Wishes
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Just for you</p>
              </motion.div>

              {data.photos.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {data.photos.map((url, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="aspect-square rounded-2xl overflow-hidden shadow-lg border-4 border-white dark:border-slate-800"
                      style={{ transform: `rotate(${i % 2 === 0 ? -2 : 2}deg)` }}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </motion.div>
                  ))}
                </div>
              )}

              <div className="space-y-3 mb-12">
                {data.wishes.filter((w) => w.trim()).map((wish, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl p-4 border border-rose-100/40 dark:border-rose-900/20 shadow-sm"
                  >
                    <p className="text-foreground/80 text-sm">{wish}</p>
                  </motion.div>
                ))}
              </div>

              <motion.div
                className="text-center pt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <motion.span
                  className="text-5xl block"
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ❤️
                </motion.span>
                <p className="font-script text-xl text-rose-500 dark:text-rose-400 mt-4">
                  Made with love, just for you
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  — {data.senderName}
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
