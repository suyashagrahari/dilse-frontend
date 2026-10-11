"use client";

// ─── Rose Day ✦ Premium: "The Rose Garden" (v3) ──────────────────────────────────────────────────────────────
//
// A little garden that grows for her. research §D1 (.template-factory/premium-v3/research.md). Bright Strawberry
// Milk palette, Fredoka + Caveat, cute GIF stickers in every scene, a pop/chime/haptic on every interaction.
//
//  gate      a seed packet "Seeds of {name}" with a shy panda peeking; the tap tears it open and starts the song
//  water     1 drag the watering can over the pot: the sprout grows in three bouncy stages (sprout, leaves, bud)
//  colour    2 the bud blooms; tap colour chips, the rose recolours, a sticky note says what it means, from him
//  pluck     3 loves me, loves me not: seven petals, always LOVES ME
//  note      4 a rose at her door: pull the ribbon to untie the tag, his letter types itself (photo taped on)
//  voice     5 a singing rose plays his voice note (or says his caption in a bubble)
//  bouquet   6 drag her photo-flowers into a kraft cone, tie the ribbon, tap each for his caption + note
//  question  7 "Will you keep my rose forever?" Yes / a wilting runaway No → drop(): THE money moment, roses bloom
//              across the whole screen on the chorus and her bouquet rises into the middle, ribbon tying itself
//  diary     8 pressed in her diary: save as a wallpaper, the sealed P.S., "Send a rose back" reply, replay
//
// Scenes without content are skipped (no letter, no voice + no caption, no photos).

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DayRoot, burst, useReducedMotion } from "../../_valentine/kit";
import { PremiumGate, PremiumRoot, usePremium } from "../../_valentine/kit/premium";
import { getDay } from "../../_valentine/days";
import type { ExperienceProps } from "../../_valentine/types";
import { FallingPetals } from "../../happy-rose-day/components/rose/ui";
import { shadesFor } from "../../happy-rose-day/components/rose/art";
import { GARDEN_FONT_VARS } from "./garden/fonts";
import { GARDEN_CSS } from "./garden/styles";
import { registerGardenCues } from "./garden/cues";
import { readGarden } from "./garden/util";
import { SeedPacket, Slot } from "./garden/art";
import { WaterScene } from "./garden/WaterScene";
import { ColourScene } from "./garden/ColourScene";
import { PluckScene } from "./garden/PluckScene";
import { NoteScene } from "./garden/NoteScene";
import { VoiceScene } from "./garden/VoiceScene";
import { BouquetScene } from "./garden/BouquetScene";
import { QuestionScene } from "./garden/QuestionScene";
import { DiaryScene } from "./garden/DiaryScene";

const SLUG = "happy-rose-day-premium" as const;
type Scene = "gate" | "water" | "colour" | "pluck" | "note" | "voice" | "bouquet" | "question" | "diary";

