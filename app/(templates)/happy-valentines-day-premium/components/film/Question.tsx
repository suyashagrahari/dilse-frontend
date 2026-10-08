"use client";

// Scene 8 — The Question (mini-game 2, "Take 2"). Shot in black and white under one spotlight ("film-spot"); the
// song is PAUSED for a silent suspense beat with only a heartbeat under it. Every No is a take: a clapperboard
// snaps in ("film-clap"), No shrinks, and the director's next line appears. After the last line, No gives up and
// becomes a second YES. YES: the song comes back from just before its chorus and the kit's drop() rises
// (riser → seek to the chorus → impact); at the peak the colour floods out of the YES button (Finale).

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePremium, useSongDrop } from "../../../_valentine/kit/premium";
import { haptic } from "../../../_valentine/kit";
import type { Film } from "./util";

function Clapper({ take, title }: { take: number; title: string }) {
  return (
    <svg className="fm-clap is-go" viewBox="0 0 320 240" aria-hidden key={take}>
      <g className="fm-clapTop">
        <rect x="14" y="30" width="292" height="40" rx="4" fill="#111" />
        {[0, 1, 2, 3, 4, 5].map((k) => <path key={k} d={`M${34 + k * 48} 30 L${58 + k * 48} 30 L${44 + k * 48} 70 L${20 + k * 48} 70 Z`} fill="#eee" />)}
      </g>
      <rect x="14" y="74" width="292" height="150" rx="6" fill="#151515" stroke="#eee" strokeWidth="3" />
      <line x1="14" y1="122" x2="306" y2="122" stroke="#eee" strokeWidth="2" />
      <line x1="160" y1="122" x2="160" y2="224" stroke="#eee" strokeWidth="2" />
      <text x="160" y="106" textAnchor="middle" fill="#eee" style={{ font: "700 15px var(--fm-type)", letterSpacing: ".12em" }}>{(title.length > 24 ? `${title.slice(0, 23)}…` : title).toUpperCase()}</text>
      <text x="87" y="150" textAnchor="middle" fill="#bbb" style={{ font: "700 12px var(--fm-type)", letterSpacing: ".2em" }}>SCENE</text>
      <text x="87" y="200" textAnchor="middle" fill="#fff" style={{ font: "400 44px var(--fm-display)" }}>8</text>
      <text x="233" y="150" textAnchor="middle" fill="#bbb" style={{ font: "700 12px var(--fm-type)", letterSpacing: ".2em" }}>TAKE</text>
      <text x="233" y="200" textAnchor="middle" fill="#fff" style={{ font: "400 44px var(--fm-display)" }}>{take}</text>
    </svg>
  );
}

export default function Question({ film, sticker, onYes }: { film: Film; sticker: ReactNode; onYes: (takes: number, origin: { x: number; y: number }) => void }) {
  const { sfx, music, premium } = usePremium();
  const { drop } = useSongDrop();
  const [takes, setTakes] = useState(0);
  const [rising, setRising] = useState<{ x: number; y: number } | null>(null);
  const yesRef = useRef<HTMLButtonElement>(null);
  const giveUp = takes >= film.takes.length;

  // Silence: pause the song, hit the lamp, start the heartbeat.
  useEffect(() => {
    music?.pause();
    sfx("film-spot");
    let hb = sfx("heartbeat", { count: 9, gain: 0.55, at: 0.8 });
    const loop = window.setInterval(() => {
      hb.stop(200);
      hb = sfx("heartbeat", { count: 9, gain: 0.55 });
    }, 7650);
    return () => {
      window.clearInterval(loop);
      hb.stop(300);
    };
  }, [music, sfx]);

  const no = () => {
    if (rising) return;
    sfx("film-clap");
    haptic([10, 30, 10]);
    setTakes((t) => t + 1);
  };

  const yes = (el: HTMLElement | null) => {
    if (rising) return;
    const b = el?.getBoundingClientRect();
    const origin = b ? { x: b.left + b.width / 2, y: b.top + b.height / 2 } : { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    setRising(origin);
    haptic(20);
    // Inside the tap: bring the song back just before its chorus, so the riser runs into it.
    if (music?.mode === "youtube" && premium.songDropAt > 0) music.seekTo(Math.max(0, premium.songDropAt - 1.2));
    music?.play();
    drop(() => onYes(takes, origin));
  };

  return (
    <section className="fm-scene" aria-label="The final scene: the question" style={{ overflow: "hidden" }}>
      <div className="fm-bw" style={{ position: "absolute", inset: 0 }}>
        <span className="fm-spot is-on" aria-hidden />
      </div>
      <div className="fm-q fm-bw">
        <p className="fm-kick" style={{ color: "#ccc" }}>Scene 8 · Take {takes + 1} <span className="fm-heart" aria-hidden>♥</span></p>
        <h2><em>{film.to},</em>{film.question}</h2>
        <div className="fm-answers">
          <button ref={yesRef} type="button" className={`fm-yes${rising ? " is-rising" : ""}`} onClick={(e) => yes(e.currentTarget)}>YES</button>
          {giveUp ? (
            <button type="button" className="fm-yes" style={{ minWidth: 120, minHeight: 60, fontSize: 26 }} onClick={(e) => yes(e.currentTarget)}>YES</button>
          ) : (
            <button type="button" className="fm-no" style={{ transform: `scale(${Math.max(0.6, 1 - takes * 0.1)})` }} onClick={no}>No</button>
          )}
        </div>
        <p className="fm-takeLine" aria-live="polite">
          {rising ? "That's a wrap." : giveUp ? "Okay, it's a wrap… on YES." : takes > 0 ? film.takes[takes - 1] : " "}
        </p>
        <div style={{ filter: "none" }}>{sticker}</div>
      </div>
      {takes > 0 && !rising && <Clapper take={takes + 1} title={film.title} />}
      {rising && <span className="fm-rising" aria-hidden style={{ ["--ox" as string]: `${rising.x}px`, ["--oy" as string]: `${rising.y}px` }} />}
    </section>
  );
}
