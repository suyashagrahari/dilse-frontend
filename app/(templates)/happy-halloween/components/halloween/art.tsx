"use client";

// Hand-drawn SVG art for the haunted house. Everything is round, soft and
// blushing — cute-spooky, never gory: no blood, no realistic skulls.

import type { CSSProperties } from "react";
import type { HalloweenCostume } from "../../../_valentine/days/happy-halloween";
import { HW } from "./ui";

/** A number is px; a string (e.g. "100%") makes the drawing fluid — it fills its box's width. */
type Size = number | string;
const dims = (size: Size, ratio: number) => (typeof size === "number" ? { width: size, height: size * ratio } : { width: size });

/** A round little ghost with blushing cheeks. `heart` = holding a heart. */
export function Ghost({ size = 90, heart, wave, style, mood = "happy" }: { size?: Size; heart?: boolean; wave?: boolean; style?: CSSProperties; mood?: "happy" | "boo" | "shy" }) {
  return (
    <svg viewBox="0 0 100 110" {...dims(size, 1.1)} style={{ display: "block", overflow: "visible", ...style }} aria-hidden>
      <defs>
        <radialGradient id="hw-ghost-g" cx="40%" cy="30%" r="80%">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#E4DCF7" />
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="104" rx="26" ry="4" fill="rgba(0,0,0,.25)" />
      <path d="M18 56 C18 26 32 10 50 10 C68 10 82 26 82 56 L82 92 C78 98 74 98 70 92 C66 86 62 86 58 92 C54 98 46 98 42 92 C38 86 34 86 30 92 C26 98 22 98 18 92 Z" fill="url(#hw-ghost-g)" stroke="#CFC2EE" strokeWidth="1.5" />
      {wave && <path d="M80 58 C90 52 94 44 92 38" stroke="#E4DCF7" strokeWidth="9" strokeLinecap="round" fill="none" />}
      {mood === "boo" ? (
        <>
          <ellipse cx="38" cy="46" rx="5" ry="6.5" fill="#2B1E3F" />
          <ellipse cx="62" cy="46" rx="5" ry="6.5" fill="#2B1E3F" />
          <ellipse cx="50" cy="64" rx="8" ry="10" fill="#2B1E3F" />
          <ellipse cx="50" cy="68" rx="4.5" ry="4" fill="#FF7FA8" />
        </>
      ) : mood === "shy" ? (
        <>
          <path d="M33 47 Q38 42 43 47" stroke="#2B1E3F" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M57 47 Q62 42 67 47" stroke="#2B1E3F" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M45 60 Q50 63 55 60" stroke="#2B1E3F" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <ellipse cx="38" cy="46" rx="4.5" ry="6" fill="#2B1E3F" />
          <ellipse cx="62" cy="46" rx="4.5" ry="6" fill="#2B1E3F" />
          <circle cx="39.5" cy="44" r="1.6" fill="#fff" />
          <circle cx="63.5" cy="44" r="1.6" fill="#fff" />
          <path d="M44 58 Q50 64 56 58" stroke="#2B1E3F" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        </>
      )}
      <ellipse cx="29" cy="56" rx="6" ry="3.6" fill="#FF9EC4" opacity=".75" />
      <ellipse cx="71" cy="56" rx="6" ry="3.6" fill="#FF9EC4" opacity=".75" />
      {heart && (
        <g transform="translate(50 82)">
          <path d="M0 10 C-14 0 -14 -12 -6 -12 C-2 -12 0 -9 0 -7 C0 -9 2 -12 6 -12 C14 -12 14 0 0 10 Z" fill="#FF6FA0" stroke="#D94C7E" strokeWidth="1.5" />
          <ellipse cx="-17" cy="-4" rx="6" ry="5" fill="#EEE8FA" />
          <ellipse cx="17" cy="-4" rx="6" ry="5" fill="#EEE8FA" />
        </g>
      )}
    </svg>
  );
}

