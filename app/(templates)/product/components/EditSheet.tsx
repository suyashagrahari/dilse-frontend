"use client";

// ─── EditSheet — the bottom sheet the sender fills in ────────────────────────
//
// Six steps, one bottom sheet, every keystroke autosaved by the hook above it.
// Nothing here talks to the network and nothing here validates beyond the caps
// the frozen contract already enforces — the sheet's whole job is to put the
// fifteen content fields somewhere a thumb can reach them.
//
// ── PHOTOS ───────────────────────────────────────────────────────────────────
// The picker reads a file into a `data:` URL and puts it straight into
// `subject.photos`. The server swaps it for an S3 link on save; storing base64
// in Mongo would walk this document toward the 16MB ceiling, and this template
// has a gallery, a bundle strip and one image per review.
//
// ── NOTHING PARSES MONEY ─────────────────────────────────────────────────────
// The price fields are plain text inputs, deliberately. `type="number"` on
// `price.amount` would make "∞" untypeable, which is the entire joke.

import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { C, FONT, Photo, WRAP } from "./tokens";
import {
  MAX_BULLETS,
  MAX_BUNDLE,
  MAX_PHOTOS,
  MAX_QA,
  MAX_REVIEWS,
  MAX_SPECS,
  type BundleItem,
  type ProductData,
  type QA,
  type Review,
  type Spec,
  type StarRating,
} from "./types";
import type { EditMode } from "../hooks/useProductEditor";

const STEPS = ["Her", "Listing", "Details", "Extras", "The note", "Lock"] as const;

/* ── Field primitives ──────────────────────────────────────────────────────── */

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  fontSize: 14,
  fontFamily: FONT,
  color: C.text,
  outline: "none",
  background: "#fff",
  border: `1px solid ${C.border}`,
};

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "block",
        marginBottom: 5,
        fontSize: 12,
        fontWeight: 700,
        color: C.secondary,
        letterSpacing: "0.01em",
      }}
    >
      {children}
    </span>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  rows,
  maxLength,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  hint?: string;
}) {
  return (
    <label style={{ display: "block" }}>
      <Label>{label}</Label>
      {rows ? (
        <textarea
          value={value}
          rows={rows}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
        />
      ) : (
        <input
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          style={inputStyle}
        />
      )}
      {hint ? <span style={{ display: "block", marginTop: 4, fontSize: 11.5, color: C.secondary }}>{hint}</span> : null}
    </label>
  );
}

function RowActions({
  onAdd,
  addLabel,
  disabled,
}: {
  onAdd: () => void;
  addLabel: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onAdd}
      disabled={disabled}
      style={{
        marginTop: 8,
        minHeight: 32,
        padding: "6px 14px",
        borderRadius: 100,
        border: `1px solid ${C.border}`,
        background: disabled ? C.section : "#fff",
        color: disabled ? C.secondary : C.link,
        fontFamily: FONT,
        fontSize: 13,
        cursor: disabled ? "default" : "pointer",
      }}
    >
      {addLabel}
    </button>
  );
}

function RemoveButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      style={{
        flex: "none",
        width: 30,
        height: 30,
        borderRadius: 8,
        border: `1px solid ${C.border}`,
        background: "#fff",
        color: C.secondary,
        cursor: "pointer",
        lineHeight: 1,
        fontSize: 16,
      }}
    >
      ×
    </button>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        border: `1px solid ${C.border}`,
        borderRadius: 10,
        padding: 12,
        background: C.section,
        display: "grid",
        gap: 8,
      }}
    >
      {children}
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
  mf: ProductData;
  updateMf: (key: keyof ProductData, val: unknown) => void;
  pagePassword: string;
  setPagePassword: (v: string) => void;
  onSave: () => void;
  saving: boolean;
}) {
  const [step, setStep] = useState(0);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const open = editMode === "manual" || editMode === "choose";

  const setSubject = useCallback(
    (patch: Partial<ProductData["subject"]>) => updateMf("subject", { ...mf.subject, ...patch }),
    [mf.subject, updateMf]
  );
  const setPrice = useCallback(
    (patch: Partial<ProductData["price"]>) => updateMf("price", { ...mf.price, ...patch }),
    [mf.price, updateMf]
  );
  const setAbout = useCallback(
    (patch: Partial<ProductData["aboutSection"]>) => updateMf("aboutSection", { ...mf.aboutSection, ...patch }),
    [mf.aboutSection, updateMf]
  );

  /** File → `data:` URL. The server swaps it for a hosted link on save. */
  const onPickPhotos = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const room = MAX_PHOTOS - mf.subject.photos.length;
      const chosen = Array.from(files).slice(0, Math.max(0, room));
      let pending = chosen.length;
      if (pending === 0) return;
      const collected: string[] = [];
      for (const file of chosen) {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") collected.push(reader.result);
          pending -= 1;
          if (pending === 0 && collected.length > 0) {
            setSubject({ photos: [...mf.subject.photos, ...collected].slice(0, MAX_PHOTOS) });
          }
        };
        reader.onerror = () => {
          pending -= 1;
          if (pending === 0 && collected.length > 0) {
            setSubject({ photos: [...mf.subject.photos, ...collected].slice(0, MAX_PHOTOS) });
          }
        };
        reader.readAsDataURL(file);
      }
    },
    [mf.subject.photos, setSubject]
  );

  const setListItem = useCallback(
    <T,>(key: keyof ProductData, list: T[], index: number, patch: Partial<T>) =>
      updateMf(key, list.map((row, i) => (i === index ? { ...row, ...patch } : row))),
    [updateMf]
  );

  const removeAt = useCallback(
    <T,>(key: keyof ProductData, list: T[], index: number) =>
      updateMf(key, list.filter((_, i) => i !== index)),
    [updateMf]
  );

  const isLast = step === STEPS.length - 1;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditMode("preview")}
            className="fixed inset-0 z-[200]"
            style={{ background: "rgba(15,17,17,0.5)" }}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="fixed bottom-0 left-0 right-0 z-[201] mx-auto w-full max-w-[620px] flex flex-col"
            style={{
              background: "#fff",
              borderTopLeftRadius: 18,
              borderTopRightRadius: 18,
              border: `1px solid ${C.border}`,
              borderBottom: 0,
              maxHeight: "92dvh",
              fontFamily: FONT,
              color: C.text,
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 16px 10px",
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              <div style={{ display: "flex", gap: 5, flex: 1, minWidth: 0, overflowX: "auto" }}>
                {STEPS.map((s, i) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStep(i)}
                    style={{
                      flex: "none",
                      padding: "4px 10px",
                      borderRadius: 100,
                      fontSize: 12,
                      fontWeight: i === step ? 700 : 400,
                      border: `1px solid ${i === step ? C.activeEdge : C.border}`,
                      background: i === step ? C.activeTint : "#fff",
                      color: C.text,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setEditMode("preview")}
                aria-label="Close"
                style={{ flex: "none", border: "none", background: "none", color: C.secondary, fontSize: 20, cursor: "pointer", lineHeight: 1 }}
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "grid", gap: 14 }}>
              {/* ── 0 · Her ────────────────────────────────────────────── */}
              {step === 0 && (
                <>
                  <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
                    <Field label="Her first name" value={mf.subject.firstName} onChange={(v) => setSubject({ firstName: v })} maxLength={60} />
                    <Field label="Her last name" value={mf.subject.lastName} onChange={(v) => setSubject({ lastName: v })} maxLength={60} />
                  </div>
                  <Field
                    label="Your first name"
                    value={mf.sender.firstName}
                    onChange={(v) => updateMf("sender", { firstName: v })}
                    maxLength={60}
                    hint="Shown as the seller, and on the review link you send her friends."
                  />

                  <div>
                    <Label>Photos ({mf.subject.photos.length}/{MAX_PHOTOS})</Label>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {mf.subject.photos.map((url, i) => (
                        <div key={`${i}-${url.slice(0, 24)}`} style={{ position: "relative", width: 64, height: 64 }}>
                          <Photo src={url} alt={`Photo ${i + 1}`} radius={6} glyphSize={20} />
                          <button
                            type="button"
                            onClick={() => setSubject({ photos: mf.subject.photos.filter((_, k) => k !== i) })}
                            aria-label={`Remove photo ${i + 1}`}
                            style={{
                              position: "absolute",
                              top: -6,
                              right: -6,
                              width: 22,
                              height: 22,
                              borderRadius: "50%",
                              border: `1px solid ${C.border}`,
                              background: "#fff",
                              color: C.secondary,
                              cursor: "pointer",
                              fontSize: 13,
                              lineHeight: 1,
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      multiple
                      style={{ display: "none" }}
                      onChange={(e) => {
                        onPickPhotos(e.target.files);
                        e.target.value = "";
                      }}
                    />
                    <RowActions
                      onAdd={() => fileRef.current?.click()}
                      addLabel="Add photos"
                      disabled={mf.subject.photos.length >= MAX_PHOTOS}
                    />
                  </div>
                </>
              )}

              {/* ── 1 · Listing ───────────────────────────────────────── */}
              {step === 1 && (
                <>
                  <Field
                    label="Listing title"
                    value={mf.title}
                    onChange={(v) => updateMf("title", v)}
                    rows={2}
                    maxLength={200}
                    hint="Long is right. Real ones are: name, category, a redundant qualifier, 1 Count."
                  />
                  <Field label="Store link" value={mf.storeName} onChange={(v) => updateMf("storeName", v)} maxLength={80} placeholder="Visit the ___ Store" />
                  <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
                    <Field
                      label="Price"
                      value={mf.price.amount}
                      onChange={(v) => setPrice({ amount: v })}
                      maxLength={24}
                      hint="Text, not a number. ∞ is a valid price."
                    />
                    <Field label="Was (M.R.P.)" value={mf.price.original ?? ""} onChange={(v) => setPrice({ original: v })} maxLength={24} />
                  </div>
                  <label style={{ display: "block" }}>
                    <Label>Discount badge (%)</Label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={mf.price.discountPct ?? 0}
                      onChange={(e) => {
                        const n = Number(e.target.value);
                        setPrice({ discountPct: Number.isFinite(n) ? Math.min(100, Math.max(0, Math.round(n))) : 0 });
                      }}
                      style={inputStyle}
                    />
                    <span style={{ display: "block", marginTop: 4, fontSize: 11.5, color: C.secondary }}>
                      0 hides the badge, which is the right answer.
                    </span>
                  </label>
                  <Field label="Stock line" value={mf.stockLine} onChange={(v) => updateMf("stockLine", v)} maxLength={200} hint="Say there is one left and it turns red. That is the joke." />
                  <Field label="Delivery promise" value={mf.deliveryLine} onChange={(v) => updateMf("deliveryLine", v)} rows={2} maxLength={200} hint="Put a date in it — the date is set in bold." />
                </>
              )}

              {/* ── 2 · Details ───────────────────────────────────────── */}
              {step === 2 && (
                <>
                  <div>
                    <Label>About this item ({mf.bullets.length}/{MAX_BULLETS})</Label>
                    <div style={{ display: "grid", gap: 8 }}>
                      {mf.bullets.map((b, i) => (
                        <div key={`bullet-${i}`} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                          <textarea
                            value={b}
                            rows={2}
                            maxLength={300}
                            onChange={(e) => updateMf("bullets", mf.bullets.map((x, k) => (k === i ? e.target.value : x)))}
                            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
                          />
                          <RemoveButton onClick={() => updateMf("bullets", mf.bullets.filter((_, k) => k !== i))} label={`Remove bullet ${i + 1}`} />
                        </div>
                      ))}
                    </div>
                    <RowActions onAdd={() => updateMf("bullets", [...mf.bullets, ""])} addLabel="Add a bullet" disabled={mf.bullets.length >= MAX_BULLETS} />
                  </div>

                  <div>
                    <Label>Product information ({mf.specs.length}/{MAX_SPECS})</Label>
                    <div style={{ display: "grid", gap: 8 }}>
                      {mf.specs.map((row: Spec, i) => (
                        <div key={`spec-${i}`} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                          <input
                            value={row.label}
                            maxLength={60}
                            placeholder="Label"
                            onChange={(e) => setListItem<Spec>("specs", mf.specs, i, { label: e.target.value })}
                            style={{ ...inputStyle, flex: "0 0 34%" }}
                          />
                          <input
                            value={row.value}
                            maxLength={160}
                            placeholder="Value"
                            onChange={(e) => setListItem<Spec>("specs", mf.specs, i, { value: e.target.value })}
                            style={inputStyle}
                          />
                          <RemoveButton onClick={() => removeAt<Spec>("specs", mf.specs, i)} label={`Remove row ${i + 1}`} />
                        </div>
                      ))}
                    </div>
                    <RowActions
                      onAdd={() => updateMf("specs", [...mf.specs, { label: "", value: "" }])}
                      addLabel="Add a row"
                      disabled={mf.specs.length >= MAX_SPECS}
                    />
                  </div>
                </>
              )}

              {/* ── 3 · Extras ────────────────────────────────────────── */}
              {step === 3 && (
                <>
                  <div>
                    <Label>Frequently bought together ({mf.bundle.length}/{MAX_BUNDLE})</Label>
                    <div style={{ display: "grid", gap: 10 }}>
                      {mf.bundle.map((item: BundleItem, i) => (
                        <Card key={`bundle-${i}`}>
                          <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                            <input
                              value={item.name}
                              maxLength={200}
                              placeholder="Name"
                              onChange={(e) => setListItem<BundleItem>("bundle", mf.bundle, i, { name: e.target.value })}
                              style={inputStyle}
                            />
                            <RemoveButton onClick={() => removeAt<BundleItem>("bundle", mf.bundle, i)} label={`Remove item ${i + 1}`} />
                          </div>
                          <input
                            value={item.price}
                            maxLength={24}
                            placeholder="Price (text — ₹0, Free, ∞)"
                            onChange={(e) => setListItem<BundleItem>("bundle", mf.bundle, i, { price: e.target.value })}
                            style={inputStyle}
                          />
                          <input
                            value={item.note ?? ""}
                            maxLength={200}
                            placeholder="Small note under it"
                            onChange={(e) => setListItem<BundleItem>("bundle", mf.bundle, i, { note: e.target.value })}
                            style={inputStyle}
                          />
                          <input
                            value={item.imageUrl}
                            maxLength={2000}
                            placeholder="Image URL"
                            onChange={(e) => setListItem<BundleItem>("bundle", mf.bundle, i, { imageUrl: e.target.value })}
                            style={inputStyle}
                          />
                        </Card>
                      ))}
                    </div>
                    <RowActions
                      onAdd={() => updateMf("bundle", [...mf.bundle, { name: "", price: "", imageUrl: "" }])}
                      addLabel="Add an item"
                      disabled={mf.bundle.length >= MAX_BUNDLE}
                    />
                  </div>

                  <div>
                    <Label>Customer questions ({mf.qa.length}/{MAX_QA})</Label>
                    <div style={{ display: "grid", gap: 10 }}>
                      {mf.qa.map((row: QA, i) => (
                        <Card key={`qa-${i}`}>
                          <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                            <input
                              value={row.question}
                              maxLength={240}
                              placeholder="Question"
                              onChange={(e) => setListItem<QA>("qa", mf.qa, i, { question: e.target.value })}
                              style={inputStyle}
                            />
                            <RemoveButton onClick={() => removeAt<QA>("qa", mf.qa, i)} label={`Remove question ${i + 1}`} />
                          </div>
                          <textarea
                            value={row.answer}
                            rows={2}
                            maxLength={600}
                            placeholder="Answer"
                            onChange={(e) => setListItem<QA>("qa", mf.qa, i, { answer: e.target.value })}
                            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
                          />
                          <div style={{ display: "flex", gap: 8 }}>
                            <input
                              value={row.by}
                              maxLength={60}
                              placeholder="Answered by"
                              onChange={(e) => setListItem<QA>("qa", mf.qa, i, { by: e.target.value })}
                              style={inputStyle}
                            />
                            <input
                              value={row.ago}
                              maxLength={48}
                              placeholder="asked 2 years ago"
                              onChange={(e) => setListItem<QA>("qa", mf.qa, i, { ago: e.target.value })}
                              style={inputStyle}
                            />
                          </div>
                        </Card>
                      ))}
                    </div>
                    <RowActions
                      onAdd={() => updateMf("qa", [...mf.qa, { question: "", answer: "", by: mf.sender.firstName || "Anonymous", ago: "", votes: 0 }])}
                      addLabel="Add a question"
                      disabled={mf.qa.length >= MAX_QA}
                    />
                  </div>
                </>
              )}

              {/* ── 4 · The note + your own review ────────────────────── */}
              {step === 4 && (
                <>
                  <Field label="Section heading" value={mf.aboutSection.heading} onChange={(v) => setAbout({ heading: v })} maxLength={120} />
                  <Field
                    label="From the seller"
                    value={mf.aboutSection.body}
                    onChange={(v) => setAbout({ body: v })}
                    rows={8}
                    maxLength={2000}
                    hint="Stop joking here. Blank lines make paragraphs. This is the part she keeps."
                  />
                  <Field label="Section image URL" value={mf.aboutSection.imageUrl ?? ""} onChange={(v) => setAbout({ imageUrl: v })} maxLength={2000} />
                  <Field
                    label="What her friends see on the review link"
                    value={mf.contributorPrompt}
                    onChange={(v) => updateMf("contributorPrompt", v)}
                    rows={2}
                    maxLength={240}
                  />

                  <div>
                    <Label>Reviews you write yourself ({mf.reviews.length}/{MAX_REVIEWS})</Label>
                    <p style={{ margin: "0 0 8px", fontSize: 11.5, color: C.secondary, ...WRAP }}>
                      Anything set to Published shows immediately. Her friends&rsquo; reviews arrive separately and
                      wait for you.
                    </p>
                    <div style={{ display: "grid", gap: 10 }}>
                      {mf.reviews.map((row: Review, i) => (
                        <Card key={row.id || `review-${i}`}>
                          <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                            <input
                              value={row.author}
                              maxLength={60}
                              placeholder="Who wrote it"
                              onChange={(e) => setListItem<Review>("reviews", mf.reviews, i, { author: e.target.value })}
                              style={inputStyle}
                            />
                            <RemoveButton onClick={() => removeAt<Review>("reviews", mf.reviews, i)} label={`Remove review ${i + 1}`} />
                          </div>
                          <input
                            value={row.title}
                            maxLength={160}
                            placeholder="Headline"
                            onChange={(e) => setListItem<Review>("reviews", mf.reviews, i, { title: e.target.value })}
                            style={inputStyle}
                          />
                          <textarea
                            value={row.body}
                            rows={3}
                            maxLength={2000}
                            placeholder="The review"
                            onChange={(e) => setListItem<Review>("reviews", mf.reviews, i, { body: e.target.value })}
                            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
                          />
                          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                            <select
                              value={String(row.stars)}
                              aria-label={`Stars for review ${i + 1}`}
                              onChange={(e) => setListItem<Review>("reviews", mf.reviews, i, { stars: (Number(e.target.value) || 5) as StarRating })}
                              style={{ ...inputStyle, width: "auto", flex: "0 0 auto" }}
                            >
                              {[5, 4, 3, 2, 1].map((n) => (
                                <option key={n} value={n}>
                                  {n} star{n === 1 ? "" : "s"}
                                </option>
                              ))}
                            </select>
                            <select
                              value={row.status}
                              aria-label={`Status for review ${i + 1}`}
                              onChange={(e) =>
                                setListItem<Review>("reviews", mf.reviews, i, {
                                  status: e.target.value === "published" ? "published" : "pending",
                                })
                              }
                              style={{ ...inputStyle, width: "auto", flex: "0 0 auto" }}
                            >
                              <option value="published">Published</option>
                              <option value="pending">Hidden</option>
                            </select>
                            <input
                              value={row.ago}
                              maxLength={48}
                              placeholder="Reviewed in India on …"
                              onChange={(e) => setListItem<Review>("reviews", mf.reviews, i, { ago: e.target.value })}
                              style={{ ...inputStyle, flex: "1 1 160px" }}
                            />
                          </div>
                        </Card>
                      ))}
                    </div>
                    <RowActions
                      onAdd={() =>
                        updateMf("reviews", [
                          ...mf.reviews,
                          {
                            id: `rv${Date.now().toString(36)}`,
                            author: mf.sender.firstName || "Anonymous",
                            stars: 5 as StarRating,
                            title: "",
                            body: "",
                            ago: "",
                            verified: true,
                            helpful: 0,
                            status: "published" as const,
                          },
                        ])
                      }
                      addLabel="Add a review"
                      disabled={mf.reviews.length >= MAX_REVIEWS}
                    />
                  </div>
                </>
              )}

              {/* ── 5 · Lock ──────────────────────────────────────────── */}
              {step === 5 && (
                <>
                  <Field
                    label="Password (optional)"
                    value={pagePassword}
                    onChange={setPagePassword}
                    placeholder="leave empty for no lock"
                    maxLength={64}
                    hint="Anyone opening the link will have to type this before the listing loads."
                  />
                  <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.6, color: C.secondary, ...WRAP }}>
                    Reviews her friends write always land waiting for you. Nothing they send appears on her page
                    until you approve it.
                  </p>
                </>
              )}
            </div>

            {/* Footer */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 16px calc(14px + env(safe-area-inset-bottom, 0px))",
                borderTop: `1px solid ${C.border}`,
              }}
            >
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  style={{
                    minHeight: 34,
                    padding: "7px 16px",
                    borderRadius: 100,
                    border: `1px solid ${C.border}`,
                    background: "#fff",
                    color: C.text,
                    fontFamily: FONT,
                    fontSize: 13.5,
                    cursor: "pointer",
                  }}
                >
                  Back
                </button>
              )}
              <div style={{ flex: 1 }} />
              {!isLast ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s + 1)}
                  style={{
                    minHeight: 34,
                    padding: "7px 22px",
                    borderRadius: 100,
                    border: "1px solid #E7B93C",
                    background: C.ctaYellow,
                    color: C.text,
                    fontFamily: FONT,
                    fontSize: 13.5,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onSave}
                  disabled={saving}
                  style={{
                    minHeight: 34,
                    padding: "7px 22px",
                    borderRadius: 100,
                    border: "1px solid #E08A2B",
                    background: C.ctaOrange,
                    color: C.text,
                    fontFamily: FONT,
                    fontSize: 13.5,
                    fontWeight: 700,
                    cursor: saving ? "default" : "pointer",
                    opacity: saving ? 0.6 : 1,
                  }}
                >
                  {saving ? "Saving…" : "Save & preview"}
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
