"use client";

// ─── happy-promise-day-premium — "The Red Thread" ───────────────────────────
//
//   gate    near-black indigo, one red thread swaying down to their little
//           finger: "{gateLine}" — the tap starts the song and a warm hum
//   pull    drag down hand over hand; photos ride past on pegs
//   knot    the other end (the sender's hand) arrives; the knot cinches on
//           THE drop, the thread turns gold and writes "I promise"
//   rings   mini-game 1: draw the thread through gold rings (one promise each)
//   vow     the voice, the letter stitched in, a thumbprint seal (hold)
//   later   a promise for later sealed in a vial (hold), .ics reminder;
//           opens on the date
//   bound   the thread across the night (distance), "Do you promise too?"
//           (mini-game 2: pinky pendulum) → keepsake, P.S., write back
//
// Files: thread/{art, sfx, Pull, Knot, Rings, Vow, Later, Bound, css, shared}.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getDay } from "../../_valentine/days";
import type { PromiseExtrasPremium } from "../../_valentine/days/happy-promise-day-premium";
import { promiseDayPremium } from "../../_valentine/days/happy-promise-day-premium";
import { DayRoot, Sticker, useReducedMotion } from "../../_valentine/kit";
import { ParticleField, PremiumGate, PremiumRoot, SceneFade, SkipChip, usePremium, useScenes, type ParticlePreset } from "../../_valentine/kit/premium";
import type { ExperienceProps, ValentineDayData } from "../../_valentine/types";
import { GateThread, Hand, NightBackdrop, THREAD } from "./thread/art";
import Bound from "./thread/Bound";
import { THREAD_CSS } from "./thread/css";
import Knot from "./thread/Knot";
import Later from "./thread/Later";
import Pull from "./thread/Pull";
import Rings from "./thread/Rings";
import type { SceneProps } from "./thread/shared";
import { registerThreadCues } from "./thread/sfx";
import Vow from "./thread/Vow";

const SLUG = "happy-promise-day-premium" as const;
const ORDER = ["gate", "pull", "knot", "rings", "vow", "later", "bound"] as const;
type Scene = (typeof ORDER)[number];

function Scenes({ data, mode, react }: ExperienceProps) {
  const day = getDay(SLUG);
  const x = data.extras as PromiseExtrasPremium;
  const p = usePremium();
  const reduced = useReducedMotion();
  const sc = useScenes(ORDER);
  const [run, setRun] = useState(0);
  const [preset, setPreset] = useState<ParticlePreset>("dust");
  const timers = useRef<number[]>([]);
  useEffect(() => {
    registerThreadCues();
    const t = timers.current;
    return () => t.forEach(clearTimeout);
  }, []);
  const th = THREAD[x.threadColor] ?? THREAD.red;
  const promises = useMemo(() => {
    const l = (Array.isArray(x.promises) ? x.promises : []).map((s) => (typeof s === "string" ? s.trim() : "")).filter(Boolean).slice(0, 6);
    return l.length ? l : (promiseDayPremium.demo.extras.promises as string[]).slice(0, 5);
  }, [x.promises]);

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
    if (n === "later" && !(x.futurePromise || "").trim()) n = "bound";
    go(n);
  }, [sc.scene, go, x.futurePromise]);

  useEffect(() => {
    const s = sc.scene;
    setPreset(s === "rings" || s === "bound" ? "sparkles" : s === "later" ? "fireflies" : "dust");
  }, [sc.scene]);

  const onPeak = useCallback(() => {
    setPreset("embers");
    timers.current.push(window.setTimeout(() => setPreset("sparkles"), 3200));
  }, []);

  const props: SceneProps = {
    data: data as ValentineDayData<PromiseExtrasPremium>,
    x,
    promises,
    color: th.c,
    hi: th.hi,
    reduced,
    preview: mode === "preview",
    react,
    sfx: p.sfx,
    sticker,
    next,
  };
  const scene = sc.scene;
  const step = ORDER.indexOf(scene);

  return (
    <>
      <style>{THREAD_CSS}</style>
      <NightBackdrop scene={scene} />
      <ParticleField
        preset={preset}
        density={preset === "dust" ? 0.25 : 0.38}
        colors={preset === "embers" ? ["#FFE08A", "#F2C14E", "#FFB347"] : preset === "dust" ? ["rgba(255,236,210,.6)"] : preset === "fireflies" ? ["#FFF3C4", "#9DB4FF"] : ["#FFF1BF", "#F2C14E", "#ffffff"]}
        z={1}
      />
      {scene === "gate" && (
        <PremiumGate
          className="tp-gate"
          art={<GateThread color={th.c} hi={th.hi} />}
          kicker="There's a thread tied to the little finger of"
          subtitle={<span className="tp-gateSub">{x.gateLine || "Follow it."}</span>}
          sting="tp-hum"
          openLabel="Follow the thread"
          openMs={reduced ? 250 : 1100}
          bg="radial-gradient(120% 90% at 50% 10%, #22265A 0%, #0E1030 55%, #05061A 100%)"
          ink="#F7F1E8"
          accent={th.c}
          onOpen={({ quiet }) => {
            if (!quiet) p.sfx("tp-glint", { at: 0.4 });
            go("pull");
          }}
        />
      )}
      {scene !== "gate" && (
        <div className="tp-progress" aria-hidden>
          {ORDER.slice(1).map((s, k) => (
            <span key={s} className={k + 1 <= step ? "is-on" : ""} style={{ width: k + 1 === step ? 18 : 7, ["--tc" as string]: th.c }} />
          ))}
        </div>
      )}
      <SceneFade sceneKey={`${scene}-${run}`} className="tp-scene">
        {scene === "pull" && (
          <>
            <Pull {...props} />
            {p.repeatVisit && <SkipChip onSkip={() => go("knot")} label="Skip to the knot ▸" style={{ top: "calc(116px + env(safe-area-inset-top, 0px))" }} />}
          </>
        )}
        {scene === "knot" && <Knot {...props} onPeak={onPeak} />}
        {scene === "rings" && <Rings {...props} />}
        {scene === "vow" && <Vow {...props} />}
        {scene === "later" && <Later {...props} />}
        {scene === "bound" && (
          <Bound
            {...props}
            day={day}
            mode={mode}
            onReplay={() => {
              setRun((r) => r + 1);
              go("pull");
            }}
          />
        )}
      </SceneFade>
    </>
  );
}

export default function PromiseDayPremiumExperience(props: ExperienceProps) {
  const day = getDay(SLUG);
  const x = props.data.extras as PromiseExtrasPremium;
  const th = THREAD[x?.threadColor] ?? THREAD.red;
  return (
    <PremiumRoot data={props.data} mode={props.mode} slug={SLUG}>
      <DayRoot
        day={day}
        data={props.data}
        line={x?.bigPromise}
        art={
          <div style={{ position: "relative", height: "100%", aspectRatio: "0.9" }}>
            <Hand color={th.c} style={{ position: "absolute", left: "4%", bottom: 0, width: "44%" }} />
            <Hand color={th.c} flip style={{ position: "absolute", right: "4%", top: 0, width: "44%" }} />
          </div>
        }
      >
        <Scenes {...props} />
      </DayRoot>
    </PremiumRoot>
  );
}
