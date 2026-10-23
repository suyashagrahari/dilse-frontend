"use client";

// ─── Wedding Invitation ✦ Premium — the editor (the whole form) ──────────────
//
// On top, "✦ Let AI write it": the primary button asks eight quick questions
// (GuidedWedding) and the AI writes the whole invitation, then a review screen
// lists every line it wrote, editable in place; "or describe it in your own
// words" keeps a free-text box. Then eight steps, each a <section
// id="vs-sec-<id>"> so the sheet's chip rail (phones) / side nav (desktop) and
// Save's "jump to the gap" work:
//   The couple · Functions · Photos · Invitation · Story & families ·
//   Guest info · Look & music · RSVP & send.
//
// Every stored key of pages published before the rebuild is edited in place
// (order, motif, hindi, date, time, city, brideParents, groomParents, faqs,
// story.text); new keys are written only when the sender touches them.

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { MasonryEditor, RsvpDashboard } from "../../../_wedding";
import { LIGHT_THEMES } from "../../../_wedding/themes";
import { compressImage } from "../../../dedication/components/mediaUploads";
import MusicPicker from "../../../_valentine/editor/MusicPicker";
import PhotoCropper, { clampCrop, type Crop } from "../../../_valentine/editor/PhotoCropper";
import { API_URL } from "@/lib/config";
import type { StudioProps } from "../../../_valentine/editor/studios";
import type { LovePhoto } from "../../../_valentine/types";
import { DEMO_EVENTS, DEMO_FAQS, DEMO_STORY, WP_LIMITS, WP_THEME_LABELS, newEventId, presetFor, weddingPremiumDay, wpLocalUrl, wpStoredUrl } from "../../../_valentine/days/wedding-invitation-premium";
import { MAIN_RE, isUpiId, lightTheme, normalisePhone, swatchFor } from "../wp/model";
import { personalLink } from "../wp/guest";
import GuidedWedding, { type WeddingAnswers } from "./GuidedWedding";

const SLUG = "wedding-invitation-premium";
type Row = Record<string, unknown>;
type Chapter = { when: string; title: string; text: string; photo: number };
type Faq = { title: string; text: string };
type Contact = { name: string; relation: string; phone: string };

const DEMO = weddingPremiumDay.demo;
const DX = DEMO.extras as Row;

