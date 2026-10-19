"use client";

// ─── EditSheet — ONE spec-driven form for all eight days ─────────────────────
//
// Phone: a bottom sheet. Tablet/desktop (≥768px): a centred modal over a
// blurred backdrop; from 1180px it becomes two columns (section nav with
// progress on the left, fields on the right).
//
// Top of the form: "✨ Write it for me with AI" → the guided StoryStarter
// (opened over the form; generated text lands in the fields, all editable).
// Sections: Names · <Day> details (the day's FieldSpec list, rendered by kind) ·
// Your letter · Photos (frame / reorder / caption) · Stickers · Music (off ·
// melody · YouTube song) · Finishing touches. Sticky Save bar with what's still
// missing. Esc / backdrop / ✕ close — with a "keep your changes?" check when
// something changed. Focus is trapped while open, the page behind can't scroll,
// and everything is painted with the day's tokens (`--vw-*`).

import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { normaliseGifUrl } from "../_love/editor/GifPicker";
import type { LovePhoto } from "../_love/types";
import { FONTS, themeVars } from "./theme";
import { VW_FONT_VARS } from "./fonts";
import Sticker from "./kit/Sticker";
import VwPhotos, { PHOTOS_CSS } from "./editor/VwPhotos";
import MusicPicker, { MUSIC_CSS } from "./editor/MusicPicker";
import VoiceNoteRecorder, { VOICE_CSS } from "./editor/VoiceNoteRecorder";
import ChorusPicker, { CHORUS_CSS } from "./editor/ChorusPicker";
import { DayStudio, type StudioProps } from "./editor/studios";
import { coercePremium, formatUnlock, PREMIUM_LIMITS, type PremiumFields } from "./premiumData";
import { premiumTwinOf } from "./days/slugs";
import { useTemplateAccess } from "@/hooks/useTemplateAccess";
import { useDayMusic } from "./music/context";
import { blankRow, extrasMissing, type BoolSpec, type EnumSpec, type FieldSpec, type LeafSpec, type ListSpec, type ObjListSpec, type TextSpec } from "./spec";
import { VW_LIMITS, YOUTUBE_ID_RE, missingForSave, type DayConfig, type EditMode, type GifSlot, type ValentineDayData } from "./types";

type UpdateMf = <K extends keyof ValentineDayData>(key: K, val: ValentineDayData[K]) => void;

// ─── Small building blocks ───────────────────────────────────────────────────

function Counter({ n, max }: { n: number; max: number }) {
  const near = n >= max * 0.9;
  return (
    <span className={`vs-count${near ? " is-near" : ""}`} aria-hidden>
      {n}/{max}
    </span>
  );
}

function Field({ label, hint, count, required, error, children, htmlFor }: { label: string; hint?: string; count?: ReactNode; required?: boolean; error?: string; children: ReactNode; htmlFor?: string }) {
  return (
    <div className={`vs-field${error ? " has-err" : ""}`}>
      <label className="vs-label" htmlFor={htmlFor}>
        <span>
          {label}
          {required && <i className="vs-req" aria-hidden>*</i>}
          {required && <span className="vs-sr"> (required)</span>}
        </span>
        {count}
      </label>
      {children}
      {error ? (
        <span className="vs-err" id={htmlFor ? `${htmlFor}-err` : undefined} role="alert">{error}</span>
      ) : (
        hint && <span className="vs-hint">{hint}</span>
      )}
    </div>
  );
}

