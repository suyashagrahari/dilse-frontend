"use client";

import { memo, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import StarField from "./StarField";
import type { EidData, DuaItem } from "./types";

const DuaModal = memo(function DuaModal({
  dua,
  onClose,
}: {
  dua: DuaItem;
  onClose: () => void;
}) {
  const stopProp = useCallback((e: React.MouseEvent) => e.stopPropagation(), []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: "hsl(var(--eid-bg) / 0.6)" }}
        onClick={onClose}
      />
      <motion.div
        className="relative rounded-3xl max-w-md w-full shadow-2xl overflow-hidden"
        style={{
          background: "hsl(var(--eid-card))",
          border: "1px solid hsl(var(--eid-border))",
          boxShadow: "0 30px 80px rgba(0,0,0,0.5), 0 0 60px rgba(197,160,63,0.08)",
        }}
        initial={{ scale: 0.85, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 30 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={stopProp}
      >
        {/* Image header */}
        <div className="relative overflow-hidden" style={{ height: 140 }}>
          <Image
            src="/assets/Eid/eid-dua.png"
            alt="Eid Dua"
            fill
            className="object-cover object-center"
            sizes="(max-width: 28rem) 100vw, 448px"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(197,160,63,0.15) 0%, transparent 40%, rgba(0,0,0,0.4) 100%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(58,143,125,0.2) 0%, transparent 50%, rgba(197,160,63,0.15) 100%)",
            }}
          />
          {[...Array(5)].map((_, j) => (
            <motion.div
              key={j}
              className="absolute w-1 h-1 rounded-full"
              style={{
                left: `${15 + (j * 16) % 70}%`,
                top: `${20 + (j * 14) % 50}%`,
                background: `rgba(197,160,63,${0.3 + (j % 3) * 0.15})`,
              }}
              animate={{ scale: [1, 1.6, 1], opacity: [0.3, 0.8, 0.3] }}
              transition={{
                duration: 2 + (j % 2),
                delay: j * 0.25,
                repeat: Infinity,
              }}
            />
          ))}
          <div className="absolute inset-x-0 bottom-0 p-3 text-center">
            <span className="text-2xl drop-shadow-lg">{dua.emoji}</span>
          </div>

          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform"
            style={{
              background: "rgba(0,0,0,0.45)",
              border: "1px solid rgba(255,255,255,0.15)",
              backdropFilter: "blur(8px)",
            }}
          >
            <X size={14} className="text-white" />
          </button>
        </div>

        <div className="p-6 text-center">
          <div className="flex justify-center gap-2 mb-3" style={{ color: "rgba(197,160,63,0.4)" }}>
            <span>✦</span><span>❋</span><span>✦</span>
          </div>
          <p
            className="text-2xl sm:text-3xl mb-4 leading-loose"
            dir="rtl"
            lang="ar"
            style={{ color: "hsl(var(--eid-fg))", fontFamily: "'Amiri', serif" }}
          >
            {dua.arabic}
          </p>
          <div className="eid-gold-divider w-24 mx-auto my-3" />
          <p
            className="text-base mb-2 leading-relaxed"
            dir="rtl"
            lang="ur"
            style={{ color: "hsl(var(--eid-fg) / 0.8)", fontFamily: "'Noto Nastaliq Urdu', serif" }}
          >
            {dua.urdu}
          </p>
          <p
            className="text-sm italic mb-3"
            style={{ color: "hsl(var(--eid-muted-fg))", fontFamily: "'DM Sans', sans-serif" }}
          >
            {dua.english}
          </p>
          <div className="flex justify-center gap-2" style={{ color: "rgba(197,160,63,0.4)" }}>
            <span>✦</span><span>❋</span><span>✦</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});

const DuaSection = memo(function DuaSection({ data }: { data: EidData }) {
  const [selected, setSelected] = useState<DuaItem | null>(null);
  const close = useCallback(() => setSelected(null), []);

  const duas = useMemo(() => data.duas, [data.duas]);

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden pt-20 lg:pt-6">
      <StarField count={15} />

      <div className="relative z-10 pt-6 pb-2 text-center shrink-0">
        <h2
          className="text-3xl sm:text-4xl font-bold mb-1"
          style={{ color: "var(--eid-teal)", fontFamily: "'Cormorant Garamond', serif" }}
        >
          Eid Duas
          <span className="inline-block ml-1 text-sm" style={{ color: "var(--eid-gold)" }}>•</span>
        </h2>
        <p
          className="text-xl"
          dir="rtl"
          lang="ur"
          style={{ color: "var(--eid-gold)", fontFamily: "'Noto Nastaliq Urdu', serif" }}
        >
          عید کی دعائیں
        </p>
        <div className="eid-gold-divider w-32 mx-auto mt-3" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-28 lg:pb-8 relative z-10 scrollbar-hide">
        <div className="grid grid-cols-2 gap-3.5 pt-2 lg:max-w-2xl lg:mx-auto">
          {duas.map((dua, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8, rotate: -3 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5, type: "spring" }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelected(dua)}
              className="eid-shimmer-border rounded-2xl cursor-pointer"
            >
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: "hsl(var(--eid-card))",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                }}
              >
                {/* Image header */}
                <div className="relative h-28 sm:h-32 overflow-hidden">
                  <Image
                    src="/assets/Eid/eid-dua.png"
                    alt=""
                    fill
                    className="object-cover object-center"
                    sizes="(max-width:768px) 50vw, 25vw"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: "linear-gradient(180deg, rgba(197,160,63,0.1) 0%, transparent 40%, rgba(0,0,0,0.5) 100%)",
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl drop-shadow-lg">{dua.emoji}</span>
                  </div>
                </div>

                {/* Text content below image */}
                <div className="p-3 text-center">
                  <p
                    className="text-sm sm:text-base leading-relaxed font-medium"
                    dir="rtl"
                    lang="ur"
                    style={{ color: "hsl(var(--eid-fg))", fontFamily: "'Noto Nastaliq Urdu', serif" }}
                  >
                    {dua.title}
                  </p>
                  <p
                    className="text-[11px] sm:text-xs mt-1"
                    style={{ color: "hsl(var(--eid-muted-fg))", fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {dua.titleEn}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selected && <DuaModal dua={selected} onClose={close} />}
      </AnimatePresence>
    </div>
  );
});

export default DuaSection;
