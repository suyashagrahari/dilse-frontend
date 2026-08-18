import type { Metadata } from "next";
import { TEMPLATE_DATA } from "@/lib/seo-data";
export type { TemplateData, HowToData, ReviewData, AggregateRatingData } from "@/lib/seo-data";

export const SITE_NAME = "SubhSandesh";
export const SITE_TAGLINE = "Make Every Moment Special";
export const SITE_DESCRIPTION =
  "Create stunning personalized pages for birthdays, anniversaries, Valentine's Day, and more. Share your feelings with a beautiful link.";
import { SITE_URL as _SITE_URL } from "@/lib/config";
export const SITE_URL = _SITE_URL;
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

export function buildMeta(overrides: Partial<Metadata> & { title?: string; description?: string } = {}): Metadata {
  const title = overrides.title || `${SITE_NAME} - ${SITE_TAGLINE}`;
  const description = overrides.description || SITE_DESCRIPTION;

  return {
    title,
    description,
    metadataBase: new URL(SITE_URL),
    openGraph: {
      title,
      description,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_US",
      images: [{ url: DEFAULT_OG_IMAGE, width: 1370, height: 784, alt: SITE_NAME }],
      ...(typeof overrides.openGraph === "object" ? overrides.openGraph : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
      ...(typeof overrides.twitter === "object" ? overrides.twitter : {}),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
    ...(overrides.alternates ? { alternates: overrides.alternates } : {}),
    ...(overrides.keywords ? { keywords: overrides.keywords } : {}),
  };
}

// ─── TEMPLATE_SEO — derived from TEMPLATE_DATA ───────────────────────────────
// To add keywords/FAQs/HowTo: edit lib/seo-data.ts
export const TEMPLATE_SEO = Object.fromEntries(
  Object.entries(TEMPLATE_DATA).map(([slug, data]) => [
    slug,
    {
      title: data.title,
      description: data.description,
      keywords: data.keywords,
      category: data.category,
      emoji: data.emoji,
    },
  ])
);

// ─── Per-template data accessors ──────────────────────────────────────────────

export function getFAQs(slug: string) {
  return TEMPLATE_DATA[slug]?.faqs ?? [];
}

export function getHowTo(slug: string) {
  return TEMPLATE_DATA[slug]?.howTo ?? null;
}

export function getAggregateRating(slug: string) {
  return TEMPLATE_DATA[slug]?.aggregateRating ?? null;
}

export function getTemplateMeta(slug: string): Metadata {
  const data = TEMPLATE_DATA[slug];
  if (!data) return buildMeta();
  return buildMeta({
    title: `${data.title} | ${SITE_NAME}`,
    description: data.description,
    keywords: data.keywords,
    openGraph: {
      title: `${data.emoji} ${data.title}`,
      description: data.description,
    },
  });
}

// ─── Share page helpers ───────────────────────────────────────────────────────

const TEMPLATE_TYPE_INFO: Record<string, { emoji: string; label: string }> = {
  birthday:      { emoji: "🎂", label: "Birthday" },
  "birthday-gf": { emoji: "🎂", label: "Birthday" },
  valentine:     { emoji: "💝", label: "Valentine's" },
  anniversary:   { emoji: "💍", label: "Anniversary" },
  wedding:       { emoji: "💍", label: "Wedding" },
  reception:     { emoji: "🎊", label: "Reception" },
  eid:           { emoji: "🌙", label: "Eid Mubarak" },
  holi:          { emoji: "🌈", label: "Holi" },
  missyou:       { emoji: "💭", label: "Miss You" },
  sorry:         { emoji: "🥺", label: "Sorry" },
  love:          { emoji: "💕", label: "Love" },
  shaadi:        { emoji: "💍", label: "Wedding" },
  // Without this entry a forwarded rakhi link previews as "🎁 Gift for Ananya
  // from Kabir" via the fallback below, which is the weakest possible version of
  // the one thing that actually travels on WhatsApp. There is no
  // `TEMPLATE_COVER_IMAGES` entry to go with it deliberately: the `/api/og`
  // fallback composes both names into the image, and a static cover would lose
  // that. See `getSharePageMeta`.
  "raksha-bandhan-sister": { emoji: "🪢", label: "Raksha Bandhan" },
  gift:          { emoji: "🎁", label: "Gift" },
};

// Real template cover art used as the social-share (OG) image. Paths point to the
// actual on-disk .webp assets and carry their true pixel dimensions so the OG
// width/height tags match the image (no awkward crop). All current covers are
// portrait — declaring correct dims lets WhatsApp/iMessage render them cleanly.
const TEMPLATE_COVER_IMAGES: Record<string, { path: string; width: number; height: number }> = {
  "birthday-gf": { path: "https://cdn.subhsandesh.in/gifts-media/assets/Birthday1/birthdaytemplate1.webp", width: 630, height: 1122 },
  wedding:       { path: "https://cdn.subhsandesh.in/gifts-media/assets/marriage/weeding.webp", width: 1024, height: 1536 },
  reception:     { path: "https://cdn.subhsandesh.in/gifts-media/assets/Reception/reception.webp", width: 1024, height: 1536 },
  eid:           { path: "https://cdn.subhsandesh.in/gifts-media/assets/Eid/hero_eid.webp", width: 768, height: 1344 },
  holi:          { path: "https://cdn.subhsandesh.in/gifts-media/assets/Holi/hero_holi.webp", width: 1024, height: 1536 },
};

interface SharePageSeo {
  templateType: string;
  recipientName: string;
  senderName: string;
  shareId: string;
}

export function getSharePageMeta({ templateType, recipientName, senderName, shareId }: SharePageSeo): Metadata {
  const info = TEMPLATE_TYPE_INFO[templateType] ?? { emoji: "🎁", label: "Gift" };

  const title = `${info.emoji} ${info.label} for ${recipientName} from ${senderName}`;
  const description = `${senderName} created a special ${info.label.toLowerCase()} surprise for ${recipientName}. Open to see the magic! ✨`;

  const cover = TEMPLATE_COVER_IMAGES[templateType];
  const ogImageUrl = cover
    ? `${SITE_URL}${cover.path}`
    : `${SITE_URL}/api/og?type=${encodeURIComponent(templateType)}&recipient=${encodeURIComponent(recipientName)}&sender=${encodeURIComponent(senderName)}`;

  const ogImageMeta = cover
    ? { url: ogImageUrl, width: cover.width, height: cover.height, alt: title }
    : { url: ogImageUrl, width: 1200, height: 630, alt: title };

  return buildMeta({
    title: `${title} | ${SITE_NAME}`,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${shareId}`,
      type: "article",
      images: [ogImageMeta],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  });
}

// ─── TEMPLATE_FAQS — kept for backward compat ─────────────────────────────────
export const TEMPLATE_FAQS = Object.fromEntries(
  Object.entries(TEMPLATE_DATA).map(([slug, data]) => [slug, data.faqs])
);
