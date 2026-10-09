"use client";

// Chapter I · The Hall of Portraits. A dark gallery; the recipient drags a torch
// beam to find their photos hung as gilt portraits and the sender's notes
// scrawled on the wallpaper. Each find switches on that portrait's picture
// light (nm-lamp) or makes a note glow (paper-rustle), and lifts it above the
// dark for good. When everything is found the room comes up to a dim glow.

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CinematicPhoto, PremiumCTA, sfx } from "../../../_valentine/kit/premium";
import { haptic } from "../../../_valentine/kit";
import type { Night } from "./model";
import Torch from "./Torch";
import { Eyebrow, Gilt, Quiet } from "./ui";
import { BODY } from "./fonts";

export default function Hall({ n, sticker, onNext }: { n: Night; sticker: ReactNode; onNext: () => void }) {
  const stage = useRef<HTMLDivElement>(null);
  const items = useMemo(
    () => [
      ...n.hall.map((photo, i) => ({ kind: "photo" as const, photo, slot: `p${i}` })),
      ...n.notes.map((text, i) => ({ kind: "note" as const, text, slot: `n${i}` })),
    ],
    [n.hall, n.notes],
  );
  const [found, setFound] = useState<boolean[]>(() => items.map(() => false));
  const [touched, setTouched] = useState(false);
  const [stuck, setStuck] = useState(false);
  const count = found.filter(Boolean).length;
  const all = count === items.length;

  useEffect(() => {
    const wind = sfx("wind-bed", { gain: 0.35 });
    const t = window.setTimeout(() => setStuck(true), 14000);
    return () => {
      wind.stop(1200);
      window.clearTimeout(t);
    };
  }, []);

  const onFound = useCallback(
    (i: number) => {
      setFound((f) => (f[i] ? f : f.map((v, k) => (k === i ? true : v))));
      haptic(14);
      if (items[i]?.kind === "photo") sfx("nm-lamp", { gain: 0.9, detune: (i - 1) * 60 });
      else sfx("paper-rustle", { gain: 0.5 });
    },
    [items],
  );

  useEffect(() => {
    if (all) sfx("chime", { gain: 0.45, at: 0.5 });
  }, [all]);

  const lightAll = () => {
    setFound(items.map(() => true));
    sfx("nm-lamp", { gain: 0.9 });
  };

  return (
    <div ref={stage} className="nm-scene nm-hall">
      <div className="nm-wall" aria-hidden />
      <header className="nm-hallHead">
        <Eyebrow n="I">The Hall of Portraits</Eyebrow>
        <p className="nm-sub" style={{ fontSize: 17 }}>{n.hall.length ? (all ? "Every one of them is us." : "Find us in the dark.") : all ? "You found them all." : "I left something in the dark."}</p>
      </header>

      <div className={`nm-room${all ? " is-all" : ""}${n.hall.length ? "" : " is-notes"}`} aria-label="A dark hall of portraits. Drag the light to find them.">
        {items.map((it, i) =>
          it.kind === "photo" ? (
            <Gilt key={it.slot} className={`nm-slot nm-${it.slot}${found[i] ? " is-found" : ""}`} lit={found[i]} lamp plaque={it.photo.caption || undefined} torch={i}>
              <CinematicPhoto photo={it.photo} frame="full" caption="" grade="warm" focusPull={false} kenBurns={found[i] ? "in" : false} />
            </Gilt>
          ) : (
            <p key={it.slot} data-torch={i} className={`nm-slot nm-note nm-${it.slot}${found[i] ? " is-found" : ""}`}>
              {it.text}
            </p>
          ),
        )}
        {all && sticker && <div className="nm-hallSticker nm-fadeIn">{sticker}</div>}
      </div>
      <Torch stageRef={stage} found={found} onFound={onFound} darkness={all ? 0.3 : 0.96} onTouch={() => setTouched(true)} />

      <div className="nm-foot" style={{ position: "relative", zIndex: 8 }}>
        {all ? (
          <PremiumCTA tone="ember" cue="whoosh" onClick={onNext}>
            Follow the whispers
          </PremiumCTA>
        ) : (
          <>
            <div className="nm-dots" aria-live="polite" aria-label={`${count} of ${items.length} found`}>
              {items.map((_, i) => (
                <span key={i} className={found[i] ? "is-on" : undefined} />
              ))}
            </div>
            <p className={`nm-hint${touched ? " is-gone" : ""}`}>Drag the light</p>
            {stuck && <Quiet onClick={lightAll}>Light every lamp</Quiet>}
          </>
        )}
      </div>
      <style>{HALL_CSS}</style>
    </div>
  );
}

