"use client";

// ─── One hook, forty-three editors ───────────────────────────────────────────
//
// Wiring, for an editor that already has `content`, `pageId` and a REST base:
//
//     const draft = useDraft({
//       templateType: TEMPLATE,
//       apiBase: `${API_URL}/holi-pages`,
//       content,
//       enabled: isPersonalized,
//       busy: publishing,
//       pageId,
//       setPageId,
//       toBody: (d) => holiDataToBody(d, pagePassword),
//       onAdopted: (d) => { setContent(d); setMf({ ...d }); },
//     });
//
// and then `draft.saveNow()` at the moments that count. Everything else —
// leaving the tab, backgrounding the app — the hook handles itself.
//
// ── WHY MILESTONES AND NOT A DEBOUNCE ──────────────────────────────────────
//
// A debounce saves while someone is still thinking. Across forty-three editors
// with photo-carrying payloads that is a lot of writes for content that is about
// to change again. The moments that actually mean "this is worth keeping" are
// discrete and few: the edit sheet closes, preview opens, the tab is
// backgrounded, the page is being unloaded. So those are the triggers.
//
// ── WHY THERE IS NO WIRING IN AuthModal ────────────────────────────────────
//
// The obvious place to promote held work is the auth modal's `onSuccess`. It is
// the wrong place: `AuthModal` has four success paths (register+OTP, login, OTP
// verify, Google) and is not the only way a session begins — a user can already
// be signed in when the editor mounts, or sign in on another tab.
//
// This hook watches the token instead. Whichever way a session appears, and
// however many ways appear later, adoption follows it. That is the same lesson
// `publishRequest.ts` records: watch the state, not the button.

import { useCallback, useEffect, useRef } from "react";
import { API_URL, IS_NGROK } from "@/lib/config";
import { adoptScratch } from "./adopt";
import { fingerprint, hasContentChanged } from "./scratchCodec";
import { clearScratch, saveScratch } from "./localScratch";
import type { LocalRefResolver } from "./mediaUpload";

export interface UseDraftOptions<T> {
  templateType: string;
  /** e.g. `` `${API_URL}/holi-pages` ``. The editor already holds this. */
  apiBase: string;
  /** The editor's live content. Read at save time, never written to. */
  content: T;
  /**
   * Whether this content is worth keeping.
   *
   * Every editor opens on demo content, and a draft per template per visitor who
   * merely LOOKED is noise in their profile and rows in ours. Editors pass their
   * own `isPersonalized`-style flag.
   */
  enabled: boolean;
  /** True while publishing, so a draft save never races the publish it precedes. */
  busy?: boolean;
  isAuthenticated: boolean;
  accessToken: string | null | undefined;
  pageId: string | null;
  setPageId: (id: string) => void;
  /** Editor content → the body its own POST/PUT expects. */
  toBody?: (data: T) => unknown;
  /** Called with the adopted payload so the editor can show the CDN URLs. */
  onAdopted?: (data: T) => void;
  /** Progress copy for the editor's existing stage line. */
  onProgress?: (message: string | null) => void;
  /** Only for templates holding blobs under `idb:` refs. */
  resolveLocalRef?: LocalRefResolver;
}

export interface DraftHandle {
  /** Persist now, if there is anything new to persist. Safe to call freely. */
  saveNow: () => Promise<void>;
}

