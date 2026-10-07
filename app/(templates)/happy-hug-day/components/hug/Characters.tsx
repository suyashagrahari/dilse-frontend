"use client";

// The two chubby huggers (bear / bunny / cat / panda), hand-drawn in SVG.
// Each character is split in two layers so a hug can wrap: <Critter layer="body">
// draws the body + face, <Critter layer="arms"> draws the arms — the stage
// paints both bodies first and both arm layers on top, so reaching arms go
// around the partner. Local coords: origin = bottom centre, body ≈ 104×130.

import { motion } from "framer-motion";
import type { HugExtras } from "../../../_valentine/days/happy-hug-day";
import { H } from "./ui";

export type Species = "bear" | "bunny" | "cat" | "panda";

const LOOK: Record<Species, { body: string; belly: string; inner: string; dark: string }> = {
  bear: { body: "#C98E5C", belly: "#EBC9A3", inner: "#F4C9A8", dark: "#C98E5C" },
  bunny: { body: "#FFF8F3", belly: "#FFE7EE", inner: "#FFB3C7", dark: "#FFF8F3" },
  cat: { body: "#F7C28E", belly: "#FFE7CF", inner: "#FFB3C7", dark: "#E9A267" },
  panda: { body: "#FFFFFF", belly: "#F3F1EE", inner: "#3B3A36", dark: "#3B3A36" },
};

export function pairOf(c: HugExtras["characters"] | undefined): [Species, Species] {
  switch (c) {
    case "bear-bear":
      return ["bear", "bear"];
    case "cat-cat":
      return ["cat", "cat"];
    case "panda-bear":
      return ["panda", "bear"];
    default:
      return ["bear", "bunny"];
  }
}

const INK = H.cocoa;
const BODY = "M-50 -50 C-53 -100 -30 -128 0 -128 C30 -128 53 -100 50 -50 C49 -16 33 0 0 0 C-33 0 -49 -16 -50 -50 Z";

export interface CritterPose {
  /** 0–1: how hard they're being squished. */
  squish?: number;
  /** Arms wrapped around the partner. */
  hugging?: boolean;
  /** How far the hugging arm reaches (viewBox units, toward +x). */
  reach?: number;
  /** Eyes closed, sleepy. */
  sleepy?: boolean;
  /** ^^ happy eyes. */
  happy?: boolean;
  /** Move the hugging arms down (back hug: round the tummy, not the face). */
  armDrop?: number;
}

