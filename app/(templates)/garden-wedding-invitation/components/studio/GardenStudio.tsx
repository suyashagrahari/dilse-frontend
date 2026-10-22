"use client";

// SCAFFOLD (wedding quartet): this started as a working copy of
// royal-wedding-invitation so the template runs end to end. Rebuild it with
// this template's own art (./assets.ts or ../assets.ts, served from
// public/wedding-v3, never the CDN); light themes only.

// ─── Royal Wedding Invitation — the editor (the whole form) ──────────────────
//
// Short on purpose. On top, "Describe your wedding" (the AI fills names,
// families, five functions with dress codes, the English + Hindi invitation,
// the story and good-to-know). Then: the couple + the big day → functions →
// photos (one pool of 40: the gallery; story chapters and family cards point
// into it) → the invitation → theme & music. Everything else (story,
// family notes/photos, good to know, film, RSVP settings, closing line,
// password) sits behind "More details". Each section carries
// id="vs-sec-<id>" so the sheet's side nav and Save's "jump to the gap" work.

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { MasonryEditor, RsvpDashboard, ThemePicker, WEDDING_THEMES } from "../../../_wedding";
import { LIGHT_THEMES } from "../../../_wedding/themes";
import { compressImage } from "../../../dedication/components/mediaUploads";
import MusicPicker from "../../../_valentine/editor/MusicPicker";
import type { StudioProps } from "../../../_valentine/editor/studios";
import type { LovePhoto } from "../../../_valentine/types";
import { GW_LIMITS, gardenWeddingDay } from "../../../_valentine/days/garden-wedding-invitation";
import { MAIN_RE, swatchFor } from "../gw/model";

const SLUG = "garden-wedding-invitation";
type Row = Record<string, unknown>;
type Chapter = { when: string; title: string; line: string; photo: number };

const DEMO = gardenWeddingDay.demo.extras;

const QUICK_FUNCTIONS: { title: string; dress: string; color: string }[] = [
  { title: "Roka", dress: "Festive pastels", color: "#E86A92" },
  { title: "Tilak", dress: "Traditional", color: "#EE8A2E" },
  { title: "Haldi", dress: "Shades of yellow", color: "#F2C94C" },
  { title: "Mehendi", dress: "Greens and bright florals", color: "#4F9B6A" },
  { title: "Sangeet", dress: "Indo-western glam", color: "#7B3FA0" },
  { title: "Baraat", dress: "Sherwanis and safas", color: "#EE8A2E" },
  { title: "Wedding (Pheras)", dress: "Traditional festive", color: "#A3122B" },
  { title: "Cocktail", dress: "Cocktail chic", color: "#1C1C24" },
  { title: "Reception", dress: "Black tie", color: "#1C1C24" },
];
const SWATCHES = ["#F2C94C", "#4F9B6A", "#E86A92", "#A3122B", "#7B3FA0", "#2E5AAC", "#EE8A2E", "#F3EBDD", "#1C1C24", "#C9A24A"];
const AI_CHIPS = ["Make it formal", "Make it warm", "Add Hindi", "Mention our families", "Keep it short"];

const newId = (taken: Set<string>) => {
  for (;;) {
    const id = `e${Math.random().toString(36).slice(2, 7)}`;
    if (!taken.has(id)) return id;
  }
};
const s = (v: unknown) => (typeof v === "string" ? v : "");
const n = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : 0);
const same = (a: Row | undefined, b: Row | undefined, keys: string[]) => !!a && !!b && keys.every((k) => s(a[k]) === s(b[k]));

