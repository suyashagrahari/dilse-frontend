import type { Metadata } from "next";
import { usScript } from "./components/fonts";
import { SITE_URL } from "@/lib/seo";


const SLUG = "us";
// A parody of the social-profile LAYOUT — the stats row, the highlight
// bubbles, the 1px grid. Its own wordmark, no gradient anywhere, and no
// affiliation with or endorsement by any social network.
const TITLE = "Us — Your Relationship Gets Its Own Profile (Free)";
const DESCRIPTION =
  "Your relationship gets its own profile: story ring, highlights, a photo grid, posts with double-tap hearts, DMs, and a secret love letter. Tapping Following will not let you unfollow.";
const SOCIAL_TITLE = "@us_since_2023 · 847 followers";
const SOCIAL_DESCRIPTION = "The grid, the highlights, and the double-tap heart. All of it works.";

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
  return <div className={usScript.variable}>{children}</div>;
}
