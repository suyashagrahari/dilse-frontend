// ─── "Back" from a template returns to where the visitor came from ──────────
//
// A template's back chevron used to push /templates, so someone who opened a
// design from the middle of /wedding (or Favourites, or the home page) was
// dropped at the top of a different page. Now:
//
// 1. OriginTracker (mounted in the (app) layout, so on every site page but not
//    on template pages) records the page and scroll position at the moment a
//    visitor follows an internal link.
// 2. goBackFromTemplate() sends them back to that page and marks the scroll
//    position to restore; OriginTracker restores it once the page is tall
//    enough.
// 3. With no recorded origin (a shared link opened directly, a new tab, an
//    old session) it falls back to /templates, as before.
//
// sessionStorage only: per tab, gone when the tab closes, no server state.

const ORIGIN_KEY = "ss:tplOrigin";
const RESTORE_KEY = "ss:restoreScroll";
/** An origin older than this is stale; fall back instead of surprising them. */
const MAX_AGE_MS = 6 * 60 * 60 * 1000;

type Origin = { path: string; y: number; t: number };

function read(key: string): Origin | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const o = JSON.parse(raw) as Origin;
    if (typeof o?.path !== "string" || !o.path.startsWith("/") || typeof o.y !== "number") return null;
    if (Date.now() - (o.t || 0) > MAX_AGE_MS) return null;
    return o;
  } catch {
    return null;
  }
}

function write(key: string, o: Origin) {
  try {
    sessionStorage.setItem(key, JSON.stringify(o));
  } catch {
    /* private mode / storage full: back falls back to /templates */
  }
}

/** Called by OriginTracker just before an internal link navigates away. */
export function rememberOrigin(path: string, y: number) {
  write(ORIGIN_KEY, { path, y: Math.max(0, Math.round(y)), t: Date.now() });
}

/** The template back button: return to the page (and scroll spot) the visitor came from. */
export function goBackFromTemplate(router: { push: (href: string) => void }, fallback = "/templates") {
  const o = typeof window === "undefined" ? null : read(ORIGIN_KEY);
  const here = typeof window === "undefined" ? "" : window.location.pathname;
  if (o && o.path.split(/[?#]/)[0] !== here) {
    write(RESTORE_KEY, { ...o, t: Date.now() });
    router.push(o.path);
    return;
  }
  router.push(fallback);
}

/** The scroll position waiting to be restored for `path`, or null. Not consumed: see clearRestore. */
export function peekRestore(path: string): number | null {
  const o = read(RESTORE_KEY);
  return o && o.path === path ? o.y : null;
}

/** Done restoring (or the visitor took over): forget the pending position. */
export function clearRestore() {
  try {
    sessionStorage.removeItem(RESTORE_KEY);
  } catch {
    /* ignore */
  }
}
