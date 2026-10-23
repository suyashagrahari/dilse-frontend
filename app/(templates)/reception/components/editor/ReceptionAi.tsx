"use client";

// ─── "Let AI write it": a few wedding questions → the whole form → review ────
//
// One question per screen (names · when & where · the evening · families ·
// how you met · tone & language · who to call). The answers become a plain
// story (composeReceptionStory) and go to the shared AI fill with hints; the
// shared review screen (StoryReview) then lists every field it wrote, each
// editable in place, with the still-empty ones flagged. "Looks good" opens
// the form on step 1.
//
// Answers are kept for the tab under ss:guided-wedding:v1 (the wedding
// question set's key), so the next wedding template starts pre-filled.

import { useEffect, useId, useState } from "react";
import StoryReview from "@/components/story/StoryReview";
import type { ReceptionEditor } from "../../hooks/useReceptionEditor";

const KEY = "ss:guided-wedding:v1";

export interface WeddingAnswers {
  bride: string;
  groom: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  functions: string[];
  extra: string;
  brideParents: string;
  groomParents: string;
  blessingsOf: string;
  howMet: string;
  tone: string;
  language: "English" | "Hindi" | "Hinglish";
  contactName: string;
  contactPhone: string;
}

const EMPTY: WeddingAnswers = {
  bride: "",
  groom: "",
  date: "",
  time: "",
  venue: "",
  city: "",
  functions: ["Wedding Reception"],
  extra: "",
  brideParents: "",
  groomParents: "",
  blessingsOf: "",
  howMet: "",
  tone: "Elegant",
  language: "English",
  contactName: "",
  contactPhone: "",
};

const PARTS = ["Wedding Reception", "Cocktails", "Dinner & Toasts", "After-party", "Sangeet Night", "Ring Ceremony", "Brunch"];
const TONES = ["Elegant", "Glamorous", "Warm & simple", "Traditional", "Fun"];
const LANGS: WeddingAnswers["language"][] = ["English", "Hindi", "Hinglish"];
/** The server's language hint codes (storyFill.controller): Hinglish is Hindi in Latin script. */
// Always "en": the page is English with its own Hindi field (always Devanagari). A "hi" or
// "hi-Latn" hint would turn EVERY field Devanagari or romanised, the Hindi field included.
const LANG_CODE: Record<WeddingAnswers["language"], string> = { English: "en", Hindi: "en", Hinglish: "en" };

function load(): WeddingAnswers {
  try {
    const v = JSON.parse(sessionStorage.getItem(KEY) || "null") as Partial<WeddingAnswers> | null;
    if (!v || typeof v !== "object") return EMPTY;
    const s = (x: unknown) => (typeof x === "string" ? x.slice(0, 400) : "");
    return {
      ...EMPTY,
      bride: s(v.bride),
      groom: s(v.groom),
      date: /^\d{4}-\d{2}-\d{2}$/.test(s(v.date)) ? s(v.date) : "",
      time: /^\d{2}:\d{2}$/.test(s(v.time)) ? s(v.time) : "",
      venue: s(v.venue),
      city: s(v.city),
      // Another wedding template's functions (Haldi, Pheras…) are not this evening's parts.
      functions: Array.isArray(v.functions) ? v.functions.filter((f): f is string => typeof f === "string" && PARTS.includes(f)) : EMPTY.functions,
      brideParents: s(v.brideParents),
      groomParents: s(v.groomParents),
      blessingsOf: s(v.blessingsOf),
      howMet: s(v.howMet),
      tone: TONES.includes(s(v.tone)) ? s(v.tone) : EMPTY.tone,
      language: LANGS.includes(v.language as WeddingAnswers["language"]) ? (v.language as WeddingAnswers["language"]) : "English",
      contactName: s(v.contactName),
      contactPhone: s(v.contactPhone),
    };
  } catch {
    return EMPTY;
  }
}

const clean = (s: string) => s.replace(/\s+/g, " ").trim();
const sentence = (s: string) => {
  const c = clean(s);
  return c && !/[.!?]$/.test(c) ? `${c}.` : c;
};