const HALL_CSS = `
.nm-scene.nm-hall { padding-left: 0; padding-right: 0; touch-action: none; user-select: none; -webkit-user-select: none; }
.nm-wall { position: absolute; inset: 0; z-index: 0;
  background:
    radial-gradient(70% 45% at 50% 0%, rgba(242,179,91,.10), transparent 70%),
    linear-gradient(180deg, transparent 80%, rgba(0,0,0,.55) 80.3%, #1a0d0c 80.6%, #120807 100%),
    radial-gradient(ellipse 9px 15px at 50% 50%, rgba(232,207,138,.10) 0 60%, transparent 66%) 0 0 / 54px 64px,
    radial-gradient(ellipse 4px 4px at 50% 50%, rgba(232,207,138,.08) 0 60%, transparent 66%) 27px 32px / 54px 64px,
    repeating-linear-gradient(90deg, rgba(255,255,255,.022) 0 1px, transparent 1px 27px),
    linear-gradient(180deg, #2b1a2f 0%, #241526 55%, #1a0f1c 80%); }
.nm-hallHead { position: relative; z-index: 8; display: grid; justify-items: center; gap: 10px; padding: 0 22px; }
.nm-room { position: relative; flex: 1; width: 100%; max-width: 560px; margin: 14px auto 0; touch-action: none; cursor: crosshair; user-select: none; -webkit-user-select: none; }
.nm-room .nm-slot { position: absolute; margin: 0; z-index: 1; transition: transform 1s cubic-bezier(.22,1,.36,1); }
.nm-room .nm-slot.is-found { z-index: 6; }
.nm-gilt.nm-slot { aspect-ratio: 4 / 5; height: auto; }
.nm-p0 { left: 5%; top: 1%; width: 46%; transform: rotate(-1.2deg); }
.nm-p1 { left: 58%; top: 5%; width: 36%; transform: rotate(1.4deg); }
.nm-p2 { left: 50%; top: 54%; width: 39%; transform: rotate(-.8deg); }
.nm-note { font: italic 400 19px/1.25 ${BODY}; color: rgba(232,223,204,.5); text-shadow: 0 0 1px rgba(232,223,204,.4); filter: blur(.6px);
  opacity: .5; transform: rotate(-4deg); text-wrap: balance; transition: color .8s ease, opacity .8s ease, filter .8s ease, text-shadow .8s ease; }
.nm-note.is-found { color: #fff1d6; opacity: 1; filter: none; text-shadow: 0 0 18px rgba(242,179,91,.85), 0 0 2px rgba(255,241,214,.8); }
.nm-n0 { left: 6%; top: 59%; width: 40%; }
.nm-n1 { left: 6%; top: 73%; width: 40%; transform: rotate(2.5deg); }
.nm-n2 { left: 6%; top: 87%; width: 40%; transform: rotate(-2deg); }
.nm-room.is-all .nm-slot { transform: none; }
.nm-room.is-notes .nm-note { left: 10%; width: 80%; text-align: center; font-size: 25px; }
.nm-room.is-notes .nm-n0 { top: 18%; } .nm-room.is-notes .nm-n1 { top: 44%; } .nm-room.is-notes .nm-n2 { top: 70%; }
.nm-hallSticker { position: absolute; z-index: 7; right: 4%; bottom: 2%; width: 84px; }
.nm-dots { display: flex; gap: 8px; }
.nm-dots span { width: 7px; height: 7px; border-radius: 50%; background: rgba(232,223,204,.22); transition: background .5s ease, box-shadow .5s ease; }
.nm-dots span.is-on { background: #F2B35B; box-shadow: 0 0 10px rgba(242,179,91,.9); }
.nm-hint { margin: 0; font: italic 400 16px/1 ${BODY}; color: rgba(232,223,204,.7); letter-spacing: .02em; transition: opacity .8s ease; min-height: 18px; }
.nm-hint.is-gone { opacity: 0; }
@media (min-width: 900px) and (min-aspect-ratio: 1/1) {
  .nm-room { max-width: 1120px; margin-top: 34px; }
  .nm-p0 { left: 7%; top: 5%; width: 21%; }
  .nm-p1 { left: 40%; top: 0%; width: 19%; }
  .nm-p2 { left: 70%; top: 8%; width: 21%; }
  .nm-n0 { left: 6%; top: 74%; width: 24%; }
  .nm-n1 { left: 38%; top: 66%; width: 24%; }
  .nm-n2 { left: 69%; top: 78%; width: 24%; }
  .nm-note { font-size: 24px; }
}
`;
