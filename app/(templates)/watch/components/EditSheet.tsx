"use client";

// ─── The form: an upload dialog ──────────────────────────────────────────────
//
// Dressed as a video platform's upload dialog — Details → Chapters → Letter →
// Visibility, the stepper with check circles, outlined fields with the label
// inside and a live "12/100" counter, a preview card with the video link and a
// filename — because the person filling it in is "uploading" the video.
//
// Only four things are required (her name, your name, a title, one photo) and
// the footer says exactly which are missing. Everything else is prefilled by
// the demo or by the AI panel, and the rare stuff (stats, comments, memories,
// a real video link) is folded into "Advanced" at the bottom of Visibility.
//
// Photos: add several at once → each gets a crop/zoom (the Dedication
// adjuster, pinch/drag/slider) → replace → reorder → remove. The first upload
// replaces the sample photos rather than adding to them.

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import PhotoAdjuster from "../../dedication/components/PhotoAdjuster";
import { compressImage } from "../../dedication/components/mediaUploads";
import { CROP_DEFAULT, photoCrop, type Crop } from "../../dedication/components/types";
import { MAX_PHOTOS } from "../../_love/types";
import type { EditMode } from "../hooks/useWatchEditor";
import Pic from "./Pic";
import { parseVideoLink } from "./theme";
import {
  DEMO_DATA,
  FRAME_SECONDS,
  LIMITS,
  MAX_CHAPTERS,
  MAX_RELATED,
  MAX_SECONDS,
  formatTimestamp,
  type Chapter,
  type Comment,
  type LovePhoto,
  type RelatedVideo,
  type WatchData,
} from "./types";
import { ICheck, IChevron, IClose, ICrop, IImage, ILock, IPlus, IRefresh, ITrash, IArrow, Mark } from "./icons";

export interface EditSheetProps {
  editMode: EditMode;
  setEditMode: (m: EditMode) => void;
  mf: WatchData;
  setMf: React.Dispatch<React.SetStateAction<WatchData>>;
  pagePassword: string;
  setPagePassword: (v: string) => void;
  onSave: () => void;
  saving: boolean;
}

type Step = 0 | 1 | 2 | 3;
const STEPS = ["Details", "Chapters", "Letter", "Visibility"] as const;

const DEMO_URLS = new Set(DEMO_DATA.photos.map((p) => p.url));
const isDemoPhotos = (photos: LovePhoto[]) => photos.length > 0 && photos.every((p) => DEMO_URLS.has(p.url));

/** What still needs the sender, in the order the form asks for it. */
export function missingWatchFields(d: WatchData): { label: string; step: Step }[] {
  const out: { label: string; step: Step }[] = [];
  if (!d.herName.trim()) out.push({ label: "her name", step: 0 });
  if (!d.channel.name.trim()) out.push({ label: "your name", step: 0 });
  if (!d.video.title.trim()) out.push({ label: "a title", step: 0 });
  if (!d.video.youtubeId && d.photos.length === 0) out.push({ label: "at least one photo", step: 0 });
  return out;
}

/** "3:12" / "192" → seconds, or null. */
function parseTimestamp(input: string): number | null {
  const raw = input.trim();
  if (!raw) return null;
  if (/^\d+$/.test(raw)) {
    const n = Number(raw);
    return n <= MAX_SECONDS ? n : null;
  }
  const parts = raw.split(":").map((p) => p.trim());
  if (parts.some((p) => !/^\d+$/.test(p)) || parts.length > 3) return null;
  const n = parts.reduce((acc, p) => acc * 60 + Number(p), 0);
  return n <= MAX_SECONDS ? n : null;
}

