"use client";

// Scene 2 — Opening titles. 1960s title-sequence cards: "{sender} presents" → "a love story" → "starring
// {recipient}" (big, gold, with the pv2 cameo) → the film's title + tagline → "Previously on…", a 7-frame strip of
// the week (Rose → Kiss) at 1.2 s a frame. Each card holds ~2.6 s; a tap advances. Every card lands on a
// "film-title" boom (reversed swell → low hit); every recap frame on a shutter "film-flick".

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { SkipChip, usePremium } from "../../../_valentine/kit/premium";
import { useReducedMotion } from "../../../_valentine/kit";
import type { Film } from "./util";
import { SKIP_UNDER_BARS } from "./styles";

type Card = { id: string; hold: number; cue: "film-title" | "film-flick" | null; node: ReactNode };

export default function Titles({ film, sticker, onDone }: { film: Film; sticker: ReactNode; onDone: () => void }) {
  const { sfx } = usePremium();
  const reduce = useReducedMotion();
  const cards = useMemo<Card[]>(() => {
    const out: Card[] = [
      {
        id: "presents", hold: 2600, cue: "film-title",
        node: <p className="fm-presents fm-in"><b>{film.from}</b>presents</p>,
      },
      {
        id: "story", hold: 2200, cue: "film-title",
        node: <p className="fm-sub fm-rise" style={{ fontSize: "clamp(22px, 6vw, 34px)" }}>a love story</p>,
      },
      {
        id: "starring", hold: 3000, cue: "film-title",
        node: (
          <>
            <span className="fm-starring fm-rise">starring</span>
            <h2 className="fm-bigName fm-in">{film.to}</h2>
            {film.star !== film.to && <span className="fm-sub fm-rise" style={{ animationDelay: ".5s" }}>as “{film.star}”</span>}
            <span className="fm-rise" style={{ animationDelay: ".7s" }}>{sticker}</span>
          </>
        ),
      },
      {
        id: "title", hold: 3200, cue: "film-title",
        node: (
          <>
            <span className="fm-rule fm-rise" />
            <h2 className="fm-titleCard fm-in">{film.title}</h2>
            {film.tagline && <p className="fm-sub fm-rise" style={{ animationDelay: ".6s" }}>{film.tagline}</p>}
            <span className="fm-rule fm-rise" />
          </>
        ),
      },
    ];
    if (film.week.length) {
      out.push({ id: "prev", hold: 1300, cue: "film-title", node: <h2 className="fm-titleCard fm-in" style={{ fontSize: "clamp(34px, 9vw, 64px)" }}>Previously on…</h2> });
      film.week.forEach((w, i) =>
        out.push({
          id: `w${i}`, hold: 1500, cue: "film-flick",
          node: (
            <div className="fm-prev">
              <div className="fm-frameStrip">
                <div className="fm-frame">
                  <span className="fm-day">{w.day}</span>
                  <p>{w.line}</p>
                </div>
              </div>
              <div className="fm-dots" aria-hidden>{film.week.map((_, k) => <i key={k} className={k === i ? "is-on" : ""} />)}</div>
            </div>
          ),
        }),
      );
    }
    return out;
  }, [film, sticker]);

  const [i, setI] = useState(0);
  const finished = useRef(false);
  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    onDone();
  }, [onDone]);
  const iRef = useRef(0);
  useEffect(() => {
    iRef.current = i;
  }, [i]);
  const advance = useCallback(() => {
    if (iRef.current + 1 < cards.length) setI(iRef.current + 1);
    else finish();
  }, [cards.length, finish]);

  useEffect(() => {
    const c = cards[i];
    if (c.cue) sfx(c.cue, { gain: c.cue === "film-flick" ? 1 : 0.8, detune: (Math.random() - 0.5) * 60 });
    const t = window.setTimeout(advance, c.hold + (reduce ? 400 : 0));
    return () => window.clearTimeout(t);
  }, [i, cards, sfx, advance, reduce]);

  const c = cards[i];
  return (
    <section className="fm-scene" aria-label="Opening titles">
      <div className="fm-card" key={c.id} onClick={advance} role="button" tabIndex={0} aria-label="Next title card"
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); advance(); } }}>
        {c.node}
      </div>
      <p className="fm-hint" style={{ position: "absolute", bottom: "calc(var(--fm-bar) + 14px)", left: 0, right: 0, opacity: 0.5 }}>tap for the next card</p>
      <SkipChip onSkip={finish} label="Skip the titles ▸" style={SKIP_UNDER_BARS} />
    </section>
  );
}
