"use client";

// ─── Palace Door Wedding Invitation — the editor (the whole form) ────────────
//
// On top, "Describe your wedding" (the AI fills names, families, five
// functions with dress codes, the English + Hindi invitation, two story
// chapters, a family contact, good-to-know and the closing line). Then eight
// steps, each a <section id="vs-sec-<id>"> so the sheet's side nav and Save's
// "jump to the gap" work:
//   1 The couple   names, order, families, the big day, the portrait
//   2 Functions    add / reorder / remove, each with map, dress swatch, note
//   3 Photos       the masonry pool (resize, focal point, zoom, reorder)
//   4 Invitation   English + Hindi, Shri Ganesh on the door
//   5 Our story    chapters with a photo each (framed in the cropper)
//   6 Guest info   good to know, getting there, who to call, livestream, shagun
//   7 Look & music theme + the song (suggested list or any YouTube link)
//   8 RSVP & send  RSVP settings, film, hashtag, closing line, password,
//                  personal ?to= links for each guest
// Single photos (portrait, family cards, story chapters) open the shared
// PhotoCropper in the exact shape the guest page shows them.

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { MasonryEditor, RsvpDashboard, ThemePicker, WEDDING_THEMES } from "../../../_wedding";
import { LIGHT_THEMES } from "../../../_wedding/themes";
import { compressImage } from "../../../dedication/components/mediaUploads";
import MusicPicker from "../../../_valentine/editor/MusicPicker";
import PhotoCropper, { CROP_DEFAULT, clampCrop, type Crop } from "../../../_valentine/editor/PhotoCropper";
import type { StudioProps } from "../../../_valentine/editor/studios";
import { themeVars } from "../../../_valentine/theme";
import type { LovePhoto } from "../../../_valentine/types";
import { PD_LIMITS, PD_MAX_CONTACTS, PD_THEME_LABELS, palaceDoorWeddingDay, pdLocalUrl, pdStoredUrl } from "../../../_valentine/days/palace-door-wedding-invitation";
import { MAIN_RE, isUpiId, phoneOf, swatchFor } from "../pd/model";
import { personalUrl } from "../pd/share";

const SLUG = "palace-door-wedding-invitation";
type Row = Record<string, unknown>;
type Chapter = { when: string; title: string; line: string; photo: number };
type Contact = { name: string; relation: string; phone: string };

const DEMO = palaceDoorWeddingDay.demo.extras;

