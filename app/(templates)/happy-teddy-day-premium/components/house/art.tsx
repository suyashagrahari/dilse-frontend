"use client";

// The Teddy House's hand-drawn SVG art: the teddy himself (moods × poses × the wardrobe, a heart in his chest),
// a mini teddy head for the teddy rain, the delivery box, the satin heart, the toy phone, the kitchen treats and
// the wardrobe icons. The teddy never uses CSS variables in its paint, so the certificate can serialise the same
// <svg> into its poster PNG.

import { forwardRef, type CSSProperties, type ReactNode } from "react";
import type { TeddyItem } from "../../../_valentine/days/happy-teddy-day-premium";
import { TH } from "./model";

export type Mood = "open" | "happy" | "sleep" | "wink" | "love" | "sad" | "shy";
export type Pose = "down" | "wave" | "up" | "hold" | "hug";

export const FURS = {
  honey: { base: "#E8B07A", dark: "#C98A55", light: "#F8D9B0", inner: "#F6B9B0" },
  cocoa: { base: "#A86E4C", dark: "#7E4F33", light: "#D8AE8C", inner: "#E6A3A0" },
  pink: { base: "#FFC2D4", dark: "#F09AB5", light: "#FFE4EC", inner: "#FF9EBB" },
  snow: { base: "#FFF6EE", dark: "#E8D6C8", light: "#FFFFFF", inner: "#FFC9D6" },
  lilac: { base: "#D8C4F2", dark: "#B49ADB", light: "#EFE4FF", inner: "#F7B8D2" },
} as const;
export type Fur = keyof typeof FURS;

const INK = "#4A2C1E";

/** A heart path centred on (cx, cy), `w` wide. */
export function heartPath(cx: number, cy: number, w: number) {
  const s = w / 32;
  const p = (x: number, y: number) => `${(cx + x * s).toFixed(1)} ${(cy + y * s).toFixed(1)}`;
  return `M${p(0, 10)} C${p(-4, 6)} ${p(-16, -1)} ${p(-16, -7)} C${p(-16, -13)} ${p(-11, -16)} ${p(-7.5, -16)} C${p(-4, -16)} ${p(-1.5, -13.5)} ${p(0, -10.5)} C${p(1.5, -13.5)} ${p(4, -16)} ${p(7.5, -16)} C${p(11, -16)} ${p(16, -13)} ${p(16, -7)} C${p(16, -1)} ${p(4, 6)} ${p(0, 10)} Z`;
}

function Eyes({ mood }: { mood: Mood }) {
  const open = (cx: number) => (
    <g key={cx}>
      <ellipse cx={cx} cy={100} rx={6.8} ry={8.2} fill={INK} />
      <circle cx={cx + 2.6} cy={96.4} r={2.6} fill="#fff" />
      <circle cx={cx - 2} cy={103.4} r={1.2} fill="#fff" />
    </g>
  );
  const arc = (cx: number, up: boolean) => (
    <path key={`a${cx}`} d={up ? `M${cx - 7} 102 Q${cx} 93 ${cx + 7} 102` : `M${cx - 7} 98 Q${cx} 106 ${cx + 7} 98`} stroke={INK} strokeWidth={3.6} fill="none" strokeLinecap="round" />
  );
  switch (mood) {
    case "happy":
      return <>{[arc(77, true), arc(123, true)]}</>;
    case "sleep":
      return <>{[arc(77, false), arc(123, false)]}</>;
    case "wink":
      return <>{[open(77), arc(123, true)]}</>;
    case "love":
      return (
        <>
          <path d={heartPath(77, 101, 18)} fill="#FF4F86" />
          <path d={heartPath(123, 101, 18)} fill="#FF4F86" />
          <circle cx={73} cy={96} r={1.8} fill="#fff" />
          <circle cx={119} cy={96} r={1.8} fill="#fff" />
        </>
      );
    case "sad":
      return (
        <>
          {open(77)}
          {open(123)}
          <path d="M68 86 Q75 84 83 89" stroke={INK} strokeWidth={2.6} fill="none" strokeLinecap="round" />
          <path d="M132 86 Q125 84 117 89" stroke={INK} strokeWidth={2.6} fill="none" strokeLinecap="round" />
          <path d="M128 110 Q131 117 128 121 Q124 117 128 110 Z" fill="#8FD3FF" stroke="#fff" strokeWidth={1} />
        </>
      );
    case "shy":
      return (
        <>
          <g transform="translate(0 3)">
            <ellipse cx={77} cy={101} rx={6} ry={6.6} fill={INK} />
            <ellipse cx={123} cy={101} rx={6} ry={6.6} fill={INK} />
            <circle cx={79} cy={98.6} r={2} fill="#fff" />
            <circle cx={125} cy={98.6} r={2} fill="#fff" />
          </g>
        </>
      );
    default:
      return (
        <g className="th-blink">
          {open(77)}
          {open(123)}
        </g>
      );
  }
}

