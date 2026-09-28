// ─── Subdomains: the rules, the suggestions, the link ────────────────────────
//
// A creator's subdomain is the front half of every link they send:
// `aarav-loves-riya.subhsandesh.in/<page-id>`. These helpers are shared by the
// first-login picker and anything that shows a link, so the rules here must
// stay in step with `validateSubdomain` in server/src/controllers/auth.controller.ts
// — the server is the one that decides; this only saves a round trip.

import { ROOT_DOMAIN } from "@/lib/config";

/** Mirrors SUBDOMAIN_RESERVED on the server. */
const RESERVED = new Set([
  "www", "admin", "api", "mail", "ftp", "support", "help", "docs", "blog", "app",
  "auth", "login", "signup", "register", "dashboard", "static", "assets", "cdn",
  "dev", "test", "staging", "prod", "production", "public", "private", "media",
  "u", "user", "users", "share", "page", "pages", "gift", "gifts", "dilse",
]);

export const SUBDOMAIN_MIN = 3;
export const SUBDOMAIN_MAX = 30;

/** The domain shown after the name. Falls back so previews read right locally. */
export const LINK_DOMAIN = ROOT_DOMAIN || "subhsandesh.in";

/**
 * Turn whatever was typed into something the server will accept: lowercase,
 * spaces and underscores become hyphens, everything else outside a-z0-9- is
 * dropped, and hyphen runs collapse. Leading hyphens go; a trailing one stays
 * while typing so "aarav-" can become "aarav-loves".
 */
export function sanitizeSubdomain(raw: string): string {
  return raw
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[\s_.]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-+/, "")
    .slice(0, SUBDOMAIN_MAX);
}

/** Null when valid, otherwise a short reason. */
export function validateSubdomainLocal(val: string): string | null {
  if (!val) return "Pick a name for your link";
  if (val.length < SUBDOMAIN_MIN) return `At least ${SUBDOMAIN_MIN} characters`;
  if (val.length > SUBDOMAIN_MAX) return `At most ${SUBDOMAIN_MAX} characters`;
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(val)) return "Can't start or end with a hyphen";
  if (val.includes("--")) return "No double hyphens";
  if (RESERVED.has(val)) return "That name is reserved — try another";
  return null;
}

/** "Aarav Kumar" → "aarav". Empty when nothing Latin survives. */
export function firstNameSlug(name?: string | null): string {
  const first = (name || "").trim().split(/\s+/)[0] || "";
  return sanitizeSubdomain(first).replace(/-/g, "").slice(0, 12);
}

/**
 * Cute, valid, unique suggestions built from the sender's name and — when they
 * give it — the person the pages are for. `aarav-loves-riya` is the shape we
 * lead with because it reads like the gift it opens.
 */
export function suggestSubdomains(sender: string, recipient: string): string[] {
  const s = firstNameSlug(sender) || "my";
  const r = firstNameSlug(recipient);
  const year = new Date().getFullYear();
  const raw = r
    ? [
        `${s}-loves-${r}`,
        `${s}-and-${r}`,
        `${s}-x-${r}`,
        `${s}-${r}-forever`,
        `${r}-and-${s}`,
        `always-${s}-${r}`,
        `${s}-for-${r}`,
      ]
    : [
        `${s}-loves-you`,
        `with-love-${s}`,
        `${s}-wishes`,
        `${s}-sends-love`,
        `dear-from-${s}`,
        `${s}-${year}`,
      ];
  const seen = new Set<string>();
  return raw.filter((x) => {
    if (seen.has(x) || validateSubdomainLocal(x)) return false;
    seen.add(x);
    return true;
  });
}

/**
 * Put the creator's subdomain on a share link that was issued without one.
 *
 * The server builds `{subdomain}.{ROOT_DOMAIN}/{id}` only on the apex
 * deployment and only when the owner already has a subdomain; otherwise it
 * falls back to `{SHARE_BASE_URL}/{id}`. A creator who picks their name in the
 * first-login picker WHILE a publish is resuming gets that fallback. So: a link
 * on the bare apex (or www) host with a single-segment path is rewritten; any
 * other host — staging, local — is left exactly as the server made it, which
 * is the same rule the server applies.
 */
export function withUserSubdomain(url: string | null | undefined, subdomain?: string | null): string | null {
  if (!url) return url ?? null;
  if (!subdomain || !ROOT_DOMAIN) return url;
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    if (host !== ROOT_DOMAIN && host !== `www.${ROOT_DOMAIN}`) return url;
    if (!/^\/[^/]+\/?$/.test(u.pathname)) return url;
    return `https://${subdomain}.${ROOT_DOMAIN}${u.pathname}${u.search}${u.hash}`;
  } catch {
    return url;
  }
}
