"use client";

// ─── EditSheet — ONE spec-driven form for all eight days ─────────────────────
//
// Sections: Names · <Day> details (the day's FieldSpec list, rendered by kind)
// · Your letter · Photos · Stickers (per GIF slot: ours / your GIF link / hide)
// · Finishing touches (ending line, music, password). A sticky chip nav jumps
// between sections. Themed entirely by the day's tokens (`--vw-*`), mobile-first
// bottom sheet, right-hand panel from 900 px.

import { useId, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PhotosEditor from "../_love/editor/PhotosEditor";
import { normaliseGifUrl } from "../_love/editor/GifPicker";
import type { LovePhoto } from "../_love/types";
import { FONTS, themeVars } from "./theme";
import { VW_FONT_VARS } from "./fonts";
import Sticker from "./kit/Sticker";
import { blankRow, type BoolSpec, type EnumSpec, type FieldSpec, type LeafSpec, type ListSpec, type ObjListSpec, type TextSpec } from "./spec";
import { VW_LIMITS, missingForSave, type DayConfig, type EditMode, type GifSlot, type ValentineDayData } from "./types";

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

function Field({ label, hint, count, required, children, htmlFor }: { label: string; hint?: string; count?: ReactNode; required?: boolean; children: ReactNode; htmlFor?: string }) {
  return (
    <div className="vs-field">
      <label className="vs-label" htmlFor={htmlFor}>
        <span>
          {label}
          {required && <i className="vs-req" aria-label="required">*</i>}
        </span>
        {count}
      </label>
      {children}
      {hint && <span className="vs-hint">{hint}</span>}
    </div>
  );
}


function TextInput({ spec, value, onChange, compact }: { spec: TextSpec; value: string; onChange: (v: string) => void; compact?: boolean }) {
  const id = `vs-${spec.key}${useId().replace(/:/g, "")}`;
  const long = spec.kind === "longtext";
  const input = long ? (
    <textarea id={id} className="vs-input vs-area" rows={spec.rows ?? 3} value={value} maxLength={spec.max} placeholder={spec.placeholder} onChange={(e) => onChange(e.target.value.slice(0, spec.max))} />
  ) : (
    <input
      id={id}
      className="vs-input"
      type={spec.input === "date" ? "date" : "text"}
      value={value}
      maxLength={spec.max}
      placeholder={spec.placeholder}
      onChange={(e) => onChange(e.target.value.slice(0, spec.max))}
    />
  );
  if (compact) return input;
  return (
    <Field label={spec.label} hint={spec.hint} count={spec.input === "date" ? undefined : <Counter n={value.length} max={spec.max} />} htmlFor={id}>
      {input}
      {spec.suggestions && spec.suggestions.length > 0 && (
        <div className="vs-suggest" role="group" aria-label={`Ideas for ${spec.label}`}>
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
                <span className="vs-swatch" style={{ background: o.swatch ?? "#ccc" }} aria-hidden />
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
    <Field label={spec.label} hint={spec.hint}>
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
  return (
    <Field
      label={spec.label}
      hint={spec.hint}
      count={<span className="vs-count">{spec.minItems ? `${filled}/${spec.minItems}+` : `${rows.length}/${spec.maxItems}`}</span>}
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
              <button type="button" className="vs-iconBtn" onClick={() => onChange(rows.filter((_, j) => j !== i))} aria-label={`Remove ${i + 1}`}>
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
  if (spec.kind === "text" || spec.kind === "longtext") return <TextInput spec={spec} value={String(value ?? "")} onChange={onChange} compact={compact} />;
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
  return (
    <Field label={spec.label} hint={spec.hint} count={<span className="vs-count">{spec.minItems ? `${value.length}/${spec.minItems}+` : `${value.length}/${spec.maxItems}`}</span>}>
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
          <input className="vs-input" inputMode="url" value={draft} placeholder="paste a GIPHY / Tenor link" aria-label={`GIF link for ${slot.label}`} onChange={(e) => setDraft(e.target.value)} onBlur={() => draft && apply()} onKeyDown={(e) => e.key === "Enter" && apply()} />
          <button type="button" className="vs-mini" onClick={apply}>Use</button>
        </div>
      )}
      {err && <p className="vs-err">{err}</p>}
    </div>
  );
}

// ─── The sheet ───────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: "names", label: "Names" },
  { id: "details", label: "Details" },
  { id: "letter", label: "Letter" },
  { id: "photos", label: "Photos" },
  { id: "stickers", label: "Stickers" },
  { id: "finish", label: "Finish" },
] as const;

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
  saving: boolean;
}

export default function EditSheet({ day, editMode, setEditMode, mf, updateMf, updateExtra, pagePassword, setPagePassword, onSave, saving }: EditSheetProps) {
  const open = editMode === "manual";
  const bodyRef = useRef<HTMLDivElement>(null);
  const missing = missingForSave(day.slug, mf);
  const t = day.theme;
  const c = day.copy;
  const jump = (id: string) => {
    const el = bodyRef.current?.querySelector(`#vs-sec-${id}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const letterLen = mf.letter.length;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="vs-scrim" className="vs-scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditMode("preview")} />
          <motion.div
            key="vs-sheet"
            className={`vs-sheet ${VW_FONT_VARS}`}
            role="dialog"
            aria-modal="true"
            aria-label={c.sheetTitle}
            style={themeVars(t)}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            <div className="vs-head" style={{ background: t.bg }}>
              <span className="vs-grab" aria-hidden />
              <span className="vs-headEmoji" aria-hidden>{day.emoji}</span>
              <div style={{ minWidth: 0 }}>
                <p className="vs-title">{c.sheetTitle}</p>
                <p className="vs-sub">{c.sheetSub}</p>
              </div>
              <button type="button" className="vs-x" onClick={() => setEditMode("preview")} aria-label="Close">✕</button>
            </div>
            <nav className="vs-nav" aria-label="Sections">
              {SECTIONS.map((s) => (
                <button key={s.id} type="button" onClick={() => jump(s.id)}>
                  {s.id === "details" ? c.extrasTitle : s.label}
                </button>
              ))}
            </nav>

            <div className="vs-body" ref={bodyRef}>
              <section className="vs-sec" id="vs-sec-names">
                <h3 className="vs-secH"><span>1</span> Names</h3>
                <div className="vs-row2">
                  <TextInput spec={{ key: "recipientName", kind: "text", max: VW_LIMITS.name, label: "Their name", placeholder: c.recipientPlaceholder }} value={mf.recipientName} onChange={(v) => updateMf("recipientName", v)} />
                  <TextInput spec={{ key: "senderName", kind: "text", max: VW_LIMITS.name, label: "Your name", placeholder: c.senderPlaceholder }} value={mf.senderName} onChange={(v) => updateMf("senderName", v)} />
                </div>
                <TextInput spec={{ key: "petName", kind: "text", max: VW_LIMITS.petName, label: "What you lovingly call them (optional)", placeholder: c.petNamePlaceholder }} value={mf.petName} onChange={(v) => updateMf("petName", v)} />
              </section>

              <section className="vs-sec" id="vs-sec-details">
                <h3 className="vs-secH"><span>2</span> {c.extrasTitle} <em>{c.extrasSub}</em></h3>
                {day.extras.map((spec) => (
                  <SpecField key={spec.key} spec={spec} value={mf.extras[spec.key]} onChange={(v) => updateExtra(spec.key, v)} />
                ))}
              </section>

              <section className="vs-sec" id="vs-sec-letter">
                <h3 className="vs-secH"><span>3</span> Your letter ✉️</h3>
                <Field label="The letter" required hint={c.letterHint} count={<Counter n={letterLen} max={day.letterMax} />} htmlFor="vs-letter">
                  <textarea id="vs-letter" className="vs-input vs-area vs-letter" rows={9} value={mf.letter} maxLength={day.letterMax} placeholder={c.letterPlaceholder} onChange={(e) => updateMf("letter", e.target.value.slice(0, day.letterMax))} />
                </Field>
                {letterLen > 0 && letterLen < day.letterMin && <p className="vs-err">A few more words — at least {day.letterMin} characters.</p>}
              </section>

              <section className="vs-sec" id="vs-sec-photos">
                <h3 className="vs-secH"><span>4</span> Photos 📸 <em>up to {day.maxPhotos}</em></h3>
                <p className="vs-hint vs-lead">{c.photosHint} Tap a photo to crop &amp; zoom it.</p>
                <PhotosEditor photos={mf.photos} onChange={(v: LovePhoto[]) => updateMf("photos", v.slice(0, day.maxPhotos))} captionHint={c.captionHint} noteHint={c.noteHint} />
                {mf.photos.length >= day.maxPhotos && <p className="vs-hint">That&apos;s the most this page shows ({day.maxPhotos}).</p>}
              </section>

              <section className="vs-sec" id="vs-sec-stickers">
                <h3 className="vs-secH"><span>5</span> Stickers ✨ <em>5 little moments</em></h3>
                <p className="vs-hint vs-lead">Each moment has its own cute sticker. Keep ours, paste your own GIF, or hide it.</p>
                <div className="vs-gifs">
                  {day.gifSlots.map((slot) => (
                    <GifSlotRow key={slot.id} day={day} slot={slot} value={mf.gifs[slot.id] ?? ""} onChange={(v) => updateMf("gifs", { ...mf.gifs, [slot.id]: v })} />
                  ))}
                </div>
              </section>

              <section className="vs-sec" id="vs-sec-finish">
                <h3 className="vs-secH"><span>6</span> Finishing touches</h3>
                <TextInput spec={{ key: "endLine", kind: "text", max: VW_LIMITS.endLine, label: "The very last line", placeholder: c.endLinePlaceholder, hint: c.endLineHint }} value={mf.endLine} onChange={(v) => updateMf("endLine", v)} />
                <Switch label="Soft background music 🎵" hint="A gentle melody that starts when they first tap. They can mute it." value={mf.music} onChange={(v) => updateMf("music", v)} />
                <Field label="Password (optional)" hint="They type it to open your page — something only they'd know." htmlFor="vs-pw">
                  <input id="vs-pw" className="vs-input" value={pagePassword} maxLength={128} placeholder="e.g. the name of your first date spot" onChange={(e) => setPagePassword(e.target.value)} autoComplete="off" />
                </Field>
              </section>
            </div>

            <div className="vs-foot">
              {missing.length > 0 ? <p className="vs-missing">Still needed: {missing.join(", ")}</p> : <p className="vs-ready">✓ Ready — save and watch it once yourself.</p>}
              <button type="button" className="vs-save" onClick={onSave} disabled={saving || missing.length > 0}>
                {saving ? "Saving…" : `Save & preview ${day.emoji}`}
              </button>
            </div>
          </motion.div>

          <style>{`
            .vs-scrim { position: fixed; inset: 0; z-index: 200; background: rgba(30,12,24,.45); }
            .vs-sheet { position: fixed; left: 0; right: 0; bottom: 0; z-index: 201; height: 92dvh; display: flex; flex-direction: column;
              background: var(--vw-paper); color: var(--vw-paper-ink); font-family: ${FONTS.ui};
              border-radius: 26px 26px 0 0; box-shadow: 0 -16px 50px rgba(30,12,24,.3); overflow: hidden; }
            @media (min-width: 900px) { .vs-scrim { background: rgba(30,12,24,.18); } .vs-sheet { left: auto; top: 0; height: 100dvh; width: 560px; border-radius: 28px 0 0 28px; } }
            .vs-head { position: relative; display: flex; align-items: center; gap: 12px; padding: 20px 16px 16px; color: var(--vw-ink); }
            .vs-grab { position: absolute; top: 7px; left: 50%; width: 42px; height: 5px; margin-left: -21px; border-radius: 5px; background: currentColor; opacity: .25; }
            @media (min-width: 900px) { .vs-grab { display: none; } }
            .vs-headEmoji { flex: none; width: 48px; height: 48px; border-radius: 16px; display: grid; place-items: center; font-size: 26px; background: var(--vw-glass); border: 1px solid rgba(255,255,255,.35); }
            .vs-title { margin: 0; font: 700 21px/1.15 ${FONTS.ui}; }
            .vs-sub { margin: 3px 0 0; font-size: 12.5px; line-height: 1.4; color: var(--vw-ink-soft); }
            .vs-x { margin-left: auto; flex: none; width: 40px; height: 40px; border-radius: 50%; border: 0; background: var(--vw-glass); color: var(--vw-ink); cursor: pointer; font-size: 14px; }
            .vs-nav { display: flex; gap: 6px; overflow-x: auto; padding: 10px 14px; border-bottom: 1px solid var(--vw-edge); scrollbar-width: none; background: var(--vw-paper); }
            .vs-nav::-webkit-scrollbar { display: none; }
            .vs-nav button { flex: none; padding: 7px 13px; min-height: 34px; border-radius: 99px; border: 1.5px solid var(--vw-edge); background: transparent; color: var(--vw-paper-ink); font: 600 13px ${FONTS.ui}; cursor: pointer; }
            .vs-nav button:active { background: var(--vw-soft); }
            .vs-body { flex: 1; overflow-y: auto; padding: 4px 16px 28px; overscroll-behavior: contain; scroll-padding-top: 8px; }
            .vs-sec { padding: 18px 0 10px; border-bottom: 2px dashed var(--vw-edge); }
            .vs-sec:last-child { border-bottom: 0; }
            .vs-secH { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin: 0 0 14px; font: 700 17px ${FONTS.ui}; }
            .vs-secH span { width: 28px; height: 28px; border-radius: 10px; display: grid; place-items: center; background: var(--vw-accent); color: var(--vw-accent-ink); font-size: 14px; box-shadow: 0 3px 0 var(--vw-accent-deep); }
            .vs-secH em { font-style: normal; font-weight: 500; font-size: 12.5px; opacity: .65; }
            .vs-row2 { display: grid; gap: 0 12px; }
            @media (min-width: 440px) { .vs-row2 { grid-template-columns: 1fr 1fr; } }
            .vs-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; min-width: 0; }
            .vs-label { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; font-size: 13.5px; font-weight: 700; }
            .vs-req { color: var(--vw-accent-deep); font-style: normal; margin-left: 2px; }
            .vs-count { font-weight: 500; font-size: 11.5px; opacity: .6; font-variant-numeric: tabular-nums; white-space: nowrap; }
            .vs-count.is-near { opacity: 1; color: var(--vw-accent-deep); }
            .vs-hint { font-size: 12.5px; line-height: 1.45; opacity: .72; display: block; }
            .vs-lead { margin: -6px 0 12px; }
            .vs-input { width: 100%; min-width: 0; padding: 12px 14px; border-radius: 14px; border: 2px solid var(--vw-edge); background: #fff; font: 400 16px ${FONTS.ui}; color: var(--vw-paper-ink); outline: none; transition: border-color .15s, box-shadow .15s; }
            .vs-input::placeholder { color: var(--vw-paper-ink); opacity: .42; }
            .vs-input:focus { border-color: var(--vw-accent); box-shadow: 0 0 0 4px var(--vw-soft); }
            .vs-area { resize: vertical; line-height: 1.55; }
            .vs-letter { font-family: ${FONTS.serif}; font-size: 16px; min-height: 200px; }
            .vs-suggest { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 2px; scrollbar-width: none; }
            .vs-suggest::-webkit-scrollbar { display: none; }
            .vs-suggest button { flex: none; max-width: 260px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: 7px 12px; min-height: 34px; border-radius: 99px; border: 1.5px dashed var(--vw-edge); background: transparent; color: var(--vw-paper-ink); font: 500 12.5px ${FONTS.ui}; cursor: pointer; }
            .vs-suggest button.is-on { border-style: solid; border-color: var(--vw-accent); background: var(--vw-soft); }
            .vs-enum { display: flex; flex-wrap: wrap; gap: 8px; }
            .vs-enum button { cursor: pointer; font-family: ${FONTS.ui}; color: var(--vw-paper-ink); }
            .vs-enum--chips button { padding: 9px 14px; min-height: 42px; border-radius: 99px; border: 2px solid var(--vw-edge); background: #fff; font-size: 14px; font-weight: 600; }
            .vs-enum--chips button small { font-weight: 400; opacity: .65; }
            .vs-enum--chips button.is-on { border-color: var(--vw-accent); background: var(--vw-soft); }
            .vs-enum--swatches { gap: 10px 6px; }
            .vs-enum--swatches button { width: 64px; display: grid; justify-items: center; gap: 5px; padding: 4px 0; border: 0; background: none; }
            .vs-swatch { width: 44px; height: 44px; border-radius: 50%; box-shadow: inset 0 0 0 1px rgba(0,0,0,.12), 0 4px 10px -4px rgba(0,0,0,.3); transition: transform .15s, box-shadow .15s; }
            .vs-enum--swatches button.is-on .vs-swatch { transform: scale(1.08); box-shadow: 0 0 0 3px #fff, 0 0 0 5px var(--vw-accent), 0 6px 14px -4px rgba(0,0,0,.35); }
            .vs-swatchLabel { font-size: 11.5px; font-weight: 600; }
            .vs-enum--cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); }
            .vs-enum--cards button { display: grid; justify-items: start; gap: 2px; text-align: left; padding: 12px; min-height: 64px; border-radius: 16px; border: 2px solid var(--vw-edge); background: #fff; font-size: 14px; }
            .vs-enum--cards button small { font-size: 11.5px; opacity: .65; line-height: 1.3; }
            .vs-enum--cards button.is-on { border-color: var(--vw-accent); background: var(--vw-soft); }
            .vs-cardEmoji { font-size: 22px; }
            .vs-stepper { display: inline-flex; align-items: center; gap: 4px; padding: 4px; border-radius: 99px; border: 2px solid var(--vw-edge); background: #fff; align-self: flex-start; }
            .vs-stepper button { width: 44px; height: 44px; border-radius: 50%; border: 0; background: var(--vw-soft); color: var(--vw-paper-ink); font-size: 22px; cursor: pointer; }
            .vs-stepper button:disabled { opacity: .35; cursor: default; }
            .vs-stepper output { min-width: 96px; text-align: center; font-size: 14px; }
            .vs-stepper output b { font-size: 20px; }
            .vs-switchRow { width: 100%; display: flex; align-items: center; gap: 12px; padding: 12px 14px; margin-bottom: 16px; border-radius: 16px; border: 2px solid var(--vw-edge); background: #fff; color: var(--vw-paper-ink); text-align: left; cursor: pointer; font-family: ${FONTS.ui}; }
            .vs-switchTx { display: grid; gap: 2px; min-width: 0; }
            .vs-switchTx b { font-size: 14px; }
            .vs-switchTx small { font-size: 12px; opacity: .65; line-height: 1.35; }
            .vs-switch { margin-left: auto; flex: none; width: 50px; height: 30px; border-radius: 99px; background: var(--vw-edge); position: relative; transition: background .2s; }
            .vs-switch i { position: absolute; top: 3px; left: 3px; width: 24px; height: 24px; border-radius: 50%; background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,.2); transition: transform .2s; }
            .vs-switch.is-on { background: var(--vw-accent); }
            .vs-switch.is-on i { transform: translateX(20px); }
            .vs-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
            .vs-listRow { display: flex; align-items: center; gap: 8px; }
            .vs-listN { flex: none; min-width: 28px; height: 28px; padding: 0 4px; border-radius: 9px; display: grid; place-items: center; background: var(--vw-soft); font-weight: 700; font-size: 13px; }
            .vs-listIn { flex: 1; min-width: 0; display: grid; gap: 3px; }
            .vs-listLabel { font-size: 11.5px; font-weight: 600; opacity: .7; }
            .vs-iconBtn { flex: none; width: 34px; height: 34px; border-radius: 11px; border: 2px solid var(--vw-edge); background: #fff; color: var(--vw-paper-ink); cursor: pointer; font-size: 13px; }
            .vs-iconBtn:disabled { opacity: .35; cursor: default; }
            .vs-rows { display: grid; gap: 10px; }
            .vs-rowCard { display: grid; gap: 8px; padding: 12px; border-radius: 18px; border: 2px solid var(--vw-edge); background: color-mix(in srgb, var(--vw-soft) 45%, #fff); }
            .vs-rowHead { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 13.5px; }
            .vs-rowActs { display: flex; gap: 4px; }
            .vs-leaf { display: grid; gap: 4px; }
            .vs-leaf .vs-switchRow { margin-bottom: 0; }
            .vs-leafLabel { display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; opacity: .8; }
            .vs-add { width: 100%; margin-top: 8px; padding: 12px; min-height: 46px; border-radius: 16px; border: 2px dashed var(--vw-accent); background: color-mix(in srgb, var(--vw-soft) 60%, #fff); color: var(--vw-accent-deep); font: 700 14px ${FONTS.ui}; cursor: pointer; }
            .vs-add small { font-weight: 500; opacity: .7; }
            .vs-gifs { display: grid; gap: 10px; }
            .vs-gif { display: grid; gap: 10px; padding: 12px; border-radius: 18px; border: 2px solid var(--vw-edge); background: #fff; }
            .vs-gifTop { display: flex; align-items: center; gap: 12px; }
            .vs-gifPrev { flex: none; width: 60px; height: 60px; border-radius: 14px; display: grid; place-items: center; background: var(--vw-soft); overflow: hidden; }
            .vs-gifHidden { font-size: 26px; opacity: .5; }
            .vs-gifTx { display: grid; gap: 2px; min-width: 0; }
            .vs-gifTx b { font-size: 14px; }
            .vs-gifTx small { font-size: 12px; opacity: .65; line-height: 1.3; }
            .vs-seg { display: grid; grid-template-columns: repeat(3, 1fr); padding: 3px; border-radius: 12px; background: var(--vw-soft); }
            .vs-seg button { min-height: 36px; border: 0; border-radius: 10px; background: transparent; color: var(--vw-paper-ink); font: 600 13px ${FONTS.ui}; cursor: pointer; }
            .vs-seg button.is-on { background: #fff; box-shadow: 0 2px 6px rgba(0,0,0,.1); }
            .vs-gifLink { display: flex; gap: 8px; }
            .vs-mini { flex: none; padding: 0 16px; min-height: 44px; border-radius: 14px; border: 0; background: var(--vw-accent); color: var(--vw-accent-ink); font: 700 14px ${FONTS.ui}; cursor: pointer; }
            .vs-err { margin: 4px 0 0; color: var(--vw-accent-deep); font-weight: 600; font-size: 12.5px; }
            .vs-foot { padding: 12px 16px calc(14px + env(safe-area-inset-bottom, 0px)); border-top: 1px solid var(--vw-edge); background: var(--vw-paper); display: grid; gap: 8px; }
            .vs-missing { margin: 0; font-size: 13px; color: var(--vw-accent-deep); font-weight: 700; }
            .vs-ready { margin: 0; font-size: 13px; font-weight: 700; opacity: .8; }
            .vs-save { min-height: 54px; border-radius: 18px; border: 0; background: var(--vw-accent); color: var(--vw-accent-ink); font: 700 17px ${FONTS.ui}; cursor: pointer; box-shadow: 0 5px 0 var(--vw-accent-deep); transition: transform .12s, box-shadow .12s; }
            .vs-save:active:not(:disabled) { transform: translateY(4px); box-shadow: 0 1px 0 var(--vw-accent-deep); }
            .vs-save:disabled { opacity: .5; cursor: not-allowed; }
          `}</style>
        </>
      )}
    </AnimatePresence>
  );
}
