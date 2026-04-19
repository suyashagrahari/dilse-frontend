"use client";

import { memo } from "react";
import type { ShaadiData } from "@/app/(templates)/shaadi-card/components/types";
import { ChevronDown } from "lucide-react";

const ASSET = "/christan-wedding";

const C_SAGE   = "#546B57";
const C_MED    = "#7A9B7E";
const C_LIGHT  = "#A8C4AC";
const C_INK    = "#2D3E32";

const F_SCRIPT = "var(--font-great-vibes), 'Great Vibes', cursive";
const F_CAP    = "var(--font-cinzel), Cinzel, 'Playfair Display', Georgia, serif";
const F_BODY   = "var(--font-lora), Lora, serif";

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) throw new Error("invalid");
    return {
      weekday: d.toLocaleString("en-US", { weekday: "long" }).toUpperCase(),
      month: d.toLocaleString("en-US", { month: "long" }).toUpperCase(),
      day: d.getDate(),
      year: d.getFullYear(),
      time: (() => {
        const h = d.getHours();
        const m = d.getMinutes();
        const ampm = h >= 12 ? "PM" : "AM";
        const h12 = h % 12 || 12;
        return m === 0 ? `${h12} ${ampm}` : `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
      })(),
    };
  } catch {
    return { weekday: "SATURDAY", month: "JULY", day: 22, year: 2026, time: "7 PM" };
  }
}

function splitVenue(v: string): [string, string] {
  const t = (v || "").trim() || "123 Anywhere St, Any City, ST 12345";
  const i = t.indexOf(",");
  if (i === -1) return [t, ""];
  return [t.slice(0, i).trim(), t.slice(i + 1).trim()];
}

interface Props {
  data: ShaadiData;
}

export default memo(function HomeHero({ data }: Props) {
  const d = formatDate(data.weddingDate);
  const brideName = data.brideName.trim() || "Jane";
  const groomName = data.groomName.trim() || "Andrew";
  const [venueLine1, venueLine2] = splitVenue(data.venue);
  const blessing = data.blessing?.trim() || "God bless this union";

  return (
    <section
      className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center px-6 pb-16 pt-20 sm:px-8 sm:pt-24 lg:pt-28"
      aria-label="Wedding invitation hero"
    >
      {/* ── Content flows directly on page chrome — no card wrapper ─────── */}

      {/* Join Us */}
      <div
        className="relative"
        style={{
          fontFamily: F_SCRIPT,
          fontSize: "clamp(44px, 11vw, 60px)",
          color: C_INK,
          lineHeight: 1,
        }}
      >
        Join Us
      </div>

      {/* Subtitle */}
      <div
        className="relative mt-2 text-center"
        style={{
          fontFamily: F_CAP,
          fontSize: "0.66rem",
          fontWeight: 700,
          letterSpacing: "0.36em",
          textTransform: "uppercase",
          color: `${C_MED}e0`,
        }}
      >
        We&rsquo;re Getting Married
      </div>

      {/* Rings ornament */}
      <div
        aria-hidden
        className="relative my-4 h-[30px] w-[30px]"
        style={{
          backgroundImage: `url(${ASSET}/rings.png)`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      />

      {/* Couple illustration */}
      <div
        aria-hidden
        className="relative mt-1 h-[130px] w-[150px] opacity-90 sm:h-[150px] sm:w-[170px]"
        style={{
          backgroundImage: `url(${ASSET}/couple.png)`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "top center",
        }}
      />

      {/* Divider */}
      <div
        aria-hidden
        className="mt-5 h-px w-28 rounded-full opacity-45"
        style={{ background: `linear-gradient(90deg, transparent, ${C_SAGE}, transparent)` }}
      />

      {/* Names */}
      <h1
        className="relative mt-5 px-2 text-center"
        style={{
          fontFamily: F_SCRIPT,
          fontSize: "clamp(46px, 12vw, 66px)",
          lineHeight: 1.05,
          color: C_INK,
        }}
      >
        {brideName}
        <span
          className="mx-1.5 align-middle"
          style={{ fontFamily: F_SCRIPT, fontSize: "0.75em", color: C_MED }}
        >
          &amp;
        </span>
        {groomName}
      </h1>

      {/* Date — month */}
      <div
        className="relative mt-6 text-center"
        style={{
          fontFamily: F_CAP,
          fontSize: "0.88rem",
          fontWeight: 700,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: C_INK,
        }}
      >
        {d.month}
      </div>

      {/* Weekday · big day number · time */}
      <div className="relative mt-2 flex items-center gap-3" aria-hidden>
        <span
          style={{
            fontFamily: F_CAP,
            fontSize: "0.72rem",
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: `${C_MED}d0`,
          }}
        >
          {d.weekday}
        </span>
        <span
          style={{
            fontFamily: F_SCRIPT,
            fontSize: "2.8rem",
            lineHeight: 1,
            color: C_INK,
          }}
        >
          {d.day}
        </span>
        <span
          style={{
            fontFamily: F_CAP,
            fontSize: "0.72rem",
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: `${C_MED}d0`,
          }}
        >
          At {d.time}
        </span>
      </div>

      {/* Year */}
      <div
        className="relative mt-1 text-center"
        style={{
          fontFamily: F_CAP,
          fontSize: "0.88rem",
          fontWeight: 700,
          letterSpacing: "0.22em",
          color: C_INK,
        }}
      >
        {d.year}
      </div>

      {/* Divider */}
      <div
        aria-hidden
        className="mt-7 h-px w-28 rounded-full opacity-45"
        style={{ background: `linear-gradient(90deg, transparent, ${C_SAGE}, transparent)` }}
      />

      {/* Venue */}
      <div className="relative mt-6 flex items-center gap-2" aria-hidden>
        <span style={{ width: 3, height: 3, borderRadius: 9999, background: C_LIGHT }} />
        <span
          style={{
            fontFamily: F_CAP,
            fontSize: "0.6rem",
            fontWeight: 700,
            letterSpacing: "0.38em",
            textTransform: "uppercase",
            color: C_MED,
          }}
        >
          Venue
        </span>
        <span style={{ width: 3, height: 3, borderRadius: 9999, background: C_LIGHT }} />
      </div>
      <div className="relative mt-2 text-center">
        <div
          style={{
            fontFamily: F_CAP,
            fontSize: "1.1rem",
            fontWeight: 700,
            letterSpacing: "0.05em",
            color: C_SAGE,
            lineHeight: 1.4,
          }}
        >
          {venueLine1}
        </div>
        {venueLine2 ? (
          <div
            className="mt-0.5"
            style={{
              fontFamily: F_BODY,
              fontSize: "0.9rem",
              color: C_SAGE,
              opacity: 0.7,
              lineHeight: 1.5,
            }}
          >
            {venueLine2}
          </div>
        ) : null}
      </div>

      {/* Blessing ribbon */}
      <div className="relative mt-8 flex w-full max-w-[340px] items-center gap-3 sm:max-w-[380px]">
        <div
          aria-hidden
          className="h-px flex-1"
          style={{ background: `linear-gradient(90deg, transparent, ${C_LIGHT}60)` }}
        />
        <span
          className="whitespace-nowrap"
          style={{
            fontFamily: F_CAP,
            fontSize: "0.58rem",
            fontWeight: 700,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: `${C_MED}b0`,
          }}
        >
          {blessing}
        </span>
        <div
          aria-hidden
          className="h-px flex-1"
          style={{ background: `linear-gradient(90deg, ${C_LIGHT}60, transparent)` }}
        />
      </div>

      {/* Scroll affordance */}
      <div className="mt-10 flex flex-col items-center gap-1.5" aria-hidden>
        <span
          className="animate-pulse"
          style={{
            fontFamily: F_CAP,
            fontSize: "0.58rem",
            fontWeight: 700,
            letterSpacing: "0.34em",
            textTransform: "uppercase",
            color: `${C_MED}c0`,
          }}
        >
          Scroll to explore
        </span>
        <ChevronDown size={16} className="animate-bounce" style={{ color: `${C_MED}c0` }} />
      </div>
    </section>
  );
});
