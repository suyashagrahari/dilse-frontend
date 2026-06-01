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
  gift:          { emoji: "🎁", label: "Gift" },
};

const TEMPLATE_COVER_IMAGES: Record<string, string> = {
  "birthday-gf": "/assets/Birthday1/birthdaytemplate1.png",
  wedding:       "/assets/marriage/weeding.png",
  reception:     "/assets/Reception/reception.png",
  eid:           "/assets/Eid/hero_eid.jpeg",
  holi:          "/assets/Holi/hero_holi.png",
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

  const coverPath = TEMPLATE_COVER_IMAGES[templateType];
  const ogImageUrl = coverPath
    ? `${SITE_URL}${coverPath}`
    : `${SITE_URL}/api/og?type=${encodeURIComponent(templateType)}&recipient=${encodeURIComponent(recipientName)}&sender=${encodeURIComponent(senderName)}`;

  const PORTRAIT_TEMPLATES = new Set(["birthday-gf"]);
  const ogImageMeta = coverPath
    ? PORTRAIT_TEMPLATES.has(templateType)
      ? { url: ogImageUrl, width: 630, height: 1122, alt: title }
      : { url: ogImageUrl, width: 1280, height: 853, alt: title }
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
