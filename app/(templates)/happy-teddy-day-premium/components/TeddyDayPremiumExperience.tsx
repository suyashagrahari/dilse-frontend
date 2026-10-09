"use client";

// ─── Teddy Day ✦ Premium: "Adoption Papers" ──────────────────────────────────────────────────────────────────
//
// research §D.4 (.template-factory/premium-v2/research.md). No drawn teddy, ever: the bear is Fluent 3D art and
// everything else is type and material (manila, satin labels, letterpress paper, gold foil, a rubber stamp).
//
//  gate    a manila parcel tag on twine: "Fragile: contains one (1) hug". The tap starts the song (PremiumGate).
//  meet    I    Arrival: the bear in a pool of light, a woven tag with both names. Squeeze him: his first words.
//  family  II   Next of kin: their photos as paper-clipped exhibits in his file; flick through the stack.
//  care    III  Care instructions: satin care labels that flip to love notes ("Responds to forehead kisses.").
//  letter  IV   Enclosed with him: the letter, folded in three; tap to unfold.
//  voice   V    In my voice: the voice note over a graded photo (or their words, large).
//  adopt   VI   The certificate: they sign it with a finger, hold to press the seal, and drop(): the gold seal
//               embosses with a thump and ADOPTED ♥ is stamped on it as the chorus lands (THE money moment).
//  end     the signed certificate as a tiltable keepsake + poster, the sealed P.S., reply, replay.
//
// One ShaderBackdrop + one GlowParticles for the whole page (presets change per chapter), grain + vignette always,
// SceneTransition between chapters. Chapters with nothing to show (no photos, letter or voice) are skipped.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DayRoot, Sticker, useReducedMotion } from "../../_valentine/kit";
import {
  FilmGrain, GlowParticles, Letterbox, LightLeak, PremiumGate, PremiumRoot, SceneTransition, ShaderBackdrop, Vignette,
  requestTiltPermission, usePremium, type BackdropPreset, type TransitionVariant,
} from "../../_valentine/kit/premium";
import { getDay } from "../../_valentine/days";
import type { ExperienceProps } from "../../_valentine/types";
import { PAPERS_FONT_STYLE, PAPERS_FONT_VARS } from "./papers/fonts";
import { PAPERS_CSS } from "./papers/styles";
import { C, ROMAN, readPapers } from "./papers/util";
import { ParcelTag } from "./papers/ParcelTag";
import { MeetScene } from "./papers/MeetScene";
import { FamilyScene } from "./papers/FamilyScene";
import { CareScene } from "./papers/CareScene";
import { LetterScene } from "./papers/LetterScene";
import { VoiceScene } from "./papers/VoiceScene";
import { AdoptScene } from "./papers/AdoptScene";
import { EndingScene, type Ink } from "./papers/EndingScene";

const SLUG = "happy-teddy-day-premium" as const;
type Scene = "gate" | "meet" | "family" | "care" | "letter" | "voice" | "adopt" | "end";

const BACKDROP: Record<Scene, BackdropPreset> = { gate: "candle", meet: "candle", family: "candle", care: "candle", letter: "candle", voice: "candle", adopt: "candle", end: "candle" };
const ENTER: Record<Scene, TransitionVariant> = { gate: "iris", meet: "iris", family: "fold", care: "iris", letter: "fold", voice: "flash", adopt: "iris", end: "flash" };

