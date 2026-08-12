import type { Metadata } from "next";
import { notFound } from "next/navigation";
import WallPage from "@/components/wall/WallPage";
import { WALL_SLUGS, isWallSlug } from "@/lib/wall/slugs";
import { wallPalette } from "@/lib/wall/format";
import { SITE_URL } from "@/lib/config";

export const revalidate = 60;

/**
 * One pre-rendered page per template.
 *
 * This is the actual reason the Wall earns its keep: thirty indexable pages,
 * each with its own title and H1, each linking into a builder. It is the only
 * part of the site that grows on its own.
 */
export function generateStaticParams() {
  return WALL_SLUGS.map((template) => ({ template }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ template: string }>;
}): Promise<Metadata> {
  const { template } = await params;
  if (!isWallSlug(template)) return {};

  const { title } = wallPalette(template, template);
  const url = `${SITE_URL}/wall/${template}`;

  return {
    // "Pages made with the <name> template", never "<name> pages" — a good
    // number of these templates are named as questions ("Will You Marry Me?"),
    // and "Will You Marry Me? pages" reads like a typo.
    title: `${title} on The Wall | SubhSandesh`,
    description: `Pages made with the ${title} template on SubhSandesh, shared publicly by the people who made them. Browse them and make your own in a couple of minutes.`,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} on The Wall | SubhSandesh`,
      description: `${title} pages people made for someone, and chose to share.`,
      url,
      type: "website",
    },
  };
}

export default async function WallTemplate({
  params,
  searchParams,
}: {
  params: Promise<{ template: string }>;
  searchParams: Promise<{ sort?: string }>;
}) {
  const { template } = await params;
  const { sort } = await searchParams;

  // An unknown slug is a 404, not an empty page dressed up as a real one.
  if (!isWallSlug(template)) notFound();

  const { title } = wallPalette(template, template);

  return (
    <WallPage
      slug={template}
      sort={sort === "popular" ? "popular" : "recent"}
      heading={`${title} on The Wall`}
      intro={`Pages made with the ${title} template, shared here by the people who made them. Make your own — it takes a couple of minutes.`}
    />
  );
}
