"use client";

// ─── Christian Wedding — Scroll Edition: the editor ─────────────────────────
//
// Eight steps, any order: Couple → Celebrations → Photos → Words → Story →
// Guest info → Look & music → RSVP & send.
// Phones: full screen; a sticky rail of step chips on top (the current one
// centred, ✓ when it has content) and a 64px bar at the bottom (Preview · Save
// · Next) that hides while the keyboard is open. Inputs are 16px (no iOS zoom)
// and ≥ 48px tall. Laptop/desktop: a docked panel on the left with the steps as
// a rail, and the live page beside it, scrolled to the section being edited.
// Destructive actions live on the item and come with a 6-second undo.

import { useCallback, useEffect, useId, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { MasonryEditor, RsvpDashboard } from "../../../_wedding";
import { compressImage } from "../../../dedication/components/mediaUploads";
import MusicPicker, { MUSIC_CSS } from "../../../_valentine/editor/MusicPicker";
import PhotoCropper, { clampCrop, cropImgStyle } from "../../../_valentine/editor/PhotoCropper";
import { CW2_SONGS } from "../../lib/music";
import type { WeddingEvent } from "../../../_wedding/types";
import { localArt } from "../../lib/art";
import { personalLink } from "../../lib/guest";
import { LIMITS, QUICK_FUNCTIONS, SECOND_LANG_LABEL, SERVICE_PRESETS, SWATCHES, VERSES, isHttps, isUpiId, mainEventOf, newEventId, normalisePhone, swatchFor, toHHMM, youtubeIdOf, type Cw2Data, type Portrait, type SecondLang } from "../../lib/model";
import type { Cw2Editor } from "../../hooks/useCw2Editor";
import { copyText } from "../Actions";

export const STEPS = [
  { id: "couple", label: "Couple", section: "c2-home" },
  { id: "events", label: "Celebrations", section: "c2-events" },
  { id: "photos", label: "Photos", section: "c2-gallery" },
  { id: "words", label: "Words", section: "c2-invitation" },
  { id: "story", label: "Story", section: "c2-story" },
  { id: "guests", label: "Guest info", section: "c2-know" },
  { id: "look", label: "Look & music", section: "c2-home" },
  { id: "send", label: "RSVP & send", section: "c2-rsvp" },
] as const;

const THEMES: { id: Cw2Data["theme"]; label: string; blurb: string; sw: [string, string, string] }[] = [
  { id: "blossom", label: "Cherry Blossom", blurb: "Blush, sage & ivory", sw: ["#fbf6f2", "#b4677a", "#4c6852"] },
  { id: "sage", label: "Sage Garden", blurb: "Sage & soft linen", sw: ["#f5f7f1", "#9a6a5e", "#3f5c46"] },
  { id: "ivory", label: "Ivory & Gold", blurb: "Ivory, gold & olive", sw: ["#fbf8f1", "#a0704a", "#b8913f"] },
];

const CROP_THEME = {
  "--vw-accent": "#4c6852",
  "--vw-accent-deep": "#34503b",
  "--vw-accent-ink": "#ffffff",
  "--vw-edge": "#ddd6c8",
  "--vw-paper": "#fffdf9",
  "--vw-paper-ink": "#2f3a32",
  "--vw-soft": "#eef2ea",
} as CSSProperties;

const isMapLink = (v: string) => {
  try {
    const u = new URL(v);
    return u.protocol === "https:" && /(^|\.)google\.[a-z.]+$|(^|\.)goo\.gl$|maps\.app\.goo\.gl$|(^|\.)apple\.com$|(^|\.)bing\.com$/i.test(u.hostname);
  } catch {
    return false;
  }
};

// ── Building blocks ─────────────────────────────────────────────────────────

function Field({ label, hint, error, children, id, count }: { label: string; hint?: ReactNode; error?: string; children: ReactNode; id?: string; count?: string }) {
  return (
    <div className="c2e-field">
      <div className="c2e-label-row">
        <label className="c2e-label" htmlFor={id}>
          {label}
        </label>
        {count && <span className="c2e-count">{count}</span>}
      </div>
      {children}
      {error ? (
        <p className="c2e-error" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="c2e-hint">{hint}</p>
      )}
    </div>
  );
}

function Card({ title, sub, children, aside }: { title: string; sub?: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="c2e-card">
      <header className="c2e-card-h">
        <div>
          <h3>{title}</h3>
          {sub && <p>{sub}</p>}
        </div>
        {aside}
      </header>
      <div className="c2e-card-b">{children}</div>
    </section>
  );
}

function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <label className="c2e-toggle">
      <span>
        <b>{label}</b>
        {hint && <small>{hint}</small>}
      </span>
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <i aria-hidden />
    </label>
  );
}

