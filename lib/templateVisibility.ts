// ─── Which templates this deployment shows ───────────────────────────────────
//
// The catalogue is code — `data/template-registry.ts` imports every template's
// config, and that list is what exists. This module answers the separate
// question of which of them an admin has switched on for THIS deployment, and it
// is the only thing the gallery and the builder gate consult.
//
// The server's half is `config/templateVisibility.ts` + `models/TemplateVisibility.ts`.
// It returns the HIDDEN slugs, not the live ones: the list is normally one or two
// entries against a catalogue of fifty, and it makes the failure mode the safe
// one — a request that fails leaves us with an empty hidden list and a gallery
// that shows what it always showed.
//
// ── WHY THERE IS A COPY OF THE DEFAULT HERE ─────────────────────────────────
//
// `DEFAULT_HIDDEN` below duplicates the server constant of the same name, and
// that duplication is deliberate rather than laziness. Without it there is a
// window — from first paint until the fetch resolves — where a template the
// admin has not released yet is on screen. Whatever made it worth holding back
// is then in front of everyone for a second, which is the whole thing this
// feature exists to prevent. Seeding the client with the same defaults means a
// held-back template is never rendered even once.
//
// The server still has the last word in both directions: once the response
// lands, its list replaces this one entirely, so switching a template ON in the
// admin screen shows it even though it is named here.
//
// ── THE TWO LISTS DO NOT MEAN QUITE THE SAME THING ──────────────────────────
//
// The server applies its copy only on the apex domain — a new template is held
// back from the public site but open on staging and on a laptop, which is where
// it needs to be seen. This copy is pessimistic everywhere, because at first
// paint the client does not yet know what the server will say and the wrong
// guess to make is the one that shows something held back.
//
// The visible consequence is small and correct: on staging these cards appear a
// moment after the rest, once the answer arrives.
//
// Keep the slugs in step. They only ever name brand-new templates, so the moment
// to edit both is the commit that adds one.

import { API_URL, IS_NGROK } from "@/lib/config";

/** Mirrors `DEFAULT_HIDDEN` in server/src/config/templateVisibility.ts. */
export const DEFAULT_HIDDEN: readonly string[] = [
  "happy-rakshabandhan-to-brother",
  "happy-rakshabandhan-to-sister",
];

type Listener = () => void;

let hidden: ReadonlySet<string> = new Set(DEFAULT_HIDDEN);
/** True once the server has answered — the admin screen shows this. */
let settled = false;
let inFlight: Promise<void> | null = null;
const listeners = new Set<Listener>();

function emit(): void {
  for (const l of listeners) l();
}

/**
 * Fetch once per page load and share the result.
 *
 * Not per component: the gallery, the favourites list and the builder gate all
 * ask, and three identical requests on one navigation is three chances to be
 * rate-limited into showing the wrong thing.
 */
function load(fresh = false): Promise<void> {
  if (inFlight) return inFlight;
  inFlight = (async () => {
    try {
      // ── WHY `fresh` EXISTS ────────────────────────────────────────────────
      //
      // The endpoint is sent with `max-age=60` so the gallery is cheap for
      // visitors, and a minute of staleness there is the documented cost of a
      // toggle. It is NOT acceptable for the admin who just flipped the switch:
      // served from cache, their own tab keeps showing the old answer and the
      // switch reads as broken. So the admin path asks past the cache.
      const url = fresh
        ? `${API_URL}/template-visibility?t=${Date.now()}`
        : `${API_URL}/template-visibility`;
      const res = await fetch(url, {
        cache: fresh ? "no-store" : "default",
        headers: IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : undefined,
      });
      const json = await res.json();
      const list = json?.data?.hidden;
      if (Array.isArray(list)) {
        hidden = new Set(list.filter((s: unknown): s is string => typeof s === "string"));
      }
    } catch {
      // Keep the built-in defaults. Nothing else changes: an unreachable API
      // must not empty the gallery.
    } finally {
      settled = true;
      emit();
    }
  })();
  return inFlight;
}

/**
 * Force the next read to go to the server again.
 *
 * The admin screen calls this after a toggle so the gallery in the same tab
 * agrees with what the admin just did, rather than waiting out the CDN's minute.
 */
export function refreshTemplateVisibility(): Promise<void> {
  inFlight = null;
  settled = false;
  return load(true);
}

export function subscribeTemplateVisibility(listener: Listener): () => void {
  listeners.add(listener);
  void load();
  return () => {
    listeners.delete(listener);
  };
}

export const getHiddenTemplates = (): ReadonlySet<string> => hidden;
export const isTemplateVisibilitySettled = (): boolean => settled;

/**
 * Server snapshot. Deliberately the same value the client starts with, so the
 * markup React renders on the server matches the first client render and there
 * is no hydration mismatch — and so a held-back template is absent from the HTML
 * a crawler sees, not merely hidden after hydration.
 */
export const getHiddenTemplatesServerSnapshot = (): ReadonlySet<string> => SERVER_SNAPSHOT;
const SERVER_SNAPSHOT: ReadonlySet<string> = new Set(DEFAULT_HIDDEN);
