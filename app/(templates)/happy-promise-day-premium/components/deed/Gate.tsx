"use client";

// The gate's art: a heavy cream envelope seen from the back, its flap held
// down by a wax seal with their initials, lying under the desk lamp. Pure
// CSS paper + the wax material; the walnut desk is the gate's background.

import type { CSSProperties } from "react";
import { WaxSeal } from "./art";
import type { Deed } from "./model";

export function Envelope({ d, style, className, sealed = true }: { d: Deed; style?: CSSProperties; className?: string; sealed?: boolean }) {
  return (
    <span className={`sp-env${className ? ` ${className}` : ""}`} style={style}>
      <span className="sp-envFlap" />
      {sealed && (
        <span className="sp-envSeal">
          <WaxSeal W={d.W} mono={d.monogram} size="100%" />
        </span>
      )}
      <span className="sp-envTag">
        By hand
        <br />
        For {d.recipient} only
      </span>
    </span>
  );
}

export const GATE_BG =
  "radial-gradient(60% 42% at 50% 52%, rgba(255,196,120,.26), transparent 72%)," +
  "radial-gradient(90% 60% at 22% 0%, rgba(255,214,150,.18), transparent 60%)," +
  "repeating-linear-gradient(87deg, rgba(0,0,0,.0) 0 22px, rgba(0,0,0,.12) 22px 23px, rgba(255,220,180,.025) 23px 60px)," +
  "linear-gradient(180deg, #2a1a11 0%, #1a100a 55%, #0b0604 100%)";

export const GATE_CSS = `
.sp-gate .pm-gateIn { gap: 14px; }
.sp-gate .pm-gateKick { font: 700 11px/1.3 var(--sp-type); letter-spacing: .32em; color: rgba(245,239,226,.72); opacity: 1; }
.sp-gate .pm-gateName { font-family: var(--sp-serif) !important; font-style: italic; font-weight: 400 !important; letter-spacing: -.01em; line-height: .95 !important; font-size: clamp(60px, 18vw, 128px) !important; }
.sp-gate .pm-gateSub { font: italic 400 clamp(18px, 5vw, 24px)/1.25 var(--sp-serif); opacity: .9; max-width: 22ch; text-wrap: balance; }
.sp-gate .pm-gateArt { width: min(300px, 74vw); aspect-ratio: 3 / 2; max-height: 32vh; margin: 10px 0 6px; animation: sp-envBreathe 5s ease-in-out infinite; }
.sp-gate .pm-gateArt .sp-env { transform: rotate(-3deg); }
@keyframes sp-envBreathe { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
.sp-gate .pm-gateCta { color: #fbeee0; font: 700 13px/1 var(--sp-type); letter-spacing: .24em; text-transform: uppercase; min-height: 54px;
  background: linear-gradient(180deg, #a3283c 0%, #6e1423 52%, #3a0710 100%); box-shadow: 0 16px 34px -12px rgba(0,0,0,.9), inset 0 1px 0 rgba(255,255,255,.28), 0 0 0 1px rgba(0,0,0,.35); }
.sp-gate .pm-seal { background: rgba(0,0,0,.26); font: 400 11px/1.2 var(--sp-type); letter-spacing: .12em; }
.sp-gate .pm-quiet { font: 400 11px/1 var(--sp-type); letter-spacing: .12em; }
.sp-gate.is-opening .sp-envSeal { animation: sp-sealPop .5s cubic-bezier(.3,1.4,.5,1) forwards; }
.sp-gate.is-opening .sp-envFlap { animation: sp-flapUp .8s cubic-bezier(.65,0,.35,1) .15s forwards; }
@keyframes sp-sealPop { to { transform: translate(-50%, -50%) scale(1.15) rotate(8deg); opacity: 0; } }
@keyframes sp-flapUp { to { transform: rotateX(160deg); } }
@media (prefers-reduced-motion: reduce) { .sp-gate .pm-gateArt { animation: none; } }
`;
