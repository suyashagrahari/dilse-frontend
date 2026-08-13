"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Loader2 } from "lucide-react";
import { RAKHI_ASSETS } from "../assets";
import { RB, CARD_BORDER, CARD_SHADOW, BRAND_GRADIENT } from "./theme";
import type { RakhiData, Memory } from "./types";

/**
 * Deterministic tilt per card. `Math.random()` would re-roll on every render and
 * the polaroids would twitch each time React re-paints the list.
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
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      style={{
        transform: `rotate(${tilt(i)}deg)`,
        background: RB.surface,
        border: CARD_BORDER,
        boxShadow: CARD_SHADOW,
        borderRadius: 6,
        padding: "11px 11px 0",
        margin: 0,
        width: "100%",
        maxWidth: 268,
        position: "relative",
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
        <Image
          src={m.imageUrl}
          alt={m.caption || "A memory"}
          fill
          sizes="268px"
          onError={() => setBroken(true)}
          style={{ objectFit: "cover" }}
        />
      </div>

      {m.year && (
        <span
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            padding: "2px 7px",
            borderRadius: 4,
            background: "rgba(255,253,248,0.9)",
            fontSize: 10.5,
            color: RB.muted,
            fontWeight: 600,
          }}
        >
          {m.year}
        </span>
      )}

      <figcaption
        className="rb-hand"
        style={{
          fontSize: 17,
          lineHeight: 1.35,
          color: RB.ink,
          textAlign: "center",
          padding: "10px 4px 14px",
          minHeight: 44,
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
  saving,
}: {
  data: RakhiData;
  onSaveCard: () => void;
  saving: boolean;
}) {
  const hasMemories = data.memories.length > 0;
  const hasLedger = data.ledger.length > 0;

  return (
    <div
      className="rb-root"
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "34px 22px 40px",
        gap: 22,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h2
          className="rb-display"
          style={{ fontSize: 26, fontWeight: 700, color: RB.red, margin: 0 }}
        >
          {hasMemories ? "Us, over the years" : "Happy Raksha Bandhan"}
        </h2>
        {data.vachan && (
          <p
            className="rb-hand"
            style={{ fontSize: 17, color: RB.ink, marginTop: 10, maxWidth: 300 }}
          >
            “{data.vachan}”
          </p>
        )}
      </div>

      {hasMemories && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 26,
            width: "100%",
          }}
        >
          {data.memories.map((m, i) => (
            <Polaroid key={`${m.imageUrl}-${i}`} m={m} i={i} />
          ))}
        </div>
      )}

      {/* The running joke ledger. Dot leaders, because it should look like a
          bill she has been keeping for twenty years. */}
      {hasLedger && (
        <div
          style={{
            width: "100%",
            maxWidth: 300,
            padding: "18px 18px 16px",
            borderRadius: 16,
            background: RB.surface,
            border: CARD_BORDER,
            boxShadow: CARD_SHADOW,
          }}
        >
          <p
            className="rb-display"
            style={{ fontSize: 14, fontWeight: 700, color: RB.brass, margin: "0 0 12px", letterSpacing: 0.4 }}
          >
            THE LEDGER
          </p>
          {data.ledger.map((row, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 6,
                fontSize: 13.5,
                color: RB.ink,
                padding: "5px 0",
              }}
            >
              <span style={{ flexShrink: 0 }}>{row.label}</span>
              <span
                aria-hidden
                style={{
                  flex: 1,
                  minWidth: 12,
                  borderBottom: `1.5px dotted ${RB.hairline}`,
                  transform: "translateY(-3px)",
                }}
              />
              <span style={{ flexShrink: 0, fontWeight: 700, color: RB.red }}>{row.value}</span>
            </div>
          ))}
        </div>
      )}

      {!hasMemories && !hasLedger && (
        <Image
          src={RAKHI_ASSETS.bhaiBest}
          alt="Mera bhai sabse best"
          width={200}
          height={200}
          unoptimized
          style={{ width: 190, height: "auto", borderRadius: 16 }}
        />
      )}

      <button
        onClick={onSaveCard}
        disabled={saving}
        className="rb-display"
        style={{
          marginTop: 6,
          minHeight: 52,
          width: "100%",
          maxWidth: 320,
          padding: "15px 26px",
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
          gap: 8,
        }}
      >
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
        {saving ? "Making it…" : "Save the card"}
      </button>

      <p style={{ fontSize: 11.5, color: RB.muted, textAlign: "center", margin: 0 }}>
        subhsandesh.in
      </p>
    </div>
  );
}