function Mouth({ mood }: { mood: Mood }) {
  switch (mood) {
    case "love":
      return (
        <g>
          <path d="M91 127 Q100 142 109 127 Z" fill="#8C2F46" stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
          <path d="M95 133 Q100 139 105 133 Q100 131 95 133 Z" fill="#FF8FAB" />
        </g>
      );
    case "sleep":
      return <ellipse cx={100} cy={131} rx={3.4} ry={2.6} fill={INK} />;
    case "sad":
      return <path d="M92 134 Q100 127 108 134" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />;
    case "shy":
      return <path d="M95 129 Q97.5 132 100 129 Q102.5 132 105 129" stroke={INK} strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    default:
      return <path d="M100 122 L100 127 M92 127 Q96 132 100 127 Q104 132 108 127" stroke={INK} strokeWidth={2.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
  }
}

/** One arm: an ellipse hanging from the shoulder, rotated around it. */
function Arm({ x, y = 150, rot, fur, cls }: { x: number; y?: number; rot: number; fur: (typeof FURS)[Fur]; cls?: string }) {
  return (
    <g transform={`rotate(${rot} ${x} ${y})`}>
      <g className={cls} style={{ transformOrigin: `${x}px ${y}px` }}>
        <ellipse cx={x} cy={y + 26} rx={15.5} ry={29} fill={fur.base} stroke={fur.dark} strokeWidth={2} />
        <ellipse cx={x} cy={y + 46} rx={9} ry={7.5} fill={fur.inner} opacity={0.9} />
      </g>
    </g>
  );
}

export interface TeddyProps {
  size?: number;
  mood?: Mood;
  pose?: Pose;
  fur?: Fur;
  worn?: readonly TeddyItem[];
  /** The heart she gave him glows in his chest. */
  heart?: boolean;
  /** Something he holds in front of his belly (drawn in a 60×60 box centred on 0,0). */
  held?: ReactNode;
  className?: string;
  style?: CSSProperties;
  title?: string;
}

export const Teddy = forwardRef<SVGSVGElement, TeddyProps>(function Teddy(
  { size = 200, mood = "open", pose = "down", fur: furId = "honey", worn = [], heart, held, className, style, title },
  ref,
) {
  const fur = FURS[furId];
  const has = (i: TeddyItem) => worn.includes(i);
  const armRot = {
    down: [28, -28],
    wave: [28, -140],
    up: [140, -140],
    hold: [-30, 30],
    hug: [-38, 38],
  }[pose];
  const front = pose === "hold" || pose === "hug";
  // raised arms come out from the side of the body and are drawn over the head's edge
  const upL = pose === "up";
  const upR = pose === "up" || pose === "wave";
  const sweaterFill = "#FFB3C8";
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 240"
      width={size}
      height={size * 1.2}
      className={className}
      style={style}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {/* ears */}
      {[54, 146].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy={58} r={24} fill={fur.base} stroke={fur.dark} strokeWidth={2.4} />
          <circle cx={cx} cy={60} r={13} fill={fur.inner} />
        </g>
      ))}
      {/* body */}
      <ellipse cx={100} cy={180} rx={56} ry={50} fill={fur.base} stroke={fur.dark} strokeWidth={2.4} />
      <ellipse cx={100} cy={190} rx={34} ry={31} fill={fur.light} />
      {has("sweater") && (
        <g>
          <path d="M46 168 Q48 134 100 132 Q152 134 154 168 Q156 206 100 212 Q44 206 46 168 Z" fill={sweaterFill} stroke="#F08AA8" strokeWidth={2.4} />
          <path d="M52 200 Q100 218 148 200" stroke="#F08AA8" strokeWidth={6} fill="none" strokeDasharray="2 5" strokeLinecap="round" />
          {!heart && <path d={heartPath(100, 178, 30)} fill="#FF5C8A" stroke="#fff" strokeWidth={2} />}
        </g>
      )}
      {heart && (
        <g>
          <circle className="th-heartGlow" cx={100} cy={176} r={30} fill="url(#thGlow)" />
          <path className="th-heartBeat" d={heartPath(100, 178, 32)} fill="#FF4F86" stroke="#fff" strokeWidth={2.4} strokeDasharray="3 3" />
        </g>
      )}
      <defs>
        <radialGradient id="thGlow">
          <stop offset="0%" stopColor="#FFD1E0" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#FFD1E0" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* feet */}
      {[64, 136].map((cx) => (
        <g key={cx}>
          <ellipse cx={cx} cy={222} rx={24} ry={15} fill={fur.base} stroke={fur.dark} strokeWidth={2.4} />
          <ellipse cx={cx} cy={224} rx={13} ry={8} fill={fur.inner} />
          {[-8, 0, 8].map((dx) => (
            <circle key={dx} cx={cx + dx} cy={213} r={2.6} fill={fur.inner} />
          ))}
        </g>
      ))}
      {/* arms (behind the head when raised, in front of the belly when holding) */}
      {!front && !upL && <Arm x={64} rot={armRot[0]} fur={fur} />}
      {!front && !upR && <Arm x={136} rot={armRot[1]} fur={fur} />}
      {/* head */}
      <ellipse cx={100} cy={104} rx={64} ry={56} fill={fur.base} stroke={fur.dark} strokeWidth={2.4} />
      <ellipse cx={84} cy={70} rx={20} ry={9} fill="#fff" opacity={0.18} transform="rotate(-18 84 70)" />
      <ellipse cx={100} cy={124} rx={25} ry={19} fill={fur.light} />
      <ellipse cx={66} cy={120} rx={10} ry={6} fill="#FF8FAB" opacity={mood === "shy" || mood === "love" ? 0.85 : 0.55} />
      <ellipse cx={134} cy={120} rx={10} ry={6} fill="#FF8FAB" opacity={mood === "shy" || mood === "love" ? 0.85 : 0.55} />
      <Eyes mood={mood} />
      <path d="M91 113 Q100 108 109 113 Q106 121 100 122 Q94 121 91 113 Z" fill={INK} />
      <ellipse cx={97} cy={112.6} rx={3} ry={1.6} fill="#fff" opacity={0.7} />
      <Mouth mood={mood} />
      {upL && <Arm x={50} y={142} rot={armRot[0]} fur={fur} cls="th-cheerL" />}
      {upR && <Arm x={150} y={142} rot={armRot[1]} fur={fur} cls={pose === "wave" ? "th-wave" : "th-cheerR"} />}
      {has("glasses") && (
        <g>
          <path d={heartPath(77, 102, 34)} fill="rgba(255,111,156,.42)" stroke="#E0607E" strokeWidth={3.2} />
          <path d={heartPath(123, 102, 34)} fill="rgba(255,111,156,.42)" stroke="#E0607E" strokeWidth={3.2} />
          <path d="M92 96 Q100 91 108 96" stroke="#E0607E" strokeWidth={3} fill="none" strokeLinecap="round" />
          <path d="M70 92 L74 90" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" />
          <path d="M116 92 L120 90" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" />
        </g>
      )}
      {has("scarf") && (
        <g>
          <path d="M46 142 Q100 182 154 142 L156 158 Q100 198 44 158 Z" fill="#7FD1B0" stroke="#4FB98C" strokeWidth={2.2} />
          <path d="M60 152 L64 166 M80 160 L82 175 M100 163 L100 178 M120 160 L118 175 M140 152 L136 166" stroke="#fff" strokeWidth={3} opacity={0.7} />
          <path d="M120 166 L128 206 L144 200 L134 162 Z" fill="#7FD1B0" stroke="#4FB98C" strokeWidth={2.2} />
          <path d="M129 206 L131 212 M135 204 L137 210 M141 202 L143 208" stroke="#4FB98C" strokeWidth={2} />
        </g>
      )}
      {has("bowtie") && (
        <g>
          <path d="M100 164 L80 154 Q76 164 80 176 Z" fill="#FF5C8A" stroke="#D63F72" strokeWidth={2.2} strokeLinejoin="round" />
          <path d="M100 164 L120 154 Q124 164 120 176 Z" fill="#FF5C8A" stroke="#D63F72" strokeWidth={2.2} strokeLinejoin="round" />
          <rect x={94} y={158} width={12} height={12} rx={4} fill="#D63F72" />
          <circle cx={86} cy={162} r={1.8} fill="#fff" />
          <circle cx={114} cy={168} r={1.8} fill="#fff" />
        </g>
      )}
      {has("crown") && (
        <g>
          <path d="M72 58 L74 28 L88 44 L100 20 L112 44 L126 28 L128 58 Q100 64 72 58 Z" fill="#FFD166" stroke="#E0A030" strokeWidth={2.6} strokeLinejoin="round" />
          <circle cx={100} cy={20} r={4} fill="#FF6F9C" />
          <circle cx={74} cy={28} r={3.4} fill="#7FD1B0" />
          <circle cx={126} cy={28} r={3.4} fill="#7FD1B0" />
          <path d={heartPath(100, 50, 12)} fill="#FF6F9C" />
        </g>
      )}
      {has("cap") && (
        <g>
          <path d="M56 70 Q58 32 100 30 Q142 32 144 70 Q100 60 56 70 Z" fill="#8FC7FF" stroke="#5A9BE0" strokeWidth={2.4} />
          <path d="M120 66 Q152 60 172 72 Q150 80 124 76 Z" fill="#5A9BE0" stroke="#3F7FC4" strokeWidth={2} />
          <circle cx={100} cy={31} r={4} fill="#5A9BE0" />
          <path d={heartPath(100, 52, 16)} fill="#fff" />
        </g>
      )}
      {has("bow") && (
        <g>
          <ellipse cx={132} cy={40} rx={15} ry={10} fill="#FF6F9C" stroke="#D63F72" strokeWidth={2.2} transform="rotate(-24 132 40)" />
          <ellipse cx={160} cy={36} rx={15} ry={10} fill="#FF6F9C" stroke="#D63F72" strokeWidth={2.2} transform="rotate(20 160 36)" />
          <circle cx={128} cy={38} r={2} fill="#fff" />
          <circle cx={136} cy={44} r={1.6} fill="#fff" />
          <circle cx={162} cy={34} r={2} fill="#fff" />
          <circle cx={146} cy={39} r={6.5} fill="#D63F72" />
        </g>
      )}
      {has("flower") && (
        <g transform="translate(54 44)">
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <ellipse key={a} cx={0} cy={-10} rx={6.5} ry={10} fill="#fff" stroke="#F2D3B8" strokeWidth={1.4} transform={`rotate(${a})`} />
          ))}
          <circle r={6.5} fill="#FFD166" stroke="#E0A030" strokeWidth={1.4} />
        </g>
      )}
      {front && (
        <>
          <Arm x={64} rot={armRot[0]} fur={fur} />
          <Arm x={136} rot={armRot[1]} fur={fur} />
          {held && <g transform="translate(100 192)">{held}</g>}
        </>
      )}
    </svg>
  );
});

