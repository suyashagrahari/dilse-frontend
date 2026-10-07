"use client";

// ─── TeddyDayExperience — "Teddy Catcher" ────────────────────────────────────
//
//   1. arcade   cosy night arcade: drag the heart coin into the slot → lights
//               chase (GIF t1) → steer the claw ◀ ▶ / drag → GRAB. Rigged to
//               win their named teddy; optional near-miss on try 1.
//   2. teddy    the teddy pops out of the prize door (squash-and-stretch,
//               GIF t2) → wardrobe with the sender's outfit + accessory notes.
//   3. letter   the teddy waddles in carrying the envelope (GIF t3) → lined,
//               felt-stitched notebook letter; the teddy peeks from the corner.
//   4. photos   cork-board polaroids (GIF t4).
//   5. ending   "keep me close" squeeze lines on a pillow (GIF t5) + the teddy
//               adoption certificate keepsake; react("completed") once.
//
// Files: teddyArt (teddy + accessories + plushies + CSS), ClawMachine,
// TeddyWardrobe, TeddyLetter, CorkBoard, TeddyEnding, teddySfx.

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getDay } from "../../_valentine/days";
import type { TeddyExtras } from "../../_valentine/days/happy-teddy-day";
import { DayRoot, FloatingParticles, MusicToggle, Sticker, useReducedMotion, useSynthMusic } from "../../_valentine/kit";
import type { ExperienceProps } from "../../_valentine/types";
import { FairyLights, furOf, isItem, T, TEDDY_CSS, Teddy, wear, type ItemId } from "./teddyArt";
import ClawMachine from "./ClawMachine";
import TeddyWardrobe from "./TeddyWardrobe";
import TeddyLetter from "./TeddyLetter";
import CorkBoard from "./CorkBoard";
import TeddyEnding from "./TeddyEnding";

type Step = "arcade" | "teddy" | "letter" | "photos" | "ending";
const STEPS: Step[] = ["arcade", "teddy", "letter", "photos", "ending"];
const LIGHT: Step[] = ["letter", "photos"];

