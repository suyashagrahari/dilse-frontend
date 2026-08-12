import { templateList } from "@/data/template-registry";
import type { WallEntry } from "./types";

// ─── Dates ───────────────────────────────────────────────────────────────────
//
// "4 minutes ago" is the format that reads as fake — and it is the format that
// *becomes* fake the moment anyone is tempted to smooth a quiet hour. Buckets
// remove the temptation: there is no precision here to fabricate, because none
// is displayed.

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

/**
 * A deliberately coarse relative date.
 *
 * `now` is a parameter rather than a `Date.now()` call so this stays pure and
 * the server and client renders of the same entry cannot disagree across a
 * bucket boundary and trigger a hydration mismatch.
 */
export function wallDate(iso: string, now: number): string {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return "";

  const age = now - then;
  // A clock skew between the API host and the renderer can put a fresh entry
  // very slightly in the future. That is "today", not "in -3 seconds".
  if (age < DAY) return "today";
  if (age < 7 * DAY) return "this week";
  if (age < 30 * DAY) return "this month";

  return new Date(then).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

// ─── Card copy ───────────────────────────────────────────────────────────────

/**
 * The one sentence a card says.
 *
 * A wedding invitation names a couple, so "Arjun made this for Priya" would
 * describe it wrongly — those read "Arjun & Priya" instead.
 */
export function wallCaption(e: Pick<WallEntry, "creatorFirstName" | "recipientFirstName" | "pairing">): {
  lead: string;
  joiner: string;
  trail: string;
} {
  if (e.pairing === "and") {
    return { lead: e.creatorFirstName, joiner: " & ", trail: e.recipientFirstName };
  }
  return { lead: e.creatorFirstName, joiner: " made this for ", trail: e.recipientFirstName };
}

// ─── Palette ─────────────────────────────────────────────────────────────────

export interface WallPalette {
  emoji: string;
  color: string;
  bgGradient: string;
  title: string;
}

const BY_SLUG = new Map(templateList.map((t) => [t.slug, t]));

/**
 * A template's own colours, so a preview card looks like the thing it stands
 * for rather than a house grey. Falls back to the Wall's own accent for a slug
 * the client registry does not know — which can happen for a beat after a new
 * template ships on the server before the client redeploys.
 */
export function wallPalette(slug: string, fallbackTitle: string): WallPalette {
  const t = BY_SLUG.get(slug);
  return {
    emoji: t?.emoji ?? "✨",
    color: t?.color ?? "#8a6a3d",
    bgGradient: t?.bgGradient ?? "linear-gradient(135deg,#f3e7d8,#e6d3bd)",
    title: t?.title ?? fallbackTitle,
  };
}

/** Where "Make one like this" goes. */
export function builderHref(slug: string): string {
  return `/${slug}`;
}
