"use client";

// ─── happy-chocolate-day-premium — "The Midnight Chocolatier" ───────────────
//
//   gate     a rainy shop door, sign "CLOSED · except for {name}" — the tap
//            flips it to OPEN, rings the bell and starts the song
//   lights   three pendant lamps flicker on; brass plate + note on the counter
//   make     tilt the copper pot to pour a heart → tap out the bubbles
//            (mini-game 1) → it tempers at 31 °C → turn it out (embossed)
//   crack    three taps with the gold hammer; the third is THE drop: the
//            shell shatters into Voronoi shards on the song's peak
//   truffles taste each truffle: lift, bite, a reason with its flavour
//   ticket   peel the wrapper of a bar → a golden ticket (a real promise)
//   letter   the first line piped in chocolate, the voice note, the recipe card
//   case     the lit display case: photos as labelled bonbons (montage)
//   box      pipe the word on the last bonbon (mini-game 2), pack, tie the bow
//   end      the line, the coupon, the sealed P.S., the reply, the certificate
//
// Files: atelier/{art, sfx, Shatter, Make, Crack, Truffles, Ticket, Letter, Case, Box, Ending, css}.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getDay } from "../../_valentine/days";
import type { ChocolateExtrasPremium, TruffleFlavour } from "../../_valentine/days/happy-chocolate-day-premium";
import { chocolateDayPremium } from "../../_valentine/days/happy-chocolate-day-premium";
import { DayRoot, Sticker, useReducedMotion } from "../../_valentine/kit";
import { ParticleField, PremiumGate, PremiumRoot, SceneFade, SkipChip, usePremium, useScenes, type ParticlePreset } from "../../_valentine/kit/premium";
import type { ExperienceProps, ValentineDayData } from "../../_valentine/types";
import { AtelierBackdrop, ShopDoor, Truffle, initials } from "./atelier/art";
import Box from "./atelier/Box";
import Case from "./atelier/Case";
import Crack from "./atelier/Crack";
import { ATELIER_CSS } from "./atelier/css";
import Ending from "./atelier/Ending";
import Letter from "./atelier/Letter";
import Make from "./atelier/Make";
import type { SceneProps, Truf } from "./atelier/shared";
import { registerAtelierCues } from "./atelier/sfx";
import Ticket from "./atelier/Ticket";
import Truffles from "./atelier/Truffles";

const SLUG = "happy-chocolate-day-premium" as const;
const ORDER = ["gate", "lights", "make", "crack", "truffles", "ticket", "letter", "case", "box", "end"] as const;
type Scene = (typeof ORDER)[number];
const FLAVOUR_KEYS: TruffleFlavour[] = ["hazelnut", "sea-salt", "raspberry", "gold-leaf", "pistachio", "rose", "heart"];

