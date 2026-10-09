"use client";

// ─── happy-halloween-premium — "A Night at the Manor" ────────────────────────
//
// Cute-spooky, never scary; the buyer's photos and words are the hero.
//   gate      "Trick or treat, {name}?" — both buttons are a treat; the tap
//             starts the song (custom gate, same synchronous contract as
//             PremiumGate: p.open() + sting inside the tap)
//   hall      I · The Hall of Portraits — drag a torch beam through the dark to
//             find their photos (gilt portraits) and notes on the walls
//   seance    II · hold a finger on the talking board; the planchette spells
//             their name, then the sender's word, then YES
//   tarot     III · three cards, Past / Present / Future, flip each one
//   voice     IV · a voice from beyond (voice note, or the crystal ball's line)
//   letter    V · hold to light the candle; parchment letter + sealed P.S.
//   portrait  VI · THE MONEY MOMENT: the last portrait is in the dark; the
//             beam finds it → drop() → thunder + flash → it's them, and it
//             winks. Names, then the question.
//   ending    VII · "Stay haunted": costume-duo poster keepsake, reply, replay.
// Atmosphere: one fog ShaderBackdrop (constant colours — a colour change would
// rebuild the GL context), one GlowParticles layer whose preset follows the
// scene, grain + vignette on top. Chapters after the hall are code-split and
// prefetched one scene ahead.

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { getDay } from "../../_valentine/days";
import { DayRoot, Sticker } from "../../_valentine/kit";
import {
  FilmGrain, GlowParticles, PremiumRoot, SceneTransition, ShaderBackdrop, SkipChip, Vignette, usePremium, type GlowPreset,
} from "../../_valentine/kit/premium";
import type { ExperienceProps, GifSlot } from "../../_valentine/types";
import { registerNightCues } from "./night/cues";
import { NM_FONT_VARS } from "./night/fonts";
import Gate from "./night/Gate";
import Hall from "./night/Hall";
import { readNight } from "./night/model";
import { UI_CSS } from "./night/ui";

registerNightCues();

const day = getDay("happy-halloween-premium");

const load = {
  seance: () => import("./night/Seance"),
  tarot: () => import("./night/Tarot"),
  voice: () => import("./night/Voice"),
  letter: () => import("./night/Letter"),
  portrait: () => import("./night/Portrait"),
  ending: () => import("./night/Ending"),
};
const Seance = dynamic(load.seance, { ssr: false });
const Tarot = dynamic(load.tarot, { ssr: false });
const Voice = dynamic(load.voice, { ssr: false });
const Letter = dynamic(load.letter, { ssr: false });
const Portrait = dynamic(load.portrait, { ssr: false });
const Ending = dynamic(load.ending, { ssr: false });

type Scene = "gate" | "hall" | "seance" | "tarot" | "voice" | "letter" | "portrait" | "ending";
const ALL: Scene[] = ["gate", "hall", "seance", "tarot", "voice", "letter", "portrait", "ending"];
const SKIPPABLE = new Set<Scene>(["hall", "seance", "tarot", "voice"]);

