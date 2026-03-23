"use client";

import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, Camera } from "lucide-react";
import type { ShaadiData } from "./types";

const C_ACCENT = "#AB1C3E";
const C_MED    = "#CB6B82";
const C_DARK   = "#6D2B3B";
const C_BG     = "#FDF5F0";
const C_CARD   = "#FFFAF8";

interface Props {
  data: ShaadiData;
}

export default memo(function GallerySection({ data }: Props) {
  const [lightbox, setLightbox] = useState<string | null>(null);

  const images = data.galleryImages;

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
            <Camera size={13} style={{ color: C_ACCENT }} />
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: C_ACCENT }}>Gallery</span>
          </motion.div>
          <h2 className="text-2xl font-bold" style={{ color: C_DARK }}>Our Moments</h2>
          <p className="text-sm mt-1" style={{ color: C_MED }}>Captured memories to cherish forever</p>
        </div>

        {images.length === 0 ? (
          <div
            className="rounded-3xl p-12 flex flex-col items-center gap-3"
            style={{ background: C_CARD, border: `1px dashed ${C_MED}40` }}
          >
            <Camera size={36} style={{ color: `${C_MED}60` }} />
            <p className="text-sm" style={{ color: C_MED }}>No photos yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 auto-rows-[100px]">
            {images.map((img, i) => (
              <motion.div
                key={i}
                className={`relative overflow-hidden cursor-pointer rounded-2xl ${img.span || ""}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setLightbox(img.src)}
                style={{ border: `1px solid ${C_MED}20`, boxShadow: `0 4px 16px rgba(109,43,59,0.08)` }}
              >
                <Image
                  src={img.src}
                  alt={img.alt || `Photo ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 33vw, 25vw"
                />
                <div
                  className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"
                  style={{ background: `${C_ACCENT}25` }}
                >
                  <Camera size={20} className="text-white drop-shadow" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.88)" }}
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative max-w-lg w-full max-h-[80vh] rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={lightbox}
                alt=""
                width={800}
                height={1000}
                className="w-full h-auto object-contain"
                style={{ maxHeight: "80vh" }}
              />
              <button
                onClick={() => setLightbox(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <X size={14} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
});
