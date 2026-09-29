"use client";

// ─── EditSheet — the sender's form ───────────────────────────────────────────
//
// Three cards and a drawer of extras:
//
//   1. Her app      — her photo (the icon), her name, your name, what she is
//   2. Screenshots  — your photos, each framed (drag / pinch / zoom) + headline
//   3. The letter   — the one that pops in the corner, with an optional question
//   More (folded)   — listing details, description, versions, reviews, in-app
//                     purchases & privacy, friends & password
//
// Only her name and your name are required, and the footer says exactly which
// is missing. Every control writes straight into `mf`, which the editor hook
// autosaves, so this file holds no draft state of its own. On phones it is a
// bottom sheet; from 900px it is a right-hand drawer with the live listing
// visible beside it.

import { useCallback, useId, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { EditMode } from "../hooks/useAppEditor";
import type { AppData, AppReview, AppScreenshot, AppStar, AppVersion } from "./types";
import { APP_REVIEW_LIMITS } from "./types";
import PhotoAdjuster from "../../dedication/components/PhotoAdjuster";
import { compressImage } from "../../dedication/components/mediaUploads";
import { CROP_DEFAULT, cropStyle, photoCrop, type Crop } from "../../dedication/components/types";
import { CloseIcon, HeartIcon } from "./icons";

const ACCENT = "#FF2D55";
const LETTER_MAX = 2000;
const MAX_SHOTS = 6;
const RELATIONS = ["Girlfriend", "Wife", "Fiancée", "Crush", "Boyfriend", "Husband", "Partner"];

/** Which required fields are still empty, in the words the footer uses. */
export function missingFor(mf: AppData): string[] {
  const out: string[] = [];
  if (!mf.app.name.trim()) out.push("her name");
  if (!mf.app.seller.trim()) out.push("your name");
  return out;
}

const CSS = `
.es-scrim { position: fixed; inset: 0; z-index: 210; background: rgba(0,0,0,.42); }
.es { position: fixed; z-index: 211; left: 0; right: 0; bottom: 0; height: 94dvh; display: flex; flex-direction: column; background: #F2F2F7;
  border-radius: 18px 18px 0 0; box-shadow: 0 -20px 60px -20px rgba(0,0,0,.4); color: #000;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; -webkit-font-smoothing: antialiased; }
.es *, .es *::before, .es *::after { box-sizing: border-box; }
.es button { font: inherit; cursor: pointer; touch-action: manipulation; }
.es-top { flex: none; display: flex; align-items: center; gap: 10px; padding: 8px 14px 10px 18px; border-bottom: .5px solid rgba(0,0,0,.12); background: rgba(242,242,247,.96); border-radius: 18px 18px 0 0; }
.es-grab { position: absolute; top: 6px; left: 50%; width: 36px; height: 5px; margin-left: -18px; border-radius: 3px; background: #C7C7CC; }
.es-top h2 { margin: 12px 0 0; font-size: 20px; font-weight: 700; letter-spacing: -.4px; }
.es-top p { margin: 2px 0 0; font-size: 13px; color: #8A8A8E; }
.es-x { margin-left: auto; width: 34px; height: 34px; border-radius: 50%; border: 0; background: #E3E3E8; color: #3a3a3c; display: grid; place-items: center; align-self: flex-start; margin-top: 8px; }
.es-scroll { flex: 1; overflow-y: auto; padding: 14px 14px 24px; overscroll-behavior: contain; }
.es-card { background: #fff; border-radius: 16px; padding: 16px; margin-bottom: 14px; }
.es-card-h { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.es-num { width: 24px; height: 24px; border-radius: 50%; background: ${ACCENT}; color: #fff; font-size: 13px; font-weight: 800; display: grid; place-items: center; flex: none; }
.es-card-h b { font-size: 17px; font-weight: 700; letter-spacing: -.2px; }
.es-card-h small { display: block; font-size: 12.5px; color: #8A8A8E; font-weight: 400; margin-top: 1px; }
.es-lbl { display: flex; justify-content: space-between; gap: 8px; font-size: 13px; font-weight: 600; color: #3a3a3c; margin: 0 0 6px; }
.es-lbl em { font-style: normal; color: ${ACCENT}; font-weight: 700; }
.es-lbl span { color: #8A8A8E; font-weight: 400; font-variant-numeric: tabular-nums; }
.es-in { width: 100%; min-height: 48px; padding: 12px 14px; border-radius: 12px; border: 1px solid #E3E3E8; background: #F7F7FA; font-size: 16px; color: #000; outline: none; font-family: inherit; transition: border-color .15s, box-shadow .15s, background .15s; }
.es-in:focus { border-color: ${ACCENT}; background: #fff; box-shadow: 0 0 0 4px rgba(255,45,85,.12); }
.es-in.is-missing { border-color: #FF9FB3; background: #FFF5F7; }
.es-in.big { font-size: 20px; font-weight: 700; letter-spacing: -.3px; }
textarea.es-in { resize: vertical; line-height: 1.45; }
.es-hint { margin: 6px 0 0; font-size: 12.5px; color: #8A8A8E; line-height: 1.4; }
.es-f { margin-bottom: 14px; } .es-f:last-child { margin-bottom: 0; }
.es-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
.es-chip { height: 34px; padding: 0 13px; border-radius: 99px; border: 1px solid #E3E3E8; background: #fff; font-size: 14px; font-weight: 600; color: #3a3a3c; transition: all .15s; }
.es-chip.is-on { background: ${ACCENT}; border-color: ${ACCENT}; color: #fff; }
.es-iconrow { display: flex; gap: 14px; align-items: center; margin-bottom: 16px; }
.es-icon { position: relative; flex: none; width: 88px; height: 88px; border-radius: 26.5%; overflow: hidden; border: 0; padding: 0; background: radial-gradient(120% 120% at 20% 10%, #FF8FAB, #FF2D55 55%, #C2185B); color: #fff; font-size: 38px; font-weight: 700; display: grid; place-items: center; box-shadow: 0 0 0 .5px rgba(0,0,0,.12); }
.es-icon img { position: absolute; inset: 0; }
.es-btns { display: flex; flex-wrap: wrap; gap: 8px; }
.es-btn { height: 38px; padding: 0 14px; border-radius: 99px; border: 1px solid #E3E3E8; background: #fff; font-size: 14px; font-weight: 600; color: #1c1c1e; }
.es-btn.pri { background: ${ACCENT}; border-color: ${ACCENT}; color: #fff; }
.es-btn.ghost { color: #8A8A8E; }
.es-shots { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.es-shot { display: grid; gap: 6px; min-width: 0; }
.es-shot-img { position: relative; aspect-ratio: 4 / 5; border-radius: 14px; overflow: hidden; background: #EDEDF2; border: 0; padding: 0; }
.es-shot-img img { position: absolute; inset: 0; }
.es-shot-tag { position: absolute; left: 8px; top: 8px; padding: 3px 8px; border-radius: 99px; background: rgba(0,0,0,.55); color: #fff; font-size: 11px; font-weight: 700; }
.es-shot-adj { position: absolute; left: 0; right: 0; bottom: 0; padding: 6px; font-size: 11.5px; font-weight: 700; color: #fff; background: linear-gradient(transparent, rgba(0,0,0,.6)); text-align: center; }
.es-shot-tools { display: flex; gap: 6px; }
.es-shot-tools button { flex: 1; height: 32px; border-radius: 10px; border: 1px solid #E3E3E8; background: #fff; font-size: 12.5px; font-weight: 600; color: #3a3a3c; }
.es-shot input { min-height: 40px; padding: 8px 10px; font-size: 14px; }
.es-add { aspect-ratio: 4 / 5; border-radius: 14px; border: 2px dashed #FFB3C3; background: #FFF5F7; color: ${ACCENT}; font-weight: 700; font-size: 14px; display: grid; place-items: center; align-content: center; gap: 6px; }
.es-err { margin: 8px 0 0; font-size: 12.5px; color: ${ACCENT}; font-weight: 600; }
.es-toggle { display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%; min-height: 44px; border: 0; background: none; padding: 0; margin-top: 10px; text-align: left; font-size: 15px; font-weight: 600; color: #1c1c1e; }
.es-switch { flex: none; width: 51px; height: 31px; border-radius: 99px; background: #E3E3E8; position: relative; transition: background .2s; }
.es-switch::after { content: ""; position: absolute; top: 2px; left: 2px; width: 27px; height: 27px; border-radius: 50%; background: #fff; box-shadow: 0 2px 6px rgba(0,0,0,.2); transition: transform .25s cubic-bezier(.3,1.3,.5,1); }
.es-switch.is-on { background: #34C759; } .es-switch.is-on::after { transform: translateX(20px); }
.es-more-h { margin: 22px 4px 8px; font-size: 13px; font-weight: 700; color: #8A8A8E; text-transform: uppercase; letter-spacing: .4px; }
.es-acc { background: #fff; border-radius: 14px; margin-bottom: 8px; overflow: hidden; }
.es-acc > button { width: 100%; min-height: 56px; display: flex; align-items: center; gap: 12px; padding: 10px 16px; border: 0; background: none; text-align: left; }
.es-acc > button b { display: block; font-size: 16px; font-weight: 600; color: #000; }
.es-acc > button small { display: block; font-size: 12.5px; color: #8A8A8E; margin-top: 1px; }
.es-acc-chev { margin-left: auto; color: #C7C7CC; transition: transform .2s; font-size: 18px; }
.es-acc.is-open .es-acc-chev { transform: rotate(90deg); }
.es-acc-body { padding: 4px 16px 16px; }
.es-item { border: 1px solid #EDEDF2; border-radius: 12px; padding: 12px; margin-bottom: 10px; background: #FCFCFD; }
.es-item-h { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; font-size: 13px; font-weight: 700; color: #8A8A8E; }
.es-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.es-stars { display: flex; gap: 4px; margin-bottom: 10px; }
.es-stars button { width: 38px; height: 38px; border-radius: 10px; border: 1px solid #E3E3E8; background: #fff; color: #C7C7CC; font-size: 18px; }
.es-stars button.is-on { color: #FF9500; border-color: #FFD599; background: #FFF8EC; }
.es-foot { flex: none; padding: 10px 14px calc(12px + env(safe-area-inset-bottom, 0px)); background: rgba(255,255,255,.97); border-top: .5px solid rgba(0,0,0,.12); display: flex; align-items: center; gap: 12px; }
.es-foot p { flex: 1; min-width: 0; margin: 0; font-size: 13px; line-height: 1.35; color: #8A8A8E; }
.es-foot p.is-missing { color: ${ACCENT}; font-weight: 600; }
.es-save { flex: none; height: 50px; padding: 0 24px; border-radius: 14px; border: 0; background: ${ACCENT}; color: #fff; font-size: 16px; font-weight: 700; box-shadow: 0 8px 20px -8px rgba(255,45,85,.7); transition: transform .15s, opacity .2s; }
.es-save:active { transform: scale(.97); }
.es-save.is-dim { opacity: .55; }
@media (min-width: 560px) { .es-shots { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (min-width: 900px) {
  .es-scrim { background: rgba(0,0,0,.12); }
  .es { left: auto; top: 0; width: 480px; height: 100dvh; border-radius: 0; box-shadow: -20px 0 60px -20px rgba(0,0,0,.35); }
  .es-top { border-radius: 0; } .es-grab { display: none; }
  .es-shots { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
`;

/* ── Primitives ────────────────────────────────────────────────────────────── */

function Field({
  label,
  value,
  onChange,
  placeholder,
  max,
  hint,
  required,
  big,
  multiline,
  rows = 4,
  showCount,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  max?: number;
  hint?: ReactNode;
  required?: boolean;
  big?: boolean;
  multiline?: boolean;
  rows?: number;
  showCount?: boolean;
}) {
  const id = useId();
  const missing = required && !value.trim();
  return (
    <div className="es-f">
      <label className="es-lbl" htmlFor={id}>
        <span style={{ color: "#3a3a3c", fontWeight: 600 }}>
          {label} {required ? <em>*</em> : null}
        </span>
        {showCount && max ? (
          <span>
            {value.length}/{max}
          </span>
        ) : null}
      </label>
      {multiline ? (
        <textarea
          id={id}
          className={`es-in${missing ? " is-missing" : ""}`}
          value={value}
          maxLength={max}
          rows={rows}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          id={id}
          type="text"
          className={`es-in${big ? " big" : ""}${missing ? " is-missing" : ""}`}
          value={value}
          maxLength={max}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
        />
      )}
      {hint ? <p className="es-hint">{hint}</p> : null}
    </div>
  );
}

/** A string[] edited as one entry per line. Blank lines are dropped on blur. */
function Lines({
  label,
  value,
  onChange,
  hint,
  rows = 4,
  placeholder,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  hint?: string;
  rows?: number;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <div className="es-f">
      <label className="es-lbl" htmlFor={id}>
        <span style={{ color: "#3a3a3c", fontWeight: 600 }}>{label}</span>
      </label>
      <textarea
        id={id}
        className="es-in"
        rows={rows}
        placeholder={placeholder}
        value={value.join("\n")}
        onChange={(e) => onChange(e.target.value.split("\n"))}
        onBlur={(e) => onChange(e.target.value.split("\n").map((l) => l.trim()).filter(Boolean))}
      />
      <p className="es-hint">{hint ? `${hint} ` : ""}One per line.</p>
    </div>
  );
}

function Acc({ title, sub, children }: { title: string; sub: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`es-acc${open ? " is-open" : ""}`}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span>
          <b>{title}</b>
          <small>{sub}</small>
        </span>
        <span className="es-acc-chev" aria-hidden="true">
          ›
        </span>
      </button>
      {open ? <div className="es-acc-body">{children}</div> : null}
    </div>
  );
}

