"use client";

// ─── "Answer a few questions": the guided AI fill for a wedding ──────────────
// One question per screen (names → date → city & venue → functions → families
// → how you met → tone & language → someone to call), then the AI writes the
// whole invitation and the shared StoryReview lists every line it wrote, each
// editable in place, with the still-empty fields loud underneath.
//
// Built inside this template (not as a GuidedQuestions variant) so the seven
// wedding rebuilds running in parallel never edit the same shared file; the
// answers live under their own sessionStorage key (ss:guided-wedding:v1), so
// the next wedding template a sender opens starts pre-filled.
//
// The answers become one plain-English description (composeWeddingStory) plus
// hints {tone, language, occasion:"wedding"}; the facts the sender typed
// (names, date, time, city, the contact) are also written straight into the
// form afterwards by the studio, so the model never gets a vote on them.

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import StoryReview from "@/components/story/StoryReview";
import type { UseStoryFillResult } from "@/hooks/useStoryFill";

export const GUIDED_KEY = "ss:guided-wedding:v1";

export type Tone = "traditional" | "royal" | "warm" | "faith" | "fun";
export type Language = "en" | "hi" | "hinglish";

export interface WeddingAnswers {
  bride: string;
  groom: string;
  first: "bride" | "groom";
  date: string;
  time: string;
  city: string;
  venue: string;
  functions: { name: string; date: string }[];
  brideParents: string;
  groomParents: string;
  blessingsOf: string;
  story: string;
  tone: Tone;
  language: Language;
  contactName: string;
  contactRelation: string;
  contactPhone: string;
}

export const EMPTY_ANSWERS: WeddingAnswers = {
  bride: "",
  groom: "",
  first: "bride",
  date: "",
  time: "",
  city: "",
  venue: "",
  functions: [],
  brideParents: "",
  groomParents: "",
  blessingsOf: "",
  story: "",
  tone: "warm",
  language: "en",
  contactName: "",
  contactRelation: "",
  contactPhone: "",
};

const FUNCTIONS = ["Roka", "Haldi", "Mehendi", "Sangeet", "Baraat", "Wedding (Pheras)", "Reception", "Cocktail"];
const TONES: { id: Tone; label: string }[] = [
  { id: "traditional", label: "Traditional" },
  { id: "royal", label: "Royal" },
  { id: "warm", label: "Warm & modern" },
  { id: "faith", label: "Faith-filled" },
  { id: "fun", label: "Fun" },
];
const LANGS: { id: Language; label: string }[] = [
  { id: "en", label: "English" },
  { id: "hi", label: "हिन्दी" },
  { id: "hinglish", label: "Hinglish" },
];

export function loadAnswers(): WeddingAnswers {
  try {
    const raw = sessionStorage.getItem(GUIDED_KEY);
    if (!raw) return { ...EMPTY_ANSWERS };
    const v = JSON.parse(raw) as Partial<WeddingAnswers>;
    return { ...EMPTY_ANSWERS, ...v, functions: Array.isArray(v.functions) ? v.functions.filter((f) => f && typeof f.name === "string").slice(0, 8) : [] };
  } catch {
    return { ...EMPTY_ANSWERS };
  }
}
function saveAnswers(a: WeddingAnswers) {
  try {
    sessionStorage.setItem(GUIDED_KEY, JSON.stringify(a));
  } catch {
    /* private mode: the answers just are not remembered */
  }
}

