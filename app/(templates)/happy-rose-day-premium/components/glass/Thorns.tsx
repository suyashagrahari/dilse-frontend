"use client";

// Scenes 1–2 — Into the glasshouse, then the thorned rose. Inside, a single bud on a long stem stands in a terracotta
// pot on the potting bench, under the sender's opening line. Its thorns carry the sender's hard times ("7 months of
// long-distance"). Pluck each one — drag it off or tap it: it snaps ("gh-snap"), tumbles and lands ("gh-ping"),
// and its line rewrites in gold: "…and we got through it ✓" ("gh-gold"). After the last: "Nothing left that can
// hurt you here." No thorns entered → this scene is skipped (it must be personal or absent).

import { useEffect, useRef, useState, type PointerEvent as RPointerEvent, type ReactNode } from "react";
import { SkipChip, usePremium } from "../../../_valentine/kit/premium";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { BudStem, THORN_SPOTS, thornD } from "./art";
import { SKIP_TOP } from "./styles";
import type { Glass } from "./util";

function Pot() {
  return (
    <svg className="gh-pot" viewBox="0 0 140 110" aria-hidden>
      <defs><linearGradient id="gh-pot" x1="0" x2="1"><stop offset="0" stopColor="#8E4A2E" /><stop offset=".5" stopColor="#C26B44" /><stop offset="1" stopColor="#7A3D24" /></linearGradient></defs>
      <rect x="6" y="4" width="128" height="22" rx="5" fill="#A9573A" />
      <path d="M14 26 L126 26 L112 106 L28 106 Z" fill="url(#gh-pot)" />
      <rect x="6" y="4" width="128" height="5" rx="2" fill="#D78A62" opacity=".7" />
      <ellipse cx="70" cy="8" rx="56" ry="4" fill="#3A2416" />
    </svg>
  );
}

export function Establishing({ g, onDone }: { g: Glass; onDone: () => void }) {
  const reduce = useReducedMotion();
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  });
  useEffect(() => {
    const t = window.setTimeout(() => done.current(), reduce ? 1800 : 3400);
    return () => window.clearTimeout(t);
  }, [reduce]);
  return (
    <section className="gh-scene" onClick={() => done.current()} aria-label="Inside the glasshouse">
      <p className="gh-kick gh-in" style={{ animationDelay: ".6s" }}>Inside the glasshouse</p>
      <h1 className="gh-h gh-in" style={{ animationDelay: ".9s", maxWidth: "15ch" }}>{g.opening}</h1>
      <div className="gh-plant gh-in" style={{ animationDelay: "1.3s" }}>
        <BudStem color={g.color} id="gh-est" />
        <Pot />
      </div>
    </section>
  );
}

export function Thorns({ g, sticker, onDone }: { g: Glass; sticker: ReactNode; onDone: () => void }) {
  const { sfx } = usePremium();
  const n = Math.min(g.thorns.length, THORN_SPOTS.length);
  const [gone, setGone] = useState<boolean[]>(() => Array(n).fill(false));
  const drag = useRef<{ k: number; x: number; y: number } | null>(null);
  const left = gone.filter((v) => !v).length;

  const pluck = (k: number) => {
    if (gone[k]) return;
    sfx("gh-snap");
    sfx("gh-ping", { at: 0.55, detune: k * 90 - 180 });
    sfx("gh-gold", { at: 0.75 });
    haptic(10);
    setGone((v) => v.map((x, i) => (i === k ? true : x)));
  };
  const pd = (k: number) => (e: RPointerEvent<SVGGElement>) => {
    drag.current = { k, x: e.clientX, y: e.clientY };
    try {
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
    } catch {
      /* fine */
    }
  };
  const pm = (e: RPointerEvent<SVGGElement>) => {
    const d = drag.current;
    if (!d) return;
    if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 22) {
      drag.current = null;
      pluck(d.k);
    }
  };
  const pu = () => {
    const d = drag.current;
    drag.current = null;
    if (d) pluck(d.k);
  };

  return (
    <section className="gh-scene" aria-label="The thorned rose">
      <p className="gh-kick">Before it blooms</p>
      <h2 className="gh-h" style={{ fontSize: "clamp(28px, 7.6vw, 46px)" }}>{left ? "Take the thorns off." : "Nothing left that can hurt you here."}</h2>
      <p className="gh-hint" style={{ marginTop: 8 }}>{left ? `${left} ${left === 1 ? "thorn" : "thorns"} left · drag one off, or tap it` : " "}</p>
      <div className="gh-plant is-big">
        <BudStem color={g.color} id="gh-thorns">
          {g.thorns.slice(0, n).map((_, k) => {
            const sp = THORN_SPOTS[k];
            return (
              <g
                key={k}
                className={`gh-thorn${gone[k] ? " is-gone" : ""}`}
                style={{ ["--fx" as string]: `${sp.side * 40}px`, ["--fr" as string]: `${sp.side * 200}deg`, transformBox: "fill-box", transformOrigin: "center" }}
                onPointerDown={pd(k)}
                onPointerMove={pm}
                onPointerUp={pu}
                onPointerCancel={() => (drag.current = null)}
                role="button"
                tabIndex={gone[k] ? -1 : 0}
                aria-label={`Pluck the thorn: ${g.thorns[k]}`}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pluck(k); } }}
              >
                <circle className="gh-thornHit" cx={100 + sp.side * 12} cy={sp.y - 6} r="22" />
                <path d={thornD(sp.y, sp.side)} />
              </g>
            );
          })}
        </BudStem>
        {g.thorns.slice(0, n).map((t, k) => {
          const sp = THORN_SPOTS[k];
          return (
            <p key={k} className={`gh-tag ${sp.side > 0 ? "is-r" : "is-l"}${gone[k] ? " is-done" : ""}`} style={{ top: `${(sp.y / 560) * 100}%` }} aria-live="polite">
              <b>{gone[k] ? "✓ got through" : "thorn"}</b>
              <span key={String(gone[k])} className={gone[k] ? "gh-in" : undefined}>{gone[k] ? `${t}… and we got through it.` : t}</span>
            </p>
          );
        })}
      </div>
      {!left && (
        <div className="gh-in" style={{ display: "grid", justifyItems: "center", gap: 10, marginTop: 6 }}>
          {sticker}
          <button type="button" className="gh-btn" onClick={onDone}>Breathe it into bloom ▸</button>
        </div>
      )}
      {left > 0 && <SkipChip onSkip={() => setGone(Array(n).fill(true))} label="Pluck them all ▸" delay={3000} style={SKIP_TOP} />}
    </section>
  );
}
