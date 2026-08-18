"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle, ArrowDown, ArrowUp, Camera, Check, ChevronDown, Eye,
  Loader2, Lock, Plus, Trash2, X,
} from "lucide-react";

import {
  ACCENT, ACCENT_GRAD, BG_CARD, BG_RAISED, CARD_RADIUS, FONT_BODY, FONT_DISPLAY,
  HAIRLINE, TAP, TEXT, TEXT_DIM,
} from "./theme";
import {
  PLAYER, validateSceneGraph,
  type Credit, type EditMode, type LoveflixData, type Row, type RowItem, type Scene,
} from "./types";
import { useReducedMotion } from "./useReducedMotion";
import {
  MAX_CREDITS, MAX_ITEMS_PER_ROW, MAX_MATCH_PERCENT, MAX_PROGRESS, MAX_ROWS,
  MAX_SCENES, MIN_MATCH_PERCENT, MIN_PROGRESS,
  MAX_CHOICE_SECONDS, MIN_CHOICE_SECONDS,
} from "../hooks/useLoveflixEditor";

// The prop contract is frozen — the page and the hook are written against it.
export interface EditSheetProps {
  editMode: EditMode;
  setEditMode: (m: EditMode) => void;
  mf: LoveflixData;
  updateMf: (key: keyof LoveflixData, val: unknown) => void;
  pagePassword: string;
  setPagePassword: (v: string) => void;
  onSave: () => void;
  saving: boolean;
}

/* ── Surfaces ──────────────────────────────────────────────────────────────────
   The sheet sits on the same near-black ramp as the template it is editing, so
   opening it reads as pulling a panel out of the same world rather than dropping
   a light-mode form on top of it. The accent appears exactly twice: the Save
   button and the marker on the validator panel. Nothing else here gets colour.
─────────────────────────────────────────────────────────────────────────────*/

const FIELD_BG = "#0f0f0f";
const SUBTLE = "rgba(255,255,255,0.05)";

/** Above the floating top bar (110) so the bar cannot sit over the sheet. */
const Z_SHEET = 140;

const SHEET_CSS = `
.lfx-in{
  width:100%;
  min-height:${TAP}px;
  padding:11px 12px;
  background:${FIELD_BG};
  color:${TEXT};
  font-family:${FONT_BODY};
  font-size:16px;
  line-height:1.4;
  border:1px solid ${HAIRLINE};
  border-radius:8px;
  outline:none;
  -webkit-appearance:none;
  appearance:none;
  transition:border-color .16s ease, box-shadow .16s ease;
}
.lfx-in::placeholder{ color:#5f5f5f; }
.lfx-in:focus{
  border-color:rgba(255,255,255,0.34);
  box-shadow:0 0 0 3px rgba(255,255,255,0.06);
}
.lfx-in[type="number"]{ -moz-appearance:textfield; }
textarea.lfx-in{ resize:vertical; line-height:1.55; }
select.lfx-in{
  background-image:linear-gradient(45deg,transparent 50%,#8a8a8a 50%),linear-gradient(135deg,#8a8a8a 50%,transparent 50%);
  background-position:calc(100% - 16px) calc(50% + 1px),calc(100% - 11px) calc(50% + 1px);
  background-size:5px 5px,5px 5px;
  background-repeat:no-repeat;
  padding-right:32px;
}
.lfx-btn{
  min-height:${TAP}px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:6px;
  font-family:${FONT_BODY};
  font-size:13px;
  font-weight:600;
  color:${TEXT};
  background:${SUBTLE};
  border:1px solid ${HAIRLINE};
  border-radius:8px;
  padding:0 12px;
  cursor:pointer;
  transition:background .16s ease;
}
.lfx-btn:hover:not(:disabled){ background:rgba(255,255,255,0.09); }
.lfx-btn:disabled{ opacity:.38; cursor:not-allowed; }
.lfx-icon{
  width:${TAP}px;
  height:${TAP}px;
  display:inline-grid;
  place-items:center;
  color:${TEXT_DIM};
  background:transparent;
  border:1px solid ${HAIRLINE};
  border-radius:8px;
  cursor:pointer;
  flex:0 0 auto;
  transition:color .16s ease, background .16s ease;
}
.lfx-icon:hover:not(:disabled){ color:${TEXT}; background:${SUBTLE}; }
.lfx-icon:disabled{ opacity:.3; cursor:not-allowed; }
.lfx-tab{
  min-height:${TAP}px;
  padding:0 14px;
  flex:0 0 auto;
  font-family:${FONT_DISPLAY};
  font-size:14px;
  font-weight:600;
  letter-spacing:.06em;
  text-transform:uppercase;
  color:${TEXT_DIM};
  background:transparent;
  border:0;
  border-bottom:2px solid transparent;
  cursor:pointer;
  white-space:nowrap;
}
.lfx-tab[data-on="true"]{ color:${TEXT}; border-bottom-color:${TEXT}; }
.lfx-scroll::-webkit-scrollbar{ width:0; height:0; }
.lfx-scroll{ scrollbar-width:none; -ms-overflow-style:none; }
`;

/* ── Primitives ────────────────────────────────────────────────────────────── */

function Field({
  label, hint, htmlFor, children,
}: { label: string; hint?: string; htmlFor?: string; children: React.ReactNode }) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        style={{
          display: "block", marginBottom: 6, fontFamily: FONT_BODY, fontSize: 11,
          fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: TEXT_DIM,
        }}
      >
        {label}
      </label>
      {children}
      {hint && (
        <p style={{ margin: "6px 0 0", fontSize: 11.5, lineHeight: 1.5, color: "#7a7a7a" }}>{hint}</p>
      )}
    </div>
  );
}

