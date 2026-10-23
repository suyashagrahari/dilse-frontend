"use client";

// ─── "Let AI write it": a few questions → the whole invitation → the review ─
//
// The shared StoryStarter's guided questions are relationship-shaped (how you
// met, what you love, cute/funny/filmy); a church wedding needs other ones, so
// this sheet asks its own eight — names, the date and time, the church, the
// functions, the families, how they met, tone and a second language, a person
// to call — composes one plain-English description from the answers and hands
// it to the same `generateGuided` the shared flow uses. The result lands on
// the shared StoryReview screen: every filled field, editable in place, and
// what is still empty, loud. "I'll fill it myself" is on every screen.
//
// The answers are kept for the session (sessionStorage `ss:guided-wedding:v1`)
// so going back, or opening another wedding design, starts pre-filled. Facts
// the guest must get right (date, time, church, parents, the contact's phone)
// are written to the form from the answers themselves after the fill, so a
// model that paraphrased one never wins over what the sender typed.

import { useEffect, useMemo, useRef, useState } from "react";
import StoryReview from "@/components/story/StoryReview";
import type { UseStoryFillResult } from "@/hooks/useStoryFill";
import { WeddingRoot } from "../../../_wedding";
import { ALT_SAMPLES, CW_THEMES, DEMO, QUICK_FUNCTIONS, SECOND_LANGS, type CwData, type SecondLang } from "../model";
import { AI_CSS } from "./css";

const KEY = "ss:guided-wedding:v1";
const same = (x: unknown, y: unknown) => JSON.stringify(x) === JSON.stringify(y);

interface Answers {
  bride: string;
  groom: string;
  date: string;
  time: string;
  church: string;
  city: string;
  functions: { name: string; date: string }[];
  brideParents: string;
  groomParents: string;
  story: string;
  tone: string;
  secondLang: SecondLang;
  contactName: string;
  contactRelation: string;
  contactPhone: string;
}

const EMPTY: Answers = {
  bride: "",
  groom: "",
  date: "",
  time: "",
  church: "",
  city: "",
  functions: [{ name: "Holy Matrimony", date: "" }],
  brideParents: "",
  groomParents: "",
  story: "",
  tone: "Faith-filled",
  secondLang: "none",
  contactName: "",
  contactRelation: "",
  contactPhone: "",
};

const TONES = [
  { id: "Traditional", sub: "Reverent, classic church wording" },
  { id: "Faith-filled", sub: "Scripture-warm and joyful" },
  { id: "Warm & modern", sub: "Personal and relaxed" },
  { id: "Fun", sub: "Light-hearted, still gracious" },
];

const FUNCTIONS = ["Betrothal", "Bridal Shower", "Rehearsal Dinner", "Holy Matrimony", "Nuptial Mass", "Reception", "Thanksgiving Brunch"];

function load(): Answers {
  try {
    const v = JSON.parse(sessionStorage.getItem(KEY) || "null") as Partial<Answers> | null;
    if (v && typeof v === "object") return { ...EMPTY, ...v, functions: Array.isArray(v.functions) && v.functions.length ? v.functions : EMPTY.functions };
  } catch {}
  return EMPTY;
}

const fmtDate = (iso: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
  const d = new Date(`${iso}T00:00:00Z`);
  return `${new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(d)} (${iso})`;
};
const fmtTime = (t: string) => {
  const m = t.match(/^(\d{2}):(\d{2})$/);
  if (!m) return "";
  const h = Number(m[1]);
  return `${h % 12 || 12}:${m[2]} ${h >= 12 ? "pm" : "am"} (${t})`;
};

