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
// Seven small pumpkins in the top-left corner light up room by room (tap an
// earlier one to go back). Every room is ONE screen (no scrolling at 360×640
// and up): the rooms fit by design, long text pages, and the way forward is
// always the same candy pill at the bottom (./halloween/stage.tsx). Nothing
// moves on by itself and nothing is skipped: her tap on the pill sends the
// witch-seal flying across in a fog wipe. On wide screens the night is
// full-bleed (moon, graveyard, fence, corner webs, bats) and the rooms sit in
// a comfortable column inside it.
//
// Sound: the Haunted Piano (music mode "track") starts on the first tap — the
// first knock. Two jump-scares are earned on the way (the ghost at the door,
// the pumpkin lighting up in the kitchen), three if they dare pick TRICK; each
// ends on a cute "got you! 💜". Kids mode has no scares at all. Every
// interaction also works by plain taps; reduced motion keeps every beat still.

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getDay } from "../../_valentine/days";
import { HALLOWEEN_TONES, type HalloweenExtras, type HalloweenTone } from "../../_valentine/days/happy-halloween";
import { DayRoot, Sticker, burst, useReducedMotion } from "../../_valentine/kit";
import { FONTS, VW } from "../../_valentine/theme";
import type { ExperienceProps, GifSlot } from "../../_valentine/types";
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
import { HW_STAGE_CSS, HwStage, PumpkinTrail, useNext } from "./halloween/stage";
import { HW, clean } from "./halloween/ui";

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
  // A tap on an earlier pumpkin: back to that room. A new round, so its GIFs
  // restart and its scare can be earned again; the YES (if given) is kept.
  const jumpTo = (k: number) => {
    if (k >= i) return;
    setRound((r) => r + 1);
    setI(k);
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

  const screen = (key: string, children: ReactNode) => (
    <motion.section
      key={`${key}-${round}`}
      className="hw-scene"
      data-hw-scene={key}
      // Opacity + translate only (a blur() on a full-screen room repaints on
      // the main thread every frame of the change).
      initial={reduced ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      // The fog wipe (./halloween/stage.tsx) covers the swap: a quick exit, a soft rise out of the fog.
      exit={reduced ? undefined : { opacity: 0, transition: { duration: 0.18 } }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.section>
  );

  return (
    <DayRoot
      day={day}
      data={data}
      className={hwDisplay.variable}
      // Every room is exactly one screen and keeps its own bottom strip for the pill (see .hw-scene).
      style={{ paddingBottom: 0 }}
      // Wide screens: no phone column and no side cards — the haunted night
      // (./halloween/Atmosphere.tsx) is full-bleed and each room composes its
      // content inside it at a comfortable width (see .hw-scene).
      layout="full"
    >
      <style>{HW_STAGE_CSS}</style>
      <Atmosphere warm={warm} grand={step === "door"} />
      {/* seven little pumpkins, one per room, small in the top-left corner: tap an earlier one to go back */}
      <PumpkinTrail at={i} rooms={ROOMS} ending={step === "ending"} onJump={jumpTo} />

      {/* initial={false}: the first room (and its h1, the LCP element) paints at
          its final state instead of waiting on hydration at opacity 0. Later
          rooms still fade in. */}
      <HwStage gentle={T.gentle} round={round}>
        <AnimatePresence mode="wait" initial={false}>
          {step === "door" && screen("door", <Doorstep recipient={recipient} petName={data.petName} houseName={clean(x.houseName)} sticker={sticker("h1-doorstep", 60)} onEnter={next} />)}
          {step === "treat" && screen("treat", <TrickOrTreat trickLine={clean(x.trickLine)} sticker={sticker("h2-treat", 72)} onNext={next} />)}
          {step === "carve" && screen("carve", <CarvePumpkin word={carveWord} recipient={recipient} onNext={next} />)}
          {step === "hallway" && screen("hallway", <Hallway photos={data.photos} preview={mode === "preview"} sticker={sticker("h3-portrait", 60)} onNext={next} />)}
          {step === "letter" && screen("letter", <FlashlightLetter letter={data.letter || "Happy Halloween."} sender={sender} recipient={recipient} onNext={next} />)}
          {step === "potion" && screen("potion", <Potion ingredients={ingredients} spell={clean(x.potionSpell)} sticker={sticker("h4-potion", 60)} onNext={next} />)}
          {step === "question" &&
            answered === null &&
            screen("question", <Question question={question} yesLabel={T.yes} noLines={T.noLines} gentle={T.gentle} onYes={sayYes} />)}
          {step === "question" &&
            answered !== null &&
            screen("yes", <YesRoom recipient={recipient} yesLine={clean(x.yesLine)} dodges={answered} gentle={T.gentle} sticker={sticker("h5-boo", 120)} onNext={next} />)}
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
                onReplay={replay}
              />,
            )}
        </AnimatePresence>
      </HwStage>
    </DayRoot>
  );
}

/** After YES: their sticker, the sender's line, the moon turning into a heart. */
function YesRoom({ recipient, yesLine, dodges, gentle, sticker, onNext }: { recipient: string; yesLine: string; dodges: number; gentle: boolean; sticker: ReactNode; onNext: () => void }) {
  useNext("Your Boo License", onNext, "heart");
  return (
    <div className="hw-fill" style={{ alignContent: "center", gap: "clamp(8px, 1.8dvh, 16px)", display: "grid" }}>
      <div className="hw-zoom" style={{ display: "grid", gap: "inherit", justifyItems: "center" }}>
      <div style={{ display: "grid", placeItems: "center", height: "min(34cqh, 140px)" }}>{sticker}</div>
      <h2 style={{ margin: 0, font: `400 clamp(32px, min(10.5vw, 5.6dvh), 46px)/1.05 ${HW_DISPLAY}`, color: VW.ink, textShadow: "0 2px 24px rgba(255,158,196,.5)", overflowWrap: "anywhere" }}>
        {recipient} said YES! 💜
      </h2>
      <p style={{ margin: "0 auto", maxWidth: 360, font: `italic 400 clamp(17px, 2.6dvh, 20px)/1.45 ${FONTS.serif}`, color: VW.ink, overflowWrap: "anywhere" }}>
        {yesLine || "Booked. Booed. Yours."}
      </p>
      {dodges > 0 && !gentle && (
        <p style={{ margin: 0, font: `400 clamp(15px, 2.3dvh, 18px) ${HW_DISPLAY}`, color: HW.mint }}>
          …after the No button ghosted you {dodges} {dodges === 1 ? "time" : "times"} 👻
        </p>
      )}
      <p style={{ margin: 0, font: `500 14px ${FONTS.ui}`, color: VW.inkSoft }}>The moon noticed. Look up 🌙→💗</p>
      </div>
    </div>
  );
}
