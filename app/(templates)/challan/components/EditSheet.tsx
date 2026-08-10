"use client";

// ─── Challan — the edit sheet ────────────────────────────────────────────────
//
// The document is a joke about bureaucracy. THE FORM MUST NOT BE. This is a
// gift, and a sender who has to fill in twenty government-styled fields stops
// halfway. So the sheet is warm, plainly worded, grouped, and everything except
// the accused's name has a working default already in it.
//
// ── THE ONE FIELD THAT NEEDS CARE ────────────────────────────────────────────
//
// `totalFine` is a TEXT input and its placeholder is "one date". It must never
// become a number input, and it must never be auto-summed from the offence
// rows: the whole payoff of the notice is a TOTAL line that reads "one date".
// Per-offence `fine` is a number and is only ever printed.

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CH } from "./theme";
import type { ChallanData, ChallanOffence, ChallanSettlementMethod } from "./types";
import type { EditMode } from "./demo";

const TAP = 44;

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: CH.serif,
  fontSize: 12.5,
  fontWeight: 700,
  color: CH.ink,
  marginBottom: 5,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  minHeight: TAP,
  padding: "10px 12px",
  borderRadius: 0,
  border: `1px solid ${CH.portalEdge}`,
  background: "#FFFFFF",
  fontFamily: CH.mono,
  fontSize: 13.5,
  color: CH.ink,
  outline: "none",
};

const areaStyle: React.CSSProperties = { ...inputStyle, minHeight: 84, resize: "vertical", lineHeight: 1.5 };

function Field({
  label,
  hint,
  value,
  onChange,
  placeholder,
  max,
  area,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  max?: number;
  area?: boolean;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={labelStyle}>
        {label}
        {max ? (
          <span style={{ float: "right", fontWeight: 400, fontFamily: CH.mono, fontSize: 11, color: CH.faint }}>
            {value.length}/{max}
          </span>
        ) : null}
      </label>
      {hint ? (
        <p style={{ margin: "0 0 5px", fontFamily: CH.serif, fontSize: 11.5, color: CH.faint }}>{hint}</p>
      ) : null}
      {area ? (
        <textarea value={value} maxLength={max} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} style={areaStyle} />
      ) : (
        <input type="text" value={value} maxLength={max} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} style={inputStyle} />
      )}
    </div>
  );
}

function Group({ title, children, defaultOpen }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div style={{ borderTop: `1px solid ${CH.portalEdge}`, paddingTop: 12, marginTop: 12 }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={{
          width: "100%", minHeight: TAP, display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "transparent", border: "none", padding: 0,
          fontFamily: CH.serif, fontSize: 15, fontWeight: 700, color: CH.ink, cursor: "pointer",
        }}
      >
        {title}
        <span aria-hidden="true" style={{ color: CH.faint, fontSize: 13 }}>{open ? "–" : "+"}</span>
      </button>
      {open ? <div style={{ paddingTop: 8 }}>{children}</div> : null}
    </div>
  );
}