/** A plump pumpkin; `face` draws a happy jack-o'-lantern lit from inside. */
export function Pumpkin({ size = 80, face, lit, style }: { size?: number; face?: boolean; lit?: boolean; style?: CSSProperties }) {
  const glow = lit ? "#FFE08A" : "#5A2508";
  return (
    <svg viewBox="0 0 100 90" width={size} height={size * 0.9} style={{ display: "block", overflow: "visible", ...style }} aria-hidden>
      <path d="M50 18 C46 10 48 4 54 2" stroke={HW.stem} strokeWidth="6" strokeLinecap="round" fill="none" />
      <ellipse cx="30" cy="52" rx="22" ry="32" fill="#E8742B" />
      <ellipse cx="70" cy="52" rx="22" ry="32" fill="#E8742B" />
      <ellipse cx="50" cy="52" rx="24" ry="34" fill="#FF8A3D" />
      <ellipse cx="42" cy="38" rx="6" ry="12" fill="#FFB067" opacity=".55" />
      {face && (
        <g fill={glow} style={lit ? { filter: "drop-shadow(0 0 4px #FFB347)" } : undefined}>
          <path d="M30 42 L40 32 L44 46 Z" />
          <path d="M70 42 L60 32 L56 46 Z" />
          <path d="M28 60 Q50 80 72 60 L66 62 L62 58 L56 64 L50 59 L44 64 L38 58 L34 62 Z" />
        </g>
      )}
    </svg>
  );
}

export function Bat({ size = 48, color = "#0E0A1C", style }: { size?: number; color?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 64 32" width={size} height={size / 2} style={{ display: "block", overflow: "visible", ...style }} aria-hidden>
      <path
        d="M32 9c-1.6-3-3.4-4.4-5.4-4.6 1 1.8 1 3.6.2 5C22.4 8.6 17 6 12.4 1.6c.8 4.8-1 8.6-5.4 10.8 4 .2 7 2 8.4 5 3-1.8 6.6-1.8 9.6.4 2 1.6 3 4.4 3.4 7.6 1-2.2 2.2-3.6 3.6-3.6s2.6 1.4 3.6 3.6c.4-3.2 1.4-6 3.4-7.6 3-2.2 6.6-2.2 9.6-.4 1.4-3 4.4-4.8 8.4-5-4.4-2.2-6.2-6-5.4-10.8C47 6 41.6 8.6 37.2 9.4c-.8-1.4-.8-3.2.2-5C35.4 4.6 33.6 6 32 9z"
        fill={color}
      />
      <circle cx="29.5" cy="12.5" r="1.1" fill="#FFD27A" />
      <circle cx="34.5" cy="12.5" r="1.1" fill="#FFD27A" />
    </svg>
  );
}

/** A corner cobweb (top-left; mirror with scaleX(-1)). */
export function Cobweb({ size = 90, style }: { size?: number; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ display: "block", ...style }} aria-hidden>
      <g stroke="rgba(247,243,255,.32)" strokeWidth="1" fill="none">
        <path d="M0 0 L100 30 M0 0 L80 70 M0 0 L30 100 M0 0 L60 95" />
        <path d="M22 7 Q20 18 15 26 Q10 21 6 24" />
        <path d="M44 13 Q40 32 30 46 Q19 42 12 47" />
        <path d="M66 20 Q60 46 46 66 Q31 62 19 70" />
        <path d="M88 26 Q80 60 62 86 Q43 84 25 94" />
      </g>
      <g transform="translate(58 58)">
        <line x1="0" y1="-30" x2="0" y2="-6" stroke="rgba(247,243,255,.35)" strokeWidth="1" />
        <circle r="5" fill="#2B1E3F" />
        <circle cx="-1.6" cy="-1" r="1" fill="#fff" />
        <circle cx="1.6" cy="-1" r="1" fill="#fff" />
      </g>
    </svg>
  );
}

