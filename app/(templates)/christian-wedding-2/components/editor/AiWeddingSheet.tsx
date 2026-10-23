"use client";

// ─── "Let AI write it": a few wedding questions → the whole form → review ────
//
// The shared GuidedQuestions flow is relationship-shaped (crush, partner,
// best friend). A wedding needs different questions, so this template asks its
// own: the couple, when, where, which celebrations, the families, a line of
// their story + the tone, and (optionally) who guests should call. The answers
// are composed into a plain-English description and sent through the same
// `useStoryFill.generateGuided` as every other template; the review screen is
// the shared StoryReview (every filled field listed, editable in place, the
// "still empty" list loud). Answers persist for the session under
// `ss:guided-wedding:v1`, so the next wedding template starts pre-filled.

import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import StoryReview from "@/components/story/StoryReview";
import type { StoryFill } from "@/components/story/storyFillContract";
import { QUICK_FUNCTIONS, normalisePhone } from "../../lib/model";
import { A } from "../../lib/art";
import { setFillSource } from "../../lib/factCheck";

const KEY = "ss:guided-wedding:v1";

interface Answers {
  bride: string;
  groom: string;
  groomFirst: boolean;
  date: string;
  time: string;
  church: string;
  city: string;
  functions: { title: string; date: string; time: string; venue: string }[];
  brideParents: string;
  groomParents: string;
  howMet: string;
  memory: string;
  tone: string;
  contactName: string;
  contactRelation: string;
  contactPhone: string;
  freeText: string;
}

const EMPTY: Answers = {
  bride: "",
  groom: "",
  groomFirst: false,
  date: "",
  time: "",
  church: "",
  city: "",
  functions: [{ title: "Holy Matrimony", date: "", time: "", venue: "" }, { title: "Reception", date: "", time: "", venue: "" }],
  brideParents: "",
  groomParents: "",
  howMet: "",
  memory: "",
  tone: "Faith-filled",
  contactName: "",
  contactRelation: "",
  contactPhone: "",
  freeText: "",
};

const TONES = ["Traditional", "Faith-filled", "Warm & modern", "Joyful & fun"];
const CEREMONY_RE = /matrimony|nuptial|mass|ceremony|wedding/i;

function load(): Answers {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const j = JSON.parse(raw) as Partial<Answers> & Record<string, unknown>;
    // Other wedding templates share this key with their own extra answers: take what fits.
    const str = (v: unknown) => (typeof v === "string" ? v.slice(0, 400) : "");
    return {
      ...EMPTY,
      bride: str(j.bride),
      groom: str(j.groom),
      groomFirst: j.groomFirst === true,
      date: str(j.date),
      time: str(j.time),
      church: str(j.church ?? j.venue),
      city: str(j.city),
      functions: Array.isArray(j.functions) && j.functions.every((f) => f && typeof f === "object" && "title" in f) && j.functions.some((f) => CEREMONY_RE.test(String((f as { title: unknown }).title)))
        ? (j.functions as Answers["functions"]).slice(0, 5).map((f) => ({ title: str(f.title), date: str(f.date), time: str(f.time), venue: str(f.venue) }))
        : EMPTY.functions,
      brideParents: str(j.brideParents),
      groomParents: str(j.groomParents),
      howMet: str(j.howMet),
      memory: str(j.memory),
      tone: TONES.includes(str(j.tone)) ? str(j.tone) : EMPTY.tone,
      contactName: str(j.contactName),
      contactRelation: str(j.contactRelation),
      contactPhone: str(j.contactPhone),
      freeText: "",
    };
  } catch {
    return EMPTY;
  }
}

