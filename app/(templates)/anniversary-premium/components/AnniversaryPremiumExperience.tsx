"use client";

// ─── Anniversary ✦ Premium — "The Book of Us" ────────────────────────────────
//
// [the lock, if the sender set one: "unlock with our date" or a countdown] →
// the opening titles (pull focus on their names) → two lives, one path (trace
// it to where we met) → the time machine (spin the ring of years) → our firsts
// (records on a turntable) → the little things (a breakfast tray) → the memory
// quilt (sew in the photos and reasons) → the book (turn the pages of the
// letter) → us, wrapped (our year in numbers) → lanterns (promises for the
// next year) → next year's horizon (raise the sun) → the question (drag your
// heart into mine) → yes → the Certificate of Forever + keepsakes.
//
// The whole page wears the sender's pick (extras.palette): DayRoot gets the
// day with that palette's theme, the scenes read --vw-* / --ap-* vars. Gold
// beads in the top-left corner fill in chapter by chapter (tap an earlier one
// to go back). Every scene is ONE screen and only her tap moves on.

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { getDay } from "../../_valentine/days";
import {
  ANNI_PALETTES,
  ANNI_SEASONS,
  ANNI_TONES,
  DEFAULT_CHAPTERS,
  DEFAULT_FIRSTS,
  DEFAULT_LITTLE_THINGS,
  DEFAULT_PLANS,
  DEFAULT_PROMISES,
  DEFAULT_REASONS,
  type AnniChapter,
  type AnniExtras,
  type AnniFirst,
  type AnniPalette,
  type AnniSeason,
  type AnniStat,
  type AnniTone,
} from "../../_valentine/days/anniversary-premium";
import { DayRoot, Sticker, burst, haptic, useReducedMotion } from "../../_valentine/kit";
import type { DayConfig, ExperienceProps, GifSlot } from "../../_valentine/types";
import { apHand, apSans, apScript, apSerif } from "./ap/fonts";
import { Book, Firsts, LittleThings, Quilt } from "./ap/Middle";
import { CountdownLock, PassLock, Paths, Titles, TimeMachine } from "./ap/Opening";
import type { WrapCard } from "./ap/Later";
import { AP_STAGE_CSS, ApStage } from "./ap/stage";
import { AP_UI_CSS, Atmosphere, clean, paletteVars, parseDay, togetherSince } from "./ap/ui";

// The third act and the finale load in the background while she is still in the first scenes.
const loadLater = () => import("./ap/Later");
const loadFinale = () => import("./ap/Finale");
const Wrapped = dynamic(() => loadLater().then((m) => m.Wrapped), { ssr: false });
const Lanterns = dynamic(() => loadLater().then((m) => m.Lanterns), { ssr: false });
const Horizon = dynamic(() => loadLater().then((m) => m.Horizon), { ssr: false });
const Question = dynamic(() => loadFinale().then((m) => m.Question), { ssr: false });
const YesRoom = dynamic(() => loadFinale().then((m) => m.YesRoom), { ssr: false });
const Ending = dynamic(() => loadFinale().then((m) => m.Ending), { ssr: false });

const day = getDay("anniversary-premium");

type Step = "lock" | "titles" | "paths" | "dial" | "firsts" | "littles" | "quilt" | "book" | "wrapped" | "lanterns" | "horizon" | "question" | "ending";

const TONES = Object.keys(ANNI_TONES) as AnniTone[];
const isToneDefault = (q: string) => TONES.some((t) => ANNI_TONES[t].question === q);
const isPalette = (p: unknown): p is AnniPalette => typeof p === "string" && p in ANNI_PALETTES;
const isSeason = (s: unknown): s is AnniSeason => typeof s === "string" && s in ANNI_SEASONS;
const SPLIT: ReadonlySet<string> = new Set(["lock", "paths", "dial", "firsts", "littles", "quilt", "book", "wrapped", "lanterns", "horizon", "question", "keep"]);

