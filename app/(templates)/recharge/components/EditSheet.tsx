"use client";

// ─── The edit sheet ──────────────────────────────────────────────────────────
//
// A bottom sheet over the live preview. Plain inputs, plain labels, no
// cleverness: the template's whole job is to look like a form somebody's bank
// shipped, and the editor may as well be honest about being one.
//
// ── THE ONE INTERESTING BIT: ROWS ────────────────────────────────────────────
// A plan's detail table is typed as one row per line, `Label: Value`, split on
// the FIRST colon only so a value may contain colons of its own. An optional
// note rides after a pipe. Parsing happens on every keystroke, but what the
// textarea DISPLAYS is the raw text the sender typed — a textarea whose value
// is re-derived from the parse deletes the line you are halfway through typing
// the moment the colon is not there yet.

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  MAX_BENEFITS,
  MAX_CATEGORIES,
  MAX_METHODS,
  MAX_PLANS,
  MAX_RECEIPT_LINES,
  MAX_ROWS,
  type PaymentMethod,
  type Plan,
  type PlanCategory,
  type RechargeData,
} from "./types";
import { ACCENT, BORDER, FAINT, FONT, INK, MUTED, SECTION, priceLabel, rowFromLine, rowToString } from "./ui";

export type EditMode = null | "manual" | "preview";

/* ── Field primitives ─────────────────────────────────────────────────────── */

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: FONT,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: MUTED,
  marginBottom: 5,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 44,
  borderRadius: 8,
  border: `1px solid ${BORDER}`,
  background: "#FFFFFF",
  padding: "10px 12px",
  fontFamily: FONT,
  fontSize: 14,
  color: INK,
  outline: "none",
};

function Field({
  label,
  value,
  onChange,
  placeholder,
  help,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  help?: string;
}) {
  return (
    <div>
      <label style={labelStyle}>
        {label}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ ...inputStyle, marginTop: 5, textTransform: "none", letterSpacing: "normal", fontWeight: 400 }}
        />
      </label>
      {help ? <p style={{ margin: "4px 0 0", fontFamily: FONT, fontSize: 11, color: FAINT }}>{help}</p> : null}
    </div>
  );
}

/**
 * A textarea whose value is the sender's raw text and whose OUTPUT is the
 * parsed lines. Seeded once — give it a `key` when the thing it edits changes.
 */
function LinesArea({
  label,
  initial,
  onCommit,
  rows = 5,
  help,
  placeholder,
}: {
  label: string;
  initial: string;
  onCommit: (lines: string[]) => void;
  rows?: number;
  help?: string;
  placeholder?: string;
}) {
  const [raw, setRaw] = useState(initial);
  return (
    <div>
      <label style={labelStyle}>
        {label}
        <textarea
          value={raw}
          rows={rows}
          placeholder={placeholder}
          onChange={(e) => {
            setRaw(e.target.value);
            onCommit(e.target.value.split("\n"));
          }}
          style={{
            ...inputStyle,
            marginTop: 5,
            minHeight: 44,
            lineHeight: 1.55,
            resize: "vertical",
            textTransform: "none",
            letterSpacing: "normal",
            fontWeight: 400,
          }}
        />
      </label>
      {help ? <p style={{ margin: "4px 0 0", fontFamily: FONT, fontSize: 11, lineHeight: 1.5, color: FAINT }}>{help}</p> : null}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h3 style={{ margin: 0, fontFamily: FONT, fontSize: 13, fontWeight: 700, color: INK }}>{title}</h3>
      {children}
    </section>
  );
}

