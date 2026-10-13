"use client";

// ─── Miss You — a cute, romantic "I miss you" for a long-distance love ────────
//
// an incoming love call (slide to answer; Decline is "broken") → how far apart
// we are (the dotted route draws, the km count up, two clocks across time
// zones; then fold the map down to 0 km) → days until I see you (a live
// countdown; cross off today) → the jar of things I miss (tap for one glowing
// note at a time) → our photos (only when there are any) → "open when…"
// envelopes (open one now, save the rest) → a paper plane that unfolds into the
// letter → hold to hug: two hearts fly from both cities and meet in the middle
// → "Video call tonight?" — No runs away; the sender may let it turn into an
// honest "Not tonight 🌙" → yes: confetti and the "See you soon" boarding pass
// (keepsake PNG, reply on WhatsApp) → "make one for your own person".
//
// The whole page wears the sender's pick (extras.palette): DayRoot gets the day
// with that palette's theme, the scenes read --vw-* / --mu-* vars. A dotted
// flight path top-left fills in step by step (tap a passed stop to go back).
// Every scene is ONE screen and only her tap moves on (./mu/stage.tsx).

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getDay } from "../../_valentine/days";
import {
  DEFAULT_MISS_THINGS,
  DEFAULT_OPEN_WHEN,
  MISS_YOU_PALETTES,
  MISS_YOU_TONES,
  type MissYouExtras,
  type MissYouLetter,
  type MissYouPalette,
  type MissYouTone,
} from "../../_valentine/days/miss-you";
import { DayRoot, Sticker, burst, haptic, useReducedMotion } from "../../_valentine/kit";
import { answerRuleOf } from "../../_valentine/kit/answer";
import type { DayConfig, ExperienceProps, GifSlot } from "../../_valentine/types";
import { MU_ART_CSS } from "./mu/art";
import { Ending, NightRoom, Question, YesRoom } from "./mu/Finale";
import { muDisplay, muHand } from "./mu/fonts";
import { cityCode, kmBetween, zonesOf } from "./mu/geo";
import { Memories, OpenWhen, PlaneLetter, SendHug } from "./mu/Middle";
import { Call, Countdown, Distance, MissJar, parseMeet } from "./mu/Opening";
import { MU_STAGE_CSS, MuStage } from "./mu/stage";
import { Atmosphere, MU_UI_CSS, clean, paletteVars } from "./mu/ui";

const day = getDay("miss-you");

type Step = "call" | "distance" | "countdown" | "jar" | "photos" | "openwhen" | "letter" | "hug" | "question" | "ending";

const TONES = Object.keys(MISS_YOU_TONES) as MissYouTone[];
const isToneDefault = (q: string) => TONES.some((t) => MISS_YOU_TONES[t].question === q);
const isPalette = (p: unknown): p is MissYouPalette => typeof p === "string" && p in MISS_YOU_PALETTES;

