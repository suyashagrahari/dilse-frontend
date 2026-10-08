"use client";

// Scene 4 — Chapter II: "The Film of Us" (WOW 1). The song is seeked to its chorus on the first frame and every
// photo becomes a shot: ~3.2 s each, a seeded Ken Burns move (scale 1.0 → 1.12 + a 3–6 % pan around the sender's
// own crop focal point), GPU transforms only. Cuts alternate hard cuts and light-leak wipes, with ONE film-burn
// at the midpoint ("film-burn" crackle). Lower-thirds carry the caption in small caps. Hold the screen to freeze
// the frame (a projector-stop flutter + "film-stop" whir sag); drag the film strip to scrub. It ends on a freeze
// frame and "To be continued…". Reduced motion: crossfades, no camera moves, no leaks or burns.

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent, type CSSProperties } from "react";
import { SkipChip, usePremium } from "../../../_valentine/kit/premium";
import { CroppedPhoto, haptic, useReducedMotion } from "../../../_valentine/kit";
import type { LovePhoto } from "../../../_valentine/types";
import { seeded } from "./util";
import { SKIP_UNDER_BARS } from "./styles";

const SHOT = 3200;
const HOLD_MS = 180;

type Fx = { kind: "leak" | "burn"; key: number } | null;

export default function Montage({ photos, seed, onDone }: { photos: readonly LovePhoto[]; seed: string; onDone: () => void }) {
  const { sfx, music, premium } = usePremium();
  const reduce = useReducedMotion();
  const list = useMemo(() => photos.filter((p) => p && p.url).slice(0, 12), [photos]);
  const n = list.length;
  const mid = Math.floor(n / 2);
  const moves = useMemo(() => {
    const r = seeded(seed);
    return list.map((p) => {
      const zoomIn = r() > 0.35;
      const s0 = zoomIn ? 1 : 1.12;
      const s1 = zoomIn ? 1.12 : 1.01;
      // Pan toward (or away from) the focal point the sender chose in the cropper.
      const fx = ((p.cropX ?? 50) - 50) / 50;
      const fy = ((p.cropY ?? 50) - 50) / 50;
      const pan = 3 + r() * 3;
      const dx = (-fx * pan + (r() - 0.5) * 2).toFixed(2);
      const dy = (-fy * pan + (r() - 0.5) * 2).toFixed(2);
      return zoomIn
        ? { "--s0": s0, "--s1": s1, "--x0": "0%", "--y0": "0%", "--x1": `${dx}%`, "--y1": `${dy}%` }
        : { "--s0": s0, "--s1": s1, "--x0": `${dx}%`, "--y0": `${dy}%`, "--x1": "0%", "--y1": "0%" };
    }) as unknown as CSSProperties[];
  }, [list, seed]);

  const [phase, setPhase] = useState<"intro" | "play" | "end">("intro");
  const [i, setI] = useState(0);
  const [held, setHeld] = useState(false);
  const [fx, setFx] = useState<Fx>(null);
  const [run, setRun] = useState(0);
  const elapsed = useRef(0);
  const barRef = useRef<HTMLElement>(null);
  const heldRef = useRef(false);
  const holdTimer = useRef<number | null>(null);

  // The chorus: seek once, as the first frame lands. Full volume where we can.
  const seeked = useRef(false);
  const live = useRef({ music, at: premium.songDropAt });
  useEffect(() => {
    live.current = { music, at: premium.songDropAt };
  });
  const chorus = useCallback(() => {
    if (seeked.current) return;
    seeked.current = true;
    const { music: m, at } = live.current;
    if (m?.mode === "youtube" && at > 0) m.seekTo(at);
    m?.play();
    m?.fadeTo(1, 600);
  }, []);

  useEffect(() => {
    if (!n) return;
    const t = window.setTimeout(() => {
      chorus();
      sfx("film-title", { gain: 0.7 });
      setPhase("play");
    }, 1700);
    return () => window.clearTimeout(t);
  }, [n, chorus, sfx]);

  // The projector under the montage.
  useEffect(() => {
    if (phase !== "play") return;
    const h = sfx("projector-loop", { gain: 0.45 });
    return () => h.stop(700);
  }, [phase, sfx]);

  const cutTo = useCallback(
    (k: number, fromTimer: boolean) => {
      elapsed.current = 0;
      setI(k);
      if (reduce || !fromTimer) return;
      if (k === mid && n >= 3) {
        setFx({ kind: "burn", key: Date.now() });
        sfx("film-burn");
      } else if (k % 2 === 1) {
        setFx({ kind: "leak", key: Date.now() });
        sfx("swoosh-soft", { gain: 0.5 });
      } else {
        sfx("snap", { gain: 0.35 });
      }
    },
    [mid, n, reduce, sfx],
  );

  // The shot clock: rAF, paused while held, drives the progress bar without re-rendering.
  useEffect(() => {
    if (phase !== "play") return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(100, now - last);
      last = now;
      if (!heldRef.current && document.visibilityState === "visible") elapsed.current += dt;
      if (barRef.current) barRef.current.style.width = `${(Math.min(1, (i + elapsed.current / SHOT) / n) * 100).toFixed(2)}%`;
      if (elapsed.current >= SHOT) {
        if (i + 1 < n) {
          cutTo(i + 1, true);
          return;
        }
        setPhase("end");
        sfx("film-stop", { gain: 0.8 });
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, i, n, cutTo, sfx, run]);

  const setHold = (v: boolean) => {
    heldRef.current = v;
    setHeld(v);
  };
  const onDown = () => {
    if (phase !== "play") return;
    holdTimer.current = window.setTimeout(() => {
      setHold(true);
      sfx("film-stop");
      haptic(8);
    }, HOLD_MS);
  };
  const onUp = () => {
    if (holdTimer.current) window.clearTimeout(holdTimer.current);
    holdTimer.current = null;
    if (heldRef.current) {
      setHold(false);
      sfx("tick", { gain: 0.6 });
    }
  };

  // Scrub: drag along the strip.
  const stripRef = useRef<HTMLDivElement>(null);
  const scrubbing = useRef(false);
  const scrubAt = (clientX: number) => {
    const b = stripRef.current?.getBoundingClientRect();
    if (!b) return;
    const k = Math.max(0, Math.min(n - 1, Math.floor(((clientX - b.left) / b.width) * n)));
    if (k !== i) {
      cutTo(k, false);
      sfx("film-tick", { gain: 0.8 });
    }
    if (phase === "end") setPhase("play");
  };
  const stripDown = (e: RPointerEvent<HTMLDivElement>) => {
    scrubbing.current = true;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* fine */
    }
    scrubAt(e.clientX);
  };

  const replay = () => {
    cutTo(0, false);
    setPhase("play");
    setRun((r) => r + 1);
    sfx("film-lamp", { gain: 0.6 });
  };

  if (!n) {
    return (
      <section className="fm-scene" aria-label="The film of us">
        <div className="fm-col">
          <p className="fm-kick">Chapter II</p>
          <h2 className="fm-h">The Film <em>of Us</em></h2>
          <p className="fm-sub">Still in the edit. The best scenes haven&apos;t been shot yet.</p>
          <button type="button" className="fm-btn" onClick={onDone}>Next chapter ▸</button>
        </div>
      </section>
    );
  }

  const shot = list[i];
  return (
    <section className="fm-scene" aria-label="Chapter two: the film of us">
      <div className="fm-mont">
        {phase === "intro" ? (
          <div className="fm-col" style={{ minHeight: "40vh", alignContent: "center" }}>
            <p className="fm-kick fm-rise">Chapter II</p>
            <h2 className="fm-h fm-in">The Film <em>of Us</em></h2>
            <p className="fm-hint fm-rise" style={{ animationDelay: ".6s" }}>hold the screen to freeze a frame</p>
          </div>
        ) : (
          <>
            <div
              className={`fm-screen${held ? " is-held" : ""}${phase === "end" ? " is-freeze" : ""}`}
              onPointerDown={onDown}
              onPointerUp={onUp}
              onPointerCancel={onUp}
              onPointerLeave={onUp}
              onContextMenu={(e) => e.preventDefault()}
              role="group"
              aria-roledescription="film"
              aria-label={`Scene ${i + 1} of ${n}${shot.caption ? `: ${shot.caption}` : ""}`}
              style={{ ["--fm-shot" as string]: `${SHOT + 400}ms` }}
            >
              {list.map((p, k) => (
                <div key={k} className={`fm-shot${k === i ? " is-on" : ""}${reduce ? " is-fade" : ""}`} aria-hidden={k !== i}>
                  <div className="fm-kb" style={reduce ? undefined : moves[k]}>
                    <CroppedPhoto photo={p} className="fm-back" alt="" eager={k <= i + 1} />
                    <CroppedPhoto photo={p} className="fm-fore" alt={p.caption ?? ""} eager={k <= i + 1} />
                  </div>
                </div>
              ))}
              <span className="fm-shade" aria-hidden />
              {phase === "play" && (
                <div className="fm-lower fm-rise" key={`l${i}-${run}`}>
                  <span>Scene {String(i + 1).padStart(2, "0")}</span>
                  {shot.caption && <b>{shot.caption}</b>}
                </div>
              )}
              {fx && <span key={fx.key} className={`fm-${fx.kind} is-go`} aria-hidden onAnimationEnd={() => setFx(null)} />}
              <span className="fm-flutter" aria-hidden />
              {held && <span className="fm-badge">❚❚ Frame held</span>}
              {phase === "end" && <div className="fm-tbc"><b className="fm-in">To be continued…</b></div>}
            </div>
            <div className="fm-bar" aria-hidden><i ref={barRef} style={phase === "end" ? { width: "100%" } : undefined} /></div>
            <div
              className="fm-strip"
              ref={stripRef}
              onPointerDown={stripDown}
              onPointerMove={(e) => scrubbing.current && scrubAt(e.clientX)}
              onPointerUp={() => (scrubbing.current = false)}
              onPointerCancel={() => (scrubbing.current = false)}
              aria-label="Film strip — drag to scrub"
              role="group"
            >
              {list.map((p, k) => (
                <button key={k} type="button" className={`fm-cell${k === i ? " is-on" : ""}`} aria-label={`Go to scene ${k + 1}`} tabIndex={0}
                  onClick={() => { cutTo(k, false); if (phase === "end") setPhase("play"); }}>
                  <CroppedPhoto photo={p} alt="" />
                </button>
              ))}
            </div>
            <div className="fm-ctrl">
              {phase === "play" ? (
                <button type="button" className="fm-ghost" onClick={() => { setHold(!heldRef.current); sfx(heldRef.current ? "film-stop" : "tick"); }} aria-pressed={held}>
                  {held ? "▶ Roll" : "❚❚ Hold frame"}
                </button>
              ) : (
                <button type="button" className="fm-ghost" onClick={replay}>↺ Watch again</button>
              )}
              {phase === "end" && <button type="button" className="fm-btn" onClick={onDone}>Next chapter ▸</button>}
            </div>
          </>
        )}
      </div>
      {phase !== "end" && <SkipChip onSkip={() => { if (phase === "intro") chorus(); setPhase("end"); }} style={SKIP_UNDER_BARS} />}
    </section>
  );
}
