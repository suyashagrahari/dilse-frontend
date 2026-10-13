"use client";

// ─── Will You Be Mine? — a cute, romantic proposal page ──────────────────────
//
// a velvet ring box (tap it three times — it's empty: "the ring comes at the
// end 😌") → our story (walk the heart path, one chapter per stop) → reasons I
// fell for you (connect the stars into a heart constellation) → a love quiz
// with a rigged love meter → our photos (polaroids, only when there are any) →
// the love letter (break the seal) → hold my heart till it's full (the ring box
// opens with a promise) → "Will you be mine?" — No gets shy and runs away, YES
// grows; the sender may let No become an honest "Let me think about it 🤍" →
// YES: fireworks, the "Officially Mine" certificate (keepsake PNG, a reply on
// WhatsApp) → "make one for your own person".
//
// The whole page wears the sender's pick (extras.palette): DayRoot gets the day
// with that palette's theme, the scenes read --vw-* / --wy-* vars. Hearts in
// the top-left corner fill in step by step (tap an earlier one to go back).
// Every scene is ONE screen and only her tap moves on (./wy/stage.tsx).

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getDay } from "../../_valentine/days";
import {
  DEFAULT_PROMISE,
  DEFAULT_QUIZ,
  DEFAULT_REASONS,
  DEFAULT_STORY,
  WYBM_PALETTES,
  WYBM_TONES,
  type WybmChapter,
  type WybmExtras,
  type WybmPalette,
  type WybmQuizItem,
  type WybmTone,
} from "../../_valentine/days/will-you-be-mine";
import { DayRoot, Sticker, burst, haptic, useReducedMotion } from "../../_valentine/kit";
import { answerRuleOf } from "../../_valentine/kit/answer";
import type { DayConfig, ExperienceProps, GifSlot } from "../../_valentine/types";
import { WY_ART_CSS } from "./wy/art";
import { Ending, Question, ThinkRoom, YesRoom } from "./wy/Finale";
import { wyHand, wyScript } from "./wy/fonts";
import { Letter, Memories, Propose, Quiz } from "./wy/Middle";
import { Gate, Stars, Story } from "./wy/Opening";
import { WY_STAGE_CSS, WyStage } from "./wy/stage";
import { Atmosphere, WY_UI_CSS, clean, paletteVars } from "./wy/ui";

const day = getDay("will-you-be-mine");

type Step = "gate" | "story" | "stars" | "quiz" | "photos" | "letter" | "propose" | "question" | "ending";

const TONES = Object.keys(WYBM_TONES) as WybmTone[];
const isToneDefault = (q: string) => TONES.some((t) => WYBM_TONES[t].question === q);
const isPalette = (p: unknown): p is WybmPalette => typeof p === "string" && p in WYBM_PALETTES;

