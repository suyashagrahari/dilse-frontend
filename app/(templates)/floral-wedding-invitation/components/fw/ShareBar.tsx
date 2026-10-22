"use client";

// ─── Share the invitation: WhatsApp / native share, copy, card, QR ──────────
// Shared links drop ?to= (guest.ts). The card is drawn on demand (canvas,
// lazy-imported so the guest page doesn't carry it), the QR is drawn as one
// SVG path from lib/share/qr (same encoder the share sheet uses).

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { encodeQr, qrExtent, qrPath } from "@/lib/share/qr";
import type { CardInput } from "./inviteCard";
import { copyText, shareInvite, shareableUrl } from "./guest";
import { ShareIcon } from "./Hero";
import { WaGlyph } from "./FloralEvents";
import type { Strings } from "./model";

export interface ShareBarProps {
  s: Strings;
  lang: "en" | "hi";
  shareText: string;
  card: Omit<CardInput, "url">;
  fileName: string;
}

function QrDialog({ url, s, onClose }: { url: string; s: Strings; onClose: () => void }) {
  const m = useMemo(() => encodeQr(url, "medium"), [url]);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  if (!m) return null;
  const n = qrExtent(m, 2);
  return (
    <div className="fw-qr-scrim" role="dialog" aria-modal="true" aria-label={s.qr} onClick={onClose}>
      <div className="fw-qr" onClick={(e) => e.stopPropagation()}>
        <svg viewBox={`0 0 ${n} ${n}`} width="240" height="240" shapeRendering="crispEdges" role="img" aria-label={s.qrHint}>
          <rect width={n} height={n} fill="#fffcf6" />
          <path d={qrPath(m, 2)} fill="#3d2a24" />
        </svg>
        <p className="fw-qr-h">{s.qrHint}</p>
        <button ref={closeRef} type="button" className="wk-btn wk-btn-ghost fw-btn" onClick={onClose}>
          {s.close}
        </button>
      </div>
    </div>
  );
}

export default function ShareBar({ s, lang, shareText, card, fileName }: ShareBarProps) {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [qr, setQr] = useState(false);
  const [url] = useState(() => shareableUrl());
  const hostRef = useRef<HTMLDivElement>(null);

  const share = () => void shareInvite(shareText, url);
  const copy = async () => {
    if (await copyText(url)) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  };
  const download = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const { downloadInviteCard } = await import("./inviteCard");
      await downloadInviteCard({ ...card, url }, fileName);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div ref={hostRef} className="fw-share" lang={lang}>
      <button type="button" className="wk-btn fw-btn fw-share-main" onClick={share}>
        <WaGlyph /> {s.shareInvite}
      </button>
      <div className="fw-share-row">
        <button type="button" className="fw-chip" onClick={copy} aria-live="polite">
          <ShareIcon /> {copied ? s.copied : s.copy}
        </button>
        <button type="button" className="fw-chip" onClick={download} disabled={busy} aria-busy={busy}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14" />
          </svg>
          {busy ? s.cardBusy : s.card}
        </button>
        <button type="button" className="fw-chip" onClick={() => setQr(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
            <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 18h2v2h-2zM14 18h2M18 14h2" />
          </svg>
          {s.qr}
        </button>
      </div>
      {/* Portalled to the page root: the share bar sits inside a transformed reveal, which would trap position: fixed. */}
      {qr && url && createPortal(<QrDialog url={url} s={s} onClose={() => setQr(false)} />, hostRef.current?.closest(".fw-root") ?? document.body)}
    </div>
  );
}
