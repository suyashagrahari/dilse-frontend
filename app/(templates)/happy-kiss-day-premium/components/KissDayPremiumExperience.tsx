"use client";

// ─── happy-kiss-day-premium — "Mwah Booth" ────────────────────────────────
//
// research.md v3 §D7. A bright, strawberry-milk kissing booth, full of couple
// stickers, lip prints and pops:
//   gate      twist up a lipstick (or just tap) → the song starts
//   kiss      kiss his photo three times; the heart meter fills
//   menu      pick a kiss: forehead / cheek / nose / hand cards flip to a
//             sticker and his reason
//   booth     kiss-cam: 3·2·1, four flashes, the strip prints; she drags lip
//             stickers onto it
//   catch     15 s: catch the flying kisses → "kisses I owe you"
//   letter    an envelope sealed with a kiss; the letter types itself; P.S.
//   voice     "come closer…": the whispered voice note (or caption)
//   question  "Kiss me?" Yes / Later (Later runs away). YES = the money moment
//             on the chorus (drop()): kiss prints storm the screen and gather
//             into a heart around her decorated strip
//   ending    save the strip as a story card, kiss his photo back, reply
// Light theme, one ambient float of hearts, transform/opacity animation only.

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { templateMedia } from "@/lib/templateMedia";
import { getDay } from "../../_valentine/days";
import { DayRoot, FloatingParticles } from "../../_valentine/kit";
import { PremiumGate, PremiumRoot, usePremium } from "../../_valentine/kit/premium";
import type { ExperienceProps } from "../../_valentine/types";
import BoothScene from "./mwah/BoothScene";
import CatchScene from "./mwah/CatchScene";
import { registerMwahCues } from "./mwah/cues";
import EndingScene from "./mwah/EndingScene";
import { KM_FONT_VARS } from "./mwah/fonts";
import { GATE_BG, GATE_CSS, Lipstick } from "./mwah/Gate";
import KissPhotoScene from "./mwah/KissPhotoScene";
import LetterScene from "./mwah/LetterScene";
import { LipPrint } from "./mwah/LipPrint";
import MenuScene from "./mwah/MenuScene";
import { readMwah, type Deco } from "./mwah/model";
import QuestionScene from "./mwah/QuestionScene";
import { STRIP_CSS } from "./mwah/Strip";
import { UI_CSS } from "./mwah/ui";
import VoiceScene from "./mwah/VoiceScene";

registerMwahCues();

const day = getDay("happy-kiss-day-premium");
type SceneId = "kiss" | "menu" | "booth" | "catch" | "letter" | "voice" | "question" | "ending";
const SKIPPABLE: SceneId[] = ["menu", "booth", "catch", "letter", "voice"];
const AMBIENT = ["💗", "💋", "✨", "💕"] as const;

