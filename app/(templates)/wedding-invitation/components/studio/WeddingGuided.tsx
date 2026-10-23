"use client";

// ─── "Let AI write it": six quick wedding questions → the fill → the review ──
//
// The shared GuidedQuestions is relationship-shaped (how long together, what
// you love…). A wedding invitation needs other facts, so this template asks its
// own six, one screen each, in the order a family thinks of them:
//   1 the couple (bride, groom, whose name first)   4 the functions (chips + dates)
//   2 the big day (date, muhurat / start time)       5 the families + who guests call
//   3 where (city, main venue)                       6 how they met + tone + language
// Only the two names are required; every other screen has "Skip".
//
// The answers become one plain-English description (composeWeddingStory, no
// model involved) plus hints {tone, occasion: "wedding"}, sent with
// the hook's generateGuided. The AI writes the prose (invitation in English and
// Hindi, the story, dress codes, the closing line) and fills the rest; then the
// shared StoryReview lists EVERY filled field to read and edit in place, with
// the still-empty ones underneath. "Looks good" closes into the form.
// Facts the sender typed (names, date, time, contact) are authoritative: the
// studio writes them back over whatever the model returned (onAnswers).
//
// Answers persist for the tab under ss:guided-wedding:v1 (separate from the
// relationship answers), so the next wedding template starts pre-filled.

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import StoryReview from "@/components/story/StoryReview";
import type { UseStoryFillResult } from "@/hooks/useStoryFill";

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
  contactName: string;
  contactPhone: string;
  story: string;
  tone: string;
  language: string;
}

const KEY = "ss:guided-wedding:v1";
const EMPTY: WeddingAnswers = {
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
  contactName: "",
  contactPhone: "",
  story: "",
  tone: "Traditional",
  language: "English",
};

export const WEDDING_FUNCTIONS = ["Roka", "Engagement", "Haldi", "Mehendi", "Sangeet", "Baraat", "Wedding (Pheras)", "Reception", "Cocktail"] as const;
const TONES = ["Traditional", "Royal", "Warm & modern", "Faith-filled", "Fun"] as const;
const LANGS = ["English", "Hindi", "Hinglish"] as const;
const STEPS = 6;

const str = (v: unknown, max = 400) => (typeof v === "string" ? v.slice(0, max) : "");
function load(): WeddingAnswers {
  try {
    const raw = JSON.parse(window.sessionStorage.getItem(KEY) ?? "null") as Record<string, unknown> | null;
    if (!raw || typeof raw !== "object") return EMPTY;
    const fns = Array.isArray(raw.functions) ? raw.functions : [];
    return {
      ...EMPTY,
      bride: str(raw.bride, 30),
      groom: str(raw.groom, 30),
      first: raw.first === "groom" ? "groom" : "bride",
      date: /^\d{4}-\d{2}-\d{2}$/.test(str(raw.date)) ? str(raw.date) : "",
      time: /^\d{2}:\d{2}$/.test(str(raw.time)) ? str(raw.time) : "",
      city: str(raw.city, 60),
      venue: str(raw.venue, 80),
      functions: fns
        .filter((f): f is Record<string, unknown> => !!f && typeof f === "object")
        .map((f) => ({ name: str(f.name, 40), date: /^\d{4}-\d{2}-\d{2}$/.test(str(f.date)) ? str(f.date) : "" }))
        .filter((f) => f.name)
        .slice(0, 8),
      brideParents: str(raw.brideParents, 120),
      groomParents: str(raw.groomParents, 120),
      blessingsOf: str(raw.blessingsOf, 160),
      contactName: str(raw.contactName, 40),
      contactPhone: str(raw.contactPhone, 16),
      story: str(raw.story, 600),
      tone: TONES.includes(raw.tone as (typeof TONES)[number]) ? (raw.tone as string) : EMPTY.tone,
      language: LANGS.includes(raw.language as (typeof LANGS)[number]) ? (raw.language as string) : EMPTY.language,
    };
  } catch {
    return EMPTY;
  }
}

