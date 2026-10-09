"use client";

// ─── Hug Day ✦ Premium: "The Twenty-Second Hug" ──────────────────────────────────────────────────────────────────
//
// research.md §D.6. The page starts in black and white and ends in colour; the hug is what turns it.
//   gate    a thumbprint drawn in warm light, a heartbeat ring breathing out of it. The tap starts the song.
//   come    I   "Come" · "here." · "{name}." One word per screen, each landing with a felt thump.
//   arms    II  Arms open: two black-and-white prints at the edges, the kilometres between them printed huge.
//               Drag them together; at zero they squeeze into each other.
//   hold    III THE MONEY MOMENT. Thumb anywhere on their photo and hold for twenty seconds: colour blooms out from
//               under the thumb, a heartbeat slows to the sender's, their lines fade in, the song swells; letting go
//               pauses it ("Don't let go yet."). drop() fires so the chorus lands with the last of the colour.
//   feels   IV  What your hugs feel like: four lines, each over a print (now in colour). Swipe each away.
//   letter  V   A folded note, still warm. Tap to unfold; the paragraphs ink in.
//   voice   VI  In my voice: the voice note over a graded photo (their words, large, without a recording).
//   end         "Hug owed: 1. Redeem in person." A coupon to tear off and send back; keepsake image, P.S., reply.
// One ShaderBackdrop (cocoa candlelight → sand bokeh after the hug), one particle layer, grain + vignette always.

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { getDay } from "../../_valentine/days";
import { DayRoot, Sticker } from "../../_valentine/kit";
import {
  FilmGrain,
  GlowParticles,
  LightLeak,
  PremiumGate,
  PremiumRoot,
  SceneTransition,
  ShaderBackdrop,
  Vignette,
  requestTiltPermission,
  usePremium,
  type TransitionVariant,
} from "../../_valentine/kit/premium";
import type { ExperienceProps, GifSlot } from "../../_valentine/types";
import ArmsScene from "./hold/ArmsScene";
import ComeScene from "./hold/ComeScene";
import { registerHugCues } from "./hold/cues";
import EndingScene from "./hold/EndingScene";
import FeelsScene from "./hold/FeelsScene";
import { HUG_FONT_VARS } from "./hold/fonts";
import { GATE_BG, GATE_CSS, Thumbprint } from "./hold/Gate";
import HoldScene from "./hold/HoldScene";
import LetterScene from "./hold/LetterScene";
import { readHug } from "./hold/model";
import { UI_CSS } from "./hold/ui";
import VoiceScene from "./hold/VoiceScene";

registerHugCues();

const SLUG = "happy-hug-day-premium" as const;
let tiltAsked = false;
const askTilt = () => {
  if (tiltAsked) return;
  tiltAsked = true;
  void requestTiltPermission();
};
type SceneId = "gate" | "come" | "arms" | "hold" | "feels" | "letter" | "voice" | "end";
const CUT: Record<SceneId, TransitionVariant> = { gate: "iris", come: "iris", arms: "iris", hold: "flash", feels: "iris", letter: "fold", voice: "iris", end: "flash" };
const SKIPPABLE: SceneId[] = ["come", "feels", "letter", "voice"];
/** After the hug the page is in colour, on sand. */
const LIGHT: SceneId[] = ["feels", "letter", "end"];

