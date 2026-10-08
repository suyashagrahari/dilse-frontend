"use client";

// ─── happy-halloween-premium — "The Midnight Manor" ──────────────────────────
//
// A moonlit haunted manor holds a midnight ball for one guest.
//   gate      a sealed black invitation in the rain (tap = the song + a wax
//             crack and a thunder roll; family/kids: a far rumble only)
//   approach  the invitation reads itself in gold; drag the iron gate open
//   foyer     strike a match, light 3–5 candles = 3–5 memories on the walls
//   gallery   wake sepia portraits (their photos), then the gallery remembers
//   seance    the spirit board spells their name by itself, then a secret
//             word, then answers three questions (mini-game A)
//   radio     tune the spirit radio to the sender's frequency → their voice
//   attic     warm the invisible-ink letter with a candle; a sealed P.S.
//   kitchen   trace three sigils into the cauldron, hold to stir → prophecy
//             in a crystal ball (mini-game B)
//   midnight  turn the clock to twelve: the song DROPS on the first of twelve
//             bells; the question; YES → bats burst into firework hearts with
//             both initials while the storm turns to dawn
//   ending    their portrait hangs in the manor gallery (the keepsake), the
//             guest book, a reply to the sender, WhatsApp / replay / "haunt
//             someone back".
// One ParticleField (rain → dust → fireflies → embers → bats → sparkles), one
// song drop, 20+ procedural cues, each with a visual twin. Scheduled unlock
// (e.g. 31 Oct, 00:00): the viewer's teaser counts down; once it opens, the
// gate says it was unsealed at midnight.

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { getDay } from "../../_valentine/days";
import { DayRoot, Sticker, useReducedMotion } from "../../_valentine/kit";
import { sfx, ParticleField, PremiumGate, PremiumRoot, SkipChip, usePremium, type ParticlePreset } from "../../_valentine/kit/premium";
import type { ExperienceProps, GifSlot } from "../../_valentine/types";
import Approach from "./manor/Approach";
import { Invitation, ManorSilhouette } from "./manor/art";
import Attic from "./manor/Attic";
import Backdrop, { type SkyPhase } from "./manor/Backdrop";
import { registerManorCues } from "./manor/cues";
import Ending, { type NightStats } from "./manor/Ending";
import { ENGRAVED, MM_FONT_VARS } from "./manor/fonts";
import Foyer from "./manor/Foyer";
import Gallery from "./manor/Gallery";
import Kitchen from "./manor/Kitchen";
import Midnight from "./manor/Midnight";
import { readManor } from "./manor/model";
import Radio from "./manor/Radio";
import Seance from "./manor/Seance";
import { UI_CSS } from "./manor/ui";

registerManorCues();

const day = getDay("happy-halloween-premium");
type Scene = "gate" | "approach" | "foyer" | "gallery" | "seance" | "radio" | "attic" | "kitchen" | "midnight" | "ending";
const ALL: Scene[] = ["gate", "approach", "foyer", "gallery", "seance", "radio", "attic", "kitchen", "midnight", "ending"];
const OUTSIDE = new Set<Scene>(["gate", "approach", "midnight", "ending"]);

