"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Loader2, Instagram } from "lucide-react";
import { RAKHI_ASSETS } from "../assets";
import { RB, CARD_BORDER, CARD_SHADOW, BRAND_GRADIENT, charmGlyph } from "./theme";
import type { RakhiData, Memory } from "./types";
import { AssetImage, fitAsset } from "./AssetImage";
import { Rangoli, ThreadDivider, RakhiCharm } from "./Ornaments";
import Stage, { BackLink, useIsDesktop } from "./Stage";
import UserImage from "./UserImage";

/**
 * Deterministic tilt per card. `Math.random()` would re-roll on every render
 * and the polaroids would twitch each time React repaints the list.
 */
function tilt(i: number): number {
  const seq = [-2.6, 1.9, -1.4, 2.8, -3, 1.2, -2.1, 2.4];
  return seq[i % seq.length];
}

function Polaroid({ m, i }: { m: Memory; i: number }) {
  // A photo that 404s must not leave a broken-image glyph in the middle of
  // someone's memories — the whole card leaves instead.
  const [broken, setBroken] = useState(false);
  if (broken) return null;

  return (
    <motion.figure
      initial={{ opacity: 0, y: 26, rotate: 0 }}
      whileInView={{ opacity: 1, y: 0, rotate: tilt(i) }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileTap={{ scale: 1.03, rotate: 0, zIndex: 4 }}
      style={{
        background: RB.surface,
        border: CARD_BORDER,
        boxShadow: CARD_SHADOW,
        borderRadius: 7,
        padding: "12px 12px 0",
        margin: 0,
        width: "100%",
        maxWidth: 270,
        position: "relative",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "1 / 1",
          background: RB.paperDeep,
          overflow: "hidden",
        }}
      >
        <UserImage
          src={m.imageUrl}
          alt={m.caption || "A memory"}
          sizes="270px"
          onError={() => setBroken(true)}
          style={{ objectFit: "cover" }}
        />
      </div>

      {m.year && (
        <span
          style={{
            position: "absolute",
            top: 18,
            right: 18,
            padding: "3px 8px",
            borderRadius: 5,
            background: "rgba(255,253,248,0.92)",
            fontSize: 10.5,
            color: RB.muted,
            fontWeight: 700,
            letterSpacing: 0.5,
          }}
        >
          {m.year}
        </span>
      )}

      <figcaption
        className="rb-hand"
        style={{
          fontSize: 18,
          lineHeight: 1.35,
          color: RB.ink,
          textAlign: "center",
          padding: "11px 6px 15px",
          minHeight: 46,
        }}
      >
        {m.caption}
      </figcaption>
    </motion.figure>
  );
}

export default function MemoriesScreen({
  data,
  onSaveCard,
  onDownload,
  saving,
  onBack,
}: {
  data: RakhiData;
  onSaveCard: () => void;
  onDownload: () => void;
  saving: boolean;
  onBack: () => void;
}) {
  const hasMemories = data.memories.length > 0;
  const hasLedger = data.ledger.length > 0;
  const fallback = fitAsset(RAKHI_ASSETS.bhaiBest, 210);
  const isDesktop = useIsDesktop();

  return (
    <Stage
      className="rb-memories"
      behind={
        <>
          {/* Toran now comes from Stage — every screen gets one. */}
          <div
            style={{
              position: "absolute",
              top: "28%",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 0,
            }}
          >
            <Rangoli size={isDesktop ? 600 : 380} opacity={0.05} />
          </div>
        </>
      }
      head={
        <>
        {/* ── Completion ── */}
        <div style={{ textAlign: "inherit" }}>
          <div
            style={{
              display: "grid",
              placeItems: isDesktop ? "center start" : "center",
              marginBottom: 10,
            }}
          >
            <RakhiCharm
              size={62}
              colorA={data.rakhi.threadColorA}
              colorB={data.rakhi.threadColorB}
              bead={data.rakhi.beadColor}
              glyph={charmGlyph[data.rakhi.charm] ?? "ॐ"}
              spin
            />
          </div>
          <h2
            className="rb-display rb-name"
            style={{ fontSize: isDesktop ? 40 : 27, fontWeight: 700, color: RB.red, margin: 0 }}
          >
            {hasMemories ? "Us, over the years" : "Rakhi tied"}
          </h2>
          <p className="rb-deva" style={{ fontSize: 13.5, color: RB.brass, margin: "5px 0 0" }}>
            राखी बंध गई
          </p>
        </div>

        {data.vachan && (
          <div
            style={{
              width: "100%",
              maxWidth: 310,
              padding: "16px 18px",
              borderRadius: 17,
              background: RB.surface,
              border: CARD_BORDER,
              boxShadow: CARD_SHADOW,
              textAlign: "center",
              marginTop: 14,
            }}
          >
            <p style={{ fontSize: 11, color: RB.brass, margin: "0 0 6px", letterSpacing: 1.4, fontWeight: 700 }}>
              HIS PROMISE
            </p>
            <p className="rb-hand" style={{ fontSize: 19, color: RB.ink, margin: 0, lineHeight: 1.45 }}>
              “{data.vachan}”
            </p>
          </div>
        )}

        {/* Grid rather than relying on the inherited text-align — ThreadDivider
            renders a block-level <svg>, which text-align cannot move. */}
        <div
          style={{
            marginTop: 14,
            display: "grid",
            placeItems: isDesktop ? "center start" : "center",
          }}
        >
          {/* Matches the cards above and below it (305–310px). At 180 it read as
              a half-drawn rule floating in the middle of the column. */}
          <ThreadDivider
            colorA={data.rakhi.threadColorA}
            colorB={data.rakhi.threadColorB}
            width={300}
          />
        </div>
        </>
      }
      art={
        hasMemories ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 28,
              width: "100%",
            }}
          >
            {data.memories.map((m, i) => (
              <Polaroid key={`${m.imageUrl}-${i}`} m={m} i={i} />
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: 10,
              borderRadius: 18,
              background: RB.surface,
              border: CARD_BORDER,
              boxShadow: CARD_SHADOW,
            }}
          >
            <AssetImage
              asset={RAKHI_ASSETS.bhaiBest}
              alt="Mera bhai sabse best"
              maxWidth={fallback.width}
            />
          </div>
        )
      }
      body={
        <>
        {/* The running-joke ledger. Dot leaders, because it should look like a
            bill she has been keeping for twenty years. */}
        {hasLedger && (
          <div
            style={{
              width: "100%",
              maxWidth: 305,
              padding: "19px 19px 16px",
              borderRadius: 17,
              background: RB.surface,
              border: CARD_BORDER,
              boxShadow: CARD_SHADOW,
            }}
          >
            <p
              className="rb-display"
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: RB.brass,
                margin: "0 0 13px",
                letterSpacing: 1.8,
              }}
            >
              THE LEDGER
            </p>
            {data.ledger.map((row, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 6,
                  fontSize: 13.5,
                  color: RB.ink,
                  padding: "6px 0",
                }}
              >
                {/* The label is the ONLY part allowed to give way.
                 *
                 * Both label and value used to be `flex-shrink: 0`, so a long
                 * pair — "times you took the blame anyway" against "every time"
                 * — could not fit, refused to shrink, and pushed the value out
                 * through the right edge of the card. The value is the punchline
                 * and must never be clipped, so it stays rigid; the label wraps
                 * instead. `minWidth: 0` is required for that: a flex item's
                 * default `min-width: auto` refuses to shrink below its longest
                 * word, which is what defeats `flex-shrink` on its own. */}
                <span style={{ flexShrink: 1, minWidth: 0, overflowWrap: "anywhere" }}>
                  {row.label}
                </span>
                <span
                  aria-hidden
                  style={{
                    flex: "1 1 auto",
                    minWidth: 12,
                    borderBottom: `1.5px dotted ${RB.brassSoft}`,
                    transform: "translateY(-3px)",
                  }}
                />
                <span style={{ flexShrink: 0, fontWeight: 700, color: RB.red }}>{row.value}</span>
              </motion.div>
            ))}
          </div>
        )}

        {/* ── Share ── */}
        <div style={{ width: "100%", maxWidth: 340, display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
          <motion.button
            onClick={onSaveCard}
            whileTap={{ scale: 0.97 }}
            disabled={saving}
            className={`rb-display ${saving ? "" : "rb-sheen"}`}
            style={{
              position: "relative",
              overflow: "hidden",
              minHeight: 56,
              padding: "16px 26px",
              borderRadius: 999,
              background: BRAND_GRADIENT,
              color: "#fffdf8",
              border: CARD_BORDER,
              boxShadow: CARD_SHADOW,
              fontSize: 16,
              fontWeight: 700,
              cursor: saving ? "default" : "pointer",
              opacity: saving ? 0.6 : 1,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 9,
            }}
          >
            {saving ? <Loader2 size={17} className="animate-spin" /> : <Instagram size={17} />}
            {saving ? "Making the card…" : "Share to your story"}
          </motion.button>

          <button
            onClick={onDownload}
            disabled={saving}
            style={{
              minHeight: 46,
              padding: "12px 22px",
              borderRadius: 999,
              background: "transparent",
              border: `1px solid ${RB.hairline}`,
              color: RB.muted,
              fontSize: 13.5,
              cursor: saving ? "default" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
            }}
          >
            <Download size={14} /> Just download the PNG
          </button>
        </div>

        {/* ── No on-screen link block ────────────────────────────────────────
         *
         * There was a "PUT THIS ON THE STORY" card here with the URL and Link-
         * sticker instructions. Removed on request — it turned the last screen
         * into a how-to guide, on the one page that should end on the photos.
         *
         * The link still travels, in the three places that do not cost a card:
         * printed on the story card next to a scannable QR (StoryCard.tsx), sent
         * as `text` alongside the file to any share target that accepts it, and
         * copied to the clipboard when "Share to your story" is tapped — the
         * toast says so. Do not re-add a block here to solve a "people don't
         * know about the link" problem; put it in the toast.
         */}
        <BackLink onClick={onBack} label="Phir se dekho" />

        <p style={{ fontSize: 11.5, color: RB.muted, margin: 0, letterSpacing: 0.6 }}>
          subhsandesh.in
        </p>
        </>
      }
    />
  );
}