function TextInput({
  spec,
  value,
  onChange,
  compact,
  required,
  error,
  onBlur,
}: {
  spec: TextSpec;
  value: string;
  onChange: (v: string) => void;
  compact?: boolean;
  required?: boolean;
  error?: string;
  onBlur?: () => void;
}) {
  const id = `vs-${spec.key}${useId().replace(/:/g, "")}`;
  const long = spec.kind === "longtext";
  const common = {
    id,
    className: `vs-input${long ? " vs-area" : ""}${error ? " is-bad" : ""}`,
    value,
    maxLength: spec.max,
    placeholder: spec.placeholder,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-err` : undefined,
    "aria-required": required || undefined,
    onBlur,
  };
  const input = long ? (
    <textarea {...common} rows={spec.rows ?? 3} onChange={(e) => onChange(e.target.value.slice(0, spec.max))} />
  ) : (
    <input {...common} type={spec.input === "date" ? "date" : "text"} onChange={(e) => onChange(e.target.value.slice(0, spec.max))} />
  );
  if (compact) return input;
  return (
    <Field label={spec.label} hint={spec.hint} required={required} error={error} count={spec.input === "date" ? undefined : <Counter n={value.length} max={spec.max} />} htmlFor={id}>
      {input}
      {spec.suggestions && spec.suggestions.length > 0 && (
        <div className="vs-suggest" role="group" aria-label={`Ideas for ${spec.label}`}>
          <span className="vs-suggestLab" aria-hidden>Ideas</span>
          {spec.suggestions.map((s) => (
            <button key={s} type="button" className={value === s ? "is-on" : ""} onClick={() => onChange(s.slice(0, spec.max))}>
              {s}
            </button>
          ))}
        </div>
      )}
    </Field>
  );
}

function EnumInput({ spec, value, onChange, compact }: { spec: EnumSpec; value: string; onChange: (v: string) => void; compact?: boolean }) {
  const display = spec.display ?? "chips";
  const current = spec.options.find((o) => o.value === value);
  const group = (
    <div className={`vs-enum vs-enum--${display}`} role="radiogroup" aria-label={spec.label}>
      {spec.options.map((o) => {
        const on = o.value === value;
        return (
          <button key={o.value} type="button" role="radio" aria-checked={on} className={on ? "is-on" : ""} onClick={() => onChange(o.value)} title={o.hint}>
            {display === "swatches" ? (
              <>
                <span className="vs-swatch" style={{ background: o.swatch ?? "#ccc" }} aria-hidden>
                  {on && <span className="vs-swatchTick">✓</span>}
                </span>
                <span className="vs-swatchLabel">{o.label}</span>
              </>
            ) : display === "cards" ? (
              <>
                {o.emoji && <span className="vs-cardEmoji" aria-hidden>{o.emoji}</span>}
                <b>{o.label}</b>
                {o.hint && <small>{o.hint}</small>}
              </>
            ) : (
              <>
                {o.emoji && <span aria-hidden>{o.emoji} </span>}
                {o.label}
                {o.hint && !compact && <small> · {o.hint}</small>}
              </>
            )}
          </button>
        );
      })}
    </div>
  );
  if (compact) return group;
  return (
    <Field label={spec.label} hint={display === "swatches" && current?.hint ? `“${current.hint}”` : spec.hint}>
      {group}
    </Field>
  );
}

function NumberInput({ spec, value, onChange }: { spec: Extract<LeafSpec, { kind: "number" }>; value: number; onChange: (v: number) => void }) {
  const step = spec.step ?? 1;
  const set = (n: number) => onChange(Math.min(spec.max, Math.max(spec.min, n)));
  return (
    <Field label={spec.label} hint={spec.hint ?? `Between ${spec.min} and ${spec.max}.`}>
      <div className="vs-stepper">
        <button type="button" onClick={() => set(value - step)} disabled={value <= spec.min} aria-label={`Fewer ${spec.unit ?? ""}`}>−</button>
        <output aria-live="polite">
          <b>{value}</b> {spec.unit}
        </output>
        <button type="button" onClick={() => set(value + step)} disabled={value >= spec.max} aria-label={`More ${spec.unit ?? ""}`}>+</button>
      </div>
    </Field>
  );
}

function Switch({ label, hint, value, onChange }: { label: string; hint?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={value} className="vs-switchRow" onClick={() => onChange(!value)}>
      <span className="vs-switchTx">
        <b>{label}</b>
        {hint && <small>{hint}</small>}
      </span>
      <span className={`vs-switch${value ? " is-on" : ""}`} aria-hidden>
        <i />
      </span>
    </button>
  );
}

function ListInput({ spec, value, onChange }: { spec: ListSpec; value: string[]; onChange: (v: string[]) => void }) {
  const fixed = !!spec.itemLabels;
  const rows = fixed ? spec.itemLabels!.map((_, i) => value[i] ?? "") : value;
  const ph = (i: number) => (Array.isArray(spec.itemPlaceholder) ? spec.itemPlaceholder[i] ?? spec.itemPlaceholder[spec.itemPlaceholder.length - 1] : (spec.itemPlaceholder as string | undefined));
  const set = (i: number, v: string) => {
    const next = [...rows];
    next[i] = v.slice(0, spec.itemMax);
    onChange(next);
  };
  const filled = rows.filter((r) => r.trim()).length;
  const short = spec.minItems ? Math.max(0, spec.minItems - filled) : 0;
  return (
    <Field
      label={spec.label}
      hint={spec.hint}
      error={short ? `Add ${short} more — at least ${spec.minItems} make it feel full.` : undefined}
      count={<span className="vs-count">{spec.minItems ? `${filled} of ${spec.minItems}+` : `${rows.length}/${spec.maxItems}`}</span>}
    >
      <ol className="vs-list">
        {rows.map((r, i) => (
          <li key={i} className="vs-listRow">
            <span className="vs-listN" aria-hidden>{fixed ? spec.itemLabels![i].split(" ").pop() : i + 1}</span>
            <div className="vs-listIn">
              {fixed && <span className="vs-listLabel">{spec.itemLabels![i]}</span>}
              <input className="vs-input" value={r} maxLength={spec.itemMax} placeholder={ph(i)} aria-label={fixed ? spec.itemLabels![i] : `${spec.label} ${i + 1}`} onChange={(e) => set(i, e.target.value)} />
            </div>
            {!fixed && (
              <button type="button" className="vs-iconBtn" onClick={() => onChange(rows.filter((_, j) => j !== i))} aria-label={`Remove ${spec.label.toLowerCase()} ${i + 1}`}>
                ✕
              </button>
            )}
          </li>
        ))}
      </ol>
      {!fixed && rows.length < spec.maxItems && (
        <button type="button" className="vs-add" onClick={() => onChange([...rows, ""])}>
          {spec.addLabel ?? "+ add"} <small>({rows.length}/{spec.maxItems})</small>
        </button>
      )}
    </Field>
  );
}

function LeafInput({ spec, value, onChange, compact }: { spec: LeafSpec; value: unknown; onChange: (v: unknown) => void; compact?: boolean }) {
  if (spec.kind === "text" || spec.kind === "longtext") {
    const v = String(value ?? "");
    const err = spec.min && !compact && v.trim().length > 0 && v.trim().length < spec.min ? `A little more — at least ${spec.min} characters.` : undefined;
    return <TextInput spec={spec} value={v} onChange={onChange} compact={compact} required={!!spec.min} error={err} />;
  }
  if (spec.kind === "enum") return <EnumInput spec={spec} value={String(value ?? spec.default)} onChange={onChange} compact={compact} />;
  if (spec.kind === "number") return <NumberInput spec={spec} value={typeof value === "number" ? value : spec.default} onChange={onChange} />;
  const b = spec as BoolSpec;
  return <Switch label={b.label} hint={b.hint} value={typeof value === "boolean" ? value : b.default} onChange={onChange} />;
}

function ObjListInput({ spec, value, onChange }: { spec: ObjListSpec; value: Record<string, unknown>[]; onChange: (v: Record<string, unknown>[]) => void }) {
  const patch = (i: number, k: string, v: unknown) => onChange(value.map((row, j) => (j === i ? { ...row, [k]: v } : row)));
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const n = [...value];
    [n[i], n[j]] = [n[j], n[i]];
    onChange(n);
  };
  const short = spec.minItems ? Math.max(0, spec.minItems - value.length) : 0;
  return (
    <Field
      label={spec.label}
      hint={spec.hint}
      error={short ? `Add ${short} more ${(spec.itemTitle ?? "item").toLowerCase()}${short > 1 ? "s" : ""}.` : undefined}
      count={<span className="vs-count">{spec.minItems ? `${value.length} of ${spec.minItems}+` : `${value.length}/${spec.maxItems}`}</span>}
    >
      <div className="vs-rows">
        {value.map((row, i) => (
          <div key={i} className="vs-rowCard">
            <div className="vs-rowHead">
              <b>{spec.itemTitle ?? "Item"} {i + 1}</b>
              <span className="vs-rowActs">
                <button type="button" className="vs-iconBtn" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">↑</button>
                <button type="button" className="vs-iconBtn" onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label="Move down">↓</button>
                <button type="button" className="vs-iconBtn" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label={`Remove ${spec.itemTitle ?? "item"} ${i + 1}`}>✕</button>
              </span>
            </div>
            {spec.item.map((leaf) => (
              <div key={leaf.key} className="vs-leaf">
                {(leaf.kind === "text" || leaf.kind === "longtext") && (
                  <span className="vs-leafLabel">
                    {leaf.label} <Counter n={String(row[leaf.key] ?? "").length} max={leaf.max} />
                  </span>
                )}
                {leaf.kind === "enum" && <span className="vs-leafLabel">{leaf.label}</span>}
                <LeafInput spec={leaf} value={row[leaf.key]} onChange={(v) => patch(i, leaf.key, v)} compact />
              </div>
            ))}
          </div>
        ))}
      </div>
      {value.length < spec.maxItems && (
        <button type="button" className="vs-add" onClick={() => onChange([...value, blankRow(spec)])}>
          {spec.addLabel ?? "+ add"} <small>({value.length}/{spec.maxItems})</small>
        </button>
      )}
    </Field>
  );
}

function SpecField({ spec, value, onChange }: { spec: FieldSpec; value: unknown; onChange: (v: unknown) => void }) {
  if (spec.kind === "list") return <ListInput spec={spec} value={Array.isArray(value) ? (value as string[]) : []} onChange={onChange} />;
  if (spec.kind === "objlist") return <ObjListInput spec={spec} value={Array.isArray(value) ? (value as Record<string, unknown>[]) : []} onChange={onChange} />;
  return <LeafInput spec={spec} value={value} onChange={onChange} />;
}

function GifSlotRow({ day, slot, value, onChange }: { day: DayConfig; slot: GifSlot; value: string; onChange: (v: string) => void }) {
  const mode: "ours" | "link" | "none" = value === "none" ? "none" : value ? "link" : "ours";
  const [linkOpen, setLinkOpen] = useState(mode === "link");
  const [draft, setDraft] = useState(mode === "link" ? value : "");
  const [err, setErr] = useState("");
  const shown = linkOpen || mode === "link";
  const apply = () => {
    const url = normaliseGifUrl(draft);
    if (!url || url.length > VW_LIMITS.gifUrl) return setErr("Paste an https link to a GIF (GIPHY or Tenor works)");
    setErr("");
    onChange(url);
  };
  return (
    <div className="vs-gif">
      <div className="vs-gifTop">
        <span className="vs-gifPrev" aria-hidden>
          {mode === "none" ? <span className="vs-gifHidden">🙈</span> : <Sticker slug={day.slug} slot={slot} value={value} size={56} alt="" />}
        </span>
        <span className="vs-gifTx">
          <b>{slot.label}</b>
          <small>{slot.moment}</small>
        </span>
      </div>
      <div className="vs-seg" role="radiogroup" aria-label={`${slot.label} sticker`}>
        <button type="button" role="radio" aria-checked={mode === "ours" && !shown} className={mode === "ours" && !shown ? "is-on" : ""} onClick={() => { setLinkOpen(false); setErr(""); onChange(""); }}>
          Ours
        </button>
        <button type="button" role="radio" aria-checked={shown} className={shown ? "is-on" : ""} onClick={() => setLinkOpen(true)}>
          My GIF
        </button>
        <button type="button" role="radio" aria-checked={mode === "none"} className={mode === "none" ? "is-on" : ""} onClick={() => { setLinkOpen(false); setErr(""); onChange("none"); }}>
          Hide
        </button>
      </div>
      {shown && (
        <div className="vs-gifLink">
          <input className={`vs-input${err ? " is-bad" : ""}`} inputMode="url" value={draft} placeholder="paste a GIPHY / Tenor link" aria-label={`GIF link for ${slot.label}`} onChange={(e) => setDraft(e.target.value)} onBlur={() => draft && apply()} onKeyDown={(e) => e.key === "Enter" && apply()} />
          <button type="button" className="vs-mini" onClick={apply}>Use</button>
        </div>
      )}
      {err && <p className="vs-err">{err}</p>}
    </div>
  );
}

function Ring({ done, total }: { done: number; total: number }) {
  const r = 17;
  const c = 2 * Math.PI * r;
  return (
    <span className="vs-ring" role="img" aria-label={`${done} of ${total} sections done`}>
      <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden>
        <circle cx="22" cy="22" r={r} fill="none" stroke="currentColor" strokeOpacity=".2" strokeWidth="5" />
        <circle cx="22" cy="22" r={r} fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - done / total)} transform="rotate(-90 22 22)" style={{ transition: "stroke-dashoffset .4s" }} />
      </svg>
      <b>{done}/{total}</b>
    </span>
  );
}

function SecHead({ n, done, title, sub }: { n: number; done: boolean | null; title: ReactNode; sub?: ReactNode }) {
  return (
    <header className="vs-secHead">
      <span className={`vs-secN${done ? " is-done" : ""}`} aria-hidden>{done ? "✓" : n}</span>
      <div style={{ minWidth: 0 }}>
        <h3 className="vs-secH">{title}</h3>
        {sub && <p className="vs-secSub">{sub}</p>}
      </div>
    </header>
  );
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

function useMinWidth(px: number) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${px}px)`);
    const f = () => setOn(mq.matches);
    f();
    mq.addEventListener("change", f);
    return () => mq.removeEventListener("change", f);
  }, [px]);
  return on;
}

