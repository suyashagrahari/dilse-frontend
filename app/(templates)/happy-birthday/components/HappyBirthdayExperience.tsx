"use client";

// ─── Happy Birthday — a cute, romantic birthday surprise ─────────────────────
//
// a wrapped gift (tug the bow three times) → the cake: light all five candles,
// make a wish, blow them out (hold the button, or really blow into the mic) →
// cut the cake with a swipe (the first slice is theirs, with the sender's
// line) → pop the balloons (one thing I love about you in each) → our photos
// (polaroids on fairy lights, only when there are any) → the birthday card
// (the letter) → unwrap the birthday coupons and claim one → "Birthday date
// with me?" (No runs away) → YES: confetti, and "when?" (tonight / this
// weekend / you plan it) → the crown certificate (keepsake PNG, reply with
// the claimed coupon and the plan) → "make one for your own person".
//
// The whole page wears the sender's cake flavour (extras.palette): DayRoot gets
// the day with that palette's theme, the scenes read --vw-* / --hb-* vars.
// Candles in the top-left corner light up step by step (tap an earlier one to
// go back). Every scene is ONE screen and only their tap moves on (./hb/stage.tsx).

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getDay } from "../../_valentine/days";
import {
  DEFAULT_CAKE_LINE,
  DEFAULT_COUPONS,
  DEFAULT_REASONS,
  DEFAULT_WISH_LINE,
  HB_CROWNS,
  HB_PALETTES,
  HB_PLANS,
  HB_TONES,
  type HbCoupon,
  type HbCrown,
  type HbExtras,
  type HbPalette,
  type HbTone,
} from "../../_valentine/days/happy-birthday";
import { DayRoot, Sticker, burst, haptic, useReducedMotion } from "../../_valentine/kit";
import type { DayConfig, ExperienceProps, GifSlot } from "../../_valentine/types";
import { HB_ART_CSS } from "./hb/art";
import { Ending, Question, YesRoom } from "./hb/Finale";
import { hbDisplay, hbHand } from "./hb/fonts";
import { Gifts, Letter, Memories } from "./hb/Middle";
import { Balloons, CakeCut, Candles, Gate } from "./hb/Opening";
import { HB_STAGE_CSS, HbStage } from "./hb/stage";
import { Atmosphere, HB_UI_CSS, clean, paletteVars } from "./hb/ui";

const day = getDay("happy-birthday");

type Step = "gate" | "candles" | "cake" | "balloons" | "photos" | "letter" | "gifts" | "question" | "ending";

const TONES = Object.keys(HB_TONES) as HbTone[];
const isToneDefault = (q: string) => TONES.some((t) => HB_TONES[t].question === q);
const isPalette = (p: unknown): p is HbPalette => typeof p === "string" && p in HB_PALETTES;
const isCrown = (c: unknown): c is HbCrown => typeof c === "string" && c in HB_CROWNS;

