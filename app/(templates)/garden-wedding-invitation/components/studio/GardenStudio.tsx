"use client";

// ─── Mughal Garden Wedding Invitation — the studio (the whole form) ──────────
//
// On top, "Describe your wedding" (the AI fills the names, families, five
// functions with dress codes, the English + Hindi invitation, the story, a
// family contact and good-to-know). Then six garden-styled steps, each with an
// icon, that match the sheet's side nav (id="vs-sec-<id>"):
//   1 The couple       names, order, families, the big day + muhurat
//   2 Functions        add / reorder / remove (6 s undo), dress-code swatches
//   3 Photos           one pool of 40: resize (wide / tall / large), focal
//                      point + zoom, reorder (MasonryEditor)
//   4 Invitation       English + Hindi side by side
//   5 Theme & music    light themes, curated wedding songs or any YouTube link
//   6 Guests & more    personal ?to= links, family contacts, shagun, livestream,
//                      story (photos croppable), families, good to know, film,
//                      RSVP settings, closing line, password
// The owner's guest replies + blessings open above the form on a saved page.

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { MasonryEditor, RsvpDashboard, ThemePicker, WEDDING_THEMES, cdn } from "../../../_wedding";
import { LIGHT_THEMES } from "../../../_wedding/themes";
import { compressImage } from "../../../dedication/components/mediaUploads";
import MusicPicker from "../../../_valentine/editor/MusicPicker";
import PhotoCropper, { clampCrop, cropImgStyle, type Crop } from "../../../_valentine/editor/PhotoCropper";
import type { StudioProps } from "../../../_valentine/editor/studios";
import type { LovePhoto } from "../../../_valentine/types";
import { GW_LIMITS, gardenWeddingDay, gwLocalPhotos, gwStoredUrl } from "../../../_valentine/days/garden-wedding-invitation";
import { API_URL, IS_NGROK } from "@/lib/config";
import { GW } from "../assets";
import { MAIN_RE, dialOf, isUpiId, swatchFor } from "../gw/model";
import { copyText, personalUrl, whatsappUrl } from "../gw/guest";

const SLUG = "garden-wedding-invitation";
type Row = Record<string, unknown>;
type Chapter = { when: string; title: string; line: string; photo: number };
type Contact = { name: string; relation: string; phone: string };

const DEMO = gardenWeddingDay.demo.extras;

const QUICK_FUNCTIONS: { title: string; dress: string; color: string }[] = [
  { title: "Roka", dress: "Festive pastels", color: "#E86A92" },
  { title: "Tilak", dress: "Traditional", color: "#EE8A2E" },
  { title: "Haldi", dress: "Shades of yellow", color: "#F2C94C" },
  { title: "Mehendi", dress: "Greens and bright florals", color: "#4F9B6A" },
  { title: "Sangeet", dress: "Pastel Indo-western", color: "#E86A92" },
  { title: "Baraat", dress: "Sherwanis and safas", color: "#EE8A2E" },
  { title: "Wedding (Pheras)", dress: "Traditional, soft pastels", color: "#F4C9D4" },
  { title: "Cocktail", dress: "Cocktail chic", color: "#1C1C24" },
  { title: "Reception", dress: "Evening formal", color: "#2E5AAC" },
];
const SWATCHES = ["#F2C94C", "#4F9B6A", "#9DB89A", "#F4C9D4", "#E86A92", "#A3122B", "#7B3FA0", "#BFD8EC", "#2E5AAC", "#EE8A2E", "#F3EBDD", "#1C1C24"];
const AI_CHIPS = ["Make it warm", "Make it formal", "Add Hindi", "Mention our families", "Keep it short"];

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

// ── Icons for the step headers (stroke, currentColor) ───────────────────────
const STEP_ICON: Record<string, string> = {
  names: "M8.5 14.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM15.5 18.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM8.5 2.5l1 2M15.5 6.5l1-2",
  details: "M7 3v3M17 3v3M4 8.5h16M5 5.5h14a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1zM12 12.5c1.4-1.6 3.6-.4 2.6 1.4L12 16.5l-2.6-2.6c-1-1.8 1.2-3 2.6-1.4z",
  photos: "M4 7.5h3l1.6-2.5h6.8L17 7.5h3a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8.5a1 1 0 0 1 1-1zM12 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z",
  letter: "M3.5 6.5h17v11a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1zM3.5 6.5 12 13l8.5-6.5",
  music: "M9 18V6l11-2v12M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z",
  finish: "M12 21c-4-3-7-6-7-10a7 7 0 0 1 14 0c0 4-3 7-7 10zM12 8c1.6 1.8 1.6 3.6 0 5.4-1.6-1.8-1.6-3.6 0-5.4zM8.7 11.6c1.6 0 2.8.8 3.3 1.8-1.8.6-3 .2-3.3-1.8zM15.3 11.6c-1.6 0-2.8.8-3.3 1.8 1.8.6 3 .2 3.3-1.8z",
};
function StepIcon({ id }: { id: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden focusable="false">
      <path d={STEP_ICON[id] ?? STEP_ICON.finish} />
    </svg>
  );
}

function Field({ label, hint, children, htmlFor, count, error }: { label: string; hint?: ReactNode; children: ReactNode; htmlFor?: string; count?: string; error?: string }) {
  return (
    <div className={`vs-field${error ? " gws-has-err" : ""}`}>
      <label className="vs-label" htmlFor={htmlFor}>
        <span>{label}</span>
        {count && <small className="gws-count">{count}</small>}
      </label>
      {children}
      {error ? (
        <p className="gws-err" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="gws-hint">{hint}</p>
      )}
    </div>
  );
}

