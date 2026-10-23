"use client";

// ─── The Shaadi Card editor: eight steps, one form ──────────────────────────
//
//   1 Couple       names + order, the big day (date, time, muhurat), city,
//                  both families, a line + a photo for each of you, the hero photo
//   2 Functions    cards collapsed to "Haldi · 18 Feb · Mehta Haveli"; add from
//                  chips, duplicate, reorder ↑↓, remove (6 s undo); date/time
//                  inputs, venue, address, Maps link (validated), dress code +
//                  8 swatches + custom, a note
//   3 Photos       the album (MasonryEditor: size, focal point, zoom, caption,
//                  drag to reorder, undo)
//   4 Invitation   English + हिन्दी, the blessing line, Shri Ganesh, opens in
//   5 Story        up to four chapters with a croppable photo, the film
//   6 Guest info   who to call, getting there, good to know, livestream, shagun
//   7 Look & music four light palettes, curated wedding songs or any YouTube link
//   8 RSVP & send  RSVP settings, password; once published: a personal link per
//                  family, guest replies + CSV
//
// Phones: a full-screen sheet with a sticky rail of step chips on top and a
// 64 px save bar at the bottom (Preview · Save · Next) that hides while the
// keyboard is open. Desktop (≥ 1024): a left panel, the live page beside it,
// scrolled to the section being edited.

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { MasonryEditor, RsvpDashboard } from "../../_wedding";
import { compressImage } from "../../dedication/components/mediaUploads";
import MusicPicker, { MUSIC_CSS } from "../../_valentine/editor/MusicPicker";
import PhotoCropper, { clampCrop, cropImgStyle, type Crop as CropT } from "../../_valentine/editor/PhotoCropper";
import type { LovePhoto } from "../../_love/types";
import type { MusicMode } from "../../_valentine/types";
import { ART, img } from "./assets";
import { LEGACY_TRACK, LIMITS, QUICK_FUNCTIONS, SHAADI_SONGS, SWATCHES, dialOf, isUpiId, newEventId, presetFor, swatchFor, youTubeIdOf, type ShaadiCardData, type ShaadiEvent, type ShaadiTheme, type StoryChapter } from "./model";
import { copyText, personalUrl, whatsappUrl } from "./sc/guest";
import type { ShaadiEditor } from "../hooks/useShaadiCardEditor";

export const STEPS = [
  { id: "couple", label: "Couple", section: "top" },
  { id: "functions", label: "Functions", section: "events" },
  { id: "photos", label: "Photos", section: "gallery" },
  { id: "invite", label: "Invitation", section: "invitation" },
  { id: "story", label: "Story", section: "story" },
  { id: "guests", label: "Guest info", section: "good-to-know" },
  { id: "look", label: "Look & music", section: "top" },
  { id: "send", label: "RSVP & send", section: "rsvp" },
] as const;

const THEMES: { id: ShaadiTheme; label: string; blurb: string; sw: [string, string, string] }[] = [
  { id: "marigold", label: "Marigold", blurb: "Ivory, marigold and rani pink", sw: ["#fff9ee", "#f29d12", "#b3155a"] },
  { id: "haldi", label: "Haldi", blurb: "Sunny haldi yellow and saffron", sw: ["#fffbe6", "#ffd000", "#c2410c"] },
  { id: "rani", label: "Rani", blurb: "Rani pink with marigold gold", sw: ["#fff6f8", "#be185d", "#f29d12"] },
  { id: "mehendi", label: "Mehendi", blurb: "Leaf green with haldi accents", sw: ["#f8faee", "#3f7d2c", "#f29d12"] },
];

const MAPS_HOST = /^https:\/\/((www\.)?google\.[a-z.]+\/maps|maps\.google\.[a-z.]+|maps\.app\.goo\.gl|goo\.gl\/maps|g\.co\/kgs|(www\.)?openstreetmap\.org|maps\.apple\.com)/i;

function measure(url: string): Promise<{ w: number; h: number } | null> {
  return new Promise((res) => {
    const im = new Image();
    im.onload = () => res({ w: im.naturalWidth, h: im.naturalHeight });
    im.onerror = () => res(null);
    im.src = url;
  });
}

function useKeyboardOpen(): boolean {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const base = { h: window.innerHeight };
    const on = () => setOpen(base.h - vv.height > 150);
    const onResize = () => {
      if (!document.activeElement || !/^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement as HTMLElement).tagName)) base.h = Math.max(base.h, window.innerHeight);
      on();
    };
    vv.addEventListener("resize", onResize);
    return () => vv.removeEventListener("resize", onResize);
  }, []);
  return open;
}

// ── Small building blocks ───────────────────────────────────────────────────

function Field({ label, hint, error, children, htmlFor, count }: { label: string; hint?: ReactNode; error?: string; children: ReactNode; htmlFor?: string; count?: string }) {
  return (
    <div className={`es-field${error ? " has-err" : ""}`}>
      <label className="es-label" htmlFor={htmlFor}>
        <span>{label}</span>
        {count && <small>{count}</small>}
      </label>
      {children}
      {error ? (
        <p className="es-err" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="es-hint">{hint}</p>
      )}
    </div>
  );
}

function Head({ n, title, sub }: { n: number; title: string; sub: string }) {
  return (
    <header className="es-head">
      <span className="es-head-n" aria-hidden>
        {n}
      </span>
      <div>
        <h2 className="es-h">{title}</h2>
        <p className="es-sub">{sub}</p>
      </div>
    </header>
  );
}

function Toggle({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <label className="es-tog">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="es-tog-ui" aria-hidden />
      <span>{children}</span>
    </label>
  );
}

/** A single photo (a portrait, the hero, a story chapter): add · replace · crop & zoom · remove. */
function PhotoSlot({ label, src, crop, aspect, onPhoto, onCrop, hint }: { label: string; src: string; crop: CropT; aspect: number; onPhoto: (url: string) => void; onCrop: (c: CropT) => void; hint?: string }) {
  const file = useRef<HTMLInputElement>(null);
  const [cropping, setCropping] = useState(false);
  const [err, setErr] = useState("");
  const pick = async (f: File) => {
    setErr("");
    try {
      onPhoto(await compressImage(f));
      onCrop({ x: 50, y: 40, scale: 100 });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "That photo could not be read.");
    }
  };
  return (
    <div className="es-photo">
      <button type="button" className="es-photo-frame" style={{ aspectRatio: String(aspect) }} onClick={() => (src ? setCropping(true) : file.current?.click())} aria-label={src ? `${label}: crop and zoom` : `${label}: add a photo`}>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" style={cropImgStyle(clampCrop(crop))} />
        ) : (
          <span className="es-photo-add" aria-hidden>
            ＋
          </span>
        )}
      </button>
      <div className="es-photo-tx">
        <b>{label}</b>
        {hint && <small>{hint}</small>}
        <div className="es-photo-btns">
          <button type="button" className="es-mini" onClick={() => file.current?.click()}>
            {src ? "Replace" : "Add photo"}
          </button>
          {src && (
            <>
              <button type="button" className="es-mini" onClick={() => setCropping(true)}>
                Crop &amp; zoom
              </button>
              <button type="button" className="es-mini is-danger" onClick={() => onPhoto("")}>
                Remove
              </button>
            </>
          )}
        </div>
        {err && (
          <p className="es-err" role="alert">
            {err}
          </p>
        )}
      </div>
      <input
        ref={file}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) void pick(f);
        }}
      />
      {src && <PhotoCropper open={cropping} src={src} crop={clampCrop(crop)} aspect={aspect} title={label} onChange={(c) => onCrop(clampCrop(c))} onClose={() => setCropping(false)} onReplace={() => file.current?.click()} />}
    </div>
  );
}

