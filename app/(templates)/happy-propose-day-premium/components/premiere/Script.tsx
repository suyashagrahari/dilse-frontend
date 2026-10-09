"use client";

// The director's commentary (the voice note, or its caption as a subtitle) and the last page of the script
// (the letter as the sender's dialogue, one paragraph per tap, typed in).

import { useEffect, useRef, useState } from "react";
import { haptic } from "../../../_valentine/kit";
import {
  PremiumCTA,
  RevealText,
  usePremium,
  VoiceNotePlayer,
} from "../../../_valentine/kit/premium";
import { Dock, Typed } from "./parts";
import type { Film } from "./util";

function Next({
  label,
  onClick,
  cue,
}: {
  label: string;
  onClick: () => void;
  cue: string;
}) {
  const { sfx } = usePremium();
  return (
    <div className="pr-fade">
      <PremiumCTA
        tone="gold"
        cue={null}
        className="pr-cta"
        onClick={() => {
          sfx(cue);
          onClick();
        }}
      >
        {label}
      </PremiumCTA>
    </div>
  );
}

export function Commentary({
  film,
  onNext,
}: {
  film: Film;
  onNext: () => void;
}) {
  const { premium } = usePremium();
  const [ready, setReady] = useState(false);
  const hasVoice = !!premium.voiceNote;
  useEffect(() => {
    if (hasVoice) {
      const t = window.setTimeout(() => setReady(true), 6000);
      return () => window.clearTimeout(t);
    }
  }, [hasVoice]);
  return (
    <div className="pr-scene">
      <div className="pr-in">
        <div className="pr-comm">
          <p className="pr-eyebrow pr-fade">
            Director&rsquo;s commentary · {film.from}
          </p>
          <RevealText
            as="h2"
            text="Off camera"
            className="pr-display pr-it"
            play
            delay={0.2}
          />
          <div className="pr-voice pr-fade" style={{ animationDelay: ".6s" }}>
            <VoiceNotePlayer
              accent="#D8B25A"
              track="rgba(233,230,223,.5)"
              onPlay={() => setReady(true)}
              onEnded={() => setReady(true)}
              fallback={
                <blockquote className="pr-quote" style={{ margin: 0 }}>
                  <Typed
                    text={`“${premium.voiceCaption || "I've rewritten this scene a hundred times. Every draft ends with you."}”`}
                    speed={38}
                    onDone={() => window.setTimeout(() => setReady(true), 900)}
                  />
                  <cite>— {film.from}</cite>
                </blockquote>
              }
            />
          </div>
        </div>
      </div>
      <Dock>
        {ready ? (
          <Next label="The last page" onClick={onNext} cue="page-turn" />
        ) : (
          <span className="pr-hint">Sound on</span>
        )}
      </Dock>
    </div>
  );
}

/** The letter, formatted as the last page of a screenplay: slug line, the sender's character cue, their dialogue. */
export function Script({
  film,
  letter,
  onNext,
}: {
  film: Film;
  letter: string;
  onNext: () => void;
}) {
  const { sfx } = usePremium();
  const paras = letter
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  // a bare salutation ("Tara,") never stands alone as the first beat
  const [shown, setShown] = useState(paras.length > 1 && paras[0].length < 40 ? 2 : 1);
  const paper = useRef<HTMLDivElement | null>(null);
  const all = shown >= paras.length;

  useEffect(() => {
    sfx("paper-rustle", { gain: 0.6 });
  }, [sfx]);
  useEffect(() => {
    const el = paper.current?.querySelector<HTMLElement>(
      `[data-p="${shown - 1}"]`,
    );
    if (el && shown > 1)
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [shown]);

  const more = () => {
    if (all) return;
    setShown((s) => s + 1);
    sfx("pr-type", { count: 9, gain: 0.5 });
    haptic(6);
  };

  return (
    <div className="pr-scene">
      <div className="pr-in">
        <div className="pr-scriptWrap">
          <div className="pr-sheet">
            <div className="pr-holes" aria-hidden>
              <i />
              <i />
              <i />
            </div>
            <div
              className="pr-paper"
              ref={paper}
              onClick={more}
              role="document"
              aria-label={`The last page of the script, from ${film.from}`}
            >
              <span className="pr-pg" aria-hidden>
                112.
              </span>
              <p className="pr-sl">Fade in:</p>
              <p className="pr-cue">{film.from}</p>
              <p className="pr-paren">(finally saying it)</p>
              {paras.map((t, i) => (
                <p
                  key={i}
                  data-p={i}
                  className={`pr-dlg${i < shown ? "" : " is-wait"}`}
                >
                  {t}
                </p>
              ))}
              <p className="pr-act" style={{ opacity: all ? 1 : 0 }}>
                {film.to.toUpperCase()} turns the page.
              </p>
              {!all && (
                <button
                  type="button"
                  className="pr-more"
                  onClick={(e) => {
                    e.stopPropagation();
                    more();
                  }}
                >
                  Tap to keep reading ▾
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <Dock>
        {all ? (
          <Next label="Turn the page" onClick={onNext} cue="page-turn" />
        ) : (
          <button type="button" className="pr-ghost" onClick={more}>
            Keep reading · {shown}/{paras.length}
          </button>
        )}
      </Dock>
    </div>
  );
}