/**
 * Scroll ONLY the form body. (scrollIntoView would also scroll the clipped
 * sheet itself and slide the header out of view.)
 */
function scrollToSection(body: HTMLElement | null, id: string) {
  const el = body?.querySelector<HTMLElement>(`#vs-sec-${id}`);
  if (!body || !el) return;
  const top = el.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop - 4;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  body.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
}

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]):not([tabindex="-1"]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

// ─── ✦ Premium: voice note, the drop, unlock time, sealed P.S., replies ──────

const pad2 = (n: number) => String(n).padStart(2, "0");
/** ISO → the value a datetime-local input wants, in this browser's zone. */
const toLocalInput = (iso: string) => {
  const d = new Date(iso);
  return Number.isFinite(d.getTime()) ? `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}` : "";
};
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
/** The next midnight that starts the day's own date (31 Oct, 14 Feb…). */
function nextDayMidnight(date: number, month: string): Date | null {
  const m = MONTHS.indexOf(month);
  if (m < 0) return null;
  const now = new Date();
  let d = new Date(now.getFullYear(), m, date, 0, 0, 0);
  if (d.getTime() <= now.getTime()) d = new Date(now.getFullYear() + 1, m, date, 0, 0, 0);
  return d;
}

function PremiumFieldsSection({ day, mf, set }: { day: DayConfig; mf: ValentineDayData; set: (p: Partial<PremiumFields>) => void }) {
  const p = coercePremium(mf.premium);
  const tz = typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata" : "Asia/Kolkata";
  const chip = nextDayMidnight(day.date, day.month);
  return (
    <>
      <Field label="Your voice ✦ (optional)" hint="Up to 60 seconds. They hear it in its own scene, with the music softly lowered.">
        <VoiceNoteRecorder value={p} onChange={(v) => set(v)} />
      </Field>
      <Field label="Under your voice note" hint="Shown under the waveform — and as a typed message if you don't record one." count={<Counter n={p.voiceCaption.length} max={PREMIUM_LIMITS.voiceCaption} />} htmlFor="vs-vcap">
        <input id="vs-vcap" className="vs-input" value={p.voiceCaption} maxLength={PREMIUM_LIMITS.voiceCaption} placeholder="the one line you'd say if you were there" onChange={(e) => set({ voiceCaption: e.target.value })} />
      </Field>
      <Field label="The drop ✦ — where your chorus hits">
        <ChorusPicker value={p.songDropAt} onChange={(songDropAt) => set({ songDropAt })} musicMode={mf.musicMode} musicStart={mf.musicStart} />
      </Field>
      <Field label="Unlock at ✦ (optional)" hint={p.unlockAt ? `Sealed until ${formatUnlock(p.unlockAt, p.unlockTz)}. Before then the link shows only a countdown — no letter, no photos.` : "Leave empty to open right away. Set a time and the link shows a countdown until then."} htmlFor="vs-unlock">
        <div className="vs-chorusRow">
          <input
            id="vs-unlock"
            className="vs-input"
            type="datetime-local"
            style={{ maxWidth: 240 }}
            value={p.unlockAt ? toLocalInput(p.unlockAt) : ""}
            onChange={(e) => {
              const d = new Date(e.target.value);
              set(Number.isFinite(d.getTime()) ? { unlockAt: d.toISOString(), unlockTz: tz } : { unlockAt: "" });
            }}
          />
          {chip && (
            <button type="button" className="vs-ghostBtn" onClick={() => set({ unlockAt: chip.toISOString(), unlockTz: tz })}>
              {day.date} {day.month.slice(0, 3)}, midnight
            </button>
          )}
          {p.unlockAt && <button type="button" className="vs-ghostBtn" onClick={() => set({ unlockAt: "" })}>Open now</button>}
        </div>
      </Field>
      <Field label="A sealed P.S. ✦ (optional)" hint="Kept folded until they tap it — 'open only if…'." count={<Counter n={p.psLetter.length} max={PREMIUM_LIMITS.psLetter} />} htmlFor="vs-ps">
        <textarea id="vs-ps" className="vs-input vs-area" rows={3} value={p.psLetter} maxLength={PREMIUM_LIMITS.psLetter} placeholder="Open only if you miss me: …" onChange={(e) => set({ psLetter: e.target.value })} />
      </Field>
      <Switch label="Let them write back ✦" hint="A reply box at the end (one reply, up to 280 characters). You'll see it here and get an email." value={p.allowReply} onChange={(allowReply) => set({ allowReply })} />
    </>
  );
}

/** On a $2 day: a quiet pointer to its ✦ Premium twin (only when that one is live here). */
function PremiumUpsell({ slug }: { slug: string }) {
  const twin = premiumTwinOf(slug);
  // `blocked`, not `hidden`: a twin that only the seasonal drop opens is still
  // somewhere this link can go.
  const { blocked } = useTemplateAccess();
  if (!twin || blocked.has(twin)) return null;
  return (
    <a className="vs-upsell" href={`/${twin}`}>
      <span className="vs-upsellK">✦ Premium</span>
      <span className="vs-upsellT">Make it cinematic</span>
      <span className="vs-upsellP">Your voice, a song that drops at the chorus, 12 photos as a film reel, a sealed P.S. and a reply from them.</span>
      <span className="vs-upsellGo" aria-hidden>→</span>
    </a>
  );
}

// ─── The sheet ───────────────────────────────────────────────────────────────

type SectionId = "names" | "details" | "letter" | "photos" | "stickers" | "music" | "premium" | "finish";

export interface EditSheetProps {
  day: DayConfig;
  editMode: EditMode;
  setEditMode: (m: EditMode) => void;
  mf: ValentineDayData;
  updateMf: UpdateMf;
  updateExtra: (key: string, val: unknown) => void;
  pagePassword: string;
  setPagePassword: (v: string) => void;
  onSave: () => void;
  /** Close throwing away what changed since the form opened. */
  onDiscard: () => void;
  saving: boolean;
  /** The "✨ Write it for me" card (hidden when the template has no AI schema). */
  ai?: { available: boolean; onOpen: () => void };
  /** Passed through to a studio with its own AI box (DayConfig.studioAi): the story-fill hook. */
  fill?: StudioProps["fill"];
}

export default function EditSheet({ day, editMode, setEditMode, mf, updateMf, updateExtra, pagePassword, setPagePassword, onSave, onDiscard, saving, ai, fill }: EditSheetProps) {
  const open = editMode === "manual";
  const modal = useMinWidth(768);
  const wide = useMinWidth(1180);
  const music = useDayMusic();
  const dialogRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const snapshot = useRef<string>("");
  const snapPw = useRef("");
  const [confirm, setConfirm] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [active, setActive] = useState<SectionId>("names");
  const [tried, setTried] = useState(false);
  const titleId = useId().replace(/:/g, "");
  const missing = missingForSave(day.slug, mf);
  const t = day.theme;
  const c = day.copy;
  const letterLen = mf.letter.length;

  // ── Open / close bookkeeping: snapshot, scroll lock, focus in & back out ────
  useEffect(() => {
    if (!open) return;
    snapshot.current = JSON.stringify(mf);
    snapPw.current = pagePassword;
    setConfirm(false);
    setTouched({});
    setTried(false);
    const prevFocus = document.activeElement as HTMLElement | null;
    const body = document.body;
    const prevOverflow = body.style.overflow;
    body.style.overflow = "hidden";
    const f = window.setTimeout(() => dialogRef.current?.focus({ preventScroll: true }), 30);
    return () => {
      window.clearTimeout(f);
      body.style.overflow = prevOverflow;
      prevFocus?.focus?.({ preventScroll: true });
    };
    // Snapshot only when it opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const dirty = useCallback(() => JSON.stringify(mf) !== snapshot.current || pagePassword !== snapPw.current, [mf, pagePassword]);

  const requestClose = useCallback(() => {
    if (dirty()) setConfirm(true);
    else setEditMode("preview");
  }, [dirty, setEditMode]);

  const save = useCallback(() => {
    setTried(true);
    if (missing.length) {
      // Jump to the first section with a gap.
      const first = !mf.recipientName.trim() || !mf.senderName.trim() ? "names" : mf.letter.trim().length < day.letterMin ? "letter" : extrasMissing(day.extras, mf.extras).length ? "details" : "music";
      scrollToSection(bodyRef.current, first);
      setTouched({ recipientName: true, senderName: true, letter: true });
      return;
    }
    onSave();
    // The Save tap is a user gesture: start their music now so the preview plays it.
    if (mf.musicMode !== "off") music?.start();
  }, [missing.length, mf, day, onSave, music]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      if (confirm) setConfirm(false);
      else requestClose();
      return;
    }
    if (e.key !== "Tab" || !dialogRef.current) return;
    const nodes = [...dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((n) => n.offsetParent !== null || n === document.activeElement);
    if (!nodes.length) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  // ── Section status + "you are here" ────────────────────────────────────────
  // A studio that is the form keeps only some of the plain sections (DayConfig.formSections),
  // numbered on from the studio's own steps (DayConfig.formStart).
  const keep = (id: SectionId) => !day.formSections || (day.formSections as readonly string[]).includes(id);
  const musicOk = mf.musicMode !== "youtube" || YOUTUBE_ID_RE.test(mf.musicYoutubeId);
  const status: Record<SectionId, boolean | null> = useMemo(
    () => ({
      names: !!mf.recipientName.trim() && !!mf.senderName.trim(),
      details: extrasMissing(day.extras, mf.extras).length === 0,
      letter: mf.letter.trim().length >= day.letterMin,
      photos: mf.photos.length > 0,
      stickers: null, // optional
      music: musicOk,
      premium: null, // optional
      finish: !!mf.endLine.trim(),
    }),
    [mf, day, musicOk],
  );
  const counted = ((Object.keys(status) as SectionId[]).filter((k) => keep(k)).map((k) => status[k]).filter((v) => v !== null) as boolean[]);
  const doneCount = counted.filter(Boolean).length;

  const allSections: { id: SectionId; label: string; emoji: string }[] = [
    { id: "names", label: "Names", emoji: "💞" },
    { id: "details", label: c.extrasTitle, emoji: day.emoji },
    { id: "letter", label: "Letter", emoji: "✉️" },
    { id: "photos", label: "Photos", emoji: "📸" },
    { id: "stickers", label: "Stickers", emoji: "✨" },
    { id: "music", label: "Music", emoji: "🎵" },
    ...(day.premium ? [{ id: "premium" as const, label: "Premium ✦", emoji: "✦" }] : []),
    { id: "finish", label: "Finish", emoji: "🎀" },
  ];
  const sections = allSections.filter((s) => keep(s.id));
  const num = (id: SectionId, n: number) => (day.formSections ? (day.formStart ?? 0) + sections.findIndex((s) => s.id === id) + 1 : n);

  useEffect(() => {
    if (!open) return;
    const root = bodyRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((en) => en.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id.replace("vs-sec-", "") as SectionId);
      },
      { root, rootMargin: "0px 0px -60% 0px", threshold: 0 },
    );
    root.querySelectorAll("section[id^='vs-sec-']").forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [open]);

  const jump = (id: SectionId) => {
    setActive(id);
    scrollToSection(bodyRef.current, id);
  };


  const nameErr = (k: "recipientName" | "senderName", label: string) => ((touched[k] || tried) && !mf[k].trim() ? `${label} is needed for the page.` : undefined);
  const letterErr = (touched.letter || tried) && mf.letter.trim().length < day.letterMin
    ? mf.letter.trim().length === 0 ? "Your letter is the heart of the page — write a few lines." : `A few more words — at least ${day.letterMin} characters (${day.letterMin - mf.letter.trim().length} to go).`
    : undefined;

  const motionProps = modal
    ? { initial: { opacity: 0, scale: 0.96, y: 14 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.97, y: 10 }, transition: { type: "spring" as const, stiffness: 380, damping: 32 } }
    : { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" }, transition: { type: "spring" as const, stiffness: 320, damping: 34 } };

  return (
    <AnimatePresence>
      {open && (
        <div key="vs-root" className={`vs-root ${VW_FONT_VARS}`} style={themeVars(t)}>
          <motion.div className="vs-scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={requestClose} aria-hidden />
          <motion.div
            ref={dialogRef}
            className={`vs-sheet${wide ? " is-wide" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${titleId}-t`}
            tabIndex={-1}
            onKeyDown={onKeyDown}
            {...motionProps}
          >
            <div className="vs-head" style={{ background: t.bg }}>
              <span className="vs-grab" aria-hidden />
              <span className="vs-headArt" aria-hidden>{day.emoji}</span>
              <span className="vs-headEmoji" aria-hidden>{day.emoji}</span>
              <div className="vs-headTx">
                <p className="vs-kicker">{day.name}{day.date ? ` · ${day.month.slice(0, 3)} ${day.date}` : ""}{!day.formSections && <span className="vs-kickDone"> · {doneCount} of {counted.length} done</span>}</p>
                <h2 className="vs-title" id={`${titleId}-t`}>{c.sheetTitle}</h2>
                <p className="vs-sub">{c.sheetSub}</p>
              </div>
              {!day.formSections && <Ring done={doneCount} total={counted.length} />}
              <button type="button" className="vs-x" onClick={requestClose} aria-label="Close the form">✕</button>
            </div>

            <div className="vs-main">
              {/* A studio that is the form (formSections) numbers its own steps; the jump list would only show the leftovers. */}
              {!day.formSections && <nav className="vs-nav" aria-label="Form sections">
                <p className="vs-navHead">{doneCount} of {counted.length} done</p>
                {sections.map((s, i) => (
                  <button key={s.id} type="button" onClick={() => jump(s.id)} className={`${active === s.id ? "is-active" : ""}${status[s.id] ? " is-done" : ""}`} aria-current={active === s.id ? "true" : undefined}>
                    <span className="vs-navDot" aria-hidden>{status[s.id] ? "✓" : i + 1}</span>
                    <span className="vs-navLab">{s.label}</span>
                    {status[s.id] === null && <small className="vs-navOpt">optional</small>}
                  </button>
                ))}
              </nav>}

              <div className="vs-body" ref={bodyRef}>
                {ai?.available && !day.studioAi && (
                  <div className="vs-ai">
                    <span className="vs-aiGlow" aria-hidden />
                    <div className="vs-aiTx">
                      <p className="vs-aiK">✨ Short on words?</p>
                      <p className="vs-aiH">Let AI write the first draft</p>
                      <p className="vs-aiP">Answer a few quick questions about you two — we&apos;ll write the letter, the lines and the little notes. You can change every word after.</p>
                    </div>
                    <button type="button" className="vs-aiBtn" onClick={ai.onOpen}>
                      <span aria-hidden>✨</span> Write it for me with AI
                    </button>
                  </div>
                )}

                {!day.premium && !day.studio && <PremiumUpsell slug={day.slug} />}

                {/* The day's own hands-on editor (the bouquet studio…) comes first: it is the heart of the page. */}
                {day.studio && <DayStudio day={day} mf={mf} updateMf={updateMf} updateExtra={updateExtra} ai={ai} fill={fill} />}

                {keep("names") && <section className="vs-sec" id="vs-sec-names" aria-labelledby="vs-h-names">
                  <SecHead n={1} done={status.names} title={<span id="vs-h-names">Names</span>} sub="Who it's for, and who it's from." />
                  <div className="vs-row2">
                    <TextInput
                      spec={{ key: "recipientName", kind: "text", max: VW_LIMITS.name, label: "Their name", placeholder: c.recipientPlaceholder }}
                      value={mf.recipientName}
                      onChange={(v) => updateMf("recipientName", v)}
                      required
                      error={nameErr("recipientName", "Their name")}
                      onBlur={() => setTouched((s) => ({ ...s, recipientName: true }))}
                    />
                    <TextInput
                      spec={{ key: "senderName", kind: "text", max: VW_LIMITS.name, label: "Your name", placeholder: c.senderPlaceholder }}
                      value={mf.senderName}
                      onChange={(v) => updateMf("senderName", v)}
                      required
                      error={nameErr("senderName", "Your name")}
                      onBlur={() => setTouched((s) => ({ ...s, senderName: true }))}
                    />
                  </div>
                  <TextInput spec={{ key: "petName", kind: "text", max: VW_LIMITS.petName, label: "What you lovingly call them (optional)", placeholder: c.petNamePlaceholder, hint: "Leave it empty and we'll use their name." }} value={mf.petName} onChange={(v) => updateMf("petName", v)} />
                </section>}

                {keep("details") && <section className="vs-sec" id="vs-sec-details" aria-labelledby="vs-h-details">
                  <SecHead n={2} done={status.details} title={<span id="vs-h-details">{c.extrasTitle} {day.emoji}</span>} sub={c.extrasSub} />
                  {day.extras.filter((spec) => !spec.hidden).filter((spec) => !spec.showIf || String(mf.extras[spec.showIf.key] ?? "") === spec.showIf.value).map((spec) => (
                    <SpecField key={spec.key} spec={spec} value={mf.extras[spec.key]} onChange={(v) => updateExtra(spec.key, v)} />
                  ))}
                </section>}

                {keep("letter") && <section className="vs-sec" id="vs-sec-letter" aria-labelledby="vs-h-letter">
                  <SecHead n={3} done={status.letter} title={<span id="vs-h-letter">Your letter ✉️</span>} sub={c.letterHint} />
                  <Field label="The letter" required error={letterErr} hint="Tip: one real memory beats ten compliments. Leave a blank line between paragraphs." count={<Counter n={letterLen} max={day.letterMax} />} htmlFor="vs-letter">
                    <textarea
                      id="vs-letter"
                      className={`vs-input vs-area vs-letter${letterErr ? " is-bad" : ""}`}
                      rows={10}
                      value={mf.letter}
                      maxLength={day.letterMax}
                      placeholder={c.letterPlaceholder}
                      aria-required
                      aria-invalid={letterErr ? true : undefined}
                      aria-describedby={letterErr ? "vs-letter-err" : undefined}
                      onBlur={() => setTouched((s) => ({ ...s, letter: true }))}
                      onChange={(e) => updateMf("letter", e.target.value.slice(0, day.letterMax))}
                    />
                  </Field>
                  <div className="vs-meter" aria-hidden>
                    <i style={{ width: `${Math.min(100, (mf.letter.trim().length / Math.max(day.letterMin * 6, 1)) * 100)}%` }} />
                  </div>
                </section>}

                {keep("photos") && <section className="vs-sec" id="vs-sec-photos" aria-labelledby="vs-h-photos">
                  <SecHead n={4} done={status.photos} title={<span id="vs-h-photos">Photos 📸</span>} sub={<>{c.photosHint} Up to {day.maxPhotos} — tap <b>Adjust</b> to drag &amp; zoom each one.</>} />
                  <VwPhotos
                    photos={mf.photos}
                    onChange={(v: LovePhoto[]) => updateMf("photos", v.slice(0, day.maxPhotos))}
                    max={day.maxPhotos}
                    aspect={day.photoAspect}
                    captionHint={c.captionHint}
                    noteHint={c.noteHint}
                    themeStyle={themeVars(t)}
                  />
                </section>}

                {keep("stickers") && <section className="vs-sec" id="vs-sec-stickers" aria-labelledby="vs-h-stickers">
                  <SecHead n={5} done={status.stickers} title={<span id="vs-h-stickers">Stickers ✨</span>} sub="Each moment has its own cute sticker. Keep ours, paste your own GIF, or hide it." />
                  <div className="vs-gifs">
                    {day.gifSlots.map((slot) => (
                      <GifSlotRow key={slot.id} day={day} slot={slot} value={mf.gifs[slot.id] ?? ""} onChange={(v) => updateMf("gifs", { ...mf.gifs, [slot.id]: v })} />
                    ))}
                  </div>
                </section>}

                {keep("music") && <section className="vs-sec" id="vs-sec-music" aria-labelledby="vs-h-music">
                  <SecHead n={num("music", 6)} done={status.music} title={<span id="vs-h-music">Music 🎵</span>} sub="What plays softly while they open it." />
                  <MusicPicker
                    value={mf}
                    suggestions={day.music?.suggestions}
                    suggestionsNote={day.music?.suggestionsNote}
                    audioOnly={!!day.music?.audioOnly}
                    track={day.music?.track}
                    onChange={(p) => {
                      if (p.musicMode !== undefined) {
                        updateMf("musicMode", p.musicMode);
                        updateMf("music", p.musicMode !== "off");
                      }
                      if (p.musicYoutubeId !== undefined) updateMf("musicYoutubeId", p.musicYoutubeId);
                      if (p.musicStart !== undefined) updateMf("musicStart", p.musicStart);
                    }}
                  />
                </section>}

                {day.premium && (
                  <section className="vs-sec" id="vs-sec-premium" aria-labelledby="vs-h-premium">
                    <SecHead n={7} done={status.premium} title={<span id="vs-h-premium">The premium touches ✦</span>} sub="Your voice, the drop, an unlock time, a sealed P.S. and their reply." />
                    <PremiumFieldsSection day={day} mf={mf} set={(patch) => updateMf("premium", { ...coercePremium(mf.premium), ...patch })} />
                  </section>
                )}

                {keep("finish") && <section className="vs-sec" id="vs-sec-finish" aria-labelledby="vs-h-finish">
                  <SecHead n={num("finish", day.premium ? 8 : 7)} done={status.finish} title={<span id="vs-h-finish">Finishing touches 🎀</span>} sub="The last thing they read, and an optional lock." />
                  <TextInput spec={{ key: "endLine", kind: "text", max: VW_LIMITS.endLine, label: "The very last line", placeholder: c.endLinePlaceholder, hint: c.endLineHint }} value={mf.endLine} onChange={(v) => updateMf("endLine", v)} />
                  <Field label="Password (optional)" hint="They type it to open your page — something only they'd know. Leave empty for no lock." htmlFor="vs-pw">
                    <input id="vs-pw" className="vs-input" value={pagePassword} maxLength={128} placeholder="e.g. the name of your first date spot" onChange={(e) => setPagePassword(e.target.value)} autoComplete="off" />
                  </Field>
                </section>}
                <p className="vs-end" aria-hidden>{day.emoji} That&apos;s everything. Save to watch it once yourself.</p>
              </div>
            </div>

            <div className="vs-foot">
              <div className="vs-footTx" aria-live="polite">
                {missing.length > 0 ? (
                  <p className="vs-missing"><span aria-hidden>✎ </span>Still needed: {missing.join(", ")}</p>
                ) : (
                  <p className="vs-ready"><span aria-hidden>✓ </span>Ready! Save to preview it exactly as they&apos;ll see it.</p>
                )}
                <span className="vs-footBar" aria-hidden><i style={{ width: `${(doneCount / counted.length) * 100}%` }} /></span>
              </div>
              <button type="button" className="vs-save" onClick={save} disabled={saving} aria-disabled={missing.length > 0 || undefined}>
                {saving ? "Saving…" : <>Save &amp; preview <span aria-hidden>{day.emoji}</span></>}
              </button>
            </div>

            <AnimatePresence>
              {confirm && (
                <motion.div className="vs-confirmWrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirm(false)}>
                  <motion.div
                    className="vs-confirm"
                    role="alertdialog"
                    aria-modal="true"
                    aria-labelledby="vs-confirm-t"
                    initial={{ scale: 0.94, y: 10 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.96, y: 6 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p className="vs-confirmEmoji" aria-hidden>💌</p>
                    <p className="vs-confirmT" id="vs-confirm-t">Keep your changes?</p>
                    <p className="vs-confirmP">You&apos;ve changed a few things since you opened this.</p>
                    <button type="button" className="vs-save" onClick={() => { setConfirm(false); save(); }} autoFocus>
                      Save &amp; preview
                    </button>
                    <div className="vs-confirmRow">
                      <button type="button" className="vs-ghostBtn" onClick={() => setConfirm(false)}>Keep editing</button>
                      <button type="button" className="vs-ghostBtn is-danger" onClick={() => { setConfirm(false); onDiscard(); }}>Discard changes</button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <style>{SHEET_CSS}{PHOTOS_CSS}{MUSIC_CSS}{day.premium ? VOICE_CSS + CHORUS_CSS : ""}{UPSELL_CSS}</style>
        </div>
      )}
    </AnimatePresence>
  );
}

const SHEET_CSS = `
.vs-root { position: fixed; inset: 0; z-index: 190; display: flex; align-items: flex-end; justify-content: center; font-family: ${FONTS.ui}; }
.vs-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.vs-scrim { position: absolute; inset: 0; background: rgba(30,12,24,.5); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
.vs-sheet { position: relative; width: 100%; height: 94dvh; display: flex; flex-direction: column; outline: none;
  background: var(--vw-paper); color: var(--vw-paper-ink); border-radius: 26px 26px 0 0; box-shadow: 0 -16px 50px rgba(30,12,24,.3); overflow: hidden; overflow: clip; }
@media (min-width: 768px) {
  .vs-root { align-items: center; padding: 24px; }
  .vs-sheet { width: min(760px, 100%); height: min(88vh, 940px); border-radius: 28px; box-shadow: 0 40px 100px -30px rgba(30,12,24,.6), 0 0 0 1px rgba(255,255,255,.4); }
}
@media (min-width: 1180px) { .vs-sheet { width: min(940px, 100%); } }

/* Header */
.vs-head { position: relative; flex: none; display: flex; align-items: center; gap: 14px; padding: 22px 16px 16px; color: var(--vw-ink); overflow: hidden; }
@media (min-width: 768px) { .vs-head { padding: 22px 22px 18px; } }
.vs-grab { position: absolute; top: 8px; left: 50%; width: 42px; height: 5px; margin-left: -21px; border-radius: 5px; background: currentColor; opacity: .25; }
@media (min-width: 768px) { .vs-grab { display: none; } }
.vs-headArt { position: absolute; right: -18px; bottom: -46px; font-size: 150px; line-height: 1; opacity: .13; transform: rotate(-14deg); pointer-events: none; filter: saturate(.8); animation: vs-float 7s ease-in-out infinite; }
@keyframes vs-float { 0%,100% { transform: rotate(-14deg) translateY(0); } 50% { transform: rotate(-10deg) translateY(-6px); } }
.vs-kickDone { display: none; }
@media (max-width: 420px) { .vs-kickDone { display: inline; } }
.vs-headEmoji { position: relative; flex: none; width: 56px; height: 56px; border-radius: 18px; display: grid; place-items: center; font-size: 30px;
  background: var(--vw-glass); border: 1px solid rgba(255,255,255,.45); box-shadow: 0 10px 22px -12px rgba(0,0,0,.45); }
.vs-headTx { position: relative; min-width: 0; flex: 1; }
.vs-kicker { margin: 0; font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--vw-ink-soft); }
.vs-title { margin: 2px 0 0; font: 700 22px/1.15 ${FONTS.ui}; }
@media (min-width: 768px) { .vs-title { font-size: 26px; } }
.vs-sub { margin: 4px 0 0; font-size: 12.5px; line-height: 1.4; color: var(--vw-ink-soft); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.vs-ring { position: relative; flex: none; display: grid; place-items: center; width: 44px; height: 44px; color: var(--vw-ink); }
.vs-ring svg { position: absolute; inset: 0; }
.vs-ring b { font-size: 11px; }
@media (max-width: 420px) { .vs-ring { display: none; } }
.vs-x { position: relative; flex: none; width: 44px; height: 44px; border-radius: 50%; border: 0; background: var(--vw-glass); color: var(--vw-ink); cursor: pointer; font-size: 15px; }
.vs-x:hover { filter: brightness(1.05); }

/* Layout */
.vs-main { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.vs-sheet.is-wide .vs-main { flex-direction: row; }
.vs-nav { flex: none; display: flex; gap: 6px; overflow-x: auto; padding: 10px 14px; border-bottom: 1px solid var(--vw-edge); scrollbar-width: none; background: var(--vw-paper); }
.vs-nav::-webkit-scrollbar { display: none; }
.vs-navHead { display: none; }
.vs-nav button { flex: none; display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px 6px 6px; min-height: 40px; border-radius: 99px; border: 1.5px solid var(--vw-edge); background: transparent; color: var(--vw-paper-ink); font: 600 13px ${FONTS.ui}; cursor: pointer; transition: background .15s, border-color .15s; }
.vs-navDot { width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; font-size: 12px; font-weight: 800; background: var(--vw-soft); }
.vs-nav button.is-done .vs-navDot { background: var(--vw-accent); color: var(--vw-accent-ink); }
.vs-nav button.is-active { border-color: var(--vw-accent); background: color-mix(in srgb, var(--vw-soft) 60%, transparent); }
.vs-navOpt { display: none; }
.vs-sheet.is-wide .vs-nav { flex-direction: column; width: 220px; padding: 18px 12px; gap: 4px; overflow-y: auto; border-bottom: 0; border-right: 1px solid var(--vw-edge); background: color-mix(in srgb, var(--vw-soft) 30%, var(--vw-paper)); }
.vs-sheet.is-wide .vs-navHead { display: block; margin: 0 8px 10px; font-size: 12px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; opacity: .6; }
.vs-sheet.is-wide .vs-nav button { width: 100%; border-color: transparent; border-radius: 14px; padding: 8px 10px; min-height: 46px; text-align: left; }
.vs-sheet.is-wide .vs-nav button.is-active { background: #fff; border-color: var(--vw-edge); box-shadow: 0 6px 16px -10px rgba(0,0,0,.3); }
.vs-sheet.is-wide .vs-navOpt { display: inline; margin-left: auto; font-size: 10.5px; opacity: .55; font-weight: 500; }
.vs-navLab { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.vs-body { flex: 1; min-width: 0; overflow-y: auto; padding: 14px 16px 32px; overscroll-behavior: contain; scroll-padding-top: 12px; }
@media (min-width: 768px) { .vs-body { padding: 18px 28px 40px; } }

/* AI card */
.vs-ai { position: relative; overflow: hidden; display: grid; gap: 12px; padding: 18px; margin: 4px 0 8px; border-radius: 22px; color: #fff;
  background: linear-gradient(135deg, var(--vw-accent) 0%, var(--vw-accent-deep) 100%); box-shadow: 0 16px 34px -18px var(--vw-accent-deep); }
@media (min-width: 640px) { .vs-ai { grid-template-columns: 1fr auto; align-items: center; } }
.vs-aiGlow { position: absolute; right: -40px; top: -60px; width: 200px; height: 200px; border-radius: 50%; background: radial-gradient(circle, rgba(255,255,255,.35), transparent 65%); pointer-events: none; }
.vs-aiTx { position: relative; min-width: 0; }
.vs-aiK { margin: 0; font-size: 11.5px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; opacity: .85; }
.vs-aiH { margin: 2px 0 0; font: 700 19px/1.2 ${FONTS.ui}; }
.vs-aiP { margin: 6px 0 0; font-size: 13px; line-height: 1.45; opacity: .92; }
.vs-aiBtn { position: relative; min-height: 50px; padding: 0 20px; border-radius: 16px; border: 0; background: #fff; color: var(--vw-accent-deep); font: 700 15.5px ${FONTS.ui}; cursor: pointer; white-space: nowrap;
  box-shadow: 0 5px 0 rgba(0,0,0,.18); transition: transform .12s, box-shadow .12s; }
.vs-aiBtn:active { transform: translateY(3px); box-shadow: 0 2px 0 rgba(0,0,0,.18); }

/* Sections */
.vs-sec { padding: 22px 0 8px; border-bottom: 2px dashed var(--vw-edge); scroll-margin-top: 8px; }
.vs-sec:last-of-type { border-bottom: 0; }
.vs-secHead { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 16px; }
.vs-secN { flex: none; width: 32px; height: 32px; border-radius: 11px; display: grid; place-items: center; background: var(--vw-soft); color: var(--vw-accent-deep); font-weight: 800; font-size: 14px; transition: background .2s, color .2s; }
.vs-secN.is-done { background: var(--vw-accent); color: var(--vw-accent-ink); box-shadow: 0 3px 0 var(--vw-accent-deep); }
.vs-secH { margin: 3px 0 0; font: 700 18px/1.2 ${FONTS.ui}; }
.vs-secSub { margin: 3px 0 0; font-size: 12.5px; line-height: 1.45; opacity: .7; }
.vs-end { margin: 22px 0 0; text-align: center; font-size: 13px; opacity: .6; }
.vs-row2 { display: grid; gap: 0 12px; }
@media (min-width: 480px) { .vs-row2 { grid-template-columns: 1fr 1fr; } }

/* Fields */
.vs-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 18px; min-width: 0; }
.vs-label { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; font-size: 13.5px; font-weight: 700; }
.vs-req { color: var(--vw-accent-deep); font-style: normal; margin-left: 3px; }
.vs-count { font-weight: 500; font-size: 11.5px; opacity: .6; font-variant-numeric: tabular-nums; white-space: nowrap; }
.vs-count.is-near { opacity: 1; color: var(--vw-accent-deep); font-weight: 700; }
.vs-hint { font-size: 12.5px; line-height: 1.45; opacity: .72; display: block; }
.vs-input { width: 100%; min-width: 0; min-height: 48px; padding: 12px 14px; border-radius: 14px; border: 2px solid var(--vw-edge); background: #fff; font: 400 16px ${FONTS.ui}; color: var(--vw-paper-ink); outline: none; transition: border-color .15s, box-shadow .15s; }
.vs-input::placeholder { color: var(--vw-paper-ink); opacity: .42; }
.vs-input:focus { border-color: var(--vw-accent); box-shadow: 0 0 0 4px var(--vw-soft); }
.vs-input.is-bad { border-color: #d93a3a; }
.vs-input.is-bad:focus { box-shadow: 0 0 0 4px rgba(217,58,58,.15); }
.vs-area { resize: vertical; line-height: 1.55; }
.vs-letter { font-family: ${FONTS.serif}; font-size: 16.5px; line-height: 1.7; min-height: 240px; padding: 16px 18px; }
.vs-meter { height: 4px; margin: -10px 0 8px; border-radius: 4px; background: var(--vw-soft); overflow: hidden; }
.vs-meter i { display: block; height: 100%; background: var(--vw-accent); border-radius: 4px; transition: width .3s; }
.vs-suggest { display: flex; gap: 6px; overflow-x: auto; padding: 2px 0; scrollbar-width: none; align-items: center; }
.vs-suggest::-webkit-scrollbar { display: none; }
.vs-suggestLab { flex: none; font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; opacity: .55; }
.vs-suggest button { flex: none; max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: 7px 12px; min-height: 36px; border-radius: 99px; border: 1.5px dashed var(--vw-edge); background: transparent; color: var(--vw-paper-ink); font: 500 12.5px ${FONTS.ui}; cursor: pointer; }
.vs-suggest button.is-on { border-style: solid; border-color: var(--vw-accent); background: var(--vw-soft); }
.vs-enum { display: flex; flex-wrap: wrap; gap: 8px; }
.vs-enum button { cursor: pointer; font-family: ${FONTS.ui}; color: var(--vw-paper-ink); transition: border-color .15s, background .15s, transform .15s; }
.vs-enum--chips button { padding: 9px 14px; min-height: 44px; border-radius: 99px; border: 2px solid var(--vw-edge); background: #fff; font-size: 14px; font-weight: 600; }
.vs-enum--chips button small { font-weight: 400; opacity: .65; }
.vs-enum--chips button.is-on { border-color: var(--vw-accent); background: var(--vw-soft); }
.vs-enum--swatches { gap: 10px 4px; }
.vs-enum--swatches button { width: 66px; display: grid; justify-items: center; gap: 5px; padding: 4px 0; border: 0; background: none; border-radius: 12px; }
.vs-swatch { position: relative; width: 46px; height: 46px; border-radius: 50%; display: grid; place-items: center; box-shadow: inset 0 0 0 1px rgba(0,0,0,.12), 0 4px 10px -4px rgba(0,0,0,.3); transition: transform .15s, box-shadow .15s; }
.vs-swatchTick { color: #fff; font-weight: 800; text-shadow: 0 1px 3px rgba(0,0,0,.5); }
.vs-enum--swatches button.is-on .vs-swatch { transform: scale(1.08); box-shadow: 0 0 0 3px #fff, 0 0 0 5px var(--vw-accent), 0 6px 14px -4px rgba(0,0,0,.35); }
.vs-swatchLabel { font-size: 11.5px; font-weight: 600; }
.vs-enum--cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
.vs-enum--cards button { display: grid; justify-items: start; gap: 2px; text-align: left; padding: 12px; min-height: 68px; border-radius: 16px; border: 2px solid var(--vw-edge); background: #fff; font-size: 14px; }
.vs-enum--cards button small { font-size: 11.5px; opacity: .65; line-height: 1.3; }
.vs-enum--cards button.is-on { border-color: var(--vw-accent); background: var(--vw-soft); }
.vs-cardEmoji { font-size: 22px; }
.vs-stepper { display: inline-flex; align-items: center; gap: 4px; padding: 4px; border-radius: 99px; border: 2px solid var(--vw-edge); background: #fff; align-self: flex-start; }
.vs-stepper button { width: 44px; height: 44px; border-radius: 50%; border: 0; background: var(--vw-soft); color: var(--vw-paper-ink); font-size: 22px; cursor: pointer; }
.vs-stepper button:disabled { opacity: .35; cursor: default; }
.vs-stepper output { min-width: 96px; text-align: center; font-size: 14px; }
.vs-stepper output b { font-size: 20px; }
.vs-switchRow { width: 100%; display: flex; align-items: center; gap: 12px; padding: 12px 14px; min-height: 56px; margin-bottom: 18px; border-radius: 16px; border: 2px solid var(--vw-edge); background: #fff; color: var(--vw-paper-ink); text-align: left; cursor: pointer; font-family: ${FONTS.ui}; }
.vs-switchTx { display: grid; gap: 2px; min-width: 0; }
.vs-switchTx b { font-size: 14px; }
.vs-switchTx small { font-size: 12px; opacity: .65; line-height: 1.35; }
.vs-switch { margin-left: auto; flex: none; width: 50px; height: 30px; border-radius: 99px; background: var(--vw-edge); position: relative; transition: background .2s; }
.vs-switch i { position: absolute; top: 3px; left: 3px; width: 24px; height: 24px; border-radius: 50%; background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,.2); transition: transform .2s; }
.vs-switch.is-on { background: var(--vw-accent); }
.vs-switch.is-on i { transform: translateX(20px); }
.vs-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.vs-listRow { display: flex; align-items: center; gap: 8px; }
.vs-listN { flex: none; min-width: 30px; height: 30px; padding: 0 4px; border-radius: 10px; display: grid; place-items: center; background: var(--vw-soft); font-weight: 700; font-size: 13px; }
.vs-listIn { flex: 1; min-width: 0; display: grid; gap: 3px; }
.vs-listLabel { font-size: 11.5px; font-weight: 600; opacity: .7; }
.vs-iconBtn { flex: none; width: 40px; height: 40px; border-radius: 12px; border: 2px solid var(--vw-edge); background: #fff; color: var(--vw-paper-ink); cursor: pointer; font-size: 13px; }
.vs-iconBtn:disabled { opacity: .35; cursor: default; }
.vs-rows { display: grid; gap: 10px; }
.vs-rowCard { display: grid; gap: 8px; padding: 12px; border-radius: 18px; border: 2px solid var(--vw-edge); background: color-mix(in srgb, var(--vw-soft) 45%, #fff); }
.vs-rowHead { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 13.5px; }
.vs-rowActs { display: flex; gap: 4px; }
.vs-leaf { display: grid; gap: 4px; }
.vs-leaf .vs-switchRow { margin-bottom: 0; }
.vs-leafLabel { display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; opacity: .8; }
.vs-add { width: 100%; margin-top: 8px; padding: 12px; min-height: 48px; border-radius: 16px; border: 2px dashed var(--vw-accent); background: color-mix(in srgb, var(--vw-soft) 60%, #fff); color: var(--vw-accent-deep); font: 700 14px ${FONTS.ui}; cursor: pointer; }
.vs-add small { font-weight: 500; opacity: .7; }
.vs-gifs { display: grid; gap: 10px; }
@media (min-width: 768px) { .vs-gifs { grid-template-columns: 1fr 1fr; } }
.vs-gif { display: grid; gap: 10px; padding: 12px; border-radius: 18px; border: 2px solid var(--vw-edge); background: #fff; align-content: start; }
.vs-gifTop { display: flex; align-items: center; gap: 12px; }
.vs-gifPrev { flex: none; width: 60px; height: 60px; border-radius: 14px; display: grid; place-items: center; background: var(--vw-soft); overflow: hidden; }
.vs-gifHidden { font-size: 26px; opacity: .5; }
.vs-gifTx { display: grid; gap: 2px; min-width: 0; }
.vs-gifTx b { font-size: 14px; }
.vs-gifTx small { font-size: 12px; opacity: .65; line-height: 1.3; }
.vs-seg { display: grid; grid-template-columns: repeat(3, 1fr); padding: 3px; border-radius: 12px; background: var(--vw-soft); }
.vs-seg button { min-height: 40px; border: 0; border-radius: 10px; background: transparent; color: var(--vw-paper-ink); font: 600 13px ${FONTS.ui}; cursor: pointer; }
.vs-seg button.is-on { background: #fff; box-shadow: 0 2px 6px rgba(0,0,0,.1); }
.vs-gifLink { display: flex; gap: 8px; }
.vs-mini { flex: none; padding: 0 16px; min-height: 48px; border-radius: 14px; border: 0; background: var(--vw-accent); color: var(--vw-accent-ink); font: 700 14px ${FONTS.ui}; cursor: pointer; }
.vs-err { margin: 2px 0 0; color: #c0262d; font-weight: 600; font-size: 12.5px; line-height: 1.4; }

/* Focus rings everywhere */
.vs-sheet button:focus-visible, .vs-root [role="radio"]:focus-visible, .vs-root [role="switch"]:focus-visible { outline: 3px solid var(--vw-accent-deep); outline-offset: 2px; }

/* Footer */
.vs-foot { flex: none; display: flex; align-items: center; gap: 12px; padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0px)); border-top: 1px solid var(--vw-edge);
  background: color-mix(in srgb, var(--vw-paper) 92%, transparent); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); box-shadow: 0 -10px 24px -18px rgba(0,0,0,.35); }
@media (min-width: 768px) { .vs-foot { padding: 14px 22px; } }
.vs-footTx { flex: 1; min-width: 0; display: grid; gap: 6px; }
.vs-footBar { height: 4px; border-radius: 4px; background: var(--vw-soft); overflow: hidden; }
.vs-footBar i { display: block; height: 100%; background: var(--vw-accent); border-radius: 4px; transition: width .4s; }
.vs-missing { margin: 0; font-size: 12.5px; line-height: 1.35; color: var(--vw-accent-deep); font-weight: 700; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.vs-ready { margin: 0; font-size: 12.5px; line-height: 1.35; font-weight: 700; opacity: .85; }
.vs-save { flex: none; min-height: 54px; padding: 0 22px; border-radius: 18px; border: 0; background: var(--vw-accent); color: var(--vw-accent-ink); font: 700 16.5px ${FONTS.ui}; cursor: pointer; box-shadow: 0 5px 0 var(--vw-accent-deep); transition: transform .12s, box-shadow .12s, opacity .15s; white-space: nowrap; }
.vs-save:active:not(:disabled) { transform: translateY(4px); box-shadow: 0 1px 0 var(--vw-accent-deep); }
.vs-save[aria-disabled="true"] { opacity: .62; }
.vs-save:disabled { opacity: .5; cursor: not-allowed; }

/* Unsaved-changes check */
.vs-confirmWrap { position: absolute; inset: 0; z-index: 5; display: grid; place-items: center; padding: 20px; background: rgba(30,12,24,.45); backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px); }
.vs-confirm { width: min(360px, 100%); display: grid; gap: 10px; padding: 22px; border-radius: 24px; background: var(--vw-paper); text-align: center; box-shadow: 0 30px 70px -20px rgba(0,0,0,.5); }
.vs-confirmEmoji { margin: 0; font-size: 34px; }
.vs-confirmT { margin: 0; font: 700 19px ${FONTS.ui}; }
.vs-confirmP { margin: 0 0 6px; font-size: 13.5px; opacity: .75; }
.vs-confirmRow { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.vs-ghostBtn { min-height: 46px; border-radius: 14px; border: 2px solid var(--vw-edge); background: #fff; color: var(--vw-paper-ink); font: 600 13.5px ${FONTS.ui}; cursor: pointer; }
.vs-ghostBtn.is-danger { color: #b3261e; }

@media (prefers-reduced-motion: reduce) {
  .vs-headArt { animation: none; }
  .vs-root *, .vs-root *::before, .vs-root *::after { transition-duration: .01ms !important; }
}
`;

const UPSELL_CSS = `
.vs-upsell { position: relative; display: grid; gap: 3px; margin: 0 0 18px; padding: 14px 44px 14px 16px; border-radius: 18px; text-decoration: none; color: #3a2505;
  background: linear-gradient(135deg, #fffaf0, #fff1cf); box-shadow: inset 0 0 0 1.5px #e2b44a, 0 10px 24px -18px rgba(120,80,10,.6); }
.vs-upsellK { font-weight: 800; font-size: 10.5px; line-height: 1; letter-spacing: .22em; text-transform: uppercase; color: #a6751c; }
.vs-upsellT { font-weight: 700; font-size: 16px; }
.vs-upsellP { font-size: 13px; line-height: 1.4; opacity: .8; }
.vs-upsellGo { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); font-size: 20px; color: #a6751c; }
.vs-upsell:focus-visible { outline: 3px solid #a6751c; outline-offset: 2px; }
`;
