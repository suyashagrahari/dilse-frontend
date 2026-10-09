"use client";

// The final title card and the money moment.
//   ask      the question, enormous, in a thin scope band. Yes / No; No dodges through the sender's lines, then
//            gives up: "Director's cut: No was never in the script."
//   rolling  Yes → the riser (useSongDrop), the title card glows
//   yes      on the peak: the bars sweep open to full screen, the song lands on its chorus, the last photo floods
//            in, "{name} said yes." and the audience applauds → Roll credits

import { useEffect, useRef, useState } from "react";
import { Sticker, haptic } from "../../../_valentine/kit";
import { PremiumCTA, RevealText, usePremium, useSongDrop } from "../../../_valentine/kit/premium";
import type { DayConfig, ValentineDayData } from "../../../_valentine/types";
import { Dock, Flash, Still, Typed } from "./parts";
import { stamp, type Film } from "./util";

export interface QuestionProps {
  film: Film;
  day: DayConfig;
  data: ValentineDayData;
  /** The visitor said yes (before the drop). */
  onAnswer: (noDodges: number) => void;
  /** The drop's peak: the root opens the letterbox. */
  onPeak: () => void;
  onCredits: () => void;
}

export function Question({ film, day, data, onAnswer, onPeak, onCredits }: QuestionProps) {
  const { sfx, music } = usePremium();
  const { drop } = useSongDrop();
  const [phase, setPhase] = useState<"ask" | "rolling" | "yes">("ask");
  const [dodges, setDodges] = useState(0);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [flash, setFlash] = useState(0);
  const [cta, setCta] = useState(false);
  const [at, setAt] = useState<Date | null>(null);
  const gaveUp = dodges >= film.noLines.length;
  const lastDodge = useRef(0);

  // the house goes quiet before the question
  useEffect(() => {
    if (music?.canFade) music.fadeTo(0.45, 1600);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dodge = () => {
    if (gaveUp || phase !== "ask") return;
    const now = performance.now();
    if (now - lastDodge.current < 380) return;
    lastDodge.current = now;
    const d = dodges + 1;
    setDodges(d);
    // a fixed little dance that never lands on Yes (No sits to its right)
    const STEPS = [{ x: 92, y: 4 }, { x: -92, y: -4 }, { x: 74, y: 8 }, { x: -70, y: 0 }];
    setPos(STEPS[(d - 1) % STEPS.length]);
    sfx("swoosh-soft", { gain: 0.6, detune: d * 80 });
    haptic(8);
  };

  const yes = () => {
    if (phase !== "ask") return;
    setPhase("rolling");
    setAt(new Date());
    onAnswer(dodges);
    haptic([12, 60, 30]);
    drop(() => {
      setPhase("yes");
      setFlash((k) => k + 1);
      onPeak();
      sfx("pr-applause", { dur: 3.6, gain: 0.9 });
      sfx("firework", { at: 0.5, gain: 0.5 });
      sfx("firework", { at: 1.3, gain: 0.4, pan: 0.4 });
      window.setTimeout(() => setCta(true), 4200);
    });
  };

  const slot = day.gifSlots.find((g) => g.id === "pp4-please");
  const said = phase === "yes";

  return (
    <div className="pr-scene">
      <div className="pr-frame" style={{ opacity: said ? 1 : 0, transition: "opacity .35s ease-out" }}>
        <Still photo={film.hero} grade="warm" kb="out" drift={20} eager />
        <span className="pr-yesScrim" aria-hidden />
      </div>
      <div className="pr-in">
        <div className={`pr-q${phase === "rolling" ? " is-rolling" : ""}${said ? " is-gone" : ""}`}>
          <RevealText as="h2" text={film.question} className="pr-display" play delay={0.5} stagger={0.16} />
        </div>
      </div>
      {said && (
        <div className="pr-yesText" aria-live="polite">
          <span className="pr-eyebrow pr-fade" style={{ animationDelay: ".5s", color: "var(--pr-gold2)" }}>
            {at ? `Premiered ${stamp(at)}` : "Premiered tonight"}
          </span>
          <RevealText as="h2" text={`${film.to} said yes.`} className="pr-display pr-it" play delay={0.25} stagger={0.12} />
          {film.afterYes && (
            <p className="pr-sub" style={{ maxWidth: "34ch" }}>
              <b>{film.from.toUpperCase()}:</b> <Typed text={film.afterYes} speed={36} play />
            </p>
          )}
        </div>
      )}
      <Flash k={flash} />
      {dodges > 0 && !said && slot && (
        <div className="pr-please pr-fade" style={{ bottom: "calc(var(--pr-bb) + 10px)" }}>
          <Sticker slug={day.slug} slot={slot} value={data.gifs?.[slot.id]} size={68} alt="" eager />
        </div>
      )}
      <Dock>
        {said ? (
          cta ? (
            <div className="pr-fade">
              <PremiumCTA tone="gold" cue={null} className="pr-cta" onClick={() => { sfx("pr-clap"); onCredits(); }}>
                Roll credits
              </PremiumCTA>
            </div>
          ) : null
        ) : (
          <div className="pr-choices" style={{ opacity: phase === "rolling" ? 0 : 1, transition: "opacity .5s", pointerEvents: phase === "ask" ? "auto" : "none" }}>
            <div className="pr-fade" style={{ animationDelay: "1.6s" }}>
              <PremiumCTA tone="gold" cue={null} className="pr-cta" onClick={yes} style={{ minWidth: 210 }}>
                Yes
              </PremiumCTA>
            </div>
            {gaveUp ? (
              <div className="pr-cut pr-fade">
                <small>No was never in the script.</small>
                <button type="button" className="pr-ghost" style={{ borderColor: "rgba(216,178,90,.6)", color: "#F3D58C" }} onClick={yes}>
                  Director&rsquo;s cut: Yes
                </button>
              </div>
            ) : (
              <div className="pr-fade" style={{ animationDelay: "1.9s" }}>
                <button
                  type="button"
                  className="pr-ghost pr-no"
                  style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
                  onPointerDown={(e) => {
                    if (e.pointerType !== "mouse") {
                      e.preventDefault();
                      dodge();
                    }
                  }}
                  onMouseEnter={dodge}
                  onClick={dodge}
                >
                  {dodges === 0 ? "No" : film.noLines[dodges - 1]}
                </button>
              </div>
            )}
          </div>
        )}
      </Dock>
    </div>
  );
}
