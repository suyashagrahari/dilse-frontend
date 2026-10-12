import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { API_URL, IS_NGROK } from "@/lib/config";
import { SITE_CONFIG_TAG } from "@/lib/siteCache";

export const dynamic = "force-dynamic";

/**
 * POST /api/revalidate/site — called by the admin screens after a season or
 * template-visibility save (lib/siteCache.ts).
 *
 * Who may: whoever the API accepts as an admin. The caller's bearer token is
 * forwarded to an admin-only API route, so this endpoint holds no secret of its
 * own and the API stays the one place that decides.
 *
 * `expire: 0` rather than the "max" profile: "max" is stale-while-revalidate,
 * which hands the next visitor the old page — the exact thing this fixes.
 */
export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  if (!/^Bearer \S+$/.test(auth) || !API_URL) {
    return NextResponse.json({ revalidated: false }, { status: 401 });
  }
  try {
    const res = await fetch(`${API_URL}/admin/template-visibility`, {
      cache: "no-store",
      headers: { Authorization: auth, ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}) },
    });
    if (!res.ok) return NextResponse.json({ revalidated: false }, { status: res.status === 403 ? 403 : 401 });
  } catch {
    return NextResponse.json({ revalidated: false }, { status: 502 });
  }

  revalidateTag(SITE_CONFIG_TAG, { expire: 0 });
  return NextResponse.json({ revalidated: true, now: Date.now() }, { headers: { "Cache-Control": "no-store" } });
}
