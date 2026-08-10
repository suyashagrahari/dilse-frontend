"use client";

// ─── ShareSheet — one share surface for every template ───────────────────────
//
// Four tabs, in the order a sender actually needs them:
//
//   LINK   — the chat apps, plus the address with a copy button.
//   QR     — the code on screen, to hold up or send as an image.
//   PHOTO  — the same code, coloured from a photo they pick. Downloads as PNG.
//   PRINT  — a colourful A5 card carrying the code, to print and hand over.
//
// ── WHY THE PRINT TAB EXISTS ─────────────────────────────────────────────────
//
// Everything else here assumes the two people are in a chat window. A lot of
// these gifts are not given that way — they are taped to a box, tucked into a
// birthday card, or left on a desk. Without a printable surface the only way to
// do that is to screenshot a QR and hope it prints large enough, which is how
// you end up with a code nobody can scan.
//
// ── THE QR IS RASTERISED ONCE, AND EVERYTHING REUSES IT ──────────────────────
//
// `qrDataUrl` is generated on demand the first time a tab that needs it opens,
// then reused by the preview, the card, the PNG download, and the file share.
// It is regenerated only when the URL or accent actually changes. Encoding is
// a few milliseconds, but the canvas round-trip is not free and doing it per
// render made the tab switch visibly stutter.
//
// ── ONE EXPORT AT A TIME ─────────────────────────────────────────────────────
//
// `busy` gates both download buttons. `html-to-image` walks and clones the whole
// subtree; firing a second capture while the first is mid-clone produces a
// half-painted card, and the sender has no way to tell that is what happened.
//
// ── NO STORAGE ───────────────────────────────────────────────────────────────
//
// Nothing here writes localStorage or sessionStorage, in line with the rest of
// the share surface. The chosen tab resets every time the sheet opens.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Copy,
  Check,
  Download,
  Facebook,
  ImagePlus,
  Instagram,
  Link2,
  MessageCircle,
  Printer,
  QrCode,
  Send,
  Share2,
  Twitter,
} from "lucide-react";

import { EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import { exportNodeToPng, fileSlug } from "@/lib/exportPng";
import { dataUrlToFile, downloadDataUrl, qrToPngDataUrl } from "@/lib/share/qrPng";

import { PhotoQrPanel } from "./PhotoQrPanel";
import { PrintableCard, CARD_W, CARD_H } from "./PrintableCard";
import { QrBlock } from "./QrBlock";
import { DEFAULT_ACCENT, alpha, readableInk, shade, tint, qrInk } from "./qrTheme";

/** Same-origin, so it can sit inside both the canvas and the captured card. */
const LOGO_SRC = "/logo.webp";

/** Scale of the print-tab preview. 640 × 0.42 = 269px, which fits the sheet. */
const PREVIEW_SCALE = 0.42;

type TabKey = "link" | "qr" | "photo" | "print";

/**
 * Labels are short because there are four of them across a 354px row; the full
 * name lives in `title`, which is what a screen reader announces.
 */
const TABS: Array<{ key: TabKey; label: string; title: string; icon: React.ReactNode }> = [
  { key: "link", label: "Link", title: "Share a link", icon: <Link2 size={14} /> },
  { key: "qr", label: "QR", title: "QR code", icon: <QrCode size={14} /> },
  { key: "photo", label: "Photo", title: "Photo QR code", icon: <ImagePlus size={14} /> },
  { key: "print", label: "Print", title: "Printable card", icon: <Printer size={14} /> },
];

export interface ShareSheetProps {
  open: boolean;
  onClose: () => void;
  shareUrl: string | null;
  /** Native-share title, and the card headline when `cardTitle` is absent. */
  title?: string;
  /** The message that travels with the link into a chat app. */
  text?: string;
  cardTitle?: string;
  cardNote?: string;
  recipientName?: string;
  senderName?: string;
  accent?: string;
  slug?: string;
}

/**
 * A localhost address is useless to the person receiving it, and during
 * development it is the address the publish response hands back. Rewrite the
 * host — never the path — so a link shared from a dev machine still resolves.
 */
function toPublicUrl(raw: string): string {
  if (!raw) return raw;
  try {
    const parsed = new URL(raw);
    const local =
      parsed.hostname === "localhost" ||
      parsed.hostname === "127.0.0.1" ||
      parsed.hostname === "0.0.0.0";
    if (!local) return raw;
    const prod = (process.env.NEXT_PUBLIC_PROD_SITE_URL || "https://subhsandesh.in").replace(
      /\/$/,
      "",
    );
    return `${prod}${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return raw;
  }
}

export function ShareSheet({
  open,
  onClose,
  shareUrl,
  title,
  text,
  cardTitle,
  cardNote,
  recipientName,
  senderName,
  accent = DEFAULT_ACCENT,
  slug,
}: ShareSheetProps) {
  const [tab, setTab] = useState<TabKey>("link");
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const cardRef = useRef<HTMLDivElement | null>(null);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    },
    [],
  );

  const say = useCallback((message: string) => {
    setToast(message);
    const t = setTimeout(() => setToast(null), 2600);
    timers.current.push(t);
  }, []);

  const url = useMemo(() => toPublicUrl(shareUrl || ""), [shareUrl]);
  const ink = readableInk(accent);
  const deep = shade(accent, 0.45);
  const codeInk = useMemo(() => qrInk(accent), [accent]);

  const headline = (cardTitle || title || "Something is waiting for you").trim();
  const note = (
    cardNote || "Point your phone camera at the code and it opens right up. No app needed."
  ).trim();
  const stem = fileSlug(slug || title || "subhsandesh");

  // Every time the sheet opens it starts on Link, which is what most senders
  // want; leaving it on whatever tab was last used makes the button feel like
  // it does something different each time.
  useEffect(() => {
    if (open) {
      setTab("link");
      setCopied(false);
    }
  }, [open]);

  // Rasterise once per (url, accent). The QR tab, the card preview, both
  // downloads and the file share all read this one bitmap.
  useEffect(() => {
    let cancelled = false;
    if (!open || !url) {
      setQrDataUrl(null);
      return;
    }
    (async () => {
      const png = await qrToPngDataUrl(url, {
        size: 1024,
        ecLevel: "high",
        dark: codeInk,
        logoSrc: LOGO_SRC,
      });
      if (!cancelled) setQrDataUrl(png);
    })();
    return () => {
      cancelled = true;
    };
  }, [open, url, codeInk]);

  // Escape closes, matching every other dismissible layer in the app.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const copyLink = useCallback(() => {
    if (!url) return;
    track(EVENTS.SHARE, { method: "copy_link" });
    window.navigator.clipboard
      ?.writeText(url)
      .then(() => {
        setCopied(true);
        say("Link copied.");
        timers.current.push(setTimeout(() => setCopied(false), 2000));
      })
      .catch(() => say("Copy failed — select the address above instead."));
  }, [url, say]);

  const openChatApp = useCallback(
    (target: "whatsapp" | "instagram" | "telegram" | "twitter" | "facebook") => {
      if (!url) return;
      track(EVENTS.SHARE, { method: target });

      const message = (text && text.trim()) || "Made you something on SubhSandesh ✨";
      const encodedUrl = encodeURIComponent(url);
      const encodedText = encodeURIComponent(message);
      const encodedBoth = encodeURIComponent(`${message}\n${url}`);

      if (target === "instagram") {
        // Instagram has no web share intent, so the link goes to the clipboard
        // and the app opens on its own — the sender pastes it into a DM.
        copyLink();
        window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
        return;
      }

      const map = {
        // URL last for WhatsApp: it link-previews the trailing address reliably.
        whatsapp: `https://api.whatsapp.com/send?text=${encodedBoth}`,
        telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      } as const;

      window.open(map[target], "_blank", "noopener,noreferrer");
    },
    [url, text, copyLink],
  );

  const nativeShare = useCallback(() => {
    if (!url) return;
    if (typeof navigator !== "undefined" && "share" in navigator) {
      track(EVENTS.SHARE, { method: "native" });
      window.navigator.share({ title: title || "SubhSandesh", text, url }).catch(() => {});
      return;
    }
    copyLink();
  }, [url, title, text, copyLink]);

  /**
   * Share the QR as an image where the platform supports it, and fall back to
   * sharing the link where it does not.
   *
   * `canShare({ files })` is checked before building the File: iOS Safari
   * advertises `navigator.share` but rejects a files payload outright, and an
   * unhandled rejection there loses the share with no message at all.
   */
  const shareQrImage = useCallback(async () => {
    if (!url) return;
    const file = qrDataUrl ? dataUrlToFile(qrDataUrl, `${stem}-qr.png`) : null;
    const nav = typeof navigator !== "undefined" ? window.navigator : null;

    if (file && nav?.canShare?.({ files: [file] })) {
      try {
        track(EVENTS.SHARE, { method: "qr_image" });
        await nav.share({ files: [file], title: title || "SubhSandesh", text: url });
        return;
      } catch {
        // Dismissed, or the platform changed its mind. Fall through to the link.
      }
    }
    nativeShare();
  }, [url, qrDataUrl, stem, title, nativeShare]);

  const downloadQr = useCallback(() => {
    if (!qrDataUrl) {
      say("The code is still rendering — try again in a second.");
      return;
    }
    track(EVENTS.SHARE, { method: "qr_download" });
    downloadDataUrl(qrDataUrl, `${stem}-qr.png`);
    say("QR saved to your downloads.");
  }, [qrDataUrl, stem, say]);

  const downloadCard = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      track(EVENTS.SHARE, { method: "print_card" });
      const result = await exportNodeToPng(cardRef.current, {
        width: CARD_W,
        height: CARD_H,
        filename: `${stem}-card`,
        backgroundColor: "#FFF8F3",
        pixelRatio: 3,
      });
      say(result.ok ? "Card saved — print it at A5 or bigger." : result.message);
    } finally {
      setBusy(false);
    }
  }, [busy, stem, say]);

  const chatApps: Array<{
    key: "whatsapp" | "instagram" | "telegram" | "twitter" | "facebook";
    label: string;
    icon: React.ReactNode;
  }> = [
    { key: "whatsapp", label: "WhatsApp", icon: <MessageCircle size={18} /> },
    { key: "instagram", label: "Instagram", icon: <Instagram size={18} /> },
    { key: "telegram", label: "Telegram", icon: <Send size={18} /> },
    { key: "twitter", label: "X", icon: <Twitter size={18} /> },
    { key: "facebook", label: "Facebook", icon: <Facebook size={18} /> },
  ];

  const cardProps = {
    qrDataUrl,
    url,
    title: headline,
    note,
    recipientName,
    senderName,
    accent,
    logoSrc: LOGO_SRC,
  };

  return (
    <AnimatePresence>
      {open && url ? (
        <motion.div
          key="share-sheet"
          className="fixed inset-0 z-[400] flex items-end justify-center md:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="Share this page"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-[3px]"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            initial={{ y: 54, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 54, opacity: 0 }}
            transition={{ type: "spring", stiffness: 340, damping: 32 }}
            className="relative w-full max-h-[92dvh] overflow-y-auto md:max-w-[440px] md:rounded-[28px]"
            style={{
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              background: `linear-gradient(170deg, ${tint(accent, 0.9)} 0%, #FFFFFF 42%)`,
              boxShadow: `0 -14px 44px ${alpha(deep, 0.28)}`,
              paddingBottom: "calc(18px + env(safe-area-inset-bottom, 0px))",
            }}
          >
            <div style={{ padding: "12px 18px 0" }}>
              <div
                className="mx-auto md:hidden"
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 999,
                  background: alpha(deep, 0.22),
                  marginBottom: 12,
                }}
                aria-hidden="true"
              />

              {/* ── Header. The logo is pinned top-right on every share
                  surface, here and on the printed card, so the two read as
                  the same object. ── */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 19,
                      lineHeight: "24px",
                      fontWeight: 700,
                      letterSpacing: "-0.01em",
                      color: deep,
                    }}
                  >
                    Share your page
                  </h3>
                  <p
                    style={{
                      margin: "3px 0 0",
                      fontSize: 12.5,
                      lineHeight: "17px",
                      color: alpha(deep, 0.7),
                    }}
                  >
                    A link, a code, your own photo, or a card to print.
                  </p>
                </div>

                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    flex: "none",
                    padding: "5px 11px 5px 5px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.9)",
                    border: `1px solid ${alpha(accent, 0.3)}`,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={LOGO_SRC}
                    alt="SubhSandesh"
                    width={24}
                    height={24}
                    style={{ borderRadius: 6, display: "block", objectFit: "cover" }}
                  />
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: "0.01em",
                      color: deep,
                      whiteSpace: "nowrap",
                    }}
                  >
                    SubhSandesh
                  </span>
                </span>
              </div>

              {/* ── Tabs ── */}
              <div
                role="tablist"
                aria-label="How to share"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 4,
                  marginTop: 14,
                  padding: 4,
                  borderRadius: 14,
                  background: alpha(accent, 0.1),
                }}
              >
                {TABS.map((t) => {
                  const active = tab === t.key;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      aria-label={t.title}
                      title={t.title}
                      onClick={() => setTab(t.key)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 5,
                        height: 38,
                        borderRadius: 11,
                        border: "none",
                        cursor: "pointer",
                        fontSize: 12.5,
                        fontWeight: 600,
                        letterSpacing: "0.01em",
                        background: active ? accent : "transparent",
                        color: active ? ink : alpha(deep, 0.78),
                        transition: "background 140ms ease, color 140ms ease",
                      }}
                    >
                      {t.icon}
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ padding: "14px 18px 0" }}>
              {tab === "link" ? (
                <div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: 9,
                    }}
                  >
                    {chatApps.map((app) => (
                      <button
                        key={app.key}
                        type="button"
                        onClick={() => openChatApp(app.key)}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          height: 68,
                          borderRadius: 16,
                          cursor: "pointer",
                          background: "#FFFFFF",
                          border: `1px solid ${alpha(accent, 0.26)}`,
                          color: deep,
                          fontSize: 11.5,
                          fontWeight: 600,
                        }}
                      >
                        {app.icon}
                        {app.label}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={nativeShare}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        height: 68,
                        borderRadius: 16,
                        cursor: "pointer",
                        background: alpha(accent, 0.12),
                        border: `1px solid ${alpha(accent, 0.32)}`,
                        color: deep,
                        fontSize: 11.5,
                        fontWeight: 600,
                      }}
                    >
                      <Share2 size={18} />
                      More
                    </button>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginTop: 12,
                      padding: "9px 9px 9px 13px",
                      borderRadius: 14,
                      background: "#FFFFFF",
                      border: `1px solid ${alpha(accent, 0.26)}`,
                    }}
                  >
                    <span
                      style={{
                        flex: 1,
                        minWidth: 0,
                        fontSize: 12.5,
                        color: alpha(deep, 0.8),
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {url}
                    </span>
                    <button
                      type="button"
                      onClick={copyLink}
                      style={{
                        flex: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        height: 34,
                        padding: "0 13px",
                        borderRadius: 10,
                        border: "none",
                        cursor: "pointer",
                        background: accent,
                        color: ink,
                        fontSize: 12.5,
                        fontWeight: 600,
                      }}
                    >
                      {copied ? <Check size={13} /> : <Copy size={13} />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              ) : null}

              {tab === "qr" ? (
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      display: "inline-block",
                      padding: 14,
                      borderRadius: 24,
                      background: "#FFFFFF",
                      border: `1px solid ${alpha(accent, 0.26)}`,
                      boxShadow: `0 10px 26px ${alpha(deep, 0.12)}`,
                    }}
                  >
                    <QrBlock
                      value={url}
                      size={218}
                      dark={codeInk}
                      logoSrc={LOGO_SRC}
                      radius={12}
                    />
                  </div>

                  <p
                    style={{
                      margin: "12px auto 0",
                      maxWidth: 300,
                      fontSize: 12.5,
                      lineHeight: "18px",
                      color: alpha(deep, 0.78),
                    }}
                  >
                    Hold this up and let them point a camera at it — or send the code itself as a
                    picture.
                  </p>

                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button
                      type="button"
                      onClick={shareQrImage}
                      style={{
                        flex: 1,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 7,
                        height: 44,
                        borderRadius: 13,
                        border: "none",
                        cursor: "pointer",
                        background: accent,
                        color: ink,
                        fontSize: 13.5,
                        fontWeight: 600,
                      }}
                    >
                      <Share2 size={15} />
                      Share QR
                    </button>
                    <button
                      type="button"
                      onClick={downloadQr}
                      style={{
                        flex: 1,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 7,
                        height: 44,
                        borderRadius: 13,
                        cursor: "pointer",
                        background: "#FFFFFF",
                        border: `1px solid ${alpha(accent, 0.32)}`,
                        color: deep,
                        fontSize: 13.5,
                        fontWeight: 600,
                      }}
                    >
                      <Download size={15} />
                      Save PNG
                    </button>
                  </div>
                </div>
              ) : null}

              {tab === "photo" ? (
                <PhotoQrPanel
                  url={url}
                  accent={accent}
                  stem={stem}
                  say={say}
                  title={cardTitle || title}
                  recipientName={recipientName}
                  senderName={senderName}
                />
              ) : null}

              {tab === "print" ? (
                <div style={{ textAlign: "center" }}>
                  {/* The preview and the captured node are the same component
                      with the same props — see the note in PrintableCard. */}
                  <div
                    style={{
                      width: Math.round(CARD_W * PREVIEW_SCALE),
                      height: Math.round(CARD_H * PREVIEW_SCALE),
                      margin: "0 auto",
                      borderRadius: 16,
                      overflow: "hidden",
                      boxShadow: `0 12px 30px ${alpha(deep, 0.2)}`,
                    }}
                  >
                    <div
                      style={{
                        transform: `scale(${PREVIEW_SCALE})`,
                        transformOrigin: "top left",
                        width: CARD_W,
                        height: CARD_H,
                      }}
                    >
                      <PrintableCard {...cardProps} />
                    </div>
                  </div>

                  <p
                    style={{
                      margin: "12px auto 0",
                      maxWidth: 320,
                      fontSize: 12.5,
                      lineHeight: "18px",
                      color: alpha(deep, 0.78),
                    }}
                  >
                    Print it at A5 or bigger, cut along the dashed line, and leave it somewhere
                    they&apos;ll find it. The address is printed under the code in case the scan
                    ever fails.
                  </p>

                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button
                      type="button"
                      onClick={downloadCard}
                      disabled={busy}
                      style={{
                        flex: 1,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 7,
                        height: 44,
                        borderRadius: 13,
                        border: "none",
                        cursor: busy ? "default" : "pointer",
                        opacity: busy ? 0.65 : 1,
                        background: accent,
                        color: ink,
                        fontSize: 13.5,
                        fontWeight: 600,
                      }}
                    >
                      <Download size={15} />
                      {busy ? "Saving…" : "Download card"}
                    </button>
                    <button
                      type="button"
                      onClick={downloadQr}
                      style={{
                        flex: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 7,
                        height: 44,
                        padding: "0 15px",
                        borderRadius: 13,
                        cursor: "pointer",
                        background: "#FFFFFF",
                        border: `1px solid ${alpha(accent, 0.32)}`,
                        color: deep,
                        fontSize: 13.5,
                        fontWeight: 600,
                      }}
                    >
                      <QrCode size={15} />
                      QR only
                    </button>
                  </div>
                </div>
              ) : null}

              <button
                type="button"
                onClick={onClose}
                style={{
                  width: "100%",
                  height: 42,
                  marginTop: 12,
                  borderRadius: 13,
                  cursor: "pointer",
                  background: alpha(deep, 0.06),
                  border: `1px solid ${alpha(accent, 0.22)}`,
                  color: alpha(deep, 0.85),
                  fontSize: 13.5,
                  fontWeight: 600,
                }}
              >
                Close
              </button>
            </div>

            {toast ? (
              <div
                role="status"
                aria-live="polite"
                style={{
                  position: "sticky",
                  bottom: 8,
                  margin: "10px 18px 0",
                  padding: "9px 14px",
                  borderRadius: 12,
                  background: deep,
                  color: "#FFFFFF",
                  fontSize: 12.5,
                  lineHeight: 1.4,
                  textAlign: "center",
                }}
              >
                {toast}
              </div>
            ) : null}
          </motion.div>

          {/* The capture node: true size, offscreen, never scaled. Trap 2 in
              lib/exportPng.ts is about exactly this. */}
          <div style={{ position: "fixed", left: -10000, top: 0, pointerEvents: "none" }}>
            <PrintableCard ref={cardRef} {...cardProps} />
          </div>

          <style>{`
            .ss-spin { animation: ssSpin 900ms linear infinite; }
            @keyframes ssSpin { to { transform: rotate(360deg); } }
            @media (prefers-reduced-motion: reduce) {
              /* Still moving, just not spinning — a frozen spinner reads as a
                 hang, which is worse than the motion it is avoiding. */
              .ss-spin { animation: ssPulse 1.4s ease-in-out infinite; }
              @keyframes ssPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
            }
          `}</style>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default ShareSheet;
