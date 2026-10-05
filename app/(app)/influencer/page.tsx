import type { Metadata } from "next";
import { buildMeta } from "@/lib/seo";
import InfluencerHubClient from "./InfluencerHubClient";

export const metadata: Metadata = {
  ...buildMeta({
    title: "Influencer Program: Earn with SubhSandesh",
    description: "Share your SubhSandesh invite link and earn commission on every premium template your followers make.",
  }),
  robots: { index: false, follow: true },
};

export default function InfluencerPage() {
  return <InfluencerHubClient />;
}
