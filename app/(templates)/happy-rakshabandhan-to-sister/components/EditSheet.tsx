"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Camera,
  ImagePlus,
  Loader2,
  Lock,
  Plus,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { RS, BRAND_GRADIENT, CARD_BORDER, CARD_SHADOW } from "./theme";
import { SAMPLE, sisterWord, type EditMode, type SisterData, type AccountRow } from "./types";
import { decodeUpright } from "./photoCrop";
import { displayUrl, dropLocal, isLocalRef, putLocal } from "./mediaStore";
import PhotoAdjuster from "./PhotoAdjuster";
import { useIsDesktop } from "./Stage";

// ─── The builder ─────────────────────────────────────────────────────────────
//
// ── PHONE: a bottom sheet with five tabs. DESKTOP: a docked rail. ────────────
//
// Same component, same fields, two geometries, and the switch is in `sister.css`
// under one media query rather than in a second copy of the form. At ≥1024px it
// leaves the bottom of the screen and becomes a fixed 420px column on the left
// with the live preview beside it, so he watches her page change as he types
// instead of closing a sheet to look at it.
//
// The TABS also go away at that width. Tabs exist to buy vertical space, and a
// full-height rail has vertical space to spare; five of them next to one short
// panel is just four hidden sections and a reason to hunt. On the rail every
// section is in one scroll with a sticky jump-nav above it. Because the section
// bodies are declared once, in `sections` below, neither layout duplicates any
// field markup — which is also the only reason a form this long stayed
// reviewable.
//
// ── NOTHING HERE NEEDS AN ACCOUNT ───────────────────────────────────────────
//
// `/media/upload` needs a token, and an earlier version of this form therefore
// refused a photo until he had signed in — which is asking someone to open an
// account before they are allowed to see their own sister's face on the page
// they are still deciding whether to make. Photos now go into IndexedDB as
// `idb:<id>` refs and are uploaded in one pass at publish, so the entire page is
// buildable signed out and the sign-in happens once, at the point where it was
// always unavoidable. There is deliberately no auth gate left in this file.

type Slot = "hero" | "memory";

/** The five sections. Labels live with the bodies, in `sections` below. */
type TabId = "behna" | "vachan" | "account" | "lifafa" | "photos";

/** Baked square edge, in px. The cover photo is also the story-card image. */
const OUT_HERO = 1080;
const OUT_MEMORY = 720;

// ── Every cap here is the server's own number ────────────────────────────────
//
// `rakshaBandhanSisterPage.controller.ts` slices each of these on the way into
// the document. A form that accepts more than the server keeps truncates his
// words AFTER he has pressed Send, on a page he has already looked at — he sees
// the whole sentence in the preview and his sister gets two thirds of it, with
// nothing anywhere to explain the difference. So these mirror the controller
// exactly, and both sides have to move together.
const MAX_GREETING = 6;
const MAX_VOW = 8;
/** Per side, and NOT enforcing the 2-vs-3 asymmetry — see the Account doc. */
const MAX_ACCOUNT_ROWS = 6;
const MAX_MEMORIES = 12;

/** Per-string caps, same source. */
const LEN_NAME = 120;
const LEN_LINE = 200;
const LEN_SINCE = 120;
const LEN_LETTER = 2000;
const LEN_AMOUNT = 24;
const LEN_NOTE = 200;
const LEN_ROW_LABEL = 60;
const LEN_ROW_VALUE = 40;
const LEN_CAPTION = 200;
const LEN_YEAR = 8;

const field: React.CSSProperties = {
  width: "100%",
  padding: "11px 13px",
  borderRadius: 12,
  border: `1px solid ${RS.hairline}`,
  background: RS.surface,
  color: RS.ink,
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
  color: RS.muted,
  marginBottom: 6,
  letterSpacing: 0.2,
};

