"use client";

// ─── Chocolate Day ✦ Premium: "La Boîte" ───────────────────────────────────────────────────────────────────────
//
// The chocolatier's box, made for one person; every bonbon is one of their photos. research §D.3
// (.template-factory/premium-v2/research.md).
//
//  gate    the lid in matte cacao, their initials in gold foil, a satin ribbon. "Pull the ribbon" (the tap starts the
//          song; the ribbon slides off).
//  box     I  La boîte: their opening line over the closed box. Drag the lid up.
//          ↓  drop(): letterbox, riser, the lid hovers with light leaking out; the chorus lands, the lid flies off, the
//             tissue parts, a foil sheen runs across nine glossy photo-bonbons (THE money moment).
//          II The tasting: tap a piece, it lifts out and turns over to its flavour and the memory it tastes of.
//  heart   III The last piece: a ruby heart dusted in cocoa; brush it clean to find their photo and line.
//  letter  IV  Notes from the chocolatier: the menu card slides out of its sleeve.
//  voice   V   In my voice (or their words, large, when there is no recording).
//  end     "Every piece of it was you." The lid as a tiltable keepsake card + poster, the sealed P.S., reply, replay.
//
// One ShaderBackdrop + one GlowParticles for the page (presets change per chapter), grain + vignette always,
// SceneTransition between chapters. The tilt (useGyroParallax) is written once to --sx/--sy on the root, where the
// foil and the bonbons' gloss read it. Fixed layers (the lifted piece) live here, outside every transformed scene.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DayRoot, Sticker, useReducedMotion } from "../../_valentine/kit";
import {
  FilmGrain, GlowParticles, Letterbox, LightLeak, PremiumGate, PremiumRoot, SceneTransition, ShaderBackdrop, Vignette,
  requestTiltPermission, useGyroParallax, usePremium, type BackdropPreset, type TransitionVariant,
} from "../../_valentine/kit/premium";
import { getDay } from "../../_valentine/days";
import type { ExperienceProps } from "../../_valentine/types";
import { BOITE_FONT_VARS } from "./boite/fonts";
import { BOITE_CSS } from "./boite/styles";
import { readBoite } from "./boite/util";
import { registerBoiteCues } from "./boite/cues";
import { LidFace } from "./boite/Box";
import { BoxScene } from "./boite/BoxScene";
import { Tasting } from "./boite/Tasting";
import { HeartScene } from "./boite/HeartScene";
import { LetterScene } from "./boite/LetterScene";
import { VoiceScene } from "./boite/VoiceScene";
import { EndingScene } from "./boite/EndingScene";

const SLUG = "happy-chocolate-day-premium" as const;
type Scene = "gate" | "box" | "heart" | "letter" | "voice" | "end";

const BACKDROP: Record<Scene, BackdropPreset> = { gate: "velvet", box: "candle", heart: "candle", letter: "candle", voice: "candle", end: "candle" };
const ENTER: Record<Scene, TransitionVariant> = { gate: "iris", box: "iris", heart: "iris", letter: "fold", voice: "flash", end: "iris" };

