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
//
// v6 (./boo/haunt.tsx): a full-bleed haunted night on every screen (a candy-lit
// haunted town, a big manor on desktop, a graveyard, fog, bats, a corner web);
// a spider drops from the top edge on four scenes and one crawls the ground on
// others (tap either); a small pumpkin trail top-left jumps back; a mist
// curtain covers each scene change. No auto-advance and no skip: one Next pill
// per scene, shown once its moment is done. The music is the engine's small
// round icon (music.compact, bottom-left); the viewer shows the stacked brand mark.
//
// v7: the gate's manor is much bigger (it dominates the scene on phone and
// desktop); the trail sits in the very top-left corner; both corner webs are
// flush in the true screen corners on every scene; the owner's running ghost
// dashes across at random moments (a trailing shadow, a flicker, the lights dim
// for a beat; tap it to spook it); the witch cackles on every fly-by, over the
// music.

import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { startTransition, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { getDay } from "../../_valentine/days";
import { DayRoot, useReducedMotion } from "../../_valentine/kit";
import { GlowParticles, PremiumRoot, usePremium } from "../../_valentine/kit/premium";
import type { ExperienceProps } from "../../_valentine/types";
import { Ghost } from "./boo/art";
import { registerBooCues } from "./boo/cues";
import { BN_FONT_VARS } from "./boo/fonts";
import Gate from "./boo/Gate";
import { readNight } from "./boo/model";
import { BooProvider, SCARE_CSS } from "./boo/Scare";
import Treats from "./boo/Treats";
import { BOO_CSS, Backdrop, slotSrc, WitchFly } from "./boo/ui";
import { Crawler, DropSpider, Haunt, HAUNT_CSS, RunningGhost, Trail, Veil, VEIL_SWAP_MS, type VeilControl } from "./boo/haunt";

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
const LABEL: Record<Scene, string> = {
  gate: "the mailbox",
  treats: "the treat bag",
  carve: "the pumpkin",
  booth: "the photo booth",
  potion: "the love potion",
  letter: "the letter",
  radio: "the spirit radio",
  question: "the question",
  license: "your Boo License",
};
/** Where the spider drops from the top edge (a fresh GIF each time, so only a few), and from which side. */
const DROPS: Partial<Record<Scene, "l" | "r">> = { gate: "r", carve: "l", potion: "r", radio: "l" };
/** Where a spider crosses the ground (once per visit to the scene). */
const CRAWLS = new Set<Scene>(["treats", "booth", "letter", "license"]);
const HEART_COLORS = ["#FF9EC4", "#FFD27A", "#FFFFFF"];
const SPARK_COLORS = ["#FFF3C9", "#C9B6FF", "#9BE7C4", "#FF9EC4"];

function Night({ data, mode, react }: ExperienceProps) {
  const p = usePremium();
  const reduce = useReducedMotion();
  const n = useMemo(() => readNight(data), [data]);
  const order = useMemo(() => ALL.filter((s) => s !== "booth" || n.booth.length > 0), [n.booth.length]);
  const stops: Scene[] = order.filter((s) => s !== "gate" && s !== "license");
  const [scene, setScene] = useState<Scene>(() => (p.opened ? order[1] : "gate"));
  const [round, setRound] = useState(0);
  const [peak, setPeak] = useState(false);
  const sceneRef = useRef(scene);
  useEffect(() => {
    sceneRef.current = scene;
  }, [scene]);

  // Every scene change rises a mist curtain over the screen; the next scene is
  // swapped in under it (reduced motion: a plain swap). v7: the veil is mounted
  // once and replayed (no render on the tap), and the swap is a transition, so
  // React builds the next scene in slices instead of one long task.
  const veil = useRef<VeilControl | null>(null);
  const swapT = useRef(0);
  useEffect(() => () => window.clearTimeout(swapT.current), []);
  const go = useCallback(
    (to: Scene, bump = false) => {
      const swap = () => {
        startTransition(() => {
          setScene(to);
          if (bump) setRound((r) => r + 1);
        });
        if (typeof window !== "undefined") window.scrollTo({ top: 0 });
      };
      if (reduce) return swap();
      veil.current?.play();
      window.clearTimeout(swapT.current);
      swapT.current = window.setTimeout(swap, VEIL_SWAP_MS);
    },
    [reduce],
  );
  const next = useCallback(() => {
    go(order[Math.min(order.length - 1, order.indexOf(sceneRef.current) + 1)]);
  }, [order, go]);

  // The trail: one stop per scene after the gate; an earlier one goes back
  // there (a new round, so its GIFs restart and its scare can be earned again).
  const trail = order.slice(1);
  const at = trail.indexOf(scene);
  const jumpTo = (k: number) => {
    if (k >= at || k < 0) return;
    // back before the question: the night is purple again (the YES is asked anew there)
    if (trail.indexOf("question") > k) window.setTimeout(() => setPeak(false), VEIL_SWAP_MS);
    go(trail[k], true);
  };
  // Spiders: a drop from the top edge on a few scenes, a crawler on others (never for kids, never under reduced motion).
  const spiders = n.tone !== "kids" && !reduce;
  const visit = round * 10 + order.indexOf(scene) + 1;
  const dropSide = DROPS[scene];

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
    setPeak(false);
    go(order[1], true);
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
      <Haunt reduce={reduce} peak={peak} gate={scene === "gate"} />
      <GlowParticles
        preset={sparkle ? "hearts" : "sparkles"}
        colors={sparkle ? HEART_COLORS : SPARK_COLORS}
        density={sparkle ? 0.4 : 0.22}
        z={1}
      />

      <div className="bn-stage">
        {/* research §C5: the old scene shrinks away, the new one springs up (no
            blur, and transform: none at rest so fixed layers stay viewport-fixed) */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${scene}-${round}`}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0, transition: reduce ? { duration: 0.15 } : { duration: 0.45, ease: [0.2, 0.8, 0.2, 1] } }}
            exit={{ opacity: 0, transition: { duration: reduce ? 0.15 : 0.12 } }}
          >
            {body}
          </motion.div>
        </AnimatePresence>
      </div>

      <Trail labels={trail.map((s) => LABEL[s])} at={at} onJump={jumpTo} />
      {spiders && dropSide && <DropSpider run={visit} side={dropSide} />}
      {spiders && CRAWLS.has(scene) && <Crawler key={visit} run={visit} />}
      {!reduce && scene !== "gate" && <RunningGhost horror={n.tone !== "kids"} />}
      {!reduce && <Veil ctlRef={veil} />}
      <WitchFly off={reduce} laugh={n.tone !== "kids"} />
      <style>{BOO_CSS + SCARE_CSS + HAUNT_CSS}</style>
    </div>
    </BooProvider>
  );
}

export default function HalloweenPremiumExperience(props: ExperienceProps) {
  return (
    <PremiumRoot data={props.data} mode={props.mode} slug="happy-halloween-premium" chipStyle={{ display: "none" }}>
      <DayRoot day={day} data={props.data} layout="full" className={BN_FONT_VARS} art={<Ghost size={150} mood="happy" hold="heart" />}>
        <Night {...props} />
      </DayRoot>
    </PremiumRoot>
  );
}
