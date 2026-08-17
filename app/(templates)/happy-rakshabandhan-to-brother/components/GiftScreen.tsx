"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { RAKHI_ASSETS, type Asset } from "../assets";
import { RB, BRAND_GRADIENT, CARD_BORDER, CARD_SHADOW } from "./theme";
import type { RakhiData } from "./types";
import { AssetImage, fitAsset } from "./AssetImage";
import { Rangoli, PetalBurst } from "./Ornaments";
import Stage, { BackLink, useIsDesktop } from "./Stage";
import UserImage from "./UserImage";
import type { Entry } from "./RakhiTemplate";

// ─── The gift bit ────────────────────────────────────────────────────────────
//
// Three beats: she demands the gift, he caves, she shows him where to send it.
// The oldest joke in the festival, and the reason this template is funny rather
// than only sentimental — so it is staged like a comic strip, with speech
// bubbles and a bounce, not like a checkout step.
//
// ── THE CROP BUG LIVED HERE ─────────────────────────────────────────────────
//
// `gift-demand.gif` is 200×142 — the widest asset in the set at ratio 1.408.
// The first build rendered it in a 1:1 box with `object-fit: cover`, which
// threw away 29% of its height: the character was cut off at the forehead. All
// three beats now size from the asset's own ratio via `fitAsset`, so the frame
// fits the artwork instead of the artwork being cut to fit the frame.
//
// ── WHAT IS NOT IN THIS FILE, ON PURPOSE ────────────────────────────────────
//
// No "did you send it?" confirmation. No verification. No reminder. No state
// recording whether he paid, and no copy anywhere below referencing NOT paying.
// Read every string — none of them push.
//
// Nagging and confirm-shaming are two of the thirteen dark patterns the CCPA
// enumerates, but the stronger reason is craft: the joke only works while it is
// a joke. The moment the page asks him to confirm, "gift kidhar hai" stops being
// a sister teasing her brother and becomes a payment terminal with a cartoon on
// it, and he can feel the difference instantly.
//
// The last word is "whenever you like. no rush." and then the page moves on.

type Beat = "demand" | "caving" | "reveal";

interface BeatSpec {
  asset: Asset;
  alt: string;
  line: string;
  sub?: string;
  cta: string;
  /** Whose bubble it is — hers points left, his points right. */
  from: "her" | "him";
}

function Bubble({
  children,
  from,
  accent,
}: {
  children: React.ReactNode;
  from: "her" | "him";
  accent: string;
}) {
  const her = from === "her";
  return (
    <div
      className="rb-bloom"
      style={{
        position: "relative",
        maxWidth: 300,
        padding: "12px 17px",
        borderRadius: 18,
        background: her ? RB.surface : accent,
        color: her ? RB.ink : "#fffdf8",
        border: CARD_BORDER,
        boxShadow: CARD_SHADOW,
        alignSelf: her ? "flex-start" : "flex-end",
        textAlign: "left",
      }}
    >
      {children}
      {/* the tail */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          bottom: -9,
          [her ? "left" : "right"]: 24,
          width: 15,
          height: 15,
          background: her ? RB.surface : accent,
          borderRight: CARD_BORDER,
          borderBottom: CARD_BORDER,
          transform: "rotate(45deg)",
        }}
      />
    </div>
  );
}

