"use client";

// ─── Rose Day ✦ Premium — "The Glasshouse Rose" ──────────────────────────────────────────────────────────────
//
// "I am the one rose in all the world to someone." Chosen, tended, and kept.
//
//  0 gate      the glasshouse door, their name traced in the fog (PremiumGate: the tap starts the song)
//  1 fog       wipe the condensation off the glass (their name glows through it) → the door creaks open
//  2 inside    the camera dollies in: iron arches, god-rays, a bud on the potting bench, the opening line
//  3 thorns    pluck each thorn (a hard time) → "…and we got through it ✓"
//  4 bloom     hold to bloom → the garden blooms in a heart, the song drops on the final bloom   (WOW)
//  5 petals    catch the falling word-petals → the hidden sentence                               (mini-game 1)
//  6 book      the pressed book: the letter writes itself in ink beside a pressed rose
//  7 dew       dew-drop memories (the photos) + find the tiny dew drop's secret                   (mini-game 2)
//  8 eternal   the rose under an engraved glass dome; the gardener's note (voice), P.S., reply, keepsake
//
// Sound: PremiumRoot/gate/drop + 16 template cues (./glass/cues.ts) + kit cues. Music: ducks to 55 % for the
// thorns and the letter (where it can), full for the bloom; never paused.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DayRoot, Sticker, useReducedMotion } from "../../_valentine/kit";
import { Letterbox, ParticleField, PremiumGate, PremiumRoot, usePremium, type ParticlePreset } from "../../_valentine/kit/premium";
import { getDay } from "../../_valentine/days";
import type { ExperienceProps } from "../../_valentine/types";
import { GLASS_FONT_VARS } from "./glass/fonts";
import { registerGlassCues } from "./glass/cues";
import { GLASS_CSS } from "./glass/styles";
import { readGlass, SHADES } from "./glass/util";
import { Glasshouse } from "./glass/world";
import { DoorArt, Fog } from "./glass/Threshold";
import { Establishing, Thorns } from "./glass/Thorns";
import { Bloom } from "./glass/Bloom";
import { Petals } from "./glass/Petals";
import { Book } from "./glass/Book";
import { Dew } from "./glass/Dew";
import { Eternal } from "./glass/Eternal";

registerGlassCues();

const SLUG = "happy-rose-day-premium" as const;
type Scene = "gate" | "fog" | "inside" | "thorns" | "bloom" | "petals" | "book" | "dew" | "eternal";
const LETTERBOX = new Set<Scene>(["fog", "inside"]);
const DUCK = new Set<Scene>(["thorns", "book"]);