/** A little teddy head for the teddy rain (60×56). */
export function MiniTeddy({ size = 44, fur: furId = "honey", mood = "happy", bow }: { size?: number; fur?: Fur; mood?: "happy" | "open" | "love"; bow?: boolean }) {
  const fur = FURS[furId];
  return (
    <svg viewBox="0 0 60 56" width={size} height={(size * 56) / 60} aria-hidden>
      <circle cx={13} cy={14} r={9} fill={fur.base} stroke={fur.dark} strokeWidth={1.6} />
      <circle cx={47} cy={14} r={9} fill={fur.base} stroke={fur.dark} strokeWidth={1.6} />
      <circle cx={13} cy={15} r={4.6} fill={fur.inner} />
      <circle cx={47} cy={15} r={4.6} fill={fur.inner} />
      <ellipse cx={30} cy={32} rx={24} ry={21} fill={fur.base} stroke={fur.dark} strokeWidth={1.6} />
      <ellipse cx={30} cy={39} rx={9.5} ry={7} fill={fur.light} />
      {mood === "love" ? (
        <>
          <path d={heartPath(21, 30, 8)} fill="#FF4F86" />
          <path d={heartPath(39, 30, 8)} fill="#FF4F86" />
        </>
      ) : mood === "happy" ? (
        <>
          <path d="M18 31 Q21 27 24 31" stroke={INK} strokeWidth={1.9} fill="none" strokeLinecap="round" />
          <path d="M36 31 Q39 27 42 31" stroke={INK} strokeWidth={1.9} fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx={21} cy={30} r={2.6} fill={INK} />
          <circle cx={39} cy={30} r={2.6} fill={INK} />
        </>
      )}
      <ellipse cx={30} cy={36} rx={3.2} ry={2.3} fill={INK} />
      <path d="M27 40 Q30 43 33 40" stroke={INK} strokeWidth={1.4} fill="none" strokeLinecap="round" />
      <ellipse cx={15} cy={38} rx={4} ry={2.4} fill="#FF8FAB" opacity={0.6} />
      <ellipse cx={45} cy={38} rx={4} ry={2.4} fill="#FF8FAB" opacity={0.6} />
      {bow && (
        <g>
          <ellipse cx={41} cy={9} rx={6} ry={4} fill="#FF6F9C" transform="rotate(-20 41 9)" />
          <ellipse cx={52} cy={7} rx={6} ry={4} fill="#FF6F9C" transform="rotate(20 52 7)" />
          <circle cx={46.5} cy={8} r={2.6} fill="#D63F72" />
        </g>
      )}
    </svg>
  );
}

