"use client";

// The last stamp (THE money moment). The passport lies open on its last page: her photo on the left as the holder,
// and on the right an empty dashed circle, "FOREVER HUGGER · stamp here", with a big rubber stamp hovering over it.
// His question sits above with a big Yes ("Stamp it 💗") and a No that pleads and runs (kit RunawayNo; each No swaps
// the teddy for a teary bear). On YES: react("answered"), then drop(): during the riser the stamp lifts and shakes;
// on the chorus it SLAMS down (thunk + impact), the Forever stamp is inked, and the passport bursts open into a
// full-screen wall of hugging couples popping in one by one around her photo in a heart, with confetti, his
// yes-line and both names. Rendered in a portal so it truly covers the viewport.

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CroppedPhoto, RunawayNo, burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import { useSongDrop } from "../../../_valentine/kit/premium";
import { Gif, HugEmblem, InkStamp, Slot } from "./art";
import { Puffy, Scene, useAww, usePassport, useSfx } from "./ui";
import { FIXED_GIF, WALL_GIFS, photoAt, rand } from "./util";
import { PASSPORT_FONT_VARS } from "./fonts";

const NO_LINES = ["are you sure? 🥺", "the bear is sad now", "one tiny hug?", "pls 🥺", "okay, I'll ask nicely"];

export function FinalScene({ onAnswered, onDone }: { onAnswered: (dodges: number) => void; onDone: () => void }) {
  const { g, date, stamp } = usePassport();
  const sfx = useSfx();
  const { drop } = useSongDrop();
  const [dodges, setDodges] = useState(0);
  const [sad, setSad] = useState(false);
  const [phase, setPhase] = useState<"ask" | "rising" | "slam">("ask");
  const sadT = useRef(0);
  const photo = photoAt(g, 0);

  // Warm the wall's GIFs while she reads the question, so they are there on the chorus.
  useEffect(() => {
    const imgs = WALL_GIFS.map((src) => {
      const i = new Image();
      i.decoding = "async";
      i.src = src;
      return i;
    });
    return () => imgs.forEach((i) => (i.src = ""));
  }, []);
  useEffect(() => () => window.clearTimeout(sadT.current), []);

  const onDodge = (d: number) => {
    setDodges(d);
    setSad(true);
    sfx("hp-boing", { gain: 0.4, detune: -200 - d * 60 });
    haptic(8);
    window.clearTimeout(sadT.current);
    sadT.current = window.setTimeout(() => setSad(false), 1400);
  };
  const onYes = (d: number) => {
    if (phase !== "ask") return;
    onAnswered(d);
    setPhase("rising");
    haptic([20, 30, 20]);
    drop(() => {
      setPhase("slam");
      sfx("hp-thunk", { gain: 1 });
      haptic([20, 30, 20, 30, 60]);
      stamp("forever");
    });
  };

  return (
    <Scene id="final" now="forever" label="The last stamp" kicker="Stamp 6 · the big one" title={g.question} sub={dodges ? `${dodges}× no? The bear is getting nervous 🥺` : "Be honest 🤗"}>
      <div className={`hp-last${phase !== "ask" ? " is-yes" : ""}${phase === "slam" ? " is-slam" : ""}`}>
        <div className="hp-lastPage hp-lastPage--l">
          <span className="hp-lastPhoto">{photo ? <CroppedPhoto photo={photo} alt={photo.caption ?? ""} eager /> : <HugEmblem species={g.species} size={96} />}</span>
          <b>{g.to}</b>
          <small>{g.hugTitle}</small>
        </div>
        <div className="hp-lastPage hp-lastPage--r">
          <span className="hp-lastSpot">
            {phase === "slam" ? (
              <InkStamp kind="forever" size={128} date={date} top={`${g.hugTitle}`} uid="final" className="hp-landing hp-landing--big" />
            ) : (
              <span className="hp-lastEmpty">
                <small>FOREVER</small>
                <small>stamp here</small>
              </span>
            )}
          </span>
          <span className="hp-rubber" aria-hidden>
            <svg viewBox="0 0 100 120" width="100%" height="100%">
              <ellipse cx="50" cy="22" rx="20" ry="18" fill="#FF8A6B" stroke="#fff" strokeWidth="4" />
              <rect x="42" y="34" width="16" height="36" rx="6" fill="#E9B98F" stroke="#fff" strokeWidth="3" />
              <rect x="14" y="68" width="72" height="22" rx="8" fill="#E0603F" stroke="#fff" strokeWidth="4" />
              <rect x="18" y="90" width="64" height="12" rx="4" fill="#B8462C" />
              <path d="M44 18 C40 14 40 10 43 10 C45 10 46 12 46 13 C46 12 47 10 49 10 C52 10 52 14 48 18 Z" fill="#fff" transform="translate(4 4)" />
            </svg>
          </span>
        </div>
        <span className="hp-reactor hp-reactor--final">{sad ? <Gif key="sad" src={FIXED_GIF.comfort} size={96} className="hp-pop" tilt={4} eager /> : <Gif key="ask" src={FIXED_GIF.heart} size={96} tilt={-4} eager className="hp-float" />}</span>
      </div>
      {phase === "ask" ? (
        <RunawayNo
          className="hp-yesno"
          height={170}
          yesLabel="Stamp it 💗"
          noLabel="no hugs 🙅"
          noLines={NO_LINES}
          surrenderLabel="okay fine, yes 💗"
          maxDodges={5}
          onDodge={onDodge}
          onYes={onYes}
          yesStyle={{ font: "700 18px/1 var(--font-fredoka), Fredoka, sans-serif", padding: "16px 28px", borderRadius: 999, background: "linear-gradient(180deg, #FFA083 0%, #FF8A6B 100%)", color: "#fff", boxShadow: "0 5px 0 #E0603F, 0 12px 26px rgba(224,96,63,.3)" }}
          noStyle={{ font: "600 15px/1 var(--font-fredoka), Fredoka, sans-serif", borderRadius: 999, border: "2px solid #FFD3B8", color: "#8A5A48", background: "#fff" }}
        />
      ) : (
        <p className="hp-lastWait" aria-live="polite">
          {phase === "rising" ? "Okay. Hold still… 💗" : "Stamped. Forever."}
        </p>
      )}
      {phase === "slam" && typeof document !== "undefined" && createPortal(<HugWall onDone={onDone} />, document.body)}
    </Scene>
  );
}