function Scenes({ data, mode, react }: ExperienceProps) {
  const day = getDay(SLUG);
  const x = data.extras as ChocolateExtrasPremium;
  const p = usePremium();
  const reduced = useReducedMotion();
  const sc = useScenes(ORDER);
  const [lit, setLit] = useState(0);
  const [tasted, setTasted] = useState(0);
  const [run, setRun] = useState(0);
  const [preset, setPreset] = useState<ParticlePreset>("dust");
  const beds = useRef<{ rain?: { stop: (ms?: number) => void }; room?: { stop: (ms?: number) => void } }>({});
  const timers = useRef<number[]>([]);
  useEffect(() => {
    registerAtelierCues();
    const t = timers.current;
    const b = beds.current;
    return () => {
      t.forEach(clearTimeout);
      b.rain?.stop(200);
      b.room?.stop(200);
    };
  }, []);

  const truffles: Truf[] = useMemo(() => {
    const given = (Array.isArray(x.reasons) ? x.reasons : [])
      .map((r) => ({ flavour: (FLAVOUR_KEYS.includes(r?.flavour) ? r.flavour : "hazelnut") as TruffleFlavour, reason: typeof r?.reason === "string" ? r.reason.trim() : "" }))
      .filter((r) => r.reason)
      .slice(0, 6);
    if (given.length >= 1) return given;
    return (chocolateDayPremium.demo.extras.reasons as Truf[]).slice(0, 4);
  }, [x.reasons]);
  const marks = useMemo(() => (x.embossNames === false ? [] : initials(data.recipientName, data.senderName)), [x.embossNames, data.recipientName, data.senderName]);
  const word = useMemo(() => {
    const w = (x.drizzleWord || data.petName || data.recipientName || "YOU").replace(/[^\p{L}\p{N}♥ ]/gu, "").trim();
    return (w || "YOU").slice(0, 6).toUpperCase();
  }, [x.drizzleWord, data.petName, data.recipientName]);

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
    if (n === "case" && !data.photos.some((ph) => ph?.url)) n = "box";
    go(n);
  }, [sc.scene, go, data.photos]);

  // Scene side-effects: beds, lamps, particles, ducking.
  useEffect(() => {
    const s = sc.scene;
    if (s === "lights") {
      setLit(0);
      [0, 1, 2].forEach((i) =>
        timers.current.push(
          window.setTimeout(() => {
            setLit(i + 1);
            p.sfx("choc-lamp", { pan: (i - 1) * 0.6, detune: i * 40 });
          }, reduced ? 50 : 350 + i * 520),
        ),
      );
      if (!beds.current.room) beds.current.room = p.sfx("choc-room");
    }
    if (s !== "gate" && s !== "lights") setLit(3);
    if (s === "make" || s === "crack") p.music?.fadeTo(0.6, 600);
    if (s === "truffles") setPreset("sparkles");
    if (s === "end") {
      setPreset("sparkles");
      beds.current.room?.stop(1500);
      beds.current.room = undefined;
    }
    if (s !== "gate" && s !== "lights" && beds.current.rain) {
      beds.current.rain.stop(1800);
      beds.current.rain = undefined;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sc.scene]);

  const completed = useRef(false);
  useEffect(() => {
    if (sc.scene !== "end" || completed.current) return;
    completed.current = true;
    react("completed", { count: tasted || truffles.length });
  }, [sc.scene, react, tasted, truffles.length]);

  const onPeak = useCallback(() => {
    setPreset("confetti");
    timers.current.push(window.setTimeout(() => setPreset("sparkles"), 2600));
  }, []);

  const props: SceneProps = {
    data: data as ValentineDayData<ChocolateExtrasPremium>,
    x,
    truffles,
    marks,
    word,
    reduced,
    preview: mode === "preview",
    sfx: p.sfx,
    sticker,
    next,
  };
  const step = ORDER.indexOf(sc.scene);
  const host = data.petName || data.senderName;

  return (
    <>
      <style>{ATELIER_CSS}</style>
      <AtelierBackdrop lit={sc.scene === "gate" ? 0 : lit} rain={!reduced} />
      <ParticleField
        preset={preset}
        density={preset === "dust" ? 0.3 : 0.4}
        colors={preset === "dust" ? ["rgba(255,214,170,.55)", "rgba(230,184,92,.45)"] : preset === "confetti" ? ["#E6B85C", "#C2185B", "#7B4A2E", "#FFE6A6", "#F3ECE4"] : ["#FFE6A6", "#E6B85C", "#fff"]}
        z={1}
      />

      {sc.scene === "gate" && (
        <PremiumGate
          className="mc-gate"
          art={<ShopDoor name={data.recipientName || "you"} />}
          kicker="After hours, a little shop opens for"
          subtitle={<span className="mc-gateSub">{data.senderName ? `${data.senderName}'s midnight atelier` : "A midnight chocolate atelier"}</span>}
          sting="choc-bell"
          openLabel="Flip the sign"
          openMs={reduced ? 250 : 1300}
          bg="radial-gradient(120% 90% at 50% 20%, #3a2140 0%, #1a1022 55%, #0c0710 100%)"
          ink="#FFF6EA"
          accent="#E6B85C"
          onOpen={({ quiet }) => {
            if (!quiet) beds.current.rain = p.sfx("choc-rain");
            go("lights");
          }}
        />
      )}

      {sc.scene !== "gate" && (
        <div className="mc-progress" aria-hidden>
          {ORDER.slice(1).map((s, k) => (
            <span key={s} className={k + 1 <= step ? "is-on" : ""} style={{ width: k + 1 === step ? 18 : 7 }} />
          ))}
        </div>
      )}

      <SceneFade sceneKey={`${sc.scene}-${run}`} className="mc-scene">
        {sc.scene === "lights" && (
          <section className="mc-sec mc-lightsSec">
            <div className={`mc-plate${lit >= 3 ? " is-on" : ""}`}>
              <small>Atelier</small>
              <b>{host || "Midnight"}</b>
              <i>est. tonight · for one</i>
            </div>
            <div className={`mc-note${lit >= 3 ? " is-on" : ""}`}>
              <span className="mc-notePin" aria-hidden />
              <p>{x.welcomeNote || "I kept the shop open late. Just for you."}</p>
              <i>— {data.senderName || "the chocolatier"}</i>
            </div>
            <div className={`mc-counterSet${lit >= 3 ? " is-on" : ""}`} aria-hidden>
              <Truffle flavour="gold-leaf" size={46} />
              <Truffle flavour="raspberry" size={38} />
              <Truffle flavour="pistachio" size={42} />
            </div>
            <span className="mc-stick">{lit >= 3 && sticker("pc1-open", 84)}</span>
            <div className="mc-actions">
              <button type="button" className="mc-btn" onClick={() => { p.sfx("whoosh", { gain: 0.5 }); next(); }} disabled={lit < 3 && !reduced}>
                {lit < 3 ? "The lights are coming on…" : "Put on the apron →"}
              </button>
            </div>
            {p.repeatVisit && <SkipChip onSkip={() => go("crack")} label="Skip to the smash ▸" />}
          </section>
        )}
        {sc.scene === "make" && <Make {...props} />}
        {sc.scene === "crack" && <Crack {...props} onPeak={onPeak} />}
        {sc.scene === "truffles" && <Truffles {...props} onTasted={setTasted} />}
        {sc.scene === "ticket" && <Ticket {...props} />}
        {sc.scene === "letter" && <Letter {...props} />}
        {sc.scene === "case" && <Case {...props} />}
        {sc.scene === "box" && <Box {...props} />}
        {sc.scene === "end" && (
          <Ending
            {...props}
            day={day}
            mode={mode}
            tasted={tasted}
            onReplay={() => {
              setRun((r) => r + 1);
              go("lights");
            }}
          />
        )}
      </SceneFade>
    </>
  );
}

export default function ChocolateDayPremiumExperience(props: ExperienceProps) {
  const day = getDay(SLUG);
  return (
    <PremiumRoot data={props.data} mode={props.mode} slug={SLUG}>
      <DayRoot
        day={day}
        data={props.data}
        line={(props.data.extras as ChocolateExtrasPremium)?.welcomeNote}
        art={
          <div style={{ position: "relative", height: "100%", aspectRatio: "1.2", display: "grid", placeItems: "center" }}>
            <Truffle flavour="heart" size="46%" style={{ position: "absolute", left: "27%", top: "6%" }} />
            <Truffle flavour="gold-leaf" size="30%" style={{ position: "absolute", left: "4%", bottom: "8%" }} />
            <Truffle flavour="pistachio" size="28%" style={{ position: "absolute", right: "6%", bottom: "12%" }} />
          </div>
        }
      >
        <Scenes {...props} />
      </DayRoot>
    </PremiumRoot>
  );
}