function MwahBooth({ data, mode, react }: ExperienceProps) {
  const p = usePremium();
  const m = useMemo(() => readMwah(data), [data]);
  const hasVoice = !!(p.premium.voiceNote || p.premium.voiceCaption);
  const order = useMemo<SceneId[]>(() => ["kiss", "menu", "booth", "catch", "letter", ...(hasVoice ? (["voice"] as const) : []), "question", "ending"], [hasVoice]);
  const [gate, setGate] = useState(!p.opened);
  const [twisted, setTwisted] = useState(false);
  const [scene, setScene] = useState<SceneId>("kiss");
  const [round, setRound] = useState(0);
  const [decos, setDecos] = useState<Deco[]>([]);
  const next = useCallback(() => setScene((s) => order[Math.min(order.length - 1, order.indexOf(s) + 1)] ?? "ending"), [order]);

  // Each scene starts at its top.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [scene]);

  const completed = useRef(false);
  useEffect(() => {
    if (scene === "ending" && !completed.current) {
      completed.current = true;
      react("completed");
    }
  }, [scene, react]);

  /** A GIF slot: the sender's link, nothing ("none"), or our default from the shared library. */
  const gif = (id: string) => {
    const v = (data.gifs?.[id] ?? "").trim();
    if (v === "none") return "";
    if (/^https:\/\//i.test(v)) return v;
    const s = day.gifSlots.find((g) => g.id === id);
    return s ? new URL(templateMedia(day.slug, s.file)).href : "";
  };
  const replay = () => {
    setRound((r) => r + 1);
    setDecos([]);
    setScene("kiss");
  };

  const idx = order.indexOf(scene);
  let body = null;
  switch (scene) {
    case "kiss":
      body = <KissPhotoScene m={m} gif={gif("km2-mwah")} onNext={next} />;
      break;
    case "menu":
      body = <MenuScene m={m} onNext={next} />;
      break;
    case "booth":
      body = <BoothScene m={m} gif={gif("km3-booth")} decos={decos} setDecos={setDecos} onNext={next} />;
      break;
    case "catch":
      body = <CatchScene m={m} gif={gif("km4-catch")} onNext={next} />;
      break;
    case "letter":
      body = <LetterScene m={m} letter={data.letter || "Happy Kiss Day 💋"} gif={gif("km5-letter")} onNext={next} />;
      break;
    case "voice":
      body = <VoiceScene m={m} onNext={next} />;
      break;
    case "question":
      body = <QuestionScene m={m} decos={decos} gif={gif("km6-yes")} onAnswer={(n) => react("answered", { noDodges: n })} onNext={next} />;
      break;
    case "ending":
      body = <EndingScene m={m} decos={decos} endLine={(data.endLine ?? "").trim()} mode={mode} replyText={day.copy.replyText} onReplay={replay} />;
      break;
  }

  return (
    <>
      <style>{ROOT_CSS}</style>
      <div className="km-ambient" aria-hidden>
        <span className="km-blob is-a" />
        <span className="km-blob is-b" />
        <FloatingParticles emojis={AMBIENT} count={9} opacity={0.42} />
      </div>

      {gate && (
        <PremiumGate
          art={<Lipstick m={m} gif={gif("km1-gate")} onReady={() => setTwisted(true)} />}
          kicker="A kissing booth, just for"
          subtitle={m.sign || "Twist it up. A kiss is waiting."}
          sting="kmw-open"
          openLabel={twisted ? "Ready? Open it 💋" : "Open the booth 💋"}
          sealText={`Made with love by ${m.sender}`}
          className={`km-gate${twisted ? " is-ready" : ""}`}
          bg={GATE_BG}
          ink="#5B2333"
          accent="#FF4F86"
          openMs={700}
          onOpen={() => setGate(false)}
        />
      )}

      {!gate && (
        <div className="km-chip" role="group" aria-label="Progress">
          <span className="km-chipNo" aria-label={`Scene ${idx + 1} of ${order.length}`}>
            <span aria-hidden>💗</span> {idx + 1}/{order.length}
          </span>
          {SKIPPABLE.includes(scene) && (
            <button type="button" className="km-chipSkip" onClick={next}>
              Skip
            </button>
          )}
        </div>
      )}

      {!gate && (
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${scene}-${round}`}
            className="km-stage"
            // Opacity only: a transformed wrapper would trap every position:fixed
            // layer inside it (flash, drag ghost, the kiss storm) on desktop.
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 0.3 }}
          >
            {body}
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );
}

function WingArt() {
  return (
    <span style={{ display: "grid", placeItems: "center", transform: "rotate(-10deg)" }}>
      <LipPrint color="#FF4F86" size={150} seed={8} />
    </span>
  );
}

export default function KissDayPremiumExperience(props: ExperienceProps) {
  return (
    <PremiumRoot data={props.data} mode={props.mode} slug="happy-kiss-day-premium">
      <DayRoot day={day} data={props.data} className={`${KM_FONT_VARS} km-root`} art={<WingArt />} line={props.data.endLine || "Sealed with a kiss. Opened with a smile."}>
        <MwahBooth {...props} />
      </DayRoot>
    </PremiumRoot>
  );
}

const ROOT_CSS = `
${UI_CSS}
${STRIP_CSS}
${GATE_CSS}
.km-stage { position: relative; z-index: 1; }
.km-ambient { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
.km-blob { position: absolute; border-radius: 50%; opacity: .55; }
.km-blob.is-a { width: 60vmax; height: 60vmax; left: -22vmax; top: -18vmax; background: radial-gradient(circle, #FFD1DF 0%, transparent 65%); }
.km-blob.is-b { width: 55vmax; height: 55vmax; right: -20vmax; bottom: -20vmax; background: radial-gradient(circle, rgba(255,226,122,.55) 0%, transparent 65%); }
.km-chip { position: fixed; z-index: 97; left: calc(max(12px, env(safe-area-inset-left, 0px)) + 54px); top: max(12px, env(safe-area-inset-top, 0px)); display: flex; align-items: center; gap: 2px;
  height: 44px; padding: 0 4px 0 12px; border-radius: 99px; background: rgba(255,255,255,.82); box-shadow: 0 6px 18px -10px rgba(214,63,114,.55); box-sizing: border-box;
  font: 600 14px/1 var(--km-ui); color: var(--km-deep); }
.km-chipNo { font-variant-numeric: tabular-nums; padding-right: 8px; white-space: nowrap; }
.km-chipSkip { all: unset; cursor: pointer; height: 34px; display: inline-flex; align-items: center; padding: 0 12px; border-radius: 99px; background: #FFE3EC; font: 600 13px/1 var(--km-ui); color: var(--km-deep); }
.km-chipSkip:focus-visible { outline: 2px solid var(--km-primary); outline-offset: 2px; }
`;
