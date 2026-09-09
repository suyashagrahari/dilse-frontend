"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, Loader2, Lock, Plus, SlidersHorizontal, Trash2, X } from "lucide-react";
import { GC, BRAND_GRADIENT } from "./theme";
import type { EditMode, GaneshData } from "./types";
import { decodeUpright } from "./photoCrop";
import { displayUrl, dropLocal, isLocalRef, putLocal } from "./mediaStore";
import PhotoAdjuster from "./PhotoAdjuster";
import { useIsDesktop } from "./useIsDesktop";

// ─── The builder ─────────────────────────────────────────────────────────────
//
// ── ONE PANEL, NO TABS ──────────────────────────────────────────────────────
//
// The first version had four tabs — Wish, Mandap, Ashirvad, Extras — and about
// twenty-five controls behind them, including a four-way wall-colour picker and
// a twelve-slot photo grid. Filling it in was a bigger job than writing the page
// by hand.
//
// Half the fields went with the mandap and the photo grid (see the note at the
// top of `models/GaneshChaturthiPage.ts`), and what is left fits in one scroll:
// two names, a city, one photo, the greeting lines, the aarti line, the wish
// rows, and three optional extras at the bottom. Tabs exist to buy vertical
// space and there is no longer anything to buy it for — a jump-nav over four
// sections of two fields each is three hidden fields and a reason to hunt.
//
// The section headings stay, because they group the form the same way the page
// groups itself, and a sender who has just scrolled the page recognises them.
//
// ── PHONE: a bottom sheet. DESKTOP (≥1024px): a docked rail. ────────────────
//
// Same component, same fields, two geometries, and the switch is in `ganesh.css`
// under one media query rather than in a second copy of the form. On the rail
// the live page sits beside it, so the sender watches it change as they type
// instead of closing a sheet to look.
//
// ── NOTHING IS UPLOADED FROM HERE ───────────────────────────────────────────
//
// A picked photo is cropped, baked to a WebP square, written to IndexedDB and
// carried in the form as `idb:<id>`. `useGaneshEditor` uploads it at publish.
//
// That is what removes the sign-in problem rather than working around it.
// `/media/upload` needs a token, so a form that uploaded on pick could not
// accept a photo from a signed-out visitor at all — and the usual workaround,
// raising the auth modal when they pick one, still asks somebody to open an
// account before they can see their own face on the page. Now the whole page is
// built signed out and the account is needed once, at publish, where it was
// always required.

type Slot = "hero" | "qr";

/**
 * Baked square edge, in px.
 *
 * 1080 because this photo is also the story-card image, which exports at 1080
 * wide. There is no second, smaller output any more — the twelve-slot grid that
 * needed one is gone.
 */
const OUT_PHOTO = 1080;

const MAX_GREETING = 4;
const MAX_WISHES = 6;

const field: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: 12,
  border: `1px solid ${GC.hairlineStrong}`,
  background: GC.paper,
  color: GC.ink,
  fontSize: 15.5,
  fontFamily: "inherit",
  lineHeight: 1.5,
  minHeight: 46,
  display: "block",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: GC.muted,
  marginBottom: 6,
  letterSpacing: 0.1,
};

const ghostButton: React.CSSProperties = {
  minHeight: 44,
  padding: "10px 14px",
  borderRadius: 11,
  border: `1px dashed ${GC.hairlineStrong}`,
  background: "transparent",
  color: GC.muted,
  fontSize: 13.5,
  fontWeight: 600,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
};

const iconButton: React.CSSProperties = {
  width: 44,
  minHeight: 44,
  flexShrink: 0,
  borderRadius: 11,
  border: `1px solid ${GC.hairline}`,
  background: GC.surface,
  color: GC.muted,
  cursor: "pointer",
  display: "grid",
  placeItems: "center",
};

