"use client";

// ─── Wedding Invitation (Classic · Gulabi Jharokha) — the editor ───────────
//
// On top, "Let AI write it": six quick wedding questions (./WeddingGuided) →
// the AI fills names, families, every function with dress codes, the English
// + Hindi invitation, two story chapters, a contact and the closing line →
// the shared review screen lists every filled field to edit in place. A free
// text box stays one tap away ("or describe it in your own words"). Then eight
// steps, each a <section id="vs-sec-<id>"> so the sheet's step rail and Save's
// "jump to the gap" work:
//   1 The couple   names, order, the big day, the portrait, families
//   2 Functions    add / reorder / duplicate / remove (6 s undo), map, dress swatch
//   3 Photos       the masonry pool (resize, focal point, zoom, reorder, captions)
//   4 Invitation   English + Hindi, Shri Ganesh, which language it opens in
//   5 Our story    chapters with a photo each (framed in the cropper)
//   6 Guest info   who to call, good to know, getting there, livestream, shagun
//   7 Music        the song (list or any YouTube link); one Gulabi palette, no picker
//   8 RSVP & send  RSVP settings, blessings wall, film, hashtag, closing line,
//                  password, personal ?to= links, guest replies (once published)
// Single photos (portrait, story chapters) open the shared PhotoCropper in the
// exact shape the guest page shows them. Old pages (published before the
// rebuild) open here unchanged: every new key reads as empty / off.

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { MasonryEditor, RsvpDashboard, cdn } from "../../../_wedding";
import { compressImage } from "../../../dedication/components/mediaUploads";
import MusicPicker from "../../../_valentine/editor/MusicPicker";
import PhotoCropper, { CROP_DEFAULT, clampCrop, type Crop } from "../../../_valentine/editor/PhotoCropper";
import type { StudioProps } from "../../../_valentine/editor/studios";
import { themeVars } from "../../../_valentine/theme";
import type { LovePhoto } from "../../../_valentine/types";
import { WI_LIMITS, WI_MAX_CONTACTS, weddingInvitationDay, wiLocalUrl, wiStoredUrl } from "../../../_valentine/days/wedding-invitation";
import { MAIN_RE, isUpiId, phoneOf, swatchFor } from "../cw/model";
import { personalUrl } from "../cw/share";
import WeddingGuided, { type WeddingAnswers } from "./WeddingGuided";

const SLUG = "wedding-invitation";
type Row = Record<string, unknown>;
type Chapter = { when: string; title: string; line: string; photo: number };
type Contact = { name: string; relation: string; phone: string };

const DEMO = weddingInvitationDay.demo.extras;

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
/** Words a description uses when it tells how a couple met or got engaged (English, Hinglish). */
const STORY_TOLD = /\b(met|meet|meeting|introduced|proposed|proposal|propose|first (saw|date)|fell in love|college|school|office|work(ed)? together|neighbou?rs?|childhood|friends|arranged|matrimony site|app|mile|mila|mulaqat|pehli baar|shaadi\.com)\b/i;
const AI_CHIPS = ["Make it formal", "Make it warm", "Add Hindi", "Mention our families", "Keep it short"];
const LINK_KEY = "wi-invite-link";

const newId = (taken: Set<string>) => {
  for (;;) {
    const id = `e${Math.random().toString(36).slice(2, 7)}`;
    if (!taken.has(id)) return id;
  }
};
const s = (v: unknown) => (typeof v === "string" ? v : "");
const n = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : 0);
const same = (a: Row | undefined, b: Row | undefined, keys: string[]) => !!a && !!b && keys.every((k) => s(a[k]) === s(b[k]));

/** "7 pm", "7:30PM", "19.30" → "19:30"; anything unreadable (the model's "null", "evening") → "". */
function toHHMM(v: string): string {
  const t = v.trim();
  if (/^\d{2}:\d{2}$/.test(t)) return t;
  const m = t.match(/^(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?$/i);
  if (!m) return "";
  let h = Number(m[1]);
  const mi = Number(m[2] ?? 0);
  const ap = (m[3] ?? "").toLowerCase().replace(/\./g, "");
  if (ap === "pm" && h < 12) h += 12;
  if (ap === "am" && h === 12) h = 0;
  return h < 24 && mi < 60 ? `${String(h).padStart(2, "0")}:${String(mi).padStart(2, "0")}` : "";
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
  ring: "M12 21a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM9 8.5 7.5 5h9L15 8.5M10 5l2-2 2 2",
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
        {count && <small className="wis-count">{count}</small>}
      </label>
      {children}
      {error ? (
        <p className="wis-err" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="wis-hint">{hint}</p>
      )}
    </div>
  );
}

