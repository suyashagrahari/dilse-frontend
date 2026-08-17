"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, Check, ImagePlus, Loader2, Lock, Plus, SlidersHorizontal, Trash2, X } from "lucide-react";
import { RB, BRAND_GRADIENT, CARD_BORDER, CARD_SHADOW, charmGlyph } from "./theme";
import { SAMPLE, type EditMode, type RakhiData, type RakhiCharm } from "./types";
import { decodeUpright } from "./photoCrop";
import { displayUrl, dropLocal, isLocalRef, putLocal } from "./mediaStore";
import PhotoAdjuster from "./PhotoAdjuster";
import { useIsDesktop } from "./Stage";

// ─── The builder ─────────────────────────────────────────────────────────────
//
// ── PHONE: a bottom sheet with four tabs. DESKTOP: a docked rail. ────────────
//
// Same component, same fields, two geometries, and the switch is in `rakhi.css`
// under one media query rather than in a second copy of the form. At ≥1024px it
// leaves the bottom of the screen and becomes a fixed 420px column on the left
// with the live preview beside it, so she watches her page change as she types
// instead of closing a sheet to look at it.
//
// The TABS also go away at that width. Tabs exist to buy vertical space, and a
// full-height rail has vertical space to spare; four of them next to one short
// panel is just three hidden sections and a reason to hunt. On the rail every
// section is in one scroll with a sticky jump-nav above it. Because the section
// bodies are declared once, in `SECTIONS` below, neither layout duplicates any
// field markup.
//
// ── UPLOADS AND SIGNING IN ──────────────────────────────────────────────────
//
// `/media/upload` needs a token. This form used to answer that by printing
// "Sign in to add photos" into an alert at the top of a scrolling panel and
// stopping there — no sign-in button, nothing to press, and the panel was
// usually scrolled past the message. Picking a photo while signed out simply
// did nothing, which is what it was reported as.
//
// Now the picked file is held in `pendingRef`, the page is asked to open the
// auth modal, and the effect below fires the upload the moment a token appears.
// She never picks the same photo twice.

type Slot = "hero" | "memory" | "qr";

/** The four sections. Labels live with the bodies, in `sections` below. */
type TabId = "bhai" | "rakhi" | "memories" | "shagun";

const CHARMS: { id: RakhiCharm; label: string }[] = [
  { id: "om", label: "Om" },
  { id: "swastik", label: "Swastik" },
  { id: "evil-eye", label: "Nazar" },
  { id: "heart", label: "Heart" },
  { id: "star", label: "Star" },
];

const THREADS: [string, string][] = [
  ["#9B2226", "#E8913A"],
  ["#7B2CBF", "#F72585"],
  ["#0E6B6B", "#B08D57"],
  ["#1D3557", "#E63946"],
  ["#2F6B4F", "#F4A261"],
];

/** Baked square edge, in px. The hero is also the story-card image. */
const OUT_HERO = 1080;
const OUT_MEMORY = 720;

const MAX_GREETING = 6;
const MAX_LEDGER = 8;
const MAX_MEMORIES = 12;

const field: React.CSSProperties = {
  width: "100%",
  padding: "11px 13px",
  borderRadius: 12,
  border: `1px solid ${RB.hairline}`,
  background: RB.surface,
  color: RB.ink,
  fontSize: 15,
  fontFamily: "inherit",
  lineHeight: 1.5,
  minHeight: 46,
  display: "block",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 700,
  color: RB.muted,
  marginBottom: 6,
  letterSpacing: 0.2,
};

const ghostButton: React.CSSProperties = {
  minHeight: 44,
  padding: "10px 14px",
  borderRadius: 11,
  border: `1px dashed ${RB.hairline}`,
  background: "transparent",
  color: RB.muted,
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
  border: `1px solid ${RB.hairline}`,
  background: RB.surface,
  color: RB.muted,
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
  /** e.g. "12/16" — shown right-aligned on the label row where a cap exists. */
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
          <span style={{ fontSize: 11, color: RB.muted, marginBottom: 6, fontVariantNumeric: "tabular-nums" }}>
            {count}
          </span>
        )}
      </div>
      {children}
      {hint && <p style={{ fontSize: 11.5, color: RB.muted, margin: "5px 0 0", lineHeight: 1.5 }}>{hint}</p>}
    </div>
  );
}

