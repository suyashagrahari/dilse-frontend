"use client";

// ─── I'm Sorry — a cute, romantic, forgive-me page ───────────────────────────
//
// a sealed envelope (tap the heart seal three times) → "how upset are you?"
// (a slider; the bear's face follows her mood and the sender answers each
// level) → what I did (scratch it off) → pop the guilt bubbles (one reason in
// each) → our photos (polaroids, only when there are any) → the letter (unfold
// it) → the pinky promise (hold till the hands meet) → make-it-up coupons (she
// claims one) → "Forgive me?" — No gets shy and runs away; the sender may let
// it turn into an honest "I need a little time 🤍" → forgiven: confetti, the
// hug, the certificate (keepsake PNG, reply with the claimed coupon) → "make
// one for your own person".
//
// The whole page wears the sender's pastel pick (extras.palette): DayRoot gets
// the day with that palette's theme, the scenes read --vw-* / --sr-* vars.
// Hearts in the top-left corner fill in step by step (tap an earlier one to go
// back). Every scene is ONE screen and only her tap moves on (./sr/stage.tsx).

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getDay } from "../../_valentine/days";
import {
  DEFAULT_COUPONS,
  DEFAULT_MOOD_LINES,
  DEFAULT_REASONS,
  SORRY_PALETTES,
  SORRY_TONES,
  type SorryCoupon,
  type SorryExtras,
  type SorryPalette,
  type SorryTone,
} from "../../_valentine/days/sorry";
import { DayRoot, Sticker, burst, haptic, useReducedMotion } from "../../_valentine/kit";
import { answerRuleOf } from "../../_valentine/kit/answer";
import type { DayConfig, ExperienceProps, GifSlot } from "../../_valentine/types";
import { SR_ART_CSS } from "./sr/art";
import { Ending, Question, TimeRoom, YesRoom } from "./sr/Finale";
import { srDisplay, srHand } from "./sr/fonts";
import { Coupons, Letter, Memories, PinkyPromise } from "./sr/Middle";
import { Bubbles, Confession, Gate, Mood } from "./sr/Opening";
import { SR_STAGE_CSS, SrStage } from "./sr/stage";
import { Atmosphere, SR_UI_CSS, clean, paletteVars } from "./sr/ui";

const day = getDay("sorry");

type Step = "gate" | "mood" | "confess" | "bubbles" | "photos" | "letter" | "promise" | "coupons" | "question" | "ending";

const TONES = Object.keys(SORRY_TONES) as SorryTone[];
const isToneDefault = (q: string) => TONES.some((t) => SORRY_TONES[t].question === q);
const isPalette = (p: unknown): p is SorryPalette => typeof p === "string" && p in SORRY_PALETTES;

