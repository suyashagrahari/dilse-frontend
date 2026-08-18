import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

const SLUG = "searched";
// A parody of the search-results GENRE — the centred box, the snippet
// hierarchy, the knowledge panel. Its own wordmark, its own palette, and no
// affiliation with or endorsement by any search company.
const TITLE = "Searched — A Parody Search Page About Someone You Love (Free)";
const DESCRIPTION =
  "They type their own name and the results are all about them. Joke autocomplete, expandable answers, a knowledge panel with a fact table, and clickable pages — the last of which is the actual letter.";
const SOCIAL_TITLE = "About 8,47,000 results (0.42 seconds).";
const SOCIAL_DESCRIPTION = "The autocomplete lands the joke before they've even hit search.";

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