function TwentySecondHug({ data, mode, react }: ExperienceProps) {
  const day = getDay(SLUG);
  const p = usePremium();
  const h = useMemo(() => readHug(data), [data]);
  const hasLetter = !!data.letter?.trim();
  const hasVoice = !!p.premium.voiceNote || !!p.premium.voiceCaption.trim();
  const order = useMemo(() => {
    const o: SceneId[] = ["come", "arms", "hold", "feels"];
    if (hasLetter) o.push("letter");
    if (hasVoice) o.push("voice");
    o.push("end");
    return o;
  }, [hasLetter, hasVoice]);
  const [scene, setScene] = useState<SceneId>(p.opened ? "come" : "gate");
  const [run, setRun] = useState(0);
  const [at, setAt] = useState("");
  const next = (from: SceneId) => setScene(order[Math.min(order.length - 1, order.indexOf(from) + 1)] ?? "end");
  const light = LIGHT.includes(scene);

  // The song sits lower under the letter; the hold scene runs its own swell.
  const musicRef = useRef(p.music);
  useEffect(() => {
    musicRef.current = p.music;
  });
  useEffect(() => {
    const m = musicRef.current;
    if (!m?.canFade || scene === "gate" || scene === "hold") return;
    m.fadeTo(scene === "letter" ? 0.55 : 1, 1400);
  }, [scene]);

  const reactRef = useRef(react);
  useEffect(() => {
    reactRef.current = react;
  });
  useEffect(() => {
    if (scene === "end") reactRef.current("completed");
  }, [scene]);

  // Only the sender's own GIF shows: the emoji stand-in would be decoration on a page carried by photos.
  const sticker = (id: string, size: number): ReactNode => {
    const s: GifSlot | undefined = day.gifSlots.find((g) => g.id === id);
    const v = (data.gifs?.[id] ?? "").trim();
    return s && /^https:\/\//i.test(v) ? <Sticker slug={day.slug} slot={s} value={v} size={size} alt="" /> : null;
  };

  const replay = () => {
    setRun((r) => r + 1);
    setAt("");
    setScene("arms");
  };

  const idx = order.indexOf(scene);
  const nextLabel = (from: SceneId) => {
    const n = order[order.indexOf(from) + 1];
    return n === "letter" ? "Read my letter" : n === "voice" ? "Hear me say it" : "One last thing";
  };

  let body: ReactNode = null;
  switch (scene) {
    case "come":
      body = <ComeScene h={h} onNext={() => next("come")} />;
      break;
    case "arms":
      body = <ArmsScene h={h} onNext={() => next("arms")} />;
      break;
    case "hold":
      body = <HoldScene h={h} sticker={sticker("ph3-held", 64)} onDelivered={setAt} onNext={() => next("hold")} />;
      break;
    case "feels":
      body = <FeelsScene h={h} nextLabel={nextLabel("feels")} onNext={() => next("feels")} />;
      break;
    case "letter":
      body = <LetterScene h={h} letter={data.letter} nextLabel={nextLabel("letter")} onNext={() => next("letter")} />;
      break;
    case "voice":
      body = <VoiceScene h={h} onNext={() => next("voice")} />;
      break;
    case "end":
      body = (
        <EndingScene
          h={h}
          endLine={data.endLine || ""}
          dateLine={`Hug Day · ${day.date} ${day.month}`}
          deliveredAt={at}
          mode={mode}
          replyText={day.copy.replyText}
          sticker={sticker("ph6-back", 60)}
          onReplay={replay}
        />
      );
      break;
  }

  return (
    <>
      {/* First, so each scene's own <style> (rendered later) wins at equal specificity. */}
      <style>{ROOT_CSS}</style>
      <ShaderBackdrop
        preset={light ? "bokeh" : "candle"}
        colors={light ? ["#BFA286", "#F2A477", "#FFF3E6"] : ["#0D0806", "#4B3426", "#F2A477"]}
        intensity={light ? 0.55 : scene === "hold" ? 0.5 : 0.8}
        speed={0.5}
        parallax
      />
      {(scene === "come" || scene === "arms" || scene === "gate") && <GlowParticles preset="embers" colors={["#F2A477", "#FFD9BC"]} density={0.12} speed={0.45} />}
      {/* The hug lands: warm sparks drift up over the photo (above the stage, under the grain). */}
      {scene === "hold" && at && <GlowParticles preset="sparkles" colors={["#FFE2CC", "#F2A477", "#FFFFFF"]} density={0.32} speed={0.55} z={5} />}
      {light && <LightLeak color="#F2A477" color2="#FFE2CC" corner="top-right" opacity={0.3} />}
      <Vignette strength={light ? 0.42 : 0.62} color={light ? "#7A5236" : "#000"} />
      <FilmGrain opacity={light ? 0.06 : 0.075} />

      {scene === "gate" && (
        <PremiumGate
          art={<Thumbprint />}
          kicker="A hug, sent to"
          subtitle="Twenty seconds of you and me. Sound on, somewhere quiet."
          sting="hh-breath"
          openLabel="Open your arms"
          className="hh-gate"
          bg={GATE_BG}
          ink="#FAF7F2"
          accent="#F2A477"
          onOpen={() => {
            react("opened");
            setScene("come");
          }}
        />
      )}

      {scene !== "gate" && (
        <div className={`hh-chip${light ? " is-light" : ""}`} role="group" aria-label="Chapter">
          <span className="hh-chipNo" aria-label={`Chapter ${idx + 1} of ${order.length}`}>
            {String(idx + 1).padStart(2, "0")}
            <i>/{String(order.length).padStart(2, "0")}</i>
          </span>
          {SKIPPABLE.includes(scene) && (
            <button type="button" className="hh-chipSkip" onClick={() => next(scene)}>
              Skip ›
            </button>
          )}
        </div>
      )}

      {scene !== "gate" && (
        <div className="hh-stage">
          <SceneTransition sceneKey={`${scene}-${run}`} variant={CUT[scene]} flashColor="#FFE2CC" origin={scene === "feels" ? "50% 70%" : "50% 50%"}>
            {body}
          </SceneTransition>
        </div>
      )}
    </>
  );
}

