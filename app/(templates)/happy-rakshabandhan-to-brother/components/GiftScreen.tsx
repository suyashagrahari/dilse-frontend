"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { RAKHI_ASSETS } from "../assets";
import { RB, BRAND_GRADIENT, CARD_BORDER, CARD_SHADOW } from "./theme";
import type { RakhiData } from "./types";

// ─── The gift bit ────────────────────────────────────────────────────────────
//
// Three beats: she demands the gift, he caves, she shows him where to send it.
// This is the oldest joke in the festival and it is why the template is funny
// rather than sentimental.
//
// ── WHAT IS NOT IN THIS FILE, ON PURPOSE ────────────────────────────────────
//
// No "did you send it?" confirmation. No verification. No reminder. No state
// that records whether he paid, and no copy anywhere below that references NOT
// paying. Read every string in this file — none of them push.
//
// The reason is not only that nagging and confirm-shaming are two of the
// thirteen dark patterns the CCPA enumerates. It is that the joke only works
// while it is a joke. The moment the page asks him to confirm, "gift kidhar
// hai" stops being a sister teasing her brother and becomes a payment terminal
// with a cartoon on it, and he can feel the difference instantly.
//
// The last beat is `"whenever you like. no rush."` and then the page moves on.
// If you are adding a follow-up here, you are removing the thing that made it
// worth sending.

type Beat = "demand" | "caving" | "reveal";

export default function GiftScreen({
  data,
  onContinue,
}: {
  data: RakhiData;
  onContinue: () => void;
}) {
  const [beat, setBeat] = useState<Beat>("demand");
  const [copied, setCopied] = useState(false);

  const sister = data.sisterName || "Behen";
  const hasUpi = data.shagun.upiId.trim().length > 0;
  const hasQr = data.shagun.qrImageUrl.trim().length > 0;
  const hasShagun = hasUpi || hasQr;

  const upiLink = hasUpi
    ? `upi://pay?pa=${encodeURIComponent(data.shagun.upiId.trim())}&pn=${encodeURIComponent(
        sister
      )}&cu=INR`
    : null;

  const copyUpi = async () => {
    try {
      await navigator.clipboard.writeText(data.shagun.upiId.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked outright. The ID is on screen and selectable,
      // so this degrades to "read it and type it" rather than to a dead end.
    }
  };

  const BEATS: Record<Beat, { gif: string; alt: string; line: string; sub?: string; cta: string }> = {
    demand: {
      gif: RAKHI_ASSETS.giftDemand,
      alt: `${sister} asking where the gift is`,
      line: "GIFT KIDHAR HAI?! 👀",
      sub: "Rakhi bandh gayi. Ab kaam ki baat.",
      cta: "Arre haan haan, deta hoon 😭",
    },
    caving: {
      gif: RAKHI_ASSETS.giftThinking,
      alt: `${sister} waiting`,
      line: "Sahi jawab 😌",
      sub: "Wahi toh. Har saal yahi drama.",
      cta: hasShagun ? "Theek hai, bata kahan bhejun" : "Chal, aage bol",
    },
    reveal: {
      gif: RAKHI_ASSETS.giftReveal,
      alt: "Happy Raksha Bandhan",
      line: hasShagun ? "Yeh raha 🎁" : "Rehne de 😄",
      sub: hasShagun ? undefined : `${sister} bolti hai — milke le legi.`,
      cta: "Aage badho",
    },
  };

  const b = BEATS[beat];

  const next = () => {
    if (beat === "demand") setBeat("caving");
    else if (beat === "caving") setBeat("reveal");
    else onContinue();
  };

  return (
    <div
      className="rb-root"
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "30px 22px 34px",
        textAlign: "center",
        gap: 16,
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={beat}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
            width: "100%",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 250,
              aspectRatio: "1 / 1",
              borderRadius: 20,
              overflow: "hidden",
              border: CARD_BORDER,
              boxShadow: CARD_SHADOW,
              background: RB.surface,
              position: "relative",
            }}
          >
            {/* unoptimized — the optimiser would flatten these to one frame. */}
            <Image src={b.gif} alt={b.alt} fill unoptimized sizes="250px" style={{ objectFit: "cover" }} />
          </div>

          <h2
            className="rb-display"
            style={{ fontSize: 25, fontWeight: 700, color: RB.red, margin: 0 }}
          >
            {b.line}
          </h2>

          {b.sub && (
            <p style={{ fontSize: 14.5, color: RB.muted, margin: 0, maxWidth: 300 }}>{b.sub}</p>
          )}

          {/* ── Shagun. Appears only at the last beat, only if she added it. ──
              It is a card that sits there. It does not ask for anything. */}
          {beat === "reveal" && hasShagun && (
            <div
              className="rb-rise"
              style={{
                width: "100%",
                maxWidth: 300,
                padding: "16px 16px 14px",
                borderRadius: 18,
                background: RB.surface,
                border: CARD_BORDER,
                boxShadow: CARD_SHADOW,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 11,
              }}
            >
              <p
                className="rb-display"
                style={{ fontSize: 15, fontWeight: 700, color: RB.ink, margin: 0 }}
              >
                Shagun
              </p>

              {data.shagun.note && (
                <p style={{ fontSize: 13, color: RB.muted, margin: 0 }}>{data.shagun.note}</p>
              )}

              {hasQr && (
                <div
                  style={{
                    width: 168,
                    height: 168,
                    borderRadius: 12,
                    overflow: "hidden",
                    background: "#fff",
                    border: `1px solid ${RB.hairline}`,
                    position: "relative",
                  }}
                >
                  <Image
                    src={data.shagun.qrImageUrl}
                    alt={`UPI QR code for ${sister}`}
                    fill
                    sizes="168px"
                    style={{ objectFit: "contain" }}
                  />
                </div>
              )}

              {hasUpi && (
                <button
                  onClick={copyUpi}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    minHeight: 44,
                    padding: "10px 14px",
                    borderRadius: 10,
                    background: RB.paperDeep,
                    border: `1px solid ${RB.hairline}`,
                    color: RB.ink,
                    fontSize: 13.5,
                    fontFamily: "ui-monospace, SFMono-Regular, monospace",
                    cursor: "pointer",
                    maxWidth: "100%",
                    overflowWrap: "anywhere",
                  }}
                >
                  {copied ? <Check size={14} color={RB.green} /> : <Copy size={14} />}
                  {data.shagun.upiId}
                </button>
              )}

              {upiLink && (
                <a
                  href={upiLink}
                  className="rb-display"
                  style={{
                    display: "grid",
                    placeItems: "center",
                    width: "100%",
                    minHeight: 46,
                    borderRadius: 999,
                    background: BRAND_GRADIENT,
                    color: "#fffdf8",
                    border: CARD_BORDER,
                    fontSize: 15,
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  Pay via UPI
                </a>
              )}

              {/* The last word on the subject. */}
              <p style={{ fontSize: 11.5, color: RB.muted, margin: 0 }}>
                whenever you like. no rush.
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <button
        onClick={next}
        className="rb-display"
        style={{
          marginTop: "auto",
          width: "100%",
          maxWidth: 320,
          minHeight: 52,
          padding: "15px 30px",
          borderRadius: 999,
          background: beat === "reveal" ? RB.surface : BRAND_GRADIENT,
          color: beat === "reveal" ? RB.ink : "#fffdf8",
          border: CARD_BORDER,
          boxShadow: CARD_SHADOW,
          fontSize: 16,
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        {b.cta}
      </button>
    </div>
  );
}
