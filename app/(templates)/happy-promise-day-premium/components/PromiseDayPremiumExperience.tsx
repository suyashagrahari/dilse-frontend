"use client";

// ─── happy-promise-day-premium — "Signed, Sealed, Promised" ────────────────
//
// research.md §D.5. A promise drawn up as a deed, on warm ivory paper under
// a desk lamp at night.
//   gate      a heavy cream envelope, wax-sealed: "Break the seal" (song starts)
//   whereas   the deed comes out folded in three: drag to unfold it; two
//             "Whereas…" lines (their story) + Exhibit A clipped on
//   promises  press the typewriter key: each clause types itself in, clack by
//             clack, with one of their photos clipped above it
//   exhibits  any photos left over, a pile of prints to flick through
//   letter    Schedule A, in my own words: the letter; tap to initial it
//   voice     the sworn statement: the voice note (or the caption, typed)
//   sign      "And above all…" over two signature lines: the sender's writes
//             itself in ink, the recipient signs with a finger
//   seal      the money moment: the deed folds into its envelope, they hold
//             the brass seal to pour the wax, and on the song's drop the
//             seal presses in, the wax blooms with their initials, the
//             notary's red stamp lands
//   ending    the sealed envelope to keep, witnessed by…, save the deed,
//             the codicil (P.S.), write back
// One WebGL backdrop (candle), one particle layer, grain + vignette + leak.

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
import { registerDeedCues } from "./deed/cues";
import EndingScene from "./deed/EndingScene";
import ExhibitsScene from "./deed/ExhibitsScene";
import { SP_FONT_VARS } from "./deed/fonts";
import { Envelope, GATE_BG, GATE_CSS } from "./deed/Gate";
import LetterScene from "./deed/LetterScene";
import { readDeed } from "./deed/model";
import PromisesScene from "./deed/PromisesScene";
import SealScene from "./deed/SealScene";
import SignScene, { type SignResult } from "./deed/SignScene";
import { UI_CSS } from "./deed/ui";
import VoiceScene from "./deed/VoiceScene";
import WhereasScene from "./deed/WhereasScene";

registerDeedCues();

const day = getDay("happy-promise-day-premium");
type SceneId = "gate" | "whereas" | "promises" | "exhibits" | "letter" | "voice" | "sign" | "seal" | "ending";
const CUT: Record<SceneId, TransitionVariant> = { gate: "flash", whereas: "iris", promises: "fold", exhibits: "fold", letter: "fold", voice: "iris", sign: "fold", seal: "iris", ending: "flash" };
const SKIPPABLE: SceneId[] = ["whereas", "promises", "exhibits", "letter", "voice"];

function Deed({ data, mode, react }: ExperienceProps) {
  const p = usePremium();
  const reduce = useReducedMotion();
  const d = useMemo(() => readDeed(data), [data]);
  const order = useMemo(() => {
    const o: SceneId[] = ["whereas", "promises"];
    if (d.exhibits.length) o.push("exhibits");
    o.push("letter");
    if (p.premium.voiceNote || p.premium.voiceCaption) o.push("voice");
    o.push("sign", "seal", "ending");
    return o;
  }, [d.exhibits.length, p.premium.voiceNote, p.premium.voiceCaption]);
  const [scene, setScene] = useState<SceneId>(p.opened ? "whereas" : "gate");
  const [round, setRound] = useState(0);
  const [sig, setSig] = useState<SignResult | null>(null);
  const [sealed, setSealed] = useState(false);
  const [flashN, setFlashN] = useState(0);
  const next = useCallback(() => setScene((s) => order[Math.min(order.length - 1, order.indexOf(s as SceneId) + 1)] ?? "ending"), [order]);

  const completed = useRef(false);
  useEffect(() => {
    if (scene === "ending" && !completed.current) {
      completed.current = true;
      react("completed");
    }
  }, [scene, react]);

  // Only the sender's own GIF shows: an emoji stand-in would be decoration here.
  const sticker = (id: string, size = 64): ReactNode => {
    const s: GifSlot | undefined = day.gifSlots.find((g) => g.id === id);
    const v = (data.gifs?.[id] ?? "").trim();
    return s && /^https:\/\//i.test(v) ? <Sticker slug={day.slug} slot={s} value={v} size={size} /> : null;
  };
  const replay = () => {
    setRound((r) => r + 1);
    setSig(null);
    setSealed(false);
    setScene("whereas");
  };

  const idx = order.indexOf(scene);
  let body: ReactNode = null;
  switch (scene) {
    case "whereas":
      body = <WhereasScene d={d} onNext={next} />;
      break;
    case "promises":
      body = <PromisesScene d={d} sticker={sticker("ps1-desk", 58)} onNext={next} />;
      break;
    case "exhibits":
      body = <ExhibitsScene photos={d.exhibits} onNext={next} />;
      break;
    case "letter":
      body = <LetterScene d={d} letter={data.letter || "Happy Promise Day."} onNext={next} />;
      break;
    case "voice":
      body = <VoiceScene d={d} onNext={next} />;
      break;
    case "sign":
      body = (
        <SignScene
          d={d}
          onSigned={(r) => {
            setSig(r);
            react("answered", { count: r.typed ? 0 : r.strokes.length });
            next();
          }}
        />
      );
      break;
    case "seal":
      body = (
        <SealScene
          d={d}
          sig={sig}
          onPeak={() => {
            setSealed(true);
            setFlashN((n) => n + 1);
          }}
          onNext={next}
        />
      );
      break;
    case "ending":
      body = <EndingScene d={d} sig={sig} endLine={data.endLine} mode={mode} replyText={day.copy.replyText} sticker={sticker("ps2-sealed", 64)} onReplay={replay} />;
      break;
  }

  const glow = sealed && (scene === "seal" || scene === "ending");
  return (
    <>
      {/* First, so each scene's own <style> (rendered later) wins at equal specificity. */}
      <style>{ROOT_CSS}</style>
      <ShaderBackdrop preset="candle" colors={["#120a06", "#4a2c18", "#ffcf8f"]} intensity={glow ? 1.15 : 0.95} speed={0.5} parallax />
      {scene !== "gate" && <div className="sp-desk" aria-hidden />}
      {glow && <GlowParticles preset="sparkles" density={scene === "seal" ? 0.3 : 0.14} colors={["#ffe3a8", "#E9C77A", d.W.hi]} speed={0.55} />}
      <LightLeak color="#ffb46a" color2="#ffd9a0" corner="top-left" opacity={0.3} />
      <Vignette strength={0.64} />
      <FilmGrain opacity={0.075} />

      {scene === "gate" && (
        <PremiumGate
          art={<Envelope d={d} />}
          kicker="A sealed promise for"
          subtitle={d.envelopeLine || "To be opened by you, and only you."}
          sting="sp-open"
          openLabel="Break the seal"
          sealText={`Drawn up by hand for ${d.recipient}`}
          className="sp-gate"
          bg={GATE_BG}
          ink="#F5EFE2"
          accent="#E9C77A"
          openMs={reduce ? 250 : 1100}
          onOpen={() => setScene("whereas")}
        />
      )}

      {scene !== "gate" && (
        <div className="sp-chip" role="group" aria-label="Chapter">
          <span className="sp-chipNo" aria-label={`Chapter ${idx + 1} of ${order.length}`}>
            § {String(idx + 1).padStart(2, "0")}
            <i>/{String(order.length).padStart(2, "0")}</i>
          </span>
          {SKIPPABLE.includes(scene) && (
            <button type="button" className="sp-chipSkip" onClick={next}>
              Skip ›
            </button>
          )}
        </div>
      )}

      {flashN > 0 && <div key={flashN} className={`sp-flash${reduce ? " is-reduced" : ""}`} aria-hidden />}

      {scene !== "gate" && (
        <div className="sp-stage">
          <SceneTransition sceneKey={`${scene}-${round}`} variant={CUT[scene]} flashColor="#fff1dc">
            {body}
          </SceneTransition>
        </div>
      )}
    </>
  );
}

