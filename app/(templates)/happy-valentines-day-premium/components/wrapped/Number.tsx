"use client";

// ─── 9 · THE NUMBER — the money moment ─────────────────────────────────────────
// Hold to count: the digits climb with your thumb (the music dips to 40% for the suspense). Let the ring fill and
// drop() fires: the riser, the counter racing up, and on the song's drop it SLAMS to the final number with a white
// cut — then their best photo, full-bleed, with a live seconds ticker, and the question over it.

import { useEffect, useRef, useState, type ReactNode } from "react";
import { CinematicPhoto, usePremium, useSongDrop } from "../../../_valentine/kit/premium";
import { useHoldProgress, useReducedMotion } from "../../../_valentine/kit";
import { daysSince, fmt } from "./model";
import type { SlideProps } from "./ui";

type Phase = "idle" | "counting" | "slam" | "photo" | "ask" | "yes";

export default function TheNumber({ w, ready, onAnswer, please, yesSticker }: SlideProps & {
  onAnswer: (noDodges: number) => void;
  please: ReactNode;
  yesSticker: ReactNode;
}) {
  const { sfx, music } = usePremium();
  const { drop } = useSongDrop();
  const reduce = useReducedMotion();
  const final = w.since ? daysSince(w.since) : null;
  const [phase, setPhase] = useState<Phase>("idle");
  const [shown, setShown] = useState(0);
  const [dodges, setDodges] = useState(0);
  const [noAt, setNoAt] = useState({ x: 0, y: 0 });
  const [now, setNow] = useState(() => Date.now());
  const lastTick = useRef(0);
  const shownRef = useRef(0);

  // Suspense: the song dips while they hold (a no-op where the platform can't fade).
  const musicRef = useRef(music);
  useEffect(() => { musicRef.current = music; });
  useEffect(() => {
    const m = musicRef.current;
    if (m?.canFade) m.fadeTo(0.4, 900);
  }, []);

  const tickSfx = (gap: number) => {
    const t = performance.now();
    if (t - lastTick.current < gap) return;
    lastTick.current = t;
    sfx("tick", { gain: 0.45 });
  };

  const hold = useHoldProgress({
    duration: 1800,
    springBack: 0.15,
    onComplete: () => start(),
  });

  // The digits follow the thumb before the drop.
  useEffect(() => {
    if (phase !== "idle") return;
    const target = final === null ? Math.round(hold.progress * 999) : Math.round(final * 0.42 * hold.progress);
    shownRef.current = target;
    setShown(target);
    if (hold.holding) tickSfx(110);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hold.progress, hold.holding, phase, final]);

  const start = () => {
    setPhase("counting");
    navigator.vibrate?.([10, 40, 10]);
    const from = shownRef.current;
    const to = final === null ? 9999 : Math.round(final * 0.985);
    const t0 = performance.now();
    const dur = 1050;
    let raf = 0;
    const run = (t: number) => {
      const k = Math.min(1, (t - t0) / dur);
      const e = k * k * k;
      const v = Math.round(from + (to - from) * e);
      shownRef.current = v;
      setShown(v);
      tickSfx(Math.max(40, 120 - k * 90));
      if (k < 1) raf = requestAnimationFrame(run);
    };
    if (!reduce) raf = requestAnimationFrame(run);
    drop(() => {
      cancelAnimationFrame(raf);
      setShown(final ?? 0);
      setPhase("slam");
      navigator.vibrate?.(60);
      window.setTimeout(() => {
        setPhase("photo");
        sfx("whoosh", { gain: 0.5 });
      }, 1500);
      window.setTimeout(() => setPhase("ask"), 3900);
    });
  };

  // Live seconds since they got together, once the photo is up.
  useEffect(() => {
    if (phase !== "photo" && phase !== "ask" && phase !== "yes") return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [phase]);

  const lines = w.noLines.length ? w.noLines : ["Wrong button, clearly.", "Try the pink one.", "Fine. This is a Yes now."];
  const noIsYes = dodges >= lines.length;
  const dodge = () => {
    if (noIsYes) return;
    sfx("bubble", { gain: 0.6, detune: dodges * 150 });
    navigator.vibrate?.(8);
    const nx = dodges + 1;
    setDodges(nx);
    setNoAt({ x: nx % 2 ? 120 + Math.round(Math.random() * 60) : Math.round(Math.random() * 40), y: Math.round((Math.random() * 2 - 1) * 8) });
  };
  const yes = () => {
    if (phase === "yes") return;
    setPhase("yes");
    sfx("firework", { gain: 0.6 });
    sfx("chime-cascade", { gain: 0.5, at: 0.25 });
    navigator.vibrate?.([20, 60, 30]);
    onAnswer(dodges);
    window.setTimeout(ready, 900);
  };

  const big = final === null && (phase === "slam" || phase === "photo" || phase === "ask" || phase === "yes") ? "∞" : fmt(shown);
  const secs = w.since ? Math.max(0, Math.floor((now - w.since.getTime()) / 1000)) : 0;
  const photo = w.photos[0] ?? null;
  const onPhoto = phase === "photo" || phase === "ask" || phase === "yes";

  if (onPhoto) {
    return (
      <div className="uw-slide" style={{ padding: 0 }}>
        <div className="uw-hero">
          {photo ? (
            <CinematicPhoto photo={photo} grade="warm" frame="full" caption="" kenBurns="in" drift={14} eager alt={photo.caption || ""} style={{ position: "absolute", inset: 0, height: "100%" }} />
          ) : (
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg,#FF4B3E,#FF7AB6 60%,#B9A7FF)" }} />
          )}
          <span className="uw-heroScrim" aria-hidden />
        </div>
        <div className="uw-heroTop">
          <p className="uw-display uw-num uw-fade">{big}</p>
          <p className="uw-fade" style={{ ["--d" as string]: ".3s" }}>{final === null ? "days. I stopped counting." : "days. And counting."}</p>
          {w.since && <p className="uw-tick uw-fade" style={{ ["--d" as string]: ".6s" }}>{fmt(secs)} seconds</p>}
        </div>
        {phase === "ask" && (
          <div className="uw-ask">
            <span className="uw-please" aria-hidden>{please}</span>
            <h2 className="uw-fade">{w.question}</h2>
            <div className="uw-askRow uw-fade" style={{ ["--d" as string]: ".3s" }}>
              <button type="button" className="uw-yes" onClick={yes}>Yes</button>
              <button
                type="button"
                className="uw-no"
                onPointerDown={(e) => { if (!noIsYes) { e.preventDefault(); dodge(); } }}
                onClick={() => (noIsYes ? yes() : dodge())}
                style={{ transform: `translate(${noAt.x}px, ${noAt.y}px)` }}
              >
                {noIsYes ? "Also yes" : "No"}
              </button>
            </div>
            <p className="uw-serif uw-noLine" aria-live="polite">{dodges > 0 ? lines[Math.min(dodges, lines.length) - 1] : " "}</p>
          </div>
        )}
        {phase === "yes" && (
          <div className="uw-ask" style={{ bottom: "calc(var(--uw-bottom) + 84px)" }}>
            <div style={{ position: "absolute", right: 0, bottom: "100%" }} aria-hidden>{yesSticker}</div>
            <p className="uw-display uw-yesBig">Yes.</p>
            <p className="uw-serif" style={{ margin: "8px 0 0", fontSize: 24 }}>Best answer. Another year, starting now.</p>
          </div>
        )}
        <span className="uw-whiteout" aria-hidden />
      </div>
    );
  }

  return (
    <div className={`uw-slide uw-number${phase === "slam" && !reduce ? " uw-shake" : ""}`}>
      <p className="uw-serif uw-numLead uw-fade">You&rsquo;ve been my Valentine for</p>
      <p className={`uw-display uw-num uw-big${phase === "idle" && shown === 0 ? " is-ghost" : ""}${phase === "slam" ? " is-slam" : ""}`} aria-live="off">
        {phase === "counting" && final === null ? fmt(shown) : big}
      </p>
      <p className="uw-unit uw-fade" style={{ ["--d" as string]: ".2s" }}>days</p>
      {phase === "idle" ? (
        <button type="button" className="uw-holdBtn" aria-label="Press and hold to count our days" {...hold.bind} style={{ ...hold.bind.style, ["--p" as string]: hold.progress }}>
          <svg viewBox="0 0 100 100" aria-hidden>
            <circle cx="50" cy="50" r="47" fill="none" stroke="rgba(255,122,182,.25)" strokeWidth="2" />
            <circle cx="50" cy="50" r="47" fill="none" stroke="#FF7AB6" strokeWidth="3" strokeLinecap="round" strokeDasharray={295.3} strokeDashoffset={295.3 * (1 - hold.progress)} />
          </svg>
          <span>Hold<br />to count</span>
        </button>
      ) : (
        <div style={{ height: 150 }} aria-hidden />
      )}
      {phase === "slam" && <span className="uw-whiteout" aria-hidden />}
    </div>
  );
}