function Swatches({ value, onChange, label }: { value: string; onChange: (c: string) => void; label: string }) {
  return (
    <div className="es-sws" role="radiogroup" aria-label={label}>
      {SWATCHES.map((c) => (
        <button key={c} type="button" role="radio" aria-checked={value.toLowerCase() === c.toLowerCase()} aria-label={c} className="es-sw" style={{ background: c }} onClick={() => onChange(c)} />
      ))}
      <label className="es-sw es-sw-custom" title="Custom colour">
        <span className="es-sr">Custom colour</span>
        <input type="color" value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#e29a1b"} onChange={(e) => onChange(e.target.value)} />
      </label>
    </div>
  );
}

function PersonalLinks({ base, couple }: { base: string | null; couple: string }) {
  const [name, setName] = useState("");
  const [done, setDone] = useState(false);
  const link = base ? personalUrl(base, name) : "";
  return (
    <div className="es-card es-links">
      <p className="es-kick">✦ A personal link for every family</p>
      <p className="es-hint">Type a name and the window opens with “Dear {name.trim() || "Sharma family"}, you are warmly invited”. Their RSVP starts with that name too.</p>
      {base ? (
        <>
          <input className="es-input" value={name} maxLength={40} placeholder="e.g. Sharma family" onChange={(e) => setName(e.target.value)} aria-label="Guest's name" />
          <code className="es-url">{link}</code>
          <div className="es-row-btns">
            <button
              type="button"
              className="es-chip"
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
              className={`es-chip es-chip-wa${name.trim() ? "" : " is-off"}`}
              aria-disabled={!name.trim()}
              href={name.trim() ? whatsappUrl(`Dear ${name.trim()}, with great joy we invite you to the wedding of ${couple} 🪔\n${link}`) : undefined}
              target="_blank"
              rel="noopener noreferrer"
            >
              Send on WhatsApp
            </a>
          </div>
        </>
      ) : (
        <p className="es-note">Publish first, then come back here to make a link for each family.</p>
      )}
    </div>
  );
}

// ── The sheet ───────────────────────────────────────────────────────────────

