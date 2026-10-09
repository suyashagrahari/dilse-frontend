"use client";

// Chapter VI · The Last Portrait — the money moment.
// The hall is dark again and one big gilt frame hangs in it. When the beam
// lands on it: the riser (useSongDrop) while the torch locks on and opens up,
// then — on the song's drop — thunder and a lightning flash (gentle tones: a
// warm bloom, no thunder), the room is lit, and the portrait (them) WINKS:
// a two-frame squash with a glint and a glassy two-note (nm-wink). Their
// names and the night's title rise under it, then the question.

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { CinematicPhoto, Fluent3D, KineticName, PremiumCTA, RevealText, sfx, useSongDrop } from "../../../_valentine/kit/premium";
import { RunawayNo, haptic, useReducedMotion } from "../../../_valentine/kit";
import type { Night } from "./model";
import Torch from "./Torch";
import { Eyebrow, Gilt } from "./ui";
import { BODY, DISPLAY } from "./fonts";

type Phase = "dark" | "found" | "peak" | "ask" | "yes";
const FOUND_NONE = [false];
const FOUND_ONE = [true];
const noop = () => {};

export default function Portrait({
  n, sticker, onPeak, onYes, onNext,
}: { n: Night; sticker: ReactNode; onPeak: () => void; onYes: (dodges: number) => void; onNext: () => void }) {
  const reduce = useReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const { drop } = useSongDrop();
  const [phase, setPhase] = useState<Phase>("dark");
  const [wink, setWink] = useState(false);
  const [glint, setGlint] = useState(false);
  const [touched, setTouched] = useState(false);
  const [stuck, setStuck] = useState(false);
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  useEffect(() => {
    const t = timers.current;
    later(() => setStuck(true), 12000);
    return () => t.forEach((id) => window.clearTimeout(id));
  }, []);

  const reveal = useCallback(() => {
    if (phase !== "dark") return;
    setPhase("found");
    haptic(20);
    sfx("nm-lamp", { gain: 1 });
    drop(() => {
      setPhase("peak");
      onPeak();
      if (!n.gentle) sfx("thunder", { gain: 0.9 });
      else sfx("chime-cascade", { gain: 0.6 });
      haptic([30, 40, 60]);
      // The wink: two frames, on the beat after the drop.
      later(() => {
        setWink(true);
        setGlint(true);
        sfx("nm-wink", { gain: 0.8 });
        later(() => setWink(false), 260);
        later(() => setGlint(false), 1300);
      }, reduce ? 300 : 900);
      later(() => setPhase("ask"), reduce ? 1200 : 3600);
    });
  }, [phase, drop, onPeak, n.gentle, reduce]);

  const yes = (dodges: number) => {
    setPhase("yes");
    onYes(dodges);
    haptic([20, 30, 20]);
    sfx("firework", { gain: 0.6 });
    sfx("chime-cascade", { gain: 0.5, at: 0.3 });
  };

  const lit = phase !== "dark";
  const after = phase === "ask" || phase === "yes";
  const names = n.sender ? `${n.recipient} & ${n.sender}` : n.recipient;

  return (
    <div ref={stage} className={`nm-scene nm-final is-${phase}${n.gentle ? " is-gentle" : ""}`}>
      <div className="nm-wall nm-wallFinal" aria-hidden />
      {phase === "peak" && !reduce && <div className={n.gentle ? "nm-bloom" : "nm-flash"} aria-hidden />}

      <header className="nm-finalHead">
        {lit ? <Eyebrow>{n.title}</Eyebrow> : <Eyebrow n="VI">The Last Portrait</Eyebrow>}
        {!lit && <p className="nm-sub" style={{ fontSize: 17 }}>One portrait is still in the dark.</p>}
      </header>

      <div className="nm-finalRoom" aria-label="A dark room with one covered portrait. Drag the light to find it.">
        <div className="nm-finalFrame">
          <Gilt lit={lit} lamp torch={0} className={wink ? "is-wink" : undefined} style={{ width: "100%", height: "100%" }}>
            {n.hero ? (
              <CinematicPhoto photo={n.hero} frame="full" caption="" grade="warm" focusPull={false} kenBurns={lit ? "in" : false} eager />
            ) : (
              <span style={{ display: "grid", placeItems: "center", background: "#1d1020" }}>
                <Fluent3D name="ghost" size={140} />
              </span>
            )}
          </Gilt>
          {lit && (
            <span className={`nm-glint${glint ? " is-on" : ""}`} aria-hidden>
              <Fluent3D name="sparkles" size={64} float={false} shadow={false} />
            </span>
          )}
        </div>
      </div>
      {phase === "dark" && <Torch stageRef={stage} found={FOUND_NONE} onFound={reveal} dwell={550} onTouch={() => setTouched(true)} z={4} />}
      {phase === "found" && <Torch stageRef={stage} found={FOUND_ONE} onFound={noop} lockTo={0} z={4} />}

      <div className="nm-finalFoot">
        {phase === "dark" && (
          <>
            <p className={`nm-hint${touched ? " is-gone" : ""}`}>Drag the light</p>
            {stuck && (
              <button type="button" className="nm-quiet" onClick={reveal}>
                Light it
              </button>
            )}
          </>
        )}
        {(phase === "peak" || after) && (
          <div className="nm-names">
            <KineticName text={names} gilt as="h2" size="clamp(34px, 9.5vw, 58px)" font={DISPLAY} />
          </div>
        )}
        {phase === "ask" && (
          <div className="nm-ask nm-fadeIn">
            <p className="nm-q">{n.question}</p>
            {n.gentle ? (
              <PremiumCTA tone="ember" cue="chime" onClick={() => yes(0)}>
                {n.copy.yes}
              </PremiumCTA>
            ) : (
              <RunawayNo
                yesLabel={n.copy.yes}
                noLabel="No"
                noLines={n.copy.noLines}
                surrenderLabel={n.copy.surrender}
                maxDodges={3}
                height={128}
                onDodge={() => sfx("swoosh-soft", { gain: 0.4 })}
                onYes={yes}
                yesStyle={{ background: "linear-gradient(180deg,#ffd29a 0%,#ff8a3d 42%,#a8360e 100%)", color: "#2a0d02", fontFamily: BODY, fontWeight: 500, boxShadow: "0 14px 34px -12px rgba(255,140,60,.6), inset 0 1px 0 rgba(255,255,255,.5)" }}
                noStyle={{ background: "rgba(232,223,204,.08)", color: "#E8DFCC", border: "1px solid rgba(232,223,204,.3)", fontFamily: BODY }}
              />
            )}
          </div>
        )}
        {phase === "yes" && (
          <div className="nm-ask nm-fadeIn">
            {n.yesLine && <RevealText mode="blur" text={n.yesLine} className="nm-sub" style={{ font: `italic 300 22px/1.4 ${BODY}`, color: "#F6EEDC", maxWidth: "26ch" }} />}
            {sticker && <div style={{ width: 84 }}>{sticker}</div>}
            <PremiumCTA tone="gold" cue="whoosh" onClick={onNext}>
              Keep this night
            </PremiumCTA>
          </div>
        )}
      </div>
      <style>{FINAL_CSS}</style>
    </div>
  );
}