export default function WillYouBeMineExperience({ data, mode, react }: ExperienceProps) {
  const x = data.extras as WybmExtras;
  const reduced = useReducedMotion();

  const palette = WYBM_PALETTES[isPalette(x.palette) ? x.palette : "roseGold"];
  // The page wears the sender's palette: the same day, re-skinned.
  const themed = useMemo<DayConfig>(() => ({ ...day, theme: palette.theme }), [palette]);

  const tone: WybmTone = TONES.includes(x.tone) ? x.tone : "girlfriend";
  const T = WYBM_TONES[tone];
  const recipient = data.recipientName || "You";
  const sender = data.senderName || "Me";
  // A question left on another tone's default follows the tone the sender picked.
  const question = clean(x.question) && !isToneDefault(clean(x.question)) ? clean(x.question) : T.question;
  const story = useMemo<WybmChapter[]>(() => {
    const src = (Array.isArray(x.story) ? x.story : []).map((c) => ({ when: clean(c?.when), title: clean(c?.title), line: clean(c?.line) })).filter((c) => c.title || c.line);
    return src.length ? src.slice(0, 4).map((c) => ({ ...c, title: c.title || c.line, line: c.title ? c.line : "" })) : DEFAULT_STORY.map((c) => ({ ...c }));
  }, [x.story]);
  const reasons = useMemo(() => {
    const src = (Array.isArray(x.reasons) ? x.reasons : []).map(clean).filter(Boolean);
    return src.length >= 3 ? src.slice(0, 6) : DEFAULT_REASONS.map((d, k) => src[k] || d);
  }, [x.reasons]);
  const quiz = useMemo<WybmQuizItem[]>(() => {
    const src = (Array.isArray(x.quiz) ? x.quiz : [])
      .map((q) => ({ q: clean(q?.q), right: clean(q?.right), wrong1: clean(q?.wrong1), wrong2: clean(q?.wrong2) }))
      .filter((q) => q.q && q.right && (q.wrong1 || q.wrong2));
    return src.length ? src.slice(0, 3) : DEFAULT_QUIZ.map((q) => ({ ...q }));
  }, [x.quiz]);
  const promise = clean(x.promise) || DEFAULT_PROMISE;
  const photos = useMemo(() => data.photos.filter((p) => p && p.url), [data.photos]);
  const rule = answerRuleOf(x);

  const steps = useMemo<Step[]>(
    () => ["gate", "story", "stars", "quiz", ...(photos.length || mode === "preview" ? (["photos"] as Step[]) : []), "letter", "propose", "question", "ending"],
    [photos.length, mode],
  );
  const rooms = steps.length - 1;

  const [i, setI] = useState(0);
  const step = steps[Math.min(i, steps.length - 1)];
  const next = () => setI((v) => Math.min(steps.length - 1, v + 1));
  const [answered, setAnswered] = useState<number | null>(null);
  const [declined, setDeclined] = useState(false);
  const [round, setRound] = useState(0);
  const replay = () => {
    setAnswered(null);
    setDeclined(false);
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
  }, [step, answered, declined]);

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
    haptic(30);
    burst({ kind: "confetti", colors: palette.theme.confetti, origin: { x: 0.5, y: 0.4 }, count: 110 });
    burst({ kind: "hearts", emojis: ["💗", "💍", "💕", "💖", "✨"], origin: { x: 0.5, y: 0.5 }, count: 34 });
    if (!reduced) {
      window.setTimeout(() => burst({ kind: "confetti", colors: palette.theme.confetti, origin: { x: 0.2, y: 0.3 }, count: 60 }), 500);
      window.setTimeout(() => burst({ kind: "confetti", colors: palette.theme.confetti, origin: { x: 0.8, y: 0.3 }, count: 60 }), 900);
      window.setTimeout(() => burst({ kind: "hearts", emojis: [...palette.hearts], origin: { x: 0.5, y: 0.1 }, count: 26, spread: 0.6 }), 1300);
    }
  };

  const sayNo = (dodges: number) => {
    setDeclined(true);
    react("answered", { answer: "no", noDodges: dodges });
    haptic(8);
  };

  const sticker = (id: string, size = 96): ReactNode => {
    const s: GifSlot | undefined = day.gifSlots.find((g) => g.id === id);
    // Framed as a little sticker card: the GIFs carry their own white ground, so a white rounded frame
    // with a tilt and a soft shadow makes that read as intended rather than as a pasted square.
    if (!s || (data.gifs[s.id] ?? "").trim() === "none") return null;
    return (
      <span className="wy-stk" key={`${id}-${round}`}>
        <Sticker slug={day.slug} slot={s} value={data.gifs[s.id]} size={size} alt="" eager />
      </span>
    );
  };

  const screen = (key: string, children: ReactNode, bloom = false) => (
    <motion.section
      key={`${key}-${round}`}
      className="wy-scene"
      data-wy-scene={key}
      initial={reduced ? false : bloom ? { opacity: 0, scale: 0.86 } : { opacity: 0, scale: 1.04 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={reduced ? undefined : bloom ? { opacity: 0, scale: 1.06, transition: { duration: 0.22 } } : { opacity: 0, transition: { duration: 0.01 } }}
      transition={bloom ? { type: "spring", stiffness: 170, damping: 18 } : { duration: 0.42, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.section>
  );

  const t = palette.theme;
  return (
    <DayRoot day={themed} data={data} className={`${wyScript.variable} ${wyHand.variable}`} style={{ paddingBottom: 0, ...paletteVars(palette) }} layout="full" dark={t.dark}>
      <style>{WY_STAGE_CSS + WY_UI_CSS + WY_ART_CSS}</style>
      {/* The engine's music button sits outside DayRoot (no --vw-* vars there): paint it in this palette. */}
      <style>{`body .vm-icon-btn { background: radial-gradient(circle at 50% 38%, ${t.accent}, ${t.accentDeep} 72%); } html { background: ${t.base}; } html::-webkit-scrollbar-thumb { background: ${t.accent}; } html::-webkit-scrollbar-track { background: ${palette.blush}; } html { scrollbar-color: ${t.accent} ${palette.blush}; }`}</style>
      <Atmosphere hearts={palette.hearts} warm={answered !== null} dark={t.dark} />

      <WyStage round={round} trail={{ at: i, rooms, ending: step === "ending" || declined, onJump: jumpTo }}>
        <AnimatePresence mode="wait" initial={false}>
          {step === "gate" && screen("gate", <Gate recipient={recipient} sender={sender} openingLine={clean(x.openingLine)} sticker={sticker("s1-gate", 92)} onEnter={next} />)}
          {step === "story" && screen("story", <Story chapters={story} sticker={sticker("s2-story", 88)} onNext={next} />)}
          {step === "stars" && screen("stars", <Stars reasons={reasons} onNext={next} />)}
          {step === "quiz" && screen("quiz", <Quiz items={quiz} sticker={sticker("s3-quiz", 72)} onNext={next} />)}
          {step === "photos" && screen("photos", <Memories photos={photos} placeholders={photos.length ? 0 : 3} onNext={next} />)}
          {step === "letter" &&
            screen("letter", <Letter letter={data.letter || "I like you. A lot. That's the whole letter."} recipient={recipient} sender={sender} petName={clean(data.petName)} onNext={next} />)}
          {step === "propose" && screen("propose", <Propose promise={promise} sticker={sticker("s4-propose", 80)} onNext={next} />)}
          {step === "question" && answered === null && !declined && screen("question", <Question question={question} yesLabel={T.yes} noLines={T.noLines} thinkLabel={T.thinkLine} rule={rule} onYes={sayYes} onNo={sayNo} />)}
          {step === "question" && declined && screen("think", <ThinkRoom sender={sender} recipient={recipient} onReplay={replay} />, true)}
          {step === "question" && answered !== null &&
            screen("yes", <YesRoom recipient={recipient} yesLine={clean(x.yesLine)} dodges={answered} sticker={sticker("s5-yes", 150)} fireworks={t.confetti} onNext={next} />, true)}
          {step === "ending" &&
            screen(
              "ending",
              <Ending
                day={themed}
                data={data}
                mode={mode}
                palette={palette}
                recipient={recipient}
                sender={sender}
                certificate={T.certificate}
                together={T.together}
                replyText={T.reply}
                makeOwnHref={`/${day.slug}`}
                onReplay={replay}
              />,
            )}
        </AnimatePresence>
      </WyStage>
    </DayRoot>
  );
}
