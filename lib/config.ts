/**
 * Central config — reads NEXT_PUBLIC_APP_ENV and resolves the correct
 * API URL and site URL for the active environment.
 *
 * All other files should import from here instead of reading
 * process.env.NEXT_PUBLIC_* directly.
 */

type AppEnv = "local" | "ngrok" | "production";

// Safe default:
// - `next dev` => local
// - Vercel / `next build` => production
const DEFAULT_ENV: AppEnv = process.env.NODE_ENV === "production" ? "production" : "local";
const APP_ENV = (process.env.NEXT_PUBLIC_APP_ENV || DEFAULT_ENV) as AppEnv;

const configs: Record<
  AppEnv,
  { apiUrl: string; siteUrl: string; rootDomain: string; strapiUrl: string; gaId: string; clarityId: string }
> = {
  local: {
    apiUrl: process.env.NEXT_PUBLIC_LOCAL_API_URL || "http://localhost:5000/api",
    siteUrl: process.env.NEXT_PUBLIC_LOCAL_SITE_URL || "http://localhost:3000",
    // No subdomain routing on localhost
    rootDomain: "",
    // Strapi blog CMS (runs on its own server, port 1337 by default)
    strapiUrl: process.env.NEXT_PUBLIC_LOCAL_STRAPI_URL || "http://localhost:1337",
    // Analytics is OFF locally unless you deliberately set these. Dev sessions,
    // ngrok demos and Playwright runs would otherwise land in the production
    // property as real user data — and GA4 cannot delete events after the fact.
    gaId: process.env.NEXT_PUBLIC_LOCAL_GA_ID || "",
    clarityId: process.env.NEXT_PUBLIC_LOCAL_CLARITY_ID || "",
  },
  ngrok: {
    apiUrl: process.env.NEXT_PUBLIC_NGROK_API_URL || "",
    siteUrl: process.env.NEXT_PUBLIC_NGROK_SITE_URL || "",
    // Dev subdomain domain, e.g. klyro.digital
    rootDomain: process.env.NEXT_PUBLIC_NGROK_ROOT_DOMAIN || "",
    strapiUrl: process.env.NEXT_PUBLIC_NGROK_STRAPI_URL || "",
    gaId: process.env.NEXT_PUBLIC_NGROK_GA_ID || "",
    clarityId: process.env.NEXT_PUBLIC_NGROK_CLARITY_ID || "",
  },
  production: {
    apiUrl: process.env.NEXT_PUBLIC_PROD_API_URL || "",
    siteUrl: process.env.NEXT_PUBLIC_PROD_SITE_URL || "https://subhsandesh.in",
    // Production domain, e.g. subhsandesh.in
    rootDomain: process.env.NEXT_PUBLIC_PROD_ROOT_DOMAIN || "",
    strapiUrl: process.env.NEXT_PUBLIC_PROD_STRAPI_URL || "https://strapi.subhsandesh.in",
    gaId: process.env.NEXT_PUBLIC_PROD_GA_ID || "",
    clarityId: process.env.NEXT_PUBLIC_PROD_CLARITY_ID || "",
  },
};

const selected = configs[APP_ENV] ?? configs.local;

/** Base API URL — e.g. http://localhost:5000/api */
export const API_URL = selected.apiUrl;

/** Public site URL — used for share links, OG meta, etc. */
export const SITE_URL = selected.siteUrl;

/** Base URL of the Strapi blog CMS — e.g. http://localhost:1337 */
export const STRAPI_URL = selected.strapiUrl;

/**
 * GA4 measurement ID — e.g. G-XXXXXXXXXX. Empty string disables analytics
 * entirely (every track() call becomes a no-op), which is both the local default
 * and the production kill switch: blank the env var and redeploy to turn
 * analytics off without reverting any code.
 *
 * NOTE: NEXT_PUBLIC_* vars are inlined at BUILD time. Setting this in the
 * runtime env-file used by scripts/deploy.sh has no effect — it must be passed
 * as a Docker build-arg. See docs/analytics/SOLUTIONS.md A5.
 */
export const GA_ID = selected.gaId;

/** Microsoft Clarity project ID. Empty string disables session recording. */
export const CLARITY_ID = selected.clarityId;

/**
 * Server-only secrets (never prefixed with NEXT_PUBLIC_ → not exposed to the browser).
 * - STRAPI_API_TOKEN: optional read-only token for fetching blog content.
 * - REVALIDATE_SECRET: shared secret the Strapi webhook uses to trigger ISR revalidation.
 */
export const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN || "";
export const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET || "";

/** The active environment name */
export const ENV = APP_ENV;

/** Whether we're using a raw ngrok tunnel (adds bypass header in fetch) */
export const IS_NGROK = API_URL.includes("ngrok-free.app") || API_URL.includes("ngrok.io");

/** Whether running in production */
export const IS_PROD = APP_ENV === "production";

/**
 * Root domain for wildcard subdomain routing.
 * Dev:        klyro.digital  → {username}.klyro.digital/{shareId}
 * Production: subhsandesh.in → {username}.subhsandesh.in/{shareId}
 * Local:      ""             → path-based /{username}/{shareId}
 */
export const ROOT_DOMAIN = selected.rootDomain;
