import { media } from "@/lib/templateMedia";

// ─── Apology Dashboard — shared type contract ────────────────────────────────
// Single source of truth for the data shape shared by the editor, the published
// viewer, and the server payload. Field names here === server model field names
// === wire-format keys (flat payload). Keep them in sync.

export type EditMode = null | "choose" | "manual" | "preview";

export type Relationship = "girlfriend" | "boyfriend" | "partner";

export const RELATIONSHIPS: { id: Relationship; label: string }[] = [
  { id: "girlfriend", label: "Girlfriend" },
  { id: "boyfriend", label: "Boyfriend" },
  { id: "partner", label: "Partner" },
];

// Window events used to duck the background music (e.g. while recording a voice
// note, or when previewing a song in the editor) so only one audio plays at a time.
export const MUSIC_PAUSE_EVENT = "apology:music-pause";
export const MUSIC_RESUME_EVENT = "apology:music-resume";

export interface MusicPreset { id: string; label: string; url: string }
/** Selectable background songs. url "" = the built-in gentle lofi tune. */
export const MUSIC_PRESETS: MusicPreset[] = [
  { id: "lofi", label: "Gentle lofi (built-in)", url: "" },
  { id: "chalo", label: "Chalo Jaane Do 🎵", url: media("apology-dashboard/music/chalo-jaane-do.mp3") },
  { id: "sorry", label: "Sorry — Justin Bieber 💔", url: media("apology-dashboard/music/sorry-justin-bieber.mp3") },
];

export interface Toast {
  id: number;
  type: "success" | "info" | "publish";
  title: string;
  message?: string;
  shareUrl?: string;
}

/** One selectable promise on the Sweet Bribery Desk. */
export interface BriberyItem {
  icon: string; // emoji
  label: string;
}

/** One chapter on the Memory Lane timeline. */
export interface TimelineNode {
  icon: string; // emoji
  title: string;
  text: string;
}

export interface ApologyData {
  /** Person apologizing. */
  senderName: string;
  /** The gf/bf being apologized to. */
  recipientName: string;
  relationship: Relationship;
  /** Hero headline, e.g. "I'm really, really sorry". */
  headline: string;
  /** Hero subtitle. */
  subMessage: string;
  /** The heartfelt "why I'm sorry" letter (long text). */
  sorryLetter: string;
  /** Sender's face photo (S3 URL, or base64 data URL before upload). */
  senderPhoto: string;
  /** Uploaded face photo(s) used on the whack-a-mole targets. Empty → emoji fallback. */
  whackFaces: string[];
  /** Recorded/uploaded voice apology (S3 URL or base64 data URL). */
  voiceUrl: string;
  /** Secret message / little note revealed under the scratch card. */
  scratchSecret: string;
  /** Photo(s) revealed under the scratch card (S3 URLs or base64 data URLs). */
  scratchImages: string[];
  /** Voice note revealed under the scratch card (S3 URL or base64 data URL). */
  scratchVoice: string;
  /** Editable Sweet Bribery Desk options. */
  briberyItems: BriberyItem[];
  /** Memory Lane chapters. */
  timeline: TimelineNode[];
  /** Sender's email — receives the signed agreement PDF. */
  deliveryEmail: string;
  /** Image used for social share cards. */
  sharePhoto: string;
  /** Background song URL ("" = built-in lofi). Plays on the shared page. */
  backgroundMusic: string;
}

