"use client";

// ─── happy-teddy-day-premium — "Made With a Heart" ──────────────────────────
//
//   gate      a parcel on the doorstep: "Contents: 1 teddy (unfinished)" — the
//             tap slips the twine, the flaps open, the song starts
//   workshop  the toy workshop after hours: the flat teddy skin + its tag
//   stuff     crank the brass wheel (circular drag) → he fills out
//   heart     the heart ceremony: warm it, cheek, ear (it whispers), kiss
//   stitch    the heart goes in, sew 5 stitches → THE drop: he wakes up,
//             first words, then press his paw (the voice note)
//   torch     lights out: read the letter by torchlight (paint-reveal)
//   stars     the star lamp: photos as moons on the ceiling (drag to turn)
//   seek      hide and seek under three pillows (mini-game 2)
//   tuck      pull the blanket up, goodnight whisper, squish him
//   end       birth certificate, sealed P.S., write back
//
// Files: workshop/{art, sfx, Make, Heart, Night, Ending, css, shared}.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getDay } from "../../_valentine/days";
import type { TeddyAccessory, TeddyExtrasPremium, TeddyEyes, TeddyFur } from "../../_valentine/days/happy-teddy-day-premium";
import { teddyDayPremium } from "../../_valentine/days/happy-teddy-day-premium";
import { DayRoot, Sticker, useReducedMotion } from "../../_valentine/kit";
import { ParticleField, PremiumGate, PremiumRoot, SceneFade, SkipChip, usePremium, useScenes, type ParticlePreset } from "../../_valentine/kit/premium";
import type { ExperienceProps, ValentineDayData } from "../../_valentine/types";
import { Backdrop, Parcel, Teddy } from "./workshop/art";
import { TEDDY_CSS } from "./workshop/css";
import Ending from "./workshop/Ending";
import { Ceremony, Stitch } from "./workshop/Heart";
import { Stuff, Workshop } from "./workshop/Make";
import { Seek, Stars, Torch, Tuck } from "./workshop/Night";
import type { SceneProps } from "./workshop/shared";
import { registerWorkshopCues } from "./workshop/sfx";

const SLUG = "happy-teddy-day-premium" as const;
const ORDER = ["gate", "workshop", "stuff", "heart", "stitch", "torch", "stars", "seek", "tuck", "end"] as const;
type Scene = (typeof ORDER)[number];
const FURS: TeddyFur[] = ["honey", "cocoa", "pink", "white", "lilac", "mint"];
const EYES: TeddyEyes[] = ["button", "sparkle", "sleepy", "heart"];
const ACCS: TeddyAccessory[] = ["none", "bow", "scarf", "bowtie", "flower", "sweater", "glasses"];

