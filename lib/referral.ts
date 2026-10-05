/**
 * The referral code a visitor arrived with, remembered until they sign up.
 *
 * Stored in a cookie on the ROOT domain (`.subhsandesh.in`) rather than in
 * localStorage, because localStorage is per-origin: a follower who opens
 * priya.subhsandesh.in and then signs up on subhsandesh.in — or through the
 * Google bridge, which always runs on the apex — would otherwise arrive with
 * nothing. localStorage is still written as a fallback for hosts with no root
 * domain (localhost, staging path links).
 *
 * Last click wins: opening a second link replaces the first. The server ignores
 * the code for accounts that already exist, so a stale code is harmless.
 */
import { ROOT_DOMAIN } from "@/lib/config";

const COOKIE = "ss_ref";
const LS_CODE = "ref_code";
const LS_EXPIRY = "ref_code_expiry";

function cookieDomain(): string {
  if (typeof window === "undefined" || !ROOT_DOMAIN) return "";
  const host = window.location.hostname;
  return host === ROOT_DOMAIN || host.endsWith(`.${ROOT_DOMAIN}`) ? `; domain=.${ROOT_DOMAIN}` : "";
}

export function saveRefCode(raw: string, days = 60): void {
  if (typeof window === "undefined") return;
  const code = raw.trim().slice(0, 40);
  if (!code || !/^[a-z0-9-]+$/i.test(code)) return;
  const maxAge = Math.round(days * 86400);
  const secure = window.location.protocol === "https:" ? "; secure" : "";
  document.cookie = `${COOKIE}=${encodeURIComponent(code)}; max-age=${maxAge}; path=/; samesite=lax${cookieDomain()}${secure}`;
  try {
    localStorage.setItem(LS_CODE, code);
    localStorage.setItem(LS_EXPIRY, String(Date.now() + maxAge * 1000));
  } catch { /* storage blocked */ }
}

export function readRefCode(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const m = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]*)`));
  if (m?.[1]) return decodeURIComponent(m[1]);
  try {
    const expiry = Number(localStorage.getItem(LS_EXPIRY) || 0);
    if (expiry && Date.now() > expiry) {
      localStorage.removeItem(LS_CODE);
      localStorage.removeItem(LS_EXPIRY);
      return undefined;
    }
    return localStorage.getItem(LS_CODE) || undefined;
  } catch {
    return undefined;
  }
}

export function clearRefCode(): void {
  if (typeof window === "undefined") return;
  document.cookie = `${COOKIE}=; max-age=0; path=/${cookieDomain()}`;
  try {
    localStorage.removeItem(LS_CODE);
    localStorage.removeItem(LS_EXPIRY);
  } catch { /* storage blocked */ }
}
