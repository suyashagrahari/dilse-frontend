"use client";

// ─── Christian Wedding — the editor ─────────────────────────────────────────
//
// Eight steps, visited in any order:
//   1 The couple      names, date + time, church, families, the couple photo
//   2 Ceremony        every function (map, dress code + swatch, note) and the
//                     order of service
//   3 Photos          the masonry (size, focal point, zoom, caption, reorder)
//   4 Invitation      the words, the Bible verse, a second language
//   5 Our story       chapters with a photo each (framed in the cropper)
//   6 Guest info      who to call, good to know, getting there, livestream, gift
//   7 Look & music    theme + song (curated list or any YouTube link)
//   8 RSVP & send     RSVP settings, film, hashtag, closing line, password,
//                     personal links and the guest list after publishing
//
// Phones: a sticky chip rail on top (✓ when a step has its essentials), a
// sticky bar at the bottom (Preview · Save · Next) that hides while the
// keyboard is open and never covers the field in focus. Desktop: a left rail,
// the form, and the live page on the right, scrolled to the section in hand.

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { MasonryEditor, RsvpDashboard, WeddingRoot } from "../../../_wedding";
import { compressImage } from "../../../dedication/components/mediaUploads";
import MusicPicker, { MUSIC_CSS } from "../../../_valentine/editor/MusicPicker";
import PhotoCropper, { CROP_DEFAULT, type Crop } from "../../../_valentine/editor/PhotoCropper";
import { CW_LIMITS, CW_SONGS, CW_THEMES, CW_THEME_IDS, CW_TRACK, QUICK_FUNCTIONS, SECOND_LANGS, SERVICE_PRESETS, SWATCHES, ALT_SAMPLES, VERSES, isHttps, isMapUrl, isUpiId, newEventId, phoneOf, swatchFor, youTubeIdOf, type CwData, type CwEvent } from "../model";
import ChapelExperience, { rootStyle } from "../ChapelExperience";
import { copyText, personalUrl, whatsappUrl } from "../parts/guest";
import type { ChapelEditor as Ed } from "../../hooks/useChapelEditor";
import { EDITOR_CSS } from "./css";

const STEPS = [
  { id: "couple", label: "The couple", icon: "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z", section: "top" },
  { id: "ceremony", label: "Ceremony", icon: "M12 3v4M10 5h4M6 21V11l6-4 6 4v10M4 21h16M10 21v-5h4v5", section: "events" },
  { id: "photos", label: "Photos", icon: "M4 6h16v13H4zM4 16l5-5 4 4 3-3 4 4M15.5 10a1 1 0 1 0 0-.01", section: "gallery" },
  { id: "invitation", label: "Invitation", icon: "M4 6h16v12H4zM4 7l8 6 8-6", section: "invitation" },
  { id: "story", label: "Our story", icon: "M4 5.5C6 4.5 9 4.5 12 6c3-1.5 6-1.5 8-.5V19c-2-1-5-1-8 .5-3-1.5-6-1.5-8-.5zM12 6v13.5", section: "story" },
  { id: "guests", label: "Guest info", icon: "M6.6 3.5h2.6l1.4 4-2 1.3a11 11 0 0 0 6.6 6.6l1.3-2 4 1.4v2.6a1.6 1.6 0 0 1-1.7 1.6A16.5 16.5 0 0 1 5 5.2a1.6 1.6 0 0 1 1.6-1.7z", section: "good-to-know" },
  { id: "look", label: "Look & music", icon: "M9 18V6l11-2v12M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z", section: "top" },
  { id: "send", label: "RSVP & send", icon: "M4 12l16-8-6 16-3-6zM11 14l9-10", section: "rsvp" },
] as const;

function Icon({ d, size = 18 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}
const I = {
  up: "M12 19V5M6 11l6-6 6 6",
  down: "M12 5v14M6 13l6 6 6-6",
  copy: "M9 9h10v11H9zM5 15V4h10",
  trash: "M5 7h14M10 11v6M14 11v6M7 7l1 13h8l1-13M9 7V4h6v3",
  plus: "M12 5v14M5 12h14",
  chev: "M9 6l6 6-6 6",
  back: "M15 6l-6 6 6 6",
  eye: "M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  check: "M5 12.5 10 17l9-10",
  spark: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z",
  photo: "M4 6h16v13H4zM4 16l5-5 4 4 3-3 4 4",
  crop: "M6 3v15h15M3 6h15v15",
  replay: "M4 12a8 8 0 1 0 2.3-5.7M4 4v4h4",
};

// ── Fields ──────────────────────────────────────────────────────────────────

function Field({ label, hint, error, children, htmlFor, optional }: { label: string; hint?: ReactNode; error?: string; children: ReactNode; htmlFor?: string; optional?: boolean }) {
  return (
    <div className="cwe-field">
      <label className="cwe-label" htmlFor={htmlFor}>
        {label} {optional && <small>(optional)</small>}
      </label>
      {children}
      {error ? (
        <p className="cwe-err" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="cwe-hint">{hint}</p>
      )}
    </div>
  );
}

function Text({ id, value, onChange, placeholder, max = 120, type = "text", inputMode, bad }: { id: string; value: string; onChange: (v: string) => void; placeholder?: string; max?: number; type?: string; inputMode?: "tel" | "url" | "text"; bad?: boolean }) {
  return <input id={id} className={`cwe-input${bad ? " is-bad" : ""}`} type={type} inputMode={inputMode} value={value} maxLength={max} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} autoComplete="off" />;
}

function Area({ id, value, onChange, placeholder, max = 1200, rows = 4, lang }: { id: string; value: string; onChange: (v: string) => void; placeholder?: string; max?: number; rows?: number; lang?: string }) {
  return (
    <>
      <textarea id={id} className="cwe-input cwe-area" value={value} maxLength={max} rows={rows} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} lang={lang} />
      <span className="cwe-count" aria-hidden>
        {value.length}/{max}
      </span>
    </>
  );
}

function Toggle({ on, onChange, label, sub }: { on: boolean; onChange: (v: boolean) => void; label: string; sub?: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} className={`cwe-toggle${on ? " is-on" : ""}`} onClick={() => onChange(!on)}>
      <span className="cwe-toggle-copy">
        <b>{label}</b>
        {sub && <small>{sub}</small>}
      </span>
      <span className="cwe-switch" aria-hidden>
        <i />
      </span>
    </button>
  );
}

