"use client";

// ─── Capsule — the object ────────────────────────────────────────────────────
//
// The thing on the waiting screen has to be worth revisiting for a year, so it
// is drawn as an OBJECT and not a card: a real canister — domed lid, a rolled
// rim with rivets, a paper label tied round the middle — in whatever metal the
// theme is made of (brass, liquid chrome, verdigris copper, pewter), with the
// wax seal pressed across the seam where the lid meets the body. Breaking the
// seal is what lets the lid come off.
//
// `wearFor` drives what it looks like as the date approaches. That progression
// is the only reason to come back before the day, so it has to be visible:
//   30 days → a fine crack in the wax
//    7 days → a warm glow behind the canister
//    1 day  → it trembles once on load (one-shot, never a loop)

import { MONO, PALETTE, SERIF, type CapsuleWear } from "./types";
import { PaperTexture, WaxSeal, type SealState } from "./paper";
import { seededSpread } from "@/lib/seededRandom";

const SEAL_STATE: Record<CapsuleWear, SealState> = {
  fresh: "whole",
  cracking: "cracked",
  glowing: "glowing",
  trembling: "glowing",
  ready: "glowing",
};

const metal = (angle = 90) =>
  `linear-gradient(${angle}deg, ${PALETTE.metalLo} 0%, ${PALETTE.metal} 13%, ${PALETTE.metalHi} 31%, ${PALETTE.metal} 50%, ${PALETTE.metalLo} 82%, ${PALETTE.metal} 100%)`;

