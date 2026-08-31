"use client";

// ─── Managing one page's share password, from the profile ─────────────────────
//
// A share password is the word standing between a link and the page behind it.
// Before this, the only ways to change one were to reopen the template's builder
// and re-save the whole thing, or to ask a super admin — neither of which is a
// reasonable ask of somebody who just wants to rotate the word they gave to the
// wrong cousin.
//
// ── WHY IT SHOWS THE CURRENT PASSWORD ───────────────────────────────────────
//
// Because this is not a credential. It is a word the owner has to be able to
// pass on, and the profile already revealed it behind an eye toggle for exactly
// that reason — a sender who cannot read the password cannot tell anyone it. This
// component keeps that and adds the ability to change it.
//
// ── WHY IT WORKS ON DRAFTS TOO ──────────────────────────────────────────────
//
// The old row only rendered for published pages. But the password is set in the
// builder at create time, so a draft can already carry one — and a draft is
// precisely when you would want to fix it before sending the link. There is
// nothing about an unpublished page that makes its password unmanageable.

import { useEffect, useRef, useState } from "react";
import { KeyRound, Eye, EyeOff, Copy, Check, Pencil, X, Loader2, Trash2, ShieldOff } from "lucide-react";
import { API_URL, IS_NGROK } from "@/lib/config";

const AMBER = "#f59e0b";
const MIN_LENGTH = 4;