export function Critter({ species, layer, pose = {}, alt = false }: { species: Species; layer: "body" | "arms"; pose?: CritterPose; alt?: boolean }) {
  const L = LOOK[species];
  // two of the same species: tint the second one so they read as two
  const body = alt ? (species === "bear" ? "#B07A4C" : species === "cat" ? "#EEC9A8" : species === "bunny" ? "#FFEFF4" : L.body) : L.body;
  const sq = pose.squish ?? 0;
  const reach = pose.reach ?? 78;

  if (layer === "arms") {
    const armFill = species === "panda" ? L.dark : body;
    if (pose.hugging && pose.armDrop) {
      // back hug: only two paws peek round the partner's tummy
      return (
        <g transform={`translate(0 ${pose.armDrop})`}>
          {[
            [reach, -62],
            [reach + 6, -42],
          ].map(([px, py], i) => (
            <g key={i}>
              <ellipse cx={px} cy={py} rx="11" ry="8.5" fill={armFill} stroke={INK} strokeWidth="3" />
              <path d={`M${px + 2} ${py - 5} v6 M${px + 7} ${py - 4} v5`} stroke={INK} strokeWidth="1.6" strokeLinecap="round" opacity=".5" />
            </g>
          ))}
        </g>
      );
    }
    if (pose.hugging) {
      return (
        <g>
          {/* the reaching arm, around the partner's back */}
          <path d={`M30 -66 C${30 + reach * 0.45} -84 ${reach - 4} -78 ${reach} -56`} fill="none" stroke={INK} strokeWidth="18" strokeLinecap="round" />
          <path d={`M30 -66 C${30 + reach * 0.45} -84 ${reach - 4} -78 ${reach} -56`} fill="none" stroke={armFill} strokeWidth="12.5" strokeLinecap="round" />
          <path d={`M28 -44 C${28 + reach * 0.45} -54 ${reach - 10} -46 ${reach - 6} -30`} fill="none" stroke={INK} strokeWidth="17" strokeLinecap="round" />
          <path d={`M28 -44 C${28 + reach * 0.45} -54 ${reach - 10} -46 ${reach - 6} -30`} fill="none" stroke={armFill} strokeWidth="11.5" strokeLinecap="round" />
        </g>
      );
    }
    return (
      <g>
        <path d="M-46 -60 Q-62 -50 -58 -34" fill="none" stroke={INK} strokeWidth="17" strokeLinecap="round" />
        <path d="M-46 -60 Q-62 -50 -58 -34" fill="none" stroke={armFill} strokeWidth="11.5" strokeLinecap="round" />
        <path d="M46 -60 Q62 -50 58 -34" fill="none" stroke={INK} strokeWidth="17" strokeLinecap="round" />
        <path d="M46 -60 Q62 -50 58 -34" fill="none" stroke={armFill} strokeWidth="11.5" strokeLinecap="round" />
      </g>
    );
  }

  const happy = pose.happy || pose.hugging;
  return (
    <g transform={`scale(${1 + 0.16 * sq} ${1 - 0.13 * sq})`}>
      {/* ears (behind the head) */}
      {species === "bear" && (
        <g>
          <circle cx="-34" cy="-112" r="16" fill={body} stroke={INK} strokeWidth="3.5" />
          <circle cx="34" cy="-112" r="16" fill={body} stroke={INK} strokeWidth="3.5" />
          <circle cx="-34" cy="-112" r="8" fill={L.inner} />
          <circle cx="34" cy="-112" r="8" fill={L.inner} />
        </g>
      )}
      {species === "panda" && (
        <g>
          <circle cx="-34" cy="-112" r="16" fill={L.dark} stroke={INK} strokeWidth="3" />
          <circle cx="34" cy="-112" r="16" fill={L.dark} stroke={INK} strokeWidth="3" />
        </g>
      )}
      {species === "bunny" && (
        <g>
          <g transform="rotate(-14 -18 -120)">
            <ellipse cx="-18" cy="-150" rx="13" ry="34" fill={body} stroke={INK} strokeWidth="3.5" />
            <ellipse cx="-18" cy="-148" rx="6" ry="24" fill={L.inner} />
          </g>
          <g transform="rotate(16 18 -120)">
            <ellipse cx="18" cy="-150" rx="13" ry="34" fill={body} stroke={INK} strokeWidth="3.5" />
            <ellipse cx="18" cy="-148" rx="6" ry="24" fill={L.inner} />
          </g>
        </g>
      )}
      {species === "cat" && (
        <g>
          <path d="M-46 -96 L-40 -140 L-12 -122 Z" fill={body} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M46 -96 L40 -140 L12 -122 Z" fill={body} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M-38 -108 L-36 -128 L-22 -120 Z" fill={L.inner} />
          <path d="M38 -108 L36 -128 L22 -120 Z" fill={L.inner} />
        </g>
      )}

      {/* feet */}
      <ellipse cx="-22" cy="-3" rx="15" ry="8.5" fill={species === "panda" ? L.dark : body} stroke={INK} strokeWidth="3" />
      <ellipse cx="22" cy="-3" rx="15" ry="8.5" fill={species === "panda" ? L.dark : body} stroke={INK} strokeWidth="3" />
      {/* body */}
      <path d={BODY} fill={body} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      <ellipse cx="0" cy="-34" rx="30" ry="23" fill={L.belly} />
      {species === "cat" && <path d="M-8 -126 v10 M0 -128 v12 M8 -126 v10" stroke={L.dark} strokeWidth="3.5" strokeLinecap="round" />}
      <path d="M-30 -112 C-20 -122 -6 -124 4 -122" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="4" strokeLinecap="round" />

      {/* face */}
      {species === "panda" && (
        <g fill={L.dark}>
          <ellipse cx="-18" cy="-80" rx="11" ry="13" transform="rotate(-20 -18 -80)" />
          <ellipse cx="18" cy="-80" rx="11" ry="13" transform="rotate(20 18 -80)" />
        </g>
      )}
      {species === "bear" && <ellipse cx="0" cy="-66" rx="15" ry="11" fill={L.belly} />}
      {pose.sleepy ? (
        <g fill="none" stroke={species === "panda" ? "#fff" : "#3B2A22"} strokeWidth="3" strokeLinecap="round">
          <path d="M-23 -79 q6 5 12 0" />
          <path d="M11 -79 q6 5 12 0" />
        </g>
      ) : happy ? (
        <g fill="none" stroke={species === "panda" ? "#fff" : "#3B2A22"} strokeWidth="3.2" strokeLinecap="round">
          <path d="M-23 -78 q6 -8 12 0" />
          <path d="M11 -78 q6 -8 12 0" />
        </g>
      ) : (
        <g>
          <circle cx="-17" cy="-80" r="5.5" fill={species === "panda" ? "#fff" : "#3B2A22"} />
          <circle cx="17" cy="-80" r="5.5" fill={species === "panda" ? "#fff" : "#3B2A22"} />
          <circle cx="-15.5" cy="-82" r="1.8" fill={species === "panda" ? "#3B2A22" : "#fff"} />
          <circle cx="18.5" cy="-82" r="1.8" fill={species === "panda" ? "#3B2A22" : "#fff"} />
        </g>
      )}
      <ellipse cx="-30" cy="-66" rx="9" ry="5.5" fill={H.strawberry} opacity={0.45 + (happy ? 0.35 : 0) + sq * 0.2} />
      <ellipse cx="30" cy="-66" rx="9" ry="5.5" fill={H.strawberry} opacity={0.45 + (happy ? 0.35 : 0) + sq * 0.2} />
      {species === "bear" || species === "panda" ? <ellipse cx="0" cy="-71" rx="4.5" ry="3.2" fill="#3B2A22" /> : <path d="M-3 -72 h6 l-3 3.5 z" fill={L.inner === "#3B3A36" ? "#3B2A22" : "#E76F8E"} />}
      <path d={sq > 0.6 || pose.hugging ? "M-6 -65 q6 6 12 0" : "M-7 -65 q3.5 4 7 0 q3.5 4 7 0"} fill="none" stroke="#3B2A22" strokeWidth="2.4" strokeLinecap="round" />
      {species === "cat" && (
        <g stroke="#3B2A22" strokeWidth="1.6" strokeLinecap="round" opacity=".6">
          <path d="M-40 -70 h-14 M-40 -64 l-13 4 M40 -70 h14 M40 -64 l13 4" />
        </g>
      )}
    </g>
  );
}

