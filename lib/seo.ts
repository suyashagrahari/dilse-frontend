import type { Metadata } from "next";

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

interface TemplateSeo {
  title: string;
  description: string;
  keywords: string[];
  category: string;
  emoji: string;
}

export const TEMPLATE_SEO: Record<string, TemplateSeo> = {
  "birthday-gf": {
    title: "Birthday Gift for Girlfriend | Create Personalized Birthday Page",
    description:
      "Surprise your girlfriend with a beautiful, personalized birthday page. Add messages, photos, music, and share with a unique link.",
    keywords: ["birthday gift", "girlfriend birthday", "personalized birthday page", "romantic birthday surprise"],
    category: "Birthday",
    emoji: "🎂",
  },
  "birthday-bestfriend": {
    title: "Birthday Gift for Best Friend | Personalized Birthday Page",
    description:
      "Create an amazing birthday page for your best friend. Add wishes, photos, and memories to make their day unforgettable.",
    keywords: ["birthday gift", "best friend birthday", "personalized birthday", "friendship gift"],
    category: "Birthday",
    emoji: "🎂",
  },
  "birthday-friend": {
    title: "Birthday Gift for Friend | Custom Birthday Page",
    description:
      "Make your friend's birthday extra special with a custom birthday page filled with wishes and memories.",
    keywords: ["birthday gift", "friend birthday", "custom birthday page"],
    category: "Birthday",
    emoji: "🎂",
  },
  "birthday-parents": {
    title: "Birthday Gift for Parents | Heartfelt Birthday Page",
    description:
      "Express your love for your parents with a heartfelt personalized birthday page. Perfect for Mom & Dad.",
    keywords: ["birthday gift parents", "mom birthday", "dad birthday", "parents birthday surprise"],
    category: "Birthday",
    emoji: "🎂",
  },
  "valentine-gf": {
    title: "Valentine's Day Gift for Girlfriend | Romantic Valentine Page",
    description:
      "Create a romantic Valentine's Day page for your girlfriend. Express your love with personalized messages and surprises.",
    keywords: ["valentine gift", "girlfriend valentine", "romantic valentine", "valentine surprise"],
    category: "Valentine",
    emoji: "💝",
  },
  "valentine-bestfriend": {
    title: "Valentine's Day Gift for Best Friend | Friendship Valentine",
    description:
      "Celebrate your friendship this Valentine's Day with a personalized page for your best friend.",
    keywords: ["valentine bestfriend", "friendship valentine", "galentine"],
    category: "Valentine",
    emoji: "💝",
  },
  "anniversary-gf": {
    title: "Anniversary Gift for Girlfriend | Personalized Anniversary Page",
    description:
      "Celebrate your love story with a beautiful, personalized anniversary page for your girlfriend.",
    keywords: ["anniversary gift", "girlfriend anniversary", "romantic anniversary", "love anniversary"],
    category: "Anniversary",
    emoji: "💍",
  },
  "anniversary-parents": {
    title: "Anniversary Gift for Parents | Celebrate Their Love Story",
    description:
      "Honor your parents' love with a beautiful anniversary page filled with memories and heartfelt wishes.",
    keywords: ["parents anniversary", "anniversary gift parents", "marriage anniversary"],
    category: "Anniversary",
    emoji: "💍",
  },
  "missyou-gf": {
    title: "Miss You Gift for Girlfriend | Let Her Know You Care",
    description:
      "Missing your girlfriend? Create a heartfelt page to let her know you're thinking about her.",
    keywords: ["miss you gift", "long distance relationship", "missing girlfriend"],
    category: "Miss You",
    emoji: "💭",
  },
  "missyou-bestfriend": {
    title: "Miss You Gift for Best Friend | Friendship Matters",
    description:
      "Let your best friend know you miss them with a personalized page full of shared memories.",
    keywords: ["miss you bestfriend", "missing friend", "friendship gift"],
    category: "Miss You",
    emoji: "💭",
  },
  "sorry-gf": {
    title: "Apology Gift for Girlfriend | Say Sorry Beautifully",
    description:
      "Make a heartfelt apology to your girlfriend with a beautiful, personalized sorry page.",
    keywords: ["apology gift", "sorry girlfriend", "make up gift", "apology page"],
    category: "Sorry",
    emoji: "🥺",
  },
  "sorry-friend": {
    title: "Apology Gift for Friend | Mend Your Friendship",
    description:
      "Apologize to your friend with a thoughtful, personalized sorry page to mend your bond.",
    keywords: ["sorry friend", "apology friend", "friendship apology"],
    category: "Sorry",
    emoji: "🥺",
  },
  "love-gf": {
    title: "Love Page for Girlfriend | Share Your Love Anytime",
    description:
      "Create a beautiful, romantic love page for your girlfriend with games, gallery & music. Share anytime to express your love.",
    keywords: ["love gift", "girlfriend love", "romantic love page", "i love you gift", "love letter online"],
    category: "Love",
    emoji: "💕",
  },
  "darling": {
    title: "Darling — A Velvet Night Love Page | Romantic Gift",
    description:
      "Create a stunning dark-themed love page for your darling with games, gallery, music & secret notes. A romantic gift to share anytime.",
    keywords: ["darling love page", "romantic gift", "love page dark theme", "girlfriend gift", "love letter online"],
    category: "Love",
    emoji: "🌹",
  },
  "wedding-shaadi": {
    title: "Royal Indian Wedding Invitation | Digital Shaadi Card",
    description:
      "Create a stunning digital wedding invitation with RSVP, events timeline, photo gallery & blessings wall. Share your shaadi card instantly.",
    keywords: [
      "wedding invitation",
      "shaadi card",
      "indian wedding",
      "digital wedding card",
      "wedding RSVP",
      "marriage invitation online",
    ],
    category: "Wedding",
    emoji: "💍",
  },
};

