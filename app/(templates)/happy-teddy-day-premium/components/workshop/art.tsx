"use client";

// ─── Made With a Heart — the teddy, the parcel and the two worlds (SVG + CSS) ─

import type { CSSProperties, ReactNode } from "react";
import type { TeddyAccessory, TeddyEyes, TeddyFur } from "../../../_valentine/days/happy-teddy-day-premium";

export const FUR: Record<TeddyFur, { a: string; b: string; line: string; pad: string }> = {
  honey: { a: "#D9A066", b: "#F2CC94", line: "#9A6634", pad: "#F7DDB5" },
  cocoa: { a: "#8B5A3C", b: "#B98563", line: "#5B3622", pad: "#D7AE8E" },
  pink: { a: "#F2A7BF", b: "#FBD3E0", line: "#C46B8B", pad: "#FFE4EC" },
  white: { a: "#F1ECE4", b: "#FFFFFF", line: "#B7AC9C", pad: "#FFF6EA" },
  lilac: { a: "#C3A6E0", b: "#E3D3F3", line: "#8A6BAE", pad: "#F1E8FA" },
  mint: { a: "#A8D8C0", b: "#D4EFE2", line: "#5F9A80", pad: "#E9F7F0" },
};

export const HEART_D = "M50 90 C 22 72, 4 54, 7 31 C 10 11, 38 6, 50 26 C 62 6, 90 11, 93 31 C 96 54, 78 72, 50 90 Z";

export interface TeddyProps {
  fur: TeddyFur;
  eyes: TeddyEyes;
  accessory: TeddyAccessory;
  initial?: string;
  /** 0 = a flat, empty skin; 1 = perfectly stuffed; up to 1.3 = chubby. */
  fluff?: number;
  awake?: boolean;
  /** Chest glow (a heart inside). */
  glow?: boolean;
  /** Show the open seam with n of 5 stitches closed (null = no seam). */
  stitches?: number | null;
  /** Holding a torch (the letter scene). */
  torch?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Extra SVG children drawn on top (in teddy coordinates). */
  children?: ReactNode;
}

export const STITCH_Y = [156, 166, 176, 186, 196];