/** "2026-12-12" → "Saturday, 12 December 2026". */
function spoken(date: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return "";
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}
/** "19:30" → "7:30 pm". */
function clock(t: string): string {
  if (!/^\d{2}:\d{2}$/.test(t)) return "";
  const [h, m] = t.split(":").map(Number);
  return `${((h + 11) % 12) + 1}${m ? `:${String(m).padStart(2, "0")}` : ""} ${h < 12 ? "am" : "pm"}`;
}

/**
 * The answers as one plain description the fill reads like any sender's own
 * words. Deterministic; it states facts and never adds any.
 */
export function composeWeddingStory(a: WeddingAnswers): string {
  const b = a.bride.trim();
  const g = a.groom.trim();
  const lines: string[] = [];
  lines.push(`${b} (the bride) and ${g} (the groom) are getting married.${a.first === "groom" ? ` Print ${g}'s name first.` : ""}`);
  const when = [a.date ? `on ${spoken(a.date)} (${a.date})` : "", a.time ? `at ${clock(a.time)}` : ""].filter(Boolean).join(" ");
  const where = [a.venue.trim(), a.city.trim()].filter(Boolean).join(", ");
  if (when || where) lines.push(`The wedding ceremony is ${[when, where ? `at ${where}` : ""].filter(Boolean).join(" ")}.`);
  const fns = a.functions.filter((f) => f.name.trim());
  if (fns.length) {
    lines.push(`The functions, in order: ${fns.map((f) => `${f.name.trim()}${f.date ? ` on ${spoken(f.date)} (${f.date})` : ""}`).join("; ")}.`);
    // Say what is NOT known, or the model copies the ceremony's time and venue onto every function.
    lines.push(`The other functions' start times are not decided yet${a.city.trim() ? ` and they are all in ${a.city.trim()}` : ""}; give each function its customary dress code.`);
  }
  if (a.brideParents.trim()) lines.push(`The bride's parents are ${a.brideParents.trim()}.`);
  if (a.groomParents.trim()) lines.push(`The groom's parents are ${a.groomParents.trim()}.`);
  if (a.blessingsOf.trim()) lines.push(`With the blessings of ${a.blessingsOf.trim()}.`);
  if (a.contactName.trim() && a.contactPhone.trim()) lines.push(`For any questions guests can call ${a.contactName.trim()} on ${a.contactPhone.trim()}.`);
  if (a.story.trim()) lines.push(`How they met: ${a.story.trim().replace(/\s+/g, " ")}`);
  lines.push(`Tone: ${a.tone.toLowerCase()}.`);
  if (a.language === "Hindi") lines.push("Write the invitation in English, and also give a warm Hindi version (Devanagari).");
  else if (a.language === "Hinglish") lines.push("Write the main invitation in Hinglish (Hindi in Latin letters), warm and simple, and the Hindi version in Devanagari.");
  else lines.push("Write the invitation in English, and add a short Hindi blessing line in Devanagari.");
  return lines.join(" ");
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" className={`wig-chip${on ? " is-on" : ""}`} aria-pressed={on} onClick={onClick}>
      {on ? "✓ " : "+ "}
      {children}
    </button>
  );
}

function Q({ label, hint, htmlFor, children }: { label: string; hint?: string; htmlFor?: string; children: ReactNode }) {
  return (
    <div className="wig-field">
      <label className="wig-label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint && <p className="wig-hint">{hint}</p>}
    </div>
  );
}

const WRITING = ["Reading your answers…", "Writing the invitation…", "Adding a Hindi version…", "Setting out every function…", "Telling your story…", "Almost there…"];

export interface WeddingGuidedProps {
  open: boolean;
  fill: UseStoryFillResult;
  /** The typed facts, just before the fill runs (the studio writes them back over the model's). */
  onAnswers: (a: WeddingAnswers) => void;
  onClose: () => void;
}

