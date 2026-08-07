// ─── StoryStarter — the first thing a sender sees ────────────────────────────
//
// Shown once, over an editor that is still on its demo defaults. Three states:
// the choice, the composer, and the report. All of them dismissible, and
// dismissing never costs a keystroke — `dismiss()` leaves the story and names
// in the hook, so the panel can be reopened exactly as it was left.
//
// ── WHY AI IS THE DEFAULT AND WHY THE EXIT IS ONE TAP ────────────────────────
//
// "Write it for me" is the visually primary option and takes initial focus,
// because the alternative — a seven-step form — is what most senders quit on.
// But "I'll fill it in myself" is a real button of the same size directly under
// it, not a link in 11px grey, because the sender who already knows exactly
// what they want to say is the sender most worth keeping. Neither choice is a
// trap: the report screen ends in a button into the normal form.
//
// ── THE REPORT IS ABOUT WHAT IS STILL EMPTY ──────────────────────────────────
//
// A "✓ 9 fields filled!" screen sends someone straight to Publish with three
// blanks in the page. So the empty fields are the loud half of that screen,
// listed by their human labels, under a heading that says they need a person.

"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, PenLine, Sparkles, X } from "lucide-react";
import StoryComposer, { STORY_UI } from "./StoryComposer";
import type { UseStoryFillResult } from "@/hooks/useStoryFill";

function Choice({
  primary,
  icon,
  title,
  subtitle,
  onClick,
  autoFocus,
}: {
  primary?: boolean;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onClick: () => void;
  autoFocus?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      autoFocus={autoFocus}
      className="flex w-full items-center text-left"
      style={{
        gap: 12,
        minHeight: 60,
        padding: "12px 14px",
        borderRadius: 14,
        fontFamily: STORY_UI.font,
        color: primary ? STORY_UI.paper : STORY_UI.ink,
        background: primary ? STORY_UI.ink : STORY_UI.paper,
        border: `1px solid ${primary ? STORY_UI.ink : STORY_UI.edge}`,
        cursor: "pointer",
      }}
    >
      <span aria-hidden="true" style={{ display: "grid", placeItems: "center", opacity: primary ? 1 : 0.65 }}>
        {icon}
      </span>
      <span className="flex-1">
        <span style={{ display: "block", fontSize: 15 }}>{title}</span>
        {subtitle && (
          <span
            style={{
              display: "block",
              fontSize: 12,
              lineHeight: 1.45,
              marginTop: 2,
              color: primary ? "rgba(250,247,240,0.72)" : STORY_UI.inkFaint,
            }}
          >
            {subtitle}
          </span>
        )}
      </span>
      <ArrowRight size={16} aria-hidden="true" style={{ opacity: primary ? 0.8 : 0.4 }} />
    </button>
  );
}

export interface StoryStarterProps {
  /** The whole hook result, passed straight through. */
  fill: UseStoryFillResult;
  /**
   * Into the template's own edit form. Called from the report screen and from
   * "I'll fill it in myself", so the sender always lands somewhere they can
   * type rather than on a closed panel.
   */
  onManual: () => void;
  /** Overrides the default heading, e.g. "Let's write her page". */
  title?: string;
}

