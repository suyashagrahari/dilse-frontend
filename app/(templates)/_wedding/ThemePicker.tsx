"use client";
// ─── <ThemePicker> — six live swatches (3 light · 3 dark) ───────────────────
//
//   <ThemePicker value={extras.theme} onChange={(id) => updateExtra("theme", id)} sample="A & R" />
//
// Each chip is a tiny invitation rendered with that theme's own tokens (wash,
// foil hairline, foil script initials), so the sender sees the real look.
// A radiogroup: arrow keys move between themes.

import { useRef, type KeyboardEvent } from "react";
import { WEDDING_FONT_VARS } from "./fonts";
import { LIGHT_THEMES, DARK_THEMES, WEDDING_THEMES, themeVars, type WeddingThemeId } from "./themes";
import { WeddingKitStyles } from "./WeddingRoot";

export interface ThemePickerProps {
  value: WeddingThemeId | string | undefined;
  onChange: (id: WeddingThemeId) => void;
  /** Initials shown on the swatches ("A & R"). */
  sample?: string;
  /** Restrict / reorder the offered themes. Default: the three light then the three dark. */
  themes?: readonly WeddingThemeId[];
  /** Group headings "Light" / "Dark". Default true. */
  grouped?: boolean;
  label?: string;
}

export default function ThemePicker({ value, onChange, sample = "A & R", themes, grouped = true, label = "Theme" }: ThemePickerProps) {
  const ids = themes ?? [...LIGHT_THEMES, ...DARK_THEMES];
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = ids.includes(value as WeddingThemeId) ? (value as WeddingThemeId) : ids[0];

  const onKey = (e: KeyboardEvent, i: number) => {
    const d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const j = (i + d + ids.length) % ids.length;
    onChange(ids[j]);
    refs.current[j]?.focus();
  };

  const chip = (id: WeddingThemeId, i: number) => {
    const t = WEDDING_THEMES[id];
    const on = id === current;
    return (
      <button
        key={id}
        ref={(el) => {
          refs.current[i] = el;
        }}
        type="button"
        role="radio"
        aria-checked={on}
        tabIndex={on ? 0 : -1}
        className={`wk-tp-chip${on ? " is-on" : ""}`}
        onClick={() => onChange(id)}
        onKeyDown={(e) => onKey(e, i)}
      >
        <span className={`wk-tp-card ${WEDDING_FONT_VARS}`} style={themeVars(id)} aria-hidden>
          <span className="wk-tp-frame" />
          <span className="wk-tp-eyebrow">Save the date</span>
          <span className="wk-tp-names wk-foil-text">{sample}</span>
          <span className="wk-tp-rule" />
          <span className="wk-tp-dot" />
        </span>
        <span className="wk-tp-meta">
          <b>{t.label}</b>
          <small>{t.blurb}</small>
        </span>
        {on && (
          <span className="wk-tp-check" aria-hidden>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </span>
        )}
      </button>
    );
  };

  const light = ids.filter((id) => !WEDDING_THEMES[id].dark);
  const dark = ids.filter((id) => WEDDING_THEMES[id].dark);
  return (
    <div className="wk-tp" role="radiogroup" aria-label={label}>
      <WeddingKitStyles />
      {grouped && light.length > 0 && dark.length > 0 ? (
        <>
          <p className="wk-tp-group">Light</p>
          <div className="wk-tp-row">{light.map((id) => chip(id, ids.indexOf(id)))}</div>
          <p className="wk-tp-group">Dark</p>
          <div className="wk-tp-row">{dark.map((id) => chip(id, ids.indexOf(id)))}</div>
        </>
      ) : (
        <div className="wk-tp-row">{ids.map((id, i) => chip(id, i))}</div>
      )}
    </div>
  );
}
