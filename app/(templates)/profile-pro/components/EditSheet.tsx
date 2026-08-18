"use client";

// ─── Endorsements — the edit sheet ───────────────────────────────────────────
//
// The sender fills this once and hands two links to a group chat. Everything in
// here is ordinary form work with two rules of its own:
//
//   1. `connections` is a TEXT input, never a number input. "1 connection" is
//      the demo value and a spinner control would quietly destroy the joke.
//
//   2. Endorsement counts are NOT editable. They are the honest output of
//      friends tapping a button, and a sender who can type "47" into the box has
//      a page where the one number that means something means nothing. The count
//      is shown, greyed, as read-only context beside each skill.
//
// Recommendations are absent from this form for the same reason: they are
// written by real people and arrive through the moderation queue.

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PP, ACCENT_TINT } from "./theme";
import type {
  ProfileProData,
  ProfileExperience,
  ProfileEducation,
  ProfileCertification,
  ProfileSkill,
} from "./types";
import type { EditMode } from "../hooks/useProfileEditor";

const TAP = 44;

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: PP.font,
  fontSize: 12,
  fontWeight: 600,
  color: PP.inkSoft,
  marginBottom: 5,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  minHeight: TAP,
  padding: "10px 12px",
  borderRadius: 6,
  border: `1px solid ${PP.edge}`,
  background: "#FFFFFF",
  fontFamily: PP.font,
  fontSize: 14,
  color: PP.ink,
  outline: "none",
};

const areaStyle: React.CSSProperties = { ...inputStyle, minHeight: 88, resize: "vertical", lineHeight: 1.45 };

function Field({
  label,
  value,
  onChange,
  placeholder,
  max,
  area,
}: {
  label: string;
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
          <span style={{ float: "right", fontWeight: 400, color: PP.inkSoft }}>
            {value.length}/{max}
          </span>
        ) : null}
      </label>
      {area ? (
        <textarea
          value={value}
          maxLength={max}
          placeholder={placeholder}
          onChange={(ev) => onChange(ev.target.value)}
          style={areaStyle}
        />
      ) : (
        <input
          type="text"
          value={value}
          maxLength={max}
          placeholder={placeholder}
          onChange={(ev) => onChange(ev.target.value)}
          style={inputStyle}
        />
      )}
    </div>
  );
}

/** A collapsible group. Closed by default so the sheet opens short, not scary. */
function Group({
  title,
  children,
  defaultOpen,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div style={{ borderTop: `1px solid ${PP.edge}`, paddingTop: 12, marginTop: 12 }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          minHeight: TAP,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "transparent",
          border: "none",
          padding: 0,
          fontFamily: PP.font,
          fontSize: 15,
          fontWeight: 600,
          color: PP.ink,
          cursor: "pointer",
        }}
        aria-expanded={open}
      >
        {title}
        <span aria-hidden="true" style={{ color: PP.inkSoft, fontSize: 13 }}>{open ? "–" : "+"}</span>
      </button>
      {open ? <div style={{ paddingTop: 8 }}>{children}</div> : null}
    </div>
  );
}

