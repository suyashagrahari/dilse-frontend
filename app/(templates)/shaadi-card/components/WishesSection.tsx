"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { HandHeart, Quote } from "lucide-react";
import type { ShaadiData } from "./types";

const C_ACCENT = "#AB1C3E";
const C_MED    = "#CB6B82";
const C_DARK   = "#6D2B3B";
const C_BG     = "#FDF5F0";
const C_CARD   = "#FFFAF8";

interface Props {
  data: ShaadiData;
}

export default memo(function WishesSection({ data }: Props) {
  const wishes = data.wishes || [];

  return (
    <section
      className="min-h-screen py-10 px-4 pb-24 lg:pb-10"
      style={{ background: `linear-gradient(180deg, ${C_BG} 0%, #FAE8E8 100%)` }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto"
      >
        {/* Section header */}
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
            style={{ background: `${C_ACCENT}18`, border: `1px solid ${C_ACCENT}30` }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <HandHeart size={13} style={{ color: C_ACCENT }} />
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: C_ACCENT }}>Blessings</span>
          </motion.div>
          <h2 className="text-2xl font-bold" style={{ color: C_DARK }}>
            Wishes &amp; Blessings
          </h2>
          <p className="text-sm mt-1" style={{ color: C_MED }}>
            Heartfelt messages from loved ones
          </p>
        </div>

        {wishes.length === 0 ? (
          <div
            className="rounded-3xl p-12 flex flex-col items-center gap-3"
            style={{ background: C_CARD, border: `1px dashed ${C_MED}40` }}
          >
            <HandHeart size={36} style={{ color: `${C_MED}60` }} />
            <p className="text-sm" style={{ color: C_MED }}>No blessings yet</p>
            <p className="text-xs text-center max-w-xs" style={{ color: `${C_MED}80` }}>
              Share this invitation and blessings will appear here
            </p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 gap-4 space-y-4">
            {wishes.map((wish, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                className="break-inside-avoid rounded-2xl p-4 shadow-sm"
                style={{ background: C_CARD, border: `1px solid ${C_MED}25` }}
              >
                <Quote size={16} style={{ color: `${C_MED}60` }} className="mb-2" />
                <p className="text-sm leading-relaxed mb-3" style={{ color: C_DARK }}>
                  {wish.message}
                </p>
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: `${C_ACCENT}18`, color: C_ACCENT }}
                  >
                    {wish.name.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-xs font-semibold" style={{ color: C_MED }}>{wish.name}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Footer note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8"
        >
          <p className="text-xs" style={{ color: `${C_MED}80` }}>
            💕 When guests open the shared invitation, they can leave their blessings here
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
});
