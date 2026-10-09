"use client";

// Stall 4 · The Ferris wheel of us. Her photos ride in the cabins of a slowly turning wheel; tap a cabin to peek
// inside (a polaroid pops up). The same <Wheel> lights up and spins with her photos at the YES.

import { useEffect, useState, type CSSProperties } from "react";
import type { LovePhoto } from "../../../_love/types";
import { CroppedPhoto } from "../../../_valentine/kit";
import { CANDY, GIF, wheelPhotos } from "./model";
import { Gif, PopCard, Polaroid, StallHead, Washi, reward, useStall } from "./ui";

export function Wheel({ photos, lit, onCabin, visited, size, style, className }: { photos: (LovePhoto | null)[]; lit?: boolean; onCabin?: (i: number) => void; visited?: boolean[]; size?: string; style?: CSSProperties; className?: string }) {
  const n = photos.length;
  return (
    <div className={`vc-wheel${lit ? " is-lit" : ""}${className ? ` ${className}` : ""}`} style={{ ["--size" as string]: size ?? "min(330px, 84vw)", ...style }}>
      <svg className="vc-wheelLegs" viewBox="0 0 200 200" aria-hidden>
        <path d="M100 100 L52 196 M100 100 L148 196" stroke="#C9184A" strokeWidth="7" strokeLinecap="round" />
        <path d="M66 168 L134 168" stroke="#C9184A" strokeWidth="5" strokeLinecap="round" />
        <rect x="30" y="192" width="140" height="8" rx="4" fill="#FF8FAB" />
      </svg>
      <div className="vc-wheelSpin">
        <svg className="vc-wheelRim" viewBox="0 0 200 200" aria-hidden>
          <circle cx="100" cy="100" r="80" fill="none" stroke="#FF4D6D" strokeWidth="5" />
          <circle cx="100" cy="100" r="66" fill="none" stroke="#FFB3C6" strokeWidth="3" strokeDasharray="4 6" />
          {Array.from({ length: n }, (_, i) => {
            const a = (i / n) * Math.PI * 2;
            return <line key={i} x1="100" y1="100" x2={100 + 80 * Math.cos(a)} y2={100 + 80 * Math.sin(a)} stroke="#FF8FAB" strokeWidth="2.5" />;
          })}
          {Array.from({ length: 24 }, (_, i) => {
            const a = (i / 24) * Math.PI * 2;
            return <circle key={i} className="vc-bulb" style={{ ["--i" as string]: i }} cx={100 + 80 * Math.cos(a)} cy={100 + 80 * Math.sin(a)} r="3.2" fill="#FFD166" />;
          })}
          <circle cx="100" cy="100" r="13" fill="#FF4D6D" />
          <path d="M100 106 C 92 101, 90 97, 90 95 A 4.5 4.5 0 0 1 100 93 A 4.5 4.5 0 0 1 110 95 C 110 97, 108 101, 100 106 Z" fill="#fff" />
        </svg>
        {photos.map((ph, i) => {
          const a = (i / n) * Math.PI * 2 - Math.PI / 2;
          const style = { left: `${50 + 40 * Math.cos(a)}%`, top: `${50 + 40 * Math.sin(a)}%`, ["--col" as string]: CANDY[i % CANDY.length] } as CSSProperties;
          const inner = (
            <span className="vc-cabinIn">
              <i className="vc-cabinHook" />
              <span className="vc-cabinPod">
                <span className="vc-cabinWin">{ph ? <CroppedPhoto photo={ph} alt="" /> : <b>♥</b>}</span>
              </span>
              {visited?.[i] && <i className="vc-cabinSeen">♥</i>}
            </span>
          );
          return onCabin ? (
            <button key={i} type="button" className="vc-cabin" style={style} onClick={() => onCabin(i)} aria-label={`Cabin ${i + 1}${ph?.caption ? `: ${ph.caption}` : ""}`}>
              {inner}
            </button>
          ) : (
            <span key={i} className="vc-cabin" style={style} aria-hidden>
              {inner}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default function FerrisWheel() {
  const { c, done, isDone, sfx } = useStall();
  const photos = wheelPhotos(c.photos);
  const need = Math.min(3, photos.length);
  const [visited, setVisited] = useState<boolean[]>(() => photos.map(() => false));
  const [show, setShow] = useState<number | null>(null);
  const seen = visited.filter(Boolean).length;

  const onCabin = (i: number) => {
    setShow(i);
    if (!visited[i]) {
      setVisited((v) => v.map((x, j) => (j === i ? true : x)));
      sfx("glass-ping", { gain: 0.5, detune: i * 90 });
      reward(sfx, document.querySelectorAll(".vc-ferris .vc-cabin")[i] as HTMLElement, { cue: "sparkle" });
    } else sfx("page-turn", { gain: 0.4 });
  };

  useEffect(() => {
    if (seen < need || isDone || show !== null) return;
    const t = window.setTimeout(() => {
      sfx("chime", { gain: 0.5 });
      done();
    }, 250);
    return () => clearTimeout(t);
  }, [seen, need, isDone, show, done, sfx]);

  const ph = show !== null ? photos[show] : null;
  return (
    <section className="vc-scene vc-ferris" aria-label="Ferris wheel">
      <StallHead kicker="Stall 4 · Ferris wheel" title="Ride the wheel of us" hint={seen >= need ? "Every cabin is a day I'd ride again." : `Tap a cabin to peek inside · ${seen}/${need}`} />
      <div className="vc-ferrisStage">
        <Wheel photos={photos} onCabin={onCabin} visited={visited} />
        <Gif src={GIF.penguinsLock} size={92} tilt={-6} float className="vc-ferrisGif" />
      </div>
      <PopCard open={show !== null} onClose={() => setShow(null)} label="A cabin of the wheel">
        <div className="vc-prize">
          <span className="vc-prizeKick">Cabin {show !== null ? show + 1 : ""} ✦</span>
          <Polaroid photo={ph} caption={ph?.caption || "us, again"} fallback="💖" tilt={2} width={250} eager>
            <Washi color="#FFD166" rot={5} style={{ right: 18, top: -12 }} />
          </Polaroid>
          {ph?.note && <p className="vc-prizeNote">{ph.note}</p>}
        </div>
      </PopCard>
    </section>
  );
}
