"use client";

// ─── happy-hug-day-premium — "Hold Me for 20 Seconds" ────────────────────────
//
// The closest a phone can get to being held. Sensory and slow; lightness only
// returns in the games. No medical claims ("long enough to feel it").
//   gate      a frosted pane; the tap starts the song with a glass chime
//   frost     wipe the frosted window → "{name}, come here." over a photo
//   distance  drag the two of you together across "860 km" of snow
//   hug       the wow: a two-thumb hold; thermal heat shapes merge, a
//             heartbeat slows to the sender's, lines fade in; the song's drop
//             lands on "Hug delivered"
//   mittens   mini-game 1: rub knitted mittens warm → notes for bad days
//   hoodie    drag the zipper down → the letter on the lining; voice note, P.S.
//   fort      the photo quilt, the fairy-light slideshow (FilmReel), and
//             mini-game 2: tap along until two heartbeats sync
//   back      a five-second hug back (react "answered"); tear off hug passes
//   ending    the hug certificate keepsake, reply, WhatsApp / replay / make one

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { getDay } from "../../_valentine/days";
import { DayRoot, Sticker } from "../../_valentine/kit";
import { ParticleField, PremiumGate, PremiumRoot, SkipChip, sfx, usePremium, type ParticlePreset } from "../../_valentine/kit/premium";
import type { ExperienceProps, GifSlot } from "../../_valentine/types";
import { registerHugCues } from "./hugs/cues";
import Distance from "./hugs/Distance";
import Ending from "./hugs/Ending";
import { HAND, HG_FONT_VARS } from "./hugs/fonts";
import Fort from "./hugs/Fort";
import Frost from "./hugs/Frost";
import Hoodie from "./hugs/Hoodie";
import HugBack from "./hugs/HugBack";
import Mittens from "./hugs/Mittens";
import { readHug } from "./hugs/model";
import ThermalHug from "./hugs/ThermalHug";
import { UI_CSS } from "./hugs/ui";

registerHugCues();

const day = getDay("happy-hug-day-premium");
type Scene = "gate" | "frost" | "distance" | "hug" | "mittens" | "hoodie" | "fort" | "back" | "ending";
const ORDER: Scene[] = ["gate", "frost", "distance", "hug", "mittens", "hoodie", "fort", "back", "ending"];
const WARMTH: Record<Scene, number> = { gate: 0, frost: 0, distance: 0.15, hug: 0.4, mittens: 0.7, hoodie: 0.8, fort: 0.9, back: 1, ending: 1 };
const PARTICLES: Record<Scene, { preset: ParticlePreset; density: number; colors?: string[] }> = {
  gate: { preset: "snow", density: 0.5 },
  frost: { preset: "snow", density: 0.45 },
  distance: { preset: "snow", density: 0.3 },
  hug: { preset: "dust", density: 0.08, colors: ["rgba(255,224,138,.5)"] },
  mittens: { preset: "embers", density: 0.12 },
  hoodie: { preset: "embers", density: 0.1 },
  fort: { preset: "fireflies", density: 0.15, colors: ["#FFE08A", "#FFB070"] },
  back: { preset: "embers", density: 0.12 },
  ending: { preset: "sparkles", density: 0.35, colors: ["#FFE08A", "#FFFFFF", "#FFB070"] },
};

function GatePane() {
  return (
    <svg viewBox="0 0 300 220" width="100%" height="100%" aria-hidden style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id="hgPaneGlow" cx=".5" cy=".6" r=".6">
          <stop offset="0" stopColor="#FF8A3D" stopOpacity=".55" />
          <stop offset=".6" stopColor="#D9367A" stopOpacity=".2" />
          <stop offset="1" stopColor="#1B2340" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hgFrost" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F4F8FC" stopOpacity=".92" />
          <stop offset="1" stopColor="#C9D8E6" stopOpacity=".8" />
        </linearGradient>
      </defs>
      <rect x="20" y="10" width="260" height="200" rx="18" fill="#3A2A24" />
      <rect x="32" y="22" width="236" height="176" rx="10" fill="url(#hgPaneGlow)" />
      <rect x="32" y="22" width="236" height="176" rx="10" fill="url(#hgFrost)" />
      <path d="M150 22 L150 198 M32 104 L268 104" stroke="#3A2A24" strokeWidth="7" />
      <g transform="translate(118 50)" fill="rgba(255,255,255,.55)">
        <path d="M30 66 C16 66 10 56 10 44 L10 30 C10 26 16 26 16 30 L16 40 L18 14 C18 9 25 9 25 14 L25 36 L27 8 C27 3 34 3 34 8 L34 36 L37 12 C37 7 44 7 44 12 L43 38 L47 24 C48 19 55 21 53 26 L48 50 C46 60 40 66 30 66 Z" />
      </g>
      <text x="150" y="176" textAnchor="middle" fill="#4A6080" style={{ font: "700 22px var(--font-hg-hand), cursive" }}>come in from the cold</text>
    </svg>
  );
}

