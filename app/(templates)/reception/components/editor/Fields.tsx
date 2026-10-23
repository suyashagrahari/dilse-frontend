"use client";

// ─── Form pieces for the Reception Night editor ──────────────────────────────
// Big inputs (≥ 48px, 16px text so iOS never zooms), labels above, helper and
// inline validation below. Everything takes plain values + onChange.

import { useId, useRef, useState, type ReactNode } from "react";
import { compressImage } from "../../../dedication/components/mediaUploads";

export function Field({
  label,
  value,
  onChange,
  placeholder,
  help,
  error,
  required,
  max,
  type = "text",
  inputMode,
  lang,
  prefix,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  help?: ReactNode;
  error?: string;
  required?: boolean;
  max?: number;
  type?: "text" | "date" | "time" | "url" | "tel" | "email" | "password";
  inputMode?: "text" | "tel" | "url" | "numeric" | "email";
  lang?: string;
  prefix?: string;
  autoComplete?: string;
}) {
  const id = useId();
  return (
    <div className={`rc-ed-field${error ? " has-error" : ""}`}>
      <label htmlFor={id}>
        {label}
        {required && <b aria-hidden> *</b>}
      </label>
      <div className={`rc-ed-input${prefix ? " has-prefix" : ""}`}>
        {prefix && <span className="rc-ed-prefix">{prefix}</span>}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(max ? e.target.value.slice(0, max) : e.target.value)}
          placeholder={placeholder}
          maxLength={max}
          required={required}
          inputMode={inputMode}
          lang={lang}
          autoComplete={autoComplete ?? "off"}
          aria-invalid={!!error || undefined}
          aria-describedby={help || error ? `${id}-h` : undefined}
        />
      </div>
      {(error || help) && (
        <p id={`${id}-h`} className={error ? "rc-ed-err" : "rc-ed-help"}>
          {error || help}
        </p>
      )}
    </div>
  );
}

export function Area({ label, value, onChange, placeholder, help, max, rows = 4, lang }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; help?: ReactNode; max: number; rows?: number; lang?: string }) {
  const id = useId();
  return (
    <div className="rc-ed-field">
      <label htmlFor={id}>{label}</label>
      <textarea id={id} value={value} rows={rows} onChange={(e) => onChange(e.target.value.slice(0, max))} placeholder={placeholder} maxLength={max} lang={lang} />
      <p className="rc-ed-help rc-ed-help-row">
        <span>{help}</span>
        <span className="rc-ed-count">
          {value.length}/{max}
        </span>
      </p>
    </div>
  );
}

export function Chips({ options, value, onPick, label }: { options: readonly string[]; value: string; onPick: (v: string) => void; label?: string }) {
  return (
    <div className="rc-ed-chips" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o} type="button" className="rc-ed-chip" aria-pressed={value === o} onClick={() => onPick(o)}>
          {o}
        </button>
      ))}
    </div>
  );
}

