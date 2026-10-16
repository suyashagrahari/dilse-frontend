"use client";

// Types and small pieces shared by the Prospects tab's page, modal, composer
// and conversation sheet. Server: server/src/controllers/prospect.controller.ts.

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { API_URL } from "@/lib/config";
import { A } from "../../adminKit";

export type ProspectStatus = "new" | "contacted" | "replied" | "joined" | "not_interested" | "bounced" | "unsubscribed";
/** initial · followup (same thread) · fresh ("New email", new subject) · reply */
export type JobKind = "initial" | "followup" | "fresh" | "reply";

/** What the server allows for one prospect right now (canEmailProspect). */
export type Due =
  | { ok: true; kind: JobKind; kinds?: JobKind[]; needsConfirm?: string; recent?: string; followupDue?: boolean }
  | { ok: false; reason: string };

export interface Prospect {
  id: string;
  name: string;
  email: string;
  instagram: string;
  note: string;
  niche: string;
  followerRange: string;
  status: ProspectStatus;
  source: "manual" | "csv";
  contactCount: number;
  lastContactedAt: string | null;
  initialSentAt: string | null;
  followUpSentAt: string | null;
  followUpCount?: number;
  lastReplyAt: string | null;
  joinedUserId: string | null;
  createdAt: string;
  threadId: string | null;
  unread: boolean;
  messages: number;
  lastDirection: string;
  job: { state: string; kind: JobKind; error: string; sentAt: string | null; createdAt: string } | null;
  due: Due | null;
}

export interface DeployStatus {
  sendMode: "ses" | "stub" | "off";
  fromAddress: string;
  fromName: string;
  replyToAddress: string;
  aiConfigured: boolean;
  commissionPercent: number;
  attributionDays: number;
  joinUrl: string;
  followUpDays: number;
  dailyCap: number;
  /** Instant mode: Send goes out immediately, any hour. Older servers omit it. */
  instant?: boolean;
  sentLast24h: number;
  minGapSeconds: number;
  queued: number;
  queueFinishEstimate: string | null;
  lastError: string;
  /** Older servers omit these; the UI treats a missing field as "classic only". */
  defaultStyle?: OutreachStyle;
  personal?: {
    fromAddress: string;
    fromName: string;
    replyToAddress: string;
    blocked: { message: string; at: string } | null;
    /** The signature as appended, e.g. "Yash\nSubhSandesh". */
    signature?: string;
    /** Who writes in the first person ("Yash"); "" for a team signature. */
    writer?: string;
  };
  /** The quiet SES lane prospect mail goes out on (no open tracking). */
  quietLane?: QuietLane;
  sendWindow?: { startHour: number; endHour: number; tzOffsetMinutes: number } | null;
  maxGapSeconds?: number;
  /** A send within this many hours of the last one is warned about. */
  recentHours?: number;
  /** Above this many recipients at once, suggest spreading the send out. */
  bulkWarnAbove?: number;
  recommendedPerDay?: number;
}

export interface QuietLane {
  configurationSet: string;
  state: "unknown" | "ready" | "missing" | "off";
  message: string;
}

/** The From line of the default (personal) style, exactly as the server reports it. */
export function senderLine(st: DeployStatus | null | undefined): string {
  if (!st) return "";
  if (st.personal && st.defaultStyle !== "classic") return `${st.personal.fromName} <${st.personal.fromAddress}>`;
  return `${st.fromName} <${st.fromAddress}>`;
}

export type OutreachStyle = "personal" | "classic";

export const STATUS_META: Record<ProspectStatus, { label: string; tone: string }> = {
  new: { label: "New", tone: "#6d4ad1" },
  contacted: { label: "Contacted", tone: "#8b5a2b" },
  replied: { label: "Replied", tone: "#1e7a4b" },
  joined: { label: "Joined", tone: "#0f6b5c" },
  not_interested: { label: "Not interested", tone: "#7f5f5f" },
  bounced: { label: "Bounced", tone: "#b3261e" },
  unsubscribed: { label: "Unsubscribed", tone: "#b3261e" },
};

export const KIND_LABEL: Record<JobKind, string> = { initial: "First email", followup: "Follow-up", fresh: "New email", reply: "Reply" };

export function StatusPill({ status }: { status: ProspectStatus }) {
  const m = STATUS_META[status];
  return (
    <span className="psp-pill" style={{ color: m.tone, background: `${m.tone}14`, borderColor: `${m.tone}33` }}>
      <i style={{ background: m.tone }} />
      {m.label}
    </span>
  );
}

