"use client";

// ─── EditSheet — the sender's form ───────────────────────────────────────────
//
// A bottom sheet over the live listing. Every control writes straight back into
// `mf` through `updateMf`, and the editor hook autosaves that on every keystroke
// — so this file holds no draft state of its own and nothing here needs a
// "saved" indicator.
//
// Artwork is read as a data URL and handed to the server, which uploads it and
// stores only the resulting link. That is why the icon and screenshot pickers
// below produce `data:image/...` strings rather than object URLs: an object URL
// is dead the moment the tab closes, and the draft has to survive a refresh.
//
// Sections are collapsible rather than stepped. A listing has eight kinds of
// content and a seven-step wizard makes the sender walk past six of them to fix
// one line in the changelog.

import { useCallback, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { EditMode } from "../hooks/useAppEditor";
import type { AppData, AppInfoRow, AppReview, AppScreenshot, AppStar, AppVersion } from "./types";
import { APP_REVIEW_LIMITS } from "./types";

const ACCENT = "#4B3FA7";
const INK = "#16141F";
const MUTED = "#6B6779";
const EDGE = "#DFDDE7";
const FIELD_BG = "#F7F6FA";

/** Every interactive target on this form clears the 44px minimum. */
const TAP = 44;

const label: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.02em",
  color: MUTED,
  marginBottom: 6,
  textTransform: "uppercase",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  minHeight: TAP,
  boxSizing: "border-box",
  padding: "11px 13px",
  borderRadius: 12,
  border: `1px solid ${EDGE}`,
  background: FIELD_BG,
  color: INK,
  fontSize: 15,
  lineHeight: 1.4,
  outline: "none",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  minHeight: 96,
  resize: "vertical",
  fontFamily: "inherit",
};

const ghostBtn: React.CSSProperties = {
  minHeight: 40,
  padding: "9px 14px",
  borderRadius: 999,
  border: `1px solid ${EDGE}`,
  background: "#fff",
  color: INK,
  fontSize: 13.5,
  fontWeight: 600,
  cursor: "pointer",
  touchAction: "manipulation",
};

/* ── Small field primitives ────────────────────────────────────────────────── */

function Field({
  title,
  hint,
  value,
  onChange,
  placeholder,
  maxLength,
  multiline = false,
}: {
  title: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  multiline?: boolean;
}) {
  const id = useId();
  return (
    <div style={{ marginBottom: 16 }}>
      <label htmlFor={id} style={label}>
        {title}
      </label>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          style={textareaStyle}
        />
      ) : (
        <input
          id={id}
          type="text"
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          style={inputStyle}
        />
      )}
      {hint ? <p style={{ margin: "6px 0 0", fontSize: 12, color: MUTED, lineHeight: 1.45 }}>{hint}</p> : null}
    </div>
  );
}

/** A string[] edited as one line per entry. Blank lines are dropped on the way out. */
function LineList({
  title,
  hint,
  value,
  onChange,
  rows = 5,
}: {
  title: string;
  hint?: string;
  value: string[];
  onChange: (v: string[]) => void;
  rows?: number;
}) {
  const id = useId();
  return (
    <div style={{ marginBottom: 16 }}>
      <label htmlFor={id} style={label}>
        {title}
      </label>
      <textarea
        id={id}
        rows={rows}
        value={value.join("\n")}
        onChange={(e) => onChange(e.target.value.split("\n"))}
        onBlur={(e) => onChange(e.target.value.split("\n").map((l) => l.trim()).filter(Boolean))}
        style={{ ...textareaStyle, minHeight: rows * 26 }}
      />
      <p style={{ margin: "6px 0 0", fontSize: 12, color: MUTED, lineHeight: 1.45 }}>
        {hint ? `${hint} ` : ""}One per line.
      </p>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
  defaultOpen = false,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section style={{ borderTop: `1px solid ${EDGE}`, padding: "4px 0" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={{
          width: "100%",
          minHeight: TAP + 6,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 0",
          border: "none",
          background: "none",
          cursor: "pointer",
          textAlign: "left",
          touchAction: "manipulation",
        }}
      >
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 15.5, fontWeight: 700, color: INK }}>{title}</span>
          {subtitle ? (
            <span style={{ display: "block", fontSize: 12.5, color: MUTED, marginTop: 2, lineHeight: 1.4 }}>
              {subtitle}
            </span>
          ) : null}
        </span>
        <span aria-hidden="true" style={{ color: ACCENT, fontSize: 20, fontWeight: 700, lineHeight: 1 }}>
          {open ? "−" : "+"}
        </span>
      </button>
      {open ? <div style={{ paddingBottom: 12 }}>{children}</div> : null}
    </section>
  );
}

