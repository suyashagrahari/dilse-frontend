"use client";

// ─── Endorsements — the top bar ──────────────────────────────────────────────
//
// The strip of chrome that sells the whole illusion. It is 52px of white with a
// hairline underneath, and it must look like something you scroll past without
// reading — the moment it gets interesting, the reader looks at the frame
// instead of the joke sitting inside it.
//
// ── BRAND ────────────────────────────────────────────────────────────────────
// The wordmark is the SENDER'S own name plus a two-circle line-art mark drawn
// here from scratch. No borrowed square, no borrowed blue, no borrowed name.
//
// ── THE NAV IS SCENERY, NOT CONTROLS ─────────────────────────────────────────
// The four glyphs on the right are spans, not buttons. Every one of them would
// be a dead link — a nav full of things that visibly do nothing is worse than a
// nav that never invited the tap. "Me" carries `aria-current` and the accent
// underline because it is the page you are already on, which is also the only
// honest reason for one of four tabs to be lit.
//
// The search field IS real (you can type in it), so it gets a real 44px hit
// area: the visible pill is the specified 34px, and the label wrapping it is
// tall enough to focus the input from anywhere in the row.

import { PP } from "./theme";

const BAR_H = 52;

/** Two overlapping rings — the mark. Deliberately plain, deliberately ours. */
function Mark() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flex: "none" }}>
      <circle cx="9" cy="12" r="6" stroke={PP.accent} strokeWidth="1.6" />
      <circle cx="15" cy="12" r="6" stroke={PP.accent} strokeWidth="1.6" />
    </svg>
  );
}

function IconHome() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-9.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function IconNetwork() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9" cy="8.5" r="3.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 19c0-3 2.5-4.8 5.5-4.8s5.5 1.8 5.5 4.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M16 6.2a3 3 0 0 1 0 5.6M18 14.6c1.7.7 2.8 2.1 2.8 4.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconJobs() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="7.5" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 7.5V6a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 6v1.5M3 12.5h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconMe() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6.5 19c.8-2.5 3-3.8 5.5-3.8s4.7 1.3 5.5 3.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

const NAV = [
  { label: "Home", icon: <IconHome /> },
  { label: "My Network", icon: <IconNetwork /> },
  { label: "Jobs", icon: <IconJobs /> },
  { label: "Me", icon: <IconMe /> },
] as const;

/** The one lit tab. It is the page you are on, so it is the only honest one. */
const ACTIVE = "Me";

export function TopBar(props: { brandName: string }) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        boxSizing: "border-box",
        height: BAR_H,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "0 12px",
        background: PP.card,
        borderBottom: `1px solid ${PP.edge}`,
        fontFamily: PP.font,
        color: PP.ink,
      }}
    >
      {/* Wordmark. Truncates rather than shoving the nav off a 380px screen. */}
      <span style={{ display: "flex", alignItems: "center", gap: 6, flex: "none", minWidth: 0 }}>
        <Mark />
        <span
          style={{
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: -0.2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: 120,
          }}
        >
          {props.brandName}
        </span>
      </span>

      {/* Search. Hidden under 640px, where the four glyphs need every pixel. */}
      <label className="hidden sm:flex" style={{ alignItems: "center", height: 44, flex: "1 1 auto", minWidth: 0, maxWidth: 300, cursor: "text" }}>
        <span className="sr-only" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
          Search
        </span>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            height: 34,
            width: "100%",
            padding: "0 10px",
            borderRadius: 4,
            background: "#EDF3F8",
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flex: "none", color: PP.inkSoft }}>
            <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.8" />
            <path d="m15.5 15.5 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search"
            style={{
              flex: "1 1 auto",
              minWidth: 0,
              border: "none",
              outline: "none",
              background: "transparent",
              fontFamily: PP.font,
              fontSize: 14,
              color: PP.ink,
            }}
          />
        </span>
      </label>

      <nav
        aria-label="Sections"
        style={{ display: "flex", alignItems: "stretch", gap: 2, height: "100%", marginLeft: "auto", flex: "none" }}
      >
        {NAV.map((item) => {
          const active = item.label === ACTIVE;
          return (
            <span
              key={item.label}
              aria-current={active ? "page" : undefined}
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                height: "100%",
                minWidth: 44,
                padding: "0 4px",
                color: active ? PP.ink : PP.inkSoft,
                fontWeight: active ? 600 : 400,
              }}
            >
              {item.icon}
              <span style={{ fontSize: 10, lineHeight: "12px", whiteSpace: "nowrap" }}>{item.label}</span>
              {active ? (
                <span
                  aria-hidden="true"
                  style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 2, background: PP.accent }}
                />
              ) : null}
            </span>
          );
        })}
      </nav>
    </header>
  );
}
