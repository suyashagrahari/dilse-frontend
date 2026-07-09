"use client";

import { memo, useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Camera, X, ChevronLeft, ChevronRight } from "lucide-react";
import type { BirthdayData, PhotoItem } from "./types";
import FlowerBackground from "./FlowerBackground";

const BROWN = "#5D3F31";
const COPPER = "#AD684A";
const SCRIPT = "'Great Vibes', cursive";
const SERIF = "'Cormorant Garamond', Georgia, serif";

const DEMO_PHOTOS: PhotoItem[] = [
  { url: "/assets/marriage/weeding.webp", caption: "Celebration Time", cropX: 50, cropY: 50 },
  { url: "/assets/couple1.webp", caption: "Beautiful Moments", cropX: 50, cropY: 30 },
  { url: "/assets/couple2.webp", caption: "Together Forever", cropX: 50, cropY: 40 },
  { url: "/assets/couple3.webp", caption: "Cherished Memories", cropX: 50, cropY: 50 },
  { url: "/assets/couple4.webp", caption: "Joy & Laughter", cropX: 50, cropY: 40 },
  { url: "/assets/couple1.webp", caption: "Love & Happiness", cropX: 50, cropY: 50 },
];

function cellClass(i: number, total: number): string {
  if (total <= 1) return "col-span-2 row-span-2 min-h-[220px]";
  if (total === 2) return "col-span-1 row-span-2 min-h-[200px]";
  if (i === 0) return "col-span-2 row-span-2 min-h-[240px] sm:min-h-[280px]";
  if (i === 3) return "col-span-2 row-span-1 min-h-[140px] sm:min-h-[160px]";
  return "col-span-1 row-span-1 min-h-[140px]";
}

interface Props {
  data: BirthdayData;
}

