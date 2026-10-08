"use client";

// ─── happy-kiss-day-premium — "A Thousand Kisses" ────────────────────────────
//
// A perfume-ad love letter where kisses are the medium.
//   gate     red velvet, a cream envelope with a lipstick kiss and their line;
//            the tap starts the song with a perfume spritz + shimmer
//   seal     press and hold the lip-pressed wax seal until it melts open
//   catch    mini-game 1: slide a glass heart jar under falling kisses
//            ("mwah" up a pentatonic; "A kiss for…" slips pop)
//   mosaic   the wow: ~2,000 kisses swipe into THEIR photo; the song's drop
//            lands as it locks; "This picture is made of 1,402 kisses"
//   mirror   the letter writes itself in lipstick on a steamy vanity mirror;
//            the voice note on the vanity; a P.S. tucked in the frame
//   booth    a kiss booth: 3-2-1 flash, the photos in the booth window
//            (FilmReel), a strip prints; they stamp their own kiss on it
//   back     mini-game 2: kiss the screen (long press) → sent to the sender
//   ending   save the strip, write back, WhatsApp / replay / make one
// Family-safe by default ("cute": X's and hearts); "lipstick" is opt-in.

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { getDay } from "../../_valentine/days";
import { DayRoot, Sticker } from "../../_valentine/kit";
import { ParticleField, PremiumGate, PremiumRoot, SkipChip, sfx, usePremium, type ParticlePreset } from "../../_valentine/kit/premium";
import type { ExperienceProps, GifSlot } from "../../_valentine/types";
import { Envelope, Lips } from "./kisses/art";
import Booth, { type Stamp } from "./kisses/Booth";
import Catch from "./kisses/Catch";
import { registerKissCues } from "./kisses/cues";
import Ending from "./kisses/Ending";
import { HAND, KD_FONT_VARS } from "./kisses/fonts";
import KissBack from "./kisses/KissBack";
import Mirror from "./kisses/Mirror";
import { readKisses } from "./kisses/model";
import Mosaic from "./kisses/Mosaic";
import Seal from "./kisses/Seal";
import { UI_CSS } from "./kisses/ui";

registerKissCues();

const day = getDay("happy-kiss-day-premium");
type Scene = "gate" | "seal" | "catch" | "mosaic" | "mirror" | "booth" | "back" | "ending";
const ORDER: Scene[] = ["gate", "seal", "catch", "mosaic", "mirror", "booth", "back", "ending"];
const PARTICLES: Record<Scene, { preset: ParticlePreset; density: number }> = {
  gate: { preset: "dust", density: 0.2 },
  seal: { preset: "dust", density: 0.35 },
  catch: { preset: "sparkles", density: 0.15 },
  mosaic: { preset: "sparkles", density: 0.12 },
  mirror: { preset: "dust", density: 0.3 },
  booth: { preset: "sparkles", density: 0.25 },
  back: { preset: "snowhearts", density: 0.25 },
  ending: { preset: "snowhearts", density: 0.35 },
};

function Kisses({ data, mode, react }: ExperienceProps) {
  const p = usePremium();
  const k = useMemo(() => readKisses(data), [data]);
  const photos = useMemo(() => data.photos.filter((ph) => ph && ph.url), [data.photos]);
  const [scene, setScene] = useState<Scene>(p.opened ? "seal" : "gate");
  const [round, setRound] = useState(0);
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [count, setCount] = useState<number | null>(k.count);
  const idx = ORDER.indexOf(scene);
  const next = useCallback(() => setScene((s) => ORDER[Math.min(ORDER.length - 1, ORDER.indexOf(s) + 1)]), []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [scene]);

  const completed = useRef(false);
  useEffect(() => {
    if (scene === "ending" && !completed.current) {
      completed.current = true;
      react("completed");
    }
  }, [scene, react]);

  const sticker = (id: string, size = 72): ReactNode => {
    const s: GifSlot | undefined = day.gifSlots.find((g) => g.id === id);
    return s ? <Sticker slug={day.slug} slot={s} value={data.gifs[s.id]} size={size} /> : null;
  };
  const replay = () => {
    setRound((r) => r + 1);
    setStamps([]);
    setScene("seal");
  };

  const pf = PARTICLES[scene];
  const skippable = scene === "seal" || scene === "catch" || scene === "mirror" || scene === "booth";

  let body: ReactNode = null;
  switch (scene) {
    case "seal":
      body = <Seal k={k} onNext={next} />;
      break;
    case "catch":
      body = <Catch k={k} sticker={sticker("pk2-catch", 56)} onNext={next} />;
      break;
    case "mosaic":
      body = <Mosaic k={k} photo={photos[k.mosaicIndex]} aspect={day.photoAspect} sticker={sticker("pk3-wow", 64)} onLocked={(n) => setCount(n)} onNext={next} />;
      break;
    case "mirror":
      body = <Mirror k={k} letter={data.letter || "Happy Kiss Day."} sticker={sticker("pk4-mirror", 56)} onNext={next} />;
      break;
    case "booth":
      body = <Booth k={k} photos={data.photos} aspect={day.photoAspect} sticker={sticker("pk5-booth", 72)} stamps={stamps} onStamps={setStamps} onNext={next} />;
      break;
    case "back":
      body = <KissBack k={k} sticker={sticker("pk6-back", 84)} onSent={(n) => react("answered", { count: n })} onNext={next} />;
      break;
    case "ending":
      body = <Ending day={day} data={data} k={k} stamps={stamps} aspect={day.photoAspect} count={count} mode={mode} onReplay={replay} />;
      break;
  }

  return (
    <>
      <div className="kd-bg" aria-hidden />
      <ParticleField preset={pf.preset} density={pf.density} colors={pf.preset === "dust" ? ["rgba(232,90,122,.55)", "rgba(212,175,55,.6)"] : pf.preset === "sparkles" ? ["#F3DC8A", "#FFFFFF", "#F7B6C6"] : ["#FFFFFF", "#F9D5DC", "#F28AA5"]} z={1} />

      {scene === "gate" && (
        <PremiumGate
          art={<Envelope line={k.envelope} shade={k.S.c} cute={!k.lipstick} />}
          kicker="Sealed with a kiss, for"
          subtitle={<span>🎧 Sound on · tap to begin</span>}
          sting="kd-perfume"
          openLabel="Open with a kiss"
          className="kd-gate"
          bg="radial-gradient(120% 80% at 50% 18%, #8A1A37 0%, #5A0F24 48%, #2E0612 100%)"
          ink="#FFF6EE"
          accent="#F28AA5"
          onOpen={() => {
            sfx("kd-mwah", { gain: 0.6 });
            setScene("seal");
          }}
        />
      )}

      {scene !== "gate" && (
        <div className="kd-progress" role="img" aria-label={`Kiss ${Math.min(idx, 6)} of 6`}>
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} className={i < idx ? "is-on" : ""}>
              <Lips color={i < idx ? k.S.c : "rgba(122,15,46,.22)"} size={14} cute={!k.lipstick} />
            </span>
          ))}
        </div>
      )}

      <div key={`${scene}-${round}`} className="kd-scene">
        {body}
      </div>

      {skippable && (
        <SkipChip
          key={`skip-${scene}-${round}`}
          onSkip={next}
          label={scene === "seal" && p.repeatVisit ? "Skip intro ▸" : "Skip ▸"}
          delay={scene === "seal" && p.repeatVisit ? 0 : 2500}
        />
      )}
      <style>{ROOT_CSS}</style>
    </>
  );
}