export default function WeddingGuided({ open, fill, onAnswers, onClose }: WeddingGuidedProps) {
  const [a, setA] = useState<WeddingAnswers>(EMPTY);
  const [step, setStep] = useState(0);
  const [stage, setStage] = useState<"ask" | "writing" | "review">("ask");
  const [err, setErr] = useState("");
  const [tick, setTick] = useState(0);
  const loaded = useRef(false);
  const wasGenerating = useRef(false);
  const body = useRef<HTMLDivElement>(null);

  // Start from this tab's earlier answers (another wedding template, or a second go).
  useEffect(() => {
    if (!open || loaded.current) return;
    loaded.current = true;
    const t = window.setTimeout(() => setA(load()), 0);
    return () => window.clearTimeout(t);
  }, [open]);
  useEffect(() => {
    if (!loaded.current) return;
    try {
      window.sessionStorage.setItem(KEY, JSON.stringify(a));
    } catch {}
  }, [a]);

  // The page behind stays still.
  useEffect(() => {
    if (!open) return;
    const el = document.documentElement;
    const prev = el.style.overflow;
    el.style.overflow = "hidden";
    return () => {
      el.style.overflow = prev;
    };
  }, [open]);

  // writing → review (or back to the questions with the error).
  useEffect(() => {
    if (fill.generating) {
      wasGenerating.current = true;
      return;
    }
    if (!wasGenerating.current) return;
    wasGenerating.current = false;
    const t = window.setTimeout(() => {
      if (fill.error && fill.mode !== "done") {
        setErr(fill.error);
        setStage("ask");
      } else if (fill.mode === "done") setStage("review");
      else setStage("ask");
    }, 0);
    return () => window.clearTimeout(t);
  }, [fill.generating, fill.error, fill.mode]);

  useEffect(() => {
    if (stage !== "writing") return;
    const t = window.setInterval(() => setTick((n) => n + 1), 1600);
    return () => window.clearInterval(t);
  }, [stage]);

  useEffect(() => {
    body.current?.scrollTo({ top: 0 });
    const first = body.current?.querySelector<HTMLInputElement>("input, textarea");
    if (stage === "ask" && first && window.matchMedia("(pointer: fine)").matches) first.focus({ preventScroll: true });
  }, [step, stage]);

  const set = <K extends keyof WeddingAnswers>(k: K, v: WeddingAnswers[K]) => setA((p) => ({ ...p, [k]: v }));
  const namesOk = a.bride.trim().length > 0 && a.groom.trim().length > 0;
  const story = useMemo(() => composeWeddingStory(a), [a]);

  const close = () => {
    setStage("ask");
    setErr("");
    if (fill.mode === "done") fill.setMode("manual");
    onClose();
  };
  const next = () => {
    if (step === 0 && !namesOk) {
      setErr("Both names, please. Everything else is optional.");
      return;
    }
    setErr("");
    setStep((s) => Math.min(STEPS - 1, s + 1));
  };
  const write = () => {
    if (!namesOk) {
      setStep(0);
      setErr("Both names, please. Everything else is optional.");
      return;
    }
    setErr("");
    onAnswers(a);
    setStage("writing");
    fill.generateGuided({
      people: { userName: "", partnerName: "", bestFriendName: "", partnerPronouns: "" },
      story,
      // No `language` hint: the server applies it to EVERY field, and this page wants English (or
      // Hinglish) beside a Devanagari Hindi version. The description says which, in words.
      hints: { tone: a.tone.toLowerCase(), occasion: "wedding" },
    });
  };

  if (!open || typeof document === "undefined") return null;
  const fnOn = (n: string) => a.functions.some((f) => f.name === n);
  const toggleFn = (n: string) =>
    set(
      "functions",
      fnOn(n) ? a.functions.filter((f) => f.name !== n) : [...a.functions, { name: n, date: n.startsWith("Wedding") ? a.date : "" }].sort((x, y) => WEDDING_FUNCTIONS.indexOf(x.name as never) - WEDDING_FUNCTIONS.indexOf(y.name as never)),
    );

  const screens: { title: string; sub: string; body: ReactNode }[] = [
    {
      title: "Whose wedding is it?",
      sub: "Names exactly as they should be printed. First names are perfect.",
      body: (
        <>
          <div className="wig-row2">
            <Q label="Bride's name" htmlFor="wig-bride">
              <input id="wig-bride" className="wig-input" value={a.bride} maxLength={30} autoComplete="off" placeholder="e.g. Aanya" onChange={(e) => set("bride", e.target.value)} />
            </Q>
            <Q label="Groom's name" htmlFor="wig-groom">
              <input id="wig-groom" className="wig-input" value={a.groom} maxLength={30} autoComplete="off" placeholder="e.g. Vihaan" onChange={(e) => set("groom", e.target.value)} />
            </Q>
          </div>
          <p className="wig-label">Whose name comes first?</p>
          <div className="wig-seg" role="radiogroup" aria-label="Whose name comes first">
            {(["bride", "groom"] as const).map((o) => (
              <button key={o} type="button" role="radio" aria-checked={a.first === o} onClick={() => set("first", o)}>
                {o === "bride" ? `${a.bride.trim() || "Bride"} & ${a.groom.trim() || "Groom"}` : `${a.groom.trim() || "Groom"} & ${a.bride.trim() || "Bride"}`}
              </button>
            ))}
          </div>
        </>
      ),
    },
    {
      title: "When is the big day?",
      sub: "The wedding ceremony itself: the countdown runs to it.",
      body: (
        <div className="wig-row2">
          <Q label="Wedding date" htmlFor="wig-date">
            <input id="wig-date" type="date" className="wig-input" value={a.date} onChange={(e) => set("date", e.target.value)} />
          </Q>
          <Q label="Muhurat / start time" htmlFor="wig-time" hint="Optional">
            <input id="wig-time" type="time" className="wig-input" value={a.time} onChange={(e) => set("time", e.target.value)} />
          </Q>
        </div>
      ),
    },
    {
      title: "Where is it?",
      sub: "The city and the main venue. You can add a Google Maps link later.",
      body: (
        <div className="wig-row2">
          <Q label="City" htmlFor="wig-city">
            <input id="wig-city" className="wig-input" value={a.city} maxLength={60} placeholder="e.g. Udaipur" onChange={(e) => set("city", e.target.value)} />
          </Q>
          <Q label="Main venue" htmlFor="wig-venue">
            <input id="wig-venue" className="wig-input" value={a.venue} maxLength={80} placeholder="e.g. Jagmandir Island Palace" onChange={(e) => set("venue", e.target.value)} />
          </Q>
        </div>
      ),
    },
    {
      title: "Which functions are you having?",
      sub: "Tap each one. Add a date if you know it; we'll write a dress code for each.",
      body: (
        <>
          <div className="wig-chips">
            {WEDDING_FUNCTIONS.map((n) => (
              <Chip key={n} on={fnOn(n)} onClick={() => toggleFn(n)}>
                {n}
              </Chip>
            ))}
          </div>
          {a.functions.length > 0 && (
            <ul className="wig-fns">
              {a.functions.map((f, i) => (
                <li key={f.name}>
                  <span>{f.name}</span>
                  <input
                    type="date"
                    className="wig-input"
                    aria-label={`${f.name} date`}
                    value={f.date}
                    onChange={(e) => set("functions", a.functions.map((q, j) => (j === i ? { ...q, date: e.target.value } : q)))}
                  />
                </li>
              ))}
            </ul>
          )}
        </>
      ),
    },
    {
      title: "Who is inviting?",
      sub: "Parents' names as on a printed card, and one person guests can call.",
      body: (
        <>
          <div className="wig-row2">
            <Q label="Bride's parents" htmlFor="wig-bp">
              <input id="wig-bp" className="wig-input" value={a.brideParents} maxLength={120} placeholder="e.g. Meera & Raghav Rathore" onChange={(e) => set("brideParents", e.target.value)} />
            </Q>
            <Q label="Groom's parents" htmlFor="wig-gp">
              <input id="wig-gp" className="wig-input" value={a.groomParents} maxLength={120} placeholder="e.g. Kavita & Arjun Singhania" onChange={(e) => set("groomParents", e.target.value)} />
            </Q>
          </div>
          <Q label="With the blessings of (optional)" htmlFor="wig-bo">
            <input id="wig-bo" className="wig-input" value={a.blessingsOf} maxLength={160} placeholder="e.g. Dadi ji, Smt. Kamla Devi" onChange={(e) => set("blessingsOf", e.target.value)} />
          </Q>
          <div className="wig-row2">
            <Q label="Who should guests call?" htmlFor="wig-cn" hint="Optional">
              <input id="wig-cn" className="wig-input" value={a.contactName} maxLength={40} placeholder="e.g. Kabir, Aanya's brother" onChange={(e) => set("contactName", e.target.value)} />
            </Q>
            <Q label="Their phone" htmlFor="wig-cp">
              <input id="wig-cp" className="wig-input" type="tel" inputMode="tel" autoComplete="off" value={a.contactPhone} maxLength={16} placeholder="+91 98290 11223" onChange={(e) => set("contactPhone", e.target.value)} />
            </Q>
          </div>
        </>
      ),
    },
    {
      title: "A little about you two",
      sub: "How you met, or one memory. A sentence or two is plenty.",
      body: (
        <>
          <Q label="How you met (optional)" htmlFor="wig-story">
            <textarea id="wig-story" className="wig-input wig-area" rows={4} value={a.story} maxLength={600} placeholder="e.g. We met at a friend's wedding in Jaipur in 2019, argued about the best chaat in town, and never stopped talking." onChange={(e) => set("story", e.target.value)} />
          </Q>
          <p className="wig-label">The feel of the invitation</p>
          <div className="wig-chips">
            {TONES.map((t) => (
              <button key={t} type="button" className={`wig-chip${a.tone === t ? " is-on" : ""}`} aria-pressed={a.tone === t} onClick={() => set("tone", t)}>
                {t}
              </button>
            ))}
          </div>
          <p className="wig-label">Language</p>
          <div className="wig-chips">
            {LANGS.map((t) => (
              <button key={t} type="button" className={`wig-chip${a.language === t ? " is-on" : ""}`} aria-pressed={a.language === t} onClick={() => set("language", t)}>
                {t}
              </button>
            ))}
          </div>
        </>
      ),
    },
  ];
  const sc = screens[step];
  const last = step === STEPS - 1;

  return createPortal(
    <div className="wig-scrim" role="presentation">
      <style>{WIG_CSS}</style>
      <div className="wig" role="dialog" aria-modal="true" aria-labelledby="wig-title">
        <header className="wig-top">
          <div className="wig-top-row">
            <p className="wig-kicker">✦ {stage === "review" ? "Here's your invitation" : "Let AI write it"}</p>
            <button type="button" className="wig-x" onClick={close} aria-label="Close and fill it in myself">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          {stage === "ask" && (
            <div className="wig-progress" aria-label={`Question ${step + 1} of ${STEPS}`}>
              {Array.from({ length: STEPS }, (_, i) => (
                <button key={i} type="button" className={`wig-dot${i <= step ? " is-on" : ""}`} aria-label={`Question ${i + 1}`} aria-current={i === step ? "step" : undefined} onClick={() => (i === 0 || namesOk ? setStep(i) : setErr("Both names, please. Everything else is optional."))} />
              ))}
            </div>
          )}
        </header>

        <div ref={body} className="wig-body">
          {stage === "ask" && (
            <>
              <p className="wig-step">
                Question {step + 1} of {STEPS}
              </p>
              <h2 id="wig-title" className="wig-title">
                {sc.title}
              </h2>
              <p className="wig-sub">{sc.sub}</p>
              {sc.body}
              {err && (
                <p className="wig-err" role="alert">
                  {err}
                </p>
              )}
            </>
          )}
          {stage === "writing" && (
            <div className="wig-writing" role="status" aria-live="polite">
              <span className="wig-bloom" aria-hidden>
                {Array.from({ length: 8 }, (_, i) => (
                  <i key={i} style={{ transform: `rotate(${i * 45}deg)` }} />
                ))}
              </span>
              <h2 id="wig-title" className="wig-title">
                {WRITING[tick % WRITING.length]}
              </h2>
              <p className="wig-sub">
                {a.bride.trim() || "Bride"} &amp; {a.groom.trim() || "Groom"} · this takes about fifteen seconds.
              </p>
            </div>
          )}
          {stage === "review" && (
            <div className="wig-review">
              <h2 id="wig-title" className="wig-title">
                Read it through
              </h2>
              <p className="wig-sub">Everything the AI filled is below. Tap any line to change it; the empty ones are yours to add.</p>
              <StoryReview
                fill={fill}
                onDone={close}
                onRewrite={() => {
                  fill.setMode("manual");
                  setStep(0);
                  setStage("ask");
                }}
                rewriteLabel="Change my answers"
              />
            </div>
          )}
        </div>

        {stage === "ask" && (
          <footer className="wig-foot">
            {step > 0 ? (
              <button type="button" className="wig-btn wig-btn-ghost" onClick={() => setStep((s) => s - 1)}>
                Back
              </button>
            ) : (
              <button type="button" className="wig-btn wig-btn-ghost" onClick={close}>
                I&apos;ll fill it myself
              </button>
            )}
            <span className="wig-flex" />
            {!last && step > 0 && (
              <button type="button" className="wig-btn wig-btn-link" onClick={() => setStep((s) => s + 1)}>
                Skip
              </button>
            )}
            {last ? (
              <button type="button" className="wig-btn wig-btn-go" onClick={write} disabled={fill.generating}>
                ✦ Write my invitation
              </button>
            ) : (
              <button type="button" className="wig-btn wig-btn-go" onClick={next}>
                Next
              </button>
            )}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
}

const WIG_CSS = `
.wig-scrim { position: fixed; inset: 0; z-index: 400; display: flex; align-items: flex-end; justify-content: center; background: rgba(60,22,32,.42); animation: wig-fade .25s ease both; font-family: var(--vw-font-ui, system-ui, sans-serif); }
.wig { position: relative; width: 100%; max-width: 600px; height: 100dvh; max-height: 100dvh; display: flex; flex-direction: column; background: linear-gradient(180deg, #FFFBF9 0%, #FDF1EE 100%); color: #4A2630; animation: wig-up .38s cubic-bezier(.22,.7,.2,1) both; }
@media (min-width: 640px) { .wig-scrim { align-items: center; padding: 24px; } .wig { height: auto; max-height: min(860px, calc(100dvh - 48px)); border-radius: 28px; box-shadow: 0 40px 80px -30px rgba(60,20,30,.55); } }
.wig::before { content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none; box-shadow: inset 0 0 0 1px rgba(180,86,110,.22); }
.wig-top { flex: none; padding: max(10px, env(safe-area-inset-top)) 16px 10px; border-bottom: 1px solid rgba(180,86,110,.14); }
.wig-top-row { display: flex; align-items: center; gap: 8px; }
.wig-kicker { flex: 1; margin: 0; font: 700 11.5px/1.2 var(--vw-font-ui, system-ui); letter-spacing: .2em; text-transform: uppercase; color: #9E4560; }
.wig-x { width: 44px; height: 44px; display: grid; place-items: center; border: 0; border-radius: 50%; background: none; color: #86606A; cursor: pointer; }
.wig-progress { display: flex; gap: 6px; margin-top: 4px; }
.wig-dot { flex: 1; height: 24px; border: 0; padding: 10px 0; background: none; cursor: pointer; }
.wig-dot::before { content: ""; display: block; height: 4px; border-radius: 4px; background: rgba(180,86,110,.18); transition: background .3s ease; }
.wig-dot.is-on::before { background: linear-gradient(90deg, #8E3B52, #C47C82); }
.wig-body { flex: 1; overflow-y: auto; padding: 18px 18px 24px; -webkit-overflow-scrolling: touch; }
.wig-step { margin: 0; font: 600 12px/1 var(--vw-font-ui, system-ui); letter-spacing: .12em; text-transform: uppercase; color: #B07A64; }
.wig-title { margin: 8px 0 6px; font: 600 clamp(24px, 6.6vw, 30px)/1.2 var(--vw-font-serif, Georgia, serif); color: #4A2630; }
.wig-sub { margin: 0 0 18px; font-size: 15px; line-height: 1.5; color: #86606A; }
.wig-row2 { display: grid; gap: 0 12px; grid-template-columns: minmax(0, 1fr); }
@media (min-width: 520px) { .wig-row2 { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); } }
.wig-field { margin-bottom: 14px; min-width: 0; }
.wig-label { display: block; margin: 0 0 6px; font: 700 13.5px/1.3 var(--vw-font-ui, system-ui); color: #6A3A46; }
.wig-hint { margin: 5px 0 0; font-size: 12.5px; color: #A08088; }
.wig-input { width: 100%; min-height: 50px; padding: 0 14px; border-radius: 14px; border: 1.5px solid #EFD3CF; background: #FFFEFD; font: 400 16px/1.3 var(--vw-font-ui, system-ui); color: #4A2630; outline: none; transition: border-color .2s ease, box-shadow .2s ease; -webkit-appearance: none; appearance: none; }
.wig-input:focus { border-color: #B4566E; box-shadow: 0 0 0 4px rgba(180,86,110,.14); }
.wig-area { padding: 12px 14px; min-height: 120px; line-height: 1.5; resize: vertical; }
.wig-seg { display: flex; flex-wrap: wrap; gap: 6px; padding: 4px; border-radius: 18px; background: #FBE9E6; }
.wig-seg button { flex: 1 1 140px; min-height: 46px; padding: 0 12px; border: 0; border-radius: 14px; background: none; font: 600 14.5px/1.2 var(--vw-font-ui, system-ui); color: #6A3A46; cursor: pointer; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.wig-seg button[aria-checked=true] { background: #fff; color: #8E3B52; box-shadow: 0 6px 14px -8px rgba(110,40,58,.45), inset 0 0 0 1.5px #B4566E; }
.wig-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
.wig-chip { min-height: 44px; padding: 0 16px; border-radius: 999px; border: 1.5px solid #EFD3CF; background: #fff; font: 600 14px/1 var(--vw-font-ui, system-ui); color: #6A3A46; cursor: pointer; transition: background .2s ease, border-color .2s ease; }
.wig-chip.is-on { background: #8E3B52; border-color: #8E3B52; color: #FFF7F5; }
.wig-fns { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.wig-fns li { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr); align-items: center; gap: 10px; padding: 8px 8px 8px 14px; border-radius: 16px; background: #fff; box-shadow: inset 0 0 0 1px #F2DCD8; }
.wig-fns li > span { font: 600 15px/1.2 var(--vw-font-ui, system-ui); color: #4A2630; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.wig-fns .wig-input { min-height: 46px; }
.wig-err { margin: 6px 0 0; font-size: 14px; font-weight: 600; color: #B3261E; }
.wig-foot { flex: none; display: flex; align-items: center; gap: 8px; padding: 12px 16px max(12px, env(safe-area-inset-bottom)); border-top: 1px solid rgba(180,86,110,.14); background: rgba(255,251,249,.96); }
.wig-flex { flex: 1; }
.wig-btn { min-height: 48px; padding: 0 18px; border-radius: 999px; border: 0; font: 700 15px/1 var(--vw-font-ui, system-ui); cursor: pointer; white-space: nowrap; }
.wig-btn:disabled { opacity: .6; cursor: progress; }
.wig-btn-go { color: #FFF7F5; background: linear-gradient(115deg, #8E3B52, #B4566E 55%, #CF8783); box-shadow: 0 12px 24px -12px rgba(110,40,58,.75); }
.wig-btn-ghost { color: #6A3A46; background: #fff; box-shadow: inset 0 0 0 1.5px #EFD3CF; }
.wig-btn-link { color: #9E4560; background: none; padding: 0 10px; }
@media (max-width: 380px) { .wig-btn { padding: 0 14px; font-size: 14px; } }
.wig-writing { min-height: 52vh; display: grid; place-content: center; justify-items: center; text-align: center; gap: 4px; }
.wig-bloom { position: relative; width: 84px; height: 84px; margin-bottom: 14px; animation: wig-spin 6s linear infinite; }
.wig-bloom i { position: absolute; left: 50%; top: 0; width: 22px; height: 42px; margin-left: -11px; border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%; transform-origin: 50% 100%; background: linear-gradient(180deg, #F6C9CF, #E8A1B0); opacity: .85; }
.wig-bloom i:nth-child(2n) { background: linear-gradient(180deg, #FBE3D6, #E9B9A0); }
.wig-review .wig-sub { margin-bottom: 10px; }
@keyframes wig-spin { to { transform: rotate(360deg); } }
@keyframes wig-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes wig-up { from { transform: translateY(24px); opacity: 0; } to { transform: none; opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .wig, .wig-scrim, .wig-bloom { animation: none !important; } }
`;