function longDate(d: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return "";
  const [y, m, day] = d.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, day)).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}
function clock(t: string): string {
  if (!/^\d{2}:\d{2}$/.test(t)) return "";
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`;
}

/** The answers as a plain story the shared AI fill understands. Deterministic. */
export function composeReceptionStory(a: WeddingAnswers): string {
  const lines: string[] = [];
  lines.push(`This is the wedding reception invitation of ${clean(a.bride) || "the bride"} (the bride) and ${clean(a.groom) || "the groom"} (the groom).`);
  if (longDate(a.date)) lines.push(`The celebration is on ${longDate(a.date)}.`);
  if (clock(a.time)) lines.push(`The evening starts at ${clock(a.time)} (the first part below starts then).`);
  const where = [clean(a.venue), clean(a.city)].filter(Boolean).join(", ");
  if (where) lines.push(`It is at ${where}.`);
  const parts = a.functions.length ? a.functions : ["Wedding Reception"];
  lines.push(`The evening has these parts, in this order: ${parts.join(", ")}.`);
  if (clean(a.extra)) lines.push(`About the evening: ${sentence(a.extra)}`);
  if (clean(a.brideParents)) lines.push(`The bride's parents are ${clean(a.brideParents)}.`);
  if (clean(a.groomParents)) lines.push(`The groom's parents are ${clean(a.groomParents)}.`);
  if (clean(a.blessingsOf)) lines.push(`With the blessings of ${clean(a.blessingsOf)}.`);
  if (clean(a.howMet)) lines.push(`How they met and their story: ${sentence(a.howMet)}`);
  if (clean(a.contactName) && clean(a.contactPhone)) lines.push(`For any questions guests can call ${clean(a.contactName)} on ${clean(a.contactPhone)}.`);
  lines.push(`I want it to feel ${a.tone.toLowerCase()}.`);
  if (a.language === "Hindi") lines.push("Our families prefer Hindi: make the Hindi invitation warm and complete; the page opens in Hindi.");
  else if (a.language === "Hinglish") lines.push("A light Hinglish touch is welcome in the story lines.");
  return lines.join("\n").slice(0, 4000);
}

const STEPS = ["names", "when", "evening", "families", "story", "tone", "contact"] as const;

