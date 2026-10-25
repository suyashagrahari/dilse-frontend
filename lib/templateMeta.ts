"use client";

// ─── Template meta: premium tier overrides + "most created" ranking ──────────
//
// One anonymous fetch of `/api/template-meta`, shared by every consumer on the
// page (module-level cache, like lib/pricing.ts). Until it resolves — or if it
// fails — the gallery keeps registry order and the code's PREMIUM_SLUGS, so a
// slow or dead endpoint never blanks or reshuffles anything badly.

import { useEffect, useMemo, useState } from "react";
import { API_URL } from "@/lib/config";
import { PREMIUM_SLUGS, ULTRA_PREMIUM_SLUGS } from "@/data/template-registry";

export interface TemplateMeta {
  /** Super-admin overrides only: slug → premium. */
  tiers: Record<string, boolean>;
  /** Pages created per template, busiest first. */
  ranking: { slug: string; created: number }[];
  /** Super-admin gallery order (/admin/template-order); empty = the code's PINNED_FIRST. */
  order: string[];
  /**
   * Curated places (/admin/places). `wedding` is the /wedding hub's list, in
   * order, once a super admin saved one; `null` = the hub's automatic rule.
   * An older server without the field reads as `null` everywhere.
   */
  collections: TemplateCollections;
  /** True once the server has answered (false while loading or if it failed). */
  loaded: boolean;
}

export type CollectionItem = { slug: string; group?: string };
export type TemplateCollections = {
  wedding: { items: CollectionItem[] } | null;
  /**
   * Live templates kept OFF the main gallery (/templates, its search and the
   * Premium room) — server key "gallery-exclude". `null` = nothing excluded,
   * which is also what an older server without the key reads as. Apply it
   * only through `isListedOnGallery` (lib/galleryRules.ts).
   */
  galleryExclude: { items: CollectionItem[] } | null;
};

const EMPTY: TemplateMeta = { tiers: {}, ranking: [], order: [], collections: { wedding: null, galleryExclude: null }, loaded: false };

/** Tolerant read of one place: anything malformed is "automatic" (null). */
export function parseCollection(raw: unknown): { items: CollectionItem[] } | null {
  if (!raw || typeof raw !== "object" || !Array.isArray((raw as { items?: unknown }).items)) return null;
  const items: CollectionItem[] = [];
  for (const v of (raw as { items: unknown[] }).items) {
    if (!v || typeof v !== "object") continue;
    const { slug, group } = v as { slug?: unknown; group?: unknown };
    if (typeof slug !== "string" || !slug) continue;
    items.push(typeof group === "string" && group ? { slug, group } : { slug });
  }
  return { items };
}

export function parseCollections(raw: unknown): TemplateCollections {
  const o = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return { wedding: parseCollection(o.wedding), galleryExclude: parseCollection(o["gallery-exclude"]) };
}

/** The excluded slugs of a parsed `galleryExclude`, lower-cased. */
export function galleryExcludedSet(c: { items: CollectionItem[] } | null | undefined): ReadonlySet<string> {
  return new Set((c?.items ?? []).map((i) => i.slug.toLowerCase()));
}

let meta: TemplateMeta = EMPTY;
let inflight: Promise<void> | null = null;
const listeners = new Set<() => void>();

function load(fresh = false): Promise<void> {
  if (inflight && !fresh) return inflight;
  inflight = (async () => {
    try {
      const res = await fetch(`${API_URL}/template-meta`, { cache: fresh ? "no-store" : "no-cache" });
      const json = await res.json();
      if (json?.success && json.data) {
        meta = {
          tiers: json.data.tiers && typeof json.data.tiers === "object" ? json.data.tiers : {},
          ranking: Array.isArray(json.data.ranking) ? json.data.ranking : [],
          order: Array.isArray(json.data.order) ? json.data.order.filter((x: unknown): x is string => typeof x === "string") : [],
          collections: parseCollections(json.data.collections),
          loaded: true,
        };
        listeners.forEach((l) => l());
      }
    } catch {
      /* keep defaults */
    }
  })();
  return inflight;
}

/** For the admin panel after it changes a tier, the gallery order or a curated place. */
export function refreshTemplateMeta(): Promise<void> {
  return load(true);
}

export function useTemplateMeta(): TemplateMeta {
  const [m, setM] = useState<TemplateMeta>(meta);
  useEffect(() => {
    const l = () => setM(meta);
    listeners.add(l);
    void load();
    l();
    return () => { listeners.delete(l); };
  }, []);
  return m;
}

/**
 * The slugs kept off the main gallery for this visitor's page.
 *
 * `serverList` is what the page's server shell resolved (so a just-excluded
 * template does not flash in and out); once this tab's own fetch has
 * answered, that answer wins. Neither known → nothing excluded.
 */
export function useGalleryExcluded(serverList?: readonly string[] | null): ReadonlySet<string> {
  const { collections, loaded } = useTemplateMeta();
  return useMemo(() => {
    if (loaded) return galleryExcludedSet(collections.galleryExclude);
    return new Set((serverList ?? []).map((s) => s.toLowerCase()));
  }, [loaded, collections.galleryExclude, serverList]);
}

/** Is this template premium, after super-admin overrides? */
export function isPremiumSlug(slug: string, tiers: Record<string, boolean>): boolean {
  return Object.prototype.hasOwnProperty.call(tiers, slug) ? Boolean(tiers[slug]) : PREMIUM_SLUGS.has(slug);
}

/**
 * Which pricing room a template belongs to. Like `isPremiumSlug`, except a ✦
 * template (ULTRA_PREMIUM_SLUGS) that nobody pinned counts as Premium: it sits
 * in the Premium tab (and the main grid with a gold card), so pricing it next
 * to the everyday $2 templates hid it from whoever went looking under Premium.
 */
export function isPremiumRoom(slug: string, tiers: Record<string, boolean>): boolean {
  return Object.prototype.hasOwnProperty.call(tiers, slug) ? Boolean(tiers[slug]) : PREMIUM_SLUGS.has(slug) || ULTRA_PREMIUM_SLUGS.has(slug);
}

/** The five rank badges, #1 first. */
export const RANK_BADGES = [
  { label: "Most loved", icon: "👑", tone: "gold" },
  { label: "Trending", icon: "🔥", tone: "fire" },
  { label: "Hot", icon: "⚡", tone: "hot" },
  { label: "Rising", icon: "🚀", tone: "rise" },
  { label: "Fan fave", icon: "💫", tone: "fan" },
] as const;

/** "1.2k" style. */
export function compactCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "")}k`;
  return String(n);
}
