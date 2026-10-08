"use client";

// ─── Scene 5: Truffles — tap one, it lifts, a bite, the reason ──────────────

import { useEffect, useRef, useState } from "react";
import { haptic } from "../../../_valentine/kit";
import { FLAVOURS, Truffle } from "./art";
import type { SceneProps } from "./shared";

export default function Truffles({ truffles, reduced, sfx, sticker, next, onTasted }: SceneProps & { onTasted: (n: number) => void }) {
  const [eaten, setEaten] = useState<boolean[]>(() => truffles.map(() => false));
  const [open, setOpen] = useState<number | null>(null);
  const [bit, setBit] = useState(false);
  const [touring, setTouring] = useState(false);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const count = eaten.filter(Boolean).length;
  const all = count === truffles.length;
  useEffect(() => onTasted(count), [count, onTasted]);

  const taste = (i: number) => {
    setOpen(i);
    setBit(false);
    sfx("swoosh-soft", { gain: 0.6 });
    timers.current.push(
      window.setTimeout(() => {
        setBit(true);
        sfx("choc-bite", { detune: Math.random() * 200 - 100 });
        haptic(12);
        setEaten((e) => {
          const n = [...e];
          n[i] = true;
          return n;
        });
      }, reduced ? 120 : 650),
    );
  };

  // "Taste them all": walk through the uneaten ones.
  useEffect(() => {
    if (!touring) return;
    const i = eaten.findIndex((e) => !e);
    if (i < 0) {
      setTouring(false);
      return;
    }
    const t = window.setTimeout(() => taste(i), open === null ? 50 : 2300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [touring, eaten]);

  const t = open !== null ? truffles[open] : null;
  const f = t ? FLAVOURS[t.flavour] ?? FLAVOURS.hazelnut : null;

  return (
    <section className="mc-sec">
      <header className="mc-head">
        <p className="mc-kick">The truffles · {count}/{truffles.length} tasted</p>
        <h2 className="mc-h">{all ? "Every last one" : "Each one has a reason inside"}</h2>
        <p className="mc-sub">{all ? "No calories were counted in the making of this." : "Tap a truffle to taste it."}</p>
      </header>
      <div className="mc-slate">
        {truffles.map((tr, i) => (
          <button
            key={i}
            type="button"
            className={`mc-trufBtn${eaten[i] ? " is-eaten" : ""}${open === i ? " is-open" : ""}`}
            onClick={() => taste(i)}
            aria-label={`${FLAVOURS[tr.flavour]?.name ?? "Truffle"} truffle${eaten[i] ? " — tasted" : ""}`}
          >
            <Truffle flavour={tr.flavour} size="100%" bitten={eaten[i]} />
            <span className="mc-trufLabel">{FLAVOURS[tr.flavour]?.name}</span>
          </button>
        ))}
      </div>
      <div className="mc-reasonSlot" aria-live="polite">
        {t && f && (
          <div key={open} className="mc-reason">
            <Truffle flavour={t.flavour} size={92} bitten={bit} className="mc-reasonTruf" />
            <div>
              <p className="mc-flav">
                {f.name} · <i>{f.note}</i>
              </p>
              {bit && <p className="mc-reasonTx">{t.reason}</p>}
            </div>
          </div>
        )}
      </div>
      <div className="mc-actions">
        {all ? (
          <>
            <span className="mc-stick">{sticker("pc3-yum", 80)}</span>
            <button type="button" className="mc-btn" onClick={next}>
              One last thing →
            </button>
          </>
        ) : (
          <button type="button" className="mc-btn is-ghost" onClick={() => setTouring(true)} disabled={touring}>
            {touring ? "Tasting…" : "Taste them all"}
          </button>
        )}
      </div>
    </section>
  );
}