function Head({ n: num, icon, title, sub }: { n: number; icon: string; title: string; sub?: string }) {
  return (
    <header className="vs-secHead wis-head">
      <span className="wis-medal" aria-hidden>
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
    <div className="wis-pick">
      <div className="wis-pick-row">
        <button type="button" className={`wis-pick-btn${round ? " is-round" : ""}`} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          {cur ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cur.url} alt="" style={{ objectPosition: `${cur.cropX ?? 50}% ${cur.cropY ?? 50}%` }} />
          ) : (
            <span aria-hidden>＋</span>
          )}
          <span>{cur ? `${label}: photo ${value}` : `${label}: choose a photo`}</span>
        </button>
        {cur && (
          <button type="button" className="wis-frame" onClick={onFrame}>
            <Icon name="frame" size={16} /> Crop &amp; zoom
          </button>
        )}
      </div>
      {open && (
        <div className="wis-pick-strip" role="listbox" aria-label={label}>
          <button type="button" className={`wis-pick-none${value === 0 ? " is-on" : ""}`} onClick={() => { onPick(0); setOpen(false); }}>
            None
          </button>
          <button type="button" className="wis-pick-none" onClick={() => file.current?.click()} disabled={photos.length >= WI_LIMITS.photos}>
            Upload
          </button>
          {photos.map((p, i) => (
            <button key={i} type="button" role="option" aria-selected={value === i + 1} className={`wis-pick-th${value === i + 1 ? " is-on" : ""}`} onClick={() => { onPick(i + 1); setOpen(false); }} aria-label={`Photo ${i + 1}`}>
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
    <label className="wis-tog">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="wis-tog-ui" aria-hidden />
      <span>{children}</span>
    </label>
  );
}

// ── The studio ──────────────────────────────────────────────────────────────

export default function WeddingStudio({ day, mf, updateMf, updateExtra, ai, password, owner }: StudioProps) {
  const x = mf.extras as Row;
  const events = useMemo(() => (Array.isArray(x.events) ? (x.events as Row[]) : []), [x.events]);
  const story = useMemo(() => (Array.isArray(x.story) ? (x.story as Chapter[]) : []), [x.story]);
  const things = useMemo(() => (Array.isArray(x.things) ? (x.things as string[]) : []), [x.things]);
  const contacts = useMemo(() => (Array.isArray(x.contacts) ? (x.contacts as Contact[]) : []), [x.contacts]);
  // Shown same-origin (repo demo art is stored as an https link on the site's domain); handed back stored.
  const photos = useMemo(() => mf.photos.map((p) => (wiLocalUrl(p.url) === p.url ? p : { ...p, url: wiLocalUrl(p.url) })), [mf.photos]);
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
  const [guidedOpen, setGuidedOpen] = useState(false);
  const [showFree, setShowFree] = useState(false);
  const [desc, setDesc] = useState("");
  const [ran, setRan] = useState(false);
  const [tooShort, setTooShort] = useState(false);
  const wasGenerating = useRef(false);
  /** The guided answers of the run in flight: typed facts win over the model's. */
  const answers = useRef<WeddingAnswers | null>(null);
  /** The free-text description of the run in flight. */
  const sourceText = useRef("");
  const latest = useRef(mf);
  useLayoutEffect(() => {
    latest.current = mf;
  });

  const runAi = () => {
    if (!fill || fill.generating) return;
    const text = desc.trim();
    setTooShort(text.length < 20);
    if (text.length < 20) return;
    answers.current = null;
    sourceText.current = text;
    setRan(true);
    fill.generateGuided({ people: { userName: "", partnerName: "", bestFriendName: "", partnerPronouns: "" }, story: text, hints: { occasion: "wedding" } });
  };

  // After ANY fill lands (the guided questions or the free text: keyed off the
  // hook, not a button), clear what is still the demo's (another couple's
  // venues, story, contacts), then write back the facts the sender typed.
  const generating = !!fill?.generating;
  useEffect(() => {
    if (!fill) return;
    if (generating) {
      wasGenerating.current = true;
      return;
    }
    if (!wasGenerating.current) return;
    wasGenerating.current = false;
    if (fill.error && fill.mode !== "done") return;
    const filled = new Set(fill.filled);
    const touched = (prefix: string) => [...filled].some((p) => p.startsWith(prefix));
    const cur = latest.current.extras as Row;
    const dEvents = DEMO.events as unknown as Row[];
    const evs = (Array.isArray(cur.events) ? (cur.events as Row[]) : [])
      // A function the AI rewrote keeps none of the demo function's details it did not write
      // itself (another couple's address, timings, note, dress colour).
      .map((e, i) => {
        if (!touched(`extras.events[${i}]`)) return e;
        const d = dEvents[i] ?? {};
        const out = { ...e };
        for (const k of ["title", "date", "time", "endTime", "venue", "address", "mapUrl", "dressCode", "dressColor", "note"]) {
          if (!filled.has(`extras.events[${i}].${k}`) && s(e[k]) && s(e[k]) === s(d[k])) out[k] = "";
        }
        // A new dress code takes its swatch from its own words (swatchFor), not the demo's colour.
        if (filled.has(`extras.events[${i}].dressCode`) && s(e.dressColor) === s(d.dressColor)) out.dressColor = "";
        return out;
      })
      .filter((e, i) => touched(`extras.events[${i}]`) || !same(e, dEvents[i], ["title", "venue", "date"]));
    const dStory = DEMO.story as unknown as Row[];
    const st = (Array.isArray(cur.story) ? (cur.story as Row[]) : [])
      // A chapter the AI rewrote keeps none of the demo couple's words it did not write itself.
      .map((c, i) => {
        if (!touched(`extras.story[${i}]`)) return c;
        const d = dStory[i] ?? {};
        const out = { ...c };
        for (const k of ["when", "title", "line"]) if (!filled.has(`extras.story[${i}].${k}`) && s(c[k]) && s(c[k]) === s(d[k])) out[k] = "";
        // The demo chapter's photo belongs to the demo couple.
        if (n(c.photo) && n(c.photo) === n(d.photo)) out.photo = 0;
        return out;
      })
      .filter((c, i) => touched(`extras.story[${i}]`) || !same(c, dStory[i], ["title", "line"]));
    const dContacts = DEMO.contacts as unknown as Row[];
    let cs = (Array.isArray(cur.contacts) ? (cur.contacts as Row[]) : [])
      // A contact the AI rewrote keeps none of the demo person's details it did not write itself.
      .map((c, i) => {
        if (!touched(`extras.contacts[${i}]`)) return c;
        const d = dContacts[i] ?? {};
        const out = { ...c };
        for (const k of ["name", "relation", "phone"]) if (!filled.has(`extras.contacts[${i}].${k}`) && s(c[k]) && s(c[k]) === s(d[k])) out[k] = "";
        return out;
      })
      .filter((c, i) => touched(`extras.contacts[${i}]`) || !same(c, dContacts[i], ["name", "phone"]));
    if (!fill.filled.length) return;
    const fixed: Row[] = (evs.length ? evs : (cur.events as Row[])).map((e) => ({ ...e, time: toHHMM(s(e.time)), endTime: toHHMM(s(e.endTime)) }));
    const L = latest.current.letter;
    if (/<[^>]+>/.test(L)) updateMf("letter", plain(L));
    // A description that tells no moment of theirs has no story: whatever the model wrote there is
    // invented (measured: a names-dates-venues Christian description came back with a "church event"
    // meeting 3 runs out of 3, whatever the guide said). So the chapters stay only when the sender's
    // own words tell one.
    const told = answers.current ? !!answers.current.story.trim() : STORY_TOLD.test(sourceText.current);
    set("story", told ? st : st.filter((c, i) => !touched(`extras.story[${i}]`)));
    if (!touched("extras.things") && JSON.stringify(cur.things) === JSON.stringify(DEMO.things)) set("things", []);
    for (const k of ["blessingsOf", "brideNote", "groomNote", "muhurat", "hashtag", "gettingThere"] as const) {
      if (!touched(`extras.${k}`) && cur[k] === DEMO[k]) set(k, "");
    }
    // The big day follows the main function when the model gave only that.
    const main = fixed.find((e) => MAIN_RE.test(s(e.title))) ?? fixed[0];
    let date = s(cur.date);
    let time = s(cur.time);
    if (main && !touched("extras.date") && s(main.date)) date = s(main.date);
    if (main && (!touched("extras.time") || !time) && s(main.time) && s(main.date) === date) time = s(main.time);
    const a = answers.current;
    answers.current = null;
    if (a) {
      if (a.bride.trim()) updateMf("recipientName", a.bride.trim().slice(0, 30));
      if (a.groom.trim()) updateMf("senderName", a.groom.trim().slice(0, 30));
      set("namesOrder", a.first);
      if (a.date) date = a.date;
      if (a.time) time = a.time;
      // The typed contact is the one guests call, exactly as typed.
      if (a.contactName.trim() && phoneOf(a.contactPhone)) {
        const row = { name: a.contactName.trim().slice(0, 40), relation: s(cs[0]?.relation), phone: a.contactPhone.trim().slice(0, 16) };
        cs = [row, ...cs.filter((c) => s(c.phone).replace(/\D/g, "").slice(-10) !== row.phone.replace(/\D/g, "").slice(-10))];
      }
      // The main ceremony carries the date and time the sender typed.
      if (main && a.date && !s(main.date)) main.date = a.date;
      if (main && a.time && !s(main.time)) main.time = a.time;
      // The questions ask only the ceremony's time. A Haldi "at 7 pm" is the model copying it
      // (measured on the live model even with the description saying the times are undecided).
      if (a.time) for (const e of fixed) if (e !== main && s(e.time) === a.time) e.time = "";
      // A typed function date wins over the model's guess for that function.
      for (const f of a.functions) {
        if (!f.date) continue;
        const row = fixed.find((e) => s(e.title).toLowerCase().startsWith(f.name.toLowerCase().split(" ")[0]));
        if (row) row.date = f.date;
      }
    }
    set("events", fixed);
    set("contacts", cs.slice(0, WI_MAX_CONTACTS));
    if (date) set("date", date);
    if (time) set("time", time);
  }, [fill, generating, set, updateMf]);

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
      for (const key of ["couplePhoto"] as const) {
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
    const capped = next.slice(0, WI_LIMITS.photos).map((p) => (wiStoredUrl(p.url) === p.url ? p : { ...p, url: wiStoredUrl(p.url) }));
    updateMf("photos", capped);
    remapRefs(prev, capped);
  };
  const uploadTo = async (f: File, apply: (k: number) => void) => {
    try {
      const url = await compressImage(f);
      const size = await measure(url);
      const cur = latest.current.photos;
      if (cur.length >= WI_LIMITS.photos) return;
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
  /** The big day (extras.date / time) and the main ceremony's own date / time move together while they agree. */
  const setBigDay = (k: "date" | "time", v: string) => {
    const prev = s(x[k]);
    set(k, v);
    const m = events[mainIdx];
    if (m && (!s(m[k]) || s(m[k]) === prev)) setEvent(mainIdx, k, v);
  };
  const [openEv, setOpenEv] = useState<number | null>(null);
  const [undo, setUndo] = useState<{ row: Row; at: number } | null>(null);
  useEffect(() => {
    if (!undo) return;
    const t = window.setTimeout(() => setUndo(null), 6000);
    return () => window.clearTimeout(t);
  }, [undo]);
  const addEvent = (q?: (typeof QUICK_FUNCTIONS)[number]) => {
    if (events.length >= WI_LIMITS.events) return;
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
  const upi = s(x.upiId);
  const live = s(x.liveUrl);
  const coupleName = `${mf.recipientName || "Bride"} & ${mf.senderName || "Groom"}`;

  return (
    <div className="rs wis">
      <style>{WIS_CSS}</style>

      {pageId && token && (
        <details className="wis-dash">
          <summary>
            <Icon name="send" /> Guest replies &amp; blessings
          </summary>
          <RsvpDashboard slug={SLUG} pageId={pageId} token={token} csvName="wedding-rsvps" />
        </details>
      )}

      {ai?.available && fill && (
        <section className="wis-ai" aria-labelledby="wis-ai-h">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="wis-ai-roses" src={cdn("/wedding-v3/template8/02-pink-white-rose-bouquet.webp")} alt="" width={800} height={686} aria-hidden />
          <p className="wis-ai-k">✦ Let AI write it</p>
          <h3 className="wis-ai-h" id="wis-ai-h">
            Answer 6 quick questions
          </h3>
          <p className="wis-ai-p">Names, the date, where, your functions and families. We write the whole invitation in English and Hindi, then show you every line to check and change.</p>
          <button type="button" className="wis-ai-go" onClick={() => setGuidedOpen(true)} disabled={fill.generating}>
            {fill.generating ? "Writing your invitation…" : "✦ Answer 6 quick questions"}
          </button>
          <div className="wis-ai-alt">
            <button type="button" className="wis-ai-link" aria-expanded={showFree} onClick={() => setShowFree((v) => !v)}>
              or describe it in your own words
            </button>
            <a className="wis-ai-link" href="#vs-sec-names">
              I&apos;ll fill it myself
            </a>
          </div>
          {showFree && (
            <div className="wis-ai-free">
              <textarea
                className="vs-input vs-area wis-ai-in"
                rows={4}
                value={desc}
                maxLength={1500}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Aanya and Vihaan are getting married on 12 Dec 2026 at Jagmandir Island Palace, Udaipur, pheras at 7:30 pm. Mehendi on the 10th, Haldi and Sangeet on the 11th, reception on the 13th at The Leela. Her parents are Meera and Raghav Rathore, his are Kavita and Arjun Singhania. They met at Ambrai Ghat in 2019. For questions call Kabir on 98290 11223."
                aria-label="Describe your wedding"
              />
              <div className="wis-chips">
                {AI_CHIPS.map((c) => (
                  <button key={c} type="button" className="wis-chip" onClick={() => setDesc((d) => (d.trim() ? `${d.trim()} ${c}.` : `${c}.`))}>
                    + {c}
                  </button>
                ))}
              </div>
              <button type="button" className="wis-ai-go is-ghost" onClick={runAi} disabled={fill.generating}>
                {fill.generating ? "Writing your invitation…" : "✦ Write it from my words"}
              </button>
            </div>
          )}
          {aiNote && (
            <p className={`wis-ai-note${aiNote.ok ? " is-ok" : ""}`} role="status">
              {aiNote.text}
            </p>
          )}
          <WeddingGuided
            open={guidedOpen}
            fill={fill}
            onAnswers={(a) => {
              answers.current = a;
              setRan(false);
            }}
            onClose={() => setGuidedOpen(false)}
          />
        </section>
      )}

      {/* ── 1 The couple ───────────────────────────────────────────────── */}
      <section className="vs-sec" id="vs-sec-names" aria-label="The couple">
        <Head n={1} icon="ring" title="The couple" sub="Names as you'd like them written in rose gold behind the jharokha." />
        <div className="vs-row2">
          <Field label="Bride's name" htmlFor="wis-bride">
            <input id="wis-bride" className="vs-input" value={mf.recipientName} maxLength={30} placeholder="e.g. Aanya" onChange={(e) => updateMf("recipientName", e.target.value)} />
          </Field>
          <Field label="Groom's name" htmlFor="wis-groom">
            <input id="wis-groom" className="vs-input" value={mf.senderName} maxLength={30} placeholder="e.g. Vihaan" onChange={(e) => updateMf("senderName", e.target.value)} />
          </Field>
        </div>
        <div className="wis-seg" role="radiogroup" aria-label="Show names as">
          {(["bride", "groom"] as const).map((o) => {
            const a = o === "bride" ? mf.recipientName || "Bride" : mf.senderName || "Groom";
            const b = o === "bride" ? mf.senderName || "Groom" : mf.recipientName || "Bride";
            return (
              <button key={o} type="button" role="radio" aria-checked={(x.namesOrder ?? "bride") === o} onClick={() => set("namesOrder", o)}>
                {a} &amp; {b}
              </button>
            );
          })}
        </div>
        <p className="wis-sub" id="wis-lang-l">Invitation language · every heading, button, date, time and the RSVP form follow it; guests can still switch</p>
        <div className="wis-seg" role="radiogroup" aria-labelledby="wis-lang-l">
          <button type="button" role="radio" aria-checked={x.lang !== "hi"} onClick={() => set("lang", "en")}>
            English
          </button>
          <button type="button" role="radio" aria-checked={x.lang === "hi"} onClick={() => set("lang", "hi")} lang="hi">
            हिंदी
          </button>
        </div>

        <div className="wis-card">
          <p className="wis-sub">The big day · the countdown and the date strip</p>
          <div className="wis-row3">
            <Field label="Date" htmlFor="wis-date">
              <input id="wis-date" type="date" className="vs-input" value={s(x.date)} onChange={(e) => setBigDay("date", e.target.value)} />
            </Field>
            <Field label="Time" htmlFor="wis-time">
              <input id="wis-time" type="time" className="vs-input" value={s(x.time)} onChange={(e) => setBigDay("time", e.target.value)} />
            </Field>
            <Field label="Muhurat line (optional)" htmlFor="wis-muh">
              <input id="wis-muh" className="vs-input" value={s(x.muhurat)} maxLength={60} placeholder="e.g. Shubh muhurat 9:15 pm" onChange={(e) => set("muhurat", e.target.value)} />
            </Field>
          </div>
        </div>

        <p className="wis-sub">Your portrait under the floral gazebo</p>
        <p className="wis-hint">Optional. Without one, the gazebo shows the illustrated couple in peach and blush. Shown in a rounded frame.</p>
        <PhotoPick
          label="Portrait"
          value={n(x.couplePhoto)}
          photos={photos}
          onPick={(k) => set("couplePhoto", k)}
          onUpload={(f) => void uploadTo(f, (k) => set("couplePhoto", k))}
          onFrame={() => setFraming({ k: n(x.couplePhoto), aspect: 0.8, title: "Frame your portrait" })}
        />

        <h4 className="wis-h4">Families</h4>
        <div className="vs-row2">
          <div>
            <Field label="Bride's parents" htmlFor="wis-bf">
              <input id="wis-bf" className="vs-input" value={s(x.brideFamily)} maxLength={120} placeholder="e.g. Mrs. Meera & Mr. Raghav Rathore" onChange={(e) => set("brideFamily", e.target.value)} />
            </Field>
            <Field label="Under their names (optional)" htmlFor="wis-bn">
              <input id="wis-bn" className="vs-input" value={s(x.brideNote)} maxLength={100} placeholder="e.g. Udaipur" onChange={(e) => set("brideNote", e.target.value)} />
            </Field>
          </div>
          <div>
            <Field label="Groom's parents" htmlFor="wis-gf">
              <input id="wis-gf" className="vs-input" value={s(x.groomFamily)} maxLength={120} placeholder="e.g. Mrs. Kavita & Mr. Arjun Singhania" onChange={(e) => set("groomFamily", e.target.value)} />
            </Field>
            <Field label="Under their names (optional)" htmlFor="wis-gn">
              <input id="wis-gn" className="vs-input" value={s(x.groomNote)} maxLength={100} placeholder="e.g. Jaipur" onChange={(e) => set("groomNote", e.target.value)} />
            </Field>
          </div>
        </div>
        <Field label="With the blessings of (grandparents, optional)" htmlFor="wis-bo">
          <input id="wis-bo" className="vs-input" value={s(x.blessingsOf)} maxLength={160} placeholder="e.g. Smt. Kamla Devi & Late Shri Bhanwar Singh Rathore" onChange={(e) => set("blessingsOf", e.target.value)} />
        </Field>
      </section>

      {/* ── 2 Functions ────────────────────────────────────────────────── */}
      <section className="vs-sec" id="vs-sec-details" aria-label="Functions">
        <Head n={2} icon="lamp" title="Functions" sub={`Up to ${WI_LIMITS.events}. Each one is its own card in the suite, with a map and a dress-code swatch.`} />
        <ol className="wis-evs">
          {events.map((e, i) => {
            const isOpen = openEv === i;
            const sw = swatchFor({ dressCode: s(e.dressCode), dressColor: s(e.dressColor) });
            const mapBad = !!s(e.mapUrl) && !/^https:\/\//i.test(s(e.mapUrl));
            return (
              <li key={s(e.id) || i} className={`wis-ev${isOpen ? " is-open" : ""}`}>
                <div className="wis-ev-top">
                  <button type="button" className="wis-ev-head" onClick={() => setOpenEv(isOpen ? null : i)} aria-expanded={isOpen}>
                    <span className="wis-ev-sw" style={{ background: sw || "transparent" }} aria-hidden />
                    <span className="wis-ev-t">
                      <b>{s(e.title) || "New function"}</b>
                      <small>{[s(e.date), s(e.time), s(e.venue)].filter(Boolean).join(" · ") || "Tap to fill in"}</small>
                    </span>
                    <span className="wis-ev-chev" aria-hidden>
                      {isOpen ? "–" : "+"}
                    </span>
                  </button>
                  <span className="wis-ev-move">
                    <button type="button" onClick={() => moveEvent(i, -1)} disabled={i === 0} aria-label={`Move ${s(e.title) || "function"} earlier`}>
                      ↑
                    </button>
                    <button type="button" onClick={() => moveEvent(i, 1)} disabled={i === events.length - 1} aria-label={`Move ${s(e.title) || "function"} later`}>
                      ↓
                    </button>
                  </span>
                </div>
                {isOpen && (
                  <div className="wis-ev-body">
                    <Field label="Name" htmlFor={`wis-e${i}-t`}>
                      <input id={`wis-e${i}-t`} className="vs-input" value={s(e.title)} maxLength={40} placeholder="e.g. Sangeet" onChange={(ev) => setEvent(i, "title", ev.target.value)} />
                    </Field>
                    <div className="wis-row3 wis-row3-tight">
                      <Field label="Date" htmlFor={`wis-e${i}-d`}>
                        <input id={`wis-e${i}-d`} type="date" className="vs-input" value={s(e.date)} onChange={(ev) => setEvent(i, "date", ev.target.value)} />
                      </Field>
                      <Field label="Starts" htmlFor={`wis-e${i}-s`}>
                        <input id={`wis-e${i}-s`} type="time" className="vs-input" value={s(e.time)} onChange={(ev) => setEvent(i, "time", ev.target.value)} />
                      </Field>
                      <Field label="Ends" htmlFor={`wis-e${i}-e`}>
                        <input id={`wis-e${i}-e`} type="time" className="vs-input" value={s(e.endTime)} onChange={(ev) => setEvent(i, "endTime", ev.target.value)} />
                      </Field>
                    </div>
                    <div className="vs-row2">
                      <Field label="Venue" htmlFor={`wis-e${i}-v`}>
                        <input id={`wis-e${i}-v`} className="vs-input" value={s(e.venue)} maxLength={80} placeholder="e.g. Durbar Hall, Samode Palace" onChange={(ev) => setEvent(i, "venue", ev.target.value)} />
                      </Field>
                      <Field label="Address" htmlFor={`wis-e${i}-a`}>
                        <input id={`wis-e${i}-a`} className="vs-input" value={s(e.address)} maxLength={140} placeholder="Street, city" onChange={(ev) => setEvent(i, "address", ev.target.value)} />
                      </Field>
                    </div>
                    <Field label="Google Maps link (optional)" htmlFor={`wis-e${i}-m`} hint="Paste the share link from Google Maps. Empty: we search the venue and address." error={mapBad ? "That doesn't look like a link. It should start with https://" : undefined}>
                      <input id={`wis-e${i}-m`} className="vs-input" inputMode="url" value={s(e.mapUrl)} maxLength={400} placeholder="https://maps.app.goo.gl/…" onChange={(ev) => setEvent(i, "mapUrl", ev.target.value.trim())} />
                    </Field>
                    <Field label="Dress code" htmlFor={`wis-e${i}-dc`}>
                      <input id={`wis-e${i}-dc`} className="vs-input" value={s(e.dressCode)} maxLength={60} placeholder="e.g. Shades of yellow" onChange={(ev) => setEvent(i, "dressCode", ev.target.value)} />
                    </Field>
                    <div className="wis-sws" role="radiogroup" aria-label="Dress-code colour">
                      {SWATCHES.map((c) => (
                        <button key={c} type="button" role="radio" aria-checked={s(e.dressColor).toLowerCase() === c.toLowerCase()} aria-label={c} className="wis-sw" style={{ background: c }} onClick={() => setEvent(i, "dressColor", c)} />
                      ))}
                      <label className="wis-sw wis-sw-custom" aria-label="Custom colour">
                        <input type="color" value={/^#[0-9a-f]{6}$/i.test(s(e.dressColor)) ? s(e.dressColor) : "#c9a24a"} onChange={(ev) => setEvent(i, "dressColor", ev.target.value)} />
                      </label>
                    </div>
                    <Field label="A line for guests (optional)" htmlFor={`wis-e${i}-n`}>
                      <textarea id={`wis-e${i}-n`} className="vs-input vs-area" rows={2} value={s(e.note)} maxLength={200} placeholder="e.g. The baraat leaves the hotel at 7 pm sharp." onChange={(ev) => setEvent(i, "note", ev.target.value)} />
                    </Field>
                    <div className="wis-ev-tools">
                      <button
                        type="button"
                        onClick={() => {
                          if (events.length >= WI_LIMITS.events) return;
                          const taken = new Set(events.map((q) => s(q.id)));
                          const copyRow = { ...e, id: newId(taken), title: `${s(e.title)} (2)`.slice(0, 40) };
                          set("events", [...events.slice(0, i + 1), copyRow, ...events.slice(i + 1)]);
                          setOpenEv(i + 1);
                        }}
                        disabled={events.length >= WI_LIMITS.events}
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
          <p className="wis-undo" role="status">
            Removed {s(undo.row.title) || "a function"}.{" "}
            <button
              type="button"
              onClick={() => {
                const next = [...events];
                next.splice(Math.min(undo.at, next.length), 0, undo.row);
                set("events", next.slice(0, WI_LIMITS.events));
                setUndo(null);
              }}
            >
              Undo
            </button>
          </p>
        )}
        {events.length < WI_LIMITS.events ? (
          <div className="wis-quick">
            <span>Add:</span>
            {QUICK_FUNCTIONS.filter((q) => !events.some((e) => s(e.title).toLowerCase() === q.title.toLowerCase())).map((q) => (
              <button key={q.title} type="button" className="wis-chip" onClick={() => addEvent(q)}>
                + {q.title}
              </button>
            ))}
            <button type="button" className="wis-chip" onClick={() => addEvent()}>
              + Other
            </button>
          </div>
        ) : (
          <p className="wis-hint">All {WI_LIMITS.events} functions are in. Remove one to add another.</p>
        )}
      </section>

      {/* ── 3 Photos ───────────────────────────────────────────────────── */}
      <section className="vs-sec" id="vs-sec-photos" aria-label="Photos">
        <Head n={3} icon="photo" title="Photos" sub={`${photos.length} of ${WI_LIMITS.photos}. Tap a photo to make it wide, tall or large, set its focus and zoom. Drag ⠿ to reorder. Photos used as the portrait or in your story don't repeat in the gallery.`} />
        <MasonryEditor photos={photos} onChange={setPhotos} max={WI_LIMITS.photos} mask="rounded" />
      </section>

      {/* ── 4 The invitation ───────────────────────────────────────────── */}
      <section className="vs-sec" id="vs-sec-letter" aria-label="Your invitation">
        <Head n={4} icon="letter" title="Your invitation" sub="The words your guests read first, in English and Hindi side by side." />
        <div className="vs-row2">
          <Field label="In English" htmlFor="wis-letter" count={`${letter.length}/1500`}>
            <textarea id="wis-letter" className="vs-input vs-area wis-letter" rows={8} value={letter} maxLength={1500} placeholder={weddingInvitationDay.copy.letterPlaceholder} onChange={(e) => updateMf("letter", e.target.value)} />
          </Field>
          <Field label="हिन्दी में (optional)" htmlFor="wis-hindi" count={`${hindi.length}/700`}>
            <textarea id="wis-hindi" lang="hi" className="vs-input vs-area wis-letter" rows={8} value={hindi} maxLength={700} placeholder="ईश्वर की असीम कृपा और बड़ों के आशीर्वाद से…" onChange={(e) => set("hindiMessage", e.target.value)} />
          </Field>
        </div>
        <Toggle checked={x.invocation === true} onChange={(v) => set("invocation", v)}>
          The gold Shri Ganesh and “॥ श्री गणेशाय नमः ॥” on the invitation (off: “॥ शुभ विवाह ॥” on the window)
        </Toggle>
      </section>

      {/* ── 5 Our story ────────────────────────────────────────────────── */}
      <section className="vs-sec" id="vs-sec-story" aria-label="Our story">
        <Head n={5} icon="heart" title="Our story" sub={`A few moments: how you met, the proposal, the yes. Up to ${WI_LIMITS.story}, each with a photo in a rounded rose-gold frame.`} />
        <ol className="wis-story">
          {story.map((c, i) => (
            <li key={i} className="wis-ch">
              <div className="wis-row3 wis-row3-story">
                <Field label="When" htmlFor={`wis-s${i}-w`}>
                  <input id={`wis-s${i}-w`} className="vs-input" value={c.when} maxLength={24} placeholder="2019" onChange={(e) => set("story", story.map((q, j) => (j === i ? { ...q, when: e.target.value } : q)))} />
                </Field>
                <Field label="Title" htmlFor={`wis-s${i}-t`}>
                  <input id={`wis-s${i}-t`} className="vs-input" value={c.title} maxLength={60} placeholder="How we met" onChange={(e) => set("story", story.map((q, j) => (j === i ? { ...q, title: e.target.value } : q)))} />
                </Field>
              </div>
              <Field label="What happened" htmlFor={`wis-s${i}-l`}>
                <textarea id={`wis-s${i}-l`} className="vs-input vs-area" rows={2} value={c.line} maxLength={240} onChange={(e) => set("story", story.map((q, j) => (j === i ? { ...q, line: e.target.value } : q)))} />
              </Field>
              <div className="wis-ch-tools">
                <PhotoPick
                  label="Chapter photo"
                  value={n(c.photo)}
                  photos={photos}
                  onPick={(k) => set("story", story.map((q, j) => (j === i ? { ...q, photo: k } : q)))}
                  onUpload={(f) => void uploadTo(f, (k) => set("story", (latest.current.extras.story as Chapter[]).map((q, j) => (j === i ? { ...q, photo: k } : q))))}
                  onFrame={() => setFraming({ k: n(c.photo), aspect: 0.8, title: `Frame the photo for “${c.title || `chapter ${i + 1}`}”` })}
                />
                <button type="button" className="wis-x" onClick={() => set("story", story.filter((_, j) => j !== i))}>
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ol>
        {story.length < WI_LIMITS.story && (
          <button type="button" className="wis-chip" onClick={() => set("story", [...story, { when: "", title: "", line: "", photo: 0 }])}>
            + Add a chapter
          </button>
        )}
      </section>

      {/* ── 6 Guest info ───────────────────────────────────────────────── */}
      <section className="vs-sec" id="vs-sec-guests" aria-label="Guest info">
        <Head n={6} icon="compass" title="Guest info" sub="What guests ask on WhatsApp, answered once: where to stay, how to get there, who to call." />
        <h4 className="wis-h4">Who to call</h4>
        <p className="wis-hint">Up to {WI_MAX_CONTACTS} family members. Guests get a call button and a WhatsApp button for each.</p>
        <ol className="wis-contacts">
          {contacts.map((c, i) => {
            const bad = !!s(c.phone).trim() && !phoneOf(s(c.phone));
            return (
              <li key={i} className="wis-contact">
                <div className="wis-row3 wis-row3-contact">
                  <Field label="Name" htmlFor={`wis-c${i}-n`}>
                    <input id={`wis-c${i}-n`} className="vs-input" value={s(c.name)} maxLength={40} placeholder="e.g. Kabir Rathore" onChange={(e) => setContact(i, "name", e.target.value)} />
                  </Field>
                  <Field label="Relation" htmlFor={`wis-c${i}-r`}>
                    <input id={`wis-c${i}-r`} className="vs-input" value={s(c.relation)} maxLength={40} placeholder="e.g. Aanya's brother" onChange={(e) => setContact(i, "relation", e.target.value)} />
                  </Field>
                  <Field label="Phone" htmlFor={`wis-c${i}-p`} error={bad ? "A 10-digit mobile number, with or without +91." : undefined}>
                    <input id={`wis-c${i}-p`} className="vs-input" type="tel" inputMode="tel" autoComplete="off" value={s(c.phone)} maxLength={16} placeholder="+91 98290 11223" onChange={(e) => setContact(i, "phone", e.target.value)} />
                  </Field>
                </div>
                <button type="button" className="wis-x" onClick={() => set("contacts", contacts.filter((_, j) => j !== i))}>
                  Remove
                </button>
              </li>
            );
          })}
        </ol>
        {contacts.length < WI_MAX_CONTACTS && (
          <button type="button" className="wis-chip" onClick={() => set("contacts", [...contacts, { name: "", relation: "", phone: "" }])}>
            + Add a contact
          </button>
        )}

        <h4 className="wis-h4">Good to know</h4>
        <p className="wis-hint">Stay, weather, shuttles, kids. Start a line with a heading and a colon: “Stay: …”.</p>
        {Array.from({ length: WI_LIMITS.faq }, (_, i) => (
          <input
            key={i}
            className="vs-input wis-thing"
            aria-label={`Good to know ${i + 1}`}
            value={things[i] ?? ""}
            maxLength={180}
            placeholder={["Stay: Rooms are held at …", "Weather: Evenings get cool, bring a shawl", "Getting around: Shuttles every 30 minutes", "Children: Little ones are welcome", "Parking: Valet at the main gate", "Gifts: Your blessings are enough"][i]}
            onChange={(e) => {
              const next = Array.from({ length: WI_LIMITS.faq }, (_, j) => (j === i ? e.target.value : things[j] ?? ""));
              set("things", next);
            }}
          />
        ))}
        <Field label="Getting there" htmlFor="wis-gt">
          <textarea id="wis-gt" className="vs-input vs-area" rows={3} value={s(x.gettingThere)} maxLength={500} placeholder="Airport, station, shuttles, who meets guests…" onChange={(e) => set("gettingThere", e.target.value)} />
        </Field>

        <h4 className="wis-h4">Livestream (optional)</h4>
        <Field label="YouTube Live or Zoom link" htmlFor="wis-live" hint="“Watch live” lights up 30 minutes before the wedding and stays on until it ends." error={live && !/^https:\/\/\S+$/i.test(live) ? "Paste the full link, starting with https://" : undefined}>
          <input id="wis-live" className="vs-input" inputMode="url" value={live} maxLength={300} placeholder="https://youtube.com/live/…" onChange={(e) => set("liveUrl", e.target.value.trim())} />
        </Field>

        <h4 className="wis-h4">Shagun by UPI (optional, off when empty)</h4>
        <p className="wis-hint">For guests who ask. Shown politely (“your blessings are the greatest gift”) with a UPI button on phones and a copyable id. We never handle the money.</p>
        <div className="vs-row2">
          <Field label="UPI id" htmlFor="wis-upi" error={upi && !isUpiId(upi) ? "A UPI id looks like name@bank." : undefined}>
            <input id="wis-upi" className="vs-input" value={upi} maxLength={60} placeholder="e.g. aanya.rathore@okhdfc" autoComplete="off" onChange={(e) => set("upiId", e.target.value.trim())} />
          </Field>
          <Field label="Name on the account" htmlFor="wis-upin">
            <input id="wis-upin" className="vs-input" value={s(x.upiName)} maxLength={60} placeholder="e.g. Aanya Rathore" onChange={(e) => set("upiName", e.target.value)} />
          </Field>
        </div>
      </section>

      {/* ── 7 Music ───────────────────────────────────────────────────── */}
      <section className="vs-sec" id="vs-sec-music" aria-label="Music">
        <Head n={7} icon="music" title="Music" sub="The song starts the moment a guest opens the jharokha. The look is one hand-painted Gulabi palette — blush, rose gold and ivory — made for this art." />
        <div>
          <MusicPicker
            value={mf}
            suggestions={weddingInvitationDay.music?.suggestions}
            suggestionsNote={weddingInvitationDay.music?.suggestionsNote}
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
        <div className="wis-row3">
          <Field label="Reply by" htmlFor="wis-by">
            <input id="wis-by" type="date" className="vs-input" value={s(x.rsvpBy)} onChange={(e) => set("rsvpBy", e.target.value)} />
          </Field>
          <Field label="Max guests per reply" htmlFor="wis-max">
            <input id="wis-max" type="number" min={1} max={10} className="vs-input" value={n(x.maxGuests) || 4} onChange={(e) => set("maxGuests", Math.min(10, Math.max(1, Math.round(Number(e.target.value) || 1))))} />
          </Field>
        </div>
        <Toggle checked={x.rsvp !== false} onChange={(v) => set("rsvp", v)}>
          Ask guests to RSVP
        </Toggle>
        <Toggle checked={x.rsvpMeal === true} onChange={(v) => set("rsvpMeal", v)}>
          Ask for a meal preference (veg / non-veg / Jain)
        </Toggle>
        <Toggle checked={x.blessings === true} onChange={(v) => set("blessings", v)}>
          Show the blessings wall
        </Toggle>

        <h4 className="wis-h4">Extras</h4>
        <div className="vs-row2">
          <Field label="Pre-wedding film (YouTube link)" htmlFor="wis-vid">
            <input id="wis-vid" className="vs-input" inputMode="url" value={s(x.videoUrl)} maxLength={200} placeholder="https://youtu.be/…" onChange={(e) => set("videoUrl", e.target.value.trim())} />
          </Field>
          <Field label="Wedding hashtag" htmlFor="wis-tag">
            <input id="wis-tag" className="vs-input" value={s(x.hashtag)} maxLength={40} placeholder="#AanyaWedsVihaan" onChange={(e) => set("hashtag", e.target.value)} />
          </Field>
        </div>
        <Field label="Closing line" htmlFor="wis-end" hint="As the jharokha closes at the very end.">
          <input id="wis-end" className="vs-input" value={mf.endLine} maxLength={90} placeholder="With love, the Sharma & Mehta families" onChange={(e) => updateMf("endLine", e.target.value)} />
        </Field>
        {password && (
          <Field label="Password (optional)" htmlFor="wis-pw" hint="Guests type it to open the invitation. Leave empty for no lock.">
            <input id="wis-pw" className="vs-input" value={password.value} maxLength={128} placeholder="e.g. the bride's nickname" autoComplete="off" onChange={(e) => password.set(e.target.value)} />
          </Field>
        )}

        <div className="wis-card wis-personal">
          <h4 className="wis-h4" style={{ marginTop: 0 }}>
            Send personal invites
          </h4>
          <p className="wis-hint">
            Each guest&apos;s link opens on “Dear <i>their name</i>, you are warmly invited” and fills in their RSVP name. {owner?.published ? "Paste your invitation link once (Share → Copy link)." : "Publish first, then paste your invitation link here."}
          </p>
          <Field label="Your invitation link" htmlFor="wis-link" error={link && !linkOk ? "Paste the full link, starting with https://" : undefined}>
            <input id="wis-link" className="vs-input" inputMode="url" value={link} placeholder="https://subhsandesh.in/…" onChange={(e) => saveLink(e.target.value)} />
          </Field>
          <Field label="Guest names (one per line)" htmlFor="wis-guests">
            <textarea id="wis-guests" className="vs-input vs-area" rows={3} value={guestList} placeholder={"Sharma family\nNani ji\nRohan & Priya"} onChange={(e) => setGuestList(e.target.value)} />
          </Field>
          {linkOk && guests.length > 0 && (
            <ul className="wis-links">
              {guests.map((g) => {
                const u = personalUrl(link.trim(), g);
                const msg = `Dear ${g}, you're invited to the wedding of ${coupleName} 🌸 Tap to open the jharokha:\n${u}`;
                return (
                  <li key={g}>
                    <span>{g}</span>
                    <a className="wis-mini is-wa" href={`https://wa.me/?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer">
                      WhatsApp
                    </a>
                    <button type="button" className="wis-mini" onClick={() => void copy(u)}>
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

const WIS_CSS = `
.wis { --wis-gold: #C99A6B; --wis-gold-soft: #EFD3CF; }
.wis-hint { margin: 2px 0 10px; font-size: 13px; line-height: 1.45; color: var(--vw-ink-soft, #86606A); }
.wis-err { margin: 4px 0 10px; font-size: 13px; line-height: 1.4; color: #B3261E; font-weight: 600; }
.wis-count { font-weight: 500; opacity: .6; }
.wis-sub { margin: 14px 0 6px; font-size: 13px; font-weight: 700; color: var(--vw-accent); }
.wis-head { align-items: center; }
.wis-medal { position: relative; flex: none; display: grid; place-items: center; width: 46px; height: 46px; border-radius: 50%; color: #8E3B52; background: radial-gradient(circle at 50% 35%, #FFF7F5, #F6D5D3); box-shadow: inset 0 0 0 1.5px var(--wis-gold), 0 6px 14px -8px rgba(110,40,58,.55); }
.wis-medal i { position: absolute; right: -4px; bottom: -4px; min-width: 20px; height: 20px; padding: 0 5px; border-radius: 999px; display: grid; place-items: center; font: 700 11px/1 var(--vw-font-ui); font-style: normal; color: #FFF8EC; background: var(--vw-accent); box-shadow: 0 0 0 2px var(--vw-paper); }
.wis-card { margin: 10px 0 14px; padding: 14px; border-radius: 18px; background: linear-gradient(180deg, #FFFCFA, #FCF0ED); box-shadow: inset 0 0 0 1.5px var(--wis-gold-soft); }
.wis-card .wis-sub { margin-top: 0; }
.wis-row3 { display: grid; gap: 0 10px; grid-template-columns: 1fr 1fr; }
.wis-row3 > :last-child:nth-child(3) { grid-column: 1 / -1; }
@media (min-width: 560px) { .wis-row3 { grid-template-columns: 1fr 1fr 1.4fr; } .wis-row3 > :last-child:nth-child(3) { grid-column: auto; } .wis-row3-tight { grid-template-columns: 1.3fr 1fr 1fr; } .wis-row3-story { grid-template-columns: 1fr 3fr; } .wis-row3-contact { grid-template-columns: 1.2fr 1fr 1.1fr; } }
.wis-ai { position: relative; margin: 6px 0 8px; padding: 22px 18px 18px; border-radius: 24px; background: radial-gradient(120% 90% at 0% 0%, #FFF7F5 0%, #FBE5E3 55%, #F6D3D1 100%); color: #4A2630; box-shadow: 0 18px 40px -26px rgba(110,40,58,.5); overflow: hidden; }
.wis-ai::before { content: ""; position: absolute; inset: 0; border-radius: inherit; padding: 1.5px; background: linear-gradient(110deg,#B4566E,#E7B7A6 35%,#FFF1EC 50%,#D79A8C 65%,#8E3B52); -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; }
.wis-ai-roses { position: absolute; right: -34px; top: -26px; width: 150px; height: auto; opacity: .95; pointer-events: none; transform: rotate(12deg); }
.wis-ai-k { position: relative; margin: 0; font: 700 11px/1 var(--vw-font-ui); letter-spacing: .22em; text-transform: uppercase; color: #9E4560; }
.wis-ai-h { position: relative; margin: 8px 0 4px; padding-right: 86px; font: 600 23px/1.2 var(--vw-font-serif); }
.wis-ai-p { position: relative; margin: 0 0 14px; padding-right: 40px; font-size: 14px; line-height: 1.5; color: #6A3A46; }
.wis-ai-in { position: relative; z-index: 1; background: #FFFEFD !important; min-height: 116px; font-size: 16px !important; line-height: 1.5 !important; }
.wis-ai-go { position: relative; z-index: 1; width: 100%; min-height: 52px; border: 0; border-radius: 999px; cursor: pointer; font: 700 16px/1 var(--vw-font-ui); color: #FFF7F5; background: linear-gradient(115deg, #8E3B52, #B4566E 52%, #CF8783); box-shadow: 0 12px 26px -12px rgba(110,40,58,.8); transition: transform .15s ease; }
.wis-ai-go.is-ghost { margin-top: 12px; color: #8E3B52; background: #fff; box-shadow: inset 0 0 0 1.5px #D9A9A8; }
.wis-ai-go:active { transform: scale(.98); }
.wis-ai-go:disabled { opacity: .75; cursor: progress; }
.wis-ai-alt { position: relative; display: flex; flex-wrap: wrap; justify-content: center; gap: 2px 14px; margin-top: 8px; }
.wis-ai-link { min-height: 44px; display: inline-flex; align-items: center; padding: 0 6px; border: 0; background: none; font: 600 14px/1.2 var(--vw-font-ui); color: #8E3B52; text-decoration: underline; text-decoration-color: rgba(142,59,82,.35); text-underline-offset: 3px; cursor: pointer; }
.wis-ai-free { position: relative; margin-top: 6px; }
.wis-ai-note { position: relative; margin: 10px 0 0; font-size: 13.5px; color: #B3261E; font-weight: 600; }
.wis-ai-note.is-ok { color: #2F7A45; }
.wis-chips, .wis-quick { position: relative; z-index: 1; display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; align-items: center; }
.wis-quick > span { font-size: 12px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; opacity: .6; }
.wis-chip { min-height: 40px; padding: 0 14px; border-radius: 999px; border: 1.5px solid var(--vw-edge); background: var(--vw-paper); color: var(--vw-paper-ink); font: 600 13px/1 var(--vw-font-ui); cursor: pointer; }
.wis-chip:hover { border-color: var(--vw-accent); }
.wis-seg { display: flex; gap: 6px; padding: 4px; margin: 0 0 12px; border-radius: 999px; background: var(--vw-soft); width: fit-content; max-width: 100%; }
.wis-seg button { min-height: 42px; padding: 0 14px; border: 0; border-radius: 999px; background: none; font: 600 13.5px/1 var(--vw-font-ui); color: var(--vw-paper-ink); cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 44vw; }
.wis-seg button[aria-checked=true] { background: var(--vw-accent); color: var(--vw-accent-ink); }
.wis-evs { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
.wis-ev { border: 1.5px solid var(--vw-edge); border-radius: 16px; background: var(--vw-paper); overflow: hidden; }
.wis-ev.is-open { border-color: var(--wis-gold); box-shadow: 0 12px 30px -22px rgba(110,40,58,.45); }
.wis-ev-top { display: flex; align-items: stretch; }
.wis-ev-head { flex: 1; min-width: 0; display: flex; align-items: center; gap: 12px; min-height: 60px; padding: 10px 6px 10px 14px; border: 0; background: none; text-align: left; cursor: pointer; color: var(--vw-paper-ink); }
.wis-ev-move { display: flex; align-items: center; gap: 2px; padding-right: 6px; }
.wis-ev-move button { width: 36px; height: 44px; border: 0; border-radius: 10px; background: none; font-size: 16px; color: var(--vw-accent); cursor: pointer; }
.wis-ev-move button:disabled { opacity: .25; cursor: default; }
.wis-ev-sw { flex: none; width: 22px; height: 22px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 0 1.5px var(--wis-gold); }
.wis-ev-t { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.wis-ev-t b { font: 600 17px/1.2 var(--vw-font-serif); }
.wis-ev-t small { font-size: 12.5px; opacity: .65; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.wis-ev-chev { font-size: 22px; line-height: 1; color: var(--vw-accent); width: 24px; text-align: center; }
.wis-ev-body { padding: 4px 14px 14px; border-top: 1px dashed var(--vw-edge); }
.wis-ev-tools, .wis-ch-tools { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.wis-ev-tools button, .wis-x { min-height: 40px; padding: 0 14px; border-radius: 999px; border: 1.5px solid var(--vw-edge); background: none; font: 600 13px/1 var(--vw-font-ui); color: var(--vw-paper-ink); cursor: pointer; }
.wis-ev-tools button:disabled { opacity: .35; cursor: default; }
.wis-ev-tools .is-danger, .wis-x { color: #B3261E; }
.wis-undo { margin: 10px 0 0; padding: 10px 14px; border-radius: 12px; background: #4A2630; color: #FFF6F4; font-size: 14px; display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.wis-undo button { border: 0; background: none; color: #F6C9CF; font: 700 14px/1 var(--vw-font-ui); min-height: 36px; cursor: pointer; }
.wis-sws { display: flex; flex-wrap: wrap; gap: 8px; margin: -8px 0 16px; }
.wis-sw { position: relative; width: 34px; height: 34px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 0 1.5px var(--vw-edge); cursor: pointer; padding: 0; }
.wis-sw[aria-checked=true] { box-shadow: 0 0 0 2.5px var(--vw-accent); }
.wis-sw-custom { background: conic-gradient(#f2c94c, #4f9b6a, #2e5aac, #7b3fa0, #e86a92, #a3122b, #f2c94c); overflow: hidden; }
.wis-sw-custom input { position: absolute; inset: 0; opacity: 0; width: 100%; height: 100%; cursor: pointer; }
.wis-letter { min-height: 200px; font-family: var(--vw-font-serif); font-size: 16px; line-height: 1.6; }
.wis-h4 { margin: 22px 0 6px; font: 700 12px/1 var(--vw-font-ui); letter-spacing: .14em; text-transform: uppercase; color: var(--vw-accent); }
.wis-story, .wis-contacts { list-style: none; margin: 0 0 10px; padding: 0; display: grid; gap: 12px; }
.wis-ch, .wis-contact { padding: 12px; border: 1.5px solid var(--vw-edge); border-radius: 16px; background: var(--vw-paper); }
.wis-thing { margin-bottom: 8px; }
.wis-tog { display: flex; gap: 12px; align-items: center; min-height: 46px; font-size: 14.5px; cursor: pointer; }
.wis-tog input { position: absolute; opacity: 0; width: 1px; height: 1px; }
.wis-tog-ui { position: relative; flex: none; width: 42px; height: 24px; border-radius: 999px; background: var(--vw-edge); transition: background .2s ease; }
.wis-tog-ui::after { content: ""; position: absolute; left: 3px; top: 3px; width: 18px; height: 18px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.25); transition: transform .2s ease; }
.wis-tog input:checked + .wis-tog-ui { background: var(--vw-accent); }
.wis-tog input:checked + .wis-tog-ui::after { transform: translateX(18px); }
.wis-tog input:focus-visible + .wis-tog-ui { outline: 2px solid var(--wis-gold); outline-offset: 2px; }
.wis-pick { margin: 0 0 14px; }
.wis-pick-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.wis-pick-btn { display: inline-flex; align-items: center; gap: 10px; min-height: 50px; padding: 4px 14px 4px 4px; border-radius: 14px; border: 1.5px dashed var(--vw-edge); background: var(--vw-paper); color: var(--vw-paper-ink); font: 600 13px/1.2 var(--vw-font-ui); cursor: pointer; }
.wis-pick-btn img, .wis-pick-btn > span:first-child { width: 42px; height: 42px; border-radius: 10px; object-fit: cover; display: grid; place-items: center; background: var(--vw-soft); font-size: 18px; }
.wis-pick-btn.is-round { border-radius: 999px; }
.wis-pick-btn.is-round img, .wis-pick-btn.is-round > span:first-child { border-radius: 50%; }
.wis-frame { display: inline-flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 14px; border-radius: 999px; border: 0; background: var(--vw-soft); color: var(--vw-accent); font: 700 13px/1 var(--vw-font-ui); cursor: pointer; }
.wis-pick-strip { display: flex; gap: 8px; overflow-x: auto; padding: 10px 2px 6px; scroll-snap-type: x proximity; }
.wis-pick-th, .wis-pick-none { flex: none; width: 64px; height: 64px; border-radius: 12px; border: 2px solid transparent; padding: 0; overflow: hidden; background: var(--vw-soft); cursor: pointer; scroll-snap-align: start; font: 600 12px/1 var(--vw-font-ui); color: var(--vw-paper-ink); }
.wis-pick-th img { width: 100%; height: 100%; object-fit: cover; display: block; }
.wis-pick-th.is-on, .wis-pick-none.is-on { border-color: var(--vw-accent); }
.wis-dash { margin: 4px 0 12px; border: 1.5px solid var(--wis-gold); border-radius: 16px; padding: 0 14px; background: var(--vw-paper); }
.wis-dash > summary { min-height: 52px; display: flex; gap: 8px; align-items: center; font: 700 15px/1 var(--vw-font-ui); cursor: pointer; color: var(--vw-accent); }
.wis-personal .vs-field:last-of-type { margin-bottom: 6px; }
.wis-links { list-style: none; margin: 8px 0 0; padding: 0; display: grid; gap: 8px; }
.wis-links li { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 12px; background: var(--vw-paper); box-shadow: inset 0 0 0 1px var(--vw-edge); }
.wis-links li > span { flex: 1; min-width: 0; font-weight: 600; font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.wis-mini { display: inline-flex; align-items: center; min-height: 36px; padding: 0 12px; border-radius: 999px; border: 1.5px solid var(--vw-edge); background: none; font: 600 12.5px/1 var(--vw-font-ui); color: var(--vw-paper-ink); text-decoration: none; cursor: pointer; }
.wis-mini.is-wa { border-color: #1FA855; color: #fff; background: #1FA855; }
`;
