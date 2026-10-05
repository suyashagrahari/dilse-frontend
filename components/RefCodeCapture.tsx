"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { saveRefCode } from "@/lib/referral";

/**
 * Captures ?ref=CODE from any URL into the root-domain referral cookie (see
 * `lib/referral.ts`). Mounted in the root layout so it runs on every route —
 * templates and share pages included, which are where influencer links land.
 */
export default function RefCodeCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) saveRefCode(ref);
  }, [searchParams]);

  return null;
}
