// ─── DEV-ONLY fixture endpoint ───────────────────────────────────────────────
//
// `GET /capsule/api/fixture/:shareId` returns the SAME payload shape as
// `GET {API_URL}/capsule-pages/share/:shareId`, so the seal can be checked
// against a real HTTP response — response body, headers and all — without a
// database.
//
// It exists because "no prediction text appears in any network response before
// `opensOn`" is a claim about bytes on the wire, and the only honest way to
// check a claim about bytes on the wire is to look at bytes on the wire.
//
// 404s outside development. It is a test harness, not a feature.

import { NextResponse } from "next/server";
import { DEMO_CAPSULE } from "../../../components/capsuleData";
import { projectSealed } from "../../../components/coerce";
import { AMEND_WINDOW_MS, isOpenable, type Capsule } from "../../../components/types";

export const dynamic = "force-dynamic";

/**
 * `?opens=past` moves the open date behind us so the open branch can be
 * exercised. Nothing else about the capsule changes.
 */
function fixture(opens: string | null): Capsule {
  if (opens === "past") {
    const past = new Date(Date.now() - 86_400_000).toISOString();
    return { ...DEMO_CAPSULE, opensOn: past };
  }
  if (opens === "soon") {
    // Sealed less than 24h before it opens: the amend window is clamped away.
    const soon = new Date(Date.now() + 6 * 3_600_000).toISOString();
    return { ...DEMO_CAPSULE, sealedOn: new Date().toISOString(), opensOn: soon };
  }
  return DEMO_CAPSULE;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ shareId: string }> },
) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  await params;
  const url = new URL(request.url);
  const capsule = fixture(url.searchParams.get("opens"));

  // THE SEAL, mirrored from `capsulePage.controller.ts`. Server time and only
  // server time decides, and the sealed body is CONSTRUCTED — never a copy of
  // the document with fields deleted off it.
  if (!isOpenable(capsule.opensOn, Date.now())) {
    const sealed = Date.parse(capsule.sealedOn);
    const opens = Date.parse(capsule.opensOn);
    const closes = Number.isNaN(opens) ? sealed + AMEND_WINDOW_MS : Math.min(sealed + AMEND_WINDOW_MS, opens);
    const amendUntil = Date.now() < closes ? new Date(closes).toISOString() : undefined;

    return NextResponse.json({
      success: true,
      data: projectSealed(capsule, amendUntil),
      hasPassword: false,
      templateType: "capsule",
    });
  }

  return NextResponse.json({
    success: true,
    data: { ...capsule, state: "open" },
    hasPassword: false,
    templateType: "capsule",
  });
}
