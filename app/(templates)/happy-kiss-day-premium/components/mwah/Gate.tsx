"use client";

// The gate's art: a cute candy-pink lipstick. Drag round it (a circular
// twist) and the bullet rises in the sender's shade, click by click; at the
// top it says "Ready?" and the open button starts beating. A plain tap opens
// it straight away (the twist finishes itself while the gate pops away), so
// the gesture is a treat, never a lock. Everything audible starts in the
// gate's own click (PremiumGate), never in the drag.

import { useRef, useState } from "react";
import { haptic } from "../../../_valentine/kit";
import { sfx } from "../../../_valentine/kit/premium";
import { LipPrint } from "./LipPrint";
import type { Mwah } from "./model";
import { Gif, PuffyHeart, Sparkle } from "./ui";

const TURNS = 1.1; // full turns to twist it all the way up

export function Lipstick({ m, gif, onReady }: { m: Mwah; gif: string; onReady: () => void }) {
  const [p, setP] = useState(0);
  const last = useRef<number | null>(null);
  const acc = useRef(0);
  const box = useRef<HTMLSpanElement>(null);
  const clicks = useRef(0);
  const ready = p >= 1;

  const angle = (e: React.PointerEvent) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return 0;
    return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2));
  };
  const down = (e: React.PointerEvent) => {
    last.current = angle(e);
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const move = (e: React.PointerEvent) => {
    if (last.current == null || ready) return;
    const a = angle(e);
    let d = a - last.current;
    if (d > Math.PI) d -= Math.PI * 2;
    if (d < -Math.PI) d += Math.PI * 2;
    last.current = a;
    acc.current += Math.abs(d);
    const np = Math.min(1, acc.current / (Math.PI * 2 * TURNS));
    const step = Math.floor(np * 8);
    if (step > clicks.current) {
      clicks.current = step;
      sfx("kmw-twist", { gain: 0.6, detune: step * 60 });
      haptic(6);
    }
    setP(np);
    if (np >= 1) {
      haptic([15, 40, 25]);
      onReady();
    }
  };
  const up = () => {
    last.current = null;
  };

  const rise = ready ? 1 : 0.4 + p * 0.6;
  return (
    <span
      ref={box}
      className={`km-lip${ready ? " is-ready" : ""}`}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      style={{ ["--rise" as string]: rise, ["--spin" as string]: `${Math.round(p * 260)}px`, ["--shade" as string]: m.S.c, ["--shade-hi" as string]: m.S.hi }}
    >
      <span className="km-lipGlow" aria-hidden />
      <span className="km-lipStick" aria-hidden>
        <span className="km-lipBullet" />
        <span className="km-lipCollar" />
        <span className="km-lipBase">
          <span className="km-lipStripes" />
          <PuffyHeart size={30} color="#fff" style={{ position: "relative", zIndex: 1 }} />
        </span>
      </span>
      <span className="km-lipPrint" aria-hidden>
        <LipPrint color={m.S.c} lipstick={m.lipstick} size={74} seed={4} />
      </span>
      <Sparkle className="km-lipSpark is-a" color="#FFE27A" />
      <Sparkle className="km-lipSpark is-b" color="#FF9EBB" />
      <Gif src={gif} size={92} tilt={-8} eager className="km-lipGif" />
      <span className="km-lipHint" aria-hidden>
        {ready ? "Ready? 💋" : p > 0.05 ? "keep twisting…" : "twist me ↻"}
      </span>
    </span>
  );
}

export const GATE_BG =
  "radial-gradient(60% 40% at 15% 12%, rgba(255,209,223,.9), transparent 70%), radial-gradient(55% 40% at 90% 85%, rgba(255,226,122,.35), transparent 70%), linear-gradient(160deg, #FFF5F8 0%, #FFE3EC 60%, #FFD6E3 100%)";

