"use client";
// ─── Wedding Invitation ✦ Premium — the editor ("studio") ─────────────────────
//
// The whole form except music and the finishing touches (DayConfig.formSections):
//   ✨ Describe your wedding (inline AI: fills names, date, every function,
//   the story, families and the message) → the couple → the big day →
//   functions → photos (masonry editor) → the invitation → our story →
//   families → theme → More details (good to know, RSVP, ornament, Hindi).
// Short by default: every function and story moment folds; advanced fields
// sit behind "More details". Writes through updateMf / updateExtra, so the
// engine's draft autosave, Save, coerce and the server sanitiser see it all.

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { MasonryEditor, ThemePicker, WeddingRoot, initialOf, type WeddingPhoto, type WeddingThemeId } from "../../../_wedding";
import type { StudioProps } from "../../../_valentine/editor/studios";
import type { ValentineDayData } from "../../../_valentine/types";
import { DEMO_EVENTS, DEMO_FAQS, DEMO_STORY, WP_LIMITS, newEventId, presetFor, weddingPremiumDay } from "../../../_valentine/days/wedding-invitation-premium";

const SLUG = "wedding-invitation-premium";
type Row = Record<string, unknown>;
const s = (v: unknown) => (typeof v === "string" ? v : "");
const rowsOf = (v: unknown): Row[] => (Array.isArray(v) ? (v as Row[]) : []);
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

const FUNCTION_CHIPS = ["Haldi", "Mehendi", "Sangeet", "Wedding", "Reception", "Engagement", "Cocktail"];
const AI_CHIPS = ["Make it formal", "Make it warm", "Add Hindi", "Mention our families", "Keep it short"];
const AI_PLACEHOLDER =
  "Ananya and Arjun are getting married on 12 Feb 2027 at The Leela Palace, Udaipur. Haldi and Mehendi on the 10th, Sangeet on the 11th, pheras at 7 pm, reception on the 13th in Delhi. We met at college in Pune in 2018. Keep it warm, a little royal, and add a Hindi line.";
const GENERIC_FAQS = [
  { title: "Dress code", text: "Every function has its own colours, written on its card above. Comfortable shoes are a good idea." },
  { title: "Getting there", text: "Tap Directions on any function for the map. Call the family if you need help with a ride." },
];
const UPSELL_EVENTS = "Make it a royal entrance: palace gates, 40 photos, a blessings wall and every function on the guest's calendar.";

// ── Small form pieces (the sheet's own vs-* classes) ─────────────────────────
function F({ label, hint, children, id, req }: { label: string; hint?: ReactNode; children: ReactNode; id?: string; req?: boolean }) {
  return (
    <div className="vs-field">
      <label className="vs-label" htmlFor={id}>
        <span>
          {label}
          {req && <i className="vs-req" aria-hidden>*</i>}
        </span>
      </label>
      {children}
      {hint && <span className="vs-hint">{hint}</span>}
    </div>
  );
}

function T({ id, value, onChange, max, placeholder, type, area, rows }: { id: string; value: string; onChange: (v: string) => void; max: number; placeholder?: string; type?: string; area?: boolean; rows?: number }) {
  return area ? (
    <textarea id={id} className="vs-input vs-area" rows={rows ?? 4} value={value} maxLength={max} placeholder={placeholder} onChange={(e) => onChange(e.target.value.slice(0, max))} />
  ) : (
    <input id={id} className="vs-input" type={type ?? "text"} value={value} maxLength={max} placeholder={placeholder} onChange={(e) => onChange(e.target.value.slice(0, max))} />
  );
}

function Head({ n, title, sub, done }: { n?: number; title: string; sub?: string; done?: boolean }) {
  return (
    <header className="vs-secHead">
      {n !== undefined && (
        <span className={`vs-secN${done ? " is-done" : ""}`} aria-hidden>
          {done ? "✓" : n}
        </span>
      )}
      <div style={{ minWidth: 0 }}>
        <h3 className="vs-secH">{title}</h3>
        {sub && <p className="vs-secSub">{sub}</p>}
      </div>
    </header>
  );
}

function RowTools({ i, n, onMove, onRemove, label }: { i: number; n: number; onMove: (d: -1 | 1) => void; onRemove: () => void; label: string }) {
  return (
    <span className="wps-tools">
      <button type="button" className="wps-icon" onClick={() => onMove(-1)} disabled={i === 0} aria-label={`Move ${label} up`}>
        ↑
      </button>
      <button type="button" className="wps-icon" onClick={() => onMove(1)} disabled={i === n - 1} aria-label={`Move ${label} down`}>
        ↓
      </button>
      <button type="button" className="wps-icon is-del" onClick={onRemove} aria-label={`Remove ${label}`}>
        ✕
      </button>
    </span>
  );
}

const move = <X,>(list: X[], i: number, d: -1 | 1): X[] => {
  const j = i + d;
  if (j < 0 || j >= list.length) return list;
  const next = list.slice();
  [next[i], next[j]] = [next[j], next[i]];
  return next;
};

