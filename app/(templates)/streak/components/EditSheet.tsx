// ─── The sender's form ───────────────────────────────────────────────────────
//
// Deliberately short. The sender is setting up a thing the two of them will use
// every day for months — the setup is not the product and every extra field is
// a reason to abandon it. Two names, two photos, a start date, one timezone,
// three letters and a handful of weekly lines. No wizard, no steps, no preview
// of a preview.
//
// THE TIMEZONE IS THE ONE FIELD THAT NEEDS EXPLAINING, and it gets a sentence.
// A couple in Bengaluru and Toronto must share a definition of "today" or the
// streak is nonsense, so there is exactly one zone per pair and it is set here.
// It defaults to this device's zone, which is right most of the time and wrong
// in a way the sentence beneath it makes visible.

"use client";

import { useCallback, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, X } from "lucide-react";
import { LIMITS, MILESTONE_LABELS, PALETTE, SERIF, UI } from "./editorTypes";
import type { EditMode, StreakForm } from "./editorTypes";

/** The full IANA list when the engine exposes it, a short list when it does not. */
function zoneOptions(current: string): string[] {
  const fallback = [
    "Asia/Kolkata",
    "Asia/Dubai",
    "Asia/Singapore",
    "Australia/Sydney",
    "Europe/London",
    "Europe/Berlin",
    "America/New_York",
    "America/Chicago",
    "America/Los_Angeles",
    "America/Toronto",
    "UTC",
  ];
  try {
    const withValues = Intl as unknown as { supportedValuesOf?: (key: string) => string[] };
    const all = withValues.supportedValuesOf?.("timeZone");
    if (Array.isArray(all) && all.length > 0) {
      return all.includes(current) ? all : [current, ...all];
    }
  } catch {
    /* fall through */
  }
  return fallback.includes(current) ? fallback : [current, ...fallback];
}

const field: React.CSSProperties = {
  width: "100%",
  minHeight: 48,
  borderRadius: 12,
  padding: "0 12px",
  fontFamily: UI,
  fontSize: 15,
  color: PALETTE.ink,
  background: PALETTE.paper,
  border: `1px solid ${PALETTE.edge}`,
  outline: "none",
};

const areaStyle: React.CSSProperties = {
  ...field,
  minHeight: 120,
  padding: "10px 12px",
  fontFamily: SERIF,
  fontSize: 16,
  lineHeight: 1.6,
  resize: "vertical",
};

function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <span style={{ fontFamily: UI, fontSize: 11.5, letterSpacing: "0.07em", color: PALETTE.inkSoft }}>
        {children}
      </span>
      {hint && (
        <p style={{ fontFamily: UI, fontSize: 11.5, lineHeight: 1.45, color: PALETTE.inkFaint, marginTop: 3 }}>
          {hint}
        </p>
      )}
    </div>
  );
}

function PhotoPicker({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (dataUrl: string) => void;
  label: string;
}) {
  const ref = useRef<HTMLInputElement | null>(null);
  const pick = useCallback(
    (file: File | null) => {
      if (!file || !file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") onChange(reader.result);
      };
      reader.readAsDataURL(file);
    },
    [onChange],
  );

  return (
    <div className="flex items-center gap-2">
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => pick(e.target.files?.[0] ?? null)}
      />
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt=""
          style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", border: `1px solid ${PALETTE.edge}` }}
        />
      ) : (
        <span
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            border: `1px dashed ${PALETTE.edge}`,
            display: "grid",
            placeItems: "center",
            color: PALETTE.inkFaint,
          }}
        >
          <Camera size={17} />
        </span>
      )}
      <button
        type="button"
        onClick={() => ref.current?.click()}
        style={{
          minHeight: 44,
          padding: "0 12px",
          borderRadius: 10,
          fontFamily: UI,
          fontSize: 12.5,
          color: PALETTE.inkSoft,
          background: PALETTE.paper,
          border: `1px solid ${PALETTE.edge}`,
        }}
      >
        {value ? "change" : label}
      </button>
    </div>
  );
}

export interface EditSheetProps {
  editMode: EditMode;
  setEditMode: (m: EditMode) => void;
  mf: StreakForm;
  updateMf: <K extends keyof StreakForm>(key: K, val: StreakForm[K]) => void;
  pagePassword: string;
  setPagePassword: (v: string) => void;
  onSave: () => void;
  saving: boolean;
  /** True when a draft is being carried in memory from earlier in this session. */
  restoredDraft?: boolean;
}