export function Teddy({ fur, eyes, accessory, initial, fluff = 1, awake = true, glow, stitches = null, torch, className, style, children }: TeddyProps) {
  const c = FUR[fur] ?? FUR.honey;
  const f = Math.max(0, Math.min(1.3, fluff));
  const sx = 0.8 + 0.2 * Math.min(1, f) + Math.max(0, f - 1) * 0.5;
  const sy = 0.56 + 0.44 * Math.min(1, f);
  const shade = 0.25 + 0.75 * Math.min(1, f);
  const eye = (cx: number) => {
    if (!awake) return <path key={cx} d={`M${cx - 8} 80 Q${cx} 86 ${cx + 8} 80`} stroke="#2a1a14" strokeWidth="3" fill="none" strokeLinecap="round" />;
    if (eyes === "sleepy") return <path key={cx} d={`M${cx - 8} 79 Q${cx} 85 ${cx + 8} 79`} stroke="#2a1a14" strokeWidth="3.4" fill="none" strokeLinecap="round" />;
    if (eyes === "heart")
      return (
        <path key={cx} transform={`translate(${cx - 9} ${70}) scale(.18)`} d={HEART_D} fill="#C2185B" stroke="#2a1a14" strokeWidth="6" />
      );
    return (
      <g key={cx} className="td-eye">
        <circle cx={cx} cy={78} r={eyes === "button" ? 7.5 : 8.5} fill="#1d1210" />
        {eyes === "button" ? (
          <>
            <circle cx={cx - 2} cy={76} r="1.4" fill="#fff" opacity=".8" />
            <circle cx={cx + 2} cy={80} r="1.4" fill="#fff" opacity=".5" />
          </>
        ) : (
          <>
            <circle cx={cx + 2.5} cy={75} r="3" fill="#fff" />
            <circle cx={cx - 2.5} cy={81} r="1.4" fill="#fff" opacity=".8" />
          </>
        )}
        <path className="td-glint" d={`M${cx + 6} 66 l1.5 4 4 1.5 -4 1.5 -1.5 4 -1.5 -4 -4 -1.5 4 -1.5z`} fill="#fff" />
      </g>
    );
  };
  return (
    <svg viewBox="0 0 200 250" className={`td-teddy${awake ? " is-awake" : ""}${className ? ` ${className}` : ""}`} style={style} aria-hidden>
      <defs>
        <radialGradient id={`td-fur-${fur}`} cx=".4" cy=".35" r=".75">
          <stop offset="0" stopColor={c.b} />
          <stop offset="1" stopColor={c.a} />
        </radialGradient>
        <radialGradient id="td-glow" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#ffb3c8" stopOpacity=".95" />
          <stop offset=".5" stopColor="#ff6f98" stopOpacity=".45" />
          <stop offset="1" stopColor="#ff6f98" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="242" rx={60 * sx} ry="6" fill="rgba(0,0,0,.25)" />
      <g transform={`translate(100 240) scale(${sx.toFixed(3)} ${sy.toFixed(3)}) translate(-100 -240)`} style={{ transition: "transform .35s cubic-bezier(.3,1.6,.5,1)" }}>
        <g className="td-body">
          {/* feet */}
          <ellipse cx="70" cy="226" rx="24" ry="15" fill={`url(#td-fur-${fur})`} stroke={c.line} strokeWidth="2" />
          <ellipse cx="130" cy="226" rx="24" ry="15" fill={`url(#td-fur-${fur})`} stroke={c.line} strokeWidth="2" />
          <ellipse cx="70" cy="228" rx="13" ry="8" fill={c.pad} />
          <ellipse cx="130" cy="228" rx="13" ry="8" fill={c.pad} />
          {initial && (
            <text x="70" y="232" textAnchor="middle" className="td-pawInit" fill={c.line}>
              {initial}
            </text>
          )}
          {/* body */}
          <ellipse cx="100" cy="168" rx="56" ry="58" fill={`url(#td-fur-${fur})`} stroke={c.line} strokeWidth="2" />
          {accessory === "sweater" && <path d="M48 150 Q100 118 152 150 L156 196 Q100 222 44 196 Z" fill="#C2185B" opacity=".92" />}
          {accessory === "sweater" && <path transform="translate(88 156) scale(.24)" d={HEART_D} fill="#FFE6A6" />}
          <ellipse cx="100" cy="176" rx="32" ry="34" fill={c.b} opacity={accessory === "sweater" ? 0 : 0.85} />
          {glow && <ellipse className="td-chestGlow" cx="100" cy="174" rx="40" ry="36" fill="url(#td-glow)" />}
          {stitches !== null && (
            <g className="td-seam">
              <path d="M100 150 L100 202" stroke="#7a3b4b" strokeWidth="2" strokeDasharray="3 4" />
              {STITCH_Y.map((y, i) => (
                <path key={i} className={`td-stitch${i < (stitches ?? 0) ? " is-on" : ""}`} d={`M94 ${y - 3} L106 ${y + 3}`} stroke="#C2185B" strokeWidth="2.6" strokeLinecap="round" />
              ))}
            </g>
          )}
          {/* arms */}
          <ellipse cx="50" cy="160" rx="16" ry="30" transform="rotate(22 50 160)" fill={`url(#td-fur-${fur})`} stroke={c.line} strokeWidth="2" />
          <g className="td-armR">
            <ellipse cx="150" cy="160" rx="16" ry="30" transform="rotate(-22 150 160)" fill={`url(#td-fur-${fur})`} stroke={c.line} strokeWidth="2" />
            {torch && (
              <g transform="translate(152 168) rotate(-30)">
                <rect x="-6" y="-26" width="12" height="30" rx="4" fill="#4b5563" />
                <rect x="-8" y="-32" width="16" height="9" rx="3" fill="#9ca3af" />
                <circle cx="0" cy="-31" r="5" fill="#FFF3C4" />
              </g>
            )}
          </g>
        </g>
        <g className="td-head">
          <circle cx="56" cy="50" r="22" fill={`url(#td-fur-${fur})`} stroke={c.line} strokeWidth="2" />
          <circle cx="144" cy="50" r="22" fill={`url(#td-fur-${fur})`} stroke={c.line} strokeWidth="2" />
          <circle cx="56" cy="52" r="12" fill={c.pad} />
          <circle cx="144" cy="52" r="12" fill={c.pad} />
          <ellipse cx="100" cy="84" rx="58" ry="52" fill={`url(#td-fur-${fur})`} stroke={c.line} strokeWidth="2" />
          <ellipse cx="100" cy="102" rx="25" ry="19" fill={c.pad} />
          <ellipse cx="100" cy="94" rx="8.5" ry="6" fill="#2a1a14" />
          <path d={awake ? "M92 106 Q100 114 108 106" : "M93 108 Q100 110 107 108"} stroke="#2a1a14" strokeWidth="2.6" fill="none" strokeLinecap="round" />
          <ellipse cx="70" cy="98" rx="9" ry="5" fill="#ff8fab" opacity={0.25 + 0.35 * shade} />
          <ellipse cx="130" cy="98" rx="9" ry="5" fill="#ff8fab" opacity={0.25 + 0.35 * shade} />
          <g className="td-eyes">{[78, 122].map(eye)}</g>
          {accessory === "glasses" && (
            <g fill="none" stroke="#2a1a14" strokeWidth="3">
              <circle cx="78" cy="78" r="14" />
              <circle cx="122" cy="78" r="14" />
              <path d="M92 78 L108 78" />
            </g>
          )}
          {accessory === "bow" && (
            <g transform="translate(140 30) rotate(18)">
              <path d="M0 0 L-20 -12 L-20 12 Z" fill="#E0457B" />
              <path d="M0 0 L20 -12 L20 12 Z" fill="#E0457B" />
              <circle r="6" fill="#B0204F" />
            </g>
          )}
          {accessory === "flower" && (
            <g transform="translate(58 30)">
              {[0, 72, 144, 216, 288].map((a) => (
                <ellipse key={a} cx="0" cy="-9" rx="6" ry="9" fill="#FFF6D6" transform={`rotate(${a})`} />
              ))}
              <circle r="5.5" fill="#F6C344" />
            </g>
          )}
        </g>
        {accessory === "scarf" && (
          <g>
            <path d="M52 124 Q100 146 148 124 L150 138 Q100 160 50 138 Z" fill="#C2185B" />
            <path d="M120 136 L132 176 L118 178 L110 140 Z" fill="#A11545" />
            <path d="M56 128 Q100 148 144 128" stroke="#FFE6A6" strokeWidth="2" strokeDasharray="4 4" fill="none" />
          </g>
        )}
        {accessory === "bowtie" && (
          <g transform="translate(100 134)">
            <path d="M0 0 L-18 -10 L-18 10 Z" fill="#2C3160" />
            <path d="M0 0 L18 -10 L18 10 Z" fill="#2C3160" />
            <circle r="5" fill="#E6B85C" />
          </g>
        )}
        {children}
      </g>
    </svg>
  );
}

