"use client";

// Room 6 — The blanket fort. The photos are sewn as patches into a quilt that
// drapes over a fairy-lit fort (tap a patch to open it). Crawl inside: the
// fort's fairy-light slideshow plays every photo of you two (the kit's
// <FilmReel>, dressed in stitched wool). Then mini-game 2, "Our hearts, in
// sync": two hearts beat at different rates; tap along with the left one
// (yours, at the sender's heartbeat) and every in-time tap pulls the right one
// closer, until after ~8 good taps they beat as one and the fairy lights
// pulse together. "Let them sync" does it for you.

import { useEffect, useRef, useState, type ReactNode } from "react";
import { FilmReel, sfx } from "../../../_valentine/kit/premium";
import { CroppedPhoto, PhotoLightbox, haptic, useReducedMotion } from "../../../_valentine/kit";
import type { LovePhoto } from "../../../_valentine/types";
import { HAND, SOFT } from "./fonts";
import type { Hug } from "./model";
import { Hint, Kicker, Quiet, Room, Satin, Title } from "./ui";

const NEED = 8;

function Sync({ h, onSynced }: { h: Hug; onSynced: () => void }) {
  const reduce = useReducedMotion();
  const [good, setGood] = useState(0);
  const [synced, setSynced] = useState(false);
  const [bl, setBl] = useState(0);
  const [br, setBr] = useState(0);
  const [hit, setHit] = useState<"" | "good" | "miss">("");
  const s = useRef({ pL: 60000 / h.bpm, pR: 60000 / (h.bpm * 1.38), nL: 0, nR: 0, lastL: 0, good: 0, synced: false });
  const [helper, setHelper] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setHelper(true), 7000);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    let raf = 0;
    const st = s.current;
    st.nL = performance.now() + 600;
    st.nR = st.nL + 230;
    const loop = (now: number) => {
      if (now >= st.nL) {
        st.lastL = st.nL;
        st.nL += st.pL;
        setBl((v) => v + 1);
        sfx("hg-lubdub", { gain: st.synced ? 0.9 : 0.4 });
      }
      if (now >= st.nR) {
        st.nR += st.pR;
        setBr((v) => v + 1);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const finish = () => {
    const st = s.current;
    if (st.synced) return;
    st.synced = true;
    st.pR = st.pL;
    st.nR = st.nL;
    setSynced(true);
    sfx("hg-synced", { gain: 0.9 });
    haptic([20, 50, 20]);
    onSynced();
  };

  const tap = () => {
    const st = s.current;
    if (st.synced) return;
    const now = performance.now();
    const err = Math.min(Math.abs(now - st.lastL), Math.abs(st.nL - now));
    if (err < 240 || reduce) {
      st.good += 1;
      setGood(st.good);
      st.pR += (st.pL - st.pR) * 0.4;
      st.nR += (st.nL - st.nR) * 0.4;
      setHit("good");
      sfx("hg-tap", { chord: "major", gain: 0.8 });
      haptic(8);
      if (st.good >= NEED) finish();
    } else {
      setHit("miss");
      sfx("hg-tap", { gain: 0.5 });
    }
  };

  return (
    <div className={`hg-sync${synced ? " is-synced" : ""}`}>
      <p className="hg-syncH" style={{ fontFamily: SOFT }}>{synced ? "Our hearts, in sync" : "Tap along with my heart"}</p>
      <div className="hg-hearts">
        <span key={`l${bl}`} className="hg-heart is-l" aria-hidden>♥<small style={{ fontFamily: HAND }}>{h.sender}</small></span>
        <span key={`r${synced ? bl : br}`} className="hg-heart is-r" aria-hidden>♥<small style={{ fontFamily: HAND }}>{h.recipient}</small></span>
      </div>
      {!synced && (
        <>
          <button type="button" className={`hg-tapPad is-${hit}`} onPointerDown={tap} aria-label="Tap in time with the left heart">
            Tap on the beat
          </button>
          <div className="hg-dots" aria-label={`${good} of ${NEED} in time`}>
            {Array.from({ length: NEED }, (_, i) => <i key={i} className={i < good ? "is-on" : ""} />)}
          </div>
          {helper && <Quiet onClick={finish}>Let them sync</Quiet>}
        </>
      )}
    </div>
  );
}

export default function Fort({ h, photos, aspect, sticker, onNext }: { h: Hug; photos: LovePhoto[]; aspect: number; sticker: ReactNode; onNext: () => void }) {
  const list = photos.filter((p) => p && p.url).slice(0, 12);
  const [phase, setPhase] = useState<"quilt" | "inside" | "sync">(list.length ? "quilt" : "sync");
  const [box, setBox] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  return (
    <Room label="The blanket fort" className={`hg-fortRoom is-${phase}${done ? " is-done" : ""}`}>
      <Kicker>The blanket fort</Kicker>
      <Title>{phase === "quilt" ? "A quilt of us" : phase === "inside" ? "Fairy lights on" : done ? "One heartbeat" : "Two heartbeats"}</Title>
      <div className="hg-lights" aria-hidden>
        {Array.from({ length: 14 }, (_, i) => <i key={i} style={{ animationDelay: `${(i % 5) * 0.3}s` }} />)}
      </div>
      {phase === "quilt" && (
        <>
          <div className="hg-quilt" style={{ ["--cols" as string]: list.length > 4 ? 3 : 2 }}>
            {list.map((ph, i) => (
              <button key={i} type="button" className="hg-patch" onClick={() => { sfx("hg-pop", { gain: 0.4 }); setBox(i); }} style={{ animationDelay: `${i * 70}ms` }} aria-label={`Open patch ${i + 1}${ph.caption ? `: ${ph.caption}` : ""}`}>
                <CroppedPhoto photo={ph} eager={i < 6} />
                {ph.caption && <span className="hg-patchCap" style={{ fontFamily: HAND }}>{ph.caption}</span>}
              </button>
            ))}
            <span className="hg-fortSticker">{sticker}</span>
          </div>
          <Satin big onClick={() => { sfx("hg-drape", { gain: 0.7 }); setPhase("inside"); }}>Crawl inside the fort ✦</Satin>
          <PhotoLightbox photos={list} index={box} onIndex={setBox} onClose={() => setBox(null)} />
        </>
      )}
      {phase === "inside" && (
        <>
          <div className="hg-reelWrap">
            <FilmReel photos={list} aspect={aspect} perPhotoMs={2000} film="#4A2C2A" onDone={() => setPhase("sync")} />
          </div>
          <Hint>Every photo of us, by fairy light</Hint>
        </>
      )}
      {phase === "sync" && (
        <>
          <Sync h={h} onSynced={() => setDone(true)} />
          {done && <Satin big onClick={() => { sfx("hg-warm", { gain: 0.6 }); onNext(); }}>Your turn to hug →</Satin>}
        </>
      )}
      <style>{CSS}</style>
    </Room>
  );
}

const CSS = `
.hg-fortRoom { gap: 12px; }
.hg-lights { position: absolute; left: 6%; right: 6%; top: 96px; height: 30px; display: flex; justify-content: space-between; pointer-events: none;
  border-top: 1px solid rgba(255,224,138,.25); border-radius: 50% 50% 0 0 / 30px 30px 0 0; }
.hg-lights i { width: 8px; height: 8px; margin-top: 6px; border-radius: 50%; background: #FFE08A; box-shadow: 0 0 10px #FFB070; animation: hg-twinkle 2.2s ease-in-out infinite; }
.hg-fortRoom.is-done .hg-lights i { animation: hg-twinkleSync calc(60s / var(--bpm, 64)) ease-in-out infinite; animation-delay: 0s !important; }
@keyframes hg-twinkle { 0%, 100% { opacity: .45; } 50% { opacity: 1; } }
@keyframes hg-twinkleSync { 0%, 100% { opacity: .5; transform: scale(1); } 15% { opacity: 1; transform: scale(1.5); } }
.hg-quilt { position: relative; display: grid; grid-template-columns: repeat(var(--cols), 1fr); gap: 6px; width: 100%; max-width: 420px; padding: 12px; box-sizing: border-box; border-radius: 18px;
  background: #F4EBDD; box-shadow: 0 0 0 6px #C2410C, 0 30px 60px -30px rgba(0,0,0,.85); transform-origin: 50% 0; animation: hg-drapeIn 1s cubic-bezier(.22,1,.36,1) both; }
@keyframes hg-drapeIn { from { transform: perspective(700px) rotateX(-50deg) translateY(-30px); opacity: 0; } to { transform: none; opacity: 1; } }
.hg-patch { all: unset; position: relative; aspect-ratio: 1; cursor: pointer; overflow: hidden; border-radius: 6px; outline: 2px dashed rgba(74,44,42,.45); outline-offset: -5px; }
.hg-patch:focus-visible { outline: 3px solid #FFE08A; }
.hg-patchCap { position: absolute; left: 6px; right: 6px; bottom: 5px; font-size: 16px; line-height: 1; color: #fff; text-shadow: 0 1px 6px rgba(0,0,0,.8); }
.hg-fortSticker { position: absolute; right: -14px; bottom: -26px; pointer-events: none; }
.hg-reelWrap { width: 100%; }
.hg-reelWrap .pm-reelFrame { border-left-color: #4A2C2A; border-right-color: #4A2C2A; box-shadow: 0 0 0 8px #F4EBDD, 0 0 0 10px #C2410C, 0 30px 60px -20px rgba(0,0,0,.85); }
.hg-reelWrap .pm-reelFrame::before, .hg-reelWrap .pm-reelFrame::after { display: none; }
.hg-reelWrap .pm-reelStage { width: min(74vw, 340px); margin: 16px auto 0; }
.hg-reelWrap .pm-reelCap { font: 700 22px/1.1 var(--font-hg-hand), cursive; }
.hg-reelWrap .pm-reelBar i { background: #FFE08A; }
.hg-reelWrap .pm-reelSkip { top: auto; bottom: -50px; }
.hg-sync { display: grid; justify-items: center; gap: 14px; width: 100%; }
.hg-syncH { margin: 0; font-size: 20px; font-style: italic; color: #FFE3CC; }
.hg-hearts { display: flex; gap: 46px; align-items: center; }
.hg-heart { display: grid; justify-items: center; font-size: 74px; line-height: 1; color: #D9367A; animation: hg-beat .5s cubic-bezier(.3,1.5,.5,1); text-shadow: 0 0 28px rgba(217,54,122,.6); }
.hg-heart.is-r { color: #FF8A3D; text-shadow: 0 0 28px rgba(255,138,61,.6); }
.hg-heart small { font-size: 18px; color: #FFF6EA; margin-top: 4px; }
.hg-sync.is-synced .hg-heart { color: #FFE08A; text-shadow: 0 0 40px rgba(255,224,138,.8); }
@keyframes hg-beat { 0% { transform: scale(1); } 25% { transform: scale(1.22); } 100% { transform: scale(1); } }
.hg-tapPad { width: 100%; max-width: 320px; min-height: 92px; border-radius: 24px; cursor: pointer; touch-action: manipulation; border: 2px dashed rgba(255,224,138,.5);
  background: rgba(27,35,64,.55); color: #FFF6EA; font: 700 17px/1 var(--vw-font-ui, system-ui), sans-serif; transition: background .2s; }
.hg-tapPad.is-good { background: rgba(217,54,122,.35); }
.hg-tapPad.is-miss { background: rgba(27,35,64,.8); }
.hg-tapPad:focus-visible { outline: 3px solid #FFE08A; outline-offset: 3px; }
.hg-dots { display: flex; gap: 6px; }
.hg-dots i { width: 10px; height: 10px; border-radius: 50%; background: rgba(255,255,255,.18); }
.hg-dots i.is-on { background: #FFE08A; box-shadow: 0 0 8px #FFB070; }
@media (prefers-reduced-motion: reduce) { .hg-quilt, .hg-heart, .hg-lights i { animation: none !important; } }
`;
