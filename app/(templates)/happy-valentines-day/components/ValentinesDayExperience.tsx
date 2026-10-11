"use client";

// ─── Valentine's Day — "Our Valentine Night" (the finale of the week) ────────
//
//  1 ticket    gold ADMIT TWO ticket on velvet — drag the stub to tear it, the scene dims to night
//  2 lanterns  rooftop at night, 7 paper lanterns (Rose → Kiss), tap to light, the sender's line
//              for each day floats out → "…and today is the 8th."
//  3 wrapped   Love Wrapped: dark stat cards, live together-timer, "Top person of my year: you"
//  4 gift      the grand gift box — pull the ribbon tag, the bow unties, the lid flies, an envelope rises
//  5 letter    monogram wax seal → 3-fold unfold → lines fade in by candlelight, P.S. after a beat
//  6 gallery   gold frames on a wine wall, a spotlight follows the finger / scroll
//  7 question  "Be my Valentine… forever?" — runaway No, growing Yes → react("answered", { noDodges })
//  8 finale    swipe up to release a lantern → canvas sky of lanterns + heart fireworks (DPR ≤ 2),
//              tonight's plan, night keepsake, EndingActions → react("completed")
//
// GIF slots: v1-invite (ticket) · v2-wrapped (Wrapped intro) · v3-gift (gift box) ·
// v4-please (the question) · v5-forever (finale).

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DayRoot, MusicToggle, Sticker, haptic, useReducedMotion, useSynthMusic } from "../../_valentine/kit";
import { getDay } from "../../_valentine/days";
import type { ExperienceProps } from "../../_valentine/types";
import type { ValentinesExtras } from "../../_valentine/days/happy-valentines-day";
import { LANTERN_TINTS, Lantern, Moon, NIGHT, ValCss } from "./valArt";
import { LanternWalk, LoveWrapped, TicketArrival } from "./ValOpening";
import { CandleLetter, GalleryWall, GiftBox } from "./ValMiddle";
import { Finale, TheQuestion } from "./ValFinale";

const STEPS = ["ticket", "lanterns", "wrapped", "gift", "letter", "gallery", "question", "finale"] as const;
const FULL_BLEED = new Set<string>(["ticket", "lanterns", "gallery", "finale"]);
type Step = (typeof STEPS)[number];

const strList = (v: unknown, max: number): string[] => (Array.isArray(v) ? v.map((s) => (typeof s === "string" ? s : "")).slice(0, max) : []);