function SectionHead({ title, note, count }: { title: string; note?: string; count?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 10 }}>
      <div style={{ minWidth: 0 }}>
        <h4
          style={{
            margin: 0, fontFamily: FONT_DISPLAY, fontSize: 19, fontWeight: 700,
            letterSpacing: "0.02em", color: TEXT,
          }}
        >
          {title}
        </h4>
        {note && <p style={{ margin: "4px 0 0", fontSize: 12, lineHeight: 1.5, color: "#7a7a7a" }}>{note}</p>}
      </div>
      {count && (
        <span style={{ flex: "0 0 auto", fontSize: 11.5, fontWeight: 600, color: TEXT_DIM, fontVariantNumeric: "tabular-nums" }}>
          {count}
        </span>
      )}
    </div>
  );
}

/**
 * Numeric input with a local text buffer, so backspacing the field empty does
 * not immediately snap it to the minimum while the user is still mid-number.
 * The committed value is always clamped to the frozen range.
 */
function NumberInput({
  id, value, min, max, onCommit, suffix, ariaLabel,
}: {
  id?: string;
  value: number;
  min: number;
  max: number;
  onCommit: (n: number) => void;
  suffix?: string;
  ariaLabel?: string;
}) {
  const [buf, setBuf] = useState(String(value));
  useEffect(() => { setBuf(String(value)); }, [value]);

  const commit = (raw: string) => {
    if (raw === "") return;
    const n = parseInt(raw, 10);
    if (!Number.isFinite(n)) return;
    onCommit(Math.min(max, Math.max(min, n)));
  };

  return (
    <div style={{ position: "relative" }}>
      <input
        id={id}
        className="lfx-in"
        inputMode="numeric"
        pattern="[0-9]*"
        aria-label={ariaLabel}
        value={buf}
        onChange={(e) => {
          const raw = e.target.value.replace(/[^0-9]/g, "").slice(0, 4);
          setBuf(raw);
          commit(raw);
        }}
        onBlur={() => {
          if (buf === "") { onCommit(min); setBuf(String(min)); }
        }}
        style={suffix ? { paddingRight: 46 } : undefined}
      />
      {suffix && (
        <span
          aria-hidden
          style={{
            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
            fontSize: 12.5, color: TEXT_DIM, pointerEvents: "none",
          }}
        >
          {suffix}
        </span>
      )}
    </div>
  );
}

/** Up / down / delete cluster. Reorder is buttons, not drag — kinder on a phone. */
function RowTools({
  onUp, onDown, onRemove, canUp, canDown, canRemove, what,
}: {
  onUp: () => void; onDown: () => void; onRemove: () => void;
  canUp: boolean; canDown: boolean; canRemove: boolean; what: string;
}) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      <button type="button" className="lfx-icon" onClick={onUp} disabled={!canUp} aria-label={`Move ${what} up`}>
        <ArrowUp size={16} />
      </button>
      <button type="button" className="lfx-icon" onClick={onDown} disabled={!canDown} aria-label={`Move ${what} down`}>
        <ArrowDown size={16} />
      </button>
      <button type="button" className="lfx-icon" onClick={onRemove} disabled={!canRemove} aria-label={`Delete ${what}`}>
        <Trash2 size={16} />
      </button>
    </div>
  );
}

/* ── Helpers ───────────────────────────────────────────────────────────────── */

const move = <T,>(arr: T[], from: number, to: number): T[] => {
  if (to < 0 || to >= arr.length) return arr;
  const next = arr.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

const blankItem = (): RowItem => ({ title: "", imageUrl: "", caption: "", runtime: "", progress: 0 });
const blankRow = (): Row => ({ title: "", kind: "cards", items: [blankItem()] });

/**
 * The next free scene id, derived from the ids already in use.
 * Deterministic on purpose — `Math.random()` is banned in this template, and an
 * id that changes between renders would silently orphan every choice aimed at it.
 */
const nextSceneId = (scenes: Scene[]): string => {
  const used = new Set(scenes.map((s) => s.id));
  for (let n = 1; n <= MAX_SCENES + 2; n++) {
    const id = `s${n}`;
    if (!used.has(id)) return id;
  }
  return `s${scenes.length + 1}`;
};

/** Somewhere safe for a choice to point when its old target has gone away. */
const fallbackTarget = (pool: Scene[]): string => (pool.find((s) => s.isFinale) ?? pool[0])?.id ?? "";

/** A short, human label for a scene in the target dropdowns. */
const sceneLabel = (s: Scene): string => {
  if (s.isFinale) return `${s.id} — the ending`;
  const first = (s.text || "").split("\n").find((l) => l.trim())?.trim() ?? "";
  if (!first) return `${s.id} — (nothing written yet)`;
  return `${s.id} — ${first.length > 42 ? `${first.slice(0, 42)}…` : first}`;
};

/**
 * Square, centre-cropped, downscaled to 256px before it ever reaches the wire.
 * A profile tile is drawn at ~110px, so anything bigger is payload for nothing,
 * and a data URL keeps the canvas same-origin for the recap export.
 */
function photoToDataUrl(file: File, cb: (src: string) => void) {
  if (!file.type.startsWith("image/")) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const S = 256;
      const canvas = document.createElement("canvas");
      canvas.width = S; canvas.height = S;
      const ctx = canvas.getContext("2d");
      if (!ctx) { cb(String(reader.result)); return; }
      const side = Math.min(img.width, img.height);
      ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, S, S);
      try { cb(canvas.toDataURL("image/jpeg", 0.82)); } catch { cb(String(reader.result)); }
    };
    img.onerror = () => cb(String(reader.result));
    img.src = String(reader.result);
  };
  reader.readAsDataURL(file);
}

