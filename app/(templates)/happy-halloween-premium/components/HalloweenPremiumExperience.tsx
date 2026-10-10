"use client";

// ─── happy-halloween-premium — "Boo-tiful Night" (premium v3) ────────────────
//
// Cute-spooky and romantic, never scary (research §D9): a warm candy-coloured
// night with blushing ghosts and a GIF sticker reacting in every scene.
//   gate      the haunted mailbox: tap it, a ghost BURSTS out at you (scare #1, the
//             boo sample + duck + buzz), then giggles; the tap starts the haunted
//             piano (track mode; same synchronous contract as PremiumGate)
//   treats    1 · tap/shake the treat bag; catch the candies (sweet lines + cute dares)
//   carve     2 · carve a pumpkin: pick eyes + smile, hold to light it; initials glow;
//             then a pumpkin facing away: turn it round (scare #2, pumpkin-light-up)
//   booth     3 · ghosts are hiding their photos; shoo each one away; the last
//             photo hides behind a pumpkin (scare #3, pumpkin-ghost-boo on its BOO frame)
//   potion    4 · drag three ingredients into the cauldron, stir it, it puffs a heart
//   letter    5 · a bat brings the letter; tap it; the scroll unrolls (+ sealed P.S.)
//   radio     6 · tune the spirit radio to Boo FM; his voice comes through
//   question  7 · THE MONEY MOMENT: "Will you be my boo?" — the No ghosts away;
//             YES on the song's drop: the night turns pink, the moon becomes a
//             heart, a swarm of bats forms a heart around her photo, ghosts kiss
//   license   the Boo License keepsake (9:16 / 4:5), reply, replay, and
//             "Scare your boo" (3·2·1 → the BOO ghost, for the person next to her)
// Every scene is exactly one screen (no page scroll); the forward button sits in
// a fixed foot slot and the witch seal flies across on each press. Kids pages:
// no scares. One fixed CSS sky (stars, a sleepy moon, hills), one GlowParticles layer.
// Scenes after the first stop are code-split and prefetched one ahead.

import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { getDay } from "../../_valentine/days";
import { DayRoot, useReducedMotion } from "../../_valentine/kit";
import { GlowParticles, PremiumRoot, SkipChip, usePremium } from "../../_valentine/kit/premium";
import type { ExperienceProps } from "../../_valentine/types";
import { Ghost } from "./boo/art";
import { registerBooCues } from "./boo/cues";
import { BN_FONT_VARS, BODY } from "./boo/fonts";
import Gate from "./boo/Gate";
import { readNight } from "./boo/model";
import { BooProvider, SCARE_CSS } from "./boo/Scare";
import Treats from "./boo/Treats";
import { BOO_CSS, Backdrop, slotSrc, WitchFly } from "./boo/ui";

registerBooCues();

const day = getDay("happy-halloween-premium");

const load = {
  carve: () => import("./boo/Carve"),
  booth: () => import("./boo/Booth"),
  potion: () => import("./boo/Potion"),
  letter: () => import("./boo/Letter"),
  radio: () => import("./boo/Radio"),
  question: () => import("./boo/Question"),
  license: () => import("./boo/License"),
};
const Carve = dynamic(load.carve, { ssr: false });
const Booth = dynamic(load.booth, { ssr: false });
const Potion = dynamic(load.potion, { ssr: false });
const Letter = dynamic(load.letter, { ssr: false });
const Radio = dynamic(load.radio, { ssr: false });
const Question = dynamic(load.question, { ssr: false });
const License = dynamic(load.license, { ssr: false });

type Scene = "gate" | "treats" | "carve" | "booth" | "potion" | "letter" | "radio" | "question" | "license";
const ALL: Scene[] = ["gate", "treats", "carve", "booth", "potion", "letter", "radio", "question", "license"];
const SKIPPABLE = new Set<Scene>(["treats", "carve", "booth", "potion", "letter", "radio"]);