export function useDraft<T>(opts: UseDraftOptions<T>): DraftHandle {
  // Everything the save path reads goes through a ref, so `saveNow` keeps a
  // stable identity. An editor putting it in a `useEffect` dependency array or
  // an event listener should not have to think about which render it captured —
  // that is the exact class of bug the resume-publish effect in the rakhi editor
  // documents at length.
  const latest = useRef(opts);
  latest.current = opts;

  /** Fingerprint of what is already persisted, so unchanged content is free. */
  const savedAt = useRef<string | null>(null);
  /**
   * One save at a time.
   *
   * Without this, two milestones a few milliseconds apart (closing the edit
   * sheet DOES both close and switch to preview in several editors) each see
   * `pageId === null` and each POST — leaving the user with two identical
   * drafts and the editor pointing at whichever replied second.
   */
  const inFlight = useRef(false);

  const saveNow = useCallback(async (): Promise<void> => {
    const o = latest.current;
    if (!o.enabled || o.busy) return;
    if (inFlight.current) return;
    if (!hasContentChanged(savedAt.current, o.content)) return;

    inFlight.current = true;
    const stamp = fingerprint(o.content);

    try {
      // ── Signed out: hold it in the browser ────────────────────────────────
      if (!o.isAuthenticated || !o.accessToken) {
        await saveScratch(o.templateType, o.content);
        savedAt.current = stamp;
        return;
      }

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${o.accessToken}`,
        ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
      };
      const body = JSON.stringify(o.toBody ? o.toBody(o.content) : o.content);

      // ── Signed in, row exists: update it ──────────────────────────────────
      if (o.pageId) {
        const res = await fetch(`${o.apiBase}/${o.pageId}`, { method: "PUT", headers, body });
        if (res.ok) savedAt.current = stamp;
        return;
      }

      // ── Signed in, no row yet: create one ─────────────────────────────────
      const res = await fetch(o.apiBase, { method: "POST", headers, body });
      const json = await res.json();
      const id = json?.data?._id ? String(json.data._id) : "";
      if (res.ok && json?.success && id) {
        o.setPageId(id);
        savedAt.current = stamp;
        // The row now holds this work, so the browser copy is redundant — and a
        // stale scratch left behind would be adopted as a SECOND draft the next
        // time this editor opened.
        await clearScratch(o.templateType);
      }
    } catch {
      // Left dirty on purpose: the next milestone retries. A failed draft save
      // is not something to interrupt someone mid-sentence about.
    } finally {
      inFlight.current = false;
    }
  }, []);

  // ── Adoption: held work becomes a row the moment there is an owner ────────
  //
  // Fires on a token appearing (they just signed in) and on mount with a token
  // already present (they came back to an editor they abandoned). Both are the
  // same event as far as this is concerned: there is now someone to own it.
  const adopted = useRef(false);
  useEffect(() => {
    const o = latest.current;
    if (adopted.current || !o.isAuthenticated || !o.accessToken) return;
    // A page opened from the profile is already a row. Adopting on top of it
    // would fork the user's own draft into two.
    if (o.pageId) {
      adopted.current = true;
      return;
    }
    adopted.current = true;

    void (async () => {
      const result = await adoptScratch({
        templateType: o.templateType,
        apiBase: o.apiBase,
        accessToken: o.accessToken as string,
        resolveLocalRef: o.resolveLocalRef,
        onProgress: o.onProgress,
        toBody: o.toBody as ((d: unknown) => unknown) | undefined,
      });

      if (result.status === "adopted") {
        latest.current.setPageId(result.pageId);
        savedAt.current = fingerprint(result.data);
        latest.current.onAdopted?.(result.data as T);
        return;
      }
      // "nothing" — they signed in without held work, which is the ordinary
      // case for someone starting fresh. "failed" — the scratch survived and
      // the next milestone retries. Neither is worth saying anything about.
      if (result.status === "failed") adopted.current = false;
    })();
  }, [opts.isAuthenticated, opts.accessToken, opts.pageId]);

  // ── The two milestones the editor cannot see ──────────────────────────────
  //
  // `visibilitychange` is the one that matters on mobile, where the app being
  // backgrounded is how sessions usually end and `beforeunload` is unreliable.
  // `pagehide` covers the desktop close. Both are best-effort by nature: a save
  // started here may not finish, which is precisely why it is not the ONLY
  // trigger.
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") void saveNow();
    };
    const onPageHide = () => void saveNow();
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onPageHide);
      // Unmounting IS leaving the editor — navigating to the profile, or to
      // another template. Without this, the most ordinary way of walking away
      // from a page saves nothing.
      void saveNow();
    };
  }, [saveNow]);

  return { saveNow };
}

/** The REST base for a template, for editors that do not already hold one. */
export function apiBaseFor(routeSegment: string): string {
  return `${API_URL}/${routeSegment}`;
}