const fmtDate = (iso: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
};
const fmtTime = (t: string) => {
  if (!/^\d{2}:\d{2}$/.test(t)) return "";
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}${m ? `:${String(m).padStart(2, "0")}` : ""} ${h < 12 ? "am" : "pm"}`;
};

/** The answers as a plain description, the way a family member would type it. */
export function composeWeddingStory(a: Answers): string {
  const L: string[] = [];
  L.push(`We are inviting guests to the Christian church wedding of ${a.bride.trim() || "the bride"} (the bride) and ${a.groom.trim() || "the groom"} (the groom).`);
  if (a.groomFirst) L.push("Print the groom's name first.");
  // In the order a church wedding runs (betrothal … brunch), dated ones by their date.
  const rank = (t: string) => {
    const k = QUICK_FUNCTIONS.findIndex((q) => q.title === t);
    return k < 0 ? 50 : k;
  };
  const dayOf = (f: Answers["functions"][number]) => f.date || (CEREMONY_RE.test(f.title) ? a.date : "");
  const fns = a.functions
    .filter((f) => f.title.trim())
    .slice()
    .sort((x, y) => {
      const dx = dayOf(x);
      const dy = dayOf(y);
      return dx && dy && dx !== dy ? (dx < dy ? -1 : 1) : rank(x.title) - rank(y.title);
    });
  const main = fns.find((f) => CEREMONY_RE.test(f.title));
  const where = [a.church.trim(), a.city.trim()].filter(Boolean).join(", ");
  if (a.date || where) {
    L.push(
      `The ${main?.title || "wedding ceremony"} is${a.date ? ` on ${fmtDate(a.date)} (${a.date})` : ""}${a.time ? ` at ${fmtTime(a.time)} (${a.time})` : ""}${where ? ` at ${where}` : ""}.`,
    );
  }
  if (fns.length) {
    L.push(
      `The celebrations, in order: ${fns
        .map((f) => {
          const isMain = f === main;
          const date = f.date || (isMain ? a.date : "");
          const time = f.time || (isMain ? a.time : "");
          const venue = f.venue || (isMain ? where : "");
          const open = [!time && "time", !venue && "place"].filter(Boolean).join(" and ");
          return [f.title.trim(), date ? `on ${fmtDate(date)} (${date})` : "", time ? `at ${fmtTime(time)}` : "", venue ? `at ${venue}` : "", open ? `(its ${open} not decided yet)` : ""].filter(Boolean).join(" ");
        })
        .join("; ")}.`,
    );
  }
  if (a.brideParents.trim()) L.push(`The bride's parents are ${a.brideParents.trim()}.`);
  if (a.groomParents.trim()) L.push(`The groom's parents are ${a.groomParents.trim()}.`);
  if (a.howMet.trim()) L.push(`How they met: ${a.howMet.trim().replace(/\.?$/, ".")}`);
  if (a.memory.trim()) L.push(`A moment we treasure: ${a.memory.trim().replace(/\.?$/, ".")}`);
  if (a.contactName.trim() && a.contactPhone.trim()) {
    L.push(`For any questions guests can call ${a.contactName.trim()}${a.contactRelation.trim() ? ` (${a.contactRelation.trim()})` : ""} on ${a.contactPhone.trim()}.`);
  }
  L.push(`We would like the invitation to feel ${a.tone.toLowerCase()}.`);
  return L.join("\n").slice(0, 3900);
}

// ── Little building blocks ──────────────────────────────────────────────────

function Field({ label, hint, children, id }: { label: string; hint?: string; children: ReactNode; id: string }) {
  return (
    <div className="c2q-field">
      <label htmlFor={id} className="c2q-label">
        {label}
      </label>
      {children}
      {hint && <p className="c2q-hint">{hint}</p>}
    </div>
  );
}

const STEPS = ["The couple", "The date", "The church", "Celebrations", "Families", "Your story", "Who to call"] as const;