// ─── The parcel (gate art) ──────────────────────────────────────────────────

export function Parcel({ name }: { name: string }) {
  return (
    <div className="td-parcel">
      <div className="td-flap td-flapL" />
      <div className="td-flap td-flapR" />
      <div className="td-box">
        <span className="td-twineV" />
        <span className="td-twineH" />
        <span className="td-knot">
          <i className="l" />
          <i className="r" />
          <b />
          <em className="td-tail" />
        </span>
        <div className="td-label">
          <small>To</small>
          <b>{name}</b>
          <span>Handle with love</span>
          <span className="td-contents">Contents: 1 teddy (unfinished)</span>
        </div>
        <span className="td-stamp">♥</span>
      </div>
      <span className="td-peek" aria-hidden>🧸</span>
    </div>
  );
}

// ─── The two worlds ─────────────────────────────────────────────────────────

export function Backdrop({ world, weather, dim }: { world: "porch" | "workshop" | "bedroom"; weather: "rain" | "snow" | "stars"; dim?: number }) {
  return (
    <div className={`td-bd is-${world}`} aria-hidden style={{ ["--dim" as string]: String(dim ?? 0) }}>
      <div className="td-wall" />
      <div className="td-window">
        <div className={`td-weather is-${weather}`} />
        <div className="td-wmoon" />
        <div className="td-bars" />
      </div>
      {world === "workshop" && (
        <>
          <div className="td-shelf td-shelfA">
            {["#E8A0B4", "#A8C3A0", "#F6D98B", "#9DB7E0", "#E8A0B4"].map((c, i) => (
              <span key={i} className="td-spool" style={{ ["--c" as string]: c }} />
            ))}
          </div>
          <div className="td-shelf td-shelfB">
            {["#F6D98B", "#E8A0B4", "#A8C3A0"].map((c, i) => (
              <span key={i} className="td-spool" style={{ ["--c" as string]: c }} />
            ))}
            <span className="td-jarBtn" />
          </div>
          <div className="td-lamp">
            <span className="td-lampArm" />
            <span className="td-lampHead" />
            <span className="td-lampCone" />
          </div>
          <div className="td-bench" />
        </>
      )}
      {world === "bedroom" && (
        <>
          <div className="td-drape td-drapeL" />
          <div className="td-drape td-drapeR" />
          <div className="td-fairy">
            {Array.from({ length: 14 }, (_, i) => (
              <i key={i} style={{ animationDelay: `${(i % 5) * 0.4}s` }} />
            ))}
          </div>
          <div className="td-bed" />
        </>
      )}
      <div className="td-vignette" />
      <div className="td-dim" />
    </div>
  );
}

export function FabricHeart({ initial, kissed, className, style }: { initial?: string; kissed?: boolean; className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 100 100" className={`td-fheart${className ? ` ${className}` : ""}`} style={style} aria-hidden>
      <defs>
        <radialGradient id="td-fh" cx=".38" cy=".32" r=".7">
          <stop offset="0" stopColor="#ff7a9e" />
          <stop offset="1" stopColor="#b3123f" />
        </radialGradient>
      </defs>
      <path d={HEART_D} fill="url(#td-fh)" />
      <path d={HEART_D} fill="none" stroke="#FFE6A6" strokeWidth="1.6" strokeDasharray="3 3" transform="translate(50 50) scale(.86) translate(-50 -50)" />
      {initial && (
        <text x="50" y="58" textAnchor="middle" className="td-fhInit">
          {initial}
        </text>
      )}
      {kissed && <text x="70" y="40" textAnchor="middle" className="td-kissMark">💋</text>}
    </svg>
  );
}
