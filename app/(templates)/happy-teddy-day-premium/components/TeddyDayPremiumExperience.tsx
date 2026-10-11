"use client";

// ─── happy-teddy-day-premium — "The Teddy House" (premium v3) ─────────────────
//
// Research §D4 ("Teddy Ghar"), improved: a bright honey-and-pink dollhouse her teddy moves into, one cosy room
// per scene, a GIF sticker reacting in every one, and the teddy she wakes, names and dresses stays exactly that
// way in every room after (and on the certificate).
//   gate      the doorstep: tap the wiggly delivery box, a sleepy teddy pops out (the tap starts the song,
//             same synchronous contract as PremiumGate)
//   heart     1 · rub a satin heart warm, kiss it, tuck it into his chest: he wakes, waves, says hi; she names him
//   dress     2 · drag/tap accessories onto him (each pops the sender's note)
//   squeeze   3 · squeeze him: every squeeze says the next bit of the letter
//   album     4 · their photos in his album; swipe through
//   snack     5 · catch falling treats in his bowl; each few unlock a house rule on the fridge
//   call      6 · his toy phone rings: the sender's voice note
//   bedtime   7 · pull the blanket up: the house goes to night, stars, "goodnight", a note under his pillow
//   question  8 · THE MONEY MOMENT, the next morning: "Will you keep him forever?" YES on the song's drop:
//             teddies of every size rain down into a heart around her photo while her teddy cheers
//   ending    the Adoption Certificate keepsake (9:16 / 4:5), a reply, replay
// One fixed CSS house backdrop (day / night / pink peak), one GlowParticles layer. Rooms after the first are
// code-split and prefetched one ahead.

import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { TeddyItem } from "../../_valentine/days/happy-teddy-day-premium";
import { getDay } from "../../_valentine/days";
import { DayRoot, useReducedMotion } from "../../_valentine/kit";
import { GlowParticles, PremiumRoot, SkipChip, usePremium } from "../../_valentine/kit/premium";
import type { ExperienceProps } from "../../_valentine/types";
import { Teddy } from "./house/art";
import { registerHouseCues } from "./house/cues";
import { BODY, TH_FONT_VARS } from "./house/fonts";
import Gate from "./house/Gate";
import Heart from "./house/Heart";
import { readHouse } from "./house/model";
import { Backdrop, HOUSE_CSS, slotSrc } from "./house/ui";

registerHouseCues();

const day = getDay("happy-teddy-day-premium");

const load = {
  dress: () => import("./house/Wardrobe"),
  squeeze: () => import("./house/Squeeze"),
  album: () => import("./house/Album"),
  snack: () => import("./house/Snack"),
  call: () => import("./house/Call"),
  bedtime: () => import("./house/Bedtime"),
  question: () => import("./house/Question"),
  ending: () => import("./house/Certificate"),
};
const Wardrobe = dynamic(load.dress, { ssr: false });
const Squeeze = dynamic(load.squeeze, { ssr: false });
const Album = dynamic(load.album, { ssr: false });
const Snack = dynamic(load.snack, { ssr: false });
const Call = dynamic(load.call, { ssr: false });
const Bedtime = dynamic(load.bedtime, { ssr: false });
const Question = dynamic(load.question, { ssr: false });
const Certificate = dynamic(load.ending, { ssr: false });

type Scene = "gate" | "heart" | "dress" | "squeeze" | "album" | "snack" | "call" | "bedtime" | "question" | "ending";
const ALL: Scene[] = ["gate", "heart", "dress", "squeeze", "album", "snack", "call", "bedtime", "question", "ending"];
const SKIPPABLE = new Set<Scene>(["dress", "squeeze", "album", "snack", "call", "bedtime"]);

