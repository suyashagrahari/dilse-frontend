"use client";

// Scene 5 — Sky lanterns. Their photos hang in paper kandils on gold strings,
// swaying a little in the evening air, still dark. Tap a lantern to light it:
// the paper glows, the photo inside warms up and its caption appears. A lit
// lantern opens the photo full-screen (with the little note). The way on shows
// once every lantern is glowing. Up to six, always one screen: the grid picks
// its columns from the count and sizes the lanterns to the room.

import { useEffect, useRef, useState } from "react";
import { CroppedPhoto, PhotoLightbox, burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import type { LovePhoto } from "../../../_valentine/types";
import { FONTS } from "../../../_valentine/theme";
import { DW_GIF, preload, useDw, useNext } from "./stage";
import { DW, Hint, SceneTitle } from "./ui";

/** Outside the component: the React compiler treats these as impure inside it. */
const now = () => performance.now();

const CSS = `
.dw-lans { width: 100%; height: 100%; display: grid; grid-template-columns: repeat(var(--cols), auto); justify-content: center; align-content: center; column-gap: 14px; row-gap: 10px; }
.dw-lan { --w: min(calc((100cqw - (var(--cols) - 1) * 14px) / var(--cols)), calc(((100cqh - (var(--rows) - 1) * 10px) / var(--rows) - 66px) * .8), 190px);
  position: relative; width: var(--w); display: grid; justify-items: center; border: 0; padding: 0; background: none; cursor: pointer; color: inherit;
  transform-origin: 50% 0; animation: dw-sway 4.4s ease-in-out infinite alternate; touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
.dw-lan:focus-visible { outline: 3px solid #2EC4B6; outline-offset: 4px; border-radius: 12px; }
@keyframes dw-sway { from { transform: rotate(-2.2deg) } to { transform: rotate(2.2deg) } }
.dw-lan-str { width: 1.5px; height: 14px; background: linear-gradient(#FFD36E, #C98A3A); }
.dw-lan-cap { width: 62%; height: 10px; border-radius: 6px 6px 2px 2px; background: linear-gradient(180deg, #FFD36E, #B9802C); box-shadow: 0 2px 0 #7A4A12; }
.dw-lan-body { position: relative; display: block; width: 100%; padding: 8px; box-sizing: border-box; border-radius: 14px;
  background: linear-gradient(180deg, #5A2440, #3A1530); box-shadow: inset 0 0 0 2px rgba(255,211,110,.35); transition: background .6s ease, box-shadow .6s ease; }
.dw-lan-body::before, .dw-lan-body::after { content: ""; position: absolute; left: 6px; right: 6px; height: 6px;
  background: repeating-linear-gradient(90deg, #FFD36E 0 6px, transparent 6px 12px); opacity: .55; }
.dw-lan-body::before { top: 1px; } .dw-lan-body::after { bottom: 1px; }
.dw-lan.is-lit .dw-lan-body { background: linear-gradient(180deg, #FF9A3C, #E0527A); box-shadow: inset 0 0 0 2px #FFD36E, 0 0 26px 4px rgba(255,170,60,.55), 0 0 60px 6px rgba(255,120,60,.25); }
.dw-lan-photo { position: relative; display: block; width: 100%; aspect-ratio: 4 / 5; border-radius: 9px; overflow: hidden; background: #241133; }
.dw-lan-photo > span:first-child { filter: brightness(.22) saturate(.4); transition: filter .8s ease; }
.dw-lan.is-lit .dw-lan-photo > span:first-child { filter: none; }
.dw-lan-photo::after { content: ""; position: absolute; inset: 0; border-radius: inherit; box-shadow: inset 0 0 18px rgba(255,190,90,.0); transition: box-shadow .8s; pointer-events: none; }
.dw-lan.is-lit .dw-lan-photo::after { box-shadow: inset 0 0 22px rgba(255,190,90,.55); }
.dw-lan-q { position: absolute; inset: 0; display: grid; place-items: center; font: 700 22px ${FONTS.ui}; color: rgba(255,211,110,.75); transition: opacity .4s; }
.dw-lan.is-lit .dw-lan-q { opacity: 0; }
.dw-lan-tassel { width: 4px; height: 20px; margin-top: -1px; border-radius: 0 0 3px 3px; background: linear-gradient(#FFD36E, #E0527A); }
.dw-lan-cap2 { width: 40%; height: 6px; border-radius: 2px 2px 6px 6px; background: linear-gradient(180deg, #B9802C, #FFD36E); }
.dw-lan-cap-t { width: 100%; min-height: 16px; margin-top: 2px; font: 600 clamp(10.5px, 1.6dvh, 12.5px)/1.3 ${FONTS.ui}; color: ${DW.cream}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; opacity: 0; transition: opacity .6s; }
.dw-lan.is-lit .dw-lan-cap-t { opacity: 1; }
@media (prefers-reduced-motion: reduce) { .dw-lan { animation: none; } }
`;

export default function Lanterns({ photos, onNext }: { photos: LovePhoto[]; onNext: () => void }) {
  const reduced = useReducedMotion();
  const { cue } = useDw();
  const list = photos.filter((p) => p && p.url).slice(0, 6);
  const n = list.length;
  const [lit, setLit] = useState<boolean[]>(() => list.map(() => false));
  const [open, setOpen] = useState<number | null>(null);
  const done = lit.every(Boolean);
  const litAt = useRef<number[]>([]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      preload(DW_GIF.skyDeepavali);
      preload(DW_GIF.skyHanabi);
    }, 1500);
    return () => window.clearTimeout(t);
  }, []);

  const cols = n <= 3 ? n : n === 4 ? 2 : 3;
  const rows = Math.ceil(n / cols);

  const tap = (i: number, el: HTMLElement) => {
    if (!lit[i]) {
      haptic(12);
      cue("chime", { gain: 0.45, detune: i * 140 });
      litAt.current[i] = now();
      setLit((l) => {
        const nl = l.slice();
        nl[i] = true;
        return nl;
      });
      if (!reduced) {
        const r = el.getBoundingClientRect();
        burst({ kind: "sparkles", emojis: ["✨", "🌟"], origin: { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 2) / window.innerHeight }, count: 10, spread: 0.18 });
      }
      return;
    }
    // A second tap opens the photo (not the very tap that lit it).
    if (now() - (litAt.current[i] ?? 0) > 350) setOpen(i);
  };

  useNext(done ? "Fireworks!" : null, onNext, "rocket");

  return (
    <>
      <style>{CSS}</style>
      <SceneTitle kicker="Sky lanterns" title="Light up the memories" sub={done ? "Tap a lantern to see it up close." : "Tap each lantern to light it."} />
      <div className="dw-fill">
        <div className="dw-lans" style={{ ["--cols" as string]: cols, ["--rows" as string]: rows }}>
          {list.map((p, i) => (
            <button
              key={i}
              type="button"
              className={`dw-lan${lit[i] ? " is-lit" : ""}`}
              style={{ ["--cols" as string]: cols, ["--rows" as string]: rows, animationDelay: `${-i * 0.9}s` }}
              onClick={(e) => tap(i, e.currentTarget)}
              aria-label={lit[i] ? `Open photo ${i + 1}${p.caption ? `: ${p.caption}` : ""}` : `Light lantern ${i + 1}`}
            >
              <span className="dw-lan-str" aria-hidden />
              <span className="dw-lan-cap" aria-hidden />
              <span className="dw-lan-body">
                <span className="dw-lan-photo">
                  <CroppedPhoto photo={p} alt={p.caption || `Photo ${i + 1}`} eager={i < 3} />
                  <span className="dw-lan-q" aria-hidden>
                    ✦
                  </span>
                </span>
              </span>
              <span className="dw-lan-cap2" aria-hidden />
              <span className="dw-lan-tassel" aria-hidden />
              <span className="dw-lan-cap-t">{p.caption || " "}</span>
            </button>
          ))}
        </div>
      </div>
      <div style={{ flex: "none", minHeight: 40, display: "grid", placeItems: "center" }}>
        <Hint>{done ? "Every memory, glowing 🏮" : `${lit.filter(Boolean).length} of ${n} lit`}</Hint>
      </div>
      <PhotoLightbox photos={list} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
    </>
  );
}
