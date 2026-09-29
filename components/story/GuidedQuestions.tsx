// ─── GuidedQuestions — "just answer a few things about them" ─────────────────
//
// The free-text composer asks a sender to write about their relationship
// cold, and most people can't. This asks them six small questions instead —
// one screen each, mostly taps — and assembles the story for them. The model
// gets MORE material this way, not less: a name, a relation, a memory and three
// things they love are exactly the specifics a good page is built from, and
// they are the specifics nobody thinks to write down unprompted.
//
// ── WHAT GOES OVER THE WIRE ──────────────────────────────────────────────────
//
// The answers become the same `people` + `story` the composer sends (so every
// server guard — exclusions, script check, name override — applies unchanged),
// plus `hints` for the three things prose can't pin down: relation, tone and a
// chosen language. See `FillHints` on the server for why language needs one.
//
// ── ONLY THE TWO NAMES ARE REQUIRED ─────────────────────────────────────────
//
// Everything else is skippable and the story reads naturally with any subset.
//
// ── ANSWERS SURVIVE ──────────────────────────────────────────────────────────
//
// In sessionStorage: a refresh mid-flow lands on the same question with the
// same answers, and the NEXT template opened this session starts with them
// pre-filled, so the second page is six taps on "Continue". The step is keyed
// per template (a new template starts at the top), the answers are not.

"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clapperboard,
  Heart,
  HeartHandshake,
  Laugh,
  Plus,
  Sparkles,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import type { StoryPeople, WireSchema } from "@/lib/ai-fill/types";
import { STORY_LIMITS } from "@/lib/ai-fill/types";
import { STORY_UI, TAP, areaStyle, inputStyle } from "./ui";

// ═══════════════════════════════════════════════════════════════════════════
// Answers, and turning them into a story
// ═══════════════════════════════════════════════════════════════════════════

export type GuidedTone = "cute" | "funny" | "emotional" | "filmy";
export type GuidedLanguage = "en" | "hi-Latn" | "hi";

export interface GuidedAnswers {
  theirName: string;
  yourName: string;
  relation: string;
  since: string;
  howMet: string;
  nickname: string;
  loves: string[];
  memory: string;
  occasion: string;
  tone: GuidedTone | "";
  language: GuidedLanguage;
}

const EMPTY_ANSWERS: GuidedAnswers = {
  theirName: "",
  yourName: "",
  relation: "",
  since: "",
  howMet: "",
  nickname: "",
  loves: [],
  memory: "",
  occasion: "",
  tone: "",
  language: "en",
};

const ANSWERS_KEY = "ss:guided-answers:v1";
const stepKey = (slug: string) => `ss:guided-step:v1:${slug}`;

function readAnswers(): GuidedAnswers | null {
  try {
    const raw = sessionStorage.getItem(ANSWERS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<GuidedAnswers>;
    return {
      ...EMPTY_ANSWERS,
      ...parsed,
      loves: Array.isArray(parsed.loves)
        ? parsed.loves.filter((l) => typeof l === "string")
        : [],
    };
  } catch {
    return null;
  }
}

function readStep(slug: string): number {
  try {
    const n = Number(sessionStorage.getItem(stepKey(slug)));
    return Number.isInteger(n) && n >= 0 && n < STEP_COUNT ? n : 0;
  } catch {
    return 0;
  }
}

function hasAnyAnswer(a: GuidedAnswers): boolean {
  return Boolean(
    a.theirName || a.yourName || a.relation || a.memory || a.loves.length,
  );
}

type Pronouns = { subj: string; poss: string; obj: string; wire: string };

const SHE: Pronouns = { subj: "she", poss: "her", obj: "her", wire: "she/her" };
const HE: Pronouns = { subj: "he", poss: "his", obj: "him", wire: "he/him" };
const THEY: Pronouns = { subj: "they", poss: "their", obj: "them", wire: "" };

function pronounsFor(relation: string): Pronouns {
  const r = relation.toLowerCase();
  if (/^(girlfriend|wife|fianc[ée]e|sister)$/.test(r)) return SHE;
  if (/^(boyfriend|husband|fianc[ée]|brother)$/.test(r)) return HE;
  return THEY;
}

const PARTNER_RELATIONS = [
  "Girlfriend",
  "Boyfriend",
  "Wife",
  "Husband",
  "Fiancée",
  "Fiancé",
  "Crush",
  "Partner",
  "Bestie",
];
const FRIEND_RELATIONS = [
  "Bestie",
  "Best friend",
  "Friend",
  "Sister",
  "Brother",
  "Cousin",
  "Partner",
];

const SINCE_CHIPS = [
  "Just started",
  "Under a year",
  "1–2 years",
  "3–5 years",
  "5+ years",
  "Forever",
];

const OCCASIONS = [
  "Birthday",
  "Anniversary",
  "Valentine's",
  "Just because",
  "Saying sorry",
  "Missing you",
  "Proposal",
];

function loveChips(p: Pronouns): string[] {
  return [
    `${p.poss} smile`,
    `${p.poss} laugh`,
    `${p.poss} hugs`,
    `${p.poss} caring nature`,
    `${p.poss} terrible jokes`,
    `${p.poss} good-morning texts`,
    `${p.poss} patience with me`,
    `${p.poss} late-night calls`,
    `${p.poss} cooking`,
    `${p.poss} dance moves`,
  ];
}

const TONES: {
  value: GuidedTone;
  label: string;
  blurb: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "cute",
    label: "Cute",
    blurb: "Soft, sweet, a little teasing",
    icon: <Heart size={18} />,
  },
  {
    value: "funny",
    label: "Funny",
    blurb: "Roast them, lovingly",
    icon: <Laugh size={18} />,
  },
  {
    value: "emotional",
    label: "Emotional",
    blurb: "Make them tear up",
    icon: <HeartHandshake size={18} />,
  },
  {
    value: "filmy",
    label: "Filmy",
    blurb: "Full Bollywood drama",
    icon: <Clapperboard size={18} />,
  },
];