/** A puffy satin heart (the one she rubs warm). `warm` 0…1 deepens the colour. */
export function SatinHeart({ size = 120, warm = 0 }: { size?: number; warm?: number }) {
  const c = warm > 0.99 ? "#FF3F7C" : `hsl(${346 - warm * 4} ${70 + warm * 25}% ${84 - warm * 22}%)`;
  return (
    <svg viewBox="0 0 120 112" width={size} height={(size * 112) / 120} aria-hidden>
      <path d={heartPath(60, 64, 108)} fill={c} stroke="#fff" strokeWidth={5} />
      <path d={heartPath(60, 64, 92)} fill="none" stroke="#fff" strokeWidth={2.4} strokeDasharray="5 5" opacity={0.85} />
      <ellipse cx={36} cy={40} rx={14} ry={8} fill="#fff" opacity={0.55} transform="rotate(-30 36 40)" />
      <circle cx={30} cy={56} r={3.2} fill="#fff" opacity={0.6} />
    </svg>
  );
}

/** The delivery box (kraft, tape, a label). The lid is separate so it can pop off. */
export function BoxBody({ size = 240, children }: { size?: number; children?: ReactNode }) {
  return (
    <svg viewBox="0 0 240 170" width={size} height={(size * 170) / 240} aria-hidden>
      <rect x={10} y={6} width={220} height={158} rx={16} fill="#E2B27C" stroke="#B9824D" strokeWidth={3} />
      <rect x={10} y={6} width={220} height={22} rx={8} fill="#D39C63" />
      <rect x={104} y={6} width={32} height={158} fill="#FFD9E4" opacity={0.92} />
      <path d="M104 6 L104 164 M136 6 L136 164" stroke="#F4A9BF" strokeWidth={2} strokeDasharray="6 6" />
      {[30, 60, 180, 208].map((x, i) => (
        <path key={i} d={heartPath(x, 146 - (i % 2) * 8, 10)} fill="#C98A55" opacity={0.45} />
      ))}
      <g transform="translate(26 40) rotate(-6)">
        <rect width={74} height={26} rx={5} fill="none" stroke="#E0607E" strokeWidth={3} />
        <text x={37} y={18} textAnchor="middle" fontSize={14} fontWeight={800} fill="#E0607E" fontFamily="system-ui, sans-serif" letterSpacing={1.2}>
          FRAGILE
        </text>
      </g>
      <text x={186} y={58} textAnchor="middle" fontSize={22} fill="#B9824D" fontFamily="system-ui, sans-serif">
        ↑↑
      </text>
      {children}
    </svg>
  );
}