export default function PromiseDayPremiumExperience(props: ExperienceProps) {
  return (
    <PremiumRoot data={props.data} mode={props.mode} slug="happy-promise-day-premium">
      <DayRoot day={day} data={props.data} layout="full" className={`${SP_FONT_VARS} sp-root`} style={{ height: "100svh", overflow: "hidden" }}>
        <Deed {...props} />
      </DayRoot>
    </PremiumRoot>
  );
}

const ROOT_CSS = `
${UI_CSS}
${GATE_CSS}
.sp-desk { position: fixed; inset: 0; z-index: 1; pointer-events: none;
  background: radial-gradient(70% 46% at 50% 46%, rgba(255,196,120,.13), transparent 72%), radial-gradient(80% 50% at 18% 0%, rgba(255,214,150,.1), transparent 60%),
    repeating-linear-gradient(88deg, rgba(0,0,0,0) 0 31px, rgba(0,0,0,.12) 31px 32px, rgba(255,220,180,.02) 32px 83px),
    repeating-linear-gradient(91deg, rgba(0,0,0,0) 0 13px, rgba(0,0,0,.07) 13px 14px, rgba(0,0,0,0) 14px 47px); }
.sp-chip { position: fixed; z-index: 97; left: calc(max(12px, env(safe-area-inset-left, 0px)) + 54px); top: max(12px, env(safe-area-inset-top, 0px)); display: flex; align-items: center; gap: 2px;
  height: 44px; padding: 0 6px 0 14px; border-radius: 99px; background: rgba(20,12,8,.5); border: 1px solid rgba(245,239,226,.14); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  font: 700 11px/1 var(--sp-type); letter-spacing: .14em; color: var(--sp-ivory); }
.sp-chipNo { font-variant-numeric: tabular-nums; padding-right: 8px; }
.sp-chipNo i { font-style: normal; opacity: .45; }
.sp-chipSkip { all: unset; cursor: pointer; height: 32px; display: inline-flex; align-items: center; padding: 0 12px; border-radius: 99px; background: rgba(245,239,226,.1); letter-spacing: .2em; text-transform: uppercase; font-size: 10px; }
.sp-chipSkip:focus-visible { outline: 2px solid var(--sp-gold); outline-offset: 2px; }
.sp-flash { position: fixed; inset: 0; z-index: 88; pointer-events: none; background: radial-gradient(60% 50% at 50% 55%, #fff4dc, rgba(255,214,150,.6) 60%, rgba(255,190,110,.2)); animation: sp-flash 1s cubic-bezier(.1,.7,.3,1) forwards; }
.sp-flash.is-reduced { animation: sp-flashR .4s ease forwards; }
@keyframes sp-flash { 0% { opacity: 0; } 10% { opacity: .85; } 100% { opacity: 0; } }
@keyframes sp-flashR { 0% { opacity: .2; } 100% { opacity: 0; } }
`;
