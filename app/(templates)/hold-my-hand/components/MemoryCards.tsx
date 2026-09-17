"use client";

/**
 * The keepsake row, shown under the letter once they have held on.
 *
 * ── WHY IT COMES AFTER THE LETTER, NOT BEFORE ───────────────────────────────
 *
 * The whole template is built on withholding: the face is blurred, the letter is
 * sealed, and a minute of holding is the price. Photographs of the two of them
 * are the warmest thing on the page, so they are the reward, not the teaser. Put
 * them above the letter and the letter becomes a caption.
 *
 * Each card is a photo with one handwritten line under it. They are deliberately
 * NOT a lightbox or a carousel — nothing here should need a second interaction
 * from somebody who has already given the page sixty seconds.
 */

import { motion } from "framer-motion";
import { HMH, type Memory } from "./types";

/** A gentle alternating tilt, so the row reads as photographs rather than a grid. */
const TILT = [-2.2, 1.8, -1.4, 2.4, -1.9, 1.2];

export default function MemoryCards({
  memories,
  reduced,
  accent,
}: {
  memories: Memory[] | undefined;
  reduced: boolean;
  /** The stage colour the hold ended on, so the section belongs to the page. */
  accent: string;
}) {
  // Tolerates `undefined`: AI fill and restored drafts can both hand in a
  // payload written before this field existed.
  if (!memories?.length) return null;

  return (
    <section className="w-full mt-14" aria-label="Photographs and notes">
      <div className="flex items-center gap-3 mb-6">
        <span className="h-px flex-1" style={{ background: "rgba(255,255,255,.14)" }} />
        <span
          style={{
            fontFamily: HMH.display,
            fontSize: 11,
            letterSpacing: ".18em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,.5)",
          }}
        >
          us
        </span>
        <span className="h-px flex-1" style={{ background: "rgba(255,255,255,.14)" }} />
      </div>

      {/*
        One column on a phone, two from `sm` up. Not three: these are portraits
        of two people, and at a third of a desktop width faces stop being
        readable — which is the only reason the section exists.
      */}
      <div className="grid gap-5 sm:gap-6" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,230px),1fr))" }}>
        {memories.map((m, i) => (
          <motion.figure
            key={`${m.imageUrl}-${i}`}
            initial={reduced ? false : { opacity: 0, y: 26, rotate: 0 }}
            whileInView={reduced ? undefined : { opacity: 1, y: 0, rotate: TILT[i % TILT.length] }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ type: "spring", stiffness: 180, damping: 22, delay: Math.min(i * 0.08, 0.4) }}
            className="m-0 rounded-[20px] overflow-hidden"
            style={{
              background: "rgba(255,255,255,.055)",
              border: "1px solid rgba(255,255,255,.12)",
              boxShadow: "0 26px 60px -28px rgba(0,0,0,.9)",
              // Applied statically too, so reduced motion still gets the tilt
              // without an animation running.
              rotate: reduced ? `${TILT[i % TILT.length]}deg` : undefined,
            }}
          >
            <div style={{ aspectRatio: "4 / 5", background: "rgba(0,0,0,.35)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={m.imageUrl}
                alt={m.note || "A photograph of the two of them"}
                loading="lazy"
                decoding="async"
                draggable={false}
                className="w-full h-full object-cover"
              />
            </div>

            {m.note.trim() && (
              <figcaption
                className="px-4 py-4"
                style={{
                  fontFamily: HMH.script,
                  fontSize: 19,
                  lineHeight: 1.45,
                  color: "rgba(255,255,255,.9)",
                }}
              >
                <span aria-hidden style={{ color: accent, marginRight: 6 }}>
                  —
                </span>
                {m.note}
              </figcaption>
            )}
          </motion.figure>
        ))}
      </div>
    </section>
  );
}