function Garden({ data, mode, react }: ExperienceProps) {
  const day = getDay(SLUG);
  const p = usePremium();
  const reduce = useReducedMotion();
  const g = useMemo(() => readGarden(data), [data]);
  const [scene, setScene] = useState<Scene>(p.opened ? "water" : "gate");
  const [run, setRun] = useState(0);
  const hasLetter = !!data.letter?.trim();
  const hasVoice = !!p.premium.voiceNote || !!p.premium.voiceCaption.trim();
  const hasPhotos = g.photos.length > 0;

  useEffect(registerGardenCues, []);

  const order = useMemo(() => {
    const o: Scene[] = ["water", "colour", "pluck"];
    if (hasLetter) o.push("note");
    if (hasVoice) o.push("voice");
    if (hasPhotos) o.push("bouquet");
    o.push("question", "diary");
    return o;
  }, [hasLetter, hasVoice, hasPhotos]);

  const next = useCallback(
    (from: Scene) => {
      const i = order.indexOf(from);
      setScene(order[Math.min(order.length - 1, i + 1)]);
    },
    [order],
  );

  useEffect(() => {
    if (scene !== "gate" && typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "auto" });
  }, [scene]);

  // The song sits a little lower under the letter (where the platform lets us fade it).
  const musicRef = useRef(p.music);
  useEffect(() => {
    musicRef.current = p.music;
  });
  useEffect(() => {
    const m = musicRef.current;
    if (!m?.canFade || scene === "gate") return;
    m.fadeTo(scene === "note" ? 0.6 : 1, 1200);
  }, [scene]);

  const reactRef = useRef(react);
  useEffect(() => {
    reactRef.current = react;
  });
  useEffect(() => {
    if (scene === "diary") reactRef.current("completed");
  }, [scene]);

  const replay = () => {
    setRun((r) => r + 1);
    setScene("water");
  };

  const step = Math.max(0, order.indexOf(scene));
  const total = order.length;
  const common = { g, day, gifs: data.gifs, step, total };

  const render = (s: Scene) => {
    switch (s) {
      case "gate":
        return null;
      case "water":
        return <WaterScene {...common} onDone={() => next("water")} />;
      case "colour":
        return <ColourScene {...common} onDone={() => next("colour")} />;
      case "pluck":
        return <PluckScene {...common} onDone={() => next("pluck")} />;
      case "note":
        return <NoteScene {...common} letter={data.letter} hasMore={hasVoice} onDone={() => next("note")} />;
      case "voice":
        return <VoiceScene g={g} step={step} total={total} onDone={() => next("voice")} />;
      case "bouquet":
        return <BouquetScene g={g} step={step} total={total} onDone={() => next("bouquet")} />;
      case "question":
        return <QuestionScene {...common} onAnswered={(d) => react("answered", { noDodges: d })} onDone={() => next("question")} />;
      case "diary":
        return <DiaryScene g={g} data={data} day={day} mode={mode} step={step} total={total} onReplay={replay} />;
    }
  };

  return (
    <div
      className="rg-root"
      // The seed packet bursts open in the same tap that starts the song.
      onClickCapture={
        scene === "gate"
          ? (e) => {
              const t = e.target as HTMLElement;
              if (t.closest(".pm-gateCta, .pm-gateArt")) burst({ kind: "petals", origin: { x: 0.5, y: 0.45 }, count: 26, spread: 0.4 });
            }
          : undefined
      }
    >
      <style>{GARDEN_CSS}</style>
      <div className="rg-bg" aria-hidden>
        <i className="rg-blob rg-blob--a" />
        <i className="rg-blob rg-blob--b" />
        <i className="rg-blob rg-blob--c" />
      </div>
      {scene !== "gate" && <FallingPetals sh={shadesFor(g.color)} reduced={reduce} count={8} />}

      {scene === "gate" && (
        <PremiumGate
          art={<SeedPacket name={g.to} color={g.color} peek={<Slot day={day} gifs={data.gifs} id="rg1-peek" size={104} tilt={-10} eager />} />}
          kicker="A little garden, grown for"
          subtitle={<span className="rg-gateSub">{g.pet ? `${g.pet} · ` : ""}Rose Day · sound on 🎧</span>}
          sting="chime-cascade"
          openLabel="Tear it open 🌱"
          sealText={`Hand-grown for ${g.to}`}
          className="rg-gate"
          bg="transparent"
          ink="#5B2333"
          accent="#FF6F9C"
          openMs={reduce ? 250 : 1150}
          onOpen={() => {
            react("opened");
            setScene("water");
          }}
        />
      )}

      <AnimatePresence mode="wait" initial={false}>
        {scene !== "gate" && (
          <motion.div
            key={`${scene}-${run}`}
            className="rg-sceneWrap"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 22 } }}
            exit={reduce ? { opacity: 0, transition: { duration: 0.15 } } : { opacity: 0, y: -12, scale: 0.96, transition: { duration: 0.25 } }}
          >
            {render(scene)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function RoseDayPremiumExperience(props: ExperienceProps) {
  const day = getDay(SLUG);
  return (
    <PremiumRoot data={props.data} mode={props.mode} slug={SLUG}>
      <DayRoot
        day={day}
        data={props.data}
        layout="column"
        className={GARDEN_FONT_VARS}
        style={{ ["--font-vw-script" as string]: "var(--rg-hand)", ["--vw-font-script" as string]: "var(--rg-hand), 'Caveat', cursive" }}
      >
        <Garden {...props} />
      </DayRoot>
    </PremiumRoot>
  );
}
