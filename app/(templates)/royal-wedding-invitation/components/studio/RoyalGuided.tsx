"use client";

// ─── "Answer a few quick questions": the guided AI fill for a wedding ────────
// The shared GuidedQuestions is relationship-shaped (their name, your name,
// how you met…), so this template asks its own eight short wedding questions,
// one per screen, with a progress rail:
//   1 the couple (+ whose name comes first)   5 families + blessings of
//   2 the date, start time, muhurat           6 how they met (optional)
//   3 city + the main venue                   7 tone + language
//   4 the functions (chips, a date each)      8 one contact person (optional)
// Only the names are required. The answers become a plain-English
// description (composeWeddingStory) + hints, sent through the story-fill
// hook's generateGuided; the hook fills the whole form and the shared
// StoryReview shows every filled field (and every one still empty), each
// editable in place, before "Looks good" returns to the studio.
// Answers are kept for the tab under ss:guided-wedding:v1 (separate from the
// relationship answers), so the next wedding template starts pre-filled.

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import StoryReview from "@/components/story/StoryReview";
import type { UseStoryFillResult } from "@/hooks/useStoryFill";

export const GUIDED_WEDDING_KEY = "ss:guided-wedding:v1";

export interface WeddingAnswers {
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
  story: string;
  tone: string;
  language: "English" | "Hindi" | "Hinglish";
  contactName: string;
  contactPhone: string;
}

const EMPTY: WeddingAnswers = {
  bride: "",
  groom: "",
  first: "bride",
  date: "",
  time: "",
  muhurat: "",
  city: "",
  venue: "",
  functions: [],
  brideParents: "",
  groomParents: "",
  blessingsOf: "",
  story: "",
  tone: "Royal",
  language: "English",
  contactName: "",
  contactPhone: "",
};

const FUNCTIONS = ["Roka", "Engagement", "Haldi", "Mehendi", "Sangeet", "Baraat", "Wedding (Pheras)", "Reception"];
const TONES = ["Traditional", "Royal", "Warm & modern", "Faith-filled", "Fun"];
const LANGS: WeddingAnswers["language"][] = ["English", "Hindi", "Hinglish"];

function load(): WeddingAnswers {
  try {
    const raw = window.sessionStorage.getItem(GUIDED_WEDDING_KEY);
    if (!raw) return EMPTY;
    const v = JSON.parse(raw) as Partial<WeddingAnswers>;
    return { ...EMPTY, ...v, functions: Array.isArray(v.functions) ? v.functions.filter((f) => f && typeof f.name === "string").slice(0, 8) : [] };
  } catch {
    return EMPTY;
  }
}

const longDate = (iso: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, d)));
};
const clock = (hhmm: string) => {
  const m = /^(\d{2}):(\d{2})$/.exec(hhmm);
  if (!m) return "";
  const h = Number(m[1]);
  return `${h % 12 || 12}${m[2] === "00" ? "" : `:${m[2]}`} ${h < 12 ? "am" : "pm"}`;
};

/** The answers as a plain description the fill model reads like any sender's story. Deterministic. */
export function composeWeddingStory(a: WeddingAnswers): string {
  const first = a.first === "groom" ? a.groom : a.bride;
  const second = a.first === "groom" ? a.bride : a.groom;
  const out: string[] = [];
  const when = [longDate(a.date) && `on ${longDate(a.date)}`, clock(a.time) && `at ${clock(a.time)}`].filter(Boolean).join(" ");
  const where = [a.venue && `at ${a.venue}`, a.city && `in ${a.city}`].filter(Boolean).join(" ");
  out.push(`The bride is ${a.bride.trim()} and the groom is ${a.groom.trim()}; print the names as ${first.trim()} & ${second.trim()}. They are getting married${when ? ` ${when}` : ""}${where ? ` ${where}` : ""}.`);
  if (a.muhurat.trim()) out.push(`The muhurat: ${a.muhurat.trim()}.`);
  const fns = a.functions.filter((f) => f.name.trim());
  if (fns.length) {
    out.push(
      `The functions, in order: ${fns
        .map((f) => `${f.name.trim()}${longDate(f.date) ? ` on ${longDate(f.date)}` : ""}`)
        .join("; ")}.${a.venue ? ` Unless said otherwise they are at ${a.venue}${a.city ? `, ${a.city}` : ""}.` : ""}`,
    );
  }
  if (a.brideParents.trim()) out.push(`The bride's parents are ${a.brideParents.trim()}.`);
  if (a.groomParents.trim()) out.push(`The groom's parents are ${a.groomParents.trim()}.`);
  if (a.blessingsOf.trim()) out.push(`With the blessings of ${a.blessingsOf.trim()}.`);
  if (a.story.trim()) out.push(`How they met and a memory: ${a.story.trim()}`);
  if (a.contactName.trim() && a.contactPhone.trim()) out.push(`For any question guests can call ${a.contactName.trim()} on ${a.contactPhone.trim()}.`);
  out.push(`Tone: ${a.tone || "Royal"}.${a.language === "Hinglish" ? " The family writes in Hinglish." : a.language === "Hindi" ? " The family prefers Hindi for the invitation." : ""}`);
  return out.join(" ");
}