function SmallButton({ label, onClick, danger }: { label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minHeight: 44,
        padding: "0 14px",
        borderRadius: 8,
        border: `1px solid ${danger ? "#D4D8DC" : ACCENT}`,
        background: "#FFFFFF",
        color: danger ? MUTED : ACCENT,
        fontFamily: FONT,
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function uniqueId(base: string, taken: readonly string[]): string {
  let id = base;
  let n = 2;
  while (taken.includes(id)) {
    id = `${base}-${n}`;
    n += 1;
  }
  return id;
}

/* ── Sheet ────────────────────────────────────────────────────────────────── */

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
  mf: RechargeData;
  updateMf: (patch: Partial<RechargeData>) => void;
  pagePassword: string;
  setPagePassword: (v: string) => void;
  onSave: () => void;
  saving: boolean;
}) {
  const [openPlan, setOpenPlan] = useState<string | null>(null);

  const setPlan = useCallback(
    (id: string, patch: Partial<Plan>) => {
      updateMf({ plans: mf.plans.map((p) => (p.id === id ? { ...p, ...patch } : p)) });
    },
    [mf.plans, updateMf],
  );

  const addPlan = useCallback(() => {
    if (mf.plans.length >= MAX_PLANS) return;
    const id = uniqueId("plan", mf.plans.map((p) => p.id));
    const next: Plan = {
      id,
      price: "0",
      categoryId: mf.categories[0]?.id ?? "",
      validity: "",
      rows: [],
      benefits: [],
    };
    updateMf({ plans: [...mf.plans, next] });
    setOpenPlan(id);
  }, [mf.plans, mf.categories, updateMf]);

  const removePlan = useCallback(
    (id: string) => {
      updateMf({ plans: mf.plans.filter((p) => p.id !== id) });
    },
    [mf.plans, updateMf],
  );

  const setCategory = useCallback(
    (id: string, label: string) => {
      updateMf({ categories: mf.categories.map((c) => (c.id === id ? { ...c, label } : c)) });
    },
    [mf.categories, updateMf],
  );

  const addCategory = useCallback(() => {
    if (mf.categories.length >= MAX_CATEGORIES) return;
    const taken = mf.categories.map((c) => c.id);
    const next: PlanCategory = { id: uniqueId("tab", taken), label: "New tab" };
    updateMf({ categories: [...mf.categories, next] });
  }, [mf.categories, updateMf]);

  const removeCategory = useCallback(
    (id: string) => {
      if (mf.categories.length <= 1) return;
      updateMf({ categories: mf.categories.filter((c) => c.id !== id) });
    },
    [mf.categories, updateMf],
  );

  const setMethod = useCallback(
    (id: string, patch: Partial<PaymentMethod>) => {
      updateMf({ payment: { methods: mf.payment.methods.map((m) => (m.id === id ? { ...m, ...patch } : m)) } });
    },
    [mf.payment.methods, updateMf],
  );

  const addMethod = useCallback(() => {
    if (mf.payment.methods.length >= MAX_METHODS) return;
    const id = uniqueId("method", mf.payment.methods.map((m) => m.id));
    updateMf({ payment: { methods: [...mf.payment.methods, { id, label: "New method" }] } });
  }, [mf.payment.methods, updateMf]);

  const removeMethod = useCallback(
    (id: string) => {
      if (mf.payment.methods.length <= 1) return;
      updateMf({ payment: { methods: mf.payment.methods.filter((m) => m.id !== id) } });
    },
    [mf.payment.methods, updateMf],
  );

  const open = editMode === "manual";

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="rc-sheet"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200]"
          style={{ background: "rgba(26,32,38,0.42)" }}
          onClick={() => setEditMode(null)}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "tween", duration: 0.24, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Edit this recharge"
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              bottom: 0,
              width: "100%",
              maxWidth: 460,
              maxHeight: "92dvh",
              background: SECTION,
              borderTopLeftRadius: 14,
              borderTopRightRadius: 14,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                flex: "0 0 auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                padding: "12px 14px",
                background: "#FFFFFF",
                borderBottom: `1px solid ${BORDER}`,
              }}
            >
              <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: INK }}>Edit this recharge</span>
              <button
                type="button"
                onClick={() => setEditMode(null)}
                aria-label="Close"
                style={{
                  minHeight: 44,
                  minWidth: 44,
                  border: "none",
                  background: "transparent",
                  color: MUTED,
                  fontFamily: FONT,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>

            <div style={{ flex: "1 1 auto", overflowY: "auto", padding: "16px 14px 24px", display: "flex", flexDirection: "column", gap: 22 }}>
              <Section title="Operator">
                <Field label="Operator name" value={mf.operator.name} onChange={(v) => updateMf({ operator: { ...mf.operator, name: v } })} />
                <Field label="Tagline" value={mf.operator.tagline} onChange={(v) => updateMf({ operator: { ...mf.operator, tagline: v } })} />
              </Section>

              <Section title="Who it is for">
                <Field label="Their name" value={mf.subscriber.name} onChange={(v) => updateMf({ subscriber: { ...mf.subscriber, name: v } })} />
                <Field
                  label="Number"
                  value={mf.subscriber.number}
                  onChange={(v) => updateMf({ subscriber: { ...mf.subscriber, number: v } })}
                  help="Shown big in the header. Make it obviously invented — hide a date in the digits."
                />
                <Field label="Circle" value={mf.subscriber.circle} onChange={(v) => updateMf({ subscriber: { ...mf.subscriber, circle: v } })} />
              </Section>

              <Section title="The plan that is expiring">
                <Field
                  label="Expires in"
                  value={mf.currentPlan.expiresIn}
                  onChange={(v) => updateMf({ currentPlan: { ...mf.currentPlan, expiresIn: v } })}
                  help='Reads as "Current plan expires in …".'
                />
                <Field label="Note underneath" value={mf.currentPlan.note} onChange={(v) => updateMf({ currentPlan: { ...mf.currentPlan, note: v } })} />
              </Section>

              <Section title={`Tabs (${mf.categories.length}/${MAX_CATEGORIES})`}>
                {mf.categories.map((c) => (
                  <div key={c.id} style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                    <div style={{ flex: "1 1 auto", minWidth: 0 }}>
                      <Field label="Tab label" value={c.label} onChange={(v) => setCategory(c.id, v)} />
                    </div>
                    {mf.categories.length > 1 ? <SmallButton label="Remove" onClick={() => removeCategory(c.id)} danger /> : null}
                  </div>
                ))}
                {mf.categories.length < MAX_CATEGORIES ? <SmallButton label="Add a tab" onClick={addCategory} /> : null}
              </Section>

              <Section title={`Plans (${mf.plans.length}/${MAX_PLANS})`}>
                {mf.plans.map((p) => {
                  const isOpen = openPlan === p.id;
                  return (
                    <div key={p.id} style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
                      <button
                        type="button"
                        onClick={() => setOpenPlan(isOpen ? null : p.id)}
                        aria-expanded={isOpen}
                        style={{
                          width: "100%",
                          minHeight: 48,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 10,
                          padding: "0 12px",
                          background: "transparent",
                          border: "none",
                          textAlign: "left",
                          cursor: "pointer",
                        }}
                      >
                        <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: INK, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {priceLabel(p.price)} · {p.validity || "no validity"}
                        </span>
                        <span style={{ fontFamily: FONT, fontSize: 12, color: MUTED }}>{isOpen ? "Hide" : "Edit"}</span>
                      </button>

                      {isOpen ? (
                        <div style={{ padding: "4px 12px 14px", display: "flex", flexDirection: "column", gap: 12 }}>
                          <Field
                            label="Price"
                            value={p.price}
                            onChange={(v) => setPlan(p.id, { price: v })}
                            help="Text, not a number. An infinity sign is a perfectly good price here."
                          />
                          <div>
                            <label style={labelStyle}>
                              Tab
                              <select
                                value={p.categoryId}
                                onChange={(e) => setPlan(p.id, { categoryId: e.target.value })}
                                style={{ ...inputStyle, marginTop: 5, textTransform: "none", letterSpacing: "normal", fontWeight: 400 }}
                              >
                                {mf.categories.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.label}
                                  </option>
                                ))}
                              </select>
                            </label>
                          </div>
                          <Field label="Validity" value={p.validity} onChange={(v) => setPlan(p.id, { validity: v })} />
                          <Field
                            label="Badge"
                            value={p.badge ?? ""}
                            onChange={(v) => setPlan(p.id, { badge: v })}
                            help="The tag on the card's top edge. Leave blank for none."
                          />
                          <LinesArea
                            key={`rows-${p.id}`}
                            label={`Rows (max ${MAX_ROWS})`}
                            initial={p.rows.map(rowToString).join("\n")}
                            rows={6}
                            placeholder={"Calls: Unlimited\nData: 2 GB / day | mostly the same clip, twice"}
                            help="One per line, written Label: Value — split on the first colon only, so the value may contain colons. Anything after a | is the small italic note under the value."
                            onCommit={(lines) =>
                              setPlan(p.id, {
                                rows: lines.map(rowFromLine).filter((r): r is NonNullable<typeof r> => r !== null).slice(0, MAX_ROWS),
                              })
                            }
                          />
                          <LinesArea
                            key={`benefits-${p.id}`}
                            label={`Benefit chips (max ${MAX_BENEFITS})`}
                            initial={p.benefits.join("\n")}
                            rows={4}
                            help="One per line. Leave it empty and the chip row disappears entirely."
                            onCommit={(lines) => setPlan(p.id, { benefits: lines.map((l) => l.trim()).filter(Boolean).slice(0, MAX_BENEFITS) })}
                          />
                          <label style={{ display: "flex", alignItems: "center", gap: 9, minHeight: 44, fontFamily: FONT, fontSize: 13, color: INK }}>
                            <input
                              type="checkbox"
                              checked={p.disabled === true}
                              onChange={(e) => setPlan(p.id, { disabled: e.target.checked })}
                              style={{ width: 18, height: 18 }}
                            />
                            Greyed out — cannot be selected
                          </label>
                          {p.disabled ? (
                            <Field label="Why not" value={p.disabledReason ?? ""} onChange={(v) => setPlan(p.id, { disabledReason: v })} />
                          ) : null}
                          <SmallButton label="Delete this plan" onClick={() => removePlan(p.id)} danger />
                        </div>
                      ) : null}
                    </div>
                  );
                })}
                {mf.plans.length < MAX_PLANS ? <SmallButton label="Add a plan" onClick={addPlan} /> : null}
              </Section>

              <Section title={`Payment methods (${mf.payment.methods.length}/${MAX_METHODS})`}>
                {mf.payment.methods.map((m) => (
                  <div key={m.id} style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 10, padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                    <Field label="Label" value={m.label} onChange={(v) => setMethod(m.id, { label: v })} />
                    <Field label="Sub line" value={m.sub ?? ""} onChange={(v) => setMethod(m.id, { sub: v })} />
                    {mf.payment.methods.length > 1 ? <SmallButton label="Remove" onClick={() => removeMethod(m.id)} danger /> : null}
                  </div>
                ))}
                {mf.payment.methods.length < MAX_METHODS ? <SmallButton label="Add a method" onClick={addMethod} /> : null}
              </Section>

              <Section title="The receipt message">
                <LinesArea
                  key="receipt"
                  label={`Message (max ${MAX_RECEIPT_LINES} lines)`}
                  initial={mf.receipt.message.join("\n")}
                  rows={7}
                  help="One paragraph per line, in a serif under the receipt. A line written 'Transaction ID: …' is lifted into the receipt itself, so put your date in there."
                  onCommit={(lines) => updateMf({ receipt: { message: lines.map((l) => l.trim()).filter(Boolean).slice(0, MAX_RECEIPT_LINES) } })}
                />
              </Section>

              <Section title="Password (optional)">
                <Field
                  label="Password"
                  value={pagePassword}
                  onChange={setPagePassword}
                  placeholder="Leave blank for no gate"
                  help="Set one and the shared page asks for it before it opens."
                />
              </Section>
            </div>

            <div style={{ flex: "0 0 auto", padding: "10px 14px", paddingBottom: "calc(10px + env(safe-area-inset-bottom, 0px))", background: "#FFFFFF", borderTop: `1px solid ${BORDER}` }}>
              <button
                type="button"
                onClick={onSave}
                disabled={saving}
                style={{
                  width: "100%",
                  height: 48,
                  minHeight: 48,
                  borderRadius: 8,
                  border: `1px solid ${ACCENT}`,
                  background: ACCENT,
                  color: "#FFFFFF",
                  fontFamily: FONT,
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  opacity: saving ? 0.6 : 1,
                  cursor: saving ? "default" : "pointer",
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
