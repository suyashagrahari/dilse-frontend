"use client";

// ─── Happy Halloween — "The Little Haunted House" ────────────────────────────
//
// doorstep (knock ×3 — the first gesture, so the music starts here) →
// trick or treat (mini-game A: catch five sweets, or a slow-fade BOO) →
// carve the pumpkin (the wow: trace the face, the candle lights, their word
// glows through the back) → the haunted hallway (wipe fogged portraits =
// their photos) → the attic letter (read by flashlight) → the potion of us
// (mini-game B: pour the ingredients, hold to stir, the spell) → "Will you be
// my boo?" with a No that ghosts them → YES warms the whole night (moon →
// heart, indigo → amber) → the Boo License + "Boo someone back".
//
// Seven little pumpkins at the top light up room by room. Every interaction
// has a "do it for me"; nothing needs two hands; reduced motion keeps every
// beat with the movement taken out. Sound-free — the page's music is the only
// audio (YouTube songs play as audio only for this day, see day.music).

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getDay } from "../../_valentine/days";
import { HALLOWEEN_TONES, type HalloweenExtras, type HalloweenTone } from "../../_valentine/days/happy-halloween";
import { DayRoot, MusicToggle, Sticker, burst, useReducedMotion, useSynthMusic } from "../../_valentine/kit";
import { FONTS, VW } from "../../_valentine/theme";
import type { ExperienceProps, GifSlot } from "../../_valentine/types";
import { Ghost, Pumpkin } from "./halloween/art";
import Atmosphere from "./halloween/Atmosphere";
import CarvePumpkin from "./halloween/CarvePumpkin";
import Doorstep from "./halloween/Doorstep";
import Ending from "./halloween/Ending";
import FlashlightLetter from "./halloween/FlashlightLetter";
import { hwDisplay, HW_DISPLAY } from "./halloween/fonts";
import Hallway from "./halloween/Hallway";
import Potion, { type Ingredient } from "./halloween/Potion";
import Question from "./halloween/Question";
import TrickOrTreat from "./halloween/TrickOrTreat";
import { Btn, HW, clean } from "./halloween/ui";

const day = getDay("happy-halloween");

type Step = "door" | "treat" | "carve" | "hallway" | "letter" | "potion" | "question" | "ending";
const STEPS: Step[] = ["door", "treat", "carve", "hallway", "letter", "potion", "question", "ending"];
const ROOMS = STEPS.length - 1;

const DEFAULT_INGREDIENTS: Ingredient[] = [
  { name: "A pinch of your laugh", line: "the loud one, at the worst moment" },
  { name: "One stolen fry", line: "you always take the crispy one" },
  { name: "A spoon of moonlight", line: "for every late-night walk" },
];

const TONES = Object.keys(HALLOWEEN_TONES) as HalloweenTone[];
const isToneDefault = (q: string) => TONES.some((t) => HALLOWEEN_TONES[t].question === q);

