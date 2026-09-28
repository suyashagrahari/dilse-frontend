"use client";

// ─── The Final Judgement ─────────────────────────────────────────────────────
//
// The main letter, and the emotional payoff of the whole trial. It arrives as a
// folded court document sealed with wax. The bench asks one last question (the
// sender's lock question, or the Court's default "do you accept the verdict?");
// the answer button breaks the seal, the "Objection!" button gets OVERRULED
// stamped across it. Then the document unfolds, the judgement is read line by
// line, the presiding judge signs it, and SO ORDERED slams down — with the
// sender's GIFs reacting at the seal and at the stamp.

import { useEffect, useRef, useState } from "react";

import { HeartBurst } from "../../_love/LoveKit";
import { V } from "../../_love/theme";
import { GavelButton, HAND, MONO, PAPER_RULE, Paper, PaperGhost, Polaroid, SANS, SERIF, STAMP_INK, Stamp, Typed, WaxSeal } from "./courtKit";
import { DEFAULT_LOCK_ANSWER, DEFAULT_LOCK_QUESTION } from "./types";

type Stage = "sealed" | "breaking" | "open";

/** Seconds between judgement paragraphs as they are read out. */
const LINE_GAP = 0.55;

export default function Judgement({
  letter,
  plaintiff,
  accused,
  signature,
  caseNo,
  question,
  answer,
  sealGif,
  stampGif,
  reduceMotion,
  onDone,
  doneLabel,
}: {
  letter: string;
  plaintiff: string;
  accused: string;
  signature: string;
  caseNo: string;
  question: string;
  answer: string;
  /** Pops up as the seal breaks. */
  sealGif?: string;
  /** Sits beside SO ORDERED once the judgement is read. */
  stampGif?: string;
  reduceMotion: boolean;
  onDone: () => void;
  doneLabel: React.ReactNode;
}) {
  const [stage, setStage] = useState<Stage>("sealed");
  const [objected, setObjected] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [read, setRead] = useState(false);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const paras = letter
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);
  const readMs = reduceMotion ? 0 : Math.round((0.9 + paras.length * LINE_GAP + 0.6) * 1000);

  const breakSeal = () => {
    if (stage !== "sealed") return;
    if (reduceMotion) {
      setStage("open");
      setRead(true);
      return;
    }
    setStage("breaking");
    timers.current.push(window.setTimeout(() => setStage("open"), sealGif ? 1900 : 1000));
  };

  // The CTA and the SO ORDERED stamp wait for the reading to finish.
  useEffect(() => {
    if (stage !== "open" || read) return;
    const t = window.setTimeout(() => setRead(true), readMs);
    return () => window.clearTimeout(t);
  }, [stage, read, readMs]);

  // Confetti as the stamp lands.
  useEffect(() => {
    if (!read || reduceMotion) return;
    let cancelled = false;
    (async () => {
      try {
        const confetti = (await import("canvas-confetti")).default;
        if (cancelled) return;
        confetti({ particleCount: 70, spread: 80, startVelocity: 38, origin: { x: 0.5, y: 0.7 }, colors: ["#e9b949", "#ff3d8b", "#ffffff", "#b3261e", "#8fb0ff"], disableForReducedMotion: true });
      } catch {
        /* decorative */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [read, reduceMotion]);

  const lockQ = question.trim() || DEFAULT_LOCK_QUESTION;
  const lockA = answer.trim() || DEFAULT_LOCK_ANSWER;
  const instant = skipped || reduceMotion;

  return (
    <div style={{ width: "100%", maxWidth: 520, margin: "0 auto" }}>
      <header style={{ textAlign: "center", marginBottom: 22 }}>
        <Typed color={V.a1}>Final judgement · Case No. {caseNo}</Typed>
        <h2 style={{ margin: "10px 0 0", fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: "clamp(32px, 8.4vw, 48px)", lineHeight: 1, letterSpacing: "-0.02em", color: V.ink }}>
          {stage === "open" ? "The Court has decided." : "The Court will now read its judgement."}
        </h2>
      </header>

      {stage !== "open" ? (
        <>
          {/* The folded, sealed document. */}
          <div style={{ position: "relative", paddingBottom: 40 }}>
            <Paper
              className={stage === "breaking" ? "col-thud" : undefined}
              style={{
                padding: "26px 22px 58px",
                textAlign: "center",
                overflow: "hidden",
              }}
            >
              <Typed size={10.5} color={V.paperSoft}>
                In the Court of Love
              </Typed>
              <p style={{ margin: "10px 0 4px", fontFamily: SERIF, fontSize: 34, lineHeight: 1, color: V.paperInk }}>Final Judgement</p>
              <p style={{ margin: 0, fontFamily: MONO, fontSize: 12.5, color: V.paperSoft }}>
                {plaintiff} v. {accused}
              </p>
              <div style={{ marginTop: 18 }}>
                <Stamp r={-4} size={13} animate={false}>
                  sealed · for the accused only
                </Stamp>
              </div>
            </Paper>
            <div style={{ position: "absolute", left: "50%", bottom: 0, transform: "translateX(-50%)" }}>
              <WaxSeal size={86} split={stage === "breaking"} />
            </div>
            {stage === "breaking" && <HeartBurst glyphs={["💘", "⚖️", "✨", "💖", "📜"]} />}
            {stage === "breaking" && sealGif && (
              <div className="lv-pop" style={{ position: "absolute", right: -4, top: -24, width: 118 }}>
                <Polaroid tilt={6} caption="knew it 🥹">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={sealGif} alt="" style={{ width: "100%", height: "auto", display: "block" }} />
                </Polaroid>
              </div>
            )}
          </div>

          {/* One last question from the bench. */}
          <div style={{ marginTop: 22, textAlign: "center", opacity: stage === "breaking" ? 0.4 : 1, transition: "opacity .3s" }}>
            <Typed size={10.5} color={V.soft}>
              One last question from the bench
            </Typed>
            <p dir="auto" style={{ margin: "8px auto 16px", maxWidth: 420, fontFamily: SANS, fontWeight: 700, fontSize: 19, lineHeight: 1.3, color: V.ink }}>
              {lockQ}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 400, margin: "0 auto" }}>
              <GavelButton onClick={breakSeal} disabled={stage !== "sealed"} glow>
                {lockA}
              </GavelButton>
              <div style={{ position: "relative" }}>
                <PaperGhost onClick={() => setObjected(true)} disabled={objected || stage !== "sealed"} ariaLabel={objected ? "Objection overruled" : "Objection!"}>
                  Objection! 🙋
                </PaperGhost>
                {objected && (
                  <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none" }}>
                    <Stamp r={-6} size={18} style={{ background: "color-mix(in srgb, var(--lv-paper) 85%, transparent)" }}>
                      overruled
                    </Stamp>
                  </span>
                )}
              </div>
              {objected && (
                <p className="col-rise" style={{ margin: "2px 0 0", fontFamily: HAND, fontSize: 22, color: V.ink }}>
                  objection overruled 😌 the Court is very biased
                </p>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* The judgement, unfolded and read aloud. Tap to skip ahead. */}
          <Paper
            lined
            className={instant ? undefined : "col-unfold"}
            onClick={() => {
              setSkipped(true);
              setRead(true);
            }}
            style={{ padding: "26px 22px 24px", cursor: read ? "default" : "pointer" }}
          >
            <div style={{ textAlign: "center", paddingBottom: 12, marginBottom: 14, borderBottom: `2px double ${PAPER_RULE}` }}>
              <Typed size={10.5} color={V.paperSoft}>
                In the Court of Love
              </Typed>
              <br />
              <Typed size={10} color={V.paperSoft} style={{ opacity: 0.8 }}>
                Case No. {caseNo}
              </Typed>
              <p style={{ margin: "8px 0 2px", fontFamily: SERIF, fontSize: 32, lineHeight: 1, color: V.paperInk }}>Final Judgement</p>
              <p style={{ margin: 0, fontFamily: MONO, fontSize: 12.5, color: V.paperSoft }}>
                In the matter of {plaintiff} v. {accused}
              </p>
            </div>

            {paras.map((line, i) => (
              <p
                key={i}
                dir="auto"
                className={instant ? undefined : "col-rise"}
                style={{
                  margin: "0 0 14px",
                  fontFamily: SANS,
                  fontSize: 16.5,
                  lineHeight: "30px",
                  color: V.paperInk,
                  whiteSpace: "pre-wrap",
                  overflowWrap: "anywhere",
                  animationDelay: instant ? undefined : `${0.9 + i * LINE_GAP}s`,
                }}
              >
                {line}
              </p>
            ))}

            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginTop: 18, minHeight: 86 }}>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontFamily: HAND, fontSize: 30, lineHeight: 1, color: STAMP_INK, overflowWrap: "anywhere" }}>{signature}</p>
                <div style={{ height: 1, background: PAPER_RULE, margin: "6px 0 5px", width: 170, maxWidth: "100%" }} />
                <Typed size={9.5} color={V.paperSoft}>
                  Presiding judge of your heart
                </Typed>
              </div>
              {read && (
                <Stamp r={-10} size={19} delay={instant ? 0 : 150}>
                  so ordered
                </Stamp>
              )}
            </div>
          </Paper>

          {read && stampGif && (
            <div className="lv-pop" style={{ display: "flex", justifyContent: "center", marginTop: 26 }}>
              <div style={{ width: 150 }}>
                <Polaroid tilt={-4} caption="no appeals 💅">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={stampGif} alt="" loading="lazy" style={{ width: "100%", height: "auto", display: "block" }} />
                </Polaroid>
              </div>
            </div>
          )}

          <div style={{ marginTop: 26, minHeight: 56 }}>
            {read ? (
              <div className="col-rise">
                <GavelButton onClick={onDone}>{doneLabel}</GavelButton>
              </div>
            ) : (
              <p style={{ margin: 0, textAlign: "center", fontFamily: MONO, fontSize: 12, letterSpacing: "0.08em", color: V.soft }}>the Court is reading… tap the page to skip</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
