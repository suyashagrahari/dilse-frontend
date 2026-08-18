// ─── StoryStarter — the first thing a sender sees ────────────────────────────
//
// Shown once, over an editor that is still on its demo defaults. Three screens
// — the choice, the composer, the review — plus a banner for the fill that
// happened without being asked for. All of them dismissible, and dismissing
// never costs a keystroke: `dismiss()` leaves the story and the names in the
// hook, so the panel reopens exactly as it was left.
//
// ── WHY "USE MY STORY" IS THE HERO WHEN IT EXISTS ────────────────────────────
//
// A sender who has already told us about the two of you should never be asked
// to tell us again. When `canUseMyStory` is true, one tap fills the entire form
// from what they wrote last time, and that tap is the biggest thing on the
// screen — labelled with the actual story it will use, because "use saved
// context" is a settings toggle and "from 'How we met'" is a memory. The
// composer is demoted to second place, still a real button of its own.
//
// When there is nothing saved, the composer is primary and this looks exactly
// like it did before.
//
// ── NOTHING IS A DEAD END ────────────────────────────────────────────────────
//
// Every screen here has a way into the ordinary form: the choice screen has
// "I'll fill it in myself", the composer has the same line under Generate, the
// review screen ends in it, and the X in the corner is that route from all
// three. The AI is an accelerator for a form that already works.

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Loader2, PenLine, Sparkles, Undo2, X } from "lucide-react";
import StoryComposer from "./StoryComposer";
import type { StoryCast } from "./casts";
import StoryReview from "./StoryReview";
import { STORY_UI, TAP } from "./ui";
import type { StoryFill } from "./storyFillContract";

/**
 * The hero. Its own component rather than a `primary` flag on `Choice` because
 * it is a different thing: taller, with a busy state that lives ON the button
 * instead of over the panel. A page-level spinner here would hide the two
 * alternatives at the exact moment the sender might want one of them.
 */
function HeroAction({
  title,
  subtitle,
  busy,
  busyLabel,
  onClick,
  autoFocus,
}: {
  title: string;
  subtitle: string;
  busy?: boolean;
  busyLabel: string;
  onClick: () => void;
  autoFocus?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      autoFocus={autoFocus}
      aria-busy={busy || undefined}
      className="flex w-full items-center text-left"
      style={{
        gap: 12,
        minHeight: 72,
        padding: "14px 16px",
        borderRadius: 16,
        fontFamily: STORY_UI.font,
        color: STORY_UI.paper,
        background: STORY_UI.ink,
        border: "none",
        opacity: busy ? 0.82 : 1,
        cursor: busy ? "default" : "pointer",
      }}
    >
      <span aria-hidden="true" style={{ display: "grid", placeItems: "center", flexShrink: 0 }}>
        {busy ? (
          <Loader2 size={19} className="animate-spin" />
        ) : (
          <Sparkles size={19} />
        )}
      </span>
      <span className="flex-1" style={{ minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 16.5 }}>{busy ? busyLabel : title}</span>
        <span
          style={{
            display: "block",
            fontSize: 12.5,
            lineHeight: 1.45,
            marginTop: 3,
            color: "rgba(250,247,240,0.74)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {busy ? "One moment — reading it back to your page." : subtitle}
        </span>
      </span>
      {!busy && <ArrowRight size={17} aria-hidden="true" style={{ opacity: 0.8, flexShrink: 0 }} />}
    </button>
  );
}

function Choice({
  primary,
  icon,
  title,
  subtitle,
  onClick,
  autoFocus,
  disabled,
}: {
  primary?: boolean;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onClick: () => void;
  autoFocus?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      autoFocus={autoFocus}
      disabled={disabled}
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
        opacity: disabled ? 0.55 : 1,
        cursor: disabled ? "default" : "pointer",
      }}
    >
      <span
        aria-hidden="true"
        style={{ display: "grid", placeItems: "center", opacity: primary ? 1 : 0.65, flexShrink: 0 }}
      >
        {icon}
      </span>
      <span className="flex-1" style={{ minWidth: 0 }}>
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
      <ArrowRight size={16} aria-hidden="true" style={{ opacity: primary ? 0.8 : 0.4, flexShrink: 0 }} />
    </button>
  );
}

export interface StoryStarterProps {
  /** The whole hook result, passed straight through. */
  fill: StoryFill;
  /**
   * Into the template's own edit form. Called from the review screen and from
   * "I'll fill it in myself", so the sender always lands somewhere they can
   * type rather than on a closed panel.
   */
  onManual: () => void;
  /** Overrides the default heading, e.g. "Let's write her page". */
  title?: string;
  /**
   * Who this page is about — which name boxes the composer shows and which
   * sample story it offers. Omit for the couples default; see `./casts`.
   */
  cast?: StoryCast;
}

