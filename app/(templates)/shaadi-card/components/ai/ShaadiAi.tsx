"use client";

// ─── "Let AI write it": the wedding questions → the AI → the review ─────────
//
// 1. Choice: answer a few questions (recommended) · read my printed card ·
//    I'll fill it myself.
// 2. Eight short screens, one question each, big inputs (names · date & time ·
//    city & venue · functions with dates · families · how you met · tone &
//    language · who guests should call). Only the names are required. The
//    answers are kept for the session (ss:guided-wedding:v1) so the next
//    wedding template starts pre-filled.
// 3. The answers become a plain-English story (exact names, ISO dates,
//    24-hour times) → useStoryFill.generateGuided. Before the call the form's
//    untouched demo values are blanked (blankForAi), so the model fills every
//    slot the sender has not typed in.
// 4. The review: every field the schema declares, grouped (couple, the day,
//    invitation, families, each function, story, contact), each editable in
//    place; empty ones are marked "Needs you". "Looks good" drops the empty
//    rows (finishAi) and opens the form.

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import StoryFieldRow from "@/components/story/StoryFieldEditor";
import { isFilled } from "@/lib/ai-fill/applyPatch";
import type { WireField } from "@/lib/ai-fill/types";
import { ART, img } from "../assets";
import { QUICK_FUNCTIONS, dialOf, type ShaadiCardData } from "../model";
import type { ShaadiEditor } from "../../hooks/useShaadiCardEditor";
import { afterFill, blankForAi, finishAi } from "../../hooks/useShaadiCardEditor";

const ANSWERS_KEY = "ss:guided-wedding:v1";

interface Answers {
  bride: string;
  groom: string;
  first: "bride" | "groom";
  date: string;
  time: string;
  muhurat: string;
  city: string;
  venue: string;
  functions: { name: string; date: string }[];
  brideParents: string;
  groomParents: string;
  blessingsOf: string;
  howMet: string;
  memory: string;
  tone: string;
  language: "en" | "hi" | "hinglish";
  contactName: string;
  contactRelation: string;
  contactPhone: string;
}

const EMPTY: Answers = {
  bride: "",
  groom: "",
  first: "bride",
  date: "",
  time: "",
  muhurat: "",
  city: "",
  venue: "",
  functions: [{ name: "Haldi", date: "" }, { name: "Mehendi", date: "" }, { name: "Sangeet", date: "" }, { name: "Wedding", date: "" }, { name: "Reception", date: "" }],
  brideParents: "",
  groomParents: "",
  blessingsOf: "",
  howMet: "",
  memory: "",
  tone: "Traditional",
  language: "en",
  contactName: "",
  contactRelation: "",
  contactPhone: "",
};

const TONES: { id: string; label: string; brief: string }[] = [
  { id: "Traditional", label: "Traditional", brief: "traditional and respectful, like a well-written printed Indian wedding card, warm but never casual" },
  { id: "Royal", label: "Royal", brief: "royal and grand, with a regal, ceremonious register, still warm" },
  { id: "Warm & modern", label: "Warm & modern", brief: "warm and modern, simple heartfelt English a young couple would write" },
  { id: "Fun", label: "Fun", brief: "joyful and fun, playful lines with a wink, still respectful to elders" },
];

function loadAnswers(): Answers {
  try {
    const raw = JSON.parse(sessionStorage.getItem(ANSWERS_KEY) || "null") as Partial<Answers> | null;
    if (!raw || typeof raw !== "object") return EMPTY;
    const str = (v: unknown, fb: string) => (typeof v === "string" ? v : fb);
    return {
      ...EMPTY,
      bride: str(raw.bride, ""),
      groom: str(raw.groom, ""),
      first: raw.first === "groom" ? "groom" : "bride",
      date: str(raw.date, ""),
      time: str(raw.time, ""),
      muhurat: str(raw.muhurat, ""),
      city: str(raw.city, ""),
      venue: str(raw.venue, ""),
      functions: Array.isArray(raw.functions) ? raw.functions.filter((f) => f && typeof f.name === "string").map((f) => ({ name: f.name, date: str(f.date, "") })) : EMPTY.functions,
      brideParents: str(raw.brideParents, ""),
      groomParents: str(raw.groomParents, ""),
      blessingsOf: str(raw.blessingsOf, ""),
      howMet: str(raw.howMet, ""),
      memory: str(raw.memory, ""),
      tone: str(raw.tone, "Traditional"),
      language: raw.language === "hi" || raw.language === "hinglish" ? raw.language : "en",
      contactName: str(raw.contactName, ""),
      contactRelation: str(raw.contactRelation, ""),
      contactPhone: str(raw.contactPhone, ""),
    };
  } catch {
    return EMPTY;
  }
}

