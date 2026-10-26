"use client";

// ─── The palace gateway (the opening) ────────────────────────────────────────
// A daylight Mughal gateway in ivory sandstone, drawn in SVG (./Palace): a
// pishtaq with a pietra-dura band, a pointed arch and chhatris on the roof.
// The doorway is closed by two pierced jaali screens; warm light shows
// through the lattice. A caparisoned elephant stands guard at each corner, the couple's initials sit in a gold
// medallion in the arch. The names are set above the gateway like a royal
// proclamation (Shri Ganesh, a gold rule, the names in gold-foil script, the
// date between two rules); the button waits on the courtyard floor below.
//
// Loading: every piece is decoded first (the CTA says "Opening your
// invitation…" until then); then the elephants walk in from the sides.
// One tap (the gesture that also starts the music and a brass bell):
//   0.00 s  the medallion presses
//   0.10 s  the screens slide apart into the piers (1.4 s), light spills out,
//           the rays turn, the illustrated couple appears in the doorway
//   0.20 s  the elephants bow, trunks low; petals pour through the arch
//   1.55 s  the camera walks through the doorway (scale up, centred on it)
//   2.15 s  the courtyard below is revealed, the gateway layer is removed.
// Transform/opacity only; no blur or filter animates. Reduced motion: a
// 400 ms cross-fade. sessionStorage remembers an opened gateway for a reload.

import { useEffect, useMemo, useRef, useState } from "react";
import { initialOf, useWeddingReducedMotion } from "../../../_wedding";
import { useDayMusic } from "../../../_valentine/music/context";
import Palace from "./Palace";
import Petals from "./Petals";
import { A, GATE, decodeAll, img, seeded } from "../assets";
import type { Strings } from "./model";

export interface GatewayProps {
  first: string;
  second: string;
  dateLine: string;
  guest: string;
  s: Strings;
  lang: "en" | "hi";
  invocation: boolean;
  /** Bumped by "Replay the opening" to close the gateway again. */
  replay: number;
  onOpened: () => void;
}

type Phase = "loading" | "closed" | "open" | "push" | "gone";

/** A small brass temple bell, synthesised (no file to download), played inside the tap. */
function ringBell() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ac = new Ctx();
    const now = ac.currentTime + 0.02;
    const out = ac.createGain();
    out.gain.value = 0.22;
    out.connect(ac.destination);
    // Inharmonic partials of a small bell, each with its own decay.
    for (const [f, g, d] of [
      [880, 0.5, 2.6],
      [1320, 0.28, 1.9],
      [2093, 0.2, 1.3],
      [2794, 0.12, 0.9],
      [3520, 0.07, 0.6],
    ] as const) {
      const o = ac.createOscillator();
      const v = ac.createGain();
      o.type = "sine";
      o.frequency.value = f;
      v.gain.setValueAtTime(0.0001, now);
      v.gain.exponentialRampToValueAtTime(g, now + 0.008);
      v.gain.exponentialRampToValueAtTime(0.0001, now + d);
      o.connect(v).connect(out);
      o.start(now);
      o.stop(now + d + 0.05);
    }
    window.setTimeout(() => void ac.close().catch(() => undefined), 3200);
  } catch {
    /* no audio: the opening is still complete */
  }
}

const OPENED_KEY = "rw-opened";

