"use client";

// ─── <ReplyBox> — "Write back to {sender}" (≤280), at the end of the page ────
//
//   <ReplyBox accent={t.accent} />
//
// Live page: POST /<slug>-pages/share/:shareId/reply — public, rate-limited,
// FIRST WRITE WINS (one reply per page). The sender sees it in their editor
// ("They wrote back ✦") and gets an email. Preview (editor): a disabled
// stand-in. Renders nothing when the sender switched replies off.
// The share context (slug, shareId, replySent) comes from ValentineDayViewer.

import { createContext, useContext, useState, type CSSProperties } from "react";
import { API_URL, IS_NGROK } from "@/lib/config";
import { PREMIUM_LIMITS } from "../../premiumData";
import { usePremium } from "./PremiumRoot";

export interface PremiumShareInfo {
  slug: string;
  shareId: string;
  /** The server says a reply already exists (from any device). */
  replySent: boolean;
}

/** Provided by app/[id]/ValentineDayViewer around a premium Experience. Null in the editor. */
export const PremiumShareContext = createContext<PremiumShareInfo | null>(null);
export const usePremiumShare = () => useContext(PremiumShareContext);

/** POST the reply. Resolves to "sent" | "already" | "error". */
export async function sendPremiumReply(slug: string, shareId: string, text: string): Promise<"sent" | "already" | "error"> {
  try {
    const r = await fetch(`${API_URL}/${slug}-pages/share/${encodeURIComponent(shareId)}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}) },
      body: JSON.stringify({ text }),
    });
    const j = (await r.json().catch(() => ({}))) as { success?: boolean; recorded?: boolean };
    if (!r.ok || !j.success) return "error";
    return j.recorded ? "sent" : "already";
  } catch {
    return "error";
  }
}

export interface ReplyBoxProps {
  /** Heading (default "Write back to {sender}"). */
  title?: string;
  placeholder?: string;
  accent?: string;
  onSent?: (text: string) => void;
  style?: CSSProperties;
  className?: string;
}

export default function ReplyBox({ title, placeholder = "Say it back — a line, a memory, a yes…", accent = "var(--vw-accent, #d0245f)", onSent, style, className }: ReplyBoxProps) {
  const { premium, senderName, mode, sfx } = usePremium();
  const share = usePremiumShare();
  const key = share ? `premium_reply_${share.shareId}` : "";
  const [text, setText] = useState("");
  // Client-only (experiences mount with ssr: false), so reading storage here is safe.
  const [state, setState] = useState<"idle" | "sending" | "sent" | "already" | "error">(() => {
    if (!share) return "idle";
    if (share.replySent) return "already";
    try {
      return window.localStorage.getItem(key) ? "already" : "idle";
    } catch {
      return "idle";
    }
  });

  if (!premium.allowReply) return null;
  const heading = title ?? `Write back to ${senderName || "them"}`;
  const preview = mode === "preview" || !share;
  const left = PREMIUM_LIMITS.reply - Array.from(text).length;

  const send = async () => {
    const clean = text.trim();
    if (!clean || preview || !share || state === "sending") return;
    setState("sending");
    const r = await sendPremiumReply(share.slug, share.shareId, clean);
    if (r === "error") {
      setState("error");
      return;
    }
    try {
      window.localStorage.setItem(key, "1");
    } catch {
      /* fine */
    }
    setState(r === "sent" ? "sent" : "already");
    if (r === "sent") {
      sfx("chime-cascade");
      onSent?.(clean);
    }
  };

  return (
    <section className={`pm-reply${className ? ` ${className}` : ""}`} style={{ ["--pm-reply-accent" as string]: accent, ...style }} aria-label={heading}>
      <h3 className="pm-replyH">{heading} <span aria-hidden>✦</span></h3>
      {state === "sent" || state === "already" ? (
        <p className="pm-replyDone" role="status">
          {state === "sent" ? `Sent ✦ ${senderName || "They"} will see it.` : `You already wrote back ✦`}
        </p>
      ) : (
        <>
          <textarea
            className="pm-replyIn"
            rows={3}
            value={text}
            maxLength={PREMIUM_LIMITS.reply * 2}
            placeholder={preview ? "They can write back to you here." : placeholder}
            disabled={preview}
            onChange={(e) => setText(Array.from(e.target.value).slice(0, PREMIUM_LIMITS.reply).join(""))}
            aria-label={heading}
          />
          <div className="pm-replyRow">
            <small aria-live="polite">{state === "error" ? "Couldn't send — try again." : `${left} left`}</small>
            <button type="button" className="pm-replyBtn" onClick={send} disabled={preview || !text.trim() || state === "sending"}>
              {state === "sending" ? "Sending…" : preview ? "Replies arrive here" : "Send ✦"}
            </button>
          </div>
        </>
      )}
      <style>{REPLY_CSS}</style>
    </section>
  );
}

const REPLY_CSS = `
.pm-reply { display: grid; gap: 10px; width: min(100%, 460px); padding: 16px; border-radius: 20px; box-sizing: border-box;
  background: var(--vw-glass, rgba(255,255,255,.7)); border: 1px solid var(--vw-edge, rgba(0,0,0,.08)); color: var(--vw-ink, #2a1a22); }
.pm-replyH { margin: 0; font: 700 17px/1.2 var(--vw-font-serif, serif); }
.pm-replyIn { width: 100%; box-sizing: border-box; resize: vertical; min-height: 84px; padding: 12px; border-radius: 14px;
  border: 1px solid var(--vw-edge, rgba(0,0,0,.15)); background: rgba(255,255,255,.85); color: #2a1a22; font: 500 16px/1.4 var(--vw-font-ui, system-ui), sans-serif; }
.pm-replyIn:focus-visible { outline: 3px solid var(--pm-reply-accent); outline-offset: 1px; }
.pm-replyRow { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.pm-replyRow small { font: 600 12px/1 var(--vw-font-ui, system-ui), sans-serif; opacity: .7; }
.pm-replyBtn { min-height: 44px; padding: 0 20px; border-radius: 99px; border: 0; cursor: pointer; color: #fff; font: 700 15px/1 var(--vw-font-ui, system-ui), sans-serif;
  background: var(--pm-reply-accent); }
.pm-replyBtn:disabled { opacity: .5; cursor: default; }
.pm-replyDone { margin: 0; font: 600 15px/1.4 var(--vw-font-ui, system-ui), sans-serif; }
`;