export default function TeddyDayExperience({ data, mode, react }: ExperienceProps) {
  const day = getDay("happy-teddy-day");
  const x = data.extras as TeddyExtras;
  const reduced = useReducedMotion();
  const music = useSynthMusic({ melody: day.melody, enabled: mode === "live" && data.music });
  const sound = music.playing;
  const preview = mode === "preview";

  const teddyName = (typeof x.teddyName === "string" && x.teddyName.trim()) || "Golu";
  const fur = furOf(x.furColor);
  const { initialWorn, notes } = useMemo(() => {
    let w: ItemId[] = [];
    const n: Partial<Record<ItemId, string>> = {};
    for (const o of Array.isArray(x.outfit) ? x.outfit.slice(0, 4) : []) {
      if (!o || !isItem(o.item)) continue;
      w = wear(w, o.item);
      if (typeof o.note === "string" && o.note.trim()) n[o.item] = o.note.trim();
    }
    return { initialWorn: w, notes: n };
  }, [x.outfit]);
  const squeezeLines = useMemo(() => (Array.isArray(x.squeezeLines) ? x.squeezeLines.filter((s): s is string => typeof s === "string" && !!s.trim()) : []), [x.squeezeLines]);

  const [step, setStep] = useState<Step>("arcade");
  const [run, setRun] = useState(0);
  const [worn, setWorn] = useState<ItemId[]>(initialWorn);
  useEffect(() => setWorn(initialWorn), [initialWorn]);

  const go = useCallback((s: Step) => {
    setStep(s);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const completed = useRef(false);
  useEffect(() => {
    if (step !== "ending" || completed.current) return;
    completed.current = true;
    react("completed");
  }, [step, react]);

  const sticker = useCallback(
    (id: string, px: number, style?: CSSProperties) => {
      const slot = day.gifSlots.find((g) => g.id === id);
      return slot ? <Sticker slug={day.slug} slot={slot} value={data.gifs[slot.id]} size={px} style={style} /> : null;
    },
    [day, data.gifs],
  );
  const date = useMemo(() => new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }), []);

  const replay = () => {
    setRun((r) => r + 1);
    setWorn(initialWorn);
    go("arcade");
  };

  const light = LIGHT.includes(step);
  const i = STEPS.indexOf(step);

  return (
    <DayRoot
      day={day}
      data={data}
      dark={!light}
      line={x.winLine}
      art={<Teddy fur={fur} worn={step === "arcade" ? initialWorn : worn} size="100%" style={{ height: "100%", width: "auto" }} />}
    >
      <style>{TEDDY_CSS}</style>
      {/* the cosy bedroom (letter + photos) fades in over the night arcade */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          opacity: light ? 1 : 0,
          transition: "opacity .6s",
          background: `radial-gradient(rgba(205,180,219,.35) 2px, transparent 2.5px) 0 0 / 26px 26px, radial-gradient(rgba(255,143,184,.22) 2px, transparent 2.5px) 13px 13px / 26px 26px, linear-gradient(180deg, ${T.cream}, #F6E9F2)`,
        }}
      />
      {!light && <FairyLights />}
      {!light && <FloatingParticles emojis={day.theme.particles} count={7} opacity={0.3} />}
      {mode === "live" && <MusicToggle music={music} />}

      <div aria-hidden style={{ position: "fixed", top: 18, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6, zIndex: 20, padding: "6px 9px", borderRadius: 99, background: light ? "rgba(74,51,38,.12)" : "rgba(29,22,44,.5)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}>
        {STEPS.map((s, k) => (
          <span key={s} style={{ width: k === i ? 22 : 8, height: 8, borderRadius: 8, background: k <= i ? T.bubblegum : light ? "rgba(74,51,38,.2)" : "rgba(255,248,240,.25)", transition: "width .35s, background .35s" }} />
        ))}
      </div>

      <div style={{ position: "relative", zIndex: 1, minHeight: "calc(100dvh - var(--vw-dock-space, 0px))" }}>
        <AnimatePresence mode="wait">
          <motion.section
            key={`${step}-${run}`}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
            style={{ width: "100%", minHeight: "calc(100dvh - var(--vw-dock-space, 0px))", display: "flex", flexDirection: "column", alignItems: "center" }}
          >
            {step === "arcade" && (
              <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", padding: `52px 16px ${preview ? 120 : 40}px` }}>
                <p style={{ margin: "4px 0 -6px", font: `600 12px var(--vw-font-ui)`, letterSpacing: ".2em", textTransform: "uppercase", color: T.lilac }}>For {data.recipientName || "you"} 🧸</p>
                <ClawMachine
                  recipientName={data.recipientName}
                  senderName={data.senderName}
                  marquee={x.marquee ?? ""}
                  nearMiss={x.nearMiss !== false}
                  fur={fur}
                  worn={initialWorn}
                  reduced={reduced}
                  sound={sound}
                  sticker={sticker}
                  onWin={() => go("teddy")}
                />
              </div>
            )}
            {step === "teddy" && (
              <TeddyWardrobe
                teddyName={teddyName}
                senderName={data.senderName}
                winLine={x.winLine ?? ""}
                fur={fur}
                initialWorn={initialWorn}
                notes={notes}
                reduced={reduced}
                sound={sound}
                preview={preview}
                sticker={sticker}
                onNext={(w) => {
                  setWorn(w);
                  go("letter");
                }}
              />
            )}
            {step === "letter" && (
              <TeddyLetter letter={data.letter} senderName={data.senderName} teddyName={teddyName} fur={fur} worn={worn} reduced={reduced} preview={preview} sticker={sticker} onNext={() => go("photos")} />
            )}
            {step === "photos" && (
              <CorkBoard
                photos={data.photos}
                recipientName={data.recipientName}
                senderName={data.senderName}
                teddyName={teddyName}
                fur={fur}
                worn={worn}
                reduced={reduced}
                preview={preview}
                sticker={sticker}
                onNext={() => go("ending")}
              />
            )}
            {step === "ending" && (
              <TeddyEnding day={day} data={data} mode={mode} teddyName={teddyName} fur={fur} worn={worn} squeezeLines={squeezeLines} date={date} reduced={reduced} sound={sound} sticker={sticker} onReplay={replay} />
            )}
          </motion.section>
        </AnimatePresence>
      </div>
    </DayRoot>
  );
}
