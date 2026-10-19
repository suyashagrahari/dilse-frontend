"use client";

// ─── Wedding Invitation (Classic) — the editor ("studio") ────────────────────
//
// DayConfig.studioForm: this studio draws the whole form; the engine's sheet
// keeps only "Finishing touches" (closing line + password) and the Save bar.
// Short on purpose:
//   ✨ Describe your wedding  (one box → the AI fills everything below)
//   1 The couple              names (+ families)
//   2 Date & functions        the big day, up to two functions with venue + map
//   3 Photos                  masonry editor (≤ 6): size, focal point, drag
//   4 Your invitation         the words guests read first
//   5 Theme & music           six themes with live swatches, one song
//   More details (folded)     RSVP, reply-by, party size, name order, dress code…
// Published pages also get the owner's RSVP dashboard at the top.

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import type { StudioProps } from "../../../_valentine/editor/studios";
import MusicPicker from "../../../_valentine/editor/MusicPicker";
import { useTemplateAccess } from "@/hooks/useTemplateAccess";
import { MasonryEditor, RsvpDashboard, ThemePicker, WeddingRoot, type WeddingPhoto } from "../../../_wedding";
import { WI_DEMO_EVENTS, WI_LIMITS } from "../../../_valentine/days/wedding-invitation";
import { DATE_RE, eventId, mainEvent, readWi } from "../model";

const UPSELL_SLUG = "wedding-invitation-premium";
const UPSELL = "Want Haldi, Mehendi and Sangeet too? Premium holds all five functions, 20 photos and your love story.";
const PHOTO_UPSELL = "This invitation holds 6 photos. Premium holds 20.";
const TITLE_CHIPS = ["Wedding", "Reception", "Engagement", "Sangeet", "Haldi", "Mehendi", "Nikah", "Church wedding"];
const AI_CHIPS = ["Make it formal", "Make it warm", "Add a Hindi line", "Mention our families", "Keep it short"];
const AI_PLACEHOLDER =
  "Ananya and Arjun are getting married on 12 Feb 2027 at The Leela Palace, Udaipur. Pheras at 7 pm, reception on the 13th in Delhi. Ananya's parents are Rakesh and Neeta Sharma, Arjun's are Vikram and Ritu Mehta. Keep it warm, a little royal.";

function Field({ label, hint, children, htmlFor, count }: { label: ReactNode; hint?: ReactNode; children: ReactNode; htmlFor?: string; count?: ReactNode }) {
  return (
    <div className="vs-field">
      <label className="vs-label" htmlFor={htmlFor}>
        <span>{label}</span>
        {count}
      </label>
      {children}
      {hint && <span className="vs-hint">{hint}</span>}
    </div>
  );
}

function Head({ n, title, sub, done }: { n: number; title: ReactNode; sub?: ReactNode; done?: boolean }) {
  return (
    <header className="vs-secHead">
      <span className={`vs-secN${done ? " is-done" : ""}`} aria-hidden>
        {done ? "✓" : n}
      </span>
      <div style={{ minWidth: 0 }}>
        <h3 className="vs-secH">{title}</h3>
        {sub && <p className="vs-secSub">{sub}</p>}
      </div>
    </header>
  );
}

const Count = ({ n, max }: { n: number; max: number }) => (
  <span className={`vs-count${n >= max * 0.9 ? " is-near" : ""}`} aria-hidden>
    {n}/{max}
  </span>
);