/* ── Photo field ───────────────────────────────────────────────────────────── */

function PhotoField({
  label, hint, value, initial, onChange,
}: { label: string; hint: string; value: string; initial: string; onChange: (v: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [brokenUrl, setBrokenUrl] = useState("");
  const usable = value !== brokenUrl && (value.startsWith("data:image") || /^https?:\/\/\S+$/i.test(value));
  const isUpload = value.startsWith("data:");

  return (
    <Field label={label} hint={hint}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div
          style={{
            width: 60, height: 60, flex: "0 0 auto", borderRadius: CARD_RADIUS, overflow: "hidden",
            background: BG_CARD, border: `1px solid ${HAIRLINE}`, display: "grid", placeItems: "center",
            color: TEXT_DIM, fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 700,
          }}
        >
          {usable ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value} alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={() => setBrokenUrl(value)}
            />
          ) : (
            <span aria-hidden>{initial}</span>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          <input
            className="lfx-in"
            aria-label={`${label} — image link`}
            value={isUpload ? "" : value}
            onChange={(e) => onChange(e.target.value.trim())}
            placeholder={isUpload ? "photo uploaded" : "https://…"}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="lfx-btn" onClick={() => fileRef.current?.click()}>
              <Camera size={14} /> Upload
            </button>
            {value && (
              <button type="button" className="lfx-btn" onClick={() => onChange("")}>Remove</button>
            )}
          </div>
          <input
            ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) photoToDataUrl(f, onChange);
              e.target.value = "";
            }}
          />
        </div>
      </div>
    </Field>
  );
}

/* ── Collapsible card ──────────────────────────────────────────────────────── */

