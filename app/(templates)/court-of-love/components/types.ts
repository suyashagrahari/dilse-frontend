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
}

/**
 * One question in the quiz.
 *
 * ── WHY THE WORDING IS PLAIN ───────────────────────────────────────────────
 *
 * These used to be written in courtroom English — "Where did the accused first
 * steal the plaintiff's heart?", "The Court presents the accused's most-used
 * excuse. Identify it." The joke reads well if you already know what a plaintiff
 * is, and most of the people being sent one of these do not. A quiz about your
 * own relationship that you have to decode first is not a fun quiz.
 *
 * So the questions are now the plainest thing they can be: "I" and "you",
 * short words, the way the sender would actually ask out loud. The courtroom
 * survives where it is decoration — the title, the verdict, the certificate —
 * and is gone from everything the player has to read to answer.
 */
export interface QuizQuestion {
  /**
   * Short topic label above the question — "How we met", "Your excuses".
   *
   * Was "Exhibit A", which told the player nothing. A topic gives them a beat to
   * get their bearings before the question lands.
   */
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
  /**
   * BCP-47 tag for the language the content is written in — "en", "hi",
   * "hi-Latn" (Hinglish), "ur", "ta"… Set when the case was generated from the
   * sender's story. Drives the `lang` attribute and RTL layout.
   */
  language: string;
}

/** Scripts that read right-to-left, by BCP-47 primary subtag. */
const RTL_LANGS = new Set(["ar", "ur", "fa", "he", "iw", "ps", "sd", "ug", "yi", "dv", "ku", "ckb"]);

/**
 * True when the content needs a right-to-left layout.
 *
 * Keyed off the primary subtag so "ur" and "ur-PK" both match — but note that a
 * romanised tag like "ur-Latn" is Latin script and must stay LTR, so an explicit
 * Latn script subtag always wins.
 */
export function isRtl(language: string | undefined | null): boolean {
  if (!language) return false;
  const parts = language.toLowerCase().split("-");
  if (parts.includes("latn")) return false;
  return RTL_LANGS.has(parts[0]);
}

/** `dir` attribute value for this content. */
export function dirFor(language: string | undefined | null): "rtl" | "ltr" {
  return isRtl(language) ? "rtl" : "ltr";
}

/** The score needed to win the case. */
export const PASS_RATIO = 0.8;

/**
 * How many questions a case may hold.
 *
 * This was hard-coded as `.slice(0, 5)` inside the DB reader, which meant the
 * demo could be given ten questions and a published page would silently serve
 * the first five — the kind of bug that looks like the data failed to save.
 * One constant now, used by the reader and the editor both.
 */
export const MAX_QUESTIONS = 10;

