"use client";

// "The Hug Passport" art: the die-cut GIF sticker frames, doodles and washi, the inked rubber stamps, the passport
// cover (the gate), the stamp bar that rides at the top of every scene, souvenir polaroids, the bear with open arms,
// and the long-distance phones. The huggers themselves are the $2 Hug Day's hand-drawn critters
// (../../../happy-hug-day/components/hug/Characters), so the premium page is visibly the same family, only bigger.

import { useMemo, type CSSProperties, type ReactNode } from "react";
import { CroppedPhoto, Sticker } from "../../../_valentine/kit";
import type { DayConfig } from "../../../_valentine/types";
import type { LovePhoto } from "../../../_love/types";
import { Critter, Pair, type Species } from "../../../happy-hug-day/components/hug/Characters";
import { stampSvg } from "./stamps";
import { ALL_STAMPS, STAMP, type StampKind } from "./util";

// ─── Stickers ───────────────────────────────────────────────────────────────

/** A die-cut sticker frame (white outline + soft peach shadow) for one of OUR fixed GIFs. Fixed box, lazy. */
export function Gif({ src, size, className, style, eager, tilt = 0 }: { src: string; size: number; className?: string; style?: CSSProperties; eager?: boolean; tilt?: number }) {
  return (
    <span className={`hp-sticker${className ? ` ${className}` : ""}`} style={{ width: size, height: size, ["--tilt" as string]: `${tilt}deg`, ...style }} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" width={size} height={size} loading={eager ? "eager" : "lazy"} decoding="async" draggable={false} />
    </span>
  );
}

/** One of the editable GIF slots, in the same die-cut frame ("none" hides it). */
export function Slot({ day, gifs, id, size, className, style, eager, tilt = 0 }: { day: DayConfig; gifs?: Record<string, string>; id: string; size: number; className?: string; style?: CSSProperties; eager?: boolean; tilt?: number }) {
  const slot = day.gifSlots.find((s) => s.id === id);
  if (!slot || gifs?.[id] === "none") return null;
  return (
    <span className={`hp-sticker${className ? ` ${className}` : ""}`} style={{ width: size, height: size, ["--tilt" as string]: `${tilt}deg`, ...style }}>
      <Sticker slug={day.slug} slot={slot} value={gifs?.[id]} size={size} alt="" eager={eager} />
    </span>
  );
}

// ─── Doodles ────────────────────────────────────────────────────────────────

export function Sparkle({ size = 18, color = "#FF8A6B", style, className }: { size?: number; color?: string; style?: CSSProperties; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="-10 -10 20 20" style={style} aria-hidden>
      <path d="M0 -9 C 1 -3 3 -1 9 0 C 3 1 1 3 0 9 C -1 3 -3 1 -9 0 C -3 -1 -1 -3 0 -9 Z" fill={color} />
    </svg>
  );
}

export function Washi({ color = "rgba(159,229,200,.75)", style, className }: { color?: string; style?: CSSProperties; className?: string }) {
  return <span className={`hp-washi${className ? ` ${className}` : ""}`} style={{ ["--washi" as string]: color, ...style }} aria-hidden />;
}

export function HeartPath({ size = 20, color = "#FF7AA2", style, className }: { size?: number; color?: string; style?: CSSProperties; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="-10 -10 20 20" style={style} aria-hidden>
      <path d="M0 8 C-11 0 -11 -8 -5 -9 C-2.4 -9.6 0 -7.6 0 -5.6 C0 -7.6 2.4 -9.6 5 -9 C11 -8 11 0 0 8 Z" fill={color} />
    </svg>
  );
}

// ─── Stamps ─────────────────────────────────────────────────────────────────

/** An inked rubber stamp (inline SVG so it prints in the page's own Fredoka). */
export function InkStamp({ kind, size, date, top, uid, className, style }: { kind: StampKind; size: number; date: string; top?: string; uid: string; className?: string; style?: CSSProperties }) {
  const html = useMemo(() => stampSvg(kind, { uid, date, top }), [kind, uid, date, top]);
  return <span className={`hp-ink${className ? ` ${className}` : ""}`} style={{ width: size, height: size, ...style }} aria-hidden dangerouslySetInnerHTML={{ __html: html }} />;
}

/** The stamp bar at the top of every scene: a tiny passport and six stamp circles that fill as she collects them. */
export function StampBar({ got, now }: { got: ReadonlySet<StampKind>; now?: StampKind }) {
  const n = ALL_STAMPS.filter((k) => got.has(k)).length;
  return (
    <div className="hp-bar" role="img" aria-label={`Hug passport: ${n} of ${ALL_STAMPS.length} stamps`}>
      <span className="hp-barBook" aria-hidden>
        <i />
      </span>
      {ALL_STAMPS.map((k) => (
        <span key={k} className={`hp-barDot${got.has(k) ? " is-got" : ""}${now === k ? " is-now" : ""}`} style={{ ["--ink" as string]: STAMP[k].ink }} aria-hidden>
          {got.has(k) ? STAMP[k].emoji : ""}
        </span>
      ))}
    </div>
  );
}

// ─── Photos ─────────────────────────────────────────────────────────────────