export const DEMO_DATA: ApologyData = {
  senderName: "Aarav",
  recipientName: "",
  relationship: "girlfriend",
  headline: "I'm really, really sorry 🥺",
  subMessage:
    "I built this whole little world just to say it. Play, scratch, whack, forgive — take your time. I'll be right here.",
  sorryLetter:
    "I know I messed up, and I've been replaying it in my head all day. You mean more to me than being right ever could. I'm sorry for hurting you — you deserve nothing but gentleness from me. Give me the chance to make it up to you, every single day.",
  senderPhoto: "",
  whackFaces: [],
  voiceUrl: "",
  scratchSecret:
    "My favorite place in the whole world is right next to you. Even when I mess up — that never changes. 💗",
  scratchImages: [],
  scratchVoice: "",
  briberyItems: [
    { icon: "💆‍♀️", label: "1× premium massage night" },
    { icon: "🍜", label: "Your favorite feast tonight (on me)" },
    { icon: "🧹", label: "All the chores for 7 days" },
    { icon: "🤗", label: "Unlimited tight, warm hugs" },
    { icon: "🎬", label: "Movie night — your pick, no complaints" },
    { icon: "☕", label: "Morning coffee in bed all week" },
  ],
  timeline: [
    { icon: "⭐", title: "Chapter I — The Spark", text: "The day the universe was showing off, and it handed me you." },
    { icon: "😄", title: "Chapter II — Inside Jokes", text: "Half a dictionary only the two of us can read." },
    { icon: "🌱", title: "Chapter III — Growing Closer", text: "Roots, not just butterflies. And I'm not going anywhere." },
  ],
  deliveryEmail: "",
  sharePhoto: "",
  // default: "Sorry" (Justin Bieber) — plays by default in preview & on unset pages
  backgroundMusic: media("apology-dashboard/music/sorry-justin-bieber.mp3"),
};

/** Whitelisted keys that make up the flat wire payload (also the server model content fields). */
export const APOLOGY_CONTENT_KEYS: (keyof ApologyData)[] = [
  "senderName",
  "recipientName",
  "relationship",
  "headline",
  "subMessage",
  "sorryLetter",
  "senderPhoto",
  "whackFaces",
  "voiceUrl",
  "scratchSecret",
  "scratchImages",
  "scratchVoice",
  "briberyItems",
  "timeline",
  "deliveryEmail",
  "sharePhoto",
  "backgroundMusic",
];

/** UI state → flat body sent to POST/PUT. `password` is optional (empty = no gate). */
export function apologyDataToBody(data: ApologyData, password?: string): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  for (const k of APOLOGY_CONTENT_KEYS) body[k] = data[k];
  if (password !== undefined) body.password = password;
  return body;
}

/** DB/share response → UI state (fills any missing field from DEMO_DATA). */
export function dbToApologyData(db: Record<string, unknown> | null | undefined): ApologyData {
  const src = db ?? {};
  const pick = <K extends keyof ApologyData>(k: K): ApologyData[K] =>
    (src[k as string] as ApologyData[K]) ?? DEMO_DATA[k];
  return {
    senderName: pick("senderName"),
    recipientName: pick("recipientName"),
    relationship: pick("relationship"),
    headline: pick("headline"),
    subMessage: pick("subMessage"),
    sorryLetter: pick("sorryLetter"),
    senderPhoto: pick("senderPhoto"),
    whackFaces: Array.isArray(src.whackFaces) ? (src.whackFaces as string[]) : DEMO_DATA.whackFaces,
    voiceUrl: pick("voiceUrl"),
    scratchSecret: pick("scratchSecret"),
    scratchImages: Array.isArray(src.scratchImages) ? (src.scratchImages as string[]) : DEMO_DATA.scratchImages,
    scratchVoice: pick("scratchVoice"),
    briberyItems: Array.isArray(src.briberyItems) ? (src.briberyItems as BriberyItem[]) : DEMO_DATA.briberyItems,
    timeline: Array.isArray(src.timeline) ? (src.timeline as TimelineNode[]) : DEMO_DATA.timeline,
    deliveryEmail: pick("deliveryEmail"),
    sharePhoto: pick("sharePhoto"),
    backgroundMusic: pick("backgroundMusic"),
  };
}

// ─── Signing (viewer → server) ───────────────────────────────────────────────
/** Payload POSTed to `/apology-dashboard-pages/share/:shareId/sign`. */
export interface SignAgreementBody {
  signerName: string;
  signerEmail?: string;
  /** PNG data URL of the drawn signature. */
  signatureImage: string;
  /** Bribery promises the recipient accepted (labels). */
  acceptedPromises: string[];
}