function PortraitField({ label, value, onChange, aspect = 0.8 }: { label: string; value: Portrait; onChange: (p: Portrait) => void; aspect?: number }) {
  const file = useRef<HTMLInputElement>(null);
  const [framing, setFraming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const pick = async (f: File) => {
    setBusy(true);
    setErr("");
    try {
      const url = await compressImage(f, 1400);
      onChange({ url, crop: { x: 50, y: 50, scale: 100 } });
      setFraming(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not read that photo");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="c2e-portrait">
      <div className="c2e-portrait-th" style={{ aspectRatio: String(aspect) }}>
        {value.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={localArt(value.url)} alt="" style={cropImgStyle(value.crop)} />
        ) : (
          <span aria-hidden>＋</span>
        )}
      </div>
      <div className="c2e-portrait-a">
        <b>{label}</b>
        <div className="c2e-row">
          <button type="button" className="c2e-btn is-ghost is-sm" onClick={() => file.current?.click()} disabled={busy}>
            {busy ? "Reading…" : value.url ? "Replace" : "Add photo"}
          </button>
          {value.url && (
            <button type="button" className="c2e-btn is-ghost is-sm" onClick={() => setFraming(true)}>
              ✥ Frame &amp; zoom
            </button>
          )}
          {value.url && (
            <button type="button" className="c2e-btn is-text is-sm" onClick={() => onChange({ url: "", crop: { x: 50, y: 50, scale: 100 } })} aria-label={`Remove ${label}`}>
              Remove
            </button>
          )}
        </div>
        {err && <p className="c2e-error">{err}</p>}
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
      {value.url && (
        <PhotoCropper
          open={framing}
          src={localArt(value.url)}
          crop={clampCrop(value.crop)}
          aspect={aspect}
          title={`${label}: drag to move, pinch or slide to zoom`}
          themeStyle={CROP_THEME}
          onChange={(c) => onChange({ ...value, crop: c })}
          onClose={() => setFraming(false)}
          onReplace={() => file.current?.click()}
        />
      )}
    </div>
  );
}

function ListControls({ i, n, onMove, onDup, onRemove, label }: { i: number; n: number; onMove: (to: number) => void; onDup?: () => void; onRemove: () => void; label: string }) {
  return (
    <div className="c2e-row c2e-list-ctl">
      <button type="button" className="c2e-icon" onClick={() => onMove(i - 1)} disabled={i === 0} aria-label={`Move ${label} up`}>
        ↑
      </button>
      <button type="button" className="c2e-icon" onClick={() => onMove(i + 1)} disabled={i === n - 1} aria-label={`Move ${label} down`}>
        ↓
      </button>
      {onDup && (
        <button type="button" className="c2e-btn is-ghost is-sm" onClick={onDup}>
          Duplicate
        </button>
      )}
      <button type="button" className="c2e-btn is-text is-sm is-danger" onClick={onRemove}>
        Remove
      </button>
    </div>
  );
}

const move = <T,>(list: T[], from: number, to: number): T[] => {
  if (to < 0 || to >= list.length) return list;
  const next = list.slice();
  const [x] = next.splice(from, 1);
  next.splice(to, 0, x);
  return next;
};

// ── The editor ──────────────────────────────────────────────────────────────

export default function Studio({ e, previewOpen, setPreviewOpen }: { e: Cw2Editor; previewOpen: boolean; setPreviewOpen: (v: boolean) => void }) {
  const { mf, setMf, updateMf, step, setStep } = e;
  const uid = useId().replace(/:/g, "");
  const railRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [kb, setKb] = useState(false);
  const [undo, setUndo] = useState<{ label: string; restore: Cw2Data } | null>(null);
  const [openEv, setOpenEv] = useState<number>(-1);
  const [tried, setTried] = useState(false);

  // Hide the bottom bar while the on-screen keyboard is up.
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const base = window.innerHeight;
    const on = () => setKb(base - vv.height > 150);
    vv.addEventListener("resize", on);
    return () => vv.removeEventListener("resize", on);
  }, []);

  // Keep the current chip centred and the form at its top.
  useEffect(() => {
    const chip = railRef.current?.querySelector<HTMLElement>(`[data-step="${step}"]`);
    chip?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    bodyRef.current?.scrollTo({ top: 0 });
    // Laptop: bring the edited section of the live page into view.
    if (window.innerWidth >= 1024) {
      const sec = document.getElementById(STEPS[step].section);
      sec?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [step]);

  useEffect(() => {
    if (!undo) return;
    const t = window.setTimeout(() => setUndo(null), 6000);
    return () => window.clearTimeout(t);
  }, [undo]);

  const remove = useCallback(
    (label: string, change: (d: Cw2Data) => Cw2Data) => {
      setMf((cur) => {
        setUndo({ label, restore: cur });
        return change(cur);
      });
    },
    [setMf],
  );

  const setEvent = (i: number, patch: Partial<WeddingEvent>) => updateMf("events", mf.events.map((x, k) => (k === i ? { ...x, ...patch } : x)));
  const main = mainEventOf(mf.events);
  const mainIdx = main ? mf.events.indexOf(main) : -1;

  const done = useMemo(
    () => [
      !!(mf.brideName && mf.groomName),
      mf.events.some((x) => x.date && x.venue),
      mf.gallery.length > 0,
      !!mf.invitation.trim(),
      mf.story.length > 0 || mf.order.length > 0,
      mf.contacts.length > 0 || mf.things.length > 0,
      true,
      !!e.shareUrl,
    ],
    [mf, e.shareUrl],
  );

  const namesMissing = !mf.brideName.trim() || !mf.groomName.trim();
  const saveNow = () => {
    if (namesMissing) {
      setTried(true);
      setStep(0);
      return;
    }
    void e.save();
  };

  const musicValue = { musicMode: mf.music.enabled ? (mf.music.youtubeId ? ("youtube" as const) : ("melody" as const)) : ("off" as const), musicYoutubeId: mf.music.youtubeId, musicStart: mf.music.start };

  return (
    <div className={`c2e${previewOpen ? " is-previewing" : ""}`} style={CROP_THEME} role="dialog" aria-modal="false" aria-label="Edit your invitation">
      <style>{STUDIO_CSS}</style>
      <header className="c2e-top">
        <button type="button" className="c2e-btn is-ghost is-sm" onClick={e.discard}>
          Close
        </button>
        <div className="c2e-top-t">
          <b>Your invitation</b>
          <small aria-live="polite">{e.savedStamp ? "Saved on this device" : "Changes save as you type"}</small>
        </div>
        <button type="button" className="c2e-btn is-sm" onClick={saveNow} disabled={e.saving}>
          {e.saving ? "Saving…" : "Save"}
        </button>
      </header>

      <nav className="c2e-rail" ref={railRef} aria-label="Steps">
        {STEPS.map((s, k) => (
          <button key={s.id} type="button" data-step={k} className={`c2e-chip${k === step ? " is-on" : ""}`} aria-current={k === step ? "step" : undefined} onClick={() => setStep(k)}>
            <span className="c2e-chip-n" aria-hidden>
              {done[k] && k !== step ? "✓" : k + 1}
            </span>
            {s.label}
          </button>
        ))}
      </nav>

      <div className="c2e-body" ref={bodyRef}>
        {step === 0 && (
          <>
            <button type="button" className="c2e-ai" onClick={e.openAi} disabled={!e.fill.schema}>
              <span className="c2e-ai-i" aria-hidden>
                ✦
              </span>
              <span>
                <b>Let AI write it</b>
                <small>Answer a few quick questions — it fills every step, then you check each word.</small>
              </span>
              <span aria-hidden>→</span>
            </button>
            <Card title="The couple" sub="Names exactly as guests should read them.">
              <div className="c2e-grid2">
                <Field label="Bride's first name" id={`${uid}-bn`} error={tried && !mf.brideName.trim() ? "Please add the bride's name" : undefined}>
                  <input id={`${uid}-bn`} className="c2e-input" value={mf.brideName} maxLength={40} onChange={(ev) => setMf((p) => ({ ...p, brideName: ev.target.value, bride: { ...p.bride, name: ev.target.value } }))} />
                </Field>
                <Field label="Groom's first name" id={`${uid}-gn`} error={tried && !mf.groomName.trim() ? "Please add the groom's name" : undefined}>
                  <input id={`${uid}-gn`} className="c2e-input" value={mf.groomName} maxLength={40} onChange={(ev) => setMf((p) => ({ ...p, groomName: ev.target.value, groom: { ...p.groom, name: ev.target.value } }))} />
                </Field>
              </div>
              <div className="c2e-seg" role="radiogroup" aria-label="Whose name comes first">
                {(["bride", "groom"] as const).map((o) => (
                  <button key={o} type="button" role="radio" aria-checked={mf.nameOrder === o} onClick={() => updateMf("nameOrder", o)}>
                    {(o === "bride" ? mf.brideName : mf.groomName) || (o === "bride" ? "Bride" : "Groom")} first
                  </button>
                ))}
              </div>
            </Card>
            {mainIdx >= 0 && (
              <Card title="The big day" sub={`${mf.events[mainIdx].title || "The ceremony"} — the countdown and the hero follow it.`}>
                <div className="c2e-grid2">
                  <Field label="Date" id={`${uid}-md`}>
                    <input id={`${uid}-md`} type="date" className="c2e-input" value={mf.events[mainIdx].date} onChange={(ev) => setEvent(mainIdx, { date: ev.target.value })} />
                  </Field>
                  <Field label="Starts at" id={`${uid}-mt`}>
                    <input id={`${uid}-mt`} type="time" className="c2e-input" value={mf.events[mainIdx].time} onChange={(ev) => setEvent(mainIdx, { time: ev.target.value })} />
                  </Field>
                </div>
                <Field label="Church" id={`${uid}-mv`}>
                  <input id={`${uid}-mv`} className="c2e-input" value={mf.events[mainIdx].venue} maxLength={120} onChange={(ev) => setEvent(mainIdx, { venue: ev.target.value })} />
                </Field>
              </Card>
            )}
            <Card title="Photos of you" sub="Rounded frames; drag and zoom to frame each one.">
              <PortraitField label="Couple photo (hero)" value={mf.couplePhoto} onChange={(p) => updateMf("couplePhoto", p)} />
              <PortraitField label={`${mf.brideName || "Bride"}'s portrait`} value={mf.bridePhoto} onChange={(p) => updateMf("bridePhoto", p)} />
              <PortraitField label={`${mf.groomName || "Groom"}'s portrait`} value={mf.groomPhoto} onChange={(p) => updateMf("groomPhoto", p)} />
            </Card>
            <Card title="A line about each of you">
              <Field label={`About ${mf.brideName || "the bride"}`} id={`${uid}-bd`} count={`${mf.bride.description.length}/240`}>
                <textarea id={`${uid}-bd`} className="c2e-input is-area" maxLength={240} value={mf.bride.description} onChange={(ev) => updateMf("bride", { ...mf.bride, description: ev.target.value })} />
              </Field>
              <Field label={`About ${mf.groomName || "the groom"}`} id={`${uid}-gd`} count={`${mf.groom.description.length}/240`}>
                <textarea id={`${uid}-gd`} className="c2e-input is-area" maxLength={240} value={mf.groom.description} onChange={(ev) => updateMf("groom", { ...mf.groom, description: ev.target.value })} />
              </Field>
            </Card>
          </>
        )}

        {step === 1 && (
          <>
            <Card title="Celebrations" sub={`${mf.events.length} of ${LIMITS.events}. Tap one to edit. Guests RSVP to each.`}>
              <div className="c2e-chips" aria-label="Quick add">
                {QUICK_FUNCTIONS.filter((q) => !mf.events.some((x) => x.title === q.title)).map((q) => (
                  <button
                    key={q.title}
                    type="button"
                    className="c2e-qchip"
                    disabled={mf.events.length >= LIMITS.events}
                    onClick={() => {
                      const ev: WeddingEvent = { id: newEventId(mf.events.map((x) => x.id)), title: q.title, date: main?.date ?? "", time: q.time, endTime: "", venue: "", address: "", mapUrl: "", dressCode: q.dress, dressColor: q.color, note: "" };
                      updateMf("events", [...mf.events, ev]);
                      setOpenEv(mf.events.length);
                    }}
                  >
                    + {q.title}
                  </button>
                ))}
              </div>
              <ul className="c2e-evs">
                {mf.events.map((ev, i) => {
                  const isOpen = openEv === i;
                  const mapBad = !!ev.mapUrl && !isMapLink(ev.mapUrl);
                  return (
                    <li key={ev.id} className={`c2e-ev${isOpen ? " is-open" : ""}`}>
                      <button type="button" className="c2e-ev-sum" onClick={() => setOpenEv(isOpen ? -1 : i)} aria-expanded={isOpen}>
                        <span className="c2e-ev-dot" style={{ background: swatchFor(ev) || "#cfd8cc" }} aria-hidden />
                        <span className="c2e-ev-sum-t">
                          <b>{ev.title || "Untitled"}</b>
                          <small>{[ev.date ? new Date(`${ev.date}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "No date", ev.venue || "No venue"].join(" · ")}</small>
                        </span>
                        <span aria-hidden>{isOpen ? "▴" : "▾"}</span>
                      </button>
                      {isOpen && (
                        <div className="c2e-ev-b">
                          <Field label="Name" id={`${uid}-et${i}`}>
                            <input id={`${uid}-et${i}`} className="c2e-input" maxLength={60} value={ev.title} onChange={(x) => setEvent(i, { title: x.target.value })} />
                          </Field>
                          <div className="c2e-grid3">
                            <Field label="Date" id={`${uid}-ed${i}`}>
                              <input id={`${uid}-ed${i}`} type="date" className="c2e-input" value={ev.date} onChange={(x) => setEvent(i, { date: x.target.value })} />
                            </Field>
                            <Field label="Starts" id={`${uid}-es${i}`}>
                              <input id={`${uid}-es${i}`} type="time" className="c2e-input" value={ev.time} onChange={(x) => setEvent(i, { time: toHHMM(x.target.value) || x.target.value })} />
                            </Field>
                            <Field label="Ends" id={`${uid}-ee${i}`}>
                              <input id={`${uid}-ee${i}`} type="time" className="c2e-input" value={ev.endTime ?? ""} onChange={(x) => setEvent(i, { endTime: x.target.value })} />
                            </Field>
                          </div>
                          <Field label="Venue" id={`${uid}-ev${i}`}>
                            <input id={`${uid}-ev${i}`} className="c2e-input" maxLength={120} value={ev.venue} onChange={(x) => setEvent(i, { venue: x.target.value })} placeholder="St. Mary's Basilica" />
                          </Field>
                          <Field label="Address" id={`${uid}-ea${i}`}>
                            <input id={`${uid}-ea${i}`} className="c2e-input" maxLength={200} value={ev.address ?? ""} onChange={(x) => setEvent(i, { address: x.target.value })} placeholder="Ernakulam, Kochi, Kerala" />
                          </Field>
                          <Field label="Google Maps link" id={`${uid}-em${i}`} hint="Optional — paste the Share link from Google Maps. Without it, directions search the venue." error={mapBad ? "That isn't a maps link (it should start with https://maps.app.goo.gl or https://www.google.com/maps)" : undefined}>
                            <input id={`${uid}-em${i}`} className="c2e-input" inputMode="url" value={ev.mapUrl ?? ""} onChange={(x) => setEvent(i, { mapUrl: x.target.value.trim() })} placeholder="https://maps.app.goo.gl/…" />
                          </Field>
                          <Field label="Dress code" id={`${uid}-ec${i}`}>
                            <input id={`${uid}-ec${i}`} className="c2e-input" maxLength={60} value={ev.dressCode ?? ""} onChange={(x) => setEvent(i, { dressCode: x.target.value })} placeholder="Formal, soft pastels" />
                          </Field>
                          <div className="c2e-swatches" role="radiogroup" aria-label="Dress colour">
                            {SWATCHES.map((c) => (
                              <button key={c} type="button" role="radio" aria-checked={ev.dressColor === c} aria-label={`Colour ${c}`} className="c2e-sw" style={{ background: c }} onClick={() => setEvent(i, { dressColor: ev.dressColor === c ? "" : c })} />
                            ))}
                            <label className="c2e-sw is-custom" aria-label="Custom colour">
                              <input type="color" value={ev.dressColor || "#e8a5b5"} onChange={(x) => setEvent(i, { dressColor: x.target.value })} />
                            </label>
                          </div>
                          <Field label="Note for guests" id={`${uid}-en${i}`} count={`${(ev.note ?? "").length}/400`}>
                            <textarea id={`${uid}-en${i}`} className="c2e-input is-area" maxLength={400} value={ev.note ?? ""} onChange={(x) => setEvent(i, { note: x.target.value })} placeholder="Please be seated by 3:15 pm." />
                          </Field>
                          <ListControls
                            i={i}
                            n={mf.events.length}
                            label={ev.title}
                            onMove={(to) => {
                              updateMf("events", move(mf.events, i, to));
                              setOpenEv(to);
                            }}
                            onDup={
                              mf.events.length < LIMITS.events
                                ? () => {
                                    const copy = { ...ev, id: newEventId(mf.events.map((x) => x.id)), title: `${ev.title} (copy)` };
                                    const next = mf.events.slice();
                                    next.splice(i + 1, 0, copy);
                                    updateMf("events", next);
                                    setOpenEv(i + 1);
                                  }
                                : undefined
                            }
                            onRemove={() => {
                              remove(`${ev.title || "Celebration"} removed`, (d) => ({ ...d, events: d.events.filter((_, k) => k !== i) }));
                              setOpenEv(-1);
                            }}
                          />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
              {mf.events.length >= LIMITS.events && <p className="c2e-hint">That&apos;s the most this invitation holds — eight celebrations.</p>}
            </Card>
          </>
        )}

        {step === 2 && (
          <Card title="Gallery" sub={`${mf.gallery.length} of ${LIMITS.gallery}. Tap a photo for size, framing, zoom and caption; drag ⠿ to reorder.`}>
            <MasonryEditor photos={mf.gallery.map((p) => ({ ...p, url: localArt(p.url) }))} onChange={(p) => updateMf("gallery", p)} max={LIMITS.gallery} mask="rounded" title="" hint="The sample photos are just for the demo — swap in yours." />
          </Card>
        )}

        {step === 3 && (
          <>
            <Card title="The invitation" sub="Two short paragraphs read best. Dates and places show below it automatically.">
              <Field label="Invitation" id={`${uid}-inv`} count={`${mf.invitation.length}/1500`}>
                <textarea id={`${uid}-inv`} className="c2e-input is-area is-tall" maxLength={1500} value={mf.invitation} onChange={(x) => updateMf("invitation", x.target.value)} />
              </Field>
            </Card>
            <Card title="A verse" sub="Pick one, or write your own.">
              <div className="c2e-verses" role="radiogroup" aria-label="Bible verse">
                {VERSES.map((v) => (
                  <button key={v.ref} type="button" role="radio" aria-checked={mf.scripture.ref === v.ref} className="c2e-verse" onClick={() => updateMf("scripture", { ...v })}>
                    <b>{v.ref}</b>
                    <span>{v.text}</span>
                  </button>
                ))}
                <button type="button" role="radio" aria-checked={!mf.scripture.text} className="c2e-verse" onClick={() => updateMf("scripture", { text: "", ref: "" })}>
                  <b>No verse</b>
                  <span>Hide this section</span>
                </button>
              </div>
              <Field label="Verse text" id={`${uid}-vt`} count={`${mf.scripture.text.length}/400`}>
                <textarea id={`${uid}-vt`} className="c2e-input is-area" maxLength={400} value={mf.scripture.text} onChange={(x) => updateMf("scripture", { ...mf.scripture, text: x.target.value })} />
              </Field>
              <Field label="Reference" id={`${uid}-vr`}>
                <input id={`${uid}-vr`} className="c2e-input" maxLength={60} value={mf.scripture.ref} onChange={(x) => updateMf("scripture", { ...mf.scripture, ref: x.target.value })} placeholder="1 Corinthians 13:4–7" />
              </Field>
            </Card>
            <Card title="A second language" sub="Shown under the English for grandparents. Please have a native speaker check it.">
              <div className="c2e-seg is-4" role="radiogroup" aria-label="Second language">
                {(Object.keys(SECOND_LANG_LABEL) as SecondLang[]).map((l) => (
                  <button key={l} type="button" role="radio" aria-checked={mf.secondLang === l} onClick={() => updateMf("secondLang", l)}>
                    {SECOND_LANG_LABEL[l]}
                  </button>
                ))}
              </div>
              {mf.secondLang !== "none" && (
                <>
                  <Field label="Invitation in that language" id={`${uid}-ai`}>
                    <textarea id={`${uid}-ai`} lang={mf.secondLang} className="c2e-input is-area is-tall" maxLength={1200} value={mf.altInvitation} onChange={(x) => updateMf("altInvitation", x.target.value)} />
                  </Field>
                  <Field label="Verse in that language" id={`${uid}-av`}>
                    <textarea id={`${uid}-av`} lang={mf.secondLang} className="c2e-input is-area" maxLength={400} value={mf.altVerse} onChange={(x) => updateMf("altVerse", x.target.value)} />
                  </Field>
                </>
              )}
            </Card>
            <Card title="Families">
              <div className="c2e-grid2">
                <Field label={`${mf.brideName || "Bride"}'s parents`} id={`${uid}-bp`}>
                  <input id={`${uid}-bp`} className="c2e-input" maxLength={200} value={mf.brideFamily.parents} onChange={(x) => updateMf("brideFamily", { ...mf.brideFamily, parents: x.target.value })} />
                </Field>
                <Field label={`${mf.groomName || "Groom"}'s parents`} id={`${uid}-gp`}>
                  <input id={`${uid}-gp`} className="c2e-input" maxLength={200} value={mf.groomFamily.parents} onChange={(x) => updateMf("groomFamily", { ...mf.groomFamily, parents: x.target.value })} />
                </Field>
                <Field label="Bride's grandparents" id={`${uid}-bg`}>
                  <input id={`${uid}-bg`} className="c2e-input" maxLength={200} value={mf.brideFamily.grandparents} onChange={(x) => updateMf("brideFamily", { ...mf.brideFamily, grandparents: x.target.value })} />
                </Field>
                <Field label="Groom's grandparents" id={`${uid}-gg`}>
                  <input id={`${uid}-gg`} className="c2e-input" maxLength={200} value={mf.groomFamily.grandparents} onChange={(x) => updateMf("groomFamily", { ...mf.groomFamily, grandparents: x.target.value })} />
                </Field>
              </div>
              <Field label="With the blessings of" id={`${uid}-bo`} hint="Optional — e.g. your parish or godparents.">
                <input id={`${uid}-bo`} className="c2e-input" maxLength={200} value={mf.blessingsOf} onChange={(x) => updateMf("blessingsOf", x.target.value)} />
              </Field>
            </Card>
            <Card title="The last word">
              <Field label="Closing line" id={`${uid}-cl`}>
                <input id={`${uid}-cl`} className="c2e-input" maxLength={160} value={mf.closing} onChange={(x) => updateMf("closing", x.target.value)} placeholder="With love and prayers, the Kurian & Varghese families" />
              </Field>
              <Field label="Wedding hashtag" id={`${uid}-ht`}>
                <input id={`${uid}-ht`} className="c2e-input" maxLength={40} value={mf.hashtag} onChange={(x) => updateMf("hashtag", x.target.value.replace(/\s+/g, ""))} placeholder="#AnnaWedsJoel" />
              </Field>
            </Card>
          </>
        )}

        {step === 4 && (
          <>
            <Card title="Our story" sub={`${mf.story.length} of ${LIMITS.story} chapters. Hidden when empty.`}>
              {mf.story.map((c, i) => (
                <div key={i} className="c2e-sub">
                  <div className="c2e-grid2">
                    <Field label="When" id={`${uid}-sw${i}`}>
                      <input id={`${uid}-sw${i}`} className="c2e-input" maxLength={40} value={c.when} onChange={(x) => updateMf("story", mf.story.map((y, k) => (k === i ? { ...y, when: x.target.value } : y)))} placeholder="2019" />
                    </Field>
                    <Field label="Title" id={`${uid}-st${i}`}>
                      <input id={`${uid}-st${i}`} className="c2e-input" maxLength={80} value={c.title} onChange={(x) => updateMf("story", mf.story.map((y, k) => (k === i ? { ...y, title: x.target.value } : y)))} />
                    </Field>
                  </div>
                  <Field label="What happened" id={`${uid}-sl${i}`} count={`${c.line.length}/400`}>
                    <textarea id={`${uid}-sl${i}`} className="c2e-input is-area" maxLength={400} value={c.line} onChange={(x) => updateMf("story", mf.story.map((y, k) => (k === i ? { ...y, line: x.target.value } : y)))} />
                  </Field>
                  <PortraitField label="Chapter photo" aspect={1.5} value={{ url: c.photo, crop: c.crop }} onChange={(p) => updateMf("story", mf.story.map((y, k) => (k === i ? { ...y, photo: p.url, crop: p.crop } : y)))} />
                  <ListControls i={i} n={mf.story.length} label={c.title || `chapter ${i + 1}`} onMove={(to) => updateMf("story", move(mf.story, i, to))} onRemove={() => remove("Chapter removed", (d) => ({ ...d, story: d.story.filter((_, k) => k !== i) }))} />
                </div>
              ))}
              {mf.story.length < LIMITS.story && (
                <button type="button" className="c2e-btn is-ghost" onClick={() => updateMf("story", [...mf.story, { when: "", title: "", line: "", photo: "", crop: { x: 50, y: 50, scale: 100 } }])}>
                  + Add a chapter
                </button>
              )}
            </Card>
            <Card title="Order of service" sub="The ceremony, step by step. Optional." aside={mf.order.length === 0 ? <button type="button" className="c2e-btn is-ghost is-sm" onClick={() => updateMf("order", SERVICE_PRESETS.map((x) => ({ ...x, time: "" })))}>Use a template</button> : undefined}>
              {mf.order.map((o, i) => (
                <div key={i} className="c2e-sub c2e-oos">
                  <div className="c2e-grid-oos">
                    <Field label="Time" id={`${uid}-ot${i}`}>
                      <input id={`${uid}-ot${i}`} type="time" className="c2e-input" value={/^\d{2}:\d{2}$/.test(o.time) ? o.time : ""} onChange={(x) => updateMf("order", mf.order.map((y, k) => (k === i ? { ...y, time: x.target.value } : y)))} />
                    </Field>
                    <Field label="Moment" id={`${uid}-on${i}`}>
                      <input id={`${uid}-on${i}`} className="c2e-input" maxLength={60} value={o.title} onChange={(x) => updateMf("order", mf.order.map((y, k) => (k === i ? { ...y, title: x.target.value } : y)))} />
                    </Field>
                  </div>
                  <Field label="Note" id={`${uid}-oo${i}`}>
                    <input id={`${uid}-oo${i}`} className="c2e-input" maxLength={160} value={o.note} onChange={(x) => updateMf("order", mf.order.map((y, k) => (k === i ? { ...y, note: x.target.value } : y)))} />
                  </Field>
                  <ListControls i={i} n={mf.order.length} label={o.title || `moment ${i + 1}`} onMove={(to) => updateMf("order", move(mf.order, i, to))} onRemove={() => remove("Moment removed", (d) => ({ ...d, order: d.order.filter((_, k) => k !== i) }))} />
                </div>
              ))}
              {mf.order.length < LIMITS.order && (
                <button type="button" className="c2e-btn is-ghost" onClick={() => updateMf("order", [...mf.order, { time: "", title: "", note: "" }])}>
                  + Add a moment
                </button>
              )}
            </Card>
          </>
        )}

        {step === 5 && (
          <>
            <Card title="People to call" sub={`${mf.contacts.length} of ${LIMITS.contacts}. Guests get call and WhatsApp buttons.`}>
              {mf.contacts.map((c, i) => {
                const bad = !!c.phone && !normalisePhone(c.phone);
                return (
                  <div key={i} className="c2e-sub">
                    <div className="c2e-grid2">
                      <Field label="Name" id={`${uid}-cn${i}`}>
                        <input id={`${uid}-cn${i}`} className="c2e-input" maxLength={40} value={c.name} onChange={(x) => updateMf("contacts", mf.contacts.map((y, k) => (k === i ? { ...y, name: x.target.value } : y)))} />
                      </Field>
                      <Field label="Relation" id={`${uid}-cr${i}`}>
                        <input id={`${uid}-cr${i}`} className="c2e-input" maxLength={40} value={c.relation} onChange={(x) => updateMf("contacts", mf.contacts.map((y, k) => (k === i ? { ...y, relation: x.target.value } : y)))} placeholder="Anna's brother" />
                      </Field>
                    </div>
                    <Field label="Phone" id={`${uid}-cp${i}`} error={bad ? "10 digits, or +country code for numbers abroad" : undefined}>
                      <div className="c2e-phone">
                        <span aria-hidden>+91</span>
                        <input id={`${uid}-cp${i}`} type="tel" inputMode="tel" className="c2e-input" maxLength={20} value={c.phone} onChange={(x) => updateMf("contacts", mf.contacts.map((y, k) => (k === i ? { ...y, phone: x.target.value } : y)))} aria-invalid={bad} />
                      </div>
                    </Field>
                    <ListControls i={i} n={mf.contacts.length} label={c.name || "contact"} onMove={(to) => updateMf("contacts", move(mf.contacts, i, to))} onRemove={() => remove("Contact removed", (d) => ({ ...d, contacts: d.contacts.filter((_, k) => k !== i) }))} />
                  </div>
                );
              })}
              {mf.contacts.length < LIMITS.contacts && (
                <button type="button" className="c2e-btn is-ghost" onClick={() => updateMf("contacts", [...mf.contacts, { name: "", relation: "", phone: "" }])}>
                  + Add a person
                </button>
              )}
            </Card>
            <Card title="Good to know" sub={`${mf.things.length} of ${LIMITS.things}. Parking, children, stay…`}>
              {mf.things.map((t, i) => (
                <div key={i} className="c2e-sub">
                  <Field label="Heading" id={`${uid}-th${i}`}>
                    <input id={`${uid}-th${i}`} className="c2e-input" maxLength={40} value={t.head} onChange={(x) => updateMf("things", mf.things.map((y, k) => (k === i ? { ...y, head: x.target.value } : y)))} placeholder="Parking" />
                  </Field>
                  <Field label="Details" id={`${uid}-tt${i}`}>
                    <textarea id={`${uid}-tt${i}`} className="c2e-input is-area" maxLength={300} value={t.text} onChange={(x) => updateMf("things", mf.things.map((y, k) => (k === i ? { ...y, text: x.target.value } : y)))} />
                  </Field>
                  <ListControls i={i} n={mf.things.length} label={t.head || "note"} onMove={(to) => updateMf("things", move(mf.things, i, to))} onRemove={() => remove("Note removed", (d) => ({ ...d, things: d.things.filter((_, k) => k !== i) }))} />
                </div>
              ))}
              {mf.things.length < LIMITS.things && (
                <button type="button" className="c2e-btn is-ghost" onClick={() => updateMf("things", [...mf.things, { head: "", text: "" }])}>
                  + Add a note
                </button>
              )}
              <Field label="Getting there & where to stay" id={`${uid}-gt`} count={`${mf.gettingThere.length}/1000`}>
                <textarea id={`${uid}-gt`} className="c2e-input is-area" maxLength={1000} value={mf.gettingThere} onChange={(x) => updateMf("gettingThere", x.target.value)} />
              </Field>
            </Card>
            <Card title="Live stream & film">
              <Field label="Live stream link" id={`${uid}-lv`} hint="YouTube Live, Zoom… The button goes live 30 minutes before the ceremony." error={mf.liveUrl && !isHttps(mf.liveUrl) ? "Paste the full link, starting with https://" : undefined}>
                <input id={`${uid}-lv`} className="c2e-input" inputMode="url" value={mf.liveUrl} onChange={(x) => updateMf("liveUrl", x.target.value.trim())} placeholder="https://youtube.com/live/…" />
              </Field>
              <Field label="Pre-wedding film (YouTube)" id={`${uid}-vd`} error={mf.videoUrl && !youtubeIdOf(mf.videoUrl) ? "That isn't a YouTube link" : undefined}>
                <input id={`${uid}-vd`} className="c2e-input" inputMode="url" value={mf.videoUrl} onChange={(x) => updateMf("videoUrl", x.target.value.trim())} placeholder="https://youtu.be/…" />
              </Field>
            </Card>
            <Card title="Gift (UPI)" sub="Optional and off by default. Paid straight to you — we never handle money.">
              <Field label="UPI ID" id={`${uid}-up`} error={mf.upiId && !isUpiId(mf.upiId) ? "A UPI ID looks like name@bank" : undefined}>
                <input id={`${uid}-up`} className="c2e-input" value={mf.upiId} maxLength={100} onChange={(x) => updateMf("upiId", x.target.value.trim())} placeholder="anna.joel@okicici" />
              </Field>
              <Field label="Name on the account" id={`${uid}-un`}>
                <input id={`${uid}-un`} className="c2e-input" value={mf.upiName} maxLength={60} onChange={(x) => updateMf("upiName", x.target.value)} />
              </Field>
            </Card>
          </>
        )}

        {step === 6 && (
          <>
            <Card title="Palette" sub="All light, all garden.">
              <div className="c2e-themes" role="radiogroup" aria-label="Palette">
                {THEMES.map((t) => (
                  <button key={t.id} type="button" role="radio" aria-checked={mf.theme === t.id} className="c2e-theme" onClick={() => updateMf("theme", t.id)} style={{ background: t.sw[0] }}>
                    <span className="c2e-theme-sw" aria-hidden>
                      {t.sw.map((c) => (
                        <i key={c} style={{ background: c }} />
                      ))}
                    </span>
                    <b>{t.label}</b>
                    <small>{t.blurb}</small>
                  </button>
                ))}
              </div>
            </Card>
            <Card title="Music" sub="Plays after the guest opens the windows. Pick a song or paste any YouTube link.">
              <div className="c2e-music" style={{ ...CROP_THEME, ["--vw-font-ui" as string]: "inherit" }}>
              <MusicPicker
                value={musicValue}
                suggestions={CW2_SONGS}
                suggestionsNote="Wedding favourites · or paste any YouTube link"
                audioOnly
                onChange={(p) => {
                  const mode = p.musicMode ?? musicValue.musicMode;
                  updateMf("music", {
                    enabled: mode !== "off",
                    youtubeId: mode === "youtube" ? (p.musicYoutubeId ?? mf.music.youtubeId) : mode === "melody" ? "" : mf.music.youtubeId,
                    start: p.musicStart ?? mf.music.start,
                  });
                }}
              />
              </div>
            </Card>
            <Card title="Replay the opening">
              <button type="button" className="c2e-btn is-ghost" onClick={() => { e.setReplayKey((k) => k + 1); setPreviewOpen(true); }}>
                ▶ Watch the windows open
              </button>
            </Card>
          </>
        )}

        {step === 7 && (
          <>
            <Card title="RSVP">
              <Toggle checked={mf.rsvpOn} onChange={(v) => updateMf("rsvpOn", v)} label="Ask guests to RSVP" hint="Per celebration; replies reach your email and the list below." />
              {mf.rsvpOn && (
                <>
                  <div className="c2e-grid2">
                    <Field label="Reply by" id={`${uid}-rb`}>
                      <input id={`${uid}-rb`} type="date" className="c2e-input" value={mf.rsvpBy} onChange={(x) => updateMf("rsvpBy", x.target.value)} />
                    </Field>
                    <Field label="Most guests per reply" id={`${uid}-mg`}>
                      <select id={`${uid}-mg`} className="c2e-input" value={mf.maxGuests} onChange={(x) => updateMf("maxGuests", Number(x.target.value))}>
                        {Array.from({ length: 10 }, (_, k) => k + 1).map((k) => (
                          <option key={k} value={k}>
                            {k}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  <Toggle checked={mf.rsvpMeal} onChange={(v) => updateMf("rsvpMeal", v)} label="Ask for meal preference" />
                </>
              )}
            </Card>
            <Card title="Password" sub="Optional. Guests type it once to open the page.">
              <Field label="Page password" id={`${uid}-pw`}>
                <input id={`${uid}-pw`} className="c2e-input" value={e.password} maxLength={60} autoComplete="off" onChange={(x) => e.setPassword(x.target.value)} placeholder="Leave empty for an open link" />
              </Field>
            </Card>
            {e.shareUrl ? (
              <>
                <PersonalLink url={e.shareUrl} couple={`${mf.brideName} & ${mf.groomName}`} />
                {e.pageId && (
                  <Card title="Who's coming">
                    <RsvpDashboard slug="christian-wedding-2" pageId={e.pageId} token={e.token} csvName={`${mf.brideName}-${mf.groomName}`} />
                  </Card>
                )}
              </>
            ) : (
              <Card title="Send it" sub="Save, look through the preview, then Publish. Personal links for each family and your RSVP list appear here after publishing.">
                <button type="button" className="c2e-btn" onClick={saveNow}>
                  Save &amp; preview
                </button>
              </Card>
            )}
          </>
        )}
        <div className="c2e-pad" aria-hidden />
      </div>

      <footer className={`c2e-bar${kb ? " is-hidden" : ""}`}>
        <button type="button" className="c2e-btn is-ghost" onClick={() => setPreviewOpen(true)}>
          Preview
        </button>
        <button type="button" className="c2e-btn is-ghost" onClick={saveNow} disabled={e.saving}>
          Save
        </button>
        {step < STEPS.length - 1 ? (
          <button type="button" className="c2e-btn" onClick={() => setStep(step + 1)} aria-label={`Next step: ${STEPS[step + 1].label}`}>
            {STEPS[step + 1].label} →
          </button>
        ) : (
          <button type="button" className="c2e-btn" onClick={saveNow}>
            Done
          </button>
        )}
      </footer>

      {undo && (
        <div className="c2e-undo" role="status">
          <span>{undo.label}</span>
          <button
            type="button"
            onClick={() => {
              setMf(undo.restore);
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

function PersonalLink({ url, couple }: { url: string; couple: string }) {
  const [name, setName] = useState("");
  const [copied, setCopied] = useState(false);
  const link = personalLink(url, name);
  return (
    <Card title="Personal links" sub="Type a family's name: their invitation greets them by name and fills their RSVP.">
      <Field label="Guest or family" id="c2e-pl">
        <input id="c2e-pl" className="c2e-input" value={name} maxLength={40} onChange={(x) => setName(x.target.value)} placeholder="The Mathew family" />
      </Field>
      <p className="c2e-link">{link}</p>
      <div className="c2e-row">
        <button
          type="button"
          className="c2e-btn is-ghost is-sm"
          onClick={() =>
            void copyText(link).then((ok) => {
              setCopied(ok);
              window.setTimeout(() => setCopied(false), 1800);
            })
          }
        >
          {copied ? "Copied ✓" : "Copy link"}
        </button>
        <a className="c2e-btn is-sm" href={`https://wa.me/?text=${encodeURIComponent(`${name ? `Dear ${name}, ` : ""}${couple} invite you to their wedding 💐\n${link}`)}`} target="_blank" rel="noopener noreferrer">
          Send on WhatsApp
        </a>
      </div>
    </Card>
  );
}

const STUDIO_CSS = `
.c2e { position:fixed; inset:0; z-index:250; display:flex; flex-direction:column; background:#fbf8f3; color:#2f3a32;
  font-family:var(--wk-font-sans, "DM Sans", system-ui, sans-serif); padding-top:env(safe-area-inset-top,0px); }
.c2e.is-previewing { display:none; }
.c2e *, .c2e *::before, .c2e *::after { box-sizing:border-box; }
.c2e-top { display:flex; align-items:center; gap:10px; padding:10px 14px; border-bottom:1px solid #ebe5d9; background:#fbf8f3; }
.c2e-top-t { flex:1; min-width:0; display:grid; text-align:center; }
.c2e-top-t b { font-family:var(--wk-font-display, Georgia, serif); font-size:20px; font-weight:600; }
.c2e-top-t small { font-size:12.5px; color:#6e756d; }
.c2e-rail { display:flex; gap:8px; overflow-x:auto; padding:10px 14px; scrollbar-width:none; border-bottom:1px solid #ebe5d9; background:#f6f2ea; scroll-snap-type:x proximity; }
.c2e-rail::-webkit-scrollbar { display:none; }
.c2e-chip { flex:none; display:inline-flex; align-items:center; gap:8px; min-height:44px; padding:6px 14px 6px 6px; border-radius:999px; border:1.5px solid #ddd6c8; background:#fff; font:600 14px inherit; font-family:inherit; color:#2f3a32; cursor:pointer; scroll-snap-align:center; }
.c2e-chip-n { width:30px; height:30px; border-radius:50%; display:grid; place-items:center; background:#eef2ea; color:#4c6852; font-size:13px; }
.c2e-chip.is-on { background:#4c6852; border-color:#4c6852; color:#fff; }
.c2e-chip.is-on .c2e-chip-n { background:rgba(255,255,255,.2); color:#fff; }
.c2e-body { flex:1; min-height:0; overflow:auto; padding:16px 14px 0; display:grid; grid-auto-rows:max-content; gap:16px; align-content:start; overscroll-behavior:contain; scroll-padding-bottom:110px; }
.c2e-pad { height:calc(96px + env(safe-area-inset-bottom,0px)); }
.c2e-card { background:#fff; border:1px solid #ebe5d9; border-radius:20px; overflow:hidden; }
.c2e-card-h { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; padding:16px 16px 6px; }
.c2e-card-h h3 { margin:0; font-family:var(--wk-font-display, Georgia, serif); font-size:23px; font-weight:600; }
.c2e-card-h p { margin:3px 0 0; font-size:14px; color:#6e756d; line-height:1.45; }
.c2e-card-b { padding:10px 16px 18px; display:grid; gap:14px; }
.c2e-field { display:grid; gap:6px; min-width:0; }
.c2e-label-row { display:flex; justify-content:space-between; gap:8px; align-items:baseline; }
.c2e-label { font-size:14.5px; font-weight:600; }
.c2e-count { font-size:12px; color:#8a8f86; }
.c2e-hint { margin:0; font-size:13px; color:#6e756d; line-height:1.45; }
.c2e-error { margin:0; font-size:13.5px; color:#a8323f; }
.c2e-input { width:100%; min-height:50px; border-radius:14px; border:1.5px solid #ddd6c8; background:#fffdf9; padding:12px 14px; font:16px/1.4 inherit; font-family:inherit; color:#2f3a32; scroll-margin-bottom:120px; }
.c2e-input:focus { outline:none; border-color:#7f9a83; box-shadow:0 0 0 4px rgba(127,154,131,.2); background:#fff; }
.c2e-input[aria-invalid="true"] { border-color:#c0505f; }
.c2e-input.is-area { min-height:100px; resize:vertical; }
.c2e-input.is-tall { min-height:190px; }
select.c2e-input { appearance:auto; }
.c2e-grid2, .c2e-grid3, .c2e-grid-oos { display:grid; gap:12px; }
.c2e-grid3 { grid-template-columns:1fr 1fr; }
.c2e-grid3 > :first-child { grid-column:1 / -1; }
.c2e-grid-oos { grid-template-columns:132px 1fr; }
@media (min-width: 520px) { .c2e-grid2 { grid-template-columns:1fr 1fr; } .c2e-grid3 { grid-template-columns:1.4fr 1fr 1fr; } .c2e-grid3 > :first-child { grid-column:auto; } }
.c2e-row { display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
.c2e-btn { display:inline-flex; align-items:center; justify-content:center; gap:6px; min-height:48px; padding:10px 18px; border-radius:999px; border:1.5px solid transparent;
  background:linear-gradient(135deg, #4c6852, #7f9a83); color:#fff; font:700 15px inherit; font-family:inherit; cursor:pointer; text-decoration:none; white-space:nowrap; }
.c2e-btn.is-ghost { background:#fff; color:#4c6852; border-color:#d7dfd5; }
.c2e-btn.is-text { background:none; color:#4c6852; border-color:transparent; text-decoration:underline; text-underline-offset:3px; padding:8px 10px; }
.c2e-btn.is-danger { color:#a8323f; }
.c2e-btn.is-sm { min-height:44px; padding:8px 14px; font-size:14px; }
.c2e-btn[disabled] { opacity:.5; cursor:default; }
.c2e-icon { width:44px; height:44px; border-radius:12px; border:1.5px solid #ddd6c8; background:#fff; font-size:18px; cursor:pointer; color:#4c6852; }
.c2e-icon[disabled] { opacity:.35; }
.c2e-ai { display:flex; align-items:center; gap:14px; width:100%; text-align:left; min-height:76px; padding:14px 16px; border-radius:20px; border:0; cursor:pointer;
  background:linear-gradient(135deg, #4c6852, #7f9a83 60%, #b4677a); color:#fff; font-family:inherit; box-shadow:0 16px 30px -18px rgba(60,90,66,.8); }
.c2e-ai b { display:block; font-size:17px; }
.c2e-ai small { display:block; font-size:13.5px; opacity:.88; margin-top:2px; line-height:1.4; }
.c2e-ai > span:nth-child(2) { flex:1; }
.c2e-ai-i { width:44px; height:44px; border-radius:50%; background:rgba(255,255,255,.18); display:grid; place-items:center; font-size:20px; flex:none; }
.c2e-seg { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
.c2e-seg.is-4 { grid-template-columns:1fr 1fr; }
.c2e-seg button, .c2e-qchip { min-height:46px; border-radius:14px; border:1.5px solid #ddd6c8; background:#fff; font:600 14.5px inherit; font-family:inherit; color:#2f3a32; padding:8px 12px; cursor:pointer; }
.c2e-seg button[aria-checked="true"] { background:#4c6852; color:#fff; border-color:#4c6852; }
.c2e-chips { display:flex; flex-wrap:wrap; gap:8px; }
.c2e-qchip { border-radius:999px; min-height:44px; }
.c2e-evs { list-style:none; margin:0; padding:0; display:grid; gap:10px; }
.c2e-ev { border:1.5px solid #ebe5d9; border-radius:16px; background:#fffdf9; overflow:hidden; }
.c2e-ev.is-open { border-color:#9db59a; }
.c2e-ev-sum { width:100%; display:flex; align-items:center; gap:12px; min-height:60px; padding:10px 14px; background:none; border:0; text-align:left; font-family:inherit; cursor:pointer; color:inherit; }
.c2e-ev-dot { width:14px; height:14px; border-radius:50%; flex:none; border:1px solid rgba(0,0,0,.1); }
.c2e-ev-sum-t { flex:1; min-width:0; display:grid; }
.c2e-ev-sum-t b { font-size:16px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.c2e-ev-sum-t small { font-size:13.5px; color:#6e756d; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.c2e-ev-b { padding:4px 14px 16px; display:grid; gap:14px; }
.c2e-list-ctl { padding-top:4px; border-top:1px dashed #ebe5d9; }
.c2e-swatches { display:flex; flex-wrap:wrap; gap:8px; }
.c2e-sw { width:44px; height:44px; border-radius:50%; border:2px solid #fff; box-shadow:0 0 0 1.5px #ddd6c8; cursor:pointer; position:relative; overflow:hidden; }
.c2e-sw[aria-checked="true"] { box-shadow:0 0 0 3px #4c6852; }
.c2e-sw.is-custom { background:conic-gradient(#e8a5b5, #c2a165, #9db59a, #a9c6dd, #b9a3d1, #e8a5b5); }
.c2e-sw.is-custom input { position:absolute; inset:0; opacity:0; cursor:pointer; }
.c2e-portrait { display:flex; gap:14px; align-items:center; }
.c2e-portrait-th { position:relative; width:84px; flex:none; border-radius:14px; overflow:hidden; background:#f2ece4; display:grid; place-items:center; color:#9a9a90; font-size:26px; }
.c2e-portrait-a { display:grid; gap:6px; min-width:0; }
.c2e-portrait-a b { font-size:15px; }
.c2e-sub { display:grid; gap:12px; padding:14px; border:1.5px solid #ebe5d9; border-radius:16px; background:#fffdf9; }
.c2e-verses { display:grid; gap:8px; }
.c2e-verse { display:grid; gap:2px; text-align:left; padding:12px 14px; border-radius:14px; border:1.5px solid #ebe5d9; background:#fffdf9; font-family:inherit; cursor:pointer; color:inherit; min-height:48px; }
.c2e-verse b { font-size:14px; color:#4c6852; }
.c2e-verse span { font-family:var(--wk-font-display, Georgia, serif); font-size:16.5px; line-height:1.4; color:#2f3a32; }
.c2e-verse[aria-checked="true"] { border-color:#4c6852; background:#eef2ea; }
.c2e-phone { display:flex; align-items:center; gap:8px; }
.c2e-phone span { font-weight:700; color:#4c6852; }
.c2e-themes { display:grid; gap:10px; grid-template-columns:repeat(auto-fit, minmax(150px, 1fr)); }
.c2e-theme { display:grid; gap:4px; justify-items:start; text-align:left; padding:14px; border-radius:16px; border:1.5px solid #ebe5d9; cursor:pointer; font-family:inherit; color:#2f3a32; min-height:110px; }
.c2e-theme[aria-checked="true"] { border-color:#4c6852; box-shadow:0 0 0 3px rgba(76,104,82,.25); }
.c2e-theme-sw { display:flex; gap:4px; margin-bottom:6px; }
.c2e-theme-sw i { width:22px; height:22px; border-radius:50%; border:1px solid rgba(0,0,0,.08); }
.c2e-theme b { font-size:15.5px; }
.c2e-theme small { font-size:13px; color:#6e756d; }
.c2e-toggle { display:flex; align-items:center; gap:12px; min-height:52px; cursor:pointer; position:relative; }
.c2e-toggle span { flex:1; display:grid; }
.c2e-toggle b { font-size:15.5px; }
.c2e-toggle small { font-size:13px; color:#6e756d; }
.c2e-toggle input { position:absolute; opacity:0; width:52px; height:32px; right:0; margin:0; cursor:pointer; }
.c2e-toggle i { width:52px; height:32px; border-radius:999px; background:#d8d3c8; position:relative; flex:none; transition:background .2s; }
.c2e-toggle i::after { content:""; position:absolute; top:3px; left:3px; width:26px; height:26px; border-radius:50%; background:#fff; box-shadow:0 1px 4px rgba(0,0,0,.2); transition:transform .2s; }
.c2e-toggle input:checked + i { background:#4c6852; }
.c2e-toggle input:checked + i::after { transform:translateX(20px); }
.c2e-toggle input:focus-visible + i { outline:3px solid #b4677a; outline-offset:2px; }
.c2e-link { margin:0; padding:10px 12px; border-radius:12px; background:#f2efe7; font-size:13.5px; overflow-wrap:anywhere; }
.c2e-bar { position:fixed; left:0; right:0; bottom:0; z-index:5; display:flex; gap:8px; padding:8px 12px calc(8px + env(safe-area-inset-bottom,0px)); min-height:64px;
  background:rgba(251,248,243,.96); border-top:1px solid #ebe5d9; backdrop-filter:blur(8px); transition:transform .2s; }
.c2e-bar.is-hidden { transform:translateY(110%); }
.c2e-bar .c2e-btn { flex:1; min-width:0; padding:10px 10px; overflow:hidden; text-overflow:ellipsis; }
.c2e-bar .c2e-btn.is-ghost { flex:0 0 auto; }
.c2e-undo { position:fixed; left:50%; bottom:calc(80px + env(safe-area-inset-bottom,0px)); transform:translateX(-50%); z-index:6; display:flex; align-items:center; gap:14px;
  background:#2f3a32; color:#fff; border-radius:999px; padding:6px 6px 6px 18px; font-size:14.5px; box-shadow:0 10px 30px rgba(0,0,0,.25); max-width:calc(100vw - 24px); }
.c2e-undo button { min-height:44px; padding:0 16px; border-radius:999px; border:0; background:#fff; color:#2f3a32; font:700 14px inherit; font-family:inherit; cursor:pointer; }
@media (min-width: 1024px) {
  .c2e { right:auto; width:min(560px, 44vw); box-shadow:12px 0 40px -20px rgba(0,0,0,.35); border-right:1px solid #ebe5d9; }
  .c2e.is-previewing { display:flex; }
  .c2e-rail { flex-wrap:wrap; }
  .c2e-bar { position:sticky; left:auto; right:auto; }
  .c2e-bar .c2e-btn.is-ghost:first-child { display:none; }
  .c2e-pad { height:24px; }
  .c2e-undo { left:calc(min(560px, 44vw) / 2); bottom:84px; }
}
@media (prefers-reduced-motion: reduce) { .c2e-bar, .c2e-toggle i, .c2e-toggle i::after { transition:none; } }
/* The shared song picker borrows the valentine sheet's base classes: give them this studio's look. */
.c2e-music .vs-label { display:flex; justify-content:space-between; align-items:baseline; gap:8px; font-weight:700; font-size:14.5px; color:#2f3a32; margin:0 0 6px; }
.c2e-music .vs-input { width:100%; min-height:48px; padding:10px 14px; border-radius:14px; border:1.5px solid #ddd6c8; background:#fff; color:#2f3a32; font:16px inherit; font-family:inherit; }
.c2e-music .vs-input:focus { outline:none; border-color:#7f9a83; box-shadow:0 0 0 4px rgba(127,154,131,.2); }
.c2e-music .vs-hint { margin:4px 0 0; font-size:13px; line-height:1.45; color:#6e756d; }
.c2e-music .vs-err { margin:4px 0 0; font-size:13.5px; color:#a8323f; }
.c2e-music .vp-chip { display:inline-flex; align-items:center; justify-content:center; min-height:44px; padding:0 16px; border-radius:999px; border:1.5px solid #ddd6c8; background:#fff; color:#34503b; font:700 14px inherit; font-family:inherit; cursor:pointer; }
.c2e-music .vmp-songActs { display:flex; flex-wrap:wrap; gap:8px; }
.c2e-music .vmp-clock { width:96px; flex:none; text-align:center; }
.c2e-music .vmp-startRow .vs-hint { margin:0; flex:1; min-width:0; }
` + MUSIC_CSS;