// A big corner web, generated once (deterministic: no hydration mismatch).
// Spokes fan out from the top-left corner; each ring sags between spokes like
// real silk, slightly irregular; a few dew drops catch the moonlight.
const WEB_R = [18, 34, 52, 72, 94, 118, 144, 172];
const WEB = (() => {
  const spokes = [2, 13, 25, 37, 49, 61, 73, 85].map((d) => (d * Math.PI) / 180);
  const pt = (r: number, a: number) => [Math.cos(a) * r, Math.sin(a) * r] as const;
  const f = (n: number) => n.toFixed(1);
  const jit = (r: number, i: number, k: number) => r * (1 + 0.05 * Math.sin(i * 2.3 + k));
  const spoke = spokes
    .map((a) => {
      const [x, y] = pt(214, a);
      return `M0 0L${f(x)} ${f(y)}`;
    })
    .join("");
  const rings = WEB_R.map((r0, k) => {
    let d = "";
    spokes.forEach((a, i) => {
      if (i === spokes.length - 1) return;
      const r1 = jit(r0, i, k);
      const r2 = jit(r0, i + 1, k);
      const [x1, y1] = pt(r1, a);
      const [x2, y2] = pt(r2, spokes[i + 1]);
      const [cx, cy] = pt(((r1 + r2) / 2) * 0.86, (a + spokes[i + 1]) / 2);
      d += `${i === 0 ? `M${f(x1)} ${f(y1)}` : ""}Q${f(cx)} ${f(cy)} ${f(x2)} ${f(y2)}`;
    });
    return d;
  });
  const dew = [[3, 2], [5, 4], [6, 1], [4, 6], [2, 5], [7, 3], [5, 7], [3, 5]].map(([k, s]) => {
    const [x, y] = pt(jit(WEB_R[k], s, k), spokes[s]);
    return { x: f(x), y: f(y), r: k > 4 ? 1.6 : 1.2 };
  });
  return { spoke, rings, dew };
})();

/** A big, detailed corner cobweb (top-left; mirror with scaleX(-1)). */
export function BigWeb({ size = 220, style }: { size?: Size; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 200 200" {...dims(size, 1)} style={{ display: "block", overflow: "visible", ...style }} aria-hidden>
      <g fill="none" strokeLinecap="round">
        <path d={WEB.spoke} stroke="rgba(247,243,255,.42)" strokeWidth=".9" />
        {WEB.rings.map((d, k) => (
          <path key={k} d={d} stroke={`rgba(247,243,255,${(0.46 - k * 0.035).toFixed(2)})`} strokeWidth={k < 4 ? 0.8 : 0.7} />
        ))}
        {/* a torn strand hanging loose */}
        <path d="M150 64 Q156 92 146 118 Q140 132 148 146" stroke="rgba(247,243,255,.22)" strokeWidth=".7" />
      </g>
      {WEB.dew.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={p.r} fill="rgba(255,241,184,.75)" />
      ))}
    </svg>
  );
}

/** A cute little spider; its thread runs up out of the top (`thread` px in its own units). */
export function Spider({ size = 34, thread = 80, style }: { size?: number; thread?: number; style?: CSSProperties }) {
  return (
    <svg viewBox={`0 ${-thread} 40 ${thread + 44}`} width={size} height={(size * (thread + 44)) / 40} style={{ display: "block", overflow: "visible", ...style }} aria-hidden>
      <line x1="20" y1={-thread} x2="20" y2="8" stroke="rgba(247,243,255,.55)" strokeWidth=".9" />
      <g stroke="#0E0A1C" strokeWidth="2.4" fill="none" strokeLinecap="round">
        <path d="M14 18 Q4 12 2 4 M13 22 Q2 20 0 14 M13 26 Q2 28 1 36 M15 29 Q8 36 8 42" />
        <path d="M26 18 Q36 12 38 4 M27 22 Q38 20 40 14 M27 26 Q38 28 39 36 M25 29 Q32 36 32 42" />
      </g>
      <circle cx="20" cy="24" r="10" fill="#2B1E48" stroke="#0E0A1C" strokeWidth="1.5" />
      <circle cx="20" cy="12" r="6.5" fill="#3A2860" stroke="#0E0A1C" strokeWidth="1.5" />
      <circle cx="17.4" cy="11.5" r="2.3" fill="#fff" />
      <circle cx="22.6" cy="11.5" r="2.3" fill="#fff" />
      <circle cx="17.8" cy="12" r="1.1" fill="#17122B" />
      <circle cx="23" cy="12" r="1.1" fill="#17122B" />
      <circle cx="15.2" cy="15" r="1.3" fill="#FF9EC4" opacity=".7" />
      <circle cx="24.8" cy="15" r="1.3" fill="#FF9EC4" opacity=".7" />
      {/* a tiny heart on its back */}
      <path d="M20 29.5 C14.5 25.5 16 21 18.6 21.6 C19.4 21.8 20 22.6 20 22.6 C20 22.6 20.6 21.8 21.4 21.6 C24 21 25.5 25.5 20 29.5Z" fill="#FF9EC4" opacity=".9" />
    </svg>
  );
}

