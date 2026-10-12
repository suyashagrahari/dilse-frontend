"use client";

// The Dandiya night's dancers: two chubby cartoon bears (a panda and a honey
// teddy) dressed for garba — a twirling chaniya with a zari hem and mirror
// work, a choli with a gold necklace, a maang tikka and a marigold behind the
// ear, a dandiya stick in each paw. Inline SVG (crisp at any size, no
// requests); the dance is CSS on transform only (head sway, sticks tapping,
// skirt swing, a little bob) and reduced motion stills it.

import { useId, type CSSProperties } from "react";
import { DD } from "./ui";

export type BearKind = "panda" | "teddy";
export interface Outfit {
  base: string;
  deep: string;
  light: string;
}

const FUR: Record<BearKind, { fur: string; shade: string; limb: string; ear: string; earIn: string; muzzle: string | null; patch: string | null }> = {
  panda: { fur: "#FFFFFF", shade: "#E9E1DA", limb: "#2B2326", ear: "#2B2326", earIn: "#4A3B3F", muzzle: null, patch: "#2B2326" },
  teddy: { fur: "#D39463", shade: "#B0703F", limb: "#C4824F", ear: "#C4824F", earIn: "#F2C59B", muzzle: "#F6DDBD", patch: null },
};

/** Stick colours per outfit, so a pink chaniya gets peacock-and-gold sticks and so on. */
const STICK_PAIR = (o: Outfit) => (o.base.toUpperCase() === DD.peacock ? DD.kumkum : DD.peacock);