const LANGUAGES: { value: GuidedLanguage; label: string; hint: string }[] = [
  { value: "en", label: "English", hint: "Aa" },
  { value: "hi-Latn", label: "Hinglish", hint: "Tum" },
  { value: "hi", label: "हिंदी", hint: "अ" },
];

const LANGUAGE_NAME: Record<GuidedLanguage, string> = {
  en: "English",
  "hi-Latn": "Hinglish",
  hi: "Hindi",
};

function listJoin(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

const clean = (v: string) => v.replace(/\s+/g, " ").trim();
const sentence = (v: string) => {
  const s = clean(v);
  return s && !/[.!?…]$/.test(s) ? `${s}.` : s;
};

/**
 * The story the model reads. Plain first-person prose, one fact per line, so
 * the model treats each as the sender's own words rather than a form dump.
 * Exported for tests and for anything that wants to preview it.
 */
export function composeGuidedStory(
  a: GuidedAnswers,
  audience: WireSchema["audience"],
): string {
  const p = pronounsFor(a.relation);
  const them = clean(a.theirName) || "them";
  const lines: string[] = [];
  const rel = clean(a.relation).toLowerCase();

  lines.push(
    rel ? `This page is for ${them}, my ${rel}.` : `This page is for ${them}.`,
    clean(a.yourName) ? `I'm ${clean(a.yourName)}.` : "",
  );
  if (clean(a.since)) {
    const s = clean(a.since);
    const together =
      audience === "partner" && !/best|friend|sister|brother|cousin/i.test(rel);
    lines.push(
      /^just started$/i.test(s)
        ? together
          ? "We've only just started — it all still feels new."
          : "We've only just become close."
        : /^forever$/i.test(s)
          ? "We've known each other forever."
          : `${together ? "How long we've been together" : "How long we've known each other"}: ${s}.`,
    );
  }
  if (clean(a.howMet)) lines.push(`How it started: ${sentence(a.howMet)}`);
  if (a.loves.length)
    lines.push(
      `What I love most about ${p.obj}: ${listJoin(a.loves.map(clean))}.`,
    );
  if (clean(a.memory))
    lines.push(`A memory I'll never forget: ${sentence(a.memory)}`);
  if (clean(a.nickname))
    lines.push(`Our nickname / inside joke: ${sentence(a.nickname)}`);
  if (clean(a.occasion)) lines.push(`The occasion: ${clean(a.occasion)}.`);
  if (a.tone) lines.push(`I want it to feel ${a.tone}.`);
  lines.push(`Please write it in ${LANGUAGE_NAME[a.language]}.`);

  return lines.filter(Boolean).join("\n").slice(0, STORY_LIMITS.story);
}

// ═══════════════════════════════════════════════════════════════════════════
// Small pieces
// ═══════════════════════════════════════════════════════════════════════════

const STEP_COUNT = 6;

function Chip({
  selected,
  onClick,
  children,
  reduce,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  reduce: boolean;
}) {
  return (
    <motion.button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      whileTap={reduce ? undefined : { scale: 0.95 }}
      className="inline-flex items-center"
      style={{
        gap: 6,
        minHeight: TAP,
        padding: "0 15px",
        borderRadius: 999,
        fontFamily: STORY_UI.font,
        fontSize: 14.5,
        color: selected ? STORY_UI.paper : STORY_UI.ink,
        background: selected ? STORY_UI.ink : STORY_UI.paper,
        border: `1px solid ${selected ? STORY_UI.ink : STORY_UI.edge}`,
        boxShadow: selected ? "0 4px 12px rgba(43,38,32,0.16)" : "none",
        cursor: "pointer",
        transition:
          "background .18s ease, color .18s ease, border-color .18s ease",
        textTransform: "none",
      }}
    >
      {selected && <Check size={14} aria-hidden="true" />}
      {children}
    </motion.button>
  );
}

function FieldLabel({
  htmlFor,
  children,
  optional,
}: {
  htmlFor: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      style={{
        display: "block",
        fontFamily: STORY_UI.font,
        fontSize: 13,
        color: STORY_UI.inkSoft,
        marginBottom: 6,
      }}
    >
      {children}
      {optional && (
        <span style={{ color: STORY_UI.inkFaint }}> · optional</span>
      )}
    </label>
  );
}

function GroupLabel({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <p
      id={id}
      style={{
        fontFamily: STORY_UI.font,
        fontSize: 13,
        color: STORY_UI.inkSoft,
        marginBottom: 8,
      }}
    >
      {children}
    </p>
  );
}

const bigInput: React.CSSProperties = {
  ...inputStyle,
  minHeight: 52,
  borderRadius: 14,
  fontSize: 17,
  padding: "0 16px",
};

/** The screen shown while the model writes — something to watch, not a spinner. */
function Writing({
  name,
  memory,
  reduce,
}: {
  name: string;
  memory: string;
  reduce: boolean;
}) {
  const lines = useMemo(() => {
    const m = clean(memory)
      .split(/[.,!?]/)[0]
      ?.slice(0, 42);
    return [
      "Reading your answers…",
      m ? `Remembering "${m}"…` : `Thinking about ${name || "them"}…`,
      `Finding the right words for ${name || "them"}…`,
      "Writing every line of your page…",
      "Almost there…",
    ];
  }, [name, memory]);
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = window.setInterval(
      () => setI((n) => Math.min(n + 1, lines.length - 1)),
      2200,
    );
    return () => window.clearInterval(t);
  }, [lines.length]);

  return (
    <div
      className="flex flex-col items-center text-center"
      style={{ padding: "28px 8px 18px", gap: 18 }}
      role="status"
      aria-live="polite"
    >
      <div
        style={{ position: "relative", width: 84, height: 84 }}
        aria-hidden="true"
      >
        <motion.div
          animate={
            reduce
              ? undefined
              : { scale: [1, 1.12, 1], opacity: [0.35, 0.12, 0.35] }
          }
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: STORY_UI.accent,
            opacity: 0.25,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 12,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            background: STORY_UI.ink,
            color: STORY_UI.paper,
          }}
        >
          <motion.span
            animate={
              reduce
                ? undefined
                : { rotate: [0, 12, -8, 0], scale: [1, 1.1, 1] }
            }
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            style={{ display: "grid" }}
          >
            <Sparkles size={26} />
          </motion.span>
        </div>
      </div>
      <div style={{ minHeight: 52 }}>
        <AnimatePresence mode="wait">
          <motion.p
            key={i}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            style={{
              fontFamily: STORY_UI.serif,
              fontSize: 20,
              lineHeight: 1.35,
              color: STORY_UI.ink,
            }}
          >
            {lines[i]}
          </motion.p>
        </AnimatePresence>
        <p
          style={{
            fontFamily: STORY_UI.font,
            fontSize: 12.5,
            color: STORY_UI.inkFaint,
            marginTop: 6,
          }}
        >
          Usually just a few seconds. You can change every word afterwards.
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// The flow
// ═══════════════════════════════════════════════════════════════════════════

