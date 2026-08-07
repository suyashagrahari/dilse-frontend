// ─── StoryComposer — the panel that asks for the story ───────────────────────
//
// THE BLANK TEXTAREA IS THE WHOLE PROBLEM. A sender who opens this and sees an
// empty box with "tell us about the two of you" above it closes the tab. Almost
// nobody can write about their own relationship cold, and the ones who can
// still won't guess what level of detail is useful.
//
// So the sample paragraph is not decoration and it is not a placeholder. It is
// a real, specific, slightly embarrassing story with the names punched out of
// it as tappable chips, sitting ABOVE the textarea where it is read before the
// box is looked at. "Use this as a starting point" copies it in, filled with
// their names, so the first thing they face is someone else's story to correct
// rather than their own to invent. Correcting is easy. Inventing is not.
//
// The three name fields are all optional. Every placeholder has a neutral
// fallback (`resolveStorySlots`), so a sender who fills in nothing at all can
// still press Generate and get something.

"use client";

import { useCallback, useMemo, useRef } from "react";
import { ArrowLeft, Sparkles, WandSparkles } from "lucide-react";
import { resolveStorySlots } from "@/hooks/useStoryFill";
import { STORY_UI, TAP, inputStyle } from "./ui";
import { STORY_LIMITS, STORY_SLOTS, type StoryPeople, type StorySlotKey } from "@/lib/ai-fill/types";

// The tokens moved to `./ui` when four files started needing them. Re-exported
// here because that is where every existing import points.
export { STORY_UI };

/**
 * The sample. Deliberately concrete — a generic one ("we have been together a
 * while and we are very happy") teaches the sender nothing about what to write,
 * and the model gets the same nothing back.
 */
export const SAMPLE_STORY =
  `${STORY_SLOTS.you} and ${STORY_SLOTS.partner} met in second year, at a birthday party ` +
  `neither of us wanted to be at. Three years later she still calls me by the ` +
  `nickname she made up that night. She hates coriander, she cries at every ` +
  `film, and she is the only person who can get me to shut up and eat. Last ` +
  `winter we took the overnight bus to Manali and got stuck in the snow for two ` +
  `days — still the best trip we've had. ${STORY_SLOTS.bestFriend} was the one who ` +
  `told me to text her first.`;

const SLOT_BY_TOKEN: Record<string, StorySlotKey> = {
  [STORY_SLOTS.you]: "you",
  [STORY_SLOTS.partner]: "partner",
  [STORY_SLOTS.bestFriend]: "bestFriend",
};

/** What the chip reads when that name has not been given yet. */
const SLOT_PROMPT: Record<StorySlotKey, string> = {
  you: "your name",
  partner: "her name",
  bestFriend: "best friend",
};

const PEOPLE_KEY: Record<StorySlotKey, keyof StoryPeople> = {
  you: "userName",
  partner: "partnerName",
  bestFriend: "bestFriendName",
};

type Segment = { kind: "text"; text: string } | { kind: "slot"; slot: StorySlotKey };

/** Split the sample into runs of prose and the placeholders between them. */
function splitSlots(text: string): Segment[] {
  const out: Segment[] = [];
  const re = /\{\{(?:you|her|bestfriend)\}\}/g;
  let last = 0;
  for (const m of text.matchAll(re)) {
    const at = m.index ?? 0;
    if (at > last) out.push({ kind: "text", text: text.slice(last, at) });
    const slot = SLOT_BY_TOKEN[m[0]];
    if (slot) out.push({ kind: "slot", slot });
    last = at + m[0].length;
  }
  if (last < text.length) out.push({ kind: "text", text: text.slice(last) });
  return out;
}

export interface StoryComposerProps {
  people: StoryPeople;
  setPeople: (v: StoryPeople | ((prev: StoryPeople) => StoryPeople)) => void;
  story: string;
  setStory: (v: string) => void;
  generating: boolean;
  error: string | null;
  onGenerate: () => void;
  /**
   * Back to the choice screen. Optional only so the composer stays usable
   * standalone; the starter always passes it, because a screen you can only
   * leave by generating is a trap.
   */
  onBack?: () => void;
  /** Straight into the form. The escape hatch that has to exist on every screen. */
  onSkip?: () => void;
}