function Hugs({ data, mode, react }: ExperienceProps) {
  const p = usePremium();
  const h = useMemo(() => readHug(data), [data]);
  const photos = useMemo(() => data.photos.filter((ph) => ph && ph.url), [data.photos]);
  const [scene, setScene] = useState<Scene>(p.opened ? "frost" : "gate");
  const [round, setRound] = useState(0);
  const [at, setAt] = useState("");
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
    setScene("frost");
  };

  const pf = PARTICLES[scene];
  const skippable = scene === "frost" || scene === "distance" || scene === "mittens" || scene === "hoodie" || scene === "fort";

  let body: ReactNode = null;
  switch (scene) {
    case "frost":
      body = <Frost h={h} photo={photos[0]} sticker={sticker("ph1-window", 64)} onNext={next} />;
      break;
    case "distance":
      body = <Distance h={h} sticker={sticker("ph2-walk", 56)} onNext={next} />;
      break;
    case "hug":
      body = <ThermalHug h={h} sticker={sticker("ph3-held", 84)} onDelivered={setAt} onNext={next} />;
      break;
    case "mittens":
      body = <Mittens h={h} sticker={sticker("ph4-mitten", 56)} onNext={next} />;
      break;
    case "hoodie":
      body = <Hoodie h={h} letter={data.letter || "Happy Hug Day."} onNext={next} />;
      break;
    case "fort":
      body = <Fort h={h} photos={data.photos} aspect={day.photoAspect} sticker={sticker("ph5-fort", 64)} onNext={next} />;
      break;
    case "back":
      body = <HugBack h={h} sticker={sticker("ph6-back", 96)} onSent={() => react("answered")} onNext={next} />;
      break;
    case "ending":
      body = <Ending day={day} data={data} h={h} at={at} mode={mode} onReplay={replay} />;
      break;
  }

  return (
    <>
      <div className="hg-bg" aria-hidden style={{ ["--warm" as string]: String(WARMTH[scene]) }}>
        <span className="hg-bgWarm" />
      </div>
      <ParticleField preset={pf.preset} density={pf.density} colors={pf.colors} z={1} />
      {scene === "gate" && (
        <PremiumGate
          art={<GatePane />}
          kicker="Someone needs 20 seconds of you,"
          subtitle={<span>🎧 Sound on · tap to begin</span>}
          sting="hg-reveal"
          openLabel="Let me in"
          className="hg-gate"
          bg="radial-gradient(120% 80% at 50% 10%, #2B3560 0%, #1B2340 55%, #10152C 100%)"
          ink="#F4EBDD"
          accent="#FFE08A"
          onOpen={() => {
            sfx("hg-step", { gain: 0.4 });
            setScene("frost");
          }}
        />
      )}
      {scene !== "gate" && (
        <div className="hg-progress" role="img" aria-label={`Step ${Math.min(idx, 7)} of 7`}>
          {Array.from({ length: 7 }, (_, i) => <i key={i} className={i < idx ? "is-on" : ""} />)}
        </div>
      )}
      <div key={`${scene}-${round}`} className="hg-scene">
        {body}
      </div>
      {skippable && (
        <SkipChip
          key={`skip-${scene}-${round}`}
          onSkip={next}
          label={scene === "frost" && p.repeatVisit ? "Skip intro ▸" : "Skip ▸"}
          delay={scene === "frost" && p.repeatVisit ? 0 : 2500}
          style={{ background: "rgba(27,35,64,.55)", color: "#F4EBDD", border: "1px solid rgba(220,232,242,.25)" }}
        />
      )}
      <style>{ROOT_CSS}</style>
    </>
  );
}

export default function HugDayPremiumExperience(props: ExperienceProps) {
  return (
    <PremiumRoot data={props.data} mode={props.mode} slug="happy-hug-day-premium" chipStyle={{ background: "rgba(27,35,64,.55)", color: "#F4EBDD", borderColor: "rgba(220,232,242,.25)" }}>
      <DayRoot
        day={day}
        data={props.data}
        className={HG_FONT_VARS}
        line={readHug(props.data).frostLine}
        art={<div style={{ display: "grid", placeItems: "center", height: "100%", minHeight: 140, fontSize: 120 }}>🫂</div>}
      >
        <Hugs {...props} />
      </DayRoot>
    </PremiumRoot>
  );
}

const ROOT_CSS = `
${UI_CSS}
.hg-bg { position: fixed; inset: 0; z-index: 0; pointer-events: none; background: radial-gradient(120% 80% at 50% 0%, #2B3560 0%, #1B2340 55%, #10152C 100%); }
.hg-bgWarm { position: absolute; inset: 0; opacity: var(--warm); transition: opacity 2.5s ease;
  background: radial-gradient(90% 60% at 50% 100%, rgba(255,138,61,.45), transparent 70%), radial-gradient(120% 80% at 50% 0%, #3A2A4C 0%, #2A1E38 55%, #1A1226 100%); }
/* backwards, not both: a transform still in effect would trap fixed layers (lightboxes). */
.hg-scene { position: relative; z-index: 2; animation: hg-sceneIn .8s cubic-bezier(.22,1,.36,1) backwards; }
@keyframes hg-sceneIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
.hg-progress { position: fixed; top: calc(66px + env(safe-area-inset-top, 0px)); left: 50%; transform: translateX(-50%); z-index: 96; display: flex; gap: 6px; padding: 7px 10px;
  border-radius: 99px; background: rgba(27,35,64,.55); border: 1px solid rgba(220,232,242,.18); pointer-events: none; }
.hg-progress i { width: 8px; height: 8px; border-radius: 50%; background: rgba(220,232,242,.25); }
.hg-progress i.is-on { background: #FF8A3D; box-shadow: 0 0 8px rgba(255,138,61,.7); }
.hg-gate .pm-gateArt { width: min(320px, 76vw); aspect-ratio: 300 / 220; max-height: 32vh; }
.hg-gate .pm-gateName { font-family: var(--font-vw-script, 'Dancing Script'), cursive !important; color: #FFF6EA; }
.hg-gate .pm-gateKick { color: #FFC79A; }
.hg-gate .pm-gateSub { font-family: ${HAND}; font-size: 20px; }
@media (prefers-reduced-motion: reduce) { .hg-scene { animation: hg-fade .3s ease backwards; } }
@keyframes hg-fade { from { opacity: 0; } to { opacity: 1; } }
`;
