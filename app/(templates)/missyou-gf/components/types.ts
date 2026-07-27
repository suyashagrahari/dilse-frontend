// ─── Miss You — shared type contract ─────────────────────────────────────────
// Single source of truth for the data shape shared by the editor, the published
// viewer, and the server payload. Field names here === server model field names
// === wire-format keys (flat payload). Keep them in sync with the Stage-4 model.

export type EditMode = null | "choose" | "manual" | "preview";
export type AccentTint = "indigo" | "pink";
export type DistanceUnit = "km" | "mi";

// Window events used to duck the background music (e.g. while recording or
// playing a voice note) so only one audio source plays at a time.
export const MUSIC_PAUSE_EVENT = "missyou:music-pause";
export const MUSIC_RESUME_EVENT = "missyou:music-resume";

export interface Toast {
  id: number;
  type: "success" | "info" | "publish";
  title: string;
  message?: string;
  shareUrl?: string;
}

/** A city the two clocks + distance are computed from. */
export interface CityInfo {
  label: string;
  /** IANA timezone id — DST handled by Intl. */
  tz: string;
  lat: number;
  lng: number;
}

/** Curated cities for the your-city / their-city pickers (label is the stored key). */
export const CITY_PRESETS: CityInfo[] = [
  { label: "Mumbai", tz: "Asia/Kolkata", lat: 19.076, lng: 72.8777 },
  { label: "Delhi", tz: "Asia/Kolkata", lat: 28.6139, lng: 77.209 },
  { label: "Bengaluru", tz: "Asia/Kolkata", lat: 12.9716, lng: 77.5946 },
  { label: "Chennai", tz: "Asia/Kolkata", lat: 13.0827, lng: 80.2707 },
  { label: "Kolkata", tz: "Asia/Kolkata", lat: 22.5726, lng: 88.3639 },
  { label: "Hyderabad", tz: "Asia/Kolkata", lat: 17.385, lng: 78.4867 },
  { label: "Dubai", tz: "Asia/Dubai", lat: 25.2048, lng: 55.2708 },
  { label: "London", tz: "Europe/London", lat: 51.5074, lng: -0.1278 },
  { label: "Paris", tz: "Europe/Paris", lat: 48.8566, lng: 2.3522 },
  { label: "Berlin", tz: "Europe/Berlin", lat: 52.52, lng: 13.405 },
  { label: "New York", tz: "America/New_York", lat: 40.7128, lng: -74.006 },
  { label: "Toronto", tz: "America/Toronto", lat: 43.6532, lng: -79.3832 },
  { label: "Chicago", tz: "America/Chicago", lat: 41.8781, lng: -87.6298 },
  { label: "San Francisco", tz: "America/Los_Angeles", lat: 37.7749, lng: -122.4194 },
  { label: "Los Angeles", tz: "America/Los_Angeles", lat: 34.0522, lng: -118.2437 },
  { label: "Sydney", tz: "Australia/Sydney", lat: -33.8688, lng: 151.2093 },
  { label: "Melbourne", tz: "Australia/Melbourne", lat: -37.8136, lng: 144.9631 },
  { label: "Singapore", tz: "Asia/Singapore", lat: 1.3521, lng: 103.8198 },
  { label: "Tokyo", tz: "Asia/Tokyo", lat: 35.6762, lng: 139.6503 },
  { label: "Hong Kong", tz: "Asia/Hong_Kong", lat: 22.3193, lng: 114.1694 },
  { label: "Doha", tz: "Asia/Qatar", lat: 25.2854, lng: 51.531 },
  { label: "Riyadh", tz: "Asia/Riyadh", lat: 24.7136, lng: 46.6753 },
  { label: "Kathmandu", tz: "Asia/Kathmandu", lat: 27.7172, lng: 85.324 },
  { label: "Auckland", tz: "Pacific/Auckland", lat: -36.8485, lng: 174.7633 },
];

export const findCity = (label: string): CityInfo | undefined =>
  CITY_PRESETS.find((c) => c.label === label);

