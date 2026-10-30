"use client";

// ─── Faith weddings (Anand Karaj · Nikah · Holy Matrimony) — the editor ─────
//
// One studio for the three faith weddings (forked from Pampas & Peony); the
// faith comes from day.slug. A stationery-suite studio in light ivory and
// gold. On top, "Describe your wedding" (the AI fills names, families, the
// functions with dress codes, the English invitation + Punjabi / Urdu, the
// story and one contact person). Then seven steps:
// the couple (+ the portrait in its arched window, framed with PhotoCropper) →
// functions → photos (one pool of 40: the gallery; story chapters, family
// cards and the portrait point into it; MasonryEditor sizes / crops / zooms
// each) → the invitation → theme & music → guests & sharing (who to call,
// a gift by UPI, live stream, personal ?to= links) → more details (story,
// families, good to know, film, RSVP settings, closing line, password).
// Each section carries id="vs-sec-<id>" so the sheet's side nav and Save's
// "jump to the gap" work.

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { MasonryEditor, RsvpDashboard, ThemePicker, WEDDING_ART_CDN, WEDDING_THEMES } from "../../_wedding";
import { LIGHT_THEMES } from "../../_wedding/themes";
import { compressImage } from "../../dedication/components/mediaUploads";
import MusicPicker from "../../_valentine/editor/MusicPicker";
import PhotoCropper, { clampCrop, type Crop } from "../../_valentine/editor/PhotoCropper";
import type { StudioProps } from "../../_valentine/editor/studios";
import type { LovePhoto } from "../../_valentine/types";
import { API_URL } from "@/lib/config";
import { fwLocalUrl, fwStoredUrl } from "../../_valentine/days/floral-wedding-invitation";
import { FAITH_CONTACTS_MAX as FW_CONTACTS_MAX, FAITH_LIMITS as FW_LIMITS, UPI_RE, phoneOf, swatchFor } from "../model";
import { cleanGuestName, copyText, personalLink, waLink } from "../guest";
import { faithFor } from "../faiths";

type Row = Record<string, unknown>;
type Chapter = { when: string; title: string; line: string; photo: number };
type Contact = { name: string; relation: string; phone: string };

const SWATCHES = ["#F2C94C", "#9DB89A", "#E7A3AE", "#C9A0B4", "#F1E6D6", "#EE9A5E", "#A3122B", "#6F8FC2", "#2A2622", "#C9A24A"];

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
        {count && <small className="fws-count">{count}</small>}
      </label>
      {children}
      {hint && <p className="fws-hint">{hint}</p>}
    </div>
  );
}

function Head({ n: num, title, sub, icon }: { n: number | string; title: string; sub?: string; icon?: string }) {
  return (
    <header className="vs-secHead fws-head">
      <span className="vs-secN fws-secN" aria-hidden>
        {icon ? <span className="fws-secI">{icon}</span> : num}
        {icon && <small>{num}</small>}
      </span>
      <div style={{ minWidth: 0 }}>
        <h3 className="vs-secH">{title}</h3>
        {sub && <p className="vs-secSub">{sub}</p>}
      </div>
    </header>
  );
}

/**
 * A photo from the pool (1-based), "none" (0), or a new upload appended to the
 * pool — and "Frame" opens PhotoCropper on it (drag to set the focus, pinch /
 * slider to zoom) in the exact shape the guest page shows it (`aspect`).
 */
