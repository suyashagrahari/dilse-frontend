"use client";

// Room 1 — The frosted window. A winter window, fogged over, wind outside.
// Wipe the frost with a finger (the kit's ScratchCanvas, frost-coloured) to
// find "{name}, come here." over a soft photo of the two of you. A squeak on
// the glass while wiping, glass harmonics when it clears, and the wind fades.

import { useEffect, useRef, useState, type ReactNode } from "react";
import { sfx } from "../../../_valentine/kit/premium";
import { CroppedPhoto, ScratchCanvas } from "../../../_valentine/kit";
import type { LovePhoto } from "../../../_valentine/types";
import { HAND, SOFT } from "./fonts";
import type { Hug } from "./model";
import { Hint, Kicker, Room, Satin, Title } from "./ui";

export default function Frost({ h, photo, sticker, onNext }: { h: Hug; photo?: LovePhoto; sticker: ReactNode; onNext: () => void }) {
  const [clear, setClear] = useState(false);
  const last = useRef(0);
  const wind = useRef<{ stop: (ms?: number) => void } | null>(null);
  useEffect(() => {
    wind.current = sfx("hg-wind", { gain: 0.9 });
    return () => wind.current?.stop(900);
  }, []);

  return (
    <Room label="The frosted window" className="hg-frost">
      <Kicker>It&rsquo;s cold out here</Kicker>
      <Title>{clear ? "There you are" : "Wipe the window"}</Title>
      <div className="hg-window">
        <ScratchCanvas
          height={0}
          cover={["#E8F0F7", "#C9D8E6"]}
          label="wipe the frost ✋"
          labelColor="rgba(40,60,90,.55)"
          threshold={0.42}
          brush={34}
          radius={18}
          revealLinkAfterMs={5000}
          onProgress={() => {
            const now = performance.now();
            if (now - last.current > 140) {
              last.current = now;
              sfx("hg-squeak", { gain: 0.5, detune: Math.random() * 400 - 200 });
            }
          }}
          onReveal={() => {
            setClear(true);
            sfx("hg-reveal", { gain: 0.8 });
            wind.current?.stop(2000);
          }}
          style={{ position: "absolute", inset: 0, height: "100%" }}
        >
          <div className="hg-behind">
            {photo ? <CroppedPhoto photo={photo} eager className="hg-behindPh" /> : <span className="hg-behindGlow" />}
            <div className="hg-behindTx">
              <p style={{ fontFamily: SOFT }}>{h.recipient},</p>
              <b style={{ fontFamily: HAND }}>{h.frostLine}</b>
            </div>
          </div>
        </ScratchCanvas>
        <span className="hg-mullion is-v" aria-hidden />
        <span className="hg-mullion is-h" aria-hidden />
        <span className="hg-winSticker">{sticker}</span>
      </div>
      {clear ? <Satin big onClick={() => { sfx("hg-step", { gain: 0.6 }); onNext(); }}>Go to them →</Satin> : <Hint>Use your finger — the glass is cold</Hint>}
      <style>{CSS}</style>
    </Room>
  );
}

const CSS = `
.hg-window { position: relative; width: min(86vw, 380px); aspect-ratio: 4 / 5; border-radius: 22px; padding: 0; box-sizing: border-box;
  box-shadow: 0 0 0 12px #3A2A24, 0 0 0 15px #5A4034, 0 40px 70px -30px rgba(0,0,0,.8); background: #0E1428; }
.hg-behind { position: absolute; inset: 0; border-radius: 18px; overflow: hidden; }
.hg-behindPh { position: absolute !important; inset: 0; filter: saturate(.9) brightness(.62); }
.hg-behindGlow { position: absolute; inset: 0; background: radial-gradient(70% 60% at 50% 60%, #FF8A3D, #D9367A 45%, #1B2340); }
.hg-behindTx { position: absolute; inset: 0; display: grid; place-content: end center; gap: 6px; text-align: center; padding: 18px 18px 16%; color: #FFF6EA;
  text-shadow: 0 2px 18px rgba(0,0,0,.65); background: radial-gradient(60% 50% at 50% 50%, rgba(255,160,90,.28), transparent 70%); }
.hg-behindTx p { margin: 0; font-size: clamp(28px, 8vw, 40px); font-style: italic; }
.hg-behindTx b { font-size: clamp(30px, 9vw, 44px); line-height: 1.05; color: #FFD9B0; }
.hg-mullion { position: absolute; background: #3A2A24; pointer-events: none; z-index: 3; box-shadow: 0 0 0 1px rgba(255,255,255,.06); }
.hg-mullion.is-v { left: 50%; top: 0; bottom: 0; width: 8px; margin-left: -4px; }
.hg-mullion.is-h { top: 36%; left: 0; right: 0; height: 8px; }
.hg-winSticker { position: absolute; right: -16px; bottom: -18px; z-index: 4; pointer-events: none; }
`;