export function ago(iso: string | null): string {
  if (!iso) return "—";
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.round(mins / 60)}h ago`;
  if (mins < 10080) return `${Math.round(mins / 1440)}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function when(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const sameDay = d.toDateString() === new Date().toDateString();
  return sameDay
    ? `today ${d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}`
    : d.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

export async function api<T = unknown>(token: string, path: string, init?: { method?: string; body?: unknown }): Promise<{ ok: boolean; status: number; data: T & { success: boolean; error?: string } }> {
  const r = await fetch(`${API_URL}/admin/super${path}`, {
    method: init?.method || (init?.body ? "POST" : "GET"),
    headers: { Authorization: `Bearer ${token}`, ...(init?.body ? { "Content-Type": "application/json" } : {}) },
    body: init?.body ? JSON.stringify(init.body) : undefined,
  });
  const data = await r.json().catch(() => ({ success: false, error: "Unexpected response" }));
  return { ok: r.ok && data.success !== false, status: r.status, data };
}

/**
 * A dialog: centred card on desktop, bottom sheet on a phone. Escape and the
 * backdrop close it; the page behind does not scroll.
 */
export function Sheet({ open, onClose, title, children, wide, footer }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; wide?: boolean; footer?: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);
  if (typeof document === "undefined") return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="psh-back" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
          <motion.div
            role="dialog"
            aria-modal="true"
            className={`psh ${wide ? "wide" : ""}`}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
          >
            <header className="psh-head">
              <h2>{title}</h2>
              <button type="button" className="psh-x" onClick={onClose} aria-label="Close"><X size={16} /></button>
            </header>
            <div className="psh-body">{children}</div>
            {footer && <footer className="psh-foot">{footer}</footer>}
          </motion.div>
          <style>{SHEET_CSS}</style>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

const SHEET_CSS = `
  .psh-back { position: fixed; inset: 0; z-index: 200; background: rgba(42,10,14,.42); backdrop-filter: blur(3px); display: flex; align-items: center; justify-content: center; padding: 20px; }
  .psh { width: min(520px, 100%); max-height: min(88vh, 900px); display: flex; flex-direction: column; background: #fffdfb; border-radius: 20px; box-shadow: 0 30px 80px -30px rgba(42,10,14,.6); overflow: hidden; }
  .psh.wide { width: min(1040px, 100%); }
  .psh-head { display: flex; align-items: center; gap: 10px; padding: 14px 16px; border-bottom: 1px solid ${A.edge}; }
  .psh-head h2 { flex: 1; min-width: 0; margin: 0; font-size: 15.5px; font-weight: 800; color: ${A.ink}; display: flex; align-items: center; gap: 8px; }
  .psh-x { width: 34px; height: 34px; border-radius: 99px; border: 1px solid ${A.edge}; background: #fff; color: ${A.soft}; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; flex: none; }
  .psh-body { flex: 1; min-height: 0; overflow-y: auto; padding: 16px; }
  .psh-foot { padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0px)); border-top: 1px solid ${A.edge}; display: flex; gap: 8px; align-items: center; justify-content: flex-end; flex-wrap: wrap; background: #fffaf5; }
  @media (max-width: 640px) {
    .psh-back { align-items: flex-end; padding: 0; }
    .psh, .psh.wide { width: 100%; max-height: 94vh; border-radius: 20px 20px 0 0; }
    .psh-body { padding: 14px 14px; }
  }
`;

export const SHARED_CSS = `
  .psp-pill { display: inline-flex; align-items: center; gap: 5px; padding: 3px 9px; border-radius: 99px; border: 1px solid; font-size: 11px; font-weight: 800; white-space: nowrap; }
  .psp-pill i { width: 6px; height: 6px; border-radius: 50%; }
  .psp-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-height: 40px; padding: 0 16px; border-radius: 99px; border: 1px solid ${A.edge}; background: #fff; color: ${A.ink}; font-weight: 800; font-size: 13px; cursor: pointer; white-space: nowrap; font-family: inherit; }
  .psp-btn:disabled { opacity: .45; cursor: not-allowed; }
  .psp-btn.primary { background: ${A.maroon}; border-color: ${A.maroon}; color: #f7ece4; }
  .psp-btn.gold { border: 1.5px solid ${A.gold}; background: linear-gradient(135deg, rgba(201,168,76,.24), rgba(201,168,76,.08)); color: ${A.goldDeep}; }
  .psp-btn.danger { color: ${A.danger}; }
  .psp-field { display: grid; gap: 5px; }
  .psp-field > span { font-size: 11px; font-weight: 800; letter-spacing: .05em; text-transform: uppercase; color: ${A.muted}; }
  .psp-field > span em { font-style: normal; text-transform: none; letter-spacing: 0; font-weight: 600; }
  .psp-field input, .psp-field textarea, .psp-field select { width: 100%; box-sizing: border-box; padding: 10px 12px; border-radius: 12px; border: 1.5px solid ${A.edge}; background: #fff; color: ${A.ink}; font-size: 16px; line-height: 1.5; outline: none; font-family: inherit; }
  .psp-field input:focus, .psp-field textarea:focus, .psp-field select:focus { border-color: ${A.gold}; }
  .psp-field[data-err="1"] input { border-color: ${A.danger}; }
  .psp-err { margin: 0; font-size: 12px; font-weight: 700; color: ${A.danger}; }
  .psp-spin { animation: psp-spin 1s linear infinite; }
  @keyframes psp-spin { to { transform: rotate(360deg); } }
`;