function Manor({ data, mode, react }: ExperienceProps) {
  const p = usePremium();
  const reduce = useReducedMotion();
  const m = useMemo(() => readManor(data), [data]);
  const hasPhotos = data.photos.some((ph) => ph && ph.url);
  const order = useMemo(() => ALL.filter((s) => s !== "gallery" || hasPhotos), [hasPhotos]);
  const [scene, setScene] = useState<Scene>(p.opened ? "approach" : "gate");
  const [round, setRound] = useState(0);
  const [warm, setWarm] = useState(0);
  const [dawn, setDawn] = useState(false);
  const [stats, setStats] = useState<NightStats>({ candles: 0, portraits: 0, spirits: 0 });
  const idx = order.indexOf(scene);
  const next = useCallback(() => setScene((s) => order[Math.min(order.length - 1, order.indexOf(s) + 1)]), [order]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [scene]);

  // Weather follows the night: storm outside until we're in, night after, dawn after YES.
  const phase: SkyPhase = dawn ? "dawn" : scene === "gate" || scene === "approach" ? "storm" : "night";

  // The rain, audible only on the approach (inside, the walls take it).
  useEffect(() => {
    if (scene !== "approach") return;
    const rain = sfx("rain-bed", { gain: m.gentle ? 0.55 : 0.85 });
    return () => rain.stop(1400);
  }, [scene, m.gentle]);

  const completed = useRef(false);
  useEffect(() => {
    if (scene === "ending" && !completed.current) {
      completed.current = true;
      react("completed");
    }
  }, [scene, react]);

  const sticker = (id: string, size = 84): ReactNode => {
    const s: GifSlot | undefined = day.gifSlots.find((g) => g.id === id);
    return s ? <Sticker slug={day.slug} slot={s} value={data.gifs[s.id]} size={size} /> : null;
  };

  const replay = () => {
    setRound((r) => r + 1);
    setWarm(0);
    setDawn(false);
    setStats({ candles: 0, portraits: 0, spirits: 0 });
    setScene("approach");
  };

  const onWoken = useCallback((n: number) => setStats((s) => (s.portraits === n ? s : { ...s, portraits: n })), []);
  const onAsked = useCallback((n: number) => setStats((s) => (s.spirits === n ? s : { ...s, spirits: n })), []);

  // Unsealed by a scheduled unlock in the last two days → the gate says so.
  const [justUnsealed] = useState(() => {
    const at = Date.parse(p.premium.unlockAt || "");
    const now = Date.now();
    return Number.isFinite(at) && now >= at && now - at < 48 * 3600e3;
  });

  const particles: { preset: ParticlePreset; colors?: string[]; density: number } =
    phase === "dawn"
      ? { preset: "sparkles", colors: ["#FFE6A0", "#FFB3A7", "#FFFFFF"], density: 0.4 }
      : scene === "gate" || scene === "approach"
        ? { preset: "rain", density: m.gentle ? 0.3 : 0.45 }
        : scene === "seance"
          ? { preset: "fireflies", colors: ["#7FF5D8", "#C9FFF0"], density: 0.3 }
          : scene === "kitchen"
            ? { preset: "embers", density: 0.4 }
            : scene === "midnight"
              ? { preset: "bats", density: 0.6 }
              : { preset: "dust", colors: ["rgba(255,226,170,.75)"], density: 0.4 };

  const dial = Math.max(0, Math.min(12, scene === "ending" ? 12 : Math.round(((idx - 1) / Math.max(1, order.indexOf("midnight") - 1)) * 11)));
  const skippable = scene !== "gate" && scene !== "midnight" && scene !== "ending";
  const outside = OUTSIDE.has(scene);

  let body: ReactNode = null;
  switch (scene) {
    case "approach":
      body = <Approach m={m} sticker={sticker("p1-invite", 80)} onOpened={() => {}} onNext={next} />;
      break;
    case "foyer":
      body = <Foyer m={m} sticker={sticker("p2-candle", 64)} onWarm={(w, n) => { setWarm(w); setStats((s) => ({ ...s, candles: n })); }} onNext={next} />;
      break;
    case "gallery":
      body = <Gallery m={m} photos={data.photos} aspect={day.photoAspect} sticker={sticker("p3-portrait", 64)} onWoken={onWoken} onNext={next} />;
      break;
    case "seance":
      body = <Seance m={m} sticker={sticker("p4-seance", 64)} onAsked={onAsked} onNext={next} />;
      break;
    case "radio":
      body = <Radio m={m} onNext={next} />;
      break;
    case "attic":
      body = <Attic m={m} letter={data.letter || "Happy Halloween."} onNext={next} />;
      break;
    case "kitchen":
      body = <Kitchen m={m} sticker={sticker("p5-cauldron", 64)} onNext={next} />;
      break;
    case "midnight":
      body = (
        <Midnight
          m={m}
          sticker={sticker("p6-yes", 110)}
          onYes={(d) => react("answered", { noDodges: d })}
          onDawn={() => setDawn(true)}
          onNext={next}
        />
      );
      break;
    case "ending":
      body = <Ending day={day} data={data} m={m} stats={stats} mode={mode} onReplay={replay} />;
      break;
  }

  return (
    <>
      <Backdrop phase={phase} scene={scene} place={outside ? "outside" : "inside"} warm={outside ? 0 : Math.max(0.2, warm)} lit={0.25 + (idx / order.length) * 0.75} lightning={!m.gentle && !reduce} />
      <ParticleField preset={particles.preset} colors={particles.colors} density={particles.density} z={1} />

      {scene === "gate" && (
        <PremiumGate
          art={<Invitation name={m.recipient} title={`“${m.nightTitle}”`} />}
          kicker="A sealed invitation for"
          subtitle={
            <span style={{ fontFamily: ENGRAVED, letterSpacing: ".12em", fontSize: 13 }}>
              {justUnsealed ? "Unsealed at the stroke of midnight" : `The midnight ball · ${m.manorName}`}
            </span>
          }
          sting={m.gentle ? "mm-seal-soft" : "mm-seal"}
          openLabel="Break the seal"
          className={`mm-gate${m.gentle ? " is-gentle" : ""}`}
          bg={`radial-gradient(circle at 80% 12%, rgba(220,227,242,.32) 0, rgba(220,227,242,.07) 8%, transparent 20%), ${day.theme.bg}`}
          onOpen={() => {
            sfx("mm-flap", { gain: 0.6 });
            setScene("approach");
          }}
        />
      )}

      {scene !== "gate" && (
        <div className="mm-dial" role="img" aria-label={`${dial} of 12 strokes to midnight`}>
          <svg viewBox="0 0 44 44" width="44" height="44" aria-hidden>
            <circle cx="22" cy="22" r="20" fill="rgba(11,10,20,.6)" stroke="rgba(220,227,242,.25)" />
            {Array.from({ length: 12 }, (_, i) => (
              <line key={i} x1="22" y1="5" x2="22" y2="10" stroke={i < dial ? "#FFC86B" : "rgba(220,227,242,.35)"} strokeWidth={i < dial ? 2.6 : 1.6} strokeLinecap="round" transform={`rotate(${i * 30 + 30} 22 22)`} />
            ))}
            <path d="M22 13 a9 9 0 1 0 6.4 15.4 a7 7 0 1 1 -6.4 -15.4 z" fill={dial >= 12 ? "#FFE6A0" : "#DCE3F2"} transform="translate(-2 1)" />
          </svg>
        </div>
      )}

      <div key={`${scene}-${round}`} className="mm-scene">
        {body}
      </div>

      {skippable && (
        <SkipChip
          key={`skip-${scene}-${round}`}
          onSkip={next}
          label={scene === "approach" && p.repeatVisit ? "Skip intro ▸" : "Skip ▸"}
          delay={scene === "approach" && p.repeatVisit ? 0 : 2500}
          style={{ background: "rgba(11,10,20,.55)", color: "#F1EEFB", border: "1px solid rgba(220,227,242,.25)" }}
        />
      )}
      <style>{ROOT_CSS}</style>
    </>
  );
}