/** One dancing bear as an SVG group, drawn in a 200×250 box. */
function BearG({ kind, outfit, uid, delay = 0 }: { kind: BearKind; outfit: Outfit; uid: string; delay?: number }) {
  const f = FUR[kind];
  const stick = STICK_PAIR(outfit);
  const d = { animationDelay: `${delay}s` } as CSSProperties;
  // the chaniya's hem: a gentle wave across the bottom
  const hem = Array.from({ length: 13 }, (_, i) => {
    const t = i / 12;
    return [26 + t * 148, 224 + Math.sin(t * Math.PI * 6) * 3] as const;
  });
  const pleats = hem.slice(1, -1);
  return (
    <g className="dd-bear-body" style={d}>
      <defs>
        <linearGradient id={`sk${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={outfit.light} />
          <stop offset=".45" stopColor={outfit.base} />
          <stop offset="1" stopColor={outfit.deep} />
        </linearGradient>
        <radialGradient id={`hd${uid}`} cx="42%" cy="36%" r="70%">
          <stop offset="0" stopColor={f.fur} />
          <stop offset=".75" stopColor={f.fur} />
          <stop offset="1" stopColor={f.shade} />
        </radialGradient>
      </defs>

      {/* feet peeking from under the hem */}
      <ellipse cx="84" cy="234" rx="13" ry="8" fill={f.limb} />
      <ellipse cx="116" cy="234" rx="13" ry="8" fill={f.limb} />

      {/* arms raised, a dandiya in each paw — they tap together on the beat */}
      <g className="dd-bear-arm-l" style={d}>
        <path d="M80 114 Q60 104 50 86" stroke={f.limb} strokeWidth="18" strokeLinecap="round" fill="none" />
        <g strokeLinecap="round">
          <path d="M50 92 L30 34" stroke={outfit.base} strokeWidth="7" />
          <path d="M50 92 L30 34" stroke={DD.gold} strokeWidth="7" strokeDasharray="3 7" />
          <circle cx="29" cy="31" r="4.4" fill={DD.gold} stroke={DD.goldDeep} strokeWidth="1" />
        </g>
        <circle cx="50" cy="86" r="11" fill={f.limb} />
      </g>
      <g className="dd-bear-arm-r" style={d}>
        <path d="M120 114 Q140 104 150 86" stroke={f.limb} strokeWidth="18" strokeLinecap="round" fill="none" />
        <g strokeLinecap="round">
          <path d="M150 92 L170 34" stroke={stick} strokeWidth="7" />
          <path d="M150 92 L170 34" stroke={DD.gold} strokeWidth="7" strokeDasharray="3 7" />
          <circle cx="171" cy="31" r="4.4" fill={DD.gold} stroke={DD.goldDeep} strokeWidth="1" />
        </g>
        <circle cx="150" cy="86" r="11" fill={f.limb} />
      </g>

      {/* the chaniya: a flared, pleated skirt with a zari band and a mirror-work hem */}
      <g className="dd-bear-skirt" style={d}>
        <path d={`M74 132 Q100 140 126 132 L174 ${hem[12][1].toFixed(1)} ${hem
          .slice()
          .reverse()
          .map(([x, y]) => `L${x.toFixed(1)} ${y.toFixed(1)}`)
          .join(" ")} Z`} fill={`url(#sk${uid})`} />
        {pleats.map(([x], i) => (
          <path key={i} d={`M100 138 L${x.toFixed(1)} 220`} stroke={i % 2 ? outfit.deep : outfit.light} strokeOpacity=".5" strokeWidth="2.6" />
        ))}
        <path d="M33 206 Q100 218 167 206" stroke={DD.gold} strokeWidth="5" fill="none" />
        {Array.from({ length: 9 }, (_, i) => {
          const t = (i + 0.5) / 9;
          return <circle key={i} className={i % 3 === 0 ? "dd-twinkle" : undefined} cx={35 + t * 130} cy={206 + Math.sin(t * Math.PI) * 6} r="3.2" fill={DD.mirror} stroke={DD.goldDeep} strokeWidth="1.2" />;
        })}
        <path d={`M26 224 ${hem.map(([x, y]) => `L${x.toFixed(1)} ${y.toFixed(1)}`).join(" ")}`} stroke={DD.gold} strokeWidth="2.6" fill="none" />
        <path d="M75 133 Q100 141 125 133" stroke={DD.gold} strokeWidth="3.4" fill="none" />
      </g>

      {/* the choli, with mirrors and a gold necklace */}
      <path d="M74 104 Q100 96 126 104 L128 134 Q100 142 72 134 Z" fill={outfit.deep} />
      {[86, 100, 114].map((x) => (
        <circle key={x} cx={x} cy="124" r="2.6" fill={DD.mirror} stroke={DD.gold} strokeWidth="1" />
      ))}
      <path d="M84 106 Q100 118 116 106" stroke={DD.gold} strokeWidth="2.6" fill="none" />
      <circle cx="100" cy="115" r="3" fill={DD.kumkum} stroke={DD.gold} strokeWidth="1.2" />

      {/* the dupatta: a sheer sash over one shoulder with a gold border, its end flying out at the hip */}
      <g className="dd-bear-dupatta" style={d}>
        <path d="M120 138 Q148 150 150 186 Q146 192 138 188 Q138 160 112 146 Z" fill={outfit.light} stroke={DD.gold} strokeWidth="1.8" opacity=".95" />
        {[0, 1, 2].map((k) => (
          <circle key={k} cx={140 + k * 2.4} cy={170 + k * 6} r="1.6" fill={DD.gold} />
        ))}
      </g>
      <path d="M76 103 L88 100 L128 134 L118 141 Z" fill={outfit.light} stroke={DD.gold} strokeWidth="1.8" opacity=".95" />

      {/* the head: big and round, swaying to the dhol */}
      <g className="dd-bear-head" style={d}>
        <circle cx="62" cy="34" r="17" fill={f.ear} />
        <circle cx="138" cy="34" r="17" fill={f.ear} />
        <circle cx="62" cy="34" r="8.5" fill={f.earIn} />
        <circle cx="138" cy="34" r="8.5" fill={f.earIn} />
        <ellipse cx="100" cy="70" rx="47" ry="44" fill={`url(#hd${uid})`} />
        {f.muzzle && <ellipse cx="100" cy="87" rx="19" ry="14" fill={f.muzzle} />}
        {f.patch && (
          <>
            <ellipse cx="80" cy="71" rx="11" ry="14.5" fill={f.patch} transform="rotate(-28 80 71)" />
            <ellipse cx="120" cy="71" rx="11" ry="14.5" fill={f.patch} transform="rotate(28 120 71)" />
          </>
        )}
        {/* eyes: shiny, with a sparkle each */}
        {[81, 119].map((x) => (
          <g key={x}>
            {f.patch && <circle cx={x} cy="71" r="6.2" fill="#FFFFFF" />}
            <circle cx={x} cy="71.5" r="4.6" fill="#1A1416" />
            <circle cx={x + 1.6} cy="69.6" r="1.7" fill="#FFFFFF" />
          </g>
        ))}
        {/* blush */}
        <ellipse cx="68" cy="88" rx="8" ry="5" fill="#FF8FA3" opacity=".6" />
        <ellipse cx="132" cy="88" rx="8" ry="5" fill="#FF8FA3" opacity=".6" />
        {/* nose and a little "w" smile */}
        <path d="M93.5 81 Q100 77 106.5 81 Q104 87 100 88 Q96 87 93.5 81 Z" fill="#2B2326" />
        <path d="M91 92 Q95.5 97.5 100 92.5 Q104.5 97.5 109 92" stroke="#2B2326" strokeWidth="2.3" fill="none" strokeLinecap="round" />
        {/* maang tikka */}
        <path d="M100 27 L100 40" stroke={DD.gold} strokeWidth="1.6" />
        <circle cx="100" cy="27" r="1.8" fill={DD.gold} />
        <path d="M100 39 Q104.5 44 100 49 Q95.5 44 100 39 Z" fill={DD.kumkum} stroke={DD.gold} strokeWidth="1.3" />
        {/* a marigold tucked behind the ear */}
        <g transform="translate(136 50)">
          {Array.from({ length: 8 }, (_, i) => (
            <circle key={i} cx={Math.cos((i / 8) * Math.PI * 2) * 5} cy={Math.sin((i / 8) * Math.PI * 2) * 5} r="4" fill={i % 2 ? DD.marigold : DD.saffron} />
          ))}
          <circle r="3.4" fill="#C46A00" />
          <path d="M-6 6 Q-12 12 -10 16 Q-4 12 -6 6 Z" fill="#2E8B57" />
        </g>
      </g>
    </g>
  );
}

/** One dancing bear. `dance` sets the beat going; the box is 200×250 (aspect 0.8). */
export function Bear({ kind, outfit, dance = true, size = "100%", style, className }: { kind: BearKind; outfit: Outfit; dance?: boolean; size?: number | string; style?: CSSProperties; className?: string }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg
      viewBox="-4 14 208 238"
      width={size}
      className={`dd-bear${dance ? " is-dance" : ""}${className ? ` ${className}` : ""}`}
      style={{ display: "block", overflow: "visible", aspectRatio: "208 / 238", height: "auto", ...style }}
      aria-hidden
    >
      <ellipse cx="100" cy="242" rx="66" ry="7" fill="rgba(30,0,4,.35)" />
      <BearG kind={kind} outfit={outfit} uid={uid} />
    </svg>
  );
}

const PINK: Outfit = { base: DD.rani, deep: "#9E1E63", light: "#FFA8D3" };
const MARIGOLD: Outfit = { base: DD.marigold, deep: "#D17A00", light: "#FFE08A" };

/** The pair: the panda and the teddy dancing face to face, sticks meeting in the middle, a heart above. */
export function BearCouple({ size = "100%", left = PINK, right = MARIGOLD, style, className }: { size?: number | string; left?: Outfit; right?: Outfit; style?: CSSProperties; className?: string }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 360 290" width={size} className={`dd-bear is-dance dd-bears${className ? ` ${className}` : ""}`} style={{ display: "block", overflow: "visible", aspectRatio: "360 / 290", height: "auto", ...style }} aria-hidden>
      <ellipse cx="180" cy="282" rx="150" ry="9" fill="rgba(30,0,4,.35)" />
      <g transform="translate(6 40) rotate(-4 100 240)">
        <BearG kind="panda" outfit={left} uid={`${uid}a`} />
      </g>
      <g transform="translate(154 40) rotate(4 100 240)">
        <BearG kind="teddy" outfit={right} uid={`${uid}b`} delay={-0.45} />
      </g>
      <g className="dd-bears-heart">
        <path d="M180 30 C172 18 154 22 156 36 C158 48 180 58 180 58 C180 58 202 48 204 36 C206 22 188 18 180 30 Z" fill={DD.kumkum} stroke={DD.gold} strokeWidth="2.4" />
        <path d="M166 30 Q168 26 172 26" stroke="#FFFFFF" strokeOpacity=".7" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
}

export const DD_BEAR_CSS = `
.dd-bear .dd-bear-body, .dd-bear .dd-bear-head, .dd-bear .dd-bear-arm-l, .dd-bear .dd-bear-arm-r, .dd-bear .dd-bear-skirt, .dd-bear .dd-bear-dupatta { transform-box: view-box; }
.dd-bear .dd-bear-head { transform-origin: 100px 112px; }
.dd-bear .dd-bear-arm-l { transform-origin: 80px 114px; }
.dd-bear .dd-bear-arm-r { transform-origin: 120px 114px; }
.dd-bear .dd-bear-skirt { transform-origin: 100px 134px; }
.dd-bear .dd-bear-dupatta { transform-origin: 118px 142px; }
.dd-bear .dd-bear-body { transform-origin: 100px 240px; }
.dd-bear.is-dance .dd-bear-body { animation: dd-bear-bob .9s ease-in-out infinite alternate; }
.dd-bear.is-dance .dd-bear-head { animation: dd-bear-head 1.8s ease-in-out infinite alternate; }
.dd-bear.is-dance .dd-bear-arm-l { animation: dd-bear-arm-l .45s ease-in-out infinite alternate; }
.dd-bear.is-dance .dd-bear-arm-r { animation: dd-bear-arm-r .45s ease-in-out infinite alternate; }
.dd-bear.is-dance .dd-bear-skirt { animation: dd-bear-skirt .9s ease-in-out infinite alternate; }
.dd-bear.is-dance .dd-bear-dupatta { animation: dd-bear-dupatta 1.8s ease-in-out infinite alternate; }
.dd-bears .dd-bears-heart { transform-box: fill-box; transform-origin: center; animation: dd-bears-heart 0.9s ease-in-out infinite alternate; }
@keyframes dd-bear-bob { from { transform: translateY(0) rotate(-2deg) } to { transform: translateY(-6px) rotate(2deg) } }
@keyframes dd-bear-head { from { transform: rotate(-6deg) } to { transform: rotate(6deg) } }
@keyframes dd-bear-arm-l { from { transform: rotate(0) } to { transform: rotate(16deg) } }
@keyframes dd-bear-arm-r { from { transform: rotate(0) } to { transform: rotate(-16deg) } }
@keyframes dd-bear-skirt { from { transform: skewX(-5deg) scaleX(1) } to { transform: skewX(5deg) scaleX(1.04) } }
@keyframes dd-bear-dupatta { from { transform: rotate(-8deg) } to { transform: rotate(10deg) } }
@keyframes dd-bears-heart { from { transform: scale(.88) translateY(2px) } to { transform: scale(1.1) translateY(-3px) } }
@media (prefers-reduced-motion: reduce) { .dd-bear * { animation: none !important; } }
`;