export default function PagePasswordControl({
  templateType,
  pageId,
  hasPassword,
  passwordRaw,
  onChanged,
}: {
  templateType: string;
  pageId: string;
  hasPassword: boolean;
  /** The current password in the clear, when the server has it. May be empty. */
  passwordRaw: string;
  /** Tell the parent what the page now looks like, so its list stays truthful. */
  onChanged: (next: { hasPassword: boolean; passwordRaw: string }) => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState<"save" | "remove" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const headers = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${typeof window === "undefined" ? "" : window.localStorage.getItem("gifts_access_token") || ""}`,
    ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
  });

  async function submit(nextPassword: string, mode: "save" | "remove") {
    if (busy) return;
    setBusy(mode);
    setError(null);
    try {
      const res = await fetch(
        `${API_URL}/my-pages/${encodeURIComponent(templateType)}/${encodeURIComponent(pageId)}/password`,
        { method: "PUT", headers: headers(), body: JSON.stringify({ password: nextPassword }) }
      );
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Could not update the password");

      // The server is the authority on what the page now looks like — it decides
      // whether an empty string counted as a removal.
      onChanged({
        hasPassword: Boolean(json.data?.hasPassword),
        passwordRaw: String(json.data?.passwordRaw ?? ""),
      });

      setEditing(false);
      setValue("");
      setRevealed(false);
      setDone(mode === "remove" ? "Password removed" : "Password updated");
      setTimeout(() => setDone(null), 2600);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update the password");
    } finally {
      setBusy(null);
    }
  }

  const copy = () => {
    if (!passwordRaw) return;
    void navigator.clipboard.writeText(passwordRaw);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const tooShort = value.trim().length > 0 && value.trim().length < MIN_LENGTH;

  // ── Not protected, and not being changed ────────────────────────────────────
  if (!hasPassword && !editing) {
    return (
      <div
        className="flex items-center gap-2 rounded-xl px-3 py-2.5"
        style={{ background: "var(--app-surface)", border: "1px solid var(--app-border-faint)" }}
      >
        <ShieldOff size={12} className="shrink-0" style={{ color: "var(--app-text-faint)" }} />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-medium mb-0.5" style={{ color: "var(--app-text-faint)" }}>
            No password
          </p>
          <p className="text-[11px] truncate" style={{ color: "var(--app-text-muted)" }}>
            Anyone with the link can open it
          </p>
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setEditing(true); }}
          className="shrink-0 rounded-lg px-2.5 flex items-center gap-1.5"
          style={{ minHeight: 32, background: "var(--app-accent-a08)", color: "var(--app-accent)", fontSize: 11, fontWeight: 700 }}
        >
          <KeyRound size={11} /> Add
        </button>
        {done && <span className="text-[10px] shrink-0" style={{ color: "#16a34a" }}>{done}</span>}
      </div>
    );
  }

  return (
    <div
      className="rounded-xl px-3 py-2.5"
      style={{ background: `rgba(245,158,11,0.05)`, border: `1px solid rgba(245,158,11,0.12)` }}
      // The whole row sits inside a clickable card in the profile. Without this,
      // typing a password navigates to the page instead.
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-2">
        <KeyRound size={12} style={{ color: AMBER }} className="shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-medium mb-0.5" style={{ color: AMBER }}>
            {editing ? (hasPassword ? "New password" : "Set a password") : "Secret Password"}
          </p>

          {editing ? (
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => { setValue(e.target.value); setError(null); }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !tooShort && value.trim()) void submit(value.trim(), "save");
                if (e.key === "Escape") { setEditing(false); setValue(""); setError(null); }
              }}
              placeholder={`At least ${MIN_LENGTH} characters`}
              autoComplete="off"
              // 16px: below that iOS Safari zooms the page on focus, which inside
              // a scrolling list of cards is disorienting.
              style={{
                width: "100%", minHeight: 34, fontSize: 16, fontWeight: 600,
                background: "transparent", border: "none", outline: "none",
                color: "var(--app-text)", fontFamily: "ui-monospace, monospace",
              }}
            />
          ) : passwordRaw ? (
            <p className="text-xs font-mono font-semibold truncate" style={{ color: "var(--app-text)" }}>
              {revealed ? passwordRaw : "••••••••"}
            </p>
          ) : (
            // Protected, but the plaintext predates the field being stored. The
            // owner can still replace it, which is the useful thing to say.
            <p className="text-[10px] italic" style={{ color: "var(--app-text-faint)" }}>
              Protected — set a new one to see it here
            </p>
          )}
        </div>

        {/* ── Actions ───────────────────────────────────────────────────── */}
        {!editing ? (
          <div className="flex items-center gap-1 shrink-0">
            {passwordRaw && (
              <>
                <button
                  type="button"
                  title={revealed ? "Hide" : "Show"}
                  aria-label={revealed ? "Hide password" : "Show password"}
                  onClick={(e) => { e.stopPropagation(); setRevealed((v) => !v); }}
                  className="rounded-lg flex items-center justify-center"
                  style={{ width: 32, height: 32, background: "rgba(245,158,11,0.1)", color: AMBER }}
                >
                  {revealed ? <EyeOff size={12} /> : <Eye size={12} />}
                </button>
                <button
                  type="button"
                  title="Copy"
                  aria-label="Copy password"
                  onClick={(e) => { e.stopPropagation(); copy(); }}
                  className="rounded-lg flex items-center justify-center"
                  style={{ width: 32, height: 32, background: "rgba(245,158,11,0.1)", color: AMBER }}
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                </button>
              </>
            )}
            <button
              type="button"
              title="Change password"
              aria-label="Change password"
              onClick={(e) => { e.stopPropagation(); setEditing(true); }}
              className="rounded-lg flex items-center justify-center"
              style={{ width: 32, height: 32, background: "rgba(245,158,11,0.16)", color: AMBER }}
            >
              <Pencil size={12} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              disabled={!value.trim() || tooShort || busy !== null}
              onClick={(e) => { e.stopPropagation(); void submit(value.trim(), "save"); }}
              className="rounded-lg px-2.5 flex items-center gap-1.5"
              style={{
                minHeight: 32,
                background: !value.trim() || tooShort ? "rgba(245,158,11,0.12)" : AMBER,
                color: !value.trim() || tooShort ? AMBER : "#fff",
                fontSize: 11, fontWeight: 800,
                cursor: !value.trim() || tooShort || busy ? "default" : "pointer",
              }}
            >
              {busy === "save" ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
              Save
            </button>
            <button
              type="button"
              title="Cancel"
              aria-label="Cancel"
              onClick={(e) => { e.stopPropagation(); setEditing(false); setValue(""); setError(null); }}
              className="rounded-lg flex items-center justify-center"
              style={{ width: 32, height: 32, background: "rgba(245,158,11,0.1)", color: AMBER }}
            >
              <X size={12} />
            </button>
          </div>
        )}
      </div>

      {/* Removing is destructive and separated from Save, so a mis-tap while
          rotating a password cannot take the protection off the page. */}
      {editing && hasPassword && (
        <button
          type="button"
          disabled={busy !== null}
          onClick={(e) => { e.stopPropagation(); void submit("", "remove"); }}
          className="mt-2 flex items-center gap-1.5"
          style={{ background: "none", border: "none", padding: 0, color: "#b3261e", fontSize: 11, fontWeight: 700 }}
        >
          {busy === "remove" ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
          Remove password — anyone with the link could open it
        </button>
      )}

      {tooShort && (
        <p className="mt-1.5 text-[10.5px]" style={{ color: "#b3261e" }}>
          At least {MIN_LENGTH} characters.
        </p>
      )}
      {error && (
        <p className="mt-1.5 text-[10.5px]" style={{ color: "#b3261e" }}>{error}</p>
      )}
      {done && !editing && (
        <p className="mt-1.5 text-[10.5px]" style={{ color: "#16a34a" }}>{done}</p>
      )}
    </div>
  );
}
