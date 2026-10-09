"use client";

// The Mwah Booth strip: four frames of their photos on white booth paper, a
// bubbly header, a date + initials footer, and the stickers she pressed on
// (lips, hearts, "mwah!", sparkles). Every length is a multiple of --sw, and
// keepsake.ts draws the same geometry (GEO) on canvas, so the saved story card
// matches the page sticker for sticker.

import { forwardRef, type CSSProperties } from "react";
import { CroppedPhoto } from "../../../_valentine/kit";
import { LipPrint } from "./LipPrint";
import { initialOf, stampDate, type Deco, type DecoKind, type Mwah } from "./model";
import { PuffyHeart, Sparkle } from "./ui";

/** Strip geometry in units of the strip width. */
export const GEO = { pad: 0.07, head: 0.2, gap: 0.05, foot: 0.3, frameW: 0.86, frameH: 0.645 } as const;
export const STRIP_H = GEO.head + 4 * GEO.frameH + 3 * GEO.gap + GEO.foot; // 3.23

export function DecoArt({ kind, m, size }: { kind: DecoKind; m: Mwah; size: number }) {
  switch (kind) {
    case "lips":
      return <LipPrint color={m.S.c} lipstick={m.lipstick} size={size} seed={5} />;
    case "heart":
      return <PuffyHeart size={size * 0.62} color={m.S.hi} />;
    case "mwah":
      return (
        <span className="km-decoMwah" style={{ fontSize: size * 0.3 }}>
          mwah!
        </span>
      );
    default:
      return <Sparkle style={{ width: size * 0.48, height: size * 0.48, filter: "drop-shadow(0 0 0 #fff) drop-shadow(0 2px 0 #fff)" }} color="#FFC94D" />;
  }
}

export interface StripProps {
  m: Mwah;
  decos?: Deco[];
  /** Frames shown so far (0–4); the rest are blank paper. */
  shown?: number;
  /** CSS length. */
  width: string;
  /** The deco art size, in px (≈ 0.42 × the strip width). */
  decoPx: number;
  dateLine?: string;
  className?: string;
  style?: CSSProperties;
}

const Strip = forwardRef<HTMLDivElement, StripProps>(function Strip({ m, decos = [], shown = 4, width, decoPx, dateLine, className, style }, ref) {
  return (
    <div
      ref={ref}
      className={`km-strip${className ? ` ${className}` : ""}`}
      style={{ ["--sw" as string]: width, ...style }}
      role="img"
      aria-label={`A Mwah Booth photo strip of ${m.recipient} and ${m.sender}${decos.length ? `, with ${decos.length} stickers on it` : ""}.`}
    >
      <span className="km-stripHead">Mwah Booth</span>
      {m.strip.map((ph, i) => (
        <span key={i} className={`km-frame${i < shown ? " is-in" : ""}`} style={{ top: `calc(var(--sw) * ${GEO.head + i * (GEO.frameH + GEO.gap)})` }}>
          {i < shown && (ph ? <CroppedPhoto photo={ph} eager /> : <span className="km-frameEmpty">{initialOf(m.recipient)}♥{initialOf(m.sender)}</span>)}
        </span>
      ))}
      <span className="km-stripFoot">
        <b>{dateLine || stampDate()}</b>
        <i>
          {initialOf(m.recipient)} ♥ {initialOf(m.sender)}
        </i>
      </span>
      {decos.map((d) => (
        <span key={d.id} className="km-deco" style={{ left: `${d.x}%`, top: `${d.y}%`, ["--r" as string]: `${d.rot}deg` }} aria-hidden>
          <DecoArt kind={d.kind} m={m} size={decoPx} />
        </span>
      ))}
    </div>
  );
});
export default Strip;

export const STRIP_CSS = `
.km-strip { position: relative; width: var(--sw); height: calc(var(--sw) * ${STRIP_H}); background: #fff; border-radius: 4px; flex: none;
  box-shadow: 0 0 0 1px rgba(214,63,114,.08), 0 24px 40px -20px rgba(214,63,114,.6), 0 4px 10px -6px rgba(91,35,51,.25); }
.km-stripHead { position: absolute; left: 0; right: 0; top: 0; height: calc(var(--sw) * ${GEO.head}); display: grid; place-items: center;
  font: 400 calc(var(--sw) * .11)/1 var(--km-display); color: var(--km-primary); letter-spacing: .02em; }
.km-frame { position: absolute; left: calc(var(--sw) * ${GEO.pad}); width: calc(var(--sw) * ${GEO.frameW}); height: calc(var(--sw) * ${GEO.frameH}); overflow: hidden; border-radius: 2px;
  background: repeating-linear-gradient(45deg, #FFF0F5 0 8px, #FFE6EE 8px 16px); }
.km-frame.is-in > * { animation: km-develop .7s ease-out both; }
@keyframes km-develop { from { opacity: 0; filter: brightness(2.2) saturate(.2); } to { opacity: 1; filter: none; } }
.km-frameEmpty { display: grid; place-items: center; width: 100%; height: 100%; font: 400 calc(var(--sw) * .14)/1 var(--km-display); color: var(--km-soft); }
.km-stripFoot { position: absolute; left: 0; right: 0; bottom: 0; height: calc(var(--sw) * ${GEO.foot}); display: grid; align-content: center; justify-items: center; gap: calc(var(--sw) * .02); }
.km-stripFoot b { font: 600 calc(var(--sw) * .075)/1 var(--km-hand); color: var(--km-ink); }
.km-stripFoot i { font: 400 calc(var(--sw) * .085)/1 var(--km-display); font-style: normal; color: var(--km-deep); }
.km-deco { position: absolute; transform: translate(-50%, -50%) rotate(var(--r)); pointer-events: none; z-index: 2; animation: km-stick .38s var(--km-spring) both; }
.km-deco svg { filter: drop-shadow(0 1px 1px rgba(0,0,0,.15)); }
@keyframes km-stick { from { transform: translate(-50%, -50%) rotate(var(--r)) scale(1.6); opacity: 0; } to { transform: translate(-50%, -50%) rotate(var(--r)) scale(1); opacity: 1; } }
.km-decoMwah { display: inline-block; font-family: var(--km-display); color: var(--km-primary); white-space: nowrap; line-height: 1;
  text-shadow: 2px 0 #fff, -2px 0 #fff, 0 2px #fff, 0 -2px #fff, 2px 2px #fff, -2px -2px #fff, 2px -2px #fff, -2px 2px #fff, 0 4px 6px rgba(214,63,114,.35); }
@media (prefers-reduced-motion: reduce) { .km-frame.is-in > *, .km-deco { animation-duration: .01s; } }
`;