const STEPS = ["The couple", "The big day", "Where", "Functions", "Families", "Your story", "Tone", "Who to call"] as const;

export interface RoyalGuidedProps {
  open: boolean;
  fill: UseStoryFillResult;
  onClose: () => void;
  /** Called right before generating, with the answers (the studio applies the non-AI ones, e.g. name order, muhurat). */
  onAnswers: (a: WeddingAnswers) => void;
}

function Q({ label, hint, children, htmlFor }: { label: string; hint?: string; children: ReactNode; htmlFor?: string }) {
  return (
    <div className="rg-q">
      <label className="rg-label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint && <p className="rg-hint">{hint}</p>}
    </div>
  );
}

export default function RoyalGuided({ open, fill, onClose, onAnswers }: RoyalGuidedProps) {
  const [a, setA] = useState<WeddingAnswers>(EMPTY);
  const [step, setStep] = useState(0);
  const [stage, setStage] = useState<"ask" | "writing" | "review">("ask");
  const [touched, setTouched] = useState(false);
  const body = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  // Fresh answers from this tab's last wedding (any template), once per open.
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      setA(load());
      setStep(0);
      setStage("ask");
      setTouched(false);
    }, 0);
    return () => window.clearTimeout(t);
  }, [open]);
  useEffect(() => {
    if (!open) return;
    try {
      window.sessionStorage.setItem(GUIDED_WEDDING_KEY, JSON.stringify(a));
    } catch {}
  }, [a, open]);
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
  // Generation finished: show the review (or back to the questions on an error).
  useEffect(() => {
    if (!started.current || fill.generating) return;
    started.current = false;
    const t = window.setTimeout(() => setStage(fill.mode === "done" ? "review" : "ask"), 0);
    return () => window.clearTimeout(t);
  }, [fill.generating, fill.mode]);
  useEffect(() => {
    body.current?.scrollTo({ top: 0 });
    const first = body.current?.querySelector<HTMLInputElement>("input, textarea");
    if (first && window.matchMedia("(pointer: fine)").matches) first.focus({ preventScroll: true });
  }, [step, stage]);

  const set = <K extends keyof WeddingAnswers>(k: K, v: WeddingAnswers[K]) => setA((p) => ({ ...p, [k]: v }));
  const namesOk = a.bride.trim().length > 0 && a.groom.trim().length > 0;
  const story = useMemo(() => composeWeddingStory(a), [a]);
  const last = step === STEPS.length - 1;

  const generate = () => {
    if (!namesOk) {
      setStep(0);
      setTouched(true);
      return;
    }
    onAnswers(a);
    started.current = true;
    setStage("writing");
    fill.generateGuided({
      people: { userName: "", partnerName: "", bestFriendName: "", partnerPronouns: "" },
      story,
      // No language tag: the page is always bilingual (English letter + Hindi field), so the
      // family's preference rides in the description instead of forcing one script on every field.
      hints: { tone: a.tone, occasion: "wedding" },
    });
  };
  const next = () => {
    if (step === 0 && !namesOk) {
      setTouched(true);
      return;
    }
    if (last) generate();
    else setStep((s) => s + 1);
  };

  const toggleFn = (name: string) =>
    set(
      "functions",
      a.functions.some((f) => f.name === name) ? a.functions.filter((f) => f.name !== name) : [...a.functions, { name, date: "" }].sort((x, y) => FUNCTIONS.indexOf(x.name) - FUNCTIONS.indexOf(y.name)),
    );

  if (!open) return null;
  return (
    <div className="rg" role="dialog" aria-modal="true" aria-labelledby="rg-title" onClick={onClose}>
      <style>{RG_CSS}</style>
      <div className="rg-sheet" onClick={(e) => e.stopPropagation()}>
        <header className="rg-top">
          <div style={{ minWidth: 0 }}>
            <p className="rg-k">✦ Let AI write it</p>
            <h2 className="rg-title" id="rg-title">
              {stage === "review" ? "Here's your invitation" : stage === "writing" ? "Writing your invitation…" : STEPS[step]}
            </h2>
          </div>
          <button type="button" className="rg-x" onClick={onClose} aria-label="Close and fill it in myself">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>
        {stage === "ask" && (
          <ol className="rg-rail" aria-label="Questions">
            {STEPS.map((t, i) => (
              <li key={t}>
                <button type="button" className={`rg-dot${i === step ? " is-on" : ""}${i < step ? " is-done" : ""}`} onClick={() => (i === 0 || namesOk ? setStep(i) : setTouched(true))} aria-label={`${i + 1}. ${t}`} aria-current={i === step ? "step" : undefined}>
                  <span />
                </button>
              </li>
            ))}
          </ol>
        )}

        <div className="rg-body" ref={body}>
          {stage === "writing" && (
            <div className="rg-writing" role="status">
              <span className="rg-spin" aria-hidden />
              <p>Filling the names, the families, every function, the invitation in English and Hindi, your story and who to call. About 15 seconds.</p>
            </div>
          )}

          {stage === "review" && (
            <div className="rg-review">
              <StoryReview fill={fill} onDone={onClose} onRewrite={() => setStage("ask")} rewriteLabel="Change my answers" />
            </div>
          )}

          {stage === "ask" && step === 0 && (
            <>
              <p className="rg-lead">Whose wedding is it? Just the first names, as they should be printed.</p>
              <div className="rg-two">
                <Q label="Bride's name" htmlFor="rg-b">
                  <input id="rg-b" className="rg-in" value={a.bride} maxLength={30} placeholder="e.g. Aanya" autoComplete="off" onChange={(e) => set("bride", e.target.value)} aria-invalid={touched && !a.bride.trim()} />
                </Q>
                <Q label="Groom's name" htmlFor="rg-g">
                  <input id="rg-g" className="rg-in" value={a.groom} maxLength={30} placeholder="e.g. Vihaan" autoComplete="off" onChange={(e) => set("groom", e.target.value)} aria-invalid={touched && !a.groom.trim()} />
                </Q>
              </div>
              {touched && !namesOk && (
                <p className="rg-err" role="alert">
                  Both names, please. Everything else is optional.
                </p>
              )}
              <p className="rg-label">Print the names as</p>
              <div className="rg-seg" role="radiogroup" aria-label="Print the names as">
                {(["bride", "groom"] as const).map((o) => (
                  <button key={o} type="button" role="radio" aria-checked={a.first === o} onClick={() => set("first", o)}>
                    {o === "bride" ? `${a.bride || "Bride"} & ${a.groom || "Groom"}` : `${a.groom || "Groom"} & ${a.bride || "Bride"}`}
                  </button>
                ))}
              </div>
            </>
          )}

          {stage === "ask" && step === 1 && (
            <>
              <p className="rg-lead">When are the pheras (the main ceremony)?</p>
              <div className="rg-two">
                <Q label="Wedding date" htmlFor="rg-d">
                  <input id="rg-d" type="date" className="rg-in" value={a.date} onChange={(e) => set("date", e.target.value)} />
                </Q>
                <Q label="Start time" htmlFor="rg-t">
                  <input id="rg-t" type="time" className="rg-in" value={a.time} onChange={(e) => set("time", e.target.value)} />
                </Q>
              </div>
              <Q label="Muhurat (optional)" htmlFor="rg-m" hint="Printed under the date, word for word.">
                <input id="rg-m" className="rg-in" value={a.muhurat} maxLength={60} placeholder="e.g. Shubh muhurat 9:15 pm" onChange={(e) => set("muhurat", e.target.value)} />
              </Q>
            </>
          )}

          {stage === "ask" && step === 2 && (
            <>
              <p className="rg-lead">Where is the wedding?</p>
              <Q label="City" htmlFor="rg-c">
                <input id="rg-c" className="rg-in" value={a.city} maxLength={60} placeholder="e.g. Udaipur" onChange={(e) => set("city", e.target.value)} />
              </Q>
              <Q label="Main venue" htmlFor="rg-v" hint="The palace, hotel, lawn or home where the pheras happen.">
                <input id="rg-v" className="rg-in" value={a.venue} maxLength={80} placeholder="e.g. Jagmandir Island Palace" onChange={(e) => set("venue", e.target.value)} />
              </Q>
            </>
          )}

          {stage === "ask" && step === 3 && (
            <>
              <p className="rg-lead">Which functions are you having? Tap all that apply; add a date if you know it.</p>
              <div className="rg-chips">
                {FUNCTIONS.map((f) => (
                  <button key={f} type="button" className="rg-chip" aria-pressed={a.functions.some((x) => x.name === f)} onClick={() => toggleFn(f)}>
                    {a.functions.some((x) => x.name === f) ? "✓ " : "+ "}
                    {f}
                  </button>
                ))}
              </div>
              {a.functions.length > 0 && (
                <ul className="rg-fns">
                  {a.functions.map((f, i) => (
                    <li key={f.name}>
                      <label htmlFor={`rg-f${i}`}>{f.name}</label>
                      <input id={`rg-f${i}`} type="date" className="rg-in" value={f.date} onChange={(e) => set("functions", a.functions.map((x, j) => (j === i ? { ...x, date: e.target.value } : x)))} aria-label={`${f.name} date`} />
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          {stage === "ask" && step === 4 && (
            <>
              <p className="rg-lead">Who is inviting? As the card should print them.</p>
              <Q label="Bride's parents" htmlFor="rg-bp">
                <input id="rg-bp" className="rg-in" value={a.brideParents} maxLength={120} placeholder="e.g. Meera & Raghuveer Singh Rathore" onChange={(e) => set("brideParents", e.target.value)} />
              </Q>
              <Q label="Groom's parents" htmlFor="rg-gp">
                <input id="rg-gp" className="rg-in" value={a.groomParents} maxLength={120} placeholder="e.g. Nandini & Arvind Singhania" onChange={(e) => set("groomParents", e.target.value)} />
              </Q>
              <Q label="With the blessings of (optional)" htmlFor="rg-bo" hint="Grandparents or elders.">
                <input id="rg-bo" className="rg-in" value={a.blessingsOf} maxLength={160} placeholder="e.g. Smt. Kamla Devi" onChange={(e) => set("blessingsOf", e.target.value)} />
              </Q>
            </>
          )}

          {stage === "ask" && step === 5 && (
            <>
              <p className="rg-lead">How did you two meet? One memory is enough (optional).</p>
              <Q label="Your story" htmlFor="rg-s" hint="Places and years make the best chapters. Skip it and the story section stays empty.">
                <textarea id="rg-s" className="rg-in rg-area" rows={5} value={a.story} maxLength={700} placeholder="e.g. We met at a book fair in Jaipur in 2019, both reaching for the same Ruskin Bond. He proposed by Lake Pichola in 2025 with a ring hidden in a kulhad of chai." onChange={(e) => set("story", e.target.value)} />
              </Q>
            </>
          )}

          {stage === "ask" && step === 6 && (
            <>
              <p className="rg-lead">How should it sound?</p>
              <div className="rg-chips" role="radiogroup" aria-label="Tone">
                {TONES.map((t) => (
                  <button key={t} type="button" role="radio" className="rg-chip" aria-checked={a.tone === t} aria-pressed={a.tone === t} onClick={() => set("tone", t)}>
                    {t}
                  </button>
                ))}
              </div>
              <p className="rg-label" style={{ marginTop: 18 }}>
                Your family writes in
              </p>
              <div className="rg-seg" role="radiogroup" aria-label="Language">
                {LANGS.map((l) => (
                  <button key={l} type="button" role="radio" aria-checked={a.language === l} onClick={() => set("language", l)}>
                    {l}
                  </button>
                ))}
              </div>
              <p className="rg-hint">The invitation is always written in English and Hindi side by side; guests can switch. Choose Hindi and the page opens in Hindi.</p>
            </>
          )}

          {stage === "ask" && step === 7 && (
            <>
              <p className="rg-lead">Who should guests call with questions? (optional)</p>
              <div className="rg-two">
                <Q label="Name" htmlFor="rg-cn">
                  <input id="rg-cn" className="rg-in" value={a.contactName} maxLength={40} placeholder="e.g. Kabir Singhania" onChange={(e) => set("contactName", e.target.value)} />
                </Q>
                <Q label="Phone" htmlFor="rg-cp">
                  <span className="rg-tel">
                    <span aria-hidden>+91</span>
                    <input id="rg-cp" className="rg-in" type="tel" inputMode="tel" value={a.contactPhone} maxLength={16} placeholder="98290 11223" onChange={(e) => set("contactPhone", e.target.value)} />
                  </span>
                </Q>
              </div>
              <details className="rg-peek">
                <summary>What the AI will read</summary>
                <p>{story}</p>
              </details>
            </>
          )}
          {stage === "ask" && fill.error && (
            <p className="rg-err" role="alert">
              {fill.error}
            </p>
          )}
        </div>

        {stage === "ask" && (
          <footer className="rg-foot">
            <button type="button" className="rg-back" onClick={() => (step ? setStep(step - 1) : onClose())}>
              {step ? "Back" : "I'll fill it myself"}
            </button>
            <span className="rg-count">
              {step + 1} / {STEPS.length}
            </span>
            {!last && step > 0 && (
              <button type="button" className="rg-skip" onClick={generate} disabled={!namesOk}>
                Write it now
              </button>
            )}
            <button type="button" className="rg-next" onClick={next} disabled={fill.generating}>
              {last ? "✦ Write my invitation" : "Next"}
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}

const RG_CSS = `
.rg { position: fixed; inset: 0; z-index: 220; display: flex; align-items: flex-end; justify-content: center; background: rgba(46,20,20,.42); animation: rg-fade .25s ease both; }
@keyframes rg-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes rg-up { from { transform: translateY(40px); opacity: 0; } to { transform: none; opacity: 1; } }
.rg-sheet { position: relative; width: 100%; height: 100dvh; display: flex; flex-direction: column; background: linear-gradient(180deg, #FFFCF6, #FBF2E2); color: #3E1F1A; font-family: var(--vw-font-ui, system-ui, sans-serif); animation: rg-up .35s cubic-bezier(.22,.7,.2,1) both; }
@media (min-width: 768px) { .rg { align-items: center; } .rg-sheet { width: min(600px, calc(100vw - 48px)); height: auto; max-height: min(860px, calc(100dvh - 48px)); border-radius: 26px; box-shadow: 0 40px 80px -30px rgba(60,20,20,.5), inset 0 0 0 1.5px #E3C98F; } }
.rg-top { display: flex; align-items: flex-start; gap: 10px; padding: calc(14px + env(safe-area-inset-top, 0px)) 16px 6px 20px; }
.rg-k { margin: 0; font: 700 11px/1 var(--vw-font-ui, sans-serif); letter-spacing: .22em; text-transform: uppercase; color: #8E2A3C; }
.rg-title { margin: 8px 0 0; font: 600 clamp(24px, 6.6vw, 30px)/1.15 var(--vw-font-serif, Georgia, serif); }
.rg-x { margin-left: auto; flex: none; width: 44px; height: 44px; display: grid; place-items: center; border: 0; border-radius: 50%; background: #F4E6CF; color: #6A4038; cursor: pointer; }
.rg-rail { list-style: none; margin: 8px 0 0; padding: 0 20px; display: flex; gap: 4px; }
.rg-rail li { flex: 1; }
.rg-dot { width: 100%; height: 40px; padding: 0; border: 0; background: none; cursor: pointer; display: flex; align-items: center; }
.rg-dot span { display: block; width: 100%; height: 5px; border-radius: 999px; background: #EADBC0; transition: background .25s ease; }
.rg-dot.is-done span { background: #C9A24A; }
.rg-dot.is-on span { background: #8E2A3C; }
.rg-body { flex: 1; min-height: 0; overflow-y: auto; padding: 8px 20px 24px; overscroll-behavior: contain; }
.rg-lead { margin: 6px 0 16px; font: 500 17px/1.45 var(--vw-font-ui, sans-serif); color: #5A3A30; }
.rg-q { margin: 0 0 14px; display: grid; gap: 6px; }
.rg-label { display: block; margin: 0; font: 700 13px/1.2 var(--vw-font-ui, sans-serif); color: #6A4038; }
.rg-hint { margin: 0; font-size: 13px; line-height: 1.45; color: #8A6A5A; }
.rg-err { margin: 4px 0 12px; font-size: 14px; font-weight: 600; color: #B3261E; }
.rg-in { width: 100%; min-height: 50px; padding: 12px 14px; border-radius: 14px; border: 1.5px solid #E3CDA6; background: #FFFDF8; color: #3E1F1A; font: 400 16px/1.4 var(--vw-font-ui, sans-serif); outline: none; scroll-margin-bottom: 120px; }
.rg-in:focus { border-color: #8E2A3C; box-shadow: 0 0 0 3px rgba(142,42,60,.14); }
.rg-in[aria-invalid=true] { border-color: #B3261E; }
.rg-area { min-height: 140px; resize: vertical; }
.rg-two { display: grid; gap: 0 12px; grid-template-columns: minmax(0, 1fr); }
@media (min-width: 520px) { .rg-two { grid-template-columns: 1fr 1fr; } }
.rg-seg { display: flex; flex-wrap: wrap; gap: 6px; padding: 4px; margin: 8px 0 8px; border-radius: 18px; background: #F4E6CF; }
.rg-seg button { flex: 1 1 auto; min-height: 44px; padding: 0 14px; border: 0; border-radius: 14px; background: none; font: 600 14.5px/1.1 var(--vw-font-ui, sans-serif); color: #5A3A30; cursor: pointer; }
.rg-seg button[aria-checked=true] { background: #8E2A3C; color: #FFF7EA; }
.rg-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.rg-chip { min-height: 44px; padding: 0 16px; border-radius: 999px; border: 1.5px solid #E3CDA6; background: #FFFDF8; color: #3E1F1A; font: 600 14.5px/1 var(--vw-font-ui, sans-serif); cursor: pointer; }
.rg-chip[aria-pressed=true] { border-color: #8E2A3C; background: #8E2A3C; color: #FFF7EA; }
.rg-fns { list-style: none; margin: 16px 0 0; padding: 0; display: grid; gap: 8px; }
.rg-fns li { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr); gap: 10px; align-items: center; padding: 6px 6px 6px 14px; border-radius: 16px; background: #FFF8EC; box-shadow: inset 0 0 0 1px #EAD7B2; }
.rg-fns label { font: 600 15px/1.2 var(--vw-font-ui, sans-serif); }
.rg-tel { display: flex; align-items: stretch; }
.rg-tel > span { display: grid; place-items: center; padding: 0 12px; border: 1.5px solid #E3CDA6; border-right: 0; border-radius: 14px 0 0 14px; background: #F4E6CF; font-weight: 700; color: #6A4038; }
.rg-tel .rg-in { border-radius: 0 14px 14px 0; }
.rg-peek { margin-top: 10px; font-size: 13.5px; color: #6A4038; }
.rg-peek summary { min-height: 44px; display: flex; align-items: center; cursor: pointer; font-weight: 700; }
.rg-peek p { margin: 0; padding: 12px 14px; border-radius: 14px; background: #FFF8EC; line-height: 1.5; }
.rg-foot { display: flex; align-items: center; gap: 8px; padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0px)); border-top: 1px solid #EEDDBE; background: rgba(255,252,246,.96); }
.rg-back, .rg-skip { min-height: 48px; padding: 0 12px; border: 0; border-radius: 999px; background: none; font: 600 14.5px/1.1 var(--vw-font-ui, sans-serif); color: #6A4038; cursor: pointer; }
.rg-skip { color: #8E2A3C; }
.rg-skip:disabled { opacity: .4; }
.rg-count { font: 600 12.5px/1 var(--vw-font-ui, sans-serif); color: #9A7A66; margin-left: auto; }
.rg-next { min-height: 50px; padding: 0 22px; border: 0; border-radius: 999px; background: linear-gradient(110deg, #641C2A, #8E2A3C 55%, #A84A4E); color: #FFF7EA; font: 700 15.5px/1 var(--vw-font-ui, sans-serif); cursor: pointer; box-shadow: 0 12px 24px -12px rgba(100,28,42,.8); }
.rg-next:disabled { opacity: .6; }
@media (max-width: 380px) { .rg-count { display: none; } .rg-skip { padding: 0 6px; } }
.rg-writing { display: grid; justify-items: center; gap: 18px; padding: 50px 10px; text-align: center; color: #5A3A30; font-size: 15.5px; line-height: 1.5; }
.rg-spin { width: 54px; height: 54px; border-radius: 50%; border: 4px solid #EAD7B2; border-top-color: #8E2A3C; animation: rg-spin 1s linear infinite; }
@keyframes rg-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .rg, .rg-sheet { animation: none; } .rg-spin { animation-duration: 3s; } }
.rg-review { padding-top: 4px; }
`;