function PhotoPick({ value, photos, onPick, onUpload, onCrop, label, aspect }: { value: number; photos: LovePhoto[]; onPick: (k: number) => void; onUpload: (f: File) => void; onCrop?: (k: number, c: Crop) => void; label: string; aspect?: number }) {
  const [open, setOpen] = useState(false);
  const [framing, setFraming] = useState(false);
  const cur = value >= 1 && value <= photos.length ? photos[value - 1] : null;
  const file = useRef<HTMLInputElement>(null);
  return (
    <div className="fws-pick">
      <div className="fws-pick-row">
        <button type="button" className="fws-pick-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          {cur ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cur.url} alt="" style={{ objectPosition: `${cur.cropX ?? 50}% ${cur.cropY ?? 50}%` }} />
          ) : (
            <span aria-hidden>＋</span>
          )}
          <span>{cur ? `${label}: photo ${value}` : `${label}: add a photo`}</span>
        </button>
        {cur && onCrop && aspect && (
          <button type="button" className="fws-frame" onClick={() => setFraming(true)}>
            ✥ Frame &amp; zoom
          </button>
        )}
      </div>
      {cur && onCrop && aspect && (
        <PhotoCropper
          open={framing}
          src={cur.url}
          crop={clampCrop({ x: cur.cropX ?? 50, y: cur.cropY ?? 50, scale: cur.scale ?? 100 })}
          aspect={aspect}
          title={label}
          onChange={(c) => onCrop(value, c)}
          onClose={() => setFraming(false)}
        />
      )}
      {open && (
        <div className="fws-pick-strip" role="listbox" aria-label={label}>
          <button type="button" className={`fws-pick-none${value === 0 ? " is-on" : ""}`} onClick={() => { onPick(0); setOpen(false); }}>
            None
          </button>
          <button type="button" className="fws-pick-none" onClick={() => file.current?.click()} disabled={photos.length >= FW_LIMITS.photos}>
            Upload
          </button>
          {photos.map((p, i) => (
            <button key={i} type="button" role="option" aria-selected={value === i + 1} className={`fws-pick-th${value === i + 1 ? " is-on" : ""}`} onClick={() => { onPick(i + 1); setOpen(false); }} aria-label={`Photo ${i + 1}`}>
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

/** "Send to guests": a personal ?to= link per family (needs the published link). */
function PersonalLinks({ owner, couple, slug }: { owner: StudioProps["owner"]; couple: string; slug: string }) {
  const [base, setBase] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [copied, setCopied] = useState(false);
  const pageId = owner?.pageId ?? null;
  const token = owner?.token ?? null;
  const published = !!owner?.published;
  useEffect(() => {
    if (!published || !pageId || !token) return;
    let live = true;
    fetch(`${API_URL}/${slug}-pages/${pageId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((j) => {
        const u = j?.data?.shareUrl;
        if (live && typeof u === "string" && /^https?:\/\//.test(u)) setBase(u);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [published, pageId, token, slug]);
  const clean = cleanGuestName(name);
  const link = base ? personalLink(base, clean) : "";
  const text = `${clean ? `Dear ${clean}, you're` : "You're"} invited to the wedding of ${couple} 🤍`;
  if (!published || !base) {
    return <p className="fws-hint fws-note">Publish your invitation first. Then come back here to make a personal link for each family: it greets them by name on the envelope.</p>;
  }
  return (
    <div className="fws-links">
      <div className="fws-links-row">
        <input className="vs-input" value={name} maxLength={40} placeholder="e.g. Sharma family" aria-label="Guest's name" onChange={(e) => setName(e.target.value)} />
      </div>
      <p className="fws-link-out" aria-live="polite">
        {link}
      </p>
      <div className="fws-links-row">
        <button
          type="button"
          className="fws-chip"
          onClick={async () => {
            if (await copyText(link)) {
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1800);
            }
          }}
        >
          {copied ? "Copied ✓" : "Copy link"}
        </button>
        <a className="fws-chip fws-chip-wa" href={waLink(`${text}\n${link}`)} target="_blank" rel="noopener noreferrer">
          Send on WhatsApp
        </a>
      </div>
    </div>
  );
}

export default function FaithStudio({ mf, updateMf, updateExtra, ai, password, owner, day }: StudioProps) {
  const faith = faithFor(day.slug);
  const SLUG = faith.slug;
  const DEMO = faith.day.demo.extras as Row;
  const QUICK_FUNCTIONS = faith.quickFunctions;
  const AI_CHIPS = faith.aiChips;
  const MAIN_RE = faith.mainRe;
  const local = faith.local;
  const x = mf.extras as Row;
  const events = useMemo(() => (Array.isArray(x.events) ? (x.events as Row[]) : []), [x.events]);
  const story = useMemo(() => (Array.isArray(x.story) ? (x.story as Chapter[]) : []), [x.story]);
  const things = useMemo(() => (Array.isArray(x.things) ? (x.things as string[]) : []), [x.things]);
  const contacts = useMemo(() => (Array.isArray(x.contacts) ? (x.contacts as Contact[]) : []), [x.contacts]);
  // Demo / repo art is stored as https://subhsandesh.in/wedding-v3/…; the studio shows this host's own copy.
  const photos = useMemo(() => mf.photos.map((p) => (fwLocalUrl(p.url) === p.url ? p : { ...p, url: fwLocalUrl(p.url) })), [mf.photos]);
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
    const evs = (Array.isArray(cur.events) ? (cur.events as Row[]) : [])
      // A row the AI rewrote keeps none of the demo couple's details it did not write itself.
      .map((e, i) => {
        if (!touched(`extras.events[${i}]`)) return e;
        const d = dEvents[i] ?? {};
        const out = { ...e };
        for (const k of ["time", "endTime", "venue", "address", "mapUrl", "dressCode", "dressColor", "note"]) if (!filled.has(`extras.events[${i}].${k}`) && s(e[k]) && s(e[k]) === s(d[k])) out[k] = "";
        return out;
      })
      .filter((e, i) => touched(`extras.events[${i}]`) || !same(e, dEvents[i], ["title", "venue", "date"]));
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
      // The demo's last chapter ("Forever begins") is the couple's own words for any wedding: it stays.
      .filter((c, i) => touched(`extras.story[${i}]`) || !same(c, dStory[i], ["title", "line"]) || i === dStory.length - 1);
    const dContacts = DEMO.contacts as unknown as Row[];
    const cs = (Array.isArray(cur.contacts) ? (cur.contacts as Row[]) : []).filter((c, i) => touched(`extras.contacts[${i}]`) || !same(c, dContacts[i], ["name", "phone"]));
    if (fill.filled.length) {
      // The model often leaves a function's dress code empty: give it the custom one for that function (and its swatch).
      const custom = (t: string) => QUICK_FUNCTIONS.find((q) => t.toLowerCase().includes(q.title.toLowerCase().replace(/ \(.*\)$/, "")));
      set(
        "events",
        (evs.length ? evs : (cur.events as Row[])).map((e) => {
          const q = !s(e.dressCode).trim() ? custom(s(e.title)) : undefined;
          return { ...e, time: toHHMM(s(e.time)), endTime: toHHMM(s(e.endTime)), ...(q ? { dressCode: q.dress, dressColor: q.color } : {}) };
        }),
      );
      const L = latest.current.letter;
      if (/<[^>]+>/.test(L)) updateMf("letter", plain(L));
      set("story", st);
      set("contacts", cs.map((c) => ({ name: s(c.name), relation: s(c.relation), phone: s(c.phone) })));
      if (!touched("extras.things") && JSON.stringify(cur.things) === JSON.stringify(DEMO.things)) set("things", []);
      for (const k of ["blessingsOf", "brideNote", "groomNote", "muhurat", "hashtag", "gettingThere"] as const) {
        if (!touched(`extras.${k}`) && cur[k] === DEMO[k]) set(k, "");
      }
    }
  }, [fill, fill?.generating, fill?.mode, fill?.error, fill?.filled, set, updateMf, DEMO, QUICK_FUNCTIONS]);

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
      const cp = where(n(cur.couplePhoto));
      if (bp !== n(cur.bridePhoto)) set("bridePhoto", bp);
      if (gp !== n(cur.groomPhoto)) set("groomPhoto", gp);
      if (cp !== n(cur.couplePhoto)) set("couplePhoto", cp);
      const st = (Array.isArray(cur.story) ? (cur.story as Chapter[]) : []).map((c) => ({ ...c, photo: where(n(c.photo)) }));
      if (st.some((c, i) => c.photo !== n((cur.story as Chapter[])[i]?.photo))) set("story", st);
    },
    [set],
  );
  const setPhotos = (next: LovePhoto[]) => {
    const prev = latest.current.photos;
    const capped = next.slice(0, FW_LIMITS.photos).map((p) => (fwStoredUrl(p.url) === p.url ? p : { ...p, url: fwStoredUrl(p.url) }));
    updateMf("photos", capped);
    remapRefs(prev, capped);
  };
  /** PhotoCropper → the pool photo's focal point + zoom (the same fields MasonryEditor writes). */
  const cropPhoto = (k: number, c: Crop) => {
    const cur = latest.current.photos;
    if (k < 1 || k > cur.length) return;
    updateMf("photos", cur.map((p, i) => (i === k - 1 ? { ...p, cropX: Math.round(c.x), cropY: Math.round(c.y), scale: Math.round(c.scale) } : p)));
  };
  const uploadTo = async (f: File, apply: (k: number) => void) => {
    try {
      const url = await compressImage(f);
      const size = await measure(url);
      const cur = latest.current.photos;
      if (cur.length >= FW_LIMITS.photos) return;
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
    if (events.length >= FW_LIMITS.events) return;
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

  // Shagun is off by default; the switch shows the fields (a saved id keeps it on).
  const [shagunOn, setShagunOn] = useState(() => !!s(x.upiId));

  // ── Owner: guest replies (a saved page; StudioProps.owner) ─────────────────
  const pageId = owner?.pageId ?? null;
  const token = owner?.token ?? null;

  const letter = mf.letter;
  const localMsg = s(x.localMessage);
  const main = events[mainIdx];

  return (
    <div className="rs">
      <style>{FWS_CSS}</style>

      {pageId && token && (
        <details className="fws-dash">
          <summary>Guest replies &amp; blessings</summary>
          <RsvpDashboard slug={SLUG} pageId={pageId} token={token} csvName="wedding-rsvps" />
        </details>
      )}

      {ai?.available && fill && (
        <section className="fws-ai" aria-labelledby="fws-ai-h">
          <p className="fws-ai-k">✦ Write it for me</p>
          <h3 className="fws-ai-h" id="fws-ai-h">
            Describe your wedding in a few lines
          </h3>
          <p className="fws-ai-p">We&apos;ll fill in everything below. You can change any of it.</p>
          <textarea
            className="vs-input vs-area fws-ai-in"
            rows={4}
            value={desc}
            maxLength={1500}
            onChange={(e) => setDesc(e.target.value)}
            placeholder={faith.aiPlaceholder}
            aria-label="Describe your wedding"
          />
          <div className="fws-chips">
            {AI_CHIPS.map((c) => (
              <button key={c} type="button" className="fws-chip" onClick={() => setDesc((d) => (d.trim() ? `${d.trim()} ${c}.` : `${c}.`))}>
                + {c}
              </button>
            ))}
          </div>
          <button type="button" className="fws-ai-go" onClick={runAi} disabled={fill.generating}>
            {fill.generating ? "Writing your invitation…" : "Write my invitation"}
          </button>
          {aiNote && (
            <p className={`fws-ai-note${aiNote.ok ? " is-ok" : ""}`} role="status">
              {aiNote.text}
            </p>
          )}
        </section>
      )}

      {/* ── The couple ─────────────────────────────────────────────────── */}
      <section className="vs-sec" id="vs-sec-names" aria-label="The couple">
        <Head n={1} icon={faith.day.studioForm?.nav?.[0]?.emoji ?? "🤍"} title="The couple" sub="Names as you'd like them printed, and the big day." />
        <div className="vs-row2">
          <Field label="Bride's name" htmlFor="fws-bride">
            <input id="fws-bride" className="vs-input" value={mf.recipientName} maxLength={30} placeholder="e.g. Ananya" onChange={(e) => updateMf("recipientName", e.target.value)} />
          </Field>
          <Field label="Groom's name" htmlFor="fws-groom">
            <input id="fws-groom" className="vs-input" value={mf.senderName} maxLength={30} placeholder="e.g. Arjun" onChange={(e) => updateMf("senderName", e.target.value)} />
          </Field>
        </div>
        <div className="fws-seg" role="radiogroup" aria-label="Show names as">
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
          <Field label="Bride's family" htmlFor="fws-bf" hint="“With the blessings of…”">
            <input id="fws-bf" className="vs-input" value={s(x.brideFamily)} maxLength={120} placeholder="e.g. Mrs. & Mr. Rakesh Sharma" onChange={(e) => set("brideFamily", e.target.value)} />
          </Field>
          <Field label="Groom's family" htmlFor="fws-gf">
            <input id="fws-gf" className="vs-input" value={s(x.groomFamily)} maxLength={120} placeholder="e.g. Mrs. & Mr. Vikram Mehta" onChange={(e) => set("groomFamily", e.target.value)} />
          </Field>
        </div>
        <p className="fws-sub">Your portrait in an arched window (optional)</p>
        <p className="fws-hint">Shown beside the invitation card, framed in gold with flowers.</p>
        <PhotoPick label="Couple portrait" value={n(x.couplePhoto)} photos={photos} aspect={0.73} onPick={(k) => set("couplePhoto", k)} onUpload={(f) => void uploadTo(f, (k) => set("couplePhoto", k))} onCrop={cropPhoto} />
        {main && (
          <>
            <p className="fws-sub">The big day · used for the countdown and the calendar invites ({s(main.title) || "the wedding"})</p>
            <div className="fws-row3">
              <Field label="Date" htmlFor="fws-date">
                <input id="fws-date" type="date" className="vs-input" value={s(main.date)} onChange={(e) => setEvent(mainIdx, "date", e.target.value)} />
              </Field>
              <Field label="Time" htmlFor="fws-time">
                <input id="fws-time" type="time" className="vs-input" value={s(main.time)} onChange={(e) => setEvent(mainIdx, "time", e.target.value)} />
              </Field>
              <Field label="Ceremony note (optional)" htmlFor="fws-muh">
                <input id="fws-muh" className="vs-input" value={s(x.muhurat)} maxLength={60} placeholder={`e.g. ${s(DEMO.muhurat) || "Kindly be seated by 3:15 pm"}`} onChange={(e) => set("muhurat", e.target.value)} />
              </Field>
            </div>
          </>
        )}
      </section>

      {/* ── Functions ──────────────────────────────────────────────────── */}
      <section className="vs-sec" id="vs-sec-details" aria-label="Functions">
        <Head n={2} icon="🪔" title="Functions" sub={`Add, remove or reorder (up to ${FW_LIMITS.events}). Each one gets its own map, timings, dress code and calendar button.`} />
        <ol className="fws-evs">
          {events.map((e, i) => {
            const isOpen = openEv === i;
            const sw = swatchFor({ dressCode: s(e.dressCode), dressColor: s(e.dressColor) });
            return (
              <li key={s(e.id) || i} className={`fws-ev${isOpen ? " is-open" : ""}`}>
                <button type="button" className="fws-ev-head" onClick={() => setOpenEv(isOpen ? null : i)} aria-expanded={isOpen}>
                  <span className="fws-ev-sw" style={{ background: sw || "transparent" }} aria-hidden />
                  <span className="fws-ev-t">
                    <b>{s(e.title) || "New function"}</b>
                    <small>{[s(e.date), s(e.time), s(e.venue)].filter(Boolean).join(" · ") || "Tap to fill in"}</small>
                  </span>
                  <span className="fws-ev-chev" aria-hidden>
                    {isOpen ? "–" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <div className="fws-ev-body">
                      <Field label="Name" htmlFor={`fws-e${i}-t`}>
                        <input id={`fws-e${i}-t`} className="vs-input" value={s(e.title)} maxLength={40} placeholder="e.g. Sangeet" onChange={(ev) => setEvent(i, "title", ev.target.value)} />
                      </Field>
                      <div className="fws-row3 fws-row3-tight">
                        <Field label="Date" htmlFor={`fws-e${i}-d`}>
                          <input id={`fws-e${i}-d`} type="date" className="vs-input" value={s(e.date)} onChange={(ev) => setEvent(i, "date", ev.target.value)} />
                        </Field>
                        <Field label="Starts" htmlFor={`fws-e${i}-s`}>
                          <input id={`fws-e${i}-s`} type="time" className="vs-input" value={s(e.time)} onChange={(ev) => setEvent(i, "time", ev.target.value)} />
                        </Field>
                        <Field label="Ends" htmlFor={`fws-e${i}-e`}>
                          <input id={`fws-e${i}-e`} type="time" className="vs-input" value={s(e.endTime)} onChange={(ev) => setEvent(i, "endTime", ev.target.value)} />
                        </Field>
                      </div>
                    <div className="vs-row2">
                      <Field label="Venue" htmlFor={`fws-e${i}-v`}>
                        <input id={`fws-e${i}-v`} className="vs-input" value={s(e.venue)} maxLength={80} placeholder="e.g. The Leela Palace, Udaipur" onChange={(ev) => setEvent(i, "venue", ev.target.value)} />
                      </Field>
                      <Field label="Address" htmlFor={`fws-e${i}-a`}>
                        <input id={`fws-e${i}-a`} className="vs-input" value={s(e.address)} maxLength={140} placeholder="Street, city" onChange={(ev) => setEvent(i, "address", ev.target.value)} />
                      </Field>
                    </div>
                    <Field label="Google Maps link (optional)" htmlFor={`fws-e${i}-m`} hint="Paste the share link from Google Maps. Empty: we search the venue and address.">
                      <input id={`fws-e${i}-m`} className="vs-input" inputMode="url" value={s(e.mapUrl)} maxLength={400} placeholder="https://maps.app.goo.gl/…" onChange={(ev) => setEvent(i, "mapUrl", ev.target.value.trim())} />
                    </Field>
                    <Field label="Dress code" htmlFor={`fws-e${i}-dc`}>
                      <input id={`fws-e${i}-dc`} className="vs-input" value={s(e.dressCode)} maxLength={60} placeholder="e.g. Shades of yellow" onChange={(ev) => setEvent(i, "dressCode", ev.target.value)} />
                    </Field>
                    <div className="fws-sws" role="radiogroup" aria-label="Dress-code colour">
                      {SWATCHES.map((c) => (
                        <button key={c} type="button" role="radio" aria-checked={s(e.dressColor).toLowerCase() === c.toLowerCase()} aria-label={c} className="fws-sw" style={{ background: c }} onClick={() => setEvent(i, "dressColor", c)} />
                      ))}
                      <label className="fws-sw fws-sw-custom" aria-label="Custom colour">
                        <input type="color" value={/^#[0-9a-f]{6}$/i.test(s(e.dressColor)) ? s(e.dressColor) : "#c9a24a"} onChange={(ev) => setEvent(i, "dressColor", ev.target.value)} />
                      </label>
                    </div>
                    <Field label="A line for guests (optional)" htmlFor={`fws-e${i}-n`}>
                      <textarea id={`fws-e${i}-n`} className="vs-input vs-area" rows={2} value={s(e.note)} maxLength={200} placeholder="e.g. The baraat leaves the hotel at 7 pm sharp." onChange={(ev) => setEvent(i, "note", ev.target.value)} />
                    </Field>
                    <div className="fws-ev-tools">
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
        {events.length < FW_LIMITS.events ? (
          <div className="fws-quick">
            <span>Add:</span>
            {QUICK_FUNCTIONS.filter((q) => !events.some((e) => s(e.title).toLowerCase() === q.title.toLowerCase())).map((q) => (
              <button key={q.title} type="button" className="fws-chip" onClick={() => addEvent(q)}>
                + {q.title}
              </button>
            ))}
            <button type="button" className="fws-chip" onClick={() => addEvent()}>
              + Other
            </button>
          </div>
        ) : (
          <p className="fws-hint">All {FW_LIMITS.events} functions are in. Remove one to add another.</p>
        )}
      </section>

      {/* ── Photos ─────────────────────────────────────────────────────── */}
      <section className="vs-sec" id="vs-sec-photos" aria-label="Photos">
        <Head n={3} icon="📸" title="Photos" sub={`Up to ${FW_LIMITS.photos}. Any shape works. Tap a photo to resize it or set its focus. Drag to reorder. Photos you use in your story or on a family card don't repeat in the gallery.`} />
        <MasonryEditor photos={photos} onChange={setPhotos} max={FW_LIMITS.photos} mask="rounded" />
      </section>

      {/* ── The invitation ─────────────────────────────────────────────── */}
      <section className="vs-sec" id="vs-sec-letter" aria-label="Your invitation">
        <Head n={4} icon="✉️" title="Your invitation" sub={local ? `The words your guests read first, in English and ${local.name} side by side.` : "The words your guests read first."} />
        <div className={local ? "vs-row2" : undefined}>
          <Field label="In English" htmlFor="fws-letter" count={`${letter.length}/1500`}>
            <textarea id="fws-letter" className="vs-input vs-area fws-letter" rows={8} value={letter} maxLength={1500} placeholder={faith.day.copy.letterPlaceholder} onChange={(e) => updateMf("letter", e.target.value)} />
          </Field>
          {local && (
            <Field label={local.messageLabel} htmlFor="fws-local" count={`${localMsg.length}/700`}>
              <textarea id="fws-local" lang={local.code} dir={local.dir} className={`vs-input vs-area fws-letter is-${local.code}`} rows={8} value={localMsg} maxLength={700} placeholder={local.messagePlaceholder} onChange={(e) => set("localMessage", e.target.value)} />
            </Field>
          )}
        </div>
        <p className="fws-sub">Scripture on the card (optional)</p>
        <p className="fws-hint">
          Leave empty for “{faith.verse.text.length > 90 ? `${faith.verse.text.slice(0, 88)}…` : faith.verse.text}” ({faith.verse.ref}).
        </p>
        <div className="vs-row2">
          <Field label="Your verse" htmlFor="fws-verse" count={`${s(x.verse).length}/220`}>
            <textarea id="fws-verse" className="vs-input vs-area" rows={2} value={s(x.verse)} maxLength={220} placeholder={faith.verse.text} onChange={(e) => set("verse", e.target.value)} />
          </Field>
          <Field label="Reference" htmlFor="fws-vref">
            <input id="fws-vref" className="vs-input" value={s(x.verseRef)} maxLength={40} placeholder={faith.verse.ref} onChange={(e) => set("verseRef", e.target.value)} />
          </Field>
        </div>
      </section>

      {/* ── Theme & music ──────────────────────────────────────────────── */}
      <section className="vs-sec" id="vs-sec-music" aria-label="Theme and music">
        <Head n={5} icon="🎵" title="Theme & music" sub="Three soft palettes on handmade paper. The music starts when the guest breaks the wax seal, with a mute button always in reach." />
        <ThemePicker themes={LIGHT_THEMES} grouped={false} value={s(x.theme) || "champagne"} onChange={(id) => set("theme", id)} sample={`${(mf.recipientName || "A").slice(0, 1)} & ${(mf.senderName || "V").slice(0, 1)}`} label="Theme" />
        <p className="fws-hint" style={{ marginTop: 8 }}>
          {WEDDING_THEMES[(s(x.theme) || "champagne") as keyof typeof WEDDING_THEMES]?.blurb}
        </p>
        <div style={{ marginTop: 18 }}>
          <MusicPicker
            value={mf}
            suggestions={faith.day.music?.suggestions}
            suggestionsNote={faith.day.music?.suggestionsNote}
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

      {/* ── Guests & sharing ───────────────────────────────────────────── */}
      <section className="vs-sec" id="vs-sec-guests" aria-label="Guests and sharing">
        <Head n={6} icon="💌" title="Guests & sharing" sub="Who guests can call, an optional shagun, a live stream, and a personal link for every family." />

        <h4 className="fws-h4">Contact persons</h4>
        <p className="fws-hint">Up to {FW_CONTACTS_MAX}. Guests get a call button and a WhatsApp button for each. Indian mobiles need 10 digits (+91 optional).</p>
        <ol className="fws-contacts">
          {contacts.map((c, i) => {
            const bad = !!c.phone.trim() && !phoneOf(c.phone);
            const upd = (k: keyof Contact, v: string) => set("contacts", contacts.map((q, j) => (j === i ? { ...q, [k]: v } : q)));
            return (
              <li key={i} className="fws-contact">
                <div className="fws-row3 fws-row3-c">
                  <Field label="Name" htmlFor={`fws-c${i}-n`}>
                    <input id={`fws-c${i}-n`} className="vs-input" value={c.name} maxLength={40} placeholder="e.g. Rohan Malhotra" onChange={(e) => upd("name", e.target.value)} />
                  </Field>
                  <Field label="Relation" htmlFor={`fws-c${i}-r`}>
                    <input id={`fws-c${i}-r`} className="vs-input" value={c.relation} maxLength={40} placeholder="e.g. Bride's brother" onChange={(e) => upd("relation", e.target.value)} />
                  </Field>
                  <Field label="Phone" htmlFor={`fws-c${i}-p`}>
                    <input id={`fws-c${i}-p`} className={`vs-input${bad ? " fws-bad" : ""}`} type="tel" inputMode="tel" value={c.phone} maxLength={20} placeholder="+91 98290 12345" aria-invalid={bad} aria-describedby={bad ? `fws-c${i}-e` : undefined} onChange={(e) => upd("phone", e.target.value)} />
                  </Field>
                </div>
                {bad && (
                  <p className="fws-err" id={`fws-c${i}-e`}>
                    That number won&apos;t dial. Use a 10-digit mobile (e.g. 98290 12345) or +country code.
                  </p>
                )}
                <button type="button" className="fws-x" onClick={() => set("contacts", contacts.filter((_, j) => j !== i))}>
                  Remove
                </button>
              </li>
            );
          })}
        </ol>
        {contacts.length < FW_CONTACTS_MAX && (
          <button type="button" className="fws-chip" onClick={() => set("contacts", [...contacts, { name: "", relation: "", phone: "" }])}>
            + Add a contact
          </button>
        )}

        <h4 className="fws-h4">{faith.T.en.shagun} (optional)</h4>
        <label className="fws-tog">
          <input type="checkbox" checked={shagunOn} onChange={(e) => { setShagunOn(e.target.checked); if (!e.target.checked) { set("upiId", ""); set("upiName", ""); } }} /> Offer a polite UPI option for guests who ask
        </label>
        {shagunOn && (
          <div className="vs-row2">
            <Field label="UPI ID" htmlFor="fws-upi" hint={s(x.upiId) && !UPI_RE.test(s(x.upiId)) ? <span className="fws-err-i">That doesn&apos;t look like a UPI ID (name@bank).</span> : "Guests see it with a “Send by UPI” button. We never handle the money."}>
              <input id="fws-upi" className="vs-input" value={s(x.upiId)} maxLength={80} placeholder="e.g. saanvi.malhotra@okaxis" autoComplete="off" onChange={(e) => set("upiId", e.target.value.trim())} />
            </Field>
            <Field label="Name on the account" htmlFor="fws-upin">
              <input id="fws-upin" className="vs-input" value={s(x.upiName)} maxLength={60} placeholder="e.g. Alok Malhotra" onChange={(e) => set("upiName", e.target.value)} />
            </Field>
          </div>
        )}

        <h4 className="fws-h4">Live stream (optional)</h4>
        <Field label="YouTube Live / Zoom link" htmlFor="fws-live" hint={s(x.liveUrl) && !/^https:\/\//i.test(s(x.liveUrl)) ? <span className="fws-err-i">Paste the full https:// link.</span> : "The “Watch live” button opens 30 minutes before the wedding."}>
          <input id="fws-live" className="vs-input" inputMode="url" value={s(x.liveUrl)} maxLength={300} placeholder="https://youtube.com/live/…" onChange={(e) => set("liveUrl", e.target.value.trim())} />
        </Field>

        <h4 className="fws-h4">Personal links</h4>
        <PersonalLinks owner={owner} slug={SLUG} couple={`${mf.recipientName || "the bride"} & ${mf.senderName || "the groom"}`} />
      </section>

      {/* ── More details ───────────────────────────────────────────────── */}
      <section className="vs-sec" id="vs-sec-finish" aria-label="More details">
        <details className="fws-more">
          <summary>
            <Head n={7} icon="✦" title="More details" sub="Your story, family photos, good to know, a film, RSVP settings, the closing line and a password." />
          </summary>

          <h4 className="fws-h4">Our story</h4>
          <p className="fws-hint">A few moments: how you met, the proposal, the yes. Up to {FW_LIMITS.story}, each with a photo.</p>
          <ol className="fws-story">
            {story.map((c, i) => (
              <li key={i} className="fws-ch">
                <div className="fws-row3 fws-row3-story">
                  <Field label="When" htmlFor={`fws-s${i}-w`}>
                    <input id={`fws-s${i}-w`} className="vs-input" value={c.when} maxLength={24} placeholder="2019" onChange={(e) => set("story", story.map((q, j) => (j === i ? { ...q, when: e.target.value } : q)))} />
                  </Field>
                  <Field label="Title" htmlFor={`fws-s${i}-t`}>
                    <input id={`fws-s${i}-t`} className="vs-input" value={c.title} maxLength={60} placeholder="How we met" onChange={(e) => set("story", story.map((q, j) => (j === i ? { ...q, title: e.target.value } : q)))} />
                  </Field>
                </div>
                <Field label="What happened" htmlFor={`fws-s${i}-l`}>
                  <textarea id={`fws-s${i}-l`} className="vs-input vs-area" rows={2} value={c.line} maxLength={240} onChange={(e) => set("story", story.map((q, j) => (j === i ? { ...q, line: e.target.value } : q)))} />
                </Field>
                <div className="fws-ch-tools">
                  <PhotoPick
                    label="Chapter photo"
                    value={n(c.photo)}
                    photos={photos}
                    aspect={1.25}
                    onCrop={cropPhoto}
                    onPick={(k) => set("story", story.map((q, j) => (j === i ? { ...q, photo: k } : q)))}
                    onUpload={(f) => void uploadTo(f, (k) => set("story", (latest.current.extras.story as Chapter[]).map((q, j) => (j === i ? { ...q, photo: k } : q))))}
                  />
                  <button type="button" className="fws-x" onClick={() => set("story", story.filter((_, j) => j !== i))}>
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ol>
          {story.length < FW_LIMITS.story && (
            <button type="button" className="fws-chip" onClick={() => set("story", [...story, { when: "", title: "", line: "", photo: 0 }])}>
              + Add a chapter
            </button>
          )}

          <h4 className="fws-h4">Families</h4>
          <Field label="With the blessings of (grandparents, optional)" htmlFor="fws-bo">
            <input id="fws-bo" className="vs-input" value={s(x.blessingsOf)} maxLength={160} placeholder={`e.g. ${s(DEMO.blessingsOf) || "our grandparents"}`} onChange={(e) => set("blessingsOf", e.target.value)} />
          </Field>
          <div className="vs-row2">
            <div>
              <Field label="Under the bride's family" htmlFor="fws-bn">
                <input id="fws-bn" className="vs-input" value={s(x.brideNote)} maxLength={100} placeholder="e.g. Udaipur" onChange={(e) => set("brideNote", e.target.value)} />
              </Field>
              <PhotoPick label="Bride's family photo" aspect={1} onCrop={cropPhoto} value={n(x.bridePhoto)} photos={photos} onPick={(k) => set("bridePhoto", k)} onUpload={(f) => void uploadTo(f, (k) => set("bridePhoto", k))} />
            </div>
            <div>
              <Field label="Under the groom's family" htmlFor="fws-gn">
                <input id="fws-gn" className="vs-input" value={s(x.groomNote)} maxLength={100} placeholder="e.g. Jaipur" onChange={(e) => set("groomNote", e.target.value)} />
              </Field>
              <PhotoPick label="Groom's family photo" aspect={1} onCrop={cropPhoto} value={n(x.groomPhoto)} photos={photos} onPick={(k) => set("groomPhoto", k)} onUpload={(f) => void uploadTo(f, (k) => set("groomPhoto", k))} />
            </div>
          </div>

          <h4 className="fws-h4">Good to know</h4>
          <p className="fws-hint">Dress code, parking, where to stay, who to call. Start a line with a heading and a colon: “Stay: …”.</p>
          {Array.from({ length: FW_LIMITS.faq }, (_, i) => (
            <input
              key={i}
              className="vs-input fws-thing"
              aria-label={`Good to know ${i + 1}`}
              value={things[i] ?? ""}
              maxLength={180}
              placeholder={["Stay: Rooms are held at …", "Parking: Valet at the main gate", "Weather: Evenings get cool, bring a shawl", "Contact: Call Kabir on …", "Kids: Little ones are welcome", "Gifts: Your blessings are enough"][i]}
              onChange={(e) => {
                const next = Array.from({ length: FW_LIMITS.faq }, (_, j) => (j === i ? e.target.value : things[j] ?? ""));
                set("things", next);
              }}
            />
          ))}
          <Field label="Getting there" htmlFor="fws-gt">
            <textarea id="fws-gt" className="vs-input vs-area" rows={3} value={s(x.gettingThere)} maxLength={500} placeholder="Airport, station, shuttles, who meets guests…" onChange={(e) => set("gettingThere", e.target.value)} />
          </Field>

          <h4 className="fws-h4">Extras</h4>
          <div className="vs-row2">
            <Field label="Pre-wedding film (YouTube link)" htmlFor="fws-vid">
              <input id="fws-vid" className="vs-input" inputMode="url" value={s(x.videoUrl)} maxLength={200} placeholder="https://youtu.be/…" onChange={(e) => set("videoUrl", e.target.value.trim())} />
            </Field>
            <Field label="Wedding hashtag" htmlFor="fws-tag">
              <input id="fws-tag" className="vs-input" value={s(x.hashtag)} maxLength={40} placeholder="#AnanyaWedsArjun" onChange={(e) => set("hashtag", e.target.value)} />
            </Field>
          </div>

          <h4 className="fws-h4">RSVP</h4>
          <p className="fws-hint">Replies come to your email, with a running total.</p>
          <div className="fws-row3">
            <Field label="Reply by" htmlFor="fws-by">
              <input id="fws-by" type="date" className="vs-input" value={s(x.rsvpBy)} onChange={(e) => set("rsvpBy", e.target.value)} />
            </Field>
            <Field label="Max guests per reply" htmlFor="fws-max">
              <input id="fws-max" type="number" min={1} max={10} className="vs-input" value={n(x.maxGuests) || 4} onChange={(e) => set("maxGuests", Math.min(10, Math.max(1, Math.round(Number(e.target.value) || 1))))} />
            </Field>
          </div>
          <label className="fws-tog">
            <input type="checkbox" checked={x.rsvpMeal !== false} onChange={(e) => set("rsvpMeal", e.target.checked)} /> Ask for a meal preference (veg / non-veg / Jain)
          </label>
          <label className="fws-tog">
            <input type="checkbox" checked={x.blessings !== false} onChange={(e) => set("blessings", e.target.checked)} /> Show the blessings wall
          </label>
          <label className="fws-tog">
            <input type="checkbox" checked={x.invocation !== false} onChange={(e) => set("invocation", e.target.checked)} /> {faith.invocationLabel}
          </label>
          {local && (
            <label className="fws-tog">
              <input type="checkbox" checked={x.lang === local.code} onChange={(e) => set("lang", e.target.checked ? local.code : "en")} /> {local.openInLabel}
            </label>
          )}

          <h4 className="fws-h4">The finish</h4>
          <Field label="Closing line" htmlFor="fws-end" hint="On the sealed card at the very end.">
            <input id="fws-end" className="vs-input" value={mf.endLine} maxLength={90} placeholder={faith.day.copy.endLinePlaceholder} onChange={(e) => updateMf("endLine", e.target.value)} />
          </Field>
          {password && (
            <Field label="Password (optional)" htmlFor="fws-pw" hint="Guests type it to open the invitation. Leave empty for no lock.">
              <input id="fws-pw" className="vs-input" value={password.value} maxLength={128} placeholder="e.g. the bride's nickname" autoComplete="off" onChange={(e) => password.set(e.target.value)} />
            </Field>
          )}
        </details>
      </section>
    </div>
  );
}

const FWS_CSS = `
/* The music picker's Listen / Change chips are 36px: lift them to a 40px touch target inside this studio. */
@media (max-width: 1023px) { .rs .vmp-songActs .vmp-listen, .rs .vp-chip { min-height: 40px; } }
.rs { --fws-gold: #b8924a; --fws-rose: #9e5a62; --fws-wine: #7a3f47; }
.fws-head .fws-secN { position: relative; width: 44px; height: 44px; font-size: 20px; background: radial-gradient(circle at 35% 30%, #fff8f3, #f5e3da); color: var(--fws-wine); box-shadow: 0 0 0 1px rgba(184,146,74,.55), 0 6px 14px -8px rgba(122,63,71,.45); }
.fws-secI { line-height: 1; }
.fws-head .fws-secN small { position: absolute; right: -4px; bottom: -4px; min-width: 18px; height: 18px; padding: 0 4px; border-radius: 9px; background: var(--fws-rose); color: #fff8f3; font: 700 10.5px/18px var(--vw-font-ui); text-align: center; }
.fws-hint { margin: 2px 0 10px; font-size: 13px; line-height: 1.45; opacity: .76; }
.fws-note { padding: 12px 14px; border-radius: 14px; background: var(--vw-soft); opacity: 1; }
.fws-count { font-weight: 500; opacity: .6; }
.fws-sub { margin: 6px 0 8px; font-size: 13px; font-weight: 700; color: var(--vw-accent); }
.fws-row3 { display: grid; gap: 0 10px; grid-template-columns: 1fr 1fr; }
.fws-row3 > :last-child:nth-child(3) { grid-column: 1 / -1; }
@media (min-width: 560px) { .fws-row3 { grid-template-columns: 1fr 1fr 1.4fr; } .fws-row3 > :last-child:nth-child(3) { grid-column: auto; } .fws-row3-tight { grid-template-columns: 1.3fr 1fr 1fr; } .fws-row3-story { grid-template-columns: 1fr 3fr; } .fws-row3-c { grid-template-columns: 1.2fr 1fr 1.2fr; } }
.fws-ai { position: relative; margin: 6px 0 6px; padding: 20px 18px 18px; border-radius: 22px; overflow: hidden; color: #3d2a24; background: radial-gradient(120% 90% at 100% 0%, #f7e1dc 0%, transparent 55%), linear-gradient(160deg, #fffaf4, #f8ece2); box-shadow: 0 0 0 1px rgba(184,146,74,.45), 0 18px 40px -26px rgba(122,63,71,.55); }
.fws-ai::after { content: ""; position: absolute; right: -30px; top: -26px; width: 140px; height: 140px; background: url("${WEDDING_ART_CDN}/faith-christian/ch-bloom.webp") center / contain no-repeat; opacity: .5; transform: rotate(-14deg); pointer-events: none; }
.fws-ai > * { position: relative; z-index: 1; }
.fws-ai-k { margin: 0; font: 700 11px/1 var(--vw-font-ui); letter-spacing: .22em; text-transform: uppercase; color: var(--fws-gold); }
.fws-ai-h { margin: 8px 0 4px; font: 600 22px/1.2 var(--vw-font-serif); color: var(--fws-wine); max-width: 80%; }
.fws-ai-p { margin: 0 0 12px; font-size: 13.5px; opacity: .8; }
.fws-ai-in { background: #fffdf9 !important; min-height: 120px; font-size: 15px !important; line-height: 1.5 !important; }
.fws-ai-go { margin-top: 12px; width: 100%; min-height: 50px; border: 0; border-radius: 999px; cursor: pointer; font: 700 15.5px/1 var(--vw-font-ui); letter-spacing: .02em; color: #fff8f3; background: linear-gradient(120deg, #b06e75, #8c4a52 55%, #7a3f47); box-shadow: 0 12px 26px -14px rgba(122,63,71,.8); transition: transform .2s; }
.fws-ai-go:active { transform: scale(.98); }
.fws-ai-go:disabled { opacity: .75; cursor: progress; }
.fws-ai-note { margin: 10px 0 0; font-size: 13.5px; color: #b3261e; }
.fws-ai-note.is-ok { color: #3f7a4d; }
.fws-chips, .fws-quick { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; align-items: center; }
.fws-quick > span { font-size: 12px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; opacity: .6; }
.fws-chip { display: inline-flex; align-items: center; min-height: 40px; padding: 0 14px; border-radius: 999px; border: 1.5px solid var(--vw-edge); background: var(--vw-paper); color: var(--vw-paper-ink); font: 600 13px/1 var(--vw-font-ui); cursor: pointer; text-decoration: none; transition: border-color .2s, transform .2s; }
.fws-chip:hover { border-color: var(--vw-accent); }
.fws-chip:active { transform: scale(.97); }
.fws-chip-wa { border-color: #8fc9a2; color: #1f6b3a; }
.fws-seg { display: flex; gap: 6px; padding: 4px; margin: 0 0 18px; border-radius: 999px; background: var(--vw-soft); width: fit-content; max-width: 100%; }
.fws-seg button { min-height: 40px; padding: 0 14px; border: 0; border-radius: 999px; background: none; font: 600 13.5px/1 var(--vw-font-ui); color: var(--vw-paper-ink); cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 44vw; }
.fws-seg button[aria-checked=true] { background: var(--vw-accent); color: var(--vw-accent-ink); }
.fws-evs { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
.fws-ev { border: 1.5px solid var(--vw-edge); border-radius: 16px; background: var(--vw-paper); overflow: hidden; transition: border-color .2s, box-shadow .2s; }
.fws-ev.is-open { border-color: var(--fws-gold); box-shadow: 0 12px 30px -22px rgba(122,63,71,.5); }
.fws-ev-head { display: flex; align-items: center; gap: 12px; width: 100%; min-height: 60px; padding: 10px 14px; border: 0; background: none; text-align: left; cursor: pointer; color: var(--vw-paper-ink); }
.fws-ev-sw { flex: none; width: 22px; height: 22px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 0 1.5px var(--fws-gold); }
.fws-ev-t { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.fws-ev-t b { font: 600 17px/1.2 var(--vw-font-serif); }
.fws-ev-t small { font-size: 12.5px; opacity: .65; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.fws-ev-chev { font-size: 22px; line-height: 1; color: var(--vw-accent); width: 24px; text-align: center; }
.fws-ev-body { padding: 4px 14px 14px; border-top: 1px dashed var(--vw-edge); }
.fws-ev-tools, .fws-ch-tools { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.fws-ev-tools button, .fws-x { min-height: 40px; padding: 0 14px; border-radius: 999px; border: 1.5px solid var(--vw-edge); background: none; font: 600 13px/1 var(--vw-font-ui); color: var(--vw-paper-ink); cursor: pointer; }
.fws-ev-tools button:disabled { opacity: .35; cursor: default; }
.fws-ev-tools .is-danger, .fws-x { color: #b3261e; }
.fws-sws { display: flex; flex-wrap: wrap; gap: 8px; margin: -8px 0 16px; }
.fws-sw { position: relative; width: 34px; height: 34px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 0 1.5px var(--vw-edge); cursor: pointer; padding: 0; }
.fws-sw[aria-checked=true] { box-shadow: 0 0 0 2.5px var(--vw-accent); }
.fws-sw-custom { background: conic-gradient(#f2c94c, #9db89a, #6f8fc2, #c9a0b4, #e7a3ae, #a3122b, #f2c94c); overflow: hidden; }
.fws-sw-custom input { position: absolute; inset: 0; opacity: 0; width: 100%; height: 100%; cursor: pointer; }
.fws-letter { min-height: 200px; font-family: var(--vw-font-serif); font-size: 16px; line-height: 1.6; }
.fws-more > summary { list-style: none; cursor: pointer; }
.fws-more > summary::-webkit-details-marker { display: none; }
.fws-more > summary .vs-secH::after { content: " ▾"; color: var(--vw-accent); }
.fws-more[open] > summary .vs-secH::after { content: " ▴"; }
.fws-h4 { margin: 22px 0 6px; font: 700 12px/1 var(--vw-font-ui); letter-spacing: .14em; text-transform: uppercase; color: var(--vw-accent); }
.fws-story, .fws-contacts { list-style: none; margin: 0 0 10px; padding: 0; display: grid; gap: 12px; }
.fws-ch, .fws-contact { padding: 12px; border: 1.5px solid var(--vw-edge); border-radius: 16px; background: var(--vw-paper); }
.fws-bad { border-color: #c0392b !important; }
.fws-err { margin: -6px 0 8px; font-size: 12.5px; color: #b3261e; }
.fws-err-i { color: #b3261e; }
.fws-thing { margin-bottom: 8px; }
.fws-tog { display: flex; gap: 10px; align-items: center; min-height: 44px; font-size: 14.5px; cursor: pointer; }
.fws-tog input { width: 20px; height: 20px; accent-color: var(--vw-accent); }
.fws-pick { margin: 0 0 14px; }
.fws-pick-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.fws-pick-btn { display: inline-flex; align-items: center; gap: 10px; min-height: 48px; padding: 4px 14px 4px 4px; border-radius: 999px; border: 1.5px dashed var(--vw-edge); background: var(--vw-paper); color: var(--vw-paper-ink); font: 600 13px/1.2 var(--vw-font-ui); cursor: pointer; }
.fws-pick-btn img, .fws-pick-btn > span:first-child { width: 40px; height: 40px; border-radius: 10px; object-fit: cover; display: grid; place-items: center; background: var(--vw-soft); font-size: 18px; }
.fws-frame { min-height: 44px; padding: 0 14px; border-radius: 999px; border: 1.5px solid var(--fws-gold); background: #fffaf3; color: var(--fws-wine); font: 700 13px/1 var(--vw-font-ui); cursor: pointer; }
.fws-pick-strip { display: flex; gap: 8px; overflow-x: auto; padding: 10px 2px 6px; scroll-snap-type: x proximity; }
.fws-pick-th, .fws-pick-none { flex: none; width: 64px; height: 64px; border-radius: 12px; border: 2px solid transparent; padding: 0; overflow: hidden; background: var(--vw-soft); cursor: pointer; scroll-snap-align: start; font: 600 12px/1 var(--vw-font-ui); color: var(--vw-paper-ink); }
.fws-pick-th img { width: 100%; height: 100%; object-fit: cover; display: block; }
.fws-pick-th.is-on, .fws-pick-none.is-on { border-color: var(--vw-accent); }
.fws-links { padding: 14px; border-radius: 16px; border: 1.5px solid var(--vw-edge); background: var(--vw-paper); }
.fws-links-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.fws-link-out { margin: 10px 0; padding: 10px 12px; border-radius: 10px; background: var(--vw-soft); font: 500 12.5px/1.4 var(--vw-font-ui); word-break: break-all; }
.fws-dash { margin: 4px 0 12px; border: 1.5px solid var(--vw-edge); border-radius: 16px; padding: 0 14px; background: var(--vw-paper); }
.fws-dash > summary { min-height: 52px; display: flex; align-items: center; font: 700 15px/1 var(--vw-font-ui); cursor: pointer; color: var(--vw-accent); }
`;
