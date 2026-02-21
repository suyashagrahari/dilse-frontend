"use client";

import { memo, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { ReceptionData } from "./types";
import { REC_GLASS } from "./styles";

interface Props {
  data: ReceptionData;
}

const FILTERS = ["all", "couple", "pre-wedding", "engagement", "candid"] as const;
type Filter = (typeof FILTERS)[number];

const FILTER_COLORS: Record<Filter, string> = {
  all: "var(--rec-accent)",
  couple: "var(--rec-rose)",
  "pre-wedding": "var(--rec-sage)",
  engagement: "var(--rec-accent-light)",
  candid: "var(--rec-rose)",
};

const GallerySection = memo(function GallerySection({ data }: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const [lightbox, setLightbox] = useState<number | null>(null);

  const filtered = useMemo(
    () => filter === "all" ? data.galleryImages : data.galleryImages.filter((img) => img.category === filter),
    [data.galleryImages, filter],
  );

  const openLightbox = useCallback((idx: number) => () => setLightbox(idx), []);
  const closeLightbox = useCallback(() => setLightbox(null), []);
  const prev = useCallback(() => setLightbox((i) => (i !== null && i > 0 ? i - 1 : i)), []);
  const next = useCallback(() => setLightbox((i) => (i !== null && i < filtered.length - 1 ? i + 1 : i)), [filtered.length]);

  return (
    <section className="min-h-screen flex items-start lg:items-center py-10 pt-20 lg:pt-24 px-4">
      <div className="max-w-5xl mx-auto w-full">
        <motion.div className="text-center mb-8 lg:mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[9px] md:text-[10px] tracking-[0.6em] uppercase mb-2" style={{ color: "var(--rec-accent)" }}>
            Memories
          </p>
          <h2
            className="text-3xl md:text-5xl font-light"
            style={{ color: "hsl(var(--rec-fg))", fontFamily: "'Cormorant Garamond', serif" }}
          >
            Our Gallery
          </h2>
        </motion.div>

        <motion.div
          className="flex items-center justify-center gap-1.5 mb-8 flex-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {FILTERS.map((f) => {
            const active = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-3.5 py-1.5 rounded-lg text-[10px] tracking-wider uppercase transition-all"
                style={
                  active
                    ? {
                        background: "rgba(212,165,116,0.1)",
                        border: "1px solid rgba(212,165,116,0.2)",
                        color: FILTER_COLORS[f],
                      }
                    : {
                        background: "transparent",
                        border: "1px solid rgba(255,255,255,0.04)",
                        color: "hsl(var(--rec-muted-fg))",
                      }
                }
              >
                {f === "all" ? "All" : f.replace("-", " ")}
              </button>
            );
          })}
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 md:gap-2 auto-rows-[150px] md:auto-rows-[200px]">
          {filtered.map((img, idx) => (
            <motion.div
              key={`${img.src}-${idx}`}
              className={`relative rounded-xl overflow-hidden cursor-pointer group ${img.span}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
              onClick={openLightbox(idx)}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end p-3"
                style={{ background: "linear-gradient(to top, rgba(11,15,26,0.8) 0%, transparent 50%)" }}
              >
                <span className="text-[10px] font-light tracking-wider text-white/70">{img.alt}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {lightbox !== null && filtered[lightbox] && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center"
            style={{ background: "rgba(11,15,26,0.95)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
          >
            <button onClick={closeLightbox} className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center z-10" style={REC_GLASS}>
              <X size={16} style={{ color: "hsl(var(--rec-muted-fg))" }} />
            </button>
            {lightbox > 0 && (
              <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 w-10 h-10 rounded-full flex items-center justify-center z-10" style={REC_GLASS}>
                <ChevronLeft size={16} style={{ color: "hsl(var(--rec-muted-fg))" }} />
              </button>
            )}
            {lightbox < filtered.length - 1 && (
              <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 w-10 h-10 rounded-full flex items-center justify-center z-10" style={REC_GLASS}>
                <ChevronRight size={16} style={{ color: "hsl(var(--rec-muted-fg))" }} />
              </button>
            )}
            <motion.div
              key={lightbox}
              className="relative w-[90vw] h-[70vh] md:w-[70vw] md:h-[80vh] rounded-xl overflow-hidden"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image src={filtered[lightbox].src} alt={filtered[lightbox].alt} fill className="object-contain" sizes="90vw" />
            </motion.div>
            <div className="absolute bottom-6">
              <span className="text-[10px] tracking-wider" style={{ color: "hsl(var(--rec-muted-fg))" }}>
                {lightbox + 1} / {filtered.length}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
});

export default GallerySection;
