/**
 * Central config — reads NEXT_PUBLIC_APP_ENV and resolves the correct
 * API URL and site URL for the active environment.
 *
 * All other files should import from here instead of reading
 * process.env.NEXT_PUBLIC_* directly.
 */

type AppEnv = "local" | "ngrok" | "production";

const APP_ENV = (process.env.NEXT_PUBLIC_APP_ENV || "local") as AppEnv;

const configs: Record<AppEnv, { apiUrl: string; siteUrl: string }> = {
  local: {
    apiUrl: process.env.NEXT_PUBLIC_LOCAL_API_URL || "http://localhost:5000/api",
    siteUrl: process.env.NEXT_PUBLIC_LOCAL_SITE_URL || "http://localhost:3000",
  },
  ngrok: {
    apiUrl: process.env.NEXT_PUBLIC_NGROK_API_URL || "",
    siteUrl: process.env.NEXT_PUBLIC_NGROK_SITE_URL || "",
  },
  production: {
    apiUrl: process.env.NEXT_PUBLIC_PROD_API_URL || "",
    siteUrl: process.env.NEXT_PUBLIC_PROD_SITE_URL || "https://dilse-tau.vercel.app",
  },
};

const selected = configs[APP_ENV] ?? configs.local;

/** Base API URL — e.g. http://localhost:5000/api */
export const API_URL = selected.apiUrl;

/** Public site URL — used for share links, OG meta, etc. */
export const SITE_URL = selected.siteUrl;

/** The active environment name */
export const ENV = APP_ENV;

/** Whether we're using an ngrok tunnel (adds bypass header in fetch) */
export const IS_NGROK = APP_ENV === "ngrok" || API_URL.includes("ngrok");

/** Whether running in production */
export const IS_PROD = APP_ENV === "production";
