"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { RS, BRAND_GRADIENT, CARD_BORDER, CARD_SHADOW } from "./theme";
import { sisterWord, type Memory, type SisterData } from "./types";
import { Marigold, Rangoli, ThreadRule } from "./Ornaments";
import Stage, { BackLink, useIsDesktop } from "./Stage";
import UserImage from "./UserImage";

// ─── The photographs ─────────────────────────────────────────────────────────
//
// Polaroids, tilted, with the caption written under the frame and the year stamped
// on the print. Tapping one opens it full-screen.
//
// ── WHY TWO PHOTOS HAVE TO LOOK DELIBERATE ──────────────────────────────────
//
// Most people upload two or three, and the naive layout for "a few photos" is a
// grid — which is exactly what makes three look like a grid that failed to fill.
// A grid announces the number of cells it expected; a scattered stack announces
// nothing, so two prints read as two prints somebody laid out and not as a page
// waiting for four more.
//
// So: one column, alternating tilt and a small horizontal offset, each print wide
// enough to be looked at rather than counted, with a strip of tape at the top. The
// tilt is deterministic (see `tilt`) because `Math.random()` re-rolls on every
// render and the whole stack twitches each time React repaints it.
//
// ── WHY THE LIGHTBOX IS PORTALLED ───────────────────────────────────────────
//
// `position: fixed` resolves against the nearest ancestor carrying a transform,
// not against the viewport. This template animates screens with framer-motion, so
// there is *always* a transformed ancestor above this component, and a fixed
// overlay rendered in place would be pinned inside the screen's transformed box —
// off-centre, clipped, and scrolling with the column. `createPortal` to
// `document.body` is the fix, and it is not optional here. Do not "simplify" it.

/** Deterministic per-index tilt and nudge, so the stack never jitters. */
function tilt(i: number): number {
  const seq = [-2.4, 2.1, -1.5, 2.8, -2.9, 1.3];
  return seq[i % seq.length];
}
function nudge(i: number): number {
  const seq = [-10, 9, -6, 11, -8, 5];
  return seq[i % seq.length];
}