/** "7 pm", "7:30PM", "19.30" → "19:30"; anything else unchanged. */
function toHHMM(v: string): string {
  const t = v.trim();
  if (/^\d{2}:\d{2}$/.test(t)) return t;
  const m = t.match(/^(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?$/i);
  if (!m) return t;
  let h = Number(m[1]);
  const mi = Number(m[2] ?? 0);
  const ap = (m[3] ?? "").toLowerCase().replace(/\./g, "");
  if (ap === "pm" && h < 12) h += 12;
  if (ap === "am" && h === 12) h = 0;
  return h < 24 && mi < 60 ? `${String(h).padStart(2, "0")}:${String(mi).padStart(2, "0")}` : t;
}
const plain = (t: string) => t.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").replace(/[ \t]+\n/g, "\n");

function measure(url: string): Promise<{ w: number; h: number } | null> {
  return new Promise((res) => {
    const img = new Image();
    img.onload = () => res({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => res(null);
    img.src = url;
  });
}

function Field({ label, hint, children, htmlFor, count }: { label: string; hint?: ReactNode; children: ReactNode; htmlFor?: string; count?: string }) {
  return (
    <div className="vs-field">
      <label className="vs-label" htmlFor={htmlFor}>
        <span>{label}</span>
        {count && <small className="gws-count">{count}</small>}
      </label>
      {children}
      {hint && <p className="gws-hint">{hint}</p>}
    </div>
  );
}

function Head({ n: num, title, sub }: { n: number | string; title: string; sub?: string }) {
  return (
    <header className="vs-secHead">
      <span className="vs-secN" aria-hidden>
        {num}
      </span>
      <div style={{ minWidth: 0 }}>
        <h3 className="vs-secH">{title}</h3>
        {sub && <p className="vs-secSub">{sub}</p>}
      </div>
    </header>
  );
}

/** A photo from the pool (1-based), "none" (0), or a new upload appended to the pool. */
function PhotoPick({ value, photos, onPick, onUpload, label }: { value: number; photos: LovePhoto[]; onPick: (k: number) => void; onUpload: (f: File) => void; label: string }) {
  const [open, setOpen] = useState(false);
  const cur = value >= 1 && value <= photos.length ? photos[value - 1] : null;
  const file = useRef<HTMLInputElement>(null);
  return (
    <div className="gws-pick">
      <button type="button" className="gws-pick-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        {cur ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cur.url} alt="" />
        ) : (
          <span aria-hidden>＋</span>
        )}
        <span>{cur ? `${label}: photo ${value}` : `${label}: add a photo`}</span>
      </button>
      {open && (
        <div className="gws-pick-strip" role="listbox" aria-label={label}>
          <button type="button" className={`gws-pick-none${value === 0 ? " is-on" : ""}`} onClick={() => { onPick(0); setOpen(false); }}>
            None
          </button>
          <button type="button" className="gws-pick-none" onClick={() => file.current?.click()} disabled={photos.length >= GW_LIMITS.photos}>
            Upload
          </button>
          {photos.map((p, i) => (
            <button key={i} type="button" role="option" aria-selected={value === i + 1} className={`gws-pick-th${value === i + 1 ? " is-on" : ""}`} onClick={() => { onPick(i + 1); setOpen(false); }} aria-label={`Photo ${i + 1}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt="" loading="lazy" />
            </button>
          ))}
          <input
            ref={file}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (f) {
                onUpload(f);
                setOpen(false);
              }
            }}
          />
        </div>
      )}
    </div>
  );
}

export default function GardenStudio({ mf, updateMf, updateExtra, ai, password, owner }: StudioProps) {
  const x = mf.extras as Row;
  const events = useMemo(() => (Array.isArray(x.events) ? (x.events as Row[]) : []), [x.events]);
  const story = useMemo(() => (Array.isArray(x.story) ? (x.story as Chapter[]) : []), [x.story]);
  const things = useMemo(() => (Array.isArray(x.things) ? (x.things as string[]) : []), [x.things]);
  const photos = mf.photos;
  const set = updateExtra;

  // ── Every function keeps a stable id (RSVPs refer to it) ──────────────────
  useEffect(() => {
    const taken = new Set<string>();
    let changed = false;
    const next = events.map((e) => {
      let id = s(e.id).trim();
      if (!id || taken.has(id)) {
        id = newId(taken);
        changed = true;
      }
      taken.add(id);
      return id === e.id ? e : { ...e, id };
    });
    if (changed) set("events", next);
  }, [events, set]);

  // ── AI ─────────────────────────────────────────────────────────────────────
  const fill = ai?.fill;
  const [desc, setDesc] = useState("");
  const [ran, setRan] = useState(false);
  const [tooShort, setTooShort] = useState(false);
  const waiting = useRef(false);
  const latest = useRef(mf);
  useLayoutEffect(() => {
    latest.current = mf;
  });

  const runAi = () => {
    if (!fill || fill.generating) return;
    const text = desc.trim();
    setTooShort(text.length < 20);
    if (text.length < 20) return;
    waiting.current = true;
    setRan(true);
    fill.generateGuided({ people: { userName: "", partnerName: "", bestFriendName: "", partnerPronouns: "" }, story: text });
  };

  // After a fill lands, clear what is still the demo's (another couple's venues, story, contacts).
  useEffect(() => {
    if (!fill || !waiting.current || fill.generating) return;
    waiting.current = false;
    if (fill.error && fill.mode !== "done") return;
    const filled = new Set(fill.filled);
    const touched = (prefix: string) => [...filled].some((p) => p.startsWith(prefix));
    const cur = latest.current.extras as Row;
    const dEvents = DEMO.events as unknown as Row[];
    const evs = (Array.isArray(cur.events) ? (cur.events as Row[]) : []).filter((e, i) => touched(`extras.events[${i}]`) || !same(e, dEvents[i], ["title", "venue", "date"]));
    const dStory = DEMO.story as unknown as Row[];
    const st = (Array.isArray(cur.story) ? (cur.story as Row[]) : [])
      // A moment the AI rewrote keeps none of the demo couple's words it did not write itself.
      .map((c, i) => {
        if (!touched(`extras.story[${i}]`)) return c;
        const d = dStory[i] ?? {};
        const out = { ...c };
        for (const k of ["when", "title", "line"]) if (!filled.has(`extras.story[${i}].${k}`) && s(c[k]) && s(c[k]) === s(d[k])) out[k] = "";
        return out;
      })
      .filter((c, i) => touched(`extras.story[${i}]`) || !same(c, dStory[i], ["title", "line"]));
    if (fill.filled.length) {
      set("events", (evs.length ? evs : (cur.events as Row[])).map((e) => ({ ...e, time: toHHMM(s(e.time)), endTime: toHHMM(s(e.endTime)) })));
      const L = latest.current.letter;
      if (/<[^>]+>/.test(L)) updateMf("letter", plain(L));
      set("story", st);
      if (!touched("extras.things") && JSON.stringify(cur.things) === JSON.stringify(DEMO.things)) set("things", []);
      for (const k of ["blessingsOf", "brideNote", "groomNote", "muhurat", "hashtag", "gettingThere"] as const) {
        if (!touched(`extras.${k}`) && cur[k] === DEMO[k]) set(k, "");
      }
    }
  }, [fill, fill?.generating, fill?.mode, fill?.error, fill?.filled, set, updateMf]);

  const aiNote: { ok: boolean; text: string } | null = tooShort
    ? { ok: false, text: "A line or two more, please: names, the date and where." }
    : !ran || !fill || fill.generating
      ? null
      : fill.error
        ? { ok: false, text: fill.mode === "done" ? fill.error : "That didn't work. Try again, or fill the form yourself." }
        : fill.mode === "done"
          ? { ok: true, text: "Done. Read it through and change anything you like." }
          : null;

  // ── Photos: one pool; story + family cards point into it by 1-based index ─
  const remapRefs = useCallback(
    (prev: LovePhoto[], next: LovePhoto[]) => {
      const where = (k: number) => {
        if (k < 1 || k > prev.length) return 0;
        const p = prev[k - 1];
        let j = next.indexOf(p);
        if (j < 0) j = next.findIndex((q) => q.url === p.url);
        return j < 0 ? 0 : j + 1;
      };
      const cur = latest.current.extras as Row;
      const bp = where(n(cur.bridePhoto));
      const gp = where(n(cur.groomPhoto));
      if (bp !== n(cur.bridePhoto)) set("bridePhoto", bp);
      if (gp !== n(cur.groomPhoto)) set("groomPhoto", gp);
      const st = (Array.isArray(cur.story) ? (cur.story as Chapter[]) : []).map((c) => ({ ...c, photo: where(n(c.photo)) }));
      if (st.some((c, i) => c.photo !== n((cur.story as Chapter[])[i]?.photo))) set("story", st);
    },
    [set],
  );
  const setPhotos = (next: LovePhoto[]) => {
    const prev = latest.current.photos;
    const capped = next.slice(0, GW_LIMITS.photos);
    updateMf("photos", capped);
    remapRefs(prev, capped);
  };
  const uploadTo = async (f: File, apply: (k: number) => void) => {
    try {
      const url = await compressImage(f);
      const size = await measure(url);
      const cur = latest.current.photos;
      if (cur.length >= GW_LIMITS.photos) return;
      const p: LovePhoto = { url, cropX: 50, cropY: 40, ...(size ? { w: size.w, h: size.h } : {}) };
      updateMf("photos", [...cur, p]);
      apply(cur.length + 1);
    } catch {
      /* compressImage explains itself in the photos section; a picker upload just doesn't land */
    }
  };

  // ── Functions ──────────────────────────────────────────────────────────────
  const mainIdx = Math.max(0, events.findIndex((e) => MAIN_RE.test(s(e.title))));
  const setEvent = (i: number, k: string, v: string) => set("events", events.map((e, j) => (j === i ? { ...e, [k]: v } : e)));
  const addEvent = (q?: (typeof QUICK_FUNCTIONS)[number]) => {
    if (events.length >= GW_LIMITS.events) return;
    const taken = new Set(events.map((e) => s(e.id)));
    const last = events[events.length - 1];
    set("events", [
      ...events,
      { id: newId(taken), title: q?.title ?? "", date: s(last?.date), time: "", endTime: "", venue: "", address: "", mapUrl: "", dressCode: q?.dress ?? "", dressColor: q?.color ?? "", note: "" },
    ]);
    setOpenEv(events.length);
  };
  const moveEvent = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= events.length) return;
    const next = [...events];
    [next[i], next[j]] = [next[j], next[i]];
    set("events", next);
    setOpenEv(j);
  };
  const [openEv, setOpenEv] = useState<number | null>(null);

  // ── Owner: guest replies (a saved page; StudioProps.owner) ─────────────────
  const pageId = owner?.pageId ?? null;
  const token = owner?.token ?? null;

  const letter = mf.letter;
  const hindi = s(x.hindiMessage);
  const main = events[mainIdx];

  return (
    <div className="rs">
      <style>{GWS_CSS}</style>

      {pageId && token && (
        <details className="gws-dash">
          <summary>Guest replies &amp; blessings</summary>
          <RsvpDashboard slug={SLUG} pageId={pageId} token={token} csvName="wedding-rsvps" />
        </details>
      )}

      {ai?.available && fill && (
        <section className="gws-ai" aria-labelledby="gws-ai-h">
          <p className="gws-ai-k">✦ AI</p>
          <h3 className="gws-ai-h" id="gws-ai-h">
            Describe your wedding in a few lines
          </h3>
          <p className="gws-ai-p">We&apos;ll fill in everything below. You can change any of it.</p>
          <textarea
            className="vs-input vs-area gws-ai-in"
            rows={4}
            value={desc}
            maxLength={1500}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Ananya and Arjun are getting married on 12 Feb 2027 at The Leela Palace, Udaipur. Haldi and Mehendi on the 10th, Sangeet on the 11th, pheras at 7 pm, reception on the 13th in Delhi. We met at college in Pune in 2018. Keep it warm, a little royal, and add a Hindi line."
            aria-label="Describe your wedding"
          />
          <div className="gws-chips">
            {AI_CHIPS.map((c) => (
              <button key={c} type="button" className="gws-chip" onClick={() => setDesc((d) => (d.trim() ? `${d.trim()} ${c}.` : `${c}.`))}>
                + {c}
              </button>
            ))}
          </div>
          <button type="button" className="gws-ai-go" onClick={runAi} disabled={fill.generating}>
            {fill.generating ? "Writing your invitation…" : "Write my invitation"}
          </button>
          {aiNote && (
            <p className={`gws-ai-note${aiNote.ok ? " is-ok" : ""}`} role="status">
              {aiNote.text}
            </p>
          )}
        </section>
      )}

      {/* ── The couple ─────────────────────────────────────────────────── */}
      <section className="vs-sec" id="vs-sec-names" aria-label="The couple">
        <Head n={1} title="The couple" sub="Names as you'd like them printed." />
        <div className="vs-row2">
          <Field label="Bride's name" htmlFor="gws-bride">
            <input id="gws-bride" className="vs-input" value={mf.recipientName} maxLength={30} placeholder="e.g. Ananya" onChange={(e) => updateMf("recipientName", e.target.value)} />
          </Field>
          <Field label="Groom's name" htmlFor="gws-groom">
            <input id="gws-groom" className="vs-input" value={mf.senderName} maxLength={30} placeholder="e.g. Arjun" onChange={(e) => updateMf("senderName", e.target.value)} />
          </Field>
        </div>
        <div className="gws-seg" role="radiogroup" aria-label="Show names as">
          {(["bride", "groom"] as const).map((o) => {
            const a = o === "bride" ? mf.recipientName || "Bride" : mf.senderName || "Groom";
            const b = o === "bride" ? mf.senderName || "Groom" : mf.recipientName || "Bride";
            return (
              <button key={o} type="button" role="radio" aria-checked={(x.nameOrder ?? "bride") === o} onClick={() => set("nameOrder", o)}>
                {a} &amp; {b}
              </button>
            );
          })}
        </div>
        <div className="vs-row2">
          <Field label="Bride's family" htmlFor="gws-bf" hint="“With the blessings of…”">
            <input id="gws-bf" className="vs-input" value={s(x.brideFamily)} maxLength={120} placeholder="e.g. Mrs. & Mr. Rakesh Sharma" onChange={(e) => set("brideFamily", e.target.value)} />
          </Field>
          <Field label="Groom's family" htmlFor="gws-gf">
            <input id="gws-gf" className="vs-input" value={s(x.groomFamily)} maxLength={120} placeholder="e.g. Mrs. & Mr. Vikram Mehta" onChange={(e) => set("groomFamily", e.target.value)} />
          </Field>
        </div>
        {main && (
          <>
            <p className="gws-sub">The big day · used for the countdown and the calendar invites ({s(main.title) || "the wedding"})</p>
            <div className="gws-row3">
              <Field label="Date" htmlFor="gws-date">
                <input id="gws-date" type="date" className="vs-input" value={s(main.date)} onChange={(e) => setEvent(mainIdx, "date", e.target.value)} />
              </Field>
              <Field label="Time" htmlFor="gws-time">
                <input id="gws-time" type="time" className="vs-input" value={s(main.time)} onChange={(e) => setEvent(mainIdx, "time", e.target.value)} />
              </Field>
              <Field label="Muhurat (optional)" htmlFor="gws-muh">
                <input id="gws-muh" className="vs-input" value={s(x.muhurat)} maxLength={60} placeholder="e.g. Shubh muhurat 9:15 pm" onChange={(e) => set("muhurat", e.target.value)} />
              </Field>
            </div>
          </>
        )}
      </section>

      {/* ── Functions ──────────────────────────────────────────────────── */}
      <section className="vs-sec" id="vs-sec-details" aria-label="Functions">
        <Head n={2} title="Functions" sub={`Add, remove or reorder (up to ${GW_LIMITS.events}). Each one gets its own map, timings, dress code and calendar button.`} />
        <ol className="gws-evs">
          {events.map((e, i) => {
            const isOpen = openEv === i;
            const sw = swatchFor({ dressCode: s(e.dressCode), dressColor: s(e.dressColor) });
            return (
              <li key={s(e.id) || i} className={`gws-ev${isOpen ? " is-open" : ""}`}>
                <button type="button" className="gws-ev-head" onClick={() => setOpenEv(isOpen ? null : i)} aria-expanded={isOpen}>
                  <span className="gws-ev-sw" style={{ background: sw || "transparent" }} aria-hidden />
                  <span className="gws-ev-t">
                    <b>{s(e.title) || "New function"}</b>
                    <small>{[s(e.date), s(e.time), s(e.venue)].filter(Boolean).join(" · ") || "Tap to fill in"}</small>
                  </span>
                  <span className="gws-ev-chev" aria-hidden>
                    {isOpen ? "–" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <div className="gws-ev-body">
                      <Field label="Name" htmlFor={`gws-e${i}-t`}>
                        <input id={`gws-e${i}-t`} className="vs-input" value={s(e.title)} maxLength={40} placeholder="e.g. Sangeet" onChange={(ev) => setEvent(i, "title", ev.target.value)} />
                      </Field>
                      <div className="gws-row3 gws-row3-tight">
                        <Field label="Date" htmlFor={`gws-e${i}-d`}>
                          <input id={`gws-e${i}-d`} type="date" className="vs-input" value={s(e.date)} onChange={(ev) => setEvent(i, "date", ev.target.value)} />
                        </Field>
                        <Field label="Starts" htmlFor={`gws-e${i}-s`}>
                          <input id={`gws-e${i}-s`} type="time" className="vs-input" value={s(e.time)} onChange={(ev) => setEvent(i, "time", ev.target.value)} />
                        </Field>
                        <Field label="Ends" htmlFor={`gws-e${i}-e`}>
                          <input id={`gws-e${i}-e`} type="time" className="vs-input" value={s(e.endTime)} onChange={(ev) => setEvent(i, "endTime", ev.target.value)} />
                        </Field>
                      </div>
                    <div className="vs-row2">
                      <Field label="Venue" htmlFor={`gws-e${i}-v`}>
                        <input id={`gws-e${i}-v`} className="vs-input" value={s(e.venue)} maxLength={80} placeholder="e.g. The Leela Palace, Udaipur" onChange={(ev) => setEvent(i, "venue", ev.target.value)} />
                      </Field>
                      <Field label="Address" htmlFor={`gws-e${i}-a`}>
                        <input id={`gws-e${i}-a`} className="vs-input" value={s(e.address)} maxLength={140} placeholder="Street, city" onChange={(ev) => setEvent(i, "address", ev.target.value)} />
                      </Field>
                    </div>
                    <Field label="Google Maps link (optional)" htmlFor={`gws-e${i}-m`} hint="Paste the share link from Google Maps. Empty: we search the venue and address.">
                      <input id={`gws-e${i}-m`} className="vs-input" inputMode="url" value={s(e.mapUrl)} maxLength={400} placeholder="https://maps.app.goo.gl/…" onChange={(ev) => setEvent(i, "mapUrl", ev.target.value.trim())} />
                    </Field>
                    <Field label="Dress code" htmlFor={`gws-e${i}-dc`}>
                      <input id={`gws-e${i}-dc`} className="vs-input" value={s(e.dressCode)} maxLength={60} placeholder="e.g. Shades of yellow" onChange={(ev) => setEvent(i, "dressCode", ev.target.value)} />
                    </Field>
                    <div className="gws-sws" role="radiogroup" aria-label="Dress-code colour">
                      {SWATCHES.map((c) => (
                        <button key={c} type="button" role="radio" aria-checked={s(e.dressColor).toLowerCase() === c.toLowerCase()} aria-label={c} className="gws-sw" style={{ background: c }} onClick={() => setEvent(i, "dressColor", c)} />
                      ))}
                      <label className="gws-sw gws-sw-custom" aria-label="Custom colour">
                        <input type="color" value={/^#[0-9a-f]{6}$/i.test(s(e.dressColor)) ? s(e.dressColor) : "#c9a24a"} onChange={(ev) => setEvent(i, "dressColor", ev.target.value)} />
                      </label>
                    </div>
                    <Field label="A line for guests (optional)" htmlFor={`gws-e${i}-n`}>
                      <textarea id={`gws-e${i}-n`} className="vs-input vs-area" rows={2} value={s(e.note)} maxLength={200} placeholder="e.g. The baraat leaves the hotel at 7 pm sharp." onChange={(ev) => setEvent(i, "note", ev.target.value)} />
                    </Field>
                    <div className="gws-ev-tools">
                      <button type="button" onClick={() => moveEvent(i, -1)} disabled={i === 0}>
                        ↑ Earlier
                      </button>
                      <button type="button" onClick={() => moveEvent(i, 1)} disabled={i === events.length - 1}>
                        ↓ Later
                      </button>
                      <button type="button" className="is-danger" disabled={events.length <= 1} onClick={() => { set("events", events.filter((_, j) => j !== i)); setOpenEv(null); }}>
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
        {events.length < GW_LIMITS.events ? (
          <div className="gws-quick">
            <span>Add:</span>
            {QUICK_FUNCTIONS.filter((q) => !events.some((e) => s(e.title).toLowerCase() === q.title.toLowerCase())).map((q) => (
              <button key={q.title} type="button" className="gws-chip" onClick={() => addEvent(q)}>
                + {q.title}
              </button>
            ))}
            <button type="button" className="gws-chip" onClick={() => addEvent()}>
              + Other
            </button>
          </div>
        ) : (
          <p className="gws-hint">All {GW_LIMITS.events} functions are in. Remove one to add another.</p>
        )}
      </section>

      {/* ── Photos ─────────────────────────────────────────────────────── */}
      <section className="vs-sec" id="vs-sec-photos" aria-label="Photos">
        <Head n={3} title="Photos" sub={`Up to ${GW_LIMITS.photos}. Any shape works. Tap a photo to resize it or set its focus. Drag to reorder. Photos you use in your story or on a family card don't repeat in the gallery.`} />
        <MasonryEditor photos={photos} onChange={setPhotos} max={GW_LIMITS.photos} mask="arch" />
      </section>

      {/* ── The invitation ─────────────────────────────────────────────── */}
      <section className="vs-sec" id="vs-sec-letter" aria-label="Your invitation">
        <Head n={4} title="Your invitation" sub="The words your guests read first, in English and Hindi side by side." />
        <div className="vs-row2">
          <Field label="In English" htmlFor="gws-letter" count={`${letter.length}/1500`}>
            <textarea id="gws-letter" className="vs-input vs-area gws-letter" rows={8} value={letter} maxLength={1500} placeholder={gardenWeddingDay.copy.letterPlaceholder} onChange={(e) => updateMf("letter", e.target.value)} />
          </Field>
          <Field label="हिन्दी में (optional)" htmlFor="gws-hindi" count={`${hindi.length}/700`}>
            <textarea id="gws-hindi" lang="hi" className="vs-input vs-area gws-letter" rows={8} value={hindi} maxLength={700} placeholder="सर्वशक्तिमान की कृपा और बड़ों के आशीर्वाद से…" onChange={(e) => set("hindiMessage", e.target.value)} />
          </Field>
        </div>
      </section>

      {/* ── Theme & music ──────────────────────────────────────────────── */}
      <section className="vs-sec" id="vs-sec-music" aria-label="Theme and music">
        <Head n={5} title="Theme & music" sub="Light or dark, always in gold. The music plays after the guest taps the gates." />
        <ThemePicker themes={LIGHT_THEMES} grouped={false} value={s(x.theme) || "blush"} onChange={(id) => set("theme", id)} sample={`${(mf.recipientName || "A").slice(0, 1)} & ${(mf.senderName || "V").slice(0, 1)}`} label="Theme" />
        <p className="gws-hint" style={{ marginTop: 8 }}>
          {WEDDING_THEMES[(s(x.theme) || "blush") as keyof typeof WEDDING_THEMES]?.blurb}
        </p>
        <div style={{ marginTop: 18 }}>
          <MusicPicker
            value={mf}
            suggestions={gardenWeddingDay.music?.suggestions}
            suggestionsNote={gardenWeddingDay.music?.suggestionsNote}
            audioOnly
            onChange={(p) => {
              if (p.musicMode !== undefined) {
                updateMf("musicMode", p.musicMode);
                updateMf("music", p.musicMode !== "off");
              }
              if (p.musicYoutubeId !== undefined) updateMf("musicYoutubeId", p.musicYoutubeId);
              if (p.musicStart !== undefined) updateMf("musicStart", p.musicStart);
            }}
          />
        </div>
      </section>

      {/* ── More details ───────────────────────────────────────────────── */}
      <section className="vs-sec" id="vs-sec-finish" aria-label="More details">
        <details className="gws-more">
          <summary>
            <Head n="✦" title="More details" sub="Your story, family photos, good to know, a film, RSVP settings, the closing line and a password." />
          </summary>

          <h4 className="gws-h4">Our story</h4>
          <p className="gws-hint">A few moments: how you met, the proposal, the yes. Up to {GW_LIMITS.story}, each with a photo.</p>
          <ol className="gws-story">
            {story.map((c, i) => (
              <li key={i} className="gws-ch">
                <div className="gws-row3 gws-row3-story">
                  <Field label="When" htmlFor={`gws-s${i}-w`}>
                    <input id={`gws-s${i}-w`} className="vs-input" value={c.when} maxLength={24} placeholder="2019" onChange={(e) => set("story", story.map((q, j) => (j === i ? { ...q, when: e.target.value } : q)))} />
                  </Field>
                  <Field label="Title" htmlFor={`gws-s${i}-t`}>
                    <input id={`gws-s${i}-t`} className="vs-input" value={c.title} maxLength={60} placeholder="How we met" onChange={(e) => set("story", story.map((q, j) => (j === i ? { ...q, title: e.target.value } : q)))} />
                  </Field>
                </div>
                <Field label="What happened" htmlFor={`gws-s${i}-l`}>
                  <textarea id={`gws-s${i}-l`} className="vs-input vs-area" rows={2} value={c.line} maxLength={240} onChange={(e) => set("story", story.map((q, j) => (j === i ? { ...q, line: e.target.value } : q)))} />
                </Field>
                <div className="gws-ch-tools">
                  <PhotoPick
                    label="Chapter photo"
                    value={n(c.photo)}
                    photos={photos}
                    onPick={(k) => set("story", story.map((q, j) => (j === i ? { ...q, photo: k } : q)))}
                    onUpload={(f) => void uploadTo(f, (k) => set("story", (latest.current.extras.story as Chapter[]).map((q, j) => (j === i ? { ...q, photo: k } : q))))}
                  />
                  <button type="button" className="gws-x" onClick={() => set("story", story.filter((_, j) => j !== i))}>
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ol>
          {story.length < GW_LIMITS.story && (
            <button type="button" className="gws-chip" onClick={() => set("story", [...story, { when: "", title: "", line: "", photo: 0 }])}>
              + Add a chapter
            </button>
          )}

          <h4 className="gws-h4">Families</h4>
          <Field label="With the blessings of (grandparents, optional)" htmlFor="gws-bo">
            <input id="gws-bo" className="vs-input" value={s(x.blessingsOf)} maxLength={160} placeholder="e.g. Smt. Kamla Devi & Late Shri Ram Prasad Sharma" onChange={(e) => set("blessingsOf", e.target.value)} />
          </Field>
          <div className="vs-row2">
            <div>
              <Field label="Under the bride's family" htmlFor="gws-bn">
                <input id="gws-bn" className="vs-input" value={s(x.brideNote)} maxLength={100} placeholder="e.g. Udaipur" onChange={(e) => set("brideNote", e.target.value)} />
              </Field>
              <PhotoPick label="Bride's family photo" value={n(x.bridePhoto)} photos={photos} onPick={(k) => set("bridePhoto", k)} onUpload={(f) => void uploadTo(f, (k) => set("bridePhoto", k))} />
            </div>
            <div>
              <Field label="Under the groom's family" htmlFor="gws-gn">
                <input id="gws-gn" className="vs-input" value={s(x.groomNote)} maxLength={100} placeholder="e.g. Jaipur" onChange={(e) => set("groomNote", e.target.value)} />
              </Field>
              <PhotoPick label="Groom's family photo" value={n(x.groomPhoto)} photos={photos} onPick={(k) => set("groomPhoto", k)} onUpload={(f) => void uploadTo(f, (k) => set("groomPhoto", k))} />
            </div>
          </div>

          <h4 className="gws-h4">Good to know</h4>
          <p className="gws-hint">Dress code, parking, where to stay, who to call. Start a line with a heading and a colon: “Stay: …”.</p>
          {Array.from({ length: GW_LIMITS.faq }, (_, i) => (
            <input
              key={i}
              className="vs-input gws-thing"
              aria-label={`Good to know ${i + 1}`}
              value={things[i] ?? ""}
              maxLength={180}
              placeholder={["Stay: Rooms are held at …", "Parking: Valet at the main gate", "Weather: Evenings get cool, bring a shawl", "Contact: Call Kabir on …", "Kids: Little ones are welcome", "Gifts: Your blessings are enough"][i]}
              onChange={(e) => {
                const next = Array.from({ length: GW_LIMITS.faq }, (_, j) => (j === i ? e.target.value : things[j] ?? ""));
                set("things", next);
              }}
            />
          ))}
          <Field label="Getting there" htmlFor="gws-gt">
            <textarea id="gws-gt" className="vs-input vs-area" rows={3} value={s(x.gettingThere)} maxLength={500} placeholder="Airport, station, shuttles, who meets guests…" onChange={(e) => set("gettingThere", e.target.value)} />
          </Field>

          <h4 className="gws-h4">Extras</h4>
          <div className="vs-row2">
            <Field label="Pre-wedding film (YouTube link)" htmlFor="gws-vid">
              <input id="gws-vid" className="vs-input" inputMode="url" value={s(x.videoUrl)} maxLength={200} placeholder="https://youtu.be/…" onChange={(e) => set("videoUrl", e.target.value.trim())} />
            </Field>
            <Field label="Wedding hashtag" htmlFor="gws-tag">
              <input id="gws-tag" className="vs-input" value={s(x.hashtag)} maxLength={40} placeholder="#AnanyaWedsArjun" onChange={(e) => set("hashtag", e.target.value)} />
            </Field>
          </div>

          <h4 className="gws-h4">RSVP</h4>
          <p className="gws-hint">Replies come to your email, with a running total.</p>
          <div className="gws-row3">
            <Field label="Reply by" htmlFor="gws-by">
              <input id="gws-by" type="date" className="vs-input" value={s(x.rsvpBy)} onChange={(e) => set("rsvpBy", e.target.value)} />
            </Field>
            <Field label="Max guests per reply" htmlFor="gws-max">
              <input id="gws-max" type="number" min={1} max={10} className="vs-input" value={n(x.maxGuests) || 4} onChange={(e) => set("maxGuests", Math.min(10, Math.max(1, Math.round(Number(e.target.value) || 1))))} />
            </Field>
          </div>
          <label className="gws-tog">
            <input type="checkbox" checked={x.rsvpMeal !== false} onChange={(e) => set("rsvpMeal", e.target.checked)} /> Ask for a meal preference (veg / non-veg / Jain)
          </label>
          <label className="gws-tog">
            <input type="checkbox" checked={x.blessings !== false} onChange={(e) => set("blessings", e.target.checked)} /> Show the blessings wall
          </label>
          <label className="gws-tog">
            <input type="checkbox" checked={x.invocation !== false} onChange={(e) => set("invocation", e.target.checked)} /> Open with Shri Ganesh (off = the royal crest)
          </label>
          <label className="gws-tog">
            <input type="checkbox" checked={x.lang === "hi"} onChange={(e) => set("lang", e.target.checked ? "hi" : "en")} /> Open the invitation in Hindi (guests can switch)
          </label>

          <h4 className="gws-h4">The finish</h4>
          <Field label="Closing line" htmlFor="gws-end" hint="Under the Shubh Vivah seal at the very end.">
            <input id="gws-end" className="vs-input" value={mf.endLine} maxLength={90} placeholder="With love, the Sharma & Mehta families" onChange={(e) => updateMf("endLine", e.target.value)} />
          </Field>
          {password && (
            <Field label="Password (optional)" htmlFor="gws-pw" hint="Guests type it to open the invitation. Leave empty for no lock.">
              <input id="gws-pw" className="vs-input" value={password.value} maxLength={128} placeholder="e.g. the bride's nickname" autoComplete="off" onChange={(e) => password.set(e.target.value)} />
            </Field>
          )}
        </details>
      </section>
    </div>
  );
}

const GWS_CSS = `
.rs { --gws-gold: #b8892e; }
.gws-hint { margin: 2px 0 10px; font-size: 13px; line-height: 1.45; opacity: .72; }
.gws-count { font-weight: 500; opacity: .6; }
.gws-sub { margin: 4px 0 10px; font-size: 13px; font-weight: 700; color: var(--vw-accent); }
.gws-row3 { display: grid; gap: 0 10px; grid-template-columns: 1fr 1fr; }
.gws-row3 > :last-child:nth-child(3) { grid-column: 1 / -1; }
@media (min-width: 560px) { .gws-row3 { grid-template-columns: 1fr 1fr 1.4fr; } .gws-row3 > :last-child:nth-child(3) { grid-column: auto; } .gws-row3-tight { grid-template-columns: 1.3fr 1fr 1fr; } .gws-row3-story { grid-template-columns: 1fr 3fr; } }
.gws-ai { position: relative; margin: 6px 0 4px; padding: 18px; border-radius: 20px; background: linear-gradient(140deg, #3a0913, #5e1424 60%, #7a1f2b); color: #fbecd4; box-shadow: 0 18px 40px -24px rgba(58,9,19,.7); }
.gws-ai::before { content: ""; position: absolute; inset: 0; border-radius: inherit; padding: 1px; background: linear-gradient(110deg,#8a6a1f,#e9cf7a 35%,#fff3c4 50%,#c9a43f 65%,#7a5a14); -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; }
.gws-ai-k { margin: 0; font: 700 11px/1 var(--vw-font-ui); letter-spacing: .24em; color: #e9cf7a; }
.gws-ai-h { margin: 8px 0 4px; font: 600 21px/1.2 var(--vw-font-serif); }
.gws-ai-p { margin: 0 0 12px; font-size: 13.5px; opacity: .85; }
.gws-ai-in { background: rgba(255,248,235,.97) !important; min-height: 116px; font-size: 15px !important; line-height: 1.5 !important; }
.gws-ai .gws-chip { background: rgba(255,236,214,.1); color: #fbecd4; border-color: rgba(233,207,122,.35); }
.gws-ai-go { margin-top: 12px; width: 100%; min-height: 50px; border: 0; border-radius: 999px; cursor: pointer; font: 700 15.5px/1 var(--vw-font-ui); color: #3a0913; background: linear-gradient(110deg,#c9a43f,#e9cf7a 40%,#fff3c4 55%,#d9b05c); box-shadow: 0 10px 24px -12px rgba(233,207,122,.8); }
.gws-ai-go:disabled { opacity: .75; cursor: progress; }
.gws-ai-note { margin: 10px 0 0; font-size: 13.5px; color: #ffcfc4; }
.gws-ai-note.is-ok { color: #e9cf7a; }
.gws-chips, .gws-quick { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; align-items: center; }
.gws-quick > span { font-size: 12px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; opacity: .6; }
.gws-chip { min-height: 38px; padding: 0 14px; border-radius: 999px; border: 1.5px solid var(--vw-edge); background: var(--vw-paper); color: var(--vw-paper-ink); font: 600 13px/1 var(--vw-font-ui); cursor: pointer; }
.gws-chip:hover { border-color: var(--vw-accent); }
.gws-seg { display: flex; gap: 6px; padding: 4px; margin: 0 0 18px; border-radius: 999px; background: var(--vw-soft); width: fit-content; max-width: 100%; }
.gws-seg button { min-height: 40px; padding: 0 14px; border: 0; border-radius: 999px; background: none; font: 600 13.5px/1 var(--vw-font-ui); color: var(--vw-paper-ink); cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 44vw; }
.gws-seg button[aria-checked=true] { background: var(--vw-accent); color: var(--vw-accent-ink); }
.gws-evs { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
.gws-ev { border: 1.5px solid var(--vw-edge); border-radius: 16px; background: var(--vw-paper); overflow: hidden; }
.gws-ev.is-open { border-color: var(--gws-gold); box-shadow: 0 12px 30px -22px rgba(58,9,19,.5); }
.gws-ev-head { display: flex; align-items: center; gap: 12px; width: 100%; min-height: 60px; padding: 10px 14px; border: 0; background: none; text-align: left; cursor: pointer; color: var(--vw-paper-ink); }
.gws-ev-sw { flex: none; width: 22px; height: 22px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 0 1.5px var(--gws-gold); }
.gws-ev-t { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.gws-ev-t b { font: 600 17px/1.2 var(--vw-font-serif); }
.gws-ev-t small { font-size: 12.5px; opacity: .65; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.gws-ev-chev { font-size: 22px; line-height: 1; color: var(--vw-accent); width: 24px; text-align: center; }
.gws-ev-body { padding: 4px 14px 14px; border-top: 1px dashed var(--vw-edge); }
.gws-ev-tools, .gws-ch-tools { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.gws-ev-tools button, .gws-x { min-height: 40px; padding: 0 14px; border-radius: 999px; border: 1.5px solid var(--vw-edge); background: none; font: 600 13px/1 var(--vw-font-ui); color: var(--vw-paper-ink); cursor: pointer; }
.gws-ev-tools button:disabled { opacity: .35; cursor: default; }
.gws-ev-tools .is-danger, .gws-x { color: #b3261e; }
.gws-sws { display: flex; flex-wrap: wrap; gap: 8px; margin: -8px 0 16px; }
.gws-sw { position: relative; width: 34px; height: 34px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 0 1.5px var(--vw-edge); cursor: pointer; padding: 0; }
.gws-sw[aria-checked=true] { box-shadow: 0 0 0 2.5px var(--vw-accent); }
.gws-sw-custom { background: conic-gradient(#f2c94c, #4f9b6a, #2e5aac, #7b3fa0, #e86a92, #a3122b, #f2c94c); overflow: hidden; }
.gws-sw-custom input { position: absolute; inset: 0; opacity: 0; width: 100%; height: 100%; cursor: pointer; }
.gws-letter { min-height: 200px; font-family: var(--vw-font-serif); font-size: 16px; line-height: 1.6; }
.gws-more > summary { list-style: none; cursor: pointer; }
.gws-more > summary::-webkit-details-marker { display: none; }
.gws-more > summary .vs-secH::after { content: " ▾"; color: var(--vw-accent); }
.gws-more[open] > summary .vs-secH::after { content: " ▴"; }
.gws-h4 { margin: 22px 0 6px; font: 700 12px/1 var(--vw-font-ui); letter-spacing: .14em; text-transform: uppercase; color: var(--vw-accent); }
.gws-story { list-style: none; margin: 0 0 10px; padding: 0; display: grid; gap: 12px; }
.gws-ch { padding: 12px; border: 1.5px solid var(--vw-edge); border-radius: 16px; background: var(--vw-paper); }
.gws-thing { margin-bottom: 8px; }
.gws-tog { display: flex; gap: 10px; align-items: center; min-height: 44px; font-size: 14.5px; cursor: pointer; }
.gws-tog input { width: 20px; height: 20px; accent-color: var(--vw-accent); }
.gws-pick { margin: 0 0 14px; }
.gws-pick-btn { display: inline-flex; align-items: center; gap: 10px; min-height: 48px; padding: 4px 14px 4px 4px; border-radius: 999px; border: 1.5px dashed var(--vw-edge); background: var(--vw-paper); color: var(--vw-paper-ink); font: 600 13px/1.2 var(--vw-font-ui); cursor: pointer; }
.gws-pick-btn img, .gws-pick-btn > span:first-child { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; display: grid; place-items: center; background: var(--vw-soft); font-size: 18px; }
.gws-pick-strip { display: flex; gap: 8px; overflow-x: auto; padding: 10px 2px 6px; scroll-snap-type: x proximity; }
.gws-pick-th, .gws-pick-none { flex: none; width: 64px; height: 64px; border-radius: 12px; border: 2px solid transparent; padding: 0; overflow: hidden; background: var(--vw-soft); cursor: pointer; scroll-snap-align: start; font: 600 12px/1 var(--vw-font-ui); color: var(--vw-paper-ink); }
.gws-pick-th img { width: 100%; height: 100%; object-fit: cover; display: block; }
.gws-pick-th.is-on, .gws-pick-none.is-on { border-color: var(--vw-accent); }
.gws-dash { margin: 4px 0 12px; border: 1.5px solid var(--vw-edge); border-radius: 16px; padding: 0 14px; background: var(--vw-paper); }
.gws-dash > summary { min-height: 52px; display: flex; align-items: center; font: 700 15px/1 var(--vw-font-ui); cursor: pointer; color: var(--vw-accent); }
`;
