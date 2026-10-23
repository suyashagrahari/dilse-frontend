// ─── Reception Night — the data shape (client ⇄ server /reception-pages) ─────
//
// The first block is the ORIGINAL shape: every published page has it, so
// nothing in it is ever renamed, removed or retyped. The second block was
// added with the light ballroom rebuild (2026-10). Those fields are optional
// on the wire (an older page has none of them); `normalizeReception` fills
// them with EMPTY values (never the demo's) so the renderer can rely on them.

export type EditMode = null | "ai" | "ai-card" | "manual" | "preview";

export interface PersonInfo {
  name: string;
  role: string;
  description: string;
  photo: string;
  tags: { emoji: string; label: string }[];
  /** Portrait framing: focal point % and zoom 100–300 (absent on older pages = centred). */
  cropX?: number;
  cropY?: number;
  scale?: number;
}

export interface Wish {
  name: string;
  message: string;
}

/**
 * A gallery photo. `span` is the original field: older pages hold Tailwind
 * classes there ("col-span-2 row-span-2"), new ones "wide" | "tall" | "large".
 */
export interface GalleryImage {
  src: string;
  alt: string;
  span: string;
  category: string;
  caption?: string;
  cropX?: number;
  cropY?: number;
  scale?: number;
  w?: number;
  h?: number;
}

/** One part of the evening. `id` is stable (RSVPs refer to it); event 0 of an older page is "reception". */
export interface ReceptionEvent {
  id: string;
  title: string;
  /** "2027-02-20" */
  date: string;
  /** "19:30" (24h) or "" */
  time: string;
  endTime: string;
  venue: string;
  address: string;
  mapUrl: string;
  dressCode: string;
  dressColor: string;
  note: string;
}

export interface StoryChapter {
  when: string;
  title: string;
  line: string;
  photo: string;
}

export interface Contact {
  name: string;
  relation: string;
  phone: string;
}

export interface Thing {
  head: string;
  text: string;
}

/** `mode: ""` = a page from before music was a choice: it plays the template's own reception track. */
export interface MusicSetting {
  mode: "" | "youtube" | "track" | "off" | "melody";
  youtubeId: string;
  start: number;
}

export type ReceptionTheme = "champagne" | "blush" | "pearl";
export type Lang = "en" | "hi";

export interface ReceptionData {
  // ── The original shape ────────────────────────────────────────────────────
  brideName: string;
  groomName: string;
  /** ISO with offset: "2027-02-20T19:30:00+05:30". Kept in sync with the main event. */
  receptionDate: string;
  venue: string;
  venueAddress: string;
  venueMapQuery: string;
  venueTimings: string;
  tagline: string;
  heroImage: string;
  bride: PersonInfo;
  groom: PersonInfo;
  families: { bride: string; groom: string };
  galleryImages: GalleryImage[];
  wishes: Wish[];
  /** The couple's cover photo (shown in the hero; older pages used it for sharing). */
  sharePhoto?: string;

  // ── Added with the light ballroom rebuild ────────────────────────────────
  events: ReceptionEvent[];
  story: StoryChapter[];
  contacts: Contact[];
  things: Thing[];
  music: MusicSetting;
  theme: ReceptionTheme;
  lang: Lang;
  /** The invitation text (English). Empty = a default line built from the tagline. */
  invitation: string;
  hindiMessage: string;
  blessingsOf: string;
  hashtag: string;
  closingLine: string;
  gettingThere: string;
  videoUrl: string;
  liveUrl: string;
  upiId: string;
  upiName: string;
  /** "2027-02-10" — "Kindly reply by". */
  rsvpBy: string;
  maxGuests: number;
  rsvpMeal: boolean;
}

export const RECEPTION_LIMITS = { events: 4, story: 4, contacts: 4, things: 6, gallery: 24 } as const;

/** The id the one implicit event of an older page carries (the server uses the same). */
export const LEGACY_EVENT_ID = "reception";

export const RECEPTION_THEMES: { id: ReceptionTheme; label: string; blurb: string; swatch: [string, string, string] }[] = [
  { id: "champagne", label: "Champagne", blurb: "Ivory, champagne & antique gold", swatch: ["#FBF4E8", "#E9D3A6", "#B8892E"] },
  { id: "blush", label: "Blush Ballroom", blurb: "Blush pink, rose gold & pearl", swatch: ["#FCF1EF", "#F1C9C6", "#B5727A"] },
  { id: "pearl", label: "Pearl & Gold", blurb: "Pearl white, soft sage & gold", swatch: ["#FBFAF6", "#DCE3DA", "#A88A45"] },
];

