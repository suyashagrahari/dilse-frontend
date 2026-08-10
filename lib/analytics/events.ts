/**
 * The analytics event taxonomy — single source of truth.
 *
 * GA4's free tier allows 500 distinct event names, but the practical limit is
 * much lower: every custom parameter must be manually registered as a custom
 * dimension in the GA4 UI before it appears in any report (max 50). So this list
 * is deliberately small. Sixteen events you can build a funnel from beat two
 * hundred nobody reads.
 *
 * Naming follows GA4 conventions: snake_case, <= 40 chars. Where a GA4
 * *recommended* event exists (`login`, `share`, `purchase`, `begin_checkout`,
 * `sign_up`) we use its exact name so GA4's built-in reports light up for free.
 *
 * See docs/analytics/PLAN.md §3 for why each one exists.
 */

export const EVENTS = {
  // ── Discovery ────────────────────────────────────────────────────────────
  /** Gallery card clicked. The gallery → editor step. */
  TEMPLATE_CARD_CLICKED: "template_card_clicked",
  /** An editor route actually mounted (did the page survive the navigation). */
  EDITOR_OPENED: "editor_opened",

  // ── Creation funnel ──────────────────────────────────────────────────────
  /** First real edit interaction in a session. Fires once per editor mount. */
  EDIT_STARTED: "edit_started",
  /** Draft persisted to the server. */
  PAGE_SAVED: "page_saved",
  /** Share password chosen (or explicitly skipped). */
  PASSWORD_SET: "password_set",

  // ── Publish funnel ───────────────────────────────────────────────────────
  /** Publish intent — fires even when logged out, which is the point. */
  PUBLISH_CLICKED: "publish_clicked",
  /** The auth wall appeared. The gap to PUBLISH_SUCCESS is the login drop-off. */
  AUTH_REQUIRED: "auth_required",
  PUBLISH_SUCCESS: "publish_success",
  /** Includes `reason` — e.g. PAYMENT_REQUIRED, or a network failure. */
  PUBLISH_FAILED: "publish_failed",

  // ── Auth (GA4 recommended names) ─────────────────────────────────────────
  LOGIN: "login",
  SIGN_UP: "sign_up",

  // ── Monetisation (GA4 recommended names) ─────────────────────────────────
  BEGIN_CHECKOUT: "begin_checkout",
  /** Razorpay only. Points redemptions fire SPEND_POINTS so revenue stays clean. */
  PURCHASE: "purchase",
  /** Points redemption — a real conversion worth zero rupees. */
  SPEND_POINTS: "spend_points",
  /** User dismissed the Razorpay modal. Intent, not an error. */
  CHECKOUT_CANCELLED: "checkout_cancelled",
  /** Payment genuinely failed — declined card, verification failure, SDK error. */
  PAYMENT_FAILED: "payment_failed",

  // ── Share + growth loop ──────────────────────────────────────────────────
  /** GA4 recommended name. `method` carries the channel. */
  SHARE: "share",
  /** A published page was opened. Mostly by recipients, not customers. */
  RECIPIENT_VIEWED: "recipient_viewed",
  /**
   * A recipient clicked through to create their own. This is the viral
   * coefficient — the single most valuable event here. Requires the
   * cross-subdomain fix (SOLUTIONS.md N1) to attribute correctly.
   */
  CREATE_CTA_CLICKED: "create_cta_clicked",

  // ── Quality ──────────────────────────────────────────────────────────────
  /** Core Web Vitals from real devices. CWV is a ranking factor; lab != field. */
  WEB_VITALS: "web_vitals",
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];

/**
 * Parameter values GA4 can store. Objects and arrays are not supported —
 * `sanitizeParams` drops anything else.
 */
export type EventParams = Record<string, string | number | boolean | undefined | null>;

/** Which population a visitor belongs to. Set as a user-scoped property. */
export type VisitorType = "creator" | "recipient";

/** How the user authenticated. `google_bridge` is the subdomain redirect flow. */
export type LoginMethod = "password" | "otp" | "google" | "google_bridge";

/**
 * Ways a page can leave the app, as reported by `components/share/ShareSheet`.
 *
 * The first group is a destination the link was sent to; the rest are the
 * artefacts the sheet can produce, which say nothing about where the thing
 * ended up. Keep them distinguishable in reports — a QR download is intent to
 * share, not a share.
 */
export type ShareMethod =
  | "whatsapp"
  | "instagram"
  | "telegram"
  | "twitter"
  | "facebook"
  | "copy_link"
  | "native"
  | "qr_image"
  | "qr_download"
  | "print_card"
  | "photo_qr_upload"
  | "photo_qr_download"
  | "photo_qr_share";

/**
 * Custom dimensions that must be registered in the GA4 UI before they render in
 * reports (Admin → Custom definitions). Listed here so the set is reviewable in
 * code rather than living only in someone's browser tab.
 *
 * `share_id` is deliberately absent: it is unbounded, and registering it would
 * exhaust GA4's cardinality budget and drag `template` into the "(other)"
 * bucket with it. It stays a debug-only parameter.
 */
export const CUSTOM_DIMENSIONS = {
  eventScoped: ["template", "reason", "method", "source", "is_authenticated", "metric_rating"],
  userScoped: ["visitor_type", "launch_mode"],
} as const;
