"use client";

// ─── Weather ─────────────────────────────────────────────────────────────────
//
// AGENT 2. Open-Meteo's forecast endpoint: free, no API key, no signup, no
// attribution widget to paste into the corner of a love letter.
//
//   https://api.open-meteo.com/v1/forecast
//     ?latitude=12.97&longitude=77.6
//     &hourly=temperature_2m,weather_code
//     &timezone=UTC
//     &forecast_days=4
//
// Response shape (verified live against the API, not from memory):
//
//   { hourly_units: { time: "iso8601", temperature_2m: "°C", weather_code: "wmo code" },
//     hourly: { time: ["2026-08-06T00:00", …],   // 24 × forecast_days entries
//               temperature_2m: [20.4, …],
//               weather_code: [3, …] } }
//
// ⚠ `hourly.time` comes back as "2026-08-06T00:00" — a bare local-form
// date-time with NO trailing Z, even though we asked for `timezone=UTC`. Per
// the ES spec a date-time string without an offset is parsed as LOCAL time, so
// `Date.parse(t)` is wrong by the viewer's UTC offset — five and a half hours
// in India, which is five and a half slots of the wrong weather. We append the
// Z ourselves. This is the single easiest bug to write in this file.
//
// RULES THIS FILE OBEYS
//  - Cache per location per hour in a module-level Map. No storage APIs: this
//    template owns none of the two localStorage keys the publish flow allows.
//  - `point === null` → no fetch at all. The router passes null during `live`
//    and `after`, because they are outdoors on patchy data and nothing
//    mid-date may block on the network.
//  - A failed fetch returns null forever for that call. The caller hides the
//    row. There is no error state and no spinner on a romantic page: a weather
//    line that quietly is not there costs nothing, and "⚠ could not load
//    weather" costs the whole mood.
//  - The request is aborted on unmount.

import { useEffect, useState } from "react";

import { ACCENT } from "./dateTheme";
import { getServerTime } from "./types";

export interface WeatherView {
  /** Whole degrees Celsius. */
  tempC: number;
  /** WMO weather interpretation code, as returned by Open-Meteo. */
  code: number;
  /** Short human label — "clear", "light rain", "overcast". Lowercase. */
  label: string;
}

// ─── WMO codes ───────────────────────────────────────────────────────────────
//
// https://open-meteo.com/en/docs — the WMO 4677 subset Open-Meteo emits.

const WMO_LABEL: Record<number, string> = {
  0: "clear",
  1: "mostly clear",
  2: "partly cloudy",
  3: "overcast",
  45: "fog",
  48: "freezing fog",
  51: "light drizzle",
  53: "drizzle",
  55: "heavy drizzle",
  56: "freezing drizzle",
  57: "freezing drizzle",
  61: "light rain",
  63: "rain",
  65: "heavy rain",
  66: "freezing rain",
  67: "freezing rain",
  71: "light snow",
  73: "snow",
  75: "heavy snow",
  77: "snow grains",
  80: "light showers",
  81: "showers",
  82: "heavy showers",
  85: "snow showers",
  86: "snow showers",
  95: "thunderstorms",
  96: "thunderstorms",
  99: "thunderstorms",
};

export type WeatherFamily =
  | "clear"
  | "mostly-clear"
  | "cloudy"
  | "fog"
  | "drizzle"
  | "rain"
  | "snow"
  | "thunder";

/** Collapses ~28 WMO codes onto the eight things we can actually draw. */
export function weatherFamily(code: number): WeatherFamily {
  if (code >= 95) return "thunder";
  if (code >= 85) return "snow";
  if (code >= 80) return "rain";
  if (code >= 71) return "snow";
  if (code >= 66) return "snow";
  if (code >= 61) return "rain";
  if (code >= 51) return "drizzle";
  if (code >= 45) return "fog";
  if (code >= 3) return "cloudy";
  if (code >= 1) return "mostly-clear";
  return "clear";
}

const labelFor = (code: number): string => WMO_LABEL[code] ?? weatherFamily(code).replace("-", " ");

// ─── Cache ───────────────────────────────────────────────────────────────────

const HOUR_MS = 3600_000;
/** How long a good answer stays good. Weather does not move fast enough to care. */
const TTL_OK = HOUR_MS;
/** A failure is cached briefly so a flaky minute does not become a flaky hour. */
const TTL_FAIL = 5 * 60_000;
/** Open-Meteo's forecast horizon. Past this there is nothing to ask for. */
const MAX_FORECAST_DAYS = 16;

interface Entry {
  at: number;
  view: WeatherView | null;
}

const cache = new Map<string, Entry>();

/**
 * One request per key, however many components ask. Ref-counted so that a
 * caller unmounting does not abort a request another caller is still waiting
 * on — and so an abort never lands in the cache as a failure.
 */
interface Job {
  promise: Promise<WeatherView | null>;
  ctrl: AbortController;
  refs: number;
}
const inflight = new Map<string, Job>();

