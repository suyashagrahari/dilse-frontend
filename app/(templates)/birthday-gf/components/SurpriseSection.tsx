"use client";

import { memo, useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import type { BirthdayData } from "./types";
import FlowerBackground from "./FlowerBackground";
import MiniAudioPlayer from "./MiniAudioPlayer";

const BROWN = "#5D3F31";
const TERRACOTTA = "#AD684A";
const CURSIVE = "'Great Vibes', cursive";
const SERIF = "'Cormorant Garamond', Georgia, serif";

const DEMO_PHOTO = "https://cdn.subhsandesh.in/gifts-media/assets/couple1.webp";
const DEMO_AUDIO = "";

const BAR_HEIGHTS = [0.45, 0.75, 0.55, 1, 0.65, 0.85, 0.4, 0.7, 0.5, 0.9];

function PseudoAudioPlayer() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 12px", borderRadius: 14,
        background: "rgba(173,104,74,0.08)",
        border: "1.5px solid rgba(173,104,74,0.22)",
        boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
        width: "100%", boxSizing: "border-box",
      }}
    >
      <span style={{ fontSize: 16, flexShrink: 0 }}>🎤</span>

      <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 20, flexShrink: 0 }}>
        {BAR_HEIGHTS.map((h, i) => (
          <div
            key={i}
            style={{
              width: 3,
              height: `${h * 18}px`,
              borderRadius: 3,
              background: TERRACOTTA,
              transformOrigin: "bottom",
              opacity: 0.3,
            }}
          />
        ))}
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{
          height: 5, borderRadius: 999,
          background: `${TERRACOTTA}30`,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: "50%", transform: "translate(-50%,-50%)",
            left: 0,
            width: 10, height: 10, borderRadius: "50%",
            background: TERRACOTTA,
            boxShadow: `0 0 0 2px white, 0 0 0 3px ${TERRACOTTA}`,
          }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 9, color: "rgba(108,74,46,0.55)" }}>0:00</span>
          <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 9, color: "rgba(108,74,46,0.40)" }}>3:24</span>
        </div>
      </div>

      <div style={{
        width: 34, height: 34, borderRadius: "50%", border: "none",
        background: TERRACOTTA,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
        boxShadow: "0 3px 10px rgba(93,63,49,0.30)",
      }}>
        <span style={{ fontSize: 13, lineHeight: 1, color: "#fff" }}>▶</span>
      </div>
    </motion.div>
  );
}

const CONFETTI_COLORS = [
  "#AD684A", "#5D3F31", "#E8C27A", "#D4956B", "#F5D6B8",
  "#C9836A", "#F0E4D4", "#B8946F", "#FFD700", "#FF69B4",
];

function ConfettiParticle({ delay, color }: { delay: number; color: string }) {
  const left = Math.random() * 100;
  const size = 6 + Math.random() * 8;
  const dur = 1.8 + Math.random() * 1.5;
  const drift = (Math.random() - 0.5) * 60;
  const isCircle = Math.random() > 0.5;

  return (
    <motion.div
      initial={{ y: -20, x: 0, opacity: 1, rotate: 0, scale: 0 }}
      animate={{
        y: [0, 300 + Math.random() * 200],
        x: [0, drift],
        opacity: [1, 1, 0],
        rotate: [0, 360 + Math.random() * 360],
        scale: [0, 1, 0.6],
      }}
      transition={{ duration: dur, delay, ease: "easeOut" }}
      style={{
        position: "absolute",
        left: `${left}%`,
        top: -10,
        width: size,
        height: isCircle ? size : size * 2.5,
        borderRadius: isCircle ? "50%" : 2,
        background: color,
        pointerEvents: "none",
      }}
    />
  );
}

function Confetti() {
  const particles = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    delay: Math.random() * 0.8,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  }));

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 20 }}>
      {particles.map((p) => (
        <ConfettiParticle key={p.id} delay={p.delay} color={p.color} />
      ))}
    </div>
  );
}

interface Props {
  data: BirthdayData;
  isPreview?: boolean;
}

