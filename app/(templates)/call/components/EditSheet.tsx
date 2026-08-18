// ─── The editor's form ───────────────────────────────────────────────────────
//
// A five-step bottom sheet: who is calling, the identification card, the
// message, the log, and the send. Every keystroke goes through `updateMf`, and
// the hook autosaves the draft on every change — nobody loses a call log to a
// refresh.
//
// The call log is edited as STRUCTURED ROWS rather than as the
// `kind | time | note` strings the AI writes, because a round trip through a
// pipe-delimited string silently drops `ago` and `duration` and the sender
// never finds out. The pipe format is normalised into these fields once, at the
// AI boundary, in `useCallEditor`.

"use client";

import { useState } from "react";
import { ArrowLeftGlyph, CheckGlyph, CloseGlyph, LockGlyph, MinusGlyph, PlusGlyph } from "./icons";
import { FONT, LIGHT, TAP } from "./theme";
import {
  CALL_KINDS,
  MAX_LOG_ENTRIES,
  MAX_MESSAGE_LINES,
  MAX_TAGS,
  type CallData,
  type CallKind,
  type CallLogEntry,
  type CallerTag,
} from "./types";
import type { EditMode } from "../hooks/useCallEditor";

const STEPS = ["Caller", "ID card", "Message", "Call log", "Send"] as const;

/**
 * The field caption. Declared at module scope, not inside the sheet: a
 * component created during render is a new type on every keystroke, and React
 * remounts every input under it — which on a form like this means the caret
 * jumping to the end of whatever you were typing.
 */
function Label({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "block",
        marginBottom: 6,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.02em",
        color: LIGHT.sub,
      }}
    >
      {children}
    </span>
  );
}

const KIND_LABEL: Record<CallKind, string> = {
  missed: "Missed",
  incoming: "In",
  outgoing: "Out",
  rejected: "Declined",
};

export interface EditSheetProps {
  editMode: EditMode;
  setEditMode: (m: EditMode) => void;
  mf: CallData;
  updateMf: (key: keyof CallData, val: unknown) => void;
  pagePassword: string;
  setPagePassword: (v: string) => void;
  onSave: () => void;
  saving: boolean;
}