/** One plain-English description, composed the same way every time. */
export function composeStory(a: Answers): string {
  const lines: string[] = [];
  lines.push(`This is a Christian church wedding. The bride is ${a.bride.trim()} and the groom is ${a.groom.trim()}.`);
  const when = [fmtDate(a.date), a.time ? `at ${fmtTime(a.time)}` : ""].filter(Boolean).join(" ");
  const where = [a.church.trim(), a.city.trim()].filter(Boolean).join(", ");
  if (when || where) lines.push(`They will be united in Holy Matrimony${where ? ` at ${where}` : ""}${when ? ` on ${when}` : ""}.`);
  const fns = a.functions.filter((f) => f.name.trim());
  if (fns.length) {
    lines.push(
      `The wedding functions, in order: ${fns
        .map((f) => `${f.name.trim()}${f.date ? ` on ${fmtDate(f.date)}` : a.date && /matrimony|nuptial|wedding|ceremony/i.test(f.name) ? ` on ${fmtDate(a.date)}` : " (date not decided yet)"}`)
        .join("; ")}.`,
    );
  }
  if (a.brideParents.trim()) lines.push(`The bride's parents are ${a.brideParents.trim()}.`);
  if (a.groomParents.trim()) lines.push(`The groom's parents are ${a.groomParents.trim()}.`);
  if (a.story.trim()) lines.push(`How they met and their story: ${a.story.trim()}`);
  if (a.contactName.trim() && a.contactPhone.trim()) lines.push(`For questions, guests can call ${a.contactName.trim()}${a.contactRelation.trim() ? ` (${a.contactRelation.trim()})` : ""} on ${a.contactPhone.trim()}.`);
  lines.push(`The tone they want: ${a.tone}.`);
  return lines.join("\n");
}

interface Props {
  fill: UseStoryFillResult;
  setMf: (fn: (p: CwData) => CwData) => void;
  onClose: () => void;
}