const FINAL_CSS = `
.nm-scene.nm-final { padding-left: 0; padding-right: 0; touch-action: none; user-select: none; -webkit-user-select: none; }
.nm-wallFinal { transition: filter 2s ease; filter: brightness(.9); }
.nm-final.is-peak .nm-wallFinal, .nm-final.is-ask .nm-wallFinal, .nm-final.is-yes .nm-wallFinal { filter: brightness(1.25) saturate(1.1); }
.nm-finalHead { position: relative; z-index: 8; display: grid; justify-items: center; gap: 10px; padding: 0 22px; min-height: 54px; }
.nm-finalRoom { position: relative; flex: 1 1 auto; min-height: 0; width: 100%; display: grid; place-items: center; touch-action: none; user-select: none; -webkit-user-select: none; }
.nm-finalFrame { position: relative; z-index: 1; height: min(100%, 62svh); max-height: 520px; aspect-ratio: 4 / 5; max-width: 82vw; padding: 18px 0 0; box-sizing: border-box;
  transition: transform 1.6s cubic-bezier(.22,1,.36,1); }
.nm-final.is-ask .nm-finalFrame, .nm-final.is-yes .nm-finalFrame { transform: scale(.94); }
.nm-final:not(.is-dark) .nm-finalFrame { z-index: 6; }
.nm-finalRoom::before { content: ""; position: absolute; left: 50%; top: 50%; width: 140%; max-width: 900px; aspect-ratio: 1; transform: translate(-50%,-50%); border-radius: 50%;
  pointer-events: none; opacity: 0; transition: opacity 2.4s ease .2s; background: radial-gradient(circle closest-side, rgba(242,179,91,.30), rgba(224,120,47,.10) 45%, transparent 75%); }
.nm-final:not(.is-dark):not(.is-found) .nm-finalRoom::before { opacity: 1; }
.nm-finalFrame .nm-gilt { padding: 13px; }
.nm-finalFrame .nm-gilt.is-wink .nm-giltIn > * { transform: scaleY(.955) scaleX(1.012); filter: brightness(1.18); transition: none; }
.nm-finalFrame .nm-giltIn > * { transition: transform .18s ease, filter .18s ease; transform-origin: 50% 40%; }
.nm-glint { position: absolute; right: -14px; top: 4px; z-index: 3; opacity: 0; transform: scale(.2) rotate(-30deg); transition: opacity .25s ease, transform .5s cubic-bezier(.22,1,.36,1); pointer-events: none; }
.nm-glint.is-on { opacity: 1; transform: scale(1) rotate(0); }
.nm-finalFoot { position: relative; z-index: 8; display: grid; justify-items: center; gap: 12px; min-height: 120px; padding: 18px 22px 0; text-align: center; }
.nm-names { margin-top: -4px; }
.nm-names h2 { margin: 0; text-align: center; line-height: 1; }
.nm-ask { display: grid; justify-items: center; gap: 12px; width: min(100%, 440px); }
.nm-q { margin: 0; font: italic 400 clamp(20px, 5.6vw, 26px)/1.3 ${BODY}; color: #F6EEDC; text-wrap: balance; }
.nm-flash { position: fixed; inset: 0; z-index: 9; pointer-events: none; background: radial-gradient(90% 70% at 50% 30%, #fff, rgba(220,215,255,.85) 50%, rgba(200,190,255,.2));
  opacity: 0; animation: nm-bolt 1s linear forwards; }
@keyframes nm-bolt { 0% { opacity: 0; } 6% { opacity: .9; } 16% { opacity: .1; } 44% { opacity: .7; } 100% { opacity: 0; } }
.nm-bloom { position: fixed; inset: 0; z-index: 9; pointer-events: none; background: radial-gradient(60% 50% at 50% 40%, rgba(255,226,168,.7), transparent 70%);
  opacity: 0; animation: nm-bloomA 1.6s ease forwards; }
@keyframes nm-bloomA { 0% { opacity: 0; } 25% { opacity: 1; } 100% { opacity: 0; } }
`;