function Head({ n, title, sub }: { n: number; title: string; sub?: string }) {
  return (
    <header className="cwe-head">
      <span className="cwe-head-n" aria-hidden>
        {n}
      </span>
      <div>
        <h2 className="cwe-h">{title}</h2>
        {sub && <p className="cwe-sub">{sub}</p>}
      </div>
    </header>
  );
}

function RowTools({ i, n, onMove, onDup, onRemove, label }: { i: number; n: number; onMove: (to: number) => void; onDup?: () => void; onRemove: () => void; label: string }) {
  return (
    <div className="cwe-tools">
      <button type="button" className="cwe-icon" onClick={() => onMove(i - 1)} disabled={i === 0} aria-label={`Move ${label} up`}>
        <Icon d={I.up} />
      </button>
      <button type="button" className="cwe-icon" onClick={() => onMove(i + 1)} disabled={i === n - 1} aria-label={`Move ${label} down`}>
        <Icon d={I.down} />
      </button>
      {onDup && (
        <button type="button" className="cwe-icon" onClick={onDup} aria-label={`Duplicate ${label}`}>
          <Icon d={I.copy} />
        </button>
      )}
      <button type="button" className="cwe-icon is-danger" onClick={onRemove} aria-label={`Remove ${label}`}>
        <Icon d={I.trash} />
      </button>
    </div>
  );
}

const move = <T,>(list: T[], from: number, to: number) => {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [x] = next.splice(from, 1);
  next.splice(to, 0, x);
  return next;
};

async function pickPhoto(): Promise<string | null> {
  return new Promise((res) => {
    const inp = document.createElement("input");
    inp.type = "file";
    inp.accept = "image/*";
    inp.onchange = async () => {
      const f = inp.files?.[0];
      if (!f) return res(null);
      try {
        res(await compressImage(f, 1400));
      } catch {
        res(null);
      }
    };
    inp.click();
  });
}