export default function EditSheet({
  editMode,
  setEditMode,
  mf,
  updateMf,
  pagePassword,
  setPagePassword,
  onSave,
  saving,
  restoredDraft,
}: EditSheetProps) {
  const zones = useMemo(() => zoneOptions(mf.timezone), [mf.timezone]);

  const setLetter = useCallback(
    (atDay: number, letter: string) => {
      updateMf(
        "letters",
        mf.letters.map((l) => (l.atDay === atDay ? { ...l, letter: letter.slice(0, LIMITS.letter) } : l)),
      );
    },
    [mf.letters, updateMf],
  );

  const setMicro = useCallback(
    (i: number, line: string) => {
      const next = [...mf.microLines];
      next[i] = line.slice(0, LIMITS.microLine);
      updateMf("microLines", next);
    },
    [mf.microLines, updateMf],
  );

  return (
    <AnimatePresence>
      {editMode === "manual" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-end justify-center"
          style={{ background: "rgba(43,38,32,0.34)" }}
          onClick={() => setEditMode("preview")}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full overflow-y-auto"
            style={{
              maxWidth: 480,
              maxHeight: "92dvh",
              background: PALETTE.paperDeep,
              borderTopLeftRadius: 22,
              borderTopRightRadius: 22,
              padding: "18px 18px calc(24px + env(safe-area-inset-bottom, 0px))",
            }}
          >
            <div className="flex items-center gap-2" style={{ marginBottom: 14 }}>
              <h2 style={{ fontFamily: SERIF, fontSize: 21, color: PALETTE.ink }}>Set it up</h2>
              <span className="flex-1" />
              <button
                type="button"
                onClick={() => setEditMode("preview")}
                aria-label="Close"
                style={{ minWidth: 44, minHeight: 44, display: "grid", placeItems: "center", background: "transparent", border: "none", color: PALETTE.inkSoft }}
              >
                <X size={18} />
              </button>
            </div>

            {restoredDraft && (
              <p style={{ fontFamily: UI, fontSize: 12, color: PALETTE.inkFaint, marginBottom: 12 }}>
                Draft kept from earlier.
              </p>
            )}

            <div className="flex flex-col" style={{ gap: 18 }}>
              {/* ── The two of you ── */}
              <div>
                <Label>YOUR NAME</Label>
                <input
                  value={mf.nameA}
                  onChange={(e) => updateMf("nameA", e.target.value.slice(0, LIMITS.name))}
                  placeholder="Ananya"
                  style={field}
                />
                <div style={{ marginTop: 8 }}>
                  <PhotoPicker value={mf.photoA} onChange={(v) => updateMf("photoA", v)} label="add your photo" />
                </div>
              </div>

              <div>
                <Label>THEIR NAME</Label>
                <input
                  value={mf.nameB}
                  onChange={(e) => updateMf("nameB", e.target.value.slice(0, LIMITS.name))}
                  placeholder="Rohan"
                  style={field}
                />
                <div style={{ marginTop: 8 }}>
                  <PhotoPicker value={mf.photoB} onChange={(v) => updateMf("photoB", v)} label="add their photo" />
                </div>
              </div>

              {/* ── When, and whose clock ── */}
              <div>
                <Label>THE FIRST DAY</Label>
                <input
                  type="date"
                  value={mf.startedOn}
                  onChange={(e) => updateMf("startedOn", e.target.value)}
                  style={field}
                />
              </div>

              <div>
                <Label hint="One clock for both of you. Whoever is in the other city, this is the zone that decides when a day ends — so pick the one you'd both call 'today'.">
                  YOUR SHARED TIMEZONE
                </Label>
                <select
                  value={mf.timezone}
                  onChange={(e) => updateMf("timezone", e.target.value)}
                  style={field}
                >
                  {zones.map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </select>
              </div>

              {/* ── The letters ── */}
              <div className="flex flex-col" style={{ gap: 12 }}>
                <Label hint="Written now, opened much later. Leave any of them blank and that envelope simply never appears.">
                  LETTERS
                </Label>
                {mf.letters.map((l) => (
                  <div key={l.atDay}>
                    <p style={{ fontFamily: UI, fontSize: 11.5, color: PALETTE.inkFaint, marginBottom: 4 }}>
                      {MILESTONE_LABELS[l.atDay] ?? `day ${l.atDay}`}
                    </p>
                    <textarea
                      value={l.letter}
                      onChange={(e) => setLetter(l.atDay, e.target.value)}
                      placeholder="…"
                      style={areaStyle}
                    />
                  </div>
                ))}
              </div>

              {/* ── The weekly lines ── */}
              <div>
                <Label hint="One short line per week. Write as many or as few as you like — a week with no line shows nothing at all, which is better than filler.">
                  WEEKLY LINES
                </Label>
                <div className="flex flex-col" style={{ gap: 8 }}>
                  {mf.microLines.map((line, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span style={{ fontFamily: UI, fontSize: 11, color: PALETTE.inkFaint, width: 44 }}>
                        wk {i + 1}
                      </span>
                      <input
                        value={line}
                        onChange={(e) => setMicro(i, e.target.value)}
                        placeholder="…"
                        style={{ ...field, flex: 1 }}
                      />
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => updateMf("microLines", [...mf.microLines, ""])}
                  style={{
                    minHeight: 44,
                    marginTop: 8,
                    padding: "0 14px",
                    borderRadius: 10,
                    fontFamily: UI,
                    fontSize: 12.5,
                    color: PALETTE.inkSoft,
                    background: PALETTE.paper,
                    border: `1px solid ${PALETTE.edge}`,
                  }}
                >
                  add a week
                </button>
              </div>

              <div>
                <Label hint="Optional. Anyone with the link can open it without one.">PASSWORD</Label>
                <input
                  value={pagePassword}
                  onChange={(e) => setPagePassword(e.target.value)}
                  placeholder="—"
                  style={field}
                />
              </div>

              <button
                type="button"
                onClick={onSave}
                disabled={saving}
                style={{
                  minHeight: 52,
                  borderRadius: 14,
                  fontFamily: UI,
                  fontSize: 15,
                  color: PALETTE.paper,
                  background: PALETTE.ink,
                  border: "none",
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
