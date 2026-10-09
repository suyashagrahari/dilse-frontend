"use client";

// Scene 7 · The rose shower (THE money moment). "Will you keep my rose forever?" with a big Yes and a shy
// "naah 🥀" that wilts, pleads and runs (kit RunawayNo); each No swaps the panda offering a rose for a teary bear.
// On YES: react("answered"), then drop(): the riser, and on the chorus roses bloom across the WHOLE screen,
// petals pour down, and her bouquet of photos rises into the middle while its ribbon ties itself; his yes-line
// lands under it with the kissing-bears sticker. Rendered in a portal so it truly covers the viewport.

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { RunawayNo, haptic, useReducedMotion } from "../../../_valentine/kit";
import { useSongDrop, usePremium } from "../../../_valentine/kit/premium";
import type { DayConfig } from "../../../_valentine/types";
import { Plant, shadesFor } from "../../../happy-rose-day/components/rose/art";
import { petalShower } from "../../../happy-rose-day/components/rose/ui";
import { Cone, Defs, Gif, PhotoFlower, RoseHead, Slot } from "./art";
import { Puffy, Scene, useAww } from "./ui";
import { FIXED_GIF, rand, type Garden } from "./util";
import { GARDEN_FONT_VARS } from "./fonts";

/** Where the photo-flowers sit above the cone in the shower (centre-relative x, top y). */
const FLOWER_AT = [
  { x: 0, y: 34 },
  { x: -62, y: 58 },
  { x: 62, y: 58 },
  { x: -30, y: 96 },
  { x: 30, y: 96 },
];

const NO_LINES = ["are you sure? 🥺", "the rose is wilting…", "think again 🌹", "pls 🥺", "okay, I'll ask nicely"];

export function QuestionScene({ g, day, gifs, step, total, onAnswered, onDone }: { g: Garden; day: DayConfig; gifs?: Record<string, string>; step: number; total: number; onAnswered: (dodges: number) => void; onDone: () => void }) {
  const { sfx } = usePremium();
  const { drop } = useSongDrop();
  const [dodges, setDodges] = useState(0);
  const [sad, setSad] = useState(false);
  const [phase, setPhase] = useState<"ask" | "rising" | "bloom">("ask");
  const sadT = useRef(0);

  const onDodge = (d: number) => {
    setDodges(d);
    setSad(true);
    sfx("rg-boing", { gain: 0.4, detune: -200 - d * 60 });
    haptic(8);
    window.clearTimeout(sadT.current);
    sadT.current = window.setTimeout(() => setSad(false), 1400);
  };
  const onYes = (d: number) => {
    if (phase !== "ask") return;
    onAnswered(d);
    setPhase("rising");
    haptic([20, 30, 20]);
    drop(() => setPhase("bloom"));
  };
  useEffect(() => () => window.clearTimeout(sadT.current), []);

  return (
    <Scene id="question" step={step} total={total} label="One question" kicker="Step 7 · one question" title={g.question} sub={dodges ? `${dodges}× no? The rose is getting nervous 🥺` : "Be honest 🌹"}>
      <div className="rg-askStage">
        <div className={`rg-askRose${phase !== "ask" ? " is-yes" : ""}`}>
          <Plant progress={1} id="ask" sh={shadesFor(g.color)} />
        </div>
        <div className="rg-reactor rg-reactor--ask">
          {sad ? <Gif key="sad" src={FIXED_GIF.sad} size={104} className="rg-pop" tilt={4} eager /> : <Gif key="ask" src={FIXED_GIF.pandaOffers} size={104} tilt={-4} eager />}
        </div>
      </div>
      <RunawayNo
        className="rg-yesno"
        height={190}
        yesLabel="Yes, forever 🌹"
        noLabel="naah 🥀"
        noLines={NO_LINES}
        surrenderLabel="okay fine, yes 💗"
        maxDodges={5}
        onDodge={onDodge}
        onYes={onYes}
        yesStyle={{ font: "700 18px/1 var(--font-fredoka), Fredoka, sans-serif", padding: "16px 26px", borderRadius: 999, boxShadow: "0 5px 0 #D63F72, 0 12px 26px rgba(214,63,114,.3)" }}
        noStyle={{ font: "600 15px/1 var(--font-fredoka), Fredoka, sans-serif", borderRadius: 999, border: "2px solid #FFD1DF", color: "#8A4A5C" }}
      />
      {phase !== "ask" && typeof document !== "undefined" && createPortal(<RoseShower g={g} day={day} gifs={gifs} bloom={phase === "bloom"} onDone={onDone} />, document.body)}
    </Scene>
  );
}