export default function AiWeddingSheet({ fill, open, onClose, onManual }: { fill: StoryFill; open: boolean; onClose: () => void; onManual: () => void }) {
  const uid = useId().replace(/:/g, "");
  const [a, setA] = useState<Answers>(EMPTY);
  const [i, setI] = useState(0);
  const [own, setOwn] = useState(false);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) return;
    // Read once per opening (sessionStorage is client-only).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setA(load());
  }, [open]);

  useEffect(() => {
    if (!open) return;
    try {
      sessionStorage.setItem(KEY, JSON.stringify({ ...a, freeText: undefined }));
    } catch {}
  }, [a, open]);

  // Esc closes; the page behind stays still.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const el = document.documentElement;
    const prev = el.style.overflow;
    el.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      el.style.overflow = prev;
    };
  }, [open, onClose]);

  const set = <K extends keyof Answers>(k: K, v: Answers[K]) => setA((p) => ({ ...p, [k]: v }));
  const namesOk = a.bride.trim().length > 0 && a.groom.trim().length > 0;
  const phoneBad = !!a.contactPhone.trim() && !normalisePhone(a.contactPhone);

  const people = useMemo(() => ({ userName: a.groom.trim().slice(0, 40), partnerName: "", bestFriendName: a.bride.trim().slice(0, 40), partnerPronouns: "" }), [a.bride, a.groom]);
  const hints = { tone: a.tone, language: "en", occasion: "a Christian church wedding (Holy Matrimony)" };

  const generate = () => {
    if (!namesOk) {
      setI(0);
      setTouched(true);
      return;
    }
    const story = composeWeddingStory(a);
    setFillSource(story);
    fill.generateGuided?.({ people, story, hints });
  };
  const generateOwn = () => {
    const text = a.freeText.trim();
    if (text.length < 20) return;
    const story = [namesOk ? `Bride: ${a.bride.trim()}. Groom: ${a.groom.trim()}.` : "", text].filter(Boolean).join("\n");
    setFillSource(story);
    fill.generateGuided?.({ people, story, hints });
  };

  if (!open || !fill.schema) return null;
  const done = fill.mode === "done";
  const last = STEPS.length - 1;

  const toggleFn = (title: string) => {
    setA((p) => {
      const has = p.functions.some((f) => f.title === title);
      const functions = has ? p.functions.filter((f) => f.title !== title) : [...p.functions, { title, date: "", time: "", venue: "" }].slice(0, 5);
      return { ...p, functions };
    });
  };

  return (
    <div className="c2q-scrim" role="presentation" onClick={onClose}>
      <style>{SHEET_CSS}</style>
      <div className="c2q-sheet" role="dialog" aria-modal="true" aria-labelledby={`${uid}-t`} onClick={(e) => e.stopPropagation()}>
        <header className="c2q-top">
          <div>
            <p className="c2q-eyebrow">✦ Let AI write it</p>
            <h2 id={`${uid}-t`} className="c2q-title">
              {done ? "Here's your first draft" : fill.generating ? "Writing your invitation…" : own ? "In your own words" : STEPS[i]}
            </h2>
          </div>
          <button type="button" className="c2q-x" onClick={onClose} aria-label="Close and fill it in myself">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        {!done && !fill.generating && !own && (
          <div className="c2q-progress" aria-label={`Question ${i + 1} of ${STEPS.length}`}>
            {STEPS.map((s, k) => (
              <button key={s} type="button" className={`c2q-dot${k === i ? " is-on" : k < i ? " is-done" : ""}`} onClick={() => (k === 0 || namesOk ? setI(k) : setTouched(true))} aria-label={`${s}${k < i ? " (answered)" : ""}`} aria-current={k === i ? "step" : undefined} />
            ))}
          </div>
        )}

        <div className="c2q-body">
          {done ? (
            <div className="c2q-review">
              <StoryReview fill={fill} onDone={onManual} onRewrite={() => fill.setMode("idle")} rewriteLabel="Change my answers" />
            </div>
          ) : fill.generating ? (
            <div className="c2q-writing" role="status" aria-live="polite">
              <div className="c2q-quill" aria-hidden>
                <i />
                <i />
                <i />
              </div>
              <p>Writing the invitation, the celebrations and your story for {a.bride.trim() || "the bride"} &amp; {a.groom.trim() || "the groom"}…</p>
              <p className="c2q-hint">About ten seconds. You will see every word before anything is saved.</p>
            </div>
          ) : own ? (
            <>
              <Field id={`${uid}-own`} label="Describe the wedding" hint="Names, the church, the date, the celebrations, your families — a few sentences is enough.">
                <textarea id={`${uid}-own`} className="c2q-input is-area" value={a.freeText} onChange={(e) => set("freeText", e.target.value)} placeholder="Anna and Joel are getting married at St. Mary's Basilica, Kochi on 16 January 2027 at 3:30 pm…" rows={7} />
              </Field>
              {fill.error && <p className="c2q-err">{fill.error}</p>}
            </>
          ) : (
            <>
              {i === 0 && (
                  <>
                  <div className="c2q-intro">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={A.branch.src} alt="" aria-hidden width={A.branch.w} height={A.branch.h} decoding="async" />
                    <p>
                      <b>{STEPS.length} quick questions, about a minute.</b> Only your names are needed — skip anything else. AI then writes the invitation, every celebration and your story, and you check each word before it is saved.
                    </p>
                  </div>
                  <Field id={`${uid}-b`} label="Bride's first name">
                    <input id={`${uid}-b`} className="c2q-input" value={a.bride} onChange={(e) => set("bride", e.target.value)} autoComplete="off" placeholder="Anna" aria-invalid={touched && !a.bride.trim()} autoFocus />
                  </Field>
                  <Field id={`${uid}-g`} label="Groom's first name">
                    <input id={`${uid}-g`} className="c2q-input" value={a.groom} onChange={(e) => set("groom", e.target.value)} autoComplete="off" placeholder="Joel" aria-invalid={touched && !a.groom.trim()} />
                  </Field>
                  {touched && !namesOk && <p className="c2q-err">Both names, please — everything else is optional.</p>}
                  <div className="c2q-seg" role="radiogroup" aria-label="Whose name comes first">
                    <button type="button" role="radio" aria-checked={!a.groomFirst} onClick={() => set("groomFirst", false)}>
                      {a.bride.trim() || "Bride"} first
                    </button>
                    <button type="button" role="radio" aria-checked={a.groomFirst} onClick={() => set("groomFirst", true)}>
                      {a.groom.trim() || "Groom"} first
                    </button>
                  </div>
                </>
              )}
              {i === 1 && (
                <>
                  <Field id={`${uid}-d`} label="Wedding date" hint="The day of the church ceremony.">
                    <input id={`${uid}-d`} type="date" className="c2q-input" value={a.date} onChange={(e) => set("date", e.target.value)} />
                  </Field>
                  <Field id={`${uid}-t2`} label="Ceremony starts at" hint="Optional.">
                    <input id={`${uid}-t2`} type="time" className="c2q-input" value={a.time} onChange={(e) => set("time", e.target.value)} />
                  </Field>
                </>
              )}
              {i === 2 && (
                <>
                  <Field id={`${uid}-c`} label="Church or chapel" hint="As guests would search for it on a map.">
                    <input id={`${uid}-c`} className="c2q-input" value={a.church} onChange={(e) => set("church", e.target.value)} placeholder="St. Mary's Basilica" />
                  </Field>
                  <Field id={`${uid}-city`} label="City">
                    <input id={`${uid}-city`} className="c2q-input" value={a.city} onChange={(e) => set("city", e.target.value)} placeholder="Kochi" />
                  </Field>
                </>
              )}
              {i === 3 && (
                <>
                  <p className="c2q-hint" style={{ marginTop: 0 }}>
                    Tap every celebration guests are invited to. Dates are optional.
                  </p>
                  <div className="c2q-chips">
                    {QUICK_FUNCTIONS.map((f) => {
                      const on = a.functions.some((x) => x.title === f.title);
                      return (
                        <button key={f.title} type="button" className="c2q-chip" aria-pressed={on} onClick={() => toggleFn(f.title)}>
                          {on ? "✓ " : "+ "}
                          {f.title}
                        </button>
                      );
                    })}
                  </div>
                  <ul className="c2q-fns">
                    {a.functions.map((f, k) => (
                      <li key={f.title + k}>
                        <span>{f.title}</span>
                        <input
                          type="date"
                          className="c2q-input is-sm"
                          aria-label={`${f.title} date`}
                          value={f.date || (CEREMONY_RE.test(f.title) ? a.date : "")}
                          onChange={(e) => setA((p) => ({ ...p, functions: p.functions.map((x, j) => (j === k ? { ...x, date: e.target.value } : x)) }))}
                        />
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {i === 4 && (
                <>
                  <Field id={`${uid}-bp`} label={`${a.bride.trim() || "Bride"}'s parents`} hint="As the invitation should print them. Optional.">
                    <input id={`${uid}-bp`} className="c2q-input" value={a.brideParents} onChange={(e) => set("brideParents", e.target.value)} placeholder="Mr. Thomas & Mrs. Mary Kurian" />
                  </Field>
                  <Field id={`${uid}-gp`} label={`${a.groom.trim() || "Groom"}'s parents`}>
                    <input id={`${uid}-gp`} className="c2q-input" value={a.groomParents} onChange={(e) => set("groomParents", e.target.value)} placeholder="Mr. George & Mrs. Annamma Varghese" />
                  </Field>
                </>
              )}
              {i === 5 && (
                <>
                  <Field id={`${uid}-hm`} label="How did you meet?" hint="One line is plenty. Optional.">
                    <textarea id={`${uid}-hm`} className="c2q-input is-area" rows={3} value={a.howMet} onChange={(e) => set("howMet", e.target.value)} placeholder="At the parish choir practice in 2019…" />
                  </Field>
                  <Field id={`${uid}-mm`} label="A moment you treasure (the proposal?)">
                    <textarea id={`${uid}-mm`} className="c2q-input is-area" rows={3} value={a.memory} onChange={(e) => set("memory", e.target.value)} placeholder="He asked on the beach at Cherai at sunset." />
                  </Field>
                  <p className="c2q-label">How should it feel?</p>
                  <div className="c2q-chips" role="radiogroup" aria-label="Tone">
                    {TONES.map((t) => (
                      <button key={t} type="button" role="radio" className="c2q-chip" aria-checked={a.tone === t} onClick={() => set("tone", t)}>
                        {t}
                      </button>
                    ))}
                  </div>
                </>
              )}
              {i === 6 && (
                <>
                  <Field id={`${uid}-cn`} label="Who should guests call with questions?" hint="Optional — a sibling, a cousin, the wedding planner.">
                    <input id={`${uid}-cn`} className="c2q-input" value={a.contactName} onChange={(e) => set("contactName", e.target.value)} placeholder="Ben Kurian" />
                  </Field>
                  <Field id={`${uid}-cr`} label="Relation">
                    <input id={`${uid}-cr`} className="c2q-input" value={a.contactRelation} onChange={(e) => set("contactRelation", e.target.value)} placeholder={`${a.bride.trim() || "Anna"}'s brother`} />
                  </Field>
                  <Field id={`${uid}-cp`} label="Phone">
                    <div className="c2q-phone">
                      <span aria-hidden>+91</span>
                      <input id={`${uid}-cp`} type="tel" inputMode="tel" className="c2q-input" value={a.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} placeholder="98470 11223" aria-invalid={phoneBad} />
                    </div>
                  </Field>
                  {phoneBad && <p className="c2q-err">That doesn&apos;t look like a phone number — 10 digits, please.</p>}
                </>
              )}
              {fill.error && i === last && <p className="c2q-err">{fill.error}</p>}
            </>
          )}
        </div>

        {!done && !fill.generating && (
          <footer className="c2q-foot">
            {own ? (
              <>
                <button type="button" className="c2q-btn is-ghost" onClick={() => setOwn(false)}>
                  ← Questions
                </button>
                <button type="button" className="c2q-btn" onClick={generateOwn} disabled={a.freeText.trim().length < 20}>
                  ✦ Write it
                </button>
              </>
            ) : (
              <>
                {i > 0 ? (
                  <button type="button" className="c2q-btn is-ghost" onClick={() => setI(i - 1)}>
                    ← Back
                  </button>
                ) : (
                  <button type="button" className="c2q-btn is-ghost" onClick={() => setOwn(true)}>
                    Own words
                  </button>
                )}
                {i < last ? (
                  <button
                    type="button"
                    className="c2q-btn"
                    onClick={() => {
                      if (i === 0 && !namesOk) {
                        setTouched(true);
                        return;
                      }
                      setI(i + 1);
                    }}
                  >
                    Next →
                  </button>
                ) : (
                  <button type="button" className="c2q-btn" onClick={generate} disabled={phoneBad}>
                    ✦ Write my invitation
                  </button>
                )}
              </>
            )}
          </footer>
        )}
        {!done && !fill.generating && (
          <div className="c2q-alt">
            {!own && i > 0 && i < last && namesOk && (
              <button type="button" className="c2q-link" onClick={generate}>
                Skip the rest and write it now
              </button>
            )}
            <button type="button" className="c2q-link" onClick={onManual}>
              I&apos;ll fill it in myself
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const SHEET_CSS = `
.c2q-scrim { position:fixed; inset:0; z-index:400; background:rgba(40,48,42,.42); display:flex; align-items:flex-end; justify-content:center; }
.c2q-sheet { width:100%; max-width:560px; height:100dvh; max-height:100dvh; background:#fbf8f3; color:#2f3a32; display:flex; flex-direction:column;
  font-family:var(--wk-font-sans, "DM Sans", system-ui, sans-serif); box-shadow:0 -20px 60px rgba(0,0,0,.2); overflow:hidden;
  padding-top:env(safe-area-inset-top,0px); animation:c2q-up .35s cubic-bezier(.2,.8,.2,1); }
@keyframes c2q-up { from { transform:translateY(40px); opacity:0; } to { transform:none; opacity:1; } }
@media (min-width: 640px) { .c2q-scrim { align-items:center; padding:24px; } .c2q-sheet { height:auto; max-height:min(860px, 92dvh); border-radius:24px; } }
.c2q-top { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; padding:18px 18px 8px; }
.c2q-eyebrow { margin:0; font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:#4c6852; font-weight:700; }
.c2q-title { margin:4px 0 0; font-family:var(--wk-font-display, Georgia, serif); font-size:28px; font-weight:600; line-height:1.15; color:#2f3a32; }
.c2q-x { width:46px; height:46px; border-radius:50%; border:1px solid rgba(127,154,131,.35); background:#fff; color:#4c6852; display:grid; place-items:center; cursor:pointer; flex:none; }
.c2q-progress { display:flex; gap:6px; padding:4px 18px 10px; }
.c2q-dot { flex:1; height:6px; border-radius:3px; border:0; background:#e6e1d6; cursor:pointer; padding:0; position:relative; }
.c2q-dot::after { content:""; position:absolute; inset:-14px 0; }
.c2q-dot.is-done { background:#9db59a; }
.c2q-dot.is-on { background:#4c6852; }
.c2q-intro { position:relative; overflow:hidden; border-radius:18px; padding:16px 16px 16px 96px; background:linear-gradient(135deg, #fdf0f2, #f1f5ee); border:1px solid #eadfd6; min-height:84px; display:flex; align-items:center; }
.c2q-intro img { position:absolute; left:-34px; top:50%; width:132px; height:auto; transform:translateY(-50%) rotate(-14deg); pointer-events:none; }
.c2q-intro p { margin:0; font-size:14.5px; line-height:1.5; color:#4b5a4e; }
.c2q-intro b { color:#34503b; }
.c2q-body { flex:1; min-height:0; grid-auto-rows:max-content; overflow:auto; padding:10px 18px 18px; display:grid; gap:16px; align-content:start; overscroll-behavior:contain; }
.c2q-field { display:grid; gap:6px; }
.c2q-label { font-size:15px; font-weight:600; color:#2f3a32; margin:0; }
.c2q-hint { font-size:13.5px; color:#6e756d; margin:0; line-height:1.45; }
.c2q-input { width:100%; min-height:52px; border-radius:14px; border:1.5px solid #ddd6c8; background:#fff; padding:12px 14px; font:16px/1.4 inherit; font-family:inherit; color:#2f3a32; }
.c2q-input:focus { outline:none; border-color:#7f9a83; box-shadow:0 0 0 4px rgba(127,154,131,.2); }
.c2q-input[aria-invalid="true"] { border-color:#c0505f; }
.c2q-input.is-area { min-height:96px; resize:vertical; }
.c2q-input.is-sm { min-height:46px; padding:8px 10px; max-width:180px; }
.c2q-err { color:#a8323f; font-size:14px; margin:0; }
.c2q-seg { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
.c2q-seg button, .c2q-chip { min-height:46px; border-radius:999px; border:1.5px solid #ddd6c8; background:#fff; font:600 14.5px inherit; font-family:inherit; color:#2f3a32; padding:8px 16px; cursor:pointer; }
.c2q-seg button[aria-checked="true"], .c2q-chip[aria-pressed="true"], .c2q-chip[aria-checked="true"] { background:#4c6852; border-color:#4c6852; color:#fff; }
.c2q-chips { display:flex; flex-wrap:wrap; gap:8px; }
.c2q-fns { list-style:none; margin:0; padding:0; display:grid; gap:8px; }
.c2q-fns li { display:flex; align-items:center; justify-content:space-between; gap:10px; padding:8px 8px 8px 14px; background:#fff; border:1px solid #e6e1d6; border-radius:14px; }
.c2q-fns li span { font-weight:600; font-size:15px; min-width:0; overflow-wrap:anywhere; }
.c2q-phone { display:flex; align-items:center; gap:8px; }
.c2q-phone span { font-weight:600; color:#4c6852; padding:0 4px; }
.c2q-foot { display:flex; gap:10px; padding:12px 18px; border-top:1px solid #ebe5d9; background:#fbf8f3; }
.c2q-btn { flex:1; min-height:52px; border-radius:999px; border:0; background:linear-gradient(135deg, #4c6852, #7f9a83); color:#fff; font:700 16px inherit; font-family:inherit; cursor:pointer; padding:0 18px; }
.c2q-btn.is-ghost { flex:0 0 auto; background:#fff; color:#4c6852; border:1.5px solid #d7dfd5; }
.c2q-btn[disabled] { opacity:.5; cursor:default; }
.c2q-alt { display:flex; flex-wrap:wrap; justify-content:center; gap:4px 16px; padding:0 18px calc(10px + env(safe-area-inset-bottom,0px)); }
.c2q-link { background:none; border:0; color:#4c6852; text-decoration:underline; text-underline-offset:3px; font:500 14px inherit; font-family:inherit; min-height:44px; cursor:pointer; padding:0 6px; }
.c2q-writing { display:grid; justify-items:center; text-align:center; gap:12px; padding:48px 8px; }
.c2q-writing p { margin:0; font-family:var(--wk-font-display, Georgia, serif); font-size:21px; line-height:1.45; max-width:30ch; }
.c2q-writing .c2q-hint { font-family:inherit; font-size:14px; }
.c2q-quill { display:flex; gap:8px; }
.c2q-quill i { width:12px; height:12px; border-radius:50%; background:#e8a5b5; animation:c2q-b 1.1s ease-in-out infinite; }
.c2q-quill i:nth-child(2) { background:#9db59a; animation-delay:.15s; }
.c2q-quill i:nth-child(3) { background:#c2a165; animation-delay:.3s; }
@keyframes c2q-b { 0%,100% { transform:translateY(0); opacity:.6; } 50% { transform:translateY(-10px); opacity:1; } }
.c2q-review { margin:0 -4px; }
@media (prefers-reduced-motion: reduce) { .c2q-sheet, .c2q-quill i { animation:none; } }
`;
