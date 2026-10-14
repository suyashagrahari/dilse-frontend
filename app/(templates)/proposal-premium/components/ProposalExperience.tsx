"use client";

// ─── The Proposal ✦ Premium — a fairytale proposal in a golden-hour garden ───
//
// a wax-sealed invitation (press the seal till it cracks; the doors swing
// open) → string lights (swipe or tap the bulbs; each lights one word of the
// sender's line, and the garden warms) → our story carousel (spin it, every
// horse is a chapter) → the love-lock bridge (drag the key into the heart
// lock: "N days of us") → the reasons flower (pluck the petals; it always ends
// on "loves me") → our photos (swipe a deck of keepsake cards, only when there
// are any) → the letter (pull the ribbon, the scroll unrolls) → the ring box
// (swipe the lid up, the ring rises) → "Will you be mine?" — No wilts while
// YES blooms; the sender may allow an honest "Let me think about it" → YES:
// hearts everywhere, then she slides the ring onto the hand → the "Officially
// Ours" certificate and a save-the-date keepsake → "make one for your person".
//
// The whole page wears the sender's pick (extras.palette): DayRoot gets the
// day with that palette's theme, the scenes read --vw-* / --pp-* vars. Buds in
// the top-left corner bloom step by step (tap an earlier one to go back).
// Every scene is ONE screen and only her tap moves on (./pp/stage.tsx).

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getDay } from "../../_valentine/days";
import {
  DEFAULT_LIGHTS_LINE,
  DEFAULT_PROMISE,
  DEFAULT_REASONS,
  DEFAULT_STORY,
  PROPOSAL_PALETTES,
  PROPOSAL_TONES,
  type ProposalChapter,
  type ProposalExtras,
  type ProposalPalette,
  type ProposalTone,
} from "../../_valentine/days/proposal-premium";
import { DayRoot, Sticker, burst, haptic, useReducedMotion } from "../../_valentine/kit";
import { answerRuleOf } from "../../_valentine/kit/answer";
import type { DayConfig, ExperienceProps, GifSlot } from "../../_valentine/types";
import { Ending, Question, ThinkRoom, YesRoom } from "./pp/Finale";
import { ppHand, ppScript, ppSerif } from "./pp/fonts";
import { Deck, Letter, Petals, RingBox } from "./pp/Middle";
import { Carousel, Invite, Lights, LoveLock } from "./pp/Opening";
import { PP_STAGE_CSS, PpStage } from "./pp/stage";
import { Garden, PP_UI_CSS, clean, daysSince, paletteVars, prettyDate } from "./pp/ui";

const day = getDay("proposal-premium");

type Step = "invite" | "lights" | "carousel" | "lock" | "petals" | "photos" | "letter" | "ring" | "question" | "ending";

const TONES = Object.keys(PROPOSAL_TONES) as ProposalTone[];
const isToneDefault = (q: string) => TONES.some((t) => PROPOSAL_TONES[t].question === q);
const isPalette = (p: unknown): p is ProposalPalette => typeof p === "string" && p in PROPOSAL_PALETTES;