function Card({
  open, onToggle, heading, sub, tools, children,
}: {
  open: boolean; onToggle: () => void; heading: string; sub: string;
  tools: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div style={{ background: BG_CARD, border: `1px solid ${HAIRLINE}`, borderRadius: 10, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: 8 }}>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          style={{
            flex: 1, minWidth: 0, minHeight: TAP, display: "flex", alignItems: "center", gap: 8,
            background: "transparent", border: 0, padding: "0 4px", cursor: "pointer", textAlign: "left",
          }}
        >
          <ChevronDown
            size={16}
            aria-hidden
            style={{ flex: "0 0 auto", color: TEXT_DIM, transform: open ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform .18s ease" }}
          />
          <span style={{ minWidth: 0 }}>
            <span
              style={{
                display: "block", fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: TEXT,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}
            >
              {heading}
            </span>
            <span
              style={{
                display: "block", fontSize: 11.5, color: "#7a7a7a", marginTop: 1,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}
            >
              {sub}
            </span>
          </span>
        </button>
        {tools}
      </div>
      {open && (
        <div style={{ padding: "4px 10px 12px", display: "flex", flexDirection: "column", gap: 12 }}>
          {children}
        </div>
      )}
    </div>
  );
}

/* ── The catalogue ─────────────────────────────────────────────────────────── */

function ItemEditor({
  item, index, count, onPatch, onMove, onRemove,
}: {
  item: RowItem; index: number; count: number;
  onPatch: (p: Partial<RowItem>) => void;
  onMove: (to: number) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: BG_RAISED, border: `1px solid ${HAIRLINE}`, borderRadius: 8, padding: 8 }}>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <input
          className="lfx-in"
          value={item.title}
          onChange={(e) => onPatch({ title: e.target.value })}
          placeholder="e.g. The Airport"
          aria-label={`Card ${index + 1} title`}
        />
        <button
          type="button"
          className="lfx-icon"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Hide card details" : "Show card details"}
        >
          <ChevronDown size={16} style={{ transform: open ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform .18s ease" }} />
        </button>
      </div>

      {open && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
          <Field label="Caption">
            <input
              className="lfx-in"
              value={item.caption}
              onChange={(e) => onPatch({ caption: e.target.value })}
              placeholder="e.g. You ran. I have never recovered."
            />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="Runtime">
              <input
                className="lfx-in"
                value={item.runtime}
                onChange={(e) => onPatch({ runtime: e.target.value })}
                placeholder="e.g. 8 min"
              />
            </Field>
            <Field label="Progress" hint="0 hides the bar.">
              <NumberInput
                value={item.progress}
                min={MIN_PROGRESS}
                max={MAX_PROGRESS}
                suffix="%"
                ariaLabel={`Card ${index + 1} watch progress`}
                onCommit={(n) => onPatch({ progress: n })}
              />
            </Field>
          </div>
          <Field label="Image link" hint="Leave empty and we draw a card for it — that is the default look, and it is meant to be.">
            <input
              className="lfx-in"
              value={item.imageUrl}
              onChange={(e) => onPatch({ imageUrl: e.target.value.trim() })}
              placeholder="https://…"
            />
          </Field>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <RowTools
              what={`card ${index + 1}`}
              onUp={() => onMove(index - 1)}
              onDown={() => onMove(index + 1)}
              onRemove={onRemove}
              canUp={index > 0}
              canDown={index < count - 1}
              canRemove={count > 1}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function RowEditor({
  row, index, count, onPatch, onMove, onRemove,
}: {
  row: Row; index: number; count: number;
  onPatch: (p: Partial<Row>) => void;
  onMove: (to: number) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const named = row.items.filter((i) => i.title.trim()).length;

  return (
    <Card
      open={open}
      onToggle={() => setOpen((v) => !v)}
      heading={row.title.trim() || `Row ${index + 1}`}
      sub={`${row.kind === "top10" ? "Top 10" : "Cards"} · ${named}/${row.items.length} named`}
      tools={
        <RowTools
          what={`row ${index + 1}`}
          onUp={() => onMove(index - 1)}
          onDown={() => onMove(index + 1)}
          onRemove={onRemove}
          canUp={index > 0}
          canDown={index < count - 1}
          canRemove={count > 1}
        />
      }
    >
      <Field label="Row title">
        <input
          className="lfx-in"
          value={row.title}
          onChange={(e) => onPatch({ title: e.target.value })}
          placeholder="e.g. Continue Watching Us"
        />
      </Field>

      <Field label="Layout" hint="Top 10 draws a huge outlined number behind each card. Use it once — it is the row people screenshot.">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {(["cards", "top10"] as const).map((k) => {
            const on = row.kind === k;
            return (
              <button
                key={k}
                type="button"
                onClick={() => onPatch({ kind: k })}
                aria-pressed={on}
                style={{
                  minHeight: TAP, borderRadius: 8, cursor: "pointer",
                  background: on ? "rgba(255,255,255,0.10)" : "transparent",
                  border: `1px solid ${on ? "rgba(255,255,255,0.32)" : HAIRLINE}`,
                  color: on ? TEXT : TEXT_DIM, fontFamily: FONT_BODY, fontSize: 13.5, fontWeight: 600,
                }}
              >
                {k === "cards" ? "Wide cards" : "Top 10"}
              </button>
            );
          })}
        </div>
      </Field>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <SectionHead title="Cards" count={`${row.items.length}/${MAX_ITEMS_PER_ROW}`} />
        {row.items.map((it, i) => (
          <ItemEditor
            key={`item-${i}`}
            item={it}
            index={i}
            count={row.items.length}
            onPatch={(p) => onPatch({ items: row.items.map((x, ix) => (ix === i ? { ...x, ...p } : x)) })}
            onMove={(to) => onPatch({ items: move(row.items, i, to) })}
            onRemove={() => onPatch({ items: row.items.filter((_, ix) => ix !== i) })}
          />
        ))}
        <button
          type="button"
          className="lfx-btn"
          disabled={row.items.length >= MAX_ITEMS_PER_ROW}
          onClick={() => onPatch({ items: [...row.items, blankItem()] })}
        >
          <Plus size={14} /> Add a card
        </button>
      </div>
    </Card>
  );
}

/* ── The episode ───────────────────────────────────────────────────────────── */

function SceneEditor({
  scene, index, count, allScenes, isStart, onPatch, onMove, onRemove,
}: {
  scene: Scene; index: number; count: number; allScenes: Scene[]; isStart: boolean;
  onPatch: (p: Partial<Scene>) => void;
  onMove: (to: number) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const options = allScenes.filter((s) => s.id !== scene.id);
  const lines = (scene.text || "").split("\n").filter((l) => l.trim()).length;

  const toggleFinale = (next: boolean) => {
    if (next) { onPatch({ isFinale: true, choices: [] }); return; }
    const target = fallbackTarget(options) || scene.id;
    onPatch({
      isFinale: false,
      choices: [{ label: "", nextSceneId: target }, { label: "", nextSceneId: target }],
    });
  };

  return (
    <Card
      open={open}
      onToggle={() => setOpen((v) => !v)}
      heading={`${scene.id}${isStart ? " · opens the episode" : ""}${scene.isFinale ? " · the ending" : ""}`}
      sub={
        scene.text.trim()
          ? `${lines} line${lines === 1 ? "" : "s"} · ${scene.text.trim().slice(0, 40)}${scene.text.trim().length > 40 ? "…" : ""}`
          : "nothing written yet"
      }
      tools={
        <RowTools
          what={`scene ${scene.id}`}
          onUp={() => onMove(index - 1)}
          onDown={() => onMove(index + 1)}
          onRemove={onRemove}
          canUp={index > 0}
          canDown={index < count - 1}
          canRemove={count > 1}
        />
      }
    >
      <Field label="What happens" hint="One thought per line. Each line fades in on its own, so short lines land harder.">
        <textarea
          className="lfx-in"
          rows={4}
          value={scene.text}
          onChange={(e) => onPatch({ text: e.target.value })}
          placeholder={"It's raining, which is not unusual.\nYou're eleven minutes early. You always are."}
        />
      </Field>

      <Field label="Background image" hint="Optional. Empty is fine — we draw the backdrop.">
        <input
          className="lfx-in"
          value={scene.imageUrl}
          onChange={(e) => onPatch({ imageUrl: e.target.value.trim() })}
          placeholder="https://…"
        />
      </Field>

      <button
        type="button"
        onClick={() => toggleFinale(!scene.isFinale)}
        aria-pressed={scene.isFinale}
        style={{
          display: "flex", alignItems: "center", gap: 10, minHeight: TAP, padding: "0 12px",
          borderRadius: 8, cursor: "pointer", textAlign: "left",
          background: scene.isFinale ? "rgba(255,255,255,0.10)" : "transparent",
          border: `1px solid ${scene.isFinale ? "rgba(255,255,255,0.32)" : HAIRLINE}`,
          color: scene.isFinale ? TEXT : TEXT_DIM,
        }}
      >
        <span
          aria-hidden
          style={{
            width: 18, height: 18, borderRadius: 4, display: "grid", placeItems: "center", flex: "0 0 auto",
            border: `1px solid ${scene.isFinale ? "rgba(255,255,255,0.5)" : HAIRLINE}`,
            background: scene.isFinale ? "rgba(255,255,255,0.16)" : "transparent",
          }}
        >
          {scene.isFinale && <Check size={12} />}
        </span>
        <span style={{ fontFamily: FONT_BODY, fontSize: 13.5, fontWeight: 600 }}>
          This is where every path ends
        </span>
      </button>

      {!scene.isFinale && (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[0, 1].map((ci) => {
              const ch = scene.choices[ci] ?? { label: "", nextSceneId: fallbackTarget(options) };
              const setChoice = (patch: Partial<typeof ch>) => {
                const base = [0, 1].map((k) => scene.choices[k] ?? { label: "", nextSceneId: fallbackTarget(options) });
                base[ci] = { ...base[ci], ...patch };
                onPatch({ choices: base });
              };
              return (
                <div
                  key={ci}
                  style={{ background: BG_RAISED, border: `1px solid ${HAIRLINE}`, borderRadius: 8, padding: 10, display: "flex", flexDirection: "column", gap: 8 }}
                >
                  <Field label={`Choice ${ci + 1}`}>
                    <input
                      className="lfx-in"
                      value={ch.label}
                      onChange={(e) => setChoice({ label: e.target.value })}
                      placeholder={ci === 0 ? "e.g. wait outside anyway" : "e.g. go in and take the corner table"}
                    />
                  </Field>
                  <Field label="Then go to" hint={ci === 0 ? "Pick from the scenes you have written. Both choices are allowed to land in the same place." : undefined}>
                    <select
                      className="lfx-in"
                      value={ch.nextSceneId}
                      onChange={(e) => setChoice({ nextSceneId: e.target.value })}
                      aria-label={`Choice ${ci + 1} destination`}
                    >
                      {!options.some((s) => s.id === ch.nextSceneId) && (
                        <option value={ch.nextSceneId}>
                          {ch.nextSceneId ? `${ch.nextSceneId} — missing` : "— pick a scene —"}
                        </option>
                      )}
                      {options.map((s) => (
                        <option key={s.id} value={s.id}>{sceneLabel(s)}</option>
                      ))}
                    </select>
                  </Field>
                </div>
              );
            })}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="Seconds to decide" hint={`${MIN_CHOICE_SECONDS}–${MAX_CHOICE_SECONDS}.`}>
              <NumberInput
                value={scene.choiceSeconds}
                min={MIN_CHOICE_SECONDS}
                max={MAX_CHOICE_SECONDS}
                suffix="s"
                ariaLabel={`Seconds to decide on scene ${scene.id}`}
                onCommit={(n) => onPatch({ choiceSeconds: n })}
              />
            </Field>
            <Field label="If time runs out" hint="Running out is a joke, never a loss.">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[0, 1].map((k) => {
                  const on = scene.defaultChoiceIndex === k;
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => onPatch({ defaultChoiceIndex: k })}
                      aria-pressed={on}
                      aria-label={`Default to choice ${k + 1}`}
                      style={{
                        minHeight: TAP, borderRadius: 8, cursor: "pointer",
                        background: on ? "rgba(255,255,255,0.10)" : "transparent",
                        border: `1px solid ${on ? "rgba(255,255,255,0.32)" : HAIRLINE}`,
                        color: on ? TEXT : TEXT_DIM, fontSize: 13, fontWeight: 600,
                      }}
                    >
                      {k + 1}
                    </button>
                  );
                })}
              </div>
            </Field>
          </div>
        </>
      )}
    </Card>
  );
}

/* ── The sheet ─────────────────────────────────────────────────────────────── */

type Tab = "cast" | "show" | "catalogue" | "episode" | "ending";

const TABS: { key: Tab; label: string }[] = [
  { key: "cast", label: "Cast" },
  { key: "show", label: "Show" },
  { key: "catalogue", label: "Catalogue" },
  { key: "episode", label: "Episode" },
  { key: "ending", label: "Ending" },
];

export default memo(function EditSheet({
  editMode, setEditMode, mf, updateMf, pagePassword, setPagePassword, onSave, saving,
}: EditSheetProps) {
  const visible = editMode === "manual";
  const reduced = useReducedMotion();
  const [tab, setTab] = useState<Tab>("cast");

  // Live graph feedback: the sender fixes a dead end while they are still
  // writing, instead of finding out about it when they press Publish.
  const report = useMemo(
    () => validateSceneGraph(mf.scenes, mf.startSceneId),
    [mf.scenes, mf.startSceneId],
  );

  /* ── scenes ── */
  const patchScene = useCallback((i: number, p: Partial<Scene>) => {
    updateMf("scenes", mf.scenes.map((s, ix) => (ix === i ? { ...s, ...p } : s)));
  }, [mf.scenes, updateMf]);

  const addScene = useCallback(() => {
    if (mf.scenes.length >= MAX_SCENES) return;
    const id = nextSceneId(mf.scenes);
    const target = fallbackTarget(mf.scenes) || id;
    updateMf("scenes", [
      ...mf.scenes,
      {
        id,
        imageUrl: "",
        text: "",
        choices: [{ label: "", nextSceneId: target }, { label: "", nextSceneId: target }],
        choiceSeconds: PLAYER.defaultChoiceSeconds,
        defaultChoiceIndex: 0,
        isFinale: false,
      },
    ]);
  }, [mf.scenes, updateMf]);

  // Deleting a scene repoints anything aimed at it, so removing one link never
  // leaves the rest of the episode pointing at a hole.
  const removeScene = useCallback((i: number) => {
    if (mf.scenes.length <= 1) return;
    const gone = mf.scenes[i].id;
    const rest = mf.scenes.filter((_, ix) => ix !== i);
    const target = fallbackTarget(rest);
    updateMf("scenes", rest.map((s) => ({
      ...s,
      choices: s.choices.map((c) => (c.nextSceneId === gone ? { ...c, nextSceneId: target } : c)),
    })));
    if (mf.startSceneId === gone) updateMf("startSceneId", rest[0]?.id ?? "");
  }, [mf.scenes, mf.startSceneId, updateMf]);

  /* ── credits ── */
  const patchCredit = useCallback((i: number, p: Partial<Credit>) => {
    updateMf("credits", mf.credits.map((c, ix) => (ix === i ? { ...c, ...p } : c)));
  }, [mf.credits, updateMf]);

  const initialOfName = (n: string) => (n.trim() ? Array.from(n.trim())[0].toUpperCase() : "•");

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.1 : 0.2 }}
            onClick={() => setEditMode("preview")}
            style={{ position: "fixed", inset: 0, zIndex: Z_SHEET, background: "rgba(0,0,0,0.72)" }}
          />

          <motion.div
            initial={reduced ? { opacity: 0 } : { y: "100%" }}
            animate={reduced ? { opacity: 1 } : { y: 0 }}
            exit={reduced ? { opacity: 0 } : { y: "100%" }}
            transition={reduced ? { duration: 0.12 } : { type: "spring", stiffness: 300, damping: 32 }}
            role="dialog"
            aria-modal="true"
            aria-label="Write the show"
            style={{
              position: "fixed", left: 0, right: 0, bottom: 0, zIndex: Z_SHEET,
              display: "flex", justifyContent: "center", pointerEvents: "none",
            }}
          >
            <style>{SHEET_CSS}</style>

            <div
              style={{
                pointerEvents: "auto",
                width: "100%",
                maxWidth: 720,
                maxHeight: "88dvh",
                display: "flex",
                flexDirection: "column",
                background: BG_RAISED,
                color: TEXT,
                fontFamily: FONT_BODY,
                borderTop: `1px solid ${HAIRLINE}`,
                borderLeft: `1px solid ${HAIRLINE}`,
                borderRight: `1px solid ${HAIRLINE}`,
                borderTopLeftRadius: 18,
                borderTopRightRadius: 18,
                boxShadow: "0 -20px 60px -20px rgba(0,0,0,0.9)",
              }}
            >
              {/* header */}
              <div style={{ flex: "0 0 auto", padding: "10px 14px 0" }}>
                <div style={{ display: "flex", justifyContent: "center", paddingBottom: 8 }}>
                  <span aria-hidden style={{ width: 38, height: 4, borderRadius: 999, background: "rgba(255,255,255,0.18)" }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <h3
                    style={{
                      flex: 1, margin: 0, fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 700,
                      letterSpacing: "0.03em", textTransform: "uppercase", color: TEXT,
                    }}
                  >
                    Write the show
                  </h3>
                  <button type="button" className="lfx-icon" onClick={() => setEditMode("preview")} aria-label="Close">
                    <X size={18} />
                  </button>
                </div>

                <div
                  className="lfx-scroll"
                  style={{
                    display: "flex", gap: 2, marginTop: 6, overflowX: "auto",
                    borderBottom: `1px solid ${HAIRLINE}`,
                  }}
                >
                  {TABS.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      className="lfx-tab"
                      data-on={tab === t.key}
                      onClick={() => setTab(t.key)}
                      aria-current={tab === t.key ? "page" : undefined}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* body */}
              <div
                className="lfx-scroll"
                style={{ flex: "1 1 auto", overflowY: "auto", padding: "16px 14px 20px", display: "flex", flexDirection: "column", gap: 16 }}
              >
                {tab === "cast" && (
                  <>
                    <SectionHead title="The two of you" note="Two profile tiles open the show. Theirs unlocks it; yours is locked, on purpose." />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
                      <Field label="Their name *" htmlFor="lfx-recipient" hint="Whoever is watching this.">
                        <input
                          id="lfx-recipient"
                          className="lfx-in"
                          value={mf.recipientName}
                          onChange={(e) => updateMf("recipientName", e.target.value)}
                          placeholder="e.g. Aditi"
                        />
                      </Field>
                      <PhotoField
                        label="Their photo"
                        hint="Square-cropped for you. No photo is fine — their initial is used, and it looks right."
                        value={mf.recipientPhotoUrl}
                        initial={initialOfName(mf.recipientName)}
                        onChange={(v) => updateMf("recipientPhotoUrl", v)}
                      />
                      <Field label="Your name" htmlFor="lfx-sender" hint="Yours is the tile that refuses to open.">
                        <input
                          id="lfx-sender"
                          className="lfx-in"
                          value={mf.senderName}
                          onChange={(e) => updateMf("senderName", e.target.value)}
                          placeholder="e.g. Rohan"
                        />
                      </Field>
                      <PhotoField
                        label="Your photo"
                        hint="Same deal — optional."
                        value={mf.senderPhotoUrl}
                        initial={initialOfName(mf.senderName)}
                        onChange={(v) => updateMf("senderPhotoUrl", v)}
                      />
                    </div>
                  </>
                )}

                {tab === "show" && (
                  <>
                    <SectionHead title="The show" note="This is the banner across the top of the browse screen." />
                    <Field label="Title *" htmlFor="lfx-title" hint="Short is better. One or two words fills the banner.">
                      <input
                        id="lfx-title"
                        className="lfx-in"
                        value={mf.showTitle}
                        onChange={(e) => updateMf("showTitle", e.target.value)}
                        placeholder="e.g. US"
                      />
                    </Field>
                    <Field label="Tagline" hint="Two or three lines of the blurb underneath.">
                      <textarea
                        className="lfx-in"
                        rows={3}
                        value={mf.tagline}
                        onChange={(e) => updateMf("tagline", e.target.value)}
                        placeholder="e.g. Two people who were extremely bad at admitting anything."
                      />
                    </Field>
                    <Field label="Banner image" hint="Optional. Left empty, we draw the banner instead.">
                      <input
                        className="lfx-in"
                        value={mf.heroImageUrl}
                        onChange={(e) => updateMf("heroImageUrl", e.target.value.trim())}
                        placeholder="https://…"
                      />
                    </Field>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <Field label="Match" hint={"Shown as “99% Match”."}>
                        <NumberInput
                          value={mf.matchPercent}
                          min={MIN_MATCH_PERCENT}
                          max={MAX_MATCH_PERCENT}
                          suffix="%"
                          ariaLabel="Match percentage"
                          onCommit={(n) => updateMf("matchPercent", n)}
                        />
                      </Field>
                      <Field label="Year you met">
                        <input
                          className="lfx-in"
                          inputMode="numeric"
                          value={mf.metYear}
                          onChange={(e) => updateMf("metYear", e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
                          placeholder="e.g. 2023"
                        />
                      </Field>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <Field label="Rating" hint="Invent the board.">
                        <input
                          className="lfx-in"
                          value={mf.rating}
                          onChange={(e) => updateMf("rating", e.target.value)}
                          placeholder="e.g. Rated A — for Aditi only"
                        />
                      </Field>
                      <Field label="Seasons">
                        <input
                          className="lfx-in"
                          value={mf.seasons}
                          onChange={(e) => updateMf("seasons", e.target.value)}
                          placeholder="e.g. 3 Seasons"
                        />
                      </Field>
                    </div>
                  </>
                )}

                {tab === "catalogue" && (
                  <>
                    <SectionHead
                      title="The catalogue"
                      note="Rows of cards they scroll through before they press play. Tap a row to open it."
                      count={`${mf.rows.length}/${MAX_ROWS}`}
                    />
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {mf.rows.map((r, i) => (
                        <RowEditor
                          key={`row-${i}`}
                          row={r}
                          index={i}
                          count={mf.rows.length}
                          onPatch={(p) => updateMf("rows", mf.rows.map((x, ix) => (ix === i ? { ...x, ...p } : x)))}
                          onMove={(to) => updateMf("rows", move(mf.rows, i, to))}
                          onRemove={() => updateMf("rows", mf.rows.filter((_, ix) => ix !== i))}
                        />
                      ))}
                      <button
                        type="button"
                        className="lfx-btn"
                        disabled={mf.rows.length >= MAX_ROWS}
                        onClick={() => updateMf("rows", [...mf.rows, blankRow()])}
                      >
                        <Plus size={14} /> Add a row
                      </button>
                      {mf.rows.length >= MAX_ROWS && (
                        <p style={{ margin: 0, fontSize: 11.5, color: "#7a7a7a", textAlign: "center" }}>
                          {MAX_ROWS} rows is as long as the browse screen goes.
                        </p>
                      )}
                    </div>
                  </>
                )}

                {tab === "episode" && (
                  <>
                    <SectionHead
                      title="The episode"
                      note="Each scene ends in two choices on a timer. Different routes, same ending — no choice is ever the wrong one."
                      count={`${mf.scenes.length}/${MAX_SCENES}`}
                    />

                    <Field label="Opens on" hint="The first scene they see after they press play.">
                      <select
                        className="lfx-in"
                        value={mf.startSceneId}
                        onChange={(e) => updateMf("startSceneId", e.target.value)}
                        aria-label="Opening scene"
                      >
                        {!mf.scenes.some((s) => s.id === mf.startSceneId) && (
                          <option value={mf.startSceneId}>
                            {mf.startSceneId ? `${mf.startSceneId} — missing` : "— pick a scene —"}
                          </option>
                        )}
                        {mf.scenes.map((s) => (
                          <option key={s.id} value={s.id}>{sceneLabel(s)}</option>
                        ))}
                      </select>
                    </Field>

                    {/* Always rendered, so nothing shifts when a problem appears. */}
                    <div
                      style={{
                        minHeight: 62,
                        display: "flex",
                        gap: 10,
                        padding: "10px 12px",
                        borderRadius: 8,
                        background: SUBTLE,
                        borderLeft: `2px solid ${report.ok ? "rgba(255,255,255,0.2)" : ACCENT}`,
                      }}
                      aria-live="polite"
                    >
                      <span style={{ flex: "0 0 auto", marginTop: 1, color: report.ok ? TEXT_DIM : ACCENT }}>
                        {report.ok ? <Check size={15} /> : <AlertTriangle size={15} />}
                      </span>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: TEXT }}>
                          {report.ok ? "Every path reaches the ending." : "The episode doesn't join up yet"}
                        </p>
                        {report.errors.length > 0 && (
                          <ul style={{ margin: "6px 0 0", padding: "0 0 0 16px", display: "flex", flexDirection: "column", gap: 3 }}>
                            {report.errors.slice(0, 6).map((err, i) => (
                              <li key={i} style={{ fontSize: 12, lineHeight: 1.5, color: TEXT }}>{err}</li>
                            ))}
                          </ul>
                        )}
                        {report.warnings.length > 0 && (
                          <ul style={{ margin: "6px 0 0", padding: "0 0 0 16px", display: "flex", flexDirection: "column", gap: 3 }}>
                            {report.warnings.slice(0, 4).map((w, i) => (
                              <li key={i} style={{ fontSize: 11.5, lineHeight: 1.5, color: "#7a7a7a" }}>{w}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {mf.scenes.map((s, i) => (
                        <SceneEditor
                          key={s.id}
                          scene={s}
                          index={i}
                          count={mf.scenes.length}
                          allScenes={mf.scenes}
                          isStart={s.id === mf.startSceneId}
                          onPatch={(p) => patchScene(i, p)}
                          onMove={(to) => updateMf("scenes", move(mf.scenes, i, to))}
                          onRemove={() => removeScene(i)}
                        />
                      ))}
                      <button type="button" className="lfx-btn" disabled={mf.scenes.length >= MAX_SCENES} onClick={addScene}>
                        <Plus size={14} /> Add a scene
                      </button>
                      {mf.scenes.length >= MAX_SCENES && (
                        <p style={{ margin: 0, fontSize: 11.5, color: "#7a7a7a", textAlign: "center" }}>
                          {MAX_SCENES} scenes is the ceiling. Five to eight per route reads best anyway.
                        </p>
                      )}
                    </div>
                  </>
                )}

                {tab === "ending" && (
                  <>
                    <SectionHead title="The ending" note="Where every route lands, whatever they picked." />
                    <Field label="The last thing you say" hint="Blank lines are kept — they become the pauses.">
                      <textarea
                        className="lfx-in"
                        rows={6}
                        value={mf.finaleText}
                        onChange={(e) => updateMf("finaleText", e.target.value)}
                        placeholder={"Whatever you picked, we ended up here.\n\nThat's not a bug in the writing."}
                      />
                    </Field>
                    <Field label="One last question (optional)" hint="Leave it empty to skip it. If you write one, a single button appears once the text settles.">
                      <input
                        className="lfx-in"
                        value={mf.finaleQuestion}
                        onChange={(e) => updateMf("finaleQuestion", e.target.value)}
                        placeholder="e.g. still here?"
                      />
                    </Field>

                    <SectionHead title="End credits" note="They scroll up over black at the very end." count={`${mf.credits.length}/${MAX_CREDITS}`} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {mf.credits.map((c, i) => (
                        <div key={`credit-${i}`} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <input
                            className="lfx-in"
                            style={{ flex: "1 1 40%" }}
                            value={c.role}
                            onChange={(e) => patchCredit(i, { role: e.target.value })}
                            placeholder="e.g. Directed by"
                            aria-label={`Credit ${i + 1} role`}
                          />
                          <input
                            className="lfx-in"
                            style={{ flex: "1 1 60%" }}
                            value={c.name}
                            onChange={(e) => patchCredit(i, { name: e.target.value })}
                            placeholder="e.g. Rohan"
                            aria-label={`Credit ${i + 1} name`}
                          />
                          <button
                            type="button"
                            className="lfx-icon"
                            onClick={() => updateMf("credits", mf.credits.filter((_, ix) => ix !== i))}
                            aria-label={`Delete credit ${i + 1}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="lfx-btn"
                        disabled={mf.credits.length >= MAX_CREDITS}
                        onClick={() => updateMf("credits", [...mf.credits, { role: "", name: "" }])}
                      >
                        <Plus size={14} /> Add a credit
                      </button>
                    </div>

                    <SectionHead title="Password" note="Optional. Set one and the shared link asks for it before anything plays." />
                    <div style={{ position: "relative" }}>
                      <Lock
                        size={15}
                        aria-hidden
                        style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: TEXT_DIM }}
                      />
                      <input
                        className="lfx-in"
                        style={{ paddingLeft: 36 }}
                        value={pagePassword}
                        onChange={(e) => setPagePassword(e.target.value)}
                        placeholder="Leave empty for no password"
                        aria-label="Page password"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* footer */}
              <div
                style={{
                  flex: "0 0 auto",
                  padding: "12px 14px calc(14px + env(safe-area-inset-bottom, 0px))",
                  borderTop: `1px solid ${HAIRLINE}`,
                  background: BG_RAISED,
                }}
              >
                <button
                  type="button"
                  onClick={onSave}
                  disabled={saving}
                  style={{
                    width: "100%", minHeight: 50, display: "inline-flex", alignItems: "center",
                    justifyContent: "center", gap: 8, borderRadius: 8, border: 0, cursor: "pointer",
                    background: ACCENT_GRAD, color: "#150d05",
                    fontFamily: FONT_BODY, fontSize: 15, fontWeight: 800, letterSpacing: "0.01em",
                    opacity: saving ? 0.6 : 1,
                  }}
                >
                  {saving
                    ? <><Loader2 size={16} className="animate-spin" /> Saving…</>
                    : <><Eye size={16} /> Save &amp; watch it</>}
                </button>
                <p style={{ margin: "8px 0 0", textAlign: "center", fontSize: 11.5, color: "#7a7a7a" }}>
                  Publish from the preview to get your shareable link.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});
