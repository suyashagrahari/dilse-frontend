"use client";

// ─── Valentine's Day ✦ Premium — "Be My Valentine Carnival" (the flagship of the premium tier) ───────────────────
//
// A bright pastel funfair built for her (research-v3 §D8). One cute game per stall, each ending in an "aww" beat
// (sound + heart burst + haptic) and a couple-sticker GIF reacting to what she just did.
//
//  gate      her ADMIT ONE ticket: drag the stub to tear it → the curtains part, the song starts
//  1 balloons pop 8 heart balloons; each drops a word of his line into place
//  2 meter    the love tester: hold her thumb on it → 100% → 999% → the glass cracks, his joke on the screen
//  3 gacha    turn the knob (circular drag / tap) → 4 capsules → twist each open: a prize polaroid of them
//  4 wheel    the Ferris wheel of us: her photos ride the cabins; tap one to peek inside
//  5 cans     knock down the week: 7 cans (Rose → Kiss), each one his line for that day → "…and today, it's you"
//  6 letter   the kissing-booth mailbox → envelope → wax seal → the letter types itself     (skipped if empty)
//  7 radio    his voice note on the carnival radio (or tune the dial: his note types out)  (skipped if nothing)
//  8 question "Will you be my Valentine?" — No hides behind stickers, shrinks, turns into a second Yes. On YES:
//             drop() → on the chorus the wheel lights up with her photos, heart fireworks, confetti, a GIF wall
//  9 exit     ticket stub + photobooth strip (save as PNG), week recap, the sealed P.S., wishing wall, ride again
//
// Next appears when the stall's interaction lands, or after a while so nobody is stuck; from the 2nd stall she can
// skip ahead. Repeat visit: the progress hearts become a map. react("answered") on YES, react("completed") at exit.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DayRoot } from "../../_valentine/kit";
import { PremiumRoot, SceneFade, usePremium } from "../../_valentine/kit/premium";
import { getDay } from "../../_valentine/days";
import type { ExperienceProps } from "../../_valentine/types";
import { CARNIVAL_FONT_VARS } from "./carnival/fonts";
import { GIF, readCarnival } from "./carnival/model";
import { CARNIVAL_CSS } from "./carnival/styles";
import { Gif, StallCtx, ensureCarnivalCues, type StallApi } from "./carnival/ui";
import Gate, { Bunting } from "./carnival/Gate";
import Balloons from "./carnival/Balloons";
import LoveMeter from "./carnival/LoveMeter";
import Gacha from "./carnival/Gacha";
import FerrisWheel from "./carnival/FerrisWheel";
import Cans from "./carnival/Cans";
import Letter from "./carnival/Letter";
import Radio from "./carnival/Radio";
import Question from "./carnival/Question";
import Keepsake from "./carnival/Keepsake";

const SLUG = "happy-valentines-day-premium" as const;
type StallId = "balloons" | "meter" | "gacha" | "wheel" | "cans" | "letter" | "radio" | "question" | "exit";

const NAME: Record<StallId, string> = {
  balloons: "Balloon pop", meter: "Love tester", gacha: "Gacha machine", wheel: "Ferris wheel", cans: "Prize stall",
  letter: "Kissing booth", radio: "Carnival radio", question: "The big question", exit: "Gift shop",
};
const NEXT_LABEL: Partial<Record<StallId, string>> = {
  balloons: "Next stall →", meter: "Next stall →", gacha: "To the Ferris wheel →", wheel: "Next stall →", cans: "Keep walking →",
  letter: "Keep walking →", radio: "To the last stall 💍", question: "Get my ticket stub 🎟",
};
/** Never stuck: Next appears after this long even if the game wasn't finished. */
const AUTO_READY: Partial<Record<StallId, number>> = { balloons: 20000, meter: 16000, gacha: 24000, wheel: 18000, cans: 24000, letter: 14000, radio: 9000 };

