"use client";

// ─── Propose Day ✦ Premium — "Look Up" ────────────────────────────────────────────────────────────────────────
//
// A private rooftop at night above a glittering city. "Someone moved the sky for me."
//
//  0 gate      their nervous texts arrive in a phone; "Reply 👀" (PremiumGate) starts the song
//  1 rooftop   letterboxed establishing shot — "For {name}."
//  2 candles   strike the match, light a candle per reason; the rooftop warms with every flame
//  3 city      switch on the memory windows in the skyline; each pushes in to a photo with a neon caption
//  4 lookup    "Now… look up." — ~600 drones: initials → heart → ring box → it opens → the question ON THE DROP
//  5 ring      drag the ring onto their own finger = YES; "Let me think 🙈" runs away (noDodges)   (mini-game 1)
//  6 yes       the drones write "{NAME} SAID YES", the city lights up, the chat, voice, reply;
//              find the pink drone (mini-game 2)
//  7 finale    the speech letter + the front-row ticket keepsake (tear the stub) + ending actions
//
// Persistent world (fixed): night sky · skyline (tilts down while you look up) · drone canvas (scenes 4–6) ·
// rooftop foreground. Sound: PremiumRoot/gate/drop + 15 template cues (./sky/cues.ts) + kit cues.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DayRoot, Sticker, useReducedMotion } from "../../_valentine/kit";
import { Letterbox, ParticleField, PremiumGate, PremiumRoot, usePremium } from "../../_valentine/kit/premium";
import { getDay } from "../../_valentine/days";
import type { ExperienceProps } from "../../_valentine/types";
import { SKY_FONT_VARS } from "./sky/fonts";
import { registerSkyCues } from "./sky/cues";
import { SKY_CSS } from "./sky/styles";
import { readSky } from "./sky/util";
import { NightSky, Rooftop, Skyline, type MemWindow } from "./sky/world";
import DroneSky, { type Formation } from "./sky/DroneSky";
import { Candles, Establishing, GateChat } from "./sky/Rooftop";
import { City, MemoryPush } from "./sky/City";
import { LookUp } from "./sky/LookUp";
import { RingScene } from "./sky/RingScene";
import { Yes } from "./sky/Yes";
import { Finale } from "./sky/Finale";

registerSkyCues();

const SLUG = "happy-propose-day-premium" as const;
type Scene = "gate" | "rooftop" | "candles" | "city" | "lookup" | "ring" | "yes" | "finale";
const DRONES = new Set<Scene>(["lookup", "ring", "yes"]);