export function getTemplateMeta(slug: string): Metadata {
  const tpl = TEMPLATE_SEO[slug];
  if (!tpl) {
    return buildMeta();
  }
  return buildMeta({
    title: `${tpl.title} | ${SITE_NAME}`,
    description: tpl.description,
    keywords: tpl.keywords,
    openGraph: {
      title: `${tpl.emoji} ${tpl.title}`,
      description: tpl.description,
    },
  });
}

// Maps templateType (as returned by the API) → metadata
const TEMPLATE_TYPE_INFO: Record<string, { emoji: string; label: string }> = {
  birthday:    { emoji: "🎂", label: "Birthday" },
  "birthday-gf": { emoji: "🎂", label: "Birthday" },
  valentine:   { emoji: "💝", label: "Valentine's" },
  anniversary: { emoji: "💍", label: "Anniversary" },
  wedding:     { emoji: "💍", label: "Wedding" },
  reception:   { emoji: "🎊", label: "Reception" },
  eid:         { emoji: "🌙", label: "Eid Mubarak" },
  holi:        { emoji: "🌈", label: "Holi" },
  missyou:     { emoji: "💭", label: "Miss You" },
  sorry:       { emoji: "🥺", label: "Sorry" },
  love:        { emoji: "💕", label: "Love" },
  shaadi:      { emoji: "💍", label: "Wedding" },
  gift:        { emoji: "🎁", label: "Gift" },
};

// Maps templateType → local cover image path (must match /public assets)
const TEMPLATE_COVER_IMAGES: Record<string, string> = {
  "birthday-gf": "/assets/Birthday1/birthdaytemplate1.png",
  wedding:        "/assets/marriage/weeding.png",
  reception:      "/assets/Reception/reception.png",
  eid:            "/assets/Eid/hero_eid.jpeg",
  holi:           "/assets/Holi/hero_holi.png",
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

  // Use the template's real cover image when available — shows the actual design in link previews.
  // Fall back to the dynamically generated /api/og gradient card.
  const coverPath = TEMPLATE_COVER_IMAGES[templateType];
  const ogImageUrl = coverPath
    ? `${SITE_URL}${coverPath}`
    : `${SITE_URL}/api/og?type=${encodeURIComponent(templateType)}&recipient=${encodeURIComponent(recipientName)}&sender=${encodeURIComponent(senderName)}`;

  // Portrait templates (birthday-gf) use their real image dimensions
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