export default function HappyBirthdayExperience({ data, mode, react }: ExperienceProps) {
  const x = data.extras as HbExtras;
  const reduced = useReducedMotion();

  const palette = HB_PALETTES[isPalette(x.palette) ? x.palette : "strawberryCake"];
  // The page wears the sender's flavour: the same day, re-skinned.
  const themed = useMemo<DayConfig>(() => ({ ...day, theme: palette.theme }), [palette]);

  const tone: HbTone = TONES.includes(x.tone) ? x.tone : "partner";
  const T = HB_TONES[tone];
  const crown = HB_CROWNS[isCrown(x.crown) ? x.crown : "queen"];
  const recipient = data.recipientName || "You";
  const sender = data.senderName || "Me";
  const petName = clean(data.petName);
  const age = clean(x.age).slice(0, 3);
  // A tone's default question follows the tone, so switching "whose birthday" in the form updates it.
  const question = clean(x.question) && !isToneDefault(clean(x.question)) ? clean(x.question) : T.question;
  const askWhen = x.askWhen !== "no";
  const reasons = useMemo(() => {
    const src = (Array.isArray(x.reasons) ? x.reasons : []).map(clean).filter(Boolean);
    return src.length >= 3 ? src.slice(0, 5) : DEFAULT_REASONS.map((d, k) => src[k] || d);
  }, [x.reasons]);
  const coupons = useMemo<HbCoupon[]>(() => {
    const src = (Array.isArray(x.coupons) ? x.coupons : []).map((c) => ({ title: clean(c?.title), line: clean(c?.line) })).filter((c) => c.title);
    return src.length ? src.slice(0, 4) : DEFAULT_COUPONS.map((c) => ({ ...c }));
  }, [x.coupons]);
  const photos = useMemo(() => data.photos.filter((p) => p && p.url), [data.photos]);

  const steps = useMemo<Step[]>(
    () => ["gate", "candles", "cake", "balloons", ...(photos.length || mode === "preview" ? (["photos"] as Step[]) : []), "letter", "gifts", "question", "ending"],
    [photos.length, mode],
  );
  const rooms = steps.length - 1;

  const [i, setI] = useState(0);
  const step = steps[Math.min(i, steps.length - 1)];
  const next = () => setI((v) => Math.min(steps.length - 1, v + 1));
  const [answered, setAnswered] = useState<number | null>(null);
  const [plan, setPlan] = useState<number | null>(null);
  const [claimed, setClaimed] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  // The answer beacon: with "when?" it waits for the pick (so the email can say when), but it is
  // always sent once they leave the yes room, picked or not.
  const sent = useRef(false);
  const sendAnswer = useCallback(
    (dodges: number, pick: number | null) => {
      if (sent.current) return;
      sent.current = true;
      react("answered", pick === null ? { noDodges: dodges } : { noDodges: dodges, count: pick + 1 });
    },
    [react],
  );

  const replay = () => {
    if (answered !== null) sendAnswer(answered, plan);
    setAnswered(null);
    setPlan(null);
    setClaimed(null);
    setRound((r) => r + 1);
    setI(0);
  };
  const jumpTo = (k: number) => {
    if (k >= i) return;
    if (answered !== null) sendAnswer(answered, plan);
    setRound((r) => r + 1);
    setI(k);
  };

  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "auto" });
  }, [step, answered]);

  useEffect(() => {
    if (step !== "question" && answered !== null) sendAnswer(answered, plan);
  }, [step, answered, plan, sendAnswer]);

  const completed = useRef(false);
  useEffect(() => {
    if (step === "ending" && !completed.current) {
      completed.current = true;
      react("completed");
    }
  }, [step, react]);

  const sayYes = (dodges: number) => {
    setAnswered(dodges);
    if (!askWhen) sendAnswer(dodges, null);
    haptic(30);
    burst({ kind: "confetti", colors: palette.theme.confetti, origin: { x: 0.5, y: 0.4 }, count: 110 });
    burst({ kind: "hearts", emojis: ["🎈", "💗", "🎉", "✨", "🥳"], origin: { x: 0.5, y: 0.5 }, count: 30 });
    if (!reduced) window.setTimeout(() => burst({ kind: "hearts", emojis: [...palette.floats], origin: { x: 0.5, y: 0.1 }, count: 24, spread: 0.6 }), 650);
  };

  const pickPlan = (k: number) => {
    setPlan(k);
    if (answered !== null) sendAnswer(answered, k);
  };

  const sticker = (id: string, size = 96): ReactNode => {
    const s: GifSlot | undefined = day.gifSlots.find((g) => g.id === id);
    // Framed as a little sticker card: the GIFs carry their own ground, so a white rounded frame
    // with a tilt and a soft shadow makes that read as intended rather than as a pasted square.
    if (!s || (data.gifs[s.id] ?? "").trim() === "none") return null;
    return (
      <span className="hb-stk" key={`${id}-${round}`}>
        <Sticker slug={day.slug} slot={s} value={data.gifs[s.id]} size={size} alt="" />
      </span>
    );
  };

  const coupon = claimed !== null ? coupons[claimed] ?? null : null;
  const planLabel = plan !== null ? HB_PLANS[plan]?.label ?? null : null;
  const replyText = [T.reply, planLabel ? `${planLabel} ${HB_PLANS[plan!].emoji}` : "", coupon ? `And I'm claiming my coupon: ${coupon.title} 🎟️` : ""].filter(Boolean).join(" ");

  const screen = (key: string, children: ReactNode, bloom = false) => (
    <motion.section
      key={`${key}-${round}`}
      className="hb-scene"
      data-hb-scene={key}
      initial={reduced ? false : bloom ? { opacity: 0, scale: 0.86 } : { opacity: 0, scale: 1.04 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={reduced ? undefined : bloom ? { opacity: 0, scale: 1.06, transition: { duration: 0.22 } } : { opacity: 0, transition: { duration: 0.01 } }}
      transition={bloom ? { type: "spring", stiffness: 170, damping: 18 } : { duration: 0.42, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.section>
  );

  return (
    <DayRoot day={themed} data={data} className={`${hbDisplay.variable} ${hbHand.variable}`} style={{ paddingBottom: 0, ...paletteVars(palette) }} layout="full">
      <style>{HB_STAGE_CSS + HB_UI_CSS + HB_ART_CSS}</style>
      {/* The engine's music button sits outside DayRoot (no --vw-* vars there): paint it in this palette. */}
      <style>{`body .vm-icon-btn { background: radial-gradient(circle at 50% 38%, ${palette.theme.accent}, ${palette.theme.accentDeep} 72%); } html::-webkit-scrollbar-thumb { background: ${palette.theme.accent}; } html::-webkit-scrollbar-track { background: ${palette.blush}; } html { scrollbar-color: ${palette.theme.accent} ${palette.blush}; }`}</style>
      <Atmosphere floats={palette.floats} balloons={palette.balloons} sprinkles={palette.cake.sprinkles} warm={answered !== null} />

      <HbStage round={round} trail={{ at: i, rooms, ending: step === "ending", onJump: jumpTo }}>
        <AnimatePresence mode="wait" initial={false}>
          {step === "gate" &&
            screen("gate", <Gate recipient={recipient} sender={sender} petName={petName} openingLine={clean(x.openingLine)} sticker={sticker("b1-gate", 96)} confetti={palette.theme.confetti} onEnter={next} />)}
          {step === "candles" &&
            screen(
              "candles",
              <Candles
                recipient={recipient}
                age={age}
                sprinkles={palette.cake.sprinkles}
                confetti={palette.theme.confetti}
                wishLine={clean(x.wishLine) || DEFAULT_WISH_LINE}
                sender={sender}
                sticker={sticker("b2-wish", 88)}
                onNext={next}
              />,
            )}
          {step === "cake" &&
            screen("cake", <CakeCut recipient={recipient} age={age} sprinkles={palette.cake.sprinkles} confetti={palette.theme.confetti} cakeLine={clean(x.cakeLine) || DEFAULT_CAKE_LINE} onNext={next} />)}
          {step === "balloons" && screen("balloons", <Balloons reasons={reasons} colors={palette.balloons} sticker={sticker("b3-party", 104)} onNext={next} />)}
          {step === "photos" && screen("photos", <Memories photos={photos} placeholders={photos.length ? 0 : 3} bulbs={palette.balloons} onNext={next} />)}
          {step === "letter" &&
            screen("letter", <Letter letter={data.letter || "Happy birthday. I love you, today and every day."} recipient={recipient} sender={sender} petName={petName} signOff={T.signOff} onNext={next} />)}
          {step === "gifts" && screen("gifts", <Gifts coupons={coupons} colors={palette.balloons} sticker={sticker("b4-gift", 80)} claimed={claimed} onClaim={setClaimed} onNext={next} />)}
          {step === "question" && answered === null && screen("question", <Question question={question} yesLabel={T.yes} noLines={T.noLines} onYes={sayYes} />)}
          {step === "question" &&
            answered !== null &&
            screen("yes", <YesRoom recipient={petName || recipient} yesLine={clean(x.yesLine)} dodges={answered} sticker={sticker("b5-yes", 140)} askWhen={askWhen} plan={plan} onPlan={pickPlan} onNext={next} />, true)}
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
                crownTitle={crown.title}
                crownWord={crown.word}
                coupon={coupon}
                plan={planLabel}
                replyText={replyText}
                onReplay={replay}
              />,
            )}
        </AnimatePresence>
      </HbStage>
    </DayRoot>
  );
}