function Papers({ data, mode, react }: ExperienceProps) {
  const day = getDay(SLUG);
  const pm = usePremium();
  const reduce = useReducedMotion();
  const p = useMemo(() => readPapers(data), [data]);
  const [scene, setScene] = useState<Scene>(pm.opened ? "meet" : "gate");
  const [bars, setBars] = useState(false);
  const [adopted, setAdopted] = useState(false);
  const [ink, setInk] = useState<Ink>(null);
  const [run, setRun] = useState(0);
  const hasLetter = !!data.letter?.trim();
  const hasVoice = !!pm.premium.voiceNote || !!pm.premium.voiceCaption.trim();

  const order = useMemo(() => {
    const o: Scene[] = ["meet"];
    if (p.photos.length) o.push("family");
    o.push("care");
    if (hasLetter) o.push("letter");
    if (hasVoice) o.push("voice");
    o.push("adopt", "end");
    return o;
  }, [p.photos.length, hasLetter, hasVoice]);
  const next = useCallback((from: Scene) => setScene(order[Math.min(order.length - 1, order.indexOf(from) + 1)]), [order]);
  const num = (s: Scene) => ROMAN[Math.max(0, order.indexOf(s))];

  // The song sits lower under the letter (where the platform lets us fade it).
  const musicRef = useRef(pm.music);
  useEffect(() => {
    musicRef.current = pm.music;
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
    setAdopted(false);
    setBars(false);
    setInk(null);
    setRun((r) => r + 1);
    setScene("meet");
  };

  const warm = adopted || scene === "end";
  const render = (s: Scene) => {
    switch (s) {
      case "gate":
        return null;
      case "meet":
        return <MeetScene p={p} n={num("meet")} sticker={sticker("pt3-alive", 58)} onNext={() => next("meet")} />;
      case "family":
        return <FamilyScene photos={p.photos} n={num("family")} teddy={p.teddy} onNext={() => next("family")} />;
      case "care":
        return <CareScene care={p.care} n={num("care")} teddy={p.teddy} from={p.from} onNext={() => next("care")} />;
      case "letter":
        return <LetterScene p={p} n={num("letter")} letter={data.letter} onDone={() => next("letter")} />;
      case "voice":
        return <VoiceScene from={p.from} n={num("voice")} photo={p.photos[p.photos.length - 1]} onDone={() => next("voice")} />;
      case "adopt":
        return (
          <AdoptScene
            p={p}
            n={num("adopt")}
            onSigned={setInk}
            onRising={() => setBars(true)}
            onAdopted={() => {
              setAdopted(true);
              window.setTimeout(() => setBars(false), reduce ? 0 : 2600);
            }}
            onNext={() => next("adopt")}
          />
        );
      case "end":
        return <EndingScene p={p} data={data} day={day} mode={mode} ink={ink} sticker={sticker("pt6-sleep", 60)} onReplay={replay} />;
    }
  };

  return (
    <div
      className="ap-root"
      // iOS asks for gyro permission only inside a tap: the gate's own tap is the one.
      onClickCapture={scene === "gate" ? () => void requestTiltPermission() : undefined}
    >
      <style>{PAPERS_CSS}</style>
      <ShaderBackdrop
        preset={BACKDROP[scene]}
        colors={[C.night, scene === "gate" ? "#3A2418" : C.cocoa, warm ? "#E9A15B" : C.honey]}
        intensity={scene === "gate" ? 0.75 : warm ? 1.15 : 0.95}
        speed={0.6}
        parallax
      />
      <GlowParticles
        preset={warm ? "hearts" : "fireflies"}
        colors={warm ? [C.stamp, "#E07A6E", C.honeyLight] : ["#FFD9A0", "#E9C08A"]}
        density={warm ? (scene === "end" ? 0.22 : 0.4) : 0.16}
        speed={warm ? 0.6 : 0.45}
        z={1}
      />
      {warm && <LightLeak color="#FFB070" color2="#FFE2B8" corner="top-left" opacity={0.3} />}
      <Vignette strength={0.6} />
      <FilmGrain opacity={0.075} />
      <Letterbox show={bars} />

      {scene === "gate" && (
        <PremiumGate
          art={<ParcelTag line={p.tagLine} serial={p.serial} to={p.to} />}
          kicker="A parcel has arrived for"
          subtitle="Teddy Day · sound on, somewhere cosy"
          sting="ribbon"
          openLabel="Untie the string"
          className="ap-gate"
          bg="transparent"
          ink={C.paper}
          accent={C.honey}
          openMs={reduce ? 250 : 1000}
          onOpen={() => {
            react("opened");
            setScene("meet");
          }}
        />
      )}

      {pm.repeatVisit && scene !== "gate" && scene !== "adopt" && scene !== "end" && (
        <button type="button" className="ap-skip" onClick={() => setScene("adopt")}>
          Skip to the papers
        </button>
      )}

      <div className="ap-stage">
        {scene !== "gate" && (
          <SceneTransition sceneKey={`${scene}-${run}`} variant={ENTER[scene]} origin="50% 50%">
            {render(scene)}
          </SceneTransition>
        )}
      </div>
    </div>
  );
}

export default function TeddyDayPremiumExperience(props: ExperienceProps) {
  const day = getDay(SLUG);
  return (
    <PremiumRoot data={props.data} mode={props.mode} slug={SLUG}>
      <DayRoot day={day} data={props.data} layout="full" dark className={PAPERS_FONT_VARS} style={PAPERS_FONT_STYLE}>
        <Papers {...props} />
      </DayRoot>
    </PremiumRoot>
  );
}