export default function MissYouExperience({ data, mode, react }: ExperienceProps) {
  const x = data.extras as MissYouExtras;
  const reduced = useReducedMotion();

  const palette = MISS_YOU_PALETTES[isPalette(x.palette) ? x.palette : "midnightStars"];
  const themed = useMemo<DayConfig>(() => ({ ...day, theme: palette.theme }), [palette]);

  const tone: MissYouTone = TONES.includes(x.tone) ? x.tone : "partner";
  const T = MISS_YOU_TONES[tone];
  const recipient = data.recipientName || "You";
  const sender = data.senderName || "Me";
  const question = clean(x.question) && !isToneDefault(clean(x.question)) ? clean(x.question) : T.question;
  const yourCity = clean(x.yourCity) || recipient;
  const myCity = clean(x.myCity) || sender;
  const km = useMemo(() => {
    const n = typeof x.distanceKm === "number" ? x.distanceKm : Number(x.distanceKm);
    if (Number.isFinite(n) && n > 0) return Math.round(n);
    return clean(x.yourCity) && clean(x.myCity) ? kmBetween(clean(x.myCity), clean(x.yourCity)) : null;
  }, [x.distanceKm, x.yourCity, x.myCity]);
  const zones = useMemo(() => (clean(x.yourCity) && clean(x.myCity) ? zonesOf(clean(x.myCity), clean(x.yourCity)) : null), [x.yourCity, x.myCity]);
  const meet = useMemo(() => parseMeet(clean(x.meetDate)), [x.meetDate]);
  const things = useMemo(() => {
    const src = (Array.isArray(x.missThings) ? x.missThings : []).map(clean).filter(Boolean);
    return src.length >= 3 ? src.slice(0, 6) : DEFAULT_MISS_THINGS.map((d, k) => src[k] || d);
  }, [x.missThings]);
  const letters = useMemo<MissYouLetter[]>(() => {
    const src = (Array.isArray(x.openWhen) ? x.openWhen : []).map((l) => ({ when: clean(l?.when), note: clean(l?.note) })).filter((l) => l.when && l.note);
    return src.length ? src.slice(0, 4) : DEFAULT_OPEN_WHEN.map((l) => ({ ...l }));
  }, [x.openWhen]);
  const hugLine = clean(x.hugLine) || "Hug delivered. Keep it till I give you the real one 🤗";
  const openingLine = clean(x.openingLine) || "I just called to say… I miss you 🥺";
  const photos = useMemo(() => data.photos.filter((p) => p && p.url), [data.photos]);
  const rule = answerRuleOf(x);

  const steps = useMemo<Step[]>(
    () => ["call", "distance", "countdown", "jar", ...(photos.length || mode === "preview" ? (["photos"] as Step[]) : []), "openwhen", "letter", "hug", "question", "ending"],
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
    burst({ kind: "confetti", colors: palette.theme.confetti, origin: { x: 0.5, y: 0.4 }, count: 100 });
    burst({ kind: "hearts", emojis: ["💗", "💞", "📞", "💖", "✨"], origin: { x: 0.5, y: 0.5 }, count: 34 });
    if (!reduced) window.setTimeout(() => burst({ kind: "hearts", emojis: [...palette.floats], origin: { x: 0.5, y: 0.1 }, count: 26, spread: 0.6 }), 650);
  };

  const sayNo = (dodges: number) => {
    setDeclined(true);
    react("answered", { answer: "no", noDodges: dodges });
    haptic(8);
  };

  const sticker = (id: string, size = 96): ReactNode => {
    const s: GifSlot | undefined = day.gifSlots.find((g) => g.id === id);
    if (!s || (data.gifs[s.id] ?? "").trim() === "none") return null;
    return (
      <span className="mu-stk" key={`${id}-${round}`}>
        <Sticker slug={day.slug} slot={s} value={data.gifs[s.id]} size={size} alt="" />
      </span>
    );
  };

  const dateLabel = meet && meet.getTime() >= new Date(new Date().setHours(0, 0, 0, 0)).getTime() ? meet.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Soon 💗";

  const screen = (key: string, children: ReactNode, bloom = false) => (
    <motion.section
      key={`${key}-${round}`}
      className="mu-scene"
      data-mu-scene={key}
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
    <DayRoot day={themed} data={data} className={`${muDisplay.variable} ${muHand.variable}`} style={{ paddingBottom: 0, ...paletteVars(palette) }} layout="full">
      <style>{MU_STAGE_CSS + MU_UI_CSS + MU_ART_CSS}</style>
      {/* The engine's music button sits outside DayRoot (no --vw-* vars there): paint it in this palette. */}
      <style>{`body .vm-icon-btn { background: radial-gradient(circle at 50% 38%, ${t.accent}, ${t.accentDeep} 72%); } html::-webkit-scrollbar-thumb { background: ${t.accent}; } html::-webkit-scrollbar-track { background: ${palette.blush}; } html { scrollbar-color: ${t.accent} ${palette.blush}; }`}</style>
      <Atmosphere floats={palette.floats} warm={answered !== null} />

      <MuStage round={round} trail={{ at: i, rooms, ending: step === "ending" || declined, onJump: jumpTo }}>
        <AnimatePresence mode="wait" initial={false}>
          {step === "call" && screen("call", <Call sender={sender} recipient={recipient} openingLine={openingLine} sticker={sticker("m1-call", 150)} onNext={next} />)}
          {step === "distance" && screen("distance", <Distance myCity={myCity} yourCity={yourCity} km={km} zones={zones} onNext={next} />)}
          {step === "countdown" && screen("countdown", <Countdown meet={meet} sticker={sticker("m4-wait", 110)} onNext={next} />)}
          {step === "jar" && screen("jar", <MissJar things={things} sticker={sticker("m2-miss", 96)} onNext={next} />)}
          {step === "photos" && screen("photos", <Memories photos={photos} placeholders={photos.length ? 0 : 3} onNext={next} />)}
          {step === "openwhen" && screen("openwhen", <OpenWhen letters={letters} onNext={next} />)}
          {step === "letter" &&
            screen("letter", <PlaneLetter letter={data.letter || "I miss you. More than I can put into words."} recipient={recipient} sender={sender} petName={clean(data.petName)} onNext={next} />)}
          {step === "hug" && screen("hug", <SendHug myCity={myCity} yourCity={yourCity} km={km} hugLine={hugLine} sender={sender} sticker={sticker("m3-hug", 100)} onNext={next} />)}
          {step === "question" &&
            answered === null &&
            !declined &&
            screen("question", <Question question={question} yesLabel={T.yes} noLines={T.noLines} timeLabel={T.notTonight} sender={sender} rule={rule} onYes={sayYes} onNo={sayNo} />)}
          {step === "question" && declined && screen("night", <NightRoom sender={sender} recipient={recipient} onReplay={replay} />, true)}
          {step === "question" && answered !== null && screen("yes", <YesRoom recipient={recipient} yesLine={clean(x.yesLine)} dodges={answered} sticker={sticker("m5-yes", 170)} onNext={next} />, true)}
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
                fromCity={myCity}
                toCity={yourCity}
                fromCode={cityCode(myCity)}
                toCode={cityCode(yourCity)}
                dateLabel={dateLabel}
                seat={T.ticket}
                replyText={T.reply}
                onReplay={replay}
              />,
            )}
        </AnimatePresence>
      </MuStage>
    </DayRoot>
  );
}
