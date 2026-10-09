"use client";

// Chapter I · Arrival. One focal thing: the bear (Fluent 3D art, never a drawing) in a pool of warm light, with a
// woven care tag sewn to his side carrying both names. Squeeze him (tap): he squashes and springs back, a plush
// squeak (sfx plush-squeak; visual twin: the squash + three little hearts) and his first words in a bubble.
// Then "Read his file".

import { useState, type ReactNode } from "react";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { Fluent3D, PremiumCTA, RevealText, usePremium } from "../../../_valentine/kit/premium";
import type { Papers } from "./util";

export function MeetScene({ p, n, sticker, onNext }: { p: Papers; n: string; sticker: ReactNode; onNext: () => void }) {
  const { sfx } = usePremium();
  const reduce = useReducedMotion();
  const [squeezes, setSqueezes] = useState(0);
  const words = p.firstWords || `Hi ${p.to}. ${p.from} sent me. I'm yours now.`;

  const squeeze = () => {
    setSqueezes((k) => k + 1);
    sfx("plush-squeak", { gain: 0.8, detune: squeezes % 2 ? 120 : 0 });
    if (squeezes === 0) sfx("pop", { at: 0.28, gain: 0.35 });
    haptic(14);
  };

  return (
    <section className="ap-scene ap-meet" aria-label={`Meet ${p.teddy}`}>
      <header className="ap-head">
        <p className="ap-eyebrow">{n} · Arrival</p>
        <RevealText as="h1" text={`Meet ${p.teddy}.`} className="ap-display" delay={0.25} />
      </header>

      <div className="ap-bearStage">
        <i className="ap-pool" aria-hidden />
        <button
          type="button"
          className={`ap-bear${squeezes ? " is-awake" : ""}`}
          onClick={squeeze}
          aria-label={squeezes ? `Squeeze ${p.teddy} again` : `Squeeze ${p.teddy}`}
        >
          <span key={squeezes} className={squeezes && !reduce ? "ap-squash" : undefined}>
            <Fluent3D name="teddy-bear" size={196} eager glow="#E9C08A" period={6.4} />
          </span>
          {squeezes > 0 && !reduce && (
            <span key={`h${squeezes}`} className="ap-hearts" aria-hidden>
              <i />
              <i />
              <i />
            </span>
          )}
        </button>
        <div className="ap-wovenTag" aria-label={`Sewn-in tag: ${p.teddy}, from ${p.from} to ${p.to}`}>
          <b>{p.teddy}</b>
          <span>
            {p.from} <em>♥</em> {p.to}
          </span>
        </div>
        {squeezes > 0 && (
          <p className="ap-bubble" role="status">
            {words}
          </p>
        )}
        <span className="ap-meetSticker">{sticker}</span>
      </div>

      <footer className="ap-foot">
        <p className="ap-sub">
          Born today, {p.born}.<br />
          Weighs exactly one hug.
        </p>
        {squeezes === 0 ? (
          <p className="ap-hint ap-pulse">Tap to give him a squeeze</p>
        ) : (
          <PremiumCTA tone="gold" cue="page-turn" onClick={onNext}>
            Read his file
          </PremiumCTA>
        )}
      </footer>
    </section>
  );
}
