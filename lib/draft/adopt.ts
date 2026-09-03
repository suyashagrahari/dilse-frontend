// ─── Promoting held work into a real draft ───────────────────────────────────
//
// This is the step the whole feature turns on: the moment a visitor signs up or
// logs in, the page they built while signed out stops being browser state and
// becomes a row they own, with their photos on S3, visible in their profile.
//
// ── THE ORDER IS THE DESIGN ─────────────────────────────────────────────────
//
//   1. read the scratch
//   2. upload every pending photo          ← may fail, harmlessly
//   3. rewrite the payload with CDN URLs
//   4. POST the draft row                  ← may fail, harmlessly
//   5. clear the scratch                   ← ONLY once an id came back
//
// Step 5 last is what makes this safe. Until the row exists, the scratch is the
// only copy of the user's work, so nothing before that point is allowed to
// destroy it. Every failure leaves the scratch intact and returns; the next
// milestone tries again, and publishing still works through the at-publish
// upload path that existed before drafts did. There is no state this can leave
// behind that loses a page.
//
// ── WHY IT ADOPTS ONE TEMPLATE AND NOT ALL OF THEM ──────────────────────────
//
// A visitor could build a holi page on Monday, abandon it, and sign in from the
// wedding editor on Friday. Adopting every held template at sign-in would need a
// client-side map of templateType → REST base for all forty-three — a second
// copy of something only the server knows, which is exactly the drift
// `getMyCreations` was fixed to stop.
//
// Instead each editor adopts its OWN scratch, and it does so on two triggers:
// signing in while the editor is open, and opening the editor while already
// signed in. Friday's visit to the holi editor adopts Monday's holi page. The
// scratch is never orphaned, and no map has to exist.

import { API_URL, IS_NGROK } from "@/lib/config";
import { clearScratch, readScratch } from "./localScratch";
import { collectMediaRefs, replaceMediaRefs } from "./mediaRefs";
import { uploadPendingRef, type LocalRefResolver } from "./mediaUpload";

export interface AdoptOptions {
  /** The editor's templateType, e.g. `"holi"`. Keys the scratch and the S3 folder. */
  templateType: string;
  /**
   * The template's own REST base, e.g. `` `${API_URL}/holi-pages` ``.
   *
   * Passed in rather than derived: every editor already holds this constant, and
   * a second 43-entry map on the client is a thing to keep in sync and get
   * wrong.
   */
  apiBase: string;
  accessToken: string;
  /** Only needed by templates that hold blobs under `idb:` refs. */
  resolveLocalRef?: LocalRefResolver;
  /**
   * Progress copy for the editor's existing publish-stage line, e.g.
   * "Saving your photos… 2 of 5". Called with `null` when done.
   */
  onProgress?: (message: string | null) => void;
  /**
   * Turns the editor's payload into the request body its own POST expects.
   *
   * Most editors wrap content in `{ ...content, password }` or similar; the
   * scratch holds the editor's content shape, not its wire shape. Absent, the
   * payload is sent as-is.
   */
  toBody?: (data: unknown) => unknown;
}

export type AdoptResult =
  /** A draft row now exists. `data` is the payload as saved, with CDN URLs. */
  | { status: "adopted"; pageId: string; data: unknown }
  /** No held work for this template. Nothing to do, and not an error. */
  | { status: "nothing" }
  /** Something failed. The scratch is untouched and will be retried. */
  | { status: "failed"; error: string };

export async function adoptScratch(opts: AdoptOptions): Promise<AdoptResult> {
  const held = await readScratch(opts.templateType);
  if (held === null) return { status: "nothing" };

  // ── 2. photos ─────────────────────────────────────────────────────────────
  const pending = collectMediaRefs(held);
  const map: Record<string, string> = {};

  for (let i = 0; i < pending.length; i++) {
    opts.onProgress?.(
      pending.length === 1 ? "Saving your photo…" : `Saving your photos… ${i + 1} of ${pending.length}`
    );

    const up = await uploadPendingRef(pending[i], {
      templateType: opts.templateType,
      accessToken: opts.accessToken,
      resolveLocalRef: opts.resolveLocalRef,
    });

    if (up.ok && up.url) {
      map[pending[i]] = up.url;
      continue;
    }

    // ── WHY ONE FAILED PHOTO DOES NOT ABORT THE DRAFT ───────────────────────
    //
    // A draft is not a published page. Saving nine of ten photos and coming
    // back to re-add the tenth is a far better afternoon than losing all ten
    // because one was corrupt — and the unmapped ref stays in the payload, so
    // the photo is not silently blanked either.
    //
    // The publish path is where a failed photo MUST stop everything, and it
    // still does: it uploads independently and refuses to publish a page whose
    // image would 404 for the recipient.
    opts.onProgress?.(null);
    if (up.error === "unresolvable-local-ref") {
      // The editor keeps its blobs somewhere we cannot reach. Not a failure —
      // just nothing this module can promote. Save the rest.
      continue;
    }
  }

  opts.onProgress?.(null);
  const data = replaceMediaRefs(held, map);

  // ── 4. the row ────────────────────────────────────────────────────────────
  try {
    const res = await fetch(opts.apiBase, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${opts.accessToken}`,
        ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
      },
      body: JSON.stringify(opts.toBody ? opts.toBody(data) : data),
    });
    const json = await res.json();
    const pageId = json?.data?._id ? String(json.data._id) : "";

    if (!res.ok || !json?.success || !pageId) {
      return {
        status: "failed",
        error: typeof json?.error === "string" ? json.error : "Could not save your draft",
      };
    }

    // ── 5. and only now ───────────────────────────────────────────────────────
    await clearScratch(opts.templateType);
    return { status: "adopted", pageId, data };
  } catch {
    return { status: "failed", error: "Could not save your draft — check your connection" };
  }
}
