// ─── Create-or-update, once, for every editor ────────────────────────────────
//
// Thirty-one editors hold the same pair:
//
//     const create = useCallback(async (): Promise<string | null> => { POST  }
//     const update = useCallback(async (id: string) => { PUT }
//
// and both read `content` out of the closure rather than taking it as an
// argument. That is fine for publishing, which always sends what is on screen,
// and wrong for adoption, which has to send the payload that came out of the
// browser's scratch — the closure holds whatever the editor was showing, which
// during a sign-in is the untouched demo.
//
// So the draft path does not reuse `create`/`update`. It reuses the thing that
// actually describes the wire shape — the template's own
// `{x}DataToBody(data, password)`, which all thirty-one already export — and
// this helper carries the one bit of logic they all repeated: which verb, and
// which URL.

export interface PersistDraftOptions {
  /** The template's REST base, e.g. `` `${API_URL}/flags-pages` ``. */
  base: string;
  headers: HeadersInit;
  /** The row to update, or null to create one. */
  pageId: string | null;
  /** Told the id when a row is created. */
  setPageId?: (id: string) => void;
  /** Already in wire shape — the output of the template's own `*DataToBody`. */
  body: unknown;
}

/**
 * Write a draft and answer with the row's id, or `null` if it did not land.
 *
 * Never throws: `useDraft` treats a null as "still dirty, try at the next
 * milestone", which is the right response to a flaky connection and a much
 * better one than an exception surfacing over someone's half-written card.
 */
export async function persistDraft(opts: PersistDraftOptions): Promise<string | null> {
  const body = JSON.stringify(opts.body);

  try {
    if (opts.pageId) {
      const res = await fetch(`${opts.base}/${opts.pageId}`, {
        method: "PUT",
        headers: opts.headers,
        body,
      });
      // The id is unchanged on an update, so answering with it is what tells
      // `useDraft` the write landed.
      return res.ok ? opts.pageId : null;
    }

    const res = await fetch(opts.base, { method: "POST", headers: opts.headers, body });
    const json = await res.json();
    const id = json?.data?._id ? String(json.data._id) : "";
    if (!res.ok || !json?.success || !id) return null;

    opts.setPageId?.(id);
    return id;
  } catch {
    return null;
  }
}
