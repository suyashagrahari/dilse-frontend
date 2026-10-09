"use client";

// The gate's art: the booth's coin plate in brushed chrome, "INSERT ONE
// KISS" engraved over a black slot, a kiss mark hovering above it and a
// tiny READY lamp. Pure CSS material; the lacquer curtain behind it is the
// gate's background (GATE_CSS).

import { LipPrint } from "./LipPrint";
import type { Booth } from "./model";

export function CoinPlate({ b }: { b: Booth }) {
  return (
    <span className="pb-plate">
      <span className="pb-plateKiss">
        <LipPrint color={b.S.hi} lipstick={b.lipstick} size={78} seed={4} />
      </span>
      <span className="pb-plateTx">4 poses · 1 kiss</span>
      <span className="pb-plateSlot" />
      <span className="pb-plateLed">
        <i /> Ready
      </span>
      <span className="pb-screw" style={{ left: 12, top: 12 }} />
      <span className="pb-screw" style={{ right: 12, top: 12 }} />
      <span className="pb-screw" style={{ left: 12, bottom: 12 }} />
      <span className="pb-screw" style={{ right: 12, bottom: 12 }} />
    </span>
  );
}

export const GATE_BG =
  "radial-gradient(70% 45% at 50% 0%, rgba(255,190,170,.28), transparent 70%)," +
  "repeating-linear-gradient(90deg, rgba(0,0,0,.42) 0px, rgba(0,0,0,.05) 18px, rgba(255,210,200,.10) 30px, rgba(0,0,0,.05) 42px, rgba(0,0,0,.42) 62px)," +
  "linear-gradient(180deg, #5a0710 0%, #a10f1b 36%, #7e0a15 74%, #3a0409 100%)";

export const GATE_CSS = `
.pb-gate::before { content: ""; position: absolute; inset: 0; z-index: 1; pointer-events: none;
  background: radial-gradient(80% 60% at 50% 46%, transparent 40%, rgba(10,2,4,.72) 100%), linear-gradient(180deg, rgba(0,0,0,.55), transparent 16%, transparent 80%, rgba(0,0,0,.6)); }
.pb-gate::after { content: ""; position: absolute; left: 0; right: 0; top: 0; height: 9vh; z-index: 1; pointer-events: none;
  background: repeating-linear-gradient(90deg, #3a0409 0 30px, #5a0710 30px 60px); box-shadow: 0 10px 24px rgba(0,0,0,.6); opacity: .0; }
.pb-gate .pm-gateIn { gap: 16px; }
.pb-gate .pm-gateKick { font: 700 11px/1.3 var(--pb-mono); letter-spacing: .34em; color: rgba(244,237,225,.75); opacity: 1; }
.pb-gate .pm-gateName { font-family: var(--pb-display) !important; font-weight: 400 !important; letter-spacing: -.02em; line-height: .95 !important; font-size: clamp(64px, 19vw, 132px) !important; }
.pb-gate .pm-gateSub { font: 400 clamp(20px, 5.4vw, 28px)/1.2 var(--pb-display); opacity: .92; max-width: 18ch; text-wrap: balance; }
.pb-gate .pm-gateArt { width: min(250px, 66vw); aspect-ratio: 25 / 17; max-height: 30vh; margin-top: 8px; }
.pb-gate .pm-gateCta { color: #fff3f0; font: 700 13px/1 var(--pb-mono); letter-spacing: .26em; text-transform: uppercase; min-height: 54px;
  background: linear-gradient(180deg, #ff6a74 0%, #c1121f 48%, #7d0a14 100%); box-shadow: 0 16px 34px -12px rgba(0,0,0,.9), inset 0 1px 0 rgba(255,255,255,.45), 0 0 0 1px rgba(0,0,0,.35); }
.pb-gate .pm-seal { background: rgba(0,0,0,.28); font: 400 11px/1.2 var(--pb-mono); letter-spacing: .12em; }
.pb-gate .pm-quiet { font: 400 11px/1 var(--pb-mono); letter-spacing: .12em; }
.pb-plate { position: relative; display: grid; justify-items: center; align-content: end; gap: 10px; width: 100%; height: 100%; box-sizing: border-box; padding: 0 0 22px; border-radius: 16px;
  background: linear-gradient(180deg, rgba(255,255,255,.55), rgba(255,255,255,0) 30%, rgba(0,0,0,.08) 70%, rgba(255,255,255,.25)),
    repeating-linear-gradient(90deg, rgba(255,255,255,.06) 0 1px, rgba(0,0,0,.04) 1px 3px),
    linear-gradient(115deg, #8d939b, #e9edf2 22%, #b4bac2 40%, #f6f8fa 56%, #9aa0a8 74%, #d7dbe0);
  box-shadow: 0 26px 50px -18px rgba(0,0,0,.85), inset 0 1px 0 rgba(255,255,255,.9), inset 0 -2px 0 rgba(0,0,0,.25), 0 0 0 1px rgba(0,0,0,.4); }
.pb-plateKiss { position: absolute; left: 50%; top: 4%; transform: translateX(-50%); animation: pb-kissBob 3.2s ease-in-out infinite; filter: drop-shadow(0 6px 8px rgba(80,0,10,.35)); }
.pb-plateKiss svg { mix-blend-mode: normal; }
@keyframes pb-kissBob { 0%, 100% { transform: translate(-50%, 0) rotate(-6deg); } 50% { transform: translate(-50%, 7px) rotate(-3deg); } }
.pb-plateTx { font: 700 10.5px/1 var(--pb-mono); letter-spacing: .3em; text-transform: uppercase; color: #4a4f57; text-shadow: 0 1px 0 rgba(255,255,255,.7), 0 -1px 0 rgba(0,0,0,.25); }
.pb-plateSlot { width: 62%; height: 12px; border-radius: 7px; background: #050304; box-shadow: inset 0 3px 5px rgba(0,0,0,.9), 0 1px 0 rgba(255,255,255,.8); }
.pb-plateLed { display: inline-flex; align-items: center; gap: 6px; font: 700 8.5px/1 var(--pb-mono); letter-spacing: .3em; text-transform: uppercase; color: #5a5f67; }
.pb-plateLed i { width: 6px; height: 6px; border-radius: 50%; background: #ff3b47; box-shadow: 0 0 8px #ff3b47, 0 0 2px #fff inset; animation: pb-blink 1.4s steps(2, jump-none) infinite; }
.pb-screw { position: absolute; width: 9px; height: 9px; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #fff, #8d939b 60%, #50555c);
  box-shadow: inset 0 0 0 .5px rgba(0,0,0,.4); }
.pb-screw::after { content: ""; position: absolute; left: 1px; right: 1px; top: 4px; height: 1px; background: rgba(0,0,0,.45); transform: rotate(35deg); }
@media (prefers-reduced-motion: reduce) { .pb-plateKiss, .pb-plateLed i { animation: none; } }
`;
