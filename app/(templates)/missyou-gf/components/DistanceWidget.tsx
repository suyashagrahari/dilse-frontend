"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import type { MissYouData, DistanceUnit } from "./types";
import { findCity, timeInZone, cityDistance, countdownTo, type ZonedTime } from "./types";
import { NIGHT, FONT_HEADING, FONT_BODY } from "./theme";

function AnalogClock({ time, label, subLabel, animate }: { time: ZonedTime; label: string; subLabel: string; animate: boolean }) {
  const hourDeg = (time.hours % 12) * 30 + time.minutes * 0.5;
  const minDeg = time.minutes * 6 + time.seconds * 0.1;
  const secDeg = time.seconds * 6;
  const hand = (deg: number, len: number, w: number, color: string) => (
    <line
      x1="50" y1="50" x2="50" y2={50 - len} stroke={color} strokeWidth={w} strokeLinecap="round"
      transform={`rotate(${deg} 50 50)`}
      style={animate ? { transition: "transform .2s cubic-bezier(.4,2.2,.4,1)" } : undefined}
    />
  );
  return (
    <div style={{ textAlign: "center" }}>
      <svg viewBox="0 0 100 100" width="88" height="88" role="img" aria-label={`${label} time ${time.digital}`} style={{ margin: "0 auto" }}>
        <circle cx="50" cy="50" r="46" fill={NIGHT.raised} stroke={NIGHT.hairline} strokeWidth="1.5" />
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={i} x1="50" y1="8" x2="50" y2="12" stroke={NIGHT.mutedNight} strokeWidth="1.5" transform={`rotate(${i * 30} 50 50)`} opacity={0.6} />
        ))}
        {hand(hourDeg, 24, 3.5, NIGHT.onNight)}
        {hand(minDeg, 33, 2.5, NIGHT.indigoLt)}
        {hand(secDeg, 36, 1.2, NIGHT.pink)}
        <circle cx="50" cy="50" r="3" fill={NIGHT.pink} />
      </svg>
      <p style={{ fontFamily: FONT_BODY, fontSize: 13, fontWeight: 600, color: NIGHT.onNight, margin: "8px 0 0" }}>{label}</p>
      <p style={{ fontFamily: FONT_BODY, fontSize: 12, color: NIGHT.mutedNight, margin: "2px 0 0" }}>{subLabel} · {time.digital}</p>
    </div>
  );
}

function CountdownBlock({ iso }: { iso: string }) {
  const [, force] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => force((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, []);
  const cd = countdownTo(iso);
  if (!cd) return null;
  if (cd.done) {
    return (
      <p style={{ fontFamily: FONT_HEADING, fontWeight: 700, fontSize: "clamp(22px,6vw,30px)", color: NIGHT.lime, textAlign: "center", margin: 0 }} aria-live="polite">
        you&apos;re together 🤍
      </p>
    );
  }
  const cell = (v: number, l: string) => (
    <div style={{ textAlign: "center", minWidth: 56 }}>
      <div style={{ fontFamily: FONT_HEADING, fontWeight: 700, fontVariantNumeric: "tabular-nums", fontSize: "clamp(32px,9vw,44px)", color: NIGHT.amber, lineHeight: 1 }}>
        {String(v).padStart(2, "0")}
      </div>
      <div style={{ fontFamily: FONT_BODY, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: NIGHT.mutedNight, marginTop: 4 }}>{l}</div>
    </div>
  );
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }} aria-live="off">
        {cell(cd.days, "days")}
        {cell(cd.hours, "hrs")}
        {cell(cd.minutes, "min")}
        {cell(cd.seconds, "sec")}
      </div>
      <p style={{ fontFamily: FONT_BODY, fontSize: 14, color: NIGHT.onNight, textAlign: "center", marginTop: 14 }}>
        until I hold you again
      </p>
    </div>
  );
}

/** §3 The Distance — two clocks + km/mi + reunion countdown, DST-correct. */
export default function DistanceWidget({ data }: { data: MissYouData }) {
  const reduce = useReducedMotion();
  const [unit, setUnit] = useState<DistanceUnit>(data.distanceUnit);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const yourCity = findCity(data.yourCity) ?? { label: data.yourCity || "You", tz: Intl.DateTimeFormat().resolvedOptions().timeZone, lat: 0, lng: 0 };
  const theirCity = findCity(data.theirCity) ?? { label: data.theirCity || "Them", tz: Intl.DateTimeFormat().resolvedOptions().timeZone, lat: 0, lng: 0 };

  const yourTime = timeInZone(yourCity.tz, now);
  const theirTime = timeInZone(theirCity.tz, now);

  const distance = yourCity.lat && theirCity.lat ? Math.round(cityDistance(yourCity, theirCity, unit)) : null;

  return (
    <div style={{ background: NIGHT.base2, borderRadius: 28, padding: "clamp(24px,6vw,36px)", border: `1px solid ${NIGHT.borderNight}`, maxWidth: 600, margin: "0 auto", width: "100%" }}>
      <p style={{ fontFamily: FONT_BODY, fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: NIGHT.mutedNight, textAlign: "center", margin: 0 }}>◷ The distance</p>
      <h2 style={{ fontFamily: FONT_HEADING, fontWeight: 600, fontSize: "clamp(22px,6vw,30px)", color: NIGHT.onNight, textAlign: "center", margin: "6px 0 24px" }}>Same sky, different hours</h2>

      <div style={{ display: "flex", justifyContent: "center", gap: "clamp(20px,8vw,48px)", flexWrap: "wrap", marginBottom: 24 }}>
        <AnalogClock time={yourTime} label={yourCity.label} subLabel="you" animate={!reduce} />
        <AnalogClock time={theirTime} label={theirCity.label} subLabel="them" animate={!reduce} />
      </div>

      {distance !== null && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginBottom: 26 }}>
          <span style={{ fontFamily: FONT_HEADING, fontWeight: 700, fontSize: "clamp(18px,5vw,22px)", color: NIGHT.indigoLt }}>
            {distance.toLocaleString()} {unit} apart
          </span>
          <button
            type="button"
            onClick={() => setUnit((u) => (u === "km" ? "mi" : "km"))}
            aria-label={`Switch to ${unit === "km" ? "miles" : "kilometres"}`}
            style={{ fontFamily: FONT_BODY, fontSize: 12, fontWeight: 600, color: NIGHT.mutedNight, background: NIGHT.raised, border: `1px solid ${NIGHT.hairline}`, borderRadius: 999, padding: "6px 12px", minHeight: 32, cursor: "pointer" }}
          >
            {unit === "km" ? "→ mi" : "→ km"}
          </button>
        </div>
      )}

      {data.reunionDate ? (
        <CountdownBlock iso={data.reunionDate} />
      ) : (
        <p style={{ fontFamily: FONT_BODY, fontSize: 14, color: NIGHT.mutedNight, textAlign: "center", margin: 0 }}>
          soon, I promise 🤍
        </p>
      )}
    </div>
  );
}
