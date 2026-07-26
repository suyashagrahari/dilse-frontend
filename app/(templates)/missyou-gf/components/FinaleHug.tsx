"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";
import type { MissYouData } from "./types";
import { NIGHT, FONT_HEADING, FONT_BODY, BRAND_GRADIENT } from "./theme";

/** §7 Send It Back — tap/hold hug counter → WhatsApp reply CTA + Make-your-own. */
export default function FinaleHug({ data, mode }: { data: MissYouData; mode: "preview" | "live" }) {
  const reduce = useReducedMotion();
  const [hugs, setHugs] = useState(0);
  const holdRef = useRef<number | null>(null);

  const addHug = () => {
    setHugs((h) => h + 1);
    if (typeof navigator !== "undefined" && "vibrate" in navigator) { try { navigator.vibrate?.(12); } catch {} }
  };

  const startHold = () => {
    addHug();
    if (reduce) return; // reduced-motion → tap increments only
    holdRef.current = window.setInterval(addHug, 320);
  };
  const endHold = () => { if (holdRef.current) { window.clearInterval(holdRef.current); holdRef.current = null; } };
  useEffect(() => () => endHold(), []);

  const waText = encodeURIComponent(
    `${data.senderName?.trim() || "Someone"}, I just opened your letter and I felt every word. Sending ${hugs || "all my"} hugs back 🤍`,
  );
  const waHref = `https://wa.me/?text=${waText}`;

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", width: "100%", textAlign: "center" }}>
      <p style={{ fontFamily: FONT_BODY, fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: NIGHT.mutedNight, margin: 0 }}>🤍 Send it back</p>
      <h2 style={{ fontFamily: FONT_HEADING, fontWeight: 700, fontSize: "clamp(28px,8vw,40px)", color: NIGHT.onNight, margin: "8px 0 4px", lineHeight: 1.05 }}>Hold to send a hug</h2>
      <p aria-live="polite" style={{ fontFamily: FONT_HEADING, fontWeight: 700, fontSize: "clamp(34px,10vw,52px)", color: NIGHT.lime, margin: "10px 0", fontVariantNumeric: "tabular-nums" }}>
        {hugs} <span style={{ fontSize: 18, color: NIGHT.mutedNight, fontWeight: 500 }}>hugs</span>
      </p>

      <motion.button
        type="button"
        onPointerDown={startHold}
        onPointerUp={endHold}
        onPointerLeave={endHold}
        aria-label="Press and hold to send a hug"
        whileTap={{ scale: 0.94 }}
        animate={reduce ? {} : { scale: [1, 1.06, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        style={{ width: 120, height: 120, minWidth: 48, borderRadius: 999, border: "none", cursor: "pointer", background: BRAND_GRADIENT, display: "grid", placeItems: "center", margin: "0 auto 26px", boxShadow: "0 0 40px rgba(247,37,133,.4)" }}
      >
        <Heart size={48} fill={NIGHT.onNight} color={NIGHT.onNight} />
      </motion.button>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: FONT_BODY, fontWeight: 700, fontSize: 15, color: NIGHT.base, background: NIGHT.lime, borderRadius: 999, padding: "14px 22px", minHeight: 48, textDecoration: "none" }}
        >
          <Heart size={17} fill={NIGHT.base} /> Send a hug back 🤍
        </a>
        <Link
          href="/templates"
          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: FONT_BODY, fontWeight: 700, fontSize: 15, color: NIGHT.onNight, background: BRAND_GRADIENT, borderRadius: 999, padding: "14px 22px", minHeight: 48, textDecoration: "none" }}
        >
          <Sparkles size={16} /> Make one for someone you miss
        </Link>
      </div>
      {mode === "preview" && (
        <p style={{ fontFamily: FONT_BODY, fontSize: 12, color: NIGHT.mutedNight, marginTop: 16 }}>Preview — publish to get a shareable link.</p>
      )}
    </div>
  );
}