/** DST-safe local wall-clock time in a given IANA timezone. */
export interface ZonedTime {
  hours: number;
  minutes: number;
  seconds: number;
  /** e.g. "9:41 PM". */
  digital: string;
}

export function timeInZone(tz: string, now: Date = new Date()): ZonedTime {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).formatToParts(now);
    const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? "0");
    let hours = get("hour");
    if (hours === 24) hours = 0; // some engines emit "24" for midnight
    const minutes = get("minute");
    const seconds = get("second");
    const digital = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(now);
    return { hours, minutes, seconds, digital };
  } catch {
    // invalid tz → fall back to device local time
    return {
      hours: now.getHours(),
      minutes: now.getMinutes(),
      seconds: now.getSeconds(),
      digital: now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
    };
  }
}

/** Great-circle distance between two cities (Haversine), in the requested unit. */
export function cityDistance(a: CityInfo, b: CityInfo, unit: DistanceUnit): number {
  const R = 6371; // km
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  const km = 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
  return unit === "mi" ? km * 0.621371 : km;
}

/** Countdown breakdown until a reunion date (all zero + done when past). */
export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
}

export function countdownTo(iso: string, now: Date = new Date()): Countdown | null {
  if (!iso) return null;
  const target = new Date(iso).getTime();
  if (Number.isNaN(target)) return null;
  let diff = Math.floor((target - now.getTime()) / 1000);
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  const days = Math.floor(diff / 86400);
  diff -= days * 86400;
  const hours = Math.floor(diff / 3600);
  diff -= hours * 3600;
  const minutes = Math.floor(diff / 60);
  const seconds = diff - minutes * 60;
  return { days, hours, minutes, seconds, done: false };
}

export interface Memory {
  /** S3 URL, or base64 data URL before upload. */
  image: string;
  caption: string;
}

export interface OpenWhenNote {
  label: string;
  text: string;
}

export interface QuizCard {
  question: string;
  answer: string;
  /** One-line memory revealed with the answer. */
  memory: string;
}

export interface MissYouData {
  /** The person who misses them (that's the sender). */
  senderName: string;
  /** Their partner's real name. */
  recipientName: string;
  /** The pet-name shown big on the envelope + greeting. */
  petName: string;
  /** Eyebrow line on the cover. */
  coverLine: string;
  /** The heartfelt "I miss you" letter body (long text). */
  letterBody: string;
  /** Caveat signature line under the letter. */
  signature: string;
  /** Sender's city label (defaults to auto-detected device city). */
  yourCity: string;
  /** Their city label — drives the second clock + distance. */
  theirCity: string;
  /** Reunion date/time ISO string ("" hides the countdown). */
  reunionDate: string;
  /** ISO of the moment the missing began (last goodbye) — powers the count-up timer. */
  sinceDate: string;
  distanceUnit: DistanceUnit;
  /** 3–6 memory photos + Caveat captions. */
  memories: Memory[];
  /** The hidden confession under the scratch card. */
  secret: string;
  /** 3–4 "Open When…" labelled notes. */
  openWhen: OpenWhenNote[];
  /** 3 "do you still remember us?" flip-quiz cards. */
  quiz: QuizCard[];
  /** Sender's voice note on the letter (S3 URL or base64 data URL). */
  voiceUrl: string;
  /** Background song URL ("" = silent, muted control hidden). */
  backgroundMusic: string;
  /** Small on-theme accent tint. */
  accentTint: AccentTint;
  /** Image used for social share cards. */
  sharePhoto: string;
}

