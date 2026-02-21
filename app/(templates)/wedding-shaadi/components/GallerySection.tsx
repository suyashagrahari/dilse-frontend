"use client";

import { useState, memo, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import type { WeddingData } from "./types";

interface Props {
  data: WeddingData;
}

const GallerySection = memo(function GallerySection({ data }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const images = useMemo(() => data.galleryImages, [data.galleryImages]);

  const openLightbox = useCallback((idx: number) => setSelected(idx), []);
  const closeLightbox = useCallback(() => setSelected(null), []);

  const goNext = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelected((prev) => (prev !== null ? (prev + 1) % images.length : null));
    },
    [images.length],
  );

  const goPrev = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelected((prev) =>
        prev !== null ? (prev - 1 + images.length) % images.length : null,
      );
    },
    [images.length],
  );

  return (
    <section className="min-h-[calc(100vh-4rem)] lg:min-h-screen flex items-center py-12 px-4">
      <div className="max-w-5xl mx-auto w-full">
        <motion.p
          className="text-[10px] md:text-xs tracking-[0.4em] uppercase text-center mb-2"
          style={{ color: "var(--wed-accent-gold)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Memories
        </motion.p>
        <motion.h2
          className="text-3xl md:text-5xl text-center mb-10"
          style={{ color: "hsl(var(--wed-fg))", fontFamily: "'Playfair Display', serif" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Photo Gallery
        </motion.h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 auto-rows-[150px] md:auto-rows-[200px]">
          {images.map((img, idx) => (
            <motion.div
              key={idx}
              className={`${img.span} rounded-xl overflow-hidden cursor-pointer group relative`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.08 }}
              onClick={() => openLightbox(idx)}
              whileHover={{ scale: 1.02 }}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, 25vw"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
              <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <span
                  className="text-xs px-2 py-1 rounded-full"
                  style={{
                    color: "#fff",
                    background: "rgba(0,0,0,0.5)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  {img.alt}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {selected !== null && (
            <motion.div
              className="fixed inset-0 z-[60] flex items-center justify-center p-4"
              style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(20px)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeLightbox}
            >
              <button
                className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center z-10"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
                onClick={closeLightbox}
              >
                <X className="w-5 h-5 text-white" />
              </button>

              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center z-10"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
                onClick={goPrev}
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>

              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center z-10"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
                onClick={goNext}
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>

              <motion.div
                className="relative max-w-full max-h-[80vh] w-full h-[80vh] rounded-2xl overflow-hidden"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={images[selected].src}
                  alt={images[selected].alt}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
});

export default GallerySection;
