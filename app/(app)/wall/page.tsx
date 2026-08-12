import type { Metadata } from "next";
import WallPage from "@/components/wall/WallPage";
import { SITE_URL } from "@/lib/config";

export const metadata: Metadata = {
  title: "The Wall — pages people chose to share | SubhSandesh",
  description:
    "A gallery of pages made on SubhSandesh and shared publicly by the people who made them. First names only. Browse by template and make your own.",
  alternates: { canonical: `${SITE_URL}/wall` },
  openGraph: {
    title: "The Wall | SubhSandesh",
    description: "Pages people made for someone, and chose to share.",
    url: `${SITE_URL}/wall`,
    type: "website",
  },
};

/**
 * Rebuilt at most once a minute. That ceiling is the consent promise, not a
 * performance choice: someone who removes their entry has to see it gone, and
 * sixty seconds is the longest this page is allowed to disagree with the
 * database about who agreed to be on it.
 */
export const revalidate = 60;

export default async function Wall({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort } = await searchParams;

  return (
    <WallPage
      sort={sort === "popular" ? "popular" : "recent"}
      heading="The Wall"
      intro="Pages made on SubhSandesh, shared here by the people who made them. First names only — no photos, no messages. Tap any one to make your own."
    />
  );
}