/** Songs for the reception, all oEmbed-verified YouTube ids. "Perfect" is the default. */
export const RECEPTION_SONGS = [
  { id: "2Vv-BfVoq4g", title: "Perfect", artist: "Ed Sheeran" },
  { id: "rtOvBOTyX00", title: "A Thousand Years", artist: "Christina Perri" },
  { id: "BddP6PYo2gs", title: "Kesariya", artist: "Arijit Singh" },
  { id: "V7LwfY5U5WI", title: "Ranjha", artist: "B Praak, Jasleen Royal" },
  { id: "jCEdTq3j-0U", title: "Gallan Goodiyaan", artist: "Dil Dhadakne Do" },
  { id: "1LVpuWpRs3I", title: "Din Shagna Da", artist: "Jasleen Royal" },
  { id: "3qpxJEp4Ec4", title: "Kudmayi", artist: "Shahid Mallya" },
  { id: "lwLVJ0E8gN4", title: "Kabira (Encore)", artist: "Arijit Singh, Harshdeep Kaur" },
  { id: "Ptk_1Dc2iPY", title: "Canon in D", artist: "Brooklyn Duo" },
] as const;

export const DEFAULT_SONG: string = RECEPTION_SONGS[0].id;

/** The template's own instrumental (what every page played before music was a choice). */
export const RECEPTION_TRACK = {
  url: "https://cdn.subhsandesh.in/gifts-media/assets/Reception/music/reception.mp3",
  title: "Reception Waltz",
  artist: "instrumental",
  hint: "The template's own soft instrumental",
};

const DEMO_PHOTO = (n: string) => `/wedding-v3/demo/${n}.webp`;
/** Demo portraits: the owner's illustrated couple, cropped to each of them. */
export const DEMO_PORTRAIT = "/wedding-v3/template14-couple-haldi-mehndi/04-couple-reception-tux-gown.webp";

export const DEMO_EVENTS: ReceptionEvent[] = [
  {
    id: LEGACY_EVENT_ID,
    title: "Wedding Reception",
    date: "2027-02-20",
    time: "19:00",
    endTime: "23:00",
    venue: "The Grand Ballroom, Rambagh Palace",
    address: "Bhawani Singh Road, Jaipur, Rajasthan",
    mapUrl: "",
    dressCode: "Black tie & evening gowns",
    dressColor: "#1C1C24",
    note: "The couple makes their grand entry at 7:30 pm. Dinner is served from 8:30 pm.",
  },
  {
    id: "toasts",
    title: "Dinner & Toasts",
    date: "2027-02-20",
    time: "20:30",
    endTime: "22:30",
    venue: "Suvarna Mahal, Rambagh Palace",
    address: "Bhawani Singh Road, Jaipur, Rajasthan",
    mapUrl: "",
    dressCode: "Champagne & ivory",
    dressColor: "#F3EBDD",
    note: "A royal Rajasthani dinner, with a few (short, we promise) toasts from the families.",
  },
  {
    id: "afterparty",
    title: "After-party",
    date: "2027-02-20",
    time: "22:30",
    endTime: "01:00",
    venue: "The Polo Bar Terrace, Rambagh Palace",
    address: "Bhawani Singh Road, Jaipur, Rajasthan",
    mapUrl: "",
    dressCode: "Dance-floor ready",
    dressColor: "#E86A92",
    note: "A live DJ under the stars. Bring your best moves.",
  },
];