export const DEMO_DATA: MissYouData = {
  senderName: "Aarav",
  recipientName: "",
  petName: "my moon",
  coverLine: "A letter for you",
  letterBody:
    "It's late here and the city has gone quiet, which is usually when I miss you the most. I keep reaching for my phone to tell you the smallest things — that the chai tasted like the one from that little stall, that a song came on and I was back on that rooftop with you. Being apart is hard, but it never once made me doubt us. Every day is one day closer to holding you again. Until then, this little world is me, thinking about you.",
  signature: "Always yours,",
  yourCity: "Mumbai",
  theirCity: "London",
  reunionDate: "",
  // A recent placeholder so the demo shows the live count-up timer; senders set their own.
  sinceDate: "2026-07-20T21:00:00.000Z",
  distanceUnit: "km",
  memories: [
    { image: "", caption: "our first rainy walk 🌧️" },
    { image: "", caption: "the rooftop, 2am ✨" },
    { image: "", caption: "you, laughing at nothing" },
    { image: "", caption: "that tiny cafe we love ☕" },
    { image: "", caption: "dancing in the kitchen 🎶" },
    { image: "", caption: "just us, doing nothing 🤍" },
  ],
  secret:
    "I didn't say it out loud, but I've already picked the song for our first dance when I'm home. 💍",
  openWhen: [
    { label: "open when you miss me", text: "Close your eyes. I'm holding you right now — the exact way you like. I'm counting the days too. 🤍" },
    { label: "open when you can't sleep", text: "Put this on speaker and pretend it's me humming. Breathe in for four, out for four. I've got you, always." },
    { label: "open when you need a laugh", text: "Remember when you snorted so hard the whole cafe turned around? I still laugh about it. You're my favourite disaster. 😂" },
    { label: "open when we're finally together", text: "If you're reading this, the waiting is over. Don't let go for a very long time. This one's real. 🥹" },
  ],
  quiz: [
    { question: "where was our first date?", answer: "the tiny corner cafe", memory: "you ordered the wrong coffee and drank it anyway just to keep talking." },
    { question: "what song is 'ours'?", answer: "the one from the car ride home", memory: "we replayed it four times and didn't say a word." },
    { question: "what do I love most about you?", answer: "your laugh", memory: "it's the sound I chase on my worst days." },
  ],
  voiceUrl: "",
  backgroundMusic: "",
  accentTint: "indigo",
  sharePhoto: "",
};

/** Whitelisted keys that make up the flat wire payload (also the server model content fields). */
export const MISSYOU_CONTENT_KEYS: (keyof MissYouData)[] = [
  "senderName",
  "recipientName",
  "petName",
  "coverLine",
  "letterBody",
  "signature",
  "yourCity",
  "theirCity",
  "reunionDate",
  "sinceDate",
  "distanceUnit",
  "memories",
  "secret",
  "openWhen",
  "quiz",
  "voiceUrl",
  "backgroundMusic",
  "accentTint",
  "sharePhoto",
];

/**
 * Return a user-provided media URL only if it is a safe http(s) or CDN data URL,
 * otherwise "". Guards `<audio src>` / `new Audio()` against unexpected schemes
 * (javascript:, file:, blob: from other origins, etc.). Empty string is a no-op
 * for the audio players (they render nothing / never call play()).
 */
