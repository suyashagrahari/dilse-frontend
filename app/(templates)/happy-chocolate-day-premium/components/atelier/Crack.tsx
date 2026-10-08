"use client";

// ─── Scene 4: Crack the heart — the signature wow and the ONE song drop ─────
//
// Three taps with the gold hammer. Hit 1: hairline cracks grow from the
// centre, a dull thud. Hit 2: they branch, a chip flies. Hit 3: the cracks
// glow gold, the heart trembles through the riser, and on the song's peak the
// shell bursts into Voronoi shards (<Shatter>) that bounce on the velvet and
// tinkle. Inside: the truffles in gold tissue and a folded photo with a note.
// Reduced motion: a crossfade straight to the opened nest.

import { useEffect, useRef, useState } from "react";
import { CroppedPhoto, haptic } from "../../../_valentine/kit";
import { Letterbox, useSongDrop } from "../../../_valentine/kit/premium";
import { GoldHammer, HEART_D, Truffle } from "./art";
import Shatter from "./Shatter";
import type { SceneProps } from "./shared";

const CRACKS: string[][] = [
  ["M50 48 L45 41 L46 33 L42 27", "M50 48 L57 52 L63 50", "M50 48 L49 57 L52 62"],
  ["M42 27 L36 24 L28 27", "M63 50 L71 46 L80 41", "M52 62 L45 67 L44 75", "M50 48 L58 40 L62 30 L68 24", "M45 41 L34 44 L24 40"],
  ["M24 40 L15 36", "M44 75 L50 84", "M80 41 L88 34", "M57 52 L64 62 L60 72", "M28 27 L22 20"],
];

export default function Crack({ x, data, truffles, marks, reduced, sfx, sticker, next, onPeak }: SceneProps & { onPeak: () => void }) {
  const [hits, setHits] = useState(0);
  const [blow, setBlow] = useState<{ id: number; x: number; y: number } | null>(null);
  const [shattered, setShattered] = useState(false);
  const [size, setSize] = useState(260);
  const { drop } = useSongDrop();
  const box = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    setSize(Math.round(Math.min(300, el.clientWidth * 0.7)));
  }, []);

  const hit = (cx?: number, cy?: number) => {
    if (hits >= 3) return;
    const el = box.current;
    const r = el?.getBoundingClientRect();
    const px = r && cx != null ? Math.max(0.3, Math.min(0.7, (cx - r.left) / r.width)) : 0.5;
    const py = r && cy != null ? Math.max(0.3, Math.min(0.62, (cy - r.top) / r.height)) : 0.46;
    setBlow({ id: Date.now(), x: px, y: py });
    const n = hits + 1;
    setHits(n);
    if (n < 3) {
      sfx("choc-thud", { detune: n * 80 });
      timers.current.push(window.setTimeout(() => sfx("choc-crack"), 60));
      haptic(n === 1 ? 30 : [40, 30, 40]);
      return;
    }
    sfx("choc-thud", { detune: 200, gain: 1.2 });
    sfx("choc-crack", { at: 0.05 });
    haptic([60, 40, 80]);
    drop(() => {
      setShattered(true);
      sfx("choc-shatter");
      onPeak();
    });
  };

  const photo = data.photos[0];
  const crackLine = x.crackLine || "Go on. Break my heart (the good way).";

  return (
    <section className="mc-sec">
      <Letterbox show={hits === 3 && !shattered && !reduced} />
      <header className="mc-head">
        <p className="mc-kick">{shattered ? "Inside the heart" : `${hits}/3 · the gold hammer`}</p>
        <h2 className="mc-h">{shattered ? "There was something inside all along" : crackLine}</h2>
      </header>
      <div ref={box} className={`mc-crack h${hits}${shattered ? " is-open" : ""}`} style={{ ["--hs" as string]: `${size}px` }}>
        <div className="mc-velvet" aria-hidden />
        {/* the nest under the shell */}
        <div className="mc-nest" aria-hidden={!shattered}>
          <div className="mc-tissue" />
          <div className="mc-nestTruf">
            {truffles.map((t, i) => (
              <Truffle key={i} flavour={t.flavour} size={Math.round(size * 0.2)} style={{ animationDelay: `${0.25 + i * 0.08}s` }} />
            ))}
          </div>
          {photo && (
            <figure className="mc-folded">
              <span className="mc-foldedPh"><CroppedPhoto photo={photo} alt={photo.caption || "A photo of you two"} /></span>
              {x.insideNote && <figcaption>{x.insideNote}</figcaption>}
            </figure>
          )}
        </div>
        {!shattered && (
          <button type="button" className="mc-heartBtn" onClick={(e) => hit(e.clientX, e.clientY)} aria-label={`Hit the chocolate heart with the hammer — ${3 - hits} to go`}>
            <svg viewBox="0 0 100 100" className="mc-heartSvg">
              <defs>
                <radialGradient id="mc-hg" cx=".36" cy=".3" r=".75">
                  <stop offset="0" stopColor="#9a5d3b" />
                  <stop offset=".45" stopColor="#5b3020" />
                  <stop offset="1" stopColor="#24100a" />
                </radialGradient>
              </defs>
              <path d={HEART_D} fill="url(#mc-hg)" />
              <path d={HEART_D} fill="none" stroke="rgba(255,220,190,.18)" strokeWidth="2.4" />
              <path d="M20 26 Q28 13 42 19" stroke="#fff" strokeOpacity=".45" strokeWidth="3" fill="none" strokeLinecap="round" />
              {marks.length > 0 && (
                <text x="50" y="52" textAnchor="middle" className="mc-emboss">
                  {marks.join(" ♥ ")}
                </text>
              )}
              {CRACKS.map((grp, gi) => (
                <g key={gi} className={`mc-cr${hits > gi ? " is-on" : ""}`}>
                  {grp.map((d, i) => (
                    <path key={i} d={d} pathLength={1} />
                  ))}
                </g>
              ))}
            </svg>
          </button>
        )}
        {shattered && !reduced && <Shatter size={size} marks={marks} onLand={(fx) => sfx("choc-tinkle", { pan: fx * 2 - 1, detune: Math.random() * 600 })} />}
        {!shattered && blow && (
          <span key={blow.id} className="mc-blow" style={{ left: `${blow.x * 100}%`, top: `${blow.y * 100}%` }} aria-hidden>
            <GoldHammer className="mc-blowHammer" />
            <span className="mc-blowFlash" />
          </span>
        )}
        {!shattered && !blow && <GoldHammer className="mc-restHammer" />}
        {hits >= 2 && !shattered && <span className="mc-chip" aria-hidden />}
      </div>
      <div className="mc-actions">
        {!shattered ? (
          <button type="button" className="mc-btn" onClick={() => hit()} disabled={hits >= 3}>
            {hits >= 3 ? "…" : `Tap with the hammer · ${3 - hits} to go`}
          </button>
        ) : (
          <>
            <span className="mc-stick">{sticker("pc2-smash", 84)}</span>
            <button type="button" className="mc-btn" onClick={next}>
              Taste the truffles →
            </button>
          </>
        )}
      </div>
    </section>
  );
}
