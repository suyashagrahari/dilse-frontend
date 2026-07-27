// Public engagement calls from the shared recipient page (no auth). Used by the
// hug counter and the love-map. Failures are swallowed — engagement is best-effort
// and must never break the gift.
import { API_URL, IS_NGROK } from "@/lib/config";
import type { LoveMapData } from "./types";

const BASE = `${API_URL}/missyou-gf-pages`;
const headers = () => ({
  "Content-Type": "application/json",
  ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
});

/** Register `delta` hugs; returns the new server total (or null on failure). */
export async function postHug(shareId: string, delta: number): Promise<number | null> {
  try {
    const r = await fetch(`${BASE}/share/${shareId}/hug`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ delta }),
    });
    const j = await r.json();
    return j?.success ? Number(j.hugCount) : null;
  } catch {
    return null;
  }
}

/** Save the recipient's love-map answers (partial patch). */
export async function putLoveMap(shareId: string, patch: Partial<LoveMapData>): Promise<boolean> {
  try {
    const r = await fetch(`${BASE}/share/${shareId}/lovemap`, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify(patch),
    });
    const j = await r.json();
    return !!j?.success;
  } catch {
    return false;
  }
}
