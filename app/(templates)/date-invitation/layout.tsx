import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

const SLUG = "date-invitation";
const TITLE = "The Invitation — An Invitation They Have To Answer";
// Intriguing, never spoiling. The copy must never name a stop or a place: the
// whole template is built on the location being unknown until the night.
const DESCRIPTION =
  "Send an invitation instead of a text. It shows the time, how long, what to wear and how much walking — and hides where. Say yes and it becomes a countdown; on the night the plan unlocks one stop at a time while you're actually out.";
const SOCIAL_TITLE = "💌 You're invited. Location: you'll find out.";
const SOCIAL_DESCRIPTION = "Say yes first. The plan unlocks one stop at a time, on the night.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/${SLUG}` },
  openGraph: {
    title: SOCIAL_TITLE,
    description: SOCIAL_DESCRIPTION,
    url: `${SITE_URL}/${SLUG}`,
  },
  twitter: {
    card: "summary_large_image",
    title: SOCIAL_TITLE,
    description: SOCIAL_DESCRIPTION,
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
