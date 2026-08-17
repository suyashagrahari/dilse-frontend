"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { RS, BRAND_GRADIENT, CARD_BORDER, CARD_SHADOW } from "./theme";
import { sisterWord, type AccountRow, type SisterData } from "./types";
import { Rangoli, ThreadRule } from "./Ornaments";
import Stage, { BackLink, useIsDesktop } from "./Stage";

// ─── The statement of account ────────────────────────────────────────────────
//
// The comic release between the vow and the lifafa, and the hinge of the whole
// page. Two brand campaigns validated the itemised-sibling-invoice device in 2025
// (Flipkart's sister-issues-an-invoice microsite, MobiKwik's elder-sister film);
// this is the inversion of it — the BROTHER issues the statement, and his own
// column is the one that cannot be settled.
//
// ── WHY A LEDGER AND NOT A LIST OF COMPLAINTS ───────────────────────────────
//
// This screen started as a "complaint register": four grievances he formally
// drops. It was funny and it went nowhere, because a list of complaints resolves
// into nothing and then has to ask for her attention again on the next screen.
//
// A statement has two sides, and the two sides ARE the joke and its own reversal.
// Her column is petty and itemised and true — hoodies, tattling, a charger. His
// column is what she actually did, in exactly the same flat register, and it does
// not fit on the same scale. Nobody is laughing by the third line, and nothing had
// to change tone to get there.
//
// ── THE ORDER OF THE REVEAL IS THE JOKE ─────────────────────────────────────
//
// Her side prints first, alone, for about a second. If both columns arrive
// together the reader's eye finds the heavy one immediately, the punchline and the
// reversal land in the same instant, and neither works. The beat is what makes the
// second column feel like an answer rather than a matching pair.
//
// ── WHY THE COLUMNS ARE NOT BALANCED ────────────────────────────────────────
//
// Two rows against three, always, and a later edit must not pad them level. Equal
// columns read as a scorecard — the one interpretation of this screen that would
// be genuinely unkind — and the lopsidedness is the argument the screen is making.
//
// ── AND WHY IT STAYS DRY ────────────────────────────────────────────────────
//
// No exclamation marks, no emoji, no "aww" anywhere near the rows. This is the
// funniest screen on the page and it is funny because it is typeset like a bank
// statement and refuses to acknowledge that it is a joke. The balance line at the
// bottom is the one place it says something true, and it says it flatly.

/** Column heads, in his voice. Second person throughout — she is the reader. */
const HERS = "WHAT YOU OWE";
const HIS = "WHAT I OWE";

/**
 * One ruled line of the statement.
 *
 * The value column is rigid and right-aligned and the label is the only thing
 * allowed to give way — the value is either the figure or the punchline, and a
 * clipped one is a dead row. `minWidth: 0` on the label is what makes that
 * possible: a flex item defaults to `min-width: auto` and refuses to shrink below
 * its longest word, which defeats `flex-shrink` on its own.
 *
 * `tabular-nums` so that "11" and "3" sit on the same stem. Half the values in
 * this ledger are words rather than numbers ("beyond counting"), which is exactly
 * why the digits have to line up: the mixture only reads as a real ledger if the
 * numeric rows are typeset like numbers.
 */
function Row({
  row,
  i,
  animate,
  wide,
}: {
  row: AccountRow;
  i: number;
  animate: boolean;
  wide: boolean;
}) {
  return (
    <motion.div
      initial={animate ? { opacity: 0, x: -6 } : false}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: animate ? 0.4 : 0, delay: animate ? i * 0.28 : 0 }}
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 10,
        padding: "9px 0 8px",
        borderBottom: `1px solid ${RS.hairline}`,
        textAlign: "left",
      }}
    >
      <span
        style={{
          flex: "1 1 auto",
          minWidth: 0,
          overflowWrap: "anywhere",
          fontSize: 13.5,
          lineHeight: 1.45,
          color: RS.ink,
        }}
      >
        {row.label}
      </span>
      <span
        style={{
          flex: `0 0 ${wide ? 124 : 96}px`,
          textAlign: "right",
          paddingLeft: 10,
          borderLeft: `1px solid ${RS.hairline}`,
          alignSelf: "stretch",
          fontSize: 13.5,
          lineHeight: 1.45,
          fontWeight: 700,
          color: RS.raniDeep,
          fontVariantNumeric: "tabular-nums",
          overflowWrap: "anywhere",
        }}
      >
        {row.value}
      </span>
    </motion.div>
  );
}

