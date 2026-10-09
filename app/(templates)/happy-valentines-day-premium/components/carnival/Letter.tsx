"use client";

// Stall 6 · The letter at the kissing booth. A heart-shaped mailbox waits under the booth's sign; tap it: the flag
// pops up, an envelope slides out, the wax seal cracks and his letter types itself onto a lined card.

import { useState } from "react";
import { Typewriter } from "../../../_valentine/kit";
import { C, GIF } from "./model";
import { Gif, SlotGif, StallHead, Washi, reward, useStall } from "./ui";

export default function Letter({ letter }: { letter: string }) {
  const { c, done, sfx } = useStall();
  const [stage, setStage] = useState<"closed" | "envelope" | "open">("closed");

  const openBox = () => {
    if (stage !== "closed") return;
    setStage("envelope");
    sfx("creak", { gain: 0.4 });
    window.setTimeout(() => sfx("paper-rustle", { gain: 0.6 }), 260);
    window.setTimeout(() => {
      setStage("open");
      sfx("wax-crack", { gain: 0.7 });
      reward(sfx, document.querySelector(".vc-mailbox"), { cue: "kiss" });
    }, 1100);
  };

  return (
    <section className="vc-scene vc-letterScene" aria-label="The letter">
      <StallHead kicker="Stall 6 · Kissing booth" title={stage === "open" ? `For ${c.to}` : "You've got mail"} hint={stage === "closed" ? "Tap the mailbox" : undefined} />
      {stage !== "open" ? (
        <div className="vc-booth">
          <SlotGif id="vc4-letter" size={96} tilt={-4} float className="vc-boothGif" eager />
          <div className="vc-boothSign">
            <b>KISSING BOOTH</b>
            <small>closed to everyone except {c.to}</small>
          </div>
          <button type="button" className={`vc-mailbox${stage === "envelope" ? " is-open" : ""}`} onClick={openBox} aria-label="Open the mailbox">
            <svg viewBox="0 0 160 200" width="160" height="200" aria-hidden>
              <rect x="74" y="120" width="12" height="80" rx="4" fill="#C9184A" />
              <path d="M80 136 C 30 104, 14 78, 14 58 A 33 33 0 0 1 80 46 A 33 33 0 0 1 146 58 C 146 78, 130 104, 80 136 Z" fill={C.primary} />
              <path d="M80 126 C 40 100, 26 78, 26 62 A 25 25 0 0 1 80 56" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="5" strokeLinecap="round" />
              <rect className="vc-slot" x="52" y="70" width="56" height="9" rx="4.5" fill="#8A0E33" />
              <g className="vc-flag">
                <rect x="140" y="40" width="5" height="44" rx="2" fill="#590D22" />
                <path d="M145 40 L 166 46 L 145 54 Z" fill={C.pop} />
              </g>
            </svg>
            <span className="vc-envelope" aria-hidden>
              <i />
            </span>
          </button>
          <Gif src={GIF.loveLetter} size={70} tilt={10} float className="vc-letterGif" />
        </div>
      ) : (
        <div className="vc-paperWrap">
          <Washi rot={-5} style={{ left: 24, top: -10 }} />
          <Washi color="#FFD166" rot={7} style={{ right: 24, top: -10 }} />
          <article className="vc-paper">
            <div className="vc-paperText">
              <Typewriter text={letter} speed={22} onDone={done} />
            </div>
            <p className="vc-sign">— {c.from} 💌</p>
          </article>
          <Gif src={GIF.bearHeart} size={64} tilt={-8} className="vc-paperGif" />
        </div>
      )}
    </section>
  );
}
