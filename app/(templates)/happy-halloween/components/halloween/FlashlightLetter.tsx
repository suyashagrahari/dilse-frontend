"use client";

// Room 5 — The Attic Letter. A new kit-level piece for this day.
//
// The attic is pitch dark; the letter is there, but all you can see is the
// circle of a flashlight. Move your finger (or the mouse) and the beam
// follows — a CSS radial-gradient mask driven by --x/--y custom properties,
// painted on the compositor, never a re-render per move. Sweep about 60% of
// the page and a bulb clicks on; "Turn the lights on" is always there too.
//
// Accessibility (the reference's rule): the letter is ALWAYS fully in the DOM
// as real text — the darkness is a decorative aria-hidden layer — so screen
// readers and keyboard users read it at once, and the page scrolls normally.
// Before the first touch the beam drifts on its own so it's obvious what to
// do. Reduced motion: no drifting, a bigger beam.

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { FONTS, VW } from "../../../_valentine/theme";
import { HW_DISPLAY } from "./fonts";
import { Btn, Hint, HW, RoomTitle } from "./ui";

const COLS = 6;
const ROWS = 8;
const NEED = 0.6;

/**
 * The page prints "Dear <name>," above and "— <sender>" below, so a letter that
 * brings its own short salutation / sign-off loses those lines here (only when
 * they are short and carry the name — never real content).
 */
function tidyLetter(letter: string, recipient: string, sender: string): string[] {
  const paras = letter.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const short = (p: string) => p.split(/\s+/).length <= 5 && p.length <= 48;
  const has = (p: string, name: string) => !!name && p.toLowerCase().includes(name.toLowerCase());
  if (paras.length > 1 && short(paras[0]) && has(paras[0], recipient)) paras.shift();
  if (paras.length > 1) {
    const last = paras[paras.length - 1];
    const lines = last.split("\n");
    if (short(last) && has(last, sender)) paras.pop();
    else if (lines.length > 1 && has(lines[lines.length - 1], sender) && short(lines[lines.length - 1])) {
      lines.pop();
      if (lines.length && short(lines[lines.length - 1]) && /[,!]$/.test(lines[lines.length - 1])) lines.pop();
      paras[paras.length - 1] = lines.join("\n");
    }
  }
  return paras.filter(Boolean);
}