function ListEditor({
  label,
  items,
  onChange,
  placeholder,
  max,
  itemMax,
  area,
}: {
  label: string;
  items: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  max: number;
  itemMax: number;
  area?: boolean;
}) {
  const setAt = (i: number, v: string) => onChange(items.map((it, j) => (j === i ? v : it)));
  const removeAt = (i: number) => onChange(items.filter((_, j) => j !== i));
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={labelStyle}>{label}</label>
      {items.map((it, i) => (
        <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 6 }}>
          {area ? (
            <textarea
              value={it}
              maxLength={itemMax}
              placeholder={placeholder}
              onChange={(ev) => setAt(i, ev.target.value)}
              style={{ ...areaStyle, minHeight: 66 }}
            />
          ) : (
            <input
              type="text"
              value={it}
              maxLength={itemMax}
              placeholder={placeholder}
              onChange={(ev) => setAt(i, ev.target.value)}
              style={inputStyle}
            />
          )}
          <button
            type="button"
            onClick={() => removeAt(i)}
            aria-label={`Remove item ${i + 1}`}
            style={{
              minWidth: TAP, minHeight: TAP, flex: "0 0 auto",
              border: `1px solid ${PP.edge}`, borderRadius: 6, background: "#FFFFFF",
              color: PP.inkSoft, cursor: "pointer", fontFamily: PP.font,
            }}
          >
            ×
          </button>
        </div>
      ))}
      {items.length < max ? (
        <button
          type="button"
          onClick={() => onChange([...items, ""])}
          style={{
            minHeight: TAP, padding: "0 14px", borderRadius: 6,
            border: `1px solid ${PP.edge}`, background: ACCENT_TINT,
            color: PP.accent, fontFamily: PP.font, fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}
        >
          + Add
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
  mf: ProfileProData;
  /** The house signature: one key, one value. Not a patch object. */
  updateMf: (key: keyof ProfileProData, val: unknown) => void;
  pagePassword: string;
  setPagePassword: (v: string) => void;
  onSave: () => void;
  saving: boolean;
}) {
  const open = editMode === "manual";

  const setPerson = useCallback(
    (patch: Partial<ProfileProData["person"]>) => updateMf("person", { ...mf.person, ...patch }),
    [mf.person, updateMf],
  );

  const patchExp = useCallback(
    (i: number, patch: Partial<ProfileExperience>) =>
      updateMf("experience", mf.experience.map((e, j) => (j === i ? { ...e, ...patch } : e))),
    [mf.experience, updateMf],
  );

  const patchEdu = useCallback(
    (i: number, patch: Partial<ProfileEducation>) =>
      updateMf("education", mf.education.map((e, j) => (j === i ? { ...e, ...patch } : e))),
    [mf.education, updateMf],
  );

  const patchCert = useCallback(
    (i: number, patch: Partial<ProfileCertification>) =>
      updateMf("certifications", (mf.certifications ?? []).map((c, j) => (j === i ? { ...c, ...patch } : c))),
    [mf.certifications, updateMf],
  );

  const patchSkill = useCallback(
    (i: number, patch: Partial<ProfileSkill>) =>
      updateMf("skills", mf.skills.map((s, j) => (j === i ? { ...s, ...patch } : s))),
    [mf.skills, updateMf],
  );

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[260]"
          style={{ background: "rgba(0,0,0,0.35)" }}
          onClick={() => setEditMode(null)}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "tween", duration: 0.24 }}
            onClick={(ev) => ev.stopPropagation()}
            style={{
              position: "absolute",
              left: 0, right: 0, bottom: 0,
              maxHeight: "92dvh",
              overflowY: "auto",
              background: PP.page,
              borderTopLeftRadius: 14,
              borderTopRightRadius: 14,
              padding: 16,
              paddingBottom: "calc(96px + env(safe-area-inset-bottom, 0px))",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
              <h2 style={{ margin: 0, fontFamily: PP.font, fontSize: 18, fontWeight: 700, color: PP.ink }}>
                Write the profile
              </h2>
              <div style={{ flex: 1 }} />
              <button
                type="button"
                onClick={() => setEditMode(null)}
                aria-label="Close"
                style={{
                  minWidth: TAP, minHeight: TAP, border: "none",
                  background: "transparent", color: PP.inkSoft, fontSize: 18, cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            <Field label="Their name" value={mf.person.name} onChange={(v) => setPerson({ name: v })} max={60} placeholder="Meera Sharma" />
            <Field label="Headline" value={mf.person.headline} onChange={(v) => setPerson({ headline: v })} max={100} placeholder="Professional Girlfriend | Serial Overthinker" />
            <Field label="Location" value={mf.person.location} onChange={(v) => setPerson({ location: v })} max={80} placeholder="Bengaluru, India" />
            {/* TEXT, not a number input. See rule 1 in the header. */}
            <Field label="Connections" value={mf.person.connections} onChange={(v) => setPerson({ connections: v })} max={30} placeholder="1 connection" />
            <Field label="Open to" value={mf.person.openTo ?? ""} onChange={(v) => setPerson({ openTo: v })} max={80} placeholder="being right" />

            <Group title="About" defaultOpen>
              <ListEditor
                label="Paragraphs"
                items={mf.about}
                onChange={(v) => updateMf("about", v)}
                max={3}
                itemMax={400}
                area
                placeholder="Results-driven partner with 3+ years of experience…"
              />
            </Group>

            <Group title="Experience">
              {mf.experience.map((e, i) => (
                <div key={i} style={{ border: `1px solid ${PP.edge}`, borderRadius: 8, padding: 12, marginBottom: 10, background: "#FFFFFF" }}>
                  <Field label="Role" value={e.role} onChange={(v) => patchExp(i, { role: v })} max={80} />
                  <Field label="Company" value={e.company} onChange={(v) => patchExp(i, { company: v })} max={80} />
                  <Field label="Type" value={e.type} onChange={(v) => patchExp(i, { type: v })} max={40} placeholder="Full-time" />
                  <Field label="Duration" value={e.duration} onChange={(v) => patchExp(i, { duration: v })} max={60} placeholder="Mar 2023 – Present" />
                  <Field label="Location" value={e.location} onChange={(v) => patchExp(i, { location: v })} max={80} />
                  <ListEditor
                    label="Bullets"
                    items={e.bullets}
                    onChange={(v) => patchExp(i, { bullets: v })}
                    max={6}
                    itemMax={240}
                    placeholder="Reduced his overthinking by 12% QoQ"
                  />
                  <button
                    type="button"
                    onClick={() => updateMf("experience", mf.experience.filter((_, j) => j !== i))}
                    style={{ minHeight: TAP, border: "none", background: "transparent", color: PP.inkSoft, fontFamily: PP.font, fontSize: 13, cursor: "pointer" }}
                  >
                    Remove this role
                  </button>
                </div>
              ))}
              {mf.experience.length < 8 ? (
                <button
                  type="button"
                  onClick={() => updateMf("experience", [...mf.experience, { role: "", company: "", type: "", duration: "", location: "", bullets: [] }])}
                  style={{ minHeight: TAP, padding: "0 14px", borderRadius: 6, border: `1px solid ${PP.edge}`, background: ACCENT_TINT, color: PP.accent, fontFamily: PP.font, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                >
                  + Add a role
                </button>
              ) : null}
            </Group>

            <Group title="Skills">
              {mf.skills.map((s, i) => (
                <div key={s.id || i} style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6 }}>
                  <input
                    type="text"
                    value={s.label}
                    maxLength={40}
                    onChange={(ev) => patchSkill(i, { label: ev.target.value })}
                    style={inputStyle}
                    placeholder="Being Right"
                  />
                  {/* Read-only. See rule 2 in the header — counts are earned. */}
                  <span
                    title="Endorsements come from their friends"
                    style={{
                      flex: "0 0 auto", minWidth: 46, textAlign: "center",
                      fontFamily: PP.font, fontSize: 13, color: PP.inkSoft,
                    }}
                  >
                    {s.endorsements > 0 ? s.endorsements : "—"}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateMf("skills", mf.skills.filter((_, j) => j !== i))}
                    aria-label={`Remove ${s.label || "skill"}`}
                    style={{ minWidth: TAP, minHeight: TAP, flex: "0 0 auto", border: `1px solid ${PP.edge}`, borderRadius: 6, background: "#FFFFFF", color: PP.inkSoft, cursor: "pointer" }}
                  >
                    ×
                  </button>
                </div>
              ))}
              {mf.skills.length < 20 ? (
                <button
                  type="button"
                  onClick={() =>
                    updateMf("skills", [
                      ...mf.skills,
                      { id: `skill-${mf.skills.length}-${Date.now()}`, label: "", endorsements: 0, topEndorsers: [], isTop3: false },
                    ])
                  }
                  style={{ minHeight: TAP, padding: "0 14px", borderRadius: 6, border: `1px solid ${PP.edge}`, background: ACCENT_TINT, color: PP.accent, fontFamily: PP.font, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                >
                  + Add a skill
                </button>
              ) : null}
            </Group>

            <Group title="Education">
              {mf.education.map((e, i) => (
                <div key={i} style={{ border: `1px solid ${PP.edge}`, borderRadius: 8, padding: 12, marginBottom: 10, background: "#FFFFFF" }}>
                  <Field label="School" value={e.school} onChange={(v) => patchEdu(i, { school: v })} max={120} />
                  <Field label="Degree" value={e.degree} onChange={(v) => patchEdu(i, { degree: v })} max={120} />
                  <Field label="Years" value={e.years} onChange={(v) => patchEdu(i, { years: v })} max={40} />
                  <Field label="Note" value={e.note ?? ""} onChange={(v) => patchEdu(i, { note: v })} max={240} />
                  <button
                    type="button"
                    onClick={() => updateMf("education", mf.education.filter((_, j) => j !== i))}
                    style={{ minHeight: TAP, border: "none", background: "transparent", color: PP.inkSoft, fontFamily: PP.font, fontSize: 13, cursor: "pointer" }}
                  >
                    Remove
                  </button>
                </div>
              ))}
              {mf.education.length < 5 ? (
                <button
                  type="button"
                  onClick={() => updateMf("education", [...mf.education, { school: "", degree: "", years: "" }])}
                  style={{ minHeight: TAP, padding: "0 14px", borderRadius: 6, border: `1px solid ${PP.edge}`, background: ACCENT_TINT, color: PP.accent, fontFamily: PP.font, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                >
                  + Add
                </button>
              ) : null}
            </Group>

            <Group title="Certifications">
              {(mf.certifications ?? []).map((c, i) => (
                <div key={i} style={{ border: `1px solid ${PP.edge}`, borderRadius: 8, padding: 12, marginBottom: 10, background: "#FFFFFF" }}>
                  <Field label="Name" value={c.name} onChange={(v) => patchCert(i, { name: v })} max={120} placeholder="Certified in Reading My Mind" />
                  <Field label="Issuer" value={c.issuer} onChange={(v) => patchCert(i, { issuer: v })} max={80} placeholder="Issued by Herself" />
                  <Field label="Date" value={c.date} onChange={(v) => patchCert(i, { date: v })} max={40} placeholder="Mar 2023 · No Expiry" />
                  <button
                    type="button"
                    onClick={() => updateMf("certifications", (mf.certifications ?? []).filter((_, j) => j !== i))}
                    style={{ minHeight: TAP, border: "none", background: "transparent", color: PP.inkSoft, fontFamily: PP.font, fontSize: 13, cursor: "pointer" }}
                  >
                    Remove
                  </button>
                </div>
              ))}
              {(mf.certifications ?? []).length < 4 ? (
                <button
                  type="button"
                  onClick={() => updateMf("certifications", [...(mf.certifications ?? []), { name: "", issuer: "", date: "" }])}
                  style={{ minHeight: TAP, padding: "0 14px", borderRadius: 6, border: `1px solid ${PP.edge}`, background: ACCENT_TINT, color: PP.accent, fontFamily: PP.font, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                >
                  + Add
                </button>
              ) : null}
            </Group>

            <Group title="Their friends & privacy">
              <Field
                label="What their friends see"
                value={mf.contributorPrompt}
                onChange={(v) => updateMf("contributorPrompt", v)}
                max={160}
                area
                placeholder="Karan is collecting endorsements for Meera. Tap the ones that apply."
              />
              <Field
                label="Password (optional)"
                value={pagePassword}
                onChange={setPagePassword}
                max={128}
                placeholder="Leave empty for no password"
              />
            </Group>

            <div
              style={{
                position: "sticky",
                bottom: 0,
                marginTop: 16,
                paddingTop: 12,
                paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
                background: PP.page,
              }}
            >
              <button
                type="button"
                onClick={onSave}
                disabled={saving}
                style={{
                  width: "100%",
                  minHeight: TAP,
                  borderRadius: 8,
                  border: "none",
                  background: PP.accent,
                  color: PP.accentInk,
                  fontFamily: PP.font,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                  opacity: saving ? 0.6 : 1,
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
