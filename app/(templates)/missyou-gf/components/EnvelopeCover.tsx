"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { MissYouData } from "./types";
import { NIGHT, FONT_HEADING, FONT_SCRIPT, FONT_BODY, BRAND_GRADIENT, EASE_OUT } from "./theme";
import Starfield from "./Starfield";

interface Props {
  data: MissYouData;
  onOpen: () => void;
  accent: string;
}

/** §1 Envelope cover — the ritual entry. Tap the wax seal → the envelope opens. */
export default function EnvelopeCover({ data, onOpen, accent }: Props) {
  const reduce = useReducedMotion();
  const [opening, setOpening] = useState(false);
  const petName = data.petName?.trim() || data.recipientName?.trim() || "you";

  const handleOpen = () => {
    if (opening) return;
    setOpening(true);
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try { navigator.vibrate?.(18); } catch {}
    }
    // staged reveal ~900ms; reduced-motion crossfades in 200ms
    window.setTimeout(onOpen, reduce ? 220 : 900);
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 30,
        background: NIGHT.gradient,
        display: "grid", placeItems: "center",
        padding: "24px",
        overflow: "hidden",
      }}
    >
      <Starfield active tint={accent} />

      <div style={{ position: "relative", zIndex: 2, textAlign: "center", width: "100%", maxWidth: 460 }}>
        <p
          style={{
            fontFamily: FONT_BODY, fontSize: 11, fontWeight: 600, letterSpacing: "0.14em",
            textTransform: "uppercase", color: NIGHT.mutedNight, marginBottom: 14,
          }}
        >
          {data.coverLine?.trim() || "A letter for you"}
        </p>

        <motion.p
          aria-label={`For ${petName}`}
          animate={reduce ? {} : { y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{
            fontFamily: FONT_SCRIPT, color: NIGHT.pinkLt,
            fontSize: "clamp(40px,12vw,56px)", lineHeight: 1, marginBottom: 22,
          }}
        >
          {petName}
        </motion.p>

        {/* Envelope */}
        <motion.div
          animate={reduce ? {} : { y: [0, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "relative", width: "min(320px,80vw)", margin: "0 auto", aspectRatio: "3 / 2" }}
        >
          {/* body */}
          <div
            style={{
              position: "absolute", inset: 0, borderRadius: 20,
              background: "linear-gradient(180deg,#FFFFFF 0%,#F3F1EA 100%)",
              boxShadow: `0 0 40px rgba(108,92,231,.25), 0 20px 50px -20px rgba(0,0,0,.6)`,
              overflow: "hidden",
            }}
          >
            {/* letter peeking / sliding up on open */}
            <motion.div
              initial={false}
              animate={opening && !reduce ? { y: "-28%", opacity: 1 } : { y: "8%", opacity: 0.0 }}
              transition={{ duration: 0.48, delay: 0.3, ease: EASE_OUT }}
              style={{
                position: "absolute", left: "8%", right: "8%", top: "8%", bottom: 0,
                borderRadius: "10px 10px 0 0", background: "#FFFFFF",
                boxShadow: "0 -6px 18px rgba(0,0,0,.08)",
              }}
            />
            {/* pockets */}
            <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: 20 }}>
              <div style={{ position: "absolute", bottom: 0, left: 0, width: 0, height: 0, borderLeft: "50vw solid transparent" }} />
            </div>
          </div>

          {/* flap */}
          <motion.div
            initial={false}
            animate={opening && !reduce ? { rotateX: -165 } : { rotateX: 0 }}
            transition={{ duration: 0.52, ease: EASE_OUT }}
            style={{
              position: "absolute", top: 0, left: 0, right: 0, height: "58%",
              transformOrigin: "top center", transformStyle: "preserve-3d",
              backfaceVisibility: "hidden", zIndex: 3,
            }}
          >
            <svg viewBox="0 0 300 116" width="100%" height="100%" aria-hidden="true" style={{ display: "block" }}>
              <path d="M0 0 H300 L150 108 Z" fill="url(#flapGrad)" />
              <defs>
                <linearGradient id="flapGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#EFEDFD" />
                  <stop offset="1" stopColor="#E4E0F5" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>

          {/* wax seal button */}
          <motion.button
            type="button"
            onClick={handleOpen}
            aria-label="Open the letter"
            whileTap={{ scale: 0.9 }}
            animate={opening ? { scale: reduce ? 1 : 0, opacity: 0 } : { scale: 1, opacity: 1 }}
            transition={{ duration: reduce ? 0.2 : 0.28, ease: EASE_OUT }}
            style={{
              position: "absolute", top: "42%", left: "50%", transform: "translate(-50%,-50%)",
              zIndex: 6, width: 76, height: 76, minWidth: 48, minHeight: 48, borderRadius: 999,
              background: BRAND_GRADIENT, border: "none", cursor: "pointer",
              display: "grid", placeItems: "center",
              boxShadow: "0 0 30px rgba(247,37,133,.45), inset 0 2px 6px rgba(255,255,255,.35)",
            }}
          >
            <span style={{ fontFamily: FONT_HEADING, fontWeight: 700, fontSize: 22, color: NIGHT.lime }}>SS</span>
          </motion.button>
        </motion.div>

        <motion.p
          animate={reduce ? {} : { opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.4, repeat: Infinity }}
          style={{ fontFamily: FONT_BODY, fontSize: 13, color: NIGHT.mutedNight, marginTop: 26 }}
        >
          Tap the seal to open
        </motion.p>
      </div>
    </div>
  );
}