// ── AI: clear what is still the demo, so the model writes this wedding ───────
function clearDemo(mf: ValentineDayData): ValentineDayData {
  const demo = weddingPremiumDay.demo;
  const x = { ...(mf.extras as Row) };
  const dx = demo.extras as Row;
  for (const k of ["date", "time", "city", "hashtag", "brideParents", "brideNote", "groomParents", "groomNote", "rsvpBy"]) if (same(x[k], dx[k])) x[k] = "";
  const blankEvent = { id: "", title: "", date: "", time: "", endTime: "", venue: "", address: "", mapUrl: "", dressCode: "", note: "" };
  const events = rowsOf(x.events).map((e, i) => (same(e, DEMO_EVENTS[i]) ? { ...blankEvent } : e));
  while (events.length < WP_LIMITS.events) events.push({ ...blankEvent });
  x.events = events;
  const story = rowsOf(x.story).map((r, i) => (same(r, DEMO_STORY[i]) ? { when: "", title: "", text: "", photo: 0 } : r));
  while (story.length < 3) story.push({ when: "", title: "", text: "", photo: 0 });
  x.story = story;
  if (same(x.faqs, DEMO_FAQS)) x.faqs = GENERIC_FAQS.map((f) => ({ ...f }));
  return {
    ...mf,
    recipientName: mf.recipientName === demo.recipientName ? "" : mf.recipientName,
    senderName: mf.senderName === demo.senderName ? "" : mf.senderName,
    letter: mf.letter === demo.letter ? "" : mf.letter,
    endLine: mf.endLine === demo.endLine ? "" : mf.endLine,
    extras: x,
  };
}

/** After the model: drop empty rows, give every function an id, a time and its usual dress code/description. */
export function tidyAfterFill(mf: ValentineDayData): ValentineDayData {
  const x = { ...(mf.extras as Row) };
  const taken: string[] = [];
  let events = rowsOf(x.events).filter((e) => s(e.title).trim());
  events = events.map((e) => {
    const p = presetFor(s(e.title), x.motif);
    let id = s(e.id).trim();
    if (!id || taken.includes(id)) id = newEventId(s(e.title), taken);
    taken.push(id);
    return {
      ...e,
      id,
      time: s(e.time) || p?.time || "",
      dressCode: s(e.dressCode) || p?.dressCode || "",
      note: s(e.note) || p?.note || "",
      date: s(e.date) || s(x.date),
    };
  });
  if (!events.length) events = [{ id: "wedding", title: "Wedding", date: s(x.date), time: s(x.time) || "19:00", endTime: "", venue: s(x.city), address: "", mapUrl: "", dressCode: "Traditional festive", note: "" }];
  x.events = events;
  x.story = rowsOf(x.story).filter((r) => s(r.title).trim() || s(r.text).trim());
  if (!s(x.date)) {
    const main = events.find((e) => presetFor(s(e.title))?.title === "Wedding" || presetFor(s(e.title))?.title === "Ceremony") ?? events[0];
    x.date = s(main?.date);
    if (!s(x.time)) x.time = s(main?.time);
  }
  return { ...mf, extras: x };
}

