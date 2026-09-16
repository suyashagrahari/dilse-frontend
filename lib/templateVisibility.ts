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
// ── THE FIRST VALUE USED TO BE A GUESS. IT IS NOT ANY MORE ──────────────────
//
// A client module cannot know the real list until its fetch resolves, so this
// store used to open with a hardcoded copy of the server's defaults. A guess is
// wrong in one of two directions and both were on screen:
//
//   guessed hidden, actually live  → the builder rendered "Not available yet"
//                                    for a beat, then the template appeared
//   guessed live, actually hidden  → the gallery painted every held-back
//                                    template, then took them away
//
// The second is the one the guess existed to prevent, and it never did: the list
// only ever named the newest one or two templates, so the thirty-odd others an
// admin had switched off flashed in and out on every gallery load.
//
// So the real answer now arrives with the HTML. `getHiddenTemplatesServer()`
// resolves it during the server render and `TemplateVisibilityProvider` hands it
// to consumers, which makes the server markup, the first client render and the
// settled state one single list. Nothing flashes in either direction, and there
// is no second copy of the list to keep in step with the server's.
//
// ── SO WHAT IS `DEFAULT_HIDDEN` STILL FOR ───────────────────────────────────
//
// Only the case where that server-side resolve failed. Then nothing is provided,
// we fall back to fetching from the client exactly as before, and this is what
// is on screen until it lands. It is empty on purpose: now that the real answer
// comes down in the HTML, a slug here cannot hold a new template back from
// anybody — it can only hide a live one from the single visitor whose render was
// the one that could not reach the API. The list that decides what is held back
// is `server/src/config/templateVisibility.ts`.

import { API_URL, IS_NGROK } from "@/lib/config";

/**
 * What is hidden before anything has told us otherwise: the resolve-failed
 * fallback, and nothing else. Read the note above before adding a slug — this is
 * no longer the list that holds a new template back.
 */
export const DEFAULT_HIDDEN: readonly string[] = [];

type Listener = () => void;

let hidden: ReadonlySet<string> = new Set(DEFAULT_HIDDEN);
/** True once the server has answered — the admin screen shows this. */
let settled = false;
/**
 * Bumped every time a fetch of ours completes.
 *
 * `useHiddenTemplates` prefers the list the server render provided while this is
 * 0, and this store once it is not. That is what lets an admin's toggle win:
 * `refreshTemplateVisibility` bumps it, so their fresh answer replaces the
 * revalidated one in the page payload instead of being overwritten by it on the
 * next navigation.
 */
let revision = 0;
let inFlight: Promise<void> | null = null;
/**
 * Whether this page load has checked the list against the server itself.
 *
 * Distinct from `settled`, and the distinction is the whole point. `settled`
 * becomes true the moment a server-rendered list is adopted — but that list
 * travelled inside the page's HTML, and the HTML can be older than the visit.
 * See `verifyTemplateVisibility`.
 */
let verified = false;
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
  // The server render already answered this, from the same endpoint, on this
  // same page load. Asking again cannot improve on it and would cost a request
  // every time somebody opens a template. `refreshTemplateVisibility` clears
  // `settled` before calling, so the admin path still goes to the network.
  if (settled && !fresh) return Promise.resolve();
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
      revision += 1;
      emit();
    }
  })();
  return inFlight;
}

/**
 * Check the adopted list against the server, once per page load.
 *
 * ── THE STALENESS THIS EXISTS FOR ───────────────────────────────────────────
 *
 * Template routes are statically prerendered, so the list resolved by
 * `getHiddenTemplatesServer()` is baked into cached HTML and served back under
 * Next's stale-while-revalidate: the first visitor after the window lapses gets
 * the OLD page and only triggers the regeneration that fixes it. A visitor who
 * lands on that copy therefore reads a hidden list that was true when the page
 * was built, not when they opened it — and because `seedTemplateVisibility`
 * marks the store settled, nothing ever went back to ask.
 *
 * The symptom was precise and repeatable: open a newly released template, get
 * "Not available yet", open it again, get the template. First hit serves stale,
 * second hit serves what the background regeneration wrote.
 *
 * So this exists for the one case where being wrong is expensive — a refusal.
 * `load(true)` goes past the CDN, and completing bumps `revision`, which is
 * what makes `useHiddenTemplates` prefer this answer over the page payload.
 * Idempotent, because the caller is a render-driven effect.
 */
export function verifyTemplateVisibility(): Promise<void> {
  if (verified) return Promise.resolve();
  verified = true;
  // Past `settled`: it may mean nothing more than "a prerendered list was
  // adopted", which is exactly the state being questioned.
  inFlight = null;
  settled = false;
  return load(true);
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

/**
 * Adopt the list the server resolved for this page load.
 *
 * Called from `TemplateVisibilityProvider` on the client, purely so the fetch
 * above can be skipped — the value consumers actually read comes through React
 * context, which is per-request and therefore safe on the server. Deliberately
 * a no-op once we have fetched something ourselves, so an admin's refresh is not
 * walked back by a revalidated payload on their next navigation.
 */
export function seedTemplateVisibility(list: readonly string[]): void {
  if (settled) return;
  hidden = new Set(list);
  settled = true;
  // No `emit`, and no `revision` bump. This runs from a render, where telling
  // React an external store changed earns a "Cannot update a component while
  // rendering a different component" warning — and leaving `revision` at 0 is
  // what keeps context, not this, the thing consumers read.
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
/** See `revision`. Read by `useHiddenTemplates` to pick a source. */
export const getTemplateVisibilityRevision = (): number => revision;
export const getTemplateVisibilityRevisionServerSnapshot = (): number => 0;

/**
 * Server snapshot. Deliberately the same value the client starts with, so the
 * markup React renders on the server matches the first client render and there
 * is no hydration mismatch.
 *
 * A frozen constant rather than `hidden`, because on the server this module is
 * shared by every request in the process: reading the live variable would let
 * one request's seed leak into another's HTML, and the client — which starts
 * from the constant — would then hydrate against markup it cannot reproduce.
 * The per-request value travels through context instead.
 */
export const getHiddenTemplatesServerSnapshot = (): ReadonlySet<string> => SERVER_SNAPSHOT;
const SERVER_SNAPSHOT: ReadonlySet<string> = new Set(DEFAULT_HIDDEN);
