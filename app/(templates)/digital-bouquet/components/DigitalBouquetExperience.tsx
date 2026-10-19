"use client";

// ─── Digital Bouquet ✦ Premium — the recipient's experience ──────────────────
//
// delivery (a parcel at the door: tap it, pull the ribbon) → the bloom (stem
// by stem, exactly as the sender arranged it) → the meanings (tap each
// flower: what it says + the sender's own line) → water it till it glows →
// the photos tucked between the stems → the card in its envelope → a soft
// question answered with a reaction → the keepsake (a florist's card, a
// story-sized download, a reply, "make one").
//
// The whole page wears the sender's palette (extras.palette). Every scene is
// ONE screen and only her tap moves on (the Next pill). Buds top-left bloom
// scene by scene (tap an earlier one to go back).

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { getDay } from "../../_valentine/days";
import { DB_PALETTES, DB_TONES, DEMO_STEMS } from "../../_valentine/days/digital-bouquet";
import { DayRoot, Sticker, burst, haptic, useReducedMotion } from "../../_valentine/kit";
import type { DayConfig, ExperienceProps, GifSlot } from "../../_valentine/types";
import { BOUQUET_CSS, type BouquetLook } from "./db/Bouquet";
import { DB_FONT_VARS } from "./db/fonts";
import { readBouquet } from "./db/model";
import { BloomRoom, CardRoom, DB_SCENES_CSS, Delivery, Meanings, Photos, Water } from "./db/scenes";
import { DB_STAGE_CSS, DbStage } from "./db/stage";
import { Atmosphere, DB_UI_CSS, paletteVars } from "./db/ui";

// The last act loads in the background while she is still in the first scenes.
const loadFinale = () => import("./db/finale");
const Question = dynamic(() => loadFinale().then((m) => m.Question), { ssr: false });
const YesRoom = dynamic(() => loadFinale().then((m) => m.YesRoom), { ssr: false });
const Ending = dynamic(() => loadFinale().then((m) => m.Ending), { ssr: false });
const FinaleCss = dynamic(() => loadFinale().then((m) => function Css() { return <style>{m.DB_FINALE_CSS}</style>; }), { ssr: false });

const day = getDay("digital-bouquet");

type Step = "delivery" | "bloom" | "meanings" | "water" | "photos" | "card" | "question" | "ending";
const SPLIT: ReadonlySet<string> = new Set(["delivery", "bloom", "meanings", "water", "photos", "card", "question", "ending"]);

