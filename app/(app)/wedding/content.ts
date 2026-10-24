// ─── /wedding — the words and the catalogue rules ────────────────────────────
//
// Kept apart from the client page so the server shell can write the same FAQ
// into FAQPage JSON-LD that the page prints, and so the "which templates are
// wedding templates" rule lives in one place.
//
// The page is written for someone who has never been to an Indian wedding as
// much as for a family in Jaipur: every function gets a one-line explanation,
// and nothing here claims a number, a review or a customer we cannot show.

import type { TemplateListItem } from "@/types/template-config";

/** A wedding template is anything typed or filed as one — so a new wedding design shows up here without an edit. */
export function isWeddingTemplate(t: Pick<TemplateListItem, "type" | "category" | "slug">): boolean {
  return (
    t.category === "wedding" ||
    t.type === "wedding" ||
    t.type.includes("wedding") ||
    /(^|-)(wedding|shaadi|vivah|reception|marriage|engagement|sangeet|mehndi|haldi)(-|$)/.test(t.slug)
  );
}

export type WeddingFilter = "all" | "indian" | "christian" | "reception" | "court" | "rishta";

export const WEDDING_FILTERS: { id: WeddingFilter; label: string; emoji: string }[] = [
  { id: "all", label: "All designs", emoji: "✨" },
  { id: "indian", label: "Hindu & Indian", emoji: "🪔" },
  { id: "christian", label: "Christian", emoji: "⛪" },
  { id: "reception", label: "Reception", emoji: "🥂" },
  { id: "court", label: "Court marriage", emoji: "📜" },
  { id: "rishta", label: "Kundli & rishta", emoji: "🔮" },
];

/** Where each known slug files. Anything not listed is an Indian wedding invitation. */
const FILTER_OF: Record<string, WeddingFilter> = {
  "christian-wedding": "christian",
  "christian-wedding-2": "christian",
  reception: "reception",
  "court-marriage": "court",
  "kundli-milan": "rishta",
};

export const filterOf = (slug: string): WeddingFilter => FILTER_OF[slug] ?? "indian";

/**
 * Page-weight art for the hub, cut down from the owner's originals in
 * public/wedding-v3 (sizes chosen for the box each piece is drawn in). Served
 * from the app itself — never the CDN.
 */
export const LUX = "/wedding-v3/hub/lux";

// ── the journey ──────────────────────────────────────────────────────────────

/** One prop in a journey scene, placed in % of the scene box (x/y = top-left, width = % of the box). */
export type Prop = { src: string; w: number; h: number; x: number; y: number; width: number; z?: number; flip?: boolean; cls?: "sway" | "march" | "fire" | "float" };

export type JourneyStep = {
  id: string;
  name: string;
  hindi: string;
  /** One line for someone who has never been to an Indian wedding. */
  line: string;
  /** The guest's-eye detail: what to wear, what happens. */
  tip: string;
  tint: string;
  deep: string;
  couple?: { src: string; w: number; h: number; alt: string };
  props: Prop[];
  /** The design that suits this function; falls back to the collection if it is hidden for this visitor. */
  slug: string;
  cta: string;
};