function Show({ data, mode, react }: ExperienceProps) {
  const day = getDay(SLUG);
  const p = usePremium();
  const reduce = useReducedMotion();
  const sky = useMemo(() => readSky(data), [data]);
  const [scene, setScene] = useState<Scene>("gate");
  const [warm, setWarm] = useState(0);
  const [memLit, setMemLit] = useState<boolean[]>(() => sky.memories.map(() => false));
  const [open, setOpen] = useState<number | null>(null);
  const [tour, setTour] = useState(false);
  const [formation, setFormation] = useState<Formation | null>(null);
  const [hush, setHush] = useState(false);
  const [dodges, setDodges] = useState(0);
  const [pinkPos, setPinkPos] = useState<{ x: number; y: number } | null>(null);
  const [at, setAt] = useState(() => new Date());
  const [run, setRun] = useState(0);
  const { music, sfx } = p;

  const go = useCallback((s: Scene) => {
    setScene(s);
    window.scrollTo({ top: 0 });
  }, []);

  // music script: soft under the rooftop, 70 % in the city; the look-up hush + the drop live in LookUp
  const musicRef = useRef(music);
  useEffect(() => {
    musicRef.current = music;
  });
  useEffect(() => {
    const m = musicRef.current;
    if (!m?.canFade) return;
    if (scene === "rooftop" || scene === "candles") m.fadeTo(0.8, 1200);
    if (scene === "city") m.fadeTo(0.7, 1200);
  }, [scene]);

  const openMem = useCallback(
    (i: number | null) => {
      setOpen(i);
      if (i === null) return;
      setMemLit((l) => l.map((v, k) => (k === i ? true : v)));
      sfx("sky-click");
      sfx("sky-hum", { at: 0.15 });
    },
    [sfx, setOpen, setMemLit],
  );
  const windows: MemWindow[] | undefined =
    scene === "city" || scene === "yes" || scene === "finale"
      ? sky.memories.map((m, i) => ({ id: i, lit: scene !== "city" || memLit[i], label: m.what || `memory ${i + 1}`, onTap: () => (scene === "city" ? openMem(i) : undefined) }))
      : undefined;

  // where the drones fly, per scene
  const region: [number, number] = scene === "ring" ? [0.05, 0.22] : scene === "yes" ? [0.07, 0.42] : [0.1, 0.56];

  const tilt = scene === "lookup" || scene === "ring" ? 18 : 0;
  const roofDown = scene === "lookup" || scene === "ring" || scene === "yes" ? 32 : scene === "city" ? 12 : scene === "finale" ? 40 : 0;
  const slot = (id: string) => day.gifSlots.find((g) => g.id === id)!;
  const sticker = (id: string, size: number) => <Sticker slug={day.slug} slot={slot(id)} value={data.gifs?.[id]} size={size} alt="" eager />;

  const replay = () => {
    setRun((r) => r + 1);
    setWarm(0);
    setMemLit(sky.memories.map(() => false));
    setFormation(null);
    setDodges(0);
    setPinkPos(null);
    go("rooftop");
  };

  return (
    <div className={`sk-root ${SKY_FONT_VARS}`} style={{ ["--sk-bar" as string]: scene === "rooftop" || scene === "lookup" ? "9vh" : "0px" }}>
      <style>{SKY_CSS}</style>
      <NightSky seed={sky.to + sky.from} show={DRONES.has(scene)} />
      <Skyline seed={sky.to + sky.from} tilt={tilt} wave={scene === "yes" || scene === "finale"} windows={windows} hint={scene === "city"} />
      <span className={`sk-hush${hush ? " is-on" : ""}`} aria-hidden />
      {DRONES.has(scene) && (
        <DroneSky
          formation={formation}
          region={region}
          dim={scene === "ring" ? 0.55 : 1}
          reduce={reduce}
          onPinkPos={setPinkPos}
          onBeat={() => scene === "yes" && sfx("heartbeat", { gain: 0.5 })}
        />
      )}
      <span className="sk-warm" style={{ ["--warm" as string]: scene === "candles" ? warm : scene === "rooftop" ? 0.15 : 0 }} aria-hidden />
      <Rooftop down={roofDown} warm={scene === "candles" ? warm : 0.2} />
      {(scene === "rooftop" || scene === "candles" || scene === "city") && <ParticleField preset="dust" density={0.25} colors={["rgba(255,214,150,.7)", "rgba(200,210,255,.5)"]} z={3} />}
      {!reduce && scene !== "gate" && <span className="sk-grain" aria-hidden />}
      <Letterbox show={scene === "rooftop" || (scene === "lookup" && hush)} />

      {scene === "gate" && (
        <PremiumGate
          art={<GateChat sky={sky} sticker={sticker("pp1-nervous", 64)} />}
          kicker="New messages for"
          subtitle={<span style={{ fontFamily: "var(--sk-display)", letterSpacing: ".2em", textTransform: "uppercase", fontSize: 12, opacity: 0.8 }}>🎧 Sound on · then reply</span>}
          sting="sky-pop"
          openLabel="Reply 👀"
          className={`sk-gate ${SKY_FONT_VARS}`}
          bg="linear-gradient(180deg, #060918 0%, #0B1026 50%, #1C1F4A 100%)"
          ink="#F4F8FF"
          accent="#FFD27A"
          onOpen={() => {
            sfx("whoosh", { gain: 0.6 });
            go("rooftop");
          }}
        />
      )}

      <div key={`${run}-${scene}`} className="sk-fade sk-layer">
        {scene === "rooftop" && <Establishing to={sky.to} onDone={() => go("candles")} />}
        {scene === "candles" && <Candles sky={sky} sticker={sticker("pp2-candles", 84)} onWarm={setWarm} onDone={() => go("city")} />}
        {scene === "city" && <City sky={sky} lit={memLit} open={open} setOpen={openMem} tour={tour} setTour={setTour} onDone={() => { setOpen(null); setTour(false); go("lookup"); }} />}
        {scene === "lookup" && <LookUp sky={sky} sticker={sticker("pp3-lookup", 80)} setFormation={setFormation} setHush={setHush} onDone={() => { setFormation({ kind: "text", text: sky.question, color: "#FFFFFF", maxLines: 3 }); go("ring"); }} />}
        {scene === "ring" && (
          <RingScene
            sky={sky}
            sticker={sticker("pp4-please", 72)}
            onYes={(d) => {
              setDodges(d);
              setAt(new Date());
              react("answered", { noDodges: d });
              setFormation({ kind: "yes", name: sky.to, stone: "#FF5C8A" });
              go("yes");
            }}
          />
        )}
        {scene === "yes" && <Yes sky={sky} sticker={sticker("pp5-yes", 96)} pinkPos={pinkPos} dodges={dodges} onDone={() => go("finale")} />}
        {scene === "finale" && <Finale day={day} data={data} sky={sky} dodges={dodges} at={at} mode={mode} sticker={sticker("pp6-ticket", 80)} onReplay={replay} onArrive={() => react("completed")} />}
      </div>
      {scene === "city" && open !== null && (
        <MemoryPush
          sky={sky}
          open={open}
          onClose={() => { setTour(false); setOpen(null); }}
          onNext={memLit.some((v) => !v) ? () => openMem(memLit.findIndex((v) => !v)) : null}
        />
      )}
    </div>
  );
}

export default function ProposeDayPremiumExperience(props: ExperienceProps) {
  const day = getDay(SLUG);
  return (
    <PremiumRoot data={props.data} mode={props.mode} slug={SLUG}>
      <DayRoot day={day} data={props.data} layout="full" dark>
        <Show {...props} />
      </DayRoot>
    </PremiumRoot>
  );
}