const ghostButton: React.CSSProperties = {
  minHeight: 44,
  padding: "10px 14px",
  borderRadius: 11,
  border: `1px dashed ${RS.hairline}`,
  background: "transparent",
  color: RS.muted,
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
  border: `1px solid ${RS.hairline}`,
  background: RS.surface,
  color: RS.muted,
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
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <label style={labelStyle} htmlFor={htmlFor}>
          {label}
        </label>
        {count && (
          <span
            style={{
              fontSize: 11,
              color: RS.muted,
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
        <p style={{ fontSize: 11.5, color: RS.muted, margin: "5px 0 0", lineHeight: 1.5 }}>
          {hint}
        </p>
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
    <div style={{ marginBottom: 20 }}>
      <p
        className="rs-display"
        style={{ fontSize: 15.5, fontWeight: 700, color: RS.ink, margin: "0 0 3px" }}
      >
        {title}
      </p>
      {hint && (
        <p style={{ fontSize: 12, color: RS.muted, margin: "0 0 11px", lineHeight: 1.55 }}>
          {hint}
        </p>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{children}</div>
    </div>
  );
}

/**
 * A textarea that grows with what he writes.
 *
 * Every prose slot in the brother template's form was a single-line `<input>`
 * at first, including the greeting lines that are the whole first screen, and it
 * was reported as a bug twice. A one-line box tells someone to write one short
 * thing and then hides the middle of it while they type — you cannot read back a
 * sentence you cannot see, and this form's whole premise is that he is editing
 * finished lines rather than filling in blanks.
 *
 * Height is set by touching `style.height` directly rather than by holding rows
 * in state: this runs on every keystroke, and a state write per keystroke would
 * re-render the entire panel to move a border by twenty pixels.
 */
function AutoTextarea({
  value,
  onChange,
  placeholder,
  maxLength,
  minRows = 2,
  id,
  ariaLabel,
  style,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  minRows?: number;
  id?: string;
  ariaLabel?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const fit = useCallback((el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  // Also runs when the value arrives from outside — an AI fill drops four
  // finished vow lines in without anyone typing, and they must not open
  // collapsed with their tails hidden.
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
      aria-label={ariaLabel}
      onChange={(e) => {
        onChange(e.target.value);
        fit(e.currentTarget);
      }}
      style={{ ...field, resize: "none", overflow: "hidden", ...style }}
    />
  );
}

/**
 * The one field that is a fork rather than a preference.
 *
 * `sisterIsElder` decides whether the whole page calls her Didi or Behna, and it
 * decides his posture in the vow: an elder sister is the one who protected HIM,
 * so his lines read as a debt acknowledged, while a younger sister's read as a
 * guarantee. Getting it wrong is not a small mistranslation — it is the single
 * most visible tell that a page was generated rather than written, and it is in
 * the largest text on the cover.
 *
 * So it is two labelled options and not a checkbox. A checkbox called "she is
 * elder" is answered without reading it, and its consequence is invisible until
 * the page is already sent; two buttons that each state what the page will say
 * cannot be skipped past in the same way. It is also the one field the AI fill
 * is not allowed to touch, because birth order is almost never stated in the
 * paragraph he types and a wrong guess here is expensive.
 */
function ElderToggle({
  isElder,
  onChange,
}: {
  isElder: boolean;
  onChange: (v: boolean) => void;
}) {
  const options: { elder: boolean; word: string; who: string; vow: string }[] = [
    {
      elder: true,
      word: "Didi",
      who: "She's older than me",
      vow: "Your vow reads as what you owe her.",
    },
    {
      elder: false,
      word: "Behna",
      who: "She's younger than me",
      vow: "Your vow reads as a guarantee.",
    },
  ];

  return (
    <div role="radiogroup" aria-label="Is she older or younger than you?" style={{ display: "grid", gap: 9 }}>
      {options.map((o) => {
        const on = isElder === o.elder;
        return (
          <button
            key={o.word}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.elder)}
            style={{
              textAlign: "left",
              minHeight: 44,
              padding: "11px 14px",
              borderRadius: 13,
              border: `1px solid ${on ? RS.rani : RS.hairline}`,
              background: on ? "rgba(166,42,92,0.08)" : RS.surface,
              cursor: "pointer",
              display: "flex",
              alignItems: "baseline",
              gap: 9,
              flexWrap: "wrap",
            }}
          >
            <span
              className="rs-display"
              style={{ fontSize: 15.5, fontWeight: 700, color: on ? RS.rani : RS.ink }}
            >
              {o.word}
            </span>
            <span style={{ fontSize: 12.5, color: RS.muted }}>{o.who}</span>
            <span
              style={{
                flexBasis: "100%",
                fontSize: 11.5,
                color: on ? RS.raniDeep : RS.muted,
                lineHeight: 1.5,
              }}
            >
              The page calls her {o.word}. {o.vow}
            </span>
          </button>
        );
      })}
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
  mf: SisterData;
  updateMf: (key: keyof SisterData, val: unknown) => void;
  pagePassword: string;
  setPagePassword: (v: string) => void;
  onSave: () => void;
  saving: boolean;
}) {
  const visible = editMode === "manual" || editMode === "choose";
  const [tab, setTab] = useState<TabId>("behna");
  const [busy, setBusy] = useState<Slot | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const isDesktop = useIsDesktop();

  // The photo being adjusted, before it is baked and held.
  const [adjusting, setAdjusting] = useState<{ bitmap: ImageBitmap; slot: Slot } | null>(null);

  const heroRef = useRef<HTMLInputElement>(null);
  const memoryRef = useRef<HTMLInputElement>(null);

  const setLifafa = (patch: Partial<SisterData["lifafa"]>) =>
    updateMf("lifafa", { ...mf.lifafa, ...patch });
  const setAccount = (patch: Partial<SisterData["account"]>) =>
    updateMf("account", { ...mf.account, ...patch });

  // ── Holding a photo ───────────────────────────────────────────────────────
  //
  // Nothing is uploaded here. The baked square goes into IndexedDB and the form
  // carries an `idb:<id>` ref; `useSisterEditor` uploads every held blob in one
  // all-or-nothing pass when he publishes.
  const land = useCallback(
    (slot: Slot, ref: string) => {
      if (slot === "hero") updateMf("photoUrl", ref);
      else updateMf("memories", [...mf.memories, { imageUrl: ref, caption: "", year: "" }]);
    },
    [mf.memories, updateMf]
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
      // holding a dozen across a memories session is real memory on a phone.
      setAdjusting((a) => {
        a?.bitmap.close();
        return null;
      });
    },
    [land]
  );

  /** A file was chosen → decode it, then open the adjuster. */
  const choose = useCallback(async (file: File, slot: Slot) => {
    setErr(null);

    const bitmap = await decodeUpright(file);
    if (!bitmap) {
      setErr("That image could not be opened — try a JPG or PNG");
      return;
    }
    setAdjusting({ bitmap, slot });
  }, []);

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

  /** One ledger column. Rows are a label and the figure it stands at. */
  const ledgerColumn = (
    rows: AccountRow[],
    side: "sheOwes" | "heOwes",
    max: number,
    what: string,
    labelPlaceholder: string,
    valuePlaceholder: string
  ) => (
    <>
      {rows.map((row, i) => (
        <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
          <input
            style={{ ...field, flex: 2, minWidth: 0 }}
            value={row.label}
            maxLength={LEN_ROW_LABEL}
            onChange={(e) => {
              const next = [...rows];
              next[i] = { ...next[i], label: e.target.value };
              setAccount({ [side]: next });
            }}
            placeholder={labelPlaceholder}
            aria-label={`${what} — line ${i + 1}, what`}
          />
          <input
            style={{ ...field, flex: 1, minWidth: 0, textAlign: "right" }}
            value={row.value}
            maxLength={LEN_ROW_VALUE}
            onChange={(e) => {
              const next = [...rows];
              next[i] = { ...next[i], value: e.target.value };
              setAccount({ [side]: next });
            }}
            placeholder={valuePlaceholder}
            aria-label={`${what} — line ${i + 1}, how many`}
          />
          <button
            type="button"
            onClick={() => setAccount({ [side]: rows.filter((_, j) => j !== i) })}
            aria-label={`Remove ${what} line ${i + 1}`}
            style={iconButton}
          >
            <Trash2 size={15} />
          </button>
        </div>
      ))}
      {rows.length < max && (
        <button
          type="button"
          onClick={() => setAccount({ [side]: [...rows, { label: "", value: "" }] })}
          style={{ ...ghostButton, alignSelf: "flex-start" }}
        >
          <Plus size={15} /> Add a line
        </button>
      )}
    </>
  );

  // ── The sections, declared once ───────────────────────────────────────────
  //
  // The phone renders one of them and the rail renders all five; both read this
  // array, so a field cannot exist in one layout and not the other.
  const sections: { id: TabId; label: string; body: React.ReactNode }[] = [
    {
      id: "behna",
      // Follows the toggle rather than saying "Behna" always: the tab changing
      // the instant he picks Didi is the cheapest possible demonstration that
      // the choice reaches the page.
      label: sisterWord(mf),
      body: (
        <>
          <Group title="Who is it for?">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
              {/* The one field with nothing in it, and the one that gates Save.
                  Her name is the largest text on the cover and cannot be
                  guessed, so it is asked for first and marked while empty. */}
              <Field
                label="Her name"
                htmlFor="rs-sis"
                hint={!mf.sisterName.trim() ? "The page is addressed to this." : undefined}
              >
                <input
                  id="rs-sis"
                  style={{
                    ...field,
                    // The whole `border` shorthand, not `borderColor` +
                    // `borderStyle`. `field` above declares the shorthand, and
                    // mixing the two forms on one element makes React warn — and
                    // it is a real warning, not noise: when this condition flips
                    // React removes the longhands it set and leaves the shorthand
                    // it did not, so the border can end up in neither state.
                    ...(!mf.sisterName.trim() ? { border: `1px dashed ${RS.rani}` } : null),
                  }}
                  value={mf.sisterName}
                  maxLength={LEN_NAME}
                  onChange={(e) => updateMf("sisterName", e.target.value)}
                  placeholder="Ananya"
                />
              </Field>
              {/* The form opens as a finished draft, so the field that could be
                  published untouched without him noticing says so. A hint, not a
                  block: a vow signed "Bhai" is signed, and some people mean it. */}
              <Field
                label="Your name"
                htmlFor="rs-bro"
                hint={
                  mf.brotherName === SAMPLE.brotherName
                    ? "Still the default — make it yours. It signs the vow."
                    : "Signs the vow."
                }
              >
                <input
                  id="rs-bro"
                  style={{
                    ...field,
                    ...(mf.brotherName === SAMPLE.brotherName
                      ? { border: `1px dashed ${RS.brass}` }
                      : null),
                  }}
                  value={mf.brotherName}
                  maxLength={LEN_NAME}
                  onChange={(e) => updateMf("brotherName", e.target.value)}
                  placeholder="Kabir"
                />
              </Field>
            </div>
          </Group>

          <Group
            title="Didi or behna?"
            hint="There is no neutral word for this in the languages the page is written in, so it has to be asked. It changes what she is called and how your vow is framed."
          >
            <ElderToggle
              isElder={mf.sisterIsElder}
              onChange={(v) => updateMf("sisterIsElder", v)}
            />
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
            title="How it opens"
            hint="These land one line at a time under the photo, so each one has to stand on its own. Funny is better than sweet here — the sweet part comes later."
          >
            {mf.greeting.map((line, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <AutoTextarea
                    value={line}
                    maxLength={LEN_LINE}
                    ariaLabel={`Opening line ${i + 1}`}
                    placeholder={i === 0 ? "You tie it. I complain about the colour." : "One more line…"}
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
      id: "vachan",
      label: "Vachan",
      body: (
        <>
          <Group
            title={mf.sisterIsElder ? "What you owe her" : "What you promise her"}
            hint={
              mf.sisterIsElder
                ? "These print as a certificate she can keep and download, signed in your name. She is the one who looked after you, so this reads better as an admission than as a promise."
                : "These print as a certificate she can keep and download, signed in your name. This is the “raksha” in Raksha Bandhan — the actual point of the day."
            }
          >
            {mf.vow.map((line, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <AutoTextarea
                    value={line}
                    maxLength={LEN_LINE}
                    ariaLabel={`Vow line ${i + 1}`}
                    placeholder={
                      i === 0 ? "Nobody gets to make you cry. That job is mine." : "One more line…"
                    }
                    onChange={(v) => {
                      const next = [...mf.vow];
                      next[i] = v;
                      updateMf("vow", next);
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => updateMf("vow", mf.vow.filter((_, j) => j !== i))}
                  aria-label={`Remove vow line ${i + 1}`}
                  style={iconButton}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            {mf.vow.length < MAX_VOW && (
              <button
                type="button"
                onClick={() => updateMf("vow", [...mf.vow, ""])}
                style={{ ...ghostButton, alignSelf: "flex-start" }}
              >
                <Plus size={15} /> Add a line
              </button>
            )}
          </Group>

          <Group title="On the seal">
            <Field
              label="Since when"
              htmlFor="rs-since"
              hint="Printed small, under the stamp. A year works; so does “since the day they brought you home”."
            >
              <AutoTextarea
                id="rs-since"
                value={mf.vowSince}
                maxLength={LEN_SINCE}
                minRows={1}
                placeholder="since 2001"
                onChange={(v) => updateMf("vowSince", v)}
              />
            </Field>
          </Group>

          <Group
            title="The letter"
            hint="The last thing she reads before she writes back. One true sentence beats five nice ones."
          >
            <Field
              label="Your letter"
              htmlFor="rs-letter"
              hint={mf.letter === SAMPLE.letter ? "Still the sample — one line of your own is enough." : undefined}
              count={`${mf.letter.length}/${LEN_LETTER}`}
            >
              <AutoTextarea
                id="rs-letter"
                value={mf.letter}
                maxLength={LEN_LETTER}
                minRows={5}
                placeholder="You were four and you followed me to the bus stop every single morning…"
                onChange={(v) => updateMf("letter", v)}
                style={
                  // Shorthand, for the reason given at the sister-name field.
                  mf.letter === SAMPLE.letter ? { border: `1px dashed ${RS.brass}` } : undefined
                }
              />
            </Field>
          </Group>
        </>
      ),
    },

    {
      id: "account",
      label: "Account",
      body: (
        <>
          <div
            style={{
              padding: "12px 14px",
              borderRadius: 12,
              background: "rgba(23,86,79,0.07)",
              border: "1px solid rgba(23,86,79,0.22)",
              marginBottom: 18,
            }}
          >
            <p style={{ fontSize: 12.5, lineHeight: 1.6, color: RS.ink, margin: 0 }}>
              A statement with two sides. Her column is the petty one and it is meant to be
              funny. <strong>Yours is not a joke</strong> — it is what she actually did, written
              just as flatly, and it is the line that lands. Keep hers short and yours longer;
              two even columns read as a scorecard.
            </p>
          </div>

          <Group
            title="What she owes you"
            hint="Petty, itemised, true. The hoodie. The tattling. The charger."
          >
            {ledgerColumn(
              mf.account.sheOwes,
              "sheOwes",
              MAX_ACCOUNT_ROWS,
              "What she owes you",
              "hoodies never returned",
              "9"
            )}
          </Group>

          <div
            style={{
              height: 1,
              background: RS.hairline,
              margin: "4px 0 18px",
            }}
          />

          <Group
            title="What you owe her"
            hint="Same deadpan voice, no punchlines. This side does not balance, and it is not supposed to — the envelope on the next screen is part payment against it."
          >
            {ledgerColumn(
              mf.account.heOwes,
              "heOwes",
              MAX_ACCOUNT_ROWS,
              "What you owe her",
              "times you covered for me",
              "every one"
            )}
          </Group>
        </>
      ),
    },

    {
      id: "lifafa",
      label: "Lifafa",
      body: (
        <>
          <div
            style={{
              padding: "12px 14px",
              borderRadius: 12,
              background: "rgba(232,163,58,0.12)",
              border: "1px solid rgba(232,163,58,0.35)",
              marginBottom: 18,
            }}
          >
            <p style={{ fontSize: 12.5, lineHeight: 1.6, color: RS.ink, margin: 0 }}>
              All optional. Her page works completely without any of this. If you add it, the
              envelope appears <em>after</em> she has tied the rakhi, she is never asked to
              confirm anything, and nothing is tracked — a shagun is a gift, not an invoice.
            </p>
          </div>

          <Group title="The shagun" hint="What is inside the lifafa.">
            <Field
              label="Amount"
              htmlFor="rs-amt"
              hint="Written as you would write it — 501, 1100, or “jitna chahiye”."
            >
              <input
                id="rs-amt"
                style={field}
                value={mf.lifafa.amount}
                maxLength={LEN_AMOUNT}
                onChange={(e) => setLifafa({ amount: e.target.value })}
                placeholder="501"
              />
            </Field>

            {/* ── THERE IS NO UPI FIELD HERE, AND THERE MUST NOT BE ───────────
             *
             * This section used to ask for his UPI ID and a QR image, labelled
             * "so she can take it in one tap" — which is not something a payee's
             * own handle can do. A QR and a `upi://pay` link encode a PAYEE and
             * open the SCANNER's app to PAY, so his handle on her page asked the
             * sister to pay her brother on the day he is giving her money. Her
             * handle instead would publish her bank identifier on a page built to
             * be forwarded, and on this festival a forwarded page carrying a
             * payment code is the exact shape of the season's commonest fraud.
             * The full argument is on `Lifafa` in `types.ts`. The transfer belongs
             * in his banking app; this form only states the figure. */}
            <Field label="A line to go with it" hint="“Shagun. Do not argue.” Not an invoice.">
              <AutoTextarea
                value={mf.lifafa.note}
                maxLength={LEN_NOTE}
                ariaLabel="A line to go with the shagun"
                placeholder="Buy the thing you keep opening and closing in your cart."
                onChange={(v) => setLifafa({ note: v })}
              />
            </Field>
          </Group>

          <Group title="Lock the page" hint="Optional. Only someone with the word can open it.">
            <Field label="Password" htmlFor="rs-pw">
              <div style={{ position: "relative" }}>
                <input
                  id="rs-pw"
                  style={{ ...field, paddingLeft: 38 }}
                  value={pagePassword}
                  onChange={(e) => setPagePassword(e.target.value)}
                  placeholder="A word only she knows"
                />
                <Lock
                  size={15}
                  style={{
                    position: "absolute",
                    left: 13,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: RS.muted,
                  }}
                />
              </div>
            </Field>
          </Group>
        </>
      ),
    },

    {
      id: "photos",
      label: "Photos",
      body: (
        <Group
          title="Old photos"
          hint="Each one becomes a polaroid with your caption and the year. Square, and you pick the square. Two or three good ones beat ten."
        >
          {mf.memories.map((m, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 11,
                padding: 11,
                borderRadius: 14,
                background: RS.surface,
                border: `1px solid ${RS.hairline}`,
              }}
            >
              {/* A plain <img>, not next/image: this src can be a blob: URL for a
                  photo that is held locally and not uploaded yet, and the Next
                  image loader cannot fetch one. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayUrl(m.imageUrl)}
                alt=""
                style={{ width: 66, height: 66, borderRadius: 10, objectFit: "cover", flexShrink: 0 }}
              />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
                <AutoTextarea
                  value={m.caption}
                  maxLength={LEN_CAPTION}
                  minRows={1}
                  ariaLabel={`Caption ${i + 1}`}
                  placeholder="the year you tied it too tight"
                  onChange={(v) => {
                    const next = [...mf.memories];
                    next[i] = { ...next[i], caption: v };
                    updateMf("memories", next);
                  }}
                  style={{ minHeight: 42, padding: "9px 11px", fontSize: 14 }}
                />
                <input
                  style={{ ...field, minHeight: 42, padding: "9px 11px", fontSize: 14, maxWidth: 120 }}
                  value={m.year}
                  maxLength={LEN_YEAR}
                  onChange={(e) => {
                    const next = [...mf.memories];
                    next[i] = { ...next[i], year: e.target.value };
                    updateMf("memories", next);
                  }}
                  placeholder="2023"
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
                {busy === "memory" ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <ImagePlus size={15} />
                )}
                {busy === "memory" ? "Adding…" : "Add a photo"}
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
  ];

  const shown = railed ? sections : sections.filter((s) => s.id === tab);

  return (
    <>
      <AnimatePresence>
        {visible && (
          <>
            {/* No scrim on the rail: it dims the very preview the rail exists to
                let him watch. On a phone the sheet covers the page anyway. */}
            {!railed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setEditMode("preview")}
                className="fixed inset-0 z-[60]"
                style={{ background: "rgba(51,32,43,0.55)" }}
              />
            )}

            <motion.div
              className="rs-editor"
              initial={isDesktop ? { x: -40, opacity: 0 } : { y: "100%" }}
              animate={isDesktop ? { x: 0, opacity: 1 } : { y: 0 }}
              exit={isDesktop ? { x: -40, opacity: 0 } : { y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
            >
              {/* Head */}
              <div className="rs-editor-head">
                <div>
                  <p
                    className="rs-display"
                    style={{ fontSize: 17, fontWeight: 700, color: RS.rani, margin: 0 }}
                  >
                    Make her rakhi page
                  </p>
                  {railed && (
                    <p style={{ fontSize: 11.5, color: RS.muted, margin: "2px 0 0" }}>
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
                    border: `1px solid ${RS.hairline}`,
                    background: RS.surface,
                    color: RS.ink,
                    display: "grid",
                    placeItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Tabs on a phone; a jump-nav on the rail. */}
              <div className="rs-editor-nav">
                {sections.map((s) => {
                  const on = !railed && tab === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        if (railed) {
                          document
                            .getElementById(`rs-sec-${s.id}`)
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
                        border: `1px solid ${on ? RS.rani : RS.hairline}`,
                        background: on ? "rgba(166,42,92,0.1)" : RS.surface,
                        color: on ? RS.rani : RS.muted,
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
              <div className="rs-editor-body">
                {err && (
                  <p
                    role="alert"
                    style={{
                      fontSize: 12.5,
                      color: RS.rani,
                      background: "rgba(166,42,92,0.08)",
                      border: "1px solid rgba(166,42,92,0.2)",
                      padding: "9px 12px",
                      borderRadius: 10,
                      marginBottom: 14,
                    }}
                  >
                    {err}
                  </p>
                )}

                {shown.map((s) => (
                  <section key={s.id} id={`rs-sec-${s.id}`} style={{ scrollMarginTop: 8 }}>
                    {railed && (
                      <p
                        className="rs-deva"
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          color: RS.brass,
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
              <div className="rs-editor-foot">
                <button
                  type="button"
                  onClick={onSave}
                  disabled={saving}
                  className="rs-display"
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
            title={adjusting.slot === "hero" ? "The two of you" : "This memory"}
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
          border: url ? `1px solid ${RS.hairline}` : `2px dashed ${RS.hairline}`,
          background: url ? (fit === "contain" ? "#fff" : "transparent") : RS.surface,
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
          <Loader2 size={22} className="animate-spin" color={RS.muted} />
        ) : url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: fit }} />
        ) : (
          <span style={{ display: "grid", placeItems: "center", gap: 7, color: RS.muted }}>
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
              border: `1px solid ${RS.hairline}`,
              background: RS.surface,
              color: RS.ink,
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
              border: `1px solid ${RS.hairline}`,
              background: "transparent",
              color: RS.muted,
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