function Boite({ data, mode, react }: ExperienceProps) {
  const day = getDay(SLUG);
  const p = usePremium();
  const reduce = useReducedMotion();
  const b = useMemo(() => readBoite(data), [data]);
  const [scene, setScene] = useState<Scene>(p.opened ? "box" : "gate");
  const [pulled, setPulled] = useState(false);
  const [bars, setBars] = useState(false);
  const [opened, setOpened] = useState(false);
  const [pick, setPick] = useState<number | null>(null);
  const [tasted, setTasted] = useState<ReadonlySet<number>>(() => new Set());
  const [run, setRun] = useState(0);
  const hasLetter = !!data.letter?.trim();
  const hasVoice = !!p.premium.voiceNote || !!p.premium.voiceCaption.trim();

  useEffect(() => registerBoiteCues(), []);

  // The tilt, written once as CSS variables (no re-render): the foil, the gloss and the sheen read --sx/--sy.
  const root = useRef<HTMLDivElement>(null);
  const par = useGyroParallax({ stiffness: 50, damping: 16 });
  useEffect(() => {
    const set = (k: string) => (v: number) => root.current?.style.setProperty(k, v.toFixed(3));
    const a = par.x.on("change", set("--sx"));
    const c = par.y.on("change", set("--sy"));
    return () => {
      a();
      c();
    };
  }, [par.x, par.y]);

  const order = useMemo(() => {
    const o: Scene[] = ["box", "heart"];
    if (hasLetter) o.push("letter");
    if (hasVoice) o.push("voice");
    o.push("end");
    return o;
  }, [hasLetter, hasVoice]);
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
    setOpened(false);
    setBars(false);
    setPick(null);
    setTasted(new Set());
    setRun((r) => r + 1);
    setScene("box");
  };

  const taste = (i: number) => {
    p.sfx("lb-lift", { gain: 0.8 });
    setPick(i);
    setTasted((s) => (s.has(i) ? s : new Set(s).add(i)));
  };

  let particles: "sparkles" | "embers" = "embers";
  let density = 0.16;
  if ((scene === "box" && opened) || scene === "end") {
    particles = "sparkles";
    density = scene === "end" ? 0.3 : 0.42;
  } else if (scene === "heart") {
    particles = "sparkles";
    density = 0.2;
  }

  const render = (s: Scene) => {
    switch (s) {
      case "gate":
        return null;
      case "box":
        return (
          <BoxScene
            key={run}
            b={b}
            tasted={tasted}
            out={pick}
            onRising={() => setBars(true)}
            onOpen={() => {
              setOpened(true);
              window.setTimeout(() => setBars(false), reduce ? 0 : 3000);
            }}
            onPick={taste}
            onNext={() => next("box")}
            sticker={sticker("pc3-yum", 54)}
          />
        );
      case "heart":
        return <HeartScene b={b} hasLetter={hasLetter} onDone={() => next("heart")} />;
      case "letter":
        return <LetterScene b={b} letter={data.letter} onDone={() => next("letter")} />;
      case "voice":
        return <VoiceScene from={b.from} photo={b.photos[b.photos.length - 1]} onDone={() => next("voice")} />;
      case "end":
        return <EndingScene b={b} data={data} day={day} mode={mode} sticker={sticker("pc6-box", 64)} onReplay={replay} />;
    }
  };

  const cw = b.cw;
  const vars = {
    ["--font-vw-ui" as string]: "var(--lb-sans)",
    ["--vw-font-ui" as string]: "var(--lb-sans), system-ui, sans-serif",
    ["--lid-hi" as string]: cw.lid[0],
    ["--lid" as string]: cw.lid[1],
    ["--lid-deep" as string]: cw.lid[2],
    ["--rib-hi" as string]: cw.ribbon[0],
    ["--rib" as string]: cw.ribbon[1],
    ["--rib-deep" as string]: cw.ribbon[2],
    ["--foil-l" as string]: cw.foil[0],
    ["--foil" as string]: cw.foil[1],
    ["--foil-d" as string]: cw.foil[2],
    ["--lid-ink" as string]: cw.ink,
    ["--glow" as string]: cw.glow,
  };

  return (
    <div
      ref={root}
      className={`lb-root ${BOITE_FONT_VARS}${cw.light ? " is-lightLid" : ""}`}
      // iOS asks for gyro permission only inside a tap: the gate's own tap is the one. The same tap pulls the ribbon.
      onClickCapture={
        scene === "gate"
          ? () => {
              void requestTiltPermission();
              if (pulled) return;
              setPulled(true);
              // After the gate's own handler has unlocked the audio (this capture runs first).
              window.setTimeout(() => p.sfx("ribbon", { gain: 0.8 }), 60);
            }
          : undefined
      }
      style={vars}
    >
      <style>{BOITE_CSS}</style>
      <ShaderBackdrop
        preset={BACKDROP[scene]}
        colors={scene === "gate" ? ["#0E0705", "#3A2018", "#9C6B4E"] : ["#0E0705", "#3A2018", "#C9A45C"]}
        intensity={scene === "gate" ? 0.75 : scene === "box" && opened ? 1.15 : 0.9}
        speed={0.6}
        parallax
      />
      <GlowParticles preset={particles} colors={["#FFE7B8", "#E3C27E", "#C9A45C"]} density={density} speed={0.45} z={1} />
      {(opened && scene === "box") || scene === "end" ? <LightLeak color="#FFB877" color2="#FFE2B0" corner="top-right" opacity={0.3} /> : null}
      <Vignette strength={0.64} />
      <FilmGrain opacity={0.07} />
      <Letterbox show={bars} />

      {scene === "gate" && (
        <PremiumGate
          art={<LidFace b={b} ribbon pulled={pulled} className="lb-gateLid" />}
          kicker="A box made by hand for"
          subtitle="Chocolate Day · sound on"
          sting="chime"
          openLabel="Pull the ribbon"
          sealText={`Made by hand for ${b.to}`}
          className="lb-gate"
          bg="transparent"
          ink="#F3E6D3"
          accent="#C9A45C"
          openMs={reduce ? 250 : 1200}
          onOpen={() => {
            react("opened");
            setScene("box");
          }}
        />
      )}

      <div className="lb-stage">
        {scene !== "gate" && (
          <SceneTransition sceneKey={`${scene}-${run}`} variant={ENTER[scene]} origin="50% 50%">
            {render(scene)}
          </SceneTransition>
        )}
      </div>

      <Tasting key={pick ?? -1} piece={pick != null ? (b.pieces[pick] ?? null) : null} at={pick ?? 0} onClose={() => setPick(null)} />
    </div>
  );
}

export default function ChocolateDayPremiumExperience(props: ExperienceProps) {
  const day = getDay(SLUG);
  return (
    <PremiumRoot data={props.data} mode={props.mode} slug={SLUG}>
      <DayRoot day={day} data={props.data} layout="full" dark>
        <Boite {...props} />
      </DayRoot>
    </PremiumRoot>
  );
}