export default function CapsuleObject({
  seed,
  wear,
  initials,
  width = 232,
  splitPx = 0,
  pressing = false,
  reduced = false,
  names,
  dateLabel,
}: {
  seed: string;
  wear: CapsuleWear;
  /** Two letters pressed into the wax. */
  initials: string;
  width?: number;
  /** Drives the seal halves apart — and the lid off — during the crack. */
  splitPx?: number;
  /** Replays the seal press. One-shot. */
  pressing?: boolean;
  reduced?: boolean;
  /** Written on the label. Optional — the label says "do not open" without. */
  names?: string;
  dateLabel?: string;
}) {
  const tilt = -2 + seededSpread(seed, "tilt", 1.4);
  const W = width;
  const H = Math.round(W * 1.46);
  const lidH = Math.round(H * 0.27);
  const rimH = Math.max(10, Math.round(W * 0.055));
  const seal = Math.round(W * 0.36);
  const trembling = wear === "trembling" && !reduced;
  const glowing = wear === "glowing" || wear === "trembling" || wear === "ready";
  const lift = splitPx > 0 ? splitPx * 1.5 : 0;
  const labelW = Math.round(W * 0.74);
  const small = W < 200;

  return (
    <div
      className={trembling ? "capsule-tremble" : undefined}
      style={{ transform: trembling ? undefined : `rotate(${tilt.toFixed(2)}deg)`, width: W, height: H, position: "relative" }}
    >
      {/* The glow as the day approaches. */}
      {glowing && (
        <div
          aria-hidden
          className={reduced ? undefined : "cp-glow"}
          style={{
            position: "absolute",
            inset: `-${Math.round(W * 0.22)}px`,
            borderRadius: "50%",
            background: "radial-gradient(closest-side, color-mix(in srgb, var(--lv-a3) 55%, transparent), transparent 75%)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Floor shadow. */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: "12%",
          right: "12%",
          bottom: -Math.round(W * 0.07),
          height: Math.round(W * 0.1),
          borderRadius: "50%",
          background: "radial-gradient(closest-side, rgba(0,0,0,.34), transparent)",
        }}
      />

      {/* BODY */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: lidH + rimH - 2,
          bottom: 0,
          borderRadius: `12px 12px ${W / 2}px ${W / 2}px / 12px 12px ${Math.round(W * 0.26)}px ${Math.round(W * 0.26)}px`,
          background: metal(),
          boxShadow: "inset 0 -14px 24px -12px rgba(0,0,0,.45), inset 0 10px 18px -12px rgba(255,255,255,.5)",
          overflow: "hidden",
        }}
      >
        {/* Rolled ridges. */}
        {[0.1, 0.84].map((t) => (
          <div
            key={t}
            style={{ position: "absolute", left: 0, right: 0, top: `${t * 100}%`, height: 5, background: "linear-gradient(180deg, rgba(0,0,0,.22), rgba(255,255,255,.35) 60%, transparent)" }}
          />
        ))}
        {!reduced && <span className="cp-sheen" />}
      </div>

      {/* The label, tied round the middle. */}
      <div
        style={{
          position: "absolute",
          left: (W - labelW) / 2,
          width: labelW,
          top: lidH + rimH + Math.round(H * 0.13),
          transform: "rotate(-1.4deg)",
          background: PALETTE.paper,
          color: PALETTE.ink,
          borderRadius: 4,
          padding: small ? "10px 8px 9px" : "14px 12px 12px",
          textAlign: "center",
          boxShadow: "0 8px 16px -10px rgba(0,0,0,.55), 0 0 0 1px rgba(0,0,0,.06)",
          overflow: "hidden",
        }}
      >
        <PaperTexture seed={`${seed}-label`} opacity={0.08} />
        <p style={{ position: "relative", margin: 0, fontFamily: MONO, fontSize: small ? 8 : 9, letterSpacing: 2.5, color: PALETTE.inkSoft }}>TIME CAPSULE</p>
        <p
          style={{
            position: "relative",
            margin: "4px 0 0",
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: small ? 15 : Math.round(W * 0.09),
            lineHeight: 1.08,
            color: PALETTE.ink,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {names || "do not open"}
        </p>
        <div style={{ position: "relative", height: 1, background: PALETTE.edge, margin: small ? "7px 6px" : "9px 8px" }} />
        <p style={{ position: "relative", margin: 0, fontFamily: MONO, fontSize: small ? 7.5 : 8.5, letterSpacing: 1.6, color: PALETTE.inkSoft }}>
          {dateLabel ? "DO NOT OPEN UNTIL" : "SEALED"}
        </p>
        {dateLabel && (
          <p style={{ position: "relative", margin: "2px 0 0", fontFamily: MONO, fontWeight: 700, fontSize: small ? 11 : 13, color: PALETTE.wax }}>{dateLabel}</p>
        )}
      </div>

      {/* LID + RIM — lifts off once the seal has split. */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: lidH + rimH,
          transform: `translateY(${-lift}px) rotate(${(-lift * 0.08).toFixed(2)}deg)`,
          transformOrigin: "20% 100%",
          transition: "transform 1100ms cubic-bezier(.2,.7,.2,1)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: Math.round(W * 0.02),
            right: Math.round(W * 0.02),
            top: 0,
            height: lidH,
            borderRadius: `${W / 2}px ${W / 2}px 8px 8px / ${Math.round(W * 0.34)}px ${Math.round(W * 0.34)}px 8px 8px`,
            background: metal(),
            boxShadow: "inset 0 12px 18px -10px rgba(255,255,255,.55), inset 0 -8px 14px -8px rgba(0,0,0,.35)",
            overflow: "hidden",
          }}
        >
          {/* The knob. */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: Math.round(lidH * 0.16),
              width: Math.round(W * 0.2),
              height: Math.round(W * 0.05),
              marginLeft: -Math.round(W * 0.1),
              borderRadius: 99,
              background: "linear-gradient(180deg, rgba(255,255,255,.55), rgba(0,0,0,.25))",
            }}
          />
        </div>
        {/* Rim, with rivets. */}
        <div
          style={{
            position: "absolute",
            left: -3,
            right: -3,
            top: lidH - 2,
            height: rimH,
            borderRadius: 6,
            background: metal(),
            boxShadow: "0 3px 6px -2px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.6), inset 0 -2px 3px rgba(0,0,0,.3)",
          }}
        >
          {[0.08, 0.26, 0.74, 0.92].map((x) => (
            <span
              key={x}
              style={{
                position: "absolute",
                left: `${x * 100}%`,
                top: "50%",
                width: 5,
                height: 5,
                margin: "-2.5px 0 0 -2.5px",
                borderRadius: "50%",
                background: `radial-gradient(circle at 35% 30%, ${PALETTE.metalHi}, ${PALETTE.metalLo})`,
              }}
            />
          ))}
        </div>
      </div>

      {/* The seal, across the seam. */}
      <div style={{ position: "absolute", left: (W - seal) / 2, top: lidH + rimH / 2 - seal / 2, width: seal, height: seal }}>
        <div className={pressing && !reduced ? "capsule-press" : undefined}>
          <WaxSeal seed={`${seed}-wax`} size={seal} state={splitPx > 0 ? "split" : SEAL_STATE[wear]} initials={initials} splitPx={splitPx} />
        </div>
      </div>
    </div>
  );
}
