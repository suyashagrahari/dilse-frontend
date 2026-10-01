"use client";

// ─── Wishlist membership, shared by every surface that shows it ─────────────
//
// The hero button, the gallery card, the wishlist page and the profile all ask
// the same question — "has this user joined?" — so the answer lives in one
// module-level store keyed by token. The first surface to mount fetches it;
// the rest read the cached answer, and a join anywhere updates all of them on
// the same render.
//
// Joining always asks for a phone number (the page's centred phone modal), so
// the join is two steps: `requestJoin` says what comes next, `submitJoin` sends
// the number. A signed-out tap opens sign-up and leaves a pending flag in
// sessionStorage; once the account exists `resumePending` turns true and the
// page opens the phone modal by itself — which also survives the full-page
// Google redirect a cross-origin subdomain falls back to.

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { useAppSelector } from "@/store/hooks";
import { API_URL, IS_NGROK } from "@/lib/config";

export type WishlistEntry = { campaign: string; discountPercent: number; joinedAt: string; position: number; hasPhone?: boolean };
export type WishlistPhone = { country: string; dialCode: string; number: string };
export type WishlistStatus = "loading" | "signed-out" | "open" | "joined";

type Snap = { token: string | null; status: WishlistStatus; entry: WishlistEntry | null; joining: boolean; error: string | null };

const PENDING_KEY = "ss:wishlist-pending";
const snaps = new Map<string, Snap>();
const inflight = new Map<string, Promise<void>>();
const listeners = new Set<() => void>();

function headers(token?: string | null): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (token) h.Authorization = `Bearer ${token}`;
  if (IS_NGROK) h["ngrok-skip-browser-warning"] = "true";
  return h;
}

function keyOf(campaign: string, token: string | null) {
  return `${campaign}|${token ?? ""}`;
}

function put(key: string, next: Snap) {
  snaps.set(key, next);
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

function readPending(campaign: string): string | null {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as { campaign?: string; source?: string; at?: number };
    // A flag older than 30 minutes is a sign-up that was abandoned.
    if (p.campaign !== campaign || !p.at || Date.now() - p.at > 30 * 60_000) return null;
    return p.source || "pending";
  } catch {
    return null;
  }
}

function setPending(campaign: string, source: string | null) {
  try {
    if (source) sessionStorage.setItem(PENDING_KEY, JSON.stringify({ campaign, source, at: Date.now() }));
    else sessionStorage.removeItem(PENDING_KEY);
  } catch {
    /* storage blocked: the page still opens the phone modal from the sign-up's onSuccess */
  }
  listeners.forEach((l) => l());
}

async function load(campaign: string, token: string) {
  const key = keyOf(campaign, token);
  if (inflight.has(key)) return inflight.get(key);
  const p = (async () => {
    try {
      const res = await fetch(`${API_URL}/wishlist/${campaign}/me`, { headers: headers(token) });
      const json = await res.json().catch(() => null);
      const entry: WishlistEntry | null = res.ok && json?.success ? json.data.entry : null;
      put(key, { token, status: entry ? "joined" : "open", entry, joining: false, error: null });
    } catch {
      put(key, { token, status: "open", entry: null, joining: false, error: null });
    } finally {
      inflight.delete(key);
    }
  })();
  inflight.set(key, p);
  return p;
}

async function join(campaign: string, token: string, source: string, phone: WishlistPhone): Promise<{ ok: boolean; error?: string }> {
  const key = keyOf(campaign, token);
  const cur = snaps.get(key);
  if (cur?.joining) return { ok: false };
  put(key, { token, status: cur?.status ?? "open", entry: cur?.entry ?? null, joining: true, error: null });
  try {
    const res = await fetch(`${API_URL}/wishlist/${campaign}`, {
      method: "POST", headers: headers(token), body: JSON.stringify({ source, phone }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      const error = json?.error || "Could not join right now — please try again";
      // A bad number stays in the modal; the page itself shows no error.
      put(key, { token, status: cur?.status ?? "open", entry: cur?.entry ?? null, joining: false, error: null });
      return { ok: false, error };
    }
    setPending(campaign, null);
    put(key, { token, status: "joined", entry: json.data.entry, joining: false, error: null });
    return { ok: true };
  } catch {
    put(key, { token, status: cur?.status ?? "open", entry: cur?.entry ?? null, joining: false, error: null });
    return { ok: false, error: "No connection — please try again" };
  }
}

const LOADING: Snap = { token: null, status: "loading", entry: null, joining: false, error: null };
const SIGNED_OUT: Snap = { token: null, status: "signed-out", entry: null, joining: false, error: null };

export function useWishlist(campaign: string) {
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);
  // A stored token without a user yet is a session being restored.
  const restoring = !isAuthenticated && !!accessToken;
  const token = isAuthenticated ? accessToken : null;
  const key = keyOf(campaign, token);

  const snap = useSyncExternalStore(
    subscribe,
    () => (restoring ? LOADING : token ? snaps.get(key) ?? LOADING : SIGNED_OUT),
    () => LOADING,
  );

  useEffect(() => {
    if (!token) return;
    if (!snaps.has(key)) void load(campaign, token);
  }, [campaign, token, key]);

  const pending = useSyncExternalStore(subscribe, () => readPending(campaign), () => null);
  // Signed up from a "Join" tap and not joined yet: the page opens the phone modal.
  const resumePending = !!token && snap.status === "open" && !!pending;

  useEffect(() => {
    if (token && snap.status === "joined" && pending) setPending(campaign, null);
  }, [campaign, token, snap.status, pending]);

  /** "auth" — open sign-up (the intent is remembered); "phone" — open the phone modal. */
  const requestJoin = useCallback(
    (source: string): "auth" | "phone" => {
      if (!token) {
        setPending(campaign, source);
        return "auth";
      }
      return "phone";
    },
    [campaign, token],
  );

  /** Join (or add a phone to an earlier join) with the number from the modal. */
  const submitJoin = useCallback(
    (source: string, phone: WishlistPhone) => {
      if (!token) return Promise.resolve({ ok: false, error: "Please sign in first" });
      return join(campaign, token, pending || source, phone);
    },
    [campaign, token, pending],
  );

  /** The sign-up sheet was dismissed without signing in. */
  const cancelPending = useCallback(() => setPending(campaign, null), [campaign]);

  return { ...snap, resumePending, requestJoin, submitJoin, cancelPending };
}

/** Public "N people are waiting" count; null until loaded or on failure. */
let countCache: { campaign: string; count: number; at: number } | null = null;
export async function fetchWishlistCount(campaign: string): Promise<number | null> {
  if (countCache && countCache.campaign === campaign && Date.now() - countCache.at < 60_000) return countCache.count;
  try {
    const res = await fetch(`${API_URL}/wishlist/${campaign}/count`, { headers: headers() });
    const json = await res.json();
    if (!res.ok || !json?.success) return null;
    countCache = { campaign, count: json.data.count, at: Date.now() };
    return json.data.count;
  } catch {
    return null;
  }
}