const QUICK_FUNCTIONS = ["Roka", "Haldi", "Mehendi", "Sangeet", "Baraat", "Wedding", "Cocktail", "Reception"];
const SWATCHES = ["#F2C94C", "#4F9B6A", "#E86A92", "#A3122B", "#7B3FA0", "#2E5AAC", "#EE8A2E", "#F3EBDD", "#1C1C24", "#C9A24A"];
const MOTIFS: { id: string; label: string; hint: string }[] = [
  { id: "ganesha", label: "Shri Ganesh", hint: "॥ श्री गणेशाय नमः ॥ on the doors and the invitation" },
  { id: "lotus", label: "Lotus", hint: "A pink lotus (Sikh, Jain, or simply Indian)" },
  { id: "rings", label: "Rings", hint: "Two rings (Christian, court or civil)" },
  { id: "none", label: "None", hint: "No religious symbol" },
];
/** PhotoCropper renders in a portal (outside the sheet), so it gets the palette explicitly. */
const CROP_THEME = {
  "--vw-accent": "#3E6A8A",
  "--vw-accent-deep": "#284D69",
  "--vw-accent-ink": "#FFFDF6",
  "--vw-edge": "#D9CBA6",
  "--vw-paper": "#FFFEFB",
  "--vw-paper-ink": "#1F3346",
  "--vw-soft": "#E8F1F7",
} as CSSProperties;

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
        {count && <small className="wps-count">{count}</small>}
      </label>
      {children}
      {hint && <p className="wps-hint">{hint}</p>}
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
function PhotoPick({ value, photos, onPick, onUpload, onFrame, label }: { value: number; photos: LovePhoto[]; onPick: (k: number) => void; onUpload: (f: File) => void; onFrame: (k: number, c: Crop) => void; label: string }) {
  const [open, setOpen] = useState(false);
  const [framing, setFraming] = useState(false);
  const cur = value >= 1 && value <= photos.length ? photos[value - 1] : null;
  const file = useRef<HTMLInputElement>(null);
  const crop: Crop = clampCrop({ x: cur?.cropX ?? 50, y: cur?.cropY ?? 50, scale: cur?.scale ?? 100 });
  return (
    <div className="wps-pick">
      <div className="wps-pick-row">
        <button type="button" className="wps-pick-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          {cur ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cur.url} alt="" style={{ objectPosition: `${crop.x}% ${crop.y}%` }} />
          ) : (
            <span aria-hidden>＋</span>
          )}
          <span>{cur ? `${label}: photo ${value}` : `${label}: add a photo`}</span>
        </button>
        {cur && (
          <button type="button" className="wps-frame-btn" onClick={() => setFraming(true)}>
            ✥ Frame &amp; zoom
          </button>
        )}
      </div>
      {cur && (
        <PhotoCropper open={framing} src={cur.url} crop={crop} aspect={0.8} title={`${label}: drag to move, pinch or slide to zoom`} themeStyle={CROP_THEME} onChange={(c) => onFrame(value, c)} onClose={() => setFraming(false)} />
      )}
      {open && (
        <div className="wps-pick-strip" role="listbox" aria-label={label}>
          <button type="button" className={`wps-pick-none${value === 0 ? " is-on" : ""}`} onClick={() => { onPick(0); setOpen(false); }}>
            None
          </button>
          <button type="button" className="wps-pick-none" onClick={() => file.current?.click()} disabled={photos.length >= WP_LIMITS.photos}>
            Upload
          </button>
          {photos.map((p, i) => (
            <button key={i} type="button" role="option" aria-selected={value === i + 1} className={`wps-pick-th${value === i + 1 ? " is-on" : ""}`} onClick={() => { onPick(i + 1); setOpen(false); }} aria-label={`Photo ${i + 1}`}>
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

/** The three terrace palettes as the guest page paints them. */
const SW: Record<string, { bg: string; ink: string; accent: string; blurb: string }> = {
  powder: { bg: "linear-gradient(170deg, #DCEBF6, #FFFEFA 70%)", ink: "#284D69", accent: "#3E6A8A", blurb: "Powder-blue sky, ivory and champagne gold" },
  champagne: { bg: "linear-gradient(170deg, #F6EEDC, #FFFEFA 70%)", ink: "#5E4517", accent: "#8A6A2A", blurb: "Ivory paper and warm gold" },
  blush: { bg: "linear-gradient(170deg, #FBE3EA, #FFFEFA 70%)", ink: "#8C3550", accent: "#A84E69", blurb: "Flamingo blush with gold" },
};
function ThemeCards({ value, onChange, sample }: { value: string; onChange: (id: string) => void; sample: string }) {
  return (
    <div className="wps-themes" role="radiogroup" aria-label="Theme">
      {LIGHT_THEMES.map((id) => {
        const sw = SW[id];
        if (!sw) return null;
        const on = value === id;
        return (
          <button key={id} type="button" role="radio" aria-checked={on} className={`wps-theme${on ? " is-on" : ""}`} onClick={() => onChange(id)}>
            <span className="wps-theme-card" style={{ background: sw.bg }}>
              <span className="wps-theme-door" aria-hidden />
              <span className="wps-theme-names" style={{ color: sw.ink }}>
                {sample}
              </span>
              <span className="wps-theme-bar" style={{ background: sw.accent }} />
            </span>
            <b>{WP_THEME_LABELS[id] ?? id}</b>
            <small>{sw.blurb}</small>
          </button>
        );
      })}
    </div>
  );
}

export default function WeddingPremiumStudio({ mf, updateMf, updateExtra, ai, password, owner }: StudioProps) {
  const x = mf.extras as Row;
  const events = useMemo(() => (Array.isArray(x.events) ? (x.events as Row[]) : []), [x.events]);
  const story = useMemo(() => (Array.isArray(x.story) ? (x.story as Chapter[]) : []), [x.story]);
  const faqs = useMemo(() => (Array.isArray(x.faqs) ? (x.faqs as Faq[]) : []), [x.faqs]);
  const contacts = useMemo(() => (Array.isArray(x.contacts) ? (x.contacts as Contact[]) : []), [x.contacts]);
  const photos = useMemo(() => mf.photos.map((p) => (wpLocalUrl(p.url) === p.url ? p : { ...p, url: wpLocalUrl(p.url) })), [mf.photos]);
  const set = updateExtra;
  const latest = useRef(mf);
  useLayoutEffect(() => {
    latest.current = mf;
  });

  // ── Every function keeps a stable id (RSVPs refer to it) ──────────────────
  useEffect(() => {
    const taken: string[] = [];
    let changed = false;
    const next = events.map((e) => {
      let id = s(e.id).trim();
      if (!id || taken.includes(id)) {
        id = newEventId(s(e.title), taken);
        changed = true;
      }
      taken.push(id);
      return id === e.id ? e : { ...e, id };
    });
    if (changed) set("events", next);
  }, [events, set]);

  // ── Undo for removals (6 s) ────────────────────────────────────────────────
  const [undo, setUndo] = useState<{ label: string; run: () => void } | null>(null);
  useEffect(() => {
    if (!undo) return;
    const t = window.setTimeout(() => setUndo(null), 6000);
    return () => window.clearTimeout(t);
  }, [undo]);
  const removeWithUndo = (label: string, key: string, list: unknown[], i: number) => {
    const before = list;
    set(key, list.filter((_, j) => j !== i));
    setUndo({ label, run: () => set(key, before) });
  };

  // ── AI ─────────────────────────────────────────────────────────────────────
  const fill = ai?.fill;
  const [guided, setGuided] = useState(false);
  const [freeOpen, setFreeOpen] = useState(false);
  const [desc, setDesc] = useState("");
  const [tooShort, setTooShort] = useState(false);
  const [ranFree, setRanFree] = useState(false);
  const runFree = () => {
    if (!fill || fill.generating) return;
    const text = desc.trim();
    setTooShort(text.length < 20);
    if (text.length < 20) return;
    setRanFree(true);
    fill.generateGuided({ people: { userName: "", partnerName: "", bestFriendName: "", partnerPronouns: "" }, story: text, hints: { occasion: "wedding" } });
  };

  // After ANY fill lands (guided or free text): clear what is still the demo couple's
  // (venues, story, families, contacts, notes) and tidy times. Keyed off the fill
  // result itself, so it runs once per fill whichever button started it.
  const lastFill = useRef<string[] | null>(null);
  useEffect(() => {
    if (!fill || fill.generating || fill.mode !== "done" || !fill.filled.length) return;
    if (lastFill.current === fill.filled) return;
    lastFill.current = fill.filled;
    const filled = new Set(fill.filled);
    const touched = (prefix: string) => [...filled].some((p) => p.startsWith(prefix));
    const cur = latest.current.extras as Row;
    const dEvents = DEMO_EVENTS as unknown as Row[];
    const evs = (Array.isArray(cur.events) ? (cur.events as Row[]) : [])
      .map((e, i) => {
        if (!touched(`extras.events[${i}]`)) return e;
        const d = dEvents[i] ?? {};
        const out: Row = { ...e };
        for (const k of ["endTime", "address", "mapUrl", "dressCode", "dressColor", "note", "venue", "time"]) if (!filled.has(`extras.events[${i}].${k}`) && s(e[k]) && s(e[k]) === s(d[k])) out[k] = "";
        if (!filled.has(`extras.events[${i}].title`) && s(e.title) === s(d.title)) out.title = i === 0 ? "Wedding" : "";
        // Fill the dress code, colour, note and a start time from the function's name when the AI left them out.
        const p = presetFor(s(out.title), cur.motif);
        if (p) {
          if (!s(out.dressCode)) out.dressCode = p.dressCode;
          if (!s(out.dressColor)) out.dressColor = p.dressColor;
          if (!s(out.note)) out.note = p.note;
          if (!s(out.time)) out.time = p.time;
        }
        return out;
      })
      .filter((e, i) => touched(`extras.events[${i}]`) || !same(e, dEvents[i], ["title", "venue", "date"]))
      .filter((e) => s(e.title) || s(e.venue) || s(e.date));
    const tidied: Row[] = (evs.length ? evs : (cur.events as Row[])).map((e): Row => ({ ...e, time: toHHMM(s(e.time)), endTime: toHHMM(s(e.endTime)) }));
    // Functions run in date order on the page (the model sometimes keeps the description's order).
    if (tidied.every((e) => /^\d{4}-\d{2}-\d{2}$/.test(s(e.date)))) tidied.sort((a, b) => `${s(a.date)}T${s(a.time) || "00:00"}`.localeCompare(`${s(b.date)}T${s(b.time) || "00:00"}`));
    set("events", tidied);
    // The model transliterates the names well but garbles the stock Hindi sentence around them
    // (असीम → आसिम, सपरिवार → स्परिवार…): keep its two names, set them in the correct sentence.
    const hm = s(cur.hindiMessage);
    if (touched("extras.hindiMessage") && hm) {
      const names = hm.match(/([\u0900-\u097F]+)\s+और\s+([\u0900-\u097F]+)\s+के\s+(?:शुभ\s+)?विवाह/);
      if (names) {
        const hindu = ["ganesha", "lotus"].includes(s(cur.motif) || "ganesha");
        set("hindiMessage", hindu ? `ईश्वर की असीम कृपा और बड़ों के आशीर्वाद से, ${names[1]} और ${names[2]} के शुभ विवाह के पावन अवसर पर आप सपरिवार सादर आमंत्रित हैं।` : `${names[1]} और ${names[2]} के विवाह समारोह में आप सपरिवार सादर आमंत्रित हैं।`);
      }
    }
    const dStory = DEMO_STORY as unknown as Row[];
    const st = (Array.isArray(cur.story) ? (cur.story as Row[]) : [])
      .map((c, i) => {
        if (!touched(`extras.story[${i}]`)) return c;
        const d = dStory[i] ?? {};
        const out = { ...c };
        for (const k of ["when", "title", "text"]) if (!filled.has(`extras.story[${i}].${k}`) && s(c[k]) && s(c[k]) === s(d[k])) out[k] = "";
        // The demo couple's photo is not theirs.
        if (n(c.photo) && n(c.photo) === n(d.photo)) out.photo = 0;
        return out;
      })
      .filter((c, i) => touched(`extras.story[${i}]`) || !same(c, dStory[i], ["title", "text"]))
      .filter((c) => s(c.title) || s(c.text));
    // The model writes a "how they met" moment even when the description tells none; with no
    // sign of one in what was sent, the story stays empty instead of invented.
    const told = /\b(met|meet|meeting|mile|mila|mili|introduced|propos\w*|college|school|dating|friends since|first saw|childhood)\b/i.test(fill.story ?? "");
    set("story", told ? st : st.filter((c, i) => !touched(`extras.story[${i}]`)));
    if (JSON.stringify(cur.faqs) === JSON.stringify(DEMO_FAQS)) set("faqs", []);
    const dContacts = (DX.contacts ?? []) as Row[];
    set("contacts", (Array.isArray(cur.contacts) ? (cur.contacts as Row[]) : []).filter((c, i) => !same(c, dContacts[i], ["name", "phone"])));
    for (const k of ["brideParents", "groomParents", "brideNote", "groomNote", "blessingsOf", "muhurat", "hashtag", "gettingThere", "hindiMessage", "city"] as const) {
      if (!touched(`extras.${k}`) && cur[k] === DX[k]) set(k, "");
    }
    const L = latest.current.letter;
    if (/<[^>]+>/.test(L)) updateMf("letter", plain(L));
    if (!filled.has("endLine") && latest.current.endLine === DEMO.endLine) updateMf("endLine", "");
    // A hashtag from the two names when there is none.
    const b = latest.current.recipientName.trim().split(/\s+/)[0];
    const g = latest.current.senderName.trim().split(/\s+/)[0];
    if (b && g && (!s(cur.hashtag) || cur.hashtag === DX.hashtag)) set("hashtag", `#${b}Weds${g}`.replace(/[^#\w]/g, "").slice(0, 32));
  }, [fill, fill?.generating, fill?.mode, fill?.filled, set, updateMf]);

  /** The facts typed into the guided questions win over anything the model wrote. */
  const applyAnswers = useCallback(
    (a: WeddingAnswers) => {
      if (a.bride.trim()) updateMf("recipientName", a.bride.trim().slice(0, 30));
      if (a.groom.trim()) updateMf("senderName", a.groom.trim().slice(0, 30));
      set("order", a.first);
      if (/^\d{4}-\d{2}-\d{2}$/.test(a.date)) set("date", a.date);
      if (/^\d{2}:\d{2}$/.test(a.time)) set("time", a.time);
      if (a.city.trim()) set("city", a.city.trim().slice(0, 40));
      if (a.brideParents.trim()) set("brideParents", a.brideParents.trim().slice(0, 90));
      if (a.groomParents.trim()) set("groomParents", a.groomParents.trim().slice(0, 90));
      if (a.blessingsOf.trim()) set("blessingsOf", a.blessingsOf.trim().slice(0, 160));
      if (a.language === "hi") set("lang", "hi");
      if (a.tone === "faith" || a.tone === "fun") {
        /* tone shapes the words only */
      }
      if (a.contactName.trim() && normalisePhone(a.contactPhone)) set("contacts", [{ name: a.contactName.trim().slice(0, 40), relation: a.contactRelation.trim().slice(0, 40), phone: a.contactPhone.trim().slice(0, 20) }]);
    },
    [set, updateMf],
  );

  const freeNote: { ok: boolean; text: string } | null = tooShort
    ? { ok: false, text: "A line or two more, please: names, the date and where." }
    : !ranFree || !fill || fill.generating
      ? null
      : fill.error
        ? { ok: false, text: fill.mode === "done" ? fill.error : "That didn't work. Try again, or fill the form yourself." }
        : fill.mode === "done"
          ? { ok: true, text: "Done. Read it through below and change anything you like." }
          : null;

  // ── Photos: one pool; photo 1 is the cover; story chapters point into it ──
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
      const st = (Array.isArray(cur.story) ? (cur.story as Chapter[]) : []).map((c) => ({ ...c, photo: where(n(c.photo)) }));
      if (st.some((c, i) => c.photo !== n((cur.story as Chapter[])[i]?.photo))) set("story", st);
    },
    [set],
  );
  const setPhotos = (next: LovePhoto[]) => {
    const prev = latest.current.photos;
    const capped = next.slice(0, WP_LIMITS.photos).map((p) => (wpStoredUrl(p.url) === p.url ? p : { ...p, url: wpStoredUrl(p.url) }));
    updateMf("photos", capped);
    remapRefs(prev, capped);
  };
  const uploadTo = async (f: File, apply: (k: number) => void) => {
    try {
      const url = await compressImage(f);
      const size = await measure(url);
      const cur = latest.current.photos;
      if (cur.length >= WP_LIMITS.photos) return;
      const p: LovePhoto = { url, cropX: 50, cropY: 40, ...(size ? { w: size.w, h: size.h } : {}) };
      updateMf("photos", [...cur, p]);
      apply(cur.length + 1);
    } catch {
      /* compressImage explains itself in the photos section */
    }
  };
  const frame = (k: number, c: Crop) => {
    const cur = latest.current.photos;
    if (k < 1 || k > cur.length) return;
    updateMf("photos", cur.map((p, i) => (i === k - 1 ? { ...p, cropX: Math.round(c.x), cropY: Math.round(c.y), scale: Math.round(c.scale) } : p)));
  };
  const [coverFraming, setCoverFraming] = useState(false);
  const cover = photos[0];
  const coverCrop: Crop = clampCrop({ x: cover?.cropX ?? 50, y: cover?.cropY ?? 50, scale: cover?.scale ?? 100 });
  const coverFile = useRef<HTMLInputElement>(null);
  const replaceCover = async (f: File) => {
    try {
      const url = await compressImage(f);
      const size = await measure(url);
      const cur = latest.current.photos;
      const p: LovePhoto = { url, cropX: 50, cropY: 40, ...(size ? { w: size.w, h: size.h } : {}) };
      // The new cover goes first; the old one stays in the gallery.
      setPhotos([p, ...cur].slice(0, WP_LIMITS.photos));
    } catch {
      /* ignore */
    }
  };

  // ── Personal links (?to=): the published link, read from the owner's page ──
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [guestName, setGuestName] = useState("");
  const [linkFlash, setLinkFlash] = useState(false);
  useEffect(() => {
    const id = owner?.pageId;
    const tok = owner?.token;
    if (!id || !tok || !owner?.published) return;
    let alive = true;
    fetch(`${API_URL}/${SLUG}-pages/${id}`, { headers: { Authorization: `Bearer ${tok}` } })
      .then((r) => r.json())
      .then((j) => {
        if (alive && j?.data?.shareUrl) setShareUrl(String(j.data.shareUrl));
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [owner?.pageId, owner?.token, owner?.published]);
  const guestLink = shareUrl ? personalLink(shareUrl, guestName) : "";

  // ── Functions ──────────────────────────────────────────────────────────────
  const setEvent = (i: number, k: string, v: string) => set("events", events.map((e, j) => (j === i ? { ...e, [k]: v } : e)));
  const [openEv, setOpenEv] = useState<number | null>(null);
  const addEvent = (name?: string) => {
    if (events.length >= WP_LIMITS.events) return;
    const p = name ? presetFor(name, x.motif) : null;
    const taken = events.map((e) => s(e.id));
    const last = events[events.length - 1];
    set("events", [
      ...events,
      { id: newEventId(name || "event", taken), title: name ?? "", date: s(last?.date), time: p?.time ?? "", endTime: "", venue: s(last?.venue), address: s(last?.address), mapUrl: "", dressCode: p?.dressCode ?? "", dressColor: p?.dressColor ?? "", note: p?.note ?? "" },
    ]);
    setOpenEv(events.length);
  };
  const dupEvent = (i: number) => {
    if (events.length >= WP_LIMITS.events) return;
    const e = events[i];
    const taken = events.map((q) => s(q.id));
    const next = [...events];
    next.splice(i + 1, 0, { ...e, id: newEventId(`${s(e.title)}-copy`, taken) });
    set("events", next);
    setOpenEv(i + 1);
  };
  const moveEvent = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= events.length) return;
    const next = [...events];
    [next[i], next[j]] = [next[j], next[i]];
    set("events", next);
    setOpenEv(j);
  };
  const mainIdx = Math.max(0, events.findIndex((e) => MAIN_RE.test(s(e.title))));

  const pageId = owner?.pageId ?? null;
  const token = owner?.token ?? null;
  const letter = mf.letter;
  const hindi = s(x.hindiMessage);
  const theme = lightTheme(x.theme);
  const bilingual = x.hindi !== false;
  const mapBad = (u: string) => !!u && !/^https:\/\/((www\.)?google\.[a-z.]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps|maps\.google\.[a-z.]+)/i.test(u);

  return (
    <div className="rs wps">
      <style>{WPS_CSS}</style>

      {pageId && token && (
        <details className="wps-dash">
          <summary>Guest replies &amp; blessings</summary>
          <RsvpDashboard slug={SLUG} pageId={pageId} token={token} csvName="wedding-rsvps" />
        </details>
      )}

      {ai?.available && fill && (
        <section className="wps-ai" aria-labelledby="wps-ai-h">
          <p className="wps-ai-k">✦ Let AI write it</p>
          <h3 className="wps-ai-h" id="wps-ai-h">
            Answer 8 quick questions. We&apos;ll write the whole invitation.
          </h3>
          <p className="wps-ai-p">Names, date, functions, families, your story. Then you check every line it wrote and change anything.</p>
          <button type="button" className="wps-ai-go" onClick={() => setGuided(true)} disabled={fill.generating || !fill.schema}>
            {fill.generating ? "Writing your invitation…" : "✦ Answer the questions"}
          </button>
          <div className="wps-ai-row">
            <button type="button" className="wps-ai-link" aria-expanded={freeOpen} onClick={() => setFreeOpen((o) => !o)}>
              {freeOpen ? "Hide" : "or describe it in your own words"}
            </button>
            <a className="wps-ai-link" href="#vs-sec-names">
              I&apos;ll fill it myself ↓
            </a>
          </div>
          {freeOpen && (
            <div className="wps-ai-free">
              <textarea
                className="vs-input vs-area wps-ai-in"
                rows={4}
                value={desc}
                maxLength={1500}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Ishita and Aarav are getting married on 13 Feb 2027 at the Oberoi Udaivilas, Udaipur. Mehendi on the 11th, haldi and sangeet on the 12th, reception on the 14th. We met at a bus stop in Bengaluru in 2017. Keep it warm, and add a Hindi line."
                aria-label="Describe your wedding"
              />
              <button type="button" className="wps-ai-go is-sm" onClick={runFree} disabled={fill.generating}>
                {fill.generating ? "Writing…" : "Write it from this"}
              </button>
              {freeNote && (
                <p className={`wps-ai-note${freeNote.ok ? " is-ok" : ""}`} role="status">
                  {freeNote.text}
                </p>
              )}
            </div>
          )}
          <GuidedWedding open={guided} fill={fill} onClose={() => setGuided(false)} onApplied={applyAnswers} />
        </section>
      )}

      {/* ── 1 The couple ───────────────────────────────────────────────── */}
      <section className="vs-sec" id="vs-sec-names" aria-label="The couple">
        <Head n={1} title="The couple" sub="Names as you'd like them printed, and the big day." />
        <div className="vs-row2">
          <Field label="Bride's name" htmlFor="wps-bride">
            <input id="wps-bride" className="vs-input" value={mf.recipientName} maxLength={30} placeholder="e.g. Ishita" onChange={(e) => updateMf("recipientName", e.target.value)} />
          </Field>
          <Field label="Groom's name" htmlFor="wps-groom">
            <input id="wps-groom" className="vs-input" value={mf.senderName} maxLength={30} placeholder="e.g. Aarav" onChange={(e) => updateMf("senderName", e.target.value)} />
          </Field>
        </div>
        <div className="wps-seg" role="radiogroup" aria-label="Show names as">
          {(["bride", "groom"] as const).map((o) => {
            const a = o === "bride" ? mf.recipientName || "Bride" : mf.senderName || "Groom";
            const b = o === "bride" ? mf.senderName || "Groom" : mf.recipientName || "Bride";
            return (
              <button key={o} type="button" role="radio" aria-checked={(x.order ?? "bride") === o} onClick={() => set("order", o)}>
                {a} &amp; {b}
              </button>
            );
          })}
        </div>
        <p className="wps-sub">The big day · the countdown and the calendar invites use it</p>
        <div className="wps-row3">
          <Field label="Wedding date" htmlFor="wps-date">
            <input id="wps-date" type="date" className="vs-input" value={s(x.date)} onChange={(e) => set("date", e.target.value)} />
          </Field>
          <Field label="Time" htmlFor="wps-time">
            <input id="wps-time" type="time" className="vs-input" value={s(x.time)} onChange={(e) => set("time", e.target.value)} />
          </Field>
          <Field label="City" htmlFor="wps-city">
            <input id="wps-city" className="vs-input" value={s(x.city)} maxLength={40} placeholder="e.g. Udaipur" onChange={(e) => set("city", e.target.value)} />
          </Field>
        </div>
        <Field label="Muhurat (optional)" htmlFor="wps-muh" hint="Printed under the date, e.g. “Shubh muhurat 8:40 pm”.">
          <input id="wps-muh" className="vs-input" value={s(x.muhurat)} maxLength={60} placeholder="e.g. Shubh muhurat 8:40 pm" onChange={(e) => set("muhurat", e.target.value)} />
        </Field>
        <p className="wps-sub">Blessing on the doors</p>
        <div className="wps-chiprow" role="radiogroup" aria-label="Blessing on the doors">
          {MOTIFS.map((m) => (
            <button key={m.id} type="button" role="radio" aria-checked={(s(x.motif) || "ganesha") === m.id} className="wps-chip" title={m.hint} onClick={() => set("motif", m.id)}>
              {m.label}
            </button>
          ))}
        </div>
      </section>

      {/* ── 2 Functions ────────────────────────────────────────────────── */}
      <section className="vs-sec" id="vs-sec-details" aria-label="Functions">
        <Head n={2} title="Functions" sub={`Up to ${WP_LIMITS.events}. Each gets its own map, timings, dress code and calendar button.`} />
        <ol className="wps-evs">
          {events.map((e, i) => {
            const isOpen = openEv === i;
            const sw = swatchFor({ dressCode: s(e.dressCode), dressColor: s(e.dressColor) });
            return (
              <li key={s(e.id) || i} className={`wps-ev${isOpen ? " is-open" : ""}`}>
                <button type="button" className="wps-ev-head" onClick={() => setOpenEv(isOpen ? null : i)} aria-expanded={isOpen}>
                  <span className="wps-ev-sw" style={{ background: sw || "transparent" }} aria-hidden />
                  <span className="wps-ev-t">
                    <b>
                      {s(e.title) || "New function"}
                      {i === mainIdx && MAIN_RE.test(s(e.title)) ? " ✦" : ""}
                    </b>
                    <small>{[s(e.date), s(e.time), s(e.venue)].filter(Boolean).join(" · ") || "Tap to fill in"}</small>
                  </span>
                  <span className="wps-ev-chev" aria-hidden>
                    {isOpen ? "–" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <div className="wps-ev-body">
                    <Field label="Name" htmlFor={`wps-e${i}-t`}>
                      <input id={`wps-e${i}-t`} className="vs-input" value={s(e.title)} maxLength={30} placeholder="e.g. Sangeet" onChange={(ev) => setEvent(i, "title", ev.target.value)} />
                    </Field>
                    <div className="wps-row3 wps-row3-tight">
                      <Field label="Date" htmlFor={`wps-e${i}-d`}>
                        <input id={`wps-e${i}-d`} type="date" className="vs-input" value={s(e.date)} onChange={(ev) => setEvent(i, "date", ev.target.value)} />
                      </Field>
                      <Field label="Starts" htmlFor={`wps-e${i}-s`}>
                        <input id={`wps-e${i}-s`} type="time" className="vs-input" value={s(e.time)} onChange={(ev) => setEvent(i, "time", ev.target.value)} />
                      </Field>
                      <Field label="Ends" htmlFor={`wps-e${i}-e`}>
                        <input id={`wps-e${i}-e`} type="time" className="vs-input" value={s(e.endTime)} onChange={(ev) => setEvent(i, "endTime", ev.target.value)} />
                      </Field>
                    </div>
                    <div className="vs-row2">
                      <Field label="Venue" htmlFor={`wps-e${i}-v`}>
                        <input id={`wps-e${i}-v`} className="vs-input" value={s(e.venue)} maxLength={80} placeholder="e.g. The Oberoi Udaivilas" onChange={(ev) => setEvent(i, "venue", ev.target.value)} />
                      </Field>
                      <Field label="Address" htmlFor={`wps-e${i}-a`}>
                        <input id={`wps-e${i}-a`} className="vs-input" value={s(e.address)} maxLength={140} placeholder="Street, city" onChange={(ev) => setEvent(i, "address", ev.target.value)} />
                      </Field>
                    </div>
                    <Field
                      label="Google Maps link (optional)"
                      htmlFor={`wps-e${i}-m`}
                      hint={mapBad(s(e.mapUrl)) ? <span className="wps-err">Paste the share link from Google Maps (maps.app.goo.gl/…).</span> : "Empty: guests get a search for the venue and address."}
                    >
                      <input id={`wps-e${i}-m`} className="vs-input" inputMode="url" value={s(e.mapUrl)} maxLength={300} placeholder="https://maps.app.goo.gl/…" aria-invalid={mapBad(s(e.mapUrl))} onChange={(ev) => setEvent(i, "mapUrl", ev.target.value.trim())} />
                    </Field>
                    <Field label="Dress code" htmlFor={`wps-e${i}-dc`}>
                      <input id={`wps-e${i}-dc`} className="vs-input" value={s(e.dressCode)} maxLength={50} placeholder="e.g. Shades of yellow" onChange={(ev) => setEvent(i, "dressCode", ev.target.value)} />
                    </Field>
                    <div className="wps-sws" role="radiogroup" aria-label="Dress-code colour">
                      {SWATCHES.map((c) => (
                        <button key={c} type="button" role="radio" aria-checked={s(e.dressColor).toLowerCase() === c.toLowerCase()} aria-label={c} className="wps-sw" style={{ background: c }} onClick={() => setEvent(i, "dressColor", c)} />
                      ))}
                      <label className="wps-sw wps-sw-custom" aria-label="Custom colour">
                        <input type="color" value={/^#[0-9a-f]{6}$/i.test(s(e.dressColor)) ? s(e.dressColor) : "#c9a24a"} onChange={(ev) => setEvent(i, "dressColor", ev.target.value)} />
                      </label>
                    </div>
                    <Field label="A line for guests (optional)" htmlFor={`wps-e${i}-n`}>
                      <textarea id={`wps-e${i}-n`} className="vs-input vs-area" rows={2} value={s(e.note)} maxLength={220} placeholder="e.g. The baraat leaves the hotel at 7 pm sharp." onChange={(ev) => setEvent(i, "note", ev.target.value)} />
                    </Field>
                    <div className="wps-tools">
                      <button type="button" onClick={() => moveEvent(i, -1)} disabled={i === 0}>
                        ↑ Earlier
                      </button>
                      <button type="button" onClick={() => moveEvent(i, 1)} disabled={i === events.length - 1}>
                        ↓ Later
                      </button>
                      <button type="button" onClick={() => dupEvent(i)} disabled={events.length >= WP_LIMITS.events}>
                        Duplicate
                      </button>
                      <button
                        type="button"
                        className="is-danger"
                        disabled={events.length <= 1}
                        onClick={() => {
                          removeWithUndo(`${s(e.title) || "Function"} removed`, "events", events, i);
                          setOpenEv(null);
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
        {events.length < WP_LIMITS.events ? (
          <div className="wps-quick">
            <span>Add</span>
            {QUICK_FUNCTIONS.filter((q) => !events.some((e) => s(e.title).toLowerCase() === q.toLowerCase())).map((q) => (
              <button key={q} type="button" className="wps-chip" onClick={() => addEvent(q)}>
                + {q}
              </button>
            ))}
            <button type="button" className="wps-chip" onClick={() => addEvent()}>
              + Other
            </button>
          </div>
        ) : (
          <p className="wps-hint">All {WP_LIMITS.events} functions are in. Remove one to add another. Royal holds eight.</p>
        )}
      </section>

      {/* ── 3 Photos ───────────────────────────────────────────────────── */}
      <section className="vs-sec" id="vs-sec-photos" aria-label="Photos">
        <Head n={3} title="Photos" sub={`Up to ${WP_LIMITS.photos}. Photo 1 is the cover behind the doors. Tap a photo to resize it, set its focus or zoom. Drag to reorder.`} />
        {cover && (
          <div className="wps-cover">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cover.url} alt="Cover" style={{ objectPosition: `${coverCrop.x}% ${coverCrop.y}%`, transform: `scale(${coverCrop.scale / 100})`, transformOrigin: `${coverCrop.x}% ${coverCrop.y}%` }} />
            <div className="wps-cover-t">
              <b>Cover photo</b>
              <small>In a rounded ivory frame on the terrace, right after the doors open.</small>
              <div className="wps-tools">
                <button type="button" onClick={() => setCoverFraming(true)}>
                  ✥ Frame &amp; zoom
                </button>
                <button type="button" onClick={() => coverFile.current?.click()}>
                  Replace
                </button>
              </div>
            </div>
            <input
              ref={coverFile}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (f) void replaceCover(f);
              }}
            />
            <PhotoCropper open={coverFraming} src={cover.url} crop={coverCrop} aspect={0.8} title="Cover: drag to move, pinch or slide to zoom" themeStyle={CROP_THEME} onChange={(c) => frame(1, c)} onClose={() => setCoverFraming(false)} />
          </div>
        )}
        <MasonryEditor photos={photos} onChange={setPhotos} max={WP_LIMITS.photos} mask="rounded" upsell="Want 40 photos? The Royal invitation holds 40." />
      </section>

      {/* ── 4 Invitation ───────────────────────────────────────────────── */}
      <section className="vs-sec" id="vs-sec-letter" aria-label="Your invitation">
        <Head n={4} title="Your invitation" sub="The words guests read first. English and Hindi side by side; guests switch with one tap." />
        <div className="vs-row2">
          <Field label="In English" htmlFor="wps-letter" count={`${letter.length}/1200`}>
            <textarea id="wps-letter" className="vs-input vs-area wps-letter" rows={8} value={letter} maxLength={1200} placeholder={weddingPremiumDay.copy.letterPlaceholder} onChange={(e) => updateMf("letter", e.target.value)} />
          </Field>
          {bilingual && (
            <Field label="हिन्दी में (optional)" htmlFor="wps-hindi" count={`${hindi.length}/700`}>
              <textarea id="wps-hindi" lang="hi" className="vs-input vs-area wps-letter" rows={8} value={hindi} maxLength={700} placeholder="ईश्वर की कृपा और बड़ों के आशीर्वाद से…" onChange={(e) => set("hindiMessage", e.target.value)} />
            </Field>
          )}
        </div>
        <label className="wps-tog">
          <input type="checkbox" checked={bilingual} onChange={(e) => set("hindi", e.target.checked)} /> Offer a Hindi version (EN / हिं switch for guests)
        </label>
        {bilingual && (
          <label className="wps-tog">
            <input type="checkbox" checked={x.lang === "hi"} onChange={(e) => set("lang", e.target.checked ? "hi" : "en")} /> Open the invitation in Hindi
          </label>
        )}
      </section>

      {/* ── 5 Story & families ─────────────────────────────────────────── */}
      <section className="vs-sec" id="vs-sec-story" aria-label="Story and families">
        <Head n={5} title="Story & families" sub={`A few moments (up to ${WP_LIMITS.story}), each with a photo, and both families.`} />
        <ol className="wps-list">
          {story.map((c, i) => (
            <li key={i} className="wps-card">
              <div className="wps-row3 wps-row3-story">
                <Field label="When" htmlFor={`wps-s${i}-w`}>
                  <input id={`wps-s${i}-w`} className="vs-input" value={s(c.when)} maxLength={30} placeholder="2019" onChange={(e) => set("story", story.map((q, j) => (j === i ? { ...q, when: e.target.value } : q)))} />
                </Field>
                <Field label="Title" htmlFor={`wps-s${i}-t`}>
                  <input id={`wps-s${i}-t`} className="vs-input" value={s(c.title)} maxLength={50} placeholder="How we met" onChange={(e) => set("story", story.map((q, j) => (j === i ? { ...q, title: e.target.value } : q)))} />
                </Field>
              </div>
              <Field label="What happened" htmlFor={`wps-s${i}-l`}>
                <textarea id={`wps-s${i}-l`} className="vs-input vs-area" rows={3} value={s(c.text)} maxLength={320} onChange={(e) => set("story", story.map((q, j) => (j === i ? { ...q, text: e.target.value } : q)))} />
              </Field>
              <div className="wps-tools">
                <PhotoPick
                  label="Photo"
                  value={n(c.photo)}
                  photos={photos}
                  onPick={(k) => set("story", story.map((q, j) => (j === i ? { ...q, photo: k } : q)))}
                  onUpload={(f) => void uploadTo(f, (k) => set("story", ((latest.current.extras as Row).story as Chapter[]).map((q, j) => (j === i ? { ...q, photo: k } : q))))}
                  onFrame={frame}
                />
                <button type="button" className="is-danger" onClick={() => removeWithUndo("Moment removed", "story", story, i)}>
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ol>
        {story.length < WP_LIMITS.story && (
          <button type="button" className="wps-chip" onClick={() => set("story", [...story, { when: "", title: "", text: "", photo: 0 }])}>
            + Add a moment
          </button>
        )}

        <h4 className="wps-h4">Families</h4>
        <Field label="With the blessings of (grandparents, optional)" htmlFor="wps-bo">
          <input id="wps-bo" className="vs-input" value={s(x.blessingsOf)} maxLength={160} placeholder="e.g. Smt. Kamla Devi & Late Shri Ram Singh" onChange={(e) => set("blessingsOf", e.target.value)} />
        </Field>
        <div className="vs-row2">
          <div>
            <Field label="Bride's parents" htmlFor="wps-bp">
              <input id="wps-bp" className="vs-input" value={s(x.brideParents)} maxLength={90} placeholder="e.g. Mrs. Meera & Mr. Arvind Rathore" onChange={(e) => set("brideParents", e.target.value)} />
            </Field>
            <Field label="Under it (city, optional)" htmlFor="wps-bn">
              <input id="wps-bn" className="vs-input" value={s(x.brideNote)} maxLength={90} placeholder="e.g. Jaipur" onChange={(e) => set("brideNote", e.target.value)} />
            </Field>
          </div>
          <div>
            <Field label="Groom's parents" htmlFor="wps-gp">
              <input id="wps-gp" className="vs-input" value={s(x.groomParents)} maxLength={90} placeholder="e.g. Mrs. Nandini & Mr. Sanjay Kapoor" onChange={(e) => set("groomParents", e.target.value)} />
            </Field>
            <Field label="Under it (city, optional)" htmlFor="wps-gn">
              <input id="wps-gn" className="vs-input" value={s(x.groomNote)} maxLength={90} placeholder="e.g. New Delhi" onChange={(e) => set("groomNote", e.target.value)} />
            </Field>
          </div>
        </div>
      </section>

      {/* ── 6 Guest info ───────────────────────────────────────────────── */}
      <section className="vs-sec" id="vs-sec-guests" aria-label="Guest info">
        <Head n={6} title="Guest info" sub="People to call, good to know, getting there, a livestream, your film and shagun. All optional." />
        <h4 className="wps-h4">People to call</h4>
        <p className="wps-hint">Up to 4. Guests get a call button and a WhatsApp button for each.</p>
        <ol className="wps-list">
          {contacts.map((c, i) => {
            const bad = !!c.phone && !normalisePhone(c.phone);
            const setC = (k: keyof Contact, v: string) => set("contacts", contacts.map((q, j) => (j === i ? { ...q, [k]: v } : q)));
            return (
              <li key={i} className="wps-card">
                <div className="wps-row3">
                  <Field label="Name" htmlFor={`wps-c${i}-n`}>
                    <input id={`wps-c${i}-n`} className="vs-input" value={s(c.name)} maxLength={40} placeholder="e.g. Rohan" onChange={(e) => setC("name", e.target.value)} />
                  </Field>
                  <Field label="Relation" htmlFor={`wps-c${i}-r`}>
                    <input id={`wps-c${i}-r`} className="vs-input" value={s(c.relation)} maxLength={40} placeholder="e.g. Bride's brother" onChange={(e) => setC("relation", e.target.value)} />
                  </Field>
                  <Field label="Phone" htmlFor={`wps-c${i}-p`} hint={bad ? <span className="wps-err">A 10-digit mobile number, with or without +91.</span> : undefined}>
                    <div className="wps-phone">
                      <span aria-hidden>+91</span>
                      <input id={`wps-c${i}-p`} className="vs-input" type="tel" inputMode="tel" value={s(c.phone)} maxLength={20} placeholder="98XXX XXXXX" aria-invalid={bad} onChange={(e) => setC("phone", e.target.value)} />
                    </div>
                  </Field>
                </div>
                <div className="wps-tools">
                  <button type="button" className="is-danger" onClick={() => removeWithUndo("Contact removed", "contacts", contacts, i)}>
                    Remove
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
        {contacts.length < 4 && (
          <button type="button" className="wps-chip" onClick={() => set("contacts", [...contacts, { name: "", relation: "", phone: "" }])}>
            + Add a person
          </button>
        )}

        <h4 className="wps-h4">Good to know</h4>
        <ol className="wps-list">
          {faqs.map((f, i) => (
            <li key={i} className="wps-card">
              <Field label="Heading" htmlFor={`wps-f${i}-t`}>
                <input id={`wps-f${i}-t`} className="vs-input" value={s(f.title)} maxLength={40} placeholder="e.g. Where to stay" onChange={(e) => set("faqs", faqs.map((q, j) => (j === i ? { ...q, title: e.target.value } : q)))} />
              </Field>
              <Field label="Details" htmlFor={`wps-f${i}-x`}>
                <textarea id={`wps-f${i}-x`} className="vs-input vs-area" rows={2} value={s(f.text)} maxLength={220} onChange={(e) => set("faqs", faqs.map((q, j) => (j === i ? { ...q, text: e.target.value } : q)))} />
              </Field>
              <div className="wps-tools">
                <button type="button" className="is-danger" onClick={() => removeWithUndo("Note removed", "faqs", faqs, i)}>
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ol>
        {faqs.length < WP_LIMITS.faq && (
          <div className="wps-quick">
            <span>Add</span>
            {["Where to stay", "Weather", "Parking", "Little ones", "Gifts"].filter((h) => !faqs.some((f) => s(f.title) === h)).map((h) => (
              <button key={h} type="button" className="wps-chip" onClick={() => set("faqs", [...faqs, { title: h, text: "" }])}>
                + {h}
              </button>
            ))}
          </div>
        )}
        <Field label="Getting there" htmlFor="wps-gt">
          <textarea id="wps-gt" className="vs-input vs-area" rows={3} value={s(x.gettingThere)} maxLength={500} placeholder="Airport, station, shuttles, who meets guests…" onChange={(e) => set("gettingThere", e.target.value)} />
        </Field>

        <h4 className="wps-h4">Extras</h4>
        <Field label="Livestream link (optional)" htmlFor="wps-live" hint={s(x.liveUrl) && !/^https:\/\//i.test(s(x.liveUrl)) ? <span className="wps-err">Paste the full https:// link.</span> : "YouTube Live or Zoom. “Watch live” switches on 30 minutes before the ceremony."}>
          <input id="wps-live" className="vs-input" inputMode="url" value={s(x.liveUrl)} maxLength={300} placeholder="https://youtube.com/live/…" onChange={(e) => set("liveUrl", e.target.value.trim())} />
        </Field>
        <Field label="Pre-wedding film (YouTube link, optional)" htmlFor="wps-vid">
          <input id="wps-vid" className="vs-input" inputMode="url" value={s(x.videoUrl)} maxLength={200} placeholder="https://youtu.be/…" onChange={(e) => set("videoUrl", e.target.value.trim())} />
        </Field>
        <h4 className="wps-h4">Shagun (optional)</h4>
        <p className="wps-hint">Off unless you add a UPI ID. Guests see a polite line, a UPI button on phones and a copyable ID. We never handle the money.</p>
        <div className="vs-row2">
          <Field label="UPI ID" htmlFor="wps-upi" hint={s(x.upiId) && !isUpiId(s(x.upiId)) ? <span className="wps-err">That doesn&apos;t look like a UPI ID (name@bank).</span> : undefined}>
            <input id="wps-upi" className="vs-input" value={s(x.upiId)} maxLength={60} placeholder="e.g. ishita.r@okhdfcbank" autoComplete="off" onChange={(e) => set("upiId", e.target.value.trim())} />
          </Field>
          <Field label="Name on the account" htmlFor="wps-upin">
            <input id="wps-upin" className="vs-input" value={s(x.upiName)} maxLength={60} placeholder="e.g. Ishita Rathore" onChange={(e) => set("upiName", e.target.value)} />
          </Field>
        </div>
      </section>

      {/* ── 7 Look & music ─────────────────────────────────────────────── */}
      <section className="vs-sec" id="vs-sec-music" aria-label="Look and music">
        <Head n={7} title="Look & music" sub="Three light palettes. The song starts the moment the doors open, with a mute button always in reach." />
        <ThemeCards value={theme} onChange={(id) => set("theme", id)} sample={`${(mf.recipientName || "I").slice(0, 1)} & ${(mf.senderName || "A").slice(0, 1)}`} />
        <div style={{ marginTop: 18 }}>
          <MusicPicker
            value={mf}
            suggestions={weddingPremiumDay.music?.suggestions}
            suggestionsNote={weddingPremiumDay.music?.suggestionsNote}
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
        <Head n={8} title="RSVP & send" sub="Replies come to your email with a running total. Then the closing line, a password and personal links." />
        <div className="wps-row3">
          <Field label="Reply by" htmlFor="wps-by">
            <input id="wps-by" type="date" className="vs-input" value={s(x.rsvpBy)} onChange={(e) => set("rsvpBy", e.target.value)} />
          </Field>
          <Field label="Guests per reply" htmlFor="wps-max">
            <input id="wps-max" type="number" inputMode="numeric" min={1} max={10} className="vs-input" value={n(x.maxGuests) || 4} onChange={(e) => set("maxGuests", Math.min(10, Math.max(1, Math.round(Number(e.target.value) || 1))))} />
          </Field>
        </div>
        <label className="wps-tog">
          <input type="checkbox" checked={x.rsvpMeal === true} onChange={(e) => set("rsvpMeal", e.target.checked)} /> Ask for a meal preference (veg / non-veg / Jain)
        </label>
        <label className="wps-tog">
          <input type="checkbox" checked={x.blessings !== false} onChange={(e) => set("blessings", e.target.checked)} /> Show the blessings wall
        </label>
        <div className="vs-row2" style={{ marginTop: 12 }}>
          <Field label="Closing line" htmlFor="wps-end" hint="At the very end, on the terrace.">
            <input id="wps-end" className="vs-input" value={mf.endLine} maxLength={90} placeholder="With love, the Rathore & Kapoor families" onChange={(e) => updateMf("endLine", e.target.value)} />
          </Field>
          <Field label="Wedding hashtag" htmlFor="wps-tag">
            <input id="wps-tag" className="vs-input" value={s(x.hashtag)} maxLength={40} placeholder="#IshitaWedsAarav" onChange={(e) => set("hashtag", e.target.value)} />
          </Field>
        </div>
        {password && (
          <Field label="Password (optional)" htmlFor="wps-pw" hint="Guests type it to open the invitation. Leave empty for no lock.">
            <input id="wps-pw" className="vs-input" value={password.value} maxLength={128} placeholder="e.g. the bride's nickname" autoComplete="off" onChange={(e) => password.set(e.target.value)} />
          </Field>
        )}
        <h4 className="wps-h4">Personal links</h4>
        <div className="wps-guest">
          <p className="wps-hint">Type a family&apos;s name to get their own link. The doors open with “Dear Sharma family, you are invited”, and their RSVP is already signed.</p>
          <input className="vs-input" value={guestName} maxLength={40} placeholder="e.g. Sharma family" aria-label="Guest name for a personal link" onChange={(e) => setGuestName(e.target.value)} disabled={!shareUrl} />
          {shareUrl ? (
            <>
              <p className="wps-guest-link">{guestLink}</p>
              <div className="wps-tools">
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard?.writeText(guestLink).then(() => {
                      setLinkFlash(true);
                      window.setTimeout(() => setLinkFlash(false), 2000);
                    });
                  }}
                >
                  {linkFlash ? "Copied ✓" : "Copy link"}
                </button>
                <a className="wps-wa" href={`https://wa.me/?text=${encodeURIComponent(`✨ ${guestName ? `Dear ${guestName}, ` : ""}you're invited to the wedding of ${mf.recipientName} & ${mf.senderName}\n${guestLink}`)}`} target="_blank" rel="noopener noreferrer">
                  Send on WhatsApp
                </a>
              </div>
            </>
          ) : (
            <p className="wps-hint">
              <b>Publish first.</b> Personal links appear here once your invitation is live.
            </p>
          )}
        </div>
      </section>

      {undo && (
        <div className="wps-undo" role="status">
          <span>{undo.label}</span>
          <button
            type="button"
            onClick={() => {
              undo.run();
              setUndo(null);
            }}
          >
            Undo
          </button>
        </div>
      )}
    </div>
  );
}

const WPS_CSS = `
.wps { --wps-gold: #B8913E; --wps-blue: #3E6A8A; }
.wps .vs-input { min-height: 48px; font-size: 16px; }
.wps .vs-input, .wps textarea { scroll-margin-bottom: 120px; scroll-margin-top: 90px; }
.wps-hint { margin: 2px 0 10px; font-size: 13px; line-height: 1.45; opacity: .75; }
.wps-count { font-weight: 500; opacity: .6; }
.wps-sub { margin: 8px 0 10px; font-size: 13px; font-weight: 700; color: var(--vw-accent); }
.wps-row3 { display: grid; gap: 0 10px; grid-template-columns: 1fr 1fr; }
.wps-row3 > :last-child:nth-child(3) { grid-column: 1 / -1; }
@media (min-width: 560px) { .wps-row3 { grid-template-columns: 1fr 1fr 1.4fr; } .wps-row3 > :last-child:nth-child(3) { grid-column: auto; } .wps-row3-tight { grid-template-columns: 1.3fr 1fr 1fr; } .wps-row3-story { grid-template-columns: 1fr 3fr; } }
.wps-ai { position: relative; overflow: hidden; margin: 6px 0 4px; padding: 20px 18px 16px; border-radius: 22px; color: #FFFDF6;
  background: radial-gradient(70% 90% at 100% 0%, rgba(243,182,200,.35), transparent 60%), linear-gradient(140deg, #284D69, #3E6A8A 60%, #6F9CBC); box-shadow: 0 18px 40px -24px rgba(31,62,87,.8); }
.wps-ai::before { content: ""; position: absolute; inset: 0; border-radius: inherit; padding: 1px; background: linear-gradient(110deg,#8a6a1f,#e9cf7a 35%,#fff3c4 50%,#c9a43f 65%,#7a5a14); -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; }
.wps-ai::after { content: "🦩"; position: absolute; right: 14px; top: 10px; font-size: 30px; opacity: .55; }
.wps-ai-k { margin: 0; font: 700 11px/1 var(--vw-font-ui); letter-spacing: .22em; text-transform: uppercase; color: #F1D58A; }
.wps-ai-h { margin: 8px 40px 4px 0; font: 600 20px/1.25 var(--vw-font-serif); }
.wps-ai-p { margin: 0 0 14px; font-size: 13.5px; line-height: 1.45; opacity: .88; }
.wps-ai-go { width: 100%; min-height: 52px; border: 0; border-radius: 999px; cursor: pointer; font: 700 15.5px/1 var(--vw-font-ui); color: #2A2410; background: linear-gradient(110deg,#c9a43f,#e9cf7a 40%,#fff3c4 55%,#d9b05c); box-shadow: 0 10px 24px -12px rgba(233,207,122,.8); }
.wps-ai-go.is-sm { min-height: 46px; margin-top: 10px; font-size: 14.5px; }
.wps-ai-go:disabled { opacity: .75; cursor: progress; }
.wps-ai-row { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 4px 12px; margin-top: 8px; }
.wps-ai-link { min-height: 44px; display: inline-flex; align-items: center; padding: 0 4px; border: 0; background: none; color: #FFFDF6; font: 600 13.5px/1.2 var(--vw-font-ui); text-decoration: underline; text-underline-offset: 3px; cursor: pointer; }
.wps-ai-free { margin-top: 6px; }
.wps-ai-in { background: rgba(255,253,246,.98) !important; color: #1F3346 !important; min-height: 112px; line-height: 1.5 !important; }
.wps-ai-note { margin: 10px 0 0; font-size: 13.5px; color: #FFD6CC; }
.wps-ai-note.is-ok { color: #F1D58A; }
.wps-chiprow, .wps-quick { display: flex; flex-wrap: wrap; gap: 8px; margin: 6px 0 12px; align-items: center; }
.wps-quick > span { font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; opacity: .6; }
.wps-chip { min-height: 44px; padding: 0 16px; border-radius: 999px; border: 1.5px solid var(--vw-edge); background: var(--vw-paper); color: var(--vw-paper-ink); font: 600 13.5px/1 var(--vw-font-ui); cursor: pointer; }
.wps-chip[aria-checked=true] { background: var(--vw-accent); border-color: var(--vw-accent); color: var(--vw-accent-ink); }
.wps-chip:hover { border-color: var(--vw-accent); }
.wps-seg { display: flex; gap: 6px; padding: 4px; margin: 0 0 14px; border-radius: 999px; background: var(--vw-soft); width: fit-content; max-width: 100%; }
.wps-seg button { min-height: 44px; padding: 0 14px; border: 0; border-radius: 999px; background: none; font: 600 13.5px/1 var(--vw-font-ui); color: var(--vw-paper-ink); cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 42vw; }
.wps-seg button[aria-checked=true] { background: var(--vw-accent); color: var(--vw-accent-ink); }
.wps-evs, .wps-list { list-style: none; margin: 0 0 10px; padding: 0; display: grid; gap: 10px; }
.wps-ev { border: 1.5px solid var(--vw-edge); border-radius: 16px; background: var(--vw-paper); overflow: hidden; }
.wps-ev.is-open { border-color: var(--wps-gold); box-shadow: 0 12px 30px -22px rgba(31,62,87,.5); }
.wps-ev-head { display: flex; align-items: center; gap: 12px; width: 100%; min-height: 62px; padding: 10px 14px; border: 0; background: none; text-align: left; cursor: pointer; color: var(--vw-paper-ink); }
.wps-ev-sw { flex: none; width: 22px; height: 22px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 0 1.5px var(--wps-gold); }
.wps-ev-t { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.wps-ev-t b { font: 600 17px/1.2 var(--vw-font-serif); }
.wps-ev-t small { font-size: 12.5px; line-height: 1.4; opacity: .7; overflow-wrap: anywhere; }
.wps-ev-chev { font-size: 22px; line-height: 1; color: var(--vw-accent); width: 24px; text-align: center; }
.wps-ev-body { padding: 4px 14px 14px; border-top: 1px dashed var(--vw-edge); }
.wps-card { padding: 12px; border: 1.5px solid var(--vw-edge); border-radius: 16px; background: var(--vw-paper); }
.wps-tools { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.wps-tools > button, .wps-tools > a { min-height: 44px; padding: 0 14px; border-radius: 999px; border: 1.5px solid var(--vw-edge); background: var(--vw-paper); font: 600 13px/1 var(--vw-font-ui); color: var(--vw-paper-ink); cursor: pointer; display: inline-flex; align-items: center; text-decoration: none; }
.wps-tools > button:disabled { opacity: .35; cursor: default; }
.wps-tools .is-danger { color: #b3261e; }
.wps-sws { display: flex; flex-wrap: wrap; gap: 8px; margin: -6px 0 16px; }
.wps-sw { position: relative; width: 44px; height: 44px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 0 1.5px var(--vw-edge); cursor: pointer; padding: 0; }
.wps-sw[aria-checked=true] { box-shadow: 0 0 0 3px var(--vw-accent); }
.wps-sw-custom { background: conic-gradient(#f2c94c, #4f9b6a, #2e5aac, #7b3fa0, #e86a92, #a3122b, #f2c94c); overflow: hidden; }
.wps-sw-custom input { position: absolute; inset: 0; opacity: 0; width: 100%; height: 100%; cursor: pointer; }
.wps-letter { min-height: 200px; font-family: var(--vw-font-serif); font-size: 16px; line-height: 1.6; }
.wps-h4 { margin: 24px 0 6px; font: 700 12px/1 var(--vw-font-ui); letter-spacing: .14em; text-transform: uppercase; color: var(--vw-accent); }
.wps-tog { display: flex; gap: 10px; align-items: center; min-height: 44px; font-size: 14.5px; cursor: pointer; }
.wps-tog input { width: 22px; height: 22px; flex: none; accent-color: var(--vw-accent); }
.wps-pick { margin: 0; }
.wps-pick-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.wps-pick-btn { display: inline-flex; align-items: center; gap: 10px; min-height: 48px; padding: 4px 14px 4px 4px; border-radius: 999px; border: 1.5px dashed var(--vw-edge); background: var(--vw-paper); color: var(--vw-paper-ink); font: 600 13px/1.2 var(--vw-font-ui); cursor: pointer; }
.wps-pick-btn img, .wps-pick-btn > span:first-child { width: 40px; height: 40px; border-radius: 10px; object-fit: cover; display: grid; place-items: center; background: var(--vw-soft); font-size: 18px; }
.wps-frame-btn { min-height: 44px; padding: 0 14px; border-radius: 999px; border: 1.5px solid var(--vw-edge); background: var(--vw-paper); color: var(--wps-blue); font: 600 13px/1 var(--vw-font-ui); cursor: pointer; }
.wps-pick-strip { display: flex; gap: 8px; overflow-x: auto; padding: 10px 2px 6px; scroll-snap-type: x proximity; width: 100%; }
.wps-pick-th, .wps-pick-none { flex: none; width: 64px; height: 64px; border-radius: 12px; border: 2px solid transparent; padding: 0; overflow: hidden; background: var(--vw-soft); cursor: pointer; scroll-snap-align: start; font: 600 12px/1 var(--vw-font-ui); color: var(--vw-paper-ink); }
.wps-pick-th img { width: 100%; height: 100%; object-fit: cover; display: block; }
.wps-pick-th.is-on, .wps-pick-none.is-on { border-color: var(--vw-accent); }
.wps-cover { display: flex; gap: 14px; align-items: center; margin: 0 0 16px; padding: 12px; border-radius: 18px; border: 1.5px solid var(--vw-edge); background: linear-gradient(140deg, #F3F8FC, #FFFEFB); overflow: hidden; }
.wps-cover > img { flex: none; width: 96px; aspect-ratio: 4 / 5; object-fit: cover; border-radius: 14px; border: 4px solid #fff; box-shadow: 0 0 0 1.5px var(--wps-gold); }
.wps-cover-t { min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.wps-cover-t b { font: 600 16px/1.2 var(--vw-font-serif); }
.wps-cover-t small { font-size: 12.5px; line-height: 1.4; opacity: .75; margin-bottom: 4px; }
.wps-themes { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
@media (max-width: 520px) { .wps-themes { grid-template-columns: 1fr; } }
.wps-theme { display: flex; flex-direction: column; gap: 3px; padding: 8px 8px 12px; border-radius: 16px; border: 2px solid var(--vw-edge); background: var(--vw-paper); text-align: left; cursor: pointer; color: var(--vw-paper-ink); font: 500 12.5px/1.35 var(--vw-font-ui); }
.wps-theme.is-on { border-color: var(--vw-accent); box-shadow: 0 10px 24px -16px rgba(31,62,87,.7); }
.wps-theme:focus-visible { outline: 3px solid #C9A24A; outline-offset: 2px; }
.wps-theme b { margin-top: 6px; font-size: 14px; }
.wps-theme small { font-size: 12px; opacity: .75; }
.wps-theme-card { position: relative; display: grid; place-items: center; height: 96px; border-radius: 12px; border: 1px solid rgba(201,162,74,.5); padding: 10px 0 16px; overflow: hidden; }
.wps-theme-door { position: absolute; top: 10px; left: 50%; width: 34px; height: 46px; margin-left: -17px; border: 2px solid #C9A24A; border-radius: 6px; background: linear-gradient(90deg, rgba(255,255,255,.7) 49%, #C9A24A 49% 51%, rgba(255,255,255,.7) 51%); opacity: .5; }
.wps-theme-names { position: relative; margin-top: 30px; font: italic 500 20px/1 Georgia, serif; }
.wps-theme-bar { position: absolute; left: 24%; right: 24%; bottom: 10px; height: 3px; border-radius: 3px; }
.wps-dash { margin: 4px 0 12px; border: 1.5px solid var(--vw-edge); border-radius: 16px; padding: 0 14px; background: var(--vw-paper); }
.wps-dash > summary { min-height: 52px; display: flex; align-items: center; font: 700 15px/1 var(--vw-font-ui); cursor: pointer; color: var(--vw-accent); }
.wps-err { color: #b3261e; opacity: 1; }
.wps-phone { display: flex; align-items: stretch; }
.wps-phone > span { display: grid; place-items: center; padding: 0 10px; border: 1.5px solid var(--vw-edge); border-right: 0; border-radius: 12px 0 0 12px; background: var(--vw-soft); font: 600 14px/1 var(--vw-font-ui); }
.wps-phone .vs-input { border-radius: 0 12px 12px 0 !important; min-width: 0; }
.wps-guest { padding: 14px; border-radius: 18px; border: 1.5px dashed var(--vw-edge); background: linear-gradient(140deg, #FFFEFB, #EEF5FA); }
.wps-guest-link { margin: 10px 0; padding: 10px 12px; border-radius: 12px; background: #fff; border: 1px solid var(--vw-edge); font: 500 12.5px/1.4 ui-monospace, monospace; word-break: break-all; }
.wps-wa { background: #25D366 !important; color: #fff !important; border-color: #25D366 !important; }
.wps .vs-secN { background: linear-gradient(140deg, #6F9CBC, #3E6A8A) !important; color: #FFFDF6 !important; }
.wps-undo { position: fixed; z-index: 2147482000; left: 50%; bottom: calc(96px + env(safe-area-inset-bottom)); translate: -50% 0; display: flex; align-items: center; gap: 14px; padding: 6px 6px 6px 18px; border-radius: 999px; background: #1F3346; color: #fff; font: 600 14px/1 var(--vw-font-ui); box-shadow: 0 14px 30px -12px rgba(0,0,0,.5); max-width: calc(100vw - 32px); }
.wps-undo button { min-height: 44px; padding: 0 16px; border: 0; border-radius: 999px; background: #F1D58A; color: #2A2410; font: 700 14px/1 var(--vw-font-ui); cursor: pointer; }
`;