function House({ data, mode, react }: ExperienceProps) {
  const day = getDay(SLUG);
  const p = usePremium();
  const reduce = useReducedMotion();
  const g = useMemo(() => readGlass(data), [data]);
  const [scene, setScene] = useState<Scene>("gate");
  const [burst, setBurst] = useState(false);
  const [found, setFound] = useState(false);
  const [run, setRun] = useState(0);
  const { music, sfx } = p;
  const shade = SHADES[g.color];

  const go = useCallback((s: Scene) => {
    setScene(s);
    window.scrollTo({ top: 0 });
  }, []);

  // music: duck for the intimate scenes, full again for the rest (no-op where it can't fade)
  const musicRef = useRef(music);
  useEffect(() => {
    musicRef.current = music;
  });
  useEffect(() => {
    const m = musicRef.current;
    if (!m?.canFade || scene === "gate") return;
    m.fadeTo(DUCK.has(scene) ? 0.55 : 1, 1200);
  }, [scene]);

  // the glasshouse hush (bed), from the door to the dome
  const inside = scene !== "gate" && scene !== "fog";
  useEffect(() => {
    if (!inside) return;
    const h = sfx("gh-amb", { gain: 0.9 });
    return () => h.stop(1500);
  }, [inside, sfx]);

  const slot = (id: string) => day.gifSlots.find((s) => s.id === id)!;
  const sticker = (id: string, size: number) => <Sticker slug={day.slug} slot={slot(id)} value={data.gifs?.[id]} size={size} alt="" eager />;

  const particles: ParticlePreset | null =
    scene === "gate" || scene === "petals" ? null : scene === "eternal" ? "fireflies" : scene === "bloom" && burst ? "petals" : scene === "bloom" && g.count === 1 ? "fireflies" : "dust";

  const replay = () => {
    setBurst(false);
    setRun((r) => r + 1);
    go("inside");
  };

  return (
    <div className={`gh-root ${GLASS_FONT_VARS}`} style={{ ["--gh-bar" as string]: LETTERBOX.has(scene) ? "9vh" : "0px" }}>
      <style>{GLASS_CSS}</style>
      <Glasshouse dolly={scene === "gate" || scene === "fog" ? 1 : 0} night={scene === "eternal" ? 1 : scene === "dew" || scene === "book" ? 0.5 : 0} />
      {particles && (
        <ParticleField
          preset={particles}
          density={particles === "petals" ? 0.5 : 0.3}
          colors={particles === "petals" ? [shade.base, shade.light, shade.hi] : particles === "dust" ? ["rgba(255,236,200,.75)"] : undefined}
          z={1}
        />
      )}
      {!reduce && scene !== "gate" && <span className="gh-grain" aria-hidden />}
      <Letterbox show={LETTERBOX.has(scene)} />

      {scene === "gate" && (
        <PremiumGate
          art={<DoorArt to={g.to} sticker={sticker("pr1-door", 70)} />}
          kicker="Someone has been growing something for"
          subtitle={<span style={{ fontFamily: "var(--gh-serif)", fontStyle: "italic", fontSize: 18 }}>A glasshouse, at dusk · 🎧 sound on</span>}
          sting="chime-cascade"
          openLabel="Open the glasshouse"
          className={`gh-gate ${GLASS_FONT_VARS}`}
          bg="radial-gradient(90% 60% at 50% 20%, #6B4A3E 0%, #3A3330 50%, #1E2A27 100%)"
          ink="#FBF3E6"
          accent="#F4C27A"
          onOpen={() => {
            react("opened");
            go("fog");
          }}
        />
      )}

      <div key={`${run}-${scene}`} className="gh-fade gh-layer">
        {scene === "fog" && <Fog to={g.to} onClear={() => go("inside")} />}
        {scene === "inside" && <Establishing g={g} onDone={() => go(g.thorns.length ? "thorns" : "bloom")} />}
        {scene === "thorns" && <Thorns g={g} sticker={sticker("pr2-thorn", 84)} onDone={() => go("bloom")} />}
        {scene === "bloom" && <Bloom g={g} onBurst={() => setBurst(true)} onDone={() => go("petals")} />}
        {scene === "petals" && <Petals g={g} sticker={sticker("pr3-petals", 90)} onDone={() => go("book")} />}
        {scene === "book" && <Book g={g} letter={data.letter} sticker={sticker("pr4-letter", 80)} onDone={() => go("dew")} />}
        {scene === "dew" && <Dew g={g} photos={data.photos} sticker={sticker("pr5-memories", 72)} onFound={() => setFound(true)} onDone={() => go("eternal")} />}
        {scene === "eternal" && (
          <Eternal day={day} data={data} g={g} mode={mode} sticker={sticker("pr6-forever", 72)} onReplay={replay} onArrive={() => react("completed", { count: found ? 1 : 0 })} />
        )}
      </div>
    </div>
  );
}

export default function RoseDayPremiumExperience(props: ExperienceProps) {
  const day = getDay(SLUG);
  return (
    <PremiumRoot data={props.data} mode={props.mode} slug={SLUG}>
      <DayRoot day={day} data={props.data} layout="full" dark>
        <House {...props} />
      </DayRoot>
    </PremiumRoot>
  );
}
