"use client";

// The last stall · "Will you be my Valentine?" — the money moment.
// No hides behind a sticker each time she reaches for it, shrinks, says one of his lines (the little face under the
// question gets sadder), and after the last line turns into a second YES. On YES: drop() — the riser builds while
// the hearts gather, and on the song's chorus the Ferris wheel behind lights up and spins with her photos, pastel
// heart fireworks burst over the fair, confetti falls and a wall of happy couple stickers pops in.

import { useMemo, useRef, useState } from "react";
import { burst, haptic } from "../../../_valentine/kit";
import { fluentUrl, useSongDrop } from "../../../_valentine/kit/premium";
import { C, GIF, wheelPhotos } from "./model";
import { Wheel } from "./FerrisWheel";
import Fireworks from "./Fireworks";
import { Gif, SlotGif, reward, useStall } from "./ui";

/** Where No hides: behind one of these stickers (percent of the button zone). */
const HIDES = [
  { x: 78, y: 8, icon: "heart-ribbon" as const },
  { x: 10, y: 62, icon: "balloon" as const },
  { x: 82, y: 70, icon: "gift" as const },
  { x: 40, y: 92, icon: "teddy-bear" as const },
];
const DEFAULT_NO = ["Are you sure? 🥺", "Now you made it cry", "Last chance to change your mind", "Fine. This is a Yes now."];

export default function Question({ onAnswer }: { onAnswer: (noDodges: number) => void }) {
  const { c, data, sfx, done } = useStall();
  const { drop } = useSongDrop();
  const lines = c.noLines.length ? c.noLines : DEFAULT_NO;
  const [dodges, setDodges] = useState(0);
  const [phase, setPhase] = useState<"ask" | "riser" | "yes">("ask");
  const lastDodge = useRef(0);
  const yesRef = useRef<HTMLButtonElement>(null);
  const wheel = useMemo(() => wheelPhotos(c.photos), [c.photos]);
  const noIsYes = dodges >= lines.length;
  const customPlease = !!data.gifs?.["vc5-please"];

  const dodge = () => {
    if (noIsYes || phase !== "ask") return;
    const now = performance.now();
    if (now - lastDodge.current < 350) return;
    lastDodge.current = now;
    setDodges((d) => d + 1);
    sfx("swoosh-soft", { gain: 0.5 });
    sfx("plush-squeak", { gain: 0.35, detune: dodges * -150 });
    haptic(8);
  };

  const yes = () => {
    if (phase !== "ask") return;
    setPhase("riser");
    onAnswer(dodges);
    haptic([20, 30, 20, 30, 60]);
    drop(() => {
      setPhase("yes");
      reward(sfx, yesRef.current, { big: true, cue: "chime-cascade" });
      sfx("firework", { gain: 0.6 });
      burst({ kind: "confetti", count: 120, colors: [C.primary, C.soft, C.pop, C.lav, "#FFFFFF", C.mint] });
      window.setTimeout(() => sfx("firework", { gain: 0.45, detune: 200 }), 900);
      window.setTimeout(() => sfx("firework", { gain: 0.4, detune: -150 }), 1700);
      window.setTimeout(done, 2400);
    });
  };

  const sad = noIsYes ? GIF.smilingHearts : dodges >= 2 ? GIF.crying : dodges >= 1 ? GIF.holdingTears : null;
  const hide = HIDES[(dodges - 1 + HIDES.length) % HIDES.length];
  const noScale = Math.max(0.55, 1 - dodges * 0.13);
  const yesScale = Math.min(1.35, 1 + dodges * 0.1);
  const said = phase !== "ask";

  return (
    <section className={`vc-scene vc-ask is-${phase}`} aria-label="The big question">
      <div className="vc-askWheel" aria-hidden>
        <Wheel photos={wheel} lit={phase === "yes"} size="min(560px, 132vw)" />
      </div>
      <Fireworks play={phase === "yes"} />

      {phase !== "yes" ? (
        <div className="vc-askCard">
          <p className="vc-askHey">Hey {c.to},</p>
          <h2 className="vc-askQ">{c.question}</h2>
          <div className="vc-askFace">
            {sad && !customPlease ? <Gif src={sad} size={104} eager /> : <SlotGif id="vc5-please" size={104} eager />}
            {dodges > 0 && !said && (
              <span className="vc-bubble" key={dodges} aria-live="polite">
                {lines[Math.min(dodges, lines.length) - 1]}
              </span>
            )}
          </div>
          <div className="vc-btnZone">
            {dodges > 0 &&
              !noIsYes &&
              HIDES.map((h, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} className="vc-hideSticker" src={fluentUrl(h.icon)} alt="" width={64} height={64} style={{ left: `${h.x}%`, top: `${h.y}%` }} loading="lazy" decoding="async" />
              ))}
            <button ref={yesRef} type="button" className="vc-puffy is-cherry vc-yes" style={{ transform: `scale(${yesScale})` }} onClick={yes} disabled={said}>
              YES 💘
            </button>
            {noIsYes ? (
              <button type="button" className="vc-puffy is-lav vc-yes2" onClick={yes} disabled={said}>
                Also yes 💖
              </button>
            ) : (
              <button
                type="button"
                className={`vc-no${dodges ? " is-hiding" : ""}`}
                style={dodges ? { left: `${hide.x}%`, top: `${hide.y}%`, transform: `translate(-50%, -50%) scale(${noScale})` } : undefined}
                onPointerEnter={(e) => e.pointerType === "mouse" && dodge()}
                onPointerDown={(e) => {
                  e.preventDefault();
                  dodge();
                }}
                onClick={dodge}
                aria-label="No"
              >
                No
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="vc-yesCard">
          <p className="vc-yesBig">YAYYY! 💘</p>
          <p className="vc-yesLine">
            {c.from} just won the biggest prize at the fair: <b>you</b>.
          </p>
          <div className="vc-gifWall" aria-hidden>
            <SlotGif id="vc6-yes" size={120} tilt={-5} className="vc-wallItem" eager />
            <Gif src={GIF.catsJump} size={96} tilt={6} className="vc-wallItem" eager />
            <Gif src={GIF.penguinRun} size={96} tilt={-7} className="vc-wallItem" eager />
            <Gif src={GIF.bearsCheek} size={96} tilt={4} className="vc-wallItem" eager />
            <Gif src={GIF.catsBoop} size={90} tilt={-3} className="vc-wallItem" eager />
            <Gif src={GIF.penguinsHappy} size={96} tilt={7} className="vc-wallItem" eager />
          </div>
        </div>
      )}
    </section>
  );
}
