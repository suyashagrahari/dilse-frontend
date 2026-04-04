"use client";

import { useRef } from "react";
import ChristianInvitationCard from "./ChristianInvitationCard";
import type { ShaadiData } from "./types";

const C_SAGE = "#546B57";
const C_MED = "#7A9B7E";
const C_LIGHT = "#A8C4AC";
const F_SCRIPT = "var(--font-great-vibes), 'Great Vibes', cursive";
const F_CAP = "var(--font-cinzel), Cinzel, 'Playfair Display', Georgia, serif";
const F_BODY = "var(--font-lora), Lora, serif";

function formatDateDisplay(iso: string) {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) throw new Error("invalid");
    const month = d.toLocaleString("en-US", { month: "long" });
    const weekday = d.toLocaleString("en-US", { weekday: "long" });
    const day = d.getDate();
    const year = d.getFullYear();
    const h = d.getHours();
    const m = d.getMinutes();
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    const time =
      m === 0
        ? `${h12} ${ampm}`
        : `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
    return { month, weekday, day, year, time };
  } catch {
    return { month: "July", weekday: "Saturday", day: 22, year: 2026, time: "7 PM" };
  }
}

interface Props {
  data: ShaadiData;
}

export default function HomeSection({ data }: Props) {
  const centerRef = useRef<HTMLDivElement>(null);
  const dateInfo = formatDateDisplay(data.weddingDate);
  const brideName = data.brideName.trim() || "Jane";
  const groomName = data.groomName.trim() || "Andrew";
  const venueParts = (data.venue.trim() || "123 Anywhere St, Any City").split(",");
  const hasBridePhoto = !!data.bride.photo;
  const hasGroomPhoto = !!data.groom.photo;

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-white lg:min-h-[100dvh] lg:overflow-visible lg:bg-transparent">
      {/*
       * Outer flex: column on mobile, row on desktop.
       * On mobile the card uses position:fixed so this container collapses to 0-height —
       * the min-h-[100dvh] keeps the page the right size.
       * On desktop the card is position:relative inside the left column.
       */}
      <div className="flex min-h-[100dvh] flex-col items-center justify-center px-4 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-center lg:gap-10 lg:px-10 lg:py-10 xl:gap-14 xl:px-14">

        {/* ── Invitation card (mobile: full-screen; desktop: left column) ── */}
        <div
          ref={centerRef}
          className="w-full lg:w-auto lg:flex-shrink-0"
          style={{ maxWidth: 433 }}
        >
          <ChristianInvitationCard
            brideName={data.brideName}
            groomName={data.groomName}
            weddingDate={data.weddingDate}
            venue={data.venue}
            blessing={data.blessing}
            measureRef={centerRef}
          />
        </div>

        {/* ── Desktop-only info panel ── */}
        <div className="hidden lg:flex flex-col items-center" style={{ gap: 0, maxWidth: 380 }}>

          {/* Vertical soft divider — unchanged */}
          <div
            className="hidden xl:block absolute"
            style={{
              width: 1,
              height: 320,
              background: `linear-gradient(to bottom, transparent, ${C_LIGHT}55, ${C_SAGE}44, ${C_LIGHT}55, transparent)`,
              marginLeft: -56,
              pointerEvents: "none",
            }}
            aria-hidden
          />

          {/* Header label with flanking rules */}
          <div className="flex items-center" style={{ gap: 10, marginBottom: 26, width: "100%" }}>
            <div style={{ height: 1, flex: 1, background: `linear-gradient(90deg, transparent, ${C_LIGHT}70)` }} aria-hidden />
            <span
              style={{
                fontFamily: F_CAP,
                fontSize: "0.55rem",
                fontWeight: 700,
                letterSpacing: "0.3em",
                textTransform: "uppercase" as const,
                color: C_MED,
                whiteSpace: "nowrap",
              }}
            >
              Together with their families
            </span>
            <div style={{ height: 1, flex: 1, background: `linear-gradient(90deg, ${C_LIGHT}70, transparent)` }} aria-hidden />
          </div>

          {/* Bride name — large */}
          <span style={{ fontFamily: F_SCRIPT, fontSize: "5.5rem", color: C_SAGE, lineHeight: 1.0, display: "block" }}>
            {brideName}
          </span>

          {/* Ampersand in a circle */}
          <div className="flex items-center" style={{ gap: 14, margin: "10px 0 6px" }}>
            <div style={{ height: 1, width: 52, background: `linear-gradient(90deg, transparent, ${C_LIGHT})` }} aria-hidden />
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: "50%",
                border: `1px solid ${C_LIGHT}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span style={{ fontFamily: F_SCRIPT, fontSize: "2rem", color: C_SAGE, lineHeight: 1 }}>&amp;</span>
            </div>
            <div style={{ height: 1, width: 52, background: `linear-gradient(90deg, ${C_LIGHT}, transparent)` }} aria-hidden />
          </div>

          {/* Groom name — large */}
          <span style={{ fontFamily: F_SCRIPT, fontSize: "5.5rem", color: C_SAGE, lineHeight: 1.0, display: "block", marginBottom: 34 }}>
            {groomName}
          </span>

          {/* Ornamental dot divider */}
          <div className="flex items-center" style={{ gap: 8, marginBottom: 28, width: "100%" }}>
            <div style={{ height: 1, flex: 1, borderRadius: 999, background: `linear-gradient(90deg, transparent, ${C_SAGE}55)` }} aria-hidden />
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: C_LIGHT }} aria-hidden />
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: C_SAGE, opacity: 0.55 }} aria-hidden />
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: C_LIGHT }} aria-hidden />
            <div style={{ height: 1, flex: 1, borderRadius: 999, background: `linear-gradient(90deg, ${C_SAGE}55, transparent)` }} aria-hidden />
          </div>

          {/* Date — hero day number */}
          <div className="flex flex-col items-center" style={{ gap: 2, textAlign: "center", marginBottom: 26 }}>
            <span
              style={{
                fontFamily: F_CAP,
                fontSize: "0.62rem",
                fontWeight: 700,
                letterSpacing: "0.38em",
                textTransform: "uppercase" as const,
                color: C_MED,
                marginBottom: 6,
              }}
            >
              {dateInfo.weekday}
            </span>

            {/* Giant day + month/year stack */}
            <div className="flex items-center" style={{ gap: 12 }}>
              <span
                style={{
                  fontFamily: F_BODY,
                  fontSize: "7rem",
                  fontWeight: 200,
                  color: C_SAGE,
                  lineHeight: 0.88,
                  letterSpacing: "-0.03em",
                }}
              >
                {dateInfo.day}
              </span>
              <div className="flex flex-col items-start" style={{ gap: 5, paddingBottom: 8 }}>
                <div style={{ height: 1, width: 52, background: `linear-gradient(90deg, ${C_LIGHT}80, transparent)` }} aria-hidden />
                <span
                  style={{
                    fontFamily: F_CAP,
                    fontSize: "0.88rem",
                    fontWeight: 700,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase" as const,
                    color: C_SAGE,
                  }}
                >
                  {dateInfo.month}
                </span>
                <span
                  style={{
                    fontFamily: F_CAP,
                    fontSize: "0.78rem",
                    fontWeight: 500,
                    letterSpacing: "0.22em",
                    color: C_MED,
                  }}
                >
                  {dateInfo.year}
                </span>
              </div>
            </div>

            {/* Time pill */}
            <div
              style={{
                marginTop: 8,
                padding: "4px 20px",
                border: `1px solid ${C_LIGHT}90`,
                borderRadius: 999,
              }}
            >
              <span
                style={{
                  fontFamily: F_CAP,
                  fontSize: "0.58rem",
                  fontWeight: 600,
                  letterSpacing: "0.26em",
                  textTransform: "uppercase" as const,
                  color: `${C_MED}cc`,
                }}
              >
                At {dateInfo.time}
              </span>
            </div>
          </div>

          {/* Thin divider */}
          <div
            style={{
              height: 1,
              width: 100,
              borderRadius: 999,
              opacity: 0.28,
              background: `linear-gradient(90deg, transparent, ${C_SAGE}, transparent)`,
              marginBottom: 24,
            }}
            aria-hidden
          />

          {/* Venue */}
          <div className="flex flex-col items-center" style={{ gap: 6, textAlign: "center", marginBottom: 28 }}>
            {/* Label with dot ornaments */}
            <div className="flex items-center" style={{ gap: 8 }}>
              <div style={{ width: 3, height: 3, borderRadius: "50%", background: C_LIGHT }} aria-hidden />
              <span
                style={{
                  fontFamily: F_CAP,
                  fontSize: "0.52rem",
                  fontWeight: 700,
                  letterSpacing: "0.36em",
                  textTransform: "uppercase" as const,
                  color: C_MED,
                }}
              >
                Venue
              </span>
              <div style={{ width: 3, height: 3, borderRadius: "50%", background: C_LIGHT }} aria-hidden />
            </div>
            {venueParts.map((part, i) => (
              <span
                key={i}
                style={{
                  fontFamily: i === 0 ? F_CAP : F_BODY,
                  fontSize: i === 0 ? "1.15rem" : "0.9rem",
                  fontWeight: i === 0 ? 700 : 400,
                  letterSpacing: i === 0 ? "0.05em" : 0,
                  color: C_SAGE,
                  lineHeight: 1.5,
                  opacity: i === 0 ? 1 : 0.65,
                }}
              >
                {part.trim()}
              </span>
            ))}
          </div>

          {/* Bottom tagline with flanking rules */}
          <div className="flex items-center" style={{ gap: 10, width: "100%" }}>
            <div style={{ height: 1, flex: 1, background: `linear-gradient(90deg, transparent, ${C_LIGHT}50)` }} aria-hidden />
            <span
              style={{
                fontFamily: F_CAP,
                fontSize: "0.52rem",
                fontWeight: 700,
                letterSpacing: "0.28em",
                textTransform: "uppercase" as const,
                color: `${C_MED}99`,
                whiteSpace: "nowrap",
              }}
            >
              Faith · Love · Forever
            </span>
            <div style={{ height: 1, flex: 1, background: `linear-gradient(90deg, ${C_LIGHT}50, transparent)` }} aria-hidden />
          </div>
        </div>
      </div>
    </div>
  );
}
