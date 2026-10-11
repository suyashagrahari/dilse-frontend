"use client";

// Station 5 · The melting room. A glossy chocolate heart: she holds her thumb on it (or taps a few times) and it warms,
// drips, and melts into a puddle; underneath waits his heart line, then his letter, which types itself onto a
// cream wrapper-paper card.

import { useState } from "react";
import { Typewriter, useHoldProgress } from "../../../_valentine/kit";
import { C, GIF } from "./model";
import { Drips, Gif, SlotGif, StationHead, Washi, reward, useStation } from "./ui";

/** Drip points along the heart's lower edges (x, y on the edge, width, max length). */
const DRIPS = [
  { x: 36, y: 112, w: 13, len: 22 },
  { x: 60, y: 136, w: 15, len: 32 },
  { x: 84, y: 156, w: 11, len: 16 },
  { x: 116, y: 156, w: 14, len: 26 },
  { x: 140, y: 136, w: 11, len: 14 },
  { x: 164, y: 112, w: 15, len: 28 },
];

export default function Melt({ letter }: { letter: string }) {
  const { f, sfx, done } = useStation();
  const [stage, setStage] = useState<"solid" | "melted" | "letter">("solid");
  const hasLetter = !!letter.trim();
  const hold = useHoldProgress({
    duration: 1700,
    taps: 6,
    onComplete: () => {
      sfx("sf-plop", { gain: 0.6, detune: -300 });
      sfx("bubble", { gain: 0.4, count: 4 });
      setStage("melted");
      window.setTimeout(() => {
        reward(sfx, document.querySelector(".sf-heartLine"), { big: true, cue: "chime-cascade" });
        if (!hasLetter) done();
      }, 500);
    },
  });
  const p = hold.progress;

  const openLetter = () => {
    setStage("letter");
    sfx("paper-rustle", { gain: 0.6 });
  };

  return (
    <section className="sf-scene sf-melt" aria-label="The melting room">
      <StationHead
        kicker="Station 5 · The melting room"
        title={stage === "letter" ? `For ${f.to}` : stage === "melted" ? "Melted. Just like me." : "Warm it up"}
        hint={stage === "solid" ? (hold.holding ? "Keep holding… it's melting" : "Hold your thumb on the heart") : undefined}
      />

      {stage !== "letter" ? (
        <div className={`sf-meltStage is-${stage}${hold.holding ? " is-holding" : ""}`} style={{ ["--p" as string]: p }}>
          <SlotGif id="sf4-melt" size={92} tilt={-6} float className="sf-meltGif" eager />
          <div className="sf-heartLine" aria-live="polite">
            {stage === "melted" ? (
              <>
                <Drips seed={3} />
                <b>{f.heartLine}</b>
                <small>— {f.from}</small>
              </>
            ) : null}
          </div>
          {stage === "solid" && (
            <button type="button" className="sf-chocHeart" {...hold.bind} aria-label="Hold to melt the chocolate heart">
              <svg viewBox="0 0 200 190" width="220" height="210" aria-hidden>
                <defs>
                  <linearGradient id="sf-hg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#8B5A3C" />
                    <stop offset=".55" stopColor="#5A3221" />
                    <stop offset="1" stopColor="#3E2216" />
                  </linearGradient>
                </defs>
                <path d="M100 172 C 46 136, 12 104, 12 66 A 42 42 0 0 1 100 46 A 42 42 0 0 1 188 66 C 188 104, 154 136, 100 172 Z" fill="url(#sf-hg)" />
                <path d="M100 160 C 54 128, 26 100, 26 68 A 32 32 0 0 1 100 58 A 32 32 0 0 1 174 68 C 174 100, 146 128, 100 160 Z" fill="none" stroke="#A0673F" strokeWidth="3" opacity=".6" />
                <path d="M44 56 C 54 40, 72 38, 80 46" fill="none" stroke="#fff" strokeOpacity=".45" strokeWidth="8" strokeLinecap="round" />
                {DRIPS.map((d, i) => (
                  <path
                    key={i}
                    className="sf-hDrip"
                    d={`M${d.x - d.w / 2} ${d.y - 10} V${d.y + d.len * p} A ${d.w / 2} ${d.w / 2} 0 0 0 ${d.x + d.w / 2} ${d.y + d.len * p} V${d.y - 10} Z`}
                    fill="#5A3221"
                  />
                ))}
                <text x="100" y="108" textAnchor="middle" fontSize="20" fontWeight="700" fill="#FFD1DF" style={{ fontFamily: "var(--sf-gummy), sans-serif" }}>
                  {f.to}
                </text>
              </svg>
              <span className="sf-holdRing" aria-hidden>
                <i style={{ transform: `scaleX(${p})` }} />
              </span>
            </button>
          )}
          {stage === "melted" && (
            <>
              {hasLetter && (
                <button type="button" className="sf-puffy is-pink sf-readBtn" onClick={openLetter}>
                  Read my letter 💌
                </button>
              )}
              <Gif src={GIF.loveLetter} size={70} tilt={6} className="sf-puddleGif sf-popIn" />
            </>
          )}
        </div>
      ) : (
        <div className="sf-paperWrap">
          <Washi rot={-5} style={{ left: 24, top: -10 }} />
          <Washi color={C.mint} rot={7} style={{ right: 24, top: -10 }} />
          <article className="sf-paper">
            <div className="sf-paperText">
              <Typewriter text={letter} speed={22} onDone={done} />
            </div>
            <p className="sf-sign">{f.signOff || `— ${f.from}`} 🍫</p>
          </article>
          <Gif src={GIF.bearsNuzzle} size={70} tilt={-8} className="sf-paperGif" />
        </div>
      )}
    </section>
  );
}
