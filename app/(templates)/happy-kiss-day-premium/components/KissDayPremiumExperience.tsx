"use client";

// ─── happy-kiss-day-premium — "Photo Booth" ───────────────────────────────
//
// research.md §D.7. A vintage photo booth behind a lacquer-red curtain.
//   gate      the curtain + a chrome coin plate: "Insert one kiss" (song starts)
//   booth     the money moment: press the arcade button, 3·2·1, FOUR FLASHES,
//             then the strip drops out of the slot on the song's drop and
//             develops frame by frame (useSongDrop)
//   frames    behind each frame: tap a print to turn it over, swipe it away
//   outtakes  photos 5–12 on a swipeable contact sheet (only if they exist)
//   voice     the booth also recorded: the voice note over their last frame
//             (no voice: the caption, printed big)
//   receipt   the letter on a booth receipt; drag the scissors to tear it off
//   kiss      kiss the screen (wide touch = lips, or press and hold)
//   ending    the strip with both kisses: save it, write back, WhatsApp
// One WebGL backdrop (velvet → bokeh), one particle layer, grain + vignette.

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { getDay } from "../../_valentine/days";
import { DayRoot, Sticker, useReducedMotion } from "../../_valentine/kit";
import {
  FilmGrain,
  GlowParticles,
  LightLeak,
  PremiumGate,
  PremiumRoot,
  SceneTransition,
  ShaderBackdrop,
  Vignette,
  usePremium,
  type TransitionVariant,
} from "../../_valentine/kit/premium";
import type { ExperienceProps, GifSlot } from "../../_valentine/types";
import BoothScene from "./booth/BoothScene";
import { registerBoothCues } from "./booth/cues";
import EndingScene from "./booth/EndingScene";
import FramesScene from "./booth/FramesScene";
import { PB_FONT_VARS } from "./booth/fonts";
import { CoinPlate, GATE_BG, GATE_CSS } from "./booth/Gate";
import KissScene from "./booth/KissScene";
import { readBooth } from "./booth/model";
import OuttakesScene from "./booth/OuttakesScene";
import ReceiptScene from "./booth/ReceiptScene";
import { STRIP_CSS } from "./booth/Strip";
import { UI_CSS } from "./booth/ui";
import VoiceScene from "./booth/VoiceScene";

registerBoothCues();

const day = getDay("happy-kiss-day-premium");
type SceneId = "gate" | "booth" | "frames" | "outtakes" | "voice" | "receipt" | "kiss" | "ending";
const CUT: Record<SceneId, TransitionVariant> = { gate: "flash", booth: "flash", frames: "iris", outtakes: "fold", voice: "iris", receipt: "flash", kiss: "iris", ending: "flash" };
const SKIPPABLE: SceneId[] = ["frames", "outtakes", "voice", "receipt"];