/** A tag that dangles under a character. */
export function NameTag({ text, x, y, color = H.butter }: { text: string; x: number; y: number; color?: string }) {
  if (!text) return null;
  const w = Math.max(40, Math.min(96, text.length * 8.4 + 18));
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-w / 2} y="0" width={w} height="20" rx="10" fill={color} stroke={H.cocoa} strokeWidth="2" />
      <text x="0" y="14.5" textAnchor="middle" style={{ font: "700 11.5px var(--font-fredoka), Fredoka, system-ui, sans-serif" }} fill={H.cocoa}>
        {text.length > 11 ? `${text.slice(0, 10)}…` : text}
      </text>
    </g>
  );
}

/**
 * Two critters in one <g>, already laid out: left at `lx`, right at `rx`
 * (bottom-centre x), both standing on y = `ground`. The right one is
 * mirrored. `back` puts the LEFT one behind the right (back hug).
 */
export function Pair({
  species,
  lx,
  rx,
  ground = 220,
  left = {},
  right = {},
  back = false,
  leftRot = 0,
  rightRot = 0,
  leftY = 0,
}: {
  species: [Species, Species];
  lx: number;
  rx: number;
  ground?: number;
  left?: CritterPose;
  right?: CritterPose;
  back?: boolean;
  leftRot?: number;
  rightRot?: number;
  /** Lift the left one (peeking over a shoulder in a back hug). */
  leftY?: number;
}) {
  const same = species[0] === species[1];
  const L = (layer: "body" | "arms") => (
    <g transform={`translate(${lx} ${ground + leftY}) rotate(${leftRot})`}>
      <Critter species={species[0]} layer={layer} pose={left} />
    </g>
  );
  const R = (layer: "body" | "arms") => (
    <g transform={`translate(${rx} ${ground}) scale(-1 1) rotate(${rightRot})`}>
      <Critter species={species[1]} layer={layer} pose={right} alt={same} />
    </g>
  );
  return back ? (
    <g>
      {L("body")}
      {L("arms")}
      {R("body")}
      {R("arms")}
    </g>
  ) : (
    <g>
      {L("body")}
      {R("body")}
      {L("arms")}
      {R("arms")}
    </g>
  );
}

/** Floating heart puffs rising from a point. */
export function HeartPuffs({ x, y, n = 5, on }: { x: number; y: number; n?: number; on: boolean }) {
  if (!on) return null;
  return (
    <g>
      {Array.from({ length: n }, (_, k) => (
        <motion.path
          key={k}
          d="M0 6 C-8 0 -8 -6 -4 -7 C-2 -7.5 0 -6 0 -4.5 C0 -6 2 -7.5 4 -7 C8 -6 8 0 0 6 Z"
          fill={k % 2 ? H.strawberry : H.cheek}
          initial={{ x, y, opacity: 0, scale: 0.4 }}
          animate={{ x: x + (k - n / 2) * 16, y: y - 70 - k * 8, opacity: [0, 1, 0], scale: [0.4, 1.3, 1] }}
          transition={{ duration: 1.6, delay: k * 0.18, repeat: Infinity, repeatDelay: 0.6 }}
        />
      ))}
    </g>
  );
}