/** A section head. Small, letterspaced, brass — a column head, not a title. */
function Head({ children }: { children: string }) {
  return (
    <p
      style={{
        fontSize: 10.5,
        letterSpacing: 2,
        fontWeight: 800,
        color: RS.brass,
        margin: "0 0 2px",
        textAlign: "left",
      }}
    >
      {children}
    </p>
  );
}

export default function AccountScreen({
  data,
  onContinue,
  onBack,
}: {
  data: SisterData;
  onContinue: () => void;
  onBack: () => void;
}) {
  const reduce = useReducedMotion();
  const isDesktop = useIsDesktop();

  const hers = data.account.sheOwes.filter((r) => r.label.trim() || r.value.trim());
  const his = data.account.heOwes.filter((r) => r.label.trim() || r.value.trim());

  /**
   * 0 — her side only. 1 — his side too. 2 — the balance.
   *
   * There is no `entry` prop on this screen (see the signatures in the spec), so
   * walking back into it from the lifafa replays the reveal. That is acceptable
   * here and it would not be on the tie or the vow: nothing she did is being
   * undone, the whole sequence is under two seconds, and the CTA is live from the
   * first frame so a replay never blocks her.
   */
  const [phase, setPhase] = useState(0);

  /**
   * Under `prefers-reduced-motion` the whole statement is simply printed at once.
   * A staged reveal with the motion stripped out is worse than either option: rows
   * still pop in and out of the document, the page still reflows twice, and the
   * reader gets the jumps without the timing that justified them.
   *
   * Both `setState` calls are inside timeout callbacks rather than the effect body,
   * which is what keeps `react-hooks/set-state-in-effect` happy. `Math.max` so a
   * re-run (the media query flipping mid-sequence) can only ever move forward.
   */
  useEffect(() => {
    const afterHers = reduce ? 0 : 1150;
    const afterHis = reduce ? 0 : afterHers + his.length * 280 + 620;
    const a = setTimeout(() => setPhase((p) => Math.max(p, 1)), afterHers);
    const b = setTimeout(() => setPhase((p) => Math.max(p, 2)), afterHis);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [reduce, his.length]);

  const animate = !reduce;
  const word = sisterWord(data);
  const name = data.sisterName.trim() || word;
  const year = (data.festivalDate || "").slice(0, 4);

  return (
    <Stage
      /* Two sections of ruled rows plus the balance passes a 640px phone. Centred,
         a column that tall is clipped at both ends; `rs-tall` stacks it from the
         top and lets it scroll. */
      className="rs-tall"
      behind={
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            zIndex: 0,
          }}
        >
          <Rangoli size={isDesktop ? 600 : 380} opacity={0.04} />
        </div>
      }
      head={
        <div>
          <p style={{ fontSize: 10.5, letterSpacing: 2.4, fontWeight: 800, color: RS.brass, margin: 0 }}>
            STATEMENT OF ACCOUNT
          </p>
          <h2
            className="rs-display"
            style={{
              fontSize: isDesktop ? 40 : 28,
              fontWeight: 700,
              color: RS.rani,
              margin: "4px 0 0",
              lineHeight: 1.15,
            }}
          >
            Hisaab
          </h2>
          {/* Dry, and it belongs to the framing rather than to the ledger — the
              rows themselves never wink. */}
          <p style={{ fontSize: 13, color: RS.muted, margin: "7px 0 0", maxWidth: 320, lineHeight: 1.55 }}>
            Maintained continuously. Corrections not accepted.
          </p>
        </div>
      }
      /* No `art`: the ledger is the document. Stage collapses to one centred column
         without it — see the `art` note in Stage.tsx. */
      body={
        <>
          <div
            style={{
              width: "100%",
              maxWidth: isDesktop ? 460 : 344,
              background: RS.surface,
              border: CARD_BORDER,
              boxShadow: CARD_SHADOW,
              borderRadius: 5,
              padding: isDesktop ? "18px 20px 16px" : "15px 15px 13px",
            }}
          >
            {/* The statement's own header block. A name and a period, because that
                is what makes ruled rows read as a document rather than a list. */}
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: 10,
                paddingBottom: 9,
                borderBottom: `2px solid ${RS.ink}`,
                textAlign: "left",
              }}
            >
              <span
                className="rs-display rs-name"
                style={{ fontSize: 15.5, fontWeight: 700, color: RS.ink, minWidth: 0 }}
              >
                {name}
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: RS.muted,
                  whiteSpace: "nowrap",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                Raksha Bandhan{year ? ` ${year}` : ""}
              </span>
            </div>

            {hers.length === 0 && his.length === 0 ? (
              /* `dbToSisterData` tolerates a missing `account`, and an empty ruled
                 sheet reads as a page that failed to load. One flat line keeps the
                 screen honest and still hands the lifafa its setup. */
              <p style={{ fontSize: 13.5, color: RS.ink, margin: "14px 0 2px", textAlign: "left", lineHeight: 1.6 }}>
                Nothing itemised this year. It does not mean the account is empty.
              </p>
            ) : (
              <>
                {hers.length > 0 && (
                  <section style={{ marginTop: 13 }}>
                    <Head>{HERS}</Head>
                    {hers.map((r, i) => (
                      <Row key={`h${i}`} row={r} i={i} animate={animate} wide={isDesktop} />
                    ))}
                  </section>
                )}

                {/* ── The turn ────────────────────────────────────────────────────
                    `aria-live="polite"` because for a screen-reader user the
                    second column arriving a beat later is not decoration — it is
                    the content of the screen, and without the announcement the
                    reversal simply never happens. */}
                <div aria-live="polite">
                  {phase >= 1 && his.length > 0 && (
                    <section style={{ marginTop: 16 }}>
                      {/* A heavier rule between the two sides. This is the only
                          separator on the sheet that is not a row rule, and it is
                          what stops the five lines reading as one list of five. */}
                      <div style={{ display: "grid", placeItems: "center", marginBottom: 12 }}>
                        <ThreadRule width={isDesktop ? 300 : 220} />
                      </div>
                      <Head>{HIS}</Head>
                      {his.map((r, i) => (
                        <Row key={`o${i}`} row={r} i={i} animate={animate} wide={isDesktop} />
                      ))}
                    </section>
                  )}

                  {/* ── The balance ───────────────────────────────────────────────
                      The hinge of the page, and the reason the envelope on the next
                      screen is not a payment. It is written flat on purpose: the
                      moment it reaches for feeling it becomes a greeting card, and
                      the ledger's whole authority comes from sounding like it is
                      only stating a position. */}
                  {phase >= 2 && (
                    <div
                      className="rs-rise"
                      style={{
                        marginTop: 16,
                        paddingTop: 13,
                        borderTop: `2px solid ${RS.ink}`,
                        textAlign: "left",
                        position: "relative",
                      }}
                    >
                      <Head>BALANCE</Head>
                      <p style={{ fontSize: 13.5, lineHeight: 1.6, color: RS.ink, margin: "6px 0 0" }}>
                        Your column settles. A hoodie back, one evening, done.
                      </p>
                      <p style={{ fontSize: 13.5, lineHeight: 1.6, color: RS.ink, margin: "6px 0 0" }}>
                        Mine does not. There is no figure that closes it, so it stays open.
                      </p>

                      {/* Stamped rather than typeset, because that is what a clerk
                          does to an account that cannot be closed. Rani, not
                          mehendi — mehendi belongs to the vow's signature and the
                          muhurat and to nothing else in this template. */}
                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                        <span
                          className="rs-stamp"
                          style={{
                            padding: "5px 10px",
                            border: `2px solid ${RS.rani}`,
                            outline: `1px solid ${RS.rani}`,
                            outlineOffset: 2,
                            borderRadius: 3,
                            color: RS.rani,
                            background: RS.surface,
                            fontSize: 9.5,
                            fontWeight: 800,
                            letterSpacing: 2.2,
                            whiteSpace: "nowrap",
                          }}
                        >
                          CARRIED FORWARD
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Names what the lifafa actually is, in the ledger's own register. "Open
              your gift" would undo the thirty seconds this screen just spent
              establishing that the debt is unpayable — the envelope is a part
              payment against it, which is, as it happens, exactly what shagun is. */}
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
            Part payment
          </motion.button>

          <BackLink onClick={onBack} label="Vachan padho" />
        </>
      }
    />
  );
}