export const GATE_CSS = `
.km-gate .pm-bar { display: none; }
.km-gate { color: var(--km-ink) !important; }
.km-gate .pm-gateIn { gap: 10px; }
.km-gate .pm-gateKick { font: 600 12px/1.3 var(--km-ui); letter-spacing: .22em; color: var(--km-deep); opacity: 1; padding: 6px 14px; border-radius: 99px; background: rgba(255,255,255,.8); }
.km-gate .pm-gateName { font-family: var(--km-hand) !important; font-weight: 600 !important; color: var(--km-deep) !important; line-height: 1 !important; font-size: clamp(54px, 16vw, 96px) !important;
  text-shadow: 0 4px 0 #fff, 0 10px 24px rgba(214,63,114,.25); -webkit-text-fill-color: currentColor !important; background: none !important; }
.km-gate .pm-kn::after { display: none !important; }
.km-gate .pm-gateSub { font: 500 17px/1.35 var(--km-ui); color: var(--km-ink2); opacity: 1; max-width: 26ch; }
.km-gate .pm-gateArt { width: min(250px, 64vw); aspect-ratio: 1; max-height: 36vh; animation: none; touch-action: none; }
.km-gate .pm-gateCta { color: #fff; font: 600 18px/1 var(--km-ui); letter-spacing: .01em; min-height: 58px; min-width: 240px;
  background: linear-gradient(180deg, #FF7AA5 0%, #FF4F86 55%, #F23E78 100%); box-shadow: 0 5px 0 #D63F72, 0 14px 30px -10px rgba(214,63,114,.6), inset 0 2px 0 rgba(255,255,255,.45); }
.km-gate .pm-gateCta:active { transform: translateY(3px); box-shadow: 0 2px 0 #D63F72, 0 6px 14px -6px rgba(214,63,114,.5); }
.km-gate.is-ready .pm-gateCta { animation: km-beat 1.2s ease-in-out infinite; }
.km-gate .pm-gateCta small { color: #fff; opacity: .85; }
.km-gate .pm-seal { background: rgba(255,255,255,.75); color: var(--km-ink2); font: 500 13px/1.2 var(--km-ui); box-shadow: 0 4px 14px -8px rgba(214,63,114,.4); }
.km-gate .pm-sealWax { background: radial-gradient(circle at 35% 30%, #FF9EBB, #FF4F86 55%, #D63F72); color: #fff; }
.km-gate .pm-quiet { color: var(--km-ink2); font: 500 13px/1 var(--km-ui); }
.km-gate.is-opening { transform: scale(1.04) !important; }
.km-lip { position: relative; display: block; width: 100%; height: 100%; touch-action: none; cursor: grab; }
.km-lip:active { cursor: grabbing; }
.km-lipGlow { position: absolute; inset: 10%; border-radius: 50%; background: radial-gradient(circle, #fff 0 50%, #FFE9F0 51% 60%, transparent 61%), repeating-conic-gradient(#FFD1DF 0 9deg, #FFE3EC 9deg 18deg);
  box-shadow: 0 0 0 5px #fff, 0 18px 40px -18px rgba(214,63,114,.55); }
.km-lipStick { position: absolute; left: 50%; bottom: 9%; width: 32%; height: 80%; transform: translateX(-35%) rotate(10deg); display: block; filter: drop-shadow(0 16px 18px rgba(214,63,114,.35)); }
.km-lipBullet { position: absolute; left: 14%; right: 14%; bottom: 46%; height: 38%; border-radius: 50% 50% 12% 12% / 70% 30% 12% 12%;
  background: linear-gradient(90deg, var(--shade) 0%, var(--shade-hi) 38%, var(--shade) 70%, color-mix(in srgb, var(--shade) 75%, #000) 100%);
  clip-path: polygon(0 28%, 100% 0, 100% 100%, 0 100%); transform: translateY(calc((1 - var(--rise)) * 92%)); transition: transform .12s linear; box-shadow: inset 0 -6px 10px rgba(0,0,0,.08); }
.km-lip.is-ready .km-lipBullet, .km-gate.is-opening .km-lipBullet { transform: none; transition: transform .45s var(--km-spring); }
.km-lipCollar { position: absolute; left: 6%; right: 6%; bottom: 40%; height: 9%; border-radius: 6px 6px 3px 3px; z-index: 1;
  background: linear-gradient(90deg, #FFD1DF, #fff 35%, #FFC1D3 70%, #F7A9C1); box-shadow: inset 0 -2px 0 rgba(214,63,114,.25); }
.km-lipBase { position: absolute; left: 0; right: 0; bottom: 0; height: 42%; border-radius: 10px 10px 18px 18px; overflow: hidden; z-index: 1; display: grid; place-items: center;
  background: linear-gradient(90deg, #F2558A, #FF8FB5 35%, #FF6F9C 65%, #D63F72); box-shadow: 0 14px 26px -12px rgba(160,30,80,.6), inset 0 3px 0 rgba(255,255,255,.35); }
.km-lipStripes { position: absolute; inset: 0; background: repeating-linear-gradient(90deg, rgba(255,255,255,.18) 0 6px, transparent 6px 14px); background-position: var(--spin) 0; }
.km-lipPrint { position: absolute; right: -2%; top: 18%; transform: rotate(14deg); opacity: calc(.2 + var(--rise) * .8); transition: opacity .2s; }
.km-lipSpark { position: absolute; width: 22px; height: 22px; animation: km-twinkle 2.2s ease-in-out infinite; }
.km-lipSpark.is-a { left: 18%; top: 14%; } .km-lipSpark.is-b { right: 14%; bottom: 26%; width: 16px; height: 16px; animation-delay: -1s; }
.km-lipGif { position: absolute !important; left: -2%; top: 0; }
.km-lipHint { position: absolute; left: 0; right: 0; margin: 0 auto; width: max-content; bottom: -6px; white-space: nowrap; font: 600 14px/1 var(--km-hand); color: var(--km-deep);
  padding: 6px 12px; border-radius: 99px; background: #fff; box-shadow: 0 6px 16px -8px rgba(214,63,114,.5); }
.km-lip.is-ready .km-lipHint { animation: km-beat 1.2s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .km-lipSpark, .km-lip.is-ready .km-lipHint, .km-gate.is-ready .pm-gateCta { animation: none; } }
`;
