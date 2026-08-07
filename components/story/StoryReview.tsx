// ─── StoryReview — reading back what was written, before it is theirs ────────
//
// This screen replaces a sentence that said "✓ 9 fields filled". That sentence
// was a receipt for something the sender had not read, on a page they were
// about to publish under their own name, and the next tap after it was Publish.
//
// So the whole thing is now the words themselves. Every line the model wrote is
// listed with its label, in the order the schema declares it, and every one of
// them opens in place into the real control for its kind. THE SENDER OWNS THE
// WORDS: that is not a claim made in copy, it is made by the fact that the
// first thing they can do to any sentence here is retype it.
//
// ── THE EMPTY HALF IS THE LOUD HALF ──────────────────────────────────────────
//
// A page with three blanks in it is worse than a page with three fewer
// sections, and the sender cannot see the blanks from here. So `missingFields`
// gets its own block, in accent, and — unlike the old report — its rows are
// editable too. Sending someone back into a seven-section form to type one date
// is how a blank stays blank.
//
// The "still empty" count is recomputed from live values on every render rather
// than trusted from the fill result, so a slot filled in this screen stops
// nagging the moment it has something in it.

"use client";

import { useCallback, useMemo, useState } from "react";
import { PenLine } from "lucide-react";
import StoryFieldRow from "./StoryFieldEditor";
import { STORY_UI, TAP, eyebrowStyle } from "./ui";
import { isFilled } from "@/lib/ai-fill/applyPatch";
import type { WireField } from "@/lib/ai-fill/types";
import type { StoryFill } from "./storyFillContract";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        borderRadius: 14,
        border: `1px solid ${STORY_UI.edge}`,
        background: STORY_UI.paper,
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}

function SectionHead({ children, hint, tone }: { children: string; hint?: string; tone?: "accent" }) {
  return (
    <div style={{ padding: "11px 12px 8px" }}>
      <h3 style={{ ...eyebrowStyle, color: tone === "accent" ? STORY_UI.accent : STORY_UI.inkSoft }}>
        {children}
      </h3>
      {hint && (
        <p
          style={{
            fontFamily: STORY_UI.font,
            fontSize: 12,
            lineHeight: 1.5,
            color: STORY_UI.inkFaint,
            marginTop: 4,
          }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

export interface StoryReviewProps {
  fill: StoryFill;
  /** Into the template's own form. The one primary way out of this screen. */
  onDone: () => void;
}

export default function StoryReview({ fill, onDone }: StoryReviewProps) {
  const { filledFields, missingFields, lastLanguage, error, setFieldValue, valueAt, setMode } = fill;

  /** One row open at a time — twelve open textareas is not a review, it is a form. */
  const [openPath, setOpenPath] = useState<string | null>(null);
  const toggle = useCallback((path: string) => {
    setOpenPath((prev) => (prev === path ? null : path));
  }, []);

  /**
   * ── THE ROW LIST IS A SNAPSHOT, ON PURPOSE ────────────────────────────────
   *
   * `setFieldValue` drops a path out of `filledFields` the instant the sender
   * touches it — correctly, because from then on those are their words and not
   * the model's. Driving the list off that array directly would therefore make
   * the row VANISH FROM UNDER THE CURSOR on the first keystroke, which is the
   * worst thing a review screen could possibly do.
   *
   * So the list is captured once, in a `useState` initialiser, and lives as
   * long as this screen does. A new fill unmounts this component (the composer
   * renders in its place on the way through), so a remount is a fresh capture
   * and there is nothing stale to clear.
   */
  const [rows] = useState(() => {
    const seen = new Set<string>();
    const wrote: WireField[] = [];
    const needs: WireField[] = [];
    for (const f of filledFields) {
      if (seen.has(f.path)) continue;
      seen.add(f.path);
      wrote.push(f);
    }
    // A path cannot honestly be both written and blank; if the two lists ever
    // disagree, the written one wins and it is listed exactly once.
    for (const f of missingFields) {
      if (seen.has(f.path)) continue;
      seen.add(f.path);
      needs.push(f);
    }
    return { wrote, needs };
  });

  /**
   * Provenance, read LIVE — the opposite lifetime to the list above. The quiet
   * marker means "the model wrote this and you haven't touched it", so it has
   * to come off the moment they do. Built once per change, not once per row.
   */
  const aiNow = useMemo(() => new Set(filledFields.map((f) => f.path)), [filledFields]);

  // Read live, every render. `missingFields` was a snapshot of the moment the
  // fill landed; a slot filled in on this screen must stop nagging immediately.
  const emptyNow = rows.needs.filter((f) => !isFilled(valueAt(f.path))).length;
  const wrote = rows.wrote.length;

  return (
    <div className="flex flex-col" style={{ gap: 14 }}>
      <p
        aria-live="polite"
        style={{ fontFamily: STORY_UI.font, fontSize: 13.5, lineHeight: 1.55, color: STORY_UI.inkSoft }}
      >
        {wrote > 0 ? (
          <>
            {`Wrote ${wrote} ${wrote === 1 ? "line" : "lines"} of your page`}
            {lastLanguage ? ` in ${lastLanguage}` : ""}
            {". "}
            <span style={{ color: STORY_UI.ink }}>Tap any of them to change the words.</span>{" "}
            Anything you&apos;d already typed was left alone.
          </>
        ) : (
          error || "Nothing was changed — everything it could write, you'd already written."
        )}
      </p>

      {/* ── What it wrote ── */}
      {wrote > 0 && (
        <Card>
          <SectionHead hint="Nothing here is locked. These are your words the moment you touch them.">
            What it wrote
          </SectionHead>
          {rows.wrote.map((f) => (
            <StoryFieldRow
              key={f.path}
              field={f}
              value={valueAt(f.path)}
              open={openPath === f.path}
              fromAi={aiNow.has(f.path)}
              onToggle={toggle}
              onChange={setFieldValue}
            />
          ))}
        </Card>
      )}

      {/* ── What is still blank ── */}
      {rows.needs.length > 0 && (
        <Card>
          <SectionHead
            tone="accent"
            hint="Photos, dates and anything too personal to guess. You can do them right here."
          >
            {emptyNow > 0 ? "These still need you" : "You've filled these in"}
          </SectionHead>
          {rows.needs.map((f) => (
            <StoryFieldRow
              key={f.path}
              field={f}
              value={valueAt(f.path)}
              open={openPath === f.path}
              onToggle={toggle}
              onChange={setFieldValue}
            />
          ))}
        </Card>
      )}

      {/* ── Out ──
          One loud way into the form, one quiet way back to the composer.
          Both of them are exits; neither of them is a dead end. */}
      <button
        type="button"
        onClick={onDone}
        style={{
          minHeight: 52,
          borderRadius: 14,
          fontFamily: STORY_UI.font,
          fontSize: 15,
          color: STORY_UI.paper,
          background: STORY_UI.ink,
          border: "none",
          cursor: "pointer",
        }}
      >
        {emptyNow > 0
          ? `Finish the last ${emptyNow} in the form`
          : "Looks good — open the page"}
      </button>

      <button
        type="button"
        onClick={() => setMode("composer")}
        style={{
          minHeight: TAP,
          borderRadius: 12,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 7,
          fontFamily: STORY_UI.font,
          fontSize: 13.5,
          color: STORY_UI.inkSoft,
          background: "transparent",
          border: `1px solid ${STORY_UI.edge}`,
          cursor: "pointer",
        }}
      >
        <PenLine size={14} aria-hidden="true" />
        Write it again
      </button>
    </div>
  );
}
