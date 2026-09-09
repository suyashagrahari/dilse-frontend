"use client";

import type { GaneshData } from "./types";

// ─── Local media, held until publish ─────────────────────────────────────────
//
// A photo the sender picks does NOT go to S3 when they pick it. It is baked to
// a square, written to IndexedDB, and referenced from the form as `idb:<id>`.
// Nothing leaves the browser until they publish, and at that point every held
// blob is uploaded in one pass and the refs are rewritten to CDN URLs.
//
// ── WHY THIS IS BETTER THAN UPLOADING ON PICK ───────────────────────────────
//
//   • Adding a photo no longer needs an account. Uploading on pick meant
//     `/media/upload` needed a token, which is why picking a photo while signed
//     out used to do nothing at all. Now sign-in happens once, at publish,
//     where it was always required anyway.
//   • Abandoned drafts stop costing bucket space. Most people who open a
//     builder never publish; every photo they tried was previously uploaded and
//     kept forever, with nothing pointing at it.
//   • Re-cropping is free. She can replace the same photo six times and only
//     the last one is ever sent.
//
// ── WHY IndexedDB AND NOT base64 ON THE DOCUMENT ────────────────────────────
//
// The older templates in this repo read the file with `FileReader` and keep the
// base64 data URL in form state, which then gets saved onto the document.
// `upload.ts` explains why that is wrong here: base64 is ~1.37× the bytes, this
// template holds a one photo and an optional payment code, and a single document
// would cross Mongo's hard 16 MB BSON ceiling well before the twelfth photo —
// surfacing as an opaque write error at publish time, after all the work.
//
// IndexedDB stores the Blob itself, off the document entirely. Form state carries
// a 40-character ref instead of a megabyte of base64, so autosaves, patches and
// re-renders all stay cheap.
//
// ── WHY IT IS PURGED ON MOUNT ───────────────────────────────────────────────
//
// This template deliberately persists no local draft (see `useGaneshEditor`), so after
// a reload the form is empty and NOTHING references the blobs from the previous
// session. They are unreachable by construction. Purging at editor mount is
// therefore both safe and the only thing standing between this store and
// unbounded growth in the user's browser.

const DB_NAME = "subhsandesh-ganesh-media";
const DB_VERSION = 1;
const STORE = "pending";

/** Marks a value in `GaneshData` as living in IndexedDB rather than on a CDN. */
export const LOCAL_PREFIX = "idb:";

/**
 * Total held bytes we allow before refusing another photo.
 *
 * Browsers give an origin a quota measured in GB and reject writes past it with
 * a `QuotaExceededError` that arrives as a failed photo add. 60 MB is far more
 * than two baked squares need (~250 KB each) and small enough that we fail
 * with our own sentence long before the browser fails with its own.
 */
const MAX_TOTAL_BYTES = 60 * 1024 * 1024;

export type MediaKind = "hero" | "qr";

interface PendingRecord {
  id: string;
  blob: Blob;
  kind: MediaKind;
  createdAt: number;
}

/**
 * ref → object URL, for the lifetime of the tab.
 *
 * Created when the blob is stored, so resolution is synchronous everywhere
 * downstream — a render path that had to await IndexedDB would flash an empty
 * frame on every re-render.
 */
const urls = new Map<string, string>();

export function isLocalRef(value: string | null | undefined): boolean {
  return typeof value === "string" && value.startsWith(LOCAL_PREFIX);
}

function newId(): string {
  // `randomUUID` needs a secure context; localhost and https both qualify, but
  // a plain-http preview host would not, and an editor that throws when adding
  // a photo is worse than one with a slightly weaker id. Nothing here is a
  // security boundary — it is a map key.
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function open(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof indexedDB === "undefined") {
      resolve(null);
      return;
    }
    let req: IDBOpenDBRequest;
    try {
      req = indexedDB.open(DB_NAME, DB_VERSION);
    } catch {
      // Safari in private mode has historically thrown here rather than
      // returning an unusable database.
      resolve(null);
      return;
    }
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
    // A blocked upgrade would otherwise hang this promise forever.
    req.onblocked = () => resolve(null);
  });
}

function tx<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T | null> {
  return new Promise((resolve) => {
    void open().then((db) => {
      if (!db) {
        resolve(null);
        return;
      }
      try {
        const t = db.transaction(STORE, mode);
        const req = run(t.objectStore(STORE));
        req.onsuccess = () => resolve(req.result ?? null);
        req.onerror = () => resolve(null);
        t.oncomplete = () => db.close();
        t.onabort = () => {
          db.close();
          resolve(null);
        };
      } catch {
        db.close();
        resolve(null);
      }
    });
  });
}

/** Bytes currently held. Used to refuse a photo before the browser does. */
async function heldBytes(): Promise<number> {
  const all = (await tx<PendingRecord[]>("readonly", (s) => s.getAll() as IDBRequest<PendingRecord[]>)) ?? [];
  return all.reduce((n, r) => n + (r.blob?.size ?? 0), 0);
}