export default function AiSheet({ fill, setMf, onClose }: Props) {
  // Client-only (the page loads this sheet with ssr: false), so the session's answers are read on the first render.
  const [a, setA] = useState<Answers>(load);
  const [i, setI] = useState(0);
  const [own, setOwn] = useState(false);
  const [ownText, setOwnText] = useState("");
  const [err, setErr] = useState("");
  const pending = useRef<Answers | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(a));
    } catch {}
  }, [a]);
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
    bodyRef.current?.querySelector<HTMLElement>("input, textarea, button.cwa-chip")?.focus({ preventScroll: true });
  }, [i, own, fill.mode]);

  // After the fill: the answers that are facts win over the model's wording.
  useEffect(() => {
    if (fill.mode !== "done" || !pending.current) return;
    const x = pending.current;
    pending.current = null;
    setMf((p) => ({
      ...p,
      brideName: x.bride.trim() || p.brideName,
      groomName: x.groom.trim() || p.groomName,
      weddingDay: x.date || p.weddingDay,
      weddingTime: x.time || p.weddingTime,
      churchName: x.church.trim() || p.churchName,
      venue: p.venue === DEMO.venue && x.city.trim() ? x.city.trim() : p.venue,
      brideFamily: x.brideParents.trim() ? { ...p.brideFamily, parents: p.brideFamily.parents && p.brideFamily.parents !== DEMO.brideFamily.parents ? p.brideFamily.parents : x.brideParents.trim() } : p.brideFamily,
      groomFamily: x.groomParents.trim() ? { ...p.groomFamily, parents: p.groomFamily.parents && p.groomFamily.parents !== DEMO.groomFamily.parents ? p.groomFamily.parents : x.groomParents.trim() } : p.groomFamily,
      secondLang: x.secondLang,
      // The second language is never generated: a short line reviewed per language.
      altInvitation: x.secondLang === "none" ? "" : !p.altInvitation.trim() || Object.values(ALT_SAMPLES).includes(p.altInvitation) ? ALT_SAMPLES[x.secondLang] : p.altInvitation,
      // The demo's own extras never survive into a real couple's page.
      blessingsOf: p.blessingsOf === DEMO.blessingsOf ? "" : p.blessingsOf,
      things: same(p.things, DEMO.things) ? [] : p.things,
      gettingThere: same(p.gettingThere, DEMO.gettingThere) ? "" : p.gettingThere,
      hashtag: p.hashtag === DEMO.hashtag ? `#${(x.bride.trim() || p.brideName).replace(/\s+/g, "")}Weds${(x.groom.trim() || p.groomName).replace(/\s+/g, "")}` : p.hashtag,
      bride: p.bride.description === DEMO.bride.description ? { ...p.bride, description: "" } : p.bride,
      groom: p.groom.description === DEMO.groom.description ? { ...p.groom, description: "" } : p.groom,
      orderOfService: same(p.orderOfService, DEMO.orderOfService) && x.time ? p.orderOfService.map((r, k) => (k === 0 ? { ...r, time: x.time } : r)) : p.orderOfService,
      contacts: p.contacts.map((c, k) => (k === 0 && x.contactPhone.trim() ? { ...c, phone: x.contactPhone.trim() } : c)),
    }));
  }, [fill.mode, setMf]);

  // Own words: a date whose day of the month the text never states is the
  // model padding "March 2027" to the 1st. Clear it, so the review shows it
  // empty (loud) instead of a day nobody chose.
  const ownPending = useRef<string | null>(null);
  useEffect(() => {
    if (fill.mode !== "done" || ownPending.current === null) return;
    const text = ownPending.current;
    ownPending.current = null;
    const stated = (iso: string) => !iso || new RegExp(`(^|\\D)0?${Number(iso.slice(8, 10))}(st|nd|rd|th)?(\\D|$)`, "i").test(text);
    setMf((p) => {
      const wedding = stated(p.weddingDay) ? p.weddingDay : "";
      return {
        ...p,
        weddingDay: wedding,
        // "the same evening" legitimately has no number: a function on the (kept) wedding day stays.
        events: p.events.map((e) => (e.isoDate && e.isoDate !== wedding && !stated(e.isoDate) ? { ...e, isoDate: "" } : e.isoDate && !wedding && e.isoDate === p.weddingDay ? { ...e, isoDate: "" } : e)),
      };
    });
  }, [fill.mode, setMf]);

  const set = (patch: Partial<Answers>) => setA((p) => ({ ...p, ...patch }));
  const toggleFn = (name: string) =>
    setA((p) => {
      const has = p.functions.some((f) => f.name === name);
      const next = has ? p.functions.filter((f) => f.name !== name) : [...p.functions, { name, date: name === "Holy Matrimony" || name === "Nuptial Mass" ? p.date : "" }];
      const order = (n: string) => FUNCTIONS.indexOf(n);
      return { ...p, functions: next.sort((x, y) => order(x.name) - order(y.name)) };
    });

  const go = () => {
    setErr("");
    const people = { userName: a.groom.trim(), partnerName: a.bride.trim(), bestFriendName: a.bride.trim(), partnerPronouns: "" };
    pending.current = a;
    fill.generateGuided({ people, story: composeStory(a), hints: { tone: `${a.tone} (a Christian church wedding)`, language: "en", occasion: "a Christian wedding (Holy Matrimony)" } });
  };
  const goOwn = () => {
    if (ownText.trim().length < 20) {
      setErr("A couple of sentences is enough — the names, the date and the church.");
      return;
    }
    setErr("");
    pending.current = null;
    ownPending.current = ownText.trim();
    fill.generateGuided({ people: { userName: "", partnerName: "", bestFriendName: "", partnerPronouns: "" }, story: ownText.trim(), hints: { occasion: "a Christian wedding (Holy Matrimony)" } });
  };

  const steps = useMemo(
    () => [
      {
        q: "Whose wedding is it?",
        hint: "Just the first names, the way guests know them.",
        ok: !!a.bride.trim() && !!a.groom.trim(),
        body: (
          <div className="cwa-grid2">
            <label className="cwa-field">
              <span>Bride</span>
              <input className="cwa-input" value={a.bride} onChange={(e) => set({ bride: e.target.value })} placeholder="e.g. Anna" autoComplete="off" maxLength={30} />
            </label>
            <label className="cwa-field">
              <span>Groom</span>
              <input className="cwa-input" value={a.groom} onChange={(e) => set({ groom: e.target.value })} placeholder="e.g. Joel" autoComplete="off" maxLength={30} />
            </label>
          </div>
        ),
      },
      {
        q: "When is the ceremony?",
        hint: "The date and the time the service begins.",
        ok: true,
        body: (
          <div className="cwa-grid2">
            <label className="cwa-field">
              <span>Date</span>
              <input className="cwa-input" type="date" value={a.date} onChange={(e) => set({ date: e.target.value, functions: a.functions.map((f) => (/matrimony|nuptial/i.test(f.name) && !f.date ? { ...f, date: e.target.value } : f)) })} />
            </label>
            <label className="cwa-field">
              <span>Time</span>
              <input className="cwa-input" type="time" value={a.time} onChange={(e) => set({ time: e.target.value })} />
            </label>
          </div>
        ),
      },
      {
        q: "Which church?",
        hint: "Guests will get directions to it.",
        ok: true,
        body: (
          <>
            <label className="cwa-field">
              <span>Church</span>
              <input className="cwa-input" value={a.church} onChange={(e) => set({ church: e.target.value })} placeholder="e.g. St. Mary's Cathedral Basilica" maxLength={90} />
            </label>
            <label className="cwa-field">
              <span>Town or address</span>
              <input className="cwa-input" value={a.city} onChange={(e) => set({ city: e.target.value })} placeholder="e.g. Ernakulam, Kochi" maxLength={120} />
            </label>
          </>
        ),
      },
      {
        q: "Which celebrations?",
        hint: "Tap all that apply. Add a date if it isn't the wedding day.",
        ok: true,
        body: (
          <>
            <div className="cwa-chips" role="group" aria-label="Functions">
              {FUNCTIONS.map((f) => {
                const on = a.functions.some((x) => x.name === f);
                const icon = QUICK_FUNCTIONS.find((q) => q.name === f)?.icon;
                return (
                  <button key={f} type="button" className={`cwa-chip${on ? " is-on" : ""}`} aria-pressed={on} onClick={() => toggleFn(f)}>
                    <span aria-hidden>{icon}</span> {f}
                  </button>
                );
              })}
            </div>
            {a.functions.length > 0 && (
              <ul className="cwa-fn-dates">
                {a.functions.map((f, k) => (
                  <li key={f.name}>
                    <span>{f.name}</span>
                    <input
                      className="cwa-input"
                      type="date"
                      aria-label={`${f.name} date`}
                      value={f.date}
                      onChange={(e) => set({ functions: a.functions.map((x, j) => (j === k ? { ...x, date: e.target.value } : x)) })}
                    />
                  </li>
                ))}
              </ul>
            )}
          </>
        ),
      },
      {
        q: "Who are the families?",
        hint: "As you'd print them on a card. Leave blank to skip.",
        ok: true,
        body: (
          <>
            <label className="cwa-field">
              <span>Bride&apos;s parents</span>
              <input className="cwa-input" value={a.brideParents} onChange={(e) => set({ brideParents: e.target.value })} placeholder="e.g. Mr. Thomas & Mrs. Mary Kurian" maxLength={120} />
            </label>
            <label className="cwa-field">
              <span>Groom&apos;s parents</span>
              <input className="cwa-input" value={a.groomParents} onChange={(e) => set({ groomParents: e.target.value })} placeholder="e.g. Mr. George & Mrs. Annie Mathew" maxLength={120} />
            </label>
          </>
        ),
      },
      {
        q: "How did you meet?",
        hint: "One or two true moments — a place, a season, the proposal. Optional.",
        ok: true,
        body: (
          <label className="cwa-field">
            <span>Your story</span>
            <textarea className="cwa-input cwa-area" rows={5} value={a.story} onChange={(e) => set({ story: e.target.value })} placeholder="We met in the parish choir in 2019… he proposed on a houseboat in Alleppey." maxLength={900} />
          </label>
        ),
      },
      {
        q: "How should it sound?",
        hint: "And whether to add a second language.",
        ok: true,
        body: (
          <>
            <div className="cwa-tones" role="radiogroup" aria-label="Tone">
              {TONES.map((t) => (
                <button key={t.id} type="button" role="radio" aria-checked={a.tone === t.id} className={`cwa-tone${a.tone === t.id ? " is-on" : ""}`} onClick={() => set({ tone: t.id })}>
                  <b>{t.id}</b>
                  <small>{t.sub}</small>
                </button>
              ))}
            </div>
            <p className="cwa-sub">Second language</p>
            <div className="cwa-chips" role="radiogroup" aria-label="Second language">
              {SECOND_LANGS.map((l) => (
                <button key={l.id} type="button" role="radio" aria-checked={a.secondLang === l.id} className={`cwa-chip${a.secondLang === l.id ? " is-on" : ""}`} onClick={() => set({ secondLang: l.id })}>
                  {l.label}
                  {l.native && (
                    <span lang={l.lang} className="cwa-native">
                      {l.native}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </>
        ),
      },
      {
        q: "Who should guests call?",
        hint: "A brother, a cousin, a planner — for directions and questions. Optional.",
        ok: !a.contactPhone.trim() || a.contactPhone.replace(/\D/g, "").length >= 10,
        body: (
          <>
            <div className="cwa-grid2">
              <label className="cwa-field">
                <span>Name</span>
                <input className="cwa-input" value={a.contactName} onChange={(e) => set({ contactName: e.target.value })} placeholder="e.g. Thomas Kurian" maxLength={40} />
              </label>
              <label className="cwa-field">
                <span>Relation</span>
                <input className="cwa-input" value={a.contactRelation} onChange={(e) => set({ contactRelation: e.target.value })} placeholder="e.g. Anna's brother" maxLength={40} />
              </label>
            </div>
            <label className="cwa-field">
              <span>Phone</span>
              <span className="cwa-phone">
                <b aria-hidden>+91</b>
                <input className="cwa-input" type="tel" inputMode="tel" value={a.contactPhone} onChange={(e) => set({ contactPhone: e.target.value })} placeholder="98470 12345" maxLength={16} />
              </span>
            </label>
          </>
        ),
      },
    ],
    [a],
  );

  const last = steps.length - 1;
  const cur = steps[Math.min(i, last)];
  const busy = fill.generating;
  const reviewing = fill.mode === "done";

  return (
    <WeddingRoot theme="champagne" background={false} chrome={false} className="cwa-scrim" style={CW_THEMES.ivory.vars as React.CSSProperties}>
      <style>{AI_CSS}</style>
      <div className="cwa" role="dialog" aria-modal="true" aria-labelledby="cwa-title">
        <header className="cwa-top">
          <p className="cwa-eyebrow" id="cwa-title">
            {reviewing ? "Here's your first draft" : own ? "In your own words" : `✦ Let AI write it · ${Math.min(i, last) + 1} of ${steps.length}`}
          </p>
          <button type="button" className="cwa-x" onClick={() => { fill.dismiss(); onClose(); }} aria-label="Close and fill it in myself">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </header>
        {!reviewing && !own && (
          <div className="cwa-progress" aria-hidden>
            {steps.map((_, k) => (
              <i key={k} className={k <= i ? "is-on" : ""} />
            ))}
          </div>
        )}

        <div className="cwa-body" ref={bodyRef}>
          {reviewing ? (
            <div className="cwa-review">
              <StoryReview fill={fill} onDone={onClose} onRewrite={() => fill.setMode("idle")} rewriteLabel="Change my answers" />
            </div>
          ) : busy ? (
            <div className="cwa-busy" role="status" aria-live="polite">
              <span className="cwa-busy-dove" aria-hidden>
                🕊️
              </span>
              <p className="cwa-q">Writing your invitation…</p>
              <p className="cwa-hint">The invitation, the functions, your story and the closing line — about fifteen seconds.</p>
            </div>
          ) : own ? (
            <>
              <h2 className="cwa-q">Tell us about the wedding</h2>
              <p className="cwa-hint">The names, the date, the church, the celebrations, the families — anything you&apos;d put on a card.</p>
              <textarea className="cwa-input cwa-area" rows={8} value={ownText} onChange={(e) => setOwnText(e.target.value)} placeholder="Anna and Joel are getting married at St. Mary's Basilica, Kochi on 16 January 2027 at 3:30 pm…" maxLength={3500} />
              {(err || fill.error) && (
                <p className="cwa-err" role="alert">
                  {err || fill.error}
                </p>
              )}
            </>
          ) : (
            <>
              <h2 className="cwa-q">{cur.q}</h2>
              <p className="cwa-hint">{cur.hint}</p>
              {cur.body}
              {i === last && fill.error && (
                <p className="cwa-err" role="alert">
                  {fill.error}
                </p>
              )}
              {i === 0 && (
                <button type="button" className="cwa-link" onClick={() => setOwn(true)}>
                  or describe it in your own words
                </button>
              )}
            </>
          )}
        </div>

        {!reviewing && !busy && (
          <footer className="cwa-foot">
            {own ? (
              <>
                <button type="button" className="cwa-btn is-ghost" onClick={() => setOwn(false)}>
                  Back
                </button>
                <button type="button" className="cwa-btn" onClick={goOwn}>
                  ✦ Write my invitation
                </button>
              </>
            ) : (
              <>
                {i > 0 ? (
                  <button type="button" className="cwa-btn is-ghost" onClick={() => setI((k) => k - 1)}>
                    Back
                  </button>
                ) : (
                  <button type="button" className="cwa-btn is-ghost" onClick={() => { fill.dismiss(); onClose(); }}>
                    I&apos;ll fill it myself
                  </button>
                )}
                {i < last ? (
                  <button type="button" className="cwa-btn" disabled={!cur.ok} onClick={() => setI((k) => k + 1)}>
                    Next
                  </button>
                ) : (
                  <button type="button" className="cwa-btn" disabled={!cur.ok || !steps[0].ok} onClick={go}>
                    ✦ Write my invitation
                  </button>
                )}
              </>
            )}
          </footer>
        )}
      </div>
    </WeddingRoot>
  );
}