function PhotoBooth({ data, mode, react }: ExperienceProps) {
  const p = usePremium();
  const reduce = useReducedMotion();
  const b = useMemo(() => readBooth(data), [data]);
  const order = useMemo(() => {
    const o: SceneId[] = ["booth", "frames"];
    if (b.outtakes.length) o.push("outtakes");
    if (p.premium.voiceNote || p.premium.voiceCaption) o.push("voice");
    o.push("receipt", "kiss", "ending");
    return o;
  }, [b.outtakes.length, p.premium.voiceNote, p.premium.voiceCaption]);
  const [scene, setScene] = useState<SceneId>(p.opened ? "booth" : "gate");
  const [round, setRound] = useState(0);
  const [kissed, setKissed] = useState(0);
  const [flashN, setFlashN] = useState(0);
  const next = useCallback(() => setScene((s) => order[Math.min(order.length - 1, order.indexOf(s as SceneId) + 1)] ?? "ending"), [order]);
  const flash = useCallback(() => setFlashN((n) => n + 1), []);

  const completed = useRef(false);
  useEffect(() => {
    if (scene === "ending" && !completed.current) {
      completed.current = true;
      react("completed");
    }
  }, [scene, react]);

  // Only the sender's own GIF shows: the template's emoji stand-in would be
  // decoration, and this page keeps its frames for their photos.
  const sticker = (id: string, size = 64): ReactNode => {
    const s: GifSlot | undefined = day.gifSlots.find((g) => g.id === id);
    const v = (data.gifs?.[id] ?? "").trim();
    return s && /^https:\/\//i.test(v) ? <Sticker slug={day.slug} slot={s} value={v} size={size} /> : null;
  };
  const replay = () => {
    setRound((r) => r + 1);
    setKissed(0);
    setScene("booth");
  };

  const idx = order.indexOf(scene);
  const warm = scene === "kiss" || scene === "ending";

  let body: ReactNode = null;
  switch (scene) {
    case "booth":
      body = <BoothScene b={b} flash={flash} sticker={sticker("pb1-booth", 58)} onNext={next} />;
      break;
    case "frames":
      body = <FramesScene b={b} onNext={next} />;
      break;
    case "outtakes":
      body = <OuttakesScene photos={b.outtakes} onNext={next} />;
      break;
    case "voice":
      body = <VoiceScene b={b} onNext={next} />;
      break;
    case "receipt":
      body = <ReceiptScene b={b} letter={data.letter || "Happy Kiss Day."} onNext={next} />;
      break;
    case "kiss":
      body = (
        <KissScene
          b={b}
          sticker={sticker("pb2-kiss", 76)}
          onKissed={(n) => {
            setKissed(n);
            react("answered", { count: n });
            next();
          }}
        />
      );
      break;
    case "ending":
      body = <EndingScene b={b} endLine={data.endLine} kissed={kissed > 0} mode={mode} replyText={day.copy.replyText} onReplay={replay} />;
      break;
  }

  return (
    <>
      {/* First, so each scene's own <style> (rendered later) wins at equal specificity. */}
      <style>{ROOT_CSS}</style>
      <ShaderBackdrop
        preset={warm ? "bokeh" : "velvet"}
        colors={warm ? ["#0b0607", b.S.lo, "#ffcfae"] : ["#0a0405", "#5c0812", "#ff9aa6"]}
        intensity={warm ? 0.9 : 0.75}
        speed={0.55}
        parallax
      />
      {(scene === "ending" || scene === "booth") && (
        <GlowParticles preset={scene === "ending" ? "hearts" : "sparkles"} density={scene === "ending" ? 0.22 : 0.16} colors={scene === "ending" ? [b.S.hi, "#F4EDE1", b.S.c] : undefined} speed={0.6} />
      )}
      <LightLeak color={b.S.hi} color2="#ffd2a6" corner="top-left" opacity={0.32} />
      <Vignette strength={0.62} />
      <FilmGrain opacity={0.075} />

      {scene === "gate" && (
        <PremiumGate
          art={<CoinPlate b={b} />}
          kicker="A photo booth, for"
          subtitle={b.sign || "Sit close. Closer. Perfect."}
          sting="kpb-insert"
          openLabel="Insert one kiss"
          className="pb-gate"
          bg={GATE_BG}
          ink="#F4EDE1"
          accent={b.S.hi}
          onOpen={() => setScene("booth")}
        />
      )}

      {scene !== "gate" && (
        <div className="pb-chip" role="group" aria-label="Chapter">
          <span className="pb-chipNo" aria-label={`Chapter ${idx + 1} of ${order.length}`}>
            {String(idx + 1).padStart(2, "0")}
            <i>/{String(order.length).padStart(2, "0")}</i>
          </span>
          {SKIPPABLE.includes(scene) && (
            <button type="button" className="pb-chipSkip" onClick={next}>
              Skip ›
            </button>
          )}
        </div>
      )}

      {flashN > 0 && <div key={flashN} className={`pb-flash${reduce ? " is-reduced" : ""}`} aria-hidden />}

      {scene !== "gate" && (
        <div className="pb-stage">
          <SceneTransition sceneKey={`${scene}-${round}`} variant={CUT[scene]} flashColor="#fff6ee">
            {body}
          </SceneTransition>
        </div>
      )}
    </>
  );
}

export default function KissDayPremiumExperience(props: ExperienceProps) {
  const b = readBooth(props.data);
  return (
    <PremiumRoot data={props.data} mode={props.mode} slug="happy-kiss-day-premium">
      <DayRoot
        day={day}
        data={props.data}
        layout="full"
        className={`${PB_FONT_VARS} pb-root`}
        style={{ ["--pb-shade" as string]: b.S.c, ["--pb-shade-hi" as string]: b.S.hi, height: "100svh", overflow: "hidden" }}
      >
        <PhotoBooth {...props} />
      </DayRoot>
    </PremiumRoot>
  );
}

const ROOT_CSS = `
${UI_CSS}
${STRIP_CSS}
${GATE_CSS}
.pb-chip { position: fixed; z-index: 97; left: calc(max(12px, env(safe-area-inset-left, 0px)) + 54px); top: max(12px, env(safe-area-inset-top, 0px)); display: flex; align-items: center; gap: 2px;
  height: 44px; padding: 0 6px 0 14px; border-radius: 99px; background: rgba(14,9,10,.5); border: 1px solid rgba(244,237,225,.14); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  font: 700 11px/1 var(--pb-mono); letter-spacing: .16em; color: var(--pb-cream); }
.pb-chipNo { font-variant-numeric: tabular-nums; padding-right: 8px; }
.pb-chipNo i { font-style: normal; opacity: .45; }
.pb-chipSkip { all: unset; cursor: pointer; height: 32px; display: inline-flex; align-items: center; padding: 0 12px; border-radius: 99px; background: rgba(244,237,225,.1); letter-spacing: .2em; text-transform: uppercase; font-size: 10px; }
.pb-chipSkip:focus-visible { outline: 2px solid var(--pb-shade-hi); outline-offset: 2px; }
.pb-flash { position: fixed; inset: 0; z-index: 88; pointer-events: none; background: #fff; animation: pb-flash .55s cubic-bezier(.1,.7,.3,1) forwards; }
.pb-flash.is-reduced { animation: pb-flashR .4s ease forwards; }
@keyframes pb-flash { 0% { opacity: 0; } 8% { opacity: 1; } 100% { opacity: 0; } }
@keyframes pb-flashR { 0% { opacity: .25; } 100% { opacity: 0; } }
`;