export default function HalloweenPremiumExperience(props: ExperienceProps) {
  const m = readManor(props.data);
  return (
    <PremiumRoot data={props.data} mode={props.mode} slug="happy-halloween-premium" chipStyle={{ background: "rgba(11,10,20,.55)", color: "#F1EEFB", borderColor: "rgba(220,227,242,.25)" }}>
      <DayRoot
        day={day}
        data={props.data}
        className={MM_FONT_VARS}
        line={m.manorName}
        art={
          <div style={{ width: "100%", height: "100%", minHeight: 140, display: "grid", alignItems: "end" }}>
            <ManorSilhouette lit={0.8} />
          </div>
        }
      >
        <Manor {...props} />
      </DayRoot>
    </PremiumRoot>
  );
}

const ROOT_CSS = `
${UI_CSS}
/* backwards, not both: a transform animation still "in effect" would trap the fixed layers inside (lightbox, bat-hearts). */
.mm-scene { position: relative; z-index: 2; animation: mm-sceneIn .7s cubic-bezier(.22,1,.36,1) backwards; }
@keyframes mm-sceneIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
@keyframes mm-memIn { from { opacity: 0; filter: blur(6px); transform: translateY(8px); } to { opacity: 1; filter: none; transform: none; } }
.mm-dial { position: fixed; top: max(12px, env(safe-area-inset-top, 0px)); left: 50%; transform: translateX(-50%); z-index: 96; pointer-events: none;
  filter: drop-shadow(0 4px 10px rgba(0,0,0,.5)); }
.mm-gate::before { content: ""; position: absolute; inset: -10%; z-index: 1; pointer-events: none; opacity: .32;
  background: repeating-linear-gradient(104deg, transparent 0 22px, rgba(200,215,255,.5) 22px 23px, transparent 23px 46px);
  background-size: 140px 140px; animation: mm-gateRain .5s linear infinite; }
.mm-gate::after { content: ""; position: absolute; inset: 0; z-index: 1; pointer-events: none; opacity: 0;
  background: radial-gradient(80% 60% at 80% 10%, rgba(230,235,255,.55), transparent 70%); animation: mm-flashG 8s linear infinite 1.6s; }
.mm-gate.is-gentle::after { display: none; }
.mm-gate .pm-gateArt { width: min(330px, 78vw); aspect-ratio: 320 / 230; max-height: 34vh; }
.mm-gate .pm-gateName { font-family: var(--font-vw-script, 'Dancing Script'), cursive !important; color: #FFF4DA; }
.mm-gate .pm-gateKick { font-family: ${ENGRAVED}; color: #FFC86B; }
.mm-gate.is-opening .mm-sealWax { animation: mm-crack .5s ease-out forwards; }
@keyframes mm-crack { 0% { transform: scale(1); } 40% { transform: scale(1.15) rotate(-6deg); } 100% { transform: scale(.4) rotate(18deg); opacity: 0; } }
@keyframes mm-gateRain { from { background-position: 0 0; } to { background-position: -30px 140px; } }
@keyframes mm-flashG { 0%, 70%, 72.5%, 75%, 100% { opacity: 0; } 71% { opacity: .9; } 73.5% { opacity: .55; } }
@media (prefers-reduced-motion: reduce) {
  .mm-scene { animation: mm-fadeOnly .3s ease backwards; }
  .mm-gate::before, .mm-gate::after { animation: none; display: none; }
}
@keyframes mm-fadeOnly { from { opacity: 0; } to { opacity: 1; } }
`;
