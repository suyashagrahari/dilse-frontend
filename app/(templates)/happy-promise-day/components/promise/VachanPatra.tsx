"use client";

// The main letter as a "₹∞ Pyaar Stamp Paper": guilloche header, gold-leaf
// border, a watermark of both names, the letter typed in as the body of the
// agreement, the promises as numbered clauses, then the two signatures — the
// sender's pre-signed, the recipient's drawn with a fingertip — and a ~0.9 s
// thumb press that inks a vermilion print. On completion "Notarised by Cupid"
// stamps down with a little paper shake.

import { useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { FONTS, VW } from "../../../_valentine/theme";
import { haptic, Typewriter, useHoldProgress, useReducedMotion } from "../../../_valentine/kit";
import { CupidSeal, Rosette, ThumbprintArt } from "./art";
import SignaturePad, { type SignatureHandle } from "./SignaturePad";
import { Btn, Hint, P, ghostBtn, sfx } from "./ui";

export interface Signed {
  signature: string | null;
}

export default function VachanPatra({
  sender,
  recipient,
  petName,
  letter,
  clauses,
  bigPromise,
  date,
  serial,
  seed,
  sticker,
  onSigned,
  onNext,
}: {
  sender: string;
  recipient: string;
  petName: string;
  letter: string;
  clauses: string[];
  bigPromise: string;
  date: string;
  serial: string;
  seed: number;
  sticker: React.ReactNode;
  onSigned: (s: Signed) => void;
  onNext: () => void;
}) {
  const reduced = useReducedMotion();
  const paper = useAnimationControls();
  const pad = useRef<SignatureHandle>(null);
  const [letterDone, setLetterDone] = useState(false);
  const [hasInk, setHasInk] = useState(false);
  const [stamped, setStamped] = useState(false);
  const signRef = useRef<HTMLDivElement>(null);

  const thumb = useHoldProgress({
    duration: 900,
    springBack: 1,
    taps: 3,
    ticks: false,
    disabled: !hasInk || stamped,
    onComplete: () => {
      haptic([30, 60, 90]);
      onSigned({ signature: pad.current?.toDataURL() ?? null });
      window.setTimeout(
        () => {
          setStamped(true);
          sfx.thump();
          haptic(40);
          if (!reduced) void paper.start({ x: [0, -6, 6, -4, 3, 0], y: [0, 3, -2, 1, 0], transition: { duration: 0.4 } });
        },
        reduced ? 0 : 380,
      );
    },
  });

  const revealSigning = () => {
    setLetterDone(true);
    window.setTimeout(() => signRef.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "nearest" }), 450);
  };

  const label = (t: string) => <p style={{ margin: 0, font: `700 10.5px ${FONTS.ui}`, letterSpacing: ".18em", textTransform: "uppercase", color: "#A2647C" }}>{t}</p>;

  return (
    <>
      <motion.article
        animate={paper}
        style={{
          position: "relative",
          width: "min(100%, 470px)",
          padding: "16px 16px 22px",
          background: `linear-gradient(180deg, #FFFDF6 0%, ${P.paper} 60%, #FFF6EA 100%)`,
          borderRadius: 4,
          color: P.berryDeep,
          textAlign: "left",
          boxShadow: "0 1px 0 #fff inset, 0 30px 60px -30px rgba(94,20,51,.55), 0 4px 14px -6px rgba(94,20,51,.25)",
          overflow: "clip",
        }}
      >
        {/* gold-leaf border */}
        <div aria-hidden style={{ position: "absolute", inset: 7, border: `2px solid ${P.gold}`, borderRadius: 2, pointerEvents: "none" }} />
        <div aria-hidden style={{ position: "absolute", inset: 12, border: `1px solid ${P.goldLight}`, borderRadius: 1, pointerEvents: "none" }} />
        {/* watermark of both names */}
        <div aria-hidden style={{ position: "absolute", inset: -40, display: "grid", alignContent: "space-around", transform: "rotate(-24deg)", pointerEvents: "none", opacity: 0.06 }}>
          {Array.from({ length: 10 }, (_, k) => (
            <p key={k} style={{ margin: 0, whiteSpace: "nowrap", font: `700 26px ${FONTS.script}`, color: P.berry, transform: `translateX(${k % 2 ? -30 : 10}px)` }}>
              {`${sender} ♥ ${recipient} ♥ ${sender} ♥ ${recipient} ♥ ${sender} ♥ ${recipient}`}
            </p>
          ))}
        </div>

        {/* stamp-paper header */}
        <header style={{ position: "relative", display: "grid", gridTemplateColumns: "auto 1fr", gap: 12, alignItems: "center", padding: "12px 10px 12px", margin: "4px 4px 0", background: "repeating-linear-gradient(135deg, rgba(232,106,146,.08) 0 6px, rgba(217,164,65,.07) 6px 12px)", borderBottom: `1.5px solid ${P.gold}` }}>
          <Rosette size={72} />
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, font: `800 17px/1.1 ${FONTS.serif}`, letterSpacing: ".08em", color: P.berry }}>PYAAR NON-JUDICIAL</p>
            <p style={{ margin: "4px 0 0", font: `700 10.5px ${FONTS.ui}`, letterSpacing: ".16em", color: "#A97A1C" }}>₹∞ STAMP PAPER · NON-BREAKABLE</p>
            <p style={{ margin: "4px 0 0", font: `500 10.5px ${FONTS.ui}`, letterSpacing: ".08em", color: "#A2647C" }}>
              No. {serial} · {date}
            </p>
          </div>
        </header>

        <div style={{ position: "relative", padding: "16px 12px 0" }}>
          <h2 style={{ margin: 0, textAlign: "center", font: `800 26px ${FONTS.serif}`, letterSpacing: ".14em", color: P.berry }}>VACHAN PATRA</h2>
          <p style={{ margin: "2px 0 12px", textAlign: "center", font: `italic 400 14px ${FONTS.serif}`, color: "#A2647C" }}>(an agreement of forever)</p>
          <p style={{ margin: "0 0 12px", font: `400 13.5px/1.55 ${FONTS.serif}`, color: "#7A3552" }}>
            This Vachan Patra is made on <b>{date}</b> between <b style={{ overflowWrap: "anywhere" }}>{sender}</b> (hereinafter “the Promiser”) and{" "}
            <b style={{ overflowWrap: "anywhere" }}>{recipient}</b>
            {petName ? <>, a.k.a. “{petName}”</> : null} (hereinafter “the Promisee”). WHEREAS the Promiser writes:
          </p>

          <div style={{ padding: "12px 0 6px", borderTop: "1px dashed rgba(142,31,74,.22)", font: `400 17px/1.7 ${FONTS.serif}`, color: P.berryDeep, overflowWrap: "anywhere" }}>
            <Typewriter text={letter} speed={26} onDone={revealSigning} caretColor={P.rose} />
          </div>

          <AnimatePresence>
            {letterDone && (
              <motion.div initial={reduced ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <p style={{ margin: "16px 0 8px", font: `800 12px ${FONTS.ui}`, letterSpacing: ".2em", color: P.berry, textAlign: "center" }}>— TERMS &amp; CLAUSES —</p>
                <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 8 }}>
                  {clauses.map((c, k) => (
                    <motion.li
                      key={k}
                      initial={reduced ? false : { opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: reduced ? 0 : 0.1 + k * 0.08 }}
                      style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 10, alignItems: "baseline" }}
                    >
                      <span style={{ font: `700 11px ${FONTS.ui}`, letterSpacing: ".1em", color: "#A97A1C", whiteSpace: "nowrap", fontVariant: "small-caps" }}>Clause {k + 1}.</span>
                      <span style={{ font: `400 15px/1.45 ${FONTS.serif}`, color: P.berryDeep, overflowWrap: "anywhere" }}>{c}</span>
                    </motion.li>
                  ))}
                </ol>
                {bigPromise && (
                  <div style={{ margin: "14px 0 0", padding: "12px 14px", borderRadius: 6, background: "linear-gradient(160deg, #FFF8E6, #FFEFCB)", boxShadow: `inset 0 0 0 1.5px ${P.gold}` }}>
                    <p style={{ margin: "0 0 4px", font: `800 10.5px ${FONTS.ui}`, letterSpacing: ".18em", color: "#A97A1C" }}>THE MAIN CLAUSE · NON-NEGOTIABLE</p>
                    <p style={{ margin: 0, font: `italic 500 16px/1.5 ${FONTS.serif}`, color: P.berryDeep, overflowWrap: "anywhere" }}>{bigPromise}</p>
                  </div>
                )}
                <p style={{ margin: "12px 0 0", font: `italic 400 12.5px/1.5 ${FONTS.serif}`, color: "#A2647C" }}>
                  Both parties agree that this contract has no expiry date, no exit clause, and no refunds on hugs.
                </p>

                {/* signatures */}
                <div ref={signRef} style={{ marginTop: 18, display: "grid", gap: 14, scrollMarginBottom: 140 }}>
                  <div>
                    {label("Promiser")}
                    <div style={{ position: "relative", height: 62, display: "flex", alignItems: "flex-end", padding: "0 6px 8px" }}>
                      <span style={{ font: `700 34px/1 ${FONTS.script}`, color: P.berry, transform: "rotate(-4deg)", transformOrigin: "left bottom", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>
                        {sender}
                      </span>
                      <div aria-hidden style={{ position: "absolute", left: 6, right: 6, bottom: 6, borderBottom: "1.5px solid rgba(142,31,74,.35)" }} />
                    </div>
                  </div>

                  <div>
                    {label(`Promisee · ${recipient}`)}
                    <div style={{ marginTop: 4, borderRadius: 10, background: "rgba(255,255,255,.65)", boxShadow: "inset 0 0 0 1.5px rgba(142,31,74,.16)" }}>
                      <SignaturePad ref={pad} onInk={setHasInk} label={`Signature pad for ${recipient}`} />
                    </div>
                    {!stamped && (
                      <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                        <button type="button" style={{ ...ghostBtn, minHeight: 40, padding: "8px 12px", fontSize: 13 }} onClick={() => pad.current?.clear()} disabled={!hasInk}>
                          Clear
                        </button>
                        <button type="button" style={{ ...ghostBtn, minHeight: 40, padding: "8px 12px", fontSize: 13 }} onClick={() => pad.current?.signName(recipient)}>
                          Sign with my name ✍️
                        </button>
                      </div>
                    )}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 14, alignItems: "center" }}>
                    <button
                      type="button"
                      {...thumb.bind}
                      disabled={!hasInk || stamped}
                      aria-label={hasInk ? "Press and hold your thumb here for a second to leave your thumbprint" : "Sign above first, then press your thumb here"}
                      style={{
                        ...thumb.bind.style,
                        position: "relative",
                        width: 104,
                        height: 124,
                        padding: 0,
                        borderRadius: 12,
                        border: `2px dashed ${hasInk ? P.sindoor : "rgba(142,31,74,.25)"}`,
                        background: thumb.progress > 0 || stamped ? "#FFF8F4" : "rgba(255,255,255,.5)",
                        display: "grid",
                        placeItems: "center",
                        cursor: hasInk && !stamped ? "pointer" : "default",
                        transform: thumb.holding ? "scale(.96)" : "scale(1)",
                        transition: "transform .15s, border-color .3s",
                        boxShadow: thumb.holding ? `0 0 0 ${4 + thumb.progress * 10}px rgba(200,50,47,${0.08 + thumb.progress * 0.12})` : "none",
                      }}
                    >
                      {thumb.progress > 0 || stamped ? (
                        <ThumbprintArt seed={seed} reveal={stamped ? 1 : thumb.progress} id="pd-thumb" size={82} />
                      ) : (
                        <span style={{ font: `600 12px/1.3 ${FONTS.ui}`, color: hasInk ? P.sindoor : "rgba(142,31,74,.4)", padding: 8 }}>
                          👍
                          <br />
                          angootha
                          <br />
                          yahan
                        </span>
                      )}
                    </button>
                    <div style={{ minWidth: 0 }}>
                      {label("Thumb impression")}
                      <p style={{ margin: "4px 0 0", font: `400 13.5px/1.45 ${FONTS.ui}`, color: "#8a4b66" }}>
                        {stamped ? "Angootha laga diya. Ab koi loophole nahi 😌" : hasInk ? "Press & hold your thumb on the box for a second (or tap it 3×)." : "Sign above first ✍️ — then your thumbprint makes it official."}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notarised by Cupid */}
        <AnimatePresence>
          {stamped && (
            <motion.div
              initial={reduced ? { opacity: 0 } : { scale: 2.4, opacity: 0, rotate: -40 }}
              animate={{ scale: 1, opacity: 1, rotate: -14 }}
              transition={reduced ? { duration: 0.2 } : { type: "spring", stiffness: 420, damping: 22 }}
              style={{ position: "absolute", right: 8, bottom: 24, pointerEvents: "none", mixBlendMode: "multiply" }}
            >
              <CupidSeal size={128} date={date} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.article>

      <div style={{ minHeight: 120, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        {!letterDone ? (
          <Hint>Read your contract… (tap the text to finish it)</Hint>
        ) : stamped ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduced ? 0 : 0.5 }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            {sticker}
            <p style={{ margin: 0, font: `700 20px ${FONTS.ui}`, color: VW.accentDeep }}>Notarised by Cupid. Vaada pakka ✓</p>
            <Btn onClick={onNext}>Promises we&apos;ve kept →</Btn>
          </motion.div>
        ) : (
          <Hint>{hasInk ? "Now your thumbprint 👍" : "Sign the Promisee line ✍️"}</Hint>
        )}
      </div>
    </>
  );
}