function Story({ data, react }: ExperienceProps) {
  const day = getDay(SLUG);
  const p = usePremium();
  const { sfx, music, premium } = p;
  const c = useMemo(() => readCarnival(day, data, music?.title), [day, data, music?.title]);
  const [opened, setOpened] = useState(p.opened);
  const [run, setRun] = useState(0);
  useEffect(ensureCarnivalCues, []);

  const order = useMemo(() => {
    const o: StallId[] = ["balloons", "meter", "gacha", "wheel", "cans"];
    if (data.letter.trim()) o.push("letter");
    if (premium.voiceNote || premium.voiceCaption.trim() || c.songNote) o.push("radio");
    o.push("question", "exit");
    return o;
  }, [data.letter, premium.voiceNote, premium.voiceCaption, c.songNote]);

  const [idx, setIdx] = useState(0);
  const [doneSet, setDoneSet] = useState<Record<string, boolean>>({});
  const [skipOn, setSkipOn] = useState(false);
  const stall = order[Math.min(idx, order.length - 1)];
  const key = `${run}-${stall}`;
  const isDone = !!doneSet[key];

  const done = useCallback(() => setDoneSet((r) => (r[key] ? r : { ...r, [key]: true })), [key]);
  useEffect(() => {
    if (!opened) return;
    const ms = AUTO_READY[stall];
    const t1 = ms ? window.setTimeout(done, ms) : 0;
    const t2 = window.setTimeout(() => setSkipOn(true), 3500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      setSkipOn(false);
    };
  }, [stall, done, opened, run]);

  const go = useCallback(
    (i: number) => {
      setIdx(Math.max(0, Math.min(order.length - 1, i)));
      sfx("swoosh-soft", { gain: 0.45 });
      window.scrollTo({ top: 0 });
    },
    [order.length, sfx],
  );
  const next = useCallback(() => go(idx + 1), [go, idx]);

  // The song dips under the letter and the voice note manages itself; everywhere else it plays full.
  const musicRef = useRef(music);
  useEffect(() => {
    musicRef.current = music;
  });
  useEffect(() => {
    const m = musicRef.current;
    if (!opened || !m?.canFade) return;
    if (stall === "letter") m.fadeTo(0.55, 1200);
    else if (stall !== "radio" && stall !== "question") m.fadeTo(stall === "exit" ? 0.75 : 1, 1200);
  }, [stall, opened]);

  const replay = () => {
    setRun((r) => r + 1);
    setDoneSet({});
    setIdx(0);
    sfx("whoosh", { gain: 0.5 });
    window.scrollTo({ top: 0 });
  };

  const api: StallApi = { c, data, day, done, isDone, sfx: sfx as StallApi["sfx"], index: idx };

  const render = () => {
    switch (stall) {
      case "balloons": return <Balloons />;
      case "meter": return <LoveMeter />;
      case "gacha": return <Gacha />;
      case "wheel": return <FerrisWheel />;
      case "cans": return <Cans />;
      case "letter": return <Letter letter={data.letter} />;
      case "radio": return <Radio />;
      case "question": return <Question onAnswer={(noDodges) => react("answered", { noDodges })} />;
      case "exit": return <Keepsake onComplete={() => react("completed")} onReplay={replay} />;
    }
  };

  const showNext = opened && isDone && stall !== "exit";
  const showSkip = opened && !isDone && skipOn && idx >= 1 && stall !== "question" && stall !== "exit";

  return (
    <StallCtx.Provider value={api}>
      <div className={`vc-root ${CARNIVAL_FONT_VARS}`}>
        <style>{CARNIVAL_CSS}</style>
        <Fairground />

        {!opened && <Gate c={c} onOpen={() => setOpened(true)} />}

        {opened && (
          <div className={`vc-stage is-${stall}`}>
            <nav className={`vc-dots${p.repeatVisit ? " is-map" : ""}`} aria-label="The carnival map">
              {order.map((s, i) =>
                p.repeatVisit ? (
                  <button key={s} type="button" className={`vc-dot${i < idx ? " is-past" : ""}${i === idx ? " is-now" : ""}`} onClick={() => go(i)} aria-label={`Go to ${NAME[s]}`} aria-current={i === idx ? "step" : undefined} />
                ) : (
                  <span key={s} className={`vc-dot${i < idx ? " is-past" : ""}${i === idx ? " is-now" : ""}`} aria-label={i === idx ? `${NAME[s]}, stall ${i + 1} of ${order.length}` : undefined} />
                ),
              )}
            </nav>
            <SceneFade sceneKey={key} duration={0.45} className="vc-sceneWrap">
              {/* Each stall gets its own context value, so a stall still fading out keeps ITS done(), never the
                  next stall's (an exiting Balloons used to mark the meter as done). */}
              <StallCtx.Provider value={api}>{render()}</StallCtx.Provider>
            </SceneFade>
            <div className="vc-foot">
              {showNext && (
                <button type="button" className="vc-puffy is-cherry vc-next" key={key} onClick={next}>
                  {NEXT_LABEL[stall] ?? "Next →"}
                </button>
              )}
              {showSkip && (
                <button type="button" className="vc-skip" onClick={next}>
                  Skip this stall ▸
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </StallCtx.Provider>
  );
}

/** The fair around the stage: soft blobs and floating hearts everywhere; from 768 px a wheel, a tent, balloons and
 *  a few couple stickers live in the side space around the centred phone-like stage. */
function Fairground() {
  return (
    <div className="vc-fair" aria-hidden>
      <i className="vc-blob is-a" />
      <i className="vc-blob is-b" />
      <i className="vc-blob is-c" />
      <Bunting className="vc-fairBunting" />
      <div className="vc-floaters">
        {Array.from({ length: 9 }, (_, i) => (
          <i key={i} style={{ ["--x" as string]: `${(i * 37) % 100}%`, ["--d" as string]: `${(i * 1.7) % 9}s`, ["--s" as string]: `${12 + ((i * 5) % 12)}px` }}>
            {i % 3 === 0 ? "♥" : i % 3 === 1 ? "✦" : "♡"}
          </i>
        ))}
      </div>
      <div className="vc-side is-left">
        <svg className="vc-sideWheel" viewBox="0 0 200 220">
          <g className="vc-sideSpin">
            <circle cx="100" cy="100" r="80" fill="none" stroke="#FF8FAB" strokeWidth="5" />
            {Array.from({ length: 8 }, (_, i) => {
              const a = (i / 8) * Math.PI * 2;
              return (
                <g key={i}>
                  <line x1="100" y1="100" x2={100 + 80 * Math.cos(a)} y2={100 + 80 * Math.sin(a)} stroke="#FFB3C6" strokeWidth="3" />
                  <circle cx={100 + 80 * Math.cos(a)} cy={100 + 80 * Math.sin(a)} r="11" fill={["#FF4D6D", "#FFD166", "#B9A7FF", "#7FD8BE"][i % 4]} />
                </g>
              );
            })}
          </g>
          <path d="M100 100 L60 214 M100 100 L140 214" stroke="#FF8FAB" strokeWidth="6" strokeLinecap="round" />
        </svg>
        <Gif src={GIF.penguinsHappy} size={120} tilt={-6} float className="vc-sideGif" />
      </div>
      <div className="vc-side is-right">
        <svg className="vc-tent" viewBox="0 0 200 170">
          <path d="M100 6 L190 70 L10 70 Z" fill="#FF4D6D" />
          <path d="M100 6 L130 70 L70 70 Z" fill="#FFF" fillOpacity=".9" />
          <rect x="22" y="70" width="156" height="94" rx="6" fill="#FFF0F3" />
          {Array.from({ length: 6 }, (_, i) => <rect key={i} x={22 + i * 26} y="70" width="13" height="94" fill="#FFB3C6" />)}
          <path d="M80 164 L80 112 Q100 92 120 112 L120 164 Z" fill="#C9184A" />
          <circle cx="100" cy="6" r="6" fill="#FFD166" />
        </svg>
        <div className="vc-sideBalloons">
          {["#FF4D6D", "#B9A7FF", "#FFD166"].map((col, i) => (
            <svg key={i} viewBox="0 0 60 92" style={{ ["--i" as string]: i }}>
              <path d="M30 56 C 6 40, 0 26, 0 17 A 15 15 0 0 1 30 12 A 15 15 0 0 1 60 17 C 60 26, 54 40, 30 56 Z" fill={col} />
              <path d="M30 58 C 24 70, 36 76, 30 92" stroke="#C9184A" strokeOpacity=".4" strokeWidth="1.4" fill="none" />
            </svg>
          ))}
        </div>
        <Gif src={GIF.bearsCheek} size={116} tilt={6} float className="vc-sideGif" />
      </div>
    </div>
  );
}

export default function ValentinesDayPremiumExperience(props: ExperienceProps) {
  const day = getDay(SLUG);
  return (
    <PremiumRoot data={props.data} mode={props.mode} slug={SLUG}>
      <DayRoot day={day} data={props.data} layout="full">
        <Story {...props} />
      </DayRoot>
    </PremiumRoot>
  );
}