function Scenes({ data, mode, react }: ExperienceProps) {
  const day = getDay(SLUG);
  const x = data.extras as TeddyExtrasPremium;
  const p = usePremium();
  const reduced = useReducedMotion();
  const sc = useScenes(ORDER);
  const [fluff, setFluff] = useState(0);
  const [dim, setDim] = useState(0);
  const [run, setRun] = useState(0);
  const [preset, setPreset] = useState<ParticlePreset>("dust");
  const squishes = useRef(0);
  const [squishN, setSquishN] = useState(0);
  const beds = useRef<{ crickets?: { stop: (ms?: number) => void }; clock?: { stop: (ms?: number) => void } }>({});
  const timers = useRef<number[]>([]);
  useEffect(() => {
    registerWorkshopCues();
    const t = timers.current;
    const b = beds.current;
    return () => {
      t.forEach(clearTimeout);
      b.crickets?.stop(200);
      b.clock?.stop(200);
    };
  }, []);

  const name = (x.teddyName || "").trim() || "your teddy";
  const lines = useMemo(() => {
    const l = (Array.isArray(x.squeezeLines) ? x.squeezeLines : []).map((s) => (typeof s === "string" ? s.trim() : "")).filter(Boolean);
    return l.length ? l : (teddyDayPremium.demo.extras.squeezeLines as string[]);
  }, [x.squeezeLines]);
  const look = useMemo(
    () => ({
      fur: (FURS.includes(x.furColor) ? x.furColor : "honey") as TeddyFur,
      eyes: (EYES.includes(x.eyeStyle) ? x.eyeStyle : "sparkle") as TeddyEyes,
      accessory: (ACCS.includes(x.accessory) ? x.accessory : "scarf") as TeddyAccessory,
      initial: (x.pawInitial || "").trim().slice(0, 2).toUpperCase(),
    }),
    [x.furColor, x.eyeStyle, x.accessory, x.pawInitial],
  );

  const sticker = useCallback(
    (id: string, px: number) => {
      const slot = day.gifSlots.find((g) => g.id === id);
      return slot ? <Sticker slug={SLUG} slot={slot} value={data.gifs[slot.id]} size={px} /> : null;
    },
    [day, data.gifs],
  );
  const go = useCallback(
    (s: Scene) => {
      sc.go(s);
      window.scrollTo({ top: 0, behavior: "auto" });
    },
    [sc],
  );
  const next = useCallback(() => {
    const i = ORDER.indexOf(sc.scene);
    let n = ORDER[Math.min(ORDER.length - 1, i + 1)];
    if (n === "stars" && !data.photos.some((ph) => ph?.url)) n = "seek";
    go(n);
  }, [sc.scene, go, data.photos]);

  useEffect(() => {
    const s = sc.scene;
    const inWorkshop = s === "workshop" || s === "stuff" || s === "heart" || s === "stitch";
    if (s !== "gate" && beds.current.crickets) {
      beds.current.crickets.stop(1500);
      beds.current.crickets = undefined;
    }
    if (inWorkshop && !beds.current.clock) beds.current.clock = p.sfx("td-clock", { gain: 0.6 });
    if (!inWorkshop && beds.current.clock) {
      beds.current.clock.stop(600);
      beds.current.clock = undefined;
    }
    if (s === "torch") setPreset("fireflies");
    if (s === "stars" || s === "seek") setPreset("sparkles");
    if (s === "tuck") setPreset("fireflies");
    if (s === "workshop") setDim(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sc.scene]);

  const completed = useRef(false);
  useEffect(() => {
    if (sc.scene !== "end" || completed.current) return;
    completed.current = true;
    react("completed", { count: squishes.current });
  }, [sc.scene, react]);

  const onPeak = useCallback(() => {
    setPreset("snowhearts");
    timers.current.push(window.setTimeout(() => setPreset("dust"), 4000));
  }, []);

  const props: SceneProps = {
    data: data as ValentineDayData<TeddyExtrasPremium>,
    x,
    name,
    lines,
    look,
    fluff,
    setFluff,
    reduced,
    preview: mode === "preview",
    sfx: p.sfx,
    sticker,
    next,
  };
  const scene = sc.scene;
  const world = scene === "gate" ? "porch" : scene === "workshop" || scene === "stuff" || scene === "heart" || scene === "stitch" ? "workshop" : "bedroom";
  const step = ORDER.indexOf(scene);
  const weather = x.sleepOver === "snow" || x.sleepOver === "stars" ? x.sleepOver : "rain";

  return (
    <>
      <style>{TEDDY_CSS}</style>
      <Backdrop world={world} weather={reduced ? "stars" : weather} dim={dim} />
      <ParticleField
        preset={preset}
        density={preset === "dust" ? 0.25 : 0.35}
        colors={preset === "dust" ? ["rgba(255,226,180,.55)"] : preset === "snowhearts" ? ["#FF8FB8", "#FFE6F0", "#FFFFFF"] : preset === "fireflies" ? ["#FFF3C4", "#FFE08A"] : undefined}
        z={1}
      />
      {scene === "gate" && (
        <PremiumGate
          className="td-gate"
          art={<Parcel name={data.recipientName || "you"} />}
          kicker="A parcel on the doorstep for"
          subtitle={<span className="td-gateSub">Handle with love{data.senderName ? ` · from ${data.senderName}` : ""}</span>}
          sting="td-twine"
          openLabel="Pull the twine"
          openMs={reduced ? 250 : 1250}
          bg="radial-gradient(120% 90% at 50% 10%, #3A3360 0%, #1E2340 55%, #10132A 100%)"
          ink="#FFF8F0"
          accent="#FF8FB8"
          onOpen={({ quiet }) => {
            if (!quiet) {
              p.sfx("td-flap", { at: 0.1 });
              beds.current.crickets = p.sfx("td-crickets", { gain: 0.7 });
            }
            go("workshop");
          }}
        />
      )}
      {scene !== "gate" && (
        <div className="td-progress" aria-hidden>
          {ORDER.slice(1).map((s, k) => (
            <span key={s} className={k + 1 <= step ? "is-on" : ""} style={{ width: k + 1 === step ? 18 : 7 }} />
          ))}
        </div>
      )}
      <SceneFade sceneKey={`${scene}-${run}`} className="td-scene">
        {scene === "workshop" && (
          <>
            <Workshop {...props} />
            {p.repeatVisit && <SkipChip onSkip={() => { setFluff(1); go("stitch"); }} label="Skip to the wake-up ▸" />}
          </>
        )}
        {scene === "stuff" && <Stuff {...props} />}
        {scene === "heart" && <Ceremony {...props} />}
        {scene === "stitch" && <Stitch {...props} onPeak={onPeak} />}
        {scene === "torch" && <Torch {...props} />}
        {scene === "stars" && <Stars {...props} />}
        {scene === "seek" && <Seek {...props} />}
        {scene === "tuck" && (
          <Tuck
            {...props}
            onDim={setDim}
            onSquish={() => {
              squishes.current += 1;
              setSquishN(squishes.current);
              return squishes.current;
            }}
          />
        )}
        {scene === "end" && (
          <Ending
            {...props}
            day={day}
            mode={mode}
            squishes={squishN}
            onReplay={() => {
              setRun((r) => r + 1);
              setFluff(0);
              go("workshop");
            }}
          />
        )}
      </SceneFade>
    </>
  );
}

export default function TeddyDayPremiumExperience(props: ExperienceProps) {
  const day = getDay(SLUG);
  const x = props.data.extras as TeddyExtrasPremium;
  return (
    <PremiumRoot data={props.data} mode={props.mode} slug={SLUG}>
      <DayRoot
        day={day}
        data={props.data}
        line={x?.heartWhisper}
        art={
          <div style={{ height: "100%", aspectRatio: "0.8", display: "grid", placeItems: "center" }}>
            <Teddy fur={FURS.includes(x?.furColor) ? x.furColor : "honey"} eyes={EYES.includes(x?.eyeStyle) ? x.eyeStyle : "sparkle"} accessory={ACCS.includes(x?.accessory) ? x.accessory : "scarf"} initial={(x?.pawInitial || "").slice(0, 2)} style={{ width: "100%", height: "100%" }} />
          </div>
        }
      >
        <Scenes {...props} />
      </DayRoot>
    </PremiumRoot>
  );
}