export default function FlashlightLetter({ letter, sender, recipient, onNext }: { letter: string; sender: string; recipient: string; onNext: () => void }) {
  const reduced = useReducedMotion();
  const boxRef = useRef<HTMLDivElement | null>(null);
  const seen = useRef<boolean[]>(Array(COLS * ROWS).fill(false));
  const touched = useRef(false);
  const [lit, setLit] = useState(false);
  const [moved, setMoved] = useState(false);
  const [pct, setPct] = useState(0);
  const paras = tidyLetter(letter, recipient, sender);

  const R = reduced ? 120 : 92;

  const lightsOn = () => {
    if (lit) return;
    haptic([10, 30, 10]);
    setLit(true);
  };

  const shine = (clientX: number, clientY: number) => {
    const box = boxRef.current;
    if (!box || lit) return;
    const r = box.getBoundingClientRect();
    const x = clientX - r.left;
    const y = clientY - r.top;
    box.style.setProperty("--x", `${x}px`);
    box.style.setProperty("--y", `${y}px`);
    if (!touched.current) {
      touched.current = true;
      setMoved(true);
    }
    const cw = r.width / COLS;
    const ch = r.height / ROWS;
    let changed = false;
    for (let i = 0; i < COLS; i++)
      for (let j = 0; j < ROWS; j++) {
        const k = j * COLS + i;
        if (seen.current[k]) continue;
        if (Math.hypot(x - (i + 0.5) * cw, y - (j + 0.5) * ch) < R * 0.85) {
          seen.current[k] = true;
          changed = true;
        }
      }
    if (changed) {
      const share = seen.current.filter(Boolean).length / seen.current.length;
      setPct(Math.round(share * 100));
      if (share >= NEED) lightsOn();
    }
  };

  // Idle drift before the first touch, so the beam explains itself.
  useEffect(() => {
    if (reduced || moved || lit) return;
    const box = boxRef.current;
    if (!box) return;
    let raf = 0;
    const t0 = performance.now();
    const loop = (t: number) => {
      const s = (t - t0) / 1000;
      const w = box.clientWidth;
      const h = box.clientHeight;
      box.style.setProperty("--x", `${(0.5 + 0.32 * Math.sin(s * 0.9)) * w}px`);
      box.style.setProperty("--y", `${(0.4 + 0.25 * Math.sin(s * 0.63 + 1)) * h}px`);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduced, moved, lit]);

  // Touch scrolling still moves the beam (pointer events stop once the page pans).
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) shine(t.clientX, t.clientY);
    };
    box.addEventListener("touchmove", onTouch, { passive: true });
    box.addEventListener("touchstart", onTouch, { passive: true });
    return () => {
      box.removeEventListener("touchmove", onTouch);
      box.removeEventListener("touchstart", onTouch);
    };
  });

  return (
    <>
      <RoomTitle kicker="Room 5 · the attic" title="A letter in the dark" sub={lit ? "Lights on. Take your time." : "Somebody left a letter up here. Move the flashlight to read it."} />

      {/* the bulb */}
      <div aria-hidden style={{ display: "grid", justifyItems: "center", marginTop: -6 }}>
        <span style={{ width: 2, height: 22, background: "rgba(247,243,255,.35)" }} />
        <span
          style={{
            width: 26,
            height: 32,
            borderRadius: "50% 50% 45% 45%",
            background: lit ? "radial-gradient(circle at 50% 40%, #FFF8D6, #FFD27A 60%, #FFB347)" : "rgba(247,243,255,.16)",
            boxShadow: lit ? "0 0 40px 14px rgba(255,210,122,.45)" : "none",
            transition: "all .5s",
          }}
        />
      </div>

      <div
        ref={boxRef}
        onPointerMove={(e) => shine(e.clientX, e.clientY)}
        onPointerDown={(e) => shine(e.clientX, e.clientY)}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "calc(460px * var(--vw-s, 1))",
          borderRadius: 14,
          ["--x" as string]: "50%",
          ["--y" as string]: "30%",
          ["--r" as string]: `${R}px`,
          cursor: lit ? "auto" : "none",
        }}
      >
        <article
          aria-label={`A letter from ${sender} to ${recipient}`}
          style={{
            position: "relative",
            padding: "26px 22px 24px",
            borderRadius: 14,
            background: `linear-gradient(180deg, ${VW.paper}, #F6E7C8)`,
            color: VW.paperInk,
            boxShadow: "0 24px 50px -20px rgba(0,0,0,.8)",
            textAlign: "left",
            userSelect: "text",
            WebkitUserSelect: "text",
          }}
        >
          <p style={{ margin: "0 0 12px", font: `400 26px/1.1 ${HW_DISPLAY}`, color: HW.pumpkinDeep }}>Dear {recipient},</p>
          {paras.map((p, i) => (
            <p key={i} style={{ margin: "0 0 12px", font: `400 17px/1.62 ${FONTS.serif}`, whiteSpace: "pre-line", overflowWrap: "anywhere" }}>
              {p}
            </p>
          ))}
          <p style={{ margin: "14px 0 0", font: `700 26px ${FONTS.script}`, textAlign: "right" }}>— {sender}</p>
        </article>
        {/* the darkness: decorative, never hides the text from assistive tech */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: -2,
            borderRadius: 16,
            pointerEvents: "none",
            background:
              "radial-gradient(circle var(--r) at var(--x) var(--y), rgba(255,236,170,.10) 0%, rgba(8,5,18,0) 45%, rgba(8,5,18,.55) 72%, rgba(8,5,18,.97) 100%)",
            opacity: lit ? 0 : 1,
            transition: "opacity .9s ease",
          }}
        />
      </div>

      {!lit ? (
        <>
          <Hint>{moved ? `Keep looking around… ${pct}%` : "Drag your finger over the dark page 🔦"}</Hint>
          <button
            type="button"
            onClick={lightsOn}
            style={{ minHeight: 44, padding: "10px 18px", borderRadius: 14, border: "1.5px solid rgba(255,210,122,.5)", background: "rgba(255,210,122,.1)", color: HW.candle, font: `600 14px ${FONTS.ui}`, cursor: "pointer" }}
          >
            💡 Turn the lights on
          </button>
        </>
      ) : (
        <motion.div initial={reduced ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduced ? 0 : 0.5 }}>
          <Btn onClick={onNext}>Down to the potion room →</Btn>
        </motion.div>
      )}
    </>
  );
}
