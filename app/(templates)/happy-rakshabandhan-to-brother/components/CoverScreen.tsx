"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { RAKHI_ASSETS, PRELOAD } from "../assets";
import { RB, BRAND_GRADIENT, CARD_BORDER, CARD_SHADOW, charmGlyph } from "./theme";
import { muhuratState, distanceLine, type RakhiData } from "./types";
import { useNow } from "./useNow";
import { AssetImage, fitAsset } from "./AssetImage";
import { Rangoli, Diya, ThreadDivider, RakhiCharm, PetalBurst } from "./Ornaments";
import Stage, { useIsDesktop } from "./Stage";
import UserImage from "./UserImage";

/**
 * Screen 1.
 *
 * The countdown is the one element that could be mistaken for a gate, so it is
 * text and nothing else. There is no branch in this file where a muhurat phase
 * changes what the button does — someone opening this in November taps exactly
 * the same button as someone opening it at 6 AM on the 28th of August.
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
  const [petals, setPetals] = useState(true);
  const isDesktop = useIsDesktop();

  // The portrait is the whole left column on a laptop, so it stops being a
  // 210px badge and becomes the thing you look at first.
  const cover = fitAsset(RAKHI_ASSETS.cover, isDesktop ? 396 : 210);

  // Petals fall once on arrival, then the node is removed entirely.
  useEffect(() => {
    const t = setTimeout(() => setPetals(false), 3200);
    return () => clearTimeout(t);
  }, []);

  // Pull the ritual GIFs while he is reading. tilak.gif is 2.4 MB and
  // bandhan.gif 1.5 MB — without this the first ritual frame is an empty box.
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

  const line = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

  return (
    <Stage
      className="rb-cover"
      behind={
        <>
          {/* Toran now comes from Stage — every screen gets one. */}
          {petals && <PetalBurst count={16} />}
          <div
            style={{
              position: "absolute",
              top: "18%",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 0,
            }}
          >
            <Rangoli size={isDesktop ? 620 : 360} opacity={0.06} />
          </div>
        </>
      }
      art={
        /* ── The portrait, in a brass frame ──
         *
         * Her uploaded photograph when there is one, the illustration when there
         * is not. This used to always be the illustration, which meant the photo
         * she picked appeared for the first time on the story card at the very
         * end — the one screen her brother sees last.
         *
         * SQUARE, not a circle. A circular mask crops the corners off a
         * photograph nobody framed for it — on the demo shot it cut the thali
         * and the gift box out of the bottom, and a real family photo loses
         * whoever is standing at the edges. A framed square is also just how a
         * photograph is hung.
         *
         * The rounding is 22 rather than 0: a hard corner against a brass rule
         * reads as a placeholder box rather than a frame. */
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "relative",
            padding: 10,
            borderRadius: 30,
            background: `linear-gradient(145deg, ${RB.brassSoft} 0%, ${RB.brass} 42%, ${RB.marigold} 72%, ${RB.brassSoft} 100%)`,
            boxShadow: "0 16px 40px rgba(61,35,23,0.22)",
          }}
        >
          {/* hairline inset rule, the same double-rule move as OrnateCard */}
          <span
            aria-hidden
            style={{
              position: "absolute",
              inset: 4,
              borderRadius: 26,
              border: "1px solid rgba(255,253,248,0.55)",
              pointerEvents: "none",
              zIndex: 2,
            }}
          />
          <div
            style={{
              position: "relative",
              borderRadius: 22,
              overflow: "hidden",
              background: RB.surface,
              display: "grid",
              placeItems: "center",
              width: cover.width,
              height: cover.width,
            }}
          >
            {data.photoUrl ? (
              <UserImage
                src={data.photoUrl}
                alt={`${data.sisterName || "She"} and ${data.brotherName}`}
                priority
                sizes={`${cover.width}px`}
                style={{ objectFit: "cover" }}
              />
            ) : (
              <AssetImage
                asset={RAKHI_ASSETS.cover}
                alt="Happy Raksha Bandhan"
                maxWidth={cover.width}
                priority
                animated={false}
              />
            )}
          </div>

          {/* her rakhi, hung on the corner of the frame */}
          <div
            style={{
              position: "absolute",
              right: -14,
              bottom: -14,
              zIndex: 3,
              filter: "drop-shadow(0 4px 8px rgba(61,35,23,0.28))",
            }}
          >
            <RakhiCharm
              size={isDesktop ? 76 : 54}
              colorA={data.rakhi.threadColorA}
              colorB={data.rakhi.threadColorB}
              bead={data.rakhi.beadColor}
              glyph={charmGlyph[data.rakhi.charm] ?? "ॐ"}
              spin
            />
          </div>
        </motion.div>
      }
      body={
        <>
        {/* ── Titles ── */}
        <motion.p
          className="rb-deva"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          style={{ fontSize: 15, color: RB.brass, margin: 0, letterSpacing: 1.5 }}
        >
          रक्षा बंधन की शुभकामनाएं
        </motion.p>

        <motion.h1
          className="rb-display rb-name"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            // vw-based on a phone, where the column IS the viewport. On desktop
            // the text sits in a ~520px column inside a 1440px window, so the
            // same clamp would size the headline off the window width and blow
            // it out of its own column.
            fontSize: isDesktop ? 54 : "clamp(27px, 8.4vw, 36px)",
            lineHeight: 1.08,
            fontWeight: 700,
            color: RB.red,
            margin: 0,
            textShadow: "0 1px 0 rgba(255,255,255,0.7)",
          }}
        >
          Happy Raksha Bandhan,
          <br />
          <span style={{ color: RB.ink }}>{data.brotherName}</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scaleX: 0.3 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.55, duration: 0.6 }}
        >
          <ThreadDivider
            colorA={data.rakhi.threadColorA}
            colorB={data.rakhi.threadColorB}
            width={isDesktop ? 300 : 190}
          />
        </motion.div>

        {/* ── Her lines, on paper ── */}
        {data.greeting.length > 0 && (
          <motion.div
            initial="hidden"
            animate="show"
            transition={{ staggerChildren: 0.55, delayChildren: 0.7 }}
            style={{
              width: "100%",
              // The 320 cap made sense when this lived in a 420px phone column.
              // Beside a 520px desktop column it left her lines wrapping every
              // six words in a narrow box floating in open space.
              maxWidth: isDesktop ? "100%" : 320,
              padding: isDesktop ? "20px 24px" : "17px 19px",
              borderRadius: 16,
              background: "rgba(255,253,248,0.78)",
              border: `1px solid ${RB.hairline}`,
              backdropFilter: "blur(3px)",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {data.greeting.map((l, i) => (
              <motion.p
                key={i}
                variants={line}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  fontSize: isDesktop ? 17.5 : 15.5,
                  lineHeight: 1.58,
                  color: RB.ink,
                  margin: 0,
                }}
              >
                {l}
              </motion.p>
            ))}
          </motion.div>
        )}

        {distance && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 + data.greeting.length * 0.55, duration: 0.6 }}
            style={{ fontSize: 13, color: RB.muted, fontStyle: "italic", margin: 0 }}
          >
            {distance}
          </motion.p>
        )}

        {/* ── Muhurat. Information, never a gate. Height reserved so the CTA
              below does not jump when the clock resolves on the client. ── */}
        <div
          style={{
            minHeight: 46,
            display: "grid",
            placeItems: isDesktop ? "center start" : "center",
            width: "100%",
          }}
        >
          {muhurat && (
            <div
              className="rb-rise"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 15px 7px 9px",
                borderRadius: 999,
                border: `1px solid ${muhuratColor}`,
                background: "rgba(255,253,248,0.85)",
                fontSize: 12.5,
                color: muhuratColor,
                fontWeight: 600,
                boxShadow: "0 3px 10px rgba(61,35,23,0.08)",
              }}
            >
              <Diya size={20} lit={muhurat.phase !== "after"} />
              {muhurat.label}
            </div>
          )}
        </div>

        {/* ── CTA ── */}
        <motion.button
          onClick={onBegin}
          whileTap={{ scale: 0.96 }}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="rb-display rb-sheen rb-nudge rb-cta"
          style={{
            position: "relative",
            overflow: "hidden",
            marginTop: 4,
            padding: "16px 42px",
            minHeight: 56,
            borderRadius: 999,
            background: BRAND_GRADIENT,
            color: "#fffdf8",
            border: CARD_BORDER,
            boxShadow: CARD_SHADOW,
            fontSize: 17.5,
            fontWeight: 700,
            cursor: "pointer",
            letterSpacing: 0.3,
          }}
        >
          Tie the Rakhi
        </motion.button>

        {data.sisterName && (
          <p style={{ fontSize: 12.5, color: RB.muted, margin: 0 }}>
            from {data.sisterName}
            {data.city ? `, ${data.city}` : ""}
          </p>
        )}
        </>
      }
    />
  );
}