function LineEditor({
  label,
  hint,
  items,
  onChange,
  max,
  itemMax,
  placeholder,
}: {
  label: string;
  hint?: string;
  items: string[];
  onChange: (next: string[]) => void;
  max: number;
  itemMax: number;
  placeholder?: string;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={labelStyle}>{label}</label>
      {hint ? <p style={{ margin: "0 0 5px", fontFamily: CH.serif, fontSize: 11.5, color: CH.faint }}>{hint}</p> : null}
      {items.map((it, i) => (
        <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 6 }}>
          <textarea
            value={it}
            maxLength={itemMax}
            placeholder={placeholder}
            onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))}
            style={{ ...areaStyle, minHeight: 64 }}
          />
          <button
            type="button"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            aria-label={`Remove paragraph ${i + 1}`}
            style={{ minWidth: TAP, minHeight: TAP, flex: "0 0 auto", border: `1px solid ${CH.portalEdge}`, background: "#FFFFFF", color: CH.faint, cursor: "pointer" }}
          >
            ×
          </button>
        </div>
      ))}
      {items.length < max ? (
        <button
          type="button"
          onClick={() => onChange([...items, ""])}
          style={{ minHeight: TAP, padding: "0 14px", border: `1px solid ${CH.portalEdge}`, background: CH.portalGrey, color: CH.ink, fontFamily: CH.serif, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
        >
          + Add a line
        </button>
      ) : null}
    </div>
  );
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
}: {
  editMode: EditMode;
  setEditMode: (m: EditMode) => void;
  mf: ChallanData;
  /** The house signature: one key, one value. Not a patch object. */
  updateMf: (key: keyof ChallanData, val: unknown) => void;
  pagePassword: string;
  setPagePassword: (v: string) => void;
  onSave: () => void;
  saving: boolean;
}) {
  const open = editMode === "manual";

  const patchOffence = useCallback(
    (i: number, patch: Partial<ChallanOffence>) =>
      updateMf("offences", mf.offences.map((o, j) => (j === i ? { ...o, ...patch } : o))),
    [mf.offences, updateMf],
  );

  const patchMethod = useCallback(
    (i: number, patch: Partial<ChallanSettlementMethod>) =>
      updateMf("settlement", {
        methods: mf.settlement.methods.map((m, j) => (j === i ? { ...m, ...patch } : m)),
      }),
    [mf.settlement, updateMf],
  );

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[260]"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={() => setEditMode(null)}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "tween", duration: 0.24 }}
            onClick={(ev) => ev.stopPropagation()}
            style={{
              position: "absolute", left: 0, right: 0, bottom: 0,
              maxHeight: "92dvh", overflowY: "auto",
              background: CH.paper,
              padding: 16,
              paddingBottom: "calc(96px + env(safe-area-inset-bottom, 0px))",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
              <h2 style={{ margin: 0, fontFamily: CH.serif, fontSize: 19, fontWeight: 700, color: CH.ink }}>
                Write the challan
              </h2>
              <div style={{ flex: 1 }} />
              <button
                type="button"
                onClick={() => setEditMode(null)}
                aria-label="Close"
                style={{ minWidth: TAP, minHeight: TAP, border: "none", background: "transparent", color: CH.faint, fontSize: 18, cursor: "pointer" }}
              >
                ×
              </button>
            </div>
            <p style={{ margin: "0 0 14px", fontFamily: CH.serif, fontSize: 12.5, color: CH.faint }}>
              Everything already has a default. Change what you like — the name is the only part that matters.
            </p>

            <Field
              label="Who it's for"
              value={mf.accused.name}
              onChange={(v) => updateMf("accused", { ...mf.accused, name: v })}
              max={60}
              placeholder="Meera Sharma"
            />
            <Field
              label="Their number plate"
              hint="The joke plate. Nothing that looks like a real registration."
              value={mf.accused.vehicleNo}
              onChange={(v) => updateMf("accused", { ...mf.accused, vehicleNo: v })}
              max={20}
              placeholder="KA 01 LUV 2023"
            />
            <Field
              label="Where it happened"
              value={mf.location}
              onChange={(v) => updateMf("location", v)}
              max={120}
              placeholder="Near her house, 11:40 PM"
            />

            <Group title="The offences" defaultOpen>
              {mf.offences.map((o, i) => (
                <div key={i} style={{ border: `1px solid ${CH.portalEdge}`, padding: 12, marginBottom: 10, background: "#FFFFFF" }}>
                  <Field label="Offence" value={o.description} onChange={(v) => patchOffence(i, { description: v })} max={120} placeholder="Overspeeding" />
                  <Field label="The aside" hint="Printed small and italic under the offence." value={o.note ?? ""} onChange={(v) => patchOffence(i, { note: v })} max={160} placeholder="into my life, without warning" />
                  <Field label="Section" value={o.section} onChange={(v) => patchOffence(i, { section: v })} max={60} placeholder="Sec 12(b), Heart Traffic Act" />
                  <button
                    type="button"
                    onClick={() => updateMf("offences", mf.offences.filter((_, j) => j !== i))}
                    style={{ minHeight: TAP, border: "none", background: "transparent", color: CH.red, fontFamily: CH.serif, fontSize: 13, cursor: "pointer" }}
                  >
                    Remove this offence
                  </button>
                </div>
              ))}
              {mf.offences.length < 5 ? (
                <button
                  type="button"
                  onClick={() => updateMf("offences", [...mf.offences, { section: "Sec 1(a), Heart Traffic Act", description: "", fine: 500 }])}
                  style={{ minHeight: TAP, padding: "0 14px", border: `1px solid ${CH.portalEdge}`, background: CH.portalGrey, color: CH.ink, fontFamily: CH.serif, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                >
                  + Add an offence
                </button>
              ) : null}
            </Group>

            <Group title="The fine and how to settle it" defaultOpen>
              {/* TEXT. Never a number input, never summed. See the header. */}
              <Field
                label="The total"
                hint="Not a number. Write what you actually want — this is the punchline of the notice."
                value={mf.totalFine}
                onChange={(v) => updateMf("totalFine", v)}
                max={60}
                placeholder="one date"
              />
              {mf.settlement.methods.map((m, i) => (
                <div key={m.id || i} style={{ border: `1px solid ${CH.portalEdge}`, padding: 12, marginBottom: 10, background: "#FFFFFF" }}>
                  <Field label="Payment option" value={m.label} onChange={(v) => patchMethod(i, { label: v })} max={60} placeholder="chai, twice" />
                  <Field label="The small print" value={m.sub ?? ""} onChange={(v) => patchMethod(i, { sub: v })} max={80} placeholder="the good one near your office" />
                  <button
                    type="button"
                    onClick={() => updateMf("settlement", { methods: mf.settlement.methods.filter((_, j) => j !== i) })}
                    style={{ minHeight: TAP, border: "none", background: "transparent", color: CH.red, fontFamily: CH.serif, fontSize: 13, cursor: "pointer" }}
                  >
                    Remove
                  </button>
                </div>
              ))}
              {mf.settlement.methods.length < 5 ? (
                <button
                  type="button"
                  onClick={() =>
                    updateMf("settlement", {
                      methods: [...mf.settlement.methods, { id: `m${mf.settlement.methods.length + 1}`, label: "", sub: "" }],
                    })
                  }
                  style={{ minHeight: TAP, padding: "0 14px", border: `1px solid ${CH.portalEdge}`, background: CH.portalGrey, color: CH.ink, fontFamily: CH.serif, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                >
                  + Add an option
                </button>
              ) : null}
            </Group>

            <Group title="What you actually wanted to say" defaultOpen>
              <LineEditor
                label="If they pay"
                hint="Read in a serif, outside the document. This is the part that isn't a joke."
                items={mf.paidMessage}
                onChange={(v) => updateMf("paidMessage", v)}
                max={5}
                itemMax={600}
                placeholder="There is no fine, obviously."
              />
              <LineEditor
                label="If they contest it"
                hint="They always win. This is what they read when they do."
                items={mf.contestMessage}
                onChange={(v) => updateMf("contestMessage", v)}
                max={5}
                itemMax={600}
                placeholder="Objection upheld, obviously."
              />
            </Group>

            <Group title="The paperwork">
              <Field label="Challan number" value={mf.challanNo} onChange={(v) => updateMf("challanNo", v)} max={32} />
              <Field label="Officer" value={mf.officer.name} onChange={(v) => updateMf("officer", { ...mf.officer, name: v })} max={60} />
              <Field label="Number plate in the photo" value={mf.evidence.plateText} onChange={(v) => updateMf("evidence", { ...mf.evidence, plateText: v })} max={20} />
              <Field label="Password (optional)" value={pagePassword} onChange={setPagePassword} max={128} placeholder="Leave empty for no password" />
            </Group>

            <div
              style={{
                position: "sticky", bottom: 0, marginTop: 16, paddingTop: 12,
                paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
                background: CH.paper,
              }}
            >
              <button
                type="button"
                onClick={onSave}
                disabled={saving}
                style={{
                  width: "100%", minHeight: TAP, border: `1px solid ${CH.ink}`,
                  background: CH.ink, color: CH.paper,
                  fontFamily: CH.serif, fontSize: 15, fontWeight: 700,
                  cursor: "pointer", opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
