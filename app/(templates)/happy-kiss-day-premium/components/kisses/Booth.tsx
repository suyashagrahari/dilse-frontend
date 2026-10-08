"use client";

// Room 5 — The kiss booth. A velvet curtain under a marquee of bulbs. Step in:
// the curtain swishes, 3-2-1 beeps, a flash — and the booth's window plays
// every photo of you two (the kit's <FilmReel>, dressed as the booth window).
// Then a four-frame strip whirs out of the slot with the sender's lipstick
// stamps; the recipient picks a shade and taps the strip to stamp their own
// kiss (up to 3). That strip is the keepsake.

import { useRef, useState, type ReactNode } from "react";
import { FilmReel, sfx } from "../../../_valentine/kit/premium";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import Strip, { type Stamp } from "./Strip";
import type { LovePhoto } from "../../../_valentine/types";
import { SERIF } from "./fonts";
import { SHADES, SHADE_KEYS, type Kisses } from "./model";
import type { KissShade } from "../../../_valentine/days/happy-kiss-day-premium";
export type { Stamp } from "./Strip";
import { Hint, Kicker, Room, Satin, Title } from "./ui";


export default function Booth({ k, photos, aspect, sticker, stamps, onStamps, onNext }: { k: Kisses; photos: LovePhoto[]; aspect: number; sticker: ReactNode; stamps: Stamp[]; onStamps: (s: Stamp[]) => void; onNext: () => void }) {
  const reduce = useReducedMotion();
  const list = photos.filter((p) => p && p.url);
  const [phase, setPhase] = useState<"outside" | "count" | "reel" | "strip">("outside");
  const [num, setNum] = useState(3);
  const [flash, setFlash] = useState(false);
  const [mine, setMine] = useState<KissShade>(k.shade === "nude" ? "ruby" : k.shade);
  const strip = useRef<HTMLDivElement>(null);

  const stepIn = () => {
    sfx("kd-curtain", { gain: 0.8 });
    setPhase("count");
    const beat = reduce ? 250 : 800;
    [3, 2, 1].forEach((v, i) =>
      window.setTimeout(() => {
        setNum(v);
        sfx("kd-beep", { gain: 0.8 });
      }, i * beat + 300),
    );
    window.setTimeout(() => {
      setFlash(true);
      sfx("kd-flash", { gain: 0.8 });
      haptic(14);
      window.setTimeout(() => setFlash(false), 260);
      setPhase(list.length ? "reel" : "strip");
    }, 3 * beat + 300);
  };

  const printed = () => {
    sfx("kd-flash", { gain: 0.6 });
    setPhase("strip");
  };

  const stamp = (e: React.PointerEvent) => {
    if (stamps.length >= 3) return;
    const r = strip.current?.getBoundingClientRect();
    if (!r) return;
    const s: Stamp = { x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100, shade: mine, rot: Math.random() * 30 - 15 };
    onStamps([...stamps, s]);
    sfx("kd-stamp", { gain: 0.9 });
    haptic(12);
  };


  return (
    <Room label="The kiss booth" className="kd-boothRoom">
      <Kicker>{phase === "strip" ? "Fresh out of the slot" : "The kiss booth"}</Kicker>
      <Title>{phase === "strip" ? "Stamp it with yours" : "Say cheese. Or mwah."}</Title>

      {phase !== "strip" && (
        <div className={`kd-booth is-${phase}`} style={{ ["--a" as string]: String(aspect) }}>
          <div className="kd-marquee" aria-hidden>
            <span>KISS BOOTH</span>
          </div>
          <div className="kd-window">
            {phase === "reel" ? (
              <div className="kd-reelWrap">
                <FilmReel photos={list} aspect={aspect} perPhotoMs={1500} film="#2E0612" onDone={printed} />
              </div>
            ) : (
              <>
                <span className="kd-curtain is-l" aria-hidden />
                <span className="kd-curtain is-r" aria-hidden />
                {phase === "count" && <span key={num} className="kd-num" style={{ fontFamily: SERIF }}>{num}</span>}
                <span className="kd-boothSticker">{sticker}</span>
              </>
            )}
          </div>
          {flash && <span className="kd-flash" aria-hidden />}
        </div>
      )}

      {phase === "outside" && <Satin big onClick={stepIn}>Step in ✦</Satin>}
      {phase === "reel" && <Hint>The booth is printing…</Hint>}

      {phase === "strip" && (
        <>
          <div className="kd-stampRow">
          <div className="kd-printed">
            <Strip k={k} photos={photos} aspect={aspect} stamps={stamps} onPointerDown={stamp} innerRef={strip} small />
          </div>
          <div className="kd-stampSide">
          <div className="kd-shades" role="radiogroup" aria-label="Your shade">
            {SHADE_KEYS.map((key) => (
              <button key={key} type="button" role="radio" aria-checked={mine === key} aria-label={SHADES[key].name} className={`kd-swatch${mine === key ? " is-on" : ""}`} style={{ background: SHADES[key].c }} onClick={() => setMine(key)} />
            ))}
          </div>
          <Hint>{stamps.length >= 3 ? "Perfect. Three kisses on it." : "Pick your shade, then tap the strip to kiss it"}</Hint>
          </div>
          </div>
          <Satin big onClick={() => { sfx("whoosh", { gain: 0.5 }); onNext(); }}>{stamps.length ? "Now kiss me back →" : "Your turn →"}</Satin>
        </>
      )}
      <style>{CSS}</style>
    </Room>
  );
}