export const DEMO_DATA: CourtOfLoveData = {
  plaintiffName: "Aarav",
  accusedName: "",
  headline: "You have been summoned to The Court of Love",
  oathText:
    "Do you swear to answer every question with your whole heart, holding back nothing — not even the embarrassing bits?",
  questions: [
    {
      exhibit: "How we met",
      question: "Where did we first meet?",
      options: [
        "Over a very long, very cold coffee",
        "In a group chat neither of us belonged in",
        "At someone else's boring party",
        "On a call that was meant to last 10 minutes",
      ],
      correctIndex: 3,
      correctNote: "Ten minutes. That call is still going, honestly.",
      wrongNote: "Close enough — neither of us tells that story the same way.",
      allCorrect: false,
    },
    {
      exhibit: "Your excuses",
      question: "What do you always say when you're running late?",
      options: [
        "\"5 minute mein aa raha hoon\"",
        "\"Bas nikal gaya\"",
        "\"Phone silent pe tha\"",
        "\"Main busy tha yaar\"",
      ],
      correctIndex: 0,
      correctNote: "I said it out loud with you. Every single time.",
      wrongNote: "Nice try. It's always a very confident \"5 minute\".",
      allCorrect: false,
    },
    {
      exhibit: "Food",
      question: "What do I order every single time?",
      options: [
        "The exact thing I said I wouldn't",
        "Whatever you ordered, then half of yours",
        "Something spicy, then a lassi to survive it",
        "\"I'm not hungry\" — then your fries",
      ],
      correctIndex: 3,
      correctNote: "The fries were always ours. I don't make the rules.",
      wrongNote: "Not quite — but honestly, I've done all four.",
      allCorrect: false,
    },
    {
      exhibit: "Little habits",
      question: "Which of my habits do you secretly like?",
      options: [
        "Telling you the movie two seconds before it happens",
        "Singing the wrong lyrics like I wrote the song",
        "Falling asleep mid-sentence on call",
        "Sending 14 voice notes instead of one text",
      ],
      correctIndex: 1,
      correctNote: "Wrong lyrics, right person. You like it. Admit it.",
      wrongNote: "Fine — you like all of them. I'll take it.",
      allCorrect: false,
    },
    {
      exhibit: "Texting",
      question: "How do you know I'm missing you?",
      options: [
        "I send a photo with no caption",
        "I text \"busy?\" and nothing else",
        "I send a reel you've already seen twice",
        "I just call, no warning",
      ],
      correctIndex: 2,
      correctNote: "You've seen it. I sent it anyway. That's the whole message.",
      wrongNote: "Any of these, really. They all mean the same thing.",
      allCorrect: false,
    },
    {
      exhibit: "Arguments",
      question: "What do we argue about the most?",
      options: [
        "Where to eat",
        "Who texted first",
        "Whose turn it is to pick the movie",
        "Nothing. We just like the sound of it.",
      ],
      correctIndex: 0,
      correctNote: "Forty minutes. Then the same place as always.",
      wrongNote: "It's always food. It has always been food.",
      allCorrect: false,
    },
    {
      exhibit: "Small things",
      question: "What makes me smile the fastest?",
      options: [
        "Saying my name in that one voice",
        "Sending food photos without asking",
        "Remembering something tiny I said weeks ago",
        "Showing up when you said you couldn't",
      ],
      correctIndex: 2,
      correctNote: "You remember the small things. That's the whole trick.",
      wrongNote: "All of them work. You're very good at this.",
      allCorrect: false,
    },
    {
      exhibit: "Our song",
      question: "Which song makes you think of me?",
      options: [
        "The one we played on repeat that whole week",
        "The one I sing wrong on purpose",
        "The one from that long drive",
        "The one you sent at 2am with no explanation",
      ],
      correctIndex: 3,
      correctNote: "2am, no context, no reply needed. Still my favourite.",
      wrongNote: "They all count. Our playlist is a mess and I love it.",
      allCorrect: false,
    },
    {
      exhibit: "Someday",
      question: "Where do we always say we'll go one day?",
      options: [
        "The mountains, with no signal",
        "A beach where nobody knows us",
        "That one street food place, again",
        "Anywhere, as long as it's a long drive",
      ],
      correctIndex: 0,
      correctNote: "No signal, no plans, just us. We're going. Eventually.",
      wrongNote: "We'll get to all of them. I've got a list.",
      allCorrect: false,
    },
    {
      exhibit: "Last one",
      question: "How much do I love you?",
      options: [
        "A normal, reasonable amount",
        "More than yesterday",
        "This much 🫶",
        "There is no number that big",
      ],
      correctIndex: 3,
      correctNote: "Every answer was right. That was the whole point.",
      wrongNote: "Every answer was right. That was the whole point.",
      allCorrect: true,
    },
  ],
  secretLetter:
    "You didn't actually have to prove anything. I built this entire courtroom just to have an excuse to tell you something silly and true at the same time: on my worst days you are the argument I never want to win, and on my best days you are the reason. The Court rests. I love you — no further evidence required.",
  signatureName: "Aarav",
  certificateTitle: "Certified Best Partner",
  language: "en",
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
  "language",
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
        .slice(0, MAX_QUESTIONS)
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
    language: pick("language"),
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
