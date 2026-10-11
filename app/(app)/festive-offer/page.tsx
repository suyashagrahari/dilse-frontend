// ─── /festive-offer — retired ────────────────────────────────────────────────
//
// Round 1 had one merged "festive" (Navratri & Diwali) drop at /festive-offer.
// It is two drops now, each with its own page. Old links land on whichever of
// the two the site is wearing, else on the Diwali page (the later festival).

import { redirect } from "next/navigation";
import { getSeasonServer } from "@/lib/season.server";
import { DANDIYA_PATH, DIWALI_PATH } from "@/lib/season";

export const dynamic = "force-dynamic";

export default async function FestiveOfferRedirect(): Promise<never> {
  const season = await getSeasonServer();
  redirect(season?.mode === "dandiya" ? DANDIYA_PATH : DIWALI_PATH);
}
