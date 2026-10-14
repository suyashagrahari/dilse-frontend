"use client";

// ─── I'm Sorry ✦ Premium — "After the Rain" ──────────────────────────────────
//
// knock knock (she answers the joke, the door opens on a bear in the rain) →
// water the wilted flower (drag the can over it; it blooms with "what I did") →
// mend the cracked heart (a plaster on each crack: how it felt) → crack the
// fortune cookies (what I learnt) → the jar of paper stars (shake it) → our
// sunny days on the washing line (only with photos, or in the preview) → the
// letter as a paper boat she sails across the puddle → the peace contract (she
// ticks the clauses and signs with her finger) → "Forgive me?" — Yes, or an
// honest "I need a little time" → push the last clouds away: the rainbow →
// the Peace Treaty keepsake → "make one for your own person".
//
// The sky is the progress bar: it starts as a pale pastel drizzle and clears a
// little with every scene (./sp/ui.tsx Sky). The whole page wears the sender's
// palette (extras.palette); the scenes read --vw-* / --sp-* vars.

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getDay } from "../../_valentine/days";
import {
  DEFAULT_FEELINGS,
  DEFAULT_LESSONS,
  DEFAULT_PROMISES,
  DEFAULT_STARS,
  SP_PALETTES,
  SP_TONES,
  type SpExtras,
  type SpPalette,
  type SpTone,
} from "../../_valentine/days/sorry-premium";
import { DayRoot, Sticker, burst, haptic, useReducedMotion } from "../../_valentine/kit";
import type { DayConfig, ExperienceProps, GifSlot } from "../../_valentine/types";
import { SP_ART_CSS } from "./sp/art";
import { Contract, Question, Rainbow, TimeRoom, Treaty } from "./sp/Finale";
import { spDisplay, spHand, spSign } from "./sp/fonts";
import { Boat, Cookies, Line, Stars } from "./sp/Middle";
import { Knock, Mend, Water } from "./sp/Opening";
import { SP_STAGE_CSS, SpStage } from "./sp/stage";
import { SP_UI_CSS, clean, daysSince, paletteVars } from "./sp/ui";

const day = getDay("sorry-premium");

type Step = "knock" | "water" | "mend" | "cookies" | "stars" | "photos" | "letter" | "contract" | "question" | "ending";

/** How clear the sky is on each step (0 drizzle → 1 sunshine). */
const SUN: Record<Step, number> = { knock: 0, water: 0.1, mend: 0.24, cookies: 0.36, stars: 0.48, photos: 0.58, letter: 0.66, contract: 0.74, question: 0.82, ending: 1 };

const TONES = Object.keys(SP_TONES) as SpTone[];
const isToneDefault = (q: string) => TONES.some((t) => SP_TONES[t].question === q);
const isPalette = (p: unknown): p is SpPalette => typeof p === "string" && p in SP_PALETTES;

/** The list the sender wrote (blank rows fall back to the default at that spot). */
function listOf(src: unknown, defaults: readonly string[], min: number): string[] {
  const rows = (Array.isArray(src) ? src : []).map(clean);
  const filled = rows.filter(Boolean);
  if (filled.length >= min) return filled.slice(0, defaults.length);
  return defaults.map((d, k) => rows[k] || d);
}

