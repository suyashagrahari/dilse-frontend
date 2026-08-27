/**
 * Client side of "view as user".
 *
 * ── WHY sessionStorage AND NOT localStorage ─────────────────────────────────
 *
 * The obvious implementation swaps the stored access token for the
 * impersonation one. localStorage is shared by every tab on the origin, so
 * doing that would replace the admin's OWN session everywhere — they would
 * find themselves signed in as the user they were inspecting, in all tabs, with
 * no way back once the 15-minute token expired.
 *
 * sessionStorage is per-tab. Impersonation opens in a new tab, that tab alone
 * carries the borrowed identity, and the admin's other tabs are untouched.
 * Closing the tab ends it, which is the behaviour people already expect.
 */

const KEY = "gifts_impersonation";

export interface ImpersonationSession {
  token: string;
  userName: string;
  userEmail: string;
  /** Epoch ms. The token is rejected by the server after this regardless. */
  expiresAt: number;
}

export function getImpersonation(): ImpersonationSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as ImpersonationSession;
    if (!s?.token || Date.now() >= s.expiresAt) {
      window.sessionStorage.removeItem(KEY);
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

export function setImpersonation(s: ImpersonationSession): void {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* private mode — the session simply will not start */
  }
}

export function clearImpersonation(): void {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* nothing to clear */
  }
}

/**
 * The token requests in THIS tab should use.
 *
 * Returns the impersonation token when one is active, otherwise the caller's
 * own. Everything that talks to the API should route through this rather than
 * reading localStorage directly, or an impersonated tab would send the admin's
 * real token and quietly act as the admin instead.
 */
export function effectiveToken(ownToken?: string | null): string | null {
  const imp = getImpersonation();
  if (imp) return imp.token;
  if (ownToken) return ownToken;
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem("gifts_access_token");
  } catch {
    return null;
  }
}
