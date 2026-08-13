"use client";

import Image from "next/image";
import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { RAKHI_ASSETS, PRELOAD } from "../assets";
import { RB, BRAND_GRADIENT, CARD_BORDER, CARD_SHADOW } from "./theme";
import { muhuratState, distanceLine, type RakhiData } from "./types";
import { useNow } from "./useNow";

/**
 * Screen 1. Her opening, his name, and the countdown.
 *
 * The countdown is the one thing here that could be mistaken for a gate, so:
 * it renders a line of text and nothing else. There is no branch anywhere in
 * this file where a muhurat phase changes what the button does. Someone opening
 * this in November taps the same button as someone opening it at 6 AM on the
 * 28th of August.
 */
export default function CoverScreen({
  data,
  onBegin,
}: {
  data: RakhiData;
  onBegin: () => void;
}) {
  const now = useNow();
  const muhurat = useMemo(() => (now === 0 ? null : muhuratState(now)), [now]);
  const distance = distanceLine(data.distanceKm);

  // Pull the ritual GIFs while he is reading this. tilak.gif is 2.4 MB and
  // bandhan.gif 1.5 MB — without this they arrive visibly late on mobile data,
  // and the first frame of the ritual would be an empty box.
  useEffect(() => {
    const imgs = PRELOAD.map((src) => {
      const i = new window.Image();
      i.src = src;
      return i;
    });
    return () => {
      imgs.forEach((i) => {
        i.src = "";
      });
    };
  }, []);

  const muhuratColor =
    muhurat?.phase === "during" ? RB.green : muhurat?.phase === "after" ? RB.muted : RB.brass;

  return (
    <div
      className="rb-root"
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
        padding: "32px 22px 40px",
        textAlign: "center",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: "100%", maxWidth: 300 }}
      >
        <Image
          src={RAKHI_ASSETS.cover}
          alt="Happy Raksha Bandhan"
          width={600}
          height={600}
          priority
          sizes="(max-width: 420px) 80vw, 300px"
          style={{ width: "100%", height: "auto", borderRadius: 18 }}
        />
      </motion.div>

      <div>
        <motion.h1
          className="rb-display rb-name"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          style={{
            fontSize: "clamp(26px, 8vw, 34px)",
            lineHeight: 1.15,
            fontWeight: 700,
            color: RB.red,
            margin: 0,
          }}
        >
          Happy Raksha Bandhan,
          <br />
          {data.brotherName}
        </motion.h1>

        <motion.p
          className="rb-deva"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          style={{ fontSize: 15, color: RB.brass, marginTop: 8 }}
        >
          रक्षा बंधन की शुभकामनाएं
        </motion.p>
      </div>

      {/* Her lines, one at a time. */}
      <div style={{ display: "flex", flexDirection: "column", gap: 7, maxWidth: 330 }}>
        {data.greeting.map((line, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 + i * 0.7, duration: 0.55 }}
            style={{ fontSize: 15.5, lineHeight: 1.55, color: RB.ink, margin: 0 }}
          >
            {line}
          </motion.p>
        ))}
      </div>

      {distance && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75 + data.greeting.length * 0.7, duration: 0.6 }}
          style={{ fontSize: 13, color: RB.muted, fontStyle: "italic", margin: 0 }}
        >
          {distance}
        </motion.p>
      )}

      {/* Information, never a gate. Reserves its height so the button below it
          does not jump when the clock resolves on the client. */}
      <div style={{ minHeight: 42, display: "grid", placeItems: "center", width: "100%" }}>
        {muhurat && (
          <div
            className="rb-rise"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "8px 14px",
              borderRadius: 999,
              border: `1px solid ${muhuratColor}`,
              background: "rgba(255,255,255,0.55)",
              fontSize: 12.5,
              color: muhuratColor,
              fontWeight: 600,
            }}
          >
            <span
              aria-hidden
              className={muhurat.phase === "during" ? "rb-flame" : undefined}
              style={{ fontSize: 13 }}
            >
              🪔
            </span>
            {muhurat.label}
          </div>
        )}
      </div>

      <button
        onClick={onBegin}
        className="rb-display"
        style={{
          marginTop: 2,
          padding: "15px 38px",
          minHeight: 52,
          borderRadius: 999,
          background: BRAND_GRADIENT,
          color: "#fffdf8",
          border: CARD_BORDER,
          boxShadow: CARD_SHADOW,
          fontSize: 17,
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Tie the Rakhi
      </button>

      {data.sisterName && (
        <p style={{ fontSize: 12.5, color: RB.muted, margin: 0 }}>
          from {data.sisterName}
          {data.city ? `, ${data.city}` : ""}
        </p>
      )}
    </div>
  );
}