function Night({ data, mode, react }: ExperienceProps) {
  const p = usePremium();
  const reduce = useReducedMotion();
  const n = useMemo(() => readNight(data), [data]);
  const order = useMemo(() => ALL.filter((s) => s !== "booth" || n.booth.length > 0), [n.booth.length]);
  const stops: Scene[] = order.filter((s) => s !== "gate" && s !== "license");
  const [scene, setScene] = useState<Scene>(() => (p.opened ? order[1] : "gate"));
  const [round, setRound] = useState(0);
  const [peak, setPeak] = useState(false);
  const next = useCallback(() => {
    setScene((s) => order[Math.min(order.length - 1, order.indexOf(s) + 1)]);
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }, [order]);

  useEffect(() => {
    const nx = order[order.indexOf(scene) + 1] as keyof typeof load | undefined;
    if (nx && nx in load) void load[nx]();
  }, [scene, order]);

  const completed = useRef(false);
  useEffect(() => {
    if (scene === "license" && !completed.current) {
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

  const replay = () => {
    setRound((r) => r + 1);
    setPeak(false);
    setScene(order[1]);
    window.scrollTo({ top: 0 });
  };

  const step = stops.indexOf(scene) + 1;
  const total = stops.length;
  const gif = (id: string) => slotSrc(data, id);

  let body: ReactNode = null;
  switch (scene) {
    case "gate":
      body = <Gate n={n} hello={gif("hb1-hello")} justUnsealed={justUnsealed} onOpen={next} />;
      break;
    case "treats":
      body = <Treats n={n} reactor={gif("hb2-treats")} step={step} total={total} onNext={next} />;
      break;
    case "carve":
      body = <Carve n={n} pal={gif("hb3-pumpkin")} step={step} total={total} onNext={next} />;
      break;
    case "booth":
      body = <Booth n={n} cuddle={gif("hb4-booth")} step={step} total={total} onNext={next} />;
      break;
    case "potion":
      body = <Potion n={n} helper={gif("hb5-potion")} step={step} total={total} onNext={next} />;
      break;
    case "letter":
      body = <Letter n={n} letter={data.letter || "Happy Halloween."} step={step} total={total} onNext={next} />;
      break;
    case "radio":
      body = <Radio n={n} step={step} total={total} onNext={next} />;
      break;
    case "question":
      body = (
        <Question
          n={n}
          couple={gif("hb6-yes")}
          step={step}
          total={total}
          onPeak={() => setPeak(true)}
          onYes={(d) => react("answered", { noDodges: d })}
          onNext={next}
        />
      );
      break;
    case "license":
      body = <License n={n} endLine={data.endLine || ""} mode={mode} onReplay={replay} />;
      break;
  }

  const sparkle = peak || scene === "license";

  return (
    <BooProvider enabled={n.tone !== "kids"}>
    <div className={`bn-root${peak ? " is-peak" : ""}`}>
      <Backdrop peak={peak} />
      <GlowParticles
        preset={sparkle ? "hearts" : "sparkles"}
        colors={sparkle ? ["#FF9EC4", "#FFD27A", "#FFFFFF"] : ["#FFF3C9", "#C9B6FF", "#9BE7C4", "#FF9EC4"]}
        density={sparkle ? 0.4 : 0.22}
        z={1}
      />

      <div className="bn-stage">
        {/* research §C5: the old scene shrinks away, the new one springs up (no
            blur, and transform: none at rest so fixed layers stay viewport-fixed) */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${scene}-${round}`}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0, transition: reduce ? { duration: 0.15 } : { type: "spring", stiffness: 260, damping: 22 } }}
            exit={reduce ? { opacity: 0, transition: { duration: 0.15 } } : { opacity: 0, scale: 0.96, y: -12, transition: { duration: 0.25 } }}
          >
            {body}
          </motion.div>
        </AnimatePresence>
      </div>

      {SKIPPABLE.has(scene) && (
        <SkipChip
          key={`skip-${scene}-${round}`}
          onSkip={next}
          label="Skip ›"
          delay={p.repeatVisit ? 0 : 4000}
          style={{ right: "auto", left: "calc(max(12px, env(safe-area-inset-left, 0px)) + 52px)", top: "max(12px, env(safe-area-inset-top, 0px))", background: "rgba(42,31,61,.55)", color: "#FFF7EC", border: "2px solid rgba(255,247,236,.25)", font: `800 14px/1 ${BODY}`, minHeight: 44 }}
        />
      )}
      <WitchFly off={reduce} />
      <style>{BOO_CSS + SCARE_CSS}</style>
    </div>
    </BooProvider>
  );
}

export default function HalloweenPremiumExperience(props: ExperienceProps) {
  return (
    <PremiumRoot data={props.data} mode={props.mode} slug="happy-halloween-premium" chipStyle={{ background: "rgba(42,31,61,.55)", color: "#FFF7EC", borderColor: "rgba(255,247,236,.25)" }}>
      <DayRoot day={day} data={props.data} layout="column" className={BN_FONT_VARS} art={<Ghost size={150} mood="happy" hold="heart" />}>
        <Night {...props} />
      </DayRoot>
    </PremiumRoot>
  );
}