export default function DigitalBouquetExperience({ data, react }: ExperienceProps) {
  const reduced = useReducedMotion();
  const bq = useMemo(() => readBouquet(data.extras as Record<string, unknown>), [data.extras]);
  const palette = DB_PALETTES[bq.palette];
  const themed = useMemo<DayConfig>(() => ({ ...day, theme: palette.theme }), [palette]);
  const T = DB_TONES[bq.tone];
  const recipient = data.recipientName || "You";
  const sender = data.senderName || "Me";

  // An old/empty page still gets a bouquet: fewer than three stems → the starter arrangement.
  const look = useMemo<BouquetLook>(
    () => ({
      stems: bq.stems.length >= 3 ? bq.stems : DEMO_STEMS,
      greenery: bq.greenery,
      wrap: bq.wrap,
      ribbon: bq.ribbon,
      bow: bq.bow,
      charms: bq.charms,
      tag: bq.giftTag || T.tag,
    }),
    [bq, T.tag],
  );
  const photos = useMemo(() => data.photos.filter((p) => p && p.url), [data.photos]);
  const question = bq.question || T.question;

  const steps = useMemo<Step[]>(() => ["delivery", "bloom", "meanings", "water", ...(photos.length ? (["photos"] as Step[]) : []), "card", "question", "ending"], [photos.length]);
  const rooms = steps.length - 1;
  const [i, setI] = useState(0);
  const step = steps[Math.min(i, steps.length - 1)];
  const next = () => setI((v) => Math.min(steps.length - 1, v + 1));
  const [answered, setAnswered] = useState(false);
  const [round, setRound] = useState(0);
  const replay = () => {
    setAnswered(false);
    setRound((r) => r + 1);
    setI(0);
  };
  const jumpTo = (k: number) => {
    if (k >= i) return;
    setRound((r) => r + 1);
    setI(k);
  };

  useEffect(() => {
    const t = window.setTimeout(() => void loadFinale(), 1500);
    return () => window.clearTimeout(t);
  }, []);

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

  const onAnswer = (k: number) => {
    setAnswered(true);
    // Every reaction is a yes; which one (1–4) rides along for the sender's email.
    react("answered", { noDodges: 0, count: k + 1 });
    haptic(30);
    burst({ kind: "confetti", colors: palette.theme.confetti, origin: { x: 0.5, y: 0.4 }, count: 100 });
    burst({ kind: "hearts", emojis: ["💗", "🌸", "💐", "✨", "🌷"], origin: { x: 0.5, y: 0.5 }, count: 34 });
    if (!reduced) window.setTimeout(() => burst({ kind: "petals", emojis: ["🌸", "🌷", "🌹"], origin: { x: 0.5, y: 0.1 }, count: 26, spread: 0.7 }), 700);
  };

  const sticker = (id: string, size = 100): ReactNode => {
    const s: GifSlot | undefined = day.gifSlots.find((g) => g.id === id);
    if (!s || (data.gifs[s.id] ?? "").trim() === "none") return null;
    return (
      <span className="db-stk" key={`${id}-${round}`}>
        <Sticker slug={day.slug} slot={s} value={data.gifs[s.id]} size={size} alt="" />
      </span>
    );
  };

  const screen = (key: string, children: ReactNode, bloom = false) => (
    <motion.section
      key={`${key}-${round}`}
      className="db-scene"
      data-db-scene={key}
      data-split={SPLIT.has(key) ? "" : undefined}
      initial={reduced ? false : bloom ? { opacity: 0, scale: 0.88 } : { opacity: 0, scale: 1.02 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={reduced ? undefined : { opacity: 0, transition: { duration: 0.01 } }}
      transition={bloom ? { type: "spring", stiffness: 170, damping: 18 } : { duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.section>
  );

  const replyText = `${T.reply}`;
  const common = { look, palette };

  return (
    <DayRoot day={themed} data={data} className={DB_FONT_VARS} style={{
        paddingBottom: 0,
        ...paletteVars(palette),
        // The keepsake canvas reads these: our serif and script, not the engine's.
        ["--font-vw-serif" as string]: "var(--font-db-serif)",
        ["--font-vw-script" as string]: "var(--font-db-script)",
      }} layout="full">
      <style>{BOUQUET_CSS + DB_STAGE_CSS + DB_UI_CSS + DB_SCENES_CSS}</style>
      <FinaleCss />
      {/* The engine's music button sits outside DayRoot (no --vw-* vars there): paint it in this palette. */}
      <style>{`body .vm-icon-btn { background: radial-gradient(circle at 50% 38%, ${palette.theme.accent}, ${palette.theme.accentDeep} 72%); } html::-webkit-scrollbar-thumb { background: ${palette.theme.accent}; } html::-webkit-scrollbar-track { background: ${palette.blush}; } html { scrollbar-color: ${palette.theme.accent} ${palette.blush}; }`}</style>
      <Atmosphere petals={palette.petals} warm={answered} palette={bq.palette} />

      <DbStage round={round} petals={palette.petals} trail={{ at: i, rooms, ending: step === "ending", onJump: jumpTo }}>
        <AnimatePresence mode="wait" initial={false}>
          {step === "delivery" && screen("delivery", <Delivery {...common} recipient={recipient} sender={sender} line={bq.deliveryLine || T.delivery} sticker={sticker("b1-delivery", 92)} onNext={next} />)}
          {step === "bloom" && screen("bloom", <BloomRoom {...common} sender={sender} kicker={`For ${data.petName || recipient}`} sticker={sticker("b2-bloom", 90)} onNext={next} />)}
          {step === "meanings" && screen("meanings", <Meanings {...common} notes={bq.notes} hand={bq.hand} onNext={next} />)}
          {step === "water" && screen("water", <Water {...common} sticker={sticker("b3-water", 90)} hasPhotos={photos.length > 0} onNext={next} />)}
          {step === "photos" && screen("photos", <Photos {...common} photos={photos} hand={bq.hand} sticker={sticker("b4-photos", 84)} onNext={next} />)}
          {step === "card" &&
            screen("card", <CardRoom {...common} recipient={recipient} sender={sender} petName={data.petName} letter={data.letter || "These are for you. Just because."} hand={bq.hand} sticker={sticker("b5-letter", 84)} onNext={next} />)}
          {step === "question" && !answered && screen("question", <Question question={question} reactions={T.reactions} {...common} onAnswer={onAnswer} />)}
          {step === "question" && answered && screen("yes", <YesRoom line={bq.yesLine || T.yes} recipient={recipient} sticker={sticker("b6-yes", 170)} onNext={next} />, true)}
          {step === "ending" &&
            screen("ending", <Ending data={data} {...common} recipient={recipient} sender={sender} replyText={replyText} onReplay={replay} />)}
        </AnimatePresence>
      </DbStage>
    </DayRoot>
  );
}
