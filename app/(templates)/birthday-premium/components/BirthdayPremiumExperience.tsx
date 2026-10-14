"use client";

// ─── Birthday Surprise ✦ Premium — a pop-up birthday storybook ──────────────
//
// lift the storybook cover (the pop-up rises with it) → make a wish and blow
// the dandelion (mic, or swipe the wind) → the hot-air balloon ride over our
// milestones (days together) → the Love Claw (every capsule a reason) → the
// photo booth (only with photos: a strip that develops as they shake it) →
// bake the cake (stack, frost, sprinkle, topper) → scratch the golden ticket →
// pull open the pop-up letter → "Birthday date with me tonight?" ("hmm…"
// spins a wheel where every slice says yes) → YES: confetti, and "when?" →
// the birthday passport: chapter stamps thud on, they stamp it APPROVED
// (keepsake PNG, reply with the plan) → "make one for your own person".
//
// The whole page wears the sender's look (extras.palette): DayRoot gets the
// day with that palette's theme, the scenes read --vw-* / --bp-* vars. Paper
// bunting top-left marks the chapters (tap a coloured flag to go back). Every
// scene is ONE screen and only their tap moves on (./bp/stage.tsx). The
// carnival and finale scenes are split into their own chunks, fetched while
// the first chapters play.

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { getDay } from "../../_valentine/days";
import {
  BP_PALETTES,
  BP_PLANS,
  BP_TONES,
  DEFAULT_CAKE_LINE,
  DEFAULT_COVER_LINE,
  DEFAULT_MILESTONES,
  DEFAULT_REASONS,
  DEFAULT_TICKET_LINE,
  DEFAULT_TICKET_TITLE,
  DEFAULT_WISHES,
  type BpExtras,
  type BpMilestone,
  type BpPalette,
  type BpTone,
} from "../../_valentine/days/birthday-premium";
import { DayRoot, Sticker, burst, haptic, useReducedMotion } from "../../_valentine/kit";
import type { DayConfig, ExperienceProps, GifSlot } from "../../_valentine/types";
import { bpDisplay, bpHand } from "./bp/fonts";
import { BalloonRide, Cover, Dandelion } from "./bp/Opening";
import { BP_STAGE_CSS, BpStage } from "./bp/stage";
import { Atmosphere, BP_UI_CSS, clean, paletteVars } from "./bp/ui";
import type { PassportStamp } from "./bp/Finale";

const loadCarnival = () => import("./bp/Carnival");
const loadFinale = () => import("./bp/Finale");
const ClawMachine = dynamic(() => loadCarnival().then((m) => m.ClawMachine), { ssr: false });
const PhotoBooth = dynamic(() => loadCarnival().then((m) => m.PhotoBooth), { ssr: false });
const Bakery = dynamic(() => loadCarnival().then((m) => m.Bakery), { ssr: false });
const GoldenTicket = dynamic(() => loadFinale().then((m) => m.GoldenTicket), { ssr: false });
const PopupLetter = dynamic(() => loadFinale().then((m) => m.PopupLetter), { ssr: false });
const Question = dynamic(() => loadFinale().then((m) => m.Question), { ssr: false });
const YesRoom = dynamic(() => loadFinale().then((m) => m.YesRoom), { ssr: false });
const Passport = dynamic(() => loadFinale().then((m) => m.Passport), { ssr: false });

const day = getDay("birthday-premium");

type Step = "cover" | "wish" | "ride" | "claw" | "photos" | "bake" | "ticket" | "letter" | "question" | "ending";

const TONES = Object.keys(BP_TONES) as BpTone[];
const isToneDefault = (q: string) => TONES.some((t) => BP_TONES[t].question === q);
const isPalette = (p: unknown): p is BpPalette => typeof p === "string" && p in BP_PALETTES;

function daysSince(since: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(since);
  if (!m) return null;
  const d = Math.floor((Date.now() - new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).getTime()) / 86400000);
  return Number.isFinite(d) && d >= 1 ? d : null;
}