export const JOURNEY: JourneyStep[] = [
  {
    id: "roka", name: "Roka & Engagement", hindi: "रोका · सगाई",
    line: "The two families formally say yes. Rings are exchanged, sweets are shared, and the countdown begins.",
    tip: "Often an intimate evening at home, and the first invitation many couples send.",
    tint: "#f9e7ee", deep: "#a8395f",
    couple: { src: `${LUX}/c-engagement-600.webp`, w: 376, h: 600, alt: "Illustrated couple at their engagement, the bride in an ivory lehenga" },
    props: [
      { src: `${LUX}/string-lights-900.webp`, w: 900, h: 519, x: 0, y: -4, width: 100, z: 1 },
      { src: `${LUX}/rose-bouquet-360.webp`, w: 360, h: 309, x: -8, y: 72, width: 44, z: 4 },
      { src: `${LUX}/beige-peony-300.webp`, w: 300, h: 300, x: 70, y: 72, width: 38, z: 4 },
    ],
    slug: "floral-wedding-invitation", cta: "A soft floral invite",
  },
  {
    id: "haldi", name: "Haldi", hindi: "हल्दी",
    line: "Friends and family smear the couple with turmeric paste for luck and a bridal glow. Everyone wears yellow, and everyone gets messy.",
    tip: "Morning, outdoors, marigolds everywhere. Wear something you don't mind turning yellow.",
    tint: "#fcf0c4", deep: "#9a6a06",
    couple: { src: `${LUX}/c-haldi-600.webp`, w: 350, h: 600, alt: "Illustrated couple dressed in yellow for the Haldi" },
    props: [
      { src: `${LUX}/op-shaadi-toran-marigold.webp`, w: 520, h: 193, x: -4, y: -3, width: 108, z: 1 },
      { src: `${LUX}/marigold-pots-260.webp`, w: 144, h: 260, x: 1, y: 58, width: 22, z: 4 },
      { src: `${LUX}/marigold-pots-260.webp`, w: 144, h: 260, x: 77, y: 58, width: 22, z: 4, flip: true },
    ],
    slug: "wedding-invitation-premium", cta: "Every function on one link",
  },
  {
    id: "mehndi", name: "Mehndi", hindi: "मेहंदी",
    line: "Intricate henna is painted on the bride's hands and feet. They say the darker the stain, the deeper the love.",
    tip: "An afternoon of music, snacks and henna artists. Guests often get a little design too.",
    tint: "#fde3cf", deep: "#b4501a",
    couple: { src: `${LUX}/c-mehndi-600.webp`, w: 436, h: 600, alt: "Illustrated couple at the Mehndi, the bride in an orange saree" },
    props: [
      { src: `${LUX}/peacock-360.webp`, w: 360, h: 410, x: 68, y: 24, width: 38, z: 2 },
      { src: `${LUX}/hands-mehndi-640.webp`, w: 640, h: 298, x: 4, y: 76, width: 92, z: 5, cls: "float" },
    ],
    slug: "garden-wedding-invitation", cta: "A Mughal-garden invite",
  },
  {
    id: "sangeet", name: "Sangeet", hindi: "संगीत",
    line: "A night of music and dance. Both families rehearse for weeks to out-perform each other on stage.",
    tip: "Part concert, part dance-off, all party. Bring your best moves.",
    tint: "#e6eef9", deep: "#34509c",
    couple: { src: `${LUX}/c-sangeet-600.webp`, w: 561, h: 600, alt: "Illustrated couple dancing at their Sangeet" },
    props: [
      { src: `${LUX}/lanterns-360.webp`, w: 360, h: 360, x: -4, y: -6, width: 34, z: 1, cls: "sway" },
      { src: `${LUX}/lantern-blossom-240.webp`, w: 240, h: 410, x: 78, y: -6, width: 22, z: 1, cls: "sway" },
    ],
    slug: "wedding-invitation-premium", cta: "Sangeet to vidaai, one invite",
  },
  {
    id: "baraat", name: "Baraat", hindi: "बारात",
    line: "The groom arrives in a joyful street procession with a brass band, on a horse, in a vintage car or even on an elephant.",
    tip: "The groom's side dances all the way to the venue, and anyone can join in.",
    tint: "#fbe4d4", deep: "#9c3218",
    props: [
      { src: `${LUX}/chhatri-300.webp`, w: 206, h: 300, x: 6, y: 2, width: 30, z: 1, cls: "sway" },
      { src: `${LUX}/chhatri-300.webp`, w: 206, h: 300, x: 64, y: 0, width: 30, z: 1, cls: "sway", flip: true },
      { src: `${LUX}/elephant-l-420.webp`, w: 420, h: 355, x: 17, y: 46, width: 66, z: 3, cls: "march" },
      { src: `${LUX}/umbrella-guard-300.webp`, w: 128, h: 300, x: 1, y: 52, width: 20, z: 4, cls: "march" },
      { src: `${LUX}/umbrella-guard-300.webp`, w: 128, h: 300, x: 79, y: 52, width: 20, z: 4, flip: true, cls: "march" },
    ],
    slug: "royal-wedding-invitation", cta: "Royal gates & elephants",
  },
  {
    id: "pheras", name: "Pheras", hindi: "फेरे",
    line: "The wedding itself: around a sacred fire the couple walk seven rounds, each one a promise for their life together.",
    tip: "Usually under a flower-decked mandap, with mantras, a priest and the whole family close by.",
    tint: "#fbe0df", deep: "#8e1a27",
    couple: { src: `${LUX}/c-wedding-600.webp`, w: 334, h: 600, alt: "Illustrated bride in a red lehenga and groom for the Pheras" },
    props: [
      { src: `${LUX}/floral-arch-900.webp`, w: 900, h: 668, x: -6, y: -8, width: 112, z: 1 },
      { src: `${LUX}/havan-360.webp`, w: 360, h: 364, x: 35, y: 72, width: 30, z: 5, cls: "fire" },
    ],
    slug: "palace-door-wedding-invitation", cta: "Palace doors that open",
  },
  {
    id: "reception", name: "Reception", hindi: "रिसेप्शन",
    line: "The newly-weds are welcomed with dinner, toasts and a first dance. It is often the party friends fly in from abroad for.",
    tip: "Evening wear, a long buffet and the couple greeting every guest on stage.",
    tint: "#eae8f6", deep: "#463686",
    couple: { src: `${LUX}/c-reception-600.webp`, w: 453, h: 600, alt: "Illustrated couple at their reception in a tuxedo and gown" },
    props: [
      { src: `${LUX}/string-lights-900.webp`, w: 900, h: 519, x: 0, y: -6, width: 100, z: 1 },
      { src: `${LUX}/rose-bouquet-360.webp`, w: 360, h: 309, x: 62, y: 72, width: 42, z: 4, flip: true },
    ],
    slug: "reception", cta: "A reception invite",
  },
];

