"use client";

// ─── ChocolateDayExperience — "Ek Dabba Pyaar" ───────────────────────────────
//
//   1. box     wrapped box → drag the ribbon's tag to untie (tap fallback) →
//              the lid swings up → menu card "N pieces, N reasons" (GIF c1)
//              → tray: tap a piece → peel foil → bite → the reason rises.
//              The 5th piece eaten is the gooey one (photo inside, GIF c2).
//              All eaten → the heart truffle glows → hold to melt it.
//   2. pour    melted chocolate pours over the screen…
//   3. letter  …and sets into a slab engraved with the last reason; the
//              wrapper paper unrolls with the letter (GIF c3)
//   4. photos  "The Assortment" — candy cups with flavour captions (GIF c4)
//   5. ending  "One more piece?" → Yes (GIF c5) → box receipt keepsake +
//              EndingActions; react("completed", { count }) once.
//
// Files: chocoArt (all SVG art + CSS), ChocoBox (stage 1), PieceFocus (one
// piece up close), ChocoLetter, Assortment, ChocoEnding, chocoSfx.

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getDay } from "../../_valentine/days";
import { chocolateDay, type ChocolateExtras } from "../../_valentine/days/happy-chocolate-day";
import { DayRoot, FloatingParticles, MusicToggle, Sticker, useReducedMotion, useSynthMusic } from "../../_valentine/kit";
import type { ExperienceProps } from "../../_valentine/types";
import { C, CHOCO_CSS, CHOCOS, ChocoArt, CocoaDust, HEART_CHOCO } from "./chocoArt";
import ChocoBox from "./ChocoBox";
import ChocoLetter from "./ChocoLetter";
import Assortment from "./Assortment";
import ChocoEnding from "./ChocoEnding";

type Step = "box" | "letter" | "photos" | "ending";
const STEPS: Step[] = ["box", "letter", "photos", "ending"];

