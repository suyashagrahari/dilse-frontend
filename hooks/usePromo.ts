"use client";

// ─── The wishlist sale countdown, shared by every banner ────────────────────
//
// One fetch of GET /promo/active per page view (re-asked after a minute), held
// in a module store so the blog's marquee and its in-article card agree to the
// second. The countdown runs to the server's `endsAt`, corrected by the gap
// between the server's clock and this device's, so a phone set to the wrong
// day still shows the true time left. At zero the banners hide on the spot —
// the server says the same on its next answer.

import { useEffect, useSyncExternalStore } from "react";
import { API_URL, IS_NGROK } from "@/lib/config";

export type PromoStyle = "sale" | "last-chance" | "extended";

export type ActivePromo = {
  campaign: string;
  label: string;
  discountPercent: number;
  path: string;
  style: PromoStyle;
  runNumber: number;
  /** ms since epoch, already on this device's clock. */
  endsAtLocal: number;
  joined: number;
};

let promo: ActivePromo | null = null;
let fetchedAt = 0;
let inflight: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

async function load() {
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const res = await fetch(`${API_URL}/promo/active`, {
        headers: IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : undefined,
      });
      const json = await res.json().catch(() => null);
      const d = json?.data;
      if (!res.ok || !json?.success || !d?.active) {
        promo = null;
      } else {
        const skew = new Date(d.serverNow).getTime() - Date.now();
        promo = {
          campaign: d.campaign, label: d.label, discountPercent: d.discountPercent, path: d.path,
          style: d.style, runNumber: d.runNumber, joined: d.joined,
          endsAtLocal: new Date(d.endsAt).getTime() - (Number.isFinite(skew) ? skew : 0),
        };
      }
      fetchedAt = Date.now();
    } catch {
      // Offline or the API is down: no banner, which is the safe direction.
    } finally {
      inflight = null;
      emit();
    }
  })();
  return inflight;
}

// ── One shared one-second clock, ticking only while something shows a timer ──
let now = 0;
let timer: ReturnType<typeof setInterval> | null = null;
const clockListeners = new Set<() => void>();
function subscribeClock(l: () => void) {
  clockListeners.add(l);
  if (!timer) {
    now = Date.now();
    timer = setInterval(() => {
      now = Date.now();
      clockListeners.forEach((f) => f());
    }, 1000);
  }
  return () => {
    clockListeners.delete(l);
    if (clockListeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

/** Wall-clock ms, re-rendering every second. 0 on the server and first paint. */
export function useNow(): number {
  // The snapshot must be stable between ticks, so it is read once and then
  // only moved by the interval (or a fresh subscription).
  return useSyncExternalStore(subscribeClock, () => (now ||= Date.now()), () => 0);
}

/** The live sale, or null — none running, not loaded yet, or the clock ran out. */
export function usePromo(): ActivePromo | null {
  const p = useSyncExternalStore(subscribe, () => promo, () => null);
  useEffect(() => {
    if (!fetchedAt || Date.now() - fetchedAt > 60_000) void load();
  }, []);
  const t = useNow();
  if (!p || !t || t >= p.endsAtLocal) return null;
  return p;
}

export type Countdown = { d: number; h: number; m: number; s: number; totalMs: number };

export function countdown(endsAtLocal: number, t: number): Countdown {
  const totalMs = Math.max(0, endsAtLocal - t);
  const sec = Math.floor(totalMs / 1000);
  return { d: Math.floor(sec / 86400), h: Math.floor((sec % 86400) / 3600), m: Math.floor((sec % 3600) / 60), s: sec % 60, totalMs };
}

export const pad2 = (n: number) => String(n).padStart(2, "0");

/** Where a banner tap goes: the wishlist page, which opens the join by itself. */
export function promoJoinHref(p: Pick<ActivePromo, "path">, source: string): string {
  return `${p.path}?join=1&src=${encodeURIComponent(source)}`;
}

/** The headline for each banner style the super admin can pick. */
export function promoCopy(p: Pick<ActivePromo, "style" | "discountPercent">) {
  const pct = `${p.discountPercent}% OFF`;
  switch (p.style) {
    case "last-chance":
      return { tag: "LAST CHANCE", title: `${pct} is back — don't miss it twice`, emoji: "⏳" };
    case "extended":
      return { tag: "EXTENDED", title: `By popular demand: ${pct} for a few more days`, emoji: "🎉" };
    default:
      return { tag: "WISHLIST SALE", title: `${pct} on Valentine's week templates`, emoji: "💘" };
  }
}

/** Remembered per run, so a restarted countdown shows again. */
const DISMISS_KEY = "ss:promo-dismissed";
export function isPromoDismissed(p: Pick<ActivePromo, "campaign" | "runNumber">): boolean {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === `${p.campaign}:${p.runNumber}`;
  } catch {
    return false;
  }
}
export function dismissPromo(p: Pick<ActivePromo, "campaign" | "runNumber">) {
  try {
    sessionStorage.setItem(DISMISS_KEY, `${p.campaign}:${p.runNumber}`);
  } catch {
    /* storage blocked: it just hides for this render */
  }
  emit();
}
/** Re-render on dismiss, reading sessionStorage only in the browser. */
export function usePromoDismissed(p: ActivePromo | null): boolean {
  return useSyncExternalStore(subscribe, () => (p ? isPromoDismissed(p) : false), () => false);
}