export function BoxLid({ size = 260 }: { size?: number }) {
  return (
    <svg viewBox="0 0 260 60" width={size} height={(size * 60) / 260} aria-hidden>
      <rect x={4} y={10} width={252} height={44} rx={14} fill="#EBBE8A" stroke="#B9824D" strokeWidth={3} />
      <rect x={112} y={10} width={36} height={44} fill="#FFD9E4" />
      <path d="M130 12 C112 -6 92 6 108 14 Z M130 12 C148 -6 168 6 152 14 Z" fill="#FF6F9C" stroke="#D63F72" strokeWidth={2.4} strokeLinejoin="round" />
      <circle cx={130} cy={12} r={6} fill="#D63F72" />
    </svg>
  );
}

/** A pink toy phone with a face. `ringing` lifts the handset a little. */
export function ToyPhone({ size = 200, ringing, off }: { size?: number; ringing?: boolean; off?: boolean }) {
  return (
    <svg viewBox="0 0 200 180" width={size} height={size * 0.9} aria-hidden>
      <path d="M30 168 Q20 168 24 150 L46 74 Q50 62 64 62 L136 62 Q150 62 154 74 L176 150 Q180 168 170 168 Z" fill="#FF9EBB" stroke="#E0607E" strokeWidth={3} />
      <circle cx={100} cy={118} r={36} fill="#FFF3F7" stroke="#E0607E" strokeWidth={3} />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
        return <circle key={i} cx={100 + Math.cos(a) * 24} cy={118 + Math.sin(a) * 24} r={5.4} fill="#FFD1DE" stroke="#F49AB6" strokeWidth={1.6} />;
      })}
      <circle cx={93} cy={114} r={3.2} fill={INK} />
      <circle cx={107} cy={114} r={3.2} fill={INK} />
      <path d={ringing ? "M95 123 Q100 130 105 123 Z" : "M95 123 Q100 127 105 123"} stroke={INK} strokeWidth={2.2} fill={ringing ? "#8C2F46" : "none"} strokeLinecap="round" />
      <ellipse cx={84} cy={124} rx={4.4} ry={2.6} fill="#FF8FAB" opacity={0.75} />
      <ellipse cx={116} cy={124} rx={4.4} ry={2.6} fill="#FF8FAB" opacity={0.75} />
      {!off && (
        <g transform={ringing ? "translate(0 -10) rotate(-4 100 50)" : undefined}>
          <path d="M40 62 Q36 40 52 36 L74 34 Q84 34 84 46 L84 52 Q84 58 76 58 L66 58 Q60 58 60 50 L60 48 L140 48 L140 50 Q140 58 134 58 L124 58 Q116 58 116 52 L116 46 Q116 34 126 34 L148 36 Q164 40 160 62" fill="#FF6F9C" stroke="#D63F72" strokeWidth={3} strokeLinejoin="round" />
        </g>
      )}
      <path d="M154 150 Q186 150 182 120 Q178 96 190 86" stroke="#E0607E" strokeWidth={3} fill="none" strokeDasharray="1 7" strokeLinecap="round" />
    </svg>
  );
}