export default function ChocolateDayExperience({ data, mode, react }: ExperienceProps) {
  const day = getDay("happy-chocolate-day");
  const x = data.extras as ChocolateExtras;
  const reduced = useReducedMotion();
  const music = useSynthMusic({ melody: day.melody, enabled: mode === "live" && data.music });
  const sound = music.playing;

  const size = x.boxSize === "6" ? 6 : 9;
  const { reasons, heartReason } = useMemo(() => {
    const defaults = (chocolateDay.demo.extras.reasons ?? []) as string[];
    const given = (Array.isArray(x.reasons) ? x.reasons : []).map((s) => (typeof s === "string" ? s.trim() : "")).filter(Boolean);
    const heart = given.length ? given[given.length - 1] : defaults[defaults.length - 1] ?? "Because you're you.";
    const regularGiven = given.length > 1 ? given.slice(0, -1) : [];
    const pool = defaults.slice(0, -1).filter((d) => !regularGiven.includes(d));
    const regular = Array.from({ length: size - 1 }, (_, i) => regularGiven[i] ?? pool[i - regularGiven.length] ?? pool[i % Math.max(1, pool.length)] ?? "You make every day sweeter.");
    return { reasons: regular, heartReason: heart };
  }, [x.reasons, size]);

  const [step, setStep] = useState<Step>("box");
  const [run, setRun] = useState(0);
  const [pouring, setPouring] = useState(false);
  const [eaten, setEaten] = useState(0);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const go = useCallback((s: Step) => {
    setStep(s);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const onMelted = useCallback(
    (n: number) => {
      setEaten(n);
      if (reduced) return go("letter");
      setPouring(true);
      timers.current.push(window.setTimeout(() => go("letter"), 900));
      timers.current.push(window.setTimeout(() => setPouring(false), 1150));
    },
    [go, reduced],
  );

  const completed = useRef(false);
  useEffect(() => {
    if (step !== "ending" || completed.current) return;
    completed.current = true;
    react("completed", { count: Math.max(eaten, size - 1) });
  }, [step, react, eaten, size]);

  const sticker = useCallback(
    (id: string, px: number, style?: CSSProperties) => {
      const slot = day.gifSlots.find((g) => g.id === id);
      return slot ? <Sticker slug={day.slug} slot={slot} value={data.gifs[slot.id]} size={px} style={style} /> : null;
    },
    [day, data.gifs],
  );

  const date = useMemo(() => new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase(), []);

  const replay = () => {
    setRun((r) => r + 1);
    setEaten(0);
    go("box");
  };

  const i = STEPS.indexOf(step);
  const preview = mode === "preview";

  return (
    <DayRoot
      day={day}
      data={data}
      line={x.giftTag}
      art={
        <div style={{ position: "relative", height: "100%", aspectRatio: "1.3" }}>
          <ChocoArt shape="round" choco={CHOCOS[0]} size="42%" style={{ position: "absolute", left: "2%", bottom: "6%", transform: "rotate(-14deg)" }} />
          <ChocoArt shape="square" choco={CHOCOS[2]} size="38%" style={{ position: "absolute", right: "2%", bottom: "10%", transform: "rotate(12deg)" }} />
          <ChocoArt shape="heart" choco={HEART_CHOCO} size="62%" style={{ position: "absolute", left: "19%", top: 0 }} />
        </div>
      }
    >
      <style>{CHOCO_CSS}</style>
      {/* atmosphere: warm vignette, cocoa dust, a few floating sweets */}
      <div aria-hidden style={{ position: "fixed", inset: 0, pointerEvents: "none", background: "radial-gradient(90% 70% at 50% 35%, transparent 40%, rgba(20,8,4,.55) 100%)", zIndex: 0 }} />
      <CocoaDust count={reduced ? 0 : 22} />
      <FloatingParticles emojis={day.theme.particles} count={7} opacity={0.32} />
      {mode === "live" && <MusicToggle music={music} />}

      {/* progress: four little chocolates */}
      <div aria-hidden style={{ position: "fixed", top: 18, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6, zIndex: 20, padding: "6px 9px", borderRadius: 99, background: "rgba(36,19,12,.45)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}>
        {STEPS.map((s, k) => (
          <span key={s} style={{ width: k === i ? 22 : 8, height: 8, borderRadius: 3, background: k <= i ? C.gold : "rgba(255,244,230,.22)", boxShadow: k <= i ? "inset 0 -2px 0 rgba(0,0,0,.2)" : "none", transition: "width .35s, background .35s" }} />
        ))}
      </div>

      <div style={{ position: "relative", zIndex: 1, minHeight: "calc(100dvh - var(--vw-dock-space, 0px))", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <AnimatePresence mode="wait">
          <motion.section
            key={`${step}-${run}`}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -12 }}
            transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
            style={{ width: "100%", minHeight: "calc(100dvh - var(--vw-dock-space, 0px))", display: "flex", flexDirection: "column", alignItems: "center" }}
          >
            {step === "box" && (
              <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", padding: `52px 16px ${preview ? 120 : 40}px` }}>
                <ChocoBox
                  key={run}
                  recipientName={data.recipientName}
                  petName={data.petName}
                  senderName={data.senderName}
                  giftTag={x.giftTag ?? ""}
                  size={size}
                  reasons={reasons}
                  photo={data.photos[0]}
                  reduced={reduced}
                  sound={sound}
                  preview={preview}
                  sticker={sticker}
                  onMelted={onMelted}
                />
              </div>
            )}
            {step === "letter" && (
              <ChocoLetter
                letter={data.letter}
                recipientName={data.recipientName}
                senderName={data.senderName}
                engraving={heartReason}
                reduced={reduced}
                preview={preview}
                sticker={sticker}
                onNext={() => go("photos")}
                nextLabel="There's a second layer →"
              />
            )}
            {step === "photos" && <Assortment photos={data.photos} reduced={reduced} preview={preview} sticker={sticker} onNext={() => go("ending")} />}
            {step === "ending" && (
              <ChocoEnding
                day={day}
                data={data}
                mode={mode}
                finalAsk={x.finalAsk ?? ""}
                info={{ recipient: data.recipientName, sender: data.senderName, pieces: size, eaten, endLine: data.endLine, date }}
                reduced={reduced}
                sticker={sticker}
                onReplay={replay}
              />
            )}
          </motion.section>
        </AnimatePresence>
      </div>

      {/* the melted heart pours over everything */}
      <AnimatePresence>{pouring && <Pour key="pour" />}</AnimatePresence>
    </DayRoot>
  );
}

function Pour() {
  return (
    <motion.div
      aria-hidden
      initial={{ y: "-115%" }}
      animate={{ y: "0%" }}
      exit={{ opacity: 0, transition: { duration: 0.6 } }}
      transition={{ duration: 0.85, ease: [0.55, 0, 0.8, 0.5] }}
      style={{ position: "fixed", inset: 0, zIndex: 200, pointerEvents: "none" }}
    >
      <div style={{ position: "absolute", inset: 0, bottom: "-1px", background: "linear-gradient(180deg, #6E1230 0%, #8A3A2A 30%, #6A3D27 60%, #4E2B1B 100%)" }} />
      <svg viewBox="0 0 100 20" preserveAspectRatio="none" style={{ position: "absolute", left: 0, top: "100%", width: "100%", height: 90, marginTop: -1 }}>
        <path d="M0 0 H100 V4 C96 4 95 9 94 14 C93 19 88 19 88 13 C88 8 84 5 79 6 C74 7 75 12 73 16 C71 20 66 19 66 13 C66 8 62 4 56 5 C50 6 52 11 49 11 C46 11 46 6 40 6 C34 6 35 15 31 17 C27 19 25 14 25 10 C25 6 20 4 15 5 C10 6 11 12 7 12 C3 12 4 5 0 5 Z" fill="#4E2B1B" />
      </svg>
      <div style={{ position: "absolute", left: "12%", top: "30%", width: "40%", height: 40, borderRadius: 99, background: "linear-gradient(90deg, rgba(255,255,255,.18), transparent)", filter: "blur(6px)" }} />
    </motion.div>
  );
}