export default function ProposalExperience({ data, mode, react }: ExperienceProps) {
  const x = data.extras as ProposalExtras;
  const reduced = useReducedMotion();

  const palette = PROPOSAL_PALETTES[isPalette(x.palette) ? x.palette : "roseGoldBlush"];
  // The page wears the sender's palette: the same day, re-skinned.
  const themed = useMemo<DayConfig>(() => ({ ...day, theme: palette.theme }), [palette]);

  const tone: ProposalTone = TONES.includes(x.tone) ? x.tone : "girlfriend";
  const T = PROPOSAL_TONES[tone];
  const recipient = data.recipientName || "You";
  const sender = data.senderName || "Me";
  const question = clean(x.question) && !isToneDefault(clean(x.question)) ? clean(x.question) : T.question;
  const chapters = useMemo<ProposalChapter[]>(() => {
    const src = (Array.isArray(x.story) ? x.story : []).map((c) => ({ when: clean(c?.when), title: clean(c?.title), line: clean(c?.line) })).filter((c) => c.title || c.line);
    const list = src.length >= 2 ? src.slice(0, 5) : DEFAULT_STORY.map((c) => ({ ...c }));
    return list.map((c, k) => ({ ...c, title: c.title || `Chapter ${k + 1}` }));
  }, [x.story]);
  const reasons = useMemo(() => {
    const src = (Array.isArray(x.reasons) ? x.reasons : []).map(clean).filter(Boolean);
    return src.length >= 3 ? src.slice(0, 7) : DEFAULT_REASONS.map((d, k) => src[k] || d);
  }, [x.reasons]);
  const lightsLine = clean(x.lightsLine) || DEFAULT_LIGHTS_LINE;
  const promise = clean(x.promise) || DEFAULT_PROMISE;
  const since = clean(x.since);
  const days = useMemo(() => daysSince(since), [since]);
  const sinceText = days != null ? prettyDate(since) : "";
  const datePlan = clean(x.datePlan) || "Our first date as us, wherever you like 🌙";
  const photos = useMemo(() => data.photos.filter((p) => p && p.url), [data.photos]);
  const rule = answerRuleOf(x);

  const steps = useMemo<Step[]>(
    () => ["invite", "lights", "carousel", "lock", "petals", ...(photos.length || mode === "preview" ? (["photos"] as Step[]) : []), "letter", "ring", "question", "ending"],
    [photos.length, mode],
  );
  const rooms = steps.length - 1;

  const [i, setI] = useState(0);
  const step = steps[Math.min(i, steps.length - 1)];
  const next = () => setI((v) => Math.min(steps.length - 1, v + 1));
  const [answered, setAnswered] = useState<number | null>(null);
  const [declined, setDeclined] = useState(false);
  const [glow, setGlow] = useState(false);
  const [round, setRound] = useState(0);
  const replay = () => {
    setAnswered(null);
    setDeclined(false);
    setGlow(false);
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

  const sayYes = (wilts: number) => {
    setAnswered(wilts);
    setGlow(true);
    react("answered", { noDodges: wilts });
    haptic([30, 40, 30]);
    burst({ kind: "confetti", colors: palette.theme.confetti, origin: { x: 0.5, y: 0.4 }, count: 100 });
    burst({ kind: "hearts", emojis: ["💗", "💖", "💕", "💍", "✨"], origin: { x: 0.5, y: 0.5 }, count: 34 });
    if (!reduced) {
      // Fireworks of hearts: three more bursts popping around the sky.
      [
        [0.22, 0.24, 500],
        [0.78, 0.2, 850],
        [0.5, 0.12, 1200],
      ].forEach(([ox, oy, at]) => window.setTimeout(() => burst({ kind: "hearts", emojis: [...palette.hearts, "💗"], origin: { x: ox, y: oy }, count: 22, spread: 0.3 }), at));
    }
  };

  const sayNo = (wilts: number) => {
    setDeclined(true);
    react("answered", { answer: "no", noDodges: wilts });
    haptic(8);
  };

  const sticker = (id: string, size = 96): ReactNode => {
    const s: GifSlot | undefined = day.gifSlots.find((g) => g.id === id);
    if (!s || (data.gifs[s.id] ?? "").trim() === "none") return null;
    return (
      <span className="pp-stk" key={`${id}-${round}`}>
        <Sticker slug={day.slug} slot={s} value={data.gifs[s.id]} size={size} alt="" />
      </span>
    );
  };

  const replyText = `${T.reply}${clean(x.datePlan) ? ` See you at: ${datePlan}` : ""}`;

  const screen = (key: string, children: ReactNode, bloom = false) => (
    <motion.section
      key={`${key}-${round}`}
      className="pp-scene"
      data-pp-scene={key}
      initial={reduced ? false : bloom ? { opacity: 0, scale: 0.86 } : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={reduced ? undefined : bloom ? { opacity: 0, scale: 1.06, transition: { duration: 0.22 } } : { opacity: 0, transition: { duration: 0.01 } }}
      transition={bloom ? { type: "spring", stiffness: 170, damping: 18 } : { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.section>
  );

  return (
    <DayRoot day={themed} data={data} className={`${ppSerif.variable} ${ppScript.variable} ${ppHand.variable}`} style={{ paddingBottom: 0, ...paletteVars(palette) }} layout="full">
      <style>{PP_STAGE_CSS + PP_UI_CSS}</style>
      {/* The engine's music button sits outside DayRoot (no --vw-* vars there): paint it in this palette. */}
      <style>{`body .vm-icon-btn { background: radial-gradient(circle at 50% 38%, ${palette.theme.accent}, ${palette.theme.accentDeep} 72%); } html::-webkit-scrollbar-thumb { background: ${palette.theme.accent}; } html::-webkit-scrollbar-track { background: ${palette.blush}; } html { scrollbar-color: ${palette.theme.accent} ${palette.blush}; }`}</style>
      <Garden petals={palette.hearts} warm={glow || answered !== null} />

      <PpStage round={round} trail={{ at: i, rooms, ending: step === "ending" || declined, onJump: jumpTo }}>
        <AnimatePresence mode="wait" initial={false}>
          {step === "invite" && screen("invite", <Invite recipient={recipient} sender={sender} openingLine={clean(x.openingLine)} sticker={sticker("s1-peek", 92)} onEnter={next} />)}
          {step === "lights" && screen("lights", <Lights line={lightsLine} onGlow={() => setGlow(true)} onNext={next} />)}
          {step === "carousel" && screen("carousel", <Carousel chapters={chapters} sticker={sticker("s2-story", 64)} onNext={next} />)}
          {step === "lock" && screen("lock", <LoveLock recipient={recipient} sender={sender} sinceText={sinceText} days={days} onNext={next} />)}
          {step === "petals" && screen("petals", <Petals reasons={reasons} sticker={sticker("s3-flowers", 104)} onNext={next} />)}
          {step === "photos" && screen("photos", <Deck photos={photos} placeholders={photos.length ? 0 : 3} onNext={next} />)}
          {step === "letter" &&
            screen("letter", <Letter letter={data.letter || "I love you. That's the whole letter, really."} recipient={recipient} sender={sender} petName={clean(data.petName)} onNext={next} />)}
          {step === "ring" && screen("ring", <RingBox promise={promise} sticker={sticker("s4-kneel", 70)} onNext={next} />)}
          {step === "question" &&
            answered === null &&
            !declined &&
            screen("question", <Question question={question} yesLabel={T.yes} noLines={T.noLines} thinkLabel={T.thinkLine} rule={rule} sticker={sticker("s5-please", 110)} onYes={sayYes} onNo={sayNo} />)}
          {step === "question" && declined && screen("think", <ThinkRoom sender={sender} recipient={recipient} onReplay={replay} />, true)}
          {step === "question" && answered !== null && screen("yes", <YesRoom recipient={recipient} sender={sender} yesLine={clean(x.yesLine)} wilts={answered} sticker={sticker("s6-yay", 150)} onNext={next} />, true)}
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
                sinceText={sinceText}
                datePlan={datePlan}
                sticker={sticker("s7-hug", 72)}
                replyText={replyText}
                onReplay={replay}
              />,
            )}
        </AnimatePresence>
      </PpStage>
    </DayRoot>
  );
}
