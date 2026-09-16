import { DEFAULT_MUSIC_URL } from "@/lib/music/library";
import type { SongExtra } from "@/components/media/SongPicker";

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

/**
 * The one choice that is not a recording.
 *
 * ── WHY THE DEFAULT IS A SONG NOW ───────────────────────────────────────────
 *
 * This list used to hold exactly one entry — the built-in lofi tune, four
 * synthesised chords looping every 2.2 seconds — and `DEMO_DATA.backgroundMusic`
 * was "". So every apology page ever previewed or shared played that chord loop,
 * and there was nothing in the editor to pick instead of it. Senders described
 * it as a ringtone, which is fair: it is an oscillator, not a song.
 *
 * The two real songs this list used to carry died with the old AWS account and
 * were never re-sourced. But `lib/music/library.ts` has thirty-three recordings
 * that are already on the CDN and already playing on other templates, so there
 * is a shelf to point at — see `SongPicker`. The lofi tune stays as a choice
 * because it needs no origin and cannot 404, which makes it the right fallback
 * when a file will not load. It is no longer the only one, or the default.
 */
/**
 * Picking the lofi tune stores this, not "".
 *
 * "" has to keep meaning "nobody ever chose", because that is what every page
 * published before this shelf existed has in it — and those pages should get a
 * song rather than the chord loop they were stuck with. A sender who genuinely
 * wants the loop needs a value that says so.
 */
export const LOFI_SENTINEL = "lofi";

export const BUILTIN_LOFI: SongExtra[] = [
  {
    id: "lofi",
    title: "Gentle lofi",
    by: "built in — no file to load",
    emoji: "\u{1F3B9}",
    value: LOFI_SENTINEL,
  },
];

/**
 * What the page should actually play, given what is stored.
 *
 * Returns a URL to stream, or "" meaning the synthesised lofi loop. Three cases
 * that are easy to collapse and must not be:
 *
 *   • `LOFI_SENTINEL` — somebody chose the loop. Honour it.
 *   • "" — nobody ever chose, because the editor offered nothing else until
 *     now. Every page published before this gets a real song instead of the
 *     chord loop it was stuck with; that is the whole point of the change.
 *   • a gifts-media-prod-123 URL — the old AWS account that no longer exists.
 *     Those rows cannot be edited from here and the request 403s, so they get
 *     the default song rather than silence.
 */
export const playableMusicUrl = (url: string | undefined | null): string => {
  const v = (url || "").trim();
  if (v === LOFI_SENTINEL) return "";
  if (!v || v.includes("gifts-media-prod-123")) return DEFAULT_MUSIC_URL;
  return v;
};

export interface Toast {
  id: number;
  type: "success" | "info" | "publish";
  title: string;
  message?: string;
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
  // A real song, from the first tap of the preview. This was "" — the
  // synthesised lofi chords — which is why every apology sounded like a hold
  // tone rather than something somebody chose.
  backgroundMusic: DEFAULT_MUSIC_URL,
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