export default memo(function SurpriseSection({ data, isPreview = false }: Props) {
  const photo = data.surprisePhoto || (isPreview ? DEMO_PHOTO : "");
  const audio = data.surpriseAudioUrl || (isPreview ? DEMO_AUDIO : "");
  const note = (data.personalMessage || "").trim();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [scratching, setScratching] = useState(false);
  const [scratchPct, setScratchPct] = useState(0);
  const [scratchKey, setScratchKey] = useState(0);
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      setTimeout(initCanvas, 50);
      return;
    }
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.globalCompositeOperation = "source-over";

    const grd = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    grd.addColorStop(0, "#C9936A");
    grd.addColorStop(0.3, "#E8C27A");
    grd.addColorStop(0.5, "#D4956B");
    grd.addColorStop(0.7, "#F5D6B8");
    grd.addColorStop(1, "#C9936A");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, rect.width, rect.height);

    ctx.fillStyle = "rgba(93,63,49,0.06)";
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * rect.width;
      const y = Math.random() * rect.height;
      const r = 1 + Math.random() * 3;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.font = "bold 16px 'Cormorant Garamond', Georgia, serif";
    ctx.fillStyle = "rgba(93,63,49,0.40)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("✦ Scratch to reveal ✦", rect.width / 2, rect.height / 2 - 12);
    ctx.font = "italic 13px 'Cormorant Garamond', Georgia, serif";
    ctx.fillStyle = "rgba(93,63,49,0.30)";
    ctx.fillText("Use your finger or mouse", rect.width / 2, rect.height / 2 + 14);
  }, []);

  useEffect(() => {
    if (!revealed) {
      const raf = requestAnimationFrame(() => {
        setTimeout(initCanvas, 30);
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [revealed, scratchKey, initCanvas]);

  const getPos = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      const t = e.touches[0];
      return { x: t.clientX - rect.left, y: t.clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  }, []);

  const scratch = useCallback((pos: { x: number; y: number }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = 40;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (lastPos.current) {
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 20, 0, Math.PI * 2);
      ctx.fill();
    }
    lastPos.current = pos;
  }, []);

  const checkReveal = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparent = 0;
    const total = pixels.length / 4;
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparent++;
    }
    const pct = transparent / total;
    setScratchPct(pct);
    if (pct > 0.45) {
      setRevealed(true);
    }
  }, []);

  const onStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (revealed) return;
    e.preventDefault();
    isDrawing.current = true;
    lastPos.current = null;
    setScratching(true);
    const pos = getPos(e);
    if (pos) scratch(pos);
  }, [revealed, getPos, scratch]);

  const onMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawing.current || revealed) return;
    e.preventDefault();
    const pos = getPos(e);
    if (pos) scratch(pos);
  }, [revealed, getPos, scratch]);

  const onEnd = useCallback(() => {
    isDrawing.current = false;
    lastPos.current = null;
    setScratching(false);
    checkReveal();
  }, [checkReveal]);

  const handleReset = useCallback(() => {
    setRevealed(false);
    setScratchPct(0);
    setScratching(false);
    isDrawing.current = false;
    lastPos.current = null;
    setScratchKey((k) => k + 1);
  }, []);

  return (
    <FlowerBackground>
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -60 }}
        style={{ minHeight: "100%", display: "flex", flexDirection: "column", position: "relative" }}
      >
        <div style={{ flex: 1, padding: "28px 16px 100px" }} className="lg:pt-10 lg:max-w-lg lg:mx-auto lg:w-full lg:px-8">
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ fontFamily: CURSIVE, fontSize: "clamp(28px, 7vw, 42px)", fontWeight: 400, color: BROWN, margin: 0 }}
            >
              Surprise!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: TERRACOTTA, marginTop: 6, opacity: 0.7 }}
            >
              {revealed ? "A special gift just for you" : "Scratch the card to reveal your surprise"}
            </motion.p>
          </div>

          {/* Scratch Card Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
            style={{
              position: "relative",
              borderRadius: 24,
              overflow: "hidden",
              background: "rgba(255,255,255,0.55)",
              backdropFilter: "blur(14px)",
              border: "1.5px solid rgba(173,104,74,0.25)",
              boxShadow: "0 8px 40px rgba(93,63,49,0.15), inset 0 1px 0 rgba(255,255,255,0.4)",
            }}
          >
            <AnimatePresence>
              {revealed && <Confetti />}
            </AnimatePresence>

            {/* Hurray header */}
            <AnimatePresence>
              {revealed && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 18 }}
                  style={{ textAlign: "center", paddingTop: 24, paddingBottom: 4, position: "relative", zIndex: 10 }}
                >
                  <motion.span
                    animate={{ scale: [1, 1.15, 1], rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    style={{ fontSize: 48, display: "inline-block", marginBottom: 4 }}
                  >
                    🎉
                  </motion.span>
                  <h3 style={{ fontFamily: CURSIVE, fontSize: "clamp(28px, 8vw, 44px)", fontWeight: 400, color: BROWN, margin: "0 0 2px" }}>
                    Hurray!
                  </h3>
                  <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: TERRACOTTA, margin: 0, opacity: 0.8 }}>
                    Happy Birthday, {data.recipientName || "Beautiful"} 🎂
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scratch area / Revealed photo */}
            <div style={{ position: "relative", padding: revealed ? "12px 20px 20px" : "20px" }}>
              <AnimatePresence mode="wait">
                {!revealed ? (
                  <motion.div
                    key={`scratch-${scratchKey}`}
                    exit={{ opacity: 0, scale: 0.9 }}
                    style={{
                      position: "relative",
                      width: "100%",
                      aspectRatio: "4/3",
                      borderRadius: 16,
                      overflow: "hidden",
                      touchAction: "none",
                      cursor: scratching ? "grabbing" : "grab",
                    }}
                  >
                    {/* Hidden content behind scratch */}
                    <div style={{
                      position: "absolute", inset: 0,
                      background: `linear-gradient(145deg, rgba(173,104,74,0.12), rgba(245,214,184,0.3))`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      borderRadius: 16,
                    }}>
                      {photo ? (
                        <Image
                          src={photo}
                          alt="Surprise"
                          fill
                          style={{ objectFit: "cover", borderRadius: 16, filter: "blur(1px)" }}
                          sizes="(max-width: 768px) 100vw, 480px"
                        />
                      ) : (
                        <span style={{ fontSize: 60 }}>🎁</span>
                      )}
                    </div>

                    {/* Canvas overlay */}
                    <canvas
                      ref={canvasRef}
                      onMouseDown={onStart}
                      onMouseMove={onMove}
                      onMouseUp={onEnd}
                      onMouseLeave={onEnd}
                      onTouchStart={onStart}
                      onTouchMove={onMove}
                      onTouchEnd={onEnd}
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        borderRadius: 16,
                        zIndex: 5,
                      }}
                    />

                    {/* Scratch progress indicator */}
                    {scratchPct > 0.05 && !revealed && (
                      <div style={{
                        position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)",
                        zIndex: 10, background: "rgba(93,63,49,0.75)", borderRadius: 999,
                        padding: "4px 14px", backdropFilter: "blur(6px)",
                      }}>
                        <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 11, color: "#FFF8EE" }}>
                          {Math.round(Math.min(scratchPct / 0.45, 1) * 100)}% revealed
                        </span>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="revealed"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 180, damping: 18 }}
                  >
                    {/* Revealed photo or placeholder */}
                    <div style={{
                      position: "relative",
                      width: "100%",
                      aspectRatio: "4/3",
                      borderRadius: 16,
                      overflow: "hidden",
                      marginBottom: 16,
                      boxShadow: "0 6px 24px rgba(93,63,49,0.20)",
                      border: "3px solid rgba(255,255,255,0.6)",
                      background: photo ? "transparent" : "linear-gradient(145deg, rgba(245,214,184,0.5), rgba(173,104,74,0.12))",
                    }}>
                      {photo ? (
                        <Image
                          src={photo}
                          alt="Surprise"
                          fill
                          style={{ objectFit: "cover" }}
                          sizes="(max-width: 768px) 100vw, 480px"
                        />
                      ) : (
                        <div style={{
                          position: "absolute", inset: 0,
                          display: "flex", flexDirection: "column",
                          alignItems: "center", justifyContent: "center", gap: 6,
                        }}>
                          <motion.span
                            animate={{ scale: [1, 1.08, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            style={{ fontSize: 52 }}
                          >🎂</motion.span>
                          <p style={{ fontFamily: CURSIVE, fontSize: 16, color: BROWN, margin: 0, opacity: 0.7 }}>
                            Your photo here
                          </p>
                        </div>
                      )}
                      <div style={{
                        position: "absolute", bottom: 0, left: 0, right: 0,
                        background: photo
                          ? "linear-gradient(transparent, rgba(93,63,49,0.50))"
                          : "linear-gradient(transparent, rgba(93,63,49,0.25))",
                        padding: "24px 16px 14px",
                      }}>
                        <p style={{
                          fontFamily: CURSIVE, fontSize: 18,
                          color: photo ? "#fff" : BROWN,
                          margin: 0,
                          textShadow: photo ? "0 1px 6px rgba(0,0,0,0.3)" : "none",
                          opacity: photo ? 1 : 0.7,
                        }}>
                          For you, with love 💕
                        </p>
                      </div>
                    </div>

                    {/* Personal message — the sender's note, under the photo */}
                    {note && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        style={{
                          marginTop: 14,
                          marginBottom: 16,
                          padding: "14px 16px",
                          borderRadius: 14,
                          background: "rgba(173,104,74,0.06)",
                          border: "1px solid rgba(173,104,74,0.16)",
                        }}
                      >
                        <p
                          style={{
                            fontFamily: SERIF,
                            fontStyle: "italic",
                            fontSize: 15,
                            lineHeight: 1.65,
                            color: BROWN,
                            margin: 0,
                            textAlign: "center",
                            whiteSpace: "pre-wrap",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {note}
                        </p>
                        {!!data.senderName?.trim() && (
                          <p
                            style={{
                              fontFamily: CURSIVE,
                              fontSize: 16,
                              color: TERRACOTTA,
                              margin: "10px 0 0",
                              textAlign: "right",
                            }}
                          >
                            — {data.senderName.trim()}
                          </p>
                        )}
                      </motion.div>
                    )}

                    {/* Audio player — real or pseudo */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      style={{ marginTop: photo ? 0 : 0 }}
                    >
                      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12, color: "rgba(93,63,49,0.60)", marginBottom: 8, textAlign: "center" }}>
                        🎵 {audio ? "A special message for you" : "Birthday voice note"}
                      </p>
                      {audio ? (
                        <MiniAudioPlayer
                          src={audio}
                          accentColor={TERRACOTTA}
                          bgColor="rgba(173,104,74,0.08)"
                          borderColor="rgba(173,104,74,0.22)"
                        />
                      ) : (
                        <PseudoAudioPlayer />
                      )}
                    </motion.div>

                    {/* Nothing from the sender at all — extra celebratory message */}
                    {!photo && !audio && !note && (
                      <div style={{ textAlign: "center", padding: "16px 0 0" }}>
                        <span style={{ fontSize: 48, display: "block", marginBottom: 4 }}>🎂</span>
                        <p style={{ fontFamily: CURSIVE, fontSize: 18, color: BROWN, margin: 0 }}>
                          Happy Birthday!
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom actions */}
            <div style={{ padding: "0 20px 20px", position: "relative", zIndex: 10 }}>
              {revealed && (
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReset}
                  style={{
                    width: "100%", padding: "12px 0", borderRadius: 14,
                    border: `1.5px solid rgba(173,104,74,0.25)`,
                    background: "rgba(250,245,237,0.7)",
                    fontFamily: CURSIVE, fontSize: 15, color: BROWN,
                    cursor: "pointer", marginTop: 8,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}
                >
                  🎴 Scratch Again
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Fun birthday message below card */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{ textAlign: "center", marginTop: 24 }}
          >
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: "rgba(93,63,49,0.45)", lineHeight: 1.7 }}>
              {revealed
                ? "Every birthday is a chance to celebrate someone amazing — and that's you! 🎂"
                : "Something special is waiting just for you... start scratching! ✨"}
            </p>
          </motion.div>
        </div>
      </motion.div>
    </FlowerBackground>
  );
});
