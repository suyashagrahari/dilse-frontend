// ─── Rewind — everything the screens show, worked out once ───────────────────
//
// The numbers are still DERIVED, never typed: minutes, plays, seasons and the
// weekday all come out of `deriveStats(startDate)`; the couple aura comes out
// of `computeArchetype(answers)`. This file only packages them for the shell,
// the story and the summary card so all three agree to the digit.

import { useEffect, useMemo, useState } from "react";
import { hash32 } from "@/lib/seededRandom";
import { computeArchetype, deriveStats, parseSong, type Archetype, type DerivedStats, type RewindData, type Song } from "./types";
import { AURA, firstName } from "./theme";

export interface Year {
  stats: DerivedStats;
  archetype: Archetype;
  aura: (typeof AURA)[string];
  minutes: number;
  /** "played 1,161 times" — the #1 song, scaled off the days. */
  plays: number;
  songs: Song[];
  places: string[];
  genres: string[];
  reasons: string[];
  jokes: RewindData["stats"];
  year: number;
  startYear: number;
  to: string;
  from: string;
  playlist: string;
  /** "Total length" of the playlist, in minutes — made up, but stable. */
  playlistMins: number;
  ready: boolean;
}

/** The clock is captured once, on the client — server and browser disagree on Date.now(). */
export function useNow(): number | null {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const r = requestAnimationFrame(() => setNow(Date.now()));
    return () => cancelAnimationFrame(r);
  }, []);
  return now;
}

export function useYear(data: RewindData): Year {
  const now = useNow();
  return useMemo(() => {
    const at = now ?? (Date.parse(data.startDate) || 0);
    const stats = deriveStats(data.startDate, at);
    const archetype = computeArchetype(data.answers, data.startDate);
    const startMs = Date.parse(data.startDate);
    const minutes = Math.floor(Math.max(0, at - (Number.isNaN(startMs) ? at : startMs)) / 60_000);
    const songs = data.songs.map(parseSong).filter((s) => s.title);
    const seed = hash32(`${data.startDate}|${songs[0]?.title ?? ""}`);
    return {
      stats,
      archetype,
      aura: AURA[archetype.id] ?? AURA.slowburn,
      minutes,
      plays: Math.max(7, Math.round(stats.days * 1.37) + (seed % 40)),
      songs,
      places: data.places.map((p) => p.trim()).filter(Boolean),
      genres: data.genres.map((g) => g.trim()).filter(Boolean),
      reasons: data.topReasons.map((r) => (r ?? "").trim()).filter(Boolean),
      jokes: data.stats.filter((s) => s.value.trim() || s.label.trim()).slice(0, 3),
      year: new Date(now ?? at).getFullYear(),
      startYear: Number.isNaN(startMs) ? new Date(at).getFullYear() : new Date(startMs).getUTCFullYear(),
      to: firstName(data.recipientName, "you"),
      from: firstName(data.senderName, "someone"),
      playlist: data.playlistName.trim() || "your songs",
      playlistMins: 14 + (seed % 9) + songs.length * 3,
      ready: now !== null,
    };
  }, [data, now]);
}

export const fmt = (n: number) => n.toLocaleString("en-IN");
