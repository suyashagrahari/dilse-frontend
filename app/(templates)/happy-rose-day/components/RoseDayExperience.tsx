"use client";

// ─── Rose Day — "Ek Gulaab, Sirf Tumhare Liye" ───────────────────────────────
//
// A morning garden, one object: the rose.
//   1–3  grow   — a bare stem in a terracotta pot; press & hold to grow it
//                 (stem → leaves → petal layers → bloom + petal shower), then
//                 the colour-meaning card flips in (sender's colour + reason + count)
//   4    pluck  — loves me / loves me not, rigged to end on LOVES ME (or desi/french top tier)
//   5    letter — wax-sealed blush envelope with a pressed rose; crack → ink, word by word
//   6    bouquet— one bud per photo in a kraft cone; tap → bloom → polaroid
//   8    ending — the rose(s) in a bud vase, keepsake wallpaper, reply/replay/make one
// Every gesture has a tap/keyboard fallback; reduced motion skips the theatre.

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence } from "framer-motion";
import { getDay } from "../../_valentine/days";
import { VW } from "../../_valentine/theme";
import { DayRoot, MusicToggle, haptic, useReducedMotion, useSynthMusic } from "../../_valentine/kit";
import type { ExperienceProps, ValentineDayData } from "../../_valentine/types";
import type { RoseExtras } from "../../_valentine/days/happy-rose-day";
import GrowStage from "./rose/GrowStage";
import PluckGame from "./rose/PluckGame";
import WaxLetter from "./rose/WaxLetter";
import Bouquet from "./rose/Bouquet";
import RoseEnding from "./rose/RoseEnding";
import { accentVars, shadesFor } from "./rose/art";
import { FallingPetals, ROSE_CSS, Screen } from "./rose/ui";

const STEPS = ["grow", "pluck", "letter", "bouquet", "ending"] as const;
type Step = (typeof STEPS)[number];

export default function RoseDayExperience({ data: raw, mode, react }: ExperienceProps) {
  const day = getDay("happy-rose-day");
  const data = raw as ValentineDayData<RoseExtras>;
  const reduced = useReducedMotion();
  const sh = shadesFor(data.extras.roseColor);
  const [i, setI] = useState(0);
  const [run, setRun] = useState(0);
  const step: Step = STEPS[i];
  const music = useSynthMusic({ melody: day.melody, enabled: mode === "live" && data.music });
  const completed = useRef(false);

  const next = useCallback(() => {
    haptic(8);
    setI((k) => Math.min(STEPS.length - 1, k + 1));
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  }, [i, reduced]);

  const replay = () => {
    setRun((r) => r + 1);
    setI(0);
  };

  const preview = mode === "preview";

  return (
    <DayRoot day={day} style={accentVars(data.extras.roseColor) as CSSProperties}>
      <style>{ROSE_CSS}</style>
      {/* garden bokeh */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          background: `radial-gradient(40% 30% at 0% 10%, rgba(169,197,160,.35), transparent 70%), radial-gradient(35% 25% at 100% 30%, rgba(249,213,220,.7), transparent 70%), radial-gradient(45% 30% at 10% 100%, rgba(232,192,125,.22), transparent 70%), radial-gradient(40% 30% at 100% 95%, rgba(169,197,160,.3), transparent 70%)`,
        }}
      />
      <FallingPetals sh={sh} reduced={reduced} count={10} />
      {mode === "live" && <MusicToggle music={music} />}

      <div aria-hidden style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6, zIndex: 20, padding: "6px 10px", borderRadius: 99, background: "rgba(255,250,246,.7)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>
        {STEPS.map((s, k) => (
          <span key={s} style={{ width: k === i ? 20 : 7, height: 7, borderRadius: 9, background: k <= i ? VW.accent : VW.edge, opacity: k <= i ? 1 : 0.7, transition: "width .3s" }} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <Screen key={`${step}-${run}`} id={step} preview={preview} reduced={reduced}>
          {step === "grow" && <GrowStage day={day} data={data} reduced={reduced} onNext={next} />}
          {step === "pluck" && <PluckGame day={day} data={data} reduced={reduced} onNext={next} />}
          {step === "letter" && <WaxLetter day={day} data={data} reduced={reduced} onNext={next} />}
          {step === "bouquet" && <Bouquet day={day} data={data} reduced={reduced} onNext={next} />}
          {step === "ending" && (
            <RoseEnding
              day={day}
              data={data}
              mode={mode}
              reduced={reduced}
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
