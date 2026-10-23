"use client";

// ─── Lotus Temple Wedding Invitation — the editor (the whole form) ───────────
//
// On top, "Describe your wedding" (the AI fills names, families, five
// functions, the English + Hindi invitation, the story, family contacts and
// good-to-know). Then six steps: the couple + the big day → functions →
// photos (one pool of 40: the gallery; story chapters and family cards point
// into it, and each can be framed with PhotoCropper) → the invitation →
// theme & music → guests & more (story, families, good to know, contacts,
// shagun, livestream, film, RSVP settings, closing line, password, and the
// personal ?to= links once the page is published). Each section carries
// id="vs-sec-<id>" so the sheet's side nav and Save's "jump to the gap" work.

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { MasonryEditor, RsvpDashboard } from "../../../_wedding";
import { LIGHT_THEMES } from "../../../_wedding/themes";
import { compressImage } from "../../../dedication/components/mediaUploads";
import MusicPicker from "../../../_valentine/editor/MusicPicker";
import PhotoCropper, { clampCrop, type Crop } from "../../../_valentine/editor/PhotoCropper";
import { API_URL } from "@/lib/config";
import type { StudioProps } from "../../../_valentine/editor/studios";
import type { LovePhoto } from "../../../_valentine/types";
import { LW_LIMITS, LW_THEME_LABELS, lotusWeddingDay, lwLocalUrl, lwStoredUrl } from "../../../_valentine/days/lotus-wedding-invitation";
import { MAIN_RE, isUpiId, normalisePhone, swatchFor } from "../lw/model";
import { personalLink } from "../lw/guest";

const SLUG = "lotus-wedding-invitation";
type Row = Record<string, unknown>;
type Chapter = { when: string; title: string; line: string; photo: number };

