// ─── AiFilledBadge — a whisper, not a boast ──────────────────────────────────
//
// Marks a line the model wrote. Two places use it:
//
//   • `StoryReview` puts the `compact` form on every row it lists, so the
//     sender can see at a glance which words are not yet theirs.
//   • Template edit sheets can put the full form beside a field label
//     (`<AiFilledBadge show={filled.includes(path)} />`) once they want to.
//
// IT IS DELIBERATELY QUIET. The sender is about to send this page to someone
// they love and put their own name on it; a bright "✨ AI GENERATED" chip on
// every second field turns their gift into a demo of our product. Small, low
// contrast, no icon larger than the text beside it. Nobody should notice it
// until they are looking for it — and it should disappear from the form the
// moment they edit the field, which is the parent's job, not this one's.
//
// The compact form is the star on its own. In a list where every row came from
// the model, repeating "written for you" nine times down the right-hand edge is
// noise; one glyph is the same information at a tenth of the weight. It keeps
// the full sentence as its accessible name, so nothing is lost to a reader who
// cannot see the shape.

"use client";

const INK_FAINT = "#a89e8c";
const EDGE = "#e4dcc9";
const UI_FONT = "var(--font-outfit), system-ui, sans-serif";

const TITLE = "Written for you — edit it to make it yours.";

export interface AiFilledBadgeProps {
  /** Convenience so callers can write `<AiFilledBadge show={filled.includes(path)} />`. */
  show?: boolean;
  className?: string;
  /** Overridden by templates whose palette is dark. */
  color?: string;
  borderColor?: string;
  /** Glyph only, no pill, no words. For dense lists — see the note above. */
  compact?: boolean;
}

/** A four-point star at text weight. lucide's Sparkles is too loud at this size. */
function Star({ color, size = 8 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" fill="none" aria-hidden="true">
      <path d="M4 0.5 L4.9 3.1 L7.5 4 L4.9 4.9 L4 7.5 L3.1 4.9 L0.5 4 L3.1 3.1 Z" fill={color} />
    </svg>
  );
}

export default function AiFilledBadge({
  show = true,
  className,
  color = INK_FAINT,
  borderColor = EDGE,
  compact = false,
}: AiFilledBadgeProps) {
  if (!show) return null;

  if (compact) {
    return (
      <span
        className={className}
        role="img"
        aria-label={TITLE}
        title={TITLE}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          verticalAlign: "middle",
          width: 14,
          height: 14,
          flexShrink: 0,
          color,
          userSelect: "none",
        }}
      >
        <Star color={color} size={9} />
      </span>
    );
  }

  return (
    <span
      className={className}
      title={TITLE}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        verticalAlign: "middle",
        padding: "1px 6px",
        borderRadius: 999,
        border: `1px solid ${borderColor}`,
        background: "transparent",
        fontFamily: UI_FONT,
        fontSize: 10,
        letterSpacing: "0.06em",
        lineHeight: 1.6,
        color,
        userSelect: "none",
      }}
    >
      <Star color={color} />
      <span>written for you</span>
    </span>
  );
}