export default function HalloweenExperience({ data, mode, react }: ExperienceProps) {
  const x = data.extras as HalloweenExtras;
  const reduced = useReducedMotion();
  const music = useSynthMusic({ melody: day.melody, enabled: mode === "live" && data.music });

  const tone: HalloweenTone = TONES.includes(x.tone) ? x.tone : "romantic";
  const T = HALLOWEEN_TONES[tone];
  const recipient = data.recipientName || "You";
  const sender = data.senderName || "Me";
  // An empty question — or the default of another tone, after the sender
  // switched "Who's it for?" — follows the current tone.
  const question = clean(x.question) && !isToneDefault(clean(x.question)) ? clean(x.question) : T.question;
  const carveWord = (clean(x.carveWord) || clean(data.petName) || recipient.split(/\s+/)[0] || "BOO").slice(0, 10).toUpperCase();
  const ingredients = useMemo<Ingredient[]>(() => {
    const list = (Array.isArray(x.ingredients) ? x.ingredients : []).map((it) => ({ name: clean(it?.name), line: clean(it?.line) })).filter((it) => it.name);
    return (list.length >= 1 ? list : DEFAULT_INGREDIENTS).slice(0, 5);
  }, [x.ingredients]);

  const [i, setI] = useState(0);
  const step = STEPS[i];
  const next = () => setI((v) => Math.min(STEPS.length - 1, v + 1));
  const [answered, setAnswered] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const replay = () => {
    setAnswered(null);
    setRound((r) => r + 1);
    setI(0);
  };

  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "auto" });
  }, [step, answered]);

  const completed = useRef(false);
  useEffect(() => {
    if (step === "ending" && !completed.current) {
      completed.current = true;
      react("completed");
    }
  }, [step, react]);

  const sayYes = (dodges: number) => {
    setAnswered(dodges);
    react("answered", { noDodges: dodges });
    burst({ kind: "hearts", emojis: ["💜", "🧡", "💖", "🦇", "💜"], origin: { x: 0.5, y: 0.45 }, count: 40 });
    if (!reduced) window.setTimeout(() => burst({ kind: "hearts", emojis: ["💜", "🧡", "✨"], origin: { x: 0.8, y: 0.15 }, count: 18, spread: 0.3 }), 500);
  };

  const sticker = (id: string, size = 96): ReactNode => {
    const s: GifSlot | undefined = day.gifSlots.find((g) => g.id === id);
    return s ? <Sticker slug={day.slug} slot={s} value={data.gifs[s.id]} size={size} /> : null;
  };

  const warm = answered !== null;

  const screen = (key: string, children: ReactNode, opts: { center?: boolean } = {}) => (
    <motion.section
      key={`${key}-${round}`}
      initial={reduced ? false : { opacity: 0, y: 18, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={reduced ? undefined : { opacity: 0, y: -14, filter: "blur(4px)" }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      style={{
        minHeight: "calc(100dvh - var(--vw-dock-space, 0px))",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: opts.center === false ? "flex-start" : "center",
        gap: 16,
        padding: `100px 18px ${mode === "preview" ? 40 : 48}px`,
        textAlign: "center",
        position: "relative",
        zIndex: 1,
        maxWidth: "calc(560px * var(--vw-s, 1))",
        margin: "0 auto",
        boxSizing: "border-box",
      }}
    >
      {children}
    </motion.section>
  );

  return (
    <DayRoot
      day={day}
      data={data}
      className={hwDisplay.variable}
      line={clean(x.houseName) || day.title}
      art={
        <div style={{ position: "relative", height: "100%", aspectRatio: "1 / 1", display: "grid", placeItems: "end center" }}>
          <Pumpkin size={150} face lit />
          <span style={{ position: "absolute", right: "-6%", top: "-4%" }}>
            <Ghost size={70} wave mood="happy" />
          </span>
        </div>
      }
    >
      <Atmosphere warm={warm} />
      {mode === "live" && <MusicToggle music={music} />}

      {/* seven little pumpkins: one per room */}
      <div
        aria-label={`Room ${Math.min(i + 1, ROOMS)} of ${ROOMS}`}
        role="img"
        style={{ position: "fixed", top: 62, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 5, padding: "5px 10px", borderRadius: 99, background: "rgba(23,18,43,.66)", border: "1px solid rgba(247,243,255,.12)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", zIndex: 20 }}
      >
        {Array.from({ length: ROOMS }, (_, k) => {
          const done = k < i;
          const here = k === i;
          return (
            <motion.span
              key={k}
              animate={here && !reduced ? { y: [0, -3, 0] } : { y: 0 }}
              transition={{ duration: 1.4, repeat: here ? Infinity : 0 }}
              style={{ fontSize: 15, lineHeight: 1, filter: done || here || step === "ending" ? (done || step === "ending" ? "drop-shadow(0 0 4px #FFB347)" : "none") : "grayscale(1) brightness(.6)", opacity: done || here || step === "ending" ? 1 : 0.55 }}
            >
              🎃
            </motion.span>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {step === "door" && screen("door", <Doorstep recipient={recipient} petName={data.petName} houseName={clean(x.houseName)} sticker={sticker("h1-doorstep", 64)} onEnter={next} />)}
        {step === "treat" && screen("treat", <TrickOrTreat trickLine={clean(x.trickLine)} gentle={T.gentle} sticker={sticker("h2-treat", 84)} onNext={next} />)}
        {step === "carve" && screen("carve", <CarvePumpkin word={carveWord} onNext={next} />)}
        {step === "hallway" && screen("hallway", <Hallway photos={data.photos} preview={mode === "preview"} sticker={sticker("h3-portrait", 72)} onNext={next} />, { center: false })}
        {step === "letter" && screen("letter", <FlashlightLetter letter={data.letter || "Happy Halloween."} sender={sender} recipient={recipient} onNext={next} />, { center: false })}
        {step === "potion" && screen("potion", <Potion ingredients={ingredients} spell={clean(x.potionSpell)} sticker={sticker("h4-potion", 70)} onNext={next} />)}
        {step === "question" &&
          answered === null &&
          screen("question", <Question question={question} yesLabel={T.yes} noLines={T.noLines} gentle={T.gentle} onYes={sayYes} />)}
        {step === "question" &&
          answered !== null &&
          screen(
            "yes",
            <>
              {sticker("h5-boo", 130)}
              <h2 style={{ margin: 0, font: `400 calc(40px * var(--vw-s, 1))/1.05 ${HW_DISPLAY}`, color: VW.ink, textShadow: "0 2px 24px rgba(255,158,196,.5)" }}>
                {recipient} said YES! 💜
              </h2>
              <p style={{ margin: 0, maxWidth: 360, font: `italic 400 20px/1.45 ${FONTS.serif}`, color: VW.ink, overflowWrap: "anywhere" }}>
                {clean(x.yesLine) || "Booked. Booed. Yours."}
              </p>
              {answered > 0 && !T.gentle && (
                <p style={{ margin: 0, font: `400 18px ${HW_DISPLAY}`, color: HW.mint }}>
                  …after the No button ghosted you {answered} {answered === 1 ? "time" : "times"} 👻
                </p>
              )}
              <p style={{ margin: 0, font: `500 14px ${FONTS.ui}`, color: VW.inkSoft }}>The moon noticed. Look up 🌙→💗</p>
              <Btn onClick={next}>Get your Boo License →</Btn>
            </>,
          )}
        {step === "ending" &&
          screen(
            "ending",
            <Ending
              day={day}
              data={data}
              mode={mode}
              recipient={recipient}
              sender={sender}
              costume={x.costume}
              costumeWhy={clean(x.costumeWhy)}
              licenseTitle={T.license(sender)}
              replyText={T.reply}
              sticker={null}
              onReplay={replay}
            />,
            { center: false },
          )}
      </AnimatePresence>
    </DayRoot>
  );
}