/** Reads a picked file into a data URL. The server swaps it for a hosted link. */
function useImagePicker(onPicked: (dataUrl: string) => void) {
  const ref = useRef<HTMLInputElement | null>(null);
  const pick = useCallback(() => ref.current?.click(), []);
  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") onPicked(reader.result);
      };
      reader.readAsDataURL(file);
    },
    [onPicked]
  );
  return { ref, pick, onChange };
}

function ImageRow({
  title,
  value,
  onChange,
}: {
  title: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const picker = useImagePicker(onChange);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
      <div
        aria-hidden="true"
        style={{
          width: 52,
          height: 52,
          borderRadius: 12,
          border: `1px solid ${EDGE}`,
          background: value ? `center / cover no-repeat url(${JSON.stringify(value)})` : FIELD_BG,
          flex: "none",
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ ...label, marginBottom: 8 }}>{title}</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button type="button" onClick={picker.pick} style={ghostBtn}>
            {value ? "Replace" : "Upload"}
          </button>
          {value ? (
            <button type="button" onClick={() => onChange("")} style={{ ...ghostBtn, color: MUTED }}>
              Remove
            </button>
          ) : null}
        </div>
      </div>
      <input
        ref={picker.ref}
        type="file"
        accept="image/*"
        onChange={picker.onChange}
        style={{ display: "none" }}
      />
    </div>
  );
}

