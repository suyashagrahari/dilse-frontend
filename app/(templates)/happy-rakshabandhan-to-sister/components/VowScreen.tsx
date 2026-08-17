"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { RS, BRAND_GRADIENT, CARD_BORDER, CARD_SHADOW } from "./theme";
import { sisterWord, type SisterData } from "./types";
import type { Entry } from "./SisterTemplate";
import { Rangoli, ThreadRule, Seal } from "./Ornaments";
import Stage, { BackLink, useIsDesktop } from "./Stage";

// ─── The vow, as a document ──────────────────────────────────────────────────
//
// "Raksha" in Raksha Bandhan is this — the brother's side of the festival is a
// promise, and the thread is only the receipt for it. So this screen is the
// emotional peak of the page and the one thing on it she keeps: a certificate,
// with rule work, a seal, a date and a signature, drawn rather than photographed.
//
// ── WHY A CERTIFICATE AND NOT FOUR CENTRED LINES ────────────────────────────
//
// Four lines of serif on ivory is what every other card does, and it reads as a
// caption. A bordered document with a signature at the bottom reads as something
// that was issued — which is a claim the page is making on his behalf, and the
// reason the vow lands harder here than it does on the cover. It also gives the
// screen a shape worth screenshotting, which is how this page actually travels.
//
// ── NO JOKES IN THIS FILE'S OWN COPY ────────────────────────────────────────
//
// The screen before it is the rakhi tray (five punchlines) and the screen after
// it is the statement of account (the whole joke). This one is the pause between
// them and it must be completely straight. If a future edit is tempted to put a
// wink in the heading or the CTA, put it in AccountScreen instead — the tonal
// whiplash of tender→funny→tender is the design, and it only works if the tender
// beats do not hedge.
//
// ── WHY THE FRAMING FORKS ON BIRTH ORDER ────────────────────────────────────
//
// A page that has a man solemnly promising to protect his ELDER sister has the
// relationship upside down. She is the one who protected him; in much of India she
// also blesses him on this day and he touches her feet. So for an elder sister the
// certificate is an ADMISSION — a debt acknowledged, in a slightly sheepish voice
// — and for a younger sister it is a GUARANTEE, in the standard bada-bhai voice.
//
// Strings fork. Layout does not, and there is no second component: the difference
// is four sentences, and two copies of this file would drift apart inside a
// release. See `sisterIsElder` in types.ts.

/** The only thing `sisterIsElder` changes here: his posture, in four strings. */
const FRAMING = {
  elder: {
    /** He is admitting something, not undertaking it. */
    heading: "What I owe you",
    lead: "You did the protecting. I am only writing it down.",
    /** Under the signature. He is the younger one. */
    signedAs: "Tera chhota bhai",
    /** The document's own line for what the list below is. */
    field: "ADMITTED",
  },
  younger: {
    heading: "What I promise you",
    lead: "Read it once. It does not have conditions.",
    signedAs: "Tera bada bhai",
    field: "UNDERTAKEN",
  },
} as const;

/**
 * A certificate has corner marks. Four 12px brackets, drawn with two borders
 * each, because an SVG for this would be four more nodes and one more import for
 * something CSS already does exactly.
 */
function Corner({ v, h }: { v: "top" | "bottom"; h: "left" | "right" }) {
  const rule = `2px solid ${RS.brass}`;
  const top = v === "top";
  const left = h === "left";
  return (
    <span
      aria-hidden
      style={{
        position: "absolute",
        top: top ? -1 : undefined,
        bottom: top ? undefined : -1,
        left: left ? -1 : undefined,
        right: left ? undefined : -1,
        width: 12,
        height: 12,
        borderTop: top ? rule : undefined,
        borderBottom: top ? undefined : rule,
        borderLeft: left ? rule : undefined,
        borderRight: left ? undefined : rule,
        pointerEvents: "none",
      }}
    />
  );
}