function Night({ data, mode, react }: ExperienceProps) {
  const p = usePremium();
  const n = useMemo(() => readNight(data), [data]);
  const order = useMemo(() => ALL.filter((s) => s !== "hall" || n.hall.length + n.notes.length > 0), [n.hall.length, n.notes.length]);
  const [scene, setScene] = useState<Scene>(() => (p.opened ? order[1] : "gate"));
  const [round, setRound] = useState(0);
  const [peak, setPeak] = useState(false);
  const next = useCallback(() => setScene((s) => order[Math.min(order.length - 1, order.indexOf(s) + 1)]), [order]);

  // Prefetch the next chapter's code while this one plays.
  useEffect(() => {
    const nx = order[order.indexOf(scene) + 1] as keyof typeof load | undefined;
    if (nx && nx in load) void load[nx]();
  }, [scene, order]);

  const completed = useRef(false);
  useEffect(() => {
    if (scene === "ending" && !completed.current) {
      completed.current = true;
      react("completed");
    }
  }, [scene, react]);

  // Unsealed by a scheduled unlock in the last two days → the gate says so.
  const [justUnsealed] = useState(() => {
    const at = Date.parse(p.premium.unlockAt || "");
    const now = Date.now();
    return Number.isFinite(at) && now >= at && now - at < 48 * 3600e3;
  });

  const sticker = (id: string): ReactNode => {
    const s: GifSlot | undefined = day.gifSlots.find((g) => g.id === id);
    if (!s || !data.gifs?.[s.id]) return null;
    return <Sticker slug={day.slug} slot={s} value={data.gifs[s.id]} size={84} />;
  };

  const replay = () => {
    setRound((r) => r + 1);
    setPeak(false);
    setScene(order[1]);
  };

  const particles: { preset: GlowPreset; colors?: string[]; density: number } | null =
    scene === "gate" ? { preset: "embers", colors: ["#F2B35B", "#E0782F", "#FFE2A8"], density: 0.32 }
    : scene === "seance" ? { preset: "fireflies", colors: ["#FFE2A8", "#F2B35B"], density: 0.28 }
    : scene === "tarot" ? { preset: "sparkles", colors: ["#E8CF8A", "#FFF4CF"], density: 0.3 }
    : scene === "voice" ? { preset: "fireflies", colors: ["#d9c8ff", "#b48cff"], density: 0.26 }
    : scene === "letter" ? { preset: "embers", colors: ["#F2B35B", "#FFE2A8"], density: 0.22 }
    : scene === "portrait" && peak ? { preset: "bats", density: 0.5 }
    : scene === "ending" ? { preset: "embers", colors: ["#F2B35B", "#E0782F", "#E8CF8A"], density: 0.3 }
    : null;

  let body: ReactNode = null;
  switch (scene) {
    case "gate":
      body = <Gate n={n} justUnsealed={justUnsealed} onOpen={next} />;
      break;
    case "hall":
      body = <Hall n={n} sticker={sticker("h1-hall")} onNext={next} />;
      break;
    case "seance":
      body = <Seance n={n} onNext={next} />;
      break;
    case "tarot":
      body = <Tarot n={n} onNext={next} />;
      break;
    case "voice":
      body = <Voice n={n} onNext={next} />;
      break;
    case "letter":
      body = <Letter n={n} letter={data.letter || "Happy Halloween."} onNext={next} />;
      break;
    case "portrait":
      body = (
        <Portrait
          n={n}
          sticker={sticker("h6-yes")}
          onPeak={() => setPeak(true)}
          onYes={(d) => react("answered", { noDodges: d })}
          onNext={next}
        />
      );
      break;
    case "ending":
      body = <Ending n={n} endLine={data.endLine || ""} mode={mode} onReplay={replay} />;
      break;
  }

  return (
    <div className="nm-root">
      <ShaderBackdrop preset="fog" colors={["#0b0610", "#3a2236", "#f2b35b"]} intensity={1.05} speed={0.7} parallax />
      {particles && <GlowParticles preset={particles.preset} colors={particles.colors} density={particles.density} z={1} />}

      <div className="nm-stage">
        <SceneTransition sceneKey={`${scene}-${round}`} variant={scene === "hall" ? "iris" : "ink"} origin={scene === "hall" ? "50% 42%" : "50% 60%"}>
          {body}
        </SceneTransition>
      </div>

      <Vignette strength={0.62} z={69} />
      <FilmGrain opacity={0.075} z={70} />

      {SKIPPABLE.has(scene) && (
        <SkipChip
          key={`skip-${scene}-${round}`}
          onSkip={next}
          label="Skip ›"
          delay={p.repeatVisit ? 0 : 4000}
          style={{ right: "auto", left: "calc(max(12px, env(safe-area-inset-left, 0px)) + 52px)", top: "max(12px, env(safe-area-inset-top, 0px))", background: "rgba(12,7,14,.55)", color: "#E8DFCC", border: "1px solid rgba(232,223,204,.2)", font: "400 14px/1 var(--font-nm-body), Georgia, serif", minHeight: 44 }}
        />
      )}
      <style>{UI_CSS}</style>
    </div>
  );
}

export default function HalloweenPremiumExperience(props: ExperienceProps) {
  return (
    <PremiumRoot data={props.data} mode={props.mode} slug="happy-halloween-premium" chipStyle={{ background: "rgba(12,7,14,.55)", color: "#E8DFCC", borderColor: "rgba(232,223,204,.2)" }}>
      <DayRoot day={day} data={props.data} layout="full" className={NM_FONT_VARS}>
        <Night {...props} />
      </DayRoot>
    </PremiumRoot>
  );
}