// ── the world ────────────────────────────────────────────────────────────────

/** Map points in a 1000 × 480 box: a loose longitude/latitude layout, not a survey map. */
export const ORIGIN = { name: "Jaipur", tz: "Asia/Kolkata", x: 703, y: 176 };

export const CITIES: { name: string; tz: string; x: number; y: number; side: "t" | "b" }[] = [
  { name: "San Francisco", tz: "America/Los_Angeles", x: 62, y: 150, side: "b" },
  { name: "Toronto", tz: "America/Toronto", x: 196, y: 96, side: "t" },
  { name: "New York", tz: "America/New_York", x: 222, y: 142, side: "b" },
  { name: "London", tz: "Europe/London", x: 446, y: 74, side: "t" },
  { name: "Rome", tz: "Europe/Rome", x: 500, y: 124, side: "b" },
  { name: "Dubai", tz: "Asia/Dubai", x: 618, y: 210, side: "b" },
  { name: "Singapore", tz: "Asia/Singapore", x: 792, y: 292, side: "b" },
  { name: "Sydney", tz: "Australia/Sydney", x: 930, y: 418, side: "t" },
];

export const WORLD_POINTS: { icon: "link" | "currency" | "lang" | "clock" | "faith"; title: string; text: string }[] = [
  { icon: "link", title: "One link reaches everyone", text: "Send it on WhatsApp, iMessage, email or Instagram, or print the QR on a paper card for the elders." },
  { icon: "currency", title: "Prices in your currency", text: "Rupees in India, US dollars everywhere else, worked out from where you are browsing." },
  { icon: "clock", title: "A countdown that is right everywhere", text: "It runs to the same moment for every guest, whether they open it in Toronto or in Sydney." },
  { icon: "lang", title: "Hindi & English, side by side", text: "Names, shlokas and blessings in Devanagari for Dadi, English for the friends who fly in." },
  { icon: "faith", title: "For every couple", text: "Hindu, Christian, reception and court-marriage designs, and any couple of any faith can use any of them." },
];

// ── how it works + features ─────────────────────────────────────────────────