const longDate = (iso: string) => {
  try {
    return new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T12:00:00Z`));
  } catch {
    return iso;
  }
};
const clock12 = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  if (!Number.isFinite(h)) return hhmm;
  return `${h % 12 || 12}:${String(m || 0).padStart(2, "0")} ${h >= 12 ? "pm" : "am"}`;
};

/** The answers as a plain-English story the schema's guides can read exactly. */
export function composeWeddingStory(a: Answers): string {
  const out: string[] = [];
  const bride = a.bride.trim();
  const groom = a.groom.trim();
  out.push(`${bride} (the bride) and ${groom} (the groom) are getting married. It is a Hindu North-Indian wedding.`);
  if (a.date) {
    let s = `The wedding ceremony (the pheras) is on ${longDate(a.date)} (${a.date})`;
    if (a.time) s += ` at ${clock12(a.time)} (${a.time})`;
    if (a.muhurat) s += `, and the shubh muhurat for the pheras is ${clock12(a.muhurat)}`;
    out.push(`${s}.`);
  }
  if (a.venue.trim() || a.city.trim()) out.push(`The wedding is at ${[a.venue.trim(), a.city.trim()].filter(Boolean).join(", ")}.`);
  const fns = a.functions.filter((f) => f.name.trim());
  if (fns.length) {
    const sorted = [...fns].sort((x, y) => (x.date || "9999").localeCompare(y.date || "9999"));
    const list = sorted.map((f) => (f.date ? `${f.name} on ${longDate(f.date)} (${f.date})` : f.name));
    out.push(`The functions, in order: ${list.join("; ")}.${a.venue.trim() ? ` Unless said otherwise they are at ${[a.venue.trim(), a.city.trim()].filter(Boolean).join(", ")}.` : ""}`);
  }
  if (a.brideParents.trim()) out.push(`The bride's parents are ${a.brideParents.trim()}.`);
  if (a.groomParents.trim()) out.push(`The groom's parents are ${a.groomParents.trim()}.`);
  if (a.blessingsOf.trim()) out.push(`With the blessings of ${a.blessingsOf.trim()}.`);
  if (a.howMet.trim()) out.push(`How they met: ${a.howMet.trim()}`);
  if (a.memory.trim()) out.push(`A moment from their story: ${a.memory.trim()}`);
  if (!a.howMet.trim() && !a.memory.trim()) out.push("Nothing is said here about how they met or their time together before the wedding, so their story is left for them to write.");
  if (a.contactName.trim() && a.contactPhone.trim()) out.push(`For any questions, guests can call ${a.contactName.trim()}${a.contactRelation.trim() ? ` (${a.contactRelation.trim()})` : ""} on ${a.contactPhone.trim()}.`);
  if (a.language === "hinglish") out.push("The family speaks Hinglish; the story lines may carry a little of that warmth.");
  return out.join(" ").replace(/\s+/g, " ").trim();
}

// ── Little UI bits ──────────────────────────────────────────────────────────

function Field({ label, hint, children, htmlFor, error }: { label: string; hint?: string; children: ReactNode; htmlFor: string; error?: string }) {
  return (
    <div className="sa-field">
      <label className="sa-label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error ? (
        <p className="sa-err" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="sa-hint">{hint}</p>
      )}
    </div>
  );
}

const STEPS = ["names", "date", "place", "functions", "families", "story", "tone", "contact"] as const;
type StepId = (typeof STEPS)[number];
const STEP_TITLE: Record<StepId, string> = {
  names: "Who is getting married?",
  date: "When is the wedding?",
  place: "Where will it be?",
  functions: "Which functions are you having?",
  families: "Whose blessings shall we print?",
  story: "How did it all begin?",
  tone: "How should it sound?",
  contact: "Who should guests call?",
};
const STEP_SUB: Record<StepId, string> = {
  names: "Just the first names, the way you'd like them printed.",
  date: "The day of the pheras. The countdown and calendars use it.",
  place: "The city, and the main venue if you know it.",
  functions: "Tap to add or remove. Dates are optional.",
  families: "Both sets of parents, as a card prints them. Optional.",
  story: "One or two lines is plenty. Optional.",
  tone: "Pick a mood and the language the page opens in.",
  contact: "One family member guests can call or WhatsApp. Optional.",
};

// ── The review ──────────────────────────────────────────────────────────────

type Group = { key: string; title: string; fields: WireField[] };

