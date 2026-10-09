"use client";

// Chapter 1 + the money moment. Inside the booth: a smoked-glass viewfinder
// shows their reflection, one lacquer-red arcade button. Press it: 3 · 2 · 1,
// then FOUR FLASHES, each freezing one of their photos in the glass. The
// machine whirs, the song's riser climbs (useSongDrop) and on the peak the
// strip DROPS out of the slot, then develops frame by frame, milky silver
// clearing to their faces. The last frame is "the kiss".

import { useEffect, useRef, useState, type ReactNode } from "react";
import { CroppedPhoto, haptic, useReducedMotion } from "../../../_valentine/kit";
import { PremiumCTA, TiltCard, requestTiltPermission, sfx, useSongDrop } from "../../../_valentine/kit/premium";
import Strip, { FRAME_FILTER } from "./Strip";
import { stampDate, type Booth } from "./model";
import { CTA_STYLE, Eyebrow, Scene, Slot } from "./ui";

type Phase = "ready" | "count" | "shoot" | "print" | "drop" | "done";

const STRIP_W = "clamp(150px, calc((100svh - 240px) / 3.2), 270px)";

export default function BoothScene({ b, flash, sticker, onNext }: { b: Booth; flash: () => void; sticker: ReactNode; onNext: () => void }) {
  const reduce = useReducedMotion();
  const { drop } = useSongDrop();
  const [phase, setPhase] = useState<Phase>("ready");
  const [count, setCount] = useState(3);
  const [shot, setShot] = useState(-1);
  const [dev, setDev] = useState(0);
  const timers = useRef<number[]>([]);
  const at = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
  // Decode every frame now, so each flash freezes a picture, never a blank.
  useEffect(() => {
    for (const ph of b.frames) if (ph?.url) {
      const im = new Image();
      im.src = ph.url;
      void im.decode?.().catch(() => {});
    }
  }, [b.frames]);

  const start = () => {
    if (phase !== "ready") return;
    void requestTiltPermission();
    sfx("kpb-press", { gain: 0.8 });
    haptic(14);
    setPhase("count");
    const step = reduce ? 450 : 700;
    [3, 2, 1].forEach((n, i) =>
      at(i * step, () => {
        setCount(n);
        sfx("kpb-beep", { detune: n === 1 ? 700 : 0, gain: 0.7 });
      }),
    );
    const t0 = 3 * step;
    const gap = reduce ? 600 : 850;
    for (let i = 0; i < 4; i++)
      at(t0 + i * gap, () => {
        setPhase("shoot");
        setShot(i);
        flash();
        sfx("kpb-shutter", { gain: 0.9, detune: i * 40 });
        haptic(10);
      });
    at(t0 + 4 * gap + 250, () => {
      setPhase("print");
      sfx("kpb-motor", { dur: 1.2, gain: 0.7 });
      drop(() => {
        setPhase("drop");
        haptic([20, 40, 20]);
        const d0 = reduce ? 200 : 1000;
        for (let i = 0; i < 4; i++)
          at(d0 + i * (reduce ? 150 : 650), () => {
            setDev(i + 1);
            sfx("kpb-develop", { gain: 0.55, detune: i * 120 });
          });
        at(d0 + 4 * (reduce ? 150 : 650) + 600, () => setPhase("done"));
      });
    });
  };

  const showStrip = phase === "drop" || phase === "done";
  const vfPhoto = shot >= 0 ? b.frames[shot] : b.frames[0];
  const filter = b.mono ? FRAME_FILTER.mono : FRAME_FILTER.colour;

  return (
    <Scene label="The photo booth" className={`pb-booth is-${phase}`}>
      <Eyebrow>Photo booth · No. {stampDate().replace(/\./g, "")}</Eyebrow>

      {!showStrip && (
        <div className="pb-boothStage">
          <div className={`pb-vf${phase === "print" ? " is-out" : ""}`}>
            {vfPhoto && <CroppedPhoto key={shot} photo={vfPhoto} eager className={`pb-vfPhoto${shot >= 0 ? " is-shot" : ""}`} style={{ filter, ["--g" as string]: filter }} />}
            <span className="pb-vfGlass" aria-hidden />
            <span className="pb-vfCorners" aria-hidden />
            <span className="pb-rec" aria-hidden>
              <i /> {phase === "ready" ? "READY" : phase === "count" ? "SMILE" : phase === "print" ? "PRINTING" : "REC"}
            </span>
            <span className="pb-vfCount" aria-live="polite">{shot >= 0 ? `${shot + 1}/4` : "0/4"}</span>
            {phase === "count" && (
              <span key={count} className="pb-num" aria-hidden>
                {count}
              </span>
            )}
            {shot === 3 && phase === "shoot" && <span className="pb-theKiss">the kiss</span>}
          </div>
          <h2 className="pb-h pb-boothLine">Look into <em>the glass.</em></h2>
          <div className="pb-foot">
            <button type="button" className={`pb-arcade${phase !== "ready" ? " is-down" : ""}`} onClick={start} disabled={phase !== "ready"} aria-label="Press to take four photos">
              <span className="pb-arcadeDome" />
            </button>
            <p className="pb-eyebrow" aria-hidden>{phase === "ready" ? "Press · four flashes" : phase === "print" ? "Developing…" : "Hold still"}</p>
          </div>
        </div>
      )}

      {showStrip && (
        <div className="pb-printed">
          <div className="pb-printedText">
            <p className="pb-eyebrow">Fresh out of the slot</p>
            <h2 className="pb-h pb-names">
              {b.recipient} <em>&amp;</em> {b.sender}
            </h2>
          </div>
          <div className="pb-feedWrap">
            <Slot />
            <div className="pb-feed">
              <div className={`pb-dropper${reduce ? " is-reduced" : ""}`}>
                <TiltCard radius={4} max={9} glare={0.32} shadow={false} style={{ width: STRIP_W }}>
                  <Strip b={b} developed={dev} width={STRIP_W} />
                </TiltCard>
                {sticker && <span className="pb-boothSticker">{sticker}</span>}
              </div>
            </div>
          </div>
          <div className="pb-foot pb-printedCta">{phase === "done" && <PremiumCTA style={CTA_STYLE} tone="pearl" cue={null} onClick={() => { sfx("kpb-flip", { gain: 0.7 }); onNext(); }}>Turn them over</PremiumCTA>}</div>
        </div>
      )}
      <style>{CSS}</style>
    </Scene>
  );
}

