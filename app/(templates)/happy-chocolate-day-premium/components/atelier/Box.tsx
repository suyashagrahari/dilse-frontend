"use client";

// ─── Scene 9: Drizzle your name (mini-game 2) → pack → tie the ribbon ──────
//
// Drizzle: a dotted guide of the word on the last bonbon; drag across it and
// a glossy line follows, snapped to the guide (it cannot be wrong). Then the
// heart's truffles, the ticket and the bonbon slide into the box, the lid
// drops, and they tie the ribbon by dragging its loop once round the knot.

import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { haptic } from "../../../_valentine/kit";
import { SkipChip } from "../../../_valentine/kit/premium";
import { BOX_COLORS, Truffle } from "./art";
import type { SceneProps } from "./shared";

type Phase = "drizzle" | "pack" | "tie" | "tied";

export default function Box({ x, word, truffles, reduced, sfx, sticker, next }: SceneProps) {
  const [phase, setPhase] = useState<Phase>("drizzle");
  const [prog, setProg] = useState(0);
  const [bag, setBag] = useState<{ x: number; y: number } | null>(null);
  const [tie, setTie] = useState(0);
  const pad = useRef<HTMLDivElement>(null);
  const knot = useRef<HTMLDivElement>(null);
  const drawing = useRef(false);
  const lastPipe = useRef(0);
  const tieRef = useRef<{ a: number; acc: number; lastZip: number } | null>(null);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const box = BOX_COLORS[x.boxColor] ?? BOX_COLORS.raspberry;

  // ── drizzle ──
  const finishDrizzle = () => {
    if (phase !== "drizzle") return;
    setProg(1);
    setBag(null);
    drawing.current = false;
    sfx("sparkle");
    haptic(20);
    timers.current.push(window.setTimeout(() => setPhase("pack"), reduced ? 300 : 900));
  };
  const drizMove = (e: RPointerEvent<HTMLDivElement>) => {
    const el = pad.current;
    if (!el || !drawing.current || phase !== "drizzle") return;
    const r = el.getBoundingClientRect();
    const fx = (e.clientX - r.left) / r.width;
    setBag({ x: fx * 100, y: ((e.clientY - r.top) / r.height) * 100 });
    const np = Math.max(0, Math.min(1, (fx - 0.12) / 0.76));
    if (np > prog) {
      setProg(np);
      const now = performance.now();
      if (now - lastPipe.current > 180) {
        lastPipe.current = now;
        sfx("choc-pipe", { dur: 0.2, gain: 0.8 });
      }
      if (np >= 0.97) finishDrizzle();
    }
  };
  const autoDrizzle = () => {
    if (phase !== "drizzle") return;
    sfx("choc-pipe", { dur: 1.4 });
    const t0 = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / 1400);
      setProg((v) => Math.max(v, k));
      setBag({ x: 12 + k * 76, y: 52 });
      if (k < 1) requestAnimationFrame(step);
      else finishDrizzle();
    };
    requestAnimationFrame(step);
  };

  // ── pack ──
  useEffect(() => {
    if (phase !== "pack") return;
    sfx("swoosh-soft", { at: 0.2 });
    sfx("choc-demould", { at: reduced ? 0.1 : 1.3, gain: 0.7 });
    const t = window.setTimeout(() => setPhase("tie"), reduced ? 400 : 1700);
    return () => clearTimeout(t);
  }, [phase, reduced, sfx]);

  // ── tie ──
  const finishTie = () => {
    if (phase !== "tie") return;
    setTie(1);
    setPhase("tied");
    sfx("choc-zip");
    sfx("choc-bow", { at: 0.18 });
    haptic([20, 50, 30]);
    timers.current.push(window.setTimeout(next, reduced ? 1200 : 2600));
  };
  const angle = (e: { clientX: number; clientY: number }) => {
    const r = knot.current?.getBoundingClientRect();
    if (!r) return 0;
    return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2));
  };
  const tieDown = (e: RPointerEvent<HTMLDivElement>) => {
    if (phase !== "tie") return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    tieRef.current = { a: angle(e), acc: tie * Math.PI * 2, lastZip: tie };
  };
  const tieMove = (e: RPointerEvent<HTMLDivElement>) => {
    const t = tieRef.current;
    if (!t || phase !== "tie") return;
    const a = angle(e);
    let d = a - t.a;
    if (d > Math.PI) d -= Math.PI * 2;
    if (d < -Math.PI) d += Math.PI * 2;
    t.a = a;
    t.acc = Math.max(0, t.acc + Math.abs(d));
    const np = Math.min(1, t.acc / (Math.PI * 2));
    setTie(np);
    if (np - t.lastZip > 0.2) {
      t.lastZip = np;
      sfx("choc-zip", { gain: 0.6, detune: np * 400 });
    }
    if (np >= 1) {
      tieRef.current = null;
      finishTie();
    }
  };

  const fs = Math.min(70, 300 / Math.max(2, word.length));
  const handleA = tie * Math.PI * 2 - Math.PI / 2;

  return (
    <section className="mc-sec">
      <header className="mc-head">
        <p className="mc-kick">{phase === "drizzle" ? "The last bonbon" : phase === "tied" ? "Boxed and tied" : "Into the box"}</p>
        <h2 className="mc-h">
          {phase === "drizzle" ? "Pipe the name on top" : phase === "pack" ? "Everything you made…" : phase === "tie" ? "Now tie the ribbon" : "Tied by you"}
        </h2>
        <p className="mc-sub">
          {phase === "drizzle" ? "Drag along the dotted line — it can't go wrong." : phase === "tie" ? "Drag the loop all the way round the knot." : phase === "tied" ? "" : " "}
        </p>
      </header>

      {phase === "drizzle" && (
        <div
          ref={pad}
          className="mc-drizzle"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture?.(e.pointerId);
            drawing.current = true;
            drizMove(e);
          }}
          onPointerMove={drizMove}
          onPointerUp={() => { drawing.current = false; setBag(null); }}
          onPointerCancel={() => { drawing.current = false; setBag(null); }}
          style={{ touchAction: "none" }}
          role="img"
          aria-label={`A bonbon with ${word} piped on top, ${Math.round(prog * 100)}%`}
        >
          <svg viewBox="0 0 200 200">
            <defs>
              <linearGradient id="mc-bb" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0" stopColor="#6e3d24" />
                <stop offset=".5" stopColor="#3a1d10" />
                <stop offset="1" stopColor="#1d0d06" />
              </linearGradient>
              <clipPath id="mc-dz">
                <rect x="0" y="0" width={24 + prog * 152} height="200" />
              </clipPath>
            </defs>
            <rect x="18" y="18" width="164" height="164" rx="26" fill="url(#mc-bb)" />
            <rect x="26" y="24" width="148" height="10" rx="5" fill="#fff" opacity=".12" />
            <text x="100" y={108 + fs * 0.3} textAnchor="middle" fontSize={fs} className="mc-dzGuide">
              {word}
            </text>
            <g clipPath="url(#mc-dz)">
              <text x="100" y={108 + fs * 0.3} textAnchor="middle" fontSize={fs} className="mc-dzInk">
                {word}
              </text>
            </g>
          </svg>
          {bag && <span className="mc-dzBag" style={{ left: `${bag.x}%`, top: `${bag.y}%` }} aria-hidden />}
        </div>
      )}

      {phase !== "drizzle" && (
        <div className={`mc-box is-${phase}`} style={{ ["--ba" as string]: box.a, ["--bb2" as string]: box.b, ["--bi" as string]: box.ink, ["--rb" as string]: box.ribbon }}>
          <div className="mc-boxBase">
            <div className="mc-boxItems" aria-hidden>
              {truffles.slice(0, 5).map((t, i) => (
                <Truffle key={i} flavour={t.flavour} size="18%" style={{ transitionDelay: `${i * 90}ms` }} className="mc-packed" />
              ))}
              <span className="mc-packBonbon mc-packed">
                <b>{word}</b>
              </span>
              <span className="mc-packTicket mc-packed" />
            </div>
          </div>
          <div className="mc-boxLid">
            <span className="mc-lidWord">Atelier</span>
            <span className="mc-strapV" />
            <span className="mc-strapH" />
          </div>
          <div ref={knot} className="mc-knotZone" onPointerDown={tieDown} onPointerMove={tieMove} onPointerUp={() => (tieRef.current = null)} style={{ touchAction: "none" }}>
            {phase !== "pack" && (
              <svg viewBox="0 0 100 100" className="mc-loop" aria-hidden>
                <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,.22)" strokeWidth="2" strokeDasharray="3 4" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="var(--rb)" strokeWidth="6" strokeLinecap="round" pathLength={1} strokeDasharray={`${tie} 1`} transform="rotate(-90 50 50)" />
              </svg>
            )}
            {phase === "tie" && (
              <span className="mc-loopHandle" style={{ left: `${50 + Math.cos(handleA) * 38}%`, top: `${50 + Math.sin(handleA) * 38}%` }} aria-hidden />
            )}
            <span className={`mc-bow${phase === "tied" ? " is-tied" : ""}`} aria-hidden>
              <i className="l" />
              <i className="r" />
              <b />
            </span>
          </div>
        </div>
      )}

      <div className="mc-actions">
        {phase === "drizzle" && (
          <button type="button" className="mc-btn is-ghost" onClick={autoDrizzle}>
            Pipe it for me
          </button>
        )}
        {phase === "tie" && (
          <button type="button" className="mc-btn is-ghost" onClick={finishTie}>
            Tie it for me
          </button>
        )}
        {phase === "tied" && <span className="mc-stick">{sticker("pc6-box", 84)}</span>}
      </div>
      {phase === "drizzle" && <SkipChip onSkip={finishDrizzle} delay={2500} />}
      {phase === "tie" && <SkipChip onSkip={finishTie} delay={2500} />}
    </section>
  );
}