export default function AnniversaryPremiumExperience({ data, mode, react }: ExperienceProps) {
  const x = data.extras as AnniExtras;
  const reduced = useReducedMotion();

  const palette = ANNI_PALETTES[isPalette(x.palette) ? x.palette : "champagnePearl"];
  const themed = useMemo<DayConfig>(() => ({ ...day, theme: palette.theme }), [palette]);

  const tone: AnniTone = TONES.includes(x.tone) ? x.tone : "girlfriend";
  const T = ANNI_TONES[tone];
  const recipient = data.recipientName || "You";
  const sender = data.senderName || "Me";
  const question = clean(x.question) && !isToneDefault(clean(x.question)) ? clean(x.question) : T.question;

  const sinceDay = useMemo(() => parseDay(clean(x.since)), [x.since]);
  const together = useMemo(() => togetherSince(sinceDay), [sinceDay]);
  const metOn = useMemo(() => parseDay(clean(x.metOn)), [x.metOn]);

  const chapters = useMemo<AnniChapter[]>(() => {
    const src = (Array.isArray(x.chapters) ? x.chapters : [])
      .map((c) => ({ when: clean(c?.when), title: clean(c?.title), line: clean(c?.line), season: isSeason(c?.season) ? c.season : "spring" }))
      .filter((c) => c.title || c.line || c.when);
    const list = src.length >= 2 ? src.slice(0, 6) : DEFAULT_CHAPTERS.map((c) => ({ ...c }));
    return list.map((c, k) => ({ ...c, title: c.title || `Chapter ${k + 1}` }));
  }, [x.chapters]);
  const firsts = useMemo<AnniFirst[]>(() => {
    const src = (Array.isArray(x.firsts) ? x.firsts : []).map((f) => ({ title: clean(f?.title), line: clean(f?.line) })).filter((f) => f.title || f.line);
    const list = src.length >= 2 ? src.slice(0, 5) : DEFAULT_FIRSTS.map((f) => ({ ...f }));
    return list.map((f, k) => ({ ...f, title: f.title || `First #${k + 1}` }));
  }, [x.firsts]);
  const littleThings = useMemo(() => {
    const src = (Array.isArray(x.littleThings) ? x.littleThings : []).map(clean).filter(Boolean);
    return src.length >= 3 ? src.slice(0, 6) : DEFAULT_LITTLE_THINGS.map((d, k) => src[k] || d);
  }, [x.littleThings]);
  const reasons = useMemo(() => {
    const src = (Array.isArray(x.reasons) ? x.reasons : []).map(clean).filter(Boolean);
    return src.length >= 3 ? src.slice(0, 8) : DEFAULT_REASONS.map((d, k) => src[k] || d);
  }, [x.reasons]);
  const promises = useMemo(() => {
    const src = (Array.isArray(x.promises) ? x.promises : []).map(clean).filter(Boolean);
    return src.length >= 2 ? src.slice(0, 5) : DEFAULT_PROMISES.map((d, k) => src[k] || d);
  }, [x.promises]);
  const plans = useMemo(() => {
    const src = (Array.isArray(x.plans) ? x.plans : []).map(clean).filter(Boolean);
    return src.length >= 2 ? src.slice(0, 4) : DEFAULT_PLANS.map((d, k) => src[k] || d);
  }, [x.plans]);
  const stats = useMemo<AnniStat[]>(
    () => (Array.isArray(x.stats) ? x.stats : []).map((s) => ({ num: clean(s?.num), label: clean(s?.label) })).filter((s) => s.num || s.label).slice(0, 3),
    [x.stats],
  );
  const photos = useMemo(() => data.photos.filter((p) => p && p.url), [data.photos]);
  const quiltPhotos = useMemo(() => (photos.length - chapters.length >= 2 ? photos.slice(chapters.length) : photos), [photos, chapters.length]);

  // The lock, only when it can work: a passcode needs the date; a countdown needs a day still ahead.
  const [openedAt] = useState(() => Date.now());
  const lockKind = useMemo<"none" | "passcode" | "countdown">(() => {
    if (x.lock === "passcode" && sinceDay) return "passcode";
    if (x.lock === "countdown") {
      const d = parseDay(clean(x.openOn));
      if (d && d.getTime() > openedAt) return "countdown";
    }
    return "none";
  }, [x.lock, x.openOn, sinceDay, openedAt]);
  const passcode = sinceDay ? `${String(sinceDay.getDate()).padStart(2, "0")}${String(sinceDay.getMonth() + 1).padStart(2, "0")}` : "";

  const steps = useMemo<Step[]>(
    () => [...(lockKind !== "none" ? (["lock"] as Step[]) : []), "titles", "paths", "dial", "firsts", "littles", "quilt", "book", "wrapped", "lanterns", "horizon", "question", "ending"],
    [lockKind],
  );
  const rooms = steps.length - 1;

  const [i, setI] = useState(0);
  const step = steps[Math.min(i, steps.length - 1)];
  const next = () => setI((v) => Math.min(steps.length - 1, v + 1));
  const [answered, setAnswered] = useState(false);
  const [round, setRound] = useState(0);
  const replay = () => {
    setAnswered(false);
    setRound((r) => r + 1);
    setI(lockKind !== "none" ? 1 : 0);
  };
  const jumpTo = (k: number) => {
    if (k >= i) return;
    setRound((r) => r + 1);
    setI(k);
  };

  // Warm the later chunks once she's in.
  useEffect(() => {
    const t = window.setTimeout(() => {
      void loadLater();
      void loadFinale();
    }, 1500);
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

  const sayYes = () => {
    setAnswered(true);
    react("answered", { noDodges: 0 });
    haptic(30);
    burst({ kind: "confetti", colors: palette.theme.confetti, origin: { x: 0.5, y: 0.4 }, count: 110 });
    burst({ kind: "hearts", emojis: ["💗", "🤍", "💞", "✨", "🌸"], origin: { x: 0.5, y: 0.5 }, count: 36 });
    if (!reduced) window.setTimeout(() => burst({ kind: "hearts", emojis: [...palette.hearts], origin: { x: 0.5, y: 0.1 }, count: 28, spread: 0.7 }), 700);
  };

  const sticker = (id: string, size = 110): ReactNode => {
    const s: GifSlot | undefined = day.gifSlots.find((g) => g.id === id);
    if (!s || (data.gifs[s.id] ?? "").trim() === "none") return null;
    return (
      <span className="ap-stk" key={`${id}-${round}`}>
        <Sticker slug={day.slug} slot={s} value={data.gifs[s.id]} size={size} alt="" />
      </span>
    );
  };

  const replyText = clean(x.datePlan) ? `${T.reply} See you at: ${clean(x.datePlan)} 🥂` : T.reply;

  const screen = (key: string, children: ReactNode, bloom = false) => (
    <motion.section
      key={`${key}-${round}`}
      className="ap-scene"
      data-ap-scene={key}
      data-split={SPLIT.has(key) ? "" : undefined}
      initial={reduced ? false : bloom ? { opacity: 0, scale: 0.86 } : { opacity: 0, scale: 1.03 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={reduced ? undefined : bloom ? { opacity: 0, scale: 1.06, transition: { duration: 0.22 } } : { opacity: 0, transition: { duration: 0.01 } }}
      transition={bloom ? { type: "spring", stiffness: 170, damping: 18 } : { duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.section>
  );

  const fontVars = `${apSerif.variable} ${apScript.variable} ${apHand.variable} ${apSans.variable}`;
  const sinceOk = !!together;

  return (
    <DayRoot
      day={themed}
      data={data}
      className={fontVars}
      style={{
        paddingBottom: 0,
        ...paletteVars(palette),
        // The keepsake canvas reads these: our serif and script, not the engine's.
        ["--font-vw-serif" as string]: "var(--font-ap-serif)",
        ["--font-vw-script" as string]: "var(--font-ap-script)",
      }}
      layout="full"
    >
      <style>{AP_STAGE_CSS + AP_UI_CSS}</style>
      {/* The engine's music button sits outside DayRoot (no --vw-* vars there): paint it in this palette. */}
      <style>{`body .vm-icon-btn { background: radial-gradient(circle at 50% 38%, ${palette.theme.accent}, ${palette.theme.accentDeep} 72%); } html::-webkit-scrollbar-thumb { background: ${palette.theme.accent}; } html::-webkit-scrollbar-track { background: ${palette.blush}; } html { scrollbar-color: ${palette.theme.accent} ${palette.blush}; }`}</style>
      <Atmosphere hearts={palette.hearts} warm={answered} />

      <ApStage round={round} trail={{ at: i, rooms, ending: step === "ending", hidden: step === "lock", onJump: jumpTo }}>
        <AnimatePresence mode="wait" initial={false}>
          {step === "lock" &&
            lockKind === "passcode" &&
            screen("lock", <PassLock code={passcode} hint={clean(x.passHint)} recipient={recipient} preview={mode === "preview"} onOpen={next} />)}
          {step === "lock" &&
            lockKind === "countdown" &&
            screen("lock", <CountdownLock opensAt={parseDay(clean(x.openOn)) ?? new Date()} recipient={recipient} preview={mode === "preview"} onOpen={next} />)}
          {step === "titles" &&
            screen("titles", <Titles recipient={recipient} sender={sender} openingLine={clean(x.openingLine)} together={sinceOk ? together : null} sticker={sticker("a1-hello", 96)} onNext={next} />)}
          {step === "paths" &&
            screen(
              "paths",
              <Paths recipient={recipient} sender={sender} metOn={metOn} metPlace={clean(x.metPlace)} metLine={clean(x.metLine)} sticker={sticker("a2-hug", 100)} onNext={next} />,
            )}
          {step === "dial" && screen("dial", <TimeMachine chapters={chapters} photos={photos} together={together} onNext={next} />)}
          {step === "firsts" && screen("firsts", <Firsts firsts={firsts} sticker={sticker("a3-dance", 84)} onNext={next} />)}
          {step === "littles" && screen("littles", <LittleThings things={littleThings} onNext={next} />)}
          {step === "quilt" && screen("quilt", <Quilt photos={quiltPhotos} reasons={reasons} onNext={next} />)}
          {step === "book" &&
            screen("book", <Book letter={data.letter || "Happy anniversary, my love."} recipient={recipient} sender={sender} petName={clean(data.petName)} sticker={sticker("a4-kiss", 100)} onNext={next} />)}
          {step === "wrapped" &&
            screen(
              "wrapped",
              <WrappedRoom together={together} ourSong={clean(x.ourSong)} mostSaid={clean(x.mostSaid)} stats={stats} recipient={recipient} chapters={chapters.length} firsts={firsts.length} onNext={next} />,
            )}
          {step === "lanterns" && screen("lanterns", <Lanterns promises={promises} onNext={next} />)}
          {step === "horizon" && screen("horizon", <Horizon plans={plans} sender={sender} onNext={next} />)}
          {step === "question" && !answered && screen("question", <Question question={question} yesLabel={T.yes} datePlan={clean(x.datePlan)} sender={sender} recipient={recipient} onYes={sayYes} />)}
          {step === "question" && answered && screen("yes", <YesRoom recipient={recipient} yesLine={clean(x.yesLine)} sticker={sticker("a5-yes", 150)} onNext={next} />, true)}
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
                together={together}
                datePlan={clean(x.datePlan)}
                stats={stats}
                ourSong={clean(x.ourSong)}
                mostSaid={clean(x.mostSaid)}
                chapters={chapters.length}
                firsts={firsts.length}
                replyText={replyText}
                sticker={sticker("a6-forever", 170)}
                onReplay={replay}
              />,
            )}
        </AnimatePresence>
      </ApStage>
    </DayRoot>
  );
}

/** Builds the story cards once, then hands them to the (lazy) Wrapped scene. */
function WrappedRoom(props: {
  together: ReturnType<typeof togetherSince>;
  ourSong: string;
  mostSaid: string;
  stats: AnniStat[];
  recipient: string;
  chapters: number;
  firsts: number;
  onNext: () => void;
}) {
  const [cards, setCards] = useState<WrapCard[] | null>(null);
  const { together, ourSong, mostSaid, stats, recipient, chapters, firsts } = props;
  useEffect(() => {
    let live = true;
    void loadLater().then((m) => {
      if (live) setCards(m.buildWrapped({ together, ourSong, mostSaid, stats, recipient, chapters, firsts }));
    });
    return () => {
      live = false;
    };
  }, [together, ourSong, mostSaid, stats, recipient, chapters, firsts]);
  if (!cards) return null;
  return <Wrapped cards={cards} onNext={props.onNext} />;
}