export default function KissDayPremiumExperience(props: ExperienceProps) {
  const k = readKisses(props.data);
  return (
    <PremiumRoot data={props.data} mode={props.mode} slug="happy-kiss-day-premium">
      <DayRoot
        day={day}
        data={props.data}
        className={KD_FONT_VARS}
        line={k.envelope}
        art={
          <div style={{ display: "grid", placeItems: "center", height: "100%", minHeight: 140 }}>
            <Lips color={k.S.c} size={150} cute={!k.lipstick} />
          </div>
        }
      >
        <Kisses {...props} />
      </DayRoot>
    </PremiumRoot>
  );
}

const ROOT_CSS = `
${UI_CSS}
.kd-bg { position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background: radial-gradient(60% 40% at 15% 10%, rgba(255,255,255,.7), transparent 70%), radial-gradient(50% 40% at 90% 85%, rgba(242,138,165,.25), transparent 70%),
  radial-gradient(120% 80% at 50% 0%, #FFF6EE 0%, #FBE3E8 48%, #F6CCD6 100%); }
/* backwards, not both: a transform still in effect would trap fixed layers (the flash, lightboxes). */
.kd-scene { position: relative; z-index: 2; animation: kd-sceneIn .7s cubic-bezier(.22,1,.36,1) backwards; }
@keyframes kd-sceneIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
.kd-progress { position: fixed; top: calc(66px + env(safe-area-inset-top, 0px)); left: 50%; transform: translateX(-50%); z-index: 96; display: flex; gap: 4px; padding: 6px 10px;
  border-radius: 99px; background: rgba(255,255,255,.62); border: 1px solid rgba(122,15,46,.12); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); pointer-events: none; }
.kd-gate::before { content: ""; position: absolute; inset: -20%; z-index: 1; pointer-events: none; opacity: .55;
  background: radial-gradient(30% 22% at 30% 70%, rgba(242,138,165,.35), transparent 70%), radial-gradient(26% 20% at 72% 60%, rgba(255,214,224,.28), transparent 70%);
  filter: blur(10px); animation: kd-haze 9s ease-in-out infinite alternate; }
@keyframes kd-haze { from { transform: translate(-3%, 2%) scale(1); } to { transform: translate(3%, -3%) scale(1.08); } }
.kd-gate .pm-gateArt { width: min(330px, 78vw); aspect-ratio: 320 / 220; max-height: 34vh; }
.kd-gate .pm-gateName { font-family: var(--font-vw-script, 'Dancing Script'), cursive !important; color: #FFF6EE; }
.kd-gate .pm-gateKick { color: #F7B6C6; }
.kd-gate .pm-gateSub { font-family: ${HAND}; font-size: 20px; }
.kd-envKiss { animation: kd-envKiss 3s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
@keyframes kd-envKiss { 0%, 100% { opacity: .92; } 50% { opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .kd-scene { animation: kd-fade .3s ease backwards; } .kd-gate::before, .kd-envKiss { animation: none; } }
@keyframes kd-fade { from { opacity: 0; } to { opacity: 1; } }
`;
