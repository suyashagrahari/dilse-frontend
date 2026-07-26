"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { MissYouData } from "./types";
import { NIGHT, LIGHT, FONT_HEADING, FONT_BODY } from "./theme";

/** §5 A Secret — scratch-off canvas reveal (pointer). Reduced-motion / keyboard
 *  users get a "Tap to reveal" button instead. Auto-completes at ~55% cleared. */
export default function ScratchSecret({ data }: { data: MissYouData }) {
  const reduce = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [burst, setBurst] = useState(false);
  const drawing = useRef(false);
  const secret = data.secret?.trim() || "You're my favourite place in the whole world. 🤍";

  const complete = () => {
    if (revealed) return;
    setRevealed(true);
    setBurst(true);
    window.setTimeout(() => setBurst(false), 900);
  };

  useEffect(() => {
    if (reduce) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#6C5CE7"); g.addColorStop(1, "#F72585");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "rgba(255,255,255,.85)";
    ctx.font = "600 14px Inter, system-ui, sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("scratch to see what I didn't say", w / 2, h / 2);
    ctx.globalCompositeOperation = "destination-out";

    const pos = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const scratch = (x: number, y: number) => {
      ctx.beginPath(); ctx.arc(x, y, 22, 0, Math.PI * 2); ctx.fill();
    };
    const pct = () => {
      const data0 = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let clear = 0;
      for (let i = 3; i < data0.length; i += 4 * 40) if (data0[i] === 0) clear++;
      return clear / (data0.length / (4 * 40));
    };
    const down = (e: PointerEvent) => { drawing.current = true; const p = pos(e); scratch(p.x, p.y); };
    const move = (e: PointerEvent) => { if (!drawing.current) return; const p = pos(e); scratch(p.x, p.y); };
    const up = () => { if (!drawing.current) return; drawing.current = false; if (pct() > 0.55) complete(); };
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  return (
    <div style={{ maxWidth: 460, margin: "0 auto", width: "100%", textAlign: "center" }}>
      <p style={{ fontFamily: FONT_BODY, fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: NIGHT.mutedNight, margin: 0 }}>✦ A secret</p>
      <h2 style={{ fontFamily: FONT_HEADING, fontWeight: 600, fontSize: "clamp(22px,6vw,30px)", color: NIGHT.onNight, margin: "6px 0 20px" }}>What I didn&apos;t say out loud</h2>

      <div style={{ position: "relative", borderRadius: 20, overflow: "hidden", background: LIGHT.surface, boxShadow: `0 0 40px rgba(108,92,231,.25)`, minHeight: 160, display: "grid", placeItems: "center", padding: 24 }}>
        <motion.p
          animate={revealed ? { scale: 1, opacity: 1 } : { scale: 0.96, opacity: 1 }}
          transition={{ duration: 0.4 }}
          style={{ fontFamily: FONT_BODY, fontSize: 17, lineHeight: 1.6, color: LIGHT.text, margin: 0 }}
        >
          {secret}
        </motion.p>

        {!reduce && (
          <AnimatePresence>
            {!revealed && (
              <motion.canvas
                ref={canvasRef}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                aria-hidden="true"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", touchAction: "none", cursor: "grab", borderRadius: 20 }}
              />
            )}
          </AnimatePresence>
        )}

        <AnimatePresence>
          {burst && !reduce && (
            <motion.div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <motion.span key={i}
                  initial={{ opacity: 1, x: 0, y: 0, scale: 0.6 }}
                  animate={{ opacity: 0, x: (i - 2.5) * 42, y: -60 - i * 6, scale: 1.2 }}
                  transition={{ duration: 0.7 }}
                  style={{ position: "absolute", left: "50%", top: "55%", fontSize: 20 }}>💗</motion.span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {(reduce && !revealed) && (
        <button type="button" onClick={complete}
          style={{ marginTop: 16, fontFamily: FONT_BODY, fontWeight: 700, fontSize: 14, color: NIGHT.base, background: NIGHT.lime, border: "none", borderRadius: 999, padding: "12px 22px", minHeight: 44, cursor: "pointer" }}>
          Tap to reveal
        </button>
      )}
      {!reduce && !revealed && (
        <p style={{ fontFamily: FONT_BODY, fontSize: 12, color: NIGHT.mutedNight, marginTop: 12 }}>rub your finger over the card</p>
      )}
    </div>
  );
}
