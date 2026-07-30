/**
 * The only way anything in this app sends analytics.
 *
 * ── The safety contract ──────────────────────────────────────────────────────
 * Every function here is:
 *   • synchronous — never returns a promise, never awaits
 *   • void-returning — no call site can depend on a result
 *   • total — wrapped in try/catch that swallows everything
 *   • inert without configuration — a no-op when the measurement ID is absent
 *
 * That combination is what makes it safe to drop a `track(...)` call next to
 * existing publish / signup / share logic: there is no code path by which it can
 * change the behaviour of the code around it. If GA4 is blocked, misconfigured,
 * or throws internally, the call still returns undefined and execution
 * continues. Analytics must never be able to break the product.
 *
 * This is deliberately NOT a fetch wrapper. An earlier design intercepted
 * `window.fetch` to capture the funnel in one place, which would have put new
 * code on the critical path of every publish request. Explicit calls touch more
 * files but cannot affect anything. See docs/analytics/SOLUTIONS.md.
 */

import { CLARITY_ID, GA_ID } from "@/lib/config";
import type { EventName, EventParams, VisitorType } from "./events";
import { describeLocation } from "./path";

/** GA4 hard limits. Exceeding these means silent truncation, not an error. */
const MAX_PARAM_VALUE_LENGTH = 100;
const MAX_PARAM_NAME_LENGTH = 40;

/**
 * Parameter names that must never reach a third party, matched case-insensitively
 * as a substring.
 *
 * A defence in depth, not the primary control: no call site is *supposed* to pass
 * these. But this product's content is private messages — apology letters, love
 * notes, recipient names — and share pages are password protected. One careless
 * spread of a form object into an event would exfiltrate that to Google. This
 * makes the accident impossible rather than unlikely.
 */
const BLOCKED_PARAM_PATTERN =
  /pass|token|secret|auth|email|phone|otp|message|letter|note|content|body|recipient|sender|photo|image|url/i;

/**
 * Parameter names that are explicitly safe and bypass the pattern above.
 *
 * The denylist matches substrings, which is the right default for catching an
 * accidental `...formData` spread — but it also caught two of our own legitimate
 * parameters: `is_authenticated` contains "auth" and `has_password` contains
 * "pass". Both were being silently stripped, so `publish_clicked` arrived with no
 * authentication flag and `page_saved` with no password flag — the exact
 * breakdowns the funnel needs, quietly absent with no error anywhere.
 *
 * Every name here is a boolean, an enum, a number or a bounded slug defined in
 * events.ts. None can carry user content. Anything NOT listed still has to pass
 * the denylist, so the protection against an accidental spread is intact.
 */
const SAFE_PARAM_NAMES = new Set([
  // dimensions
  "template", "reason", "method", "source", "visitor_type", "launch_mode",
  // booleans
  "is_authenticated", "has_password", "is_premium", "is_owner",
  // numbers / commerce
  "value", "currency", "position", "points_cost", "transaction_id",
  // web vitals
  "metric_name", "metric_rating", "metric_id",
  // page view (set by describeLocation, already sanitised there)
  "page_path", "page_location", "page_title",
  // debug-only, deliberately never registered as a GA4 dimension
  "share_id",
]);

function isParamNameAllowed(key: string): boolean {
  if (key.length > MAX_PARAM_NAME_LENGTH) return false;
  if (SAFE_PARAM_NAMES.has(key)) return true;
  return !BLOCKED_PARAM_PATTERN.test(key);
}

/**
 * Events recorded before the GA4 bootstrap has executed.
 *
 * The gtag snippet loads with next/script `afterInteractive`, which runs AFTER
 * React has hydrated and effects have fired. Anything tracked from a mount effect
 * therefore ran while `window.gtag` was still undefined — and because every call
 * used optional chaining, those events were dropped in silence. That cost the
 * first `page_view` of every visit, the `visitor_type` user property, and the
 * `login` event on the Google subdomain-bridge redirect: the three earliest and
 * most important signals.
 *
 * Queuing here rather than pushing straight to `window.dataLayer` is deliberate.
 * gtag processes the queue in order, and an event that lands before the `config`
 * command is not attributed correctly — so the flush must happen after the
 * bootstrap has run, which AnalyticsProvider triggers from the script's onLoad.
 */
type QueuedCall =
  | { target: "ga"; command: "event" | "set"; name: string; payload: Record<string, unknown> }
  | { target: "clarity"; args: unknown[] };

const MAX_QUEUE_LENGTH = 100;
let queue: QueuedCall[] = [];

function enqueue(call: QueuedCall): void {
  // Bounded: if a script never loads (ad blocker, outage) this must not grow
  // without limit for the lifetime of the tab.
  if (queue.length >= MAX_QUEUE_LENGTH) return;
  queue.push(call);
}

/**
 * Replay everything queued before the third-party scripts were ready.
 * Called by AnalyticsProvider from each script's onLoad; safe to call repeatedly.
 */
export function flushAnalyticsQueue(): void {
  try {
    if (typeof window === "undefined" || queue.length === 0) return;

    const pending = queue;
    queue = [];

    for (const call of pending) {
      if (call.target === "ga") {
        if (window.gtag) window.gtag(call.command, call.name, call.payload);
        else enqueue(call); // still not ready — keep it for the next flush
      } else if (window.clarity) {
        window.clarity(...call.args);
      } else {
        enqueue(call);
      }
    }
  } catch {
    /* silent by design */
  }
}