/** Kitchen treats that fall into his bowl. */
export function Treat({ kind, size = 44 }: { kind: "cookie" | "honey" | "berry" | "heart"; size?: number }) {
  switch (kind) {
    case "cookie":
      return (
        <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden>
          <circle cx={20} cy={20} r={17} fill="#E9B27A" stroke="#B9824D" strokeWidth={2.4} />
          {[
            [13, 14], [24, 11], [27, 22], [15, 26], [21, 19],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={2.6} fill="#6B4226" />
          ))}
        </svg>
      );
    case "honey":
      return (
        <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden>
          <rect x={9} y={8} width={22} height={6} rx={2} fill="#FF8FAB" />
          <path d="M8 16 Q6 36 20 36 Q34 36 32 16 Z" fill="#FFC14D" stroke="#D99820" strokeWidth={2.2} />
          <path d="M8 18 Q14 22 20 18 Q26 22 32 18" stroke="#D99820" strokeWidth={2} fill="none" />
          <rect x={13} y={22} width={14} height={8} rx={2} fill="#FFF3D6" />
        </svg>
      );
    case "berry":
      return (
        <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden>
          <path d="M20 37 Q6 28 8 16 Q12 9 20 12 Q28 9 32 16 Q34 28 20 37 Z" fill="#FF5C7A" stroke="#D63F5A" strokeWidth={2} />
          <path d="M14 10 L20 14 L26 10 L22 6 L20 9 L18 6 Z" fill="#5FB893" />
          {[[15, 20], [24, 19], [20, 26], [14, 28], [26, 27]].map(([x, y], i) => (
            <ellipse key={i} cx={x} cy={y} rx={1.2} ry={1.8} fill="#FFE27A" />
          ))}
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden>
          <path d={heartPath(20, 22, 34)} fill="#FF6F9C" stroke="#fff" strokeWidth={2.4} />
        </svg>
      );
  }
}

