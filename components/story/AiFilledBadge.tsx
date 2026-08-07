// ─── AiFilledBadge — a whisper, not a boast ──────────────────────────────────
//
// Sits next to a field the AI wrote, inside the normal edit form. Its only job
// is to be honest about where a line came from so the sender knows which ones
// they have not read yet.
//
// IT IS DELIBERATELY QUIET. The sender is about to send this page to someone
// they love and put their own name on it; a bright "✨ AI GENERATED" chip on
// every second field turns their gift into a demo of our product. Small, low
// contrast, no icon larger than the text beside it. Nobody should notice it
// until they are looking for it — and it should disappear from the form the
// moment they edit the field, which is the parent's job, not this one's.

"use client";

const INK_FAINT = "#a89e8c";
const EDGE = "#e4dcc9";
const UI_FONT = "var(--font-outfit), system-ui, sans-serif";

export interface AiFilledBadgeProps {
  /** Convenience so callers can write `<AiFilledBadge show={filled.includes(path)} />`. */
  show?: boolean;
  className?: string;
  /** Overridden by templates whose palette is dark. */
  color?: string;
  borderColor?: string;
}

export default function AiFilledBadge({
  show = true,
  className,
  color = INK_FAINT,
  borderColor = EDGE,
}: AiFilledBadgeProps) {
  if (!show) return null;

  return (
    <span
      className={className}
      title="Written for you — edit it to make it yours."
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
      {/* A four-point star at text weight. lucide's Sparkles is too loud at this size. */}
      <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
        <path d="M4 0.5 L4.9 3.1 L7.5 4 L4.9 4.9 L4 7.5 L3.1 4.9 L0.5 4 L3.1 3.1 Z" fill={color} />
      </svg>
      <span>written for you</span>
    </span>
  );
}
