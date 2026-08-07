// ─── The story flow's visual tokens ──────────────────────────────────────────
//
// The same cream-and-ink language as the streak and capsule edit sheets, kept
// here rather than imported from any one template because these components are
// shared by all thirty. Nothing in this file is a new design system: the values
// are lifted from `app/(templates)/streak/components/editorTypes.ts` so the AI
// panel and the form it hands over to look like one product.
//
// It lives in its own module (rather than inside StoryComposer, where it used
// to) because four files now need it and a component importing a component for
// its colours is how import cycles start.

export const STORY_UI = {
  paper: "#faf7f0",
  paperDeep: "#f3eee2",
  edge: "#e4dcc9",
  ink: "#2b2620",
  inkSoft: "#6b6357",
  inkFaint: "#a89e8c",
  accent: "#c9822f",
  accentWash: "#f6e7d2",
  danger: "#a4432c",
  font: "var(--font-outfit), system-ui, sans-serif",
  serif: "var(--font-tinos), Georgia, 'Times New Roman', serif",
} as const;

/** 44px is the floor everywhere in this flow — these are opened on phones. */
export const TAP = 44;

export const inputStyle: React.CSSProperties = {
  width: "100%",
  minHeight: TAP,
  borderRadius: 11,
  padding: "0 12px",
  fontFamily: STORY_UI.font,
  fontSize: 15,
  color: STORY_UI.ink,
  background: STORY_UI.paper,
  border: `1px solid ${STORY_UI.edge}`,
  outline: "none",
};

export const areaStyle: React.CSSProperties = {
  ...inputStyle,
  minHeight: 110,
  padding: "10px 12px",
  fontFamily: STORY_UI.serif,
  fontSize: 16,
  lineHeight: 1.6,
  resize: "vertical",
};

/** Small uppercase eyebrow — the label voice used by every sheet in the app. */
export const eyebrowStyle: React.CSSProperties = {
  fontFamily: STORY_UI.font,
  fontSize: 11.5,
  letterSpacing: "0.07em",
  textTransform: "uppercase",
  color: STORY_UI.inkSoft,
};