export default memo(function GallerySection({ data }: Props) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const userPhotos = data.galleryPhotos ?? [];
  const photos = userPhotos.length > 0 ? userPhotos : DEMO_PHOTOS;
  const total = photos.length;
  const gridKey = useMemo(() => photos.map((p) => p.url).join("|"), [photos]);

  const openAt = useCallback((i: number) => setLightboxIdx(i), []);
  const close = useCallback(() => setLightboxIdx(null), []);
  const prev = useCallback(() => setLightboxIdx((i) => i === null ? null : (i - 1 + total) % total), [total]);
  const next = useCallback(() => setLightboxIdx((i) => i === null ? null : (i + 1) % total), [total]);

  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
      if (e.key === "ArrowRight") { e.preventDefault(); next(); }
      if (e.key === "Escape") { e.preventDefault(); close(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIdx, prev, next, close]);

  const currentPhoto = lightboxIdx !== null ? photos[lightboxIdx] : null;

  return (
    <FlowerBackground>
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -60 }}
        style={{
          minHeight: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        <motion.div
          key={gridKey}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          style={{ padding: "28px 14px 100px" }}
          className="lg:pt-10 lg:max-w-5xl lg:mx-auto lg:w-full lg:px-8"
        >
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 16px",
                borderRadius: 999,
                background: "rgba(93,63,49,0.08)",
                border: "1px solid rgba(173,104,74,0.15)",
                marginBottom: 12,
              }}
            >
              <Camera size={13} style={{ color: COPPER }} />
              <span style={{
                fontFamily: SERIF,
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: COPPER,
              }}>
                Gallery
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                fontFamily: SCRIPT,
                fontSize: "clamp(28px, 7vw, 42px)",
                fontWeight: 400,
                color: BROWN,
                margin: 0,
              }}
            >
              Memory Gallery
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontSize: 14,
                color: COPPER,
                marginTop: 6,
                opacity: 0.7,
              }}
            >
              {userPhotos.length > 0
                ? `${userPhotos.length} beautiful moment${userPhotos.length !== 1 ? "s" : ""} captured`
                : "A scrapbook of joy — tap to immerse"}
            </motion.p>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 auto-rows-fr">
              {photos.map((photo, i) => (
                <motion.button
                  key={`${photo.url}-${i}`}
                  type="button"
                  className={`relative overflow-hidden group focus:outline-none ${cellClass(i, total)}`}
                  style={{
                    borderRadius: 18,
                    border: "1.5px solid rgba(255,255,255,0.55)",
                    boxShadow: "0 8px 32px rgba(93,63,49,0.12), 0 2px 8px rgba(93,63,49,0.06)",
                    cursor: "pointer",
                    background: "#E8DDD0",
                  }}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 * Math.min(i, 8), duration: 0.45 }}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openAt(i)}
                >
                  {photo.url ? (
                    <Image
                      src={photo.url}
                      alt={photo.caption || `Photo ${i + 1}`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                      sizes="(max-width:640px) 50vw, 33vw"
                      style={{
                        objectPosition: `${photo.cropX ?? 50}% ${photo.cropY ?? 50}%`,
                      }}
                    />
                  ) : (
                    <div style={{
                      width: "100%", height: "100%", position: "absolute", inset: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: "linear-gradient(135deg, #F0E5D8, #E5D8C8)",
                    }}>
                      <Camera size={28} style={{ color: "rgba(173,104,74,0.30)" }} />
                    </div>
                  )}

                  {/* Hover overlay */}
                  <motion.div
                    className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: "linear-gradient(160deg, rgba(93,63,49,0.35) 0%, rgba(173,104,74,0.40) 100%)",
                      backdropFilter: "blur(1px)",
                    }}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: "50%",
                      background: "rgba(255,255,255,0.90)",
                      boxShadow: "0 4px 14px rgba(93,63,49,0.25)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Camera size={16} style={{ color: COPPER }} />
                    </div>
                    <span style={{
                      fontFamily: SERIF,
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#fff",
                      textShadow: "0 1px 4px rgba(0,0,0,0.3)",
                    }}>
                      View
                    </span>
                  </motion.div>

                  {/* Caption badge */}
                  {photo.caption && (
                    <div style={{
                      position: "absolute", bottom: 0, left: 0, right: 0,
                      padding: "20px 10px 8px",
                      background: "linear-gradient(transparent, rgba(0,0,0,0.45))",
                    }}>
                      <p style={{
                        fontFamily: SERIF, fontStyle: "italic", fontSize: 11,
                        color: "rgba(255,255,255,0.90)", margin: 0,
                        textAlign: "center",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {photo.caption}
                      </p>
                    </div>
                  )}
                </motion.button>
              ))}
            </div>

          {/* Footer */}
          {total > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: total * 0.05 + 0.3 }}
              style={{ textAlign: "center", marginTop: 32 }}
            >
              <span style={{
                fontFamily: SERIF, fontStyle: "italic", fontSize: 14,
                color: "rgba(93,63,49,0.45)",
              }}>
                Every photo tells a story
              </span>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {currentPhoto && lightboxIdx !== null && (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed", inset: 0, zIndex: 70,
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "12px",
              background: "rgba(42,26,16,0.92)",
            }}
            onClick={close}
          >
            {/* Prev arrow */}
            {total > 1 && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); prev(); }}
                style={{
                  position: "absolute", left: 12, zIndex: 20,
                  width: 44, height: 44, borderRadius: "50%",
                  background: "rgba(255,255,255,0.12)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.20)",
                  color: "#fff", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <ChevronLeft size={22} />
              </button>
            )}

            {/* Next arrow */}
            {total > 1 && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); next(); }}
                style={{
                  position: "absolute", right: 12, zIndex: 20,
                  width: 44, height: 44, borderRadius: "50%",
                  background: "rgba(255,255,255,0.12)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.20)",
                  color: "#fff", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <ChevronRight size={22} />
              </button>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={lightboxIdx}
                initial={{ scale: 0.94, opacity: 0, x: 20 }}
                animate={{ scale: 1, opacity: 1, x: 0 }}
                exit={{ scale: 0.94, opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
                style={{
                  position: "relative",
                  width: "100%",
                  maxWidth: 720,
                  maxHeight: "88vh",
                  borderRadius: 24,
                  overflow: "hidden",
                  boxShadow: `0 24px 60px rgba(42,26,16,0.60), 0 0 40px rgba(173,104,74,0.18)`,
                  border: "2px solid rgba(173,104,74,0.25)",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close */}
                <button
                  type="button"
                  onClick={close}
                  style={{
                    position: "absolute", right: 12, top: 12, zIndex: 10,
                    width: 36, height: 36, borderRadius: "50%",
                    background: "rgba(42,26,16,0.70)",
                    backdropFilter: "blur(4px)",
                    border: "none", color: "rgba(255,255,255,0.90)",
                    cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <X size={17} />
                </button>

                {/* Counter */}
                {total > 1 && (
                  <div style={{
                    position: "absolute", left: 12, top: 12, zIndex: 10,
                    padding: "4px 12px", borderRadius: 999,
                    background: "rgba(42,26,16,0.65)",
                    backdropFilter: "blur(4px)",
                    fontFamily: SERIF, fontSize: 12, fontWeight: 600,
                    color: "rgba(255,255,255,0.85)",
                  }}>
                    {lightboxIdx + 1} / {total}
                  </div>
                )}

                {/* Image */}
                <div style={{ position: "relative", width: "100%", minHeight: 200, maxHeight: "min(78vh, 820px)", background: "rgba(0,0,0,0.5)" }}>
                  <Image
                    src={currentPhoto.url}
                    alt={currentPhoto.caption || `Photo ${lightboxIdx + 1}`}
                    width={1200}
                    height={1400}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      maxHeight: "min(78vh, 820px)",
                    }}
                  />
                </div>

                {/* Caption bar */}
                <div style={{
                  padding: "12px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  background: `linear-gradient(135deg, rgba(42,26,16,0.95) 0%, rgba(93,63,49,0.92) 100%)`,
                  borderTop: "1px solid rgba(173,104,74,0.20)",
                }}>
                  <p style={{
                    fontFamily: SERIF, fontStyle: "italic", fontSize: 14,
                    color: "rgba(255,252,246,0.90)", margin: 0,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {currentPhoto.caption || `Moment ${lightboxIdx + 1}`}
                  </p>
                  {total > 1 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                      {photos.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setLightboxIdx(i); }}
                          style={{
                            width: i === lightboxIdx ? 16 : 6,
                            height: 6,
                            borderRadius: 999,
                            border: "none",
                            cursor: "pointer",
                            background: i === lightboxIdx ? COPPER : "rgba(173,104,74,0.35)",
                            transition: "all 0.2s",
                            padding: 0,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </FlowerBackground>
  );
});
