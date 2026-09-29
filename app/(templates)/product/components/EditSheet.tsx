"use client";

// ─── EditSheet — the one form ────────────────────────────────────────────────
//
// Three things are asked for up front — her name, your name, her photos — and
// the letter right under them. Everything else on the listing (title, price,
// bullets, specs, reviews…) is already written, by the AI or the demo, and
// lives behind "Fine-tune the listing", where every list is a plain textarea
// with one item per line. Save stays visible and says exactly what's missing.
//
// A bottom sheet on a phone; a right-hand drawer on a desktop so the live
// preview stays visible beside it. Every keystroke is autosaved by the hook.
//
// ── NOTHING PARSES MONEY ─────────────────────────────────────────────────────
// Price inputs are plain text: `type="number"` would make "∞" untypeable.

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { C, FONT } from "./tokens";
import {
  CROP_CENTER,
  LETTER_LIMITS,
  MAX_BULLETS,
  MAX_BUNDLE,
  MAX_OFFERS,
  MAX_QA,
  MAX_SPECS,
  MAX_TAGS,
  MAX_VARIANTS,
  type BundleItem,
  type PhotoCrop,
  type ProductData,
  type QA,
  type Review,
  type Spec,
  type StarRating,
} from "./types";
import PhotoGrid, { isSamplePhoto } from "./PhotoGrid";
import type { EditMode } from "../hooks/useProductEditor";

/** What still stops Save, in the sender's words. */
export function missingForSave(d: ProductData): string[] {
  const out: string[] = [];
  if (!d.subject.firstName.trim()) out.push("her name");
  if (!d.sender.firstName.trim()) out.push("your name");
  if (!d.subject.photos.some((p) => p && !isSamplePhoto(p))) out.push("at least one photo of her");
  return out;
}

/* ── Primitives ────────────────────────────────────────────────────────────── */

function Field({
  label,
  hint,
  required,
  children,
  count,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  count?: string;
}) {
  return (
    <label className="es-field">
      <span className="es-label">
        {label}
        {required ? <span style={{ color: C.love }}> *</span> : null}
        {count ? <span className="es-count">{count}</span> : null}
      </span>
      {children}
      {hint ? <span className="es-hint">{hint}</span> : null}
    </label>
  );
}