const DEMO = lotusWeddingDay.demo.extras;

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
const AI_CHIPS = ["Make it formal", "Make it warm", "A temple wedding", "Mention our families", "Keep it short"];
type Contact = { name: string; relation: string; phone: string };
/** PhotoCropper renders in a portal (outside the sheet), so it gets the lotus palette explicitly. */
const CROP_THEME = {
  "--vw-accent": "#4E6E5D",
  "--vw-accent-deep": "#2F4A3E",
  "--vw-accent-ink": "#FFFDF6",
  "--vw-edge": "#DCCFAE",
  "--vw-paper": "#FFFDF8",
  "--vw-paper-ink": "#2A3A32",
  "--vw-soft": "#EEF2EA",
} as CSSProperties;

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
        {count && <small className="lws-count">{count}</small>}
      </label>
      {children}
      {hint && <p className="lws-hint">{hint}</p>}
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
    <div className="lws-pick">
      <div className="lws-pick-row">
        <button type="button" className="lws-pick-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          {cur ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cur.url} alt="" style={{ objectPosition: `${crop.x}% ${crop.y}%` }} />
          ) : (
            <span aria-hidden>＋</span>
          )}
          <span>{cur ? `${label}: photo ${value}` : `${label}: add a photo`}</span>
        </button>
        {cur && (
          <button type="button" className="lws-frame-btn" onClick={() => setFraming(true)}>
            ✥ Frame &amp; zoom
          </button>
        )}
      </div>
      {cur && (
        <PhotoCropper
          open={framing}
          src={cur.url}
          crop={crop}
          aspect={0.8}
          title={`${label}: drag to move, pinch or slide to zoom`}
          themeStyle={CROP_THEME}
          onChange={(c) => onFrame(value, c)}
          onClose={() => setFraming(false)}
        />
      )}
      {open && (
        <div className="lws-pick-strip" role="listbox" aria-label={label}>
          <button type="button" className={`lws-pick-none${value === 0 ? " is-on" : ""}`} onClick={() => { onPick(0); setOpen(false); }}>
            None
          </button>
          <button type="button" className="lws-pick-none" onClick={() => file.current?.click()} disabled={photos.length >= LW_LIMITS.photos}>
            Upload
          </button>
          {photos.map((p, i) => (
            <button key={i} type="button" role="option" aria-selected={value === i + 1} className={`lws-pick-th${value === i + 1 ? " is-on" : ""}`} onClick={() => { onPick(i + 1); setOpen(false); }} aria-label={`Photo ${i + 1}`}>
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

/** The three lotus palettes as the guest page paints them (the kit's picker shows its own champagne/blush/powder cards). */
const LOTUS_SWATCHES: Record<string, { bg: string; ink: string; accent: string; blurb: string }> = {
  champagne: { bg: "linear-gradient(160deg, #FFFCF5, #F3EEDF)", ink: "#7E2943", accent: "#4E6E5D", blurb: "Ivory paper, lotus-leaf sage and temple gold" },
  blush: { bg: "linear-gradient(160deg, #FFFBFA, #F9E6EB)", ink: "#7E2943", accent: "#9C3A57", blurb: "Soft lotus pink with rose and gold" },
  powder: { bg: "linear-gradient(160deg, #FBFDFE, #E7F0F3)", ink: "#7E2943", accent: "#48707A", blurb: "A still pond: pale blue-green and gold" },
};
function LotusThemePicker({ value, onChange, sample }: { value: string; onChange: (id: string) => void; sample: string }) {
  return (
    <div className="lws-themes" role="radiogroup" aria-label="Theme">
      {LIGHT_THEMES.map((id) => {
        const sw = LOTUS_SWATCHES[id];
        if (!sw) return null;
        const on = value === id;
        return (
          <button key={id} type="button" role="radio" aria-checked={on} className={`lws-theme${on ? " is-on" : ""}`} onClick={() => onChange(id)}>
            <span className="lws-theme-card" style={{ background: sw.bg }}>
              <span className="lws-theme-lotus" aria-hidden>🪷</span>
              <span className="lws-theme-names" style={{ color: sw.ink }}>{sample}</span>
              <span className="lws-theme-bar" style={{ background: sw.accent }} />
            </span>
            <b>{LW_THEME_LABELS[id] ?? id}</b>
            <small>{sw.blurb}</small>
          </button>
        );
      })}
    </div>
  );
}

export default function LotusStudio({ mf, updateMf, updateExtra, ai, password, owner }: StudioProps) {
  const x = mf.extras as Row;
  const events = useMemo(() => (Array.isArray(x.events) ? (x.events as Row[]) : []), [x.events]);
  const story = useMemo(() => (Array.isArray(x.story) ? (x.story as Chapter[]) : []), [x.story]);
  const things = useMemo(() => (Array.isArray(x.things) ? (x.things as string[]) : []), [x.things]);
  // Demo photos live in public/wedding-v3 and are stored as https on the site domain: show this host's copy.
  const photos = useMemo(() => mf.photos.map((p) => (lwLocalUrl(p.url) === p.url ? p : { ...p, url: lwLocalUrl(p.url) })), [mf.photos]);
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
      // A function the AI rewrote keeps none of the demo couple's address, note or timings it did not write itself.
      .map((e, i) => {
        if (!touched(`extras.events[${i}]`)) return e;
        const d = dEvents[i] ?? {};
        const out: Row = { ...e };
        for (const k of ["endTime", "address", "mapUrl", "dressCode", "dressColor", "note", "venue", "time"]) if (!filled.has(`extras.events[${i}].${k}`) && s(e[k]) && s(e[k]) === s(d[k])) out[k] = "";
        // A row the AI dated but did not name (a thin description) is the wedding itself, never the demo's haldi.
        if (!filled.has(`extras.events[${i}].title`) && s(e.title) === s(d.title)) out.title = i === 0 ? "Wedding" : "";
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
      // The demo's closing "Forever begins" chapter suits every wedding: it stays.
      .filter((c, i) => touched(`extras.story[${i}]`) || s(c.title) === "Forever begins" || !same(c, dStory[i], ["title", "line"]));
    // Contacts: the AI writes "Kabir (Rohan's brother)"; split the relation out, drop the demo's people.
    const dContacts = (DEMO.contacts ?? []) as unknown as Row[];
    const cs = (Array.isArray(cur.contacts) ? (cur.contacts as Row[]) : [])
      .map((c, i) => {
        if (!touched(`extras.contacts[${i}]`)) return same(c, dContacts[i], ["name", "phone"]) ? null : c;
        const m = s(c.name).match(/^(.*?)\s*\(([^)]+)\)\s*$/);
        const relation = filled.has(`extras.contacts[${i}].name`) ? (m ? m[2].trim() : "") : s(c.relation);
        return { name: m ? m[1].trim() : s(c.name), relation, phone: s(c.phone) };
      })
      .filter((c): c is Row => !!c && !!s(c.name));
    if (fill.filled.length) {
      set("events", (evs.length ? evs : (cur.events as Row[])).map((e) => ({ ...e, time: toHHMM(s(e.time)), endTime: toHHMM(s(e.endTime)) })));
      const L = latest.current.letter;
      if (/<[^>]+>/.test(L)) updateMf("letter", plain(L));
      set("story", st);
      set("contacts", cs);
      if (!touched("extras.things") && JSON.stringify(cur.things) === JSON.stringify(DEMO.things)) set("things", []);
      for (const k of ["blessingsOf", "brideNote", "groomNote", "muhurat", "hashtag", "gettingThere", "brideFamily", "groomFamily", "hindiMessage"] as const) {
        if (!touched(`extras.${k}`) && cur[k] === DEMO[k]) set(k, "");
      }
      // The demo's closing line names the demo's families.
      if (!filled.has("endLine") && latest.current.endLine === lotusWeddingDay.demo.endLine) updateMf("endLine", "");
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
    const capped = next.slice(0, LW_LIMITS.photos).map((p) => (lwStoredUrl(p.url) === p.url ? p : { ...p, url: lwStoredUrl(p.url) }));
    updateMf("photos", capped);
    remapRefs(prev, capped);
  };
  const uploadTo = async (f: File, apply: (k: number) => void) => {
    try {
      const url = await compressImage(f);
      const size = await measure(url);
      const cur = latest.current.photos;
      if (cur.length >= LW_LIMITS.photos) return;
      const p: LovePhoto = { url, cropX: 50, cropY: 40, ...(size ? { w: size.w, h: size.h } : {}) };
      updateMf("photos", [...cur, p]);
      apply(cur.length + 1);
    } catch {
      /* compressImage explains itself in the photos section; a picker upload just doesn't land */
    }
  };

  const frame = (k: number, c: Crop) => {
    const cur = latest.current.photos;
    if (k < 1 || k > cur.length) return;
    updateMf("photos", cur.map((p, i) => (i === k - 1 ? { ...p, cropX: Math.round(c.x), cropY: Math.round(c.y), scale: Math.round(c.scale) } : p)));
  };

  // ── Contacts, shagun, live ─────────────────────────────────────────────────
  const contacts = useMemo(() => (Array.isArray(x.contacts) ? (x.contacts as Contact[]) : []), [x.contacts]);
  const setContact = (i: number, k: keyof Contact, v: string) => set("contacts", contacts.map((c, j) => (j === i ? { ...c, [k]: v } : c)));
  const upiId = s(x.upiId);
  const liveUrl = s(x.liveUrl);

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
  const mainIdx = Math.max(0, events.findIndex((e) => MAIN_RE.test(s(e.title))));
  const setEvent = (i: number, k: string, v: string) => set("events", events.map((e, j) => (j === i ? { ...e, [k]: v } : e)));
  const addEvent = (q?: (typeof QUICK_FUNCTIONS)[number]) => {
    if (events.length >= LW_LIMITS.events) return;
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
      <style>{LWS_CSS}</style>

      {pageId && token && (
        <details className="lws-dash">
          <summary>Guest replies &amp; blessings</summary>
          <RsvpDashboard slug={SLUG} pageId={pageId} token={token} csvName="wedding-rsvps" />
        </details>
      )}

      {ai?.available && fill && (
        <section className="lws-ai" aria-labelledby="lws-ai-h">
          <p className="lws-ai-k">✦ AI</p>
          <h3 className="lws-ai-h" id="lws-ai-h">
            Describe your wedding in a few lines
          </h3>
          <p className="lws-ai-p">We&apos;ll fill in everything below. You can change any of it.</p>
          <textarea
            className="vs-input vs-area lws-ai-in"
            rows={4}
            value={desc}
            maxLength={1500}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Meenakshi and Arjun are getting married on 14 Feb 2027 at Sri Kapali Kalyana Mandapam, Chennai. Haldi and Mehendi on the 12th, Sangeet on the 13th, the muhurtham at 9:05 am, reception that evening. We met at college in Pune in 2018. Keep it warm and traditional, and add a Hindi line."
            aria-label="Describe your wedding"
          />
          <div className="lws-chips">
            {AI_CHIPS.map((c) => (
              <button key={c} type="button" className="lws-chip" onClick={() => setDesc((d) => (d.trim() ? `${d.trim()} ${c}.` : `${c}.`))}>
                + {c}
              </button>
            ))}
          </div>
          <button type="button" className="lws-ai-go" onClick={runAi} disabled={fill.generating}>
            {fill.generating ? "Writing your invitation…" : "Write my invitation"}
          </button>
          {aiNote && (
            <p className={`lws-ai-note${aiNote.ok ? " is-ok" : ""}`} role="status">
              {aiNote.text}
            </p>
          )}
        </section>
      )}

      {/* ── The couple ─────────────────────────────────────────────────── */}
      <section className="vs-sec" id="vs-sec-names" aria-label="The couple">
        <Head n={1} title="The couple" sub="Names as you'd like them printed." />
        <div className="vs-row2">
          <Field label="Bride's name" htmlFor="lws-bride">
            <input id="lws-bride" className="vs-input" value={mf.recipientName} maxLength={30} placeholder="e.g. Ananya" onChange={(e) => updateMf("recipientName", e.target.value)} />
          </Field>
          <Field label="Groom's name" htmlFor="lws-groom">
            <input id="lws-groom" className="vs-input" value={mf.senderName} maxLength={30} placeholder="e.g. Arjun" onChange={(e) => updateMf("senderName", e.target.value)} />
          </Field>
        </div>
        <div className="lws-seg" role="radiogroup" aria-label="Show names as">
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
          <Field label="Bride's family" htmlFor="lws-bf" hint="“With the blessings of…”">
            <input id="lws-bf" className="vs-input" value={s(x.brideFamily)} maxLength={120} placeholder="e.g. Mrs. & Mr. Rakesh Sharma" onChange={(e) => set("brideFamily", e.target.value)} />
          </Field>
          <Field label="Groom's family" htmlFor="lws-gf">
            <input id="lws-gf" className="vs-input" value={s(x.groomFamily)} maxLength={120} placeholder="e.g. Mrs. & Mr. Vikram Mehta" onChange={(e) => set("groomFamily", e.target.value)} />
          </Field>
        </div>
        {main && (
          <>
            <p className="lws-sub">The big day · used for the countdown and the calendar invites ({s(main.title) || "the wedding"})</p>
            <div className="lws-row3">
              <Field label="Date" htmlFor="lws-date">
                <input id="lws-date" type="date" className="vs-input" value={s(main.date)} onChange={(e) => setEvent(mainIdx, "date", e.target.value)} />
              </Field>
              <Field label="Time" htmlFor="lws-time">
                <input id="lws-time" type="time" className="vs-input" value={s(main.time)} onChange={(e) => setEvent(mainIdx, "time", e.target.value)} />
              </Field>
              <Field label="Muhurat (optional)" htmlFor="lws-muh">
                <input id="lws-muh" className="vs-input" value={s(x.muhurat)} maxLength={60} placeholder="e.g. Shubh muhurat 9:15 pm" onChange={(e) => set("muhurat", e.target.value)} />
              </Field>
            </div>
          </>
        )}
      </section>

      {/* ── Functions ──────────────────────────────────────────────────── */}
      <section className="vs-sec" id="vs-sec-details" aria-label="Functions">
        <Head n={2} title="Functions" sub={`Add, remove or reorder (up to ${LW_LIMITS.events}). Each one gets its own map, timings, dress code and calendar button.`} />
        <ol className="lws-evs">
          {events.map((e, i) => {
            const isOpen = openEv === i;
            const sw = swatchFor({ dressCode: s(e.dressCode), dressColor: s(e.dressColor) });
            return (
              <li key={s(e.id) || i} className={`lws-ev${isOpen ? " is-open" : ""}`}>
                <button type="button" className="lws-ev-head" onClick={() => setOpenEv(isOpen ? null : i)} aria-expanded={isOpen}>
                  <span className="lws-ev-sw" style={{ background: sw || "transparent" }} aria-hidden />
                  <span className="lws-ev-t">
                    <b>{s(e.title) || "New function"}</b>
                    <small>{[s(e.date), s(e.time), s(e.venue)].filter(Boolean).join(" · ") || "Tap to fill in"}</small>
                  </span>
                  <span className="lws-ev-chev" aria-hidden>
                    {isOpen ? "–" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <div className="lws-ev-body">
                      <Field label="Name" htmlFor={`lws-e${i}-t`}>
                        <input id={`lws-e${i}-t`} className="vs-input" value={s(e.title)} maxLength={40} placeholder="e.g. Sangeet" onChange={(ev) => setEvent(i, "title", ev.target.value)} />
                      </Field>
                      <div className="lws-row3 lws-row3-tight">
                        <Field label="Date" htmlFor={`lws-e${i}-d`}>
                          <input id={`lws-e${i}-d`} type="date" className="vs-input" value={s(e.date)} onChange={(ev) => setEvent(i, "date", ev.target.value)} />
                        </Field>
                        <Field label="Starts" htmlFor={`lws-e${i}-s`}>
                          <input id={`lws-e${i}-s`} type="time" className="vs-input" value={s(e.time)} onChange={(ev) => setEvent(i, "time", ev.target.value)} />
                        </Field>
                        <Field label="Ends" htmlFor={`lws-e${i}-e`}>
                          <input id={`lws-e${i}-e`} type="time" className="vs-input" value={s(e.endTime)} onChange={(ev) => setEvent(i, "endTime", ev.target.value)} />
                        </Field>
                      </div>
                    <div className="vs-row2">
                      <Field label="Venue" htmlFor={`lws-e${i}-v`}>
                        <input id={`lws-e${i}-v`} className="vs-input" value={s(e.venue)} maxLength={80} placeholder="e.g. The Leela Palace, Udaipur" onChange={(ev) => setEvent(i, "venue", ev.target.value)} />
                      </Field>
                      <Field label="Address" htmlFor={`lws-e${i}-a`}>
                        <input id={`lws-e${i}-a`} className="vs-input" value={s(e.address)} maxLength={140} placeholder="Street, city" onChange={(ev) => setEvent(i, "address", ev.target.value)} />
                      </Field>
                    </div>
                    <Field label="Google Maps link (optional)" htmlFor={`lws-e${i}-m`} hint="Paste the share link from Google Maps. Empty: we search the venue and address.">
                      <input id={`lws-e${i}-m`} className="vs-input" inputMode="url" value={s(e.mapUrl)} maxLength={400} placeholder="https://maps.app.goo.gl/…" onChange={(ev) => setEvent(i, "mapUrl", ev.target.value.trim())} />
                    </Field>
                    <Field label="Dress code" htmlFor={`lws-e${i}-dc`}>
                      <input id={`lws-e${i}-dc`} className="vs-input" value={s(e.dressCode)} maxLength={60} placeholder="e.g. Shades of yellow" onChange={(ev) => setEvent(i, "dressCode", ev.target.value)} />
                    </Field>
                    <div className="lws-sws" role="radiogroup" aria-label="Dress-code colour">
                      {SWATCHES.map((c) => (
                        <button key={c} type="button" role="radio" aria-checked={s(e.dressColor).toLowerCase() === c.toLowerCase()} aria-label={c} className="lws-sw" style={{ background: c }} onClick={() => setEvent(i, "dressColor", c)} />
                      ))}
                      <label className="lws-sw lws-sw-custom" aria-label="Custom colour">
                        <input type="color" value={/^#[0-9a-f]{6}$/i.test(s(e.dressColor)) ? s(e.dressColor) : "#c9a24a"} onChange={(ev) => setEvent(i, "dressColor", ev.target.value)} />
                      </label>
                    </div>
                    <Field label="A line for guests (optional)" htmlFor={`lws-e${i}-n`}>
                      <textarea id={`lws-e${i}-n`} className="vs-input vs-area" rows={2} value={s(e.note)} maxLength={200} placeholder="e.g. The baraat leaves the hotel at 7 pm sharp." onChange={(ev) => setEvent(i, "note", ev.target.value)} />
                    </Field>
                    <div className="lws-ev-tools">
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
        {events.length < LW_LIMITS.events ? (
          <div className="lws-quick">
            <span>Add:</span>
            {QUICK_FUNCTIONS.filter((q) => !events.some((e) => s(e.title).toLowerCase() === q.title.toLowerCase())).map((q) => (
              <button key={q.title} type="button" className="lws-chip" onClick={() => addEvent(q)}>
                + {q.title}
              </button>
            ))}
            <button type="button" className="lws-chip" onClick={() => addEvent()}>
              + Other
            </button>
          </div>
        ) : (
          <p className="lws-hint">All {LW_LIMITS.events} functions are in. Remove one to add another.</p>
        )}
      </section>

      {/* ── Photos ─────────────────────────────────────────────────────── */}
      <section className="vs-sec" id="vs-sec-photos" aria-label="Photos">
        <Head n={3} title="Photos" sub={`Up to ${LW_LIMITS.photos}. Any shape works. Tap a photo to resize it or set its focus. Drag to reorder. Photos you use in your story or on a family card don't repeat in the gallery.`} />
        <MasonryEditor photos={photos} onChange={setPhotos} max={LW_LIMITS.photos} mask="rounded" />
      </section>

      {/* ── The invitation ─────────────────────────────────────────────── */}
      <section className="vs-sec" id="vs-sec-letter" aria-label="Your invitation">
        <Head n={4} title="Your invitation" sub="The words your guests read first, in English and Hindi side by side." />
        <div className="vs-row2">
          <Field label="In English" htmlFor="lws-letter" count={`${letter.length}/1500`}>
            <textarea id="lws-letter" className="vs-input vs-area lws-letter" rows={8} value={letter} maxLength={1500} placeholder={lotusWeddingDay.copy.letterPlaceholder} onChange={(e) => updateMf("letter", e.target.value)} />
          </Field>
          <Field label="हिन्दी में (optional)" htmlFor="lws-hindi" count={`${hindi.length}/700`}>
            <textarea id="lws-hindi" lang="hi" className="vs-input vs-area lws-letter" rows={8} value={hindi} maxLength={700} placeholder="सर्वशक्तिमान की कृपा और बड़ों के आशीर्वाद से…" onChange={(e) => set("hindiMessage", e.target.value)} />
          </Field>
        </div>
      </section>

      {/* ── Theme & music ──────────────────────────────────────────────── */}
      <section className="vs-sec" id="vs-sec-music" aria-label="Theme and music">
        <Head n={5} title="Theme & music" sub="Three light palettes, always in gold. The song starts when the guest taps the lotus, with a mute button always in reach." />
        <LotusThemePicker value={s(x.theme) || "champagne"} onChange={(id) => set("theme", id)} sample={`${(mf.recipientName || "A").slice(0, 1)} & ${(mf.senderName || "V").slice(0, 1)}`} />
        <div style={{ marginTop: 18 }}>
          <MusicPicker
            value={mf}
            suggestions={lotusWeddingDay.music?.suggestions}
            suggestionsNote={lotusWeddingDay.music?.suggestionsNote}
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
        <details className="lws-more" open>
          <summary>
            <Head n={6} title="Guests & more" sub="Your story, families, good to know, people to call, shagun, a livestream, RSVP settings, the closing line, a password and personal links." />
          </summary>

          <h4 className="lws-h4">Our story</h4>
          <p className="lws-hint">A few moments: how you met, the proposal, the yes. Up to {LW_LIMITS.story}, each with a photo.</p>
          <ol className="lws-story">
            {story.map((c, i) => (
              <li key={i} className="lws-ch">
                <div className="lws-row3 lws-row3-story">
                  <Field label="When" htmlFor={`lws-s${i}-w`}>
                    <input id={`lws-s${i}-w`} className="vs-input" value={c.when} maxLength={24} placeholder="2019" onChange={(e) => set("story", story.map((q, j) => (j === i ? { ...q, when: e.target.value } : q)))} />
                  </Field>
                  <Field label="Title" htmlFor={`lws-s${i}-t`}>
                    <input id={`lws-s${i}-t`} className="vs-input" value={c.title} maxLength={60} placeholder="How we met" onChange={(e) => set("story", story.map((q, j) => (j === i ? { ...q, title: e.target.value } : q)))} />
                  </Field>
                </div>
                <Field label="What happened" htmlFor={`lws-s${i}-l`}>
                  <textarea id={`lws-s${i}-l`} className="vs-input vs-area" rows={2} value={c.line} maxLength={240} onChange={(e) => set("story", story.map((q, j) => (j === i ? { ...q, line: e.target.value } : q)))} />
                </Field>
                <div className="lws-ch-tools">
                  <PhotoPick
                    label="Chapter photo"
                    value={n(c.photo)}
                    photos={photos}
                    onPick={(k) => set("story", story.map((q, j) => (j === i ? { ...q, photo: k } : q)))}
                    onUpload={(f) => void uploadTo(f, (k) => set("story", (latest.current.extras.story as Chapter[]).map((q, j) => (j === i ? { ...q, photo: k } : q))))}
                    onFrame={frame}
                  />
                  <button type="button" className="lws-x" onClick={() => set("story", story.filter((_, j) => j !== i))}>
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ol>
          {story.length < LW_LIMITS.story && (
            <button type="button" className="lws-chip" onClick={() => set("story", [...story, { when: "", title: "", line: "", photo: 0 }])}>
              + Add a chapter
            </button>
          )}

          <h4 className="lws-h4">Families</h4>
          <Field label="With the blessings of (grandparents, optional)" htmlFor="lws-bo">
            <input id="lws-bo" className="vs-input" value={s(x.blessingsOf)} maxLength={160} placeholder="e.g. Smt. Kamla Devi & Late Shri Ram Prasad Sharma" onChange={(e) => set("blessingsOf", e.target.value)} />
          </Field>
          <div className="vs-row2">
            <div>
              <Field label="Under the bride's family" htmlFor="lws-bn">
                <input id="lws-bn" className="vs-input" value={s(x.brideNote)} maxLength={100} placeholder="e.g. Udaipur" onChange={(e) => set("brideNote", e.target.value)} />
              </Field>
              <PhotoPick label="Bride's family photo" value={n(x.bridePhoto)} photos={photos} onPick={(k) => set("bridePhoto", k)} onUpload={(f) => void uploadTo(f, (k) => set("bridePhoto", k))} onFrame={frame} />
            </div>
            <div>
              <Field label="Under the groom's family" htmlFor="lws-gn">
                <input id="lws-gn" className="vs-input" value={s(x.groomNote)} maxLength={100} placeholder="e.g. Jaipur" onChange={(e) => set("groomNote", e.target.value)} />
              </Field>
              <PhotoPick label="Groom's family photo" value={n(x.groomPhoto)} photos={photos} onPick={(k) => set("groomPhoto", k)} onUpload={(f) => void uploadTo(f, (k) => set("groomPhoto", k))} onFrame={frame} />
            </div>
          </div>

          <h4 className="lws-h4">Good to know</h4>
          <p className="lws-hint">Dress code, parking, where to stay, who to call. Start a line with a heading and a colon: “Stay: …”.</p>
          {Array.from({ length: LW_LIMITS.faq }, (_, i) => (
            <input
              key={i}
              className="vs-input lws-thing"
              aria-label={`Good to know ${i + 1}`}
              value={things[i] ?? ""}
              maxLength={180}
              placeholder={["Stay: Rooms are held at …", "Parking: Valet at the main gate", "Weather: Evenings get cool, bring a shawl", "Contact: Call Kabir on …", "Kids: Little ones are welcome", "Gifts: Your blessings are enough"][i]}
              onChange={(e) => {
                const next = Array.from({ length: LW_LIMITS.faq }, (_, j) => (j === i ? e.target.value : things[j] ?? ""));
                set("things", next);
              }}
            />
          ))}
          <Field label="Getting there" htmlFor="lws-gt">
            <textarea id="lws-gt" className="vs-input vs-area" rows={3} value={s(x.gettingThere)} maxLength={500} placeholder="Airport, station, shuttles, who meets guests…" onChange={(e) => set("gettingThere", e.target.value)} />
          </Field>

          <h4 className="lws-h4">People to call</h4>
          <p className="lws-hint">Up to 4 family members. Guests get a call button and a WhatsApp button for each.</p>
          <ol className="lws-story">
            {contacts.map((c, i) => {
              const bad = !!c.phone && !normalisePhone(c.phone);
              return (
                <li key={i} className="lws-ch lws-contact">
                  <div className="lws-row3">
                    <Field label="Name" htmlFor={`lws-c${i}-n`}>
                      <input id={`lws-c${i}-n`} className="vs-input" value={c.name} maxLength={40} placeholder="e.g. Kabir" onChange={(e) => setContact(i, "name", e.target.value)} />
                    </Field>
                    <Field label="Relation" htmlFor={`lws-c${i}-r`}>
                      <input id={`lws-c${i}-r`} className="vs-input" value={c.relation} maxLength={40} placeholder="e.g. Groom's brother" onChange={(e) => setContact(i, "relation", e.target.value)} />
                    </Field>
                    <Field label="Phone" htmlFor={`lws-c${i}-p`} hint={bad ? <span className="lws-err">A 10-digit mobile number, with or without +91.</span> : undefined}>
                      <input id={`lws-c${i}-p`} className="vs-input" type="tel" inputMode="tel" value={c.phone} maxLength={20} placeholder="+91 98XXX XXXXX" aria-invalid={bad} onChange={(e) => setContact(i, "phone", e.target.value)} />
                    </Field>
                  </div>
                  <button type="button" className="lws-x" onClick={() => set("contacts", contacts.filter((_, j) => j !== i))}>
                    Remove
                  </button>
                </li>
              );
            })}
          </ol>
          {contacts.length < 4 && (
            <button type="button" className="lws-chip" onClick={() => set("contacts", [...contacts, { name: "", relation: "", phone: "" }])}>
              + Add a person
            </button>
          )}

          <h4 className="lws-h4">Shagun (optional)</h4>
          <p className="lws-hint">Off unless you add a UPI ID. Guests see a polite line (“your blessings are enough…”), a UPI button on phones and a copyable ID. We never handle the money.</p>
          <div className="vs-row2">
            <Field label="UPI ID" htmlFor="lws-upi" hint={upiId && !isUpiId(upiId) ? <span className="lws-err">That doesn&apos;t look like a UPI ID (name@bank).</span> : undefined}>
              <input id="lws-upi" className="vs-input" value={upiId} maxLength={60} placeholder="e.g. ananya.iyer@okhdfcbank" autoComplete="off" onChange={(e) => set("upiId", e.target.value.trim())} />
            </Field>
            <Field label="Name on the account" htmlFor="lws-upin">
              <input id="lws-upin" className="vs-input" value={s(x.upiName)} maxLength={60} placeholder="e.g. Ananya Iyer" onChange={(e) => set("upiName", e.target.value)} />
            </Field>
          </div>

          <h4 className="lws-h4">Extras</h4>
          <Field label="Livestream link (optional)" htmlFor="lws-live" hint={liveUrl && !/^https:\/\//i.test(liveUrl) ? <span className="lws-err">Paste the full https:// link.</span> : "YouTube Live or Zoom. The “Watch live” button switches on 30 minutes before the main ceremony."}>
            <input id="lws-live" className="vs-input" inputMode="url" value={liveUrl} maxLength={300} placeholder="https://youtube.com/live/…" onChange={(e) => set("liveUrl", e.target.value.trim())} />
          </Field>
          <div className="vs-row2">
            <Field label="Pre-wedding film (YouTube link)" htmlFor="lws-vid">
              <input id="lws-vid" className="vs-input" inputMode="url" value={s(x.videoUrl)} maxLength={200} placeholder="https://youtu.be/…" onChange={(e) => set("videoUrl", e.target.value.trim())} />
            </Field>
            <Field label="Wedding hashtag" htmlFor="lws-tag">
              <input id="lws-tag" className="vs-input" value={s(x.hashtag)} maxLength={40} placeholder="#AnanyaWedsArjun" onChange={(e) => set("hashtag", e.target.value)} />
            </Field>
          </div>

          <h4 className="lws-h4">RSVP</h4>
          <p className="lws-hint">Replies come to your email, with a running total.</p>
          <div className="lws-row3">
            <Field label="Reply by" htmlFor="lws-by">
              <input id="lws-by" type="date" className="vs-input" value={s(x.rsvpBy)} onChange={(e) => set("rsvpBy", e.target.value)} />
            </Field>
            <Field label="Max guests per reply" htmlFor="lws-max">
              <input id="lws-max" type="number" min={1} max={10} className="vs-input" value={n(x.maxGuests) || 4} onChange={(e) => set("maxGuests", Math.min(10, Math.max(1, Math.round(Number(e.target.value) || 1))))} />
            </Field>
          </div>
          <label className="lws-tog">
            <input type="checkbox" checked={x.rsvpMeal !== false} onChange={(e) => set("rsvpMeal", e.target.checked)} /> Ask for a meal preference (veg / non-veg / Jain)
          </label>
          <label className="lws-tog">
            <input type="checkbox" checked={x.blessings !== false} onChange={(e) => set("blessings", e.target.checked)} /> Show the blessings wall
          </label>
          <label className="lws-tog">
            <input type="checkbox" checked={x.invocation !== false} onChange={(e) => set("invocation", e.target.checked)} /> Open with “Shri Ganeshay Namah” and Ganesha
          </label>
          <label className="lws-tog">
            <input type="checkbox" checked={x.lang === "hi"} onChange={(e) => set("lang", e.target.checked ? "hi" : "en")} /> Open the invitation in Hindi (guests can switch)
          </label>

          <h4 className="lws-h4">The finish</h4>
          <Field label="Closing line" htmlFor="lws-end" hint="Under the Shubh Vivah seal at the very end.">
            <input id="lws-end" className="vs-input" value={mf.endLine} maxLength={90} placeholder="With love, the Sharma & Mehta families" onChange={(e) => updateMf("endLine", e.target.value)} />
          </Field>
          {password && (
            <Field label="Password (optional)" htmlFor="lws-pw" hint="Guests type it to open the invitation. Leave empty for no lock.">
              <input id="lws-pw" className="vs-input" value={password.value} maxLength={128} placeholder="e.g. the bride's nickname" autoComplete="off" onChange={(e) => password.set(e.target.value)} />
            </Field>
          )}

          <h4 className="lws-h4">Send to guests</h4>
          <div className="lws-guest">
            <p className="lws-hint">Type a family&apos;s name to get their own link. The lotus opens with “Dear Sharma family, you are invited”, and their RSVP is already signed.</p>
            <div className="lws-guest-row">
              <input className="vs-input" value={guestName} maxLength={40} placeholder="e.g. Sharma family" aria-label="Guest name for a personal link" onChange={(e) => setGuestName(e.target.value)} disabled={!shareUrl} />
            </div>
            {shareUrl ? (
              <>
                <p className="lws-guest-link">{guestLink}</p>
                <div className="lws-ev-tools">
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
                  <a className="lws-wa" href={`https://wa.me/?text=${encodeURIComponent(`🪷 ${guestName ? `Dear ${guestName}, ` : ""}you're invited to the wedding of ${mf.recipientName} & ${mf.senderName}\n${guestLink}`)}`} target="_blank" rel="noopener noreferrer">
                    Send on WhatsApp
                  </a>
                </div>
              </>
            ) : (
              <p className="lws-hint">
                <b>Publish first.</b> Personal links appear here once your invitation is live.
              </p>
            )}
          </div>
        </details>
      </section>
    </div>
  );
}

const LWS_CSS = `
.rs { --lws-gold: #b8892e; --lws-sage: #4E6E5D; --lws-pink: #9C3A57; }
.lws-hint { margin: 2px 0 10px; font-size: 13px; line-height: 1.45; opacity: .72; }
.lws-count { font-weight: 500; opacity: .6; }
.lws-sub { margin: 4px 0 10px; font-size: 13px; font-weight: 700; color: var(--vw-accent); }
.lws-row3 { display: grid; gap: 0 10px; grid-template-columns: 1fr 1fr; }
.lws-row3 > :last-child:nth-child(3) { grid-column: 1 / -1; }
@media (min-width: 560px) { .lws-row3 { grid-template-columns: 1fr 1fr 1.4fr; } .lws-row3 > :last-child:nth-child(3) { grid-column: auto; } .lws-row3-tight { grid-template-columns: 1.3fr 1fr 1fr; } .lws-row3-story { grid-template-columns: 1fr 3fr; } }
.lws-ai { position: relative; overflow: hidden; margin: 6px 0 4px; padding: 20px 18px 18px; border-radius: 22px; background: radial-gradient(70% 90% at 100% 0%, rgba(240,162,186,.35), transparent 60%), linear-gradient(140deg, #2F4A3E, #4E6E5D 60%, #6F8F7D); color: #FBF4E2; box-shadow: 0 18px 40px -24px rgba(47,74,62,.8); }
.lws-ai::after { content: "🪷"; position: absolute; right: 14px; top: 10px; font-size: 34px; opacity: .5; }
.lws-ai::before { content: ""; position: absolute; inset: 0; border-radius: inherit; padding: 1px; background: linear-gradient(110deg,#8a6a1f,#e9cf7a 35%,#fff3c4 50%,#c9a43f 65%,#7a5a14); -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; }
.lws-ai-k { margin: 0; font: 700 11px/1 var(--vw-font-ui); letter-spacing: .24em; color: #e9cf7a; }
.lws-ai-h { margin: 8px 0 4px; font: 600 21px/1.2 var(--vw-font-serif); }
.lws-ai-p { margin: 0 0 12px; font-size: 13.5px; opacity: .85; }
.lws-ai-in { background: rgba(255,248,235,.97) !important; min-height: 116px; font-size: 15px !important; line-height: 1.5 !important; }
.lws-ai .lws-chip { background: rgba(255,236,214,.1); color: #fbecd4; border-color: rgba(233,207,122,.35); }
.lws-ai-go { margin-top: 12px; width: 100%; min-height: 50px; border: 0; border-radius: 999px; cursor: pointer; font: 700 15.5px/1 var(--vw-font-ui); color: #2F4A3E; background: linear-gradient(110deg,#c9a43f,#e9cf7a 40%,#fff3c4 55%,#d9b05c); box-shadow: 0 10px 24px -12px rgba(233,207,122,.8); }
.lws-ai-go:disabled { opacity: .75; cursor: progress; }
.lws-ai-note { margin: 10px 0 0; font-size: 13.5px; color: #ffcfc4; }
.lws-ai-note.is-ok { color: #e9cf7a; }
.lws-chips, .lws-quick { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; align-items: center; }
.lws-quick > span { font-size: 12px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; opacity: .6; }
.lws-chip { min-height: 38px; padding: 0 14px; border-radius: 999px; border: 1.5px solid var(--vw-edge); background: var(--vw-paper); color: var(--vw-paper-ink); font: 600 13px/1 var(--vw-font-ui); cursor: pointer; }
.lws-chip:hover { border-color: var(--vw-accent); }
.lws-seg { display: flex; gap: 6px; padding: 4px; margin: 0 0 18px; border-radius: 999px; background: var(--vw-soft); width: fit-content; max-width: 100%; }
.lws-seg button { min-height: 40px; padding: 0 14px; border: 0; border-radius: 999px; background: none; font: 600 13.5px/1 var(--vw-font-ui); color: var(--vw-paper-ink); cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 44vw; }
.lws-seg button[aria-checked=true] { background: var(--vw-accent); color: var(--vw-accent-ink); }
.lws-evs { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
.lws-ev { border: 1.5px solid var(--vw-edge); border-radius: 16px; background: var(--vw-paper); overflow: hidden; }
.lws-ev.is-open { border-color: var(--lws-gold); box-shadow: 0 12px 30px -22px rgba(47,74,62,.5); }
.lws-ev-head { display: flex; align-items: center; gap: 12px; width: 100%; min-height: 60px; padding: 10px 14px; border: 0; background: none; text-align: left; cursor: pointer; color: var(--vw-paper-ink); }
.lws-ev-sw { flex: none; width: 22px; height: 22px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 0 1.5px var(--lws-gold); }
.lws-ev-t { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.lws-ev-t b { font: 600 17px/1.2 var(--vw-font-serif); }
.lws-ev-t small { font-size: 12.5px; opacity: .65; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lws-ev-chev { font-size: 22px; line-height: 1; color: var(--vw-accent); width: 24px; text-align: center; }
.lws-ev-body { padding: 4px 14px 14px; border-top: 1px dashed var(--vw-edge); }
.lws-ev-tools, .lws-ch-tools { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.lws-ev-tools button, .lws-x { min-height: 40px; padding: 0 14px; border-radius: 999px; border: 1.5px solid var(--vw-edge); background: none; font: 600 13px/1 var(--vw-font-ui); color: var(--vw-paper-ink); cursor: pointer; }
.lws-ev-tools button:disabled { opacity: .35; cursor: default; }
.lws-ev-tools .is-danger, .lws-x { color: #b3261e; }
.lws-sws { display: flex; flex-wrap: wrap; gap: 8px; margin: -8px 0 16px; }
.lws-sw { position: relative; width: 34px; height: 34px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 0 1.5px var(--vw-edge); cursor: pointer; padding: 0; }
.lws-sw[aria-checked=true] { box-shadow: 0 0 0 2.5px var(--vw-accent); }
.lws-sw-custom { background: conic-gradient(#f2c94c, #4f9b6a, #2e5aac, #7b3fa0, #e86a92, #a3122b, #f2c94c); overflow: hidden; }
.lws-sw-custom input { position: absolute; inset: 0; opacity: 0; width: 100%; height: 100%; cursor: pointer; }
.lws-letter { min-height: 200px; font-family: var(--vw-font-serif); font-size: 16px; line-height: 1.6; }
.lws-more > summary { list-style: none; cursor: pointer; }
.lws-more > summary::-webkit-details-marker { display: none; }
.lws-more > summary .vs-secH::after { content: " ▾"; color: var(--vw-accent); }
.lws-more[open] > summary .vs-secH::after { content: " ▴"; }
.lws-h4 { margin: 22px 0 6px; font: 700 12px/1 var(--vw-font-ui); letter-spacing: .14em; text-transform: uppercase; color: var(--vw-accent); }
.lws-story { list-style: none; margin: 0 0 10px; padding: 0; display: grid; gap: 12px; }
.lws-ch { padding: 12px; border: 1.5px solid var(--vw-edge); border-radius: 16px; background: var(--vw-paper); }
.lws-thing { margin-bottom: 8px; }
.lws-tog { display: flex; gap: 10px; align-items: center; min-height: 44px; font-size: 14.5px; cursor: pointer; }
.lws-tog input { width: 20px; height: 20px; accent-color: var(--vw-accent); }
.lws-pick { margin: 0 0 14px; }
.lws-pick-btn { display: inline-flex; align-items: center; gap: 10px; min-height: 48px; padding: 4px 14px 4px 4px; border-radius: 999px; border: 1.5px dashed var(--vw-edge); background: var(--vw-paper); color: var(--vw-paper-ink); font: 600 13px/1.2 var(--vw-font-ui); cursor: pointer; }
.lws-pick-btn img, .lws-pick-btn > span:first-child { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; display: grid; place-items: center; background: var(--vw-soft); font-size: 18px; }
.lws-pick-strip { display: flex; gap: 8px; overflow-x: auto; padding: 10px 2px 6px; scroll-snap-type: x proximity; }
.lws-themes { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
@media (max-width: 520px) { .lws-themes { grid-template-columns: 1fr; } }
.lws-theme { display: flex; flex-direction: column; gap: 3px; padding: 8px 8px 12px; border-radius: 16px; border: 2px solid var(--vw-edge, #DCCFAE); background: var(--vw-paper, #FFFDF8); text-align: left; cursor: pointer; color: var(--vw-paper-ink, #2A3A32); font: 500 12.5px/1.35 var(--vw-font-ui); }
.lws-theme.is-on { border-color: var(--vw-accent, #4E6E5D); box-shadow: 0 10px 24px -16px rgba(47,74,62,.7); }
.lws-theme:focus-visible { outline: 3px solid #C9A24A; outline-offset: 2px; }
.lws-theme b { margin-top: 6px; font-size: 14px; }
.lws-theme small { font-size: 12px; opacity: .75; }
.lws-theme-card { position: relative; display: grid; place-items: center; gap: 4px; height: 96px; border-radius: 11px; border: 1px solid rgba(201,162,74,.5); padding: 10px 0 16px; }
.lws-theme-lotus { font-size: 20px; line-height: 1; }
.lws-theme-names { font: italic 500 20px/1 Georgia, serif; }
.lws-theme-bar { position: absolute; left: 24%; right: 24%; bottom: 10px; height: 3px; border-radius: 3px; }
.lws-pick-th, .lws-pick-none { flex: none; width: 64px; height: 64px; border-radius: 12px; border: 2px solid transparent; padding: 0; overflow: hidden; background: var(--vw-soft); cursor: pointer; scroll-snap-align: start; font: 600 12px/1 var(--vw-font-ui); color: var(--vw-paper-ink); }
.lws-pick-th img { width: 100%; height: 100%; object-fit: cover; display: block; }
.lws-pick-th.is-on, .lws-pick-none.is-on { border-color: var(--vw-accent); }
.lws-dash { margin: 4px 0 12px; border: 1.5px solid var(--vw-edge); border-radius: 16px; padding: 0 14px; background: var(--vw-paper); }
.lws-pick-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.lws-frame-btn { min-height: 44px; padding: 0 14px; border-radius: 999px; border: 1.5px solid var(--vw-edge); background: var(--vw-paper); color: var(--lws-sage); font: 600 13px/1 var(--vw-font-ui); cursor: pointer; }
.lws-err { color: #b3261e; opacity: 1; }
.lws-contact { display: grid; gap: 4px; }
.lws-contact .lws-x { justify-self: start; }
.lws-guest { padding: 14px; border-radius: 18px; border: 1.5px dashed var(--vw-edge); background: linear-gradient(140deg, #FFFDF8, #F3F6F0); }
.lws-guest-row { margin-bottom: 8px; }
.lws-guest-link { margin: 0 0 10px; padding: 10px 12px; border-radius: 12px; background: #fff; border: 1px solid var(--vw-edge); font: 500 12.5px/1.4 ui-monospace, monospace; word-break: break-all; }
.lws-wa { display: inline-flex; align-items: center; min-height: 40px; padding: 0 16px; border-radius: 999px; background: #25D366; color: #fff; font: 700 13px/1 var(--vw-font-ui); text-decoration: none; }
.vs-secN { background: linear-gradient(140deg, #6F8F7D, #4E6E5D) !important; color: #FFFDF6 !important; }
.lws-dash > summary { min-height: 52px; display: flex; align-items: center; font: 700 15px/1 var(--vw-font-ui); cursor: pointer; color: var(--vw-accent); }
`;
