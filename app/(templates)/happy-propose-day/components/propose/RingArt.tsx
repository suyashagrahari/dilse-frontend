"use client";

// The ring, drawn by hand: solitaire / heart cut / simple band, in a gold
// or rose-gold metal with a diamond, ruby or morganite (rose-gold) stone.
// Front view, standing up in the cushion slit. Pure SVG; `id` keeps the
// gradient ids unique when several rings share a page.

import type { CSSProperties } from "react";

export type RingStyle = "solitaire" | "heart" | "band";
export type StoneColor = "diamond" | "ruby" | "rosegold";

const STONES: Record<StoneColor, { hi: string; a: string; b: string; c: string; facet: string }> = {
  diamond: { hi: "#FFFFFF", a: "#EEF6FF", b: "#C9DDF0", c: "#8FA9C4", facet: "rgba(255,255,255,.75)" },
  ruby: { hi: "#FFC2CC", a: "#F04D63", b: "#C8102E", c: "#6E0718", facet: "rgba(255,200,210,.5)" },
  rosegold: { hi: "#FFF1F3", a: "#FAD0D7", b: "#EBA3B1", c: "#B86C7E", facet: "rgba(255,240,242,.7)" },
};

export function metalFor(stone: StoneColor) {
  return stone === "rosegold" ? { hi: "#FBE0D8", mid: "#E8A598", lo: "#B86E62" } : { hi: "#FFF3CF", mid: "#E6C27A", lo: "#A8823A" };
}