function RoseShower({ g, day, gifs, bloom, onDone }: { g: Garden; day: DayConfig; gifs?: Record<string, string>; bloom: boolean; onDone: () => void }) {
  const reduce = useReducedMotion();
  const aww = useAww();
  const { sfx } = usePremium();
  const [tied, setTied] = useState(false);
  const [cta, setCta] = useState(false);
  const fired = useRef(false);
  const sfxRef = useRef(sfx);
  useEffect(() => {
    sfxRef.current = sfx;
  });
  const roses = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        // Two flanks and a top/bottom band, so the bouquet and the line in the middle stay clear.
        x: i % 3 === 2 ? 22 + rand(i, 3) * 56 : (i % 2 ? 2 + rand(i, 3) * 24 : 74 + rand(i, 3) * 24),
        y: i % 3 === 2 ? (rand(i, 5) > 0.5 ? 2 + rand(i, 7) * 10 : 90 + rand(i, 7) * 8) : 3 + rand(i, 7) * 94,
        s: 0.5 + rand(i, 11) * 0.55,
        r: rand(i, 13) * 70 - 35,
        d: 0.05 + (i / 26) * 1.4 + rand(i, 17) * 0.2,
        c: i % 5 === 0 ? "pink" : i % 7 === 0 ? "peach" : g.color,
      })),
    [g.color],
  );
  const colors = useMemo(() => Array.from(new Set(roses.map((r) => r.c))), [roses]);

  useEffect(() => {
    if (!bloom || fired.current) return;
    fired.current = true;
    aww({ x: 0.5, y: 0.5 }, true);
    petalShower(shadesFor(g.color), { x: 0.5, y: -0.05 }, 70);
    window.setTimeout(() => petalShower(shadesFor("pink"), { x: 0.5, y: -0.05 }, 40), 900);
    sfxRef.current("sparkle", { gain: 0.5, at: 0.4 });
    const t1 = window.setTimeout(() => {
      setTied(true);
      sfxRef.current("ribbon", { gain: 0.7 });
    }, reduce ? 0 : 1900);
    const t2 = window.setTimeout(() => setCta(true), reduce ? 300 : 3600);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [bloom, aww, g.color, reduce]);

  const photos = g.photos.slice(0, 5);
  return (
    <div className={`rg-shower ${GARDEN_FONT_VARS}${bloom ? " is-bloom" : ""}`} role="dialog" aria-label="Roses everywhere" aria-modal="true">
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
        {colors.map((c) => (
          <Defs key={c} id={`sh-${c}`} color={c} />
        ))}
      </svg>
      <div className="rg-showerRoses" aria-hidden>
        {roses.map((r, i) => (
          <span key={i} className="rg-showerRose" style={{ left: `${r.x}%`, top: `${r.y}%`, ["--s" as string]: String(r.s), ["--r" as string]: `${r.r}deg`, animationDelay: `${r.d}s` }}>
            <svg viewBox="-50 -95 100 110" width="100%" height="100%" style={{ overflow: "visible" }}>
              <RoseHead id={`sh-${r.c}`} open={1} s={1.05} />
            </svg>
          </span>
        ))}
      </div>
      <div className="rg-showerMid">
        <div className="rg-showerBouquet">
          <div className="rg-showerFlowers">
            {photos.map((p, i) => (
              <span key={i} className="rg-showerFlower" style={{ left: `calc(50% + ${FLOWER_AT[i].x}px - 37px)`, top: FLOWER_AT[i].y, animationDelay: `${0.5 + i * 0.12}s` }}>
                <PhotoFlower photo={p} color={g.color} size={74} eager />
              </span>
            ))}
          </div>
          <div className="rg-showerCone">
            <Cone tied={tied} color={g.color} />
          </div>
        </div>
        <div className="rg-showerSay">
          <Slot day={day} gifs={gifs} id="rg6-yes" size={110} className="rg-showerGif" tilt={-6} eager />
          <p className="rg-showerLine">{g.yesLine}</p>
          <p className="rg-showerNames">
            {g.to} <span>♥</span> {g.from}
          </p>
        </div>
        <div className={`rg-showerCta${cta ? " is-on" : ""}`}>
          <Puffy onClick={onDone} className="rg-heartbeat" disabled={!cta}>
            Press it in my diary 📖
          </Puffy>
        </div>
      </div>
    </div>
  );
}