export interface PutResult {
  ok: boolean;
  /** `idb:<id>`, ready to store in `GaneshData`. */
  ref?: string;
  /** An object URL for immediate display. */
  url?: string;
  /** Safe to show the user. */
  error?: string;
}

/** Hold a baked image locally and return the ref the form should carry. */
export async function putLocal(blob: Blob, kind: MediaKind): Promise<PutResult> {
  if (typeof indexedDB === "undefined") {
    return { ok: false, error: "This browser cannot hold photos — try another one" };
  }
  if (blob.size + (await heldBytes()) > MAX_TOTAL_BYTES) {
    return { ok: false, error: "That's a lot of photos — publish this page before adding more" };
  }

  const id = newId();
  const record: PendingRecord = { id, blob, kind, createdAt: Date.now() };

  // `put` resolving to null means the write failed — a full disk, a private
  // window, a browser that closed the database under us. Reported rather than
  // swallowed, because the alternative is a form holding a ref to nothing and a
  // publish that silently drops her photo.
  const key = await tx("readwrite", (s) => s.put(record) as IDBRequest<IDBValidKey>);
  if (key === null) {
    return { ok: false, error: "Could not hold that photo — check your browser storage settings" };
  }

  const ref = `${LOCAL_PREFIX}${id}`;
  const url = URL.createObjectURL(blob);
  urls.set(ref, url);
  return { ok: true, ref, url };
}

/** The blob behind a ref, or null if it is gone. */
export async function getLocal(ref: string): Promise<Blob | null> {
  if (!isLocalRef(ref)) return null;
  const rec = await tx<PendingRecord>(
    "readonly",
    (s) => s.get(ref.slice(LOCAL_PREFIX.length)) as IDBRequest<PendingRecord>
  );
  return rec?.blob ?? null;
}

/** Forget one held image — she removed it, or it has been uploaded. */
export async function dropLocal(ref: string): Promise<void> {
  if (!isLocalRef(ref)) return;
  await tx("readwrite", (s) => s.delete(ref.slice(LOCAL_PREFIX.length)) as unknown as IDBRequest<undefined>);
  const url = urls.get(ref);
  if (url) {
    URL.revokeObjectURL(url);
    urls.delete(ref);
  }
}

/** Drop everything. Called at editor mount — see the note at the top. */
export async function purgeLocal(): Promise<void> {
  await tx("readwrite", (s) => s.clear() as unknown as IDBRequest<undefined>);
  for (const url of urls.values()) URL.revokeObjectURL(url);
  urls.clear();
}

/**
 * A displayable URL for anything in `GaneshData`.
 *
 * CDN URLs pass straight through, so callers do not have to know which kind of
 * value they are holding.
 */
export function displayUrl(value: string): string {
  if (!isLocalRef(value)) return value;
  return urls.get(value) ?? "";
}

// ═══════════════════════════════════════════════════════════════════════════
// Whole-record helpers
// ═══════════════════════════════════════════════════════════════════════════

/**
 * A copy of the data with every local ref swapped for a displayable URL.
 *
 * Applied ONCE, at the editor boundary, so that every screen below keeps
 * rendering a plain string and knows nothing about IndexedDB. That seam is the
 * reason this feature touches four render sites instead of fourteen.
 */
export function resolveMedia(data: GaneshData): GaneshData {
  if (!hasLocalMedia(data)) return data;
  return {
    ...data,
    photoUrl: displayUrl(data.photoUrl),
    vargani: { ...data.vargani, qrImageUrl: displayUrl(data.vargani.qrImageUrl) },
  };
}

/** Every local ref in the record, in upload order. */
export function localRefs(data: GaneshData): string[] {
  const out: string[] = [];
  if (isLocalRef(data.photoUrl)) out.push(data.photoUrl);
  if (isLocalRef(data.vargani.qrImageUrl)) out.push(data.vargani.qrImageUrl);
  return out;
}

export function hasLocalMedia(data: GaneshData): boolean {
  return localRefs(data).length > 0;
}

/** Replace refs with the URLs they uploaded to. Pure. */
export function applyUploaded(data: GaneshData, map: Map<string, string>): GaneshData {
  const swap = (v: string) => (isLocalRef(v) ? map.get(v) ?? "" : v);
  return {
    ...data,
    photoUrl: swap(data.photoUrl),
    vargani: { ...data.vargani, qrImageUrl: swap(data.vargani.qrImageUrl) },
  };
}

/**
 * A file name and type for the upload, derived from the blob.
 *
 * The server keys its object on what it receives, and an extension that
 * disagrees with the bytes is the kind of thing that surfaces months later as
 * one browser refusing to render one photo.
 */
export function blobToFile(blob: Blob, kind: MediaKind): File {
  const ext = blob.type === "image/png" ? "png" : blob.type === "image/jpeg" ? "jpg" : "webp";
  return new File([blob], `${kind}.${ext}`, { type: blob.type || "image/webp" });
}