function Text({
  value,
  onChange,
  placeholder,
  max,
  big,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  max?: number;
  big?: boolean;
}) {
  return (
    <input
      className={`es-input${big ? " es-big" : ""}`}
      value={value}
      placeholder={placeholder}
      maxLength={max}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function Area({
  value,
  onChange,
  placeholder,
  max,
  rows = 4,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  max?: number;
  rows?: number;
}) {
  return (
    <textarea
      className="es-input es-area"
      value={value}
      placeholder={placeholder}
      maxLength={max}
      rows={rows}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

/**
 * A list as a textarea, one item per line. Keeps its own text so a half-typed
 * "Brand" (no colon yet) is never reformatted under the cursor; re-seeds only
 * when the list is replaced from outside (an AI fill).
 */
function Lines({
  value,
  format,
  onCommit,
  placeholder,
  maxItems,
  rows = 5,
}: {
  value: readonly unknown[];
  format: (item: unknown) => string;
  onCommit: (lines: string[]) => void;
  placeholder?: string;
  maxItems: number;
  rows?: number;
}) {
  const [text, setText] = useState(() => value.map(format).join("\n"));
  const [committed, setCommitted] = useState<readonly unknown[]>(value);
  if (value !== committed) {
    setCommitted(value);
    setText(value.map(format).join("\n"));
  }
  const n = text.split("\n").filter((l) => l.trim()).length;
  return (
    <>
      <textarea
        className="es-input es-area"
        value={text}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => {
          const t = e.target.value;
          setText(t);
          const lines = t
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean)
            .slice(0, maxItems);
          setCommitted(lines);
          onCommit(lines);
        }}
      />
      <span className="es-hint" style={{ textAlign: "right", color: n > maxItems ? C.priceRed : undefined }}>
        {Math.min(n, maxItems)}/{maxItems} lines
      </span>
    </>
  );
}

function Fold({ title, sub, children, defaultOpen = false }: { title: string; sub?: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`es-fold${open ? " open" : ""}`}>
      <button type="button" className="es-fold-h" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span style={{ minWidth: 0 }}>
          <span style={{ display: "block", fontWeight: 700, fontSize: 15 }}>{title}</span>
          {sub ? <span style={{ display: "block", fontSize: 12.5, color: C.secondary, marginTop: 2 }}>{sub}</span> : null}
        </span>
        <span className="es-chev" aria-hidden="true">
          ⌄
        </span>
      </button>
      {open ? <div className="es-fold-b">{children}</div> : null}
    </div>
  );
}

const fmtSpec = (s: unknown) => (typeof s === "string" ? s : `${(s as Spec).label}: ${(s as Spec).value}`);
const fmtQa = (q: unknown) => (typeof q === "string" ? q : `${(q as QA).question} | ${(q as QA).answer}`);
const fmtBundle = (b: unknown) => {
  if (typeof b === "string") return b;
  const x = b as BundleItem;
  return [x.name, x.price, x.note].filter((p) => p && p.trim()).join(" | ");
};
const fmtStr = (s: unknown) => String(s ?? "");

function today(): string {
  return new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

/* ── Reviews editor ────────────────────────────────────────────────────────── */

function ReviewsEditor({ reviews, onChange }: { reviews: Review[]; onChange: (r: Review[]) => void }) {
  const patch = (i: number, p: Partial<Review>) => onChange(reviews.map((r, k) => (k === i ? { ...r, ...p } : r)));
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {reviews.map((r, i) => (
        <div key={r.id} className="es-card">
          <div style={{ display: "flex", gap: 8 }}>
            <input className="es-input" style={{ flex: 1 }} value={r.author} maxLength={60} placeholder="Name" onChange={(e) => patch(i, { author: e.target.value })} aria-label="Reviewer name" />
            <select className="es-input" style={{ width: 86 }} value={r.stars} onChange={(e) => patch(i, { stars: Number(e.target.value) as StarRating })} aria-label="Stars">
              {[5, 4, 3, 2, 1].map((s) => (
                <option key={s} value={s}>
                  {s}★
                </option>
              ))}
            </select>
          </div>
          <input className="es-input" value={r.title} maxLength={160} placeholder="Headline" onChange={(e) => patch(i, { title: e.target.value })} aria-label="Review headline" />
          <textarea className="es-input es-area" rows={3} value={r.body} maxLength={2000} placeholder="The review" onChange={(e) => patch(i, { body: e.target.value })} aria-label="Review text" />
          <button type="button" className="es-textbtn" onClick={() => onChange(reviews.filter((_, k) => k !== i))}>
            Remove this review
          </button>
        </div>
      ))}
      {reviews.length < 12 && (
        <button
          type="button"
          className="es-ghost"
          onClick={() =>
            onChange([
              ...reviews,
              {
                id: `rv${Date.now().toString(36)}`,
                author: "",
                stars: 5,
                title: "",
                body: "",
                ago: `Reviewed in India on ${today()}`,
                verified: true,
                helpful: 0,
                status: "published",
              },
            ])
          }
        >
          + Add a review
        </button>
      )}
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
  const open = editMode === "manual" || editMode === "choose";
  const [lockOn, setLockOn] = useState(() => !!(mf.lockQuestion || "").trim());
  const missing = missingForSave(mf);
  const crops: PhotoCrop[] = mf.subject.photos.map((_, i) => mf.subject.crops?.[i] ?? CROP_CENTER);

  const setSubject = (p: Partial<ProductData["subject"]>) => updateMf("subject", { ...mf.subject, ...p });
  const setPrice = (p: Partial<ProductData["price"]>) => updateMf("price", { ...mf.price, ...p });
  const setAbout = (p: Partial<ProductData["aboutSection"]>) => updateMf("aboutSection", { ...mf.aboutSection, ...p });

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="es-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditMode("preview")}
            className="es-scrim"
          />
          <motion.div
            key="es-sheet"
            initial={{ y: "100%", x: 0 }}
            animate={{ y: 0, x: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="es-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Edit your listing"
          >
            <div className="es-head">
              <span className="es-grab" aria-hidden="true" />
              <div style={{ minWidth: 0 }}>
                <p className="es-title">List your person 🛒</p>
                <p className="es-sub">3 things and a letter. The AI wrote the rest — tweak anything below.</p>
              </div>
              <button type="button" className="es-x" onClick={() => setEditMode("preview")} aria-label="Close">
                ✕
              </button>
            </div>

            <div className="es-body">
              {/* 1 — who */}
              <section className="es-step">
                <p className="es-step-n">1 · The product</p>
                <div className="es-row2">
                  <Field label="Her first name" required>
                    <Text big value={mf.subject.firstName} max={60} placeholder="Meera" onChange={(v) => setSubject({ firstName: v })} />
                  </Field>
                  <Field label="Last name" hint="Optional — it goes in the title and the store name.">
                    <Text big value={mf.subject.lastName} max={60} placeholder="Sharma" onChange={(v) => setSubject({ lastName: v })} />
                  </Field>
                </div>
                <Field label="Your first name" required hint="You're the seller. And the delivery guy.">
                  <Text big value={mf.sender.firstName} max={60} placeholder="Karan" onChange={(v) => updateMf("sender", { ...mf.sender, firstName: v })} />
                </Field>
              </section>

              {/* 2 — photos */}
              <section className="es-step">
                <p className="es-step-n">2 · Her photos</p>
                <p className="es-hint" style={{ margin: "0 0 10px" }}>
                  Up to 8. Tap a photo to move and zoom it inside the square — that&apos;s exactly how it shows on the listing.
                </p>
                <PhotoGrid photos={mf.subject.photos} crops={crops} onChange={(photos, c) => setSubject({ photos, crops: c })} />
              </section>

              {/* 3 — letter */}
              <section className="es-step">
                <p className="es-step-n">3 · The note in the box 💌</p>
                <Field
                  label="Your letter"
                  hint="It waits in the bottom-right corner of her page as an envelope, and opens after she places her order."
                  count={`${mf.letter.length}/${LETTER_LIMITS.letter}`}
                >
                  <Area
                    value={mf.letter}
                    rows={7}
                    max={LETTER_LIMITS.letter}
                    placeholder="Write it like nobody else will read it. Nobody else will."
                    onChange={(v) => updateMf("letter", v)}
                  />
                </Field>
                <label className="es-check">
                  <input
                    type="checkbox"
                    checked={lockOn}
                    onChange={(e) => {
                      setLockOn(e.target.checked);
                      if (!e.target.checked) {
                        updateMf("lockQuestion", "");
                        updateMf("lockAnswer", "");
                      }
                    }}
                  />
                  <span>Ask her a question before it opens (the “no” button runs away)</span>
                </label>
                {lockOn && (
                  <div className="es-row2">
                    <Field label="The question">
                      <Text value={mf.lockQuestion} max={LETTER_LIMITS.lockQuestion} placeholder="Will you stay my favourite order forever?" onChange={(v) => updateMf("lockQuestion", v)} />
                    </Field>
                    <Field label="The yes button says">
                      <Text value={mf.lockAnswer} max={LETTER_LIMITS.lockAnswer} placeholder="Add to cart 💛" onChange={(v) => updateMf("lockAnswer", v)} />
                    </Field>
                  </div>
                )}
              </section>

              {/* 4 — fine-tune */}
              <section className="es-step">
                <p className="es-step-n">4 · Fine-tune the listing (optional)</p>
                <div style={{ display: "grid", gap: 8 }}>
                  <Fold title="Title, store & price" sub="The big lines at the top">
                    <Field label="Listing title">
                      <Area rows={2} value={mf.title} max={200} onChange={(v) => updateMf("title", v)} />
                    </Field>
                    <Field label="Store link">
                      <Text value={mf.storeName} max={80} placeholder="Visit the Sharma Store" onChange={(v) => updateMf("storeName", v)} />
                    </Field>
                    <div className="es-row2">
                      <Field label="Price" hint="Text, so ∞ works.">
                        <Text value={mf.price.amount} max={24} onChange={(v) => setPrice({ amount: v })} />
                      </Field>
                      <Field label="M.R.P. (struck through)">
                        <Text value={mf.price.original ?? ""} max={24} onChange={(v) => setPrice({ original: v })} />
                      </Field>
                    </div>
                    <div className="es-row2">
                      <Field label="Deal badge">
                        <Text value={mf.dealLabel} max={40} placeholder="Limited time deal" onChange={(v) => updateMf("dealLabel", v)} />
                      </Field>
                      <Field label="Bought line">
                        <Text value={mf.boughtLine} max={80} onChange={(v) => updateMf("boughtLine", v)} />
                      </Field>
                    </div>
                    <Field label="Stock line" hint="Say “only 1 left” and it turns red.">
                      <Text value={mf.stockLine} max={200} onChange={(v) => updateMf("stockLine", v)} />
                    </Field>
                    <Field label="Delivery promise" hint="Weekdays and dates go bold automatically.">
                      <Area rows={2} value={mf.deliveryLine} max={200} onChange={(v) => updateMf("deliveryLine", v)} />
                    </Field>
                  </Fold>

                  <Fold title="Moods & offers" sub="The swatches and the little offer cards">
                    <Field label="Swatch label">
                      <Text value={mf.variantLabel} max={30} placeholder="Mood" onChange={(v) => updateMf("variantLabel", v)} />
                    </Field>
                    <Field label="Swatches — one per line">
                      <Lines value={mf.variants} format={fmtStr} maxItems={MAX_VARIANTS} rows={4} onCommit={(l) => updateMf("variants", l)} />
                    </Field>
                    <Field label="Offers — one per line, “Label | text”">
                      <Lines value={mf.offers} format={fmtStr} maxItems={MAX_OFFERS} rows={4} onCommit={(l) => updateMf("offers", l)} />
                    </Field>
                  </Fold>

                  <Fold title="About this item" sub="The bullet points">
                    <Lines value={mf.bullets} format={fmtStr} maxItems={MAX_BULLETS} rows={7} onCommit={(l) => updateMf("bullets", l)} />
                  </Fold>

                  <Fold title="Product information" sub="The spec table — “Label: Value” per line">
                    <Lines value={mf.specs} format={fmtSpec} maxItems={MAX_SPECS} rows={8} onCommit={(l) => updateMf("specs", l)} />
                  </Fold>

                  <Fold title="Frequently bought together" sub="“Name | Price | Note” per line">
                    <Lines value={mf.bundle} format={fmtBundle} maxItems={MAX_BUNDLE} rows={4} onCommit={(l) => updateMf("bundle", l)} />
                  </Fold>

                  <Fold title="From the manufacturer" sub="The sincere bit, in serif">
                    <Field label="Heading">
                      <Text value={mf.aboutSection.heading} max={120} onChange={(v) => setAbout({ heading: v })} />
                    </Field>
                    <Field label="What you actually want to say">
                      <Area rows={6} value={mf.aboutSection.body} max={2000} onChange={(v) => setAbout({ body: v })} />
                    </Field>
                  </Fold>

                  <Fold title="Customers say" sub="The AI-summary box above the reviews">
                    <Area rows={5} value={mf.customersSay} max={700} onChange={(v) => updateMf("customersSay", v)} />
                    <Field label="Chips — one per line">
                      <Lines value={mf.customersSayTags} format={fmtStr} maxItems={MAX_TAGS} rows={4} onCommit={(l) => updateMf("customersSayTags", l)} />
                    </Field>
                  </Fold>

                  <Fold title="Reviews" sub="Seed a few. Her friends can add more from the review link after you publish.">
                    <ReviewsEditor reviews={mf.reviews} onChange={(r) => updateMf("reviews", r)} />
                    <Field label="What her friends see on the review link">
                      <Area rows={2} value={mf.contributorPrompt} max={240} onChange={(v) => updateMf("contributorPrompt", v)} />
                    </Field>
                  </Fold>

                  <Fold title="Questions & answers" sub="“Question | Answer” per line">
                    <Lines value={mf.qa} format={fmtQa} maxItems={MAX_QA} rows={6} onCommit={(l) => updateMf("qa", l)} />
                  </Fold>

                  <Fold title="Password" sub="Optional — she types it to open the page">
                    <input
                      className="es-input"
                      value={pagePassword}
                      maxLength={128}
                      placeholder="e.g. the name of your first date spot"
                      onChange={(e) => setPagePassword(e.target.value)}
                    />
                  </Fold>
                </div>
              </section>
            </div>

            <div className="es-foot">
              {missing.length > 0 ? (
                <p className="es-missing">Still needed: {missing.join(", ")}</p>
              ) : (
                <p className="es-ready">✓ Ready. Save to see her listing.</p>
              )}
              <button type="button" className="es-save" onClick={onSave} disabled={saving || missing.length > 0}>
                {saving ? "Saving…" : "Save & preview"}
              </button>
            </div>
          </motion.div>

          <style>{`
            .es-scrim { position: fixed; inset: 0; z-index: 200; background: rgba(15,17,17,.45); }
            .es-sheet {
              position: fixed; left: 0; right: 0; bottom: 0; z-index: 201; height: 92dvh; display: flex; flex-direction: column;
              background: #fff; border-radius: 20px 20px 0 0; font-family: ${FONT}; color: ${C.text}; box-shadow: 0 -12px 40px rgba(0,0,0,.25);
            }
            @media (min-width: 900px) {
              .es-sheet { left: auto; top: 0; height: 100dvh; width: 520px; border-radius: 0; }
            }
            .es-head { position: relative; display: flex; align-items: flex-start; gap: 12px; padding: 18px 18px 12px; border-bottom: 1px solid ${C.hairline}; }
            .es-grab { position: absolute; top: 7px; left: 50%; width: 40px; height: 4px; margin-left: -20px; border-radius: 4px; background: #D5D9D9; }
            @media (min-width: 900px) { .es-grab { display: none; } }
            .es-title { margin: 0; font-size: 20px; font-weight: 800; }
            .es-sub { margin: 3px 0 0; font-size: 13px; color: ${C.secondary}; line-height: 1.4; }
            .es-x { margin-left: auto; flex: none; width: 36px; height: 36px; border-radius: 50%; border: 0; background: #F0F2F2; cursor: pointer; font-size: 14px; }
            .es-body { flex: 1; overflow-y: auto; padding: 6px 18px 24px; overscroll-behavior: contain; }
            .es-step { padding: 16px 0 6px; border-bottom: 1px dashed ${C.hairline}; }
            .es-step:last-child { border-bottom: 0; }
            .es-step-n { margin: 0 0 10px; font-size: 12px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: ${C.love}; }
            .es-row2 { display: grid; gap: 0 12px; }
            @media (min-width: 480px) { .es-row2 { grid-template-columns: 1fr 1fr; } }
            .es-field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 12px; min-width: 0; }
            .es-label { display: flex; align-items: baseline; gap: 4px; font-size: 13px; font-weight: 700; color: ${C.text}; }
            .es-count { margin-left: auto; font-weight: 400; font-size: 11.5px; color: ${C.secondary}; font-variant-numeric: tabular-nums; }
            .es-hint { font-size: 12px; color: ${C.secondary}; line-height: 1.4; display: block; }
            .es-input {
              width: 100%; min-width: 0; padding: 10px 12px; border-radius: 10px; border: 1px solid #A6A6A6; background: #fff;
              font: 400 16px ${FONT}; color: ${C.text}; outline: none; box-shadow: 0 1px 2px rgba(15,17,17,.1) inset; transition: border-color .15s ease, box-shadow .15s ease;
            }
            .es-input:focus { border-color: #007185; box-shadow: 0 0 0 3px #C8F3FA; }
            .es-big { padding: 13px 14px; font-size: 17px; }
            .es-area { resize: vertical; line-height: 1.5; }
            .es-check { display: flex; gap: 10px; align-items: flex-start; font-size: 14px; margin: 2px 0 12px; cursor: pointer; line-height: 1.4; }
            .es-check input { accent-color: ${C.love}; width: 18px; height: 18px; margin: 1px 0 0; flex: none; }
            .es-fold { border: 1px solid ${C.border}; border-radius: 12px; overflow: hidden; }
            .es-fold-h { width: 100%; display: flex; align-items: center; gap: 10px; padding: 12px 14px; border: 0; background: #fff; cursor: pointer; text-align: left; font-family: ${FONT}; color: ${C.text}; }
            .es-fold-h:hover { background: #F7FAFA; }
            .es-chev { margin-left: auto; font-size: 18px; color: ${C.secondary}; transition: transform .2s ease; }
            .es-fold.open .es-chev { transform: rotate(180deg); }
            .es-fold-b { padding: 4px 14px 12px; border-top: 1px solid ${C.hairline}; display: grid; gap: 4px; }
            .es-card { display: grid; gap: 8px; padding: 12px; border: 1px solid ${C.hairline}; border-radius: 10px; background: #FAFAFA; }
            .es-textbtn { justify-self: start; border: 0; background: none; color: ${C.priceRed}; font: 400 13px ${FONT}; cursor: pointer; padding: 0; }
            .es-ghost { padding: 11px; border-radius: 10px; border: 1px dashed #A6A6A6; background: #fff; font: 700 14px ${FONT}; cursor: pointer; color: ${C.text}; }
            .es-foot { padding: 12px 18px calc(14px + env(safe-area-inset-bottom, 0px)); border-top: 1px solid ${C.hairline}; background: #fff; display: grid; gap: 8px; }
            .es-missing { margin: 0; font-size: 13px; color: ${C.priceRed}; font-weight: 700; }
            .es-ready { margin: 0; font-size: 13px; color: ${C.okGreen}; font-weight: 700; }
            .es-save {
              min-height: 50px; border-radius: 100px; border: 1px solid ${C.ctaYellowEdge}; background: ${C.ctaYellow}; color: ${C.text};
              font: 700 16px ${FONT}; cursor: pointer; transition: background .12s ease, transform .12s ease;
            }
            .es-save:hover:not(:disabled) { background: ${C.ctaYellowHover}; }
            .es-save:active:not(:disabled) { transform: scale(.98); }
            .es-save:disabled { opacity: .5; cursor: not-allowed; }
          `}</style>
        </>
      )}
    </AnimatePresence>
  );
}