const QUICK_FUNCTIONS: { title: string; dress: string; color: string }[] = [
  { title: "Roka", dress: "Festive pastels", color: "#E86A92" },
  { title: "Engagement", dress: "Ivory and gold", color: "#F3EBDD" },
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
const LINK_KEY = "pd-invite-link";

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

// ── Little pieces ───────────────────────────────────────────────────────────

const ICONS: Record<string, string> = {
  door: "M5 21V9a7 7 0 0 1 14 0v12M3 21h18M12 4v17M9.5 13.5v1M14.5 13.5v1",
  lamp: "M12 3c2 3 3 4.5 3 6.5a3 3 0 0 1-6 0C9 7.5 10 6 12 3zM5 14h14l-2 5H7zM9 19v2h6v-2",
  photo: "M4 6h16v13H4zM4 16l5-5 4 4 3-3 4 4M15.5 10a1 1 0 1 0 0-.01",
  letter: "M4 6h16v12H4zM4 7l8 6 8-6",
  heart: "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z",
  compass: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM15.5 8.5l-2 5-5 2 2-5z",
  music: "M9 18V6l11-2v12M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z",
  send: "M4 12l16-8-6 16-3-6zM11 14l9-10",
  frame: "M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5M9 12h6M12 9v6",
};
function Icon({ name, size = 18 }: { name: keyof typeof ICONS | string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={ICONS[name] ?? ""} />
    </svg>
  );
}

function Field({ label, hint, children, htmlFor, count, error }: { label: string; hint?: ReactNode; children: ReactNode; htmlFor?: string; count?: string; error?: string }) {
  return (
    <div className="vs-field">
      <label className="vs-label" htmlFor={htmlFor}>
        <span>{label}</span>
        {count && <small className="pds-count">{count}</small>}
      </label>
      {children}
      {error ? (
        <p className="pds-err" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="pds-hint">{hint}</p>
      )}
    </div>
  );
}

function Head({ n: num, icon, title, sub }: { n: number; icon: string; title: string; sub?: string }) {
  return (
    <header className="vs-secHead pds-head">
      <span className="pds-medal" aria-hidden>
        <Icon name={icon} size={20} />
        <i>{num}</i>
      </span>
      <div style={{ minWidth: 0 }}>
        <h3 className="vs-secH">{title}</h3>
        {sub && <p className="vs-secSub">{sub}</p>}
      </div>
    </header>
  );
}

/** A photo from the pool (1-based), "none" (0), or a new upload appended to the pool; plus "Frame" to crop/zoom it. */
function PhotoPick({ value, photos, onPick, onUpload, onFrame, label, round }: { value: number; photos: LovePhoto[]; onPick: (k: number) => void; onUpload: (f: File) => void; onFrame: () => void; label: string; round?: boolean }) {
  const [open, setOpen] = useState(false);
  const cur = value >= 1 && value <= photos.length ? photos[value - 1] : null;
  const file = useRef<HTMLInputElement>(null);
  return (
    <div className="pds-pick">
      <div className="pds-pick-row">
        <button type="button" className={`pds-pick-btn${round ? " is-round" : ""}`} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          {cur ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cur.url} alt="" style={{ objectPosition: `${cur.cropX ?? 50}% ${cur.cropY ?? 50}%` }} />
          ) : (
            <span aria-hidden>＋</span>
          )}
          <span>{cur ? `${label}: photo ${value}` : `${label}: choose a photo`}</span>
        </button>
        {cur && (
          <button type="button" className="pds-frame" onClick={onFrame}>
            <Icon name="frame" size={16} /> Crop &amp; zoom
          </button>
        )}
      </div>
      {open && (
        <div className="pds-pick-strip" role="listbox" aria-label={label}>
          <button type="button" className={`pds-pick-none${value === 0 ? " is-on" : ""}`} onClick={() => { onPick(0); setOpen(false); }}>
            None
          </button>
          <button type="button" className="pds-pick-none" onClick={() => file.current?.click()} disabled={photos.length >= PD_LIMITS.photos}>
            Upload
          </button>
          {photos.map((p, i) => (
            <button key={i} type="button" role="option" aria-selected={value === i + 1} className={`pds-pick-th${value === i + 1 ? " is-on" : ""}`} onClick={() => { onPick(i + 1); setOpen(false); }} aria-label={`Photo ${i + 1}`}>
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

function Toggle({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <label className="pds-tog">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="pds-tog-ui" aria-hidden />
      <span>{children}</span>
    </label>
  );
}

// ── The studio ──────────────────────────────────────────────────────────────

export default function PalaceDoorStudio({ day, mf, updateMf, updateExtra, ai, password, owner }: StudioProps) {
  const x = mf.extras as Row;
  const events = useMemo(() => (Array.isArray(x.events) ? (x.events as Row[]) : []), [x.events]);
  const story = useMemo(() => (Array.isArray(x.story) ? (x.story as Chapter[]) : []), [x.story]);
  const things = useMemo(() => (Array.isArray(x.things) ? (x.things as string[]) : []), [x.things]);
  const contacts = useMemo(() => (Array.isArray(x.contacts) ? (x.contacts as Contact[]) : []), [x.contacts]);
  // Shown same-origin (repo demo art is stored as an https link on the site's domain); handed back stored.
  const photos = useMemo(() => mf.photos.map((p) => (pdLocalUrl(p.url) === p.url ? p : { ...p, url: pdLocalUrl(p.url) })), [mf.photos]);
  const set = updateExtra;
  const themeStyle = useMemo(() => themeVars(day.theme), [day.theme]);

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
      // A chapter the AI rewrote keeps none of the demo couple's words it did not write itself.
      .map((c, i) => {
        if (!touched(`extras.story[${i}]`)) return c;
        const d = dStory[i] ?? {};
        const out = { ...c };
        for (const k of ["when", "title", "line"]) if (!filled.has(`extras.story[${i}].${k}`) && s(c[k]) && s(c[k]) === s(d[k])) out[k] = "";
        return out;
      })
      .filter((c, i) => touched(`extras.story[${i}]`) || !same(c, dStory[i], ["title", "line"]));
    const dContacts = DEMO.contacts as unknown as Row[];
    const cs = (Array.isArray(cur.contacts) ? (cur.contacts as Row[]) : []).filter((c, i) => touched(`extras.contacts[${i}]`) || !same(c, dContacts[i], ["name", "phone"]));
    if (fill.filled.length) {
      set("events", (evs.length ? evs : (cur.events as Row[])).map((e) => ({ ...e, time: toHHMM(s(e.time)), endTime: toHHMM(s(e.endTime)) })));
      const L = latest.current.letter;
      if (/<[^>]+>/.test(L)) updateMf("letter", plain(L));
      set("story", st);
      set("contacts", cs);
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

  // ── Photos: one pool; the portrait, story + family cards point into it ─────
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
      for (const key of ["bridePhoto", "groomPhoto", "couplePhoto"] as const) {
        const v = where(n(cur[key]));
        if (v !== n(cur[key])) set(key, v);
      }
      const st = (Array.isArray(cur.story) ? (cur.story as Chapter[]) : []).map((c) => ({ ...c, photo: where(n(c.photo)) }));
      if (st.some((c, i) => c.photo !== n((cur.story as Chapter[])[i]?.photo))) set("story", st);
    },
    [set],
  );
  const setPhotos = (next: LovePhoto[]) => {
    const prev = latest.current.photos;
    const capped = next.slice(0, PD_LIMITS.photos).map((p) => (pdStoredUrl(p.url) === p.url ? p : { ...p, url: pdStoredUrl(p.url) }));
    updateMf("photos", capped);
    remapRefs(prev, capped);
  };
  const uploadTo = async (f: File, apply: (k: number) => void) => {
    try {
      const url = await compressImage(f);
      const size = await measure(url);
      const cur = latest.current.photos;
      if (cur.length >= PD_LIMITS.photos) return;
      const p: LovePhoto = { url, cropX: 50, cropY: 40, ...(size ? { w: size.w, h: size.h } : {}) };
      updateMf("photos", [...cur, p]);
      apply(cur.length + 1);
    } catch {
      /* compressImage explains itself in the photos section; a picker upload just doesn't land */
    }
  };

  // The cropper: one at a time, on a pool photo, in the shape the page shows it.
  const [framing, setFraming] = useState<{ k: number; aspect: number; title: string } | null>(null);
  const framed = framing && framing.k >= 1 && framing.k <= photos.length ? photos[framing.k - 1] : null;
  const cropOf = (p: LovePhoto | null): Crop => (p ? clampCrop({ x: p.cropX ?? 50, y: p.cropY ?? 50, scale: p.scale ?? 100 }) : CROP_DEFAULT);
  const setCrop = (c: Crop) => {
    if (!framing) return;
    const cur = latest.current.photos;
    const i = framing.k - 1;
    if (!cur[i]) return;
    updateMf(
      "photos",
      cur.map((p, j) => (j === i ? { ...p, cropX: Math.round(c.x * 10) / 10, cropY: Math.round(c.y * 10) / 10, scale: Math.round(c.scale) } : p)),
    );
  };

  // ── Functions ──────────────────────────────────────────────────────────────
  const mainIdx = Math.max(0, events.findIndex((e) => MAIN_RE.test(s(e.title))));
  const setEvent = (i: number, k: string, v: string) => set("events", events.map((e, j) => (j === i ? { ...e, [k]: v } : e)));
  const [openEv, setOpenEv] = useState<number | null>(null);
  const [undo, setUndo] = useState<{ row: Row; at: number } | null>(null);
  useEffect(() => {
    if (!undo) return;
    const t = window.setTimeout(() => setUndo(null), 6000);
    return () => window.clearTimeout(t);
  }, [undo]);
  const addEvent = (q?: (typeof QUICK_FUNCTIONS)[number]) => {
    if (events.length >= PD_LIMITS.events) return;
    const taken = new Set(events.map((e) => s(e.id)));
    const last = events[events.length - 1];
    set("events", [
      ...events,
      { id: newId(taken), title: q?.title ?? "", date: s(last?.date), time: "", endTime: "", venue: s(last?.venue), address: s(last?.address), mapUrl: "", dressCode: q?.dress ?? "", dressColor: q?.color ?? "", note: "" },
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
  const removeEvent = (i: number) => {
    setUndo({ row: events[i], at: i });
    set("events", events.filter((_, j) => j !== i));
    setOpenEv(null);
  };

  // ── Contacts ───────────────────────────────────────────────────────────────
  const setContact = (i: number, k: keyof Contact, v: string) => set("contacts", contacts.map((c, j) => (j === i ? { ...c, [k]: v } : c)));

  // ── Personal links ─────────────────────────────────────────────────────────
  const [link, setLink] = useState(() => {
    try {
      return window.localStorage.getItem(LINK_KEY) ?? "";
    } catch {
      return "";
    }
  });
  const [guestList, setGuestList] = useState("");
  const [copied, setCopied] = useState("");
  const linkOk = /^https?:\/\/\S+$/i.test(link.trim());
  const saveLink = (v: string) => {
    setLink(v);
    try {
      window.localStorage.setItem(LINK_KEY, v.trim());
    } catch {}
  };
  const copy = async (t: string) => {
    try {
      await navigator.clipboard.writeText(t);
      setCopied(t);
      window.setTimeout(() => setCopied(""), 1600);
    } catch {}
  };
  const guests = guestList
    .split(/\n|,/)
    .map((g) => g.trim())
    .filter(Boolean)
    .slice(0, 30);

  // ── Owner: guest replies (a saved page; StudioProps.owner) ─────────────────
  const pageId = owner?.pageId ?? null;
  const token = owner?.token ?? null;

  const letter = mf.letter;
  const hindi = s(x.hindiMessage);
  const main = events[mainIdx];
  const upi = s(x.upiId);
  const live = s(x.liveUrl);
  const coupleName = `${mf.recipientName || "Bride"} & ${mf.senderName || "Groom"}`;

  return (
    <div className="rs pds">
      <style>{PDS_CSS}</style>

      {pageId && token && (
        <details className="pds-dash">
          <summary>
            <Icon name="send" /> Guest replies &amp; blessings
          </summary>
          <RsvpDashboard slug={SLUG} pageId={pageId} token={token} csvName="wedding-rsvps" />
        </details>
      )}

      {ai?.available && fill && (
        <section className="pds-ai" aria-labelledby="pds-ai-h">
          <p className="pds-ai-k">✦ Write it for me</p>
          <h3 className="pds-ai-h" id="pds-ai-h">
            Describe your wedding in a few lines
          </h3>
          <p className="pds-ai-p">Names, dates, where, who to call. We&apos;ll fill in everything below, in English and Hindi. You can change any of it.</p>
          <textarea
            className="vs-input vs-area pds-ai-in"
            rows={4}
            value={desc}
            maxLength={1500}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Ishita and Kabir are getting married on 12 Feb 2027 at Samode Palace near Jaipur. Haldi and Mehendi on the 10th at Samode Haveli, Sangeet on the 11th, pheras at 7 pm, reception on the 13th at Rambagh Palace. Her parents are Sunita and Mahendra Rathore, his are Anjali and Vikram Shekhawat. They met in Jodhpur in 2018. For questions call Yash on 98290 11223."
            aria-label="Describe your wedding"
          />
          <div className="pds-chips">
            {AI_CHIPS.map((c) => (
              <button key={c} type="button" className="pds-chip" onClick={() => setDesc((d) => (d.trim() ? `${d.trim()} ${c}.` : `${c}.`))}>
                + {c}
              </button>
            ))}
          </div>
          <button type="button" className="pds-ai-go" onClick={runAi} disabled={fill.generating}>
            {fill.generating ? "Writing your invitation…" : "✦ Write my invitation"}
          </button>
          {aiNote && (
            <p className={`pds-ai-note${aiNote.ok ? " is-ok" : ""}`} role="status">
              {aiNote.text}
            </p>
          )}
        </section>
      )}

      {/* ── 1 The couple ───────────────────────────────────────────────── */}
      <section className="vs-sec" id="vs-sec-names" aria-label="The couple">
        <Head n={1} icon="door" title="The couple" sub="Names as you'd like them printed on the palace door." />
        <div className="vs-row2">
          <Field label="Bride's name" htmlFor="pds-bride">
            <input id="pds-bride" className="vs-input" value={mf.recipientName} maxLength={30} placeholder="e.g. Ishita" onChange={(e) => updateMf("recipientName", e.target.value)} />
          </Field>
          <Field label="Groom's name" htmlFor="pds-groom">
            <input id="pds-groom" className="vs-input" value={mf.senderName} maxLength={30} placeholder="e.g. Kabir" onChange={(e) => updateMf("senderName", e.target.value)} />
          </Field>
        </div>
        <div className="pds-seg" role="radiogroup" aria-label="Show names as">
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

        {main && (
          <div className="pds-card">
            <p className="pds-sub">The big day · the countdown and the date on the scroll ({s(main.title) || "the wedding"})</p>
            <div className="pds-row3">
              <Field label="Date" htmlFor="pds-date">
                <input id="pds-date" type="date" className="vs-input" value={s(main.date)} onChange={(e) => setEvent(mainIdx, "date", e.target.value)} />
              </Field>
              <Field label="Time" htmlFor="pds-time">
                <input id="pds-time" type="time" className="vs-input" value={s(main.time)} onChange={(e) => setEvent(mainIdx, "time", e.target.value)} />
              </Field>
              <Field label="Muhurat (optional)" htmlFor="pds-muh">
                <input id="pds-muh" className="vs-input" value={s(x.muhurat)} maxLength={60} placeholder="e.g. Shubh muhurat 9:15 pm" onChange={(e) => set("muhurat", e.target.value)} />
              </Field>
            </div>
          </div>
        )}

        <p className="pds-sub">Your portrait in the gold frame</p>
        <p className="pds-hint">Optional. Without one, the courtyard shows the illustrated couple in wedding red.</p>
        <PhotoPick
          label="Portrait"
          round
          value={n(x.couplePhoto)}
          photos={photos}
          onPick={(k) => set("couplePhoto", k)}
          onUpload={(f) => void uploadTo(f, (k) => set("couplePhoto", k))}
          onFrame={() => setFraming({ k: n(x.couplePhoto), aspect: 1.03, title: "Frame your portrait" })}
        />

        <h4 className="pds-h4">Families</h4>
        <div className="vs-row2">
          <div>
            <Field label="Bride's parents" htmlFor="pds-bf">
              <input id="pds-bf" className="vs-input" value={s(x.brideFamily)} maxLength={120} placeholder="e.g. Mrs. Sunita & Mr. Mahendra Singh Rathore" onChange={(e) => set("brideFamily", e.target.value)} />
            </Field>
            <Field label="Under their names" htmlFor="pds-bn">
              <input id="pds-bn" className="vs-input" value={s(x.brideNote)} maxLength={100} placeholder="e.g. Jodhpur" onChange={(e) => set("brideNote", e.target.value)} />
            </Field>
            <PhotoPick label="Family photo" round value={n(x.bridePhoto)} photos={photos} onPick={(k) => set("bridePhoto", k)} onUpload={(f) => void uploadTo(f, (k) => set("bridePhoto", k))} onFrame={() => setFraming({ k: n(x.bridePhoto), aspect: 1, title: "Frame the bride's family photo" })} />
          </div>
          <div>
            <Field label="Groom's parents" htmlFor="pds-gf">
              <input id="pds-gf" className="vs-input" value={s(x.groomFamily)} maxLength={120} placeholder="e.g. Mrs. Anjali & Mr. Vikram Singh Shekhawat" onChange={(e) => set("groomFamily", e.target.value)} />
            </Field>
            <Field label="Under their names" htmlFor="pds-gn">
              <input id="pds-gn" className="vs-input" value={s(x.groomNote)} maxLength={100} placeholder="e.g. Jaipur" onChange={(e) => set("groomNote", e.target.value)} />
            </Field>
            <PhotoPick label="Family photo" round value={n(x.groomPhoto)} photos={photos} onPick={(k) => set("groomPhoto", k)} onUpload={(f) => void uploadTo(f, (k) => set("groomPhoto", k))} onFrame={() => setFraming({ k: n(x.groomPhoto), aspect: 1, title: "Frame the groom's family photo" })} />
          </div>
        </div>
        <Field label="With the blessings of (grandparents, optional)" htmlFor="pds-bo">
          <input id="pds-bo" className="vs-input" value={s(x.blessingsOf)} maxLength={160} placeholder="e.g. Smt. Bhanwari Devi & Late Shri Prithvi Singh Rathore" onChange={(e) => set("blessingsOf", e.target.value)} />
        </Field>
      </section>

      {/* ── 2 Functions ────────────────────────────────────────────────── */}
      <section className="vs-sec" id="vs-sec-details" aria-label="Functions">
        <Head n={2} icon="lamp" title="Functions" sub={`Up to ${PD_LIMITS.events}. Each gets its own illustrated couple (haldi, mehendi, sangeet, wedding, reception, engagement), a map, a dress-code swatch and a calendar button.`} />
        <ol className="pds-evs">
          {events.map((e, i) => {
            const isOpen = openEv === i;
            const sw = swatchFor({ dressCode: s(e.dressCode), dressColor: s(e.dressColor) });
            const mapBad = !!s(e.mapUrl) && !/^https:\/\//i.test(s(e.mapUrl));
            return (
              <li key={s(e.id) || i} className={`pds-ev${isOpen ? " is-open" : ""}`}>
                <div className="pds-ev-top">
                  <button type="button" className="pds-ev-head" onClick={() => setOpenEv(isOpen ? null : i)} aria-expanded={isOpen}>
                    <span className="pds-ev-sw" style={{ background: sw || "transparent" }} aria-hidden />
                    <span className="pds-ev-t">
                      <b>{s(e.title) || "New function"}</b>
                      <small>{[s(e.date), s(e.time), s(e.venue)].filter(Boolean).join(" · ") || "Tap to fill in"}</small>
                    </span>
                    <span className="pds-ev-chev" aria-hidden>
                      {isOpen ? "–" : "+"}
                    </span>
                  </button>
                  <span className="pds-ev-move">
                    <button type="button" onClick={() => moveEvent(i, -1)} disabled={i === 0} aria-label={`Move ${s(e.title) || "function"} earlier`}>
                      ↑
                    </button>
                    <button type="button" onClick={() => moveEvent(i, 1)} disabled={i === events.length - 1} aria-label={`Move ${s(e.title) || "function"} later`}>
                      ↓
                    </button>
                  </span>
                </div>
                {isOpen && (
                  <div className="pds-ev-body">
                    <Field label="Name" htmlFor={`pds-e${i}-t`}>
                      <input id={`pds-e${i}-t`} className="vs-input" value={s(e.title)} maxLength={40} placeholder="e.g. Sangeet" onChange={(ev) => setEvent(i, "title", ev.target.value)} />
                    </Field>
                    <div className="pds-row3 pds-row3-tight">
                      <Field label="Date" htmlFor={`pds-e${i}-d`}>
                        <input id={`pds-e${i}-d`} type="date" className="vs-input" value={s(e.date)} onChange={(ev) => setEvent(i, "date", ev.target.value)} />
                      </Field>
                      <Field label="Starts" htmlFor={`pds-e${i}-s`}>
                        <input id={`pds-e${i}-s`} type="time" className="vs-input" value={s(e.time)} onChange={(ev) => setEvent(i, "time", ev.target.value)} />
                      </Field>
                      <Field label="Ends" htmlFor={`pds-e${i}-e`}>
                        <input id={`pds-e${i}-e`} type="time" className="vs-input" value={s(e.endTime)} onChange={(ev) => setEvent(i, "endTime", ev.target.value)} />
                      </Field>
                    </div>
                    <div className="vs-row2">
                      <Field label="Venue" htmlFor={`pds-e${i}-v`}>
                        <input id={`pds-e${i}-v`} className="vs-input" value={s(e.venue)} maxLength={80} placeholder="e.g. Durbar Hall, Samode Palace" onChange={(ev) => setEvent(i, "venue", ev.target.value)} />
                      </Field>
                      <Field label="Address" htmlFor={`pds-e${i}-a`}>
                        <input id={`pds-e${i}-a`} className="vs-input" value={s(e.address)} maxLength={140} placeholder="Street, city" onChange={(ev) => setEvent(i, "address", ev.target.value)} />
                      </Field>
                    </div>
                    <Field label="Google Maps link (optional)" htmlFor={`pds-e${i}-m`} hint="Paste the share link from Google Maps. Empty: we search the venue and address." error={mapBad ? "That doesn't look like a link. It should start with https://" : undefined}>
                      <input id={`pds-e${i}-m`} className="vs-input" inputMode="url" value={s(e.mapUrl)} maxLength={400} placeholder="https://maps.app.goo.gl/…" onChange={(ev) => setEvent(i, "mapUrl", ev.target.value.trim())} />
                    </Field>
                    <Field label="Dress code" htmlFor={`pds-e${i}-dc`}>
                      <input id={`pds-e${i}-dc`} className="vs-input" value={s(e.dressCode)} maxLength={60} placeholder="e.g. Shades of yellow" onChange={(ev) => setEvent(i, "dressCode", ev.target.value)} />
                    </Field>
                    <div className="pds-sws" role="radiogroup" aria-label="Dress-code colour">
                      {SWATCHES.map((c) => (
                        <button key={c} type="button" role="radio" aria-checked={s(e.dressColor).toLowerCase() === c.toLowerCase()} aria-label={c} className="pds-sw" style={{ background: c }} onClick={() => setEvent(i, "dressColor", c)} />
                      ))}
                      <label className="pds-sw pds-sw-custom" aria-label="Custom colour">
                        <input type="color" value={/^#[0-9a-f]{6}$/i.test(s(e.dressColor)) ? s(e.dressColor) : "#c9a24a"} onChange={(ev) => setEvent(i, "dressColor", ev.target.value)} />
                      </label>
                    </div>
                    <Field label="A line for guests (optional)" htmlFor={`pds-e${i}-n`}>
                      <textarea id={`pds-e${i}-n`} className="vs-input vs-area" rows={2} value={s(e.note)} maxLength={200} placeholder="e.g. The baraat leaves the hotel at 7 pm sharp." onChange={(ev) => setEvent(i, "note", ev.target.value)} />
                    </Field>
                    <div className="pds-ev-tools">
                      <button
                        type="button"
                        onClick={() => {
                          if (events.length >= PD_LIMITS.events) return;
                          const taken = new Set(events.map((q) => s(q.id)));
                          const copyRow = { ...e, id: newId(taken), title: `${s(e.title)} (2)`.slice(0, 40) };
                          set("events", [...events.slice(0, i + 1), copyRow, ...events.slice(i + 1)]);
                          setOpenEv(i + 1);
                        }}
                        disabled={events.length >= PD_LIMITS.events}
                      >
                        Duplicate
                      </button>
                      <button type="button" className="is-danger" disabled={events.length <= 1} onClick={() => removeEvent(i)}>
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
        {undo && (
          <p className="pds-undo" role="status">
            Removed {s(undo.row.title) || "a function"}.{" "}
            <button
              type="button"
              onClick={() => {
                const next = [...events];
                next.splice(Math.min(undo.at, next.length), 0, undo.row);
                set("events", next.slice(0, PD_LIMITS.events));
                setUndo(null);
              }}
            >
              Undo
            </button>
          </p>
        )}
        {events.length < PD_LIMITS.events ? (
          <div className="pds-quick">
            <span>Add:</span>
            {QUICK_FUNCTIONS.filter((q) => !events.some((e) => s(e.title).toLowerCase() === q.title.toLowerCase())).map((q) => (
              <button key={q.title} type="button" className="pds-chip" onClick={() => addEvent(q)}>
                + {q.title}
              </button>
            ))}
            <button type="button" className="pds-chip" onClick={() => addEvent()}>
              + Other
            </button>
          </div>
        ) : (
          <p className="pds-hint">All {PD_LIMITS.events} functions are in. Remove one to add another.</p>
        )}
      </section>

      {/* ── 3 Photos ───────────────────────────────────────────────────── */}
      <section className="vs-sec" id="vs-sec-photos" aria-label="Photos">
        <Head n={3} icon="photo" title="Photos" sub={`${photos.length} of ${PD_LIMITS.photos}. Tap a photo to make it wide, tall or large, set its focus and zoom. Drag ⠿ to reorder. Photos used as the portrait, in your story or on a family card don't repeat in the gallery.`} />
        <MasonryEditor photos={photos} onChange={setPhotos} max={PD_LIMITS.photos} mask="arch" />
      </section>

      {/* ── 4 The invitation ───────────────────────────────────────────── */}
      <section className="vs-sec" id="vs-sec-letter" aria-label="Your invitation">
        <Head n={4} icon="letter" title="Your invitation" sub="The words your guests read first, in English and Hindi side by side." />
        <div className="vs-row2">
          <Field label="In English" htmlFor="pds-letter" count={`${letter.length}/1500`}>
            <textarea id="pds-letter" className="vs-input vs-area pds-letter" rows={8} value={letter} maxLength={1500} placeholder={palaceDoorWeddingDay.copy.letterPlaceholder} onChange={(e) => updateMf("letter", e.target.value)} />
          </Field>
          <Field label="हिन्दी में (optional)" htmlFor="pds-hindi" count={`${hindi.length}/700`}>
            <textarea id="pds-hindi" lang="hi" className="vs-input vs-area pds-letter" rows={8} value={hindi} maxLength={700} placeholder="ईश्वर की असीम कृपा और बड़ों के आशीर्वाद से…" onChange={(e) => set("hindiMessage", e.target.value)} />
          </Field>
        </div>
        <Toggle checked={x.invocation !== false} onChange={(v) => set("invocation", v)}>
          “॥ श्री गणेशाय नमः ॥” on the door (off: “॥ शुभ विवाह ॥”)
        </Toggle>
        <Toggle checked={x.lang === "hi"} onChange={(v) => set("lang", v ? "hi" : "en")}>
          Open the invitation in Hindi (guests can switch)
        </Toggle>
      </section>

      {/* ── 5 Our story ────────────────────────────────────────────────── */}
      <section className="vs-sec" id="vs-sec-story" aria-label="Our story">
        <Head n={5} icon="heart" title="Our story" sub={`A few moments: how you met, the proposal, the yes. Up to ${PD_LIMITS.story}, each with a photo in an arched window.`} />
        <ol className="pds-story">
          {story.map((c, i) => (
            <li key={i} className="pds-ch">
              <div className="pds-row3 pds-row3-story">
                <Field label="When" htmlFor={`pds-s${i}-w`}>
                  <input id={`pds-s${i}-w`} className="vs-input" value={c.when} maxLength={24} placeholder="2019" onChange={(e) => set("story", story.map((q, j) => (j === i ? { ...q, when: e.target.value } : q)))} />
                </Field>
                <Field label="Title" htmlFor={`pds-s${i}-t`}>
                  <input id={`pds-s${i}-t`} className="vs-input" value={c.title} maxLength={60} placeholder="How we met" onChange={(e) => set("story", story.map((q, j) => (j === i ? { ...q, title: e.target.value } : q)))} />
                </Field>
              </div>
              <Field label="What happened" htmlFor={`pds-s${i}-l`}>
                <textarea id={`pds-s${i}-l`} className="vs-input vs-area" rows={2} value={c.line} maxLength={240} onChange={(e) => set("story", story.map((q, j) => (j === i ? { ...q, line: e.target.value } : q)))} />
              </Field>
              <div className="pds-ch-tools">
                <PhotoPick
                  label="Chapter photo"
                  value={n(c.photo)}
                  photos={photos}
                  onPick={(k) => set("story", story.map((q, j) => (j === i ? { ...q, photo: k } : q)))}
                  onUpload={(f) => void uploadTo(f, (k) => set("story", (latest.current.extras.story as Chapter[]).map((q, j) => (j === i ? { ...q, photo: k } : q))))}
                  onFrame={() => setFraming({ k: n(c.photo), aspect: 0.8, title: `Frame the photo for “${c.title || `chapter ${i + 1}`}”` })}
                />
                <button type="button" className="pds-x" onClick={() => set("story", story.filter((_, j) => j !== i))}>
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ol>
        {story.length < PD_LIMITS.story && (
          <button type="button" className="pds-chip" onClick={() => set("story", [...story, { when: "", title: "", line: "", photo: 0 }])}>
            + Add a chapter
          </button>
        )}
      </section>

      {/* ── 6 Guest info ───────────────────────────────────────────────── */}
      <section className="vs-sec" id="vs-sec-guests" aria-label="Guest info">
        <Head n={6} icon="compass" title="Guest info" sub="What guests ask on WhatsApp, answered once: where to stay, how to get there, who to call." />
        <h4 className="pds-h4">Who to call</h4>
        <p className="pds-hint">Up to {PD_MAX_CONTACTS} family members. Guests get a call button and a WhatsApp button for each.</p>
        <ol className="pds-contacts">
          {contacts.map((c, i) => {
            const bad = !!s(c.phone).trim() && !phoneOf(s(c.phone));
            return (
              <li key={i} className="pds-contact">
                <div className="pds-row3 pds-row3-contact">
                  <Field label="Name" htmlFor={`pds-c${i}-n`}>
                    <input id={`pds-c${i}-n`} className="vs-input" value={s(c.name)} maxLength={40} placeholder="e.g. Yash Rathore" onChange={(e) => setContact(i, "name", e.target.value)} />
                  </Field>
                  <Field label="Relation" htmlFor={`pds-c${i}-r`}>
                    <input id={`pds-c${i}-r`} className="vs-input" value={s(c.relation)} maxLength={40} placeholder="e.g. Ishita's brother" onChange={(e) => setContact(i, "relation", e.target.value)} />
                  </Field>
                  <Field label="Phone" htmlFor={`pds-c${i}-p`} error={bad ? "A 10-digit mobile number, with or without +91." : undefined}>
                    <input id={`pds-c${i}-p`} className="vs-input" type="tel" inputMode="tel" autoComplete="off" value={s(c.phone)} maxLength={16} placeholder="+91 98290 11223" onChange={(e) => setContact(i, "phone", e.target.value)} />
                  </Field>
                </div>
                <button type="button" className="pds-x" onClick={() => set("contacts", contacts.filter((_, j) => j !== i))}>
                  Remove
                </button>
              </li>
            );
          })}
        </ol>
        {contacts.length < PD_MAX_CONTACTS && (
          <button type="button" className="pds-chip" onClick={() => set("contacts", [...contacts, { name: "", relation: "", phone: "" }])}>
            + Add a contact
          </button>
        )}

        <h4 className="pds-h4">Good to know</h4>
        <p className="pds-hint">Stay, weather, shuttles, kids. Start a line with a heading and a colon: “Stay: …”.</p>
        {Array.from({ length: PD_LIMITS.faq }, (_, i) => (
          <input
            key={i}
            className="vs-input pds-thing"
            aria-label={`Good to know ${i + 1}`}
            value={things[i] ?? ""}
            maxLength={180}
            placeholder={["Stay: Rooms are held at …", "Weather: Evenings get cool, bring a shawl", "Getting around: Shuttles every 30 minutes", "Children: Little ones are welcome", "Parking: Valet at the main gate", "Gifts: Your blessings are enough"][i]}
            onChange={(e) => {
              const next = Array.from({ length: PD_LIMITS.faq }, (_, j) => (j === i ? e.target.value : things[j] ?? ""));
              set("things", next);
            }}
          />
        ))}
        <Field label="Getting there" htmlFor="pds-gt">
          <textarea id="pds-gt" className="vs-input vs-area" rows={3} value={s(x.gettingThere)} maxLength={500} placeholder="Airport, station, shuttles, who meets guests…" onChange={(e) => set("gettingThere", e.target.value)} />
        </Field>

        <h4 className="pds-h4">Livestream (optional)</h4>
        <Field label="YouTube Live or Zoom link" htmlFor="pds-live" hint="“Watch live” lights up 30 minutes before the wedding and stays on until it ends." error={live && !/^https:\/\/\S+$/i.test(live) ? "Paste the full link, starting with https://" : undefined}>
          <input id="pds-live" className="vs-input" inputMode="url" value={live} maxLength={300} placeholder="https://youtube.com/live/…" onChange={(e) => set("liveUrl", e.target.value.trim())} />
        </Field>

        <h4 className="pds-h4">Shagun by UPI (optional, off when empty)</h4>
        <p className="pds-hint">For guests who ask. Shown politely (“your blessings are the greatest gift”) with a UPI button on phones and a copyable id. We never handle the money.</p>
        <div className="vs-row2">
          <Field label="UPI id" htmlFor="pds-upi" error={upi && !isUpiId(upi) ? "A UPI id looks like name@bank." : undefined}>
            <input id="pds-upi" className="vs-input" value={upi} maxLength={60} placeholder="e.g. ishita.rathore@okhdfc" autoComplete="off" onChange={(e) => set("upiId", e.target.value.trim())} />
          </Field>
          <Field label="Name on the account" htmlFor="pds-upin">
            <input id="pds-upin" className="vs-input" value={s(x.upiName)} maxLength={60} placeholder="e.g. Ishita Rathore" onChange={(e) => set("upiName", e.target.value)} />
          </Field>
        </div>
      </section>

      {/* ── 7 Look & music ─────────────────────────────────────────────── */}
      <section className="vs-sec" id="vs-sec-music" aria-label="Look and music">
        <Head n={7} icon="music" title="Look & music" sub="Three daylight palettes, always in gold. The song starts when the guest opens the doors." />
        <ThemePicker themes={LIGHT_THEMES} grouped={false} value={s(x.theme) || "champagne"} onChange={(id) => set("theme", id)} sample={`${(mf.recipientName || "I").slice(0, 1)} & ${(mf.senderName || "K").slice(0, 1)}`} label="Palette" />
        <p className="pds-hint" style={{ marginTop: 8 }}>
          {PD_THEME_LABELS[s(x.theme) || "champagne"]} · {WEDDING_THEMES[(s(x.theme) || "champagne") as keyof typeof WEDDING_THEMES]?.blurb}
        </p>
        <div style={{ marginTop: 18 }}>
          <MusicPicker
            value={mf}
            suggestions={palaceDoorWeddingDay.music?.suggestions}
            suggestionsNote={palaceDoorWeddingDay.music?.suggestionsNote}
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

      {/* ── 8 RSVP & send ──────────────────────────────────────────────── */}
      <section className="vs-sec" id="vs-sec-finish" aria-label="RSVP and send">
        <Head n={8} icon="send" title="RSVP & send" sub="Replies come to your email with a running total, per function." />
        <div className="pds-row3">
          <Field label="Reply by" htmlFor="pds-by">
            <input id="pds-by" type="date" className="vs-input" value={s(x.rsvpBy)} onChange={(e) => set("rsvpBy", e.target.value)} />
          </Field>
          <Field label="Max guests per reply" htmlFor="pds-max">
            <input id="pds-max" type="number" min={1} max={10} className="vs-input" value={n(x.maxGuests) || 4} onChange={(e) => set("maxGuests", Math.min(10, Math.max(1, Math.round(Number(e.target.value) || 1))))} />
          </Field>
        </div>
        <Toggle checked={x.rsvpMeal !== false} onChange={(v) => set("rsvpMeal", v)}>
          Ask for a meal preference (veg / non-veg / Jain)
        </Toggle>
        <Toggle checked={x.blessings !== false} onChange={(v) => set("blessings", v)}>
          Show the blessings wall
        </Toggle>

        <h4 className="pds-h4">Extras</h4>
        <div className="vs-row2">
          <Field label="Pre-wedding film (YouTube link)" htmlFor="pds-vid">
            <input id="pds-vid" className="vs-input" inputMode="url" value={s(x.videoUrl)} maxLength={200} placeholder="https://youtu.be/…" onChange={(e) => set("videoUrl", e.target.value.trim())} />
          </Field>
          <Field label="Wedding hashtag" htmlFor="pds-tag">
            <input id="pds-tag" className="vs-input" value={s(x.hashtag)} maxLength={40} placeholder="#IshKabirKiShaadi" onChange={(e) => set("hashtag", e.target.value)} />
          </Field>
        </div>
        <Field label="Closing line" htmlFor="pds-end" hint="As the palace door closes at the very end.">
          <input id="pds-end" className="vs-input" value={mf.endLine} maxLength={90} placeholder="With love, the Sharma & Mehta families" onChange={(e) => updateMf("endLine", e.target.value)} />
        </Field>
        {password && (
          <Field label="Password (optional)" htmlFor="pds-pw" hint="Guests type it to open the invitation. Leave empty for no lock.">
            <input id="pds-pw" className="vs-input" value={password.value} maxLength={128} placeholder="e.g. the bride's nickname" autoComplete="off" onChange={(e) => password.set(e.target.value)} />
          </Field>
        )}

        <div className="pds-card pds-personal">
          <h4 className="pds-h4" style={{ marginTop: 0 }}>
            Send personal invites
          </h4>
          <p className="pds-hint">
            Each guest&apos;s link opens on “Dear <i>their name</i>, you are warmly invited” and fills in their RSVP name. {owner?.published ? "Paste your invitation link once (Share → Copy link)." : "Publish first, then paste your invitation link here."}
          </p>
          <Field label="Your invitation link" htmlFor="pds-link" error={link && !linkOk ? "Paste the full link, starting with https://" : undefined}>
            <input id="pds-link" className="vs-input" inputMode="url" value={link} placeholder="https://subhsandesh.in/…" onChange={(e) => saveLink(e.target.value)} />
          </Field>
          <Field label="Guest names (one per line)" htmlFor="pds-guests">
            <textarea id="pds-guests" className="vs-input vs-area" rows={3} value={guestList} placeholder={"Sharma family\nNani ji\nRohan & Priya"} onChange={(e) => setGuestList(e.target.value)} />
          </Field>
          {linkOk && guests.length > 0 && (
            <ul className="pds-links">
              {guests.map((g) => {
                const u = personalUrl(link.trim(), g);
                const msg = `Dear ${g}, the palace doors are open: you're invited to the wedding of ${coupleName} 🚪\n${u}`;
                return (
                  <li key={g}>
                    <span>{g}</span>
                    <a className="pds-mini is-wa" href={`https://wa.me/?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer">
                      WhatsApp
                    </a>
                    <button type="button" className="pds-mini" onClick={() => void copy(u)}>
                      {copied === u ? "Copied ✓" : "Copy link"}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <PhotoCropper
        open={!!framed}
        src={framed?.url ?? ""}
        crop={cropOf(framed)}
        aspect={framing?.aspect ?? 1}
        title={framing?.title ?? "Frame the photo"}
        themeStyle={themeStyle}
        onChange={setCrop}
        onClose={() => setFraming(null)}
      />
    </div>
  );
}

const PDS_CSS = `
.pds { --pds-gold: #B88A35; --pds-gold-soft: #E8D3AE; }
.pds-hint { margin: 2px 0 10px; font-size: 13px; line-height: 1.45; color: var(--vw-ink-soft, #7A5A40); }
.pds-err { margin: 4px 0 10px; font-size: 13px; line-height: 1.4; color: #B3261E; font-weight: 600; }
.pds-count { font-weight: 500; opacity: .6; }
.pds-sub { margin: 14px 0 6px; font-size: 13px; font-weight: 700; color: var(--vw-accent); }
.pds-head { align-items: center; }
.pds-medal { position: relative; flex: none; display: grid; place-items: center; width: 46px; height: 46px; border-radius: 50%; color: #6E3213; background: radial-gradient(circle at 50% 35%, #FFF8E6, #F1DBA8); box-shadow: inset 0 0 0 1.5px var(--pds-gold), 0 6px 14px -8px rgba(110,60,20,.6); }
.pds-medal i { position: absolute; right: -4px; bottom: -4px; min-width: 20px; height: 20px; padding: 0 5px; border-radius: 999px; display: grid; place-items: center; font: 700 11px/1 var(--vw-font-ui); font-style: normal; color: #FFF8EC; background: var(--vw-accent); box-shadow: 0 0 0 2px var(--vw-paper); }
.pds-card { margin: 10px 0 14px; padding: 14px; border-radius: 18px; background: linear-gradient(180deg, #FFFDF8, #FBF3E3); box-shadow: inset 0 0 0 1.5px var(--pds-gold-soft); }
.pds-card .pds-sub { margin-top: 0; }
.pds-row3 { display: grid; gap: 0 10px; grid-template-columns: 1fr 1fr; }
.pds-row3 > :last-child:nth-child(3) { grid-column: 1 / -1; }
@media (min-width: 560px) { .pds-row3 { grid-template-columns: 1fr 1fr 1.4fr; } .pds-row3 > :last-child:nth-child(3) { grid-column: auto; } .pds-row3-tight { grid-template-columns: 1.3fr 1fr 1fr; } .pds-row3-story { grid-template-columns: 1fr 3fr; } .pds-row3-contact { grid-template-columns: 1.2fr 1fr 1.1fr; } }
.pds-ai { position: relative; margin: 6px 0 8px; padding: 20px 18px 18px; border-radius: 22px; background: radial-gradient(120% 90% at 0% 0%, #FFF6DF 0%, #FBEBCB 55%, #F4DDB0 100%); color: #3A2414; box-shadow: 0 18px 40px -26px rgba(110,60,20,.55); overflow: hidden; }
.pds-ai::before { content: ""; position: absolute; inset: 0; border-radius: inherit; padding: 1.5px; background: linear-gradient(110deg,#B88A35,#E6C677 35%,#FFF3C4 50%,#C99A45 65%,#8A5A1C); -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; }
.pds-ai::after { content: ""; position: absolute; right: -40px; top: -40px; width: 160px; height: 160px; border-radius: 50%; background: radial-gradient(closest-side, rgba(255,255,255,.7), rgba(255,255,255,0)); pointer-events: none; }
.pds-ai-k { margin: 0; font: 700 11px/1 var(--vw-font-ui); letter-spacing: .22em; text-transform: uppercase; color: #9A4A1F; }
.pds-ai-h { margin: 8px 0 4px; font: 600 22px/1.2 var(--vw-font-serif); }
.pds-ai-p { margin: 0 0 12px; font-size: 13.5px; color: #6A4A30; }
.pds-ai-in { position: relative; z-index: 1; background: #FFFDF8 !important; min-height: 116px; font-size: 15px !important; line-height: 1.5 !important; }
.pds-ai-go { position: relative; z-index: 1; margin-top: 12px; width: 100%; min-height: 50px; border: 0; border-radius: 999px; cursor: pointer; font: 700 15.5px/1 var(--vw-font-ui); color: #FFF8EC; background: linear-gradient(110deg, #6E3213, #9A4A1F 50%, #B5602A); box-shadow: 0 12px 26px -12px rgba(110,50,19,.8); transition: transform .15s ease; }
.pds-ai-go:active { transform: scale(.98); }
.pds-ai-go:disabled { opacity: .75; cursor: progress; }
.pds-ai-note { margin: 10px 0 0; font-size: 13.5px; color: #B3261E; font-weight: 600; }
.pds-ai-note.is-ok { color: #2F7A45; }
.pds-chips, .pds-quick { position: relative; z-index: 1; display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; align-items: center; }
.pds-quick > span { font-size: 12px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; opacity: .6; }
.pds-chip { min-height: 40px; padding: 0 14px; border-radius: 999px; border: 1.5px solid var(--vw-edge); background: var(--vw-paper); color: var(--vw-paper-ink); font: 600 13px/1 var(--vw-font-ui); cursor: pointer; }
.pds-chip:hover { border-color: var(--vw-accent); }
.pds-seg { display: flex; gap: 6px; padding: 4px; margin: 0 0 12px; border-radius: 999px; background: var(--vw-soft); width: fit-content; max-width: 100%; }
.pds-seg button { min-height: 42px; padding: 0 14px; border: 0; border-radius: 999px; background: none; font: 600 13.5px/1 var(--vw-font-ui); color: var(--vw-paper-ink); cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 44vw; }
.pds-seg button[aria-checked=true] { background: var(--vw-accent); color: var(--vw-accent-ink); }
.pds-evs { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
.pds-ev { border: 1.5px solid var(--vw-edge); border-radius: 16px; background: var(--vw-paper); overflow: hidden; }
.pds-ev.is-open { border-color: var(--pds-gold); box-shadow: 0 12px 30px -22px rgba(110,60,20,.5); }
.pds-ev-top { display: flex; align-items: stretch; }
.pds-ev-head { flex: 1; min-width: 0; display: flex; align-items: center; gap: 12px; min-height: 60px; padding: 10px 6px 10px 14px; border: 0; background: none; text-align: left; cursor: pointer; color: var(--vw-paper-ink); }
.pds-ev-move { display: flex; align-items: center; gap: 2px; padding-right: 6px; }
.pds-ev-move button { width: 36px; height: 44px; border: 0; border-radius: 10px; background: none; font-size: 16px; color: var(--vw-accent); cursor: pointer; }
.pds-ev-move button:disabled { opacity: .25; cursor: default; }
.pds-ev-sw { flex: none; width: 22px; height: 22px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 0 1.5px var(--pds-gold); }
.pds-ev-t { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.pds-ev-t b { font: 600 17px/1.2 var(--vw-font-serif); }
.pds-ev-t small { font-size: 12.5px; opacity: .65; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pds-ev-chev { font-size: 22px; line-height: 1; color: var(--vw-accent); width: 24px; text-align: center; }
.pds-ev-body { padding: 4px 14px 14px; border-top: 1px dashed var(--vw-edge); }
.pds-ev-tools, .pds-ch-tools { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.pds-ev-tools button, .pds-x { min-height: 40px; padding: 0 14px; border-radius: 999px; border: 1.5px solid var(--vw-edge); background: none; font: 600 13px/1 var(--vw-font-ui); color: var(--vw-paper-ink); cursor: pointer; }
.pds-ev-tools button:disabled { opacity: .35; cursor: default; }
.pds-ev-tools .is-danger, .pds-x { color: #B3261E; }
.pds-undo { margin: 10px 0 0; padding: 10px 14px; border-radius: 12px; background: #3A2414; color: #FFF6E3; font-size: 14px; display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.pds-undo button { border: 0; background: none; color: #E6C677; font: 700 14px/1 var(--vw-font-ui); min-height: 36px; cursor: pointer; }
.pds-sws { display: flex; flex-wrap: wrap; gap: 8px; margin: -8px 0 16px; }
.pds-sw { position: relative; width: 34px; height: 34px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 0 1.5px var(--vw-edge); cursor: pointer; padding: 0; }
.pds-sw[aria-checked=true] { box-shadow: 0 0 0 2.5px var(--vw-accent); }
.pds-sw-custom { background: conic-gradient(#f2c94c, #4f9b6a, #2e5aac, #7b3fa0, #e86a92, #a3122b, #f2c94c); overflow: hidden; }
.pds-sw-custom input { position: absolute; inset: 0; opacity: 0; width: 100%; height: 100%; cursor: pointer; }
.pds-letter { min-height: 200px; font-family: var(--vw-font-serif); font-size: 16px; line-height: 1.6; }
.pds-h4 { margin: 22px 0 6px; font: 700 12px/1 var(--vw-font-ui); letter-spacing: .14em; text-transform: uppercase; color: var(--vw-accent); }
.pds-story, .pds-contacts { list-style: none; margin: 0 0 10px; padding: 0; display: grid; gap: 12px; }
.pds-ch, .pds-contact { padding: 12px; border: 1.5px solid var(--vw-edge); border-radius: 16px; background: var(--vw-paper); }
.pds-thing { margin-bottom: 8px; }
.pds-tog { display: flex; gap: 12px; align-items: center; min-height: 46px; font-size: 14.5px; cursor: pointer; }
.pds-tog input { position: absolute; opacity: 0; width: 1px; height: 1px; }
.pds-tog-ui { position: relative; flex: none; width: 42px; height: 24px; border-radius: 999px; background: var(--vw-edge); transition: background .2s ease; }
.pds-tog-ui::after { content: ""; position: absolute; left: 3px; top: 3px; width: 18px; height: 18px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.25); transition: transform .2s ease; }
.pds-tog input:checked + .pds-tog-ui { background: var(--vw-accent); }
.pds-tog input:checked + .pds-tog-ui::after { transform: translateX(18px); }
.pds-tog input:focus-visible + .pds-tog-ui { outline: 2px solid var(--pds-gold); outline-offset: 2px; }
.pds-pick { margin: 0 0 14px; }
.pds-pick-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.pds-pick-btn { display: inline-flex; align-items: center; gap: 10px; min-height: 50px; padding: 4px 14px 4px 4px; border-radius: 14px; border: 1.5px dashed var(--vw-edge); background: var(--vw-paper); color: var(--vw-paper-ink); font: 600 13px/1.2 var(--vw-font-ui); cursor: pointer; }
.pds-pick-btn img, .pds-pick-btn > span:first-child { width: 42px; height: 42px; border-radius: 10px; object-fit: cover; display: grid; place-items: center; background: var(--vw-soft); font-size: 18px; }
.pds-pick-btn.is-round { border-radius: 999px; }
.pds-pick-btn.is-round img, .pds-pick-btn.is-round > span:first-child { border-radius: 50%; }
.pds-frame { display: inline-flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 14px; border-radius: 999px; border: 0; background: var(--vw-soft); color: var(--vw-accent); font: 700 13px/1 var(--vw-font-ui); cursor: pointer; }
.pds-pick-strip { display: flex; gap: 8px; overflow-x: auto; padding: 10px 2px 6px; scroll-snap-type: x proximity; }
.pds-pick-th, .pds-pick-none { flex: none; width: 64px; height: 64px; border-radius: 12px; border: 2px solid transparent; padding: 0; overflow: hidden; background: var(--vw-soft); cursor: pointer; scroll-snap-align: start; font: 600 12px/1 var(--vw-font-ui); color: var(--vw-paper-ink); }
.pds-pick-th img { width: 100%; height: 100%; object-fit: cover; display: block; }
.pds-pick-th.is-on, .pds-pick-none.is-on { border-color: var(--vw-accent); }
.pds-dash { margin: 4px 0 12px; border: 1.5px solid var(--pds-gold); border-radius: 16px; padding: 0 14px; background: var(--vw-paper); }
.pds-dash > summary { min-height: 52px; display: flex; gap: 8px; align-items: center; font: 700 15px/1 var(--vw-font-ui); cursor: pointer; color: var(--vw-accent); }
.pds-personal .vs-field:last-of-type { margin-bottom: 6px; }
.pds-links { list-style: none; margin: 8px 0 0; padding: 0; display: grid; gap: 8px; }
.pds-links li { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 12px; background: var(--vw-paper); box-shadow: inset 0 0 0 1px var(--vw-edge); }
.pds-links li > span { flex: 1; min-width: 0; font-weight: 600; font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pds-mini { display: inline-flex; align-items: center; min-height: 36px; padding: 0 12px; border-radius: 999px; border: 1.5px solid var(--vw-edge); background: none; font: 600 12.5px/1 var(--vw-font-ui); color: var(--vw-paper-ink); text-decoration: none; cursor: pointer; }
.pds-mini.is-wa { border-color: #1FA855; color: #fff; background: #1FA855; }
`;