/** True when analytics is configured for the current environment. */
export function isAnalyticsEnabled(): boolean {
  return typeof window !== "undefined" && GA_ID.length > 0;
}

function isDebug(): boolean {
  return typeof window !== "undefined" && window.__ANALYTICS_DEBUG__ === true;
}

/**
 * Coerce params into something GA4 will actually store, dropping anything
 * unsafe or unsupported. Never throws.
 */
function sanitizeParams(params?: EventParams): Record<string, string | number | boolean> {
  const clean: Record<string, string | number | boolean> = {};
  if (!params) return clean;

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (!isParamNameAllowed(key)) continue;

    if (typeof value === "number" && Number.isFinite(value)) {
      clean[key] = value;
    } else if (typeof value === "boolean") {
      clean[key] = value;
    } else if (typeof value === "string") {
      // GA4 truncates silently past 100 chars; do it explicitly so the data is
      // predictable rather than mysteriously clipped.
      clean[key] = value.slice(0, MAX_PARAM_VALUE_LENGTH);
    }
    // Objects, arrays, functions and symbols are unsupported — dropped.
  }

  return clean;
}

/**
 * Record an event.
 *
 * Safe to call from anywhere, at any time, including before the GA4 script has
 * loaded (gtag queues into dataLayer) and when it will never load at all.
 */
export function track(name: EventName, params?: EventParams): void {
  try {
    if (typeof window === "undefined") return;

    const clean = sanitizeParams(params);

    if (isDebug()) {
      // Debug mode reports and sends nothing — used to diagnose double-fires
      // without polluting the property.
      console.log(`%c[analytics] ${name}`, "color:#3d0c11;font-weight:bold", clean);
      return;
    }

    if (!isAnalyticsEnabled()) return;

    if (window.gtag) window.gtag("event", name, clean);
    else enqueue({ target: "ga", command: "event", name, payload: clean });
  } catch {
    // Intentionally silent. A broken analytics call must never surface to the
    // user or interrupt the caller.
  }
}

/**
 * Record a page view.
 *
 * GA4 is configured with `send_page_view: false` because App Router client
 * navigations do not reload the page, so gtag's automatic single page view would
 * only ever capture the landing screen. Every view — including the first — comes
 * from here instead, which keeps the count correct in both directions.
 */
export function trackPageView(): void {
  try {
    if (typeof window === "undefined") return;

    const location = describeLocation();

    if (isDebug()) {
      console.log("%c[analytics] page_view", "color:#3d0c11;font-weight:bold", location);
      return;
    }

    if (!isAnalyticsEnabled()) return;

    if (window.gtag) window.gtag("event", "page_view", location);
    else enqueue({ target: "ga", command: "event", name: "page_view", payload: location });
  } catch {
    /* silent by design */
  }
}

/**
 * Set user-scoped properties. These persist across events for the session and
 * are what make segmentation possible.
 */
export function setUserProperties(props: Record<string, string | number | boolean>): void {
  try {
    if (typeof window === "undefined") return;

    if (isDebug()) {
      console.log("%c[analytics] user_properties", "color:#3d0c11;font-weight:bold", props);
      return;
    }

    if (!isAnalyticsEnabled()) return;

    // Queued when the bootstrap has not run yet. This one matters most: it sets
    // visitor_type, and a user property that arrives after the session's first
    // events cannot be applied retroactively to them.
    if (window.gtag) window.gtag("set", "user_properties", props);
    else enqueue({ target: "ga", command: "set", name: "user_properties", payload: props });
  } catch {
    /* silent by design */
  }
}

/**
 * Tag the visitor as a creator or a recipient.
 *
 * Without this every funnel report is wrong. Share pages are public and get
 * opened many times per link, so recipients would otherwise be counted as
 * customers who never converted, collapsing the conversion rate and making the
 * numbers useless. Reports must filter on `visitor_type = creator`.
 *
 * Also mirrored into Clarity as a custom tag so replays can be filtered the same
 * way — Clarity does not read GA4's user properties.
 */
export function setVisitorType(type: VisitorType): void {
  setUserProperties({ visitor_type: type });
  clarityTag("visitor_type", type);
}

/**
 * Attach a filterable tag to the current Clarity session.
 * No-op when Clarity is unconfigured or blocked.
 */
export function clarityTag(key: string, value: string): void {
  try {
    if (typeof window === "undefined" || !CLARITY_ID) return;
    if (!isParamNameAllowed(key)) return;
    if (isDebug()) return;

    const args = ["set", key, value.slice(0, MAX_PARAM_VALUE_LENGTH)];
    // Clarity loads with `lazyOnload`, so it is normally NOT ready when
    // visitor_type is first set — without queuing, replays could not be filtered
    // by creator/recipient at all.
    if (window.clarity) window.clarity(...args);
    else enqueue({ target: "clarity", args });
  } catch {
    /* silent by design */
  }
}

/**
 * Grant or revoke Clarity's recording consent.
 *
 * Clarity does not participate in GA4 Consent Mode, so consent must be
 * communicated to it separately — otherwise it would keep recording sessions
 * while GA4 is paused, which is the opposite of the intent given that replays
 * capture the text of users' private messages.
 */
export function setClarityConsent(granted: boolean): void {
  try {
    if (typeof window === "undefined" || !CLARITY_ID) return;
    window.clarity?.("consent", granted);
  } catch {
    /* silent by design */
  }
}
