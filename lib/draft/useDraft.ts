"use client";

// ─── One hook, forty-three editors ───────────────────────────────────────────
//
// Wiring, for an editor that already has `content`, `pageId` and a REST base:
//
//     const draft = useDraft({
//       templateType: TEMPLATE,
//       content,
//       enabled: isPersonalized,
//       busy: publishing || saving,
//       isAuthenticated,
//       accessToken,
//       pageId,
//       persist: async (d) => {
//         const r = await saveToServer(d, pagePassword);
//         return r?.data?._id ? String(r.data._id) : pageId;
//       },
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
import { adoptScratch } from "./adopt";
import { fingerprint, hasContentChanged } from "./scratchCodec";
import { clearScratch, readScratch, saveScratch } from "./localScratch";
import type { LocalRefResolver } from "./mediaUpload";

export interface UseDraftOptions<T> {
  templateType: string;
  /**
   * Write this content and answer with the row's id.
   *
   * This is the editor's OWN save — `saveToServer`, or whatever it is called
   * there — wrapped to return the id. Passing the save rather than a URL and a
   * field map means there is one description of each template's wire shape, in
   * the place it already lived. See the long note in `adopt.ts`.
   *
   * It must handle both create and update; every editor's already does, keyed on
   * its own `pageId`.
   */
  persist: (data: T) => Promise<string | null>;
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
  /**
   * Told the id when adoption creates the row.
   *
   * Optional: an editor whose `persist` already sets its own `pageId` — most of
   * them do — needs nothing here.
   */
  setPageId?: (id: string) => void;
  /**
   * Put held work back on screen.
   *
   * Called on both paths that produce content the editor is not already
   * showing:
   *
   *   • RESTORED — a signed-out visitor came back to this editor and the
   *     browser still holds what they built. No server involved.
   *   • ADOPTED  — they signed in, so the same work is now a row and its
   *     photos are CDN URLs. The editor MUST be told, or its next save sends
   *     the base64 back and re-uploads all of it.
   */
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
  // Kept in an effect, not written during render: refs are not render values,
  // and React's lint rule for that is correct here. Declared FIRST so it runs
  // before the effects below on the same commit — effects fire in declaration
  // order, so everything after this sees the current props.
  useEffect(() => {
    latest.current = opts;
  });

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

      // ── Signed in: the editor's own save, which handles create and update ──
      const id = await o.persist(o.content);
      if (!id) return;

      o.setPageId?.(id);
      savedAt.current = stamp;
      // The row now holds this work, so the browser copy is redundant — and a
      // stale scratch left behind would be adopted as a SECOND draft the next
      // time this editor opened.
      await clearScratch(o.templateType);
    } catch {
      // Left dirty on purpose: the next milestone retries. A failed draft save
      // is not something to interrupt someone mid-sentence about.
    } finally {
      inFlight.current = false;
    }
  }, []);

  // ── Restore: put the browser's copy back on screen ───────────────────────
  //
  // THIS IS THE OTHER HALF OF "carry on where you left off".
  //
  // Saving to the scratch is useless on its own. A signed-out visitor who
  // builds a page, closes the tab and comes back gets the demo content, while
  // their actual work sits in IndexedDB — invisible until they happen to sign
  // in, at which point it appears as a draft they had no idea still existed.
  //
  // Runs only when there is no `pageId`: a page opened from the profile is
  // already the real thing, and overwriting it with older browser scratch would
  // silently revert edits the user made on another device.
  //
  // Adoption is left to the effect below. If a token is already present on
  // mount, both would otherwise race for the same content — this one stops at
  // putting it on screen, which is what the ordering guard below relies on.
  const restored = useRef(false);
  useEffect(() => {
    const o = latest.current;
    if (restored.current || o.pageId) return;
    restored.current = true;

    void (async () => {
      const held = await readScratch(o.templateType);
      if (held === null) return;
      // Signed in already? Adoption is about to write this same payload to the
      // server and will call `onAdopted` itself with the CDN URLs. Showing the
      // base64 version first would flash the old photos and, worse, leave the
      // fingerprint pointing at content the server does not have.
      if (latest.current.isAuthenticated && latest.current.accessToken) return;

      savedAt.current = fingerprint(held);
      latest.current.onAdopted?.(held as T);
    })();
  }, [opts.pageId]);

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
        persist: (d) => latest.current.persist(d as T),
        accessToken: o.accessToken as string,
        resolveLocalRef: o.resolveLocalRef,
        onProgress: o.onProgress,
      });

      if (result.status === "adopted") {
        latest.current.setPageId?.(result.pageId);
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