/** A field label plus its control, with optional help underneath. */
function Field({
  label,
  hint,
  htmlFor,
  count,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  /** e.g. "12/24" — right-aligned on the label row wherever a cap exists. */
  count?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
        <label style={labelStyle} htmlFor={htmlFor}>
          {label}
        </label>
        {count && (
          <span
            style={{
              fontSize: 11,
              color: GC.muted,
              marginBottom: 6,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {count}
          </span>
        )}
      </div>
      {children}
      {hint && (
        <p style={{ fontSize: 11.5, color: GC.muted, margin: "6px 0 0", lineHeight: 1.5 }}>{hint}</p>
      )}
    </div>
  );
}

function Group({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 26 }}>
      <p className="gc-eyebrow" style={{ margin: "0 0 6px" }}>
        {title}
      </p>
      {hint && (
        <p style={{ fontSize: 12.5, color: GC.muted, margin: "0 0 12px", lineHeight: 1.55 }}>
          {hint}
        </p>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{children}</div>
    </section>
  );
}

/**
 * A textarea that grows with what the sender writes.
 *
 * Every prose slot in this form is one of these rather than a single-line
 * `<input>`, including the greeting lines that are the largest text on the page.
 * A one-line box tells somebody to write one short thing and then hides the
 * middle of it while they type — you cannot read back a sentence you cannot see.
 *
 * Height is set by touching `style.height` directly rather than by holding rows
 * in state: this runs on every keystroke, and a state write per keystroke would
 * re-render the whole panel to move a border by 20 pixels.
 */
function AutoTextarea({
  value,
  onChange,
  placeholder,
  maxLength,
  minRows = 2,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  minRows?: number;
  id?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const fit = useCallback((el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  // Also runs when the value arrives from outside — an AI fill drops three
  // finished lines in without anyone typing, and they must not open collapsed.
  useEffect(() => {
    fit(ref.current);
  }, [value, fit]);

  return (
    <textarea
      id={id}
      ref={ref}
      value={value}
      rows={minRows}
      maxLength={maxLength}
      placeholder={placeholder}
      onChange={(e) => {
        onChange(e.target.value);
        fit(e.currentTarget);
      }}
      style={{ ...field, resize: "none", overflow: "hidden" }}
    />
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
  mf: GaneshData;
  updateMf: (key: keyof GaneshData, val: unknown) => void;
  pagePassword: string;
  setPagePassword: (v: string) => void;
  onSave: () => void;
  saving: boolean;
}) {
  const visible = editMode === "manual" || editMode === "choose";
  const [busy, setBusy] = useState<Slot | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const isDesktop = useIsDesktop();

  // The photo being adjusted, before it is baked and held.
  const [adjusting, setAdjusting] = useState<{ bitmap: ImageBitmap; slot: Slot } | null>(null);

  const photoRef = useRef<HTMLInputElement>(null);
  const qrRef = useRef<HTMLInputElement>(null);

  const setVargani = (patch: Partial<GaneshData["vargani"]>) =>
    updateMf("vargani", { ...mf.vargani, ...patch });

  const hold = useCallback(
    async (file: File, slot: Slot) => {
      setBusy(slot);
      setErr(null);
      const r = await putLocal(file, slot);
      setBusy(null);
      if (!r.ok || !r.ref) {
        setErr(r.error ?? "Could not add that photo");
        return;
      }
      if (slot === "hero") updateMf("photoUrl", r.ref);
      else updateMf("vargani", { ...mf.vargani, qrImageUrl: r.ref });
      // Release the decoded bitmap — it is the full-resolution photograph.
      setAdjusting((a) => {
        a?.bitmap.close();
        return null;
      });
    },
    [mf.vargani, updateMf]
  );

  /** A file was chosen → decode it, then open the adjuster (or hold a QR). */
  const choose = useCallback(
    async (file: File, slot: Slot) => {
      setErr(null);

      // A payment code is never cropped: it needs its quiet border, and zooming
      // into one is how you make it unscannable.
      if (slot === "qr") {
        void hold(file, slot);
        return;
      }

      const bitmap = await decodeUpright(file);
      if (!bitmap) {
        setErr("That image could not be opened — try a JPG or PNG");
        return;
      }
      setAdjusting({ bitmap, slot });
    },
    [hold]
  );

  const closeAdjuster = useCallback(() => {
    setAdjusting((a) => {
      a?.bitmap.close();
      return null;
    });
  }, []);

  /** Removing a photo forgets the held blob too, rather than orphaning it. */
  const forget = useCallback((ref: string) => {
    if (isLocalRef(ref)) void dropLocal(ref);
  }, []);

  const setWishRow = (i: number, patch: { label?: string; value?: string }) =>
    updateMf("wishes", mf.wishes.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  const canSave = mf.recipientName.trim().length > 0;
  const railed = isDesktop && visible;

  return (
    <>
      <AnimatePresence>
        {visible && (
          <>
            {/* No scrim on the rail: it dims the very page the rail exists to
                let the sender watch. On a phone the sheet covers it anyway. */}
            {!railed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setEditMode("preview")}
                className="fixed inset-0 z-[60]"
                style={{ background: "rgba(46,33,25,0.45)" }}
              />
            )}

            <motion.div
              className="gc-editor gc-root"
              initial={isDesktop ? { x: -40, opacity: 0 } : { y: "100%" }}
              animate={isDesktop ? { x: 0, opacity: 1 } : { y: 0 }}
              exit={isDesktop ? { x: -40, opacity: 0 } : { y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
            >
              <div className="gc-editor-head">
                <div>
                  <p
                    className="gc-display"
                    style={{ fontSize: 18, fontWeight: 700, color: GC.maroon, margin: 0 }}
                  >
                    Make your page
                  </p>
                  <p style={{ fontSize: 11.5, color: GC.muted, margin: "3px 0 0" }}>
                    {railed
                      ? "It updates beside you as you type."
                      : "Everything here is optional except the first name."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditMode("preview")}
                  aria-label="Close"
                  style={{
                    width: 34,
                    height: 34,
                    flexShrink: 0,
                    borderRadius: 999,
                    border: `1px solid ${GC.hairline}`,
                    background: GC.surface,
                    color: GC.ink,
                    display: "grid",
                    placeItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="gc-editor-body">
                {err && (
                  <p
                    role="alert"
                    style={{
                      fontSize: 12.5,
                      color: GC.maroon,
                      background: "rgba(158,43,43,0.07)",
                      border: "1px solid rgba(158,43,43,0.18)",
                      padding: "9px 12px",
                      borderRadius: 10,
                      marginBottom: 16,
                    }}
                  >
                    {err}
                  </p>
                )}

                <Group title="Who it's for">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
                    {/* The form opens as a finished draft, so the one field that
                        gates Save is also the one that has to be obviously
                        unfilled. */}
                    <Field
                      label="Their name"
                      htmlFor="gc-to"
                      hint={!canSave ? "Needed before you can save." : undefined}
                    >
                      <input
                        id="gc-to"
                        style={{
                          ...field,
                          ...(canSave ? null : { borderColor: GC.gold, borderStyle: "dashed" }),
                        }}
                        value={mf.recipientName}
                        onChange={(e) => updateMf("recipientName", e.target.value)}
                        placeholder="Aditi"
                      />
                    </Field>
                    <Field label="Your name" htmlFor="gc-from">
                      <input
                        id="gc-from"
                        style={field}
                        value={mf.senderName}
                        onChange={(e) => updateMf("senderName", e.target.value)}
                        placeholder="Rohit"
                      />
                    </Field>
                  </div>
                  <Field label="Where you are" htmlFor="gc-city" hint="Optional. Prints under your name.">
                    <input
                      id="gc-city"
                      style={field}
                      value={mf.city}
                      onChange={(e) => updateMf("city", e.target.value)}
                      placeholder="Pune"
                    />
                  </Field>
                </Group>

                <Group
                  title="Your photo"
                  hint="One picture, in a round gold frame partway down the page. It is also the photo on the card you can post to your story."
                >
                  <PhotoSlot
                    url={displayUrl(mf.photoUrl)}
                    busy={busy === "hero"}
                    size={150}
                    emptyLabel="Add a photo"
                    onPick={() => photoRef.current?.click()}
                    onRemove={() => {
                      forget(mf.photoUrl);
                      updateMf("photoUrl", "");
                    }}
                  />
                  <input
                    ref={photoRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void choose(f, "hero");
                      e.target.value = "";
                    }}
                  />
                </Group>

                <Group
                  title="What you want to say"
                  hint="Three lines under the title, set large and one below the other. Each should stand on its own."
                >
                  {mf.greeting.map((line, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <AutoTextarea
                          value={line}
                          maxLength={90}
                          placeholder={i === 0 ? "He is home again." : "One more line…"}
                          onChange={(v) => {
                            const next = [...mf.greeting];
                            next[i] = v;
                            updateMf("greeting", next);
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => updateMf("greeting", mf.greeting.filter((_, j) => j !== i))}
                        aria-label={`Remove line ${i + 1}`}
                        style={iconButton}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                  {mf.greeting.length < MAX_GREETING && (
                    <button
                      type="button"
                      onClick={() => updateMf("greeting", [...mf.greeting, ""])}
                      style={ghostButton}
                    >
                      <Plus size={15} /> Add a line
                    </button>
                  )}
                </Group>

                <Group
                  title="Your line at the aarti"
                  hint="Shown alone on the screen while the lamp goes round. The quietest moment on the page — one sentence."
                >
                  <Field label="One sentence" htmlFor="gc-aarti" count={`${mf.aartiLine.length}/120`}>
                    <AutoTextarea
                      id="gc-aarti"
                      value={mf.aartiLine}
                      maxLength={120}
                      placeholder="Whatever else changes, this week always brings everyone home."
                      onChange={(v) => updateMf("aartiLine", v)}
                    />
                  </Field>
                </Group>

                <Group
                  title="What you're hoping for"
                  hint="Two columns — who or what it is for on the left, what you are hoping on the right. Three real rows beat six invented ones."
                >
                  {mf.wishes.map((row, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <div style={{ flex: 1, minWidth: 0, display: "grid", gap: 7 }}>
                        <input
                          style={field}
                          maxLength={44}
                          value={row.label}
                          onChange={(e) => setWishRow(i, { label: e.target.value })}
                          placeholder="For my mother's knee"
                          aria-label={`Hoping for, row ${i + 1} — who or what`}
                        />
                        <input
                          style={{ ...field, minHeight: 42, fontSize: 14.5 }}
                          maxLength={30}
                          value={row.value}
                          onChange={(e) => setWishRow(i, { value: e.target.value })}
                          placeholder="one painless year"
                          aria-label={`Hoping for, row ${i + 1} — what`}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => updateMf("wishes", mf.wishes.filter((_, j) => j !== i))}
                        aria-label={`Remove row ${i + 1}`}
                        style={iconButton}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                  {mf.wishes.length < MAX_WISHES && (
                    <button
                      type="button"
                      onClick={() => updateMf("wishes", [...mf.wishes, { label: "", value: "" }])}
                      style={ghostButton}
                    >
                      <Plus size={15} /> Add a row
                    </button>
                  )}
                </Group>

                <Group
                  title="A line with the sweet"
                  hint="Printed beside the modak near the end. Light and domestic."
                >
                  <Field label="Optional" htmlFor="gc-prasad" count={`${mf.prasadNote.length}/120`}>
                    <AutoTextarea
                      id="gc-prasad"
                      value={mf.prasadNote}
                      maxLength={120}
                      placeholder="There were fourteen of them this morning. There are four now."
                      onChange={(v) => updateMf("prasadNote", v)}
                    />
                  </Field>
                </Group>

                <Group
                  title="For the pandal"
                  hint="Only if your building or your friends are collecting. It appears as an invitation with no amount on it, and the page never records who paid."
                >
                  <Field label="Your UPI ID" htmlFor="gc-upi" hint="Leave blank to hide the whole block.">
                    <input
                      id="gc-upi"
                      style={field}
                      value={mf.vargani.upiId}
                      onChange={(e) => setVargani({ upiId: e.target.value })}
                      placeholder="rohit@upi"
                      autoComplete="off"
                      spellCheck={false}
                    />
                  </Field>
                  <Field
                    label="Or a code screenshot"
                    hint="Not cropped — a payment code needs its border to stay scannable."
                  >
                    <PhotoSlot
                      url={displayUrl(mf.vargani.qrImageUrl)}
                      busy={busy === "qr"}
                      size={110}
                      fit="contain"
                      emptyLabel="Add code"
                      onPick={() => qrRef.current?.click()}
                      onRemove={() => {
                        forget(mf.vargani.qrImageUrl);
                        setVargani({ qrImageUrl: "" });
                      }}
                    />
                    <input
                      ref={qrRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) void choose(f, "qr");
                        e.target.value = "";
                      }}
                    />
                  </Field>
                  <Field label="A line beside it" htmlFor="gc-varnote" count={`${mf.vargani.note.length}/120`}>
                    <AutoTextarea
                      id="gc-varnote"
                      value={mf.vargani.note}
                      maxLength={120}
                      placeholder="Whatever you feel like. It all goes on the decorations."
                      onChange={(v) => setVargani({ note: v })}
                    />
                  </Field>
                </Group>

                <Group
                  title="Lock it"
                  hint="Optional. With a password set, anyone opening the link has to type it first."
                >
                  <Field label="Password" htmlFor="gc-pw">
                    <div style={{ position: "relative" }}>
                      <input
                        id="gc-pw"
                        style={{ ...field, paddingLeft: 38 }}
                        value={pagePassword}
                        onChange={(e) => setPagePassword(e.target.value)}
                        placeholder="Leave blank for no password"
                        autoComplete="off"
                        spellCheck={false}
                      />
                      <Lock
                        size={15}
                        style={{
                          position: "absolute",
                          left: 13,
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: GC.muted,
                        }}
                      />
                    </div>
                  </Field>
                </Group>

                {/* ── The dates ────────────────────────────────────────────────
                 *
                 * Editable, and prefilled for 2026, because the page stores them
                 * per document rather than reading a constant. Somebody
                 * reopening a link next September gets the right countdown
                 * instead of one that expired a year ago. */}
                <Group title="The dates" hint="Prefilled for 2026. Change them if your almanac differs.">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
                    <Field label="Chaturthi" htmlFor="gc-date">
                      <input
                        id="gc-date"
                        type="date"
                        style={field}
                        value={mf.festivalDate}
                        onChange={(e) => updateMf("festivalDate", e.target.value)}
                      />
                    </Field>
                    <Field label="Visarjan" htmlFor="gc-vis">
                      <input
                        id="gc-vis"
                        type="date"
                        style={field}
                        value={mf.visarjanDate}
                        onChange={(e) => updateMf("visarjanDate", e.target.value)}
                      />
                    </Field>
                  </div>
                </Group>
              </div>

              <div className="gc-editor-foot">
                <button
                  type="button"
                  onClick={onSave}
                  disabled={saving || !canSave}
                  style={{
                    width: "100%",
                    minHeight: 50,
                    borderRadius: 999,
                    background: BRAND_GRADIENT,
                    color: "#FFFDF9",
                    border: "none",
                    boxShadow: "0 14px 26px -16px rgba(222,138,44,0.7)",
                    fontSize: 15.5,
                    fontWeight: 600,
                    cursor: saving || !canSave ? "default" : "pointer",
                    opacity: saving || !canSave ? 0.55 : 1,
                  }}
                >
                  {saving ? "Saving…" : canSave ? "Save and see it" : "Add their name first"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {adjusting && (
          <PhotoAdjuster
            key="adjuster"
            bitmap={adjusting.bitmap}
            out={OUT_PHOTO}
            title="Your photo"
            busy={busy === adjusting.slot}
            onConfirm={(file) => void hold(file, adjusting.slot)}
            onCancel={closeAdjuster}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/** An image slot: the picture when there is one, a dashed target when not. */
function PhotoSlot({
  url,
  busy,
  size,
  emptyLabel,
  fit = "cover",
  onPick,
  onRemove,
}: {
  url: string;
  busy: boolean;
  size: number;
  emptyLabel: string;
  fit?: "cover" | "contain";
  onPick: () => void;
  onRemove: () => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 10, flexWrap: "wrap" }}>
      <button
        type="button"
        onClick={onPick}
        disabled={busy}
        style={{
          width: size,
          height: size,
          // Round for the photo, square-ish for a payment code — the frame here
          // mirrors the frame on the page, so the crop the sender chooses is the
          // crop they see.
          borderRadius: fit === "contain" ? 14 : "50%",
          border: url ? `1px solid ${GC.goldSoft}` : `1.5px dashed ${GC.hairlineStrong}`,
          background: url ? (fit === "contain" ? "#fff" : "transparent") : GC.paper,
          display: "grid",
          placeItems: "center",
          cursor: busy ? "default" : "pointer",
          overflow: "hidden",
          padding: 0,
          flexShrink: 0,
        }}
      >
        {busy ? (
          <Loader2 size={22} className="animate-spin" color={GC.muted} />
        ) : url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: fit }} />
        ) : (
          <span style={{ display: "grid", placeItems: "center", gap: 7, color: GC.muted }}>
            <Camera size={22} />
            <span style={{ fontSize: 12, fontWeight: 600 }}>{emptyLabel}</span>
          </span>
        )}
      </button>

      {url && !busy && (
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          <button
            type="button"
            onClick={onPick}
            style={{
              minHeight: 40,
              padding: "8px 13px",
              borderRadius: 10,
              border: `1px solid ${GC.hairlineStrong}`,
              background: GC.surface,
              color: GC.ink,
              fontSize: 12.5,
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <SlidersHorizontal size={13} /> Change
          </button>
          <button
            type="button"
            onClick={onRemove}
            style={{
              minHeight: 40,
              padding: "8px 13px",
              borderRadius: 10,
              border: `1px solid ${GC.hairline}`,
              background: "transparent",
              color: GC.muted,
              fontSize: 12.5,
              cursor: "pointer",
            }}
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}
