"use client";

// ─── Happy Anniversary — "Our Little Love Museum" ────────────────────────────
//
// the ticket booth (tear the stub) → the clock room (pull the lever: years,
// months, days, hours roll up; fun stats) → the portrait gallery (swipe the
// framed photos; only with photos, or in the preview) → the audio guide (tap
// an exhibit number: our story) → the restoration studio (brush the dust off
// the first-date painting) → the gift shop (shake the snow globe for reasons)
// → the guestbook (the letter writes itself in) → the next exhibition:
// "another year of us?" (both buttons say yes) → the award room (pull the
// velvet cloth off the Masterpiece of the Year plaque) → keep it / reply.
//
// Every room change closes two gallery-wall doors with a brass room plaque on
// the seam (./ha/stage.tsx). The whole page wears the sender's palette
// (extras.palette); the rooms read --vw-* / --ha-* vars.

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getDay } from "../../_valentine/days";
import {
  DEFAULT_MILESTONES,
  DEFAULT_PROMISES,
  DEFAULT_REASONS,
  HA_PALETTES,
  HA_RELATIONS,
  HA_TONES,
  type HaExtras,
  type HaMilestone,
  type HaPalette,
  type HaRelation,
  type HaTone,
} from "../../_valentine/days/happy-anniversary";
import { DayRoot, Sticker, burst, haptic, useReducedMotion } from "../../_valentine/kit";
import type { DayConfig, ExperienceProps, GifSlot } from "../../_valentine/types";
import { Award, GiftShop, Guestbook, NextExhibition } from "./ha/Finale";
import { haCaps, haDisplay, haHand } from "./ha/fonts";
import { AudioGuide, Gallery, Restore } from "./ha/Middle";
import { ClockRoom, Ticket } from "./ha/Opening";
import { HA_STAGE_CSS, HaStage, type Plaque } from "./ha/stage";
import { HA_UI_CSS, anniversaryLabel, clean, paletteVars, together } from "./ha/ui";

const day = getDay("happy-anniversary");

type Step = "ticket" | "clock" | "gallery" | "guide" | "restore" | "shop" | "book" | "ask" | "award";

const PLAQUES: Record<Step, Plaque> = {
  ticket: { no: "Entrance", name: "The Ticket Booth" },
  clock: { no: "Room 1", name: "The Clock Room" },
  gallery: { no: "Room 2", name: "The Portrait Gallery" },
  guide: { no: "Room 3", name: "Our Story" },
  restore: { no: "Room 4", name: "The Restoration Studio" },
  shop: { no: "Room 5", name: "The Gift Shop" },
  book: { no: "Room 6", name: "The Guestbook" },
  ask: { no: "Coming soon", name: "The Next Exhibition" },
  award: { no: "Room 8", name: "The Award Room" },
};

const TONES = Object.keys(HA_TONES) as HaTone[];
const isToneDefault = (q: string, key: "question" | "award") => TONES.some((t) => HA_TONES[t][key] === q);
const isPalette = (p: unknown): p is HaPalette => typeof p === "string" && p in HA_PALETTES;

/** The list the sender wrote (blank rows fall back to the default at that spot). */
function listOf(src: unknown, defaults: readonly string[], min: number): string[] {
  const rows = (Array.isArray(src) ? src : []).map(clean);
  const filled = rows.filter(Boolean);
  if (filled.length >= min) return filled.slice(0, defaults.length);
  return defaults.map((d, k) => rows[k] || d);
}

function milestonesOf(src: unknown): HaMilestone[] {
  const rows = (Array.isArray(src) ? src : [])
    .map((r) => (r && typeof r === "object" ? (r as Record<string, unknown>) : {}))
    .map((r) => ({ when: clean(r.when), title: clean(r.title), line: clean(r.line) }))
    .filter((r) => r.title || r.line);
  if (rows.length >= 2) return rows.slice(0, 5).map((r, k) => ({ when: r.when, title: r.title || `Exhibit ${k + 1}`, line: r.line || "One of my favourite days." }));
  return DEFAULT_MILESTONES.map((m) => ({ ...m }));
}

