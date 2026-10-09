"use client";

// ─── Rose Day ✦ Premium: "The Bloom of Us" ───────────────────────────────────────────────────────────────────
//
// The buyer's photos are the petals. research §D.1 (.template-factory/premium-v2/research.md).
//
//  gate    a single hairline of gold draws a long-stem rose; "For {name}". The tap starts the song (PremiumGate).
//  rose    I  The bud: their opening line over a closed velvet bud. Hold to warm it (heartbeat).
//          ↓  drop(): letterbox, riser, the chorus lands and the bud opens ring by ring, every petal a photo; the
//             camera tilts down and pulls back (THE money moment). Petals start to fall.
//          II The bloom: their bloom line; tap a petal to lift its photo out; the colour's meaning; "Turn the pages".
//  pages   III Pressed pages: three photos under vellum, swipe to lift each, caption + note.
//  letter  IV  The letter on cream paper with pressed petals; tap to raise it, paragraphs ink in as you read.
//  voice   V   In my voice: the voice note over a graded photo (or their words, large, when there is no recording).
//  end     "Every Rose Day, it's still you." A tiltable keepsake card + poster, the sealed P.S., reply, replay.
//
// One ShaderBackdrop + one GlowParticles for the whole page (presets change per chapter), grain + vignette always,
// SceneTransition between chapters. Fixed layers (the lightbox) live here, outside every transformed scene.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DayRoot, Sticker, useReducedMotion } from "../../_valentine/kit";
import {
  FilmGrain, GlowParticles, Letterbox, LightLeak, PremiumGate, PremiumRoot, SceneTransition, ShaderBackdrop, Vignette,
  requestTiltPermission, usePremium, type BackdropPreset, type GlowPreset, type TransitionVariant,
} from "../../_valentine/kit/premium";
import { getDay } from "../../_valentine/days";
import type { ExperienceProps } from "../../_valentine/types";
import { BLOOM_FONT_VARS } from "./bloom/fonts";
import { BLOOM_CSS } from "./bloom/styles";
import { pressedPhotos, readBloom, SHADES } from "./bloom/util";
import { GoldRose } from "./bloom/GoldRose";
import { BloomScene } from "./bloom/BloomScene";
import { PagesScene } from "./bloom/PagesScene";
import { LetterScene } from "./bloom/LetterScene";
import { VoiceScene } from "./bloom/VoiceScene";
import { EndingScene } from "./bloom/EndingScene";
import { PetalLightbox } from "./bloom/PetalLightbox";

const SLUG = "happy-rose-day-premium" as const;
type Scene = "gate" | "rose" | "pages" | "letter" | "voice" | "end";

const BACKDROP: Record<Scene, BackdropPreset> = { gate: "velvet", rose: "candle", pages: "candle", letter: "candle", voice: "candle", end: "bokeh" };
const ENTER: Record<Scene, TransitionVariant> = { gate: "iris", rose: "iris", pages: "iris", letter: "fold", voice: "flash", end: "iris" };