export function Ring({ style: ringStyle, stone, id, size = 120, sparkle = true, css }: { style: RingStyle; stone: StoneColor; id: string; size?: number; sparkle?: boolean; css?: CSSProperties }) {
  const m = metalFor(stone);
  const s = STONES[stone];
  return (
    <svg viewBox="0 0 120 130" width={size} height={(size * 130) / 120} style={{ display: "block", overflow: "visible", ...css }} aria-hidden>
      <defs>
        <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={m.hi} />
          <stop offset=".45" stopColor={m.mid} />
          <stop offset="1" stopColor={m.lo} />
        </linearGradient>
        <linearGradient id={`${id}-metal2`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={m.hi} />
          <stop offset=".5" stopColor={m.mid} />
          <stop offset="1" stopColor={m.lo} />
        </linearGradient>
        <linearGradient id={`${id}-stone`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={s.a} />
          <stop offset=".55" stopColor={s.b} />
          <stop offset="1" stopColor={s.c} />
        </linearGradient>
        <linearGradient id={`${id}-shine`} x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".9" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fff" stopOpacity=".9" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* the band: back half thinner and darker, front half bright */}
      <ellipse cx={60} cy={86} rx={36} ry={38} fill="none" stroke={m.lo} strokeWidth={6} />
      <path d="M24 86 A36 38 0 0 0 96 86" fill="none" stroke={`url(#${id}-metal)`} strokeWidth={ringStyle === "band" ? 10 : 7} strokeLinecap="round" />
      <path d="M24 86 A36 38 0 0 1 96 86" fill="none" stroke={`url(#${id}-metal2)`} strokeWidth={ringStyle === "band" ? 10 : 6.5} strokeLinecap="round" />
      <path d="M30 98 A32 32 0 0 0 54 120" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth={1.6} strokeLinecap="round" />

      {ringStyle === "band" && (
        <g>
          {Array.from({ length: 7 }, (_, i) => {
            const a = Math.PI + (i + 1) * (Math.PI / 8);
            const x = 60 + Math.cos(a) * 36;
            const y = 86 + Math.sin(a) * 38;
            return <circle key={i} cx={x} cy={y} r={2.6} fill={`url(#${id}-stone)`} stroke="#fff" strokeOpacity=".7" strokeWidth={0.6} />;
          })}
        </g>
      )}

      {ringStyle === "solitaire" && (
        <g>
          {/* collar + four claws */}
          <path d="M42 50 Q60 58 78 50 L72 45 Q60 49 48 45 Z" fill={`url(#${id}-metal)`} />
          <path d="M46 46 L40 26 M74 46 L80 26 M53 48 L50 27 M67 48 L70 27" stroke={`url(#${id}-metal)`} strokeWidth={2.4} strokeLinecap="round" />
          {/* brilliant cut — crown facets, then pavilion to the culet */}
          <g stroke={s.facet} strokeWidth={0.6} strokeLinejoin="round">
            <polygon points="34,28 46,14 47,28" fill={s.b} />
            <polygon points="46,14 60,20 47,28" fill={s.a} />
            <polygon points="46,14 74,14 60,20" fill={s.hi} />
            <polygon points="60,20 74,14 73,28" fill={s.b} />
            <polygon points="47,28 60,20 73,28" fill={s.a} />
            <polygon points="74,14 86,28 73,28" fill={s.c} />
            <polygon points="34,28 47,28 60,54" fill={s.b} />
            <polygon points="47,28 60,28 60,54" fill={s.c} />
            <polygon points="60,28 73,28 60,54" fill={s.a} />
            <polygon points="73,28 86,28 60,54" fill={s.c} />
          </g>
          <clipPath id={`${id}-gem`}>
            <polygon points="34,28 46,14 74,14 86,28 60,54" />
          </clipPath>
          <g clipPath={`url(#${id}-gem)`}>
            <rect x={20} y={8} width={30} height={50} fill={`url(#${id}-shine)`} className={sparkle ? "pd-glint" : undefined} style={{ transformBox: "fill-box", transformOrigin: "center" }} />
          </g>
          <path d="M40 26 L42 29 M80 26 L78 29 M50 27 L51 30 M70 27 L69 30" stroke={m.hi} strokeWidth={2} strokeLinecap="round" />
        </g>
      )}

      {ringStyle === "heart" && (
        <g>
          <path d="M46 50 Q60 58 74 50 L70 45 Q60 49 50 45 Z" fill={`url(#${id}-metal)`} />
          <path d="M60 50 C 40 38 32 26 36 18 C 40 9 54 9 60 18 C 66 9 80 9 84 18 C 88 26 80 38 60 50 Z" fill={s.b} stroke={`url(#${id}-metal)`} strokeWidth={1.6} />
          <clipPath id={`${id}-gem`}>
            <path d="M60 50 C 40 38 32 26 36 18 C 40 9 54 9 60 18 C 66 9 80 9 84 18 C 88 26 80 38 60 50 Z" />
          </clipPath>
          <g clipPath={`url(#${id}-gem)`} stroke={s.facet} strokeWidth={0.6}>
            <polygon points="30,10 60,18 60,30 36,22" fill={s.a} />
            <polygon points="60,18 90,10 84,22 60,30" fill={s.c} />
            <polygon points="36,22 60,30 44,40" fill={s.b} />
            <polygon points="84,22 76,40 60,30" fill={s.c} />
            <polygon points="44,40 60,30 60,52" fill={s.a} />
            <polygon points="60,30 76,40 60,52" fill={s.c} />
            <polygon points="46,16 56,18 54,24 44,22" fill={s.hi} />
            <rect x={20} y={6} width={30} height={50} fill={`url(#${id}-shine)`} className={sparkle ? "pd-glint" : undefined} style={{ transformBox: "fill-box", transformOrigin: "center" }} />
          </g>
        </g>
      )}

      {sparkle && (
        <g>
          <circle cx={ringStyle === "band" ? 60 : 60} cy={ringStyle === "band" ? 50 : 26} r={22} fill={`url(#${id}-glow)`} opacity=".55" />
          {[
            [86, 12, 0],
            [32, 18, 0.6],
            [70, 6, 1.1],
          ].map(([x, y, d], i) => (
            <path
              key={i}
              className="pd-star"
              d={`M${x} ${y - 7} L${x + 1.6} ${y - 1.6} L${x + 7} ${y} L${x + 1.6} ${y + 1.6} L${x} ${y + 7} L${x - 1.6} ${y + 1.6} L${x - 7} ${y} L${x - 1.6} ${y - 1.6} Z`}
              fill="#fff"
              style={{ transformBox: "fill-box", transformOrigin: "center", animationDelay: `${d}s` }}
            />
          ))}
        </g>
      )}
    </svg>
  );
}

/** The same ring as an SVG string (keepsake certificate). */
export function ringDataUrl(ringStyle: RingStyle, stone: StoneColor): string {
  const m = metalFor(stone);
  const s = STONES[stone];
  const grads = `<linearGradient id="m" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${m.hi}"/><stop offset=".45" stop-color="${m.mid}"/><stop offset="1" stop-color="${m.lo}"/></linearGradient><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s.a}"/><stop offset=".55" stop-color="${s.b}"/><stop offset="1" stop-color="${s.c}"/></linearGradient>`;
  const band = `<ellipse cx="60" cy="86" rx="36" ry="38" fill="none" stroke="${m.lo}" stroke-width="6"/><ellipse cx="60" cy="86" rx="36" ry="38" fill="none" stroke="url(#m)" stroke-width="${ringStyle === "band" ? 10 : 7}"/>`;
  const top =
    ringStyle === "solitaire"
      ? `<path d="M44 48 L48 34 M76 48 L72 34 M52 50 L54 32 M68 50 L66 32" stroke="url(#m)" stroke-width="2.6" stroke-linecap="round"/><path d="M42 50 Q60 58 78 50 L72 46 Q60 50 48 46 Z" fill="url(#m)"/><path d="M36 26 L46 14 L74 14 L84 26 L60 52 Z" fill="url(#s)"/><path d="M36 26 L84 26 M46 14 L52 26 L60 14 L68 26 L74 14 M36 26 L60 52 L84 26 M52 26 L60 52 L68 26" fill="none" stroke="${s.facet}" stroke-width=".9"/><path d="M46 14 L74 14 L70 20 L50 20 Z" fill="#fff" fill-opacity=".55"/>`
      : ringStyle === "heart"
        ? `<path d="M46 50 Q60 58 74 50 L70 45 Q60 49 50 45 Z" fill="url(#m)"/><path d="M60 50 C 40 38 32 26 36 18 C 40 9 54 9 60 18 C 66 9 80 9 84 18 C 88 26 80 38 60 50 Z" fill="url(#s)" stroke="url(#m)" stroke-width="1.4"/><path d="M60 18 L60 50 M36 20 L60 30 L84 20 M42 36 L60 30 L78 36" fill="none" stroke="${s.facet}" stroke-width=".9"/>`
        : Array.from({ length: 7 }, (_, i) => {
            const a = Math.PI + (i + 1) * (Math.PI / 8);
            return `<circle cx="${(60 + Math.cos(a) * 36).toFixed(1)}" cy="${(86 + Math.sin(a) * 38).toFixed(1)}" r="2.6" fill="url(#s)"/>`;
          }).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="260" viewBox="0 0 120 130"><defs>${grads}</defs>${band}${top}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