const CSS = `
.pb-boothStage { flex: 1; width: 100%; display: flex; flex-direction: column; align-items: center; gap: 26px; padding-top: 22px; }
.pb-vf { position: relative; width: min(86vw, 520px, calc((100svh - 400px) * 1.33)); aspect-ratio: 4 / 3; border-radius: 22px; overflow: hidden; background: #050304;
  box-shadow: 0 0 0 1px rgba(255,255,255,.08), 0 0 0 9px #17110f, 0 0 0 10px rgba(201,206,214,.35), 0 50px 90px -30px rgba(0,0,0,.95);
  transition: opacity .8s var(--pb-ease), transform .8s var(--pb-ease); }
.pb-vf.is-out { opacity: 0; transform: scale(.94); }
.pb-vfPhoto { position: absolute !important; inset: 0; opacity: .2; transform: scaleX(-1); }
.pb-vfPhoto.is-shot { opacity: 1; transform: none; animation: pb-shot .7s var(--pb-ease) both; }
@keyframes pb-shot { from { opacity: 1; filter: var(--g) brightness(2.2); } to { opacity: 1; filter: var(--g) brightness(1); } }
.pb-vfGlass { position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(118deg, rgba(255,255,255,.13) 0%, rgba(255,255,255,0) 32%, rgba(255,255,255,0) 64%, rgba(255,255,255,.06) 80%, rgba(255,255,255,0) 100%),
  radial-gradient(90% 70% at 50% 50%, transparent 50%, rgba(0,0,0,.55)); }
.pb-vfCorners { position: absolute; inset: 14px; pointer-events: none;
  background: linear-gradient(var(--pb-cream),var(--pb-cream)) 0 0/22px 2px, linear-gradient(var(--pb-cream),var(--pb-cream)) 0 0/2px 22px,
  linear-gradient(var(--pb-cream),var(--pb-cream)) 100% 0/22px 2px, linear-gradient(var(--pb-cream),var(--pb-cream)) 100% 0/2px 22px,
  linear-gradient(var(--pb-cream),var(--pb-cream)) 0 100%/22px 2px, linear-gradient(var(--pb-cream),var(--pb-cream)) 0 100%/2px 22px,
  linear-gradient(var(--pb-cream),var(--pb-cream)) 100% 100%/22px 2px, linear-gradient(var(--pb-cream),var(--pb-cream)) 100% 100%/2px 22px;
  background-repeat: no-repeat; opacity: .55; }
.pb-rec { position: absolute; left: 24px; top: 22px; display: inline-flex; align-items: center; gap: 7px; font: 700 10px/1 var(--pb-mono); letter-spacing: .24em; color: var(--pb-cream); opacity: .85; }
.pb-rec i { width: 7px; height: 7px; border-radius: 50%; background: var(--pb-shade-hi); box-shadow: 0 0 10px var(--pb-shade-hi); animation: pb-blink 1.2s steps(2, jump-none) infinite; }
@keyframes pb-blink { 50% { opacity: .2; } }
.pb-vfCount { position: absolute; right: 24px; top: 22px; font: 700 10px/1 var(--pb-mono); letter-spacing: .24em; color: var(--pb-cream); opacity: .85; font-variant-numeric: tabular-nums; }
.pb-num { position: absolute; inset: 0; display: grid; place-items: center; font: 400 clamp(110px, 34vw, 220px)/1 var(--pb-display); color: var(--pb-cream);
  text-shadow: 0 10px 40px rgba(0,0,0,.6); animation: pb-num .7s var(--pb-ease) both; }
@keyframes pb-num { from { opacity: 0; transform: scale(1.35); } 30% { opacity: 1; } to { opacity: .9; transform: scale(1); } }
.pb-theKiss { position: absolute; left: 50%; bottom: 18px; transform: translateX(-50%); font: 400 24px/1 var(--pb-display); color: var(--pb-cream); text-shadow: 0 2px 14px rgba(0,0,0,.7); animation: pb-fade .6s .3s both; }
.pb-boothLine { font-size: clamp(30px, 8.6vw, 52px); max-width: 13ch; }
.pb-arcade { position: relative; width: 104px; height: 104px; border-radius: 50%; border: 0; padding: 0; cursor: pointer; touch-action: manipulation; -webkit-tap-highlight-color: transparent;
  background: conic-gradient(from 200deg, #6b7078, #f4f6f9 12%, #9aa0a8 28%, #e7ebf0 45%, #5d6168 60%, #f4f6f9 78%, #8d939b 92%, #6b7078);
  box-shadow: 0 18px 30px -10px rgba(0,0,0,.9), 0 0 0 1px rgba(0,0,0,.6); }
.pb-arcadeDome { position: absolute; inset: 11px; border-radius: 50%; transition: transform .12s ease, box-shadow .12s ease;
  background: radial-gradient(circle at 38% 30%, #ff8a92 0%, var(--pb-lacquer) 38%, #6d0710 100%);
  box-shadow: 0 7px 0 #4a040a, 0 9px 18px rgba(0,0,0,.6), inset 0 -6px 12px rgba(0,0,0,.35), inset 0 3px 6px rgba(255,255,255,.35); }
.pb-arcade::after { content: ""; position: absolute; inset: -14px; border-radius: 50%; border: 1px solid rgba(229,103,125,.5); animation: pb-halo 2.4s var(--pb-ease) infinite; pointer-events: none; }
.pb-arcade.is-down::after { display: none; }
@keyframes pb-halo { from { transform: scale(.9); opacity: .9; } to { transform: scale(1.25); opacity: 0; } }
.pb-arcade:active .pb-arcadeDome, .pb-arcade.is-down .pb-arcadeDome { transform: translateY(6px); box-shadow: 0 1px 0 #4a040a, 0 3px 8px rgba(0,0,0,.6), inset 0 -4px 10px rgba(0,0,0,.35), inset 0 3px 6px rgba(255,255,255,.3); }
.pb-arcade:disabled { cursor: default; }
.pb-arcade:focus-visible { outline: 3px solid var(--pb-shade-hi); outline-offset: 6px; }
.pb-printed { flex: 1; width: 100%; display: grid; justify-items: center; align-content: start; gap: 0; }
.pb-printedText { display: none; }
.pb-feedWrap { display: grid; justify-items: center; margin-top: 22px; }
.pb-feed { overflow: hidden; padding: 0 60px 56px; margin-top: -7px; }
.pb-dropper { position: relative; animation: pb-drop 1.15s cubic-bezier(.2,.9,.25,1.04) both; }
.pb-dropper.is-reduced { animation: pb-fade .3s ease both; }
@keyframes pb-drop { from { transform: translateY(-104%); } 70% { transform: translateY(2%); } to { transform: none; } }
.pb-boothSticker { position: absolute; right: -54px; bottom: 24%; pointer-events: none; animation: pb-fade .6s 2.6s both; }
.pb-printedCta { position: absolute; left: 0; right: 0; bottom: calc(24px + env(safe-area-inset-bottom, 0px)); padding: 0; min-height: 64px; }
@media (min-width: 1024px) {
  .pb-printed { grid-template-columns: 1fr auto 1fr; align-items: start; column-gap: 56px; }
  .pb-printedText { display: grid; gap: 18px; justify-self: end; text-align: right; align-self: center; animation: pb-up 1s 1.2s var(--pb-ease) both; }
  .pb-names { font-size: clamp(56px, 5.4vw, 96px); max-width: 7ch; }
  .pb-printedCta { position: static; grid-column: 3; justify-self: start; align-self: center; margin-top: 0; padding-top: 0; }
}
@media (prefers-reduced-motion: reduce) { .pb-num, .pb-vfPhoto.is-shot { animation: none; } .pb-arcade::after, .pb-rec i { animation: none; } }
`;
