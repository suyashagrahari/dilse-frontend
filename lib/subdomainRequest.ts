// ─── When to ask for a subdomain ─────────────────────────────────────────────
//
// The "claim your love link" picker is asked for at the moment a creator
// makes a page — never just because somebody signed in or opened the site.
// A publish is that moment for every template: it is when the page's link is
// born, and it is the one event all forty-four editors share (see the publish
// branch of `pushToast` in lib/toast/toastBus.ts, which raises this).
//
// The request survives a reload in sessionStorage, so refreshing while the
// picker is open does not skip it; it is cleared once a name is saved.

import { useSyncExternalStore } from "react";

const KEY = "ss_subdomain_requested";
const listeners = new Set<() => void>();

function read(): boolean {
  try {
    return typeof window !== "undefined" && window.sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

let requested = read();

function emit() {
  for (const l of listeners) l();
}

/** Ask for a subdomain now (a page was just made). */
export function requestSubdomain(): void {
  requested = true;
  try { window.sessionStorage.setItem(KEY, "1"); } catch { /* storage blocked */ }
  emit();
}

/** The name is saved (or nobody is signed in): stop asking. */
export function clearSubdomainRequest(): void {
  if (!requested) return;
  requested = false;
  try { window.sessionStorage.removeItem(KEY); } catch { /* storage blocked */ }
  emit();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useSubdomainRequested(): boolean {
  return useSyncExternalStore(subscribe, () => requested, () => false);
}