export default function WeddingStudio({ day, mf, updateMf, updateExtra, ai, owner }: StudioProps) {
  const uid = useId().replace(/:/g, "");
  const x = useMemo(() => readWi(mf.extras), [mf.extras]);
  const rawEvents = useMemo(() => (Array.isArray(mf.extras.events) ? (mf.extras.events as Record<string, string>[]) : []), [mf.extras.events]);
  const fill = ai?.fill;
  const [story, setStory] = useState("");
  const [more, setMore] = useState(false);
  const { blocked } = useTemplateAccess();
  const canUpsell = !blocked.has(UPSELL_SLUG);
  const id = (k: string) => `wi-${k}-${uid}`;

  // ── Events (raw rows, so half-typed rows survive until Save tidies them) ──
  const setEvents = (rows: Record<string, string>[]) => updateExtra("events", rows.slice(0, WI_LIMITS.events));
  const patchEvent = (i: number, k: string, v: string) => setEvents(rawEvents.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  const addEvent = () => {
    const taken = rawEvents.map((r) => String(r.id ?? ""));
    const title = rawEvents.some((r) => /reception/i.test(String(r.title))) ? "Engagement" : "Reception";
    setEvents([...rawEvents, { id: eventId(title, taken), title, date: x.date, time: "", endTime: "", venue: "", address: "", mapUrl: "", dressCode: "", dressColor: "", note: "" }]);
  };
  const removeEvent = (i: number) => setEvents(rawEvents.filter((_, j) => j !== i));
  const moveEvent = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= rawEvents.length) return;
    const n = [...rawEvents];
    [n[i], n[j]] = [n[j], n[i]];
    setEvents(n);
  };

  /** The big day also moves the main function's date when that one still followed it. */
  const setBigDay = (date: string) => {
    const main = mainEvent(readWi({ ...mf.extras }).events);
    updateExtra("date", date);
    if (main) {
      const i = rawEvents.findIndex((r) => r.id === main.id);
      if (i >= 0 && (!rawEvents[i].date || rawEvents[i].date === x.date)) patchEvent(i, "date", date);
    }
  };

  // After an AI fill: a function the AI moved to a new venue must not keep the
  // demo's Udaipur note / dress code (the model only writes what the story gives).
  const wasGenerating = useRef(false);
  useEffect(() => {
    const gen = !!fill?.generating;
    if (wasGenerating.current && !gen && fill?.mode === "done") {
      let changed = false;
      const rows = rawEvents.map((r, i) => {
        const d = WI_DEMO_EVENTS[i];
        if (!d || r.venue === d.venue) return r;
        const next = { ...r };
        for (const k of ["note", "dressCode", "mapUrl"] as const) {
          if (next[k] && next[k] === d[k]) {
            next[k] = "";
            changed = true;
          }
        }
        return next;
      });
      if (changed) setEvents(rows);
    }
    wasGenerating.current = gen;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs on the generating → done edge only
  }, [fill?.generating, fill?.mode]);

  const write = () => {
    if (!fill) return;
    fill.generateGuided({ people: { userName: "", partnerName: "", bestFriendName: "", partnerPronouns: "" }, story: story.trim(), hints: { occasion: "wedding invitation" } });
  };

  const letterLen = mf.letter.length;

  return (
    <div className="wi-studio">
      {/* ── Owner: guest replies (published pages) ─────────────────────── */}
      {owner?.published && owner.pageId && owner.token && (
        <details className="wi-dashWrap" open>
          <summary>Guest replies</summary>
          <WeddingRoot theme={x.theme} background={false} chrome={false} className="wi-dashRoot">
            <RsvpDashboard slug={day.slug} pageId={owner.pageId} token={owner.token} csvName={`${mf.recipientName}-${mf.senderName}-rsvps`.toLowerCase()} />
          </WeddingRoot>
        </details>
      )}

      {/* ── AI ──────────────────────────────────────────────────────────── */}
      {fill && fill.schema && (
        <div className="wi-ai">
          <label className="wi-aiH" htmlFor={id("ai")}>
            <span aria-hidden>✨</span> Describe your wedding in a few lines
          </label>
          <p className="wi-aiP">We&apos;ll fill in everything below. You can change any of it.</p>
          <textarea id={id("ai")} className="vs-input vs-area" rows={4} maxLength={2000} value={story} placeholder={AI_PLACEHOLDER} onChange={(e) => setStory(e.target.value)} />
          <div className="vs-suggest" role="group" aria-label="Add to your description">
            {AI_CHIPS.map((c) => (
              <button key={c} type="button" onClick={() => setStory((s) => `${s.trim()}${s.trim() ? " " : ""}${c}.`)}>
                + {c}
              </button>
            ))}
          </div>
          <button type="button" className="wi-aiBtn" onClick={write} disabled={fill.generating || story.trim().length < 20}>
            {fill.generating ? "Writing your invitation…" : "Write my invitation"}
          </button>
          <p className="wi-aiMsg" aria-live="polite">
            {fill.error ? (
              <span className="vs-err">{fill.error === "Nothing new to add — everything it could write, you'd already written." ? fill.error : "That didn't work. Try again, or fill the form yourself."}</span>
            ) : fill.mode === "done" && !fill.generating ? (
              "Done. Read it through and change anything you like."
            ) : story.trim().length > 0 && story.trim().length < 20 ? (
              "A few more words, please."
            ) : null}
          </p>
        </div>
      )}

      {/* ── 1 The couple ──────────────────────────────────────────────── */}
      <section className="vs-sec" id="vs-sec-names" aria-labelledby={id("h1")}>
        <Head n={1} title={<span id={id("h1")}>The couple</span>} sub="Names as you'd like them printed." done={!!mf.recipientName.trim() && !!mf.senderName.trim()} />
        <div className="vs-row2">
          <Field label="Bride's name" htmlFor={id("bride")} count={<Count n={mf.recipientName.length} max={30} />}>
            <input id={id("bride")} className="vs-input" value={mf.recipientName} maxLength={30} placeholder="e.g. Ananya" onChange={(e) => updateMf("recipientName", e.target.value)} autoComplete="off" />
          </Field>
          <Field label="Groom's name" htmlFor={id("groom")} count={<Count n={mf.senderName.length} max={30} />}>
            <input id={id("groom")} className="vs-input" value={mf.senderName} maxLength={30} placeholder="e.g. Arjun" onChange={(e) => updateMf("senderName", e.target.value)} autoComplete="off" />
          </Field>
        </div>
        <div className="vs-row2">
          <Field label="Bride's family" htmlFor={id("bf")} hint="“With the blessings of…”">
            <input id={id("bf")} className="vs-input" value={String(mf.extras.brideFamily ?? "")} maxLength={90} placeholder="e.g. Mrs. & Mr. Rakesh Sharma" onChange={(e) => updateExtra("brideFamily", e.target.value)} />
          </Field>
          <Field label="Groom's family" htmlFor={id("gf")}>
            <input id={id("gf")} className="vs-input" value={String(mf.extras.groomFamily ?? "")} maxLength={90} placeholder="e.g. Mrs. & Mr. Vikram Mehta" onChange={(e) => updateExtra("groomFamily", e.target.value)} />
          </Field>
        </div>
      </section>

      {/* ── 2 Date & functions ───────────────────────────────────────── */}
      <section className="vs-sec" id="vs-sec-details" aria-labelledby={id("h2")}>
        <Head n={2} title={<span id={id("h2")}>The big day</span>} sub="Used for the countdown and the calendar invite." done={!!x.date && x.events.length > 0} />
        <div className="vs-row2">
          <Field label="Date" htmlFor={id("date")}>
            <input id={id("date")} className="vs-input" type="date" value={String(mf.extras.date ?? "")} onChange={(e) => setBigDay(e.target.value)} />
          </Field>
          <Field label="Muhurat / start time" htmlFor={id("time")}>
            <input id={id("time")} className="vs-input" type="time" value={String(mf.extras.time ?? "")} onChange={(e) => updateExtra("time", e.target.value)} />
          </Field>
        </div>

        <h4 className="wi-subH">
          Functions <span>{rawEvents.length}/{WI_LIMITS.events}</span>
        </h4>
        <p className="vs-hint wi-subP">Each one gets its own map and timings.</p>
        <div className="vs-rows">
          {rawEvents.map((r, i) => (
            <div key={i} className="vs-rowCard wi-ev">
              <div className="vs-rowHead">
                <b>{String(r.title || `Function ${i + 1}`)}</b>
                <span className="vs-rowActs">
                  <button type="button" className="vs-iconBtn" onClick={() => moveEvent(i, -1)} disabled={i === 0} aria-label="Move up">↑</button>
                  <button type="button" className="vs-iconBtn" onClick={() => moveEvent(i, 1)} disabled={i === rawEvents.length - 1} aria-label="Move down">↓</button>
                  <button type="button" className="vs-iconBtn" onClick={() => removeEvent(i)} aria-label={`Remove ${r.title || "function"}`}>✕</button>
                </span>
              </div>
              <Field label="Name" htmlFor={id(`et${i}`)}>
                <input id={id(`et${i}`)} className="vs-input" value={String(r.title ?? "")} maxLength={40} placeholder="e.g. Wedding" onChange={(e) => patchEvent(i, "title", e.target.value)} />
                <div className="vs-suggest" role="group" aria-label="Function names">
                  {TITLE_CHIPS.map((t) => (
                    <button key={t} type="button" className={r.title === t ? "is-on" : ""} onClick={() => patchEvent(i, "title", t)}>
                      {t}
                    </button>
                  ))}
                </div>
              </Field>
              <div className="vs-row2">
                <Field label="Date" htmlFor={id(`ed${i}`)}>
                  <input id={id(`ed${i}`)} className="vs-input" type="date" value={String(r.date ?? "")} onChange={(e) => patchEvent(i, "date", e.target.value)} />
                </Field>
                <Field label="Start time" htmlFor={id(`eh${i}`)}>
                  <input id={id(`eh${i}`)} className="vs-input" type="time" value={String(r.time ?? "")} onChange={(e) => patchEvent(i, "time", e.target.value)} />
                </Field>
              </div>
              <Field label="Venue" htmlFor={id(`ev${i}`)}>
                <input id={id(`ev${i}`)} className="vs-input" value={String(r.venue ?? "")} maxLength={80} placeholder="e.g. The Leela Palace, Udaipur" onChange={(e) => patchEvent(i, "venue", e.target.value)} />
              </Field>
              <Field label="Address" htmlFor={id(`ea${i}`)}>
                <input id={id(`ea${i}`)} className="vs-input" value={String(r.address ?? "")} maxLength={140} placeholder="Street, city" onChange={(e) => patchEvent(i, "address", e.target.value)} />
              </Field>
              <Field label="Google Maps link (optional)" htmlFor={id(`em${i}`)} hint="Paste the share link from Google Maps. Empty = we search the venue and address.">
                <input id={id(`em${i}`)} className="vs-input" inputMode="url" value={String(r.mapUrl ?? "")} maxLength={300} placeholder="https://maps.app.goo.gl/…" onChange={(e) => patchEvent(i, "mapUrl", e.target.value.trim())} />
              </Field>
              {more && (
                <>
                  <div className="vs-row2">
                    <Field label="Ends at (optional)" htmlFor={id(`ee${i}`)}>
                      <input id={id(`ee${i}`)} className="vs-input" type="time" value={String(r.endTime ?? "")} onChange={(e) => patchEvent(i, "endTime", e.target.value)} />
                    </Field>
                    <Field label="Dress code (optional)" htmlFor={id(`ex${i}`)}>
                      <input id={id(`ex${i}`)} className="vs-input" value={String(r.dressCode ?? "")} maxLength={60} placeholder="e.g. Shades of yellow" onChange={(e) => patchEvent(i, "dressCode", e.target.value)} />
                    </Field>
                  </div>
                  <Field label="Note (optional)" htmlFor={id(`en${i}`)}>
                    <input id={id(`en${i}`)} className="vs-input" value={String(r.note ?? "")} maxLength={200} placeholder="e.g. Baraat at 7:30 pm sharp" onChange={(e) => patchEvent(i, "note", e.target.value)} />
                  </Field>
                </>
              )}
            </div>
          ))}
        </div>
        {rawEvents.length < WI_LIMITS.events ? (
          <button type="button" className="vs-add" onClick={addEvent}>
            + Add a function <small>({rawEvents.length}/{WI_LIMITS.events})</small>
          </button>
        ) : (
          canUpsell && (
            <a className="wi-upsell" href={`/${UPSELL_SLUG}`}>
              <b>✦ Premium</b> {UPSELL}
            </a>
          )
        )}
      </section>

      {/* ── 3 Photos ─────────────────────────────────────────────────── */}
      <section className="vs-sec" id="vs-sec-photos" aria-labelledby={id("h3")}>
        <Head n={3} title={<span id={id("h3")}>Photos</span>} sub="Any shape works. Tap a photo to resize it or set its focus. Drag to reorder." done={mf.photos.length > 0} />
        <WeddingRoot theme={x.theme} background={false} chrome={false} className="wi-edRoot">
          <MasonryEditor
            photos={mf.photos as WeddingPhoto[]}
            onChange={(p) => updateMf("photos", p.slice(0, WI_LIMITS.photos))}
            max={WI_LIMITS.photos}
            title="Your photos"
            upsell={canUpsell ? PHOTO_UPSELL : undefined}
          />
        </WeddingRoot>
      </section>

      {/* ── 4 Invitation ─────────────────────────────────────────────── */}
      <section className="vs-sec" id="vs-sec-letter" aria-labelledby={id("h4")}>
        <Head n={4} title={<span id={id("h4")}>Your invitation</span>} sub="The words your guests read first." done={mf.letter.trim().length >= day.letterMin} />
        <Field label="The invitation" htmlFor={id("letter")} count={<Count n={letterLen} max={day.letterMax} />} hint="Leave a blank line between paragraphs.">
          <textarea
            id={id("letter")}
            className="vs-input vs-area"
            rows={7}
            value={mf.letter}
            maxLength={day.letterMax}
            placeholder={day.copy.letterPlaceholder}
            onChange={(e) => updateMf("letter", e.target.value.slice(0, day.letterMax))}
          />
        </Field>
      </section>

      {/* ── 5 Theme & music ──────────────────────────────────────────── */}
      <section className="vs-sec" id="vs-sec-look" aria-labelledby={id("h5")}>
        <Head n={5} title={<span id={id("h5")}>Theme &amp; music</span>} sub="Light or dark, always in gold. The song plays after the guest taps the seal." />
        <ThemePicker value={x.theme} onChange={(t) => updateExtra("theme", t)} sample={`${(mf.recipientName || "A").slice(0, 1)} & ${(mf.senderName || "V").slice(0, 1)}`} label="Theme" />
        <div style={{ height: 18 }} />
        <MusicPicker
          value={mf}
          suggestions={day.music?.suggestions}
          suggestionsNote={day.music?.suggestionsNote}
          audioOnly={!!day.music?.audioOnly}
          track={day.music?.track}
          onChange={(p) => {
            if (p.musicMode !== undefined) {
              updateMf("musicMode", p.musicMode);
              updateMf("music", p.musicMode !== "off");
            }
            if (p.musicYoutubeId !== undefined) updateMf("musicYoutubeId", p.musicYoutubeId);
            if (p.musicStart !== undefined) updateMf("musicStart", p.musicStart);
          }}
        />
      </section>

      {/* ── More details ─────────────────────────────────────────────── */}
      <section className="vs-sec wi-more" aria-label="More details">
        <button type="button" className="wi-moreBtn" aria-expanded={more} onClick={() => setMore((m) => !m)}>
          <span>More details</span>
          <small>RSVP, reply-by date, party size, name order, dress codes</small>
          <i aria-hidden>{more ? "−" : "+"}</i>
        </button>
        {more && (
          <div className="wi-moreBody">
            <button type="button" role="switch" aria-checked={x.rsvp} className="vs-switchRow" onClick={() => updateExtra("rsvp", !x.rsvp)}>
              <span className="vs-switchTx">
                <b>Ask guests to RSVP</b>
                <small>Replies come to your email. Guests need no account.</small>
              </span>
              <span className={`vs-switch${x.rsvp ? " is-on" : ""}`} aria-hidden>
                <i />
              </span>
            </button>
            {x.rsvp && (
              <div className="vs-row2">
                <Field label="Reply by (optional)" htmlFor={id("by")}>
                  <input id={id("by")} className="vs-input" type="date" value={String(mf.extras.rsvpBy ?? "")} onChange={(e) => updateExtra("rsvpBy", DATE_RE.test(e.target.value) ? e.target.value : "")} />
                </Field>
                <Field label="Guests per reply" hint="The most one RSVP can bring, the guest included.">
                  <div className="vs-stepper">
                    <button type="button" onClick={() => updateExtra("maxGuests", Math.max(1, x.maxGuests - 1))} disabled={x.maxGuests <= 1} aria-label="Fewer guests">−</button>
                    <output aria-live="polite">
                      <b>{x.maxGuests}</b>
                    </output>
                    <button type="button" onClick={() => updateExtra("maxGuests", Math.min(10, x.maxGuests + 1))} disabled={x.maxGuests >= 10} aria-label="More guests">+</button>
                  </div>
                </Field>
              </div>
            )}
            <Field label="Show names as">
              <div className="vs-enum vs-enum--chips" role="radiogroup" aria-label="Show names as">
                {(["bride", "groom"] as const).map((o) => {
                  const on = x.namesOrder === o;
                  const label = o === "bride" ? `${mf.recipientName || "Bride"} & ${mf.senderName || "Groom"}` : `${mf.senderName || "Groom"} & ${mf.recipientName || "Bride"}`;
                  return (
                    <button key={o} type="button" role="radio" aria-checked={on} className={on ? "is-on" : ""} onClick={() => updateExtra("namesOrder", o)}>
                      {label}
                    </button>
                  );
                })}
              </div>
            </Field>
            <p className="vs-hint">Each function above now also shows an end time, a dress code and a note.</p>
          </div>
        )}
      </section>
      <style>{STUDIO_CSS}</style>
    </div>
  );
}