export default function HappyAnniversaryExperience({ data, mode, react }: ExperienceProps) {
  const x = data.extras as HaExtras;
  const reduced = useReducedMotion();

  const palette = HA_PALETTES[isPalette(x.palette) ? x.palette : "blushGallery"];
  const themed = useMemo<DayConfig>(() => ({ ...day, theme: palette.theme }), [palette]);

  const tone: HaTone = TONES.includes(x.tone) ? x.tone : "cute";
  const T = HA_TONES[tone];
  const rel = HA_RELATIONS[(Object.keys(HA_RELATIONS) as HaRelation[]).includes(x.relation) ? x.relation : "partner"];
  const recipient = data.recipientName || "You";
  const sender = data.senderName || "Me";
  const question = clean(x.question) && !isToneDefault(clean(x.question), "question") ? clean(x.question) : T.question;
  const awardTitle = clean(x.awardTitle) && !isToneDefault(clean(x.awardTitle), "award") ? clean(x.awardTitle) : T.award;
  const t = useMemo(() => together(clean(x.togetherSince)), [x.togetherSince]);
  const label = anniversaryLabel(t);
  const nextLabel = t.ok && t.years >= 1 ? `Year ${t.years + 1} of Us` : "Another Year of Us";
  const reasons = useMemo(() => listOf(x.reasons, DEFAULT_REASONS, 2), [x.reasons]);
  const promises = useMemo(() => listOf(x.promises, DEFAULT_PROMISES, 1), [x.promises]);
  const milestones = useMemo(() => milestonesOf(x.milestones), [x.milestones]);
  const photos = useMemo(() => data.photos.filter((p) => p && p.url), [data.photos]);
  const yesLine = clean(x.yesLine) || "Best answer ever. Happy anniversary, my favourite human 💗";
  const serial = useMemo(() => {
    let h = 7;
    for (const ch of `${recipient}${sender}`) h = (h * 31 + ch.charCodeAt(0)) % 9973;
    return String(h).padStart(4, "0");
  }, [recipient, sender]);

  const steps = useMemo<Step[]>(
    () => ["ticket", "clock", ...(photos.length || mode === "preview" ? (["gallery"] as Step[]) : []), "guide", "restore", "shop", "book", "ask", "award"],
    [photos.length, mode],
  );

  const [i, setI] = useState(0);
  const step = steps[Math.min(i, steps.length - 1)];
  const next = () => setI((v) => Math.min(steps.length - 1, v + 1));
  const [answered, setAnswered] = useState(false);
  const [unveiled, setUnveiled] = useState(false);
  const [round, setRound] = useState(0);
  const replay = () => {
    setAnswered(false);
    setUnveiled(false);
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
  }, [step]);

  const completed = useRef(false);
  useEffect(() => {
    if (step === "award" && unveiled && !completed.current) {
      completed.current = true;
      react("completed");
    }
  }, [step, unveiled, react]);

  const sayYes = () => {
    setAnswered(true);
    react("answered", { answer: "yes", noDodges: 0 });
    haptic(30);
    burst({ kind: "confetti", colors: palette.theme.confetti, origin: { x: 0.5, y: 0.35 }, count: 90 });
    if (!reduced) burst({ kind: "hearts", emojis: [...palette.petals], origin: { x: 0.5, y: 0.5 }, count: 24 });
  };

  const unveil = () => {
    setUnveiled(true);
    burst({ kind: "confetti", colors: palette.theme.confetti, origin: { x: 0.5, y: 0.3 }, count: 120 });
    if (!reduced) {
      burst({ kind: "hearts", emojis: [...palette.petals], origin: { x: 0.5, y: 0.5 }, count: 30 });
      window.setTimeout(() => burst({ kind: "hearts", emojis: ["🏆", "✨", "💗", "🎉"], origin: { x: 0.5, y: 0.15 }, count: 22, spread: 0.7 }), 700);
    }
  };

  const sticker = (id: string, size = 96): ReactNode => {
    const s: GifSlot | undefined = day.gifSlots.find((g) => g.id === id);
    if (!s || (data.gifs[s.id] ?? "").trim() === "none") return null;
    return (
      <span className="ha-stk" key={`${id}-${round}`}>
        <Sticker slug={day.slug} slot={s} value={data.gifs[s.id]} size={size} alt="" />
      </span>
    );
  };

  const screen = (key: string, children: ReactNode) => (
    <motion.section
      key={`${key}-${round}`}
      className="ha-scene"
      data-ha-scene={key}
      initial={reduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduced ? undefined : { opacity: 0, transition: { duration: 0.01 } }}
      transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.section>
  );

  const names = steps.map((s) => PLAQUES[s]);
  const firstYear = t.ok ? t.startYear : new Date().getFullYear();

  return (
    <DayRoot day={themed} data={data} className={`${haDisplay.variable} ${haCaps.variable} ${haHand.variable}`} style={{ paddingBottom: 0, ...paletteVars(palette) }} layout="full">
      <style>{HA_STAGE_CSS + HA_UI_CSS}</style>
      {/* The engine's music button and the page scrollbar sit outside DayRoot's vars: paint them in this palette. */}
      <style>{`body .vm-icon-btn { background: radial-gradient(circle at 50% 38%, ${palette.theme.accent}, ${palette.theme.accentDeep} 72%); } html::-webkit-scrollbar-thumb { background: ${palette.theme.accent}; } html::-webkit-scrollbar-track { background: ${palette.blush}; } html { scrollbar-color: ${palette.theme.accent} ${palette.blush}; }`}</style>

      <HaStage round={round} petals={step === "award" && unveiled} petalChars={palette.petals} trail={{ at: i, names, ending: step === "award" && unveiled, onJump: jumpTo }}>
        <AnimatePresence mode="wait" initial={false}>
          {step === "ticket" &&
            screen(
              "ticket",
              <Ticket recipient={recipient} sender={sender} label={label} since={t.ok ? t.since : ""} line={clean(x.ticketLine) || T.ticket} serial={serial} sticker={sticker("h1-welcome", 110)} onEnter={next} />,
            )}
          {step === "clock" && screen("clock", <ClockRoom t={t} funStat={clean(x.funStat)} sticker={sticker("h2-together", 90)} onNext={next} />)}
          {step === "gallery" &&
            screen(
              "gallery",
              <Gallery photos={photos} placeholders={photos.length ? 0 : 3} sender={sender} recipient={recipient} startYear={firstYear} sticker={sticker("h3-gallery", 96)} onNext={next} />,
            )}
          {step === "guide" && screen("guide", <AudioGuide milestones={milestones} intro={T.guide} onNext={next} />)}
          {step === "restore" &&
            screen(
              "restore",
              <Restore
                place={clean(x.firstPlace) || "Where it all began"}
                memory={clean(x.firstMemory) || "The day I first saw you smile, and forgot everything else."}
                year={firstYear}
                onNext={next}
              />,
            )}
          {step === "shop" && screen("shop", <GiftShop reasons={reasons} sender={sender} recipient={recipient} sticker={sticker("h4-globe", 90)} onNext={next} />)}
          {step === "book" &&
            screen("book", <Guestbook letter={data.letter || "Happy anniversary. I love you, more every single year."} recipient={recipient} sender={sender} petName={clean(data.petName)} onNext={next} />)}
          {step === "ask" &&
            screen(
              "ask",
              <NextExhibition
                question={question}
                yes={T.yes}
                yes2={T.yes2}
                promises={promises}
                plan={clean(x.plan)}
                sender={sender}
                recipient={recipient}
                nextLabel={nextLabel}
                answered={answered}
                yesLine={yesLine}
                sticker={sticker("h5-yes", 120)}
                onYes={sayYes}
                onNext={next}
              />,
            )}
          {step === "award" &&
            screen(
              "award",
              <Award
                day={themed}
                data={data}
                mode={mode}
                palette={palette}
                recipient={recipient}
                sender={sender}
                title={awardTitle}
                relation={rel.word}
                t={t}
                label={label}
                photo={photos[0]?.url ?? ""}
                replyText={T.reply}
                unveiled={unveiled}
                sticker={sticker("h6-award", 110)}
                bigSticker={sticker("h6-award", 220)}
                onUnveil={unveil}
                onReplay={replay}
              />,
            )}
        </AnimatePresence>
      </HaStage>
    </DayRoot>
  );
}