export default function ReceptionAi({ ed }: { ed: ReceptionEditor }) {
  const { fill } = ed;
  const uid = useId();
  const [a, setA] = useState<WeddingAnswers>(EMPTY);
  const [i, setI] = useState(-1);
  useEffect(() => {
    const v = load();
    // Session answers (and names typed on a guest's page) prefill the questions.
    setA({ ...v, bride: v.bride || "", groom: v.groom || "" });
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(a));
    } catch {}
  }, [a]);

  const set = (p: Partial<WeddingAnswers>) => setA((x) => ({ ...x, ...p }));
  const step = STEPS[i];
  const namesOk = !!clean(a.bride) && !!clean(a.groom);
  const done = fill.mode === "done";

  const generate = () => {
    const story = composeReceptionStory(a);
    // A Hindi invitation opens in Hindi.
    ed.patchMf({ lang: a.language === "Hindi" ? "hi" : "en" });
    fill.generateGuided({
      people: { userName: clean(a.groom), partnerName: "", bestFriendName: clean(a.bride), partnerPronouns: "" },
      story,
      hints: { tone: a.tone, language: LANG_CODE[a.language], occasion: "wedding reception" },
    });
  };

  const next = () => {
    if (i === STEPS.length - 1) return generate();
    setI(i + 1);
  };

  const field = (label: string, v: string, on: (v: string) => void, o: { type?: string; placeholder?: string; max?: number; required?: boolean; inputMode?: "tel" | "text" } = {}) => (
    <label className="rc-ai-field">
      <span>
        {label}
        {o.required && <b aria-hidden> *</b>}
      </span>
      <input type={o.type ?? "text"} value={v} placeholder={o.placeholder} maxLength={o.max ?? 80} inputMode={o.inputMode} onChange={(e) => on(e.target.value)} />
    </label>
  );

  return (
    <div className="rc-ai" role="dialog" aria-modal="true" aria-labelledby={`${uid}-t`}>
      <div className="rc-ai-sheet">
        <header className="rc-ai-top">
          <p className="rc-ai-k">✦ Write it with AI</p>
          <button type="button" className="rc-ai-x" onClick={ed.startManual} aria-label="Close and fill it in myself">
            ✕
          </button>
        </header>

        {done ? (
          <div className="rc-ai-review">
            <h2 id={`${uid}-t`} className="rc-ai-h">Here&apos;s your invitation — check every line</h2>
            <p className="rc-ai-p">Tap any line to change it. Empty ones are listed too, so nothing slips through.</p>
            <StoryReview
              fill={fill}
              onDone={() => {
                ed.setStep(0);
                ed.startManual();
              }}
              onRewrite={() => {
                fill.setMode("idle");
                setI(STEPS.length - 1);
              }}
              rewriteLabel="Change my answers"
            />
          </div>
        ) : fill.generating ? (
          <div className="rc-ai-busy" aria-live="polite">
            <span className="rc-ai-spark" aria-hidden>
              <i />
              <i />
              <i />
            </span>
            <h2 id={`${uid}-t`} className="rc-ai-h">Writing your invitation…</h2>
            <p className="rc-ai-p">The invitation, the evening, your story and the families — about ten seconds.</p>
          </div>
        ) : i < 0 ? (
          <div className="rc-ai-intro">
            <h2 id={`${uid}-t`} className="rc-ai-h">Let&apos;s write your reception invitation</h2>
            <p className="rc-ai-p">A few quick questions — the names, the date, the venue, how you met. Then every section is written for you, and you can change every word.</p>
            <button type="button" className="rc-ed-btn is-gold is-lg is-wide" onClick={() => setI(0)} autoFocus>
              ✦ Answer a few quick questions
            </button>
            <button type="button" className="rc-ed-btn is-ghost is-wide" onClick={ed.startManual}>
              I&apos;ll fill it in myself
            </button>
            <label className="rc-ai-card">
              <input
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => {
                  const files = e.target.files;
                  if (!files?.length) return;
                  void import("../../../dedication/components/mediaUploads").then(({ compressImage }) =>
                    Promise.all(Array.from(files).slice(0, 3).map((f) => compressImage(f, 1600))).then((imgs) => ed.handleCardExtract(imgs)),
                  );
                }}
              />
              <span>{ed.extractLoading ? "Reading your card…" : "Have a printed card? Read it from a photo"}</span>
            </label>
          </div>
        ) : (
          <form
            className="rc-ai-q"
            onSubmit={(e) => {
              e.preventDefault();
              if (step === "names" && !namesOk) return;
              next();
            }}
          >
            <div className="rc-ai-prog" aria-label={`Question ${i + 1} of ${STEPS.length}`}>
              {STEPS.map((s, j) => (
                <i key={s} className={j <= i ? "is-on" : undefined} />
              ))}
            </div>
            {step === "names" && (
              <>
                <h2 id={`${uid}-t`} className="rc-ai-h">Who is getting married?</h2>
                {field("Bride's first name", a.bride, (v) => set({ bride: v }), { placeholder: "Priya", max: 30, required: true })}
                {field("Groom's first name", a.groom, (v) => set({ groom: v }), { placeholder: "Arjun", max: 30, required: true })}
              </>
            )}
            {step === "when" && (
              <>
                <h2 id={`${uid}-t`} className="rc-ai-h">When and where is the reception?</h2>
                <div className="rc-ai-two">
                  {field("Date", a.date, (v) => set({ date: v }), { type: "date" })}
                  {field("Time", a.time, (v) => set({ time: v }), { type: "time" })}
                </div>
                {field("Venue", a.venue, (v) => set({ venue: v }), { placeholder: "The Grand Ballroom, Taj Palace", max: 100 })}
                {field("City", a.city, (v) => set({ city: v }), { placeholder: "Jaipur", max: 60 })}
              </>
            )}
            {step === "evening" && (
              <>
                <h2 id={`${uid}-t`} className="rc-ai-h">What&apos;s happening that evening?</h2>
                <p className="rc-ai-p">Pick every part, in order.</p>
                <div className="rc-ai-chips">
                  {PARTS.map((p) => {
                    const on = a.functions.includes(p);
                    return (
                      <button key={p} type="button" aria-pressed={on} onClick={() => set({ functions: on ? a.functions.filter((x) => x !== p) : [...a.functions, p] })}>
                        {on ? "✓ " : ""}
                        {p}
                      </button>
                    );
                  })}
                </div>
                <label className="rc-ai-field">
                  <span>Anything else? (optional)</span>
                  <textarea rows={2} maxLength={300} value={a.extra} placeholder="Cocktails at 7 on the terrace, dinner at 8:30, black tie…" onChange={(e) => set({ extra: e.target.value })} />
                </label>
              </>
            )}
            {step === "families" && (
              <>
                <h2 id={`${uid}-t`} className="rc-ai-h">Who are the families?</h2>
                {field("Bride's parents", a.brideParents, (v) => set({ brideParents: v }), { placeholder: "Sunita & Rajesh Sharma", max: 120 })}
                {field("Groom's parents", a.groomParents, (v) => set({ groomParents: v }), { placeholder: "Meena & Vikram Verma", max: 120 })}
                {field("With the blessings of (optional)", a.blessingsOf, (v) => set({ blessingsOf: v }), { placeholder: "Grandparents or elders", max: 140 })}
              </>
            )}
            {step === "story" && (
              <>
                <h2 id={`${uid}-t`} className="rc-ai-h">How did you meet?</h2>
                <p className="rc-ai-p">One or two lines, or a memory. It becomes your love story. Optional.</p>
                <label className="rc-ai-field">
                  <span>Your story</span>
                  <textarea rows={4} maxLength={600} value={a.howMet} placeholder="We met at a friend's rooftop party in Delhi in 2019 when it started pouring…" onChange={(e) => set({ howMet: e.target.value })} />
                </label>
              </>
            )}
            {step === "tone" && (
              <>
                <h2 id={`${uid}-t`} className="rc-ai-h">How should it feel?</h2>
                <div className="rc-ai-chips">
                  {TONES.map((t) => (
                    <button key={t} type="button" aria-pressed={a.tone === t} onClick={() => set({ tone: t })}>
                      {t}
                    </button>
                  ))}
                </div>
                <p className="rc-ai-p">Language</p>
                <div className="rc-ai-chips">
                  {LANGS.map((l) => (
                    <button key={l} type="button" aria-pressed={a.language === l} onClick={() => set({ language: l })}>
                      {l}
                    </button>
                  ))}
                </div>
              </>
            )}
            {step === "contact" && (
              <>
                <h2 id={`${uid}-t`} className="rc-ai-h">Who should guests call?</h2>
                <p className="rc-ai-p">A name and number for directions and questions. Optional.</p>
                {field("Name", a.contactName, (v) => set({ contactName: v }), { placeholder: "Rohit (Priya's brother)", max: 60 })}
                {field("Phone", a.contactPhone, (v) => set({ contactPhone: v }), { type: "tel", inputMode: "tel", placeholder: "+91 98290 11223", max: 20 })}
              </>
            )}
            {fill.error && <p className="rc-ed-err" aria-live="polite">{fill.error}</p>}
            <div className="rc-ai-nav">
              <button type="button" className="rc-ed-btn is-ghost" onClick={() => setI(i - 1)}>
                Back
              </button>
              {step !== "names" && i < STEPS.length - 1 && (
                <button type="button" className="rc-ai-skip" onClick={generate}>
                  Write it now
                </button>
              )}
              <button type="submit" className="rc-ed-btn is-gold" disabled={step === "names" && !namesOk}>
                {i === STEPS.length - 1 ? "✦ Write my invitation" : "Next"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