function Head({ id, n: num, title, sub }: { id: string; n: number | string; title: string; sub?: string }) {
  return (
    <header className="vs-secHead gws-head">
      <span className="gws-head-ic" aria-hidden>
        <StepIcon id={id} />
        <b>{num}</b>
      </span>
      <div style={{ minWidth: 0 }}>
        <h3 className="vs-secH">{title}</h3>
        {sub && <p className="vs-secSub">{sub}</p>}
      </div>
    </header>
  );
}

/** A photo from the pool (1-based), "none" (0), or a new upload appended to the pool; "Crop" frames it. */
function PhotoPick({
  value,
  photos,
  onPick,
  onUpload,
  onCrop,
  label,
}: {
  value: number;
  photos: LovePhoto[];
  onPick: (k: number) => void;
  onUpload: (f: File) => void;
  onCrop: (k: number) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const cur = value >= 1 && value <= photos.length ? photos[value - 1] : null;
  const file = useRef<HTMLInputElement>(null);
  return (
    <div className="gws-pick">
      <div className="gws-pick-row">
        <button type="button" className="gws-pick-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          {cur ? (
            <span className="gws-pick-th0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cur.url} alt="" style={cropImgStyle(clampCrop({ x: cur.cropX ?? 50, y: cur.cropY ?? 50, scale: cur.scale ?? 100 }))} />
            </span>
          ) : (
            <span className="gws-pick-th0" aria-hidden>
              ＋
            </span>
          )}
          <span>{cur ? `${label}: photo ${value}` : `${label}: add a photo`}</span>
        </button>
        {cur && (
          <button type="button" className="gws-mini" onClick={() => onCrop(value)}>
            Crop &amp; zoom
          </button>
        )}
      </div>
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

/** "Send to guests": a personal ?to= link per family (needs the published link). */
function PersonalLinks({ base, couple }: { base: string | null; couple: string }) {
  const [name, setName] = useState("");
  const [done, setDone] = useState(false);
  const link = base ? personalUrl(base, name) : "";
  return (
    <div className="gws-links">
      <p className="gws-links-k">✦ Send to guests</p>
      <h4 className="gws-links-h">A personal link for every family</h4>
      <p className="gws-hint">Type a name and the invitation opens with “Dear {name.trim() || "Sharma family"}, you are warmly invited”, and their RSVP starts with that name.</p>
      {base ? (
        <>
          <input className="vs-input" value={name} maxLength={40} placeholder="e.g. Sharma family" onChange={(e) => setName(e.target.value)} aria-label="Guest's name" />
          <div className="gws-links-row">
            <code className="gws-links-url">{link}</code>
          </div>
          <div className="gws-links-row">
            <button
              type="button"
              className="gws-chip"
              disabled={!name.trim()}
              onClick={async () => {
                if (await copyText(link)) {
                  setDone(true);
                  window.setTimeout(() => setDone(false), 1800);
                }
              }}
            >
              {done ? "Copied ✓" : "Copy link"}
            </button>
            <a
              className={`gws-chip gws-chip-wa${name.trim() ? "" : " is-off"}`}
              aria-disabled={!name.trim()}
              href={name.trim() ? whatsappUrl(`Dear ${name.trim()}, with great joy we invite you to the wedding of ${couple} 🌸\n${link}`) : undefined}
              target="_blank"
              rel="noopener noreferrer"
            >
              Send on WhatsApp
            </a>
          </div>
        </>
      ) : (
        <p className="gws-note">Publish your invitation first. Then come back here to make a link for each family.</p>
      )}
    </div>
  );
}

export default function GardenStudio({ mf, updateMf, updateExtra, ai, password, owner }: StudioProps) {
  const x = mf.extras as Row;
  const events = useMemo(() => (Array.isArray(x.events) ? (x.events as Row[]) : []), [x.events]);
  const story = useMemo(() => (Array.isArray(x.story) ? (x.story as Chapter[]) : []), [x.story]);
  const things = useMemo(() => (Array.isArray(x.things) ? (x.things as string[]) : []), [x.things]);
  const contacts = useMemo(() => (Array.isArray(x.contacts) ? (x.contacts as Contact[]) : []), [x.contacts]);
  // Demo art is stored as https://subhsandesh.in/wedding-v3/… and shown from this host's public/.
  const photos = useMemo(() => gwLocalPhotos(mf.photos), [mf.photos]);
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
      // Never leave the demo family's phone numbers on a real couple's page.
      const dContacts = DEMO.contacts as unknown as Row[];
      const cs = (Array.isArray(cur.contacts) ? (cur.contacts as Row[]) : [])
        .map((c, i) => {
          if (!touched(`extras.contacts[${i}]`)) return c;
          const d = dContacts[i] ?? {};
          // The model writes name + phone; a relation left from the demo goes.
          return s(c.relation) === s(d.relation) ? { ...c, relation: "" } : c;
        })
        .filter((c, i) => touched(`extras.contacts[${i}]`) || !same(c, dContacts[i], ["name", "phone"]));
      set("contacts", cs);
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
    const capped = next.slice(0, GW_LIMITS.photos).map((p) => (gwStoredUrl(p.url) === p.url ? p : { ...p, url: gwStoredUrl(p.url) }));
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

  // ── Crop one photo of the pool (story chapters: 4:5; family cards: square, both rounded rectangles) ─
  const [crop, setCrop] = useState<{ k: number; aspect: number; title: string } | null>(null);
  const cropPhoto = crop ? photos[crop.k - 1] : null;
  const setCropOf = (k: number, c: Crop) => {
    const cc = clampCrop(c);
    updateMf(
      "photos",
      latest.current.photos.map((p, i) => (i === k - 1 ? { ...p, cropX: Math.round(cc.x), cropY: Math.round(cc.y), scale: Math.round(cc.scale) } : p)),
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
    if (events.length >= GW_LIMITS.events) return;
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
  const restoreEvent = () => {
    if (!undo) return;
    const cur = (latest.current.extras.events as Row[]) ?? [];
    if (cur.length >= GW_LIMITS.events) return;
    const next = [...cur];
    next.splice(Math.min(undo.at, next.length), 0, undo.row);
    set("events", next);
    setUndo(null);
  };

  // ── Contacts ───────────────────────────────────────────────────────────────
  const setContact = (i: number, k: keyof Contact, v: string) => set("contacts", contacts.map((c, j) => (j === i ? { ...c, [k]: v } : c)));

  // ── Owner: guest replies + the published link (StudioProps.owner) ──────────
  const pageId = owner?.pageId ?? null;
  const token = owner?.token ?? null;
  const published = !!owner?.published;
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!published || !pageId || !token) return;
    let live = true;
    void fetch(`${API_URL}/${SLUG}-pages/${pageId}`, { headers: { Authorization: `Bearer ${token}`, ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}) } })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        const u = j?.data?.shareUrl;
        if (live && typeof u === "string" && /^https?:\/\//.test(u)) setShareUrl(u);
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [published, pageId, token]);

  const letter = mf.letter;
  const hindi = s(x.hindiMessage);
  const main = events[mainIdx];
  const couple = `${mf.recipientName || "Bride"} & ${mf.senderName || "Groom"}`;
  const upi = s(x.upiId).trim();
  const live = s(x.liveUrl).trim();
  const vid = s(x.videoUrl).trim();

  return (
    <div className="rs gws">
      <style>{GWS_CSS}</style>

      {pageId && token && (
        <details className="gws-dash">
          <summary>Guest replies &amp; blessings</summary>
          <RsvpDashboard slug={SLUG} pageId={pageId} token={token} csvName="wedding-rsvps" />
        </details>
      )}

      {ai?.available && fill && (
        <section className="gws-ai" aria-labelledby="gws-ai-h">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="gws-ai-art" src={cdn(GW.lanterns.src)} width={GW.lanterns.w} height={GW.lanterns.h} alt="" aria-hidden decoding="async" />
          <p className="gws-ai-k">✦ Written for you</p>
          <h3 className="gws-ai-h" id="gws-ai-h">
            Describe your wedding in a few lines
          </h3>
          <p className="gws-ai-p">We&apos;ll fill in everything below: names, families, every function, the Hindi invitation and your story.</p>
          <textarea
            className="vs-input vs-area gws-ai-in"
            rows={4}
            value={desc}
            maxLength={1500}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Ishita and Kabir are getting married on 20 Feb 2027 at Rambagh Palace, Jaipur. Haldi and Mehendi on the 18th at Samode Bagh, Sangeet on the 19th, pheras at 6:30 pm, reception on the 21st. We met at a bus stop in the Jaipur rain in 2018. For anything, call her brother Rohan on 98765 43210."
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

      {/* ── 1 · The couple ─────────────────────────────────────────────── */}
      <section className="vs-sec" id="vs-sec-names" aria-label="The couple">
        <Head id="names" n={1} title="The couple" sub="Names as you'd like them printed, and the big day." />
        <div className="vs-row2">
          <Field label="Bride's name" htmlFor="gws-bride">
            <input id="gws-bride" className="vs-input" value={mf.recipientName} maxLength={30} placeholder="e.g. Ishita" onChange={(e) => updateMf("recipientName", e.target.value)} />
          </Field>
          <Field label="Groom's name" htmlFor="gws-groom">
            <input id="gws-groom" className="vs-input" value={mf.senderName} maxLength={30} placeholder="e.g. Kabir" onChange={(e) => updateMf("senderName", e.target.value)} />
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
          <Field label="Bride's family" htmlFor="gws-bf" hint="Her parents, as the card prints them.">
            <input id="gws-bf" className="vs-input" value={s(x.brideFamily)} maxLength={120} placeholder="e.g. Mrs. Radhika & Mr. Sameer Khanna" onChange={(e) => set("brideFamily", e.target.value)} />
          </Field>
          <Field label="Groom's family" htmlFor="gws-gf" hint="His parents.">
            <input id="gws-gf" className="vs-input" value={s(x.groomFamily)} maxLength={120} placeholder="e.g. Mrs. Anjali & Mr. Vivek Malhotra" onChange={(e) => set("groomFamily", e.target.value)} />
          </Field>
        </div>
        {main && (
          <div className="gws-bigday">
            <p className="gws-sub">🌸 The big day · the countdown, the calendar invites and the card use it ({s(main.title) || "the wedding"})</p>
            <div className="gws-row3">
              <Field label="Date" htmlFor="gws-date">
                <input id="gws-date" type="date" className="vs-input" value={s(main.date)} onChange={(e) => setEvent(mainIdx, "date", e.target.value)} />
              </Field>
              <Field label="Time" htmlFor="gws-time">
                <input id="gws-time" type="time" className="vs-input" value={s(main.time)} onChange={(e) => setEvent(mainIdx, "time", e.target.value)} />
              </Field>
              <Field label="Muhurat (optional)" htmlFor="gws-muh">
                <input id="gws-muh" className="vs-input" value={s(x.muhurat)} maxLength={60} placeholder="e.g. Shubh muhurat 8:40 pm" onChange={(e) => set("muhurat", e.target.value)} />
              </Field>
            </div>
          </div>
        )}
      </section>

      {/* ── 2 · Functions ──────────────────────────────────────────────── */}
      <section className="vs-sec" id="vs-sec-details" aria-label="Functions">
        <Head id="details" n={2} title="Functions" sub={`Up to ${GW_LIMITS.events}. Each gets its own painted card with timings, a map, the dress code and a calendar button.`} />
        <ol className="gws-evs">
          {events.map((e, i) => {
            const isOpen = openEv === i;
            const sw = swatchFor({ dressCode: s(e.dressCode), dressColor: s(e.dressColor) });
            const mapBad = !!s(e.mapUrl) && !/^https:\/\//i.test(s(e.mapUrl));
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
                        <input id={`gws-e${i}-v`} className="vs-input" value={s(e.venue)} maxLength={80} placeholder="e.g. The Mughal Gardens, Rambagh Palace" onChange={(ev) => setEvent(i, "venue", ev.target.value)} />
                      </Field>
                      <Field label="Address" htmlFor={`gws-e${i}-a`}>
                        <input id={`gws-e${i}-a`} className="vs-input" value={s(e.address)} maxLength={140} placeholder="Street, city" onChange={(ev) => setEvent(i, "address", ev.target.value)} />
                      </Field>
                    </div>
                    <Field
                      label="Google Maps link (optional)"
                      htmlFor={`gws-e${i}-m`}
                      hint="Paste the share link from Google Maps. Empty: we search the venue and address."
                      error={mapBad ? "That doesn't look like a link. It should start with https://" : undefined}
                    >
                      <input id={`gws-e${i}-m`} className="vs-input" inputMode="url" value={s(e.mapUrl)} maxLength={400} placeholder="https://maps.app.goo.gl/…" onChange={(ev) => setEvent(i, "mapUrl", ev.target.value.trim())} />
                    </Field>
                    <Field label="Dress code" htmlFor={`gws-e${i}-dc`} hint="Short and clear: “Shades of yellow”, “Pastel Indo-western”.">
                      <input id={`gws-e${i}-dc`} className="vs-input" value={s(e.dressCode)} maxLength={60} placeholder="e.g. Shades of yellow" onChange={(ev) => setEvent(i, "dressCode", ev.target.value)} />
                    </Field>
                    <div className="gws-sws" role="radiogroup" aria-label="Dress-code colour">
                      {SWATCHES.map((c) => (
                        <button key={c} type="button" role="radio" aria-checked={s(e.dressColor).toLowerCase() === c.toLowerCase()} aria-label={c} className="gws-sw" style={{ background: c }} onClick={() => setEvent(i, "dressColor", c)} />
                      ))}
                      <label className="gws-sw gws-sw-custom" aria-label="Custom colour">
                        <input type="color" value={/^#[0-9a-f]{6}$/i.test(s(e.dressColor)) ? s(e.dressColor) : "#c08a5c"} onChange={(ev) => setEvent(i, "dressColor", ev.target.value)} />
                      </label>
                    </div>
                    <Field label="A line for guests (optional)" htmlFor={`gws-e${i}-n`}>
                      <textarea id={`gws-e${i}-n`} className="vs-input vs-area" rows={2} value={s(e.note)} maxLength={200} placeholder="e.g. The baraat leaves the hotel at 6:30 pm sharp." onChange={(ev) => setEvent(i, "note", ev.target.value)} />
                    </Field>
                    <div className="gws-ev-tools">
                      <button type="button" onClick={() => moveEvent(i, -1)} disabled={i === 0}>
                        ↑ Earlier
                      </button>
                      <button type="button" onClick={() => moveEvent(i, 1)} disabled={i === events.length - 1}>
                        ↓ Later
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
          <p className="gws-undo" role="status">
            Removed “{s(undo.row.title) || "a function"}”.{" "}
            <button type="button" onClick={restoreEvent}>
              Undo
            </button>
          </p>
        )}
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

      {/* ── 3 · Photos ─────────────────────────────────────────────────── */}
      <section className="vs-sec" id="vs-sec-photos" aria-label="Photos">
        <Head id="photos" n={3} title="Photos" sub={`Up to ${GW_LIMITS.photos}. Tap a photo to make it wide, tall or large, set its focus and zoom. Drag ⠿ to reorder. Photos used in your story or on a family card don't repeat in the album.`} />
        <MasonryEditor photos={photos} onChange={setPhotos} max={GW_LIMITS.photos} mask="rounded" />
      </section>

      {/* ── 4 · The invitation ─────────────────────────────────────────── */}
      <section className="vs-sec" id="vs-sec-letter" aria-label="Your invitation">
        <Head id="letter" n={4} title="Your invitation" sub="The words your guests read first. On wide screens English and Hindi sit side by side; on phones guests switch with EN / हिं." />
        <div className="vs-row2">
          <Field label="In English" htmlFor="gws-letter" count={`${letter.length}/1500`}>
            <textarea id="gws-letter" className="vs-input vs-area gws-letter" rows={8} value={letter} maxLength={1500} placeholder={gardenWeddingDay.copy.letterPlaceholder} onChange={(e) => updateMf("letter", e.target.value)} />
          </Field>
          <Field label="हिन्दी में (optional)" htmlFor="gws-hindi" count={`${hindi.length}/700`}>
            <textarea id="gws-hindi" lang="hi" className="vs-input vs-area gws-letter" rows={8} value={hindi} maxLength={700} placeholder="बड़ों के आशीर्वाद और ईश्वर की कृपा से…" onChange={(e) => set("hindiMessage", e.target.value)} />
          </Field>
        </div>
        <label className="gws-tog">
          <input type="checkbox" checked={x.invocation !== false} onChange={(e) => set("invocation", e.target.checked)} /> Begin with “॥ श्री गणेशाय नमः ॥” on the garden gate
        </label>
        <label className="gws-tog">
          <input type="checkbox" checked={x.lang === "hi"} onChange={(e) => set("lang", e.target.checked ? "hi" : "en")} /> Open the invitation in Hindi (guests can switch)
        </label>
      </section>

      {/* ── 5 · Theme & music ──────────────────────────────────────────── */}
      <section className="vs-sec" id="vs-sec-music" aria-label="Theme and music">
        <Head id="music" n={5} title="Theme & music" sub="Three garden palettes. The song starts when the guest opens the garden gate, never before, and there's always a mute button." />
        <ThemePicker themes={LIGHT_THEMES} grouped={false} value={s(x.theme) || "blush"} onChange={(id) => set("theme", id)} sample={`${(mf.recipientName || "I").slice(0, 1)} & ${(mf.senderName || "K").slice(0, 1)}`} label="Theme" />
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

      {/* ── 6 · Guests & more ──────────────────────────────────────────── */}
      <section className="vs-sec" id="vs-sec-finish" aria-label="Guests and more">
        <Head id="finish" n={6} title="Guests & more" sub="Personal links, who to call, shagun, a livestream, your story, the album extras and RSVP settings." />

        <PersonalLinks base={shareUrl} couple={couple} />

        <h4 className="gws-h4">Who should guests call?</h4>
        <p className="gws-hint">Up to 4 family members. Guests get a Call and a WhatsApp button for each. Indian mobile numbers, with or without +91.</p>
        <ol className="gws-contacts">
          {contacts.map((c, i) => {
            const bad = !!s(c.phone).trim() && !dialOf(s(c.phone));
            return (
              <li key={i} className="gws-ch">
                <div className="gws-row3">
                  <Field label="Name" htmlFor={`gws-c${i}-n`}>
                    <input id={`gws-c${i}-n`} className="vs-input" value={s(c.name)} maxLength={40} placeholder="e.g. Rohan Khanna" onChange={(e) => setContact(i, "name", e.target.value)} />
                  </Field>
                  <Field label="Relation" htmlFor={`gws-c${i}-r`}>
                    <input id={`gws-c${i}-r`} className="vs-input" value={s(c.relation)} maxLength={40} placeholder="e.g. Bride's brother" onChange={(e) => setContact(i, "relation", e.target.value)} />
                  </Field>
                  <Field label="Phone" htmlFor={`gws-c${i}-p`} error={bad ? "10 digits, starting 6–9 (with or without +91)." : undefined}>
                    <input id={`gws-c${i}-p`} className="vs-input" type="tel" inputMode="tel" autoComplete="off" value={s(c.phone)} maxLength={16} placeholder="+91 98765 43210" onChange={(e) => setContact(i, "phone", e.target.value)} />
                  </Field>
                </div>
                <button type="button" className="gws-x" onClick={() => set("contacts", contacts.filter((_, j) => j !== i))}>
                  Remove
                </button>
              </li>
            );
          })}
        </ol>
        {contacts.length < 4 && (
          <button type="button" className="gws-chip" onClick={() => set("contacts", [...contacts, { name: "", relation: "", phone: "" }])}>
            + Add a contact
          </button>
        )}

        <h4 className="gws-h4">Shagun (optional)</h4>
        <p className="gws-hint">Off unless you add a UPI id. Guests see a gentle “Your blessings are all we wish for” with a Pay by UPI button. We never touch the money.</p>
        <div className="vs-row2">
          <Field label="UPI id" htmlFor="gws-upi" error={upi && !isUpiId(upi) ? "A UPI id looks like name@bank." : undefined}>
            <input id="gws-upi" className="vs-input" value={s(x.upiId)} maxLength={60} placeholder="e.g. khannafamily@okhdfcbank" autoComplete="off" onChange={(e) => set("upiId", e.target.value.trim())} />
          </Field>
          <Field label="Name on the account" htmlFor="gws-upin">
            <input id="gws-upin" className="vs-input" value={s(x.upiName)} maxLength={60} placeholder="e.g. Sameer Khanna" onChange={(e) => set("upiName", e.target.value)} />
          </Field>
        </div>

        <h4 className="gws-h4">Livestream (optional)</h4>
        <Field
          label="YouTube or Zoom link"
          htmlFor="gws-live"
          hint="“Watch live” lights up on the wedding card 30 minutes before the pheras, for family who can't travel."
          error={live && !/^https:\/\/\S+$/i.test(live) ? "Paste the full link, starting with https://" : undefined}
        >
          <input id="gws-live" className="vs-input" inputMode="url" value={s(x.liveUrl)} maxLength={300} placeholder="https://youtube.com/live/…" onChange={(e) => set("liveUrl", e.target.value.trim())} />
        </Field>

        <h4 className="gws-h4">Our story</h4>
        <p className="gws-hint">A few moments: how you met, the proposal, the yes. Up to {GW_LIMITS.story}, each with a photo you can crop.</p>
        <ol className="gws-story">
          {story.map((c, i) => (
            <li key={i} className="gws-ch">
              <div className="gws-row3 gws-row3-story">
                <Field label="When" htmlFor={`gws-s${i}-w`}>
                  <input id={`gws-s${i}-w`} className="vs-input" value={c.when} maxLength={24} placeholder="2018" onChange={(e) => set("story", story.map((q, j) => (j === i ? { ...q, when: e.target.value } : q)))} />
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
                  onCrop={(k) => setCrop({ k, aspect: 0.8, title: `Chapter ${i + 1} photo` })}
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
          <input id="gws-bo" className="vs-input" value={s(x.blessingsOf)} maxLength={160} placeholder="e.g. Smt. Kaushalya Devi & Late Shri Harbans Lal Khanna" onChange={(e) => set("blessingsOf", e.target.value)} />
        </Field>
        <div className="vs-row2">
          <div>
            <Field label="Under the bride's family" htmlFor="gws-bn">
              <input id="gws-bn" className="vs-input" value={s(x.brideNote)} maxLength={100} placeholder="e.g. Jaipur" onChange={(e) => set("brideNote", e.target.value)} />
            </Field>
            <PhotoPick label="Bride's family photo" value={n(x.bridePhoto)} photos={photos} onPick={(k) => set("bridePhoto", k)} onUpload={(f) => void uploadTo(f, (k) => set("bridePhoto", k))} onCrop={(k) => setCrop({ k, aspect: 1, title: "Bride's family photo" })} />
          </div>
          <div>
            <Field label="Under the groom's family" htmlFor="gws-gn">
              <input id="gws-gn" className="vs-input" value={s(x.groomNote)} maxLength={100} placeholder="e.g. New Delhi" onChange={(e) => set("groomNote", e.target.value)} />
            </Field>
            <PhotoPick label="Groom's family photo" value={n(x.groomPhoto)} photos={photos} onPick={(k) => set("groomPhoto", k)} onUpload={(f) => void uploadTo(f, (k) => set("groomPhoto", k))} onCrop={(k) => setCrop({ k, aspect: 1, title: "Groom's family photo" })} />
          </div>
        </div>

        <h4 className="gws-h4">Good to know</h4>
        <p className="gws-hint">Stay, parking, weather, kids. Start a line with a heading and a colon: “Stay: …”.</p>
        {Array.from({ length: GW_LIMITS.faq }, (_, i) => (
          <input
            key={i}
            className="vs-input gws-thing"
            aria-label={`Good to know ${i + 1}`}
            value={things[i] ?? ""}
            maxLength={180}
            placeholder={["Stay: Rooms are held at …", "Parking: Valet at the main gate", "Weather: Evenings get cool, bring a shawl", "Getting around: Shuttles every 30 minutes", "Kids: Little ones are welcome", "Gifts: Your blessings are enough"][i]}
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
          <Field label="Pre-wedding film (YouTube link)" htmlFor="gws-vid" error={vid && !/youtu\.?be/i.test(vid) && !/^[A-Za-z0-9_-]{11}$/.test(vid) ? "Paste a YouTube link (youtube.com or youtu.be)." : undefined}>
            <input id="gws-vid" className="vs-input" inputMode="url" value={s(x.videoUrl)} maxLength={200} placeholder="https://youtu.be/…" onChange={(e) => set("videoUrl", e.target.value.trim())} />
          </Field>
          <Field label="Wedding hashtag" htmlFor="gws-tag">
            <input id="gws-tag" className="vs-input" value={s(x.hashtag)} maxLength={40} placeholder="#IshKabirKaBagh" onChange={(e) => set("hashtag", e.target.value)} />
          </Field>
        </div>

        <h4 className="gws-h4">RSVP</h4>
        <p className="gws-hint">Every reply comes to your email with a running total, and lands in “Guest replies” above.</p>
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

        <h4 className="gws-h4">The finish</h4>
        <Field label="Closing line" htmlFor="gws-end" hint="Under the flowering pavilion at the very end.">
          <input id="gws-end" className="vs-input" value={mf.endLine} maxLength={90} placeholder="With love, the Khanna & Malhotra families" onChange={(e) => updateMf("endLine", e.target.value)} />
        </Field>
        {password && (
          <Field label="Password (optional)" htmlFor="gws-pw" hint="Guests type it to open the invitation. Leave empty for no lock.">
            <input id="gws-pw" className="vs-input" value={password.value} maxLength={128} placeholder="e.g. the bride's nickname" autoComplete="off" onChange={(e) => password.set(e.target.value)} />
          </Field>
        )}
      </section>

      {crop && cropPhoto && (
        <PhotoCropper
          open
          src={cropPhoto.url}
          crop={clampCrop({ x: cropPhoto.cropX ?? 50, y: cropPhoto.cropY ?? 50, scale: cropPhoto.scale ?? 100 })}
          aspect={crop.aspect}
          title={crop.title}
          themeStyle={CROP_THEME}
          onChange={(c) => setCropOf(crop.k, c)}
          onClose={() => setCrop(null)}
        />
      )}
    </div>
  );
}

const CROP_THEME = { ["--vw-accent" as string]: "#A94E63", ["--vw-accent-ink" as string]: "#FFF8F6", ["--vw-paper" as string]: "#FFFDFB", ["--vw-paper-ink" as string]: "#3E1F27" } as CSSProperties;

const GWS_CSS = `
.gws { --gws-gold: #c08a5c; --gws-sage: #8eac89; --gws-blush: #f7e3e6; }
.gws .vs-sec { position: relative; }
.gws-head { align-items: center; }
.gws-head-ic { position: relative; flex: none; display: grid; place-items: center; width: 46px; height: 46px; border-radius: 50%; color: var(--vw-accent); background: radial-gradient(circle at 30% 30%, #fff, var(--gws-blush)); box-shadow: 0 0 0 1.5px color-mix(in srgb, var(--gws-gold) 60%, transparent), 0 8px 18px -12px rgba(110,40,58,.5); }
.gws-head-ic b { position: absolute; right: -4px; bottom: -4px; display: grid; place-items: center; min-width: 20px; height: 20px; padding: 0 5px; border-radius: 999px; background: var(--vw-accent); color: var(--vw-accent-ink); font: 700 11px/1 var(--vw-font-ui); }
.gws-hint { margin: 2px 0 10px; font-size: 13px; line-height: 1.45; opacity: .74; }
.gws-err { margin: 4px 0 10px; font-size: 13px; line-height: 1.4; color: #b3261e; font-weight: 600; }
.gws-has-err .vs-input { border-color: #d9534f !important; }
.gws-count { font-weight: 500; opacity: .6; }
.gws-sub { margin: 4px 0 10px; font-size: 13px; font-weight: 700; color: var(--vw-accent); }
.gws-bigday { margin-top: 8px; padding: 14px 14px 2px; border-radius: 18px; background: linear-gradient(135deg, #fff, var(--gws-blush)); border: 1px solid var(--vw-edge); }
.gws-row3 { display: grid; gap: 0 10px; grid-template-columns: 1fr 1fr; }
.gws-row3 > :last-child:nth-child(3) { grid-column: 1 / -1; }
@media (min-width: 560px) { .gws-row3 { grid-template-columns: 1fr 1fr 1.4fr; } .gws-row3 > :last-child:nth-child(3) { grid-column: auto; } .gws-row3-tight { grid-template-columns: 1.3fr 1fr 1fr; } .gws-row3-story { grid-template-columns: 1fr 3fr; } }
.gws-ai { position: relative; overflow: hidden; margin: 6px 0 4px; padding: 20px 18px 18px; border-radius: 22px; background: linear-gradient(150deg, #fdf4f3 0%, #f8e2e7 45%, #e7f0e6 100%); color: #3e1f27; box-shadow: 0 18px 40px -26px rgba(110,40,58,.55); border: 1px solid #ecd3d6; }
.gws-ai-art { position: absolute; right: 8px; top: -6px; width: 64px; height: auto; opacity: .95; pointer-events: none; }
.gws-ai-k { margin: 0; font: 700 11px/1 var(--vw-font-ui); letter-spacing: .22em; text-transform: uppercase; color: var(--gws-gold); }
.gws-ai-h { margin: 8px 70px 4px 0; font: 600 22px/1.2 var(--vw-font-serif); }
.gws-ai-p { margin: 0 64px 12px 0; font-size: 13.5px; line-height: 1.45; opacity: .8; }
.gws-ai-in { background: #fffdfb !important; min-height: 116px; font-size: 15px !important; line-height: 1.5 !important; }
.gws-ai-go { margin-top: 12px; width: 100%; min-height: 50px; border: 0; border-radius: 999px; cursor: pointer; font: 700 15.5px/1 var(--vw-font-ui); color: #fff; background: linear-gradient(110deg, #a94e63, #c76b80 55%, #a94e63); background-size: 200% 100%; box-shadow: 0 12px 26px -14px rgba(169,78,99,.9); transition: background-position .6s, transform .2s; }
.gws-ai-go:hover { background-position: 100% 0; }
.gws-ai-go:active { transform: scale(.98); }
.gws-ai-go:disabled { opacity: .75; cursor: progress; }
.gws-ai-note { margin: 10px 0 0; font-size: 13.5px; color: #b3261e; }
.gws-ai-note.is-ok { color: #3f6b3b; }
.gws-chips, .gws-quick { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; align-items: center; }
.gws-quick > span { font-size: 12px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; opacity: .6; }
.gws-chip { display: inline-flex; align-items: center; min-height: 40px; padding: 0 14px; border-radius: 999px; border: 1.5px solid var(--vw-edge); background: var(--vw-paper); color: var(--vw-paper-ink); font: 600 13px/1 var(--vw-font-ui); cursor: pointer; text-decoration: none; transition: border-color .2s, transform .15s; }
.gws-chip:hover { border-color: var(--vw-accent); }
.gws-chip:active { transform: scale(.97); }
.gws-chip:disabled, .gws-chip.is-off { opacity: .45; pointer-events: none; }
.gws-chip-wa { color: #0f7a40; border-color: #b9dcc6; }
.gws-seg { display: flex; gap: 6px; padding: 4px; margin: 0 0 18px; border-radius: 999px; background: var(--vw-soft); width: fit-content; max-width: 100%; }
.gws-seg button { min-height: 40px; padding: 0 14px; border: 0; border-radius: 999px; background: none; font: 600 13.5px/1 var(--vw-font-ui); color: var(--vw-paper-ink); cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 44vw; }
.gws-seg button[aria-checked=true] { background: var(--vw-accent); color: var(--vw-accent-ink); }
.gws-evs { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
.gws-ev { border: 1.5px solid var(--vw-edge); border-radius: 18px; background: var(--vw-paper); overflow: hidden; transition: border-color .2s, box-shadow .2s; }
.gws-ev.is-open { border-color: var(--gws-gold); box-shadow: 0 12px 30px -22px rgba(110,40,58,.5); }
.gws-ev-head { display: flex; align-items: center; gap: 12px; width: 100%; min-height: 62px; padding: 10px 14px; border: 0; background: none; text-align: left; cursor: pointer; color: var(--vw-paper-ink); }
.gws-ev-sw { flex: none; width: 24px; height: 24px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 0 1.5px var(--gws-gold); }
.gws-ev-t { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.gws-ev-t b { font: 600 17px/1.2 var(--vw-font-serif); }
.gws-ev-t small { font-size: 12.5px; opacity: .65; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.gws-ev-chev { font-size: 22px; line-height: 1; color: var(--vw-accent); width: 24px; text-align: center; }
.gws-ev-body { padding: 6px 14px 14px; border-top: 1px dashed var(--vw-edge); }
.gws-ev-tools, .gws-ch-tools { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.gws-ev-tools button, .gws-x, .gws-mini { min-height: 40px; padding: 0 14px; border-radius: 999px; border: 1.5px solid var(--vw-edge); background: none; font: 600 13px/1 var(--vw-font-ui); color: var(--vw-paper-ink); cursor: pointer; }
.gws-ev-tools button:disabled { opacity: .35; cursor: default; }
.gws-ev-tools .is-danger, .gws-x { color: #b3261e; }
.gws-mini { color: var(--vw-accent); border-color: color-mix(in srgb, var(--vw-accent) 35%, transparent); }
.gws-undo { display: flex; align-items: center; gap: 10px; margin: 10px 0 0; padding: 10px 14px; border-radius: 14px; background: #3e1f27; color: #fff; font-size: 14px; }
.gws-undo button { min-height: 40px; padding: 0 14px; border: 0; border-radius: 999px; background: #f4c9d4; color: #3e1f27; font: 700 13px/1 var(--vw-font-ui); cursor: pointer; }
.gws-sws { display: flex; flex-wrap: wrap; gap: 8px; margin: -6px 0 16px; }
.gws-sw { position: relative; width: 34px; height: 34px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 0 1.5px var(--vw-edge); cursor: pointer; padding: 0; transition: transform .15s; }
.gws-sw:hover { transform: scale(1.08); }
.gws-sw[aria-checked=true] { box-shadow: 0 0 0 2.5px var(--vw-accent); }
.gws-sw-custom { background: conic-gradient(#f2c94c, #4f9b6a, #2e5aac, #7b3fa0, #e86a92, #a3122b, #f2c94c); overflow: hidden; }
.gws-sw-custom input { position: absolute; inset: 0; opacity: 0; width: 100%; height: 100%; cursor: pointer; }
.gws-letter { min-height: 200px; font-family: var(--vw-font-serif); font-size: 16px; line-height: 1.6; }
.gws-h4 { display: flex; align-items: center; gap: 8px; margin: 26px 0 6px; font: 700 12px/1 var(--vw-font-ui); letter-spacing: .14em; text-transform: uppercase; color: var(--vw-accent); }
.gws-h4::before { content: ""; width: 14px; height: 14px; border-radius: 50% 0 50% 0; background: #f4b6c6; transform: rotate(45deg); }
.gws-story, .gws-contacts { list-style: none; margin: 0 0 10px; padding: 0; display: grid; gap: 12px; }
.gws-ch { padding: 12px; border: 1.5px solid var(--vw-edge); border-radius: 18px; background: var(--vw-paper); }
.gws-thing { margin-bottom: 8px; }
.gws-tog { display: flex; gap: 10px; align-items: center; min-height: 44px; font-size: 14.5px; cursor: pointer; }
.gws-tog input { width: 20px; height: 20px; accent-color: var(--vw-accent); flex: none; }
.gws-pick { margin: 0 0 14px; }
.gws-pick-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.gws-pick-btn { display: inline-flex; align-items: center; gap: 10px; min-height: 52px; padding: 4px 14px 4px 4px; border-radius: 999px; border: 1.5px dashed var(--vw-edge); background: var(--vw-paper); color: var(--vw-paper-ink); font: 600 13px/1.2 var(--vw-font-ui); cursor: pointer; }
.gws-pick-th0 { position: relative; overflow: hidden; display: grid; place-items: center; width: 44px; height: 44px; border-radius: 50%; background: var(--vw-soft); font-size: 18px; }
.gws-pick-strip { display: flex; gap: 8px; overflow-x: auto; padding: 10px 2px 6px; scroll-snap-type: x proximity; }
.gws-pick-th, .gws-pick-none { flex: none; width: 64px; height: 64px; border-radius: 12px; border: 2px solid transparent; padding: 0; overflow: hidden; background: var(--vw-soft); cursor: pointer; scroll-snap-align: start; font: 600 12px/1 var(--vw-font-ui); color: var(--vw-paper-ink); }
.gws-pick-th img { width: 100%; height: 100%; object-fit: cover; display: block; }
.gws-pick-th.is-on, .gws-pick-none.is-on { border-color: var(--vw-accent); }
.gws-links { position: relative; margin: 4px 0 6px; padding: 16px; border-radius: 20px; background: linear-gradient(140deg, #fff, #eef5ea); border: 1px solid #d7e5d3; }
.gws-links-k { margin: 0; font: 700 11px/1 var(--vw-font-ui); letter-spacing: .2em; text-transform: uppercase; color: #5f7f5b; }
.gws-links-h { margin: 6px 0 4px; font: 600 19px/1.25 var(--vw-font-serif); }
.gws-links-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
.gws-links-url { display: block; width: 100%; padding: 8px 10px; border-radius: 10px; background: #fff; border: 1px dashed #c9dbc5; font-size: 12px; overflow-wrap: anywhere; color: #3e1f27; }
.gws-note { margin: 6px 0 0; padding: 10px 12px; border-radius: 12px; background: #fff; font-size: 13.5px; line-height: 1.45; }
.gws-dash { margin: 4px 0 12px; border: 1.5px solid var(--vw-edge); border-radius: 18px; padding: 0 14px; background: var(--vw-paper); }
.gws-dash > summary { min-height: 52px; display: flex; align-items: center; font: 700 15px/1 var(--vw-font-ui); cursor: pointer; color: var(--vw-accent); }
`;