// ── The studio ───────────────────────────────────────────────────────────────
export default function WeddingPremiumStudio({ mf, updateMf, updateExtra, fill }: StudioProps) {
  const x = mf.extras as Row;
  const events = rowsOf(x.events);
  const story = rowsOf(x.story);
  const faqs = rowsOf(x.faqs);
  const [desc, setDesc] = useState("");
  const [openEv, setOpenEv] = useState<number | null>(null);
  const [openMo, setOpenMo] = useState<number | null>(null);
  const [more, setMore] = useState(false);
  const [aiState, setAiState] = useState<"idle" | "running" | "done" | "error">("idle");
  const aiText = useRef("");
  const mfRef = useRef(mf);
  useEffect(() => {
    mfRef.current = mf;
  });

  // 1) clear the demo (write) → 2) once that render landed, ask the model → 3) tidy (below).
  // The fill hook mirrors the form in its own (parent) effect, which runs after
  // this child's effects — so the request goes out on the next tick.
  const pendingExtras = useRef<unknown>(null);
  useEffect(() => {
    if (!pendingExtras.current || mf.extras !== pendingExtras.current || !fill) return;
    pendingExtras.current = null;
    const run = fill.generateGuided;
    window.setTimeout(() => run({ people: { userName: "", partnerName: "", bestFriendName: "", partnerPronouns: "" }, story: aiText.current }), 0);
  }, [mf.extras, fill]);
  const generating = !!fill?.generating;
  const wasGenerating = useRef(false);
  useEffect(() => {
    if (aiState !== "running") return;
    if (generating) {
      wasGenerating.current = true;
      return;
    }
    if (!wasGenerating.current) return;
    wasGenerating.current = false;
    if (fill?.error) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reacting to the fill hook finishing (an external request)
      setAiState("error");
      return;
    }
    const next = tidyAfterFill(mfRef.current);
    updateMf("extras", next.extras);
    setAiState("done");
  }, [generating, aiState, fill?.error, updateMf]);

  const write = () => {
    const text = desc.trim();
    if (text.length < 20 || !fill) return;
    aiText.current = text;
    const cleared = clearDemo(mf);
    updateMf("recipientName", cleared.recipientName);
    updateMf("senderName", cleared.senderName);
    updateMf("letter", cleared.letter);
    updateMf("endLine", cleared.endLine);
    updateMf("extras", cleared.extras);
    setOpenEv(null);
    setAiState("running");
    pendingExtras.current = cleared.extras;
  };

  // ── Rows ──
  const setEvents = (next: Row[]) => updateExtra("events", next);
  const setEv = (i: number, k: string, v: string) => setEvents(events.map((e, j) => (j === i ? { ...e, [k]: v } : e)));
  const setEvTitle = (i: number, v: string) => {
    const e = events[i];
    const was = presetFor(s(e.title), x.motif);
    const p = presetFor(v, x.motif);
    // A fresh preset fills the dress code / description only where they were empty or still the old preset's.
    const patch: Row = { title: v };
    if (p) {
      if (!s(e.dressCode) || (was && e.dressCode === was.dressCode)) patch.dressCode = p.dressCode;
      if (!s(e.note) || (was && e.note === was.note)) patch.note = p.note;
      if (!s(e.time)) patch.time = p.time;
    }
    setEvents(events.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  };
  const addEvent = () => {
    if (events.length >= WP_LIMITS.events) return;
    const used = events.map((e) => s(e.title).toLowerCase());
    const title = ["Haldi", "Mehendi", "Sangeet", "Wedding", "Reception"].find((t) => !used.includes(t.toLowerCase())) ?? "Engagement";
    const p = presetFor(title, x.motif);
    const row = { id: newEventId(title, events.map((e) => s(e.id))), title, date: s(x.date), time: p?.time ?? "", endTime: "", venue: "", address: "", mapUrl: "", dressCode: p?.dressCode ?? "", note: p?.note ?? "" };
    setEvents([...events, row]);
    setOpenEv(events.length);
  };

  const setStory = (next: Row[]) => updateExtra("story", next);
  const setMo = (i: number, k: string, v: unknown) => setStory(story.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  const setFaqs = (next: Row[]) => updateExtra("faqs", next);

  // Photos: keep each story moment pointing at the same picture when photos move.
  const photos = mf.photos as WeddingPhoto[];
  const onPhotos = useCallback(
    (next: WeddingPhoto[]) => {
      const cur = mfRef.current;
      const before = cur.photos;
      const st = rowsOf((cur.extras as Row).story);
      const moved = st.map((r) => {
        const n = Math.round(Number(r.photo) || 0);
        if (!n) return r;
        const url = before[n - 1]?.url;
        const k = url ? next.findIndex((p) => p.url === url) : -1;
        return { ...r, photo: k >= 0 ? k + 1 : 0 };
      });
      updateMf("photos", next.slice(0, WP_LIMITS.photos));
      if (!same(moved, st)) updateExtra("story", moved);
    },
    [updateMf, updateExtra],
  );

  const bride = mf.recipientName;
  const groom = mf.senderName;
  const sample = `${initialOf(bride || "A")} & ${initialOf(groom || "V")}`;
  const done = {
    couple: !!bride.trim() && !!groom.trim(),
    day: /^\d{4}-\d{2}-\d{2}$/.test(s(x.date)),
    events: events.some((e) => s(e.title).trim()),
    photos: photos.length > 0,
    letter: mf.letter.trim().length >= 20,
  };
  const evLabel = (e: Row) => [s(e.title) || "Untitled", s(e.date) && new Date(`${s(e.date)}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" }), s(e.venue)].filter(Boolean).join(" · ");

  const aiMsg =
    aiState === "running"
      ? "Writing your invitation…"
      : aiState === "done"
        ? "Done. Read it through and change anything you like."
        : aiState === "error"
          ? fill?.error || "That didn't work. Try again, or fill the form yourself."
          : null;

  const busy = aiState === "running";

  return (
    <div className="wps">
      <style>{STUDIO_CSS}</style>


      {fill?.schema && (
        <section className="wps-ai" aria-labelledby="wps-ai-h">
          <p className="wps-ai-k">✨ Describe your wedding</p>
          <h3 className="wps-ai-h" id="wps-ai-h">
            Describe your wedding in a few lines
          </h3>
          <p className="wps-ai-p">We&apos;ll fill in everything below: names, every function, your story, families and the invitation. You can change any of it.</p>
          <textarea className="wps-ai-in" rows={5} value={desc} maxLength={1500} placeholder={AI_PLACEHOLDER} onChange={(e) => setDesc(e.target.value)} aria-label="Describe your wedding" disabled={busy} />
          <div className="wps-chips">
            {AI_CHIPS.map((c) => (
              <button key={c} type="button" className="wps-chip" disabled={busy} onClick={() => setDesc((d) => (d.trim() ? `${d.trim().replace(/[.]?$/, ".")} ${c}.` : `${c}.`))}>
                + {c}
              </button>
            ))}
          </div>
          <div className="wps-ai-row">
            <button type="button" className="wps-ai-btn" onClick={write} disabled={busy || desc.trim().length < 20} aria-busy={busy || undefined}>
              {busy ? "Writing…" : "Write my invitation"}
            </button>
            {aiMsg && (
              <p className={`wps-ai-st${aiState === "error" ? " is-err" : ""}`} role="status">
                {aiMsg}
              </p>
            )}
          </div>
        </section>
      )}

      {/* 1 · The couple */}
      <section className="vs-sec" aria-labelledby="wps-h1">
        <Head n={1} done={done.couple} title="The couple" sub="Names as you'd like them printed." />
        <div className="vs-row2">
          <F label="Bride's name" id="wps-bride" req>
            <T id="wps-bride" value={bride} onChange={(v) => updateMf("recipientName", v)} max={30} placeholder="e.g. Ananya" />
          </F>
          <F label="Groom's name" id="wps-groom" req>
            <T id="wps-groom" value={groom} onChange={(v) => updateMf("senderName", v)} max={30} placeholder="e.g. Arjun" />
          </F>
        </div>
        <div className="wps-seg" role="radiogroup" aria-label="Show names as">
          {(["bride", "groom"] as const).map((o) => {
            const on = (x.order === "groom" ? "groom" : "bride") === o;
            const label = o === "bride" ? `${bride || "Ananya"} & ${groom || "Arjun"}` : `${groom || "Arjun"} & ${bride || "Ananya"}`;
            return (
              <button key={o} type="button" role="radio" aria-checked={on} className={on ? "is-on" : ""} onClick={() => updateExtra("order", o)}>
                {label}
              </button>
            );
          })}
        </div>
      </section>

      {/* 2 · The big day */}
      <section className="vs-sec">
        <Head n={2} done={done.day} title="The big day" sub="Used for the countdown and the calendar invite." />
        <div className="vs-row2">
          <F label="Wedding date" id="wps-date" req>
            <T id="wps-date" type="date" value={s(x.date)} onChange={(v) => updateExtra("date", v)} max={10} />
          </F>
          <F label="Ceremony time" id="wps-time" hint="The muhurat / pheras / service.">
            <T id="wps-time" type="time" value={s(x.time)} onChange={(v) => updateExtra("time", v)} max={5} />
          </F>
        </div>
        <F label="City" id="wps-city">
          <T id="wps-city" value={s(x.city)} onChange={(v) => updateExtra("city", v)} max={40} placeholder="e.g. Udaipur" />
        </F>
      </section>

      {/* 3 · Functions */}
      <section className="vs-sec">
        <Head n={3} done={done.events} title="Functions" sub="Add, remove or reorder. Each one gets its own map and timings." />
        <ol className="wps-list">
          {events.map((e, i) => {
            const open = openEv === i;
            const label = s(e.title) || `Function ${i + 1}`;
            return (
              <li key={`${s(e.id)}-${i}`} className={`wps-item${open ? " is-open" : ""}`}>
                <div className="wps-itemHead">
                  <button type="button" className="wps-itemBtn" onClick={() => setOpenEv(open ? null : i)} aria-expanded={open}>
                    <span>
                      <b>{label}</b>
                      <small>{evLabel(e).replace(/^[^·]*·?\s?/, "") || "Tap to add the date and venue"}</small>
                    </span>
                  </button>
                  <RowTools i={i} n={events.length} label={label} onMove={(d) => { setEvents(move(events, i, d)); setOpenEv(null); }} onRemove={() => { setEvents(events.filter((_, j) => j !== i)); setOpenEv(null); }} />
                </div>
                {open && (
                  <div className="wps-itemBody">
                    <F label="Name" id={`wps-ev${i}-t`}>
                      <T id={`wps-ev${i}-t`} value={s(e.title)} onChange={(v) => setEvTitle(i, v)} max={30} placeholder="e.g. Sangeet" />
                    </F>
                    <div className="wps-chips is-tight">
                      {FUNCTION_CHIPS.map((c) => (
                        <button key={c} type="button" className={`wps-chip${s(e.title) === c ? " is-on" : ""}`} onClick={() => setEvTitle(i, c)}>
                          {c}
                        </button>
                      ))}
                    </div>
                    <div className="wps-row3">
                      <F label="Date" id={`wps-ev${i}-d`}>
                        <T id={`wps-ev${i}-d`} type="date" value={s(e.date)} onChange={(v) => setEv(i, "date", v)} max={10} />
                      </F>
                      <F label="Starts" id={`wps-ev${i}-s`}>
                        <T id={`wps-ev${i}-s`} type="time" value={s(e.time)} onChange={(v) => setEv(i, "time", v)} max={5} />
                      </F>
                      <F label="Ends" id={`wps-ev${i}-e`}>
                        <T id={`wps-ev${i}-e`} type="time" value={s(e.endTime)} onChange={(v) => setEv(i, "endTime", v)} max={5} />
                      </F>
                    </div>
                    <F label="Venue" id={`wps-ev${i}-v`}>
                      <T id={`wps-ev${i}-v`} value={s(e.venue)} onChange={(v) => setEv(i, "venue", v)} max={80} placeholder="e.g. The Leela Palace, Udaipur" />
                    </F>
                    <F label="Address" id={`wps-ev${i}-a`}>
                      <T id={`wps-ev${i}-a`} value={s(e.address)} onChange={(v) => setEv(i, "address", v)} max={140} placeholder="Street, city" />
                    </F>
                    <F label="Google Maps link" id={`wps-ev${i}-m`} hint="Paste the share link from Google Maps. Empty = we search the venue and address.">
                      <T id={`wps-ev${i}-m`} type="url" value={s(e.mapUrl)} onChange={(v) => setEv(i, "mapUrl", v.trim())} max={300} placeholder="https://maps.app.goo.gl/…" />
                    </F>
                    <F label="Dress code" id={`wps-ev${i}-c`}>
                      <T id={`wps-ev${i}-c`} value={s(e.dressCode)} onChange={(v) => setEv(i, "dressCode", v)} max={50} placeholder="e.g. Shades of yellow" />
                    </F>
                    <F label="A line for guests" id={`wps-ev${i}-n`}>
                      <T id={`wps-ev${i}-n`} area rows={3} value={s(e.note)} onChange={(v) => setEv(i, "note", v)} max={220} placeholder="What happens, what to bring, timings…" />
                    </F>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
        {events.length < WP_LIMITS.events ? (
          <button type="button" className="wps-add" onClick={addEvent}>
            + Add a function
          </button>
        ) : (
          <p className="wps-upsell">
            This invitation holds {WP_LIMITS.events} functions. <Link href="/royal-wedding-invitation">{UPSELL_EVENTS}</Link>
          </p>
        )}
      </section>

      {/* 4 · Photos */}
      <section className="vs-sec">
        <Head n={4} done={done.photos} title="Photos" sub={`Up to ${WP_LIMITS.photos}. Any shape works. The first photo is your cover. Tap a photo to resize it or set its focus; drag to reorder.`} />
        <WeddingRoot theme="blush" background={false} className="wps-masonry">
          <MasonryEditor photos={photos} onChange={onPhotos} max={WP_LIMITS.photos} mask="soft" upsell="Want 40 photos? The Royal Wedding Invitation holds 40, with captions and a palace entrance." />
        </WeddingRoot>
      </section>

      {/* 5 · The invitation */}
      <section className="vs-sec">
        <Head n={5} done={done.letter} title="Your invitation" sub="The words your guests read first." />
        <F label="The invitation" id="wps-letter" req hint={`${mf.letter.length}/1200 · a blank line starts a new paragraph`}>
          <T id="wps-letter" area rows={6} value={mf.letter} onChange={(v) => updateMf("letter", v)} max={1200} placeholder="Together with their families, Ananya and Arjun request the pleasure of your company…" />
        </F>
      </section>

      {/* 6 · Our story */}
      <section className="vs-sec">
        <Head n={6} title="Our story" sub="A few moments: how you met, the proposal, the yes." />
        <ol className="wps-list">
          {story.map((r, i) => {
            const open = openMo === i;
            const label = s(r.title) || `Moment ${i + 1}`;
            const ph = Math.round(Number(r.photo) || 0);
            return (
              <li key={i} className={`wps-item${open ? " is-open" : ""}`}>
                <div className="wps-itemHead">
                  <button type="button" className="wps-itemBtn" onClick={() => setOpenMo(open ? null : i)} aria-expanded={open}>
                    {ph > 0 && photos[ph - 1] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className="wps-thumb" src={photos[ph - 1].url} alt="" />
                    )}
                    <span>
                      <b>{label}</b>
                      <small>{s(r.when) || "Tap to write it"}</small>
                    </span>
                  </button>
                  <RowTools i={i} n={story.length} label={label} onMove={(d) => { setStory(move(story, i, d)); setOpenMo(null); }} onRemove={() => { setStory(story.filter((_, j) => j !== i)); setOpenMo(null); }} />
                </div>
                {open && (
                  <div className="wps-itemBody">
                    <div className="vs-row2">
                      <F label="When" id={`wps-mo${i}-w`}>
                        <T id={`wps-mo${i}-w`} value={s(r.when)} onChange={(v) => setMo(i, "when", v)} max={30} placeholder="e.g. 2018 · Pune" />
                      </F>
                      <F label="Title" id={`wps-mo${i}-t`}>
                        <T id={`wps-mo${i}-t`} value={s(r.title)} onChange={(v) => setMo(i, "title", v)} max={50} placeholder="e.g. Where it began" />
                      </F>
                    </div>
                    <F label="The moment" id={`wps-mo${i}-x`}>
                      <T id={`wps-mo${i}-x`} area rows={3} value={s(r.text)} onChange={(v) => setMo(i, "text", v)} max={320} placeholder="One or two lines…" />
                    </F>
                    {photos.length > 0 && (
                      <div className="vs-field">
                        <span className="vs-label">Photo</span>
                        <div className="wps-pick" role="radiogroup" aria-label="Photo for this moment">
                          <button type="button" role="radio" aria-checked={ph === 0} className={`wps-pickNone${ph === 0 ? " is-on" : ""}`} onClick={() => setMo(i, "photo", 0)}>
                            None
                          </button>
                          {photos.map((p, k) => (
                            <button key={k} type="button" role="radio" aria-checked={ph === k + 1} aria-label={`Photo ${k + 1}`} className={ph === k + 1 ? "is-on" : ""} onClick={() => setMo(i, "photo", k + 1)}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={p.url} alt="" loading="lazy" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
        {story.length < WP_LIMITS.story && (
          <button type="button" className="wps-add" onClick={() => { setStory([...story, { when: "", title: "", text: "", photo: 0 }]); setOpenMo(story.length); }}>
            + Add a moment
          </button>
        )}
      </section>

      {/* 7 · Families */}
      <section className="vs-sec">
        <Head n={7} title="Your families" sub={`"With the blessings of…" Add parents, grandparents or both.`} />
        <div className="vs-row2">
          <F label="Bride's family" id="wps-bf">
            <T id="wps-bf" value={s(x.brideParents)} onChange={(v) => updateExtra("brideParents", v)} max={90} placeholder="e.g. Mrs. & Mr. Rakesh Sharma" />
          </F>
          <F label="Groom's family" id="wps-gf">
            <T id="wps-gf" value={s(x.groomParents)} onChange={(v) => updateExtra("groomParents", v)} max={90} placeholder="e.g. Mrs. & Mr. Vikram Mehta" />
          </F>
        </div>
        <div className="vs-row2">
          <F label="A line under it (optional)" id="wps-bn">
            <T id="wps-bn" value={s(x.brideNote)} onChange={(v) => updateExtra("brideNote", v)} max={90} placeholder="Grandparents, or the city" />
          </F>
          <F label="A line under it (optional)" id="wps-gn">
            <T id="wps-gn" value={s(x.groomNote)} onChange={(v) => updateExtra("groomNote", v)} max={90} placeholder="Grandparents, or the city" />
          </F>
        </div>
      </section>

      {/* 8 · Theme */}
      <section className="vs-sec">
        <Head n={8} title="Theme" sub="Light or dark, always in gold." />
        <ThemePicker value={(s(x.theme) || "blush") as WeddingThemeId} onChange={(id) => updateExtra("theme", id)} sample={sample} />
      </section>

      {/* 9 · More details */}
      <section className="vs-sec">
        <Head n={9} title="More details" sub="Good to know, RSVP options, the hashtag and the blessing ornament." />
        <button type="button" className="wps-more" onClick={() => setMore((o) => !o)} aria-expanded={more}>
          {more ? "Hide the details" : "Show more details"}
          <span aria-hidden>{more ? "▴" : "▾"}</span>
        </button>
        {more && (
          <div className="wps-moreBody">
            <h4 className="wps-sub">Good to know</h4>
            <p className="vs-hint">Dress code, parking, where to stay, who to call. Up to {WP_LIMITS.faq}.</p>
            {faqs.map((f, i) => (
              <div key={i} className="wps-faq">
                <div className="wps-faqHead">
                  <F label={`Note ${i + 1}`} id={`wps-fq${i}-t`}>
                    <T id={`wps-fq${i}-t`} value={s(f.title)} onChange={(v) => setFaqs(faqs.map((r, j) => (j === i ? { ...r, title: v } : r)))} max={40} placeholder="e.g. Where to stay" />
                  </F>
                  <button type="button" className="wps-icon is-del" onClick={() => setFaqs(faqs.filter((_, j) => j !== i))} aria-label={`Remove note ${i + 1}`}>
                    ✕
                  </button>
                </div>
                <T id={`wps-fq${i}-x`} area rows={2} value={s(f.text)} onChange={(v) => setFaqs(faqs.map((r, j) => (j === i ? { ...r, text: v } : r)))} max={220} placeholder="The details…" />
              </div>
            ))}
            {faqs.length < WP_LIMITS.faq && (
              <button type="button" className="wps-add" onClick={() => setFaqs([...faqs, { title: "", text: "" }])}>
                + Add a note
              </button>
            )}

            <h4 className="wps-sub">RSVP</h4>
            <p className="vs-hint">Replies come to your email. Guests tick each function they&apos;ll attend.</p>
            <div className="vs-row2">
              <F label="Ask guests to reply by" id="wps-by">
                <T id="wps-by" type="date" value={s(x.rsvpBy)} onChange={(v) => updateExtra("rsvpBy", v)} max={10} />
              </F>
              <F label="Most guests per reply" id="wps-max">
                <select id="wps-max" className="vs-input" value={Number(x.maxGuests) || 4} onChange={(e) => updateExtra("maxGuests", Number(e.target.value))}>
                  {Array.from({ length: 10 }, (_, k) => k + 1).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </F>
            </div>
            <label className="wps-check">
              <input type="checkbox" checked={x.rsvpMeal === true} onChange={(e) => updateExtra("rsvpMeal", e.target.checked)} />
              Ask for meal preference (veg / non-veg / Jain)
            </label>

            <h4 className="wps-sub">Touches</h4>
            <F label="Wedding hashtag" id="wps-tag">
              <T id="wps-tag" value={s(x.hashtag)} onChange={(v) => updateExtra("hashtag", v.replace(/\s+/g, ""))} max={40} placeholder="#AnanyaWedsArjun" />
            </F>
            <div className="vs-field">
              <span className="vs-label">Blessing ornament over the invitation</span>
              <div className="wps-seg is-4" role="radiogroup" aria-label="Blessing ornament">
                {(["ganesha", "lotus", "rings", "none"] as const).map((o) => (
                  <button key={o} type="button" role="radio" aria-checked={(x.motif ?? "ganesha") === o} className={(x.motif ?? "ganesha") === o ? "is-on" : ""} onClick={() => updateExtra("motif", o)}>
                    {o === "ganesha" ? "Ganesha" : o === "lotus" ? "Lotus" : o === "rings" ? "Rings" : "None"}
                  </button>
                ))}
              </div>
            </div>
            <label className="wps-check">
              <input type="checkbox" checked={x.hindi !== false} onChange={(e) => updateExtra("hindi", e.target.checked)} />
              Small Hindi lines under the headings (हमारी कहानी…)
            </label>
          </div>
        )}
      </section>
    </div>
  );
}

const STUDIO_CSS = `
.wps-ai { position: relative; display: grid; gap: 10px; padding: 18px; margin: 4px 0 6px; border-radius: 22px; color: #fff;
  background: radial-gradient(120% 140% at 0% 0%, #c9764f 0%, #a94e63 45%, #6e2a3c 100%); box-shadow: 0 18px 40px -22px rgba(110,40,58,.7); }
.wps-ai::after { content: ""; position: absolute; inset: 6px; border-radius: 17px; border: 1px solid rgba(255,228,190,.45); pointer-events: none; }
.wps-ai-k { margin: 0; font-size: 12px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; opacity: .9; }
.wps-ai-h { margin: 0; font-size: 19px; font-weight: 700; line-height: 1.25; }
.wps-ai-p { margin: 0; font-size: 13.5px; line-height: 1.45; opacity: .92; }
.wps-ai-in { position: relative; z-index: 1; width: 100%; min-height: 120px; padding: 12px 14px; border-radius: 14px; border: 0; background: rgba(255,255,255,.96); color: #3e1f27; font: 400 15.5px/1.5 inherit; resize: vertical; outline: none; }
.wps-ai-in:focus { box-shadow: 0 0 0 3px rgba(255,228,190,.8); }
.wps-ai-in::placeholder { color: #87636a; opacity: .75; }
.wps-chips { position: relative; z-index: 1; display: flex; flex-wrap: wrap; gap: 6px; }
.wps-chip { min-height: 36px; padding: 6px 12px; border-radius: 99px; border: 1px solid rgba(255,255,255,.55); background: rgba(255,255,255,.12); color: inherit; font: 600 12.5px inherit; cursor: pointer; }
.wps-chip:disabled { opacity: .5; }
.wps-ai-row { position: relative; z-index: 1; display: flex; flex-wrap: wrap; align-items: center; gap: 10px 14px; }
.wps-ai-btn { min-height: 48px; padding: 0 22px; border-radius: 99px; border: 0; background: linear-gradient(105deg, #f6e3b4, #e2b85f 45%, #fff3d0 60%, #d7a443); color: #4a2410; font: 700 15px inherit; cursor: pointer; box-shadow: 0 8px 20px -10px rgba(0,0,0,.5); }
.wps-ai-btn:disabled { opacity: .6; cursor: default; }
.wps-ai-st { margin: 0; font-size: 13.5px; font-weight: 600; }
.wps-ai-st.is-err { color: #ffe0e0; }

.wps-seg { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; padding: 4px; border-radius: 16px; background: var(--vw-soft); margin-bottom: 8px; }
.wps-seg.is-4 { grid-template-columns: repeat(4, 1fr); }
.wps-seg button { min-height: 44px; padding: 6px 8px; border: 0; border-radius: 12px; background: transparent; color: var(--vw-paper-ink); font: 600 13.5px inherit; cursor: pointer; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.wps-seg button.is-on { background: #fff; box-shadow: 0 2px 8px -3px rgba(0,0,0,.25); color: var(--vw-accent-deep); }
.wps-row3 { display: grid; grid-template-columns: 1fr 1fr; gap: 0 10px; }
.wps-row3 > :first-child { grid-column: 1 / -1; }
@media (min-width: 520px) { .wps-row3 { grid-template-columns: 1.4fr 1fr 1fr; } .wps-row3 > :first-child { grid-column: auto; } }

.wps-list { list-style: none; margin: 0 0 10px; padding: 0; display: grid; gap: 10px; }
.wps-item { border: 2px solid var(--vw-edge); border-radius: 16px; background: #fff; overflow: hidden; }
.wps-item.is-open { border-color: var(--vw-accent); }
.wps-itemHead { display: flex; align-items: center; gap: 4px; padding-right: 6px; }
.wps-itemBtn { flex: 1; min-width: 0; min-height: 56px; display: flex; align-items: center; gap: 10px; padding: 8px 12px; border: 0; background: none; text-align: left; cursor: pointer; color: var(--vw-paper-ink); font: inherit; }
.wps-itemBtn b, .wps-itemBtn small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.wps-itemBtn > span { min-width: 0; }
.wps-itemBtn b { font-size: 15px; }
.wps-itemBtn small { font-size: 12.5px; opacity: .65; margin-top: 2px; }
.wps-thumb { width: 40px; height: 40px; border-radius: 10px; object-fit: cover; flex: none; }
.wps-tools { display: flex; gap: 2px; flex: none; }
.wps-icon { width: 36px; height: 44px; border: 0; border-radius: 10px; background: transparent; color: var(--vw-paper-ink); font-size: 16px; cursor: pointer; opacity: .7; }
.wps-icon:hover:not(:disabled) { background: var(--vw-soft); opacity: 1; }
.wps-icon:disabled { opacity: .2; cursor: default; }
.wps-icon.is-del { color: #b23a48; }
.wps-itemBody { padding: 4px 12px 6px; border-top: 1px dashed var(--vw-edge); }
.wps-itemBody .vs-field:first-child { margin-top: 12px; }
.wps-chips.is-tight { margin: -8px 0 14px; }
.wps-chips.is-tight .wps-chip { border-color: var(--vw-edge); background: var(--vw-soft); color: var(--vw-paper-ink); min-height: 34px; }
.wps-chips.is-tight .wps-chip.is-on { background: var(--vw-accent); color: var(--vw-accent-ink); border-color: transparent; }
.wps-add { width: 100%; min-height: 48px; border-radius: 14px; border: 2px dashed var(--vw-edge); background: transparent; color: var(--vw-accent-deep); font: 700 14.5px inherit; cursor: pointer; margin-bottom: 14px; }
.wps-upsell { margin: 4px 0 14px; font-size: 13px; line-height: 1.45; }
.wps-upsell a { color: var(--vw-accent-deep); font-weight: 700; }
.wps-pick { display: flex; gap: 8px; overflow-x: auto; padding: 2px 2px 8px; scrollbar-width: thin; }
.wps-pick button { flex: none; width: 56px; height: 56px; padding: 0; border-radius: 12px; border: 2px solid transparent; background: var(--vw-soft); overflow: hidden; cursor: pointer; }
.wps-pick button.is-on { border-color: var(--vw-accent); box-shadow: 0 0 0 2px #fff inset; }
.wps-pick img { width: 100%; height: 100%; object-fit: cover; display: block; }
.wps-pickNone { font: 600 12px inherit; color: var(--vw-paper-ink); }
.wps-masonry { display: block; }
.wps-more { width: 100%; min-height: 48px; display: flex; justify-content: space-between; align-items: center; padding: 0 16px; border-radius: 14px; border: 2px solid var(--vw-edge); background: #fff; color: var(--vw-paper-ink); font: 700 14.5px inherit; cursor: pointer; margin-bottom: 14px; }
.wps-moreBody { display: grid; }
.wps-sub { margin: 10px 0 2px; font-size: 15px; }
.wps-moreBody > .vs-hint { margin-bottom: 12px; }
.wps-faq { display: grid; gap: 0; margin-bottom: 14px; }
.wps-faqHead { display: flex; align-items: flex-end; gap: 6px; }
.wps-faqHead .vs-field { flex: 1; margin-bottom: 8px; }
.wps-faqHead .wps-icon { margin-bottom: 10px; }
.wps-check { display: flex; align-items: center; gap: 10px; min-height: 44px; font-size: 14px; font-weight: 600; margin-bottom: 10px; cursor: pointer; }
.wps-check input { width: 20px; height: 20px; accent-color: var(--vw-accent); }
.wps-guests .wk-dash { margin-bottom: 8px; }
`;
