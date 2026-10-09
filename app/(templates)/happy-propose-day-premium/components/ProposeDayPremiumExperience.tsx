"use client";

// ─── Propose Day ✦ Premium — "The Premiere" ─────────────────────────────────────────────────────────────────────
//
// Your relationship, screened as a film for an audience of one (research §D.2).
//
//  gate        a printed ticket, "Take your seat" (PremiumGate: the tap starts the song)
//  leader      the projector leader: 3 · 2 · 1 with the sweep and the pop → "Based on a true story."
//  titles      "{FROM} presents" → the title in foil, "Starring {TO}", the tagline → Roll film (slate clap)
//  act1        Act I · How it started — drag the focus ring until the still snaps sharp; the subtitle types in
//  act2        Act II · The moment I knew — hold for slow motion: B&W → colour, push-in, words appear
//  act3        Act III · Coming soon — swipe the trailer cards (braam + cut flash)
//  commentary  the director's commentary: the voice note, or the caption typed as a subtitle
//  script      the last page of the screenplay: the letter as the sender's dialogue, a paragraph per tap
//  question    the final title card in a scope band. YES → drop(): the bars sweep open to full screen on the
//              chorus, the last photo floods in, "{TO} said yes." + applause (the money moment)
//  credits     the end credits roll (hold to pause) → the lobby: poster, review (reply), post-credits P.S.
//
// One WebGL context (ShaderBackdrop, preset switched per scene) + one particle canvas. The letterbox is CSS
// variables on the root (styles.ts), so "the bars sweep open" is one class change.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DayRoot } from "../../_valentine/kit";
import { FilmGrain, GlowParticles, PremiumGate, PremiumRoot, SceneTransition, ShaderBackdrop, Vignette, requestTiltPermission, usePremium, type BackdropPreset, type TransitionVariant } from "../../_valentine/kit/premium";
import { getDay } from "../../_valentine/days";
import type { ExperienceProps } from "../../_valentine/types";
import { PREMIERE_FONT_VARS } from "./premiere/fonts";
import { registerPremiereCues } from "./premiere/cues";
import { PREMIERE_CSS } from "./premiere/styles";
import { readFilm } from "./premiere/util";
import { Leader, Ticket, Titles } from "./premiere/Opening";
import { ActOne, ActThree, ActTwo } from "./premiere/Acts";
import { Commentary, Script } from "./premiere/Script";
import { Question } from "./premiere/Question";
import { Credits } from "./premiere/Credits";

registerPremiereCues();

const SLUG = "happy-propose-day-premium" as const;
type Scene = "gate" | "leader" | "titles" | "act1" | "act2" | "act3" | "commentary" | "script" | "question" | "credits";

const SLATE: Record<Scene, string> = {
  gate: "",
  leader: "Reel 1",
  titles: "Reel 1",
  act1: "Reel 2",
  act2: "Reel 3",
  act3: "Reel 4",
  commentary: "Reel 5",
  script: "Reel 5",
  question: "Final reel",
  credits: "",
};
const CUT: Partial<Record<Scene, TransitionVariant>> = { leader: "flash", act1: "flash", act2: "flash", act3: "flash", script: "fold", question: "iris", credits: "iris" };

// [deep, mid, highlight] per scene: the velvet house curtain at the door, the projector beam everywhere else.
const BACK: Record<Scene, { preset: BackdropPreset; colors: [string, string, string]; intensity: number }> = {
  gate: { preset: "velvet", colors: ["#140204", "#5e0d14", "#c8414f"], intensity: 1 },
  leader: { preset: "candle", colors: ["#030303", "#151311", "#d8b25a"], intensity: 0.6 },
  titles: { preset: "candle", colors: ["#030303", "#1a1612", "#e8cf8a"], intensity: 0.95 },
  act1: { preset: "candle", colors: ["#030303", "#120f0d", "#d8b25a"], intensity: 0.5 },
  act2: { preset: "candle", colors: ["#030303", "#120f0d", "#d8b25a"], intensity: 0.5 },
  act3: { preset: "candle", colors: ["#020203", "#16141a", "#c9d4ff"], intensity: 0.8 },
  commentary: { preset: "candle", colors: ["#030303", "#1a1612", "#f3d58c"], intensity: 1 },
  script: { preset: "candle", colors: ["#030303", "#17130f", "#e8cf8a"], intensity: 0.75 },
  question: { preset: "bokeh", colors: ["#030102", "#2a0609", "#c9a45c"], intensity: 0.55 },
  credits: { preset: "candle", colors: ["#020202", "#0f0d0b", "#b89a55"], intensity: 0.5 },
};

