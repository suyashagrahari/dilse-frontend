"use client";

// Scene 5 — The pressed book (the letter). A cloth-bound book lands on the bench ("gh-book": thud + riffle), its
// cover swings open, and on the spread a real pressed rose lies in the gutter. The letter writes itself in ink,
// paragraph by paragraph ("nib-scratch" per paragraph), with a drop cap, the couplet and the sign-off in script.
// "Write it all" shows everything at once; the whole letter is in the DOM from the start (screen readers).

import { useEffect, useState, type ReactNode } from "react";
import { usePremium } from "../../../_valentine/kit/premium";
import { useReducedMotion } from "../../../_valentine/kit";
import { RoseHead } from "./art";
import type { Glass } from "./util";

export function Book({ g, letter, sticker, onDone }: { g: Glass; letter: string; sticker: ReactNode; onDone: () => void }) {
  const { sfx } = usePremium();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(0);
  const paras = letter.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const extra = (g.shayari ? 1 : 0) + 1;
  const total = paras.length + extra;

  useEffect(() => {
    sfx("gh-book");
    const t = window.setTimeout(() => setOpen(true), reduce ? 100 : 900);
    return () => window.clearTimeout(t);
  }, [sfx, reduce]);

  useEffect(() => {
    if (!open || shown >= total) return;
    const t = window.setTimeout(() => {
      setShown((s) => s + 1);
      sfx("nib-scratch", { gain: 0.5, dur: 0.8 });
    }, shown === 0 ? (reduce ? 50 : 1100) : reduce ? 60 : 1500);
    return () => window.clearTimeout(t);
  }, [open, shown, total, sfx, reduce]);

  const sign = g.signOff || `— ${g.from}`;
  return (
    <section className="gh-scene" aria-label="The pressed book">
      <p className="gh-kick">Pressed between the pages</p>
      <div className="gh-book gh-in" style={{ marginTop: 16 }}>
        <div className="gh-spread">
          <div className="gh-page is-l">
            <RoseHead color={g.color} id="gh-pressed" className="gh-pressed" />
            <small>for {g.to}{g.since ? `, since ${g.since}` : ""}</small>
          </div>
          <article className="gh-page gh-letter" aria-label={`A letter from ${g.from}`}>
            {paras.map((p, i) => <p key={i} style={i < shown ? undefined : { opacity: 0, animation: "none" }}>{p}</p>)}
            {g.shayari && <p className="gh-sher" style={paras.length < shown ? undefined : { opacity: 0, animation: "none" }}>{g.shayari}</p>}
            <p className="gh-sign" style={shown >= total ? undefined : { opacity: 0, animation: "none" }}>{sign}</p>
          </article>
          <div className={`gh-cover${open ? " is-open" : ""}`} aria-hidden>For {g.to}</div>
        </div>
      </div>
      {shown < total ? (
        <button type="button" className="gh-ghost" style={{ marginTop: 14 }} onClick={() => { setOpen(true); setShown(total); }}>Write it all</button>
      ) : (
        <div className="gh-in" style={{ display: "grid", justifyItems: "center", gap: 10, marginTop: 14 }}>
          {sticker}
          <button type="button" className="gh-btn" onClick={onDone}>Into the dew drops ▸</button>
        </div>
      )}
    </section>
  );
}
