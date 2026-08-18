"use client";

import React, { useCallback, useId, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import {
  AUTOCOMPLETE,
  COPY,
  matchSuggestions,
  PALETTE,
  splitSuggestion,
  TAP_TARGET_PX,
  UI,
} from "./types";
import { firstNameOf } from "./demoData";

/* ── The search box, and the four seconds the whole template hangs on ────────
 *
 * The autocomplete is the joke's delivery mechanism. Two things about it are
 * load-bearing and easy to get wrong:
 *
 *   1. The TYPED prefix is normal weight and the COMPLETION is bold. That is
 *      the real convention. Bold the typed part instead and the dropdown reads
 *      as fake instantly. `splitSuggestion` returns them already separated so
 *      there is no excuse.
 *
 *   2. The dropdown is never empty. Type something unrelated and the same
 *      suggestions still come up — `matchSuggestions` falls through to the full
 *      pool on purpose. An empty dropdown is a dead moment.
 */

export interface SearchBoxProps {
  value: string;
  onChange: (v: string) => void;
  /** Runs the search. `fromSuggestion` is the row text when a row was chosen. */
  onSubmit: (query: string) => void;
  suggestions: string[];
  recipientName: string;
  variant: "landing" | "header";
  reduced: boolean;
  /** Landing only, and only on a fine pointer — never force the iOS keyboard. */
  autoFocus?: boolean;
}

export default function SearchBox({
  value,
  onChange,
  onSubmit,
  suggestions,
  recipientName,
  variant,
  reduced,
  autoFocus = false,
}: SearchBoxProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [nudge, setNudge] = useState(false);
  const listId = `${useId()}suggestions`;

  const inputRef = useRef<HTMLInputElement | null>(null);
  const focusedOnce = useRef(false);
  const nudgeTimer = useRef<number | null>(null);
  // The nudge fires once per box, not once per pause. Two pulses is a tic.
  const nudged = useRef(false);

  const first = firstNameOf(recipientName);
  const rows = useMemo(
    () => (open ? matchSuggestions(value, suggestions, first) : []),
    [open, value, suggestions, first],
  );

  const clearNudgeTimer = useCallback(() => {
    if (nudgeTimer.current !== null) {
      window.clearTimeout(nudgeTimer.current);
      nudgeTimer.current = null;
    }
  }, []);

  const attachInput = useCallback(
    (el: HTMLInputElement | null) => {
      inputRef.current = el;
      if (!el || !autoFocus || focusedOnce.current) return;
      focusedOnce.current = true;
      // Fine pointer only. On a touch device a programmatic focus either does
      // nothing or shoves the whole layout up behind the keyboard, and the
      // landing is the one screen that must not jump.
      const fine = typeof window !== "undefined" && window.matchMedia?.("(pointer: fine)").matches;
      if (fine) el.focus({ preventScroll: true });
    },
    [autoFocus],
  );

  const handleChange = useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      const next = ev.target.value;
      onChange(next);
      setOpen(true);
      setActive(-1);
      setNudge(false);
      clearNudgeTimer();
      // Some people do not know to look down. After a pause, the top row
      // pulses — once, ever.
      if (next.trim() && !nudged.current && !reduced) {
        nudgeTimer.current = window.setTimeout(() => {
          nudged.current = true;
          setNudge(true);
        }, AUTOCOMPLETE.nudgeAfterMs);
      }
    },
    [onChange, clearNudgeTimer, reduced],
  );

  const choose = useCallback(
    (text: string) => {
      clearNudgeTimer();
      setNudge(false);
      setOpen(false);
      setActive(-1);
      onChange(text);
      inputRef.current?.blur();
      onSubmit(text);
    },
    [clearNudgeTimer, onChange, onSubmit],
  );

  const submitTyped = useCallback(() => {
    clearNudgeTimer();
    setNudge(false);
    setOpen(false);
    setActive(-1);
    inputRef.current?.blur();
    onSubmit(value);
  }, [clearNudgeTimer, onSubmit, value]);

  const handleKeyDown = useCallback(
    (ev: React.KeyboardEvent<HTMLInputElement>) => {
      if (ev.key === "Escape") {
        setOpen(false);
        setActive(-1);
        clearNudgeTimer();
        setNudge(false);
        return;
      }
      if (ev.key === "ArrowDown" || ev.key === "ArrowUp") {
        if (rows.length === 0) return;
        ev.preventDefault();
        setNudge(false);
        setActive((cur) => {
          const dir = ev.key === "ArrowDown" ? 1 : -1;
          const next = cur + dir;
          if (next < -1) return rows.length - 1;
          if (next >= rows.length) return -1;
          return next;
        });
        return;
      }
      if (ev.key === "Enter") {
        ev.preventDefault();
        if (active >= 0 && active < rows.length) choose(rows[active]);
        else submitTyped();
      }
    },
    [rows, active, choose, submitTyped, clearNudgeTimer],
  );

  const landing = variant === "landing";
  const height = landing ? 48 : 44;

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <form
        role="search"
        onSubmit={(ev) => {
          ev.preventDefault();
          submitTyped();
        }}
        style={{ margin: 0 }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            height,
            padding: "0 14px",
            background: "#fff",
            border: `1px solid ${PALETTE.border}`,
            // Squared-off top when the dropdown is open, which is what a real
            // combobox does and costs nothing.
            borderRadius: open && rows.length > 0 ? `${height / 2}px ${height / 2}px 0 0` : height / 2,
            borderBottomColor: open && rows.length > 0 ? "transparent" : PALETTE.border,
          }}
        >
          <Search size={18} strokeWidth={1.8} color={PALETTE.greyLight} aria-hidden />
          <input
            ref={attachInput}
            type="text"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setOpen(true)}
            // A blur that lands on a row must not close the list before the
            // click registers. 140ms is the usual, boring answer.
            onBlur={() => window.setTimeout(() => setOpen(false), 140)}
            placeholder={COPY.placeholder}
            aria-label={COPY.placeholder}
            // combobox, not textbox: aria-expanded is only meaningful here.
            role="combobox"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-expanded={open && rows.length > 0}
            aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            style={{
              flex: 1,
              minWidth: 0,
              border: "none",
              outline: "none",
              background: "transparent",
              fontFamily: UI,
              // 16px minimum: anything smaller and iOS zooms the page on focus.
              fontSize: 16,
              color: PALETTE.ink,
            }}
          />
          {value.length > 0 && (
            <button
              type="button"
              aria-label="Clear"
              onPointerDown={(ev) => ev.preventDefault()}
              onClick={() => {
                onChange("");
                clearNudgeTimer();
                setNudge(false);
                inputRef.current?.focus();
              }}
              style={{
                border: "none",
                background: "transparent",
                padding: 4,
                cursor: "pointer",
                color: PALETTE.greyLight,
                display: "grid",
                placeItems: "center",
              }}
            >
              <X size={16} strokeWidth={1.8} />
            </button>
          )}
        </div>
      </form>

      {open && rows.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Suggestions"
          style={{
            position: "absolute",
            top: height - 1,
            left: 0,
            right: 0,
            zIndex: 60,
            listStyle: "none",
            margin: 0,
            padding: "6px 0 8px",
            background: "#fff",
            border: `1px solid ${PALETTE.border}`,
            borderTop: "none",
            borderRadius: `0 0 ${height / 2}px ${height / 2}px`,
            overflow: "hidden",
          }}
        >
          {rows.map((s, i) => {
            const { typed, rest } = splitSuggestion(s, value);
            return (
              <li key={s} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
                <button
                  type="button"
                  // pointerdown, not click: the input's blur would otherwise
                  // win the race on a phone.
                  onPointerDown={(ev) => {
                    ev.preventDefault();
                    choose(s);
                  }}
                  onMouseEnter={() => setActive(i)}
                  className={`srch-row${nudge && i === 0 ? " srch-nudge" : ""}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    width: "100%",
                    minHeight: TAP_TARGET_PX,
                    padding: "0 15px",
                    border: "none",
                    textAlign: "left",
                    cursor: "pointer",
                    background: i === active ? PALETTE.hover : "transparent",
                    animation: reduced ? "none" : `srch-rise 160ms ease-out ${i * AUTOCOMPLETE.staggerMs}ms both`,
                  }}
                >
                  <Search size={15} strokeWidth={1.8} color={PALETTE.greyLight} aria-hidden style={{ flex: "0 0 auto" }} />
                  <span
                    style={{
                      fontFamily: UI,
                      fontSize: 15,
                      color: PALETTE.ink,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {/* Typed prefix: NORMAL. Completion: BOLD. Not the other
                        way round — see the note at the top of this file. */}
                    <span style={{ fontWeight: 400 }}>{typed}</span>
                    <span style={{ fontWeight: 700 }}>{rest}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
