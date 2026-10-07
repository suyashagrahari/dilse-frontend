"use client";

// ─── Propose Day — "The Little Velvet Box" ───────────────────────────────────
//
// Night, a velvet stage, one spotlight. A three-beat proposal with a real
// consequence (the YES is reported to the sender):
//   1 curtain  — "{Name}, I have something to ask you…" → the drapes part
//   2 reasons  — three playing-card reasons, a heartbeat that quickens
//   3 story    — "how we got here": a lit gold timeline of moments + photos (skipped if empty)
//   4 box      — swipe the 3D velvet ring box open (sender's ring style + stone)
//   5 speech   — the scroll from the lid unrolls; the letter is typed out
//   6 question — scratch the gold foil → runaway/shrinking No (sender's lines), growing Yes
//   7 yes      — fireworks, night → blush, proposal certificate keepsake ("said YES after N dodges")
// react("answered", { noDodges }) fires once on YES (emails the sender); react("completed") at the end.

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getDay } from "../../_valentine/days";
import { DayRoot, MusicToggle, burst, haptic, useReducedMotion, useSynthMusic } from "../../_valentine/kit";
import type { ExperienceProps, ValentineDayData } from "../../_valentine/types";
import type { ProposeExtras } from "../../_valentine/days/happy-propose-day";
import { Curtain, Reasons, Timeline, moments } from "./propose/Stage";
import RingBox from "./propose/RingBox";
import { Finale, Question, Speech } from "./propose/Proposal";
import { Drape, Fireworks, GOLD, GoldDust, PROPOSE_CSS, Screen, Valance } from "./propose/ui";

type Step = "curtain" | "reasons" | "story" | "box" | "speech" | "question" | "yes";

const BLUSH_VARS = {
  "--vw-ink": "#4A1424",
  "--vw-ink-soft": "#8A5563",
  "--vw-glass": "rgba(255,255,255,.66)",
  "--vw-edge": "#EBC9CF",
  "--vw-accent": "#C8102E",
  "--vw-accent-deep": "#8E0B20",
  "--vw-accent-ink": "#FFFFFF",
  colorScheme: "light",
} as CSSProperties;

export default function ProposeDayExperience({ data: raw, mode, react }: ExperienceProps) {
  const day = getDay("happy-propose-day");
  const data = raw as ValentineDayData<ProposeExtras>;
  const reduced = useReducedMotion();
  const hasStory = useMemo(() => moments(data).length > 0, [data]);
  const steps = useMemo<Step[]>(() => ["curtain", "reasons", ...(hasStory ? (["story"] as Step[]) : []), "box", "speech", "question", "yes"], [hasStory]);
  const [i, setI] = useState(0);
  const [run, setRun] = useState(0);
  const step = steps[Math.min(i, steps.length - 1)];
  const [yes, setYes] = useState<{ dodges: number; at: Date } | null>(null);
  const [fire, setFire] = useState(0);
  const answered = useRef(false);
  const completed = useRef(false);
  const music = useSynthMusic({ melody: day.melody, enabled: mode === "live" && data.music });

  const next = useCallback(() => {
    haptic(8);
    setI((k) => Math.min(steps.length - 1, k + 1));
  }, [steps.length]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  }, [i, reduced]);

  const onYes = (dodges: number) => {
    if (!answered.current) {
      answered.current = true;
      react("answered", { noDodges: dodges });
    }
    haptic([30, 60, 30, 60, 60]);
    setYes({ dodges, at: new Date() });
    setFire((f) => f + 1);
    burst({ kind: "confetti", colors: day.theme.confetti, origin: { x: 0.5, y: 0.45 }, count: 90 });
    window.setTimeout(() => burst({ kind: "hearts", origin: { x: 0.5, y: 0.6 }, count: 30 }), 700);
    setI(steps.indexOf("yes"));
  };

  const replay = () => {
    setYes(null);
    setRun((r) => r + 1);
    setI(0);
  };

  const preview = mode === "preview";
  const blush = step === "yes";
  const curtainsOpen = step !== "curtain";

  return (
    <DayRoot day={day} style={blush ? BLUSH_VARS : undefined}>
      <style>{PROPOSE_CSS}</style>
      {/* spotlight */}
      <div aria-hidden style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, background: "radial-gradient(42% 60% at 50% 0%, rgba(255,201,210,.22), transparent 70%), radial-gradient(60% 30% at 50% 100%, rgba(107,15,42,.45), transparent 70%)" }} />
      {/* night → blush */}
      <motion.div
        aria-hidden
        initial={false}
        animate={{ opacity: blush ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : 1.6, ease: "easeInOut" }}
        style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, background: "radial-gradient(120% 70% at 50% 0%, #FFF6F7 0%, #FFE4EA 55%, #F9CFD8 100%)" }}
      />
      {!blush && <GoldDust reduced={reduced} />}
      <Drape side="l" open={curtainsOpen} reduced={reduced} />
      <Drape side="r" open={curtainsOpen} reduced={reduced} />
      <Valance />
      <Fireworks fire={fire} colors={["#E6C27A", "#D7263D", "#FFC9D2", "#F6E3B4", "#FFFFFF"]} />
      {mode === "live" && <MusicToggle music={music} style={{ top: 40 }} />}

      <div aria-hidden style={{ position: "fixed", top: 44, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6, padding: "6px 10px", borderRadius: 99, background: "rgba(18,8,28,.5)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", zIndex: 62 }}>
        {steps.map((s, k) => (
          <span key={s} style={{ width: k === i ? 18 : 6, height: 6, borderRadius: 9, background: k <= i ? (blush ? "#C8102E" : GOLD) : blush ? "#EBC9CF" : "rgba(230,194,122,.3)", transition: "width .3s" }} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <Screen key={`${step}-${run}`} id={step} preview={preview} reduced={reduced} style={step === "curtain" ? { zIndex: 70 } : undefined}>
          {step === "curtain" && <Curtain day={day} data={data} reduced={reduced} onNext={next} />}
          {step === "reasons" && <Reasons day={day} data={data} reduced={reduced} onNext={next} />}
          {step === "story" && <Timeline day={day} data={data} reduced={reduced} onNext={next} />}
          {step === "box" && <RingBox day={day} data={data} reduced={reduced} onNext={next} />}
          {step === "speech" && <Speech day={day} data={data} reduced={reduced} onNext={next} />}
          {step === "question" && <Question day={day} data={data} reduced={reduced} onYes={onYes} />}
          {step === "yes" && yes && (
            <Finale
              day={day}
              data={data}
              mode={mode}
              reduced={reduced}
              dodges={yes.dodges}
              at={yes.at}
              onReplay={replay}
              onReached={() => {
                if (completed.current) return;
                completed.current = true;
                react("completed");
              }}
            />
          )}
        </Screen>
      </AnimatePresence>
    </DayRoot>
  );
}