/** The cauldron, with a brew of `color` and bubbles. */
export function Cauldron({ color, size = 220, stirring = 0, style }: { color: string; size?: Size; stirring?: number; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 220 190" {...dims(size, 190 / 220)} style={{ display: "block", overflow: "visible", ...style }} aria-hidden>
      <defs>
        <radialGradient id="hw-brew" cx="50%" cy="40%" r="60%">
          <stop offset="0" stopColor="#ffffff" stopOpacity=".55" />
          <stop offset=".35" stopColor={color} stopOpacity="1" />
          <stop offset="1" stopColor={color} stopOpacity="1" />
        </radialGradient>
        <linearGradient id="hw-pot" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#120C22" />
          <stop offset=".45" stopColor="#3A3054" />
          <stop offset="1" stopColor="#120C22" />
        </linearGradient>
      </defs>
      <ellipse cx="110" cy="178" rx="80" ry="10" fill="rgba(0,0,0,.35)" />
      {/* fire */}
      <g className="hw-fire">
        <path d="M80 176 Q86 150 96 170 Q102 140 112 168 Q120 146 128 170 Q136 152 142 176 Z" fill="#FF8A3D" />
        <path d="M92 176 Q98 160 104 172 Q110 154 116 172 Q122 160 128 176 Z" fill="#FFD27A" />
      </g>
      {/* ladle */}
      <g style={{ transformOrigin: "110px 70px", transform: `rotate(${stirring * 720}deg)`, transition: stirring === 0 ? "transform .4s" : undefined }}>
        <rect x="128" y="10" width="8" height="74" rx="4" fill="#8A5A2B" transform="rotate(18 132 47)" />
      </g>
      <path d="M28 72 Q28 168 110 168 Q192 168 192 72 Z" fill="url(#hw-pot)" />
      <ellipse cx="110" cy="72" rx="86" ry="20" fill="#1B1330" />
      <ellipse cx="110" cy="72" rx="78" ry="15" fill="url(#hw-brew)" style={{ transition: "fill 1s" }} />
      <g fill="#fff" opacity=".55">
        <circle className="hw-bub hw-bub1" cx="80" cy="70" r="5" />
        <circle className="hw-bub hw-bub2" cx="120" cy="68" r="7" />
        <circle className="hw-bub hw-bub3" cx="150" cy="72" r="4" />
      </g>
      <ellipse cx="110" cy="72" rx="86" ry="20" fill="none" stroke="#4A3F66" strokeWidth="6" />
      <rect x="20" y="66" width="14" height="10" rx="4" fill="#2A2240" />
      <rect x="186" y="66" width="14" height="10" rx="4" fill="#2A2240" />
    </svg>
  );
}

/** A little potion bottle. */
export function Bottle({ color, size = 64, shape = 0 }: { color: string; size?: number; shape?: number }) {
  const body =
    shape % 3 === 0
      ? "M22 24 L22 30 C10 36 6 48 8 60 C10 74 22 80 32 80 C42 80 54 74 56 60 C58 48 54 36 42 30 L42 24 Z"
      : shape % 3 === 1
        ? "M22 24 L22 40 L12 74 C11 78 14 80 18 80 L46 80 C50 80 53 78 52 74 L42 40 L42 24 Z"
        : "M20 24 L20 34 C14 36 12 40 12 46 L12 72 C12 77 16 80 21 80 L43 80 C48 80 52 77 52 72 L52 46 C52 40 50 36 44 34 L44 24 Z";
  return (
    <svg viewBox="0 0 64 84" width={size} height={size * (84 / 64)} style={{ display: "block", overflow: "visible" }} aria-hidden>
      <path d={body} fill={color} stroke="rgba(255,255,255,.7)" strokeWidth="2.5" />
      <path d={body} fill="rgba(255,255,255,.18)" style={{ clipPath: "inset(0 0 55% 0)" }} />
      <ellipse cx="22" cy="54" rx="4" ry="9" fill="rgba(255,255,255,.45)" />
      <rect x="18" y="12" width="28" height="14" rx="4" fill="#8A5A2B" />
      <rect x="16" y="22" width="32" height="5" rx="2.5" fill="rgba(255,255,255,.6)" />
    </svg>
  );
}