export default function SorryExperience({ data, mode, react }: ExperienceProps) {
  const x = data.extras as SorryExtras;
  const reduced = useReducedMotion();

  const palette = SORRY_PALETTES[isPalette(x.palette) ? x.palette : "babyPink"];
  // The page wears the sender's palette: the same day, re-skinned.
  const themed = useMemo<DayConfig>(() => ({ ...day, theme: palette.theme }), [palette]);

  const tone: SorryTone = TONES.includes(x.tone) ? x.tone : "partner";
  const T = SORRY_TONES[tone];
  const recipient = data.recipientName || "You";
  const sender = data.senderName || "Me";
  const question = clean(x.question) && !isToneDefault(clean(x.question)) ? clean(x.question) : T.question;
  const moodLines = useMemo(() => {
    const src = Array.isArray(x.moodLines) ? x.moodLines : [];
    return DEFAULT_MOOD_LINES.map((d, k) => clean(src[k]) || d);
  }, [x.moodLines]);
  const reasons = useMemo(() => {
    const src = (Array.isArray(x.reasons) ? x.reasons : []).map(clean).filter(Boolean);
    return src.length >= 3 ? src.slice(0, 5) : DEFAULT_REASONS.map((d, k) => src[k] || d);
  }, [x.reasons]);
  const coupons = useMemo<SorryCoupon[]>(() => {
    const src = (Array.isArray(x.coupons) ? x.coupons : []).map((c) => ({ title: clean(c?.title), line: clean(c?.line) })).filter((c) => c.title);
    return src.length ? src.slice(0, 4) : DEFAULT_COUPONS.map((c) => ({ ...c }));
  }, [x.coupons]);
  const confession = clean(x.confession) || "I hurt you, and I didn't handle it the way you deserved. That's on me.";
  const promise = clean(x.promise) || "I'll pause, breathe and listen before I react. Every single time.";
  const photos = useMemo(() => data.photos.filter((p) => p && p.url), [data.photos]);
  const rule = answerRuleOf(x);

  const steps = useMemo<Step[]>(
    () => ["gate", "mood", "confess", "bubbles", ...(photos.length || mode === "preview" ? (["photos"] as Step[]) : []), "letter", "promise", "coupons", "question", "ending"],
    [photos.length, mode],
  );
  const rooms = steps.length - 1;

  const [i, setI] = useState(0);
  const step = steps[Math.min(i, steps.length - 1)];
  const next = () => setI((v) => Math.min(steps.length - 1, v + 1));
  const [answered, setAnswered] = useState<number | null>(null);
  const [declined, setDeclined] = useState(false);
  const [claimed, setClaimed] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const replay = () => {
    setAnswered(null);
    setDeclined(false);
    setClaimed(null);
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
    burst({ kind: "hearts", emojis: ["💗", "🩷", "💕", "💖", "✨"], origin: { x: 0.5, y: 0.5 }, count: 34 });
    if (!reduced) window.setTimeout(() => burst({ kind: "hearts", emojis: [...palette.hearts], origin: { x: 0.5, y: 0.1 }, count: 26, spread: 0.6 }), 650);
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
      <span className="sr-stk" key={`${id}-${round}`}>
        <Sticker slug={day.slug} slot={s} value={data.gifs[s.id]} size={size} alt="" />
      </span>
    );
  };

  const coupon = claimed !== null ? coupons[claimed] ?? null : null;
  const replyText = coupon ? `${T.reply} And I'm claiming my coupon: ${coupon.title} 🎟️` : T.reply;

  const screen = (key: string, children: ReactNode, bloom = false) => (
    <motion.section
      key={`${key}-${round}`}
      className="sr-scene"
      data-sr-scene={key}
      initial={reduced ? false : bloom ? { opacity: 0, scale: 0.86 } : { opacity: 0, scale: 1.04 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={reduced ? undefined : bloom ? { opacity: 0, scale: 1.06, transition: { duration: 0.22 } } : { opacity: 0, transition: { duration: 0.01 } }}
      transition={bloom ? { type: "spring", stiffness: 170, damping: 18 } : { duration: 0.42, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.section>
  );

  return (
    <DayRoot day={themed} data={data} className={`${srDisplay.variable} ${srHand.variable}`} style={{ paddingBottom: 0, ...paletteVars(palette) }} layout="full">
      <style>{SR_STAGE_CSS + SR_UI_CSS + SR_ART_CSS}</style>
      {/* The engine's music button sits outside DayRoot (no --vw-* vars there): paint it in this palette. */}
      <style>{`body .vm-icon-btn { background: radial-gradient(circle at 50% 38%, ${palette.theme.accent}, ${palette.theme.accentDeep} 72%); }`}</style>
      <Atmosphere hearts={palette.hearts} warm={answered !== null} />

      <SrStage round={round} trail={{ at: i, rooms, ending: step === "ending" || declined, onJump: jumpTo }}>
        <AnimatePresence mode="wait" initial={false}>
          {step === "gate" && screen("gate", <Gate recipient={recipient} sender={sender} openingLine={clean(x.openingLine)} sticker={sticker("s1-gate", 92)} onEnter={next} />)}
          {step === "mood" && screen("mood", <Mood lines={moodLines} sender={sender} onNext={next} />)}
          {step === "confess" && screen("confess", <Confession confession={confession} sender={sender} foil={[palette.blush, palette.theme.gold]} onNext={next} />)}
          {step === "bubbles" && screen("bubbles", <Bubbles reasons={reasons} sticker={sticker("s2-sorry", 104)} onNext={next} />)}
          {step === "photos" && screen("photos", <Memories photos={photos} placeholders={photos.length ? 0 : 3} onNext={next} />)}
          {step === "letter" &&
            screen(
              "letter",
              <Letter letter={data.letter || "I'm sorry. I really, truly am."} recipient={recipient} sender={sender} petName={clean(data.petName)} onNext={next} />,
            )}
          {step === "promise" && screen("promise", <PinkyPromise promise={promise} sticker={sticker("s3-promise", 92)} onNext={next} />)}
          {step === "coupons" && screen("coupons", <Coupons coupons={coupons} sticker={sticker("s4-coupon", 84)} claimed={claimed} onClaim={setClaimed} onNext={next} />)}
          {step === "question" && answered === null && !declined && screen("question", <Question question={question} yesLabel={T.yes} noLines={T.noLines} timeLabel={T.timeLine} rule={rule} onYes={sayYes} onNo={sayNo} />)}
          {step === "question" && declined && screen("time", <TimeRoom sender={sender} recipient={recipient} onReplay={replay} />, true)}
          {step === "question" && answered !== null && screen("yes", <YesRoom recipient={recipient} yesLine={clean(x.yesLine)} dodges={answered} sticker={sticker("s5-yes", 150)} onNext={next} />, true)}
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
                coupon={coupon}
                replyText={replyText}
                onReplay={replay}
              />,
            )}
        </AnimatePresence>
      </SrStage>
    </DayRoot>
  );
}
