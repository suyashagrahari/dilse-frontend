"use client";

// ─── Keypad ──────────────────────────────────────────────────────────────────
//
// A button, not a link. Press state is driven from pointerdown so the key is
// already down before the browser has decided whether this is a click, and it
// stays down for 90ms so a fast tap still reads as a press.
//
// Height is fixed at KEY_H authored pixels and the machine's scale is floored at
// MIN_SCALE = 44 / KEY_H, so the computed tap target can never fall under 44px
// however narrow the viewport gets.

import { useCallback, useEffect, useRef, useState } from "react";
import { sfxKeyClick } from "@/lib/webAudio";
import { C, KEY_GAP, KEY_H, OSWALD, WORN_KEYS } from "./machine";

export const KEY_ROWS: string[][] = [
  ["A", "B", "C"],
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["CLEAR", "0", "ENTER"],
];

const PRESS_MS = 90;

interface KeypadProps {
  onKey: (key: string) => void;
  disabled?: boolean;
}

export default function Keypad({ onKey, disabled = false }: KeypadProps) {
  const [down, setDown] = useState<string | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const press = useCallback(
    (key: string) => {
      if (disabled) return;
      sfxKeyClick();
      setDown(key);
      if (timer.current !== null) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setDown(null), PRESS_MS);
      onKey(key);
    },
    [disabled, onKey],
  );

  return (
    <div
      role="group"
      aria-label="Keypad"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: KEY_GAP,
        padding: 7,
        background: "linear-gradient(180deg,#173437 0%,#0f2528 100%)",
        border: "1px solid #0a1a1c",
        boxShadow: "inset 0 2px 6px rgba(0,0,0,.65)",
        opacity: disabled ? 0.62 : 1,
      }}
    >
      {KEY_ROWS.flat().map((key) => {
        const worn = WORN_KEYS.has(key);
        const wide = key.length > 1;
        return (
          <button
            key={key}
            type="button"
            className="vm-key"
            data-down={down === key ? "1" : "0"}
            data-vm-key={key}
            disabled={disabled}
            aria-label={key === "ENTER" ? "Enter" : key === "CLEAR" ? "Clear" : `Key ${key}`}
            onPointerDown={(e) => {
              e.preventDefault();
              press(key);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                press(key);
              }
            }}
            style={{
              height: KEY_H,
              minHeight: KEY_H,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: OSWALD,
              fontWeight: 600,
              fontSize: wide ? 12 : 20,
              letterSpacing: wide ? "0.1em" : "0.04em",
              color: worn ? "#f2f7f5" : C.ink,
              background: worn
                ? "linear-gradient(180deg,#3d5f60 0%,#2a4749 60%,#22393b 100%)"
                : "linear-gradient(180deg,#2d4a4c 0%,#1e3739 62%,#182c2e 100%)",
              border: "1px solid #08171a",
              borderRadius: 2,
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,.14), inset 0 -2px 4px rgba(0,0,0,.5), 0 1px 0 rgba(0,0,0,.5)",
              textShadow: "0 1px 0 rgba(0,0,0,.6)",
              cursor: disabled ? "default" : "pointer",
              touchAction: "manipulation",
              userSelect: "none",
            }}
          >
            {key}
          </button>
        );
      })}
    </div>
  );
}
