"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Heart, Users } from "lucide-react";
import type { ShaadiData } from "./types";

const C_ACCENT = "#AB1C3E";
const C_MED    = "#CB6B82";
const C_DARK   = "#6D2B3B";
const C_BG     = "#FDF5F0";
const C_CARD   = "#FFFAF8";

interface Props {
  data: ShaadiData;
}

export default memo(function CoupleSection({ data }: Props) {
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
            <Heart size={13} style={{ color: C_ACCENT }} fill={C_ACCENT} />
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: C_ACCENT }}>The Couple</span>
          </motion.div>
          <h2 className="text-2xl font-bold" style={{ color: C_DARK }}>
            {data.brideName} &amp; {data.groomName}
          </h2>
          <p className="text-sm mt-1" style={{ color: C_MED }}>Two hearts, one journey</p>
        </div>

        {/* Couple cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
          {[data.bride, data.groom].map((person, idx) => (
            <motion.div
              key={person.role}
              initial={{ opacity: 0, x: idx === 0 ? -30 : 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + idx * 0.15, duration: 0.5 }}
              className="rounded-3xl overflow-hidden shadow-lg"
              style={{ background: C_CARD, border: `1px solid ${C_MED}28` }}
            >
              {/* Photo */}
              <div className="relative h-52 overflow-hidden" style={{ background: `linear-gradient(135deg, ${C_MED}20, ${C_ACCENT}15)` }}>
                {person.photo ? (
                  <Image
                    src={person.photo}
                    alt={person.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="w-24 h-24 rounded-full flex items-center justify-center text-5xl"
                      style={{ background: `${C_ACCENT}15`, border: `2px dashed ${C_MED}50` }}
                    >
                      {idx === 0 ? "👰" : "🤵"}
                    </div>
                  </div>
                )}
                {/* Role badge */}
                <div
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-white"
                  style={{ background: C_ACCENT, boxShadow: `0 4px 12px ${C_ACCENT}50` }}
                >
                  {person.roleHindi} · {person.role}
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="text-base font-bold mb-1" style={{ color: C_DARK }}>{person.name}</h3>
                <p className="text-xs leading-relaxed mb-3" style={{ color: C_MED }}>{person.description}</p>

                {/* Tags */}
                {person.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {person.tags.map((tag) => (
                      <span
                        key={tag.label}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium"
                        style={{ background: `${C_ACCENT}10`, color: C_DARK, border: `1px solid ${C_ACCENT}20` }}
                      >
                        {tag.emoji} {tag.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Families */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-3xl p-5"
          style={{ background: C_CARD, border: `1px solid ${C_MED}28` }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Users size={16} style={{ color: C_ACCENT }} />
            <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: C_DARK }}>Our Families</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[data.brideFamily, data.groomFamily].map((family) => (
              <div
                key={family.title}
                className="rounded-2xl p-4"
                style={{ background: `${C_ACCENT}08`, border: `1px solid ${C_ACCENT}18` }}
              >
                <p className="text-xs font-bold mb-2" style={{ color: C_ACCENT }}>{family.title}</p>
                <p className="text-xs leading-relaxed mb-1" style={{ color: C_DARK }}>
                  <span className="font-semibold">Parents:</span> {family.parents}
                </p>
                {family.grandparents && (
                  <p className="text-xs leading-relaxed" style={{ color: C_MED }}>
                    <span className="font-semibold">Grandparents:</span> {family.grandparents}
                  </p>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
});
