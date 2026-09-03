// ─── Where a signed-out visitor's work lives ─────────────────────────────────
//
// One IndexedDB store, one record per templateType, holding the editor's own
// payload until the moment the user signs in and `adopt.ts` promotes it to a
// real draft row.
//
// ── WHAT THIS DOES AND DOES NOT REPLACE ─────────────────────────────────────
//
// Twenty-nine editors already autosave, each to its own hand-rolled key —
// `holi_mf_draft`, `flags_draft`, `court-marriage_draft`, `reception_mf_draft`.
// Same idea implemented twenty-nine times, no shared contract, no version
// stamp, and no way to answer "does this browser hold unsaved work" without
// knowing all twenty-nine names.
//
// This store does NOT delete those. It runs alongside them, and that is a
// deliberate limit on the change rather than a design view: several of them
// save the manual-form buffer rather than the content, one uses sessionStorage,
// and unpicking twenty-nine bespoke restore paths in the same change that
// introduces server drafts would put the risk in the wrong place.
//
// What this store is, then, is the ONE copy that adoption reads and the one
// that survives a version bump. Consolidating the legacy keys onto it is a
// follow-up, and until that happens a photo-heavy template still has a
// localStorage write that can throw the quota error described below — just no
// longer the only place its work lives.
//
// ── WHY IndexedDB AND NOT localStorage ──────────────────────────────────────
//
// Thirty-eight templates hold their photos as base64 data URLs inside the
// payload. localStorage gives a page roughly 5 MB for EVERYTHING it stores, and
// base64 costs about 1.37× the raw bytes — so a single 4 MB photo overruns it.
//
// The way it overruns matters: `setItem` throws QuotaExceededError, and in the
// twenty-nine editors doing this today that throw is inside an autosave nobody
// awaits. The write fails, nothing tells the user, and the work is gone at the
// next reload. IndexedDB is asynchronous, is measured in hundreds of MB, and
// stores Blobs without base64 inflation.
//
// ── WHY EVERY FAILURE HERE IS SWALLOWED ─────────────────────────────────────
//
// Private windows, "block site data", Safari evicting storage, a corrupt
// database. None of it is recoverable and none of it is the user's problem
// mid-sentence: a failed scratch write costs the pre-login convenience and
// nothing else, because publishing has never depended on this store. So every
// entry point resolves rather than throws, and a broken IndexedDB degrades to
// exactly the behaviour we had before drafts existed.

import { decodeScratch, encodeScratch } from "./scratchCodec";

const DB_NAME = "subhsandesh-drafts";
const DB_VERSION = 1;
const STORE = "scratch";

/** One record per template. A signed-out visitor has no identity to own two. */
type Key = string;

function openDb(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof indexedDB === "undefined") return resolve(null);
    let req: IDBOpenDBRequest;
    try {
      req = indexedDB.open(DB_NAME, DB_VERSION);
    } catch {
      return resolve(null);
    }
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
    // Another tab holding an older version open. Rather than hang the editor,
    // give up and run without scratch.
    req.onblocked = () => resolve(null);
  });
}

function withStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest,
  fallback: T
): Promise<T> {
  return new Promise((resolve) => {
    void openDb().then((db) => {
      if (!db) return resolve(fallback);
      let request: IDBRequest;
      try {
        request = run(db.transaction(STORE, mode).objectStore(STORE));
      } catch {
        db.close();
        return resolve(fallback);
      }
      request.onsuccess = () => {
        resolve((request.result as T) ?? fallback);
        db.close();
      };
      request.onerror = () => {
        resolve(fallback);
        db.close();
      };
    });
  });
}

/** Hold this template's work in the browser. Never throws. */
export async function saveScratch(templateType: string, data: unknown): Promise<void> {
  const key: Key = templateType;
  await withStore<unknown>("readwrite", (s) => s.put(encodeScratch(templateType, data), key), null);
}

/**
 * This template's held work, or `null` if there is none we can trust.
 *
 * Version and template are verified by `decodeScratch`, not here — see the note
 * there for why a doubtful record is treated as absent.
 */
export async function readScratch(templateType: string): Promise<unknown | null> {
  const raw = await withStore<unknown>("readonly", (s) => s.get(templateType), null);
  return decodeScratch(raw, templateType);
}

/**
 * Forget this template's held work.
 *
 * Called by `adopt.ts` only AFTER a server draft comes back with an id. That
 * ordering is the whole safety story: until the row exists, this record is the
 * only copy of the user's work.
 */
export async function clearScratch(templateType: string): Promise<void> {
  await withStore<unknown>("readwrite", (s) => s.delete(templateType), null);
}

/**
 * Every template this browser holds work for.
 *
 * Adoption runs on sign-in and does not know which editor the user came from —
 * they may have built a holi page on Monday, abandoned it, and signed in from
 * the wedding editor today. Both should become drafts.
 */
export async function listScratchTemplates(): Promise<string[]> {
  const keys = await withStore<IDBValidKey[]>("readonly", (s) => s.getAllKeys(), []);
  return keys.map((k) => String(k)).filter(Boolean);
}