/** A bowl he holds in the kitchen (drawn for `held`, centred on 0,0). */
export function HeldBowl() {
  return (
    <g>
      <path d="M-54 -10 Q-52 34 0 36 Q52 34 54 -10 Z" fill="#FFFFFF" stroke="#F09AB5" strokeWidth={3.4} />
      <ellipse cx={0} cy={-10} rx={54} ry={9} fill="#FFE4EC" stroke="#F09AB5" strokeWidth={3.4} />
      <path d={heartPath(0, 14, 20)} fill="#FF8FAB" />
      <circle cx={-40} cy={-2} r={9} fill="#E8B07A" stroke="#C98A55" strokeWidth={2} />
      <circle cx={40} cy={-2} r={9} fill="#E8B07A" stroke="#C98A55" strokeWidth={2} />
    </g>
  );
}

/** The toy phone's handset, in his paws (centred on 0,0). */
export function HeldHandset() {
  return (
    <g transform="rotate(-14)">
      <path d="M-56 -4 Q-60 -26 -44 -30 L-26 -30 Q-18 -30 -18 -20 L-18 -16 Q-18 -10 -26 -10 L-32 -10 Q-36 -10 -36 -4 L36 -4 Q36 -10 32 -10 L26 -10 Q18 -10 18 -16 L18 -20 Q18 -30 26 -30 L44 -30 Q60 -26 56 -4 Z" fill="#FF6F9C" stroke="#D63F72" strokeWidth={3} strokeLinejoin="round" />
      <path d="M40 -4 Q60 20 40 34 Q24 44 36 58" stroke="#E0607E" strokeWidth={3} fill="none" strokeDasharray="1 6" strokeLinecap="round" />
    </g>
  );
}

/** A little gold picture frame he holds (the photo itself is HTML on top). */
export function HeldFrame() {
  return <rect x={-34} y={-34} width={68} height={60} rx={6} fill="#FFFDF8" stroke="#F2B36B" strokeWidth={4} />;
}