export default function StoryComposer({
  people,
  setPeople,
  story,
  setStory,
  generating,
  error,
  onGenerate,
  onBack,
  onSkip,
}: StoryComposerProps) {
  const areaRef = useRef<HTMLTextAreaElement | null>(null);
  const nameRefs = useRef<Partial<Record<StorySlotKey, HTMLInputElement | null>>>({});

  const segments = useMemo(() => splitSlots(SAMPLE_STORY), []);

  const setName = useCallback(
    (key: keyof StoryPeople, value: string) => {
      setPeople((prev) => ({ ...prev, [key]: value.slice(0, STORY_LIMITS.name) }));
    },
    [setPeople]
  );

  /**
   * Tapping a chip drops that name into the story at the caret. When the name
   * has not been given yet there is nothing to drop, so the tap sends them to
   * the field that supplies it instead of doing nothing.
   */
  const tapSlot = useCallback(
    (slot: StorySlotKey) => {
      const name = people[PEOPLE_KEY[slot]].trim();
      if (!name) {
        nameRefs.current[slot]?.focus();
        return;
      }

      const el = areaRef.current;
      if (!el) {
        setStory((story + (story.endsWith(" ") || !story ? "" : " ") + name).slice(0, STORY_LIMITS.story));
        return;
      }

      const start = el.selectionStart ?? story.length;
      const end = el.selectionEnd ?? story.length;
      const before = story.slice(0, start);
      const after = story.slice(end);
      const pad = before && !/\s$/.test(before) ? " " : "";
      const next = (before + pad + name + after).slice(0, STORY_LIMITS.story);
      setStory(next);

      const caret = Math.min(before.length + pad.length + name.length, STORY_LIMITS.story);
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(caret, caret);
      });
    },
    [people, story, setStory]
  );

  const useSample = useCallback(() => {
    setStory(resolveStorySlots(SAMPLE_STORY, people).slice(0, STORY_LIMITS.story));
    requestAnimationFrame(() => areaRef.current?.focus());
  }, [people, setStory]);

  const count = story.length;
  const tooShort = story.trim().length < STORY_LIMITS.minStory;

  return (
    <div className="flex flex-col" style={{ gap: 18 }}>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          style={{
            alignSelf: "flex-start",
            minHeight: TAP,
            marginTop: -8,
            marginBottom: -8,
            paddingRight: 10,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "transparent",
            border: "none",
            fontFamily: STORY_UI.font,
            fontSize: 13,
            color: STORY_UI.inkSoft,
            cursor: "pointer",
          }}
        >
          <ArrowLeft size={15} aria-hidden="true" />
          Back
        </button>
      )}

      {/* ── Who's in it ── */}
      <div className="flex flex-col" style={{ gap: 10 }}>
        <p
          style={{
            fontFamily: STORY_UI.font,
            fontSize: 11.5,
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            color: STORY_UI.inkSoft,
          }}
        >
          Who&apos;s in it
        </p>

        {(
          [
            { slot: "you", label: "Your name", placeholder: "Rohan" },
            { slot: "partner", label: "Her name", placeholder: "Meera" },
            { slot: "bestFriend", label: "Your best friend", placeholder: "Ananya" },
          ] as const
        ).map(({ slot, label, placeholder }) => (
          <div key={slot}>
            <label
              htmlFor={`story-name-${slot}`}
              style={{
                display: "block",
                fontFamily: STORY_UI.font,
                fontSize: 12,
                color: STORY_UI.inkFaint,
                marginBottom: 4,
              }}
            >
              {label} <span style={{ opacity: 0.75 }}>(optional)</span>
            </label>
            <input
              id={`story-name-${slot}`}
              ref={(el) => {
                nameRefs.current[slot] = el;
              }}
              value={people[PEOPLE_KEY[slot]]}
              onChange={(e) => setName(PEOPLE_KEY[slot], e.target.value)}
              placeholder={placeholder}
              autoComplete="off"
              style={inputStyle}
            />
          </div>
        ))}
      </div>

      {/* ── The sample ──
          Above the box, on purpose. This is the part that stops the bounce. */}
      <div
        style={{
          borderRadius: 14,
          border: `1px solid ${STORY_UI.edge}`,
          background: STORY_UI.paper,
          padding: 13,
        }}
      >
        <p
          style={{
            fontFamily: STORY_UI.font,
            fontSize: 11.5,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: STORY_UI.inkFaint,
            marginBottom: 7,
          }}
        >
          Something like this
        </p>

        <p style={{ fontFamily: STORY_UI.serif, fontSize: 15.5, lineHeight: 1.75, color: STORY_UI.ink }}>
          {segments.map((seg, i) =>
            seg.kind === "text" ? (
              <span key={i}>{seg.text}</span>
            ) : (
              <button
                key={i}
                type="button"
                onClick={() => tapSlot(seg.slot)}
                aria-label={
                  people[PEOPLE_KEY[seg.slot]].trim()
                    ? `Insert ${people[PEOPLE_KEY[seg.slot]].trim()} into your story`
                    : `Add ${SLOT_PROMPT[seg.slot]}`
                }
                style={{
                  display: "inline",
                  fontFamily: STORY_UI.font,
                  fontSize: 14,
                  lineHeight: 1.75,
                  padding: "3px 9px",
                  margin: "0 1px",
                  borderRadius: 999,
                  color: STORY_UI.accent,
                  background: STORY_UI.accentWash,
                  border: `1px solid ${STORY_UI.accent}33`,
                  cursor: "pointer",
                }}
              >
                {people[PEOPLE_KEY[seg.slot]].trim() || SLOT_PROMPT[seg.slot]}
              </button>
            )
          )}
        </p>

        {/* IMPOSSIBLE TO MISS ON PURPOSE. This one button is the difference
            between a sender who writes something and a sender who closes the
            tab, so it is the only accent-filled control on the screen and it
            sits directly under the words it copies. */}
        <button
          type="button"
          onClick={useSample}
          style={{
            minHeight: 48,
            width: "100%",
            marginTop: 12,
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            fontFamily: STORY_UI.font,
            fontSize: 14.5,
            color: STORY_UI.accent,
            background: STORY_UI.accentWash,
            border: `1px solid ${STORY_UI.accent}55`,
            cursor: "pointer",
          }}
        >
          <WandSparkles size={16} aria-hidden="true" />
          Use this as a starting point
        </button>
        <p
          style={{
            fontFamily: STORY_UI.font,
            fontSize: 11.5,
            lineHeight: 1.45,
            color: STORY_UI.inkFaint,
            marginTop: 7,
            textAlign: "center",
          }}
        >
          It drops the whole thing in the box below, with your names in it. Then just
          correct the bits that aren&apos;t true.
        </p>
      </div>

      {/* ── The box ── */}
      <div>
        <label
          htmlFor="story-text"
          style={{
            display: "block",
            fontFamily: STORY_UI.font,
            fontSize: 11.5,
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            color: STORY_UI.inkSoft,
            marginBottom: 6,
          }}
        >
          Your story
        </label>
        <textarea
          id="story-text"
          ref={areaRef}
          value={story}
          onChange={(e) => setStory(e.target.value.slice(0, STORY_LIMITS.story))}
          placeholder="How you met, what she's like, one thing that happened…"
          rows={7}
          aria-describedby="story-count"
          style={{
            ...inputStyle,
            minHeight: 150,
            padding: "11px 12px",
            fontFamily: STORY_UI.serif,
            fontSize: 16,
            lineHeight: 1.65,
            resize: "vertical",
          }}
        />
        <div
          id="story-count"
          className="flex items-center justify-between"
          style={{ marginTop: 5, fontFamily: STORY_UI.font, fontSize: 11.5 }}
        >
          <span style={{ color: tooShort ? STORY_UI.inkSoft : STORY_UI.inkFaint }}>
            {tooShort
              ? `At least ${STORY_LIMITS.minStory} characters — a sentence or two.`
              : "Details beat adjectives. Names, places, small things."}
          </span>
          <span style={{ color: count > STORY_LIMITS.story * 0.9 ? STORY_UI.accent : STORY_UI.inkFaint }}>
            {count}/{STORY_LIMITS.story}
          </span>
        </div>
      </div>

      {/* ── Status ──
          One live region for both the working and failed states, so a screen
          reader gets the outcome without having to go looking for it. */}
      <div aria-live="polite" aria-atomic="true">
        {generating && (
          <p style={{ fontFamily: STORY_UI.font, fontSize: 13, color: STORY_UI.inkSoft }}>
            Writing your page…
          </p>
        )}
        {!generating && error && (
          <p style={{ fontFamily: STORY_UI.font, fontSize: 13, lineHeight: 1.5, color: STORY_UI.danger }}>
            {error}
            {/* Every failure ends by pointing somewhere. The hook's messages
                mostly do this themselves; this catches the ones that don't. */}
            {onSkip && !/yourself/i.test(error) && " You can also fill it in yourself."}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onGenerate}
        disabled={generating}
        style={{
          minHeight: 52,
          borderRadius: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          fontFamily: STORY_UI.font,
          fontSize: 15,
          color: STORY_UI.paper,
          background: STORY_UI.ink,
          border: "none",
          opacity: generating ? 0.6 : 1,
          cursor: generating ? "default" : "pointer",
        }}
      >
        <Sparkles
          size={16}
          aria-hidden="true"
          className={generating ? "animate-pulse" : undefined}
        />
        {generating ? "Writing…" : "Write my page"}
      </button>

      {onSkip && (
        <button
          type="button"
          onClick={onSkip}
          style={{
            minHeight: TAP,
            marginTop: -6,
            background: "transparent",
            border: "none",
            fontFamily: STORY_UI.font,
            fontSize: 13,
            color: STORY_UI.inkSoft,
            textDecoration: "underline",
            textUnderlineOffset: 3,
            cursor: "pointer",
          }}
        >
          I&apos;ll fill it in myself
        </button>
      )}
    </div>
  );
}
