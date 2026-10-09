// ⚠ DEV-ONLY LAB — DELETE BEFORE RELEASE.
// A scratch page to eyeball the premium cinema kit
// (app/(templates)/_valentine/kit/premium/cinema). It 404s in production builds
// and is never linked, indexed or listed in client/lib/site-routes.ts.
//
//   /cinema-lab?preset=velvet&particles=petals
//   /cinema-lab?preset=fog&particles=bats&tone=ember

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Lab from "./Lab";

export const metadata: Metadata = { title: "Cinema lab (dev)", robots: { index: false, follow: false } };

export default async function CinemaLabPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const sp = await searchParams;
  return <Lab preset={sp.preset} particles={sp.particles} tone={sp.tone} />;
}