function groupFields(fields: readonly WireField[], valueAt: (p: string) => unknown): Group[] {
  const by = (pred: (p: string) => boolean) => fields.filter((f) => pred(f.path));
  const groups: Group[] = [
    { key: "couple", title: "The couple", fields: by((p) => ["brideName", "groomName", "bride.description", "groom.description"].includes(p)) },
    { key: "day", title: "The day", fields: by((p) => ["weddingDay", "muhurat", "venue"].includes(p)) },
    { key: "invite", title: "The invitation", fields: by((p) => ["invitation", "hindiMessage", "closingLine"].includes(p)) },
    { key: "families", title: "Families", fields: by((p) => p.startsWith("brideFamily.") || p.startsWith("groomFamily.")) },
  ];
  for (let i = 0; i < 8; i++) {
    const row = by((p) => p.startsWith(`events[${i}].`));
    if (!row.length) continue;
    const name = valueAt(`events[${i}].name`);
    const any = row.some((f) => isFilled(valueAt(f.path)));
    if (i > 0 && !any) continue;
    groups.push({ key: `ev${i}`, title: `Function ${i + 1}${typeof name === "string" && name.trim() ? ` · ${name.trim()}` : ""}`, fields: row });
  }
  for (let i = 0; i < 4; i++) {
    const row = by((p) => p.startsWith(`story[${i}].`));
    if (!row.length || !row.some((f) => isFilled(valueAt(f.path)))) continue;
    groups.push({ key: `st${i}`, title: `Our story · chapter ${i + 1}`, fields: row });
  }
  const contact = by((p) => p.startsWith("contacts[0]."));
  if (contact.some((f) => isFilled(valueAt(f.path)))) groups.push({ key: "contact", title: "Who to call", fields: contact });
  const things = by((p) => p === "things");
  if (things.some((f) => isFilled(valueAt(f.path)))) groups.push({ key: "things", title: "Good to know", fields: things });
  return groups.filter((g) => g.fields.length);
}

function Review({ e, onDone, onBack }: { e: ShaadiEditor; onDone: () => void; onBack: () => void }) {
  const { fill } = e;
  const [openPath, setOpenPath] = useState<string | null>(null);
  const toggle = useCallback((p: string) => setOpenPath((x) => (x === p ? null : p)), []);
  // The model's rows are a snapshot (they must not vanish under the cursor once edited).
  const [aiWrote] = useState(() => new Set(fill.filled));
  const fields = fill.schema?.fields ?? [];
  const groups = groupFields(fields, fill.valueAt);
  const shown = groups.flatMap((g) => g.fields);
  const empty = shown.filter((f) => !isFilled(fill.valueAt(f.path))).length;
  return (
    <div className="sa-review">
      <div className="sa-review-sum" aria-live="polite">
        <p className="sa-review-big">✦ Your invitation is written</p>
        <p className="sa-hint">
          {fill.error && !aiWrote.size
            ? fill.error
            : `${aiWrote.size} lines written${fill.lastLanguage ? ` in ${fill.lastLanguage}` : ""}. Tap any line to change it.${empty ? ` ${empty} still need you.` : ""}`}
        </p>
      </div>
      {groups.map((g) => (
        <section key={g.key} className="sa-group" aria-label={g.title}>
          <h3 className="sa-group-h">{g.title}</h3>
          <div className="sa-group-rows">
            {g.fields.map((f) => {
              const v = fill.valueAt(f.path);
              return (
                <div key={f.path} className={`sa-row${isFilled(v) ? "" : " is-empty"}`}>
                  <StoryFieldRow field={f} value={v} open={openPath === f.path} fromAi={aiWrote.has(f.path)} onToggle={toggle} onChange={fill.setFieldValue} />
                </div>
              );
            })}
          </div>
        </section>
      ))}
      <div className="sa-review-foot">
        <button type="button" className="sa-btn" onClick={onDone}>
          Looks good, show my invitation
        </button>
        <button type="button" className="sa-ghost" onClick={onBack}>
          Change my answers
        </button>
      </div>
    </div>
  );
}

// ── The sheet ───────────────────────────────────────────────────────────────