export default function StoryStarter({ fill, onManual, title, cast }: StoryStarterProps) {
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
    generate,
    canUseMyStory,
    useMyStory,
    usingStory,
    contextLabel,
    autoApplied,
    undoAutoApply,
    dismissAutoApplied,
    dismiss,
  } = fill;

  // No schema for this template (or still loading, or the sender opted out):
  // render nothing at all. The editor behaves exactly as it did before.
  const open = Boolean(schema) && !schemaLoading && mode !== "manual";

  const close = () => {
    dismiss();
    onManual();
  };

  const heading =
    mode === "done" ? "Here's your first draft" : title || "Let's fill this in";

  return (
    <>
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
              className="w-full overflow-y-auto overflow-x-hidden"
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
                  {heading}
                </h2>
                <span className="flex-1" />
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close and fill it in myself"
                  style={{
                    minWidth: TAP,
                    minHeight: TAP,
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
                    {canUseMyStory
                      ? "You've already told us about the two of you. One tap and the whole page is written — you can change every word afterwards."
                      : "Tell it about the two of you and it writes the whole page. You can change every word afterwards."}
                  </p>

                  {canUseMyStory && (
                    <HeroAction
                      autoFocus
                      title="Use my story"
                      busyLabel="Using your story…"
                      subtitle={contextLabel ?? "from your saved story"}
                      busy={usingStory}
                      onClick={useMyStory}
                    />
                  )}

                  <Choice
                    primary={!canUseMyStory}
                    autoFocus={!canUseMyStory}
                    disabled={usingStory}
                    icon={<Sparkles size={17} />}
                    title={canUseMyStory ? "Write a new story" : "Write it for me"}
                    subtitle="A couple of sentences is enough"
                    onClick={() => setMode("composer")}
                  />

                  <Choice
                    icon={<PenLine size={17} />}
                    title="I'll fill it in myself"
                    subtitle="Go straight to the form"
                    onClick={close}
                  />

                  {/* Failures from "Use my story" surface here, not in the composer. */}
                  <div aria-live="polite" aria-atomic="true">
                    {!usingStory && error && (
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
                        {!/yourself/i.test(error) && " You can also fill it in yourself."}
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
                  onBack={() => setMode("idle")}
                  onSkip={close}
                  cast={cast}
                />
              )}

              {/* ── 3. The review ── */}
              {mode === "done" && <StoryReview fill={fill} onDone={close} />}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── The banner for a fill nobody asked for ──
          The auto-fill puts the hook into `"manual"`, so the sheet above is
          gone and this is the only thing that speaks. A form that quietly
          rewrote itself is indistinguishable from a bug: say so, show them
          what changed, and keep Undo one tap away. */}
      <AnimatePresence>
        {mode === "manual" && autoApplied && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            className="pointer-events-none fixed inset-x-0 z-[190] flex justify-center px-3"
            style={{ bottom: "calc(14px + env(safe-area-inset-bottom, 0px))" }}
          >
            <div
              role="status"
              aria-live="polite"
              className="pointer-events-auto w-full"
              style={{
                maxWidth: 440,
                borderRadius: 16,
                background: STORY_UI.paper,
                border: `1px solid ${STORY_UI.edge}`,
                boxShadow: "0 10px 30px rgba(43,38,32,0.16)",
                padding: "11px 12px 10px",
              }}
            >
              <div className="flex items-start" style={{ gap: 9 }}>
                <Sparkles
                  size={16}
                  aria-hidden="true"
                  style={{ color: STORY_UI.accent, marginTop: 2, flexShrink: 0 }}
                />
                <div className="flex-1" style={{ minWidth: 0 }}>
                  <p style={{ fontFamily: STORY_UI.font, fontSize: 13.5, color: STORY_UI.ink }}>
                    Filled in from your story
                  </p>
                  <p
                    style={{
                      fontFamily: STORY_UI.font,
                      fontSize: 11.5,
                      lineHeight: 1.4,
                      color: STORY_UI.inkFaint,
                      marginTop: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {contextLabel ?? "from your saved story"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={dismissAutoApplied}
                  aria-label="Keep it"
                  style={{
                    minWidth: TAP,
                    minHeight: TAP,
                    marginTop: -6,
                    marginRight: -6,
                    display: "grid",
                    placeItems: "center",
                    background: "transparent",
                    border: "none",
                    color: STORY_UI.inkFaint,
                    cursor: "pointer",
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex" style={{ gap: 8, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => {
                    dismissAutoApplied();
                    setMode("done");
                  }}
                  className="flex-1"
                  style={{
                    minHeight: TAP,
                    borderRadius: 11,
                    fontFamily: STORY_UI.font,
                    fontSize: 13.5,
                    color: STORY_UI.paper,
                    background: STORY_UI.ink,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  See what it wrote
                </button>
                <button
                  type="button"
                  onClick={undoAutoApply}
                  style={{
                    minHeight: TAP,
                    padding: "0 13px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    borderRadius: 11,
                    fontFamily: STORY_UI.font,
                    fontSize: 13.5,
                    color: STORY_UI.inkSoft,
                    background: "transparent",
                    border: `1px solid ${STORY_UI.edge}`,
                    cursor: "pointer",
                  }}
                >
                  <Undo2 size={14} aria-hidden="true" />
                  Undo
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
