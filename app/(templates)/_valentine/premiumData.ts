// ─── The premium tier's shared data (client half) ───────────────────────────
//
// Every `-premium` slug carries `data.premium` (a top-level field, never inside
// `extras`) with the SAME keys and caps as the server's sanitizePremium
// (server/src/config/valentineDays.ts, PREMIUM_LIMITS). $2 pages never have it.
// The full contract: .template-factory/premium/PREMIUM-ENGINE.md.

export interface PremiumFields {
  /** "" · a `data:audio/…` recording (editor only, uploaded on save) · an https CDN url. */
  voiceNote: string;
  /** Duration in whole seconds (0–60). */
  voiceNoteSec: number;
  /** ≤64 bars, 0–100 — the waveform, computed when it was recorded (no audio decoding on the recipient's phone). */
  voicePeaks: number[];
  /** ≤90 — under the waveform; the typed transmission when there's no voice note. */
  voiceCaption: string;
  /** 0–600 s; 0 = no drop. The climax seeks the song here (useSongDrop). */
  songDropAt: number;
  /** "" = open now, else an ISO instant. Before it the server sends only a teaser. */
  unlockAt: string;
  /** IANA zone the unlock time is shown in (default Asia/Kolkata). */
  unlockTz: string;
  /** Let the recipient write back (≤280). Default true. */
  allowReply: boolean;
  /** ≤600 — the sealed P.S. ("open only if…"). */
  psLetter: string;
}

export const PREMIUM_LIMITS = {
  voiceSec: 60,
  /** Decoded bytes the server accepts for a voice note. */
  voiceBytes: 2 * 1024 * 1024,
  voicePeaks: 64,
  voiceCaption: 90,
  psLetter: 600,
  songDropMax: 600,
  unlockTz: 40,
  reply: 280,
  maxPhotos: 12,
  letterMax: 3000,
  gifSlots: 6,
} as const;

export const DEFAULT_UNLOCK_TZ = "Asia/Kolkata";
const TZ_RE = /^[A-Za-z]+(?:\/[A-Za-z0-9_+-]+){0,2}$/;

export const PREMIUM_DEFAULTS: PremiumFields = {
  voiceNote: "",
  voiceNoteSec: 0,
  voicePeaks: [],
  voiceCaption: "",
  songDropAt: 0,
  unlockAt: "",
  unlockTz: DEFAULT_UNLOCK_TZ,
  allowReply: true,
  psLetter: "",
};

const int = (v: unknown, min: number, max: number, fb: number) => {
  const n = typeof v === "number" ? v : typeof v === "string" && v.trim() ? Number(v) : NaN;
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : fb;
};

/** A valid ISO instant, or "". */
export function normaliseUnlockAt(v: unknown): string {
  if (typeof v !== "string" || !v.trim()) return "";
  const t = Date.parse(v);
  return Number.isFinite(t) ? new Date(t).toISOString() : "";
}

/**
 * Wire → form. Tolerant of old/partial/hostile data; a missing key takes
 * `fallback` (the demo while building, the defaults for a page from the server).
 */
export function coercePremium(raw: unknown, fallback: PremiumFields = PREMIUM_DEFAULTS): PremiumFields {
  const src = raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  const s = (k: keyof PremiumFields, max: number) => (typeof src[k] === "string" ? (src[k] as string).slice(0, max) : (fallback[k] as string));
  const voice = typeof src.voiceNote === "string" ? src.voiceNote : fallback.voiceNote;
  return {
    voiceNote: /^(https:\/\/|data:audio\/)/i.test(voice) ? voice : "",
    voiceNoteSec: int(src.voiceNoteSec, 0, PREMIUM_LIMITS.voiceSec, fallback.voiceNoteSec),
    voicePeaks: Array.isArray(src.voicePeaks)
      ? (src.voicePeaks as unknown[]).slice(0, PREMIUM_LIMITS.voicePeaks).map((n) => int(n, 0, 100, 0))
      : fallback.voicePeaks,
    voiceCaption: s("voiceCaption", PREMIUM_LIMITS.voiceCaption),
    songDropAt: int(src.songDropAt, 0, PREMIUM_LIMITS.songDropMax, fallback.songDropAt),
    unlockAt: "unlockAt" in src ? normaliseUnlockAt(src.unlockAt) : fallback.unlockAt,
    unlockTz: typeof src.unlockTz === "string" && TZ_RE.test(src.unlockTz) && src.unlockTz.length <= PREMIUM_LIMITS.unlockTz ? src.unlockTz : fallback.unlockTz,
    allowReply: typeof src.allowReply === "boolean" ? src.allowReply : fallback.allowReply,
    psLetter: s("psLetter", PREMIUM_LIMITS.psLetter),
  };
}

/** Save-time tidy. */
export function tidyPremium(p: PremiumFields): PremiumFields {
  return {
    ...p,
    voiceCaption: p.voiceCaption.trim(),
    psLetter: p.psLetter.trim(),
    voiceNoteSec: p.voiceNote ? p.voiceNoteSec : 0,
    voicePeaks: p.voiceNote ? p.voicePeaks : [],
    unlockAt: normaliseUnlockAt(p.unlockAt),
  };
}

/** True while the page is still sealed (client clock; the server is the authority). */
export const isBeforeUnlock = (p: Pick<PremiumFields, "unlockAt"> | undefined, now = Date.now()) =>
  !!p?.unlockAt && Date.parse(p.unlockAt) > now;

/** "Fri, 31 Oct, 12:00 am IST"-style label in the page's zone. */
export function formatUnlock(iso: string, tz = DEFAULT_UNLOCK_TZ): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "";
  try {
    return new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: tz, timeZoneName: "short" }).format(t);
  } catch {
    return new Date(t).toLocaleString();
  }
}

/** The teaser the server returns before `unlockAt` (no content at all). */
export interface LockedTeaser {
  locked: true;
  recipientName: string;
  senderName: string;
  petName: string;
  unlockAt: string;
  unlockTz: string;
}

export function parseLockedTeaser(raw: unknown): LockedTeaser | null {
  const r = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : null;
  if (!r || r.locked !== true) return null;
  const p = coercePremium(r.premium);
  return {
    locked: true,
    recipientName: typeof r.recipientName === "string" ? r.recipientName.slice(0, 30) : "",
    senderName: typeof r.senderName === "string" ? r.senderName.slice(0, 30) : "",
    petName: typeof r.petName === "string" ? r.petName.slice(0, 24) : "",
    unlockAt: p.unlockAt,
    unlockTz: p.unlockTz,
  };
}