function Group({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p className="rb-display" style={{ fontSize: 15.5, fontWeight: 700, color: RB.ink, margin: "0 0 3px" }}>
        {title}
      </p>
      {hint && <p style={{ fontSize: 12, color: RB.muted, margin: "0 0 11px", lineHeight: 1.55 }}>{hint}</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{children}</div>
    </div>
  );
}

/**
 * A textarea that grows with what she writes.
 *
 * Every prose slot in this form used to be a single-line `<input>`, including
 * the greeting lines that are the whole first screen. A one-line box tells
 * someone to write one short thing and then hides the middle of it while they
 * type — you cannot read back a sentence you cannot see.
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
  mf: RakhiData;
  updateMf: (key: keyof RakhiData, val: unknown) => void;
  pagePassword: string;
  setPagePassword: (v: string) => void;
  onSave: () => void;
  saving: boolean;
}) {
  const visible = editMode === "manual" || editMode === "choose";
  const [tab, setTab] = useState<TabId>("bhai");
  const [busy, setBusy] = useState<Slot | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const isDesktop = useIsDesktop();

  // The photo being adjusted, before it is baked and held.
  const [adjusting, setAdjusting] = useState<{ bitmap: ImageBitmap; slot: Slot } | null>(null);

  const heroRef = useRef<HTMLInputElement>(null);
  const memoryRef = useRef<HTMLInputElement>(null);
  const qrRef = useRef<HTMLInputElement>(null);

  const setRakhi = (patch: Partial<RakhiData["rakhi"]>) => updateMf("rakhi", { ...mf.rakhi, ...patch });
  const setShagun = (patch: Partial<RakhiData["shagun"]>) => updateMf("shagun", { ...mf.shagun, ...patch });

  // ── Holding a photo ───────────────────────────────────────────────────────
  //
  // Nothing is uploaded here any more. The baked square goes into IndexedDB and
  // the form carries an `idb:<id>` ref; `useRakhiEditor` uploads every held blob
  // in one pass when she publishes.
  //
  // That is what removes the auth problem rather than working around it. This
  // component used to need a token to accept a photo at all, so picking one
  // while signed out failed — and the version before this one answered that by
  // holding the file and raising the sign-in modal, which was still asking her
  // to open an account before she could see her own face on the page. Now she
  // builds the whole thing signed out and signs in once, at publish, where it
  // was always required.
  const land = useCallback(
    (slot: Slot, ref: string) => {
      if (slot === "hero") updateMf("photoUrl", ref);
      else if (slot === "qr") updateMf("shagun", { ...mf.shagun, qrImageUrl: ref });
      else updateMf("memories", [...mf.memories, { imageUrl: ref, caption: "", year: "" }]);
    },
    [mf.shagun, mf.memories, updateMf]
  );

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
      land(slot, r.ref);
      // Release the decoded bitmap — it is the full-resolution photograph, and
      // holding a dozen across a memories session is real memory.
      setAdjusting((a) => {
        a?.bitmap.close();
        return null;
      });
    },
    [land]
  );

  /** A file was chosen → decode it, then open the adjuster (or hold a QR). */
  const choose = useCallback(
    async (file: File, slot: Slot) => {
      setErr(null);

      // A QR is not cropped: the code needs its quiet border, and zooming into
      // one is how you make it unscannable.
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

  const railed = isDesktop && visible;

  // ── The sections, declared once ───────────────────────────────────────────
  const sections: { id: TabId; label: string; body: React.ReactNode }[] = [
    {
      id: "bhai",
      label: "Bhai",
      body: (
        <>
          <Group title="Who is it for?">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
              {/* The form opens as a finished draft, so the one field that could
                  be published untouched without her noticing says so. A hint,
                  not a block: "Bhai" is a real thing to call him and some people
                  will mean it. */}
              <Field
                label="Your bhai's name"
                htmlFor="rb-bro"
                hint={mf.brotherName === SAMPLE.brotherName ? "Still the default — make it his." : undefined}
              >
                <input
                  id="rb-bro"
                  style={{
                    ...field,
                    ...(mf.brotherName === SAMPLE.brotherName
                      ? { borderColor: RB.brass, borderStyle: "dashed" }
                      : null),
                  }}
                  value={mf.brotherName}
                  onChange={(e) => updateMf("brotherName", e.target.value)}
                  placeholder="Arjun"
                />
              </Field>
              <Field label="Your name" htmlFor="rb-sis">
                <input
                  id="rb-sis"
                  style={field}
                  value={mf.sisterName}
                  onChange={(e) => updateMf("sisterName", e.target.value)}
                  placeholder="Meera"
                />
              </Field>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
              <Field label="Where you are" htmlFor="rb-city" hint="Optional.">
                <input
                  id="rb-city"
                  style={field}
                  value={mf.city}
                  onChange={(e) => updateMf("city", e.target.value)}
                  placeholder="Pune"
                />
              </Field>
              <Field
                label="Km between you"
                htmlFor="rb-dist"
                hint={
                  mf.distanceKm > 0
                    ? `Shows as “tied from ${mf.distanceKm.toLocaleString("en-IN")} km away”.`
                    : "Optional — leave blank to hide the line."
                }
              >
                <input
                  id="rb-dist"
                  style={field}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={mf.distanceKm || ""}
                  onChange={(e) => updateMf("distanceKm", Number(e.target.value) || 0)}
                  placeholder="1847"
                />
              </Field>
            </div>
          </Group>

          <Group
            title="A photo of you two"
            hint="This is the picture on the opening screen and on the card you can post to your story. You choose what the square keeps."
          >
            <PhotoSlot
              url={displayUrl(mf.photoUrl)}
              busy={busy === "hero"}
              size={168}
              emptyLabel="Add photo"
              onPick={() => heroRef.current?.click()}
              onRemove={() => {
                forget(mf.photoUrl);
                updateMf("photoUrl", "");
              }}
            />
            <input
              ref={heroRef}
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
            hint="These land one line at a time under the photo, so each one should stand on its own."
          >
            {mf.greeting.map((line, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <AutoTextarea
                    value={line}
                    maxLength={120}
                    placeholder={i === 0 ? "Every year I tie this thread." : "One more line…"}
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
                style={{ ...ghostButton, alignSelf: "flex-start" }}
              >
                <Plus size={15} /> Add a line
              </button>
            )}
          </Group>
        </>
      ),
    },

    {
      id: "rakhi",
      label: "Rakhi",
      body: (
        <>
          <Group title="The thread" hint="The two colours it is woven from.">
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {THREADS.map(([a, b]) => {
                const on = mf.rakhi.threadColorA === a && mf.rakhi.threadColorB === b;
                return (
                  <button
                    key={a + b}
                    type="button"
                    onClick={() => setRakhi({ threadColorA: a, threadColorB: b })}
                    aria-label={`Thread ${a} and ${b}`}
                    aria-pressed={on}
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 999,
                      background: `linear-gradient(135deg, ${a}, ${b})`,
                      border: on ? `3px solid ${RB.ink}` : `2px solid ${RB.hairline}`,
                      cursor: "pointer",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    {on && <Check size={17} color="#fff" />}
                  </button>
                );
              })}
            </div>
          </Group>

          <Group title="The charm" hint="What sits at the centre of the rakhi.">
            <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
              {CHARMS.map((c) => {
                const on = mf.rakhi.charm === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setRakhi({ charm: c.id })}
                    aria-pressed={on}
                    style={{
                      minHeight: 44,
                      padding: "9px 14px",
                      borderRadius: 999,
                      border: `1px solid ${on ? RB.red : RB.hairline}`,
                      background: on ? "rgba(155,34,38,0.1)" : RB.surface,
                      color: on ? RB.red : RB.muted,
                      fontSize: 13.5,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                    }}
                  >
                    <span style={{ fontSize: 15 }}>{charmGlyph[c.id]}</span>
                    {c.label}
                  </button>
                );
              })}
            </div>
          </Group>

          <Group title="On the pendant">
            <Field
              label="Engraved word"
              hint="Your name, or whatever he calls you."
              count={`${mf.rakhi.pendantText.length}/16`}
            >
              <input
                style={field}
                value={mf.rakhi.pendantText}
                maxLength={16}
                onChange={(e) => setRakhi({ pendantText: e.target.value })}
                placeholder="didi"
              />
            </Field>
          </Group>

          <Group
            title="The ledger"
            hint="What he owes you, kept as a joke. It appears after the rakhi is tied — funny, never a real complaint."
          >
            {mf.ledger.map((row, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <input
                  style={{ ...field, flex: 2, minWidth: 0 }}
                  value={row.label}
                  maxLength={44}
                  onChange={(e) => {
                    const next = [...mf.ledger];
                    next[i] = { ...next[i], label: e.target.value };
                    updateMf("ledger", next);
                  }}
                  placeholder="chocolates owed"
                  aria-label={`Row ${i + 1} — what`}
                />
                <input
                  style={{ ...field, flex: 1, minWidth: 0, textAlign: "right" }}
                  value={row.value}
                  maxLength={18}
                  onChange={(e) => {
                    const next = [...mf.ledger];
                    next[i] = { ...next[i], value: e.target.value };
                    updateMf("ledger", next);
                  }}
                  placeholder="47"
                  aria-label={`Row ${i + 1} — how many`}
                />
                <button
                  type="button"
                  onClick={() => updateMf("ledger", mf.ledger.filter((_, j) => j !== i))}
                  aria-label={`Remove row ${i + 1}`}
                  style={iconButton}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            {mf.ledger.length < MAX_LEDGER && (
              <button
                type="button"
                onClick={() => updateMf("ledger", [...mf.ledger, { label: "", value: "" }])}
                style={{ ...ghostButton, alignSelf: "flex-start" }}
              >
                <Plus size={15} /> Add a row
              </button>
            )}
          </Group>
        </>
      ),
    },

    {
      id: "memories",
      label: "Photos",
      body: (
        <Group
          title="Old photos"
          hint="Each one becomes a polaroid with your caption. Square, and you pick the square."
        >
          {mf.memories.map((m, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 11,
                padding: 11,
                borderRadius: 14,
                background: RB.surface,
                border: `1px solid ${RB.hairline}`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayUrl(m.imageUrl)}
                alt=""
                style={{ width: 66, height: 66, borderRadius: 10, objectFit: "cover", flexShrink: 0 }}
              />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
                <input
                  style={{ ...field, minHeight: 42, padding: "9px 11px", fontSize: 14 }}
                  value={m.caption}
                  maxLength={80}
                  onChange={(e) => {
                    const next = [...mf.memories];
                    next[i] = { ...next[i], caption: e.target.value };
                    updateMf("memories", next);
                  }}
                  placeholder="Caption"
                  aria-label={`Caption ${i + 1}`}
                />
                <input
                  style={{ ...field, minHeight: 42, padding: "9px 11px", fontSize: 14, maxWidth: 120 }}
                  value={m.year}
                  maxLength={8}
                  onChange={(e) => {
                    const next = [...mf.memories];
                    next[i] = { ...next[i], year: e.target.value };
                    updateMf("memories", next);
                  }}
                  placeholder="2019"
                  aria-label={`Year ${i + 1}`}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  forget(m.imageUrl);
                  updateMf("memories", mf.memories.filter((_, j) => j !== i));
                }}
                aria-label={`Remove photo ${i + 1}`}
                style={{ ...iconButton, width: 40, background: "transparent" }}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}

          {mf.memories.length < MAX_MEMORIES && (
            <>
              <button
                type="button"
                onClick={() => memoryRef.current?.click()}
                disabled={busy === "memory"}
                style={{ ...ghostButton, minHeight: 48, justifyContent: "center" }}
              >
                {busy === "memory" ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />}
                {busy === "memory" ? "Uploading…" : "Add a photo"}
              </button>
              <input
                ref={memoryRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void choose(f, "memory");
                  e.target.value = "";
                }}
              />
            </>
          )}
        </Group>
      ),
    },

    {
      id: "shagun",
      label: "Shagun",
      body: (
        <>
          <div
            style={{
              padding: "12px 14px",
              borderRadius: 12,
              background: "rgba(47,107,79,0.08)",
              border: "1px solid rgba(47,107,79,0.25)",
              marginBottom: 18,
            }}
          >
            <p style={{ fontSize: 12.5, lineHeight: 1.6, color: RB.ink, margin: 0 }}>
              All optional. Your page works perfectly without any of this — the whole ritual is free
              either way. If you add it, it shows up <em>after</em> the rakhi is tied, and he is never
              asked to confirm or reminded about it.
            </p>
          </div>

          <Group title="Your UPI" hint="So he can send shagun in one tap.">
            <Field label="UPI ID" htmlFor="rb-upi">
              <input
                id="rb-upi"
                style={field}
                value={mf.shagun.upiId}
                onChange={(e) => setShagun({ upiId: e.target.value.trim() })}
                placeholder="meera@okhdfcbank"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
              />
            </Field>

            <Field label="QR code" hint="Optional. Not cropped — a cropped QR stops scanning.">
              <PhotoSlot
                url={displayUrl(mf.shagun.qrImageUrl)}
                busy={busy === "qr"}
                size={132}
                fit="contain"
                emptyLabel="Add QR"
                onPick={() => qrRef.current?.click()}
                onRemove={() => {
                  forget(mf.shagun.qrImageUrl);
                  setShagun({ qrImageUrl: "" });
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

            <Field label="A line to go with it" hint="Optional. A joke, not an invoice.">
              <AutoTextarea
                value={mf.shagun.note}
                maxLength={120}
                minRows={2}
                placeholder="Chai ka kharcha 😌"
                onChange={(v) => setShagun({ note: v })}
              />
            </Field>
          </Group>

          <Group title="Lock the page" hint="Optional. Only someone with the word can open it.">
            <Field label="Password" htmlFor="rb-pw">
              <div style={{ position: "relative" }}>
                <input
                  id="rb-pw"
                  style={{ ...field, paddingLeft: 38 }}
                  value={pagePassword}
                  onChange={(e) => setPagePassword(e.target.value)}
                  placeholder="A word only he knows"
                />
                <Lock
                  size={15}
                  style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: RB.muted }}
                />
              </div>
            </Field>
          </Group>
        </>
      ),
    },
  ];

  const shown = railed ? sections : sections.filter((s) => s.id === tab);

  return (
    <>
      <AnimatePresence>
        {visible && (
          <>
            {/* No scrim on the rail: it dims the very preview the rail exists to
                let her watch. On a phone the sheet covers the page anyway. */}
            {!railed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setEditMode("preview")}
                className="fixed inset-0 z-[60]"
                style={{ background: "rgba(43,26,16,0.55)" }}
              />
            )}

            <motion.div
              className="rb-editor"
              initial={isDesktop ? { x: -40, opacity: 0 } : { y: "100%" }}
              animate={isDesktop ? { x: 0, opacity: 1 } : { y: 0 }}
              exit={isDesktop ? { x: -40, opacity: 0 } : { y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
            >
              {/* Head */}
              <div className="rb-editor-head">
                <div>
                  <p
                    className="rb-display"
                    style={{ fontSize: 17, fontWeight: 700, color: RB.red, margin: 0 }}
                  >
                    Make your rakhi page
                  </p>
                  {railed && (
                    <p style={{ fontSize: 11.5, color: RB.muted, margin: "2px 0 0" }}>
                      The preview updates as you type.
                    </p>
                  )}
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
                    border: `1px solid ${RB.hairline}`,
                    background: RB.surface,
                    color: RB.ink,
                    display: "grid",
                    placeItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Tabs on a phone; a jump-nav on the rail. */}
              <div className="rb-editor-nav">
                {sections.map((s) => {
                  const on = !railed && tab === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        if (railed) {
                          document
                            .getElementById(`rb-sec-${s.id}`)
                            ?.scrollIntoView({ behavior: "smooth", block: "start" });
                        } else {
                          setTab(s.id);
                        }
                      }}
                      style={{
                        flexShrink: 0,
                        minHeight: 38,
                        padding: "8px 14px",
                        borderRadius: 999,
                        border: `1px solid ${on ? RB.red : RB.hairline}`,
                        background: on ? "rgba(155,34,38,0.1)" : RB.surface,
                        color: on ? RB.red : RB.muted,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>

              {/* Body */}
              <div className="rb-editor-body">
                {err && (
                  <p
                    role="alert"
                    style={{
                      fontSize: 12.5,
                      color: RB.red,
                      background: "rgba(155,34,38,0.08)",
                      border: "1px solid rgba(155,34,38,0.2)",
                      padding: "9px 12px",
                      borderRadius: 10,
                      marginBottom: 14,
                    }}
                  >
                    {err}
                  </p>
                )}

                {shown.map((s) => (
                  <section key={s.id} id={`rb-sec-${s.id}`} style={{ scrollMarginTop: 8 }}>
                    {railed && (
                      <p
                        className="rb-deva"
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: 1.4,
                          textTransform: "uppercase",
                          color: RB.brass,
                          margin: "0 0 10px",
                          paddingTop: 4,
                        }}
                      >
                        {s.label}
                      </p>
                    )}
                    {s.body}
                  </section>
                ))}
              </div>

              {/* Foot */}
              <div className="rb-editor-foot">
                <button
                  type="button"
                  onClick={onSave}
                  disabled={saving}
                  className="rb-display"
                  style={{
                    width: "100%",
                    minHeight: 52,
                    padding: "15px 24px",
                    borderRadius: 999,
                    background: BRAND_GRADIENT,
                    color: "#fffdf8",
                    border: CARD_BORDER,
                    boxShadow: CARD_SHADOW,
                    fontSize: 16.5,
                    fontWeight: 700,
                    cursor: saving ? "default" : "pointer",
                    opacity: saving ? 0.6 : 1,
                  }}
                >
                  {saving ? "Saving…" : "Save & preview"}
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
            out={adjusting.slot === "hero" ? OUT_HERO : OUT_MEMORY}
            title={adjusting.slot === "hero" ? "Your photo together" : "This memory"}
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
          borderRadius: 16,
          border: url ? `1px solid ${RB.hairline}` : `2px dashed ${RB.hairline}`,
          background: url ? (fit === "contain" ? "#fff" : "transparent") : RB.surface,
          display: "grid",
          placeItems: "center",
          cursor: busy ? "default" : "pointer",
          overflow: "hidden",
          position: "relative",
          padding: 0,
          flexShrink: 0,
        }}
      >
        {busy ? (
          <Loader2 size={22} className="animate-spin" color={RB.muted} />
        ) : url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: fit }} />
        ) : (
          <span style={{ display: "grid", placeItems: "center", gap: 7, color: RB.muted }}>
            <Camera size={22} />
            <span style={{ fontSize: 12.5, fontWeight: 600 }}>{emptyLabel}</span>
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
              border: `1px solid ${RB.hairline}`,
              background: RB.surface,
              color: RB.ink,
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
              border: `1px solid ${RB.hairline}`,
              background: "transparent",
              color: RB.muted,
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
