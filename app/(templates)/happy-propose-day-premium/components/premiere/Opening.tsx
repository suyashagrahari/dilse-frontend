"use client";

// The doors: the ticket (gate art), the projector leader (3·2·1 + "Based on a true story") and the opening titles.

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "../../../_valentine/kit";
import { PremiumCTA, RevealText, TiltCard, usePremium } from "../../../_valentine/kit/premium";
import { Dock, Typed } from "./parts";
import type { Film } from "./util";

/** The gate's art: a printed cinema ticket (paper + foil + perforation, all CSS). */
export function Ticket({ film, date }: { film: Film; date: string }) {
  return (
    <TiltCard radius={6} foil max={10} glare={0.4} style={{ width: "100%" }}>
      <div className="pr-ticket">
        <div className="pr-tkMain">
          <span className="pr-tkAdmit">Admit one</span>
          <span className="pr-tkTitle">{film.title}</span>
          <span className="pr-tkMeta">Row A · Seat 1 · {date}</span>
        </div>
        <div className="pr-tkStub">
          <span>Nº 0001</span>
        </div>
      </div>
    </TiltCard>
  );
}

/** The Academy leader: 3, 2, 1 with the sweep and the pop, then "Based on a true story." Auto-advances. */
export function Leader({ onDone }: { onDone: () => void }) {
  const { sfx } = usePremium();
  const reduce = useReducedMotion();
  const [n, setN] = useState(3);
  const [phase, setPhase] = useState<"count" | "black" | "true">("count");
  const doneRef = useRef(onDone);
  useEffect(() => {
    doneRef.current = onDone;
  });
  useEffect(() => {
    const bed = sfx("projector-loop", { gain: 0.5 });
    const step = reduce ? 450 : 900;
    const ts: number[] = [];
    sfx("pr-beep");
    ts.push(window.setTimeout(() => { setN(2); sfx("pr-beep"); }, step));
    ts.push(window.setTimeout(() => { setN(1); sfx("pr-beep"); }, step * 2));
    ts.push(window.setTimeout(() => { setPhase("black"); bed.stop(400); }, step * 3));
    ts.push(window.setTimeout(() => setPhase("true"), step * 3 + 450));
    return () => {
      ts.forEach((t) => window.clearTimeout(t));
      bed.stop(200);
    };
  }, [sfx, reduce]);

  return (
    <div className={`pr-leader${phase !== "count" ? " is-black" : ""}`} onClick={() => phase === "true" && doneRef.current()}>
      {phase === "count" && (
        <>
          <span className="pr-cross h" aria-hidden />
          <span className="pr-cross v" aria-hidden />
          <div className="pr-dial" aria-live="polite">
            <span key={`s${n}`} className="pr-sweep" aria-hidden />
            <span key={n} className="pr-num">
              {n}
            </span>
          </div>
          <span className="pr-flicker" aria-hidden />
          <span className="pr-scratch" aria-hidden />
          <span className="pr-scratch b" aria-hidden />
        </>
      )}
      {phase === "true" && (
        <p className="pr-true">
          <Typed text="Based on a true story." speed={62} caret onDone={() => window.setTimeout(() => doneRef.current(), 1500)} />
        </p>
      )}
    </div>
  );
}

/** "{FROM} presents" → the film's title in foil, the stars, the tagline → "Roll film". */
export function Titles({ film, onRoll }: { film: Film; onRoll: () => void }) {
  const reduce = useReducedMotion();
  const { sfx } = usePremium();
  const [step, setStep] = useState(reduce ? 2 : 0);
  useEffect(() => {
    if (reduce) return;
    const a = window.setTimeout(() => setStep(1), 2300);
    const b = window.setTimeout(() => setStep(2), 4600);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [reduce]);
  return (
    <div className="pr-scene">
      <div className="pr-in">
        {step === 0 && (
          <div className="pr-center" key="presents">
            <p className="pr-eyebrow pr-blurin" style={{ fontSize: 13 }}>
              {film.from} presents
            </p>
          </div>
        )}
        {step >= 1 && (
          <div className="pr-center" key="title">
            <RevealText as="h1" text={film.title} className="pr-display pr-it pr-title pr-foilw" stagger={0.14} play />
            <span className="pr-rule pr-fade" style={{ animationDelay: ".7s" }} />
            <p className="pr-eyebrow pr-fade" style={{ animationDelay: ".9s" }}>
              Starring {film.to}
            </p>
            {film.tagline && (
              <p className="pr-tagline pr-fade" style={{ animationDelay: "1.4s" }}>
                {film.tagline}
              </p>
            )}
          </div>
        )}
      </div>
      <Dock>
        {step >= 2 ? (
          <div className="pr-fade">
            <PremiumCTA tone="gold" cue={null} onClick={() => { sfx("pr-clap"); onRoll(); }} className="pr-cta">
              Roll film
            </PremiumCTA>
          </div>
        ) : (
          <button type="button" className="pr-link" onClick={() => setStep(2)}>
            Skip titles
          </button>
        )}
      </Dock>
    </div>
  );
}