export const DEMO_DATA: ReceptionData = {
  brideName: "Priya",
  groomName: "Arjun",
  receptionDate: "2027-02-20T19:00:00+05:30",
  venue: "The Grand Ballroom, Rambagh Palace",
  venueAddress: "Bhawani Singh Road, Jaipur, Rajasthan",
  venueMapQuery: "Rambagh+Palace+Jaipur",
  venueTimings: "7:00 PM — 11:00 PM",
  tagline: "request the pleasure of your company at their wedding reception",
  heroImage: "https://cdn.subhsandesh.in/gifts-media/assets/Reception/reception.webp",
  bride: {
    name: "Priya Sharma",
    role: "The Bride",
    description: "A designer who paints the world with kindness, grace and an infectious love for life.",
    // The owner's tux-and-gown illustration, framed on the bride.
    photo: DEMO_PORTRAIT,
    tags: [
      { emoji: "🎨", label: "Designer" },
      { emoji: "🏙️", label: "Jaipur" },
    ],
    cropX: 70,
    cropY: 3,
    scale: 165,
  },
  groom: {
    name: "Arjun Verma",
    role: "The Groom",
    description: "An engineer with a golden heart, endless ambition and a soft spot for old Bollywood songs.",
    photo: DEMO_PORTRAIT,
    tags: [
      { emoji: "⚙️", label: "Engineer" },
      { emoji: "🏙️", label: "Delhi" },
    ],
    cropX: 31,
    cropY: 1,
    scale: 165,
  },
  families: {
    bride: "Mrs. Sunita & Mr. Rajesh Sharma",
    groom: "Mrs. Meena & Mr. Vikram Verma",
  },
  galleryImages: [
    { src: DEMO_PHOTO("rw-07"), alt: "First dance", span: "wide", category: "", caption: "Our first dance", w: 1024, h: 683, cropX: 50, cropY: 45 },
    { src: DEMO_PHOTO("rw-16"), alt: "The two of us", span: "tall", category: "", w: 683, h: 1024 },
    { src: DEMO_PHOTO("rw-12"), alt: "The rings", span: "", category: "", w: 1024, h: 683 },
    { src: DEMO_PHOTO("rw-18"), alt: "Walking in", span: "", category: "", caption: "Here we go", w: 1024, h: 683 },
    { src: DEMO_PHOTO("rw-08"), alt: "The décor", span: "", category: "", w: 684, h: 1024 },
    { src: DEMO_PHOTO("rw-02"), alt: "A quiet walk", span: "wide", category: "", w: 1024, h: 683 },
    { src: DEMO_PHOTO("rw-17"), alt: "Two rings", span: "", category: "", w: 1400, h: 1050 },
    { src: DEMO_PHOTO("rw-15"), alt: "Hand in hand", span: "", category: "", w: 1024, h: 683 },
  ],
  wishes: [
    { name: "Amit & Neha", message: "Bahut bahut badhai ho! Dono ko bohot saari khushiyan mile. 💕" },
    { name: "Pooja Aunty", message: "God bless this beautiful couple. Sada khush raho beta. 🙏" },
    { name: "Vikash Bhai", message: "Arey waah! Maza aayega reception mein — see you on the dance floor! 🎉" },
  ],
  sharePhoto: "",

  events: DEMO_EVENTS,
  story: [
    {
      when: "2019 · Delhi",
      title: "A borrowed umbrella",
      line: "They met at a friend's rooftop party when the monsoon arrived early, and Arjun gave away his only umbrella. Priya kept it for two years.",
      photo: DEMO_PHOTO("rw-16"),
    },
    {
      when: "2026 · Udaipur",
      title: "Yes, under the fairy lights",
      line: "On a boat on Lake Pichola he finally asked, and she said yes before he could finish the question.",
      photo: DEMO_PHOTO("rw-12"),
    },
  ],
  contacts: [{ name: "Rohit Sharma", relation: "Priya's brother", phone: "+91 98290 11223" }],
  things: [
    { head: "Parking", text: "Valet parking is available at the main porch of the palace." },
    { head: "Stay", text: "Rooms are held at the palace for our out-of-town guests — just ask Rohit." },
  ],
  music: { mode: "youtube", youtubeId: DEFAULT_SONG, start: 0 },
  theme: "champagne",
  lang: "en",
  invitation:
    "Together with their families, Priya and Arjun joyfully invite you to celebrate the beginning of their married life.\n\nJoin us for an evening of champagne, chandeliers, dinner and dancing in the pink city of Jaipur. Your presence will make our night complete.",
  hindiMessage:
    "प्रिया और अर्जुन के विवाह के उपलक्ष्य में आयोजित स्वागत समारोह में आप सपरिवार सादर आमंत्रित हैं। आपकी उपस्थिति हमारे लिए सौभाग्य होगी।",
  blessingsOf: "Smt. Kamla Devi & Shri Ram Prasad Sharma",
  hashtag: "#PriyaWedsArjun",
  closingLine: "With love, the Sharma & Verma families",
  gettingThere: "Rambagh Palace is 25 minutes from Jaipur airport. Cabs drop at the main porch; the ballroom is signposted from the lobby.",
  videoUrl: "",
  liveUrl: "",
  upiId: "",
  upiName: "",
  rsvpBy: "2027-02-10",
  maxGuests: 6,
  rsvpMeal: true,
};

/** Values for a field an older page does not have. Never the demo's words. */
export const EMPTY_EXTRAS: Pick<
  ReceptionData,
  | "events" | "story" | "contacts" | "things" | "music" | "theme" | "lang" | "invitation" | "hindiMessage" | "blessingsOf"
  | "hashtag" | "closingLine" | "gettingThere" | "videoUrl" | "liveUrl" | "upiId" | "upiName" | "rsvpBy" | "maxGuests" | "rsvpMeal"
> = {
  events: [],
  story: [],
  contacts: [],
  things: [],
  music: { mode: "", youtubeId: "", start: 0 },
  theme: "champagne",
  lang: "en",
  invitation: "",
  hindiMessage: "",
  blessingsOf: "",
  hashtag: "",
  closingLine: "",
  gettingThere: "",
  videoUrl: "",
  liveUrl: "",
  upiId: "",
  upiName: "",
  rsvpBy: "",
  maxGuests: 6,
  rsvpMeal: false,
};
