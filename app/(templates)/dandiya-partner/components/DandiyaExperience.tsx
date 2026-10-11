"use client";

// ─── Be My Dandiya Partner — a Navratri Dandiya-night invitation ─────────────
//
// the embroidered envelope (clash the sticks: tak, tak, TAK! — the first
// gesture, so the music starts here) → nine nights (light nine diyas round the
// garbo, each with a line, three with photos) → the dhol game (clash on the
// beat, fill the Dhamaal meter — nobody can lose) → pick your look (twirl a
// chaniya-choli colour, see the sender's beside it) → the garba circle (their
// photos dance round the garbo) → a note tucked in the dupatta (the letter) →
// the invitation ticket (date, time, venue, dress code, add to calendar) →
// "Will you be my Dandiya partner?" with a No that twirls away → YES bursts
// confetti and the panda couple dances → the Dandiya Pass + "invite your own".
//
// Eight little diyas in the top-left corner light up step by step (tap an
// earlier one to go back). Every scene is ONE screen; the way forward is always
// the same marigold pill at the bottom (./dandiya/stage.tsx) and only her tap
// moves on — a bandhani dupatta sweeps across as it does. Wide screens get the
// whole night full-bleed (toran, fairy lights, kandils, the garba glow) with
// the scene in a comfortable column. Reduced motion keeps every beat still.

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getDay } from "../../_valentine/days";
import { DANDIYA_COLORS, DANDIYA_TONES, DEFAULT_NIGHT_LINES, type DandiyaColor, type DandiyaExtras, type DandiyaTone } from "../../_valentine/days/dandiya-partner";
import { DayRoot, Sticker, burst, useReducedMotion } from "../../_valentine/kit";
import { FONTS, VW } from "../../_valentine/theme";
import type { ExperienceProps, GifSlot } from "../../_valentine/types";
import { DD_ART_CSS } from "./dandiya/art";
import Atmosphere from "./dandiya/Atmosphere";
import DupattaLetter from "./dandiya/DupattaLetter";
import Ending from "./dandiya/Ending";
import { ddDisplay, DD_DISPLAY } from "./dandiya/fonts";
import GarbaCircle from "./dandiya/GarbaCircle";
import Gate from "./dandiya/Gate";
import Invitation from "./dandiya/Invitation";
import NineNights from "./dandiya/NineNights";
import PickLook from "./dandiya/PickLook";
import Question from "./dandiya/Question";
import Rhythm from "./dandiya/Rhythm";
import { DD_STAGE_CSS, DdStage, DiyaTrail, useNext } from "./dandiya/stage";
import { DD, clean } from "./dandiya/ui";

const day = getDay("dandiya-partner");

type Step = "gate" | "nights" | "rhythm" | "look" | "circle" | "letter" | "invite" | "question" | "ending";
const STEPS: Step[] = ["gate", "nights", "rhythm", "look", "circle", "letter", "invite", "question", "ending"];
const ROOMS = STEPS.length - 1;

const TONES = Object.keys(DANDIYA_TONES) as DandiyaTone[];
const isToneDefault = (q: string) => TONES.some((t) => DANDIYA_TONES[t].question === q);
const isColor = (c: unknown): c is DandiyaColor => typeof c === "string" && c in DANDIYA_COLORS;