function Polaroid({
  m,
  i,
  onOpen,
}: {
  m: Memory;
  i: number;
  onOpen: () => void;
}) {
  // A photo that 404s must not leave a broken-image glyph in the middle of
  // somebody's memories. The whole print leaves instead.
  const [broken, setBroken] = useState(false);
  if (broken || !m.imageUrl) return null;

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      aria-label={`Enlarge: ${m.caption || "a photo"}${m.year ? `, ${m.year}` : ""}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileTap={{ scale: 1.02 }}
      style={{
        // A single transform string rather than framer's `rotate` prop: the tilt
        // never animates, and the string form keeps it off the main thread's
        // CSS-variable path while the column is being scrolled.
        transform: `rotate(${tilt(i)}deg) translateX(${nudge(i)}px)`,
        background: RS.surface,
        border: CARD_BORDER,
        boxShadow: CARD_SHADOW,
        borderRadius: 7,
        padding: "13px 13px 0",
        margin: 0,
        width: "100%",
        maxWidth: 268,
        position: "relative",
        cursor: "pointer",
        display: "block",
        textAlign: "center",
      }}
    >
      {/* Masking tape. Two of these and a stack of prints stops looking like a
          list of cards. */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          top: -9,
          left: "50%",
          width: 62,
          height: 19,
          transform: `translateX(-50%) rotate(${-tilt(i) * 1.4}deg)`,
          background: RS.haldiSoft,
          opacity: 0.75,
          border: `1px solid ${RS.hairline}`,
        }}
      />

      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "1 / 1",
          background: RS.paperDeep,
          overflow: "hidden",
        }}
      >
        <UserImage
          src={m.imageUrl}
          alt={m.caption || "A memory"}
          sizes="268px"
          onError={() => setBroken(true)}
          style={{ objectFit: "cover" }}
        />
      </div>

      {m.year && (
        <span
          style={{
            position: "absolute",
            top: 19,
            right: 19,
            padding: "3px 8px",
            borderRadius: 5,
            background: "rgba(255,253,248,0.92)",
            fontSize: 10.5,
            color: RS.muted,
            fontWeight: 700,
            letterSpacing: 0.5,
          }}
        >
          {m.year}
        </span>
      )}

      <span
        className="rs-hand"
        style={{
          display: "block",
          fontSize: 18,
          lineHeight: 1.35,
          color: RS.ink,
          padding: "11px 6px 15px",
          minHeight: 46,
        }}
      >
        {m.caption}
      </span>
    </motion.button>
  );
}

/** Full-screen print. Lives on `document.body` — see the note at the top. */
function Lightbox({ m, onClose }: { m: Memory; onClose: () => void }) {
  // Escape closes it, and the page underneath stops scrolling while it is up.
  // Both are DOM side effects rather than state, so neither trips
  // `react-hooks/set-state-in-effect`.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={m.caption || "Photo"}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        background: "rgba(51,32,43,0.92)",
        display: "grid",
        placeItems: "center",
        padding: 18,
      }}
    >
      <motion.figure
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        // The figure swallows the click so tapping the photo itself does not
        // dismiss the thing she just opened.
        onClick={(e) => e.stopPropagation()}
        style={{
          margin: 0,
          width: "100%",
          maxWidth: 460,
          background: RS.surface,
          border: CARD_BORDER,
          borderRadius: 10,
          padding: "14px 14px 0",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "1 / 1",
            background: RS.paperDeep,
            overflow: "hidden",
          }}
        >
          <UserImage
            src={m.imageUrl}
            alt={m.caption || "A memory"}
            sizes="(min-width: 480px) 460px, 92vw"
            style={{ objectFit: "contain" }}
          />
        </div>

        <figcaption
          className="rs-hand"
          style={{
            fontSize: 20,
            lineHeight: 1.4,
            color: RS.ink,
            textAlign: "center",
            padding: "13px 8px 16px",
          }}
        >
          {m.caption}
          {m.year && (
            <span style={{ display: "block", fontSize: 12, color: RS.muted, marginTop: 6 }}>
              {m.year}
            </span>
          )}
        </figcaption>

        <button
          type="button"
          onClick={onClose}
          autoFocus
          aria-label="Close photo"
          style={{
            position: "absolute",
            top: -14,
            right: -10,
            width: 44,
            height: 44,
            borderRadius: 999,
            display: "grid",
            placeItems: "center",
            background: RS.surface,
            border: CARD_BORDER,
            boxShadow: CARD_SHADOW,
            color: RS.ink,
            cursor: "pointer",
          }}
        >
          <X size={18} />
        </button>
      </motion.figure>
    </div>,
    document.body
  );
}

export default function MemoriesScreen({
  data,
  onContinue,
  onBack,
}: {
  data: SisterData;
  onContinue: () => void;
  onBack: () => void;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const isDesktop = useIsDesktop();

  const shots = data.memories.filter((m) => m.imageUrl);
  const has = shots.length > 0;
  const her = data.sisterName || sisterWord(data);

  return (
    <Stage
      className="rs-tall"
      behind={
        <div
          style={{
            position: "absolute",
            top: "26%",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 0,
          }}
        >
          <Rangoli size={isDesktop ? 600 : 380} opacity={0.05} />
        </div>
      }
      head={
        <>
          <p
            className="rs-deva"
            style={{ fontSize: 13, color: RS.brass, margin: 0 }}
          >
            यादें
          </p>
          <h2
            className="rs-display rs-name"
            style={{
              fontSize: isDesktop ? 40 : 27,
              fontWeight: 700,
              color: RS.rani,
              margin: "6px 0 0",
            }}
          >
            {has ? "Evidence" : "No photos in this one"}
          </h2>
          <p
            style={{
              fontSize: 13.5,
              color: RS.muted,
              margin: "7px 0 0",
              lineHeight: 1.55,
              maxWidth: 320,
            }}
          >
            {has
              ? "Submitted in support of the statement. Tap any of them."
              : "Which is its own kind of proof."}
          </p>
          <div style={{ marginTop: 14, display: "grid", placeItems: isDesktop ? "center start" : "center" }}>
            <ThreadRule width={isDesktop ? 260 : 210} />
          </div>
        </>
      }
      art={
        has ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              // Wider gap when there are only two or three prints, so the column
              // reads as composed rather than as a short list.
              gap: shots.length <= 3 ? 40 : 28,
              width: "100%",
              paddingBottom: 4,
            }}
          >
            {shots.map((m, i) => (
              <Polaroid key={`${m.imageUrl}-${i}`} m={m} i={i} onOpen={() => setOpen(i)} />
            ))}
          </div>
        ) : (
          /* ── The empty case ──────────────────────────────────────────────
           *
           * An empty polaroid grid with nothing in it is a bug on the screen. So
           * this is not the grid with zero children — it is a different object: a
           * single blank print, taped up, with the joke written on it in the same
           * hand the captions use. It has to be warm enough that a brother who
           * uploaded nothing has not obviously skipped a step. */
          <div
            className="rs-rise"
            style={{
              transform: "rotate(-2deg)",
              background: RS.surface,
              border: CARD_BORDER,
              boxShadow: CARD_SHADOW,
              borderRadius: 7,
              padding: "13px 13px 0",
              width: "100%",
              maxWidth: 268,
              position: "relative",
            }}
          >
            <span
              aria-hidden
              style={{
                position: "absolute",
                top: -9,
                left: "50%",
                width: 62,
                height: 19,
                transform: "translateX(-50%) rotate(3deg)",
                background: RS.haldiSoft,
                opacity: 0.75,
                border: `1px solid ${RS.hairline}`,
              }}
            />
            <div
              style={{
                width: "100%",
                aspectRatio: "1 / 1",
                background: RS.paperDeep,
                display: "grid",
                placeItems: "center",
                gap: 10,
              }}
            >
              <Marigold size={78} tone="haldi" />
            </div>
            <p
              className="rs-hand"
              style={{
                fontSize: 18,
                lineHeight: 1.4,
                color: RS.ink,
                textAlign: "center",
                padding: "12px 8px 16px",
                margin: 0,
              }}
            >
              He has forty of these on his phone. Every one of them blurry. Every
              one of them with your eyes shut.
            </p>
          </div>
        )
      }
      body={
        <>
          {!has && (
            <p style={{ fontSize: 13.5, color: RS.muted, margin: 0, maxWidth: 320, lineHeight: 1.6 }}>
              Ask him for them, {her}. He will send four and claim he sent all of them.
            </p>
          )}

          <button
            type="button"
            onClick={onContinue}
            className="rs-display"
            style={{
              width: "100%",
              maxWidth: 320,
              minHeight: 56,
              padding: "16px 28px",
              borderRadius: 999,
              background: BRAND_GRADIENT,
              color: "#fffdf8",
              border: CARD_BORDER,
              boxShadow: CARD_SHADOW,
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            He wrote you something →
          </button>

          <BackLink onClick={onBack} />
        </>
      }
      overlay={
        open !== null && shots[open] ? (
          <Lightbox m={shots[open]} onClose={() => setOpen(null)} />
        ) : null
      }
    />
  );
}