function Bloom({ data, mode, react }: ExperienceProps) {
  const day = getDay(SLUG);
  const p = usePremium();
  const reduce = useReducedMotion();
  const b = useMemo(() => readBloom(data), [data]);
  const shade = SHADES[b.color];
  const [scene, setScene] = useState<Scene>(p.opened ? "rose" : "gate");
  const [bars, setBars] = useState(false);
  const [bloomed, setBloomed] = useState(false);
  const [pick, setPick] = useState<number | null>(null);
  const [run, setRun] = useState(0);
  const pages = useMemo(() => pressedPhotos(b.photos), [b.photos]);
  const hasLetter = !!data.letter?.trim();
  const hasVoice = !!p.premium.voiceNote || !!p.premium.voiceCaption.trim();

  const order = useMemo(() => {
    const o: Scene[] = ["rose"];
    if (pages.length) o.push("pages");
    if (hasLetter) o.push("letter");
    if (hasVoice) o.push("voice");
    o.push("end");
    return o;
  }, [pages.length, hasLetter, hasVoice]);
  const next = useCallback(
    (from: Scene) => {
      const i = order.indexOf(from);
      setScene(order[Math.min(order.length - 1, i + 1)]);
    },
    [order],
  );

  // The song sits a little lower under the letter (where the platform lets us fade it).
  const musicRef = useRef(p.music);
  useEffect(() => {
    musicRef.current = p.music;
  });
  useEffect(() => {
    const m = musicRef.current;
    if (!m?.canFade || scene === "gate") return;
    m.fadeTo(scene === "letter" ? 0.55 : 1, 1400);
  }, [scene]);

  const reactRef = useRef(react);
  useEffect(() => {
    reactRef.current = react;
  });
  useEffect(() => {
    if (scene === "end") reactRef.current("completed");
  }, [scene]);

  const sticker = (id: string, size: number) => {
    const slot = day.gifSlots.find((s) => s.id === id);
    return slot ? <Sticker slug={day.slug} slot={slot} value={data.gifs?.[id]} size={size} alt="" /> : null;
  };

  const replay = () => {
    setBloomed(false);
    setBars(false);
    setRun((r) => r + 1);
    setScene("rose");
  };

  const glowColors = [shade.light, shade.base, "#F2D4D2"];
  let particles: GlowPreset = "sparkles";
  let density = 0.22;
  let pColors: string[] = ["#FFE7B8", "#E3C27E"];
  if ((scene === "rose" && bloomed) || scene === "end") {
    particles = "petals";
    density = scene === "end" ? 0.35 : 0.5;
    pColors = glowColors;
  } else if (scene === "pages") {
    particles = "petals";
    density = 0.18;
    pColors = glowColors;
  }

  const render = (s: Scene) => {
    switch (s) {
      case "gate":
        return null;
      case "rose":
        return (
          <BloomScene
            key={run}
            b={b}
            onRising={() => setBars(true)}
            onOpen={() => {
              setBloomed(true);
              window.setTimeout(() => setBars(false), reduce ? 0 : 3200);
            }}
            onPick={setPick}
            onNext={() => next("rose")}
            sticker={sticker("pr3-petals", 56)}
          />
        );
      case "pages":
        return <PagesScene pages={pages} to={b.to} onDone={() => next("pages")} />;
      case "letter":
        return <LetterScene b={b} letter={data.letter} onDone={() => next("letter")} />;
      case "voice":
        return <VoiceScene from={b.from} photo={b.photos[b.photos.length - 1]} onDone={() => next("voice")} />;
      case "end":
        return <EndingScene b={b} data={data} day={day} mode={mode} sticker={sticker("pr6-forever", 64)} onReplay={replay} />;
    }
  };

  return (
    <div
      className={`rb-root ${BLOOM_FONT_VARS}`}
      // iOS asks for gyro permission only inside a tap: the gate's own tap is the one.
      onClickCapture={scene === "gate" ? () => void requestTiltPermission() : undefined}
      style={{ ["--font-vw-ui" as string]: "var(--rb-sans)", ["--vw-font-ui" as string]: "var(--rb-sans), system-ui, sans-serif", ["--glow" as string]: shade.glow }}
    >
      <style>{BLOOM_CSS}</style>
      <ShaderBackdrop
        preset={BACKDROP[scene]}
        colors={["#0E0306", shade.deep, scene === "gate" ? "#8A6A2F" : shade.base]}
        intensity={scene === "gate" ? 0.7 : scene === "rose" && bloomed ? 1.2 : 0.95}
        speed={0.7}
        parallax
      />
      <GlowParticles preset={particles} colors={pColors} density={density} speed={particles === "petals" ? 0.7 : 0.5} z={1} />
      {(bloomed && scene === "rose") || scene === "end" ? <LightLeak color={`rgb(${shade.glow})`} color2="#FFD9A0" corner="top-right" opacity={0.35} /> : null}
      <Vignette strength={0.62} />
      <FilmGrain opacity={0.07} />
      <Letterbox show={bars} />

      {scene === "gate" && (
        <PremiumGate
          art={<GoldRose size={260} />}
          kicker="Something has been opening for"
          subtitle="Rose Day · sound on, somewhere quiet"
          sting="chime-cascade"
          openLabel="Let it open"
          className="rb-gate"
          bg="transparent"
          ink="#F6F0E6"
          accent="#C9A45C"
          openMs={reduce ? 250 : 1100}
          onOpen={() => {
            react("opened");
            setScene("rose");
          }}
        />
      )}

      <div className="rb-stage">
        {scene !== "gate" && (
          <SceneTransition sceneKey={`${scene}-${run}`} variant={ENTER[scene]} origin={scene === "pages" ? "50% 45%" : "50% 50%"}>
            {render(scene)}
          </SceneTransition>
        )}
      </div>

      <PetalLightbox photo={pick != null ? (b.photos[pick] ?? null) : null} onClose={() => setPick(null)} />
    </div>
  );
}

export default function RoseDayPremiumExperience(props: ExperienceProps) {
  const day = getDay(SLUG);
  return (
    <PremiumRoot data={props.data} mode={props.mode} slug={SLUG}>
      <DayRoot day={day} data={props.data} layout="full" dark>
        <Bloom {...props} />
      </DayRoot>
    </PremiumRoot>
  );
}