function House({ data, mode, react }: ExperienceProps) {
  const p = usePremium();
  const reduce = useReducedMotion();
  const h = useMemo(() => readHouse(data), [data]);
  const order = useMemo(() => ALL.filter((s) => s !== "album" || h.album.length > 0), [h.album.length]);
  const stops: Scene[] = order.filter((s) => s !== "gate" && s !== "ending");
  const [scene, setScene] = useState<Scene>(() => (p.opened ? order[1] : "gate"));
  const [round, setRound] = useState(0);
  const [peak, setPeak] = useState(false);
  const [night, setNight] = useState(false);
  // the name she picks when he wakes up (until then, the sender's)
  const [picked, setName] = useState<string | null>(null);
  const name = picked ?? h.teddyName;
  const [worn, setWorn] = useState<TeddyItem[]>([]);

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

  const replay = () => {
    setRound((r) => r + 1);
    setPeak(false);
    setNight(false);
    setScene(order[1]);
    window.scrollTo({ top: 0 });
  };

  const step = stops.indexOf(scene) + 1;
  const total = stops.length;
  const gif = (id: string) => slotSrc(data, id);
  const common = { h, step, total, name, worn, onNext: next };

  let body: ReactNode = null;
  switch (scene) {
    case "gate":
      body = <Gate h={h} hello={gif("td1-hello")} justUnsealed={justUnsealed} onOpen={next} />;
      break;
    case "heart":
      body = <Heart h={h} cheer={gif("td2-heart")} step={step} total={total} name={name} onName={setName} onNext={next} />;
      break;
    case "dress":
      body = <Wardrobe {...common} poser={gif("td3-dress")} setWorn={setWorn} />;
      break;
    case "squeeze":
      body = <Squeeze {...common} cuddle={gif("td4-squeeze")} />;
      break;
    case "album":
      body = <Album {...common} />;
      break;
    case "snack":
      body = <Snack {...common} />;
      break;
    case "call":
      body = <Call {...common} />;
      break;
    case "bedtime":
      body = <Bedtime {...common} snuggle={gif("td5-sleep")} onNight={setNight} />;
      break;
    case "question":
      body = <Question {...common} celebrate={gif("td6-yes")} onPeak={() => setPeak(true)} onYes={(d) => react("answered", { noDodges: d })} />;
      break;
    case "ending":
      body = <Certificate h={h} name={name} worn={worn} endLine={data.endLine || ""} mode={mode} onReplay={replay} />;
      break;
  }

  const hearts = peak || scene === "ending";
  const backdrop = peak ? "peak" : night && scene === "bedtime" ? "night" : "day";

  return (
    <div className={`th-root${peak ? " is-peak" : ""}`}>
      {/* first, so each room's own CSS (later in the document) wins at equal specificity */}
      <style>{HOUSE_CSS}</style>
      <Backdrop mode={backdrop} />
      <GlowParticles
        preset={hearts ? "hearts" : "sparkles"}
        colors={hearts ? ["#FF8FAB", "#FFD9E4", "#FFE27A"] : night && scene === "bedtime" ? ["#FFF3C9", "#FFD9E4", "#FFFFFF"] : ["#FFD9E4", "#FFE27A", "#F2B36B", "#FFFFFF"]}
        density={hearts ? 0.4 : 0.2}
        z={1}
      />

      <div className="th-stage">
        {/* research §C5: the old room shrinks away, the new one springs up (no blur, and transform: none at rest
            so fixed layers stay viewport-fixed) */}
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
          style={{ right: "auto", left: "calc(max(12px, env(safe-area-inset-left, 0px)) + 52px)", top: "max(12px, env(safe-area-inset-top, 0px))", background: "rgba(255,255,255,.85)", color: "#8A6248", border: "2px solid #F5DCC2", font: `800 14px/1 ${BODY}`, minHeight: 44 }}
        />
      )}
    </div>
  );
}

export default function TeddyDayPremiumExperience(props: ExperienceProps) {
  return (
    <PremiumRoot data={props.data} mode={props.mode} slug="happy-teddy-day-premium" chipStyle={{ background: "rgba(255,255,255,.85)", color: "#8A6248", borderColor: "#F5DCC2" }}>
      <DayRoot day={day} data={props.data} layout="column" className={TH_FONT_VARS} art={<Teddy size={170} mood="happy" pose="wave" worn={["bow"]} heart />}>
        <House {...props} />
      </DayRoot>
    </PremiumRoot>
  );
}
