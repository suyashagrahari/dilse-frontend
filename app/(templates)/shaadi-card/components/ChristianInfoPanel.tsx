"use client";

/**
 * ChristianInfoPanel — premium desktop info panel for the Christian wedding card.
 * Displays names, date, venue in an elegant sage-green + warm-ivory design.
 * Used inside HomeSection alongside the invitation card on desktop.
 */

import type { ShaadiData } from "./types";

/* ─── Design tokens ──────────────────────────────────────────────────── */
const C_SAGE   = "#4A6350";
const C_SAGE_M = "#6B8F71";
const C_SAGE_L = "#A4C4A8";
const C_GOLD   = "#B8975A";
const C_GOLD_L = "#D4B87A";
const C_IVORY  = "#FAF8F4";
const C_PAPER  = "#F3F0EA";

const F_SCRIPT = "var(--font-great-vibes), 'Great Vibes', cursive";
const F_CAP    = "var(--font-cinzel), Cinzel, 'Playfair Display', Georgia, serif";
const F_BODY   = "var(--font-lora), Lora, Georgia, serif";

/* ─── Helpers ────────────────────────────────────────────────────────── */
function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) throw new Error();
    const h    = d.getHours();
    const m    = d.getMinutes();
    const ampm = h >= 12 ? "PM" : "AM";
    const h12  = h % 12 || 12;
    const time = m === 0
      ? `${h12} ${ampm}`
      : `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
    return {
      month:   d.toLocaleString("en-US", { month: "long" }),
      weekday: d.toLocaleString("en-US", { weekday: "long" }),
      day:     d.getDate(),
      year:    d.getFullYear(),
      time,
    };
  } catch {
    return { month: "July", weekday: "Saturday", day: 22, year: 2026, time: "7 PM" };
  }
}

/* ─── Decorative SVG atoms ────────────────────────────────────────────── */

/** Pair of facing laurel sprigs */
function LaurelSprigs({ size = 72, color = C_SAGE_M }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size * 0.45} viewBox="0 0 120 54" fill="none" aria-hidden>
      {/* Left sprig */}
      <path d="M60 27 C52 20 38 14 24 18" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.7" />
      <ellipse cx="28" cy="16" rx="7" ry="4" transform="rotate(-30 28 16)" fill={color} opacity="0.55" />
      <ellipse cx="40" cy="12" rx="6" ry="3.5" transform="rotate(-20 40 12)" fill={color} opacity="0.45" />
      <ellipse cx="52" cy="11" rx="5" ry="3" transform="rotate(-10 52 11)" fill={color} opacity="0.35" />
      {/* Right sprig (mirror) */}
      <path d="M60 27 C68 20 82 14 96 18" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.7" />
      <ellipse cx="92" cy="16" rx="7" ry="4" transform="rotate(30 92 16)" fill={color} opacity="0.55" />
      <ellipse cx="80" cy="12" rx="6" ry="3.5" transform="rotate(20 80 12)" fill={color} opacity="0.45" />
      <ellipse cx="68" cy="11" rx="5" ry="3" transform="rotate(10 68 11)" fill={color} opacity="0.35" />
      {/* Center dot */}
      <circle cx="60" cy="27" r="2" fill={C_GOLD} opacity="0.8" />
    </svg>
  );
}

/** Elegant ornamental separator: lines + diamond */
function OrnamentDivider({ width = 220, color = C_SAGE_L }: { width?: number; color?: string }) {
  return (
    <svg width={width} height={16} viewBox={`0 0 ${width} 16`} fill="none" aria-hidden>
      <line x1="0" y1="8" x2={width / 2 - 14} y2="8" stroke={color} strokeWidth="0.8" opacity="0.6" />
      <rect x={width / 2 - 5} y="4" width="10" height="8" rx="1"
        transform={`rotate(45 ${width / 2} 8)`}
        fill="none" stroke={C_GOLD} strokeWidth="1" opacity="0.75" />
      <line x1={width / 2 + 14} y1="8" x2={width} y2="8" stroke={color} strokeWidth="0.8" opacity="0.6" />
    </svg>
  );
}

/** Small bottom botanical footer ornament */
function FloralFooter({ color = C_SAGE_L }: { color?: string }) {
  return (
    <svg width={140} height={28} viewBox="0 0 140 28" fill="none" aria-hidden>
      <path d="M70 14 C58 6 44 4 30 8" stroke={color} strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.6" />
      <path d="M70 14 C82 6 96 4 110 8" stroke={color} strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.6" />
      <ellipse cx="34"  cy="7"  rx="5" ry="3" transform="rotate(-25 34 7)"   fill={color} opacity="0.45" />
      <ellipse cx="46"  cy="4"  rx="5" ry="3" transform="rotate(-15 46 4)"   fill={color} opacity="0.38" />
      <ellipse cx="106" cy="7"  rx="5" ry="3" transform="rotate(25 106 7)"   fill={color} opacity="0.45" />
      <ellipse cx="94"  cy="4"  rx="5" ry="3" transform="rotate(15 94 4)"    fill={color} opacity="0.38" />
      <circle  cx="70"  cy="14" r="2.5" fill={C_GOLD} opacity="0.7" />
    </svg>
  );
}

/* ─── Main component ─────────────────────────────────────────────────── */
interface Props { data: ShaadiData }

export default function ChristianInfoPanel({ data }: Props) {
  const date       = formatDate(data.weddingDate);
  const brideName  = data.brideName.trim()  || "Jane";
  const groomName  = data.groomName.trim()  || "Andrew";
  const venueParts = (data.venue.trim()     || "123 Anywhere St, Any City").split(",");

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        minHeight: "100dvh",
        background: `linear-gradient(135deg, ${C_IVORY} 0%, ${C_PAPER} 100%)`,
      }}
    >
      {/* Subtle corner accents */}
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" aria-hidden
        style={{ position: "absolute", top: 24, left: 24, opacity: 0.18 }}>
        <path d="M4 76 L4 4 L76 4" stroke={C_SAGE} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" aria-hidden
        style={{ position: "absolute", bottom: 24, right: 24, opacity: 0.18, transform: "rotate(180deg)" }}>
        <path d="M4 76 L4 4 L76 4" stroke={C_SAGE} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>

      {/* Card */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: 340,
          padding: "40px 36px 36px",
          background: C_IVORY,
          borderRadius: 4,
          border: `1px solid ${C_SAGE_L}55`,
          boxShadow: `0 2px 6px ${C_SAGE}12, 0 12px 40px ${C_SAGE}10, inset 0 0 0 6px ${C_IVORY}, inset 0 0 0 7px ${C_SAGE_L}22`,
          textAlign: "center",
        }}
      >
        {/* Inner double-line border via outline */}
        <div
          style={{
            position: "absolute",
            inset: 10,
            border: `1px solid ${C_SAGE_L}33`,
            borderRadius: 2,
            pointerEvents: "none",
          }}
          aria-hidden
        />

        {/* Top laurel */}
        <div style={{ marginBottom: 14 }}>
          <LaurelSprigs size={100} color={C_SAGE_M} />
        </div>

        {/* Header caption */}
        <span style={{
          fontFamily: F_CAP,
          fontSize: "0.48rem",
          fontWeight: 700,
          letterSpacing: "0.38em",
          textTransform: "uppercase",
          color: C_GOLD,
          marginBottom: 20,
          display: "block",
        }}>
          Together with their families
        </span>

        {/* Bride name */}
        <span style={{
          fontFamily: F_SCRIPT,
          fontSize: "3.6rem",
          color: C_SAGE,
          lineHeight: 1.05,
          display: "block",
        }}>
          {brideName}
        </span>

        {/* Ampersand row */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "6px 0 2px" }}>
          <div style={{ height: 1, width: 40, background: `linear-gradient(90deg, transparent, ${C_SAGE_L}80)` }} aria-hidden />
          <div style={{
            width: 36, height: 36,
            borderRadius: "50%",
            border: `1px solid ${C_GOLD_L}60`,
            background: `radial-gradient(circle, ${C_PAPER}cc, transparent)`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontFamily: F_SCRIPT, fontSize: "1.5rem", color: C_GOLD, lineHeight: 1 }}>&amp;</span>
          </div>
          <div style={{ height: 1, width: 40, background: `linear-gradient(90deg, ${C_SAGE_L}80, transparent)` }} aria-hidden />
        </div>

        {/* Groom name */}
        <span style={{
          fontFamily: F_SCRIPT,
          fontSize: "3.6rem",
          color: C_SAGE,
          lineHeight: 1.05,
          display: "block",
          marginBottom: 24,
        }}>
          {groomName}
        </span>

        {/* Ornament divider */}
        <OrnamentDivider width={200} color={C_SAGE_L} />

        {/* Date block */}
        <div style={{ margin: "22px 0 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <span style={{
            fontFamily: F_CAP,
            fontSize: "0.5rem",
            fontWeight: 700,
            letterSpacing: "0.34em",
            textTransform: "uppercase",
            color: C_GOLD,
          }}>
            {date.weekday}
          </span>

          {/* Day + Month/Year row */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10, margin: "4px 0" }}>
            <span style={{
              fontFamily: F_BODY,
              fontSize: "4.2rem",
              fontWeight: 200,
              color: C_SAGE,
              lineHeight: 1,
              letterSpacing: "-0.02em",
            }}>
              {date.day}
            </span>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", paddingBottom: 6, gap: 3 }}>
              <div style={{ height: 1, width: 44, background: `linear-gradient(90deg, ${C_SAGE_L}70, transparent)` }} aria-hidden />
              <span style={{
                fontFamily: F_CAP,
                fontSize: "0.65rem",
                fontWeight: 700,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: C_SAGE,
              }}>
                {date.month}
              </span>
              <span style={{
                fontFamily: F_CAP,
                fontSize: "0.6rem",
                fontWeight: 600,
                letterSpacing: "0.18em",
                color: C_SAGE_M,
              }}>
                {date.year}
              </span>
            </div>
          </div>

          {/* Time badge */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "3px 14px",
            borderRadius: 999,
            border: `1px solid ${C_GOLD_L}40`,
            background: `linear-gradient(90deg, ${C_PAPER}, ${C_IVORY})`,
            marginTop: 2,
          }}>
            <span style={{
              fontFamily: F_CAP,
              fontSize: "0.5rem",
              fontWeight: 600,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: C_GOLD,
            }}>
              At {date.time}
            </span>
          </div>
        </div>

        {/* Thin sage rule */}
        <div style={{
          height: 1,
          width: 64,
          borderRadius: 999,
          background: `linear-gradient(90deg, transparent, ${C_SAGE_L}70, transparent)`,
          margin: "22px 0",
        }} aria-hidden />

        {/* Venue */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
          {/* Venue label with pin ornament */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="10" height="13" viewBox="0 0 10 13" fill="none" aria-hidden>
              <path d="M5 0C2.24 0 0 2.24 0 5c0 3.75 5 8 5 8s5-4.25 5-8c0-2.76-2.24-5-5-5z" fill={C_GOLD} opacity="0.7" />
              <circle cx="5" cy="5" r="1.8" fill={C_IVORY} />
            </svg>
            <span style={{
              fontFamily: F_CAP,
              fontSize: "0.48rem",
              fontWeight: 700,
              letterSpacing: "0.36em",
              textTransform: "uppercase",
              color: C_GOLD,
            }}>
              Venue
            </span>
          </div>

          {venueParts.map((part, i) => (
            <span key={i} style={{
              fontFamily: i === 0 ? F_CAP : F_BODY,
              fontSize: i === 0 ? "0.95rem" : "0.78rem",
              fontWeight: i === 0 ? 700 : 400,
              color: i === 0 ? C_SAGE : C_SAGE_M,
              lineHeight: 1.5,
              letterSpacing: i === 0 ? "0.04em" : 0,
              opacity: i === 0 ? 1 : 0.75,
            }}>
              {part.trim()}
            </span>
          ))}
        </div>

        {/* Bottom floral */}
        <div style={{ marginTop: 22, marginBottom: 6 }}>
          <FloralFooter color={C_SAGE_L} />
        </div>

        {/* Tagline */}
        <span style={{
          fontFamily: F_CAP,
          fontSize: "0.46rem",
          fontWeight: 700,
          letterSpacing: "0.36em",
          textTransform: "uppercase",
          color: C_GOLD,
          opacity: 0.85,
        }}>
          Faith · Love · Forever
        </span>
      </div>
    </div>
  );
}