export function Segmented<T extends string>({ options, value, onChange, label }: { options: { v: T; label: string; lang?: string }[]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div className="rc-ed-field">
      <span className="rc-ed-label">{label}</span>
      <div className="rc-ed-seg" role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button key={o.v} type="button" role="radio" aria-checked={value === o.v} onClick={() => onChange(o.v)} lang={o.lang}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Toggle({ label, help, checked, onChange }: { label: string; help?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="rc-ed-toggle">
      <span>
        <b>{label}</b>
        {help && <small>{help}</small>}
      </span>
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <i aria-hidden />
    </label>
  );
}

export const DRESS_SWATCHES = [
  { c: "#1C1C24", n: "Black tie" },
  { c: "#F3EBDD", n: "Ivory" },
  { c: "#E9CF8E", n: "Champagne gold" },
  { c: "#E86A92", n: "Pink" },
  { c: "#A3122B", n: "Red" },
  { c: "#2E5AAC", n: "Royal blue" },
  { c: "#4F9B6A", n: "Emerald" },
  { c: "#7B3FA0", n: "Purple" },
] as const;

export function Swatches({ value, onChange }: { value: string; onChange: (hex: string) => void }) {
  const id = useId();
  return (
    <div className="rc-ed-field">
      <span className="rc-ed-label">Dress colour</span>
      <div className="rc-ed-swatches" role="radiogroup" aria-label="Dress colour">
        <button type="button" role="radio" aria-checked={!value} className="rc-ed-sw is-auto" onClick={() => onChange("")} title="From the words">
          Auto
        </button>
        {DRESS_SWATCHES.map((s) => (
          <button key={s.c} type="button" role="radio" aria-checked={value.toLowerCase() === s.c.toLowerCase()} className="rc-ed-sw" style={{ background: s.c }} onClick={() => onChange(s.c)} aria-label={s.n} title={s.n} />
        ))}
        <label className="rc-ed-sw is-custom" htmlFor={id} title="Custom colour">
          <input id={id} type="color" value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#B8892E"} onChange={(e) => onChange(e.target.value)} aria-label="Custom colour" />
          <span aria-hidden>+</span>
        </label>
      </div>
    </div>
  );
}

/** Pick a photo: compressed to ≤1400px on the phone (uploaded at publish). */
export function PhotoPick({ src, onPick, onClear, onFrame, label, aspect = 1, round }: { src: string; onPick: (dataUrl: string) => void; onClear?: () => void; onFrame?: () => void; label: string; aspect?: number; round?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const pick = async (f: File | undefined) => {
    if (!f) return;
    setBusy(true);
    setErr("");
    try {
      onPick(await compressImage(f));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "That photo could not be read");
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  };
  return (
    <div className="rc-ed-photo">
      <button type="button" className={`rc-ed-photo-thumb${round ? " is-round" : ""}`} style={{ aspectRatio: String(aspect) }} onClick={() => ref.current?.click()} aria-label={src ? `Change ${label}` : `Add ${label}`}>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" />
        ) : (
          <span className="rc-ed-photo-add" aria-hidden>
            {busy ? "…" : "+"}
          </span>
        )}
      </button>
      <div className="rc-ed-photo-a">
        <b>{label}</b>
        <div className="rc-ed-photo-btns">
          <button type="button" className="rc-ed-btn is-sm" onClick={() => ref.current?.click()} disabled={busy}>
            {busy ? "Adding…" : src ? "Replace" : "Add photo"}
          </button>
          {src && onFrame && (
            <button type="button" className="rc-ed-btn is-sm is-ghost" onClick={onFrame}>
              Frame &amp; zoom
            </button>
          )}
          {src && onClear && (
            <button type="button" className="rc-ed-btn is-sm is-ghost" onClick={onClear}>
              Remove
            </button>
          )}
        </div>
        {err && <p className="rc-ed-err">{err}</p>}
      </div>
      <input ref={ref} type="file" accept="image/*" hidden onChange={(e) => void pick(e.target.files?.[0])} />
    </div>
  );
}

/** A row's own actions: move, duplicate, remove (never in the sticky bar). */
export function RowActions({ i, n, onMove, onDuplicate, onRemove, canDuplicate }: { i: number; n: number; onMove: (to: number) => void; onDuplicate?: () => void; onRemove: () => void; canDuplicate?: boolean }) {
  return (
    <div className="rc-ed-rowa">
      <button type="button" className="rc-ed-icon" onClick={() => onMove(i - 1)} disabled={i === 0} aria-label="Move up">
        ↑
      </button>
      <button type="button" className="rc-ed-icon" onClick={() => onMove(i + 1)} disabled={i === n - 1} aria-label="Move down">
        ↓
      </button>
      {onDuplicate && (
        <button type="button" className="rc-ed-btn is-sm is-ghost" onClick={onDuplicate} disabled={!canDuplicate}>
          Duplicate
        </button>
      )}
      <button type="button" className="rc-ed-btn is-sm is-danger" onClick={onRemove}>
        Remove
      </button>
    </div>
  );
}

export function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [x] = next.splice(from, 1);
  next.splice(to, 0, x);
  return next;
}
