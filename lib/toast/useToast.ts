// ─── useToast ────────────────────────────────────────────────────────────────
//
// The editor-facing handle on the toast bus.
//
// ── WHY A HOOK AT ALL, WHEN pushToast IS ALREADY AN IMPORT ──────────────────
//
// Two reasons, both about the forty-four editors that call it.
//
// FIRST, it keeps their dependency arrays honest. Every editor hook has dozens
// of `useCallback(…, [shareUrl, pushToast])`. If `pushToast` were imported
// directly, it would be an outer-scope binding and `react-hooks/exhaustive-deps`
// would flag each of those arrays as carrying an unnecessary dependency — a few
// hundred new warnings, and a few hundred edits to silence them, for no gain.
// Destructured from a hook it stays a local const, so every existing array is
// still exactly right and the migration touches only the state it deletes.
//
// SECOND, it is the seam. `pushToast` is a module function today; if the app
// ever needs per-route scoping or a test-time collector, this is the one place
// that changes rather than forty-four call sites.
//
// The returned functions are the module's own, so their identity is stable for
// the life of the page — a `useCallback` that depends on them never re-creates.

import { dismissToast, pushToast } from "./toastBus";

export interface ToastHandle {
  /** Show a toast. Returns its id. */
  pushToast: typeof pushToast;
  /** Remove one early. */
  dismissToast: typeof dismissToast;
}

/**
 * Frozen and module-scoped so the object identity is stable too — a hook that
 * spreads it into a dependency array does not re-run on every render.
 */
const HANDLE: ToastHandle = Object.freeze({ pushToast, dismissToast });

export function useToast(): ToastHandle {
  return HANDLE;
}