export interface GuidedQuestionsProps {
  slug: string;
  audience: WireSchema["audience"];
  /** Names already known (profile, earlier composer), used only when no answers are saved. */
  knownPeople: StoryPeople;
  generating: boolean;
  error: string | null;
  onGenerate: (input: {
    people: StoryPeople;
    story: string;
    hints: {
      relation?: string;
      tone?: string;
      language?: string;
      occasion?: string;
    };
  }) => void;
  /** "Write it my way instead" — the free-text composer. */
  onFreeText: () => void;
  /** Straight into the form. */
  onSkip: () => void;
  /** Rendered above the first question, e.g. the "Use my story" hero. */
  topSlot?: React.ReactNode;
}

export default function GuidedQuestions({
  slug,
  audience,
  knownPeople,
  generating,
  error,
  onGenerate,
  onFreeText,
  onSkip,
  topSlot,
}: GuidedQuestionsProps) {
  const reduce = Boolean(useReducedMotion());
  const uid = useId();

  // Only ever mounted client-side (the sheet opens after the schema fetch), so
  // reading storage in the initialisers cannot mismatch a server render.
  const [restored] = useState(() => readAnswers());
  const [answers, setAnswers] = useState<GuidedAnswers>(() => {
    if (restored) return restored;
    const recipient =
      audience === "partner"
        ? knownPeople.partnerName
        : knownPeople.bestFriendName;
    return {
      ...EMPTY_ANSWERS,
      theirName: recipient || "",
      yourName: knownPeople.userName || "",
    };
  });
  const [step, setStep] = useState(() => readStep(slug));
  const [dir, setDir] = useState(1);
  const [loveDraft, setLoveDraft] = useState("");
  const [nameNudge, setNameNudge] = useState(false);
  const [showRemembered, setShowRemembered] = useState(() =>
    Boolean(restored && hasAnyAnswer(restored)),
  );

  useEffect(() => {
    try {
      sessionStorage.setItem(ANSWERS_KEY, JSON.stringify(answers));
    } catch {
      /* private mode — the flow still works, it just won't survive a refresh */
    }
  }, [answers]);
  useEffect(() => {
    try {
      sessionStorage.setItem(stepKey(slug), String(step));
    } catch {
      /* see above */
    }
  }, [slug, step]);

  // Move focus to the new question so screen readers announce it — but not on
  // first mount, where it would yank focus from the dialog's own first control.
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const moved = useRef(false);
  useEffect(() => {
    if (!moved.current) return;
    headingRef.current?.focus({ preventScroll: true });
  }, [step]);

  const set = useCallback(
    <K extends keyof GuidedAnswers>(key: K, value: GuidedAnswers[K]) => {
      setAnswers((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const p = pronounsFor(answers.relation);
  const them = clean(answers.theirName);
  const themOr = them || (p === THEY ? "them" : p.obj);
  const relations =
    audience === "partner" ? PARTNER_RELATIONS : FRIEND_RELATIONS;
  const presetRelation = relations.includes(answers.relation);
  const [otherOpen, setOtherOpen] = useState(() =>
    Boolean(answers.relation && !presetRelation),
  );

  const namesOk = Boolean(them && clean(answers.yourName));

  const go = (to: number) => {
    moved.current = true;
    setDir(to > step ? 1 : -1);
    setStep(Math.max(0, Math.min(STEP_COUNT - 1, to)));
  };

  const next = () => {
    if (step === 0 && !namesOk) {
      setNameNudge(true);
      return;
    }
    go(step + 1);
  };

  const submit = () => {
    if (!namesOk) {
      go(0);
      setNameNudge(true);
      return;
    }
    const recipientKey =
      audience === "partner" ? "partnerName" : "bestFriendName";
    const people: StoryPeople = {
      userName: clean(answers.yourName).slice(0, STORY_LIMITS.name),
      partnerName: "",
      bestFriendName: "",
      partnerPronouns: pronounsFor(answers.relation).wire,
      [recipientKey]: them.slice(0, STORY_LIMITS.name),
    };
    onGenerate({
      people,
      story: composeGuidedStory(answers, audience),
      hints: {
        relation: clean(answers.relation).toLowerCase() || undefined,
        tone: answers.tone || undefined,
        language: answers.language,
        occasion: clean(answers.occasion) || undefined,
      },
    });
  };

  const toggleLove = (v: string) => {
    setAnswers((prev) => {
      const has = prev.loves.includes(v);
      const loves = has
        ? prev.loves.filter((l) => l !== v)
        : [...prev.loves, v].slice(0, 6);
      return { ...prev, loves };
    });
  };
  const addLove = () => {
    const v = clean(loveDraft).slice(0, 60);
    if (!v) return;
    if (!answers.loves.includes(v)) toggleLove(v);
    setLoveDraft("");
  };

  const startFresh = () => {
    setAnswers({ ...EMPTY_ANSWERS });
    setOtherOpen(false);
    setShowRemembered(false);
    go(0);
  };

  const onEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      next();
    }
  };

  if (generating)
    return <Writing name={them} memory={answers.memory} reduce={reduce} />;

  const QUESTIONS = [
    {
      q: "Who's this page for?",
      sub: "Just the names — everything else is optional.",
    },
    {
      q: them ? `What's ${them} to you?` : "What are they to you?",
      sub: "Tap one — it sets how the page talks to them.",
    },
    {
      q: "How did it all start?",
      sub: "A line is plenty. Where, when, who texted first.",
    },
    {
      q: `What do you love about ${themOr}?`,
      sub: "Pick a few, or add your own — the small things work best.",
    },
    {
      q: "One memory you'll never forget",
      sub: "The more specific, the better the page.",
    },
    {
      q: "How should it feel?",
      sub: "Pick a vibe and a language.",
    },
  ];
  const current = QUESTIONS[step];
  const isLast = step === STEP_COUNT - 1;

  const slide = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, x: dir * 28 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: dir * -28 },
      };

  return (
    <div className="flex flex-col" style={{ gap: 16 }}>
      {/* ── Progress + back/skip ── */}
      <div className="flex items-center" style={{ gap: 8, marginTop: -6 }}>
        <button
          type="button"
          onClick={() => go(step - 1)}
          aria-label="Previous question"
          disabled={step === 0}
          style={{
            minWidth: TAP,
            minHeight: TAP,
            marginLeft: -12,
            display: "grid",
            placeItems: "center",
            background: "transparent",
            border: "none",
            color: STORY_UI.inkSoft,
            cursor: step === 0 ? "default" : "pointer",
            visibility: step === 0 ? "hidden" : "visible",
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <div
          className="flex flex-1 items-center justify-center"
          style={{ gap: 6 }}
          aria-hidden="true"
        >
          {Array.from({ length: STEP_COUNT }, (_, i) => (
            <motion.span
              key={i}
              animate={{
                width: i === step ? 22 : 7,
                opacity: i <= step ? 1 : 0.35,
              }}
              transition={
                reduce
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 380, damping: 30 }
              }
              style={{
                height: 7,
                borderRadius: 99,
                background: i <= step ? STORY_UI.accent : STORY_UI.inkFaint,
                display: "block",
              }}
            />
          ))}
        </div>
        <span
          className="sr-only"
          aria-live="polite"
        >{`Question ${step + 1} of ${STEP_COUNT}`}</span>
        <button
          type="button"
          onClick={() => go(step + 1)}
          style={{
            minWidth: TAP,
            minHeight: TAP,
            marginRight: -8,
            padding: "0 8px",
            background: "transparent",
            border: "none",
            fontFamily: STORY_UI.font,
            fontSize: 13.5,
            color: STORY_UI.inkSoft,
            cursor: "pointer",
            visibility: step === 0 || isLast ? "hidden" : "visible",
          }}
        >
          Skip
        </button>
      </div>

      {step === 0 && topSlot}

      {/* A floor on the question area so the bottom sheet's top edge does not
          jump on every step — the sheet is bottom-anchored and sizes to content. */}
      <div style={{ minHeight: step === 0 && topSlot ? 0 : 330 }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            {...slide}
            transition={{
              duration: reduce ? 0.15 : 0.24,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="flex flex-col"
            style={{ gap: 16 }}
          >
            <div>
              <h3
                ref={headingRef}
                tabIndex={-1}
                style={{
                  fontFamily: STORY_UI.serif,
                  fontSize: 25,
                  lineHeight: 1.22,
                  color: STORY_UI.ink,
                  outline: "none",
                }}
              >
                {current.q}
              </h3>
              <p
                style={{
                  fontFamily: STORY_UI.font,
                  fontSize: 13.5,
                  color: STORY_UI.inkSoft,
                  marginTop: 5,
                }}
              >
                {current.sub}
              </p>
            </div>

            {/* ── 1. Names ── */}
            {step === 0 && (
              <>
                <div>
                  <FieldLabel htmlFor={`${uid}-their`}>Their name</FieldLabel>
                  <input
                    id={`${uid}-their`}
                    value={answers.theirName}
                    onChange={(e) =>
                      set(
                        "theirName",
                        e.target.value.slice(0, STORY_LIMITS.name),
                      )
                    }
                    onKeyDown={onEnter}
                    placeholder={
                      audience === "partner" ? "e.g. Meera" : "e.g. Ananya"
                    }
                    autoComplete="off"
                    enterKeyHint="next"
                    aria-invalid={nameNudge && !them ? true : undefined}
                    style={{
                      ...bigInput,
                      borderColor:
                        nameNudge && !them ? STORY_UI.danger : STORY_UI.edge,
                    }}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor={`${uid}-you`}>Your name</FieldLabel>
                  <input
                    id={`${uid}-you`}
                    value={answers.yourName}
                    onChange={(e) =>
                      set(
                        "yourName",
                        e.target.value.slice(0, STORY_LIMITS.name),
                      )
                    }
                    onKeyDown={onEnter}
                    placeholder="e.g. Rohan"
                    autoComplete="given-name"
                    enterKeyHint="next"
                    aria-invalid={
                      nameNudge && !clean(answers.yourName) ? true : undefined
                    }
                    style={{
                      ...bigInput,
                      borderColor:
                        nameNudge && !clean(answers.yourName)
                          ? STORY_UI.danger
                          : STORY_UI.edge,
                    }}
                  />
                </div>
                <div aria-live="polite">
                  {nameNudge && !namesOk && (
                    <p
                      style={{
                        fontFamily: STORY_UI.font,
                        fontSize: 13,
                        color: STORY_UI.danger,
                      }}
                    >
                      Both names, please — that&apos;s the only thing we need.
                    </p>
                  )}
                </div>
                {showRemembered && (
                  <p
                    style={{
                      fontFamily: STORY_UI.font,
                      fontSize: 12.5,
                      color: STORY_UI.inkFaint,
                      marginTop: -6,
                    }}
                  >
                    We kept your answers from earlier.{" "}
                    <button
                      type="button"
                      onClick={startFresh}
                      style={{
                        minHeight: 32,
                        background: "transparent",
                        border: "none",
                        padding: 0,
                        color: STORY_UI.accent,
                        textDecoration: "underline",
                        textUnderlineOffset: 3,
                        fontFamily: STORY_UI.font,
                        fontSize: 12.5,
                        cursor: "pointer",
                      }}
                    >
                      Start fresh
                    </button>
                  </p>
                )}
              </>
            )}

            {/* ── 2. Relation + how long ── */}
            {step === 1 && (
              <>
                <div role="group" aria-labelledby={`${uid}-rel`}>
                  <GroupLabel id={`${uid}-rel`}>
                    {them ? `${them} is your…` : "They're your…"}
                  </GroupLabel>
                  <div className="flex flex-wrap" style={{ gap: 8 }}>
                    {relations.map((r) => (
                      <Chip
                        key={r}
                        reduce={reduce}
                        selected={answers.relation === r}
                        onClick={() => {
                          setOtherOpen(false);
                          set("relation", answers.relation === r ? "" : r);
                        }}
                      >
                        {r}
                      </Chip>
                    ))}
                    <Chip
                      reduce={reduce}
                      selected={otherOpen}
                      onClick={() => {
                        setOtherOpen((o) => !o);
                        if (presetRelation) set("relation", "");
                      }}
                    >
                      Other
                    </Chip>
                  </div>
                  {otherOpen && (
                    <input
                      aria-label="Your relation, in your words"
                      value={presetRelation ? "" : answers.relation}
                      onChange={(e) =>
                        set("relation", e.target.value.slice(0, 40))
                      }
                      onKeyDown={onEnter}
                      placeholder="e.g. wife-to-be, long-distance love"
                      autoFocus
                      style={{ ...inputStyle, marginTop: 10 }}
                    />
                  )}
                </div>
                <div role="group" aria-labelledby={`${uid}-since`}>
                  <GroupLabel id={`${uid}-since`}>
                    {audience === "partner"
                      ? "How long have you been together?"
                      : "How long have you known each other?"}
                  </GroupLabel>
                  <div className="flex flex-wrap" style={{ gap: 8 }}>
                    {SINCE_CHIPS.map((s) => (
                      <Chip
                        key={s}
                        reduce={reduce}
                        selected={answers.since === s}
                        onClick={() =>
                          set("since", answers.since === s ? "" : s)
                        }
                      >
                        {s}
                      </Chip>
                    ))}
                  </div>
                  <input
                    aria-label="Or since when, in your words"
                    value={
                      SINCE_CHIPS.includes(answers.since) ? "" : answers.since
                    }
                    onChange={(e) => set("since", e.target.value.slice(0, 60))}
                    onKeyDown={onEnter}
                    placeholder="…or since when? e.g. March 2021"
                    style={{ ...inputStyle, marginTop: 10 }}
                  />
                </div>
              </>
            )}

            {/* ── 3. How you met + nickname ── */}
            {step === 2 && (
              <>
                <div>
                  <FieldLabel htmlFor={`${uid}-met`} optional>
                    How you met
                  </FieldLabel>
                  <textarea
                    id={`${uid}-met`}
                    value={answers.howMet}
                    onChange={(e) =>
                      set("howMet", e.target.value.slice(0, 300))
                    }
                    placeholder="e.g. Same coaching class in Kota — I borrowed her notes and never gave them back."
                    rows={3}
                    style={{ ...areaStyle, minHeight: 96 }}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor={`${uid}-nick`} optional>
                    A nickname or inside joke
                  </FieldLabel>
                  <input
                    id={`${uid}-nick`}
                    value={answers.nickname}
                    onChange={(e) =>
                      set("nickname", e.target.value.slice(0, 120))
                    }
                    onKeyDown={onEnter}
                    placeholder="e.g. I call her Potato · the 'one more episode' lie"
                    autoComplete="off"
                    style={inputStyle}
                  />
                </div>
              </>
            )}

            {/* ── 4. Things you love ── */}
            {step === 3 && (
              <div role="group" aria-labelledby={`${uid}-love`}>
                <GroupLabel id={`${uid}-love`}>
                  {answers.loves.length
                    ? `${answers.loves.length} picked`
                    : "Tap any that are true"}
                </GroupLabel>
                <div className="flex flex-wrap" style={{ gap: 8 }}>
                  {[...new Set([...loveChips(p), ...answers.loves])].map(
                    (l) => (
                      <Chip
                        key={l}
                        reduce={reduce}
                        selected={answers.loves.includes(l)}
                        onClick={() => toggleLove(l)}
                      >
                        {l}
                      </Chip>
                    ),
                  )}
                </div>
                <div className="flex" style={{ gap: 8, marginTop: 12 }}>
                  <input
                    aria-label="Add your own thing you love"
                    value={loveDraft}
                    onChange={(e) => setLoveDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                        e.preventDefault();
                        if (clean(loveDraft)) addLove();
                        else next();
                      }
                    }}
                    placeholder={`Add your own — e.g. how ${p.subj} ${p === THEY ? "hum" : "hums"} while cooking`}
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={addLove}
                    aria-label="Add"
                    disabled={!clean(loveDraft)}
                    style={{
                      minWidth: TAP,
                      minHeight: TAP,
                      borderRadius: 11,
                      display: "grid",
                      placeItems: "center",
                      background: clean(loveDraft)
                        ? STORY_UI.accent
                        : STORY_UI.paper,
                      color: clean(loveDraft)
                        ? STORY_UI.paper
                        : STORY_UI.inkFaint,
                      border: `1px solid ${clean(loveDraft) ? STORY_UI.accent : STORY_UI.edge}`,
                      cursor: clean(loveDraft) ? "pointer" : "default",
                    }}
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* ── 5. Memory + occasion ── */}
            {step === 4 && (
              <>
                <div>
                  <FieldLabel htmlFor={`${uid}-mem`} optional>
                    Your favourite memory together
                  </FieldLabel>
                  <textarea
                    id={`${uid}-mem`}
                    value={answers.memory}
                    onChange={(e) =>
                      set("memory", e.target.value.slice(0, 500))
                    }
                    placeholder="e.g. Getting stuck in the rain at Marine Drive and sharing one vada pav for dinner."
                    rows={4}
                    style={{ ...areaStyle, minHeight: 116 }}
                  />
                </div>
                <div role="group" aria-labelledby={`${uid}-occ`}>
                  <GroupLabel id={`${uid}-occ`}>
                    Any occasion?{" "}
                    <span style={{ color: STORY_UI.inkFaint }}>· optional</span>
                  </GroupLabel>
                  <div className="flex flex-wrap" style={{ gap: 8 }}>
                    {OCCASIONS.map((o) => (
                      <Chip
                        key={o}
                        reduce={reduce}
                        selected={answers.occasion === o}
                        onClick={() =>
                          set("occasion", answers.occasion === o ? "" : o)
                        }
                      >
                        {o}
                      </Chip>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ── 6. Tone + language ── */}
            {step === 5 && (
              <>
                <div role="radiogroup" aria-labelledby={`${uid}-tone`}>
                  <GroupLabel id={`${uid}-tone`}>The vibe</GroupLabel>
                  <div className="grid grid-cols-2" style={{ gap: 8 }}>
                    {TONES.map((t) => {
                      const on = answers.tone === t.value;
                      return (
                        <motion.button
                          key={t.value}
                          type="button"
                          role="radio"
                          aria-checked={on}
                          whileTap={reduce ? undefined : { scale: 0.97 }}
                          onClick={() => set("tone", on ? "" : t.value)}
                          className="flex flex-col items-start text-left"
                          style={{
                            gap: 4,
                            minHeight: 78,
                            padding: "12px 13px",
                            borderRadius: 16,
                            fontFamily: STORY_UI.font,
                            color: on ? STORY_UI.paper : STORY_UI.ink,
                            background: on ? STORY_UI.ink : STORY_UI.paper,
                            border: `1px solid ${on ? STORY_UI.ink : STORY_UI.edge}`,
                            boxShadow: on
                              ? "0 6px 16px rgba(43,38,32,0.18)"
                              : "none",
                            cursor: "pointer",
                            transition: "background .18s ease, color .18s ease",
                          }}
                        >
                          <span
                            aria-hidden="true"
                            style={{
                              color: on ? STORY_UI.accentWash : STORY_UI.accent,
                              display: "grid",
                            }}
                          >
                            {t.icon}
                          </span>
                          <span style={{ fontSize: 15.5 }}>{t.label}</span>
                          <span
                            style={{
                              fontSize: 12,
                              lineHeight: 1.35,
                              color: on
                                ? "rgba(250,247,240,0.75)"
                                : STORY_UI.inkFaint,
                            }}
                          >
                            {t.blurb}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
                <div role="radiogroup" aria-labelledby={`${uid}-lang`}>
                  <GroupLabel id={`${uid}-lang`}>Write it in</GroupLabel>
                  <div
                    className="grid grid-cols-3"
                    style={{
                      gap: 4,
                      padding: 4,
                      borderRadius: 14,
                      background: STORY_UI.paper,
                      border: `1px solid ${STORY_UI.edge}`,
                    }}
                  >
                    {LANGUAGES.map((l) => {
                      const on = answers.language === l.value;
                      return (
                        <button
                          key={l.value}
                          type="button"
                          role="radio"
                          aria-checked={on}
                          onClick={() => set("language", l.value)}
                          style={{
                            minHeight: TAP,
                            borderRadius: 10,
                            fontFamily: STORY_UI.font,
                            fontSize: 14.5,
                            color: on ? STORY_UI.paper : STORY_UI.ink,
                            background: on ? STORY_UI.accent : "transparent",
                            border: "none",
                            cursor: "pointer",
                            transition: "background .18s ease, color .18s ease",
                          }}
                        >
                          {l.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Status ── */}
      <div aria-live="polite" aria-atomic="true">
        {isLast && error && (
          <p
            style={{
              fontFamily: STORY_UI.font,
              fontSize: 13,
              lineHeight: 1.5,
              color: STORY_UI.danger,
            }}
          >
            {error}
            {!/yourself/i.test(error) && " You can also fill it in yourself."}
          </p>
        )}
      </div>

      {/* ── Forward ── */}
      <motion.button
        type="button"
        onClick={isLast ? submit : next}
        whileTap={reduce ? undefined : { scale: 0.98 }}
        className="flex items-center justify-center"
        style={{
          gap: 8,
          minHeight: 54,
          borderRadius: 16,
          fontFamily: STORY_UI.font,
          fontSize: 16,
          color: STORY_UI.paper,
          background: isLast
            ? `linear-gradient(135deg, ${STORY_UI.ink}, #4a3a2a)`
            : STORY_UI.ink,
          border: "none",
          boxShadow: isLast ? "0 10px 24px rgba(43,38,32,0.25)" : "none",
          opacity: step === 0 && !namesOk ? 0.55 : 1,
          cursor: "pointer",
        }}
      >
        {isLast ? (
          <>
            <Sparkles size={17} aria-hidden="true" />
            {them ? `Write ${them}'s page` : "Write my page"}
          </>
        ) : (
          <>
            Continue
            <ArrowRight size={17} aria-hidden="true" />
          </>
        )}
      </motion.button>

      {/* ── The other doors ── always here, never louder than the flow. */}
      <div
        className="flex flex-wrap items-center justify-center"
        style={{ gap: 4, marginTop: -4 }}
      >
        <button type="button" onClick={onFreeText} style={linkStyle}>
          Write it my way instead
        </button>
        <span aria-hidden="true" style={{ color: STORY_UI.inkFaint }}>
          ·
        </span>
        <button type="button" onClick={onSkip} style={linkStyle}>
          I&apos;ll fill it in myself
        </button>
      </div>
    </div>
  );
}

const linkStyle: React.CSSProperties = {
  minHeight: TAP,
  padding: "0 8px",
  background: "transparent",
  border: "none",
  fontFamily: STORY_UI.font,
  fontSize: 13,
  color: STORY_UI.inkSoft,
  textDecoration: "underline",
  textUnderlineOffset: 3,
  cursor: "pointer",
};