export default function DandiyaExperience({ data, mode, react }: ExperienceProps) {
  const x = data.extras as DandiyaExtras;
  const reduced = useReducedMotion();

  const tone: DandiyaTone = TONES.includes(x.tone) ? x.tone : "romantic";
  const T = DANDIYA_TONES[tone];
  const recipient = data.recipientName || "You";
  const sender = data.senderName || "Me";
  // An empty question — or another tone's default after the sender switched "who" — follows the tone.
  const question = clean(x.question) && !isToneDefault(clean(x.question)) ? clean(x.question) : T.question;
  const nightLines = useMemo(() => {
    const src = Array.isArray(x.nightLines) ? x.nightLines : [];
    return DEFAULT_NIGHT_LINES.map((d, k) => clean(src[k]) || d);
  }, [x.nightLines]);
  const myColor: DandiyaColor = isColor(x.myColor) ? x.myColor : "peacock";

  const [i, setI] = useState(0);
  const step = STEPS[i];
  const next = () => setI((v) => Math.min(STEPS.length - 1, v + 1));
  const [answered, setAnswered] = useState<number | null>(null);
  const [picked, setPicked] = useState<DandiyaColor | null>(null);
  const [round, setRound] = useState(0);
  const replay = () => {
    setAnswered(null);
    setRound((r) => r + 1);
    setI(0);
  };
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
    burst({ kind: "confetti", colors: [DD.marigold, DD.kumkum, DD.peacock, DD.emerald, DD.rani, DD.gold], origin: { x: 0.5, y: 0.4 }, count: 90 });
    burst({ kind: "hearts", emojis: ["💛", "🧡", "💖", "🪔", "✨"], origin: { x: 0.5, y: 0.5 }, count: 30 });
    if (!reduced) window.setTimeout(() => burst({ kind: "petals", emojis: ["🌼", "🌸", "🌼"], origin: { x: 0.5, y: 0.1 }, count: 26, spread: 0.6 }), 600);
  };

  const sticker = (id: string, size = 96): ReactNode => {
    const s: GifSlot | undefined = day.gifSlots.find((g) => g.id === id);
    return s ? <Sticker key={`${id}-${round}`} slug={day.slug} slot={s} value={data.gifs[s.id]} size={size} alt="" /> : null;
  };

  const screen = (key: string, children: ReactNode) => (
    <motion.section
      key={`${key}-${round}`}
      className="dd-scene"
      data-dd-scene={key}
      initial={reduced ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduced ? undefined : { opacity: 0, transition: { duration: 0.18 } }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.section>
  );

  return (
    <DayRoot day={day} data={data} className={ddDisplay.variable} style={{ paddingBottom: 0 }} layout="full">
      <style>{DD_STAGE_CSS + DD_ART_CSS}</style>
      <Atmosphere warm={answered !== null} />
      <DiyaTrail at={i} rooms={ROOMS} ending={step === "ending"} onJump={jumpTo} />

      <DdStage round={round}>
        <AnimatePresence mode="wait" initial={false}>
          {step === "gate" && screen("gate", <Gate recipient={recipient} sender={sender} openingLine={clean(x.openingLine)} sticker={sticker("d1-gate", 76)} onEnter={next} />)}
          {step === "nights" && screen("nights", <NineNights lines={nightLines} photos={data.photos.filter((p) => p && p.url)} onNext={next} />)}
          {step === "rhythm" && screen("rhythm", <Rhythm sticker={sticker("d2-beat", 92)} onNext={next} />)}
          {step === "look" && screen("look", <PickLook myColor={myColor} lookLine={clean(x.lookLine)} sender={sender} onPick={setPicked} onNext={next} />)}
          {step === "circle" && screen("circle", <GarbaCircle photos={data.photos} preview={mode === "preview"} sticker={sticker("d3-garba", 124)} onNext={next} />)}
          {step === "letter" && screen("letter", <DupattaLetter letter={data.letter || "Will you be my Dandiya partner?"} recipient={recipient} sender={sender} onNext={next} />)}
          {step === "invite" &&
            screen(
              "invite",
              <Invitation recipient={recipient} sender={sender} date={clean(x.eventDate)} time={clean(x.eventTime)} venue={clean(x.venue)} dressCode={clean(x.dressCode)} sticker={sticker("d4-invite", 58)} onNext={next} />,
            )}
          {step === "question" && answered === null && screen("question", <Question question={question} yesLabel={T.yes} noLines={T.noLines} onYes={sayYes} />)}
          {step === "question" && answered !== null && screen("yes", <YesRoom recipient={recipient} yesLine={clean(x.yesLine)} dodges={answered} sticker={sticker("d5-yes", 150)} onNext={next} />)}
          {step === "ending" &&
            screen(
              "ending",
              <Ending
                day={day}
                data={data}
                mode={mode}
                recipient={recipient}
                sender={sender}
                passTitle={T.pass}
                picked={picked}
                date={clean(x.eventDate)}
                venue={clean(x.venue)}
                replyText={T.reply}
                onReplay={replay}
              />,
            )}
        </AnimatePresence>
      </DdStage>
    </DayRoot>
  );
}

/** After YES: the panda couple dances, the sender's line, the horizon warms. */
function YesRoom({ recipient, yesLine, dodges, sticker, onNext }: { recipient: string; yesLine: string; dodges: number; sticker: ReactNode; onNext: () => void }) {
  useNext("Your pass", onNext, "heart");
  return (
    <div className="dd-fill" style={{ alignContent: "center" }}>
      <div className="dd-zoom" style={{ display: "grid", gap: "clamp(8px, 1.8dvh, 16px)", justifyItems: "center" }}>
        <div style={{ display: "grid", placeItems: "center", height: "min(32cqh, 170px)" }}>{sticker}</div>
        <h2 style={{ margin: 0, font: `400 clamp(32px, min(10vw, 5.6dvh), 48px)/1.1 ${DD_DISPLAY}`, color: VW.ink, textShadow: "0 2px 24px rgba(255,182,39,.55)", overflowWrap: "anywhere" }}>
          {recipient} said YES! 💛
        </h2>
        <p style={{ margin: "0 auto", maxWidth: 360, font: `italic 400 clamp(17px, 2.6dvh, 20px)/1.45 ${FONTS.serif}`, color: VW.ink, overflowWrap: "anywhere" }}>
          {yesLine || "Then it's a date. Every song, every round."}
        </p>
        {dodges > 0 && <p style={{ margin: 0, font: `400 clamp(15px, 2.3dvh, 18px) ${DD_DISPLAY}`, color: "#7FD8F2" }}>…after the No button twirled away {dodges} {dodges === 1 ? "time" : "times"} ✨</p>}
        <p style={{ margin: 0, font: `500 14px ${FONTS.ui}`, color: VW.inkSoft }}>The whole sky just turned marigold. Look ✨</p>
      </div>
    </div>
  );
}