function StarPicker({ value, onChange }: { value: AppStar; onChange: (v: AppStar) => void }) {
  return (
    <div style={{ display: "flex", gap: 4, marginBottom: 10 }} role="group" aria-label="Stars">
      {([1, 2, 3, 4, 5] as const).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-pressed={value === n}
          aria-label={`${n} star${n === 1 ? "" : "s"}`}
          style={{
            minWidth: TAP,
            minHeight: TAP,
            borderRadius: 12,
            border: `1px solid ${value >= n ? ACCENT : EDGE}`,
            background: value >= n ? ACCENT : "#fff",
            color: value >= n ? "#fff" : MUTED,
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            touchAction: "manipulation",
          }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

/* ── The sheet ─────────────────────────────────────────────────────────────── */

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

  const setApp = useCallback(
    (key: keyof AppData["app"], v: string) => updateMf("app", { ...mf.app, [key]: v }),
    [mf.app, updateMf]
  );

  const setVersion = useCallback(
    (index: number, patch: Partial<AppVersion>) =>
      updateMf(
        "versionHistory",
        mf.versionHistory.map((v, i) => (i === index ? { ...v, ...patch } : v))
      ),
    [mf.versionHistory, updateMf]
  );

  const setShot = useCallback(
    (index: number, patch: Partial<AppScreenshot>) =>
      updateMf(
        "screenshots",
        mf.screenshots.map((s, i) => (i === index ? { ...s, ...patch } : s))
      ),
    [mf.screenshots, updateMf]
  );

  const setInfoRow = useCallback(
    (index: number, patch: Partial<AppInfoRow>) =>
      updateMf(
        "info",
        mf.info.map((r, i) => (i === index ? { ...r, ...patch } : r))
      ),
    [mf.info, updateMf]
  );

  const setReview = useCallback(
    (index: number, patch: Partial<AppReview>) =>
      updateMf(
        "reviews",
        mf.reviews.map((r, i) => (i === index ? { ...r, ...patch } : r))
      ),
    [mf.reviews, updateMf]
  );

  const addVersion = useCallback(() => {
    const next: AppVersion = { version: "", date: "", size: "1 human", notes: [""] };
    updateMf("versionHistory", [next, ...mf.versionHistory]);
  }, [mf.versionHistory, updateMf]);

  const removeVersion = useCallback(
    (index: number) => updateMf("versionHistory", mf.versionHistory.filter((_, i) => i !== index)),
    [mf.versionHistory, updateMf]
  );

  const addReview = useCallback(() => {
    const next: AppReview = {
      id: `own${Date.now().toString(36)}`,
      author: "",
      stars: 5,
      title: "",
      body: "",
      ago: "just now",
      status: "published",
    };
    updateMf("reviews", [next, ...mf.reviews]);
  }, [mf.reviews, updateMf]);

  const removeReview = useCallback(
    (index: number) => updateMf("reviews", mf.reviews.filter((_, i) => i !== index)),
    [mf.reviews, updateMf]
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditMode(null)}
            className="fixed inset-0 z-[210]"
            style={{ background: "rgba(22,20,31,0.5)" }}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            role="dialog"
            aria-modal="true"
            aria-label="Edit the listing"
            className="fixed bottom-0 left-0 right-0 z-[211] mx-auto w-full"
            style={{
              maxWidth: 480,
              background: "#fff",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              maxHeight: "92dvh",
              display: "flex",
              flexDirection: "column",
              color: INK,
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "16px 18px 12px",
                borderBottom: `1px solid ${EDGE}`,
                flex: "none",
              }}
            >
              <h2 style={{ margin: 0, flex: 1, fontSize: 17, fontWeight: 800 }}>Edit the listing</h2>
              <button
                type="button"
                onClick={() => setEditMode(null)}
                aria-label="Close"
                style={{
                  minWidth: TAP,
                  minHeight: TAP,
                  border: "none",
                  background: "none",
                  color: MUTED,
                  fontSize: 22,
                  lineHeight: 1,
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div style={{ overflowY: "auto", padding: "6px 18px 0", flex: "1 1 auto", minHeight: 0 }}>
              <Section title="The basics" subtitle="Her name, the developer, the price" defaultOpen>
                <ImageRow title="Icon" value={mf.app.iconUrl} onChange={(v) => setApp("iconUrl", v)} />
                <Field title="Name" value={mf.app.name} onChange={(v) => setApp("name", v)} maxLength={60} placeholder="Meera" />
                <Field
                  title="Subtitle"
                  hint="What she is, then the category. A middle dot between them reads best."
                  value={mf.app.subtitle}
                  onChange={(v) => setApp("subtitle", v)}
                  maxLength={120}
                  placeholder="Girlfriend · Utilities"
                />
                <Field
                  title="Developer"
                  hint="Who made her. Her family name works."
                  value={mf.app.developer}
                  onChange={(v) => setApp("developer", v)}
                  maxLength={80}
                  placeholder="Sharma Family Enterprises"
                />
                <Field title="Category" value={mf.app.category} onChange={(v) => setApp("category", v)} maxLength={60} />
                <Field
                  title="Size"
                  hint="Free text, not a file size."
                  value={mf.app.size}
                  onChange={(v) => setApp("size", v)}
                  maxLength={60}
                  placeholder="1 human"
                />
                <Field title="Languages" value={mf.app.languages} onChange={(v) => setApp("languages", v)} maxLength={120} />
                <Field title="Age rating" value={mf.app.ageRating} onChange={(v) => setApp("ageRating", v)} maxLength={12} placeholder="4+" />
                <Field
                  title="Price"
                  hint="Free text, never a number."
                  value={mf.app.price}
                  onChange={(v) => setApp("price", v)}
                  maxLength={60}
                  placeholder="Free (emotionally expensive)"
                />
                <Field
                  title="Ratings shown"
                  hint="The figure printed beside the stars. A label, not a count."
                  value={mf.rating.count}
                  onChange={(v) => updateMf("rating", { ...mf.rating, count: v })}
                  maxLength={24}
                  placeholder="8,472"
                />
              </Section>

              <Section title="Description" subtitle="The joke, then the honest part">
                <LineList
                  title="Shown straight away"
                  hint="Listing voice — what she does, written as a product does it."
                  value={mf.description.short}
                  onChange={(v) => updateMf("description", { ...mf.description, short: v })}
                  rows={4}
                />
                <LineList
                  title="Behind “more”"
                  hint="Drop the joke here. This is the part she rereads."
                  value={mf.description.full}
                  onChange={(v) => updateMf("description", { ...mf.description, full: v })}
                  rows={6}
                />
              </Section>

              <Section title="What’s new" subtitle="The current release notes">
                <Field
                  title="Version"
                  value={mf.whatsNew.version}
                  onChange={(v) => updateMf("whatsNew", { ...mf.whatsNew, version: v })}
                  maxLength={24}
                />
                <Field
                  title="Date"
                  value={mf.whatsNew.date}
                  onChange={(v) => updateMf("whatsNew", { ...mf.whatsNew, date: v })}
                  maxLength={48}
                />
                <LineList
                  title="Notes"
                  value={mf.whatsNew.notes}
                  onChange={(v) => updateMf("whatsNew", { ...mf.whatsNew, notes: v })}
                  rows={4}
                />
              </Section>

              <Section
                title="Version history"
                subtitle="Newest first. Keep the oldest one short and dry — that is the joke."
              >
                <button type="button" onClick={addVersion} style={{ ...ghostBtn, marginBottom: 14 }}>
                  + Add a release
                </button>
                {mf.versionHistory.map((v, i) => (
                  <div
                    key={`${v.version}-${i}`}
                    style={{ border: `1px solid ${EDGE}`, borderRadius: 14, padding: 14, marginBottom: 12 }}
                  >
                    <div style={{ display: "flex", gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <Field title="Version" value={v.version} onChange={(x) => setVersion(i, { version: x })} maxLength={24} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <Field title="Date" value={v.date} onChange={(x) => setVersion(i, { date: x })} maxLength={48} />
                      </div>
                    </div>
                    <Field title="Size" value={v.size} onChange={(x) => setVersion(i, { size: x })} maxLength={60} />
                    <LineList title="Release notes" value={v.notes} onChange={(x) => setVersion(i, { notes: x })} rows={3} />
                    <button
                      type="button"
                      onClick={() => removeVersion(i)}
                      style={{ ...ghostBtn, color: "#A63A4A", borderColor: "#EBD3D7" }}
                    >
                      Remove this release
                    </button>
                  </div>
                ))}
              </Section>

              <Section title="Screenshots" subtitle="Captions carry these — artwork is optional">
                {mf.screenshots.map((s, i) => (
                  <div
                    key={i}
                    style={{ border: `1px solid ${EDGE}`, borderRadius: 14, padding: 14, marginBottom: 12 }}
                  >
                    <ImageRow title={`Shot ${i + 1}`} value={s.imageUrl} onChange={(v) => setShot(i, { imageUrl: v })} />
                    <Field
                      title="Caption"
                      value={s.caption}
                      onChange={(v) => setShot(i, { caption: v })}
                      maxLength={160}
                    />
                  </div>
                ))}
              </Section>

              <Section title="Information" subtitle="The table at the bottom">
                {mf.info.map((r, i) => (
                  <div key={`${r.label}-${i}`} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ flex: "0 0 38%" }}>
                      <Field title="Label" value={r.label} onChange={(v) => setInfoRow(i, { label: v })} maxLength={60} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Field title="Value" value={r.value} onChange={(v) => setInfoRow(i, { value: v })} maxLength={200} />
                    </div>
                  </div>
                ))}
              </Section>

              <Section
                title="Reviews"
                subtitle="Anything left pending stays off her page until you approve it"
              >
                <button type="button" onClick={addReview} style={{ ...ghostBtn, marginBottom: 14 }}>
                  + Add a review
                </button>
                {mf.reviews.map((r, i) => (
                  <div
                    key={r.id}
                    style={{ border: `1px solid ${EDGE}`, borderRadius: 14, padding: 14, marginBottom: 12 }}
                  >
                    <StarPicker value={r.stars} onChange={(v) => setReview(i, { stars: v })} />
                    <Field title="Headline" value={r.title} onChange={(v) => setReview(i, { title: v })} maxLength={APP_REVIEW_LIMITS.title} />
                    <Field
                      title="Review"
                      value={r.body}
                      onChange={(v) => setReview(i, { body: v })}
                      maxLength={APP_REVIEW_LIMITS.body}
                      multiline
                    />
                    <div style={{ display: "flex", gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <Field title="Who wrote it" value={r.author} onChange={(v) => setReview(i, { author: v })} maxLength={APP_REVIEW_LIMITS.author} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <Field title="When" value={r.ago} onChange={(v) => setReview(i, { ago: v })} maxLength={48} placeholder="2d ago" />
                      </div>
                    </div>
                    <Field
                      title="Your reply"
                      hint="Indented under the review. The best place on the page for your funniest line."
                      value={r.developerResponse?.text ?? ""}
                      onChange={(v) =>
                        setReview(i, {
                          developerResponse: v
                            ? { text: v, ago: r.developerResponse?.ago || "1d ago" }
                            : undefined,
                        })
                      }
                      maxLength={800}
                      multiline
                    />
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button
                        type="button"
                        onClick={() =>
                          setReview(i, { status: r.status === "published" ? "pending" : "published" })
                        }
                        style={{
                          ...ghostBtn,
                          background: r.status === "published" ? ACCENT : "#fff",
                          color: r.status === "published" ? "#fff" : INK,
                          borderColor: r.status === "published" ? ACCENT : EDGE,
                        }}
                      >
                        {r.status === "published" ? "On her page" : "Hidden"}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeReview(i)}
                        style={{ ...ghostBtn, color: "#A63A4A", borderColor: "#EBD3D7" }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </Section>

              <Section title="Her friends, and privacy" subtitle="The review link prompt, and an optional password">
                <Field
                  title="What her friends see"
                  hint="Shown when someone opens the review link."
                  value={mf.contributorPrompt}
                  onChange={(v) => updateMf("contributorPrompt", v)}
                  maxLength={240}
                  multiline
                />
                <Field
                  title="Password (optional)"
                  hint="Leave it empty and anyone with the link can open her page."
                  value={pagePassword}
                  onChange={setPagePassword}
                  maxLength={128}
                />
              </Section>

              <div style={{ height: 12 }} />
            </div>

            {/* Footer */}
            <div
              style={{
                flex: "none",
                padding: "12px 18px calc(16px + env(safe-area-inset-bottom, 0px))",
                borderTop: `1px solid ${EDGE}`,
                background: "#fff",
              }}
            >
              <button
                type="button"
                onClick={onSave}
                disabled={saving}
                style={{
                  width: "100%",
                  minHeight: TAP + 4,
                  borderRadius: 999,
                  border: "none",
                  background: ACCENT,
                  color: "#fff",
                  fontSize: 15.5,
                  fontWeight: 800,
                  cursor: saving ? "default" : "pointer",
                  opacity: saving ? 0.65 : 1,
                  touchAction: "manipulation",
                }}
              >
                {saving ? "Saving…" : "Save and preview"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
