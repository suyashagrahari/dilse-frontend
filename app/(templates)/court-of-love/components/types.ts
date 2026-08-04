// ─── The Court of Love — shared type contract ────────────────────────────────
// Single source of truth for the data shape shared by the editor, the published
// viewer, and the server payload. Field names here === server model field names
// === wire-format keys (flat payload). Keep them in sync.

export type EditMode = null | "choose" | "manual" | "preview";

export interface Toast {
  id: number;
  type: "success" | "info" | "publish";
  title: string;
  message?: string;
  shareUrl?: string;
}

/** One hearing in the trial. */
export interface QuizQuestion {
  /** Short label above the question, e.g. "Exhibit A". */
  exhibit: string;
  question: string;
  /** Always four. */
  options: string[];
  /** Index into `options` (0-3). Ignored when `allCorrect`. */
  correctIndex: number;
  /** Handwritten one-liner shown on the reaction screen after a right answer. */
  correctNote: string;
  /** ...and after a wrong one. */
  wrongNote: string;
  /** Every option scores — used by the final cross-examination. */
  allCorrect: boolean;
}

export interface CourtOfLoveData {
  /** The one filing the case (the sender). */
  plaintiffName: string;
  /** The one standing trial (the recipient). */
  accusedName: string;
  headline: string;
  oathText: string;
  questions: QuizQuestion[];
  secretLetter: string;
  signatureName: string;
  certificateTitle: string;
}

/** The score needed to win the case. */
export const PASS_RATIO = 0.8;

export const DEMO_DATA: CourtOfLoveData = {
  plaintiffName: "Aarav",
  accusedName: "",
  headline: "You have been summoned to The Court of Love",
  oathText:
    "Do you swear to answer every question with your whole heart, holding back nothing — not even the embarrassing bits?",
  questions: [
    {
      exhibit: "Exhibit A",
      question: "Where did the accused first steal the plaintiff's heart?",
      options: [
        "Over a very long, very cold coffee",
        "In a group chat neither of us was supposed to be in",
        "At someone else's boring party",
        "On a call that was meant to last 10 minutes",
      ],
      correctIndex: 3,
      correctNote: "Guilty as charged. Ten minutes turned into every night since.",
      wrongNote: "The Court will allow it — the memory is a little blurry for both of us.",
      allCorrect: false,
    },
    {
      exhibit: "Exhibit B",
      question: "The Court presents the accused's most-used excuse. Identify it.",
      options: [
        "\"5 minute mein aa raha hoon\"",
        "\"Bas nikal gaya\"",
        "\"Phone silent pe tha\"",
        "\"Main busy tha yaar\"",
      ],
      correctIndex: 0,
      correctNote: "The whole courtroom said it out loud with you.",
      wrongNote: "Close! But the record shows a very confident \"5 minute\".",
      allCorrect: false,
    },
    {
      exhibit: "Exhibit C",
      question: "Without fail, what does the plaintiff order every single time?",
      options: [
        "The exact thing they said they wouldn't",
        "Whatever you ordered, then half of yours",
        "Something spicy, then a lassi to survive it",
        "\"I'm not hungry\" — then your fries",
      ],
      correctIndex: 3,
      correctNote: "Objection overruled. The fries were always shared property.",
      wrongNote: "Not quite — but honestly, all four are on the record.",
      allCorrect: false,
    },
    {
      exhibit: "Exhibit D",
      question: "Which habit of the plaintiff does the accused secretly adore?",
      options: [
        "Narrating every movie two seconds before it happens",
        "Singing the wrong lyrics with total confidence",
        "Falling asleep mid-sentence on call",
        "Sending 14 voice notes instead of one text",
      ],
      correctIndex: 1,
      correctNote: "Wrong lyrics, right person. The Court finds this adorable.",
      wrongNote: "The Court accepts that all of these are, in fact, adorable.",
      allCorrect: false,
    },
    {
      exhibit: "Final Cross-Examination",
      question: "Under oath — how much does the plaintiff love you?",
      options: [
        "A normal, reasonable amount",
        "More than yesterday",
        "This much 🫶",
        "There is no number that big",
      ],
      correctIndex: 3,
      correctNote: "Every answer was correct. That was the whole point.",
      wrongNote: "Every answer was correct. That was the whole point.",
      allCorrect: true,
    },
  ],
  secretLetter:
    "You didn't actually have to prove anything. I built this entire courtroom just to have an excuse to tell you something silly and true at the same time: on my worst days you are the argument I never want to win, and on my best days you are the reason. The Court rests. I love you — no further evidence required.",
  signatureName: "Aarav",
  certificateTitle: "Certified Best Partner",
};