export default function ValentinesDayExperience({ data, mode, react }: ExperienceProps) {
  const day = getDay("happy-valentines-day");
  const x = (data.extras ?? {}) as Partial<ValentinesExtras>;
  const reduced = useReducedMotion();
  const weekLines = useMemo(() => {
    const l = strList(x.weekLines, 7);
    while (l.length < 7) l.push("");
    return l;
  }, [x.weekLines]);
  const noLines = useMemo(() => strList(x.noLines, 10).filter((s) => s.trim()), [x.noLines]);
  const stats = useMemo(
    () => (Array.isArray(x.stats) ? x.stats.filter((s): s is { label: string; value: string } => !!s && typeof s === "object").map((s) => ({ label: String(s.label ?? ""), value: String(s.value ?? "") })) : []),
    [x.stats],
  );
  const str = (v: unknown) => (typeof v === "string" ? v : "");

  const [i, setI] = useState(0);
  const [run, setRun] = useState(0);
  const [dodges, setDodges] = useState<number | null>(null);
  const step: Step = STEPS[Math.min(i, STEPS.length - 1)];
  const music = useSynthMusic({ melody: day.melody, enabled: mode === "live" && data.music });
  const bottomPad = mode === "preview" ? 120 : 40;

  const next = useCallback(() => {
    haptic(8);
    setI((v) => Math.min(STEPS.length - 1, v + 1));
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "auto" });
  }, [i]);

  const slot = (id: string) => day.gifSlots.find((g) => g.id === id)!;
  const sticker = (id: string, size: number) => <Sticker slug={day.slug} slot={slot(id)} value={data.gifs?.[id]} size={size} alt="" eager />;

  const replay = () => {
    setI(0);
    setDodges(null);
    setRun((r) => r + 1);
  };

  let body: React.ReactNode = null;
  switch (step) {
    case "ticket":
      body = <TicketArrival recipientName={data.recipientName} senderName={data.senderName} ticketLine={str(x.ticketLine)} sticker={sticker("v1-invite", 84)} bottomPad={bottomPad} onTorn={next} />;
      break;
    case "lanterns":
      body = <LanternWalk weekLines={weekLines} bottomPad={bottomPad} onDone={next} />;
      break;
    case "wrapped":
      body = (
        <LoveWrapped
          recipientName={data.recipientName}
          senderName={data.senderName}
          togetherSince={str(x.togetherSince)}
          metPlace={str(x.metPlace)}
          stats={stats}
          sticker={sticker("v2-wrapped", 120)}
          bottomPad={bottomPad}
          onDone={next}
        />
      );
      break;
    case "gift":
      body = <GiftBox a={data.recipientName} b={data.senderName} sticker={sticker("v3-gift", 86)} bottomPad={bottomPad} onOpened={next} />;
      break;
    case "letter":
      body = <CandleLetter letter={data.letter} ps={str(x.ps)} a={data.recipientName} b={data.senderName} bottomPad={bottomPad} onNext={next} />;
      break;
    case "gallery":
      body = <GalleryWall photos={data.photos ?? []} bottomPad={bottomPad} onNext={next} />;
      break;
    case "question":
      body = (
        <TheQuestion
          recipientName={data.recipientName}
          question={str(x.question)}
          noLines={noLines}
          sticker={sticker("v4-please", 112)}
          bottomPad={bottomPad}
          onYes={(d) => {
            setDodges(d);
            react("answered", { noDodges: d });
            next();
          }}
        />
      );
      break;
    case "finale":
      body = (
        <Finale
          day={day}
          data={data}
          mode={mode}
          dodges={dodges}
          datePlan={str(x.datePlan)}
          togetherSince={str(x.togetherSince)}
          sticker={sticker("v5-forever", 120)}
          bottomPad={bottomPad}
          onReleased={() => react("completed")}
          onReplay={replay}
        />
      );
      break;
  }

  return (
    <DayRoot
      day={day}
      data={data}
      // Scenes painted as wide stages (the velvet ticket wall, the rooftop, the
      // gallery wall, the lantern sky) take the whole screen; the intimate
      // ones (wrapped, gift, letter, question) sit in the column between the wings.
      layout={FULL_BLEED.has(step) ? "full" : "column"}
      line={str(x.ticketLine)}
      art={
        <div style={{ position: "relative", height: "100%", aspectRatio: "1.2" }}>
          <Moon size={120} style={{ position: "absolute", right: "6%", top: 0 }} />
          <div style={{ position: "absolute", left: "8%", bottom: "4%" }} className="vw-anim-float"><Lantern tint={LANTERN_TINTS[0]} lit size={52} /></div>
          <div style={{ position: "absolute", left: "38%", bottom: "26%", animationDelay: "-1.2s" }} className="vw-anim-float"><Lantern tint={LANTERN_TINTS[5]} lit size={40} /></div>
        </div>
      }
    >
      <ValCss />
      {mode === "live" && <MusicToggle music={music} />}

      <div aria-hidden style={{ position: "fixed", top: 22, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 5, padding: "6px 10px", borderRadius: 99, background: "rgba(18,8,28,.5)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", zIndex: 20 }}>
        {STEPS.map((s, k) => (
          <span key={s} style={{ width: k === i ? 18 : 6, height: 6, borderRadius: 9, background: k <= i ? NIGHT.gold : "rgba(255,246,229,.22)", transition: "width .3s" }} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.section
          key={`${run}-${step}`}
          initial={reduced ? false : { opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduced ? undefined : { opacity: 0, scale: 0.985, transition: { duration: 0.35 } }}
          transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
          style={{ position: "relative", zIndex: 1 }}
        >
          {body}
        </motion.section>
      </AnimatePresence>
    </DayRoot>
  );
}
