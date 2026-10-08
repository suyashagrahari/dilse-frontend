"use client";

// ─── Scene 7: the letter, piped in chocolate — then the voice, then the recipe card

import { useEffect, useRef, useState } from "react";
import { VoiceNotePlayer, usePremium } from "../../../_valentine/kit/premium";
import { FLAVOURS } from "./art";
import type { SceneProps } from "./shared";

export default function Letter({ data, x, truffles, reduced, sfx, next }: SceneProps) {
  const p = usePremium();
  const title = (x.letterTitle || `Dear ${data.recipientName || "you"},`).slice(0, 24);
  const [piped, setPiped] = useState(reduced);
  const timers = useRef<number[]>([]);
  useEffect(() => {
    if (reduced) return;
    const dur = Math.min(3.2, 1.2 + title.length * 0.09);
    sfx("choc-pipe", { dur, at: 0.3 });
    timers.current.push(window.setTimeout(() => setPiped(true), (dur + 0.4) * 1000));
    const t = timers.current;
    return () => t.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    p.music?.fadeTo(0.8, 900);
    return () => p.music?.fadeTo(1, 900);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const dur = Math.min(3.2, 1.2 + title.length * 0.09);
  const seen = new Set<string>();
  const ingredients = truffles
    .map((t) => FLAVOURS[t.flavour]?.ingredient)
    .filter((s): s is string => !!s && !seen.has(s) && !!seen.add(s));

  return (
    <section className="mc-sec mc-letterSec">
      <header className="mc-head">
        <p className="mc-kick">Written in chocolate</p>
      </header>
      <div className={`mc-slab${piped ? " is-piped" : ""}`} style={{ ["--pipe" as string]: `${dur}s` }}>
        <svg viewBox="0 0 320 90" className="mc-slabSvg" role="img" aria-label={title}>
          <text x="160" y="58" textAnchor="middle" className="mc-pipeTx">
            {title}
          </text>
        </svg>
        {!reduced && <span className="mc-bag" aria-hidden />}
      </div>
      <div className="mc-voice">
        <VoiceNotePlayer
          label={<span className="mc-voiceLbl">A word from the chocolatier{data.senderName ? ` · ${data.senderName}` : ""}</span>}
          accent="#E6B85C"
          track="rgba(255,246,234,.4)"
          fallback={
            p.premium.voiceCaption ? (
              <div className="mc-voiceNote">
                <span className="mc-voiceLbl">A note from the chocolatier</span>
                <i>“{p.premium.voiceCaption}”</i>
              </div>
            ) : null
          }
        />
      </div>
      <article className="mc-recipe">
        <p className="mc-recipeKick">Recipe for us · serves two</p>
        {ingredients.length > 0 && (
          <ul className="mc-ingr">
            {ingredients.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        )}
        <p className="mc-method">Method</p>
        <div className="mc-letterTx">{data.letter}</div>
        {x.signOff && <p className="mc-sign">{x.signOff}</p>}
      </article>
      <div className="mc-actions">
        <button type="button" className="mc-btn" onClick={() => { sfx("page-turn"); next(); }}>
          {data.photos.length ? "Light up the display case →" : "Box it up →"}
        </button>
      </div>
    </section>
  );
}