/** The wall: hugging couples pop in one by one around her photo in a heart. */
function HugWall({ onDone }: { onDone: () => void }) {
  const { g, day, gifs, date } = usePassport();
  const reduce = useReducedMotion();
  const aww = useAww();
  const sfx = useSfx();
  const [cta, setCta] = useState(false);
  const photo = photoAt(g, 0);
  const tiles = useMemo(
    () =>
      WALL_GIFS.map((src, i) => {
        // a ring of ten around the middle: four left, four right, one top, one bottom
        const ring = [
          { x: 14, y: 13 },
          { x: 86, y: 13 },
          { x: 9, y: 34 },
          { x: 91, y: 34 },
          { x: 9, y: 56 },
          { x: 91, y: 56 },
          { x: 16, y: 86 },
          { x: 84, y: 86 },
          { x: 50, y: 7 },
          { x: 50, y: 94 },
        ][i];
        return { src, ...ring, r: rand(i, 5) * 16 - 8, d: 0.25 + i * 0.16 };
      }),
    [],
  );

  useEffect(() => {
    aww({ x: 0.5, y: 0.45 }, true);
    burst({ kind: "confetti", origin: { x: 0.5, y: 0.3 }, count: 120, spread: 0.7, colors: ["#FF8A6B", "#9FE5C8", "#FFD3B8", "#FF7AA2", "#FFE27A", "#C9B6FF"] });
    const pops = tiles.map((t, i) => window.setTimeout(() => sfx("pop", { gain: 0.35, detune: i * 70 }), (reduce ? 0 : t.d * 1000) + 80));
    const c = window.setTimeout(() => setCta(true), reduce ? 300 : 3800);
    return () => {
      pops.forEach((t) => window.clearTimeout(t));
      window.clearTimeout(c);
    };
    // once, when the wall opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`hp-wall ${PASSPORT_FONT_VARS}`} role="dialog" aria-label="Every hug at once" aria-modal="true">
      <div className="hp-wallTiles" aria-hidden>
        {tiles.map((t, i) => (
          <span key={i} className="hp-wallTile" style={{ left: `${t.x}%`, top: `${t.y}%`, ["--r" as string]: `${t.r}deg`, animationDelay: `${t.d}s` }}>
            <Gif src={t.src} size={96} eager />
          </span>
        ))}
      </div>
      <div className="hp-wallMid">
        <div className="hp-wallHeart">
          <span className="hp-wallPhoto">{photo ? <CroppedPhoto photo={photo} alt={photo.caption ?? ""} eager /> : <HugEmblem species={g.species} size={150} />}</span>
          <InkStamp kind="forever" size={104} date={date} top={g.hugTitle} uid="wall" className="hp-wallStamp" />
        </div>
        <div className="hp-wallSay">
          <Slot day={day} gifs={gifs} id="hp6-yes" size={104} className="hp-wallGif" tilt={-6} eager />
          <p className="hp-wallLine">{g.yesLine}</p>
          <p className="hp-wallNames">
            {g.to} <span>♥</span> {g.from}
          </p>
        </div>
        <div className={`hp-wallCta${cta ? " is-on" : ""}`}>
          <Puffy onClick={onDone} className="hp-heartbeat" disabled={!cta}>
            See my passport 🛂
          </Puffy>
        </div>
      </div>
    </div>
  );
}
