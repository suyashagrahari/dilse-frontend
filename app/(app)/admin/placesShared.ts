"use client";

// ─── Shared by /admin/places and /admin/templates ────────────────────────────
//
// The API calls and rules behind "where does a template show": the Templates
// page exclusions (TemplateCollection "gallery-exclude"), the /wedding list
// (TemplateCollection "wedding"), the Premium room (TemplateTier overrides)
// and each seasonal drop (SeasonSettings drops[id].saleSlugs). Both screens
// write through these helpers so the rules — which tier write puts a template
// in the Premium room, how a drop is written without touching the rest of the
// season — live in one place.
//
// Drop ids are never hardcoded here: they come from the server's season
// settings, so a new drop shows up everywhere the moment the server has it.

import { useMemo } from "react";
import { API_URL } from "@/lib/config";
import { DROPS } from "@/lib/season";
import { PREMIUM_SLUGS, ULTRA_PREMIUM_SLUGS } from "@/data/template-registry";
import { GALLERY_LIST, pinFirst } from "@/lib/galleryRules";
import { useTemplateMeta } from "@/lib/templateMeta";
import { weddingItems, type WeddingFilter } from "../wedding/content";

export type WeddingGroup = Exclude<WeddingFilter, "all">;
export type PlaceItem = { slug: string; group?: WeddingGroup };

export const DROP_MAX = 50;
export const WEDDING_MAX = 300;
export const GALLERY_EXCLUDE_MAX = 300;

/** One admin API call; throws the server's error message on failure. */
export async function adminApi(token: string | null | undefined, path: string, init?: RequestInit): Promise<Record<string, unknown>> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    cache: "no-store",
  });
  let json: { success?: boolean; error?: string; data?: unknown } = {};
  try { json = await res.json(); } catch { /* non-JSON error page */ }
  if (!res.ok || !json?.success) throw new Error(json?.error || `Request failed (${res.status})`);
  return (json.data ?? {}) as Record<string, unknown>;
}

/** The Templates page's exclusions carry no order: kept sorted so toggling back is not "unsaved". */
export const sortItems = <T extends { slug: string }>(items: T[]) =>
  [...items].sort((a, b) => (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0));

// ── Curated collections ──────────────────────────────────────────────────────

export type CollectionKey = "wedding" | "gallery-exclude";

/** The saved list, or null when nothing is saved (wedding: the automatic rule). */
export async function getCollection(token: string | null | undefined, key: CollectionKey): Promise<PlaceItem[] | null> {
  const d = await adminApi(token, `/admin/template-collections/${key}`);
  const c = d.collection as { items: { slug: string; group?: string }[] } | null;
  if (!c) return null;
  return c.items.map((i) => (i.group ? { slug: i.slug, group: i.group as WeddingGroup } : { slug: i.slug }));
}

export async function putCollection(token: string | null | undefined, key: CollectionKey, items: PlaceItem[]): Promise<PlaceItem[]> {
  const d = await adminApi(token, `/admin/template-collections/${key}`, {
    method: "PUT",
    body: JSON.stringify({ items: items.map((i) => (i.group ? { slug: i.slug, group: i.group } : { slug: i.slug })) }),
  });
  const c = d.collection as { items: { slug: string; group?: string }[] };
  return c.items.map((i) => (i.group ? { slug: i.slug, group: i.group as WeddingGroup } : { slug: i.slug }));
}

export async function deleteCollection(token: string | null | undefined, key: CollectionKey): Promise<void> {
  await adminApi(token, `/admin/template-collections/${key}`, { method: "DELETE" });
}

/**
 * The automatic /wedding list — what the hub shows while no list is saved:
 * every wedding-type template, newest-busiest first, under its default group.
 */
export function useAutoWedding(): PlaceItem[] {
  const { ranking, order } = useTemplateMeta();
  return useMemo(() => {
    const created = new Map(ranking.map((r) => [r.slug, r.created]));
    const idx = new Map(GALLERY_LIST.map((t, i) => [t.slug, i]));
    const ranked = [...GALLERY_LIST].sort(
      (a, b) => (created.get(b.slug) ?? 0) - (created.get(a.slug) ?? 0) || idx.get(a.slug)! - idx.get(b.slug)!
    );
    return weddingItems(pinFirst(ranked, order), null, () => false).map((t) => ({ slug: t.slug, group: t.group }));
  }, [ranking, order]);
}

// ── Premium (TemplateTier overrides) ─────────────────────────────────────────

/**
 * The one tier write that puts `slug` in (`on`) or takes it out of the Premium
 * room. A code-premium or ✦ template is in the room by default, so adding it
 * drops any override and removing it pins `premium: false`; an everyday
 * template is the other way round.
 */