export default function SorryPremiumExperience({ data, mode, react }: ExperienceProps) {
  const x = data.extras as SpExtras;
  const reduced = useReducedMotion();

  const palette = SP_PALETTES[isPalette(x.palette) ? x.palette : "rainyBlush"];
  const themed = useMemo<DayConfig>(() => ({ ...day, theme: palette.theme }), [palette]);

  const tone: SpTone = TONES.includes(x.tone) ? x.tone : "sweet";
  const T = SP_TONES[tone];
  const recipient = data.recipientName || "You";
  const sender = data.senderName || "Me";
  const question = clean(x.question) && !isToneDefault(clean(x.question)) ? clean(x.question) : T.question;
  const feelings = useMemo(() => listOf(x.feelings, DEFAULT_FEELINGS, 3), [x.feelings]);
  const lessons = useMemo(() => listOf(x.lessons, DEFAULT_LESSONS, 3), [x.lessons]);
  const stars = useMemo(() => listOf(x.stars, DEFAULT_STARS, 3), [x.stars]);
  const promises = useMemo(() => listOf(x.promises, DEFAULT_PROMISES, 2), [x.promises]);
  const confession = clean(x.confession) || "I hurt you, and I didn't handle it the way you deserved. That's on me.";
  const knockLine = clean(x.knockLine) || "I hurt you, and I'm so sorry. Can I come in?";
  const yesLine = clean(x.yesLine) || "The rain's gone. I owe you the biggest hug in the world 🤗";
  const days = daysSince(clean(x.togetherSince));
  const canWait = x.answerMode !== "yesOnly";
  const photos = useMemo(() => data.photos.filter((p) => p && p.url), [data.photos]);
  const starColors = useMemo(() => ["#FFE07A", palette.theme.gold, palette.blush, "#BFE3FF", "#FFD0E0", "#C9F0D6"], [palette]);

  const steps = useMemo<Step[]>(
    () => ["knock", "water", "mend", "cookies", "stars", ...(photos.length || mode === "preview" ? (["photos"] as Step[]) : []), "letter", "contract", "question", "ending"],
    [photos.length, mode],
  );
  const rooms = steps.length - 1;

  const [i, setI] = useState(0);
  const step = steps[Math.min(i, steps.length - 1)];
  const next = () => setI((v) => Math.min(steps.length - 1, v + 1));
  const [answered, setAnswered] = useState(false);
  const [declined, setDeclined] = useState(false);
  const [cleared, setCleared] = useState(false);
  const [signature, setSignature] = useState("");
  const [round, setRound] = useState(0);
  const replay = () => {
    setAnswered(false);
    setDeclined(false);
    setCleared(false);
    setSignature("");
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

  const sayYes = () => {
    setAnswered(true);
    react("answered", { noDodges: 0 });
    haptic(30);
  };
  const sayWait = () => {
    setDeclined(true);
    react("answered", { answer: "no", noDodges: 0 });
    haptic(8);
  };
  const clearSky = () => {
    setCleared(true);
    burst({ kind: "confetti", colors: palette.theme.confetti, origin: { x: 0.5, y: 0.35 }, count: 110 });
    burst({ kind: "hearts", emojis: [...palette.petals], origin: { x: 0.5, y: 0.5 }, count: 30 });
    if (!reduced) window.setTimeout(() => burst({ kind: "hearts", emojis: ["🌈", "☀️", "💗", "✨"], origin: { x: 0.5, y: 0.12 }, count: 24, spread: 0.7 }), 700);
  };

  const sticker = (id: string, size = 96): ReactNode => {
    const s: GifSlot | undefined = day.gifSlots.find((g) => g.id === id);
    if (!s || (data.gifs[s.id] ?? "").trim() === "none") return null;
    return (
      <span className="sp-stk" key={`${id}-${round}`}>
        <Sticker slug={day.slug} slot={s} value={data.gifs[s.id]} size={size} alt="" />
      </span>
    );
  };

  const replyText = T.reply;
  const ending = step === "ending";
  const yesView = step === "question" && answered;
  const sky = {
    sun: declined ? 0.4 : yesView ? (cleared ? 1 : 0.86) : SUN[step],
    rainbow: ending || (yesView && cleared),
    petals: ending || (yesView && cleared),
    chars: palette.petals,
  };

  const screen = (key: string, children: ReactNode, bloom = false) => (
    <motion.section
      key={`${key}-${round}`}
      className="sp-scene"
      data-sp-scene={key}
      initial={reduced ? false : bloom ? { opacity: 0, scale: 0.88 } : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={reduced ? undefined : bloom ? { opacity: 0, scale: 1.05, transition: { duration: 0.22 } } : { opacity: 0, transition: { duration: 0.01 } }}
      transition={bloom ? { type: "spring", stiffness: 170, damping: 18 } : { duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.section>
  );

  return (
    <DayRoot day={themed} data={data} className={`${spDisplay.variable} ${spHand.variable} ${spSign.variable}`} style={{ paddingBottom: 0, ...paletteVars(palette) }} layout="full">
      <style>{SP_STAGE_CSS + SP_UI_CSS + SP_ART_CSS}</style>
      {/* The engine's music button and the page scrollbar sit outside DayRoot's vars: paint them in this palette. */}
      <style>{`body .vm-icon-btn { background: radial-gradient(circle at 50% 38%, ${palette.theme.accent}, ${palette.theme.accentDeep} 72%); } html::-webkit-scrollbar-thumb { background: ${palette.theme.accent}; } html::-webkit-scrollbar-track { background: ${palette.blush}; } html { scrollbar-color: ${palette.theme.accent} ${palette.blush}; }`}</style>

      <SpStage round={round} sky={sky} trail={{ at: i, rooms, ending: ending || declined, onJump: jumpTo }}>
        <AnimatePresence mode="wait" initial={false}>
          {step === "knock" &&
            screen("knock", <Knock recipient={recipient} sender={sender} knock={T.knock} punch={T.punch} knockLine={knockLine} sticker={sticker("p1-knock", 92)} onEnter={next} />)}
          {step === "water" && screen("water", <Water confession={confession} sender={sender} sticker={sticker("p2-bloom", 100)} onNext={next} />)}
          {step === "mend" && screen("mend", <Mend feelings={feelings} sticker={sticker("p3-mend", 100)} onNext={next} />)}
          {step === "cookies" && screen("cookies", <Cookies lessons={lessons} onNext={next} />)}
          {step === "stars" && screen("stars", <Stars stars={stars} days={days} starColors={starColors} sticker={sticker("p4-stars", 90)} onNext={next} />)}
          {step === "photos" && screen("photos", <Line photos={photos} placeholders={photos.length ? 0 : 3} onNext={next} />)}
          {step === "letter" &&
            screen(
              "letter",
              <Boat letter={data.letter || "I'm sorry. I really, truly am."} recipient={recipient} sender={sender} petName={clean(data.petName)} hint={T.boatHint} onNext={next} />,
            )}
          {step === "contract" &&
            screen("contract", <Contract promises={promises} sender={sender} recipient={recipient} sticker={sticker("p5-sign", 84)} onSigned={setSignature} onNext={next} />)}
          {step === "question" && !answered && !declined && screen("question", <Question question={question} yesLabel={T.yes} timeLabel={T.time} canWait={canWait} onYes={sayYes} onNo={sayWait} />)}
          {step === "question" && declined && screen("time", <TimeRoom sender={sender} recipient={recipient} onReplay={replay} />, true)}
          {yesView &&
            screen("yes", <Rainbow recipient={recipient} yesLine={yesLine} sticker={sticker("p6-yes", 160)} cleared={cleared} onClear={clearSky} onNext={next} />, true)}
          {ending &&
            screen(
              "ending",
              <Treaty
                day={themed}
                data={data}
                mode={mode}
                palette={palette}
                recipient={recipient}
                sender={sender}
                title={T.treaty}
                promises={promises}
                days={days}
                signature={signature}
                replyText={replyText}
                onReplay={replay}
              />,
            )}
        </AnimatePresence>
      </SpStage>
    </DayRoot>
  );
}