/* ── The sheet ─────────────────────────────────────────────────────────────── */

type Adjusting = { kind: "icon" } | { kind: "shot"; index: number } | null;

export default function EditSheet({
  editMode,
  setEditMode,
  mf,
  updateMf,
  pagePassword,
  setPagePassword,
  onSave,
  saving,
}: {
  editMode: EditMode;
  setEditMode: (m: EditMode) => void;
  mf: AppData;
  updateMf: (key: keyof AppData, val: unknown) => void;
  pagePassword: string;
  setPagePassword: (v: string) => void;
  onSave: () => void;
  saving: boolean;
}) {
  const open = editMode === "manual";
  const [adjusting, setAdjusting] = useState<Adjusting>(null);
  const [busy, setBusy] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [askFirst, setAskFirst] = useState(() => !!mf.lockQuestion.trim());
  const iconInput = useRef<HTMLInputElement>(null);
  const shotInput = useRef<HTMLInputElement>(null);
  const replaceAt = useRef<number | null>(null);

  const setApp = useCallback(
    (patch: Partial<AppData["app"]>) => updateMf("app", { ...mf.app, ...patch }),
    [mf.app, updateMf]
  );
  const setShots = useCallback((next: AppScreenshot[]) => updateMf("screenshots", next), [updateMf]);

  const missing = missingFor(mf);

  /* photos */
  const readOne = async (file: File): Promise<string | null> => {
    try {
      return await compressImage(file);
    } catch (e) {
      setPhotoError(e instanceof Error ? e.message : "That photo couldn’t be read.");
      return null;
    }
  };

  const onIconPicked = async (files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    setPhotoError("");
    setBusy(true);
    const url = await readOne(f);
    setBusy(false);
    if (!url) return;
    setApp({ iconUrl: url, iconCropX: CROP_DEFAULT.x, iconCropY: CROP_DEFAULT.y, iconScale: CROP_DEFAULT.scale });
    setAdjusting({ kind: "icon" });
  };

  const onShotsPicked = async (files: FileList | null) => {
    if (!files?.length) return;
    setPhotoError("");
    setBusy(true);
    const replacing = replaceAt.current;
    replaceAt.current = null;
    if (replacing !== null) {
      const url = await readOne(files[0]);
      setBusy(false);
      if (!url) return;
      setShots(mf.screenshots.map((s, i) => (i === replacing ? { ...s, imageUrl: url, cropX: 50, cropY: 50, scale: 100 } : s)));
      setAdjusting({ kind: "shot", index: replacing });
      return;
    }
    const room = MAX_SHOTS - mf.screenshots.length;
    const added: AppScreenshot[] = [];
    for (const f of Array.from(files).slice(0, room)) {
      const url = await readOne(f);
      if (url) added.push({ imageUrl: url, caption: "", cropX: 50, cropY: 50, scale: 100 });
    }
    setBusy(false);
    if (files.length > room) setPhotoError(`Only ${MAX_SHOTS} screenshots fit — the rest were skipped.`);
    if (!added.length) return;
    const next = [...mf.screenshots, ...added];
    setShots(next);
    if (added.length === 1) setAdjusting({ kind: "shot", index: next.length - 1 });
  };

  const adjSrc =
    adjusting?.kind === "icon" ? mf.app.iconUrl : adjusting?.kind === "shot" ? mf.screenshots[adjusting.index]?.imageUrl ?? "" : "";
  const adjCrop: Crop =
    adjusting?.kind === "icon"
      ? photoCrop({ url: "", cropX: mf.app.iconCropX, cropY: mf.app.iconCropY, scale: mf.app.iconScale })
      : adjusting?.kind === "shot" && mf.screenshots[adjusting.index]
        ? photoCrop({ url: "", ...mf.screenshots[adjusting.index] })
        : CROP_DEFAULT;

  const onAdjust = (c: Crop) => {
    if (adjusting?.kind === "icon") setApp({ iconCropX: c.x, iconCropY: c.y, iconScale: c.scale });
    else if (adjusting?.kind === "shot") {
      const i = adjusting.index;
      setShots(mf.screenshots.map((s, j) => (j === i ? { ...s, cropX: c.x, cropY: c.y, scale: c.scale } : s)));
    }
  };

  /* subtitle chips */
  const rel = (mf.app.subtitle.split("·")[0] ?? "").trim();
  const tagline = mf.app.subtitle.includes("·") ? mf.app.subtitle.slice(mf.app.subtitle.indexOf("·") + 1).trim() : "";
  const pickRelation = (r: string) => setApp({ subtitle: tagline ? `${r} · ${tagline}` : r });

  /* lists */
  const setVersion = (i: number, patch: Partial<AppVersion>) =>
    updateMf("versionHistory", mf.versionHistory.map((v, j) => (j === i ? { ...v, ...patch } : v)));
  const addVersion = () => {
    const top = mf.versionHistory[0];
    const bumped = top ? (() => { const n = parseFloat(top.version); return Number.isFinite(n) ? (Math.round((n + 0.1) * 10) / 10).toFixed(1) : ""; })() : "1.0";
    updateMf("versionHistory", [{ version: bumped, date: "", size: "1 human", notes: [] }, ...mf.versionHistory]);
  };
  const setReview = (i: number, patch: Partial<AppReview>) =>
    updateMf("reviews", mf.reviews.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const addReview = () =>
    updateMf("reviews", [
      ...mf.reviews,
      { id: `rv${Date.now().toString(36)}`, author: "", stars: 5 as AppStar, title: "", body: "", ago: "just now", status: "published" },
    ]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <style>{CSS}</style>
          <motion.div
            key="scrim"
            className="es-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditMode(null)}
          />
          <motion.div
            key="sheet"
            className="es"
            role="dialog"
            aria-modal="true"
            aria-label="Edit the listing"
            initial={{ y: "100%", x: 0 }}
            animate={{ y: 0, x: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            <div className="es-top">
              <span className="es-grab" aria-hidden="true" />
              <div>
                <h2>Publish her as an app</h2>
                <p>Two names and you’re done. Everything else is optional.</p>
              </div>
              <button type="button" className="es-x" onClick={() => setEditMode(null)} aria-label="Close">
                <CloseIcon size={15} />
              </button>
            </div>

            <div className="es-scroll">
              {/* 1 — her app */}
              <section className="es-card">
                <div className="es-card-h">
                  <span className="es-num">1</span>
                  <b>
                    Her app<small>Her photo becomes the app icon</small>
                  </b>
                </div>
                <div className="es-iconrow">
                  <button
                    type="button"
                    className="es-icon"
                    onClick={() => (mf.app.iconUrl ? setAdjusting({ kind: "icon" }) : iconInput.current?.click())}
                    aria-label={mf.app.iconUrl ? "Adjust the icon photo" : "Upload her photo"}
                  >
                    {(mf.app.name.trim()[0] ?? "♥").toUpperCase()}
                    {mf.app.iconUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={mf.app.iconUrl}
                        alt=""
                        draggable={false}
                        style={cropStyle(photoCrop({ url: "", cropX: mf.app.iconCropX, cropY: mf.app.iconCropY, scale: mf.app.iconScale }))}
                      />
                    ) : null}
                  </button>
                  <div className="es-btns">
                    <button type="button" className="es-btn pri" onClick={() => iconInput.current?.click()} disabled={busy}>
                      {mf.app.iconUrl ? "Change photo" : "Upload her photo"}
                    </button>
                    {mf.app.iconUrl ? (
                      <>
                        <button type="button" className="es-btn" onClick={() => setAdjusting({ kind: "icon" })}>
                          Move &amp; zoom
                        </button>
                        <button type="button" className="es-btn ghost" onClick={() => setApp({ iconUrl: "" })}>
                          Remove
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
                <Field label="Her name" value={mf.app.name} onChange={(v) => setApp({ name: v })} placeholder="Meera" max={40} required big hint="The app’s name, in big bold letters." />
                <Field label="Your name" value={mf.app.seller} onChange={(v) => setApp({ seller: v })} placeholder="Karan" max={40} required hint="Signs the letter, and shows as the Seller." />
                <div className="es-f">
                  <span className="es-lbl">
                    <span style={{ color: "#3a3a3c", fontWeight: 600 }}>She is your…</span>
                  </span>
                  <div className="es-chips">
                    {RELATIONS.map((r) => (
                      <button key={r} type="button" className={`es-chip${rel.toLowerCase() === r.toLowerCase() ? " is-on" : ""}`} onClick={() => pickRelation(r)}>
                        {r}
                      </button>
                    ))}
                  </div>
                  <input
                    className="es-in"
                    value={mf.app.subtitle}
                    maxLength={120}
                    onChange={(e) => setApp({ subtitle: e.target.value })}
                    placeholder="Girlfriend · Runs on chai"
                    aria-label="Subtitle under her name"
                  />
                  <p className="es-hint">The grey line under her name.</p>
                </div>
              </section>

              {/* 2 — screenshots */}
              <section className="es-card">
                <div className="es-card-h">
                  <span className="es-num">2</span>
                  <b>
                    Screenshots<small>Your photos together — tap one to move &amp; zoom it</small>
                  </b>
                </div>
                <div className="es-shots">
                  {mf.screenshots.map((s, i) => (
                    <div className="es-shot" key={i}>
                      <button
                        type="button"
                        className="es-shot-img"
                        onClick={() => (s.imageUrl ? setAdjusting({ kind: "shot", index: i }) : ((replaceAt.current = i), shotInput.current?.click()))}
                        aria-label={s.imageUrl ? `Move and zoom photo ${i + 1}` : `Add photo ${i + 1}`}
                      >
                        {s.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={s.imageUrl} alt="" draggable={false} style={cropStyle(photoCrop({ url: "", ...s }))} />
                        ) : (
                          <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "#C7C7CC" }}>
                            <HeartIcon size={28} />
                          </span>
                        )}
                        <span className="es-shot-tag">{i + 1}</span>
                        {s.imageUrl ? <span className="es-shot-adj">✥ move &amp; zoom</span> : null}
                      </button>
                      <div className="es-shot-tools">
                        <button type="button" onClick={() => ((replaceAt.current = i), shotInput.current?.click())}>
                          Replace
                        </button>
                        <button type="button" onClick={() => setShots(mf.screenshots.filter((_, j) => j !== i))} aria-label={`Remove photo ${i + 1}`}>
                          Remove
                        </button>
                      </div>
                      <input
                        className="es-in"
                        value={s.caption}
                        maxLength={60}
                        placeholder="Headline, e.g. Steals my hoodies"
                        aria-label={`Headline for photo ${i + 1}`}
                        onChange={(e) => setShots(mf.screenshots.map((x, j) => (j === i ? { ...x, caption: e.target.value } : x)))}
                      />
                    </div>
                  ))}
                  {mf.screenshots.length < MAX_SHOTS ? (
                    <button type="button" className="es-add" onClick={() => ((replaceAt.current = null), shotInput.current?.click())} disabled={busy}>
                      <span style={{ fontSize: 26, lineHeight: 1 }}>+</span>
                      {busy ? "Adding…" : "Add photos"}
                    </button>
                  ) : null}
                </div>
                {photoError ? <p className="es-err">{photoError}</p> : null}
              </section>

              {/* 3 — the letter */}
              <section className="es-card">
                <div className="es-card-h">
                  <span className="es-num">3</span>
                  <b>
                    Your letter 💌<small>Waits in the corner as “1 unread letter” — and opens when she taps OPEN</small>
                  </b>
                </div>
                <Field
                  label="The letter"
                  value={mf.letter}
                  onChange={(v) => updateMf("letter", v)}
                  max={LETTER_MAX}
                  multiline
                  rows={7}
                  showCount
                  placeholder={"Meera,\n\nI made you a listing because…"}
                  hint="Leave a blank line between paragraphs. Your name is added as the signature."
                />
                <button
                  type="button"
                  className="es-toggle"
                  aria-pressed={askFirst}
                  onClick={() => {
                    const next = !askFirst;
                    setAskFirst(next);
                    if (!next) {
                      updateMf("lockQuestion", "");
                    }
                  }}
                >
                  Ask her a question before it opens
                  <span className={`es-switch${askFirst ? " is-on" : ""}`} aria-hidden="true" />
                </button>
                {askFirst ? (
                  <div className="es-row2" style={{ marginTop: 10 }}>
                    <Field label="Question" value={mf.lockQuestion} onChange={(v) => updateMf("lockQuestion", v)} max={140} placeholder="Will you install me back? 🥺" />
                    <Field label="Her “yes” button" value={mf.lockAnswer} onChange={(v) => updateMf("lockAnswer", v)} max={40} placeholder="Already did 💗" hint="The “no” button runs away." />
                  </div>
                ) : null}
              </section>

              <p className="es-more-h">More (optional)</p>

              <Acc title="Listing details" sub="Developer, category, size, price…">
                <Field label="Developer" value={mf.app.developer} onChange={(v) => setApp({ developer: v })} max={80} hint="Who ‘made’ her — e.g. her family." />
                <div className="es-row2">
                  <Field label="Category" value={mf.app.category} onChange={(v) => setApp({ category: v })} max={40} />
                  <Field label="Age rating" value={mf.app.ageRating} onChange={(v) => setApp({ ageRating: v })} max={12} />
                </div>
                <div className="es-row2">
                  <Field label="Size" value={mf.app.size} onChange={(v) => setApp({ size: v })} max={40} />
                  <Field label="Ratings count" value={mf.rating.count} onChange={(v) => updateMf("rating", { ...mf.rating, count: v })} max={24} />
                </div>
                <Field label="Price" value={mf.app.price} onChange={(v) => setApp({ price: v })} max={50} />
                <Field label="Languages" value={mf.app.languages} onChange={(v) => setApp({ languages: v })} max={80} />
                <Field label="Compatibility" value={mf.app.compatibility} onChange={(v) => setApp({ compatibility: v })} max={90} />
              </Acc>

              <Acc title="Description" sub="The listing blurb, then the honest part behind “more”">
                <Lines label="Shown first" value={mf.description.short} onChange={(v) => updateMf("description", { ...mf.description, short: v })} rows={3} hint="Each line is a paragraph." />
                <Lines label="Behind “more”" value={mf.description.full} onChange={(v) => updateMf("description", { ...mf.description, full: v })} rows={5} hint="Each line is a paragraph." />
              </Acc>

              <Acc title="Version history" sub="Your milestones — the newest is “What’s New”">
                <button type="button" className="es-btn" onClick={addVersion} style={{ marginBottom: 10 }}>
                  + New version on top
                </button>
                {mf.versionHistory.map((v, i) => (
                  <div className="es-item" key={i}>
                    <div className="es-item-h">
                      {i === 0 ? "Latest — shows as What’s New" : `Version ${i + 1}`}
                      <button type="button" className="es-btn ghost" style={{ height: 30 }} onClick={() => updateMf("versionHistory", mf.versionHistory.filter((_, j) => j !== i))}>
                        Remove
                      </button>
                    </div>
                    <div className="es-row2">
                      <Field label="Version" value={v.version} onChange={(x) => setVersion(i, { version: x })} max={24} />
                      <Field label="Date" value={v.date} onChange={(x) => setVersion(i, { date: x })} max={48} placeholder="14 February 2025" />
                    </div>
                    <Lines label="Release notes" value={v.notes} onChange={(x) => setVersion(i, { notes: x })} rows={3} />
                  </div>
                ))}
              </Acc>

              <Acc title="Reviews" sub="From her friends — they can also send their own">
                {mf.reviews.map((r, i) => (
                  <div className="es-item" key={r.id}>
                    <div className="es-item-h">
                      {r.status === "pending" ? "Pending review" : `Review ${i + 1}`}
                      <span style={{ display: "flex", gap: 6 }}>
                        {r.status === "pending" ? (
                          <button type="button" className="es-btn" style={{ height: 30 }} onClick={() => setReview(i, { status: "published" })}>
                            Publish
                          </button>
                        ) : null}
                        <button type="button" className="es-btn ghost" style={{ height: 30 }} onClick={() => updateMf("reviews", mf.reviews.filter((_, j) => j !== i))}>
                          Remove
                        </button>
                      </span>
                    </div>
                    <div className="es-stars" role="group" aria-label="Stars">
                      {([1, 2, 3, 4, 5] as const).map((n) => (
                        <button key={n} type="button" className={r.stars >= n ? "is-on" : ""} onClick={() => setReview(i, { stars: n })} aria-label={`${n} stars`}>
                          ★
                        </button>
                      ))}
                    </div>
                    <div className="es-row2">
                      <Field label="Friend’s nickname" value={r.author} onChange={(x) => setReview(i, { author: x })} max={APP_REVIEW_LIMITS.author} />
                      <Field label="When" value={r.ago} onChange={(x) => setReview(i, { ago: x })} max={24} />
                    </div>
                    <Field label="Headline" value={r.title} onChange={(x) => setReview(i, { title: x })} max={120} />
                    <Field label="Review" value={r.body} onChange={(x) => setReview(i, { body: x })} max={600} multiline rows={3} />
                    <Field
                      label="Your reply (Developer Response)"
                      value={r.developerResponse?.text ?? ""}
                      onChange={(x) => setReview(i, { developerResponse: x ? { text: x, ago: r.developerResponse?.ago || "1d ago" } : undefined })}
                      max={800}
                      multiline
                      rows={2}
                    />
                  </div>
                ))}
                <button type="button" className="es-btn" onClick={addReview}>
                  + Add a review
                </button>
              </Acc>

              <Acc title="In-app purchases & privacy" sub="Hugs, kisses, and what you keep track of">
                <Lines label="In-app purchases" value={mf.iap} onChange={(v) => updateMf("iap", v)} rows={5} hint="Write ‘item · price’, e.g. Forehead kiss · Free." />
                <Lines label="Data used to track her" value={mf.privacy.tracked} onChange={(v) => updateMf("privacy", { ...mf.privacy, tracked: v })} rows={3} />
                <Lines label="Data linked to her" value={mf.privacy.linked} onChange={(v) => updateMf("privacy", { ...mf.privacy, linked: v })} rows={4} />
              </Acc>

              <Acc title="Her friends & password" sub="The review-link prompt, and an optional lock">
                <Field label="What her friends see" value={mf.contributorPrompt} onChange={(v) => updateMf("contributorPrompt", v)} max={240} multiline rows={2} hint="Shown on the review link you can send to her friends after publishing." />
                <Field label="Password (optional)" value={pagePassword} onChange={setPagePassword} max={128} hint="She’ll need it to open the listing." />
              </Acc>
            </div>

            <div className="es-foot">
              <p className={missing.length ? "is-missing" : ""}>
                {missing.length ? `Still needed: ${missing.join(" and ")}.` : "Looks perfect. Save to see her listing."}
              </p>
              <button type="button" className={`es-save${missing.length ? " is-dim" : ""}`} onClick={onSave} disabled={saving}>
                Save &amp; preview
              </button>
            </div>
          </motion.div>

          <input ref={iconInput} type="file" accept="image/*" className="sr-only" aria-hidden tabIndex={-1} onChange={(e) => { void onIconPicked(e.target.files); e.target.value = ""; }} />
          <input ref={shotInput} type="file" accept="image/*" multiple className="sr-only" aria-hidden tabIndex={-1} onChange={(e) => { void onShotsPicked(e.target.files); e.target.value = ""; }} />

          <PhotoAdjuster
            open={adjusting !== null && !!adjSrc}
            src={adjSrc}
            crop={adjCrop}
            title={adjusting?.kind === "icon" ? "Frame her icon" : `Frame photo ${adjusting?.kind === "shot" ? adjusting.index + 1 : ""}`}
            onChange={onAdjust}
            onClose={() => setAdjusting(null)}
            onReplace={() => {
              if (adjusting?.kind === "icon") iconInput.current?.click();
              else if (adjusting?.kind === "shot") {
                replaceAt.current = adjusting.index;
                shotInput.current?.click();
              }
            }}
          />
        </>
      ) : null}
    </AnimatePresence>
  );
}