export default function HugDayPremiumExperience(props: ExperienceProps) {
  const day = getDay(SLUG);
  return (
    <PremiumRoot data={props.data} mode={props.mode} slug={SLUG}>
      <DayRoot
        day={day}
        data={props.data}
        layout="full"
        dark
        className={`${HUG_FONT_VARS} hh-root`}
        style={{ ["--font-vw-ui" as string]: "var(--hh-sans)", ["--vw-font-ui" as string]: "var(--hh-sans), system-ui, sans-serif", height: "100svh", overflow: "hidden" }}
      >
        {/* iOS asks for gyro permission only inside a tap: the gate's own tap is the one (the coupon tilts). */}
        <div onClickCapture={askTilt} style={{ display: "contents" }}>
          <TwentySecondHug {...props} />
        </div>
      </DayRoot>
    </PremiumRoot>
  );
}

const ROOT_CSS = `
${UI_CSS}
${GATE_CSS}
.hh-chip { position: fixed; z-index: 97; left: calc(max(12px, env(safe-area-inset-left, 0px)) + 54px); top: max(12px, env(safe-area-inset-top, 0px)); display: flex; align-items: center; gap: 2px;
  height: 44px; padding: 0 6px 0 14px; border-radius: 99px; background: rgba(18,12,9,.45); border: 1px solid rgba(250,247,242,.14); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  font: 700 11px/1 var(--hh-ui); letter-spacing: .16em; color: var(--hh-cloud); transition: background .6s ease, color .6s ease; }
.hh-chip.is-light { background: rgba(250,247,242,.55); border-color: rgba(75,52,38,.14); color: var(--hh-cocoa); }
.hh-chipNo { font-variant-numeric: tabular-nums; padding-right: 8px; }
.hh-chipNo i { font-style: normal; opacity: .45; }
.hh-chipSkip { all: unset; cursor: pointer; height: 32px; display: inline-flex; align-items: center; padding: 0 12px; border-radius: 99px; background: rgba(250,247,242,.1); letter-spacing: .2em; text-transform: uppercase; font-size: 10px; }
.hh-chip.is-light .hh-chipSkip { background: rgba(75,52,38,.08); }
.hh-chipSkip:focus-visible { outline: 2px solid var(--hh-apricot); outline-offset: 2px; }
`;