/** Seconds between vow lines, and the pause before the first one. */
const LINE_GAP = 0.62;
const LEAD_IN = 0.4;

export default function VowScreen({
  data,
  entry,
  onContinue,
  onBack,
}: {
  data: SisterData;
  entry: Entry;
  onContinue: () => void;
  onBack: () => void;
}) {
  const reduce = useReducedMotion();
  const isDesktop = useIsDesktop();

  /**
   * `entry` is read here and nowhere else, which is the whole contract for it
   * (see `Entry` in SisterTemplate.tsx). A `useState` initialiser runs on mount
   * only, so a later re-render with a different `entry` cannot re-open a
   * certificate she has already read — and walking back from the statement of
   * account lands on the sealed document rather than making her watch it assemble
   * a second time.
   */
  const [sealed, setSealed] = useState(entry === "last");
  const [instant] = useState(entry === "last");

  // Four is the form's limit and the number the layout is drawn for; a document
  // that arrived with eight lines from an older save would push its own seal off
  // the bottom of a 360px phone rather than truncate.
  const lines = data.vow.map((l) => l.trim()).filter(Boolean).slice(0, 4);

  /**
   * Step two: the seal lands once the last line has arrived.
   *
   * A timer rather than a "sign it" button. The seal is not a decision she makes —
   * it is his signature, and asking her to tap for it would hand her authorship of
   * his vow. It is also why there is no gate on the CTA below: if she wants to
   * move on before the ink dries she can, and the seal is waiting when she comes
   * back.
   *
   * The `setState` is inside the timeout callback, not the effect body, so
   * `react-hooks/set-state-in-effect` is satisfied — and the early return means
   * the effect re-running after it fires cannot start a second timer.
   */
  useEffect(() => {
    if (sealed) return;
    const ms = reduce ? 240 : (LEAD_IN + lines.length * LINE_GAP + 0.3) * 1000;
    const t = setTimeout(() => setSealed(true), ms);
    return () => clearTimeout(t);
  }, [sealed, reduce, lines.length]);

  const f = data.sisterIsElder ? FRAMING.elder : FRAMING.younger;
  const word = sisterWord(data);
  const name = data.sisterName.trim();
  const signature = data.brotherName.trim() || "Bhai";
  const since = data.vowSince.trim();

  return (
    <Stage
      /* Four wrapped vow lines plus a signature block can pass a 640px phone, and
         a centred column taller than the viewport is clipped at BOTH ends — the
         heading disappears upward with nothing to scroll to. Top-aligned and
         scrolling is the lesser cost. */
      className="rs-tall"
      behind={
        <div
          style={{
            position: "absolute",
            top: "46%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            zIndex: 0,
          }}
        >
          {/* Texture under the paper, not decoration on it. Lower than every other
              screen's rangoli on purpose: the document has its own rule work and
              two patterns at the same strength fight each other. */}
          <Rangoli size={isDesktop ? 620 : 400} opacity={0.04} />
        </div>
      }
      head={
        <div>
          <p
            className="rs-deva"
            style={{ fontSize: 14, color: RS.brass, margin: 0 }}
          >
            रक्षा वचन
          </p>
          <h2
            className="rs-display rs-name"
            style={{
              fontSize: isDesktop ? 40 : 28,
              fontWeight: 700,
              color: RS.rani,
              margin: "4px 0 0",
              lineHeight: 1.15,
            }}
          >
            {f.heading}
          </h2>
          <p
            style={{
              fontSize: 13,
              color: RS.muted,
              margin: "7px 0 0",
              maxWidth: 320,
              lineHeight: 1.55,
            }}
          >
            {f.lead}
          </p>
        </div>
      }
      /* No `art`. The certificate IS the artwork, and Stage collapses to one
         centred column without it rather than parking a document beside an empty
         half of the desktop grid — see the `art` prop's note in Stage.tsx. */
      body={
        <>
          <motion.article
            initial={instant || reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduce ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{
              width: "100%",
              maxWidth: isDesktop ? 430 : 344,
              background: RS.surface,
              border: CARD_BORDER,
              boxShadow: CARD_SHADOW,
              /* Barely rounded. A document with a 20px radius reads as an app card,
                 and every other surface in this template is already a card. */
              borderRadius: 5,
              padding: 9,
            }}
          >
            {/* The second rule of the double frame. Two hairlines 9px apart is what
                makes ink on ivory read as printed stationery rather than a div. */}
            <div
              style={{
                position: "relative",
                border: `1px solid ${RS.brassSoft}`,
                borderRadius: 2,
                padding: isDesktop ? "22px 22px 18px" : "18px 15px 15px",
              }}
            >
              <Corner v="top" h="left" />
              <Corner v="top" h="right" />
              <Corner v="bottom" h="left" />
              <Corner v="bottom" h="right" />

              {/* ── The addressed field ─────────────────────────────────────────
                  `sisterWord` and never a hardcoded "didi"/"behna": it is resolved
                  in exactly one place in this template (types.ts) so that the one
                  word the reader is guaranteed to notice cannot go wrong here and
                  be right everywhere else. */}
              <p
                style={{
                  fontSize: 10.5,
                  letterSpacing: 2,
                  fontWeight: 700,
                  color: RS.brass,
                  margin: 0,
                  textTransform: "uppercase",
                }}
              >
                {f.field}
              </p>
              <p
                className="rs-display rs-name"
                style={{
                  fontSize: isDesktop ? 22 : 18,
                  color: RS.ink,
                  margin: "5px 0 0",
                  lineHeight: 1.3,
                }}
              >
                {name ? `For ${name}, my ${word}.` : `For my ${word}.`}
              </p>

              <div style={{ display: "grid", placeItems: "center", margin: "13px 0 15px" }}>
                <ThreadRule width={isDesktop ? 300 : 230} />
              </div>

              {/* ── The vow ─────────────────────────────────────────────────────
                  One line at a time, ~0.6s apart. The stagger is the assembling
                  step: a promise arrives a clause at a time when someone means it,
                  and all four at once reads as a paragraph.

                  No special styling for the last line even though it is usually the
                  payoff (see SAMPLE.vow in types.ts). He can reorder them in the
                  form, and a hard-coded "final line is bigger" would then put the
                  emphasis on whichever line happens to be fourth. */}
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {lines.length > 0 ? (
                  lines.map((line, i) => (
                    <motion.p
                      key={`${i}-${line}`}
                      initial={instant || reduce ? false : { opacity: 0, y: 7 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: reduce ? 0 : 0.5,
                        delay: instant || reduce ? 0 : LEAD_IN + i * LINE_GAP,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="rs-display"
                      style={{
                        fontSize: isDesktop ? 19.5 : 16.5,
                        lineHeight: 1.55,
                        color: RS.ink,
                        margin: 0,
                        textAlign: "center",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {line}
                    </motion.p>
                  ))
                ) : (
                  /* An empty `vow` is possible — `dbToSisterData` tolerates a
                     missing field, and a document with a border, a seal and no text
                     is the one state that reads as broken rather than sparse. One
                     line in the same posture as the fork above is enough to keep it
                     a certificate. */
                  <p
                    className="rs-display"
                    style={{
                      fontSize: isDesktop ? 19.5 : 16.5,
                      lineHeight: 1.55,
                      color: RS.ink,
                      margin: 0,
                      textAlign: "center",
                    }}
                  >
                    {data.sisterIsElder
                      ? "Everything you did, I noticed. All of it."
                      : "Whatever it is, call me first."}
                  </p>
                )}
              </div>

              <div style={{ display: "grid", placeItems: "center", margin: "16px 0 0" }}>
                <ThreadRule width={isDesktop ? 300 : 230} />
              </div>

              {/* ── The seal and the signature ───────────────────────────────────
                  Height is reserved with `minHeight` and the contents swap in, so
                  the seal landing does not shove the vow lines up the screen the
                  moment she finishes reading them. The stamp animation is a
                  one-shot, which is why this is a real mount and not an opacity
                  toggle — `.rs-stamp` has nothing to play if the node was already
                  there. */}
              <div
                style={{
                  minHeight: 112,
                  marginTop: 14,
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 12,
                }}
              >
                {sealed && (
                  <>
                    {/* `vowSince` is his phrasing — "since 2001", "since the day
                        they brought you home" — so the seal takes the whole string
                        and lets the long ones wrap inside the wax. A truncated date
                        on a seal looks like a bug; a crowded one looks like a stamp.

                        `stamped` is the ornament's own landing one-shot rather than
                        a wrapper animation of mine: it is the settle this step
                        exists for, and sister.css already pins it to a visible end
                        state under reduced motion. */}
                    <Seal size={isDesktop ? 92 : 82} stamped>
                      {since || "वचन"}
                    </Seal>

                    <div
                      className="rs-rise"
                      style={{
                        flex: "1 1 auto",
                        minWidth: 0,
                        position: "relative",
                        paddingTop: 20,
                        textAlign: "right",
                      }}
                    >
                      {/* ── The one mehendi green in this file ──────────────────
                          `RS.mehendi` appears in exactly two places in this whole
                          template — this stamp and the muhurat line on the cover —
                          which is what lets both of them mean something without a
                          label explaining that they do. Do not reach for it for a
                          divider or a hover state; there is brass and rani for
                          that, and a third mehendi element costs the other two
                          their meaning.

                          Not `aria-hidden`: "SIGNED" is the fact the stamp exists
                          to state, and a screen reader should get it. The rotation
                          and the settle come from `.rs-stamp`, which the
                          stylesheet's reduced-motion block pins to a straight,
                          fully-visible end state. */}
                      <span
                        className="rs-stamp"
                        style={{
                          position: "absolute",
                          top: -2,
                          right: -2,
                          padding: "4px 9px",
                          border: `2px solid ${RS.mehendi}`,
                          outline: `1px solid ${RS.mehendi}`,
                          outlineOffset: 2,
                          borderRadius: 3,
                          color: RS.mehendi,
                          background: RS.surface,
                          fontSize: 9.5,
                          fontWeight: 800,
                          letterSpacing: 2.4,
                          whiteSpace: "nowrap",
                        }}
                      >
                        SIGNED
                      </span>

                      <p
                        className="rs-hand rs-name"
                        style={{
                          fontSize: isDesktop ? 34 : 29,
                          lineHeight: 1.1,
                          color: RS.raniDeep,
                          margin: 0,
                        }}
                      >
                        {signature}
                      </p>
                      <span
                        aria-hidden
                        style={{
                          display: "block",
                          height: 1,
                          background: RS.hairline,
                          margin: "4px 0 5px",
                        }}
                      />
                      <p style={{ fontSize: 11.5, color: RS.muted, margin: 0 }}>{f.signedAs}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.article>

          {/* Deliberately flat, and deliberately naming what comes next. The
              statement of account is the funny screen; letting its title do the
              work here would put a joke on the certificate. */}
          <motion.button
            onClick={onContinue}
            whileTap={{ scale: 0.97 }}
            className={`rs-display ${reduce ? "" : "rs-sheen"}`}
            style={{
              position: "relative",
              overflow: "hidden",
              minHeight: 56,
              padding: "16px 30px",
              borderRadius: 999,
              background: BRAND_GRADIENT,
              color: "#fffdf8",
              border: CARD_BORDER,
              boxShadow: CARD_SHADOW,
              fontSize: 16.5,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Now, the accounts
          </motion.button>

          <BackLink onClick={onBack} label="Rakhi dekho" />
        </>
      }
    />
  );
}