const longDate = (iso: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
};
const niceTime = (t: string) => {
  if (!/^\d{2}:\d{2}$/.test(t)) return "";
  const [h, m] = t.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`;
};

/** The answers as one plain-English description for the model (deterministic, no invention). */
export function composeWeddingStory(a: WeddingAnswers): string {
  const [x, y] = a.first === "groom" ? [a.groom, a.bride] : [a.bride, a.groom];
  const out: string[] = [];
  out.push(`${a.bride.trim()} (the bride) and ${a.groom.trim()} (the groom) are getting married${a.date ? ` on ${longDate(a.date)}` : ""}${a.time ? ` at ${niceTime(a.time)}` : ""}${a.venue ? ` at ${a.venue.trim()}` : ""}${a.city ? `, ${a.city.trim()}` : ""}.`);
  out.push(`Print the names as "${x.trim()} & ${y.trim()}".`);
  if (a.functions.length) {
    const fs = a.functions.map((f) => `${f.name}${f.date ? ` on ${longDate(f.date)}` : ""}`);
    out.push(`The functions, in order: ${fs.join("; ")}.`);
  } else out.push("There is just the wedding itself; no other functions.");
  if (a.brideParents.trim()) out.push(`The bride's parents: ${a.brideParents.trim()}.`);
  if (a.groomParents.trim()) out.push(`The groom's parents: ${a.groomParents.trim()}.`);
  if (a.blessingsOf.trim()) out.push(`With the blessings of ${a.blessingsOf.trim()}.`);
  if (a.story.trim()) out.push(`How they met, in their words: ${a.story.trim()}`);
  else out.push("Leave the story section empty.");
  const tone = TONES.find((t) => t.id === a.tone)?.label ?? "Warm & modern";
  out.push(`Tone: ${tone.toLowerCase()}.`);
  if (a.language === "hi") out.push("Write the invitation in Hindi (Devanagari).");
  else if (a.language === "hinglish") out.push("Write in Hinglish (Hindi in Latin letters, mixed with English).");
  else out.push("Write in English, and add a short Hindi version of the invitation too.");
  return out.join(" ");
}

export interface GuidedWeddingProps {
  open: boolean;
  fill: UseStoryFillResult;
  onClose: () => void;
  /** After the fill lands: the studio writes the facts typed here straight into the form. */
  onApplied: (a: WeddingAnswers) => void;
}

type Screen = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | "writing" | "review";

