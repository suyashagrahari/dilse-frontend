"use client";

// ─── Credit prompt ───────────────────────────────────────────────────────────
//
// Lives BELOW the machine. Never over it — the machine is a physical object and
// a text field floating across its face breaks that in one frame.
//
// The privacy line is rendered unconditionally above the field, so it is on
// screen before the first answer can possibly be submitted. This is not a
// disclosure to tuck away: the person typing here never signed up for anything.

import { useEffect, useRef } from "react";
import { templateMedia } from "@/lib/templateMedia";
import { PRIVACY_NOTICE, PRIVACY_NOTICE_TAIL } from "./types";
import { C, MONO, OSWALD } from "./machine";

export const MAX_ANSWER = 100;

interface CreditPromptProps {
  prompt: string;
  senderName: string;
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onSkip: () => void;
  onClose: () => void;
  /** Unlocked after three answers. Nobody's gift is gated behind a chore. */
  freeCreditAvailable: boolean;
  onFreeCredit: () => void;
  reducedMotion: boolean;
}

export default function CreditPrompt({
  prompt,
  senderName,
  value,
  onChange,
  onSubmit,
  onSkip,
  onClose,
  freeCreditAvailable,
  onFreeCredit,
  reducedMotion,
}: CreditPromptProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = window.setTimeout(() => inputRef.current?.focus(), 60);
    return () => window.clearTimeout(id);
  }, [prompt]);

  return (
    <section
      aria-label="Insert credit"
      style={{
        background: `linear-gradient(180deg, ${C.plateHi} 0%, ${C.plateLo} 100%)`,
        border: `1px solid ${C.edge}`,
        borderRadius: 22,
        padding: "14px 14px 16px",
        boxShadow: "0 20px 40px -22px rgba(0,0,0,.7)",
      }}
    >
      {!reducedMotion && (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
          {/* animated .webp — <img>, never <video> */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={templateMedia("vending-machine", "prompt-thinking.webp")}
            alt=""
            aria-hidden="true"
            width={84}
            height={84}
            style={{ width: 84, height: 84, objectFit: "cover", borderRadius: 18 }}
          />
        </div>
      )}

      <p
        style={{
          margin: 0,
          fontFamily: OSWALD,
          fontSize: 13,
          letterSpacing: "0.09em",
          color: C.amber,
          textTransform: "uppercase",
        }}
      >
        <span style={{ opacity: 0.7 }}>&gt;&nbsp;</span>
        {prompt}
      </p>

      {/* PRIVACY — required, on screen before the first answer can be sent */}
      <p
        style={{
          margin: "8px 0 10px",
          fontFamily: MONO,
          fontSize: 11,
          lineHeight: 1.45,
          color: "rgba(255,255,255,.78)",
          borderLeft: `2px solid ${C.green}`,
          paddingLeft: 8,
        }}
      >
        {PRIVACY_NOTICE}
        <strong style={{ color: C.green, fontWeight: 700 }}>{senderName}</strong>
        {PRIVACY_NOTICE_TAIL}
      </p>

      <div style={{ display: "flex", gap: 6 }}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          maxLength={MAX_ANSWER}
          enterKeyHint="done"
          placeholder="type it here"
          aria-label={prompt}
          onChange={(e) => onChange(e.target.value.slice(0, MAX_ANSWER))}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSubmit();
            }
          }}
          style={{
            flex: 1,
            minWidth: 0,
            height: 44,
            padding: "0 10px",
            fontFamily: MONO,
            fontSize: 16,
            color: "#fff",
            background: "rgba(0,0,0,.35)",
            border: "1px solid rgba(255,255,255,.18)",
            borderRadius: 12,
            outline: "none",
          }}
        />
        <button
          type="button"
          onClick={onSubmit}
          disabled={value.trim().length === 0}
          style={{
            height: 44,
            padding: "0 14px",
            fontFamily: OSWALD,
            fontSize: 13,
            letterSpacing: "0.12em",
            color: value.trim() ? "#0b0b0b" : "rgba(255,255,255,.4)",
            background: value.trim() ? C.green : "rgba(255,255,255,.08)",
            border: "1px solid rgba(0,0,0,.3)",
            borderRadius: 12,
            cursor: value.trim() ? "pointer" : "default",
            touchAction: "manipulation",
          }}
        >
          INSERT
        </button>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 10,
          marginTop: 10,
          fontFamily: OSWALD,
          fontSize: 10,
          letterSpacing: "0.09em",
        }}
      >
        <span style={{ color: "rgba(255,255,255,.6)" }}>
          {value.length}/{MAX_ANSWER}
        </span>
        <button type="button" onClick={onSkip} style={{ color: "rgba(255,255,255,.7)", textDecoration: "underline", minHeight: 32 }}>
          ANOTHER QUESTION
        </button>
        <button type="button" onClick={onClose} style={{ color: "rgba(255,255,255,.7)", textDecoration: "underline", minHeight: 32 }}>
          CLOSE
        </button>
        {freeCreditAvailable && (
          <button
            type="button"
            onClick={onFreeCredit}
            style={{
              marginLeft: "auto",
              padding: "6px 9px",
              color: C.amber,
              border: `1px solid ${C.amber}`,
              borderRadius: 999,
              letterSpacing: "0.1em",
            }}
          >
            INSERT CREDIT — FREE
          </button>
        )}
      </div>
    </section>
  );
}