const STUDIO_CSS = /* css */ `
.wi-studio { display: block; }
.wi-ai { position: relative; margin: 0 0 22px; padding: 16px; border-radius: 20px; border: 1.5px solid var(--vw-edge);
  background: linear-gradient(160deg, #fffaf0, #f7ecd2); box-shadow: 0 14px 30px -22px rgba(90, 64, 20, .45); }
.wi-aiH { display: flex; gap: 8px; align-items: center; margin: 0; font: 700 17px/1.3 var(--font-wk-display, Georgia), Georgia, serif; color: var(--vw-paper-ink); }
.wi-aiP { margin: 4px 0 10px; font-size: 13px; color: var(--vw-ink-soft); }
.wi-ai .vs-area { min-height: 112px; background: #fff; }
.wi-ai .vs-suggest { margin-top: 8px; }
.wi-aiBtn { margin-top: 12px; width: 100%; min-height: 50px; border: 0; border-radius: 14px; cursor: pointer; font: 700 15px/1 inherit; letter-spacing: .02em;
  color: #fffaf0; background: linear-gradient(115deg, #7a561a, #b98f3c 30%, #e6c87c 50%, #9a7228 70%, #6f5419); background-size: 220% 100%;
  box-shadow: 0 10px 22px -12px rgba(90, 60, 10, .7); transition: background-position .6s, transform .15s; }
.wi-aiBtn:hover:not(:disabled) { background-position: 100% 50%; }
.wi-aiBtn:active:not(:disabled) { transform: scale(.98); }
.wi-aiBtn:disabled { opacity: .55; cursor: default; }
.wi-aiMsg { min-height: 18px; margin: 8px 0 0; font-size: 13px; color: var(--vw-ink-soft); }
.wi-subH { display: flex; justify-content: space-between; margin: 14px 0 0; font-size: 15px; color: var(--vw-paper-ink); }
.wi-subH span { font-weight: 600; font-size: 12px; color: var(--vw-ink-soft); }
.wi-subP { display: block; margin: 2px 0 10px; }
.wi-ev .vs-field { margin-bottom: 8px; }
.wi-upsell { display: block; margin-top: 12px; padding: 12px 14px; border-radius: 14px; border: 1.5px dashed var(--vw-accent); color: var(--vw-paper-ink); text-decoration: none; font-size: 13.5px; line-height: 1.45; background: #fffaf0; }
.wi-upsell b { color: var(--vw-accent); margin-right: 4px; }
.wi-edRoot { display: block; border-radius: 18px; }
.wi-edRoot .wk-ed { font-family: var(--wk-font-sans); }
.wi-dashWrap { margin: 0 0 18px; border-radius: 18px; border: 1.5px solid var(--vw-edge); background: #fff; overflow: hidden; }
.wi-dashWrap > summary { cursor: pointer; padding: 14px 16px; font-weight: 700; min-height: 48px; }
.wi-dashRoot { display: block; padding: 0 10px 12px; }
.wi-more { padding-top: 0; }
.wi-moreBtn { width: 100%; display: grid; grid-template-columns: 1fr auto; gap: 2px 10px; align-items: center; text-align: left; padding: 14px 16px; min-height: 56px; border-radius: 16px;
  border: 1.5px solid var(--vw-edge); background: #fff; color: var(--vw-paper-ink); cursor: pointer; font: inherit; }
.wi-moreBtn span { font-weight: 700; font-size: 15px; }
.wi-moreBtn small { grid-column: 1; font-size: 12.5px; color: var(--vw-ink-soft); }
.wi-moreBtn i { grid-row: 1 / span 2; grid-column: 2; font-style: normal; font-size: 22px; color: var(--vw-accent); }
.wi-moreBody { padding-top: 14px; }
`;