export default function ShaadiAi({ e }: { e: ShaadiEditor }) {
  const { fill, sheet } = e;
  const open = sheet === "ai";
  const [screen, setScreen] = useState<"choice" | "q" | "writing" | "review">("choice");
  const [qi, setQi] = useState(0);
  const [a, setA] = useState<Answers>(EMPTY);
  const [tried, setTried] = useState(false);
  const [pending, setPending] = useState<{ story: string; hints: { tone: string; occasion: string; language?: string } } | null>(null);
  const snapshot = useRef<ShaadiCardData | null>(null);
  const answersRef = useRef<Partial<ShaadiCardData>>({});
  const cardInput = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Opened afresh: start at the choice, answers from this session.
  useEffect(() => {
    if (!open) return;
    setA(loadAnswers());
    setScreen("choice");
    setQi(0);
    setTried(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    try {
      sessionStorage.setItem(ANSWERS_KEY, JSON.stringify(a));
    } catch {
      /* fine */
    }
  }, [a, open]);

  useEffect(() => bodyRef.current?.scrollTo?.({ top: 0 }), [screen, qi]);

  // Lock the page behind the sheet.
  useEffect(() => {
    if (!open) return;
    const el = document.documentElement;
    const prev = el.style.overflow;
    el.style.overflow = "hidden";
    return () => {
      el.style.overflow = prev;
    };
  }, [open]);

  // Run the fill once the blanked form has rendered (generateGuided reads the current form).
  const { generateGuided } = fill;
  useEffect(() => {
    if (!pending) return;
    generateGuided({ people: { userName: "", partnerName: "", bestFriendName: "", partnerPronouns: "" }, story: pending.story, hints: pending.hints });
    setPending(null);
  }, [pending, generateGuided]);

  // The fill landed (or failed).
  useEffect(() => {
    if (screen !== "writing" || pending || fill.generating) return;
    if (fill.mode === "done") {
      // The names are the sender's, spelled the way they typed them (the model may transliterate).
      const typed = answersRef.current;
      e.setMf((x) => afterFill(x, typed));
      setScreen("review");
    }
    else if (fill.error) {
      if (snapshot.current) e.setMf(snapshot.current);
      setScreen("q");
      setQi(STEPS.length - 1);
    }
  }, [screen, pending, fill.generating, fill.mode, fill.error, e]);

  const set = <K extends keyof Answers>(k: K, v: Answers[K]) => setA((x) => ({ ...x, [k]: v }));
  const step = STEPS[qi];
  const namesOk = a.bride.trim().length > 0 && a.groom.trim().length > 0;
  const phoneBad = !!a.contactPhone.trim() && !dialOf(a.contactPhone);

  const write = () => {
    if (!namesOk) {
      setQi(0);
      setTried(true);
      return;
    }
    snapshot.current = e.mf;
    const answers: Partial<ShaadiCardData> = {
      brideName: a.bride.trim(),
      groomName: a.groom.trim(),
      weddingDay: a.date,
      weddingTime: a.time,
      venue: a.city.trim(),
      nameOrder: a.first,
      lang: a.language === "hi" ? "hi" : "en",
    };
    const blank = blankForAi(e.mf);
    // The time and the order of names are not the model's to write.
    blank.weddingTime = a.time || blank.weddingTime;
    blank.muhurat = a.muhurat ? `Shubh muhurat ${clock12(a.muhurat)}` : "";
    blank.nameOrder = a.first;
    blank.lang = answers.lang ?? "en";
    e.setMf(blank);
    const tone = TONES.find((t) => t.id === a.tone)?.brief ?? a.tone;
    // English copy (the Hindi invitation is its own field); Hinglish families get no language pin.
    setPending({ story: composeWeddingStory(a), hints: { tone, occasion: "a Hindu wedding (shaadi) invitation", ...(a.language === "hinglish" ? {} : { language: "en" }) } });
    setScreen("writing");
    answersRef.current = answers;
  };

  const done = () => {
    // No how-we-met in the answers: no story chapters (the model must not supply one).
    const noStory = screen === "review" && !a.howMet.trim() && !a.memory.trim() && answersRef.current.brideName;
    e.setMf(finishAi(noStory ? { ...e.mf, story: [] } : e.mf, answersRef.current));
    fill.setMode("manual");
    e.setStep(0);
    e.setSheet("form");
  };
  const manual = () => {
    fill.setMode("manual");
    e.openForm(0);
  };
  const close = () => {
    fill.setMode("manual");
    if (screen === "review") done();
    else e.closeSheet();
  };

  const toggleFn = (name: string) =>
    setA((x) => {
      const has = x.functions.some((f) => f.name === name);
      return { ...x, functions: has ? x.functions.filter((f) => f.name !== name) : [...x.functions, { name, date: "" }] };
    });

  const writingLines = useMemo(() => ["Lighting the diyas…", "Writing your nimantran…", "Adding the Hindi invitation…", "Setting every function in order…"], []);
  const [wl, setWl] = useState(0);
  useEffect(() => {
    if (screen !== "writing") return;
    const t = window.setInterval(() => setWl((x) => (x + 1) % writingLines.length), 1600);
    return () => window.clearInterval(t);
  }, [screen, writingLines.length]);

  if (!open || typeof document === "undefined") return null;

  const body = (
    <div className="sa-scrim" role="presentation">
      <style>{SA_CSS}</style>
      <div className="sa-sheet" role="dialog" aria-modal="true" aria-labelledby="sa-title">
        <header className="sa-top">
          <div className="sa-top-row">
            {screen === "q" ? (
              <button type="button" className="sa-icon" onClick={() => (qi === 0 ? setScreen("choice") : setQi(qi - 1))} aria-label="Back">
                ←
              </button>
            ) : (
              <span className="sa-icon-sp" aria-hidden />
            )}
            <p className="sa-kicker" id="sa-title">
              {screen === "review" ? "Read it through" : screen === "q" ? `Question ${qi + 1} of ${STEPS.length}` : "✦ Let AI write it"}
            </p>
            <button type="button" className="sa-icon" onClick={close} aria-label="Close and fill it in myself">
              ✕
            </button>
          </div>
          {screen === "q" && (
            <div className="sa-progress" aria-hidden>
              <span style={{ width: `${((qi + 1) / STEPS.length) * 100}%` }} />
            </div>
          )}
        </header>

        <div className="sa-body" ref={bodyRef}>
          {screen === "choice" && (
            <div className="sa-choice">
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img className="sa-choice-art" {...img(ART.garlandBorder)} aria-hidden />
              <h2 className="sa-h">Let&apos;s write your invitation</h2>
              <p className="sa-p">Answer eight quick questions and AI fills the whole invitation: names, every function, the Hindi nimantran, your story. You can change every word afterwards.</p>
              <button type="button" className="sa-opt is-primary" onClick={() => setScreen("q")} autoFocus>
                <span className="sa-opt-ic" aria-hidden>
                  ✦
                </span>
                <span>
                  <b>Answer 8 quick questions</b>
                  <small>Recommended · about a minute</small>
                </span>
              </button>
              <button type="button" className="sa-opt" onClick={() => cardInput.current?.click()} disabled={e.extractLoading}>
                <span className="sa-opt-ic" aria-hidden>
                  📷
                </span>
                <span>
                  <b>{e.extractLoading ? "Reading your card…" : "Read my printed card"}</b>
                  <small>Upload a photo of your wedding card</small>
                </span>
              </button>
              <input
                ref={cardInput}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(ev) => {
                  const files = Array.from(ev.target.files ?? []);
                  ev.target.value = "";
                  void e.handleCardExtract(files);
                }}
              />
              <button type="button" className="sa-opt" onClick={manual}>
                <span className="sa-opt-ic" aria-hidden>
                  ✎
                </span>
                <span>
                  <b>I&apos;ll fill it in myself</b>
                  <small>Go straight to the form</small>
                </span>
              </button>
            </div>
          )}

          {screen === "q" && (
            <div className="sa-q">
              <h2 className="sa-h">{STEP_TITLE[step]}</h2>
              <p className="sa-p">{STEP_SUB[step]}</p>

              {step === "names" && (
                <>
                  <Field label="Bride's name" htmlFor="sa-bride" error={tried && !a.bride.trim() ? "Add the bride's name" : undefined}>
                    <input id="sa-bride" className="sa-input" value={a.bride} maxLength={30} autoComplete="off" placeholder="e.g. Ishita" onChange={(ev) => set("bride", ev.target.value)} />
                  </Field>
                  <Field label="Groom's name" htmlFor="sa-groom" error={tried && !a.groom.trim() ? "Add the groom's name" : undefined}>
                    <input id="sa-groom" className="sa-input" value={a.groom} maxLength={30} autoComplete="off" placeholder="e.g. Kabir" onChange={(ev) => set("groom", ev.target.value)} />
                  </Field>
                  <div className="sa-seg" role="radiogroup" aria-label="Whose name comes first">
                    {(["bride", "groom"] as const).map((o) => (
                      <button key={o} type="button" role="radio" aria-checked={a.first === o} onClick={() => set("first", o)}>
                        {o === "bride" ? `${a.bride.trim() || "Bride"} & ${a.groom.trim() || "Groom"}` : `${a.groom.trim() || "Groom"} & ${a.bride.trim() || "Bride"}`}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {step === "date" && (
                <>
                  <Field label="Wedding date" htmlFor="sa-date">
                    <input id="sa-date" type="date" className="sa-input" value={a.date} onChange={(ev) => set("date", ev.target.value)} />
                  </Field>
                  <div className="sa-two">
                    <Field label="Starts at" htmlFor="sa-time">
                      <input id="sa-time" type="time" className="sa-input" value={a.time} onChange={(ev) => set("time", ev.target.value)} />
                    </Field>
                    <Field label="Muhurat (optional)" htmlFor="sa-muh">
                      <input id="sa-muh" type="time" className="sa-input" value={a.muhurat} onChange={(ev) => set("muhurat", ev.target.value)} />
                    </Field>
                  </div>
                </>
              )}

              {step === "place" && (
                <>
                  <Field label="City" htmlFor="sa-city">
                    <input id="sa-city" className="sa-input" value={a.city} maxLength={40} placeholder="e.g. Jaipur" onChange={(ev) => set("city", ev.target.value)} />
                  </Field>
                  <Field label="Main venue (optional)" htmlFor="sa-venue">
                    <input id="sa-venue" className="sa-input" value={a.venue} maxLength={80} placeholder="e.g. Rambagh Palace" onChange={(ev) => set("venue", ev.target.value)} />
                  </Field>
                </>
              )}

              {step === "functions" && (
                <>
                  <div className="sa-chips" role="group" aria-label="Functions">
                    {QUICK_FUNCTIONS.map((f) => {
                      const on = a.functions.some((x) => x.name === f);
                      return (
                        <button key={f} type="button" className={`sa-chip${on ? " is-on" : ""}`} aria-pressed={on} onClick={() => toggleFn(f)}>
                          {on ? "✓ " : "+ "}
                          {f}
                        </button>
                      );
                    })}
                  </div>
                  {a.functions.length > 0 && (
                    <ul className="sa-fn-dates">
                      {a.functions.map((f, i) => (
                        <li key={f.name}>
                          <label htmlFor={`sa-fd-${i}`}>{f.name}</label>
                          <input
                            id={`sa-fd-${i}`}
                            type="date"
                            className="sa-input"
                            value={f.date}
                            onChange={(ev) => setA((x) => ({ ...x, functions: x.functions.map((y) => (y.name === f.name ? { ...y, date: ev.target.value } : y)) }))}
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}

              {step === "families" && (
                <>
                  <Field label="Bride's parents" htmlFor="sa-bp" hint="e.g. Smt. Radhika & Shri Sameer Khanna">
                    <input id="sa-bp" className="sa-input" value={a.brideParents} maxLength={120} onChange={(ev) => set("brideParents", ev.target.value)} />
                  </Field>
                  <Field label="Groom's parents" htmlFor="sa-gp" hint="e.g. Smt. Anjali & Shri Vivek Malhotra">
                    <input id="sa-gp" className="sa-input" value={a.groomParents} maxLength={120} onChange={(ev) => set("groomParents", ev.target.value)} />
                  </Field>
                  <Field label="With the blessings of (optional)" htmlFor="sa-bo" hint="Grandparents or elders, e.g. Dadi Maa & Nana Ji">
                    <input id="sa-bo" className="sa-input" value={a.blessingsOf} maxLength={120} onChange={(ev) => set("blessingsOf", ev.target.value)} />
                  </Field>
                </>
              )}

              {step === "story" && (
                <>
                  <Field label="How did you meet?" htmlFor="sa-met">
                    <textarea id="sa-met" className="sa-input sa-area" rows={3} value={a.howMet} maxLength={400} placeholder="e.g. At a bus stop in the Jaipur rain, 2018" onChange={(ev) => set("howMet", ev.target.value)} />
                  </Field>
                  <Field label="One moment to share (optional)" htmlFor="sa-mem">
                    <textarea id="sa-mem" className="sa-input sa-area" rows={3} value={a.memory} maxLength={400} placeholder="e.g. He proposed at Nahargarh Fort at sunset" onChange={(ev) => set("memory", ev.target.value)} />
                  </Field>
                </>
              )}

              {step === "tone" && (
                <>
                  <p className="sa-label">Mood</p>
                  <div className="sa-chips" role="radiogroup" aria-label="Mood">
                    {TONES.map((t) => (
                      <button key={t.id} type="button" role="radio" aria-checked={a.tone === t.id} className={`sa-chip${a.tone === t.id ? " is-on" : ""}`} onClick={() => set("tone", t.id)}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                  <p className="sa-label" style={{ marginTop: 18 }}>
                    The page opens in
                  </p>
                  <div className="sa-chips" role="radiogroup" aria-label="Language">
                    {(
                      [
                        ["en", "English"],
                        ["hi", "हिन्दी"],
                        ["hinglish", "Hinglish"],
                      ] as const
                    ).map(([id, label]) => (
                      <button key={id} type="button" role="radio" aria-checked={a.language === id} className={`sa-chip${a.language === id ? " is-on" : ""}`} onClick={() => set("language", id)}>
                        {label}
                      </button>
                    ))}
                  </div>
                  <p className="sa-hint">Guests can always switch between English and हिन्दी.</p>
                </>
              )}

              {step === "contact" && (
                <>
                  <Field label="Name" htmlFor="sa-cn">
                    <input id="sa-cn" className="sa-input" value={a.contactName} maxLength={40} placeholder="e.g. Rohan Khanna" onChange={(ev) => set("contactName", ev.target.value)} />
                  </Field>
                  <Field label="Relation" htmlFor="sa-cr">
                    <input id="sa-cr" className="sa-input" value={a.contactRelation} maxLength={40} placeholder="e.g. Bride's brother" onChange={(ev) => set("contactRelation", ev.target.value)} />
                  </Field>
                  <Field label="Mobile number" htmlFor="sa-cp" error={phoneBad ? "10 digits starting 6–9, with or without +91" : undefined}>
                    <div className="sa-phone">
                      <span aria-hidden>+91</span>
                      <input id="sa-cp" className="sa-input" type="tel" inputMode="tel" value={a.contactPhone} maxLength={16} placeholder="98765 43210" onChange={(ev) => set("contactPhone", ev.target.value)} />
                    </div>
                  </Field>
                  {fill.error && (
                    <p className="sa-err" role="alert">
                      {fill.error}
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {screen === "writing" && (
            <div className="sa-writing" aria-live="polite">
              <span className="sa-mandala" aria-hidden />
              <p className="sa-h">{writingLines[wl]}</p>
              <p className="sa-p">This takes about ten seconds.</p>
            </div>
          )}

          {screen === "review" && <Review e={e} onDone={done} onBack={() => { setScreen("q"); setQi(0); }} />}
        </div>

        {screen === "q" && (
          <footer className="sa-foot">
            {qi < STEPS.length - 1 ? (
              <>
                <button type="button" className="sa-ghost" onClick={() => setQi(qi + 1)} disabled={step === "names"}>
                  Skip
                </button>
                <button
                  type="button"
                  className="sa-btn"
                  onClick={() => {
                    if (step === "names" && !namesOk) {
                      setTried(true);
                      return;
                    }
                    setQi(qi + 1);
                  }}
                >
                  Next →
                </button>
              </>
            ) : (
              <button type="button" className="sa-btn sa-btn-wide" onClick={write} disabled={fill.generating || phoneBad}>
                ✦ Write my invitation
              </button>
            )}
          </footer>
        )}
      </div>
    </div>
  );
  return createPortal(body, document.body);
}

const SA_CSS = `
.sa-scrim { position: fixed; inset: 0; z-index: 220; display: flex; align-items: flex-end; justify-content: center; background: rgba(61, 26, 15, .42); }
.sa-sheet { position: relative; display: flex; flex-direction: column; width: 100%; height: 100dvh; max-height: 100dvh; background: linear-gradient(180deg, #fffaf0, #fff4dc); color: #3d1a0f;
  font-family: var(--font-wk-sans, "DM Sans"), system-ui, sans-serif; box-shadow: 0 -20px 60px -20px rgba(61, 26, 15, .5); }
@media (min-width: 768px) { .sa-scrim { align-items: center; padding: 24px; } .sa-sheet { width: min(600px, 100%); height: auto; max-height: min(860px, 92dvh); border-radius: 24px; overflow: hidden; } }
.sa-top { flex: none; padding: calc(env(safe-area-inset-top, 0px) + 8px) 12px 8px; border-bottom: 1px solid rgba(179, 21, 90, .12); background: rgba(255, 250, 240, .96); }
.sa-top-row { display: flex; align-items: center; gap: 8px; }
.sa-kicker { flex: 1; margin: 0; text-align: center; font: 700 13px/1.3 inherit; letter-spacing: .08em; text-transform: uppercase; color: #b3155a; }
.sa-icon { flex: none; width: 44px; height: 44px; border-radius: 50%; border: 0; background: rgba(179, 21, 90, .08); color: #3d1a0f; font-size: 18px; cursor: pointer; }
.sa-icon-sp { flex: none; width: 44px; height: 44px; }
.sa-progress { height: 4px; margin: 8px 4px 0; border-radius: 4px; background: rgba(226, 154, 27, .2); overflow: hidden; }
.sa-progress span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #f29d12, #c2185b); transition: width .35s cubic-bezier(.22,.7,.2,1); }
.sa-body { flex: 1; overflow-y: auto; overscroll-behavior: contain; padding: 20px 18px 28px; }
.sa-h { margin: 0; font: 600 clamp(24px, 6.4vw, 30px)/1.25 var(--font-wk-display, "Cormorant Garamond"), Georgia, serif; color: #3d1a0f; text-wrap: balance; }
.sa-p { margin: 8px 0 18px; font-size: 15.5px; line-height: 1.55; color: #7a5a43; }
.sa-field { margin-bottom: 16px; }
.sa-label { display: block; margin: 0 0 6px; font: 600 14px/1.3 inherit; color: #5a3a24; }
.sa-hint { margin: 6px 0 0; font-size: 13.5px; line-height: 1.45; color: #8a6d55; }
.sa-err { margin: 6px 0 0; font-size: 13.5px; color: #b42318; }
.sa-input { display: block; width: 100%; min-height: 52px; padding: 12px 14px; border-radius: 14px; border: 1.5px solid rgba(179, 21, 90, .2); background: #fff; color: #3d1a0f; font: 400 16px/1.4 inherit; outline: none; }
.sa-input:focus { border-color: #c2185b; box-shadow: 0 0 0 3px rgba(194, 24, 91, .14); }
.sa-area { min-height: 96px; resize: vertical; }
.sa-two { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.sa-phone { display: flex; align-items: stretch; gap: 8px; }
.sa-phone span { display: grid; place-items: center; padding: 0 12px; border-radius: 14px; background: #fff1d2; font-weight: 700; color: #8c5300; }
.sa-seg { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 4px; border-radius: 16px; background: rgba(226, 154, 27, .14); }
.sa-seg button { min-height: 48px; padding: 6px 10px; border: 0; border-radius: 12px; background: transparent; color: #5a3a24; font: 600 14px/1.25 inherit; cursor: pointer; overflow-wrap: anywhere; }
.sa-seg button[aria-checked=true] { background: #fff; color: #b3155a; box-shadow: 0 6px 14px -8px rgba(120, 60, 10, .5); }
.sa-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.sa-chip { min-height: 44px; padding: 0 16px; border-radius: 999px; border: 1.5px solid rgba(179, 21, 90, .22); background: #fff; color: #5a3a24; font: 600 14.5px/1 inherit; cursor: pointer; }
.sa-chip.is-on { background: linear-gradient(135deg, #c2185b, #e0457b); border-color: transparent; color: #fff; }
.sa-fn-dates { list-style: none; margin: 18px 0 0; padding: 0; display: grid; gap: 10px; }
.sa-fn-dates li { display: grid; grid-template-columns: minmax(84px, .7fr) 1.3fr; gap: 10px; align-items: center; }
.sa-fn-dates label { font-weight: 600; font-size: 15px; }
.sa-foot { flex: none; display: flex; gap: 10px; padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0px)); border-top: 1px solid rgba(179, 21, 90, .12); background: rgba(255, 250, 240, .97); }
.sa-btn { flex: 1; min-height: 54px; padding: 0 20px; border: 0; border-radius: 16px; background: linear-gradient(135deg, #c2185b, #e0457b 60%, #f29d12); color: #fff; font: 700 16px/1 inherit; cursor: pointer; box-shadow: 0 14px 26px -14px rgba(194, 24, 91, .8); }
.sa-btn:disabled { opacity: .55; cursor: not-allowed; }
.sa-ghost { min-height: 54px; padding: 0 18px; border-radius: 16px; border: 1.5px solid rgba(179, 21, 90, .22); background: #fff; color: #5a3a24; font: 600 15px/1 inherit; cursor: pointer; }
.sa-ghost:disabled { opacity: .4; }
.sa-choice { display: grid; gap: 12px; }
.sa-choice-art { display: block; width: calc(100% + 36px); max-width: none; height: auto; margin: -20px -18px 6px; }
.sa-choice .sa-p { margin-bottom: 8px; }
.sa-opt { display: flex; align-items: center; gap: 14px; width: 100%; min-height: 72px; padding: 14px 16px; text-align: left; border-radius: 18px; border: 1.5px solid rgba(179, 21, 90, .16); background: #fff; color: #3d1a0f; cursor: pointer; font: inherit; }
.sa-opt b { display: block; font-size: 16.5px; }
.sa-opt small { display: block; margin-top: 3px; font-size: 13.5px; color: #8a6d55; }
.sa-opt-ic { flex: none; display: grid; place-items: center; width: 44px; height: 44px; border-radius: 14px; background: #fff1d2; font-size: 20px; }
.sa-opt.is-primary { border-color: transparent; background: linear-gradient(135deg, #fff, #fff1d2); box-shadow: 0 0 0 2px #e29a1b, 0 16px 30px -18px rgba(194, 24, 91, .6); }
.sa-opt.is-primary .sa-opt-ic { background: linear-gradient(135deg, #c2185b, #f29d12); color: #fff; }
.sa-writing { display: grid; justify-items: center; gap: 6px; padding: 60px 10px; text-align: center; }
.sa-mandala { width: 96px; height: 96px; margin-bottom: 18px; border-radius: 50%; background: repeating-conic-gradient(#f29d12 0 12deg, #ffd23f 12deg 24deg); -webkit-mask: radial-gradient(circle, transparent 0 30%, #000 31%); mask: radial-gradient(circle, transparent 0 30%, #000 31%); animation: sa-spin 3s linear infinite; }
@keyframes sa-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .sa-mandala { animation: none; } }
.sa-review { display: grid; gap: 14px; }
.sa-review-sum { padding: 14px 16px; border-radius: 16px; background: #fff; border: 1.5px solid rgba(226, 154, 27, .45); }
.sa-review-big { margin: 0; font: 600 20px/1.3 var(--font-wk-display, "Cormorant Garamond"), Georgia, serif; color: #b3155a; }
.sa-group { border-radius: 16px; background: #fff; border: 1px solid rgba(179, 21, 90, .14); overflow: hidden; }
.sa-group-h { margin: 0; padding: 12px 14px 8px; font: 700 12.5px/1.3 inherit; letter-spacing: .1em; text-transform: uppercase; color: #8c5300; background: #fff8e8; }
.sa-row.is-empty { box-shadow: inset 3px 0 0 #c2185b; }
.sa-review-foot { display: grid; gap: 10px; margin-top: 6px; }
`;