export default function StoryStarter({ fill, onManual, title }: StoryStarterProps) {
  const {
    schema,
    schemaLoading,
    mode,
    setMode,
    story,
    setStory,
    people,
    setPeople,
    generating,
    error,
    filled,
    missing,
    lastLanguage,
    generate,
    applyFromContext,
    hasProfileContext,
    contextLabel,
    dismiss,
  } = fill;

  /** Human labels for the report. A path with no declaration is simply not shown. */
  const labelFor = useMemo(() => {
    const map = new Map<string, string>();
    for (const f of schema?.fields ?? []) map.set(f.path, f.label);
    return map;
  }, [schema]);

  const missingLabels = useMemo(
    () => missing.map((p) => labelFor.get(p)).filter((l): l is string => Boolean(l)),
    [missing, labelFor]
  );

  // No schema for this template (or still loading, or the sender opted out):
  // render nothing at all. The editor behaves exactly as it did before.
  const open = Boolean(schema) && !schemaLoading && mode !== "manual";

  const close = () => {
    dismiss();
    onManual();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-end justify-center"
          style={{ background: "rgba(43,38,32,0.34)" }}
          onClick={close}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="story-starter-title"
            className="w-full overflow-y-auto"
            style={{
              maxWidth: 480,
              maxHeight: "92dvh",
              background: STORY_UI.paperDeep,
              borderTopLeftRadius: 22,
              borderTopRightRadius: 22,
              padding: "18px 18px calc(24px + env(safe-area-inset-bottom, 0px))",
            }}
          >
            <div className="flex items-start gap-2" style={{ marginBottom: 14 }}>
              <h2
                id="story-starter-title"
                style={{ fontFamily: STORY_UI.serif, fontSize: 21, lineHeight: 1.3, color: STORY_UI.ink }}
              >
                {mode === "done" ? "Here's a first draft" : title || "Let's fill this in"}
              </h2>
              <span className="flex-1" />
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                style={{
                  minWidth: 44,
                  minHeight: 44,
                  display: "grid",
                  placeItems: "center",
                  background: "transparent",
                  border: "none",
                  color: STORY_UI.inkSoft,
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* ── 1. The choice ── */}
            {mode === "idle" && (
              <div className="flex flex-col" style={{ gap: 10 }}>
                <p
                  style={{
                    fontFamily: STORY_UI.font,
                    fontSize: 13.5,
                    lineHeight: 1.55,
                    color: STORY_UI.inkSoft,
                    marginBottom: 2,
                  }}
                >
                  Tell it about the two of you and it writes the whole page. You can change every
                  word afterwards.
                </p>

                {hasProfileContext && (
                  <Choice
                    icon={<Sparkles size={17} />}
                    title="Use my saved story"
                    subtitle={contextLabel ?? "from your saved story"}
                    onClick={applyFromContext}
                  />
                )}

                <Choice
                  primary
                  autoFocus
                  icon={<Sparkles size={17} />}
                  title="Write it for me"
                  subtitle="A couple of sentences is enough"
                  onClick={() => setMode("composer")}
                />

                <Choice
                  icon={<PenLine size={17} />}
                  title="I'll fill it in myself"
                  subtitle="Go straight to the form"
                  onClick={close}
                />

                {/* Failures from "Use my saved story" surface here, not in the composer. */}
                <div aria-live="polite" aria-atomic="true">
                  {generating && (
                    <p style={{ fontFamily: STORY_UI.font, fontSize: 13, color: STORY_UI.inkSoft, marginTop: 4 }}>
                      Writing your page…
                    </p>
                  )}
                  {!generating && error && (
                    <p
                      style={{
                        fontFamily: STORY_UI.font,
                        fontSize: 13,
                        lineHeight: 1.5,
                        color: STORY_UI.danger,
                        marginTop: 4,
                      }}
                    >
                      {error}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ── 2. The composer ── */}
            {mode === "composer" && (
              <StoryComposer
                people={people}
                setPeople={setPeople}
                story={story}
                setStory={setStory}
                generating={generating}
                error={error}
                onGenerate={generate}
              />
            )}

            {/* ── 3. The report ──
                Filled is one line. Empty is the list. */}
            {mode === "done" && (
              <div className="flex flex-col" style={{ gap: 14 }}>
                <p
                  style={{ fontFamily: STORY_UI.font, fontSize: 13.5, lineHeight: 1.55, color: STORY_UI.inkSoft }}
                  aria-live="polite"
                >
                  {filled.length > 0
                    ? `Written ${filled.length} ${filled.length === 1 ? "part" : "parts"} of the page` +
                      (lastLanguage ? ` in ${lastLanguage}` : "") +
                      ". Anything you'd already typed was left alone."
                    : error || "Nothing was changed."}
                </p>

                {missingLabels.length > 0 && (
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
                        color: STORY_UI.accent,
                        marginBottom: 8,
                      }}
                    >
                      These still need you
                    </p>
                    <ul className="flex flex-col" style={{ gap: 6 }}>
                      {missingLabels.map((label) => (
                        <li
                          key={label}
                          className="flex items-start"
                          style={{
                            gap: 8,
                            fontFamily: STORY_UI.font,
                            fontSize: 13.5,
                            lineHeight: 1.5,
                            color: STORY_UI.ink,
                          }}
                        >
                          <span
                            aria-hidden="true"
                            style={{
                              width: 5,
                              height: 5,
                              borderRadius: "50%",
                              background: STORY_UI.accent,
                              marginTop: 7,
                              flexShrink: 0,
                            }}
                          />
                          {label}
                        </li>
                      ))}
                    </ul>
                    <p
                      style={{
                        fontFamily: STORY_UI.font,
                        fontSize: 12,
                        lineHeight: 1.5,
                        color: STORY_UI.inkFaint,
                        marginTop: 9,
                      }}
                    >
                      Photos, dates and anything too personal to guess.
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={close}
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
                  {missingLabels.length > 0 ? "Finish it off" : "Read it through"}
                </button>

                <button
                  type="button"
                  onClick={() => setMode("composer")}
                  style={{
                    minHeight: 44,
                    borderRadius: 12,
                    fontFamily: STORY_UI.font,
                    fontSize: 13.5,
                    color: STORY_UI.inkSoft,
                    background: "transparent",
                    border: `1px solid ${STORY_UI.edge}`,
                    cursor: "pointer",
                  }}
                >
                  Try again with more detail
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