export const STEPS: { n: string; title: string; text: string }[] = [
  { n: "1", title: "Pick a design", text: "Palace doors, a lotus temple, a Mughal garden or a Christian chapel. Choose the opening your guests see first." },
  { n: "2", title: "AI fills it in", text: "Answer a few questions (names, date, city, your story) and AI writes the whole invitation. You review and edit every line." },
  { n: "3", title: "Share one link", text: "One link for every function. Drop it in the family WhatsApp group, email it abroad, or print the QR on the card." },
  { n: "4", title: "Track RSVPs", text: "Guests reply per function in a tap. You see who is coming, and with how many, without chasing a single message." },
];

export const FEATURES: { icon: string; title: string; text: string }[] = [
  { icon: "rsvp", title: "RSVP per function", text: "Guests confirm the Haldi, the Sangeet and the Pheras separately, so every headcount is sorted." },
  { icon: "music", title: "Your song plays", text: "Shehnai, a Bollywood favourite or your own track starts the moment the doors open." },
  { icon: "gallery", title: "Photo gallery", text: "Pre-wedding shoots and family photos in an elegant, swipeable gallery." },
  { icon: "lang", title: "Hindi & English", text: "Shlokas, names and blessings in Devanagari, set in a matching serif." },
  { icon: "qr", title: "QR for the printed card", text: "Put a QR on the paper invite so the elders can open the digital one too." },
  { icon: "map", title: "Venue & countdown", text: "A live countdown to the muhurat and one-tap directions to every venue." },
];

// ── FAQ (also written into FAQPage JSON-LD by page.tsx) ─────────────────────

export const WEDDING_FAQS: { q: string; a: string }[] = [
  {
    q: "How do I make a digital Indian wedding invitation online?",
    a: "Pick a wedding design on SubhSandesh, answer a few questions (or let AI fill the form from them), add your photos, functions and venues, then publish. You get one link, and a QR code, to share on WhatsApp, email, Instagram or a printed card.",
  },
  {
    q: "What happens at an Indian wedding, and which functions can the invitation cover?",
    a: "A Hindu or Indian wedding is usually several celebrations over a few days: the Roka or engagement, the Haldi (turmeric ceremony), the Mehndi (henna), the Sangeet (a night of music and dance), the Baraat (the groom's procession), the Pheras (seven rounds of the sacred fire, the wedding itself) and the reception. The premium designs hold every function on one link, each with its own date, time, venue, dress code and map.",
  },
  {
    q: "Is this a wedding website with RSVP?",
    a: "Yes. Each invitation is a small wedding website on one link: your story, the functions, venues with maps, a photo gallery, music and an RSVP form. Guests can say yes to the Sangeet and the Pheras separately, with a headcount, and you see every reply in one place.",
  },
  {
    q: "Can I send a WhatsApp wedding invitation to family abroad?",
    a: "Yes. The invitation is a link, so it opens in WhatsApp's own browser, Safari or Chrome on any phone in any country. NRI families can send the same link to relatives in India and to friends in the US, UK, Canada, the UAE, Australia or Europe.",
  },
  {
    q: "Do you have Christian wedding invitations, and can mixed-faith couples use the designs?",
    a: "Yes. There are Christian wedding invitations for a church ceremony, a reception design and a court marriage card for a registered marriage. Every design can be used by any couple, of any faith or none: you write the wording, the ceremonies and the names.",
  },
  {
    q: "Can the invitation be in Hindi?",
    a: "Yes. You can write names, shlokas and blessings in Hindi (Devanagari) as well as English; the designs set Hindi in a matching serif so it looks as good as the English.",
  },
  {
    q: "What currency are the prices in?",
    a: "Prices are shown in Indian rupees for visitors in India and in US dollars for visitors outside India, based on where you are browsing from.",
  },
  {
    q: "Will the countdown be right for guests in other time zones?",
    a: "Yes. The countdown runs to the exact moment of your function, so a guest in London and a guest in Mumbai see the same time remaining.",
  },
  {
    q: "Will the invitation work on every phone?",
    a: "Yes. Every design is built phone-first and opens instantly in WhatsApp's browser, Chrome and Safari, and it scales up properly on tablets and laptops.",
  },
  {
    q: "Can I edit the invitation after sharing it?",
    a: "Yes. Open it from your profile, change the date, venue, photos or wording, and publish again. The link stays the same, so there is nothing to re-send.",
  },
];