export default function EditSheet({ editMode, setEditMode, mf, setMf, pagePassword, setPagePassword, onSave, saving }: EditSheetProps) {
  const open = editMode === "manual";
  const [step, setStep] = useState<Step>(0);
  const [tried, setTried] = useState(false);
  const bodyRef = useRef<HTMLDivElement | null>(null);

  const missing = useMemo(() => missingWatchFields(mf), [mf]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [step]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const save = useCallback(() => {
    setTried(true);
    if (missing.length) {
      setStep(missing[0].step);
      return;
    }
    onSave();
  }, [missing, onSave]);

  if (!open) return null;

  const patch = <K extends keyof WatchData>(k: K, v: WatchData[K]) => setMf((p) => ({ ...p, [k]: v }));
  const patchVideo = (v: Partial<WatchData["video"]>) => setMf((p) => ({ ...p, video: { ...p.video, ...v } }));
  const patchChannel = (v: Partial<WatchData["channel"]>) => setMf((p) => ({ ...p, channel: { ...p.channel, ...v } }));
  const patchDesc = (v: Partial<WatchData["description"]>) => setMf((p) => ({ ...p, description: { ...p.description, ...v } }));

  const done = (s: Step) =>
    s === 0 ? missing.every((m) => m.step !== 0) : s === 1 ? mf.description.chapters.length > 0 : s === 2 ? !!mf.letter.trim() : true;

  return (
    <div className="ws-root" role="dialog" aria-modal="true" aria-label="Upload your video">
      <style>{CSS}</style>
      <div className="ws-dialog">
        <header className="ws-head">
          <h2 className="ws-head-t">{mf.video.title.trim() || "Untitled — for her"}</h2>
          <span className="ws-saved">
            <ILock size={14} color="#606060" /> Saved as draft
          </span>
          <button type="button" className="ws-x" onClick={() => setEditMode(null)} aria-label="Close">
            <IClose size={22} color="#0F0F0F" />
          </button>
        </header>

        <nav className="ws-steps" aria-label="Steps">
          {STEPS.map((label, i) => (
            <button
              key={label}
              type="button"
              className={`ws-step${step === i ? " is-on" : ""}${done(i as Step) ? " is-done" : ""}`}
              onClick={() => setStep(i as Step)}
              aria-current={step === i ? "step" : undefined}
            >
              <span className="ws-step-l">{label}</span>
              <span className="ws-step-dot">{done(i as Step) && step !== i ? <ICheck size={12} color="#fff" /> : null}</span>
            </button>
          ))}
        </nav>

        <div className="ws-body" ref={bodyRef}>
          <div className="ws-form">
            {step === 0 ? (
              <>
                <h3 className="ws-h">Details</h3>
                <div className="ws-two">
                  <Field label="Her name" required value={mf.herName} max={LIMITS.name} error={tried && !mf.herName.trim()} placeholder="what you call her" onChange={(v) => patch("herName", v)} />
                  <Field
                    label="Your name (channel)"
                    required
                    value={mf.channel.name}
                    max={LIMITS.name}
                    error={tried && !mf.channel.name.trim()}
                    placeholder="e.g. Karan"
                    onChange={(v) => patchChannel({ name: v })}
                  />
                </div>
                <Field
                  label="Title"
                  required
                  value={mf.video.title}
                  max={100}
                  error={tried && !mf.video.title.trim()}
                  placeholder="Add a title that describes your video (type @ to mention her)"
                  hint="A title like a real upload: “3 Years With Meera (Full Video, No Skips)”"
                  onChange={(v) => patchVideo({ title: v })}
                />
                <Field
                  label="Description"
                  multiline
                  rows={4}
                  value={mf.description.intro.join("\n\n")}
                  max={LIMITS.paragraph * 2}
                  placeholder="Tell viewers about your video (type m:ss to link a moment)"
                  onChange={(v) => patchDesc({ intro: v.split(/\n{2,}/).map((s) => s.slice(0, LIMITS.paragraph)) })}
                />

                <h4 className="ws-sub">
                  Photos <span className="ws-req">required</span>
                </h4>
                <p className="ws-note">
                  Your photos become the video — one frame per chapter, with a slow zoom. Tap a photo to crop or zoom it.
                </p>
                <PhotoGrid photos={mf.photos} onChange={(photos) => patch("photos", photos)} error={tried && !mf.video.youtubeId && mf.photos.length === 0} />
              </>
            ) : step === 1 ? (
              <ChaptersStep mf={mf} onChange={(chapters) => patchDesc({ chapters })} />
            ) : step === 2 ? (
              <>
                <h3 className="ws-h">Letter</h3>
                <p className="ws-note">
                  A private letter that pops up in the corner of her screen, like a notification. Only she sees it.
                </p>
                <Field
                  label="Your letter"
                  multiline
                  rows={9}
                  value={mf.letter}
                  max={LIMITS.letter}
                  placeholder={`Dear ${mf.herName || "you"}, …`}
                  onChange={(v) => patch("letter", v)}
                  serif
                />
                <div className="ws-two">
                  <Field
                    label="Question before it opens (optional)"
                    value={mf.lockQuestion}
                    max={LIMITS.lockQuestion}
                    placeholder="Did you watch till the end? 👀"
                    onChange={(v) => patch("lockQuestion", v)}
                  />
                  <Field
                    label="Her answer button"
                    value={mf.lockAnswer}
                    max={LIMITS.lockAnswer}
                    placeholder="obviously 🙄"
                    hint="The “no” button runs away."
                    onChange={(v) => patch("lockAnswer", v)}
                  />
                </div>
                <Field
                  label="End of description (the sincere part)"
                  multiline
                  rows={4}
                  value={mf.description.outro.join("\n\n")}
                  max={LIMITS.paragraph * 2}
                  placeholder="Where the joking stops…"
                  onChange={(v) => patchDesc({ outro: v.split(/\n{2,}/).map((s) => s.slice(0, LIMITS.paragraph)) })}
                  serif
                />
              </>
            ) : (
              <VisibilityStep mf={mf} setMf={setMf} pagePassword={pagePassword} setPagePassword={setPagePassword} />
            )}
          </div>

          <aside className="ws-preview" aria-label="Preview">
            <div className="ws-pv-frame">
              {mf.photos[0] ? <Pic photo={mf.photos[0]} className="ws-pv-kb" /> : <span className="ws-pv-empty"><IImage size={34} color="#909090" /></span>}
              <span className="ws-pv-dur">{formatTimestamp(Math.max(mf.description.chapters.length, mf.photos.length, 1) * FRAME_SECONDS)}</span>
              <span className="ws-pv-play" aria-hidden="true"><Mark size={30} /></span>
            </div>
            <div className="ws-pv-meta">
              <small>Video link</small>
              <span className="ws-pv-link">subhsandesh.in/{(mf.herName || "her").toLowerCase().replace(/[^a-z0-9]+/g, "")}-♥</span>
              <small>Filename</small>
              <span>us_final_FINAL_v3{mf.herName ? `_for_${mf.herName.toLowerCase().replace(/[^a-z0-9]+/g, "")}` : ""}.mp4</span>
            </div>
          </aside>
        </div>

        <footer className="ws-foot">
          <div className="ws-foot-status">
            {missing.length ? (
              <span className={`ws-missing${tried ? " is-loud" : ""}`}>
                <b>Still needed:</b> {missing.map((m) => m.label).join(", ")}
              </span>
            ) : (
              <span className="ws-ok">
                <ICheck size={16} color="#2BA640" /> Checks complete. No issues found.
              </span>
            )}
          </div>
          <div className="ws-foot-btns">
            {step > 0 ? (
              <button type="button" className="ws-btn is-text" onClick={() => setStep((s) => (s - 1) as Step)}>
                Back
              </button>
            ) : null}
            {step < 3 ? (
              <>
                <button type="button" className="ws-btn is-text ws-hide-sm" onClick={save} disabled={saving}>
                  Save
                </button>
                <button type="button" className="ws-btn is-blue" onClick={() => setStep((s) => (s + 1) as Step)}>
                  Next
                </button>
              </>
            ) : (
              <button type="button" className="ws-btn is-pink" onClick={save} disabled={saving}>
                Save &amp; preview ♥
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}

/* ── Fields ──────────────────────────────────────────────────────────────── */

function Field({
  label,
  value,
  onChange,
  max,
  required,
  multiline,
  rows = 3,
  placeholder,
  hint,
  error,
  serif,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  max?: number;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  hint?: string;
  error?: boolean;
  serif?: boolean;
  inputMode?: "numeric" | "text";
}) {
  const [focus, setFocus] = useState(false);
  return (
    <label className={`ws-f${focus ? " is-focus" : ""}${error ? " is-err" : ""}`}>
      <span className="ws-f-l">
        {label}
        {required ? " (required)" : ""}
      </span>
      {multiline ? (
        <textarea
          value={value}
          rows={rows}
          maxLength={max}
          placeholder={placeholder}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          onChange={(e) => onChange(e.target.value)}
          className={serif ? "is-serif" : undefined}
        />
      ) : (
        <input
          value={value}
          maxLength={max}
          placeholder={placeholder}
          inputMode={inputMode}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {max ? (
        <span className="ws-f-c">
          {value.length}/{max}
        </span>
      ) : null}
      {error ? <span className="ws-f-e">This field is required</span> : hint ? <span className="ws-f-h">{hint}</span> : null}
    </label>
  );
}

/* ── Photos ──────────────────────────────────────────────────────────────── */

function PhotoGrid({ photos, onChange, error }: { photos: LovePhoto[]; onChange: (p: LovePhoto[]) => void; error?: boolean }) {
  const addRef = useRef<HTMLInputElement | null>(null);
  const replaceRef = useRef<HTMLInputElement | null>(null);
  const replaceIdx = useRef<number | null>(null);
  const [adjust, setAdjust] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const demo = isDemoPhotos(photos);

  const add = async (files: FileList | null) => {
    if (!files?.length) return;
    setErr("");
    setBusy(true);
    const base = demo ? [] : photos;
    const room = MAX_PHOTOS - base.length;
    const added: LovePhoto[] = [];
    for (const f of Array.from(files).slice(0, room)) {
      try {
        added.push({ url: await compressImage(f), cropX: CROP_DEFAULT.x, cropY: CROP_DEFAULT.y, scale: CROP_DEFAULT.scale });
      } catch (e) {
        setErr(e instanceof Error ? e.message : "That photo couldn't be read");
      }
    }
    setBusy(false);
    if (files.length > room) setErr(`Only ${MAX_PHOTOS} photos fit — the rest were skipped.`);
    if (!added.length) return;
    const next = [...base, ...added];
    onChange(next);
    if (added.length === 1) setAdjust(next.length - 1);
  };

  const replace = async (files: FileList | null) => {
    const i = replaceIdx.current;
    if (i === null || !files?.[0]) return;
    try {
      const url = await compressImage(files[0]);
      onChange(photos.map((p, idx) => (idx === i ? { ...p, url, cropX: 50, cropY: 50, scale: 100 } : p)));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "That photo couldn't be read");
    }
  };

  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= photos.length) return;
    const next = [...photos];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  const adj = adjust !== null ? photos[adjust] : null;

  return (
    <div>
      <div className={`ws-grid${error ? " is-err" : ""}`}>
        <button type="button" className="ws-add" onClick={() => addRef.current?.click()} disabled={busy || (!demo && photos.length >= MAX_PHOTOS)}>
          {busy ? <span className="ws-spin" /> : <IPlus size={26} color="#606060" />}
          <b>{busy ? "Adding…" : demo ? "Upload your photos" : "Add photos"}</b>
          <small>{demo ? "replaces the samples" : `${photos.length}/${MAX_PHOTOS}`}</small>
        </button>
        {photos.map((p, i) => (
          <div key={`${i}-${p.url.slice(-24)}`} className="ws-ph">
            <button type="button" className="ws-ph-img" onClick={() => setAdjust(i)} aria-label={`Crop or zoom photo ${i + 1}`}>
              <Pic photo={p} />
              {demo ? <span className="ws-ph-sample">sample</span> : null}
              <span className="ws-ph-n">{i + 1}</span>
              <span className="ws-ph-crop">
                <ICrop size={14} color="#fff" /> Crop
              </span>
            </button>
            <div className="ws-ph-tools">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move earlier">
                <IArrow size={16} color="#0F0F0F" />
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === photos.length - 1} aria-label="Move later">
                <IArrow size={16} color="#0F0F0F" dir="right" />
              </button>
              <button
                type="button"
                onClick={() => {
                  replaceIdx.current = i;
                  replaceRef.current?.click();
                }}
                aria-label="Replace photo"
              >
                <IRefresh size={16} color="#0F0F0F" />
              </button>
              <button type="button" onClick={() => onChange(photos.filter((_, idx) => idx !== i))} aria-label="Remove photo">
                <ITrash size={16} color="#0F0F0F" />
              </button>
            </div>
            <input
              className="ws-ph-cap"
              value={p.caption ?? ""}
              maxLength={60}
              placeholder="caption (Moments card)"
              aria-label={`Caption for photo ${i + 1}`}
              onChange={(e) => onChange(photos.map((ph, idx) => (idx === i ? { ...ph, caption: e.target.value } : ph)))}
            />
          </div>
        ))}
      </div>
      {err ? <p className="ws-err">{err}</p> : null}
      {error ? <p className="ws-err">Add at least one photo — it becomes the video.</p> : null}
      <input ref={addRef} type="file" accept="image/*" multiple hidden onChange={(e) => { void add(e.target.files); e.target.value = ""; }} />
      <input ref={replaceRef} type="file" accept="image/*" hidden onChange={(e) => { void replace(e.target.files); e.target.value = ""; }} />
      <PhotoAdjuster
        open={adj !== null}
        src={adj?.url ?? ""}
        crop={adj ? photoCrop(adj) : CROP_DEFAULT}
        title={`Frame photo ${adjust !== null ? adjust + 1 : ""}`}
        onChange={(c: Crop) =>
          adjust !== null && onChange(photos.map((p, idx) => (idx === adjust ? { ...p, cropX: c.x, cropY: c.y, scale: c.scale } : p)))
        }
        onClose={() => setAdjust(null)}
        onReplace={() => {
          if (adjust === null) return;
          replaceIdx.current = adjust;
          replaceRef.current?.click();
        }}
      />
    </div>
  );
}

/* ── Chapters ────────────────────────────────────────────────────────────── */

function ChaptersStep({ mf, onChange }: { mf: WatchData; onChange: (c: Chapter[]) => void }) {
  const chapters = mf.description.chapters;
  const film = !mf.video.youtubeId;
  const set = (i: number, v: Partial<Chapter>) => onChange(chapters.map((c, idx) => (idx === i ? { ...c, ...v } : c)));
  return (
    <>
      <h3 className="ws-h">Chapters</h3>
      <p className="ws-note">
        {film
          ? `Each chapter is one frame of the film (${FRAME_SECONDS} seconds). The title shows in the chapter list; the caption types out on screen like subtitles.`
          : "Chapter timestamps really seek the video. Type them as m:ss."}
      </p>
      <ol className="ws-chs">
        {chapters.map((c, i) => (
          <li key={i} className="ws-ch">
            <div className="ws-ch-thumb">
              {film ? <Pic photo={mf.photos.length ? mf.photos[i % mf.photos.length] : null} /> : null}
              <span>{formatTimestamp(film ? i * FRAME_SECONDS : c.seconds)}</span>
            </div>
            <div className="ws-ch-fields">
              {!film ? (
                <Field
                  label="Starts at"
                  value={formatTimestamp(c.seconds)}
                  inputMode="numeric"
                  onChange={(v) => {
                    const s = parseTimestamp(v);
                    if (s !== null) set(i, { seconds: s });
                  }}
                />
              ) : null}
              <Field label={`Chapter ${i + 1} title`} value={c.label} max={90} placeholder="the fries incident" onChange={(v) => set(i, { label: v })} />
              {film ? (
                <Field label="Caption on screen" value={c.cc ?? ""} max={LIMITS.cc} placeholder="you stole my fries. I let you." onChange={(v) => set(i, { cc: v })} />
              ) : null}
            </div>
            <button type="button" className="ws-ch-x" onClick={() => onChange(chapters.filter((_, idx) => idx !== i))} aria-label={`Remove chapter ${i + 1}`}>
              <ITrash size={18} color="#606060" />
            </button>
          </li>
        ))}
      </ol>
      {chapters.length < MAX_CHAPTERS ? (
        <button
          type="button"
          className="ws-addrow"
          onClick={() =>
            onChange([
              ...chapters,
              { seconds: film ? chapters.length * FRAME_SECONDS : (chapters[chapters.length - 1]?.seconds ?? 0) + 30, label: "", cc: "" },
            ])
          }
        >
          <IPlus size={18} color="#065FD4" /> Add chapter
        </button>
      ) : null}
    </>
  );
}

/* ── Visibility + advanced ───────────────────────────────────────────────── */

function VisibilityStep({
  mf,
  setMf,
  pagePassword,
  setPagePassword,
}: {
  mf: WatchData;
  setMf: React.Dispatch<React.SetStateAction<WatchData>>;
  pagePassword: string;
  setPagePassword: (v: string) => void;
}) {
  const [gate, setGate] = useState<"link" | "private">(pagePassword ? "private" : "link");
  const [adv, setAdv] = useState<null | "stats" | "comments" | "memories" | "video">(null);
  const [link, setLink] = useState(mf.video.youtubeId);
  const avatarRef = useRef<HTMLInputElement | null>(null);

  const patchVideo = (v: Partial<WatchData["video"]>) => setMf((p) => ({ ...p, video: { ...p.video, ...v } }));
  const patchChannel = (v: Partial<WatchData["channel"]>) => setMf((p) => ({ ...p, channel: { ...p.channel, ...v } }));
  const setComment = (i: number, v: Partial<Comment>) =>
    setMf((p) => ({ ...p, comments: p.comments.map((c, idx) => (idx === i ? { ...c, ...v } : c)) }));
  const setRelated = (i: number, v: Partial<RelatedVideo>) =>
    setMf((p) => ({ ...p, related: p.related.map((r, idx) => (idx === i ? { ...r, ...v } : r)) }));

  const linkId = link.trim() ? parseVideoLink(link) : null;

  return (
    <>
      <h3 className="ws-h">Visibility</h3>
      <p className="ws-note">Choose who can watch it.</p>
      <div className="ws-radio-box">
        <label className={`ws-radio${gate === "private" ? " is-on" : ""}`}>
          <input type="radio" name="ws-vis" checked={gate === "private"} onChange={() => setGate("private")} />
          <span>
            <b>Private — only her</b>
            <small>She types a password you choose (a nickname, a date, an inside joke).</small>
          </span>
        </label>
        {gate === "private" ? (
          <div className="ws-radio-extra">
            <Field label="Password" value={pagePassword} max={64} placeholder="e.g. mangolassi" onChange={setPagePassword} />
          </div>
        ) : null}
        <label className={`ws-radio${gate === "link" ? " is-on" : ""}`}>
          <input
            type="radio"
            name="ws-vis"
            checked={gate === "link"}
            onChange={() => {
              setGate("link");
              setPagePassword("");
            }}
          />
          <span>
            <b>Unlisted — anyone with the link</b>
            <small>No password. Only people you send it to can find it.</small>
          </span>
        </label>
      </div>

      <h4 className="ws-sub">Advanced</h4>
      <Fold title="Channel & stats" sub="picture, handle, views, likes, subscribers" open={adv === "stats"} onToggle={() => setAdv(adv === "stats" ? null : "stats")}>
        <div className="ws-avrow">
          <span className="ws-av">{mf.channel.avatarUrl ? <Pic photo={{ url: mf.channel.avatarUrl }} /> : <Pic photo={mf.photos[0]} />}</span>
          <div>
            <b className="ws-avt">Channel picture</b>
            <small className="ws-avs">{mf.channel.avatarUrl ? "your own picture" : "using your first photo"}</small>
            <div className="ws-avbtns">
              <button type="button" className="ws-btn is-outline" onClick={() => avatarRef.current?.click()}>
                Upload
              </button>
              {mf.channel.avatarUrl ? (
                <button type="button" className="ws-btn is-text" onClick={() => patchChannel({ avatarUrl: "" })}>
                  Remove
                </button>
              ) : null}
            </div>
          </div>
          <input
            ref={avatarRef}
            type="file"
            accept="image/*"
            hidden
            onChange={async (e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (!f) return;
              try {
                patchChannel({ avatarUrl: await compressImage(f, 400) });
              } catch {
                /* ignored: the first photo stays */
              }
            }}
          />
        </div>
        <div className="ws-two">
          <Field label="Handle" value={mf.channel.handle} max={LIMITS.handle} onChange={(v) => patchChannel({ handle: v })} />
          <Field label="Subscribers" value={mf.channel.subscribers} max={LIMITS.stat} onChange={(v) => patchChannel({ subscribers: v })} />
          <Field label="Views" value={mf.video.views} max={LIMITS.stat} onChange={(v) => patchVideo({ views: v })} />
          <Field label="Likes" value={mf.video.likes} max={LIMITS.stat} onChange={(v) => patchVideo({ likes: v })} />
          <Field label="Posted" value={mf.video.postedAgo} max={LIMITS.ago} onChange={(v) => patchVideo({ postedAgo: v })} />
        </div>
      </Fold>

      <Fold title="Comments" sub="the pinned one and her friends' fake-real reactions" open={adv === "comments"} onToggle={() => setAdv(adv === "comments" ? null : "comments")}>
        <Field
          label="Your pinned comment"
          multiline
          rows={3}
          value={mf.pinnedComment?.text ?? ""}
          max={LIMITS.comment}
          onChange={(v) =>
            setMf((p) => ({
              ...p,
              pinnedComment: {
                id: p.pinnedComment?.id ?? "c0",
                author: p.channel.name,
                ago: p.pinnedComment?.ago ?? "2 days ago",
                likes: p.pinnedComment?.likes ?? 4402,
                isCreator: true,
                hearted: true,
                replies: p.pinnedComment?.replies,
                status: "published",
                text: v,
              },
            }))
          }
        />
        {mf.comments.map((c, i) => (
          <div key={c.id} className="ws-crow">
            <Field label={`Comment ${i + 1} — name`} value={c.author} max={LIMITS.name} onChange={(v) => setComment(i, { author: v })} />
            <Field label="Comment" multiline rows={2} value={c.text} max={LIMITS.comment} onChange={(v) => setComment(i, { text: v })} />
            <button type="button" className="ws-ch-x" onClick={() => setMf((p) => ({ ...p, comments: p.comments.filter((_, idx) => idx !== i) }))} aria-label={`Remove comment ${i + 1}`}>
              <ITrash size={18} color="#606060" />
            </button>
          </div>
        ))}
        <button
          type="button"
          className="ws-addrow"
          onClick={() =>
            setMf((p) => ({
              ...p,
              comments: [...p.comments, { id: `c${Date.now()}`, author: "", text: "", ago: "1 day ago", likes: 120, hearted: true, status: "published" }],
            }))
          }
        >
          <IPlus size={18} color="#065FD4" /> Add comment
        </button>
        <Field label="Note shown to friends who comment" value={mf.contributorPrompt} max={LIMITS.prompt} onChange={(v) => setMf((p) => ({ ...p, contributorPrompt: v }))} />
      </Fold>

      <Fold title="Up next (memories)" sub="the cards in the right column — tap one and it plays" open={adv === "memories"} onToggle={() => setAdv(adv === "memories" ? null : "memories")}>
        {mf.related.map((r, i) => (
          <div key={r.id} className="ws-crow">
            <Field label={`Memory ${i + 1} — title`} value={r.title} max={100} onChange={(v) => setRelated(i, { title: v })} />
            <Field label="What it says when she opens it" value={r.note ?? ""} max={LIMITS.note} onChange={(v) => setRelated(i, { note: v })} />
            <div className="ws-two">
              <Field label="Duration" value={r.duration} max={LIMITS.duration} onChange={(v) => setRelated(i, { duration: v })} />
              <Field label="Posted" value={r.ago} max={LIMITS.ago} onChange={(v) => setRelated(i, { ago: v })} />
            </div>
            <button type="button" className="ws-ch-x" onClick={() => setMf((p) => ({ ...p, related: p.related.filter((_, idx) => idx !== i) }))} aria-label={`Remove memory ${i + 1}`}>
              <ITrash size={18} color="#606060" />
            </button>
          </div>
        ))}
        {mf.related.length < MAX_RELATED ? (
          <button
            type="button"
            className="ws-addrow"
            onClick={() =>
              setMf((p) => ({
                ...p,
                related: [...p.related, { id: `r${Date.now()}`, title: "", channel: "", views: "1,204 views", ago: "1 year ago", duration: "4:20", thumbnailUrl: "", note: "" }],
              }))
            }
          >
            <IPlus size={18} color="#065FD4" /> Add memory
          </button>
        ) : null}
      </Fold>

      <Fold title="Use a real video instead" sub="paste a link to a video you made — it plays instead of the photo film" open={adv === "video"} onToggle={() => setAdv(adv === "video" ? null : "video")}>
        <Field
          label="Video link"
          value={link}
          placeholder="https://…"
          onChange={(v) => {
            setLink(v);
            const id = v.trim() ? parseVideoLink(v) : "";
            if (id !== null) patchVideo({ youtubeId: id });
          }}
          hint={link.trim() ? (linkId ? "Link recognised ✓ — chapters now use real timestamps" : "That doesn't look like a video link") : "Leave empty to play your photos as the video."}
        />
        {mf.video.youtubeId ? (
          <button
            type="button"
            className="ws-btn is-outline"
            onClick={() => {
              setLink("");
              patchVideo({ youtubeId: "" });
            }}
          >
            Go back to the photo film
          </button>
        ) : null}
      </Fold>
    </>
  );
}

function Fold({ title, sub, open, onToggle, children }: { title: string; sub: string; open: boolean; onToggle: () => void; children: ReactNode }) {
  return (
    <section className={`ws-fold${open ? " is-open" : ""}`}>
      <button type="button" className="ws-fold-h" onClick={onToggle} aria-expanded={open}>
        <span>
          <b>{title}</b>
          <small>{sub}</small>
        </span>
        <IChevron size={22} color="#0F0F0F" dir={open ? "up" : "down"} />
      </button>
      {open ? <div className="ws-fold-b">{children}</div> : null}
    </section>
  );
}

const CSS = `
.ws-root {
  position: fixed; inset: 0; z-index: 280; background: rgba(0,0,0,.6); display: flex; align-items: stretch; justify-content: center;
  font-family: var(--font-wt-roboto), Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; color: #0F0F0F;
  animation: ws-fade .2s ease both;
}
@keyframes ws-fade { from { opacity: 0; } to { opacity: 1; } }
.ws-root *, .ws-root *::before, .ws-root *::after { box-sizing: border-box; }
.ws-root h2, .ws-root h3, .ws-root h4 { font-family: inherit; letter-spacing: normal; }
.ws-dialog {
  position: relative; display: flex; flex-direction: column; width: 100%; height: 100%; background: #fff; overflow: hidden;
  animation: ws-up .3s cubic-bezier(.2,.8,.2,1) both;
}
@keyframes ws-up { from { transform: translateY(24px); opacity: 0; } to { transform: none; opacity: 1; } }
.ws-head { display: flex; align-items: center; gap: 12px; padding: 12px 8px 8px 20px; border-bottom: 1px solid #E5E5E5; flex: none; padding-top: calc(12px + env(safe-area-inset-top, 0px)); }
.ws-head-t { margin: 0; flex: 1; min-width: 0; font-size: 20px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ws-saved { display: none; align-items: center; gap: 6px; font-size: 12px; color: #606060; padding: 4px 10px; border-radius: 12px; background: #F2F2F2; white-space: nowrap; }
.ws-x { width: 40px; height: 40px; border: 0; background: none; border-radius: 50%; display: grid; place-items: center; cursor: pointer; flex: none; }
.ws-x:hover { background: #F2F2F2; }
.ws-steps { display: flex; justify-content: space-between; padding: 12px 16px 0; flex: none; position: relative; overflow-x: auto; scrollbar-width: none; gap: 4px; }
.ws-steps::-webkit-scrollbar { display: none; }
.ws-steps::before { content: ""; position: absolute; left: 12%; right: 12%; bottom: 7px; height: 2px; background: #E5E5E5; }
.ws-step {
  position: relative; flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px; border: 0; background: none;
  padding: 4px 0 0; cursor: pointer; font-family: inherit; color: #606060; min-width: 72px;
}
.ws-step-l { font-size: 13px; font-weight: 500; white-space: nowrap; }
.ws-step-dot { position: relative; z-index: 1; width: 16px; height: 16px; border-radius: 50%; border: 2px solid #909090; background: #fff; display: grid; place-items: center; transition: all .2s ease; }
.ws-step.is-done .ws-step-dot { background: #065FD4; border-color: #065FD4; }
.ws-step.is-on { color: #065FD4; }
.ws-step.is-on .ws-step-dot { border: 4px solid #065FD4; background: #fff; transform: scale(1.1); }
.ws-body { flex: 1; overflow-y: auto; display: flex; gap: 32px; padding: 20px 20px 32px; overscroll-behavior: contain; }
.ws-form { flex: 1; min-width: 0; max-width: 640px; }
.ws-preview { display: none; }
.ws-h { margin: 4px 0 6px; font-size: 24px; font-weight: 700; }
.ws-sub { margin: 26px 0 4px; font-size: 16px; font-weight: 500; display: flex; align-items: center; gap: 8px; }
.ws-req { font-size: 11px; font-weight: 500; color: #CC0F5F; background: #FFE5EF; padding: 2px 6px; border-radius: 4px; }
.ws-note { margin: 0 0 14px; font-size: 13px; line-height: 18px; color: #606060; }
.ws-two { display: grid; grid-template-columns: 1fr; gap: 0 16px; }
.ws-f { position: relative; display: block; margin: 0 0 16px; padding: 8px 12px 22px; border: 1px solid #CCC; border-radius: 6px; transition: border-color .15s ease, box-shadow .15s ease; background: #fff; }
.ws-f:hover { border-color: #909090; }
.ws-f.is-focus { border-color: #065FD4; box-shadow: 0 0 0 1px #065FD4; }
.ws-f.is-err { border-color: #CC0000; box-shadow: 0 0 0 1px #CC0000; }
.ws-f-l { display: block; font-size: 12px; color: #606060; margin-bottom: 2px; }
.ws-f.is-focus .ws-f-l { color: #065FD4; }
.ws-f.is-err .ws-f-l { color: #CC0000; }
.ws-f input, .ws-f textarea {
  display: block; width: 100%; border: 0; outline: none; padding: 0; background: none; color: #0F0F0F; font-family: inherit;
  font-size: 16px; line-height: 22px; resize: vertical;
}
.ws-f textarea.is-serif { font-family: var(--font-di-serif), "Instrument Serif", Georgia, serif; font-size: 19px; line-height: 26px; }
.ws-f input::placeholder, .ws-f textarea::placeholder { color: #909090; }
.ws-f-c { position: absolute; right: 10px; bottom: 4px; font-size: 11px; color: #909090; font-variant-numeric: tabular-nums; }
.ws-f-h, .ws-f-e { position: absolute; left: 12px; bottom: 4px; right: 60px; font-size: 11px; color: #606060; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ws-f-e { color: #CC0000; }
.ws-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.ws-grid.is-err .ws-add { border-color: #CC0000; }
.ws-add {
  aspect-ratio: 16 / 11; border: 1.5px dashed #909090; border-radius: 8px; background: #F9F9F9; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 4px; cursor: pointer; font-family: inherit; color: #0F0F0F; padding: 8px; text-align: center;
}
.ws-add:hover { background: #F2F2F2; border-color: #065FD4; }
.ws-add b { font-size: 13px; font-weight: 500; }
.ws-add small { font-size: 11px; color: #606060; }
.ws-spin { width: 22px; height: 22px; border-radius: 50%; border: 3px solid #E5E5E5; border-top-color: #065FD4; animation: ws-spin .8s linear infinite; }
@keyframes ws-spin { to { transform: rotate(360deg); } }
.ws-ph { display: flex; flex-direction: column; gap: 6px; min-width: 0; animation: ws-up .3s ease both; }
.ws-ph-img { position: relative; display: block; width: 100%; aspect-ratio: 16 / 9; border-radius: 8px; overflow: hidden; border: 0; padding: 0; cursor: pointer; background: #EEE; }
.ws-ph-sample { position: absolute; top: 6px; left: 6px; font-size: 10px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: #fff; background: rgba(0,0,0,.6); padding: 2px 6px; border-radius: 4px; }
.ws-ph-n { position: absolute; top: 6px; right: 6px; width: 20px; height: 20px; border-radius: 50%; background: #fff; color: #0F0F0F; font-size: 11px; font-weight: 700; display: grid; place-items: center; }
.ws-ph-crop { position: absolute; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; gap: 4px; padding: 5px; font-size: 11px; font-weight: 500; color: #fff; background: linear-gradient(transparent, rgba(0,0,0,.7)); }
.ws-ph-tools { display: flex; gap: 4px; }
.ws-ph-tools button { flex: 1; height: 30px; border: 1px solid #E5E5E5; border-radius: 6px; background: #fff; display: grid; place-items: center; cursor: pointer; }
.ws-ph-tools button:hover { background: #F2F2F2; }
.ws-ph-tools button:disabled { opacity: .35; cursor: default; }
.ws-ph-cap { width: 100%; height: 32px; border: 1px solid #E5E5E5; border-radius: 6px; padding: 0 8px; font-family: inherit; font-size: 13px; outline: none; color: #0F0F0F; }
.ws-ph-cap:focus { border-color: #065FD4; }
.ws-err { margin: 8px 0 0; font-size: 12px; color: #CC0000; }
.ws-chs { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
.ws-ch { position: relative; display: flex; gap: 12px; padding: 12px 40px 0 12px; border: 1px solid #E5E5E5; border-radius: 10px; }
.ws-ch-thumb { position: relative; width: 96px; flex: none; align-self: flex-start; aspect-ratio: 16 / 9; border-radius: 6px; overflow: hidden; background: #EEE; }
.ws-ch-thumb span { position: absolute; left: 4px; bottom: 4px; font-size: 11px; font-weight: 500; color: #fff; background: rgba(0,0,0,.75); padding: 0 4px; border-radius: 3px; }
.ws-ch-fields { flex: 1; min-width: 0; }
.ws-ch-x { position: absolute; top: 6px; right: 4px; width: 32px; height: 32px; border: 0; background: none; border-radius: 50%; display: grid; place-items: center; cursor: pointer; }
.ws-ch-x:hover { background: #F2F2F2; }
.ws-addrow { display: inline-flex; align-items: center; gap: 6px; height: 36px; margin: 12px 0 4px; padding: 0 14px 0 10px; border-radius: 18px; border: 0; background: #DEF1FF; color: #065FD4; font-family: inherit; font-size: 14px; font-weight: 500; cursor: pointer; }
.ws-addrow:hover { background: #CCE6FF; }
.ws-crow { position: relative; padding: 12px 40px 0 12px; border: 1px solid #E5E5E5; border-radius: 10px; margin-bottom: 12px; }
.ws-radio-box { border: 1px solid #CCC; border-radius: 8px; padding: 6px 16px; }
.ws-radio { display: flex; gap: 14px; align-items: flex-start; padding: 12px 0; cursor: pointer; }
.ws-radio input { width: 20px; height: 20px; margin: 1px 0 0; accent-color: #065FD4; flex: none; }
.ws-radio span { display: flex; flex-direction: column; gap: 2px; }
.ws-radio b { font-size: 15px; font-weight: 500; }
.ws-radio small { font-size: 13px; color: #606060; line-height: 18px; }
.ws-radio-extra { padding: 0 0 4px 34px; }
.ws-fold { border: 1px solid #E5E5E5; border-radius: 10px; margin-bottom: 10px; overflow: hidden; }
.ws-fold-h { display: flex; align-items: center; gap: 12px; width: 100%; padding: 14px 12px 14px 16px; border: 0; background: #fff; cursor: pointer; font-family: inherit; text-align: left; color: #0F0F0F; }
.ws-fold-h:hover { background: #F9F9F9; }
.ws-fold-h span { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.ws-fold-h b { font-size: 15px; font-weight: 500; }
.ws-fold-h small { font-size: 12px; color: #606060; }
.ws-fold-b { padding: 4px 16px 12px; }
.ws-avrow { display: flex; gap: 16px; align-items: center; margin: 4px 0 16px; }
.ws-av { position: relative; width: 72px; height: 72px; border-radius: 50%; overflow: hidden; flex: none; background: #EEE; }
.ws-avt { display: block; font-size: 14px; font-weight: 500; }
.ws-avs { display: block; font-size: 12px; color: #606060; margin-bottom: 6px; }
.ws-avbtns { display: flex; gap: 6px; }
.ws-foot { flex: none; display: flex; align-items: center; gap: 12px; padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0px)); border-top: 1px solid #E5E5E5; background: #fff; }
.ws-foot-status { flex: 1; min-width: 0; font-size: 12px; line-height: 16px; color: #606060; }
.ws-missing b { color: #0F0F0F; font-weight: 500; }
.ws-missing.is-loud { color: #CC0000; }
.ws-missing.is-loud b { color: #CC0000; }
.ws-ok { display: inline-flex; align-items: center; gap: 6px; }
.ws-foot-btns { display: flex; gap: 8px; flex: none; }
.ws-btn { height: 36px; padding: 0 16px; border-radius: 18px; border: 0; font-family: inherit; font-size: 14px; font-weight: 500; cursor: pointer; white-space: nowrap; }
.ws-btn:disabled { opacity: .5; cursor: default; }
.ws-btn.is-text { background: none; color: #065FD4; }
.ws-btn.is-text:hover { background: #DEF1FF; }
.ws-btn.is-blue { background: #065FD4; color: #fff; }
.ws-btn.is-blue:hover { background: #0556BF; }
.ws-btn.is-pink { background: linear-gradient(135deg, #FF3E86, #FF7A59); color: #fff; box-shadow: 0 6px 16px -6px rgba(255,62,134,.7); }
.ws-btn.is-outline { background: #fff; border: 1px solid #CCC; color: #065FD4; }
@media (max-width: 420px) { .ws-hide-sm { display: none; } }
@media (min-width: 640px) {
  .ws-two { grid-template-columns: 1fr 1fr; }
  .ws-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (min-width: 960px) {
  .ws-root { align-items: center; padding: 24px; }
  .ws-dialog { width: min(1080px, 100%); height: min(860px, 100%); border-radius: 12px; box-shadow: 0 16px 60px rgba(0,0,0,.4); }
  .ws-saved { display: inline-flex; }
  .ws-steps { padding: 16px 12% 0; }
  .ws-body { padding: 24px 32px 32px; }
  .ws-preview { display: block; width: 320px; flex: none; position: sticky; top: 0; align-self: flex-start; background: #F9F9F9; border-radius: 8px; overflow: hidden; }
  .ws-pv-frame { position: relative; aspect-ratio: 16 / 9; background: #000; overflow: hidden; }
  .ws-pv-kb { animation: ws-kb 9s ease-in-out infinite alternate; }
  @keyframes ws-kb { from { transform: scale(1); } to { transform: scale(1.12); } }
  .ws-pv-empty { position: absolute; inset: 0; display: grid; place-items: center; background: #E5E5E5; }
  .ws-pv-dur { position: absolute; right: 6px; bottom: 6px; font-size: 12px; color: #fff; background: rgba(0,0,0,.8); padding: 0 4px; border-radius: 3px; }
  .ws-pv-play { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); filter: drop-shadow(0 4px 12px rgba(0,0,0,.4)); }
  .ws-pv-meta { padding: 12px 16px 16px; display: flex; flex-direction: column; gap: 2px; font-size: 14px; }
  .ws-pv-meta small { font-size: 12px; color: #606060; margin-top: 8px; }
  .ws-pv-meta span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ws-pv-link { color: #065FD4; }
}
@media (prefers-reduced-motion: reduce) {
  .ws-root, .ws-dialog, .ws-ph, .ws-pv-kb { animation: none; }
}
`;