function Show({ data, react }: ExperienceProps) {
  const day = getDay(SLUG);
  const p = usePremium();
  const film = useMemo(() => readFilm(data), [data]);
  const [scene, setScene] = useState<Scene>("gate");
  const [open, setOpen] = useState(false);
  const [premiered, setPremiered] = useState<Date | null>(null);
  const [run, setRun] = useState(0);
  const { music } = p;

  const go = useCallback((s: Scene) => setScene(s), []);

  // the song's level follows the film: full for the acts, softer under the page; the question dips it itself
  const musicRef = useRef(music);
  useEffect(() => {
    musicRef.current = music;
  });
  useEffect(() => {
    const m = musicRef.current;
    if (!m?.canFade) return;
    if (scene === "script") m.fadeTo(0.6, 1400);
    if (scene === "act1" || scene === "act3" || scene === "titles" || scene === "credits") m.fadeTo(1, 1200);
  }, [scene]);

  const hasCommentary = !!(p.premium.voiceNote || p.premium.voiceCaption);
  const bars = scene === "gate" || scene === "leader" || scene === "credits" || (scene === "question" && open) ? "off" : scene === "question" ? "scope" : scene === "script" ? "page" : "film";
  const back = BACK[scene];
  const yesNow = scene === "question" && open;
  const showParticles = yesNow || scene === "titles" || scene === "commentary" || scene === "act3" || scene === "gate";

  const replay = () => {
    setRun((r) => r + 1);
    setOpen(false);
    go("titles");
  };

  const render = (s: Scene) => {
    switch (s) {
      case "gate":
        return null;
      case "leader":
        return <Leader onDone={() => go("titles")} />;
      case "titles":
        return <Titles film={film} onRoll={() => go("act1")} />;
      case "act1":
        return <ActOne film={film} onNext={() => go("act2")} />;
      case "act2":
        return <ActTwo film={film} onNext={() => go("act3")} />;
      case "act3":
        return <ActThree film={film} onNext={() => go(hasCommentary ? "commentary" : "script")} />;
      case "commentary":
        return <Commentary film={film} onNext={() => go("script")} />;
      case "script":
        return <Script film={film} letter={data.letter || ""} onNext={() => go("question")} />;
      case "question":
        return (
          <Question
            film={film}
            day={day}
            data={data}
            onAnswer={(d) => {
              setPremiered(new Date());
              react("answered", { noDodges: d });
            }}
            onPeak={() => setOpen(true)}
            onCredits={() => go("credits")}
          />
        );
      case "credits":
        return <Credits film={film} day={day} data={data} premieredAt={premiered} onArrive={() => react("completed")} onReplay={replay} />;
    }
  };

  return (
    // iOS only grants the gyro (TiltCard, parallax) from inside a tap: ask on the gate's tap.
    <div className={`pr-root pr-bars-${bars} ${PREMIERE_FONT_VARS}`} onClickCapture={scene === "gate" ? () => void requestTiltPermission() : undefined}>
      <style>{PREMIERE_CSS}</style>
      <div className="pr-back" aria-hidden>
        <ShaderBackdrop preset={back.preset} colors={back.colors} intensity={back.intensity} speed={0.7} fixed={false} parallax />
        {showParticles && (
          <GlowParticles
            preset={yesNow ? "sparkles" : "fireflies"}
            colors={yesNow ? ["#F3D58C", "#D8B25A", "#FFF4CF"] : ["#FFE7B0", "#E9E6DF"]}
            density={yesNow ? 0.75 : 0.22}
            speed={0.5}
            fixed={false}
            z={yesNow ? 4 : 1}
          />
        )}
      </div>
      <span className="pr-bar top" aria-hidden />
      <span className="pr-bar bot" aria-hidden />
      <div className="pr-stage">
        <SceneTransition sceneKey={`${run}-${scene}`} variant={CUT[scene] ?? "iris"} flashColor="#FFF4DE" duration={CUT[scene] === "flash" ? 0.7 : 1}>
          {render(scene)}
        </SceneTransition>
      </div>
      {SLATE[scene] && !yesNow && (
        <div className="pr-slate" aria-hidden>
          <i />
          {SLATE[scene]}
        </div>
      )}
      <Vignette strength={0.55} />
      <FilmGrain opacity={0.075} />

      {scene === "gate" && (
        <PremiumGate
          art={<Ticket film={film} date={`${day.date} ${day.month.slice(0, 3)}`} />}
          kicker="Tonight's premiere, for"
          subtitle={<span style={{ fontFamily: "var(--pr-mono), monospace", fontSize: 13, letterSpacing: ".18em", textTransform: "uppercase", opacity: 0.8 }}>A {film.from} production</span>}
          sting="pr-start"
          openLabel="Take your seat"
          openMs={1000}
          className={`pr-gate ${PREMIERE_FONT_VARS}`}
          bg="radial-gradient(110% 70% at 50% 42%, rgba(20,2,4,0) 0%, rgba(8,2,3,.35) 62%, rgba(4,1,2,.85) 100%)"
          ink="#F1ECE2"
          accent="#D8B25A"
          onOpen={({ repeatVisit }) => go(repeatVisit ? "titles" : "leader")}
        />
      )}
    </div>
  );
}

export default function ProposeDayPremiumExperience(props: ExperienceProps) {
  const day = getDay(SLUG);
  return (
    <PremiumRoot data={props.data} mode={props.mode} slug={SLUG}>
      <DayRoot day={day} data={props.data} layout="full" dark>
        <Show {...props} />
      </DayRoot>
    </PremiumRoot>
  );
}