export function Polaroid({ photo, caption, rot = -4, className, style, eager }: { photo: LovePhoto; caption?: string; rot?: number; className?: string; style?: CSSProperties; eager?: boolean }) {
  return (
    <figure className={`hp-pol${className ? ` ${className}` : ""}`} style={{ ["--rot" as string]: `${rot}deg`, ...style }}>
      <Washi className="hp-polTape" />
      <span className="hp-polImg">
        <CroppedPhoto photo={photo} alt={photo.caption ?? ""} eager={eager} />
      </span>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

// ─── Characters ─────────────────────────────────────────────────────────────

const INK = "#6B4232";
const LOOK: Record<Species, string> = { bear: "#C98E5C", bunny: "#FFF8F3", cat: "#F7C28E", panda: "#3B3A36" };

/** One critter with its arms thrown wide open ("come here"), in a 240×250 box. */
export function OpenArms({ species = "bear", className }: { species?: Species; className?: string }) {
  const arm = LOOK[species];
  return (
    <svg className={className} viewBox="-120 -200 240 250" width="100%" height="100%" aria-hidden style={{ overflow: "visible" }}>
      <ellipse cx="0" cy="2" rx="70" ry="9" fill="rgba(224,96,63,.16)" />
      <g className="hp-armL">
        <path d="M-40 -62 C-62 -76 -80 -96 -88 -118" fill="none" stroke={INK} strokeWidth="18" strokeLinecap="round" />
        <path d="M-40 -62 C-62 -76 -80 -96 -88 -118" fill="none" stroke={arm} strokeWidth="12.5" strokeLinecap="round" />
      </g>
      <g className="hp-armR">
        <path d="M40 -62 C62 -76 80 -96 88 -118" fill="none" stroke={INK} strokeWidth="18" strokeLinecap="round" />
        <path d="M40 -62 C62 -76 80 -96 88 -118" fill="none" stroke={arm} strokeWidth="12.5" strokeLinecap="round" />
      </g>
      <Critter species={species} layer="body" pose={{ happy: true }} />
    </svg>
  );
}

/** Two critters already hugging, small, for emblems and the reply card. */
export function HugEmblem({ species, size = 120, className }: { species: [Species, Species]; size?: number; className?: string }) {
  return (
    <svg className={className} viewBox="40 60 280 200" width={size} height={(size * 200) / 280} aria-hidden style={{ overflow: "visible" }}>
      <Pair species={species} lx={146} rx={214} ground={236} left={{ hugging: true, reach: 60, happy: true }} right={{ hugging: true, reach: 60, happy: true }} />
    </svg>
  );
}

// ─── The passport cover (gate) ──────────────────────────────────────────────

export function PassportCover({ name, species, opening, peek }: { name: string; species: [Species, Species]; opening: string; peek?: ReactNode }) {
  const short = name.length > 12 ? `${name.slice(0, 11)}…` : name;
  return (
    <span className="hp-cover">
      <span className="hp-coverBubble">{opening}</span>
      <span className="hp-coverBear">
        <OpenArms species={species[0]} />
      </span>
      <span className="hp-coverBook">
        <svg viewBox="0 0 200 270" width="100%" height="100%" aria-hidden>
          <defs>
            <linearGradient id="hpc-b" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#FF9C7E" />
              <stop offset="1" stopColor="#E9674A" />
            </linearGradient>
            <pattern id="hpc-g" width="16" height="16" patternUnits="userSpaceOnUse">
              <circle cx="8" cy="8" r="6.5" fill="none" stroke="rgba(255,253,249,.13)" strokeWidth="1.2" />
            </pattern>
          </defs>
          <rect x="6" y="6" width="188" height="258" rx="16" fill="url(#hpc-b)" stroke="#fff" strokeWidth="5" />
          <rect x="6" y="6" width="188" height="258" rx="16" fill="url(#hpc-g)" />
          <rect x="6" y="6" width="16" height="258" rx="8" fill="rgba(122,40,20,.16)" />
          <text x="104" y="44" textAnchor="middle" fontFamily="var(--font-fredoka), Fredoka, sans-serif" fontWeight={700} fontSize="11" letterSpacing="3" fill="#FFF4E6">
            REPUBLIC OF US
          </text>
          <circle cx="104" cy="118" r="52" fill="#FFF4E6" stroke="#FFD3B8" strokeWidth="4" />
          <circle cx="104" cy="118" r="44" fill="none" stroke="#FF8A6B" strokeWidth="1.6" strokeDasharray="3 4" />
          <g transform="translate(104 118) scale(.36) translate(-180 -170)">
            <Pair species={species} lx={146} rx={214} ground={236} left={{ hugging: true, reach: 60, happy: true }} right={{ hugging: true, reach: 60, happy: true }} />
          </g>
          <text x="104" y="198" textAnchor="middle" fontFamily="var(--font-fredoka), Fredoka, sans-serif" fontWeight={700} fontSize="19" letterSpacing="1.5" fill="#FFFDF9">
            HUG PASSPORT
          </text>
          <text x="104" y="236" textAnchor="middle" fontFamily="var(--hp-hand), Caveat, cursive" fontWeight={700} fontSize="24" fill="#FFF4E6">
            {short}
          </text>
          <rect x="70" y="248" width="68" height="4" rx="2" fill="rgba(255,253,249,.5)" />
        </svg>
      </span>
      {peek && <span className="hp-coverPeek">{peek}</span>}
    </span>
  );
}

// ─── Long-distance phones ───────────────────────────────────────────────────

export function Phone({ species, alt, name, children, className, style }: { species: Species; alt?: boolean; name: string; children?: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <span className={`hp-phone${className ? ` ${className}` : ""}`} style={style}>
      <span className="hp-phoneScreen">
        <svg viewBox="-70 -150 140 160" width="100%" height="100%" aria-hidden style={{ overflow: "visible" }}>
          <g transform={alt ? "scale(-1 1)" : undefined}>
            <Critter species={species} layer="body" pose={{}} alt={alt} />
            <Critter species={species} layer="arms" pose={{}} alt={alt} />
          </g>
        </svg>
        {children}
      </span>
      <span className="hp-phoneName">{name}</span>
    </span>
  );
}