export default function EditSheet({
  editMode,
  setEditMode,
  mf,
  updateMf,
  pagePassword,
  setPagePassword,
  onSave,
  saving,
}: EditSheetProps) {
  const [step, setStep] = useState(0);
  const open = editMode === "manual";

  if (!open) return null;

  const input: React.CSSProperties = {
    width: "100%",
    minHeight: TAP,
    padding: "11px 13px",
    borderRadius: 12,
    fontSize: 15,
    fontFamily: FONT,
    color: LIGHT.ink,
    background: LIGHT.paper,
    border: `1px solid #DDE1E5`,
    outline: "none",
  };

  const setCaller = (field: keyof CallData["caller"], value: string) =>
    updateMf("caller", { ...mf.caller, [field]: value });

  const setTag = (i: number, patch: Partial<CallerTag>) =>
    updateMf(
      "tags",
      mf.tags.map((t, idx) => (idx === i ? { ...t, ...patch } : t))
    );

  const setEntry = (i: number, patch: Partial<CallLogEntry>) =>
    updateMf(
      "callLog",
      mf.callLog.map((e, idx) => (idx === i ? { ...e, ...patch } : e))
    );

  const quiet: React.CSSProperties = {
    minHeight: TAP,
    padding: "0 14px",
    borderRadius: 12,
    border: `1px solid #DDE1E5`,
    background: LIGHT.paper,
    color: LIGHT.ink,
    fontFamily: FONT,
    fontSize: 14,
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    cursor: "pointer",
    touchAction: "manipulation",
  };

  const primary: React.CSSProperties = {
    ...quiet,
    border: "none",
    background: LIGHT.accent,
    color: "#fff",
    padding: "0 22px",
  };

  return (
    <>
      <div
        onClick={() => setEditMode("preview")}
        style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(7,9,11,0.5)" }}
      />
      <div
        className="call-sheet"
        role="dialog"
        aria-label="Edit this call"
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 201,
          margin: "0 auto",
          width: "100%",
          maxWidth: 520,
          maxHeight: "92dvh",
          display: "flex",
          flexDirection: "column",
          borderRadius: "22px 22px 0 0",
          background: "#F7F8F9",
          fontFamily: FONT,
          color: LIGHT.ink,
        }}
      >
        <header style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px 10px" }}>
          <div style={{ display: "flex", gap: 6, flex: 1 }}>
            {STEPS.map((s, i) => (
              <span
                key={s}
                title={s}
                style={{
                  width: i === step ? 20 : 8,
                  height: 8,
                  borderRadius: 999,
                  background: i <= step ? LIGHT.accent : "#D8DDE1",
                  transition: "width .2s",
                }}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setEditMode("preview")}
            aria-label="Close"
            style={{
              minHeight: TAP,
              minWidth: TAP,
              border: "none",
              background: "transparent",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
            }}
          >
            <CloseGlyph size={18} color={LIGHT.sub} />
          </button>
        </header>

        <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 12px" }}>
          <h2 style={{ margin: "0 0 14px", fontSize: 20, fontWeight: 700 }}>
            {step === 0 && "Who is calling"}
            {step === 1 && "The identification card"}
            {step === 2 && "What she says when he answers"}
            {step === 3 && "The call log"}
            {step === 4 && "Send it"}
          </h2>

          {/* ── 0. Caller ──────────────────────────────────────────────── */}
          {step === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <label>
                <Label>Her name</Label>
                <input
                  value={mf.caller.name}
                  onChange={(e) => setCaller("name", e.target.value)}
                  placeholder="Meera Sharma"
                  style={input}
                />
              </label>
              <label>
                <Label>Photo URL</Label>
                <input
                  value={mf.caller.photoUrl}
                  onChange={(e) => setCaller("photoUrl", e.target.value)}
                  placeholder="https://…"
                  style={input}
                />
                <span style={{ display: "block", marginTop: 5, fontSize: 12, color: LIGHT.sub }}>
                  Leave it blank and her initials fill the circle instead.
                </span>
              </label>
              <label>
                <Label>Number (never a real, dialable one)</Label>
                <input
                  value={mf.caller.number}
                  onChange={(e) => setCaller("number", e.target.value)}
                  placeholder="+91 98200 41821"
                  style={input}
                />
              </label>
              <label>
                <Label>Location</Label>
                <input
                  value={mf.caller.location}
                  onChange={(e) => setCaller("location", e.target.value)}
                  placeholder="Lucknow, Uttar Pradesh"
                  style={input}
                />
              </label>
              <label>
                <Label>Carrier line</Label>
                <input
                  value={mf.caller.carrier}
                  onChange={(e) => setCaller("carrier", e.target.value)}
                  placeholder="DIL Prepaid"
                  style={input}
                />
              </label>
              <label>
                <Label>Whose phone is it</Label>
                <input
                  value={mf.recipient.name}
                  onChange={(e) => updateMf("recipient", { name: e.target.value })}
                  placeholder="Karan"
                  style={input}
                />
              </label>
            </div>
          )}

          {/* ── 1. The card ────────────────────────────────────────────── */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <button
                type="button"
                onClick={() => updateMf("verified", !mf.verified)}
                style={{
                  ...quiet,
                  justifyContent: "space-between",
                  width: "100%",
                  background: LIGHT.paper,
                }}
              >
                <span>Show the verified tick</span>
                <span
                  aria-hidden="true"
                  style={{
                    width: 42,
                    height: 25,
                    borderRadius: 999,
                    background: mf.verified ? LIGHT.accent : "#D8DDE1",
                    position: "relative",
                    flex: "none",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: 2.5,
                      left: mf.verified ? 20 : 2.5,
                      width: 20,
                      height: 20,
                      borderRadius: 999,
                      background: "#fff",
                      transition: "left .18s",
                    }}
                  />
                </span>
              </button>

              <label>
                <Label>Spam risk — {mf.spamRisk}%</Label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={mf.spamRisk}
                  onChange={(e) => updateMf("spamRisk", Number(e.target.value))}
                  style={{ width: "100%", accentColor: LIGHT.accent, minHeight: TAP }}
                />
                <span style={{ display: "block", fontSize: 12, color: LIGHT.sub }}>
                  0% is the joke. The meter says so out loud.
                </span>
              </label>

              <div>
                <Label>Tags — what people call this number</Label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {mf.tags.map((tag, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input
                        value={tag.label}
                        onChange={(e) => setTag(i, { label: e.target.value })}
                        placeholder="Pick Up. Now."
                        maxLength={48}
                        style={{ ...input, flex: 1 }}
                      />
                      <input
                        value={String(tag.count)}
                        inputMode="numeric"
                        onChange={(e) => setTag(i, { count: Math.max(0, Number(e.target.value.replace(/\D/g, "")) || 0) })}
                        aria-label="How many people"
                        style={{ ...input, width: 84, flex: "none" }}
                      />
                      <button
                        type="button"
                        aria-label="Remove this tag"
                        onClick={() =>
                          updateMf(
                            "tags",
                            mf.tags.filter((_, idx) => idx !== i)
                          )
                        }
                        style={{ ...quiet, padding: 0, width: TAP, justifyContent: "center", flex: "none" }}
                      >
                        <MinusGlyph size={16} color={LIGHT.sub} />
                      </button>
                    </div>
                  ))}
                </div>
                {mf.tags.length < MAX_TAGS && (
                  <button
                    type="button"
                    onClick={() => updateMf("tags", [...mf.tags, { label: "", count: 1 }])}
                    style={{ ...quiet, marginTop: 10 }}
                  >
                    <PlusGlyph size={15} color={LIGHT.ink} /> Add a tag
                  </button>
                )}
                <p style={{ margin: "10px 0 0", fontSize: 12, lineHeight: 1.5, color: LIGHT.sub }}>
                  Her friends can add more through the tag link after you publish — those land pending and you approve
                  each one.
                </p>
              </div>
            </div>
          )}

          {/* ── 2. Message ─────────────────────────────────────────────── */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <label>
                <Label>One line per line. They fade in one at a time.</Label>
                <textarea
                  value={mf.message.join("\n")}
                  onChange={(e) =>
                    updateMf(
                      "message",
                      e.target.value.split("\n").slice(0, MAX_MESSAGE_LINES)
                    )
                  }
                  rows={8}
                  placeholder={"Pick up.\nI know you are looking at the screen right now."}
                  style={{ ...input, resize: "vertical", lineHeight: 1.6 }}
                />
              </label>
              <label>
                <Label>Voice note URL (optional)</Label>
                <input
                  value={mf.voiceUrl ?? ""}
                  onChange={(e) => updateMf("voiceUrl", e.target.value.trim() || null)}
                  placeholder="https://… — leave blank to go straight to the message"
                  style={input}
                />
              </label>
            </div>
          )}

          {/* ── 3. Call log ────────────────────────────────────────────── */}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {mf.callLog.map((entry, i) => (
                <div
                  key={i}
                  style={{
                    padding: 12,
                    borderRadius: 14,
                    background: LIGHT.paper,
                    border: `1px solid #E4E8EB`,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {CALL_KINDS.map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setEntry(i, { kind: k })}
                        style={{
                          minHeight: TAP,
                          padding: "0 12px",
                          borderRadius: 10,
                          border: `1px solid ${entry.kind === k ? LIGHT.accent : "#DDE1E5"}`,
                          background: entry.kind === k ? "rgba(29,163,98,0.1)" : "transparent",
                          color: entry.kind === k ? LIGHT.accent : LIGHT.sub,
                          fontFamily: FONT,
                          fontSize: 13.5,
                          fontWeight: 600,
                          cursor: "pointer",
                          touchAction: "manipulation",
                        }}
                      >
                        {KIND_LABEL[k]}
                      </button>
                    ))}
                    <button
                      type="button"
                      aria-label="Remove this entry"
                      onClick={() =>
                        updateMf(
                          "callLog",
                          mf.callLog.filter((_, idx) => idx !== i)
                        )
                      }
                      style={{ ...quiet, marginLeft: "auto", padding: 0, width: TAP, justifyContent: "center" }}
                    >
                      <MinusGlyph size={16} color={LIGHT.sub} />
                    </button>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      value={entry.time}
                      onChange={(e) => setEntry(i, { time: e.target.value })}
                      placeholder="11:47 PM"
                      style={{ ...input, flex: 1 }}
                    />
                    <input
                      value={entry.ago}
                      onChange={(e) => setEntry(i, { ago: e.target.value })}
                      placeholder="Yesterday"
                      style={{ ...input, flex: 1 }}
                    />
                  </div>

                  {entry.kind !== "missed" && entry.kind !== "rejected" && (
                    <input
                      value={entry.duration ?? ""}
                      onChange={(e) => setEntry(i, { duration: e.target.value })}
                      placeholder="4 hrs 12 mins"
                      style={input}
                    />
                  )}

                  <input
                    value={entry.note ?? ""}
                    onChange={(e) => setEntry(i, { note: e.target.value })}
                    placeholder="the line under it — where the joke lives"
                    style={input}
                  />
                </div>
              ))}

              {mf.callLog.length < MAX_LOG_ENTRIES && (
                <button
                  type="button"
                  onClick={() =>
                    updateMf("callLog", [...mf.callLog, { kind: "missed" as CallKind, time: "", ago: "", note: "" }])
                  }
                  style={quiet}
                >
                  <PlusGlyph size={15} color={LIGHT.ink} /> Add an entry
                </button>
              )}
            </div>
          )}

          {/* ── 4. Send ────────────────────────────────────────────────── */}
          {step === 4 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <label>
                <Label>What her friends see on the tag page</Label>
                <textarea
                  value={mf.contributorPrompt}
                  onChange={(e) => updateMf("contributorPrompt", e.target.value)}
                  rows={3}
                  placeholder="Know this number? Add a tag."
                  style={{ ...input, resize: "vertical", lineHeight: 1.55 }}
                />
              </label>
              <label>
                <Label>Lock it with a password (optional)</Label>
                <div style={{ position: "relative" }}>
                  <input
                    value={pagePassword}
                    onChange={(e) => setPagePassword(e.target.value)}
                    placeholder="leave empty for no lock"
                    style={{ ...input, paddingLeft: 38 }}
                  />
                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
                    <LockGlyph size={16} color={LIGHT.sub} />
                  </span>
                </div>
              </label>
            </div>
          )}
        </div>

        <footer
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 16px calc(14px + env(safe-area-inset-bottom, 0px))",
            borderTop: `1px solid #E4E8EB`,
          }}
        >
          {step > 0 && (
            <button type="button" onClick={() => setStep((s) => s - 1)} style={quiet}>
              <ArrowLeftGlyph size={15} color={LIGHT.ink} /> Back
            </button>
          )}
          <div style={{ flex: 1 }} />
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={() => setStep((s) => s + 1)} style={primary}>
              Next
            </button>
          ) : (
            <button type="button" onClick={onSave} disabled={saving} style={{ ...primary, opacity: saving ? 0.6 : 1 }}>
              <CheckGlyph size={15} color="#fff" /> {saving ? "Saving…" : "Save & preview"}
            </button>
          )}
        </footer>
      </div>

      <style>{`
        .call-sheet { animation: call-sheet-up 260ms cubic-bezier(0.32, 0.72, 0, 1) both; }
        @keyframes call-sheet-up {
          from { transform: translateY(14px); opacity: 0; }
          to   { transform: none; opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) { .call-sheet { animation: none; } }
      `}</style>
    </>
  );
}
