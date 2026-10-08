"use client";

// The kiss-booth strip (Booth prints it, the ending shows it again): four
// frames from the sender's photos, the sender's lipstick stamps on frames 1
// and 3, the recipient's stamps wherever they tapped, and the names.

import type { Ref } from "react";
import { CroppedPhoto } from "../../../_valentine/kit";
import type { LovePhoto } from "../../../_valentine/types";
import type { KissShade } from "../../../_valentine/days/happy-kiss-day-premium";
import { Lips } from "./art";
import { HAND } from "./fonts";
import { SHADES, type Kisses } from "./model";

export interface Stamp { x: number; y: number; shade: KissShade; rot: number }

export const stripFrames = (photos: LovePhoto[]) => {
  const list = photos.filter((p) => p && p.url);
  return Array.from({ length: 4 }, (_, i) => list[i % Math.max(1, list.length)] as LovePhoto | undefined);
};

export default function Strip({ k, photos, aspect, stamps, onPointerDown, innerRef, small }: { k: Kisses; photos: LovePhoto[]; aspect: number; stamps: Stamp[]; onPointerDown?: (e: React.PointerEvent) => void; innerRef?: Ref<HTMLDivElement>; small?: boolean }) {
  return (
    <div ref={innerRef} className={`kd-strip${small ? " is-small" : ""}`} onPointerDown={onPointerDown} role="img" aria-label={`A photo-booth strip of ${k.recipient} and ${k.sender} with ${stamps.length} of ${k.recipient}'s kisses on it.`}>
      {stripFrames(photos).map((ph, i) => (
        <div key={i} className="kd-frame" style={{ aspectRatio: String(aspect) }}>
          {ph ? <CroppedPhoto photo={ph} eager /> : <span className="kd-frameEmpty">💋</span>}
          {(i === 0 || i === 2) && (
            <span className="kd-senderStamp" style={{ [i === 0 ? "right" : "left"]: 6 }}>
              <Lips color={k.S.c} size={small ? 30 : 40} cute={!k.lipstick} />
            </span>
          )}
        </div>
      ))}
      <p className="kd-stripFoot" style={{ fontFamily: HAND }}>
        {k.recipient} + {k.sender} · Kiss Day
      </p>
      {stamps.map((s, i) => (
        <span key={i} className="kd-myStamp" style={{ left: `${s.x}%`, top: `${s.y}%`, transform: `translate(-50%, -50%) rotate(${s.rot}deg)` }}>
          <Lips color={SHADES[s.shade].c} size={small ? 40 : 52} />
        </span>
      ))}
      <style>{STRIP_CSS}</style>
    </div>
  );
}

const STRIP_CSS = `
.kd-strip { position: relative; width: min(56vw, 210px); padding: 12px 12px 8px; box-sizing: border-box; background: #FFFDF8; display: grid; gap: 10px; touch-action: manipulation;
  box-shadow: 0 30px 50px -20px rgba(60,6,20,.6); }
.kd-strip.is-small { width: min(46vw, 170px); transform: rotate(-3deg); }
.kd-frame { position: relative; overflow: hidden; background: #F4E2D4; display: grid; place-items: center; }
.kd-frameEmpty { font-size: 42px; }
.kd-senderStamp { position: absolute; bottom: 6px; transform: rotate(-12deg); opacity: .9; mix-blend-mode: multiply; }
.kd-stripFoot { margin: 0; text-align: center; font-size: 19px; line-height: 1.05; color: var(--vw-ink); overflow-wrap: anywhere; }
.kd-strip.is-small .kd-stripFoot { font-size: 15px; }
.kd-strip.is-small { gap: 7px; padding: 9px 9px 6px; }
.kd-myStamp { position: absolute; pointer-events: none; mix-blend-mode: multiply; opacity: .92; }
`;