export default function GuidedWedding({ open, fill, onClose, onApplied }: GuidedWeddingProps) {
  const [a, setA] = useState<WeddingAnswers>(EMPTY_ANSWERS);
  const [screen, setScreen] = useState<Screen>(0);
  const [err, setErr] = useState("");
  const waiting = useRef(false);
  const firstRef = useRef<HTMLInputElement>(null);
  // Each time the sheet opens: the remembered answers, from question 1 (state adjusted during render).
  const [wasOpen, setWasOpen] = useState(false);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setA(loadAnswers());
      setScreen(0);
      setErr("");
    }
  }
  useEffect(() => {
    if (open) saveAnswers(a);
  }, [a, open]);

  // Lock the page behind the sheet; Esc closes it.
  useEffect(() => {
    if (!open) return;
    const el = document.documentElement;
    const prev = el.style.overflow;
    el.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && screen !== "writing") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      el.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, screen]);

  useEffect(() => {
    if (open && typeof screen === "number") window.setTimeout(() => firstRef.current?.focus({ preventScroll: true }), 60);
  }, [open, screen]);

  // The fill has landed (or failed): on to the review, or back with the error.
  useEffect(() => {
    if (!waiting.current || fill.generating) return;
    waiting.current = false;
    if (fill.mode === "done") {
      // After the studio's own post-fill tidy (parent effects run after this one), so the typed facts win.
      const typed = a;
      window.setTimeout(() => {
        onApplied(typed);
        setScreen("review");
      }, 0);
    } else {
      const msg = fill.error || "That didn't work. Try again in a moment.";
      window.setTimeout(() => {
        setErr(msg);
        setScreen(7);
      }, 0);
    }
  }, [fill.generating, fill.mode, fill.error, a, onApplied]);

  const set = <K extends keyof WeddingAnswers>(k: K, v: WeddingAnswers[K]) => setA((p) => ({ ...p, [k]: v }));
  const steps = 8;
  const needNames = !a.bride.trim() || !a.groom.trim();

  const write = () => {
    if (needNames) {
      setScreen(0);
      setErr("Both names first, please.");
      return;
    }
    if (!fill.schema) {
      setErr("The writer is still loading. Try again in a second.");
      return;
    }
    setErr("");
    waiting.current = true;
    setScreen("writing");
    fill.generateGuided({
      people: { userName: a.groom.trim(), partnerName: a.bride.trim(), bestFriendName: a.bride.trim(), partnerPronouns: "" },
      story: composeWeddingStory(a),
      hints: { tone: a.tone, language: a.language === "hi" ? "hi" : a.language === "hinglish" ? "hi-Latn" : "en", occasion: "wedding" },
    });
  };

  const next = () => {
    if (screen === 0 && needNames) {
      setErr("Both names, please. Everything else is optional.");
      return;
    }
    setErr("");
    if (typeof screen === "number") {
      if (screen < steps - 1) setScreen((screen + 1) as Screen);
      else write();
    }
  };
  const back = () => {
    setErr("");
    if (typeof screen === "number" && screen > 0) setScreen((screen - 1) as Screen);
  };

  const toggleFn = (name: string) =>
    setA((p) => {
      const has = p.functions.some((f) => f.name === name);
      const list = has ? p.functions.filter((f) => f.name !== name) : [...p.functions, { name, date: name.startsWith("Wedding") ? p.date : "" }];
      // Keep them in the order of the day (the chip order).
      list.sort((x, y) => FUNCTIONS.indexOf(x.name) - FUNCTIONS.indexOf(y.name));
      return { ...p, functions: list.slice(0, 5) };
    });

  const body = useMemo((): { q: string; sub?: string; node: ReactNode } | null => {
    switch (screen) {
      case 0:
        return {
          q: "Who is getting married?",
          sub: "The names as you'd like them printed.",
          node: (
            <>
              <div className="gw-row2">
                <label className="gw-field">
                  <span>Bride&apos;s name</span>
                  <input ref={firstRef} className="gw-in" value={a.bride} maxLength={30} placeholder="e.g. Ishita" autoComplete="off" onChange={(e) => set("bride", e.target.value)} />
                </label>
                <label className="gw-field">
                  <span>Groom&apos;s name</span>
                  <input className="gw-in" value={a.groom} maxLength={30} placeholder="e.g. Aarav" autoComplete="off" onChange={(e) => set("groom", e.target.value)} />
                </label>
              </div>
              <p className="gw-k">Whose name comes first?</p>
              <div className="gw-chips" role="radiogroup" aria-label="Whose name comes first">
                {(["bride", "groom"] as const).map((o) => (
                  <button key={o} type="button" role="radio" aria-checked={a.first === o} className="gw-chip" onClick={() => set("first", o)}>
                    {o === "bride" ? `${a.bride || "Bride"} & ${a.groom || "Groom"}` : `${a.groom || "Groom"} & ${a.bride || "Bride"}`}
                  </button>
                ))}
              </div>
            </>
          ),
        };
      case 1:
        return {
          q: "When is the wedding?",
          sub: "The day of the pheras or the ceremony. The countdown counts down to it.",
          node: (
            <div className="gw-row2">
              <label className="gw-field">
                <span>Date</span>
                <input ref={firstRef} type="date" className="gw-in" value={a.date} onChange={(e) => set("date", e.target.value)} />
              </label>
              <label className="gw-field">
                <span>Muhurat / start time</span>
                <input type="time" className="gw-in" value={a.time} onChange={(e) => set("time", e.target.value)} />
              </label>
            </div>
          ),
        };
      case 2:
        return {
          q: "Where?",
          sub: "The city, and the main venue if you know it.",
          node: (
            <div className="gw-row2">
              <label className="gw-field">
                <span>City</span>
                <input ref={firstRef} className="gw-in" value={a.city} maxLength={40} placeholder="e.g. Udaipur" onChange={(e) => set("city", e.target.value)} />
              </label>
              <label className="gw-field">
                <span>Main venue (optional)</span>
                <input className="gw-in" value={a.venue} maxLength={80} placeholder="e.g. The Oberoi Udaivilas" onChange={(e) => set("venue", e.target.value)} />
              </label>
            </div>
          ),
        };
      case 3:
        return {
          q: "Which functions?",
          sub: "Tap the ones you're having (up to 5). Add a date to any you know.",
          node: (
            <>
              <div className="gw-chips">
                {FUNCTIONS.map((f) => {
                  const on = a.functions.some((x) => x.name === f);
                  return (
                    <button key={f} type="button" aria-pressed={on} className="gw-chip" onClick={() => toggleFn(f)}>
                      {on ? "✓ " : "+ "}
                      {f}
                    </button>
                  );
                })}
              </div>
              {a.functions.length > 0 && (
                <ul className="gw-fns">
                  {a.functions.map((f, i) => (
                    <li key={f.name}>
                      <b>{f.name}</b>
                      <input
                        type="date"
                        className="gw-in"
                        aria-label={`${f.name} date`}
                        value={f.date}
                        ref={i === 0 ? firstRef : undefined}
                        onChange={(e) => setA((p) => ({ ...p, functions: p.functions.map((x) => (x.name === f.name ? { ...x, date: e.target.value } : x)) }))}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </>
          ),
        };
      case 4:
        return {
          q: "And the families?",
          sub: "As the invitation should print them. Leave any blank.",
          node: (
            <>
              <label className="gw-field">
                <span>Bride&apos;s parents</span>
                <input ref={firstRef} className="gw-in" value={a.brideParents} maxLength={90} placeholder="e.g. Mrs. Meera & Mr. Arvind Rathore" onChange={(e) => set("brideParents", e.target.value)} />
              </label>
              <label className="gw-field">
                <span>Groom&apos;s parents</span>
                <input className="gw-in" value={a.groomParents} maxLength={90} placeholder="e.g. Mrs. Nandini & Mr. Sanjay Kapoor" onChange={(e) => set("groomParents", e.target.value)} />
              </label>
              <label className="gw-field">
                <span>With the blessings of (grandparents, optional)</span>
                <input className="gw-in" value={a.blessingsOf} maxLength={160} placeholder="e.g. Smt. Kamla Devi" onChange={(e) => set("blessingsOf", e.target.value)} />
              </label>
            </>
          ),
        };
      case 5:
        return {
          q: "How did you meet?",
          sub: "One or two lines, or a favourite memory. Optional, but it makes the story yours.",
          node: (
            <label className="gw-field">
              <span>Your story</span>
              <textarea ref={firstRef as unknown as React.Ref<HTMLTextAreaElement>} className="gw-in gw-area" rows={4} value={a.story} maxLength={600} placeholder="e.g. We met at a bus stop in Bengaluru in 2017 when it would not stop raining. He proposed on a boat in Udaipur." onChange={(e) => set("story", e.target.value)} />
            </label>
          ),
        };
      case 6:
        return {
          q: "How should it sound?",
          node: (
            <>
              <p className="gw-k">Tone</p>
              <div className="gw-chips" role="radiogroup" aria-label="Tone">
                {TONES.map((t) => (
                  <button key={t.id} type="button" role="radio" aria-checked={a.tone === t.id} className="gw-chip" onClick={() => set("tone", t.id)}>
                    {t.label}
                  </button>
                ))}
              </div>
              <p className="gw-k">Language</p>
              <div className="gw-chips" role="radiogroup" aria-label="Language">
                {LANGS.map((l) => (
                  <button key={l.id} type="button" role="radio" aria-checked={a.language === l.id} className="gw-chip" lang={l.id === "hi" ? "hi" : undefined} onClick={() => set("language", l.id)}>
                    {l.label}
                  </button>
                ))}
              </div>
            </>
          ),
        };
      case 7:
        return {
          q: "Someone guests can call?",
          sub: "Optional. Guests get a call button and a WhatsApp button.",
          node: (
            <>
              <div className="gw-row2">
                <label className="gw-field">
                  <span>Name</span>
                  <input ref={firstRef} className="gw-in" value={a.contactName} maxLength={40} placeholder="e.g. Rohan" onChange={(e) => set("contactName", e.target.value)} />
                </label>
                <label className="gw-field">
                  <span>Relation</span>
                  <input className="gw-in" value={a.contactRelation} maxLength={40} placeholder="e.g. Bride's brother" onChange={(e) => set("contactRelation", e.target.value)} />
                </label>
              </div>
              <label className="gw-field">
                <span>Phone</span>
                <input className="gw-in" type="tel" inputMode="tel" value={a.contactPhone} maxLength={20} placeholder="+91 98XXX XXXXX" onChange={(e) => set("contactPhone", e.target.value)} />
              </label>
            </>
          ),
        };
      default:
        return null;
    }
    // set/toggleFn are stable enough per render; the screen content depends on `a` and `screen`.
     
  }, [screen, a]);

  if (!open || typeof document === "undefined") return null;
  const n = typeof screen === "number" ? screen : steps;
  return createPortal(
    <div className="gw-shade" role="dialog" aria-modal="true" aria-labelledby="gw-q">
      <style>{GW_CSS}</style>
      <div className="gw-sheet">
        <header className="gw-top">
          <p className="gw-brand">✦ Let AI write it</p>
          {screen !== "writing" && (
            <button type="button" className="gw-x" onClick={onClose} aria-label="Close">
              ×
            </button>
          )}
        </header>
        {typeof screen === "number" && (
          <div className="gw-progress" aria-hidden>
            <i style={{ transform: `scaleX(${(n + 1) / steps})` }} />
          </div>
        )}

        <div className="gw-body">
          {body && (
            <>
              <p className="gw-step">
                Question {n + 1} of {steps}
              </p>
              <h2 className="gw-q" id="gw-q">
                {body.q}
              </h2>
              {body.sub && <p className="gw-sub">{body.sub}</p>}
              {body.node}
              {err && (
                <p className="gw-err" role="alert">
                  {err}
                </p>
              )}
            </>
          )}
          {screen === "writing" && (
            <div className="gw-writing" role="status" aria-live="polite">
              <span className="gw-spin" aria-hidden />
              <h2 className="gw-q" id="gw-q">
                Writing your invitation…
              </h2>
              <p className="gw-sub">The invitation, the functions, your story and the families. About ten seconds.</p>
            </div>
          )}
          {screen === "review" && (
            <>
              <h2 className="gw-q" id="gw-q">
                Here&apos;s what we wrote
              </h2>
              <StoryReview fill={fill} onDone={onClose} onRewrite={() => setScreen(0)} rewriteLabel="Change my answers" />
            </>
          )}
        </div>

        {typeof screen === "number" && (
          <footer className="gw-foot">
            <button type="button" className="gw-back" onClick={screen === 0 ? onClose : back}>
              {screen === 0 ? "I'll fill it myself" : "← Back"}
            </button>
            {screen > 0 && screen < steps - 1 && (
              <button type="button" className="gw-skip" onClick={next}>
                Skip
              </button>
            )}
            <button type="button" className="gw-next" onClick={next} disabled={fill.generating}>
              {screen === steps - 1 ? "✦ Write my invitation" : "Next →"}
            </button>
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
}

const GW_CSS = `
.gw-shade { position: fixed; inset: 0; z-index: 2147483000; display: flex; align-items: flex-end; justify-content: center; background: rgba(20,34,48,.42); backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px); animation: gw-fade .25s ease both; font-family: var(--vw-font-ui, system-ui, sans-serif); color: #1F3346; }
@media (min-width: 720px) { .gw-shade { align-items: center; padding: 24px; } }
@keyframes gw-fade { from { opacity: 0; } to { opacity: 1; } }
.gw-sheet { position: relative; display: flex; flex-direction: column; width: 100%; max-width: 640px; height: min(100dvh, 760px); max-height: 100dvh; background: linear-gradient(180deg, #F3F8FC, #FFFEFA 30%); border-radius: 24px 24px 0 0; box-shadow: 0 -20px 60px -20px rgba(20,34,48,.5); animation: gw-up .4s cubic-bezier(.22,1,.36,1) both; overflow: hidden; }
@media (min-width: 720px) { .gw-sheet { border-radius: 24px; height: auto; min-height: 520px; max-height: min(88dvh, 820px); } }
@keyframes gw-up { from { transform: translateY(40px); opacity: 0; } to { transform: none; opacity: 1; } }
.gw-top { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px 6px 20px; }
.gw-brand { margin: 0; font: 700 12px/1 var(--vw-font-ui, system-ui); letter-spacing: .22em; text-transform: uppercase; color: #B8913E; }
.gw-x { width: 44px; height: 44px; border-radius: 50%; border: 1px solid #D9CBA6; background: #FFFEFA; font-size: 24px; line-height: 1; color: #1F3346; cursor: pointer; }
.gw-progress { height: 4px; margin: 4px 20px 0; border-radius: 4px; background: #E3ECF3; overflow: hidden; }
.gw-progress i { display: block; height: 100%; background: linear-gradient(90deg, #C9A24A, #3E6A8A); transform-origin: 0 50%; transition: transform .4s cubic-bezier(.22,1,.36,1); }
.gw-body { flex: 1; overflow-y: auto; padding: 18px 20px 24px; overscroll-behavior: contain; }
.gw-step { margin: 0 0 6px; font: 600 12.5px/1 var(--vw-font-ui, system-ui); letter-spacing: .08em; text-transform: uppercase; color: #5B6E80; }
.gw-q { margin: 0 0 6px; font: 600 clamp(24px, 6vw, 30px)/1.2 var(--vw-font-serif, Georgia, serif); color: #1F3346; }
.gw-sub { margin: 0 0 18px; font-size: 14.5px; line-height: 1.5; color: #5B6E80; }
.gw-k { margin: 18px 0 8px; font: 700 12px/1 var(--vw-font-ui, system-ui); letter-spacing: .12em; text-transform: uppercase; color: #3E6A8A; }
.gw-row2 { display: grid; gap: 0 12px; }
@media (min-width: 520px) { .gw-row2 { grid-template-columns: 1fr 1fr; } }
.gw-field { display: flex; flex-direction: column; gap: 6px; margin: 0 0 14px; font: 600 13.5px/1.3 var(--vw-font-ui, system-ui); color: #1F3346; }
.gw-in { width: 100%; min-height: 50px; padding: 0 14px; border-radius: 14px; border: 1.5px solid #D9CBA6; background: #fff; font: 400 16px/1.3 var(--vw-font-ui, system-ui); color: #1F3346; outline: none; box-sizing: border-box; }
.gw-in:focus { border-color: #3E6A8A; box-shadow: 0 0 0 3px rgba(62,106,138,.18); }
.gw-area { min-height: 130px; padding: 12px 14px; line-height: 1.55; resize: vertical; }
.gw-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.gw-chip { min-height: 44px; padding: 0 16px; border-radius: 999px; border: 1.5px solid #D9CBA6; background: #FFFEFA; font: 600 14px/1 var(--vw-font-ui, system-ui); color: #1F3346; cursor: pointer; }
.gw-chip[aria-checked=true], .gw-chip[aria-pressed=true] { background: #3E6A8A; border-color: #3E6A8A; color: #fff; }
.gw-fns { list-style: none; margin: 16px 0 0; padding: 0; display: grid; gap: 8px; }
.gw-fns li { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr); gap: 10px; align-items: center; padding: 8px 8px 8px 14px; border-radius: 14px; background: #fff; border: 1px solid #E5DCC4; }
.gw-fns b { font-size: 15px; overflow-wrap: anywhere; }
.gw-err { margin: 10px 0 0; padding: 10px 12px; border-radius: 12px; background: #FDECEC; color: #9B2C2C; font-size: 14px; }
.gw-foot { display: flex; align-items: center; gap: 8px; padding: 12px 16px max(12px, env(safe-area-inset-bottom)); border-top: 1px solid #E8E0CC; background: rgba(255,254,250,.96); }
.gw-back, .gw-skip { min-height: 48px; padding: 0 14px; border: 0; border-radius: 999px; background: none; font: 600 14.5px/1 var(--vw-font-ui, system-ui); color: #3E6A8A; cursor: pointer; }
.gw-skip { color: #5B6E80; }
.gw-next { margin-left: auto; min-height: 50px; padding: 0 22px; border: 0; border-radius: 999px; font: 700 15.5px/1 var(--vw-font-ui, system-ui); color: #FFFDF6; background: linear-gradient(135deg, #5C8BAD, #284D69); box-shadow: 0 12px 24px -14px rgba(31,62,87,.8); cursor: pointer; white-space: nowrap; }
.gw-next:disabled { opacity: .7; cursor: progress; }
.gw-writing { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; min-height: 320px; gap: 10px; }
.gw-spin { width: 54px; height: 54px; border-radius: 50%; border: 3px solid #E3ECF3; border-top-color: #C9A24A; animation: gw-spin 1s linear infinite; }
@keyframes gw-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .gw-shade, .gw-sheet { animation: none; } .gw-spin { animation-duration: 3s; } }
`;