const fmtDay = (iso: string) => (/^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`)) : "");

// ── The editor ──────────────────────────────────────────────────────────────

export default function ChapelEditor({ ed }: { ed: Ed }) {
  const { mf, setMf, step, setStep } = ed;
  const set = useCallback((patch: Partial<CwData>) => setMf((p) => ({ ...p, ...patch })), [setMf]);
  const [openEvent, setOpenEvent] = useState<number | null>(null);
  const [undo, setUndo] = useState<{ label: string; restore: () => void } | null>(null);
  const undoT = useRef(0);
  const [crop, setCrop] = useState<{ kind: "couple" | "story"; i: number } | null>(null);
  const [preview, setPreview] = useState(false);
  const [wide, setWide] = useState(false);
  const [kb, setKb] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const paneRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const [linkName, setLinkName] = useState("");
  const [linkFlash, setLinkFlash] = useState(false);

  useEffect(() => {
    const mq = matchMedia("(min-width: 1024px)");
    const on = () => setWide(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  // The keyboard is open → hide the sticky bar (it would sit on the field).
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const base = window.innerHeight;
    const on = () => setKb(base - vv.height > 150);
    vv.addEventListener("resize", on);
    return () => vv.removeEventListener("resize", on);
  }, []);

  // A new step: back to its top, the chip centred, the preview at its section.
  useEffect(() => {
    formRef.current?.scrollTo({ top: 0 });
    railRef.current?.querySelector<HTMLElement>(`[data-step="${step}"]`)?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
    const pane = paneRef.current;
    const target = pane?.querySelector<HTMLElement>(`#${STEPS[step].section}`);
    if (pane && target) pane.scrollTo({ top: Math.max(0, target.offsetTop - 12), behavior: "smooth" });
  }, [step]);

  const flashUndo = (label: string, restore: () => void) => {
    window.clearTimeout(undoT.current);
    setUndo({ label, restore });
    undoT.current = window.setTimeout(() => setUndo(null), 6000);
  };
  useEffect(() => () => window.clearTimeout(undoT.current), []);

  // Essentials per step, for the ✓ on its chip.
  const done = useMemo(
    () => [
      !!(mf.brideName.trim() && mf.groomName.trim() && mf.weddingDay),
      mf.events.some((e) => !e.disabled && e.name.trim() && e.isoDate),
      mf.gallery.length > 0,
      !!mf.invitation.trim(),
      mf.story.some((r) => r.title.trim()),
      mf.contacts.some((c) => c.name.trim() && phoneOf(c.phone)),
      true,
      true,
    ],
    [mf],
  );

  const events = mf.events;
  const setEvent = (i: number, patch: Partial<CwEvent>) => set({ events: events.map((e, k) => (k === i ? { ...e, ...patch } : e)) });
  const addEvent = (name = "", icon = "✦", dress = "", color = "") => {
    if (events.length >= CW_LIMITS.events) return;
    const e: CwEvent = { id: newEventId(events.map((x) => x.id)), name, isoDate: mf.weddingDay, time: "", venue: "", address: "", mapUrl: "", dressCode: dress, dressColor: color, details: "", icon, disabled: false };
    set({ events: [...events, e] });
    setOpenEvent(events.length);
  };
  const removeEvent = (i: number) => {
    const before = events;
    set({ events: events.filter((_, k) => k !== i) });
    setOpenEvent(null);
    flashUndo(`${before[i].name || "Function"} removed`, () => set({ events: before }));
  };

  const coupleCrop: Crop = { x: mf.couplePhotoCrop.x, y: mf.couplePhotoCrop.y, scale: mf.couplePhotoCrop.scale };
  const storyCrop = (i: number): Crop => ({ x: mf.story[i]?.cropX ?? 50, y: mf.story[i]?.cropY ?? 50, scale: mf.story[i]?.scale ?? 100 });

  const isLast = step === STEPS.length - 1;
  const contactErr = (p: string) => (p.trim() && !phoneOf(p) ? "A 10-digit mobile number, e.g. 98470 12345" : "");

  // ── The steps ─────────────────────────────────────────────────────────────
  const body = (() => {
    switch (STEPS[step].id) {
      case "couple":
        return (
          <>
            <Head n={1} title="The couple" sub="Names, the day and the church — the page is built around these." />
            {ed.fill.schema && (
              <button type="button" className="cwe-ai" onClick={ed.openAi}>
                <span className="cwe-ai-ic" aria-hidden>
                  <Icon d={I.spark} size={20} />
                </span>
                <span>
                  <b>✦ Let AI write it</b>
                  <small>Answer 8 quick questions — it fills the whole invitation, you review every word.</small>
                </span>
                <Icon d={I.chev} />
              </button>
            )}
            <div className="cwe-grid2">
              <Field label="Bride's first name" htmlFor="cwe-bride" error={!mf.brideName.trim() ? "Needed to save" : ""}>
                <Text id="cwe-bride" value={mf.brideName} onChange={(v) => set({ brideName: v })} placeholder="e.g. Anna" max={30} bad={!mf.brideName.trim()} />
              </Field>
              <Field label="Groom's first name" htmlFor="cwe-groom" error={!mf.groomName.trim() ? "Needed to save" : ""}>
                <Text id="cwe-groom" value={mf.groomName} onChange={(v) => set({ groomName: v })} placeholder="e.g. Joel" max={30} bad={!mf.groomName.trim()} />
              </Field>
            </div>
            <div className="cwe-grid2">
              <Field label="Wedding date" htmlFor="cwe-day">
                <input id="cwe-day" className="cwe-input" type="date" value={mf.weddingDay} onChange={(e) => set({ weddingDay: e.target.value })} />
              </Field>
              <Field label="Ceremony time" htmlFor="cwe-time">
                <input id="cwe-time" className="cwe-input" type="time" value={mf.weddingTime} onChange={(e) => set({ weddingTime: e.target.value })} />
              </Field>
            </div>
            <Field label="Church" htmlFor="cwe-church" hint="Shown on the doors, the card and the map.">
              <Text id="cwe-church" value={mf.churchName} onChange={(v) => set({ churchName: v })} placeholder="e.g. St. Mary's Cathedral Basilica" max={120} />
            </Field>
            <Field label="Town or address" htmlFor="cwe-venue">
              <Text id="cwe-venue" value={mf.venue} onChange={(v) => set({ venue: v })} placeholder="e.g. Broadway, Ernakulam, Kochi" max={160} />
            </Field>

            <h3 className="cwe-h3">The couple photo</h3>
            <div className="cwe-photo-row">
              {mf.couplePhoto ? (
                <span className="cwe-thumb is-portrait">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={mf.couplePhoto} alt="The couple" style={{ objectPosition: `${coupleCrop.x}% ${coupleCrop.y}%`, transform: coupleCrop.scale > 100 ? `scale(${coupleCrop.scale / 100})` : undefined, transformOrigin: `${coupleCrop.x}% ${coupleCrop.y}%` }} />
                </span>
              ) : (
                <span className="cwe-thumb is-portrait is-empty" aria-hidden>
                  <Icon d={I.photo} size={26} />
                </span>
              )}
              <div className="cwe-photo-btns">
                <button
                  type="button"
                  className="cwe-btn is-ghost"
                  onClick={async () => {
                    const url = await pickPhoto();
                    if (url) set({ couplePhoto: url, couplePhotoCrop: { ...CROP_DEFAULT } });
                  }}
                >
                  <Icon d={I.photo} /> {mf.couplePhoto ? "Replace" : "Add photo"}
                </button>
                {mf.couplePhoto && (
                  <>
                    <button type="button" className="cwe-btn is-ghost" onClick={() => setCrop({ kind: "couple", i: 0 })}>
                      <Icon d={I.crop} /> Frame &amp; zoom
                    </button>
                    <button type="button" className="cwe-btn is-ghost is-danger" onClick={() => set({ couplePhoto: "" })}>
                      <Icon d={I.trash} /> Remove
                    </button>
                  </>
                )}
                <p className="cwe-hint">Under the floral drape on the first screen. Without one, the first gallery photo is used.</p>
              </div>
            </div>

            <h3 className="cwe-h3">The families</h3>
            <Field label="Bride's parents" htmlFor="cwe-bp" optional>
              <Text id="cwe-bp" value={mf.brideFamily.parents} onChange={(v) => set({ brideFamily: { ...mf.brideFamily, parents: v } })} placeholder="Mr. Thomas & Mrs. Mary Kurian" />
            </Field>
            <Field label="Groom's parents" htmlFor="cwe-gp" optional>
              <Text id="cwe-gp" value={mf.groomFamily.parents} onChange={(v) => set({ groomFamily: { ...mf.groomFamily, parents: v } })} placeholder="Mr. George & Mrs. Annie Mathew" />
            </Field>
            <Field label="With the blessings of" htmlFor="cwe-bof" optional hint="Grandparents or elders, remembered with love.">
              <Text id="cwe-bof" value={mf.blessingsOf} onChange={(v) => set({ blessingsOf: v })} placeholder="Late Mr. Joseph Kurian & Mrs. Rosamma Kurian" max={160} />
            </Field>
            <div className="cwe-grid2">
              <Field label="A line about the bride" htmlFor="cwe-bd" optional>
                <Area id="cwe-bd" value={mf.bride.description} onChange={(v) => set({ bride: { ...mf.bride, description: v } })} max={200} rows={3} />
              </Field>
              <Field label="A line about the groom" htmlFor="cwe-gd" optional>
                <Area id="cwe-gd" value={mf.groom.description} onChange={(v) => set({ groom: { ...mf.groom, description: v } })} max={200} rows={3} />
              </Field>
            </div>
          </>
        );

      case "ceremony":
        return (
          <>
            <Head n={2} title="Ceremony & celebrations" sub="Each function gets its own card with a map, dress code and calendar button." />
            <ul className="cwe-list">
              {events.map((e, i) => {
                const open = openEvent === i;
                const sw = swatchFor(e);
                return (
                  <li key={e.id || i} className={`cwe-card${open ? " is-open" : ""}${e.disabled ? " is-off" : ""}`}>
                    <button type="button" className="cwe-card-sum" aria-expanded={open} onClick={() => setOpenEvent(open ? null : i)}>
                      <span className="cwe-card-ic" aria-hidden>
                        {e.icon || "✦"}
                      </span>
                      <span className="cwe-card-t">
                        <b>{e.name || "New function"}</b>
                        <small>{[fmtDay(e.isoDate), e.venue].filter(Boolean).join(" · ") || "Tap to add the details"}</small>
                      </span>
                      {sw && <span className="cwe-sw" style={{ background: sw }} aria-hidden />}
                      <span className="cwe-chev" aria-hidden>
                        <Icon d={I.chev} />
                      </span>
                    </button>
                    {open && (
                      <div className="cwe-card-body">
                        <Field label="Name" htmlFor={`ev-n-${i}`}>
                          <Text id={`ev-n-${i}`} value={e.name} onChange={(v) => setEvent(i, { name: v })} placeholder="Holy Matrimony" max={60} />
                        </Field>
                        <div className="cwe-chips" role="group" aria-label="Quick names">
                          {QUICK_FUNCTIONS.map((q) => (
                            <button key={q.name} type="button" className={`cwe-chip${e.name === q.name ? " is-on" : ""}`} onClick={() => setEvent(i, { name: q.name, icon: q.icon, dressCode: e.dressCode || q.dress, dressColor: e.dressColor || q.color })}>
                              {q.icon} {q.name}
                            </button>
                          ))}
                        </div>
                        <div className="cwe-grid2">
                          <Field label="Date" htmlFor={`ev-d-${i}`}>
                            <input id={`ev-d-${i}`} className="cwe-input" type="date" value={e.isoDate} onChange={(x) => setEvent(i, { isoDate: x.target.value })} />
                          </Field>
                          <Field label="Start time" htmlFor={`ev-t-${i}`}>
                            <input id={`ev-t-${i}`} className="cwe-input" type="time" value={e.time} onChange={(x) => setEvent(i, { time: x.target.value })} />
                          </Field>
                        </div>
                        <Field label="Venue" htmlFor={`ev-v-${i}`}>
                          <Text id={`ev-v-${i}`} value={e.venue} onChange={(v) => setEvent(i, { venue: v })} placeholder="St. Mary's Cathedral Basilica" />
                        </Field>
                        <Field label="Address" htmlFor={`ev-a-${i}`} optional>
                          <Text id={`ev-a-${i}`} value={e.address} onChange={(v) => setEvent(i, { address: v })} placeholder="Broadway, Ernakulam, Kochi" max={200} />
                        </Field>
                        <Field label="Google Maps link" htmlFor={`ev-m-${i}`} optional error={e.mapUrl && !isMapUrl(e.mapUrl) ? "Paste a link from Google Maps (Share → Copy link)" : ""} hint="Without one, directions are found from the venue and address.">
                          <Text id={`ev-m-${i}`} value={e.mapUrl} onChange={(v) => setEvent(i, { mapUrl: v.trim() })} placeholder="https://maps.app.goo.gl/…" inputMode="url" max={400} bad={!!e.mapUrl && !isMapUrl(e.mapUrl)} />
                        </Field>
                        <Field label="Dress code" htmlFor={`ev-dc-${i}`} optional>
                          <Text id={`ev-dc-${i}`} value={e.dressCode} onChange={(v) => setEvent(i, { dressCode: v })} placeholder="Formal, soft pastels" max={80} />
                        </Field>
                        <div className="cwe-swatches" role="radiogroup" aria-label="Dress colour">
                          {SWATCHES.map((c) => (
                            <button key={c} type="button" role="radio" aria-checked={e.dressColor === c} aria-label={`Colour ${c}`} className={`cwe-swatch${e.dressColor === c ? " is-on" : ""}`} style={{ background: c }} onClick={() => setEvent(i, { dressColor: e.dressColor === c ? "" : c })} />
                          ))}
                          <label className="cwe-swatch is-custom" aria-label="Custom colour">
                            <input type="color" value={e.dressColor || "#f3ebdd"} onChange={(x) => setEvent(i, { dressColor: x.target.value })} />
                            <Icon d={I.plus} size={14} />
                          </label>
                        </div>
                        <Field label="Note for guests" htmlFor={`ev-note-${i}`} optional>
                          <Area id={`ev-note-${i}`} value={e.details} onChange={(v) => setEvent(i, { details: v })} placeholder="Please be seated by 3:15 pm." max={600} rows={3} />
                        </Field>
                        <div className="cwe-card-foot">
                          <Toggle on={!e.disabled} onChange={(v) => setEvent(i, { disabled: !v })} label="Show on the page" />
                          <RowTools
                            i={i}
                            n={events.length}
                            label={e.name || "function"}
                            onMove={(to) => {
                              set({ events: move(events, i, to) });
                              setOpenEvent(to);
                            }}
                            onDup={events.length < CW_LIMITS.events ? () => set({ events: [...events.slice(0, i + 1), { ...e, id: newEventId(events.map((x) => x.id)), name: `${e.name} (2)` }, ...events.slice(i + 1)] }) : undefined}
                            onRemove={() => removeEvent(i)}
                          />
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
            {events.length < CW_LIMITS.events ? (
              <>
                <p className="cwe-sub2">Add a function</p>
                <div className="cwe-chips">
                  {QUICK_FUNCTIONS.filter((q) => !events.some((e) => e.name === q.name)).map((q) => (
                    <button key={q.name} type="button" className="cwe-chip" onClick={() => addEvent(q.name, q.icon, q.dress, q.color)}>
                      <Icon d={I.plus} size={14} /> {q.name}
                    </button>
                  ))}
                  <button type="button" className="cwe-chip" onClick={() => addEvent()}>
                    <Icon d={I.plus} size={14} /> Something else
                  </button>
                </div>
              </>
            ) : (
              <p className="cwe-hint">That&apos;s the most this design shows ({CW_LIMITS.events}).</p>
            )}

            <h3 className="cwe-h3">Order of service</h3>
            <p className="cwe-hint">The ceremony, moment by moment. Leave it empty to hide it.</p>
            <datalist id="cwe-service-presets">
              {SERVICE_PRESETS.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
            <ul className="cwe-list">
              {mf.orderOfService.map((r, i) => (
                <li key={i} className="cwe-row">
                  <div className="cwe-row-grid">
                    <Field label="Time" htmlFor={`os-t-${i}`}>
                      <input id={`os-t-${i}`} className="cwe-input" type="time" value={/^\d{2}:\d{2}$/.test(r.time) ? r.time : ""} onChange={(x) => set({ orderOfService: mf.orderOfService.map((y, k) => (k === i ? { ...y, time: x.target.value } : y)) })} />
                    </Field>
                    <Field label="Moment" htmlFor={`os-n-${i}`}>
                      <input id={`os-n-${i}`} className="cwe-input" list="cwe-service-presets" value={r.title} maxLength={60} onChange={(x) => set({ orderOfService: mf.orderOfService.map((y, k) => (k === i ? { ...y, title: x.target.value } : y)) })} placeholder="Exchange of vows" />
                    </Field>
                  </div>
                  <Field label="Note" htmlFor={`os-x-${i}`} optional>
                    <Text id={`os-x-${i}`} value={r.note} onChange={(v) => set({ orderOfService: mf.orderOfService.map((y, k) => (k === i ? { ...y, note: v } : y)) })} placeholder="Read by Anna's sister" max={140} />
                  </Field>
                  <RowTools
                    i={i}
                    n={mf.orderOfService.length}
                    label={r.title || "moment"}
                    onMove={(to) => set({ orderOfService: move(mf.orderOfService, i, to) })}
                    onRemove={() => {
                      const before = mf.orderOfService;
                      set({ orderOfService: before.filter((_, k) => k !== i) });
                      flashUndo(`${r.title || "Moment"} removed`, () => set({ orderOfService: before }));
                    }}
                  />
                </li>
              ))}
            </ul>
            {mf.orderOfService.length < CW_LIMITS.service && (
              <button type="button" className="cwe-btn is-ghost is-wide" onClick={() => set({ orderOfService: [...mf.orderOfService, { time: "", title: SERVICE_PRESETS.find((p) => !mf.orderOfService.some((r) => r.title === p)) ?? "", note: "" }] })}>
                <Icon d={I.plus} /> Add a moment
              </button>
            )}
          </>
        );

      case "photos":
        return (
          <>
            <Head n={3} title="Photos" sub="Tap a photo to resize it (normal, wide, tall, large), set its focus, zoom, caption or move it." />
            <MasonryEditor photos={mf.gallery} onChange={(p) => set({ gallery: p })} max={CW_LIMITS.photos} mask="rounded" title="Your gallery" hint={`${mf.gallery.length} of ${CW_LIMITS.photos} · compressed on your phone, uploaded when you publish`} />
          </>
        );

      case "invitation": {
        const verseIdx = VERSES.findIndex((v) => v.ref === mf.scripture.ref && v.text === mf.scripture.text);
        const custom = verseIdx < 0 && !!(mf.scripture.text || mf.scripture.ref);
        const lang = SECOND_LANGS.find((l) => l.id === mf.secondLang);
        return (
          <>
            <Head n={4} title="The invitation" sub="The words guests read first, a verse, and an optional second language." />
            <Field label="Invitation" htmlFor="cwe-inv" hint="Two short paragraphs read best. The date, time and church are shown separately.">
              <Area id="cwe-inv" value={mf.invitation} onChange={(v) => set({ invitation: v })} max={1200} rows={7} placeholder="Together with their families…" />
            </Field>
            <h3 className="cwe-h3">The Bible verse</h3>
            <div className="cwe-verses" role="radiogroup" aria-label="Bible verse">
              {VERSES.map((v, k) => (
                <button key={v.ref} type="button" role="radio" aria-checked={verseIdx === k} className={`cwe-verse${verseIdx === k ? " is-on" : ""}`} onClick={() => set({ scripture: { ...v } })}>
                  <b>{v.ref}</b>
                  <small>{v.text}</small>
                </button>
              ))}
              <button type="button" role="radio" aria-checked={custom} className={`cwe-verse${custom ? " is-on" : ""}`} onClick={() => set({ scripture: { text: custom ? mf.scripture.text : "", ref: custom ? mf.scripture.ref : "" } })}>
                <b>My own verse</b>
                <small>Type any passage and its reference</small>
              </button>
              <button type="button" role="radio" aria-checked={!mf.scripture.text && !mf.scripture.ref && !custom} className={`cwe-verse${!mf.scripture.text && !mf.scripture.ref ? " is-on" : ""}`} onClick={() => set({ scripture: { text: "", ref: "" } })}>
                <b>No verse</b>
                <small>Show the blessing line instead</small>
              </button>
            </div>
            {(custom || verseIdx < 0) && (
              <div className="cwe-grid2">
                <Field label="Verse" htmlFor="cwe-vt">
                  <Area id="cwe-vt" value={mf.scripture.text} onChange={(v) => set({ scripture: { ...mf.scripture, text: v } })} max={420} rows={3} />
                </Field>
                <Field label="Reference" htmlFor="cwe-vr">
                  <Text id="cwe-vr" value={mf.scripture.ref} onChange={(v) => set({ scripture: { ...mf.scripture, ref: v } })} placeholder="Psalm 118:24" max={60} />
                </Field>
              </div>
            )}
            <Field label="Blessing line" htmlFor="cwe-bl" optional hint="A short line shown when there is no verse.">
              <Text id="cwe-bl" value={mf.blessing} onChange={(v) => set({ blessing: v })} placeholder="What God has joined together, let no one separate." max={160} />
            </Field>

            <h3 className="cwe-h3">A second language</h3>
            <div className="cwe-chips" role="radiogroup" aria-label="Second language">
              {SECOND_LANGS.map((l) => (
                <button key={l.id} type="button" role="radio" aria-checked={mf.secondLang === l.id} className={`cwe-chip${mf.secondLang === l.id ? " is-on" : ""}`} onClick={() => set({ secondLang: l.id, ...(l.id !== "none" && (!mf.altInvitation.trim() || Object.values(ALT_SAMPLES).includes(mf.altInvitation)) ? { altInvitation: ALT_SAMPLES[l.id] } : {}) })}>
                  {l.label} {l.native && <span lang={l.lang}>· {l.native}</span>}
                </button>
              ))}
            </div>
            {mf.secondLang !== "none" && (
              <>
                <Field label={`Invitation in ${lang?.label}`} htmlFor="cwe-alt" hint="Headings stay in English; this appears under the English text. Please have a native speaker read it before you send.">
                  <Area id="cwe-alt" value={mf.altInvitation} onChange={(v) => set({ altInvitation: v })} max={900} rows={4} lang={lang?.lang} placeholder={ALT_SAMPLES[mf.secondLang]} />
                </Field>
                <Field label={`Verse in ${lang?.label}`} htmlFor="cwe-altv" optional>
                  <Area id="cwe-altv" value={mf.altVerse} onChange={(v) => set({ altVerse: v })} max={420} rows={2} lang={lang?.lang} />
                </Field>
              </>
            )}
          </>
        );
      }

      case "story":
        return (
          <>
            <Head n={5} title="Our story" sub="Two or three moments, each with a photo. Leave it empty to hide the section." />
            <ul className="cwe-list">
              {mf.story.map((r, i) => {
                const c = storyCrop(i);
                const upd = (patch: Partial<CwData["story"][number]>) => set({ story: mf.story.map((y, k) => (k === i ? { ...y, ...patch } : y)) });
                return (
                  <li key={i} className="cwe-row">
                    <div className="cwe-photo-row">
                      {r.photo ? (
                        <span className="cwe-thumb">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={r.photo} alt="" style={{ objectPosition: `${c.x}% ${c.y}%`, transform: c.scale > 100 ? `scale(${c.scale / 100})` : undefined, transformOrigin: `${c.x}% ${c.y}%` }} />
                        </span>
                      ) : (
                        <span className="cwe-thumb is-empty" aria-hidden>
                          <Icon d={I.photo} size={22} />
                        </span>
                      )}
                      <div className="cwe-photo-btns">
                        <button
                          type="button"
                          className="cwe-btn is-ghost"
                          onClick={async () => {
                            const url = await pickPhoto();
                            if (url) upd({ photo: url, cropX: 50, cropY: 50, scale: 100 });
                          }}
                        >
                          <Icon d={I.photo} /> {r.photo ? "Replace" : "Add photo"}
                        </button>
                        {r.photo && (
                          <button type="button" className="cwe-btn is-ghost" onClick={() => setCrop({ kind: "story", i })}>
                            <Icon d={I.crop} /> Frame
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="cwe-row-grid">
                      <Field label="When" htmlFor={`st-w-${i}`} optional>
                        <Text id={`st-w-${i}`} value={r.when} onChange={(v) => upd({ when: v })} placeholder="2019" max={40} />
                      </Field>
                      <Field label="Title" htmlFor={`st-t-${i}`}>
                        <Text id={`st-t-${i}`} value={r.title} onChange={(v) => upd({ title: v })} placeholder="A hymn at choir practice" max={60} />
                      </Field>
                    </div>
                    <Field label="What happened" htmlFor={`st-l-${i}`}>
                      <Area id={`st-l-${i}`} value={r.line} onChange={(v) => upd({ line: v })} max={300} rows={3} />
                    </Field>
                    <RowTools
                      i={i}
                      n={mf.story.length}
                      label={r.title || "chapter"}
                      onMove={(to) => set({ story: move(mf.story, i, to) })}
                      onRemove={() => {
                        const before = mf.story;
                        set({ story: before.filter((_, k) => k !== i) });
                        flashUndo(`${r.title || "Chapter"} removed`, () => set({ story: before }));
                      }}
                    />
                  </li>
                );
              })}
            </ul>
            {mf.story.length < CW_LIMITS.story && (
              <button type="button" className="cwe-btn is-ghost is-wide" onClick={() => set({ story: [...mf.story, { when: "", title: "", line: "", photo: "", cropX: 50, cropY: 50, scale: 100 }] })}>
                <Icon d={I.plus} /> Add a chapter
              </button>
            )}
          </>
        );

      case "guests":
        return (
          <>
            <Head n={6} title="For your guests" sub="Elders call a person, not a form — add who to call." />
            <h3 className="cwe-h3">Who to call</h3>
            <ul className="cwe-list">
              {mf.contacts.map((c, i) => {
                const upd = (patch: Partial<CwData["contacts"][number]>) => set({ contacts: mf.contacts.map((y, k) => (k === i ? { ...y, ...patch } : y)) });
                return (
                  <li key={i} className="cwe-row">
                    <div className="cwe-grid2">
                      <Field label="Name" htmlFor={`ct-n-${i}`}>
                        <Text id={`ct-n-${i}`} value={c.name} onChange={(v) => upd({ name: v })} placeholder="Thomas Kurian" max={40} />
                      </Field>
                      <Field label="Relation" htmlFor={`ct-r-${i}`} optional>
                        <Text id={`ct-r-${i}`} value={c.relation} onChange={(v) => upd({ relation: v })} placeholder="Anna's brother" max={40} />
                      </Field>
                    </div>
                    <Field label="Mobile" htmlFor={`ct-p-${i}`} error={contactErr(c.phone)} hint="A 10-digit Indian mobile; +91 is added for you.">
                      <Text id={`ct-p-${i}`} value={c.phone} onChange={(v) => upd({ phone: v })} placeholder="98470 12345" type="tel" inputMode="tel" max={18} bad={!!contactErr(c.phone)} />
                    </Field>
                    <RowTools
                      i={i}
                      n={mf.contacts.length}
                      label={c.name || "contact"}
                      onMove={(to) => set({ contacts: move(mf.contacts, i, to) })}
                      onRemove={() => {
                        const before = mf.contacts;
                        set({ contacts: before.filter((_, k) => k !== i) });
                        flashUndo(`${c.name || "Contact"} removed`, () => set({ contacts: before }));
                      }}
                    />
                  </li>
                );
              })}
            </ul>
            {mf.contacts.length < CW_LIMITS.contacts && (
              <button type="button" className="cwe-btn is-ghost is-wide" onClick={() => set({ contacts: [...mf.contacts, { name: "", relation: "", phone: "" }] })}>
                <Icon d={I.plus} /> Add a person
              </button>
            )}

            <h3 className="cwe-h3">Good to know</h3>
            <ul className="cwe-list">
              {mf.things.map((t, i) => (
                <li key={i} className="cwe-row">
                  <Field label="Heading" htmlFor={`th-h-${i}`} optional>
                    <Text id={`th-h-${i}`} value={t.head} onChange={(v) => set({ things: mf.things.map((y, k) => (k === i ? { ...y, head: v } : y)) })} placeholder="Parking" max={40} />
                  </Field>
                  <Field label="Note" htmlFor={`th-t-${i}`}>
                    <Area id={`th-t-${i}`} value={t.text} onChange={(v) => set({ things: mf.things.map((y, k) => (k === i ? { ...y, text: v } : y)) })} max={300} rows={2} />
                  </Field>
                  <RowTools
                    i={i}
                    n={mf.things.length}
                    label={t.head || "note"}
                    onMove={(to) => set({ things: move(mf.things, i, to) })}
                    onRemove={() => {
                      const before = mf.things;
                      set({ things: before.filter((_, k) => k !== i) });
                      flashUndo("Note removed", () => set({ things: before }));
                    }}
                  />
                </li>
              ))}
            </ul>
            {mf.things.length < CW_LIMITS.things && (
              <button type="button" className="cwe-btn is-ghost is-wide" onClick={() => set({ things: [...mf.things, { head: "", text: "" }] })}>
                <Icon d={I.plus} /> Add a note
              </button>
            )}
            <Field label="Getting there" htmlFor="cwe-gt" optional>
              <Area id="cwe-gt" value={mf.gettingThere} onChange={(v) => set({ gettingThere: v })} max={600} rows={3} placeholder="The airport is 40 minutes away…" />
            </Field>
            <Field label="Livestream link" htmlFor="cwe-live" optional error={mf.liveUrl && !isHttps(mf.liveUrl) ? "A link starting with https://" : ""} hint="The 'Watch live' button wakes 30 minutes before the ceremony.">
              <Text id="cwe-live" value={mf.liveUrl} onChange={(v) => set({ liveUrl: v.trim() })} placeholder="https://youtube.com/live/…" inputMode="url" max={400} bad={!!mf.liveUrl && !isHttps(mf.liveUrl)} />
            </Field>
            <Toggle on={!!mf.upiId || !!mf.upiName} onChange={(v) => set(v ? { upiName: mf.upiName || `${mf.brideName} & ${mf.groomName}` } : { upiId: "", upiName: "" })} label="Accept a gift by UPI" sub="Off by default. Shown politely; we never handle the money." />
            {(!!mf.upiId || !!mf.upiName) && (
              <div className="cwe-grid2">
                <Field label="UPI ID" htmlFor="cwe-upi" error={mf.upiId && !isUpiId(mf.upiId) ? "Looks like name@bank" : ""}>
                  <Text id="cwe-upi" value={mf.upiId} onChange={(v) => set({ upiId: v.trim() })} placeholder="annajoel@okaxis" max={60} bad={!!mf.upiId && !isUpiId(mf.upiId)} />
                </Field>
                <Field label="Name on the account" htmlFor="cwe-upn" optional>
                  <Text id="cwe-upn" value={mf.upiName} onChange={(v) => set({ upiName: v })} max={60} />
                </Field>
              </div>
            )}
          </>
        );

      case "look":
        return (
          <>
            <Head n={7} title="Look & music" sub="Three light palettes, and the song that plays when the doors open." />
            <div className="cwe-themes" role="radiogroup" aria-label="Theme">
              {CW_THEME_IDS.map((id) => {
                const t = CW_THEMES[id];
                return (
                  <button key={id} type="button" role="radio" aria-checked={mf.theme === id} className={`cwe-theme${mf.theme === id ? " is-on" : ""}`} onClick={() => set({ theme: id })} style={{ background: t.swatch[0] }}>
                    <span className="cwe-theme-sw" aria-hidden>
                      {t.swatch.map((c) => (
                        <i key={c} style={{ background: c }} />
                      ))}
                    </span>
                    <b style={{ color: t.vars["--wk-ink"] }}>{t.label}</b>
                    <small style={{ color: t.vars["--wk-muted"] }}>{t.blurb}</small>
                    <span className="cwe-theme-names" style={{ color: t.vars["--wk-ink"] }}>
                      {(mf.brideName || "A")[0]} <i style={{ color: t.swatch[2] }}>&amp;</i> {(mf.groomName || "J")[0]}
                    </span>
                  </button>
                );
              })}
            </div>
            <h3 className="cwe-h3">Music</h3>
            <div className="cwe-music">
              <MusicPicker
                value={{ musicMode: mf.music.mode, musicYoutubeId: mf.music.youtubeId, musicStart: mf.music.start }}
                onChange={(patch) =>
                  set({
                    music: {
                      mode: patch.musicMode ?? mf.music.mode,
                      youtubeId: patch.musicYoutubeId ?? mf.music.youtubeId,
                      start: patch.musicStart ?? mf.music.start,
                    },
                  })
                }
                suggestions={CW_SONGS}
                suggestionsNote="Wedding classics and hymns · or paste any YouTube link"
                audioOnly
                track={CW_TRACK}
              />
            </div>
          </>
        );

      case "send":
      default: {
        const base = ed.shareUrl;
        const link = base && linkName.trim() ? personalUrl(base, linkName) : "";
        return (
          <>
            <Head n={8} title="RSVP & send" sub="Replies come to your email; the guest list lives here after publishing." />
            <Toggle on={mf.rsvpOn} onChange={(v) => set({ rsvpOn: v })} label="Ask guests to RSVP" sub="Per function, in three taps — no login for guests." />
            {mf.rsvpOn && (
              <>
                <div className="cwe-grid2">
                  <Field label="Reply by" htmlFor="cwe-rsvpby" optional>
                    <input id="cwe-rsvpby" className="cwe-input" type="date" value={mf.rsvpBy} onChange={(e) => set({ rsvpBy: e.target.value })} />
                  </Field>
                  <Field label="Most guests per reply" htmlFor="cwe-max">
                    <select id="cwe-max" className="cwe-input" value={mf.maxGuests} onChange={(e) => set({ maxGuests: Number(e.target.value) })}>
                      {Array.from({ length: 10 }, (_, k) => k + 1).map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <Toggle on={mf.rsvpMeal} onChange={(v) => set({ rsvpMeal: v })} label="Ask for a meal choice" sub="Vegetarian / non-vegetarian" />
              </>
            )}
            <Field label="Wedding film (YouTube link)" htmlFor="cwe-film" optional error={mf.videoUrl && !youTubeIdOf(mf.videoUrl) ? "Paste a YouTube link" : ""} hint="Loads only when a guest taps play.">
              <Text id="cwe-film" value={mf.videoUrl} onChange={(v) => set({ videoUrl: v.trim() })} placeholder="https://youtu.be/…" inputMode="url" max={300} bad={!!mf.videoUrl && !youTubeIdOf(mf.videoUrl)} />
            </Field>
            <div className="cwe-grid2">
              <Field label="Hashtag" htmlFor="cwe-tag" optional>
                <Text id="cwe-tag" value={mf.hashtag} onChange={(v) => set({ hashtag: v.replace(/\s+/g, "") })} placeholder="#AnnaWedsJoel" max={40} />
              </Field>
              <Field label="Closing line" htmlFor="cwe-close" optional>
                <Text id="cwe-close" value={mf.closingLine} onChange={(v) => set({ closingLine: v })} placeholder="With love and prayers, the Kurian & Mathew families" max={120} />
              </Field>
            </div>
            <Field label="Password" htmlFor="cwe-pw" optional hint="Only guests with the password can open the page.">
              <Text id="cwe-pw" value={ed.pagePassword} onChange={(v) => ed.setPagePassword(v)} placeholder="Leave empty for an open link" max={40} />
            </Field>

            <h3 className="cwe-h3">Personal links</h3>
            {base ? (
              <div className="cwe-plink">
                <p className="cwe-hint">Each guest sees “Dear …” on the doors, and their name is filled in on the RSVP.</p>
                <Text id="cwe-plink" value={linkName} onChange={setLinkName} placeholder="e.g. Sharon Aunty" max={40} />
                {link && (
                  <div className="cwe-plink-out">
                    <code>{link}</code>
                    <div className="cwe-plink-btns">
                      <button
                        type="button"
                        className="cwe-btn is-ghost"
                        onClick={async () => {
                          if (await copyText(link)) {
                            setLinkFlash(true);
                            window.setTimeout(() => setLinkFlash(false), 1800);
                          }
                        }}
                      >
                        <Icon d={linkFlash ? I.check : I.copy} /> {linkFlash ? "Copied" : "Copy"}
                      </button>
                      <a className="cwe-btn" href={whatsappUrl(`Dear ${linkName.trim()}, with joy we invite you to our wedding: ${link}`)} target="_blank" rel="noopener noreferrer">
                        WhatsApp
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="cwe-hint">After you publish, make a link for each guest here.</p>
            )}
            {ed.pageId && ed.shareUrl && (
              <>
                <h3 className="cwe-h3">Your guest list</h3>
                <RsvpDashboard slug="christian-wedding" pageId={ed.pageId} token={ed.accessToken} csvName={`${mf.brideName}-${mf.groomName}`} />
              </>
            )}
          </>
        );
      }
    }
  })();

  const next = () => (isLast ? ed.save() : setStep(step + 1));

  return (
    <WeddingRoot theme={CW_THEMES[mf.theme]?.base ?? "champagne"} background={false} chrome={false} className={`cwe${kb ? " is-kb" : ""}`} style={rootStyle(mf.theme)}>
      <style>{EDITOR_CSS}</style>
      <style>{MUSIC_CSS}</style>
      <header className="cwe-top">
        <button type="button" className="cwe-btn is-ghost is-sm" onClick={ed.closeEditor} aria-label="Back to the page">
          <Icon d={I.back} /> <span className="cwe-hide-xs">Back</span>
        </button>
        <div className="cwe-title">
          <b>Your invitation</b>
          <small aria-live="polite">{ed.savedAt ? "Draft saved ✓" : "Changes are kept as you type"}</small>
        </div>
        <button type="button" className="cwe-btn is-sm cwe-top-save" onClick={ed.save}>
          <Icon d={I.check} /> Save
        </button>
      </header>

      <nav className="cwe-rail" ref={railRef} aria-label="Steps">
        {STEPS.map((s, k) => (
          <button key={s.id} type="button" data-step={k} className={`cwe-step${k === step ? " is-on" : ""}${done[k] ? " is-done" : ""}`} aria-current={k === step ? "step" : undefined} onClick={() => setStep(k)}>
            <span className="cwe-step-ic" aria-hidden>
              {done[k] && k !== step ? <Icon d={I.check} size={15} /> : <Icon d={s.icon} size={15} />}
            </span>
            <span>{s.label}</span>
          </button>
        ))}
      </nav>

      <div className="cwe-form" ref={formRef}>
        <div className="cwe-form-in">
          {body}
          <div className="cwe-nav-row">
            {step > 0 && (
              <button type="button" className="cwe-btn is-ghost" onClick={() => setStep(step - 1)}>
                Back
              </button>
            )}
            <button type="button" className="cwe-btn" onClick={next}>
              {isLast ? "Save & preview" : `Next: ${STEPS[step + 1].label}`}
            </button>
          </div>
        </div>
      </div>

      {wide && (
        <aside className="cwe-pane" aria-label="Live preview">
          <div className="cwe-pane-bar">
            <span>Live preview</span>
            <button type="button" className="cwe-btn is-ghost is-sm" onClick={() => setPreview(true)}>
              <Icon d={I.replay} /> Replay opening
            </button>
          </div>
          <div className="cwe-pane-scroll" ref={paneRef}>
            <ChapelExperience data={mf} mode="preview" skipDoors embedded />
          </div>
        </aside>
      )}

      <div className="cwe-bar" role="toolbar" aria-label="Save">
        <button type="button" className="cwe-btn is-ghost" onClick={() => setPreview(true)}>
          <Icon d={I.eye} /> Preview
        </button>
        <button type="button" className="cwe-btn is-ghost" onClick={ed.save}>
          <Icon d={I.check} /> Save
        </button>
        <button type="button" className="cwe-btn" onClick={next}>
          {isLast ? "Finish" : "Next"} <Icon d={I.chev} />
        </button>
      </div>

      {undo && (
        <div className="cwe-undo" role="status">
          <span>{undo.label}</span>
          <button
            type="button"
            onClick={() => {
              undo.restore();
              setUndo(null);
            }}
          >
            Undo
          </button>
        </div>
      )}

      {preview && (
        <div className="cwe-full" role="dialog" aria-modal="true" aria-label="Preview">
          <ChapelExperience data={mf} mode="preview" replayKey={0} />
          <div className="cwe-full-bar">
            <button type="button" className="cwe-btn is-ghost" onClick={() => setPreview(false)}>
              <Icon d={I.back} /> Back to editing
            </button>
            <button
              type="button"
              className="cwe-btn"
              onClick={() => {
                setPreview(false);
                ed.save();
              }}
            >
              <Icon d={I.check} /> Save
            </button>
          </div>
        </div>
      )}

      <PhotoCropper
        open={!!crop}
        src={crop?.kind === "couple" ? mf.couplePhoto : crop ? mf.story[crop.i]?.photo ?? "" : ""}
        crop={crop?.kind === "couple" ? coupleCrop : crop ? storyCrop(crop.i) : CROP_DEFAULT}
        aspect={crop?.kind === "couple" ? 3 / 4 : 4 / 3}
        title={crop?.kind === "couple" ? "Frame the couple photo" : "Frame this photo"}
        themeStyle={rootStyle(mf.theme)}
        onChange={(c) => {
          if (!crop) return;
          if (crop.kind === "couple") set({ couplePhotoCrop: { x: c.x, y: c.y, scale: c.scale } });
          else set({ story: mf.story.map((y, k) => (k === crop.i ? { ...y, cropX: c.x, cropY: c.y, scale: c.scale } : y)) });
        }}
        onClose={() => setCrop(null)}
      />
    </WeddingRoot>
  );
}