export default function GiftScreen({
  data,
  entry = "first",
  onContinue,
  onBack,
}: {
  data: RakhiData;
  /** "last" when arriving backwards from the promise — see Entry in RakhiTemplate. */
  entry?: Entry;
  onContinue: () => void;
  onBack: () => void;
}) {
  // Backwards from the promise lands on the reveal — the shagun she left him —
  // not on the demand joke he already sat through.
  const [beat, setBeat] = useState<Beat>(entry === "last" ? "reveal" : "demand");
  const [copied, setCopied] = useState(false);
  const reduce = useReducedMotion();
  const isDesktop = useIsDesktop();

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
      // so this degrades to "read it and type it", not to a dead end.
    }
  };

  const BEATS: Record<Beat, BeatSpec> = {
    demand: {
      asset: RAKHI_ASSETS.giftDemand,
      alt: `${sister} asking where the gift is`,
      line: "GIFT KIDHAR HAI?! 👀",
      sub: "Rakhi bandh gayi. Ab kaam ki baat.",
      cta: "Arre haan haan, deta hoon 😭",
      from: "her",
    },
    caving: {
      asset: RAKHI_ASSETS.giftThinking,
      alt: `${sister} waiting`,
      line: "Sahi jawab 😌",
      sub: "Wahi toh. Har saal yehi drama.",
      cta: hasShagun ? "Theek hai, bata kahan bhejun" : "Chal, aage bol",
      from: "her",
    },
    reveal: {
      asset: RAKHI_ASSETS.giftReveal,
      alt: "Happy Raksha Bandhan",
      line: hasShagun ? "Yeh raha 🎁" : "Rehne de 😄",
      sub: hasShagun ? undefined : `${sister} bolti hai — milke le legi.`,
      cta: "Aage badho →",
      from: "her",
    },
  };

  const b = BEATS[beat];
  const art = fitAsset(b.asset, isDesktop ? 400 : 250, isDesktop ? 368 : 230);

  const next = () => {
    if (beat === "demand") setBeat("caving");
    else if (beat === "caving") setBeat("reveal");
    else onContinue();
  };

  /** Rewinds the three beats, then hands back to the ritual. */
  const back = () => {
    if (beat === "reveal") setBeat("caving");
    else if (beat === "caving") setBeat("demand");
    else onBack();
  };

  return (
    <Stage
      behind={
        <div
          style={{
            position: "absolute",
            top: "16%",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 0,
          }}
        >
          <Rangoli size={isDesktop ? 560 : 320} opacity={0.05} />
        </div>
      }
      art={
        <AnimatePresence mode="wait">
          {/* Artwork at its true proportions — never cropped.
              The sway is framer-motion, so the CSS prefers-reduced-motion block
              cannot reach it; `useReducedMotion` is what switches it off. Any
              JS-driven loop added here needs the same guard. */}
          <motion.div
            key={beat}
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.34, 1.4, 0.64, 1] }}
            style={{ position: "relative" }}
          >
            <motion.div
              animate={reduce ? undefined : { rotate: [-1.2, 1.2, -1.2] }}
              transition={reduce ? undefined : { duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "relative",
                padding: 10,
                borderRadius: 22,
                background: RB.surface,
                border: CARD_BORDER,
                boxShadow: CARD_SHADOW,
              }}
            >
              <AssetImage asset={b.asset} alt={b.alt} maxWidth={art.width} maxHeight={art.height} />
              {beat === "reveal" && <PetalBurst count={14} />}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      }
      body={
        <>
        <AnimatePresence mode="wait">
        <motion.div
          key={beat}
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.98 }}
          transition={{ duration: 0.35, ease: [0.34, 1.4, 0.64, 1] }}
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "inherit",
            gap: 15,
            width: "100%",
          }}
        >
          <div style={{ width: "100%", maxWidth: 340, display: "flex", flexDirection: "column", gap: 9 }}>
            <Bubble from={b.from} accent={RB.red}>
              <p className="rb-display" style={{ fontSize: 19, fontWeight: 700, margin: 0, lineHeight: 1.25 }}>
                {b.line}
              </p>
              {b.sub && (
                <p style={{ fontSize: 13.5, margin: "5px 0 0", color: RB.muted, lineHeight: 1.45 }}>
                  {b.sub}
                </p>
              )}
            </Bubble>
          </div>

          {/* ── Shagun. Last beat only, only if she added it. It sits there.
                It does not ask for anything. ── */}
          {beat === "reveal" && hasShagun && (
            <div
              className="rb-rise"
              style={{
                width: "100%",
                maxWidth: 300,
                padding: "17px 17px 14px",
                borderRadius: 19,
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
                style={{ fontSize: 15.5, fontWeight: 700, color: RB.brass, margin: 0, letterSpacing: 1.4 }}
              >
                SHAGUN
              </p>

              {data.shagun.note && (
                <p style={{ fontSize: 13, color: RB.muted, margin: 0, textAlign: "center" }}>
                  {data.shagun.note}
                </p>
              )}

              {hasQr && (
                <div
                  style={{
                    width: 172,
                    height: 172,
                    borderRadius: 13,
                    overflow: "hidden",
                    background: "#fff",
                    border: `2px solid ${RB.brassSoft}`,
                    padding: 7,
                    position: "relative",
                  }}
                >
                  <UserImage
                    src={data.shagun.qrImageUrl}
                    alt={`UPI QR code for ${sister}`}
                    sizes="172px"
                    style={{ objectFit: "contain", padding: 7 }}
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
                    minHeight: 48,
                    borderRadius: 999,
                    background: BRAND_GRADIENT,
                    color: "#fffdf8",
                    border: CARD_BORDER,
                    fontSize: 15.5,
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  Pay via UPI
                </a>
              )}

              {/* The last word on the subject. */}
              <p style={{ fontSize: 11.5, color: RB.muted, margin: 0 }}>whenever you like. no rush.</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <motion.button
        onClick={next}
        whileTap={{ scale: 0.97 }}
        className={`rb-display rb-cta ${beat === "reveal" ? "" : "rb-sheen"}`}
        style={{
          position: "relative",
          overflow: "hidden",
          marginTop: 4,
          zIndex: 1,
          width: "100%",
          maxWidth: 320,
          minHeight: 56,
          padding: "16px 28px",
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
      </motion.button>

      <BackLink onClick={back} />
        </>
      }
    />
  );
}
