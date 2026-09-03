"use client";

// ─── Reopening a page from the profile ───────────────────────────────────────
//
// The profile's Edit button pushes `{editorRoute}?edit={pageId}`, and the editor
// is expected to fetch that row and load it into its form. Thirty-seven of
// forty-three do. The other six do not, so for those six the button opens a
// blank editor showing demo content — and someone who then edits and saves
// overwrites their own page with a fresh one.
//
// Nothing about that failure is visible. There is no error, no empty state; the
// page simply is not the one they clicked. Auto-draft makes it far worse: with
// every abandoned build now landing in the profile, the Edit button becomes the
// main way anyone returns to their work.
//
// The projection that decides what a reopened page CONTAINS lives in
// `pickFields.ts`, dependency-free so it can be tested.

import { useEffect, useRef } from "react";
import { IS_NGROK } from "@/lib/config";
import { pickKnownFields } from "./pickFields";

export interface UseResumeDraftOptions<T extends object> {
  /** The template's REST base, e.g. `` `${API_URL}/darling-pages` ``. */
  base: string;
  /** The `edit` search param, or null. Read by the caller, which owns the router. */
  editId: string | null;
  accessToken: string | null | undefined;
  /** The editor's demo/blank content — the shape and the fallbacks. */
  defaults: T;
  /** Hand the loaded content back to the editor's own state. */
  onLoaded: (data: T, pageId: string) => void;
  /**
   * Hold the fetch until the editor is ready for it.
   *
   * Several editors settle a theme or a font before first paint and stomp state
   * set before that. Defaults to true.
   */
  ready?: boolean;
}

/**
 * Fetch `?edit=<id>` once and hand it to the editor.
 *
 * Runs at most once per mount. The token arriving late is the normal case — it
 * is read from storage after hydration — so this waits for it rather than
 * giving up, which is the bug the rakhi editor's resume-publish effect
 * documents at length.
 */
export function useResumeDraft<T extends object>(opts: UseResumeDraftOptions<T>): void {
  const latest = useRef(opts);
  latest.current = opts;

  const loaded = useRef(false);
  const ready = opts.ready !== false;

  useEffect(() => {
    const o = latest.current;
    if (loaded.current || !o.editId || !o.accessToken || o.ready === false) return;
    loaded.current = true;

    void (async () => {
      try {
        const res = await fetch(`${o.base}/${o.editId}`, {
          headers: {
            Authorization: `Bearer ${o.accessToken}`,
            ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
          },
        });
        const json = await res.json();
        if (!res.ok || !json?.success || !json.data) {
          // Someone else's page, or one since deleted. Leave the editor on its
          // demo content: it is a usable blank editor, which is a better place
          // to land than an error screen for something they cannot act on.
          loaded.current = false;
          return;
        }
        latest.current.onLoaded(pickKnownFields(latest.current.defaults, json.data), o.editId as string);
      } catch {
        // Retry on the next token or ready change rather than stranding them.
        loaded.current = false;
      }
    })();
  }, [opts.editId, opts.accessToken, ready]);
}
