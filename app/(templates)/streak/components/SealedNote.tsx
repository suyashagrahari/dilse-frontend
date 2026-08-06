// ─── The sealed note ─────────────────────────────────────────────────────────
//
// THE SECURITY PROPERTY, and the reason this component takes a `SealedNoteView`
// rather than a `CheckInDay`:
//
//   The locked variant of `SealedNoteView` HAS NO `text` FIELD. Not hidden, not
//   `display:none`, not conditionally rendered — structurally absent. When this
//   component is handed a locked view, TypeScript narrows away any property
//   that could hold the note, so there is nothing in scope to put in the DOM
//   even by accident. A later refactor cannot reintroduce the leak without
//   first changing the contract's type, which is a conversation rather than a
//   typo.
//
// A `hidden` div would have been half a leak: invisible on screen, right there
// in View Source, and the person it is hidden from is a person who has that
// device in their hand.
//
// If neither partner left a note, `state: "none"` renders nothing at all. This
// component never asks for a note and never mentions that one is missing.

"use client";

import { COPY, PALETTE, SERIF, TIMING, UI, type SealedNoteView } from "./types";
import WaxSeal from "./WaxSeal";

/** Wrap a 60-char note into short lines so the reveal has lines to stage. */
function toLines(text: string, max = 26): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if (!cur) cur = w;
    else if (cur.length + 1 + w.length <= max) cur += ` ${w}`;
    else {
      lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

export interface SealedNoteProps {
  view: SealedNoteView;
  /**
   * True only when the viewer's own check-in in THIS session is what unsealed
   * it. On a later page load the note is simply already open — replaying the
   * crack every time you look at your own inbox would be theatre.
   */
  animate: boolean;
  reduced: boolean;
}

export default function SealedNote({ view, animate, reduced }: SealedNoteProps) {
  if (view.state === "none") return null;

  const cracked = view.state === "open";
  const moving = animate && !reduced;

  return (
    <div
      className="w-full rounded-2xl px-4 py-4"
      style={{
        background: PALETTE.paperDeep,
        border: `1px solid ${PALETTE.edge}`,
      }}
    >
      <div className="flex items-start gap-3">
        <span
          style={{
            flex: "0 0 auto",
            // The closed envelope announces itself exactly once, softly.
            animation: !cracked && moving ? "streak-seal-pulse 1600ms ease-out 1 both" : undefined,
            borderRadius: "50%",
          }}
        >
          <WaxSeal cracked={cracked} animate={moving} size={44} seed={view.fromName} />
        </span>

        <div className="min-w-0 flex-1">
          {view.state === "locked" ? (
            // Nothing here but the fact that something is waiting. `view` is
            // narrowed to `{ state: "locked"; fromName: string }` — there is no
            // `view.text` to reach for.
            <p style={{ fontFamily: UI, fontSize: 13.5, lineHeight: 1.5, color: PALETTE.inkSoft }}>
              {COPY.noteSealed(view.fromName)}
            </p>
          ) : (
            <>
              <p
                style={{
                  fontFamily: UI,
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: PALETTE.inkFaint,
                  marginBottom: 6,
                }}
              >
                {view.fromName}
              </p>
              {/* Line by line. Staged after the seal has finished cracking. */}
              {toLines(view.text).map((line, i) => (
                <p
                  key={`${i}-${line}`}
                  style={{
                    fontFamily: SERIF,
                    fontSize: 17,
                    lineHeight: 1.55,
                    color: PALETTE.ink,
                    animation: moving ? "streak-line-in 420ms ease-out both" : undefined,
                    animationDelay: moving ? `${TIMING.sealCrackMs + i * 160}ms` : undefined,
                  }}
                >
                  {line}
                </p>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