export function safeMediaUrl(raw: unknown): string {
  if (typeof raw !== "string") return "";
  const v = raw.trim();
  if (!v) return "";
  // Media the editor produced before upload (in-page preview) arrives as data:audio.
  if (/^data:audio\//i.test(v)) return v;
  try {
    const u = new URL(v, typeof window !== "undefined" ? window.location.origin : "https://subhsandesh.in");
    return u.protocol === "http:" || u.protocol === "https:" ? u.href : "";
  } catch {
    return "";
  }
}

/**
 * Return a user-provided image URL only if it is a safe http(s) URL or an inline
 * `data:image/...` (the editor produces base64 data-images for the live preview,
 * before they're uploaded to S3). Anything else (javascript:, data:text, file:…)
 * collapses to "" so `<img src>` can never carry an unexpected scheme.
 */
export function safeImageUrl(raw: unknown): string {
  if (typeof raw !== "string") return "";
  const v = raw.trim();
  if (!v) return "";
  if (/^data:image\//i.test(v)) return v;
  try {
    const u = new URL(v, typeof window !== "undefined" ? window.location.origin : "https://subhsandesh.in");
    return u.protocol === "http:" || u.protocol === "https:" ? u.href : "";
  } catch {
    return "";
  }
}

// ─── Recipient engagement (server-managed; NOT part of the create payload) ───────

/** The recipient's "love map" answers, saved back from the shared page. */
export interface LoveMapData {
  foods: string;
  stress: string;
  dreams: string;
  dates: string;
}

export const EMPTY_LOVEMAP: LoveMapData = { foods: "", stress: "", dreams: "", dates: "" };

export const LOVEMAP_FIELDS: { key: keyof LoveMapData; label: string; placeholder: string }[] = [
  { key: "foods", label: "your favourite foods", placeholder: "the little dumpling place, cinnamon anything…" },
  { key: "stress", label: "what's weighing on you lately", placeholder: "so i know how to help" },
  { key: "dreams", label: "dreams to chase together", placeholder: "kyoto in spring, a tiny house, a big dog…" },
  { key: "dates", label: "dates that matter", placeholder: "sept 4, march 12, every friday" },
];

/** Normalize a db love-map object → LoveMapData (fills missing keys). */
export function dbToLoveMap(db: unknown): LoveMapData {
  const src = (db && typeof db === "object" ? db : {}) as Record<string, unknown>;
  const s = (k: keyof LoveMapData) => (typeof src[k] === "string" ? (src[k] as string) : "");
  return { foods: s("foods"), stress: s("stress"), dreams: s("dreams"), dates: s("dates") };
}

/** Owner-facing engagement snapshot shown in the History panel. */
export interface EngagementData {
  hugCount: number;
  loveMap: LoveMapData;
  viewCount: number;
  lastHugAt?: string;
  loveMapUpdatedAt?: string;
}

export function dbToEngagement(db: Record<string, unknown> | null | undefined): EngagementData {
  const src = db ?? {};
  return {
    hugCount: Number(src.hugCount) || 0,
    loveMap: dbToLoveMap(src.loveMap),
    viewCount: Number(src.viewCount) || 0,
    lastHugAt: typeof src.lastHugAt === "string" ? src.lastHugAt : undefined,
    loveMapUpdatedAt: typeof src.loveMapUpdatedAt === "string" ? src.loveMapUpdatedAt : undefined,
  };
}

/** UI state → flat body sent to POST/PUT. `password` optional (empty = no gate). */
export function missYouDataToBody(data: MissYouData, password?: string): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  for (const k of MISSYOU_CONTENT_KEYS) body[k] = data[k];
  if (password !== undefined) body.password = password;
  return body;
}

/** DB/share response → UI state (fills any missing field from DEMO_DATA). */
export function dbToMissYouData(db: Record<string, unknown> | null | undefined): MissYouData {
  const src = db ?? {};
  const pick = <K extends keyof MissYouData>(k: K): MissYouData[K] =>
    (src[k as string] as MissYouData[K]) ?? DEMO_DATA[k];
  const arr = <T>(k: keyof MissYouData, fallback: T[]): T[] =>
    Array.isArray(src[k as string]) ? (src[k as string] as T[]) : fallback;
  const tint = src.accentTint === "pink" ? "pink" : "indigo";
  const unit = src.distanceUnit === "mi" ? "mi" : "km";
  return {
    senderName: pick("senderName"),
    recipientName: pick("recipientName"),
    petName: pick("petName"),
    coverLine: pick("coverLine"),
    letterBody: pick("letterBody"),
    signature: pick("signature"),
    yourCity: pick("yourCity"),
    theirCity: pick("theirCity"),
    reunionDate: pick("reunionDate"),
    sinceDate: pick("sinceDate"),
    distanceUnit: unit,
    memories: arr<Memory>("memories", DEMO_DATA.memories),
    secret: pick("secret"),
    openWhen: arr<OpenWhenNote>("openWhen", DEMO_DATA.openWhen),
    quiz: arr<QuizCard>("quiz", DEMO_DATA.quiz),
    voiceUrl: pick("voiceUrl"),
    backgroundMusic: pick("backgroundMusic"),
    accentTint: tint,
    sharePhoto: pick("sharePhoto"),
  };
}
