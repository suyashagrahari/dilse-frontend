"use client";

// The glasshouse itself (fixed, behind every scene): dusk light through glass, a wrought-iron gothic frame, god-rays,
// hanging ferns and potted palms. `dolly` (0–1) is the camera: 1 = pressed up against the door glass, 0 = inside.

import type { CSSProperties } from "react";

const FERN = "M0 0 C10 40 8 90 -6 150 M-6 150 C-30 140 -46 120 -52 96 M-2 120 C-26 112 -40 96 -44 76 M2 90 C-20 84 -32 68 -36 50 M4 60 C-14 56 -24 42 -26 26 M-6 150 C14 146 30 132 38 112 M-2 120 C18 116 32 102 36 84 M2 90 C20 86 30 72 32 56 M4 60 C18 56 26 46 26 32";

export function Glasshouse({ dolly, night, style }: { dolly: number; night: number; style?: CSSProperties }) {
  return (
    <div className="gh-world" style={{ ["--dolly" as string]: dolly, ["--night" as string]: night, ...style }} aria-hidden>
      <div className="gh-sky" />
      <div className="gh-sun" />
      <div className="gh-inner">
        <svg className="gh-iron" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
          <g fill="none" stroke="#141A18" strokeLinecap="round">
            <path d="M120 1000 L120 380 Q120 120 500 40 Q880 120 880 380 L880 1000" strokeWidth="16" />
            <path d="M250 1000 L250 420 Q250 200 500 120 Q750 200 750 420 L750 1000" strokeWidth="9" />
            <path d="M500 40 L500 1000" strokeWidth="9" />
            <path d="M370 1000 L370 300 M630 1000 L630 300" strokeWidth="6" />
            <path d="M120 520 L880 520 M120 700 L880 700 M120 860 L880 860" strokeWidth="6" />
            <path d="M160 300 Q500 170 840 300 M200 210 Q500 90 800 210" strokeWidth="5" />
            <path d="M0 1000 L0 0 M1000 1000 L1000 0" strokeWidth="60" />
          </g>
          <g fill="none" stroke="rgba(244,194,122,.28)" strokeWidth="1.6">
            <path d="M128 1000 L128 380 Q128 128 500 48 Q872 128 872 380 L872 1000" />
            <path d="M256 1000 L256 420 Q256 206 500 126 Q744 206 744 420 L744 1000" />
          </g>
          <g fill="#141A18">
            {[250, 370, 500, 630, 750].map((x) => <circle key={x} cx={x} cy={520} r="9" />)}
          </g>
        </svg>
        <span className="gh-ray is-a" />
        <span className="gh-ray is-b" />
        <span className="gh-ray is-c" />
        <svg className="gh-fern is-l" viewBox="-70 -10 120 180"><path d={FERN} stroke="#22392B" strokeWidth="5" fill="none" strokeLinecap="round" /></svg>
        <svg className="gh-fern is-r" viewBox="-70 -10 120 180"><path d={FERN} stroke="#22392B" strokeWidth="5" fill="none" strokeLinecap="round" /></svg>
        <div className="gh-palm is-l" />
        <div className="gh-palm is-r" />
      </div>
      <div className="gh-dusk" />
    </div>
  );
}
