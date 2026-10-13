"use client";

// ─── Template meta: premium tier overrides + "most created" ranking ──────────
//
// One anonymous fetch of `/api/template-meta`, shared by every consumer on the
// page (module-level cache, like lib/pricing.ts). Until it resolves — or if it
// fails — the gallery keeps registry order and the code's PREMIUM_SLUGS, so a
// slow or dead endpoint never blanks or reshuffles anything badly.

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import { PREMIUM_SLUGS, ULTRA_PREMIUM_SLUGS } from "@/data/template-registry";

export interface TemplateMeta {
  /** Super-admin overrides only: slug → premium. */
  tiers: Record<string, boolean>;
  /** Pages created per template, busiest first. */
  ranking: { slug: string; created: number }[];
}

const EMPTY: TemplateMeta = { tiers: {}, ranking: [] };

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
        };
        listeners.forEach((l) => l());
      }
    } catch {
      /* keep defaults */
    }
  })();
  return inflight;
}

/** For the admin panel after it changes a tier. */
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