export default function EditSheet({ e }: { e: ShaadiEditor }) {
  const { mf, setMf, updateMf, step, setStep, sheet } = e;
  const open = sheet === "form";
  const kb = useKeyboardOpen();
  const bodyRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);

  // Lock the page behind the sheet on phones (desktop keeps the preview scrollable).
  useEffect(() => {
    if (!open) return;
    document.documentElement.classList.add("es-open");
    return () => document.documentElement.classList.remove("es-open");
  }, [open]);

  // New step: to the top of the form, the chip into view, the preview to its section.
  useEffect(() => {
    if (!open) return;
    bodyRef.current?.scrollTo({ top: 0 });
    const chip = railRef.current?.querySelector<HTMLElement>(`[data-step="${step}"]`);
    chip?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    const sec = STEPS[step]?.section;
    const sc = document.querySelector<HTMLElement>("[data-sc-scroller]");
    const target = sec ? document.getElementById(sec) : null;
    if (sc && target && window.matchMedia("(min-width: 1024px)").matches) {
      const top = target.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop;
      sc.scrollTo({ top: Math.max(0, top - 12), behavior: "smooth" });
    }
  }, [step, open]);

  // ── Functions ──────────────────────────────────────────────────────────────
  const events = mf.events;
  const [openEv, setOpenEv] = useState<number | null>(null);
  const [undo, setUndo] = useState<{ row: ShaadiEvent; at: number } | null>(null);
  useEffect(() => {
    if (!undo) return;
    const t = window.setTimeout(() => setUndo(null), 6000);
    return () => window.clearTimeout(t);
  }, [undo]);
  const setEvents = (next: ShaadiEvent[]) => updateMf("events", next);
  const setEvent = (i: number, patch: Partial<ShaadiEvent>) => setEvents(events.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const addEvent = (name?: string) => {
    if (events.length >= LIMITS.events) return;
    const p = name ? presetFor(name) : null;
    const last = events[events.length - 1];
    const taken = new Set(events.map((x) => x.id || ""));
    setEvents([
      ...events,
      { id: newEventId(taken), name: name ?? "", hindi: p?.hindi ?? "", icon: p?.icon ?? "🎊", date: "", time: "", isoDate: last?.isoDate ?? mf.weddingDay, startTime: "", endTime: "", venue: last?.venue ?? "", address: last?.address ?? "", mapUrl: "", dressCode: p?.dress ?? "", dressColor: p?.color ?? "", details: "", accent: p?.accent ?? "", disabled: false },
    ]);
    setOpenEv(events.length);
  };
  const dupEvent = (i: number) => {
    if (events.length >= LIMITS.events) return;
    const taken = new Set(events.map((x) => x.id || ""));
    const next = [...events];
    next.splice(i + 1, 0, { ...events[i], id: newEventId(taken) });
    setEvents(next);
    setOpenEv(i + 1);
  };
  const moveEvent = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= events.length) return;
    const next = [...events];
    [next[i], next[j]] = [next[j], next[i]];
    setEvents(next);
    setOpenEv(j);
  };
  const removeEvent = (i: number) => {
    setUndo({ row: events[i], at: i });
    setEvents(events.filter((_, j) => j !== i));
    setOpenEv(null);
  };
  const restoreEvent = () => {
    if (!undo) return;
    const next = [...mf.events];
    next.splice(Math.min(undo.at, next.length), 0, undo.row);
    setEvents(next);
    setUndo(null);
  };
  const renameEvent = (i: number, name: string) => {
    const cur = events[i];
    const before = presetFor(cur.name);
    const p = presetFor(name);
    // A name that implies a different function brings its Hindi name, icon and dress code (unless typed).
    setEvent(i, {
      name,
      hindi: p && (!cur.hindi || cur.hindi === before?.hindi) ? p.hindi : cur.hindi,
      icon: p && (!cur.icon || cur.icon === before?.icon) ? p.icon : cur.icon,
      accent: p ? p.accent : cur.accent,
      dressCode: p && (!cur.dressCode || cur.dressCode === before?.dress) ? p.dress : cur.dressCode,
      dressColor: p && (!cur.dressColor || cur.dressColor === before?.color) ? p.color : cur.dressColor,
    });
  };

  // ── Photos ────────────────────────────────────────────────────────────────
  const gallery: LovePhoto[] = useMemo(() => mf.galleryImages.map((g) => ({ url: g.src, caption: g.caption, cropX: g.cropX, cropY: g.cropY, scale: g.scale, span: g.span, w: g.w, h: g.h })), [mf.galleryImages]);
  const setGallery = useCallback(
    (next: LovePhoto[]) =>
      setMf((p) => ({
        ...p,
        galleryImages: next.slice(0, LIMITS.photos).map((x, i) => ({ src: x.url, alt: x.caption || p.galleryImages[i]?.alt || "", caption: x.caption, cropX: x.cropX, cropY: x.cropY, scale: x.scale, span: x.span, w: x.w, h: x.h })),
      })),
    [setMf],
  );
  // Old pages stored no size: measure once so the album lays out without jumps.
  useEffect(() => {
    if (!open) return;
    const missing = mf.galleryImages.map((g, i) => [g, i] as const).filter(([g]) => !g.w || !g.h);
    if (!missing.length) return;
    let live = true;
    void Promise.all(missing.map(([g]) => measure(g.src))).then((sizes) => {
      if (!live) return;
      setMf((p) => ({ ...p, galleryImages: p.galleryImages.map((g, i) => {
        const k = missing.findIndex(([, j]) => j === i);
        const sz = k >= 0 ? sizes[k] : null;
        return sz ? { ...g, w: sz.w, h: sz.h } : g;
      }) }));
    });
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mf.galleryImages.length]);

  // ── Story ─────────────────────────────────────────────────────────────────
  const setChapter = (i: number, patch: Partial<StoryChapter>) => updateMf("story", mf.story.map((c, j) => (j === i ? { ...c, ...patch } : c)));

  const couple = `${mf.brideName || "Bride"} & ${mf.groomName || "Groom"}`;
  const upi = mf.upiId.trim();
  const live = mf.liveUrl.trim();
  const vid = mf.videoUrl.trim();
  const last = step === STEPS.length - 1;
  const savedLabel = e.saving ? "Saving…" : e.savedAt ? "Saved ✓" : "";

  if (!open) return null;

  return (
    <div className={`es-wrap${kb ? " is-kb" : ""}`}>
      <style>{ES_CSS + MUSIC_CSS}</style>
      <div className="es-panel" role="dialog" aria-modal="false" aria-label="Edit your invitation">
        <header className="es-top">
          <button type="button" className="es-x" onClick={e.handlePreview} aria-label="Close the form and see the invitation">
            ✕
          </button>
          <div className="es-top-t">
            <p className="es-top-k">Edit your invitation</p>
            <p className="es-top-s" aria-live="polite">
              {savedLabel || `Step ${step + 1} of ${STEPS.length}`}
            </p>
          </div>
          <button type="button" className="es-pub" onClick={e.handlePublish} disabled={e.publishing}>
            {e.publishing ? "Publishing…" : e.shareUrl ? "Update" : "Publish"}
          </button>
        </header>

        <nav className="es-rail" ref={railRef} aria-label="Steps">
          {STEPS.map((s, i) => (
            <button key={s.id} type="button" data-step={i} className={`es-step${i === step ? " is-on" : ""}${i < step ? " is-done" : ""}`} aria-current={i === step ? "step" : undefined} onClick={() => setStep(i)}>
              <span className="es-step-n" aria-hidden>
                {i < step ? "✓" : i + 1}
              </span>
              <span>{s.label}</span>
            </button>
          ))}
        </nav>

        <div className="es-body" ref={bodyRef}>
          {/* ── 1 · Couple ── */}
          {step === 0 && (
            <section aria-label="The couple">
              {e.fill.schema && (
                <button type="button" className="es-ai" onClick={e.openAi}>
                  {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                  <img className="es-ai-art" {...img(ART.garlandBorder)} aria-hidden />
                  <span className="es-ai-k">✦ Let AI write it</span>
                  <b>Answer 8 quick questions</b>
                  <small>Names, every function, the Hindi nimantran and your story, written for you. You check every word.</small>
                </button>
              )}
              <Head n={1} title="The couple" sub="Names as you'd like them printed, the big day and both families." />
              <div className="es-two">
                <Field label="Bride's name" htmlFor="es-bride" error={!mf.brideName.trim() ? "Needed for the invitation" : undefined}>
                  <input id="es-bride" className="es-input" value={mf.brideName} maxLength={30} placeholder="e.g. Ishita" onChange={(x) => updateMf("brideName", x.target.value)} />
                </Field>
                <Field label="Groom's name" htmlFor="es-groom" error={!mf.groomName.trim() ? "Needed for the invitation" : undefined}>
                  <input id="es-groom" className="es-input" value={mf.groomName} maxLength={30} placeholder="e.g. Kabir" onChange={(x) => updateMf("groomName", x.target.value)} />
                </Field>
              </div>
              <div className="es-seg" role="radiogroup" aria-label="Whose name comes first">
                {(["bride", "groom"] as const).map((o) => (
                  <button key={o} type="button" role="radio" aria-checked={mf.nameOrder === o} onClick={() => updateMf("nameOrder", o)}>
                    {o === "bride" ? `${mf.brideName || "Bride"} & ${mf.groomName || "Groom"}` : `${mf.groomName || "Groom"} & ${mf.brideName || "Bride"}`}
                  </button>
                ))}
              </div>
              <div className="es-card">
                <p className="es-kick">🪔 The big day · the countdown, calendars and the card use it</p>
                <div className="es-three">
                  <Field label="Date" htmlFor="es-day">
                    <input id="es-day" type="date" className="es-input" value={mf.weddingDay} onChange={(x) => updateMf("weddingDay", x.target.value)} />
                  </Field>
                  <Field label="Time" htmlFor="es-time">
                    <input id="es-time" type="time" className="es-input" value={mf.weddingTime} onChange={(x) => updateMf("weddingTime", x.target.value)} />
                  </Field>
                  <Field label="Muhurat (optional)" htmlFor="es-muh">
                    <input id="es-muh" className="es-input" value={mf.muhurat} maxLength={60} placeholder="Shubh muhurat 8:40 pm" onChange={(x) => updateMf("muhurat", x.target.value)} />
                  </Field>
                </div>
                <Field label="City" htmlFor="es-city">
                  <input id="es-city" className="es-input" value={mf.venue} maxLength={40} placeholder="e.g. Udaipur" onChange={(x) => updateMf("venue", x.target.value)} />
                </Field>
              </div>
              <h3 className="es-h3">Families</h3>
              <div className="es-two">
                <Field label="Bride's parents" htmlFor="es-bp">
                  <input id="es-bp" className="es-input" value={mf.brideFamily.parents} maxLength={120} placeholder="Smt. Kavita & Shri Deepak Mehta" onChange={(x) => updateMf("brideFamily", { ...mf.brideFamily, parents: x.target.value })} />
                </Field>
                <Field label="Groom's parents" htmlFor="es-gp">
                  <input id="es-gp" className="es-input" value={mf.groomFamily.parents} maxLength={120} placeholder="Smt. Ritu & Shri Anil Kapoor" onChange={(x) => updateMf("groomFamily", { ...mf.groomFamily, parents: x.target.value })} />
                </Field>
                <Field label="Bride's grandparents (optional)" htmlFor="es-bg">
                  <input id="es-bg" className="es-input" value={mf.brideFamily.grandparents} maxLength={120} onChange={(x) => updateMf("brideFamily", { ...mf.brideFamily, grandparents: x.target.value })} />
                </Field>
                <Field label="Groom's grandparents (optional)" htmlFor="es-gg">
                  <input id="es-gg" className="es-input" value={mf.groomFamily.grandparents} maxLength={120} onChange={(x) => updateMf("groomFamily", { ...mf.groomFamily, grandparents: x.target.value })} />
                </Field>
              </div>
              <Field label="With the blessings of (optional)" htmlFor="es-bo" hint="Elders whose blessings you'd like printed.">
                <input id="es-bo" className="es-input" value={mf.blessingsOf} maxLength={160} placeholder="Dadi, Nani and all our elders" onChange={(x) => updateMf("blessingsOf", x.target.value)} />
              </Field>
              <h3 className="es-h3">About the two of you</h3>
              <div className="es-two">
                <Field label={`A line about ${mf.brideName || "the bride"}`} htmlFor="es-bd" count={`${mf.bride.description.length}/240`}>
                  <textarea id="es-bd" className="es-input es-area" rows={3} maxLength={240} value={mf.bride.description} onChange={(x) => updateMf("bride", { ...mf.bride, description: x.target.value })} />
                </Field>
                <Field label={`A line about ${mf.groomName || "the groom"}`} htmlFor="es-gd" count={`${mf.groom.description.length}/240`}>
                  <textarea id="es-gd" className="es-input es-area" rows={3} maxLength={240} value={mf.groom.description} onChange={(x) => updateMf("groom", { ...mf.groom, description: x.target.value })} />
                </Field>
              </div>
              <div className="es-photos3">
                <PhotoSlot label="Bride's photo" src={mf.bride.photo} crop={mf.brideCrop} aspect={4 / 5} onPhoto={(u) => updateMf("bride", { ...mf.bride, photo: u })} onCrop={(c) => updateMf("brideCrop", c)} />
                <PhotoSlot label="Groom's photo" src={mf.groom.photo} crop={mf.groomCrop} aspect={4 / 5} onPhoto={(u) => updateMf("groom", { ...mf.groom, photo: u })} onCrop={(c) => updateMf("groomCrop", c)} />
                <PhotoSlot label="Your photo in the mandap" hint="Optional. Replaces the painted couple at the top." src={mf.couplePhoto} crop={mf.coupleCrop} aspect={3 / 4} onPhoto={(u) => updateMf("couplePhoto", u)} onCrop={(c) => updateMf("coupleCrop", c)} />
              </div>
            </section>
          )}

          {/* ── 2 · Functions ── */}
          {step === 1 && (
            <section aria-label="Functions">
              <Head n={2} title="Functions" sub={`Up to ${LIMITS.events}. Each gets its own card with the painted couple, timings, a map, the dress code and calendar buttons.`} />
              <ol className="es-evs">
                {events.map((ev, i) => {
                  const isOpen = openEv === i;
                  const sw = swatchFor(ev);
                  const mapBad = !!ev.mapUrl && !MAPS_HOST.test(ev.mapUrl);
                  const summary = [ev.isoDate ? new Date(`${ev.isoDate}T12:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" }) : ev.date, ev.venue].filter(Boolean).join(" · ");
                  return (
                    <li key={ev.id || i} className={`es-ev${isOpen ? " is-open" : ""}`}>
                      <button type="button" className="es-ev-head" onClick={() => setOpenEv(isOpen ? null : i)} aria-expanded={isOpen}>
                        <span className="es-ev-ic" style={{ background: sw || "#fff1d2" }} aria-hidden>
                          {ev.icon || presetFor(ev.name)?.icon || "🎊"}
                        </span>
                        <span className="es-ev-t">
                          <b>{ev.name || "New function"}</b>
                          <small>{summary || "Tap to fill in"}</small>
                        </span>
                        <span className="es-ev-chev" aria-hidden>
                          {isOpen ? "−" : "+"}
                        </span>
                      </button>
                      {isOpen && (
                        <div className="es-ev-body">
                          <Field label="Name" htmlFor={`es-e${i}-n`}>
                            <input id={`es-e${i}-n`} className="es-input" value={ev.name} maxLength={40} placeholder="e.g. Sangeet" onChange={(x) => renameEvent(i, x.target.value)} />
                          </Field>
                          <div className="es-three">
                            <Field label="Date" htmlFor={`es-e${i}-d`}>
                              <input id={`es-e${i}-d`} type="date" className="es-input" value={ev.isoDate || ""} onChange={(x) => setEvent(i, { isoDate: x.target.value })} />
                            </Field>
                            <Field label="Starts" htmlFor={`es-e${i}-s`}>
                              <input id={`es-e${i}-s`} type="time" className="es-input" value={ev.startTime || ""} onChange={(x) => setEvent(i, { startTime: x.target.value })} />
                            </Field>
                            <Field label="Ends" htmlFor={`es-e${i}-x`}>
                              <input id={`es-e${i}-x`} type="time" className="es-input" value={ev.endTime || ""} onChange={(x) => setEvent(i, { endTime: x.target.value })} />
                            </Field>
                          </div>
                          {!ev.isoDate && ev.date && <p className="es-hint">Saved earlier as “{ev.date}{ev.time ? `, ${ev.time}` : ""}”. Pick the date above to add calendar buttons.</p>}
                          <div className="es-two">
                            <Field label="Venue" htmlFor={`es-e${i}-v`}>
                              <input id={`es-e${i}-v`} className="es-input" value={ev.venue} maxLength={100} placeholder="e.g. Mehta Haveli Courtyard" onChange={(x) => setEvent(i, { venue: x.target.value })} />
                            </Field>
                            <Field label="Address" htmlFor={`es-e${i}-a`}>
                              <input id={`es-e${i}-a`} className="es-input" value={ev.address || ""} maxLength={160} placeholder="Street, city" onChange={(x) => setEvent(i, { address: x.target.value })} />
                            </Field>
                          </div>
                          <Field label="Google Maps link (optional)" htmlFor={`es-e${i}-m`} hint="In Google Maps tap Share → Copy link, and paste it here. Empty: guests get directions to the venue and address." error={mapBad ? "That isn't a maps link. Paste the link from Google Maps (https://maps.app.goo.gl/…)." : undefined}>
                            <input id={`es-e${i}-m`} className="es-input" inputMode="url" value={ev.mapUrl || ""} maxLength={400} placeholder="https://maps.app.goo.gl/…" onChange={(x) => setEvent(i, { mapUrl: x.target.value.trim() })} />
                          </Field>
                          <Field label="Dress code" htmlFor={`es-e${i}-dc`} hint="Short and clear: “Shades of yellow”, “Indo-western glam”.">
                            <input id={`es-e${i}-dc`} className="es-input" value={ev.dressCode || ""} maxLength={60} onChange={(x) => setEvent(i, { dressCode: x.target.value })} />
                          </Field>
                          <Swatches value={ev.dressColor || ""} onChange={(c) => setEvent(i, { dressColor: c })} label="Dress-code colour" />
                          <Field label="A line for guests (optional)" htmlFor={`es-e${i}-t`}>
                            <textarea id={`es-e${i}-t`} className="es-input es-area" rows={2} maxLength={400} value={ev.details} placeholder="e.g. Safas are tied from 5 pm." onChange={(x) => setEvent(i, { details: x.target.value })} />
                          </Field>
                          <div className="es-ev-tools">
                            <button type="button" className="es-mini" onClick={() => moveEvent(i, -1)} disabled={i === 0} aria-label="Move earlier">
                              ↑ Earlier
                            </button>
                            <button type="button" className="es-mini" onClick={() => moveEvent(i, 1)} disabled={i === events.length - 1} aria-label="Move later">
                              ↓ Later
                            </button>
                            <button type="button" className="es-mini" onClick={() => dupEvent(i)} disabled={events.length >= LIMITS.events}>
                              Duplicate
                            </button>
                            <button type="button" className="es-mini is-danger" onClick={() => removeEvent(i)}>
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
                <p className="es-undo" role="status">
                  Removed “{undo.row.name || "a function"}”.{" "}
                  <button type="button" onClick={restoreEvent}>
                    Undo
                  </button>
                </p>
              )}
              {events.length < LIMITS.events ? (
                <div className="es-quick">
                  <span>Add:</span>
                  {QUICK_FUNCTIONS.filter((q) => !events.some((x) => x.name.toLowerCase() === q.toLowerCase())).map((q) => (
                    <button key={q} type="button" className="es-chip" onClick={() => addEvent(q)}>
                      + {q}
                    </button>
                  ))}
                  <button type="button" className="es-chip" onClick={() => addEvent()}>
                    + Other
                  </button>
                </div>
              ) : (
                <p className="es-hint">All {LIMITS.events} functions are in. Remove one to add another.</p>
              )}
            </section>
          )}

          {/* ── 3 · Photos ── */}
          {step === 2 && (
            <section aria-label="Photos">
              <Head n={3} title="Photos" sub={`Up to ${LIMITS.photos}. Tap a photo to make it wide, tall or large, set its focus and zoom, or add a caption. Drag ⠿ to reorder.`} />
              <MasonryEditor photos={gallery} onChange={setGallery} max={LIMITS.photos} mask="rounded" />
            </section>
          )}

          {/* ── 4 · Invitation ── */}
          {step === 3 && (
            <section aria-label="Your invitation">
              <Head n={4} title="Your invitation" sub="The words guests read first. On wide screens English and Hindi sit side by side; on phones guests switch with EN / हिं." />
              <Field label="In English" htmlFor="es-inv" count={`${mf.invitation.length}/1500`} hint="Leave a blank line between paragraphs. Empty: we write one from your names.">
                <textarea id="es-inv" className="es-input es-area es-letter" rows={7} maxLength={1500} value={mf.invitation} onChange={(x) => updateMf("invitation", x.target.value)} />
              </Field>
              <Field label="हिन्दी में (optional)" htmlFor="es-hi" count={`${mf.hindiMessage.length}/800`}>
                <textarea id="es-hi" lang="hi" className="es-input es-area es-letter" rows={5} maxLength={800} value={mf.hindiMessage} placeholder="ईश्वर की असीम कृपा और बड़ों के आशीर्वाद से…" onChange={(x) => updateMf("hindiMessage", x.target.value)} />
              </Field>
              <div className="es-two">
                <Field label="Blessing line" htmlFor="es-om">
                  <input id="es-om" className="es-input" lang="hi" value={mf.blessing} maxLength={60} onChange={(x) => updateMf("blessing", x.target.value)} />
                </Field>
                <Field label="Closing line" htmlFor="es-close">
                  <input id="es-close" className="es-input" value={mf.closingLine} maxLength={120} placeholder="With love, the Mehta & Kapoor families" onChange={(x) => updateMf("closingLine", x.target.value)} />
                </Field>
              </div>
              <Field label="Wedding hashtag (optional)" htmlFor="es-tag">
                <input id="es-tag" className="es-input" value={mf.hashtag} maxLength={40} placeholder="#AnArKiShaadi" onChange={(x) => updateMf("hashtag", x.target.value.replace(/\s+/g, ""))} />
              </Field>
              <Toggle checked={mf.invocation} onChange={(v) => updateMf("invocation", v)}>
                Begin with “॥ श्री गणेशाय नमः ॥”
              </Toggle>
              <Toggle checked={mf.lang === "hi"} onChange={(v) => updateMf("lang", v ? "hi" : "en")}>
                Open the invitation in Hindi (guests can switch)
              </Toggle>
            </section>
          )}

          {/* ── 5 · Story ── */}
          {step === 4 && (
            <section aria-label="Your story">
              <Head n={5} title="Your story" sub={`A few moments: how you met, the proposal, the roka. Up to ${LIMITS.story}, each with a photo you can crop.`} />
              <ol className="es-list">
                {mf.story.map((c, i) => (
                  <li key={i} className="es-card">
                    <div className="es-two es-two-tight">
                      <Field label="When" htmlFor={`es-s${i}-w`}>
                        <input id={`es-s${i}-w`} className="es-input" value={c.when} maxLength={30} placeholder="2019" onChange={(x) => setChapter(i, { when: x.target.value })} />
                      </Field>
                      <Field label="Title" htmlFor={`es-s${i}-t`}>
                        <input id={`es-s${i}-t`} className="es-input" value={c.title} maxLength={80} placeholder="How we met" onChange={(x) => setChapter(i, { title: x.target.value })} />
                      </Field>
                    </div>
                    <Field label="What happened" htmlFor={`es-s${i}-l`}>
                      <textarea id={`es-s${i}-l`} className="es-input es-area" rows={3} maxLength={320} value={c.line} onChange={(x) => setChapter(i, { line: x.target.value })} />
                    </Field>
                    <PhotoSlot label="Chapter photo" src={c.photo} crop={{ x: c.cropX ?? 50, y: c.cropY ?? 50, scale: c.scale ?? 100 }} aspect={4 / 3} onPhoto={(u) => setChapter(i, { photo: u })} onCrop={(k) => setChapter(i, { cropX: Math.round(k.x), cropY: Math.round(k.y), scale: Math.round(k.scale) })} />
                    <button type="button" className="es-mini is-danger" onClick={() => updateMf("story", mf.story.filter((_, j) => j !== i))}>
                      Remove chapter
                    </button>
                  </li>
                ))}
              </ol>
              {mf.story.length < LIMITS.story && (
                <button type="button" className="es-chip" onClick={() => updateMf("story", [...mf.story, { when: "", title: "", line: "", photo: "", cropX: 50, cropY: 50, scale: 100 }])}>
                  + Add a chapter
                </button>
              )}
              <h3 className="es-h3">Your film (optional)</h3>
              <Field label="YouTube link" htmlFor="es-vid" hint="A pre-wedding film or teaser. Guests tap to play; it never plays by itself." error={vid && !youTubeIdOf(vid) ? "That doesn't look like a YouTube link." : undefined}>
                <input id="es-vid" className="es-input" inputMode="url" value={mf.videoUrl} maxLength={300} placeholder="https://youtu.be/…" onChange={(x) => updateMf("videoUrl", x.target.value.trim())} />
              </Field>
            </section>
          )}

          {/* ── 6 · Guest info ── */}
          {step === 5 && (
            <section aria-label="Guest info">
              <Head n={6} title="Guest info" sub="Who to call, how to get there, little things to know, a livestream and shagun." />
              <h3 className="es-h3">Who should guests call?</h3>
              <p className="es-hint">Up to {LIMITS.contacts}. Guests get a Call and a WhatsApp button for each.</p>
              <ol className="es-list">
                {mf.contacts.map((c, i) => {
                  const bad = !!c.phone.trim() && !dialOf(c.phone);
                  return (
                    <li key={i} className="es-card">
                      <div className="es-three">
                        <Field label="Name" htmlFor={`es-c${i}-n`}>
                          <input id={`es-c${i}-n`} className="es-input" value={c.name} maxLength={40} placeholder="e.g. Rohan Mehta" onChange={(x) => updateMf("contacts", mf.contacts.map((q, j) => (j === i ? { ...q, name: x.target.value } : q)))} />
                        </Field>
                        <Field label="Relation" htmlFor={`es-c${i}-r`}>
                          <input id={`es-c${i}-r`} className="es-input" value={c.relation} maxLength={40} placeholder="Bride's brother" onChange={(x) => updateMf("contacts", mf.contacts.map((q, j) => (j === i ? { ...q, relation: x.target.value } : q)))} />
                        </Field>
                        <Field label="Mobile" htmlFor={`es-c${i}-p`} error={bad ? "10 digits starting 6–9, with or without +91" : undefined}>
                          <div className="es-phone">
                            <span aria-hidden>+91</span>
                            <input id={`es-c${i}-p`} className="es-input" type="tel" inputMode="tel" value={c.phone} maxLength={16} placeholder="98290 11223" onChange={(x) => updateMf("contacts", mf.contacts.map((q, j) => (j === i ? { ...q, phone: x.target.value } : q)))} />
                          </div>
                        </Field>
                      </div>
                      <button type="button" className="es-mini is-danger" onClick={() => updateMf("contacts", mf.contacts.filter((_, j) => j !== i))}>
                        Remove
                      </button>
                    </li>
                  );
                })}
              </ol>
              {mf.contacts.length < LIMITS.contacts && (
                <button type="button" className="es-chip" onClick={() => updateMf("contacts", [...mf.contacts, { name: "", relation: "", phone: "" }])}>
                  + Add a contact
                </button>
              )}
              <h3 className="es-h3">Getting there</h3>
              <Field label="Travel notes (optional)" htmlFor="es-get">
                <textarea id="es-get" className="es-input es-area" rows={3} maxLength={600} value={mf.gettingThere} placeholder="Nearest airport, station, parking, cabs…" onChange={(x) => updateMf("gettingThere", x.target.value)} />
              </Field>
              <h3 className="es-h3">Good to know</h3>
              <p className="es-hint">Up to {LIMITS.things}. Start with a heading and a colon: “Stay: Rooms are held at…”.</p>
              <ol className="es-list">
                {mf.things.map((t, i) => (
                  <li key={i} className="es-thing">
                    <input className="es-input" value={t} maxLength={240} aria-label={`Note ${i + 1}`} onChange={(x) => updateMf("things", mf.things.map((q, j) => (j === i ? x.target.value : q)))} />
                    <button type="button" className="es-mini is-danger" onClick={() => updateMf("things", mf.things.filter((_, j) => j !== i))} aria-label={`Remove note ${i + 1}`}>
                      ✕
                    </button>
                  </li>
                ))}
              </ol>
              {mf.things.length < LIMITS.things && (
                <button type="button" className="es-chip" onClick={() => updateMf("things", [...mf.things, ""])}>
                  + Add a note
                </button>
              )}
              <h3 className="es-h3">Livestream (optional)</h3>
              <Field label="YouTube or Zoom link" htmlFor="es-live" hint="“Watch live” lights up 30 minutes before the wedding, for family who can't travel." error={live && !/^https:\/\/\S+$/i.test(live) ? "Paste the full link, starting with https://" : undefined}>
                <input id="es-live" className="es-input" inputMode="url" value={mf.liveUrl} maxLength={300} placeholder="https://youtube.com/live/…" onChange={(x) => updateMf("liveUrl", x.target.value.trim())} />
              </Field>
              <h3 className="es-h3">Shagun (optional)</h3>
              <p className="es-hint">Off unless you add a UPI id. Guests see a gentle note with a Pay by UPI button. We never touch the money.</p>
              <div className="es-two">
                <Field label="UPI id" htmlFor="es-upi" error={upi && !isUpiId(upi) ? "A UPI id looks like name@bank" : undefined}>
                  <input id="es-upi" className="es-input" value={mf.upiId} maxLength={60} placeholder="mehtafamily@okhdfcbank" autoComplete="off" onChange={(x) => updateMf("upiId", x.target.value.trim())} />
                </Field>
                <Field label="Name on the account" htmlFor="es-upin">
                  <input id="es-upin" className="es-input" value={mf.upiName} maxLength={60} placeholder="Deepak Mehta" onChange={(x) => updateMf("upiName", x.target.value)} />
                </Field>
              </div>
            </section>
          )}

          {/* ── 7 · Look & music ── */}
          {step === 6 && (
            <section aria-label="Look and music">
              <Head n={7} title="Look & music" sub="Four light palettes. The song starts when the guest opens the khidki, never before, and there's always a mute button." />
              <div className="es-themes" role="radiogroup" aria-label="Palette">
                {THEMES.map((t) => (
                  <button key={t.id} type="button" role="radio" aria-checked={mf.theme === t.id} className="es-theme" onClick={() => updateMf("theme", t.id)}>
                    <span className="es-theme-sw" aria-hidden>
                      {t.sw.map((c) => (
                        <i key={c} style={{ background: c }} />
                      ))}
                    </span>
                    <b>{t.label}</b>
                    <small>{t.blurb}</small>
                  </button>
                ))}
              </div>
              <div className="es-music">
                <MusicPicker
                  value={{ musicMode: (mf.musicMode || "track") as MusicMode, musicYoutubeId: mf.musicYoutubeId, musicStart: mf.musicStart }}
                  suggestions={SHAADI_SONGS}
                  suggestionsNote="Shehnai, wedding favourites and a few English ones · or paste any YouTube link"
                  audioOnly
                  track={LEGACY_TRACK}
                  onChange={(p) => {
                    setMf((x) => ({
                      ...x,
                      ...(p.musicMode !== undefined ? { musicMode: p.musicMode } : {}),
                      ...(p.musicYoutubeId !== undefined ? { musicYoutubeId: p.musicYoutubeId } : {}),
                      ...(p.musicStart !== undefined ? { musicStart: p.musicStart } : {}),
                    }));
                  }}
                />
              </div>
            </section>
          )}

          {/* ── 8 · RSVP & send ── */}
          {step === 7 && (
            <section aria-label="RSVP and send">
              <Head n={8} title="RSVP & send" sub="How guests reply, a password if you want one, and your personal links." />
              <Toggle checked={mf.rsvpOn} onChange={(v) => updateMf("rsvpOn", v)}>
                Ask guests to RSVP (per function, no login, 3 taps)
              </Toggle>
              {mf.rsvpOn && (
                <div className="es-card">
                  <div className="es-two">
                    <Field label="Reply by (optional)" htmlFor="es-by">
                      <input id="es-by" type="date" className="es-input" value={mf.rsvpBy} onChange={(x) => updateMf("rsvpBy", x.target.value)} />
                    </Field>
                    <Field label="Most guests per reply" htmlFor="es-max">
                      <select id="es-max" className="es-input" value={mf.maxGuests} onChange={(x) => updateMf("maxGuests", Number(x.target.value))}>
                        {Array.from({ length: 10 }, (_, i) => i + 1).map((k) => (
                          <option key={k} value={k}>
                            {k}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  <Toggle checked={mf.rsvpMeal} onChange={(v) => updateMf("rsvpMeal", v)}>
                    Ask veg / non-veg / Jain
                  </Toggle>
                  <p className="es-hint">Every reply reaches you by email, with running totals per function.</p>
                </div>
              )}
              <h3 className="es-h3">Password (optional)</h3>
              <Field label="Only guests with this password can open it" htmlFor="es-pw" hint="Leave empty for a link anyone can open.">
                <input id="es-pw" className="es-input" value={e.pagePassword} maxLength={40} autoComplete="off" onChange={(x) => e.setPagePassword(x.target.value)} />
              </Field>
              <PersonalLinks base={e.shareUrl} couple={couple} />
              {e.pageId && e.accessToken && e.shareUrl && (
                <details className="es-card es-dash" open>
                  <summary>Guest replies</summary>
                  <RsvpDashboard slug="shaadi-card" pageId={e.pageId} token={e.accessToken} csvName={`rsvps-${couple.replace(/[^a-z0-9]+/gi, "-")}`} />
                </details>
              )}
            </section>
          )}
        </div>

        <footer className="es-bar">
          <button type="button" className="es-bar-btn es-bar-prev" onClick={e.handlePreview}>
            Preview
          </button>
          <button type="button" className="es-bar-btn" onClick={e.handleSave}>
            Save
          </button>
          {last ? (
            <button type="button" className="es-bar-btn is-primary" onClick={e.handlePublish} disabled={e.publishing}>
              {e.publishing ? "Publishing…" : e.shareUrl ? "Update" : "Publish ✦"}
            </button>
          ) : (
            <button type="button" className="es-bar-btn is-primary" onClick={() => setStep(step + 1)}>
              Next →
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}

// ── Styles (the editor chrome: ivory, marigold, rani pink) ──────────────────

const ES_CSS = `
html.es-open { overflow: hidden; }
@media (min-width: 1024px) { html.es-open { overflow: auto; } }
.es-wrap { position: fixed; inset: 0; z-index: 150; display: flex; pointer-events: none; }
.es-panel { pointer-events: auto; position: relative; display: flex; flex-direction: column; width: 100%; height: 100dvh; background: #fffaf2; color: #3d1a0f;
  font-family: var(--font-wk-sans, "DM Sans"), system-ui, sans-serif; }
@media (min-width: 1024px) {
  .es-wrap { right: auto; width: var(--es-w, 560px); }
  .es-panel { box-shadow: 18px 0 50px -30px rgba(61, 26, 15, .55); border-right: 1px solid rgba(179, 21, 90, .14); }
}
@media (min-width: 1440px) { .es-wrap { --es-w: 620px; } }
.es-top { flex: none; display: flex; align-items: center; gap: 10px; padding: calc(env(safe-area-inset-top, 0px) + 8px) 12px 8px; background: #fffaf2; border-bottom: 1px solid rgba(179, 21, 90, .1); }
.es-x { flex: none; width: 44px; height: 44px; border-radius: 50%; border: 0; background: rgba(179, 21, 90, .08); color: #3d1a0f; font-size: 17px; cursor: pointer; }
.es-top-t { flex: 1; min-width: 0; }
.es-top-k { margin: 0; font: 600 18px/1.2 var(--font-wk-display, "Cormorant Garamond"), Georgia, serif; }
.es-top-s { margin: 2px 0 0; font-size: 12.5px; color: #8a6d55; }
.es-pub { flex: none; min-height: 44px; padding: 0 18px; border: 0; border-radius: 999px; background: linear-gradient(135deg, #c2185b, #e0457b 60%, #f29d12); color: #fff; font: 700 14.5px/1 inherit; cursor: pointer; box-shadow: 0 10px 20px -12px rgba(194, 24, 91, .8); }
.es-pub:disabled { opacity: .6; }
.es-rail { flex: none; display: flex; gap: 8px; overflow-x: auto; padding: 10px 12px; scrollbar-width: none; background: #fff4e0; border-bottom: 1px solid rgba(226, 154, 27, .3); scroll-snap-type: x proximity; }
.es-rail::-webkit-scrollbar { display: none; }
.es-step { flex: none; scroll-snap-align: center; display: inline-flex; align-items: center; gap: 8px; min-height: 44px; padding: 0 14px 0 6px; border-radius: 999px; border: 1.5px solid rgba(179, 21, 90, .16); background: #fff; color: #5a3a24; font: 600 14px/1 inherit; cursor: pointer; white-space: nowrap; }
.es-step-n { display: grid; place-items: center; width: 30px; height: 30px; border-radius: 50%; background: #fff1d2; color: #8c5300; font-size: 13px; }
.es-step.is-done .es-step-n { background: #3f7d2c; color: #fff; }
.es-step.is-on { border-color: transparent; background: linear-gradient(135deg, #c2185b, #e0457b); color: #fff; }
.es-step.is-on .es-step-n { background: rgba(255, 255, 255, .25); color: #fff; }
.es-body { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 18px 16px 32px; scroll-padding-bottom: 24px; }
.es-body :is(input, textarea, select) { scroll-margin-bottom: 24px; scroll-margin-top: 16px; }
.es-wrap.is-kb .es-body { padding-bottom: 24px; }
.es-bar { position: relative; flex: none; display: grid; grid-template-columns: 1fr 1fr 1.3fr; gap: 8px; min-height: 64px; padding: 10px 12px calc(10px + env(safe-area-inset-bottom, 0px)); background: rgba(255, 250, 242, .97); border-top: 1px solid rgba(179, 21, 90, .12); box-shadow: 0 -12px 30px -22px rgba(61, 26, 15, .5); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); }
.es-wrap.is-kb .es-bar { display: none; }
.es-bar-btn { min-height: 46px; border-radius: 14px; border: 1.5px solid rgba(179, 21, 90, .2); background: #fff; color: #3d1a0f; font: 700 15px/1 inherit; cursor: pointer; }
.es-bar-btn.is-primary { border-color: transparent; background: linear-gradient(135deg, #c2185b, #e0457b 60%, #f29d12); color: #fff; box-shadow: 0 10px 20px -12px rgba(194, 24, 91, .8); }
.es-bar-btn:disabled { opacity: .6; }
@media (min-width: 1024px) {
  .es-panel { display: grid; grid-template-columns: 168px minmax(0, 1fr); grid-template-rows: auto minmax(0, 1fr) auto; }
  .es-top { grid-column: 1 / -1; }
  .es-rail { grid-row: 2; flex-direction: column; overflow-x: visible; overflow-y: auto; padding: 14px 10px; border-bottom: 0; border-right: 1px solid rgba(226, 154, 27, .3); }
  .es-step { width: 100%; white-space: normal; text-align: left; line-height: 1.2; padding: 6px 10px 6px 6px; }
  .es-body { grid-row: 2; padding-bottom: 28px; }
  .es-bar { position: static; grid-column: 1 / -1; grid-template-columns: 1fr 1.3fr; }
  .es-bar-prev { display: none; }
}
.es-head { display: flex; gap: 12px; align-items: flex-start; margin: 4px 0 16px; }
.es-head-n { flex: none; display: grid; place-items: center; width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, #f29d12, #c2185b); color: #fff; font: 700 17px/1 inherit; }
.es-h { margin: 0; font: 600 24px/1.2 var(--font-wk-display, "Cormorant Garamond"), Georgia, serif; }
.es-sub { margin: 4px 0 0; font-size: 14.5px; line-height: 1.5; color: #7a5a43; }
.es-h3 { margin: 22px 0 10px; font: 600 19px/1.3 var(--font-wk-display, "Cormorant Garamond"), Georgia, serif; }
.es-field { margin-bottom: 14px; min-width: 0; }
.es-label { display: flex; justify-content: space-between; gap: 8px; margin: 0 0 6px; font: 600 14px/1.3 inherit; color: #5a3a24; }
.es-label small { font-weight: 500; color: #a08770; }
.es-input { display: block; width: 100%; min-height: 48px; padding: 11px 13px; border-radius: 12px; border: 1.5px solid rgba(179, 21, 90, .18); background: #fff; color: #3d1a0f; font: 400 16px/1.4 inherit; outline: none; }
.es-input:focus { border-color: #c2185b; box-shadow: 0 0 0 3px rgba(194, 24, 91, .12); }
select.es-input { appearance: auto; }
.es-area { resize: vertical; min-height: 88px; }
.es-letter { font: 400 17px/1.6 var(--font-wk-display, "Cormorant Garamond"), Georgia, serif; }
.es-letter:lang(hi) { font: 400 16px/1.8 var(--font-wk-deva, "Tiro Devanagari Hindi"), serif; }
.es-field.has-err .es-input { border-color: #d0453a; }
.es-err { margin: 5px 0 0; font-size: 13.5px; color: #b42318; }
.es-hint { margin: 5px 0 0; font-size: 13.5px; line-height: 1.45; color: #8a6d55; }
.es-note { margin: 8px 0 0; padding: 10px 12px; border-radius: 12px; background: #fff1d2; font-size: 14px; color: #6b4a1e; }
.es-two, .es-three { display: grid; gap: 0 12px; }
@media (min-width: 560px) { .es-two { grid-template-columns: 1fr 1fr; } .es-three { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); } .es-three > :first-child { grid-column: 1 / -1; } }
.es-two-tight { grid-template-columns: 110px 1fr; }
.es-card { margin: 12px 0; padding: 14px; border-radius: 16px; background: #fff; border: 1px solid rgba(179, 21, 90, .12); box-shadow: 0 10px 24px -20px rgba(61, 26, 15, .5); }
.es-kick { margin: 0 0 10px; font: 700 13px/1.4 inherit; color: #8c5300; }
.es-seg { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; padding: 4px; margin: 0 0 6px; border-radius: 14px; background: rgba(226, 154, 27, .14); }
.es-seg button { min-height: 44px; padding: 4px 8px; border: 0; border-radius: 10px; background: transparent; color: #5a3a24; font: 600 14px/1.2 inherit; cursor: pointer; overflow-wrap: anywhere; }
.es-seg button[aria-checked=true] { background: #fff; color: #b3155a; box-shadow: 0 6px 14px -8px rgba(120, 60, 10, .5); }
.es-chip { display: inline-flex; align-items: center; min-height: 44px; padding: 0 14px; border-radius: 999px; border: 1.5px dashed rgba(179, 21, 90, .3); background: #fff; color: #b3155a; font: 600 14px/1 inherit; cursor: pointer; text-decoration: none; }
.es-chip:disabled, .es-chip.is-off { opacity: .45; pointer-events: none; }
.es-chip-wa { border-style: solid; border-color: #1faa59; color: #128c4b; }
.es-mini { min-height: 40px; padding: 0 12px; border-radius: 10px; border: 1px solid rgba(179, 21, 90, .18); background: #fff; color: #5a3a24; font: 600 13.5px/1 inherit; cursor: pointer; }
.es-mini:disabled { opacity: .4; }
.es-mini.is-danger { color: #b42318; border-color: rgba(180, 35, 24, .25); }
.es-tog { display: flex; align-items: center; gap: 12px; min-height: 48px; margin: 6px 0; font-size: 15px; cursor: pointer; }
.es-tog input { position: absolute; opacity: 0; width: 1px; height: 1px; }
.es-tog-ui { flex: none; position: relative; width: 46px; height: 28px; border-radius: 999px; background: #e7d9c4; transition: background .2s; }
.es-tog-ui::after { content: ""; position: absolute; left: 3px; top: 3px; width: 22px; height: 22px; border-radius: 50%; background: #fff; box-shadow: 0 2px 6px rgba(0, 0, 0, .2); transition: transform .2s; }
.es-tog input:checked + .es-tog-ui { background: #3f7d2c; }
.es-tog input:checked + .es-tog-ui::after { transform: translateX(18px); }
.es-tog input:focus-visible + .es-tog-ui { outline: 3px solid #f29d12; outline-offset: 2px; }
.es-ai { position: relative; display: grid; gap: 4px; width: 100%; margin: 0 0 18px; padding: 34px 16px 16px; text-align: left; border: 0; border-radius: 18px; overflow: hidden; cursor: pointer;
  background: linear-gradient(135deg, #fff 0%, #fff1d2 100%); box-shadow: 0 0 0 2px #e29a1b, 0 16px 30px -20px rgba(194, 24, 91, .7); color: #3d1a0f; font: inherit; }
.es-ai-art { position: absolute; left: 0; top: 0; width: 100%; height: auto; }
.es-ai-k { font: 700 12.5px/1.2 inherit; letter-spacing: .1em; text-transform: uppercase; color: #b3155a; }
.es-ai b { font: 600 21px/1.25 var(--font-wk-display, "Cormorant Garamond"), Georgia, serif; }
.es-ai small { font-size: 14px; line-height: 1.45; color: #7a5a43; }
.es-photos3 { display: grid; gap: 12px; margin-top: 8px; }
.es-photo { display: grid; grid-template-columns: 96px minmax(0, 1fr); gap: 12px; align-items: center; padding: 10px; border-radius: 16px; background: #fff; border: 1px solid rgba(179, 21, 90, .12); }
.es-photo-frame { position: relative; width: 96px; overflow: hidden; border-radius: 12px; border: 1.5px dashed rgba(179, 21, 90, .3); background: #fff6e6; padding: 0; cursor: pointer; }
.es-photo-add { position: absolute; inset: 0; display: grid; place-items: center; font-size: 26px; color: #c2185b; }
.es-photo-tx { display: grid; gap: 4px; min-width: 0; }
.es-photo-tx b { font-size: 15px; }
.es-photo-tx small { font-size: 13px; color: #8a6d55; }
.es-photo-btns { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
.es-evs, .es-list { list-style: none; margin: 0 0 12px; padding: 0; display: grid; gap: 10px; }
.es-ev { border-radius: 16px; background: #fff; border: 1px solid rgba(179, 21, 90, .14); overflow: hidden; }
.es-ev.is-open { box-shadow: 0 0 0 2px rgba(226, 154, 27, .6); }
.es-ev-head { display: flex; align-items: center; gap: 12px; width: 100%; min-height: 64px; padding: 10px 12px; border: 0; background: none; text-align: left; cursor: pointer; color: inherit; font: inherit; }
.es-ev-ic { flex: none; display: grid; place-items: center; width: 40px; height: 40px; border-radius: 12px; font-size: 19px; box-shadow: inset 0 0 0 1px rgba(0, 0, 0, .08); }
.es-ev-t { flex: 1; min-width: 0; display: grid; }
.es-ev-t b { font-size: 16px; }
.es-ev-t small { font-size: 13.5px; color: #8a6d55; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.es-ev-chev { flex: none; display: grid; place-items: center; width: 32px; height: 32px; border-radius: 50%; background: #fff1d2; color: #8c5300; font-weight: 700; }
.es-ev-body { padding: 4px 12px 14px; border-top: 1px dashed rgba(226, 154, 27, .5); }
.es-ev-tools { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px; }
.es-undo { margin: 0 0 12px; padding: 10px 12px; border-radius: 12px; background: #3d1a0f; color: #fff; font-size: 14px; }
.es-undo button { min-height: 40px; margin-left: 8px; padding: 0 12px; border: 0; border-radius: 10px; background: #f29d12; color: #3d1a0f; font-weight: 700; cursor: pointer; }
.es-quick { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.es-quick > span { font-weight: 600; color: #8a6d55; }
.es-sws { display: flex; flex-wrap: wrap; gap: 8px; margin: -4px 0 14px; }
.es-sw { position: relative; width: 40px; height: 40px; border-radius: 50%; border: 0; cursor: pointer; box-shadow: inset 0 0 0 1px rgba(0, 0, 0, .15); }
.es-sw[aria-checked=true] { box-shadow: 0 0 0 3px #fff, 0 0 0 5px #c2185b; }
.es-sw-custom { display: grid; place-items: center; background: conic-gradient(#f2c94c, #e86a92, #7b3fa0, #2e5aac, #4f9b6a, #f2c94c); }
.es-sw-custom input { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; }
.es-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
.es-phone { display: flex; gap: 8px; }
.es-phone > span { display: grid; place-items: center; padding: 0 10px; border-radius: 12px; background: #fff1d2; font-weight: 700; color: #8c5300; }
.es-thing { display: grid; grid-template-columns: 1fr auto; gap: 8px; align-items: center; }
.es-thing .es-mini { width: 44px; min-height: 44px; }
.es-themes { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.es-theme { display: grid; gap: 4px; padding: 12px; border-radius: 16px; border: 1.5px solid rgba(179, 21, 90, .14); background: #fff; text-align: left; cursor: pointer; color: inherit; font: inherit; }
.es-theme[aria-checked=true] { border-color: transparent; box-shadow: 0 0 0 3px #c2185b; }
.es-theme b { font-size: 15.5px; }
.es-theme small { font-size: 13px; color: #8a6d55; }
.es-theme-sw { display: flex; gap: 0; height: 30px; border-radius: 10px; overflow: hidden; margin-bottom: 4px; box-shadow: inset 0 0 0 1px rgba(0, 0, 0, .08); }
.es-theme-sw i { flex: 1; }
.es-music { margin-top: 18px; --vw-edge: rgba(179, 21, 90, .16); --vw-paper-ink: #3d1a0f; --vw-accent: #c2185b; --vw-accent-deep: #8f0f42; --vw-accent-ink: #fff; --vw-soft: #fff1d2; --vw-font-ui: inherit; }
.es-music .vs-label { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; margin: 0 0 6px; font-size: 14px; font-weight: 700; color: #5a3a24; }
.es-music .vs-hint { display: block; margin-top: 4px; font-size: 13px; line-height: 1.45; color: #8a6d55; }
.es-music .vs-err { margin: 4px 0 0; color: #b42318; font-weight: 600; font-size: 13px; }
.es-music .vs-input { width: 100%; min-width: 0; min-height: 48px; padding: 11px 13px; border-radius: 12px; border: 1.5px solid rgba(179, 21, 90, .18); background: #fff; color: #3d1a0f; font: 400 16px/1.4 inherit; outline: none; }
.es-music .vs-input:focus { border-color: #c2185b; box-shadow: 0 0 0 3px rgba(194, 24, 91, .12); }
.es-music .vs-input.is-bad { border-color: #d0453a; }
.es-music .vp-chip { display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-height: 44px; padding: 0 14px; border-radius: 999px; border: 1.5px solid rgba(179, 21, 90, .2); background: #fff; color: #5a3a24; font: 600 13.5px/1 inherit; cursor: pointer; }
.es-links { display: grid; gap: 8px; }
.es-url { display: block; padding: 8px 10px; border-radius: 10px; background: #fff6e6; font-size: 12.5px; overflow-wrap: anywhere; color: #6b4a1e; }
.es-row-btns { display: flex; flex-wrap: wrap; gap: 8px; }
.es-dash summary { min-height: 44px; display: flex; align-items: center; font-weight: 700; cursor: pointer; }
`;
