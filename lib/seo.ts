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
    // overrides.robots MUST win. This used to be a hardcoded index/follow with
    // no spread, so /profile, /favorites and every personal share page asked for
    // noindex and silently shipped "index, follow" instead.
    robots: overrides.robots ?? {
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
  love:          { emoji: "💕", label: "Love" },
  shaadi:        { emoji: "💍", label: "Wedding" },
  // Without this entry a forwarded rakhi link previews as "🎁 Gift for Ananya
  // from Kabir" via the fallback below, which is the weakest possible version of
  // the one thing that actually travels on WhatsApp. There is no
  // `TEMPLATE_COVER_IMAGES` entry to go with it deliberately: the `/api/og`
  // fallback composes both names into the image, and a static cover would lose
  // that. See `getSharePageMeta`.
  "raksha-bandhan-sister": { emoji: "🪢", label: "Raksha Bandhan" },
  "happy-rose-day":       { emoji: "🌹", label: "Rose Day" },
  "happy-propose-day":    { emoji: "💍", label: "Propose Day" },
  "happy-chocolate-day":  { emoji: "🍫", label: "Chocolate Day" },
  "happy-teddy-day":      { emoji: "🧸", label: "Teddy Day" },
  "happy-promise-day":    { emoji: "🤞", label: "Promise Day" },
  "happy-hug-day":        { emoji: "🤗", label: "Hug Day" },
  // Kiss Day previews neutrally (see NEUTRAL_PREVIEW below) — the label is
  // only used if that override is ever removed.
  "happy-kiss-day":       { emoji: "💌", label: "Surprise" },
  "happy-valentines-day": { emoji: "💘", label: "Valentine's Day" },
  "happy-halloween":      { emoji: "🎃", label: "Halloween" },
  "dandiya-partner":      { emoji: "🪔", label: "Dandiya invitation" },
  sorry:                  { emoji: "🥺", label: "Sorry page" },
  "happy-birthday":       { emoji: "🎂", label: "Birthday surprise" },
  "miss-you":             { emoji: "🥹", label: "Miss You page" },
  "will-you-be-mine":     { emoji: "💍", label: "Proposal page" },
  "happy-diwali":         { emoji: "🪔", label: "Diwali" },
  // ✦ Premium twins (same wording as their $2 day; the gate inside is the premium signal).
  "happy-rose-day-premium": { emoji: "🌹", label: "Rose Day" },
  "happy-propose-day-premium": { emoji: "💍", label: "Propose Day" },
  "happy-chocolate-day-premium": { emoji: "🍫", label: "Chocolate Day" },
  "happy-teddy-day-premium": { emoji: "🧸", label: "Teddy Day" },
  "happy-promise-day-premium": { emoji: "🤞", label: "Promise Day" },
  "happy-hug-day-premium": { emoji: "🤗", label: "Hug Day" },
  "happy-kiss-day-premium": { emoji: "💌", label: "Surprise" },
  "happy-valentines-day-premium": { emoji: "💘", label: "Valentine's Day" },
  "happy-halloween-premium": { emoji: "🎃", label: "Halloween" },
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

/** Templates whose share preview must stay neutral (Kiss Day). */
const NEUTRAL_PREVIEW: ReadonlySet<string> = new Set(["happy-kiss-day", "happy-kiss-day-premium"]);

/** Templates with their own teaser preview (the brief's delivery plan). */
const TEASER_PREVIEW: Record<string, (recipient: string, sender: string) => { title: string; description: string }> = {
  "happy-birthday": (r, s) => ({
    title: `🎂 ${r}, someone made you a birthday surprise`,
    description: `${s} wrapped something up for you. Untie the ribbon and make a wish 🎈`,
  }),
  "miss-you": (r, s) => ({
    title: `🥹 ${r}, someone misses you a lot`,
    description: `${s} is calling from far away… pick up, there's a map, a countdown and a boarding pass inside 💗`,
  }),
  sorry: (r, s) => ({
    title: `🥺 ${r}, someone is very, very sorry`,
    description: `${s} made you something. Please open it before you stay mad 💗`,
  }),
  "will-you-be-mine": (r, s) => ({
    title: `💍 ${r}, someone has a question for you`,
    description: `${s} made you something. Open it when you're smiling 💗`,
  }),
  "dandiya-partner": (r, s) => ({
    title: `🪔 ${r}, you've been invited to a Dandiya night`,
    description: `${s} saved you a spot in the garba circle. Bring your sticks ✨`,
  }),
  "happy-halloween": (r, s) => ({
    title: `🎃 A little haunted house was built for ${r}`,
    description: `${s} left something on your doorstep… open it with the lights off 👻`,
  }),
  "happy-diwali": (r, s) => ({
    title: `🪔 Psst, ${r}… someone left a diya at your door`,
    description: `${s} lit up a little Diwali night just for you. Sound on ✨`,
  }),
  "happy-halloween-premium": (r, s) => ({
    title: `🎃 Trick or treat, ${r}? A night at the manor is waiting`,
    description: `${s} left the manor door open for you. Sound on 🎧`,
  }),
};

interface SharePageSeo {
  templateType: string;
  recipientName: string;
  senderName: string;
  shareId: string;
}

export function getSharePageMeta({ templateType, recipientName, senderName, shareId }: SharePageSeo): Metadata {
  const info = TEMPLATE_TYPE_INFO[templateType] ?? { emoji: "🎁", label: "Gift" };

  // A link preview can surface on a shared family phone; for these templates
  // it names nothing about what is inside.
  const neutral = NEUTRAL_PREVIEW.has(templateType);
  const teaser = TEASER_PREVIEW[templateType]?.(recipientName, senderName);
  const title = neutral ? "A little something for you 💌" : teaser ? teaser.title : `${info.emoji} ${info.label} for ${recipientName} from ${senderName}`;
  const description = neutral
    ? `${senderName} made you something. Open it when you have a quiet minute ✨`
    : teaser
      ? teaser.description
      : `${senderName} created a special ${info.label.toLowerCase()} surprise for ${recipientName}. Open to see the magic! ✨`;

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
    // A share page is one person's message to one person: real names, thin
    // templated body, often password-gated. Indexing them puts private-ish
    // near-duplicates in front of the whole web and drags down sitewide quality
    // signals. `follow` stays on so link equity still flows back to the
    // template pages we DO want ranked. OG/Twitter tags are unaffected, so
    // WhatsApp/iMessage previews keep working exactly as before.
    robots: {
      index: false,
      follow: true,
      googleBot: { index: false, follow: true },
    },
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