/** The trick-or-treat pail: a pumpkin bucket with a handle. `fill` 0–1. */
export function CandyBucket({ size = 150, fill = 0 }: { size?: Size; fill?: number }) {
  const candies = Math.round(fill * 7);
  const spots: [number, number, string][] = [
    [62, 48, "#FF9EC4"], [88, 44, "#9BE7C4"], [112, 50, "#FFD27A"], [74, 36, "#B79CFF"], [100, 34, "#FF6FA0"], [124, 40, "#9BE7C4"], [86, 26, "#FFD27A"],
  ];
  return (
    <svg viewBox="0 0 180 160" {...dims(size, 160 / 180)} style={{ display: "block", overflow: "visible" }} aria-hidden>
      <path d="M38 58 Q90 -18 142 58" stroke="#3A2257" strokeWidth="6" fill="none" strokeLinecap="round" />
      {spots.slice(0, candies).map(([x, y, c], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${i * 37})`}>
          <rect x="-9" y="-6" width="18" height="12" rx="6" fill={c} />
          <path d="M-9 0 L-16 -6 L-16 6 Z M9 0 L16 -6 L16 6 Z" fill={c} opacity=".85" />
        </g>
      ))}
      <ellipse cx="54" cy="104" rx="36" ry="50" fill="#E8742B" />
      <ellipse cx="126" cy="104" rx="36" ry="50" fill="#E8742B" />
      <ellipse cx="90" cy="104" rx="42" ry="54" fill="#FF8A3D" />
      <ellipse cx="90" cy="56" rx="64" ry="12" fill="#B84E14" />
      <ellipse cx="90" cy="56" rx="58" ry="8" fill="#5A2508" />
      <g fill="#3A1A08">
        <path d="M58 88 L72 74 L76 94 Z" />
        <path d="M122 88 L108 74 L104 94 Z" />
        <path d="M58 118 Q90 142 122 118 L112 120 L104 114 L96 122 L90 116 L84 122 L76 114 L68 120 Z" />
      </g>
      <ellipse cx="70" cy="80" rx="8" ry="16" fill="#FFB067" opacity=".45" />
    </svg>
  );
}

/** Moon that turns into a heart after YES. */
export function MoonHeart({ heart, size = 92 }: { heart: boolean; size?: number }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ display: "block", overflow: "visible" }} aria-hidden>
      <defs>
        <radialGradient id="hw-moon" cx="40%" cy="38%" r="70%">
          <stop offset="0" stopColor="#FFF8DD" />
          <stop offset="1" stopColor="#F2DFA2" />
        </radialGradient>
        <radialGradient id="hw-heartmoon" cx="40%" cy="35%" r="75%">
          <stop offset="0" stopColor="#FFD6E4" />
          <stop offset="1" stopColor="#FF8FB4" />
        </radialGradient>
      </defs>
      <g style={{ opacity: heart ? 0 : 1, transform: heart ? "scale(.6)" : "scale(1)", transformOrigin: "50px 50px", transition: "opacity 1.2s ease, transform 1.2s cubic-bezier(.3,.7,.2,1)" }}>
        <circle cx="50" cy="50" r="40" fill="url(#hw-moon)" />
        <circle cx="36" cy="40" r="7" fill="#E9D38E" opacity=".7" />
        <circle cx="60" cy="62" r="10" fill="#E9D38E" opacity=".6" />
        <circle cx="62" cy="32" r="4" fill="#E9D38E" opacity=".6" />
      </g>
      <g style={{ opacity: heart ? 1 : 0, transform: heart ? "scale(1)" : "scale(.5)", transformOrigin: "50px 54px", transition: "opacity 1.2s ease .2s, transform 1.4s cubic-bezier(.34,1.56,.64,1) .2s" }}>
        <path d="M50 88 C14 64 8 40 22 26 C34 14 48 20 50 32 C52 20 66 14 78 26 C92 40 86 64 50 88 Z" fill="url(#hw-heartmoon)" />
        <ellipse cx="34" cy="36" rx="7" ry="10" fill="#fff" opacity=".35" transform="rotate(-30 34 36)" />
      </g>
    </svg>
  );
}

/**
 * Costume dressing around a portrait frame (the Boo License photo). The SVG is
 * laid over the frame with overflow visible, so hats and ears poke out above.
 * viewBox matches a 4:5 frame (100 × 125).
 */
export function CostumeFrame({ costume }: { costume: HalloweenCostume }) {
  const common: CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible", pointerEvents: "none" };
  return (
    <svg viewBox="0 0 100 125" preserveAspectRatio="none" style={common} aria-hidden>
      {costume === "witch" && (
        <g transform="translate(50 -4)">
          <ellipse cx="0" cy="6" rx="34" ry="7" fill="#3A2257" />
          <path d="M-18 6 L4 -40 Q8 -46 14 -40 L8 -36 L18 6 Z" fill="#4B2D73" />
          <rect x="-18" y="-2" width="36" height="7" fill="#FF8A3D" />
          <rect x="-4" y="-3" width="8" height="9" rx="1.5" fill="#FFD27A" />
        </g>
      )}
      {costume === "black-cat" && (
        <g fill="#1B1330">
          <path d="M14 4 L24 -18 L36 4 Z" />
          <path d="M64 4 L76 -18 L86 4 Z" />
          <path d="M19 2 L24 -10 L30 2 Z" fill="#FF9EC4" />
          <path d="M70 2 L76 -10 L81 2 Z" fill="#FF9EC4" />
        </g>
      )}
      {costume === "vampire" && (
        <g>
          <path d="M-6 125 L-6 86 Q14 100 22 125 Z" fill="#7A1030" />
          <path d="M106 125 L106 86 Q86 100 78 125 Z" fill="#7A1030" />
          <path d="M-6 86 Q14 100 22 125" stroke="#2B0A14" strokeWidth="2" fill="none" />
          <path d="M106 86 Q86 100 78 125" stroke="#2B0A14" strokeWidth="2" fill="none" />
          <g transform="translate(82 6)"><Bat size={26} color="#1B1330" /></g>
        </g>
      )}
      {costume === "pumpkin" && (
        <g>
          <path d="M-4 20 Q10 -2 30 -4 Q44 -6 52 2" stroke={HW.stem} strokeWidth="3" fill="none" strokeLinecap="round" />
          <ellipse cx="34" cy="-4" rx="8" ry="4" fill="#5FA978" transform="rotate(-20 34 -4)" />
          <g transform="translate(-10 104)"><Pumpkin size={26} /></g>
          <g transform="translate(86 108)"><Pumpkin size={22} /></g>
        </g>
      )}
      {costume === "skeleton" && (
        <g fill="#F7F3FF" stroke="#CFC6E8" strokeWidth="1">
          {[[-4, -4, 45], [104, -4, 135], [-4, 129, -45], [104, 129, -135]].map(([x, y, r], i) => (
            <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
              <rect x="0" y="-2.5" width="22" height="5" rx="2.5" />
              <circle cx="22" cy="-3" r="3.5" />
              <circle cx="22" cy="3" r="3.5" />
            </g>
          ))}
        </g>
      )}
      {costume === "mummy" && (
        <g fill="#F4ECDC" stroke="#D8CCB4" strokeWidth=".8" opacity=".95">
          <rect x="-8" y="8" width="40" height="7" transform="rotate(-38 -8 8)" />
          <rect x="-8" y="20" width="34" height="6" transform="rotate(-38 -8 20)" />
          <rect x="72" y="112" width="40" height="7" transform="rotate(-38 72 112)" />
          <rect x="80" y="124" width="30" height="6" transform="rotate(-38 80 124)" />
        </g>
      )}
      {costume === "bat" && (
        <g fill="#1B1330">
          <path d="M0 40 C-10 30 -22 32 -26 40 C-20 42 -18 48 -20 54 C-14 50 -8 52 -4 58 C-4 50 -2 46 0 44 Z" />
          <path d="M100 40 C110 30 122 32 126 40 C120 42 118 48 120 54 C114 50 108 52 104 58 C104 50 102 46 100 44 Z" />
        </g>
      )}
      {costume === "ghost" && (
        <g transform="translate(78 -14)">
          <path d="M0 22 C0 8 6 0 14 0 C22 0 28 8 28 22 L28 34 C26 37 24 37 22 34 C20 31 18 31 16 34 C14 37 12 37 10 34 C8 31 6 31 4 34 C2 37 0 37 0 34 Z" fill="#F7F3FF" stroke="#CFC2EE" />
          <ellipse cx="10" cy="16" rx="1.8" ry="2.4" fill="#2B1E3F" />
          <ellipse cx="18" cy="16" rx="1.8" ry="2.4" fill="#2B1E3F" />
          <ellipse cx="7" cy="21" rx="2.2" ry="1.3" fill="#FF9EC4" />
          <ellipse cx="21" cy="21" rx="2.2" ry="1.3" fill="#FF9EC4" />
        </g>
      )}
    </svg>
  );
}