/** Whitelisted keys that make up the flat wire payload (also the server model content fields). */
export const COURT_OF_LOVE_CONTENT_KEYS: (keyof CourtOfLoveData)[] = [
  "plaintiffName",
  "accusedName",
  "headline",
  "oathText",
  "questions",
  "secretLetter",
  "signatureName",
  "certificateTitle",
];

/** UI state → flat body sent to POST/PUT. `password` is optional (empty = no gate). */
export function courtOfLoveDataToBody(data: CourtOfLoveData, password?: string): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  for (const k of COURT_OF_LOVE_CONTENT_KEYS) body[k] = data[k];
  if (password !== undefined) body.password = password;
  return body;
}

/**
 * Coerce a stored question into a complete one. Published pages predate any field
 * added later, and a half-filled editor draft can carry blanks, so every question
 * is normalised to exactly four options with an in-range correctIndex.
 */
function normalizeQuestion(raw: unknown, fallback: QuizQuestion): QuizQuestion {
  const src = (raw ?? {}) as Record<string, unknown>;
  const rawOptions = Array.isArray(src.options) ? (src.options as unknown[]) : [];
  const options = rawOptions.slice(0, 4).map((o) => (typeof o === "string" ? o : ""));
  while (options.length < 4) options.push(fallback.options[options.length] ?? "");

  const idx = Number(src.correctIndex);
  return {
    exhibit: typeof src.exhibit === "string" && src.exhibit ? src.exhibit : fallback.exhibit,
    question: typeof src.question === "string" && src.question ? src.question : fallback.question,
    options,
    correctIndex: Number.isFinite(idx) ? Math.min(Math.max(Math.trunc(idx), 0), 3) : fallback.correctIndex,
    correctNote: typeof src.correctNote === "string" ? src.correctNote : fallback.correctNote,
    wrongNote: typeof src.wrongNote === "string" ? src.wrongNote : fallback.wrongNote,
    allCorrect: Boolean(src.allCorrect),
  };
}

/** DB/share response → UI state (fills any missing field from DEMO_DATA). */
export function dbToCourtOfLoveData(db: Record<string, unknown> | null | undefined): CourtOfLoveData {
  const src = db ?? {};
  const pick = <K extends keyof CourtOfLoveData>(k: K): CourtOfLoveData[K] =>
    (src[k as string] as CourtOfLoveData[K]) ?? DEMO_DATA[k];

  const rawQuestions = Array.isArray(src.questions) ? (src.questions as unknown[]) : [];
  const questions = rawQuestions.length
    ? rawQuestions
        .slice(0, 5)
        .map((q, i) => normalizeQuestion(q, DEMO_DATA.questions[i] ?? DEMO_DATA.questions[0]))
        // A question with no text would render an empty card — drop it.
        .filter((q) => q.question.trim().length > 0)
    : DEMO_DATA.questions;

  return {
    plaintiffName: pick("plaintiffName"),
    accusedName: pick("accusedName"),
    headline: pick("headline"),
    oathText: pick("oathText"),
    questions: questions.length ? questions : DEMO_DATA.questions,
    secretLetter: pick("secretLetter"),
    signatureName: pick("signatureName"),
    certificateTitle: pick("certificateTitle"),
  };
}

/** True when this answer scores. */
export function isCorrect(q: QuizQuestion, chosenIndex: number): boolean {
  return q.allCorrect || chosenIndex === q.correctIndex;
}

/**
 * Stable case number derived from the shareId, so the summons screen and the
 * certificate always agree and a reload never changes it. Falls back to a fixed
 * demo number in the editor preview, where no shareId exists yet.
 */
export function caseNumber(shareId?: string | null): string {
  if (!shareId) return "CoL/2026/0001";
  let hash = 0;
  for (let i = 0; i < shareId.length; i++) {
    hash = (hash * 31 + shareId.charCodeAt(i)) >>> 0;
  }
  return `CoL/2026/${String(hash % 10000).padStart(4, "0")}`;
}