export function premiumWrite(slug: string, on: boolean): { method: "PATCH" | "DELETE"; premium?: boolean } {
  const coded = ULTRA_PREMIUM_SLUGS.has(slug) || PREMIUM_SLUGS.has(slug);
  if (on) return coded ? { method: "DELETE" } : { method: "PATCH", premium: true };
  return coded ? { method: "PATCH", premium: false } : { method: "DELETE" };
}

export async function writePremium(token: string | null | undefined, slug: string, on: boolean): Promise<void> {
  const w = premiumWrite(slug, on);
  await adminApi(token, `/admin/template-tiers/${encodeURIComponent(slug)}`, {
    method: w.method,
    body: w.method === "PATCH" ? JSON.stringify({ premium: w.premium }) : undefined,
  });
}

export async function getTiers(token: string | null | undefined): Promise<Record<string, boolean>> {
  const t = await adminApi(token, "/admin/template-tiers");
  const m: Record<string, boolean> = {};
  for (const r of (t.rows ?? []) as { slug: string; premium: boolean }[]) m[r.slug] = r.premium;
  return m;
}

// ── Seasonal drops (SeasonSettings) ──────────────────────────────────────────

export type SeasonSnapshot = Record<string, unknown> & {
  mode?: string;
  split?: boolean;
  modeIndia?: string;
  modeAbroad?: string;
  drops?: Record<string, { saleSlugs?: string[] }>;
};

const DROP_TAB_ORDER = ["wedding", "halloween", "diwali", "dandiya"];
export const dropRank = (id: string) => (DROP_TAB_ORDER.includes(id) ? DROP_TAB_ORDER.indexOf(id) : 99);
export const dropLabel = (id: string) =>
  (DROPS as Record<string, { label: string } | undefined>)[id]?.label.replace(/ drop$/, "") ?? id.charAt(0).toUpperCase() + id.slice(1);
export const dropPath = (id: string) => (DROPS as Record<string, { path: string } | undefined>)[id]?.path;

/** Every drop the server knows, in the season's calendar order. */
export const dropIdsOf = (s: SeasonSnapshot | null | undefined) =>
  Object.keys(s?.drops ?? {}).sort((a, b) => dropRank(a) - dropRank(b));

export const dropSlugsIn = (s: SeasonSnapshot | null | undefined, id: string): string[] =>
  (s?.drops?.[id]?.saleSlugs ?? []).map(String);

/** The drops some visitor sees right now (the mode, or both sides' while split). */
export function activeDropIds(s: SeasonSnapshot | null | undefined): Set<string> {
  const ids = new Set(Object.keys(s?.drops ?? {}));
  const modes = s?.split ? [s.modeIndia, s.modeAbroad] : [s?.mode];
  return new Set(modes.filter((m): m is string => typeof m === "string" && ids.has(m)));
}

export const getSeason = (token: string | null | undefined) => adminApi(token, "/admin/super/season") as Promise<SeasonSnapshot>;

export class DropConflictError extends Error {
  constructor(public live: string[]) {
    super("This drop was changed elsewhere since you opened it — the saved list was reloaded; check and try again");
  }
}

/**
 * Read-modify-write one drop's templates. Re-reads the season, refuses (with
 * the live list) if the drop no longer matches `expected`, then sends a patch
 * naming only this drop's slugs. `otherChanged` is true if anything besides
 * those slugs differs afterwards — a concurrent edit worth telling the admin.
 */
export async function writeDropSlugs(
  token: string | null | undefined,
  id: string,
  expected: string[],
  next: string[],
): Promise<{ saved: string[]; otherChanged: boolean; season: SeasonSnapshot }> {
  if (next.length === 0) throw new Error("A drop needs at least one template");
  if (next.length > DROP_MAX) throw new Error(`A drop holds at most ${DROP_MAX} templates`);
  const before = await getSeason(token);
  const live = dropSlugsIn(before, id);
  if (live.join() !== expected.join()) throw new DropConflictError(live);
  const after = (await adminApi(token, "/admin/super/season", {
    method: "PUT",
    body: JSON.stringify({ drops: { [id]: { saleSlugs: next } } }),
  })) as SeasonSnapshot;
  const strip = (s: SeasonSnapshot) => {
    const c = JSON.parse(JSON.stringify(s)) as SeasonSnapshot;
    delete c.updatedAt; delete c.updatedBy;
    if (c.drops?.[id]) delete c.drops[id].saleSlugs;
    // The flat `saleSlugs` mirror the drop the site shows — this one, if active.
    if (activeDropIds(before).has(id)) delete c.saleSlugs;
    return JSON.stringify(c);
  };
  const saved = after.drops?.[id]?.saleSlugs ? dropSlugsIn(after, id) : next;
  return { saved, otherChanged: strip(before) !== strip(after), season: after };
}
