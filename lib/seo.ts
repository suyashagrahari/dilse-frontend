import type { Metadata } from "next";
import { TEMPLATE_DATA } from "@/lib/seo-data";
export type { TemplateData, HowToData, ReviewData, AggregateRatingData } from "@/lib/seo-data";

export const SITE_NAME = "SubhSandesh";
export const SITE_TAGLINE = "Make Every Moment Special";
export const SITE_DESCRIPTION =
  "SubhSandesh is a celebration studio used worldwide: create personalized pages for weddings, birthdays, anniversaries, Valentine's Day and festivals, with photos, music and RSVPs, and share them with one link in any country.";
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
  "birthday-premium":     { emoji: "📖", label: "Birthday storybook" },
  "miss-you":             { emoji: "🥹", label: "Miss You page" },
  "miss-you-premium":     { emoji: "🩵", label: "Miss You page" },
  "will-you-be-mine":     { emoji: "💍", label: "Proposal page" },
  "sorry-premium":        { emoji: "🌦️", label: "Sorry page ✦" },
  "proposal-premium":     { emoji: "💍", label: "Proposal" },
  "happy-anniversary":    { emoji: "🖼️", label: "Anniversary page" },
  "anniversary-premium":  { emoji: "💞", label: "Anniversary book" },
  "digital-bouquet":      { emoji: "💐", label: "Digital bouquet" },
  "wedding-invitation":   { emoji: "💌", label: "Wedding invitation" },
  "wedding-invitation-premium": { emoji: "💍", label: "Wedding website" },
  "royal-wedding-invitation": { emoji: "👑", label: "Royal wedding invitation" },
  "palace-door-wedding-invitation": { emoji: "🚪", label: "Palace door wedding invitation" },
  "garden-wedding-invitation": { emoji: "🦚", label: "Garden wedding invitation" },
  "floral-wedding-invitation": { emoji: "🌸", label: "Floral wedding invitation" },
  "sikh-wedding-invitation": { emoji: "🌼", label: "Anand Karaj wedding invitation" },
  "muslim-wedding-invitation": { emoji: "🌙", label: "Nikah wedding invitation" },
  "christian-wedding-invitation": { emoji: "🕊️", label: "Holy Matrimony wedding invitation" },
  "tamil-wedding-invitation": { emoji: "🪔", label: "Tamil Kalyanam wedding invitation" },
  "telugu-wedding-invitation": { emoji: "🌺", label: "Telugu Pelli wedding invitation" },
  "kannada-wedding-invitation": { emoji: "🌸", label: "Kannada Maduve wedding invitation" },
  "malayalam-wedding-invitation": { emoji: "🪷", label: "Kerala Kalyanam wedding invitation" },
  "marathi-wedding-invitation": { emoji: "🦚", label: "Shubh Vivah wedding invitation" },
  "lotus-wedding-invitation": { emoji: "🪷", label: "Lotus wedding invitation" },
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
  "birthday-premium": (r, s) => ({
    title: `📖 ${r}, someone made you a birthday storybook`,
    description: `${s} wrote a little book about you. Peel it open and make a wish 🌼`,
  }),
  "happy-birthday": (r, s) => ({
    title: `🎂 ${r}, someone made you a birthday surprise`,
    description: `${s} wrapped something up for you. Untie the ribbon and make a wish 🎈`,
  }),
  "miss-you-premium": (r, s) => ({
    title: `🩵 ${r}, two dots on a map… one of them is you`,
    description: `${s} planned you a whole day from far away: a radio, a picnic, the stars and a sunrise where the distance runs down to 0 🩵`,
  }),
  "miss-you": (r, s) => ({
    title: `🥹 ${r}, someone misses you a lot`,
    description: `${s} is calling from far away… pick up, there's a map, a countdown and a boarding pass inside 💗`,
  }),
  sorry: (r, s) => ({
    title: `🥺 ${r}, someone is very, very sorry`,
    description: `${s} made you something. Please open it before you stay mad 💗`,
  }),
  "proposal-premium": (r, s) => ({
    title: `💌 ${r}, you're invited`,
    description: `${s} made you a little garden at golden hour, and there's a very big question at the end 💍`,
  }),
  "will-you-be-mine": (r, s) => ({
    title: `💍 ${r}, someone has a question for you`,
    description: `${s} made you something. Open it when you're smiling 💗`,
  }),
  "sorry-premium": (r, s) => ({
    title: `🌧️ ${r}, someone is at your door in the rain`,
    description: `${s} is very sorry. Open the door… the sky might clear 🌈`,
  }),
  "happy-anniversary": (r, s) => ({
    title: `🖼️ ${r}, you're invited to a tiny museum about us`,
    description: `${s} built you something for your anniversary. Tear your ticket and walk in 💗`,
  }),
  "anniversary-premium": (r, s) => ({
    title: `📖 ${r}, happy anniversary. ${s} wrote you a book`,
    description: `Every year of you two, in one little storybook. Open it somewhere quiet 💗`,
  }),
  // A wedding page has no guest name: recipient = the bride, sender = the groom.
  "wedding-invitation": (r, s) => ({
    title: `💌 You're invited to ${r} & ${s}'s wedding`,
    description: `Tap the seal to open your invitation. Date, venue and RSVP inside ✨`,
  }),
  "digital-bouquet": (r, s) => ({
    title: `💐 ${r}, a bouquet just arrived for you`,
    description: `${s} picked every flower by hand. Unwrap it and tap each one — they never wilt 🌷`,
  }),
  "wedding-invitation-premium": (r, s) => ({
    title: `💍 ${r}, ${s} would love you at every function`,
    description: `Haldi to Reception, our story and every detail are inside. Open it and RSVP 🌸`,
  }),
  // r = the bride, s = the groom (the wedding pages' engine mapping).
  "royal-wedding-invitation": (r, s) => ({
    title: `👑 The palace gates are open: ${r} & ${s}'s wedding`,
    description: `A royal invitation awaits. Turn up the sound and step inside ✨`,
  }),
  "palace-door-wedding-invitation": (r, s) => ({
    title: `🚪 The palace doors are opening: ${r} & ${s}'s wedding`,
    description: `Step through carved doors into every function. Sound on ✨`,
  }),
  "garden-wedding-invitation": (r, s) => ({
    title: `🦚 You're invited to a garden wedding: ${r} & ${s}`,
    description: `Pink gazebos, a peacock and every function inside. Sound on 🌸`,
  }),
  "floral-wedding-invitation": (r, s) => ({
    title: `🌸 ${r} & ${s} are getting married`,
    description: `Pampas, peonies and every function, all on one page. Open it 🤍`,
  }),
  "sikh-wedding-invitation": (r, s) => ({
    title: `🌼 ${r} & ${s}'s Anand Karaj: you're invited`,
    description: `Ik Onkar in gold, the four Laavan and every function inside. Open it 🤍`,
  }),
  "muslim-wedding-invitation": (r, s) => ({
    title: `🌙 ${r} & ${s}'s Nikah: you're invited`,
    description: `The Bismillah in gold, the Nikah and the Walima, all on one page. Open it 🤍`,
  }),
  "christian-wedding-invitation": (r, s) => ({
    title: `🕊️ ${r} & ${s} request the honour of your presence`,
    description: `Their Holy Matrimony, the reception and every detail inside. Open it 🤍`,
  }),
  "tamil-wedding-invitation": (r, s) => ({
    title: `🪔 ${r} & ${s}'s Tamil Kalyanam: you're invited`,
    description: `English and Tamil, every function with maps and RSVP. Open it 🤍`,
  }),
  "telugu-wedding-invitation": (r, s) => ({
    title: `🌺 ${r} & ${s}'s Telugu Pelli: you're invited`,
    description: `English and Telugu, every function with maps and RSVP. Open it 🤍`,
  }),
  "kannada-wedding-invitation": (r, s) => ({
    title: `🌸 ${r} & ${s}'s Kannada Maduve: you're invited`,
    description: `English and Kannada, every function with maps and RSVP. Open it 🤍`,
  }),
  "malayalam-wedding-invitation": (r, s) => ({
    title: `🪷 ${r} & ${s}'s Kerala Kalyanam: you're invited`,
    description: `English and Malayalam, every function with maps and RSVP. Open it 🤍`,
  }),
  "marathi-wedding-invitation": (r, s) => ({
    title: `🦚 ${r} & ${s}'s Shubh Vivah: you're invited`,
    description: `English and Marathi, every function with maps and RSVP. Open it 🤍`,
  }),
  "lotus-wedding-invitation": (r, s) => ({
    title: `🪷 The lamps are lit: ${r} & ${s}'s wedding`,
    description: `A temple wedding invitation with every function inside. Open it 🙏`,
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
  /** The link's username part (username links only). */
  username?: string;
}

/** Templates whose link preview is drawn from the page itself (the sender's own arrangement). */
const PAGE_DRAWN_PREVIEW: Record<string, string> = { "digital-bouquet": "/api/og-bouquet" };

export function getSharePageMeta({ templateType, recipientName, senderName, shareId, username }: SharePageSeo): Metadata {
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

  const drawn = PAGE_DRAWN_PREVIEW[templateType];
  const cover = drawn ? undefined : TEMPLATE_COVER_IMAGES[templateType];
  const ogImageUrl = drawn
    ? `${SITE_URL}${drawn}?id=${encodeURIComponent(shareId)}${username ? `&u=${encodeURIComponent(username)}` : ""}`
    : cover
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
