"use client";

// ─── Endorsements — the identity card ────────────────────────────────────────
//
// Banner, big round photograph hanging half off its bottom edge, name, headline,
// location, buttons. This is the single most recognisable object in the genre,
// and the recogniser is the geometry, not the colour: a wide short banner, a
// circle breaking the seam, and text stacked flush to the left of it.
//
// ── THE BANNER CARRIES NO TEXT ───────────────────────────────────────────────
// Not a name, not a tagline, not a watermark. A banner with words on it reads as
// a marketing header and the page stops looking like a profile. When the sender
// gives us no image we draw an accent-toned gradient and leave it silent.
//
// ── FULL BLEED INSIDE A PADDED CARD ──────────────────────────────────────────
// `Card` from ./theme is 16px padded, which is right for every other section and
// wrong for a banner. Rather than fork the wrapper, the banner cancels the
// padding with a -16px margin and rounds its own top corners to match the 8px
// card radius. One element knows about the exception instead of two components.
//
// ── 32px PILLS, 44px TAPS ────────────────────────────────────────────────────
// The buttons look 32px tall because that is what this genre looks like. The
// <button> around each pill is transparent and 44px tall, so the thumb target is
// honest even though the ink is small.

import type { ReactNode } from "react";

import { Avatar } from "./Avatar";
import { PP, ACCENT_TINT, ACCENT_EDGE, Card } from "./theme";
import type { ProfilePerson } from "./types";

const AVATAR = 152;
const RING = 4;
/** Half the ring's full width — puts the circle's equator on the banner's edge. */
const OVERLAP = (AVATAR + RING * 2) / 2;

/** Silent, accent-toned, and never mistaken for a photograph. */
const FALLBACK_BANNER = `linear-gradient(115deg, ${PP.accent} 0%, #14807E 42%, #B9CCCA 100%)`;

const CONNECT_LABEL = {
  idle: "Connect",
  pending: "Pending",
  connected: "Connected ✓",
} as const;

function Pill(props: {
  children: ReactNode;
  onClick?: () => void;
  filled?: boolean;
  tone: "accent" | "neutral";
  label?: string;
}) {
  const accent = props.tone === "accent";
  return (
    <button
      type="button"
      onClick={props.onClick}
      aria-label={props.label}
      style={{
        display: "inline-flex",
        alignItems: "center",
        minHeight: 44,
        padding: "6px 0",
        margin: 0,
        border: "none",
        background: "transparent",
        cursor: "pointer",
        fontFamily: PP.font,
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          height: 32,
          padding: "0 16px",
          borderRadius: 16,
          fontSize: 14,
          fontWeight: 600,
          whiteSpace: "nowrap",
          background: props.filled ? PP.accent : accent ? ACCENT_TINT : "transparent",
          color: props.filled ? PP.accentInk : accent ? PP.accent : PP.inkSoft,
          border: props.filled ? "1px solid transparent" : `1px solid ${accent ? ACCENT_EDGE : PP.edge}`,
        }}
      >
        {props.children}
      </span>
    </button>
  );
}

export function ProfileCard(props: {
  person: ProfilePerson;
  onConnect: () => void;
  connectState: "idle" | "pending" | "connected";
}) {
  const { person, onConnect, connectState } = props;
  const banner = person.bannerUrl?.trim().replace(/["\\]/g, "");

  return (
    <Card>
      <div
        aria-hidden="true"
        style={{
          margin: "-16px -16px 0",
          aspectRatio: "16 / 5",
          borderRadius: "8px 8px 0 0",
          background: banner ? `url("${banner}") center / cover no-repeat, ${FALLBACK_BANNER}` : FALLBACK_BANNER,
        }}
      />

      <div
        style={{
          width: AVATAR + RING * 2,
          height: AVATAR + RING * 2,
          marginTop: -OVERLAP,
          marginBottom: 8,
          borderRadius: "50%",
          background: PP.card,
          padding: RING,
          boxSizing: "border-box",
          position: "relative",
        }}
      >
        <Avatar name={person.name} src={person.photoUrl} size={AVATAR} />
      </div>

      <h1
        style={{
          margin: 0,
          fontSize: 24,
          lineHeight: "30px",
          fontWeight: 600,
          color: PP.ink,
        }}
      >
        {person.name}
        {person.degreeNote ? (
          <span style={{ fontSize: 14, fontWeight: 400, color: PP.inkSoft, marginLeft: 6, whiteSpace: "nowrap" }}>
            {person.degreeNote}
          </span>
        ) : null}
      </h1>

      <p
        style={{
          margin: "4px 0 0",
          fontSize: 16,
          lineHeight: "20px",
          color: PP.ink,
          display: "-webkit-box",
          WebkitBoxOrient: "vertical" as const,
          WebkitLineClamp: 2,
          overflow: "hidden",
        }}
      >
        {person.headline}
      </p>

      <p style={{ margin: "6px 0 0", fontSize: 14, lineHeight: "18px", color: PP.inkSoft }}>
        {person.location}
        {person.connections ? (
          <>
            {" · "}
            <span style={{ color: PP.accent, fontWeight: 600 }}>{person.connections}</span>
          </>
        ) : null}
      </p>

      {person.openTo ? (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 8,
            background: ACCENT_TINT,
            border: `1px solid ${ACCENT_EDGE}`,
          }}
        >
          <p style={{ margin: 0, fontSize: 14, lineHeight: "18px", fontWeight: 600, color: PP.ink }}>Open to</p>
          <p style={{ margin: "2px 0 0", fontSize: 14, lineHeight: "18px", color: PP.inkSoft }}>{person.openTo}</p>
        </div>
      ) : null}

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 6 }}>
        <Pill onClick={onConnect} tone="accent" filled={connectState === "idle"}>
          <span aria-live="polite">{CONNECT_LABEL[connectState]}</span>
        </Pill>
        <Pill tone="accent">Message</Pill>
        <Pill tone="neutral" label="More actions">
          More
        </Pill>
      </div>
    </Card>
  );
}
