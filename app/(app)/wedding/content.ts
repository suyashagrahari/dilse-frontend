// ─── /wedding — the words and the catalogue rules ────────────────────────────
//
// Kept apart from the client page so the server shell can write the same FAQ
// into FAQPage JSON-LD that the page prints, and so the "which templates are
// wedding templates" rule lives in one place.

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
 * The cinematic openings, for the featured strip: what happens the moment a
 * guest taps the link. Only templates listed here are featured; the strip
 * follows the gallery's order and drops whatever this visitor cannot see.
 */
export const OPENINGS: Record<string, { opening: string; line: string }> = {
  "palace-door-wedding-invitation": { opening: "Palace doors", line: "Carved Rajasthani doors swing open on your shaadi" },
  "garden-wedding-invitation": { opening: "Mughal garden", line: "Gazebos, peacocks and a garden walk through every function" },
  "floral-wedding-invitation": { opening: "Pampas & peony", line: "Soft boho florals drift apart to reveal the couple" },
  "lotus-wedding-invitation": { opening: "Lotus temple", line: "A lotus pond, a gopuram and brass lamps that glow on" },
  "royal-wedding-invitation": { opening: "Royal gates", line: "Palace gates, eight functions and a blessings wall" },
  "wedding-invitation-premium": { opening: "Every function", line: "Haldi to reception, the story and RSVPs on one link" },
  "wedding-invitation": { opening: "Wax seal", line: "An envelope that breaks its seal and unfolds the invite" },
};

/** The couple through the functions — the hero's art and the "every function" strip. */
export const FUNCTIONS: { id: string; name: string; hindi: string; img: string; w: number; h: number; tint: string }[] = [
  { id: "engagement", name: "Engagement", hindi: "सगाई", img: "/wedding-v3/template14-couple-haldi-mehndi/06-couple-engagement-ivory-lehenga.webp", w: 502, h: 800, tint: "#f6e9ef" },
  { id: "haldi", name: "Haldi", hindi: "हल्दी", img: "/wedding-v3/template14-couple-haldi-mehndi/07-couple-haldi-yellow.webp", w: 466, h: 800, tint: "#fbf0c9" },
  { id: "mehndi", name: "Mehndi", hindi: "मेहंदी", img: "/wedding-v3/template14-couple-haldi-mehndi/05-couple-mehndi-orange-saree.webp", w: 581, h: 800, tint: "#fde3cf" },
  { id: "sangeet", name: "Sangeet", hindi: "संगीत", img: "/wedding-v3/template14-couple-haldi-mehndi/03-couple-sangeet-dancing.webp", w: 748, h: 800, tint: "#e3f0e4" },
  { id: "wedding", name: "Pheras", hindi: "विवाह", img: "/wedding-v3/template14-couple-haldi-mehndi/08-couple-wedding-red-lehenga.webp", w: 446, h: 800, tint: "#fbe1e0" },
  { id: "reception", name: "Reception", hindi: "रिसेप्शन", img: "/wedding-v3/template14-couple-haldi-mehndi/04-couple-reception-tux-gown.webp", w: 604, h: 800, tint: "#e5e9f6" },
];

export const STEPS: { n: string; title: string; text: string }[] = [
  { n: "1", title: "Pick a design", text: "Palace doors, a lotus temple, a Mughal garden or a Christian chapel — choose the opening your guests will see first." },
  { n: "2", title: "Personalise with AI", text: "Answer a few questions — names, date, city, your story — and AI fills the whole invitation. Review and edit every line." },
  { n: "3", title: "Share on WhatsApp", text: "One link for every function. Send it to the family group, print the QR on the card, or post it anywhere." },
  { n: "4", title: "Track RSVPs", text: "Guests reply per function in a tap. You see who is coming, with how many, without chasing a single message." },
];

export const FEATURES: { icon: string; title: string; text: string }[] = [
  { icon: "rsvp", title: "RSVP per function", text: "Guests confirm Haldi, Sangeet and the Pheras separately — headcounts sorted." },
  { icon: "music", title: "Your song plays", text: "Shehnai, a filmi favourite or your own track starts the moment the doors open." },
  { icon: "gallery", title: "Photo gallery", text: "Pre-wedding shoots and family photos in an elegant, swipeable gallery." },
  { icon: "lang", title: "Hindi & English", text: "Shlokas, names and blessings in Devanagari, set in a matching serif." },
  { icon: "qr", title: "QR for the printed card", text: "Put a QR on the paper invite so elders can open the digital one too." },
  { icon: "map", title: "Venue & countdown", text: "A live countdown to the muhurat and one-tap directions to every venue." },
];

export const WEDDING_FAQS: { q: string; a: string }[] = [
  {
    q: "How do I make a digital wedding invitation online?",
    a: "Pick a wedding design on SubhSandesh, answer a few questions (or let AI fill the form from them), add your photos, functions and venue, then publish. You get one link — and a QR code — to share on WhatsApp, Instagram or a printed card.",
  },
  {
    q: "Can guests RSVP on the invitation?",
    a: "Yes. The wedding invitation designs collect RSVPs per function, so a guest can say yes to the Sangeet and the Pheras separately, with a headcount. You see every reply in one place.",
  },
  {
    q: "Can I add Haldi, Mehndi, Sangeet and the reception on one invitation?",
    a: "Yes. The premium wedding designs hold every function — each with its own date, time, venue, dress code and map — on one link, so you never send five separate cards.",
  },
  {
    q: "Is there a Christian wedding or court marriage invitation?",
    a: "Yes. There are Christian wedding invitations for a church ceremony, and a court marriage certificate-style card for a registered marriage. Use the filters above the designs to see them.",
  },
  {
    q: "Can the invitation be in Hindi?",
    a: "Yes. You can write names, shlokas and blessings in Hindi (Devanagari) as well as English; the designs set Hindi in a matching serif so it looks as good as the English.",
  },
  {
    q: "Will the invitation work on every phone?",
    a: "Yes. Every design is built phone-first and opens instantly in WhatsApp's browser, Chrome and Safari, and it scales up properly on tablets and laptops for guests abroad.",
  },
  {
    q: "Can I edit the invitation after sharing it?",
    a: "Yes. Open it from your profile, change the date, venue, photos or wording, and publish again — no need to start over.",
  },
];