export default function BirthdayPremiumExperience({ data, mode, react }: ExperienceProps) {
  const x = data.extras as BpExtras;
  const reduced = useReducedMotion();

  const palette = BP_PALETTES[isPalette(x.palette) ? x.palette : "buttercream"];
  // The page wears the sender's look: the same day, re-skinned.
  const themed = useMemo<DayConfig>(() => ({ ...day, theme: palette.theme }), [palette]);

  const tone: BpTone = TONES.includes(x.tone) ? x.tone : "cute";
  const T = BP_TONES[tone];
  const recipient = data.recipientName || "You";
  const sender = data.senderName || "Me";
  const petName = clean(data.petName);
  const age = clean(x.age).slice(0, 3);
  const since = clean(x.togetherSince);
  const days = useMemo(() => daysSince(since), [since]);
  // A tone's default question follows the tone, so switching the feel in the form updates it.
  const question = clean(x.question) && !isToneDefault(clean(x.question)) ? clean(x.question) : T.question;
  const askWhen = x.askWhen !== "no";
  const wishes = useMemo(() => {
    const src = (Array.isArray(x.wishes) ? x.wishes : []).map(clean).filter(Boolean);
    return src.length >= 3 ? src.slice(0, 5) : DEFAULT_WISHES.map((d, k) => src[k] || d);
  }, [x.wishes]);
  const reasons = useMemo(() => {
    const src = (Array.isArray(x.reasons) ? x.reasons : []).map(clean).filter(Boolean);
    return src.length >= 3 ? src.slice(0, 6) : DEFAULT_REASONS.map((d, k) => src[k] || d);
  }, [x.reasons]);
  const milestones = useMemo<BpMilestone[]>(() => {
    const src = (Array.isArray(x.milestones) ? x.milestones : [])
      .map((m) => ({ when: clean(m?.when), title: clean(m?.title), line: clean(m?.line) }))
      .filter((m) => m.title || m.line);
    return src.length >= 2 ? src.slice(0, 5).map((m) => ({ ...m, title: m.title || m.when || "A favourite moment" })) : DEFAULT_MILESTONES.map((m) => ({ ...m }));
  }, [x.milestones]);
  const photos = useMemo(() => data.photos.filter((p) => p && p.url), [data.photos]);
  const showPhotos = photos.length > 0 || mode === "preview";

  const steps = useMemo<Step[]>(
    () => ["cover", "wish", "ride", "claw", ...(showPhotos ? (["photos"] as Step[]) : []), "bake", "ticket", "letter", "question", "ending"],
    [showPhotos],
  );
  const rooms = steps.length - 1;

  // Fetch the later chapters while the first ones play, so no page turn waits on a chunk.
  useEffect(() => {
    const t = window.setTimeout(() => {
      void loadCarnival();
      void loadFinale();
    }, 600);
    return () => window.clearTimeout(t);
  }, []);

  const [i, setI] = useState(0);
  const step = steps[Math.min(i, steps.length - 1)];
  const next = () => setI((v) => Math.min(steps.length - 1, v + 1));
  const [answered, setAnswered] = useState<number | null>(null);
  const [plan, setPlan] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  // The answer beacon: with "when?" it waits for the pick (so the email can say when), but it is
  // always sent once they leave the yes room, picked or not.
  const sent = useRef(false);
  const sendAnswer = useCallback(
    (spins: number, pick: number | null) => {
      if (sent.current) return;
      sent.current = true;
      react("answered", pick === null ? { noDodges: spins } : { noDodges: spins, count: pick + 1 });
    },
    [react],
  );

  const replay = () => {
    if (answered !== null) sendAnswer(answered, plan);
    setAnswered(null);
    setPlan(null);
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

  const sayYes = (spins: number) => {
    setAnswered(spins);
    if (!askWhen) sendAnswer(spins, null);
    haptic(30);
    burst({ kind: "confetti", colors: palette.theme.confetti, origin: { x: 0.5, y: 0.4 }, count: 120 });
    burst({ kind: "hearts", emojis: ["🎈", "💗", "📖", "✨", "🥳"], origin: { x: 0.5, y: 0.5 }, count: 30 });
    if (!reduced) window.setTimeout(() => burst({ kind: "hearts", emojis: [...palette.floats], origin: { x: 0.5, y: 0.1 }, count: 24, spread: 0.6 }), 650);
  };

  const pickPlan = (k: number) => {
    setPlan(k);
    if (answered !== null) sendAnswer(answered, k);
  };

  const sticker = (id: string, size = 96): ReactNode => {
    const s: GifSlot | undefined = day.gifSlots.find((g) => g.id === id);
    // A white rounded frame with a gold rim, a tilt and a soft shadow: the GIFs carry their own ground.
    if (!s || (data.gifs[s.id] ?? "").trim() === "none") return null;
    return (
      <span className="bp-stk" key={`${id}-${round}`}>
        <Sticker slug={day.slug} slot={s} value={data.gifs[s.id]} size={size} alt="" />
      </span>
    );
  };

  const planLabel = plan !== null ? BP_PLANS[plan]?.label ?? null : null;
  const replyText = [T.reply, planLabel ? `${planLabel} ${BP_PLANS[plan!].emoji}` : ""].filter(Boolean).join(" ");
  const stamps = useMemo<PassportStamp[]>(
    () => [
      { label: "WISHED", sub: `${wishes.length} wishes` },
      { label: "FLEW", sub: days ? `${days.toLocaleString("en-IN")} days` : `${milestones.length} stops` },
      { label: "WON", sub: `${reasons.length} reasons` },
      ...(showPhotos ? [{ label: "SNAPPED", sub: "photo booth" }] : []),
      { label: "BAKED", sub: age ? `cake no. ${age}` : "one cake" },
      { label: "GOLDEN", sub: "ticket found" },
      { label: "LOVED", sub: "letter read" },
      { label: "SAID YES", sub: planLabel ? planLabel.toLowerCase() : "a date" },
    ],
    [wishes.length, days, milestones.length, reasons.length, showPhotos, age, planLabel],
  );

  const screen = (key: string, children: ReactNode, bloom = false) => (
    <motion.section
      key={`${key}-${round}`}
      className="bp-scene"
      data-bp-scene={key}
      initial={reduced ? false : bloom ? { opacity: 0, scale: 0.86 } : { opacity: 0, scale: 1.03 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={reduced ? undefined : bloom ? { opacity: 0, scale: 1.06, transition: { duration: 0.22 } } : { opacity: 0, transition: { duration: 0.01 } }}
      transition={bloom ? { type: "spring", stiffness: 170, damping: 18 } : { duration: 0.42, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.section>
  );

  return (
    <DayRoot day={themed} data={data} className={`${bpDisplay.variable} ${bpHand.variable}`} style={{ paddingBottom: 0, ...paletteVars(palette) }} layout="full">
      <style>{BP_STAGE_CSS + BP_UI_CSS}</style>
      {/* The engine's music button sits outside DayRoot (no --vw-* vars there): paint it in this palette. */}
      <style>{`body .vm-icon-btn { background: radial-gradient(circle at 50% 38%, ${palette.theme.accent}, ${palette.theme.accentDeep} 72%); } html::-webkit-scrollbar-thumb { background: ${palette.theme.accent}; } html::-webkit-scrollbar-track { background: ${palette.blush}; } html { scrollbar-color: ${palette.theme.accent} ${palette.blush}; }`}</style>
      <Atmosphere floats={palette.floats} pops={palette.pops} warm={answered !== null} />

      <BpStage round={round} flags={palette.pops} trail={{ at: i, rooms, ending: step === "ending", onJump: jumpTo }}>
        <AnimatePresence mode="wait" initial={false}>
          {step === "cover" &&
            screen(
              "cover",
              <Cover recipient={recipient} sender={sender} petName={petName} coverLine={clean(x.coverLine) || DEFAULT_COVER_LINE} sticker={sticker("bp-wake", 96)} pops={palette.pops} confetti={palette.theme.confetti} onEnter={next} />,
            )}
          {step === "wish" && screen("wish", <Dandelion wishes={wishes} recipient={petName || recipient} onNext={next} />)}
          {step === "ride" && screen("ride", <BalloonRide milestones={milestones} since={since} onNext={next} />)}
          {step === "claw" && screen("claw", <ClawMachine reasons={reasons} pops={palette.pops} sticker={sticker("bp-dance", 80)} onNext={next} />)}
          {step === "photos" && screen("photos", <PhotoBooth photos={photos} placeholders={photos.length ? 0 : 3} recipient={petName || recipient} sender={sender} pops={palette.pops} onNext={next} />)}
          {step === "bake" &&
            screen(
              "bake",
              <Bakery age={age} frostings={palette.frostings} pops={palette.pops} confetti={palette.theme.confetti} cakeLine={clean(x.cakeLine) || DEFAULT_CAKE_LINE} sticker={sticker("bp-cake", 88)} onNext={next} />,
            )}
          {step === "ticket" &&
            screen(
              "ticket",
              <GoldenTicket recipient={recipient} title={clean(x.ticketTitle) || DEFAULT_TICKET_TITLE} line={clean(x.ticketLine) || (clean(x.ticketTitle) ? "" : DEFAULT_TICKET_LINE)} sticker={sticker("bp-gift", 88)} confetti={palette.theme.confetti} onNext={next} />,
            )}
          {step === "letter" &&
            screen("letter", <PopupLetter letter={data.letter || "Happy birthday. I love you, today and every day."} recipient={recipient} sender={sender} petName={petName} signOff={T.signOff} onNext={next} />)}
          {step === "question" && answered === null && screen("question", <Question question={question} yesLabel={T.yes} hmmLines={T.hmm} recipient={petName || recipient} sender={sender} onYes={sayYes} />)}
          {step === "question" &&
            answered !== null &&
            screen("yes", <YesRoom recipient={petName || recipient} yesLine={clean(x.yesLine)} spins={answered} sticker={sticker("bp-kiss", 140)} askWhen={askWhen} plan={plan} onPlan={pickPlan} onNext={next} />, true)}
          {step === "ending" &&
            screen(
              "ending",
              <Passport
                day={themed}
                data={data}
                mode={mode}
                palette={palette}
                recipient={recipient}
                sender={sender}
                petName={petName}
                age={age}
                days={days}
                photo={photos[0] ?? null}
                stamps={stamps}
                plan={planLabel}
                replyText={replyText}
                onReplay={replay}
              />,
            )}
        </AnimatePresence>
      </BpStage>
    </DayRoot>
  );
}