export default function Gateway({ first, second, dateLine, guest, s, lang, invocation, replay, onOpened }: GatewayProps) {
  const reduce = useWeddingReducedMotion();
  const music = useDayMusic();
  const [phase, setPhase] = useState<Phase>("loading");
  const root = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const live = useRef(true);
  const motes = useMemo(() => {
    const r = seeded(29);
    return Array.from({ length: 10 }, () => ({ left: 8 + r() * 84, delay: -r() * 10, dur: 7 + r() * 6, dx: (r() - 0.5) * 40, size: 3 + r() * 4 }));
  }, []);

  // The page stays still behind the closed gateway.
  useEffect(() => {
    if (phase === "gone") return;
    const el = document.documentElement;
    const prev = el.style.overflow;
    el.style.overflow = "hidden";
    return () => {
      el.style.overflow = prev;
    };
  }, [phase]);

  useEffect(() => {
    live.current = true;
    const list = timers.current;
    return () => {
      live.current = false;
      list.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  // Decode every piece before the first frame of the entrance.
  useEffect(() => {
    if (phase !== "loading") return;
    const imgs = Array.from(root.current?.querySelectorAll<HTMLImageElement>("img[data-rw-pre]") ?? []);
    void decodeAll(imgs, 2200).then(() => {
      if (live.current) setPhase((p) => (p === "loading" ? "closed" : p));
    });
  }, [phase]);

  // "Replay the opening": bring the gateway back, closed.
  const [seenReplay, setSeenReplay] = useState(replay);
  if (replay !== seenReplay) {
    setSeenReplay(replay);
    setPhase("loading");
  }
  const firstReplay = useRef(replay);
  useEffect(() => {
    if (replay === firstReplay.current) return;
    firstReplay.current = replay;
    try {
      window.sessionStorage.removeItem(OPENED_KEY);
    } catch {}
    window.scrollTo({ top: 0 });
  }, [replay]);

  const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));

  const open = () => {
    if (phase !== "closed") return;
    // The song starts inside this tap (the gesture browsers require), never before it.
    if (music?.available && !music.playing && !music.userOff) music.start();
    if (!music?.userOff) ringBell();
    try {
      navigator.vibrate?.([12, 50, 12]);
    } catch {}
    try {
      window.sessionStorage.setItem(OPENED_KEY, "1");
    } catch {}
    if (reduce) {
      setPhase("push");
      later(30, onOpened);
      later(420, () => setPhase("gone"));
      return;
    }
    setPhase("open");
    // The courtyard is already in the DOM under the gateway: decode its art while the screens slide.
    void decodeAll(Array.from(document.querySelectorAll<HTMLImageElement>(".rw-court img")), 1500);
    later(1550, () => live.current && setPhase("push"));
    later(2150, () => live.current && onOpened());
    later(2900, () => live.current && setPhase("gone"));
  };

  if (phase === "gone") return null;
  const moving = phase === "open" || phase === "push";
  const ap = GATE.aperture;

  return (
    <div
      ref={root}
      className={`rw-gate is-${phase}${reduce ? " is-reduced" : ""}`}
      data-rw-gate={phase}
    >
      {/* The sky and the sandstone court around the gateway. */}
      <div className="rw-gate-sky" aria-hidden>
        <span className="rw-gate-sun" />
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img className="rw-gate-cloud is-a" {...img(A.cloud)} />
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img className="rw-gate-cloud is-b" {...img(A.cloud2)} />
      </div>
      <div className="rw-gate-floor" aria-hidden />
      {/* The white palace balustrade, flush with the very bottom of the screen. */}
      <span className="rw-gate-rail" aria-hidden />
      {(["l", "r"] as const).map((side) => (
        <span key={side} className={`rw-gate-lamp is-${side}`} aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img className="is-short" {...img(A.lanterns)} />
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img className="is-long" {...img(A.lanternsLong)} />
        </span>
      ))}

      <div className="rw-gate-cam">
        {/* Kept quiet so the gateway reads first: a warm halo behind it, the white palace balustrade along the ground line, gold lanterns hanging still from the top corners. */}
        <div className="rw-gate-side" aria-hidden>
          <span className="rw-gate-halo" />
        </div>

        <div className="rw-stage" onClick={open} aria-hidden>
          {/* The doorway: warm light and the couple behind the jaali screens. */}
          <div className="rw-ap" style={{ left: `${ap.x}%`, top: `${ap.y}%`, width: `${ap.w}%`, height: `${ap.h}%` }}>
            <span className="rw-ap-glow" />
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img className="rw-ap-rays" data-rw-pre {...img(A.rays)} />
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img className="rw-ap-couple" data-rw-pre {...img(A.coupleWedding)} />
            <span className="rw-ap-motes">
              {motes.map((m, i) => (
                <i key={i} style={{ left: `${m.left}%`, width: m.size, height: m.size, animationDelay: `${m.delay}s`, animationDuration: `${m.dur}s`, ["--dx" as string]: `${m.dx}px` }} />
              ))}
            </span>
            {(["l", "r"] as const).map((side) => {
              const box = side === "l" ? GATE.screenL : GATE.screenR;
              const art = side === "l" ? A.screenL : A.screenR;
              // Screen box relative to the aperture.
              const left = ((box.x - ap.x) / ap.w) * 100;
              const width = (box.w / ap.w) * 100;
              return (
                <span key={side} className={`rw-screen is-${side}`} style={{ left: `${left}%`, width: `${width}%` }}>
                  {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                  <img data-rw-pre {...img(art, { high: true })} />
                </span>
              );
            })}
          </div>
          {/* The palace façade, drawn (./Palace): the doorway is a hole the jaali screens show through. */}
          <Palace className="rw-gateway" />
          <span className="rw-medal">
            <span className="rw-medal-ini">
              <b>{initialOf(first)}</b>
              <i>&amp;</i>
              <b>{initialOf(second)}</b>
            </span>
          </span>
          {/* The guardians: stage-relative, partly off-stage at the corners. */}
          <span className="rw-ele is-l">
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img data-rw-pre {...img(A.elephantL)} />
          </span>
          <span className="rw-ele is-r">
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img data-rw-pre {...img(A.elephantR)} />
          </span>
        </div>
      </div>

      <div className="rw-gate-copy">
        {guest && (
          <p className="rw-gate-dear" lang={lang}>
            <b>
              {s.dear} {guest},
            </b>{" "}
            <span>{s.invited}</span>
          </p>
        )}
        <p className="rw-invoke" lang="hi">
          {invocation ? "॥ श्री गणेशाय नमः ॥" : "॥ शुभ विवाह ॥"}
        </p>
        <p className="rw-gate-k" lang={lang}>
          {s.shubh}
        </p>
        <h1 className="rw-gate-names">
          <span>{first}</span> <i>&amp;</i> <span>{second}</span>
        </h1>
        {dateLine && (
          <p className="rw-gate-date">
            <i aria-hidden />
            <span>{dateLine}</span>
            <i aria-hidden />
          </p>
        )}
      </div>

      {/* The invitation to step through, on the courtyard floor under the gateway. */}
      <div className="rw-gate-foot">
        <button type="button" className="rw-gate-cta" onClick={open} disabled={phase === "loading"} aria-label={`${s.open}: ${first} ${s.and} ${second}`} lang={lang}>
          {phase === "loading" ? (
            <span>{s.opening}</span>
          ) : (
            <>
              <span className="rw-gate-cta-ring" aria-hidden />
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M4 21V10.5C4 6.4 7.6 3 12 3s8 3.4 8 7.5V21M2.5 21h19M12 7v14M8.5 13.5h1M14.5 13.5h1" />
              </svg>
              <span>{s.open}</span>
            </>
          )}
        </button>
      </div>

      {moving && !reduce && (
        <div className="rw-gate-petals" aria-hidden>
          <Petals kind={["rose", "marigold", "rose", "confetti"]} count={24} mode="fall" seed={11} />
        </div>
      )}
    </div>
  );
}

/** True when this tab already opened the gateway (a reload skips straight to the courtyard). */
export function gatewayOpenedBefore(): boolean {
  try {
    return window.sessionStorage.getItem(OPENED_KEY) === "1";
  } catch {
    return false;
  }
}