const CSS = `
.kd-boothRoom { gap: 12px; }
.kd-booth { position: relative; width: min(86vw, 360px); padding: 54px 16px 18px; border-radius: 18px 18px 8px 8px; box-sizing: border-box;
  background: linear-gradient(180deg, #7A1530, #5A0F24 40%, #3E0818); box-shadow: 0 30px 60px -24px rgba(60,6,20,.7), inset 0 0 0 3px #D4AF37; }
.kd-marquee { position: absolute; left: 10px; right: 10px; top: 10px; height: 34px; border-radius: 8px; display: grid; place-items: center; background: #2E0612;
  box-shadow: inset 0 0 0 2px #D4AF37; background-image: radial-gradient(circle, #FFE9A8 2.2px, transparent 3px); background-size: 14px 34px; background-position: 0 0; }
.kd-marquee span { padding: 2px 12px; background: #2E0612; font: italic 700 16px/1 var(--font-vw-serif, serif); letter-spacing: .24em; color: #F3DC8A; text-shadow: 0 0 8px rgba(243,220,138,.7); }
.kd-window { position: relative; aspect-ratio: var(--a, 1.333); border-radius: 6px; overflow: hidden; background: radial-gradient(80% 70% at 50% 40%, #FFE9EE, #F2B9C6); display: grid; place-items: center; }
.kd-curtain { position: absolute; top: 0; bottom: 0; width: 52%; z-index: 2; transition: transform .9s cubic-bezier(.6,0,.2,1);
  background: repeating-linear-gradient(90deg, #9E1B3D 0 14px, #7A1530 14px 22px, #B3274C 22px 30px); box-shadow: inset 0 -30px 40px rgba(0,0,0,.35); }
.kd-curtain.is-l { left: 0; transform-origin: 0 0; } .kd-curtain.is-r { right: 0; transform-origin: 100% 0; }
.kd-booth.is-count .kd-curtain.is-l { transform: translateX(-82%) skewX(4deg); }
.kd-booth.is-count .kd-curtain.is-r { transform: translateX(82%) skewX(-4deg); }
.kd-num { position: relative; z-index: 1; font-size: 120px; font-style: italic; font-weight: 700; color: #7A0F2E; animation: kd-num .8s ease both; }
@keyframes kd-num { from { transform: scale(1.4); opacity: 0; } 30% { opacity: 1; } to { transform: scale(.9); opacity: .9; } }
.kd-boothSticker { position: absolute; z-index: 3; left: 50%; bottom: 0; transform: translateX(-50%); pointer-events: none; }
.kd-booth.is-count .kd-boothSticker { display: none; }
.kd-flash { position: fixed; inset: 0; z-index: 80; background: #FFFFFF; pointer-events: none; animation: kd-flash .26s ease-out forwards; }
@keyframes kd-flash { from { opacity: .95; } to { opacity: 0; } }
.kd-reelWrap { width: 100%; height: 100%; display: grid; place-items: center; }
.kd-reelWrap .pm-reel { gap: 6px; }
.kd-reelWrap .pm-reelStage { width: 100%; }
.kd-reelWrap .pm-reelFrame { border: 0; border-radius: 0; box-shadow: none; }
.kd-reelWrap .pm-reelFrame::before, .kd-reelWrap .pm-reelFrame::after { display: none; }
.kd-reelWrap .pm-reelSkip { top: 8px; right: 8px; z-index: 5; }
.kd-reelWrap .pm-reelBar { display: none; }
.kd-reelWrap .pm-reelCap { font: 700 22px/1.1 var(--font-kd-hand), cursive; }
.kd-stampRow { display: grid; grid-template-columns: auto 1fr; gap: 18px; align-items: center; width: 100%; max-width: 440px; }
.kd-stampSide { display: grid; gap: 14px; justify-items: center; }
.kd-stampSide .kd-shades { flex-wrap: wrap; justify-content: center; }
.kd-printed { animation: kd-print 1.2s cubic-bezier(.22,1,.36,1) both; transform-origin: 50% 0; }
.kd-printed .kd-strip { cursor: copy; }
.kd-printed .kd-strip.is-small { transform: none; }
@keyframes kd-print { from { transform: translateY(-40px) scaleY(.2); opacity: 0; } to { transform: none; opacity: 1; } }
.kd-printed .kd-myStamp { animation: kd-stampIn .35s cubic-bezier(.3,1.6,.5,1) both; }
@keyframes kd-stampIn { from { opacity: 0; scale: 1.6; } to { opacity: .92; scale: 1; } }
.kd-shades { display: flex; gap: 12px; }
.kd-swatch { width: 44px; height: 44px; border-radius: 50%; border: 3px solid #fff; cursor: pointer; box-shadow: 0 4px 12px rgba(60,6,20,.3); }
.kd-swatch.is-on { outline: 3px solid var(--vw-ink); outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) { .kd-printed, .kd-num, .kd-printed .kd-myStamp, .kd-flash { animation: none; } .kd-flash { display: none; } .kd-curtain { transition: none; } }
`;
