"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { type ContentData, normalizeHomePhoto } from "./types";

// Placeholder shown when user hasn't uploaded a photo
function PhotoPlaceholder({ index }: { index: number }) {
  return (
    <div
      style={{
        position: "absolute", inset: "5% 6% 8% 10%",
        background: "linear-gradient(135deg, #ede8df 0%, #d9d0c3 100%)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 4,
      }}
    >
      <span style={{ fontSize: "clamp(18px, 5vw, 28px)", opacity: 0.45 }}>📷</span>
      <span style={{
        fontFamily: "'Dancing Script', cursive",
        fontSize: "clamp(9px, 2.2vw, 13px)",
        color: "rgb(140,105,70)", opacity: 0.6, textAlign: "center",
      }}>
        photo {index}
      </span>
    </div>
  );
}

interface Props {
  data: ContentData;
  isPersonalized: boolean;
  onEditClick: () => void;
}

const spring = (delay: number, stiffness = 160, damping = 22) => ({
  type: "spring" as const,
  stiffness,
  damping,
  delay,
});

/**
 * Scrapbook collage home section with Canva-style entrance animations.
 * Each polaroid and decoration flies in from a unique direction.
 */
export default function HomeSection({ data, isPersonalized, onEditClick }: Props) {
  const rawPhotos = data.homePhotos || [];
  const homePhotos = rawPhotos.map(normalizeHomePhoto);
  const defaultCardPhotos = ["https://cdn.subhsandesh.in/gifts-media/love/image5.webp", "https://cdn.subhsandesh.in/gifts-media/love/image14.webp", "https://cdn.subhsandesh.in/gifts-media/love/imaghe12.webp", "https://cdn.subhsandesh.in/gifts-media/love/image13.webp"];
  const photo = (i: number) => homePhotos[i] ?? null;
  const photoUrl = (i: number) => photo(i)?.url || defaultCardPhotos[i] || "";

  return (
    <div
      style={{
        position: "relative",
        height: "100dvh",
        width: "100%",
        background: `
          radial-gradient(ellipse at 50% 50%, transparent 20%, rgba(28,15,6,0.28) 100%),
          url(/love/image18.webp) center / cover no-repeat
        `,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Phone frame corners */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 28,
          pointerEvents: "none",
          border: "1.5px solid rgba(158, 126, 97, 0.22)",
          boxShadow: "0 18px 60px rgba(40,22,8,0.12)",
          zIndex: 1,
        }}
      />

      {/* Scrapbook canvas */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "min(100vw, calc(100dvh * 2 / 3))",
          height: "100%",
          background: "transparent",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {/* Corner brackets */}
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 3 }}
        >
          <div style={{ position: "absolute", top: 12, left: 12, width: 44, height: 44, borderLeft: "3px solid rgba(158, 126, 97, 0.42)", borderTop: "3px solid rgba(158, 126, 97, 0.42)", borderTopLeftRadius: 16, opacity: 0.7 }} />
          <div style={{ position: "absolute", top: 12, right: 12, width: 44, height: 44, borderRight: "3px solid rgba(158, 126, 97, 0.42)", borderTop: "3px solid rgba(158, 126, 97, 0.42)", borderTopRightRadius: 16, opacity: 0.7 }} />
          <div style={{ position: "absolute", bottom: 12, left: 12, width: 44, height: 44, borderLeft: "3px solid rgba(158, 126, 97, 0.42)", borderBottom: "3px solid rgba(158, 126, 97, 0.42)", borderBottomLeftRadius: 16, opacity: 0.7 }} />
          <div style={{ position: "absolute", bottom: 12, right: 12, width: 44, height: 44, borderRight: "3px solid rgba(158, 126, 97, 0.42)", borderBottom: "3px solid rgba(158, 126, 97, 0.42)", borderBottomRightRadius: 16, opacity: 0.7 }} />
        </motion.div>

        {/* Canvas paper background (desktop only) */}
        <div className="hidden sm:block" style={{ position: "absolute", inset: 0 }} aria-hidden="true">
          <Image src="https://cdn.subhsandesh.in/gifts-media/love/image18.webp" alt="" fill priority style={{ objectFit: "cover", objectPosition: "center" }} />
        </div>

        {/* ── Torn paper LEFT — slides in from left ── */}
        <motion.div
          style={{ position: "absolute", left: "-33.8%", top: "0", width: "87.6%", height: "21.0%", zIndex: 1, mixBlendMode: "multiply" }}
          initial={{ x: -120, opacity: 0 }}
          animate={{ x: 0, opacity: 0.9 }}
          transition={spring(0.08, 200, 28)}
        >
          <div style={{ transform: "rotate(92.09deg)", width: "100%", height: "100%" }}>
            <Image src="https://cdn.subhsandesh.in/gifts-media/love/image17.webp" alt="" width={1600} height={577} style={{ width: "100%", height: "100%", display: "block", objectFit: "fill" }} />
          </div>
        </motion.div>

        {/* ── Sticky note — drops from top ── */}
        <motion.div
          style={{ position: "absolute", left: "42.8%", top: "6.6%", width: "48.6%", zIndex: 2 }}
          initial={{ y: -80, rotate: 12, opacity: 0 }}
          animate={{ y: 0, rotate: 8, opacity: 1 }}
          transition={spring(0.45, 220, 18)}
        >
          <Image src="https://cdn.subhsandesh.in/gifts-media/love/image16.webp" alt="note" width={780} height={605} style={{ width: "100%", height: "auto", display: "block" }} />
        </motion.div>

        {/* ── Torn paper RIGHT — slides in from right ── */}
        <motion.div
          style={{ position: "absolute", left: "46.2%", top: "73.8%", width: "87.6%", height: "21.0%", zIndex: 3, mixBlendMode: "multiply" }}
          initial={{ x: 120, opacity: 0 }}
          animate={{ x: 0, opacity: 0.9 }}
          transition={spring(0.1, 200, 28)}
        >
          <div style={{ transform: "rotate(-83.58deg)", width: "100%", height: "100%" }}>
            <Image src="https://cdn.subhsandesh.in/gifts-media/love/image15.webp" alt="" width={1600} height={400} style={{ width: "100%", height: "100%", display: "block", objectFit: "fill" }} />
          </div>
        </motion.div>

        {/* ── Photo 2 (top-right polaroid) — drops from top-right ── */}
        <motion.div
          style={{
            position: "absolute", left: "48%", top: "18%", width: "45.2%", height: "25.2%",
            zIndex: 4, background: "#faf8f2",
            boxShadow: "3px 6px 22px rgba(0,0,0,0.30), 0 1px 6px rgba(0,0,0,0.15)",
          }}
          initial={{ x: 100, y: -100, rotate: 30, opacity: 0 }}
          animate={{ x: 0, y: 0, rotate: 18, opacity: 1 }}
          transition={spring(0.5, 180, 20)}
        >
          {photoUrl(1) ? (
            <div style={{ position: "absolute", inset: "5% 6% 8% 10%", overflow: "hidden" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoUrl(1)} alt="couple" style={{
                width: "100%", height: "100%", objectFit: "cover",
                objectPosition: `${photo(1)?.cropX ?? 50}% ${photo(1)?.cropY ?? 50}%`,
                transform: `scale(${(photo(1)?.scale ?? 100) / 100})`,
                transformOrigin: `${photo(1)?.cropX ?? 50}% ${photo(1)?.cropY ?? 50}%`,
                display: "block",
              }} />
            </div>
          ) : (
            <PhotoPlaceholder index={2} />
          )}
        </motion.div>

        {/* ── Photo 4 (bottom-right tall polaroid) — slides from right ── */}
        <motion.div
          style={{
            position: "absolute", left: "47%", top: "46%", width: "49.1%", height: "28.2%",
            zIndex: 20, background: "#faf8f2",
            boxShadow: "3px 6px 22px rgba(0,0,0,0.30), 0 1px 6px rgba(0,0,0,0.15)",
          }}
          initial={{ x: 140, y: 60, rotate: 20, opacity: 0 }}
          animate={{ x: 0, y: 0, rotate: 10, opacity: 1 }}
          transition={spring(0.65, 170, 22)}
        >
          {photoUrl(3) ? (
            <div style={{ position: "absolute", inset: "5% 6% 8% 10%", overflow: "hidden" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoUrl(3)} alt="couple" style={{
                width: "100%", height: "100%", objectFit: "cover",
                objectPosition: `${photo(3)?.cropX ?? 50}% ${photo(3)?.cropY ?? 50}%`,
                transform: `scale(${(photo(3)?.scale ?? 100) / 100})`,
                transformOrigin: `${photo(3)?.cropX ?? 50}% ${photo(3)?.cropY ?? 50}%`,
                display: "block",
              }} />
            </div>
          ) : (
            <PhotoPlaceholder index={4} />
          )}
        </motion.div>

        {/* ── Photo 3 (bottom-left polaroid) — slides from bottom-left ── */}
        <motion.div
          style={{
            position: "absolute", left: "9.2%", top: "50%", width: "45.1%", height: "25.3%",
            zIndex: 25, background: "#faf8f2",
            boxShadow: "3px 6px 22px rgba(0,0,0,0.30), 0 1px 6px rgba(0,0,0,0.15)",
          }}
          initial={{ x: -100, y: 100, rotate: -22, opacity: 0 }}
          animate={{ x: 0, y: 0, rotate: -9, opacity: 1 }}
          transition={spring(0.58, 175, 21)}
        >
          {photoUrl(2) ? (
            <div style={{ position: "absolute", inset: "5% 6% 8% 10%", overflow: "hidden" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoUrl(2)} alt="couple" style={{
                width: "100%", height: "100%", objectFit: "cover",
                objectPosition: `${photo(2)?.cropX ?? 50}% ${photo(2)?.cropY ?? 50}%`,
                transform: `scale(${(photo(2)?.scale ?? 100) / 100})`,
                transformOrigin: `${photo(2)?.cropX ?? 50}% ${photo(2)?.cropY ?? 50}%`,
                display: "block",
              }} />
            </div>
          ) : (
            <PhotoPlaceholder index={3} />
          )}
        </motion.div>

        {/* ── Right botanical — fades + slides from right ── */}
        <motion.div
          style={{ position: "absolute", left: "65.8%", top: "25.4%", width: "41.8%", zIndex: 30, mixBlendMode: "multiply" }}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={spring(0.72, 200, 26)}
        >
          <div style={{ transform: "rotate(8deg)" }}>
            <Image src="https://cdn.subhsandesh.in/gifts-media/love/image11.webp" alt="" width={312} height={508} style={{ width: "100%", height: "32%", display: "block" }} />
          </div>
        </motion.div>

        {/* ── Pushpin 1 — drops from top ── */}
        <motion.div
          style={{ position: "absolute", left: "70.9%", top: "20.2%", width: "7.2%", zIndex: 8, mixBlendMode: "multiply" }}
          initial={{ y: -30, scale: 0, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          transition={spring(0.55, 300, 18)}
        >
          <div style={{ transform: "rotate(15deg)" }}>
            <div aria-hidden="true" style={{
              width: "100%", aspectRatio: "1 / 1", borderRadius: "999px",
              background: "radial-gradient(circle at 35% 30%, #f9f9fb 0%, #ececef 55%, #d3d3d8 100%)",
              border: "1.5px solid rgba(135,135,145,0.35)",
              boxShadow: "0 3px 8px rgba(0,0,0,0.28), inset 0 1px 2px rgba(255,255,255,0.7)",
            }} />
          </div>
        </motion.div>

        {/* ── Pushpin 2 — drops from top ── */}
        <motion.div
          style={{ position: "absolute", left: "22.8%", top: "51.8%", width: "7.2%", zIndex: 9, mixBlendMode: "multiply" }}
          initial={{ y: -30, scale: 0, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          transition={spring(0.62, 300, 18)}
        >
          <div style={{ transform: "rotate(-9deg)" }}>
            <div aria-hidden="true" style={{
              width: "100%", aspectRatio: "1 / 1", borderRadius: "999px",
              background: "radial-gradient(circle at 35% 30%, #f9f9fb 0%, #ececef 55%, #d3d3d8 100%)",
              border: "1.5px solid rgba(135,135,145,0.35)",
              boxShadow: "0 3px 8px rgba(0,0,0,0.28), inset 0 1px 2px rgba(255,255,255,0.7)",
            }} />
          </div>
        </motion.div>

        {/* ── Bottom flower — slides from bottom-left ── */}
        <motion.div
          style={{ position: "absolute", left: "13%", top: "80.4%", width: "25.4%", zIndex: 35, mixBlendMode: "multiply" }}
          initial={{ x: -40, y: 60, opacity: 0 }}
          animate={{ x: 0, y: 0, opacity: 1 }}
          transition={spring(0.78, 190, 24)}
        >
          <div style={{ transform: "rotate(12deg)" }}>
            <Image src="https://cdn.subhsandesh.in/gifts-media/love/image8.webp" alt="" width={240} height={360} style={{ width: "100%", height: "auto", display: "block" }} />
          </div>
        </motion.div>

        {/* ── Fern — slides from bottom-left ── */}
        <motion.div
          style={{ position: "absolute", left: "5%", top: "68.7%", width: "23.5%", zIndex: 34, mixBlendMode: "multiply" }}
          initial={{ x: -50, y: 40, opacity: 0 }}
          animate={{ x: 0, y: 0, opacity: 1 }}
          transition={spring(0.75, 185, 24)}
        >
          <div style={{ transform: "rotate(-30deg)" }}>
            <Image src="https://cdn.subhsandesh.in/gifts-media/love/image7.webp" alt="" width={174} height={459} style={{ width: "100%", height: "auto", display: "block" }} />
          </div>
        </motion.div>

        {/* ── Dandelion — drops from top-right ── */}
        <motion.div
          style={{ position: "absolute", left: "77.8%", top: "-2.4%", width: "28.2%", zIndex: 12, mixBlendMode: "multiply" }}
          initial={{ y: -50, x: 30, opacity: 0 }}
          animate={{ y: 0, x: 0, opacity: 1 }}
          transition={spring(0.2, 190, 24)}
        >
          <div style={{ transform: "rotate(26.17deg)" }}>
            <Image src="https://cdn.subhsandesh.in/gifts-media/love/image6.webp" alt="" width={210} height={228} style={{ width: "100%", height: "auto", display: "block" }} />
          </div>
        </motion.div>

        {/* ── "love you!" cursive text — bounces in from top ── */}
        <motion.div
          style={{ position: "absolute", left: "50.3%", top: "9.0%", width: "39.1%", zIndex: 13 }}
          initial={{ y: -40, scale: 0.6, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          transition={spring(0.38, 240, 16)}
        >
          <div style={{ transform: "rotate(8deg)" }}>
            <span style={{
              display: "block",
              fontFamily: "'Dancing Script', 'Brush Script MT', cursive",
              fontSize: "clamp(24px, 12.5vw, 54px)",
              color: "rgb(158, 126, 97)",
              fontWeight: 700,
              letterSpacing: "0.01em",
              lineHeight: 1.2,
              whiteSpace: "nowrap",
              pointerEvents: "none",
            }}>
              love you!
            </span>
          </div>
        </motion.div>

        {/* ── Photo 1 LARGE (main polaroid) — slides from left ── */}
        <motion.div
          style={{
            position: "absolute", left: "9%", top: "18.6%", width: "45.6%", height: "30%",
            zIndex: 14, background: "#faf8f2",
            boxShadow: "3px 6px 22px rgba(0,0,0,0.30), 0 1px 6px rgba(0,0,0,0.15)",
          }}
          initial={{ x: -180, y: 30, rotate: -22, opacity: 0 }}
          animate={{ x: 0, y: 0, rotate: -12, opacity: 1 }}
          transition={spring(0.3, 160, 22)}
        >
          {photoUrl(0) ? (
            <div style={{ position: "absolute", inset: "5% 6% 8% 10%", overflow: "hidden" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoUrl(0)} alt="couple" style={{
                width: "100%", height: "100%", objectFit: "cover",
                objectPosition: `${photo(0)?.cropX ?? 50}% ${photo(0)?.cropY ?? 50}%`,
                transform: `scale(${(photo(0)?.scale ?? 100) / 100})`,
                transformOrigin: `${photo(0)?.cropX ?? 50}% ${photo(0)?.cropY ?? 50}%`,
                display: "block",
              }} />
            </div>
          ) : (
            <PhotoPlaceholder index={1} />
          )}
        </motion.div>

        {/* ── Top-left yarrow botanical — slides from top-left ── */}
        <motion.div
          style={{ position: "absolute", left: "-4.6%", top: "-0.1%", width: "29.2%", zIndex: 15, mixBlendMode: "multiply" }}
          initial={{ x: -50, y: -40, opacity: 0 }}
          animate={{ x: 0, y: 0, opacity: 1 }}
          transition={spring(0.18, 185, 24)}
        >
          <div style={{ transform: "rotate(18.83deg)" }}>
            <Image src="https://cdn.subhsandesh.in/gifts-media/love/image4.webp" alt="" width={215} height={355} style={{ width: "100%", height: "auto", display: "block" }} />
          </div>
        </motion.div>

        {/* ── Center pressed flower — pops in from center ── */}
        <motion.div
          style={{ position: "absolute", left: "44.2%", top: "42.1%", width: "16.5%", zIndex: 36, mixBlendMode: "multiply" }}
          initial={{ scale: 0, rotate: -60, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={spring(0.7, 280, 18)}
        >
          <Image src="https://cdn.subhsandesh.in/gifts-media/love/image3.webp" alt="" width={122} height={121} style={{ width: "100%", height: "auto", display: "block" }} />
        </motion.div>
      </div>

      {/* Below canvas: sender name */}
      {isPersonalized && data.senderName && (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 0.75, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          style={{
            marginTop: 12,
            fontFamily: "'Dancing Script', 'Brush Script MT', cursive",
            fontSize: "clamp(13px, 3.5vw, 18px)",
            color: "rgb(108, 74, 46)",
            letterSpacing: "0.08em",
            textAlign: "center",
            padding: "0 16px 8px",
            pointerEvents: "none",
          }}
        >
          — from {data.senderName} ♡
        </motion.p>
      )}
    </div>
  );
}