/** The wardrobe icons. */
export function ItemIcon({ id, size = 44 }: { id: TeddyItem; size?: number }) {
  const v = (children: ReactNode, vb = "0 0 48 48") => (
    <svg viewBox={vb} width={size} height={size} aria-hidden>
      {children}
    </svg>
  );
  switch (id) {
    case "bow":
      return v(
        <>
          <ellipse cx={14} cy={24} rx={12} ry={9} fill="#FF6F9C" stroke="#D63F72" strokeWidth={2} transform="rotate(-18 14 24)" />
          <ellipse cx={34} cy={24} rx={12} ry={9} fill="#FF6F9C" stroke="#D63F72" strokeWidth={2} transform="rotate(18 34 24)" />
          <circle cx={24} cy={24} r={5.5} fill="#D63F72" />
        </>,
      );
    case "glasses":
      return v(
        <>
          <path d={heartPath(14, 26, 22)} fill="rgba(255,111,156,.45)" stroke="#E0607E" strokeWidth={2.6} />
          <path d={heartPath(34, 26, 22)} fill="rgba(255,111,156,.45)" stroke="#E0607E" strokeWidth={2.6} />
          <path d="M22 22 Q24 19 26 22" stroke="#E0607E" strokeWidth={2.4} fill="none" />
        </>,
      );
    case "crown":
      return v(
        <>
          <path d="M8 36 L9 14 L18 24 L24 8 L30 24 L39 14 L40 36 Z" fill="#FFD166" stroke="#E0A030" strokeWidth={2.4} strokeLinejoin="round" />
          <circle cx={24} cy={8} r={3} fill="#FF6F9C" />
        </>,
      );
    case "sweater":
      return v(
        <>
          <path d="M14 8 L34 8 L44 18 L38 24 L36 20 L36 42 L12 42 L12 20 L10 24 L4 18 Z" fill="#FFB3C8" stroke="#F08AA8" strokeWidth={2.2} strokeLinejoin="round" />
          <path d={heartPath(24, 27, 14)} fill="#FF5C8A" />
        </>,
      );
    case "scarf":
      return v(
        <>
          <path d="M6 16 Q24 28 42 16 L42 24 Q24 36 6 24 Z" fill="#7FD1B0" stroke="#4FB98C" strokeWidth={2} />
          <path d="M28 26 L32 44 L40 41 L34 24 Z" fill="#7FD1B0" stroke="#4FB98C" strokeWidth={2} />
        </>,
      );
    case "flower":
      return v(
        <g transform="translate(24 24)">
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <ellipse key={a} cx={0} cy={-10} rx={6} ry={9.5} fill="#fff" stroke="#F2D3B8" strokeWidth={1.4} transform={`rotate(${a})`} />
          ))}
          <circle r={6} fill="#FFD166" stroke="#E0A030" strokeWidth={1.4} />
        </g>,
      );
    case "cap":
      return v(
        <>
          <path d="M6 30 Q8 10 24 10 Q40 10 40 30 Z" fill="#8FC7FF" stroke="#5A9BE0" strokeWidth={2.2} />
          <path d="M30 28 Q42 26 46 32 Q38 36 30 34 Z" fill="#5A9BE0" />
        </>,
      );
    case "bowtie":
      return v(
        <>
          <path d="M24 24 L8 14 Q4 24 8 34 Z" fill="#FF5C8A" stroke="#D63F72" strokeWidth={2} strokeLinejoin="round" />
          <path d="M24 24 L40 14 Q44 24 40 34 Z" fill="#FF5C8A" stroke="#D63F72" strokeWidth={2} strokeLinejoin="round" />
          <rect x={19} y={19} width={10} height={10} rx={3} fill="#D63F72" />
        </>,
      );
  }
}

/** A paw print (the progress dots, the certificate stamp). */
export function Paw({ size = 14, color = TH.pinkDeep }: { size?: number; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <ellipse cx={12} cy={15.5} rx={6} ry={5} fill={color} />
      <circle cx={5.2} cy={10} r={2.4} fill={color} />
      <circle cx={9.4} cy={6} r={2.4} fill={color} />
      <circle cx={14.6} cy={6} r={2.4} fill={color} />
      <circle cx={18.8} cy={10} r={2.4} fill={color} />
    </svg>
  );
}