/**
 * Two decimal places is about a kilometre — close enough that the meeting point
 * and the first stop share a forecast, and coarse enough that a re-render with
 * a floating-point wobble does not miss the cache.
 */
const keyFor = (lat: number, lng: number, hourIso: string) =>
  `${lat.toFixed(2)},${lng.toFixed(2)}@${hourIso}`;

/** Truncate an instant to its UTC hour — the granularity the API answers at. */
function hourKey(ms: number): string {
  return new Date(Math.floor(ms / HOUR_MS) * HOUR_MS).toISOString().slice(0, 13);
}

const utcMidnight = (ms: number) => {
  const d = new Date(ms);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
};

// ─── Fetch ───────────────────────────────────────────────────────────────────

interface Forecast {
  hourly?: {
    time?: unknown;
    temperature_2m?: unknown;
    weather_code?: unknown;
  };
}

/** Appends the missing UTC designator before parsing. See the note at the top. */
function parseSlot(t: string): number {
  return Date.parse(/[zZ]|[+-]\d{2}:?\d{2}$/.test(t) ? t : `${t}Z`);
}

async function fetchWeather(
  lat: number,
  lng: number,
  targetMs: number,
  days: number,
  signal: AbortSignal,
): Promise<WeatherView | null> {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat.toFixed(4)}&longitude=${lng.toFixed(4)}` +
    `&hourly=temperature_2m,weather_code` +
    `&timezone=UTC&forecast_days=${days}`;

  const res = await fetch(url, { signal });
  if (!res.ok) return null;

  const json = (await res.json()) as Forecast;
  const times = json.hourly?.time;
  const temps = json.hourly?.temperature_2m;
  const codes = json.hourly?.weather_code;
  if (!Array.isArray(times) || !Array.isArray(temps) || !Array.isArray(codes)) return null;

  // The slot closest to the moment we care about. Open-Meteo is hourly, so the
  // worst case is thirty minutes off, which is well inside the accuracy of a
  // four-day forecast anyway.
  let best = -1;
  let bestGap = Infinity;
  for (let i = 0; i < times.length; i++) {
    const t = times[i];
    if (typeof t !== "string") continue;
    if (typeof temps[i] !== "number" || typeof codes[i] !== "number") continue;
    const ms = parseSlot(t);
    if (Number.isNaN(ms)) continue;
    const gap = Math.abs(ms - targetMs);
    if (gap < bestGap) {
      bestGap = gap;
      best = i;
    }
  }
  if (best < 0) return null;

  const code = codes[best] as number;
  return { tempC: Math.round(temps[best] as number), code, label: labelFor(code) };
}

// ─── The hook ────────────────────────────────────────────────────────────────

/**
 * Returns null until (and unless) a forecast is available. Null means "render
 * nothing at all" — not "render a placeholder".
 *
 * @param point  Coordinates to forecast for, or null to skip the fetch entirely.
 *               Callers must pass null when `!hasCoords(point)`.
 * @param whenIso ISO 8601 UTC instant to pick the closest hourly slot for.
 */
export function useWeather(
  point: { lat: number; lng: number } | null,
  whenIso: string,
): WeatherView | null {
  const lat = point?.lat;
  const lng = point?.lng;

  // No point, no fetch. This is the live/after phases, and it is the whole
  // reason the itinerary keeps working with the network switched off.
  const targetMs = Date.parse(whenIso);
  const requestKey =
    typeof lat === "number" && typeof lng === "number" && !Number.isNaN(targetMs)
      ? keyFor(lat, lng, hourKey(targetMs))
      : null;

  /**
   * The result is stored WITH the key it was fetched for, and the hook returns
   * it only when that key still matches what the caller is asking for now.
   *
   * That is what makes every "nothing to show" case a plain `return` from the
   * effect instead of a `setView(null)`: a stale entry simply stops matching.
   * Clearing derived state from inside an effect is both a cascading render and
   * a frame of the wrong forecast on screen.
   */
  const [entry, setEntry] = useState<{ key: string; view: WeatherView | null } | null>(null);

  /**
   * A still-warm cache entry, read during render rather than copied into state
   * by an effect. Navigating back to a screen whose forecast is already cached
   * therefore paints it on the first render, with no extra commit and no frame
   * of a missing weather row.
   */
  const cachedHit = requestKey !== null ? cache.get(requestKey) : undefined;
  const cached =
    cachedHit && getServerTime() - cachedHit.at < (cachedHit.view ? TTL_OK : TTL_FAIL)
      ? cachedHit
      : null;

  useEffect(() => {
    if (requestKey === null || typeof lat !== "number" || typeof lng !== "number") return;

    // How many days of forecast we need. `getServerTime()` rather than
    // `Date.now()` so that everything in this template reads one clock.
    const spanDays = Math.round((utcMidnight(targetMs) - utcMidnight(getServerTime())) / 86_400_000);
    // Already been and gone, or past the forecast horizon (a date three weeks
    // out has no forecast to show). Nothing to ask for; the row stays hidden.
    if (spanDays < 0 || spanDays + 1 > MAX_FORECAST_DAYS) return;
    const days = Math.min(MAX_FORECAST_DAYS, Math.max(1, spanDays + 1));

    const key = requestKey;

    // A live cache entry is served straight out of render below, so there is
    // nothing to do here and nothing to set.
    if (cached !== null) return;

    let alive = true;

    let job = inflight.get(key);
    if (!job) {
      const ctrl = new AbortController();
      const promise = fetchWeather(lat, lng, targetMs, days, ctrl.signal).then(
        (v) => {
          cache.set(key, { at: getServerTime(), view: v });
          inflight.delete(key);
          return v;
        },
        (err: unknown) => {
          inflight.delete(key);
          // An abort is us, not them — do not remember it as a failed forecast.
          const aborted = (err as { name?: string } | null)?.name === "AbortError";
          if (!aborted) cache.set(key, { at: getServerTime(), view: null });
          return null;
        },
      );
      job = { promise, ctrl, refs: 0 };
      inflight.set(key, job);
    }
    job.refs += 1;
    const mine = job;

    void mine.promise.then((v) => {
      if (alive) setEntry({ key, view: v });
    });

    return () => {
      alive = false;
      mine.refs -= 1;
      // Last one out aborts. Nothing is left running for a screen nobody is on.
      if (mine.refs <= 0) {
        inflight.delete(key);
        mine.ctrl.abort();
      }
    };
  }, [lat, lng, targetMs, requestKey, cached]);

  if (cached !== null) return cached.view;
  return entry && entry.key === requestKey ? entry.view : null;
}

// ─── The icon ────────────────────────────────────────────────────────────────

/**
 * Hand-drawn inline SVG for a WMO code. Line art, single accent colour, and
 * drawn here rather than pulled from an icon set because a Material glyph or a
 * ☀️ emoji sitting in the middle of Tinos on cream paper looks exactly like
 * what it is — a component from a different design landing on the invitation.
 */
export function WeatherIcon({
  code,
  size = 16,
  color = ACCENT,
}: {
  code: number;
  size?: number;
  color?: string;
}) {
  const family = weatherFamily(code);

  // A cloud, reused by six of the eight faces. Drawn once, at one weight.
  const cloud = <path d="M6.4 15.5a3.4 3.4 0 0 1 .5-6.8 4.7 4.7 0 0 1 9 .8 3 3 0 0 1-.5 6h-9Z" />;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
      style={{ display: "inline-block", verticalAlign: "-0.14em", flexShrink: 0 }}
    >
      {family === "clear" && (
        <>
          <circle cx="12" cy="12" r="4.4" />
          <path d="M12 3.4v2.2M12 18.4v2.2M3.4 12h2.2M18.4 12h2.2M5.9 5.9l1.6 1.6M16.5 16.5l1.6 1.6M18.1 5.9l-1.6 1.6M7.5 16.5l-1.6 1.6" />
        </>
      )}

      {family === "mostly-clear" && (
        <>
          <circle cx="9" cy="8.6" r="3.4" />
          <path d="M9 2.6v1.7M3 8.6h1.7M4.8 4.4l1.2 1.2M13.2 4.4 12 5.6" />
          <path d="M10.4 19.6a3.1 3.1 0 0 1 .4-6.2 4.3 4.3 0 0 1 8.2.7 2.8 2.8 0 0 1-.4 5.5h-8.2Z" />
        </>
      )}

      {family === "cloudy" && (
        <>
          <path d="M4.8 12.6A3 3 0 0 1 8 7.2a4.4 4.4 0 0 1 7.6-1" opacity="0.65" />
          {cloud}
        </>
      )}

      {family === "fog" && (
        <>
          {cloud}
          <path d="M4.5 18.6h9M7.5 21.4h10" />
        </>
      )}

      {family === "drizzle" && (
        <>
          {cloud}
          <path d="M9 18.4v1.8M13.4 18.4v1.8" />
        </>
      )}

      {family === "rain" && (
        <>
          {cloud}
          <path d="M8.4 18.2 7.2 21.4M12.4 18.2l-1.2 3.2M16.4 18.2l-1.2 3.2" />
        </>
      )}

      {family === "snow" && (
        <>
          {cloud}
          <path d="M8.6 18.6v2.8M7.4 19.3l2.4 1.4M9.8 19.3l-2.4 1.4M15 18.6v2.8M13.8 19.3l2.4 1.4M16.2 19.3l-2.4 1.4" />
        </>
      )}

      {family === "thunder" && (
        <>
          {cloud}
          <path d="M12.6 17.4 9.8 21h3.4l-1.4 3" />
        </>
      )}
    </svg>
  );
}

/** "26°, clear" — the invitation's dot-leader value. "" when `w` is null. */
export function weatherText(w: WeatherView | null): string {
  return w ? `${w.tempC}°, ${w.label}` : "";
}
